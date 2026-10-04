# Unified Harness Protocol (UHP)

The Unified Harness Protocol is a minimal, machine-readable way to describe an
agent harness — what it does and where to find it.

## Why

Models only produce tokens. A harness turns those tokens into files, tasks, and
recoverable work. UHP gives each harness a single "card" so harnesses can be
listed, compared, and validated without reading every project's docs.

## Harness card

A harness card is a small JSON object. Only `name` and `description` are required.

```json
{
  "name": "Claude Code",
  "description": "Anthropic's coding agent for understanding codebases and iterating on tasks.",
  "homepage": "https://claude.ai/code",
  "docs": "https://code.claude.com/docs/en/tools-reference",
  "github": null
}
```

## Fields

| Field | Required | Type | Meaning |
|-------|----------|------|---------|
| `name` | yes | string | Display name of the harness |
| `description` | yes | string | One-to-two sentence summary |
| `homepage` | no | url | The harness's own website |
| `docs` | no | url | Documentation |
| `github` | no | url | Public source repository, if any |

## Validating a card

The machine-readable schema lives at [`docs/schema.json`](schema.json). The repo
also ships a CLI that uses it:

```bash
node harness.js validate my-harness.json
```

## Data

The directory itself is `data/harnesses.json` — a list of 44 harness cards,
one per entry.
