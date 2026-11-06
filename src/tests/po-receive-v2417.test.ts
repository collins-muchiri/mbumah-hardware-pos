// THE RECEIVE'S FILL SUITE (v2.417.0) — the receive dialog stops being a
// bare wall of pens.
//
//   - buildReceiveInitials: the REMAINING LAW's one home — every open
//     pen opens at its line's remaining units, every closed line at '0';
//     a wire that over-received by accident can never ask for a negative
//     fill.
//   - parseReceiveQty: the PEN'S GRACE — a pen that does not parse reads
//     as 0, never NaN.
//   - receiveRowState: one read paints the row AND speaks its words —
//     over in red, short in amber (the shortfall counted), closed in
//     green, and the meter's live completion preview.
//   - describeReceivePlan: the PLAN'S TRUTH — counts over OPEN lines
//     only, so a finished order can never speak as partial and a fresh
//     dialog always speaks empty.
//   - the dialog's face: the quick fills (Fill all remaining / Clear all),
//     the per-row Fill pen, the amber short face, the row meters and the
//     receive-plan strip all read the same helpers.
//
// Every pin reads the SOURCE OF RECORD (source bytes, not memory) — the
// house rule since the verify scripts were born.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it, expect } from 'vitest';

import {
  buildReceiveInitials,
  parseReceiveQty,
  receiveRowState,
  describeReceivePlan,
} from '@/lib/po-receive';
import { nextSequenceNumber } from '@/lib/sequence';

const read = (p: string) => readFileSync(join(process.cwd(), p), 'utf8');

const TAB = 'src/app/(shell)/tabs/purchase-orders-tab.tsx';
const tabSrc = read(TAB);

const line = (id: string, quantity: number, receivedQty: number) => ({ id, quantity, receivedQty });

describe('buildReceiveInitials (v2.417.0) — the remaining law, one home', () => {
  it('opens every open pen at its line\u2019s remaining units', () => {
    const initials = buildReceiveInitials([line('a', 50, 0), line('b', 12, 5)]);
    expect(initials['a']).toBe('50');
    expect(initials['b']).toBe('7');
  });

  it('opens every closed line at 0 (a fully received line asks for nothing)', () => {
    const initials = buildReceiveInitials([line('a', 50, 50), line('b', 12, 20)]);
    expect(initials['a']).toBe('0');
    expect(initials['b']).toBe('0');
  });

  it('floors at 0 — a wire that over-received can never ask for a negative fill', () => {
    const initials = buildReceiveInitials([line('a', 10, 15)]);
    expect(initials['a']).toBe('0');
  });

  it('is a fresh object every call — the pens never share a shape by accident', () => {
    const first = buildReceiveInitials([line('a', 5, 0)]);
    const second = buildReceiveInitials([line('a', 5, 0)]);
    expect(first).toEqual(second);
    expect(first).not.toBe(second);
  });
});

describe('parseReceiveQty (v2.417.0) — the pen\u2019s grace', () => {
  it('reads a whole and a half pen honestly', () => {
    expect(parseReceiveQty('12')).toBe(12);
    expect(parseReceiveQty('12.5')).toBe(12.5);
  });

  it('reads an empty, a missing and a half-typed pen as 0 — never NaN', () => {
    expect(parseReceiveQty('')).toBe(0);
    expect(parseReceiveQty(undefined)).toBe(0);
    expect(parseReceiveQty('abc')).toBe(0);
    expect(parseReceiveQty('12x')).toBe(12);
  });
});

describe('receiveRowState (v2.417.0) — one read paints the row and speaks its words', () => {
  it('a full fill is neither short nor over', () => {
    const state = receiveRowState(line('a', 50, 0), '50');
    expect(state.remaining).toBe(50);
    expect(state.isShort).toBe(false);
    expect(state.isOver).toBe(false);
    expect(state.shortfall).toBe(0);
    expect(state.pct).toBe(100);
  });

  it('a short fill speaks the shortfall and wears the amber math', () => {
    const state = receiveRowState(line('a', 50, 0), '30');
    expect(state.isShort).toBe(true);
    expect(state.shortfall).toBe(20);
    expect(state.pct).toBe(60);
  });

  it('an over fill refuses honestly (the submit\u2019s own law)', () => {
    const state = receiveRowState(line('a', 50, 0), '60');
    expect(state.isOver).toBe(true);
    expect(state.isShort).toBe(false);
  });

  it('a closed line is closed — no fill, no short, no pen', () => {
    const state = receiveRowState(line('a', 50, 50), '0');
    expect(state.isClosed).toBe(true);
    expect(state.isShort).toBe(false);
    expect(state.isOver).toBe(false);
    expect(state.pct).toBe(100);
  });

  it('a partially received line\u2019s meter counts the already-received units', () => {
    const state = receiveRowState(line('a', 100, 40), '10');
    expect(state.remaining).toBe(60);
    expect(state.pct).toBe(50);
  });

  it('the meter clamps at 100 even when the pen refuses nothing', () => {
    const state = receiveRowState(line('a', 10, 8), '9');
    expect(state.pct).toBe(100);
  });

  it('a zero-quantity wire line never divides by zero', () => {
    const state = receiveRowState(line('a', 0, 0), '0');
    expect(state.pct).toBe(0);
  });
});

