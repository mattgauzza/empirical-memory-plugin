---
name: empirical-memory
description: "Cross-project personal memory via the Empirical CLI and MCP tools. Recalls prior decisions, preferences, and conventions; persists new durable ones. TRIGGER — call query_memories BEFORE any substantive response or tool use — do not skip because the task \"looks solvable without it\" or \"probably isn't in memory\" — whenever: research, debugging, spec/prd, status, handoff, personal health, lead management, assistant ops, user references past context, user corrects your behavior, or prior context is likely useful. Also use when the user explicitly asks to remember, recall, or forget something."
when_to_use: "TRIGGER — call query_memories BEFORE any substantive response or tool use — do not skip because the task \"looks solvable without it\" or \"probably isn't in memory\" — whenever: research, debugging, spec/prd, status, handoff, personal health, lead management, assistant ops, user references past context, user corrects your behavior, or prior context is likely useful. Also use when the user explicitly asks to remember, recall, or forget something."
---

## Empirical Memory - Use It Like grep/view

Prefer calling the `empirical` CLI directly via Bash over the MCP tools when both are
available: `empirical memory query|record|note|update|delete`. The CLI doesn't require an
extra tool-discovery step the way the deferred Empirical MCP tools do. The MCP tools
(`query_memories`, `record_graph_memory`, `add_note_by_query`, `update_memory_by_query`,
`delete_memory_by_query`, `get_user`) remain available as a fallback or for structured/graph
queries the CLI doesn't cover.

### Policy
- For these workflows (research, debugging, spec/prd, status, handoff, personal health, lead management, assistant ops), call `query_memories` before substantive response.
- Outside required workflows, use Empirical proactively when prior context is likely useful.
- If Empirical tools fail, stop and report the failure before making code changes.
- If a memory call returns auth/session errors (`Auth required`, `invalid_token`, `Authentication required`, `Transport send error`), treat it as expired MCP auth.
- Retry the same MCP tool call once before taking any other action.
- If retry fails, refresh Empirical MCP auth for the active client before continuing memory-dependent work:
- Codex CLI: run `codex mcp logout empirical` then `codex mcp login empirical`.
- Claude Code: run `/mcp`, reconnect/re-authenticate the Empirical server, then retry the failed tool call.
- Copilot CLI: complete the MCP OAuth reconnect/sign-in flow for Empirical in Copilot, then retry the failed tool call.
- After re-authentication, retry the original tool call once; if it still fails, stop and ask the user to repair MCP auth/connectivity.
- If memory conflicts with the latest repo/user instruction, follow repo/user instruction.
- Persist durable coding style preferences and conventions when they are established.
- Persist durable architecture/design decisions for future sessions.
- Check memory before asking the user to restate prior context.
- Use available Empirical MCP tools when appropriate: record_graph_memory, query_memories, add_note_by_query, update_memory_by_query, delete_memory_by_query, get_user.
- Persist only durable context; never store secrets, tokens, or one-off transient values.
- Keep writes concise, factual, and easy to query.

### Command reference
Run `empirical doc memory` via Bash for exact flags/usage before guessing syntax.
