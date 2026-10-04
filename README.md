# OpenHarness

**The agent infrastructure layer.** Discover, compare, and evaluate AI agent harnesses — verified capabilities, usage evidence, and current availability.

> **Formerly HarnessRouter.** OpenHarness is an independent project and is **not affiliated with** any other project using the "OpenHarness" name.

## What is OpenHarness?

OpenHarness is a directory of [agent harnesses](docs/uhp.md) — the runtime that
gives an AI coding agent its tools, sandbox, permissions, and memory. This repo
ships the directory as data plus a small CLI to browse and validate it.

## Quick start

The CLI is a single file with **zero dependencies** — just Node.js.

```bash
# list all 44 harnesses
node harness.js list

# search by keyword
node harness.js search "coding"

# inspect one harness
node harness.js show "Claude Code"

# generate a Markdown comparison table
node harness.js table
```

## CLI reference

| Command | Description |
|---------|-------------|
| `node harness.js list` | List every harness |
| `node harness.js search <keyword>` | Search harnesses by name or description |
| `node harness.js show <name>` | Show one harness in detail |
| `node harness.js validate <file>` | Validate a UHP harness card (JSON) |
| `node harness.js table` | Print a Markdown comparison table |

## Unified Harness Protocol (UHP)

Each harness is described by a small, machine-readable card (see
[docs/uhp.md](docs/uhp.md)). The schema is [docs/schema.json](docs/schema.json),
and the `validate` command checks a card against it:

```bash
node harness.js validate docs/example-card.json
```

## Data

The directory lives in [data/harnesses.json](data/harnesses.json) — 44 harness
cards, one per entry.

## Self-hosting the website

The website is a static site. See [docs/self-hosting.md](docs/self-hosting.md).

## Community

- Follow on X/Twitter: [@OpenHarnessai](https://x.com/OpenHarnessai)
- Website: [openharnessai.app](https://openharnessai.app)

## License

[Apache 2.0](LICENSE)
