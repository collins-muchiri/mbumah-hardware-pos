// GET /api/cron/outbox - Vercel Cron entry point for the transactional outbox.
//
// AUDIT REFERENCE - FINANCIAL_MODULE_AUDIT_REPORT.md (F8-4 / Wave 0):
//   Vercel serverless functions freeze shortly after the HTTP response is
//   returned, so outbox events enqueued during checkout (M-Pesa STK Push,
//   audit alerts) can silently die half-done if delivery is left to
//   fire-and-forget promises. This route is invoked on a schedule (see
//   vercel.json "crons") and drains due OutboxEvents via pumpOutbox(), which
//   claims events with a guarded status flip so concurrent pumps never
//   double-deliver.
//
// SCHEDULE NOTE (Vercel Hobby plan): Vercel limits crons on Hobby to a daily
// minimum - the hourly "0 * * * *" expression is accepted syntax and degrades
// gracefully (runs once daily at 00:00 UTC on Hobby). Upgrade to Pro for true
// hourly runs. The outbox ALSO pumps opportunistically after checkout
// commits, so Hobby-plan clamping only slows background retries, not delivery.
//
// AUTH: Vercel Cron sends unauthenticated GETs from Vercel's infrastructure.
// We gate on the `x-cron-secret` header compared against the CRON_SECRET env
// var:
//   • CRON_SECRET set    → header must match exactly, otherwise 403.
//   • CRON_SECRET unset  → request is allowed, but a WARN is written to
//     system_logs so the unauthenticated gap is visible and alertable
//     (deploy with CRON_SECRET set in production).

import { withErrorBoundary, systemLog } from '@/lib/logger';
import { LogSeverity, LogComponent } from '@/lib/types';
// SECURITY AUDIT FIX (SEC-02): the local fail-open gate is retired;
// all cron routes share the fail-closed verifier in src/lib/cron-auth.ts.
import { verifyCronSecret } from '@/lib/cron-auth';

export const dynamic = 'force-dynamic';
// The pump processes a bounded batch (25 events) with per-event retries;
// 60s leaves headroom for Neon cold starts on a fresh lambda instance.
export const maxDuration = 60;


async function outboxCronHandler(...args: unknown[]): Promise<Response> {
  const request = args[0] as Request;
  const denied = await verifyCronSecret(request, '/api/cron/outbox');
  if (denied) return denied;

  // Lazy-import the outbox machinery so a cold invocation that 403s never
  // pays for loading the handler registry, and so this route stays
  // independent of outbox internals.
  const { ensureOutboxHandlers } = await import('@/lib/outbox-handlers');
  ensureOutboxHandlers();
  const { pumpOutbox } = await import('@/lib/outbox');
  const result = await pumpOutbox();

  return Response.json({ success: true, result });
}

export const GET = withErrorBoundary(outboxCronHandler, LogComponent.SYSTEM);
