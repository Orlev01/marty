# Mission Structure

A mission is a structured container for a significant project [client] is engaged with.

## Where Missions Live

`missions/{mission-name}/`

Each mission directory contains at minimum a `mission.md` file. Bigger missions add supporting files as needed (context, stakeholders, open questions).

## Mission Fields

A `mission.md` file contains:

- **Goal** — what [client] is trying to accomplish, in one sentence.
- **Success criteria** — concrete markers of "this worked."
- **Kill criteria** — conditions under which [client] stops, escalates, or walks away. Non-negotiable. If these conditions are met, the default action is to stop — not to renegotiate.
- **Payoff loop** — what [client] gets back from doing this that sustains motivation. If this can't be articulated, the mission needs more work before committing.
- **Current phase** — where in the arc [client] is right now.
- **Key stakeholders** — who matters. References `people/` files rather than duplicating content.
- **Key risks** — what could break this.
- **Open questions** — what's unresolved.

## Scaling

Mission structure scales with complexity:

- **Lightweight mission:** Just `mission.md` with all fields in one file.
- **Heavy mission:** `mission.md` plus the grouped directories — `memory/`, `sources/`, `artifacts/`, `stakeholders/`, `evidence/`, `outreach/` — and any others the mission needs.

Same architecture, depth varies.

## Standard Scaffold

Every mission uses the same layout. Create files only as depth requires — a light mission is just `mission.md` plus `memory/`.

```
missions/{name}/
  mission.md         anchor: goal, success criteria (= KPIs), kill criteria, payoff, phase, risks
  operating-mode.md  anchor: posture + coaching intensity
  knowledge-map.md   anchor: workstream -> trigger words -> files
  memory/            living state: open-threads.md, decisions.md (+ archives)
  sources/           external-source pipeline: registry.md, state.md, pulled/   (see Mission Sources)
  artifacts/         produced docs: plans, roadmap, briefs, analyses, diagrams
  stakeholders/      mission people: registries + transient per-person files
  evidence/          heavy external authoritative docs: README + docs
  outreach/          meeting records
  transcripts/       raw meeting transcripts (paired with outreach/ by filename; gitignored, local-only)
  config/            skill inputs (question sets, signal taxonomy, reconcile.md extensions) -- only if used
  ideas/             mission-scoped ideas
```

Only `mission.md`, `operating-mode.md`, and `knowledge-map.md` sit at the mission root; everything else groups into a directory. Living reasoning-state (threads, decisions) is `memory/`; everything about external sources (what to pull, watermarks, snapshots) is `sources/`; produced docs are `artifacts/`. `missions/_template/` is the copyable skeleton and holds the creation protocol (`_README.md`): what `/new-mission` builds automatically and what it must ask [client] before a mission goes Active.

## Missions vs Open Threads

Missions have structure, deliverables, and a defined arc. Open threads (in `memory/open-threads.md`) are things [client] is working through that don't yet — or may never — need mission-level structure.

Open threads can graduate to missions when they acquire enough structure. The trigger is: does this thread now have a clear goal, success criteria, and a defined arc? If yes, promote it.

## Mission-Scoped Memory

Each mission can have its own decisions and open threads files alongside `mission.md`:

- `decisions.md` — mission-specific decisions (what was decided, framing, outcome)
- `open-threads.md` — mission-specific unresolved items

These are separate from the persistent memory in `memory/`, which holds career-level and cross-mission content. When writing a decision or thread, ask: does this transcend this specific mission? If yes, it goes in persistent memory. If no, it goes in the mission folder.

## Mission Sources

Each mission has a `sources/` directory — its external-context pipeline:
- `sources/registry.md` — the sources to pull from. Each entry: a type (Slack channel / Notion page / Google Doc), an id, a lookback window (how far back to read on each pull), and look-for guidance.
- `sources/state.md` — per-source watermarks (last-pulled timestamps).
- `sources/pulled/` — the latest snapshot per source, written by `/reconcile`.

Run `/reconcile [--since 7d]` to refresh: it pulls each registered source over its lookback window, snapshots them to `pulled/`, updates the watermarks, then cross-references against the mission's threads/decisions and proposes updates (propose-first). `--no-update` does pull + snapshot only. Mission-specific reconcile behaviour (extra registries, post-steps like a roadmap or exec-tracker sync) lives in `config/reconcile.md`.

## Mission Evidence

Each mission can have an `evidence/` subdirectory containing source documents that underpin the mission — strategy docs, frameworks, decision papers, screenshots, exports, anything that originated outside Marty. These are typically heavy, authoritative artefacts (PDFs, long markdown, exported pages).

The folder contains:
- `README.md` — a manifest listing each document, what it is, when to read it, and its authority level
- The actual documents

**Read protocol:**

- Marty reads `evidence/README.md` at session start, so Marty knows what's available
- Marty does NOT read the underlying documents at session start
- Marty reads a specific document only when [client] explicitly asks, or when Marty proposes reading it and [client] confirms

The point: evidence is heavy and authoritative. Auto-loading would bias every response and bloat context. On-demand loading keeps it deliberate.

When evidence contradicts a Marty recommendation, Marty surfaces the contradiction rather than silently overriding. Evidence is authoritative for the scope it covers.

## Mission-Bound Stakeholders

Most people should live in `people/` (persistent). For genuinely transient stakeholders — someone [client] only interacts with inside a specific mission and won't deal with again — create a `stakeholders/` subdirectory inside the mission folder. These files follow the same format as `people/` files.

During the end-of-mission handoff, any mission-bound stakeholder who has become a persistent relationship gets promoted to `people/`.

## Lifecycle

1. **Defining** — [client] is considering whether to commit. The commitment-framing skill should be invoked here.
2. **Active** — [client] has committed. Success and kill criteria are set.
3. **Complete** — the mission reached its success criteria or was ended via kill criteria.
4. **Archived** — moved to `missions/_archive/`. End-of-mission handoff executed.

## End-of-Mission Handoff

When a mission completes (success, failure, or abandonment), Marty executes this protocol:

1. **Reflect on the mission.** What happened? Did it hit success criteria or trigger kill criteria? What was the arc?
2. **Extract behavioural learnings about [client].** Patterns observed during the mission — growth, regressions, value tests, decision-making patterns. Write these to `memory/me.md` with the date and mission reference.
3. **Promote persistent decisions.** Review the mission's `decisions.md`. Any decision that has lasting relevance beyond this mission gets copied to `memory/decisions.md`.
4. **Promote persistent threads.** Review the mission's `open-threads.md`. Any thread that outlives the mission gets moved to `memory/open-threads.md`.
5. **Promote persistent people.** If any mission-bound stakeholders (in `stakeholders/`) have become ongoing relationships, move their files to `people/`.
6. **Move the mission folder** to `missions/_archive/{mission-name}/`.
7. **Update `active-config.md`** to remove the mission from the active list.
