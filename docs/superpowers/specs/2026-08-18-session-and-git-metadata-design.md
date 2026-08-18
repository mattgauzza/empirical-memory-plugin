# Session and Git Metadata Design

## Goal

Make scar-tissue and work-history records traceable to the coding session and
the commits they describe, without imposing metadata on non-coding work.

## Scope

Update the `empirical-scar-tissue` and `empirical-work-history` skill
instructions. No API schema or CLI command change is required: both skills
will pass metadata through the existing structured `data` payload.

## Capture rule

Before creating either record, an agent must inspect its available runtime
context and the current working directory.

- When a session transcript path is exposed by Codex, Claude, or Copilot,
  record it with the runtime name.
- When the working directory is inside a Git repository, collect the
  repository root, worktree path, current branch, and current `HEAD`.
- Include commits made during the current coding session that materially relate
  to the entry, as `{ hash, subject }` objects.
- Include every value successfully discovered. Omit only fields that are not
  available; agents must not invent paths, commits, branches, or runtime names.
- Outside a Git repository or a runtime without an exposed transcript path,
  the record proceeds normally with the available metadata omitted.

## Metadata shape

```json
{
  "session": {
    "runtime": "codex",
    "transcriptPath": "C:\\Users\\matt\\.codex\\sessions\\2026\\08\\03\\rollout-...jsonl"
  },
  "git": {
    "repoPath": "M:\\Projects\\empirical_v2",
    "worktreePath": "M:\\Projects\\empirical_v2",
    "branch": "main",
    "startCommit": "abc1234",
    "relatedCommits": [
      { "hash": "def5678", "subject": "feat: persist onboarding dismissal" }
    ]
  }
}
```

`startCommit` is the checked-out `HEAD` collected at recording time. It is a
stable reference point when the runtime does not expose the session's original
starting commit; the label intentionally describes the recorded value rather
than claiming stronger provenance.

## Instruction design

The skill text will treat context collection as a required pre-write step in
coding sessions, not an optional enhancement. It will include a short
checklist, the no-guessing rule, and MCP/CLI examples that carry the `data`
object while preserving each skill's existing tags and `mass: 1` requirements.

## Validation

Validate the edited skill markdown/package metadata, run a focused textual
contract check for the required capture checklist and example payloads, update
the package archive, and commit the design and implementation separately.
