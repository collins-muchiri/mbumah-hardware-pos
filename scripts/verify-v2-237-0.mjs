#!/usr/bin/env node
// verify-v2-237-0.mjs — the v2.237.0 release gate.
//
// Reads the SOURCE OF RECORD and asserts the release's laws: THE SHARED
// CADENCE LIB (the store-scoped composition in one home, the four
// bands, the thresholds, the walk rank, the walk comparator, no cost
// field), THE WALK WIRES (both detail routes import the lib, sort the
// uncounted pool blind-spots-first, keep the worklist base order, grow
// each line's band + days), THE WALK NOTES (five honest voices on both
// faces, computed from the lines in hand, riding the paper), THE LINE
// BAND CHIPS (the four families at 8px in the lens whispers), and the
// fossil guards (the picker strip, the coverage tile, the org cadence
// face, the kpi composition, the muted family stays 62). Plus the
// release face: package.json / VERSION / whats-new / CHANGELOG all
// speak 2.237.0.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

let failures = 0;
let pass = 0;
const ok = (name, cond) => {
  if (cond) { pass++; console.log(`PASS  ${name}`); }
  else { failures++; console.log(`FAIL  ${name}`); }
};
const read = (p) => readFileSync(join(process.cwd(), p), 'utf8');

const lib = read('src/lib/stocktake-cadence.ts');
const branchWire = read('src/app/api/stock-takes/[id]/route.ts');
const orgWire = read('src/app/api/org/stock-takes/[id]/route.ts');
const categoriesWire = read('src/app/api/categories/route.ts');
const panel = read('src/components/inventory/stock-take-panel.tsx');
const drill = read('src/components/org/sheet-drill.tsx');
const map = read('src/components/org/variance-map.tsx');
const kpiRow = read('src/components/org/kpi-row.tsx');
const kpi = read('src/app/api/org/kpi-summary/route.ts');
const pkg = JSON.parse(read('package.json'));
const version = read('VERSION').trim();
const whatsNew = read('src/lib/whats-new.ts');
const changelog = read('CHANGELOG.md');

console.log('— the release face —');
ok('package.json releaseVersion 2.237.0', pkg.mbumah.releaseVersion === '2.237.0');
ok('package.json baseVersion 2.237.0', pkg.mbumah.baseVersion === '2.237.0');
ok('package.json version 2.237.0', pkg.version === '2.237.0');
ok('VERSION 2.237.0', version === '2.237.0');
ok('verify gate wired', pkg.scripts['verify:v2-237-0'] === 'node scripts/verify-v2-237-0.mjs');
ok('previous gate still wired', pkg.scripts['verify:v2-236-0'] === 'node scripts/verify-v2-236-0.mjs');
ok('whats-new entry at the head', whatsNew.includes("version: '2.237.0',") && whatsNew.indexOf("version: '2.237.0',") < whatsNew.indexOf("version: '2.236.0',"));
ok('whats-new title speaks the walk', whatsNew.includes("title: 'The walk',"));
ok('changelog anchors the section above its ancestor (headers, never bare strings)', changelog.indexOf('## [2.237.0]') >= 0 && changelog.indexOf('## [2.237.0]') < changelog.indexOf('## [2.236.0]'));

console.log('— the shared cadence lib —');
ok('the thresholds are exported named constants', lib.includes('export const CADENCE_FRESH_DAYS = 7;') && lib.includes('export const CADENCE_WINDOW_DAYS = 30;'));
ok('the composition is store-scoped (the store law)', lib.includes("where: { storeId, status: 'CLOSED', closedAt: { gte: windowStart } }") && lib.includes("stockTake: { storeId, status: 'CLOSED' }"));
ok('the band law speaks all four voices', lib.includes("? (daysSince ?? 0) <= CADENCE_FRESH_DAYS ? 'fresh' : 'stale'") && lib.includes(": heardEverByCategory.has(categoryId) ? 'beyond' : 'never'"));
ok('the walk rank puts the blind spots first (uncategorized after every banded sibling)', lib.includes('export const CADENCE_WALK_RANK: Record<CadenceBand, number> = { never: 0, beyond: 1, stale: 2, fresh: 3 };') && lib.includes('export const CADENCE_WALK_UNCATEGORIZED_RANK = 99;'));
ok('the walk comparator keeps the worklist law (uncounted first, ties keep the base order)', lib.includes('if (aUncounted !== bUncounted) return aUncounted ? -1 : 1;') && lib.includes("if (!aUncounted) return 0; // counted lines keep the caller's base order") && lib.includes('if (rankA !== rankB) return rankA - rankB;') && lib.includes('return (b.daysSince ?? -1) - (a.daysSince ?? -1);'));
ok('daysSince is floored and non-negative', lib.includes('Math.max(0, Math.floor((now.getTime() - lastCountedAt.getTime()) / CADENCE_DAY_MS))'));
ok('no cost field crosses the composition (lib checked whole)', lib.includes('cadenceByCategory') && !lib.includes('varianceCost') && !/cost\w*\s*:/.test(lib));

