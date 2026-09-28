# agent-bus

A tiny message bus that lets **two peer Claude Code agents hold an autonomous
back-and-forth conversation** — neither one subordinate, no MCP server, no IPC
plumbing beyond a shell script.

## The one idea that makes it work

Moving bytes between agents is trivial (a file does it). The hard part, unique to
Claude Code, is the **wakeup**: an idle agent isn't polling anything — it's blocked
waiting for input, so a file written by its peer does nothing on its own.

`bus wait` solves that. It's a cheap shell loop that blocks until a message arrives,
then exits. Run it as a **background** command and the harness re-invokes your agent
the moment it exits. Zero token cost while idle, no in-context polling, and the
sender never blocks (it just drops a file).

```
  log = transport   |   bus wait (backgrounded) = doorbell   |   turn counter = guard
```

## Commands

```
bus init                      # create the bus (also lazy-created by send/wait)
bus send  <from> <to> <text>  # send (text arg or pipe via stdin)
bus read  <me>                # print + consume unread messages for <me>
bus wait  <me>                # block until a message for <me> arrives — RUN IN BACKGROUND
bus stop                      # end the conversation for both agents
bus status                    # counters / unread / stopped
bus export [dir]              # save the transcript as a dated .md (default: ./transcripts)
bus reset                     # wipe and start fresh
```

## The loop each agent runs

1. `bus read <me>` — get your peer's message(s).
2. Think, then `bus send <me> <peer> "..."` — reply.
3. `bus wait <me>` **in the background** — re-arm the doorbell, then go idle.
4. The harness re-invokes you when step 3 exits → back to step 1.

It ends when: someone sends `[DONE]`, anyone runs `bus stop`, or the shared turn
counter hits `MAX_TURNS` (a send past the cap is refused and auto-stops). On any of
these, `bus read` prints `[CONVERSATION ENDED]` — stop, don't re-arm `bus wait`.

## Config (env vars, must match for both agents)

| var | default | meaning |
|-----|---------|---------|
| `BUS_DIR` | `/tmp/marty-bus` | where live state lives |
| `MAX_TURNS` | `24` | total messages before the loop force-stops |
| `POLL_SECS` | `2` | doorbell poll interval (latency, not token cost) |
| `TRANSCRIPTS` | `<script-dir>/transcripts` | where `bus export` saves dated transcripts |

Defaults match out of the box, so you don't need to set anything.

## Watch / drive it as the human

```
tail -f /tmp/marty-bus/conversation.log   # read the conversation live
./bus status                              # how many turns left
./bus stop                                # halt both agents now
./bus export                              # save transcript to ./transcripts/<date>.md
./bus reset                               # clean slate (does not touch saved transcripts)
```

Live state sits in `/tmp` (ephemeral, cleared on reset). Finished conversations are
saved durably by `bus export` (which `/marty-end-comms` runs for you) into
`tools/agent-bus/transcripts/` as `YYYY-MM-DD-HHMMSS.md`. That directory is
gitignored — durable and readable on disk, but conversation content is never
auto-committed. Drop the gitignore entry if you'd rather track them.

## Driving it — the easy way (slash commands)

You don't touch the script directly. Three commands wrap it:

| command | where | what it does |
|---------|-------|--------------|
| `/marty-initiator <topic>` | session A | resets the channel, opens on your topic, then runs the loop |
| `/marty-reactor [constraint]` | session B | responds and runs the loop; optional arg constrains its side (a lens, persona, boundary, style) |
| `/marty-end-comms` | any session | saves the transcript, then closes the channel — both agents wake, see it's ended, and stop |

Run `/marty-initiator` first (it resets and sends the opening, which persists), then
`/marty-reactor` in the other session. They converse autonomously until `[DONE]`, the
turn cap, or `/marty-end-comms`.

Command definitions live in `.claude/commands/{initiator,reactor,end-comms}.md`.

## Enrolling manually (any repo, no slash commands)

See `KICKOFF.md` — paste the responder prompt into one session and the opener
prompt into the other. Same protocol, no command files needed.

## Limits / notes

- Exactly **two** peers. More than two needs real routing (an MCP broker) — see the
  conversation that produced this for why that's only worth it past two agents.
- Runtime state lives in `/tmp` by default, so nothing lands in the repo.
- If an agent dies mid-conversation, its last backgrounded `bus wait` is just a
  harmless sleeping shell; `bus stop` makes it exit.
