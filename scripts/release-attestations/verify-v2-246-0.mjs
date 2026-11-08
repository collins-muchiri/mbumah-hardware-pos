#!/usr/bin/env node
// verify-v2-246-0.mjs — the v2.246.0 release gate.
//
// THE AISLE'S TESTAMENT: the sheet's aisle now says what its latest
// window walk FOUND there — readCategoryBand grows lastWalkUnits (the
// categories wire's own law, two bounded reads, in the window only),
// both detail wires grow walkAisleUnits, and the drill + branch faces
// wear the verdict line in the census's own three families. The
// verdict's words and colours move to their ONE home (findingsVoice in
// the lib) — the map, the pick strip and the detail faces all speak
// through it. Plus the release face: package.json / VERSION / whats-new
// / CHANGELOG all speak 2.246.0, and the fossil guards keep every
// previous round's law alive.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

let failures = 0;
let pass = 0;
const ok = (name, cond) => {
  if (cond) { pass++; console.log(`PASS  ${name}`); }
  else { failures++; console.log(`FAIL  ${name}`); }
};
const read = (p) => readFileSync(join(process.cwd(), p), 'utf8');

const bandLib = read('src/lib/cadence-band.ts');
const wire = read('src/app/api/categories/route.ts');
const panel = read('src/components/inventory/stock-take-panel.tsx');
const map = read('src/components/org/variance-map.tsx');
const orgWire = read('src/app/api/org/stock-takes/[id]/route.ts');
const branchWire = read('src/app/api/stock-takes/[id]/route.ts');
const drill = read('src/components/org/sheet-drill.tsx');
const kpi = read('src/app/api/org/kpi-summary/route.ts');
const createWire = read('src/app/api/stock-takes/route.ts');
const pkg = JSON.parse(read('package.json'));
const version = read('VERSION').trim();
const whatsNew = read('src/lib/whats-new.ts');
const changelog = read('CHANGELOG.md');
const changelogTest = read('src/tests/console-changelog.test.ts');

console.log('— the release face —');
ok('package.json releaseVersion 2.246.0', pkg.mbumah.releaseVersion === '2.246.0');
ok('package.json baseVersion 2.246.0', pkg.mbumah.baseVersion === '2.246.0');
ok('package.json version 2.246.0', pkg.version === '2.246.0');
ok('VERSION 2.246.0', version === '2.246.0');
ok('verify gate wired', pkg.scripts['verify:v2-246-0'] === 'node scripts/verify-v2-246-0.mjs');
ok('previous gate still wired', pkg.scripts['verify:v2-245-0'] === 'node scripts/verify-v2-245-0.mjs');
ok('whats-new entry at the head', whatsNew.includes("version: '2.246.0',") && whatsNew.indexOf("version: '2.246.0',") < whatsNew.indexOf("version: '2.245.0',"));
ok('whats-new title speaks the aisle\u2019s testament', whatsNew.includes("title: 'The aisle\\u2019s testament',"));
ok('changelog anchors the section above its ancestor', changelog.indexOf('## [2.246.0]') >= 0 && changelog.indexOf('## [2.246.0]') < changelog.indexOf('## [2.245.0]'));
ok('the counters ride +1 in the counter test', changelogTest.includes("expect(whatsNewUnreadCount('2.110.0')).toBe(137);") && changelogTest.includes("expect(whatsNewUnreadCount('2.77.0')).toBe(170);"));

console.log('— the testament\u2019s read —');
ok('readCategoryBand\u2019s return grows lastWalkUnits', bandLib.includes('lastWalkUnits: number | null } | null>'));
ok('the latest SPEAKING line is read in the window only', bandLib.includes('variance: { not: null },') && bandLib.includes('stockTake: { status: \'CLOSED\', closedAt: { gte: new Date(windowStartMs) } },'));
ok('the units attribute line-level, rounded like the census speaks', bandLib.includes('where: { stockTakeId: spoken.stockTakeId, product: { categoryId }, variance: { not: null } },') && bandLib.includes('lastWalkUnits = agg._sum.variance == null ? null : Math.round(Number(agg._sum.variance) * 100) / 100;'));
ok('beyond/never never ask (the silence is already their verdict)', bandLib.includes("return { band: 'never', daysSince: null, lastWalkUnits: null };") && bandLib.includes("return { band: 'beyond', daysSince: null, lastWalkUnits: null };"));
ok('the fallback law holds per read', bandLib.includes('let lastWalkUnits: number | null = null;') && bandLib.includes('if (spoken) {'));

