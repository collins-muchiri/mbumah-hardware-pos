// ─────────────────────────────────────────────────────────────────────────────
// Ledger summary voice (v2.319.0) - "the cards answer the ledger"
// ─────────────────────────────────────────────────────────────────────────────
//
// The desk's two points cards ("Points Issued" / "Points Redeemed") were
// summed client-side from the FIRST PAGE of rows (limit 100) — the
// baseline burst proved the lie live with 120 seeded QA rows:
//
//     card "Points Issued"    read 700   — the wire held 1,140 (126 rows)
//     card "Points Redeemed"  read 0     — the wire said 360 (the redeem
//                                         rows had fallen off page one)
//     scoped ?type=EXPIRE     both cards read 0 with NO word why
//
// This round the cards wear the wire's own summary (aggregates computed
// server-side over EVERY matching row) and SAY their scope. This file pins:
//
//   1. The scope label's truth table (src/lib/loyalty-utils.ts
//      pointsScopeLabel): window · type pieces joined, 'all rows' when
//      the ledger is whole, display-uppercase, whitespace-trimmed.
//   2. The per-type truth at the wire (api/loyalty/transactions/route.ts):
//      ONE groupBy answers every bucket over ALL matching rows; the two
//      sign-based legacy aggregates stay EXACTLY as they were (additive
//      law — older readers keep their numbers).
//   3. The envelope (src/lib/api.ts): the additive typed `summary` rides
//      ApiResponse (same law as window/costGated).
//   4. The desk (loyalty-tab.tsx): the cards read `txData.summary.buckets`
//      (EARN+BONUS = issued, REDEEM = redeemed), the page-1 reduce stays
//      ONLY as the never-NaN fallback, and the two cards carry the scope
//      label — amber when scoped, muted 'all rows' when whole — with
//      tabular-nums digits and the honest tooltip.
// ─────────────────────────────────────────────────────────────────────────────

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { pointsScopeLabel } from '@/lib/loyalty-utils';

describe('pointsScopeLabel — the cards say which ledger they sum', () => {
  it('a scoped query names both voices, window first', () => {
    expect(pointsScopeLabel(true, 'EXPIRE')).toBe('window · EXPIRE');
    expect(pointsScopeLabel(true, 'REDEEM')).toBe('window · REDEEM');
  });

  it('each scope speaks alone', () => {
    expect(pointsScopeLabel(true, 'all')).toBe('window');
    expect(pointsScopeLabel(false, 'EARN')).toBe('EARN');
  });

  it('an unscoped ledger answers "all rows" (the aggregate covers the store)', () => {
    expect(pointsScopeLabel(false, 'all')).toBe('all rows');
    expect(pointsScopeLabel(false, '')).toBe('all rows');
  });

  it('the type voice is display-uppercase and trimmed (a label, not a filter)', () => {
    expect(pointsScopeLabel(false, 'expire')).toBe('EXPIRE');
    expect(pointsScopeLabel(false, ' EXPIRE ')).toBe('EXPIRE');
    expect(pointsScopeLabel(true, 'all')).toBe('window'); // 'all' never rides the label
  });
});

describe('the wire — ONE groupBy answers every bucket over ALL matching rows', () => {
  const route = readFileSync('src/app/api/loyalty/transactions/route.ts', 'utf8');

  it('the per-type groupBy rides the same where the page rides', () => {
    expect(route.includes('db.loyaltyTransaction.groupBy({')).toBe(true);
    expect(route.includes("by: ['transactionType'],")).toBe(true);
    expect(route.includes('_count: { _all: true },')).toBe(true);
  });

  it('the buckets are folded to { type: { points, count } }', () => {
    expect(route.includes('const buckets: Record<string, { points: number; count: number }> = {};')).toBe(true);
    expect(route.includes('buckets[b.transactionType] = {')).toBe(true);
    expect(route.includes('points: b._sum.points || 0,')).toBe(true);
    expect(route.includes('count: b._count._all,')).toBe(true);
  });

  it('the summary carries the buckets (additive to the two totals)', () => {
    expect(route.includes('totalPointsEarned: earnedSummary._sum.points || 0,')).toBe(true);
    expect(route.includes('totalPointsRedeemed: Math.abs(redeemedSummary._sum.points || 0),')).toBe(true);
    expect(route.includes('buckets,')).toBe(true);
  });

  it('the baseline lie is written where the next reader meets it', () => {
    expect(route.includes('THE PER-TYPE TRUTH')).toBe(true);
    expect(route.includes('the page-1 sum read 700 while the wire held 1,140')).toBe(true);
    expect(route.includes('had fallen off page one')).toBe(true);
  });
});

