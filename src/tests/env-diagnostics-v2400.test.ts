// THE SUPPORT COPY SUITE (v2.400.0) — the health desk's voice, taken away.
// Pins: the byte-exact copy of a healthy report (header, overall, the
// seven rows in the panel's own order), the uppercase status voice (the
// wire's lowercase words, the aria-labels keep theirs), the absent-detail
// silence (no em dash for a row the endpoint gave no detail for), the
// diagnosis block (code — title, the summary line, the ordered steps —
// exactly when the doctor card is on screen), the honest absence (no
// block without a code), the ONE home for the row labels (envRowLabel —
// the panel chip and the clipboard text cannot drift), and the pure law
// (two calls, the same bytes — no clock, no env reads).
import { describe, expect, it } from 'vitest';
import {
  diagnoseHealthChecks,
  envRowLabel,
  formatEnvDiagnostics,
} from '@/lib/env-doctor';

/** The /api/health body the desk answers on a HEALTHY local boot. */
const HEALTHY_BODY = {
  status: 'healthy',
  timestamp: '2026-11-05T06:02:02.621Z',
  checks: {
    env_DATABASE_URL: { status: 'ok' },
    env_NEXTAUTH_SECRET: { status: 'ok' },
    env_JWT_SECRET: { status: 'ok' },
    env_DIRECT_URL: {
      status: 'warning',
      detail: 'Optional - needed for PostgreSQL prod',
    },
    database: {
      status: 'ok',
      detail: 'Connection successful (5ms)',
      responseTime: 5,
    },
    database_stats: {
      status: 'ok',
      detail: '15 users, 73 products, 36 transactions, 15 active sessions',
      counts: { users: 15, products: 73, transactions: 36, sessions: 15 },
    },
    seed: { status: 'ok', detail: '15 users present' },
    security: { status: 'ok', detail: 'No critical security events' },
    sentry: { status: 'ok', detail: 'Sentry initialized' },
  },
};

/** The stale-server incident's shape: the connection row carries P2021. */
const P2021_BODY = {
  status: 'unhealthy',
  timestamp: '2026-11-05T06:02:02.621Z',
  checks: {
    env_DATABASE_URL: { status: 'ok' },
    env_NEXTAUTH_SECRET: { status: 'ok' },
    env_JWT_SECRET: { status: 'ok' },
    env_DIRECT_URL: { status: 'warning', detail: 'Optional - needed for PostgreSQL prod' },
    database: {
      status: 'error',
      detail: 'P2021: The table `main.User` does not exist in the current database.',
    },
    database_stats: { status: 'error', detail: 'P2021: The table `main.User` does not exist in the current database.' },
    seed: { status: 'error', detail: 'Seed check failed' },
  },
};

function expectCopyFor(body: unknown): string {
  const report = diagnoseHealthChecks(body);
  expect(report, JSON.stringify(body).slice(0, 120)).not.toBeNull();
  return formatEnvDiagnostics(report as NonNullable<ReturnType<typeof diagnoseHealthChecks>>);
}

function expectReportFor(body: unknown): NonNullable<ReturnType<typeof diagnoseHealthChecks>> {
  const report = diagnoseHealthChecks(body);
  expect(report, JSON.stringify(body).slice(0, 120)).not.toBeNull();
  return report as NonNullable<ReturnType<typeof diagnoseHealthChecks>>;
}

describe('env diagnostics (v2.400.0) — the healthy copy, byte-exact', () => {
  it('the full healthy panel: header, overall, seven rows in the panel order', () => {
    expect(expectCopyFor(HEALTHY_BODY)).toBe(
      [
        'Environment & Connection — diagnostics',
        'Overall: WARNING',
        'DATABASE_URL: OK',
        'NEXTAUTH_SECRET: OK',
        'JWT_SECRET: OK',
        'DIRECT_URL: WARNING — Optional - needed for PostgreSQL prod',
        'Connection: OK — Connection successful (5ms)',
        'Stats: OK — 15 users, 73 products, 36 transactions, 15 active sessions',
        'Seed: OK — 15 users present',
      ].join('\n'),
    );
  });

  it('rows without a detail stay silent — no em dash, no invented line', () => {
    const body = {
      status: 'healthy',
      checks: {
        env_DATABASE_URL: { status: 'ok' },
        database: { status: 'ok' },
      },
    };
    expect(expectCopyFor(body)).toBe(
      [
        'Environment & Connection — diagnostics',
        'Overall: OK',
        'DATABASE_URL: OK',
        'Connection: OK',
      ].join('\n'),
    );
  });

  it('the overall voice is the worst row — an error report speaks ERROR', () => {
    const copy = expectCopyFor(P2021_BODY);
    expect(copy.split('\n')[1]).toBe('Overall: ERROR');
  });
});

describe('env diagnostics (v2.400.0) — the diagnosis block rides the card', () => {
  it('a Prisma code in the connection detail renders the doctor card and the block together', () => {
    const report = expectReportFor(P2021_BODY);
    expect(report.diagnostic).not.toBeNull();
    expect(report.diagnostic?.code).toBe('P2021');
    const copy = formatEnvDiagnostics(report);
    const lines = copy.split('\n');
    // the block opens after a blank line, speaks the code — title, the
    // summary, then the steps in the remedy table's own order (the bytes
    // the REMEDIES table actually ships — never paraphrased here)
    const diagIdx = lines.indexOf('Diagnosis: P2021 — Schema not pushed');
    expect(diagIdx).toBeGreaterThan(0);
    expect(lines[diagIdx - 1]).toBe('');
    expect(lines[diagIdx + 1]).toBe('- The database the server reached has no tables for this app — the Prisma schema was never pushed to it, or the server reached the WRONG database entirely.');
    expect(lines[diagIdx + 2]).toBe('1. Run `npx prisma db push` against the database DATABASE_URL points at (local dev pushes the SQLite schema; production needs the migration applied).');
    expect(lines[diagIdx + 3]).toBe('2. Check for a stray DATABASE_URL in the environment — when a .env file exists it must win, or the server silently connects to another empty database and every table looks missing.');
    expect(lines[diagIdx + 4]).toBe('3. Restart the dev server after the push so the client reconnects to the pushed schema.');
    expect(lines[diagIdx + 5]).toBeUndefined();
  });

  it('a healthy report carries no diagnosis block — the quiet face', () => {
    expect(expectCopyFor(HEALTHY_BODY)).not.toContain('Diagnosis:');
  });
});

describe('env diagnostics (v2.400.0) — the one home for the labels', () => {
  it('envRowLabel speaks the four kinds the panel speaks', () => {
    expect(envRowLabel({ kind: 'env', name: 'DATABASE_URL' })).toBe('DATABASE_URL');
    expect(envRowLabel({ kind: 'database', name: 'database' })).toBe('Connection');
    expect(envRowLabel({ kind: 'database_stats', name: 'database_stats' })).toBe('Stats');
    expect(envRowLabel({ kind: 'seed', name: 'seed' })).toBe('Seed');
  });

  it('the copy speaks the SAME labels the aria-labels do — chip and clipboard cannot drift', () => {
    const report = expectReportFor(HEALTHY_BODY);
    const copy = formatEnvDiagnostics(report);
    for (const row of report.rows) {
      expect(copy).toContain(`${envRowLabel(row)}:`);
    }
  });
});

describe('env diagnostics (v2.400.0) — the pure law', () => {
  it('two calls answer the same bytes — no clock, no env reads, no embellishment', () => {
    const report = expectReportFor(P2021_BODY);
    expect(formatEnvDiagnostics(report)).toBe(formatEnvDiagnostics(report));
  });
});
