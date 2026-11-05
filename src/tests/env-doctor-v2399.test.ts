// THE ENV DOCTOR SUITE (v2.399.0) — the health desk speaks the failure's
// name. Pins: the payload gate (non-health bodies answer null), the row
// families (env checks speak prefix-stripped, connection checks speak in
// the fixed order), the overall voice (the worst row wins), the code
// extraction from detail TEXT (the route surfaces errors verbatim — the
// code rides inside the string), and the shared remedy table's second
// desk (extractPrismaCode + diagnosePrismaCode, the login doctor's voice).
import { describe, expect, it } from 'vitest';
import {
  diagnoseHealthChecks,
  type EnvDoctorReport,
} from '@/lib/env-doctor';
import {
  diagnosePrismaCode,
  extractPrismaCode,
  type DbDiagnostic,
} from '@/lib/db-doctor';

/** The /api/health body the desk answers on a HEALTHY local boot. */
const HEALTHY_BODY = {
  status: 'healthy',
  timestamp: '2026-11-05T05:23:53.818Z',
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

function expectReportFor(body: unknown): EnvDoctorReport {
  const report = diagnoseHealthChecks(body);
  expect(report, JSON.stringify(body).slice(0, 120)).not.toBeNull();
  return report as EnvDoctorReport;
}

describe('env doctor (v2.399.0) — the payload gate', () => {
  it('answers null for non-objects and non-health bodies', () => {
    expect(diagnoseHealthChecks(null)).toBeNull();
    expect(diagnoseHealthChecks('nope')).toBeNull();
    expect(diagnoseHealthChecks(42)).toBeNull();
    expect(diagnoseHealthChecks({ status: 'healthy' })).toBeNull();
    expect(diagnoseHealthChecks({ checks: null })).toBeNull();
    expect(diagnoseHealthChecks({ checks: 'nope' })).toBeNull();
  });

  it('answers null when the checks map carries none of the panel rows', () => {
    expect(
      diagnoseHealthChecks({ status: 'healthy', checks: { other: { status: 'ok' } } }),
    ).toBeNull();
  });

  it('answers null for checks with non-status shapes', () => {
    expect(
      diagnoseHealthChecks({
        checks: { env_DATABASE_URL: { status: 'SOMETHING_ELSE' } },
      }),
    ).toBeNull();
  });
});

describe('env doctor (v2.399.0) — the row families', () => {
  it('speaks the healthy boot: env rows prefix-stripped, connection rows in fixed order', () => {
    const report = expectReportFor(HEALTHY_BODY);
    // env rows keep endpoint order; connection rows follow in fixed order
    expect(report.rows.map((r) => r.name)).toEqual([
      'DATABASE_URL',
      'NEXTAUTH_SECRET',
      'JWT_SECRET',
      'DIRECT_URL',
      'database',
      'database_stats',
      'seed',
    ]);
    expect(report.rows[0].kind).toBe('env');
    expect(report.rows[4].kind).toBe('database');
    expect(report.rows[5].kind).toBe('database_stats');
    expect(report.rows[6].kind).toBe('seed');
  });

  it('keeps each row\u2019s own detail line', () => {
    const report = expectReportFor(HEALTHY_BODY);
    expect(report.rows[3].detail).toBe('Optional - needed for PostgreSQL prod');
    expect(report.rows[4].detail).toBe('Connection successful (5ms)');
    expect(report.rows[6].detail).toBe('15 users present');
  });

  it('excludes the checks the desk\u2019s other sections already speak', () => {
    const report = expectReportFor(HEALTHY_BODY);
    const names = report.rows.map((r) => r.name);
    expect(names).not.toContain('security');
    expect(names).not.toContain('sentry');
  });
});

describe('env doctor (v2.399.0) — the overall voice', () => {
  it('an all-ok boot answers ok', () => {
    const body = {
      checks: {
        env_DATABASE_URL: { status: 'ok' },
        env_NEXTAUTH_SECRET: { status: 'ok' },
        env_JWT_SECRET: { status: 'ok' },
        database: { status: 'ok', detail: 'Connection successful (5ms)' },
        database_stats: {
          status: 'ok',
          detail: '15 users, 73 products, 36 transactions, 15 active sessions',
        },
        seed: { status: 'ok', detail: '15 users present' },
      },
    };
    expect(expectReportFor(body).overall).toBe('ok');
  });

  it('a warning row degrades the overall to warning (the optional-var face)', () => {
    const report = expectReportFor(HEALTHY_BODY);
    expect(report.overall).toBe('warning'); // env_DIRECT_URL warning
  });

  it('the worst row wins: error over warning over ok', () => {
    const body = {
      checks: {
        env_DATABASE_URL: { status: 'ok' },
        database: { status: 'warning', detail: 'Connection successful (1500ms)' },
        seed: { status: 'ok', detail: '15 users present' },
      },
    };
    expect(expectReportFor(body).overall).toBe('warning');
    const worse = {
      checks: {
        env_DATABASE_URL: { status: 'error' },
        database: { status: 'warning', detail: 'Connection successful (1500ms)' },
      },
    };
    expect(expectReportFor(worse).overall).toBe('error');
  });
});

describe('env doctor (v2.399.0) — the doctor card from detail text', () => {
  it('a P2021 in the database detail answers the schema-not-pushed card', () => {
    const body = {
      checks: {
        env_DATABASE_URL: { status: 'ok' },
        database: {
          status: 'error',
          detail:
            'Invalid `prisma.$queryRaw()` invocation in /app/src/app/api/health/route.ts:55:31\n\nError code: P2021: The table `main.users` does not exist in the current database.',
        },
      },
    };
    const report = expectReportFor(body);
    expect(report.diagnostic).not.toBeNull();
    expect(report.diagnostic?.code).toBe('P2021');
    expect(report.diagnostic?.title).toBe('Schema not pushed');
    expect(report.diagnostic?.steps.length).toBe(3);
  });

  it('the schema-drift static text (P2022) answers its card — database_stats carries it', () => {
    const body = {
      checks: {
        database: { status: 'ok', detail: 'Connection successful (5ms)' },
        database_stats: {
          status: 'warning',
          detail:
            'Schema drift detected: the database is missing columns this release expects (Prisma P2022 on equipment_rentals.idempotencyKey). Run the updater (Update-Mbumah-POS.bat) or "npm run db:push" in the app folder to converge the schema.',
        },
      },
    };
    const report = expectReportFor(body);
    expect(report.diagnostic?.code).toBe('P2022');
    expect(report.diagnostic?.title).toBe('Schema drift (missing column)');
  });

  it('the unreachable face (P1001) answers its card', () => {
    const body = {
      checks: {
        database: {
          status: 'error',
          detail: 'Error code: P1001: Can\u2019t reach database server at `ep-cool-name`:5432',
        },
      },
    };
    expect(expectReportFor(body).diagnostic?.code).toBe('P1001');
  });

  it('an unknown-but-real Prisma code answers the fallback card', () => {
    const body = {
      checks: { database: { status: 'error', detail: 'Error code: P9999: mysterious' } },
    };
    const card = expectReportFor(body).diagnostic;
    expect(card?.code).toBe('P9999');
    expect(card?.title).toBe('Database error');
  });

  it('no code in any detail — no card, rows only (the honest empty-DB face)', () => {
    const body = {
      checks: {
        database: { status: 'ok', detail: 'Connection successful (5ms)' },
        database_stats: { status: 'warning', detail: 'Could not retrieve stats: oh no' },
        seed: {
          status: 'warning',
          detail:
            'Database is EMPTY (0 users) - run the seed (SEED_DATABASE=true / installer) or verify DATABASE_URL points at the intended database',
        },
      },
    };
    const report = expectReportFor(body);
    expect(report.diagnostic).toBeNull();
    expect(report.overall).toBe('warning');
    expect(report.rows).toHaveLength(3);
  });

  it('the FIRST code-bearing connection row wins (database before database_stats)', () => {
    const body = {
      checks: {
        database: { status: 'error', detail: 'Error code: P2021: no tables' },
        database_stats: {
          status: 'warning',
          detail: 'Could not retrieve stats: Prisma P2022 somewhere',
        },
      },
    };
    expect(expectReportFor(body).diagnostic?.code).toBe('P2021');
  });
});

describe('db-doctor (v2.399.0) — the shared table\u2019s public face', () => {
  it('extractPrismaCode is word-bounded: real codes answer, near-misses never', () => {
    expect(extractPrismaCode('Error code: P2021: The table `main.users` does not exist')).toBe('P2021');
    expect(extractPrismaCode('Prisma P2022 on equipment_rentals.idempotencyKey')).toBe('P2022');
    expect(extractPrismaCode('P20211 is not a code')).toBeNull();
    expect(extractPrismaCode('P202 is not a code')).toBeNull();
    expect(extractPrismaCode('p2021 lowercase never speaks')).toBeNull();
    expect(extractPrismaCode('no code here at all')).toBeNull();
  });

  it('diagnosePrismaCode gates the shape and speaks the table', () => {
    expect(diagnosePrismaCode('not-a-code')).toBeNull();
    expect(diagnosePrismaCode('P20211')).toBeNull();
    expect(diagnosePrismaCode(2021 as unknown as string)).toBeNull();
    const card: DbDiagnostic | null = diagnosePrismaCode('P1003');
    expect(card?.title).toBe('Database file missing');
    expect(card?.steps.some((s) => s.includes('npx prisma db push'))).toBe(true);
  });

  it('the login doctor and the shared table answer the SAME card for P2021', () => {
    // One table, two desks — the login path now delegates; pin the sameness.
    const viaLogin = diagnosePrismaCode('P2021');
    expect(viaLogin?.summary).toMatch(/schema was never pushed|WRONG database/);
    expect(viaLogin?.steps).toHaveLength(3);
  });
});
