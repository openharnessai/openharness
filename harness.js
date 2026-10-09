#!/usr/bin/env node
'use strict';

/**
 * harness — the OpenHarness directory CLI.
 *
 * A tiny, dependency-free tool for browsing the harness directory and
 * validating harness cards against the Unified Harness Protocol (UHP).
 *
 * Usage:
 *   node harness.js list [--json]        List every harness
 *   node harness.js search <keyword>     Search harnesses by name or description
 *   node harness.js show <name>          Show one harness in detail
 *   node harness.js validate <file>      Validate a UHP harness card (JSON)
 *   node harness.js table                Print a Markdown comparison table
 *   node harness.js help                 Show this help
 */

const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, 'data', 'harnesses.json');
const SCHEMA_FILE = path.join(__dirname, 'docs', 'schema.json');

// --- data loading ---------------------------------------------------------

function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (err) {
    console.error(`error: cannot read ${path.relative(process.cwd(), file)}: ${err.message}`);
    process.exit(1);
  }
}

const HARNESSES = readJson(DATA_FILE);
const SCHEMA = readJson(SCHEMA_FILE);

// --- helpers --------------------------------------------------------------

function findByName(name) {
  const lower = String(name).toLowerCase();
  return HARNESSES.filter((h) => h.name.toLowerCase().includes(lower));
}

function isUrl(value) {
  return /^https?:\/\/\S+$/.test(String(value));
}

// --- commands -------------------------------------------------------------

function cmdList(json) {
  if (json) {
    console.log(JSON.stringify(HARNESSES, null, 2));
    return;
  }
  console.log(`${HARNESSES.length} harnesses\n`);
  for (const h of HARNESSES) {
    console.log(`  ${h.name} — ${h.description}`);
  }
}

function cmdSearch(keyword, json) {
  if (!keyword) {
    console.error('usage: node harness.js search <keyword>');
    process.exit(1);
  }
  const lower = String(keyword).toLowerCase();
  const matches = HARNESSES.filter(
    (h) => h.name.toLowerCase().includes(lower) || h.description.toLowerCase().includes(lower)
  );
  if (json) {
    console.log(JSON.stringify(matches, null, 2));
    return;
  }
  if (matches.length === 0) {
    console.log(`no harness matches "${keyword}"`);
    return;
  }
  console.log(`${matches.length} match(es) for "${keyword}"\n`);
  for (const h of matches) {
    console.log(`  ${h.name} — ${h.description}`);
  }
}

function cmdShow(name, json) {
  if (!name) {
    console.error('usage: node harness.js show <name>');
    process.exit(1);
  }
  const matches = findByName(name);
  if (matches.length === 0) {
    console.log(`no harness matches "${name}"`);
    return;
  }
  if (matches.length > 1) {
    console.log(`"${name}" matched ${matches.length} harnesses; be more specific:\n`);
    for (const h of matches) console.log(`  ${h.name}`);
    return;
  }
  const h = matches[0];
  if (json) {
    console.log(JSON.stringify(h, null, 2));
    return;
  }
  console.log(h.name);
  console.log(`  ${h.description}`);
  console.log(`  homepage: ${h.homepage || '—'}`);
  console.log(`  docs:     ${h.docs || '—'}`);
  console.log(`  github:   ${h.github || '—'}`);
}

