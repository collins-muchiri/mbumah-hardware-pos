// v2.258.0 — the metrics' answer.
//
//   - THE METRICS' ANSWER: the supplier detail's Performance card has
//     always computed its rates from the same purchaseOrders array the
//     Orders roster holds — but the numbers were dead ends. This round
//     each drillable tile answers BY the orders behind it: a drill chip
//     opens the Orders sub-tab with the metric lens pressed, and the
//     roster narrows to exactly the rows wearing the number.
//   - THE ONE HOME: the predicates live in src/lib/po-metrics.ts — the
//     card's counts, the roster's filter and the rate math read the
//     same rule (a tile's % and its drill count cannot disagree). The
//     kinds: onTime (received, not after the expectation — the card's
//     own rule byte-matched), late (the received complement), open (in
//     flight: not cancelled, not received).
//   - THE COMPOSITION LAW: the metric lens narrows what the band lens
//     already answered (AND, never OR). The composed list keeps the
//     name the rows and badge read (lensedOrders); the band-only memo
//     becomes bandOrders — one reading, two instruments, the fetch
//     never moves.
//   - THE COMBINED EAR (the live walk's lesson, twice bitten): two
//     independent window listeners race — a discrete event's
//     synchronous flush retires the other ear before its turn in the
//     same Escape, so one press lifted one instrument and WHICH one
//     varied. The surface wears ONE listener with the combined lift:
//     one press, both instruments down, the view fully returns.
//   - THE STYLING'S HONESTY: the drill chips wear the tile's own family
//     (green on-time, rose late, blue in-flight) with focus-visible
//     rings; the roster's metric chip wears the pressed family and
//     speaks the composed count; the badge answers the composed
//     narrowing; the empty face names the metric and offers its own
//     clear beside the band's.
//
// Every pin reads the SOURCE OF RECORD (source bytes, not memory).

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it, expect } from 'vitest';

const read = (p: string) => readFileSync(join(process.cwd(), p), 'utf8');

const metrics = read('src/lib/po-metrics.ts');
const tab = read('src/app/(shell)/tabs/suppliers-tab.tsx');

describe('the one home \u2014 the metric predicates live in po-metrics (v2.258.0)', () => {
  it('the kinds and the one predicate \u2014 the card\u2019s own on-time rule, byte-matched', () => {
    expect(metrics).toContain("export type PoMetricKind = 'onTime' | 'late' | 'open';");
    expect(metrics).toContain('export function poMetricPredicate(kind: PoMetricKind, po: PoMetricShape): boolean {');
    // onTime keeps the card's rule: no expectation keeps the benefit of the doubt
    expect(metrics).toContain("if (kind === 'onTime') return expected == null || (created != null && created <= expected);");
    // late is the received complement — no row in both, no row in neither
    expect(metrics).toContain('return expected != null && created != null && created > expected; // late');
    // open is what fulfillment does not yet cover
    expect(metrics).toContain("if (kind === 'open') return po.status !== 'CANCELLED' && po.status !== 'RECEIVED';");
  });

  it('the voices and the family \u2014 the chip wears the tile\u2019s own colour, never a new palette', () => {
    expect(metrics).toContain("if (kind === 'onTime') return 'on time';");
    expect(metrics).toContain("if (kind === 'late') return 'arrived late';");
    expect(metrics).toContain("return 'in flight';");
    expect(metrics).toContain("chip: 'bg-green-50 text-green-700 ring-green-300/70");
    expect(metrics).toContain("chip: 'bg-rose-50 text-rose-700 ring-rose-300/70");
    expect(metrics).toContain("chip: 'bg-blue-50 text-blue-700 ring-blue-300/70");
  });

  it('the empty voice \u2014 the pressed metric that empties the view speaks honestly', () => {
    expect(metrics).toContain("if (kind === 'onTime') return 'is on time';");
    expect(metrics).toContain("return 'is still in flight';");
  });
});

