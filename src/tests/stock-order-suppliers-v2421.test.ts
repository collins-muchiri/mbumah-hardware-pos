// THE ARC'S SECOND WORD SUITE (v2.421.0) — the restock order rides with
// its supplier.
//
//   - formatRestockOrder's TWO faces, chosen by the INPUT's own shape
//     (the formatter never invents a fact the caller didn't hand it):
//     THE FLAT FACE stays byte-stable for a world that never named a
//     supplier (the v2.414 face, unbroken — the regression pin lives
//     here too); THE BLOCKS FACE groups the order into per-supplier
//     blocks when the world names ANY supplier.
//   - the blocks' laws: named blocks sort alphabetically, the honest
//     absence block (NO_SUPPLIER_ORDER_LABEL, "No supplier yet") always
//     rides LAST when the world itself carries unassigned rows, the
//     lines keep the selector's own sort inside each block, a blank
//     line separates blocks, and the header + the count line stay
//     global (the count never re-counts per block).
//   - restockSupplierCount: the banner chip's voice — DISTINCT named
//     suppliers only (the absence never counts), honest zero.
//   - the faces: the inventory desk's rows now carry supplierName, the
//     banner chip wears the sky family (the lens's own), and the copy
//     button's title tells the truth about the blocks.
//
// Every pin reads the SOURCE OF RECORD (source bytes, not memory).

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it, expect } from 'vitest';

import {
  formatRestockOrder,
  restockSupplierCount,
  restockRowsNeedingAttention,
  NO_SUPPLIER_ORDER_LABEL,
  type RestockRow,
} from '@/lib/stock-order';

const read = (p: string) => readFileSync(join(process.cwd(), p), 'utf8');

const libSrc = read('src/lib/stock-order.ts');
const inventorySrc = read('src/app/(shell)/tabs/inventory-tab.tsx');

const ROW = (over: Partial<RestockRow> = {}): RestockRow => ({
  sku: 'SKU-1',
  name: 'Cement 32.5N',
  onHand: 4,
  reorderLevel: 10,
  ...over,
});

const ORDER = (rows: RestockRow[]) =>
  formatRestockOrder({ storeName: 'MBUMAH HARDWARE - Juja Main', dateLabel: 'Fri, 6 Nov 2026', rows });

const HEADER = [
  'MBUMAH HARDWARE — RESTOCK ORDER',
  'Branch: MBUMAH HARDWARE - Juja Main · Fri, 6 Nov 2026',
];

describe('the flat face (v2.421.0) — a world that never named a supplier', () => {
  it('stays byte-stable: the v2.414 lines, no invented absence block', () => {
    const text = ORDER([ROW(), ROW({ sku: 'SKU-2', name: 'Nails 4"', onHand: 0, reorderLevel: 8 })]);
    expect(text).toBe(
      [
        ...HEADER,
        '2 items need attention',
        '',
        '[OUT] Nails 4" (SKU SKU-2) — on hand 0 / reorder 8 — order 8',
        '[LOW] Cement 32.5N (SKU SKU-1) — on hand 4 / reorder 10 — order 6',
      ].join('\n'),
    );
  });

  it('an explicit null rides the flat face too (the caller said nothing)', () => {
    const text = ORDER([ROW({ supplierName: null })]);
    expect(text).not.toBeNull();
    expect(text?.split('\n')[4]).toBe('[LOW] Cement 32.5N (SKU SKU-1) — on hand 4 / reorder 10 — order 6');
    expect(text).not.toContain('No supplier yet');
  });

  it('a whitespace-only name is not a supplier (the trim law)', () => {
    const text = ORDER([ROW({ supplierName: '   ' })]);
    expect(text).not.toContain('No supplier yet');
  });
});

