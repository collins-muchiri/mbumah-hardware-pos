// POST /api/data-exports/[id]/cancel
//
// THE STUCK ROW LEARNS TO BOW OUT (v2.439.0): the POST /api/data-exports
// pipeline creates its row as PROCESSING and finishes it synchronously —
// but when the invocation dies mid-generation (a serverless timeout, a
// dropped connection, a crash), the row stays PENDING/PROCESSING forever:
// the history table shows a spinner that will never stop, the download
// answers 409 for eternity, and nothing in the vocabulary can say why.
// This route is the honest exit: an authorised hand retires the stuck
// row as CANCELLED. The row STAYS in the history wearing its note — a
// cancelled export is a fact about the desk, not a mistake to erase —
// and the download route answers with its own cancelled message instead
// of the waiting room's.
//
// Gates (in order):
//   404 — the row does not exist
//   403 — tenancy (non-super-admins may only cancel their own store's rows;
//         the download route's own zero-trust shape)
//   409 — the row is NOT waiting (only PENDING/PROCESSING may pass): a
//         COMPLETED, FAILED, EXPIRED, or already-CANCELLED row is finished
//         history, and this hand never rewrites it
//
// Auth mirrors /api/data-exports/[id] (the FINANCIAL_WRITE_ROLES).

import { type NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { systemLog, withErrorBoundary } from '@/lib/logger';
import { withFinancialAuth, getSessionFromRequest } from '@/lib/auth';
import { LogSeverity, LogComponent } from '@/lib/types';

export const dynamic = 'force-dynamic';

const FINANCIAL_WRITE_ROLES = ['SUPER_ADMIN', 'STORE_OWNER', 'BRANCH_MANAGER', 'ACCOUNTANT'] as const;

interface RouteContext {
  params: Promise<{ id: string }>;
}

async function cancelExportHandler(...args: unknown[]): Promise<Response> {
  const request = args[0] as NextRequest;
  const context = args[1] as RouteContext;
  const { id } = await context.params;

  const session = await getSessionFromRequest(request);

  const exportRow = await db.dataExport.findUnique({ where: { id } });

  if (!exportRow) {
    return Response.json(
      { success: false, error: 'Export not found. It may have been deleted.' },
      { status: 404 },
    );
  }

  // Zero-trust tenancy: non-super-admins can only cancel their own store's
  // exports — the download route's own shape, the same quiet refusal.
  if (session && session.role !== 'SUPER_ADMIN' && exportRow.storeId !== session.storeId) {
    return Response.json(
      { success: false, error: 'You do not have permission to cancel this export.' },
      { status: 403 },
    );
  }

  // THE STUCK-ROW GATE: only a waiting row can be cancelled. Everything
  // else is finished history — the hand never rewrites COMPLETED's
  // success, FAILED's error, EXPIRED's retirement, or another CANCELLED.
  if (exportRow.status !== 'PENDING' && exportRow.status !== 'PROCESSING') {
    return Response.json(
      {
        success: false,
        error: `Only a stuck export can be cancelled (current state: ${exportRow.status}).`,
      },
      { status: 409 },
    );
  }

  const cancelled = await db.dataExport.update({
    where: { id },
    data: {
      status: 'CANCELLED',
      errorMessage: `Cancelled by ${session?.email ?? 'an unknown user'} before completion.`,
    },
    include: {
      createdBy: { select: { id: true, name: true, email: true } },
    },
  });

  await systemLog({
    action: 'DATA_EXPORT_CANCELLED',
    component: LogComponent.FINANCIAL,
    severity: LogSeverity.INFO,
    message: `Stuck export "${exportRow.exportType}" (${exportRow.format}) cancelled while ${exportRow.status}.`,
    storeId: exportRow.storeId,
    userId: session?.userId,
    metadata: { exportId: id, previousStatus: exportRow.status },
  }).catch(() => {});

  return Response.json({ success: true, data: cancelled });
}

export const POST = withErrorBoundary(
  withFinancialAuth(cancelExportHandler, FINANCIAL_WRITE_ROLES),
  'DATA_EXPORT_CANCEL',
);
