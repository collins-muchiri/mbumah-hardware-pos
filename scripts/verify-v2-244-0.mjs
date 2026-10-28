#!/usr/bin/env node
// verify-v2-244-0.mjs — the v2.244.0 release gate.
//
// THE AISLE'S ECHO: the four band houses move to their one home
// (@/lib/cadence-band — byte-identical classes, the map's call sites
// unchanged), both detail wires grow walkAisleBand + walkAisleDaysSince
// (read the map's way, only for an aisle-born sheet, two bounded reads,
// the fallback law), and both faces wear the sibling band chip after
// the name chip. Plus the release face: package.json / VERSION /
// whats-new / CHANGELOG all speak 2.244.0, and the fossil guards keep
// every previous round's law alive.

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
const map = read('src/components/org/variance-map.tsx');
const drill = read('src/components/org/sheet-drill.tsx');
const panel = read('src/components/inventory/stock-take-panel.tsx');
const orgWire = read('src/app/api/org/stock-takes/[id]/route.ts');
const branchWire = read('src/app/api/stock-takes/[id]/route.ts');
const createWire = read('src/app/api/stock-takes/route.ts');
const kpi = read('src/app/api/org/kpi-summary/route.ts');
const pkg = JSON.parse(read('package.json'));
const version = read('VERSION').trim();
const whatsNew = read('src/lib/whats-new.ts');
const changelog = read('CHANGELOG.md');
const changelogTest = read('src/tests/console-changelog.test.ts');

console.log('— the release face —');
ok('package.json releaseVersion 2.244.0', pkg.mbumah.releaseVersion === '2.244.0');
ok('package.json baseVersion 2.244.0', pkg.mbumah.baseVersion === '2.244.0');
ok('package.json version 2.244.0', pkg.version === '2.244.0');
ok('VERSION 2.244.0', version === '2.244.0');
ok('verify gate wired', pkg.scripts['verify:v2-244-0'] === 'node scripts/verify-v2-244-0.mjs');
ok('previous gate still wired', pkg.scripts['verify:v2-243-0'] === 'node scripts/verify-v2-243-0.mjs');
ok('whats-new entry at the head', whatsNew.includes("version: '2.244.0',") && whatsNew.indexOf("version: '2.244.0',") < whatsNew.indexOf("version: '2.243.0',"));
ok('whats-new title speaks the aisle\u2019s echo', whatsNew.includes("title: 'The aisle\\u2019s echo',"));
ok('changelog anchors the section above its ancestor', changelog.indexOf('## [2.244.0]') >= 0 && changelog.indexOf('## [2.244.0]') < changelog.indexOf('## [2.243.0]'));
ok('the counters ride +1 in the counter test', changelogTest.includes("expect(whatsNewUnreadCount('2.110.0')).toBe(135);") && changelogTest.includes("expect(whatsNewUnreadCount('2.77.0')).toBe(168);"));

console.log('— the band\u2019s one home —');
ok('the lib speaks the four houses (byte-identical classes)', bandLib.includes("export type CadenceBand = 'fresh' | 'stale' | 'beyond' | 'never';") && bandLib.includes("export function bandHouse(band: CadenceBand): CadenceBandHouse {"));
ok('the fresh house is the emerald the map has worn since v2.235.0', bandLib.includes("chip: 'bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/30', rail: 'bg-emerald-500', bar: 'bg-emerald-500'"));
ok('the voice + the label moved whole', bandLib.includes("if (c.daysSince === 0) return 'counted today';") && bandLib.includes("return band === 'never' ? 'never' : band;"));
ok('the single-aisle read rides the map\u2019s own semantics', bandLib.includes("stockTake: { status: 'CLOSED', closedAt: { not: null } },") && bandLib.includes("return { band: daysSince <= law.freshDays ? 'fresh' : 'stale', daysSince };"));
ok('the fallback law (a failed read is null, never a guessed house)', bandLib.includes('} catch {') && bandLib.includes('    return null;'));
ok('the map imports the home (the closures are gone)', map.includes("import { bandHouse, chipLabel, daysVoice } from '@/lib/cadence-band';") && !map.includes('const bandHouse = (band:'));
ok('the map\u2019s call sites stay byte-identical (the v2.243 pins keep speaking)', map.includes('${bandHouse(a.band).chip}') && map.includes('{chipLabel(a.band)}'));

