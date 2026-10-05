'use strict';

// Dependency-free smoke tests for the OpenHarness CLI, data, and schema.

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

let failures = 0;

function check(cond, msg) {
  if (cond) {
    console.log('  ok   ' + msg);
  } else {
    console.log('  FAIL ' + msg);
    failures++;
  }
}

function isUrl(v) {
  return /^https?:\/\/\S+$/.test(String(v));
}

function runCli(args) {
  return execFileSync(process.execPath, ['harness.js'].concat(args), {
    encoding: 'utf8',
    cwd: __dirname,
  });
}

// 1. data/harnesses.json
const data = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'harnesses.json'), 'utf8'));
check(Array.isArray(data), 'data/harnesses.json is an array');
check(data.length === 44, 'data/harnesses.json has 44 harnesses (got ' + data.length + ')');
for (const h of data) {
  const n = h && h.name ? h.name : '(unnamed)';
  check(typeof h.name === 'string' && h.name.trim() !== '', 'harness "' + n + '" has a name');
  check(typeof h.description === 'string' && h.description.trim() !== '', 'harness "' + n + '" has a description');
  for (const k of ['homepage', 'docs', 'github']) {
    if (h[k] != null && h[k] !== '') check(isUrl(h[k]), 'harness "' + n + '" has a valid ' + k + ' URL');
  }
}

// 2. docs/schema.json
const schema = JSON.parse(fs.readFileSync(path.join(__dirname, 'docs', 'schema.json'), 'utf8'));
check(Array.isArray(schema.required), 'schema has a required array');
check(schema.required.includes('name') && schema.required.includes('description'), 'schema requires name + description');

// 3. docs/example-card.json
const example = JSON.parse(fs.readFileSync(path.join(__dirname, 'docs', 'example-card.json'), 'utf8'));
check(
  schema.required.every((r) => typeof example[r] === 'string' && example[r].trim() !== ''),
  'example-card satisfies required fields'
);

// 4. CLI commands
const listOut = runCli(['list']);
check(listOut.includes('44 harnesses'), 'cli list prints 44 harnesses');

const searchOut = runCli(['search', 'coding']);
check(searchOut.includes('match(es) for "coding"'), 'cli search finds matches');

const showJson = runCli(['show', 'Claude Code', '--json']);
check(JSON.parse(showJson).name === 'Claude Code', 'cli show --json returns valid JSON');

const helpOut = runCli(['help']);
check(helpOut.includes('Usage'), 'cli help prints usage');

const tableOut = runCli(['table']);
check(tableOut.startsWith('| Name |'), 'cli table prints a Markdown table');

runCli(['validate', 'docs/example-card.json']);
check(true, 'cli validate accepts a valid card');

try {
  execFileSync(process.execPath, ['harness.js', 'validate', 'does-not-exist.json'], {
    encoding: 'utf8',
    cwd: __dirname,
  });
  check(false, 'cli validate rejects a missing file');
} catch (e) {
  check(true, 'cli validate rejects a missing file');
}

if (failures > 0) {
  console.log('\n' + failures + ' failure(s)');
  process.exit(1);
}
console.log('\nAll tests passed');
