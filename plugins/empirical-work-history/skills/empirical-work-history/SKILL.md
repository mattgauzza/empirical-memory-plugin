---
name: empirical-work-history
description: Record concise, timestamped summaries of meaningful completed work so future agents can recover project history without relearning it.
---

# Empirical Work History

Use this Skill after meaningful work is complete when the user has enabled work-history capture.

## Record a completed-work summary

Create one concise, queryable memory with:

- `project`: repository or product name
- `timestamp`: use the current time supplied by the runtime
- `what changed`: implementation, configuration, or decision
- `why`: the user goal or design reason
- `verification`: tests, checks, or manual validation performed
- `next action`: only when follow-up remains

Prefer a single durable summary over a transcript or a memory for every intermediate step. Use
the Empirical MCP memory tools when available, or the CLI fallback:

```text
empirical memory record --category build --summary "<timestamped completed-work summary>" --tags <project>,work-history
```

Use `update_memory_by_query` or `empirical memory update` when the summary already exists and
needs correction. Never store credentials, tokens, private keys, raw prompts, or unrelated
transient output.

## Querying history

When recovering project context, query by project, feature, date range, or work-history tag. Treat
the latest user instruction and current repository state as authoritative if they conflict with
an older work-history entry.
