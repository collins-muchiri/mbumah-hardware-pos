// THE SUPPLIER'S SHELF SUITE (v2.423.0) — THE ARC'S FOURTH WORD: the
// supplier opens its shelf.
//
//   - the summary (supplierShelfSummary): the drill reads ONE home — the
//     grouping strip's own reduce (buildSupplierGroups) keyed to THIS
//     supplier. A stale wire row never rides another supplier's shelf
//     (the id is the truth), the numbers ride the grace (a
//     Decimal-as-string can never concat), and an empty or fully-stale
//     answer reads the honest zeros.
//   - the row family (shelfRowState): 'out' the empty shelf, 'low' the
//     shelf that owes (AT or UNDER its reorder level — the boundary is
//     owed, never hidden), 'ok' the healthy shelf — with the grace on
//     every read ("9" vs 10 reads the owed shelf, never "9" > "10"; the
//     lexicographic wound's own regression guard).
//   - the owed units (shelfShortfall): how far the shelf sits under its
//     reorder level, floored at zero — a healthy shelf owes nothing,
//     an over-stocked one never reads a negative debt.
//   - the faces: the chip is a PRESS (the row's click stays the detail
//     drill — the chip stops the propagation), the sheet is keyed by the
//     supplier, and every honest face (summary, rows, empty shelf) reads
//     the lib — never a second copy of the arithmetic.
//
// Every pin reads the SOURCE OF RECORD (source bytes, not memory) — the
// house rule since the verify scripts were born.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it, expect } from 'vitest';

import {
  supplierShelfSummary,
  shelfRowState,
  shelfShortfall,
} from '@/lib/product-groups';

const read = (p: string) => readFileSync(join(process.cwd(), p), 'utf8');

const ROUTE = 'src/app/api/products/route.ts';
const API = 'src/lib/api.ts';
const LIB = 'src/lib/product-groups.ts';
const TAB = 'src/app/(shell)/tabs/suppliers-tab.tsx';
const routeSrc = read(ROUTE);
const apiSrc = read(API);
const libSrc = read(LIB);
const tabSrc = read(TAB);

const ROW = (over: Partial<Parameters<typeof supplierShelfSummary>[0][number]> = {}) => ({
  id: 'prod_1',
  name: 'Bamburi Cement 50kg',
  supplierId: 'sup_bamburi' as string | null,
  supplier: { id: 'sup_bamburi', name: 'Bamburi Cement Ltd' },
  quantityInStock: 30 as number | string,
  pricePerUnit: 700 as number | string,
  costPrice: 620 as number | string | null,
  ...over,
});

