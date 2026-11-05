/**
 * REFUND GAP CLOSURE (v2.372.0) — the gap comes home.
 *
 * A sale's header total can sit ABOVE the Σ of its line grosses: legacy
 * and seeded rows carry VAT added ON TOP of the line sums (the audit-dev
 * seed's own shape — tx_thk_001 sells 15,000 of lines under a 17,400
 * header), while the modern VAT-INCLUSIVE checkout keeps the tax inside
 * the lines and can carry a cart-level discount BELOW them. Before this
 * round a refund that exhausted EVERY refundable line settled only the
 * line world's Σ — the difference stranded as an un-refundable remainder,
 * the original stuck at PARTIAL forever, the customer short-paid by
 * exactly the tax the header promised.
 *
 * THE LAW: when (and only when) a tranche exhausts the LAST refundable
 * line, the refund settles the header's remaining consideration EXACTLY
 * (`closeRefundGap` — the gap distributes across the tranche's
 * allocations proportionally to their gross, 2dp HALF_UP, the last
 * allocation absorbing the rounding remainder). Σ refund items still
 * equals the refunded header total — the Σ-balance invariant the journal,
 * drawer and receipt all read — and the original flips to REFUNDED by the
 * status law it already speaks.
 *
 * THE CONTRACT, UNIFIED (same round): the transactions desk's two landing
 * chips now scrub their word from the address bar on dismissal — the
 * loyalty desk's v2.318.0 contract, worn by `?txn-pay=` and `?txn-type=`
 * at last. A stale word that outlives the lens it named is a lie the next
 * refresh would resurrect.
 */
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import {
  closeRefundGap,
  computeRefundPlan,
  type RefundableLineView,
} from '@/lib/sale-refund-service';

// ── the pure seam ────────────────────────────────────────────────────────

const view = (
  saleItemId: string,
  soldQuantity: number,
  alreadyRefundedQuantity: number,
  lineTotal: number,
): RefundableLineView => ({
  saleItemId,
  productId: `p-${saleItemId}`,
  productName: `line ${saleItemId}`,
  unitType: 'PIECE',
  soldQuantity,
  alreadyRefundedQuantity,
  refundableQuantity: soldQuantity - alreadyRefundedQuantity,
  lineTotal,
  refundableValue:
    Math.round(((lineTotal * (soldQuantity - alreadyRefundedQuantity)) / soldQuantity + Number.EPSILON) * 100) / 100,
  unitRefundValue: Math.round((lineTotal / soldQuantity + Number.EPSILON) * 100) / 100,
  isRentalItem: false,
});

const sumGross = (allocations: readonly { refundGross: number }[]) =>
  Math.round(allocations.reduce((s, a) => s + a.refundGross, 0) * 100) / 100;

