# config/ — per-mission command extensions

Some Marty commands accept a per-mission extension file here, named after the command.
No file → the command's generic base behaviour. These are optional; delete this
directory if the mission doesn't need them.

## `marty-sitrep.md`

Customises how `/marty-sitrep` groups and sources actions for this mission.

```markdown
# Sitrep config

## Groups
Bucket actions into these groups (in order), per the rules below:
- {Group A} — {what belongs here}
- {Group B} — {what belongs here}

## Extra action sources
Besides open-threads bold markers, also scan:
- {file or artifact} — {what counts as an action there}
```

## `marty-process-transcript.md`

Gives `/marty-process-transcript` this mission's own classification taxonomy,
question sets, signals, and post-steps.

```markdown
# Transcript-processing config

## Types
{type-id} — {when a transcript is this type; filename prefix if different}

## Type-specific extraction
For `{type-id}` transcripts, additionally extract:
- {section name} — {what to pull}

## Post-steps
After the analysis is written:
1. {e.g. append value/ROI signals to a signal log artifact}
```
