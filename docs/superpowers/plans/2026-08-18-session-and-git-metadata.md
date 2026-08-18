# Session and Git Metadata Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Require discoverable session and Git trace metadata on scar-tissue and work-history records.

**Architecture:** Extend the two existing skill instructions with a common required pre-write capture step and structured `data` examples. Preserve their current tags and low-mass behavior; only omit values unavailable from the runtime or Git.

**Tech Stack:** Markdown agent skills, Empirical MCP tools, Empirical CLI, Git, PowerShell validation.

## Global Constraints

- Never guess transcript paths, runtime names, branches, or commit hashes.
- Capture available metadata in coding sessions; do not block non-Git or transcript-less workflows.
- Keep `scar-tissue`/`work-history` tags and `mass: 1` on every write.

---

### Task 1: Add mandatory capture guidance

**Files:**
- Modify: `plugins/empirical-scar-tissue/skills/empirical-scar-tissue/SKILL.md`
- Modify: `plugins/empirical-work-history/skills/empirical-work-history/SKILL.md`

**Interfaces:**
- Consumes: runtime session context and Git commands from the active coding environment.
- Produces: a `data.session` and `data.git` payload attached to MCP writes.

- [ ] Add the same required pre-write checklist to each skill.
- [ ] Require runtime/transcript capture when exposed, and Git root/worktree/branch/HEAD plus session-related commits when inside a repository.
- [ ] Add no-guessing and omit-only-when-unavailable rules.
- [ ] Update MCP and CLI examples to show `data.session` and `data.git` while retaining each skill's existing category, tags, and mass.

### Task 2: Validate and package local plugin changes

**Files:**
- Modify: `empirical-memory-skill.zip`
- Verify: `.claude-plugin/plugin.json`, `.codex-plugin/plugin.json`, `plugins/*/skills/*/SKILL.md`

**Interfaces:**
- Consumes: edited skill markdown.
- Produces: an updated local package and an installed Codex plugin cachebuster/reinstall.

- [ ] Run the available plugin/skill validators and a textual contract check for the required capture instructions.
- [ ] Rebuild `empirical-memory-skill.zip` from the package source.
- [ ] Update the local plugin cachebuster and reinstall the plugin source used by Codex.
- [ ] Start a new thread for runtime pickup, if required by the host.
