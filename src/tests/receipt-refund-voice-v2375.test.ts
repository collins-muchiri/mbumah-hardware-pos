// THE SETTLEMENT SPEAKS ITS NAME (v2.375.0): the stranded-gap settlement's
// paper, row and share text all wear their own kind.
//
// The heal (v2.373.0) writes the settlement as a ZERO-item REFUND event —
// the header remainder the line world could not reach, one transaction, no
// lines. Three surfaces still spoke the generic refund/sale voice over it:
//   1. The share text (Copy / WhatsApp / SMS) borrowed the sale voice
//      wholesale — "Thank you for shopping at MBUMAH HARDWARE!" above
//      "Goods sold are not refundable." — on a receipt that IS the refund.
//   2. The desk's row wearing gave the zero-item event the same amber
//      RotateCcw chip an itemized refund wears — two money-out shapes
//      masquerading as each other.
//   3. The paper's banner band spoke the refund amber for both shapes.
// This round: the share text speaks the refund voice (banner, "Refund of"
// chain line, an honest footer) with the zero-item settlement naming its
// header-level nature; the row wearing gives the settlement the emerald
// settle ink (the SAME law the row-level settle affordance speaks);
// the paper's banner wears the emerald settle band for the settlement.
//
// Pins: the SALE share contract is BYTE-IDENTICAL (the v2.14.0 spec stands
// — the four unconditional lines, the items table, the sale footer), the
// refund voice's banner + chain line + footer, the zero-item settlement
// line, the isSettlementEvent law (exported, byte-pinned — the
// refundReasonOf precedent: the desk's own helper, the module-local
// pattern), the CSV's settlement voice, and the paper's banner variant.
//
// THE ONE-WRITER LEDGERS STAND: the desk's kind semantics live in
// txn-kind-v2371.test.ts (the amber refund chip's bytes remain pinned
// THERE); this suite owns the settlement's own kind and the share text.

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { buildReceiptText } from '@/lib/receipt-share-text';
import type { TransactionItem, SaleItemDetail } from '@/lib/api';

const DESK_PATH = 'src/app/(shell)/tabs/transactions-tab.tsx';
const desk = readFileSync(DESK_PATH, 'utf8');
const PAPER_PATH = 'src/components/receipt-print.tsx';
const paper = readFileSync(PAPER_PATH, 'utf8');
const SHARE_PATH = 'src/lib/receipt-share-text.ts';
const shareSrc = readFileSync(SHARE_PATH, 'utf8');
const ROUTE_PATH = 'src/app/api/whatsapp/send-document/route.ts';
const routeSrc = readFileSync(ROUTE_PATH, 'utf8');

function between(startMarker: string, endMarker: string): string {
  const a = desk.indexOf(startMarker);
  const b = desk.indexOf(endMarker, a);
  expect(a, startMarker).toBeGreaterThanOrEqual(0);
  expect(b, endMarker).toBeGreaterThan(a);
  return desk.slice(a, b);
}

// ---- the fixtures (the share text builder is a PURE function — the
// truth table runs LIVE, no doubles, no component mount) ----

function saleFixture(): TransactionItem {
  return {
    id: 'tx-sale-1',
    storeId: 'store-1',
    receiptNumber: 'MBM-RCPT-100',
    customerId: null,
    cashierId: 'user-1',
    subtotal: 800,
    taxAmount: 128,
    discountAmount: 0,
    totalAmount: 928,
    paymentMethod: 'CASH',
    paymentStatus: 'COMPLETED',
    transactionType: 'SALE',
    notes: null,
    isOffline: false,
    createdAt: '2026-11-04T08:00:00.000Z',
    updatedAt: '2026-11-04T08:00:00.000Z',
    items: [
      {
        id: 'item-1',
        transactionId: 'tx-sale-1',
        productId: 'prod-1',
        productName: 'Cement 50kg',
        quantity: 2,
        pricePerUnit: 400,
        lineTotal: 800,
        taxRate: 16,
      } as unknown as SaleItemDetail,
    ],
    cashier: { id: 'user-1', name: 'Jane Wanjiku' },
  } as unknown as TransactionItem;
}

