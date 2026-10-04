# Contributing

Thanks for your interest in OpenHarness.

## Adding or updating a harness

The directory lives in `data/harnesses.json`. Each entry is a UHP harness card:

```json
{
  "name": "Example Harness",
  "description": "One or two sentences about what it does.",
  "homepage": "https://example.com",
  "docs": "https://example.com/docs",
  "github": "https://github.com/example/repo"
}
```

Only `name` and `description` are required. `homepage`, `docs`, and `github`
must be `http(s)` URLs when present.

Before opening a PR:

```bash
node harness.js list          # sanity check the directory
node test.js                  # run the smoke tests
```

## Style

- Keep the directory data as plain JSON, one object per harness.
- The CLI is intentionally dependency-free; don't add packages for features
  Node's standard library already covers.
