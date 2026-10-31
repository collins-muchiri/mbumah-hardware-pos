// GET /api/cron/loyalty-expiry - expire loyalty points unspent past the
// policy window (v2.312.0).
//
// WHY: the ledger has spoken an "Expire" voice since the desk shipped,
// but nothing ever WROTE an EXPIRE row — a voice for rows nothing
// produced. This run is the honest writer: per store, per wallet, the
// FIFO plan from src/lib/loyalty-expiry-service (old earn lots minus
// total consumption, capped by the live wallet) claimed with the SAME
// conditional decrement the clawback uses. Idempotent by construction:
// the EXPIRE row is itself a consumption, so tomorrow's plan answers 0 —
// the nightly tick can never double-expire.
//
// AUTH: copied EXACTLY from /api/cron/session-reaper - Vercel Cron sends
// unauthenticated GETs; we gate on the `x-cron-secret` header against the
// CRON_SECRET env var (fail-closed in production; non-production allows
// but alertable via the WARN row - deploy with CRON_SECRET set).
//
// SCOPE: every store that has ever written a loyalty transaction. The
// service scopes each query by explicit storeId; the sweep itself is a
// genuinely cross-tenant operation, wrapped in runWithoutTenant like
// login and the session sweep (src/lib/db.ts's own usage note).

import { withErrorBoundary, systemLog } from '@/lib/logger';
import { LogComponent, LogSeverity } from '@/lib/types';
import { db, runWithoutTenant } from '@/lib/db';
import { verifyCronSecret } from '@/lib/cron-auth';
import {
  LOYALTY_EXPIRY_DEFAULT_DAYS,
  runLoyaltyExpiry,
} from '@/lib/loyalty-expiry-service';

export const dynamic = 'force-dynamic';
// One pass over the loyalty tables, one claim per affected wallet - the
// run fits the 60s serverless budget on any realistic wallet census.
export const maxDuration = 60;

export const LOYALTY_EXPIRY_LOG_ACTION = 'LOYALTY_EXPIRY_RUN';

async function loyaltyExpiryCronHandler(...args: unknown[]): Promise<Response> {
  const request = args[0] as Request;
  const denied = await verifyCronSecret(request);
  if (denied) return denied;

  const results = await runWithoutTenant(async () => {
    const storeIds = await db.loyaltyTransaction.findMany({
      distinct: ['storeId'],
      select: { storeId: true },
    });
    const perStore = [];
    for (const { storeId } of storeIds) {
      const run = await runLoyaltyExpiry({
        client: db,
        storeId,
        policyDays: LOYALTY_EXPIRY_DEFAULT_DAYS,
        actorId: null,
        dryRun: false,
      });
      perStore.push({ storeId, ...run });
    }
    return perStore;
  });

  const walletsExpired = results.reduce((sum, r) => sum + r.walletsExpired, 0);
  const pointsExpired = results.reduce((sum, r) => sum + r.pointsExpired, 0);
  const scanned = results.reduce((sum, r) => sum + r.scanned, 0);

  // One INFO row per sweep - a healthy expiry run must still leave a
  // trace the Automation pulse can read (the dispatcher's posture).
  await systemLog({
    action: LOYALTY_EXPIRY_LOG_ACTION,
    component: LogComponent.SYSTEM,
    severity: LogSeverity.INFO,
    message:
      walletsExpired > 0
        ? `Loyalty expiry swept ${scanned} wallet(s) across ${results.length} store(s): ${walletsExpired} expired, ${pointsExpired} points returned to the pool.`
        : `Loyalty expiry swept ${scanned} wallet(s) across ${results.length} store(s): nothing to expire.`,
    metadata: {
      path: '/api/cron/loyalty-expiry',
      stores: results.map((r) => ({
        storeId: r.storeId,
        scanned: r.scanned,
        walletsExpired: r.walletsExpired,
        pointsExpired: r.pointsExpired,
      })),
    },
  }).catch(() => {});

  return Response.json({
    success: true,
    path: '/api/cron/loyalty-expiry',
    scanned,
    walletsExpired,
    pointsExpired,
    stores: results,
  });
}

export const GET = withErrorBoundary(loyaltyExpiryCronHandler, LogComponent.SYSTEM);