describe('describeReceivePlan (v2.417.0) — the plan\u2019s truth, open lines only', () => {
  it('a complete pass speaks emerald: every open line filled, none short', () => {
    const plan = describeReceivePlan([line('a', 50, 0), line('b', 12, 5)], { a: '50', b: '7' });
    expect(plan.empty).toBe(false);
    expect(plan.partial).toBe(false);
    expect(plan.fullLines).toBe(2);
    expect(plan.shortLines).toBe(0);
    expect(plan.untouchedLines).toBe(0);
    expect(plan.units).toBe(57);
    expect(plan.shortUnits).toBe(0);
  });

  it('a partial pass counts the short line and its shortfall', () => {
    const plan = describeReceivePlan([line('a', 50, 0), line('b', 12, 0)], { a: '30', b: '12' });
    expect(plan.partial).toBe(true);
    expect(plan.shortLines).toBe(1);
    expect(plan.shortUnits).toBe(20);
    expect(plan.fullLines).toBe(1);
    expect(plan.units).toBe(42);
  });

  it('an untouched open line is counted, never forgiven', () => {
    const plan = describeReceivePlan([line('a', 50, 0), line('b', 12, 0)], { a: '50', b: '0' });
    expect(plan.partial).toBe(true);
    expect(plan.untouchedLines).toBe(1);
    expect(plan.shortLines).toBe(0);
  });

  it('closed lines are the order\u2019s past, not its plan (never untouched)', () => {
    const plan = describeReceivePlan([line('a', 50, 50), line('b', 12, 0)], { a: '0', b: '0' });
    expect(plan.openLines).toBe(1);
    expect(plan.untouchedLines).toBe(1);
    expect(plan.empty).toBe(true);
  });

  it('a fresh dialog speaks empty — the submit stays disabled by the plan itself', () => {
    const plan = describeReceivePlan([line('a', 50, 0)], {});
    expect(plan.empty).toBe(true);
    expect(plan.units).toBe(0);
  });

  it('the pen\u2019s grace rides the plan too — a half-typed pen reads as 0', () => {
    const plan = describeReceivePlan([line('a', 50, 0)], { a: 'abc' });
    expect(plan.empty).toBe(true);
  });

  it('an empty order is an empty plan (no lines, no lies)', () => {
    const plan = describeReceivePlan([], {});
    expect(plan.empty).toBe(true);
    expect(plan.partial).toBe(false);
    expect(plan.openLines).toBe(0);
  });
});

describe('nextSequenceNumber (v2.417.0) — the number\u2019s next, MAX not COUNT', () => {
  it('a fresh day starts at 0001', () => {
    expect(nextSequenceNumber('PO-20261106-', [])).toBe('PO-20261106-0001');
  });

  it('a contiguous day walks one up', () => {
    expect(
      nextSequenceNumber('PO-20261106-', ['PO-20261106-0001', 'PO-20261106-0002'])
    ).toBe('PO-20261106-0003');
  });

  it('THE BURST\u2019S OWN WOUND: a gapped day steps past the gap, never onto it', () => {
    // the live P2002 the QA burst proved: -0004 stood alone (its siblings
    // deleted), count+1 kept recomputing -0004 onto the existing row; MAX+1
    // reads the highest suffix and steps past.
    const existing = ['PO-20261106-0002', 'PO-20261106-0003', 'PO-20261106-0004'];
    expect(nextSequenceNumber('PO-20261106-', existing)).toBe('PO-20261106-0005');
  });

  it('foreign prefixes are ignored (a JE- or INV- number never moves the PO counter)', () => {
    expect(
      nextSequenceNumber('PO-20261106-', ['JE-20261106-0042', 'INV-20261106-0009'])
    ).toBe('PO-20261106-0001');
  });

  it('other days\u2019 numbers are ignored (yesterday never feeds today\u2019s counter)', () => {
    expect(nextSequenceNumber('PO-20261106-', ['PO-20261105-0050'])).toBe('PO-20261106-0001');
  });

  it('a non-numeric suffix is ignored, never a NaN seed', () => {
    expect(nextSequenceNumber('PO-20261106-', ['PO-20261106-DRAFT'])).toBe('PO-20261106-0001');
  });

  it('the race survives too: a contender\u2019s higher number is stepped past', () => {
    // withSequenceRetry re-runs the closure; the re-read now sees the
    // contender's number (the old count+1 recomputed the SAME poisoned number).
    const before = ['PO-20261106-0002', 'PO-20261106-0003'];
    const afterRace = [...before, 'PO-20261106-0004'];
    expect(nextSequenceNumber('PO-20261106-', before)).toBe('PO-20261106-0004');
    expect(nextSequenceNumber('PO-20261106-', afterRace)).toBe('PO-20261106-0005');
  });

  it('the width holds at four and grows honestly past it', () => {
    expect(nextSequenceNumber('PO-20261106-', ['PO-20261106-9999'])).toBe('PO-20261106-10000');
  });

  it('the route reads the helper (no private count+1 re-implementation left behind)', () => {
    const route = read('src/app/api/purchase-orders/route.ts');
    expect(route).toContain("import { withSequenceRetry, nextSequenceNumber } from '@/lib/sequence';");
    expect(route).toContain('nextSequenceNumber(`PO-${dateStr}-`, existing.map((r) => r.poNumber))');
    expect(route).not.toContain('existingCount + 1');
  });
});

