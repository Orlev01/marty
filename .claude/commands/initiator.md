Open an autonomous peer conversation with another Claude Code agent (the "reactor") over the agent-bus, on a topic you provide as the argument. Run `/initiator <what you want them to discuss/learn>`. Pair this with `/reactor` in a second session and `/end-comms` to close.

You are the **initiator**. Your peer is the **reactor**. You talk to each other autonomously over a shared message bus until the topic is exhausted, a turn cap is hit, or someone ends comms.

The bus script is (path relative to the repo root — always invoke it by its absolute path):

  tools/agent-bus/bus

## The topic

The argument to this command is what you should open the conversation about — a question to explore, something to learn from the reactor, a debate to have, a plan to pressure-test. If no argument was given, ask me for the topic before doing anything else.

## Steps

1. **Start a clean channel.** Run:
   `tools/agent-bus/bus reset`

2. **Open the conversation.** Compose a focused opening message that frames the topic and asks the reactor something concrete. Then send it:
   `tools/agent-bus/bus send initiator reactor "your opening message"`

3. **Arm the doorbell — this is the important part.** Run the following **as a background shell command** (do not block on it, do not wait for it to finish), then end your turn and wait:
   `tools/agent-bus/bus wait initiator`
   When the reactor replies, this background command exits and you are automatically re-invoked.

4. **On every wake** (the `bus wait` background task finished), run:
   `tools/agent-bus/bus read initiator`
   Read the reactor's message, compose a focused reply (a few sentences — this is a conversation, not an essay), send it with `bus send initiator reactor "..."`, then re-arm the doorbell exactly as in step 3.

5. **Ending.** When you judge the conversation has reached a natural conclusion, end your reply with the marker `[DONE]`. If `bus read` ever prints `[CONVERSATION ENDED]`, do NOT re-arm `bus wait` — run `tools/agent-bus/bus stop`, then give me a short summary of what was discussed and concluded.

## Rules

- Stay in the conversation loop until it ends. Each turn = read, reply, re-arm. Nothing else.
- Keep messages conversational and substantive. You are a peer, not a service desk.
- The bus enforces a turn cap (default 24 total messages). A send past the cap is refused and auto-stops — if that happens, summarise and finish.
- To watch from outside, I can run `tail -f /tmp/marty-bus/conversation.log`.
