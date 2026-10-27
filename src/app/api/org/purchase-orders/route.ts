// GET /api/org/purchase-orders
//
// v2.225.0 THE PIPELINE FROM ABOVE — the org face of the procurement
// pipeline. The restock dialog's hint chips (v2.224.0) taught the org
// to read WHICH purchase order spoke to a row; but the pipeline itself
// — every branch's POs, their statuses, their suppliers — lived only in
// the branch workspaces. An org role could see the hints' receipts and
// never the documents themselves. This wire is the roster: the org's
// purchase orders, newest first, filterable by status and branch,
// READ-ONLY BY LAW (the branch workspace keeps the only pens — no
// create, no approve, no receive, no cancel from the console face).
//
// THE LAWS:
//   • ORG_ROLES only (the kpi-summary contract — SUPER_ADMIN,
//     STORE_OWNER, BRANCH_MANAGER); the read runs inside
//     runWithoutTenant on the RAW client (an org read is org-wide by
//     definition; the v2.57.0 leak class must never shrink it to one
//     branch's rows);
//   • THE COST LAW: a PO's shillings (totalAmount) speak only to roles
//     holding `inventory.view.cost` — null past the gate, and the face
//     renders the honest absence, never a hidden zero. Units and line
//     counts are units — every org role hears them;
//   • HONEST COUNTS: the wire answers a per-status tally beside the
//     rows (a groupBy over the SAME org-wide where), so the filter
//     chips speak real numbers — never a fabricated ladder;
//   • the take is clamped (1..100, default 30) and DISCLOSED — the face
//     says when it is showing a window, never a pretend-complete list.

import { type NextRequest } from 'next/server';
import { rawDb, runWithoutTenant } from '@/lib/db';
import { withErrorBoundary } from '@/lib/logger';
import { requireAuth, type AuthSession } from '@/lib/auth';
import { hasFeaturePermission } from '@/lib/permissions';

export const dynamic = 'force-dynamic';

const ORG_ROLES = ['SUPER_ADMIN', 'STORE_OWNER', 'BRANCH_MANAGER'];

// The pipeline's whole ladder (schema comment is the source of record:
// "DRAFT, PENDING_APPROVAL, APPROVED, SENT, CONFIRMED, PARTIALLY_RECEIVED,
// RECEIVED, CANCELLED"). A status filter outside the ladder is refused —
// an unknown status never silently means "all".
const PO_STATUSES = [
  'DRAFT',
  'PENDING_APPROVAL',
  'APPROVED',
  'SENT',
  'CONFIRMED',
  'PARTIALLY_RECEIVED',
  'RECEIVED',
  'CANCELLED',
] as const;

export type PoStatus = (typeof PO_STATUSES)[number];

export function isPoStatus(v: string): v is PoStatus {
  return (PO_STATUSES as readonly string[]).includes(v);
}

async function orgPurchaseOrdersHandler(request: NextRequest, session: AuthSession): Promise<Response> {
  const url = new URL(request.url);
  const statusParam = url.searchParams.get('status') ?? '';
  const storeId = url.searchParams.get('storeId') ?? '';
  const takeParam = Number(url.searchParams.get('take') ?? '30');
  const take = Number.isFinite(takeParam) ? Math.min(100, Math.max(1, Math.trunc(takeParam))) : 30;

  const status = statusParam !== '' && isPoStatus(statusParam) ? statusParam : null;
  // An out-of-ladder status is a refused filter, not a silent ALL.
  if (statusParam !== '' && !status) {
    return Response.json({ success: false, error: 'unknown purchase-order status.' }, { status: 400 });
  }

  const where: { status?: string; storeId?: string } = {};
  if (status) where.status = status;
  if (storeId) where.storeId = storeId;

  const result = await runWithoutTenant(async () => {
    const [rows, grouped] = await Promise.all([
      rawDb.purchaseOrder.findMany({
        where,
        orderBy: [{ orderDate: 'desc' }, { createdAt: 'desc' }],
        take,
        select: {
          id: true,
          poNumber: true,
          status: true,
          orderDate: true,
          expectedDate: true,
          totalAmount: true,
          notes: true,
          store: { select: { id: true, name: true, code: true } },
          supplier: { select: { id: true, name: true } },
          createdBy: { select: { name: true } },
          _count: { select: { items: true } },
        },
      }),
      rawDb.purchaseOrder.groupBy({ by: ['status'], where, _count: { _all: true } }),
    ]);
    return { rows, grouped };
  });

  const canViewCost = hasFeaturePermission(session.role, 'inventory.view.cost');

  // The honest ladder: every status of the pipeline answers, even at
  // zero — the chips are the pipeline's shape, not a popularity list.
  const countByStatus = new Map<string, number>(result.grouped.map((g) => [g.status, g._count._all]));

  return Response.json({
    success: true,
    data: {
      costGated: !canViewCost,
      take,
      counts: PO_STATUSES.map((s) => ({ status: s, count: countByStatus.get(s) ?? 0 })),
      rows: result.rows.map((po) => ({
        id: po.id,
        poNumber: po.poNumber,
        status: po.status,
        orderDate: po.orderDate.toISOString(),
        expectedDate: po.expectedDate?.toISOString() ?? null,
        lineCount: po._count.items,
        store: { id: po.store.id, name: po.store.name, code: po.store.code },
        supplierName: po.supplier.name,
        raisedByName: po.createdBy?.name ?? null,
        notes: po.notes,
        // The shillings speak only past the cost gate (null otherwise —
        // the face renders the honest absence, never a hidden zero).
        totalAmount: canViewCost ? Number(po.totalAmount) : null,
      })),
    },
  });
}

export const GET = withErrorBoundary(requireAuth(orgPurchaseOrdersHandler, { roles: ORG_ROLES }), 'ORG_PURCHASE_ORDERS');
