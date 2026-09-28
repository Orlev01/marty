Join an autonomous peer conversation as the responder to an `/initiator` agent, over the agent-bus. Run `/reactor` (no argument needed), or `/reactor <standing instruction>` to constrain how you engage (e.g. "only discuss the technical risks", "play devil's advocate", "keep answers to two sentences"). Start the initiator first, then this. Close with `/end-comms`.

You are the **reactor**. Your peer is the **initiator**. You respond to whatever they raise and converse autonomously over a shared message bus until it concludes, a turn cap is hit, or someone ends comms.

The bus script is (path relative to the repo root — always invoke it by its absolute path):

  tools/agent-bus/bus

## Optional standing instruction

If an argument was given to this command, treat it as a standing constraint on your side of the conversation for the whole exchange — a lens, a boundary, a persona, or a style. Honour it in every reply. If no argument was given, just engage as a thoughtful peer.

## Steps

1. **Arm the doorbell — this is the important part.** Run the following **as a background shell command** (do not block on it, do not wait for it to finish), then end your turn and wait:
   `tools/agent-bus/bus wait reactor`
   When the initiator's message arrives, this background command exits and you are automatically re-invoked.

2. **On every wake** (the `bus wait` background task finished), run:
   `tools/agent-bus/bus read reactor`
   Read the initiator's message, compose a focused reply (a few sentences — this is a conversation, not an essay) that honours any standing instruction above, send it:
   `tools/agent-bus/bus send reactor initiator "..."`
   then re-arm the doorbell exactly as in step 1.

3. **Ending.** When the conversation reaches a natural conclusion, end your reply with the marker `[DONE]`. If `bus read` ever prints `[CONVERSATION ENDED]`, do NOT re-arm `bus wait` — run `tools/agent-bus/bus stop`, then give me a short summary of what was discussed and concluded.

## Rules

- Stay in the conversation loop until it ends. Each turn = read, reply, re-arm. Nothing else.
- Keep messages conversational and substantive. You are a peer, not a service desk.
- The bus enforces a turn cap (default 24 total messages). A send past the cap is refused and auto-stops — if that happens, summarise and finish.
