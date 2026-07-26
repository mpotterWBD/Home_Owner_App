# Home Owner App — Planning

## Context
The user has been tracking home renovation/improvement projects (builder/contractor, cost, scope) in a spreadsheet. The goal is to replace this with a real, production-quality desktop application — starting simple (a spreadsheet-like grid) and growing into a fuller project tracker with photo galleries and attached quotes/documents. The app should be built with an eye toward eventual monetization (or at minimum a "support the developer" option), not just a personal script.

Neither Node.js nor Rust is currently installed on the dev machine, which was a deciding factor in the framework discussion below.

## Decision: Framework — Electron + React + TypeScript
Discussed alternatives: Electron, Tauri (Rust+React), .NET WPF/MAUI, Flutter desktop.

**Chosen: Electron + React + TypeScript**
- Single language (TS/JS) across the whole app — easiest to maintain/extend later.
- Only requires Node.js to start developing (already need to install this either way).
- Deepest ecosystem for exactly this app's needs: data grids (TanStack Table), file dialogs, PDF preview, packaging (`electron-builder`), auto-update (`electron-updater`).
- Proven track record for monetized production desktop software (VS Code, Slack, Discord, Notion).
- Tradeoff accepted: larger installer (~150MB+) and higher idle memory vs. Tauri — a non-issue for a project-tracker app with a handful of users.
- Tauri remains a viable future migration if install size/performance ever becomes a real complaint, but does not block getting started now.

## Data Model (v1)
- **Project**: id, name, builder_id (FK, nullable), cost (numeric), scope/description (text), category (text, e.g. Kitchen/Bath/Roof/Exterior), status (Planned/In Progress/Complete), start_date, end_date, notes, created_at, updated_at
- **Builder/Contractor**: id, name, contact info (phone/email), notes — kept as its own table so one builder can be linked across multiple projects and edited in one place
- **Attachment**: id, project_id (FK), kind (photo | quote | document), file_path, original_filename, uploaded_at

Storage: local SQLite file (via `better-sqlite3`) in the app's user-data directory. Attached files (photos, quote PDFs) are copied into an app-managed folder and referenced by path in the DB — no external server, everything stays on the user's machine for v1.

## Feature Phases

**Phase 1 — MVP (spreadsheet replacement)**
- Grid view of all projects: add/edit/delete rows inline; columns for name/builder/cost/scope/category/status/dates
- Local SQLite persistence; app reopens to last state
- Attach files (photos + quote docs) to a project; list/thumbnail per row, click to open in default OS viewer
- CSV import (to migrate the user's existing spreadsheet) and CSV export

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

## Next Steps
1. Confirm Node.js is installed (or install it) before scaffolding.
2. Scaffold the Electron + React + TypeScript project with:
   - `src/` — React UI (ProjectGrid, ProjectEditor/Row, AttachmentPicker components)
   - `electron/` — main process: SQLite setup, file-storage IPC handlers, CRUD IPC handlers
   - a schema-init script for the SQLite tables above
3. Build Phase 1 (MVP grid) end to end, verify with `npm run dev`.

## Verification
- `npm run dev` launches the Electron window; manually add a project row, attach a photo/quote, restart the app, and confirm data persists.
- `npm run build` produces a Windows installer that installs and runs standalone on a clean check.
