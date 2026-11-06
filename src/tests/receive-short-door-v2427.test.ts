// THE SHORTFALL'S OWN DOOR SUITE (v2.427.0) — THE ARC'S EIGHTH WORD:
// the drill wears the follow-up, the receipt wears the day.
//
//   - the follow-up read (drillFollowUpDoor): the door exists only when
//     the order OWES (short lines counted — a whole order's open lines
//     are the plan, not a debt) and the maker carries a real phone —
//     never a fake door, never a dead dial, never a door on an order
//     that owes nothing. The words carry who to chase and what is owed;
//     the title names the day's contact when the wire carries one.
//   - the day strip: the receive dialog stops being day-blind — the
//     expected day's voice (the v2.418 one home, the roster cell's own
//     rule) rides the header under the maker chip, and the tone's shade
//     is the metric families' own (poExpectedDayFamily — never a new
//     palette). A wire without a day stays silent.
//   - the faces: the drill's pill (the sky census family the receipt's
//     own call door taught), the day strip's bytes, and the one-home
//     import widened.
//
// Every pin reads the SOURCE OF RECORD (source bytes, not memory) — the
// house rule since the verify scripts were born.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it, expect } from 'vitest';

import { receiveMaker, describeDrillProgress, drillFollowUpDoor } from '@/lib/po-receive';

const read = (p: string) => readFileSync(join(process.cwd(), p), 'utf8');

const LIB = 'src/lib/po-receive.ts';
const TAB = 'src/app/(shell)/tabs/purchase-orders-tab.tsx';
const libSrc = read(LIB);
const tabSrc = read(TAB);

// the day's maker, the same read the dialog and the drill share
const MAKER = receiveMaker({
  name: 'AkzoNobel Kenya (Dulux)',
  phone: '0207654323',
  contactPerson: 'Priti Sharma',
});

// PO-3's own committed shape (the seed's partial face): two full lines
// and one short — the drill's own arithmetic builds the progress.
const PO3_LINES = [
  { id: 'l1', quantity: 200, receivedQty: 200 },
  { id: 'l2', quantity: 300, receivedQty: 300 },
  { id: 'l3', quantity: 30, receivedQty: 12 },
];
const PO3_PROGRESS = describeDrillProgress(PO3_LINES);

describe('the follow-up read (v2.427.0) — the door\u2019s honest answer', () => {
  it('the full door \u2014 who to chase, what is owed, the day\u2019s contact in the title', () => {
    expect(PO3_PROGRESS.shortLines).toBe(1);
    expect(PO3_PROGRESS.shortUnits).toBe(18);
    expect(drillFollowUpDoor(MAKER, PO3_PROGRESS)).toEqual({
      phone: '0207654323',
      title: "Call Priti Sharma \u2014 0207654323 \u2014 the shortfall's follow-up",
      words: 'Follow up with AkzoNobel Kenya (Dulux) \u2014 18 units short',
    });
  });

  it('the singular words \u2014 one unit short reads the singular', () => {
    const progress = describeDrillProgress([{ id: 'l', quantity: 10, receivedQty: 9 }]);
    const door = drillFollowUpDoor(MAKER, progress);
    expect(door?.words).toBe('Follow up with AkzoNobel Kenya (Dulux) \u2014 1 unit short');
  });

  it('the title\u2019s two faces \u2014 the maker without a contact keeps the honest silence', () => {
    const door = drillFollowUpDoor(
      receiveMaker({ name: 'Bamburi Cement Ltd', phone: '0700000000', contactPerson: null }),
      PO3_PROGRESS
    );
    expect(door).not.toBeNull();
    expect(door?.title).toBe("Call the maker \u2014 0700000000 \u2014 the shortfall's follow-up");
  });

  it('the whole order\u2019s silence \u2014 open lines are the plan, not a debt (no door)', () => {
    const progress = describeDrillProgress([
      { id: 'l1', quantity: 10, receivedQty: 0 },
      { id: 'l2', quantity: 5, receivedQty: 5 },
    ]);
    expect(progress.shortLines).toBe(0);
    expect(progress.openLines).toBe(1);
    expect(drillFollowUpDoor(MAKER, progress)).toBeNull();
  });

  it('the no-phone absence \u2014 a maker without a number never wears a dead dial', () => {
    expect(drillFollowUpDoor(receiveMaker({ name: 'Bamburi Cement Ltd' }), PO3_PROGRESS)).toBeNull();
    expect(drillFollowUpDoor(receiveMaker({ name: 'Bamburi Cement Ltd', phone: '   ' }), PO3_PROGRESS)).toBeNull();
  });

  it('THE DIAL\u2019S GRACE \u2014 a whitespace phone is no dial even past the maker\u2019s own trim', () => {
    const raw = { name: 'Bamburi Cement Ltd', phone: '   ', contactPerson: null };
    expect(receiveMaker(raw)?.phone).toBeNull();
    // the door defends the same law when a caller arrives with the
    // un-trimmed maker (belt and braces \u2014 one law, two homes)
    expect(drillFollowUpDoor({ name: 'Bamburi Cement Ltd', phone: '   ', contactPerson: null }, PO3_PROGRESS)).toBeNull();
  });

  it('the no-maker absence \u2014 the null maker keeps the card silent', () => {
    expect(drillFollowUpDoor(null, PO3_PROGRESS)).toBeNull();
  });
});

