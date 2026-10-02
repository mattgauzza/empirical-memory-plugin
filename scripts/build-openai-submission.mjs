#!/usr/bin/env node
// Portable public package. No runtime dependencies or recursive source-tree copying.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const json = (value) => Buffer.from(`${JSON.stringify(value, null, 2)}\n`);
const textFile = (path) => Buffer.from(readFileSync(path, 'utf8').replace(/\r\n?/g, '\n'));
const projectRoot = fileURLToPath(new URL('../', import.meta.url));
const httpsUrl = (value) => {
  try {
    const url = new URL(value);
    return typeof value === 'string' && value.length <= 1024 && url.protocol === 'https:' &&
      !!url.hostname && !url.username && !url.password && !/\s/.test(value);
  } catch { return false; }
};

export function buildPackage(root = projectRoot, { demoUrl } = {}) {
  root = root instanceof URL ? fileURLToPath(root) : resolve(root);
  const meta = JSON.parse(readFileSync(join(root, 'meta/manifests.json'), 'utf8'));
  const core = meta.plugins.find((plugin) => plugin.source === '.');
  if (!core || !meta.openaiSubmission) throw new Error('Missing canonical core submission metadata');
  const review = structuredClone(meta.openaiSubmission.review);
  if (demoUrl !== undefined) {
    if (!httpsUrl(demoUrl)) throw new Error('Walkthrough URL must be HTTPS with no embedded credentials');
    review.demo_recording_url = demoUrl;
  }
  const manifest = {
    $schema: 'https://agent-plugins.org/schemas/1.0.0/plugin.schema.json',
    name: core.name,
    version: core.version,
    description: core.descriptions.openai,
    author: { ...meta.shared.author, url: meta.shared.homepage },
    homepage: meta.shared.homepage,
    repository: meta.shared.repository,
    license: meta.shared.license,
    keywords: core.keywords,
    extensions: {
      'com.openai': {
        interface: {
          displayName: core.displayName,
          developerName: meta.shared.developerName,
          category: meta.shared.category,
          capabilities: ['Save memories', 'Search memories', 'Update memories', 'Browse memory connections'],
          ...core.catalog
        },
        review,
        publication: meta.openaiSubmission.publication
      }
    }
  };
  return new Map([
    ['plugin.json', json(manifest)],
    ['mcp.json', json({
      $schema: 'https://agent-plugins.org/schemas/1.0.0/mcp.schema.json',
      mcpServers: { empirical: { type: 'streamable-http', url: meta.openaiSubmission.mcpUrl } }
    })],
    ['skills/empirical-memory/SKILL.md', textFile(join(root, 'skills/empirical-memory/SKILL.mcp.md'))],
    ['assets/logo.png', readFileSync(join(root, 'assets/logo.png'))],
    ['LICENSE', textFile(join(root, 'LICENSE'))]
  ]);
}

