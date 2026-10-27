// GET/POST /api/stock-takes
//
// v2.219.0 THE STOCKTAKE — the cycle count's wire (the biggest confirmed
// feature gap: no model, no API, no UI until this round). A sheet freezes
// the branch's system stock the moment it opens (snapshotQty per line),
// the floor counts against the snapshot, and the close speaks the
// variance into the ledger (see close/route.ts).
//
// GET  ?storeId=…   → the store's sheets, newest first (lean list: line
//                     counts + counted counts; the detail route carries
//                     the lines).
// POST {storeId, productIds?, notes?}
//                   → open a sheet. productIds defaults to EVERY active
//                     product of the store (a full-sheet count — the
//                     honest default for a cycle count). THE ONE-OPEN-
//                     SHEET LAW: a store with a COUNTING sheet refuses
//                     a second one (409, the open sheet's id in the
//                     body) — two live sheets on one floor would count
//                     against moving numbers.
//
// Auth: requireStoreAccess (store-scoped; org-wide roles pass the
// ?storeId, mirroring /api/products/low-stock).

import { type NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { systemLog, withErrorBoundary } from '@/lib/logger';
import { requireStoreAccess, type AuthSession } from '@/lib/auth';
import { LogSeverity, LogComponent } from '@/lib/types';
import { toDec } from '@/lib/utils/financialMath';

export const dynamic = 'force-dynamic';

async function listStockTakesHandler(request: NextRequest, _session: AuthSession): Promise<Response> {
  const storeId = new URL(request.url).searchParams.get('storeId');
  if (!storeId) {
    return Response.json({ success: false, error: 'storeId is required.' }, { status: 400 });
  }

  const sheets = await db.stockTake.findMany({
    where: { storeId },
    orderBy: { startedAt: 'desc' },
    take: 20,
    include: { _count: { select: { lines: true } } },
  });

  // Counted counts per sheet — ONE grouped read, reduced in JS.
  const sheetIds = sheets.map((s) => s.id);
  const countedGroups = sheetIds.length
    ? await db.stockTakeLine.groupBy({
        by: ['stockTakeId'],
        where: { stockTakeId: { in: sheetIds }, countedQty: { not: null } },
        _count: { _all: true },
      })
    : [];
  const countedBySheet = new Map(countedGroups.map((g) => [g.stockTakeId, g._count._all]));

  const rows = sheets.map((s) => ({
    id: s.id,
    status: s.status,
    notes: s.notes,
    startedAt: s.startedAt,
    closedAt: s.closedAt,
    lineCount: s._count.lines,
    countedCount: countedBySheet.get(s.id) ?? 0,
  }));

  return Response.json({ success: true, data: rows });
}

async function createStockTakeHandler(request: NextRequest, session: AuthSession): Promise<Response> {
  const body = await request.json().catch(() => null);
  const storeId = typeof body?.storeId === 'string' ? body.storeId : '';
  if (!storeId) {
    return Response.json({ success: false, error: 'storeId is required.' }, { status: 400 });
  }
  const notes = typeof body?.notes === 'string' && body.notes.trim() ? body.notes.trim().slice(0, 500) : null;
  const productIds = Array.isArray(body?.productIds)
    ? body.productIds.filter((v: unknown): v is string => typeof v === 'string' && v.length > 0)
    : null;

  // THE ONE-OPEN-SHEET LAW: a COUNTING sheet on this store refuses a
  // second (the floor can only count against one frozen snapshot).
  const openSheet = await db.stockTake.findFirst({
    where: { storeId, status: 'COUNTING' },
    select: { id: true, startedAt: true },
  });
  if (openSheet) {
    return Response.json(
      {
        success: false,
        error: 'this branch already has a count sheet open — close or cancel it before opening another.',
        data: { id: openSheet.id, startedAt: openSheet.startedAt },
      },
      { status: 409 },
    );
  }

  // The sheet's population: the caller's explicit list (validated against
  // THIS store's active products) or every active product (the full sheet).
  const population = await db.product.findMany({
    where: { storeId, isActive: true, ...(productIds ? { id: { in: productIds } } : {}) },
    select: { id: true },
  });
  if (population.length === 0) {
    return Response.json(
      { success: false, error: 'no active products matched this sheet\u2019s population — nothing to count.' },
      { status: 400 },
    );
  }

  // The snapshot is taken INSIDE the transaction (one coherent moment —
  // a sheet whose lines read different moments would count against a
  // moving number).
  const sheet = await db.$transaction(async (tx) => {
    const created = await tx.stockTake.create({
      data: { storeId, status: 'COUNTING', notes, startedById: session.userId },
    });
    const products = await tx.product.findMany({
      where: { storeId, isActive: true, id: { in: population.map((p) => p.id) } },
      select: { id: true, quantityInStock: true },
    });
    await tx.stockTakeLine.createMany({
      data: products.map((p) => ({
        stockTakeId: created.id,
        productId: p.id,
        snapshotQty: toDec(p.quantityInStock),
      })),
    });
    return created;
  });

  systemLog(LogSeverity.INFO, LogComponent.INVENTORY, `stock take opened: ${population.length} lines (sheet ${sheet.id})`, { storeId });

  return Response.json(
    {
      success: true,
      data: { id: sheet.id, status: sheet.status, lineCount: population.length, startedAt: sheet.startedAt },
    },
    { status: 201 },
  );
}

export const GET = withErrorBoundary(requireStoreAccess(listStockTakesHandler), 'STOCK_TAKES_LIST');
export const POST = withErrorBoundary(requireStoreAccess(createStockTakeHandler), 'STOCK_TAKES_CREATE');
