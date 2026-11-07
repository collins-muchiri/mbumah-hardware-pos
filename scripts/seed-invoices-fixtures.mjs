#!/usr/bin/env node
/**
 * seed-invoices-fixtures.mjs — THE INVOICE FIXTURE WORLD (v2.452.0, dev-only).
 *
 * The invoices desk answered every QA burst honestly empty: db:fixtures
 * stood up the M-Pesa ledger, the exports world and the KRA/e-TIMS parade,
 * but no Invoice row ever — the register rendered its empty state each
 * time (the v2.451.0 carry: the sweep's invoice seat was byte-pinned and
 * the coercion pattern live-proven on its sibling desks, FIXTURE-BLOCKED
 * here). This fixture lights the register END TO END on the local dev
 * database:
 *   • eleven witnesses — every invoiceType wears a row (INVOICE,
 *     QUOTATION, PROFORMA, CREDIT_NOTE, DEBIT_NOTE) and the register's
 *     statuses wear rows too (PAID, SENT, DRAFT, CANCELLED, INVOICED —
 *     EXPIRED rides the quotation, where the lazy expiry law writes it),
 *   • the money bait: the six INVOICE totals are distinct AND their
 *     lexicographic order differs from their numeric order ("1200.5"
 *     sorts before "120000" lexicographically, after it numerically) —
 *     the walk that catches a string/string comparator is one press
 *     away, so the v2.451.0 coercion seat keeps its LIVE proof forever,
 *   • the lazy-expiry law is spoken by the seeds, not fought: living
 *     quotations carry FUTURE due dates (the GET route's
 *     expireStaleQuotes only reaches past-due DRAFTs and SENTs), and the
 *     one past-due quotation already wears EXPIRED — the desk's own
 *     auto-expiry face, honestly seeded.
 *
 * THE SEED-PASSWORD LAW is not engaged here (no users are touched).
 * Idempotent: every row is found by its invoiceNumber before a write —
 * a re-run refreshes the same rows (the items are re-created from the
 * table), never duplicates.
 *
 * Usage:
 *   NODE_ENV=development DATABASE_URL=file:/home/z/ems/db/audit-dev.db \
 *     node scripts/seed-invoices-fixtures.mjs
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const daysAgo = (n) => new Date(Date.now() - n * 24 * 60 * 60 * 1000);

// The eleven witnesses. Each row's money is COHERENT by construction:
// lineTotal = quantity × pricePerUnit; subtotal = Σ lineTotal; tax =
// subtotal × taxRate / 100; total = subtotal + tax − discount. The six
// INVOICE totals are the money bait (distinct, lexicographic ≠ numeric:
// 725.75, 1200.5, 9500, 14500, 45000, 120000).
//   dueAgo > 0 → the due date sits in the PAST; dueAgo < 0 → ahead.
const ROWS = [
  { num: 'INV-FIX-001', type: 'INVOICE', status: 'PAID', customer: 'Juja Hardware Traders', phone: '0712000001', issueAgo: 40, dueAgo: 25, taxRate: 16, discount: 0, note: 'Fixture row 1 — the VAT face: 12,500 + 16% = 14,500.', items: [['Premium Claw Hammer', 2, 6250]] },
  { num: 'INV-FIX-002', type: 'INVOICE', status: 'SENT', customer: 'Thika School Board', phone: '0712000002', issueAgo: 12, dueAgo: -18, taxRate: 0, discount: 0, note: null, items: [['Solar Water Pump', 1, 120000]] },
  { num: 'INV-FIX-003', type: 'INVOICE', status: 'DRAFT', customer: 'Walk-in Customer', phone: null, issueAgo: 3, dueAgo: null, taxRate: 0, discount: 0, note: null, items: [['Cement Bag 50kg', 4, 2375]] },
  { num: 'INV-FIX-004', type: 'INVOICE', status: 'CANCELLED', customer: 'Kenol Filling Station', phone: '0712000004', issueAgo: 30, dueAgo: 15, taxRate: 0, discount: 0, note: 'Fixture row 4 — cancelled before delivery.', items: [['Gate Hinge Set', 1, 1200.5]] },
  { num: 'INV-FIX-005', type: 'INVOICE', status: 'INVOICED', customer: 'Ruiru Contractors Ltd', phone: '0712000005', issueAgo: 20, dueAgo: -10, taxRate: 0, discount: 0, note: null, items: [['Rain Roof Sheet', 3, 15000]] },
  { num: 'INV-FIX-006', type: 'INVOICE', status: 'PAID', customer: 'Mwangi Farm Supplies', phone: '0712000006', issueAgo: 6, dueAgo: -14, taxRate: 0, discount: 0, note: null, items: [['Rubber Door Stopper', 1, 725.75]] },
  { num: 'QUO-FIX-001', type: 'QUOTATION', status: 'SENT', customer: 'Thika School Board', phone: '0712000002', issueAgo: 5, dueAgo: -18, taxRate: 0, discount: 0, note: 'Fixture row 7 — a LIVING quotation: the due date sits ahead, so the lazy expiry never touches it.', items: [['Classroom Blackboard', 2, 32000]] },
  { num: 'QUO-FIX-002', type: 'QUOTATION', status: 'EXPIRED', customer: 'Kilimani Flatscaretakers', phone: '0712000008', issueAgo: 36, dueAgo: 6, taxRate: 0, discount: 0, note: 'Fixture row 8 — the auto-expiry face: past due, already wearing EXPIRED, exactly what expireStaleQuotes writes.', items: [['Security Floodlight', 1, 28000]] },
  { num: 'PRO-FIX-001', type: 'PROFORMA', status: 'DRAFT', customer: 'Ruiru Contractors Ltd', phone: '0712000005', issueAgo: 2, dueAgo: -25, taxRate: 0, discount: 0, note: null, items: [['Industrial Trolley', 6, 5100]] },
  { num: 'CRN-FIX-001', type: 'CREDIT_NOTE', status: 'PAID', customer: 'Juja Hardware Traders', phone: '0712000001', issueAgo: 8, dueAgo: null, taxRate: 0, discount: 0, note: 'Fixture row 10 — the returned tile.', items: [['Ceramic Tile (returned)', 1, 2000]] },
  { num: 'DBN-FIX-001', type: 'DEBIT_NOTE', status: 'DRAFT', customer: 'Kenol Filling Station', phone: '0712000004', issueAgo: 4, dueAgo: null, taxRate: 0, discount: 0, note: null, items: [['Fuel Pump Hose', 2, 2700]] },
];

async function main() {
  // the fixture world speaks ONE store: the same one the other fixture
  // worlds use (the first store), so the QA bursts share one world.
  const store = await prisma.store.findFirst({ orderBy: { createdAt: 'asc' } });
  if (!store) {
    console.error('fixture seed needs at least one store in the seeded world');
    process.exit(1);
  }

  for (const row of ROWS) {
    const lines = row.items.map(([name, qty, price]) => ({
      productName: name,
      quantity: qty,
      pricePerUnit: price,
      taxRate: row.taxRate,
      lineTotal: Math.round(qty * price * 100) / 100,
    }));
    const subtotal = Math.round(lines.reduce((s, l) => s + l.lineTotal, 0) * 100) / 100;
    const tax = Math.round(((subtotal * row.taxRate) / 100) * 100) / 100;
    const total = Math.round((subtotal + tax - row.discount) * 100) / 100;

    const data = {
      storeId: store.id,
      invoiceType: row.type,
      customerName: row.customer,
      customerPhone: row.phone,
      issueDate: daysAgo(row.issueAgo),
      dueDate: row.dueAgo === null ? null : daysAgo(row.dueAgo),
      subtotal,
      taxAmount: tax,
      discountAmount: row.discount,
      totalAmount: total,
      status: row.status,
      notes: row.note,
      terms: null,
      createdAt: daysAgo(row.issueAgo),
    };

    const existing = await prisma.invoice.findFirst({ where: { invoiceNumber: row.num } });
    if (existing) {
      await prisma.invoice.update({
        where: { id: existing.id },
        data: { ...data, items: { deleteMany: {}, create: lines } },
      });
    } else {
      await prisma.invoice.create({
        data: { ...data, invoiceNumber: row.num, items: { create: lines } },
      });
    }
  }

  const bait = ROWS
    .filter((r) => r.type === 'INVOICE')
    .map((r) => {
      // the same math the rows write: subtotal + the VAT face — the
      // summary line must print the register's TOTALS, not its subtotals
      const sub = Math.round(r.items.reduce((s, [, q, p]) => s + q * p, 0) * 100) / 100;
      const tax = Math.round(((sub * r.taxRate) / 100) * 100) / 100;
      return Math.round((sub + tax) * 100) / 100;
    });
  console.log(
    `invoice fixture world lit: ${ROWS.length} witnesses (5 types, ` +
      `${new Set(ROWS.map((r) => r.status)).size} statuses) → store ${store.id}; ` +
      `register totals ${bait.join(', ')} — lexicographic ≠ numeric, the bait is set`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
