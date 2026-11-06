// THE DRILL'S PROGRESS SUITE (v2.419.0) — the drill wears the receive's
// truth.
//
//   - drillLineState: THE DRILL'S MIRROR LAW — the committed truth read
//     through the receive's own rule (receiveRowState with the pen at
//     rest), so the drill and the dialog can never disagree about what
//     "partial" means: full lines speak "fully received" in the emerald
//     family, short lines speak "short by N units" in the amber family
//     (the shortfall COUNTED), open lines speak "nothing received yet".
//   - describeDrillProgress: the order card's truth — units and lines,
//     the shortfall summed, `complete` only when every line is closed
//     (an empty order can never speak as complete).
//   - the faces: the drill's rows wear the row family, the meters carry
//     the dialog's own span anatomy (role=img + the aria answer), and
//     the bare "Partial" word is retired (source pins — the house rule).
//
// Every pin reads the SOURCE OF RECORD (source bytes, not memory).

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it, expect } from 'vitest';

import {
  drillLineState,
  describeDrillProgress,
  receiveRowState,
  type ReceivePlanLine,
} from '@/lib/po-receive';

const read = (p: string) => readFileSync(join(process.cwd(), p), 'utf8');

const TAB = 'src/app/(shell)/tabs/purchase-orders-tab.tsx';
const tabSrc = read(TAB);
const libSrc = read('src/lib/po-receive.ts');

const line = (id: string, quantity: number, receivedQty: number): ReceivePlanLine => ({
  id,
  quantity,
  receivedQty,
});

describe('drillLineState (v2.419.0) — the mirror law, one read', () => {
  it('a fully received line speaks "fully received" in the emerald family', () => {
    const s = drillLineState(line('a', 50, 50));
    expect(s.tone).toBe('full');
    expect(s.words).toBe('fully received');
    expect(s.shortfall).toBe(0);
    expect(s.pct).toBe(100);
    expect(s.rowClass).toContain('border-l-emerald-500');
  });

  it('a short line speaks its shortfall COUNTED, in the amber family', () => {
    const s = drillLineState(line('a', 30, 12));
    expect(s.tone).toBe('short');
    expect(s.words).toBe('short by 18 units');
    expect(s.shortfall).toBe(18);
    expect(s.pct).toBe(40);
    expect(s.rowClass).toContain('border-l-amber-500');
  });

  it('the singular shortfall counts one unit honestly', () => {
    expect(drillLineState(line('a', 2, 1)).words).toBe('short by 1 unit');
  });

  it('an untouched line speaks "nothing received yet" with no alarm paint', () => {
    const s = drillLineState(line('a', 80, 0));
    expect(s.tone).toBe('open');
    expect(s.words).toBe('nothing received yet');
    expect(s.shortfall).toBe(0);
    expect(s.pct).toBe(0);
    expect(s.rowClass).toContain('border-l-transparent');
  });

  it('a wire that over-received reads as full, never negative or over-100', () => {
    const s = drillLineState(line('a', 50, 60));
    expect(s.tone).toBe('full');
    expect(s.pct).toBe(100);
  });

  it('a zero-quantity line never divides by zero', () => {
    const s = drillLineState(line('a', 0, 0));
    expect(s.tone).toBe('full');
    expect(s.pct).toBe(0);
  });
});

describe('THE DRILL\u2019S MIRROR LAW — the drill IS the receive at rest', () => {
  it('the committed row answers exactly what receiveRowState(…, \u20190\u2019) answers', () => {
    for (const [qty, rec] of [[50, 50], [30, 12], [80, 0], [50, 60], [0, 0], [7, 3], [1, 1]] as const) {
      const item = line('x', qty, rec);
      const drill = drillLineState(item);
      const rest = receiveRowState(item, '0');
      expect(drill.tone === 'full').toBe(rest.isClosed);
      expect(drill.pct).toBe(rest.pct);
      expect(drill.shortfall).toBe(rest.isShort ? rest.shortfall : item.receivedQty > 0 ? rest.remaining : 0);
    }
  });

  it('a dialog committing a short receive speaks the same arithmetic the drill then wears', () => {
    // the dialog's live face (the pen at 12 of the 18 remaining) and the
    // drill's face AFTER that commit read the SAME rule at different
    // clocks: the mid-fill pen owes 6 more (18 remaining − 12 receiving),
    // the committed row owes 18 (the units never received)
    const item = line('a', 30, 12);
    const dialogFace = receiveRowState(item, '12');
    const drillFace = drillLineState(item);
    expect(dialogFace.isShort).toBe(true);
    expect(dialogFace.shortfall).toBe(6);
    expect(drillFace.shortfall).toBe(18);
    expect(drillFace.words).toContain('18');
  });
});

