#!/usr/bin/env node
// verify-v2-236-0.mjs — the v2.236.0 release gate.
//
// Reads the SOURCE OF RECORD and asserts the release's laws: THE TEETH
// WIRE (GET /api/categories grows the opt-in includeCadence — store-
// scoped, the product→category bridge, the four voices, the thresholds
// in the payload, no cost field), THE PICKER'S CADENCE VOICE (option
// labels speak the days voice, the legend from the wire's own numbers,
// the picked aisle's strip — chip + voice + heat bar under the org
// face's own length law, the dashed track reserved for never, the
// voice-not-sort law), THE COVERAGE TILE (the map's fifth tile — fresh
// + stale of total, zero new reads, the honest absences), and the
// fossil guards (the org cadence face, the four-tile voices, the
// picker's older laws, the kpi-row muted family stays 62). Plus the
// release face: package.json / VERSION / whats-new / CHANGELOG all
// speak 2.236.0.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

let failures = 0;
let pass = 0;
const ok = (name, cond) => {
  if (cond) { pass++; console.log(`PASS  ${name}`); }
  else { failures++; console.log(`FAIL  ${name}`); }
};
const read = (p) => readFileSync(join(process.cwd(), p), 'utf8');

const wire = read('src/app/api/categories/route.ts');
const panel = read('src/components/inventory/stock-take-panel.tsx');
const map = read('src/components/org/variance-map.tsx');
const kpi = read('src/app/api/org/kpi-summary/route.ts');
const kpiRow = read('src/components/org/kpi-row.tsx');
const pkg = JSON.parse(read('package.json'));
const version = read('VERSION').trim();
const whatsNew = read('src/lib/whats-new.ts');
const changelog = read('CHANGELOG.md');

console.log('— the release face —');
ok('package.json releaseVersion 2.236.0', pkg.mbumah.releaseVersion === '2.236.0');
ok('package.json baseVersion 2.236.0', pkg.mbumah.baseVersion === '2.236.0');
ok('package.json version 2.236.0', pkg.version === '2.236.0');
ok('VERSION 2.236.0', version === '2.236.0');
ok('verify gate wired', pkg.scripts['verify:v2-236-0'] === 'node scripts/verify-v2-236-0.mjs');
ok('previous gate still wired', pkg.scripts['verify:v2-235-0'] === 'node scripts/verify-v2-235-0.mjs');
ok('whats-new entry at the head', whatsNew.includes("version: '2.236.0',") && whatsNew.indexOf("version: '2.236.0',") < whatsNew.indexOf("version: '2.235.0',"));
ok('whats-new title speaks the teeth', whatsNew.includes("title: 'The teeth',"));
ok('changelog anchors the section above its ancestor (headers, never bare strings)', changelog.indexOf('## [2.236.0]') >= 0 && changelog.indexOf('## [2.236.0]') < changelog.indexOf('## [2.235.0]'));

console.log('— the teeth wire (categories) —');
ok('the cadence rides ONLY when the picker asks (the opt-in law)', wire.includes("searchParams.get('includeCadence') === 'true'") && wire.includes('const cadence = includeCadence'));
ok('the fresh threshold is a named constant', wire.includes('const CADENCE_FRESH_DAYS = 7;') && wire.includes('const CADENCE_WINDOW_DAYS = 30;'));
ok('the window read is store-scoped and closed-only', wire.includes("where: { storeId, status: 'CLOSED', closedAt: { gte: windowStart } }"));
ok('the heard-ever read groups over the store\u2019s CLOSED sheets through the product bridge', wire.includes("stockTake: { storeId, status: 'CLOSED' },") && wire.includes('product: { categoryId: { in: categoryIds } },'));
ok('the product\u2192category map is the only bridge a line has', wire.includes('const categoryOfProduct = new Map(') && wire.includes('select: { id: true, categoryId: true },'));
ok('daysSince is floored and non-negative', wire.includes('Math.max(0, Math.floor((now.getTime() - lastCountedAt.getTime()) / CADENCE_DAY_MS))'));
ok('the band law speaks all four voices', wire.includes("? (daysSince ?? 0) <= CADENCE_FRESH_DAYS ? 'fresh' : 'stale'") && wire.includes(": heardEverByCategory.has(categoryId) ? 'beyond' : 'never'"));
ok('the payload carries the thresholds the face speaks', wire.includes('freshDays: CADENCE_FRESH_DAYS,') && wire.includes('windowDays: CADENCE_WINDOW_DAYS,'));
{
  const slice = wire.slice(wire.indexOf('v2.236.0 THE TEETH'), wire.indexOf('async function createCategoryHandler'));
  ok('no cost field crosses the block (slice-checked)', slice.includes('cadenceByCategory') && !slice.includes('varianceCost') && !/cost\w*\s*:/.test(slice));
}
ok('the lastCountedAt is the newest window sheet\u2019s closedAt (ISO)', wire.includes('lastCountedAt: lastCountedAt ? lastCountedAt.toISOString() : null,'));

