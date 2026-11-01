#!/usr/bin/env node
// verify-v2-317-0.mjs — the round's FEATURE gate (v2.317.0 "the ledger answers the day").
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
const loyaltyTab = read('src/app/(shell)/tabs/loyalty-tab.tsx');
const card = read('src/components/workspace/org-console.tsx');
const pkg = JSON.parse(read('package.json'));
const docs = read('docs/cron-operations.md');
const test = read('src/tests/expiry-day-window-v2317.test.ts');
const whatsNew = read('src/lib/whats-new.ts');
const gitignore = read('.gitignore');

console.log('— the window vocabulary (tab-url.ts) —');
ok('parseInitialDateRange exists with the InitialDateRange shape', tabUrl.includes('export interface InitialDateRange') && tabUrl.includes('export function parseInitialDateRange(search: string): InitialDateRange'));
ok('each param validates independently (the never-strand law)', tabUrl.includes('return { from: honestDayKey(params.get(\'from\')), to: honestDayKey(params.get(\'to\')) };'));
ok('a REAL calendar day only (V8 day-overflow is lenient; the round-trip law answers it)', tabUrl.includes('const DAY_KEY_RE = /^\\d{4}-\\d{2}-\\d{2}$/;') && tabUrl.includes('`${y}-${m}-${d}` === value ? value : \'\''));
ok('eatDayKey speaks EAT (UTC+3, the formatEatStamp convention) and answers empty on garbage', tabUrl.includes('export function eatDayKey(iso: string): string {') && tabUrl.includes('at.getTime() + 3 * 60 * 60 * 1000') && tabUrl.includes('if (Number.isNaN(at.getTime())) return \'\';'));

console.log('— the desk seeds its window (loyalty-tab.tsx) —');
ok('the window parser rides the tab-url import', loyaltyTab.includes("import { parseInitialDateRange, parseInitialType, parseInitialView } from '@/lib/tab-url';"));
ok('both date inputs seed lazily with SSR guards', loyaltyTab.includes('function initialDateFrom(): string {') && loyaltyTab.includes('function initialDateTo(): string {') && (loyaltyTab.split("if (typeof window === 'undefined') return '';").length - 1) === 2);
ok('the seeds ride the date state', loyaltyTab.includes('useState<string>(initialDateFrom)') && loyaltyTab.includes('useState<string>(initialDateTo)'));
ok('the one-writer-per-param law is written where the next reader meets it', loyaltyTab.includes("v2.317.0: the ledger's DATE WINDOW answers the address bar too"));

console.log('— the card face (org-console.tsx) —');
ok('the counts href is computed FROM the type-only constant', card.includes('const sweepDay = eatDayKey(run.at);') && card.includes('`${EXPIRY_LEDGER_HREF}&from=${sweepDay}&to=${sweepDay}`') && card.includes(': EXPIRY_LEDGER_HREF;'));
ok('the two doors tell themselves apart in the tooltips', card.includes("title=\"Open the loyalty ledger, filtered on Expire rows from this sweep's day\"") && card.includes('title="Open the loyalty ledger, filtered on Expire rows"'));
ok('the hard-navigation law survives the round (plain anchors, both doors)', card.includes('THE HARD-NAVIGATION LAW') && card.includes('<a\n              href={countsHref}\n              data-testid="automation-expiry-run-counts"') && card.includes('<a\n              href={EXPIRY_LEDGER_HREF}\n              data-testid="automation-expiry-run-clean"'));
ok('the v2.315/v2.316 amber wardrobe survives', card.includes('font-medium tabular-nums text-amber-700 dark:text-amber-400') && card.includes('focus-visible:ring-amber-400/70'));

console.log('— the housekeeping —');
ok('the qa-diag scripts join the gitignored home', gitignore.includes('scripts/qa-diag-*'));
ok('the docs register carries the day-window note', docs.includes('**v2.317.0**: the counts door names the DAY') && docs.includes('?from=YYYY-MM-DD&to=YYYY-MM-DD'));
ok('the manifest answers 2.317.0 with NO stale top-level keys', pkg.version === '2.317.0' && pkg.mbumah?.releaseVersion === '2.317.0' && pkg.mbumah?.baseVersion === '2.317.0' && !('releaseVersion' in pkg) && !('baseVersion' in pkg));

console.log('— the truth table + release voice —');
ok('the test file pins the truth table (independent params, non-calendar days, EAT rollover)', test.includes("parseInitialDateRange('?from=2026-10-31&to=nonsense')") && test.includes("parseInitialDateRange('?from=2026-02-30')") && test.includes("eatDayKey('2026-10-31T21:00:00.000Z')).toBe('2026-11-01')"));
ok('whats-new leads with the round\u2019s story', whatsNew.includes("version: '2.317.0',") && whatsNew.includes('The ledger answers the day'));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
