// THE SHELF'S REORDER SUITE (v2.424.0) — THE ARC'S FIFTH WORD: the shelf
// answers its debt.
//
//   - the owed rows (shelfOwedRows): the reorder action's ONE arithmetic
//     — the id-claimed rows whose shelf sits at/below its reorder level
//     AND asks for a positive gap. restockNeedsAttention's own
//     nothing-to-order law rides (an out-of-stock row with reorder
//     level 0 has no order to place), so the census and the fold can
//     never disagree with the inventory banner's voice. The grace
//     coerces every number before the comparison ("9" vs 10 reads the
//     owed shelf — the lexicographic wound's regression guard), a stale
//     wire row never rides another supplier's order (the id is the
//     truth), and the maker's name rides the row for the pocket's
//     census.
//   - the owed units (shelfOwedUnits): every carried row's gap back to
//     its level, summed — each gap already floored by reorderGap, an
//     empty carry reads the honest zero.
//   - the fold's mirror: buildOrderHandoff over the owed rows lands
//     exactly the census's own lines and units — one arithmetic, many
//     faces.
//   - the faces: the debt strip keyed to its honest state (amber owes,
//     emerald all-healthy, neutral the at-level world), the press
//     disabled when nothing is owed, the fold's order of operations
//     (pocket → close → walk — the banner's own shape), and the
//     no-non-null-assertion law holding in the sheet.
//
// Every pin reads the SOURCE OF RECORD (source bytes, not memory) — the
// house rule since the verify scripts were born.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it, expect } from 'vitest';

import {
  shelfOwedRows,
  shelfOwedUnits,
  type ShelfReorderProduct,
} from '@/lib/product-groups';
import { reorderGap } from '@/lib/stock-order';
import { buildOrderHandoff } from '@/lib/order-handoff';

const read = (p: string) => readFileSync(join(process.cwd(), p), 'utf8');

const LIB = 'src/lib/product-groups.ts';
const TAB = 'src/app/(shell)/tabs/suppliers-tab.tsx';
const HANDOFF = 'src/lib/order-handoff.ts';
const libSrc = read(LIB);
const tabSrc = read(TAB);
const handoffSrc = read(HANDOFF);

const ROW = (over: Partial<ShelfReorderProduct> = {}): ShelfReorderProduct => ({
  id: 'prod_1',
  name: 'Bamburi Cement 50kg',
  sku: 'BCM-50',
  supplierId: 'sup_bamburi' as string | null,
  supplier: { id: 'sup_bamburi', name: 'Bamburi Cement Ltd' },
  quantityInStock: 30 as number | string,
  reorderLevel: 10 as number | string,
  pricePerUnit: 700 as number | string,
  costPrice: 620 as number | string | null,
  ...over,
});

describe('shelfOwedRows (v2.424.0) — the shelf\u2019s debt, one arithmetic', () => {
  it('an empty answer carries nothing — the honest zero', () => {
    expect(shelfOwedRows([], 'sup_bamburi')).toEqual([]);
  });

  it('a fully-stale answer carries nothing — a foreign row never rides the order', () => {
    const rows = [ROW({ id: 'prod_x', supplierId: 'sup_other', supplier: { id: 'sup_other', name: 'AkzoNobel Kenya (Dulux)' }, quantityInStock: 0, reorderLevel: 10 })];
    expect(shelfOwedRows(rows, 'sup_bamburi')).toEqual([]);
  });

  it('healthy shelves stay home — the order never asks for what is above its level', () => {
    const rows = [ROW({ quantityInStock: 30, reorderLevel: 10 })];
    expect(shelfOwedRows(rows, 'sup_bamburi')).toEqual([]);
  });

  it('an over-stocked shelf never reads a negative debt', () => {
    const rows = [ROW({ quantityInStock: 20, reorderLevel: 10 })];
    expect(shelfOwedRows(rows, 'sup_bamburi')).toEqual([]);
  });

  it('the empty shelf rides with its full gap — out is the deepest owe', () => {
    const rows = [ROW({ quantityInStock: 0, reorderLevel: 10 })];
    expect(shelfOwedRows(rows, 'sup_bamburi')).toEqual([
      { sku: 'BCM-50', name: 'Bamburi Cement 50kg', onHand: 0, reorderLevel: 10, supplierName: 'Bamburi Cement Ltd' },
    ]);
  });

  it('the under-level shelf rides with its gap — low is owed', () => {
    const rows = [ROW({ quantityInStock: 5, reorderLevel: 10 })];
    const owed = shelfOwedRows(rows, 'sup_bamburi');
    expect(owed).toHaveLength(1);
    expect(owed[0].onHand).toBe(5);
    expect(owed[0].reorderLevel).toBe(10);
  });

  it('the nothing-to-order law: an out shelf with reorder level 0 stays home — an order line asking 0 units would be a lie', () => {
    const rows = [ROW({ quantityInStock: 0, reorderLevel: 0 })];
    expect(shelfOwedRows(rows, 'sup_bamburi')).toEqual([]);
  });

  it('the boundary split: stock == level shows low but owes the order nothing — the census speaks the positive gaps only', () => {
    const rows = [ROW({ quantityInStock: 10, reorderLevel: 10 })];
    expect(shelfOwedRows(rows, 'sup_bamburi')).toEqual([]);
  });

  it('the grace: string arrivals coerce before the comparison — "9" vs 10 reads the owed shelf', () => {
    const rows = [ROW({ quantityInStock: '9' as number | string, reorderLevel: 10 })];
    const owed = shelfOwedRows(rows, 'sup_bamburi');
    expect(owed).toHaveLength(1);
    expect(owed[0].onHand).toBe(9);
    expect(owed[0].reorderLevel).toBe(10);
  });

  it('the grace holds on the healthy side: "12" vs 10 is no debt at all', () => {
    const rows = [ROW({ quantityInStock: '12' as number | string, reorderLevel: 10 })];
    expect(shelfOwedRows(rows, 'sup_bamburi')).toEqual([]);
  });

  it('the maker\u2019s name rides the row (the wire\u2019s own voice); an unhydrated row stays honestly null', () => {
    const rows = [
      ROW({ id: 'prod_1', quantityInStock: 0, reorderLevel: 10 }),
      ROW({ id: 'prod_2', sku: 'BCM-25', name: 'Bamburi Cement 25kg', supplier: null, quantityInStock: 0, reorderLevel: 5 }),
    ];
    const owed = shelfOwedRows(rows, 'sup_bamburi');
    expect(owed).toHaveLength(2);
    expect(owed[0].supplierName).toBe('Bamburi Cement Ltd');
    expect(owed[1].supplierName).toBeNull();
  });

  it('a mixed shelf keeps only its owed rows — the healthy neighbours stay home', () => {
    const rows = [
      ROW({ id: 'prod_1', quantityInStock: 0, reorderLevel: 10 }),
      ROW({ id: 'prod_2', sku: 'BCM-25', name: 'Bamburi Cement 25kg', quantityInStock: 40, reorderLevel: 10 }),
    ];
    const owed = shelfOwedRows(rows, 'sup_bamburi');
    expect(owed).toHaveLength(1);
    expect(owed[0].sku).toBe('BCM-50');
  });
});

