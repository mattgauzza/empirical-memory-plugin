# Empirical Work History

Optional Empirical plugin for recording concise, timestamped summaries of meaningful completed
work so future agents can recover project history without relearning it.

## What it does

- Records what changed, why it changed, verification performed, and any next action.
- Groups history by project, repository, and date.
- Avoids raw transcripts, secrets, tokens, and noisy intermediate output.

## Install

From the Empirical marketplace:

```bash
empirical plugin install all --work-history
```

Or install directly with the native client marketplace command, using the plugin name
`empirical-work-history`.

This package requires the core `empirical-memory` plugin and uses the user's existing Empirical
MCP/OAuth connection.