console.log('— the echo wire —');
ok('the org wire reads the band only for an aisle-born sheet', orgWire.includes('if (sheet.walkCategoryId) {') && orgWire.includes('aisleBand = await readCategoryBand(db, sheet.walkCategoryId, law, new Date());'));
ok('the branch wire reads the band only for an aisle-born sheet', branchWire.includes('if (sheet.walkCategoryId) {') && branchWire.includes('aisleBand = await readCategoryBand(db, sheet.walkCategoryId, law, new Date());'));
ok('the band rides additively (the name line byte-identical)', orgWire.includes('walkAisle: sheet.walkAisle?.name ?? null,') && orgWire.includes('walkAisleBand: aisleBand?.band ?? null,') && orgWire.includes('walkAisleDaysSince: aisleBand?.daysSince ?? null,') && branchWire.includes('walkAisle: sheet.walkAisle?.name ?? null,') && branchWire.includes('walkAisleBand: aisleBand?.band ?? null,') && branchWire.includes('walkAisleDaysSince: aisleBand?.daysSince ?? null,'));

console.log('— the echo\u2019s face —');
ok('the drill wears the sibling band chip', drill.includes('data-testid="sheet-drill-origin-aisle-band"') && drill.includes('${bandHouse(data.walkAisleBand).chip}') && drill.includes('{chipLabel(data.walkAisleBand)}'));
ok('the branch face wears the sibling band chip', panel.includes('data-testid="stocktake-sheet-origin-aisle-band"') && panel.includes('${bandHouse(detail.walkAisleBand).chip}') && panel.includes('{chipLabel(detail.walkAisleBand)}'));
ok('the chips speak the days voice on their titles', drill.includes("the aisle's own cadence — ${daysVoice({ band: data.walkAisleBand, daysSince: data.walkAisleDaysSince ?? null })}") && panel.includes("the aisle's own cadence — ${daysVoice({ band: detail.walkAisleBand, daysSince: detail.walkAisleDaysSince ?? null })}"));
ok('sibling spans, never rewrites (the v2.242 chips byte-identical)', drill.includes('data-testid="sheet-drill-origin-aisle"') && drill.includes('the walk order named {data.walkAisle}') && panel.includes('data-testid="stocktake-sheet-origin-aisle"') && panel.includes('the walk order named {detail.walkAisle}'));
ok('the types grow the band fields (additive + optional)', drill.includes("walkAisleBand?: 'fresh' | 'stale' | 'beyond' | 'never' | null;") && panel.includes("walkAisleBand?: 'fresh' | 'stale' | 'beyond' | 'never' | null;"));

console.log('— the fossil guards (every previous law stays alive) —');
ok('the origin allowlist still holds (the create wire)', createWire.includes("const SHEET_ORIGIN_ALLOWLIST = ['walk-door'] as const;"));
ok('the aisle law still resolves the store (v2.242\u2019s law)', createWire.includes('if (aisle && aisle.storeId === storeId) walkCategoryId = categoryId;'));
ok('the per-aisle census still groups + caps (v2.242\u2019s law)', kpi.includes("by: ['walkCategoryId']") && kpi.includes('.slice(0, 3);'));
ok('the verdict rows still ride the enrichment (v2.243\u2019s law)', kpi.includes('band: bandByCategory.get(a.categoryId) ?? null,') && kpi.includes('varianceUnits: u == null ? null : round2(u),'));
ok('the census face still speaks its zero (v2.238\u2019s law)', map.includes('data-testid="cadence-door-census"') && map.includes("typeof block.doorBorn30d === 'number'"));
ok('the aisle block still renders under the census line (v2.242\u2019s law)', map.includes('data-testid="cadence-door-aisles"') && map.includes('the aisles the doors opened onto'));
ok('the law line still names the pair (v2.241\u2019s law)', map.includes('data-testid="cadence-law-line"'));
ok('the roster birth chips still ride (v2.240\u2019s law)', map.includes('testId={`variance-map-live-origin-${s.id}`}') && map.includes('testId={`variance-map-row-origin-${s.id}`}'));

console.log(`\n${pass} passed, ${failures} failed`);
process.exit(failures > 0 ? 1 : 0);
