#!/usr/bin/env node
// verify-v2-241-0.mjs — the v2.241.0 release gate.
//
// THE WALK'S LAW: the cadence thresholds become governable — the law
// library (one home, the fallback law), the law wire (owner writes,
// the pair or nothing, the audit trail), the wires obey (kpi-summary +
// the teeth read the same stored pair, the duplicated constants GONE),
// the law's face (the pair named, the pen gated, the editor's bands,
// the error line, the toast + refetch), and the window speaks its
// number (no hardcoded 30 on the map's labels). Plus the release face:
// package.json / VERSION / whats-new / CHANGELOG all speak 2.241.0,
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

const map = read('src/components/org/variance-map.tsx');
const lawLib = read('src/lib/cadence-law.ts');
const lawWire = read('src/app/api/org/cadence/route.ts');
const kpi = read('src/app/api/org/kpi-summary/route.ts');
const teeth = read('src/app/api/categories/route.ts');
const page = read('src/app/(shell)/console/page.tsx');
const primitives = read('src/components/org/primitives.tsx');
const pkg = JSON.parse(read('package.json'));
const version = read('VERSION').trim();
const whatsNew = read('src/lib/whats-new.ts');
const changelog = read('CHANGELOG.md');
const changelogTest = read('src/tests/console-changelog.test.ts');

console.log('— the release face —');
ok('package.json releaseVersion 2.241.0', pkg.mbumah.releaseVersion === '2.241.0');
ok('package.json baseVersion 2.241.0', pkg.mbumah.baseVersion === '2.241.0');
ok('package.json version 2.241.0', pkg.version === '2.241.0');
ok('VERSION 2.241.0', version === '2.241.0');
ok('verify gate wired', pkg.scripts['verify:v2-241-0'] === 'node scripts/verify-v2-241-0.mjs');
ok('previous gate still wired', pkg.scripts['verify:v2-240-0'] === 'node scripts/verify-v2-240-0.mjs');
ok('whats-new entry at the head', whatsNew.includes("version: '2.241.0',") && whatsNew.indexOf("version: '2.241.0',") < whatsNew.indexOf("version: '2.240.0',"));
ok('whats-new title speaks the walk\u2019s law', whatsNew.includes("title: 'The walk\\u2019s law',"));
ok('changelog anchors the section above its ancestor', changelog.indexOf('## [2.241.0]') >= 0 && changelog.indexOf('## [2.241.0]') < changelog.indexOf('## [2.240.0]'));
ok('the counters ride +1 in the counter test', changelogTest.includes("expect(whatsNewUnreadCount('2.110.0')).toBe(132);") && changelogTest.includes("expect(whatsNewUnreadCount('2.77.0')).toBe(165);"));

console.log('— the law library —');
ok('the defaults are 7/30', lawLib.includes('freshDays: 7, windowDays: 30'));
ok('the keys are the stored pair', lawLib.includes("freshDays: 'cadence.freshDays'") && lawLib.includes("windowDays: 'cadence.windowDays'"));
ok('the bounds ride the library', lawLib.includes('freshDays: { min: 1, max: 14 }') && lawLib.includes('windowDays: { min: 14, max: 90 }'));
ok('the pair coherence check', lawLib.includes('freshDays >= windowDays'));
ok('the reader never throws (the catch keeps the floor walking)', lawLib.includes('return { ...CADENCE_LAW_DEFAULTS };'));

console.log('— the law wire —');
ok('GET is manager-plus', lawWire.includes('withSessionAuth(getHandler, MANAGER_PLUS_ROLES)'));
ok('PUT is owner-or-above', lawWire.includes('withSessionAuth(putHandler, OWNER_ROLES)'));
ok('the pair law rejects half a law', lawWire.includes('isValidCadenceLaw(candidate)') && lawWire.includes('{ status: 400 }'));
ok('the audit law lands on the record', lawWire.includes("action: 'CONFIG_CHANGE'") && lawWire.includes("resourceId: 'cadence'"));
ok('the write is the upsert pair', lawWire.includes('upsertLawKey(CADENCE_LAW_KEYS.freshDays, String(law.freshDays))') && lawWire.includes('upsertLawKey(CADENCE_LAW_KEYS.windowDays, String(law.windowDays))'));

