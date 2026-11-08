#!/usr/bin/env node
// verify-v2-319-0.mjs — the round's FEATURE gate (v2.319.0 "the cards answer the ledger").
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

const utils = read('src/lib/loyalty-utils.ts');
const route = read('src/app/api/loyalty/transactions/route.ts');
const api = read('src/lib/api.ts');
const loyaltyTab = read('src/app/(shell)/tabs/loyalty-tab.tsx');
const pkg = JSON.parse(read('package.json'));
const docs = read('docs/cron-operations.md');
const test = read('src/tests/ledger-summary-voice-v2319.test.ts');
const whatsNew = read('src/lib/whats-new.ts');

console.log('— the scope label (loyalty-utils.ts) —');
ok('pointsScopeLabel is exported and pure', utils.includes('export function pointsScopeLabel(windowActive: boolean, typeFilter: string): string {'));
ok('the unscoped voice is "all rows" and the pieces join on the middle dot', utils.includes("return pieces.length > 0 ? pieces.join(' · ') : 'all rows';"));
ok('the silent-zero story rides the doc', utils.includes('THE SCOPE LABEL') && utils.includes('the silent zero'));

console.log('— the wire (route.ts) —');
ok('ONE groupBy answers every bucket over the same where', route.includes('db.loyaltyTransaction.groupBy({') && route.includes("by: ['transactionType'],") && route.includes('_count: { _all: true },'));
ok('the buckets fold to { type: { points, count } }', route.includes('const buckets: Record<string, { points: number; count: number }> = {};') && route.includes('count: b._count._all,'));
ok('the summary carries the buckets additively', route.includes('buckets,'));
ok('the two sign-based legacy aggregates stay EXACTLY as they were', route.includes('totalPointsEarned: earnedSummary._sum.points || 0,') && route.includes('totalPointsRedeemed: Math.abs(redeemedSummary._sum.points || 0),') && route.includes('totalEarnCount: earnedSummary._count,') && route.includes('totalRedeemCount: redeemedSummary._count,'));
ok('the baseline lie is written where the next reader meets it', route.includes('THE PER-TYPE TRUTH') && route.includes('the page-1 sum read 700 while the wire held 1,140'));

console.log('— the envelope (api.ts) —');
ok('summary is typed with the totals + buckets ledger', api.includes('summary?: {') && api.includes('buckets?: Record<string, { points: number; count: number }>;'));
ok('the additive law rides the field (same law as window/costGated)', api.includes("THE WIRE'S SUMMARY") && api.includes('same law as window/costGated'));

console.log('— the desk (loyalty-tab.tsx) —');
ok('the cards read the wire\'s buckets', loyaltyTab.includes('const wireBuckets = txData?.summary?.buckets;') && loyaltyTab.includes('(wireBuckets.EARN?.points ?? 0) + (wireBuckets.BONUS?.points ?? 0)') && loyaltyTab.includes('(wireBuckets.REDEEM?.points ?? 0)'));
ok('the page-1 reduce is the documented never-NaN fallback', loyaltyTab.includes('never a NaN, never a guess') && loyaltyTab.includes(".filter((t: LoyaltyTransactionItem) => ['EARN', 'BONUS'].includes(t.transactionType))"));
ok('the scope label is computed from the desk\'s own scope state', loyaltyTab.includes('const pointsScope = pointsScopeLabel(dateWindowActive, txTypeFilter);'));
ok('both summary cards carry their testid', loyaltyTab.includes("testid: 'scope-issued'") && loyaltyTab.includes("testid: 'scope-redeemed'"));
ok('the scope is worn: amber when scoped, muted all rows when whole', loyaltyTab.includes("'mt-0.5 text-[11px] font-medium text-amber-700 dark:text-amber-400'") && loyaltyTab.includes("'mt-0.5 text-[11px] text-muted-foreground'"));
ok('the values earn tabular-nums digits', loyaltyTab.includes('text-lg font-bold mt-1 tabular-nums'));
ok('the tooltip is the honest aggregate voice', loyaltyTab.includes('Summed over every row the query matched') && loyaltyTab.includes('not just the page below'));
ok('the import carries the scope label beside the clawback face', loyaltyTab.includes("import { isRefundClawbackTx, pointsScopeLabel } from '@/lib/loyalty-utils';"));

console.log('— the housekeeping + release voice —');
ok('the docs register carries the summary-voice note', docs.includes('**v2.319.0**: the cards answer the ledger') && docs.includes('pointsScopeLabel'));
ok('the manifest answers 2.319.0 in all three slots', pkg.version === '2.319.0' && pkg.mbumah?.releaseVersion === '2.319.0' && pkg.mbumah?.baseVersion === '2.319.0');
ok('the test file pins the truth table (scope label, wire buckets, envelope, desk voice)', test.includes("pointsScopeLabel(true, 'EXPIRE')") && test.includes("const wireBuckets = txData?.summary?.buckets;") && test.includes("testid: 'scope-issued'") && test.includes('text-lg font-bold mt-1 tabular-nums'));
ok('whats-new leads with the round\u2019s story', whatsNew.includes("version: '2.319.0',") && whatsNew.includes('The cards answer the ledger'));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
