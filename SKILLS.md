# Skills Registry

## inner

- **accountability** — [client] has committed to something — a deadline, a conversation, a deliverable, a behaviour change — and the follow-up is due. Also triggers when [client] is making excuses or externalising responsibility for something that's in their control.
- **action-and-ownership** — [client] is stuck in analysis, hedging, waiting for someone else to move first, or describing a problem without moving toward a decision.
- **commitment-framing** — [client] is about to commit to something significant — a role, a project, a deliverable, a deadline, a promise to a stakeholder. Also triggers when a mission is being defined or significantly modified.
- **failure-loop** — Something [client] committed to or attempted hasn't worked. A decision turned out to be wrong. A project failed. A conversation went badly. A risk materialised.
- **going-deep-on-why-watch** — [client] is analysing causes, motives, or reasons when the actual question on the table is "what do you do next." The analysis has decoupled from the decision it was meant to serve.
- **strategy-and-leverage** — [client] is deep in execution detail — doing the work rather than multiplying the work. Spending time on tasks that someone else could do, or that don't move the highest-priority needle.
- **technical-vs-strategic-watch** — [client] is engaging with technical detail in a situation where the strategic decision is the thing that needs their attention. Technical engagement is functioning as a substitute for strategic decision-making, not a foundation for it.

## outer

- **ai-help-response** — How [client] and the champion network respond when someone asks for help with AI: a permission, an access request, a "how do I", a "can Claude do X". This is the exec sponsor's doctrine. The instinct to guard against is the honest, correct, door-closing "no" — technically right, quietly fatal to enthusiasm.
- **hard-conversation-prep** — [client] has an upcoming conversation they're anticipating as difficult — performance feedback, negotiation, pushback to a senior stakeholder, conflict resolution, delivering bad news. Also triggers when [client] is avoiding a conversation they know they need to have.
- **humanizer** — A writing editor that identifies and removes signs of AI-generated text to make writing sound more natural and human, based on Wikipedia's "Signs of AI writing" page.
- **message-drafting** — [client] asks for help drafting a message — Slack, email, written follow-up. Or [client] describes a communication need and Marty judges that a draft would be useful.
- **sabotage-detection** — Organisational dysfunction patterns derived from the 1944 CIA *Simple Sabotage Field Manual*. The patterns are indistinguishable from everyday organisational dysfunction.
- **sabotage-self-audit** — The same CIA sabotage patterns from `sabotage-detection.md`, turned on [client]. Triggered only when there's already a sign [client] is stuck or avoiding something.
- **stakeholder-mapping** — [client] is navigating a situation involving multiple people with different interests — a rollout, a political decision, a reorg, a project with cross-functional dependencies.
- **stakeholder-operating-contract** — [client] is starting work with a new stakeholder, picking up new work for an existing one, or noticing an ongoing relationship has drifted out of calibration.
- **stop-slop** — Eliminate predictable AI writing patterns from prose.
- **voss-toolkit** — Negotiation and influence techniques from Chris Voss's *Never Split the Difference*, adapted for professional conversations.

## knowledge

- **ai-rollout-patterns** — [client] is planning, executing, or troubleshooting an internal AI adoption initiative. Questions like "how should we structure the rollout," "what does good look like for adoption programs," "why is adoption stalling in department X."
- **change-management-fundamentals** — [client] is driving a change initiative — rolling out new tools, changing ways of working, restructuring processes. Questions like "why is this team resisting," "how do I get buy-in from department heads."
- **internal-tooling-pm** — [client] is running or contributing to internal tooling work — platform features, developer experience, internal tools for employees. Questions like "how do I prioritise the platform backlog," "why is adoption low."
- **org-design-and-matrix** — [client] is operating in a matrix structure, navigating influence without authority, or trying to understand why organisational dynamics create friction.
- **regulated-healthcare-ai** — [client] is navigating AI deployment touching clinical data, patient information, healthcare regulations, or multi-jurisdiction compliance.

## commands

Slash commands — invoke directly in Claude Code. Full table with usage notes: `.claude/commands/README.md`.

- **/marty-onboard** — First-run interview for a fresh clone: seeds your values, north star, coaching contract, and memory files one question at a time, then walks the default settings with an on/off decision each.
- **/marty-sitrep** — Quick situational awareness: active missions, top actions ranked by urgency, and who's waiting on whom. Read-only.
- **/marty-process-transcript** — After a meeting: route the transcript to the right mission, save the raw verbatim, write the analysis, update threads and people.
- **/marty-sync** — Re-read mutable state from disk to pick up changes made by parallel sessions. Read-only.
- **/marty-update** — Flush unwritten state changes from this conversation to disk so parallel sessions can pick them up.
- **/marty-new-mission** — Scaffold a new mission from the template and register it in `core/active-config.md`.
- **/marty-end-mission** — End-of-mission handoff: promote persistent learnings, decisions, threads, and people, then archive.
- **/marty-reconcile** — Refresh a mission from its registered sources: pull, snapshot, cross-reference, propose updates.
- **/marty-thread-review** — Interactive, graph-aware hygiene pass over a mission's ephemeral memory.
- **/marty-end-session** — Post-chat memory write protocol: route notable items to the right memory files before closing.
- **/marty-refine-idea** — Work an idea from `ideas/` through coaching: clarify, stress test, connect, land on one next action.
- **/marty-skills** — Display this registry, organized by category.
- **/marty-new-hook** — Scaffold a new Claude Code hook from `tools/_template_hook.py`: settings-gated, non-blocking, logged, off by default.
- **/marty-foundations-first-explainer** — Teach any topic bottom-up, building each concept on the one before it.
- **/marty-initiator** — Open an autonomous peer conversation with a second Claude Code agent over the agent-bus.
- **/marty-reactor** — Join that conversation as the responder.
- **/marty-end-comms** — End the peer conversation, save the transcript, close the channel.
