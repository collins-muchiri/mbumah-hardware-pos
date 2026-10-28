// GET /api/org/stock-takes/[id]
//
// v2.222.0 THE SHEET DRILL — the variance map's roster rows become a
// door: an org user can now open a count sheet's LINES from the console.
// v2.219.0's detail route (`/api/stock-takes/[id]`) is store-scoped —
// an org role without a store assignment hits its 403 wall, so the map
// could say "29/29 counted · +4 over" but never WHICH lines moved.
//
// THE LAWS:
//   • ORG_ROLES only (the kpi-summary contract — SUPER_ADMIN,
//     STORE_OWNER, BRANCH_MANAGER) and the read runs WITHOUT tenant
//     (an org read is org-wide by definition; runWithoutTenant so the
//     v2.57.0 leak class can never shrink it to one branch's rows);
//   • THE COST LAW rides unchanged: variance VALUE speaks only to
//     roles holding `inventory.view.cost` — a cashier counts units,
//     the shillings stay off the wire (null renders the honest
//     absence on the face, never a hidden zero);
//   • READ-ONLY BY LAW — the org face watches the floor's truth; it
//     never counts, closes or cancels from the console (the branch
//     sheet face keeps the only pens);
//   • every status drills: a COUNTING sheet shows its progress lines,
//     a CLOSED sheet its variance chips and the stored close-day cost,
//     a CANCELLED sheet its void (the lines froze, the books never
//     heard it);
//   • v2.230.0 THE SHEET'S LENS: every line names its category (the
//     product's own ProductCategory name, null when the product never
//     joined one — "uncategorized" is the face's honest bucket). The
//     lens is a READING instrument on the client; the wire only tells
//     the truth it already holds — one query, zero new fetches.

import { type NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { withErrorBoundary } from '@/lib/logger';
import { requireAuth, type AuthSession } from '@/lib/auth';
import { hasFeaturePermission } from '@/lib/permissions';

export const dynamic = 'force-dynamic';

const ORG_ROLES = ['SUPER_ADMIN', 'STORE_OWNER', 'BRANCH_MANAGER'];

interface RouteContext {
  params: Promise<{ id: string }>;
}

async function orgStockTakeDetailHandler(_request: NextRequest, session: AuthSession, context: RouteContext): Promise<Response> {
  const { id } = await context.params;

  const sheet = await db.stockTake.findUnique({
    where: { id },
    include: {
      // v2.232.0: the recount door's address — the store's slug rides
      // the store block the drill already holds (one cheap column,
      // catalog-bounded; zero new fetches). The drill's CLOSED face
      // links "recount the variances at the branch" — the org face
      // POINTS, the branch face keeps the pens (the read-only law).
      store: { select: { id: true, name: true, code: true, slug: true } },
      lines: {
        orderBy: [{ countedQty: { sort: 'asc', nulls: 'first' } }, { product: { name: 'asc' } }],
        select: {
          id: true,
          productId: true,
          snapshotQty: true,
          countedQty: true,
          variance: true,
          varianceCost: true,
          product: {
            select: {
              name: true,
              sku: true,
              unitType: true,
              costPrice: true,
              // v2.230.0: the lens's raw material — the category's name
              // rides the product the line already joins.
              category: { select: { name: true } },
            },
          },
        },
      },
      startedBy: { select: { name: true } },
      closedBy: { select: { name: true } },
    },
  });
  if (!sheet) {
    return Response.json({ success: false, error: 'count sheet not found.' }, { status: 404 });
  }

  const canViewCost = hasFeaturePermission(session.role, 'inventory.view.cost');

  const counted = sheet.lines.filter((l) => l.countedQty != null);
  const varianceUnits = counted.reduce((acc, l) => acc + Number(l.variance ?? 0), 0);
  const varianceValueEstimate = counted.reduce(
    (acc, l) => acc + Number(l.variance ?? 0) * Number(l.product.costPrice ?? 0),
    0,
  );

  return Response.json({
    success: true,
    data: {
      id: sheet.id,
      status: sheet.status,
      notes: sheet.notes,
      startedAt: sheet.startedAt.toISOString(),
      closedAt: sheet.closedAt?.toISOString() ?? null,
      startedByName: sheet.startedBy?.name ?? null,
      closedByName: sheet.closedBy?.name ?? null,
      store: { id: sheet.store.id, name: sheet.store.name, code: sheet.store.code, slug: sheet.store.slug },
      summary: {
        totalLines: sheet.lines.length,
        countedLines: counted.length,
        uncountedLines: sheet.lines.length - counted.length,
        // Units are units — every org role hears the floor's arithmetic.
        varianceUnits: Math.round(varianceUnits * 100) / 100,
        // The shillings speak only past the cost gate (null otherwise —
        // the face renders the honest absence, never a hidden zero).
        varianceValue: canViewCost ? Math.round(varianceValueEstimate * 100) / 100 : null,
      },
      lines: sheet.lines.map((l) => ({
        id: l.id,
        name: l.product.name,
        sku: l.product.sku,
        unitType: l.product.unitType,
        // v2.230.0: the line's shelf name — null when the product never
        // joined a category (the face reads that as "uncategorized",
        // an honest bucket, never a hidden grouping).
        category: l.product.category?.name ?? null,
        snapshotQty: Number(l.snapshotQty),
        countedQty: l.countedQty != null ? Number(l.countedQty) : null,
        variance: l.variance != null ? Number(l.variance) : null,
        // Post-close truth (only on CLOSED sheets; still past the gate).
        varianceCost: canViewCost && l.varianceCost != null ? Number(l.varianceCost) : null,
      })),
    },
  });
}

export const GET = withErrorBoundary(requireAuth(orgStockTakeDetailHandler, { roles: ORG_ROLES }), 'ORG_STOCK_TAKE_DETAIL');
