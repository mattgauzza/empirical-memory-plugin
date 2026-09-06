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

Record one memory per completed unit of work, not one memory per session. A session that shipped a
fix, a migration, and a copy change records three entries. Each summary names the change, the
component, and the date so a question about any one of them finds it. Do not record intermediate
steps that did not ship, and do not fold several shipped things into one summary.

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

## Coding-session trace metadata — capture before every coding write

When recording completed coding work, collect the context below **before** writing the memory.
This is a required capture step, not optional polish:

1. Identify the runtime and its exact session identifier. Record `runtime` and `sessionId` whenever
   either is discoverable; a runtime name alone is not sufficient session trace metadata.
   - **Codex:** when the current resume UUID is available, find the exact file whose name contains
     it under `~/.codex/sessions/` and record both `sessionId` and `transcriptPath`. Never select
     the newest session file as a substitute for an ID match.
   - **Claude Code:** use the hook input's `session_id` and `transcript_path`. In a non-hook
     subprocess, `CLAUDE_CODE_SESSION_ID` supplies the ID; record `transcriptPath` only when an
     exact path is also supplied or verified.
   - **Copilot CLI:** use the hook input's `sessionId` (or `session_id`). Copilot does not
     guarantee a per-session transcript path. Record `sessionStatePath` only when the exact
     `~/.copilot/session-state/<sessionId>/` directory exists (respect `COPILOT_HOME` when set).
2. If the current directory is inside Git, record the repository root, worktree path, current
   branch, and current `HEAD`.
3. Include every commit made during this coding session that materially relates to the completed
   work, with its hash and subject.
4. Put every value you successfully discover in `data.session` / `data.git`. Omit only a value
   that the host or Git cannot provide.

Never invent, infer, or guess a session ID, transcript path, session-state path, runtime, branch,
commit hash, or original session starting commit. A non-Git task or a host without a discoverable
session proceeds normally with only the metadata that is actually available.

Use this shape when values are available:

```json
{
  "session": {
    "runtime": "codex",
    "sessionId": "<verified session UUID>",
    "transcriptPath": "C:\\path\\to\\session.jsonl"
  },
  "git": {
    "repoPath": "M:\\Projects\\repo",
    "worktreePath": "M:\\Projects\\repo",
    "branch": "main",
    "startCommit": "abc1234",
    "relatedCommits": [{ "hash": "def5678", "subject": "feat: complete work" }]
  }
}
```

Using the Empirical MCP memory tools (preferred):

```text
record_graph_memory({
  category: "build",
  summary: "<timestamped completed-work summary>",
  tags: ["<project>", "work-history"],
  mass: 1,
  data: {
    session: {
      runtime: "<codex|claude|copilot>", sessionId: "<verified session ID>",
      transcriptPath: "<known transcript path, only when verified>",
      sessionStatePath: "<Copilot state directory, only when verified>"
    },
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

Use `update_memory_by_query` or `empirical memory update` when the summary already exists and
needs correction. Never store credentials, tokens, private keys, raw prompts, or unrelated
transient output.

## Querying history

When recovering project context, query by project, feature, date range, or work-history tag. Treat
the latest user instruction and current repository state as authoritative if they conflict with
an older work-history entry.
