# Marty

A persistent AI professional coach built on Claude. Peer-to-peer, not assistant-to-user. Marty helps you make better decisions, see yourself more clearly, and grow into the leader you want to become.

---

## What It Is

Marty is a structured Claude Code project — a directory of small, composable files that form a coaching system. When you open Claude Code in this directory, Marty reads your values, north star, active analogy, and current missions, then coaches you from that context across every session.

It is not a chatbot. It is not a journaling tool. It is a peer-level voice that holds you to your own stated standards, pushes back when you're wrong, and tracks patterns in how you operate over time.

---

## How It Works

```
marty/
  CLAUDE.md          ← the manifest; Claude reads this first
  SKILLS.md          ← full registry: 22 skills + 18 commands, with triggers
  sources.md         ← persistent data-source registry (template)
  core/              ← who Marty is and how Marty coaches you
    identity.md      ← the coaching relationship
    values.md        ← your values, with audit hooks
    north-star.md    ← the leader you're becoming
    coaching-posture.md
    operating-principles.md
    active-analogy.md ← the current coaching frame (default: cornerman)
    active-config.md  ← active missions, settings, intensity level
    session-start.md  ← what Marty does at the top of every session
    skill-invocation.md
    memory.md
    mission-structure.md
  .claude/commands/  ← the /marty-* slash commands
  skills/            ← coaching utilities (read on demand, not at startup)
    inner/           ← self-management: accountability, failure loops, strategy
    outer/           ← navigating others: stakeholder mapping, hard conversations
    knowledge/       ← domain expertise: org design, AI rollout patterns, etc.
  missions/          ← structured projects (gitignored — your private state)
    _template/       ← copied by /marty-new-mission
  people/            ← relationship profiles (gitignored — your private state)
  memory/            ← persistent observations about how you operate (gitignored)
  ideas/             ← private idea space (gitignored)
  tools/             ← deterministic helpers (transcript save, background memory pass, agent-bus)
  console/           ← optional schema-driven project console (web view)
```

**Composable by design.** Each file is small and single-purpose. You can revise any file without touching the others. Skills are loaded on demand, not at session start — Marty decides when to pull one.

**Private by default.** `people/`, `missions/`, `memory/`, and `ideas/` are gitignored. Your coaching data stays on your machine. Nothing is synced.

---

## Getting Started

### 1. Fork and clone this repo

```bash
git clone <your-fork>
cd marty
```

### 2. Open Claude Code and let Marty onboard you

```bash
claude  # or open in VS Code with Claude Code extension
```

Claude reads `CLAUDE.md` automatically. On a fresh clone, Marty detects there's no memory yet and offers **`/marty-onboard`** — a guided interview, one question at a time, that fills in your values, north star, and coaching contract, walks the default settings with an on/off decision each, and teaches you the daily loop. You can paste a bio, LinkedIn, or self-review and Marty drafts answers for you to correct. Every answer is written to a file in front of you.

### 3. Or fill in the core files by hand

If you'd rather edit directly:

| File | What to fill in |
|------|----------------|
| `core/values.md` | Your core values with audit hooks |
| `core/north-star.md` | The professional you're becoming, your constraint, your permanent question |
| `core/identity.md` | Already generic — replace `[client]` with your name |
| `core/active-config.md` | Leave as-is until you create a mission |

The other `core/` files (coaching posture, operating principles, session start, etc.) are ready to use as-is — they define how Marty coaches, not who you are.

Optionally, replace the `[client]` placeholder with your name across the repo (Marty works fine either way):

```bash
grep -rl '\[client\]' --include='*.md' . | xargs sed -i '' 's/\[client\]/YourName/g'   # macOS
# Linux: drop the '' after -i
```

### 4. Configure your data sources (optional)

Edit `sources.md` to add your Slack channels, Linear projects, Google Calendar, and other feeds. Marty uses MCP tools to check these at session start via the `/marty-reconcile` command.

---

## Commands

Marty ships 18 slash commands, all prefixed `/marty-` so you can spot them at a glance. The daily loop:

