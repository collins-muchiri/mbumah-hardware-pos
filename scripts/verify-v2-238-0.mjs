#!/usr/bin/env node
// verify-v2-238-0.mjs — the v2.238.0 release gate.
//
// Reads the SOURCE OF RECORD and asserts the release's laws: THE ORIGIN
// COLUMN (stock_takes.origin nullable + migration; THE ALLOWLIST LAW —
// the create wire stores exactly 'walk-door'), THE BIRTH RIDES THE
// DRAWER (doorBorn shares the whisper's life; the payload carries the
// origin only when the door aimed the sheet), THE CENSUS WIRE
// (kpi-summary's doorBorn30d — one bounded count, births not closes),
// THE CENSUS FACE (cadence-door-census speaks its zero; the type check,
// never an assumption), THE COVERAGE BREAKDOWN (the toggle + the flyout
// — derived zero-read rows, silent shelves leading, dark halves from
// birth), and the fossil guards (the walk's door, the walk's paper, the
// cadence face, the coverage tile, the kpi-row muted family stays 62).
// Plus the release face: package.json / VERSION / whats-new / CHANGELOG
// all speak 2.238.0.

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
const panel = read('src/components/inventory/stock-take-panel.tsx');
const createWire = read('src/app/api/stock-takes/route.ts');
const kpi = read('src/app/api/org/kpi-summary/route.ts');
const primitives = read('src/components/org/primitives.tsx');
const schema = read('prisma/schema.prisma');
const migration = read('prisma/migrations/20261028100000_add_stock_take_origin/migration.sql');
const pkg = JSON.parse(read('package.json'));
const version = read('VERSION').trim();
const whatsNew = read('src/lib/whats-new.ts');
const changelog = read('CHANGELOG.md');
const kpiRow = read('src/components/org/kpi-row.tsx');

console.log('— the release face —');
ok('package.json releaseVersion 2.238.0', pkg.mbumah.releaseVersion === '2.238.0');
ok('package.json baseVersion 2.238.0', pkg.mbumah.baseVersion === '2.238.0');
ok('package.json version 2.238.0', pkg.version === '2.238.0');
ok('VERSION 2.238.0', version === '2.238.0');
ok('verify gate wired', pkg.scripts['verify:v2-238-0'] === 'node scripts/verify-v2-238-0.mjs');
ok('previous gate still wired', pkg.scripts['verify:v2-237-0'] === 'node scripts/verify-v2-237-0.mjs');
ok('whats-new entry at the head', whatsNew.includes("version: '2.238.0',") && whatsNew.indexOf("version: '2.238.0',") < whatsNew.indexOf("version: '2.237.0',"));
ok('whats-new title speaks the door\u2019s census', whatsNew.includes("title: 'The door\\u2019s census',"));
ok('changelog anchors the section above its ancestor (headers, never bare strings)', changelog.indexOf('## [2.238.0]') >= 0 && changelog.indexOf('## [2.238.0]') < changelog.indexOf('## [2.237.0]'));

console.log('— the origin column —');
ok('the schema carries the nullable origin with its law', /origin\s+String\?/.test(schema) && schema.includes('how a sheet was born'));
ok('the migration is additive + nullable on the mapped table', migration.includes('ALTER TABLE "stock_takes" ADD COLUMN "origin" TEXT;'));
ok('the allowlist law: exactly ONE origin value', createWire.includes("const SHEET_ORIGIN_ALLOWLIST = ['walk-door'] as const;") && createWire.includes('const origin = SHEET_ORIGIN_ALLOWLIST.includes(body?.origin) ? body.origin : null;'));
ok('the create writes the origin inside the snapshot transaction', createWire.includes("data: { storeId, status: 'COUNTING', notes, startedById: session.userId, origin }"));

console.log('— the birth rides the drawer —');
ok('doorBorn shares the whisper\u2019s life', panel.includes('const [doorBorn, setDoorBorn] = useState(false);') && panel.includes('setDoorBorn(true);') && panel.includes('setDoorBorn(false);'));
ok('the user\u2019s own hand silences both (scope pair + category select)', panel.includes("onClick={() => { setCreateScope('full'); setDoorVoice(null); setDoorBorn(false); }}") && panel.includes("onClick={() => { setCreateScope('category'); setDoorVoice(null); setDoorBorn(false); }}") && panel.includes('onChange={(e) => { setCreateCategoryId(e.target.value); setDoorVoice(null); setDoorBorn(false); }}'));
ok('the payload carries the origin ONLY when the door aimed the sheet', panel.includes("...(doorBorn ? { origin: 'walk-door' } : {})"));

