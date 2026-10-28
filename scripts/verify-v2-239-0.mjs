#!/usr/bin/env node
// verify-v2-239-0.mjs — the v2.239.0 release gate.
//
// Reads the SOURCE OF RECORD and asserts the release's laws: THE
// YARD'S-ANSWER WIRE (kpi-summary's doorBornByStore — one grouped read
// over the same window births, a store absent answered nothing), THE
// YARD'S-ANSWER CHIP (the violet door chip on the breakdown's answering
// rows — the silence law, never a drawn zero), THE DRILL'S BIRTH CHIP
// (the drill wire grows origin; the face speaks 'walk-door' or nothing),
// the violet door family + the disclosure pair + the hover surfaces, and
// the fossil guards (the origin column, the allowlist, the census face,
// the coverage derivation, the drill's read-only law, the kpi-row muted
// family stays 62, the counters ride +1). Plus the release face:
// package.json / VERSION / whats-new / CHANGELOG all speak 2.239.0.

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
const drill = read('src/components/org/sheet-drill.tsx');
const drillWire = read('src/app/api/org/stock-takes/[id]/route.ts');
const createWire = read('src/app/api/stock-takes/route.ts');
const kpi = read('src/app/api/org/kpi-summary/route.ts');
const primitives = read('src/components/org/primitives.tsx');
const pkg = JSON.parse(read('package.json'));
const version = read('VERSION').trim();
const whatsNew = read('src/lib/whats-new.ts');
const changelog = read('CHANGELOG.md');
const changelogTest = read('src/tests/console-changelog.test.ts');
const kpiRow = read('src/components/org/kpi-row.tsx');

console.log('— the release face —');
ok('package.json releaseVersion 2.239.0', pkg.mbumah.releaseVersion === '2.239.0');
ok('package.json baseVersion 2.239.0', pkg.mbumah.baseVersion === '2.239.0');
ok('package.json version 2.239.0', pkg.version === '2.239.0');
ok('VERSION 2.239.0', version === '2.239.0');
ok('verify gate wired', pkg.scripts['verify:v2-239-0'] === 'node scripts/verify-v2-239-0.mjs');
ok('previous gate still wired', pkg.scripts['verify:v2-238-0'] === 'node scripts/verify-v2-238-0.mjs');
ok('whats-new entry at the head', whatsNew.includes("version: '2.239.0',") && whatsNew.indexOf("version: '2.239.0',") < whatsNew.indexOf("version: '2.238.0',"));
ok('whats-new title speaks the yard\u2019s answer', whatsNew.includes("title: 'The yard\\u2019s answer',"));
ok('changelog anchors the section above its ancestor (headers, never bare strings)', changelog.indexOf('## [2.239.0]') >= 0 && changelog.indexOf('## [2.239.0]') < changelog.indexOf('## [2.238.0]'));
ok('the counters ride +1 in the counter test', changelogTest.includes("expect(whatsNewUnreadCount('2.110.0')).toBe(130);") && changelogTest.includes("expect(whatsNewUnreadCount('2.77.0')).toBe(163);"));

console.log('— the yard\u2019s-answer wire —');
ok('one grouped read over the same window births', kpi.includes('const doorBornByStoreGroups = await rawDb.stockTake.groupBy({') && kpi.includes("where: { origin: 'walk-door', startedAt: { gte: windowStart } },") && kpi.includes('_count: { _all: true },'));
ok('the block carries the per-branch census additively', kpi.includes('doorBornByStore,') && kpi.includes('doorBorn: g._count._all,'));
ok('the type is additive + optional (a store absent answered nothing)', primitives.includes('doorBornByStore?: Array<{ storeId: string; doorBorn: number }>;'));

