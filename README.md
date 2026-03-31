# AISAP Echo Study Review Dashboard

Technical specification for the AISAP Frontend Challenge: a browser-based echocardiography (Echo) study review experience. Data is served from a static `data/studies.json` file; there are no external APIs.

---

## Quick start (Docker)

1. **Clone** this repository and `cd` into the project root.
2. **Run** `docker compose up --build`
3. **Open** [http://localhost:3000](http://localhost:3000)

The image bundles dependencies, the production Next.js build, and `data/studies.json`. No local Node.js install is required. To stop: `docker compose down`.

Canonical container definitions: `Dockerfile` and `docker-compose.yml` (multi-stage Alpine, Next.js `standalone`, non-root user, health checks).

---

## Table of contents

1. [Key features](#key-features)
2. [System design](#system-design)
3. [Types & validation](#types--validation)
4. [API contract](#api-contract)
5. [Project structure](#project-structure)
6. [Pages & UI](#pages--ui)
7. [Local development](#local-development)
8. [CI pipeline](#ci-pipeline-extra-credit)

---

## Key features

- **Study list** with patient search, LVEF category filter, and client-side pagination (URL-driven state).
- **Study detail** with patient and study metadata, LVEF value, category badge, and a progress indicator aligned with clinical color semantics.
- **Status toggle** — mark any study as Reviewed or Pending from the detail page; the change is reflected instantly on both the list and detail views via an in-memory override store and React Query cache update.
- **Single network fetch** for the full dataset: React Query caches `GET /api/studies` for the session; all filtering, paging, and detail lookups are derived in memory.
- **Internationalized UI** (English) with a single locale bundle.
- **Containerized delivery** with Docker Compose and a CI workflow: lint, type-check, production **build**, and **Docker image build** verification.

---

## System design

### Stack

| Layer            | Choice                  | Role                                                                                                        |
| ---------------- | ----------------------- | ----------------------------------------------------------------------------------------------------------- |
| **Framework**    | Next.js (App Router)    | Routing, layouts, and the API route handlers in one deployable unit.                                        |
| **Bundler**      | Turbopack (Next.js)     | Production build and dev tooling.                                                                           |
| **Styling**      | Tailwind CSS v4         | Utility-first styling; design tokens live in `app/globals.css` (`@theme`).                                  |
| **Server state** | TanStack React Query v5 | One query key for studies; `staleTime` / `gcTime` set so the static dataset is not refetched automatically. |
| **Validation**   | Zod                     | Runtime parsing at HTTP and client boundaries; TypeScript types are inferred from schemas.                  |
| **Language**     | TypeScript (strict)     | End-to-end typing without `any`.                                                                            |
| **Runtime**      | Docker                  | Multi-stage image with Next.js `standalone` output and bundled `data/`.                                     |

### Data flow (list view)

The list pipeline keeps **URL search params** as the source of truth for filters and page, then derives rows from the cached study array:

```text
  URL (?q=…&lvef=…&page=…)
           │
           ▼
   useStudyFilters  ──►  read / write searchParams via Next router
           │
           ▼
   useStudyListState ──►  useStudies()  →  filter  →  paginate
           │
           ▼
   StudyFilters + StudyList
```

`useStudies()` issues a single `fetch` to `/api/studies` and validates with `StudiesResponseSchema`. **Study detail** reuses the same query key and applies a **`select`** function to resolve one study by `id`, so no second HTTP request is required when navigating from the list.

### Status update flow

```text
  StudyInfoSection (button click)
           │
           ▼
   useUpdateStudyStatus (useMutation)
           │  mutationFn
           ▼
   PATCH /api/studies/[id]/status
           │  setStatusOverride (in-memory store)
           ▼
   onSuccess → queryClient.setQueryData
           │  rewrites cached study in place
           ▼
   List + Detail both re-render with new status
```

The in-memory override store (`src/lib/statusStore.ts`) persists changes for the server process lifetime and is applied by `GET /api/studies` on every subsequent fetch, so a page refresh reflects the updated status.

### High-level diagram

```text
┌────────────────────────── Browser ──────────────────────────┐
│  /studies          /studies/[id]                             │
│       │                    │                                 │
│       └──── React Query (one cache for studies) ────────────┘
└────────────────────────────┬────────────────────────────────┘
                             │ GET /api/studies (once)
                        PATCH /api/studies/[id]/status
                             ▼
              ┌──────────────────────────────────────┐
              │  app/api/studies/route.ts            │
              │  app/api/studies/[id]/status/route.ts│
              │  reads / overrides data/studies.json │
              └──────────────────────────────────────┘
```

---

## Types & validation

The codebase follows a **Zod-first** model: `src/lib/schemas/study.schema.ts` defines enums, `StudySchema`, `RawStudiesSchema` (array from disk), and `StudiesResponseSchema` (API shape). **TypeScript types** (`Study`, `StudiesResponse`, etc.) are **inferred** with `z.infer`—they are not duplicated by hand.

`src/types/index.ts` is the **import boundary** for components: it re-exports schema types and declares UI-only types (`StudyFilters`, `LVEFFilter`, `LVEFProgressBarProps`) so views do not import schema modules directly.

---

## API contract

### `GET /api/studies`

Returns the full dataset with any in-memory status overrides applied. Filtering and pagination are performed in the browser.

**200 OK** (illustrative):

```json
{
  "studies": [
    {
      "id": "1",
      "patientName": "Amelia Haddad",
      "patientId": "P-97922",
      "studyDate": "2025-12-22",
      "indication": "Syncope",
      "lvef": 67,
      "status": "pending",
      "thumbnailUrl": "https://picsum.photos/seed/study-001-97922/150/150"
    }
  ],
  "total": 100
}
```

**500** `{ "error": "Failed to load studies" }`

### `PATCH /api/studies/[id]/status`

Updates a study's status for the session lifetime via the in-memory override store.

**Request body:** `{ "status": "reviewed" | "pending" }`

**200 OK:** `{ "id": "1", "status": "reviewed" }`

**400** `{ "error": "Invalid request" }` — Zod validation failure.

### Client fetch functions

```ts
// src/api/studies.ts — GET: fetch + Zod parse
export const fetchStudies = async (): Promise<StudiesResponse> => { … };

// src/api/updateStudyStatus.ts — PATCH: status mutation
export const updateStudyStatus = async (
  id: string,
  status: StudyStatus,
): Promise<{ id: string; status: StudyStatus }> => { … };
```

### React Query hooks

```ts
// src/query/studiesQuery.ts
export const useStudies = () =>
  useQuery({ queryKey: STUDIES_QUERY_KEY, queryFn: fetchStudies, staleTime: Infinity, gcTime: Infinity });

// src/query/useUpdateStudyStatus.ts
export const useUpdateStudyStatus = () =>
  useMutation({ mutationFn: …, onSuccess: ({ id, status }) => queryClient.setQueryData(…) });
```

Detail views reuse the same cache and **select** a single row — zero extra HTTP requests:

```ts
useQuery({
  queryKey: STUDIES_QUERY_KEY,
  queryFn: fetchStudies,
  select: (res) => res.studies.find((s) => s.id === id),
  staleTime: Infinity,
  gcTime: Infinity,
});
```

---

## Project structure

```text
AISAP/
├── app/
│   ├── api/
│   │   ├── studies/route.ts              # GET /api/studies
│   │   └── studies/[id]/status/route.ts  # PATCH /api/studies/[id]/status
│   ├── studies/page.tsx                  # /studies
│   ├── studies/[id]/page.tsx             # /studies/[id]
│   └── globals.css                       # @theme design tokens (brand, surface, LVEF colors)
├── data/studies.json                     # Bundled static dataset (100 studies)
├── src/
│   ├── api/
│   │   ├── studies.ts                    # fetchStudies (GET)
│   │   └── updateStudyStatus.ts          # updateStudyStatus (PATCH)
│   ├── query/
│   │   ├── studiesQuery.ts               # STUDIES_QUERY_KEY + useStudies
│   │   └── useUpdateStudyStatus.ts       # cache-updating mutation hook
│   ├── lib/
│   │   ├── i18n/                         # i18next config + en.json
│   │   ├── schemas/study.schema.ts       # Zod schemas (single source of truth)
│   │   └── statusStore.ts               # In-memory PATCH override store
│   ├── types/index.ts                    # Re-exports + UI-only types
│   ├── utils/
│   │   ├── date.ts                       # formatStudyDate, formatStudyDateLong
│   │   ├── error.ts                      # toErrorMessage
│   │   ├── filters.ts                    # isStudyMatch predicate
│   │   ├── pagination.ts                 # computePagination, getPaginationItems
│   │   └── study.ts                      # getLVEFCategory, label maps
│   ├── hooks/useDebounce.ts
│   ├── shared/
│   │   ├── layout/                       # Header, Providers
│   │   ├── studies/LVEFBadge.tsx
│   │   └── ui/                           # Badge, Button, Field, Section, Skeleton, …
│   └── views/
│       ├── StudiesPage/
│       │   ├── StudiesPage.tsx           # Page shell (Header + main)
│       │   └── Components/
│       │       ├── StudyCard.tsx
│       │       ├── StudyList.tsx         # Data + states (loading/error/empty)
│       │       ├── StudyListSkeleton.tsx
│       │       ├── StudyListPagination.tsx
│       │       ├── useStudyListState.ts
│       │       └── StudyFilters/
│       │           ├── StudyFilters.tsx
│       │           └── useStudyFilters.ts  # URL state owner
│       └── StudyDetailPage/
│           ├── StudyDetailPage.tsx       # Page shell (Header + main + back link)
│           └── StudyDetails/
│               ├── StudyDetail.tsx       # Guards + section composition
│               ├── useStudyDetail.ts     # select from shared cache
│               └── Components/
│                   ├── PatientInfoSection.tsx
│                   ├── StudyInfoSection.tsx  # Status badge + toggle button
│                   ├── LVEFSection.tsx
│                   └── LVEFProgressBar.tsx
└── Dockerfile, docker-compose.yml, .github/workflows/ci.yml
```

---

## Pages & UI

### Study list (`/studies`)

Renders **StudyFilters** (debounced search + LVEF select) and **StudyList** (cards, truncated pagination). Filter and page state are reflected in the URL (`?q=&lvef=&page=`). While the initial query loads, skeleton placeholders match the list layout to limit layout shift.

### Study detail (`/studies/[id]`)

Shows three sections: **Patient Information** (name, patient ID), **Study Information** (date, indication, status badge with toggle button), and **LVEF** (value, category badge, accessible progress bar). Navigation back to the list is provided via the app router.

The **status toggle** sends `PATCH /api/studies/[id]/status` and updates the React Query cache in place — no refetch required. Both the list and the detail page reflect the change immediately.

### Shared building blocks

- **LVEFBadge** — color and label (normal / mildly reduced / severely reduced); color is not the only cue.
- **StudyCard** — each row is a Next.js **`<Link>`** to `/studies/[id]` (native navigation, open in new tab, correct semantics).

---

## Local development

Requires Node.js 20+.

```bash
npm install
npm run dev
```

**Production build:** `npm run build` then `npm start`

**Quality gates:** `npm run type-check` · `npm run lint`

Design tokens (brand, surface, LVEF clinical colors) live in **`app/globals.css`** (`@theme`) and are consumed as Tailwind utilities—inspect there rather than duplicating hex values in this document.

---

## CI pipeline (extra credit)

`.github/workflows/ci.yml` runs on pushes and pull requests to `main`:

1. **lint-and-typecheck** — `npm run lint` and `npm run type-check`
2. **build** — `npm run build` (runs after the first job succeeds)
3. **docker-check** — `docker build -t aisap-test .` (runs after **build**)

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  lint-and-typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: npm
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check

  build:
    needs: lint-and-typecheck
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: npm
      - run: npm ci
      - run: npm run build

  docker-check:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: docker build -t aisap-test .
```

---

_Submit to: <itay.tal@aisap.ai> · <hareld@aisap.ai> · <tal.kisra@aisap.ai>_
