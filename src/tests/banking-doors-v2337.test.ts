// ─────────────────────────────────────────────────────────────────────────────
// The banking doors speak their body's shape (v2.337.0)
// ─────────────────────────────────────────────────────────────────────────────
//
// v2.335.0 walked the WIDER door class one family at a time (the financial
// family first). v2.336.0 was the second pass (the catalog family).
// v2.337.0 is the THIRD pass: the BANKING family —
//
//   • the three banking doors (accounts, reconciliations, transactions)
//     stop reading their bodies as the door's default `any` and speak the
//     body's OWN shape — every field the handler consumes, `unknown` only
//     where the route itself coerces (openingBalance/statementBalance/
//     bookBalance via parseFloat(String()));
//   • transactions' `amount` speaks `number | string` because the ledger's
//     own toDec guard owns the widening (Numeric = number | string |
//     Decimal | null | undefined);
//   • the stkpush door borrows the local StkPushBody interface its handler
//     already declared (the redeem precedent) — the loose re-cast is gone;
//   • Daraja's queue-timeout webhook (not a door at all — it always answers
//     success) reads its contract-less body as the `unknown` it is;
//   • and the banking desk's reconciliation cards grow THE RECON METER —
//     the statement-vs-book gap as a slim agreement bar (the styling face).
//
// RUNTIME BEHAVIOR of the tightened doors is byte-identical — types only
// (the scoped tsc round-trip proved 36=36, ZERO new, ZERO gone).
// ─────────────────────────────────────────────────────────────────────────────

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';

const read = (p: string) => readFileSync(p, 'utf8');

const BANKING_DOORS = [
  'src/app/api/banking/accounts/route.ts',
  'src/app/api/banking/reconciliations/route.ts',
  'src/app/api/banking/transactions/route.ts',
  'src/app/api/payments/mpesa/stkpush/route.ts',
  'src/app/api/payments/mpesa/b2c/queue-timeout/route.ts',
];

describe('THE BANKING DOORS SPEAK THEIR BODY SHAPE (v2.337.0 census)', () => {
  it('not one banking door reads a loose Record generic any more', () => {
    const loose = BANKING_DOORS.filter((f) =>
      read(f).includes('as Record<string, unknown>')
    );
    expect(loose).toEqual([]);
  });

  it('not one banking door reads the door default any more (no bare readJsonBody(request))', () => {
    const bare = BANKING_DOORS.filter((f) => /readJsonBody\(request\)/.test(read(f)));
    expect(bare).toEqual([]);
  });

  it('not one banking door re-casts the body back to a named interface any more', () => {
    const recast = BANKING_DOORS.filter((f) => /door\.body as [A-Z]/.test(read(f)));
    expect(recast).toEqual([]);
  });

  it('every banking door and webhook carries the round marker', () => {
    for (const f of BANKING_DOORS) {
      expect(read(f).includes('v2.337.0'), f).toBe(true);
    }
  });

  it('the accounts door speaks the bank account\u2019s own wire shape', () => {
    const src = read('src/app/api/banking/accounts/route.ts');
    expect(src.includes("const door = await readJsonBody<{")).toBe(true);
    expect(src.includes('    storeId?: string;')).toBe(true);
    expect(src.includes('    bankName?: string;')).toBe(true);
    expect(src.includes('    accountName?: string;')).toBe(true);
    expect(src.includes('    accountNumber?: string;')).toBe(true);
    expect(src.includes('    branch?: string;')).toBe(true);
    expect(src.includes('    swiftCode?: string;')).toBe(true);
    expect(src.includes('    currency?: string;')).toBe(true);
    expect(src.includes('    accountType?: string;')).toBe(true);
  });

  it('the accounts door keeps openingBalance unknown where the route itself coerces', () => {
    const src = read('src/app/api/banking/accounts/route.ts');
    expect(src.includes('    openingBalance?: unknown;')).toBe(true);
    expect(src.includes('parseFloat(String(balance))')).toBe(true);
  });

  it('the reconciliations door speaks the reconciliation\u2019s own wire shape', () => {
    const src = read('src/app/api/banking/reconciliations/route.ts');
    expect(src.includes('    bankAccountId?: string;')).toBe(true);
    expect(src.includes('    statementDate?: string;')).toBe(true);
    expect(src.includes('    notes?: string;')).toBe(true);
    expect(src.includes('    createdBy?: string;')).toBe(true);
  });

  it('the reconciliations door keeps both balances unknown where the route coerces them', () => {
    const src = read('src/app/api/banking/reconciliations/route.ts');
    expect(src.includes('    statementBalance?: unknown;')).toBe(true);
    expect(src.includes('    bookBalance?: unknown;')).toBe(true);
    expect(src.includes('parseFloat(String(statementBalance)) - parseFloat(String(bookBalance))')).toBe(true);
  });

  it('the transactions door speaks the ledger row\u2019s own wire shape', () => {
    const src = read('src/app/api/banking/transactions/route.ts');
    expect(src.includes('    bankAccountId?: string;')).toBe(true);
    expect(src.includes('    transactionType?: string;')).toBe(true);
    expect(src.includes('    reference?: string;')).toBe(true);
    expect(src.includes('    description?: string;')).toBe(true);
    expect(src.includes('    transactionDate?: string;')).toBe(true);
  });

  it('transactions\u2019 amount speaks number | string because the ledger\u2019s own toDec guard owns the widening', () => {
    const src = read('src/app/api/banking/transactions/route.ts');
    expect(src.includes('    amount?: number | string;')).toBe(true);
    // the route's own story, spoken at the door
    expect(src.includes("the ledger's own toDec")).toBe(true);
  });

  it('the stkpush door borrows the handler\u2019s own StkPushBody interface (the redeem precedent)', () => {
    const src = read('src/app/api/payments/mpesa/stkpush/route.ts');
    expect(src.includes('readJsonBody<StkPushBody>(request)')).toBe(true);
    // the interface still lives above the handler, owned by the push itself
    expect(src.includes('interface StkPushBody {')).toBe(true);
    expect(src.indexOf('interface StkPushBody {')).toBeLessThan(src.indexOf('readJsonBody<StkPushBody>'));
  });

  it('the stkpush door\u2019s loose re-cast is gone (and no comment carries its bytes)', () => {
    const src = read('src/app/api/payments/mpesa/stkpush/route.ts');
    expect(/door\.body as [A-Z]/.test(src)).toBe(false);
    expect(src.includes('const body = door.body;')).toBe(true);
  });
});

