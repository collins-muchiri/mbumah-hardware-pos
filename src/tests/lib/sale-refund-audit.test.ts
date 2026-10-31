// v2.308.0 SALE REFUNDS - the transactional truth, on the hermetic house DB.
//
// Companion to src/tests/lib/checkout-integrity-audit.test.ts (same
// conventions: real Prisma client on the seeded SQLite dev DB, fixtures
// matching the seeded world, afterAll cleanup so the DB stays clean).
// These tests pin the DB-level contracts the refund route depends on:
//
//   • FULL refund .............. status flips REFUNDED, the refund chain
//                                sums to exactly totalAmount, stock is
//                                restored, a RETURN movement exists with an
//                                idempotency key, a Payment row exists, a
//                                Receipt row exists, the journal entry is
//                                REFUND-typed and balanced
//   • PARTIAL refunds .......... status PARTIAL until the chain exhausts,
//                                then REFUNDED - and stock gains exactly
//                                the refunded base units
//   • OVER-REFUND .............. the second refund of exhausted lines
//                                throws LINE_OVER_REFUND; nothing commits
//   • NON-REFUNDABLE ........... REFUND/VOID transactions and non-completed
//                                statuses are refused (NOT_REFUNDABLE)
//   • TENANT MISMATCH .......... a foreign storeId is refused
//   • RESTOCK=FALSE ............ no stock change, no movement, journal
//                                carries no COGS reversal
//   • PERMISSION MATRIX ........ hasFeaturePermission('pos.refund'):
//                                manager tier yes, cashier/accountant no

import { describe, it, expect, afterAll } from 'vitest';
import { db } from '@/lib/db';
import { applySaleRefund, RefundError } from '@/lib/sale-refund-service';
import { hasFeaturePermission } from '@/lib/permissions';
import { toDec } from '@/lib/utils/financialMath';

const STORE_ID = 'store_juja_main';
const ORG_ID = 'org_mbumah';
const ACTOR_ID = 'user_super_admin';

const createdProductIds: string[] = [];
const createdTransactionIds: string[] = [];
const createdMovementIds: string[] = [];

afterAll(async () => {
  // Children first (FK order); best-effort so a failing assert can't mask
  // the cleanup error either way - the house DB must stay clean.
  for (const txId of createdTransactionIds) {
    await db.journalEntry.deleteMany({ where: { referenceId: txId } }).catch(() => {});
    await db.cashDrawerLog.deleteMany({ where: { notes: { contains: txId } } }).catch(() => {});
  }
  await db.stockMovement.deleteMany({ where: { id: { in: createdMovementIds } } }).catch(() => {});
  await db.receipt.deleteMany({ where: { transactionId: { in: createdTransactionIds } } }).catch(() => {});
  await db.payment.deleteMany({ where: { transactionId: { in: createdTransactionIds } } }).catch(() => {});
  await db.salesTransaction.deleteMany({ where: { id: { in: createdTransactionIds } } }).catch(() => {});
  await db.salesTransaction.deleteMany({ where: { refundedTransactionId: { in: createdTransactionIds } } }).catch(() => {});
  await db.product.deleteMany({ where: { id: { in: createdProductIds } } }).catch(() => {});
});

async function makeTestProduct(quantity: number, opts: { conversionFactor?: number } = {}) {
  const suffix = Math.random().toString(36).slice(2, 10);
  const product = await db.product.create({
    data: {
      storeId: STORE_ID,
      name: `REFUND-TEST ${suffix}`,
      sku: `RFD-${suffix}`,
      pricePerUnit: 100,
      costPrice: 60,
      quantityInStock: quantity,
      unitType: 'PIECE',
      isActive: true,
      reorderLevel: 1,
      conversionFactor: opts.conversionFactor ?? 1,
    } as never,
  });
  createdProductIds.push(product.id);
  return product;
}

interface FixtureSale {
  id: string;
  items: { id: string; productId: string }[];
}

