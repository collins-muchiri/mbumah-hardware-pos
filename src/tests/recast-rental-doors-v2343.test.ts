import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'path';
import { describe, it, expect } from 'vitest';

// ---------------------------------------------------------------------------
// v2.343.0 — THE RE-CAST CLASS ENDS (the re-cast singles + the rental
// family, the bare class's fourth pass).
//
// FOURTEEN reads speak their bodies' own shapes:
//   • the ELEVEN de-facto re-casts (the `= body as { ... }` blocks the
//     v2.339 census regex never caught) dissolve into the generic —
//     stock-movements, kra/submit, purchase-orders,
//     transactions/[id]/distribute-receipt, notifications/email,
//     reports/export, etims/cancel-invoice, suppliers/[id]/send-order and
//     the conversations trio — and THE DE-FACTO RE-CAST CLASS ENDS (this
//     file's tombstone census: zero `} = body as {` matches in
//     src/app/api);
//   • the HONEST-SWALLOW READS graduate: kra/submit, notifications/email,
//     etims/cancel-invoice and the conversations trio ride the door and
//     keep BOTH voices (the door's rejection for an unreadable body, the
//     route's own 400 for a well-formed body without its required field);
//   • the rental family joins — rentals, rentals/[id]/return, cash-drawer:
//     the money columns ride number | string where the route's own
//     toDec(Numeric) chain owns the widening (the debt precedent), and
//     cash-drawer's amount rides the both-absences widening its own
//     `=== undefined || === null` guard demands (the maxPoints precedent,
//     widened);
//   • the receipt-distribution twins (distribute-receipt, reports/export)
//     ride the REQUIRED channel union whose presence + membership guard
//     IS the validator;
//   • purchase-orders' items ride the element shape the route validates,
//     and the create data rides the VALIDATED numbers (the F1-5 loop's
//     own Number() output), not the raw wire bytes.
//
// The styling face is the RENTAL-DAY METER: the rentals desk's timeline
// was already drawing the honest walk — it just never SPOKE. The track
// now carries the meter semantics while the hire term is running.
//
// The bare class falls 16 → 8 (eight of the fourteen were bare doors; the
// other six graduate from raw honest-swallow reads instead).
// THE OD LAW: every pin reads SOURCE bytes.
// ---------------------------------------------------------------------------

const read = (p: string) => readFileSync(p, 'utf8');

function walkApi(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) out.push(...walkApi(full));
    else if (name.endsWith('.ts')) out.push(full);
  }
  return out;
}

const API_FILES = walkApi('src/app/api');
const BARE = API_FILES.filter((f) => /readJsonBody\(request\)/.test(read(f)));

const FAMILY_DOORS = [
  'src/app/api/stock-movements/route.ts',
  'src/app/api/kra/submit/route.ts',
  'src/app/api/purchase-orders/route.ts',
  'src/app/api/transactions/[id]/distribute-receipt/route.ts',
  'src/app/api/rentals/route.ts',
  'src/app/api/rentals/[id]/return/route.ts',
  'src/app/api/cash-drawer/route.ts',
  'src/app/api/reports/export/route.ts',
  'src/app/api/suppliers/[id]/send-order/route.ts',
  'src/app/api/notifications/email/route.ts',
  'src/app/api/etims/cancel-invoice/route.ts',
  'src/app/api/messages/conversations/route.ts',
  'src/app/api/messages/conversations/[id]/route.ts',
  'src/app/api/messages/conversations/[id]/messages/route.ts',
];

describe('THE BARE CLASS FALLS 16 → 8 (v2.343.0)', () => {
  it('exactly 8 bare doors remain', () => {
    expect(BARE.length).toBe(8);
  });

  it('the fourteen doors left the census (the eight bare ones) and the re-cast rolls', () => {
    for (const door of FAMILY_DOORS) {
      expect(BARE.includes(door)).toBe(false);
    }
  });

  it('the loose-Record era stays over (no regressions)', () => {
    expect(API_FILES.some((f) => read(f).includes('readJsonBody<Record<string, unknown>>'))).toBe(false);
  });

  it('the re-cast class stays gone', () => {
    expect(API_FILES.some((f) => /door\.body as [A-Z]/.test(read(f)))).toBe(false);
  });

  it('THE DE-FACTO RE-CAST TOMBSTONE: not one door destructures through a cast any more', () => {
    expect(API_FILES.some((f) => /} = body as \{/.test(read(f)))).toBe(false);
  });

  it('the law doc records the fall (history keeps the 16, the 20 and the 25)', () => {
    const home = read('src/lib/request-body.ts');
    expect(home.includes("v2.343.0 — THE RE-CAST CLASS ENDS")).toBe(true);
    expect(home.includes('falls to 8 doors')).toBe(true);
    // the v2.342.0, v2.341.0 and v2.340.0 history notes keep their own counts
    // (release history never rewrites)
    expect(home.includes('falls to 16 doors')).toBe(true);
    expect(home.includes('falls to 20 doors')).toBe(true);
    expect(home.includes('falls to 25 doors')).toBe(true);
    expect(home.includes('HONEST-SWALLOW')).toBe(true);
    expect(home.includes('answering-chain cousin')).toBe(true);
  });
});

