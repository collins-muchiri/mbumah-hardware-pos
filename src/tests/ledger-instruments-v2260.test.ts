// v2.260.0 — the ledger's instruments.
//
//   - THE LEDGER'S INSTRUMENTS: the org procurement ledger grows the
//     metric rail — the branch roster's own law ported home (v2.259.0's
//     shape, the third surface of the family): the three metrics the
//     Performance card speaks (on time / arrived late / in flight), each
//     answering with its REAL count over the rows the window ALREADY
//     holds. A press narrows the view COMPOSED with the band house and
//     the needle (AND, never OR); the fetch never moves.
//   - THE WIRE'S HONEST GROWTH: the org wire selects createdAt (additive)
//     and the predicates read the SAME clock the branch roster's rows
//     carry — a rail count here and a card's rate cannot disagree by
//     reading different fields. orderDate stays the row's own day; the
//     metric reads createdAt (the one home's field, mirrored).
//   - THE COMBINED-EAR LAW, FOURTH SURFACE: the ledger wears TWO
//     narrowing lens instruments now, so it wears ONE useLensEscape with
//     the COMBINED press and the COMBINED lift — never two ears.
//   - THE HONEST EMPTY FACE: a pressed metric that empties the view
//     names itself (poMetricEmptyVoice — the branch roster's own law),
//     and the face's stand-down lifts all three (band + metric + needle).
//
// Every pin reads the SOURCE OF RECORD (source bytes, not memory).

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it, expect } from 'vitest';

const read = (p: string) => readFileSync(join(process.cwd(), p), 'utf8');

const ledger = read('src/components/org/po-ledger.tsx');
const route = read('src/app/api/org/purchase-orders/route.ts');
const lib = read('src/lib/po-metrics.ts');
const ear = read('src/lib/use-lens-escape.ts');
const orgDrill = read('src/components/org/po-drill.tsx');
const sheetDrill = read('src/components/org/sheet-drill.tsx');
const branch = read('src/app/(shell)/tabs/purchase-orders-tab.tsx');

