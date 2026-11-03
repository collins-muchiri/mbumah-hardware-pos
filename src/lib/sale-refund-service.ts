/**
 * SALE REFUND SERVICE (v2.308.0) - the refund comes home.
 *
 * The audit's PHASE 7.5 asked for full/partial refunds with restock,
 * movement records, original-sale linkage, over-refund rejection and
 * permission enforcement; the UI's Refund button had been a placeholder
 * ("would call API") and no backend existed. This module is the backend:
 *
 *   • PURE seam (client-bundle safe): `RefundErrorCode`, `RefundError`,
 *     `RefundableLineView`, `refundableLinesFrom`, `computeRefundPlan`,
 *     `splitRefundAmounts` - the allocation math lives here so vitest can
 *     pin it without a database.
 *   • TRANSACTIONAL application: `applySaleRefund` runs ONE interactive
 *     `db.$transaction` (the checkout route's atomicity pattern):
 *
 *       1. Re-reads the original INSIDE the tx + guards (type, status,
 *          tenant) - no TOCTOU between validation and write.
 *       2. Sums the refund chain (refunds of this sale, per original line
 *          via SaleItem.refundedSaleItemId) - "already refunded" is exact,
 *          so a refund can never exceed what remains.
 *       3. Creates the REFUND SalesTransaction (own receipt number via
 *          withSequenceRetry/P2002) + per-line items linked back to the
 *          original lines.
 *       4. Restocks (base units via conversionFactor, 4dp HALF_UP) and
 *          writes RETURN StockMovement rows keyed
 *          `refund:{refundTxId}:{saleItemId}` (replay-safe).
 *       5. Writes the refund Payment row; CASH portion hits the drawer
 *          ledger as a NEGATIVE signed amount (same Σ-balance pattern as
 *          checkout); DEBT portion decrements the customer's balance with
 *          the checkout's conditional-decrement pattern + writes a credit
 *          note on the DebtLedger.
 *       6. Posts the mirror journal entry via `recordRefundJournalEntry`
 *          (debits revenue + VAT, credits the tender legs, reverses COGS)
 *          - balanced to the cent or the whole refund rolls back.
 *       7. Flips the original's paymentStatus (REFUNDED when nothing
 *          remains refundable, PARTIAL otherwise) and creates the refund's
 *          Receipt row.
 *
 *     If ANY step throws, the entire transaction rolls back - no partial
 *     refunds, no orphaned movements, no unbalanced journals.
 *   • LOYALTY CLAWBACK (v2.309.0 - the refund closes its loop): points the
 *     original sale earned come home with the money. The claw is the same
 *     floor law as earning (1 point per KES 100 refunded), capped by the
 *     wallet's CURRENT balance so an already-redeemed wallet can never go
 *     negative, and written as one ADJUST/ADJUSTED LoyaltyTransaction row
 *     linked to the REFUND transaction. The floor-per-tranche law is
 *     superadditive (Σ floor(tᵢ/100) ≤ floor(Σtᵢ/100)), so cumulative
 *     clawbacks across a refund chain can never exceed what the sale
 *     originally earned.
 */

import Decimal from 'decimal.js';
import { KES } from '@/lib/money';
import { toDec, round2 } from '@/lib/utils/financialMath';
import { calculateEarnedPoints } from '@/lib/loyalty-utils';
import { generateReceiptNumber } from '@/lib/helpers';
import { withSequenceRetry, isP2002 } from '@/lib/sequence';
import { recordRefundJournalEntry } from '@/lib/account-helper';
import type { Prisma } from '@prisma/client';

// ── Typed errors ─────────────────────────────────────────────────────────

export type RefundErrorCode =
  | 'NOT_FOUND'
  | 'TENANT_MISMATCH'
  | 'NOT_REFUNDABLE'
  | 'EMPTY_REFUND'
  | 'LINE_OVER_REFUND'
  | 'AMOUNT_OVER_REFUND'
  | 'NOT_STRANDED';

const REFUND_ERROR_MESSAGES: Record<RefundErrorCode, string> = {
  NOT_FOUND: 'Transaction not found.',
  TENANT_MISMATCH: 'This transaction belongs to a different store.',
  NOT_REFUNDABLE: 'Only completed or partially refunded sales can be refunded.',
  EMPTY_REFUND: 'Select at least one item and quantity to refund.',
  LINE_OVER_REFUND: 'Refund quantity exceeds what remains refundable on this line.',
  AMOUNT_OVER_REFUND: 'Refund total exceeds the amount still refundable on this sale.',
  NOT_STRANDED: 'This sale has no stranded gap to settle - its lines are not fully refunded, or nothing remains on the header.',
};

export class RefundError extends Error {
  readonly code: RefundErrorCode;
  readonly details?: Record<string, unknown>;

  constructor(code: RefundErrorCode, details?: Record<string, unknown>) {
    super(REFUND_ERROR_MESSAGES[code]);
    this.name = 'RefundError';
    this.code = code;
    this.details = details;
  }
}

// ── Pure allocation seam ─────────────────────────────────────────────────

/** The original statuses that may be refunded (mirrors the schema's vocabulary). */
export const REFUNDABLE_ORIGINAL_STATUSES: readonly string[] = ['COMPLETED', 'PARTIAL'];

export interface SaleItemLike {
  id: string;
  productId: string;
  productName: string;
  quantity: number | Decimal;
  unitType: string;
  pricePerUnit: number | Decimal;
  costPrice: number | Decimal;
  discountPercent: number | Decimal;
  taxRate: number | Decimal;
  lineTotal: number | Decimal;
  isRentalItem: boolean;
}

export interface RefundableLineView {
  saleItemId: string;
  productId: string;
  productName: string;
  unitType: string;
  /** Quantity sold on the original line (selling units). */
  soldQuantity: number;
  /** Quantity already refunded across the whole refund chain. */
  alreadyRefundedQuantity: number;
  /** soldQuantity − alreadyRefundedQuantity (never negative). */
  refundableQuantity: number;
  /** The original line's gross value (VAT-inclusive, 2dp). */
  lineTotal: number;
  /** Value still refundable on this line (2dp) - lineTotal minus prior refunds. */
  refundableValue: number;
  /** Value per selling unit (2dp, for the dialog's estimate). */
  unitRefundValue: number;
  isRentalItem: boolean;
}

export interface RefundRequestLine {
  saleItemId: string;
  quantity: number;
}

export interface RefundAllocation {
  line: RefundableLineView;
  /** Refunded quantity (selling units). */
  quantity: number;
  /** Refunded gross value for this tranche (2dp, VAT-inclusive). */
  refundGross: number;
  /** True when this tranche exhausts the line's refundable value. */
  exhaustsLine: boolean;
}

const toNum = (v: number | Decimal): number => toDec(v).toNumber();

