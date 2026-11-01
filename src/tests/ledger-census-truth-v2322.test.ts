// ─────────────────────────────────────────────────────────────────────────────
// Ledger census truth (v2.322.0) - "the census never lies"
// ─────────────────────────────────────────────────────────────────────────────
//
// The live QA walk (Job 490238, trace …202611011442) caught the desk in a
// lie: with a deep-linked ?page=9 on a 126-row ledger, the pager bar's
// census computed start = (9−1)×100+1 = 801 and end = min(900, 126) = 126
// and spoke "Showing rows 801–126 of 126" — a start AFTER the end, rendered
// right beside the honest past-the-end face that v2.320.0 shipped. The face
// told the truth; the census told arithmetic. This round the census joins
// the truth. This file pins:
//
//   1. THE CENSUS NEVER LIES (loyalty-tab.tsx): when the wire's own page
//      outruns its own totalPages, the census slot renders the honest
//      "No rows on this page — the ledger ends at 126." line
//      (data-testid="tx-census-empty") in the desk's voice (the same
//      text-muted-foreground tabular-nums wardrobe); the numeric census
//      (data-testid="tx-census") renders on every page the ledger HAS,
//      with its end-guard (Math.min) intact.
//   2. THE FAB BAND: a runway of empty space below the pager (h-16 sm:h-14)
//      so the bar can always scroll clear of the fixed bottom-right
//      Dashboard FAB's footprint — geometry, not a race (the Task 42
//      measurement becomes a layout law).
//   3. THE NEIGHBORS KEEP THEIR VOICE: the past-the-end face, the scope
//      reset, the bounds, the wire-voice status — the v2.320/321 pins all
//      still stand (the census fix touches only the census slot).
// ─────────────────────────────────────────────────────────────────────────────

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';

describe('the census never lies — the past-the-end census slot', () => {
  const tab = readFileSync('src/app/(shell)/tabs/loyalty-tab.tsx', 'utf8');

  it('a page past the end renders the honest empty census, not arithmetic', () => {
    expect(tab.includes('data-testid="tx-census-empty"')).toBe(true);
    expect(tab.includes('No rows on this page — the ledger ends at')).toBe(true);
    expect(tab.includes('txData.pagination.page > txData.pagination.totalPages')).toBe(true);
  });

  it('the honest census wears the desk voice (muted, tabular digits)', () => {
    expect(tab.includes('text-xs text-muted-foreground tabular-nums" data-testid="tx-census-empty"')).toBe(true);
  });

  it('the numeric census still speaks on every page the ledger HAS (end-guard intact)', () => {
    expect(tab.includes('data-testid="tx-census"')).toBe(true);
    expect(tab.includes('Math.min(txData.pagination.page * txData.pagination.limit, txData.pagination.total)')).toBe(true);
    expect(tab.includes('Showing rows {((txData.pagination.page - 1) * txData.pagination.limit) + 1}')).toBe(true);
  });

  it('the old lie is gone: no census can start past the ledger it describes', () => {
    // The numeric census renders ONLY under the page <= totalPages arm —
    // the ternary's truthy arm is the empty census, so the "Showing rows"
    // text lives exclusively on valid pages.
    const censusArm = tab.slice(
      tab.indexOf('data-testid="tx-census-empty"'),
      tab.indexOf('data-testid="tx-census"'),
    );
    expect(censusArm.includes('No rows on this page')).toBe(true);
    expect(censusArm.includes('Showing rows')).toBe(false);
  });

  it('the past-the-end face keeps its own truth (the face and the census agree now)', () => {
    expect(tab.includes('data-testid="pager-past-end"')).toBe(true);
    expect(tab.includes('is past the end of this ledger')).toBe(true);
    expect(tab.includes('data-testid="pager-back-to-one"')).toBe(true);
  });
});

describe('the FAB band — geometry, not a race', () => {
  const tab = readFileSync('src/app/(shell)/tabs/loyalty-tab.tsx', 'utf8');

  it('the pager gains a runway below it (h-16 sm:h-14, aria-hidden)', () => {
    expect(tab.includes('<div aria-hidden className="h-16 sm:h-14" />')).toBe(true);
    expect(tab.includes('THE FAB BAND')).toBe(true);
  });

  it('the band sits AFTER the pager bar (the runway follows the bar)', () => {
    const pagerAt = tab.indexOf('data-testid="tx-pager"');
    const bandAt = tab.indexOf('THE FAB BAND');
    expect(pagerAt).toBeGreaterThan(-1);
    expect(bandAt).toBeGreaterThan(pagerAt);
  });
});

describe('the neighbors keep their voice — the v2.320/321 pins still stand', () => {
  const tab = readFileSync('src/app/(shell)/tabs/loyalty-tab.tsx', 'utf8');

  it('the wire-voice status and the bounds are untouched', () => {
    expect(tab.includes('Page {txData.pagination.page} of {txData.pagination.totalPages}')).toBe(true);
    expect(tab.includes('disabled={txData.pagination.page <= 1}')).toBe(true);
    expect(tab.includes('disabled={txData.pagination.page >= txData.pagination.totalPages}')).toBe(true);
    expect(tab.includes('aria-label="Previous page"')).toBe(true);
    expect(tab.includes('aria-label="Next page"')).toBe(true);
  });

  it('the pager still renders only when a second page exists', () => {
    expect(tab.includes('txData.pagination.totalPages > 1')).toBe(true);
  });

  it('the scope-reset law and the gait ride the same keys as before', () => {
    expect(tab.includes('const txScopeKey = `${txTypeFilter}|${txDateFrom}|${txDateTo}|${txLimit}`;')).toBe(true);
    expect(tab.includes('txPrevScopeKey.current !== txScopeKey')).toBe(true);
    expect(tab.includes('txDateFrom, txDateTo, txPage, txLimit]')).toBe(true);
  });

  it('the vocabulary imports stay whole (no import changed this round)', () => {
    expect(tab.includes("parseInitialLimit, parseInitialPage")).toBe(true);
  });
});
