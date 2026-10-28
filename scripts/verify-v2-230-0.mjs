#!/usr/bin/env node
// verify-v2-230-0.mjs — the v2.230.0 release gate.
//
// Reads the SOURCE OF RECORD and asserts the release's laws: THE LINE
// NAMES ITS SHELF (the drill wire's additive category join — one query,
// zero new fetches; the client type optional so the branch panel stays
// assignable), THE SHEET'S LENS (the category select beside the finder —
// buckets derived from the HELD lines, "uncategorized" a real bucket
// sorted last, the control mounts only past one bucket, the lens is
// per-door STATE like the needle), THE COMBINED READING (one filter
// answers to lens AND needle; the count stays an honest N of M; the
// tiles keep the whole-sheet truth; the empty face grows honest
// variants), THE SHELF WHISPER (the line wears its category while the
// sheet spans buckets — and it PRINTS), and the laws that stand (the
// CSV keeps the whole sheet's seven columns; the cost gate renders the
// honest absence; the drill stays read-only). Plus the release face:
// package.json / VERSION / whats-new / CHANGELOG all speak 2.230.0.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

let failures = 0;
let pass = 0;
const ok = (name, cond) => {
  if (cond) { pass++; console.log(`PASS  ${name}`); }
  else { failures++; console.log(`FAIL  ${name}`); }
};
const read = (p) => readFileSync(join(process.cwd(), p), 'utf8');

const drill = read('src/components/org/sheet-drill.tsx');
const wire = read('src/app/api/org/stock-takes/[id]/route.ts');
const map = read('src/components/org/variance-map.tsx');
const panel = read('src/components/inventory/stock-take-panel.tsx');
const pkg = JSON.parse(read('package.json'));
const version = read('VERSION').trim();
const whatsNew = read('src/lib/whats-new.ts');
const changelog = read('CHANGELOG.md');

console.log('— the release face —');
ok('package.json releaseVersion 2.230.0', pkg.mbumah.releaseVersion === '2.230.0');
ok('package.json baseVersion 2.230.0', pkg.mbumah.baseVersion === '2.230.0');
ok('package.json version 2.230.0', pkg.version === '2.230.0');
ok('VERSION 2.230.0', version === '2.230.0');
ok('verify gate wired', pkg.scripts['verify:v2-230-0'] === 'node scripts/verify-v2-230-0.mjs');
ok('whats-new entry at the head', whatsNew.includes("version: '2.230.0',") && whatsNew.indexOf("version: '2.230.0',") < whatsNew.indexOf("version: '2.229.0',"));
ok('whats-new title speaks the lens', whatsNew.includes('title: "The sheet\'s lens",'));
ok('changelog anchors the section above its ancestor (headers, never bare strings)', changelog.indexOf('## [2.230.0]') >= 0 && changelog.indexOf('## [2.230.0]') < changelog.indexOf('## [2.229.0]'));

console.log('— the wire: the line names its shelf —');
ok('the product select joins the category name', wire.includes('category: { select: { name: true } },'));
ok('the line mapping speaks the shelf (null stays null)', wire.includes('category: l.product.category?.name ?? null,'));
ok('one query — the growth rides the existing findUnique', (wire.match(/findUnique/g) || []).length === 1);
ok('the cost law stands (the gate keeps the honest absence)', wire.includes('canViewCost ? Math.round(varianceValueEstimate * 100) / 100 : null'));
ok('the org gate stands (ORG_ROLES unchanged)', wire.includes("const ORG_ROLES = ['SUPER_ADMIN', 'STORE_OWNER', 'BRANCH_MANAGER'];"));
ok('the client type is optional (the branch panel stays assignable)', drill.includes('category?: string | null;'));
ok('the branch panel still imports the drill\u2019s one CSV builder', panel.includes("import { sheetLinesCsv } from '@/components/org/sheet-drill';"));

console.log('— the sheet\u2019s lens —');
ok('the lens is a select with its own testid', drill.includes('data-testid="sheet-drill-lens"'));
ok('the lens\u2019s aria names the act', drill.includes('aria-label="Filter the lines by category"'));
ok('the lens stays off the paper (a control is a screen thing)', /data-testid="sheet-drill-lens"\s+data-sheet-print-off=""/.test(drill));
ok('the all-categories option exists', drill.includes('<option value="all">all categories</option>'));
ok('buckets derive from the HELD lines (zero new fetch)', drill.includes("data.lines.map((l) => l.category ?? 'uncategorized')"));
ok('"uncategorized" sorts last (named shelves first)', drill.includes("(a === 'uncategorized' ? 1 : 0) - (b === 'uncategorized' ? 1 : 0)"));
ok('the lens mounts only past one bucket', drill.includes('const lensActive = categoryBuckets.length > 1;') && drill.includes('{lensActive && ('));
ok('the lens is per-door STATE (a fresh door reads "all")', drill.includes("const [categoryNeedle, setCategoryNeedle] = useState('all');") && map.includes('<SheetDrill key={drill.id}'));

console.log('— the combined reading —');
ok('one filter answers to BOTH instruments', drill.includes("(categoryNeedle === 'all' || (l.category ?? 'uncategorized') === categoryNeedle) &&"));
ok('the count stays an honest N of M', drill.includes('{num(shownLines.length)} of {num(data.lines.length)}'));
ok('a lensed shelf names itself beside the count', drill.includes('data-testid="sheet-drill-lens-count"') && drill.includes('in {categoryNeedle}'));
ok('the empty face names shelf + needle', drill.includes("cleanNeedle !== '' || categoryNeedle !== 'all'") && drill.includes('no line in \u201c${categoryNeedle}\u201d answers'));
ok('the empty face keeps the lens-alone fallback', drill.includes('the lens came back empty'));

console.log('— the shelf whisper —');
ok('the line wears its category while the sheet spans buckets', drill.includes('data-testid="sheet-drill-line-category"') && drill.includes("{l.category ?? 'uncategorized'}"));
ok('the whisper rides the lensActive gate', drill.includes('{lensActive && (\n                          <span data-testid="sheet-drill-line-category"'));
ok('the whisper PRINTS (no print-off mark on it)', !/sheet-drill-line-category"[^>]*data-sheet-print-off/.test(drill));

console.log('— the laws that stand —');
ok('the CSV keeps the whole sheet (seven columns, unchanged)', drill.includes("const header = 'product,sku,unit,snapshot,counted,variance,variance_cost_kes';"));
ok('the cost gate renders the honest absence', drill.includes("'the shillings stay behind the cost gate'"));
ok('the finder keeps its own door', drill.includes('data-testid="sheet-drill-finder"') && drill.includes('data-testid="sheet-drill-finder-clear"'));
ok('the drill stays read-only by law', drill.includes('read-only — the branch sheet keeps the pens'));
ok('the print vocabulary stands', drill.includes("document.body.classList.add('sheet-printing')") && drill.includes('data-sheet-print-overlay'));

console.log(`\n${pass} passed, ${failures} failed`);
process.exit(failures > 0 ? 1 : 0);
