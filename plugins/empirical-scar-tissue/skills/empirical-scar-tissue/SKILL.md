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

Prefer durable lessons over incident transcripts.

### These are notes about YOUR mistakes, not facts about the user

Scar tissue records what an agent got wrong and how to avoid it next time. The user did not do
it, say it, or live it, and downstream features must be able to tell the difference.

**Every write MUST carry the `scar-tissue` tag and `mass: 1`.** Both, on both paths. The tag is
what lets a reader separate process notes from real memories; `mass: 1` keeps them from
outranking the user's own material, since an inferred mass is typically 2-4x higher and these
are simultaneously the newest and least-revisited things in a corpus, which is the best
possible position in most ranking schemes.

Using the Empirical MCP memory tools (preferred):

```text
record_graph_memory({
  category: "debugging",
  summary: "Scar tissue: <symptom>; cause: <cause>; prevention: <prevention>; verification: <verification>",
  tags: ["<project>", "scar-tissue"],
  mass: 1
})
```

CLI fallback:

```text
empirical memory record --category debugging --summary "Scar tissue: <symptom>; cause: <cause>; prevention: <prevention>; verification: <verification>" --tags <project>,scar-tissue --mass 1
```

Never store credentials, tokens, private keys, raw prompts, or unrelated transient output.

## Query before repeating a risky path

Before changing a subsystem with known sharp edges, query memories using the project and
`scar-tissue` tag. Follow the latest user instruction and current repository state if they
conflict with an older lesson.
