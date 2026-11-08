#!/usr/bin/env node
// verify-v2-242-0.mjs — the v2.242.0 release gate.
//
// THE AISLE'S ANSWER: the door census learns WHERE the doors opened —
// the aisle law (the create wire stores the walk order's address only
// for door-born, store-resolved, category-named births), the census per
// aisle (one grouped read, one catalog read, the top-3 headline), the
// aisle's face (the violet rows under the census line), and the aisle's
// echo (both detail wires + both faces name the aisle). Plus the
// release face: package.json / VERSION / whats-new / CHANGELOG all
// speak 2.242.0, and the fossil guards keep every previous round's law
// alive.

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
const createWire = read('src/app/api/stock-takes/route.ts');
const kpi = read('src/app/api/org/kpi-summary/route.ts');
const primitives = read('src/components/org/primitives.tsx');
const branchWire = read('src/app/api/stock-takes/[id]/route.ts');
const orgWire = read('src/app/api/org/stock-takes/[id]/route.ts');
const drill = read('src/components/org/sheet-drill.tsx');
const panel = read('src/components/inventory/stock-take-panel.tsx');
const schema = read('prisma/schema.prisma');
const migration = read('prisma/migrations/20261028230000_add_stock_take_walk_category/migration.sql');
const pkg = JSON.parse(read('package.json'));
const version = read('VERSION').trim();
const whatsNew = read('src/lib/whats-new.ts');
const changelog = read('CHANGELOG.md');
const changelogTest = read('src/tests/console-changelog.test.ts');

console.log('— the release face —');
ok('package.json releaseVersion 2.242.0', pkg.mbumah.releaseVersion === '2.242.0');
ok('package.json baseVersion 2.242.0', pkg.mbumah.baseVersion === '2.242.0');
ok('package.json version 2.242.0', pkg.version === '2.242.0');
ok('VERSION 2.242.0', version === '2.242.0');
ok('verify gate wired', pkg.scripts['verify:v2-242-0'] === 'node scripts/verify-v2-242-0.mjs');
ok('previous gate still wired', pkg.scripts['verify:v2-241-0'] === 'node scripts/verify-v2-241-0.mjs');
ok('whats-new entry at the head', whatsNew.includes("version: '2.242.0',") && whatsNew.indexOf("version: '2.242.0',") < whatsNew.indexOf("version: '2.241.0',"));
ok('whats-new title speaks the aisle\u2019s answer', whatsNew.includes("title: 'The aisle\\u2019s answer',"));
ok('changelog anchors the section above its ancestor', changelog.indexOf('## [2.242.0]') >= 0 && changelog.indexOf('## [2.242.0]') < changelog.indexOf('## [2.241.0]'));
ok('the counters ride +1 in the counter test', changelogTest.includes("expect(whatsNewUnreadCount('2.110.0')).toBe(133);") && changelogTest.includes("expect(whatsNewUnreadCount('2.77.0')).toBe(166);"));

console.log('— the aisle law (schema + create wire) —');
ok('the schema names the aisle\u2019s answer', schema.includes('walkCategoryId String?') && schema.includes("v2.242.0 THE AISLE'S ANSWER"));
ok('the relation is SetNull (the ghost law)', schema.includes('onDelete: SetNull'));
ok('the migration adds the column + the SetNull key', migration.includes('ALTER TABLE "stock_takes" ADD COLUMN "walkCategoryId" TEXT;') && migration.includes('ON DELETE SET NULL'));
ok('the aisle rides only a door birth', createWire.includes("if (origin === 'walk-door' && categoryId) {"));
ok('the ghost law resolves the aisle against THIS store', createWire.includes('db.productCategory.findUnique') && createWire.includes('aisle.storeId === storeId'));
ok('the aisle rides the transaction create', createWire.includes('origin, walkCategoryId }'));

