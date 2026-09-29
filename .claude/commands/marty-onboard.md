Onboard a new person into a fresh Marty clone: interview them one question at a time, seed the personal files, walk the default settings, and teach the daily loop. Run: `/marty-onboard` (full) or `/marty-onboard {section}` to redo one section (`values` | `north-star` | `contract` | `sources` | `settings`).

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

### 6. Sources

Check which connectors this environment actually has (calendar, Slack, Notion — a cheap read or a look at what's configured; don't guess). Say which are live and what each unlocks. If they want sources registered, seed `sources.md` (persistent) or the mission's `sources/registry.md` with what they name.

### 7. Settings, one at a time

Walk the Settings block in `core/active-config.md` one setting at a time. For each: explain what it does and the trade-off in two or three plain sentences, ask on or off, and apply their choice as a visible file edit. Skipping keeps the default. Never present the settings as a wall of options — one decision per turn.

**`memory_mode` (default `manual`).** The background memory pass: after each exchange, a Stop hook detaches a cheap-model pass that applies the memory routing rules out-of-band — the live conversation never waits on it. It is hard-gated by code, not just prompts: it can only touch the five memory files, append-only, at most 3 edits per pass, and every run logs one line to `memory/memory-pass.log`, which session start surfaces. Most people who try it keep it — nothing memory-worthy slips because a conversation moved fast. Cost: one small model call per exchange; requires the `claude` CLI on PATH. If they want it on, show them BOTH edits before making either — the Stop hook added to `.claude/settings.local.json` (exact JSON in "Hook setup" in `tools/README.md`) and `memory_mode: auto` — and get an explicit yes for each. Tell them the off-switch is one line: `memory_mode: manual`.

**`memory_pass_model` (default `claude-haiku-4-5`).** Only raise this if they turned auto on: the pass runs on a cheap fast model by default; leave it unless they have a reason to change.

**`calendar_at_session_start` (default `on`).** At session start Marty glances at today's calendar to shape the opening ("you've got [stakeholder] in 90 minutes — want to prep?"). Only does anything if a calendar MCP connector is live (reference what section 6 found). If they have no connector or don't want it, set `off`.

### 8. The daily loop (teach, then stop)

The habit that makes Marty compound. One line each — what it does AND when to reach for it:

- Session start is automatic — Marty reads memory and opens.
- `/marty-update` — flushes this conversation's unwritten state to disk. Reach for it before stepping away, before opening a parallel session, or right after a decision lands mid-conversation. This is the one to actually build a habit around: anything that lives only in the chat is lost when the chat ends.
- `/marty-status [mission]` — what you owe, ranked, and who's waiting on whom. Start of a working block, or two minutes before a 1:1.
- `/marty-process-transcript` — right after any meeting: paste or point at the transcript and Marty files it.
- `/marty-end-session` — the deliberate memory write before closing a session with real content in it. Matters most when `memory_mode` is `manual` — it's the main way things get remembered.
- `/marty-thread-review` — hygiene pass; run it when open-threads starts feeling stale or bloated, roughly weekly.
- `/marty-skills` — the full index of skills and commands.

### 9. Power tools (mention, don't demo)

One breath each, then move on:

- **Console** (`console/`) — an optional visual project tracker: schema-driven records (tasks, blockers, risks, decisions...) with a web view, where each schema field carries an AI instruction so Marty knows how to maintain the data. Its Sources tab is a read-only mirror of the source registries from section 6. Needs Node: `cd console && npm install && npm run serve`, then http://localhost:8244. Point at `console/CLAUDE.md`; suggest it once they have a mission with real moving parts, not before.
- **Agent-bus** (`tools/agent-bus/`) — two Claude Code agents holding a live peer conversation over a file bus: `/marty-initiator` opens it, `/marty-reactor` joins from a second terminal, `/marty-end-comms` closes it and saves the transcript. Useful when they want a plan debated from two independent postures or a decision red-teamed by an agent that doesn't share this session's assumptions. Experimental; point at `tools/agent-bus/README.md` and let them come back to it when a real use shows up.

### 10. Close

One short paragraph: what got written where, which settings they chose, what's still a template, and that Marty is at its worst today — memory compounds, so the first week is the flattest it will ever be. Then wait mode.

## What this does NOT do

- Invent values, goals, KPIs, or missions the user didn't state.
- Touch `people/` beyond the empty index — people files accrue from real interactions.
- Change a setting or edit `.claude/settings.local.json` without an explicit yes to that specific edit — a skipped question means the default stands.
- Run the full interview on an already-onboarded Marty.