console.log('— the picker\u2019s cadence voice (stock-take-panel) —');
ok('the picker asks for cadence beside the product counts', panel.includes('includeProductCount=true&includeCadence=true'));
ok('the row type carries the block optional', panel.includes('cadence?: PickCadence') && panel.includes("band: 'fresh' | 'stale' | 'beyond' | 'never';"));
ok('every option label speaks the days voice', panel.includes("[c.name, `${c.productCount ?? 0} products`, c.cadence ? pickDaysVoice(c.cadence) : ''].filter(Boolean).join(' · ')"));
ok('the days voice answers every state honestly', panel.includes("if (c.band === 'never') return 'never counted';") && panel.includes("if (c.band === 'beyond') return 'not heard in 30 days';") && panel.includes("if (c.daysSince === 0) return 'counted today';") && panel.includes("if (c.daysSince === 1) return '1 day ago';"));
ok('the legend names the thresholds from the wire\u2019s own numbers', panel.includes('data-testid="stocktake-cadence-legend"') && panel.includes('fresh \u2264 {cadenced.cadence.freshDays} days \u00b7 stale within {cadenced.cadence.windowDays}'));
ok('the picked aisle wears the strip', panel.includes('data-testid="stocktake-pick-cadence"') && panel.includes('data-testid="stocktake-pick-cadence-chip"') && panel.includes('data-testid="stocktake-pick-cadence-voice"'));
ok('the length law is the org face\u2019s own', panel.includes('Math.max(4, Math.round((Math.min(picked.cadence.daysSince, picked.cadence.windowDays) / picked.cadence.windowDays) * 100))') && panel.includes("picked.cadence.band === 'beyond' ? 'opacity-70' : ''"));
ok('the dashed track stays reserved for never', panel.includes('border-dashed border-slate-400/70 dark:border-slate-500/70'));
ok('the band families are the org cadence\u2019s own (verbatim)', panel.includes("'bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/30'") && panel.includes("'bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/30'") && panel.includes("'bg-orange-50 text-orange-700 ring-orange-200 dark:bg-orange-500/10 dark:text-orange-300 dark:ring-orange-500/30'"));
ok('the voice-not-sort law holds', panel.includes('VOICE-NOT-SORT LAW') && panel.includes('{(categoriesQuery.data ?? []).map((c) => ('));
ok('the strip\u2019s aria names the aisle, the voice, and the weight', panel.includes("aria-label={`${picked.name}: ${voice || 'the cadence has not spoken yet'}, ${picked.productCount ?? 0} products.`}"));

console.log('— the coverage tile (variance-map) —');
ok('the window row grows the FIFTH tile', map.includes('grid grid-cols-2 gap-2 sm:grid-cols-5') && map.includes('data-testid="variance-map-coverage"') && map.indexOf('data-testid="variance-map-coverage"') > map.indexOf('data-testid="variance-map-impact"'));
ok('coverage is fresh + stale of total', map.includes('const heard = cad ? cad.counts.fresh + cad.counts.stale : null;') && map.includes('const total = cad ? cad.counts.total : null;') && map.includes('Math.round(((heard ?? 0) / total) * 100)'));
ok('the honest absences speak', map.includes("'the cadence has not spoken yet'") && map.includes("'no shelves to hear'") && map.includes("{pct != null ? `${pct}%` : '\u2014'}"));
ok('the fill rides the cadence\u2019s bar language; the dashed track is the absence\u2019s track', map.includes('<span className="block h-full rounded-full bg-emerald-500" style={{ width: `${pct}%` }} />') && map.slice(map.indexOf('data-testid="variance-map-coverage"'), map.lastIndexOf('{/* v2.222.0 THE SHEET DRILL')).includes('border-dashed border-slate-400/70'));
ok('the tile\u2019s aria names the voice and the window', map.includes('aria-label={`Coverage: ${voice}${pct != null ? ` (${heard} of ${total} branch categories heard in the 30-day window)` : \'\'}`}'));
ok('the label says Heard \u00b7 30d', map.includes('Heard \u00b7 30d'));

console.log('— the fossil guards —');
ok('the org cadence face is untouched (block, chips, rows, cap note)', map.includes('data-testid="cadence-block"') && map.includes("data-testid={`cadence-chip-${band}`}") && map.includes('data-testid="cadence-cap-note"'));
ok('the org cadence wire is untouched (constants, walk order)', kpi.includes('const CADENCE_FRESH_DAYS = 7;') && kpi.includes('cadenceCategories.sort((a, b) => {'));
ok('the v2.220.0 tiles, the v2.233.0 lineage, and the v2.234.0 verdict still speak', map.includes('data-testid="variance-map-open"') && map.includes('testId={`variance-map-lineage-${s.id}`}') && map.includes('onOpenSheet={(next) => setDrill(next)}'));
ok('the window figures and the indicative strip still speak', map.includes('data-testid="variance-map-impact"') && map.includes('data-testid="org-variance-indicative-strip"'));
ok('the picker\u2019s older laws hold', panel.includes('data-testid="stocktake-create-category"') && panel.includes('includeProductCount=true') && panel.includes('freeze ${pickedCategory.productCount ?? 0} products in ${pickedCategory.name}'));
ok('the kpi-row muted family stays at exactly 62 mounts', (kpiRow.match(/text-slate-500 dark:text-slate-400/g) ?? []).length === 62);
ok('the changelog speaks the added + styled faces', changelog.slice(changelog.indexOf('## [2.236.0]'), changelog.indexOf('## [2.235.0]')).includes('### Added') && changelog.slice(changelog.indexOf('## [2.236.0]'), changelog.indexOf('## [2.235.0]')).includes('### Styled'));

console.log(`\n${pass} passed, ${failures} failed`);
process.exit(failures > 0 ? 1 : 0);