describe('the blocks face (v2.421.0) — the order rides with its supplier', () => {
  it('one block per supplier, named, with the lines under it', () => {
    const text = ORDER([
      ROW({ sku: 'CEM-1', name: 'Bamburi Cement 50kg', onHand: 0, reorderLevel: 50, supplierName: 'Bamburi Cement Ltd' }),
      ROW({ sku: 'NAS-1', name: 'Nails 4-inch', onHand: 40, reorderLevel: 100, supplierName: null }),
    ]);
    expect(text).toBe(
      [
        ...HEADER,
        '2 items need attention',
        '',
        'Bamburi Cement Ltd:',
        '[OUT] Bamburi Cement 50kg (SKU CEM-1) — on hand 0 / reorder 50 — order 50',
        '',
        'No supplier yet:',
        '[LOW] Nails 4-inch (SKU NAS-1) — on hand 40 / reorder 100 — order 60',
      ].join('\n'),
    );
  });

  it('named blocks sort alphabetically; the absence block always rides LAST', () => {
    const text = ORDER([
      ROW({ sku: 'Z-1', supplierName: 'Zed Supplies' }),
      ROW({ sku: 'A-1', supplierName: 'Alpha Cement' }),
      ROW({ sku: 'N-1', supplierName: null }),
    ]);
    expect(text).not.toBeNull();
    const body = text?.split('\n').slice(4) ?? [];
    expect(body[0]).toBe('Alpha Cement:');
    expect(body[3]).toBe('Zed Supplies:');
    expect(body[6]).toBe('No supplier yet:');
  });

  it('the count line stays GLOBAL (the blocks never re-count)', () => {
    const text = ORDER([
      ROW({ supplierName: 'Alpha Cement' }),
      ROW({ sku: 'SKU-2', supplierName: 'Zed Supplies' }),
      ROW({ sku: 'SKU-3', supplierName: null }),
    ]);
    expect(text?.split('\n')[2]).toBe('3 items need attention');
  });

  it('an all-named world speaks NO absence block (the absence is earned, never invented)', () => {
    const text = ORDER([
      ROW({ supplierName: 'Alpha Cement' }),
      ROW({ sku: 'SKU-2', supplierName: 'Zed Supplies' }),
    ]);
    expect(text).not.toContain('No supplier yet');
    expect(text).toContain('Alpha Cement:');
    expect(text).toContain('Zed Supplies:');
  });

  it('the selector\'s own sort holds INSIDE each block (out first, then the gap)', () => {
    const text = ORDER([
      ROW({ sku: 'LOW-1', name: 'Low', onHand: 8, reorderLevel: 10, supplierName: 'Alpha Cement' }),
      ROW({ sku: 'OUT-1', name: 'Out', onHand: 0, reorderLevel: 5, supplierName: 'Alpha Cement' }),
    ]);
    const body = text?.split('\n').slice(4) ?? [];
    expect(body).toEqual([
      'Alpha Cement:',
      '[OUT] Out (SKU OUT-1) — on hand 0 / reorder 5 — order 5',
      '[LOW] Low (SKU LOW-1) — on hand 8 / reorder 10 — order 2',
    ]);
  });

  it('the caller\'s row order cannot leak through the blocks (determinism)', () => {
    const a = ORDER([
      ROW({ sku: 'Z-1', supplierName: 'Zed Supplies' }),
      ROW({ sku: 'A-1', supplierName: 'Alpha Cement' }),
      ROW({ sku: 'N-1', supplierName: null }),
    ]);
    const b = ORDER([
      ROW({ sku: 'N-1', supplierName: null }),
      ROW({ sku: 'A-1', supplierName: 'Alpha Cement' }),
      ROW({ sku: 'Z-1', supplierName: 'Zed Supplies' }),
    ]);
    expect(a).not.toBeNull();
    expect(a).toBe(b);
  });

  it('the label is the honest absence\'s own words', () => {
    expect(NO_SUPPLIER_ORDER_LABEL).toBe('No supplier yet');
  });
});

describe('restockSupplierCount (v2.421.0) — the banner chip\'s voice', () => {
  it('counts DISTINCT named suppliers only; the absence never counts', () => {
    expect(restockSupplierCount([
      ROW({ supplierName: 'Alpha Cement' }),
      ROW({ sku: 'SKU-2', supplierName: 'Alpha Cement' }),
      ROW({ sku: 'SKU-3', supplierName: null }),
    ])).toBe(1);
  });

  it('a supplier-less world reads zero; only healthy rows read zero too', () => {
    expect(restockSupplierCount([ROW()])).toBe(0);
    expect(restockSupplierCount([ROW({ onHand: 50, reorderLevel: 10, supplierName: 'Alpha Cement' })])).toBe(0);
  });

  it('the selector rides inside (a healthy row\'s supplier never counts)', () => {
    expect(restockSupplierCount([
      ROW({ supplierName: 'Alpha Cement' }),
      ROW({ sku: 'SKU-2', supplierName: 'Zed Supplies', onHand: 50, reorderLevel: 10 }),
    ])).toBe(1);
  });
});

describe('the faces (v2.421.0) — the banner wears the arc', () => {
  it('the desk\'s rows carry the supplier name (the wire\'s face, honestly absent)', () => {
    expect(inventorySrc).toContain('supplierName: p.supplier?.name ?? null');
  });

  it('the banner chip speaks the census in the sky family (only when earned)', () => {
    expect(inventorySrc).toContain('data-testid="inv-order-suppliers"');
    expect(inventorySrc).toContain('via {orderSupplierCount} supplier{orderSupplierCount === 1 ? \'\' : \'s\'}');
    expect(inventorySrc).toContain('restockSupplierCount(orderRows)');
  });

  it('the copy button\'s title tells the truth about the blocks', () => {
    expect(inventorySrc).toContain("one block per supplier, ready to paste into each supplier's chat");
  });

  it('the lib stays PURE (no server-only imports — the client-safe law)', () => {
    expect(libSrc).not.toMatch(/from '@\/lib\/db'|from '@\/server|next\/headers/);
  });

  it('the formatter is the ONE home (no second copy of the grouping)', () => {
    expect(libSrc).toContain('THE ARC\'S SECOND WORD');
    expect(inventorySrc).toContain("from '@/lib/stock-order'");
  });

  it('the selector rides before the grouping (the order only speaks rows that need attention)', () => {
    const rows = restockRowsNeedingAttention([
      ROW({ supplierName: 'Alpha Cement' }),
      ROW({ sku: 'HEALTHY', onHand: 50, reorderLevel: 10, supplierName: 'Zed Supplies' }),
      ROW({ sku: 'SILENT', onHand: 0, reorderLevel: 0, supplierName: 'Alpha Cement' }),
    ]);
    expect(rows.map((r) => r.sku)).toEqual(['SKU-1']);
  });
});
