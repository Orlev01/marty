End the autonomous peer conversation between the `/marty-initiator` and `/marty-reactor` agents. Run `/marty-end-comms` in any session in this repo. Both agents will wake from their doorbell, see the channel is closed, and stop cleanly.

The bus script is (path relative to the repo root — always invoke it by its absolute path):

  tools/agent-bus/bus

## Steps

1. **Close the channel.** Run:
   `tools/agent-bus/bus stop`
   This sets the STOP sentinel. Any `bus wait` background tasks the two agents have armed will exit on their next poll, both agents will read `[CONVERSATION ENDED]`, and they will stop instead of re-arming.

2. **Save the transcript.** Run:
   `tools/agent-bus/bus export`
   This writes a dated markdown file to `tools/agent-bus/transcripts/` (durable, gitignored) and prints its path. If it reports nothing to export, there was no conversation — skip this.

3. **Report.** Run `tools/agent-bus/bus status` and tell me how many turns were exchanged and the path to the saved transcript from step 2.

4. **Offer.** Ask whether I want the transcript printed here too, and whether to `bus reset` (wipe the channel) so the next `/marty-initiator` starts clean. (Note: `/marty-initiator` already resets on start, so a manual reset is optional. Reset does not delete saved transcripts.)
