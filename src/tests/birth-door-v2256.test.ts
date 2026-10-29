// v2.256.0 — the birth's door + the lens's ear.
//
//   - THE BIRTH'S DOOR: the org PO drill's birth strip (v2.249's words)
//     grows the words' own control — "open the sheet" hands the parent
//     the SheetDrill's target shape ({id, storeName, status}) read from
//     data the wire ALREADY carries (the sheet rides the birth, the
//     store name rides the PO's own store). ONE drill at a time: the
//     PO drill closes as the sheet drill opens (the reading moves, the
//     roster's door reopens). A face without the callback keeps the
//     words — the door is additive, never assumed.
//   - THE LENS'S EAR: one home for the keyboard's law across the three
//     lens faces — Escape stands the lens down, a dialog's Escape
//     belongs to the dialog (the guard reads the live tree at the
//     moment of the keypress), the ear sleeps while the lens is down.
//   - THE FOCUS'S HONESTY: the band chips' rings speak only to
//     keyboards — focus: becomes focus-visible: across all six chips
//     (a mouse press leaves no ring; the keyboard still sees where it
//     is). The door wears the same law (violet, its own family).
//
// Every pin reads the SOURCE OF RECORD (source bytes, not memory).

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it, expect } from 'vitest';

const read = (p: string) => readFileSync(join(process.cwd(), p), 'utf8');

const drill = read('src/components/org/po-drill.tsx');
const ledger = read('src/components/org/po-ledger.tsx');
const branch = read('src/app/(shell)/tabs/purchase-orders-tab.tsx');
const suppliers = read('src/app/(shell)/tabs/suppliers-tab.tsx');
const ear = read('src/lib/use-lens-escape.ts');

describe('the birth\u2019s door \u2014 the drill\u2019s words grow the affordance (v2.256.0)', () => {
  it('the door is additive \u2014 PoDrill carries an optional onOpenSheet, the words keep their truth without it', () => {
    expect(drill).toContain(
      'export function PoDrill({ target, onClose, onOpenSheet }: { target: PoDrillTarget; onClose: () => void; onOpenSheet?: (t: { id: string; storeName: string; status: string }) => void }) {'
    );
    expect(drill).toContain('{onOpenSheet && birthTarget && (');
    expect(drill).toContain('data-testid="po-drill-birth-door"');
  });

  it('the door hands the SheetDrill\u2019s own target shape \u2014 captured once, no non-null assertions (the narrowing dies at the arrow)', () => {
    expect(drill).toContain(
      'const birthTarget = data?.originStockTake && data.store'
    );
    expect(drill).toContain('? { id: data.originStockTake.id, storeName: data.store.name, status: data.originStockTake.status }');
    expect(drill).toContain('onClick={() => onOpenSheet(birthTarget)}');
  });

  it('the door\u2019s ring speaks only to keyboards \u2014 focus-visible, the violet family', () => {
    expect(drill).toContain('focus-visible:ring-2 focus-visible:ring-violet-500/60');
    expect(drill).toContain("open the sheet");
  });

  it('the ledger mounts the sheet drill \u2014 the SheetDrill import joins the drill\u2019s room', () => {
    expect(ledger).toContain("import { SheetDrill, csvCell, type SheetDrillTarget } from './sheet-drill';");
    expect(ledger).toContain('const [sheetDrill, setSheetDrill] = useState<SheetDrillTarget>(null);');
    expect(ledger).toContain('{sheetDrill && <SheetDrill target={sheetDrill} onClose={() => setSheetDrill(null)} />}');
  });

  it('ONE drill at a time \u2014 the door closes the PO drill as the sheet opens', () => {
    expect(ledger).toContain('onOpenSheet={(t) => {');
    expect(ledger).toContain('setDrill(null);');
    expect(ledger).toContain('setSheetDrill(t);');
  });
});

describe('the lens\u2019s ear \u2014 Escape stands the lens down (v2.256.0)', () => {
  it('the one home \u2014 the ear sleeps while the lens is down, wakes only for Escape', () => {
    expect(ear).toContain('if (!pressed) return; // the ear sleeps while the lens is down');
    expect(ear).toContain("if (e.key !== 'Escape') return;");
    expect(ear).toContain("window.addEventListener('keydown', onKey);");
    expect(ear).toContain("window.removeEventListener('keydown', onKey);");
  });

  it('the dialog guard \u2014 a dialog\u2019s Escape belongs to the dialog, read at the moment of the keypress', () => {
    expect(ear).toContain("if (document.querySelector('[role=\"dialog\"]')) return;");
  });

  it('the org face wears the ear \u2014 the same lift the clear buttons speak', () => {
    expect(ledger).toContain("import { useLensEscape } from '@/lib/use-lens-escape';");
    expect(ledger).toContain("useLensEscape(bandLens !== 'ALL', () => setBandLens('ALL'));");
    expect(ledger).toContain('Escape stands the lens down"');
  });

  it('the branch face wears the ear \u2014 the words ride the disclosure title', () => {
    expect(branch).toContain("import { useLensEscape } from '@/lib/use-lens-escape';");
    expect(branch).toContain("useLensEscape(bandLens !== 'ALL', () => setBandLens('ALL'));");
    expect(branch).toContain('Escape stands the lens down"');
  });

  it('the supplier face wears the ear \u2014 the third face, the same one home', () => {
    expect(suppliers).toContain("import { useLensEscape } from '@/lib/use-lens-escape';");
    expect(suppliers).toContain("useLensEscape(bandLens !== 'ALL', () => setBandLens('ALL'));");
    expect(suppliers).toContain('Escape stands the lens down"');
  });
});

describe('the focus\u2019s honesty \u2014 the rings speak only to keyboards (v2.256.0)', () => {
  it('the mouse wart is gone \u2014 no bare focus:ring-2 focus:ring-sky-500/40 survives on the chips', () => {
    expect(ledger).not.toContain('focus:ring-2 focus:ring-sky-500/40');
    expect(branch).not.toContain('focus:ring-2 focus:ring-sky-500/40');
    expect(suppliers).not.toContain('focus:ring-2 focus:ring-sky-500/40');
  });

  it('the chips wear focus-visible \u2014 every one of them (the ledger\u2019s rungs joined the law)', () => {
    const count = (s: string) => (s.match(/focus-visible:ring-2 focus-visible:ring-sky-500\/40/g) ?? []).length;
    expect(count(ledger)).toBe(5); // 2 band + 2 status rungs + 1 origin rung
    expect(count(branch)).toBe(2); // the houses + the silence
    expect(count(suppliers)).toBe(2);
  });
});
