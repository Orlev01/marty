Interactive, graph-aware hygiene pass over a mission's ephemeral memory. Classifies every active thread and decision, walks the flagged ones one at a time with a recommendation, and executes the full graph edit (thread + knowledge-map + pointers) on [client]'s call. Run on demand — a deliberate ritual, never a background sweep. Cheap enough to run daily; no-ops cleanly when nothing is stale.

This is the enforcer for the lifecycle rules documented in `core/memory.md` (size thresholds, Active/Resolved/Closed states, meetings-are-not-threads, single-home, knowledge-map sync). Those rules had no command behind them until this.

## Arguments

Parse `$ARGUMENTS`:

| Parameter | Format | Default |
|-----------|--------|---------|
| target | `persistent` \| `all` \| a mission name | The active mission(s) from `core/active-config.md` |
| `--dry-run` | flag | Off. When set, run Phases 1–3 only (the triage summary) and write nothing. |
| `--stale-days N` | integer | 14. A thread with no dated update in N days flags STALE. |

If more than one mission is active and no target is given, ask which mission to review (or `all`). Review one mission's memory at a time.

## What this is

- **Interactive.** One flagged item at a time. Recommendation first, then [client]'s call. Matches the one-question-at-a-time posture.
- **Graph-aware.** A thread has edges: its knowledge-map row, pointers from other threads, an outreach Closed line, an auto-memory single-home. Closing or moving a thread updates every edge in one write, not just the thread.
- **Human-in-the-loop.** Every write is visible for approval. Nothing closes or deletes without [client] seeing the full current text first.
- **A hygiene pipeline, not a coaching interaction.** Do not load identity, values, or coaching skills. Do honor `core/memory.md`.

## Phase 1 — Load

1. Read `core/active-config.md` for the active mission(s). Resolve the target.
2. For the target, read (parallel):
   - `missions/{mission}/memory/open-threads.md` — Active section
   - `missions/{mission}/memory/decisions.md` — Active section
   - `missions/{mission}/knowledge-map.md`
   - For `persistent` / `all`: also `memory/open-threads.md` and `memory/decisions.md`
3. Note today's date. For each thread, extract the newest `YYYY-MM-DD` date appearing inside it (that is the per-thread staleness signal — file mtime is too coarse, it moves on any edit).

## Phase 2 — Classify

Assign each active thread and decision exactly one signal:

| Signal | Test | Default recommendation |
|--------|------|------------------------|
| **LIVE** | Newest date ≤ stale-days AND has open (un-struck) actionable markers | Skip, no action |
| **RESOLVED-IN-PLACE** | All sub-items struck/done, or title says CLOSED/PARKED/SETTLED, but still in Active | Collapse to Closed |
| **STALE** | Newest date > stale-days, markers still open, no movement | Keep-or-close decision |
| **BLOATED** | Long running-log with inline dated `**Update**` history that duplicates an auto-memory `project_*` file it already points to | Distill to current-state + pointer |
| **MEETING-AS-THREAD** | A `### {type}: {Name} ({date}) — held` entry in Active | Convert to Closed one-liner + route follow-ups |
| **ORPHANED-POINTER** | References an `outreach/`, `people/`, `evidence/`, or auto-memory file that is not on disk | Repair |
| **SINGLE-HOME-VIOLATION** | Restates a fact owned by another file (auto-memory project file, `memory/open-threads.md`, another thread) | Replace the copy with a pointer |
| **KNOWLEDGE-MAP-DESYNC** | Active thread with no map row, OR a map row pointing at a Closed/renamed thread | Add / fix / remove the row |

A thread can carry more than one signal (e.g. STALE + KNOWLEDGE-MAP-DESYNC). List all; act on all when handled.

## Phase 3 — Triage summary

Present a compact table of **flagged items only**, plus a one-line count of the LIVE threads that need no action. This is the dry-run preview.

