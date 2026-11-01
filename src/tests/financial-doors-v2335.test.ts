// ─────────────────────────────────────────────────────────────────────────────
// The financial doors speak their body's shape (v2.335.0)
// ─────────────────────────────────────────────────────────────────────────────
//
// v2.334.0 tightened the 20-door hr/self-service census. v2.335.0 walks the
// WIDER class one family at a time, and the FINANCIAL family goes first:
// nine doors across ten files stop reading their bodies as the door's loose
// default and speak the body's OWN shape —
//
//   • the CREATE door that feeds its service 1:1 borrows the SERVICE's own
//     signature (accounts → Parameters<typeof createAccount>[0]), so the
//     door cannot drift from the helper it feeds;
//   • every other door speaks an HONEST LITERAL — exactly the fields the
//     route destructures, no looser (budgets ×2, recalculate, trial-balance
//     snapshot, periods ×2, journal — lines array included);
//   • journal/[id] keeps its `{ reason?: unknown }` — the String()-coerce
//     door is already honest (unknown is what JSON can carry there);
//   • and the recalculate door FINALLY performs the period↔store cross-check
//     its comment always promised (the mismatch answers 404 before the
//     helper runs).
//
// This file pins the census, the per-file honest bytes, the cross-check,
// the ledger growth in body-door-class-v2326, and the styling face (the
// budgets consumption meter). RUNTIME BEHAVIOR of the tightened doors is
// byte-identical — types only (the scoped tsc round-trip proved 35=35).
// ─────────────────────────────────────────────────────────────────────────────

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';

const read = (p: string) => readFileSync(p, 'utf8');

const FINANCIAL_DOORS = [
  'src/app/api/financial/accounts/route.ts',
  'src/app/api/financial/accounts/[id]/route.ts',
  'src/app/api/financial/budgets/route.ts',
  'src/app/api/financial/budgets/[id]/route.ts',
  'src/app/api/financial/budgets/recalculate/route.ts',
  'src/app/api/financial/journal/route.ts',
  'src/app/api/financial/periods/route.ts',
  'src/app/api/financial/periods/[id]/route.ts',
  'src/app/api/financial/trial-balance/snapshot/route.ts',
  'src/app/api/financial/journal/[id]/route.ts',
];

describe('THE FINANCIAL DOORS SPEAK THEIR BODY SHAPE (v2.335.0 census)', () => {
  it('not one financial door reads a loose generic any more', () => {
    for (const file of FINANCIAL_DOORS) {
      const src = read(file);
      expect(src.includes('readJsonBody<Record<string, unknown>>(request)')).toBe(false);
    }
  });

  it('not one financial door reads the door default any more (no bare readJsonBody(request))', () => {
    for (const file of FINANCIAL_DOORS) {
      const src = read(file);
      expect(/readJsonBody\(request\)/.test(src)).toBe(false);
    }
  });

  it('every financial door marker survives the tightening', () => {
    for (const file of FINANCIAL_DOORS) {
      const src = read(file);
      expect(src.includes('THE BODY DOOR: an unreadable body is a client mistake')).toBe(true);
    }
  });
});

describe('THE PER-FILE HONEST BYTES', () => {
  it('accounts CREATE borrows the service signature itself (the door cannot drift)', () => {
    const src = read('src/app/api/financial/accounts/route.ts');
    expect(src.includes('readJsonBody<Parameters<typeof createAccount>[0]>(request)')).toBe(true);
    expect(src.includes('the door cannot drift from')).toBe(true);
  });

  it('budgets CREATE speaks the wire contract (createdById, not the helper userId)', () => {
    const src = read('src/app/api/financial/budgets/route.ts');
    expect(src.includes('createdById?: string;')).toBe(true);
    expect(src.includes('budgetedAmount?: number | string;')).toBe(true);
    expect(src.includes('SetBudgetInput says userId')).toBe(true);
  });

  it('budgets UPDATE speaks its own shape (updatedById rides, no re-cast remains)', () => {
    const src = read('src/app/api/financial/budgets/[id]/route.ts');
    expect(src.includes('updatedById?: string;')).toBe(true);
    expect(src.includes('} = body as {')).toBe(false);
  });

  it('budgets recalculate speaks its pair and imports db for the cross-check', () => {
    const src = read('src/app/api/financial/budgets/recalculate/route.ts');
    expect(src.includes('readJsonBody<{ storeId?: string; periodId?: string }>(request)')).toBe(true);
    expect(src.includes("import { db } from '@/lib/db';")).toBe(true);
  });

  it('accounts UPDATE names the audit rider beside the four updatable fields', () => {
    const src = read('src/app/api/financial/accounts/[id]/route.ts');
    expect(src.includes('updatedByUserId?: string;')).toBe(true);
    expect(src.includes('isActive?: boolean;')).toBe(true);
  });

  it('trial-balance snapshot speaks its four fields (positional args + options riders)', () => {
    const src = read('src/app/api/financial/trial-balance/snapshot/route.ts');
    expect(src.includes('generatedByUserId?: string;')).toBe(true);
    expect(src.includes('snapshotDate?: string;')).toBe(true);
  });

  it('periods CREATE speaks ISO strings (the route converts to Dates below)', () => {
    const src = read('src/app/api/financial/periods/route.ts');
    expect(src.includes('startDate?: string;')).toBe(true);
    expect(src.includes('endDate?: string;')).toBe(true);
    expect(src.includes('createdByUserId?: string;')).toBe(true);
  });

  it('periods ACTION speaks the honest union (the includes() check is the validator)', () => {
    const src = read('src/app/api/financial/periods/[id]/route.ts');
    expect(src.includes("action?: 'CLOSE' | 'LOCK' | 'REOPEN';")).toBe(true);
    expect(src.includes('reason?: string;')).toBe(true);
  });

  it('journal CREATE speaks the double-entry lines shape', () => {
    const src = read('src/app/api/financial/journal/route.ts');
    expect(
      src.includes('lines?: Array<{ accountId: string; debit: number; credit: number; description?: string }>;'),
    ).toBe(true);
    expect(src.includes('isPosted?: boolean;')).toBe(true);
  });

  it('journal VOID keeps the String()-coerce door — unknown is honest there', () => {
    const src = read('src/app/api/financial/journal/[id]/route.ts');
    expect(src.includes('readJsonBody<{ reason?: unknown }>(request)')).toBe(true);
  });
});

