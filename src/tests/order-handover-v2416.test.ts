// THE ORDER'S HANDOVER SUITE (v2.416.0) — the restock order gains a
// third face and the purchase-order desk learns to receive it.
//
//   - the pocket (order-handoff.ts): the banner folds its rows into a
//     sessionStorage envelope; the PO desk consumes it ONCE at mount
//     (one-way — a manual "New PO" never inherits a birth by accident,
//     the same law the restock sheet's ?restockFrom= door speaks).
//   - the Send face: the banner's third action beside Copy and Download
//     — folds, walks (setActiveTab), and toasts the receipt; the amber
//     family at rest, the co-mount law now THREE faces gated on the
//     same honest absence.
//   - the carriage strip: the dialog speaks WHICH desk the order rode
//     from, what it carried (lines, units), and the honest dropped
//     count when the shelf no longer knows a carried sku.
//
// Every pin reads the SOURCE OF RECORD (source bytes, not memory) — the
// house rule since the verify scripts were born.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it, expect } from 'vitest';

import {
  buildOrderHandoff,
  parseOrderHandoff,
  mapOrderHandoffToPoItems,
  orderHandoffUnits,
  ORDER_HANDOFF_KEY,
  type OrderHandoffPayload,
} from '@/lib/order-handoff';

const read = (p: string) => readFileSync(join(process.cwd(), p), 'utf8');

const TAB = 'src/app/(shell)/tabs/inventory-tab.tsx';
const PO_TAB = 'src/app/(shell)/tabs/purchase-orders-tab.tsx';
const LIB = 'src/lib/order-handoff.ts';
const tabSrc = read(TAB);
const poTabSrc = read(PO_TAB);
const libSrc = read(LIB);

const ROWS = [
  { sku: 'NAIL-2I', name: 'Nails 2 inch', onHand: 40, reorderLevel: 100 },
  { sku: 'HINGE-3I', name: 'Hinges 3 inch', onHand: 0, reorderLevel: 24 },
  { sku: 'PAINT-W1', name: 'White paint 1L', onHand: 2, reorderLevel: 5 },
];

describe('buildOrderHandoff (v2.416.0) — the fold', () => {
  it('carries the reorder gap as the ask (never a stock read)', () => {
    const payload = buildOrderHandoff('store_juja_main', 'Juja Main', new Date(2026, 10, 6, 14, 7), ROWS);
    expect(payload.items.map((i) => i.quantity)).toEqual([60, 24, 3]);
  });

  it('speaks the counts: lines and units', () => {
    const payload = buildOrderHandoff('store_juja_main', 'Juja Main', new Date(2026, 10, 6, 14, 7), ROWS);
    expect(payload.lines).toBe(3);
    expect(payload.units).toBe(87);
  });

  it('an out-of-stock row with reorder level 0 never joins (the nothing-to-order law, defended at the fold)', () => {
    const payload = buildOrderHandoff('store_juja_main', 'Juja Main', new Date(2026, 10, 6, 14, 7), [
      { sku: 'GHOST-1', name: 'Ghost item', onHand: 0, reorderLevel: 0 },
      ...ROWS,
    ]);
    expect(payload.items.some((i) => i.sku === 'GHOST-1')).toBe(false);
  });

  it('the envelope is addressed: store, name, ISO instant', () => {
    const at = new Date(2026, 10, 6, 14, 7);
    const payload = buildOrderHandoff('store_juja_main', 'Juja Main', at, ROWS);
    expect(payload.storeId).toBe('store_juja_main');
    expect(payload.storeName).toBe('Juja Main');
    expect(payload.carriedAt).toBe(at.toISOString());
  });
});

describe('orderHandoffUnits (v2.416.0) — the weight of the ask', () => {
  it('sums the quantities', () => {
    expect(orderHandoffUnits([
      { sku: 'A', name: 'A', quantity: 12, onHand: 0, reorderLevel: 12 },
      { sku: 'B', name: 'B', quantity: 8, onHand: 0, reorderLevel: 8 },
    ])).toBe(20);
  });

  it('an empty ask weighs nothing', () => {
    expect(orderHandoffUnits([])).toBe(0);
  });
});

