'use server route';

import { NextResponse } from 'next/server';

import { db, runWithoutTenant } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { withErrorBoundary } from '@/lib/logger';

/**
 * GET /api/admin/security-posture — v2.213.0 (follows the SEC-01/02/03
 * remediation program that landed in the v2.212.1 security round, PR #343).
 *
 * The security desk card's ONE read: booleans and counts that speak what the
 * environment ADMITS, never the secret material itself.
 *
 *   • legacyHashAccounts — the accounts still carrying the retired
 *     "hashed_" password format (SEC-01). The fail-closed verifier rejects
 *     them exactly like a wrong password, so this count IS the number of
 *     people locked out until scripts/migrate-legacy-passwords.mjs --apply
 *     rehashes them to bcrypt-12. One COUNT query, zero row reads.
 *   • cronSecretSet — whether CRON_SECRET is present in this environment
 *     (SEC-02). The VALUE never leaves the server; the boolean is the only
 *     thing the posture needs: unset in production means every one of the
 *     11 cron routes answers 403 by design (fail-closed).
 *   • jwtSecretSet / nextauthSecretSet — presence checks for the two auth
 *     secrets the boot health gate also watches.
 *   • gatedCronRoutes — the route count SEC-02 covered (11: b2c-recovery,
 *     debt-reminders, etims-retry, hourly, hr-report-digests, nightly,
 *     outbox, payments-sweeper, reconciliation, retention, session-reaper).
 *     A pinned constant with the names spoken in the comment so the day a
 *     twelfth route lands the mismatch is a visible diff.
 *   • envDiagnosticsGated — SEC-03: /api/health/env is SUPER_ADMIN-gated in
 *     production. The client renders this from its own knowledge of the
 *     runtime; the route confirms the law holds server-side.
 *
 * SUPER_ADMIN only (financial-and-people adjacent configuration surface —
 * same gate class as the Exchange Rates card's writes).
 */

/** The 11 cron routes the fail-closed gate covers (SEC-02, PR #343). */
export const GATED_CRON_ROUTES = 12; // v2.312.0: loyalty-expiry joins the gated cron family

async function getHandler(): Promise<Response> {
  return runWithoutTenant(async () => {
    const [totalAccounts, legacyHashAccounts] = await Promise.all([
      db.user.count(),
      db.user.count({ where: { passwordHash: { startsWith: 'hashed_' } } }),
    ]);

    const body = {
      data: {
        generatedAt: new Date().toISOString(),
        runtimeEnv: process.env.NODE_ENV ?? 'unknown',
        accounts: {
          total: totalAccounts,
          legacyHash: legacyHashAccounts,
        },
        secrets: {
          cron: Boolean(process.env.CRON_SECRET),
          jwt: Boolean(process.env.JWT_SECRET),
          nextauth: Boolean(process.env.NEXTAUTH_SECRET),
        },
        cron: {
          gatedRoutes: GATED_CRON_ROUTES,
        },
        envDiagnosticsGated: (process.env.NODE_ENV ?? '') === 'production',
      },
    };

    return NextResponse.json(body);
  });
}

export const GET = requireAuth(withErrorBoundary(getHandler, 'GET /api/admin/security-posture'), {
  roles: ['SUPER_ADMIN'],
});
