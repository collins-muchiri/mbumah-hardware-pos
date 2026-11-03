// v2.374.0 THE STATUS-REPAIR PATH + THE RECEIPT HOP.
//
// Companion to src/tests/refund-stranded-heal-v2373.test.ts (same
// conventions: real Prisma client on the seeded SQLite house DB, fixtures
// matching the seeded world, afterAll cleanup). v2.374.0 the heal endpoint
// speaks TWO modes, and this suite pins the second:
//
//   • THE REPAIR .............. an exhausted sale with NOTHING left on the
//                               header (0 ≤ expected ≤ epsilon) is a status
//                               lie: mode 'REPAIRED' flips the badge and
//                               NOTHING ELSE — no Payment row, no journal,
//                               no receipt, no drawer row, no loyalty, no
//                               movements, no new transactions
//   • THE OVER-REFUND WALL ... a chain that consumed MORE than the header
//                               (expected < 0) is refused NOT_STRANDED —
//                               the anomaly stays visible for a human
//   • THE DOUBLE REPAIR ...... a repaired (REFUNDED) sale is refused
//                               NOT_REFUNDABLE — the guards still hold
//   • THE HEALED MODE ........ the stranded remainder still answers mode
//                               'HEALED' with the zero-item event (the
//                               v2.373.0 law, unchanged)
//   • THE EPSILON BOUNDARY ... a 1-cent remainder (> 0.004) is STRANDED —
//                               money, not a status lie

import { describe, it, expect, afterAll } from 'vitest';
import { db } from '@/lib/db';
import { healStrandedOriginal, RefundError } from '@/lib/sale-refund-service';
import { toDec } from '@/lib/utils/financialMath';

const STORE_ID = 'store_juja_main';
const ORG_ID = 'org_mbumah';
const ACTOR_ID = 'user_super_admin';

const createdProductIds: string[] = [];
const createdTransactionIds: string[] = [];

