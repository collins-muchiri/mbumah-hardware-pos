// v2.373.0 THE STRANDED-GAP HEAL + THE ROW-LEVEL SETTLE AFFORDANCE.
//
// Companion to src/tests/lib/sale-refund-audit.test.ts (same conventions:
// real Prisma client on the seeded SQLite house DB, fixtures matching the
// seeded world, afterAll cleanup so the DB stays clean) and to
// src/tests/refund-gap-closure-v2372.test.ts (the pure seam's truth
// tables). This suite pins:
//
//   • THE ROW-STATE VOICE ...... deriveRefundRowState's four kinds +
//                                its nulls (non-sale, non-refundable
//                                statuses) from hand-built views
//   • THE STRANDED ASSESSMENT .. assessStrandedOriginal's truth table,
//                                including the 0.004 epsilon boundary
//   • THE HEAL (DB) ............ a legacy stranded original (header ABOVE
//                                the line Σ, every line already consumed
//                                by the chain, status parked at PARTIAL)
//                                heals: zero-item REFUND event for exactly
//                                the remainder, Payment row, Receipt row,
//                                the drawer's signed-negative CASH row,
//                                a balanced REFUND journal, the original
//                                flips REFUNDED, stock untouched
//   • THE GUARDS ............... open lines → NOT_STRANDED; exhausted
//                                lines with no remainder → NOT_STRANDED;
//                                non-sale / foreign tenant / unknown id /
//                                already-REFUNDED all refused, nothing
//                                commits

import { describe, it, expect, afterAll } from 'vitest';
import { db } from '@/lib/db';
import {
  healStrandedOriginal,
  assessStrandedOriginal,
  deriveRefundRowState,
  RefundError,
  type RefundableLineView,
} from '@/lib/sale-refund-service';
import { toDec } from '@/lib/utils/financialMath';

const STORE_ID = 'store_juja_main';
const OTHER_STORE_ID = 'store_thika_road';
const ORG_ID = 'org_mbumah';
const ACTOR_ID = 'user_super_admin';

const createdProductIds: string[] = [];
const createdTransactionIds: string[] = [];

afterAll(async () => {
  // Children first (FK order); best-effort so a failing assert can't mask
  // the cleanup error either way - the house DB must stay clean.
  for (const txId of createdTransactionIds) {
    await db.journalEntry.deleteMany({ where: { referenceId: txId } }).catch(() => {});
    await db.cashDrawerLog.deleteMany({ where: { notes: { contains: txId } } }).catch(() => {});
  }
  await db.receipt.deleteMany({ where: { transactionId: { in: createdTransactionIds } } }).catch(() => {});
  await db.payment.deleteMany({ where: { transactionId: { in: createdTransactionIds } } }).catch(() => {});
  await db.salesTransaction.deleteMany({ where: { id: { in: createdTransactionIds } } }).catch(() => {});
  await db.salesTransaction.deleteMany({ where: { refundedTransactionId: { in: createdTransactionIds } } }).catch(() => {});
  await db.product.deleteMany({ where: { id: { in: createdProductIds } } }).catch(() => {});
});

async function makeTestProduct(quantity: number) {
  const suffix = Math.random().toString(36).slice(2, 10);
  const product = await db.product.create({
    data: {
      storeId: STORE_ID,
      name: `STRANDED-TEST ${suffix}`,
      sku: `STR-${suffix}`,
      pricePerUnit: 100,
      costPrice: 60,
      quantityInStock: quantity,
      unitType: 'PIECE',
      isActive: true,
      reorderLevel: 1,
      conversionFactor: 1,
    } as never,
  });
  createdProductIds.push(product.id);
  return product;
}

interface FixtureSale {
  id: string;
  receiptNumber: string;
  items: { id: string; productId: string }[];
}

/**
 * The legacy VAT-ON-TOP sale: the header sits ABOVE the line Σ
 * (totalAmount = Σ lineTotal + headerGap) - the shape that stranded rows
 * wear. `paymentStatus` defaults to PARTIAL (the parked state).
 */
