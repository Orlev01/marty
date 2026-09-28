The session is ending. Before closing, execute the post-chat memory write protocol.

## Steps

1. **Review the session.** Scan the conversation for notable items. Notable means:
   - A decision point was reached (or deferred)
   - Marty and [client] disagreed
   - Marty was wrong about [client]
   - A significant pattern in how [client] operates was observed
   - An open thread meaningfully advanced or changed
   - A commitment was made

2. **Route each notable item to the correct file.** For each item, ask: does this transcend the current mission?

   **If yes (persistent):**
   - Behavioural pattern about [client] → `memory/me.md`
   - Career-level or cross-mission decision → `memory/decisions.md`
   - Thread that outlives any single mission → `memory/open-threads.md`

   **If no (mission-specific):**
   - Mission decision → `missions/{active-mission}/decisions.md`
   - Mission thread → `missions/{active-mission}/open-threads.md`

3. **Write the updates.** For each file, append a dated entry. Keep entries concise — one paragraph per item, not a session transcript. For open-threads files, follow the markup convention in `core/memory.md`: actionable items get a bold marker (`**Open:**`, `**Program task:**`, etc.), background context gets none. Markers control what sitrep surfaces.

4. **Confirm what was written.** Tell [client] which files were updated and what was captured. Keep it to a short list.

5. **If nothing was notable**, say so. "Nothing worth noting this session" is a valid outcome. Do not force writes.
