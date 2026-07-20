# empirical-memory

Cross-project personal memory for Claude Code, powered by [Empirical](https://empirical.gauzza.com).

Recalls prior decisions, preferences, and conventions across sessions and projects, and
persists new durable ones as you work — so you don't have to re-explain context you've
already given Claude in a different project or a past session.

## What this plugin installs

- A skill (`skills/empirical-memory/SKILL.md`) that tells Claude when to query and persist
  memory during a session.
- An MCP server connection (`.mcp.json`) to the Empirical memory service. On first use you'll
  be prompted to sign in via OAuth.

## Optional: the `empirical` CLI

The skill prefers the `empirical` CLI over MCP tools when both are available, since it avoids
an extra tool-discovery round trip. The CLI is not bundled with this plugin — install it
separately from [empirical.gauzza.com](https://empirical.gauzza.com) if you want that path;
otherwise the bundled MCP tools work standalone.

## License

MIT