console.log('— the yard\u2019s-answer chip —');
ok('the counts ride the same derivation (zero new reads)', map.includes('const bornByStore = new Map(') && map.includes('(block?.doorBornByStore ?? []).map((d) => [d.storeId, d.doorBorn]),') && map.includes('doorBorn: block?.doorBornByStore ? bornByStore.get(c.storeId) ?? 0 : null,'));
ok('the silence law: speaks only when the yard ANSWERED', map.includes('s.doorBorn != null && s.doorBorn > 0 && (') && map.includes('data-testid={`coverage-row-door-born-${s.storeId}`}') && map.includes('{s.doorBorn} born at a door'));
ok('the violet door family with tabular figures', map.includes('bg-violet-50 px-1.5 py-0.5 text-[9px] font-semibold tabular-nums text-violet-700 ring-1 ring-violet-200 dark:bg-violet-500/10 dark:text-violet-300 dark:ring-violet-500/30'));
ok('the chip carries its own law on the title', map.includes('title="sheets whose origin the create wire allowlisted as walk-door — the org face pointed, this yard answered"'));
ok('the row\u2019s aria stays the coverage voice (one element, one voice)', map.includes('aria-label={`${s.name}: ${s.heard} of ${s.total} shelves heard in the 30-day window.`}'));

console.log('— the disclosure pair + the hover surfaces —');
ok('the toggle names its flyout; the flyout answers with its id', map.includes('aria-controls="coverage-breakdown"') && map.includes('<div id="coverage-breakdown" data-testid="coverage-breakdown"'));
ok('the rows grow the hover surface', map.includes('className="flex items-center gap-2 rounded-lg px-1.5 py-1 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/60"'));
ok('the bars grow the inner track + the width transition', map.includes('h-1 flex-1 overflow-hidden rounded-full bg-slate-200 shadow-inner dark:bg-slate-700') && map.includes('block h-full rounded-full bg-emerald-500 shadow-sm transition-[width] duration-500'));
ok('the census line wears the door\u2019s glass', map.includes('<DoorOpen className="h-2.5 w-2.5 shrink-0 text-violet-500 dark:text-violet-400" aria-hidden="true" />'));

console.log('— the drill\u2019s birth chip —');
ok('the wire grows the origin additively (zero new reads)', drillWire.includes('origin: sheet.origin,') && drillWire.includes('THE DRILL\u2019S BIRTH CHIP'));
ok('the face speaks the birth only when the allowlisted origin rode', drill.includes("data?.origin === 'walk-door' && (") && drill.includes('data-testid="sheet-drill-origin"') && drill.includes('born at a walk door'));
ok('the type is additive + optional', drill.includes('origin?: string | null;'));
ok('the birth chip wears the same violet family + the DoorOpen glass', drill.includes('inline-flex items-center gap-1 rounded bg-violet-50 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-violet-700 ring-1 ring-violet-200 dark:bg-violet-500/10 dark:text-violet-300 dark:ring-violet-500/30') && drill.includes('<DoorOpen className="h-2.5 w-2.5" aria-hidden="true" />'));

console.log('— the fossil guards —');
ok('the origin column + allowlist law untouched', createWire.includes("const SHEET_ORIGIN_ALLOWLIST = ['walk-door'] as const;"));
ok('the census face still speaks its zero', map.includes('data-testid="cadence-door-census"') && map.includes("typeof block.doorBorn30d === 'number'"));
ok('the coverage derivation still sorts by the silent-shelves law', map.includes('const coverageByStore = useMemo(() => {') && map.includes('.sort((a, b) => (a.heard / a.total) - (b.heard / b.total) || b.total - a.total)'));
ok('the drill stays read-only', drill.includes('data-testid="sheet-drill-read-only"'));
ok('the cadence wire untouched (constants, walk order)', kpi.includes('const CADENCE_FRESH_DAYS = 7;') && kpi.includes('cadenceCategories.sort((a, b) => {'));
ok('the kpi-row muted family stays at exactly 62 mounts', (kpiRow.match(/text-slate-500 dark:text-slate-400/g) ?? []).length === 62);
ok('the changelog speaks the added + styled faces', changelog.slice(changelog.indexOf('## [2.239.0]'), changelog.indexOf('## [2.238.0]')).includes('### Added') && changelog.slice(changelog.indexOf('## [2.239.0]'), changelog.indexOf('## [2.238.0]')).includes('### Styled'));

console.log(`\n${pass} passed, ${failures} failed`);
process.exit(failures > 0 ? 1 : 0);
