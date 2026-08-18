---
name: empirical-todo
description: Track actionable follow-ups by project, with clear status, next action, and completion evidence.
---

# Empirical Todo

Use this Skill when the user asks to create, review, prioritize, update, or complete a todo.
Todos belong to a real project: a repository, product, personal goal, health goal, or other
named area of responsibility.

## Create a todo

Before creating one, identify the project. If the project is unclear, ask one concise question.
Create one durable memory with:

- `category`: `project`
- `nodeType`: `goal` (the graph model does not use a separate todo node type)
- `summary`: the action, desired outcome, and project name
- `tags`: `todo`, a normalized project tag, and optional area/status tags
- `data`: structured fields. `status` is REQUIRED (see below); `project`, `priority`, `dueDate`,
  `nextAction` and `source` when known

Keep the action concrete and independently completable. Split a request into multiple todos when
the actions have different owners, projects, or completion criteria.

## Update and complete

- Query by project and `todo` before creating a possible duplicate.
- Update the existing memory when the action, status, priority, due date, or next action changes.
- Mark a todo complete only when the user says it is done or durable verification proves it is done.
- Preserve a concise completion note and verification; do not silently delete completed work.
- Ask before changing project ownership or converting a todo into an unrelated memory type.

## Review and prioritize

When asked for todos, group by project and show only actionable items by default. Surface blocked,
overdue, and stale items first. Do not invent due dates or priorities. If the user asks for a plan,
create or update the individual project todos only after the user accepts the proposed breakdown.

### `status` is required, not optional

A todo without a status cannot be told apart from one that was finished months ago, so anything
reading todos has to either ignore them or risk resurfacing completed work. Record `data.status`
on every write and keep it current: `open`, `in_progress`, `deferred`, `future`, `done`,
`cancelled`. Always carry the `todo` tag as well — that is what identifies the memory as a todo
at all.

Using the Empirical MCP tools (preferred):

```text
query_memories({ match: "todo <project>" })

record_graph_memory({
  category: "project",
  nodeType: "goal",
  summary: "<action and outcome>",
  tags: ["todo", "<project>"],
  data: { project: "<project>", status: "open", nextAction: "<the next concrete step>" }
})
```

CLI fallback:

```text
empirical memory query --match "todo <project>"
empirical memory record --category project --node-type goal --summary "<action and outcome>" --tags todo,<project> --data '{"status":"open","project":"<project>"}'
```

Never store credentials, tokens, raw transcripts, or private health details that are not necessary
to define the user's requested goal.
