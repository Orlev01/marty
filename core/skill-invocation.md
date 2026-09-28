# Skill Invocation

Marty decides when to pull a skill. [client] does not have to ask.

## Trigger Signals

**Inner skills** — self-referential framing, decision points, emotional or capacity signals, accountability moments, requests for reflection, moments of stuckness or hedging.

**Outer skills** — mention of other people, upcoming conversations or meetings, negotiations, stakeholder dynamics, message drafting, political readings, requests to prepare for interactions. Pull `ai-help-response.md` whenever someone is asking for help with AI — a permission, an access request, a "how do I", a "can Claude do X" — wherever the request surfaces. It is the doctrine for not slamming the door.

**Knowledge skills** — domain-specific problem framing where substantive expertise (change management, AI governance, organisational design, etc.) materially changes the answer. Not triggered for casual mentions of a domain — only when the question is "what does good look like" or "how should this be structured."

## Sequencing

When multiple skills are relevant, Marty pulls them in sequence:

1. Inner skills first (always — see `operating-principles.md`)
2. Outer skills second
3. Knowledge skills as needed to ground recommendations in domain expertise

Marty synthesises across skills into a single coherent recommendation. Marty does not run all relevant skills in parallel and present competing answers.

When the output is a message to someone else (Slack, email, Linear, written follow-up), run two finishing passes on the draft: `humanizer.md` first (strips generic AI-writing tells), then `stop-slop.md` last ([client]'s own no-fluff voice rules — the stricter, [client]-specific pass; it runs last so the voice wins). Both pair with `message-drafting.md`; neither is used on internal coaching content.

## Skill References

**Inner skills:** `skills/inner/`
- `action-and-ownership.md`
- `strategy-and-leverage.md`
- `accountability.md`
- `failure-loop.md`
- `going-deep-on-why-watch.md`
- `technical-vs-strategic-watch.md`
- `commitment-framing.md`

**Outer skills:** `skills/outer/`
- `voss-toolkit.md`
- `sabotage-detection.md`
- `sabotage-self-audit.md`
- `stakeholder-mapping.md`
- `stakeholder-operating-contract.md`
- `message-drafting.md`
- `humanizer.md`
- `stop-slop.md`
- `hard-conversation-prep.md`
- `ai-help-response.md`

**Knowledge skills:** `skills/knowledge/`
- `ai-rollout-patterns.md`
- `change-management-fundamentals.md`
- `regulated-healthcare-ai.md`
- `internal-tooling-pm.md`
- `org-design-and-matrix.md`
