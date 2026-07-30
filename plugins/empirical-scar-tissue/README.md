# Empirical Scar Tissue

Optional Empirical plugin for recording recurring failure patterns, sharp edges, and prevention
guidance discovered during work.

## What it does

- Captures the symptom, verified cause, prevention rule, and verification.
- Encourages agents to query known sharp edges before repeating risky work.
- Stores durable lessons instead of incident transcripts or blame-oriented notes.

## Install

From the Empirical marketplace:

```bash
empirical plugin install all --scar-tissue
```

Or install directly with the native client marketplace command, using the plugin name
`empirical-scar-tissue`.

This package requires the core `empirical-memory` plugin and uses the user's existing Empirical
MCP/OAuth connection.
