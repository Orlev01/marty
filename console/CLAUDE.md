# Console — how Claude reads and writes this directory

This is Marty's optional project console: a schema-driven, event-sourced tracker with a
generated web view. It is NOT a second coach — Marty (the repo root) stays in charge; this
directory is just structured project state and the machinery to render it.

**Computed state:** `cycle_state.json` — NEVER edit directly. It is rebuilt from events.
**Config:** `schemas.json` (record types + per-field AI instructions), `config.json`
(project, phases, overview layout), `team.json` (members for attribution), `metrics.json`.

## The contract

1. **Schemas define everything.** Before creating or updating a record, read its schema in
   `schemas.json` and follow each field's `aiInstruction`. New record types are added by
   editing `schemas.json` (or via the browser Schemas tab) — never by inventing ad-hoc data.
2. **State is event-sourced.** To record a change, append an event file to `events/`:
   - Filename: `events/YYYY-MM-DD_HHMMSS_<authorid>.json`
   - Content: `{"events": [{"schema": "...", "action": "create|update|delete", "author": "<member_id>", "timestamp": "<ISO>", "recordId": "<schema>_NNN_<author>", "data": {...}}]}`
   - Read `_maxSequence` in `cycle_state.json` for the next per-author NNN.
3. **Rebuild after writing:** `npm run rebuild && npm run dashboard` (from this directory).
4. **Sources are read-only here.** The Sources tab renders Marty's markdown registries
   (`../sources.md` and `../missions/<m>/sources/registry.md`). To change sources, edit
   those files — not anything in this directory.
5. **Attribute everything.** Every event has an `author` matching a `team.json` member id.

## Commands

| Command | What it does |
|---|---|
| `npm install` | One-time setup |
| `npm run serve` | Serve the console at http://localhost:8244 (browser edits save through the server) |
| `npm run rebuild` | Fold `events/` into `cycle_state.json` |
| `npm run dashboard` | Regenerate `dashboard.html` from state + config |
| `npm run validate` | Check state against schemas |
| `npm run docs` / `npm run guides` | Regenerate SCHEMAS.md and guides.json from schemas.json |

## Relationship to Marty

Marty may mirror mission facts here (tasks, decisions, risks) when [client] wants the visual
view, but Marty's markdown memory remains the single source of truth for coaching state.
Do not duplicate a fact's home: coaching memory lives in `../memory/` and missions; the
console holds project-tracking records.
