// v2.259.0 — the branch's instruments + the branch's door.
//
//   - THE BRANCH'S INSTRUMENTS: the branch purchase-order roster grows
//     the metric rail — the supplier roster's own law ported home: the
//     three metrics the Performance card speaks (on time / arrived late
//     / in flight), each answering with its REAL count over the rows the
//     page ALREADY holds. A press narrows the view COMPOSED with the
//     band (AND, never OR) and the needle; the fetch never moves; the
//     face's own clear-all lifts it too.
//   - THE COMBINED-EAR LAW ON THE THIRD SURFACE: the branch face now
//     wears TWO narrowing instruments, so it wears ONE useLensEscape
//     with the COMBINED press and the COMBINED lift — never two ears
//     (the live walk caught the race twice on the supplier's face).
//   - THE BRANCH'S DOOR: the detail's birth strip grows the org drill's
//     own door — the parent's onOpenSheet hand closes the detail and
//     opens the SheetDrill (one dialog at a time, the ladder's shape);
//     the store's name rides the detail's fresh wire, additive +
//     optional, the honest absence on a stale cached row.
//   - THE OD LAW (this round's lesson): a byte's verdict is spoken by
//     od, md5 or a match COUNT — never by an eyeball (the transport
//     layer eats [m-shaped byte pairs; the eye sees corruption that
//     is not there). These pins read bytes the honest way.
//
// Every pin reads the SOURCE OF RECORD (source bytes, not memory).

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it, expect } from 'vitest';

const read = (p: string) => readFileSync(join(process.cwd(), p), 'utf8');

const tab = read('src/app/(shell)/tabs/purchase-orders-tab.tsx');
const lib = read('src/lib/po-metrics.ts');
const ear = read('src/lib/use-lens-escape.ts');
const drill = read('src/components/org/sheet-drill.tsx');
const orgDrill = read('src/components/org/po-drill.tsx');
const suppliers = read('src/app/(shell)/tabs/suppliers-tab.tsx');
const detailRoute = read('src/app/api/purchase-orders/[id]/route.ts');
const apiLib = read('src/lib/api.ts');

