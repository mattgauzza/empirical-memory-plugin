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

## Coding-session trace metadata — capture before every coding write

When recording scar tissue that came from coding work, collect the context below **before**
writing the memory. This is a required capture step, not optional polish:

1. If the host exposes a transcript/session file, record its runtime (`codex`, `claude`, or
   `copilot`) and exact path.
2. If the current directory is inside Git, record the repository root, worktree path, current
   branch, and current `HEAD`.
3. Include every commit made during this coding session that materially relates to the lesson,
   with its hash and subject.
4. Put every value you successfully discover in `data.session` / `data.git`. Omit only a value
   that the host or Git cannot provide.

Never invent, infer, or guess a transcript path, runtime, branch, commit hash, or original
session starting commit. A non-Git task or a host that does not expose its transcript proceeds
normally with only the metadata that is actually available.

Use this shape when values are available:

```json
{
  "session": { "runtime": "codex", "transcriptPath": "C:\\path\\to\\session.jsonl" },
  "git": {
    "repoPath": "M:\\Projects\\repo",
    "worktreePath": "M:\\Projects\\repo",
    "branch": "main",
    "startCommit": "abc1234",
    "relatedCommits": [{ "hash": "def5678", "subject": "fix: prevent recurrence" }]
  }
}
```

Using the Empirical MCP memory tools (preferred):

```text
record_graph_memory({
  category: "debugging",
  summary: "Scar tissue: <symptom>; cause: <cause>; prevention: <prevention>; verification: <verification>",
  tags: ["<project>", "scar-tissue"],
  mass: 1,
  data: {
    session: { runtime: "<runtime>", transcriptPath: "<known transcript path>" },
    git: {
      repoPath: "<git root>", worktreePath: "<worktree path>", branch: "<branch>",
      startCommit: "<current HEAD>", relatedCommits: [{ hash: "<hash>", subject: "<subject>" }]
    }
  }
})
```

CLI fallback:

```text
empirical memory record --json-file <path-to-payload.json>
```

The CLI JSON payload carries the same `data.session` and `data.git` object shown above, plus
`category`, `summary`, `tags`, and `mass: 1`. Do not drop trace metadata just because the CLI
form is less convenient.

Never store credentials, tokens, private keys, raw prompts, or unrelated transient output.

## Query before repeating a risky path

Before changing a subsystem with known sharp edges, query memories using the project and
`scar-tissue` tag. Follow the latest user instruction and current repository state if they
conflict with an older lesson.
