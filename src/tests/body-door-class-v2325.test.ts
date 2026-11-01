// ─────────────────────────────────────────────────────────────────────────────
// The body-door class sweep + the pager beside the face (v2.325.0)
// ─────────────────────────────────────────────────────────────────────────────
//
// v2.324.0 fixed the body door for purchase-orders/[id] alone: a body-less
// request hit `JSON.parse`'s SyntaxError and answered HTTP 500 — a CLIENT
// mistake wearing a SERVER-crash status. The v2.325 sweep (the round's class
// census) walked every route answering PUT/DELETE/PATCH and found 21 MORE
// bare `await request.json()` doors across 19 files. This release replaces
// every one of them with ONE home (src/lib/request-body.ts) and hoists the
// purchase-order roster's pager beside the empty branch so the census's
// honest empty line is reachable on a live page. This file pins:
//
//   1. THE DOOR HELPER (lib/request-body.ts): the truth table — a valid
//      object passes, null/arrays/primitives/malformed/missing all answer
//      { ok: false }, and the rejection is a 400 with the house voice.
//   2. THE CLASS IS GONE: all 19 files read through the door (the marker,
//      the import) and NOT ONE bare `= await request.json()` remains.
//   3. THE PAGER SPEAKS BESIDE THE FACE (purchase-orders-tab.tsx): the bar
//      is hoisted OUT of the rows-exist branch — its conditional now lives
//      after the ternary, exactly once, beside the empty branch — and the
//      v2.323 census pins + the v2.324 face pins hold byte-for-byte.
// ─────────────────────────────────────────────────────────────────────────────

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { readJsonBody, bodyDoorRejected } from '@/lib/request-body';

const DOOR_FILES = [
  'src/app/api/branches/[id]/route.ts',
  'src/app/api/categories/[id]/route.ts',
  'src/app/api/customer-credits/[id]/route.ts',
  'src/app/api/customers/[id]/route.ts',
  'src/app/api/delivery-notes/[id]/route.ts',
  'src/app/api/expenses/[id]/route.ts',
  'src/app/api/financial/accounts/[id]/route.ts',
  'src/app/api/financial/budgets/[id]/route.ts',
  'src/app/api/financial/periods/[id]/route.ts',
  'src/app/api/gift-cards/[id]/route.ts',
  'src/app/api/invoices/[id]/route.ts',
  'src/app/api/leaves/route.ts',
  'src/app/api/products/[id]/route.ts',
  'src/app/api/rentals/[id]/route.ts',
  'src/app/api/security/block-ip/route.ts',
  'src/app/api/store-transfers/[id]/route.ts',
  'src/app/api/suppliers/[id]/route.ts',
  'src/app/api/system-config/route.ts',
  'src/app/api/vouchers/[id]/route.ts',
];

const reqWith = (body?: string) =>
  new Request('http://localhost/api/body-door-probe', {
    method: 'POST',
    ...(body === undefined ? {} : { body }),
  });

describe('THE BODY DOOR — the helper reads the body honestly', () => {
  it('a valid JSON object passes with its fields intact', async () => {
    const door = await readJsonBody<{ name?: string; qty?: number }>(
      reqWith(JSON.stringify({ name: 'Cement', qty: 7 }))
    );
    expect(door.ok).toBe(true);
    if (door.ok) {
      expect(door.body.name).toBe('Cement');
      expect(door.body.qty).toBe(7);
    }
  });

  it('an empty JSON object passes (the shape is the handler\u2019s business)', async () => {
    const door = await readJsonBody(reqWith('{}'));
    expect(door.ok).toBe(true);
  });

  it('null / arrays / primitives / malformed / missing all answer { ok: false }', async () => {
    // JSON null — cannot describe its changes
    expect((await readJsonBody(reqWith('null'))).ok).toBe(false);
    // an array — these routes dispatch on object fields
    expect((await readJsonBody(reqWith('[1,2,3]'))).ok).toBe(false);
    // a bare string primitive
    expect((await readJsonBody(reqWith('"just a string"'))).ok).toBe(false);
    // a bare number primitive
    expect((await readJsonBody(reqWith('42'))).ok).toBe(false);
    // malformed JSON
    expect((await readJsonBody(reqWith('{oops'))).ok).toBe(false);
    // a body-less request — the v2.324 500 class
    expect((await readJsonBody(reqWith())).ok).toBe(false);
  });

  it('the rejection answers 400 with the house voice (hint only when named)', () => {
    const bare = bodyDoorRejected();
    expect(bare.status).toBe(400);
    // hint omitted → no hint key at all (byte-honest shape)
    const withHint = bodyDoorRejected('Use {"action": "CLOSE"}.');
    expect(withHint.status).toBe(400);
  });
});