/**
 * Builds the refundable-line views for an original sale. `priorQtyBySaleItemId`
 * and `priorGrossBySaleItemId` come from the refund chain (exact SUMs over
 * the REFUND transactions' items linked via refundedSaleItemId).
 */
export function refundableLinesFrom(
  items: readonly SaleItemLike[],
  priorQtyBySaleItemId: ReadonlyMap<string, number>,
  priorGrossBySaleItemId: ReadonlyMap<string, number>,
): RefundableLineView[] {
  return items.map((item) => {
    const soldQuantity = toNum(item.quantity);
    const lineTotal = round2(toDec(item.lineTotal));
    const alreadyRefundedQuantity = Math.min(
      soldQuantity,
      Math.max(0, priorQtyBySaleItemId.get(item.id) ?? 0),
    );
    const priorGross = Math.min(lineTotal, Math.max(0, priorGrossBySaleItemId.get(item.id) ?? 0));
    const refundableQuantity = round2(toDec(soldQuantity).minus(alreadyRefundedQuantity));
    const refundableValue = round2(toDec(lineTotal).minus(priorGross));
    return {
      saleItemId: item.id,
      productId: item.productId,
      productName: item.productName,
      unitType: item.unitType,
      soldQuantity,
      alreadyRefundedQuantity,
      refundableQuantity,
      lineTotal,
      refundableValue,
      unitRefundValue: soldQuantity > 0 ? round2(toDec(lineTotal).div(soldQuantity)) : 0,
      isRentalItem: item.isRentalItem,
    };
  });
}

/**
 * Allocates the refund gross per requested line. THE EXACTNESS LAW:
 * a tranche that exhausts a line's refundable value charges the line's
 * REMAINING value (refundableValue), not a re-rounded fraction - so
 * partial + partial + partial always sums to exactly lineTotal, and a
 * full-sale refund refunds exactly totalAmount. Intermediate tranches
 * charge the proportional share (2dp HALF_UP).
 */
export function computeRefundPlan(
  lines: readonly RefundableLineView[],
  requested: readonly RefundRequestLine[],
): { allocations: RefundAllocation[]; refundTotal: number } {
  const byId = new Map(lines.map((l) => [l.saleItemId, l]));
  const allocations: RefundAllocation[] = [];
  let total = new Decimal(0);
  let sawAny = false;

  for (const req of requested) {
    const quantity = toDec(req.quantity).toDecimalPlaces(4, Decimal.ROUND_HALF_UP).toNumber();
    if (!Number.isFinite(quantity) || quantity <= 0) continue;
    const line = byId.get(req.saleItemId);
    if (!line) {
      throw new RefundError('LINE_OVER_REFUND', { saleItemId: req.saleItemId });
    }
    if (quantity > line.refundableQuantity + 1e-9) {
      throw new RefundError('LINE_OVER_REFUND', {
        saleItemId: req.saleItemId,
        requested: quantity,
        refundable: line.refundableQuantity,
      });
    }
    // Consumption order: this tranche consumes from what remains NOW
    // (alreadyRefundedQuantity already accounts for prior tranches, and
    // prior tranches within the SAME call consume their share first - the
    // map below tracks the running remainder).
    sawAny = true;
    const exhaustsLine = toDec(quantity).plus(line.alreadyRefundedQuantity).gte(line.soldQuantity);
    const remainingValueBefore = line.refundableValue -
      allocations
        .filter((a) => a.line.saleItemId === line.saleItemId)
        .reduce((s, a) => s + a.refundGross, 0);
    const refundGross = exhaustsLine
      ? round2(toDec(remainingValueBefore))
      : round2(
          toDec(line.lineTotal)
            .mul(toDec(quantity))
            .div(line.soldQuantity),
        );
    if (refundGross < 0) {
      throw new RefundError('AMOUNT_OVER_REFUND', { saleItemId: req.saleItemId });
    }
    allocations.push({ line, quantity, refundGross, exhaustsLine });
    total = total.plus(toDec(refundGross));
  }

  if (!sawAny) throw new RefundError('EMPTY_REFUND');
  return { allocations, refundTotal: round2(total) };
}

/**
 * THE GAP-CLOSURE LAW (v2.372.0): a sale's header total can sit ABOVE the
 * Σ of its line grosses - legacy and seeded rows carry VAT added ON TOP of
 * the line sums (totalAmount = Σ lineTotal + tax − discount), while the
 * modern VAT-INCLUSIVE checkout keeps the tax inside the lines and may
 * carry a cart-level discount BELOW them. The line world alone therefore
 * cannot settle the header: a refund that exhausted EVERY refundable line
 * used to strand the difference as an un-refundable remainder - the
 * original stuck at PARTIAL forever (no quantity left to refund the gap
 * with), the customer short-paid by exactly the tax the header promised.
 *
 * When (and only when) this tranche exhausts the LAST refundable line of
 * the sale, the refund settles the header's remaining consideration
 * EXACTLY: expectedTotal = original.totalAmount − Σ prior refunds. The
 * residual gap distributes across the tranche's allocations
 * proportionally to their gross (2dp HALF_UP), with the LAST allocation
 * absorbing the rounding remainder - so Σ refund items still equals the
 * refunded header total (the Σ-balance invariant the journal, drawer and
 * receipt all read), and the original flips to REFUNDED by the status law
 * it already speaks.
 *
 * Every share is gross × (expected / Σ gross), so for a non-negative
 * expected total no share can push an allocation negative - the
 * proportionality IS the guard. A tranche that leaves any line open is
 * untouched (an interior tranche charges line gross - the money for the
 * goods, honest at every intermediate step); an over-refunded header
 * (expected < 0) or a zero-gross plan is skipped and the whole-sale guard
 * speaks AMOUNT_OVER_REFUND as before.
 */
export function closeRefundGap(
  views: readonly RefundableLineView[],
  planned: readonly RefundAllocation[],
  expectedTotal: number,
): { allocations: RefundAllocation[]; refundTotal: number; gapClosed: boolean } {
  const refundTotalBefore = round2(planned.reduce((s, a) => s + a.refundGross, 0));
  const allocatedQtyBySaleItemId = new Map<string, number>();
  for (const a of planned) {
    allocatedQtyBySaleItemId.set(
      a.line.saleItemId,
      (allocatedQtyBySaleItemId.get(a.line.saleItemId) ?? 0) + a.quantity,
    );
  }
  // The tranche closes the sale only when EVERY line's remaining quantity
  // is consumed by this tranche plus the chain that came before it.
  const allExhausted =
    views.length > 0 &&
    views.every(
      (l) => l.refundableQuantity - (allocatedQtyBySaleItemId.get(l.saleItemId) ?? 0) <= 1e-9,
    );
  const untouched = { allocations: [...planned], refundTotal: refundTotalBefore, gapClosed: false };
  if (!allExhausted) return untouched;
  const expected = round2(expectedTotal);
  const gap = round2(toDec(expected).minus(refundTotalBefore));
  if (expected < 0 || refundTotalBefore <= 0 || Math.abs(gap) < 0.005) return untouched;
  // Proportional shares (2dp HALF_UP); the LAST allocation absorbs the
  // rounding remainder so Σ adjustments equals the gap exactly.
  const adjustments = planned.map((a) =>
    round2(toDec(gap).mul(toDec(a.refundGross)).div(refundTotalBefore)),
  );
  adjustments[adjustments.length - 1] = round2(
    toDec(gap).minus(adjustments.slice(0, -1).reduce((s, v) => s + v, 0)),
  );
  if (planned.some((a, i) => a.refundGross + adjustments[i] < 0)) return untouched;
  const allocations = planned.map((a, i) => ({
    ...a,
    refundGross: round2(a.refundGross + adjustments[i]),
  }));
  return { allocations, refundTotal: expected, gapClosed: true };
}

