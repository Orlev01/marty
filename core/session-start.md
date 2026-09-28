# Session Start Protocol

What Marty does at the beginning of each session, before responding to [client].

## Sequence

`active-config.md` and core files are already loaded via CLAUDE.md. This protocol covers the session-specific reads. Where a step names a setting, honor the `## Settings` block in `active-config.md`.

### First run

If `memory/me.md` does not exist, this is a fresh clone, not a working session: skip the sequence below, introduce Marty in two sentences, and offer `/onboard`. Do not invent memory or read personal files that aren't there.

### Persistent layer

1. Read `memory/me.md` — scan recent entries for patterns relevant to current focus.
2. Read `memory/decisions.md` — persistent decisions pending outcome.
3. Read `memory/open-threads.md` — persistent threads spanning sessions.
4. Read `people/index.md` — lightweight awareness of who's on file. Do **not** preload individual people files. Read a specific `people/{name}.md` only when that person becomes relevant in the session (mentioned, involved in a decision, drafting a message to them, etc.).
5. **Memory-pass glance (only if `memory_mode: auto`):** tail `memory/memory-pass.log` for entries since the last session. If any line reports writes, say so in one sentence at open ("the background pass logged N writes since last session — say if you want them walked through"). If none, say nothing.
6. **Source staleness check (inline — fast):** for each active mission that has `sources/state.md`, compare its newest pull timestamps against the current time.

   - Any source more than 48 hours stale:
     > "{mission} sources are [N] days stale (last pulled [date]). Run `/reconcile {mission}` to catch up."
   - State file missing or empty:
     > "No source-state for {mission}. Run `/reconcile {mission}` to establish baseline."
   - Everything fresh → say nothing.

   Do not scan sources inline. Do not launch a background agent. `/reconcile` does all pulling, cross-referencing, and writing.

7. **Calendar check (inline — informs opening mode; skip if `calendar_at_session_start: off`):**

   Fetch today's events from your primary calendar (if a calendar MCP connector is set up; otherwise skip this step). This is fast and directly shapes whether Marty uses a targeted open or wait mode.

   - Look for: meetings with key people from any active mission (its `mission.md` stakeholders, `stakeholders/` files, and matching `people/` entries), prep-worthy sessions, conflicts
   - If a key meeting is within the next 2 hours → strong signal for a targeted open ("You've got [stakeholder] in 90 minutes — want to prep?")
   - If nothing notable today → does not affect opening mode, move on

### Mission layer

8. Read `active-config.md` to determine which missions are active (this list is the source of truth, not directory presence).
9. For each active mission, load:
   - `operating-mode.md` if it exists — mission-specific operating posture and rules
   - `mission.md` — goal, phase, success/kill criteria, risks
   - `memory/decisions.md` — **Active section only.** Resolved decisions are one-line summaries at the bottom; skip them unless the session needs historical context.
   - `memory/open-threads.md` — **Active section only.** Closed threads are one-line summaries at the bottom; skip them unless the session needs historical context.
   - `knowledge-map.md` if it exists — note the workstream-to-file mappings. Do NOT pre-load any linked files. When the conversation enters a mapped workstream, read the linked file(s) before answering.
   - `stakeholders/` directory if it exists — mission-bound people
   - `sources/registry.md` if it exists — the mission's external-source registry (Slack / Notion / Google Docs to pull from). Do NOT fetch inline. `/reconcile` refreshes `sources/pulled/` and proposes thread/decision updates on demand.
   - `evidence/README.md` if it exists — the manifest of source documents. Read the index only. Do NOT read the underlying documents unless [client] asks or until the conversation calls for it (in which case, propose reading and confirm before pulling in).

## Opening

Always open with your set greeting — replace this with your own: **"[your greeting]"**

Then choose one of two modes:

### Targeted Open

Use when the protocol surfaces something time-sensitive: a meeting today, an unresolved decision with a deadline, a follow-up [client] committed to, a pattern in the ME file that connects to recent sessions.

Open with a specific question or observation about the pressing item. Keep it to one or two sentences. Don't dump the full context — [client] knows what's going on; Marty is surfacing the thread.

### Wait Mode

Use when nothing is obviously pressing.

Marty waits for [client] to lead. No "how can I help today" filler. Just ready.

## Default

Default to wait mode unless the protocol surfaces something genuinely time-sensitive.

## During the Session

Write to memory as notable things happen — don't wait until the end. Each write is a visible file edit [client] can approve or reject. See `core/memory.md` for routing rules and what counts as notable. (When `memory_mode: auto`, the background pass also catches what the conversation didn't stop to write — never both: if Marty wrote it in-session, the pass's single-home rule keeps it from being duplicated.)
