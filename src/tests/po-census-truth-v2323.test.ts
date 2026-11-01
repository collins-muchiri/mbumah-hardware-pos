// ─────────────────────────────────────────────────────────────────────────────
// Purchase-order census truth (v2.323.0) - "the roster joins the truth"
// ─────────────────────────────────────────────────────────────────────────────
//
// The v2.322.0 live QA walk caught the LOYALTY ledger's census lying on a
// page past the end ("Showing rows 801–126 of 126"). The round-start sweep
// (rg for the `(page - 1) * limit` arithmetic class outside loyalty) found
// ONE more UI desk speaking the same arithmetic — the purchase-order
// roster — and one more door of the same 500 class the loyalty door's QA
// walk proved: `parseInt(searchParams.get('page') || '1')` rode NaN into
// Prisma's `skip` for any malformed ?page=. This release ports BOTH laws
// to the roster. This file pins:
//
//   1. THE DOOR (api/purchase-orders/route.ts): page reads through
//      parsePositiveIntParam (shape law; past-the-end honest), limit
//      through parseClampedIntParam into [1, 200] (the house's largest
//      gait); the raw parseInt door is GONE; the 500 proof is written
//      where the next reader meets it.
//   2. THE CENSUS NEVER LIES (purchase-orders-tab.tsx): page > totalPages
//      renders the honest empty census (po-census-empty), the numeric
//      census (po-census) speaks only on pages the roster HAS.
//   3. THE HONEST EMPTY (the v2.320 law, ported): the roster's empty
//      branch says "Page N is past the end of this ledger — N orders live
//      on earlier pages." and offers the way back (po-past-end,
//      po-back-to-one); the generic empty keeps its own voices for pages
//      the roster has.
//   4. THE A11Y VOICE: the pager buttons carry aria-labels ("Previous
//      page" / "Next page"), the digits are tabular, and the Next button
//      is a real ChevronRight — the rotate-180 hack is gone.
// ─────────────────────────────────────────────────────────────────────────────

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { parseClampedIntParam, parsePositiveIntParam } from '@/lib/tab-url';

describe('the door — honest integers at the roster wire', () => {
  const route = readFileSync('src/app/api/purchase-orders/route.ts', 'utf8');

  it('page reads through parsePositiveIntParam, limit through parseClampedIntParam', () => {
    expect(route.includes("parsePositiveIntParam(searchParams.get('page'), 1)")).toBe(true);
    expect(route.includes("parseClampedIntParam(searchParams.get('limit'), 50, 1, 200)")).toBe(true);
    expect(route.includes("import { parseClampedIntParam, parsePositiveIntParam } from '@/lib/tab-url';")).toBe(true);
  });

  it('the raw parseInt door is GONE (code, not the comment that names it)', () => {
    expect(route.includes("const page = parseInt(")).toBe(false);
    expect(route.includes("const limit = parseInt(")).toBe(false);
    expect(route.includes("= parseInt(searchParams.get('page') || '1');")).toBe(false);
    expect(route.includes("= parseInt(searchParams.get('limit') || '50');")).toBe(false);
  });

  it('the 500 proof is written where the next reader meets it', () => {
    expect(route.includes('THE DOOR IS HONEST ABOUT ITS NUMBERS')).toBe(true);
    expect(route.includes('?page=abc')).toBe(true);
    expect(route.includes('NaN')).toBe(true);
  });

  it('the honest-param laws behave (the truth table, re-pinned at the new door)', () => {
    expect(parsePositiveIntParam('abc', 1)).toBe(1);
    expect(parsePositiveIntParam('0', 1)).toBe(1);
    expect(parsePositiveIntParam('-3', 1)).toBe(1);
    expect(parsePositiveIntParam('2.5', 1)).toBe(1);
    expect(parsePositiveIntParam(null, 1)).toBe(1);
    expect(parseClampedIntParam('5000', 50, 1, 200)).toBe(200);
    expect(parseClampedIntParam('abc', 50, 1, 200)).toBe(50);
    expect(parseClampedIntParam('0', 50, 1, 200)).toBe(1);
  });

  it('the skip/take arithmetic rides the honest ints', () => {
    expect(route.includes('skip: (page - 1) * limit,')).toBe(true);
    expect(route.includes('take: limit,')).toBe(true);
  });
});

