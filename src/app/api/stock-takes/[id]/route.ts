// GET /api/stock-takes/[id]
//
// The sheet's detail face: the header + every line (product name/sku/unit
// joined) + the sheet's own summary. THE COST LAW: variance VALUE speaks
// only to roles holding `inventory.view.cost` (the same gate the products
// API applies to costPrice) — a CASHIER counts units; the shillings stay
// off the wire for eyes without the permission. The estimate is labeled
// at BOOK cost (the close re-prices at the cost on the day it closes).

import { type NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { withErrorBoundary } from '@/lib/logger';
import { requireStoreAccess, type AuthSession } from '@/lib/auth';
import { hasFeaturePermission } from '@/lib/permissions';

export const dynamic = 'force-dynamic';

interface RouteContext {
  params: Promise<{ id: string }>;
}

async function getStockTakeHandler(_request: NextRequest, session: AuthSession, context: RouteContext): Promise<Response> {
  const { id } = await context.params;

  const sheet = await db.stockTake.findUnique({
    where: { id },
    include: {
      lines: {
        orderBy: [{ countedQty: { sort: 'asc', nulls: 'first' } }, { product: { name: 'asc' } }],
        select: {
          id: true,
          productId: true,
          snapshotQty: true,
          countedQty: true,
          variance: true,
          varianceCost: true,
          product: { select: { name: true, sku: true, unitType: true, costPrice: true } },
        },
      },
      startedBy: { select: { name: true } },
      closedBy: { select: { name: true } },
      // v2.229.0 THE BRANCH WALK: the paper names its branch. The sheet's
      // own store rides the detail wire (id/name/code — the drill's org
      // wire speaks the same shape), so the branch face's print act lays
      // a sheet on the page that says WHICH yard walked it. Additive:
      // zero new fetch, the response grows one block.
      store: { select: { id: true, name: true, code: true } },
    },
  });
  if (!sheet) {
    return Response.json({ success: false, error: 'count sheet not found.' }, { status: 404 });
  }

  const canViewCost = hasFeaturePermission(session.role, 'inventory.view.cost');

  const counted = sheet.lines.filter((l) => l.countedQty != null);
  const varianceUnits = counted.reduce((acc, l) => acc + Number(l.variance ?? 0), 0);
  // The open-sheet estimate rides the BOOK cost joined here; the close
  // stores varianceCost at the cost on the day it closes (server truth).
  const varianceValueEstimate = counted.reduce(
    (acc, l) => acc + Number(l.variance ?? 0) * Number(l.product.costPrice ?? 0),
    0,
  );

  return Response.json({
    success: true,
    data: {
      id: sheet.id,
      storeId: sheet.storeId,
      // v2.229.0: the branch's own name on the wire — the paper reads the
      // wire's truth (the drill's law: data.store.code ?? data.store.name),
      // never a client-side guess.
      store: { id: sheet.store.id, name: sheet.store.name, code: sheet.store.code },
      status: sheet.status,
      notes: sheet.notes,
      startedAt: sheet.startedAt,
      closedAt: sheet.closedAt,
      startedByName: sheet.startedBy?.name ?? null,
      closedByName: sheet.closedBy?.name ?? null,
      summary: {
        totalLines: sheet.lines.length,
        countedLines: counted.length,
        uncountedLines: sheet.lines.length - counted.length,
        // Units are units — every role hears the floor's arithmetic.
        varianceUnits: Math.round(varianceUnits * 100) / 100,
        // The shillings speak only past the cost gate (null otherwise —
        // the UI renders the honest absence, never a hidden zero).
        varianceValueEstimate: canViewCost ? Math.round(varianceValueEstimate * 100) / 100 : null,
      },
      lines: sheet.lines.map((l) => ({
        id: l.id,
        productId: l.productId,
        name: l.product.name,
        sku: l.product.sku,
        unitType: l.product.unitType,
        snapshotQty: Number(l.snapshotQty),
        countedQty: l.countedQty != null ? Number(l.countedQty) : null,
        variance: l.variance != null ? Number(l.variance) : null,
        // Post-close truth (only on CLOSED sheets; still past the gate).
        varianceCost: canViewCost && l.varianceCost != null ? Number(l.varianceCost) : null,
        bookCost: canViewCost ? Number(l.product.costPrice ?? 0) : null,
      })),
    },
  });
}

export const GET = withErrorBoundary(requireStoreAccess(getStockTakeHandler), 'STOCK_TAKE_DETAIL');
