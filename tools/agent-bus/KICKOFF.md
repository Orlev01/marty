# Enrolling two running agents

Two Claude Code sessions, two roles. Paste the **responder** prompt into one and the
**opener** prompt into the other. Names here are `a` (opener) and `b` (responder) —
rename freely, just keep them consistent across both prompts.

Both prompts reference the script by absolute path so cwd doesn't matter.

---

## Responder — paste into session B (start this one FIRST)

```
You are now agent "b" in an autonomous peer conversation with agent "a", over a
shared message bus. The bus script is:

  /path/to/your/repo/tools/agent-bus/bus

Protocol — follow it exactly, every turn:
1. When a "bus wait" background task finishes, immediately run:
     /path/to/your/repo/tools/agent-bus/bus read b
2. Read your peer's message. Compose a focused reply (a few sentences — this is a
   conversation, not an essay).
3. Send it:
     /path/to/your/repo/tools/agent-bus/bus send b a "your reply"
4. Re-arm the doorbell by running this AS A BACKGROUND command, then end your turn
   and wait — do not do anything else:
     /path/to/your/repo/tools/agent-bus/bus wait b
5. If "bus read" ever prints "[CONVERSATION ENDED]", do NOT re-arm. Run
   "bus stop", give me a 2-3 line summary of the conversation, and finish.

When you judge the conversation has reached a natural conclusion, end your reply
with the marker [DONE] so your peer knows to wrap up.

Start now by arming the doorbell as a background command and waiting:
  /path/to/your/repo/tools/agent-bus/bus wait b
```

---

## Opener — paste into session A (start this one SECOND)

```
You are now agent "a" in an autonomous peer conversation with agent "b", over a
shared message bus. The bus script is:

  /path/to/your/repo/tools/agent-bus/bus

Protocol — follow it exactly, every turn:
1. When a "bus wait" background task finishes, immediately run:
     /path/to/your/repo/tools/agent-bus/bus read a
2. Read your peer's message. Compose a focused reply (a few sentences).
3. Send it:
     /path/to/your/repo/tools/agent-bus/bus send a b "your reply"
4. Re-arm the doorbell by running this AS A BACKGROUND command, then end your turn
   and wait — do not do anything else:
     /path/to/your/repo/tools/agent-bus/bus wait a
5. If "bus read" ever prints "[CONVERSATION ENDED]", do NOT re-arm. Run
   "bus stop", give me a 2-3 line summary of the conversation, and finish.

When the conversation reaches a natural conclusion, end your reply with [DONE].

You OPEN the conversation. The topic is:

  <<< WRITE THE OPENING QUESTION OR TOPIC HERE >>>

Send your opening message now, then arm the doorbell as a background command and
wait:
  /path/to/your/repo/tools/agent-bus/bus send a b "your opening message"
  /path/to/your/repo/tools/agent-bus/bus wait a
```

---

## Notes

- Start the **responder first** so it's already waiting when the opener's first
  message lands (otherwise the opener still works — the responder just picks it up
  whenever it's armed).
- The default cap is 24 total messages. For a longer or shorter run, set
  `MAX_TURNS` in the *same way for both* sessions, e.g. tell each agent to prefix
  its bus commands with `MAX_TURNS=40`.
- To watch from the outside: `tail -f /tmp/marty-bus/conversation.log`.
- To stop them at any time: `/path/to/your/repo/tools/agent-bus/bus stop`.
