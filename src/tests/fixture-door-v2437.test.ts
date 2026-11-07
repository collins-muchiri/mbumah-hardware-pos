// THE TAXMAN JOINS THE DOOR (v2.437.0): the db:fixtures handle lit two of
// the three fixture worlds — the KRA/e-TIMS script (v2.386.0's taxman
// world) stayed manual, so a fresh world's e-TIMS desk answered its
// honest EMPTY pile even after the door ran (the Task 134 opening burst's
// live proof: two world-lit lines, then "No KRA invoices found."). This
// round the door grows its third face and the exports world wears the
// schema's own default status:
//   • `npm run db:fixtures` lights THREE fixture worlds through the ONE
//     door — the M-Pesa ledger's script leads, the exports world follows,
//     and the taxman's world closes the parade (the handle's order is
//     the parade's order, pinned byte-exact),
//   • the taxman's world keeps every law it shipped with: dev-only (the
//     NODE_ENV refusal), the local file: URL refusal, the finder-then-
//     upsert idempotence (receiptNumber, transactionId, the period+type
//     pair, the businessPin), the five submission statuses through the
//     six anchors, the SaleItem line-item fidelity (v2.386.0's carry),
//     the audit rows for the submitted+ faces, the eight filings across
//     the four types and the schema-honest statuses, the sandbox profile,
//   • the exports world grows the DEFAULT FACE — one PENDING history row,
//     the schema's own `@default("PENDING")` the fixtures never spoke —
//     and the processing word's union (PROCESSING || PENDING) answers it
//     under `processing` and `all`, never stranded; the coherence law
//     holds (a waiting row carries neither completion nor failure faces).

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';

const PACKAGE = 'package.json';
const KRA_FIXTURE = 'scripts/seed-kra-fixtures.mjs';
const EXPORTS_FIXTURE = 'scripts/seed-exports-fixtures.mjs';
const MPESA_FIXTURE = 'scripts/seed-mpesa-fixtures.mjs';
const SCHEMA = 'prisma/schema.prisma';
const TABLE = 'src/components/data-exports/exports-history-table.tsx';

const pkg = readFileSync(PACKAGE, 'utf8');
const kra = readFileSync(KRA_FIXTURE, 'utf8');
const exportsFixture = readFileSync(EXPORTS_FIXTURE, 'utf8');
const mpesaFixture = readFileSync(MPESA_FIXTURE, 'utf8');
const schema = readFileSync(SCHEMA, 'utf8');
const table = readFileSync(TABLE, 'utf8');