/**
 * The loyalty clawback law (v2.309.0): refunding money returns the points
 * that money earned. The claw is the SAME floor rule as earning (1 point
 * per KES 100, via calculateEarnedPoints), then capped by the wallet's
 * current balance (floored at 0) so a partially-redeemed wallet never goes
 * negative. Pure and import-light - the transactional side reads the
 * balance and asserts this exact number.
 */
export function refundClawbackPoints(refundTotal: number, currentBalance: number): number {
  const earned = calculateEarnedPoints(refundTotal);
  const balance = Number.isFinite(currentBalance) ? Math.max(0, Math.floor(currentBalance)) : 0;
  return Math.min(earned, balance);
}

/**
 * The sale's still-refundable total - Σ refundableValue across the views
 * (2dp). The dialog's headline number; the service re-derives the same
 * figure inside the transaction, so the two can never disagree.
 */
export function toRefundableTotal(lines: readonly RefundableLineView[]): number {
  return round2(lines.reduce<Decimal>((s, l) => s.plus(toDec(l.refundableValue)), new Decimal(0)));
}

/**
 * The refund's net/VAT split - THE SAME LAW as checkout (v2.13.1): the VAT
 * component lives INSIDE the refunded consideration, derived from the
 * ORIGINAL sale's tax-rate snapshot: tax = total × rate / (100 + rate).
 * Falls back to the stored header proportion for legacy rows without items.
 */
export function splitRefundAmounts(
  refundTotal: number,
  originalTaxRate: number | Decimal | null,
  original: { taxAmount: number | Decimal; totalAmount: number | Decimal },
): { refundNet: number; refundTax: number } {
  const total = KES(refundTotal).round().toNumber();
  if (total <= 0) return { refundNet: 0, refundTax: 0 };
  const rate = originalTaxRate != null ? toDec(originalTaxRate).toNumber() : null;
  let refundTax: number;
  if (rate != null && rate >= 0 && rate < 100) {
    refundTax = KES(total).taxComponent(rate).round().toNumber();
  } else {
    // Legacy fallback: proportional to the stored header split.
    const storedTotal = toDec(original.totalAmount);
    const storedTax = toDec(original.taxAmount);
    refundTax = storedTotal.greaterThan(0)
      ? round2(storedTax.mul(toDec(total)).div(storedTotal))
      : 0;
  }
  // The tax component can never exceed the refunded consideration.
  if (refundTax > total) refundTax = total;
  return { refundNet: round2(toDec(total).minus(refundTax)), refundTax };
}

// ── The row-state voice (v2.373.0) ───────────────────────────────────────

/**
 * The residual consideration a full-remaining refund would still leave
 * unreachable. v2.372.0's gap closure settles the header when the LAST
 * refundable line dies inside a LIVE refund tranche - but the rows that
 * stranded BEFORE that law shipped (legacy PARTIAL originals whose every
 * line is already refunded by the chain, header remainder still > 0)
 * predate it and can never self-heal. This epsilon is the same "settled
 * to the cent" tolerance the status flip speaks (remaining ≤ 0.004).
 */
export const STRANDED_EPSILON = 0.004;

export type RefundRowStateKind =
  | 'SETTLES_FULL'
  | 'SETTLES_FULL_WITH_GAP'
  | 'STRANDED'
  | 'SETTLED';

export interface RefundRowState {
  kind: RefundRowStateKind;
  /** What a full-remaining refund would charge: the header's remaining
   * consideration (totalAmount − Σ chain refunds), 2dp. */
  fullRefundAmount: number;
  /** fullRefundAmount − Σ refundableValue across the views (the VAT-on-top
   * gap a full refund rides above the line totals; ≥ 0, 2dp). */
  settleGap: number;
  /** The unreachable remainder on a stranded original (0 elsewhere, 2dp). */
  strandedAmount: number;
}

/**
 * THE ROW-LEVEL SETTLE AFFORDANCE (v2.373.0): the transactions desk's
 * rows speak the settle truth BEFORE the dialog opens, derived from the
 * SAME SUMS the dialog and the POST re-derive - never a client guess.
 * A refundable sale (COMPLETED/PARTIAL, at least one open line) settles
 * in full when its last open line dies; when the header sits above the
 * line Σ the chip names the gap (SETTLES_FULL_WITH_GAP - the dialog's
 * amber hint, promoted to the row). A refundable sale with NO open line
 * and a positive remainder is STRANDED (the legacy rows that predate
 * v2.372.0; the heal settles them); with no remainder it is SETTLED.
 * Non-sale rows and statuses outside the refundable vocabulary wear no
 * state at all (null).
 */
export function deriveRefundRowState(args: {
  transactionType: string;
  paymentStatus: string;
  views: readonly RefundableLineView[];
  /** totalAmount − Σ chain refunds, the header's remaining consideration. */
  headerRemaining: number;
}): RefundRowState | null {
  if (args.transactionType !== 'SALE' || !REFUNDABLE_ORIGINAL_STATUSES.includes(args.paymentStatus)) {
    return null;
  }
  const fullRefundAmount = round2(Math.max(0, args.headerRemaining));
  const refundableTotal = toRefundableTotal(args.views);
  const settleGap = round2(Math.max(0, toDec(fullRefundAmount).minus(refundableTotal).toNumber()));
  const anyRefundable = args.views.some((l) => l.refundableQuantity > 1e-9);
  if (!anyRefundable) {
    const stranded = fullRefundAmount > STRANDED_EPSILON;
    return {
      kind: stranded ? 'STRANDED' : 'SETTLED',
      fullRefundAmount,
      settleGap,
      strandedAmount: stranded ? fullRefundAmount : 0,
    };
  }
  return {
    kind: settleGap > STRANDED_EPSILON ? 'SETTLES_FULL_WITH_GAP' : 'SETTLES_FULL',
    fullRefundAmount,
    settleGap,
    strandedAmount: 0,
  };
}

