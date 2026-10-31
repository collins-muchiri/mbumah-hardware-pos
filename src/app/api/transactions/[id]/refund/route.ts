// POST /api/transactions/[id]/refund
//
// v2.308.0 - the refund comes home. The UI's Refund button had been a
// placeholder ("would call API") since the transactions tab shipped; this
// route is the API it was waiting for.
//
// A refund runs the atomic `applySaleRefund` transaction
// (src/lib/sale-refund-service.ts): guard → per-line allocation → REFUND
// transaction (+ per-line links) → restock + RETURN movements → Payment row
// (+ drawer/debt side effects) → mirror journal entry → original status
// flip → receipt row. If any step throws, the whole refund rolls back.
//
// Security posture (the audit's PHASE 7.5/9 asks):
//   • requireStoreAccess - DB-backed session + ORM-level tenant scoping.
//   • hasFeaturePermission('pos.refund') - MANAGER tier only; denials feed
//     recordPermissionDenied + the noteDeniedAndMaybeLock abuse engine
//     (5 denials / 10 min → 15-min lock), same as checkout's gates.
//   • Frontend hiding (the tab's feature-gated button) is never the only
//     protection - the server rejects first.
//   • RefundError codes map to SAFE responses; no Prisma/SQL/internal
//     details ever reach the client (withErrorBoundary sanitizes the rest).

import { type NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { withErrorBoundary } from '@/lib/logger';
import {
  requireStoreAccess,
  recordPermissionDenied,
  noteDeniedAndMaybeLock,
  type AuthSession,
} from '@/lib/auth';
import { hasFeaturePermission, PERMISSION_DENIED_MESSAGES } from '@/lib/permissions';
import { validateInput, refundSchema } from '@/lib/validations';
import {
  applySaleRefund,
  RefundError,
  REFUNDABLE_ORIGINAL_STATUSES,
  refundableLinesFrom,
  toRefundableTotal,
} from '@/lib/sale-refund-service';
import type { RefundErrorCode } from '@/lib/sale-refund-service';

export const dynamic = 'force-dynamic';

interface RouteContext {
  params: Promise<{ id: string }>;
}

// RefundError codes → HTTP status. All bodies speak the code + a
// human-readable line; none speak internals.
const REFUND_ERROR_STATUS: Record<RefundErrorCode, number> = {
  NOT_FOUND: 404,
  TENANT_MISMATCH: 403,
  NOT_REFUNDABLE: 409,
  EMPTY_REFUND: 400,
  LINE_OVER_REFUND: 400,
  AMOUNT_OVER_REFUND: 400,
};

async function refundTransactionHandler(...args: unknown[]): Promise<Response> {
  const request = args[0] as NextRequest;
  const session = args[1] as AuthSession;
  const context = args[2] as RouteContext;
  const { id } = await context.params;

  // Feature gate FIRST (cheap, feeds the abuse engine) - a cashier probing
  // the endpoint gets the same 403 contract as the hidden button would.
  if (!hasFeaturePermission(session.role, 'pos.refund')) {
    await recordPermissionDenied({ session, permission: 'pos.refund', request });
    const abuse = await noteDeniedAndMaybeLock({ session, request, permission: 'pos.refund' });
    return Response.json(
      {
        success: false,
        code: 'PERMISSION_DENIED',
        permission: 'pos.refund',
        message: PERMISSION_DENIED_MESSAGES['pos.refund'],
        ...(abuse.warning ? { warning: abuse.warning, attemptsRemaining: abuse.attemptsRemaining } : {}),
        ...(abuse.lockNotice ? { lockNotice: abuse.lockNotice } : {}),
      },
      { status: 403 },
    );
  }

  const parsed = validateInput(refundSchema, await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ success: false, error: parsed.error }, { status: 400 });
  }
  const body = parsed.data;

  // Tenant scoping: requireStoreAccess has already validated the session
  // against its store; the refund must live in THAT store.
  const storeId = session.storeId;
  if (!storeId) {
    return Response.json(
      { success: false, error: 'No store is selected for this session.' },
      { status: 400 },
    );
  }

  try {
    const result = await applySaleRefund(db, {
      originalId: id,
      storeId,
      organizationId: session.organizationId,
      actorUserId: session.userId,
      requestedLines: body.lines,
      restock: body.restock,
      reason: body.reason ?? null,
      notes: body.notes ?? null,
    });

    // F9-1 precedent: the refund is committed; the audit chain must never
    // block or fail the response. Old/new values are plain JSON numbers.
    try {
      const { auditTrail } = await import('@/lib/audit-trail');
      await auditTrail.log({
        action: 'REFUND',
        resourceType: 'SalesTransaction',
        resourceId: id,
        actorId: session.userId,
        actorRole: session.role,
        storeId,
        ipAddress: request.headers.get('x-forwarded-for')?.split(',')[0] || undefined,
        userAgent: request.headers.get('user-agent') || undefined,
        oldValues: { paymentStatus: 'COMPLETED' },
        newValues: {
          paymentStatus: result.originalPaymentStatus,
          refundReceiptNumber: result.refund.receiptNumber,
          refundTotal: result.refundTotal,
          restockLines: result.restocked.length,
          reason: body.reason ?? null,
        },
      });
    } catch {
      /* audit chain must never block a committed refund */
    }

    return Response.json({ success: true, data: result }, { status: 201 });
  } catch (error) {
    if (error instanceof RefundError) {
      return Response.json(
        {
          success: false,
          code: error.code,
          error: error.message,
          ...(error.details && typeof error.details.cause === 'string'
            ? { cause: error.details.cause }
            : {}),
        },
        { status: REFUND_ERROR_STATUS[error.code] ?? 400 },
      );
    }
    // Unknown failures rethrow into withErrorBoundary's sanitizer.
    throw error;
  }
}

