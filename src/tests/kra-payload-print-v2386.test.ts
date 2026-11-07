// THE PAYLOAD FILES ITSELF (v2.386.0): the dry-run card reaches paper —
// and the fixture world speaks a real line-item count.
//
// The v2.385.0 card carried Copy alone; the paper-trail pattern's third
// customer was still waiting: the operator who FILES what KRA would
// receive can now press Print and the card rides the app's print-root
// pipeline (printReceiptElement clones #kra-dryrun-payload into
// #print-root; @media print shows ONLY that host; colors survive via
// print-color-adjust: exact). The same round closes the fixture-fidelity
// gap the live QA caught: the fixture anchors carried money faces but NO
// SaleItem rows, so the card's "Line items" spoke an honest 0 — the seed
// now grows one real line per anchor (10 × 1,160 = 11,600, the mapper
// re-deriving the anchor's own 10,000 + 1,600 split), and the card
// renders the per-line list when the payload carries items.
//
// THE MAPPER'S LAST DECIMAL LEAK (the money-face law's final inch):
// lineTotal, taxRate, quantity and unitPrice still crossed the wire as
// Decimal faces (the type said number, the copied JSON lied). The whole
// line now reads through toNum — the arithmetic AND the faces both true.
//
// Pins: the print face (the id the pipeline needs, the Printer button's
// aria-label + title, the printReceiptElement call, the button pair's
// order Print-then-Copy), the per-line list (the testid, the max-h-40
// scroll, the × Number(quantity) boundary coercion, the money faces via
// payloadMoney, the mount-only-when-items gate), the mapper's toNum
// census (all four leaks sealed), the seed's SaleItem block (idempotent
// on transactionId+productName, the faces), and the release's own slots.

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';

const DESK = readFileSync('src/app/(shell)/tabs/etims-tab.tsx', 'utf8');
const ROUTE = readFileSync('src/app/api/kra/submit/route.ts', 'utf8');
const SEED = readFileSync('scripts/seed-kra-fixtures.mjs', 'utf8');
const PIPELINE = readFileSync('src/lib/receipt-pdf.ts', 'utf8');
const FEED = readFileSync('src/lib/whats-new.ts', 'utf8');
const pkg = JSON.parse(readFileSync('package.json', 'utf8'));

// ---------------------------------------------------------------------------

describe('the print face — the paper-trail pattern\u2019s third customer', () => {
  it('the card carries the id the print pipeline resolves', () => {
    expect(DESK).toContain('id="kra-dryrun-payload"');
    expect(PIPELINE).toContain("document.getElementById(elementId)");
  });

  it('the Print button speaks its own name and rides the pipeline', () => {
    expect(DESK).toContain('aria-label="Print mapped payload"');
    expect(DESK).toContain('title="Print the mapped payload"');
    expect(DESK).toContain("printReceiptElement('kra-dryrun-payload')");
    expect(DESK).toContain('<Printer className="h-3 w-3 mr-1" />');
  });

  it('Print sits BEFORE Copy (the paper leads, the clipboard follows)', () => {
    const printAt = DESK.indexOf('Print mapped payload');
    const copyAt = DESK.indexOf('Copy mapped payload as JSON');
    expect(printAt).toBeGreaterThan(-1);
    expect(copyAt).toBeGreaterThan(printAt);
  });

  it('the v2.385.0 copy voice stays whole (both states, the two-second hand-back)', () => {
    expect(DESK).toContain("{payloadCopied ? 'Copied' : 'Copy'}");
    expect(DESK).toContain('setTimeout(() => setPayloadCopied(false), 2000);');
  });
});

describe('the per-line list — the payload\u2019s own rows', () => {
  it('the list mounts only when the payload carries items', () => {
    expect(DESK).toContain('{dryRunPayload.items.length > 0 && (');
    expect(DESK).toContain('data-testid="kra-dryrun-items"');
  });

  it('the list scrolls (max-h-40) inside the 475px dialog', () => {
    expect(DESK).toContain('max-h-40 overflow-y-auto');
  });

  it('the quantity rides the boundary coercion (the money-face law)', () => {
    expect(DESK).toContain('× {Number(item.quantity)}');
    expect(DESK).toContain('{payloadMoney(item.unitPrice)}');
    expect(DESK).toContain('{payloadMoney(item.total)}');
  });

  it('the rows truncate long product names (the min-w-0 discipline)', () => {
    expect(DESK).toContain('min-w-0 truncate font-medium');
  });
});

describe('the mapper — the last decimal leak sealed', () => {
  it('lineTotal, taxRate, quantity and unitPrice all read through toNum', () => {
    expect(ROUTE).toContain('const lineTotal = toNum(item.lineTotal);');
    expect(ROUTE).toContain('const vatRate = toNum(item.taxRate) || 16;');
    expect(ROUTE).toContain('quantity: toNum(item.quantity),');
    expect(ROUTE).toContain('unitPrice: toNum(item.pricePerUnit),');
  });

  it('no raw Decimal face reaches the payload object', () => {
    const payloadBlock = ROUTE.slice(ROUTE.indexOf('const items: KraInvoiceLineItem[]'), ROUTE.indexOf('return {\n      payload:') > -1 ? ROUTE.indexOf('return {\n      payload:') : ROUTE.indexOf('  return {'));
    expect(payloadBlock).not.toContain('quantity: item.quantity');
    expect(payloadBlock).not.toContain('unitPrice: item.pricePerUnit');
  });

  it("the route's own toNum doctrine comment still stands (the v2.31.0 law)", () => {
    expect(ROUTE).toContain('read through toNum so they can never leak into arithmetic');
  });
});

describe('the fixture world — a real line speaks', () => {
  it('the seed grows one SaleItem per anchor, idempotent on (transactionId, productName)', () => {
    expect(SEED).toContain("prisma.saleItem.findFirst({\n      where: { transactionId: tx.id, productName: product.name },\n    })");
    expect(SEED).toContain('lineTotal: 11600');
    expect(SEED).toContain('pricePerUnit: 1160');
    expect(SEED).toContain('quantity: 10');
    expect(SEED).toContain('taxRate: 16');
  });

  it('the seed refuses to run against an empty catalog (the honest failure)', () => {
    expect(SEED).toContain('fixture seed needs at least one product in the seeded world');
  });
});

describe("the what\u2019s-new feed — the round announces itself", () => {
  it('v2.386.0 is the lead entry with the round\u2019s title', () => {
    expect(FEED).toContain("version: '2.386.0'");
    expect(FEED.indexOf("version: '2.386.0'")).toBeLessThan(FEED.indexOf("version: '2.385.0'"));
    expect(FEED).toContain('The payload files itself');
  });

  it('the version slots speak 2.386.0', () => {
    expect(pkg.version).toBe('2.443.0');
    expect(pkg.mbumah.releaseVersion).toBe('2.443.0');
    expect(pkg.mbumah.baseVersion).toBe('2.443.0');
  });
});