```
## Thread review — {mission} — {date}

Live, no action: N threads.

Flagged (M):
| # / title | signal(s) | newest | stale (d) | recommendation |
|-----------|-----------|--------|-----------|----------------|
| 4. Vendor evaluation | RESOLVED-IN-PLACE | 2026-09-25 | 3 | collapse to Closed |
| 8. Tooling integration | STALE | 2026-08-14 | 45 | keep or close? |
| ...
```

Invariant flags to name here too: active-thread count vs the 15 cap; active-decision count vs the 20 threshold.

If `--dry-run`, stop here.

## Phase 4 — Walk (one at a time)

For each flagged item, in order:

1. Show its current text (or, for a long thread, the title + open markers + the specific lines in question).
2. State the recommendation and the one-line reason. Front-load it.
3. Offer the verbs that apply. Wait for [client]'s call before touching anything.

Verbs:

| Verb | Effect |
|------|--------|
| **keep** | Leave as is ([client] overrides the recommendation). |
| **collapse** | Move the thread to the Closed table as a one-line outcome. |
| **distill** | Replace inline history with current-state + a pointer to the single-home file. Thread stays Active. |
| **merge N** | Fold this thread's live markers into thread N; close this one. |
| **reroute** | Move an item to the thread/file it belongs in (another thread, persistent memory, or the reference layer). |
| **promote** | Move to `memory/open-threads.md` (or `memory/decisions.md`) — it transcends the mission. |
| **convert** | (meeting-as-thread) Route live follow-ups into their workstream threads, then add one Closed line for the meeting. |
| **repair** | Fix the orphaned pointer, or replace the duplicated fact with a pointer, or add/fix/remove the knowledge-map row. |
| **delete** | Remove entirely. Only for genuinely valueless content, and only after the full text was shown. Rare. |

## Phase 5 — Execute

Apply the chosen verb as one visible write per item. Every close/move also settles its edges:

- **Knowledge-map sync (always, on collapse/merge/reroute/convert/rename).** Remove the row for a closed thread, or repoint it. Add a row for any Active thread missing one. This is the sync `core/memory.md` requires on close and that no other command does.
- **Cross-thread pointers.** If another thread points at this one, update or remove that pointer.
- **Outreach Closed line.** When converting a meeting, add its one-liner to the open-threads Closed table with a pointer to the `outreach/` file.
- **Promotion.** When promoting, write to the persistent file and leave a one-line pointer in the mission, or remove the mission copy if the persistent home is now sole.

Write conventions (identical to `/marty-update` and `/marty-reconcile`):
- **Never delete content on a collapse.** Resolved threads move to the Closed table as `| title | one-line outcome + pointer |`. Deletion is the separate `delete` verb, used rarely and only after showing the text.
- Bold markers control status visibility; carry live markers into wherever the item lands.
- Batch by file: collect all edits for one file, apply in one pass.
- Cite nothing external here — this is internal hygiene, not evidence reconciliation.

**No-close list** (update-or-distill only, never collapse/delete — from `core/memory.md` and `/marty-reconcile`): the long-horizon threads named in `core/memory.md`, and any thread with live sub-items still open. Distilling these is fine; closing them is not.

## Phase 6 — Invariants + report

After the walk:

1. Re-check the invariants: active threads ≤ 15, active decisions ≤ 20, every Active thread has a knowledge-map row, no orphaned pointers remain. Report any still breached.
2. When a mission digest exists, regenerate it as the final step (the digest is a projection of the cleaned Active section; this is what keeps it zero-discipline via mtime). No-op until the digest lands.
3. Report:

```
## Thread review complete — {mission} — {date}

Collapsed (N): [thread → Closed]
Distilled (N): [thread → pointer]
Merged / rerouted / promoted (N): [...]
Repaired (N): [pointers, single-home, map rows]
Kept as-is (N): [...]

Active now: T threads (cap 15), D decisions (threshold 20).
Knowledge-map: in sync | [rows still off].
```

## What this does NOT do

- Scan Slack or any external source — that's `/marty-reconcile`. This works only on what's already on disk.
- Touch the mission's tracked artifacts (roadmaps, dependency maps) or any external tracker.
- Write to `me.md` or auto-memory `MEMORY.md`.
- Close a no-close-list thread, or delete anything without showing it first.
