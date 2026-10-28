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
import { readCadenceLaw } from '@/lib/cadence-law';
import { readCategoryBand, type CadenceBand } from '@/lib/cadence-band';

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
      // v2.242.0 THE AISLE'S ECHO — the door's aisle name rides the drill
      // (one join the sheet already holds a column for; a hand-raised or
      // aisle-less sheet reads null — the echo speaks only the truth).
      walkAisle: { select: { name: true } },
    },
  });
  if (!sheet) {
    return Response.json({ success: false, error: 'count sheet not found.' }, { status: 404 });
  }

  const canViewCost = hasFeaturePermission(session.role, 'inventory.view.cost');

  // v2.234.0 THE VERDICT — the lineage BACKWARDS. v2.233.0 taught the
  // faces to read a sheet's note (a child knows its parent); this round
  // the parent learns its child: one bounded read over the notes the
  // spawn signs (the exact signature, or the signature with a trailing
  // space — a cuid can never prefix-collide with a sibling of the same
  // length, but the clause stays exact anyway). Latest child first;
  // the child's variance units ride the SAME read (its lines come with
  // it — bounded by the child's own line count). Units are units: the
  // number only speaks once the child is CLOSED (a counting child has
  // not spoken; a voided child never will). The cost gate is NOT
  // involved — this is the units law, not the shillings law.
  const recountedByRow = await db.stockTake.findFirst({
    where: {
      OR: [{ notes: { equals: `recount of sheet ${id}` } }, { notes: { startsWith: `recount of sheet ${id} ` } }],
    },
    orderBy: { startedAt: 'desc' },
    select: {
      id: true,
      status: true,
      closedAt: true,
      lines: { where: { variance: { not: null } }, select: { variance: true } },
    },
  });
  const recountedBy = recountedByRow
    ? {
        id: recountedByRow.id,
        status: recountedByRow.status,
        closedAt: recountedByRow.closedAt?.toISOString() ?? null,
        varianceUnits:
          recountedByRow.status === 'CLOSED'
            ? Math.round(recountedByRow.lines.reduce((acc, l) => acc + Number(l.variance ?? 0), 0) * 100) / 100
            : null,
      }
    : null;

  const counted = sheet.lines.filter((l) => l.countedQty != null);
  const varianceUnits = counted.reduce((acc, l) => acc + Number(l.variance ?? 0), 0);
  const varianceValueEstimate = counted.reduce(
    (acc, l) => acc + Number(l.variance ?? 0) * Number(l.product.costPrice ?? 0),
    0,
  );

  // v2.244.0 THE AISLE'S ECHO — the aisle's own cadence band rides the
  // drill: WHERE the door opened (v2.242.0) now says WHEN its aisle was
  // last heard. v2.246.0 THE AISLE'S TESTAMENT — the aisle's own window
  // verdict rides too: WHAT its latest window walk FOUND there
  // (lastWalkUnits, the categories wire's own law, read in the lib).
  // THE READ CLASS: bounded reads, only for an aisle-born sheet — the
  // stored law (two keyed rows) and the lib's single-aisle read (the
  // ONE latest CLOSED line touching the aisle for the band, then — in
  // the window only — the latest speaking line and one aggregate for
  // the testament). The fallback law: a read that fails returns null
  // and the face wears the name-only echo (the v2.242.0 face,
  // byte-identical) — never a guessed house, never a thrown request.
  let aisleBand: { band: CadenceBand; daysSince: number | null; lastWalkUnits: number | null } | null = null;
  if (sheet.walkCategoryId) {
    const law = await readCadenceLaw(db);
    aisleBand = await readCategoryBand(db, sheet.walkCategoryId, law, new Date());
  }

  // v2.247.0 THE WALK'S MIRROR — the sheet's OWN spoken units in its
  // aisle, beside the aisle's latest-window verdict (walkAisleUnits).
  // The lib's own testament law mirrored back at the sheet itself: ONE
  // bounded aggregate, indexed by the sheet's id, the same
  // product-category join + variance-not-null shape readCategoryBand
  // speaks. THE UNITS LAW: units are units — the cost gate is NOT
  // involved; a perfect count speaks 0 — the shelf held this walk;
  // nothing spoke (no counted lines on the aisle) → null, the honest
  // absence, never a hidden zero.
  let walkAisleSheetUnits: number | null = null;
  if (sheet.walkCategoryId) {
    const self = await db.stockTakeLine.aggregate({
      where: { stockTakeId: id, product: { categoryId: sheet.walkCategoryId }, variance: { not: null } },
      _sum: { variance: true },
    });
    walkAisleSheetUnits = self._sum.variance == null ? null : Math.round(Number(self._sum.variance) * 100) / 100;
  }

  return Response.json({
    success: true,
    data: {
      id: sheet.id,
      status: sheet.status,
      notes: sheet.notes,
      // v2.239.0 THE DRILL’S BIRTH CHIP — the sheet's own origin rides
      // the record face (additive + one column the row already holds;
      // zero new reads). The allowlist law means this is 'walk-door' or
      // nothing: a hand-raised sheet carries null, the face renders the
      // silence, and the census never grows a guess.
      origin: sheet.origin,
      // v2.242.0 THE AISLE'S ECHO — WHERE the door opened (the aisle's
      // own name, additive; null when the birth named no aisle).
      walkAisle: sheet.walkAisle?.name ?? null,
      // v2.244.0 THE AISLE'S ECHO — the aisle's own cadence band + the
      // days voice (additive + optional; null when the birth named no
      // aisle or the band read fell back — the face wears the silence,
      // never a guessed house). v2.246.0: the aisle's window verdict
      // rides too (walkAisleUnits — null when no window walk spoke,
      // beyond/never, or the testament read fell back; the honest
      // absence, never a hidden zero).
      walkAisleBand: aisleBand?.band ?? null,
      walkAisleDaysSince: aisleBand?.daysSince ?? null,
      walkAisleUnits: aisleBand?.lastWalkUnits ?? null,
      // v2.247.0 THE WALK'S MIRROR — the sheet's own aisle units ride
      // beside the aisle's latest (additive + optional): when the two
      // differ, the faces speak BOTH truths (this walk found X · the
      // aisle's latest found Y); when they agree, the single verdict
      // line keeps the floor's one voice. Null when not aisle-born or
      // nothing spoke — the honest absence, never a hidden zero.
      walkAisleSheetUnits,
      // v2.234.0 THE VERDICT — additive (the honest absence when no
      // child exists: null, never a hidden zero).
      recountedBy,
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
