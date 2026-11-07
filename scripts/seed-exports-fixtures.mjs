#!/usr/bin/env node
/**
 * seed-exports-fixtures.mjs — THE EXPORTS FIXTURE WORLD (v2.436.0, dev-only).
 *
 * The data-exports desk has answered an honest EMPTY pile on every fresh
 * world since its lenses shipped: the seed writes zero DataExport rows,
 * so `?exp-status=` and `?exp-type=` (the desk's two words) had nothing
 * to wear — every word answered zero rows, and the off-union story the
 * Task 104 carry kept naming (the exports fixture's PAYROLL row) had no
 * row to be honest about. This fixture lights the desk END TO END on the
 * local dev database:
 *   • twelve DataExport history rows: one per each of the TEN card types
 *     (speaking both lenses — 8 completed, 2 failed, 1 processing), PLUS
 *     the TWO off-union faces the schema's own column comment keeps
 *     (PAYROLL completed, ALL failed — "the off-wire fixture row", the
 *     debt's deliberate pin: the type lens answers them under NO card
 *     word and the badge says so, never a card they never wore),
 *   • every COMPLETED row carries REAL inline CSV content (the download
 *     endpoint's preferred source) so the rows are downloadable exactly
 *     as real ones are — the fixture-fidelity law: a history row that
 *     lies about its file is not fidelity,
 *   • the coherence law kept exactly as the POST route writes them
 *     (COMPLETED → completedAt + expiresAt +7d; FAILED → errorMessage;
 *     PROCESSING → neither).
 *
 * THE SEED-PASSWORD LAW is not engaged here (no users are touched).
 * Idempotent: every row is found by its marker key inside the free-form
 * filters JSON before an upsert — a re-run refreshes the same rows,
 * never duplicates. The filters field is never rendered by the history
 * table, so the marker stays invisible on the desk.
 *
 * Usage:
 *   NODE_ENV=development DATABASE_URL=file:/home/z/ems/db/audit-dev.db \
 *     node scripts/seed-exports-fixtures.mjs
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const MARKER = 'exports-world-fixture';
const key = (k) => JSON.stringify({ [MARKER]: true, key: k });
const daysFromNow = (n) => new Date(Date.now() + n * 24 * 60 * 60 * 1000);
const daysAgo = (n) => new Date(Date.now() - n * 24 * 60 * 60 * 1000);

// the twelve rows: [key, exportType, format, status, recordCount, daysAgo]
// coherence law: COMPLETED → completedAt + content + expiresAt (+7d);
// FAILED → errorMessage; PROCESSING → neither.
const ROWS = [
  ['products-completed', 'PRODUCTS', 'CSV', 'COMPLETED', 80, 3],
  ['customers-completed', 'CUSTOMERS', 'CSV', 'COMPLETED', 25, 3],
  ['transactions-completed', 'TRANSACTIONS', 'JSON', 'COMPLETED', 412, 2],
  ['debt-failed', 'DEBT', 'CSV', 'FAILED', 0, 2],
  ['inventory-completed', 'INVENTORY', 'CSV', 'COMPLETED', 96, 2],
  ['employees-completed', 'EMPLOYEES', 'CSV', 'COMPLETED', 16, 1],
  ['suppliers-completed', 'SUPPLIERS', 'CSV', 'COMPLETED', 12, 1],
  ['loyalty-processing', 'LOYALTY', 'JSON', 'PROCESSING', 0, 1],
  ['tax-completed', 'TAX', 'CSV', 'COMPLETED', 54, 1],
  ['sales-summary-completed', 'SALES_SUMMARY', 'CSV', 'COMPLETED', 31, 1],
  // the off-union faces — the schema's column comment keeps both
  // spellings; the ten cards no longer speak them (the deliberate pin).
  ['payroll-off-union', 'PAYROLL', 'CSV', 'COMPLETED', 16, 4],
  ['all-off-union', 'ALL', 'JSON', 'FAILED', 0, 4],
];

const csvFor = (type, n) =>
  `# ${type} — fixture world row (v2.436.0)\nid,name,amount\nfw-001,fixture line one,100.00\nfw-002,fixture line two,${n}.00\n`;

async function main() {
  const store = await prisma.store.findFirst({ orderBy: { createdAt: 'asc' } });
  if (!store) {
    console.error('fixture seed needs at least one store in the seeded world');
    process.exit(1);
  }
  const admin = await prisma.user.findFirst({ where: { role: 'SUPER_ADMIN' } });
  if (!admin) {
    console.error('fixture seed needs a SUPER_ADMIN to author the history rows');
    process.exit(1);
  }

  for (const [k, exportType, format, status, recordCount, ago] of ROWS) {
    const completed = status === 'COMPLETED';
    const failed = status === 'FAILED';
    const content = completed
      ? format === 'JSON'
        ? JSON.stringify({ type: exportType, records: recordCount, fixture: MARKER }, null, 2)
        : csvFor(exportType, recordCount)
      : null;
    const existing = await prisma.dataExport.findFirst({
      where: { filters: { contains: `"key":"${k}"` } },
    });
    const data = {
      storeId: store.id,
      createdById: admin.id,
      exportType,
      format,
      filters: key(k),
      dateFrom: daysAgo(ago + 7),
      dateTo: daysAgo(ago),
      recordCount,
      fileSizeBytes: content ? Buffer.byteLength(content) : 0,
      filePath: completed ? `${MARKER}/${k}.${format === 'JSON' ? 'json' : 'csv'}` : null,
      content,
      status,
      errorMessage: failed
        ? 'The ledger moved while the file was written — re-run the export.'
        : null,
      expiresAt: completed ? daysFromNow(7) : null,
      completedAt: completed ? daysAgo(ago) : null,
    };
    if (existing) {
      await prisma.dataExport.update({ where: { id: existing.id }, data });
    } else {
      await prisma.dataExport.create({ data });
    }
  }

  const offUnion = ROWS.filter(([, t]) => t === 'PAYROLL' || t === 'ALL').length;
  console.log(
    `exports fixture world lit: ${ROWS.length} history rows ` +
      `(8 completed, 2 failed, 1 processing, ${offUnion} off-union: PAYROLL + ALL) → store ${store.id}`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
