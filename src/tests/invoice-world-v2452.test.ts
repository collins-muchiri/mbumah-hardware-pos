// THE FIXTURE WORLD LEARNS TO BILL (v2.452.0): the invoices desk answered
// every QA burst honestly empty — the other three fixture worlds never
// wrote an Invoice row — so the register's money seat was proven on its
// sibling desks while THIS desk stayed a byte-pin. This round the
// register gets its witnesses:
//   • eleven rows — every document type wears a witness and the
//     register's statuses wear rows too (the expired face rides the
//     quotation, where the lazy expiry law actually writes it),
//   • the money bait — the six register totals are distinct and their
//     lexicographic order differs from their numeric order, so the walk
//     that catches a string/string comparator is one press away, forever,
//   • the lazy-expiry law is spoken by the seeds, not fought (living
//     quotations carry future due dates; one past-due quotation already
//     wears the expired face),
//   • the watcher learns to COUNT THE RUNS, NOT JUST THE PENDING — a
//     half-born CI (the seen runs drained while the count still grew)
//     can never answer green again,
//   • and the register's money column wears tabular digits — the money
//     that sorts honestly also aligns honestly.

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';

const SEED = 'scripts/seed-invoices-fixtures.mjs';
const WATCHER = 'scripts/watch-pr-v2452.mjs';
const PKG = 'package.json';
const TAB = 'src/app/(shell)/tabs/invoices-tab.tsx';

const seed = readFileSync(SEED, 'utf8');
const watcher = readFileSync(WATCHER, 'utf8');
const pkg = readFileSync(PKG, 'utf8');
const tab = readFileSync(TAB, 'utf8');

const rows = seed.match(/num: '[A-Z]+-FIX-\d+'/g) ?? [];
const invoiceLines = seed.split('\n').filter((l) => l.includes("num: 'INV-FIX-"));

