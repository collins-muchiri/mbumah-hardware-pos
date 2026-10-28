#!/usr/bin/env node
// verify-v2-243-0.mjs — the v2.243.0 release gate.
//
// THE AISLE'S VERDICT: the aisle's census row speaks the walk's own
// verdict — the closed door-born sheets' variance units (attributed via
// the sheet's own walkCategoryId, units are units, no cost gate) and the
// aisle's current cadence band (the wire's own join, zero new queries).
// The face wears the drill's three families (exact/surplus/shrinkage)
// and the walk order's four band houses. Plus the release face:
// package.json / VERSION / whats-new / CHANGELOG all speak 2.243.0, and
// the fossil guards keep every previous round's law alive.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

let failures = 0;
let pass = 0;
const ok = (name, cond) => {
  if (cond) { pass++; console.log(`PASS  ${name}`); }
  else { failures++; console.log(`FAIL  ${name}`); }
};
const read = (p) => readFileSync(join(process.cwd(), p), 'utf8');

const map = read('src/components/org/variance-map.tsx');
const kpi = read('src/app/api/org/kpi-summary/route.ts');
const primitives = read('src/components/org/primitives.tsx');
const createWire = read('src/app/api/stock-takes/route.ts');
const pkg = JSON.parse(read('package.json'));
const version = read('VERSION').trim();
const whatsNew = read('src/lib/whats-new.ts');
const changelog = read('CHANGELOG.md');
const changelogTest = read('src/tests/console-changelog.test.ts');

console.log('— the release face —');
ok('package.json releaseVersion 2.243.0', pkg.mbumah.releaseVersion === '2.243.0');
ok('package.json baseVersion 2.243.0', pkg.mbumah.baseVersion === '2.243.0');
ok('package.json version 2.243.0', pkg.version === '2.243.0');
ok('VERSION 2.243.0', version === '2.243.0');
ok('verify gate wired', pkg.scripts['verify:v2-243-0'] === 'node scripts/verify-v2-243-0.mjs');
ok('previous gate still wired', pkg.scripts['verify:v2-242-0'] === 'node scripts/verify-v2-242-0.mjs');
ok('whats-new entry at the head', whatsNew.includes("version: '2.243.0',") && whatsNew.indexOf("version: '2.243.0',") < whatsNew.indexOf("version: '2.242.0',"));
ok('whats-new title speaks the aisle\u2019s verdict', whatsNew.includes("title: 'The aisle\\u2019s verdict',"));
ok('changelog anchors the section above its ancestor', changelog.indexOf('## [2.243.0]') >= 0 && changelog.indexOf('## [2.243.0]') < changelog.indexOf('## [2.242.0]'));
ok('the counters ride +1 in the counter test', changelogTest.includes("expect(whatsNewUnreadCount('2.110.0')).toBe(134);") && changelogTest.includes("expect(whatsNewUnreadCount('2.77.0')).toBe(167);"));

console.log('— the verdict wire —');
ok('the closed door-born read rides the census\u2019s window', kpi.includes("where: { origin: 'walk-door', startedAt: { gte: windowStart }, status: 'CLOSED' }"));
ok('the verdict lines read only spoken variance', kpi.includes("where: { stockTakeId: { in: closedDoorBornIds }, variance: { not: null } }"));
ok('the units attribute to the aisle the DOOR named (the sheet\u2019s own column)', kpi.includes('if (!s.walkCategoryId) continue;') && kpi.includes('verdictUnitsByAisle.set(s.walkCategoryId, (verdictUnitsByAisle.get(s.walkCategoryId) ?? 0) + u);'));
ok('the band join is the map\u2019s own computation (zero new queries)', kpi.includes('const bandByCategory = new Map(cadenceCategories.map((c) => [c.categoryId, c.band]));') && kpi.includes('const daysByCategory = new Map(cadenceCategories.map((c) => [c.categoryId, c.daysSince]));'));
ok('the rows ride the enrichment additively', kpi.includes('varianceUnits: u == null ? null : round2(u),') && kpi.includes('band: bandByCategory.get(a.categoryId) ?? null,'));
ok('the type grows the verdict fields (optional per field)', primitives.includes("doorBornByAisle?: Array<{ categoryId: string; name: string; doorBorn: number; varianceUnits?: number | null; band?: 'fresh' | 'stale' | 'beyond' | 'never' | null; daysSince?: number | null }>;"));

console.log('— the verdict\u2019s face —');
ok('the verdict line speaks under the share bar', map.includes('data-testid={`cadence-aisle-verdict-${a.categoryId}`}'));
ok('a perfect count says so (the shelf held)', map.includes("'the count held — 0 units'"));
ok('the verdict rides the drill\u2019s three families', map.includes("'text-emerald-600 dark:text-emerald-400'") && map.includes("'text-red-600 dark:text-red-400'") && map.includes("'text-slate-500 dark:text-slate-400'"));
ok('the band chip rides the name line (the four houses)', map.includes('data-testid={`cadence-aisle-band-${a.categoryId}`}') && map.includes('${bandHouse(a.band).chip}'));
ok('the chip names its house label', map.includes('{chipLabel(a.band)}'));
ok('the aria carries the whole testimony', map.includes('aria-label={`${a.name}: ${voice}${bandVoice ? ` — ${bandVoice}` : \'\'}${verdictText ? ` — ${verdictText}` : \'\'} this window.`}'));
ok('every figure stays tabular-nums', map.includes('text-right text-[9px] font-medium tabular-nums'));

console.log('— the fossil guards (every previous law stays alive) —');
ok('the origin allowlist still holds (the create wire)', createWire.includes("const SHEET_ORIGIN_ALLOWLIST = ['walk-door'] as const;"));
ok('the aisle law still resolves the store (v2.242\u2019s law)', createWire.includes('if (aisle && aisle.storeId === storeId) walkCategoryId = categoryId;'));
ok('the per-aisle census still groups + caps (v2.242\u2019s law)', kpi.includes("by: ['walkCategoryId']") && kpi.includes('.slice(0, 3);'));
ok('the per-branch census still groups the same where-shape (v2.239\u2019s law)', kpi.includes("where: { origin: 'walk-door', startedAt: { gte: windowStart } },") && kpi.includes('doorBornByStore,'));
ok('the census face still speaks its zero (v2.238\u2019s law)', map.includes('data-testid="cadence-door-census"') && map.includes("typeof block.doorBorn30d === 'number'"));
ok('the aisle block still renders under the census line (v2.242\u2019s law)', map.includes('data-testid="cadence-door-aisles"') && map.includes('the aisles the doors opened onto'));
ok('the walk\u2019s door still anchors + the law line still names the pair (v2.237 + v2.241\u2019s laws)', map.includes('href={`/stores/${doorSlug}/inventory?countSheet=${c.categoryId}`}') && map.includes('data-testid="cadence-law-line"'));
ok('the roster birth chips still ride (v2.240\u2019s law)', map.includes('testId={`variance-map-live-origin-${s.id}`}') && map.includes('testId={`variance-map-row-origin-${s.id}`}'));

console.log(`\n${pass} passed, ${failures} failed`);
process.exit(failures > 0 ? 1 : 0);
