// THE POST-WIDE DOOR (v2.326.0): the class is gone from every room.
//
// v2.324.0 fixed purchase-orders/[id] alone; v2.325.0 swept 19 more
// PUT/DELETE/PATCH files; THIS release sweeps the POST routes — the
// census (`scripts/census-post-door-v2326.py`) found 67 bare declaring
// `await request.json()` reads across 67 route files (plus 41 chained
// .catch swallows and 54 try-wrapped safe reads, both deliberately
// OUT of scope: they never 500). Every one of the 67 now reads through
// THE BODY DOOR (`src/lib/request-body.ts`): an unreadable body is a
// client mistake, and a client mistake answers 400 — never a
// JSON.parse SyntaxError wearing a 500.
//
// THE DEFAULT GENERIC LAW: bare `request.json()` inferred `any`, so
// `readJsonBody`'s default generic IS `any` (documented + eslint-
// disabled in the one home) — a caller omitting the generic keeps the
// exact typing its handler was written against. The scoped tsc
// round-trip (same 75-file include set): 71=71 raw, 52=52 normalized,
// ZERO real new errors — one pre-existing TS2551 line-shifted.

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { readJsonBody, bodyDoorRejected } from '@/lib/request-body';

const DOOR_FILES: string[] = [
  'src/app/api/attendance/route.ts',
  'src/app/api/auth/login/route.ts',
  'src/app/api/banking/accounts/route.ts',
  'src/app/api/banking/reconciliations/route.ts',
  'src/app/api/banking/transactions/route.ts',
  'src/app/api/branches/route.ts',
  'src/app/api/cash-drawer/route.ts',
  'src/app/api/categories/route.ts',
  'src/app/api/customer-credits/route.ts',
  'src/app/api/customer-interactions/route.ts',
  'src/app/api/customers/route.ts',
  'src/app/api/debt-payment-plans/[id]/installments/[installmentId]/pay/route.ts',
  'src/app/api/debt-payment-plans/[id]/installments/[installmentId]/waive/route.ts',
  'src/app/api/debt/route.ts',
  'src/app/api/delivery-notes/route.ts',
  'src/app/api/employees/route.ts',
  'src/app/api/etims/issue-invoice/route.ts',
  'src/app/api/etims/register-product/route.ts',
  'src/app/api/etims/settings/route.ts',
  'src/app/api/expenses/route.ts',
  'src/app/api/financial/accounts/route.ts',
  'src/app/api/financial/budgets/recalculate/route.ts',
  'src/app/api/financial/budgets/route.ts',
  'src/app/api/financial/journal/route.ts',
  'src/app/api/financial/periods/route.ts',
  'src/app/api/financial/trial-balance/snapshot/route.ts',
  'src/app/api/gift-cards/[id]/adjust/route.ts',
  'src/app/api/gift-cards/[id]/redeem/route.ts',
  'src/app/api/gift-cards/redeem/route.ts',
  'src/app/api/gift-cards/route.ts',
  'src/app/api/health/circuit-breaker/route.ts',
  'src/app/api/health/dlq/route.ts',
  'src/app/api/invoices/route.ts',
  'src/app/api/leave-types/route.ts',
  'src/app/api/loyalty/campaigns/route.ts',
  'src/app/api/loyalty/tiers/route.ts',
  'src/app/api/loyalty/transactions/route.ts',
  'src/app/api/messages/route.ts',
  'src/app/api/messaging/bulk/route.ts',
  'src/app/api/payments/mpesa/callback/route.ts',
  'src/app/api/payments/mpesa/stkpush/route.ts',
  'src/app/api/products/bundles/route.ts',
  'src/app/api/products/route.ts',
  'src/app/api/profile/password/route.ts',
  'src/app/api/purchase-orders/route.ts',
  'src/app/api/rentals/[id]/return/route.ts',
  'src/app/api/rentals/route.ts',
  'src/app/api/reports/export/route.ts',
  'src/app/api/shift-schedules/[id]/route.ts',
  'src/app/api/shift-schedules/[id]/status/route.ts',
  'src/app/api/shift-schedules/route.ts',
  'src/app/api/shifts/[id]/end/route.ts',
  'src/app/api/shifts/route.ts',
  'src/app/api/stock-movements/route.ts',
  'src/app/api/store-transfers/route.ts',
  'src/app/api/subcategories/route.ts',
  'src/app/api/suppliers/[id]/send-order/route.ts',
  'src/app/api/suppliers/route.ts',
  'src/app/api/tax/categories/route.ts',
  'src/app/api/tax/filings/route.ts',
  'src/app/api/transactions/[id]/distribute-receipt/route.ts',
  'src/app/api/users/route.ts',
  'src/app/api/voucher-campaigns/route.ts',
  'src/app/api/vouchers/redeem/route.ts',
  'src/app/api/vouchers/route.ts',
  'src/app/api/whatsapp/send-document/route.ts',
  'src/app/api/whatsapp/send/route.ts',
];

// ---------------------------------------------------------------------------
// THE TRUTH TABLE — the door never throws
// ---------------------------------------------------------------------------

const reqWith = (raw: string | undefined, ct = 'application/json') =>
  new Request('http://localhost/api/body-door-probe', {
    method: 'POST',
    ...(raw === undefined ? {} : { body: raw }),
    headers: ct ? { 'Content-Type': ct } : {},
  });

