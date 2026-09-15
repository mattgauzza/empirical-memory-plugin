---
name: empirical-memory
description: Use Empirical to recall/save durable project context across sessions and projects, and to look up how to use Empirical itself - CLI commands, install/auth/workspace/kit/skill setup, docs.
---

# Empirical Memory (MCP mode)

Use Empirical to carry durable context across projects and clients, and as the first stop for
"how do I use Empirical" questions — command syntax, install/auth/workspace/kit/skill setup, or
what Empirical can do. Don't answer those from general knowledge or by guessing: use the
`memory_usage_guide` MCP tool for the current, agent-readable answer first.

This variant is for installs where the user chose MCP as their integration mode. The connected
Empirical MCP server is the primary and expected way to reach Empirical here — use its tools
directly, not `empirical` CLI commands, as the first move.

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
2. If you have not used Empirical's MCP tools yet this session, call `memory_usage_guide` once to
   confirm current tool names, filters, and pagination behavior before relying on memory.
3. Use the `query_memories` MCP tool for recall. Use filters such as `category`, `tags`,
   `nodeType`, and `monthKey` when they improve recall. For "recent/latest/today" requests, prefer
   `list_memories` instead — it is the tool built for that shape of request. For exhaustive topic
   retrieval, use the topic as a tag and follow pagination.
4. A slow response alone is API latency, not an outage; report an outage only when a tool call
   returns an actual error, and use `get_empirical_policy` or a retry to verify connectivity before
   escalating.
5. A filtered `query_memories` call (`category`, `tags`, `nodeType`) that returns nothing is not
   proof the memory doesn't exist — it only proves nothing matched that exact filter combination.
   A memory's real category or tag convention often does not match how you or the user would
   naturally describe it in conversation (e.g. described as "an idea" but stored under a
   different category; tagged with a project's short name where you tried its full one). Before
   concluding a memory doesn't exist, retry at least once with the filter relaxed or removed —
   category dropped, tags loosened to an OR match, or a plain unfiltered query — rather than only
   varying the search phrase.
6. If a specific recall miss turns out to have a narrow, demonstrable cause (a filter mismatch, a
   stale tag, a wrong category), stop there. Report that cause and move on — do not generalize one
   miss into a theory about the memory system being broken and then go build measurement or
   debugging work around the theory. Confirm the narrow cause is insufficient before entertaining a
   systemic explanation, not after.

## Follow the current user policy

The installer questionnaire configures a dynamic Empirical policy. It is user-scoped and may
change without reinstalling this plugin. Read it when the skill activates:

1. Use the read-only `get_empirical_policy` MCP tool.
2. If policy lookup fails, use safe defaults: preserve durable-only writes, never store
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

- Record durable decisions, project conventions, preferences, plans, and meaningful reflections
  with the `record_graph_memory` MCP tool. It runs write-intent classification, dedupe, and
  auto-linking automatically — you do not need to check for duplicates yourself first.

  **One idea per memory, not a bundle.** When a turn produces several distinct facts or ideas
  worth keeping, record each with its own `record_graph_memory` call rather than folding them
  into one large memory. Calling it multiple times in the same turn is expected usage, not
  overhead to be minimized. A compound memory is harder to find later (a query matching one idea
  in it won't surface the others as well) and harder to link precisely into the graph than several
  atomic ones.

  **Record facts about the USER, not about your own work.** You are a scribe here. "Matt prefers
  short status updates" is a memory; "refactored the cluster selector, tests pass" is your diary
  and belongs in the work-history skill, tagged and with `mass: 1`. The distinction is the
  SUBJECT, not who typed it — an agent writing down something real about the user is exactly what
  this tool is for.

  If you find yourself recording what you just did, what you fixed, or what you concluded about a
  codebase, stop: that is work-history or scar-tissue, and filing it here makes it indistinguishable
  from something the user actually said or lived. Downstream features read these as the user's life.

  **Say which one it is: pass `authorType`.** Same distinction, made explicit in the data instead
  of left to be guessed from which transport you happened to use. `authorType: "user"` when the
  memory is about the user — something they said, decided, prefer, or are working toward.
  `authorType: "agent"` when it is your own work. Do not set `"agent"` merely because you are the
  one calling: an agent writing down a real fact about the user is recording a user-authored fact,
  and that is the whole point of this tool. On the CLI it is `--author-type user|agent`. Omit it
  when you genuinely cannot tell, and it stays unresolved rather than being invented.

  This is read back at retrieval time to keep an agent's session notes out of answers about the
  user's own life and work, so a wrong value does not show up as a warning, it shows up as the
  wrong memories coming back.

- Append a correction or follow-up to an existing memory with `add_note_by_query`.
- Patch an existing memory with `update_memory_by_query`.
- Delete only when the user explicitly asks; use `delete_memory_by_query` with confirmation.
- If the target memory was created earlier in this same session, pass its `memoryId` instead of
  `query`. Search indexing can lag a few seconds behind a fresh write, so a fuzzy match can briefly
  return not-found for a memory that was just created, even though it exists.
- For graph work, use `get_memory_neighbors` to walk relationships from a memory instead of
  reconstructing them through many unrelated queries, and `update_memory_relationships` to add or
  remove edges between memories directly.
- Keep writes concise, factual, and easy to search. Never store passwords, API keys, OAuth tokens,
  or other secrets.

## Authored Skills and Kits — push what you write

Empirical can sync a `SKILL.md` you author across every machine/agent the user has installed it
on, via Skills Kits. Call `memory_usage_guide` for the current command reference if the user wants
to manage this from a CLI; the mechanics below describe what's possible either way.

- If you author a new `SKILL.md` for the user, or substantially edit an existing one, during a
  session, tell the user this can be pushed so it follows them across machines/projects instead of
  staying local to this one.
- Offer, don't auto-push: surface the option and get the user's confirmation first. Do not push it
  unprompted the moment a new or edited `SKILL.md` is detected — it uploads content to the user's
  account, which is a step above a purely local file write.
- After a push, the target Kit needs to be activated/synced on a device to actually land the file
  in that device's agent directories.
- Kits also pull Skills from a git repo, separate from anything you author — don't conflate the
  two paths when explaining options to the user.

## MCP tools

Use these as the primary interface: `get_empirical_policy`, `query_memories`, `list_memories`,
`record_graph_memory`, `add_note_by_query`, `update_memory_by_query`, `delete_memory_by_query`,
`get_user`, `get_current_workspace`, `list_workspaces`, `set_current_workspace`,
`memory_usage_guide`, `get_memory_neighbors`, and `update_memory_relationships`.

Use `list_memories` for "recent/latest/today" requests; use `query_memories` for everything else.
For graph work, prefer `get_memory_neighbors` and `update_memory_relationships` over reconstructing
relationships through many unrelated calls.

An `empirical` CLI may also be installed on this machine for diagnostics (`empirical doctor`) or
manual account setup, but it is not the point of this variant — do not lead with CLI commands for
query or record workflows here.

## Authentication and failures

- If an MCP tool call fails, retry the same call once.
- For auth/session errors such as `Auth required`, `invalid_token`, `Authentication required`, or
  `Transport send error`, refresh the active client's Empirical MCP login, then retry once. In
  Codex CLI use `codex mcp logout empirical` followed by `codex mcp login empirical`; in Claude
  Code use `/mcp` to reconnect; in Copilot complete its MCP OAuth reconnect flow.
- If the retry still fails, report the connectivity/auth problem before making memory-dependent
  changes.
- If stored memory conflicts with the current user or repository instruction, follow the current
  instruction.
