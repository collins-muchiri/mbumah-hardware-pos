// AUDIT REMEDIATION (v2.307.0) - PostgreSQL-gated concurrency tests.
//
// The audit's PHASE 8 note: SQLite serializes writes and can mask race
// conditions that appear under PostgreSQL. These tests exercise the checkout
// financial-integrity contracts against a REAL PostgreSQL server with two
// INDEPENDENT Prisma connections so transactions genuinely interleave.
//
// HOW TO RUN:
//   • They are SKIPPED unless TEST_PG_URL is set (local default) - the
//     sandbox has no PostgreSQL server.
//   • CI provides a postgres:16 service container and sets TEST_PG_URL +
//     TEST_PG_SCHEMA_READY (see .github/workflows/ci-cd.yml job
//     `concurrency-postgres`), so they run for real on every PR.
//
//   TEST_PG_URL=postgresql://postgres:postgres@localhost:5432/mbumah_test
//
// Financial integrity assertions are explicit: exactly one winner, stock
// never negative, no duplicate sale per idempotency key, no duplicate
// receipt number.

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { PrismaClient } from '@prisma/client';

const TEST_PG_URL = process.env.TEST_PG_URL || '';
// Two independent connections - the whole point is that transactions from
// separate clients can interleave on the server, which a single SQLite
// connection can never demonstrate.
const pg = TEST_PG_URL
  ? new PrismaClient({ datasources: { db: { url: TEST_PG_URL } } })
  : null;
const pg2 = TEST_PG_URL
  ? new PrismaClient({ datasources: { db: { url: TEST_PG_URL } } })
  : null;

const STORE_ID = 'store_juja_main';
const CASHIER_ID = 'user_super_admin';
const createdProductIds: string[] = [];

const d = TEST_PG_URL ? describe : describe.skip;

d('audit v2.307.0 - PostgreSQL concurrency (real server, independent connections)', () => {
  beforeAll(async () => {
    if (!pg || !pg2) return;
    // The CI job pushes the schema before running; verify connectivity.
    await pg.$queryRaw`SELECT 1`;
  });

  afterAll(async () => {
    if (!pg || !pg2) return;
    await pg.product.deleteMany({ where: { id: { in: createdProductIds } } }).catch(() => {});
    await pg.$disconnect();
    await pg2.$disconnect();
  });

  it('two simultaneous sales of the last unit: exactly one succeeds, stock never negative', async () => {
    if (!pg || !pg2) return;
    const suffix = Math.random().toString(36).slice(2, 10);
    const product = await pg.product.create({
      data: {
        storeId: STORE_ID,
        name: `AUDITPG-TEST ${suffix}`,
        sku: `AUDPG-${suffix}`,
        pricePerUnit: 150,
        costPrice: 100,
        quantityInStock: 1,
        unitType: 'PIECE',
        isActive: true,
        reorderLevel: 1,
      } as never,
    });
    createdProductIds.push(product.id);

    // The checkout route's in-tx conditional-decrement contract, executed on
    // two SEPARATE connections so both claims are in flight together.
    const attempt = (client: PrismaClient) =>
      client.$transaction(async (tx) => {
        const claim = await tx.product.updateMany({
          where: { id: product.id, quantityInStock: { gte: 1 } },
          data: { quantityInStock: { decrement: 1 } },
        });
        if (claim.count === 0) throw new Error('INSUFFICIENT_STOCK');
        return 'SOLD';
      });

    const results = await Promise.allSettled([attempt(pg), attempt(pg2)]);
    const fulfilled = results.filter((r) => r.status === 'fulfilled');
    const rejected = results.filter((r) => r.status === 'rejected');

    expect(fulfilled).toHaveLength(1);
    expect(rejected).toHaveLength(1);

    const after = await pg.product.findUnique({ where: { id: product.id }, select: { quantityInStock: true } });
    if (!after) throw new Error('product row missing after PG race');
    expect(Number(after.quantityInStock)).toBe(0);
  });

  it('duplicate idempotency keys across concurrent checkouts create exactly one sale row', async () => {
    if (!pg || !pg2) return;
    const key = `audit-pg-idem-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const receipt = `MBM-PGTEST-${Math.random().toString(36).slice(2, 12).toUpperCase()}`;

    const base = {
      storeId: STORE_ID,
      receiptNumber: receipt,
      cashierId: CASHIER_ID,
      subtotal: 100,
      taxAmount: 16,
      totalAmount: 116,
      paymentMethod: 'CASH',
      paymentStatus: 'COMPLETED',
      transactionType: 'SALE' as const,
      idempotencyKey: key,
    };

    const results = await Promise.allSettled([
      pg.salesTransaction.create({ data: base }),
      pg2.salesTransaction.create({ data: base }),
    ]);

    const fulfilled = results.filter((r) => r.status === 'fulfilled');
    expect(fulfilled).toHaveLength(1);

    const rows = await pg.salesTransaction.count({ where: { idempotencyKey: key } });
    expect(rows).toBe(1);

    // Cleanup for this test's own row.
    const created = fulfilled[0] as PromiseFulfilledResult<{ id: string }>;
    await pg.salesTransaction.delete({ where: { id: created.value.id } }).catch(() => {});
  });
});