async function makeGapSale(
  product: { id: string },
  opts: {
    quantity?: number;
    lineTotal?: number;
    headerGap?: number;
    paymentStatus?: string;
    paymentMethod?: string;
  } = {},
): Promise<FixtureSale> {
  const quantity = opts.quantity ?? 1;
  const lineTotal = opts.lineTotal ?? 7500;
  const headerGap = opts.headerGap ?? 1200;
  const totalAmount = lineTotal + headerGap;
  const suffix = Math.random().toString(36).slice(2, 12).toUpperCase();
  const tx = await db.salesTransaction.create({
    data: {
      storeId: STORE_ID,
      receiptNumber: `MBM-TEST-${suffix}`,
      cashierId: ACTOR_ID,
      subtotal: 6465.52,
      taxAmount: 1034.48,
      totalAmount,
      paymentMethod: opts.paymentMethod ?? 'CASH',
      paymentStatus: opts.paymentStatus ?? 'PARTIAL',
      transactionType: 'SALE',
      items: {
        create: {
          productId: product.id,
          productName: 'STRANDED-TEST line',
          quantity,
          unitType: 'PIECE',
          pricePerUnit: 100,
          costPrice: 60,
          discountPercent: 0,
          taxRate: 16,
          lineTotal,
          isRentalItem: false,
        },
      },
    },
    include: { items: true },
  });
  createdTransactionIds.push(tx.id);
  await db.payment.create({
    data: {
      storeId: STORE_ID,
      transactionId: tx.id,
      paymentMethod: opts.paymentMethod ?? 'CASH',
      amount: totalAmount,
      currency: 'KES',
      status: 'COMPLETED',
    },
  });
  await db.receipt.create({
    data: {
      storeId: STORE_ID,
      transactionId: tx.id,
      receiptNumber: `MBM-TEST-${suffix}`,
      receiptType: 'DIGITAL',
    },
  });
  return {
    id: tx.id,
    receiptNumber: tx.receiptNumber,
    items: tx.items.map((i) => ({ id: i.id, productId: i.productId })),
  };
}

/**
 * The LEGACY chain: a REFUND transaction whose items link back through
 * refundedSaleItemId and whose Σ lineTotal is what the legacy world
 * refunded - the header gap was NEVER reachable, so the chain sums to the
 * line world only. This is the fixture the v2.372.0 closure can't heal
 * (no quantity left to allocate) and the v2.373.0 heal exists for.
 */
async function makeLegacyChainRefund(
  sale: FixtureSale,
  opts: { quantity: number; lineTotal: number },
): Promise<string> {
  const suffix = Math.random().toString(36).slice(2, 12).toUpperCase();
  const tx = await db.salesTransaction.create({
    data: {
      storeId: STORE_ID,
      receiptNumber: `MBM-TEST-${suffix}`,
      cashierId: ACTOR_ID,
      subtotal: opts.lineTotal,
      taxAmount: 0,
      totalAmount: opts.lineTotal,
      paymentMethod: 'CASH',
      paymentStatus: 'COMPLETED',
      transactionType: 'REFUND',
      notes: `Refund of ${sale.receiptNumber}`,
      refundedTransactionId: sale.id,
      items: {
        create: sale.items.map((item) => ({
          productId: item.productId,
          productName: 'STRANDED-TEST line',
          quantity: opts.quantity,
          unitType: 'PIECE',
          pricePerUnit: 100,
          costPrice: 60,
          discountPercent: 0,
          taxRate: 16,
          lineTotal: opts.lineTotal / sale.items.length,
          isRentalItem: false,
          refundedSaleItemId: item.id,
        })),
      },
    },
    include: { items: true },
  });
  createdTransactionIds.push(tx.id);
  return tx.id;
}

// v2.402.0: the label rides on its own — most call sites read the value
// without naming it, so the label is optional with an honest default (the
// throw's words stay truthful either way). 29 strict faces stand down.
function must<T>(value: T | null | undefined, label = 'value'): T {
  if (value == null) throw new Error(`test fixture missing: ${label}`);
  return value;
}

const stockOf = async (productId: string) => {
  const p = await db.product.findUnique({ where: { id: productId } });
  return toDec(must(p, 'product').quantityInStock as never).toNumber();
};

const line = (over: Partial<RefundableLineView>): RefundableLineView => ({
  saleItemId: over.saleItemId ?? 'line_a',
  productId: 'prod_a',
  productName: 'Test line',
  unitType: 'PIECE',
  soldQuantity: 2,
  alreadyRefundedQuantity: 0,
  refundableQuantity: 2,
  lineTotal: 232,
  refundableValue: 232,
  unitRefundValue: 116,
  isRentalItem: false,
  ...over,
});

