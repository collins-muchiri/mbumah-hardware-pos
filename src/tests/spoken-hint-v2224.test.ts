// v2.224.0 — the spoken hint (and the sheet's copy).
//
//   - THE SPOKEN HINT: the supplier hint names its SOURCE — the PO that
//     spoke (the latest purchase order of ANY status by orderDate) and
//     the day it spoke. The hint-law had a known failure shape (the
//     v2.221 live flattening: one big PO flattened every row's hint to
//     one supplier and the split died); a hint that shows its receipt
//     is legible BEFORE it bites. The named wire (kpi-summary) grows
//     the two fields additively (the full wire already carried them —
//     one story, both scopes); every restock row wears the mono
//     "hint: PO-…" chip with a title that speaks the law.
//   - THE SHEET'S COPY: the drill's lines go portable — a client-side
//     CSV over the lines the drill ALREADY holds (zero new fetch).
//     The file speaks the WHOLE sheet (the finder narrows the reading,
//     never the export); a cost-gated cell exports EMPTY (absence,
//     never a hidden zero); a CANCELLED sheet exports its void truth;
//     the button hides on a line-less sheet (an absent control never
//     lies); the BOM so Excel opens UTF-8 honestly; CSV quoting per
//     the boring law (commas/quotes/newlines ride wrapped, doubled).
//   - THE STYLING DETAILS: the hint chip is mono + tabular-nums (a
//     document number, not a word) in the muted family at 3:1; the
//     CSV button wears the house border family with the amber focus
//     ring; dark halves from birth.
//
// Every pin reads the SOURCE OF RECORD (source bytes, not memory).

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it, expect } from 'vitest';

const read = (p: string) => readFileSync(join(process.cwd(), p), 'utf8');

const dialog = read('src/components/org/restock-dialog.tsx');
const kpi = read('src/app/api/org/kpi-summary/route.ts');
const drill = read('src/components/org/sheet-drill.tsx');
const pkg = JSON.parse(read('package.json'));
const changelog = read('CHANGELOG.md');
const feed = read('src/lib/whats-new.ts');
const version = String(pkg.version);

// ── THE RELEASE FACE ─────────────────────────────────────────────────────

describe('the round of record (v2.224.0)', () => {
  it('package.json leads 2.224.0 (all three slots)', () => {
    expect(version).toBe('2.275.0');
    expect(pkg.mbumah.releaseVersion).toBe('2.275.0');
    expect(pkg.mbumah.baseVersion).toBe('2.275.0');
  });

  it('the changelog anchors the section ABOVE its ancestor (the structural pin — headers, never bare strings)', () => {
    expect(changelog.indexOf('## [2.224.0]')).toBeGreaterThanOrEqual(0);
    expect(changelog.indexOf('## [2.224.0]')).toBeLessThan(changelog.indexOf('## [2.223.0]'));
  });

  it('the feed carries the spoken hint (the dialog picks it up automatically)', () => {
    expect(feed.includes("version: '2.224.0',")).toBe(true);
    expect(feed.includes('The spoken hint')).toBe(true);
  });
});

// ── THE SPOKEN HINT ──────────────────────────────────────────────────────

describe('the hint names its source (v2.224.0)', () => {
  it('the named wire grew the receipt fields, additively', () => {
    expect(kpi.includes('lastSupplierPoNumber: null as string | null,')).toBe(true);
    expect(kpi.includes('lastSupplierAt: null as string | null,')).toBe(true);
  });

  it('the hint select carries the PO number and the day it spoke', () => {
    expect(kpi.includes("purchaseOrder: { select: { supplierId: true, poNumber: true, orderDate: true, supplier: { select: { name: true } } } }")).toBe(true);
  });

  it('the reduction fills the receipt (the PO that spoke, ISO day)', () => {
    expect(kpi.includes('item.lastSupplierPoNumber = line.purchaseOrder?.poNumber ?? null;')).toBe(true);
    expect(kpi.includes('item.lastSupplierAt = line.purchaseOrder?.orderDate')).toBe(true);
  });

  it('the dialog type carries the receipt (both scopes, one story)', () => {
    expect(dialog.includes('lastSupplierPoNumber?: string | null;')).toBe(true);
    expect(dialog.includes('lastSupplierAt?: string | null;')).toBe(true);
  });

  it('the full wire\'s already-present receipt is mapped (zero wire change there)', () => {
    expect(dialog.includes('lastSupplierPoNumber: r.supplier?.lastPoNumber ?? null,')).toBe(true);
    expect(dialog.includes('lastSupplierAt: r.supplier?.lastPoDate ?? null,')).toBe(true);
    expect(dialog.includes('lastPoNumber?: string | null; lastPoDate?: string | null')).toBe(true);
  });

  it('every row wears the mono hint chip, testid per SKU', () => {
    expect(dialog.includes('data-testid={`restock-hint-po-${item.sku}`}')).toBe(true);
    expect(dialog.includes('font-mono text-[9px] tabular-nums')).toBe(true);
    expect(dialog.includes('hint: {item.lastSupplierPoNumber}')).toBe(true);
  });

  it('the chip\'s title speaks the LAW (the latest PO of ANY status, newest first)', () => {
    expect(dialog.includes('the ledger hints the latest purchase order of ANY status, newest first — ${item.lastSupplierPoNumber} named this row')).toBe(true);
  });
});

