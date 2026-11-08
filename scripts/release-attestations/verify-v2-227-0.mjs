#!/usr/bin/env node
// verify-v2-227-0.mjs — the v2.227.0 release gate.
//
// Reads the SOURCE OF RECORD and asserts the release's laws: THE
// SHEET'S PAPER (the sheet-printing body class gate living exactly as
// long as the door, the overlay/card print attributes, the controls
// marked off the paper, the stylesheet's silence-and-layout block with
// exact color, the Print button named for the ear and absent until the
// sheet has loaded AND froze lines, the amber focus ring), THE
// WATCHLIST STITCH (the wire answers watchlistHints per row, the
// stitch rides inside runWithoutTenant, the candidates are
// catalog-bounded, the supplier of record is the branch watchlist's
// own derivation, the low law is the watchlist law, the chip wears
// amber at 3:1 and zero stays silent, the roster CSV keeps its seven
// columns), and the release face: package.json / VERSION / whats-new /
// CHANGELOG all speak 2.227.0.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

let failures = 0;
let pass = 0;
const ok = (name, cond) => {
  if (cond) { pass++; console.log(`PASS  ${name}`); }
  else { failures++; console.log(`FAIL  ${name}`); }
};
const read = (p) => readFileSync(join(process.cwd(), p), 'utf8');

const ledger = read('src/components/org/po-ledger.tsx');
const sheetDrill = read('src/components/org/sheet-drill.tsx');
const globals = read('src/app/globals.css');
const wire = read('src/app/api/org/purchase-orders/route.ts');
const pkg = JSON.parse(read('package.json'));
const version = read('VERSION').trim();
const whatsNew = read('src/lib/whats-new.ts');
const changelog = read('CHANGELOG.md');

console.log('— the release face —');
ok('package.json releaseVersion 2.227.0', pkg.mbumah.releaseVersion === '2.227.0');
ok('package.json baseVersion 2.227.0', pkg.mbumah.baseVersion === '2.227.0');
ok('package.json version 2.227.0', pkg.version === '2.227.0');
ok('VERSION 2.227.0', version === '2.227.0');
ok('whats-new entry at the head', whatsNew.includes("version: '2.227.0',") && whatsNew.indexOf("version: '2.227.0',") < whatsNew.indexOf("version: '2.226.0',"));
ok('whats-new title speaks the sheet', whatsNew.includes("title: 'The sheet’s paper',"));
ok('changelog anchors the section above its ancestor (headers, never bare strings)', changelog.indexOf('## [2.227.0]') >= 0 && changelog.indexOf('## [2.227.0]') < changelog.indexOf('## [2.226.0]'));

