'use strict';

// Dependency-free validation + smoke tests for the OpenHarness data, schema, and CLI.

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

let failures = 0;
function check(cond, msg) {
  if (cond) console.log('  ok   ' + msg);
  else { console.log('  FAIL ' + msg); failures++; }
}

function isUrl(v) { return /^https?:\/\/\S+$/.test(String(v)); }
const ID_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const INTERFACES = ['cli', 'ide', 'sdk', 'api', 'web'];
const CAP_KEYS = ['sandbox', 'tools', 'mcp', 'permissions', 'resume', 'subagents'];

// 1. data/harnesses.json
const dataDir = path.join(__dirname, 'data', 'harnesses');
const data = fs.readdirSync(dataDir).filter((f) => f.endsWith('.json'))
  .map((f) => JSON.parse(fs.readFileSync(path.join(dataDir, f), 'utf8')))
  .sort((a, b) => String(a.id).localeCompare(String(b.id)));
check(Array.isArray(data), 'data/harnesses.json is an array');
check(data.length > 0, 'data/harnesses.json has entries (got ' + data.length + ')');

const ids = new Set();
for (const h of data) {
  const n = h && h.name ? h.name : '(unnamed)';
  check(typeof h.id === 'string' && ID_RE.test(h.id), 'harness "' + n + '" has a valid slug id');
  if (h.id) { check(!ids.has(h.id), 'harness "' + n + '" has a unique id'); ids.add(h.id); }

  for (const req of ['name', 'description', 'categories', 'interfaces']) {
    if (req === 'categories' || req === 'interfaces') {
      check(Array.isArray(h[req]) && h[req].length > 0, 'harness "' + n + '" has non-empty ' + req);
    } else {
      check(typeof h[req] === 'string' && h[req].trim() !== '', 'harness "' + n + '" has ' + req);
    }
  }
  check(typeof h.oss === 'boolean', 'harness "' + n + '" has boolean oss');
  check(typeof h.description === 'string' && h.description.length >= 20, 'harness "' + n + '" has a >=20-char description');
  if (h.interfaces) check(h.interfaces.every((i) => INTERFACES.includes(i)), 'harness "' + n + '" has valid interfaces');

  for (const u of ['homepage', 'docs', 'github', 'repo']) {
    if (h[u] != null && h[u] !== '') check(isUrl(h[u]), 'harness "' + n + '" has a valid ' + u + ' URL');
  }
  if (h.github) check(!/\/blob\//.test(h.github), 'harness "' + n + '" github points to repo root (not a blob)');
  for (const u of ['homepage', 'docs', 'github', 'repo']) {
    if (h[u]) check(!/openharnessai/.test(h[u]), 'harness "' + n + '" ' + u + ' does not self-reference');
  }
  if (h.capabilities) {
    for (const k of CAP_KEYS) {
      const v = h.capabilities[k];
      check(v === true || v === false || v === 'unknown', 'harness "' + n + '" capability "' + k + '" is true/false/unknown');
    }
  }
}

// 2. docs/schema.json
const schema = JSON.parse(fs.readFileSync(path.join(__dirname, 'docs', 'schema.json'), 'utf8'));
check(Array.isArray(schema.required), 'schema has a required array');
check(schema.required.includes('id') && schema.required.includes('name'), 'schema requires id + name');
check(schema.additionalProperties === false, 'schema forbids additional properties');

// 3. CLI commands
function runCli(args) {
  return execFileSync(process.execPath, ['harness.js'].concat(args), { encoding: 'utf8', cwd: __dirname });
}
check(runCli(['list']).includes('harnesses'), 'cli list prints harnesses');
check(runCli(['search', 'coding']).includes('match'), 'cli search finds matches');
check(JSON.parse(runCli(['show', 'Claude Code', '--json'])).name === 'Claude Code', 'cli show --json works');
check(runCli(['help']).includes('Usage'), 'cli help prints usage');
check(runCli(['table']).startsWith('| Name |'), 'cli table prints a table');
check(runCli(['stats', '--json']).length > 0, 'cli stats --json works');
runCli(['validate', 'docs/example-card.json']);
check(true, 'cli validate accepts a valid card');

if (failures > 0) {
  console.log('\n' + failures + ' failure(s)');
  process.exit(1);
}
console.log('\nAll tests passed');
