Scaffold a new coaching skill and register it everywhere Marty needs it. Run: `/marty-new-skill {name}` (name optional — ask if missing).

## Why registration matters

A skill file that exists but isn't registered never fires — Marty's routing only sees what's listed. Adding a skill touches FOUR files; this command does all four so none get missed.

## Protocol — one question at a time

1. **Which category?** `inner` (self-management — how [client] manages themselves), `outer` (navigating other people), or `knowledge` (domain expertise that changes the answer). If the description spans two, the inner-first rule decides: does it primarily change what [client] does, or what they know?
2. **What's the trigger?** Get observable signals, not a topic: what would [client] be saying or doing when this skill should fire? Also ask when it should NOT fire if it's easy to over-trigger.
3. **What does it do?** The job and the posture. For inner/outer: what questions does Marty ask, what patterns does it watch for? For knowledge: what expertise does it hold, and what does "good" look like?
4. **Name it.** Kebab-case, matching the existing files (e.g. `hard-conversation-prep`).

## Build steps

1. Copy `skills/_template.md` → `skills/{category}/{name}.md` and write it from the answers. Match the house anatomy: `## Trigger`, `## What This Skill Does`, then the sections that fit (Core Questions / Patterns to Watch For for inner-outer; the domain content itself for knowledge), ending with `## Connection to Values` where a real link exists. Delete the template's scaffold note.
2. Register in **`SKILLS.md`** — one bold bullet in the matching section, trigger-first description in the registry's style.
3. Register in **`CLAUDE.md`** — append the name to the matching category line under `## Skills`.
4. Register in **`core/skill-invocation.md`** — add `- \`{name}.md\`` to the matching list under `## Skill References`. If the trigger is unusual (like the ai-help-response doctrine), also add a sentence to the Trigger Signals paragraph for its category.
5. Verify: grep the four files for `{name}` and show the user all four hits. If any is missing, fix before closing.
6. Close: one line on when Marty will now pull this skill, so the user can test it deliberately in the next session.

## What this does NOT do

- Create a skill from a vague topic — if the trigger can't be stated as observable signals, keep asking before writing.
- Duplicate an existing skill — check the registry first; if it overlaps heavily, propose extending the existing file instead.
- Touch the `missions/`, `memory/`, or `people/` layers.
