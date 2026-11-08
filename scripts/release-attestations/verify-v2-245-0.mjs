#!/usr/bin/env node
// verify-v2-245-0.mjs — the v2.245.0 release gate.
//
// THE WALK'S FINDINGS: the pick strip says what the last walk FOUND
// (lastWalkUnits rides the cadence's own windowLines read — one added
// column, zero new queries; line-level attribution, the shelf's own
// truth; the census's own three families on the verdict line), and the
// beyond voice reads the WIRE'S OWN window (the hardcoded "30 days" —
// a constant the v2.241.0 law retired — is gone). Plus the release
// face: package.json / VERSION / whats-new / CHANGELOG all speak
// 2.245.0, and the fossil guards keep every previous round's law alive.

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
const bandLib = read('src/lib/cadence-band.ts');
const orgWire = read('src/app/api/org/stock-takes/[id]/route.ts');
const drill = read('src/components/org/sheet-drill.tsx');
const kpi = read('src/app/api/org/kpi-summary/route.ts');
const createWire = read('src/app/api/stock-takes/route.ts');
const pkg = JSON.parse(read('package.json'));
const version = read('VERSION').trim();
const whatsNew = read('src/lib/whats-new.ts');
const changelog = read('CHANGELOG.md');
const changelogTest = read('src/tests/console-changelog.test.ts');

console.log('— the release face —');
ok('package.json releaseVersion 2.245.0', pkg.mbumah.releaseVersion === '2.245.0');
ok('package.json baseVersion 2.245.0', pkg.mbumah.baseVersion === '2.245.0');
ok('package.json version 2.245.0', pkg.version === '2.245.0');
ok('VERSION 2.245.0', version === '2.245.0');
ok('verify gate wired', pkg.scripts['verify:v2-245-0'] === 'node scripts/verify-v2-245-0.mjs');
ok('previous gate still wired', pkg.scripts['verify:v2-244-0'] === 'node scripts/verify-v2-244-0.mjs');
ok('whats-new entry at the head', whatsNew.includes("version: '2.245.0',") && whatsNew.indexOf("version: '2.245.0',") < whatsNew.indexOf("version: '2.244.0',"));
ok('whats-new title speaks the walk\u2019s findings', whatsNew.includes("title: 'The walk\\u2019s findings',"));
ok('changelog anchors the section above its ancestor', changelog.indexOf('## [2.245.0]') >= 0 && changelog.indexOf('## [2.245.0]') < changelog.indexOf('## [2.244.0]'));
ok('the counters ride +1 in the counter test', changelogTest.includes("expect(whatsNewUnreadCount('2.110.0')).toBe(136);") && changelogTest.includes("expect(whatsNewUnreadCount('2.77.0')).toBe(169);"));

console.log('— the findings wire —');
ok('the variance column rides the existing windowLines read (zero new queries)', wire.includes('select: { stockTakeId: true, productId: true, variance: true },'));
ok('the latest SPEAKING walk is tracked (a silent line never speaks)', wire.includes('if (pair.variance == null) continue;') && wire.includes('const lastSpokenByCategory = new Map<string, { sheetKey: string; closedAt: Date; units: number }>();'));
ok('the units attribute line-level (the shelf\u2019s own truth)', wire.includes('cur.units += Number(pair.variance);'));
ok('lastWalkUnits rides rounded (null when no walk spoke)', wire.includes('return spoken ? Math.round(spoken.units * 100) / 100 : null;') && wire.includes('lastWalkUnits: number | null }'));

console.log('— the findings face —');
ok('the pick strip wears the verdict line', panel.includes('data-testid="stocktake-pick-cadence-verdict"') && panel.includes('tabular-nums ${findings.cls}'));
ok('the verdict speaks the census\u2019s own three families', panel.includes("if (units === 0) return { text: 'the count held — 0 units', cls: 'text-slate-500 dark:text-slate-400' };") && panel.includes("if (units > 0) return { text: `+${units} units found`, cls: 'text-emerald-600 dark:text-emerald-400' };") && panel.includes("return { text: `${units} units found`, cls: 'text-red-600 dark:text-red-400' };"));
ok('the verdict is absent when the wire carried none', panel.includes('const findings = picked.cadence.lastWalkUnits == null') && panel.includes('{findings && ('));
ok('the block\u2019s aria carries the findings', panel.includes("${findings ? `, ${findings.text}` : ''}, ${picked.productCount ?? 0} products.`}"));
ok('the census\u2019s voice strings stay byte-identical (one law, three faces)', map.includes("'the count held — 0 units'") && panel.includes("'the count held — 0 units'"));

console.log('— the bug fix (the law, finished) —');
ok('the beyond voice reads the wire\u2019s own window', panel.includes("if (c.band === 'beyond') return `not heard in ${c.windowDays} days`;"));
ok('the hardcoded 30 is gone', !panel.includes("not heard in 30 days';"));

console.log('— the fossil guards (every previous law stays alive) —');
ok('the band\u2019s one home still stands (v2.244\u2019s law)', bandLib.includes("export type CadenceBand = 'fresh' | 'stale' | 'beyond' | 'never';") && !map.includes('const bandHouse = (band:'));
ok('the drill\u2019s band chip still rides (v2.244\u2019s law)', drill.includes('data-testid="sheet-drill-origin-aisle-band"') && orgWire.includes('walkAisleBand: aisleBand?.band ?? null,'));
ok('the verdict rows still ride the enrichment (v2.243\u2019s law)', kpi.includes('band: bandByCategory.get(a.categoryId) ?? null,'));
ok('the origin allowlist still holds (the create wire)', createWire.includes("const SHEET_ORIGIN_ALLOWLIST = ['walk-door'] as const;"));
ok('the aisle law still resolves the store (v2.242\u2019s law)', createWire.includes('if (aisle && aisle.storeId === storeId) walkCategoryId = categoryId;'));
ok('the teeth\u2019s legend still speaks the wire\u2019s numbers (v2.236\u2019s law)', panel.includes('fresh ≤ {cadenced.cadence.freshDays} days · stale within {cadenced.cadence.windowDays}'));
ok('the census face still speaks its zero (v2.238\u2019s law)', map.includes('data-testid="cadence-door-census"'));

console.log(`\n${pass} passed, ${failures} failed`);
process.exit(failures > 0 ? 1 : 0);