describe('THE WEBHOOK READS THE UNKNOWN (queue-timeout, v2.337.0)', () => {
  it('Daraja\u2019s timeout webhook reads its contract-less body as the unknown it is', () => {
    const src = read('src/app/api/payments/mpesa/b2c/queue-timeout/route.ts');
    expect(src.includes('const body: unknown = await request.json().catch(() => ({}));')).toBe(true);
    // no shape claimed, none enforced — and the door home is NOT imported
    // (this webhook was never a body door; it always answers success)
    expect(src.includes("from '@/lib/request-body'")).toBe(false);
  });

  it('the webhook still always answers success — a timeout is NOT a failure', () => {
    const src = read('src/app/api/payments/mpesa/b2c/queue-timeout/route.ts');
    expect(src.includes("Response.json({ success: true })")).toBe(true);
    expect(src.includes('transaction left for reconciliation.')).toBe(true);
  });

  it('the logged body is still truncated for observability', () => {
    const src = read('src/app/api/payments/mpesa/b2c/queue-timeout/route.ts');
    expect(src.includes('JSON.stringify(body).slice(0, 500)')).toBe(true);
  });
});

describe('THE UNTOUCHED HONEST PAIR (mpesa callback + b2c result)', () => {
  it('the callback door still borrows its own MpesaCallbackBody interface', () => {
    const src = read('src/app/api/payments/mpesa/callback/route.ts');
    expect(src.includes('readJsonBody<MpesaCallbackBody>(request)')).toBe(true);
    expect(src.includes('interface MpesaCallbackBody {')).toBe(true);
  });

  it('the b2c result webhook still wears the disbursement service\u2019s own payload type', () => {
    const src = read('src/app/api/payments/mpesa/b2c/result/route.ts');
    expect(src.includes("type B2CResultPayload } from '@/lib/hr/payroll/disbursement-service'")).toBe(true);
    expect(src.includes('as B2CResultPayload | null;')).toBe(true);
  });
});