function cmdValidate(file) {
  if (!file) {
    console.error('usage: node harness.js validate <file.json>');
    process.exit(1);
  }
  let card;
  try {
    card = JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (err) {
    console.error(`error: ${err.message}`);
    process.exit(1);
  }
  const errors = [];
  const props = SCHEMA.properties || {};
  for (const req of SCHEMA.required || []) {
    const val = card[req];
    const t = props[req] && props[req].type;
    if (t === 'array') {
      if (!Array.isArray(val) || val.length === 0) errors.push(`"${req}" is required and must be a non-empty array`);
    } else if (t === 'boolean') {
      if (typeof val !== 'boolean') errors.push(`"${req}" is required and must be a boolean`);
    } else {
      if (typeof val !== 'string' || val.trim() === '') errors.push(`"${req}" is required and must be a non-empty string`);
    }
  }
  for (const opt of ['homepage', 'docs', 'github', 'repo']) {
    if (card[opt] !== undefined && card[opt] !== null && card[opt] !== '' && !isUrl(card[opt])) {
      errors.push(`"${opt}" must be a valid http(s) URL (got "${card[opt]}")`);
    }
  }
  if (errors.length === 0) {
    console.log(`✓ valid UHP harness card (${Object.keys(card).length} field(s))`);
    return;
  }
  for (const e of errors) console.log(`✗ ${e}`);
  console.log(`\n${errors.length} error(s)`);
  process.exit(1);
}

function cmdTable() {
  console.log('| Name | Description | Link |');
  console.log('| --- | --- | --- |');
  for (const h of HARNESSES) {
    const desc = h.description.length > 80 ? h.description.slice(0, 77) + '...' : h.description;
    const link = h.github || h.homepage || h.docs || '';
    console.log(`| ${h.name} | ${desc} | ${link} |`);
  }
}

function cmdStats(json) {
  const stats = {
    total: HARNESSES.length,
    withGithub: HARNESSES.filter((h) => h.github).length,
    withHomepage: HARNESSES.filter((h) => h.homepage).length,
    withDocs: HARNESSES.filter((h) => h.docs).length,
  };
  if (json) {
    console.log(JSON.stringify(stats, null, 2));
    return;
  }
  console.log(`${stats.total} harnesses`);
  console.log(`  ${stats.withGithub} with a public GitHub repo`);
  console.log(`  ${stats.withHomepage} with a homepage`);
  console.log(`  ${stats.withDocs} with docs`);
}

function cmdCompare(a, b, json) {
  if (!a || !b) {
    console.error('usage: node harness.js compare <nameA> <nameB>');
    process.exit(1);
  }
  const ha = findByName(a)[0];
  const hb = findByName(b)[0];
  if (!ha || !hb) {
    console.log('could not find both harnesses (be more specific)');
    return;
  }
  if (json) {
    console.log(JSON.stringify({ a: ha, b: hb }, null, 2));
    return;
  }
  const rows = [
    ['name', ha.name, hb.name],
    ['description', ha.description, hb.description],
    ['homepage', ha.homepage || '—', hb.homepage || '—'],
    ['docs', ha.docs || '—', hb.docs || '—'],
    ['github', ha.github || '—', hb.github || '—'],
  ];
  const w1 = Math.max(...rows.map((r) => r[1].length));
  for (const [label, va, vb] of rows) {
    console.log(`${label.padEnd(12)} ${va.padEnd(w1 + 2)} ${vb}`);
  }
}

function cmdHelp() {
  console.log(`OpenHarness CLI — browse and validate the agent harness directory.

Usage:
  node harness.js list [--json]        List every harness
  node harness.js search <keyword>     Search harnesses by name or description
  node harness.js show <name> [--json] Show one harness in detail
  node harness.js validate <file>      Validate a UHP harness card (JSON)
  node harness.js table                Print a Markdown comparison table
  node harness.js stats [--json]       Print directory stats
  node harness.js compare <a> <b>      Compare two harnesses
  node harness.js help                 Show this help

Pass --json to list/search/show/stats/compare for machine-readable output.`);
}

// --- main -----------------------------------------------------------------

const args = process.argv.slice(2);
const json = args.includes('--json');
const rest = args.filter((a) => a !== '--json');
const cmd = rest[0];
const arg = rest[1];
const arg2 = rest[2];

switch (cmd) {
  case 'list':
    cmdList(json);
    break;
  case 'search':
    cmdSearch(arg, json);
    break;
  case 'show':
    cmdShow(arg, json);
    break;
  case 'validate':
    cmdValidate(arg);
    break;
  case 'table':
    cmdTable();
    break;
  case 'stats':
    cmdStats(json);
    break;
  case 'compare':
    cmdCompare(arg, arg2, json);
    break;
  case 'help':
  case '--help':
  case '-h':
    cmdHelp();
    break;
  default:
    console.log('usage: node harness.js <list|search|show|validate|table|stats|compare|help> [args] [--json]');
    process.exit(1);
}
