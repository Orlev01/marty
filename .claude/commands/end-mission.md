A mission is ending. Execute the end-of-mission handoff protocol from `core/mission-structure.md`.

If the user specified a mission name, use that. If not, check `core/active-config.md` for active missions. If there is only one, use it. If there are multiple, ask which mission is ending.

## Handoff Protocol

Read the full mission folder before starting.

1. **Reflect on the mission.** What happened? Did it hit success criteria or trigger kill criteria? What was the arc? Summarise this to [client] and confirm the framing before proceeding.

2. **Extract behavioural learnings about [client].** Review the mission's decisions, threads, and context for patterns — growth, regressions, value tests, decision-making patterns observed during this mission. Write these to `memory/me.md` with the date and mission reference.

3. **Promote persistent decisions.** Review the mission's `decisions.md`. Any decision that has lasting relevance beyond this mission gets copied to `memory/decisions.md`. Ask [client] if you're unsure whether a decision is persistent.

4. **Promote persistent threads.** Review the mission's `open-threads.md`. Any thread that outlives the mission gets moved to `memory/open-threads.md`. Ask [client] if you're unsure.

5. **Promote persistent people.** If the mission has a `stakeholders/` directory with mission-bound people files, check whether any of those relationships have become ongoing. If yes, move the file to `people/`. If all stakeholders were already in `people/`, skip this step.

6. **Move the mission folder** to `missions/_archive/{mission-name}/`.

7. **Update `core/active-config.md`** to remove the mission from the active list.

8. **Confirm completion.** Tell [client] what was promoted to persistent memory, what was archived, and what the current active mission state looks like.
