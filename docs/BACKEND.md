# Backend Reference

This document covers the internal structure, tools, and conventions of the Express + Prisma backend.

> See [ARCHITECTURE.md](./ARCHITECTURE.md) for the high-level system design and why decisions were made.

---

## Table of Contents

- [Folder Structure](#folder-structure)
- [Runtime: tsx](#runtime-tsx)
- [Express](#express)
- [Prisma ORM](#prisma-orm)
- [Zod — Input Validation](#zod--input-validation)
- [Middleware](#middleware)
- [Routes](#routes)
- [Services](#services)
- [TypeScript Configuration](#typescript-configuration)
- [Database Migrations](#database-migrations)
- [Testing](#testing)
- [Production and Deployment](#production-and-deployment)

---

## Folder Structure

```
backend/
├── prisma/
│   ├── schema.prisma       # Data model definition
│   ├── seed.ts             # Seed script (sample data)
│   └── migrations/         # Auto-generated SQL migration files
└── src/
    ├── server.ts           # App bootstrap — Express setup, middleware, routes
    ├── lib/
    │   └── prisma.ts       # PrismaClient singleton
    ├── middlewares/
    │   ├── async.middleware.ts   # asyncHandler wrapper
    │   └── error.middleware.ts  # Global error handler
    ├── routes/
    │   ├── area.routes.ts        # /api/v1/areas
    │   └── process.routes.ts    # /api/v1/processes
    ├── schemas/
    │   ├── area.schema.ts        # Zod schemas + exported types for Areas
    │   └── process.schema.ts    # Zod schemas + exported types for Processes
    └── services/
        ├── area.service.ts       # Business logic for Areas
        └── process.service.ts   # Business logic for Processes
```

---

## Runtime: tsx

`tsx` is used to run TypeScript files directly without a separate compilation step. It replaces the `ts-node` approach and is significantly faster.

```json
// package.json
"scripts": {
  "dev": "tsx watch src/server.ts"
}
```

`tsx watch` restarts the server on every file change, similar to `nodemon`, but with native TypeScript support.

---

## Express

The server is bootstrapped in `src/server.ts`:

```typescript
const app = express()

app.use(cors({ origin: process.env.ALLOWED_ORIGIN ?? "*" }))  // CORS for production
app.use(express.json())    // parse JSON request bodies
app.disable("etag")        // disable 304 Not Modified (see ARCHITECTURE.md)

app.use("/api/v1/areas", areaRoutes)
app.use("/api/v1/processes", processRoutes)

app.use(errorHandler)      // must be LAST — catches errors from all routes

const PORT = process.env.PORT ?? 3000
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
```

### Route Registration Order

Express resolves middleware and routes in registration order. The `errorHandler` must be registered **after** all routes so it can catch errors thrown inside them.

Within the process router, the static route `/reorder` must be registered **before** the dynamic route `/:id`:

```typescript
router.patch("/reorder", ...)   // ✅ matches first
router.patch("/:id", ...)       // would shadow /reorder if registered first
```

---

## Prisma ORM

Prisma is the ORM (Object-Relational Mapper) for this project. The workflow is:

```
1. Edit prisma/schema.prisma   (define models)
2. npx prisma migrate dev      (generate SQL + apply to DB)
3. npx prisma generate         (update PrismaClient types)
```

### Schema Overview

```prisma
model Area {
  id        String    @id @default(uuid())
  name      String
  order     Int       @default(0)
  processes Process[]
}

model Process {
  id            String         @id @default(uuid())
  name          String
  areaId        String
  area          Area           @relation(..., onDelete: Cascade)
  parentId      String?
  parent        Process?       @relation("Hierarchy", ...)
  children      Process[]      @relation("Hierarchy")
  level         Int            @default(0)
  order         Int            @default(0)
  tools         String?
  responsible   String?
  documentation String?
  status        ProcessStatus?
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt

  @@index([parentId])   // speeds up tree building
  @@index([areaId])     // speeds up area-scoped queries
}

enum ProcessStatus {
  MANUAL
  SYSTEMIC
}
```

### PrismaClient Singleton

`lib/prisma.ts` exports a single `PrismaClient` instance. Creating multiple instances would open multiple connection pools and exhaust database connections:

```typescript
import { PrismaClient } from "@prisma/client"
export const prisma = new PrismaClient()
```

### Raw Queries (Recursive CTEs)

Some operations require SQL features that Prisma's query builder does not expose. `prisma.$queryRaw` is used for these cases with tagged template literals (which automatically prevent SQL injection):

```typescript
// Collect all descendant IDs before deleting
const descendants = await prisma.$queryRaw<{ id: string }[]>`
  WITH RECURSIVE descendants AS (
    SELECT id FROM "Process" WHERE id = ${id}
    UNION ALL
    SELECT p.id FROM "Process" p
    INNER JOIN descendants d ON p."parentId" = d.id
  )
  SELECT id FROM descendants
`
```

### Transactions

When multiple database writes must succeed or fail together, use `prisma.$transaction`. The reorder operation updates every area's `order` field atomically:

```typescript
await prisma.$transaction(
  orderedIds.map((id, index) =>
    prisma.area.update({ where: { id }, data: { order: index } })
  )
)
```

If any update fails, the entire transaction is rolled back.

---

## Zod — Input Validation

Zod validates the shape and content of data coming from HTTP request bodies at **runtime**. TypeScript types are then **inferred** from schemas rather than defined separately:

```typescript
const areaBase = z.object({
  name: z.string().min(1, "Name is required"),
  order: z.number().int().min(0).default(0),
})

export const createAreaSchema = areaBase
export const updateAreaSchema = areaBase.extend({
  name: areaBase.shape.name.optional(),  // name is not required on update
})

// Types inferred from schema — no duplication
export type CreateAreaInput = z.infer<typeof createAreaSchema>
export type UpdateAreaInput = z.infer<typeof updateAreaSchema>
```

### Schema Composition

Schemas are built by composing a base object with Zod's built-in methods:

| Method | Purpose | Example |
|---|---|---|
| `.extend({ ... })` | Add or override fields | Add an optional field on update schema |
| `.omit({ field: true })` | Remove fields | Remove `areaId` from update (immutable) |
| `.partial()` | Make all fields optional | All fields optional for PATCH semantics |
| `.default(value)` | Field default if not provided | `order` defaults to `0` |

### Validation in Routes

```typescript
// Throws ZodError if req.body doesn't match the schema
const parsed = createAreaSchema.parse(req.body)
```

`ZodError` is caught by `errorHandler` and returned as HTTP 400 with a descriptive message.

---

## Middleware

### `asyncHandler` — Async Error Propagation

Express 4 does not automatically catch rejected Promises from `async` route handlers. Without a wrapper, an unhandled rejection would crash the server or hang the request.

`asyncHandler` wraps every route handler:

```typescript
type AsyncRequestHandler = (req: Request, res: Response, next: NextFunction) => Promise<void>

export function asyncHandler(fn: AsyncRequestHandler) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}
```

Calling `next(error)` forwards the error to the next error-handling middleware (the `errorHandler`).

### `errorHandler` — Global Error Handler

Registered last in `server.ts`, this middleware catches all errors forwarded via `next(error)`:

```typescript
app.use(errorHandler)
```

It differentiates `ZodError` (bad input → 400) from unexpected errors (→ 500), giving the client a structured error response.

---

## Routes

Routes are thin: they validate input, call a service, and return the response. They contain no business logic or database queries.

### area.routes.ts — `/api/v1/areas`

| Method | Path | Body Schema | Action |
|---|---|---|---|
| `GET` | `/` | — | Get all areas ordered by `order` |
| `POST` | `/` | `createAreaSchema` | Create an area |
| `PATCH` | `/reorder` | `reorderAreaSchema` | Reorder all areas |
| `PATCH` | `/:id` | `updateAreaSchema` | Update an area |
| `DELETE` | `/:id` | — | Delete area + cascade |

### process.routes.ts — `/api/v1/processes`

| Method | Path | Body Schema | Action |
|---|---|---|---|
| `GET` | `/tree` | — | Get full process tree |
| `POST` | `/` | `createProcessSchema` | Create a process |
| `PATCH` | `/:id` | `updateProcessSchema` | Update a process |
| `PATCH` | `/:id/move` | `moveProcessSchema` | Move to new parent |
| `GET` | `/:id/breadcrumb` | — | Get ancestor chain |
| `DELETE` | `/:id` | — | Delete + descendants |

---

## Services

Services contain all business logic. They receive typed inputs (from Zod) and return data.

### `areaService`

| Method | Description |
|---|---|
| `getAll()` | Returns all areas ordered by `order` |
| `create(data)` | Inserts a new area |
| `update(id, data)` | Updates name/order |
| `delete(id)` | Deletes area — Prisma cascade deletes all its processes |
| `reorder(orderedIds)` | Atomic `$transaction` updating `order` for each area |

### `processService`

| Method | Description |
|---|---|
| `getTree()` | Fetches all processes in one query, builds tree in-memory with a `Map` |
| `create(data)` | Inserts a process |
| `update(id, data)` | Updates process fields |
| `delete(id)` | Recursive CTE to gather all descendant IDs, then `deleteMany` |
| `getBreadcrumb(id)` | Recursive CTE walking up the ancestor chain |
| `move(id, parentId)` | Updates `parentId` — moves the process in the tree |

### Tree Building (`getTree`)

Rather than using recursive Prisma `include` (which triggers N+1 queries), `getTree` fetches all processes flat and assembles the tree in-memory:

```typescript
const processes = await prisma.process.findMany({ orderBy: { order: "asc" } })
const map = new Map<string, ProcessNode>()
const roots: ProcessNode[] = []

for (const p of processes) {
  map.set(p.id, { ...p, children: [] })
}

for (const p of processes) {
  const node = map.get(p.id)!
  if (p.parentId) {
    map.get(p.parentId)?.children.push(node)
  } else {
    roots.push(node)
  }
}
```

This is a single database round-trip and O(n) in-memory assembly — optimal regardless of tree depth.

---

## TypeScript Configuration

The backend uses `exactOptionalPropertyTypes: false` (intentionally relaxed):

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "exactOptionalPropertyTypes": false
  }
}
```

**Why not `true`?** Prisma's generated types and Zod's inferred types both use `T | undefined` for optional fields, while `exactOptionalPropertyTypes: true` requires `T | undefined` and `{ key?: T }` to be explicitly distinct. Enabling it would cause hundreds of type errors in Prisma update calls that are not under our control.

---

## Database Migrations

Migrations are managed by Prisma Migrate. The `migrations/` folder contains versioned SQL files that represent the history of schema changes.

### Development Workflow

```bash
# After editing schema.prisma, create and apply a new migration
npx prisma migrate dev --name describe-the-change
```

This command:
1. Generates the SQL diff
2. Applies it to the local database
3. Runs `prisma generate` to update the TypeScript client

### Production Workflow

```bash
# Apply pending migrations without generating new ones
npx prisma migrate deploy
```

Never run `migrate dev` in production — it can prompt for destructive changes interactively.

---

## Production and Deployment

The backend is deployed on [Render](https://render.com).

### Build vs Dev

| Mode | Command | How it runs |
|---|---|---|
| Development | `npm run dev` | `tsx watch` — executes TypeScript directly, no compile step, auto-restarts |
| Production | `npm run build` then `npm start` | Compiles to `dist/`, runs with `node` |

### Render Configuration

| Field | Value |
|---|---|
| Root Directory | `backend` |
| Build Command | `npm install && npx prisma generate && npm run build` |
| Start Command | `npm start` |

**Why `prisma generate` in the build command?**
Prisma generates the TypeScript client from `schema.prisma` into `node_modules/@prisma/client`. On Render, each deploy starts from a fresh install — without running `generate` before `tsc`, the build fails because the Prisma types are not present.

### Environment Variables

| Variable | Where to set | Description |
|---|---|---|
| `DATABASE_URL` | Render dashboard | Supabase connection string |
| `ALLOWED_ORIGIN` | Render dashboard | Vercel frontend URL (restricts CORS) |
| `PORT` | **Do not set** | Injected automatically by Render |

### CORS

The `cors` middleware is registered before all routes:

```typescript
app.use(cors({ origin: process.env.ALLOWED_ORIGIN ?? "*" }))
```

- **Development:** `ALLOWED_ORIGIN` is unset → falls back to `"*"` (all origins allowed, safe because the Vite proxy already handles routing)
- **Production:** set to `https://your-app.vercel.app` → only the frontend Vercel URL can make requests

---

## Testing

The backend uses **Vitest** as the test runner. Tests live in `src/__tests__/` and are split into two types:

```
backend/src/
└── __tests__/
    ├── process.service.test.ts   # unit  — mocks Prisma, tests business logic
    └── area.routes.test.ts       # integration — Supertest against real Express app
```

### Unit Tests — `process.service.test.ts`

Tests business logic in isolation by mocking the Prisma singleton. The real database is never touched — all `prisma.*` calls are intercepted by `vi.mock`.

A `makeProcess` factory builds valid records with sensible defaults, and a `mockProcesses` helper configures `findMany` for each test:

```typescript
/** Creates a valid Process record with sensible defaults. */
function makeProcess(overrides: Partial<Process> = {}): Process { ... }

/** Configures `findMany` to return the given flat list of processes. */
function mockProcesses(...processes: Partial<Process>[]) {
  vi.mocked(prisma.process.findMany).mockResolvedValue(
    processes.map(makeProcess),
  )
}
```

Each test then reads as a clear scenario:

```typescript
it("nests a child process under its parent", async () => {
  mockProcesses(
    { id: "1", name: "Parent", parentId: null },
    { id: "2", name: "Child", parentId: "1" },
  )

  const tree = await processService.getTree()

  expect(tree).toHaveLength(1)
  expect(tree[0]?.children[0]?.name).toBe("Child")
})
```

### Integration Tests — `area.routes.test.ts`

Tests the full HTTP layer using **Supertest** against the real Express app from `app.ts`. The service layer is mocked so no database is involved — the tests focus on HTTP concerns: status codes, JSON parsing, and Zod validation.

A `postArea` helper removes repetition across requests:

```typescript
/** Shorthand for a POST /api/v1/areas request. */
const postArea = (body: unknown) =>
  request(app).post("/api/v1/areas").send(body)
```

Invalid-input cases are grouped in their own `describe` to make the intent explicit:

```typescript
describe("invalid request — Zod validation rejects before reaching the service", () => {
  it("returns 400 when name is an empty string", async () => {
    const res = await postArea({ name: "" })
    expect(res.status).toBe(400)
    expect(areaService.create).not.toHaveBeenCalled()
  })
})
```

### Why `app.ts` is separate from `server.ts`

`app.ts` creates and exports the Express app. `server.ts` imports it and calls `app.listen()`. This separation is required for Supertest: importing `server.ts` would start the server on a real port, causing conflicts when multiple tests run. Importing `app.ts` gives Supertest the app without binding to any port.

```
app.ts    → creates Express app, registers middleware and routes  (used in tests)
server.ts → imports app, calls app.listen()                      (used in production)
```

### Running Tests

```bash
npm test           # run all tests once
npm run test:watch # run in watch mode (re-runs on file changes)
```