describe('parseOrderHandoff (v2.416.0) — the shape law', () => {
  it('an empty pocket reads null', () => {
    expect(parseOrderHandoff(null, 'store_juja_main')).toBe(null);
    expect(parseOrderHandoff('', 'store_juja_main')).toBe(null);
  });

  it('an unreadable envelope is refused, never half-read', () => {
    expect(parseOrderHandoff('not-json-at-all', 'store_juja_main')).toBe(null);
    expect(parseOrderHandoff('{"storeId":', 'store_juja_main')).toBe(null);
  });

  it('another branch\u2019s mail is not this desk\u2019s (the store law)', () => {
    const payload = buildOrderHandoff('store_thika', 'Thika', new Date(2026, 10, 6, 14, 7), ROWS);
    expect(parseOrderHandoff(JSON.stringify(payload), 'store_juja_main')).toBe(null);
  });

  it('a well-folded envelope round-trips honestly', () => {
    const payload = buildOrderHandoff('store_juja_main', 'Juja Main', new Date(2026, 10, 6, 14, 7), ROWS);
    const parsed = parseOrderHandoff(JSON.stringify(payload), 'store_juja_main');
    expect(parsed).not.toBe(null);
    const carried = parsed as OrderHandoffPayload;
    expect(carried.storeName).toBe('Juja Main');
    expect(carried.lines).toBe(payload.lines);
    expect(carried.units).toBe(payload.units);
    expect(carried.items.length).toBe(payload.items.length);
  });

  it('a malformed item (a sku-less line) refuses the WHOLE envelope', () => {
    const raw = JSON.stringify({
      storeId: 'store_juja_main', storeName: 'Juja Main', carriedAt: new Date(2026, 10, 6, 14, 7).toISOString(),
      lines: 1, units: 5, items: [{ name: 'no sku', quantity: 5, onHand: 0, reorderLevel: 5 }],
    });
    expect(parseOrderHandoff(raw, 'store_juja_main')).toBe(null);
  });

  it('an envelope whose every line asks for zero is refused (a lie with rows)', () => {
    const raw = JSON.stringify({
      storeId: 'store_juja_main', storeName: 'Juja Main', carriedAt: new Date(2026, 10, 6, 14, 7).toISOString(),
      lines: 1, units: 0, items: [{ sku: 'X', name: 'X', quantity: 0, onHand: 5, reorderLevel: 5 }],
    });
    expect(parseOrderHandoff(raw, 'store_juja_main')).toBe(null);
  });
});

describe('mapOrderHandoffToPoItems (v2.416.0) — the honest map', () => {
  const payload = buildOrderHandoff('store_juja_main', 'Juja Main', new Date(2026, 10, 6, 14, 7), ROWS);
  const SHELF = [
    { id: 'prod_nails', sku: 'NAIL-2I', costPrice: 120 as number | null, quantityInStock: 40 },
    { id: 'prod_hinge', sku: 'HINGE-3I', costPrice: null as number | null, quantityInStock: 0 },
  ];

  it('known skus become the dialog\u2019s own editable rows', () => {
    const { items } = mapOrderHandoffToPoItems(payload, SHELF);
    expect(items.length).toBe(2);
    expect(items[0].productId).toBe('prod_nails');
    expect(items[0].quantity).toBe('60');
    expect(items[0].unitCost).toBe('120');
    expect(items[0].currentStock).toBe(40);
  });

  it('a cost the gate hides leaves the pen empty (never the string "null", never a fake 0)', () => {
    const { items } = mapOrderHandoffToPoItems(payload, SHELF);
    expect(items[1].productId).toBe('prod_hinge');
    expect(items[1].unitCost).toBe('');
  });

  it('a sku the shelf no longer knows is dropped and COUNTED', () => {
    const { items, droppedSkus } = mapOrderHandoffToPoItems(payload, SHELF);
    expect(items.some((i) => i.sku === 'PAINT-W1')).toBe(false);
    expect(droppedSkus).toEqual(['PAINT-W1']);
  });

  it('a shelf that lost every sku answers an empty order and every sku counted', () => {
    const { items, droppedSkus } = mapOrderHandoffToPoItems(payload, []);
    expect(items.length).toBe(0);
    expect(droppedSkus.length).toBe(3);
  });
});

