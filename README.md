# AISAP Echo Study Review Dashboard

A lightweight echocardiography (Echo) study review dashboard built as part of the AISAP Frontend Challenge.

---

## Table of Contents

1. [Overview](#overview)
2. [Tech Stack & Design Decisions](#tech-stack--design-decisions)
3. [Architecture](#architecture)
4. [Type Definitions](#type-definitions)
5. [API Contract](#api-contract)
6. [Project Structure](#project-structure)
7. [Pages & Components](#pages--components)
8. [Implementation Phases](#implementation-phases)
9. [Definition of Done](#definition-of-done)
10. [Installation & Running](#installation--running)
11. [Docker Setup](#docker-setup)
12. [Color Palette](#color-palette)
13. [CI Pipeline](#ci-pipeline-extra-credit)

---

## Overview

The application allows clinical users to:

- Browse a list of cardiac echo studies
- View detailed information for any selected study
- Filter and search studies by patient name and LVEF category
- Paginate or infinitely scroll through a large dataset

Data source: a static `studies.json` file served by a minimal backend. No external APIs.

---

## Tech Stack & Design Decisions

| Layer | Choice | Why |
| --- | --- | --- |
| **Framework** | Next.js (App Router) | Company standard; gives us SSR/SSG flexibility, file-based routing, and API routes in one repo — no need for a separate Express server for the single `/api/studies` endpoint |
| **Bundler** | Vite-compatible (Next.js Turbopack) | Company standard; significantly faster HMR than Webpack, especially important for a component-heavy UI |
| **Styling** | Tailwind CSS | Utility-first keeps styles co-located with JSX, removes dead CSS automatically, and enforces a consistent design token system without a separate design-system package at this stage |
| **Data Fetching** | TanStack React Query v5 | Declarative server-state management: handles caching, background re-fetching, loading/error states, and pagination out of the box — avoids manual `useEffect` fetch boilerplate |
| **Schema Validation** | Zod | Runtime type safety at the API boundary (decoding the JSON response). Chosen over `io-ts`/codec because Zod's API is ergonomic, TypeScript-first, and integrates well with React Hook Form if forms are added later |
| **Language** | TypeScript (strict mode) | Full type coverage from schema → API → component props — zero `any` |
| **Backend** | Next.js Route Handler (`app/api/studies/route.ts`) | The requirement is a single GET endpoint; a dedicated Express/Fastify container adds infra complexity for no gain. Using Next.js API routes keeps everything in one container while still being a real HTTP endpoint |
| **Containerization** | Docker + docker-compose | Frontend (Next.js) in one container, data file bundled at build time. Single `docker-compose up` for the full stack |

> **Note on "Next.js + Vite":** Next.js ships its own bundler (Turbopack). The company likely uses Vite for non-Next projects. For this challenge we use Next.js but structure all component logic as framework-agnostic so it could be extracted to a pure Vite+React SPA if needed.

---

## Architecture

```text
┌─────────────────────────────────────────────────────┐
│                   Browser (Client)                  │
│                                                     │
│  ┌──────────────┐  ┌────────────────────────────┐  │
│  │  Study List  │  │     Study Detail Panel     │  │
│  │   /studies   │◄─►   /studies/[id]            │  │
│  └──────┬───────┘  └────────────────────────────┘  │
│         │ React Query (cache, client-side filter)   │
│         ▼                                           │
│  ┌──────────────┐                                   │
│  │  API Layer   │  src/lib/api.ts + Zod schemas     │
│  └──────┬───────┘                                   │
└─────────│───────────────────────────────────────────┘
          │ HTTP GET /api/studies  (fetched once)
          ▼
┌─────────────────────────┐
│  Next.js Route Handler  │  app/api/studies/route.ts
│  reads studies.json     │  (static file, no DB)
└─────────────────────────┘
```

**Key architectural choices:**

- All filtering and search happen **client-side** — the backend returns the full dataset once, React Query caches it, and the UI derives filtered views. This satisfies the requirement to "avoid unnecessary calls to backend."
- Pagination is also **client-side** over the cached data.
- The Zod schema is the **single source of truth** for the shape of a study — TypeScript types are inferred from it, not written by hand.

---

## Type Definitions

The project follows a strict **schema-first** approach: Zod schemas are the single source of truth, TypeScript types are always inferred — never written by hand. This eliminates drift between runtime validation and compile-time types.

> Schema confirmed against actual `studies.json` provided by AISAP.

### `src/lib/schemas/study.schema.ts`

```ts
import { z } from "zod";

// -------------------------------------------------------------------
// Enums
// -------------------------------------------------------------------

export const LVEFCategorySchema = z.enum([
  "normal",           // >= 55%
  "mildly_reduced",   // 40–54%
  "severely_reduced", // < 40%
]);

// Confirmed from studies.json — only two statuses present
export const StudyStatusSchema = z.enum(["pending", "reviewed"]);

// -------------------------------------------------------------------
// Core domain schema — confirmed against actual studies.json
// -------------------------------------------------------------------

export const StudySchema = z.object({
  id:           z.string(),
  patientName:  z.string(),
  patientId:    z.string(),                               // format: "P-XXXXX"
  studyDate:    z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // "YYYY-MM-DD" — not full ISO datetime
  indication:   z.string(),
  lvef:         z.number().int().min(0).max(100),         // integer %, e.g. 67 (not 0.67)
  status:       StudyStatusSchema,                        // "pending" | "reviewed"
  thumbnailUrl: z.string().url(),                         // picsum placeholder in dataset
});

// Raw studies.json is a flat array — route handler wraps it into { studies, total }
export const RawStudiesSchema    = z.array(StudySchema);

export const StudiesResponseSchema = z.object({
  studies: z.array(StudySchema),
  total:   z.number(),
});

// -------------------------------------------------------------------
// Inferred TypeScript types — never written manually
// -------------------------------------------------------------------

export type Study           = z.infer<typeof StudySchema>;
export type StudiesResponse = z.infer<typeof StudiesResponseSchema>;
export type LVEFCategory    = z.infer<typeof LVEFCategorySchema>;
export type StudyStatus     = z.infer<typeof StudyStatusSchema>;

// -------------------------------------------------------------------
// Pure domain helpers
// -------------------------------------------------------------------

export function getLVEFCategory(lvef: number): LVEFCategory {
  if (lvef >= 55) return "normal";
  if (lvef >= 40) return "mildly_reduced";
  return "severely_reduced";
}

export const LVEF_CATEGORY_LABELS: Record<LVEFCategory, string> = {
  normal:           "Normal (≥55%)",
  mildly_reduced:   "Mildly Reduced (40–54%)",
  severely_reduced: "Severely Reduced (<40%)",
};

export const STUDY_STATUS_LABELS: Record<StudyStatus, string> = {
  pending:  "Pending",
  reviewed: "Reviewed",
};
```

### `src/types/index.ts`

This file is the **single import target** for all types in component files. It re-exports from the schema so components never import directly from the schema module.

```ts
// src/types/index.ts
// One import path for all domain types — components never reach into lib/schemas directly

export type {
  Study,
  StudiesResponse,
  LVEFCategory,
  StudyStatus,
} from "@/lib/schemas/study.schema";

export {
  getLVEFCategory,
  LVEF_CATEGORY_LABELS,
  STUDY_STATUS_LABELS,
} from "@/lib/schemas/study.schema";

// -------------------------------------------------------------------
// UI-only types (not part of the API schema)
// -------------------------------------------------------------------

// The "All" option is added client-side for the filter dropdown
export type LVEFFilter = LVEFCategory | "all";

// Props shared across multiple study components
export interface StudyCardProps {
  study:    Study;
  onClick?: (id: string) => void;
}

// Pagination state passed between useFilteredStudies and usePagination
export interface PaginationState {
  page:       number;
  pageSize:   number;
  totalItems: number;
  totalPages: number;
}

// Filter state — mirrors URL search params shape
export interface StudyFilters {
  query:    string;       // free-text patient name search
  lvef:     LVEFFilter;   // "all" | "normal" | "mildly_reduced" | "severely_reduced"
}
```

---

## API Contract

### `GET /api/studies`

Returns the full studies dataset. All filtering and pagination are client-side — only one endpoint needed.

**Response `200 OK`:**

```json
{
  "studies": [
    {
      "id":           "1",
      "patientName":  "Amelia Haddad",
      "patientId":    "P-97922",
      "studyDate":    "2025-12-22",
      "indication":   "Syncope",
      "lvef":         67,
      "status":       "pending",
      "thumbnailUrl": "https://picsum.photos/seed/study-001-97922/150/150"
    }
  ],
  "total": 120
}
```

**Error `500`:**

```json
{ "error": "Failed to load studies" }
```

**Route Handler implementation sketch:**

```ts
// app/api/studies/route.ts
import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { StudiesResponseSchema } from "@/lib/schemas/study.schema";

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), "data", "studies.json");
    const raw      = await fs.readFile(filePath, "utf-8");
    const parsed   = StudiesResponseSchema.parse(JSON.parse(raw)); // Zod validates at runtime
    return NextResponse.json(parsed);
  } catch {
    return NextResponse.json({ error: "Failed to load studies" }, { status: 500 });
  }
}
```

**React Query hook sketch:**

```ts
// src/hooks/useStudies.ts
import { useQuery } from "@tanstack/react-query";
import { fetchStudies } from "@/lib/api";

export const STUDIES_QUERY_KEY = ["studies"] as const;

export function useStudies() {
  return useQuery({
    queryKey: STUDIES_QUERY_KEY,
    queryFn:  fetchStudies,
    staleTime: Infinity, // static dataset — never re-fetch automatically
  });
}
```

---

## Project Structure

```text
AISAP/
├── app/                            # Next.js App Router (routing + thin page shells)
│   ├── layout.tsx                  # Root layout (Providers, fonts, global styles)
│   ├── page.tsx                    # Root redirect → /studies
│   ├── globals.css                 # Tailwind v4 @theme tokens (brand, surface, LVEF)
│   ├── studies/
│   │   ├── page.tsx                # Page 1: Study List
│   │   └── [id]/
│   │       └── page.tsx            # Page 2: Study Detail
│   └── api/
│       └── studies/
│           └── route.ts            # GET /api/studies — reads studies.json via service
│
├── src/
│   ├── api/
│   │   └── studies.ts              # Axios call + Zod parse (client-side data fetching)
│   │
│   ├── query/
│   │   └── studiesQuery.ts         # React Query key + useStudies hook (staleTime: Infinity)
│   │
│   ├── lib/
│   │   ├── i18n/
│   │   │   ├── config.ts           # i18next init (called once inside Providers)
│   │   │   └── locales/
│   │   │       └── en.json         # All UI strings
│   │   ├── schemas/
│   │   │   └── study.schema.ts     # Zod schemas + inferred types + getLVEFCategory helper
│   │   └── server/
│   │       └── studies.service.ts  # Server-only: reads data/studies.json
│   │
│   ├── hooks/
│   │   └── useDebounce.ts          # Generic debounce hook (shared utility)
│   │
│   ├── utils/
│   │   ├── date.ts                 # formatStudyDate / formatStudyDateLong (date-fns)
│   │   ├── filters.ts              # Pure filter predicates: byName, byLVEF, filterStudies
│   │   ├── fp.ts                   # Domain FP combinators (allPass) — pipe from fp-ts
│   │   └── pagination.ts           # computePagination — pipe from fp-ts
│   │
│   ├── shared/
│   │   ├── ui/                     # Generic, reusable primitives (no domain logic)
│   │   │   ├── Badge.tsx
│   │   │   ├── Button.tsx
│   │   │   ├── EmptyState.tsx
│   │   │   ├── ErrorState.tsx
│   │   │   ├── Field.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Section.tsx
│   │   │   ├── Select.tsx
│   │   │   ├── Skeleton.tsx
│   │   │   └── Spinner.tsx
│   │   ├── studies/
│   │   │   └── LVEFBadge.tsx       # Color-coded LVEF percentage + category chip
│   │   └── layout/
│   │       ├── Header.tsx
│   │       └── Providers.tsx       # QueryClient + i18n init
│   │
│   ├── views/                      # Full-page view components (one per route)
│   │   ├── StudiesPage/
│   │   │   ├── StudiesPage.tsx
│   │   │   ├── StudyCard.tsx       # Single study card (flat — no sub-folder)
│   │   │   ├── StudyFilters/
│   │   │   │   ├── StudyFilters.tsx
│   │   │   │   └── useStudyFilters.ts  # URL ↔ filter state (co-located)
│   │   │   └── StudyList/
│   │   │       ├── StudyList.tsx
│   │   │       └── useStudyListState.ts # Filter + paginate + setPage (co-located)
│   │   └── StudyDetailPage/
│   │       ├── StudyDetailPage.tsx
│   │       ├── StudyDetail.tsx         # Detail panel (flat — no sub-folder)
│   │       └── useStudyDetail.ts       # Cache-first detail lookup (co-located)
│   │
│   └── types/
│       └── index.ts                # Readonly domain types + LVEFFilter + StudyFilters
│
├── data/
│   └── studies.json                # Static data source (provided by AISAP)
│
├── public/
├── tsconfig.json
└── package.json
```

---

## Pages & Components

### Page 1 — Study List (`/studies`)

**Purpose:** Browse all studies with search and filter controls.

**Layout:**

```text
┌─────────────────────────────────────────────┐
│  Header (logo + title)                      │
├─────────────────────────────────────────────┤
│  StudyFilters                               │
│  [ Search by patient name... ] [ LVEF ▼ ]   │
├─────────────────────────────────────────────┤
│  StudyList                                  │
│  ┌──────────────────────────────────────┐   │
│  │ StudyCard                            │   │
│  │  Name · ID · Date · Indication · LVEF│   │
│  └──────────────────────────────────────┘   │
│  ... (repeated, paginated)                  │
├─────────────────────────────────────────────┤
│  Pagination  ← Prev  1 2 3 ...  Next →      │
└─────────────────────────────────────────────┘
```

**Behavior:**

- On mount: React Query fetches `/api/studies` once, result cached for the session
- Search and LVEF filter operate entirely on cached data — zero re-fetches
- Filter state lives in URL search params (`?q=john&lvef=normal`) — shareable and bookmarkable
- Search input debounced 300ms to avoid re-rendering on every keystroke
- 10 studies per page (configurable via `PAGE_SIZE` constant)
- Skeleton loading cards shown while initial fetch is in flight
- `ErrorState` shown with retry button if fetch fails
- `EmptyState` shown when filters produce zero results

**Shared components:** `StudyCard`, `StudyFilters`, `LVEFBadge`, `Skeleton`, `ErrorState`, `EmptyState`, `Button`

---

### Page 2 — Study Detail (`/studies/[id]`)

**Purpose:** Full details for a selected study.

**Layout:**

```text
┌─────────────────────────────────────────────┐
│  ← Back to Studies                          │
├─────────────────────────────────────────────┤
│  Patient Information                        │
│  Name: John Doe          ID: PAT-1001       │
├─────────────────────────────────────────────┤
│  Study Information                          │
│  Date: Nov 15, 2024      Indication: SOB    │
├─────────────────────────────────────────────┤
│  LVEF                                       │
│  62%   ████████░░░   [ Normal ]             │
└─────────────────────────────────────────────┘
```

**Behavior:**

- `useStudyDetail(id)` reads from the existing React Query cache — **no additional HTTP call**
- If cache is cold (user navigates directly to the URL), fetches all studies and derives the record
- LVEF displayed as: numeric value + visual progress bar + color-coded `LVEFBadge`

---

### Shared Component Details

#### `LVEFBadge`

Color-coded pill for LVEF category:

- `normal` (≥55%) → green
- `mildly_reduced` (40–54%) → amber
- `severely_reduced` (<40%) → red

Color is **not** the only indicator — text label is always present (accessibility requirement).

#### `StudyFilters`

- Search: controlled text input, debounced, synced to URL param `?q=`
- LVEF dropdown: Select with options All / Normal / Mildly Reduced / Severely Reduced, synced to `?lvef=`
- Changing either filter updates URL and re-derives client-side filtered list — no fetch

#### `StudyCard`

- Clickable, navigates to `/studies/[id]`
- Keyboard-accessible (`role="button"` or `<a>` wrapping)
- Displays: patient name, patient ID, formatted study date, indication, `LVEFBadge`

---

## Implementation Phases

### Phase 0 — Project Bootstrap

- [ ] Init Next.js project with TypeScript strict mode + App Router (`npx create-next-app@latest`)
- [ ] Apply `tailwind.config.ts` with full brand token set (surface, brand, content, lvef, boxShadow)
- [ ] Set global dark background (`bg-surface` on `<body>`) and base text color (`text-content-primary`)
- [ ] Install dependencies: `zod`, `@tanstack/react-query`, `clsx`, `date-fns`
- [ ] Set up `src/components/layout/Providers.tsx` with `QueryClientProvider`
- [ ] Wire `Providers` into `app/layout.tsx`
- [ ] Place provided `studies.json` into `/data/studies.json`
- [ ] Scaffold `Dockerfile` + `docker-compose.yml`
- [ ] Configure ESLint (Next.js defaults) + Prettier

### Phase 1 — Data Layer

- [ ] Inspect actual `studies.json` — confirm field names, types, and any optional fields
- [ ] Align `StudySchema` in `study.schema.ts` to match real JSON shape exactly
- [ ] Implement `app/api/studies/route.ts` (reads `data/studies.json`, validates with Zod, returns JSON)
- [ ] Implement `src/lib/api.ts` — typed fetch wrapper, Zod parse at boundary, throws on validation error
- [ ] Implement `src/types/index.ts` — re-export all types + UI-only interfaces
- [ ] Implement `useStudies` React Query hook (`staleTime: Infinity`, error surfacing)
- [ ] Verify endpoint: `curl http://localhost:3000/api/studies | jq '.total'`

### Phase 2 — UI Primitives

- [ ] `Spinner`, `Skeleton`, `ErrorState`, `EmptyState`
- [ ] `Badge`, `Button`, `Input`, `Select`
- [ ] `LVEFBadge` with category color logic
- [ ] `Header` layout component
- [ ] `Providers` wrapper

### Phase 3 — Study List Page

- [ ] `StudyCard` component
- [ ] `StudyFilters` with debounced search + LVEF dropdown
- [ ] `useFilteredStudies` hook (client-side search + category filter)
- [ ] `usePagination` hook
- [ ] `StudyList` component wiring list + pagination
- [ ] `/studies` page assembled and responsive

### Phase 4 — Study Detail Page

- [ ] `useStudyDetail` hook (cache-first, falls back to full fetch)
- [ ] `StudyDetail` component (sections: patient info, study info, LVEF bar)
- [ ] `/studies/[id]` page assembled
- [ ] Back navigation

### Phase 5 — Polish & Responsiveness

- [ ] Mobile-responsive layout (single-column on small screens)
- [ ] URL-driven filter state (search params)
- [ ] Accessibility audit: keyboard nav, ARIA labels, focus management
- [ ] Error boundary at page level
- [ ] Confirm zero unnecessary re-fetches with React Query DevTools

### Phase 6 — Docker & Delivery

- [ ] Finalize multi-stage `Dockerfile`
- [ ] `docker-compose.yml` with health check
- [ ] Verify `docker-compose up --build` works from clean state
- [ ] Write final installation instructions
- [ ] CI pipeline (GitHub Actions: lint → type-check → build → docker build)

---

## Definition of Done

A feature is **done** when **all** of the following are true:

### Code Quality

- [ ] TypeScript strict mode — zero `any`, zero type errors (`tsc --noEmit` passes)
- [ ] All types inferred from Zod schemas — no manual type duplication
- [ ] No `console.log` in production code
- [ ] No commented-out code blocks

### Functionality

- [ ] Works in Chrome, Firefox, Safari (latest stable)
- [ ] Responsive at 375px (mobile), 768px (tablet), 1280px+ (desktop)
- [ ] Loading state visible during async operations
- [ ] Error state shown with actionable message on fetch failure
- [ ] Empty state shown when no studies match active filters
- [ ] Filtering never triggers a network request

### Accessibility

- [ ] Fully keyboard-navigable (Tab, Enter, Escape where applicable)
- [ ] Meaningful `aria-label` on all interactive elements
- [ ] Color never used as the sole indicator — text labels alongside colored badges

### Performance

- [ ] Studies fetched exactly once per session (React Query `staleTime: Infinity`)
- [ ] Search input debounced (no excessive re-renders on keystroke)
- [ ] Filter computation memoized (`useMemo`) to avoid re-running on unrelated renders

### Docker

- [ ] `docker-compose up --build` starts the app with zero additional steps
- [ ] App accessible at `http://localhost:3000`
- [ ] `GET http://localhost:3000/api/studies` returns valid JSON

---

## Installation & Running

### Prerequisites

- Node.js 20+
- npm 10+
- Docker + docker-compose (for containerized run)

### Local Development

```bash
# 1. Clone
git clone <repo-url>
cd AISAP

# 2. Install dependencies
npm install

# 3. Start dev server
npm run dev
# → http://localhost:3000
```

### Production Build (local)

```bash
npm run build
npm start
```

### Type Check & Lint

```bash
npm run type-check   # tsc --noEmit
npm run lint         # eslint
```

---

## Docker Setup

### Dockerfile (multi-stage)

```dockerfile
# Stage 1: install dependencies
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Stage 2: build
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Stage 3: minimal runtime image
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static     ./.next/static
COPY --from=builder /app/public           ./public
EXPOSE 3000
CMD ["node", "server.js"]
```

### docker-compose.yml

```yaml
version: "3.9"

services:
  web:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/studies"]
      interval: 30s
      timeout: 10s
      retries: 3
```

**Commands:**

```bash
# Build and start
docker-compose up --build

# Stop
docker-compose down
```

---

## Color Palette

Extracted from [aisap.ai](https://www.aisap.ai/). The site uses a **dark-first design** with a single bold lime-green accent. We adopt this exactly so the dashboard feels native to the AISAP brand.

### Visual Reference

| Role | Hex | Usage |
| --- | --- | --- |
| `surface-bg` | `#0A0A0F` | Page background (near-black) |
| `surface-card` | `#111118` | Card / panel backgrounds |
| `surface-border` | `#1E1E2A` | Subtle card borders, dividers |
| `brand-green` | `#7BF26C` | Primary accent — hero text, active states, focus rings |
| `brand-green-light` | `#C8F5D8` | Soft mint — button fills, highlight tints |
| `brand-green-dim` | `#3B7A34` | Darker green — hover states on buttons |
| `brand-glow` | `#7BF26C33` | Translucent lime — glow borders, shadows |
| `text-primary` | `#FFFFFF` | Headings, labels |
| `text-secondary` | `#A0A0B0` | Secondary labels, meta info |
| `text-muted` | `#60607A` | Placeholder text, disabled states |

### LVEF Clinical Colors

These are intentionally **distinct** from brand green to preserve clinical clarity. Users must read LVEF status at a glance — aesthetic alignment is secondary to legibility.

| Category | Hex | Tailwind baseline |
| --- | --- | --- |
| Normal (≥55%) | `#7BF26C` | Reuses brand green — aligns aesthetically |
| Mildly Reduced (40–54%) | `#F5A623` | Amber — universally understood as "caution" |
| Severely Reduced (<40%) | `#EF4444` | Red — universally understood as "critical" |

### `tailwind.config.ts`

```ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // --- Surface tokens (dark theme) ---
        surface: {
          DEFAULT: "#0A0A0F", // page background
          card:    "#111118", // card / panel
          border:  "#1E1E2A", // dividers, card edges
        },

        // --- Brand accent (AISAP lime green) ---
        brand: {
          DEFAULT: "#7BF26C", // primary actions, active indicators
          light:   "#C8F5D8", // button fills, soft highlights
          dim:     "#3B7A34", // hover / pressed state
          glow:    "#7BF26C33", // translucent glow for borders/shadows
        },

        // --- Text ---
        content: {
          primary:   "#FFFFFF",
          secondary: "#A0A0B0",
          muted:     "#60607A",
        },

        // --- LVEF clinical status (never rename — clinical semantics) ---
        lvef: {
          normal:   "#7BF26C", // brand green
          mild:     "#F5A623", // amber
          severe:   "#EF4444", // red
        },
      },

      // Glow effect used on StudyCard hover and focus rings
      boxShadow: {
        "brand-glow": "0 0 0 2px #7BF26C33, 0 0 12px #7BF26C22",
      },
    },
  },
  plugins: [],
};

export default config;
```

---

## CI Pipeline (Extra Credit)

GitHub Actions — `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check

  build:
    needs: quality
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run build

  docker:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: docker build -t aisap-echo .
```

---

*Submit to: <itay.tal@aisap.ai> · <hareld@aisap.ai> · <tal.kisra@aisap.ai>*