console.log('— the walk wires —');
for (const [name, wire] of [['branch', branchWire], ['org', orgWire]]) {
  ok(`the ${name} wire imports the shared lib`, wire.includes("import { cadenceByCategory, walkCompare } from '@/lib/stocktake-cadence';"));
  ok(`the ${name} wire computes the sheet\u2019s own shelves\u2019 cadence`, wire.includes('const walkCategoryIds = Array.from(') && wire.includes('const walkCadence = await cadenceByCategory(sheet.storeId, walkCategoryIds);'));
  ok(`the ${name} wire sorts the lines through the walk comparator`, wire.includes('sheet.lines.sort((a, b) =>') && wire.includes('walkCompare('));
  ok(`the ${name} wire grows each line\u2019s band + days (additive, null when uncategorized)`, wire.includes('category: { select: { id: true, name: true } }') && wire.includes("cadenceBand: (l.product.category && walkCadence.get(l.product.category.id)?.band) || null,") && wire.includes('cadenceDaysSince: (l.product.category && walkCadence.get(l.product.category.id)?.daysSince) ?? null,'));
  ok(`the ${name} wire keeps the worklist base order`, wire.includes("orderBy: [{ countedQty: { sort: 'asc', nulls: 'first' } }, { product: { name: 'asc' } }],"));
}
ok('the categories wire keeps the opt-in law and imports the composition', categoriesWire.includes("searchParams.get('includeCadence') === 'true'") && categoriesWire.includes("import { cadenceByCategory } from '@/lib/stocktake-cadence';"));

console.log('— the walk notes + line chips —');
ok('the branch sheet wears the note beneath the header', panel.includes('data-testid="stocktake-walk-note"') && panel.includes('<Footprints className="h-3 w-3 shrink-0 text-slate-400 dark:text-slate-500" aria-hidden="true" />'));
ok('the org drill wears the same note by its lines list', drill.includes('data-testid="sheet-drill-walk-note"') && drill.indexOf('data-testid="sheet-drill-walk-note"') < drill.indexOf('{shownLines.map((l) => {'));
ok('the five honest voices answer every state (branch face)', panel.includes('every line has spoken — the sheet waits for the close.') && panel.includes('`the uncounted lines walk blind spots first — ${bands.never} on never-counted aisle${bands.never === 1 ? \'\' : \'s\'} lead the way.`') && panel.includes('`the uncounted lines walk blind spots first — ${bands.beyond} not heard in 30 days lead the way.`') && panel.includes('`the uncounted lines walk blind spots first — ${bands.stale} on stale aisle${bands.stale === 1 ? \'\' : \'s\'} lead the way.`') && panel.includes("'the uncounted lines walk the freshest aisles first — the sheet is nearly home.'") && panel.includes('`the uncounted lines wait — ${unbanded} line${unbanded === 1 ? \'\' : \'s\'} hold no shelf voice.`'));
ok('the drill speaks the same voices verbatim', drill.includes('every line has spoken — the sheet waits for the close.') && drill.includes("'the uncounted lines walk the freshest aisles first — the sheet is nearly home.'") && drill.includes('`the uncounted lines walk blind spots first — ${bands.never} on never-counted aisle${bands.never === 1 ? \'\' : \'s\'} lead the way.`'));
ok('the notes never fabricate a count (computed from the lines in hand)', panel.includes('const un = detail.lines.filter((l) => l.countedQty == null);') && drill.includes('const un = (data?.lines ?? []).filter((l) => l.countedQty == null);') && panel.includes("const lead = (['never', 'beyond', 'stale', 'fresh'] as const).find((b) => bands[b] > 0);") && drill.includes("const lead = (['never', 'beyond', 'stale', 'fresh'] as const).find((b) => bands[b] > 0);"));
ok('the line band chips ride the lens whispers (the four families at 8px)', panel.includes('data-testid={`stocktake-line-band-${line.sku}`}') && panel.includes('pickBandHouse(line.cadenceBand).chip') && drill.includes('data-testid={`sheet-drill-line-band-${l.sku}`}') && drill.includes("'bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/30'") && drill.includes("'bg-orange-50 text-orange-700 ring-orange-200 dark:bg-orange-500/10 dark:text-orange-300 dark:ring-orange-500/30'"));
ok('the line types carry the band optional', panel.includes("cadenceBand?: 'fresh' | 'stale' | 'beyond' | 'never' | null;") && panel.includes('cadenceDaysSince?: number | null;') && drill.includes("cadenceBand?: 'fresh' | 'stale' | 'beyond' | 'never' | null;") && drill.includes('cadenceDaysSince?: number | null;'));
ok('the notes ride the paper (no print-off mark on the walk)', !panel.includes('data-testid="stocktake-walk-note" data-sheet-print-off') && !drill.includes('data-testid="sheet-drill-walk-note" data-sheet-print-off'));

console.log('— the fossil guards —');
ok('the picker\u2019s strip and the teeth wire keep their laws', panel.includes('data-testid="stocktake-pick-cadence"') && panel.includes('includeProductCount=true&includeCadence=true') && panel.includes('VOICE-NOT-SORT LAW'));
ok('the coverage tile and the org cadence face are untouched', map.includes('data-testid="variance-map-coverage"') && map.includes('data-testid="cadence-block"'));
ok('the kpi-summary cadence stays the org\u2019s own composition', kpi.includes('const CADENCE_FRESH_DAYS = 7;') && kpi.includes('cadenceCategories.sort((a, b) => {'));
ok('the drill\u2019s older instruments keep their testids', drill.includes('data-testid="sheet-drill-lines-list"') && drill.includes('data-testid="sheet-drill-line-category"') && drill.includes('data-testid="sheet-drill-variances-only"'));
ok('the kpi-row muted family stays at exactly 62 mounts', (kpiRow.match(/text-slate-500 dark:text-slate-400/g) ?? []).length === 62);
ok('the changelog speaks the added + styled faces', changelog.slice(changelog.indexOf('## [2.237.0]'), changelog.indexOf('## [2.236.0]')).includes('### Added') && changelog.slice(changelog.indexOf('## [2.237.0]'), changelog.indexOf('## [2.236.0]')).includes('### Styled'));

console.log(`\n${pass} passed, ${failures} failed`);
process.exit(failures > 0 ? 1 : 0);
