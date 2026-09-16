---
name: empirical-scar-tissue
description: Check for, and record, known failure patterns and sharp edges in this project. Use BEFORE risky or repeated work - deploying, releasing, migrating, running a destructive or bulk command, editing a subsystem that has bitten before, or retrying something that failed - to recall what already went wrong there. Also use AFTER a failure, surprise, or corrected misconception, to record the lesson.
---

# Empirical Scar Tissue

Two halves, and the recall half is the one that gets skipped.

Scar tissue is what should not be repeated, as opposed to work history, which is what was
completed. A lesson nobody reads is just a diary, so this Skill starts with reading.

## Query BEFORE you act

Before deploying, releasing, migrating, running a destructive or bulk command, touching a
subsystem that has bitten before, or retrying something that just failed, ask what is already
known. It costs one call.

MCP:

```text
query_memories({
  query: "<what you are about to do, in plain words>",
  tags: ["<project>", "scar-tissue"],
  topK: 5
})
```

CLI:

```text
empirical memory query --match "<what you are about to do>" --tags scar-tissue --top-k 5
```

**The `scar-tissue` tag in the filter is required, not decoration.** Retrieval excludes agent
process notes from ordinary questions by default, so a normal query returns none of this
material. An explicit tag filter is what turns it back on. Without the tag you will get a
confident, empty-handed answer.

Why this is a hard rule rather than a nicety, measured 2026-09-16 on a real two-month corpus:
393 scar-tissue memories, **71.2% of which had never once been retrieved**, against 59.3% for
ordinary memories of the same age. 151 of them carry an explicit "this happened again" marker.
The lessons were not ignored. They were never read.

When a result contradicts the current repository state or the user's latest instruction, the
current state and the user win. Say that you found the older lesson and why you are departing
from it, rather than silently following or silently ignoring it.

## Record useful scar tissue

Create one concise, queryable memory containing:

- `symptom`: what failed or surprised the agent
- `cause`: the verified root cause, if known
- `prevention`: the rule or check that prevents recurrence
- `verification`: how the fix or prevention was confirmed
- `scope`: repository, tool, or workflow where it applies

Prefer durable lessons over incident transcripts.

One lesson per memory. If a debugging session surfaced two root causes, record two scar-tissue
memories. The summary must contain the fix or the failing symptom in the words a future agent would
search for (the error text, the function name, the flag), plus the date.

Record it in Empirical before writing anything to a local memory file. A local note is not a record.

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
3. Include every commit made during this coding session that materially relates to the lesson,
   with its hash and subject.
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
    "relatedCommits": [{ "hash": "def5678", "subject": "fix: prevent recurrence" }]
  }
}
```

Using the Empirical MCP memory tools (preferred):

```text
record_graph_memory({
  category: "debugging",
  // A lesson the agent learned from its own mistake: agent-authored by definition.
  authorType: "agent",
  summary: "Scar tissue: <symptom>; cause: <cause>; prevention: <prevention>; verification: <verification>",
  tags: ["<project>", "scar-tissue"],
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
  },
  links: [{ relationType: "derived_from", targetQuery: "<the incident, work-history entry, or decision this lesson came from>" }]
})
```

Link the lesson to what it came from; a lesson with no origin cannot be walked back to its cause.

CLI fallback:

```text
empirical memory record --json-file <path-to-payload.json>
```

The CLI JSON payload carries the same `data.session` and `data.git` object shown above, plus
`category`, `summary`, `tags`, and `mass: 1`. Do not drop trace metadata just because the CLI
form is less convenient.

Never store credentials, tokens, private keys, raw prompts, or unrelated transient output.

## After recording, check the recall side

A lesson is only worth the query that finds it. When you record one, write the summary with the
words a future agent would actually search for: the command, the file, the error text, the
subsystem. "Scar tissue: deploy" is unfindable. "railway up from the repo root uploads the
working directory, not the service" is findable.