describe('shelfOwedUnits (v2.424.0) — the census\u2019s unit voice', () => {
  it('an empty carry reads the honest zero', () => {
    expect(shelfOwedUnits([])).toBe(0);
  });

  it('the units are the gaps, summed — never a stock read', () => {
    const owed = [
      { sku: 'A', name: 'A', onHand: 0, reorderLevel: 10, supplierName: 'S' },
      { sku: 'B', name: 'B', onHand: 5, reorderLevel: 10, supplierName: 'S' },
    ];
    expect(shelfOwedUnits(owed)).toBe(15);
  });

  it('each gap is floored — a hand-built row above its level adds zero, never a negative debt', () => {
    const owed = [
      { sku: 'A', name: 'A', onHand: 20, reorderLevel: 10, supplierName: 'S' },
      { sku: 'B', name: 'B', onHand: 5, reorderLevel: 10, supplierName: 'S' },
    ];
    expect(shelfOwedUnits(owed)).toBe(5);
    expect(reorderGap({ sku: 'A', name: 'A', onHand: 20, reorderLevel: 10 })).toBe(0);
  });
});

describe('the fold\u2019s mirror (v2.424.0) — the census and the order can never disagree', () => {
  it('buildOrderHandoff over the owed rows lands exactly the census\u2019s own lines and units', () => {
    const rows = [
      ROW({ id: 'prod_1', quantityInStock: 0, reorderLevel: 10 }),
      ROW({ id: 'prod_2', sku: 'BCM-25', name: 'Bamburi Cement 25kg', quantityInStock: 5, reorderLevel: 10 }),
      ROW({ id: 'prod_3', sku: 'BCM-75', name: 'Bamburi Cement 75kg', quantityInStock: 40, reorderLevel: 10 }),
    ];
    const owed = shelfOwedRows(rows, 'sup_bamburi');
    const payload = buildOrderHandoff('store_main', 'MBUMAH HARDWARE — Main', new Date('2026-11-07T00:00:00Z'), owed);
    expect(payload.items).toHaveLength(owed.length);
    expect(payload.units).toBe(shelfOwedUnits(owed));
    expect(payload.units).toBe(15);
    expect(payload.items.every((item) => item.quantity > 0)).toBe(true);
    expect(payload.items.every((item) => item.supplierName === 'Bamburi Cement Ltd')).toBe(true);
  });

  it('the pocket\u2019s honest map pre-picks the maker when every line names one — the shelf\u2019s own rows qualify', () => {
    const rows = [ROW({ quantityInStock: 0, reorderLevel: 10 })];
    const owed = shelfOwedRows(rows, 'sup_bamburi');
    expect(owed.every((row) => row.supplierName === 'Bamburi Cement Ltd')).toBe(true);
    // the pre-pick law lives in order-handoff (one home) — the shelf's
    // rows carry the nested name the map reads from the LIVE shelf, so
    // the pen dresses by the desk's own side, never the pocket's.
    expect(handoffSrc).toContain('prePick');
    expect(handoffSrc).toContain('namedSuppliers.every((s) => s.id === first.id)');
  });
});

