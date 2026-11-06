import { describe, it, expect } from 'vitest';
import {
  formatRestockOrder,
  formatRestockLine,
  restockRowsNeedingAttention,
  restockNeedsAttention,
  reorderGap,
  type RestockRow,
} from '@/lib/stock-order';

/**
 * stock-order-v2414.test.ts — THE ORDER LIST pins its bytes.
 *
 * The inventory desk's copy face speaks a plain-text restock order through
 * src/lib/stock-order.ts; this suite pins the formatter's honest voice the
 * way the support-copy family pins its own (env-diagnostics-v2400): exact
 * bytes, deterministic ordering, and the honest absences (no rows → null,
 * nothing-to-order → never spoken).
 */

const ROW = (over: Partial<RestockRow> = {}): RestockRow => ({
  sku: 'SKU-1',
  name: 'Cement 32.5N',
  onHand: 4,
  reorderLevel: 10,
  ...over,
});

const ORDER = (rows: RestockRow[]) =>
  formatRestockOrder({ storeName: 'MBUMAH HARDWARE - Juja Main', dateLabel: 'Fri, 6 Nov 2026', rows });

describe('stock-order v2.414.0 — the order list hands you the words', () => {
  it('the header speaks the shop, the branch with the date, and the count', () => {
    const text = ORDER([ROW()]);
    expect(text).not.toBeNull();
    expect(text?.split('\n').slice(0, 3).join('\n')).toBe(
      [
        'MBUMAH HARDWARE — RESTOCK ORDER',
        'Branch: MBUMAH HARDWARE - Juja Main · Fri, 6 Nov 2026',
        '1 item needs attention',
      ].join('\n'),
    );
  });

  it('the count line speaks its plural honestly', () => {
    const one = ORDER([ROW()]);
    expect(one).not.toBeNull();
    expect(one?.split('\n')[2]).toBe('1 item needs attention');
    const two = ORDER([ROW(), ROW({ sku: 'SKU-2', name: 'Nails 4"' })]);
    expect(two).not.toBeNull();
    expect(two?.split('\n')[2]).toBe('2 items need attention');
  });

  it('an order line names the badge, the shelf, and the gap math', () => {
    expect(formatRestockLine(ROW({ onHand: 0, reorderLevel: 10 }))).toBe(
      '[OUT] Cement 32.5N (SKU SKU-1) — on hand 0 / reorder 10 — order 10',
    );
    expect(formatRestockLine(ROW({ onHand: 4, reorderLevel: 10 }))).toBe(
      '[LOW] Cement 32.5N (SKU SKU-1) — on hand 4 / reorder 10 — order 6',
    );
  });

  it('out-of-stock shelves ride first, then the deepest gap, then the sku word', () => {
    const rows = [
      ROW({ sku: 'B-2', name: 'Deep low', onHand: 1, reorderLevel: 10 }),
      ROW({ sku: 'A-3', name: 'Low low', onHand: 8, reorderLevel: 10 }),
      ROW({ sku: 'C-1', name: 'Out', onHand: 0, reorderLevel: 5 }),
    ];
    const text = ORDER(rows);
    expect(text).not.toBeNull();
    const lines = text?.split('\n').slice(4) ?? [];
    expect(lines).toEqual([
      '[OUT] Out (SKU C-1) — on hand 0 / reorder 5 — order 5',
      '[LOW] Deep low (SKU B-2) — on hand 1 / reorder 10 — order 9',
      '[LOW] Low low (SKU A-3) — on hand 8 / reorder 10 — order 2',
    ]);
  });

  it('the caller\u2019s row order cannot leak into the bytes (determinism)', () => {
    const a = ORDER([
      ROW({ sku: 'B-2', onHand: 1, reorderLevel: 10 }),
      ROW({ sku: 'C-1', onHand: 0, reorderLevel: 5 }),
      ROW({ sku: 'A-3', onHand: 8, reorderLevel: 10 }),
    ]);
    const b = ORDER([
      ROW({ sku: 'A-3', onHand: 8, reorderLevel: 10 }),
      ROW({ sku: 'C-1', onHand: 0, reorderLevel: 5 }),
      ROW({ sku: 'B-2', onHand: 1, reorderLevel: 10 }),
    ]);
    expect(a).not.toBeNull();
    expect(b).not.toBeNull();
    expect(a).toBe(b);
  });

  it('healthy shelves never join the order', () => {
    const text = ORDER([ROW({ onHand: 11, reorderLevel: 10 })]);
    expect(text).toBeNull();
    expect(restockNeedsAttention(ROW({ onHand: 11, reorderLevel: 10 }))).toBe(false);
  });

  it('the nothing-to-order law: an out shelf with reorder 0 is not spoken', () => {
    // The shelf's own level says "don't stock it" — an order line asking
    // for 0 units would be a lie with a checkbox.
    const text = ORDER([ROW({ onHand: 0, reorderLevel: 0 })]);
    expect(text).toBeNull();
    expect(reorderGap(ROW({ onHand: 0, reorderLevel: 0 }))).toBe(0);
    expect(restockNeedsAttention(ROW({ onHand: 0, reorderLevel: 0 }))).toBe(false);
  });

  it('the empty shelf ask is honest absence: null, never an empty shell', () => {
    expect(ORDER([])).toBeNull();
    expect(restockRowsNeedingAttention([])).toEqual([]);
  });

  it('the selector filters and sorts; the formatter rides it', () => {
    const rows = restockRowsNeedingAttention([
      ROW({ sku: 'A-3', onHand: 8, reorderLevel: 10 }),
      ROW({ sku: 'HEALTHY', onHand: 50, reorderLevel: 10 }),
      ROW({ sku: 'C-1', onHand: 0, reorderLevel: 5 }),
      ROW({ sku: 'SILENT', onHand: 0, reorderLevel: 0 }),
    ]);
    expect(rows.map((r) => r.sku)).toEqual(['C-1', 'A-3']);
  });

  it('the same input answers the same bytes (the copy face is idempotent)', () => {
    const rows = [ROW(), ROW({ sku: 'SKU-2', name: 'Nails 4"', onHand: 0, reorderLevel: 8 })];
    expect(ORDER(rows)).toBe(ORDER([...rows].reverse()));
  });
});
