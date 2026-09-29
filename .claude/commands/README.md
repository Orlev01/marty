# Marty slash commands

Slash commands for driving Marty from Claude Code. Each file in this directory is a command; invoke it as `/<filename-without-extension>`.

## Getting started

| Command | What it does |
|---------|--------------|
| `/marty-onboard` | First-run interview for a fresh clone: seeds your values, north star, coaching contract, and memory files one question at a time, then walks the default settings (background memory pass, calendar check) with an on/off decision each. Re-run a single section with `/marty-onboard {values|north-star|contract|sources|settings}`. |

## Day-to-day

| Command | What it does |
|---------|--------------|
| `/marty-status` | Quick situational awareness: active missions, top actions ranked by urgency, and who's waiting on whom. Read-only. |
| `/marty-process-transcript` | After a meeting: route the transcript to the right mission, save the raw verbatim, write the analysis, and update threads and people. |
| `/marty-sync` | Re-read mutable state from disk to pick up changes made by parallel sessions. Read-only. |
| `/marty-update` | Flush unwritten state changes from this conversation to disk so parallel sessions can pick them up via `/marty-sync`. |

## Mission lifecycle

| Command | What it does |
|---------|--------------|
| `/marty-new-mission` | Scaffold a new mission from the template, register it in `core/active-config.md`, and hand back the setup TODOs. |
| `/marty-end-mission` | Execute the end-of-mission handoff: promote persistent learnings, decisions, threads, and people, then archive the mission. |
| `/marty-reconcile` | Refresh a mission from its registered sources: pull, snapshot, cross-reference against threads and decisions, propose updates. |
| `/marty-thread-review` | Interactive, graph-aware hygiene pass over a mission's ephemeral memory — classify, walk flagged items, execute clean edits. |

## Session & memory

| Command | What it does |
|---------|--------------|
| `/marty-end-session` | Execute the post-chat memory write protocol: route notable items to the right memory files before closing. |
| `/marty-refine-idea` | Work an idea from `ideas/` through coaching: clarify, stress test, connect, and land on one next action. |

## Utilities

| Command | What it does |
|---------|--------------|
| `/marty-skills` | Display all available Marty skills and commands, organized by category. |
| `/marty-new-hook` | Scaffold a new Claude Code hook from the template: settings-gated, non-blocking, logged. Registered off by default. |
| `/marty-new-skill` | Scaffold a new coaching skill from `skills/_template.md` and register it in all four places (skill file, SKILLS.md, CLAUDE.md, skill-invocation). |
| `/marty-foundations-first-explainer` | Teach any topic bottom-up, building each concept on the one before it. |
| `/marty-initiator` | Open an autonomous peer conversation with a second Claude Code agent over the agent-bus (`tools/agent-bus/`). |
| `/marty-reactor` | Join that conversation as the responder, optionally under a standing instruction. |
| `/marty-end-comms` | End the peer conversation, save the transcript, and close the channel for both agents. |
