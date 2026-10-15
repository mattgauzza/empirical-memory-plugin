# Empirical Voice

Optional Empirical plugin that writes in your own saved writing voice.

## What it does

- Looks up the voice you saved with the Empirical Writing Voice interview before it writes for you.
- Applies your rules for the medium (posts, email, docs, code comments, chat) and obeys your
  things-to-never-do absolutely.
- Never invents a voice if none is saved: it says so first and asks whether to start the paid
  interview (it uses Empirical Tokens) before writing a neutral draft.
- Never invents numbers, dates, names, facts, or personal anecdotes; it leaves a bracketed
  placeholder and tells you.
- Never edits or deletes your voice memories on its own.

The voice is stored as memories tagged `writing-voice` in the one workspace you picked during
the interview. Writing Voice is a paid Empirical feature. Optional AI-writing-tell rules are
paraphrased from [tropes.fyi](https://tropes.fyi) by ossama.is.

## Requirements

- The core `empirical-memory` plugin, which supplies the Empirical MCP connection and OAuth.
- A saved writing voice. Writing Voice is a paid Empirical feature; this plugin only reads a voice,
  it does not create one. To create one, run `empirical setup run setup_writing_voice`, start the
  Writing Voice setup from the Empirical portal, or ask a connected assistant to start the guided
  setup `setup_writing_voice`.

## Install

**Claude Code**

```bash
claude plugin marketplace add mattgauzza/empirical-memory-plugin
claude plugin install empirical-voice@empirical-memory --scope user
```

**Codex CLI**

```bash
codex marketplace add mattgauzza/empirical-memory-plugin
codex plugin add empirical-voice@empirical-memory
```

**GitHub Copilot CLI**

```bash
copilot plugin marketplace add mattgauzza/empirical-memory-plugin
copilot plugin marketplace update empirical-memory
copilot plugin install empirical-voice@empirical-memory
```

or use the `/plugin install` slash command.

With the `empirical` CLI you can install it alongside the core plugin instead:

```bash
empirical plugin install claude --voice     # or codex, copilot, all
```

`--all-optional` also installs it. The interactive `empirical install` asks whether to install the
writing voice skill (the default is no).

## How it works

When the agent is about to write text you will send or publish as yourself (an email, message,
reply, post, bio, or announcement), the skill first looks up your voice:

```text
query_memories({ query: "how this person writes", tags: ["writing-voice"], topK: 50 })
empirical memory query --match "how this person writes" --tags writing-voice --top-k 50
```

- The lookup phrase is `how this person writes` and the tag is `writing-voice`. A voice holds
  roughly 20 to 70 memories, so it uses a high `topK`.
- The voice lives in the one workspace you picked in the interview, which may not be the active
  one. If nothing comes back, it retries once across your workspaces (`workspaceIds`, or
  `--all-workspaces` on the CLI) before concluding there is no voice.
- Read order: the hub (tags `writing-voice` and `voice`, summary starts "How this person
  writes:"), then your things to never do (`writing-rule` and `avoid`), then the rules for the
  medium you are writing in (`posts`, `email`, `docs`, `code comments`, `chat`), then the remaining
  `writing-rule` memories.
- It does not apply to code, commit messages, or project docs unless you ask for your voice there.
- After the draft it ends with one line naming the rules it used.

## Example

Sam asks for a note to a landlord about a broken heater.

Without the plugin:

> Dear Mr. Alvarez, I hope this message finds you well. I am writing to inform you that the heater
> in my unit has stopped working. I would greatly appreciate your prompt attention to this matter.
> Best regards, Sam

With Sam's saved voice (plain, direct, asks first, never signs off with "Best regards"):

> Hi Mr. Alvarez, can someone look at the heater in unit 4B this week? It stopped working Sunday
> and it is cold at night. I am home after 5 any day. Thanks, Sam
>
> Rules used: ask in the first line, no stock sign-off, short sentences.

## Verify

Ask your agent: "what do you know about how I write?" It should look up your saved voice and read
your rules back. Then ask it to draft a short email without mentioning your voice; it should look
the voice up first and end with a line naming the rules used.

## Troubleshooting

- **The skill did not fire.** Check that the plugin is installed (`empirical plugin check`),
  restart the agent session, then ask "what do you know about how I write?" to trigger it
  directly. Code, commit messages, and project docs do not trigger it unless you ask.
- **No voice found.** The agent says so in its first line and asks whether to start the interview. Check your Empirical memories
  for ones tagged `writing-voice`; if the install failed, confirm the draft again with
  `empirical setup resume <sessionId>` and `empirical setup confirm <sessionId> <draftHash>`.
- **Wrong workspace.** The voice is in the workspace you picked in the interview. Name that
  workspace in your request, or run `empirical workspace use` for it.
- **Team workspace.** A team workspace holds one voice, set up by one member. The plugin names the
  workspace and asks whether the voice is yours before drafting, unless you authored it. If a member already has a voice there, the interview
  refuses to create a second one.

## Privacy

The plugin only reads. It never writes to Empirical without asking you first, and it never edits or
deletes voice memories on its own. It may offer to save a correction as a new rule if you correct
the same thing twice, and it asks before saving. Pasted writing used in the interview is not stored;
only a neutral style summary is kept, and you review every memory before it is saved.
