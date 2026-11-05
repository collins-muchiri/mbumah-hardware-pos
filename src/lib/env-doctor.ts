// ─────────────────────────────────────────────────────────────────────────────
// MBUMAH HARDWARE POS - THE ENV DOCTOR (v2.399.0)
// ─────────────────────────────────────────────────────────────────────────────
// THE HEALTH DESK SPEAKS THE FAILURE'S NAME.
//
// Born in the v2.399.0 QA round: the same live incident that created the
// login desk's doctor (a stray inherited DATABASE_URL silently pointing
// the server at a foreign empty database) came back as its second face —
// a STALE dev server still holding the staged-repro connection, answering
// every login with P2021 while /api/health said "Connection successful".
// The System Health desk had no window into WHICH database the server
// was actually talking to, and no window into the environment checks the
// health endpoint already reports.
//
// This module reads the /api/health payload — the SAME JSON the uptime
// monitors and the CI health gate read — and answers:
//   • one row per environment variable check (env_DATABASE_URL and
//     friends, the prefix stripped for the desk),
//   • one row per connection check (database / database_stats / seed),
//   • an overall status (the worst row wins, error over warning),
//   • and — when a connection row's detail text carries a Prisma code —
//     the SAME remediation card the login desk renders, via db-doctor's
//     public remedy table. One table, two desks, zero drift.
//
// SCOPE HONESTY: the other checks /api/health reports (security,
// financial_integrity, sentry, demo_credentials) already speak through
// the System Health desk's own sections — this panel is the environment
// AND CONNECTION desk, so those rows stay out of its voice.
//
// PURE: no imports from the card module's React side, no I/O, no env
// reads — the suite drives every decision with plain objects.
// ─────────────────────────────────────────────────────────────────────────────

import {
  diagnosePrismaCode,
  extractPrismaCode,
  type DbDiagnostic,
} from '@/lib/db-doctor';

export type HealthCheckStatus = 'ok' | 'warning' | 'error';

/** One row the Environment & Connection panel renders. */
export interface EnvCheckRow {
  /** The check's desk name — the env_ prefix stripped, e.g. `DATABASE_URL`. */
  name: string;
  /** Which family the row belongs to (drives the desk's icon and label). */
  kind: 'env' | 'database' | 'database_stats' | 'seed';
  status: HealthCheckStatus;
  /** The check's own detail line, when the endpoint reported one. */
  detail: string | null;
}

export interface EnvDoctorReport {
  rows: EnvCheckRow[];
  /** The remediation card when a connection row carried a Prisma code. */
  diagnostic: DbDiagnostic | null;
  /** The worst row's status — error over warning over ok. */
  overall: HealthCheckStatus;
}

/** The /api/health body shape this module reads. */
interface HealthBodyShape {
  status?: unknown;
  checks?: unknown;
}

interface CheckShape {
  status?: unknown;
  detail?: unknown;
}

/** The connection-family checks, in the order the panel speaks them. */
const CONNECTION_KEYS = ['database', 'database_stats', 'seed'] as const;
type ConnectionKey = (typeof CONNECTION_KEYS)[number];

const CONNECTION_KIND: Record<ConnectionKey, EnvCheckRow['kind']> = {
  database: 'database',
  database_stats: 'database_stats',
  seed: 'seed',
};

/** The connection rows whose detail text may carry a Prisma code. */
const CODE_CARRYING: readonly ConnectionKey[] = ['database', 'database_stats'];

function asStatus(value: unknown): HealthCheckStatus | null {
  return value === 'ok' || value === 'warning' || value === 'error'
    ? value
    : null;
}

const WORSE: Record<HealthCheckStatus, number> = { ok: 0, warning: 1, error: 2 };

function worseOf(a: HealthCheckStatus, b: HealthCheckStatus): HealthCheckStatus {
  return WORSE[b] > WORSE[a] ? b : a;
}

/**
 * Read a /api/health body and answer the panel's report — or null when
 * the body is not a health payload at all (a non-object, or one without
 * a checks map): the panel then speaks the endpoint's unreachability
 * instead, exactly as the login desk stays quiet without an exposed
 * detail.
 */
