---
description: Teach any topic bottom-up by building each concept on the one before it, the way arithmetic builds toward calculus. Use this skill whenever the user asks to be taught, walked through, explained, or has expressed confusion about a topic with non-trivial conceptual depth — especially when they say things like "explain from the ground up," "start from A and go to Z," "walk me through this step by step with examples," "I need to rebuild my foundational understanding," "teach me like I'm new to this," or "treat each concept as the foundation for the next." Also trigger when the user is evaluating a technical claim or design and keeps hitting words they don't fully understand — that's a signal they need foundations, not more surface-level answers. Trigger even when the user hasn't explicitly asked for a tutorial: if they're confused about how multiple pieces fit together, this skill is usually the right move. Works for any subject — technical, conceptual, organisational, financial, scientific.
---

# Foundations-first explainer

A framework for teaching any topic so the learner ends up able to reason about it on their own, not just recite what you told them.

The shape: start at A. Explain it with an example. Once it's solid, build B on top of A. Then C on top of A and B. Keep going until the user has the full picture and — critically — could derive the later concepts themselves if they forgot them.

The reference example is the progression from basic addition to calculus. Each layer is impossible without the one before it, but each layer also unlocks something the previous layers couldn't do alone.

## When to use this skill

Use it when:

- The user explicitly asks for a bottom-up explanation, a walkthrough, a tutorial, or "explain like I'm new to this"
- The user is trying to evaluate a claim or design and the gap is foundational, not factual
- The user has asked multiple related questions and keeps hitting words they don't fully understand
- A topic has enough conceptual depth that a flat explanation would either oversimplify or overwhelm
- The user says "I keep getting confused about X" — that's a foundations problem

Don't use it when:

- The user wants a one-line factual answer ("what year was X founded?") — just answer
- The user already has the foundations and wants a specific question answered — answer the question
- The topic is genuinely shallow — don't manufacture depth that isn't there
- The user is in a rush and explicitly asks for the short version

## The core framework

Every topic taught with this skill follows the same structure. The structure is the skill; the content varies.

### Step 1: Find the floor

What does the user already know, and what's the lowest concept they need that they *don't* already have? That's where you start. Not lower — don't waste their time. Not higher — they'll get lost.

Signals:
- What vocabulary have they used correctly in the conversation?
- What questions have they asked that imply foundations they already have?
- Where in the conversation did they get confused — that's roughly the floor

If you can't tell, ask one question to locate the floor. Don't ask three. One.

### Step 2: Map the progression

Before writing the first explanation, map out the full sequence of concepts from the floor to where the user wants to end up. This is the spine of the response. Each concept gets a single label.

Aim for 10-20 concepts in the progression. Fewer than 10 and the topic probably doesn't need this treatment. More than 20 and you're either being too granular or trying to cover too much in one response.

Each concept should:
- Be the smallest unit that can stand alone
- Be a strict prerequisite for at least one later concept
- Have a concrete example available

If you can't think of a concrete example for a concept, you probably haven't understood it well enough to teach it. Go think harder before writing.

### Step 3: Use the four-beat pattern for each concept

For every concept in the progression, deliver it in this order:

1. **State the concept in one line.** No preamble. The first sentence should land.
2. **Give a concrete example.** Real, specific, ideally something the user has touched. Avoid abstract "consider a system X" examples.
3. **State the critical property.** What's the *one thing* about this concept that matters for what comes next? Often this is what gets lost in textbook treatments.
4. **Connect it to the next concept.** Either explicitly ("this is why we need the next idea...") or by setting up a question the next concept answers.

Example of the four-beat pattern, teaching "what a function is" in programming:

> **A function is a named, reusable block of code that takes inputs and produces outputs.**
>
> Example: `add(2, 3)` returns `5`. You wrote it once. You can call it from anywhere. The inputs `2` and `3` are the arguments; `5` is the return value.
>
> The critical property is **encapsulation** — what happens inside the function is hidden from the caller. You don't need to know how `add` works to use it. You just need to know what it takes in and what it gives back.
>
> This is what makes functions composable: if encapsulation holds, you can use one function inside another without worrying about hidden interactions. Which is the foundation for the next concept — **composition**.

That's the rhythm. One line, one example, one critical property, one bridge forward.

### Step 4: Use letters as section anchors

Label sections `## A. <concept>`, `## B. <concept>`, and so on. This gives the user a structural map of the progression and lets them refer back to specific sections ("can you re-explain D?").

The alphabet is a forcing function: it caps the response at 26 concepts and reminds you to keep each section atomic. If you'd need to write "A.1," "A.2," you should probably split it into two letters.

### Step 5: Insert anchor tables when surfaces multiply

