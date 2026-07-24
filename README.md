# empirical-memory

Cross-tool, cross-project memory for Claude Code, Codex CLI, and GitHub Copilot CLI, powered by
[Empirical](https://empirical.gauzza.com).

Start an idea in ChatGPT, pick it up in your coding agent with full context carried over. Track
leads and relationships as durable memory instead of a separate CRM. Organize memory into
separate workspaces for personal, team, or client contexts. Recalls prior decisions, preferences,
and conventions across sessions and projects, and persists new durable ones as you work — so you
don't have to re-explain context you've already given elsewhere.

## What this plugin installs

- A skill (`skills/empirical-memory/SKILL.md`) that tells your agent when to query and persist
  memory during a session.
- An MCP server connection (`.mcp.json`) to the Empirical memory service. On first use you'll
  be prompted to sign in via OAuth. The same server also connects from ChatGPT Apps, so memory
  recorded from one client is visible from every other.

## Install

**Claude Code**

```
/plugin install mattgauzza/empirical-memory-plugin
```

**Codex CLI**

```
codex marketplace add mattgauzza/empirical-memory-plugin
```

or browse/install via the `/plugins` command.

**GitHub Copilot CLI**

```
copilot plugin install mattgauzza/empirical-memory-plugin
```

or use the `/plugin install` slash command.

## Optional: the `empirical` CLI

The skill prefers the `empirical` CLI over MCP tools when both are available, since it avoids
an extra tool-discovery round trip. The CLI is not bundled with this plugin — install it
separately from [empirical.gauzza.com](https://empirical.gauzza.com) if you want that path;
otherwise the bundled MCP tools work standalone.

## License

MIT
