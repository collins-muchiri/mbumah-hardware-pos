// v2.255.0 — the suppliers' lens.
//
//   - THE SUPPLIERS' LENS: the supplier's orders tab (the birth's fifth
//     face since v2.253) grows the band rail — the org ledger's and the
//     branch roster's own lens ported to the THIRD face: four houses +
//     the silent absence, REAL counts over the rows the roster ALREADY
//     holds, a press narrows the view (the lens IS the reading here —
//     the roster holds no needle, no sort rungs), the wire's rungs
//     (storeId + supplierId) stay the wire's.
//   - THE LENS'S OWN EMPTY FACE: the pressed house that empties the view
//     gets the honest answer (the roster still holds rows — the face says
//     so) and the lift — one control that stands the lens down.
//   - THE BADGE SPEAKS THE LENS: a pressed house answers N of M; 'ALL'
//     keeps the roster's own count.
//   - THE CACHE'S OWN HONESTY (bugfix): the lastOrderDate read copies
//     before it sorts — the old line sorted the fetched array IN PLACE,
//     i.e. the react-query cache's own array.
//   - THE ROSTER'S OWN MEMO: the identity per fetch (the branch roster's
//     own law) — the lens's memos read a stable dep.
//
// Every pin reads the SOURCE OF RECORD (source bytes, not memory).

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it, expect } from 'vitest';

const read = (p: string) => readFileSync(join(process.cwd(), p), 'utf8');

const tab = read('src/app/(shell)/tabs/suppliers-tab.tsx');

describe('the suppliers\u2019 lens \u2014 the third face of the proven arc (v2.255.0)', () => {
  it('the row\u2019s band reads behind a membership check \u2014 a stranger string is the silence, never a guessed family', () => {
    expect(tab).toContain('const supplierPoBand = (po: PurchaseOrderListItem): CadenceBand | null => {');
    expect(tab).toContain("return b === 'fresh' || b === 'stale' || b === 'beyond' || b === 'never' ? b : null;");
  });

  it('the lens state rides the view \u2014 never the query key, never the fetch', () => {
    expect(tab).toContain("const [bandLens, setBandLens] = useState<'ALL' | CadenceBand | 'silent'>('ALL');");
    expect(tab).toContain("queryKey: ['purchase-orders-supplier', storeId, supplierId],");
  });

  it('the lens\u2019s counts are REAL numbers over the roster\u2019s rows \u2014 every row lands in exactly one family', () => {
    expect(tab).toContain('const c = { fresh: 0, stale: 0, beyond: 0, never: 0, silent: 0 };');
    expect(tab).toContain('if (b) c[b] += 1;');
    expect(tab).toContain('else c.silent += 1;');
  });

  it('the lens first \u2014 the roster\u2019s only reading control, the fetch never moves', () => {
    expect(tab).toContain("bandLens === 'ALL'");
    expect(tab).toContain("bandLens === 'silent' ? supplierPoBand(po) == null : supplierPoBand(po) === bandLens");
    expect(tab).toContain('[purchaseOrders, bandLens]');
  });

  it('the rail wears the five families \u2014 the four houses + the silent absence', () => {
    expect(tab).toContain('data-testid="supplier-po-band-row"');
    expect(tab).toContain('data-testid={`supplier-po-band-${b}`}');
    expect(tab).toContain('data-testid="supplier-po-band-silent"');
    expect(tab).toContain("(['fresh', 'stale', 'beyond', 'never'] as const).map((b) => {");
  });

  it('a pressed chip wears its house\u2019s pressed face \u2014 a click on the pressed chip stands it down', () => {
    expect(tab).toContain('aria-pressed={pressed}');
    expect(tab).toContain('onClick={() => setBandLens(pressed ? \'ALL\' : b)}');
    expect(tab).toContain('${pressed ? house.pressed : house.chip}');
  });

  it('the disclosure rides the rail \u2014 the wire\u2019s rungs stay the wire\u2019s', () => {
    expect(tab).toContain('title="the roster\'s own lens — a press narrows the view (the fetch stays)"');
  });

  it('the houses ride the ONE home \u2014 the tab imports the lib, never a copy (chipLabel joins)', () => {
    expect(tab).toContain("import { bandHouse, chipLabel, daysVoice, type CadenceBand } from '@/lib/cadence-band';");
  });
});

describe('the lens\u2019s own empty face \u2014 the honest answer and the lift (v2.255.0)', () => {
  it('the pressed house that empties the view gets its own face \u2014 the words say the roster still holds rows', () => {
    expect(tab).toContain('data-testid="supplier-po-lens-empty"');
    expect(tab).toContain("No order on this roster keeps the silence");
    expect(tab).toContain('No order on this roster wears ${bandLens}');
    expect(tab).toContain("'orders'} on the roster — lift the lens to see");
  });

  it('the lift stands the lens down \u2014 one control, the fetch never moved', () => {
    expect(tab).toContain('data-testid="supplier-po-band-clear"');
    expect(tab).toContain('onClick={() => setBandLens(\'ALL\')}');
  });

  it('the true empty roster keeps its own face \u2014 the two empties never blur', () => {
    expect(tab).toContain('No purchase orders yet');
    expect(tab).toContain('Create a PO to start tracking orders');
  });
});

describe('the badge speaks the lens \u2014 the honest narrowing (v2.255.0)', () => {
  it('a pressed house answers N of M; ALL keeps the roster\u2019s own count', () => {
    expect(tab).toContain("bandLens === 'ALL'");
    expect(tab).toContain('${lensedOrders.length} of ${purchaseOrders.length} orders');
    expect(tab).toContain('${purchaseOrders.length} orders');
  });

  it('the rows the table draws are the LENS\u2019s rows \u2014 the roster\u2019s own map', () => {
    expect(tab).toContain('{lensedOrders.map((po) => (');
  });
});

describe('the cache\u2019s own honesty \u2014 the copy before the sort (v2.255.0 bugfix)', () => {
  it('the lastOrderDate read copies before it sorts \u2014 the fetched array (the cache\u2019s own) is never reordered in place', () => {
    expect(tab).toContain('[...purchaseOrders].sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime())[0]?.orderDate');
  });

  it('the roster\u2019s identity is the memo\u2019s \u2014 the branch roster\u2019s own law', () => {
    expect(tab).toContain('const purchaseOrders: PurchaseOrderListItem[] = useMemo(');
  });
});

describe('the birth\u2019s fifth face keeps its truth \u2014 v2.253\u2019s words byte-kept (v2.255.0)', () => {
  it('the birth chip and the band dot stay \u2014 the lens dresses the roster, never undresses it', () => {
    expect(tab).toContain('data-testid="supplier-po-birth-chip"');
    expect(tab).toContain('data-testid="supplier-po-band-dot"');
    expect(tab).toContain('bandHouse(po.originStockTake.walkAisle.band as CadenceBand).rail');
  });
});
