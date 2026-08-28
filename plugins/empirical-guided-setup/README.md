# Empirical Guided Setup

Optional Empirical plugin for personalizing a blueprint through a guided interview.

## What it does

- Lists available guided interviews via `list_guided_setups`, honestly relaying any `locked`
  entries and their `upgradeMessage` instead of skipping them.
- Starts an interview with `start_guided_setup` and asks each returned question conversationally.
- Records each answer with `continue_guided_setup` until the session reports `status: "completed"`.
- Lets the user stop early with `finish_guided_setup`, falling back to sensible defaults for any
  unanswered questions rather than forcing the full interview.

## Install

From the Empirical marketplace:

```bash
empirical plugin install all --guided-setup
```

Or install directly with the native client marketplace command, using the plugin name
`empirical-guided-setup`.

This package requires the core `empirical-memory` plugin and uses the user's existing Empirical
MCP/OAuth connection.
