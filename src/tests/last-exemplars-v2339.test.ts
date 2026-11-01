import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'path';
import { describe, it, expect } from 'vitest';

// ---------------------------------------------------------------------------
// v2.339.0 — THE LAST EXEMPLARS, the era's end.
//
// Two ledgers closed on the same day:
//   1. THE LOOSE-RECORD ERA IS OVER — expenses/[id] and suppliers/[id], the
//      last two doors still reading their bodies through the loose
//      `<Record<string, unknown>>` widening, now speak their own shapes.
//      The v2.326 census runs ZERO loose doors; its EXEMPLARS list is the
//      era's tombstone (empty, honestly).
//   2. THE RE-CAST CLASS IS GONE — the six doors that borrowed a local
//      interface via `door.body as X` now ride the interface INSIDE the
//      generic (`readJsonBody<AdminBody>(request)` and five siblings; the
//      stkpush/redeem borrow precedent). The status→union narrowing in
//      shift-schedules/[id]/status stays — it is the route's own validator.
//
// The wider bare-`any` class remains (30 doors, the round's census) — its
// family passes continue. THE OD LAW: every pin reads the SOURCE bytes.
// ---------------------------------------------------------------------------

const read = (p: string) => readFileSync(p, 'utf8');

function walkApi(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) out.push(...walkApi(full));
    else if (name.endsWith('.ts')) out.push(full);
  }
  return out;
}

const API_FILES = walkApi('src/app/api');

describe('THE LOOSE-RECORD ERA IS OVER (v2.339.0)', () => {
  it('not one door in src/app/api reads through the loose Record widening', () => {
    const offenders = API_FILES.filter((f) => read(f).includes('readJsonBody<Record<string, unknown>>'));
    expect(offenders).toEqual([]);
  });

  it('not one door re-casts the body back to a named interface', () => {
    const offenders = API_FILES.filter((f) => /door\.body as [A-Z]/.test(read(f)));
    expect(offenders).toEqual([]);
  });

  it('the v2.326 census carries the era-end story and the empty tombstone', () => {
    const ledger = read('src/tests/body-door-class-v2326.test.ts');
    expect(ledger.includes('THE LOOSE-RECORD ERA IS OVER')).toBe(true);
    expect(ledger.includes('THE LAST EXEMPLARS GRADUATED')).toBe(true);
    expect(ledger.includes('EXEMPLARS: string[] = [];')).toBe(true);
    // the graduates ride the ABSENCE guard now (their honest generics stand)
    expect(ledger.includes("expect(src.includes('readJsonBody<Record<string, unknown>>(request)')).toBe(false);")).toBe(true);
  });
});

describe('THE LAST EXEMPLARS — their honest bytes', () => {
  it('expenses/[id] names the five fields the route reads (the loop\u2019s four + the coerced amount)', () => {
    const src = read('src/app/api/expenses/[id]/route.ts');
    expect(src.includes('// v2.339.0 THE LAST EXEMPLARS: the door speaks its own shape \u2014 the five')).toBe(true);
    expect(src.includes('description?: unknown;')).toBe(true);
    expect(src.includes('category?: unknown;')).toBe(true);
    expect(src.includes('paymentMethod?: unknown;')).toBe(true);
    expect(src.includes('notes?: unknown;')).toBe(true);
    expect(src.includes('amount?: unknown;')).toBe(true);
    expect(src.includes('[key: string]: unknown;')).toBe(true);
    expect(src.includes('readJsonBody<Record<string, unknown>>(request)')).toBe(false);
    // the loop's honest aggregate stays (the index signature is the loop's own truth)
    expect(src.includes('const updateData: Record<string, unknown> = {};')).toBe(true);
  });

  it('suppliers/[id] names the eleven fields the allowedFields loop reads', () => {
    const src = read('src/app/api/suppliers/[id]/route.ts');
    expect(src.includes('// v2.339.0 THE LAST EXEMPLARS: the door speaks its own shape \u2014 the eleven')).toBe(true);
    for (const field of ['name', 'email', 'phone', 'address', 'city', 'contactPerson', 'taxPin', 'paymentTerms', 'rating', 'isActive', 'notes']) {
      expect(src.includes(`${field}?: unknown;`)).toBe(true);
    }
    expect(src.includes('[key: string]: unknown;')).toBe(true);
    expect(src.includes('readJsonBody<Record<string, unknown>>(request)')).toBe(false);
    expect(src.includes('const updateData: Record<string, unknown> = {};')).toBe(true);
  });
});

