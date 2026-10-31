// v2.308.0 SALE REFUNDS - the pure allocation seam's truth table.
//
// These pins need NO database: `refundableLinesFrom`, `computeRefundPlan`,
// `splitRefundAmounts` and `toRefundableTotal` are import-free pure
// functions (Decimal math only), so the exactness laws they encode can be
// pinned in milliseconds:
//
//   • THE EXACTNESS LAW ........ a full refund refunds EXACTLY the sale's
//                                totalAmount (partial tranches charge the
//                                proportional share; the exhausting tranche
//                                charges the line's REMAINING value)
//   • LINE_OVER_REFUND ......... requesting more than remains refundable
//                                throws the typed error, never silently
//                                clamps
//   • EMPTY_REFUND ............. all-zero quantities throw
//   • TAX COMPONENT ............ refunds split net/VAT by the SAME law as
//                                checkout (tax = total × r / (100 + r))
//   • RENTAL LINES ............. refundable but never restocked (the
//                                service filters isRentalItem)

import { describe, it, expect } from 'vitest';
import {
  RefundError,
  refundableLinesFrom,
  computeRefundPlan,
  splitRefundAmounts,
  toRefundableTotal,
  type SaleItemLike,
} from '@/lib/sale-refund-service';

function makeItem(overrides: Partial<SaleItemLike> & { id: string; quantity: number; lineTotal: number }): SaleItemLike {
  return {
    productId: `prod-${overrides.id}`,
    productName: `Item ${overrides.id}`,
    unitType: 'PIECE',
    pricePerUnit: 10,
    costPrice: 6,
    discountPercent: 0,
    taxRate: 16,
    isRentalItem: false,
    ...overrides,
  } as SaleItemLike;
}

describe('v2.308.0 refunds - refundableLinesFrom (the refund chain views)', () => {
  it('a fresh sale is fully refundable: refundable = sold, refundableValue = lineTotal', () => {
    const [view] = refundableLinesFrom(
      [makeItem({ id: 'l1', quantity: 3, lineTotal: 348 })],
      new Map(),
      new Map(),
    );
    expect(view.soldQuantity).toBe(3);
    expect(view.alreadyRefundedQuantity).toBe(0);
    expect(view.refundableQuantity).toBe(3);
    expect(view.lineTotal).toBe(348);
    expect(view.refundableValue).toBe(348);
  });

  it('prior chain refunds narrow the view (quantity AND value)', () => {
    const [view] = refundableLinesFrom(
      [makeItem({ id: 'l1', quantity: 3, lineTotal: 348 })],
      new Map([['l1', 1]]),
      new Map([['l1', 116]]),
    );
    expect(view.alreadyRefundedQuantity).toBe(1);
    expect(view.refundableQuantity).toBe(2);
    expect(view.refundableValue).toBe(232);
  });

  it('a corrupt chain (more refunded than sold) never goes negative', () => {
    const [view] = refundableLinesFrom(
      [makeItem({ id: 'l1', quantity: 2, lineTotal: 232 })],
      new Map([['l1', 99]]),
      new Map([['l1', 9999]]),
    );
    expect(view.alreadyRefundedQuantity).toBe(2);
    expect(view.refundableQuantity).toBe(0);
    expect(view.refundableValue).toBe(0);
  });
});