console.log('— the census per aisle (kpi wire) —');
ok('the aisle groupBy rides the census\u2019s where-shape', kpi.includes("by: ['walkCategoryId']") && kpi.includes("where: { origin: 'walk-door', startedAt: { gte: windowStart }, walkCategoryId: { not: null } }"));
ok('the names ride one catalog read', kpi.includes('rawDb.productCategory.findMany') && kpi.includes("select: { id: true, name: true }"));
ok('the top-3 headline cap', kpi.includes(".sort((a, b) => b.doorBorn - a.doorBorn)") && kpi.includes('.slice(0, 3);'));
ok('the payload rides additively', kpi.includes('doorBornByAisle,'));
ok('the type is additive + optional', primitives.includes('doorBornByAisle?: Array<{ categoryId: string; name: string; doorBorn: number }>;'));

console.log('— the aisle\u2019s face —');
ok('the aisle block renders under the census line', map.includes('data-testid="cadence-door-aisles"') && map.includes('Array.isArray(block.doorBornByAisle)'));
ok('the rows wear the aisle\u2019s testid + aria', map.includes('data-testid={`cadence-door-aisle-${a.categoryId}`}') && map.includes('aria-label={`${a.name}: ${voice} this window.`'));
ok('the headline names the aisles', map.includes('the aisles the doors opened onto'));
ok('the share bar speaks the percent', map.includes(`aria-label={\`\${a.name}: \${sharePct} percent of this window's door births\`}`));
ok('the share bar rides the map\u2019s width transition', map.includes('block h-full rounded-full bg-violet-400 transition-[width] duration-500'));
ok('the violet house is the door\u2019s own', map.includes('border-violet-100 bg-violet-50/40 px-2 py-1.5 dark:border-violet-500/20 dark:bg-violet-500/10'));

console.log('— the aisle\u2019s echo (detail wires + faces) —');
ok('the branch detail wire grows the aisle', branchWire.includes('walkAisle: { select: { name: true } }') && branchWire.includes('walkAisle: sheet.walkAisle?.name ?? null,'));
ok('the org drill wire grows the aisle', orgWire.includes('walkAisle: { select: { name: true } }') && orgWire.includes('walkAisle: sheet.walkAisle?.name ?? null,'));
ok('the drill\u2019s echo chip speaks the aisle', drill.includes('data-testid="sheet-drill-origin-aisle"') && drill.includes('the walk order named {data.walkAisle}'));
ok('the branch face\u2019s echo chip speaks the aisle', panel.includes('data-testid="stocktake-sheet-origin-aisle"') && panel.includes('the walk order named {detail.walkAisle}'));
ok('the echo chips are siblings, never rewrites (the birth chip law byte-identical)', drill.includes('data-testid="sheet-drill-origin"') && panel.includes('data-testid="stocktake-sheet-origin"') && drill.includes('born at a walk door') && panel.includes('born at a walk door'));

console.log('— the fossil guards (every previous law stays alive) —');
ok('the origin allowlist still holds (the create wire)', createWire.includes("const SHEET_ORIGIN_ALLOWLIST = ['walk-door'] as const;"));
ok('the per-branch census still groups the same where-shape', kpi.includes("where: { origin: 'walk-door', startedAt: { gte: windowStart } },") && kpi.includes('doorBornByStore,'));
ok('the census face still speaks its zero', map.includes('data-testid="cadence-door-census"') && map.includes("typeof block.doorBorn30d === 'number'"));
ok('the walk\u2019s door still anchors (never a button)', map.includes('data-testid={`cadence-door-${c.categoryId}`}') && map.includes('href={`/stores/${doorSlug}/inventory?countSheet=${c.categoryId}`}'));
ok('the law line still names the pair', map.includes('data-testid="cadence-law-line"'));
ok('the roster birth chips still ride', map.includes('testId={`variance-map-live-origin-${s.id}`}') && map.includes('testId={`variance-map-row-origin-${s.id}`}'));

console.log(`\n${pass} passed, ${failures} failed`);
process.exit(failures > 0 ? 1 : 0);