export const POST = withErrorBoundary(
  requireStoreAccess(refundTransactionHandler) as (...args: unknown[]) => Promise<Response>,
  'TRANSACTION_REFUND',
);

// GET /api/transactions/[id]/refund - the refundable-line views the dialog
// renders (per-line sold/already-refunded/refundable quantities and values,
// the refund chain's exact SUMs). Same feature gate; a sale that is not
// refundable answers 409 with its code so the UI can disable the dialog
// instead of guessing from paymentStatus alone.
async function refundableLinesHandler(...args: unknown[]): Promise<Response> {
  const session = args[1] as AuthSession;
  const context = args[2] as RouteContext;
  const { id } = await context.params;
  const storeId = session.storeId;
  if (!storeId) {
    return Response.json(
      { success: false, error: 'No store is selected for this session.' },
      { status: 400 },
    );
  }

  const original = await db.salesTransaction.findUnique({
    where: { id },
    include: { items: true },
  });
  if (!original) {
    return Response.json({ success: false, code: 'NOT_FOUND' }, { status: 404 });
  }
  if (original.storeId !== storeId) {
    return Response.json({ success: false, code: 'TENANT_MISMATCH' }, { status: 403 });
  }
  if (
    original.transactionType !== 'SALE' ||
    !REFUNDABLE_ORIGINAL_STATUSES.includes(original.paymentStatus)
  ) {
    return Response.json(
      { success: false, code: 'NOT_REFUNDABLE' },
      { status: 409 },
    );
  }

  // The refund chain - exact per-line prior refunds (same SUMs the POST
  // re-derives inside its transaction).
  const priorRefunds = await db.salesTransaction.findMany({
    where: { refundedTransactionId: original.id },
    select: { items: { select: { refundedSaleItemId: true, quantity: true, lineTotal: true } } },
  });
  const priorQtyBySaleItemId = new Map<string, number>();
  const priorGrossBySaleItemId = new Map<string, number>();
  for (const refund of priorRefunds) {
    for (const item of refund.items) {
      if (!item.refundedSaleItemId) continue;
      priorQtyBySaleItemId.set(
        item.refundedSaleItemId,
        (priorQtyBySaleItemId.get(item.refundedSaleItemId) ?? 0) + Number(item.quantity),
      );
      priorGrossBySaleItemId.set(
        item.refundedSaleItemId,
        (priorGrossBySaleItemId.get(item.refundedSaleItemId) ?? 0) + Number(item.lineTotal),
      );
    }
  }

  const lines = refundableLinesFrom(original.items, priorQtyBySaleItemId, priorGrossBySaleItemId);
  return Response.json({
    success: true,
    data: {
      receiptNumber: original.receiptNumber,
      totalAmount: Number(original.totalAmount),
      paymentStatus: original.paymentStatus,
      customerName: null as string | null,
      lines,
      refundableTotal: toRefundableTotal(lines),
    },
  });
}

export const GET = withErrorBoundary(
  requireStoreAccess(refundableLinesHandler) as (...args: unknown[]) => Promise<Response>,
  'TRANSACTION_REFUND_LINES',
);
