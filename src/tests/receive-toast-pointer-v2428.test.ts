// THE TOAST'S POINTER SUITE (v2.428.0) — THE ARC'S NINTH WORD: the
// shortfall survives the close.
//
//   - the pointer read (receiveShortfallPointer): the toast's second
//     line when the submit was short — the units still owed and where
//     the follow-up waits; the honest gate reads zero, a negative, a
//     NaN and an infinity as the null (a full receipt points nowhere,
//     never a fake pointer, never a crash), and the pen's own truth
//     lands halves the same way the plan's units always have.
//   - the faces: the plan rides the submit (the pens' truth at the
//     press — the toast speaks what WAS submitted, never a later
//     render's guess), the toast's conditional description wearing the
//     follow-up door's own sky, and the honest silence (the old bare
//     toast byte retired — a full receipt passes no description).
//
// Every pin reads the SOURCE OF RECORD (source bytes, not memory) — the
// house rule since the verify scripts were born.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it, expect } from 'vitest';

import { receiveShortfallPointer } from '@/lib/po-receive';

const read = (p: string) => readFileSync(join(process.cwd(), p), 'utf8');

const LIB = 'src/lib/po-receive.ts';
const TAB = 'src/app/(shell)/tabs/purchase-orders-tab.tsx';
const libSrc = read(LIB);
const tabSrc = read(TAB);

describe('the pointer\u2019s read (v2.428.0) \u2014 the shortfall\u2019s own second line', () => {
  it('the short day speaks the pointer \u2014 the units still owed, where the follow-up waits', () => {
    expect(receiveShortfallPointer(18)).toBe(
      "18 units still owed \u2014 the follow-up waits on the order's face"
    );
  });

  it('the singular reads honest \u2014 one unit short is one unit still owed', () => {
    expect(receiveShortfallPointer(1)).toBe(
      "1 unit still owed \u2014 the follow-up waits on the order's face"
    );
  });

  it('the pen\u2019s own truth \u2014 a half lands too (the plan\u2019s units law, whole numbers and halves alike)', () => {
    expect(receiveShortfallPointer(2.5)).toBe(
      "2.5 units still owed \u2014 the follow-up waits on the order's face"
    );
  });

  it('THE HONEST SILENCE \u2014 zero points nowhere (a full receipt is not short)', () => {
    expect(receiveShortfallPointer(0)).toBeNull();
  });

  it('the negative silence \u2014 a debt that does not exist points nowhere', () => {
    expect(receiveShortfallPointer(-3)).toBeNull();
  });

  it('THE GRACE \u2014 a number that is not one reads the null, never a crash', () => {
    expect(receiveShortfallPointer(Number.NaN)).toBeNull();
    expect(receiveShortfallPointer(Number.POSITIVE_INFINITY)).toBeNull();
    expect(receiveShortfallPointer(Number.NEGATIVE_INFINITY)).toBeNull();
  });
});

describe('the faces (v2.428.0) \u2014 the plan rides the submit, the toast points, pinned to the source', () => {
  it('the lib\u2019s one home \u2014 the pointer read lives in po-receive', () => {
    expect(libSrc).toContain('THE TOAST POINTS AT THE FOLLOW-UP');
    expect(libSrc).toContain(
      'export function receiveShortfallPointer(shortUnits: number): string | null {'
    );
    expect(libSrc).toContain("the follow-up waits on the order's face");
  });

  it('the dialog reads the ONE home \u2014 the widened import and the type ride', () => {
    expect(tabSrc).toContain(
      "import { buildReceiveInitials, receiveRowState, describeReceivePlan, drillLineState, describeDrillProgress, receiveMaker, receiveSuccessVoice, receiveShortfallPointer, drillFollowUpDoor } from '@/lib/po-receive';"
    );
    expect(tabSrc).toContain("import type { ReceivePlan } from '@/lib/po-receive';");
  });

  it('THE PLAN RIDES THE SUBMIT \u2014 the pens\u2019 truth at the press travels with the mutation', () => {
    expect(tabSrc).toContain('mutationFn: (submitPlan: ReceivePlan) => {');
    expect(tabSrc).toContain(
      'receiveMutation.mutate(describeReceivePlan(purchaseOrder.items, receivedQtys));'
    );
    expect(tabSrc).toContain('receivedItems.length === 0 || submitPlan.empty');
  });

  it('the toast points \u2014 the conditional description wearing the door\u2019s own sky', () => {
    expect(tabSrc).toContain('const pointer = receiveShortfallPointer(submitPlan.shortUnits);');
    expect(tabSrc).toContain(
      'pointer ? { description: <span className="text-sky-700 dark:text-sky-400">{pointer}</span> } : undefined'
    );
  });

  it('THE HONEST SILENCE \u2014 the old bare toast byte is retired (a full receipt passes no description)', () => {
    expect(tabSrc).not.toContain('toast.success(receiveSuccessVoice(maker));');
  });
});