| Command | What it does |
|---------|--------------|
| `/marty-onboard` | First-run interview — seeds your values, north star, and memory files |
| `/marty-status` | What you owe, ranked, plus who's waiting on whom. Read-only. |
| `/marty-update` | Checkpoint this conversation's state to disk |
| `/marty-process-transcript` | After a meeting: route, save, analyse, update threads and people |
| `/marty-thread-review` | Hygiene pass when threads feel stale |
| `/marty-end-session` | Post-chat memory write protocol |

The full set — mission lifecycle (`/marty-new-mission`, `/marty-end-mission`, `/marty-reconcile`), parallel sessions (`/marty-sync`), the agent-bus experiment, and more — is in `SKILLS.md` and `.claude/commands/README.md`, or run `/marty-skills`.

---

## Missions

A mission is a structured project — a goal Marty tracks with you over time. Create one when you're working on something significant (a career move, a complex initiative, a stretch goal). Run `/marty-new-mission {name}` to scaffold one from the template:

```
missions/
  my-mission/
    mission.md            ← goal, success criteria, kill criteria, payoff loop
    operating-mode.md     ← mission-specific posture and rules (optional)
    knowledge-map.md      ← workstream → file map, so nothing is preloaded
    memory/
      decisions.md        ← mission decisions and why
      open-threads.md     ← active threads with owners
    sources/
      registry.md         ← external sources /marty-reconcile pulls from
      state.md            ← per-source watermarks (written by /marty-reconcile)
```

Depth scales — a light mission is just `mission.md` + `memory/`. List active missions in `core/active-config.md`; Marty loads them at session start.

See `core/mission-structure.md` for the full schema and end-of-mission handoff protocol.

---

## People Profiles (Optional)

If you work with the same people repeatedly, you can create relationship profiles in `people/`. Marty uses these to give more calibrated advice when you're navigating a situation involving that person.

These files are gitignored. They stay on your machine.

---

## The Active Analogy

Marty always coaches through one active analogy at a time. The default is the **cornerman**: you're the fighter, Marty is between rounds — reading the fight, checking for cuts, giving one instruction before sending you back out.

To change the analogy, update `core/active-analogy.md` and `core/active-config.md`. Marty can suggest a new analogy if the current one stops fitting.

---

## Background Memory Pass (Optional)

By default, memory writes happen in-session (visible file edits you approve). If you want Marty to also catch memory-worthy moments automatically, a Stop hook can run a detached, cheap-model memory pass after each exchange — gated by a deny-by-default write judge, logged to `memory/memory-pass.log`, and never delaying the live conversation.

It's off until you opt in: `/marty-onboard` walks you through the decision and sets it up with your consent, or do it by hand — see "Hook setup" in `tools/README.md`, then set `memory_mode: auto` in `core/active-config.md`.

---

## Console (Optional)

`console/` is a schema-driven, event-sourced project tracker with a generated web view. `schemas.json` defines your record types — each field carries an `aiInstruction` telling Claude how to populate it, so adding a new record type needs no code. State is built from append-only event files that Marty (or you, in the browser) can write.

```bash
cd console
npm install
npm run serve   # opens on http://localhost:8244
```

It starts with a generic pack (tasks, blockers, risks, decisions, open questions, ideas, diagrams, glossary) and a **Sources** tab that renders a read-only view of your `sources.md` and mission source registries — your markdown stays the single source of truth. Add or edit schemas in the browser; see `console/CLAUDE.md` for how Claude sessions read and write it.

---

## Design Principles

- **Inner before outer.** When a situation involves both self-management and managing others, Marty addresses the inner work first. No tactical tools until inner clarity is established.
- **Single source of truth per concept.** A value lives in `values.md`, not duplicated in CLAUDE.md for context. If a change requires editing three files, the architecture is wrong.
- **Persistent vs transient.** Core, people, and memory survive mission changes. Missions live and die with a specific project. End-of-mission handoff extracts lasting learnings into persistent memory.
- **Skills evolve independently.** Core changes rarely. Skills change as you learn what works. The architecture supports skill revision without core revision.

---

## Privacy Note

`people/`, `missions/`, `memory/`, and `ideas/` are gitignored and stay on your local machine. Keep your fork private if it contains sensitive coaching context or org observations.

---

## License

MIT
