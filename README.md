# empirical-memory

Cross-tool, cross-project memory for Claude Code, Codex CLI, and GitHub Copilot CLI, powered by
[Empirical](https://empirical.gauzza.com).

Start an idea in ChatGPT, pick it up in your coding agent with full context carried over. Track
leads and relationships as durable memory instead of a separate CRM. Organize memory into
separate workspaces for personal, team, or client contexts. Recalls prior decisions, preferences,
and conventions across sessions and projects, and persists new durable ones as you work — so you
don't have to re-explain context you've already given elsewhere.

## What this plugin installs

- Skills (`skills/empirical-memory/` and `skills/empirical-work-history/`) that tell your agent
  when to query, persist, and summarize durable work history during a session.
- An optional `empirical-scar-tissue` Skill for recording recurring failure patterns, sharp edges,
  and prevention guidance discovered during work.
- An MCP server connection (`.mcp.json`) to the Empirical memory service. On first use you'll
  be prompted to sign in via OAuth. The same server also connects from ChatGPT Apps, so memory
  recorded from one client is visible from every other.

## Install

**Claude Code**

```
claude plugin marketplace add mattgauzza/empirical-memory-plugin
claude plugin install empirical-memory --scope user
```

**Codex CLI**

```
codex marketplace add mattgauzza/empirical-memory-plugin
codex plugin add empirical-memory@empirical-memory
```

or browse/install via the `/plugins` command.

**GitHub Copilot CLI**

```
copilot plugin marketplace add mattgauzza/empirical-memory-plugin
copilot plugin marketplace upgrade
copilot plugin install empirical-memory@empirical-memory
```

or use the `/plugin install` slash command.

## Recommended: install the latest `empirical` CLI

The MCP tools work standalone, but the Skills prefer the `empirical` CLI when it is available.
The CLI provides the most reliable auth path, direct memory commands, and avoids an extra MCP
tool-discovery round trip. It is not bundled with this plugin; install or update the latest
version separately:

```bash
npm install -g https://empirical.gauzza.com/downloads/cli/empirical-cli-latest.tgz
```

Then run the interactive installer to connect the CLI and supported coding agents:

```bash
empirical install
```

For normal interactive CLI use without a permanent API key, run `empirical auth login` to sign in
through the browser and save a local OAuth session. Headless bootstrap is still available for
automation and external runtimes.

If you only want the plugin's MCP connection, you can skip the CLI installation.

If the CLI is already installed and you only need to install or refresh the native plugin, use:

```bash
empirical plugin install codex       # or copilot, claude, or all
```

This does not run the full MCP/auth questionnaire or modify global instruction files.

`empirical-work-history` and `empirical-scar-tissue` are optional capabilities guided by the
`empirical install` questionnaire. Work history records concise completed-work summaries;
scar tissue records recurring failure patterns and prevention guidance. Neither records raw
transcripts or secrets.

## License

MIT
