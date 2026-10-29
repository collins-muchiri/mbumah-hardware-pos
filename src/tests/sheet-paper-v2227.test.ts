// v2.227.0 — the sheet's paper.
//
//   - THE SHEET'S PRINT FACE: the CSV was the ring binder's file; the
//     print face is its paper. While a count-sheet drill is open the
//     body carries the sheet-printing class (a mount/unmount lifecycle
//     effect riding ABOVE the null guard — hooks never ride a
//     conditional), and the print stylesheet silences the shell and
//     lays the open sheet on the page: header, tiles, notes, lines.
//     The controls (close, finder, CSV/Print, N-of-M) stay off the
//     paper via data-sheet-print-off — a control is a screen thing.
//     Chips keep their colors (print-color-adjust: exact). Without an
//     open drill the class is absent and printing behaves as before;
//     the v2.226 PO paper stands untouched (two doors, never both).
//   - THE SHEET'S PRINT BUTTON: names the act for the ear and the eye,
//     mounts beside the CSV under the SAME gate (a sheet that froze no
//     lines prints nothing but silence — an absent control never
//     lies); window.print() is the whole machinery. The AMBER focus
//     ring — the sheet's hue (the PO's print button keeps its sky).
//   - THE WATCHLIST STITCH: the ledger wire answers, per row,
//     watchlistHints — how many low products at the row's OWN store
//     last spoke to the row's supplier (the branch low-stock wire's
//     own supplier-of-record derivation: the most recent PO that
//     carried the product wins). Two bounded queries ride INSIDE the
//     same runWithoutTenant (the v2.57.0 leak class never shrinks an
//     org read) and the stitch answers for the narrowing. The row
//     wears the count on an amber chip (the watchlist's own family,
//     3:1 both halves); zero stays silent — absence stays absent, never
//     a padded chip. The roster CSV keeps its seven columns (the
//     stitch is a live whisper, not a row of the file).
//
// Every pin reads the SOURCE OF RECORD (source bytes, not memory).

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it, expect } from 'vitest';

const read = (p: string) => readFileSync(join(process.cwd(), p), 'utf8');

const ledger = read('src/components/org/po-ledger.tsx');
const sheetDrill = read('src/components/org/sheet-drill.tsx');
const globals = read('src/app/globals.css');
const wire = read('src/app/api/org/purchase-orders/route.ts');
const roster = read('src/components/org/po-ledger.tsx');
const pkg = JSON.parse(read('package.json'));
const changelog = read('CHANGELOG.md');
const feed = read('src/lib/whats-new.ts');
const version = String(pkg.version);

// ── THE RELEASE FACE ─────────────────────────────────────────────────────

describe('the round of record (v2.227.0)', () => {
  it('package.json leads 2.227.0 (all three slots)', () => {
    expect(version).toBe('2.256.0');
    expect(pkg.mbumah.releaseVersion).toBe('2.256.0');
    expect(pkg.mbumah.baseVersion).toBe('2.256.0');
  });

  it('the changelog anchors the section ABOVE its ancestor (the structural pin — headers, never bare strings)', () => {
    expect(changelog.indexOf('## [2.227.0]')).toBeGreaterThanOrEqual(0);
    expect(changelog.indexOf('## [2.227.0]')).toBeLessThan(changelog.indexOf('## [2.226.0]'));
  });

  it('whats-new speaks the sheet at the head', () => {
    expect(feed.includes("version: '2.227.0',")).toBe(true);
    expect(feed.indexOf("version: '2.227.0',")).toBeLessThan(feed.indexOf("version: '2.226.0',"));
    expect(feed.includes("title: 'The sheet’s paper',")).toBe(true);
  });
});

// ── THE SHEET'S PRINT FACE ────────────────────────────────────────────────

