---
name: empirical-memory
description: Use Empirical CLI and MCP to recall and save durable project context across sessions and projects.
---

# Empirical Memory

Use Empirical to carry durable context across projects and clients.

## Before doing work

1. Query relevant memories before any substantive response or tool call when the task may benefit from prior context. This includes research, debugging, PRDs/specs, status, handoffs, personal health, leads, CRM, and assistant operations.
2. Prefer the `empirical` CLI when it is available because it avoids MCP tool discovery:

   ```text
   empirical memory query --match "<relevant context>" --top-k 10
   ```

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

Use these when connected: `query_memories`, `record_graph_memory`, `add_note_by_query`, `update_memory_by_query`, `delete_memory_by_query`, `get_user`, `get_current_workspace`, `list_workspaces`, and `set_current_workspace`. For graph work, use `get_memory_neighbors` and `update_memory_relationships` when available instead of reconstructing relationships through many unrelated calls.

## Authentication and failures

- If a memory call fails, retry the same call once.
- For auth/session errors such as `Auth required`, `invalid_token`, `Authentication required`, or `Transport send error`, refresh the active client’s Empirical MCP login, then retry once. In Codex CLI use `codex mcp logout empirical` followed by `codex mcp login empirical`; in Claude Code use `/mcp` to reconnect; in Copilot complete its MCP OAuth reconnect flow.
- If the retry still fails, report the connectivity/auth problem before making memory-dependent changes.
- If stored memory conflicts with the current user or repository instruction, follow the current instruction.

## Exact CLI syntax

Run `empirical doc memory` before guessing CLI flags. Run `empirical doctor` to check connectivity and token status. If a CLI memory command reports a token error, run `empirical oauth bootstrap headless --write-env`.
