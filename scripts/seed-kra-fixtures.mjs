#!/usr/bin/env node
/**
 * seed-kra-fixtures.mjs — THE TAXMAN'S FIXTURE WORLD (v2.382.0, dev-only).
 *
 * The KRA/e-TIMS world has answered EMPTY since it shipped: kra tables 0
 * rows (the Task 98 QA note) meant the et-status word's five-status lens
 * and the whole submission pipeline could only be QA'd on an honestly
 * empty pile. This fixture lights the pipeline END TO END on the local
 * dev database:
 *   • six SALE/COMPLETED SalesTransaction rows (the KRA invoices' 1:1
 *     anchors — @unique transactionId),
 *   • six InvoiceForKRA rows speaking ALL FIVE submission statuses
 *     (PENDING, SUBMITTED, ACCEPTED ×2, REJECTED, FAILED) — the et-status
 *     word's whole vocabulary becomes a live pile,
 *   • KraSubmission audit rows for the submitted+ faces,
 *   • eight TaxFiling rows across all FOUR filing types (VAT, WHT,
 *     INCOME_TAX, TURNOVER_TAX) and the schema-honest statuses (DRAFT,
 *     FILED, ACCEPTED, REJECTED, AMENDED) — the tax-type word's lens and
 *     the revived desk's badges both get real faces.
 *
 * THE SEED-PASSWORD LAW: run with NODE_ENV=development (the same law the
 * main seed obeys) and the EXPLICIT local DATABASE_URL. Idempotent by
 * unique-key upserts (receiptNumber, kraInvoiceNumber, the filing
 * period+type pair): a re-run refreshes the same rows, never duplicates.
 *
 * Usage:
 *   NODE_ENV=development DATABASE_URL=file:/home/z/ems/db/audit-dev.db \
 *     node scripts/seed-kra-fixtures.mjs
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

if (process.env.NODE_ENV !== 'development') {
  console.error('REFUSING: NODE_ENV must be development (the seed-password law).');
  process.exit(1);
}

const dbUrl = process.env.DATABASE_URL ?? '';
if (!dbUrl.startsWith('file:')) {
  console.error('REFUSING: DATABASE_URL must be a local file: URL (dev-only fixture).');
  process.exit(1);
}

// cuid-ish generator (the schema's default shape; uniqueness is what the
// upserts need, collision-safety comes from the timestamp + counter).
let seq = 0;
const cid = (p) => `${p}${Date.now().toString(36)}${(seq++).toString(36)}${Math.random().toString(36).slice(2, 8)}`;

const statusMeta = {
  PENDING: { kraSubmissionId: null, cuPin: null, submittedAt: null, acceptedAt: null, retryCount: 0, lastError: null },
  SUBMITTED: { kraSubmissionId: 'KRA-SUB-SUBMITTED-0001', cuPin: null, submittedAt: new Date('2026-11-01T09:15:00Z'), acceptedAt: null, retryCount: 0, lastError: null },
  ACCEPTED_A: { kraSubmissionId: 'KRA-SUB-ACCEPTED-0001', cuPin: 'CU000000001', submittedAt: new Date('2026-11-01T10:00:00Z'), acceptedAt: new Date('2026-11-01T10:01:12Z'), retryCount: 0, lastError: null },
  ACCEPTED_B: { kraSubmissionId: 'KRA-SUB-ACCEPTED-0002', cuPin: 'CU000000002', submittedAt: new Date('2026-11-02T11:30:00Z'), acceptedAt: new Date('2026-11-02T11:31:03Z'), retryCount: 0, lastError: null },
  REJECTED: { kraSubmissionId: 'KRA-SUB-REJECTED-0001', cuPin: null, submittedAt: new Date('2026-11-02T14:45:00Z'), acceptedAt: null, retryCount: 1, lastError: 'KRA-4002: buyer PIN not valid for VAT invoice' },
  FAILED: { kraSubmissionId: null, cuPin: null, submittedAt: new Date('2026-11-03T08:20:00Z'), acceptedAt: null, retryCount: 3, lastError: 'KRA-TIMEOUT: no response from gateway after 3 retries' },
};

async function main() {
  const store = await prisma.store.findFirst({ orderBy: { createdAt: 'asc' } });
  if (!store) {
    console.error('REFUSING: no store found — run the main seed first (npm run db:seed).');
    process.exit(1);
  }
  const cashier = await prisma.user.findFirst({
    where: { role: { in: ['SUPER_ADMIN', 'STORE_OWNER', 'BRANCH_MANAGER', 'CASHIER'] } },
    orderBy: { createdAt: 'asc' },
  });
  if (!cashier) {
    console.error('REFUSING: no user found — run the main seed first.');
    process.exit(1);
  }
  console.log(`fixture world → store ${store.name} (${store.id}), cashier ${cashier.email}`);

  // ── 1. the six SALE anchors (one per KRA status face) ──────────────────
  const faces = ['PENDING', 'SUBMITTED', 'ACCEPTED_A', 'ACCEPTED_B', 'REJECTED', 'FAILED'];
  const transactions = {};
  let day = 1;
  for (const face of faces) {
    const receiptNumber = `FIXT-202611${String(day).padStart(2, '0')}-001`;
    const tx = await prisma.salesTransaction.upsert({
      where: { receiptNumber },
      update: {},
      create: {
        id: cid('fixtx'),
        storeId: store.id,
        receiptNumber,
        cashierId: cashier.id,
        subtotal: 10000,
        taxAmount: 1600,
        totalAmount: 11600,
        paymentMethod: 'CASH',
        paymentStatus: 'COMPLETED',
        transactionType: 'SALE',
        notes: `v2.382.0 fixture anchor (${face})`,
      },
    });
    transactions[face] = tx;
    day += 1;
  }

  // ── 2. the six KRA invoices (the et-status word's whole vocabulary) ────
  const breakdown = (label) =>
    JSON.stringify({
      label,
      items: [{ name: 'Fixture cement bag', qty: 10, unitPrice: 1000, taxRate: 16, taxAmount: 1600 }],
      totals: { taxableAmount: 10000, taxAmount: 1600, total: 11600 },
      currency: 'KES',
    });

  let seqNo = 4900;
  for (const face of faces) {
    const meta = statusMeta[face];
    const status = face.startsWith('ACCEPTED') ? 'ACCEPTED' : face;
    const tx = transactions[face];
    const kraInvoiceNumber = `${store.name ? 'P051' : 'P051'}-2026110${String(day).padStart(2, '0')}-${seqNo}`;
    const existing = await prisma.invoiceForKRA.findUnique({
      where: { transactionId: tx.id },
    });
    const payload = {
      storeId: store.id,
      transactionId: tx.id,
      kraInvoiceNumber,
      kraTaxBreakdown: breakdown(`fixture ${status.toLowerCase()}`),
      submissionStatus: status,
      kraSubmissionId: meta.kraSubmissionId,
      cuPin: meta.cuPin,
      qrCode: null,
      submittedAt: meta.submittedAt,
      acceptedAt: meta.acceptedAt,
      retryCount: meta.retryCount,
      lastError: meta.lastError,
    };
    if (existing) {
      await prisma.invoiceForKRA.update({ where: { id: existing.id }, data: payload });
    } else {
      await prisma.invoiceForKRA.create({ data: { id: cid('fixinv'), ...payload } });
    }
    seqNo += 1;
  }

  // ── 3. the submission audit rows (the pipeline's own log) ───────────────
  for (const face of faces) {
    const meta = statusMeta[face];
    if (!meta.kraSubmissionId) continue;
    const status = face.startsWith('ACCEPTED') ? 'ACCEPTED' : face;
    const tx = transactions[face];
    const inv = await prisma.invoiceForKRA.findUnique({ where: { transactionId: tx.id } });
    const existing = await prisma.kraSubmission.findFirst({
      where: { invoiceForKraId: inv.id, kraReferenceNumber: meta.kraSubmissionId },
    });
    const payload = {
      storeId: store.id,
      invoiceForKraId: inv.id,
      kraReferenceNumber: meta.kraSubmissionId,
      status,
      responseJson: JSON.stringify({ fixture: true, status }),
      httpStatus: status === 'FAILED' ? 504 : 200,
      latencyMs: status === 'FAILED' ? 30000 : 812,
      errorMessage: meta.lastError,
      submittedAt: meta.submittedAt ?? new Date(),
      processedAt: meta.acceptedAt,
    };
    if (existing) {
      await prisma.kraSubmission.update({ where: { id: existing.id }, data: payload });
    } else {
      await prisma.kraSubmission.create({ data: { id: cid('fixsub'), ...payload } });
    }
  }

  // ── 4. the eight tax filings (the tax-type word's whole vocabulary) ────
  const filings = [
    { period: '2026-08', type: 'VAT', sales: 1840000, tax: 294400, wht: 0, status: 'ACCEPTED', ref: 'KRA-VAT-2026-08' },
    { period: '2026-09', type: 'VAT', sales: 2110000, tax: 337600, wht: 0, status: 'FILED', ref: 'KRA-VAT-2026-09' },
    { period: '2026-10', type: 'VAT', sales: 1975000, tax: 316000, wht: 0, status: 'DRAFT', ref: null },
    { period: '2026-09', type: 'WHT', sales: 420000, tax: 0, wht: 12600, status: 'FILED', ref: 'KRA-WHT-2026-09' },
    { period: '2026-10', type: 'WHT', sales: 385000, tax: 0, wht: 11550, status: 'REJECTED', ref: null },
    { period: '2026-09', type: 'INCOME_TAX', sales: 2530000, tax: 0, wht: 0, status: 'AMENDED', ref: 'KRA-ITX-2026-09' },
    { period: '2026-10', type: 'TURNOVER_TAX', sales: 1975000, tax: 0, wht: 0, status: 'DRAFT', ref: null },
    { period: '2026-09', type: 'TURNOVER_TAX', sales: 2110000, tax: 0, wht: 0, status: 'FILED', ref: 'KRA-TOT-2026-09' },
  ];
  for (const f of filings) {
    const existing = await prisma.taxFiling.findFirst({
      where: { storeId: store.id, filingPeriod: f.period, filingType: f.type },
    });
    const payload = {
      storeId: store.id,
      filingPeriod: f.period,
      filingType: f.type,
      totalSales: f.sales,
      totalTax: f.tax,
      totalWht: f.wht,
      status: f.status,
      filingDate: f.status === 'DRAFT' ? null : new Date(`${f.period}-20T10:00:00Z`),
      dueDate: new Date(`${f.period}-20T23:59:59Z`),
      etimsReference: f.ref,
      notes: 'v2.382.0 fixture filing',
      filedBy: cashier.id,
    };
    if (existing) {
      await prisma.taxFiling.update({ where: { id: existing.id }, data: payload });
    } else {
      await prisma.taxFiling.create({ data: { id: cid('fixfil'), ...payload } });
    }
  }

  const kraCount = await prisma.invoiceForKRA.count({ where: { storeId: store.id } });
  const subCount = await prisma.kraSubmission.count({ where: { storeId: store.id } });
  const filCount = await prisma.taxFiling.count({ where: { storeId: store.id } });
  console.log(`fixture world lit: ${kraCount} KRA invoices (5 statuses), ${subCount} submissions, ${filCount} tax filings (4 types, 5 statuses)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