export interface StrandedAssessment {
  /** Every line is exhausted by the chain AND the header still carries a
   * remainder - the v2.372.0 gap-closure can never reach this row (its
   * law rides a LIVE tranche's allocations), so only the heal can. */
  stranded: boolean;
  /** The unreachable remainder (2dp; 0 when not stranded). */
  strandedAmount: number;
}

/**
 * The stranded-original assessment (pure): a sale strands when the refund
 * chain has consumed EVERY line (no quantity left to allocate) while the
 * header's remaining consideration is still positive - the customer's
 * money and the store's ledger both stuck. The transactional heal
 * re-derives this INSIDE its transaction before it moves anything.
 */
export function assessStrandedOriginal(
  views: readonly RefundableLineView[],
  expectedTotal: number,
): StrandedAssessment {
  const allExhausted = views.every((l) => l.refundableQuantity <= 1e-9);
  const strandedAmount = round2(expectedTotal);
  const stranded = allExhausted && strandedAmount > STRANDED_EPSILON;
  return { stranded, strandedAmount: stranded ? strandedAmount : 0 };
}

// ── Transactional application ────────────────────────────────────────────

export interface ApplySaleRefundParams {
  originalId: string;
  storeId: string;
  organizationId: string;
  actorUserId: string;
  requestedLines: readonly RefundRequestLine[];
  restock: boolean;
  reason?: string | null;
  notes?: string | null;
}

export interface ApplySaleRefundResult {
  refund: {
    id: string;
    receiptNumber: string;
    totalAmount: number;
    taxAmount: number;
    paymentStatus: string;
    transactionType: string;
  };
  originalReceiptNumber: string;
  originalPaymentStatus: string;
  refundTotal: number;
  restocked: { productId: string; baseUnits: number }[];
  remainingRefundable: number;
  /** v2.309.0 loyalty clawback - null when there was no wallet or nothing to claw. */
  loyalty: { clawedBack: number; balanceAfter: number } | null;
}

/**
 * Applies the refund atomically. `client` is the Prisma client (or a
 * transaction client); the interactive $transaction is opened HERE so the
 * guard → plan → write sequence is one atomic unit (no TOCTOU).
 */
