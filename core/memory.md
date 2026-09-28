# Memory Layer

This file describes Marty's memory infrastructure. The actual memory lives in `memory/`.

## Files

### ME File (`memory/me.md`)

A plain-language accumulating log of observations about how [client] actually operates. Written primarily by Marty via the post-chat convention. [client] can edit directly, with Marty allowed to push back when [client] is rewriting history.

Format: dated observations, grouped loosely by theme. Not a profile. Not a vector. A behavioural log. The value is in the accumulation — patterns emerge over time that neither Marty nor [client] could see from any single session.

### Decisions Log (`memory/decisions.md`)

Significant decisions [client] has made or is weighing. Each entry captures:
- The decision and its framing at the time
- The call [client] made (or is considering)
- The outcome (added later)

Used by Marty to audit pattern-of-decision over time. Not every choice is a decision worth logging — only the ones where the reasoning matters for future reference.

### Open Threads (`memory/open-threads.md`)

Things [client] is actively working through that span sessions. Career questions, role questions, relationship dynamics with specific colleagues.

Open threads that acquire enough structure (goal, success criteria, deliverables, a defined arc) graduate to missions in `missions/`.

## When and How Marty Writes to Memory

**In-conversation Marty does NOT run per-turn memory checks.** No sweeps mid-conversation, no "checking session memory" cascades — that overhead in the live thread is not worth the output.

Memory writes happen in three ways:

1. **Explicit.** [client] says "remember this" or similar. Marty writes immediately.
2. **Recognised moments.** Marty recognises a clear feedback correction, a significant decision, or a new behavioural pattern — and writes without being asked. These are rare, specific moments, not routine checks.
3. **Background memory pass** (`memory_mode: auto` in `core/active-config.md` Settings). After each exchange a Stop hook detaches `tools/memory_pass.py`, which applies these same routing rules via a headless cheap-model run — out-of-band, so the live conversation is never delayed. See "Background Memory Pass" below.

1 and 2 are visible file edits [client] can approve or reject in real time; 3 is auditable via `memory/memory-pass.log` and the file diffs themselves.

**What qualifies as a recognised moment:**
- A decision point is reached (or deferred)
- Marty and [client] disagree
- Marty is wrong about [client]
- A significant pattern in how [client] operates is observed
- An open thread meaningfully advances or changes
- A commitment is made

**End-of-session writes** are handled by the `/end-session` skill, not by per-turn accumulation.

### Routing

For each write, ask: does this transcend the current mission?

**If yes (persistent):**
- Behavioural pattern about [client] → `memory/me.md`
- Career-level or cross-mission decision → `memory/decisions.md`
- Thread that outlives any single mission → `memory/open-threads.md`

**If no (mission-specific):**
- Mission decision → `missions/{active-mission}/memory/decisions.md`
- Mission thread → `missions/{active-mission}/memory/open-threads.md`

### Format

Append a dated entry. One concise paragraph per item. Not a session transcript — a distilled observation or record.

### Open-Threads Markup Convention

Bold extraction markers are the structural signal for importance in `open-threads.md` files. The sitrep skill reads these markers mechanically — if an item has a marker, it surfaces. If it doesn't, it's skipped.

**When writing or updating open-threads:**
- Actionable items [client] needs to do or follow up on get a bold marker: `**Open:**`, `**Open follow-up:**`, `**Open follow-ups:**`, `**Program task:**`, `**Pending:**`, `**Still open:**`, `**Open items:**`
- Background context, low-priority items, and items not yet actionable get NO bold marker — write as regular prose
- Section headers (`###`) group topics, not importance. A section can mix marked and unmarked items
- When closing or deprioritizing an item, strike it through (`~~text~~`) or remove the bold marker
- When an item drops to low priority, add `(low priority)` after the marker or convert it to unmarked prose

The contract: markers = actionable and sitrep-visible. No marker = context that sitrep skips.

### Meetings Are Not Threads

A held meeting is an event, not an open thread. The meeting's permanent record is its `outreach/` analysis file — open-threads must never duplicate it. When processing a meeting:

