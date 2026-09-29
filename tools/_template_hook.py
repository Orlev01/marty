#!/usr/bin/env python3
"""{HOOK_TITLE} — Marty hook (scaffolded by /marty-new-hook from tools/_template_hook.py).

Registered as a Claude Code {EVENT} hook in .claude/settings.local.json.
Gated by `{setting_key}: on` in core/active-config.md Settings — until that key
is switched on, this exits instantly and does nothing.

Pattern rules (keep these when you edit):
  1. Entry mode NEVER blocks the live session: gate-check, detach worker, exit 0.
  2. The worker does the real work out-of-band and appends ONE line to the log.
  3. The off-switch is the Settings key — never uninstalling the hook.
  4. Deterministic work in code; model judgment via a headless `claude -p` on a
     cheap model from a neutral cwd (see tools/memory_pass.py for that pattern,
     including the PreToolUse write gate if the model run edits files).
  5. One concurrent run (lockfile); a stale lock never wedges the hook.

Env:
  {env_guard}=1        set on the worker; entry exits if present (recursion guard)
  MARTY_HOOK_DRYRUN=1  worker logs what it would do and stops
"""
import datetime
import json
import os
import subprocess
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
CONFIG = REPO / "core" / "active-config.md"
LOG = REPO / "tools" / "{name}.log"
LOCK = REPO / "tools" / ".{name}.lock"
ENV_GUARD = "{env_guard}"
SETTING_KEY = "{setting_key}"


def log(msg: str):
    stamp = datetime.datetime.now().isoformat(timespec="seconds")
    with open(LOG, "a", encoding="utf-8") as fh:
        fh.write(f"{stamp} | {msg}\n")


def setting(key: str, default: str) -> str:
    """Read a grep-able `key: value` line from the Settings block."""
    import re
    try:
        text = CONFIG.read_text(encoding="utf-8")
    except OSError:
        return default
    m = re.search(rf"^[\s\-*]*{re.escape(key)}:\s*(\S+)", text, re.MULTILINE)
    return m.group(1) if m else default


def entry():
    """Hook entry: read the event payload, gate, detach, exit. Never block."""
    try:
        data = json.load(sys.stdin)
    except Exception:
        sys.exit(0)
    if os.environ.get(ENV_GUARD):
        sys.exit(0)
    if setting(SETTING_KEY, "off") != "on":
        sys.exit(0)
    if LOCK.exists():
        try:
            os.kill(int(LOCK.read_text().strip()), 0)
            sys.exit(0)  # a run is already in flight
        except (ValueError, ProcessLookupError, PermissionError, OSError):
            LOCK.unlink(missing_ok=True)
    env = {**os.environ, ENV_GUARD: "1"}
    with open(LOG, "a", encoding="utf-8") as out:
        subprocess.Popen(
            [sys.executable, str(Path(__file__).resolve()), "--worker", json.dumps(data)],
            env=env, cwd=str(REPO), stdout=out, stderr=out,
            start_new_session=True,
        )
    sys.exit(0)


def worker(payload_json: str):
    LOCK.write_text(str(os.getpid()))
    try:
        data = json.loads(payload_json)
        if os.environ.get("MARTY_HOOK_DRYRUN"):
            log(f"dry-run: would run on payload keys [{', '.join(sorted(data))}]")
            return

        # ── YOUR LOGIC HERE ──────────────────────────────────────────────
        # `data` is the hook event payload (fields vary by event — e.g. Stop
        # includes transcript_path). Do the work, then log ONE summary line.
        log("ran: (describe what happened)")
        # ─────────────────────────────────────────────────────────────────
    finally:
        LOCK.unlink(missing_ok=True)


if __name__ == "__main__":
    if len(sys.argv) >= 3 and sys.argv[1] == "--worker":
        worker(sys.argv[2])
    else:
        entry()
