// MBUMAH HARDWARE POS - Shared cron endpoint authentication (SECURITY AUDIT FIX SEC-02)
//
// Before this module, every /api/cron/* route carried its own copy of a
// fail-open gate: when CRON_SECRET was unset the request was ALLOWED with
// only a WARN systemLog. That made an unconfigured production deployment
// silently expose reconciliation, session-reaper, payments-sweeper and the
// outbox dispatcher to anonymous triggering (a DoS + business-logic abuse
// surface). The duplication is also why the policy drifted per-file.
//
// NEW POLICY (fail-closed in production):
//   • CRON_SECRET set      -> `x-cron-secret` header must match exactly
//                              (constant-time compare), otherwise 403.
//   • CRON_SECRET unset    -> NON-production environments (dev/test, e.g.
//                              Vercel Cron on Hobby which cannot send custom
//                              headers) are allowed through with the same
//                              WARN audit trail as before. PRODUCTION is
//                              refused with 500 - a missing secret in prod
//                              is a misconfiguration, never an open door.
//
// Callers keep their existing shape:
//   const denial = await verifyCronSecret(request, '/api/cron/xyz');
//   if (denial) return denial;

import { createHash, timingSafeEqual } from 'crypto';
import { systemLog } from '@/lib/logger';
import { LogSeverity, LogComponent } from '@/lib/types';

/** SHA-256 both sides first so timingSafeEqual sees equal-length buffers
 *  regardless of secret length (and does not leak length via early return). */
function sha256(value: string): Buffer {
  return createHash('sha256').update(value).digest();
}

function constantTimeEquals(a: string, b: string): boolean {
  const ha = sha256(a);
  const hb = sha256(b);
  return timingSafeEqual(ha, hb);
}

/**
 * Verify the x-cron-secret header against CRON_SECRET.
 * Returns null when the request may proceed, or a Response to return directly.
 */
export async function verifyCronSecret(
  request: Request,
  path: string
): Promise<Response | null> {
  const secret = process.env.CRON_SECRET;
  const provided = request.headers.get('x-cron-secret');

  if (!secret) {
    // SECURITY AUDIT FIX (SEC-02): fail CLOSED in production. A deployment
    // without CRON_SECRET must not accept anonymous cron triggers; in dev/
    // test the historical fail-open stays available (Vercel Hobby's managed
    // cron cannot send custom headers) but is loudly logged.
    if (process.env.NODE_ENV === 'production') {
      await systemLog({
        action: 'CRON_SECRET_UNSET',
        component: LogComponent.SYSTEM,
        severity: LogSeverity.ERROR,
        message:
          `CRON_SECRET env var is not set - ${path} refused an unauthenticated request (fail-closed).`,
        metadata: { path },
      });
      return Response.json(
        { error: 'Cron authentication is not configured on this deployment.' },
        { status: 500 }
      );
    }
    await systemLog({
      action: 'CRON_SECRET_UNSET',
      component: LogComponent.SYSTEM,
      severity: LogSeverity.WARN,
      message:
        `CRON_SECRET env var is not set - ${path} accepted an unauthenticated request.`,
      metadata: { path },
    });
    return null;
  }

  if (!provided || !constantTimeEquals(provided, secret)) {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  return null;
}