afterAll(async () => {
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
      name: `REPAIR-TEST ${suffix}`,
      sku: `RPR-${suffix}`,
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

/** A VAT-INCLUSIVE sale (header == Σ lines): the repair's home shape. */
async function makeInclusiveSale(
  product: { id: string },
  opts: { quantity?: number; lineTotal?: number; paymentStatus?: string } = {},
): Promise<FixtureSale> {
  const quantity = opts.quantity ?? 1;
  const lineTotal = opts.lineTotal ?? 8700;
  const suffix = Math.random().toString(36).slice(2, 12).toUpperCase();
  const tx = await db.salesTransaction.create({
    data: {
      storeId: STORE_ID,
      receiptNumber: `MBM-TEST-${suffix}`,
      cashierId: ACTOR_ID,
      subtotal: 7500,
      taxAmount: 1200,
      totalAmount: lineTotal,
      paymentMethod: 'CASH',
      paymentStatus: opts.paymentStatus ?? 'PARTIAL',
      transactionType: 'SALE',
      items: {
        create: {
          productId: product.id,
          productName: 'REPAIR-TEST line',
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
      paymentMethod: 'CASH',
      amount: lineTotal,
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
 * The chain: a REFUND transaction whose items link back through
 * refundedSaleItemId with a Σ lineTotal of `consumed` — the legacy law's
 * own accounting (the service reads Σ ITEMS, never the event's header).
 */
async function makeChainRefund(
  sale: FixtureSale,
  opts: { quantity: number; consumed: number },
): Promise<string> {
  const suffix = Math.random().toString(36).slice(2, 12).toUpperCase();
  const tx = await db.salesTransaction.create({
    data: {
      storeId: STORE_ID,
      receiptNumber: `MBM-TEST-${suffix}`,
      cashierId: ACTOR_ID,
      subtotal: opts.consumed,
      taxAmount: 0,
      totalAmount: opts.consumed,
      paymentMethod: 'CASH',
      paymentStatus: 'COMPLETED',
      transactionType: 'REFUND',
      notes: `Refund of ${sale.receiptNumber}`,
      refundedTransactionId: sale.id,
      items: {
        create: sale.items.map((item) => ({
          productId: item.productId,
          productName: 'REPAIR-TEST line',
          quantity: opts.quantity,
          unitType: 'PIECE',
          pricePerUnit: 100,
          costPrice: 60,
          discountPercent: 0,
          taxRate: 16,
          lineTotal: opts.consumed / sale.items.length,
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

function must<T>(value: T | null | undefined, label: string): T {
  if (value == null) throw new Error(`test fixture missing: ${label}`);
  return value;
}

describe('v2.374.0 the status-repair path (the transactional truth, on the house DB)', () => {
  it('an exhausted sale with nothing left on the header REPAIRS: the badge catches up and NO money moves', async () => {
    const product = await makeTestProduct(10);
    const stockBefore = toDec(must(await db.product.findUnique({ where: { id: product.id } }), 'product').quantityInStock as never).toNumber();
    const sale = await makeInclusiveSale(product, { quantity: 1, lineTotal: 8700, paymentStatus: 'PARTIAL' });
    await makeChainRefund(sale, { quantity: 1, consumed: 8700 });

    const paymentsBefore = await db.payment.count();
    const journalsBefore = await db.journalEntry.count();
    const receiptsBefore = await db.receipt.count();
    const drawerBefore = await db.cashDrawerLog.count();
    const txCountBefore = await db.salesTransaction.count();

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
    expect(result.loyalty).toBeNull();

    // The badge caught up; the world moved NOTHING else.
    const original = await db.salesTransaction.findUnique({ where: { id: sale.id } });
    expect(must(original).paymentStatus).toBe('REFUNDED');
    expect(await db.payment.count()).toBe(paymentsBefore);
    expect(await db.journalEntry.count()).toBe(journalsBefore);
    expect(await db.receipt.count()).toBe(receiptsBefore);
    expect(await db.cashDrawerLog.count()).toBe(drawerBefore);
    expect(await db.salesTransaction.count()).toBe(txCountBefore);
    expect(toDec(must(await db.product.findUnique({ where: { id: product.id } }), 'product').quantityInStock as never).toNumber()).toBe(stockBefore);
  });

  it('an over-refunded header is NOT repaired (NOT_STRANDED — the anomaly stays visible)', async () => {
    const product = await makeTestProduct(10);
    // The legacy chain consumed MORE than the header (a divergent lie):
    // expected = 8700 − 9700 = −1000. The repair refuses — a human looks.
    const sale = await makeInclusiveSale(product, { quantity: 1, lineTotal: 8700, paymentStatus: 'PARTIAL' });
    await makeChainRefund(sale, { quantity: 1, consumed: 9700 });

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
    const original = await db.salesTransaction.findUnique({ where: { id: sale.id } });
    expect(must(original).paymentStatus).toBe('PARTIAL');
  });

  it('a repaired sale is REFUNDED — the double repair is refused (NOT_REFUNDABLE)', async () => {
    const product = await makeTestProduct(10);
    const sale = await makeInclusiveSale(product, { quantity: 1, lineTotal: 4600, paymentStatus: 'PARTIAL' });
    await makeChainRefund(sale, { quantity: 1, consumed: 4600 });

    const first = await healStrandedOriginal(db, {
      originalId: sale.id,
      storeId: STORE_ID,
      organizationId: ORG_ID,
      actorUserId: ACTOR_ID,
    });
    expect(first.mode).toBe('REPAIRED');

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

  it('the stranded remainder still answers HEALED (the v2.373.0 law, unchanged)', async () => {
    const product = await makeTestProduct(10);
    // VAT-ON-TOP: lines 7,500 under an 8,700 header; the chain consumes
    // the lines only → 1,200 stranded. The money path fires, mode HEALED.
    const suffix = Math.random().toString(36).slice(2, 12).toUpperCase();
    const tx = await db.salesTransaction.create({
      data: {
        storeId: STORE_ID,
        receiptNumber: `MBM-TEST-${suffix}`,
        cashierId: ACTOR_ID,
        subtotal: 7500,
        taxAmount: 1200,
        totalAmount: 8700,
        paymentMethod: 'CASH',
        paymentStatus: 'PARTIAL',
        transactionType: 'SALE',
        items: {
          create: {
            productId: product.id,
            productName: 'REPAIR-TEST line',
            quantity: 1,
            unitType: 'PIECE',
            pricePerUnit: 100,
            costPrice: 60,
            discountPercent: 0,
            taxRate: 16,
            lineTotal: 7500,
            isRentalItem: false,
          },
        },
      },
      include: { items: true },
    });
    createdTransactionIds.push(tx.id);
    await db.payment.create({
      data: { storeId: STORE_ID, transactionId: tx.id, paymentMethod: 'CASH', amount: 8700, currency: 'KES', status: 'COMPLETED' },
    });
    const sale: FixtureSale = { id: tx.id, receiptNumber: tx.receiptNumber, items: tx.items.map((i) => ({ id: i.id, productId: i.productId })) };
    await makeChainRefund(sale, { quantity: 1, consumed: 7500 });

    const result = await healStrandedOriginal(db, {
      originalId: sale.id,
      storeId: STORE_ID,
      organizationId: ORG_ID,
      actorUserId: ACTOR_ID,
    });
    expect(result.mode).toBe('HEALED');
    expect(result.refund).not.toBeNull();
    expect(result.refundTotal).toBe(1200);
    expect(must(result.refund).transactionType).toBe('REFUND');
  });

  it('the epsilon boundary: a 1-cent remainder is STRANDED (money, not a status lie)', async () => {
    const product = await makeTestProduct(10);
    // consumed 8699.99 of 8700 → remainder 0.01 > 0.004 → HEALED, not REPAIRED.
    const sale = await makeInclusiveSale(product, { quantity: 1, lineTotal: 8700, paymentStatus: 'PARTIAL' });
    await makeChainRefund(sale, { quantity: 1, consumed: 8699.99 });

    const result = await healStrandedOriginal(db, {
      originalId: sale.id,
      storeId: STORE_ID,
      organizationId: ORG_ID,
      actorUserId: ACTOR_ID,
    });
    expect(result.mode).toBe('HEALED');
    expect(result.refundTotal).toBe(0.01);
  });
});
