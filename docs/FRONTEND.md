# Frontend Reference

This document covers the internal structure, conventions, and key patterns of the React frontend.

> See [ARCHITECTURE.md](./ARCHITECTURE.md) for the high-level system design and data flow.

---

## Table of Contents

- [Folder Structure](#folder-structure)
- [Tooling: Vite + React + TypeScript](#tooling-vite--react--typescript)
- [Component Structure](#component-structure)
- [Icon System](#icon-system)
- [State Management](#state-management)
- [Custom Hooks](#custom-hooks)
- [Services Layer](#services-layer)
- [CSS Modules](#css-modules)
- [Search and Filter Logic](#search-and-filter-logic)
- [TypeScript Configuration](#typescript-configuration)
- [Types and Interfaces](#types-and-interfaces)
- [Testing](#testing)
- [Types and Interfaces](#types-and-interfaces)

---

## Folder Structure

```
frontend/src/
├── components/
│   ├── icons/
│   │   └── index.tsx            # Centralized SVG icon components
│   ├── AreaFormModal.tsx         # Create/edit area modal
│   ├── AreaRow.tsx               # Single area row with collapse + reorder
│   ├── AreaTable.tsx             # Area list with search filtering
│   ├── ConfirmModal.tsx          # Generic delete confirmation modal
│   ├── Modal.tsx                 # Base modal wrapper (portal, backdrop, dismiss)
│   ├── MoveProcessModal.tsx      # Move process to new parent modal
│   ├── ProcessFormModal.tsx      # Create/edit process modal with breadcrumb
│   ├── ProcessRow.tsx            # Recursive process row renderer
│   └── SearchBar.tsx             # Debounced search input
├── hooks/
│   ├── useAreas.ts               # Fetch and cache the flat list of areas
│   └── useProcessTree.ts         # Fetch and cache the full process tree
├── pages/
│   ├── HomePage.tsx              # Single-page state hub
│   └── HomePage.module.css
├── services/
│   ├── api.ts                    # Axios instance (baseURL, headers)
│   ├── area.service.ts           # Area API calls
│   └── process.service.ts        # Process API calls
├── types/
│   ├── actions.ts                # TableActions interface
│   ├── area.ts                   # Area type
│   └── process.ts                # Process type + ProcessStatus enum
└── utils/
    └── searchTree.ts             # normalize(), filterProcessTree(), areaMatchesSearch()
```

---

## Tooling: Vite + React + TypeScript

### Vite

Vite is the development server and bundler. It provides:

- **Native ESM dev server** — no bundling during development, instant cold starts
- **HMR (Hot Module Replacement)** — components reload without losing state
- **Production build** — uses Rollup under the hood, outputs optimized static files

The Vite config (`vite.config.ts`) includes an API proxy so all `/api/v1` requests are forwarded to `localhost:3000` during development:

```typescript
server: {
  proxy: {
    "/api/v1": "http://localhost:3000",
  },
}
```

This avoids CORS issues in development without requiring the backend to set CORS headers.

### React 19

This project targets React 19. Notable implications:

- `FormEvent` is deprecated for `onSubmit` handlers — the idiomatic pattern is:
  ```tsx
  <form onSubmit={(e) => { e.preventDefault(); void handleSubmit() }}>
  ```

- No `useTransition` or `useDeferredValue` are used — the dataset is small enough that all updates are synchronous.

### TypeScript in strict mode

`tsconfig.app.json` enables `strict: true` which activates:
- `strictNullChecks` — `null` and `undefined` are distinct types
- `noImplicitAny` — every variable must be typed or inferable
- `exactOptionalPropertyTypes: true` — an optional property `{ key?: string }` is not the same as `{ key: string | undefined }`

---

## Component Structure

### Component Hierarchy

```
HomePage
├── SearchBar
├── AreaTable
│   └── AreaRow (one per area)
│       └── ProcessRow (recursive)
│           └── ProcessRow (recursive children)
├── AreaFormModal     (create or edit)
├── ProcessFormModal  (create or edit)
├── MoveProcessModal
└── ConfirmModal      (delete area or process)
```

### Recursive ProcessRow

`ProcessRow` renders itself recursively, passing `children` down:

```tsx
function ProcessRow({ node, depth, actions }) {
  return (
    <>
      <tr style={{ "--depth": depth } as ProcessRowStyle}>
        {/* row content */}
      </tr>
      {isOpen &&
        node.children.map((child) => (
          <ProcessRow key={child.id} node={child} depth={depth + 1} actions={actions} />
        ))}
    </>
  )
}
```

CSS receives `--depth` as a custom property and uses it to indent:

```css
td:first-child {
  padding-left: calc(var(--depth) * 1.5rem);
}
```

### Modal Pattern

All modals are rendered in `HomePage` and conditionally shown based on the `modal` discriminated union state. This means all modals are always in the component tree (for React's `key` diffing), but only the matching one receives `isOpen={true}`.

```tsx
<AreaFormModal
  isOpen={modal.type === "editArea" || modal.type === "createArea"}
  area={modal.type === "editArea" ? modal.area : undefined}
  onClose={closeModal}
  onSave={...}
/>
```

---

## Icon System

All SVG icons are centralized in `components/icons/index.tsx`. This avoids inline SVG scattered across components and makes it easy to change a single icon globally.

### IconProps Interface

```typescript
interface IconProps {
  size?: number      // defaults to 20
  className?: string // for CSS color/size overrides
}
```

### Usage

```tsx
import { EditIcon, TrashIcon, PlusIcon } from "../icons"

<EditIcon size={16} className={styles.icon} />
```

### Available Icons

| Export | Visual |
|---|---|
| `GridIcon` | 3×3 dot grid (app logo) |
| `PlusIcon` | Circle with + (add action) |
| `EditIcon` | Pencil (edit action) |
| `TrashIcon` | Bin (delete action) |
| `ChevronIcon` | Right-pointing chevron (expandable row) |
| `SearchIcon` | Magnifying glass |
| `XIcon` | × close button |
| `PersonIcon` | Silhouette (responsible field) |
| `ToolsIcon` | Wrench (tools field) |
| `ManualIcon` | Clock (MANUAL status) |
| `SystemIcon` | Computer monitor (SYSTEMIC status) |
| `ArrowUpIcon` | Up arrow (reorder) |
| `ArrowDownIcon` | Down arrow (reorder) |
| `MoveIcon` | Arrows (move process) |

---

## State Management

State is managed with React's built-in `useState`. There is no external state library.

### HomePage as State Hub

`HomePage` is the single-page state hub. It owns:

- `search` — current search string
- `modal` — which modal is open and with what context (discriminated union)
- `areas` and `tree` — via custom hooks

All callbacks (`onEditArea`, `onDeleteProcess`, etc.) are defined in `HomePage` as closures and passed down via the `TableActions` interface.

### Lazy State Initialization

Whenever initial state is computed from a prop, a **lazy initializer** function is used to avoid recomputing on every render:

```typescript
// ❌ Computed on every render (even when not used)
const [name, setName] = useState(area?.name ?? "")

// ✅ Computed once, when the component mounts
const [name, setName] = useState(() => area?.name ?? "")
```

---

## Custom Hooks

### `useAreas()`

```typescript
const { areas, loading, error, refetch } = useAreas()
```

Fetches the flat list of areas from `GET /api/v1/areas`. Exposes `refetch` so `HomePage` can invalidate after mutations.

### `useProcessTree()`

```typescript
const { tree, loading, error, refetch } = useProcessTree()
```

Fetches the nested process tree from `GET /api/v1/processes/tree`. The tree is an array of root `ProcessNode` objects, each with a `children` array built server-side.

### Why not SWR or React Query?

For the current scope, simple `useEffect`-based hooks are sufficient and introduce no dependencies. If the app grows (caching, background refetch, optimistic updates), migrating to React Query would be straightforward.

---

## Services Layer

`services/` contains all Axios calls. Components never use Axios directly.

### `api.ts` — Axios Instance

```typescript
const BASE_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api/v1`
  : "/api/v1"

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
})
```

`VITE_API_URL` is an environment variable set in the Vercel dashboard pointing to the Render backend URL. In development it is not set, so `BASE_URL` falls back to `"/api/v1"` and the Vite proxy handles routing to `localhost:3000`.

All services import `api` from here. This means changing the base URL or adding interceptors (e.g., for authentication tokens) is a single-file change.

### Service Pattern

```typescript
// area.service.ts
export const areaService = {
  getAll: () => api.get<Area[]>("/areas").then((r) => r.data),
  create: (data: CreateAreaPayload) => api.post<Area>("/areas", data).then((r) => r.data),
  reorder: (orderedIds: string[]) => api.patch("/areas/reorder", { orderedIds }),
  // ...
}
```

---

## CSS Modules

Every component that has styles has a `.module.css` file. CSS Modules scope class names to the component — there are no global class name conflicts.

```tsx
import styles from "./AreaRow.module.css"

<tr className={styles.row}>
```

In production, class names are hashed (e.g., `.row` → `._row_abc12`).

### CSS Custom Properties for Dynamic Styles

When a style value is computed at runtime (e.g., tree depth), TypeScript-typed CSS custom properties are used instead of inline `style={{ paddingLeft: … }}`:

```typescript
// ProcessRow.tsx
interface ProcessRowStyle extends CSSProperties {
  "--depth": number
}

<tr style={{ "--depth": depth } as ProcessRowStyle}>
```

This keeps all spacing logic in CSS while allowing dynamic input from JavaScript.

---

## Search and Filter Logic

Search is implemented in `utils/searchTree.ts`. The key insight is that searching a tree has two different "match" scenarios:

1. **Process matches** → show the process (and all its ancestors to maintain context)
2. **Area matches by name** → show the area with **all its processes** (not filtered)

### `normalize()`

Normalizes a string for accent-insensitive, case-insensitive comparison:

```typescript
export function normalize(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")                    // decompose "ã" → "a" + combining tilde
    .replace(/[\u0300-\u036f]/g, "")     // remove combining diacritics
    .trim()
}
```

Without this, `"Triagem".includes("tri")` would return `true`, but `normalize` is needed for accented characters like `"Triáge"`.

### `filterProcessTree()`

Recursive filter that returns only nodes matching the search (or ancestors of matching nodes):

```typescript
function filterProcessTree(nodes: ProcessNode[], search: string): ProcessNode[]
```

### `areaMatchesSearch()`

Returns `true` if the area's name contains the search term:

```typescript
function areaMatchesSearch(area: Area, search: string): boolean
```

### Usage in `AreaTable`

```tsx
const isSearching = search.trim().length > 0
const areaNameMatches = normalize(area.name).includes(normalize(search))

// If area name matches → show all processes unfiltered
// If not → filter processes recursively
const filteredNodes = isSearching && !areaNameMatches
  ? filterProcessTree(nodes, search)
  : nodes
```

This ensures that searching "Finance" shows the entire Finance area tree, not just processes named "Finance".

---

## TypeScript Configuration

`tsconfig.app.json` (the main config for application code):

```json
{
  "compilerOptions": {
    "strict": true,
    "exactOptionalPropertyTypes": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

`exactOptionalPropertyTypes: true` is enabled on the frontend because we have full control over our types and Prisma is not involved. This makes optional props stricter:

```typescript
// With exactOptionalPropertyTypes: true
interface Props {
  area?: Area   // means Area only, NOT Area | undefined
}

// You must use the | undefined union explicitly when needed:
interface Props {
  area?: Area | undefined
}
```

---

## Types and Interfaces

### `types/area.ts`

```typescript
export interface Area {
  id: string
  name: string
  order: number
}
```

### `types/process.ts`

```typescript
export type ProcessStatus = "MANUAL" | "SYSTEMIC"

export interface Process {
  id: string
  name: string
  areaId: string
  parentId: string | null
  level: number
  order: number
  status?: ProcessStatus
  responsible?: string
  tools?: string
  documentation?: string
}

export type ProcessNode = Process & { children: ProcessNode[] }
```

### `types/actions.ts`

The `TableActions` interface defines all event callbacks that flow from `HomePage` down through `AreaTable` and `AreaRow` into `ProcessRow`. Keeping them in one interface makes it easy to add new actions and find all their usages:

```typescript
export interface TableActions {
  onEditArea: (area: Area) => void
  onDeleteArea: (area: Area) => void
  onReorderArea: (orderedIds: string[]) => void
  onCreateProcess: (areaId: string, parentId: string | null, contextLabel: string) => void
  onEditProcess: (process: Process) => void
  onDeleteProcess: (process: Process) => void
  onMoveProcess: (process: Process) => void
}
```

---

## Testing

The frontend uses **Vitest** + **React Testing Library** + **jsdom** for component testing. Tests live in `src/__tests__/`:

```
frontend/src/
└── __tests__/
    └── AreaFormModal.test.tsx   # component tests for the create/edit area modal
```

### Setup

There is no global setup file. `@testing-library/jest-dom` is imported directly at the top of each test file, extending `expect()` with DOM matchers (`toBeInTheDocument`, `toBeDisabled`, `toHaveValue`, etc.):

```tsx
import "@testing-library/jest-dom"
```

### Component Tests — `AreaFormModal.test.tsx`

Component tests render components in a simulated browser (jsdom) and assert on visible behavior — not implementation details like internal state or CSS class names. The API service is mocked so no real HTTP calls are made.

Helper functions abstract away repetitive `render` calls, and small query helpers keep the assertions readable:

```tsx
const existingArea = { id: "area-1", name: "Finance", order: 0 }

/** Renders the modal in create mode (no area prop). */
function renderCreateModal(onSuccess = vi.fn()) {
  render(<AreaFormModal onClose={vi.fn()} onSuccess={onSuccess} />)
}

const nameInput = () => screen.getByPlaceholderText("ex: Recursos Humanos")
const submitButton = (label: RegExp) => screen.getByRole("button", { name: label })
```

Each test then focuses purely on behavior:

```tsx
it("calls areaService.create and onSuccess on valid submit", async () => {
  vi.mocked(areaService.create).mockResolvedValue(existingArea)
  const onSuccess = vi.fn()
  renderCreateModal(onSuccess)

  await userEvent.type(nameInput(), "Finance")
  await userEvent.click(submitButton(/criar área/i))

  await waitFor(() => {
    expect(areaService.create).toHaveBeenCalledWith({ name: "Finance" })
    expect(onSuccess).toHaveBeenCalledOnce()
  })
})
```

### What is tested

| Test | What it verifies |
|---|---|
| Renders 'Nova Área' title with empty input | Initial state in create mode |
| Submit button disabled while input is empty | Input validation before submit |
| Calls `create` + `onSuccess` on valid submit | Happy path for creation |
| Shows error message when service throws | Error handling feedback |
| Pre-fills input and title in edit mode | Correct initialization from `area` prop |
| Calls `update` with the new name on submit | Happy path for editing |

### CSS Modules in Tests

Vitest mocks CSS module imports automatically in the jsdom environment — class names resolve to empty strings. Tests remain style-agnostic and focused on behavior.

### Running Tests

```bash
npm test           # run all tests once
npm run test:watch # run in watch mode
```
```