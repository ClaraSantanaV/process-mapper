# Architecture

This document describes the overall system design of Process Mapper — the structural decisions, how the layers interact, and why each choice was made.

---

## Table of Contents

- [System Overview](#system-overview)
- [Layered Architecture](#layered-architecture)
- [Request Lifecycle](#request-lifecycle)
- [Data Model](#data-model)
- [Frontend Architecture](#frontend-architecture)
- [Key Design Decisions](#key-design-decisions)

---

## System Overview

Process Mapper is a monorepo composed of two independent applications that communicate over HTTP.

### Development

```
Browser (localhost:5173)
      │
      │  /api/v1  →  Vite proxy  →  localhost:3000
      ▼
Express API (Node.js)
      │
      │  Prisma ORM
      ▼
PostgreSQL (Supabase)
```

Vite proxies all `/api/v1` requests to `localhost:3000`, so both apps appear to the browser as the same origin — no CORS configuration needed in development.

### Production

```
Browser
      │
      │  HTTPS  (VITE_API_URL)
      ▼
Vercel (React SPA)          Render (Express API)
                                    │
                              ALLOWED_ORIGIN CORS
                                    │
                              Prisma ORM
                                    │
                            PostgreSQL (Supabase)
```

In production the frontend (Vercel) and backend (Render) are separate origins. CORS is configured on the Express server to allow requests only from the Vercel URL.

---

## Layered Architecture

The backend follows a **three-layer architecture**, sometimes called Layered or N-Tier Architecture. Each layer has a single responsibility and only talks to the layer directly below it.

```
┌─────────────────────────────────────────┐
│           Routes (HTTP Layer)           │  ← Receives requests, validates input, sends response
├─────────────────────────────────────────┤
│         Services (Business Layer)       │  ← Business logic, queries, transformations
├─────────────────────────────────────────┤
│         Prisma (Data Access Layer)      │  ← Database queries, ORM mapping
└─────────────────────────────────────────┘
```

### Routes — HTTP Layer

**Responsibility:** Parse and validate the HTTP request, delegate to a service, and return the HTTP response. Routes know nothing about the database.

```typescript
// area.routes.ts
router.post("/", asyncHandler(async (req, res) => {
  const parsed = createAreaSchema.parse(req.body)   // validate input
  const area = await areaService.create(parsed)      // delegate to service
  res.status(201).json(area)                         // return response
}))
```

### Services — Business Layer

**Responsibility:** Contain all business logic — calculations, transformations, multi-step operations, cross-entity logic. Services talk directly to Prisma.

```typescript
// area.service.ts
async reorder(orderedIds: string[]) {
  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.area.update({ where: { id }, data: { order: index } })
    )
  )
}
```

### Prisma — Data Access Layer

Prisma is the ORM (Object-Relational Mapper). It acts as the data access layer, translating TypeScript method calls into SQL queries.

```typescript
// lib/prisma.ts — singleton to avoid multiple connections
import { PrismaClient } from "@prisma/client"
export const prisma = new PrismaClient()
```

The `PrismaClient` is instantiated once and exported as a singleton. This is critical: each `new PrismaClient()` opens a new connection pool, so duplicating it would exhaust database connections.

---

## Request Lifecycle

Trace of a `POST /api/v1/areas` request end-to-end:

```
1. Express receives POST /api/v1/areas
2. express.json() middleware parses the request body
3. asyncHandler wraps the route handler to catch async rejections
4. createAreaSchema.parse(req.body) validates the payload with Zod
   └── throws ZodError if invalid → errorHandler middleware sends 400
5. areaService.create(parsed) executes business logic
6. prisma.area.create({ data }) runs INSERT INTO "Area" ...
7. Route sends res.status(201).json(area)
```

If any step throws, the error propagates to `errorHandler`:

```
                         ┌──────────────────────┐
route throws  ──catch──▶ │   errorHandler        │
                         │  (error.middleware.ts)│
                         │  ZodError → 400       │
                         │  Other    → 500       │
                         └──────────────────────┘
```

---

## Data Model

The database has two entities: **Area** and **Process**.

```
Area (1) ──────── (N) Process
                        │
                  Process (self-referential)
                        │
                  Process (children)
```

### Area

| Field | Type | Description |
|---|---|---|
| `id` | `String` (UUID) | Primary key |
| `name` | `String` | Display name |
| `order` | `Int` | Visual sort order |

### Process

| Field | Type | Description |
|---|---|---|
| `id` | `String` (UUID) | Primary key |
| `name` | `String` | Display name |
| `areaId` | `String` | Foreign key to Area (cascade delete) |
| `parentId` | `String?` | Self-referential FK — `null` = root process |
| `level` | `Int` | Depth level (0 = root) |
| `order` | `Int` | Sibling sort order |
| `status` | `ProcessStatus?` | `MANUAL` or `SYSTEMIC` |
| `responsible` | `String?` | Name or role |
| `tools` | `String?` | Free text tools description |
| `documentation` | `String?` | URL to external documentation |

### Self-Referential Tree

Processes form a tree using the `parentId` field — a process whose `parentId` is `null` is a root process, and all others are children. There is no depth limit.

```
Area: "Finance"
├── Process: "Accounts Payable"    (parentId: null)
│   ├── Process: "Invoice Review"  (parentId: "Accounts Payable".id)
│   └── Process: "Payment"        (parentId: "Accounts Payable".id)
└── Process: "Accounts Receivable" (parentId: null)
```

### Cascade Delete

When an Area is deleted, all its processes are deleted automatically via Prisma's `onDelete: Cascade`.

When a Process is deleted, its descendants must also be deleted. Because SQL `ON DELETE CASCADE` on self-referential tables is not reliable across all engines, we use a **recursive CTE** (Common Table Expression) to collect all descendant IDs first, then delete them in a single `deleteMany`:

```sql
WITH RECURSIVE descendants AS (
  SELECT id FROM "Process" WHERE id = $1
  UNION ALL
  SELECT p.id FROM "Process" p
  INNER JOIN descendants d ON p."parentId" = d.id
)
SELECT id FROM descendants
```

---

## Frontend Architecture

The frontend uses a **unidirectional data flow** pattern (classic React):

```
           ┌─────────────────┐
           │    HomePage      │  ← owns all state + API calls
           │  (state hub)     │
           └─────────┬───────┘
                     │  props (data + callbacks)
          ┌──────────┴──────────┐
          │                     │
     ┌────▼─────┐         ┌─────▼────┐
     │AreaTable │         │  Modals  │
     └────┬─────┘         └──────────┘
          │  actions (TableActions interface)
     ┌────▼──────┐
     │  AreaRow  │
     └────┬──────┘
          │
     ┌────▼────────┐
     │ ProcessRow  │  ← recursive, renders its own children
     └─────────────┘
```

### State Management

There is no external state library (no Redux, no Zustand). State is managed with React's built-in `useState` and `useReducer`, lifted to `HomePage` which acts as the single source of truth.

### Modal State Pattern

Instead of a boolean flag per modal, `HomePage` uses a **discriminated union** for modal state:

```typescript
type ModalState =
  | { type: "none" }
  | { type: "createArea" }
  | { type: "editArea"; area: Area }
  | { type: "deleteArea"; area: Area }
  | { type: "createProcess"; areaId: string; parentId: string | null; contextLabel: string }
  | { type: "editProcess"; process: Process }
  | { type: "deleteProcess"; process: Process }
  | { type: "moveProcess"; process: Process }
```

This ensures that when you open "editArea", TypeScript guarantees `area` is available — no optional properties, no null checks, no runtime surprises.

### Data Fetching

Custom hooks abstract data fetching:

- `useAreas()` — fetches and returns the flat list of areas
- `useProcessTree()` — fetches and returns the process tree (nested structure built server-side)

Both hooks expose `{ data, loading, error, refetch }`. `HomePage` calls `refetch` after any mutation to keep the UI in sync.

---

## Key Design Decisions

### Why no `getAll` / `getById` for processes?

The UI always renders the full tree. Fetching individual processes would produce N+1 queries (one per node). Instead, `getTree` fetches all processes in a single query and builds the tree in-memory using a `Map`, which is O(n).

### Why `asyncHandler` middleware?

Express 4 does not catch rejected Promises from async route handlers by default. Without a wrapper, an unhandled `async` rejection would crash the process. `asyncHandler` wraps every handler:

```typescript
export function asyncHandler(fn: AsyncRequestHandler) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}
```

Calling `next(error)` routes the error to the `errorHandler` middleware registered at the end of the middleware chain.

### Why `app.disable("etag")`?

Express sets an `ETag` header on GET responses by default. If the client sends the same ETag back on the next request, Express responds with `304 Not Modified` and an empty body — even when the data changed. Since this app does not implement cache invalidation, ETags were simply disabled.

### Why CORS middleware?

In production, the frontend (Vercel) and backend (Render) are on different domains. Browsers block cross-origin requests by default (CORS policy). The `cors` middleware adds the `Access-Control-Allow-Origin` header to every response, allowing the frontend domain:

```typescript
app.use(cors({
  origin: process.env.ALLOWED_ORIGIN ?? "*",
}))
```

`ALLOWED_ORIGIN` is set to the exact Vercel URL in production. The `*` fallback allows all origins in development, where the Vite proxy already handles cross-origin concerns.

### Why `process.env.PORT`?

Render (and most cloud platforms) inject the `PORT` environment variable into the container at runtime. Hardcoding port `3000` would conflict with the platform's internal routing:

```typescript
const PORT = process.env.PORT ?? 3000
app.listen(PORT, ...)
```

This keeps port `3000` for local development while respecting whatever the platform assigns in production.

### Why Zod for validation?

Zod provides **runtime validation** of external input (HTTP request bodies). TypeScript only enforces types at compile time — it cannot protect against malformed JSON at runtime. Zod schemas also serve as the **single source of truth** for input types, eliminating duplication between TypeScript interfaces and validation logic.

```typescript
export const createAreaSchema = z.object({ name: z.string().min(1), order: z.number().int().min(0) })
export type CreateAreaInput = z.infer<typeof createAreaSchema>  // type is derived, not duplicated
```
