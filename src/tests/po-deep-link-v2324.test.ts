// ─────────────────────────────────────────────────────────────────────────────
// The body's door + the roster's own word (v2.324.0) — "the roster speaks
// its own word, and the door reads the body honestly"
// ─────────────────────────────────────────────────────────────────────────────
//
// The v2.323.0 live QA burst proved a body-less DELETE on the purchase-order
// detail route answered HTTP 500 with "Unexpected end of JSON input" — a
// CLIENT mistake (a request without a body cannot name its action) wearing a
// SERVER-crash status. And the Task 44 handover named the deep-link collision
// law's safe path: two desks reading the SAME `?page=` word leak across
// client-side tab switches, so a second desk speaks a DESK-PREFIXED word.
// This release ships both. This file pins:
//
//   1. THE BODY'S DOOR (api/purchase-orders/[id]/route.ts): the body parse
//      rides in a try/catch — an empty or malformed body answers 400 with
//      the actions hint (the same voice the no-valid-action fallback
//      speaks), never a SyntaxError 500.
//   2. THE ROSTER'S OWN WORD (purchase-orders-tab.tsx + lib/tab-url.ts):
//      `?po-page=N` seeds the roster's pager through parseInitialNamedPage
//      (the shape law, param-NAMEd, ONE home — parseInitialPage delegates);
//      the desk only ever READS the word on mount (the one-writer law);
//      loyalty keeps `page` untouched.
//   3. THE FACE WEARS THE AMBER: the past-the-end face is attention, not
//      error — it wears the amber card (icon + honest line + WHY hint +
//      way back), and the testids keep their names.
//   4. THE CENSUS WEARS THE PILL: both census slots and the pager status
//      ride the pill wardrobe — and the v2.323 desk-voice pin still holds
//      byte-for-byte (the classes grew, the order kept the pin).
// ─────────────────────────────────────────────────────────────────────────────

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { parseInitialNamedPage, parseInitialPage } from '@/lib/tab-url';

describe('the body\u2019s door — the detail route reads the body honestly', () => {
  const route = readFileSync('src/app/api/purchase-orders/[id]/route.ts', 'utf8');

  it('the body parse rides in a try/catch (the SyntaxError 500 is unreachable)', () => {
    expect(route.includes('let body: {')).toBe(true);
    expect(route.includes('body = await request.json();')).toBe(true);
    expect(route.includes('} catch {')).toBe(true);
    // the OLD bytes are gone: a bare request.json() assign had no door
    expect(route.includes('const body = await request.json();')).toBe(false);
  });

  it('an empty or malformed body answers 400 with the actions hint', () => {
    expect(route.includes("{ status: 400 }")).toBe(true);
    expect(route.includes('Request body must be valid JSON')).toBe(true);
    expect(route.includes('{"action": "delete"}')).toBe(true);
    expect(route.includes('{"action": "receive"')).toBe(true);
  });

  it('the proof is written where the next reader meets it', () => {
    expect(route.includes('THE BODY IS HONEST ABOUT ITS SHAPE')).toBe(true);
    expect(route.includes("THE BODY'S DOOR")).toBe(true);
  });

  it('the delete dispatch still guards status and receipts (the door grew, the law stands)', () => {
    expect(route.includes("body.action === 'delete'")).toBe(true);
    expect(route.includes('Can only delete DRAFT or CANCELLED purchase orders.')).toBe(true);
    expect(route.includes('Cannot delete a purchase order with received items (stock movements exist).')).toBe(true);
  });
});

describe('the roster\u2019s own word — ?po-page= seeds the pager', () => {
  const tab = readFileSync('src/app/(shell)/tabs/purchase-orders-tab.tsx', 'utf8');
  const tabUrl = readFileSync('src/lib/tab-url.ts', 'utf8');
  const loyalty = readFileSync('src/app/(shell)/tabs/loyalty-tab.tsx', 'utf8');

  it('the named parser exists at the parsers\u2019 one home and parseInitialPage delegates', () => {
    expect(tabUrl.includes('export function parseInitialNamedPage(search: string, param: string, fallback = 1): number')).toBe(true);
    expect(tabUrl.includes("return parseInitialNamedPage(search, 'page', fallback);")).toBe(true);
  });

  it('the shape law holds for the named word (truth table)', () => {
    expect(parseInitialNamedPage('?tab=purchase-orders&po-page=2', 'po-page', 1)).toBe(2);
    expect(parseInitialNamedPage('?po-page=17', 'po-page', 1)).toBe(17);
    expect(parseInitialNamedPage('?po-page=abc', 'po-page', 1)).toBe(1);
    expect(parseInitialNamedPage('?po-page=0', 'po-page', 1)).toBe(1);
    expect(parseInitialNamedPage('?po-page=-3', 'po-page', 1)).toBe(1);
    expect(parseInitialNamedPage('?po-page=2.5', 'po-page', 1)).toBe(1);
    expect(parseInitialNamedPage('', 'po-page', 1)).toBe(1);
    expect(parseInitialNamedPage('?po-page=8000000000', 'po-page', 1)).toBe(8000000000);
  });

  it('the word is param-NAMEd: one desk\u2019s word never reads another\u2019s param', () => {
    expect(parseInitialNamedPage('?page=9', 'po-page', 1)).toBe(1);
    expect(parseInitialNamedPage('?po-page=9', 'page', 1)).toBe(1);
    expect(parseInitialPage('?po-page=9', 1)).toBe(1);
    expect(parseInitialPage('?page=9', 1)).toBe(9);
  });

  it('the desk reads ?po-page= through the one home, SSR-guarded, on mount only', () => {
    expect(tab.includes("import { parseInitialNamedPage } from '@/lib/tab-url';")).toBe(true);
    expect(tab.includes("parseInitialNamedPage(window.location.search, 'po-page', 1)")).toBe(true);
    const fn = tab.slice(tab.indexOf('function initialPoPage'), tab.indexOf('function initialPoPage') + 260);
    expect(fn.includes("typeof window === 'undefined'")).toBe(true);
    expect(tab.includes('useState<number>(initialPoPage)')).toBe(true);
  });

  it('the one-writer law: the bar\u2019s word is the LANDING page, never rewritten', () => {
    // the desk never WRITES po-page back to the address bar — the only
    // occurrences are the comment law, the import, the reader and the seed
    const writes = tab.split('\n').filter((l) => l.includes('po-page') && (l.includes('replaceState') || l.includes('pushState')));
    expect(writes.length).toBe(0);
  });

  it('the collision law holds: loyalty keeps ?page=, the roster speaks ?po-page=', () => {
    expect(loyalty.includes('parseInitialPage(window.location.search, 1)')).toBe(true);
    expect(loyalty.includes("'po-page'")).toBe(false);
    expect(tab.includes("'po-page'")).toBe(true);
  });
});

