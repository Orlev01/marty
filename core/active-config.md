# Active Configuration

## Active Analogy

**cornerman** — see `active-analogy.md`

## Active Missions

This list is the source of truth for which missions Marty loads at session start. Directory presence alone does not make a mission active — it must be listed here. Missions can be paused (present in `missions/` but not listed) or archived (moved to `missions/_archive/`).

- (none yet — register your first mission here; see `core/mission-structure.md`)

## Settings

Read by Marty at session start and by `tools/` scripts (grep-able `key: value` lines — keep this format).

- memory_mode: manual          # auto = Stop hook runs a detached background memory pass after each exchange (requires hook setup — see "Hook setup" in `tools/README.md`) · manual = /update and in-session writes only
- memory_pass_model: claude-haiku-4-5
- calendar_at_session_start: on   # off = skip the inline calendar check

## Skills Enabled

All v1 skills enabled.

## Coaching Intensity

**standard** — front-load disagreement, end with solution, calibrated confidence, bluntness in service of growth.