describe('supplierShelfSummary (v2.423.0) — the shelf\u2019s own voice', () => {
  it('an empty answer reads the honest zeros', () => {
    expect(supplierShelfSummary([], 'sup_bamburi')).toEqual({
      products: 0,
      totalUnits: 0,
      shelfValue: 0,
      shelfCost: 0,
    });
  });

  it('a fully-stale answer reads the honest zeros — a foreign row never rides the shelf', () => {
    const rows = [ROW({ id: 'prod_x', supplierId: 'sup_other', supplier: { id: 'sup_other', name: 'AkzoNobel Kenya (Dulux)' } })];
    expect(supplierShelfSummary(rows, 'sup_bamburi')).toEqual({
      products: 0,
      totalUnits: 0,
      shelfValue: 0,
      shelfCost: 0,
    });
  });

  it('the supplier\u2019s own rows speak the shelf: products, units, value, cost', () => {
    const rows = [
      ROW({ id: 'prod_1', quantityInStock: 30, pricePerUnit: 700, costPrice: 620 }),
      ROW({ id: 'prod_2', name: 'Bamburi Cement 32.5N', quantityInStock: 200, pricePerUnit: 650, costPrice: 580 }),
    ];
    const s = supplierShelfSummary(rows, 'sup_bamburi');
    expect(s.products).toBe(2);
    expect(s.totalUnits).toBe(230);
    expect(s.shelfValue).toBe(30 * 700 + 200 * 650);
    expect(s.shelfCost).toBe(30 * 620 + 200 * 580);
  });

  it('a stale row rides NOWHERE — the summary keeps only the id\u2019s own rows', () => {
    const rows = [
      ROW({ id: 'prod_1', quantityInStock: 30, pricePerUnit: 700, costPrice: 620 }),
      ROW({ id: 'prod_stale', name: 'Paint 20L', supplierId: 'sup_other', quantityInStock: 999, pricePerUnit: 100, costPrice: 10 }),
    ];
    const s = supplierShelfSummary(rows, 'sup_bamburi');
    expect(s.products).toBe(1);
    expect(s.totalUnits).toBe(30);
    expect(s.shelfValue).toBe(21000);
  });

  it('the string grace: a Decimal-as-string arrival sums honestly — never a concat', () => {
    const rows = [
      ROW({ id: 'prod_1', quantityInStock: '50', pricePerUnit: '700.50', costPrice: '620' }),
      ROW({ id: 'prod_2', quantityInStock: 30, pricePerUnit: 700, costPrice: null }),
    ];
    const s = supplierShelfSummary(rows, 'sup_bamburi');
    expect(s.products).toBe(2);
    expect(s.totalUnits).toBe(80);
    expect(s.shelfValue).toBe(Math.round((50 * 700.5 + 30 * 700) * 100) / 100);
    // the null cost skips its row — the known costs sum, the unknown never a zero-cost lie
    expect(s.shelfCost).toBe(50 * 620);
  });

  it('the rounding: fractional shelf values land on cents', () => {
    const rows = [ROW({ id: 'prod_1', quantityInStock: 3, pricePerUnit: 19.99, costPrice: null })];
    const s = supplierShelfSummary(rows, 'sup_bamburi');
    expect(s.shelfValue).toBe(59.97);
  });
});

describe('shelfRowState (v2.423.0) — the row\u2019s family', () => {
  it('the empty shelf speaks out — zero, string zero, and the negative', () => {
    expect(shelfRowState(0, 10)).toBe('out');
    expect(shelfRowState('0', 10)).toBe('out');
    expect(shelfRowState(-3, 10)).toBe('out');
  });

  it('the owed shelf speaks low — AT or UNDER its reorder level, the boundary included', () => {
    expect(shelfRowState(5, 10)).toBe('low');
    expect(shelfRowState(10, 10)).toBe('low');
  });

  it('the healthy shelf speaks ok — strictly above the level', () => {
    expect(shelfRowState(11, 10)).toBe('ok');
    expect(shelfRowState(50, 10)).toBe('ok');
  });

  it('the lexicographic wound\u2019s regression guard: "9" vs 10 reads the owed shelf, never "9" > "10"', () => {
    expect(shelfRowState('9', 10)).toBe('low');
    expect(shelfRowState('10', '10')).toBe('low');
    expect(shelfRowState('11', '10')).toBe('ok');
  });

  it('the grace\u2019s floor: garbage arrivals coerce to zero — the empty shelf', () => {
    expect(shelfRowState('', 10)).toBe('out');
    expect(shelfRowState('abc', 10)).toBe('out');
    // a garbage reorder level reads 0 — a stocked shelf above zero is healthy
    expect(shelfRowState(5, '')).toBe('ok');
  });
});

describe('shelfShortfall (v2.423.0) — the owed units', () => {
  it('the owed shelf speaks its distance to the level', () => {
    expect(shelfShortfall(4, 10)).toBe(6);
    expect(shelfShortfall('4', '10')).toBe(6);
    expect(shelfShortfall(0, 10)).toBe(10);
  });

  it('the boundary and the healthy shelf owe NOTHING — floored at zero, never a negative debt', () => {
    expect(shelfShortfall(10, 10)).toBe(0);
    expect(shelfShortfall(20, 10)).toBe(0);
    expect(shelfShortfall('20', '10')).toBe(0);
  });

  it('the grace\u2019s floor: garbage arrivals coerce — the empty shelf owes its whole level', () => {
    expect(shelfShortfall('', 10)).toBe(10);
    expect(shelfShortfall('abc', '7')).toBe(7);
  });
});