describe('the branch\u2019s instruments \u2014 the one home and the combined ear (v2.259.0)', () => {
  it('the rail reads the metrics\u2019 one home \u2014 the tab imports the lib, never a copy (the import grew the why voice + the kind at v2.262.0 \u2014 the branch\u2019s answer rides the same home)', () => {
    expect(tab).toContain("import {\n  poMetricPredicate,\n  poMetricVoice,\n  poMetricEmptyVoice,\n  poMetricFamily,\n  poMetricWhyVoice,\n  type PoMetricKind,\n  type PoMetricLens,\n} from '@/lib/po-metrics';");
    expect(lib).toContain('export function poMetricPredicate(kind: PoMetricKind, po: PoMetricShape): boolean {');
  });

  it('the rung\u2019s state rides the view \u2014 declared BEFORE the ear that reads it (the TDZ law)', () => {
    const declared = tab.indexOf("const [metricLens, setMetricLens] = useState<PoMetricLens>('all');");
    const earCall = tab.indexOf('useLensEscape(bandLens');
    expect(declared).toBeGreaterThan(-1);
    expect(earCall).toBeGreaterThan(-1);
    expect(declared).toBeLessThan(earCall);
  });

  it('the surface wears ONE ear with the COMBINED press and the COMBINED lift \u2014 never two', () => {
    expect(tab).toContain('useLensEscape(bandLens !== \'ALL\' || metricLens !== \'all\', () => {');
    expect(tab).toContain("setBandLens('ALL');\n    setMetricLens('all');\n  });");
    expect(tab.match(/useLensEscape\(/g)?.length).toBe(1);
  });

  it('the metrics\u2019 own counts \u2014 REAL numbers over the page\u2019s rows, one predicate each', () => {
    expect(tab).toContain("onTime: purchaseOrders.filter((po) => poMetricPredicate('onTime', po)).length,");
    expect(tab).toContain("late: purchaseOrders.filter((po) => poMetricPredicate('late', po)).length,");
    expect(tab).toContain("open: purchaseOrders.filter((po) => poMetricPredicate('open', po)).length,");
  });

  it('the memos compose the supplier\u2019s own way \u2014 band first, then metric, then needle, then sort', () => {
    const band = tab.indexOf('const bandOrders = useMemo(');
    const lensed = tab.indexOf('const lensedOrders = useMemo(');
    const sorted = tab.indexOf('const sortedPOs = useMemo(');
    expect(band).toBeGreaterThan(-1);
    expect(lensed).toBeGreaterThan(band);
    expect(sorted).toBeGreaterThan(lensed);
    expect(tab).toContain('bandOrders.filter((po) => poMetricPredicate(metricLens, po))');
    expect(tab).toContain('[bandOrders, metricLens]');
    expect(tab).toContain('[lensedOrders, search, sortField, sortDir]');
  });

  it('the face\u2019s own clear-all lifts BOTH instruments \u2014 and hasActiveFilters reads both', () => {
    expect(tab).toContain("setBandLens('ALL');\n    setMetricLens('all');\n  };");
    expect(tab).toContain("dateFrom || dateTo || bandLens !== 'ALL' || metricLens !== 'all';");
  });
});

describe('the rail\u2019s face \u2014 the chips, the families, the honest empty (v2.259.0)', () => {
  it('the rail mounts beside the band row \u2014 three kinds, real counts, per-kind doors', () => {
    expect(tab).toContain('data-testid="branch-po-metric-rail"');
    expect(tab).toContain("(['onTime', 'late', 'open'] as const).map((k) => {");
    expect(tab).toContain('data-testid={`branch-po-metric-${k}`}');
  });

  it('a press is honest \u2014 aria-pressed, the family\u2019s own colours, the count spoken', () => {
    expect(tab).toContain('aria-pressed={pressed}');
    expect(tab).toContain('const family = poMetricFamily(k);');
    expect(tab).toContain('${pressed ? family.pressed : family.chip}');
    expect(tab).toContain('{poMetricVoice(k)} <span className="opacity-70">{n}</span>');
  });

  it('the rail\u2019s rings stay the branch\u2019s own sky \u2014 keyboards only (focus-visible)', () => {
    expect(tab).toContain('focus-visible:ring-sky-500/40 ${pressed ? family.pressed : family.chip}');
  });

  it('the empty face names the pressed metric and stands it down \u2014 never a bare silence', () => {
    expect(tab).toContain('`No order on this page ${poMetricEmptyVoice(metricLens)}`');
    expect(tab).toContain('data-testid="branch-po-metric-clear"');
    expect(tab).toContain('stand the metric down');
  });
});

describe('the branch\u2019s door \u2014 the birth strip opens the sheet (v2.259.0)', () => {
  it('the detail grows the optional hand \u2014 a face without the callback keeps the plain strip', () => {
    expect(tab).toContain('onOpenSheet?: (t: { id: string; storeName: string; status: string }) => void;');
  });

  it('the door\u2019s address is honest \u2014 the store\u2019s name rides the FRESH wire, or no door', () => {
    expect(tab).toContain('detail?.originStockTake && detail.store?.name');
    expect(tab).toContain('{ id: detail.originStockTake.id, storeName: detail.store.name, status: detail.originStockTake.status }');
  });

  it('the door wears the org\u2019s own bytes \u2014 violet family, the arrow, the words', () => {
    expect(tab).toContain('data-testid="po-detail-birth-door"');
    expect(tab).toContain('<ArrowUpRight className="h-3 w-3" aria-hidden="true" />');
    expect(tab).toContain("the detail's reading moves to the sheet that birthed this order (this detail closes; the roster's door reopens it)");
    expect(tab).toContain('focus-visible:ring-violet-500/60');
  });

  it('the parent\u2019s hand \u2014 the detail closes BEFORE the sheet opens, the drill rides the rung', () => {
    const close = tab.indexOf('setDetailOpen(false);\n          setSheetDrill(t);');
    expect(close).toBeGreaterThan(-1);
    expect(tab).toContain('{sheetDrill && <SheetDrill target={sheetDrill} onClose={() => setSheetDrill(null)} />}');
  });

  it('the wire carries the store \u2014 the detail include and the type, additive + optional', () => {
    expect(detailRoute).toContain('store: { select: { id: true, name: true, code: true } },');
    expect(apiLib).toContain('store?: { id: string; name: string; code?: string | null } | null;');
  });
});

describe('the ancestors untouched \u2014 one home, never a copy (v2.259.0)', () => {
  it('the ear\u2019s home keeps both rungs \u2014 the lens\u2019s ear and the ladder', () => {
    expect(ear).toContain('export function useLensEscape(pressed: boolean, onClear: () => void): void {');
    expect(ear).toContain('export function useDrillEscape(onClose: () => void): void {');
  });

  it('the supplier\u2019s combined ear keeps its bytes \u2014 the law\u2019s first surface', () => {
    expect(suppliers).toContain("const [metricLens, setMetricLens] = useState<PoMetricLens>('all');");
    expect(suppliers).toContain("bandLens !== 'ALL' || metricLens !== 'all',");
    expect(suppliers).toContain("() => { setBandLens('ALL'); setMetricLens('all'); }");
  });

  it('the org drill\u2019s door keeps its bytes \u2014 the law\u2019s original surface', () => {
    expect(orgDrill).toContain('data-testid="po-drill-birth-door"');
    expect(orgDrill).toContain('onOpenSheet?: (t: { id: string; storeName: string; status: string }) => void');
  });

  it('the sheet drill\u2019s contract keeps its shape \u2014 the door\u2019s own door', () => {
    expect(drill).toContain('export type SheetDrillTarget = { id: string; storeName: string; status: string } | null;');
    expect(drill).toContain('useDrillEscape(onClose);');
  });
});
