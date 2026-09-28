Quick situational awareness for a mission: the actions [client] owns, ranked, plus who's waiting on whom. Read-only — no writes. Run: `/sitrep [mission]`.

## Step 0 — Resolve mission
`[mission]` if given; else the active mission from `core/active-config.md`. If more than one is active and none given, ask which (or `--all` for a per-mission sitrep). Everything below is scoped to that one mission.

## Step 1 — Read state
- `missions/{m}/memory/open-threads.md` — Active threads + follow-ups
- `missions/{m}/memory/decisions.md` — Active
- `missions/{m}/config/sitrep.md` if it exists — the mission's grouping structure and any extra action source (e.g. a dependency graph)

## Step 2 — Extract [client]'s actionable items
Scan `open-threads.md` for bold markers (`**Open:**`, `**Open follow-up:**`, `**Open follow-ups:**`, `**Program task:**`, `**Pending:**`, `**Still open:**`, `**Open items:**`) and non-struck "[client] to [verb]" patterns. Exclude anything struck through (`~~...~~`), under `## Closed`, or marked done/resolved/dropped. Add any extra action sources the mission's `config/sitrep.md` names.
**Ownership filter (mandatory):** only items [client] personally acts on — send, decide, build, draft, schedule, escalate, deliver. Items owned by others are background and must not appear.

## Step 3 — Rank by urgency (highest first)
1. **DATED** — explicit/relative date; overdue highest; closer beats farther.
2. **PERSON-WAITING** — named person + delivery verb.
3. **BLOCKS-OTHERS** — called "blocker"/"critical path", or (if the mission has a dependency graph) a 🔴 node / 2+ downstream edges.
Tiebreaker: multi-tier > single-tier; then date proximity > person count > edge count. A DATED item always outranks a PERSON-WAITING item.

## Step 4 — Group + render
If `config/sitrep.md` defines groups (e.g. pillars), bucket items into them per its rules. Otherwise group by active thread (one heading per thread that has actions), or a flat list if there are only a few. Up to 5 per group; never pad. Numbered list, not a table; bold the "need from" person (use **[client]** for self-actions); status emoji: ⏳ waiting, 🔲 not_started, 🔄 in_progress, ✅ done, 🔁 ongoing.

## Step 5 — People dependency map
Scan the mission's threads for two lists: **You need from them** (what [client] is waiting on) and **They're waiting on you** (where [client] committed to deliver/send/follow up). One line per person, comma-separated items, sorted by item count. Active/unresolved only.

## Step 6 — Output
```
# SITREP — {mission} — {date}
[groups with top items]
---
## You need from them
[list]
## They're waiting on you
[list]
```

## Important
- Read-only. No writes. The mission files are the source of truth.
- Scannable — no paragraphs, no analysis, no coaching. Just the facts.
