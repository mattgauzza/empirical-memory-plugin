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

## Before doing work

1. Query relevant memories before any substantive response or tool call when the task may benefit from prior context. This includes research, debugging, PRDs/specs, status, handoffs, personal health, leads, CRM, and assistant operations.
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

## Persist durable context

- Record durable decisions, project conventions, preferences, plans, and meaningful reflections with `record_graph_memory` or:

  ```text
  empirical memory record --category <category> --summary "<concise fact>" --tags <tag1,tag2>
  ```

- Append a correction or follow-up to an existing memory with `add_note_by_query` / `empirical memory note`.
- Patch an existing memory with `update_memory_by_query` / `empirical memory update`.
- Delete only when the user explicitly asks; use the delete tool with confirmation, or `empirical memory delete --match "<memory>" --confirm`.
- Keep writes concise, factual, and easy to search. Never store passwords, API keys, OAuth tokens, or other secrets.

## MCP tools

Use these when connected: `get_empirical_policy`, `query_memories`, `record_graph_memory`, `add_note_by_query`, `update_memory_by_query`, `delete_memory_by_query`, `get_user`, `get_current_workspace`, `list_workspaces`, and `set_current_workspace`. For graph work, use `get_memory_neighbors` and `update_memory_relationships` when available instead of reconstructing relationships through many unrelated calls.

## Authentication and failures

- If a memory call fails, retry the same call once.
- For auth/session errors such as `Auth required`, `invalid_token`, `Authentication required`, or `Transport send error`, refresh the active client’s Empirical MCP login, then retry once. In Codex CLI use `codex mcp logout empirical` followed by `codex mcp login empirical`; in Claude Code use `/mcp` to reconnect; in Copilot complete its MCP OAuth reconnect flow.
- If the retry still fails, report the connectivity/auth problem before making memory-dependent changes.
- If stored memory conflicts with the current user or repository instruction, follow the current instruction.

## Exact CLI syntax

Run `empirical doctor` to check connectivity and token status. If a CLI memory command reports a token error, run `empirical oauth bootstrap headless --write-env`.
