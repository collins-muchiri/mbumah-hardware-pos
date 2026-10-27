// POST /api/stock-takes/[id]/cancel
//
// v2.220.0 THE VARIANCE MAP — the sheet's honest way out. A count that
// was abandoned (the floor closed early, the sheet was opened by mistake,
// the category scope was wrong) must be able to DIE honestly: the books
// never hear it.
//
// THE CANCEL LAWS:
//   • only a COUNTING sheet cancels — CLOSED sheets already spoke into
//     the ledger (un-closing them would need reversing entries, not a
//     status flip), CANCELLED sheets are already void (409 names it);
//   • the claim COUNTING→CANCELLED is ATOMIC inside the transaction (the
//     same double-click law the close speaks — a racing pair of cancels
//     claims once, the loser reports the truth);
//   • NO stock moves, NO movements, NO adjustments — a cancelled sheet is
//     a void, and the schema's own status comment (COUNTING | CLOSED |
//     CANCELLED) is the contract;
//   • the optional reason (≤300 chars) is appended to the sheet's notes
//     — the sheet's own face carries WHY it died, so the roster's memory
//     is honest without a schema change;
//   • the closer-of-record is the canceller (closedById/closedAt fill —
//     the sheet's life ended, and the face names who ended it).
//
// v2.223.0: the void joins the TAMPER-EVIDENT chain — a best-effort
// auditTrail.log('VOID' / STOCK_TAKE) records who ended the sheet, the
// zero law in the event's own body, the reason verbatim (ISO 27001
// A.12.4 wants the event log to speak the exception; now it does).

import { type NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { systemLog, withErrorBoundary } from '@/lib/logger';
import { requireStoreAccess, type AuthSession } from '@/lib/auth';
import { LogSeverity, LogComponent } from '@/lib/types';

export const dynamic = 'force-dynamic';

interface RouteContext {
  params: Promise<{ id: string }>;
}

async function cancelStockTakeHandler(request: NextRequest, session: AuthSession, context: RouteContext): Promise<Response> {
  const { id } = await context.params;
  const body = await request.json().catch(() => null);
  const reason = typeof body?.reason === 'string' && body.reason.trim()
    ? body.reason.trim().slice(0, 300)
    : null;

  const sheet = await db.stockTake.findUnique({ where: { id }, select: { id: true, status: true, notes: true, storeId: true } });
  if (!sheet) {
    return Response.json({ success: false, error: 'count sheet not found.' }, { status: 404 });
  }
  if (sheet.status !== 'COUNTING') {
    return Response.json(
      { success: false, error: `this sheet is ${sheet.status} — only a COUNTING sheet cancels.` },
      { status: 409 },
    );
  }

  // The honest note: the reason rides the sheet's own notes (≤500 total —
  // the same column the create flow writes, one memory, no schema change).
  const appendedNotes = reason
    ? [sheet.notes?.trim() || null, `cancelled: ${reason}`].filter(Boolean).join(' · ').slice(0, 500)
    : sheet.notes;

  // THE ATOMIC CLAIM: COUNTING → CANCELLED. A second cancel (double-click,
  // racing tab) claims zero rows and reports the already-dead truth.
  const claimed = await db.$transaction(async (tx) =>
    tx.stockTake.updateMany({
      where: { id, status: 'COUNTING' },
      data: { status: 'CANCELLED', closedAt: new Date(), closedById: session.userId, ...(appendedNotes !== sheet.notes ? { notes: appendedNotes } : {}) },
    }),
  );
  if (claimed.count === 0) {
    const existing = await db.stockTake.findUnique({ where: { id }, select: { status: true } });
    return Response.json(
      { success: false, error: `this sheet is ${existing?.status ?? 'UNKNOWN'} — only a COUNTING sheet cancels.` },
      { status: 409 },
    );
  }

  // The zero law of the cancel: no stock moved, no movements written —
  // the log line says exactly that, so the audit trail carries the void
  // without pretending it touched the books.
  systemLog(LogSeverity.INFO, LogComponent.INVENTORY, `stock take cancelled (no stock moved): ${reason ?? 'no reason given'} (sheet ${id})`, { referenceId: id });

  // v2.223.0: the tamper-evident chain NAMES the void. The systemLog
  // line above is the ops face; the audit trail is the compliance face
  // (ISO 27001 A.12.4) — a chained-HMAC row recording WHO voided WHICH
  // sheet, with the zero law spoken in the event's own body
  // (stockMoved: 0, movements: 0) and the canceller's reason kept
  // verbatim. Best-effort by law: the sheet is already dead and the
  // books already silent — a chain hiccup must never resurrect either
  // (the same pattern the shift closeout speaks).
  try {
    const { auditTrail } = await import('@/lib/audit-trail');
    await auditTrail.log({
      action: 'VOID',
      resourceType: 'STOCK_TAKE',
      resourceId: id,
      actorId: session.userId,
      actorRole: session.role,
      storeId: sheet.storeId,
      oldValues: { status: 'COUNTING' },
      newValues: { status: 'CANCELLED', stockMoved: 0, movements: 0 },
      reason: reason ?? 'no reason given',
    });
  } catch {
    /* the chain must never block the void */
  }

  return Response.json({
    success: true,
    data: { id, status: 'CANCELLED', reasonStored: Boolean(reason) },
  });
}

export const POST = withErrorBoundary(requireStoreAccess(cancelStockTakeHandler), 'STOCK_TAKE_CANCEL');
