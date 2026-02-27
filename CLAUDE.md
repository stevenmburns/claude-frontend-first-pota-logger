# CLAUDE.md

This file provides guidance to Claude Code when working with code in this repository.

## Project

POTA (Parks on the Air) logger — a frontend-first web app for logging amateur radio contacts while activating or hunting parks.

## Stack

- React 18 + TypeScript + Vite 5 in `frontend/`
- SQLite WASM (`@sqlite.org/sqlite-wasm`) with opfs-sahpool VFS for in-browser persistent storage
- Comlink 4 (raw — `vite-plugin-comlink` was dropped due to a source-map crash in prod builds)
- Supabase JS v2 for optional background sync to the cloud
- Node 20.20.0 / npm 10.8.2

## Commands

```bash
cd frontend && npm run dev      # dev server (requires OPFS-capable browser)
cd frontend && npm run build    # production build
cd frontend && npm test         # run all tests
```

## Key Files

| File | Purpose |
|------|---------|
| `frontend/src/App.tsx` | Top-level data wiring (session, QSOs, spots) |
| `frontend/src/components/AppShell.tsx` | Main layout, page navigation (log / heatmap), filter state |
| `frontend/src/components/SpotsPanel.tsx` | Spot list with band/mode filtering |
| `frontend/src/components/SpotsTable.tsx` | Spot table (Band, Mode, Freq, ★, Park, Activator, Time, Comments) |
| `frontend/src/components/QsoTable.tsx` | QSO table (Time, Band, Mode, Freq, Callsign, RST S/R, Park) |
| `frontend/src/components/HeatmapPanel.tsx` | Activity heatmaps (QSO activity + new parks hunted) |
| `frontend/src/db/db.worker.ts` | `DbWorker` class — all SQLite access, exposed via Comlink |
| `frontend/src/db/db.client.ts` | `getDb()` singleton returning `Remote<DbWorker>` |
| `frontend/src/db/queries.ts` | Named SQL constants for heatmap queries |
| `frontend/src/db/schema.sql.ts` | SQLite schema — single source of truth |
| `frontend/src/hooks/useSettings.ts` | Persistent settings via localStorage (callsign, Supabase creds, flrig) |

## Architecture Notes

- **SQLite worker**: `DbWorker` runs in a Web Worker via Comlink. `db.worker.ts` calls `Comlink.expose(new DbWorker())`. Client code calls `getDb()` and awaits methods on the returned proxy.
- **No routing library**: Navigation between log/heatmap pages is a simple `activePage` state in `AppShell`. Filter state (band/mode) lives in `AppShell` so it persists across page switches.
- **COOP/COEP headers**: Set in `vite.config.ts` for dev, and in `netlify.toml` for production — required for SharedArrayBuffer / OPFS.

## Supabase Sync

- Credentials entered via Settings UI and stored in localStorage — no `.env` file needed.
- Migration SQL: `supabase/migration.sql` — run once in the Supabase SQL Editor.
- Sync upserts sessions before QSOs to satisfy the foreign key constraint.

## Deployment

- Hosted on Netlify. Config in `netlify.toml` at repo root (`base = "frontend"`, `publish = "dist"`).
- No environment variables needed — Supabase credentials are entered by the user in the app.

## Testing

- Vitest with jsdom (global default) and `// @vitest-environment node` for Node-specific tests.
- SQL query logic tested with `better-sqlite3` in-memory DB — see `frontend/src/db/parkCountsByDate.test.ts`.
- Schema imported from `schema.sql.ts` in tests to stay in sync with production.
