Process a meeting transcript into the right mission: route it, classify it, save the raw, write the analysis, and update that mission's threads and people. Mission-agnostic; a mission's own classification taxonomy, signals, and post-steps live in its `config/process-transcript.md`. Run: `/process-transcript [mission]`.

## Step 1 — Locate the transcript
Find the most recent transcript in the conversation. If none, ask [client] to paste one. Extract participants, date, approximate duration.

## Step 2 — Route to a mission
- If `[mission]` is given, use it.
- Else read `core/active-config.md`. One active mission → use it (sanity-check the transcript actually fits; if it clearly doesn't, flag it). More than one active → **infer**: for each active mission, score the transcript's participants and topic against that mission's `knowledge-map.md` trigger words and its stakeholders (`people/index.md` + the mission's `stakeholders/` + champions). Pick the best match, **state which mission and why, and confirm before writing**. A tie or low confidence → ask.
- If it fits no active mission, say so and ask (new mission, or out of scope).

## Step 3 — Load routed-mission context
Read: `people/index.md` (and each participant's file if it exists), `missions/{m}/memory/open-threads.md` (Active), `missions/{m}/knowledge-map.md`, and **`missions/{m}/config/process-transcript.md` if it exists** — the mission's type taxonomy, question sets, signal taxonomy, and post-steps. No extension → use the base behaviour below.

## Step 4 — Classify the type
Base types (mission-agnostic): `1on1`, `group`, `build` (technical/working session), `discovery` (first substantive meeting with a new stakeholder), `advisory`, `external`. If the mission extension defines its own taxonomy and filename prefixes, use those instead.

## Step 5 — Extract the universal buckets (every transcript)
1. **State impact** — did anything shift the mission's goal, a timeline, a priority, a milestone?
2. **Value / ROI signals** — evidence of value; quote numbers when given.
3. **Blockers** — what is actually preventing progress, named precisely.
4. **Wins / solutions** — what's working, built, shipped; worth replicating.
5. **People intelligence** — how each person thinks, what they care about or fear, how the relationship with [client] is evolving.
6. **Actions and decisions** — who does what by when; what was settled (decisions) vs to-do (actions).
If a bucket is empty, write "Nothing surfaced."

## Step 6 — Type-specific additions
If the mission extension defines type-specific extraction (e.g. exec positions for a leadership sync, readiness scores + question-set mapping for a discovery), apply them. Otherwise skip.

## Step 7 — Save the raw transcript (deterministic — no model tokens)
Save it exactly as provided to `missions/{m}/transcripts/{type}-{label}-{date}.md` (same base name as the analysis) via `tools/save_transcript.py`. Never retype transcript text through the model.

- Transcript exists as a file → `python3 tools/save_transcript.py --from-file {src} {dest}`
- Transcript was pasted into the conversation → `python3 tools/save_transcript.py --from-session {dest} --anchor-start "{first ~8 words, verbatim}" --anchor-end "{last ~8 words, verbatim}"` — the script pulls the paste straight from the session .jsonl and saves the slice between the anchors inclusive.

The script prints byte count + first/last 80 chars: check they match the transcript's real start and end before moving on. Script fails or verification looks wrong → fall back to writing the file directly and say so. Create `transcripts/` if it doesn't exist. Gitignored and local-only — may contain sensitive content; never sync or share it, and redact identifying details if it ever leaves the machine.

## Step 8 — Write the analysis
`missions/{m}/outreach/{type}-{label}-{date}.md` (label = lastname / firstname / topic; the mission extension may override type→prefix mappings). Write only sections that have content. Structure:
```
# {Type}: {Name(s)} — {Date}
## Meeting Metadata      [participants, date, duration. **Source transcript:** `transcripts/{type}-{label}-{date}.md`]
## Conversation Tone     [one paragraph]
## [universal buckets with content]
## [type-specific sections with content]
## Immediate Follow-ups  [who / what / by when]
## Key Quotes            [verbatim, weight-bearing]
```

## Step 9 — Update people files
For each participant with a `people/` file, update only what changed: relationship to [client], cares/fears, stakeholder positions, how-to-engage, dated data points. A new significant person → create a file + update `people/index.md`.

## Step 10 — Update the mission's open-threads
**Meetings are NOT threads.** Route each live follow-up into the workstream thread it belongs to (bold-marked, with owner). If none fits and a real workstream has emerged, create a thread named for the work (respect the 15-active cap). Add one Closed one-liner for the meeting. Sync `knowledge-map.md` on any thread add/rename/merge/close.

## Step 11 — Mission extensions (post-steps)
If `config/process-transcript.md` defines post-steps (e.g. signal-log extraction), run them following that file. Otherwise skip.

## Step 12 — Confirm
Tell [client] which mission it filed under, what was written and where, and the one or two things that actually matter. Name any action [client] must take.

## Principles
- Extract what was said, not what should have been. Empty bucket → one word.
- People intelligence is often the most valuable output; a quote that reveals how someone thinks beats a list of actions.
- ROI signals decay fast — capture them with dates and numbers.
- The outreach file is a record meant to be useful six months from now, not a form to demonstrate thoroughness.
