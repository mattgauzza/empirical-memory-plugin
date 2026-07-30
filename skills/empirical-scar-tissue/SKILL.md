---
name: empirical-scar-tissue
description: Record recurring failure patterns, sharp edges, and prevention guidance so future agents avoid repeating expensive mistakes.
---

# Empirical Scar Tissue

Use this Skill when work reveals a recurring failure mode, a sharp edge in the project, or a
corrected misconception that future agents should avoid. This is different from work history:
work history records what was completed, while scar tissue records what should not be repeated.

## Record useful scar tissue

Create one concise, queryable memory containing:

- `symptom`: what failed or surprised the agent
- `cause`: the verified root cause, if known
- `prevention`: the rule or check that prevents recurrence
- `verification`: how the fix or prevention was confirmed
- `scope`: repository, tool, or workflow where it applies

Prefer durable lessons over incident transcripts. Use the Empirical MCP memory tools when
available, or the CLI fallback:

```text
empirical memory record --category debugging --summary "Scar tissue: <symptom>; cause: <cause>; prevention: <prevention>; verification: <verification>" --tags <project>,scar-tissue
```

Never store credentials, tokens, private keys, raw prompts, or unrelated transient output.

## Query before repeating a risky path

Before changing a subsystem with known sharp edges, query memories using the project and
`scar-tissue` tag. Follow the latest user instruction and current repository state if they
conflict with an older lesson.
