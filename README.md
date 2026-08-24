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

## Mode-aware skill content

`skills/empirical-memory/` contains four files, not one:

- `SKILL.mcp.md` — for installs where the user chose MCP-only. Leads with MCP tools, mentions the
  CLI only as an aside.
- `SKILL.cli.md` — for installs where the user chose CLI-direct. Leads with `empirical` CLI
  commands as the confidently-recommended path, MCP mentioned only as a fallback.
- `SKILL.both.md` — for installs where the user chose both. CLI preferred where available (a
  latency/scripting preference, not a safety one now that both paths dedupe and auto-link the
  same way), MCP as fallback.
- `SKILL.md` — the file every host's native plugin mechanism actually reads (Claude Code, Codex
  CLI, and GitHub Copilot CLI all resolve a plugin's skill from the literal `SKILL.md` filename;
  none of their manifest schemas support selecting among sibling variant files at install time).
  Kept identical to `SKILL.both.md`, since "both" is the safest default for any consumer that
  hasn't been made mode-aware (an old CLI version, a direct git clone, a host with no CLI
  installed at all).

The `empirical` CLI is what actually makes the mode choice matter: after a native plugin install
or update, it overwrites the on-disk `SKILL.md` for that host with the variant matching the user's
chosen integration mode (see `packages/cli/lib/installers/nativePlugin.js` in the main
`empirical_v2` repo). If that overwrite step is missing, out of date, or fails, every install still
gets a working "both" skill from this repo — never a missing or broken one.

When editing skill content: update `SKILL.mcp.md`, `SKILL.cli.md`, and `SKILL.both.md` for the
mode-specific "how to query" / "how to record" mechanics; keep the shared policy sections (Before
doing work, Follow the current user policy, Persist durable context, Authored Skills and Kits,
Authentication and failures) consistent across all three by hand — there is no build step that
enforces this. After editing `SKILL.both.md`, copy it over `SKILL.md` so the two never drift:

```bash
cp skills/empirical-memory/SKILL.both.md skills/empirical-memory/SKILL.md
```

## Maintaining the manifests

This repo publishes to four hosts, each with its own manifest format. All of them are
**generated** from a single source of truth, `meta/manifests.json`:

| Generated file | Host |
| --- | --- |
| `.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json` | Claude Code |
| `.codex-plugin/plugin.json` | Codex CLI |
| `.github/plugin/marketplace.json` | GitHub Copilot CLI |
| `.agents/plugins/marketplace.json` | generic AGENTS.md |

plus a `.claude-plugin/` and `.codex-plugin/` pair under each directory in `plugins/`.

Do not hand-edit those files. Edit `meta/manifests.json`, then regenerate:

```bash
node scripts/build-manifests.mjs           # write the manifests
node scripts/build-manifests.mjs --check    # verify nothing drifted (CI runs this)
claude plugin validate . --strict           # same validator the plugin directory runs
```

To bump a version, change it in one place: the plugin's `version` in
`meta/manifests.json`. The marketplace `metadata.version` follows the root plugin
automatically.

Host-specific fields belong to their host. `interface` is a Codex/Copilot block;
Claude Code silently ignores unknown top-level fields, so putting `interface` in a
`.claude-plugin/` file does nothing. Claude's equivalents are `displayName`,
`description`, and `homepage`, and it has no counterpart for `longDescription`,
`category`, `capabilities`, or `defaultPrompt`. The generator encodes this mapping.

## License

MIT
