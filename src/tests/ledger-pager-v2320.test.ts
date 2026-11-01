// ─────────────────────────────────────────────────────────────────────────────
// Ledger pager (v2.320.0) - "the ledger turns the page"
// ─────────────────────────────────────────────────────────────────────────────
//
// The desk's ledger stopped at page one (limit 100) while the wire
// answered its own pagination — rows 101… were invisible, and a desk
// whose ledger outgrew one page could never show the rest. This round
// the desk turns the page. This file pins:
//
//   1. The page parser's truth table (src/lib/tab-url.ts
//      parseInitialPage): the vocabulary's FIFTH word (`?page=`,
//      collision-checked — no other address-bar reader of `page`
//      exists). The law is SHAPE, not existence: digits only, ≥ 1;
//      missing/malformed/zero/negative/float answers 1; a page past
//      the ledger's end is NOT refused (the wire answers its own
//      pagination; the desk's past-the-end face speaks).
//   2. The desk (loyalty-tab.tsx): the SSR-guarded seed, the page in
//      BOTH the query key and the wire's `page` param (page 2 is a
//      different ledger slice, never a cached re-render), the
//      scope-reset law (a filter change returns to page 1 — but the
//      MOUNT seed survives, a deep-linked ?page=2 lands), the pager
//      (census + status in the WIRE's voice, buttons move the state,
//      disabled bounds, tabular-nums), and the honest past-the-end
//      empty (the wire says rows exist — the desk says where they
//      went and offers the way back).
//   3. The pin evolutions: the tab-url import line gains
//      parseInitialPage in the four earlier trail files (the pin
//      follows the import, not the round).
// ─────────────────────────────────────────────────────────────────────────────

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { parseInitialPage } from '@/lib/tab-url';

describe('parseInitialPage — the ?page= truth table (shape, not existence)', () => {
  it('a positive integer seeds the pager', () => {
    expect(parseInitialPage('?page=2')).toBe(2);
    expect(parseInitialPage('?page=1')).toBe(1);
    expect(parseInitialPage('?tab=loyalty&view=transactions&page=3')).toBe(3);
  });

  it('leading zeros are still integers (a shape, not a format law)', () => {
    expect(parseInitialPage('?page=02')).toBe(2);
  });

  it('anything that is not a positive integer answers the fallback', () => {
    expect(parseInitialPage('?page=0')).toBe(1);
    expect(parseInitialPage('?page=-3')).toBe(1);
    expect(parseInitialPage('?page=2.5')).toBe(1);
    expect(parseInitialPage('?page=abc')).toBe(1);
    expect(parseInitialPage('?page=')).toBe(1);
    expect(parseInitialPage('?view=transactions')).toBe(1);
    expect(parseInitialPage('')).toBe(1);
  });

  it('a malformed search never throws', () => {
    expect(parseInitialPage('??=//%')).toBe(1);
  });

  it('a page past the end is NOT refused here (the wire clamps, the desk speaks)', () => {
    expect(parseInitialPage('?page=999999')).toBe(999999);
  });

  it('an explicit fallback is honored', () => {
    expect(parseInitialPage('?page=garbage', 4)).toBe(4);
    expect(parseInitialPage('', 4)).toBe(4);
  });
});