export function validatePackage(files) {
  const errors = [];
  const remaining = [
    'Select the verified developer identity in the OpenAI portal.',
    'Provide a dedicated synthetic-data reviewer account through secure Review details.',
    'Run all eight cases with that account in ChatGPT and Codex and record the actual outcomes.',
    'Verify the domain and OAuth connection and complete the portal skill/tool scans.',
    'Resolve or appeal held tool updates using the evaluated metadata and actual findings.'
  ];
  const allowed = new Set(['plugin.json', 'mcp.json', 'skills/empirical-memory/SKILL.md', 'assets/logo.png', 'LICENSE']);
  let total = 0;
  for (const [name, bytes] of files) {
    if (!allowed.has(name) || name.includes('..') || name.includes('\\') || name.startsWith('/')) {
      errors.push(`Unapproved archive path: ${name}`);
    }
    if (!Buffer.isBuffer(bytes)) { errors.push(`Non-buffer file: ${name}`); continue; }
    total += bytes.length;
    if (bytes.length > 5 * 1024 * 1024) errors.push(`File exceeds package policy of 5 MiB: ${name}`);
  }
  if (total > 100 * 1024 * 1024) errors.push('Package exceeds 100 MB');
  for (const path of allowed) if (!files.has(path)) errors.push(`Missing required file: ${path}`);
  const parse = (path) => {
    try { return JSON.parse(files.get(path)?.toString('utf8')); }
    catch { errors.push(`Invalid JSON: ${path}`); return {}; }
  };
  const manifest = parse('plugin.json');
  const openai = manifest.extensions?.['com.openai'] ?? {};
  const listing = openai.interface ?? {};
  const text = (object, key, max) => {
    const value = object?.[key];
    if (typeof value !== 'string' || !value.trim() || value.length > max || /[\x00-\x08\x0b-\x1f\x7f\u200b-\u200f\u2028\u2029\ufeff]/.test(value)) {
      errors.push(`Invalid ${key}: non-empty supported text of at most ${max} characters required`);
    }
  };
  text(manifest, 'name', 64);
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(manifest.name ?? '')) errors.push('Invalid portable package name');
  if (!/^\d+\.\d+\.\d+(?:-[\w.-]+)?(?:\+[\w.-]+)?$/.test(manifest.version ?? '')) errors.push('Invalid semantic version');
  text(manifest, 'description', 4000);
  text(manifest.author, 'name', 120);
  for (const [key, max] of [['displayName', 30], ['shortDescription', 30], ['longDescription', 4000], ['developerName', 80]]) text(listing, key, max);
  if (!['Productivity', 'Developer Tools'].includes(listing.category)) errors.push('Unsupported category for this package');
  for (const key of ['websiteURL', 'supportURL', 'privacyPolicyURL', 'termsOfServiceURL']) {
    if (!httpsUrl(listing[key])) errors.push(`Invalid ${key}: HTTPS URL without credentials required`);
  }
  const prompts = Array.isArray(listing.defaultPrompt) ? listing.defaultPrompt : [listing.defaultPrompt];
  if (prompts.length > 3 || prompts.some((p) => typeof p !== 'string' || !p.trim() || p.length > 128 || /[@\r\n]/.test(p)) || new Set(prompts.map((p) => String(p).normalize('NFKC').trim())).size !== prompts.length) {
    errors.push('Invalid defaultPrompt: up to three unique single-line prompts required');
  }
  for (const key of ['logo', 'composerIcon']) {
    const path = listing[key];
    if (typeof path !== 'string' || !path.startsWith('./') || !files.has(path.slice(2))) errors.push(`Missing ${key} reference: ${path}`);
  }
  const png = files.get('assets/logo.png');
  if (png) {
    const validHeader = png.length >= 33 && png.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])) && png.toString('ascii', 12, 16) === 'IHDR';
    const width = validHeader ? png.readUInt32BE(16) : 0;
    const height = validHeader ? png.readUInt32BE(20) : 0;
    if (!validHeader || width !== height || width < 48 || width > 4096) errors.push('Logo must be a square PNG between 48 and 4096 pixels');
  }
  const skill = files.get('skills/empirical-memory/SKILL.md')?.toString('utf8') ?? '';
  if (!/^---\r?\nname: empirical-memory\r?\ndescription: .+\r?\n---/.test(skill)) errors.push('Core skill must have valid name and description frontmatter');
  const mcp = parse('mcp.json');
  const servers = Object.values(mcp.mcpServers ?? {});
  if (servers.length !== 1 || servers[0]?.type !== 'streamable-http' || !httpsUrl(servers[0]?.url)) errors.push('Exactly one remote HTTPS streamable-http MCP server required');
  if (servers.some((server) => Object.keys(server).some((key) => !['type', 'url'].includes(key)))) errors.push('MCP config contains non-public connection fields');
  const review = openai.review ?? {};
  for (const key of ['test_credentials', 'reviewer_instructions']) if (key in review) errors.push(`Private review field forbidden: ${key}`);
  for (const key of ['apps', 'hooks']) if (key in openai) errors.push(`Public submission excludes ${key}`);
  const positive = review.test_cases?.positive;
  const negative = review.test_cases?.negative;
  if (!Array.isArray(positive) || positive.length !== 5) errors.push('Exactly five positive review cases required');
  if (!Array.isArray(negative) || negative.length !== 3) errors.push('Exactly three negative review cases required');
  for (const item of Array.isArray(positive) ? positive : []) for (const key of ['description', 'prompt', 'tools_triggered', 'expected_behavior']) text(item, key, 4000);
  for (const item of Array.isArray(negative) ? negative : []) for (const key of ['description', 'prompt']) text(item, key, 4000);
  if (review.demo_recording_url === undefined) remaining.push('Add an accessible walkthrough recording URL in Review details or rebuild with --demo-url.');
  else if (!httpsUrl(review.demo_recording_url)) errors.push('Invalid demo_recording_url');
  text(openai.publication, 'release_notes', 4000);
  return { errors, remaining };
}

