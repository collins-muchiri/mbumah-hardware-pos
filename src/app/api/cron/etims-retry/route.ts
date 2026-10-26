// GET /api/cron/etims-retry - Vercel Cron entry point for the KRA eTIMS
// async invoice queue (v2.6.0).
//
// Sales commit with SalesTransaction.etimsStatus = 'PENDING' and an
// OutboxEvent kind='ETIMS_INVOICE'. Delivery is attempted opportunistically
// by the post-checkout outbox pump (the ETIMS_INVOICE handler is registered
// in src/lib/outbox-handlers.ts); THIS cron is the durable fallback that
// drains events the pump could not deliver (KRA downtime, cold starts) via
// the shared batch runner in src/lib/etims-queue.ts:
//
//   • claims up to 10 due events (status PENDING or FAILED,
//     availableAt <= now) with the outbox worker's guarded compare-and-set,
//   • on success: event COMPLETED + the transaction marked ISSUED,
//   • on failure: attempts+1 with exponential backoff (min(2^n × 60s, 1h)),
//     then DEAD + ERROR systemLog (etimsStatus stays 'PENDING' so staff can
//     re-issue manually via POST /api/etims/worker).
//
// AUTH: copied EXACTLY from /api/cron/outbox - Vercel Cron sends
// unauthenticated GETs; we gate on the `x-cron-secret` header against the
// CRON_SECRET env var (fail-closed in production; non-production allows
// production, still alertable via the WARN row - deploy with CRON_SECRET set).

import { withErrorBoundary } from '@/lib/logger';
import { LogComponent } from '@/lib/types';
import { verifyCronSecret } from '@/lib/cron-auth';

export const dynamic = 'force-dynamic';
// A 10-event batch with one KRA round-trip each fits comfortably in 60s,
// leaving headroom for Neon cold starts on a fresh lambda instance.
export const maxDuration = 60;

// Shared cron secret gate (verbatim /api/cron/outbox pattern)
// Returns a 403 Response when the caller is not authorised, or null to allow
// the request through. Inlined per cron route (cron routes are standalone by
// design - no shared mutable state between schedulers).

async function etimsRetryCronHandler(...args: unknown[]): Promise<Response> {
  const request = args[0] as Request;
  const denied = await verifyCronSecret(request);
  if (denied) return denied;

  // Lazy-import the queue machinery so a cold invocation that 403s never
  // pays for loading it, and so this route stays independent of the eTIMS
  // internals.
  const { processEtimsRetryBatch } = await import('@/lib/etims-queue');
  const result = await processEtimsRetryBatch();

  return Response.json({
    success: true,
    processed: result.processed,
    succeeded: result.succeeded,
    failed: result.failed,
    dead: result.dead,
  });
}

export const GET = withErrorBoundary(etimsRetryCronHandler, LogComponent.SYSTEM);