describe('THE BODY DOOR never throws (v2.326 regression table)', () => {
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

  it('null, arrays, primitives, malformed JSON and missing bodies all answer { ok: false }', async () => {
    for (const raw of ['null', '[1,2,3]', '"a string"', '42', 'true', '{malformed', undefined]) {
      const door = await readJsonBody(reqWith(raw));
      expect(door.ok).toBe(false);
    }
  });

  it('the rejection answers 400 with the house voice', () => {
    const res = bodyDoorRejected();
    expect(res.status).toBe(400);
    expect(res.headers.get('content-type')).toContain('application/json');
  });
});

// ---------------------------------------------------------------------------
// THE CLASS IS GONE — 67 files read through the door
// ---------------------------------------------------------------------------


// v2.335.0 — THE FINANCIAL TRIO GRADUATED: accounts/[id], budgets/[id] and
// periods/[id] now speak HONEST LITERALS (their own body shapes) instead of
// the loose `<Record<string, unknown>>` widening — see
// src/tests/financial-doors-v2335.test.ts. The remaining five exemplars
// still wear the v2.325 generic and are pinned below unchanged.
const EXEMPLARS: string[] = [
  'src/app/api/categories/[id]/route.ts',
  'src/app/api/customer-credits/[id]/route.ts',
  'src/app/api/expenses/[id]/route.ts',
  'src/app/api/gift-cards/[id]/route.ts',
  'src/app/api/suppliers/[id]/route.ts',
];

describe('THE CLASS IS GONE — 67 files read through the door', () => {
  for (const file of DOOR_FILES) {
    it(`${file} reads through the door (no bare declaring read remains)`, () => {
      const src = readFileSync(file, 'utf8');
      // the door home is imported, both helpers named
      expect(src.includes("from '@/lib/request-body'")).toBe(true);
      expect(src.includes('readJsonBody')).toBe(true);
      expect(src.includes('bodyDoorRejected')).toBe(true);
      // the marker rides every door
      expect(src.includes('THE BODY DOOR: an unreadable body is a client mistake (v2.326.0)')).toBe(true);
      // and NOT ONE declaring bare read remains anywhere in the file
      expect(/(?:const|let|var)\s+\w+\s*=\s*await request\.json\(\)/.test(src)).toBe(false);
    });
  }

  it('the widening never touched the remaining v2.325 exemplars (their tightened generics stand; the financial trio graduated in v2.335.0)', () => {
    for (const exemplar of EXEMPLARS) {
      const src = readFileSync(exemplar, 'utf8');
      expect(src.includes('readJsonBody<Record<string, unknown>>(request)')).toBe(true);
    }
  });

  it('the named catch-swallow outlier now reads through the door too (financial/journal/[id])', () => {
    const src = readFileSync('src/app/api/financial/journal/[id]/route.ts', 'utf8');
    // the old swallow made a malformed body look like "no reason given"
    // (scoped to the CODE pattern — the marker comment may tell the story)
    expect(/await\s+request\.json\(\)\s*\.catch/.test(src)).toBe(false);
    expect(src.includes("from '@/lib/request-body'")).toBe(true);
    expect(src.includes('readJsonBody<{ reason?: unknown }>(request)')).toBe(true);
  });

  it('the one home carries the default-generic law (any default, documented, lint-clean)', () => {
    const home = readFileSync('src/lib/request-body.ts', 'utf8');
    expect(home.includes('export async function readJsonBody<T = any>(')).toBe(true);
    expect(home.includes('eslint-disable-next-line @typescript-eslint/no-explicit-any')).toBe(true);
    expect(home.includes('THE POST-WIDE DOOR')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// THE HONEST ERROR FACE — the login dialog wears the LoginScreen's law
// ---------------------------------------------------------------------------

describe('THE HONEST ERROR FACE — the login dialog wears the LoginScreen law', () => {
  const chrome = readFileSync('src/components/org/chrome.tsx', 'utf8');

  it('the mistake is announced (role=alert + aria-live), carries an icon, survives dark mode', () => {
    expect(chrome.includes('THE HONEST ERROR FACE (v2.326.0)')).toBe(true);
    expect(chrome.includes('role="alert"')).toBe(true);
    expect(chrome.includes('aria-live="assertive"')).toBe(true);
    expect(chrome.includes('data-testid="login-dialog-error"')).toBe(true);
    expect(chrome.includes('<AlertCircle')).toBe(true);
    // dark-mode variants ride the same face
    expect(chrome.includes('dark:border-red-900 dark:bg-red-950/40 dark:text-red-300')).toBe(true);
  });

  it('a stale error cannot outlive its cause (editing either field clears it)', () => {
    // both inputs clear the error on change
    const clears = chrome.match(/if \(err\) setErr\(null\);/g) ?? [];
    expect(clears.length).toBeGreaterThanOrEqual(2);
  });

  it('the honest gate answers an empty submission before the network round-trip', () => {
    expect(chrome.includes('THE HONEST GATE (v2.326.0)')).toBe(true);
    expect(chrome.includes("if (!email.trim() || !password) {")).toBe(true);
    expect(chrome.includes("'Enter both your email and your password to sign in.'")).toBe(true);
  });

  it('the busy face spins (the Loader2 spinner, not a bare label swap)', () => {
    expect(chrome.includes('<Loader2')).toBe(true);
    expect(chrome.includes('animate-spin')).toBe(true);
  });
});
