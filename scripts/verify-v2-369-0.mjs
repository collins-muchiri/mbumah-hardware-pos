#!/usr/bin/env node
// verify-v2-369-0.mjs — the round's FEATURE gate (v2.369.0 "the bare-word
// island comes home"). The release MECHANICS live in verify-current.mjs.
// This script pins only what is NEW this round: the four alias parsers,
// the desk's five migrated seeds, the four-name scrub, the landed-window
// chip, the migrated in-repo speakers, the playbook script, and the
// version slots.
// THE OD LAW: bytes, not memory. Run BEFORE the walk (the walk-dependent
// elder pins are re-anchored after; the full vitest judges those).
import { readFileSync } from 'node:fs';

let pass = 0, fail = 0;
const ok = (name, cond) => {
  if (cond) { pass++; console.log(`  ok  ${name}`); }
  else { fail++; console.error(`x FAIL ${name}`); }
};
const read = (p) => readFileSync(p, 'utf8');

const DESK = read('src/app/(shell)/tabs/loyalty-tab.tsx');
const HOME = read('src/lib/tab-url.ts');
const DOOR = read('src/components/workspace/org-console.tsx');
const LOGIN = read('src/components/login-screen.tsx');
const SUITE = read('src/tests/ly-island-v2369.test.ts');
const PLAYBOOK = read('scripts/fresh-recycle.mjs');
const whatsNew = read('src/lib/whats-new.ts');
const changelog = read('CHANGELOG.md');
const pkg = JSON.parse(read('package.json'));
const version = read('VERSION').trim();

console.log('— the island law (the home) —');
ok('THE STAGE ALIAS PARSER EXISTS (canonical wins, the alias answers)',
  HOME.includes('export function parseInitialStageWithAlias')
  && HOME.includes('canonicalRaw !== null ? canonicalRaw : params.get(legacyAlias)'));
ok('THE DATE-RANGE ALIAS PARSER EXISTS (per-side independence, per-side silencing)',
  HOME.includes('export function parseInitialDateRangeWithAlias')
  && HOME.includes('params.get(canonicalFrom) !== null ? params.get(canonicalFrom) : params.get(legacyFrom)'));
ok('THE PAGE ALIAS PARSER EXISTS (delegates to the ONE shape home by presence)',
  HOME.includes('export function parseInitialPageWithAlias')
  && HOME.includes('params.get(canonical) !== null) return parseInitialNamedPage(search, canonical, fallback)'));
ok('THE GAIT ALIAS PARSER EXISTS (the param-named membership home, delegated by presence)',
  HOME.includes('export function parseInitialLimitWithAlias')
  && HOME.includes('export function parseInitialNamedLimit')
  && HOME.includes('params.get(canonical) !== null) return parseInitialNamedLimit(search, canonical, fallback)'));
ok('THE HOME CARRIES THE ISLAND NOTE (the module header speaks the migration)',
  HOME.includes('THE BARE-WORD ISLAND COMES HOME'));
ok('THE BARE PARSERS STAY (the wild bookmarks\u2019 law, kept for the record)',
  HOME.includes('export function parseInitialView')
  && HOME.includes('export function parseInitialType')
  && HOME.includes('export function parseInitialDateRange')
  && HOME.includes('export function parseInitialPage')
  && HOME.includes('export function parseInitialLimit')
  && HOME.includes('export function parseInitialStage'));

console.log('— the desk (five seeds through five homes) —');
ok('THE DESK IMPORTS THE FIVE ALIAS FORMS (and only them)',
  DESK.includes("import { buildSearchWithoutParams, parseInitialDateRangeWithAlias, parseInitialLimitWithAlias, parseInitialNamedMemberWithAlias, parseInitialPageWithAlias, parseInitialStageWithAlias } from '@/lib/tab-url';")
  && !DESK.includes('parseInitialDateRange,')
  && !DESK.includes('parseInitialPage,'));
ok('THE STAGE SEED reads ly-view/view',
  DESK.includes("parseInitialStageWithAlias(window.location.search, 'ly-view', 'view', LOYALTY_SUB_TABS, 'transactions', landedLyType !== 'all', 'tiers')"));
ok('THE WINDOW SEED reads ly-from/ly-to (alias from/to)',
  DESK.includes("parseInitialDateRangeWithAlias(window.location.search, 'ly-from', 'ly-to', 'from', 'to')"));
