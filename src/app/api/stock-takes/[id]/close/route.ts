// POST /api/stock-takes/[id]/close
//
// The ledger hears the floor. THE CLOSE LAWS:
//   • a sheet closes only with EVERY line counted (409 names the holes —
//     a count sheet that closes with uncounted lines is a lie);
//   • the adjustment applies the count DELTA (counted − snapshot) against
//     the CURRENT book stock — sales during the count are preserved;
//   • every line whose variance ≠ 0 writes ONE ADJUSTMENT StockMovement
//     (the same movementType the manual adjustment flow speaks) with the
//     session's actor — never the request body's;
//   • varianceCost = variance × the product's cost price ON THE CLOSE
//     DAY, stored per line — the ledger's own KES voice, never indicative;
//   • the sheet claims COUNTING→CLOSED atomically INSIDE the transaction
//     (a double-click close cannot double-apply the adjustments — the
//     claim runs first, zero rows claimed → the already-closed truth);
//   • the response speaks the server's own numbers — the UI's success
//     face reads THIS, never its own estimate.

import { type NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { systemLog, withErrorBoundary } from '@/lib/logger';
import { requireStoreAccess, type AuthSession } from '@/lib/auth';
import { LogSeverity, LogComponent } from '@/lib/types';
import { toDec, round2 } from '@/lib/utils/financialMath';

export const dynamic = 'force-dynamic';

interface RouteContext {
  params: Promise<{ id: string }>;
}

async function closeStockTakeHandler(_request: NextRequest, session: AuthSession, context: RouteContext): Promise<Response> {
  const { id } = await context.params;

  const sheet = await db.stockTake.findUnique({ where: { id }, select: { id: true, storeId: true, status: true } });
  if (!sheet) {
    return Response.json({ success: false, error: 'count sheet not found.' }, { status: 404 });
  }

  // The hole check BEFORE any write (counts only ADD, so the pre-check
  // is honest: a sheet with holes now would still have them at the
  // claim — and the atomic claim below stays the race-proof backstop
  // for double closes). The refusal names the holes.
  const uncounted = await db.stockTakeLine.count({ where: { stockTakeId: id, countedQty: null } });
  if (sheet.status === 'COUNTING' && uncounted > 0) {
    return Response.json(
      { success: false, error: `${uncounted} line(s) still uncounted — the close refuses a sheet with holes.` },
      { status: 409 },
    );
  }

  const result = await db.$transaction(async (tx) => {
    // THE ATOMIC CLAIM: COUNTING → CLOSED. A second close (double-click,
    // racing tab) claims zero rows and reports the already-closed truth.
    const claimed = await tx.stockTake.updateMany({
      where: { id, status: 'COUNTING' },
      data: { status: 'CLOSED', closedAt: new Date(), closedById: session.userId },
    });
    if (claimed.count === 0) {
      return null;
    }

    const lines = await tx.stockTakeLine.findMany({
      where: { stockTakeId: id },
      include: { product: { select: { id: true, costPrice: true } } },
    });

    let appliedCount = 0;
    let varianceUnits = 0;
    let varianceCostTotal = 0;

    for (const line of lines) {
      const variance = toDec(line.countedQty).minus(toDec(line.snapshotQty));
      const varianceNum = variance.toNumber();
      if (varianceNum === 0) {
        // An exact count re-anchors nothing — the line's varianceCost
        // stays null (the honest zero is the absence of an adjustment).
        continue;
      }
      const varianceCost = round2(varianceNum * Number(line.product.costPrice ?? 0));

      // The DELTA against current book stock (sales during the count
      // are preserved — the floor's count already netted them).
      await tx.product.update({
        where: { id: line.productId },
        data: { quantityInStock: { increment: varianceNum } },
      });
      await tx.stockMovement.create({
        data: {
          storeId: sheet.storeId,
          productId: line.productId,
          movementType: 'ADJUSTMENT',
          quantity: variance,
          referenceId: id,
          notes: `Stock take close: counted ${Number(line.countedQty)} vs snapshot ${Number(line.snapshotQty)}`,
          performedBy: session.userId,
        },
      });
      await tx.stockTakeLine.update({
        where: { id: line.id },
        data: { varianceCost: toDec(varianceCost) },
      });
      appliedCount += 1;
      varianceUnits += varianceNum;
      varianceCostTotal += varianceCost;
    }

    return {
      appliedCount,
      varianceUnits: Math.round(varianceUnits * 100) / 100,
      varianceCostTotal: round2(varianceCostTotal),
      lineCount: lines.length,
    };
  });

  if (!result) {
    const existing = await db.stockTake.findUnique({ where: { id }, select: { status: true } });
    return Response.json(
      { success: false, error: `this sheet is ${existing?.status ?? 'UNKNOWN'} — only a COUNTING sheet closes.` },
      { status: 409 },
    );
  }

  systemLog(LogSeverity.INFO, LogComponent.INVENTORY, `stock take closed: ${result.appliedCount} adjustment(s), variance ${result.varianceUnits} units`, { referenceId: id });

  return Response.json({
    success: true,
    data: {
      id,
      status: 'CLOSED',
      lineCount: result.lineCount,
      appliedCount: result.appliedCount,
      varianceUnits: result.varianceUnits,
      varianceCostTotal: result.varianceCostTotal,
    },
  });
}

export const POST = withErrorBoundary(requireStoreAccess(closeStockTakeHandler), 'STOCK_TAKE_CLOSE');