describe('the ledger\u2019s instruments \u2014 the one home and the combined ear (v2.260.0)', () => {
  it('the rail reads the metrics\u2019 one home \u2014 the ledger imports the lib, never a copy', () => {
    expect(ledger).toContain("import {\n  poMetricPredicate,\n  poMetricVoice,\n  poMetricEmptyVoice,\n  poMetricFamily,\n  type PoMetricLens,\n} from '@/lib/po-metrics';");
    expect(lib).toContain('export function poMetricPredicate(kind: PoMetricKind, po: PoMetricShape): boolean {');
  });

  it('the TDZ law \u2014 metricLens declares BEFORE the ear that reads it', () => {
    const stateIdx = ledger.indexOf("const [metricLens, setMetricLens] = useState<PoMetricLens>('all');");
    const earIdx = ledger.indexOf('useLensEscape(bandLens');
    expect(stateIdx).toBeGreaterThan(-1);
    expect(earIdx).toBeGreaterThan(-1);
    expect(stateIdx).toBeLessThan(earIdx);
  });

  it('the single combined ear \u2014 ONE listener lifts both (the fourth surface of the shape)', () => {
    expect(ledger).toContain("useLensEscape(bandLens !== 'ALL' || metricLens !== 'all', () => {");
    expect(ledger).toContain("setBandLens('ALL');\n    setMetricLens('all');\n  });");
    // never two ears — the band-only call is gone
    expect(ledger).not.toContain("useLensEscape(bandLens !== 'ALL', () => setBandLens('ALL'));");
    // exactly one useLensEscape call on the face
    expect(ledger.match(/useLensEscape\(/g)?.length).toBe(1);
  });

  it('the counts read the rows, never the view \u2014 real numbers over the window', () => {
    expect(ledger).toContain('const metricCounts = useMemo(() => {');
    expect(ledger).toContain("if (poMetricPredicate('onTime', r)) c.onTime += 1;");
    expect(ledger).toContain("if (poMetricPredicate('late', r)) c.late += 1;");
    expect(ledger).toContain("if (poMetricPredicate('open', r)) c.open += 1;");
    // the counts read data.rows (the window), not shownRows (the view)
    const countsIdx = ledger.indexOf('const metricCounts = useMemo(() => {');
    const countsEnd = ledger.indexOf('}, [data]);', countsIdx);
    const countsBody = ledger.slice(countsIdx, countsEnd);
    expect(countsBody).toContain('for (const r of data.rows)');
    expect(countsBody).not.toContain('shownRows');
  });

  it('the composition order \u2014 band house, then metric, then needle (AND, never OR)', () => {
    expect(ledger).toContain('const lensed =');
    expect(ledger).toContain('const metricRows =');
    expect(ledger).toContain('metricLens === \'all\'\n        ? lensed\n        : lensed.filter((r) => poMetricPredicate(metricLens, r));');
    expect(ledger).toContain('if (!cleanNeedle) return metricRows;');
    // the deps carry the composition
    expect(ledger).toContain('}, [data, cleanNeedle, bandLens, metricLens]);');
  });
});

describe('the wire\u2019s honest growth \u2014 the metric clock rides the roster (additive)', () => {
  it('the route selects createdAt \u2014 the predicates\u2019 own field, the branch shape mirrored', () => {
    expect(route).toContain('createdAt: true,');
    expect(route).toContain('createdAt: po.createdAt.toISOString(),');
  });

  it('the row type carries createdAt \u2014 the wire is the single source of the row\u2019s truth', () => {
    expect(ledger).toContain('createdAt: string;');
  });

  it('orderDate stays the row\u2019s own day \u2014 the additive law left the existing voices alone', () => {
    expect(route).toContain('orderDate: po.orderDate.toISOString(),');
    expect(ledger).toContain('orderDate: string;');
  });
});

describe('the rail\u2019s face \u2014 the family chips and the ledger\u2019s own sky', () => {
  it('the rail and its chips wear honest addresses + the toggle law', () => {
    expect(ledger).toContain('data-testid="po-ledger-metric-row"');
    expect(ledger).toContain('data-testid={`po-ledger-metric-${k}`}');
    expect(ledger).toContain('aria-pressed={pressed}');
    expect(ledger).toContain("onClick={() => setMetricLens(pressed ? 'all' : k)}");
  });

  it('the chips wear the metrics\u2019 own families \u2014 never a new palette', () => {
    expect(ledger).toContain('const family = poMetricFamily(k);');
    expect(ledger).toContain('${pressed ? family.pressed : family.chip}');
    expect(ledger).toContain('focus-visible:ring-sky-500/40');
  });

  it('the titles speak the window\u2019s voice \u2014 the real counts, the honest absence', () => {
    expect(ledger).toContain("on this window answers the rule; a press narrows the view (the fetch stays)`}");
    expect(ledger).toContain("the metrics' own rail \u2014 the numbers' real counts over the window's rows; a press narrows the view composed with the band house and the needle (AND, never OR)");
  });
});

describe('the honest empty face \u2014 the metric names itself when it empties the view', () => {
  it('the face grows the metric\u2019s own voice \u2014 the branch roster\u2019s law ported home', () => {
    expect(ledger).toContain("`no order on this window ${poMetricEmptyVoice(metricLens)} under the pressed filters \u2014 lift the metric, a band house or clear the finder and the orders return.`");
    expect(ledger).toContain("'the lens narrowed the window to nothing \u2014 lift a band house or clear the finder and the orders return.'");
  });

  it('the stand-down lifts all three \u2014 band, metric, needle (the words\u2019 own promise)', () => {
    expect(ledger).toContain("onClick={() => { setBandLens('ALL'); setMetricLens('all'); setNeedle(''); }}");
    expect(ledger).toContain('stand the lens down, stand the metric down and clear the finder');
  });

  it('the pipe-empty face stays the pipe\u2019s \u2014 the metric never empties the PIPE', () => {
    expect(ledger).toContain('no purchase order answers this filter');
  });
});

describe('the ancestors untouched \u2014 the growth left the family\u2019s own bytes alone', () => {
  it('the ear\u2019s own bytes unchanged \u2014 the guard and the symmetry stay (v2.256.0 + v2.257.0)', () => {
    expect(ear).toContain("if (e.key !== 'Escape') return;");
    expect(ear).toContain("if (document.querySelector('[role=\"dialog\"]')) return;");
    expect(ear).toContain("if (document.querySelectorAll('[role=\"dialog\"]').length > 1) return;");
    expect(ear).toContain('window.addEventListener(\'keydown\', onKey);');
    expect(ear).toContain('window.removeEventListener(\'keydown\', onKey);');
  });

  it('the band rail\u2019s own bytes unchanged \u2014 the houses keep their row', () => {
    expect(ledger).toContain('data-testid="po-ledger-band-row"');
    expect(ledger).toContain('data-testid={`po-ledger-band-${b}`}');
    expect(ledger).toContain('data-testid="po-ledger-band-silent"');
  });

  it('the branch rail keeps its own addresses \u2014 two rails, one lib, no cross-talk', () => {
    expect(branch).toContain('data-testid="branch-po-metric-rail"');
    expect(branch).toContain('data-testid={`branch-po-metric-${k}`}');
    expect(branch).not.toContain('po-ledger-metric');
  });

  it('the export law unchanged \u2014 the finder and the metric narrow the reading, never the export', () => {
    expect(ledger).toContain('title="the whole window, one file \u2014 the finder narrows the reading, never the export"');
    expect(ledger).toContain('data-testid="po-ledger-export"');
    expect(ledger).toContain("r.originStockTakeId != null ? 'sheet' : 'hand'");
  });

  it('the drills keep their rungs \u2014 the ladder bytes stay (v2.257.0)', () => {
    expect(ledger).toContain("from '@/lib/use-lens-escape';");
    // the ledger mounts the drills; the rungs live in the drills' own bodies
    expect(ledger).toContain('<PoDrill');
    expect(ledger).toContain('<SheetDrill');
    expect(orgDrill).toContain('useDrillEscape(onClose);');
    expect(sheetDrill).toContain('useDrillEscape(onClose);');
  });
});
