#!/usr/bin/env node
// verify-v2-328-0.mjs — the round's FEATURE gate (v2.328.0 "the roster
// answers the address bar"). The release MECHANICS live in
// verify-current.mjs. This script pins only what is NEW this round.
// Every check reads the SOURCE OF RECORD (bytes, not memory) — THE OD LAW.
import { readFileSync } from 'node:fs';

let pass = 0, fail = 0;
const ok = (name, cond) => {
  if (cond) { pass++; console.log(`  ok  ${name}`); }
  else { fail++; console.error(`x FAIL ${name}`); }
};
const read = (p) => readFileSync(p, 'utf8');

const home = read('src/lib/tab-url.ts');
const desk = read('src/app/(shell)/tabs/purchase-orders-tab.tsx');
const proxy = read('src/proxy.ts');
const poTest = read('src/tests/po-status-deep-link-v2328.test.ts');
const gateTest = read('src/tests/proxy-gate-layering-v2328.test.ts');
const whatsNew = read('src/lib/whats-new.ts');
const changelog = read('CHANGELOG.md');
const changelogTest = read('src/tests/console-changelog.test.ts');
const pkg = JSON.parse(read('package.json'));

console.log('— the roster\u2019s second word (lib/tab-url.ts) —');
ok('the membership law is written where the next desk meets it',
  home.includes('export function parseInitialNamedMember') &&
  home.includes("v2.328.0 \u2014 THE ROSTER'S SECOND WORD") &&
  home.includes('parseInitialNamedPage'));
ok('the home carries the collision note (desk-prefix + the /hr/performance ownership)',
  home.includes('collision-checked at') && home.includes('/hr/performance'));

console.log('— the purchase-orders desk seeds and answers (purchase-orders-tab.tsx) —');
ok('the seed reads the word through the ONE home (never a local parser)',
  desk.includes("import { parseInitialNamedMember, parseInitialNamedPage } from '@/lib/tab-url';") &&
  desk.includes("parseInitialNamedMember(window.location.search, 'po-status', PO_STATUSES, 'ALL')"));
ok('the seed is the lazy initializer with the SSR guard',
  desk.includes('const [statusFilter, setStatusFilter] = useState<string>(initialPoStatus);') &&
  desk.includes("if (typeof window === 'undefined') return 'ALL';"));
ok('the landing word state exists (the chip speaks the LANDING, never the choice)',
  desk.includes('const [landedStatus] = useState<string>(initialPoStatus);') &&
  desk.includes('const [landingLive, setLandingLive] = useState(true);'));
ok('the chip renders only while the landing is live AND untouched',
  desk.includes("landingLive && landedStatus !== 'ALL' && statusFilter === landedStatus") &&
  desk.includes('data-testid="po-landing-word"') &&
  desk.includes('landed ?po-status={landedStatus}'));
ok('voice 1 \u2014 the chip\u2019s own dismissal clears the filter and retires',
  desk.slice(desk.indexOf('data-testid="po-landing-word"'), desk.indexOf('data-testid="po-landing-word"') + 400)
    .includes("setStatusFilter('ALL')"));
ok('voice 2 \u2014 a hand-driven Select change retires the chip',
  desk.includes('a hand-driven change retires the landing'));
ok('voice 3 \u2014 the honest clear-all retires the chip',
  desk.slice(desk.indexOf('const clearFilters = () => {'), desk.indexOf('const clearFilters = () => {') + 500)
    .includes('setLandingLive(false)'));
ok('the chip wears the indigo family in BOTH modes',
  desk.includes('border-indigo-200 bg-indigo-50 text-indigo-700') &&
  desk.includes('dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-300'));

console.log('— the gate ledger (src/proxy.ts) —');
ok('the three layer validators are exported (read-only widening)',
  proxy.includes('export function isCSRFValid') &&
  proxy.includes('export function isRequestSizeValid') &&
  proxy.includes('export function validateContentType'));
ok('the widening is annotated as the gate ledger',
  proxy.includes('THE GATE LEDGER') && proxy.includes('zero behavior change'));

console.log('— the two test files pin the laws —');
ok('the deep-link test pins the parser truth table and the seed bytes',
  poTest.includes("parseInitialNamedMember('?po-status=PENDING_APPROVAL', 'po-status', PO_STATUSES, 'ALL')") &&
  poTest.includes("parseInitialNamedMember('?po-status=pending_approval', 'po-status', PO_STATUSES, 'ALL')"));
ok('the deep-link test pins the three retirement voices',
  poTest.includes('voice 1') && poTest.includes('voice 2') && poTest.includes('voice 3'));
ok('the gate-ledger test pins the 415/413/403 verdict tables',
  gateTest.includes('validateContentType \u2014 the 415 gate') &&
  gateTest.includes('isRequestSizeValid \u2014 the 413 gate') &&
  gateTest.includes('isCSRFValid \u2014 the 403 gate'));
ok('the gate-ledger test pins the layer order and the F9-6 lookalike attack',
  gateTest.includes('THE LAYER ORDER') &&
  gateTest.includes('https://shop.example.co.ke.evil.io'));

console.log('— the release voice —');
ok("whats-new leads with the round\u2019s story",
  whatsNew.includes("version: '2.328.0',") &&
  whatsNew.includes('The roster answers the address bar') &&
  whatsNew.includes('?po-status=PENDING_APPROVAL'));
ok('the CHANGELOG carries the round (Added + Styling + Tests)',
  changelog.includes('## [2.328.0] The roster answers the address bar') &&
  changelog.includes("THE ROSTER'S SECOND WORD") &&
  changelog.includes('THE LANDING WORD CHIP') &&
  changelog.includes('THE GATE LEDGER'));
ok('the manifest answers 2.328.0 in all three slots',
  pkg.version === '2.328.0' && pkg.mbumah?.releaseVersion === '2.328.0' && pkg.mbumah?.baseVersion === '2.328.0');
ok('the verify gate itself is wired into the manifest',
  typeof pkg.scripts['verify:v2-328-0'] === 'string');
ok('the walk\u2019s history line landed (the cascade speaks 219/220/221/252)',
  changelogTest.includes('// v2.328.0:') && changelogTest.includes('entry joins the feed') &&
  changelogTest.includes("whatsNewUnreadCount('2.110.0')).toBe(219)"));
ok('no stale anchor behind (the old counts are gone)',
  !changelogTest.includes("whatsNewUnreadCount('2.110.0')).toBe(218)"));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