describe('the sheet drill paper (v2.227.0)', () => {
  it('the body-class gate lives exactly as long as the door (mount/unmount, above the null guard)', () => {
    const gate = "useEffect(() => {\n    document.body.classList.add('sheet-printing');\n    return () => document.body.classList.remove('sheet-printing');\n  }, []);";
    expect(sheetDrill.includes(gate)).toBe(true);
    expect(sheetDrill.indexOf("document.body.classList.add('sheet-printing')")).toBeGreaterThan(-1);
    expect(sheetDrill.indexOf("document.body.classList.add('sheet-printing')")).toBeLessThan(sheetDrill.indexOf('if (!target) return null;'));
  });

  it('the overlay and the card carry the print anchors', () => {
    expect(sheetDrill.includes('data-sheet-print-overlay=""')).toBe(true);
    expect(sheetDrill.includes('data-sheet-print=""')).toBe(true);
  });

  it('the controls stay off the paper (close, print, csv, finder, count)', () => {
    expect((sheetDrill.match(/data-sheet-print-off=""/g) || []).length).toBeGreaterThanOrEqual(5);
  });

  it('the stylesheet silences the shell only while the door is open', () => {
    expect(globals.includes('body.sheet-printing * { visibility: hidden; }')).toBe(true);
    expect(globals.includes('body.sheet-printing [data-sheet-print-overlay],\n  body.sheet-printing [data-sheet-print-overlay] * { visibility: visible; }')).toBe(true);
  });

  it('the sheet lays flat on the page (no border, no shadow, no clip), chips keep their colors', () => {
    expect(globals.includes('body.sheet-printing [data-sheet-print] {\n    max-height: none !important;')).toBe(true);
    expect(globals.includes('body.sheet-printing [data-sheet-print] {\n    max-height: none !important;\n    max-width: none !important;\n    width: 100% !important;\n    overflow: visible !important;\n    border: 0 !important;\n    border-radius: 0 !important;\n    box-shadow: none !important;\n    padding: 0 !important;\n    -webkit-print-color-adjust: exact !important;\n    print-color-adjust: exact !important;\n  }')).toBe(true);
  });

  it('the controls vanish from the paper; the lines list unclips', () => {
    expect(globals.includes('body.sheet-printing [data-sheet-print-off] { display: none !important; }')).toBe(true);
    expect(globals.includes('[data-testid="sheet-drill-lines-list"] {\n    max-height: none !important;\n    overflow: visible !important;\n  }')).toBe(true);
  });

  it('the v2.226 PO paper stands untouched (two doors, never both — separate class families)', () => {
    expect(globals.includes('body.po-printing * { visibility: hidden; }')).toBe(true);
    expect(globals.includes('data-po-print-off')).toBe(true);
  });

  it('the Print button exists, named for the ear, and is the whole machinery (v2.228.0: the aria grew the clipboard mode — both arms stay named)', () => {
    expect(sheetDrill.includes('data-testid="sheet-drill-print"')).toBe(true);
    // v2.228.0: the record face's arm of the mode-conditional (the clipboard's arm is the new round's pin).
    expect(sheetDrill.includes('`Print all ${data.lines.length} lines of the count sheet at ${target.storeName}`')).toBe(true);
    expect(sheetDrill.includes("the sheet's paper — the face lays itself on the page; the controls stay off the paper")).toBe(true);
    expect(sheetDrill.includes('onClick={() => window.print()}')).toBe(true);
  });

  it('the Print button mounts beside the CSV under the SAME gate (an absent control never lies)', () => {
    const gateIdx = sheetDrill.indexOf('{data && data.lines.length > 0 && (');
    const printIdx = sheetDrill.indexOf('data-testid="sheet-drill-print"');
    const csvIdx = sheetDrill.indexOf('data-testid="sheet-drill-export"');
    expect(gateIdx).toBeGreaterThan(-1);
    expect(printIdx).toBeGreaterThan(gateIdx);
    expect(csvIdx).toBeGreaterThan(printIdx);
  });

  it('the Print button wears the sheet drill\'s amber focus ring (the PO\'s keeps its sky; v2.228.0: the block reads to the CSV sibling — the conditional aria grew the window)', () => {
    const printBlock = sheetDrill.slice(sheetDrill.indexOf('data-testid="sheet-drill-print"'), sheetDrill.indexOf('data-testid="sheet-drill-export"'));
    expect(printBlock.includes('focus:ring-amber-500/40')).toBe(true);
    expect(printBlock.includes('focus:ring-sky-500/40')).toBe(false);
  });
});

