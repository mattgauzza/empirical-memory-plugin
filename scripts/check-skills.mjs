#!/usr/bin/env node
// Fails if any SKILL.md has frontmatter that is not valid YAML, or lacks a
// non-empty string `name` / `description`.
//
//   node scripts/check-skills.mjs
//
// Why this exists: empirical-voice 1.0.1 shipped a description with an unquoted
// ": " inside it. That is invalid YAML, Claude Code silently hid the skill from the
// model, and `claude plugin validate --strict` still passed. Needs the `yaml`
// package (CI does `npm install --no-save yaml`); set NODE_PATH if it lives elsewhere.

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(join(process.cwd(), 'noop.js'));
let YAML;
try {
  YAML = require('yaml');
} catch {
  console.error('Missing dependency: run `npm install --no-save yaml` (or set NODE_PATH).');
  process.exit(2);
}

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const files = [];
const addSkillsDir = (dir) => {
  if (!existsSync(dir)) return;
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const f = join(dir, e.name, 'SKILL.md');
    if (e.isDirectory() && existsSync(f)) files.push(f);
  }
};
addSkillsDir(join(repoRoot, 'skills'));
if (existsSync(join(repoRoot, 'plugins'))) {
  for (const p of readdirSync(join(repoRoot, 'plugins'))) addSkillsDir(join(repoRoot, 'plugins', p, 'skills'));
}
// Test hook: extra files may be passed as arguments.
files.push(...process.argv.slice(2).map((f) => resolve(f)));

let failed = 0;
for (const file of files) {
  const rel = file.startsWith(repoRoot) ? file.slice(repoRoot.length + 1) : file;
  const text = readFileSync(file, 'utf8').replace(/^﻿/, '').replace(/\r\n/g, '\n');
  const m = text.match(/^---\n([\s\S]*?)\n---(\n|$)/);
  const errors = [];
  if (!m) {
    errors.push('no --- frontmatter block at the top of the file');
  } else {
    const doc = YAML.parseDocument(m[1]);
    if (doc.errors.length) errors.push(...doc.errors.map((e) => `invalid YAML: ${e.message.split('\n')[0]}`));
    else {
      const data = doc.toJS();
      for (const key of ['name', 'description']) {
        if (typeof data?.[key] !== 'string' || !data[key].trim()) errors.push(`missing or empty string \`${key}\``);
      }
    }
  }
  if (errors.length) {
    failed++;
    console.error(`FAIL ${rel}`);
    for (const e of errors) console.error(`  ${e}`);
  } else console.log(`ok   ${rel}`);
}
if (failed) process.exit(1);
console.log(`${files.length} SKILL.md file(s) have valid frontmatter.`);
