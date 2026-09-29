Scaffold a new Claude Code hook the way `/marty-new-mission` scaffolds a mission: copy the template, wire the gate, register it with consent, and document it. Run: `/marty-new-hook {name}` (name optional — ask if missing).

## What a Marty hook is

A script in `tools/` that Claude Code fires on a session event, following the pattern in "The hook pattern" (`tools/README.md`): gated by a Settings key (default **off**), never blocks the live session, logs one line per run, one concurrent run. The memory pass (`tools/memory_pass.py`) is the reference implementation.

## Protocol — one question at a time

1. **What should trigger it?** Map their plain answer to an event: after each exchange → `Stop` · when a session opens → `SessionStart` · before a tool runs → `PreToolUse` · after a tool runs → `PostToolUse` · when they submit a prompt → `UserPromptSubmit`. Confirm the mapping in one sentence.
2. **What should it do?** Get concrete: what does it read, what does it check, what counts as "worth acting on", and what does it do then (log a line, write a flag file, run a headless model pass)? Push back if the answer needs the live conversation — hooks run out-of-band.
3. **Name it.** Kebab-case from the user or the `{name}` argument; derive `snake_case` for the file.

## Build steps

1. Copy `tools/_template_hook.py` → `tools/{snake_name}.py`. Replace exactly these tokens (and nothing else — the file's own f-strings use braces too): `{HOOK_TITLE}`, `{EVENT}`, `{setting_key}` → `{snake_name}_hook`, `{name}` → `{snake_name}`, `{env_guard}` → `MARTY_HOOK_{SNAKE_NAME_UPPER}`.
2. Implement the worker logic from step 2 of the protocol inside the marked block. Deterministic code first; if judgment is needed, follow the headless-pass pattern from `tools/memory_pass.py` (cheap model, neutral cwd, write gate if it edits files).
3. Add the Settings key to `core/active-config.md` under `## Settings`, default off, with a one-line comment: `- {snake_name}_hook: off   # <what it does when on>`.
4. Show the registration JSON for `.claude/settings.local.json` and apply it **only on an explicit yes** — this file is theirs and gitignored. If a `hooks.{EVENT}` array already exists, append; never replace existing entries:
   ```json
   "hooks": { "{EVENT}": [{ "hooks": [{ "type": "command",
     "command": "python3 \"$CLAUDE_PROJECT_DIR/tools/{snake_name}.py\"",
     "timeout": 10 }] }] }
   ```
5. Add one inventory line to `tools/README.md` describing the hook and its Settings key.
6. Test before handing over: `echo '{}' | python3 tools/{snake_name}.py` must exit 0 silently (gate off), and with the key on plus `MARTY_HOOK_DRYRUN=1` it must write a dry-run line to `tools/{snake_name}.log`. Show the user both results.
7. Close: tell them the hook is registered but OFF; the on-switch is `{snake_name}_hook: on` in `core/active-config.md`, and the log to watch is `tools/{snake_name}.log`.

## What this does NOT do

- Turn the hook on — shipping state is off; the user flips the Settings key themselves.
- Edit `.claude/settings.local.json` without an explicit yes to the shown JSON.
- Write hooks that block the session, prompt the user, or bypass the Settings gate.
