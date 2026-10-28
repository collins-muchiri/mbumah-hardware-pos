#!/usr/bin/env node
// verify-v2-247-0.mjs — the v2.247.0 release gate.
//
// THE WALK'S MIRROR: an older door-born sheet could wear its aisle's
// latest verdict without saying so — this round the sheet's own walk
// speaks first. Both detail wires grow walkAisleSheetUnits (the lib's
// own testament law mirrored back: ONE bounded aggregate, indexed by
// the sheet's id), and the drill + branch faces speak BOTH truths when
// they differ (this walk found X · the aisle's latest found Y), the
// single honest line when they agree. Plus the release face:
// package.json / VERSION / whats-new / CHANGELOG all speak 2.247.0,
// and the fossil guards keep every previous round's law alive.

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
ok('package.json releaseVersion 2.247.0', pkg.mbumah.releaseVersion === '2.247.0');
ok('package.json baseVersion 2.247.0', pkg.mbumah.baseVersion === '2.247.0');
ok('package.json version 2.247.0', pkg.version === '2.247.0');
ok('VERSION 2.247.0', version === '2.247.0');
ok('verify gate wired', pkg.scripts['verify:v2-247-0'] === 'node scripts/verify-v2-247-0.mjs');
ok('previous gate still wired', pkg.scripts['verify:v2-246-0'] === 'node scripts/verify-v2-246-0.mjs');
ok('whats-new entry at the head', whatsNew.includes("version: '2.247.0',") && whatsNew.indexOf("version: '2.247.0',") < whatsNew.indexOf("version: '2.246.0',"));
ok('whats-new title speaks the walk\u2019s mirror', whatsNew.includes("title: 'The walk\\u2019s mirror',"));
ok('changelog anchors the section above its ancestor', changelog.indexOf('## [2.247.0]') >= 0 && changelog.indexOf('## [2.247.0]') < changelog.indexOf('## [2.246.0]'));
ok('the counters ride +1 in the counter test', changelogTest.includes("expect(whatsNewUnreadCount('2.110.0')).toBe(138);") && changelogTest.includes("expect(whatsNewUnreadCount('2.77.0')).toBe(171);"));

console.log('— the mirror\u2019s read —');
ok('the org wire grows walkAisleSheetUnits', orgWire.includes('let walkAisleSheetUnits: number | null = null;') && orgWire.includes('\n      walkAisleSheetUnits,'));
ok('the branch wire grows walkAisleSheetUnits', branchWire.includes('let walkAisleSheetUnits: number | null = null;') && branchWire.includes('\n      walkAisleSheetUnits,'));
ok('the read is ONE bounded aggregate, the lib\u2019s own shape mirrored', orgWire.includes('where: { stockTakeId: id, product: { categoryId: sheet.walkCategoryId }, variance: { not: null } },') && branchWire.includes('where: { stockTakeId: id, product: { categoryId: sheet.walkCategoryId }, variance: { not: null } },') && orgWire.includes('_sum: { variance: true },') && branchWire.includes('_sum: { variance: true },'));
ok('the units attribute line-level, rounded like the census speaks', orgWire.includes('walkAisleSheetUnits = self._sum.variance == null ? null : Math.round(Number(self._sum.variance) * 100) / 100;') && branchWire.includes('walkAisleSheetUnits = self._sum.variance == null ? null : Math.round(Number(self._sum.variance) * 100) / 100;'));
ok('the read asks only for an aisle-born sheet', orgWire.includes('if (sheet.walkCategoryId) {') && branchWire.includes('if (sheet.walkCategoryId) {'));

console.log('— the mirror\u2019s faces —');
ok('the drill wears the self line', drill.includes('data-testid="sheet-drill-origin-aisle-self"') && drill.includes('findingsVoice(data.walkAisleSheetUnits)') && drill.includes('tabular-nums ${fv.cls}'));
ok('the branch face wears the self line', panel.includes('data-testid="stocktake-sheet-origin-aisle-self"') && panel.includes('findingsVoice(detail.walkAisleSheetUnits)') && panel.includes('tabular-nums ${fv.cls}'));
ok('the self line speaks only when both truths differ', drill.includes('data?.walkAisleSheetUnits == null ||') && drill.includes('data?.walkAisleUnits == null ||') && drill.includes('data.walkAisleSheetUnits === data.walkAisleUnits') && panel.includes('detail.walkAisleSheetUnits == null ||') && panel.includes('detail.walkAisleUnits == null ||') && panel.includes('detail.walkAisleSheetUnits === detail.walkAisleUnits'));
ok('the paper\u2019s own truth rides the title', drill.includes("this sheet's own walk \u2014 the aisle's shelf as this paper found it") && panel.includes("this sheet's own walk \u2014 the aisle's shelf as this paper found it"));
ok('the v2.246 verdict lines stay byte-identical (the sibling law)', drill.includes('data-testid="sheet-drill-origin-aisle-verdict"') && panel.includes('data-testid="stocktake-sheet-origin-aisle-verdict"') && drill.includes('findingsVoice(data.walkAisleUnits)') && panel.includes('findingsVoice(detail.walkAisleUnits)'));

console.log('— the testament\u2019s read (v2.246\u2019s law, untouched) —');
ok('readCategoryBand\u2019s return grows lastWalkUnits', bandLib.includes('lastWalkUnits: number | null } | null>'));
ok('the latest SPEAKING line is read in the window only', bandLib.includes('variance: { not: null },') && bandLib.includes('stockTake: { status: \'CLOSED\', closedAt: { gte: new Date(windowStartMs) } },'));
ok('the units attribute line-level, rounded like the census speaks', bandLib.includes('where: { stockTakeId: spoken.stockTakeId, product: { categoryId }, variance: { not: null } },') && bandLib.includes('lastWalkUnits = agg._sum.variance == null ? null : Math.round(Number(agg._sum.variance) * 100) / 100;'));
ok('beyond/never never ask (the silence is already their verdict)', bandLib.includes("return { band: 'never', daysSince: null, lastWalkUnits: null };") && bandLib.includes("return { band: 'beyond', daysSince: null, lastWalkUnits: null };"));
ok('the fallback law holds per read', bandLib.includes('let lastWalkUnits: number | null = null;') && bandLib.includes('if (spoken) {'));

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
ok('the voice\u2019s one home still stands (v2.246\u2019s law)', bandLib.includes('export function findingsVoice(units: number): FindingsVoice {') && map.includes('findingsVoice(a.varianceUnits)') && panel.includes('findingsVoice(picked.cadence.lastWalkUnits)'));

console.log(`\n${pass} passed, ${failures} failed`);
process.exit(failures > 0 ? 1 : 0);