describe('the faces (v2.424.0) — the debt strip and the press, pinned to the source', () => {
  it('the lib reads the order list\u2019s own law — one home, never a second copy', () => {
    expect(libSrc).toContain("import { reorderGap, restockNeedsAttention, type RestockRow } from '@/lib/stock-order';");
    expect(libSrc).toContain('.filter((row) => restockNeedsAttention(row))');
    expect(libSrc).toContain('export function shelfOwedRows(');
    expect(libSrc).toContain('export function shelfOwedUnits(owed: readonly RestockRow[]): number');
    expect(libSrc).toContain('export interface ShelfReorderProduct extends SupplierGroupProduct {');
  });

  it('the sheet\u2019s wiring: the lib\u2019s owed arithmetic, keyed to the supplier with the honest empty carry', () => {
    expect(tabSrc).toContain('shelfOwedRows, shelfOwedUnits,');
    expect(tabSrc).toContain("const owedRows = supplier ? shelfOwedRows(rows, supplier.id) : [];");
    expect(tabSrc).toContain('const owedUnits = shelfOwedUnits(owedRows);');
    expect(tabSrc).toContain('const owedMaker = orderHandoffSupplier(owedRows);');
    expect(tabSrc).toContain('const owed = owedRows.length > 0;');
  });

  it('the fold\u2019s order of operations: pocket → close → walk (the banner\u2019s own shape), the empty fold never walks', () => {
    const onReorder = tabSrc.slice(tabSrc.indexOf('const onReorder = () => {'), tabSrc.indexOf('};', tabSrc.indexOf('const onReorder = () => {')));
    expect(onReorder).toContain("if (!supplier || !owed) return;");
    expect(onReorder).toContain("buildOrderHandoff(storeId, reorderStoreName, new Date(), owedRows)");
    expect(onReorder).toContain('if (payload.items.length === 0) return;');
    const writeAt = onReorder.indexOf('writeOrderHandoff(payload);');
    const closeAt = onReorder.indexOf('onOpenChange(false);');
    const walkAt = onReorder.indexOf("setActiveTab('purchase-orders');");
    expect(writeAt).toBeGreaterThan(-1);
    expect(closeAt).toBeGreaterThan(writeAt);
    expect(walkAt).toBeGreaterThan(closeAt);
  });

  it('the press: testid, disabled-when-nothing-owed, the Send icon, the honest double-state voice', () => {
    expect(tabSrc).toContain('data-testid="sup-shelf-reorder"');
    expect(tabSrc).toContain('disabled={!owed}');
    expect(tabSrc).toContain('Reorder this shelf');
    expect(tabSrc).toContain('Fold the owed rows into the purchase order desk');
    expect(tabSrc).toContain('Nothing to reorder yet — the order carries only the shelves under their levels with units to ask');
    expect(tabSrc).toContain("'Nothing to reorder'");
  });

  it('the debt strip: the census testids and the three honest faces, each family keyed to its state', () => {
    expect(tabSrc).toContain('data-testid="sup-shelf-actions"');
    expect(tabSrc).toContain('data-testid="sup-shelf-owed"');
    expect(tabSrc).toContain("'All healthy — nothing to reorder'");
    expect(tabSrc).toContain("'Nothing to reorder — every shelf sits at or above its level'");
    expect(tabSrc).toContain("to reorder`");
    expect(tabSrc).toContain("'border-amber-200 bg-amber-50/60 dark:border-amber-500/25 dark:bg-amber-500/10'");
    expect(tabSrc).toContain("'border-emerald-200 bg-emerald-50/60 dark:border-emerald-500/25 dark:bg-emerald-500/10'");
    expect(tabSrc).toContain("'border-border/60 bg-card'");
  });

  it('the branch\u2019s name rides STORE_LIST with the honest fallback — the banner\u2019s own derivation', () => {
    expect(tabSrc).toContain("STORE_LIST.find((s) => s.id === storeId)?.name ?? 'MBUMAH HARDWARE'");
    expect(tabSrc).toContain("import { STORE_LIST } from '@/lib/store-info';");
  });

  it('the toast speaks the census — lines, units, and the maker when every row agrees', () => {
    expect(tabSrc).toContain("The shelf's debt rides to the purchase order desk");
    expect(tabSrc).toContain("carried${owedMaker ? ` for ${owedMaker}` : ''}");
  });

  it('the no-non-null-assertion law holds in the sheet — the baseline bought, never borrowed', () => {
    expect(tabSrc).toContain("supplier?.id ?? ''");
    const fn = tabSrc.slice(tabSrc.indexOf('function SupplierShelfSheet'));
    const body = fn.slice(0, fn.indexOf('\n}', fn.indexOf('aria-label=')));
    expect(body).not.toMatch(/supplier!\./);
    expect(body).not.toMatch(/owedRows\[/);
  });
});