describe('THE CROSS-CHECK THE COMMENT ALWAYS PROMISED (recalculate)', () => {
  const src = () => read('src/app/api/financial/budgets/recalculate/route.ts');

  it('the period must belong to the calling store before the helper runs', () => {
    expect(src().includes('period.storeId !== storeId')).toBe(true);
    expect(src().includes("error: 'Period not found for this store.'")).toBe(true);
    expect(src().includes('{ status: 404 }')).toBe(true);
  });

  it('the check runs BEFORE recalculateBudgetActuals (the guard is not cosmetic)', () => {
    const s = src();
    const guard = s.indexOf('period.storeId !== storeId');
    const helper = s.indexOf('recalculateBudgetActuals(');
    expect(guard).toBeGreaterThan(-1);
    expect(helper).toBeGreaterThan(-1);
    expect(guard).toBeLessThan(helper);
  });

  it('the stale comment now tells the truth (the promise is finally code)', () => {
    expect(src().includes('THE CROSS-CHECK THE COMMENT ALWAYS PROMISED')).toBe(true);
    expect(src().includes("the comment's promise is finally code")).toBe(true);
  });
});

describe('THE LEDGER GREW HONESTLY (body-door-class-v2326)', () => {
  it('the financial trio graduated out of the loose-generic exemplar list', () => {
    const src = read('src/tests/body-door-class-v2326.test.ts');
    expect(src.includes('THE FINANCIAL TRIO GRADUATED')).toBe(true);
    // v2.336.0: the catalog pair graduated too (see catalog-doors-v2336.test.ts)
    // and v2.338.0: the customer graduate followed (see
    // customer-doors-v2338.test.ts), so the exemplar list this pin guards is
    // the REMAINING two — the honest growth of an honest list (the pin-growth
    // law: a byte-exact pin on a line an honest change edits grows with the
    // change).
    expect(src.includes("EXEMPLARS: string[] = [\n  'src/app/api/expenses/[id]/route.ts',\n  'src/app/api/suppliers/[id]/route.ts',\n];")).toBe(true);
    // the loose-generic exemplar pin still guards the two that remain
    expect(src.includes("expect(src.includes('readJsonBody<Record<string, unknown>>(request)')).toBe(true);")).toBe(true);
  });
});

describe('THE STYLING FACE — the budgets consumption meter', () => {
  const panel = () => read('src/app/(shell)/tabs/financial/BudgetsPanel.tsx');

  it('the summary grows its fourth face: the meter', () => {
    expect(panel().includes('data-testid="budget-consumption-meter"')).toBe(true);
    expect(panel().includes('THE CONSUMPTION METER')).toBe(true);
    expect(panel().includes('role="progressbar"')).toBe(true);
    expect(panel().includes('aria-valuenow={Math.round(consumptionPct)}')).toBe(true);
  });

  it('the meter colour-steps through the three thresholds', () => {
    expect(panel().includes("'bg-red-500 dark:bg-red-400'")).toBe(true);
    expect(panel().includes("'bg-amber-500 dark:bg-amber-400'")).toBe(true);
    expect(panel().includes("'bg-emerald-500 dark:bg-emerald-400'")).toBe(true);
    expect(panel().includes("' — over budget'")).toBe(true);
  });

  it('the summary cards speak their exact values on hover, the recalc button to screen readers', () => {
    expect(panel().includes('title={`Budgeted: ${formatKES(totals.budgeted)}`}')).toBe(true);
    expect(panel().includes('title={`Actual: ${formatKES(totals.actual)}`}')).toBe(true);
    expect(
      panel().includes('aria-label="Recalculate budget actuals from posted journal entries for the selected period"'),
    ).toBe(true);
  });
});
