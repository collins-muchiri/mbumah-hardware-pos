// THE FIXTURE WORLD SPEAKS ITS WHOLE VOCABULARY (v2.436.0): the
// fixture-fidelity carry (Task 104's debt, nineteen rounds standing)
// closes on both desks at once. The data-exports desk has answered an
// honest EMPTY pile on every fresh world since its lenses shipped — the
// seed writes zero DataExport rows, so `?exp-status=` and `?exp-type=`
// had nothing to wear — and the off-union story the carry kept naming
// (the exports fixture's PAYROLL row) had no row to be honest about.
// This round lights the world END TO END:
//   • `npm run db:fixtures` — the ONE handle that lights both fixture
//     worlds (the M-Pesa lens's own script leads, the exports world
//     follows),
//   • twelve exports history rows: one per each of the TEN card types
//     (8 completed, 2 failed, 1 processing — both lenses speak non-zero
//     on a fresh world) PLUS the TWO off-union faces the schema's own
//     column comment keeps (PAYROLL completed, ALL failed — the debt's
//     deliberate pin, not a re-type),
//   • every COMPLETED row carries REAL inline content (the download
//     endpoint's preferred source) — a history row that lies about its
//     file is not fidelity,
//   • the exports table's unknown type grows the DELIBERATE off-card
//     face (a slate badge that says what it is, never a card it never
//     wore),
//   • the banking desk's M-Pesa pane grows the CENSUS STRIP — the five
//     faces' counts derived from the SAME stored vocabulary the rows
//     speak, the four status chips pressing through the ONE door, the
//     legacy derived face a COUNT and never a lens word.

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';

const EXPORTS_FIXTURE = 'scripts/seed-exports-fixtures.mjs';
const MPESA_FIXTURE = 'scripts/seed-mpesa-fixtures.mjs';
const PACKAGE = 'package.json';
const SCHEMA = 'prisma/schema.prisma';
const TABLE = 'src/components/data-exports/exports-history-table.tsx';
const BANKING_TAB = 'src/app/(shell)/tabs/banking-tab.tsx';
const TAB_URL = 'src/lib/tab-url.ts';

const fixture = readFileSync(EXPORTS_FIXTURE, 'utf8');
const mpesaFixture = readFileSync(MPESA_FIXTURE, 'utf8');
const pkg = JSON.parse(readFileSync(PACKAGE, 'utf8'));
const schema = readFileSync(SCHEMA, 'utf8');
const table = readFileSync(TABLE, 'utf8');
const desk = readFileSync(BANKING_TAB, 'utf8');
const home = readFileSync(TAB_URL, 'utf8');

// ---------------------------------------------------------------------------
// 1. THE HANDLE — one door, two worlds, the older sibling leads
// ---------------------------------------------------------------------------

