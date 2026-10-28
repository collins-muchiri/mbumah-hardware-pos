#!/usr/bin/env node
// verify-v2-235-0.mjs — the v2.235.0 release gate.
//
// Reads the SOURCE OF RECORD and asserts the release's laws: THE
// CADENCE WIRE (the additive stockTakes.cadence on the kpi-summary —
// three bounded reads, the closed-30d read grown closedAt for two
// consumers, the product→category bridge, the four voices, the walk
// order, no cost field), THE CADENCE FACE (rail + chip + voice + heat
// bar rows, the four band chips, the honest step-aside, the cap note),
// the client type staying optional, and the fossil guards (the map's
// tiles, the lineage, the verdict door all still speak; the kpi-row
// muted family stays 62). Plus the release face: package.json /
// VERSION / whats-new / CHANGELOG all speak 2.235.0.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

let failures = 0;
let pass = 0;
const ok = (name, cond) => {
  if (cond) { pass++; console.log(`PASS  ${name}`); }
  else { failures++; console.log(`FAIL  ${name}`); }
};
const read = (p) => readFileSync(join(process.cwd(), p), 'utf8');

const wire = read('src/app/api/org/kpi-summary/route.ts');
const map = read('src/components/org/variance-map.tsx');
const primitives = read('src/components/org/primitives.tsx');
const kpiRow = read('src/components/org/kpi-row.tsx');
const pkg = JSON.parse(read('package.json'));
const version = read('VERSION').trim();
const whatsNew = read('src/lib/whats-new.ts');
const changelog = read('CHANGELOG.md');

console.log('— the release face —');
ok('package.json releaseVersion 2.235.0', pkg.mbumah.releaseVersion === '2.235.0');
ok('package.json baseVersion 2.235.0', pkg.mbumah.baseVersion === '2.235.0');
ok('package.json version 2.235.0', pkg.version === '2.235.0');
ok('VERSION 2.235.0', version === '2.235.0');
ok('verify gate wired', pkg.scripts['verify:v2-235-0'] === 'node scripts/verify-v2-235-0.mjs');
ok('whats-new entry at the head', whatsNew.includes("version: '2.235.0',") && whatsNew.indexOf("version: '2.235.0',") < whatsNew.indexOf("version: '2.234.0',"));
ok('whats-new title speaks the cadence', whatsNew.includes("title: 'The cadence',"));
ok('changelog anchors the section above its ancestor (headers, never bare strings)', changelog.indexOf('## [2.235.0]') >= 0 && changelog.indexOf('## [2.235.0]') < changelog.indexOf('## [2.234.0]'));

console.log('— the cadence wire (kpi-summary) —');
ok('the closed-30d read grows closedAt (one read, two consumers)', wire.includes('select: { id: true, closedAt: true },'));
ok('the fresh threshold is a named constant', wire.includes('const CADENCE_FRESH_DAYS = 7;'));
ok('the categories read is active-only with the store join', wire.includes('rawDb.productCategory.findMany({') && wire.includes("where: { isActive: true },") && wire.includes('store: { select: { name: true, code: true } },'));
ok('the window pairs are bounded by the closed-30d ids', wire.includes('where: { stockTakeId: { in: closed30dIds } },'));
ok('the heard-ever read groups over CLOSED sheets through the product bridge', wire.includes("stockTake: { status: 'CLOSED' },") && wire.includes('product: { categoryId: { in: cadenceCategoryIds } },'));
ok('the SKU weight is one grouped product count', wire.includes("by: ['categoryId'],") && wire.includes('where: { categoryId: { in: cadenceCategoryIds }, isActive: true },'));
ok('the product→category map is the only bridge', wire.includes('const categoryOfProduct = new Map(cadenceProductRows.map((p) => [p.id, p.categoryId]));'));
ok('daysSince is floored and non-negative', wire.includes('Math.max(0, Math.floor((now.getTime() - lastCountedAt.getTime()) / DAY_MS))'));
ok('the band law speaks all four voices', wire.includes("? 'fresh' : 'stale'") && wire.includes("? 'beyond' : 'never'"));
ok('the walk order puts the blind spots first', wire.includes("const CADENCE_WALK_ORDER: Record<CadenceBand, number> = { never: 0, beyond: 1, stale: 2, fresh: 3 };") && wire.includes("if (a.band === 'never' || a.band === 'beyond') return b.productCount - a.productCount;"));
ok('the block rides stockTakes additively', wire.includes('      cadence,\n    };'));
ok('no cost field crosses the cadence composition', !wire.slice(wire.indexOf('v2.235.0: the cadence'), wire.indexOf('const stockTakes = {')).includes('varianceCost') && !wire.slice(wire.indexOf('v2.235.0: the cadence'), wire.indexOf('const stockTakes = {')).includes('canViewCost'));
ok('the counts block carries every band plus the total', wire.includes('total: cadenceCategories.length,'));

