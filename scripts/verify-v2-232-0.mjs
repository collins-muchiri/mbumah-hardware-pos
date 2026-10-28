#!/usr/bin/env node
// verify-v2-232-0.mjs — the v2.232.0 release gate.
//
// Reads the SOURCE OF RECORD and asserts the release's laws: THE LOOP
// CLOSES (the branch face's recount spawn — the create wire's
// explicit-list scope, notes naming the re-walked sheet, the fresh
// door opening in the same panel), THE THIRD INSTRUMENT (the
// variances-only lens on BOTH faces — aria-pressed, composing with
// the category lens and the finder over the SAME held lines, the
// whole-sheet truth untouched), THE ONE-OPEN-SHEET LAW KEEPS ITS
// TEETH (the blocked face speaks, the button is absent, the wire's
// 409 stands), THE DRILL STAYS READ-ONLY (the recount door is an
// ANCHOR addressed by the wire's additive slug, never a button), and
// the styling house (each face's own scale, the amber family, dark
// halves from birth, print-off marks on every control). Plus the
// release face: package.json / VERSION / whats-new / CHANGELOG all
// speak 2.232.0.

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
const drill = read('src/components/org/sheet-drill.tsx');
const orgWire = read('src/app/api/org/stock-takes/[id]/route.ts');
const createWire = read('src/app/api/stock-takes/route.ts');
const pkg = JSON.parse(read('package.json'));
const version = read('VERSION').trim();
const whatsNew = read('src/lib/whats-new.ts');
const changelog = read('CHANGELOG.md');

console.log('— the release face —');
ok('package.json releaseVersion 2.232.0', pkg.mbumah.releaseVersion === '2.232.0');
ok('package.json baseVersion 2.232.0', pkg.mbumah.baseVersion === '2.232.0');
ok('package.json version 2.232.0', pkg.version === '2.232.0');
ok('VERSION 2.232.0', version === '2.232.0');
ok('verify gate wired', pkg.scripts['verify:v2-232-0'] === 'node scripts/verify-v2-232-0.mjs');
ok('whats-new entry at the head', whatsNew.includes("version: '2.232.0',") && whatsNew.indexOf("version: '2.232.0',") < whatsNew.indexOf("version: '2.231.0',"));
ok('whats-new title speaks the recount', whatsNew.includes("title: 'The recount',"));
ok('changelog anchors the section above its ancestor (headers, never bare strings)', changelog.indexOf('## [2.232.0]') >= 0 && changelog.indexOf('## [2.232.0]') < changelog.indexOf('## [2.231.0]'));

console.log('— the third instrument (both faces) —');
ok('the branch face declares the per-door state', panel.includes('const [variancesOnly, setVariancesOnly] = useState(false);'));
ok('the drill declares the per-door state', drill.includes('const [variancesOnly, setVariancesOnly] = useState(false);'));
ok('both chips carry the house testids', panel.includes('data-testid="stocktake-variances-only"') && drill.includes('data-testid="sheet-drill-variances-only"'));
ok('both chips carry the aria-pressed law', panel.includes('aria-pressed={variancesOnly}') && drill.includes('aria-pressed={variancesOnly}'));
ok('the chip mounts only past one variance line (absent control never lies)', panel.includes('const variancesActive = varianceLines.length > 0;') && drill.includes('const variancesActive = varianceLines.length > 0;'));
ok('the variance derivation is honest (counted ≠ snapshot)', panel.includes('l.variance != null && l.variance !== 0') && drill.includes('l.variance != null && l.variance !== 0'));
ok('the three needles compose over the SAME held lines (one clause)', panel.includes('(!variancesOnly || (l.variance != null && l.variance !== 0))') && drill.includes('(!variancesOnly || (l.variance != null && l.variance !== 0))'));
ok('the empty face condition grew the variancesOnly arm (both faces)', panel.includes("(cleanNeedle !== '' || categoryNeedle !== 'all' || variancesOnly)") && drill.includes("(cleanNeedle !== '' || categoryNeedle !== 'all' || variancesOnly)"));
ok('the empty face speaks the composed variant (shelf + variances)', panel.includes('no line with a variance in “') && drill.includes('no line with a variance in “'));
ok('the chip names its population (variances only · N)', panel.includes('variances only · {num(varianceLines.length)}') && drill.includes('variances only · {num(varianceLines.length)}'));

console.log('— the fresh-door law (three instruments) —');
ok('the roster door resets all three', panel.includes("setNeedle('');\n                      setCategoryNeedle('all');\n                      setVariancesOnly(false);\n                      setOpenSheetId(sheet.id);"));
ok('the create door resets all three', panel.includes("setNeedle('');\n      setCategoryNeedle('all');\n      setVariancesOnly(false);\n      setOpenSheetId(data.id);"));
ok('the back door resets all three', panel.includes("setOpenSheetId(null);\n                      setNeedle('');\n                      setCategoryNeedle('all');\n                      setVariancesOnly(false);"));
ok('the recount door resets all three too', panel.includes("setNeedle('');\n      setCategoryNeedle('all');\n      setVariancesOnly(false);\n      invalidateSheets();"));

