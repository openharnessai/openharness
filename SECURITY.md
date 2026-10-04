# Security Policy

## Reporting a vulnerability

Please report security issues privately via a
[GitHub security advisory](https://github.com/openharnessai/openharness/security/advisories/new)
or to [@OpenHarnessai](https://x.com/OpenHarnessai).

## Scope

OpenHarness is a static directory and a read-only CLI. There is no server-side
code, no accounts, and no user data in this repository. Vulnerabilities are
therefore most likely to be limited to malformed data in `data/harnesses.json`
or unexpected inputs to `harness.js validate`.
