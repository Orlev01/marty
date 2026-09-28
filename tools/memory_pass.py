#!/usr/bin/env python3
"""Marty background memory pass.

Registered as a Claude Code Stop hook (.claude/settings.local.json). After each
exchange:

  entry (hook) mode — reads the hook JSON on stdin. If Settings memory_mode is
  not "auto", or a pass is already running, or this IS a memory-pass session,
  exit 0 immediately. Otherwise spawn --worker fully detached and exit 0.
  The live conversation is never delayed by this hook.

  --worker TRANSCRIPT — deterministic code (no model) extracts the last
  user+assistant exchange from the session .jsonl, then a headless
  `claude -p` on a cheap model — run from a neutral cwd, so no Marty persona
  loads and no hook recursion is possible — applies core/memory.md routing
  rules and edits memory files directly, or does nothing. One line per run is
  appended to memory/memory-pass.log.

Env:
  MARTY_MEMORY_PASS=1    set on the worker and its headless run; entry exits if present
  MARTY_MEMORY_DRYRUN=1  worker logs what it would run and skips the claude call
"""
import datetime
import json
import os
import re
import shutil
import subprocess
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
CONFIG = REPO / "core" / "active-config.md"
LOG = REPO / "memory" / "memory-pass.log"
LOCK = REPO / "memory" / ".memory-pass.lock"
NEUTRAL = Path.home() / ".claude" / "marty-memory-pass"
GATE = REPO / "tools" / "memory_gate.py"

META_PREFIXES = (
    "Caveat:", "<command-name>", "<local-command", "<system-reminder>",
    "[SYSTEM NOTIFICATION", "<task-notification>",
)

USER_CAP_HEAD, USER_CAP_TAIL = 8000, 4000
ASST_CAP_HEAD, ASST_CAP_TAIL = 5000, 3000


def log(msg: str):
    LOG.parent.mkdir(parents=True, exist_ok=True)
    stamp = datetime.datetime.now().isoformat(timespec="seconds")
    with open(LOG, "a", encoding="utf-8") as fh:
        fh.write(f"{stamp} | {msg}\n")


def setting(key: str, default: str) -> str:
    try:
        text = CONFIG.read_text(encoding="utf-8")
    except OSError:
        return default
    m = re.search(rf"^[\s\-*]*{re.escape(key)}:\s*(\S+)", text, re.MULTILINE)
    return m.group(1) if m else default


def truncate(text: str, head: int, tail: int) -> str:
    if len(text) <= head + tail + 40:
        return text
    return text[:head] + "\n[... truncated ...]\n" + text[-tail:]


def extract_last_exchange(transcript: Path):
    """Return (user_text, assistant_text, note). user_text None => skip."""
    entries = []
    with open(transcript, encoding="utf-8") as fh:
        for line in fh:
            try:
                e = json.loads(line)
            except json.JSONDecodeError:
                continue
            etype = e.get("type")
            if etype not in ("user", "assistant") or e.get("isMeta"):
                continue
            content = (e.get("message") or {}).get("content")
            if etype == "user":
                if isinstance(content, str):
                    text = content
                elif isinstance(content, list):
                    if any(isinstance(b, dict) and b.get("type") == "tool_result" for b in content):
                        continue
                    text = "\n".join(b.get("text", "") for b in content
                                     if isinstance(b, dict) and b.get("type") == "text")
                else:
                    continue
                entries.append(("user", text))
            else:
                if isinstance(content, list):
                    text = "\n".join(b.get("text", "") for b in content
                                     if isinstance(b, dict) and b.get("type") == "text")
                    if text.strip():
                        entries.append(("assistant", text))

    last_user = None
    for i in range(len(entries) - 1, -1, -1):
        if entries[i][0] == "user":
            last_user = i
            break
    if last_user is None:
        return None, None, "no user message in transcript"
    utext = entries[last_user][1]
    if not utext.strip() or utext.lstrip().startswith(META_PREFIXES):
        return None, None, "last turn is non-conversational (command/system)"
    atext = "\n".join(t for k, t in entries[last_user + 1:] if k == "assistant")
    return (truncate(utext, USER_CAP_HEAD, USER_CAP_TAIL),
            truncate(atext, ASST_CAP_HEAD, ASST_CAP_TAIL), "")