describe('describeDrillProgress (v2.419.0) — the order card\u2019s truth', () => {
  it('counts units, lines and the summed shortfall over the committed facts', () => {
    const p = describeDrillProgress([line('a', 200, 200), line('b', 300, 300), line('c', 30, 12)]);
    expect(p.receivedUnits).toBe(512);
    expect(p.orderedUnits).toBe(530);
    expect(p.pct).toBe(97);
    expect(p.fullLines).toBe(2);
    expect(p.shortLines).toBe(1);
    expect(p.openLines).toBe(1);
    expect(p.shortUnits).toBe(18);
    expect(p.complete).toBe(false);
  });

  it('speaks complete ONLY when every line is closed (never an empty order)', () => {
    expect(describeDrillProgress([line('a', 50, 50), line('b', 12, 12)]).complete).toBe(true);
    expect(describeDrillProgress([]).complete).toBe(false);
    expect(describeDrillProgress([]).pct).toBe(0);
  });

  it('rounds the pct honestly (512 of 530 is 97, not 96.6…)', () => {
    expect(describeDrillProgress([line('a', 530, 512)]).pct).toBe(97);
  });
});

describe('THE WIRE\u2019S GRACE (v2.419.0) — a string arrival can never lie', () => {
  it('a Prisma-Decimal-as-string line reads honest numbers (the concat wound, closed)', () => {
    // the detail wire shipped quantity/receivedQty as JSON strings
    // (Prisma Decimal's face) — `'12' + 0` concat clamped the meter to a
    // lying 100 on a short line. The grace coerces; the meter speaks 40.
    const item = { id: 'a', quantity: '30' as unknown as number, receivedQty: '12' as unknown as number };
    const s = drillLineState(item);
    expect(s.tone).toBe('short');
    expect(s.words).toBe('short by 18 units');
    expect(s.pct).toBe(40);
  });

  it('the order card\u2019s sums coerce too (no \u201c020030012 / 530\u201d on the card)', () => {
    const p = describeDrillProgress([
      { id: 'a', quantity: '200' as unknown as number, receivedQty: '200' as unknown as number },
      { id: 'b', quantity: '300' as unknown as number, receivedQty: '300' as unknown as number },
      { id: 'c', quantity: '30' as unknown as number, receivedQty: '12' as unknown as number },
    ]);
    expect(p.receivedUnits).toBe(512);
    expect(p.orderedUnits).toBe(530);
    expect(p.pct).toBe(97);
    expect(p.shortUnits).toBe(18);
  });

  it('the branch detail wire coerces its numbers at the boundary (source pin)', () => {
    const routeSrc = read('src/app/api/purchase-orders/[id]/route.ts');
    expect(routeSrc).toContain('quantity: Number(it.quantity),');
    expect(routeSrc).toContain('receivedQty: Number(it.receivedQty),');
    expect(routeSrc).toContain("THE WIRE'S NUMBERS");
  });

  it('the lib\u2019s own arithmetic coerces before any plus (the grace is one home)', () => {
    expect(libSrc).toContain('const ordered = Number(line.quantity);');
    expect(libSrc).toContain('const received = Number(line.receivedQty);');
    expect(libSrc).toContain('receivedUnits += Number(item.receivedQty);');
  });
});

describe('THE DRILL\u2019S FACES (v2.419.0) — one home, source-pinned', () => {
  it('the drill imports the receive lib\u2019s own reads (never a second copy)', () => {
    expect(tabSrc).toContain(
      "import { buildReceiveInitials, receiveRowState, describeReceivePlan, drillLineState, describeDrillProgress } from '@/lib/po-receive';",
    );
    expect(libSrc).toContain('export function drillLineState(item: ReceivePlanLine): DrillLineState {');
    expect(libSrc).toContain('receiveRowState(item, \'0\')');
  });

  it('the rows wear the family, the meter carries the aria answer, the words speak', () => {
    expect(tabSrc).toContain('data-testid="po-drill-line-row"');
    expect(tabSrc).toContain('data-testid="po-drill-line-words"');
    expect(tabSrc).toContain('role="img"');
    expect(tabSrc).toContain('% received`');
    expect(tabSrc).toContain('data-testid="po-drill-progress-voice"');
    expect(tabSrc).toContain('the order completes');
  });

  it('the bare "Partial" word is retired from the drill\u2019s row builder', () => {
    expect(tabSrc).not.toContain("const itemStatus =");
    expect(tabSrc).not.toContain('{itemStatus}');
  });

  it('the order card reads the ONE home (the hand-rolled pct is gone)', () => {
    expect(tabSrc).toContain('const drillProgress = describeDrillProgress(detail.items ?? []);');
    expect(tabSrc).not.toContain('const receivePct =');
  });
});