function crc32(bytes) {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit++) crc = (crc >>> 1) ^ ((crc & 1) ? 0xedb88320 : 0);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

// Small stored ZIP writer: fixed DOS timestamp, UTF-8 paths, sorted entries, CRC32.
export function createZip(files) {
  const report = validatePackage(files);
  if (report.errors.length) throw new Error(`Invalid package:\n${report.errors.join('\n')}`);
  const localParts = [];
  const centralParts = [];
  let offset = 0;
  for (const [path, bytes] of [...files].sort(([a], [b]) => a.localeCompare(b, 'en'))) {
    const name = Buffer.from(path);
    const crc = crc32(bytes);
    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt16LE(0x800, 6);
    local.writeUInt16LE(33, 12); // 1980-01-01
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(bytes.length, 18);
    local.writeUInt32LE(bytes.length, 22);
    local.writeUInt16LE(name.length, 26);
    localParts.push(local, name, bytes);
    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50, 0);
    central.writeUInt16LE(20, 4);
    central.writeUInt16LE(20, 6);
    central.writeUInt16LE(0x800, 8);
    central.writeUInt16LE(33, 14);
    central.writeUInt32LE(crc, 16);
    central.writeUInt32LE(bytes.length, 20);
    central.writeUInt32LE(bytes.length, 24);
    central.writeUInt16LE(name.length, 28);
    central.writeUInt32LE(offset, 42);
    centralParts.push(central, name);
    offset += local.length + name.length + bytes.length;
  }
  const directory = Buffer.concat(centralParts);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(files.size, 8);
  end.writeUInt16LE(files.size, 10);
  end.writeUInt32LE(directory.length, 12);
  end.writeUInt32LE(offset, 16);
  return Buffer.concat([...localParts, directory, end]);
}

function main(args) {
  const options = {};
  let check = false;
  let out;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--check') check = true;
    else if (['--out', '--demo-url'].includes(args[i])) {
      const flag = args[i];
      const value = args[++i];
      if (!value || value.startsWith('--')) throw new Error(`Missing value for ${flag}`);
      if (flag === '--out') out = value; else options.demoUrl = value;
    } else throw new Error(`Unknown argument: ${args[i]}`);
  }
  const files = buildPackage(projectRoot, options);
  const report = validatePackage(files);
  if (report.errors.length) throw new Error(report.errors.join('\n'));
  if (!check) {
    const version = JSON.parse(files.get('plugin.json')).version;
    const path = resolve(out ?? join(projectRoot, 'dist', `empirical-memory-openai-${version}.zip`));
    const zip = createZip(files);
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, zip);
    report.zipPath = path;
    report.sha256 = createHash('sha256').update(zip).digest('hex');
    report.bytes = zip.length;
    report.files = [...files.keys()].sort();
    writeFileSync(`${path}.report.json`, json(report));
  }
  console.log(JSON.stringify({ offlineValidation: 'passed', ...report }, null, 2));
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { main(process.argv.slice(2)); }
  catch (error) { console.error(error.message); process.exitCode = 1; }
}
