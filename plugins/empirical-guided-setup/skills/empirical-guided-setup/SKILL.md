---
name: empirical-guided-setup
description: Conduct a guided-interview blueprint setup, using Empirical's list_guided_setups/start_guided_setup/continue_guided_setup/finish_guided_setup MCP tools (or CLI equivalents), to personalize a blueprint's content from the user's real answers.
---

# Empirical Guided Setup

Use this skill whenever the user wants to run a guided interview to personalize a blueprint
(phrases like "set up my work setup," "run the guided interview," "personalize this blueprint").

1. Call `list_guided_setups` (MCP) or `empirical setup list` (CLI) to see available interviews. If
   an entry is `locked: true`, relay its `upgradeMessage` honestly and stop.
2. Call `start_guided_setup(setupId)` / `empirical setup run <setupId>`.
3. Ask each returned question conversationally and record the answer via
   `continue_guided_setup(sessionId, answer)` / `empirical setup answer <sessionId> <questionKey> <value>`.
   Keep going until the response reports `status: "completed"`.
4. If the user wants to stop early, call `finish_guided_setup(sessionId)` / `empirical setup finish <sessionId>`
   instead of continuing to ask questions — unanswered questions fall back to sensible defaults.
5. On completion, tell the user their personalized blueprint is installing.
