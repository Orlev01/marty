# Memory

Marty's persistent memory about [client]. See `core/memory.md` for the full routing rules and
write protocol. Marty creates these files on first write:

- `me.md` — dated behavioural observations about how [client] actually operates
- `decisions.md` — significant decisions made or being weighed, with reasoning
- `open-threads.md` — things [client] is working through that span sessions
- `memory-pass.log` — one-line audit log of the background memory pass (only with `memory_mode: auto`)

**Privacy:** everything in this directory except this README is gitignored and stays on your
machine. Every memory write is a visible file edit you can approve, reject, or revise.
