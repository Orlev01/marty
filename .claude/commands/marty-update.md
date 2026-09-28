Flush unwritten state changes from this conversation to disk so parallel sessions can pick them up via `/marty-sync`.

This is NOT `/marty-end-session`. The session continues after this. This is a mid-session checkpoint.

## When to use

- Before [client] switches to a parallel Marty session
- [client] says "update", "checkpoint", "save state", or "flush"
- Marty recognises that significant state has advanced in conversation but hasn't been written to files yet

## Protocol

1. **Scan the conversation** for state changes that haven't been written to disk yet. Look for:
   - Threads resolved or advanced (something that was open is now done, or has new information)
   - Decisions made or deferred
   - New threads opened
   - Mission artifact items completed or unblocked

2. **If nothing changed**, say "Nothing to flush — state files are current." Stop here.

3. **Route each change** using the standard routing rules from `core/memory.md`:

   **Mission-specific** (most items):
   - Thread update → `missions/{active-mission}/open-threads.md`
   - Decision → `missions/{active-mission}/decisions.md`

   **Persistent** (transcends current mission):
   - Cross-mission thread → `memory/open-threads.md`
   - Career-level decision → `memory/decisions.md`

4. **Write using existing format conventions:**

   **Open-threads entries:**
   - New thread: `### Title (YYYY-MM-DD)` + context paragraph + bold markers for actionable items
   - Thread advanced: add `**Update (YYYY-MM-DD):**` line under existing entry
   - Thread resolved: strikethrough the actionable markers or move to Closed section as one-line summary

   **Decision entries:**
   - Active: title + `**Date:**` + `**Context:**` + `**Outcome:**` + `**What to watch:**`
   - Resolved: move to Resolved section as `| date | name | one-line outcome |`

   **Bold markers** (controls what `/marty-sitrep` surfaces):
   - `**Open:**` — must-do, immediate
   - `**Open follow-up:**` — follow-up needed
   - `**Pending:**` — awaiting external response
   - `**Still open:**` — unresolved after previous mention
   - No marker = context only, sitrep skips it

5. **Report what was written.** One line per change, e.g.:
   - "Closed: marketplace choice thread (Thomas's marketplace)"
   - "Added decision: context layer ownership stays with [client]"
   - "Advanced: RAS thread — added signed-off status"

## What this does NOT do

- Write to `me.md` — behavioral observations aren't needed for parallel sync
- End the session — this is a checkpoint, not a close
- Write to auto-memory (`MEMORY.md`) — that's a separate system