console.log('— the testament\u2019s wire —');
ok('the org wire grows walkAisleUnits', orgWire.includes('walkAisleUnits: aisleBand?.lastWalkUnits ?? null,'));
ok('the branch wire grows walkAisleUnits', branchWire.includes('walkAisleUnits: aisleBand?.lastWalkUnits ?? null,'));
ok('the v2.244 band + days lines stay byte-identical', orgWire.includes('walkAisleBand: aisleBand?.band ?? null,') && orgWire.includes('walkAisleDaysSince: aisleBand?.daysSince ?? null,') && branchWire.includes('walkAisleBand: aisleBand?.band ?? null,') && branchWire.includes('walkAisleDaysSince: aisleBand?.daysSince ?? null,'));

console.log('— the testament\u2019s faces —');
ok('the drill wears the verdict line', drill.includes('data-testid="sheet-drill-origin-aisle-verdict"') && drill.includes('findingsVoice(data.walkAisleUnits)') && drill.includes('tabular-nums ${fv.cls}'));
ok('the branch face wears the verdict line', panel.includes('data-testid="stocktake-sheet-origin-aisle-verdict"') && panel.includes('findingsVoice(detail.walkAisleUnits)') && panel.includes('tabular-nums ${fv.cls}'));
ok('the verdict is absent when the wire carried none', drill.includes("data?.walkAisleUnits == null) return null;") && panel.includes('detail.walkAisleUnits == null) return null;'));
ok('the shelf\u2019s own truth rides the title', drill.includes("the aisle's latest walk found this \u2014 the shelf's own truth") && panel.includes("the aisle's latest walk found this \u2014 the shelf's own truth"));

console.log('— the voice\u2019s one home —');
ok('the lib speaks the census\u2019s own three families', bandLib.includes('export function findingsVoice(units: number): FindingsVoice {') && bandLib.includes("if (units === 0) return { text: 'the count held \u2014 0 units', cls: 'text-slate-500 dark:text-slate-400' };"));
ok('the map speaks through the one home (its inline copy is gone)', map.includes('findingsVoice(a.varianceUnits)') && !map.includes("'text-emerald-600 dark:text-emerald-400'"));
ok('the pick strip speaks through the one home (its local copy is gone)', panel.includes('findingsVoice(picked.cadence.lastWalkUnits)') && !panel.includes('const pickFindingsVoice = (units: number)'));
ok('the categories wire\u2019s own law stays untouched (the zero-new-queries read)', wire.includes('select: { stockTakeId: true, productId: true, variance: true },') && wire.includes('return spoken ? Math.round(spoken.units * 100) / 100 : null;'));

console.log('— the fossil guards (every previous law stays alive) —');
ok('the band\u2019s one home still stands (v2.244\u2019s law)', bandLib.includes("export type CadenceBand = 'fresh' | 'stale' | 'beyond' | 'never';") && !map.includes('const bandHouse = (band:'));
ok('the drill\u2019s band chip still rides (v2.244\u2019s law)', drill.includes('data-testid="sheet-drill-origin-aisle-band"') && orgWire.includes('walkAisleBand: aisleBand?.band ?? null,'));
ok('the pick strip\u2019s verdict line still rides (v2.245\u2019s law)', panel.includes('data-testid="stocktake-pick-cadence-verdict"') && panel.includes('const findings = picked.cadence.lastWalkUnits == null'));
ok('the beyond voice still reads the stored law (v2.245\u2019s fix)', panel.includes("if (c.band === 'beyond') return `not heard in ${c.windowDays} days`;") && !panel.includes("not heard in 30 days';"));
ok('the verdict rows still ride the enrichment (v2.243\u2019s law)', kpi.includes('band: bandByCategory.get(a.categoryId) ?? null,'));
ok('the origin allowlist still holds (the create wire)', createWire.includes("const SHEET_ORIGIN_ALLOWLIST = ['walk-door'] as const;"));
ok('the aisle law still resolves the store (v2.242\u2019s law)', createWire.includes('if (aisle && aisle.storeId === storeId) walkCategoryId = categoryId;'));
ok('the teeth\u2019s legend still speaks the wire\u2019s numbers (v2.236\u2019s law)', panel.includes('fresh ≤ {cadenced.cadence.freshDays} days · stale within {cadenced.cadence.windowDays}'));
ok('the census face still speaks its zero (v2.238\u2019s law)', map.includes('data-testid="cadence-door-census"'));

console.log(`\n${pass} passed, ${failures} failed`);
process.exit(failures > 0 ? 1 : 0);
