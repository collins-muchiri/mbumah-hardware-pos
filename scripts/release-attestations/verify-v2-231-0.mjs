#!/usr/bin/env node
// verify-v2-231-0.mjs — the v2.231.0 release gate.
//
// Reads the SOURCE OF RECORD and asserts the release's laws: THE LINE
// NAMES ITS SHELF, AT BRANCH LEVEL (the branch detail wire's additive
// category join — the same join the org drill's wire grew in v2.230.0,
// one query, zero new fetches; the client type optional), THE WALK'S
// INSTRUMENTS (a category lens + a name/SKU finder on the branch sheet
// face — buckets derived from the HELD lines, "uncategorized" a real
// bucket sorted last, the lens mounts only past one bucket, the whole
// instruments row stays off the paper), THE COMPOSED READING (one
// filter answers to lens AND needle; the honest N of M; the progress
// and the Print aria keep the whole-sheet truth; the empty face grows
// honest variants), THE FRESH-DOOR LAW (every door-opening resets the
// instruments — by construction, never by effect), THE SHELF WHISPER
// ON THE WALK (the line wears its category while the sheet spans
// buckets — and it PRINTS), and the laws that stand (the CSV keeps the
// whole sheet's seven columns; the drill's own lens stands untouched).
// Plus the release face: package.json / VERSION / whats-new / CHANGELOG
// all speak 2.231.0.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

let failures = 0;
let pass = 0;
const ok = (name, cond) => {
  if (cond) { pass++; console.log(`PASS  ${name}`); }
  else { failures++; console.log(`FAIL  ${name}`); }
};
const read = (p) => readFileSync(join(process.cwd(), p), 'utf8');

const panel = read('src/components/inventory/stock-take-panel.tsx');
const branchWire = read('src/app/api/stock-takes/[id]/route.ts');
const drill = read('src/components/org/sheet-drill.tsx');
const pkg = JSON.parse(read('package.json'));
const version = read('VERSION').trim();
const whatsNew = read('src/lib/whats-new.ts');
const changelog = read('CHANGELOG.md');

console.log('— the release face —');
ok('package.json releaseVersion 2.231.0', pkg.mbumah.releaseVersion === '2.231.0');
ok('package.json baseVersion 2.231.0', pkg.mbumah.baseVersion === '2.231.0');
ok('package.json version 2.231.0', pkg.version === '2.231.0');
ok('VERSION 2.231.0', version === '2.231.0');
ok('verify gate wired', pkg.scripts['verify:v2-231-0'] === 'node scripts/verify-v2-231-0.mjs');
ok('whats-new entry at the head', whatsNew.includes("version: '2.231.0',") && whatsNew.indexOf("version: '2.231.0',") < whatsNew.indexOf("version: '2.230.0',"));
ok('whats-new title speaks the branch lens', whatsNew.includes("title: 'The branch lens',"));
ok('changelog anchors the section above its ancestor (headers, never bare strings)', changelog.indexOf('## [2.231.0]') >= 0 && changelog.indexOf('## [2.231.0]') < changelog.indexOf('## [2.230.0]'));

console.log('— the branch wire: the line names its shelf —');
ok('the product select joins the category name', branchWire.includes('category: { select: { name: true } }'));
ok('the line mapping speaks the shelf — null stays null', branchWire.includes('category: l.product.category?.name ?? null,'));
ok('the wire names its law (the v2.231 comment stands)', branchWire.includes('THE BRANCH LENS'));