describe('THE FOURTEEN DOORS SPEAK THEIR OWN SHAPES', () => {
  it('stock-movements: productId REQUIRED, the figures ride the unknown their parseFloat(String()) chains own', () => {
    const src = read('src/app/api/stock-movements/route.ts');
    expect(src.includes('productId: string;')).toBe(true);
    expect(src.includes('type?: string;')).toBe(true);
    expect(src.includes('adjustmentType?: string;')).toBe(true);
    expect(src.includes('quantity?: unknown;')).toBe(true);
    expect(src.includes('unitCost?: unknown;')).toBe(true);
    expect(src.includes('category?: string;')).toBe(true);
    expect(/readJsonBody\(request\)/.test(src)).toBe(false);
    expect(src.includes('} = body as {')).toBe(false);
    expect(src.includes('productId is required.')).toBe(true);
  });

  it('kra/submit: the honest-swallow exemplar graduates to the door and keeps BOTH voices', () => {
    const src = read('src/app/api/kra/submit/route.ts');
    expect(src.includes("from '@/lib/request-body'")).toBe(true);
    expect(src.includes('transactionId: string;')).toBe(true);
    expect(src.includes('dryRun?: boolean;')).toBe(true);
    expect(src.includes('storeId?: string;')).toBe(true);
    expect(/readJsonBody\(request\)/.test(src)).toBe(false);
    expect(src.includes('} = body as {')).toBe(false);
    expect(src.includes("request.json().catch(() => null)")).toBe(false);
    expect(src.includes('transactionId is required.')).toBe(true);
    expect(src.includes('body.storeId as string')).toBe(false);
  });

  it('purchase-orders: the pair REQUIRED, the items ride the element shape the route validates', () => {
    const src = read('src/app/api/purchase-orders/route.ts');
    expect(src.includes('storeId: string;')).toBe(true);
    expect(src.includes('supplierId: string;')).toBe(true);
    expect(src.includes('items: Array<{ productId: string; quantity: unknown; unitCost: unknown; notes?: string }>;')).toBe(true);
    expect(src.includes('originStockTakeId?: string;')).toBe(true);
    expect(/readJsonBody\(request\)/.test(src)).toBe(false);
    expect(src.includes('} = body as {')).toBe(false);
    expect(src.includes('At least one item is required.')).toBe(true);
  });

  it('distribute-receipt: channel rides the REQUIRED union (the presence + membership guard IS the validator)', () => {
    const src = read('src/app/api/transactions/[id]/distribute-receipt/route.ts');
    expect(src.includes('channel: "EMAIL" | "WHATSAPP" | "SMS";')).toBe(true);
    expect(src.includes('storeId?: string;')).toBe(true);
    expect(src.includes('email?: string;')).toBe(true);
    expect(src.includes('phone?: string;')).toBe(true);
    expect(src.includes('customMessage?: string;')).toBe(true);
    expect(/readJsonBody\(request\)/.test(src)).toBe(false);
    expect(src.includes('} = body as {')).toBe(false);
    expect(src.includes("channel must be 'EMAIL', 'WHATSAPP' or 'SMS'.")).toBe(true);
  });

  it('rentals: the trio + expectedReturnDate REQUIRED, the money columns ride the toDec widening', () => {
    const src = read('src/app/api/rentals/route.ts');
    expect(src.includes('storeId: string;')).toBe(true);
    expect(src.includes('productId: string;')).toBe(true);
    expect(src.includes('customerId: string;')).toBe(true);
    expect(src.includes('expectedReturnDate: string;')).toBe(true);
    expect(src.includes('ratePerDay: number | string;')).toBe(true);
    expect(src.includes('securityDeposit?: number | string;')).toBe(true);
    expect(src.includes('ratePerWeek?: number | string;')).toBe(true);
    expect(src.includes('ratePerMonth?: number | string;')).toBe(true);
    expect(src.includes('notes?: string;')).toBe(true);
    expect(/readJsonBody\(request\)/.test(src)).toBe(false);
    expect(src.includes('ratePerDay are required.')).toBe(true);
  });

  it('rentals/[id]/return: the assessment rides optional, the charge rides the toDec widening, processedBy rides the unknown it is', () => {
    const src = read('src/app/api/rentals/[id]/return/route.ts');
    expect(src.includes('damageAssessment?: string;')).toBe(true);
    expect(src.includes('damageCharge?: number | string;')).toBe(true);
    expect(src.includes('notes?: string;')).toBe(true);
    expect(src.includes('processedBy?: unknown;')).toBe(true);
    expect(/readJsonBody\(request\)/.test(src)).toBe(false);
    expect(src.includes('Rental not found.')).toBe(true);
  });

  it('cash-drawer: the trio REQUIRED, amount rides the both-absences widening its own guard demands', () => {
    const src = read('src/app/api/cash-drawer/route.ts');
    expect(src.includes('storeId: string;')).toBe(true);
    expect(src.includes('userId: string;')).toBe(true);
    expect(src.includes('eventType: string;')).toBe(true);
    expect(src.includes('amount?: number | string | null;')).toBe(true);
    expect(src.includes('notes?: string;')).toBe(true);
    expect(/readJsonBody\(request\)/.test(src)).toBe(false);
    expect(src.includes('amount === undefined || amount === null')).toBe(true);
    expect(src.includes('Amount must be a non-negative number.')).toBe(true);
  });

  it('reports/export: the receipt-distribution twin — the pair rides REQUIRED, the re-cast dissolves', () => {
    const src = read('src/app/api/reports/export/route.ts');
    expect(src.includes('transactionId: string;')).toBe(true);
    expect(src.includes("channel: 'EMAIL' | 'WHATSAPP' | 'SMS';")).toBe(true);
    expect(src.includes('storeId?: string;')).toBe(true);
    expect(src.includes('customMessage?: string;')).toBe(true);
    expect(/readJsonBody\(request\)/.test(src)).toBe(false);
    expect(src.includes('} = body as {')).toBe(false);
    expect(src.includes('transactionId is required.')).toBe(true);
  });

  it('suppliers/[id]/send-order: the PO reference and message ride optionals, channel rides the resolution', () => {
    const src = read('src/app/api/suppliers/[id]/send-order/route.ts');
    expect(src.includes('purchaseOrderId?: string;')).toBe(true);
    expect(src.includes('message?: string;')).toBe(true);
    expect(src.includes("channel?: 'WHATSAPP' | 'EMAIL';")).toBe(true);
    expect(/readJsonBody\(request\)/.test(src)).toBe(false);
    expect(src.includes('} = body as {')).toBe(false);
  });

  it('notifications/email: the honest-swallow graduates — the trio rides REQUIRED under its own guards', () => {
    const src = read('src/app/api/notifications/email/route.ts');
    expect(src.includes("from '@/lib/request-body'")).toBe(true);
    expect(src.includes('type: string;')).toBe(true);
    expect(src.includes('recipient: string;')).toBe(true);
    expect(src.includes('data: Record<string, unknown>;')).toBe(true);
    expect(/readJsonBody\(request\)/.test(src)).toBe(false);
    expect(src.includes('} = body as {')).toBe(false);
    expect(src.includes('await request.json()')).toBe(false);
    expect(src.includes('A valid "recipient" email address is required.')).toBe(true);
  });

  it('etims/cancel-invoice: the honest-swallow graduates — the pair REQUIRED, BOTH storeId casts dissolve', () => {
    const src = read('src/app/api/etims/cancel-invoice/route.ts');
    expect(src.includes("from '@/lib/request-body'")).toBe(true);
    expect(src.includes('invoiceNumber: string;')).toBe(true);
    expect(src.includes('reason: string;')).toBe(true);
    expect(src.includes('storeId?: string;')).toBe(true);
    expect(/readJsonBody\(request\)/.test(src)).toBe(false);
    expect(src.includes('} = body as {')).toBe(false);
    expect(src.includes('body.storeId as string')).toBe(false);
    expect(src.includes('invoiceNumber and reason are required.')).toBe(true);
  });

  it('messages/conversations: the honest-swallow graduates — the destructure defaults stay the runtime truth', () => {
    const src = read('src/app/api/messages/conversations/route.ts');
    expect(src.includes("from '@/lib/request-body'")).toBe(true);
    expect(src.includes('storeId?: string;')).toBe(true);
    expect(src.includes('participantIds?: string[];')).toBe(true);
    expect(/readJsonBody\(request\)/.test(src)).toBe(false);
    expect(src.includes('} = body as {')).toBe(false);
    expect(src.includes("type = 'INTERNAL'")).toBe(true);
    expect(src.includes('participantIds = []')).toBe(true);
  });

  it('messages/conversations/[id]: the honest-swallow graduates — the participant columns ride the guarded arrays', () => {
    const src = read('src/app/api/messages/conversations/[id]/route.ts');
    expect(src.includes("from '@/lib/request-body'")).toBe(true);
    expect(src.includes('addParticipantIds?: string[];')).toBe(true);
    expect(src.includes('removeParticipantIds?: string[];')).toBe(true);
    expect(/readJsonBody\(request\)/.test(src)).toBe(false);
    expect(src.includes('} = body as {')).toBe(false);
  });

  it('messages/conversations/[id]/messages: content rides REQUIRED under the trim guard, the default stays', () => {
    const src = read('src/app/api/messages/conversations/[id]/messages/route.ts');
    expect(src.includes("from '@/lib/request-body'")).toBe(true);
    expect(src.includes('content: string;')).toBe(true);
    expect(src.includes('messageType?: string;')).toBe(true);
    expect(src.includes('attachmentUrl?: string;')).toBe(true);
    expect(/readJsonBody\(request\)/.test(src)).toBe(false);
    expect(src.includes('} = body as {')).toBe(false);
    expect(src.includes("messageType = 'TEXT'")).toBe(true);
    expect(src.includes('content is required.')).toBe(true);
  });
});

