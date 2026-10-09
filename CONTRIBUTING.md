# Contributing

Thanks for your interest in OpenHarness. This repo is a **directory of agent
harnesses + a CLI + the UHP card format**. Contributions are welcome.

## Inclusion criteria

A harness is included when it is **a harness** — the runtime that gives an AI
agent its tools, sandbox, permissions, and memory.

- ✅ **In scope**: agent harnesses and agent frameworks (coding agents, browser
  agents, personal agents).
- ❌ **Out of scope**: models (GPT, Claude, Qwen, …), chat shells without
  agentic tool use, or model-only APIs.

When in doubt, open an issue before a PR.

## Adding or updating a harness

Each harness is one file at `data/harnesses/<id>.json`. The `<id>` is a stable
slug (`lowercase-with-dashes`) that never changes once published.

```bash
# after editing, validate locally
node test.js
# and build the combined artifact
node scripts/build.js
```

## A valid card

```json
{
  "id": "example-harness",
  "name": "Example Harness",
  "description": "A coding agent that edits files and runs commands in a sandbox.",
  "homepage": "https://example.com",
  "docs": "https://example.com/docs",
  "github": "https://github.com/example/example-harness",
  "repo": "https://github.com/example/example-harness",
  "license": "Apache-2.0",
  "categories": ["coding"],
  "interfaces": ["cli"],
  "oss": true,
  "source": "https://example.com",
  "last_verified": "2026-10-09",
  "capabilities": {
    "sandbox": true,
    "tools": true,
    "mcp": false,
    "permissions": true,
    "resume": "unknown",
    "subagents": "unknown"
  }
}
```

## An invalid card (and why)

```json
{
  "id": "not-a-harness",
  "name": "Some model",
  "description": "A language model.",          // too short, and this is a model, not a harness
  "categories": [],
  "interfaces": ["cli"],
  "oss": false
}
```

This fails because `description` is under 20 characters, `categories` is empty,
and a model is out of scope.

## Rules

- Capabilities use `true`, `false`, or `"unknown"` — never marketing copy.
- `github`/`repo` must point to a repository root, not a `/blob/` path.
- No self-referencing URLs back to this repo.
- If you do not have evidence for a field, use `null` or `"unknown"`, never a
  placeholder that looks verified.
