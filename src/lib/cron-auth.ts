// MBUMAH HARDWARE POS - Shared cron authentication (fail-closed)
//
// v2.212.1 SECURITY REMEDIATION (audit finding SEC-02):
//   Every /api/cron/* route previously carried a private copy of
//   verifyCronSecret that FAILED OPEN when CRON_SECRET was unset - anyone
//   could trigger reconciliation, session reaping, debt reminders, B2C
//   recovery, retention deletes, etc. by simply omitting the x-cron-secret
//   header. All eleven routes now import THIS implementation instead.
//
//   Behavior:
//     • CRON_SECRET set    → header must match exactly, else 403 (unchanged).
//     • CRON_SECRET unset  → 403 in PRODUCTION (fail-closed). Non-production
//       (local dev, preview deployments) still allows the tick with a WARN
//       ledger row so the local pinger workflow keeps working, but the log
//       line now states that explicitly.
//
//   The wrong-secret refusal ledger (v2.170.0) is preserved verbatim so the
//   admin cron-health card keeps its audit trail.

import { systemLog } from '@/lib/logger';
import { LogComponent, LogSeverity } from '@/lib/types';

export async function verifyCronSecret(request: Request): Promise<Response | null> {
  const secret = process.env.CRON_SECRET;
  const provided = request.headers.get('x-cron-secret');

  // Resolve the route path for the ledger row; fall back to a generic label
  // if URL parsing ever fails (defense against exotic serverless runtimes).
  let path = '/api/cron';
  try {
    path = new URL(request.url).pathname;
  } catch { /* keep fallback */ }

  if (!secret) {
    const isProduction = process.env.NODE_ENV === 'production';
    await systemLog({
      action: 'CRON_SECRET_UNSET',
      component: LogComponent.SYSTEM,
      severity: LogSeverity.WARN,
      message: isProduction
        ? `CRON_SECRET env var is not set - ${path} REJECTED an unauthenticated request (fail-closed). Set CRON_SECRET to enable scheduled ticks.`
        : `CRON_SECRET env var is not set - ${path} accepted an unauthenticated request (non-production fail-open; production would 403).`,
      metadata: {
        path,
        failMode: isProduction ? 'closed' : 'open',
        environment: process.env.NODE_ENV ?? 'unknown',
      },
    });

    if (isProduction) {
      return Response.json(
        {
          success: false,
          error:
            'Forbidden: cron authentication is not configured (CRON_SECRET is unset on this deployment).',
        },
        { status: 403 },
      );
    }
    return null;
  }

  if (provided !== secret) {
    // v2.170.0: a refusal is a real operational event - before this, a tick
    // that sent the WRONG secret was invisible everywhere (no ledger row,
    // the 403 body the only trace), so the exact moment the pinger's secret
    // went stale left the card green with an aging tick and no explanation.
    // The ledger records the denial ONLY when the request at least SENT a
    // non-empty secret: a misconfigured-but-honest tick (the pinger with a
    // stale GitHub secret, a curl with a typo) always does, while anonymous
    // scanners and the Vercel-managed scheduler (which cannot send custom
    // headers) send nothing - the ledger never chases noise, and an
    // unauthenticated caller cannot write rows by spamming the endpoint.
    // No secret material rides the row - the path names the route,
    // nothing else is needed to diagnose a mismatch.
    if (provided && provided.length > 0) {
      await systemLog({
        action: 'CRON_TICK_DENIED',
        component: LogComponent.SYSTEM,
        severity: LogSeverity.WARN,
        message: 'A tick sent an x-cron-secret that did not match - refused with 403.',
        metadata: { path },
      }).catch(() => {});
    }
    return Response.json(
      { success: false, error: 'Forbidden: invalid or missing x-cron-secret header.' },
      { status: 403 },
    );
  }

  return null;
}
