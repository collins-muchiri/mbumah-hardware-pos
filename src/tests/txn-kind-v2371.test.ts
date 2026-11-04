// THE REFUND ROWS COME HOME (v2.371.0): the transactions desk's derived
// type reads the row's OWN kind before the derived status.
//
// The refund feature (v2.308.0) gave every refund its own transaction
// row — own receipt number, own reason, own money-out amount — and gave
// that row paymentStatus COMPLETED (the refund SUCCEEDED). The desk's
// derived type read only the paymentStatus, so every refund event
// masqueraded as a 'sale' in the sales lens, and the refund lens
// (`?txn-type=refund`, the seventh word) only ever showed the refunded
// ORIGINALS — the events themselves were invisible as a class. This
// round the row's own transactionType outranks the derived status: the
// refund lens becomes the refund DESK (the events AND the refunded
// originals share it — the two sides of one story), the event rows wear
// this desk's own amber refund ink with the reason voice, and the sales
// lens is sales again.
//
// Pins: the kind-first branch order (the law is the ORDER), the reason
// voice's regex and vocabulary guard (exported, byte-pinned — the
// module-local pattern of the desk's own helpers), the event chip's
// wearing bytes (amber, the RotateCcw kind icon, the conditional on the
// row's own kind, the reason suffix), the two-voices distinction (the
// original keeps its status badge, the event wears the kind chip), the
// lens composition line, and the walk-proof negative (the codemod must
// never rewrite this suite's own negative pins).
//
// v2.378.0 THE SETTLEMENT KIND JOINS THE UNION: the kind-first REFUND
// branch now refines through isSettlementEvent — the zero-item event
// answers 'settlement', the itemized REFUND keeps 'refund'. The ORDER
// law stands byte-for-byte (the kind branches still outrank the status
// branches); the truth-table pins grew the refinement, and the amount
// cell's minus now reaches the settlement too (money-out is money-out).
//
// THE STRESS'S BOUNDARY: this suite owns the desk's kind semantics —
// the `txn-type` WORD's parser and chip live in
// txn-type-deep-link-v2354.test.ts (the one-writer ledgers stand).

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';

const DESK_PATH = 'src/app/(shell)/tabs/transactions-tab.tsx';
const desk = readFileSync(DESK_PATH, 'utf8');

function between(startMarker: string, endMarker: string): string {
  const a = desk.indexOf(startMarker);
  const b = desk.indexOf(endMarker, a);
  expect(a, startMarker).toBeGreaterThanOrEqual(0);
  expect(b, endMarker).toBeGreaterThan(a);
  return desk.slice(a, b);
}

const KIND_BODY = between(
  'function getTransactionType(transaction: TransactionItem): TransactionType {',
  'function getTransactionTypeIcon(',
);

describe('the row\'s own kind comes first (v2.371.0)', () => {
  it('the kind branches are written BEFORE the status branches (the law is the order)', () => {
    const kindRefund = KIND_BODY.indexOf("transaction.transactionType === 'REFUND'");
    const kindVoid = KIND_BODY.indexOf("transaction.transactionType === 'VOID'");
    const statusRefunded = KIND_BODY.indexOf("paymentStatus === 'REFUNDED'");
    const statusVoided = KIND_BODY.indexOf("paymentStatus === 'VOIDED'");
    expect(kindRefund).toBeGreaterThanOrEqual(0);
    expect(kindVoid).toBeGreaterThan(kindRefund);
    expect(statusRefunded).toBeGreaterThan(kindVoid);
    expect(statusVoided).toBeGreaterThan(statusRefunded);
    expect(KIND_BODY.indexOf('return \'sale\';')).toBeGreaterThan(statusVoided);
  });

  it('the truth table in bytes: REFUND row is a refund, VOID row is a void', () => {
    // v2.378.0: the REFUND branch refines through isSettlementEvent — the
    // zero-item event answers 'settlement', the itemized REFUND keeps
    // 'refund'; the ONE-LINE form became the BLOCK form and the order
    // assertions above still hold (the kind branches still come first)
    expect(KIND_BODY).toContain("if (transaction.transactionType === 'REFUND') {");
    expect(KIND_BODY).toContain("return isSettlementEvent(transaction) ? 'settlement' : 'refund';");
    expect(KIND_BODY).toContain("if (transaction.transactionType === 'VOID') return 'void';");
    expect(KIND_BODY).toContain("if (transaction.paymentStatus === 'REFUNDED') return 'refund';");
    expect(KIND_BODY).toContain("if (transaction.paymentStatus === 'VOIDED' || transaction.paymentStatus === 'CANCELLED') return 'void';");
    expect(KIND_BODY).toContain('return \'sale\';');
  });

  it('the law carries its name and its reason (the masquerade is documented at source)', () => {
    expect(KIND_BODY).toContain('THE ROW\'S OWN KIND COMES FIRST');
    expect(KIND_BODY).toContain('masqueraded');
    expect(KIND_BODY).toContain('v2.371.0');
  });
});

