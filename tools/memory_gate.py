#!/usr/bin/env python3
"""PreToolUse gate for the Marty background memory pass.

Code-enforced version of the promises in memory_pass.py's prompt (ported from
Deny by default: judge every write before it
runs). Registered by memory_pass.py in
~/.claude/marty-memory-pass/.claude/settings.json — it gates ONLY the headless
memory pass (which runs from that cwd), never live Marty sessions.

Protocol: hook JSON on stdin; exit 0 allows the tool call, exit 2 blocks it
and feeds stderr back to the model.

Policy:
- Only Write/Edit are judged (the hook matcher filters; the script re-checks).
- Target must resolve (symlinks followed, traversal collapsed) to one of:
    <repo>/memory/{me,decisions,open-threads}.md
    <repo>/missions/<existing mission>/memory/{open-threads,decisions}.md
  Missions starting with "_" (_template, _archive) are excluded.
- Edit: old_string must be non-empty and contained in new_string —
  append/extend only, deletion impossible.
- Write: existing file content must be a prefix of the new content (pure
  append); creating a missing file inside the allowlist is allowed.
- At most 3 allowed edits per session (counter keyed by hook session_id).
- Malformed input, missing fields, paths outside the repo: deny (fail closed).

Self-test: python3 tools/memory_gate.py --self-test
"""
import json
import os
import sys
import time
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
STATE_DIR = Path.home() / ".claude" / "marty-memory-pass" / "gate-state"
PERSISTENT = {"me.md", "decisions.md", "open-threads.md"}
MISSION_FILES = {"open-threads.md", "decisions.md"}
MAX_EDITS = 3


def resolve_target(raw: str, cwd: str) -> Path | None:
    try:
        p = Path(raw)
        if not p.is_absolute():
            p = Path(cwd or ".") / p
        return p.resolve()
    except OSError:
        return None


def path_allowed(target: Path) -> tuple[bool, str]:
    try:
        rel = target.relative_to(REPO)
    except ValueError:
        return False, f"outside the Marty repo: {target}"
    parts = rel.parts
    if parts[:1] == ("memory",) and len(parts) == 2 and parts[1] in PERSISTENT:
        return True, ""
    if (len(parts) == 4 and parts[0] == "missions" and parts[2] == "memory"
            and parts[3] in MISSION_FILES and not parts[1].startswith("_")
            and (REPO / "missions" / parts[1]).is_dir()):
        return True, ""
    return False, (f"not an allowed memory file: {rel}. Allowed: memory/"
                   f"{{me,decisions,open-threads}}.md or missions/<mission>/memory/"
                   f"{{open-threads,decisions}}.md")


def judge(data: dict) -> tuple[bool, str]:
    """Policy only (no counter). Returns (allow, reason-if-denied)."""
    tool = data.get("tool_name")
    if tool not in ("Write", "Edit"):
        return True, ""
    ti = data.get("tool_input") or {}
    raw = ti.get("file_path")
    if not raw:
        return False, "no file_path in tool input"
    target = resolve_target(raw, data.get("cwd", ""))
    if target is None:
        return False, f"unresolvable path: {raw}"
    ok, why = path_allowed(target)
    if not ok:
        return False, why

    if tool == "Edit":
        old, new = ti.get("old_string") or "", ti.get("new_string") or ""
        if not old:
            return False, "Edit with empty old_string is not allowed"
        if old not in new:
            return False, ("append-only violation: old_string must be contained in "
                           "new_string (extend entries, never delete or rewrite them)")
        return True, ""

    # Write
    new = ti.get("content")
    if new is None:
        return False, "Write with no content"
    if target.exists():
        try:
            existing = target.read_text(encoding="utf-8")
        except OSError as e:
            return False, f"cannot read existing file to verify append: {e}"
        if not new.startswith(existing):
            return False, ("append-only violation: Write must keep the existing file "
                           "as an exact prefix of the new content. Use Edit to extend "
                           "an entry instead")
    return True, ""


def check_and_count(session_id: str) -> bool:
    """True if this (allowed) edit is within the per-session cap; increments."""
    STATE_DIR.mkdir(parents=True, exist_ok=True)
    now = time.time()
    for f in STATE_DIR.glob("*.count"):
        try:
            if now - f.stat().st_mtime > 2 * 86400:
                f.unlink()
        except OSError:
            pass
    fp = STATE_DIR / f"{session_id or 'unknown'}.count"
    try:
        n = int(fp.read_text().strip())
    except (OSError, ValueError):
        n = 0
    if n >= MAX_EDITS:
        return False
    fp.write_text(str(n + 1))
    return True


