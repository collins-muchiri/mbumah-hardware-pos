// v2.254.0 — the branch's lens.
//
//   - THE BRANCH'S LENS: the branch purchase-order roster grows the band
//     rail — the org ledger's own lens ported to the branch's page (the
//     rows have carried bands since v2.252): four houses + the silent
//     absence, REAL counts over the rows the page ALREADY holds, a press
//     narrows the view composed with the search and the sort (the lens
//     first, then the needle, then the sort — the reading narrows, the
//     fetch never moves), the wire's rungs stay the wire's, and the
//     face's own clear-all lifts the lens too (hasActiveFilters reads
//     it, the empty face's words stay true).
//   - THE BIRTH'S DOT ON THE BRANCH FACE: the branch roster's birth chip
//     wears its aisle's band as the house's rail-coloured dot (the org
//     roster's own law from v2.253, one home).
//   - THE LENS-EMPTY'S LIFT (org ledger): the empty face grows its own
//     affordance — one control that stands the lens down AND clears the
//     finder (the words' own promise, now a button).
//
// Every pin reads the SOURCE OF RECORD (source bytes, not memory).

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it, expect } from 'vitest';

const read = (p: string) => readFileSync(join(process.cwd(), p), 'utf8');

const tab = read('src/app/(shell)/tabs/purchase-orders-tab.tsx');
const ledger = read('src/components/org/po-ledger.tsx');

describe('the branch\u2019s lens \u2014 the org\u2019s own law ported (v2.254.0)', () => {
  it('the row\u2019s band reads behind a membership check \u2014 a stranger string is the silence, never a guessed family', () => {
    expect(tab).toContain('const poRowBand = (po: PurchaseOrderListItem): CadenceBand | null => {');
    expect(tab).toContain("return b === 'fresh' || b === 'stale' || b === 'beyond' || b === 'never' ? b : null;");
  });

  it('the lens state rides the view \u2014 never the query key, never the fetch', () => {
    expect(tab).toContain("const [bandLens, setBandLens] = useState<'ALL' | CadenceBand | 'silent'>('ALL');");
    expect(tab).toContain("      'purchase-orders',\n      currentStoreId,\n      statusFilter,\n      supplierFilter,\n      dateFrom,\n      dateTo,\n      page,\n    ],");
  });

  it('the lens\u2019s counts are REAL numbers over the page\u2019s rows \u2014 every row lands in exactly one family', () => {
    expect(tab).toContain('const c = { fresh: 0, stale: 0, beyond: 0, never: 0, silent: 0 };');
    expect(tab).toContain('if (b) c[b] += 1;');
    expect(tab).toContain('else c.silent += 1;');
  });

  it('the lens first, then the needle, then the sort \u2014 the reading narrows, the fetch never moves', () => {
    expect(tab).toContain("bandLens === 'ALL'");
    expect(tab).toContain("bandLens === 'silent' ? poRowBand(po) == null : poRowBand(po) === bandLens");
    expect(tab).toContain('}, [purchaseOrders, search, sortField, sortDir, bandLens]);');
  });

  it('the face\u2019s own clear-all lifts the lens \u2014 the honest clear, never a partial one', () => {
    expect(tab).toContain('    setBandLens(\'ALL\');');
    expect(tab).toContain('search || statusFilter !== \'ALL\' || supplierFilter !== \'ALL\' || dateFrom || dateTo || bandLens !== \'ALL\'');
  });

  it('the rail wears the five families \u2014 the four houses + the silent absence', () => {
    expect(tab).toContain('data-testid="po-roster-band-row"');
    expect(tab).toContain('data-testid={`po-roster-band-${b}`}');
    expect(tab).toContain('data-testid="po-roster-band-silent"');
    expect(tab).toContain("(['fresh', 'stale', 'beyond', 'never'] as const).map((b) => {");
  });

  it('a pressed chip wears its house\u2019s pressed face \u2014 a click on the pressed chip stands it down', () => {
    expect(tab).toContain('aria-pressed={pressed}');
    expect(tab).toContain('onClick={() => setBandLens(pressed ? \'ALL\' : b)}');
    expect(tab).toContain('${pressed ? house.pressed : house.chip}');
  });

  it('the disclosure rides the rail \u2014 the wire\u2019s rungs stay the wire\u2019s (v2.256.0: the ear\u2019s words joined the title)', () => {
    expect(tab).toContain('title="the page\'s own lens — the filters above stay the wire\'s; a press narrows the view (the fetch stays); Escape stands the lens down"');
  });

  it('the houses ride the ONE home \u2014 the tab imports the lib, never a copy', () => {
    expect(tab).toContain("import { bandHouse, chipLabel, daysVoice, type CadenceBand } from '@/lib/cadence-band';");
  });
});

describe('the birth\u2019s dot on the branch face \u2014 the org\u2019s own law, one home (v2.254.0)', () => {
  it('the branch roster\u2019s birth chip wears the rail-coloured dot', () => {
    expect(tab).toContain('data-testid="po-row-band-dot"');
    expect(tab).toContain('${bandHouse(po.originStockTake.walkAisle.band as CadenceBand).rail}');
  });

  it('a silent read keeps the plain violet \u2014 the honest absence, never a guessed colour', () => {
    expect(tab).toContain('{po.originStockTake.walkAisle?.band && (');
  });
});

describe('the lens-empty\u2019s lift \u2014 the words\u2019 own promise, now a button (v2.254.0)', () => {
  it('the org lens-empty face grows the clear-the-view control', () => {
    expect(ledger).toContain('data-testid="po-ledger-lens-clear"');
    expect(ledger).toContain("onClick={() => { setBandLens('ALL'); setNeedle(''); }}");
  });

  it('the lift\u2019s title speaks the law \u2014 the whole window returns, the fetch never moved', () => {
    expect(ledger).toContain('title="stand the lens down and clear the finder — the whole window returns (the fetch never moved)"');
  });

  it('the empty face keeps its words \u2014 the lift rides beside them, never instead', () => {
    expect(ledger).toContain('data-testid="po-ledger-lens-empty"');
    expect(ledger).toContain('the lens narrowed the window to nothing — lift a band house or clear the finder and the orders return.');
  });
});