async function makeTestSale(
  product: { id: string },
  opts: { quantity?: number; lineTotal?: number; paymentMethod?: string } = {},
): Promise<FixtureSale> {
  const quantity = opts.quantity ?? 2;
  const lineTotal = opts.lineTotal ?? 232; // 2 × 100 @ 16% VAT-inclusive
  const suffix = Math.random().toString(36).slice(2, 12).toUpperCase();
  const tx = await db.salesTransaction.create({
    data: {
      storeId: STORE_ID,
      receiptNumber: `MBM-TEST-${suffix}`,
      cashierId: ACTOR_ID,
      subtotal: 200,
      taxAmount: 32,
      totalAmount: lineTotal,
      paymentMethod: opts.paymentMethod ?? 'CASH',
      paymentStatus: 'COMPLETED',
      transactionType: 'SALE',
      items: {
        create: {
          productId: product.id,
          productName: 'REFUND-TEST line',
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
  // The checkout writes a COMPLETED Payment row + a Receipt row; the refund
  // guards read the Payment rows (tender shares), so mirror checkout here.
  await db.payment.create({
    data: {
      storeId: STORE_ID,
      transactionId: tx.id,
      paymentMethod: opts.paymentMethod ?? 'CASH',
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
  return { id: tx.id, items: tx.items.map((i) => ({ id: i.id, productId: i.productId })) };
}

function must<T>(value: T | null | undefined, label: string): T {
  if (value == null) throw new Error(`test fixture missing: ${label}`);
  return value;
}

const stockOf = async (productId: string) => {
  const p = await db.product.findUnique({ where: { id: productId } });
  return toDec(must(p, 'product').quantityInStock as never).toNumber();
};

describe('v2.308.0 refunds - FULL refund (the atomic truth)', () => {
  it('flips the sale to REFUNDED, restores stock, and leaves a balanced audit trail', async () => {
    const product = await makeTestProduct(10);
    const stockBefore = await stockOf(product.id);
    const sale = await makeTestSale(product, { quantity: 2, lineTotal: 232 });

    const result = await applySaleRefund(db, {
      originalId: sale.id,
      storeId: STORE_ID,
      organizationId: ORG_ID,
      actorUserId: ACTOR_ID,
      requestedLines: [{ saleItemId: sale.items[0].id, quantity: 2 }],
      restock: true,
      reason: 'DEFECTIVE',
    });

    // The refund summary speaks the truth.
    expect(result.refund.transactionType).toBe('REFUND');
    expect(result.refund.totalAmount).toBe(232);
    expect(result.originalReceiptNumber).toMatch(/^MBM-/);
    expect(result.originalPaymentStatus).toBe('REFUNDED');
    expect(result.remainingRefundable).toBe(0);

    // The chain: a REFUND transaction linked back via refundedTransactionId,
    // its line linked to the ORIGINAL line via refundedSaleItemId.
    const refundTx = await db.salesTransaction.findUnique({
      where: { id: result.refund.id },
      include: { items: true, payments: true, receipt: true },
    });
    expect(must(refundTx).refundedTransactionId).toBe(sale.id);
    expect(must(refundTx).items[0].refundedSaleItemId).toBe(sale.items[0].id);
    // Prisma Decimal columns come back as Decimal instances - compare at number.
    expect(toDec(must(refundTx).items[0].quantity as never).toNumber()).toBe(2);
    expect(toDec(must(refundTx).items[0].lineTotal as never).toNumber()).toBe(232);
    expect(must(refundTx).payments).toHaveLength(1);
    expect(toDec(must(refundTx).payments[0].amount as never).toNumber()).toBe(232);
    expect(must(refundTx).payments[0].status).toBe('COMPLETED');
    expect(must(refundTx).receipt).toBeTruthy();

    // The original flipped.
    const original = await db.salesTransaction.findUnique({ where: { id: sale.id } });
    expect(must(original).paymentStatus).toBe('REFUNDED');

    // Stock: exactly the refunded base units came back.
    expect(await stockOf(product.id)).toBe(stockBefore + 2);

    // The movement ledger: a RETURN row keyed for replay safety, referencing
    // the ORIGINAL sale.
    const movement = await db.stockMovement.findFirst({
      where: { referenceId: sale.id, movementType: 'RETURN' },
    });
    expect(movement).toBeTruthy();
    createdMovementIds.push(must(movement).id);
    expect(toDec(must(movement).quantity as never).toNumber()).toBe(2);
    expect(must(movement).idempotencyKey).toContain('refund:');

    // The journal: REFUND-typed, balanced to the cent.
    const je = await db.journalEntry.findFirst({
      where: { referenceId: result.refund.id },
      include: { lines: true },
    });
    expect(must(je).referenceType).toBe('REFUND');
    const debits = must(je).lines.reduce((s, l) => s + Number(l.debit ?? 0), 0);
    const credits = must(je).lines.reduce((s, l) => s + Number(l.credit ?? 0), 0);
    expect(Math.abs(debits - credits)).toBeLessThanOrEqual(0.01);
    // Net revenue reversal + VAT reversal = the refunded consideration.
    expect(debits).toBeGreaterThanOrEqual(232 - 0.02);
  });
});

describe('v2.308.0 refunds - PARTIAL refunds (the chain exhausts honestly)', () => {
  it('flips the sale to PARTIAL first, REFUNDED only when the chain exhausts', async () => {
    const product = await makeTestProduct(10);
    const sale = await makeTestSale(product, { quantity: 4, lineTotal: 464 });

    // Tranche 1: one unit (116).
    const r1 = await applySaleRefund(db, {
      originalId: sale.id,
      storeId: STORE_ID,
      organizationId: ORG_ID,
      actorUserId: ACTOR_ID,
      requestedLines: [{ saleItemId: sale.items[0].id, quantity: 1 }],
      restock: true,
    });
    expect(r1.refundTotal).toBe(116);
    expect(r1.originalPaymentStatus).toBe('PARTIAL');

    // Tranche 2 + 3: the chain exhausts; the final status is REFUNDED and
    // the chain sums to EXACTLY the sale's totalAmount.
    const saleItems = await db.saleItem.findMany({ where: { transactionId: sale.id } });
    const r2 = await applySaleRefund(db, {
      originalId: sale.id,
      storeId: STORE_ID,
      organizationId: ORG_ID,
      actorUserId: ACTOR_ID,
      requestedLines: [{ saleItemId: saleItems[0].id, quantity: 3 }],
      restock: true,
    });
    expect(r2.refundTotal).toBe(348); // the REMAINING value, not a re-round
    expect(r2.originalPaymentStatus).toBe('REFUNDED');
    expect(r1.refundTotal + r2.refundTotal).toBe(464);

    // Stock gained exactly 4 base units across the chain.
    const movements = await db.stockMovement.findMany({
      where: { referenceId: sale.id, movementType: 'RETURN' },
    });
    movements.forEach((m) => createdMovementIds.push(m.id));
    const movedQty = movements.reduce((s, m) => s + toDec(m.quantity as never).toNumber(), 0);
    expect(movedQty).toBe(4);
  });
});

describe('v2.308.0 refunds - the guards (money can never be over-refunded)', () => {
  it('a second refund beyond the remaining lines throws LINE_OVER_REFUND and commits NOTHING', async () => {
    const product = await makeTestProduct(10);
    // A PARTIAL sale: 4 units, 2 refunded → 2 remain. Requesting 3 must hit
    // the line guard (the status is still PARTIAL, so the NOT_REFUNDABLE
    // status guard correctly does not fire first).
    const sale = await makeTestSale(product, { quantity: 4, lineTotal: 464 });
    await applySaleRefund(db, {
      originalId: sale.id,
      storeId: STORE_ID,
      organizationId: ORG_ID,
      actorUserId: ACTOR_ID,
      requestedLines: [{ saleItemId: sale.items[0].id, quantity: 2 }],
      restock: true,
    });
    const stockAfterFirst = await stockOf(product.id);
    const saleCountBefore = await db.salesTransaction.count({ where: { refundedTransactionId: sale.id } });

    try {
      await applySaleRefund(db, {
        originalId: sale.id,
        storeId: STORE_ID,
        organizationId: ORG_ID,
        actorUserId: ACTOR_ID,
        requestedLines: [{ saleItemId: sale.items[0].id, quantity: 3 }],
        restock: true,
      });
      expect.unreachable('must throw');
    } catch (err) {
      expect(err).toBeInstanceOf(RefundError);
      expect((err as RefundError).code).toBe('LINE_OVER_REFUND');
    }

    // The failed attempt left NO trace: no new refund row, no stock drift.
    const saleCountAfter = await db.salesTransaction.count({ where: { refundedTransactionId: sale.id } });
    expect(saleCountAfter).toBe(saleCountBefore);
    expect(await stockOf(product.id)).toBe(stockAfterFirst);
  });

  it('a REFUND transaction cannot be refunded again (NOT_REFUNDABLE)', async () => {
    const product = await makeTestProduct(10);
    const sale = await makeTestSale(product, { quantity: 1, lineTotal: 116 });
    const r = await applySaleRefund(db, {
      originalId: sale.id,
      storeId: STORE_ID,
      organizationId: ORG_ID,
      actorUserId: ACTOR_ID,
      requestedLines: [{ saleItemId: sale.items[0].id, quantity: 1 }],
      restock: true,
    });
    try {
      await applySaleRefund(db, {
        originalId: r.refund.id,
        storeId: STORE_ID,
        organizationId: ORG_ID,
        actorUserId: ACTOR_ID,
        requestedLines: [{ saleItemId: 'whatever', quantity: 1 }],
        restock: true,
      });
      expect.unreachable('must throw');
    } catch (err) {
      expect((err as RefundError).code).toBe('NOT_REFUNDABLE');
    }
  });

  it('a foreign store cannot refund another store\'s sale (TENANT_MISMATCH)', async () => {
    const product = await makeTestProduct(10);
    const sale = await makeTestSale(product, { quantity: 1, lineTotal: 116 });
    try {
      await applySaleRefund(db, {
        originalId: sale.id,
        storeId: 'store_some_other_branch',
        organizationId: ORG_ID,
        actorUserId: ACTOR_ID,
        requestedLines: [{ saleItemId: sale.items[0].id, quantity: 1 }],
        restock: true,
      });
      expect.unreachable('must throw');
    } catch (err) {
      expect((err as RefundError).code).toBe('TENANT_MISMATCH');
    }
  });

  it('a missing transaction answers NOT_FOUND', async () => {
    try {
      await applySaleRefund(db, {
        originalId: 'tx_does_not_exist',
        storeId: STORE_ID,
        organizationId: ORG_ID,
        actorUserId: ACTOR_ID,
        requestedLines: [{ saleItemId: 'x', quantity: 1 }],
        restock: true,
      });
      expect.unreachable('must throw');
    } catch (err) {
      expect((err as RefundError).code).toBe('NOT_FOUND');
    }
  });
});

describe('v2.308.0 refunds - restock=false (money moves, shelf does not)', () => {
  it('refunds the money without touching stock or writing a movement', async () => {
    const product = await makeTestProduct(10);
    const stockBefore = await stockOf(product.id);
    const sale = await makeTestSale(product, { quantity: 2, lineTotal: 232 });

    const result = await applySaleRefund(db, {
      originalId: sale.id,
      storeId: STORE_ID,
      organizationId: ORG_ID,
      actorUserId: ACTOR_ID,
      requestedLines: [{ saleItemId: sale.items[0].id, quantity: 2 }],
      restock: false,
    });

    expect(result.refundTotal).toBe(232);
    expect(result.restocked).toHaveLength(0);
    expect(await stockOf(product.id)).toBe(stockBefore);

    const movements = await db.stockMovement.findMany({ where: { referenceId: sale.id } });
    expect(movements).toHaveLength(0);

    // The journal still posts (money side) but carries NO inventory leg.
    const je = await db.journalEntry.findFirst({
      where: { referenceId: result.refund.id },
      include: { lines: true },
    });
    const inventoryLegs = must(je).lines.filter((l) => l.description?.includes('Inventory'));
    expect(inventoryLegs).toHaveLength(0);
  });
});

describe('v2.308.0 refunds - the permission matrix (manager tier only)', () => {
  it('cashiers and accountants cannot refund; managers and owners can', () => {
    expect(hasFeaturePermission('CASHIER', 'pos.refund')).toBe(false);
    expect(hasFeaturePermission('ACCOUNTANT', 'pos.refund')).toBe(false);
    expect(hasFeaturePermission('INVENTORY_MANAGER', 'pos.refund')).toBe(false);
    expect(hasFeaturePermission('BRANCH_MANAGER', 'pos.refund')).toBe(true);
    expect(hasFeaturePermission('STORE_OWNER', 'pos.refund')).toBe(true);
    expect(hasFeaturePermission('SUPER_ADMIN', 'pos.refund')).toBe(true);
  });
});