describe('v2.308.0 refunds - computeRefundPlan (the exactness law)', () => {
  it('a full refund charges the exact line totals - the sale total is conserved to the cent', () => {
    const items = [
      makeItem({ id: 'l1', quantity: 3, lineTotal: 348 }),
      makeItem({ id: 'l2', quantity: 1, lineTotal: 115 }),
    ];
    const views = refundableLinesFrom(items, new Map(), new Map());
    const plan = computeRefundPlan(views, [
      { saleItemId: 'l1', quantity: 3 },
      { saleItemId: 'l2', quantity: 1 },
    ]);
    expect(plan.refundTotal).toBe(463);
    expect(plan.allocations.every((a) => a.exhaustsLine)).toBe(true);
  });

  it('partial tranches sum EXACTLY to the line total across the whole chain', () => {
    const items = [makeItem({ id: 'l1', quantity: 3, lineTotal: 348 })];
    const views = refundableLinesFrom(items, new Map(), new Map());

    const t1 = computeRefundPlan(views, [{ saleItemId: 'l1', quantity: 1 }]);
    expect(t1.refundTotal).toBe(116); // 348 × 1/3

    // The chain now holds one refunded unit worth 116.
    const views2 = refundableLinesFrom(items, new Map([['l1', 1]]), new Map([['l1', t1.refundTotal]]));
    const t2 = computeRefundPlan(views2, [{ saleItemId: 'l1', quantity: 1 }]);
    expect(t2.refundTotal).toBe(116);

    // The exhausting tranche charges the REMAINING value (232) - not a
    // re-rounded fraction - so the chain sums to exactly 348.
    const views3 = refundableLinesFrom(items, new Map([['l1', 2]]), new Map([['l1', 232]]));
    const t3 = computeRefundPlan(views3, [{ saleItemId: 'l1', quantity: 1 }]);
    expect(t3.refundTotal).toBe(116);
    expect(t1.refundTotal + t2.refundTotal + t3.refundTotal).toBe(348);
  });

  it('requesting more than remains refundable throws LINE_OVER_REFUND (typed, never clamps)', () => {
    const views = refundableLinesFrom(
      [makeItem({ id: 'l1', quantity: 2, lineTotal: 232 })],
      new Map([['l1', 1]]),
      new Map([['l1', 116]]),
    );
    try {
      computeRefundPlan(views, [{ saleItemId: 'l1', quantity: 2 }]);
      expect.unreachable('must throw');
    } catch (err) {
      expect(err).toBeInstanceOf(RefundError);
      expect((err as RefundError).code).toBe('LINE_OVER_REFUND');
    }
  });

  it('an unknown saleItemId throws LINE_OVER_REFUND, not undefined math', () => {
    const views = refundableLinesFrom(
      [makeItem({ id: 'l1', quantity: 1, lineTotal: 116 })],
      new Map(),
      new Map(),
    );
    try {
      computeRefundPlan(views, [{ saleItemId: 'ghost', quantity: 1 }]);
      expect.unreachable('must throw');
    } catch (err) {
      expect((err as RefundError).code).toBe('LINE_OVER_REFUND');
    }
  });

  it('all-zero quantities throw EMPTY_REFUND', () => {
    const views = refundableLinesFrom(
      [makeItem({ id: 'l1', quantity: 1, lineTotal: 116 })],
      new Map(),
      new Map(),
    );
    try {
      computeRefundPlan(views, [{ saleItemId: 'l1', quantity: 0 }]);
      expect.unreachable('must throw');
    } catch (err) {
      expect((err as RefundError).code).toBe('EMPTY_REFUND');
    }
  });
});

describe('v2.308.0 refunds - splitRefundAmounts (the VAT-inside law)', () => {
  it('splits by the original rate snapshot: 116 gross at 16% → 100 net + 16 VAT', () => {
    const { refundNet, refundTax } = splitRefundAmounts(116, 16, { taxAmount: 16, totalAmount: 116 });
    expect(refundTax).toBe(16);
    expect(refundNet).toBe(100);
  });

  it('the same law checkout uses (total × rate / (100 + rate))', () => {
    // 2320 gross at 16% → VAT = 2320 × 16/116 = 320
    const { refundNet, refundTax } = splitRefundAmounts(2320, 16, { taxAmount: 320, totalAmount: 2320 });
    expect(refundTax).toBe(320);
    expect(refundNet).toBe(2000);
  });

  it('zero-tax sales refund as pure net', () => {
    const { refundNet, refundTax } = splitRefundAmounts(500, 0, { taxAmount: 0, totalAmount: 500 });
    expect(refundTax).toBe(0);
    expect(refundNet).toBe(500);
  });

  it('legacy rows without a rate snapshot fall back to the stored header proportion', () => {
    const { refundTax } = splitRefundAmounts(58, null, { taxAmount: 8, totalAmount: 58 });
    expect(refundTax).toBe(8);
  });
});

describe('v2.308.0 refunds - toRefundableTotal (the dialog headline)', () => {
  it('sums the chain views to the sale\'s remaining refundable value', () => {
    const views = refundableLinesFrom(
      [
        makeItem({ id: 'l1', quantity: 3, lineTotal: 348 }),
        makeItem({ id: 'l2', quantity: 1, lineTotal: 115 }),
      ],
      new Map([['l2', 1]]),
      new Map([['l2', 115]]),
    );
    expect(toRefundableTotal(views)).toBe(348);
  });
});
