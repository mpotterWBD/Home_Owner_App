# Home Owner App — Planning

## Context
The user has been tracking home renovation/improvement projects (builder/contractor, cost, scope) in a spreadsheet. The goal is to replace this with a real, production-quality desktop application — starting simple (a spreadsheet-like grid) and growing into a fuller project tracker with photo galleries and attached quotes/documents. The app should be built with an eye toward eventual monetization (or at minimum a "support the developer" option), not just a personal script.

Neither Node.js nor Rust was installed on the dev machine at the time of this discussion, which was a deciding factor in the framework decision below. Node.js LTS has since been installed and the base Electron app scaffolded (see Status below).

## Decision: Framework — Electron + React + TypeScript
Discussed alternatives: Electron, Tauri (Rust+React), .NET WPF/MAUI, Flutter desktop.

**Chosen: Electron + React + TypeScript**
- Single language (TS/JS) across the whole app — easiest to maintain/extend later.
- Only requires Node.js to start developing (already need to install this either way).
- Deepest ecosystem for exactly this app's needs: data grids (TanStack Table), file dialogs, PDF preview, packaging (`electron-builder`), auto-update (`electron-updater`).
- Proven track record for monetized production desktop software (VS Code, Slack, Discord, Notion).
- Tradeoff accepted: larger installer (~150MB+) and higher idle memory vs. Tauri — a non-issue for a project-tracker app with a handful of users.
- Tauri remains a viable future migration if install size/performance ever becomes a real complaint, but does not block getting started now.

## Data Model (v1) — superseded draft
~~**Project**: id, name, builder_id (FK, nullable), cost (numeric), scope/description (text), category (text, e.g. Kitchen/Bath/Roof/Exterior), status (Planned/In Progress/Complete), start_date, end_date, notes, created_at, updated_at~~
~~**Builder/Contractor**: id, name, contact info (phone/email), notes — kept as its own table so one builder can be linked across multiple projects and edited in one place~~
~~**Attachment**: id, project_id (FK), kind (photo | quote | document), file_path, original_filename, uploaded_at~~
~~Storage: local SQLite file (via `better-sqlite3`) in the app's user-data directory.~~ **Superseded — see below.**

## Decision: Storage — document-based `.hom` JSON file
Rather than a single central SQLite database, the app is document-based like a normal desktop app (think Word/Excel): each house gets its own file the user creates and opens via **New** / **Open** in the toolbar.

- File format: plain JSON, custom extension **`.hom`**
- Structure: `{ version, house: { name, address, city, state, photoPath }, projects: [...] }`
- Types + the `.hom` extension constant live in `src/shared/houseFile.ts` (single source of truth, used by both main and renderer)
- Main process owns file I/O: `dialog.showSaveDialog` / `showOpenDialog` + `fs/promises` read/write, exposed to the renderer over IPC (`house-file:create`, `house-file:open`, `house-file:add-project`) via the preload bridge — the renderer never touches the filesystem directly
- Attachments (house photo, invoices) stay as regular files on disk in a `<name>.attachments` folder next to the `.hom` file; the JSON stores paths/references to them, not embedded binary data
- Tradeoff accepted: no multi-user concurrent access or partial-query performance benefits SQLite would give — a non-issue for a single-user local desktop app, and a plain JSON file is trivially readable/portable/backup-able by the user themselves

## Decision: Project schema (v1, implemented)
No separate Builder entity or generic Attachment table — kept as simple as what's actually used:
```ts
interface Project {
  id: string
  category: 'in_progress' | 'maintenance' | 'repair' | 'build'
  description: string
  date?: string
  company?: string       // free text, not a Builder FK — simpler until a builder-management screen is actually needed
  houseArea?: string     // e.g. "Kitchen", "Roof" — which part of the house this project touches
  cost?: number
  invoicePath?: string   // single attachment (image or PDF), copied into the house file's .attachments folder
  createdAt: string
  updatedAt: string
}
```
- The four `category` values double as the UI grouping (see Main Interface below) — each is a collapsible section in the content area, not a separate concept
- Each category section has its own "+" button that opens the same `NewProjectModal`, pre-scoped to that category (no category dropdown needed in the form)

## Main Interface
- Content area shows one collapsible row per category (In Progress / Maintenance / Repair / Build), each expandable to show its projects
- Row width and gap are CSS custom properties (`--category-width`, `--category-gap` on `.category-list` in `main.css`) so they're easy to retune
- Clicking a category's "+" opens `NewProjectModal` (Description, Date, Company, Part of the house, Invoice file picker, Cost); submitting calls `house-file:add-project` which appends to the currently open `.hom` file and copies the invoice into its attachments folder

## Feature Phases

**Phase 1 — MVP (spreadsheet replacement)**
- Category-grouped project list (see Main Interface above): add projects with description/cost/company/house area/invoice — done
- Local `.hom` file persistence — done
- Still open: editing/deleting existing projects, CSV import (to migrate the user's existing spreadsheet) and CSV export

**Phase 2 — Project tracking depth**
- Dedicated project detail view with photo gallery + inline PDF preview for attached documents
- Builder/contractor management screen (list, edit, see all projects per builder)
- Sorting/filtering/grouping in the grid (by category, builder, status, date range)
- Running cost totals (overall, by category, by year)

**Phase 3 — Production polish & distribution**
- App icon, installer branding, code signing (Windows Authenticode) so SmartScreen doesn't flag it
- Auto-update via `electron-updater`, pointed at GitHub Releases (free, simple)
- "Support the developer" panel linking out to a tip page (Buy Me a Coffee / Ko-fi / Stripe Payment Link) — no in-app payment handling needed to start. A full paid-license system would be a separate, later-scoped effort built on top of this.
- Backup/restore: export the whole SQLite DB + attachments folder to a zip

## Status
- [x] Node.js LTS installed
- [x] Base Electron + React + TypeScript app scaffolded (via electron-vite)
- [x] `.hom` file create/open (house address/city/state/photo)
- [x] Category sections with add-project flow (description/date/company/house area/cost/invoice)
- [x] Vitest + React Testing Library set up, tests passing
- [ ] Editing/deleting existing projects
- [ ] CSV import/export

## Next Steps
1. Add editing and deleting of existing projects within a category.
2. CSV import (migrate the user's existing spreadsheet) and export.
3. Phase 2 items (photo gallery, PDF preview, sorting/filtering, cost totals) once the above is solid.

## Verification
- `npm run dev` launches the Electron window; create a house file, add a project to a category with an invoice attached, restart the app (re-open the file), and confirm it persists.
- `npm test` runs the unit/component test suite.
- `npm run build` produces a Windows installer that installs and runs standalone on a clean check.
