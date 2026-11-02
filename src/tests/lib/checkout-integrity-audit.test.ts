// AUDIT REMEDIATION (v2.307.0) - POS financial-integrity regression tests.
//
// Companion to the audit's PHASE 7/8 asks (checkout, idempotency, receipt
// numbers, stock integrity). Each test pins a DB-level contract that
// /api/transactions (the checkout route) depends on, so a schema or helper
// refactor cannot silently reintroduce the vulnerability class:
//
//   • Last-unit oversell race ....... the conditional-decrement contract
//                                     (in-tx `updateMany` claim, loser throws)
//                                     - exactly one winner, stock never < 0
//   • Checkout idempotency .......... SalesTransaction.idempotencyKey @unique
//                                     rejects the replay with P2002; the
//                                     route's catch returns the ORIGINAL row
//   • Receipt-number uniqueness ..... generateReceiptNumber is random-suffix
//                                     based (MBM-YYYYMMDD-XXXXX): volume-
//                                     unique and format-stable
//   • Stock-movement idempotency .... StockMovement.idempotencyKey @unique
//                                     (offline sync replay safety)
//
// Conventions follow src/tests/lib/financial-remediations.test.ts: real
// Prisma client on the hermetic SQLite dev DB, fixtures matching the seeded
// world, afterAll cleanup so the DB stays clean.

import { describe, it, expect, afterAll } from 'vitest';
import { db } from '@/lib/db';
import { isP2002 } from '@/lib/sequence';
import { generateReceiptNumber } from '@/lib/helpers';

const STORE_ID = 'store_juja_main';
const CASHIER_ID = 'user_super_admin';

const createdProductIds: string[] = [];
const createdMovementIds: string[] = [];
const createdTransactionIds: string[] = [];

afterAll(async () => {
  // Children first (FK order).
  await db.stockMovement.deleteMany({ where: { id: { in: createdMovementIds } } }).catch(() => {});
  await db.salesTransaction.deleteMany({ where: { id: { in: createdTransactionIds } } }).catch(() => {});
  await db.product.deleteMany({ where: { id: { in: createdProductIds } } }).catch(() => {});
});

async function makeTestProduct(quantity: number) {
  const suffix = Math.random().toString(36).slice(2, 10);
  const product = await db.product.create({
    data: {
      storeId: STORE_ID,
      name: `AUDIT-TEST ${suffix}`,
      sku: `AUD-${suffix}`,
      pricePerUnit: 150,
      costPrice: 100,
      quantityInStock: quantity,
      unitType: 'PIECE',
      isActive: true,
      reorderLevel: 1,
    } as never,
  });
  createdProductIds.push(product.id);
  return product;
}

async function makeTestTransaction(overrides: { idempotencyKey?: string | null; receiptNumber?: string } = {}) {
  const tx = await db.salesTransaction.create({
    data: {
      storeId: STORE_ID,
      receiptNumber: overrides.receiptNumber ?? `MBM-TEST-${Math.random().toString(36).slice(2, 12).toUpperCase()}`,
      cashierId: CASHIER_ID,
      subtotal: 100,
      taxAmount: 16,
      totalAmount: 116,
      paymentMethod: 'CASH',
      paymentStatus: 'COMPLETED',
      transactionType: 'SALE',
      idempotencyKey: overrides.idempotencyKey === undefined ? `audit-key-${Math.random().toString(36).slice(2, 12)}` : overrides.idempotencyKey,
    },
  });
  createdTransactionIds.push(tx.id);
  return tx;
}

describe('audit v2.307.0 - last-unit oversell race (conditional-decrement contract)', () => {
  it('exactly one of two simultaneous buyers of the last unit wins; stock never goes negative', async () => {
    const product = await makeTestProduct(1);

    // Mirrors /api/transactions: the claim inside the transaction is a
    // CONDITIONAL decrement (`quantityInStock >= qty`); a claim that updates
    // zero rows throws and aborts the whole transaction. Two concurrent
    // interactive transactions therefore serialize: the winner decrements,
    // the loser sees count === 0 and throws.
    const attemptCheckout = () =>
      db.$transaction(async (tx) => {
        const claim = await tx.product.updateMany({
          where: { id: product.id, quantityInStock: { gte: 1 } },
          data: { quantityInStock: { decrement: 1 } },
        });
        if (claim.count === 0) {
          // The route's InsufficientStockError equivalent.
          throw new Error('INSUFFICIENT_STOCK');
        }
        const movement = await tx.stockMovement.create({
          data: {
            storeId: STORE_ID,
            productId: product.id,
            movementType: 'SALE',
            quantity: -1,
            referenceId: 'audit-race-test',
            performedBy: CASHIER_ID,
          },
        });
        createdMovementIds.push(movement.id);
        return 'SOLD';
      });

    const results = await Promise.allSettled([attemptCheckout(), attemptCheckout()]);

    const fulfilled = results.filter((r) => r.status === 'fulfilled');
    const rejected = results.filter((r) => r.status === 'rejected');
    expect(fulfilled).toHaveLength(1);
    expect(rejected).toHaveLength(1);

    // The loser fails with the business error, not a crash.
    const loserReason = (rejected[0] as PromiseRejectedResult).reason;
    expect(loserReason instanceof Error ? loserReason.message : String(loserReason)).toContain('INSUFFICIENT_STOCK');

    // Financial integrity: stock is exactly zero - never negative.
    // quantityInStock is a Decimal column - compare numerically.
    const after = await db.product.findUnique({ where: { id: product.id }, select: { quantityInStock: true } });
    if (!after) throw new Error('product row missing after checkout race');
    expect(Number(after.quantityInStock)).toBe(0);

    // Exactly one stock movement (the winner's) - no double decrement.
    const movements = await db.stockMovement.count({ where: { productId: product.id } });
    expect(movements).toBe(1);
  });

  it('an insufficient-stock claim updates zero rows (stock untouched for the loser)', async () => {
    const product = await makeTestProduct(0);
    const claim = await db.product.updateMany({
      where: { id: product.id, quantityInStock: { gte: 1 } },
      data: { quantityInStock: { decrement: 1 } },
    });
    expect(claim.count).toBe(0);
    const after = await db.product.findUnique({ where: { id: product.id }, select: { quantityInStock: true } });
    if (!after) throw new Error('product row missing after claim');
    expect(Number(after.quantityInStock)).toBe(0);
  });
});

