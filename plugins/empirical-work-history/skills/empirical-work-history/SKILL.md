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

Prefer a single durable summary over a transcript or a memory for every intermediate step.

### These are notes about YOUR work, not facts about the user

A work-history entry records what an agent did. It is not something the user said, chose, or
lived through, and downstream features must be able to tell the difference — a proactive
message built on "I refactored the cluster selector" is the assistant talking to the user
about itself.

**Every write MUST carry the `work-history` tag and `mass: 1`.** Both, on both paths. The tag is
what lets a reader separate process notes from real memories; `mass: 1` keeps them from
outranking the user's own material, since an inferred mass is typically 2-4x higher and these
are simultaneously the newest and least-revisited things in a corpus, which is the best
possible position in most ranking schemes.

Using the Empirical MCP memory tools (preferred):

```text
record_graph_memory({
  category: "build",
  summary: "<timestamped completed-work summary>",
  tags: ["<project>", "work-history"],
  mass: 1
})
```

CLI fallback:

```text
empirical memory record --category build --summary "<timestamped completed-work summary>" --tags <project>,work-history --mass 1
```

Use `update_memory_by_query` or `empirical memory update` when the summary already exists and
needs correction. Never store credentials, tokens, private keys, raw prompts, or unrelated
transient output.

## Querying history

When recovering project context, query by project, feature, date range, or work-history tag. Treat
the latest user instruction and current repository state as authoritative if they conflict with
an older work-history entry.
