// GET/POST /api/loyalty/expiry - the loyalty desk's expiry desk (v2.312.0).
//
// GET  = the PREVIEW: per wallet, how many points WOULD expire under the
//        policy window — the plan only, zero writes (the pure seam in
//        dry-run shape; the desk's dialog renders it before anything
//        moves).
// POST = the RUN: the same plan, then the per-wallet conditional claim
//        (updateMany gte/decrement — the clawback's exact pattern), one
//        EXPIRE row per claimed wallet. Manager-or-above: expiring
//        spendable points is a money-adjacent act, the same tier the
//        manual adjustment and refund paths guard.
//
// The run is IDEMPOTENT by construction (the EXPIRE row is itself a
// consumption — the next plan answers 0), so a double-press can never
// double-expire. Lost claims (a wallet redeemed mid-run) skip honestly:
// the next run — tonight's cron or tomorrow's button — catches what
// remains. Both voices log LOYALTY_EXPIRY_RUN so the ledger and the
// Automation pulse see the manual path exactly as they see the cron.

import { type NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { systemLog, withErrorBoundary } from '@/lib/logger';
import { LogComponent, LogSeverity } from '@/lib/types';
import { withSessionAuth, MANAGER_PLUS_ROLES, type AuthSession } from '@/lib/auth';
import {
  LOYALTY_EXPIRY_DEFAULT_DAYS,
  LOYALTY_EXPIRY_MIN_DAYS,
  LOYALTY_EXPIRY_REFERENCE_TYPE,
  runLoyaltyExpiry,
} from '@/lib/loyalty-expiry-service';

export const dynamic = 'force-dynamic';

export const LOYALTY_EXPIRY_LOG_ACTION = 'LOYALTY_EXPIRY_RUN';

function resolvePolicyDays(raw: string | null): number {
  const parsed = parseInt(raw || '', 10);
  if (!Number.isFinite(parsed)) return LOYALTY_EXPIRY_DEFAULT_DAYS;
  return Math.max(LOYALTY_EXPIRY_MIN_DAYS, parsed);
}

type ExpiryPreviewRow = {
  customerId: string;
  customerName: string;
  walletBefore: number;
  expirable: number;
  lotCount: number;
};

function previewRows(run: Awaited<ReturnType<typeof runLoyaltyExpiry>>): ExpiryPreviewRow[] {
  return run.outcomes
    .filter((o) => o.expirable > 0)
    .map((o) => ({
      customerId: o.customerId,
      customerName: o.customerName,
      walletBefore: o.walletBefore,
      expirable: o.expirable,
      lotCount: o.lotCount ?? 0,
    }));
}

async function previewHandler(...args: unknown[]): Promise<Response> {
  const request = args[0] as NextRequest;
  const session = args[1] as AuthSession;
  const { searchParams } = new URL(request.url);
  const storeId = searchParams.get('storeId') || session.storeId;
  if (!storeId) {
    return Response.json(
      { success: false, error: 'storeId is required (the session carries none).' },
      { status: 400 },
    );
  }
  const policyDays = resolvePolicyDays(searchParams.get('policyDays'));

  // Dry run: the plan and NOTHING else — no claims, no rows.
  const run = await runLoyaltyExpiry({
    client: db,
    storeId,
    policyDays,
    actorId: session.userId,
    dryRun: true,
  });

  const rows = previewRows(run);
  return Response.json({
    success: true,
    data: {
      storeId,
      policyDays: run.policyDays,
      scanned: run.scanned,
      walletsAffected: rows.length,
      pointsExpirable: rows.reduce((sum, r) => sum + r.expirable, 0),
      rows,
    },
  });
}

async function runHandler(...args: unknown[]): Promise<Response> {
  const request = args[0] as NextRequest;
  const session = args[1] as AuthSession;
  let body: { storeId?: string; policyDays?: number } = {};
  try {
    body = (await request.json()) as typeof body;
  } catch {
    body = {};
  }
  const storeId = body.storeId || session.storeId;
  if (!storeId) {
    return Response.json(
      { success: false, error: 'storeId is required (the session carries none).' },
      { status: 400 },
    );
  }
  const policyDays = resolvePolicyDays(
    body.policyDays === undefined || body.policyDays === null
      ? null
      : String(body.policyDays),
  );

  // The real run: claims + EXPIRE rows. dryRun is NOT accepted here — the
  // preview endpoint IS the dry run, one honest door per intent.
  const run = await runLoyaltyExpiry({
    client: db,
    storeId,
    policyDays,
    actorId: session.userId,
    dryRun: false,
  });

  const skippedLost = run.outcomes.filter((o) => o.note === 'claimed-lost').length;
  await systemLog({
    action: LOYALTY_EXPIRY_LOG_ACTION,
    component: LogComponent.SYSTEM,
    severity: LogSeverity.INFO,
    message:
      run.walletsExpired > 0
        ? `Manual loyalty expiry (${run.policyDays}-day window) on store ${storeId}: ${run.walletsExpired} wallet(s) expired, ${run.pointsExpired} points.`
        : `Manual loyalty expiry (${run.policyDays}-day window) on store ${storeId}: nothing to expire.`,
    metadata: {
      path: '/api/loyalty/expiry',
      actorId: session.userId,
      storeId,
      policyDays: run.policyDays,
      scanned: run.scanned,
      walletsExpired: run.walletsExpired,
      pointsExpired: run.pointsExpired,
      claimsLost: skippedLost,
      referenceType: LOYALTY_EXPIRY_REFERENCE_TYPE,
    },
  }).catch(() => {});

  return Response.json({
    success: true,
    data: {
      storeId,
      policyDays: run.policyDays,
      scanned: run.scanned,
      walletsExpired: run.walletsExpired,
      pointsExpired: run.pointsExpired,
      claimsLost: skippedLost,
      outcomes: run.outcomes,
    },
  });
}

export const GET = withErrorBoundary(
  withSessionAuth(previewHandler, { roles: MANAGER_PLUS_ROLES }),
  'LOYALTY_EXPIRY_PREVIEW',
);

export const POST = withErrorBoundary(
  withSessionAuth(runHandler, { roles: MANAGER_PLUS_ROLES }),
  'LOYALTY_EXPIRY_RUN',
);