console.log('— the census wire —');
ok('one bounded count over the window\u2019s door-born sheets', kpi.includes('const doorBorn30d = await rawDb.stockTake.count({') && kpi.includes("where: { origin: 'walk-door', startedAt: { gte: windowStart } }"));
ok('the block carries the census additively', kpi.includes('doorBorn30d,'));
ok('the type is additive + optional', primitives.includes('doorBorn30d?: number;'));

console.log('— the census face —');
ok('the type check, never an assumption', map.includes("typeof block.doorBorn30d === 'number'"));
ok('the census speaks its zero and names the law', map.includes('data-testid="cadence-door-census"') && map.includes('this window started at a walk door — the org face pointed, the floor answered.'));
ok('the census rides the muted family with tabular figures', map.slice(map.indexOf('data-testid="cadence-door-census"'), map.lastIndexOf('<ul className="mt-1.5 space-y-1.5">')).includes('text-[10px] tabular-nums text-slate-500 dark:text-slate-400'));

console.log('— the coverage breakdown —');
ok('derived from the cadence rows (zero new reads, never an effect)', map.includes('const coverageByStore = useMemo(() => {') && map.includes("if (c.band === 'fresh' || c.band === 'stale') e.heard += 1;"));
ok('the silent shelves lead (least heard first, heaviest tiebreak)', map.includes('.sort((a, b) => (a.heard / a.total) - (b.heard / b.total) || b.total - a.total)'));
ok('the tile\u2019s label becomes a toggle when the cadence speaks', map.includes('data-testid="coverage-breakdown-toggle"') && map.includes('aria-expanded={coverageOpen}') && map.includes('>Heard \u00b7 30d<'));
ok('the flyout speaks per-branch bars with the full voice on the aria', map.includes('data-testid="coverage-breakdown"') && map.includes('data-testid={`coverage-row-${s.storeId}`}') && map.includes('aria-label={`${s.name}: ${s.heard} of ${s.total} shelves heard in the 30-day window.`}'));
ok('the flyout hides when nothing to break down', map.includes('{coverageOpen && coverageByStore.length > 0 && ('));
ok('every new face owns its dark half', map.slice(map.indexOf('data-testid="coverage-breakdown"'), map.indexOf('{indicative && (')).includes('dark:border-slate-700'));

console.log('— the fossil guards —');
ok('the walk\u2019s door still speaks (anchors, slug law)', map.includes('data-testid={`cadence-door-${c.categoryId}`}') && map.includes('href={`/stores/${doorSlug}/inventory?countSheet=${c.categoryId}`}') && map.includes('const doorSlug = stores.find((s) => s.id === c.storeId)?.slug ?? null;'));
ok('the walk\u2019s paper still speaks (export + pure helper)', map.includes('data-testid="cadence-export"') && map.includes('export function cadenceWalkCsv('));
ok('the cadence face is untouched (block, chips, cap note)', map.includes('data-testid="cadence-block"') && map.includes('data-testid={`cadence-chip-${band}`}') && map.includes('data-testid="cadence-cap-note"'));
ok('the coverage tile still speaks (the fifth tile)', map.includes('data-testid="variance-map-coverage"'));
ok('the arrival still speaks (whisper + one-shot consume)', panel.includes('data-testid="stocktake-door-prefill"') && panel.includes('const doorConsumed = useRef(false);'));
ok('the cadence wire is untouched (constants, walk order)', kpi.includes('const CADENCE_FRESH_DAYS = 7;') && kpi.includes('cadenceCategories.sort((a, b) => {'));
ok('the kpi-row muted family stays at exactly 62 mounts', (kpiRow.match(/text-slate-500 dark:text-slate-400/g) ?? []).length === 62);
ok('the changelog speaks the added + styled faces', changelog.slice(changelog.indexOf('## [2.238.0]'), changelog.indexOf('## [2.237.0]')).includes('### Added') && changelog.slice(changelog.indexOf('## [2.238.0]'), changelog.indexOf('## [2.237.0]')).includes('### Styled'));

console.log(`\n${pass} passed, ${failures} failed`);
process.exit(failures > 0 ? 1 : 0);