describe('the desk — the pager wears the wire, the state turns the page', () => {
  const tab = readFileSync('src/app/(shell)/tabs/loyalty-tab.tsx', 'utf8');

  it('the seed is SSR-guarded and reads the fifth vocabulary word', () => {
    expect(tab.includes('function initialTxPage(): number {')).toBe(true);
    expect(tab.includes("return parseInitialPage(window.location.search, 1);")).toBe(true);
    expect(tab.includes("if (typeof window === 'undefined') return 1;")).toBe(true);
  });

  it('the page rides BOTH the query key and the wire (a different slice, not a cached re-render)', () => {
    // v2.321.0 pin evolution (deliberate): the gait rides the key too —
    // 50 rows/page is a different slice of the same ledger; the pin
    // follows the key, not the round.
    expect(tab.includes('txDateFrom, txDateTo, txPage, txLimit]')).toBe(true);
    expect(tab.includes('page: txPage,')).toBe(true);
  });

  it('the scope-reset law: a filter change returns to page 1, the mount seed survives', () => {
    // v2.321.0 pin evolution (deliberate): the gait wears the scope key
    // — a page honest at 100/page can be past the end at 200/page; the
    // pin follows the key, not the round.
    expect(tab.includes('const txScopeKey = `${txTypeFilter}|${txDateFrom}|${txDateTo}|${txLimit}`;')).toBe(true);
    expect(tab.includes('const txPrevScopeKey = useRef(txScopeKey);')).toBe(true);
    expect(tab.includes('txPrevScopeKey.current !== txScopeKey')).toBe(true);
    expect(tab.includes('setTxPage(1);')).toBe(true);
  });

  it('the census and the status speak the WIRE voice (never the state)', () => {
    expect(tab.includes('data-testid="tx-census"')).toBe(true);
    expect(tab.includes('data-testid="pager-status"')).toBe(true);
    expect(tab.includes('Page {txData.pagination.page} of {txData.pagination.totalPages}')).toBe(true);
    expect(tab.includes('Math.min(txData.pagination.page * txData.pagination.limit, txData.pagination.total)')).toBe(true);
  });

  it('the buttons move the STATE, the bounds are honest, the digits are tabular', () => {
    expect(tab.includes('data-testid="pager-prev"')).toBe(true);
    expect(tab.includes('data-testid="pager-next"')).toBe(true);
    expect(tab.includes('aria-label="Previous page"')).toBe(true);
    expect(tab.includes('aria-label="Next page"')).toBe(true);
    expect(tab.includes('disabled={txData.pagination.page <= 1}')).toBe(true);
    expect(tab.includes('disabled={txData.pagination.page >= txData.pagination.totalPages}')).toBe(true);
    expect(tab.includes('text-muted-foreground tabular-nums')).toBe(true);
  });

  it('the pager renders ONLY when the ledger actually has a second page', () => {
    expect(tab.includes('txData.pagination.totalPages > 1')).toBe(true);
  });

  it('the past-the-end empty is honest: the wire says rows exist, the desk offers the way back', () => {
    expect(tab.includes('data-testid="pager-past-end"')).toBe(true);
    expect(tab.includes('data-testid="pager-back-to-one"')).toBe(true);
    expect(tab.includes('is past the end of this ledger')).toBe(true);
    expect(tab.includes('THE HONEST EMPTY')).toBe(true);
  });

  it('the icons and hooks the pager needs ride the imports', () => {
    expect(tab.includes('ChevronLeft, ChevronRight,')).toBe(true);
    expect(tab.includes("import React, { useEffect, useRef, useState } from 'react';")).toBe(true);
  });

  it('the tab-url import carries the fifth and sixth words (the trail files evolved with them)', () => {
    // v2.321.0 pin evolution (deliberate): parseInitialLimit joins — the
    // gait lands on `?limit=`; the pin follows the import, not the round.
    expect(tab.includes("import { buildSearchWithoutParams, parseInitialDateRange, parseInitialLimit, parseInitialPage, parseInitialType, parseInitialView } from '@/lib/tab-url';")).toBe(true);
    const trail2311 = readFileSync('src/tests/receipt-trail-v2311.test.ts', 'utf8');
    const trail2316 = readFileSync('src/tests/expiry-ledger-link-v2316.test.ts', 'utf8');
    const trail2317 = readFileSync('src/tests/expiry-day-window-v2317.test.ts', 'utf8');
    const trail2318 = readFileSync('src/tests/expiry-window-dismiss-v2318.test.ts', 'utf8');
    const evolved = "import { buildSearchWithoutParams, parseInitialDateRange, parseInitialLimit, parseInitialPage, parseInitialType, parseInitialView } from '@/lib/tab-url';";
    expect(trail2311.includes(evolved)).toBe(true);
    expect(trail2316.includes(evolved)).toBe(true);
    expect(trail2317.includes(evolved)).toBe(true);
    expect(trail2318.includes(evolved)).toBe(true);
    // every evolution carries its trail note — the pin follows the import
    expect(trail2311.includes('v2.320.0 pin evolution')).toBe(true);
    expect(trail2317.includes('v2.320 trail')).toBe(true);
  });
});