describe('the envelope — the typed summary rides ApiResponse (same law as window)', () => {
  const api = readFileSync('src/lib/api.ts', 'utf8');

  it('summary is typed with the two totals and the buckets ledger', () => {
    expect(api.includes('summary?: {')).toBe(true);
    expect(api.includes('totalPointsEarned: number;')).toBe(true);
    expect(api.includes('totalPointsRedeemed: number;')).toBe(true);
    expect(api.includes('buckets?: Record<string, { points: number; count: number }>;')).toBe(true);
  });

  it('the additive law rides the field (same law as window/costGated)', () => {
    expect(api.includes("THE WIRE'S SUMMARY")).toBe(true);
    expect(api.includes('same law as window/costGated')).toBe(true);
  });
});

describe('the desk — the cards wear the wire, the scope is said', () => {
  const tab = readFileSync('src/app/(shell)/tabs/loyalty-tab.tsx', 'utf8');

  it('the cards read the wire\'s buckets, never the page', () => {
    expect(tab.includes('const wireBuckets = txData?.summary?.buckets;')).toBe(true);
    expect(tab.includes('(wireBuckets.EARN?.points ?? 0) + (wireBuckets.BONUS?.points ?? 0)')).toBe(true);
    expect(tab.includes('(wireBuckets.REDEEM?.points ?? 0)')).toBe(true);
  });

  it('the page-1 reduce stays ONLY as the never-NaN fallback', () => {
    expect(tab.includes(".filter((t: LoyaltyTransactionItem) => ['EARN', 'BONUS'].includes(t.transactionType))")).toBe(true);
    expect(tab.includes('const wireBuckets = txData?.summary?.buckets;')).toBe(true);
    expect(tab.includes('never a NaN, never a guess')).toBe(true);
  });

  it('the scope label is computed and worn on both summary cards', () => {
    expect(tab.includes('const pointsScope = pointsScopeLabel(dateWindowActive, txTypeFilter);')).toBe(true);
    expect(tab.includes("data-testid={stat.testid}")).toBe(true);
    expect(tab.includes("testid: 'scope-issued'")).toBe(true);
    expect(tab.includes("testid: 'scope-redeemed'")).toBe(true);
    expect(tab.includes("{pointsScope}")).toBe(true);
  });

  it('the summary voice is honest in both states (amber when scoped, muted all rows)', () => {
    expect(tab.includes("const scoped = pointsScope !== 'all rows';")).toBe(true);
    expect(tab.includes("'mt-0.5 text-[11px] font-medium text-amber-700 dark:text-amber-400'")).toBe(true);
    expect(tab.includes("'mt-0.5 text-[11px] text-muted-foreground'")).toBe(true);
    expect(tab.includes("Summed over every row the query matched")).toBe(true);
  });

  it('the values earn tabular-nums digits (the ledger census law)', () => {
    expect(tab.includes('text-lg font-bold mt-1 tabular-nums')).toBe(true);
  });

  it('the import carries the scope label beside the clawback face', () => {
    expect(tab.includes("import { isRefundClawbackTx, pointsScopeLabel } from '@/lib/loyalty-utils';")).toBe(true);
  });
});
