// ─────────────────────────────────────────────────────────────────────────────
// MBUMAH HARDWARE POS - THE LOGIN DB DOCTOR (v2.398.0)
// ─────────────────────────────────────────────────────────────────────────────
// THE LOGIN DESK SPEAKS THE FAILURE'S NAME.
//
// Born in the v2.398.0 QA round: the sandbox shell inherited a stray
// DATABASE_URL, the dev runtime (the one launch path without the env-wins
// guard its siblings carry) silently redirected to a foreign empty SQLite
// file, and the login card answered with one bare sentence — while the API
// response right there in the network tab carried the machine-readable
// diagnosis (detail.code + the documented operator hint) that nobody at the
// desk could see.
//
// This module turns an EXPOSED login failure body into an inline diagnostic:
// the Prisma code, a plain-language title, a one-line summary and the
// remediation steps — the SAME advice db.ts's FATAL banner, the login
// route's hint string and docs/TROUBLESHOOTING.md already carry, now
// reachable where the failure actually lands.
//
// SECURITY POSTURE (unchanged): the card renders ONLY what the server chose
// to expose. `detail` is gated server-side (development, or EXPOSE_ERRORS
// explicitly opted in) — without an exposed detail the doctor answers null
// and the login face is byte-identical to the pre-v2.398.0 behavior.
//
// PURE: no imports, no I/O, no env reads — the suite (and any future
// surface: the health desk, the env doctor panel) can call it anywhere.
// ─────────────────────────────────────────────────────────────────────────────

/** One remediation card: the failure's name and what to do about it. */
export interface DbDiagnostic {
  /** The Prisma error code, e.g. `P2021` — rendered as a mono chip. */
  code: string;
  /** Plain-language title, e.g. `Schema not pushed`. */
  title: string;
  /** One-sentence summary of what the server actually hit. */
  summary: string;
  /** Ordered remediation steps, each one actionable. */
  steps: string[];
}

/** The login route's failure body shape: { success:false, error, detail } */
interface LoginErrorBodyShape {
  success?: boolean;
  error?: string;
  detail?: {
    code?: unknown;
    component?: unknown;
    name?: unknown;
  } | null;
}

/** Prisma codes are exactly `P` + four digits — the doctor only speaks those. */
const PRISMA_CODE = /^P\d{4}$/;

interface Remedy {
  title: string;
  summary: string;
  steps: string[];
}

/**
 * The remediation table. Every step paraphrases advice the repo ALREADY
 * ships (db.ts's FATAL banner, the login route's hint string, the
 * setup-prisma-provider policy comment) — nothing new is invented here.
 */
const REMEDIES: Record<string, Remedy> = {
  P2021: {
    title: 'Schema not pushed',
    summary:
      'The database the server reached has no tables for this app — the Prisma schema was never pushed to it, or the server reached the WRONG database entirely.',
    steps: [
      'Run `npx prisma db push` against the database DATABASE_URL points at (local dev pushes the SQLite schema; production needs the migration applied).',
      'Check for a stray DATABASE_URL in the environment — when a .env file exists it must win, or the server silently connects to another empty database and every table looks missing.',
      'Restart the dev server after the push so the client reconnects to the pushed schema.',
    ],
  },
  P1003: {
    title: 'Database file missing',
    summary: 'The database file the URL names does not exist, so the server had nothing to open.',
    steps: [
      'Create or restore the SQLite file DATABASE_URL names, or point DATABASE_URL at an existing database file.',
      'Then run `npx prisma db push` so the schema exists in it.',
      'Check for a stray DATABASE_URL in the environment — the .env value must win when both exist.',
    ],
  },
  P1001: {
    title: 'Database unreachable',
    summary: 'The server could not open a connection to the database at DATABASE_URL.',
    steps: [
      'Verify DATABASE_URL is reachable — for Neon use the POOLED connection string (ends in -pooler) with ?pgbouncer=true&connect_timeout=15.',
      'Check the database server is running and accepting connections (firewall / region / maintenance window).',
    ],
  },
  P1009: {
    title: 'Database does not exist',
    summary: 'The database name in DATABASE_URL does not exist on the server.',
    steps: [
      'Create the database named in DATABASE_URL on the server, or correct the name.',
      'Then run `npx prisma db push` so the schema exists in it.',
    ],
  },
  P2022: {
    title: 'Schema drift (missing column)',
    summary: 'The database is missing a column the Prisma schema expects.',
    steps: [
      'Run `npx prisma db push` (or apply the pending migration) so the database matches the schema.',
      'Restart the app after the push.',
    ],
  },
  P1017: {
    title: 'Connection closed by server',
    summary: 'The database server closed the connection mid-request.',
    steps: [
      'For serverless deployments use the pooled connection string with ?pgbouncer=true&connection_limit=1.',
      'Retry; if it persists, check the provider connection limit and the database logs.',
    ],
  },
};

const FALLBACK: Remedy = {
  title: 'Database error',
  summary: 'The server hit a database error while signing you in.',
  steps: [
    'Check DATABASE_URL and the database server state, then retry sign-in.',
  ],
};

/**
 * Read a login failure body and answer the diagnostic card — or null when
 * the body carries no exposed DB detail (wrong password, CSRF, validation,
 * or a production body with detail withheld): the login face stays as it
 * was, by design.
 */
export function diagnoseLoginDbFailure(body: unknown): DbDiagnostic | null {
  if (body === null || typeof body !== 'object') return null;
  const shaped = body as LoginErrorBodyShape;
  if (shaped.success !== false) return null;
  const detail = shaped.detail;
  if (detail === null || typeof detail !== 'object') return null;
  const code = detail.code;
  if (typeof code !== 'string' || !PRISMA_CODE.test(code)) return null;

  return diagnosePrismaCode(code);
}

// ─────────────────────────────────────────────────────────────────────────────
// THE SECOND SURFACE (v2.399.0) — the health desk speaks the failure's name.
// /api/health carries its failures as TEXT (the route surfaces the error
// message verbatim, truncated), so the code rides inside the detail string
// rather than a structured field. The env doctor (src/lib/env-doctor.ts)
// extracts the code from that text and asks THIS table for the card — the
// same remediation voice, one table, two desks.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * The first Prisma code embedded in a health check's detail text — or null
 * when the text carries none. Word-bounded, so "P2021" answers and
 * "P20211" or "P202" never do.
 */
export function extractPrismaCode(text: string): string | null {
  const match = /\bP\d{4}\b/.exec(text);
  return match ? match[0] : null;
}

/**
 * The remedy table's public face: a real Prisma code in, the card out —
 * null when the shape is not a Prisma code. Unknown-but-real codes answer
 * the FALLBACK card, exactly as the login desk's doctor does.
 */
export function diagnosePrismaCode(code: string): DbDiagnostic | null {
  if (typeof code !== 'string' || !PRISMA_CODE.test(code)) return null;
  const remedy = REMEDIES[code] ?? FALLBACK;
  return {
    code,
    title: remedy.title,
    summary: remedy.summary,
    steps: remedy.steps,
  };
}