console.log('— the recount spawn (the pens\' face) —');
ok('the mutation POSTs the explicit-list scope', panel.includes("authorizedFetchJson('/api/stock-takes', {\n        method: 'POST',") && panel.includes('productIds: varianceProducts,'));
ok('the notes name the re-walked sheet', panel.includes('notes: `recount of sheet ${detail.id}`'));
ok('the population is the unique variance product ids', panel.includes('Array.from(new Set(varianceLines.map((l) => l.productId)))'));
ok('success opens the fresh door in the same panel', panel.includes("toast.success(`Recount open — ${data.lineCount} line${data.lineCount === 1 ? '' : 's'} to count`)") && panel.includes('setOpenSheetId(data.id);'));
ok('the server\'s refusal surfaces as the toast (never swallowed)', panel.includes("err instanceof Error ? err.message : 'the recount was refused'"));
ok('the zone mounts ONLY on a CLOSED face with variances', panel.includes('closedFace && varianceLines.length > 0 && ('));
ok('the zone speaks the one-open-sheet law while a sheet counts', panel.includes('data-testid="stocktake-recount-blocked"') && panel.includes('a sheet is already counting — the recount waits for the open sheet to close or cancel (the one-open-sheet law).'));
ok('the button is ABSENT while blocked (not disabled)', panel.includes('{openSheet ? (') && panel.includes('data-testid="stocktake-recount"'));
ok('the button names the real freeze (products)', panel.includes('Recount the variances — freeze ${num(varianceProducts.length)} product'));
ok('the zone stays off the paper', panel.includes('data-testid="stocktake-recount-zone" data-sheet-print-off=""'));
ok('the create wire\'s one-open-sheet 409 stands (the backstop)', createWire.includes('this branch already has a count sheet open — close or cancel it before opening another.') && createWire.includes('{ status: 409 }'));
ok('the create wire re-validates the list against THIS store', createWire.includes('id: { in: productIds }'));
ok('the create wire refuses an empty population honestly', createWire.includes('nothing to count.'));

console.log('— the recount door (the drill points, never pens) —');
ok('the drill wire\'s store select grew the additive slug (one query)', orgWire.includes('store: { select: { id: true, name: true, code: true, slug: true } }') && (orgWire.match(/db\.stockTake\.findUnique/g) ?? []).length === 1);
ok('the response mapping speaks the slug', orgWire.includes('slug: sheet.store.slug'));
ok('the client type stays optional', drill.includes('slug?: string | null'));
ok('the door is an ANCHOR (never a button — read-only by law)', drill.includes('<a\n                  data-testid="sheet-drill-recount-door"'));
ok('the door is addressed by the wire\'s OWN slug', drill.includes('href={`/stores/${data.store.slug}/inventory`}'));
ok('the door mounts ONLY on a CLOSED variance-bearing sheet in a slug store', drill.includes("data.status === 'CLOSED' && variancesActive && data.store.slug && ("));
ok('the door stays off the paper', drill.includes('data-testid="sheet-drill-recount-door"\n                  data-sheet-print-off=""'));
ok('the read-only law line still stands', drill.includes('read-only — the branch sheet keeps the pens; this face watches the floor&apos;s truth.'));

console.log('— the styling house —');
ok('the chips wear each face\'s own scale (h-7 branch, h-6 org)', panel.includes('inline-flex h-7 items-center gap-1 rounded-md px-2 text-[11px] font-semibold ring-1') && drill.includes('inline-flex h-6 items-center gap-1 rounded-md px-2 text-[10px] font-semibold ring-1'));
ok('the active chip is the amber family (the sheet\'s hue)', panel.includes("'bg-amber-700 text-white ring-amber-700 dark:bg-amber-600 dark:ring-amber-600'") && drill.includes("'bg-amber-700 text-white ring-amber-700 dark:bg-amber-600 dark:ring-amber-600'"));
ok('the idle chip carries the amber focus ring on both faces', (panel.match(/focus:ring-amber-500\/40/g) ?? []).length >= 2 && (drill.match(/focus:ring-amber-500\/40/g) ?? []).length >= 2);
ok('the recount zone wears the amber dashed family', panel.includes('border border-dashed border-amber-300 bg-amber-50/60 p-3 dark:border-amber-500/40 dark:bg-amber-500/10'));
ok('the drill\'s door wears the same family with its arrow', drill.includes('border border-dashed border-amber-300 bg-amber-50/60 px-3 py-2 text-[11px] font-semibold text-amber-800') && drill.includes('<ArrowRight className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />'));
ok('the recount button carries the RotateCcw glyph and the pending spin', panel.includes('<RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />') && panel.includes('<Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />'));
ok('dark halves from birth on the zone and the door', panel.includes('dark:border-amber-500/40 dark:bg-amber-500/10') && drill.includes('dark:border-amber-500/40 dark:bg-amber-500/10'));

console.log('— the laws that stand —');
ok('the CSV keeps the whole sheet on BOTH faces (never the narrowed reading)', panel.includes('sheetLinesCsv(detail.lines') && !panel.includes('sheetLinesCsv(shownLines') && drill.includes('sheetLinesCsv(data.lines') && !drill.includes('sheetLinesCsv(shownLines'));
ok('the progress bar keeps the whole-sheet truth', panel.includes('data-testid="stocktake-progress"') && panel.includes('{detail.summary.countedLines} of {detail.summary.totalLines} counted'));
ok('the drill\'s tiles keep the whole-sheet arithmetic', drill.includes('data-testid="sheet-drill-units"') && drill.includes('num(data.summary.varianceUnits)'));
ok('the drill\'s own lens stands untouched', drill.includes('data-testid="sheet-drill-lens"') && drill.includes('const lensActive = categoryBuckets.length > 1;'));
ok('the branch face\'s own lens stands untouched', panel.includes('data-testid="stocktake-lens"') && panel.includes('const lensActive = categoryBuckets.length > 1;'));
ok('the print vocabulary stands (both faces)', panel.includes("document.body.classList.add('sheet-printing')") && drill.includes("document.body.classList.add('sheet-printing')"));
ok('the seven-column file stands', drill.includes("const header = 'product,sku,unit,snapshot,counted,variance,variance_cost_kes';"));

console.log(`\n${pass} passed, ${failures} failed`);
process.exit(failures > 0 ? 1 : 0);