// ── THE SHEET'S COPY ─────────────────────────────────────────────────────

describe('the drill exports its lines (v2.224.0)', () => {
  it('the CSV builder exists, pure and exported (the pins can read it)', () => {
    expect(drill.includes('export function csvCell(v: string | number | null | undefined): string {')).toBe(true);
    expect(drill.includes('export function sheetLinesCsv(lines: DrillWire[\'data\'][\'lines\'], opts: { costGated: boolean }): string {')).toBe(true);
  });

  it('the quoting law: commas, quotes and newlines ride wrapped, doubled', () => {
    expect(drill.includes('return /[",\\n]/.test(s) ? `"${s.replaceAll(\'"\', \'""\')}"` : s;')).toBe(true);
  });

  it('the header speaks the seven columns (cost last, KES-named)', () => {
    expect(drill.includes("'product,sku,unit,snapshot,counted,variance,variance_cost_kes'")).toBe(true);
  });

  it('the cost gate rides IN THE FILE — a gated cell exports empty (absence, never a hidden zero)', () => {
    expect(drill.includes("!opts.costGated && l.varianceCost != null ? l.varianceCost : ''")).toBe(true);
  });

  it('uncounted and unvaried cells export empty (the void\'s honest face, in the file)', () => {
    expect(drill.includes("l.countedQty != null ? l.countedQty : ''")).toBe(true);
    expect(drill.includes("l.variance != null ? l.variance : ''")).toBe(true);
  });

  it('the BOM rides so Excel opens UTF-8 honestly', () => {
    expect(drill.includes('`\\ufeff${[header, ...rows].join(\'\\r\\n\')}`')).toBe(true);
  });

  it('the export button exists, whole-sheet by law, named for the ear', () => {
    expect(drill.includes('data-testid="sheet-drill-export"')).toBe(true);
    expect(drill.includes('aria-label={`Download all ${data.lines.length} lines as CSV`}')).toBe(true);
    expect(drill.includes('title="the whole sheet, one file — the finder narrows the reading, never the export"')).toBe(true);
  });

  it('the button hides on a line-less sheet (an absent control never lies)', () => {
    expect(drill.includes('{data && data.lines.length > 0 && (')).toBe(true);
  });

  it('the file name carries the branch, the day, the status', () => {
    expect(drill.includes('`count-sheet-${data.store.code ?? \'branch\'}-${stamp}-${data.status.toLowerCase()}.csv`')).toBe(true);
  });

  it('zero new fetch — the builder eats the lines the drill already holds', () => {
    expect(drill.includes('const csv = sheetLinesCsv(data.lines, { costGated });')).toBe(true);
  });
});

// ── THE STYLING DETAILS ──────────────────────────────────────────────────

describe('the styling details (v2.224.0)', () => {
  it('the hint chip rides the muted family at 3:1 (a receipt, not a shout)', () => {
    expect(dialog.includes('bg-slate-100 px-1.5 py-0.5 font-mono text-[9px] tabular-nums text-slate-600 ring-1 ring-slate-200 dark:bg-slate-500/10 dark:text-slate-300 dark:ring-slate-500/30')).toBe(true);
  });

  it('the CSV button wears the house border family + the amber focus ring', () => {
    expect(drill.includes('flex h-6 items-center gap-1 rounded-md border border-slate-200 bg-white px-1.5 text-[10px] font-semibold text-slate-600 transition-colors hover:bg-slate-50 focus:outline-none focus:ring-1 focus:ring-amber-500/40 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800')).toBe(true);
  });

  it('the download glass is decorative — the label carries the meaning', () => {
    expect(drill.includes('<Download className="h-3 w-3" aria-hidden="true" />')).toBe(true);
  });
});