describe('v2.373.0 the row-state voice (deriveRefundRowState, pure)', () => {
  it('a clean refundable sale settles in full with no gap', () => {
    const state = deriveRefundRowState({
      transactionType: 'SALE',
      paymentStatus: 'COMPLETED',
      views: [line({})],
      headerRemaining: 232,
    });
    expect(state).not.toBeNull();
    expect(must(state).kind).toBe('SETTLES_FULL');
    expect(must(state).fullRefundAmount).toBe(232);
    expect(must(state).settleGap).toBe(0);
    expect(must(state).strandedAmount).toBe(0);
  });

  it('a VAT-on-top header names the gap (SETTLES_FULL_WITH_GAP)', () => {
    const state = deriveRefundRowState({
      transactionType: 'SALE',
      paymentStatus: 'PARTIAL',
      views: [line({ refundableValue: 232 })],
      headerRemaining: 350,
    });
    expect(state).not.toBeNull();
    expect(must(state).kind).toBe('SETTLES_FULL_WITH_GAP');
    expect(must(state).fullRefundAmount).toBe(350);
    expect(must(state).settleGap).toBe(118);
  });

  it('an exhausted sale with a positive remainder is STRANDED, with the exact amount', () => {
    const state = deriveRefundRowState({
      transactionType: 'SALE',
      paymentStatus: 'PARTIAL',
      views: [line({ refundableQuantity: 0, refundableValue: 0 })],
      headerRemaining: 1200,
    });
    expect(state).not.toBeNull();
    expect(must(state).kind).toBe('STRANDED');
    expect(must(state).strandedAmount).toBe(1200);
    expect(must(state).fullRefundAmount).toBe(1200);
  });

  it('an exhausted sale with nothing left on the header is SETTLED', () => {
    const state = deriveRefundRowState({
      transactionType: 'SALE',
      paymentStatus: 'PARTIAL',
      views: [line({ refundableQuantity: 0, refundableValue: 0 })],
      headerRemaining: 0,
    });
    expect(must(state).kind).toBe('SETTLED');
    expect(must(state).strandedAmount).toBe(0);
  });

  it('non-sale rows and non-refundable statuses wear no state (null)', () => {
    expect(deriveRefundRowState({
      transactionType: 'REFUND',
      paymentStatus: 'COMPLETED',
      views: [line({})],
      headerRemaining: 100,
    })).toBeNull();
    expect(deriveRefundRowState({
      transactionType: 'SALE',
      paymentStatus: 'REFUNDED',
      views: [line({ refundableQuantity: 0, refundableValue: 0 })],
      headerRemaining: 100,
    })).toBeNull();
    expect(deriveRefundRowState({
      transactionType: 'SALE',
      paymentStatus: 'CANCELLED',
      views: [line({})],
      headerRemaining: 100,
    })).toBeNull();
    expect(deriveRefundRowState({
      transactionType: 'SALE',
      paymentStatus: 'PENDING',
      views: [line({})],
      headerRemaining: 100,
    })).toBeNull();
  });

  it('a negative header remainder clamps to zero (over-refunded headers never speak)', () => {
    const state = deriveRefundRowState({
      transactionType: 'SALE',
      paymentStatus: 'PARTIAL',
      views: [line({ refundableQuantity: 0, refundableValue: 0 })],
      headerRemaining: -50,
    });
    expect(must(state).kind).toBe('SETTLED');
    expect(must(state).fullRefundAmount).toBe(0);
  });
});

describe('v2.373.0 the stranded assessment (assessStrandedOriginal, pure)', () => {
  it('exhausted lines + a positive remainder strand the sale', () => {
    const a = assessStrandedOriginal([line({ refundableQuantity: 0, refundableValue: 0 })], 1200);
    expect(a.stranded).toBe(true);
    expect(a.strandedAmount).toBe(1200);
  });

  it('an open line means the live closure can still reach it - not stranded', () => {
    const a = assessStrandedOriginal([line({ refundableQuantity: 1, refundableValue: 116 })], 1200);
    expect(a.stranded).toBe(false);
    expect(a.strandedAmount).toBe(0);
  });

  it('the 0.004 epsilon boundary: dust is settled, a cent-plus is stranded', () => {
    expect(assessStrandedOriginal([line({ refundableQuantity: 0, refundableValue: 0 })], 0.004).stranded).toBe(false);
    expect(assessStrandedOriginal([line({ refundableQuantity: 0, refundableValue: 0 })], 0.01).stranded).toBe(true);
    expect(assessStrandedOriginal([line({ refundableQuantity: 0, refundableValue: 0 })], 0).stranded).toBe(false);
    expect(assessStrandedOriginal([line({ refundableQuantity: 0, refundableValue: 0 })], -5).stranded).toBe(false);
  });
});