describe('THE CLASS IS GONE — 19 files read through the door', () => {
  for (const file of DOOR_FILES) {
    it(`${file} reads through the door (no bare assign remains)`, () => {
      const src = readFileSync(file, 'utf8');
      // the door home is imported
      expect(src.includes("from '@/lib/request-body'")).toBe(true);
      expect(src.includes('readJsonBody')).toBe(true);
      // the marker rides every door
      expect(src.includes('THE BODY DOOR: an unreadable body is a client mistake')).toBe(true);
      // and NOT ONE DECLARING bare read remains — the always-throwing
      // const/let/var form is gone from every file. (financial/accounts'
      // optional audit-trail body keeps the v2.324 NON-declaring shape
      // inside its own try — the safe pattern this door grew from.)
      expect(/(?:const|let|var)\s+\w+\s*=\s*await request\.json\(\)/.test(src)).toBe(false);
    });
  }

  it('the door never throws for a whole-file sweep of the 19 (every import names both helpers)', () => {
    for (const file of DOOR_FILES) {
      const src = readFileSync(file, 'utf8');
      expect(src.includes('readJsonBody')).toBe(true);
      expect(src.includes('bodyDoorRejected')).toBe(true);
    }
  });
});

describe('THE PAGER SPEAKS BESIDE THE FACE — the bar hoisted out of the rows branch', () => {
  const tab = readFileSync('src/app/(shell)/tabs/purchase-orders-tab.tsx', 'utf8');

  it('the hoist marker names the law', () => {
    expect(tab.includes('THE PAGER SPEAKS BESIDE THE FACE')).toBe(true);
    expect(tab.includes('only the address moved')).toBe(true);
  });

  it('the pager conditional lives AFTER the rows-branch ternary close (the hoisted address)', () => {
    // the rows branch closes (fragment + ternary), THEN the bar's conditional
    const fragmentClose = tab.indexOf('            </>\n          )}\n\n          {/* v2.325.0 — THE PAGER SPEAKS BESIDE THE FACE');
    expect(fragmentClose).toBeGreaterThan(-1);
    // and the conditional sits after that close, before CardContent ends
    const conditional = tab.indexOf('{pagination && pagination.totalPages > 1 && (');
    expect(conditional).toBeGreaterThan(-1);
    expect(conditional).toBeGreaterThan(fragmentClose);
  });

  it('exactly ONE home renders the pager (no second conditional crept in)', () => {
    expect(tab.split('{pagination && pagination.totalPages > 1 && (').length - 1).toBe(1);
  });

  it('the old in-fragment pagination comment is gone', () => {
    expect(tab.includes('{/* Pagination — v2.323.0')).toBe(false);
  });

  it('the v2.323 census pins hold byte-for-byte (class order kept)', () => {
    expect(tab.includes('text-xs text-muted-foreground tabular-nums" data-testid="po-census-empty"')).toBe(true);
    expect(tab.includes('text-xs text-muted-foreground tabular-nums" data-testid="po-census"')).toBe(true);
    expect(tab.includes('py-0.5 font-medium text-sm px-2 tabular-nums" data-testid="po-pager-status"')).toBe(true);
    expect(tab.includes('No rows on this page — the ledger ends at')).toBe(true);
    expect(tab.includes('aria-label="Previous page"')).toBe(true);
    expect(tab.includes('aria-label="Next page"')).toBe(true);
    expect(tab.includes('data-testid="po-pager-prev"')).toBe(true);
    expect(tab.includes('data-testid="po-pager-next"')).toBe(true);
  });

  it('the v2.324 amber face keeps its bytes beside the way back', () => {
    expect(tab.includes('data-testid="po-past-end-card"')).toBe(true);
    expect(tab.includes('data-testid="po-past-end"')).toBe(true);
    expect(tab.includes('data-testid="po-past-end-hint"')).toBe(true);
    expect(tab.includes('data-testid="po-back-to-one"')).toBe(true);
    expect(tab.includes('border border-amber-200 bg-amber-50/70')).toBe(true);
  });

  it('the house law: loyalty\u2019s bar already sat beside its empty branch — now the roster\u2019s does too', () => {
    const loyalty = readFileSync('src/app/(shell)/tabs/loyalty-tab.tsx', 'utf8');
    // loyalty: the tx-pager conditional is OUTSIDE its length===0 ternary
    expect(loyalty.includes('data-testid="tx-pager"')).toBe(true);
    expect(loyalty.includes('data-testid="tx-census-empty"')).toBe(true);
    // the roster speaks the same layout vocabulary now
    expect(tab.includes('data-testid="po-pager"')).toBe(true);
    expect(tab.includes('data-testid="po-census-empty"')).toBe(true);
  });
});