ok('THE PAGER SEED reads ly-page/page', DESK.includes("parseInitialPageWithAlias(window.location.search, 'ly-page', 'page', 1)"));
ok('THE GAIT SEED reads ly-limit/limit', DESK.includes("parseInitialLimitWithAlias(window.location.search, 'ly-limit', 'limit', 100)"));
ok('THE ISLAND SCRUB (the dismiss removes BOTH dialects)',
  DESK.includes("buildSearchWithoutParams(window.location.search, ['ly-from', 'ly-to', 'from', 'to'])")
  && !DESK.includes("buildSearchWithoutParams(window.location.search, ['from', 'to'])"));

console.log('— the landed-window chip (the address bar\u2019s echo, the window\u2019s own amber) —');
ok('THE CHIP EXISTS with the honest-face condition',
  DESK.includes('data-testid="ly-window-landing-word"')
  && DESK.includes('windowLandingLive && (landedWindowFrom || landedWindowTo) && txDateFrom === landedWindowFrom && txDateTo === landedWindowTo'));
ok('THE CHIP SPEAKS THE CANONICAL SPELLINGS',
  DESK.includes('?ly-from=${landedWindowFrom}') && DESK.includes('?ly-to=${landedWindowTo}'));
ok('THE CHIP WEARS THE WINDOW\u2019S OWN AMBER (the stamp\u2019s bytes)',
  DESK.includes('border-amber-600/30 bg-amber-50 text-amber-800')
  && DESK.includes('dark:border-amber-500/30 dark:bg-amber-950/40 dark:text-amber-300'));
ok('THE CHIP RETIRES ON HAND CHANGE (both inputs retire)',
  (DESK.split('setWindowLandingLive(false);').length - 1) === 3);
ok('THE NOISE LAW IS WRITTEN (stage/page/gait wear no chip by design)',
  DESK.includes('The STAGE, PAGE and GAIT wear NO chip BY'));
ok('THE TYPE CHIP KEEPS ITS GREEN (no masquerade)',
  DESK.includes('data-testid="ly-type-landing-word"')
  && DESK.includes('border-green-200 bg-green-50 text-green-700'));

console.log('— the in-repo speakers (migrated this round) —');
ok('THE COUNTS DOOR SPEAKS ly-from/ly-to (the bare forms gone from the door)',
  DOOR.includes('`${EXPIRY_LEDGER_HREF}&ly-from=${sweepDay}&ly-to=${sweepDay}`')
  && !DOOR.includes('`${EXPIRY_LEDGER_HREF}&from=${sweepDay}&to=${sweepDay}`'));
ok('THE DESK-ASK SPEAKS ly-view (the bare view kept, the canonical joined)',
  LOGIN.includes('/[?&](tab|view|ly-view)=/.test(search)')
  && !LOGIN.includes('/[?&](tab|view)=/.test(search)'));

console.log('— the fresh-recycle playbook, as a script —');
ok('THE PLAYBOOK EXISTS with the laws in its bytes',
  PLAYBOOK.includes('THE FRESH-RECYCLE PLAYBOOK, AS A SCRIPT')
  && PLAYBOOK.includes('env -u DATABASE_URL npm install')
  && PLAYBOOK.includes("role:'SUPER_ADMIN'")
  && !PLAYBOOK.includes('x-access-token'));

console.log('— the suite —');
ok('THE SUITE EXISTS and speaks the island', SUITE.includes('THE BARE-WORD ISLAND COMES HOME'));

console.log('— the release mechanics (version slots, feed, changelog) —');
ok('pkg version = VERSION (all three slots)', pkg.version === version && pkg.mbumah?.releaseVersion === version && pkg.mbumah?.baseVersion === version);
ok('the VERSION file speaks 2.369.0', version === '2.369.0');
ok('whats-new carries the lead entry', whatsNew.includes("version: '2.369.0',") && whatsNew.indexOf("version: '2.369.0',") < whatsNew.indexOf("version: '2.368.0',"));
ok('whats-new speaks the island without foreign literals', whatsNew.includes('The bare-word island comes home'));
ok('CHANGELOG carries [2.369.0] above [2.368.0]', changelog.indexOf('[2.369.0]') >= 0 && changelog.indexOf('[2.369.0]') < changelog.indexOf('[2.368.0]'));

console.log(`\nverify-v2-369-0: ${pass} ok, ${fail} FAIL`);
process.exit(fail === 0 ? 0 : 1);