When you've covered enough concepts that the user is juggling distinctions (three different products, four runtimes, five config types), pause and consolidate with a table. Tables surface the cross-cutting distinctions that are otherwise hard to hold in working memory.

A good anchor table:
- Has 3-5 rows and 3-5 columns
- Each row is a discrete thing being compared
- Each column is a property that varies meaningfully
- A user could quote the table from memory after reading it once

If your table is wider than 5 columns or longer than 5 rows, split it.

### Step 6: End with a holdable summary

The last section is always a numbered summary the user can hold in their head. 8-13 points usually works. Each point one sentence. No nuance, no qualifications — just the load-bearing claims.

This summary is what the user takes away when the rest fades. It should be the *minimum viable model* they can use to think about the topic on their own.

Label this section `## Z. The summary you can hold in your head` (or similar) regardless of how many letters you actually used. Z signals "this is the floor of what you should remember."

## Style guidance

**One concept per paragraph.** If you're tempted to bundle two ideas in one paragraph, split them. The visual break helps the reader assimilate.

**Concrete > abstract, always.** "A VM is like Parallels running Windows on a Mac" beats "A VM is an isolated virtualised compute environment." Both can be true; the first is teachable.

**Use the reader's existing knowledge as scaffolding.** If you know the user is a software engineer, anchor new concepts to programming concepts they have. If they're a clinician, anchor to clinical reasoning. The progression is the same; the analogies shift.

**Show your work on the load-bearing claims.** When a concept is doing a lot of structural work, take an extra paragraph to verify it from a different angle. The user should be able to trust the load-bearing claims because you've shown them how to check.

**Honest about uncertainty.** Some claims are well-established, some are inferred, some are guesses. Flag the difference. The user is going to act on this; they deserve to know which claims are firm.

**No throat-clearing.** "Great question!" and "Let me break this down for you" and "Before we dive in..." all delete. Start with content.

## What to avoid

- **Skipping levels.** If a concept depends on something the user doesn't have, you must teach the prerequisite first. No shortcuts. The whole point of this skill is that the user ends up able to derive later concepts from earlier ones; that fails if there are gaps.
- **Lecture mode.** Don't lecture for 4000 words without checking the user is following. If a topic is genuinely 26 concepts deep, consider splitting across multiple turns and asking the user where to go deeper.
- **Premature precision.** Early concepts can be slightly wrong if the simplification helps the user grasp the shape. Tighten the definition later when the user has the scaffolding to handle it. Don't open with all five caveats; that's how textbooks lose people.
- **Burying the bridge.** The "connect to next concept" beat is the most-skipped one. Without it, the user gets a list of facts instead of a chain of reasoning.
- **Forgetting the summary.** No matter how good the body is, the user will forget 80% of it. The numbered summary is what they actually take with them.

## Adapting to the request

The user may ask for the framework in different shapes:

- **"Walk me through X step by step"** — full progression, all four beats, summary at end
- **"I'm confused about X"** — identify where the confusion is, back up two steps, run the progression from there
- **"Why does X work but Y doesn't?"** — usually wants the progression up to the divergence point, then a comparison table, then the explanation of why
- **"Give me the foundations of X"** — full progression but you can be lighter on examples for concepts they may already know
- **"Teach me X like I'm a beginner"** — start lower than you think; don't assume technical vocabulary

If the user gives you the ending point but not the starting point, ask: "What do you already know about [topic]?" — but only if you genuinely can't infer it.

## The test

The skill has worked if, after reading the response, the user could:

1. Explain the topic to a colleague using their own words and examples
2. Identify which concept in the progression a future claim depends on
3. Spot when someone is hand-waving past a foundation

If the user is just nodding along and can repeat phrases back, the skill hasn't worked. They need to be able to *use* the framework, not just receive it.

## Example progression shape

For reference, here's the rough shape of a well-formed progression (the topic is illustrative; the structure is what matters):

```
A. The thing in its simplest form
B. The first complication
C. A property that emerges from A+B
D. The everyday version of C the user already knows
E. The technical name for D
F. The first counterexample — when does this break?
G. The fix for F
... (and so on)
Z. Summary: 10 numbered points you can hold in your head
```

Notice: A is a definition. B introduces tension. C is what emerges. D-E translate between intuition and vocabulary. F is the falsifier. G is the resolution. Z is the takeaway.

Not every progression follows that exact shape, but most good ones have something like it: a beat where the user thinks "ah, that's the thing I already know," a beat where they think "wait, what about...?" and a beat where the resolution lands.

## A reminder

The framework is the skill. The content changes every time you use it. Don't try to memorise specific examples — build the progression fresh for the topic at hand, but always in this shape.
