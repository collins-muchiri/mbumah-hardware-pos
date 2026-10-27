// GET /api/org/purchase-orders/[id]
//
// v2.225.0 THE PIPELINE FROM ABOVE — the roster's door. A row in the
// org PO ledger opens ONE purchase order's lines org-side, exactly as
// the variance map's rows open a count sheet (v2.222.0's contract,
// grown to the procurement face). The store-scoped branch routes stay
// the only writers: READ-ONLY BY LAW.
//
// THE LAWS:
//   • ORG_ROLES only (the kpi-summary contract — SUPER_ADMIN,
//     STORE_OWNER, BRANCH_MANAGER); the read runs inside
//     runWithoutTenant on the RAW client (an org read is org-wide by
//     definition; the v2.57.0 leak class must never shrink it);
//   • THE COST LAW: the shillings (unitCost, totalCost, totalAmount)
//     speak only to roles holding `inventory.view.cost` — null past
//     the gate, and the face renders the honest absence, never a
//     hidden zero. Quantities are quantities — every org role hears
//     them;
//   • every status drills: a DRAFT shows its ink, a RECEIVED its
//     fulfillment, a CANCELLED its grave — the lines and the timeline
//     answer for all eight rungs of the ladder;
//   • the drill is a DELIBERATE act (the user opened a document), so
//     ONE fetch is the contract, disclosed by the loading face — the
//     same exception the sheet drill carries.

import { type NextRequest } from 'next/server';
import { rawDb, runWithoutTenant } from '@/lib/db';
import { withErrorBoundary } from '@/lib/logger';
import { requireAuth, type AuthSession } from '@/lib/auth';
import { hasFeaturePermission } from '@/lib/permissions';

export const dynamic = 'force-dynamic';

const ORG_ROLES = ['SUPER_ADMIN', 'STORE_OWNER', 'BRANCH_MANAGER'];

interface RouteContext {
  params: Promise<{ id: string }>;
}

async function orgPurchaseOrderDetailHandler(_request: NextRequest, session: AuthSession, context: RouteContext): Promise<Response> {
  const { id } = await context.params;

  const po = await runWithoutTenant(() =>
    rawDb.purchaseOrder.findUnique({
      where: { id },
      select: {
        id: true,
        poNumber: true,
        status: true,
        orderDate: true,
        expectedDate: true,
        subTotal: true,
        taxAmount: true,
        totalAmount: true,
        notes: true,
        createdAt: true,
        approvedAt: true,
        receivedAt: true,
        cancelledAt: true,
        store: { select: { id: true, name: true, code: true } },
        supplier: { select: { id: true, name: true } },
        createdBy: { select: { name: true } },
        approvedBy: { select: { name: true } },
        receivedBy: { select: { name: true } },
        cancelledBy: { select: { name: true } },
        items: {
          orderBy: [{ productName: 'asc' }],
          select: {
            id: true,
            productName: true,
            quantity: true,
            unitCost: true,
            totalCost: true,
            receivedQty: true,
            // v2.226.0: the line's own note rides the wire — the paper
            // face and the screen face both read it (absent stays absent).
            notes: true,
            product: { select: { sku: true, unitType: true } },
          },
        },
      },
    }),
  );
  if (!po) {
    return Response.json({ success: false, error: 'purchase order not found.' }, { status: 404 });
  }

  const canViewCost = hasFeaturePermission(session.role, 'inventory.view.cost');

  const orderedUnits = po.items.reduce((acc, l) => acc + Number(l.quantity), 0);
  const receivedUnits = po.items.reduce((acc, l) => acc + Number(l.receivedQty), 0);

  return Response.json({
    success: true,
    data: {
      id: po.id,
      poNumber: po.poNumber,
      status: po.status,
      notes: po.notes,
      orderDate: po.orderDate.toISOString(),
      expectedDate: po.expectedDate?.toISOString() ?? null,
      createdAt: po.createdAt.toISOString(),
      approvedAt: po.approvedAt?.toISOString() ?? null,
      receivedAt: po.receivedAt?.toISOString() ?? null,
      cancelledAt: po.cancelledAt?.toISOString() ?? null,
      createdByName: po.createdBy?.name ?? null,
      approvedByName: po.approvedBy?.name ?? null,
      receivedByName: po.receivedBy?.name ?? null,
      cancelledByName: po.cancelledBy?.name ?? null,
      store: { id: po.store.id, name: po.store.name, code: po.store.code },
      supplierName: po.supplier.name,
      summary: {
        lineCount: po.items.length,
        // Units are units — every org role hears the pipeline's weight.
        orderedUnits: Math.round(orderedUnits * 100) / 100,
        receivedUnits: Math.round(receivedUnits * 100) / 100,
        // The shillings speak only past the cost gate (null otherwise —
        // the face renders the honest absence, never a hidden zero).
        totalAmount: canViewCost ? Number(po.totalAmount) : null,
      },
      lines: po.items.map((l) => ({
        id: l.id,
        name: l.productName,
        sku: l.product.sku,
        unitType: l.product.unitType,
        qty: Number(l.quantity),
        receivedQty: Number(l.receivedQty),
        unitCost: canViewCost ? Number(l.unitCost) : null,
        totalCost: canViewCost ? Number(l.totalCost) : null,
        notes: l.notes,
      })),
    },
  });
}

export const GET = withErrorBoundary(requireAuth(orgPurchaseOrderDetailHandler, { roles: ORG_ROLES }), 'ORG_PURCHASE_ORDER_DETAIL');