// ── THE WATCHLIST STITCH ──────────────────────────────────────────────────

describe('the watchlist stitch (v2.227.0)', () => {
  it('the wire answers watchlistHints per row (additive; the cost law untouched; v2.228.0: the hint grew its speakers — the count reads the entry, never a bare map miss)', () => {
    expect(wire.includes('watchlistHints: result.hints.get(`${po.store.id}:${po.supplier.id}`)?.count ?? 0,')).toBe(true);
    expect(wire.includes('totalAmount: canViewCost ? Number(po.totalAmount) : null,')).toBe(true);
  });

  it('the stitch rides INSIDE the same runWithoutTenant (an org read is org-wide — the leak class never shrinks it)', () => {
    const blockStart = wire.indexOf('runWithoutTenant');
    const stitchStart = wire.indexOf('THE WATCHLIST STITCH');
    const blockEnd = wire.indexOf('const canViewCost');
    expect(blockStart).toBeGreaterThan(-1);
    expect(stitchStart).toBeGreaterThan(blockStart);
    expect(stitchStart).toBeLessThan(blockEnd);
  });

  it('the candidates are catalog-bounded: active products of ONLY the window\'s stores (v2.228.0: name rode along — one cheap column, so the whisper can speak its speakers)', () => {
    expect(wire.includes('where: { storeId: { in: storeIds }, isActive: true },')).toBe(true);
    expect(wire.includes('select: { id: true, storeId: true, name: true, quantityInStock: true, reorderLevel: true },')).toBe(true);
  });

  it('the supplier of record is the branch watchlist\'s own derivation (most recent PO wins; newest-first, first sight pins)', () => {
    expect(wire.includes("orderBy: { purchaseOrder: { orderDate: 'desc' } },")).toBe(true);
    expect(wire.includes('if (!supplierByProduct.has(item.productId)) {')).toBe(true);
  });

  it('the low law is the watchlist law: stock at or below the reorder level', () => {
    expect(wire.includes('Number(p.quantityInStock) <= Number(p.reorderLevel)')).toBe(true);
  });

  it('the stitch answers for the narrowing (store + supplier keys from the loaded window)', () => {
    expect(wire.includes('const storeIds = [...new Set(rows.map((po) => po.store.id))];')).toBe(true);
    expect(wire.includes('const supplierIds = [...new Set(rows.map((po) => po.supplier.id))];')).toBe(true);
  });

  it('the row wears the whisper: amber family, 3:1 both halves, tabular-nums, zero stays silent (v2.228.0: the chip became a trigger of its own — hover and focus joined the amber)', () => {
    expect(ledger.includes('{po.watchlistHints > 0 && (')).toBe(true);
    expect(ledger.includes('data-testid="po-ledger-watchlist-hint"')).toBe(true);
    expect(ledger.includes('bg-amber-50 px-1.5 py-0.5 text-[9px] font-semibold tabular-nums text-amber-700')).toBe(true);
    expect(ledger.includes('dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/30')).toBe(true);
  });

  it('the chip\'s title speaks the whole sentence (branch named, row/rows and hint/hint honest plurals)', () => {
    expect(ledger.includes("${po.watchlistHints} ${po.watchlistHints === 1 ? 'row' : 'rows'} on ${po.store.name}'s watchlist ${po.watchlistHints === 1 ? 'hints' : 'hint'} at this supplier")).toBe(true);
  });

  it('the roster CSV keeps its stitch a live whisper (the birth column rode the file at v2.249.0, the aisle beside it at v2.250.0 — the stitch is still not a row of the file; the band rides beside the aisle at v2.251.0)', () => {
    expect(roster.includes("const header = 'po_number,status,supplier,branch,lines,ordered_day,total_kes,birth,aisle,aisle_band';")).toBe(true);
  });
});