describe('the receive dialog\u2019s face (v2.417.0) — the fill lands on the desk', () => {
  it('the dialog reads the fill\u2019s one home (no private re-implementation)', () => {
    // v2.419.0: the import grew the drill's mirror reads (the drill wears
    // the receive's truth from the SAME one home) — the pin grew with it.
    expect(tabSrc).toContain("import { buildReceiveInitials, receiveRowState, describeReceivePlan, drillLineState, describeDrillProgress, receiveMaker, receiveSuccessVoice, receiveShortfallPointer, drillFollowUpDoor } from '@/lib/po-receive';");
    expect(tabSrc).toContain('setReceivedQtys(buildReceiveInitials(purchaseOrder.items));');
    expect(tabSrc).toContain('receiveRowState(item, receivedQtys[item.id])');
    expect(tabSrc).toContain('describeReceivePlan(items, receivedQtys)');
  });

  it('the quick fills exist, testid-ed, above the rows', () => {
    expect(tabSrc).toContain('data-testid="receive-fill-all"');
    expect(tabSrc).toContain('Fill all remaining');
    expect(tabSrc).toContain('data-testid="receive-clear-all"');
    expect(tabSrc).toContain('Clear all');
    expect(tabSrc).toContain('const fillAllRemaining = () => setReceivedQtys(buildReceiveInitials(items));');
  });

  it('the per-row Fill pen exists, testid-ed, aria-labelled, and closed lines grow none', () => {
    expect(tabSrc).toContain('data-testid={`receive-fill-${item.id}`}');
    expect(tabSrc).toContain('aria-label={`Fill remaining for ${rowName}`}');
    expect(tabSrc).toContain('{!isClosed && (');
  });

  it('the short face wears the amber family (row, pen and words agree)', () => {
    expect(tabSrc).toContain("'border-amber-300 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-900/20'");
    expect(tabSrc).toContain("'border-amber-400 focus-visible:ring-amber-400'");
    expect(tabSrc).toContain('— short by {formatQtyWithUnit(shortfall, product?.unitType)}');
  });

  it('the closed line speaks its completion in green (the past is green, not amber)', () => {
    expect(tabSrc).toContain('<span className="text-green-700 font-medium">Fully received</span>');
  });

  it('every row wears its meter — the live completion preview, aria-labelled', () => {
    expect(tabSrc).toContain('aria-label={`${rowName}: ${pct}% received after this pass`}');
    expect(tabSrc).toContain("pct >= 100 ? 'bg-emerald-500' : qty > 0 ? 'bg-amber-500' : 'bg-slate-400'");
  });

  it('the receive-plan strip exists, testid-ed, with the three honest houses', () => {
    expect(tabSrc).toContain('data-testid="receive-plan-strip"');
    expect(tabSrc).toContain("'text-muted-foreground bg-muted/40'");
    expect(tabSrc).toContain("'text-amber-800 bg-amber-50 dark:text-amber-300 dark:bg-amber-900/20'");
    expect(tabSrc).toContain("'text-emerald-800 bg-emerald-50 dark:text-emerald-300 dark:bg-emerald-900/20'");
    expect(tabSrc).toContain("'nothing set to receive yet'");
    expect(tabSrc).toContain('— the order completes');
  });

  it('the old total row reads the plan\u2019s own units (one truth, two faces)', () => {
    expect(tabSrc).toContain('<span className="font-bold text-lg">{plan.units}</span>');
    expect(tabSrc).not.toContain('sum + (parseFloat(qty) || 0)');
  });
});