describe('the card answers \u2014 the drill chips on the tiles (v2.258.0)', () => {
  it('the card carries the optional drill (additive, never assumed)', () => {
    expect(tab).toContain('onDrillToOrders?: (kind: PoMetricKind) => void');
    expect(tab).toContain('onDrillToOrders ? (');
  });

  it('the counts read the ONE home \u2014 a tile\u2019s % and its drill count cannot disagree', () => {
    expect(tab).toContain("const onTimeCount = purchaseOrders.filter((po) => poMetricPredicate('onTime', po)).length;");
    expect(tab).toContain("const lateCount = purchaseOrders.filter((po) => poMetricPredicate('late', po)).length;");
    expect(tab).toContain("const openCount = purchaseOrders.filter((po) => poMetricPredicate('open', po)).length;");
  });

  it('the drill chips speak the count and wear the family ring', () => {
    expect(tab).toContain('data-testid={`supplier-po-metric-drill-${kind}`}');
    expect(tab).toContain("title={`see the ${n} ${n === 1 ? 'order' : 'orders'} behind this number");
    expect(tab).toContain('focus-visible:ring-2 focus-visible:ring-offset-1 ${poMetricFamily(kind).chip}');
  });

  it('the tiles mount the chips \u2014 the two halves of the received set + the in-flight', () => {
    expect(tab).toContain("{drill('onTime', onTimeCount)}");
    expect(tab).toContain("{drill('late', lateCount)}");
    expect(tab).toContain("{drill('open', openCount)}");
  });
});

describe('the roster answers \u2014 the metric lens composes with the band lens (v2.258.0)', () => {
  it('the metric rung has its own state and the surface wears ONE combined ear \u2014 one press lifts both instruments', () => {
    expect(tab).toContain("const [metricLens, setMetricLens] = useState<PoMetricLens>('all');");
    expect(tab).toContain("bandLens !== 'ALL' || metricLens !== 'all',");
    expect(tab).toContain("() => { setBandLens('ALL'); setMetricLens('all'); }");
    // the supplier face's single-instrument byte is gone (the combined ear replaced it)
    expect(tab).not.toContain("useLensEscape(bandLens !== 'ALL', () => setBandLens('ALL'));");
  });

  it('the composition \u2014 bandOrders narrows by the house, lensedOrders by the metric (AND, never OR)', () => {
    expect(tab).toContain('const bandOrders = useMemo(');
    expect(tab).toContain('[purchaseOrders, bandLens]');
    expect(tab).toContain('const lensedOrders = useMemo(');
    expect(tab).toContain("metricLens === 'all'");
    expect(tab).toContain('bandOrders.filter((po) => poMetricPredicate(metricLens, po))');
    expect(tab).toContain('[bandOrders, metricLens]');
  });

  it('the metric chip wears the pressed family and answers the composed count', () => {
    expect(tab).toContain('data-testid="supplier-po-metric-row"');
    expect(tab).toContain('data-testid="supplier-po-metric-chip"');
    expect(tab).toContain('aria-pressed="true"');
    expect(tab).toContain("onClick={() => setMetricLens('all')}");
    expect(tab).toContain('${poMetricFamily(metricLens).pressed}');
  });

  it('the badge speaks the composed narrowing \u2014 and the v2.255.0 answers keep their bytes', () => {
    expect(tab).toContain("{metricLens !== 'all'");
    expect(tab).toContain('${lensedOrders.length} of ${purchaseOrders.length} orders');
    expect(tab).toContain('${purchaseOrders.length} orders');
  });

  it('the rows still draw the composed reading \u2014 the v2.255.0 map keeps its bytes', () => {
    expect(tab).toContain('{lensedOrders.map((po) => (');
  });

  it('the empty face names the metric \u2014 and the band voices keep their bytes', () => {
    expect(tab).toContain('? `No order on this roster ${poMetricEmptyVoice(metricLens)}`');
    expect(tab).toContain('No order on this roster keeps the silence');
    expect(tab).toContain('No order on this roster wears ${bandLens}');
    expect(tab).toContain('data-testid="supplier-po-metric-clear"');
    expect(tab).toContain("onClick={() => setMetricLens('all')}");
    // the band clear keeps its own bytes
    expect(tab).toContain('data-testid="supplier-po-band-clear"');
    expect(tab).toContain("onClick={() => setBandLens('ALL')}");
  });
});

describe('the drill turns the wheel \u2014 the controlled sub-tabs (v2.258.0)', () => {
  it('the detail tab is state \u2014 the drill switches to orders with the lens pressed', () => {
    expect(tab).toContain("const [detailTab, setDetailTab] = useState('info');");
    expect(tab).toContain('<Tabs value={detailTab} onValueChange={(v) => setDetailTab(v)}>');
    expect(tab).toContain("onDrillToOrders={(kind) => { setMetricLens(kind); setDetailTab('orders'); }}");
  });
});
