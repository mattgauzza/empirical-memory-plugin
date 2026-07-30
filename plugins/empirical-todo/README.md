# Empirical Todo

Optional Empirical plugin for tracking actionable follow-ups by project.

## What it does

- Associates every todo with a real project: a repository, product, life area, or goal.
- Tracks status, priority, due date, next action, and completion evidence when supplied.
- Queries by project before creating a possible duplicate.
- Preserves concise completion notes instead of silently deleting finished work.

Todos are stored as `category: project` and `nodeType: goal`; the Empirical graph does not use a
separate `todo` node type.

## Install

From the Empirical marketplace:

```bash
empirical plugin install all --todo
```

Or install directly with the native client marketplace command, using the plugin name
`empirical-todo`.

This package requires the core `empirical-memory` plugin and uses the user's existing Empirical
MCP/OAuth connection.