console.log('— the cadence type (primitives) —');
ok('the block stays optional', primitives.includes('    cadence?: {'));
ok('the band union names the four voices', primitives.includes("band: 'fresh' | 'stale' | 'beyond' | 'never';"));
ok('the row carries the store voice and the SKU weight', primitives.includes('storeName: string; storeCode: string | null;') && primitives.includes('productCount: number; lastCountedAt: string | null;'));

console.log('— the cadence face (variance-map) —');
ok('the honest step-aside renders', map.includes('data-testid="cadence-stale"') && map.includes('this answer predates the cadence'));
ok('the block mounts beneath the roster with the History icon', map.includes('data-testid="cadence-block"') && map.includes('<History className="h-3 w-3 text-slate-400 dark:text-slate-500" aria-hidden="true" />') && map.indexOf('data-testid="cadence-block"') > map.indexOf('variance-map-cap-note'));
ok('the four band chips mount (zero mutes, never vanishes)', map.includes("data-testid={`cadence-chip-${band}`}") && map.includes("(['fresh', 'stale', 'beyond', 'never'] as const)") && map.includes('opacity-60'));
ok('every row carries the rail, the band chip, and the days voice', map.includes('data-testid={`cadence-row-${c.categoryId}`}') && map.includes('data-testid={`cadence-band-${c.categoryId}`}') && map.includes('data-testid={`cadence-days-${c.categoryId}`}') && map.includes('className={`w-1 shrink-0 ${house.rail}`'));
ok('the days voice answers every state honestly', map.includes("if (c.band === 'never') return 'never heard';") && map.includes("if (c.band === 'beyond') return 'last heard beyond the window';") && map.includes("if (c.daysSince === 0) return 'counted today';"));
ok('the heat bar length always means time since last heard', map.includes('Math.max(4, Math.round((Math.min(c.daysSince, 30) / 30) * 100))'));
ok('the dashed track is reserved for never', map.includes('border-dashed border-slate-400/70 dark:border-slate-500/70'));
ok('the band houses keep dark halves from birth', map.includes("'bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/30'") && map.includes("'bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/30'") && map.includes("'bg-orange-50 text-orange-700 ring-orange-200 dark:bg-orange-500/10 dark:text-orange-300 dark:ring-orange-500/30'"));
ok('the row aria names the shelf, the voice, and the weight', map.includes('aria-label={`${c.name} in ${c.storeName}: ${voice}, ${c.productCount} products on the shelf.`}'));
ok('the cap note speaks the window law and the fresh threshold', map.includes('data-testid="cadence-cap-note"') && map.includes('a never-counted shelf has no closed line at all') && map.includes('fresh is {cadence.freshDays} days or less.'));
ok('the walk-order caption promises the blind spots first', map.includes('when each shelf was last heard — the walk order for the floor, blind spots first.'));

console.log('— the fossil guards —');
ok('the v2.220.0 tiles, the v2.233.0 lineage, and the v2.234.0 verdict still speak', map.includes('data-testid="variance-map-open"') && map.includes('testId={`variance-map-lineage-${s.id}`}') && map.includes('onOpenSheet={(next) => setDrill(next)}'));
ok('the window figures and the indicative strip still speak', map.includes('data-testid="variance-map-impact"') && map.includes('data-testid="org-variance-indicative-strip"'));
ok('the kpi-row muted family stays at exactly 62 mounts', (kpiRow.match(/text-slate-500 dark:text-slate-400/g) ?? []).length === 62);
ok('the changelog speaks the added + styled faces', changelog.slice(changelog.indexOf('## [2.235.0]'), changelog.indexOf('## [2.234.0]')).includes('### Added') && changelog.slice(changelog.indexOf('## [2.235.0]'), changelog.indexOf('## [2.234.0]')).includes('### Styled'));

console.log(`\n${pass} passed, ${failures} failed`);
process.exit(failures > 0 ? 1 : 0);