describe('the wire\u2019s door (v2.423.0) — source pins on the record', () => {
  it('the products route grew the supplierId filter — additive, mirroring the categoryId shape', () => {
    expect(routeSrc).toContain("const supplierId = searchParams.get('supplierId') || '';");
    expect(routeSrc).toContain('where.supplierId = supplierId;');
    // the additive law: the door sits beside the category filter, the older
    // callers (no param) ride unchanged
    expect(routeSrc).toContain("if (categoryId) {\n    where.categoryId = categoryId;\n  }");
    // the absence key stays a CLIENT word — the wire never speaks 'none'
    expect(routeSrc).toContain("The 'none' absence key stays a CLIENT lens word");
  });

  it('the api client passes the filter — the drill never downloads the whole catalog', () => {
    expect(apiSrc).toContain("if (params?.supplierId) query.set('supplierId', params.supplierId);");
    expect(apiSrc).toContain('search?: string; supplierId?: string');
  });

  it('the lib grew the ONE home — the drill\u2019s arithmetic exported from product-groups', () => {
    expect(libSrc).toContain('export function supplierShelfSummary(');
    expect(libSrc).toContain('export function shelfRowState(');
    expect(libSrc).toContain('export function shelfShortfall(');
    // the mirror law: the summary reads the grouping strip's own reduce
    expect(libSrc).toContain('const group = buildSupplierGroups(own).find((g) => g.key === supplierId);');
  });
});

describe('the faces (v2.423.0) — source pins on the record', () => {
  it('the chip is a PRESS — the door opens, the row\u2019s own click stays the detail drill', () => {
    expect(tabSrc).toContain('data-testid="sup-products-chip"');
    expect(tabSrc).toContain('e.stopPropagation();\n                            setShelfSupplier(supplier);');
    // the honest zero stays pressable — the empty shelf is a REAL face
    expect(tabSrc).toContain("Open ${supplier.name}'s shelf — the products this supplier provides");
    expect(tabSrc).toContain("product${(supplier.productCount || 0) === 1 ? '' : 's'} provided");
  });

  it('the sheet is keyed by the supplier — a second press on another row opens THAT shelf fresh', () => {
    expect(tabSrc).toContain("key={shelfSupplier?.id ?? 'shelf-none'}");
    expect(tabSrc).toContain('<SupplierShelfSheet');
  });

  it('the sheet reads the ONE arithmetic — never a second copy', () => {
    expect(tabSrc).toContain("supplierShelfSummary, shelfRowState, shelfShortfall,");
    expect(tabSrc).toContain('const summary = supplier ? supplierShelfSummary(rows, supplier.id) :');
    expect(tabSrc).toContain('const state = shelfRowState(p.quantityInStock, p.reorderLevel);');
    expect(tabSrc).toContain('shelfShortfall(p.quantityInStock, p.reorderLevel)');
  });

  it('the sheet\u2019s honest faces carry their handles', () => {
    expect(tabSrc).toContain('data-testid="sup-shelf-sheet"');
    expect(tabSrc).toContain('data-testid="sup-shelf-title"');
    expect(tabSrc).toContain('data-testid="sup-shelf-summary"');
    expect(tabSrc).toContain('data-testid="sup-shelf-row"');
    expect(tabSrc).toContain('data-shelf-state={state}');
    expect(tabSrc).toContain('data-testid="sup-shelf-empty"');
    // the empty voice: the honest absence, never a hidden shelf
    expect(tabSrc).toContain('{supplier.name} provides nothing yet');
  });

  it('the row families wear the inventory desk\u2019s own vocabulary', () => {
    expect(tabSrc).toContain("'Out of stock'");
    expect(tabSrc).toContain('to reorder`');
    expect(tabSrc).toContain("'Healthy'");
    expect(tabSrc).toContain("'border-rose-200 bg-rose-50/60 dark:border-rose-500/25 dark:bg-rose-500/10'");
    expect(tabSrc).toContain("'border-amber-200 bg-amber-50/60 dark:border-amber-500/25 dark:bg-amber-500/10'");
  });

  it('the no-assertion law: the fetch rides only when the door names its supplier', () => {
    expect(tabSrc).toContain('supplierId: supplier?.id ?? \'\',');
    expect(tabSrc).toContain('enabled: !!supplier && !!storeId,');
  });
});