describe('the face wears the amber — the past-the-end card', () => {
  const tab = readFileSync('src/app/(shell)/tabs/purchase-orders-tab.tsx', 'utf8');

  it('the face is a card now (attention, not error)', () => {
    expect(tab.includes('data-testid="po-past-end-card"')).toBe(true);
    expect(tab.includes('border-amber-200 bg-amber-50/70')).toBe(true);
    expect(tab.includes('dark:border-amber-900/50 dark:bg-amber-950/30')).toBe(true);
  });

  it('the card carries the icon, the honest line, the WHY, and the way back', () => {
    expect(tab.includes('<History className="mx-auto h-6 w-6 text-amber-500" aria-hidden="true" />')).toBe(true);
    expect(tab.includes('data-testid="po-past-end"')).toBe(true);
    expect(tab.includes('is past the end of this ledger')).toBe(true);
    expect(tab.includes('data-testid="po-past-end-hint"')).toBe(true);
    expect(tab.includes('rows were deleted or the ledger shrank since it was made')).toBe(true);
    expect(tab.includes('data-testid="po-back-to-one"')).toBe(true);
    expect(tab.includes('onClick={() => setPage(1)}')).toBe(true);
  });

  it('the way-back button wears the amber too (one wardrobe, one voice)', () => {
    expect(tab.includes('border-amber-300 text-amber-800 hover:bg-amber-100')).toBe(true);
  });

  it('the testids kept their names — the voice changed clothes, not identity', () => {
    // the v2.323 pins still stand byte-for-byte
    expect(tab.includes('data-testid="po-past-end"')).toBe(true);
    expect(tab.includes('data-testid="po-back-to-one"')).toBe(true);
  });
});

describe('the census wears the pill — and the v2.323 pin still holds', () => {
  const tab = readFileSync('src/app/(shell)/tabs/purchase-orders-tab.tsx', 'utf8');

  it('both census slots ride the pill wardrobe', () => {
    expect(tab.includes('rounded-full bg-muted/60 px-2.5 py-1 text-xs text-muted-foreground tabular-nums" data-testid="po-census-empty"')).toBe(true);
    expect(tab.includes('rounded-full bg-muted/60 px-2.5 py-1 text-xs text-muted-foreground tabular-nums" data-testid="po-census"')).toBe(true);
  });

  it('the pager status is a pill with tabular digits (the v2.323 tail intact)', () => {
    expect(tab.includes('rounded-md bg-muted py-0.5 font-medium text-sm px-2 tabular-nums"')).toBe(true);
  });

  it('the v2.323 desk-voice pin still holds byte-for-byte (class order kept it)', () => {
    expect(tab.includes('text-xs text-muted-foreground tabular-nums" data-testid="po-census-empty"')).toBe(true);
    expect(tab.includes('text-sm px-2 tabular-nums"')).toBe(true);
  });

  it('the truth-conditional is untouched (the pills dressed the arms, not the law)', () => {
    expect(tab.includes('page > pagination.totalPages')).toBe(true);
    expect(tab.includes('No rows on this page — the ledger ends at')).toBe(true);
    expect(tab.includes('Math.min(page * limit, pagination.total)')).toBe(true);
  });
});

describe('the house law — two desks, two words, one shape law', () => {
  const tab = readFileSync('src/app/(shell)/tabs/purchase-orders-tab.tsx', 'utf8');
  const loyalty = readFileSync('src/app/(shell)/tabs/loyalty-tab.tsx', 'utf8');

  it('loyalty: THE CENSUS NEVER LIES still stands; the roster: both laws stand', () => {
    expect(loyalty.includes('THE CENSUS NEVER LIES')).toBe(true);
    expect(tab.includes('THE CENSUS NEVER LIES')).toBe(true);
    expect(tab.includes("THE ROSTER'S OWN WORD")).toBe(true);
  });
});