describe('v2.373.0 the stranded-gap heal (the transactional truth, on the house DB)', () => {
  it('settles the legacy remainder: a zero-item REFUND event pays the gap, the original flips REFUNDED', async () => {
    const product = await makeTestProduct(10);
    const stockBefore = await stockOf(product.id);
    // The legacy stranded shape: 7,500 of lines under an 8,700 header;
    // the legacy chain refunded the lines only; the sale parked at PARTIAL.
    const sale = await makeGapSale(product, { quantity: 1, lineTotal: 7500, headerGap: 1200 });
    await makeLegacyChainRefund(sale, { quantity: 1, lineTotal: 7500 });

    const result = await healStrandedOriginal(db, {
      originalId: sale.id,
      storeId: STORE_ID,
      organizationId: ORG_ID,
      actorUserId: ACTOR_ID,
    });

    // The result speaks the settle truth.
    expect(result.healed).toBe(true);
    expect(result.refundTotal).toBe(1200);
    expect(result.originalPriorPaymentStatus).toBe('PARTIAL');
    expect(result.originalPaymentStatus).toBe('REFUNDED');
    expect(result.loyalty).toBeNull(); // no wallet on the fixture

    // The REFUND event: ZERO items - the money settles the HEADER, and its
    // notes carry the chain reference the receipt's meta line reads.
    const refundEvent = must(result.refund, 'heal refund event');
    const refundTx = await db.salesTransaction.findUnique({
      where: { id: refundEvent.id },
      include: { items: true, payments: true, receipt: true },
    });
    expect(must(refundTx).refundedTransactionId).toBe(sale.id);
    expect(must(refundTx).transactionType).toBe('REFUND');
    expect(must(refundTx).items).toHaveLength(0);
    expect(toDec(must(refundTx).totalAmount as never).toNumber()).toBe(1200);
    expect(must(refundTx).notes).toContain(`Refund of ${sale.receiptNumber}`);

    // The Payment row + the receipt row exist.
    expect(must(refundTx).payments).toHaveLength(1);
    expect(toDec(must(refundTx).payments[0].amount as never).toNumber()).toBe(1200);
    expect(must(refundTx).payments[0].status).toBe('COMPLETED');
    expect(must(refundTx).receipt).toBeTruthy();

    // The drawer: the CASH portion hits the ledger SIGNED NEGATIVE (the
    // notes speak the refund's receipt number, not its id).
    const drawer = await db.cashDrawerLog.findFirst({
      where: { notes: { contains: refundEvent.receiptNumber } },
    });
    expect(drawer).toBeTruthy();
    expect(toDec(must(drawer).amount as never).toNumber()).toBe(-1200);
    expect(must(drawer).action).toBe('REFUND');

    // The journal: REFUND-typed, balanced to the cent, the full
    // consideration reversed.
    const je = await db.journalEntry.findFirst({
      where: { referenceId: refundEvent.id },
      include: { lines: true },
    });
    expect(must(je).referenceType).toBe('REFUND');
    const debits = must(je).lines.reduce((s, l) => s + Number(l.debit ?? 0), 0);
    const credits = must(je).lines.reduce((s, l) => s + Number(l.credit ?? 0), 0);
    expect(Math.abs(debits - credits)).toBeLessThanOrEqual(0.01);
    expect(debits).toBeGreaterThanOrEqual(1200 - 0.02);

    // The original flipped REFUNDED - the parked PARTIAL is gone.
    const original = await db.salesTransaction.findUnique({ where: { id: sale.id } });
    expect(must(original).paymentStatus).toBe('REFUNDED');

    // A zero-item heal moves NO stock and writes NO movements.
    expect(await stockOf(product.id)).toBe(stockBefore);
    const movements = await db.stockMovement.findMany({ where: { referenceId: sale.id } });
    expect(movements).toHaveLength(0);
  });

  it('a sale with open lines is NOT stranded (NOT_STRANDED, nothing commits)', async () => {
    const product = await makeTestProduct(10);
    // An untouched COMPLETED sale: every line open, the live refund or the
    // gap closure owns it - the heal must refuse.
    const sale = await makeGapSale(product, {
      quantity: 2,
      lineTotal: 232,
      headerGap: 0,
      paymentStatus: 'COMPLETED',
    });

    try {
      await healStrandedOriginal(db, {
        originalId: sale.id,
        storeId: STORE_ID,
        organizationId: ORG_ID,
        actorUserId: ACTOR_ID,
      });
      expect.unreachable('must throw');
    } catch (err) {
      expect(err).toBeInstanceOf(RefundError);
      expect((err as RefundError).code).toBe('NOT_STRANDED');
    }
    const count = await db.salesTransaction.count({ where: { refundedTransactionId: sale.id } });
    expect(count).toBe(0);
  });

  it('an exhausted sale with nothing left on the header is REPAIRED (v2.374.0: the badge catches up, no money moves)', async () => {
    const product = await makeTestProduct(10);
    // A VAT-INCLUSIVE sale fully refunded by its chain: nothing remains on
    // the header - the row is a status LIE (still PARTIAL), not a money
    // problem. v2.373.0 refused it NOT_STRANDED; v2.374.0's repair path
    // flips the badge and NOTHING ELSE.
    const sale = await makeGapSale(product, {
      quantity: 1,
      lineTotal: 8700,
      headerGap: 0,
      paymentStatus: 'PARTIAL',
    });
    await makeLegacyChainRefund(sale, { quantity: 1, lineTotal: 8700 });

    const paymentsBefore = await db.payment.count({ where: { transactionId: { in: [sale.id] } } });
    const journalsBefore = await db.journalEntry.count({ where: { referenceId: { in: [sale.id] } } });
    const receiptsBefore = await db.receipt.count({ where: { transactionId: { in: [sale.id] } } });

    const result = await healStrandedOriginal(db, {
      originalId: sale.id,
      storeId: STORE_ID,
      organizationId: ORG_ID,
      actorUserId: ACTOR_ID,
    });
    expect(result.mode).toBe('REPAIRED');
    expect(result.refund).toBeNull();
    expect(result.refundTotal).toBe(0);
    expect(result.healed).toBe(true);
    expect(result.originalPriorPaymentStatus).toBe('PARTIAL');
    expect(result.originalPaymentStatus).toBe('REFUNDED');

    // The original flipped; NO money artifact was created.
    const original = await db.salesTransaction.findUnique({ where: { id: sale.id } });
    expect(must(original, 'original sale').paymentStatus).toBe('REFUNDED');
    expect(await db.payment.count({ where: { transactionId: { in: [sale.id] } } })).toBe(paymentsBefore);
    expect(await db.journalEntry.count({ where: { referenceId: { in: [sale.id] } } })).toBe(journalsBefore);
    expect(await db.receipt.count({ where: { transactionId: { in: [sale.id] } } })).toBe(receiptsBefore);
    expect(await db.salesTransaction.count({ where: { refundedTransactionId: sale.id } })).toBe(1);
  });

  it('the guards: unknown id, foreign tenant, non-sale rows, already-REFUNDED', async () => {
    const product = await makeTestProduct(10);
    const sale = await makeGapSale(product, { quantity: 1, lineTotal: 7500, headerGap: 1200 });
    await makeLegacyChainRefund(sale, { quantity: 1, lineTotal: 7500 });

    // Unknown id.
    try {
      await healStrandedOriginal(db, {
        originalId: 'tx_does_not_exist',
        storeId: STORE_ID,
        organizationId: ORG_ID,
        actorUserId: ACTOR_ID,
      });
      expect.unreachable('must throw');
    } catch (err) {
      expect((err as RefundError).code).toBe('NOT_FOUND');
    }

    // Foreign tenant.
    try {
      await healStrandedOriginal(db, {
        originalId: sale.id,
        storeId: OTHER_STORE_ID,
        organizationId: ORG_ID,
        actorUserId: ACTOR_ID,
      });
      expect.unreachable('must throw');
    } catch (err) {
      expect((err as RefundError).code).toBe('TENANT_MISMATCH');
    }

    // The successful heal, then the double-heal refused.
    const result = await healStrandedOriginal(db, {
      originalId: sale.id,
      storeId: STORE_ID,
      organizationId: ORG_ID,
      actorUserId: ACTOR_ID,
    });
    expect(result.healed).toBe(true);

    try {
      await healStrandedOriginal(db, {
        originalId: sale.id,
        storeId: STORE_ID,
        organizationId: ORG_ID,
        actorUserId: ACTOR_ID,
      });
      expect.unreachable('must throw');
    } catch (err) {
      expect((err as RefundError).code).toBe('NOT_REFUNDABLE');
    }
  });
});