PROMPT_TEMPLATE = """You are Marty's background memory updater, running out-of-band after one \
exchange of a live coaching session (the user being coached, and Marty the assistant). Decide whether \
the exchange below contains anything memory-worthy; if so make the MINIMAL file edits. Most \
exchanges need nothing — then reply exactly NO-WRITE and change no files.

Memory-worthy (per {repo}/core/memory.md): a decision made or deferred; Marty and the user \
disagree; Marty was wrong about the user and got corrected; a significant behavioural pattern; an \
open thread meaningfully advances or changes; a commitment with an owner. NOT memory-worthy: \
analysis, options, drafts, questions, plans not yet agreed, routine back-and-forth.

Routing:
- Read {repo}/core/active-config.md (Active Missions list) first.
- Mission-specific -> {repo}/missions/<mission>/memory/open-threads.md or decisions.md. Pick \
the mission whose knowledge-map.md trigger words match the exchange; if unsure, use the \
persistent files instead.
- Transcends missions -> {repo}/memory/open-threads.md, {repo}/memory/decisions.md, or \
{repo}/memory/me.md (me.md = behavioural observations about the user only).

Hard rules:
- Read a file before editing it; match its existing format and append dated entries.
- Thread advanced -> add "**Update ({today}):** ..." under that thread. New actionable item \
-> bold marker (**Open:** / **Pending:** / **Open follow-up:**) with an owner.
- Meetings are not threads: never create a "Meeting ... held" active entry.
- One home per fact; never write the same fact into two files.
- At most 3 file edits per pass. Never delete or rewrite existing entries; append or extend \
only. When in doubt: NO-WRITE.
- These limits are ALSO code-enforced by a tool gate. If a Write/Edit is denied, you violated \
one — do not retry it verbatim; fix the violation or finish with NO-WRITE.
- Today is {today}.

End your reply with exactly one line:
WRITES: <n> | <one-line summary or "none">

=== EXCHANGE ===
[User]
{user}

[Marty]
{assistant}
"""


def entry():
    try:
        data = json.load(sys.stdin)
    except Exception:
        sys.exit(0)
    if os.environ.get("MARTY_MEMORY_PASS"):
        sys.exit(0)
    if data.get("stop_hook_active"):
        sys.exit(0)
    if setting("memory_mode", "manual") != "auto":
        sys.exit(0)
    tp = data.get("transcript_path")
    if not tp or not Path(tp).is_file():
        log("entry skip: no transcript_path in hook input")
        sys.exit(0)
    if LOCK.exists():
        try:
            pid = int(LOCK.read_text().strip())
            os.kill(pid, 0)
            log("entry skip: a pass is already running")
            sys.exit(0)
        except (ValueError, ProcessLookupError, PermissionError, OSError):
            LOCK.unlink(missing_ok=True)
    NEUTRAL.mkdir(parents=True, exist_ok=True)
    env = {**os.environ, "MARTY_MEMORY_PASS": "1"}
    with open(LOG, "a", encoding="utf-8") as out:
        subprocess.Popen(
            [sys.executable, str(Path(__file__).resolve()), "--worker", tp],
            env=env, cwd=str(NEUTRAL), stdout=out, stderr=out,
            start_new_session=True,
        )
    sys.exit(0)


def write_gate_settings():
    """Register the PreToolUse write gate for the neutral-cwd headless run.
    Refreshed every pass so the gate path stays correct if the repo moves."""
    cfg_dir = NEUTRAL / ".claude"
    cfg_dir.mkdir(parents=True, exist_ok=True)
    settings = {"hooks": {"PreToolUse": [{
        "matcher": "Write|Edit",
        "hooks": [{"type": "command",
                   "command": f'python3 "{GATE}"',
                   "timeout": 10}],
    }]}}
    (cfg_dir / "settings.json").write_text(json.dumps(settings, indent=2), encoding="utf-8")


def worker(transcript_path: str):
    LOCK.write_text(str(os.getpid()))
    try:
        user, assistant, note = extract_last_exchange(Path(transcript_path))
        if user is None:
            log(f"skip: {note}")
            return
        if len(user.strip()) < 30 and len(assistant.strip()) < 200:
            log("skip: trivial exchange")
            return
        today = datetime.date.today().isoformat()
        prompt = PROMPT_TEMPLATE.format(repo=REPO, today=today, user=user, assistant=assistant)
        claude_bin = shutil.which("claude") or str(Path.home() / ".claude" / "local" / "claude")
        if not Path(claude_bin).exists():
            log("error: claude binary not found")
            return
        write_gate_settings()
        cmd = [
            claude_bin, "-p", prompt,
            "--model", setting("memory_pass_model", "claude-haiku-4-5"),
            "--allowedTools", "Read,Grep,Glob,Edit,Write",
            "--permission-mode", "acceptEdits",
            "--add-dir", str(REPO),
            "--max-turns", "12",
        ]
        if os.environ.get("MARTY_MEMORY_DRYRUN"):
            log(f"dry-run: exchange u={len(user)}c a={len(assistant)}c | gate settings "
                f"written | would run {Path(claude_bin).name} -p (prompt {len(prompt)}c, "
                f"model {cmd[4]})")
            return
        t0 = datetime.datetime.now()
        try:
            res = subprocess.run(cmd, capture_output=True, text=True, timeout=420,
                                 cwd=str(NEUTRAL))
        except subprocess.TimeoutExpired:
            log("error: headless pass timed out (420s)")
            return
        dur = int((datetime.datetime.now() - t0).total_seconds())
        out_lines = [l for l in res.stdout.strip().splitlines() if l.strip()]
        summary = next((l for l in reversed(out_lines) if l.startswith("WRITES:")),
                       (out_lines[-1][:150] if out_lines else f"rc={res.returncode}"))
        if res.returncode != 0:
            err = res.stderr.strip().splitlines()
            summary += f" | stderr: {err[-1][:120]}" if err else ""
        log(f"pass done rc={res.returncode} {dur}s | {summary[:250]}")
    finally:
        LOCK.unlink(missing_ok=True)


if __name__ == "__main__":
    if len(sys.argv) >= 3 and sys.argv[1] == "--worker":
        worker(sys.argv[2])
    else:
        entry()
