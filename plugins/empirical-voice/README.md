# Empirical Voice

Optional Empirical plugin that writes in your own saved writing voice.

## What it does

- Looks up the voice you saved with the Empirical Writing Voice interview before it writes for you.
- Applies your rules for the medium (posts, email, docs, code comments, chat) and obeys your
  things-to-never-do absolutely.
- Never invents a voice if none is saved: it offers the interview instead.
- Never invents numbers, dates, names, or facts; it leaves a bracketed placeholder and tells you.
- Never edits or deletes your voice memories on its own.

The voice is stored as memories tagged `writing-voice` in the one workspace you picked during
the interview. Writing Voice is a paid Empirical feature. Optional AI-writing-tell rules are
paraphrased from tropes.fyi by ossama.is.

## Install

From the Empirical marketplace, install the plugin named `empirical-voice` with your client's
native marketplace command, for example:

```bash
claude plugin install empirical-voice@empirical-memory --scope user
```

This package requires the core `empirical-memory` plugin and uses the user's existing Empirical
MCP/OAuth connection. To create a voice, run the interview: ask your agent to start the guided
setup `setup_writing_voice`, or run `empirical setup run setup_writing_voice`.
