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
 *
 * Loyalty clawback is deliberately OUT of scope for v2.308.0 (documented
 * follow-up): points earned on the original sale are not reversed yet.
 */

import Decimal from 'decimal.js';
import { KES } from '@/lib/money';
import { toDec, round2 } from '@/lib/utils/financialMath';
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
  | 'AMOUNT_OVER_REFUND';

const REFUND_ERROR_MESSAGES: Record<RefundErrorCode, string> = {
  NOT_FOUND: 'Transaction not found.',
  TENANT_MISMATCH: 'This transaction belongs to a different store.',
  NOT_REFUNDABLE: 'Only completed or partially refunded sales can be refunded.',
  EMPTY_REFUND: 'Select at least one item and quantity to refund.',
  LINE_OVER_REFUND: 'Refund quantity exceeds what remains refundable on this line.',
  AMOUNT_OVER_REFUND: 'Refund total exceeds the amount still refundable on this sale.',
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
    const { allocations, refundTotal } = computeRefundPlan(views, params.requestedLines);

    // Whole-sale guard: the chain can never exceed the original's total.
    const originalTotal = toNum(original.totalAmount);
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
          notes:
            params.notes?.trim() ||
            (params.reason ? `Refund reason: ${params.reason}` : null) ||
            `Refund of ${original.receiptNumber}`,
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
    };
  });
}
