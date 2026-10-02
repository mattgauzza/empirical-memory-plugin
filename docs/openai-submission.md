# Submit Empirical Memory to OpenAI

This package contains the core Empirical Memory skill and the authenticated server at `https://empirical.gauzza.com/mcp`. It uses the portable Agent Plugins format. Optional work-history, scar-tissue, todo and guided-setup plugins remain separate.

## Build and verify

Run from the plugin repository with Node.js 22 or newer:

```powershell
node scripts/build-manifests.mjs --check
node --test tests/openai-submission.test.mjs
node scripts/build-openai-submission.mjs --check
node scripts/build-openai-submission.mjs
```

The output is `dist/empirical-memory-openai-1.3.5.zip` plus a `.zip.report.json` with its SHA-256, file inventory and remaining review requirements. The version comes from the core plugin in `meta/manifests.json`; update that version for later releases. Run the native manifest generator after metadata changes.

The ZIP contains only these five files:

```text
plugin.json
mcp.json
skills/empirical-memory/SKILL.md
assets/logo.png
LICENSE
```

The builder maps the existing `SKILL.mcp.md` to the packaged `SKILL.md`; the normal marketplace skill remains unchanged. Bundled text uses LF line endings and the ZIP uses fixed timestamps so equivalent Windows and Linux checkouts produce the same bytes. It declares the remote endpoint without account tokens, passwords or a client secret. OAuth setup happens through the portal and installation flow. The existing native `.mcp.json` configuration remains unchanged.

Offline checks cover metadata limits, paths, assets, review case shape, skill frontmatter, the one-server MCP configuration and the file allowlist. They do not certify OAuth, tool behavior, public URL contents, safety scans, approval or publication. A passing offline report is not a claim that the plugin is ready for final review.

To include an actual accessible recording URL:

```powershell
node scripts/build-openai-submission.mjs --demo-url 'https://your-recording-host/your-actual-recording'
```

The placeholder above is command syntax only. No placeholder recording URL is included in the package. Omitting the recording field allows an existing dashboard value to remain in place; supply the URL through secure review details if preferred.

## Reviewer setup and walkthrough

Create a dedicated Empirical test account and a workspace named `OpenAI Review`. Use synthetic records only. The account must be accessible to the reviewer without an email/SMS code, magic link, MFA approval or private network. Keep it available for subsequent reviews. Verify the actual login and OAuth flow with that account; do not reuse the old server harness as evidence of a successful browser login.

Enter credentials, login URL, workspace selection and sign-in instructions in the portal's secure **Review details** form. Never put them in `meta/manifests.json`, a skill, the ZIP, a video, a test report or a public document. This document describes the procedure and contains no credentials.

Select the `OpenAI Review` workspace with `set_current_workspace` before the cases. The five positive cases in `meta/manifests.json` are sequential:

1. Save Project Lantern's demo milestone as 15 November 2026, tagged `openai-review` and `project-lantern`.
2. Recall the saved milestone with the `project-lantern` tag.
3. Update the exact memory ID to 22 November 2026.
4. Browse every `project-lantern` record, following all continuation cursors.
5. Read that memory and traverse its neighbors; an empty neighbor list is valid.

Then run the three negative cases: unsupported banking transfer, access to another customer's private workspace and storing a synthetic password. The expected fallback for each is described in its case metadata. No real password is needed.

Retain the memory ID from case one. Repeated runs may merge the same record; do not require a new ID or a fixed result count. For a clean repeat, restore the milestone through case one. Do not bulk-delete review data as an implicit setup step. If the search index has not caught up, retry the recall after a short delay and document the actual outcome.

Record a walkthrough showing the installed plugin, account connection, workspace selection, all eight prompts, tool calls and results. Hide login credentials and any token-bearing screens. Demonstrate the main flows in both ChatGPT and Codex; record actual outcomes, including any failures. None of these cases has been executed as part of the offline ZIP build.

## Upload and existing plugin identity

Use the existing OpenAI plugin card if Empirical is already submitted or published. Check its downloaded release manifest: the package `name` must match the existing package identity before uploading an update. This source package uses `empirical-memory`; the public display name is `Empirical Memory`. Do not create a duplicate plugin to bypass held tool checks. The endpoint URL is preserved.

Upload the complete ZIP, choose the verified developer identity and inspect the imported listing, skills and review cases. All four listing URLs are provided. The eight imported cases are managed through the ZIP: edit the canonical metadata and rebuild if they need changes. Keep saved country availability by omitting `publication.countries`.

Complete the domain challenge at the exact URL supplied by OpenAI, returning only the exact token as plain text. Do not replace a challenge token used by another plugin. Connect OAuth, wait for the scans, enter reviewer access and the recording URL, review the attestations and submit. Publishing is a separate action after approval.

## Held MCP tool updates

“This tool update needs further review before it can go live” does not identify a schema or implementation defect. Open the tool's **Issues found**, **Held update** and **Live definition**. Save the actual evaluated definition and differences before changing anything. Check read-only, destructive and open-world annotations against real handler behavior; privacy-sensitive responses and shared server instructions also need review.

Existing tools retain the approved metadata while a changed definition is held. The actual server implementation remains live, so preserve backward compatibility. A new ZIP updates skills and listing metadata; it does not approve held hosted tool changes. Use Rescan after a justified server change, or Appeal with evidence when the finding is incorrect. Include the plugin ID and scan details in support requests; do not claim an unproven cause.

The initial audit identified `update_blueprint` as worth checking because it marks old managed memories inactive and removes their graph edges while advertising `destructiveHint: false`. That server annotation has not been changed or deployed by this packaging work. The generic held messages for `record_graph_memory` and `query_memories` have no specific diagnosis yet.

## Sources

- [OpenAI submission guide](https://developers.openai.com/plugins/deploy/submission)
- [Package format](https://developers.openai.com/plugins/build/plugins)
- [Submission errors and final limits](https://developers.openai.com/plugins/deploy/submission-errors)
- [Remote MCP review requirements](https://developers.openai.com/plugins/deploy/app-review)