describe('the day strip (v2.427.0) \u2014 the receipt wears the day, pinned to the source', () => {
  it('the dialog reads the ONE home \u2014 the v2.418 voice with the live clock', () => {
    expect(tabSrc).toContain('const dayVoice = poExpectedDayVoice(purchaseOrder, new Date());');
  });

  it('the strip renders CONDITIONALLY \u2014 a wire without a day stays silent', () => {
    expect(tabSrc).toContain('{purchaseOrder.expectedDate && dayVoice.text && (');
  });

  it('the strip\u2019s bytes \u2014 the testid, the day named, the families\u2019 own shade', () => {
    expect(tabSrc).toContain('data-testid="receive-expected-day"');
    expect(tabSrc).toContain('expected {formatDate(purchaseOrder.expectedDate)}');
    expect(tabSrc).toContain('<span className={poExpectedDayFamily(dayVoice.tone)}>{dayVoice.text}</span>');
    expect(tabSrc).toContain('<CalendarDays className="h-3 w-3 text-muted-foreground" aria-hidden="true" />');
    // THE PAUSE FOR EYES — the middot separator rides aria-hidden (the
    // day's voice never runs into the date, in the DOM or on the face)
    expect(tabSrc).toContain('<span className="text-muted-foreground" aria-hidden="true">&middot;</span>');
  });

  it('the strip\u2019s own words \u2014 THE RECEIPT WEARS THE DAY rides the header comment', () => {
    expect(tabSrc).toContain('THE RECEIPT WEARS THE DAY');
  });
});

describe('the faces (v2.427.0) \u2014 the drill\u2019s pill and the one home, pinned to the source', () => {
  it('the lib\u2019s one home \u2014 the follow-up read lives in po-receive', () => {
    expect(libSrc).toContain("THE SHORTFALL'S OWN DOOR");
    expect(libSrc).toContain('export interface DrillFollowUp {');
    expect(libSrc).toContain('export function drillFollowUpDoor(');
    expect(libSrc).toContain("if (progress.shortLines <= 0) return null;");
  });

  it('the drill reads the ONE home \u2014 the widened import, the maker through receiveMaker', () => {
    expect(tabSrc).toContain(
      "import { buildReceiveInitials, receiveRowState, describeReceivePlan, drillLineState, describeDrillProgress, receiveMaker, receiveSuccessVoice, drillFollowUpDoor } from '@/lib/po-receive';"
    );
    expect(tabSrc).toContain('drillFollowUpDoor(receiveMaker(detail.supplier), drillProgress);');
  });

  it('the follow-up pill: the sky census family, the Phone icon, the tel: door, the words', () => {
    expect(tabSrc).toContain('data-testid="po-drill-followup-call"');
    expect(tabSrc).toContain('href={`tel:${drillFollowUp.phone}`}');
    expect(tabSrc).toContain('title={drillFollowUp.title}');
    expect(tabSrc).toContain('{drillFollowUp.words}');
    expect(tabSrc).toContain('bg-sky-100 px-2 py-0.5 text-[11px] font-semibold text-sky-800');
    expect(tabSrc).toContain('<Phone className="h-3 w-3" aria-hidden="true" />');
  });

  it('the pill renders CONDITIONALLY \u2014 the card stays silent when nothing is owed', () => {
    expect(tabSrc).toContain('{drillFollowUp && (');
    expect(tabSrc).toContain("THE SHORTFALL'S OWN DOOR");
  });
});