// the register's math, read from the row bytes the same way the seed
// computes it: lineTotal = qty × price; total = lineTotal + tax −
// discount, with tax = lineTotal × taxRate / 100 (only row 1 speaks VAT).
function registerTotals(): number[] {
  return invoiceLines.map((line) => {
    const qty = Number(line.match(/items: \[\['[^']*', (\d+), /)?.[1]);
    const price = Number(line.match(/, ([\d.]+)\]\]/)?.[1]);
    const rate = Number(line.match(/taxRate: (\d+)/)?.[1]);
    const lineTotal = Math.round(qty * price * 100) / 100;
    const tax = Math.round(((lineTotal * rate) / 100) * 100) / 100;
    return Math.round((lineTotal + tax) * 100) / 100;
  });
}

describe('the invoice fixture world — the witnesses and their coherence', () => {
  it('eleven witnesses stand up, each found by its own number before a write', () => {
    expect(rows.length).toBe(11);
    expect(seed).toContain("findFirst({ where: { invoiceNumber: row.num } })");
    expect(seed).toContain('deleteMany: {}, create: lines');
  });

  it('every document type wears a witness — all five speak', () => {
    for (const t of ['INVOICE', 'QUOTATION', 'PROFORMA', 'CREDIT_NOTE', 'DEBIT_NOTE']) {
      expect(seed).toContain(`type: '${t}'`);
    }
  });

  it('the register\u2019s statuses wear rows — the expired face rides the quotation', () => {
    for (const s of ['PAID', 'SENT', 'DRAFT', 'CANCELLED', 'INVOICED']) {
      expect(seed).toContain(`status: '${s}'`);
    }
    expect(seed).toContain("type: 'QUOTATION', status: 'EXPIRED'");
  });

  it('the lazy-expiry law is spoken by the seeds, not fought', () => {
    // the living quotation\u2019s due date sits AHEAD (a negative ago),
    // the auto-expired one sits in the past — exactly what the GET
    // route\u2019s lazy sweep would write
    expect(seed).toContain("num: 'QUO-FIX-001', type: 'QUOTATION', status: 'SENT', customer: 'Thika School Board', phone: '0712000002', issueAgo: 5, dueAgo: -18,");
    expect(seed).toContain("num: 'QUO-FIX-002', type: 'QUOTATION', status: 'EXPIRED', customer: 'Kilimani Flatscaretakers', phone: '0712000008', issueAgo: 36, dueAgo: 6,");
    expect(seed).toContain('quotations carry FUTURE due dates');
  });

  it('the money bait: six distinct register totals whose lexicographic order differs from their numeric order', () => {
    expect(invoiceLines.length).toBe(6);
    const totals = registerTotals();
    expect(totals.length).toBe(6);
    expect(new Set(totals).size).toBe(6);
    const numeric = [...totals].sort((a, b) => a - b);
    const lexical = [...totals].sort((a, b) => String(a).localeCompare(String(b)));
    expect(lexical).not.toEqual(numeric);
    // the bait\u2019s sharpest tooth, pinned: the cent total sorts FIRST
    // numerically, and the nine-thousand total sorts LAST lexicographically
    // (a string/string comparator would crown "9500" the loudest)
    expect(numeric[0]).toBe(725.75);
    expect(lexical[lexical.length - 1]).toBe(9500);
    expect(numeric[numeric.length - 1]).toBe(120000);
  });

  it('the coherence law: the VAT face computes (12,500 + 16% = 14,500) and the zero-rate faces pass through', () => {
    const totals = registerTotals();
    expect(totals).toContain(14500); // 2 × 6250 + 16%
    expect(totals).toContain(120000);
    expect(totals).toContain(9500);
    expect(totals).toContain(1200.5);
    expect(totals).toContain(45000);
    expect(totals).toContain(725.75);
    expect(seed).toContain('lineTotal = quantity × pricePerUnit');
  });
});

describe('the wiring — one door, four worlds', () => {
  it('the fixture door runs the invoice world LAST, after the other three', () => {
    expect(pkg).toContain('seed-mpesa-fixtures.mjs && NODE_ENV=development node scripts/seed-exports-fixtures.mjs && NODE_ENV=development node scripts/seed-kra-fixtures.mjs && NODE_ENV=development node scripts/seed-invoices-fixtures.mjs');
  });
});

describe('the watcher mend — the runs are counted, not just the pending', () => {
  it('the known total is named and the green verdict requires it', () => {
    expect(watcher).toContain('const EXPECTED_RUNS = 11;');
    expect(watcher).toContain('runsList.length >= EXPECTED_RUNS && pending.length === 0');
  });

  it('a half-born CI is named, tolerated, then refused — never green', () => {
    expect(watcher).toContain('half-born');
    expect(watcher).toContain('const PLATEAU_LIMIT = 15;');
    expect(watcher).toContain('refusing to green a half-born CI');
  });

  it('the head sha still reads from the PR itself each poll', () => {
    expect(watcher).toContain('const sha = pr.head.sha;');
  });
});

describe('the register\u2019s money column wears tabular digits', () => {
  it('the total cell carries the aligned-digit seat (the round\u2019s styling detail)', () => {
    expect(tab).toContain('className="text-right font-semibold tabular-nums"');
  });

  it('the sweep\u2019s coercion bytes still ride verbatim (the seat the fixtures now prove live)', () => {
    expect(tab).toContain("case 'totalAmount': aVal = Number(a.totalAmount); bVal = Number(b.totalAmount); break;");
  });
});

describe('the stats row tells the truth (the fixture world\u2019s confession)', () => {
  it('the money reduces coerce at the seat — 0 + a string CONCATENATES (the trillion-shilling lie)', () => {
    expect(tab).toContain('totalRevenue: paidInvoices.reduce((s, i) => s + Number(i.totalAmount), 0),');
    expect(tab).toContain('outstandingAmount: outstanding.reduce((s, i) => s + Number(i.totalAmount), 0),');
  });

  it('the bare concat is gone from the stats row', () => {
    expect(tab).not.toContain('paidInvoices.reduce((s, i) => s + i.totalAmount, 0)');
    expect(tab).not.toContain('outstanding.reduce((s, i) => s + i.totalAmount, 0)');
  });

  it('the confession names the lie, its number, and its exposure', () => {
    expect(tab).toContain("THE FIXTURE WORLD'S CONFESSION");
    expect(tab).toContain('Ksh 950,012,000,045,000.00 for a Ksh 174,500 register');
    expect(tab).toContain('the one seat the stats row owns');
  });
});
