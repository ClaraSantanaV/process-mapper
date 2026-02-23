# Backend — Process Mapper

Express 5 + Prisma + Zod API for the Process Mapper application.

> Full documentation and setup instructions are in the [root README](../README.md).
> For backend internals, see [docs/BACKEND.md](../docs/BACKEND.md).

---

## Quick Start

```bash
npm install

# Copy env template and fill in DATABASE_URL
cp .env.example .env

# Run migrations
npx prisma migrate deploy
npx prisma db seed   # optional

# Start dev server (port 3000, watch mode)
npm run dev
```

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start server with `tsx watch` (development only) |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run compiled server — used in production (Render) |
| `npm test` | Run tests once (Vitest) |
| `npm run test:watch` | Run tests in watch mode |
| `npx prisma migrate dev` | Create and apply a new migration |
| `npx prisma migrate deploy` | Apply migrations (production) |
| `npx prisma db seed` | Run the seed script |
| `npx prisma studio` | Open Prisma Studio GUI |
| `npx tsc --noEmit` | Type-check without emitting |

## Stack

- **Express 5** — HTTP framework
- **Prisma** — ORM + migration tool
- **PostgreSQL** — database (Supabase recommended)
- **Zod** — runtime input validation
- **TypeScript** (`strict: true`, `exactOptionalPropertyTypes: false`)
- **tsx** — TypeScript runtime (no compile step needed in dev)

## Environment Variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string (Supabase) |
| `ALLOWED_ORIGIN` | Frontend URL allowed by CORS (e.g. `https://your-app.vercel.app`) |
| `PORT` | HTTP port — **injected automatically by Render**, do not set manually |

Create a `.env` file copying from `.env.example`. Never commit `.env`.

## Deployment (Render)

| Field | Value |
|---|---|
| Build Command | `npm install && npx prisma generate && npm run build` |
| Start Command | `npm start` |

The build runs `prisma generate` to ensure the Prisma client is up-to-date with the schema before compiling.