describe('the refund event\'s reason voice (exported, live-guarded)', () => {
  it('refundReasonOf is exported from the desk (the suite truth-tables its bytes)', () => {
    expect(desk).toContain('export function refundReasonOf(notes: string | null | undefined): string | null {');
  });

  it('the reason regex anchors the service\'s own prefix form (first segment, known boundary)', () => {
    expect(desk).toContain("notes.match(/^Refund reason: ([A-Z_]+)(?=$| ·)/)");
  });

  it('the vocabulary guard reads the KNOWN labels only (an honest chip never invents)', () => {
    const fn = between('export function refundReasonOf(', 'function RefundDialog({');
    expect(fn).toContain('if (!notes) return null;');
    expect(fn).toContain('in REFUND_REASON_LABELS');
    expect(fn).toContain('return REFUND_REASON_LABELS[m[1]];');
  });

  it('the six reasons keep their labels', () => {
    expect(desk).toContain("DEFECTIVE: 'Defective goods',");
    expect(desk).toContain("WRONG_ITEM: 'Wrong item sold',");
    expect(desk).toContain("CUSTOMER_CHANGED_MIND: 'Customer changed their mind',");
    expect(desk).toContain("DAMAGED_IN_TRANSIT: 'Damaged in transit',");
    expect(desk).toContain("WARRANTY_CLAIM: 'Warranty claim',");
    expect(desk).toContain("OTHER: 'Other',");
  });
});

describe('the refund event\'s wearing (the amber kind chip)', () => {
  it('the chip renders on the ROW\'S OWN KIND, never on the derived status', () => {
    expect(desk).toContain("{transaction.transactionType === 'REFUND' && (");
    const chip = between("{transaction.transactionType === 'REFUND' && (", 'getPaymentStatusColor(transaction.paymentStatus)');
    expect(chip).toContain('bg-amber-100 text-amber-800');
    expect(chip).toContain('dark:bg-amber-950/40 dark:text-amber-300');
    expect(chip).toContain('<RotateCcw className="h-3 w-3 shrink-0" aria-hidden="true" />');
    expect(chip).toContain("refundReasonOf(transaction.notes) ? ` · ${refundReasonOf(transaction.notes)}` : ''");
  });

  it('the chip wears the desk\'s OWN refund ink and documents the two voices', () => {
    expect(desk).toContain('THE REFUND EVENT\'S WEARING');
    expect(desk).toContain('the amount cell\n                 has worn the amber minus since the refund lens shipped');
    expect(desk).toContain('the event and the state are two voices');
  });

  it('the originals keep their status badge (the pre-existing bytes stand)', () => {
    expect(desk).toContain('getPaymentStatusColor(transaction.paymentStatus)');
    expect(desk).toContain('getPaymentStatusLabel(transaction.paymentStatus)');
  });

  it('the amount cell\'s amber-minus applies to the kind (the pre-existing voice now reaches the events)', () => {
    // v2.378.0: the settlement rides the same money-out voice — the minus
    // and its own emerald ink (the amber stays the itemized refund's)
    expect(desk).toContain("txType === 'refund' ? 'text-amber-700' : txType === 'settlement' ? 'text-emerald-700' : txType === 'void' ? 'text-red-600 line-through' : 'text-foreground'");
    expect(desk).toContain("{txType === 'refund' || txType === 'settlement' ? '-' : ''}");
  });
});

describe('the lens composition (the refund desk, not just the face)', () => {
  it('the type filter reads the derived kind (the landed word filters the ROWS)', () => {
    expect(desk).toContain('getTransactionType(t) === typeFilter');
  });

  it('the lens\'s census truth stays keyed on the derived kind (the one-writer ledger owns that pin)', () => {
    // door-shape-registry-v2353.test.ts owns the census line's exact
    // bytes; this suite only asserts the desk still carries A census
    // over the same kind function — the composition, not the bytes.
    expect(desk).toContain('typeCensus[typeFilter]');
  });
});

describe('the walk-proof negatives (the codemod must never rewrite this suite)', () => {
  it('the kind bytes are split-string concat (a version re-anchor cannot find them)', () => {
    expect('2.' + '371.0').toBe('2.371.0');
    expect(desk).toContain("'REFUND') {");
    expect(desk.includes("'2.384.0'")).toBe(false);
  });
});
