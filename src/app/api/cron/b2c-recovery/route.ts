// GET /api/cron/b2c-recovery - Vercel Cron entry point for the payroll B2C
// auto-recovery sweep (v2.155.0).
//
// Payroll B2C disbursements used to recover ONLY when a manager opened the
// run dialog and clicked "Retry failed" / "Check status" (v2.33.0/v2.34.0).
// This route makes recovery durable: the hourly dispatcher now walks every
// posted/locked run that still holds unpaid money and applies the SAME gate
// arithmetic the UI uses (evaluateB2CRetryGate - exponential backoff 2m→30m,
// attempt ceiling 5, idempotent initiation), so a gate-allowed failure
// re-sends and a stuck PROCESSING transfer re-queries without human
// attendance. Ceil-blocked payslips stay human-only by design.
//
// AUTH: copied EXACTLY from /api/cron/etims-retry (the shared cron-secret
// gate) - fail-closed in production; non-production allows with a WARN so the
// gap is visible, 403 on a wrong header.

import { withErrorBoundary, systemLog } from '@/lib/logger';
import { LogComponent } from '@/lib/types';
import { sweepStalledPayrollB2C } from '@/lib/hr/payroll/b2c-recovery';
import { verifyCronSecret } from '@/lib/cron-auth';

export const dynamic = 'force-dynamic';
// 25 runs/tick, each a handful of indexed queries + at most one Daraja
// round-trip per stalled payslip, fits the 60s serverless budget with
// headroom for Neon cold starts.
export const maxDuration = 60;


async function b2cRecoveryHandler(request: Request): Promise<Response> {
  const denied = await verifyCronSecret(request);
  if (denied) return denied;

  const summary = await sweepStalledPayrollB2C();
  return Response.json({ success: true, dispatcher: '/api/cron/b2c-recovery', summary });
}

export const GET = withErrorBoundary(b2cRecoveryHandler, LogComponent.SYSTEM);
