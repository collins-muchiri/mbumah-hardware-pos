# Release History — Archived Scripts

**These scripts are HISTORICAL and are NOT part of the supported workflow.**

Everything in this folder is a one-off artifact from a past release cycle:

| Pattern | What it was |
|---|---|
| `check-merge-v*` | Post-merge verification for one specific release |
| `create-pr-v*` | PR-creation helpers for one specific release |
| `qa-*` | One-time QA seeds / simulators for a specific release's QA pass |
| `probe-*`, `tmp-*` | Scratch probes and temporary law checks |
| `verify-v2-*` (unwired ones) | Release verify gates whose `verify:*` npm entry has since been dropped |
| misc (`add-products.ts`, `gen-icons.mjs`, `switch-to-pg.sh`, …) | One-off utilities superseded by the current documented flow |

## Rules

1. **Nothing here is wired** into `package.json`, CI workflows, Docker,
   installers, or the app runtime — every file was verified unreferenced
   before being moved (audit remediation v2.307.0, PHASE 11).
2. **Never import from this folder** in source, tests, or active scripts.
3. Files are kept for archaeology instead of being deleted outright; each
   remains recoverable via `git log --follow scripts/archive/release-history/<file>`.
4. New releases must NOT add files here — current release tooling lives in
   `scripts/` proper and stays referenced by the supported workflow.

See `docs/TROUBLESHOOTING.md` and the v2.307.0 CHANGELOG entry for the full
audit-remediation context.
