# Data Structures Reference

*Auto-generated from `schemas.json` — do not edit manually.*

This project uses **8** data structures, all defined in `schemas.json`. Each structure has typed fields with AI instructions that tell Marty how to populate them.

---

## Structures

- [Task](#task) — Individual work items that move the project forward
- [Blocker](#blocker) — Things preventing progress right now
- [Risk](#risk) — Known risks to the project's success, with likelihood, impact, and mitigation plans
- [Decision](#decision) — Decisions made during the project — who decided what, when, and why
- [Open Question](#open_question) — Questions that need answers — tracked by criticality and status
- [Idea](#idea) — Raw ideas, instincts, and possibilities to return to later. Not all ideas become tasks — some are strategic bets, some are hypotheses, some are parking-lot items.
- [Diagram](#diagram) — Visual diagrams — architecture, timelines, org charts, dependency maps
- [Glossary](#glossary) — Terms, tools, concepts, and acronyms used in this project

## Task

Individual work items that move the project forward

**Dashboard view:** table
 | **Sort by:** priority

| Field | Type | Required | AI Instruction |
|-------|------|----------|---------------|
| Title | `text` | Yes | A clear, actionable task title |
| Owner | `member` | Yes | Assign to the team member responsible |
| Status | `select` (`not_started`, `in_progress`, `blocked`, `done`) |  |  Default: `not_started` |
| Priority | `select` (`P0`, `P1`, `P2`, `P3`) |  |  |
| Due Date | `date` |  |  |
| Notes | `text` |  | Relevant context, dependencies, or rationale |

**Create event example:**
```json
{
  "schema": "task",
  "action": "create",
  "author": "<your_member_id>",
  "timestamp": "2026-05-05T10:00:00+10:00",
  "recordId": "task_NNN",
  "data": {
    "title": "<Title>",
    "owner": "lead"
  }
}
```

---

## Blocker

Things preventing progress right now

**Dashboard view:** cards
 | **Group by:** status
 | **Sort by:** severity

| Field | Type | Required | AI Instruction |
|-------|------|----------|---------------|
| Title | `text` | Yes |  |
| Owner | `member` |  | Who is responsible for unblocking this? |
| Status | `select` (`open`, `resolved`) |  |  Default: `open` |
| Severity | `select` (`critical`, `high`, `medium`, `low`) |  |  |
| Related Tasks | `ref:task[]` |  |  |
| Notes | `text` |  |  |

**Create event example:**
```json
{
  "schema": "blocker",
  "action": "create",
  "author": "<your_member_id>",
  "timestamp": "2026-05-05T10:00:00+10:00",
  "recordId": "blocker_NNN",
  "data": {
    "title": "<Title>"
  }
}
```

---

## Risk

Known risks to the project's success, with likelihood, impact, and mitigation plans

**Dashboard view:** cards
 | **Group by:** status
 | **Sort by:** severity

| Field | Type | Required | AI Instruction |
|-------|------|----------|---------------|
| Risk | `text` | Yes | Clear description of what could go wrong |
| Status | `select` (`identified`, `mitigating`, `accepted`, `resolved`) |  |  Default: `identified` |
| Severity | `select` (`critical`, `high`, `medium`, `low`) |  | How bad would it be if this risk materialises |
| Likelihood | `select` (`high`, `medium`, `low`) |  | How likely is this risk to materialise |
| Impact | `text` |  | What happens if this risk materialises — specific consequences to timeline, outcome, or team |
| Mitigation | `text` |  | What can be done to reduce likelihood or impact |
| Owner | `member` |  | Who is responsible for monitoring and mitigating this risk |

**Create event example:**
```json
{
  "schema": "risk",
  "action": "create",
  "author": "<your_member_id>",
  "timestamp": "2026-05-05T10:00:00+10:00",
  "recordId": "risk_NNN",
  "data": {
    "title": "<Risk>"
  }
}
```

---

## Decision

Decisions made during the project — who decided what, when, and why

**Dashboard view:** timeline
 | **Sort by:** date

| Field | Type | Required | AI Instruction |
|-------|------|----------|---------------|
| Decision | `text` | Yes |  |
| Made By | `member` |  |  |
| Date | `date` | Yes |  |
| Context | `text` |  | Why was this decision made? What alternatives were considered? |
| Tags | `multi_select` (`technical`, `product`, `process`, `scope`, `people`) |  |  |

**Create event example:**
```json
{
  "schema": "decision",
  "action": "create",
  "author": "<your_member_id>",
  "timestamp": "2026-05-05T10:00:00+10:00",
  "recordId": "decision_NNN",
  "data": {
    "title": "<Decision>",
    "date": "2026-05-05"
  }
}
```

---

## Open Question

Questions that need answers — tracked by criticality and status

**Dashboard view:** table
 | **Group by:** criticality
 | **Sort by:** status

| Field | Type | Required | AI Instruction |
|-------|------|----------|---------------|
| Question | `text` | Yes | The specific question that needs answering |
| Status | `select` (`open`, `answered`, `deferred`) |  |  Default: `open` |
| Criticality | `select` (`decision_critical`, `important`, `longer_term`) |  | decision_critical = must be resolved before committing further. important = should be resolved early. longer_term = can be resolved during execution. |
| Answer | `text` |  | The answer once resolved, with source and date |
| Answered By | `member` |  |  |
| Notes | `text` |  | Additional context or why this question matters |

**Create event example:**
```json
{
  "schema": "open_question",
  "action": "create",
  "author": "<your_member_id>",
  "timestamp": "2026-05-05T10:00:00+10:00",
  "recordId": "open_question_NNN",
  "data": {
    "title": "<Question>"
  }
}
```

---

## Idea

Raw ideas, instincts, and possibilities to return to later. Not all ideas become tasks — some are strategic bets, some are hypotheses, some are parking-lot items.

**Dashboard view:** cards
 | **Group by:** status
 | **Sort by:** priority

| Field | Type | Required | AI Instruction |
|-------|------|----------|---------------|
| Title | `text` | Yes | Clear, concise name for this idea |
| Description | `text` | Yes | What the idea is, why it matters, and any initial thinking on how it could work |
| Status | `select` (`raw`, `developing`, `ready_to_execute`, `parked`, `promoted`) |  | raw = just captured. developing = being refined. ready_to_execute = has enough shape to become tasks. parked = good idea, not now. promoted = converted to tasks. Default: `raw` |
| Priority | `select` (`high`, `medium`, `low`, `unranked`) |  |  Default: `unranked` |
| Dependencies | `text` |  | What needs to be true before this idea can be executed? |
| Notes | `text` |  |  |

**Create event example:**
```json
{
  "schema": "idea",
  "action": "create",
  "author": "<your_member_id>",
  "timestamp": "2026-05-05T10:00:00+10:00",
  "recordId": "idea_NNN",
  "data": {
    "title": "<Title>",
    "description": "<Description>"
  }
}
```

---

## Diagram

Visual diagrams — architecture, timelines, org charts, dependency maps

**Dashboard view:** diagram

| Field | Type | Required | AI Instruction |
|-------|------|----------|---------------|
| Title | `text` | Yes | Concise name for this diagram |
| Description | `text` |  | What this diagram shows and why it's useful |
| Mermaid Code | `text` | Yes | Valid Mermaid diagram syntax (graph, flowchart, sequence, gantt, etc.) |
| Category | `select` (`process`, `architecture`, `timeline`, `org-chart`, `dependency`, `other`) |  |  |

**Create event example:**
```json
{
  "schema": "diagram",
  "action": "create",
  "author": "<your_member_id>",
  "timestamp": "2026-05-05T10:00:00+10:00",
  "recordId": "diagram_NNN",
  "data": {
    "title": "<Title>",
    "mermaid": "<Mermaid Code>"
  }
}
```

---

## Glossary

Terms, tools, concepts, and acronyms used in this project

**Dashboard view:** table
 | **Group by:** category
 | **Sort by:** term

| Field | Type | Required | AI Instruction |
|-------|------|----------|---------------|
| Term | `text` | Yes | The term or acronym |
| Definition | `text` | Yes | Clear, concise explanation in the context of this project |
| Category | `select` (`strategy`, `tools`, `architecture`, `metrics`, `process`, `other`) |  |  |
| Aliases | `text` |  | Alternative names or acronyms for the same thing |

**Create event example:**
```json
{
  "schema": "glossary",
  "action": "create",
  "author": "<your_member_id>",
  "timestamp": "2026-05-05T10:00:00+10:00",
  "recordId": "glossary_NNN",
  "data": {
    "term": "<Term>",
    "definition": "<Definition>"
  }
}
```

---

## Field Types Reference

| Type | Description |
|------|-------------|
| `text` | Free text |
| `date` | ISO date (YYYY-MM-DD) |
| `select` | Single choice from options list |
| `multi_select` | Multiple choices from options list |
| `member` | Reference to a team member ID from team.json |
| `member[]` | Multiple team member ID references |
| `ref:<schema>` | Reference to a record ID in another schema |
| `ref:<schema>[]` | Multiple references to record IDs in another schema |
| `number` | Numeric value |
| `boolean` | True/false |