console.log('— the sheet\u2019s print face —');
ok('the body-class gate lives exactly as long as the door (mount/unmount, above the null guard)', sheetDrill.includes("useEffect(() => {\n    document.body.classList.add('sheet-printing');\n    return () => document.body.classList.remove('sheet-printing');\n  }, []);") && sheetDrill.indexOf("document.body.classList.add('sheet-printing')") < sheetDrill.indexOf('if (!target) return null;'));
ok('the overlay carries the print anchor', sheetDrill.includes('data-sheet-print-overlay=""'));
ok('the card carries the print anchor', sheetDrill.includes('data-sheet-print=""'));
ok('the controls stay off the paper (close, print, csv, finder, count)', (sheetDrill.match(/data-sheet-print-off=""/g) || []).length >= 5);
ok('the stylesheet silences the shell only while the door is open', globals.includes('body.sheet-printing * { visibility: hidden; }'));
ok('the overlay becomes the page', globals.includes('body.sheet-printing [data-sheet-print-overlay] {\n    position: absolute !important;'));
ok('the sheet lays flat (no border, no shadow, no clip)', globals.includes('body.sheet-printing [data-sheet-print] {\n    max-height: none !important;') && globals.includes('box-shadow: none !important;'));
ok('the chips keep their colors on paper', globals.includes('print-color-adjust: exact !important;'));
ok('the lines list unclips for the paper', globals.includes('[data-testid="sheet-drill-lines-list"]'));
ok('the Print button exists, named for the ear', sheetDrill.includes('data-testid="sheet-drill-print"') && sheetDrill.includes('aria-label={`Print all ${data.lines.length} lines of the count sheet at ${target.storeName}`}') && sheetDrill.includes("title=\"the sheet's paper — the face lays itself on the page; the controls stay off the paper\""));
ok('the Print button is the whole machinery (window.print; the stylesheet does the work)', sheetDrill.includes('onClick={() => window.print()}'));
ok('the Print button mounts beside the CSV under the SAME gate', sheetDrill.includes('{data && data.lines.length > 0 && (') && sheetDrill.indexOf('data-testid="sheet-drill-print"') < sheetDrill.indexOf('data-testid="sheet-drill-export"'));
ok('the Print button wears the AMBER focus ring (the sheet\u2019s hue)', (() => { const i = sheetDrill.indexOf('data-testid="sheet-drill-print"'); const blk = sheetDrill.slice(i, i + 900); return blk.includes('focus:ring-amber-500/40') && !blk.includes('focus:ring-sky-500/40'); })());
ok('the v2.226 PO paper stands untouched', globals.includes('body.po-printing * { visibility: hidden; }') && globals.includes('body.po-printing [data-po-print-off] { display: none !important; }'));

console.log('— the watchlist stitch —');
ok('the wire answers watchlistHints per row (additive)', wire.includes('watchlistHints: result.hints.get(`${po.store.id}:${po.supplier.id}`) ?? 0,'));
ok('the cost law rides untouched (null past the gate)', wire.includes('totalAmount: canViewCost ? Number(po.totalAmount) : null,'));
ok('the stitch rides INSIDE the same runWithoutTenant', wire.indexOf('runWithoutTenant') > -1 && wire.indexOf('THE WATCHLIST STITCH') > wire.indexOf('runWithoutTenant') && wire.indexOf('THE WATCHLIST STITCH') < wire.indexOf('const canViewCost'));
ok('the candidates are catalog-bounded (active products of the window\u2019s stores only)', wire.includes('where: { storeId: { in: storeIds }, isActive: true },'));
ok('the supplier of record is the branch watchlist\u2019s own derivation (newest-first, first sight pins)', wire.includes("orderBy: { purchaseOrder: { orderDate: 'desc' } },") && wire.includes('if (!supplierByProduct.has(item.productId)) {'));
ok('the low law is the watchlist law (stock at or below reorder)', wire.includes('Number(p.quantityInStock) <= Number(p.reorderLevel)'));
ok('the stitch answers for the narrowing (store+supplier keys from the window)', wire.includes('const storeIds = [...new Set(rows.map((po) => po.store.id))];') && wire.includes('const supplierIds = [...new Set(rows.map((po) => po.supplier.id))];'));
ok('the row wears the whisper, zero stays silent', ledger.includes('{po.watchlistHints > 0 && (') && ledger.includes('data-testid="po-ledger-watchlist-hint"'));
ok('the chip wears the amber family at 3:1 (light and dark halves)', ledger.includes('bg-amber-50 px-1.5 py-0.5 text-[9px] font-semibold tabular-nums text-amber-700 ring-1 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/30'));
ok('the chip\u2019s title speaks the whole sentence', ledger.includes("${po.watchlistHints} ${po.watchlistHints === 1 ? 'row' : 'rows'} on ${po.store.name}'s watchlist ${po.watchlistHints === 1 ? 'hints' : 'hint'} at this supplier"));
ok('the roster CSV keeps its seven columns', ledger.includes("const header = 'po_number,status,supplier,branch,lines,ordered_day,total_kes';"));

console.log(`\n${pass} passed, ${failures} failed`);
process.exit(failures > 0 ? 1 : 0);