export function diagnoseHealthChecks(body: unknown): EnvDoctorReport | null {
  if (body === null || typeof body !== 'object') return null;
  const shaped = body as HealthBodyShape;
  if (shaped.checks === null || typeof shaped.checks !== 'object') return null;
  const checks = shaped.checks as Record<string, unknown>;

  const rows: EnvCheckRow[] = [];

  // The environment family — every env_ check the endpoint reported,
  // prefix stripped, endpoint order preserved.
  for (const [key, value] of Object.entries(checks)) {
    if (!key.startsWith('env_')) continue;
    const status = asStatus((value as CheckShape | null)?.status);
    if (status === null) continue;
    const detail = (value as CheckShape).detail;
    rows.push({
      name: key.slice(4),
      kind: 'env',
      status,
      detail: typeof detail === 'string' ? detail : null,
    });
  }

  // The connection family — the three known checks, fixed order.
  for (const key of CONNECTION_KEYS) {
    const value = checks[key];
    const status = asStatus((value as CheckShape | null)?.status);
    if (status === null) continue;
    const detail = (value as CheckShape)?.detail;
    rows.push({
      name: key,
      kind: CONNECTION_KIND[key],
      status,
      detail: typeof detail === 'string' ? detail : null,
    });
  }

  // Nothing to speak — a checks map with none of the panel's rows.
  if (rows.length === 0) return null;

  let overall: HealthCheckStatus = 'ok';
  for (const row of rows) overall = worseOf(overall, row.status);

  // The doctor card: the FIRST Prisma code carried by a connection row's
  // detail text (the route surfaces error messages verbatim, truncated —
  // the code rides inside the text).
  let diagnostic: DbDiagnostic | null = null;
  for (const key of CODE_CARRYING) {
    const value = checks[key] as CheckShape | null;
    const detail = value?.detail;
    if (typeof detail !== 'string') continue;
    const code = extractPrismaCode(detail);
    if (!code) continue;
    diagnostic = diagnosePrismaCode(code);
    break;
  }

  return { rows, diagnostic, overall };
}

// ── v2.400.0 THE SUPPORT COPY — the desk's voice, taken away ────────────────
// The panel speaks its rows to the EYES; an owner staring at a broken
// connection still has to DESCRIBE what they see when they ask for help.
// This is the panel's report as PLAIN TEXT — the same rows, the same
// labels, the same overall verdict, and (when a Prisma code was spoken)
// the doctor card's diagnosis with its ordered remediation steps — one
// clipboard away from a support chat. PURE and deterministic: no clock,
// no env reads, no I/O — the suite pins the exact bytes, and the button
// that copies it cannot embellish.

/** The desk's label for a row — the ONE home (the panel's chip and the
 *  support copy speak it alike; the tab's inline map retired this round). */
export function envRowLabel(row: Pick<EnvCheckRow, 'kind' | 'name'>): string {
  return row.kind === 'env'
    ? row.name
    : row.kind === 'database'
      ? 'Connection'
      : row.kind === 'database_stats'
        ? 'Stats'
        : 'Seed';
}

/** The copy's status voice — the wire's lowercase words, uppercase for the
 *  plain-text reading (the aria-labels keep the wire's own voice). */
const DIAG_STATUS_VOICE: Record<HealthCheckStatus, string> = {
  ok: 'OK',
  warning: 'WARNING',
  error: 'ERROR',
};

/**
 * Format the panel's report as the support copy: a header, the overall
 * verdict, one line per row (`LABEL: STATUS` — the detail after an em
 * dash when the endpoint reported one), and — when the doctor card is on
 * screen — the diagnosis block (code, title, summary, the ordered steps).
 * The rows speak in the report's own order (endpoint order for env vars,
 * the fixed connection order after them) — the paste reads exactly like
 * the panel does.
 */
export function formatEnvDiagnostics(report: EnvDoctorReport): string {
  const lines: string[] = ['Environment & Connection — diagnostics'];
  lines.push(`Overall: ${DIAG_STATUS_VOICE[report.overall]}`);
  for (const row of report.rows) {
    const detail = row.detail ? ` — ${row.detail}` : '';
    lines.push(`${envRowLabel(row)}: ${DIAG_STATUS_VOICE[row.status]}${detail}`);
  }
  if (report.diagnostic) {
    lines.push('');
    lines.push(`Diagnosis: ${report.diagnostic.code} — ${report.diagnostic.title}`);
    lines.push(`- ${report.diagnostic.summary}`);
    report.diagnostic.steps.forEach((step, i) => {
      lines.push(`${i + 1}. ${step}`);
    });
  }
  return lines.join('\n');
}
