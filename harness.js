#!/usr/bin/env node
'use strict';

/**
 * harness — the OpenHarness directory CLI.
 *
 * A tiny, dependency-free tool for browsing the harness directory and
 * validating harness cards against the Unified Harness Protocol (UHP).
 *
 * Usage:
 *   node harness.js list                 List every harness
 *   node harness.js search <keyword>     Search harnesses by name or description
 *   node harness.js show <name>          Show one harness in detail
 *   node harness.js validate <file>      Validate a UHP harness card (JSON)
 *   node harness.js table                Print a Markdown comparison table
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

function cmdList() {
  console.log(`${HARNESSES.length} harnesses\n`);
  for (const h of HARNESSES) {
    console.log(`  ${h.name} — ${h.description}`);
  }
}

function cmdSearch(keyword) {
  if (!keyword) {
    console.error('usage: node harness.js search <keyword>');
    process.exit(1);
  }
  const lower = String(keyword).toLowerCase();
  const matches = HARNESSES.filter(
    (h) => h.name.toLowerCase().includes(lower) || h.description.toLowerCase().includes(lower)
  );
  if (matches.length === 0) {
    console.log(`no harness matches "${keyword}"`);
    return;
  }
  console.log(`${matches.length} match(es) for "${keyword}"\n`);
  for (const h of matches) {
    console.log(`  ${h.name} — ${h.description}`);
  }
}

function cmdShow(name) {
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
  for (const req of SCHEMA.required || []) {
    if (typeof card[req] !== 'string' || card[req].trim() === '') {
      errors.push(`"${req}" is required and must be a non-empty string`);
    }
  }
  for (const opt of ['homepage', 'docs', 'github']) {
    if (card[opt] !== undefined && card[opt] !== null && !isUrl(card[opt])) {
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

// --- main -----------------------------------------------------------------

const [cmd, arg] = process.argv.slice(2);

switch (cmd) {
  case 'list':
    cmdList();
    break;
  case 'search':
    cmdSearch(arg);
    break;
  case 'show':
    cmdShow(arg);
    break;
  case 'validate':
    cmdValidate(arg);
    break;
  case 'table':
    cmdTable();
    break;
  default:
    console.log('usage: node harness.js <list|search|show|validate|table> [arg]');
    process.exit(1);
}