describe('the census never lies — the roster pager', () => {
  const tab = readFileSync('src/app/(shell)/tabs/purchase-orders-tab.tsx', 'utf8');

  it('a page past the end renders the honest empty census, not arithmetic', () => {
    expect(tab.includes('data-testid="po-census-empty"')).toBe(true);
    expect(tab.includes('No rows on this page — the ledger ends at')).toBe(true);
    expect(tab.includes('page > pagination.totalPages')).toBe(true);
  });

  it('the honest census wears the desk voice (muted, tabular digits)', () => {
    expect(tab.includes('text-xs text-muted-foreground tabular-nums" data-testid="po-census-empty"')).toBe(true);
  });

  it('the numeric census still speaks on valid pages, with its end-guard', () => {
    expect(tab.includes('data-testid="po-census"')).toBe(true);
    expect(tab.includes('Math.min(page * limit, pagination.total)')).toBe(true);
    expect(tab.includes('Showing {(page - 1) * limit + 1}')).toBe(true);
  });

  it('the lie is structurally gone: "Showing" lives only in the page-valid arm', () => {
    const censusArm = tab.slice(
      tab.indexOf('data-testid="po-census-empty"'),
      tab.indexOf('data-testid="po-census"'),
    );
    expect(censusArm.includes('No rows on this page')).toBe(true);
    expect(censusArm.includes('Showing')).toBe(false);
  });

  it('the bounds are honest and the pager renders only when a second page exists', () => {
    expect(tab.includes('disabled={page <= 1}')).toBe(true);
    expect(tab.includes('disabled={page >= pagination.totalPages}')).toBe(true);
    expect(tab.includes('pagination.totalPages > 1')).toBe(true);
  });
});

describe('the honest empty — the way back', () => {
  const tab = readFileSync('src/app/(shell)/tabs/purchase-orders-tab.tsx', 'utf8');

  it('the past-the-end face says where the orders went and offers the way back', () => {
    expect(tab.includes('data-testid="po-past-end"')).toBe(true);
    expect(tab.includes('is past the end of this ledger')).toBe(true);
    expect(tab.includes('data-testid="po-back-to-one"')).toBe(true);
    expect(tab.includes('onClick={() => setPage(1)}')).toBe(true);
  });

  it('the face guards on the wire truth (rows exist, page outruns totalPages)', () => {
    expect(tab.includes('pagination && pagination.total > 0 && page > pagination.totalPages')).toBe(true);
  });

  it('the generic empty keeps its own voices (the lens, the filters, the invitation)', () => {
    expect(tab.includes('No purchase orders found')).toBe(true);
    expect(tab.includes('Try adjusting your filters or search terms')).toBe(true);
    expect(tab.includes('Create your first purchase order to get started')).toBe(true);
  });
});

describe('the a11y voice — the pager speaks to every reader', () => {
  const tab = readFileSync('src/app/(shell)/tabs/purchase-orders-tab.tsx', 'utf8');

  it('the buttons carry aria-labels and testids', () => {
    expect(tab.includes('aria-label="Previous page"')).toBe(true);
    expect(tab.includes('aria-label="Next page"')).toBe(true);
    expect(tab.includes('data-testid="po-pager-prev"')).toBe(true);
    expect(tab.includes('data-testid="po-pager-next"')).toBe(true);
    expect(tab.includes('data-testid="po-pager-status"')).toBe(true);
  });

  it('the Next button is a real ChevronRight — the rotate-180 hack is gone', () => {
    expect(tab.includes('ChevronRight className="h-4 w-4"')).toBe(true);
    expect(tab.includes('rotate-180')).toBe(false);
  });

  it('the status digits are tabular', () => {
    expect(tab.includes('text-sm px-2 tabular-nums"')).toBe(true);
  });
});

describe('the honesty class is a house law now — two desks speak it', () => {
  it('loyalty spoke first (v2.322), the roster joins (v2.323)', () => {
    const loyalty = readFileSync('src/app/(shell)/tabs/loyalty-tab.tsx', 'utf8');
    const roster = readFileSync('src/app/(shell)/tabs/purchase-orders-tab.tsx', 'utf8');
    expect(loyalty.includes('THE CENSUS NEVER LIES')).toBe(true);
    expect(roster.includes('THE CENSUS NEVER LIES')).toBe(true);
    expect(loyalty.includes('tx-census-empty')).toBe(true);
    expect(roster.includes('po-census-empty')).toBe(true);
  });
});
