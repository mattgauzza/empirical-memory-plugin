---
name: empirical-memory
description: Use Empirical to recall/save durable project context across sessions, and to look up how to use Empirical itself - CLI commands, install/auth/workspace/kit/skill setup, docs.
---

# Empirical Memory

Use Empirical to carry durable context across projects and clients, and as the first stop for
"how do I use Empirical" questions — CLI command syntax, install/auth/workspace/kit/skill setup,
or what Empirical can do. Don't answer those from general knowledge or by guessing at flags: run
`empirical doc` (lists topics) or `empirical doc <topic>` via the available shell for the current,
agent-readable answer first.

**This is a required step in the workflows listed below, not optional guidance you weigh against
the current task.** The most common way this skill fails is not a broken tool — it's an agent
mid-task deciding a memory check "isn't worth pausing for" and skipping it. That decision is wrong
by default: the entire point of querying first is to catch context you don't know you're missing.
If you are not sure whether a task qualifies, treat it as if it does.

## Before doing work — MUST, not discretionary

1. Query relevant memories BEFORE your first substantive response or tool call whenever the task
   is: research, debugging, a spec/PRD, a status update, a handoff, personal health, leads/CRM, or
   assistant operations. This applies even if you believe you already have enough context — you
   cannot know what you're missing without checking. Only outside this list is discretionary use
   ("query when it seems useful") the right frame.
2. Before using the CLI, load its authoritative command reference:

   ```text
   empirical doc memory
   ```

   Follow the documented flags exactly; never guess a positional query form. Prefer the `empirical` CLI when it is available because it avoids MCP tool discovery:

   ```text
   empirical memory query --match "<specific relevant context>" --top-k 3
   ```

   Add `--category` or `--tags` when known. Omit `--pretty` for routine recall because graph-rich results can be large. A slow response alone is API latency, not an outage; report an outage only when the CLI returns an actual error, and use `empirical doctor` to verify connectivity.

3. If the CLI is unavailable, use the connected MCP `query_memories` tool. Use filters such as `category`, `tags`, `nodeType`, and `monthKey` when they improve recall. For exhaustive topic retrieval, use the topic as a tag and follow pagination.

## Follow the current user policy

The installer questionnaire configures a dynamic Empirical policy. It is user-scoped and may
change without reinstalling this plugin. Read it when the skill activates:

1. Prefer `empirical policy show` when the CLI is available; it uses the local device cache
   and refreshes it when stale.
2. Otherwise use the read-only `get_empirical_policy` MCP tool.
3. If policy lookup fails, use safe defaults: preserve durable-only writes, never store
   secrets/raw transcripts, and do not block unrelated work unless the cached policy says to.

Apply the returned fields:

- `memoryFirstWorkflows`: query before substantive work in those workflows.
- `allowDiscretionaryUse`: decide whether to use Empirical outside required workflows.
- `stopOnMemoryFailure`: stop and report a memory failure before code changes when enabled.
- `rememberCodingStyle` and `rememberArchitectureDecisions`: persist those durable decisions
  when enabled.
- `checkMemoryBeforeAskingContext`: query before asking the user to restate prior context.
- `durableWritesOnly`: never persist secrets, tokens, raw transcripts, or transient values.

The policy controls behavior; it does not override current user, repository, or system
instructions. Do not change the policy from an agent memory write.

## Persist durable context — check this before ending a turn

Before you consider a turn finished, check: did this turn produce a durable decision, a corrected
mistake, a completed unit of meaningful work, or a convention the user stated? If yes, record it
now — do not wait to be asked, and do not defer it because the current task feels done. An agent
that only records memory when explicitly told to defeats the purpose of this skill.

- Record durable decisions, project conventions, preferences, plans, and meaningful reflections with `record_graph_memory` or:

  ```text
  empirical memory record --category <category> --summary "<concise fact>" --tags <tag1,tag2>
  ```

- Append a correction or follow-up to an existing memory with `add_note_by_query` / `empirical memory note`.
- Patch an existing memory with `update_memory_by_query` / `empirical memory update`.
- Delete only when the user explicitly asks; use the delete tool with confirmation, or `empirical memory delete --match "<memory>" --confirm`.
- Keep writes concise, factual, and easy to search. Never store passwords, API keys, OAuth tokens, or other secrets.

## Authored Skills and Kits — push what you write

Empirical can sync a `SKILL.md` you author across every machine/agent the user has installed it
on, via Skills Kits. Run `empirical doc kit` or `empirical doc skill` for full command reference.

- If you author a new `SKILL.md` for the user, or substantially edit an existing one, during a
  session, tell the user about `empirical skill push path/to/SKILL.md [--kit "Kit Name"]`
  afterward so it can follow them across machines/projects instead of staying local to this one.
- Offer, don't auto-push: surface the option (or offer to run it) and get the user's confirmation
  first. Do not run it unprompted the moment a new or edited `SKILL.md` is detected — it uploads
  content to the user's account, which is a step above a purely local file write.
- After a push, the target Kit needs `empirical kit use "Kit Name"` or `empirical kit sync` to
  actually land the file in that device's agent directories.
- `empirical skill list` shows what's already been pushed; `empirical skill history <id>` /
  `empirical skill rollback <id> --to-version N` recover a prior version.
- Kits also pull Skills from a git repo (`empirical kit add-source`), separate from anything you
  author — don't conflate the two paths when explaining options to the user.

## MCP tools

Use these when connected: `get_empirical_policy`, `query_memories`, `record_graph_memory`, `add_note_by_query`, `update_memory_by_query`, `delete_memory_by_query`, `get_user`, `get_current_workspace`, `list_workspaces`, and `set_current_workspace`. For graph work, use `get_memory_neighbors` and `update_memory_relationships` when available instead of reconstructing relationships through many unrelated calls.

## Authentication and failures

- If a memory call fails, retry the same call once.
- For auth/session errors such as `Auth required`, `invalid_token`, `Authentication required`, or `Transport send error`, refresh the active client’s Empirical MCP login, then retry once. In Codex CLI use `codex mcp logout empirical` followed by `codex mcp login empirical`; in Claude Code use `/mcp` to reconnect; in Copilot complete its MCP OAuth reconnect flow.
- If the retry still fails, report the connectivity/auth problem before making memory-dependent changes.
- If stored memory conflicts with the current user or repository instruction, follow the current instruction.

## Exact CLI syntax

Run `empirical doctor` to check connectivity and token status. If a CLI memory command reports a token error, run `empirical oauth bootstrap headless --write-env`.