function itemizedRefundFixture(): TransactionItem {
  const sale = saleFixture();
  return {
    ...sale,
    id: 'tx-refund-1',
    receiptNumber: 'MBM-20261103-AAAAA',
    transactionType: 'REFUND',
    subtotal: -400,
    taxAmount: -64,
    totalAmount: -464,
    notes: 'Refund reason: DEFECTIVE · Refund of MBM-RCPT-100',
    items: sale.items,
  } as unknown as TransactionItem;
}

function settlementFixture(): TransactionItem {
  const sale = saleFixture();
  return {
    ...sale,
    id: 'tx-settle-1',
    receiptNumber: 'MBM-20261103-SZJLZ',
    transactionType: 'REFUND',
    subtotal: 880,
    taxAmount: 0,
    totalAmount: 880,
    notes: 'Stranded-gap settlement - the header remainder the line world could not reach · Refund of MBM-RCPT-100',
    items: [],
  } as unknown as TransactionItem;
}

const STORE = {
  id: 'store-1',
  name: 'MBUMAH HARDWARE - Juja Main',
  shortName: 'Juja Main Branch',
  location: 'Juja, Kiambu County',
  phone: '+254700000000',
} as never;

describe('the sale contract stands (v2.14.0, byte-identical)', () => {
  it('the four unconditional lines ride every sale share text', () => {
    const text = buildReceiptText(saleFixture(), STORE);
    expect(text).toContain('        MBUMAH HARDWARE');
    expect(text).toContain('Receipt #: MBM-RCPT-100');
    expect(text).toContain('Date: ');
    expect(text).toContain(`TOTAL:           ${'Ksh 928.00'.padStart(14)}`);
  });

  it('the sale keeps the items table and the sale footer (no refund voice leaks in)', () => {
    const text = buildReceiptText(saleFixture(), STORE);
    expect(text).toContain('Item              Qty  Price   Total');
    expect(text).toContain('Cement 50kg');
    expect(text).toContain('Thank you for shopping at');
    expect(text).toContain('Goods sold are not refundable.');
    expect(text).not.toContain('REFUND RECEIPT');
    expect(text).not.toContain('Refund of:');
  });
});

describe('the refund voice (v2.375.0, live truth table)', () => {
  it('an itemized refund speaks the banner, the chain line and the refund footer', () => {
    const text = buildReceiptText(itemizedRefundFixture(), STORE);
    expect(text).toContain('** REFUND RECEIPT **');
    expect(text).toContain('Refund of: MBM-RCPT-100');
    expect(text).toContain('Refund processed - the money is on its way back.');
    expect(text).toContain('Asante sana!');
    // the sale-only voices never ride a refund
    expect(text).not.toContain('Thank you for shopping at');
    expect(text).not.toContain('Goods sold are not refundable.');
  });

  it('an itemized refund keeps the items table (the refunded lines are real items)', () => {
    const text = buildReceiptText(itemizedRefundFixture(), STORE);
    expect(text).toContain('Item              Qty  Price   Total');
    expect(text).toContain('Cement 50kg');
    expect(text).not.toContain('Header-level settlement');
  });

  it('the zero-item settlement names its header-level nature (the empty table is never silent)', () => {
    const text = buildReceiptText(settlementFixture(), STORE);
    expect(text).toContain('** REFUND RECEIPT **');
    expect(text).toContain('Refund of: MBM-RCPT-100');
    expect(text).toContain('Type: Header-level settlement (no line items)');
    expect(text).not.toContain('Item              Qty  Price   Total');
    expect(text).toContain('Refund processed - the money is on its way back.');
  });

  it('the refund voice is guarded on the row kind (a SALE can never wear it)', () => {
    const sale = saleFixture();
    expect(buildReceiptText(sale, STORE)).not.toContain('REFUND RECEIPT');
    // the guard reads transactionType, not the items' emptiness
    const emptySale = { ...sale, items: [] } as unknown as TransactionItem;
    const text = buildReceiptText(emptySale, STORE);
    expect(text).not.toContain('REFUND RECEIPT');
    expect(text).not.toContain('Header-level settlement');
  });
});