describe('THE RE-CAST CLASS IS GONE — the borrow precedent, six times', () => {
  it('the health admin doors ride AdminBody inside the generic', () => {
    for (const p of ['src/app/api/health/circuit-breaker/route.ts', 'src/app/api/health/dlq/route.ts']) {
      const src = read(p);
      expect(src.includes('const door = await readJsonBody<AdminBody>(request);')).toBe(true);
      expect(src.includes('const body = door.body as AdminBody;')).toBe(false);
      expect(src.includes('const body = door.body;')).toBe(true);
    }
  });

  it('the password door rides ChangePasswordBody inside the generic', () => {
    const src = read('src/app/api/profile/password/route.ts');
    expect(src.includes('const door = await readJsonBody<ChangePasswordBody>(request);')).toBe(true);
    expect(src.includes('const body = door.body as ChangePasswordBody;')).toBe(false);
    expect(src.includes('const body = door.body;')).toBe(true);
  });

  it('the shift-schedules trio rides their own interfaces inside the generic', () => {
    expect(read('src/app/api/shift-schedules/route.ts').includes('const door = await readJsonBody<CreateBody>(request);')).toBe(true);
    expect(read('src/app/api/shift-schedules/[id]/route.ts').includes('const door = await readJsonBody<PatchBody>(request);')).toBe(true);
    expect(read('src/app/api/shift-schedules/[id]/status/route.ts').includes('const door = await readJsonBody<StatusBody>(request);')).toBe(true);
    for (const p of ['src/app/api/shift-schedules/route.ts', 'src/app/api/shift-schedules/[id]/route.ts', 'src/app/api/shift-schedules/[id]/status/route.ts']) {
      expect(/door\.body as (CreateBody|PatchBody|StatusBody);/.test(read(p))).toBe(false);
    }
  });

  it('the status-to-union narrowing stays \u2014 it is the route\u2019s own validator, not a body re-cast', () => {
    const src = read('src/app/api/shift-schedules/[id]/status/route.ts');
    expect(src.includes('const target = body.status as ShiftScheduleStatus;')).toBe(true);
    expect(src.includes('!VALID_STATUSES.includes(target)')).toBe(true);
  });
});

describe('THE LAW DOC CARRIES THE ROUND', () => {
  it('request-body.ts records the era\u2019s end and the re-cast closure', () => {
    const home = read('src/lib/request-body.ts');
    expect(home.includes('v2.339.0 \u2014 THE LAST EXEMPLARS, the era\'s end')).toBe(true);
    expect(home.includes('THE LOOSE-RECORD ERA IS OVER')).toBe(true);
    expect(home.includes("30 doors named by the round's census")).toBe(true);
    // the default-generic law itself is untouched (the bare class remains)
    expect(home.includes('export async function readJsonBody<T = any>(')).toBe(true);
  });
});

describe('THE STYLING FACE — the expense-share meter', () => {
  const desk = () => read('src/app/(shell)/tabs/financial-tab.tsx');

  it('every active expense row draws its slice of the period\u2019s spend', () => {
    const src = desk();
    expect(src.includes('data-testid="expense-share-meter"')).toBe(true);
    expect(src.includes('role="progressbar"')).toBe(true);
    expect(src.includes('aria-valuemin={0}')).toBe(true);
    expect(src.includes('aria-valuemax={100}')).toBe(true);
    expect(src.includes('aria-valuenow={Math.round(share)}')).toBe(true);
    expect(src.includes('Expense share: ')).toBe(true);
    expect(src.includes('period total')).toBe(true);
  });

  it('the concentration voice steps through the three colours', () => {
    const src = desk();
    expect(src.includes("share > 50 ? 'bg-red-500' : share > 20 ? 'bg-amber-500' : 'bg-emerald-500'")).toBe(true);
  });

  it('the envelope is the active expenses\u2019 total \u2014 the header voice\u2019s own reduce; VOIDED rows stay silent', () => {
    const src = desk();
    expect(src.includes("const periodExpenseTotal = expenses")).toBe(true);
    expect(src.includes(".filter((e) => e.status !== 'VOIDED')")).toBe(true);
    expect(src.includes("exp.status !== 'VOIDED' && periodExpenseTotal > 0")).toBe(true);
    expect(src.includes('Math.min(100, (toNum(exp.amount) / periodExpenseTotal) * 100)')).toBe(true);
    // the meter precedent, fifth desk: the tabular track rides bg-muted (dark-safe)
    expect(src.includes('rounded-full bg-muted overflow-hidden')).toBe(true);
  });
});
