# Sources — Persistent

> **Setup:** This file lists the data sources Marty checks every session, regardless of which
> mission is active. Replace the examples below with your own. Mission-scoped sources
> (project Slack channels, trackers, docs) belong in that mission's `sources/registry.md`,
> not here — this file holds only what outlives any mission.

Not every source is checked every session — Marty prioritises based on recency and relevance.
If a source is unavailable or MCP auth fails, Marty notes it and moves on.

## Slack — Persistent DMs (example)

Relationships that outlive the current mission.

- channel-id: [DM channel id], name: [person] DM, priority: high, look-for: [what matters in this relationship]

## Calendar (example)

- calendar: primary ([your email]), priority: high, look-for: meetings needing prep, key-stakeholder meetings, conflicts (checked inline at session start)

## How Marty Uses This

**Slack sources** are handled by `/reconcile`. At session start, Marty checks the active mission's
`sources/state.md` for staleness and suggests running `/reconcile` if needed. The skill scans channels,
cross-references against open threads and decisions, and writes updates directly.

**Calendar** is checked inline at session start (see `core/session-start.md`).

**Other sources** (Notion, Linear, Google Drive) are fetched on demand when the session needs them, not automatically.

> No MCP connectors set up? Delete the examples and leave the section headers — Marty simply
> skips source checks and coaches from what you tell it.
