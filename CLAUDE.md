# CLAUDE.md This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

A PWA for recording newborn feeding (breast/formula) and diaper events. All data is local only — IndexedDB, no backend, no auth. Mobile-first, built with a "Liquid Design" layout philosophy (clamp() fluid sizing + CSS Container Queries).

## Commands

```bash
npm run dev          # Start Vite dev server
npm run build        # TypeScript check + Vite build (outputs to dist/)
npm run preview      # Preview production build locally
npm test             # Run Vitest suite (headless)
npm run test:watch   # Run Vitest in watch mode
npm test -- path/to/test.ts  # Run a single test file
```

Vitest uses `jsdom` + `fake-indexeddb` for test environment. Db tests use `beforeEach`/`afterEach` calling `resetDB()` from `src/db/index.ts` to clear IndexedDB between tests.

## Architecture

### Data flow

Pages → Zustand store (`src/store/useRecords.ts`) → Native IndexedDB wrapper (`src/db/index.ts`)

The store is a thin pass-through: it forwards CRUD calls to the db module and exposes a `getDailyRecords(start, end)` method that returns feedings + diapers for a date range. There is no client-side state in the store beyond that.

### Database layer

`src/db/index.ts` uses **native IndexedDB** (IDBDatabase / IDBTransaction / IDBObjectStore), not Dexie — despite the design doc mentioning Dexie. Each function opens the DB, executes the operation, and closes it in a `try/finally`. Two object stores: `feeding` (indexed by `startedAt`) and `diaper` (indexed by `recordedAt`). IDs are `crypto.randomUUID()`. Dates are stored as numeric timestamps.

### State management

Zustand store (`src/store/useRecords.ts`) holds no derived UI state — just async action wrappers. Pages manage their own local state (selected date, form fields, etc.) and call store methods.

### Custom hooks

`src/hooks/useTimer.ts` — count-up timer using `setInterval` for the breastfeeding timer. Returns `{ elapsedSec, isRunning, start, stop, reset }`.

### Routing

`src/App.tsx` defines four routes: `/` (Home), `/add?type=feeding|diaper`, `/history`, `/stats`. The `AddRecord` page reads the `type` query param to decide which form to render.

### Liquid Design

Custom Tailwind font-size utilities (`text-fluid-xs` through `text-fluid-2xl`) use `clamp()`. Components use `container-type: inline-size` with Container Queries for responsive layout without media queries. CSS custom properties in `:root` define `--btn-min`, `--btn-h`, `--card-p` etc.

### Color palette (Tailwind config)

- `coral` (#FF8FA3) — primary, feeding actions
- `mint` (#7DD3C0) — secondary, diaper actions
- `warm-50/100/200` — backgrounds
- `ink-900` (#2D2D2D) / `ink-600` (#888) — text
- `warn` (#FFB74D) — warnings/delete

## Key Types (`src/types.ts`)

`FeedingType`: `'breast_left' | 'breast_right' | 'breast_both' | 'formula'`
`DiaperType`: `'pee' | 'poop' | 'both'`
`Feeding` has `amount` (null for breast) and `durationSec` (null for formula). `Diaper` has optional `color`, `consistency`, and `hadRash`.

## Current Implementation Status (Phase 1, in progress)

Completed: db layer, Zustand store, useTimer hook, AddRecord page, History page, shared components (DateSelector, QuickActions, RecordCard, StatCard), App routing.
Not yet implemented: Home page, Stats page, PWA icons, `public/manifest.json`.

## Important Notes

- The design doc (`docs/superpowers/specs/`) describes Dexie and a plan file describes TDD task-by-task implementation, but the **actual code uses native IndexedDB**, not Dexie. Follow the implementation, not the plan.
- Tests import `resetDB` from `../db` (barrel re-export), not `../db/index`.
- All date boundaries in queries use midnight-normalized dates; the History page computes `end` as `start + 86400000 - 1`.
- `fake-indexeddb` polyfill is loaded via vitest config (not shown in source), so tests don't need explicit setup.
