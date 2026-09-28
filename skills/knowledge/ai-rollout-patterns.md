# AI Rollout Patterns

## Trigger Conditions

[client] is planning, executing, or troubleshooting an internal AI adoption initiative. Questions like "how should we structure the rollout," "what does good look like for adoption programs," "why is adoption stalling in department X."

## Marty-Specific Lens

> **Context hook:** [Describe your own situation here — e.g. a mid-size regulated health company (~600-800 staff), multiple brands, a recent acquisition by a larger company, a champion-led federated model already selected as the approach, a 6-month timeline to 95% DAU.]

Advice must account for the constraints in the context hook — e.g. industry regulation, multi-brand complexity, acquisition integration dynamics, and [client]'s position as a program lead with a metric but without direct authority over departments.

[client]'s values that shape how this skill operates:
- **Ship-small-test-fast** — prefer lightweight proof points over elaborate rollout plans
- **Data validates intuition** — adoption metrics must drive decisions, not anecdotes
- **Impact over optics** — real usage over visible activity

## Required Source Material

- [client]'s rings-within-rings strategic model (five layers: political/financial reality, team and capability, grassroots discovery, structure and system, inner machinery)
- The hub-and-spoke / champion-led federated approach from prior strategic planning
- Lighthouse project patterns (e.g. an internal knowledge assistant, an engineering AI workflow, a brand creative engine)

## Core Knowledge

### Three Adoption Models

**Bottom-up grassroots.** Let usage grow organically. Fast start, but plateaus at early adopters (~20-30%). Cannot reach 95% without structural support. Good for discovery phase; insufficient as a standalone strategy.

**Top-down mandate.** Exec declares "use it." Generates compliance, not adoption. People check the box without building real habits. Resentment risk is high. The metric might be gamed.

**Champion-led federated (hub-and-spoke).** A central team provides tools, context, and measurement. Department champions provide local relevance, use-case curation, and peer credibility. This is the approach assumed in the context hook above. It combines top-down support (exec sponsorship, tooling, metrics) with bottom-up energy (champions, real use cases, organic discovery).

### Lighthouse Projects

A lighthouse is a visible, high-impact use case that creates an "aha moment" for a department or function. Characteristics:
- Runs on a daily or weekly cadence (not a one-time project)
- Has a clear, measurable metric
- Is well-documented and reproducible
- Creates visible value that others want to replicate

The purpose is not the lighthouse itself — it's the conversation the lighthouse starts. "Did you see what the support team did with Zendesk replies? I want that for my workflow."

### Adoption Curves and Stall Points

Early adopters (10-20%) come easily. The chasm is 20-50% — people who are willing but need a reason specific to their work. The last mile (80-95%) requires structural changes: default tools, mandatory onboarding, removal of alternatives.

Common stall points:
- Champions burn out (~month 3-4 without rotation or recognition)
- Tooling friction (SSO issues, MCP authentication failures, slow onboarding)
- "I don't see how it helps MY job" — lack of function-specific use cases
- Privacy/security concerns blocking high-value use cases (especially in regulated industries)

### Measurement

Leading indicators: DAU/MAU ratio (stickiness), time-to-first-use for new hires, champion activity levels, use-case backlog growth.

Lagging indicators: breadth (DAU %), density (messages/user/day), depth (MCP/Project usage).

The metric must have a denominator definition (who counts as "staff" — exclude contractors? part-time? on leave?) and a secondary success threshold ("green at the lower end").

## Out of Scope

- Specific technical implementation of AI tools (that's engineering work, not coaching)
- ROI measurement or value capture (explicitly deferred in the adoption strategy)
- External customer-facing AI features
- AI safety/alignment research
