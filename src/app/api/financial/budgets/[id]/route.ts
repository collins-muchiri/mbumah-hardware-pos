// PUT    /api/financial/budgets/[id] - update budgetedAmount / notes via setBudget() upsert.
// DELETE /api/financial/budgets/[id] - hard-delete a budget row (budgets are NOT immutable).

import { type NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { withErrorBoundary } from '@/lib/logger';
import { LogComponent } from '@/lib/types';
import { withFinancialAuth, FINANCIAL_ROLES } from '@/lib/auth';
import { setBudget } from '@/lib/accounting-helpers';
import { APIError } from '@/lib/api-error';
import { readJsonBody, bodyDoorRejected } from '@/lib/request-body';

export const dynamic = 'force-dynamic';

interface RouteContext {
  params: Promise<{ id: string }>;
}

async function updateBudgetHandler(...args: unknown[]): Promise<Response> {
  const request = args[0] as NextRequest;
  const context = args[1] as RouteContext;
  const { id } = await context.params;
  // v2.325.0 THE BODY DOOR: an unreadable body is a client mistake — 400, never a 500.
  // v2.335.0 — the door speaks the body's OWN shape: updatedById here maps
  // to setBudget's userId below, so the helper's signature cannot be
  // borrowed verbatim (honest literal, not a loose generic).
  const door = await readJsonBody<{
    budgetedAmount?: number | string;
    notes?: string;
    updatedById?: string;
  }>(request);
  if (!door.ok) {
    return bodyDoorRejected();
  }
  const body = door.body;

  const { budgetedAmount, notes, updatedById } = body;

  if (!updatedById) {
    return Response.json(
      { success: false, error: 'updatedById is required for the audit trail.' },
      { status: 400 },
    );
  }
  if (budgetedAmount === undefined && notes === undefined) {
    return Response.json(
      { success: false, error: 'Provide budgetedAmount and/or notes to update.' },
      { status: 400 },
    );
  }

  // Look up the existing budget so we can route through setBudget() upsert.
  const existing = await db.budget.findUnique({
    where: { id },
    select: {
      storeId: true,
      periodId: true,
      accountId: true,
      notes: true,
    },
  });
  if (!existing) {
    return Response.json(
      { success: false, error: 'Budget not found.' },
      { status: 404 },
    );
  }

  try {
    const updated = await setBudget({
      storeId: existing.storeId,
      periodId: existing.periodId,
      accountId: existing.accountId,
      budgetedAmount: budgetedAmount ?? 0, // setBudget requires this; we re-read prior value if absent
      notes: notes ?? existing.notes ?? undefined,
      userId: updatedById,
      ipAddress: request.headers.get('x-forwarded-for') ?? undefined,
      userAgent: request.headers.get('user-agent') ?? undefined,
    });

    // If only notes were provided, we need to honour the prior budgetedAmount.
    // setBudget() above will have set it to 0 if undefined - so re-apply the
    // original when the caller did not specify a new amount.
    if (budgetedAmount === undefined) {
      const prior = await db.budget.findUnique({
        where: { id },
        select: { budgetedAmount: true },
      });
      if (prior) {
        const refreshed = await setBudget({
          storeId: existing.storeId,
          periodId: existing.periodId,
          accountId: existing.accountId,
          budgetedAmount: prior.budgetedAmount.toString(),
          notes: notes ?? existing.notes ?? undefined,
          userId: updatedById,
          ipAddress: request.headers.get('x-forwarded-for') ?? undefined,
          userAgent: request.headers.get('user-agent') ?? undefined,
        });
        return Response.json({
          success: true,
          data: {
            ...refreshed,
            budgetedAmount: refreshed.budgetedAmount.toNumber(),
            actualAmount: refreshed.actualAmount.toNumber(),
            variance: refreshed.variance.toNumber(),
          },
        });
      }
    }

    return Response.json({
      success: true,
      data: {
        ...updated,
        budgetedAmount: updated.budgetedAmount.toNumber(),
        actualAmount: updated.actualAmount.toNumber(),
        variance: updated.variance.toNumber(),
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

async function deleteBudgetHandler(..._args: unknown[]): Promise<Response> {
  const context = _args[1] as RouteContext;
  const { id } = await context.params;

  const existing = await db.budget.findUnique({
    where: { id },
    select: { id: true },
  });
  if (!existing) {
    return Response.json(
      { success: false, error: 'Budget not found.' },
      { status: 404 },
    );
  }

  // Budgets are NOT in the IMMUTABLE_MODELS set, so a direct delete is permitted.
  await db.budget.delete({ where: { id } });

  return Response.json({
    success: true,
    message: 'Budget deleted.',
  });
}

export const PUT = withErrorBoundary(
  withFinancialAuth(updateBudgetHandler, FINANCIAL_ROLES.WRITE),
  LogComponent.FINANCIAL,
);
export const DELETE = withErrorBoundary(
  withFinancialAuth(deleteBudgetHandler, FINANCIAL_ROLES.WRITE),
  LogComponent.FINANCIAL,
);