describe('closeRefundGap — the header settles when the last line goes home', () => {
  it('the seeded shape closes the tax gap in one tranche (tx_thk_002: 42,000 of lines under a 46,720 header)', () => {
    const views = [view('i1', 25, 0, 30000), view('i2', 15, 0, 12000)];
    const planned = computeRefundPlan(views, [
      { saleItemId: 'i1', quantity: 25 },
      { saleItemId: 'i2', quantity: 15 },
    ]);
    expect(planned.refundTotal).toBe(42000); // the line world's Σ — the gap not yet spoken
    const closed = closeRefundGap(views, planned.allocations, 46720);
    expect(closed.gapClosed).toBe(true);
    expect(closed.refundTotal).toBe(46720); // the header's remaining consideration, exact
    expect(closed.allocations.map((a) => a.refundGross)).toEqual([33371.43, 13348.57]);
    expect(sumGross(closed.allocations)).toBe(46720); // THE Σ-BALANCE INVARIANT
  });

  it('a single-line sale closes the whole gap on its one line (tx_thk_001: 15,000 under 17,400)', () => {
    const views = [view('k1', 20, 0, 15000)];
    const planned = computeRefundPlan(views, [{ saleItemId: 'k1', quantity: 20 }]);
    const closed = closeRefundGap(views, planned.allocations, 17400);
    expect(closed.gapClosed).toBe(true);
    expect(closed.refundTotal).toBe(17400);
    expect(closed.allocations.map((a) => a.refundGross)).toEqual([17400]);
  });

  it('a cart-discount NEGATIVE gap shrinks the closing tranche (lines 1,000 under a 500 header)', () => {
    const views = [view('j1', 9, 0, 900), view('j2', 1, 0, 100)];
    const planned = computeRefundPlan(views, [
      { saleItemId: 'j1', quantity: 9 },
      { saleItemId: 'j2', quantity: 1 },
    ]);
    const closed = closeRefundGap(views, planned.allocations, 500);
    expect(closed.gapClosed).toBe(true);
    expect(closed.refundTotal).toBe(500);
    expect(closed.allocations.map((a) => a.refundGross)).toEqual([450, 50]); // every share ≥ 0
    expect(sumGross(closed.allocations)).toBe(500);
  });

  it('the gap distributes PROPORTIONALLY (a 2:1 line split shares a +3 gap as 2:1)', () => {
    const views = [view('q1', 2, 0, 200), view('q2', 1, 0, 100)];
    const planned = computeRefundPlan(views, [
      { saleItemId: 'q1', quantity: 2 },
      { saleItemId: 'q2', quantity: 1 },
    ]);
    const closed = closeRefundGap(views, planned.allocations, 303);
    expect(closed.gapClosed).toBe(true);
    expect(closed.allocations.map((a) => a.refundGross)).toEqual([202, 101]);
    expect(sumGross(closed.allocations)).toBe(303);
  });

  it('the LAST allocation absorbs the rounding remainder (a +0.01 penny gap on equal lines)', () => {
    const views = [view('o1', 1, 0, 33.33), view('o2', 1, 0, 33.33)];
    const planned = computeRefundPlan(views, [
      { saleItemId: 'o1', quantity: 1 },
      { saleItemId: 'o2', quantity: 1 },
    ]);
    const closed = closeRefundGap(views, planned.allocations, 66.67);
    expect(closed.gapClosed).toBe(true);
    expect(closed.refundTotal).toBe(66.67);
    expect(closed.allocations.map((a) => a.refundGross)).toEqual([33.34, 33.33]);
    expect(sumGross(closed.allocations)).toBe(66.67);
  });

  it('an INTERIOR tranche is untouched — one open line keeps the line world\u2019s estimate', () => {
    const views = [view('m1', 25, 0, 30000), view('m2', 15, 0, 12000)];
    const planned = computeRefundPlan(views, [{ saleItemId: 'm1', quantity: 25 }]);
    const closed = closeRefundGap(views, planned.allocations, 46720);
    expect(closed.gapClosed).toBe(false);
    expect(closed.refundTotal).toBe(30000);
    expect(closed.allocations.map((a) => a.refundGross)).toEqual([30000]);
  });

  it('a MULTI-TRANCHE final tranche closes only the header\u2019s REMAINING consideration', () => {
    // line 1 went home in a prior tranche (30000, already spoken); this
    // tranche takes line 2 — the expected total is 46720 − 30000.
    const views = [view('n1', 25, 25, 30000), view('n2', 15, 0, 12000)];
    const planned = computeRefundPlan(views, [{ saleItemId: 'n2', quantity: 15 }]);
    expect(planned.refundTotal).toBe(12000);
    const closed = closeRefundGap(views, planned.allocations, 46720 - 30000);
    expect(closed.gapClosed).toBe(true);
    expect(closed.refundTotal).toBe(16720); // 12000 gross + 4720 stranded tax−discount
    expect(closed.allocations.map((a) => a.refundGross)).toEqual([16720]);
  });

  it('a zero gap is a no-op (the already-settled header never rewrites the plan)', () => {
    const views = [view('p1', 1, 0, 100), view('p2', 1, 0, 100)];
    const planned = computeRefundPlan(views, [
      { saleItemId: 'p1', quantity: 1 },
      { saleItemId: 'p2', quantity: 1 },
    ]);
    const closed = closeRefundGap(views, planned.allocations, 200);
    expect(closed.gapClosed).toBe(false);
    expect(closed.refundTotal).toBe(200);
    expect(closed.allocations.map((a) => a.refundGross)).toEqual([100, 100]);
  });

  it('an over-refunded header is skipped — the whole-sale guard speaks instead', () => {
    const views = [view('s1', 1, 0, 100)];
    const planned = computeRefundPlan(views, [{ saleItemId: 's1', quantity: 1 }]);
    const closed = closeRefundGap(views, planned.allocations, -5);
    expect(closed.gapClosed).toBe(false);
    expect(closed.refundTotal).toBe(100);
  });

  it('an exhausted sale with no views cannot close (nothing to settle, nothing to rewrite)', () => {
    const closed = closeRefundGap([], [], 100);
    expect(closed.gapClosed).toBe(false);
    expect(closed.refundTotal).toBe(0);
  });
});

// ── the transactional wiring ─────────────────────────────────────────────

