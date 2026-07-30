# empirical-memory

Cross-tool, cross-project memory for Claude Code, Codex CLI, and GitHub Copilot CLI, powered by
[Empirical](https://empirical.gauzza.com).

Start an idea in ChatGPT, pick it up in your coding agent with full context carried over. Track
leads and relationships as durable memory instead of a separate CRM. Organize memory into
separate workspaces for personal, team, or client contexts. Recalls prior decisions, preferences,
and conventions across sessions and projects, and persists new durable ones as you work — so you
don't have to re-explain context you've already given elsewhere.

## What this marketplace provides

- `empirical-memory`: the required core memory Skill and MCP server connection.
- `empirical-work-history`: optional concise completed-work summaries.
- `empirical-scar-tissue`: optional recurring failure patterns and prevention guidance.
- `empirical-todo`: optional project-based todos with status and next actions.

Each capability is a separate marketplace plugin, so users can install or remove optional
capabilities without changing the core memory connection.

Package documentation:

- [Core Empirical Memory](./README.md)
- [Work History](./plugins/empirical-work-history/README.md)
- [Scar Tissue](./plugins/empirical-scar-tissue/README.md)
- [Todo](./plugins/empirical-todo/README.md)

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
copilot plugin marketplace update empirical-memory
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

For a first-time setup, run the interactive installer to connect the CLI and supported coding agents:

```bash
empirical install
```

Installing or updating the latest CLI does not require rerunning `empirical install`. Use
`empirical plugin install all` when you only want to refresh the native plugin, or let the CLI
offer a one-time update when a newer marketplace plugin is detected during interactive use.
You can check immediately with `empirical plugin check --force`.

For normal interactive CLI use without a permanent API key, run `empirical auth login` to sign in
through the browser and save a local OAuth session. Headless bootstrap is still available for
automation and external runtimes.

If you only want the plugin's MCP connection, you can skip the CLI installation.

If the CLI is already installed and you only need to install or refresh the native plugin, use:

```bash
empirical plugin install codex       # or copilot, claude, or all
```

Add optional capabilities explicitly with `--work-history`, `--scar-tissue`, `--todo`, or
`--all-optional`.

This does not run the full MCP/auth questionnaire or modify global instruction files.

Optional capabilities selected by the `empirical install` questionnaire are installed through the
same marketplace pathway. Neither records raw transcripts or secrets. Personalized answers are
stored as the server-side Empirical policy and cached locally for native skills; they are not
written into global `AGENTS.md`, `CLAUDE.md`, or Copilot instruction files.

## License

MIT
