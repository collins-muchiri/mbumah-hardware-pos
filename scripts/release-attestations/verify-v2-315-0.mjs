#!/usr/bin/env node
// verify-v2-315-0.mjs — the round's FEATURE gate (v2.315.0 "the sweep gets a face on the pulse").
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

const pulse = read('src/lib/loyalty-expiry-pulse.ts');
const route = read('src/app/api/org/automation/route.ts');
const card = read('src/components/workspace/org-console.tsx');
const docs = read('docs/cron-operations.md');
const redeem = read('src/app/api/customers/[id]/loyalty/redeem/route.ts');
const gitignore = read('.gitignore');
const test = read('src/tests/expiry-pulse-v2315.test.ts');
const whatsNew = read('src/lib/whats-new.ts');

console.log('— the never-a-guess reader (loyalty-expiry-pulse.ts) —');
ok('the pulse shape exists with the five honest fields', pulse.includes('export interface LoyaltyExpiryRunPulse') && pulse.includes('at: string;') && pulse.includes('scanned: number;') && pulse.includes('walletsExpired: number;') && pulse.includes('pointsExpired: number;') && pulse.includes('storeCount: number;'));
ok('the parser signature answers undefined for unreadable rows', pulse.includes('export function parseLoyaltyExpiryRunRow(') && pulse.includes('metadata: string | null,') && pulse.includes('): LoyaltyExpiryRunPulse | undefined'));
ok('garbage / non-object / missing stores are unreadable', pulse.includes('if (!metadata) return undefined;') && pulse.includes('return undefined;') && pulse.includes('if (!Array.isArray(stores)) return undefined;'));
ok('a dishonest count (string, negative, missing) kills the WHOLE row — never a partial sum', pulse.includes('function isHonestCount(value: unknown): value is number') && pulse.includes('Number.isFinite(value) && value >= 0') && pulse.includes('for (const entry of stores) {') && pulse.includes('return undefined;'));
ok('the empty stores array is the honest zero (fresh store swept nothing)', pulse.includes('storeCount: stores.length,'));

console.log('— the route door (GET /api/org/automation) —');
ok('the sweep action is a named contract', route.includes("const EXPIRY_RUN_ACTION = 'LOYALTY_EXPIRY_RUN';"));
ok('the sweep read rides ahead of the heartbeat batch (same posture as latestTick)', route.includes('where: { action: EXPIRY_RUN_ACTION },') && route.includes('orderBy: { createdAt: \'desc\' },') && route.includes('select: { createdAt: true, metadata: true },'));
ok('the parser owns the read (the route never sums by hand)', route.includes('parseLoyaltyExpiryRunRow(latestExpiryRun.metadata, latestExpiryRun.createdAt)'));
ok('the field is conditional — an unreadable row omits it, never renders a guess', route.includes('...(lastExpiryRun ? { lastExpiryRun } : {}),'));

console.log('— the card face (org-console.tsx) —');
ok('the sweep line exists with its testid', card.includes('data-testid="automation-expiry-run"') && card.includes('Last expiry sweep'));
ok('the Expiry desk amber: Hourglass + the amber voice', card.includes('<Hourglass') && card.includes('h-3.5 w-3.5 shrink-0 text-amber-700 dark:text-amber-400'));
ok('the expired counts speak amber with tabular-nums', card.includes('data-testid="automation-expiry-run-counts"') && card.includes('font-medium tabular-nums text-amber-700 dark:text-amber-400'));
ok('the healthy zero speaks for itself', card.includes('data-testid="automation-expiry-run-clean"') && card.includes('nothing to expire'));
ok('the exact EAT stamp rides title + sr-only (one truth, two surfaces)', card.includes('Expiry sweep recorded ${formatEatStamp(new Date(run.at))}') && card.includes('(recorded {formatEatStamp(new Date(run.at))})'));
ok('the interface documents the absent-row law', card.includes('lastExpiryRun?: {') && card.includes('never a partial sum'));
ok('the loyalty-expiry chip finally speaks its ownership', card.includes("'loyalty-expiry': 'Expires loyalty points unspent past the policy window (oldest earn lots first).'"));
ok('the sweep line renders in BOTH card states (one render function, two doors)', card.split('function expiryRunLine(').length - 1 === 1 && card.split('expiryRunLine(automation.lastExpiryRun)').length - 1 === 2);

console.log('— the register + housekeeping —');
ok('the docs count the nightly at FIVE (v2.312 fold, now written)', docs.includes('the nightly carries FIVE') && docs.includes('loyalty-expiry sweep folded'));
ok('the docs carry the v2.315 reader note', docs.includes('the Automation pulse card surfaces the LAST') && docs.includes('never a partial sum'));
ok('the redeem door documents its wallet law', redeem.includes('THE WALLET LAW (v2.314.0)') && redeem.includes('deliberately does NOT maintain'));
ok('the QA burst scripts have their gitignored home', gitignore.includes('scripts/qa-burst-*') && gitignore.includes('scripts/seed-qa-*') && gitignore.includes('scripts/targeted-tsc-*'));

console.log('— the truth table + release voice —');
ok('the test file pins the parser truth table (string count, negative, honest zero)', test.includes("scanned: '3'") && test.includes('walletsExpired: -1') && test.includes("row([]), AT);"));
ok('whats-new leads with the round\u2019s story', whatsNew.includes("version: '2.315.0',") && whatsNew.includes('The sweep gets a face on the pulse'));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
