// POST /api/financial/budgets/recalculate - recalculate actuals for a period.
//
// For every budget row in the period, sums posted, non-voided journal-entry
// lines for the budgeted account (respecting normalBalance) and updates the
// `actualAmount` and `variance` columns.

import { type NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { withErrorBoundary } from '@/lib/logger';
import { LogComponent } from '@/lib/types';
import { withFinancialAuth, FINANCIAL_ROLES } from '@/lib/auth';
import { recalculateBudgetActuals } from '@/lib/accounting-helpers';
import { APIError } from '@/lib/api-error';
import { readJsonBody, bodyDoorRejected } from '@/lib/request-body';

export const dynamic = 'force-dynamic';

async function recalculateHandler(...args: unknown[]): Promise<Response> {
  const request = args[0] as NextRequest;
  // THE BODY DOOR: an unreadable body is a client mistake (v2.326.0):
  const door = await readJsonBody<{ storeId?: string; periodId?: string }>(request);
  if (!door.ok) {
    return bodyDoorRejected();
  }
  const body = door.body;

  const { storeId, periodId } = body;

  if (!storeId || !periodId) {
    return Response.json(
      { success: false, error: 'storeId and periodId are required.' },
      { status: 400 },
    );
  }

  // v2.335.0 — THE CROSS-CHECK THE COMMENT ALWAYS PROMISED: the period must
  // belong to the calling store. The old code went straight to the helper
  // (which only checks EXISTENCE), so a budget viewer of store A could
  // recalculate store B's actuals by guessing periodIds. The mismatch now
  // answers the helper's own 404 voice — and only AFTER the door passed.
  const period = await db.financialPeriod.findUnique({
    where: { id: periodId },
    select: { storeId: true },
  });
  if (!period || period.storeId !== storeId) {
    return Response.json(
      { success: false, error: 'Period not found for this store.' },
      { status: 404 },
    );
  }

  // (The helper below still only checks existence — the store membership is
  // now enforced HERE, so the comment's promise is finally code.)
  try {
    const result = await recalculateBudgetActuals(periodId);
    return Response.json({
      success: true,
      data: {
        updated: result.updated,
        budgets: result.budgets.map((b) => ({
          ...b,
          budgetedAmount: b.budgetedAmount.toNumber(),
          actualAmount: b.actualAmount.toNumber(),
          variance: b.variance.toNumber(),
        })),
      },
    });
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

export const POST = withErrorBoundary(
  withFinancialAuth(recalculateHandler, FINANCIAL_ROLES.WRITE),
  LogComponent.FINANCIAL,
);