describe('the settlement kind on the desk (v2.375.0, byte-pinned)', () => {
  it('isSettlementEvent is exported (the refundReasonOf precedent)', () => {
    expect(desk).toContain('export function isSettlementEvent(t: {');
  });

  it('the law is REFUND + zero items (the heal\'s own shape)', () => {
    expect(desk).toContain("return t.transactionType === 'REFUND' && (t.items?.length ?? 0) === 0;");
  });

  it('the wearing branches on the settlement kind inside the REFUND block (the v2.371 pins stand)', () => {
    const chip = between("{transaction.transactionType === 'REFUND' && (", 'getPaymentStatusColor(transaction.paymentStatus)');
    expect(chip).toContain('isSettlementEvent(transaction) ? (');
    // the settlement's emerald settle ink — the SAME law the row-level
    // settle affordance speaks
    expect(chip).toContain('bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300');
    expect(chip).toContain('<HandCoins className="h-3 w-3 shrink-0" aria-hidden="true" />');
    expect(chip).toContain('font-mono">Settlement · {formatKES(transaction.totalAmount)}');
    expect(chip).toContain('data-kind="SETTLEMENT"');
    // the itemized refund keeps its amber bytes (txn-kind-v2371's pins)
    expect(chip).toContain('bg-amber-100 text-amber-800');
    expect(chip).toContain('<RotateCcw className="h-3 w-3 shrink-0" aria-hidden="true" />');
    expect(chip).toContain("refundReasonOf(transaction.notes) ? ` · ${refundReasonOf(transaction.notes)}` : ''");
  });

  it('the settlement chip teaches the when-and-why (the tooltip law)', () => {
    const chip = between("{transaction.transactionType === 'REFUND' && (", 'getPaymentStatusColor(transaction.paymentStatus)');
    expect(chip).toContain('Header-level settlement — the stranded remainder');
    expect(chip).toContain('the line world could not reach, settled as');
  });

  it('the CSV export speaks the settlement kind too (the exported ledger stays honest)', () => {
    expect(desk).toContain("isSettlementEvent(t) ? 'Settlement' : getTransactionTypeLabel(getTransactionType(t)),");
  });
});

describe('the settlement\'s paper (v2.375.0, the banner variant)', () => {
  it('the banner branches on the zero-item shape', () => {
    expect(paper).toContain('const isSettlement = isRefund && (transaction.items?.length ?? 0) === 0;');
  });

  it('the settlement wears the emerald settle band with the HandCoins kind', () => {
    expect(paper).toContain("'bg-emerald-100 text-emerald-900 dark:bg-emerald-900/40 dark:text-emerald-200'");
    expect(paper).toContain("'Settlement receipt — the stranded gap is settled'");
    expect(paper).toContain("'This is a settlement receipt'");
  });

  it('the itemized refund keeps the amber band (the v2.309.0 bytes stand)', () => {
    expect(paper).toContain("'bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-200'");
    expect(paper).toContain("'Refund receipt — money returned to the customer'");
  });

  it('the share text source carries the zero-item guard (the builder and the paper agree)', () => {
    expect(shareSrc).toContain("if (isRefund && !tx.items?.length) {");
  });
});

describe("the server's WhatsApp path speaks the kind too (v2.375.0)", () => {
  it("the send-document receipt case guards the row kind (the desk's panel sends THIS message)", () => {
    expect(routeSrc).toContain("const isRefundTx = transaction.transactionType === 'REFUND';");
  });

  it('the server banner and chain line carry the refund voice', () => {
    expect(routeSrc).toContain("*${isRefundTx ? 'REFUND RECEIPT' : 'RECEIPT'}*");
    expect(routeSrc).toContain('transaction.notes?.match(/Refund of (\\S+)/)?.[1]');
  });

  it('the server settlement names its nature and the footer never sells on a refund', () => {
    expect(routeSrc).toContain('Type: Header-level settlement (no line items)');
    expect(routeSrc).toContain('Refund processed - the money is on its way back.');
    expect(routeSrc).toContain('Thank you for shopping with us!');
  });
});