describe('the db:fixtures handle — the fixture worlds light through ONE door', () => {
  it('the handle exists and names both fixture scripts (mpesa first, exports second)', () => {
    const handle = pkg.scripts['db:fixtures'];
    expect(handle).toBeDefined();
    const mpesaAt = handle.indexOf('seed-mpesa-fixtures.mjs');
    const exportsAt = handle.indexOf('seed-exports-fixtures.mjs');
    expect(mpesaAt).toBeGreaterThan(-1);
    expect(exportsAt).toBeGreaterThan(mpesaAt);
  });

  it('both fixture scripts are dev-only worlds (the seed-password law not engaged)', () => {
    expect(fixture.includes('dev-only')).toBe(true);
    expect(mpesaFixture.includes('dev-only')).toBe(true);
    expect(fixture.includes('no users are touched')).toBe(true);
  });

  it('both worlds are idempotent by finder-then-upsert (a re-run refreshes, never duplicates)', () => {
    expect(fixture.includes('if (existing) {')).toBe(true);
    expect(mpesaFixture.includes('if (existing) {')).toBe(true);
    expect(fixture.includes('dataExport.update')).toBe(true);
    expect(fixture.includes('dataExport.create')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 2. THE EXPORTS FIXTURE WORLD — ten cards speak, the off-union faces ride
// ---------------------------------------------------------------------------

describe('the exports fixture world — both lenses speak non-zero on a fresh world', () => {
  it('every one of the TEN card types wears a row (the type lens never answers empty by fixture)', () => {
    for (const t of [
      'PRODUCTS', 'CUSTOMERS', 'TRANSACTIONS', 'DEBT', 'INVENTORY',
      'EMPLOYEES', 'SUPPLIERS', 'LOYALTY', 'TAX', 'SALES_SUMMARY',
    ]) {
      expect(fixture.includes(`'${t}'`), t).toBe(true);
    }
  });

  it('the three chip statuses speak (completed, failed, processing — the status lens\u2019s own voice)', () => {
    expect(fixture.includes("'COMPLETED'")).toBe(true);
    expect(fixture.includes("'FAILED'")).toBe(true);
    expect(fixture.includes("'PROCESSING'")).toBe(true);
  });

  it('THE OFF-UNION FACES, DELIBERATE — PAYROLL and ALL ride the world, never re-typed', () => {
    expect(fixture.includes("'PAYROLL'")).toBe(true);
    expect(fixture.includes("'ALL'")).toBe(true);
    expect(fixture.includes('off-union')).toBe(true);
  });

  it('the schema\u2019s own column comment keeps the wider vocabulary (the ground truth)', () => {
    // the column's documented spellings outrun the ten cards — the
    // off-union face is a SCHEMA fact, which is why the round pins it
    // instead of re-typing the row
    expect(schema.includes('// SUPPLIERS, PAYROLL, LOYALTY, TAX, SALES_SUMMARY, ALL')).toBe(true);
  });

  it('completed rows carry REAL inline content (a history row that lies about its file is not fidelity)', () => {
    expect(fixture.includes('content,')).toBe(true);
    // v2.438.0 re-anchor: the retention window grew per-row (the seventh
    // tuple column, default 7 = the endpoint's own law) — the expired
    // face's door (a NEGATIVE window is already past).
    expect(fixture.includes('expiresAt: completed ? daysFromNow(expiresInDays ?? 7) : null,')).toBe(true);
    expect(fixture.includes('completedAt: completed ? daysAgo(ago) : null')).toBe(true);
    expect(fixture.includes("errorMessage: failed")).toBe(true);
  });

  it('the marker rides the free-form filters field (never rendered by the history table)', () => {
    expect(fixture.includes('exports-world-fixture')).toBe(true);
    expect(fixture.includes('filters: { contains:')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 3. THE OFF-CARD FACE — the badge that says what it is
// ---------------------------------------------------------------------------

describe('the exports history table — the unknown type wears the deliberate off-card face', () => {
  it('the !meta branch speaks the face (testid, honest title, slate wardrobe)', () => {
    expect(table.includes('data-testid="exp-type-offcard"')).toBe(true);
    expect(table.includes('a legacy spelling the ten cards no longer speak')).toBe(true);
    expect(table.includes('border-slate-300 bg-slate-50 text-slate-600')).toBe(true);
  });

  it('the KNOWN face never moved (the meta branch byte-kept)', () => {
    expect(table.includes('border-current/30')).toBe(true);
    expect(table.includes('<Badge variant="outline">{type}</Badge>')).toBe(false);
  });

  it('the off-card face names the schema comment as its ground truth', () => {
    expect(table.includes('WIDER stored vocabulary than the ten cards')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 4. THE CENSUS STRIP — five faces, one door, the legacy count
// ---------------------------------------------------------------------------

describe('the banking desk — the M-Pesa census strip derives from the stored vocabulary', () => {
  it('the census group exists with its four pressable status chips', () => {
    expect(desk.includes('data-testid="mpesa-census"')).toBe(true);
    // the testids ride the census row's OWN words through the template
    for (const w of ["'MATCHED', mpesaCensus.MATCHED", "'PENDING', mpesaCensus.PENDING", "'UNMATCHED', mpesaCensus.UNMATCHED", "'DISPUTED', mpesaCensus.DISPUTED"]) {
      expect(desk.includes(w), w).toBe(true);
    }
    expect(desk.includes('data-testid={`mpesa-census-${word.toLowerCase()}`}')).toBe(true);
  });

  it('the chips press through the ONE door (the landing\u2019s retirement rides every hand-driven change)', () => {
    expect(desk.includes("onClick={() => chooseMpesaStatus(mpesaFilterStatus === word ? 'all' : word)}")).toBe(true);
    // the retirement door's own law holds: the direct set calls stay TWO
    const direct = desk
      .split('\n')
      .filter((l) => l.includes('setMpesaFilterStatus(') && !l.includes('const pesaFilterStatus, setMpesaFilterStatus]'));
    expect(direct.length).toBe(2);
  });

  it('the aria-pressed rides each chip (the census is a toggle, spoken to the reader)', () => {
    expect(desk.includes('aria-pressed={mpesaFilterStatus === word}')).toBe(true);
  });

  it('THE LEGACY FACE IS A COUNT, NEVER A LENS WORD', () => {
    expect(desk.includes('data-testid="mpesa-census-legacy"')).toBe(true);
    // the legacy chip\u2019s block carries no onClick — the derived face
    // stays observable and stays outside the Select\u2019s vocabulary
    const spanAt = desk.indexOf('data-testid="mpesa-census-legacy"');
    const spanBlock = desk.slice(spanAt, spanAt + 400);
    expect(spanBlock.includes('onClick')).toBe(false);
    // BANK_MPESA_FILTERS keeps its five members — no fifth lens word
    expect(home.includes("  'PENDING',\n  'MATCHED',\n  'UNMATCHED',\n  'DISPUTED',\n] as const;")).toBe(true);
    expect(home.includes("'LEGACY'")).toBe(false);
  });

  it('the census derives from the SAME stored vocabulary the rows speak (the legacy bucket honest)', () => {
    expect(desk.includes('const mpesaCensus = useMemo(() => {')).toBe(true);
    expect(desk.includes("const bucket = t.reconciliationStatus && t.reconciliationStatus in counts")).toBe(true);
    expect(desk.includes("counts[bucket as keyof typeof counts] += 1;")).toBe(true);
  });

  it('the stale "simulated" aside is retired — the honest comment speaks', () => {
    expect(desk.includes('simulated from transactions')).toBe(false);
    expect(desk.includes('the old "simulated" aside is retired')).toBe(true);
    expect(desk.includes('the derivation only')).toBe(true);
    expect(desk.includes('speaks for the legacy face')).toBe(true);
  });

  it('the wardrobes stay badge-shaped (no elder trio rides the census)', () => {
    // the loom\u2019s drift alarm counts the contiguous trio
    // `border-X-200 bg-X-50 text-X-700` and the 300-storey\u2019s
    // `border-X-300 bg-X-100 text-X-700` — the census wears badge
    // wardrobes (bg-X-100 text-X-700, border-transparent), never a trio
    expect(desk.includes('border border-transparent bg-emerald-100 text-emerald-700')).toBe(false); // order-proof: bg first
    expect(desk.includes('bg-emerald-100 text-emerald-700')).toBe(true); // the desk\u2019s own wardrobe law keeps it
  });
});
