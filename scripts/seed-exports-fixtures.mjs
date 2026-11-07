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
 *   • fifteen DataExport history rows: one per each of the TEN card types
 *     (speaking both lenses — 8 completed, 2 failed, 1 processing) PLUS
 *     the schema's own DEFAULT status face (one PENDING row — the one
 *     wire status the world never wore; the processing word's union
 *     covers it, so the lens answers it under `processing` and `all`,
 *     never stranded) PLUS the EXPIRED face (one COMPLETED row whose
 *     expiresAt is already PAST — expiry is time's own work, never a
 *     status change: the derived Expired badge speaks beside Completed,
 *     the download button goes disabled with its honest tooltip, the
 *     download endpoint answers 410 Gone, and the retention chip stays
 *     silent because the badge owns the past) PLUS the TWO off-union
 *     faces the schema's own column comment keeps (PAYROLL completed,
 *     ALL failed — "the off-wire fixture row", the debt's deliberate
 *     pin: the type lens answers them under NO card word and the badge
 *     says so, never a card they never wore),
 *   • every COMPLETED row carries REAL inline CSV content (the download
 *     endpoint's preferred source) so the rows are downloadable exactly
 *     as real ones are — the fixture-fidelity law: a history row that
 *     lies about its file is not fidelity,
 *   • v2.439.0 THE CANCELLED FACE: one row cancelled by the owner while
 *     it was stuck — the badge wearable on a fresh world (the
 *     written-but-unspoken law: a face no row wears is a face the QA
 *     census must ask about), coherence kept: a cancelled row carries
 *     its note and NONE of the completion faces, never expires (it has
 *     no file to lose — the retention chip stays silent, the badge owns
 *     the story),
 *   • the coherence law kept exactly as the POST route and the cancel
 *     door write them (COMPLETED → completedAt + expiresAt +7d;
 *     FAILED → errorMessage; CANCELLED → its note only; PROCESSING and
 *     PENDING → neither — a waiting row lies about no completion and
 *     no failure).
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

// the fourteen rows: [key, exportType, format, status, recordCount, daysAgo,
//                      expiresInDays] — the seventh column is the retention
// window a COMPLETED row carries (default 7 = the endpoint's own law);
// a NEGATIVE window is already past, and the derived Expired face speaks.
// coherence law: COMPLETED → completedAt + content + expiresAt (+7d by
// default); FAILED → errorMessage; PROCESSING and PENDING → neither.
const ROWS = [
  ['products-completed', 'PRODUCTS', 'CSV', 'COMPLETED', 80, 3, 7],
  ['customers-completed', 'CUSTOMERS', 'CSV', 'COMPLETED', 25, 3, 7],
  ['transactions-completed', 'TRANSACTIONS', 'JSON', 'COMPLETED', 412, 2, 7],
  ['debt-failed', 'DEBT', 'CSV', 'FAILED', 0, 2, null],
  ['inventory-completed', 'INVENTORY', 'CSV', 'COMPLETED', 96, 2, 7],
  ['employees-completed', 'EMPLOYEES', 'CSV', 'COMPLETED', 16, 1, 7],
  ['suppliers-completed', 'SUPPLIERS', 'CSV', 'COMPLETED', 12, 1, 7],
  ['loyalty-processing', 'LOYALTY', 'JSON', 'PROCESSING', 0, 1, null],
  // the schema's own default face — the one wire status the world never
  // wore; the processing word's union (PROCESSING || PENDING) answers it.
  ['transactions-pending', 'TRANSACTIONS', 'JSON', 'PENDING', 0, 1, null],
  // v2.439.0 THE CANCELLED FACE — the stuck row's honest exit: the
  // loyalty export whose invocation died, retired by the owner. The
  // note speaks, the completion faces stay silent (the coherence law).
  ['loyalty-cancelled', 'LOYALTY', 'CSV', 'CANCELLED', 0, 1, null],
  ['tax-completed', 'TAX', 'CSV', 'COMPLETED', 54, 1, 7],
  ['sales-summary-completed', 'SALES_SUMMARY', 'CSV', 'COMPLETED', 31, 1, 7],
  // the EXPIRED face — completed 9 days ago, retention ended 2 days ago;
  // a COMPLETED row keeps its real content (the endpoint's 410 answers
  // BEFORE content matters) and the badge owns the past.
  ['products-expired', 'PRODUCTS', 'CSV', 'COMPLETED', 80, 9, -2],
  // the off-union faces — the schema's column comment keeps both
  // spellings; the ten cards no longer speak them (the deliberate pin).
  ['payroll-off-union', 'PAYROLL', 'CSV', 'COMPLETED', 16, 4, 7],
  ['all-off-union', 'ALL', 'JSON', 'FAILED', 0, 4, null],
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

  for (const [k, exportType, format, status, recordCount, ago, expiresInDays] of ROWS) {
    const completed = status === 'COMPLETED';
    const failed = status === 'FAILED';
    const cancelled = status === 'CANCELLED';
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
        : cancelled
          ? 'Cancelled by the owner while it was stuck — the generation never finished.'
          : null,
      expiresAt: completed ? daysFromNow(expiresInDays ?? 7) : null,
      completedAt: completed ? daysAgo(ago) : null,
    };
    if (existing) {
      await prisma.dataExport.update({ where: { id: existing.id }, data });
    } else {
      await prisma.dataExport.create({ data });
    }
  }

  const offUnion = ROWS.filter(([, t]) => t === 'PAYROLL' || t === 'ALL').length;
  const pending = ROWS.filter(([, , , s]) => s === 'PENDING').length;
  const cancelled = ROWS.filter(([, , , s]) => s === 'CANCELLED').length;
  const expired = ROWS.filter(([, , , , , , d]) => d !== null && d < 0).length;
  console.log(
    `exports fixture world lit: ${ROWS.length} history rows ` +
      `(8 completed + ${expired} expired, 2 failed, 1 processing, ${pending} pending, ${cancelled} cancelled, ${offUnion} off-union: PAYROLL + ALL) → store ${store.id}`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