console.log('— the wires obey —');
ok('kpi reads the law once', kpi.includes('const cadenceLaw = await readCadenceLaw(rawDb);'));
ok('the kpi duplicated constant is gone', !kpi.includes('const CADENCE_FRESH_DAYS = 7;'));
ok('the law\u2019s window governs the window read', kpi.includes('const windowStart = new Date(now.getTime() - cadenceLaw.windowDays * DAY_MS);'));
ok('the payload rides the law\u2019s pair', kpi.includes('windowDays: cadenceLaw.windowDays,') && kpi.includes('freshDays: cadenceLaw.freshDays,'));
ok('window30d.windowDays rides additively', kpi.includes('windowDays: cadenceLaw.windowDays,') && primitives.includes('window30d: { windowDays?: number;'));
ok('the teeth read the same law', teeth.includes('const law = await readCadenceLaw(db);') && teeth.includes('freshDays: law.freshDays,') && teeth.includes('windowDays: law.windowDays,'));
ok('the teeth duplicated constants are gone', !teeth.includes('const CADENCE_FRESH_DAYS = 7;') && !teeth.includes('const CADENCE_WINDOW_DAYS = 30;'));

console.log('— the law\u2019s face —');
ok('the props grow the governor + refetch + toast', map.includes('canGovern = false') && map.includes('onLawSaved') && map.includes('onToast'));
ok('the law line names the pair', map.includes('data-testid="cadence-law-line"') && map.includes('the law: fresh \u2264 {cadence.freshDays}d \u00b7 window {cadence.windowDays}d'));
ok('the pen rides only for the governor', map.includes('{canGovern && (') && map.includes('data-testid="cadence-law-pen"'));
ok('the editor mirrors the bands', map.includes('fresh days must be a whole number between 1 and 14.') && map.includes('window days must be a whole number between 14 and 90.') && map.includes('the fresh boundary must sit inside the window'));
ok('the error line speaks the wire\u2019s 400 verbatim', map.includes('data-testid="cadence-law-error"') && map.includes('role="alert"'));
ok('a written law toasts the pair + asks for the refetch', map.includes('onLawSaved?.()') && page.includes('onLawSaved={load}') && page.includes("canGovern={session?.role === 'SUPER_ADMIN' || session?.role === 'STORE_OWNER'}"));
ok('the law\u2019s glass is the Scale glyph, aria-hidden', (map.match(/<Scale className="[^"]*" aria-hidden="true" \/>/g) || []).length >= 2);

console.log('— the window speaks its number —');
ok('the window number falls back honestly', map.includes('const lawWindowDays = block?.window30d?.windowDays ?? 30;'));
ok('the window row\u2019s tiles say the law\u2019s own days', map.includes('Closed \u00b7 {lawWindowDays}d') && map.includes('Net variance \u00b7 {lawWindowDays}d') && map.includes('Ledger impact \u00b7 {lawWindowDays}d') && map.includes('Heard \u00b7 {lawWindowDays}d'));
ok('no hardcoded 30d labels remain on the window row', !map.includes('Closed \u00b7 30d') && !map.includes('Heard \u00b7 30d'));
ok('the coverage + notes say the law\u2019s own number', map.includes('heard in the ${lawWindowDays}-day window)') && map.includes('the same {cadence.windowDays}-day window the map speaks'));
ok('the heat bar caps at the law\u2019s window', map.includes('Math.min(c.daysSince, cadence.windowDays) / cadence.windowDays'));

console.log('— the fossil guards (every previous law stays alive) —');
ok('the origin allowlist still holds (the create wire)', read('src/app/api/stock-takes/route.ts').includes("'walk-door'"));
ok('the cadence walk order still rides the wire (the face never re-sorts)', kpi.includes('CADENCE_WALK_ORDER'));
ok('the walk\u2019s door still anchors (never a button)', map.includes('data-testid={`cadence-door-${c.categoryId}`}') && map.includes('href={`/stores/${doorSlug}/inventory?countSheet=${c.categoryId}`}'));
ok('the walk\u2019s paper still exports (the CSV law)', map.includes('data-testid="cadence-export"') && map.includes('cadenceWalkCsv(cadence.categories)'));
ok('the coverage breakdown still speaks per branch', map.includes('data-testid="coverage-breakdown"'));
ok('the drill\u2019s birth chip still rides', read('src/components/org/sheet-drill.tsx').includes('data-testid="sheet-drill-origin"'));

console.log(`\n${pass} passed, ${failures} failed`);
process.exit(failures > 0 ? 1 : 0);
