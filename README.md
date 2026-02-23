# Process Mapper

A full-stack web application for mapping and managing organizational processes in a hierarchical tree structure. Areas group processes, and processes can be nested infinitely — each with status, responsible person, tools used, and documentation links.

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [Deployment](#deployment)
- [Documentation](#documentation)

---

## Overview

Process Mapper allows teams to:

- **Create and organize areas** — logical groupings of processes (e.g., "Finance", "HR")
- **Map processes hierarchically** — processes can have sub-processes with unlimited depth
- **Classify processes** — status (`MANUAL` or `SYSTEMIC`), responsible person, tools, documentation URL
- **Reorder areas** — drag-free up/down reordering
- **Move processes** — reassign a process to a different parent or area
- **Search** — real-time search across areas and processes with accent-insensitive normalization

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, Vite, CSS Modules, Axios |
| Backend | Node.js, Express 5, TypeScript |
| Validation | Zod |
| ORM | Prisma |
| Database | PostgreSQL (Supabase) |
| Runtime tool | tsx (TypeScript execution without compile step) |

---

## Project Structure

```
process-mapper/
├── backend/              # Express API
│   ├── prisma/           # Schema, migrations, seed
│   └── src/
│       ├── lib/          # Prisma client singleton
│       ├── middlewares/  # asyncHandler, errorHandler
│       ├── routes/       # HTTP layer — request/response only
│       ├── schemas/      # Zod validation schemas + inferred types
│       └── services/     # Business logic layer
├── docs/                 # Internal technical documentation
│   ├── ARCHITECTURE.md   # System design and layered architecture
│   ├── BACKEND.md        # Backend reference
│   └── FRONTEND.md       # Frontend reference
└── frontend/             # React SPA
    └── src/
        ├── components/   # UI components + icon system
        ├── hooks/        # Data fetching hooks
        ├── pages/        # Page-level components + state
        ├── services/     # Axios API calls
        ├── types/        # TypeScript interfaces
        └── utils/        # Pure utility functions (search, filter)
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+
- A PostgreSQL database (Supabase free tier works)

### 1. Clone the repository

```bash
git clone https://github.com/your-org/process-mapper.git
cd process-mapper
```

### 2. Install dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 3. Configure environment variables

```bash
# In backend/
cp .env.example .env
# Fill in DATABASE_URL (see Environment Variables below)
```

### 4. Run database migrations

```bash
cd backend
npx prisma migrate deploy
npx prisma db seed   # optional — loads sample data
```

### 5. Start the servers

```bash
# Terminal 1 — Backend (port 3000)
cd backend
npm run dev

# Terminal 2 — Frontend (port 5173)
cd frontend
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

---

## Environment Variables

### `backend/.env`

| Variable | Description | Example |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `ALLOWED_ORIGIN` | Frontend URL allowed by CORS | `https://your-app.vercel.app` |

### `frontend/.env`

| Variable | Description | Example |
|---|---|---|
| `VITE_API_URL` | Deployed backend URL | `https://your-app.onrender.com` |

> Use the `.env.example` files in each package as templates. Never commit `.env`.
> In development, `VITE_API_URL` is not needed — the Vite proxy handles `/api/v1` → `localhost:3000`.

---

## Available Scripts

### Backend (`backend/`)

| Command | Description |
|---|---|
| `npm run dev` | Start server in watch mode with `tsx` (development) |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run compiled server from `dist/` (production) |
| `npx prisma migrate dev` | Create and apply a new migration |
| `npx prisma migrate deploy` | Apply pending migrations (production) |
| `npx prisma db seed` | Seed the database |
| `npx prisma studio` | Open Prisma Studio (database GUI) |
| `npx tsc --noEmit` | Type-check without emitting files |

### Frontend (`frontend/`)

| Command | Description |
|---|---|
| `npm run dev` | Start Vite dev server with HMR |
| `npm run build` | Type-check + bundle for production |
| `npm run lint` | Run ESLint |
| `npm run preview` | Preview the production build locally |

---

## Deployment

The application is deployed as two separate services:

| Service | Platform | URL |
|---|---|---|
| Backend API | [Render](https://render.com) | `https://your-app.onrender.com` |
| Frontend SPA | [Vercel](https://vercel.com) | `https://your-app.vercel.app` |

### Backend on Render

| Field | Value |
|---|---|
| Root Directory | `backend` |
| Build Command | `npm install && npx prisma generate && npm run build` |
| Start Command | `npm start` |

Environment variables to set in Render dashboard:
- `DATABASE_URL` — Supabase connection string
- `ALLOWED_ORIGIN` — Vercel frontend URL

### Frontend on Vercel

| Field | Value |
|---|---|
| Root Directory | `frontend` |
| Framework Preset | Vite (auto-detected) |
| Build Command | `npm run build` |
| Output Directory | `dist` |

Environment variable to set in Vercel dashboard:
- `VITE_API_URL` — Render backend URL

### Deploy order

```
1. Deploy backend on Render → copy the generated URL
2. Add VITE_API_URL on Vercel → deploy frontend → copy the URL
3. Update ALLOWED_ORIGIN on Render with the Vercel URL
```

> Render free tier hibernates after 15 min of inactivity. The first request after idle may take ~30s.

---

## Documentation

Detailed internal documentation lives in the [`docs/`](./docs) folder:

- [Architecture](./docs/ARCHITECTURE.md) — Layered architecture, data flow, design decisions
- [Backend](./docs/BACKEND.md) — Express, Prisma, Zod, middleware, TypeScript configuration
- [Frontend](./docs/FRONTEND.md) — React 19, hooks, component structure, CSS Modules, search

---

## API Reference

Base URL: `http://localhost:3000/api/v1`

### Areas

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/areas` | Get all areas |
| `POST` | `/areas` | Create an area |
| `PATCH` | `/areas/reorder` | Reorder areas by ID list |
| `PATCH` | `/areas/:id` | Update an area |
| `DELETE` | `/areas/:id` | Delete an area (cascades to processes) |

### Processes

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/processes/tree` | Get full process tree grouped by area |
| `POST` | `/processes` | Create a process |
| `PATCH` | `/processes/:id` | Update a process |
| `PATCH` | `/processes/:id/move` | Move a process to a new parent |
| `GET` | `/processes/:id/breadcrumb` | Get ancestor chain |
| `DELETE` | `/processes/:id` | Delete process and all descendants |
