Re-read mutable state from disk to pick up changes made by parallel sessions.

## When to use

- [client] says "sync" or asks Marty to catch up on what another session changed
- Marty is about to reference open threads, decisions, or mission state and [client] has mentioned working with another Marty
- [client] switches back to this session after working in a parallel one

**Pair with `/update`:** If the other session advanced state in conversation but didn't write to disk, run `/update` there first — otherwise there's nothing new for `/sync` to find.

## Protocol

1. **Re-read state files.** Read all of these from disk (parallel reads):

   **Persistent layer:**
   - `memory/open-threads.md`
   - `memory/decisions.md`
   - `memory/me.md`

   **Active mission(s)** — read `core/active-config.md`, then for EACH active mission its:
   - `missions/{mission}/memory/open-threads.md`
   - `missions/{mission}/memory/decisions.md`

2. **Treat the fresh reads as current truth.** Anything that differs from what was loaded at session start — the fresh read wins. Do not average, merge, or reconcile. Disk is authoritative.

3. **Report what changed.** Compare against what you loaded at session start and list changes, one line each. Focus on state transitions that matter: threads opened/closed/advanced, decisions made. Skip formatting-only or trivial differences.

4. **If nothing changed**, say "State is current — nothing changed since session start."

5. **Do not write anything.** This is a read-only operation. No memory writes, no file edits.
