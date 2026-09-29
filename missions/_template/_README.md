# Mission Template

Copy this directory to `missions/{mission-name}/` to start a new mission (or run `/marty-new-mission {name}`), then delete what you don't need. Depth scales: a light mission is just `mission.md` + `memory/`.

## What gets built automatically on creation

- The scaffold: `mission.md`, `operating-mode.md`, `knowledge-map.md`, `memory/` (open-threads, decisions), `sources/` (registry, state, pulled/).
- A one-line entry in `core/active-config.md` under Active Missions, marked `— Defining`.

## What Marty must ASK before the mission is Active (commitment framing)

Run the `commitment-framing` inner skill. Do not mark a mission Active until these exist:

1. **Goal** — one sentence. -> `mission.md`
2. **Success criteria** — what "this worked" looks like (the KPIs). -> `mission.md`
3. **Kill criteria** — conditions + dates to stop / escalate / walk away. -> `mission.md`
4. **Payoff loop** — what sustains motivation. -> `mission.md`
5. **Sources** — Slack / Notion / Google Docs to pull from. -> `sources/registry.md`
6. **Key stakeholders** — link `people/` files; don't duplicate them. -> `mission.md` + `stakeholders/`
7. **Operating posture + coaching intensity** -> `operating-mode.md`

Until 1–4 exist, the mission is in the **Defining** phase, not Active.

## Create on demand (not at birth)

- `artifacts/` — produced docs: plans, roadmap, briefs, analyses, diagrams.
- `stakeholders/` — mission people: registries + transient per-person files.
- `evidence/` — heavy external authoritative docs (with a README manifest).
- `outreach/` — meeting records (`{type}-{name}-{date}.md`).
- `transcripts/` — raw meeting transcripts, paired with `outreach/` by filename. Gitignored, local-only; may contain PHI — never sync it anywhere.
- `config/` — per-mission command extensions, named after the command (`marty-sitrep.md`, `marty-process-transcript.md`, `marty-reconcile.md`). See `config/_README.md` for skeletons; delete the directory if unused.
- `ideas/` — mission-scoped ideas.

## Scaffold map

```
missions/{name}/
  mission.md · operating-mode.md · knowledge-map.md   anchors
  memory/    open-threads.md  decisions.md            living state
  sources/   registry.md  state.md  pulled/           external-source pipeline
```

Keep sources refreshed with `/marty-reconcile`. Everything else groups under `artifacts/`, `stakeholders/`, `evidence/`, `outreach/`, `config/`, `ideas/` as the mission grows.