describe('THE CROSS-LEDGER VOICES (v2.337.0)', () => {
  it('the v2.326 census still counts the banking trio and stkpush among the door files', () => {
    const ledger = read('src/tests/body-door-class-v2326.test.ts');
    for (const f of [
      'src/app/api/banking/accounts/route.ts',
      'src/app/api/banking/reconciliations/route.ts',
      'src/app/api/banking/transactions/route.ts',
      'src/app/api/payments/mpesa/stkpush/route.ts',
    ]) {
      expect(ledger.includes(`'${f}',`), f).toBe(true);
    }
  });

  it('the tightened doors still pass the v2.326 per-file assertions\u2019 raw material', () => {
    for (const f of [
      'src/app/api/banking/accounts/route.ts',
      'src/app/api/banking/reconciliations/route.ts',
      'src/app/api/banking/transactions/route.ts',
      'src/app/api/payments/mpesa/stkpush/route.ts',
    ]) {
      const src = read(f);
      expect(src.includes("from '@/lib/request-body'"), f).toBe(true);
      expect(src.includes('readJsonBody'), f).toBe(true);
      expect(src.includes('bodyDoorRejected'), f).toBe(true);
      expect(src.includes('THE BODY DOOR: an unreadable body is a client mistake (v2.326.0)'), f).toBe(true);
    }
  });

  it('the swallow census byte still stands in queue-timeout (both sides)', () => {
    expect(read('src/app/api/payments/mpesa/b2c/queue-timeout/route.ts').includes('request.json().catch')).toBe(true);
    expect(read('src/tests/swallow-census-v2327.test.ts').includes("honest('src/app/api/payments/mpesa/b2c/queue-timeout/route.ts').includes('request.json().catch')")).toBe(true);
  });

  it('the law doc carries the banking-family note', () => {
    const home = read('src/lib/request-body.ts');
    expect(home.includes("v2.337.0 — THE BANKING FAMILY, the wider class's third pass")).toBe(true);
    expect(home.includes("the wider class's third pass")).toBe(true);
  });
});

describe('THE WAKING FIX (v2.337.0 — the desk now speaks its store)', () => {
  const desk = read('src/app/(shell)/tabs/banking-tab.tsx');

  it('the transactions query no longer asks the ledger for nothing (storeId rides the call)', () => {
    expect(desk.includes('queryFn: () => bankingApi.transactions.list({ storeId: storeId ?? undefined, limit: 100 })')).toBe(true);
    expect(desk.includes('THE WAKING FIX:')).toBe(true);
  });

  it('the reconciliations query no longer asks for nothing either (the second room)', () => {
    expect(desk.includes('queryFn: () => bankingApi.reconciliations.list({ storeId: storeId ?? undefined, limit: 100 })')).toBe(true);
    expect(desk.includes('THE WAKING FIX (same lie, second room):')).toBe(true);
  });

  it('both GET handlers still own the guard that made the silence a 400', () => {
    for (const f of ['src/app/api/banking/reconciliations/route.ts', 'src/app/api/banking/transactions/route.ts']) {
      expect(read(f).includes("error: 'bankAccountId or storeId is required.'"), f).toBe(true);
    }
  });
});

describe('THE RECON METER (the banking desk\u2019s styling face, v2.337.0)', () => {
  const desk = read('src/app/(shell)/tabs/banking-tab.tsx');

  it('every reconciliation card carries the meter', () => {
    expect(desk.includes('data-testid="recon-diff-meter"')).toBe(true);
  });

  it('the meter speaks progressbar semantics with real aria values', () => {
    expect(desk.includes('role="progressbar"')).toBe(true);
    expect(desk.includes('aria-label="Reconciliation agreement"')).toBe(true);
    expect(desk.includes('aria-valuemin={0}')).toBe(true);
    expect(desk.includes('aria-valuemax={100}')).toBe(true);
    expect(desk.includes('aria-valuenow={Math.round(agreementPct)}')).toBe(true);
  });

  it('the meter\u2019s math is honest — divergence against the larger balance, agreement its complement', () => {
    expect(desk.includes('const denom = Math.max(Math.abs(recon.statementBalance), Math.abs(recon.bookBalance));')).toBe(true);
    expect(desk.includes('const pctOfLarger = denom > 0 ? Math.min(100, (Math.abs(diff) / denom) * 100) : 0;')).toBe(true);
    expect(desk.includes('const agreementPct = 100 - pctOfLarger;')).toBe(true);
    expect(desk.includes('style={{ width: `${agreementPct}%` }}')).toBe(true);
  });

  it('the meter\u2019s title speaks the exact gap', () => {
    expect(desk.includes('title={`Reconciliation gap: ${isZeroDiff ? \'none — the sheet is balanced\'')).toBe(true);
  });

  it('the meter wears both voices and survives dark mode', () => {
    expect(desk.includes('bg-emerald-600 dark:bg-emerald-500')).toBe(true);
    expect(desk.includes('bg-red-600 dark:bg-red-500')).toBe(true);
    expect(desk.includes('text-emerald-700 dark:text-emerald-400')).toBe(true);
    expect(desk.includes('text-red-600 dark:text-red-400')).toBe(true);
  });

  it('the meter\u2019s percentage voice is tabular and spoken beside the bar', () => {
    expect(desk.includes('text-[10px] tabular-nums')).toBe(true);
    expect(desk.includes('{agreementPct.toFixed(1)}% in step')).toBe(true);
  });
});