describe('applySaleRefund speaks the law through its source bytes', () => {
  const service = readFileSync('src/lib/sale-refund-service.ts', 'utf8');

  it('the service plans through computeRefundPlan and closes through closeRefundGap', () => {
    expect(service.includes('const planned = computeRefundPlan(views, params.requestedLines);')).toBe(true);
    expect(
      service.includes('const { allocations, refundTotal } = closeRefundGap(views, planned.allocations, expectedTotal);'),
    ).toBe(true);
  });

  it('the expected total is the header minus the chain so far', () => {
    expect(service.includes('const expectedTotal = round2(toDec(originalTotal).minus(priorTotal));')).toBe(true);
  });

  it('the status law already speaks REFUNDED at the boundary (the flip needs no new bytes)', () => {
    expect(service.includes("originalRemaining <= 0.004 ? 'REFUNDED' : 'PARTIAL'")).toBe(true);
  });
});

// ── the dialog mirrors the service ───────────────────────────────────────

describe('the refund dialog mirrors the gap closure', () => {
  const desk = readFileSync('src/app/(shell)/tabs/transactions-tab.tsx', 'utf8');

  it('the estimate settles to the header remaining when the tranche exhausts every line', () => {
    expect(desk.includes('const settlesInFull = useMemo(')).toBe(true);
    expect(desk.includes('(selected[l.saleItemId] ?? 0) + l.alreadyRefundedQuantity >= l.soldQuantity - 1e-9')).toBe(true);
    expect(desk.includes('const quotedTotal = settlesInFull ? headerRemaining : estimatedTotal;')).toBe(true);
  });

  it('the header remaining is derived from the wire\u2019s own figures (totalAmount minus prior gross)', () => {
    expect(desk.includes("data && 'totalAmount' in data ? Number(data.totalAmount) : 0")).toBe(true);
    expect(desk.includes('lines.reduce((s, l) => s + (l.lineTotal - l.refundableValue), 0)')).toBe(true);
  });

  it('the settle hint names the flip and the gap honestly', () => {
    expect(desk.includes('data-testid="refund-settles-hint"')).toBe(true);
    expect(desk.includes('Settles this sale in full — the original flips to REFUNDED')).toBe(true);
    expect(desk.includes("{settleGap > 0 ? 'above' : 'below'} the line totals")).toBe(true);
  });

  it('the success face speaks the settled truth instead of a KES 0 remainder', () => {
    expect(desk.includes('The original sale is fully settled — nothing remains refundable')).toBe(true);
  });
});

// ── the chip contract, unified ───────────────────────────────────────────

describe('the transactions desk\u2019s landing chips scrub their words (the loyalty contract, unified)', () => {
  const desk = readFileSync('src/app/(shell)/tabs/transactions-tab.tsx', 'utf8');
  const blockFrom = (testid: string) => {
    // the LAST occurrence is the button's own attribute (the first rides
    // the comment block above the chip); the scrub sits between the
    // setters and the attr, so the slice reaches back past it.
    const at = desk.lastIndexOf(`data-testid="${testid}"`);
    expect(at).toBeGreaterThan(-1);
    // v2.397.0 THE ELDER LOOM: onDismiss is the loomed chip's LAST prop —
    // the window re-anchors forward (the pre-loom form looked BACK)
    return desk.slice(at, at + 1400);
  };

  it('the pay chip\u2019s dismissal scrubs ?txn-pay= from the address bar', () => {
    const block = blockFrom('txn-landing-word');
    expect(block).toContain("buildSearchWithoutParams(window.location.search, ['txn-pay'])");
    expect(block).toContain('window.history.replaceState(null, \'\', next ? next : window.location.pathname);');
    expect(block).toContain("setPaymentFilter('all')");
    expect(block).toContain('setTxnLandingLive(false)');
  });

  it('the type chip\u2019s dismissal scrubs ?txn-type= from the address bar', () => {
    const block = blockFrom('txn-type-landing-word');
    expect(block).toContain("buildSearchWithoutParams(window.location.search, ['txn-type'])");
    expect(block).toContain('window.history.replaceState(null, \'\', next ? next : window.location.pathname);');
    expect(block).toContain("setTypeFilter('all')");
    expect(block).toContain('setTxnTypeLandingLive(false)');
  });

  it('both scrubs are SSR-guarded like every window touch', () => {
    const guarded = desk.match(/if \(typeof window !== 'undefined'\) \{\s*const next = buildSearchWithoutParams/g) ?? [];
    expect(guarded.length).toBe(2);
  });

  it('the desk imports the scrub helper through the ONE home', () => {
    expect(desk.includes("import { buildSearchWithoutParams, parseInitialNamedMember } from '@/lib/tab-url';")).toBe(true);
  });
});
