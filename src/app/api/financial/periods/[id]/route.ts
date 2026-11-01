// GET /api/financial/periods/[id] - fetch a single financial period by id.
// PUT /api/financial/periods/[id] - perform a lifecycle action on a period
//      (CLOSE | LOCK | REOPEN). Body: { action, userId, reason? }.

import { type NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { withErrorBoundary } from '@/lib/logger';
import { LogComponent } from '@/lib/types';
import { withFinancialAuth, FINANCIAL_ROLES } from '@/lib/auth';
import {
  closeFinancialPeriod,
  lockFinancialPeriod,
  reopenFinancialPeriod,
} from '@/lib/accounting-helpers';
import { APIError } from '@/lib/api-error';
import { readJsonBody, bodyDoorRejected } from '@/lib/request-body';

export const dynamic = 'force-dynamic';

interface RouteContext {
  params: Promise<{ id: string }>;
}

async function getPeriodHandler(..._args: unknown[]): Promise<Response> {
  const context = _args[1] as RouteContext;
  const { id } = await context.params;

  const period = await db.financialPeriod.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          journalEntries: true,
          budgets: true,
          trialBalanceSnapshots: true,
        },
      },
    },
  });

  if (!period) {
    return Response.json(
      { success: false, error: 'Financial period not found.' },
      { status: 404 },
    );
  }

  return Response.json({
    success: true,
    data: {
      ...period,
      entryCount: period._count.journalEntries,
      budgetCount: period._count.budgets,
      snapshotCount: period._count.trialBalanceSnapshots,
      _count: undefined,
    },
  });
}

async function periodActionHandler(...args: unknown[]): Promise<Response> {
  const request = args[0] as NextRequest;
  const context = args[1] as RouteContext;
  const { id } = await context.params;
  // v2.325.0 THE BODY DOOR: an unreadable body is a client mistake — 400, never a 500.
  // v2.335.0 — the door speaks the body's OWN shape: the route dispatches on
  // `action` BEFORE the period helpers see the body (its includes() check is
  // the runtime validator — the type is the honest union, nothing looser).
  const door = await readJsonBody<{
    action?: 'CLOSE' | 'LOCK' | 'REOPEN';
    userId?: string;
    reason?: string;
  }>(request);
  if (!door.ok) {
    return bodyDoorRejected('Use {"action": "CLOSE" | "LOCK" | "REOPEN", "userId": "...", "reason": "..."}.');
  }
  const body = door.body;

  const { action, userId, reason } = body;

  if (!action || !['CLOSE', 'LOCK', 'REOPEN'].includes(action)) {
    return Response.json(
      {
        success: false,
        error: 'action must be one of: CLOSE, LOCK, REOPEN.',
      },
      { status: 400 },
    );
  }
  if (!userId) {
    return Response.json(
      { success: false, error: 'userId is required for the audit trail.' },
      { status: 400 },
    );
  }
  // CLOSE and LOCK require a reason; REOPEN also requires a reason per the helper.
  if ((action === 'CLOSE' || action === 'LOCK' || action === 'REOPEN') &&
      (!reason || reason.trim().length < 3)) {
    return Response.json(
      { success: false, error: `A reason (≥ 3 characters) is required for ${action}.` },
      { status: 400 },
    );
  }

  const opts = {
    ipAddress: request.headers.get('x-forwarded-for') ?? undefined,
    userAgent: request.headers.get('user-agent') ?? undefined,
  };

  try {
    let updated;
    if (action === 'CLOSE') {
      updated = await closeFinancialPeriod(id, userId, opts);
    } else if (action === 'LOCK') {
      updated = await lockFinancialPeriod(id, userId, opts);
    } else {
      updated = await reopenFinancialPeriod(id, userId, reason as string, opts);
    }
    return Response.json({ success: true, data: updated });
  } catch (error) {
    if (error instanceof APIError) {
      return Response.json(
        { success: false, error: error.message },
        { status: error.statusCode },
      );
    }
    throw error;
  }
}

export const GET = withErrorBoundary(
  withFinancialAuth(getPeriodHandler, FINANCIAL_ROLES.READ),
  LogComponent.FINANCIAL,
);
export const PUT = withErrorBoundary(
  withFinancialAuth(periodActionHandler, FINANCIAL_ROLES.WRITE),
  LogComponent.FINANCIAL,
);
