// THE ROW'S OWN MAKER SUITE (v2.425.0) — THE ARC'S SIXTH WORD: the
// carried row knows its own supplier.
//
//   - the map's maker read (mapOrderHandoffToPoItems): every mapped row
//     wears the LIVE shelf's link (the wire's nested face — the same
//     voice the pre-pick's ledger reads). The envelope's names never
//     feed it (a stale pocket must not name a live order — the v2.422
//     law, now per-row): an envelope line naming 'Stale Pocket Ltd'
//     still lands with the shelf's own truth. An unnamed product stays
//     honestly null; a dropped sku never names anything.
//   - the dialog's rows: the state wears the pocket's own seed shape
//     (OrderHandoffPoItem, ONE home), the hand-built paths (search add,
//     low-stock add) read the same shelf link, and every row that knows
//     its maker speaks it — the sky census family the strip's chip
//     taught (testid po-row-supplier, the Truck icon, "via {name}"),
//     so a MIXED order's rows carry their own suppliers where the
//     actor can see them (the strip's chip stays silent in that world
//     — the pre-pick's whole-order law is unchanged).
//
// Every pin reads the SOURCE OF RECORD (source bytes, not memory) — the
// house rule since the verify scripts were born.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it, expect } from 'vitest';

import { mapOrderHandoffToPoItems, type OrderHandoffPayload } from '@/lib/order-handoff';

const read = (p: string) => readFileSync(join(process.cwd(), p), 'utf8');

const LIB = 'src/lib/order-handoff.ts';
const TAB = 'src/app/(shell)/tabs/purchase-orders-tab.tsx';
const libSrc = read(LIB);
const tabSrc = read(TAB);

const PAYLOAD = (over: Partial<OrderHandoffPayload['items'][number]> = {}): OrderHandoffPayload => ({
  storeId: 'store_juja_main',
  storeName: 'MBUMAH HARDWARE — Juja Main',
  carriedAt: '2026-11-07T00:00:00.000Z',
  lines: 1,
  units: 10,
  items: [
    { sku: 'MBM-CEM-0001', name: 'Bamburi Cement 50kg', quantity: 10, onHand: 40, reorderLevel: 50, supplierName: 'Bamburi Cement Ltd', ...over },
  ],
});

const PRODUCT = (over: Partial<Parameters<typeof mapOrderHandoffToPoItems>[1][number]> = {}) => ({
  id: 'prod_cement_bamburi',
  sku: 'MBM-CEM-0001',
  costPrice: 680 as number | null,
  quantityInStock: 40,
  supplier: { id: 'sup_juja_bamburi', name: 'Bamburi Cement Ltd' } as { id: string; name: string } | null | undefined,
  ...over,
});

describe('the map\u2019s maker read (v2.425.0) — the live shelf\u2019s link names the row', () => {
  it('the row wears its maker — the shelf\u2019s own truth, one home with the pre-pick\u2019s ledger', () => {
    const { items } = mapOrderHandoffToPoItems(PAYLOAD(), [PRODUCT()]);
    expect(items).toHaveLength(1);
    expect(items[0].supplierName).toBe('Bamburi Cement Ltd');
  });

  it('THE STALE POCKET LAW, per-row: the envelope\u2019s name never feeds the row — the live link wins', () => {
    const payload = PAYLOAD({ supplierName: 'Stale Pocket Ltd' });
    const { items } = mapOrderHandoffToPoItems(payload, [PRODUCT({ supplier: { id: 'sup_live', name: 'The Live Shelf Ltd' } })]);
    expect(items[0].supplierName).toBe('The Live Shelf Ltd');
    expect(items[0].supplierName).not.toBe('Stale Pocket Ltd');
  });

  it('an unnamed product stays honestly null — the row never guesses a maker', () => {
    const { items } = mapOrderHandoffToPoItems(PAYLOAD({ supplierName: 'Bamburi Cement Ltd' }), [PRODUCT({ supplier: null })]);
    expect(items[0].supplierName).toBeNull();
  });

  it('a dropped sku never names anything — the honest map counts it, never renders it', () => {
    const payload = PAYLOAD();
    payload.items.push({ sku: 'MBM-GONE-999', name: 'Retired Goods', quantity: 5, onHand: 0, reorderLevel: 5, supplierName: 'Ghost Ltd' });
    const { items, droppedSkus, prePick } = mapOrderHandoffToPoItems(payload, [PRODUCT()]);
    expect(items).toHaveLength(1);
    expect(droppedSkus).toEqual(['MBM-GONE-999']);
    expect(items.every((item) => item.supplierName === 'Bamburi Cement Ltd')).toBe(true);
    expect(prePick).toEqual({ supplierId: 'sup_juja_bamburi', supplierName: 'Bamburi Cement Ltd' });
  });

  it('the pre-pick\u2019s whole-order law is unchanged: two makers dissolve it, the rows still speak their own', () => {
    const payload = PAYLOAD();
    payload.items.push({ sku: 'MBM-PNT-0001', name: 'Dulux Weathershield 20L', quantity: 4, onHand: 26, reorderLevel: 30, supplierName: 'AkzoNobel Kenya (Dulux)' });
    const products = [
      PRODUCT(),
      PRODUCT({ id: 'prod_dulux_20l', sku: 'MBM-PNT-0001', supplier: { id: 'sup_akzo', name: 'AkzoNobel Kenya (Dulux)' } }),
    ];
    const { items, prePick } = mapOrderHandoffToPoItems(payload, products);
    expect(items).toHaveLength(2);
    expect(items[0].supplierName).toBe('Bamburi Cement Ltd');
    expect(items[1].supplierName).toBe('AkzoNobel Kenya (Dulux)');
    expect(prePick).toBeNull();
  });
});

describe('the faces (v2.425.0) — the sub-line and the one home, pinned to the source', () => {
  it('the pocket\u2019s seed shape grew the maker — the optional honest absence', () => {
    expect(libSrc).toContain('supplierName?: string | null;');
    expect(libSrc).toContain("THE ROW'S OWN MAKER");
    expect(libSrc).toContain('supplierName: product.supplier?.name ?? null,');
  });

  it('the dialog\u2019s rows wear the ONE home — the state is the pocket\u2019s own shape', () => {
    expect(tabSrc).toContain("type OrderHandoffPoItem } from '@/lib/order-handoff';");
    expect(tabSrc).toContain('const [poItems, setPoItems] = useState<OrderHandoffPoItem[]>([]);');
    expect(tabSrc).toContain('const picks: OrderHandoffPoItem[] = [];');
  });

  it('every hand-built path reads the same shelf link — the search add and the low-stock add', () => {
    expect(tabSrc).toContain('supplierName: product.supplier?.name ?? null,');
    expect(tabSrc).toContain('supplierName: p.supplier?.name ?? null,');
  });

  it('the sub-line: the sky census family, the Truck icon, the via voice, testid po-row-supplier', () => {
    expect(tabSrc).toContain('data-testid="po-row-supplier"');
    expect(tabSrc).toContain('via {item.supplierName}');
    expect(tabSrc).toContain('text-[11px] text-sky-700 dark:text-sky-400');
    expect(tabSrc).toContain('<Truck className="h-3 w-3 shrink-0" aria-hidden="true" />');
  });

  it('the sub-line renders CONDITIONALLY — an unnamed row stays silent, never a fake via', () => {
    expect(tabSrc).toContain('{item.supplierName && (');
  });
});
