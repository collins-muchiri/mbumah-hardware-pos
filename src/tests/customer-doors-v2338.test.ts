// ─────────────────────────────────────────────────────────────────────────────
// The customer doors speak their body's shape (v2.338.0)
// ─────────────────────────────────────────────────────────────────────────────
//
// v2.335.0 walked the WIDER door class one family at a time (the financial
// family first). v2.336.0 was the second pass (the catalog family).
// v2.337.0 was the third (the banking family). v2.338.0 is the FOURTH pass:
// the CUSTOMER family —
//
//   • ten customer-family reads stop reading their bodies as the door's
//     default `any` or the loose `Record` and speak the body's OWN shape:
//     customers CREATE names the two raw fields the zod schema does not own
//     (the gift-cards precedent — the two Record re-casts are gone);
//     customers UPDATE names every field the allowedFields loop consumes;
//     the credit ledger's CREATE speaks seven fields with `amount` as
//     `number | string` (the ledger's own toDec guard owns the widening)
//     and its UPDATE graduates OUT of the loose-Record exemplars;
//     customer-interactions speaks ten fields; debt-payment speaks six
//     with the three presence-checked fields riding REQUIRED (the route's
//     own missing-fields aggregator is the runtime validator — the
//     RedeemBody precedent); the payment-plan create/patch reads speak
//     their own shapes types-only (the routes' own 400 JSON voice
//     untouched); the installment pay door borrows the route's OWN
//     PaymentMethod union (the stkpush borrow precedent) and waive names
//     its one typeof-narrowed field;
//   • and the customers desk grows THE CREDIT-ENVELOPE METER — the debt as
//     a share of the customer's own debt limit, the same envelope the risk
//     badge speaks (the styling face).
//
// RUNTIME BEHAVIOR of the tightened doors is byte-identical — types only
// (the scoped tsc round-trip proved 0=0 beyond the scoped-probe artifact).
// ─────────────────────────────────────────────────────────────────────────────

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';

const read = (p: string) => readFileSync(p, 'utf8');

const CUSTOMER_DOORS = [
  'src/app/api/customers/route.ts',
  'src/app/api/customers/[id]/route.ts',
  'src/app/api/customer-credits/route.ts',
  'src/app/api/customer-credits/[id]/route.ts',
  'src/app/api/customer-interactions/route.ts',
  'src/app/api/debt/route.ts',
  'src/app/api/debt-payment-plans/[id]/installments/[installmentId]/pay/route.ts',
  'src/app/api/debt-payment-plans/[id]/installments/[installmentId]/waive/route.ts',
];

// The two payment-plan routes are NOT body-door files: they carry their own
// try/catch 400 (an older contract, kept byte-identical). They still speak
// their own shapes — pinned separately below (THE PLAN ROUTES KEEP THEIR
// OWN VOICE).

describe('THE CUSTOMER DOORS SPEAK THEIR BODY SHAPE (v2.338.0 census)', () => {
  it('not one customer door still speaks the loose Record cast (body reads only)', () => {
    const loose = CUSTOMER_DOORS.filter((f) =>
      read(f).includes('as Record<string, unknown>')
    );
    expect(loose).toEqual([]);
  });

  it('the one remaining cast in the plan-create route is the GET-side serialization row, never a body read', () => {
    const src = read('src/app/api/debt-payment-plans/route.ts');
    // the queue-timeout precedent: not a body door, not a body read — the row
    // shape is structurally mutated (installments deleted, fields added), so
    // the index signature is the honest tool
    expect(src.includes('const row = serializePlanRow(plan) as Record<string, unknown>;')).toBe(true);
    expect(src.includes('never a body read')).toBe(false);
  });

  it('not one customer door reads the door default any more (no bare readJsonBody(request))', () => {
    const bare = CUSTOMER_DOORS.filter((f) => /readJsonBody\(request\)/.test(read(f)));
    expect(bare).toEqual([]);
  });

  it('not one customer door re-casts the body back to a named interface any more', () => {
    const recast = CUSTOMER_DOORS.filter((f) => /door\.body as [A-Z]/.test(read(f)));
    expect(recast).toEqual([]);
  });

  it('every customer door carries the round marker', () => {
    for (const f of CUSTOMER_DOORS) {
      const src = read(f);
      const marker = src.includes('THE BODY DOOR: an unreadable body is a client mistake (v2.326.0)')
        || src.includes('THE BODY DOOR: an unreadable body is a client mistake — 400, never a 500.');
      expect(marker).toBe(true);
    }
  });

  it('every customer door imports the one home and names both helpers', () => {
    for (const f of CUSTOMER_DOORS) {
      const src = read(f);
      expect(src.includes("from '@/lib/request-body'")).toBe(true);
      expect(src.includes('readJsonBody')).toBe(true);
      expect(src.includes('bodyDoorRejected')).toBe(true);
    }
  });
});