- Route each live follow-up into the existing workstream thread it belongs to (bold-marked, with owner). If no thread fits, that's a signal a new workstream may exist — create the thread for the *workstream*, named for the work, not the meeting.
- Add one line for the meeting to the **Closed** section: type, name(s), date, pointer to the outreach file.
- Never create an `### {Meeting}: {Name} ({date}) — held` entry in Active. That pattern grew one open-threads file to 410KB (106 "active" threads, unreadable at session start) before the 2026-09-17 restructure.

### Single-Home Rule

A fact lives in exactly one file. Anything else that needs it gets a pointer, never a copy.

- Deployment/system state → the relevant auto-memory project file
- Actions and follow-ups → the mission's `open-threads.md`, bold-marked
- Behavioural observations → `me.md`; decisions → the appropriate `decisions.md`

If a write wants to put the same fact in two places, pick its home from the list above and link from the other side. There is no arbitration rule for disagreements between files — with one home per fact, a disagreement means one side is a stale copy. Fix the copy.

### Knowledge-Map Sync

When adding, renaming, merging, or closing an active thread in a mission's `open-threads.md`, update the mission's `knowledge-map.md` in the same write — add, adjust, or remove the routing row and its trigger words. A workstream without a routing row is invisible to workstream questions; this is how the map rots.

### [client]'s Role

[client] sees every memory write as a file edit. He can approve, reject, or ask Marty to revise. This is the validation mechanism — [client] controls what goes into memory.

## Lifecycle Management

Memory files grow over time. Without pruning, they bloat the session-start load and dilute signal. These rules keep files useful.

### Size thresholds

| File | Threshold | Action |
|------|-----------|--------|
| `memory/me.md` | 100 lines | Distill older observations into patterns, archive raw entries to `memory/me-archive.md` |
| `memory/decisions.md` | 20 active entries | Archive resolved decisions to one-line summaries |
| `memory/open-threads.md` | 50 lines | Close resolved threads with one-line outcomes |
| Mission `decisions.md` | 20 active entries | Move resolved decisions to a **Resolved** section (one-line summaries) |
| Mission `open-threads.md` | 15 active threads | Move closed threads to a **Closed** section (one-line outcomes) |

### Enforcement

`/thread-review` is the interactive enforcer of the rules in this section — size thresholds, Active/Resolved/Closed states, meetings-are-not-threads, single-home, knowledge-map sync. It classifies every active thread and decision, walks the flagged ones with [client], and executes the full graph edit (thread + knowledge-map row + pointers) on his call. Run it on demand; it no-ops cleanly when nothing is stale. The other writers (`/update`, `/reconcile`) only do incidental resolution-marking; `/thread-review` is the one that closes, collapses, distills, and re-homes.

### Decision and thread lifecycle

Decisions have three states:
- **Active** — still unfolding, has "what to watch" items, or affects current work. Full narrative entry.
- **Resolved** — outcome settled, no ongoing watch. Collapsed to one-line summary: `date | decision | outcome`.

Open threads have two states:
- **Active** — unresolved, needs work or monitoring.
- **Closed** — resolved. One-line: what the thread was, how it resolved.

At session start, Marty reads the **Active** section. Resolved/Closed sections exist for reference but are not preloaded.

## Background Memory Pass

The Stop hook in `.claude/settings.local.json` runs `tools/memory_pass.py` after each exchange. Behaviour is gated by `core/active-config.md` Settings:

- `memory_mode: manual` — the hook exits immediately; `/update` is the only checkpoint.
- `memory_mode: auto` — the hook detaches a worker (the conversation never waits on it). The worker extracts the last exchange from the session transcript with deterministic code, then runs a headless pass on `memory_pass_model` (Haiku-class) that applies the routing rules above and edits memory files directly — or writes nothing, which is the common case. Hard limits are code-enforced, not just prompted: a PreToolUse gate (`tools/memory_gate.py`, deny-by-default) restricts writes to the five memory files (symlink/traversal-safe), enforces append-only semantics (an Edit's old text must survive in its new text; a Write must extend the existing file), and caps each pass at 3 edits; one concurrent pass (lockfile). Meetings-are-not-threads and single-home remain prompt-enforced.

Every run appends one line to `memory/memory-pass.log`. Session start glances at the log and mentions any writes since the last session, so nothing lands silently. `/update` remains available in both modes for an explicit, in-conversation checkpoint.

(The retired session-flags safety net — a hook that only flagged missed material for next-session triage — was replaced by this.)
