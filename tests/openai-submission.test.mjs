import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, mkdtempSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { buildPackage, validatePackage, createZip } from '../scripts/build-openai-submission.mjs';

const repo = new URL('../', import.meta.url);
const fixture = () => buildPackage(repo);
const manifest = (files) => JSON.parse(files.get('plugin.json'));
const patchManifest = (files, change) => {
  const value = manifest(files);
  change(value);
  files.set('plugin.json', Buffer.from(JSON.stringify(value)));
};

test('core package has one portable root, MCP-first skill, assets and eight review cases', () => {
  const files = fixture();
  assert.equal(manifest(files).name, 'app-699db5f04b788191a4f9ee070d3e5d67');
  assert.deepEqual([...files.keys()].sort(), [
    'LICENSE', 'assets/logo.png', 'mcp.json', 'plugin.json', 'skills/empirical-memory/SKILL.md'
  ]);
  assert.match(files.get('skills/empirical-memory/SKILL.md').toString(), /MCP server is the primary/);
  const openai = manifest(files).extensions['com.openai'];
  assert.equal(openai.review.test_cases.positive.length, 5);
  assert.equal(openai.review.test_cases.negative.length, 3);
  assert.equal(validatePackage(files).errors.length, 0);
  assert.ok(validatePackage(files).remaining.some((s) => /recording/i.test(s)));
  assert.equal(JSON.parse(files.get('mcp.json')).mcpServers.empirical.url, 'https://empirical.gauzza.com/mcp');
});

test('validation catches final listing limits, unsafe URLs and missing referenced assets', () => {
  const files = fixture();
  patchManifest(files, (m) => {
    m.extensions['com.openai'].interface.shortDescription = 'x'.repeat(31);
    m.extensions['com.openai'].interface.supportURL = 'https://user:password@example.com';
  });
  files.delete('assets/logo.png');
  const errors = validatePackage(files).errors.join('\n');
  assert.match(errors, /shortDescription/);
  assert.match(errors, /supportURL/);
  assert.match(errors, /assets\/logo.png/);
});

test('validation rejects archive traversal, lifecycle hooks and private reviewer fields', () => {
  const files = fixture();
  files.set('../outside.txt', Buffer.from('unsafe'));
  files.set('hooks/hooks.json', Buffer.from('{}'));
  patchManifest(files, (m) => { m.extensions['com.openai'].review.test_credentials = 'private'; });
  const errors = validatePackage(files).errors.join('\n');
  assert.match(errors, /outside.txt/);
  assert.match(errors, /hooks/);
  assert.match(errors, /test_credentials/);
  assert.throws(() => createZip(files), /Invalid package/);
});

test('builder excludes unlisted files even when private files exist in the source tree', () => {
  const root = mkdtempSync(join(tmpdir(), 'empirical-package-'));
  try {
    for (const name of ['meta', 'assets', 'skills/empirical-memory']) mkdirSync(join(root, name), { recursive: true });
    for (const name of ['meta/manifests.json', 'assets/logo.png', 'skills/empirical-memory/SKILL.mcp.md', 'LICENSE']) {
      writeFileSync(join(root, name), readFileSync(new URL(name, repo)));
    }
    writeFileSync(join(root, '.env'), 'PRIVATE=do-not-bundle');
    writeFileSync(join(root, 'reviewer-password.txt'), 'do-not-bundle');
    const files = buildPackage(root);
    assert.equal(files.has('.env'), false);
    assert.equal(files.has('reviewer-password.txt'), false);
    assert.equal(files.size, 5);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test('ZIP has stable bytes and valid signatures; walkthrough option resolves recording reminder', () => {
  const files = buildPackage(repo, { demoUrl: 'https://empirical.gauzza.com/review/demo' });
  const zip = createZip(files);
  assert.deepEqual(zip, createZip(files));
  assert.equal(zip.readUInt32LE(0), 0x04034b50);
  assert.equal(zip.readUInt32LE(zip.length - 22), 0x06054b50);
  assert.equal(zip.readUInt16LE(zip.length - 12), 5);
  assert.ok(!validatePackage(files).remaining.some((s) => /recording/i.test(s)));
});

test('Windows CRLF and Unix LF source files produce identical ZIP bytes', () => {
  const root = mkdtempSync(join(tmpdir(), 'empirical-line-endings-'));
  try {
    for (const name of ['meta', 'assets', 'skills/empirical-memory']) mkdirSync(join(root, name), { recursive: true });
    for (const name of ['meta/manifests.json', 'assets/logo.png', 'skills/empirical-memory/SKILL.mcp.md', 'LICENSE']) {
      writeFileSync(join(root, name), readFileSync(new URL(name, repo)));
    }
    for (const name of ['skills/empirical-memory/SKILL.mcp.md', 'LICENSE']) {
      writeFileSync(join(root, name), readFileSync(join(root, name), 'utf8').replace(/\r\n/g, '\n').replace(/\n/g, '\r\n'));
    }
    const windows = createZip(buildPackage(root));
    for (const name of ['skills/empirical-memory/SKILL.mcp.md', 'LICENSE']) {
      writeFileSync(join(root, name), readFileSync(join(root, name), 'utf8').replace(/\r\n/g, '\n'));
    }
    assert.equal(createZip(buildPackage(root)).equals(windows), true);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test('validation rejects broken review counts, missing expected results, invalid MCP and tiny icons', () => {
  const files = fixture();
  patchManifest(files, (m) => {
    m.extensions['com.openai'].review.test_cases.negative.pop();
    delete m.extensions['com.openai'].review.test_cases.positive[0].expected_behavior;
  });
  files.set('mcp.json', Buffer.from(JSON.stringify({ mcpServers: { empirical: { type: 'stdio', command: 'node' } } })));
  const logo = Buffer.from(files.get('assets/logo.png'));
  logo.writeUInt32BE(16, 16);
  files.set('assets/logo.png', logo);
  const errors = validatePackage(files).errors.join('\n');
  assert.match(errors, /three negative/);
  assert.match(errors, /expected_behavior/);
  assert.match(errors, /streamable-http/);
  assert.match(errors, /48/);
});