export async function applySaleRefund(
  client: {
    $transaction: (fn: (tx: Prisma.TransactionClient) => Promise<ApplySaleRefundResult>) => Promise<ApplySaleRefundResult>;
  },
  params: ApplySaleRefundParams,
): Promise<ApplySaleRefundResult> {
  return client.$transaction(async (tx) => {
    // 1. Re-read the original INSIDE the tx + hard guards.
    const original = await tx.salesTransaction.findUnique({
      where: { id: params.originalId },
      include: { items: true, payments: true, debtLedgers: true },
    });
    if (!original) throw new RefundError('NOT_FOUND');
    if (original.storeId !== params.storeId) throw new RefundError('TENANT_MISMATCH');
    if (
      original.transactionType !== 'SALE' ||
      !REFUNDABLE_ORIGINAL_STATUSES.includes(original.paymentStatus)
    ) {
      throw new RefundError('NOT_REFUNDABLE', {
        transactionType: original.transactionType,
        paymentStatus: original.paymentStatus,
      });
    }

    // 2. The refund chain - exact per-line prior refunds.
    const priorRefunds = await tx.salesTransaction.findMany({
      where: { refundedTransactionId: original.id },
      select: { items: { select: { refundedSaleItemId: true, quantity: true, lineTotal: true } } },
    });
    const priorQtyBySaleItemId = new Map<string, number>();
    const priorGrossBySaleItemId = new Map<string, number>();
    let priorTotal = new Decimal(0);
    for (const refund of priorRefunds) {
      for (const item of refund.items) {
        if (!item.refundedSaleItemId) continue;
        priorQtyBySaleItemId.set(
          item.refundedSaleItemId,
          (priorQtyBySaleItemId.get(item.refundedSaleItemId) ?? 0) + toNum(item.quantity),
        );
        priorGrossBySaleItemId.set(
          item.refundedSaleItemId,
          (priorGrossBySaleItemId.get(item.refundedSaleItemId) ?? 0) + toNum(item.lineTotal),
        );
      }
      priorTotal = priorTotal.plus(toDec(refund.items.reduce<Decimal>(
        (s, i) => s.plus(toDec(i.lineTotal)),
        new Decimal(0),
      )));
    }

    const views = refundableLinesFrom(original.items, priorQtyBySaleItemId, priorGrossBySaleItemId);
    const planned = computeRefundPlan(views, params.requestedLines);

    // v2.372.0 THE GAP-CLOSURE LAW: when this tranche exhausts the LAST
    // refundable line, the refund settles the header's remaining
    // consideration exactly (the gap rides the items, Σ-balance kept) -
    // the original flips to REFUNDED instead of stranding the tax as an
    // un-refundable remainder. Interior tranches pass through untouched.
    const originalTotal = toNum(original.totalAmount);
    const expectedTotal = round2(toDec(originalTotal).minus(priorTotal));
    const { allocations, refundTotal } = closeRefundGap(views, planned.allocations, expectedTotal);

    // Whole-sale guard: the chain can never exceed the original's total.
    if (toDec(priorTotal).plus(refundTotal).gt(originalTotal + 1e-9)) {
      throw new RefundError('AMOUNT_OVER_REFUND', {
        originalTotal,
        alreadyRefunded: round2(priorTotal),
        requested: refundTotal,
      });
    }

    // 3. The REFUND transaction - own receipt number, retry on the unique hit.
    const refundTaxRate = original.items[0]?.taxRate ?? null;
    const { refundNet, refundTax } = splitRefundAmounts(refundTotal, refundTaxRate, {
      taxAmount: original.taxAmount,
      totalAmount: original.totalAmount,
    });
    // COGS uses the ORIGINAL line's costPrice snapshot × refunded qty
    // (selling units, mirroring checkout's cogsAmount accumulation).
    const itemCostById = new Map(original.items.map((i) => [i.id, i]));
    const cogsAmount = allocations
      .filter((a) => !a.line.isRentalItem)
      .reduce<Decimal>((s, a) => {
        const item = itemCostById.get(a.line.saleItemId);
        const cost = item ? toDec(item.costPrice) : new Decimal(0);
        return s.plus(cost.mul(toDec(a.quantity)));
      }, new Decimal(0))
      .toDecimalPlaces(2, Decimal.ROUND_HALF_UP)
      .toNumber();

    const refundTx = await withSequenceRetry(async () => {
      const receiptNumber = generateReceiptNumber();
      return tx.salesTransaction.create({
        data: {
          storeId: original.storeId,
          receiptNumber,
          customerId: original.customerId,
          cashierId: params.actorUserId,
          subtotal: refundNet,
          taxAmount: refundTax,
          discountAmount: 0,
          totalAmount: refundTotal,
          paymentMethod: original.paymentMethod,
          paymentStatus: 'COMPLETED',
          transactionType: 'REFUND',
          notes: [
            params.notes?.trim() ||
              (params.reason ? `Refund reason: ${params.reason}` : null),
            // v2.309.0: the chain reference ALWAYS rides the notes — the
            // refund receipt's "Refund of" meta line reads it, so the paper
            // trail never loses the original sale to a clerk's reason pick.
            `Refund of ${original.receiptNumber}`,
          ]
            .filter(Boolean)
            .join(' · '),
          refundedTransactionId: original.id,
          items: {
            create: allocations.map((a) => {
              const item = itemCostById.get(a.line.saleItemId);
              return {
                productId: a.line.productId,
                productName: a.line.productName,
                quantity: a.quantity,
                unitType: a.line.unitType,
                pricePerUnit: item ? item.pricePerUnit : 0,
                costPrice: item ? item.costPrice : 0,
                discountPercent: item ? item.discountPercent : 0,
                taxRate: item ? item.taxRate : 0,
                lineTotal: a.refundGross,
                isRentalItem: a.line.isRentalItem,
                refundedSaleItemId: a.line.saleItemId,
              };
            }),
          },
        },
        include: { items: true },
      });
    }, 3).catch((err) => {
      if (isP2002(err)) {
        // A receipt-number collision survived 3 retries - fail the refund
        // atomically rather than reuse a number.
        throw new RefundError('NOT_REFUNDABLE', { cause: 'receipt-number-collision' });
      }
      throw err;
    });

    // 4. Restock + RETURN movements (base units via conversionFactor).
    const restocked: { productId: string; baseUnits: number }[] = [];
    if (params.restock) {
      for (const a of allocations) {
        if (a.line.isRentalItem) continue;
        const product = await tx.product.findUnique({ where: { id: a.line.productId } });
        if (!product) continue;
        const factor = product.conversionFactor != null ? toDec(product.conversionFactor) : new Decimal(1);
        const baseUnits = factor
          .mul(toDec(a.quantity))
          .toDecimalPlaces(4, Decimal.ROUND_HALF_UP)
          .toNumber();
        if (baseUnits === 0) continue;
        await tx.product.update({
          where: { id: product.id },
          data: { quantityInStock: { increment: baseUnits } },
        });
        await tx.stockMovement.create({
          data: {
            storeId: original.storeId,
            productId: product.id,
            movementType: 'RETURN',
            quantity: baseUnits,
            referenceId: original.id,
            idempotencyKey: `refund:${refundTx.id}:${a.line.saleItemId}:${a.quantity}`,
            performedBy: params.actorUserId,
            notes: `Refund of ${original.receiptNumber} (${refundTx.receiptNumber})`,
          },
        });
        restocked.push({ productId: product.id, baseUnits });
      }
    }

    // 5. The refund Payment row + tender side effects.
    await tx.payment.create({
      data: {
        storeId: original.storeId,
        transactionId: refundTx.id,
        paymentMethod: original.paymentMethod,
        amount: refundTotal,
        currency: 'KES',
        status: 'COMPLETED',
        reference: `Refund of ${original.receiptNumber}`,
      },
    });

    // Tender shares mirror the original's COMPLETED payment rows
    // (SPLIT-aware); the largest leg absorbs the ≤ 1-cent allocation dust.
    const completedPayments = original.payments.filter((p) => p.status === 'COMPLETED');
    const tenderTotal = completedPayments.reduce<Decimal>(
      (s, p) => s.plus(toDec(p.amount)),
      new Decimal(0),
    );
    const shareOf = (amount: number): number => {
      if (tenderTotal.lessThanOrEqualTo(0)) return refundTotal;
      return KES(refundTotal).multiply(toDec(amount).div(tenderTotal)).round().toNumber();
    };
    const tenderShares: Record<string, number> = {};
    for (const p of completedPayments) {
      tenderShares[p.paymentMethod] = (tenderShares[p.paymentMethod] ?? 0) + shareOf(toNum(p.amount));
    }
    // Absorb dust into the largest leg so Σ shares === refundTotal exactly.
    const shareSum = Object.values(tenderShares).reduce((s, v) => s + v, 0);
    const dust = round2(toDec(refundTotal).minus(shareSum));
    if (dust !== 0) {
      const largest = Object.entries(tenderShares).sort((a, b) => b[1] - a[1])[0];
      if (largest) tenderShares[largest[0]] = round2(toDec(largest[1]).plus(dust));
    }

    // CASH portion → the drawer ledger, SIGNED NEGATIVE (money out) with
    // the same Σ-balance pattern as checkout.
    const cashPortion = tenderShares['CASH'] ?? 0;
    if (cashPortion > 0) {
      const agg = await tx.cashDrawerLog.aggregate({
        where: { storeId: original.storeId },
        _sum: { amount: true },
      });
      const runningBalance = round2(
        toDec(agg._sum.amount ?? 0).minus(cashPortion),
      );
      await tx.cashDrawerLog.create({
        data: {
          storeId: original.storeId,
          userId: params.actorUserId,
          action: 'REFUND',
          amount: -cashPortion,
          balance: runningBalance,
          notes: `Refund ${refundTx.receiptNumber} of sale ${original.receiptNumber}`,
        },
      });
    }

    // DEBT portion → the customer's balance comes down (conditional
    // decrement, floored at 0) + a NEGATIVE DebtLedger credit note row.
    const debtPortion = tenderShares['DEBT'] ?? 0;
    if (debtPortion > 0 && original.customerId) {
      const customer = await tx.customer.findUnique({ where: { id: original.customerId } });
      if (customer) {
        const currentBalance = toDec(customer.currentDebtBalance).toNumber();
        const decrement = Math.min(Math.max(0, currentBalance), debtPortion);
        if (decrement > 0) {
          const claimed = await tx.customer.updateMany({
            where: { id: customer.id, currentDebtBalance: { gte: decrement } },
            data: { currentDebtBalance: { decrement } },
          });
          if (claimed.count === 0) {
            // A concurrent update moved the balance between the read and
            // the claim; floor at whatever stands NOW (never go negative).
            const fresh = await tx.customer.findUnique({ where: { id: customer.id } });
            const floored = fresh ? Math.min(toDec(fresh.currentDebtBalance).toNumber(), decrement) : 0;
            if (floored > 0) {
              await tx.customer.update({
                where: { id: customer.id },
                data: { currentDebtBalance: { decrement: floored } },
              });
            }
          }
        }
        const dueDate = new Date();
        await tx.debtLedger.create({
          data: {
            storeId: original.storeId,
            customerId: original.customerId,
            transactionId: refundTx.id,
            amountOwed: -debtPortion,
            amountPaid: 0,
            balance: -debtPortion,
            dueDate,
            status: 'SETTLED',
            agingBucket: 'CURRENT',
            notes: `Refund credit note for ${original.receiptNumber}`,
            idempotencyKey: `refund-ledger:${refundTx.id}`,
          },
        });
      }
    }

    // 6. The mirror journal entry - balanced to the cent or rollback.
    await recordRefundJournalEntry(tx, {
      storeId: original.storeId,
      organizationId: params.organizationId,
      actorUserId: params.actorUserId,
      receiptNumber: refundTx.receiptNumber,
      originalReceiptNumber: original.receiptNumber,
      transactionId: refundTx.id,
      grossRevenue: refundNet,
      taxAmount: refundTax,
      paymentBreakdown: {
        cash: tenderShares['CASH'] && tenderShares['CASH'] > 0 ? tenderShares['CASH'] : undefined,
        mpesa: tenderShares['MPESA'] && tenderShares['MPESA'] > 0 ? tenderShares['MPESA'] : undefined,
        giftCard: tenderShares['GIFT_CARD'] && tenderShares['GIFT_CARD'] > 0 ? tenderShares['GIFT_CARD'] : undefined,
        credit: tenderShares['DEBT'] && tenderShares['DEBT'] > 0 ? tenderShares['DEBT'] : undefined,
      },
      cogsAmount: params.restock ? cogsAmount : 0,
      postImmediately: true,
    });

    // 7. Flip the original's status; receipt row for the refund.
    const originalRemaining = round2(toDec(originalTotal).minus(priorTotal).minus(refundTotal));
    const newOriginalStatus = originalRemaining <= 0.004 ? 'REFUNDED' : 'PARTIAL';
    await tx.salesTransaction.update({
      where: { id: original.id },
      data: { paymentStatus: newOriginalStatus },
    });
    await tx.receipt.create({
      data: {
        storeId: original.storeId,
        transactionId: refundTx.id,
        receiptNumber: refundTx.receiptNumber,
        receiptType: 'DIGITAL',
      },
    });

    // 8. The loyalty clawback - points earned on the sale come home with
    //    the money (v2.309.0). The claw follows the same floor law as
    //    earning, capped by the wallet's CURRENT balance; the conditional
    //    decrement keeps a concurrently-redeemed wallet from going
    //    negative (the claim loses, the claw forgives). The ADJUST row
    //    links to the REFUND transaction so the loyalty ledger can
    //    deep-link the paper trail.
    let loyalty: ApplySaleRefundResult['loyalty'] = null;
    if (original.customerId) {
      const wallet = await tx.customer.findUnique({
        where: { id: original.customerId },
        select: { loyaltyPoints: true },
      });
      if (wallet) {
        const claw = refundClawbackPoints(refundTotal, Number(wallet.loyaltyPoints ?? 0));
        if (claw > 0) {
          const claimed = await tx.customer.updateMany({
            where: { id: original.customerId, loyaltyPoints: { gte: claw } },
            data: { loyaltyPoints: { decrement: claw } },
          });
          if (claimed.count > 0) {
            const balanceAfter = Number(wallet.loyaltyPoints ?? 0) - claw;
            await tx.loyaltyTransaction.create({
              data: {
                storeId: original.storeId,
                customerId: original.customerId,
                points: -claw,
                transactionType: 'ADJUST',
                type: 'ADJUSTED',
                transactionId: refundTx.id,
                balanceAfter,
                reason: `Refund clawback for ${original.receiptNumber}`,
                reference: refundTx.receiptNumber,
              },
            });
            loyalty = { clawedBack: claw, balanceAfter };
          }
        }
      }
    }

    return {
      refund: {
        id: refundTx.id,
        receiptNumber: refundTx.receiptNumber,
        totalAmount: refundTotal,
        taxAmount: refundTax,
        paymentStatus: 'COMPLETED',
        transactionType: 'REFUND',
      },
      originalReceiptNumber: original.receiptNumber,
      originalPaymentStatus: newOriginalStatus,
      refundTotal,
      restocked,
      remainingRefundable: Math.max(0, originalRemaining),
      loyalty,
    };
  });
}

