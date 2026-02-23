# Frontend — Process Mapper

React 19 + TypeScript + Vite frontend for the Process Mapper application.

> Full documentation and setup instructions are in the [root README](../README.md).
> For frontend internals, see [docs/FRONTEND.md](../docs/FRONTEND.md).

---

## Quick Start

```bash
npm install
npm run dev        # http://localhost:5173
```

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start Vite dev server with HMR |
| `npm run build` | Type-check + production bundle |
| `npm run lint` | Run ESLint |
| `npm run preview` | Preview the production build locally |

## Stack

- **React 19** — UI library
- **TypeScript** (`strict`, `exactOptionalPropertyTypes: true`)
- **Vite** — dev server and bundler
- **CSS Modules** — scoped component styles
- **Axios** — HTTP client

## Vite Proxy

During development, Vite proxies all `/api/v1` requests to `http://localhost:3000`. This removes the need for CORS configuration. Make sure the backend is running before using API features.