describe('the Send face (v2.416.0) — the banner\u2019s third action', () => {
  it('the face exists, testid-ed, beside the pair in the banner', () => {
    expect(tabSrc).toContain('data-testid="inv-order-send"');
    expect(tabSrc).toContain('<SendOrderButton storeId={currentStoreId} storeName={orderStoreName} rows={orderRows} />');
  });

  it('the co-mount law now speaks THREE faces gated on the same honest absence', () => {
    const mounts = tabSrc.split('{orderRows.length > 0 && (').length - 1;
    expect(mounts).toBe(3);
  });

  it('the resting face wears the banner\u2019s amber family', () => {
    expect(tabSrc).toContain('className="h-7 gap-1.5 rounded-md border-amber-300 px-2 text-xs text-amber-800 transition-colors hover:bg-amber-100 hover:text-amber-900 dark:border-amber-700 dark:text-amber-200 dark:hover:bg-amber-900/40"');
  });

  it('the click folds, walks and toasts the receipt', () => {
    expect(tabSrc).toContain("buildOrderHandoff(storeId, storeName, new Date(), rows)");
    expect(tabSrc).toContain("setActiveTab('purchase-orders')");
    expect(tabSrc).toContain("toast.success(`The order rides to the purchase order desk — ${payload.lines} line${payload.lines === 1 ? '' : 's'}, ${payload.units} unit${payload.units === 1 ? '' : 's'} carried.`)");
  });

  it('the empty fold is refused at the face too (no pocket for a zero order)', () => {
    expect(tabSrc).toContain('if (payload.items.length === 0) return;');
  });
});

describe('the pocket\u2019s laws (v2.416.0) — one home, one key', () => {
  it('the key is spoken once and pinned', () => {
    expect(ORDER_HANDOFF_KEY).toBe('mbumah.order-handoff.v1');
    expect(libSrc).toContain("export const ORDER_HANDOFF_KEY = 'mbumah.order-handoff.v1';");
  });

  it('the one-way law: consumption clears the pocket', () => {
    expect(libSrc).toContain('window.sessionStorage.removeItem(ORDER_HANDOFF_KEY)');
  });

  it('the write guards its window (SSR and private-mode honest)', () => {
    expect(libSrc).toContain('if (typeof window === \u0027undefined\u0027) return;');
  });
});

describe('the PO desk\u2019s landing (v2.416.0) — the envelope is received', () => {
  it('the tab consumes the pocket ONCE at mount, addressed to the reading branch', () => {
    expect(poTabSrc).toContain('const [orderBirth, setOrderBirth] = useState<OrderHandoffPayload | null>(() =>');
    expect(poTabSrc).toContain('consumeOrderHandoff(currentStoreId)');
  });

  it('the birth auto-opens the dialog, hands over exactly once, then retires', () => {
    expect(poTabSrc).toContain('const consumeBirth = useCallback(() => setOrderBirth(null), []);');
    expect(poTabSrc).toContain('onBirthConsumed={consumeBirth}');
  });

  it('the carriage strip: amber family, testid-ed, honest dropped count', () => {
    expect(poTabSrc).toContain('data-testid="po-order-handoff-provenance"');
    expect(poTabSrc).toContain('data-testid="po-order-handoff-dropped"');
    expect(poTabSrc).toContain('className="rounded-lg border border-amber-200 bg-amber-50/60 px-2.5 py-2 text-[11px] text-amber-800 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-200"');
  });

  it('the strip is a LOCAL digest — a manual reopen starts empty', () => {
    expect(poTabSrc).toContain('setOrderStrip(null);');
  });

  it('the map reads the shelf through the same list call the low-stock loader speaks', () => {
    expect(poTabSrc).toContain('mapOrderHandoffToPoItems(orderBirth, products)');
  });
});