// ── The stranded-gap heal (v2.373.0) ─────────────────────────────────────

export interface HealStrandedOriginalParams {
  originalId: string;
  storeId: string;
  organizationId: string;
  actorUserId: string;
  notes?: string | null;
}

export interface HealStrandedOriginalResult {
  /** v2.374.0: which heal fired — 'HEALED' (money moved: the zero-item
   * REFUND event settled the stranded remainder) or 'REPAIRED' (the status
   * caught up: the chain already covered the sale, nothing was left, no
   * money moved). Both flip the original to REFUNDED. */
  mode: 'HEALED' | 'REPAIRED';
  /** The settlement event — null when REPAIRED (nothing moved). */
  refund: {
    id: string;
    receiptNumber: string;
    totalAmount: number;
    taxAmount: number;
    paymentStatus: string;
    transactionType: string;
  } | null;
  originalId: string;
  originalReceiptNumber: string;
  originalPaymentStatus: string;
  /** The status the original wore BEFORE the heal (the audit row's oldValues). */
  originalPriorPaymentStatus: string;
  /** The stranded remainder the heal settled (0 when REPAIRED). */
  refundTotal: number;
  /** The v2.373.0 marker: the row came home (either mode). */
  healed: true;
  loyalty: { clawedBack: number; balanceAfter: number } | null;
}

/**
 * THE STRANDED-GAP HEAL (v2.373.0): settles a legacy stranded original.
 * v2.372.0's gap closure rides a LIVE refund tranche's allocations - it
 * can only fire while a line still has quantity to die on. The rows that
 * stranded BEFORE that law (every line already consumed by the chain, the
 * header's remainder still positive) have no quantity left to allocate,
 * so `computeRefundPlan` throws EMPTY_REFUND and the sale sits at PARTIAL
 * forever - the customer short-paid, the ledger park forever. This heal
 * is the settlement those rows were owed: ONE atomic transaction that
 *
 *   1. re-reads the original + guards (type SALE, refundable status,
 *      tenant) - the same TOCTOU-free posture as `applySaleRefund`;
 *   2. re-derives the chain SUMs and the views, then RE-derives the
 *      stranded assessment INSIDE the transaction (NOT_STRANDED unless
 *      every line is exhausted AND the remainder is positive);
 *   3. creates the REFUND SalesTransaction with NO items - the money
 *      settles the header's remainder exactly (Σ-balance trivially true:
 *      the event total IS the header remainder), its notes carry the
 *      chain reference so the receipt's "Refund of" meta still reads;
 *   4. writes the Payment row, splits the tender across the original's
 *      COMPLETED payment legs (largest leg absorbs the dust), and speaks
 *      the same side effects a live refund speaks - the CASH portion hits
 *      the drawer ledger signed negative, the DEBT portion credits the
 *      customer's balance with a credit-note DebtLedger row;
 *   5. posts the mirror journal entry (balanced to the cent or rollback;
 *      zero items → zero COGS reversal);
 *   6. flips the original to REFUNDED (the remainder IS the gap - nothing
 *      can remain) and creates the refund's Receipt row;
 *   7. claws back the loyalty points the settled money earned (the same
 *      floor law, capped by the wallet's current balance).
 *
 * v2.374.0 THE STATUS-REPAIR PATH: when the assessment finds an EXHAUSTED
 * sale with NOTHING left on the header (0 ≤ expected ≤ epsilon) the row is
 * a status LIE, not a money problem - the repair flips the badge to
 * REFUNDED and NOTHING ELSE (no money, no receipt, no journal; result mode
 * 'REPAIRED', refund null). An over-refunded header (expected < 0) is
 * refused - the anomaly stays visible; open lines throw NOT_STRANDED as
 * before. The result's `mode` tells the two apart.
 *
 * If ANY step throws, the whole heal rolls back - no partial settlements.
 */
