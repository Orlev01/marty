Refresh a mission from its registered sources: pull the latest, snapshot it, cross-reference against the mission's own threads and decisions, and propose updates. The general refresh engine for ANY mission; each mission's specifics are bolted on via its own `config/reconcile.md`, never hardcoded here. Run on demand: `/reconcile [mission] [--since 7d] [--no-update] [--dry-run]`.

## Arguments

| Parameter | Format | Default |
|-----------|--------|---------|
| target | a mission name, or `--all` | the active mission from `core/active-config.md`; if more than one is active and none given, ask which |
| `--since` | `1d` `7d` `2w` `1m` | off; overrides every source's registry lookback for this run |
| `--no-update` | flag | pull + snapshot only; skip the cross-reference and propose phases (this is the old `/reconcile` behaviour) |
| `--dry-run` | flag | run everything, write nothing, return the manifest |

## Phase 1 — Resolve + load

Read `core/active-config.md`; resolve the target mission(s). For each, read (its own files only): `sources/registry.md`, `sources/state.md`, `memory/open-threads.md` (Active), `memory/decisions.md` (Active), and **`config/reconcile.md` if it exists** — the mission's extensions (extra evidence types, registries to match, no-close list, post-steps). `--all` repeats the whole protocol per mission, each fully scoped to its own files.

## Phase 2 — Pull + snapshot (multi-source)

For each registry source: window = `--since`, else the source's `lookback`, else `7d`; Oldest = now − window. Pull by type (ToolSearch the MCP tools):
- **slack** — `slack_read_channel` (oldest = Oldest) + `slack_read_thread` for real discussion; resolve names.
- **notion** — `notion-fetch` / `notion-search`; content edited since Oldest.
- **gdoc** — `Google_Drive` `modifiedTime`; if changed, `read_file_content`.
- **github** — `gh api "repos/{repo}/commits?since={ISO}"` + `gh pr list --repo {repo} --state all --search "updated:>={date}"`; capture commit subjects, PR titles/status, files touched.
- **unknown / auth failure** — mark `skipped (reason)`, continue. One source never stops the rest.

Write a snapshot per source to `sources/pulled/{slug}.md` (overwrite; distilled signal, not a raw dump). Update `sources/state.md` watermarks + `Last pull`. **If `--no-update`: report and stop here.**

## Phase 3 — Extract evidence

From the pulled content, extract structured items: `who` / `what` (concrete) / `when` / `source` / `evidence_type`. Base types: `resolution`, `advancement`, `new_signal`, `decision`, `blocker`, `request`. The mission's `config/reconcile.md` may add types. Discard bot noise, acknowledgements, and anything older than Oldest.

## Phase 4 — Cross-reference (the engine)

Match each item against the mission's Active threads/decisions. Build a name map first. Confidence:
- **auto** — person+action, or a completed action, directly matches one specific bold-marker item; exactly one plausible match.
- **propose** — person+topic match, any decision, or a mission-extension match (e.g. a registry the mission's config declares). Decisions are always propose.
- **note** — weak topic match, no anchor.

Honor the **no-close list** (update-only threads; the mission's `config/reconcile.md` supplies its list — default is none). Be conservative: a missed match is cheap (stays stale till next run), a wrong close is expensive (hides live work) — demote when unsure. Produce a change manifest (`confidence, file, thread, action, current_text, proposed_change, evidence, reasoning`) and an `UNMATCHED` list.

## Phase 5 — Write (propose-first)

`--dry-run`: emit the manifest, write nothing. Otherwise:
- **auto** — apply directly using the mission's memory conventions: bold markers, strikethrough-not-delete for resolutions, cite `(evidence: ...)` on every write, sync `knowledge-map.md` on any thread add/rename/merge/close.
- **propose** — present as a numbered confirm list; apply confirmed items the same way.
- **note** — report only, no write.
Batch by file (one pass per file).

## Phase 6 — Mission extensions

If `config/reconcile.md` declares post-steps (e.g. a roadmap check, an exec-tracker sync), run them now following that file. Skip silently if there are none.

## Phase 7 — Report

```
## Reconcile — {mission} — {date}
Pulled: {per source: N items | no change | skipped(reason)}
Applied (N) / Proposed (N) / Extensions (N) / Noted (N) / Unmatched (N)
Source state: updated {N}, auth-failed {list}
```

## Important

- Propose-first for anything uncertain; never auto-close a no-close thread; never delete content (strikethrough).
- Cite evidence on every write. Conservative by default.
- A data/hygiene pipeline, not coaching — do not load identity or coaching files. Honor `core/memory.md`.
- Mission-specific machinery (registry matching, roadmaps, exec trackers) lives in that mission's `config/reconcile.md`, never in this command. This keeps one engine across all missions.