describe('THE VALIDATED FIGURES REACH THE COLUMNS (the answering-chain cousin)', () => {
  it('purchase-orders: the create data rides the F1-5 loop\u2019s own Number() output, not the raw wire bytes', () => {
    const src = read('src/app/api/purchase-orders/route.ts');
    expect(src.includes('const qty = Number(item.quantity);')).toBe(true);
    expect(src.includes('const cost = Number(item.unitCost);')).toBe(true);
    expect(src.includes('const totalCost = round2(toDec(qty).mul(toDec(cost)));')).toBe(true);
    expect(src.includes('quantity: qty,')).toBe(true);
    expect(src.includes('unitCost: cost,')).toBe(true);
    expect(src.includes('for (const item of items as Array<')).toBe(false);
  });
});

describe('THE STYLING FACE — the rental-day meter (the ninth desk)', () => {
  const desk = () => read('src/app/(shell)/tabs/rentals-tab.tsx');

  it('the timeline\u2019s walk now speaks (the honest aria voice)', () => {
    const src = desk();
    expect(src.includes("'rental-day-meter'")).toBe(true);
    expect(src.includes("role: 'progressbar'")).toBe(true);
    expect(src.includes("'aria-label': meterVoice")).toBe(true);
    expect(src.includes("'aria-valuemin': 0")).toBe(true);
    expect(src.includes("'aria-valuemax': 100")).toBe(true);
    expect(src.includes("'aria-valuenow': elapsedPct")).toBe(true);
    expect(src.includes('title: meterVoice')).toBe(true);
  });

  it('the meter voice speaks the exact day figures against the term', () => {
    const src = desk();
    expect(src.includes('`Rental day ${dayOfTerm} of ${daysInTerm} (${elapsedPct}%) — ${daysOverdue}d overdue`')).toBe(true);
    expect(src.includes('`Rental day ${dayOfTerm} of ${daysInTerm} (${elapsedPct}%) — ${daysRemaining}d remaining`')).toBe(true);
  });

  it('a returned rental keeps its gray face but drops the progressbar role (the walk is over)', () => {
    const src = desk();
    expect(src.includes('{...(isReturned')).toBe(true);
    expect(src.includes('const elapsedPct = Math.min(Math.max(Math.round(((now - start) / termMs) * 100), 0), 100);')).toBe(true);
    expect(src.includes('const termMs = Math.max(expected - start, 86400000);')).toBe(true);
  });

  it('the fill keeps the desk\u2019s own journey (green / amber / red — the statusColor it already computed)', () => {
    const src = desk();
    expect(src.includes("const statusColor = isOverdue ? 'red' : isCloseToDue ? 'amber' : isActive ? 'green' : isReturned ? 'gray' : 'green';")).toBe(true);
    expect(src.includes('style={{ width: isReturned ? \'100%\' : `${Math.min(((now - start) / (expected - start)) * 100, 100)}%` }}')).toBe(true);
  });
});
