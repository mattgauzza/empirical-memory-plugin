#!/usr/bin/env node
// Generates every per-host plugin manifest from meta/manifests.json.
//
//   node scripts/build-manifests.mjs           write the files
//   node scripts/build-manifests.mjs --check   verify the committed files match (CI)
//
// Why this exists: the same metadata used to be hand-copied into 11 files across
// four host formats with nothing checking they agreed, and they drifted (three
// different version numbers for the same plugin). Edit meta/manifests.json only.
//
// Host schema notes, learned the hard way:
//   - `interface` is a Codex/Copilot field. Claude Code ignores unknown top-level
//     fields silently, so an `interface` block in a .claude-plugin file does
//     nothing. Claude's equivalents are displayName / description / homepage.
//   - Claude has no equivalent for longDescription, category, capabilities, or
//     defaultPrompt. Those stay in the Codex manifests that actually read them.

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const check = process.argv.includes('--check');

const meta = JSON.parse(readFileSync(join(repoRoot, 'meta', 'manifests.json'), 'utf8'));
const { marketplace, shared, plugins } = meta;
const root = plugins.find((p) => p.source === '.');
if (!root) throw new Error('meta/manifests.json: no plugin with source "."');

const describe = (plugin, host) =>
  plugin.descriptions[host] ?? plugin.descriptions.default ?? plugin.entryDescription;

// --- per-host builders -----------------------------------------------------

// Claude Code: .claude-plugin/plugin.json
// Only fields in the documented manifest schema. No `interface`.
const claudePlugin = (plugin) => ({
  name: plugin.name,
  displayName: plugin.displayName,
  version: plugin.version,
  description: describe(plugin, 'claude'),
  author: shared.author,
  homepage: shared.homepage,
  repository: shared.repository,
  license: shared.license,
  keywords: plugin.keywords,
  skills: shared.skills,
  ...(plugin.mcpServers ? { mcpServers: plugin.mcpServers } : {}),
});

// Codex CLI: .codex-plugin/plugin.json
const codexPlugin = (plugin) => ({
  name: plugin.name,
  version: plugin.version,
  description: describe(plugin, 'codex'),
  author: shared.author,
  homepage: shared.homepage,
  repository: shared.repository,
  license: shared.license,
  keywords: plugin.keywords,
  skills: shared.skills,
  ...(plugin.mcpServers ? { mcpServers: plugin.mcpServers } : {}),
  interface: {
    displayName: plugin.displayName,
    shortDescription: plugin.catalog.shortDescription,
    longDescription: plugin.catalog.longDescription,
    developerName: shared.developerName,
    category: shared.category,
    capabilities: shared.capabilities,
    ...(plugin.catalog.websiteURL ? { websiteURL: plugin.catalog.websiteURL } : {}),
    defaultPrompt: plugin.catalog.defaultPrompt,
  },
});

// Claude Code and Copilot CLI share the same marketplace shape.
const flatMarketplace = (host) => ({
  name: marketplace.name,
  owner: marketplace.owner,
  metadata: {
    description: marketplace.descriptions[host],
    version: root.version,
  },
  plugins: plugins.map((p) => ({
    name: p.name,
    description: p.entryDescription,
    version: p.version,
    source: p.source,
  })),
});

// Generic AGENTS.md marketplace: .agents/plugins/marketplace.json
const agentsMarketplace = () => ({
  name: marketplace.name,
  interface: { displayName: marketplace.displayName },
  plugins: plugins.map((p) => ({
    name: p.name,
    source: { source: 'local', path: p.agentsPath },
    policy: { installation: 'AVAILABLE', authentication: 'ON_INSTALL' },
    category: shared.category,
  })),
});

// --- emit ------------------------------------------------------------------

const targets = [
  ['.claude-plugin/marketplace.json', flatMarketplace('claude')],
  ['.github/plugin/marketplace.json', flatMarketplace('copilot')],
  ['.agents/plugins/marketplace.json', agentsMarketplace()],
];

for (const plugin of plugins) {
  const base = plugin.source === '.' ? '' : `${plugin.source.replace(/^\.\//, '')}/`;
  targets.push([`${base}.claude-plugin/plugin.json`, claudePlugin(plugin)]);
  targets.push([`${base}.codex-plugin/plugin.json`, codexPlugin(plugin)]);
}

let drifted = 0;
for (const [relPath, content] of targets) {
  const absPath = join(repoRoot, relPath);
  const next = `${JSON.stringify(content, null, 2)}\n`;

  if (check) {
    let current = null;
    try {
      current = readFileSync(absPath, 'utf8');
    } catch {
      // missing file counts as drift
    }
    if (current === next) {
      console.log(`  ok      ${relPath}`);
    } else {
      console.error(`  DRIFTED ${relPath}`);
      drifted += 1;
    }
    continue;
  }

  mkdirSync(dirname(absPath), { recursive: true });
  writeFileSync(absPath, next);
  console.log(`  wrote   ${relPath}`);
}

if (check && drifted > 0) {
  console.error(
    `\n${drifted} manifest(s) do not match meta/manifests.json.\n` +
      'Run: node scripts/build-manifests.mjs   then commit the result.',
  );
  process.exit(1);
}

console.log(check ? '\nAll manifests match meta/manifests.json.' : `\nGenerated ${targets.length} manifests.`);
