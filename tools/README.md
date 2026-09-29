# tools/ — deterministic helpers

Mechanical steps belong in code, not in model instructions. A skill that needs a
byte-exact copy, a timestamp comparison, or a count calls a script here and reads
its output; the model spends tokens only on judgment. Scripts print verifiable
results (byte counts, first/last snippets, one-line logs) so Marty can sanity-check
without re-doing the work.

## Inventory

- `save_transcript.py` — verbatim transcript save for `/marty-process-transcript`.
  `--from-file SRC DEST` copies a file; `--from-session DEST --anchor-start "…"
  --anchor-end "…"` extracts a pasted transcript straight from the session .jsonl.
  Zero model tokens either way.
- `memory_pass.py` — Stop-hook background memory updater. Entry mode gates on
  `memory_mode: auto` in `core/active-config.md` Settings, then detaches a worker;
  the worker extracts the last exchange deterministically and runs a headless
  cheap-model pass that applies `core/memory.md` routing rules. Log:
  `memory/memory-pass.log`.
- `memory_gate.py` — PreToolUse write gate for the memory pass (deny-by-default
  write judge): path allowlist
  (the five memory files, symlink/traversal-safe), append-only checks (Edit
  old⊆new; Write existing-prefix), ≤3 edits per session. Registered per-pass in
  `~/.claude/memory-pass/.claude/settings.json`, so it never touches live
  sessions. Self-test: `python3 tools/memory_gate.py --self-test` (19 cases).
- `agent-bus/` — pre-existing agent transcript bus.
- `_template_hook.py` — the hook scaffold copied by `/marty-new-hook`. Not a
  runnable tool; placeholder tokens get replaced at scaffold time.

## The hook pattern

Every Marty hook follows five rules. `/marty-new-hook` scaffolds them for you
(from `_template_hook.py`); keep them if you write one by hand:

1. **Gated by a Settings key** in `core/active-config.md` (`<name>_hook: off` by
   default). The hook is registered permanently but inert until switched on —
   the off-switch is one line of markdown, never uninstalling.
2. **Never blocks the live session.** Entry mode gate-checks, detaches a worker
   (`start_new_session=True`), and exits 0. All real work is out-of-band.
3. **One log line per run** (`tools/<name>.log`, gitignored) so every firing is
   auditable.
4. **Deterministic first, model second.** Mechanical work in code; if judgment
   is needed, a headless `claude -p` on a cheap model from a neutral cwd — and
   if that run edits files, a deny-by-default PreToolUse write gate
   (`memory_gate.py` is the reference).
5. **One concurrent run** via a pid lockfile; stale locks self-clear.

`memory_pass.py` + `memory_gate.py` are the worked example of all five.

## Candidates for later

Source-staleness checks (session start), thread/decision threshold counts
(`/marty-thread-review` classify phase), knowledge-map desync detection — each
is a natural `/marty-new-hook` scaffold.

## Hook setup (for a fresh clone)

`memory_pass.py` runs as a Claude Code Stop hook, registered in `.claude/settings.local.json` — which is gitignored, so a fresh clone does not have it. To enable the background memory pass, add to that file:

```json
"hooks": {
  "Stop": [{ "hooks": [{ "type": "command",
    "command": "python3 \"$CLAUDE_PROJECT_DIR/tools/memory_pass.py\"",
    "timeout": 10 }] }]
}
```

Then set `memory_mode: auto` in `core/active-config.md` Settings. Without the hook the setting is inert; without `auto` the hook exits instantly.
