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
//
// v2.227.0 THE WATCHLIST STITCH — the ledger row now carries its
// branch's whisper: how many products at or below their reorder level
// at the row's OWN store last spoke to this row's supplier. The
// derivation is the branch watchlist's OWN law (the low-stock wire
// resolves a product's supplier from the most recent PO that carried
// it — the supplier of record), so the number the chip speaks is the
// number the branch's Low-Stock Alert Panel would group under that
// supplier. COST (assessed honestly, the worklog's demand):
//   • candidates: the active products of ONLY the stores present in
//     the loaded window, three cheap columns each (id, storeId, two
//     decimals) — catalog-bounded, not history-bounded;
//   • items: PO items of ONLY the low candidates, five cheap columns —
//     bounded by the low rows' order history, not the whole pipe;
//   • both queries ride INSIDE the same runWithoutTenant (an org read
//     is org-wide by definition — the v2.57.0 leak class never
//     shrinks an org read), and the stitch answers for the NARROWING
//     (a branch filter narrows the candidates to that branch).
// A row whose supplier holds no low rows carries 0 — the chip stays
// silent (absence stays absent). The roster CSV keeps its seven
// columns: the stitch is a live whisper, not a row of the file.
//
// v2.228.0 THE WHISPER SPEAKS ITS NAMES — the count alone made the
// org ask "WHICH rows?"; the stitch now answers. The same candidates
// query (already carrying the two decimals) grows ONE cheap column
// (name — catalog-bounded, not history-bounded), and the per-(store,
// supplier) hint carries its first THREE speakers beside the count —
// name + stock / level pairs, the SAME numbers the branch's own
// watchlist face reads (the org sees the branch's truth, never a
// second derivation). A cap, disclosed: the full roster lives on the
// branch's watchlist face — the org wire stays a whisper, not a
// second watchlist. Zero still answers an empty array — absence
// stays absent.

import { type NextRequest } from 'next/server';
import { rawDb, runWithoutTenant } from '@/lib/db';
import { withErrorBoundary } from '@/lib/logger';
import { requireAuth, type AuthSession } from '@/lib/auth';
import { hasFeaturePermission } from '@/lib/permissions';

// v2.228.0: the whisper names at most THREE speakers — a cap,
// disclosed (the full roster lives on the branch's own watchlist
// face; the org wire stays a whisper, not a second watchlist).
const WATCHLIST_NAMES_CAP = 3;

// The hint's shape: the count answers every speaker; the rows carry
// the first WATCHLIST_NAMES_CAP with the numbers the branch reads.
export type WatchlistHint = { count: number; rows: Array<{ name: string; stock: number; level: number }> };

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

    // v2.227.0 THE WATCHLIST STITCH — per (store, supplier-of-record):
    // how many of the store's low products last spoke to this supplier.
    // Two bounded queries, same org-wide law as the rows above.
    const storeIds = [...new Set(rows.map((po) => po.store.id))];
    const supplierIds = [...new Set(rows.map((po) => po.supplier.id))];
    // v2.228.0: the hint carries its speakers beside the count (first
    // WATCHLIST_NAMES_CAP as name + stock/level pairs, the cap
    // disclosed on the face).
    const hints = new Map<string, WatchlistHint>();
    if (storeIds.length > 0 && supplierIds.length > 0) {
      // The candidates: active products of the window's stores only.
      // v2.228.0: name rides along (one cheap column) so the whisper
      // can speak its speakers' names, not just their number.
      const candidates = await rawDb.product.findMany({
        where: { storeId: { in: storeIds }, isActive: true },
        select: { id: true, storeId: true, name: true, quantityInStock: true, reorderLevel: true },
      });
      const low = candidates.filter((p) => Number(p.quantityInStock) <= Number(p.reorderLevel));
      if (low.length > 0) {
        const storeByProduct = new Map(low.map((p) => [p.id, p.storeId]));
        // The supplier of record: the most recent PO that carried the
        // product (the branch low-stock wire's own derivation — newest
        // orderDate wins; items arrive newest-first, first sight pins).
        const items = await rawDb.purchaseOrderItem.findMany({
          where: { productId: { in: low.map((p) => p.id) } },
          select: { productId: true, purchaseOrder: { select: { supplierId: true, orderDate: true } } },
          orderBy: { purchaseOrder: { orderDate: 'desc' } },
        });
        const supplierByProduct = new Map<string, string>();
        for (const item of items) {
          if (!supplierByProduct.has(item.productId)) {
            supplierByProduct.set(item.productId, item.purchaseOrder.supplierId);
          }
        }
        const nameById = new Map(low.map((p) => [p.id, p]));
        for (const [productId, supplierId] of supplierByProduct) {
          if (!supplierIds.includes(supplierId)) continue;
          const key = `${storeByProduct.get(productId)}:${supplierId}`;
          const entry = hints.get(key) ?? { count: 0, rows: [] };
          entry.count += 1;
          if (entry.rows.length < WATCHLIST_NAMES_CAP) {
            const p = nameById.get(productId);
            entry.rows.push({
              name: p?.name ?? 'a low row',
              stock: Number(p?.quantityInStock ?? 0),
              level: Number(p?.reorderLevel ?? 0),
            });
          }
          hints.set(key, entry);
        }
      }
    }

    return { rows, grouped, hints };
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
        // v2.227.0: the branch's whisper — the low rows at this store
        // that last spoke to this supplier (0 stays silent on the face).
        // v2.228.0: the whisper speaks its speakers (first three — the
        // cap is the wire's law, WATCHLIST_NAMES_CAP; zero answers an
        // empty array, absence stays absent).
        watchlistHints: result.hints.get(`${po.store.id}:${po.supplier.id}`)?.count ?? 0,
        watchlist: result.hints.get(`${po.store.id}:${po.supplier.id}`)?.rows ?? [],
        // The shillings speak only past the cost gate (null otherwise —
        // the face renders the honest absence, never a hidden zero).
        totalAmount: canViewCost ? Number(po.totalAmount) : null,
      })),
    },
  });
}

export const GET = withErrorBoundary(requireAuth(orgPurchaseOrdersHandler, { roles: ORG_ROLES }), 'ORG_PURCHASE_ORDERS');
