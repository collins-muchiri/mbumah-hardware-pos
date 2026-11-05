#!/usr/bin/env node
/**
 * seed-mpesa-fixtures.mjs — THE MPESA FIXTURE WORLD (v2.396.0, dev-only).
 *
 * The M-Pesa lens has answered a two-word pile since it shipped: every
 * row derived PENDING or MATCHED from isReconciled, so the lens's
 * UNMATCHED and DISPUTED words never had a row to wear — selecting them
 * honestly answered an empty pile (the Task 104/105 fixture-fidelity
 * carry). This fixture lights the lens END TO END on the local dev
 * database:
 *   • one MPESA bank account (idempotent upsert by its accountNumber),
 *   • nine MPESA_IN / MPESA_OUT transactions speaking ALL FOUR statuses
 *     through the STORED vocabulary (2 MATCHED, 2 PENDING, 2 UNMATCHED,
 *     1 DISPUTED) plus one legacy row with a NULL status (the derived
 *     fallback face — the honest legacy story stays observable) and one
 *     extra PENDING row for the actions QA (the Dispute / Match walk),
 *   • the stored status and isReconciled kept coherent exactly as the
 *     PATCH route writes them (MATCHED → true + reconciledAt; every
 *     other status → false + reconciledAt null).
 *
 * THE SEED-PASSWORD LAW is not engaged here (no users are touched).
 * Idempotent: every row is found by its reference before an upsert —
 * a re-run refreshes the same rows, never duplicates.
 *
 * Usage:
 *   NODE_ENV=development DATABASE_URL=file:/home/z/ems/db/audit-dev.db \
 *     node scripts/seed-mpesa-fixtures.mjs
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const ACCOUNT_NUMBER = 'MPESA-FIXTURE-01';
const STORE_PREFIX = 'store_';
const REF = (n) => `MPX-FIX-${String(n).padStart(3, '0')}`;
const daysAgo = (n) => new Date(Date.now() - n * 24 * 60 * 60 * 1000);

// the nine rows: [refNo, type, amount, daysAgo, storedStatus]
// coherence law: MATCHED → isReconciled true + reconciledAt; else false + null.
const ROWS = [
  [1, 'MPESA_IN', 12500, 40, 'MATCHED'],
  [2, 'MPESA_OUT', 3400, 38, 'MATCHED'],
  [3, 'MPESA_IN', 8200, 12, 'PENDING'],
  [4, 'MPESA_OUT', 1550, 10, 'PENDING'],
  [5, 'MPESA_IN', 4100, 55, 'UNMATCHED'],
  [6, 'MPESA_OUT', 980, 52, 'UNMATCHED'],
  [7, 'MPESA_IN', 22300, 20, 'DISPUTED'],
  [8, 'MPESA_OUT', 640, 8, null], // the legacy face: derived, never stored
  [9, 'MPESA_IN', 775, 5, 'PENDING'], // the actions-QA row
];

async function main() {
  // the fixture world speaks ONE store: the same one the KRA fixtures
  // use (the first store), so the QA bursts share one world.
  const store = await prisma.store.findFirst({ orderBy: { createdAt: 'asc' } });
  if (!store) {
    console.error('fixture seed needs at least one store in the seeded world');
    process.exit(1);
  }

  let account = await prisma.bankAccount.findFirst({
    where: { accountNumber: ACCOUNT_NUMBER },
  });
  if (!account) {
    account = await prisma.bankAccount.create({
      data: {
        bankName: 'M-Pesa',
        accountName: 'M-Pesa Wallet (fixtures)',
        accountNumber: ACCOUNT_NUMBER,
        accountType: 'MPESA',
        currentBalance: 0,
        storeId: store.id,
        isActive: true,
      },
    });
  }

  let balance = 0;
  for (const [n, type, amount, ago, status] of ROWS) {
    const ref = REF(n);
    balance = type === 'MPESA_IN' ? balance + amount : balance - amount;
    const isMatched = status === 'MATCHED';
    const existing = await prisma.bankTransaction.findFirst({ where: { reference: ref } });
    const data = {
      bankAccountId: account.id,
      transactionType: type,
      amount,
      balanceAfter: balance,
      reference: ref,
      description: `M-Pesa fixture row ${n} — ${status ?? 'legacy (derived)'}`,
      transactionDate: daysAgo(ago),
      isReconciled: isMatched,
      reconciledAt: isMatched ? daysAgo(ago) : null,
      reconciliationStatus: status,
    };
    if (existing) {
      await prisma.bankTransaction.update({ where: { id: existing.id }, data });
    } else {
      await prisma.bankTransaction.create({ data });
    }
  }

  await prisma.bankAccount.update({
    where: { id: account.id },
    data: { currentBalance: balance },
  });

  console.log(
    `mpesa fixture world lit: 1 MPESA account (${account.id.slice(0, 14)}…), ${ROWS.length} transactions ` +
      `(2 MATCHED, 3 PENDING, 2 UNMATCHED, 1 DISPUTED, 1 legacy derived) → store ${store.id.startsWith(STORE_PREFIX) ? store.id : store.id}`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
