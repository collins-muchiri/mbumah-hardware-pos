// POST /api/stock-takes/[id]/count
//
// The floor speaks: {lineId, countedQty} sets the line's count and its
// variance (counted − snapshot) against the FROZEN snapshot. A line is
// re-countable until the sheet closes — the latest count is the truth,
// the earlier ones were practice. Zero is a count (an empty shelf is a
// finding, not an absence).

import { type NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { withErrorBoundary } from '@/lib/logger';
import { requireStoreAccess, type AuthSession } from '@/lib/auth';
import { toDec } from '@/lib/utils/financialMath';

export const dynamic = 'force-dynamic';

interface RouteContext {
  params: Promise<{ id: string }>;
}

async function countLineHandler(request: NextRequest, _session: AuthSession, context: RouteContext): Promise<Response> {
  const { id } = await context.params;
  const body = await request.json().catch(() => null);
  const lineId = typeof body?.lineId === 'string' ? body.lineId : '';
  const rawQty = body?.countedQty;
  if (!lineId) {
    return Response.json({ success: false, error: 'lineId is required.' }, { status: 400 });
  }
  // Zero is a count; negative is a lie; non-finite is a typo.
  if (typeof rawQty !== 'number' || !Number.isFinite(rawQty) || rawQty < 0) {
    return Response.json({ success: false, error: 'countedQty must be a finite number ≥ 0.' }, { status: 400 });
  }
  const countedQty = toDec(Math.round(rawQty * 100) / 100);

  const sheet = await db.stockTake.findUnique({ where: { id }, select: { id: true, status: true } });
  if (!sheet) {
    return Response.json({ success: false, error: 'count sheet not found.' }, { status: 404 });
  }
  if (sheet.status !== 'COUNTING') {
    return Response.json(
      { success: false, error: `this sheet is ${sheet.status} — counts land only while COUNTING.` },
      { status: 409 },
    );
  }

  const line = await db.stockTakeLine.findFirst({
    where: { id: lineId, stockTakeId: id },
    select: { id: true, snapshotQty: true },
  });
  if (!line) {
    return Response.json({ success: false, error: 'count line not found on this sheet.' }, { status: 404 });
  }

  const variance = countedQty.minus(line.snapshotQty);
  const updated = await db.stockTakeLine.update({
    where: { id: line.id },
    data: { countedQty, variance },
    select: { id: true, countedQty: true, variance: true, snapshotQty: true },
  });

  return Response.json({
    success: true,
    data: {
      id: updated.id,
      countedQty: Number(updated.countedQty),
      variance: Number(updated.variance),
      snapshotQty: Number(updated.snapshotQty),
    },
  });
}

export const POST = withErrorBoundary(requireStoreAccess(countLineHandler), 'STOCK_TAKE_COUNT');