describe('THE PER-FILE HONEST BYTES (v2.338.0)', () => {
  it('customers CREATE names the two raw fields the zod schema does not own (the re-casts are gone)', () => {
    const src = read('src/app/api/customers/route.ts');
    expect(src.includes("readJsonBody<{\n    preferredChannel?: string;\n    isActive?: boolean;\n  }>(request)")).toBe(true);
    // the reads are direct now — the Record re-casts this file carried are gone
    expect(src.includes('body.preferredChannel || \'SMS\'')).toBe(true);
    expect(src.includes('body.isActive ?? true')).toBe(true);
    expect(src.includes('(body as Record<string, unknown>)')).toBe(false);
  });

  it('customers UPDATE names every allowedFields loop field with phone read directly', () => {
    const src = read('src/app/api/customers/[id]/route.ts');
    expect(src.includes('phone?: string;')).toBe(true);
    for (const field of ['name', 'email', 'address', 'idNumber', 'debtLimit', 'preferredChannel', 'isActive', 'loyaltyPoints']) {
      expect(src.includes(`${field}?: unknown;`)).toBe(true);
    }
    expect(src.includes('[key: string]: unknown;')).toBe(true);
  });

  it('the credit-ledger CREATE speaks seven fields, amount riding the toDec widening', () => {
    const src = read('src/app/api/customer-credits/route.ts');
    expect(src.includes('amount?: number | string;')).toBe(true);
    for (const field of ['storeId', 'customerId', 'creditType', 'reference', 'description', 'createdBy']) {
      expect(src.includes(`${field}?: string;`)).toBe(true);
    }
    // the honest comment names the guard that owns the widening
    expect(src.includes('toDec guard owns the widening')).toBe(true);
  });

  it('the credit-ledger UPDATE graduated out of the loose-Record exemplars', () => {
    const src = read('src/app/api/customer-credits/[id]/route.ts');
    expect(src.includes('readJsonBody<Record<string, unknown>>(request)')).toBe(false);
    expect(src.includes('THE EXEMPLAR GRADUATED')).toBe(true);
    for (const field of ['amount', 'creditType', 'reference', 'description']) {
      expect(src.includes(`${field}?: unknown;`)).toBe(true);
    }
  });

  it('customer-interactions speaks ten fields with the date on the wire as a string', () => {
    const src = read('src/app/api/customer-interactions/route.ts');
    for (const field of ['storeId', 'customerId', 'interactionType', 'subject', 'content', 'status', 'priority', 'assignedTo', 'createdBy']) {
      expect(src.includes(`${field}?: string;`)).toBe(true);
    }
    expect(src.includes('followUpDate?: string;')).toBe(true);
    expect(src.includes('rides the wire as a string')).toBe(true);
  });

  it('the debt-payment door speaks six fields, the presence-checked trio REQUIRED', () => {
    const src = read('src/app/api/debt/route.ts');
    expect(src.includes('storeId: string;')).toBe(true);
    expect(src.includes('debtLedgerId: string;')).toBe(true);
    expect(src.includes('paymentMethod: string;')).toBe(true);
    expect(src.includes('amount?: unknown;')).toBe(true);
    expect(src.includes('reference?: string;')).toBe(true);
    expect(src.includes('notes?: unknown;')).toBe(true);
    // the honest comment names the runtime validator and the ignored field
    expect(src.includes('missing-fields aggregator is the runtime validator')).toBe(true);
    expect(src.includes('intentionally')).toBe(true);
  });

  it('the installment pay door borrows the route’s OWN PaymentMethod union', () => {
    const src = read('src/app/api/debt-payment-plans/[id]/installments/[installmentId]/pay/route.ts');
    expect(src.includes('paymentMethod?: PaymentMethod;')).toBe(true);
    expect(src.includes('the stkpush borrow precedent')).toBe(true);
    // the destructure rides the route's own defaulting ternary — the honest bridge
    expect(src.includes('the RedeemBody precedent')).toBe(true);
    expect(src.includes('paymentReference?: string;')).toBe(true);
  });

  it('the waive door names its one typeof-narrowed field', () => {
    const src = read('src/app/api/debt-payment-plans/[id]/installments/[installmentId]/waive/route.ts');
    expect(src.includes('waiverReason?: unknown;')).toBe(true);
    expect(src.includes('type-narrows it with typeof')).toBe(true);
  });
});