describe('the db:fixtures door grows its third word (v2.437.0)', () => {
  it('the handle lights THREE fixture worlds in the parade order — mpesa leads, exports follows, the taxman closes — under the seed-password law (every face NODE_ENV=development, the burst\u2019s own catch)', () => {
    expect(pkg).toContain(
      '"db:fixtures": "NODE_ENV=development node scripts/seed-mpesa-fixtures.mjs && NODE_ENV=development node scripts/seed-exports-fixtures.mjs && NODE_ENV=development node scripts/seed-kra-fixtures.mjs"',
    );
    expect(pkg.match(/NODE_ENV=development node scripts\/seed-/g)?.length).toBe(3);
  });

  it('the taxman world is dev-only and refuses a non-local database (the seed-password law\u2019s own bytes)', () => {
    expect(kra).toContain("if (process.env.NODE_ENV !== 'development')");
    expect(kra).toContain('REFUSING: NODE_ENV must be development (the seed-password law).');
    expect(kra).toContain("!dbUrl.startsWith('file:')");
    expect(kra).toContain('REFUSING: DATABASE_URL must be a local file: URL (dev-only fixture).');
  });

  it('the taxman world refuses an unseeded store (the main seed comes first)', () => {
    expect(kra).toContain("await prisma.store.findFirst({ orderBy: { createdAt: 'asc' } })");
    expect(kra).toContain('REFUSING: no store found — run the main seed first');
  });

  it('the six anchors upsert by their unique receipt numbers (idempotent by finder)', () => {
    expect(kra).toContain("const receiptNumber = `FIXT-202611${String(day).padStart(2, '0')}-001`");
    expect(kra).toContain('await prisma.salesTransaction.upsert({');
    expect(kra).toContain('where: { receiptNumber },');
    expect(kra).toContain('update: {},');
  });

  it('every anchor carries a real SaleItem line — the mapper\u2019s per-line face (v2.386.0\u2019s carry)', () => {
    expect(kra).toContain('fixture seed needs at least one product in the seeded world');
    expect(kra).toContain('await prisma.saleItem.findFirst({');
    expect(kra).toContain('where: { transactionId: tx.id, productName: product.name },');
    expect(kra).toContain('pricePerUnit: 1160,');
    expect(kra).toContain('lineTotal: 11600,');
  });

  it('the six invoices speak the five submission statuses through the stored vocabulary', () => {
    const faces = ['PENDING', 'SUBMITTED', 'ACCEPTED_A', 'ACCEPTED_B', 'REJECTED', 'FAILED'];
    for (const face of faces) expect(kra).toContain(`'${face}'`);
    expect(kra).toContain('const status = face.startsWith(\'ACCEPTED\') ? \'ACCEPTED\' : face;');
    expect(kra).toContain("await prisma.invoiceForKRA.findUnique({\n      where: { transactionId: tx.id },\n    })");
  });

  it('the audit rows speak only the submitted+ faces (a pending invoice has nothing to log)', () => {
    expect(kra).toContain('if (!meta.kraSubmissionId) continue;');
    expect(kra).toContain('await prisma.kraSubmission.findFirst({');
    expect(kra).toContain('where: { invoiceForKraId: inv.id, kraReferenceNumber: meta.kraSubmissionId },');
  });

  it('the eight filings speak the four types and the schema-honest statuses', () => {
    for (const t of ['VAT', 'WHT', 'INCOME_TAX', 'TURNOVER_TAX']) expect(kra).toContain(`type: '${t}'`);
    for (const s of ['ACCEPTED', 'FILED', 'DRAFT', 'REJECTED', 'AMENDED']) expect(kra).toContain(`status: '${s}'`);
    expect(kra).toContain('where: { storeId: store.id, filingPeriod: f.period, filingType: f.type },');
    expect(schema).toContain('@default("DRAFT") // DRAFT, PENDING_APPROVAL, APPROVED, SENT, CONFIRMED, PARTIALLY_RECEIVED, RECEIVED, CANCELLED');
  });

  it('the sandbox profile upserts by its business PIN — the WRITE side\u2019s key', () => {
    expect(kra).toContain("await prisma.kraBusinessProfile.upsert({\n    where: { businessPin: 'P051234567X' },");
    expect(kra).toContain("businessName: 'MBUMAH HARDWARE (FIXTURE SANDBOX)',");
    expect(kra).toContain("environment: 'sandbox',");
  });

  it('the summary line speaks the whole world (invoices, submissions, filings, profile)', () => {
    expect(kra).toContain(
      '`fixture world lit: ${kraCount} KRA invoices (5 statuses), ${subCount} submissions, ${filCount} tax filings (4 types, 5 statuses), sandbox profile ${profile.id} (P051234567X)`',
    );
  });
});

describe('the exports world wears the schema\u2019s default face (v2.437.0)', () => {
  it('the PENDING row joins the pile — the schema\u2019s own default status, the one wire face the world never wore', () => {
    // v2.438.0 re-anchor: the tuples grew the retention window (the expired face's door).
    expect(exportsFixture).toContain("['transactions-pending', 'TRANSACTIONS', 'JSON', 'PENDING', 0, 1, null],");
    expect(schema).toContain('status             String   @default("PENDING") // PENDING, PROCESSING, COMPLETED, FAILED, CANCELLED');
  });

  it('the coherence law: a waiting row carries neither completion nor failure faces (the neither-branch derives it)', () => {
    expect(exportsFixture).toContain('const completed = status === \'COMPLETED\';');
    expect(exportsFixture).toContain('const failed = status === \'FAILED\';');
    expect(exportsFixture).not.toContain("status === 'PENDING' &&");
  });

  it('the summary line\u2019s census speaks the pending face', () => {
    expect(exportsFixture).toContain("const pending = ROWS.filter(([, , , s]) => s === 'PENDING').length;");
    // v2.438.0 re-anchor: the census grew the expired face's own count.
    expect(exportsFixture).toContain('(8 completed + ${expired} expired, 2 failed, 1 processing, ${pending} pending, ${offUnion} off-union: PAYROLL + ALL)');
  });

  it('the processing word\u2019s union covers PENDING — the lens and the count paragraph speak the SAME union', () => {
    const union = "(e) => e.status === 'PROCESSING' || e.status === 'PENDING',";
    expect(table.split(union).length - 1).toBe(2);
  });

  it('the twelve-row world is gone — the fourteen-row world replaces it in prose and law', () => {
    // v2.438.0 re-anchor: thirteen grew to fourteen (the expired face joined).
    expect(exportsFixture).toContain('fourteen DataExport history rows');
    expect(exportsFixture).not.toContain('twelve DataExport history rows');
    expect(mpesaFixture).toContain('(2 MATCHED, 3 PENDING, 2 UNMATCHED, 1 DISPUTED, 1 legacy derived)');
  });
});
