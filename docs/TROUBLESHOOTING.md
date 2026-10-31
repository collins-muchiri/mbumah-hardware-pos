# Troubleshooting Guide

The failures below are the ones the v2.305.0 audit actually hit, plus the
recurring historical classes. Each section: symptom → root cause → fix.
`npm run env:doctor` automates most of the detection.

---

## 1. `npm run db:seed` fails with `spawn bun ENOENT`

**Symptom**

```
An error occurred while running the seed command:
Error: Command failed with ENOENT: bun /path/to/prisma/seed.ts
```

**Root cause (fixed in v2.307.0):** the seed command in `prisma.config.ts`
hardcoded `bun`. Fixed by delegating to `scripts/run-seed.mjs`, which prefers
bun when present and falls back to `node --import tsx` (tsx is a
devDependency). If you still see this, you are on a pre-2.307.0 checkout —
update.

**Still failing?** The runner prints its choice (`[run-seed] runner: ...`).
If it says no runner is available, install devDependencies (`npm install`) or
install bun.

## 2. `.env` does not seem to load / the server needs shell-exported variables

**Symptom:** `/api/health` reports the database disconnected until
`DATABASE_URL` is exported in the shell; or Prisma CLI commands target a
different database than `.env` says.

**Root cause & precedence law:** every repo script and the Prisma CLI
(`prisma.config.ts`) load `<repo>/.env` with **.env-WINS precedence** — a
value found in `.env` beats the inherited shell environment, deliberately, so
a stray `DATABASE_URL` from another project cannot hijack the CLI. Consequences:

- Set the value in `.env`, not in your shell profile.
- A shell-exported variable will be silently overridden by `.env` — by design.
- Scripts that must point the CLI somewhere else temporarily (e.g. the
  hermetic test database) use `PRISMA_CONFIG_DATABASE_URL`, which beats `.env`.

**Fix:** run `npm run env:doctor` — it prints exactly which value wins per
group. Next.js itself loads `.env` for the app runtime; custom Node scripts
must use the repo's loaders (or be spawned by an npm script that does).

## 3. Login returns 500: `the URL must start with the protocol 'postgresql://'` (or `file:`)

**Symptom:** every login/API query fails with a protocol error; `/api/health`
says database unhealthy.

**Root cause (the audit's login-500):** provider drift. The schema provider
is auto-detected from the DATABASE_URL scheme (`file:` → sqlite,
`postgresql://` → postgres). If one tool flips the schema (e.g. `db:push`
seeing a `file:` URL) and another regenerates the client against a different
scheme, the generated Prisma client no longer matches the actual database.
Before v2.307.0, `scripts/setup-prisma-provider.mjs` did not load `.env`, so
`npm run db:generate` could silently flip the provider BACK behind
`db:push`'s flip.

**Fix:**

```bash
npm run env:doctor   # reports: schema=X client=Y DATABASE_URL=Z — DRIFT
npm run db:generate  # re-aligns the client with .env's scheme
```

## 4. Seeded admin login fails after a fresh setup

**Checklist (in order):**

1. `npm run env:doctor` — fix every ✗ before proceeding.
2. Did the seed actually run? Re-run `npm run db:seed` (idempotent, upsert-safe).
3. **Credential policy (v2.307.0):** outside development the seed no longer
   uses `password123`. If you seeded with `NODE_ENV` unset/production, the
   seed generated a strong one-time password and printed it ONCE in its
   output. Re-seed in development, or set `SEED_ADMIN_PASSWORD` and re-seed.
4. Account locked? The login route rate-limits (5 attempts / 15 min) and
   supports DB-level lockout — wait, or clear `lockedUntil` for the account.
5. Check the server log for `[AUTH_LOGIN_DB_ERROR]` — that is the DB-level
   detail (kept server-only by design; set `EXPOSE_ERRORS=true` temporarily
   to see it in the HTTP response while debugging).

## 5. Production 500s are opaque ("An unexpected error occurred")

By design: production responses never include stacks, Prisma messages, or SQL
(see `src/lib/logger.ts` `withErrorBoundary`). The full error is always in the
server logs / Vercel Runtime Logs (`[API-ERROR]` lines). For a temporary
deep-dive, set `EXPOSE_ERRORS=true`, reproduce, then remove it.

## 6. Prisma schema drift: "column X does not exist in the current database"

The deployed database is behind the deployed code. `scripts/sync-db-schema.mjs`
runs in `vercel-build` (cloud) and `scripts/ensure-schema.mjs` in every
self-hosted path to converge the schema. Run `npm run db:push` manually if you
manage the database yourself.

## 7. Database files / artifacts got committed

Never commit `*.db`, `*.sqlite`, `.env`, or backups. `.gitignore` covers
`db/*.db`, `*.db*` and `prisma/prisma/*.db*` (the hermetic test database's
home). If a snapshot slipped in historically (as a pre-heal backup once did),
remove it with `git rm --cached <file>` and extend `.gitignore`.

## 8. Where did the old one-off scripts go?

Release-churn one-offs (check-merge-v*, create-pr-v*, qa-seed-*, scratch
probes) were archived to `scripts/archive/release-history/` in v2.307.0 —
see that folder's README. Nothing in the supported workflow references them.

## 9. Tests fail locally with "table does not exist"

The Vitest suite runs against the hermetic SQLite database at
`prisma/prisma/dev.db`. The `pretest` hook (`scripts/prepare-test-db.mjs`)
creates and seeds it automatically. If it is missing or empty, run
`npm test` once (the hook fires) or `node scripts/prepare-test-db.mjs`.
