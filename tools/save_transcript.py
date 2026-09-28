#!/usr/bin/env python3
"""Deterministic transcript saver for /marty-process-transcript.

No model tokens are spent copying transcript text. Two modes:

  --from-file SRC DEST
      Verbatim copy of SRC to DEST.

  --from-session DEST [--anchor-start TEXT] [--anchor-end TEXT] [--session PATH]
      Extract a transcript that was PASTED into the current Claude Code
      conversation, straight from the session .jsonl on disk, and write it
      verbatim to DEST. Selection: the most recent user message containing
      both anchors (short verbatim snippets from the transcript's start and
      end); with anchors the slice between them (inclusive) is saved, so the
      user's framing words around the paste are trimmed. With no anchors, the
      longest user message in the session is saved whole.

Both modes print a verification block: byte count + first/last 80 chars.
The caller (Marty) checks it against the real transcript; on any mismatch,
fall back to a manual save.
"""
import argparse
import json
import re
import shutil
import sys
from pathlib import Path

META_PREFIXES = (
    "Caveat:", "<command-name>", "<local-command", "<system-reminder>",
    "[SYSTEM NOTIFICATION", "<task-notification>",
)


def project_dir_for_cwd(cwd: Path) -> Path:
    munged = re.sub(r"[/.]", "-", str(cwd))
    return Path.home() / ".claude" / "projects" / munged


def recent_session_jsonls(cwd: Path):
    """Newest-first recent session files. With parallel sessions, mtime alone
    can't identify "this" conversation — callers with anchors search all of
    these; callers without anchors get only the newest."""
    proj = project_dir_for_cwd(cwd)
    files = sorted(proj.glob("*.jsonl"), key=lambda p: p.stat().st_mtime, reverse=True)
    if not files:
        sys.exit(f"error: no session .jsonl found under {proj}")
    return files[:10]


def user_texts(session_file: Path):
    """Yield (line_no, text) for real user-typed messages, in order."""
    with open(session_file, encoding="utf-8") as fh:
        for i, line in enumerate(fh):
            try:
                entry = json.loads(line)
            except json.JSONDecodeError:
                continue
            if entry.get("type") != "user" or entry.get("isMeta"):
                continue
            content = (entry.get("message") or {}).get("content")
            if isinstance(content, str):
                text = content
            elif isinstance(content, list):
                if any(isinstance(b, dict) and b.get("type") == "tool_result" for b in content):
                    continue
                text = "\n".join(
                    b.get("text", "") for b in content
                    if isinstance(b, dict) and b.get("type") == "text"
                )
            else:
                continue
            stripped = text.lstrip()
            if not stripped or stripped.startswith(META_PREFIXES):
                continue
            yield i, text


def verify_print(dest: Path):
    data = dest.read_text(encoding="utf-8")
    head = data[:80].replace("\n", "\\n")
    tail = data[-80:].replace("\n", "\\n")
    print(f"saved: {dest}")
    print(f"bytes: {len(data.encode('utf-8'))}  lines: {data.count(chr(10)) + 1}")
    print(f"first80: {head}")
    print(f"last80:  {tail}")


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--from-file", nargs=2, metavar=("SRC", "DEST"))
    ap.add_argument("--from-session", metavar="DEST")
    ap.add_argument("--anchor-start")
    ap.add_argument("--anchor-end")
    ap.add_argument("--session", help="explicit session .jsonl path (default: newest for cwd)")
    args = ap.parse_args()

    if args.from_file:
        src, dest = Path(args.from_file[0]), Path(args.from_file[1])
        if not src.is_file():
            sys.exit(f"error: source not found: {src}")
        dest.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(src, dest)
        verify_print(dest)
        return

    if not args.from_session:
        ap.error("one of --from-file / --from-session is required")

    candidates = [Path(args.session)] if args.session else recent_session_jsonls(Path.cwd())

    a_start, a_end = args.anchor_start, args.anchor_end
    if a_start and a_end:
        text = session = None
        for cand in candidates:
            hits = [t for _, t in user_texts(cand) if a_start in t and a_end in t]
            if hits:
                text, session = hits[-1], cand
                break
        if text is None:
            sys.exit(f"error: no user message in {len(candidates)} recent session file(s) "
                     "contains both anchors — check them (verbatim, incl. punctuation)")
        i = text.index(a_start)
        j = text.rindex(a_end) + len(a_end)
        if j <= i:
            sys.exit("error: anchor-end occurs before anchor-start in the matched message")
        payload = text[i:j]
    else:
        session = candidates[0]
        messages = list(user_texts(session))
        if not messages:
            sys.exit(f"error: no user messages found in {session}")
        payload = max((t for _, t in messages), key=len)

    dest = Path(args.from_session)
    dest.parent.mkdir(parents=True, exist_ok=True)
    dest.write_text(payload + ("\n" if not payload.endswith("\n") else ""), encoding="utf-8")
    print(f"session: {session}")
    verify_print(dest)


if __name__ == "__main__":
    main()