console.log('— the walk\u2019s instruments —');
ok('the lens state is a door-state pair', panel.includes("const [needle, setNeedle] = useState('');") && panel.includes("const [categoryNeedle, setCategoryNeedle] = useState('all');"));
ok('the SheetLine type grows the optional shelf', panel.includes('category?: string | null;'));
ok('the buckets derive from the HELD lines', panel.includes("Array.from(new Set(detail.lines.map((l) => l.category ?? 'uncategorized')))"));
ok('uncategorized sorts LAST (named shelves first)', panel.includes("(a === 'uncategorized' ? 1 : 0) - (b === 'uncategorized' ? 1 : 0) || a.localeCompare(b)"));
ok('the lens mounts only past one bucket', panel.includes('const lensActive = categoryBuckets.length > 1;'));
ok('the lens is a select with the branch testid', panel.includes('data-testid="stocktake-lens"'));
ok('the lens aria names the shelf filter', panel.includes('aria-label="Filter the lines by category"'));
ok('the all-categories door exists', panel.includes('<option value="all">all categories</option>'));
ok('the finder the branch never had', panel.includes('data-testid="stocktake-finder"') && panel.includes('data-testid="stocktake-finder-clear"'));
ok('the finder aria names the line search', panel.includes('aria-label="Find a line by name or SKU"'));
ok('the honest N-of-M count', panel.includes('data-testid="stocktake-finder-count"'));
ok('the lensed shelf names itself in amber', panel.includes('data-testid="stocktake-lens-count"'));
ok('the instruments row stays off the paper', panel.includes('<div className="flex flex-wrap items-center gap-1.5" data-sheet-print-off="">'));
ok('the row mounts only when the sheet froze lines', panel.includes('{detail.lines.length > 0 && (\n              <div className="flex flex-wrap items-center gap-1.5" data-sheet-print-off="">'));

console.log('— the composed reading —');
ok('one filter answers to lens AND needle', panel.includes("(categoryNeedle === 'all' || (l.category ?? 'uncategorized') === categoryNeedle) &&"));
ok('the needle reads name AND SKU, case-insensitive', panel.includes('l.name.toLowerCase().includes(cleanNeedle) ||') && panel.includes('l.sku.toLowerCase().includes(cleanNeedle)'));
ok('the list renders the narrowed reading', panel.includes('{shownLines.map((line) => {'));
ok('the empty face grows honest variants', panel.includes('data-testid="stocktake-finder-empty"') && panel.includes('answers \u201c') && panel.includes('the lens came back empty'));
ok('the whole count rides every variant', panel.includes('the sheet holds ${num(detail.lines.length)}'));
ok('the progress bar keeps the whole-sheet truth', panel.includes('aria-label={`Counted ${detail.summary.countedLines} of ${detail.summary.totalLines} lines`}'));

console.log('— the fresh-door law —');
ok('the roster door resets the instruments', panel.includes("setNeedle('');\n                      setCategoryNeedle('all');\n                      setOpenSheetId(sheet.id);"));
ok('the create door resets the instruments', panel.includes("setNeedle('');\n      setCategoryNeedle('all');\n      setOpenSheetId(data.id);"));
ok('the back door resets the instruments', panel.includes("setOpenSheetId(null);\n                      setNeedle('');\n                      setCategoryNeedle('all');"));

console.log('— the shelf whisper on the walk —');
ok('the line wears its shelf while the sheet spans buckets', panel.includes('{lensActive && (') && panel.includes('data-testid="stocktake-line-shelf"'));
ok('the whisper reads the honest bucket', panel.includes("{line.category ?? 'uncategorized'}"));
ok('the whisper PRINTS (no print-off mark on it)', !/stocktake-line-shelf"[^>]*data-sheet-print-off/.test(panel));

console.log('— the laws that stand —');
ok('the CSV keeps the whole sheet (seven columns, unchanged)', drill.includes("const header = 'product,sku,unit,snapshot,counted,variance,variance_cost_kes';"));
ok('the export still reads the WHOLE sheet, not the reading', panel.includes('sheetLinesCsv(detail.lines, { costGated: sheetCostGated })'));
ok('the Print aria names the whole count', panel.includes('`Print the floor\'s clipboard — ${detail.lines.length} lines with empty count boxes`'));
ok('the drill\u2019s own lens stands untouched', drill.includes('data-testid="sheet-drill-lens"') && drill.includes('const lensActive = categoryBuckets.length > 1;'));
ok('the fresh-door reset exists on the drill\u2019s sibling too (per-door state law)', drill.includes("const [categoryNeedle, setCategoryNeedle] = useState('all');"));
ok('the print vocabulary stands', panel.includes("document.body.classList.add('sheet-printing')") && panel.includes('data-sheet-print-overlay'));

console.log(`\n${pass} passed, ${failures} failed`);
process.exit(failures > 0 ? 1 : 0);
