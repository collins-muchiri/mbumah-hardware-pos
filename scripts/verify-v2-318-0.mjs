#!/usr/bin/env node
// verify-v2-318-0.mjs — the round's FEATURE gate (v2.318.0 "the window answers back").
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
const api = read('src/lib/api.ts');
const loyaltyTab = read('src/app/(shell)/tabs/loyalty-tab.tsx');
const pkg = JSON.parse(read('package.json'));
const docs = read('docs/cron-operations.md');
const test = read('src/tests/expiry-window-dismiss-v2318.test.ts');
const whatsNew = read('src/lib/whats-new.ts');

console.log('— the dismiss law (tab-url.ts) —');
ok('buildSearchWithoutParams exists with the named-params-only law', tabUrl.includes('export function buildSearchWithoutParams(') && tabUrl.includes('for (const name of names) params.delete(name);'));
ok('the preserve law is its doc (the mirror of buildTabSearch)', tabUrl.includes('remove ONLY the named params') && tabUrl.includes('the exact mirror of `buildTabSearch`'));
ok('honestDayKey is now PUBLIC (the one law at both day-key doors)', tabUrl.includes('export function honestDayKey(value: string | null): string {'));
ok('the round-trip law survives (shape YYYY-MM-DD, a REAL calendar day)', tabUrl.includes('const DAY_KEY_RE = /^\\d{4}-\\d{2}-\\d{2}$/;') && tabUrl.includes('`${y}-${m}-${d}` === value ? value : \'\''));

console.log('— the API door (route.ts) —');
ok('the route reads the query THROUGH the honest-day law', route.includes("import { honestDayKey } from '@/lib/tab-url';") && route.includes("honestDayKey(searchParams.get('dateFrom'))") && route.includes("honestDayKey(searchParams.get('dateTo'))"));
ok('the 500 law is written where the next reader meets it', route.includes('THE WINDOW IS HONEST AT THE API DOOR TOO'));
ok('the wire echoes the window it actually applied', route.includes('window: {') && route.includes('from: dateFrom || null,') && route.includes('to: dateTo || null,'));
ok('the echo doc pins the additive law', route.includes('THE HONEST ECHO') && route.includes('never the one it was handed'));

console.log('— the envelope (api.ts) —');
ok('ApiResponse carries the additive window field', api.includes('window?: {') && api.includes('from: string | null;') && api.includes('to: string | null;'));
ok('the echo doc rides the envelope (same law as costGated)', api.includes('THE HONEST WINDOW ECHO') && api.includes('same law as costGated'));

console.log('— the desk (loyalty-tab.tsx) —');
ok('the tab-url import carries the dismiss builder too', loyaltyTab.includes("import { buildSearchWithoutParams, parseInitialDateRange, parseInitialType, parseInitialView } from '@/lib/tab-url';"));
ok('the chip scrubs ONLY from/to and writes the address bar deliberately', loyaltyTab.includes("buildSearchWithoutParams(window.location.search, ['from', 'to'])") && loyaltyTab.includes('window.history.replaceState(null'));
ok('the write is SSR-guarded (the window-touch law)', loyaltyTab.includes("if (typeof window !== 'undefined') {"));
ok('the × chip: testid, aria-label, honest tooltip', loyaltyTab.includes('data-testid="clear-date-window"') && loyaltyTab.includes('aria-label="Clear date window"') && loyaltyTab.includes('>Clear the date window</TooltipContent>'));
ok('the chip is present ONLY while a window is active', loyaltyTab.includes('const dateWindowActive = Boolean(txDateFrom || txDateTo);') && loyaltyTab.includes('dateWindowActive && ('));
ok('the amber wardrobe (the Expiry desk voice, v2.316 law)', loyaltyTab.includes('border-amber-600/40 text-amber-700 hover:bg-amber-50 hover:text-amber-800 focus-visible:ring-amber-400 dark:text-amber-400 dark:hover:bg-amber-950/40'));
ok('the stamp wears the WIRE echo, never the inputs', loyaltyTab.includes('txData?.window && (txData.window.from || txData.window.to)') && loyaltyTab.includes("Window {txData.window.from || 'beginning'} → {txData.window.to || 'now'}") && loyaltyTab.includes('txData.pagination?.total'));
ok('the stamp is honest amber (rounded-full, tabular-nums)', loyaltyTab.includes('data-testid="applied-window-stamp"') && loyaltyTab.includes('rounded-full border border-amber-600/30 bg-amber-50') && loyaltyTab.includes('tabular-nums'));

console.log('— the housekeeping + release voice —');
ok('the docs register carries the window-echo note', docs.includes('**v2.318.0**: the ledger\'s window answers back') && docs.includes('buildSearchWithoutParams'));
ok('the manifest answers 2.318.0 in all three slots', pkg.version === '2.318.0' && pkg.mbumah?.releaseVersion === '2.318.0' && pkg.mbumah?.baseVersion === '2.318.0');
ok('the test file pins the truth table (dismiss law, honest day, echo, chip, stamp)', test.includes("buildSearchWithoutParams(\n        '?tab=loyalty&view=transactions&type=EXPIRE&from=2026-10-31&to=2026-10-31',\n        ['from', 'to'],\n      ),\n    ).toBe('?tab=loyalty&view=transactions&type=EXPIRE');") && test.includes("honestDayKey('2026-02-30')") && test.includes('data-testid="clear-date-window"') && test.includes('data-testid="applied-window-stamp"'));
ok('whats-new leads with the round\u2019s story', whatsNew.includes("version: '2.318.0',") && whatsNew.includes('The window answers back'));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