export async function healStrandedOriginal(
  client: {
    $transaction: (fn: (tx: Prisma.TransactionClient) => Promise<HealStrandedOriginalResult>) => Promise<HealStrandedOriginalResult>;
  },
  params: HealStrandedOriginalParams,
): Promise<HealStrandedOriginalResult> {
  return client.$transaction(async (tx) => {
    // 1. Re-read the original INSIDE the tx + the same hard guards.
    const original = await tx.salesTransaction.findUnique({
      where: { id: params.originalId },
      include: { items: true, payments: true, debtLedgers: true },
    });
    if (!original) throw new RefundError('NOT_FOUND');
    if (original.storeId !== params.storeId) throw new RefundError('TENANT_MISMATCH');
    if (
      original.transactionType !== 'SALE' ||
      !REFUNDABLE_ORIGINAL_STATUSES.includes(original.paymentStatus)
    ) {
      throw new RefundError('NOT_REFUNDABLE', {
        transactionType: original.transactionType,
        paymentStatus: original.paymentStatus,
      });
    }

    // 2. The refund chain - exact per-line prior refunds (the same SUMs
    //    the dialog's GET and the live refund POST re-derive), then the
    //    stranded assessment INSIDE the transaction.
    const priorRefunds = await tx.salesTransaction.findMany({
      where: { refundedTransactionId: original.id },
      select: { items: { select: { refundedSaleItemId: true, quantity: true, lineTotal: true } } },
    });
    const priorQtyBySaleItemId = new Map<string, number>();
    const priorGrossBySaleItemId = new Map<string, number>();
    let priorTotal = new Decimal(0);
    for (const refund of priorRefunds) {
      for (const item of refund.items) {
        if (!item.refundedSaleItemId) continue;
        priorQtyBySaleItemId.set(
          item.refundedSaleItemId,
          (priorQtyBySaleItemId.get(item.refundedSaleItemId) ?? 0) + toNum(item.quantity),
        );
        priorGrossBySaleItemId.set(
          item.refundedSaleItemId,
          (priorGrossBySaleItemId.get(item.refundedSaleItemId) ?? 0) + toNum(item.lineTotal),
        );
      }
      priorTotal = priorTotal.plus(toDec(refund.items.reduce<Decimal>(
        (s, i) => s.plus(toDec(i.lineTotal)),
        new Decimal(0),
      )));
    }
    const views = refundableLinesFrom(original.items, priorQtyBySaleItemId, priorGrossBySaleItemId);
    const expectedTotal = round2(toDec(toNum(original.totalAmount)).minus(priorTotal));
    const assessment = assessStrandedOriginal(views, expectedTotal);
    // v2.374.0 THE STATUS-REPAIR PATH: an exhausted sale with NOTHING left
    // on the header (0 ≤ expected ≤ epsilon) is a status lie — the refund
    // chain already covered it, the badge never caught up. The repair
    // flips the status and NOTHING ELSE: no money moves, no Payment row,
    // no receipt, no journal, no loyalty. An OVER-REFUNDED header
    // (expected < 0) is NOT repaired — the anomaly stays visible for a
    // human; an OPEN line is NOT repaired — the live refund or the gap
    // closure owns it (NOT_STRANDED as before).
    if (!assessment.stranded) {
      const allExhausted = views.every((l) => l.refundableQuantity <= 1e-9);
      if (allExhausted && expectedTotal >= 0) {
        await tx.salesTransaction.update({
          where: { id: original.id },
          data: { paymentStatus: 'REFUNDED' },
        });
        return {
          mode: 'REPAIRED',
          refund: null,
          originalId: original.id,
          originalReceiptNumber: original.receiptNumber,
          originalPaymentStatus: 'REFUNDED',
          originalPriorPaymentStatus: original.paymentStatus,
          refundTotal: 0,
          healed: true,
          loyalty: null,
        };
      }
      throw new RefundError('NOT_STRANDED', {
        openLines: views.filter((l) => l.refundableQuantity > 1e-9).length,
        headerRemaining: expectedTotal,
      });
    }
    const refundTotal = assessment.strandedAmount;

    // 3. The REFUND transaction - ZERO items, the header's remainder as
    //    its total. The chain reference ALWAYS rides the notes (the
    //    receipt's "Refund of" meta line reads it).
    const refundTaxRate = original.items[0]?.taxRate ?? null;
    const { refundNet, refundTax } = splitRefundAmounts(refundTotal, refundTaxRate, {
      taxAmount: original.taxAmount,
      totalAmount: original.totalAmount,
    });
    const refundTx = await withSequenceRetry(async () => {
      const receiptNumber = generateReceiptNumber();
      return tx.salesTransaction.create({
        data: {
          storeId: original.storeId,
          receiptNumber,
          customerId: original.customerId,
          cashierId: params.actorUserId,
          subtotal: refundNet,
          taxAmount: refundTax,
          discountAmount: 0,
          totalAmount: refundTotal,
          paymentMethod: original.paymentMethod,
          paymentStatus: 'COMPLETED',
          transactionType: 'REFUND',
          notes: [
            params.notes?.trim() ||
              'Stranded-gap settlement - the header remainder the line world could not reach',
            `Refund of ${original.receiptNumber}`,
          ]
            .filter(Boolean)
            .join(' · '),
          refundedTransactionId: original.id,
          items: { create: [] },
        },
        include: { items: true },
      });
    }, 3).catch((err) => {
      if (isP2002(err)) {
        throw new RefundError('NOT_REFUNDABLE', { cause: 'receipt-number-collision' });
      }
      throw err;
    });

    // 4. The refund Payment row + the tender side effects (the same
    //    SPLIT-aware share law as a live refund; no allocations → no
    //    restock, no movements, no COGS).
    await tx.payment.create({
      data: {
        storeId: original.storeId,
        transactionId: refundTx.id,
        paymentMethod: original.paymentMethod,
        amount: refundTotal,
        currency: 'KES',
        status: 'COMPLETED',
        reference: `Refund of ${original.receiptNumber}`,
      },
    });

    const completedPayments = original.payments.filter((p) => p.status === 'COMPLETED');
    const tenderTotal = completedPayments.reduce<Decimal>(
      (s, p) => s.plus(toDec(p.amount)),
      new Decimal(0),
    );
    const shareOf = (amount: number): number => {
      if (tenderTotal.lessThanOrEqualTo(0)) return refundTotal;
      return KES(refundTotal).multiply(toDec(amount).div(tenderTotal)).round().toNumber();
    };
    const tenderShares: Record<string, number> = {};
    for (const p of completedPayments) {
      tenderShares[p.paymentMethod] = (tenderShares[p.paymentMethod] ?? 0) + shareOf(toNum(p.amount));
    }
    const shareSum = Object.values(tenderShares).reduce((s, v) => s + v, 0);
    const dust = round2(toDec(refundTotal).minus(shareSum));
    if (dust !== 0) {
      const largest = Object.entries(tenderShares).sort((a, b) => b[1] - a[1])[0];
      if (largest) tenderShares[largest[0]] = round2(toDec(largest[1]).plus(dust));
    }

    const cashPortion = tenderShares['CASH'] ?? 0;
    if (cashPortion > 0) {
      const agg = await tx.cashDrawerLog.aggregate({
        where: { storeId: original.storeId },
        _sum: { amount: true },
      });
      const runningBalance = round2(
        toDec(agg._sum.amount ?? 0).minus(cashPortion),
      );
      await tx.cashDrawerLog.create({
        data: {
          storeId: original.storeId,
          userId: params.actorUserId,
          action: 'REFUND',
          amount: -cashPortion,
          balance: runningBalance,
          notes: `Refund ${refundTx.receiptNumber} of sale ${original.receiptNumber}`,
        },
      });
    }

    const debtPortion = tenderShares['DEBT'] ?? 0;
    if (debtPortion > 0 && original.customerId) {
      const customer = await tx.customer.findUnique({ where: { id: original.customerId } });
      if (customer) {
        const currentBalance = toDec(customer.currentDebtBalance).toNumber();
        const decrement = Math.min(Math.max(0, currentBalance), debtPortion);
        if (decrement > 0) {
          const claimed = await tx.customer.updateMany({
            where: { id: customer.id, currentDebtBalance: { gte: decrement } },
            data: { currentDebtBalance: { decrement } },
          });
          if (claimed.count === 0) {
            const fresh = await tx.customer.findUnique({ where: { id: customer.id } });
            const floored = fresh ? Math.min(toDec(fresh.currentDebtBalance).toNumber(), decrement) : 0;
            if (floored > 0) {
              await tx.customer.update({
                where: { id: customer.id },
                data: { currentDebtBalance: { decrement: floored } },
              });
            }
          }
        }
        const dueDate = new Date();
        await tx.debtLedger.create({
          data: {
            storeId: original.storeId,
            customerId: original.customerId,
            transactionId: refundTx.id,
            amountOwed: -debtPortion,
            amountPaid: 0,
            balance: -debtPortion,
            dueDate,
            status: 'SETTLED',
            agingBucket: 'CURRENT',
            notes: `Refund credit note for ${original.receiptNumber}`,
            idempotencyKey: `refund-ledger:${refundTx.id}`,
          },
        });
      }
    }

    // 5. The mirror journal entry - balanced to the cent or rollback
    //    (zero items → zero COGS reversal).
    await recordRefundJournalEntry(tx, {
      storeId: original.storeId,
      organizationId: params.organizationId,
      actorUserId: params.actorUserId,
      receiptNumber: refundTx.receiptNumber,
      originalReceiptNumber: original.receiptNumber,
      transactionId: refundTx.id,
      grossRevenue: refundNet,
      taxAmount: refundTax,
      paymentBreakdown: {
        cash: tenderShares['CASH'] && tenderShares['CASH'] > 0 ? tenderShares['CASH'] : undefined,
        mpesa: tenderShares['MPESA'] && tenderShares['MPESA'] > 0 ? tenderShares['MPESA'] : undefined,
        giftCard: tenderShares['GIFT_CARD'] && tenderShares['GIFT_CARD'] > 0 ? tenderShares['GIFT_CARD'] : undefined,
        credit: tenderShares['DEBT'] && tenderShares['DEBT'] > 0 ? tenderShares['DEBT'] : undefined,
      },
      cogsAmount: 0,
      postImmediately: true,
    });

    // 6. Flip the original to REFUNDED (the heal settles the WHOLE
    //    remainder - nothing can remain) + the refund's receipt row.
    await tx.salesTransaction.update({
      where: { id: original.id },
      data: { paymentStatus: 'REFUNDED' },
    });
    await tx.receipt.create({
      data: {
        storeId: original.storeId,
        transactionId: refundTx.id,
        receiptNumber: refundTx.receiptNumber,
        receiptType: 'DIGITAL',
      },
    });

    // 7. The loyalty clawback - the settled money's points come home
    //    (the same floor law, capped by the wallet's CURRENT balance).
    let loyalty: HealStrandedOriginalResult['loyalty'] = null;
    if (original.customerId) {
      const wallet = await tx.customer.findUnique({
        where: { id: original.customerId },
        select: { loyaltyPoints: true },
      });
      if (wallet) {
        const claw = refundClawbackPoints(refundTotal, Number(wallet.loyaltyPoints ?? 0));
        if (claw > 0) {
          const claimed = await tx.customer.updateMany({
            where: { id: original.customerId, loyaltyPoints: { gte: claw } },
            data: { loyaltyPoints: { decrement: claw } },
          });
          if (claimed.count > 0) {
            const balanceAfter = Number(wallet.loyaltyPoints ?? 0) - claw;
            await tx.loyaltyTransaction.create({
              data: {
                storeId: original.storeId,
                customerId: original.customerId,
                points: -claw,
                transactionType: 'ADJUST',
                type: 'ADJUSTED',
                transactionId: refundTx.id,
                balanceAfter,
                reason: `Refund clawback for ${original.receiptNumber}`,
                reference: refundTx.receiptNumber,
              },
            });
            loyalty = { clawedBack: claw, balanceAfter };
          }
        }
      }
    }

    return {
      mode: 'HEALED',
      refund: {
        id: refundTx.id,
        receiptNumber: refundTx.receiptNumber,
        totalAmount: refundTotal,
        taxAmount: refundTax,
        paymentStatus: 'COMPLETED',
        transactionType: 'REFUND',
      },
      originalId: original.id,
      originalReceiptNumber: original.receiptNumber,
      originalPaymentStatus: 'REFUNDED',
      originalPriorPaymentStatus: original.paymentStatus,
      refundTotal,
      healed: true,
      loyalty,
    };
  });
}