def main():
    try:
        data = json.load(sys.stdin)
    except Exception:
        print("memory gate: unparsable hook input — denied (fail closed)", file=sys.stderr)
        sys.exit(2)
    allow, reason = judge(data)
    if not allow:
        print(f"memory gate denied: {reason}. Do not retry this edit verbatim — "
              f"fix the violation or finish with NO-WRITE.", file=sys.stderr)
        sys.exit(2)
    if data.get("tool_name") in ("Write", "Edit"):
        if not check_and_count(data.get("session_id", "")):
            print(f"memory gate denied: per-pass edit cap reached ({MAX_EDITS}). "
                  f"Finish with your WRITES summary now.", file=sys.stderr)
            sys.exit(2)
    sys.exit(0)


def self_test():
    import subprocess
    import uuid
    passed = failed = 0

    def check(name, got, want):
        nonlocal passed, failed
        ok = got == want
        passed += ok
        failed += not ok
        print(f"{'PASS' if ok else 'FAIL'}  {name}  (got {got!r}, want {want!r})")

    mem = str(REPO / "memory" / "open-threads.md")
    core = str(REPO / "core" / "values.md")
    trav = str(REPO / "memory" / ".." / "core" / "values.md")
    missions = [p.parent.parent.name for p in REPO.glob("missions/*/memory/open-threads.md")
                if not p.parent.parent.name.startswith("_")]
    mission_ok = str(REPO / "missions" / missions[0] / "memory" / "open-threads.md") if missions else None

    def j(tool, **ti):
        return judge({"tool_name": tool, "tool_input": ti, "cwd": str(REPO), "session_id": "t"})[0]

    check("edit append allowed", j("Edit", file_path=mem, old_string="## Active", new_string="## Active\nnew"), True)
    check("edit deletion denied", j("Edit", file_path=mem, old_string="## Active", new_string="## Gone"), False)
    check("edit empty old denied", j("Edit", file_path=mem, old_string="", new_string="x"), False)
    check("edit outside allowlist denied", j("Edit", file_path=core, old_string="a", new_string="ab"), False)
    check("traversal denied", j("Edit", file_path=trav, old_string="a", new_string="ab"), False)
    check("write to CLAUDE.md denied", j("Write", file_path=str(REPO / "CLAUDE.md"), content="x"), False)
    existing = (REPO / "memory" / "decisions.md").read_text(encoding="utf-8")
    check("write pure append allowed", j("Write", file_path=str(REPO / "memory" / "decisions.md"), content=existing + "\nx"), True)
    check("write rewrite denied", j("Write", file_path=str(REPO / "memory" / "decisions.md"), content="hijacked"), False)
    check("write new file in allowlist allowed", j("Write", file_path=str(REPO / "memory" / "me.md") if not (REPO / "memory" / "me.md").exists() else mem, content=((REPO / "memory" / "open-threads.md").read_text(encoding="utf-8") + "y")), True)
    if mission_ok:
        check("mission memory allowed", j("Edit", file_path=mission_ok, old_string="#", new_string="##"), True)
    check("nonexistent mission denied", j("Edit", file_path=str(REPO / "missions" / "nope" / "memory" / "open-threads.md"), old_string="a", new_string="ab"), False)
    check("template mission denied", j("Edit", file_path=str(REPO / "missions" / "_template" / "memory" / "open-threads.md"), old_string="a", new_string="ab"), False)
    check("read tool passes through", j("Read", file_path=core), True)
    check("no file_path denied", judge({"tool_name": "Write", "tool_input": {}, "cwd": ""})[0], False)

    sid = f"selftest-{uuid.uuid4().hex[:8]}"
    counts = [check_and_count(sid) for _ in range(4)]
    check("edit cap 3-then-deny", counts, [True, True, True, False])
    (STATE_DIR / f"{sid}.count").unlink(missing_ok=True)

    def rt(payload):
        r = subprocess.run([sys.executable, __file__], input=json.dumps(payload),
                           capture_output=True, text=True)
        return r.returncode, r.stderr
    rc, err = rt({"tool_name": "Write", "tool_input": {"file_path": core, "content": "x"}, "cwd": "", "session_id": "rt"})
    check("subprocess deny rc", rc, 2)
    check("subprocess deny has reason", bool(err.strip()), True)
    rc, _ = rt({"tool_name": "Read", "tool_input": {"file_path": core}, "cwd": ""})
    check("subprocess allow rc", rc, 0)
    r = subprocess.run([sys.executable, __file__], input="not json", capture_output=True, text=True)
    check("subprocess unparsable fails closed", r.returncode, 2)

    print(f"\n{passed} passed, {failed} failed")
    sys.exit(1 if failed else 0)


if __name__ == "__main__":
    if "--self-test" in sys.argv:
        self_test()
    else:
        main()
