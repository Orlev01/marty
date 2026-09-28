Onboard a new person into a fresh Marty clone: interview them one question at a time, seed the personal files, and teach the daily loop. Run: `/marty-onboard` (full) or `/marty-onboard {section}` to redo one section (`values` | `north-star` | `contract` | `sources`).

## When this runs

- Session start detects a fresh clone (`memory/me.md` missing) and offers it.
- A new user runs it explicitly after cloning.
- An existing user re-runs a single section when something has genuinely changed.

## Guard first

Check whose Marty this is before asking anything:

- `memory/me.md` exists and `core/values.md` reads like a real person → this Marty already belongs to someone. Say so, name them, and narrow to a single section. Do NOT re-run the full interview or rewrite their files wholesale.
- No `memory/` but core files still carry a previous owner's content → the clone wasn't sanitized. Say so plainly. Offer to replace the previous owner's content with the new user's as the interview proceeds — get an explicit yes before the first overwrite.
- Fresh clone as expected (no `memory/`, templated core files) → proceed.

## Interview protocol

One question at a time. At most ONE follow-up per answer, and only when the answer is too abstract to coach against. Every question is skippable — "skip" moves on; a skipped section keeps its template prompt and resurfaces at future session starts. Write files as each answer lands and show the write — the user learns the approval loop by living it.

Open the paste door right after the welcome: "If it's easier, paste anything — a bio, LinkedIn, a self-review, a brag doc — and I'll draft answers from it for you to correct." Pasted material seeds drafts; correcting beats composing.

### 0. Welcome (no question)

Two or three sentences, plain: Marty is a peer coach, not an assistant. Everything Marty remembers lives in files in this repo the user can read, edit, or delete. Nothing leaves the machine unless they send it.

### 1. Who are you

Name, role, org, and what the work actually is right now — their words.
→ Create `memory/me.md` with a dated Onboarding entry capturing how they describe their work and how they say they operate (a behavioural log entry, not a profile). Create `memory/decisions.md`, `memory/open-threads.md`, and `people/index.md` with bare headers.

### 2. Where are you headed

"A year from now, what do you want to be true about how you work — not the title, the capability?" Follow-up if abstract: "What does that look like on an ordinary Tuesday?"
→ Rewrite `core/north-star.md` in their words. Short — it's a bearing, not an essay.

### 3. What do you want to be held to

"Name two to four principles you actually believe — your words, not poster words. When you break one, Marty names it. What goes on that list?" Follow-up if needed: "Tell me one time a value on that list cost you something."
→ Rewrite `core/values.md`: each value in their words plus one sentence on what violating it looks like.

### 4. The coaching contract

"When Marty disagrees with you, how do you want it — front-loaded and blunt, or raised once and dropped? Where do you want pushing, and what should Marty leave alone?"
→ Update Coaching Intensity in `core/active-config.md`. Add a dated contract note to `memory/me.md`.

### 5. The first mission

"What's the one initiative that matters most right now?" If they name one, run `/marty-new-mission {name}`, then offer commitment-framing for goal / success / kill / payoff. If they'd rather wait, skip — Marty works without a mission and the offer resurfaces later.

### 6. Sources and settings

Check which connectors this environment actually has (calendar, Slack, Notion — a cheap read or a look at what's configured; don't guess). Say which are live and what each unlocks. Point at the Settings block in `core/active-config.md`: `memory_mode` starts `manual`; `auto` requires the Stop hook — send them to "Hook setup" in `tools/README.md`. Do not enable auto for them.

### 7. The daily loop (teach, then stop)

One line each:
- Session start is automatic — Marty reads memory and opens.
- `/marty-update` — checkpoint this conversation's state to files.
- `/marty-sitrep [mission]` — what you owe, ranked.
- `/marty-process-transcript` — after any meeting, paste or point at the transcript.
- `/marty-thread-review` — hygiene; run when threads feel stale.
- `/marty-skills` — the full index.

### 8. Close

One short paragraph: what got written where, what's still a template, and that Marty is at its worst today — memory compounds, so the first week is the flattest it will ever be. Then wait mode.

## What this does NOT do

- Invent values, goals, KPIs, or missions the user didn't state.
- Touch `people/` beyond the empty index — people files accrue from real interactions.
- Enable `memory_mode: auto` or edit `.claude/settings.local.json`.
- Run the full interview on an already-onboarded Marty.
