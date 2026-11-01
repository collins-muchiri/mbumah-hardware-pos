#!/usr/bin/env node
// verify-v2-321-0.mjs — the round's FEATURE gate (v2.321.0 "the ledger chooses its gait").
// The release MECHANICS (slots, VERSION, lead placement, CHANGELOG ordering,
// walk marks) live in verify-current.mjs. This script pins only what is NEW this round.
// Every check reads the SOURCE OF RECORD (bytes, not memory) — THE OD LAW.
import { readFileSync } from 'node:fs';

let pass = 0, fail = 0;
const ok = (name, cond) => {
  if (cond) { pass++; console.log(`  ok  ${name}`); }
  else { fail++; console.error(`x FAIL ${name}`); }
};
const read = (p) => readFileSync(p, 'utf8');

const tabUrl = read('src/lib/tab-url.ts');
const route = read('src/app/api/loyalty/transactions/route.ts');
const loyaltyTab = read('src/app/(shell)/tabs/loyalty-tab.tsx');
const pkg = JSON.parse(read('package.json'));
const docs = read('docs/cron-operations.md');
const test = read('src/tests/ledger-page-size-v2321.test.ts');
const whatsNew = read('src/lib/whats-new.ts');
const sweep = read('scripts/verify-ancestors.mjs');

console.log('— the sixth word (tab-url.ts) —');
ok('LEDGER_PAGE_SIZES is exported (three doors, one vocabulary)', tabUrl.includes('export const LEDGER_PAGE_SIZES = [50, 100, 200] as const;'));
ok('parseInitialLimit is exported with the membership law', tabUrl.includes('export function parseInitialLimit(search: string, fallback: number = 100): number {') && tabUrl.includes('(LEDGER_PAGE_SIZES as readonly number[]).includes(limit) ? limit : fallback;'));
ok('the membership honesty rides the doc (a gait the desk cannot offer never rides the state)', tabUrl.includes('MEMBERSHIP, not shape') && tabUrl.includes('A gait the desk cannot offer must never ride the state.'));
ok('the collision note is written where the next reader meets it', tabUrl.includes('no shell/address-bar reader of') && tabUrl.includes('the sixth word after'));
ok('parsePositiveIntParam is exported (shape, not existence; past-the-end honest)', tabUrl.includes('export function parsePositiveIntParam(raw: string | null, fallback: number, min = 1): number {') && tabUrl.includes('n >= min ? n : fallback;'));
ok('parseClampedIntParam is exported (the intent served inside [min, max])', tabUrl.includes('export function parseClampedIntParam(raw: string | null, fallback: number, min: number, max: number): number {') && tabUrl.includes('if (n > max) return max;'));

console.log('— the door (route.ts) —');
ok('the route reads its numbers THROUGH the honest-param laws', route.includes("import { honestDayKey, parseClampedIntParam, parsePositiveIntParam } from '@/lib/tab-url';") && route.includes("parsePositiveIntParam(searchParams.get('page'), 1)") && route.includes("parseClampedIntParam(searchParams.get('limit'), 50, 1, 200)"));
ok('the raw parseInt door is GONE', !route.includes("parseInt(searchParams.get('page')") && !route.includes("parseInt(searchParams.get('limit')"));
ok('the 500 proof is written where the next reader meets it', route.includes('THE DOOR IS HONEST ABOUT ITS NUMBERS') && route.includes('?limit=abc'));

console.log('— the desk (loyalty-tab.tsx) —');
ok('the gait seed is SSR-guarded and reads ?limit=', loyaltyTab.includes('function initialTxLimit(): number {') && loyaltyTab.includes("if (typeof window === 'undefined') return 100;") && loyaltyTab.includes('return parseInitialLimit(window.location.search, 100);'));
ok('the gait rides BOTH the query key and the wire', loyaltyTab.includes('txDateFrom, txDateTo, txPage, txLimit]') && loyaltyTab.includes('limit: txLimit,'));
ok('the scope-reset law wears the gait (a page honest at 100 can be past the end at 200)', loyaltyTab.includes('const txScopeKey = `${txTypeFilter}|${txDateFrom}|${txDateTo}|${txLimit}`;') && loyaltyTab.includes('THE GAIT FOLLOWS THE SCOPE TOO'));
ok('the gait Select lives in the toolbar with the desk\u2019s testids', loyaltyTab.includes('data-testid="tx-page-size"') && loyaltyTab.includes('aria-label="Rows per page"') && loyaltyTab.includes('onValueChange={(v) => setTxLimit(parseInt(v, 10))}'));
ok('the three gaits are the Select\u2019s own options, digits tabular', loyaltyTab.includes('<SelectItem value="50">') && loyaltyTab.includes('<SelectItem value="100">') && loyaltyTab.includes('<SelectItem value="200">') && loyaltyTab.includes('<span className="tabular-nums">50 / page</span>'));
ok('the control sits before the conditional pager (a CONTROL, not a status)', loyaltyTab.indexOf('data-testid="tx-page-size"') >= 0 && loyaltyTab.indexOf('data-testid="tx-page-size"') < loyaltyTab.indexOf('data-testid="tx-pager"'));
ok('the import carries the sixth word', loyaltyTab.includes("import { buildSearchWithoutParams, parseInitialDateRange, parseInitialLimit, parseInitialPage, parseInitialType, parseInitialView } from '@/lib/tab-url';"));

console.log('— the ancestors sweep (Task 27, part two) —');
ok('the sweep exists with the classified-drift doc', sweep.includes('DRIFT') && sweep.includes('SIGNAL') && sweep.includes('stale-by-design'));
ok('it enumerates the fleet from the wired truth', sweep.includes("name.startsWith('verify:v2-')") && sweep.includes('spawnSync'));
ok('it names the three fail-line conventions the fleet speaks', sweep.includes('x FAIL') && sweep.includes('[FAIL]') && sweep.includes('FAIL:'));
ok('the exit is honest (signals gate, strict optional)', sweep.includes('signals > 0 || errors > 0') && sweep.includes('--strict'));
ok('the sweep is wired as verify:ancestors', pkg.scripts['verify:ancestors'] === 'node scripts/verify-ancestors.mjs');

console.log('— the housekeeping + release voice —');
ok('the docs register carries the gait note', docs.includes('**v2.321.0**: the ledger chooses its gait') && docs.includes('parseInitialLimit'));
ok('the manifest answers 2.321.0 in all three slots', pkg.version === '2.321.0' && pkg.mbumah?.releaseVersion === '2.321.0' && pkg.mbumah?.baseVersion === '2.321.0');
ok('the test file pins the truth tables (membership law, door integers, desk gait, sweep)', test.includes("parseInitialLimit('?limit=150')") && test.includes("parseClampedIntParam('500', 50, 1, 200)") && test.includes('data-testid="tx-page-size"') && test.includes('verify:ancestors'));
ok('whats-new leads with the round\u2019s story', whatsNew.includes("version: '2.321.0',") && whatsNew.includes('The ledger chooses its gait'));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
