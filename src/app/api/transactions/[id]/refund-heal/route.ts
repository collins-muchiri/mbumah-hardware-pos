// POST /api/transactions/[id]/refund-heal
//
// v2.373.0 - the stranded-gap heal comes home. v2.372.0's gap closure
// settles the header's remaining consideration when the LAST refundable
// line dies inside a LIVE refund tranche - but the rows that stranded
// BEFORE that law shipped (legacy PARTIAL originals whose every line is
// already consumed by the refund chain, the header remainder still
// positive) predate it: they have no quantity left to allocate, so the
// live refund answers EMPTY_REFUND and the sale sits at PARTIAL forever.
// This route is the settlement those rows were owed.
//
// The heal runs the atomic `healStrandedOriginal` transaction
// (src/lib/sale-refund-service.ts): guard → chain SUMs → in-transaction
// stranded assessment → zero-item REFUND transaction (the header's
// remainder exactly) → Payment row (+ drawer/debt side effects) → mirror
// journal entry → original flips REFUNDED → receipt row → loyalty
// clawback. If any step throws, the whole heal rolls back.
//
// Security posture: the refund route's own contract, unchanged -
//   • requireStoreAccess - DB-backed session + ORM-level tenant scoping.
//   • hasFeaturePermission('pos.refund') - MANAGER tier only; denials feed
//     recordPermissionDenied + the noteDeniedAndMaybeLock abuse engine.
//     The heal IS a money-out refund (the same drawer, ledger and journal
//     surfaces), so it wears the same gate - a new permission would lie
//     about the risk it carries.
//   • RefundError codes map to SAFE responses (NOT_STRANDED → 409: the
//     sale's lines are not fully exhausted or nothing remains on the
//     header - there is nothing to settle); no internals reach the client.

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
import { validateInput, refundHealSchema } from '@/lib/validations';
import { healStrandedOriginal, RefundError, type RefundErrorCode } from '@/lib/sale-refund-service';

export const dynamic = 'force-dynamic';

interface RouteContext {
  params: Promise<{ id: string }>;
}

const REFUND_HEAL_ERROR_STATUS: Record<RefundErrorCode, number> = {
  NOT_FOUND: 404,
  TENANT_MISMATCH: 403,
  NOT_REFUNDABLE: 409,
  EMPTY_REFUND: 400,
  LINE_OVER_REFUND: 400,
  AMOUNT_OVER_REFUND: 400,
  NOT_STRANDED: 409,
};

async function refundHealHandler(...args: unknown[]): Promise<Response> {
  const request = args[0] as NextRequest;
  const session = args[1] as AuthSession;
  const context = args[2] as RouteContext;
  const { id } = await context.params;

  // Feature gate FIRST (cheap, feeds the abuse engine) - the same 403
  // contract the live refund speaks.
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

  // An empty body is legal (the settle needs no allocation); a malformed
  // one answers 400 through the same validateInput seam.
  const parsed = validateInput(refundHealSchema, await request.json().catch(() => ({})));
  if (!parsed.success) {
    return Response.json({ success: false, error: parsed.error }, { status: 400 });
  }

  const storeId = session.storeId;
  if (!storeId) {
    return Response.json(
      { success: false, error: 'No store is selected for this session.' },
      { status: 400 },
    );
  }

  try {
    const result = await healStrandedOriginal(db, {
      originalId: id,
      storeId,
      organizationId: session.organizationId,
      actorUserId: session.userId,
      notes: parsed.data.notes ?? null,
    });

    // F9-1 precedent: committed money logs its audit row best-effort - the
    // audit chain must never block or fail the response.
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
        oldValues: { paymentStatus: result.originalPriorPaymentStatus },
        newValues: {
          paymentStatus: result.originalPaymentStatus,
          refundReceiptNumber: result.refund.receiptNumber,
          refundTotal: result.refundTotal,
          healed: true,
          restockLines: 0,
        },
      });
    } catch {
      /* audit chain must never block a committed heal */
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
        { status: REFUND_HEAL_ERROR_STATUS[error.code] ?? 400 },
      );
    }
    throw error;
  }
}

export const POST = withErrorBoundary(
  requireStoreAccess(refundHealHandler),
  'TRANSACTION_REFUND_HEAL',
);