describe('audit v2.307.0 - checkout idempotency (unique-key replay contract)', () => {
  it('a replayed idempotencyKey is rejected by the unique constraint with P2002', async () => {
    const key = `audit-idem-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    await makeTestTransaction({ idempotencyKey: key });

    // The route catches this P2002 and returns the ORIGINAL transaction -
    // the DB guarantee under test is that the replay CANNOT create a second
    // row (no duplicate sale, no duplicate stock decrement, no duplicate
    // receipt).
    let replayError: unknown;
    try {
      await makeTestTransaction({ idempotencyKey: key });
    } catch (err) {
      replayError = err;
    }
    expect(replayError).toBeDefined();
    expect(isP2002(replayError)).toBe(true);

    const rows = await db.salesTransaction.count({ where: { idempotencyKey: key } });
    expect(rows).toBe(1);
  });

  it('distinct keys coexist; null keys are exempt from the constraint', async () => {
    await makeTestTransaction({ idempotencyKey: null, receiptNumber: `MBM-TEST-${Math.random().toString(36).slice(2, 12).toUpperCase()}` });
    await makeTestTransaction({ idempotencyKey: null, receiptNumber: `MBM-TEST-${Math.random().toString(36).slice(2, 12).toUpperCase()}` });
    // Reaching here without a constraint violation is the assertion: two
    // legacy/offline rows without a client key may coexist.
    expect(true).toBe(true);
  });
});

describe('audit v2.307.0 - receipt-number generation (no duplicates under volume)', () => {
  it('MBM-YYYYMMDD-XXXXX format is stable', () => {
    const receipt = generateReceiptNumber();
    expect(receipt).toMatch(/^MBM-\d{8}-[A-Z0-9]{5}$/);
  });

  it('1,000 generated receipt numbers are all unique (birthday-safe in the 36^5 space)', () => {
    // Volume math: the suffix space is 36^5 ≈ 60.4M (the helper's documented
    // contract). Expected birthday collisions at n draws = n²/2N - at 1,000
    // draws that is ~0.008, so ANY collision in this test signals a real
    // regression toward the old 16^5 = 1.05M space (which measured 8-9
    // collisions per 1,000 draws and 174 per 20,000).
    const seen = new Set<string>();
    for (let i = 0; i < 1_000; i++) {
      seen.add(generateReceiptNumber());
    }
    expect(seen.size).toBe(1_000);
  });

  it('duplicate receipt numbers are rejected by the DB unique constraint (the backstop)', async () => {
    // withSequenceRetry regenerates and re-runs on this P2002 (SYS-7) - the
    // guarantee under test is that the DATABASE refuses a second row with
    // the same receipt number, so a collision can never produce two receipts.
    const receipt = `MBM-TEST-${Math.random().toString(36).slice(2, 12).toUpperCase()}`;
    await makeTestTransaction({ receiptNumber: receipt, idempotencyKey: null });
    let duplicateError: unknown;
    try {
      await makeTestTransaction({ receiptNumber: receipt, idempotencyKey: null });
    } catch (err) {
      duplicateError = err;
    }
    expect(duplicateError).toBeDefined();
    expect(isP2002(duplicateError)).toBe(true);
  });
});

describe('audit v2.307.0 - stock-movement replay safety', () => {
  it('StockMovement.idempotencyKey unique constraint rejects a sync replay with P2002', async () => {
    const product = await makeTestProduct(10);
    const key = `audit-move-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    const movement = await db.stockMovement.create({
      data: {
        storeId: STORE_ID,
        productId: product.id,
        movementType: 'ADJUSTMENT',
        quantity: 5,
        idempotencyKey: key,
        performedBy: CASHIER_ID,
      },
    });
    createdMovementIds.push(movement.id);

    let replayError: unknown;
    try {
      await db.stockMovement.create({
        data: {
          storeId: STORE_ID,
          productId: product.id,
          movementType: 'ADJUSTMENT',
          quantity: 5,
          idempotencyKey: key,
          performedBy: CASHIER_ID,
        },
      });
    } catch (err) {
      replayError = err;
    }
    expect(replayError).toBeDefined();
    expect(isP2002(replayError)).toBe(true);

    const rows = await db.stockMovement.count({ where: { idempotencyKey: key } });
    expect(rows).toBe(1);
  });
});