describe('THE PLAN ROUTES KEEP THEIR OWN VOICE (types only)', () => {
  it('the plan-create read speaks the eleven-field shape, the three presence guards REQUIRED', () => {
    const src = read('src/app/api/debt-payment-plans/route.ts');
    expect(src.includes('storeId: string;')).toBe(true);
    expect(src.includes('customerId: string;')).toBe(true);
    expect(src.includes('debtLedgerId: string;')).toBe(true);
    for (const field of ['totalAmount', 'installmentCount', 'startDate', 'interestRate', 'lateFee', 'notes', 'autoCharge']) {
      expect(src.includes(`${field}?: unknown;`)).toBe(true);
    }
    expect(src.includes('frequency?: string;')).toBe(true);
    // the route's own 400 voice is untouched (the door did not eat the contract)
    expect(src.includes('Request body is not valid JSON.')).toBe(true);
  });

  it('the plan-patch read speaks the two-field shape the route typeof-narrows', () => {
    const src = read('src/app/api/debt-payment-plans/[id]/route.ts');
    expect(src.includes('let body: { notes?: unknown; status?: unknown };')).toBe(true);
    expect(src.includes('Request body is not valid JSON.')).toBe(true);
  });
});

describe('THE LEDGER GREW HONESTLY (the exemplar graduation, three ways — plus the era-end, a fourth)', () => {
  it('the v2.326 census carries THE CUSTOMER GRADUATE (the tombstone followed in v2.339.0 — the era is over)', () => {
    const src = read('src/tests/body-door-class-v2326.test.ts');
    expect(src.includes('THE CUSTOMER GRADUATE')).toBe(true);
    expect(src.includes('EXEMPLARS: string[] = [];')).toBe(true);
    expect(src.includes("'src/app/api/customer-credits/[id]/route.ts',\")).toBe(false);"));
  });

  it('the v2.335 byte-exact pin grew with the honest list (the tombstone now)', () => {
    const src = read('src/tests/financial-doors-v2335.test.ts');
    expect(src.includes('EXEMPLARS: string[] = [];')).toBe(true);
    expect(src.includes("expect(src.includes('readJsonBody<Record<string, unknown>>(request)')).toBe(false);")).toBe(true);
  });

  it('the v2.336 presence pin flipped honestly (the graduate is absent; the tombstone pinned in v2.339.0)', () => {
    const src = read('src/tests/catalog-doors-v2336.test.ts');
    expect(src.includes("expect(src.includes(\"'src/app/api/customer-credits/[id]/route.ts',\")).toBe(false);")).toBe(true);
    expect(src.includes('the customer graduate followed in v2.338.0')).toBe(true);
    expect(src.includes('EXEMPLARS: string[] = [];')).toBe(true);
  });

  it('the era is over (v2.339.0): the tombstone is empty everywhere and the graduates ride the ABSENCE guard', () => {
    const v2326 = read('src/tests/body-door-class-v2326.test.ts');
    expect(v2326.includes('THE LOOSE-RECORD ERA IS OVER')).toBe(true);
    expect(v2326.includes('GRADUATED_IN_V2339')).toBe(true);
    const lastExemplars = read('src/tests/last-exemplars-v2339.test.ts');
    expect(lastExemplars.includes('THE LOOSE-RECORD ERA IS OVER')).toBe(true);
  });
});

describe('THE LAW DOC CARRIES THE ROUND', () => {
  it('request-body.ts records the customer family pass', () => {
    const home = read('src/lib/request-body.ts');
    expect(home.includes('v2.338.0 — THE CUSTOMER FAMILY')).toBe(true);
    expect(home.includes("the wider class's fourth pass")).toBe(true);
    expect(home.includes('the RedeemBody\n * precedent')).toBe(true);
    expect(home.includes('exemplars (two remain)')).toBe(true);
  });
});

describe('THE STYLING FACE — the credit-envelope meter on the customers desk', () => {
  const desk = () => read('src/app/(shell)/tabs/customers-tab.tsx');

  it('the customer rows grow the credit-envelope meter', () => {
    expect(desk().includes('THE CREDIT-ENVELOPE METER')).toBe(true);
    expect(desk().includes('data-testid="cust-debt-meter"')).toBe(true);
    expect(desk().includes('role="progressbar"')).toBe(true);
    expect(desk().includes('aria-valuemin={0}')).toBe(true);
    expect(desk().includes('aria-valuemax={100}')).toBe(true);
    expect(desk().includes('aria-valuenow={Math.round(pct)}')).toBe(true);
  });

  it('the meter speaks the risk badge’s own envelope (amber under the half-way line, red past it)', () => {
    expect(desk().includes("const meterColor = pct > 50 ? 'bg-red-500' : 'bg-amber-500';")).toBe(true);
  });

  it('the meter stays silent when there is no debt or no limit', () => {
    expect(desk().includes('customer.currentDebtBalance > 0 && customer.debtLimit > 0')).toBe(true);
    expect(desk().includes('there is no envelope to draw')).toBe(true);
  });

  it('the meter names the over-limit case in its aria voice and its hover voice', () => {
    expect(desk().includes("(over limit)")).toBe(true);
    expect(desk().includes('Math.min(100,')).toBe(true);
  });
});
