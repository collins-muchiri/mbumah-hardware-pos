// v2.310.0 THE CLAW'S VOICE — the loyalty clawback's identity law.
//
// The refund clawback (v2.309.0) writes one ADJUST/ADJUSTED row with
// negative points and a reason that names the original sale. v2.310.0 gives
// that row a FACE at both desks (the ledger tab and the customer card), and
// both faces must recognize it the SAME way. These pins need NO database:
// `isRefundClawbackTx` and `parseClawbackOriginalReceipt` are pure functions,
// so the identity law they encode is pinned in milliseconds:
//
//   • THE IDENTITY LAW ......... kind (ADJUST/ADJUSTED) + negative points +
//                                the `Refund clawback` reason voice — and
//                                NOTHING else wears rose
//   • THE IMPERSONATION GUARDS . a manual adjustment, a redemption, an
//                                expiry, a positive adjust, an EARN with a
//                                clawback-ish reason — none pass
//   • BOTH SHAPES .............. the desk's `transactionType` (EARN/REDEEM/
//                                ADJUST/EXPIRE) and the card's `type`
//                                (EARNED/REDEEMED/ADJUSTED/EXPIRED)
//   • THE PAPER TRAIL PARSE .... the reason's original-sale receipt number
//                                extracts exactly; other voices parse null
import { describe, it, expect } from 'vitest';

import {
  isRefundClawbackTx,
  parseClawbackOriginalReceipt,
  normalizeLegacyType,
  REFUND_CLAWBACK_REASON_PREFIX,
} from '@/lib/loyalty-utils';

const CLAW_REASON = 'Refund clawback for MBM-RCPT-001';

describe('normalizeLegacyType — the modern voices pass through (the v2.310.0 QA catch)', () => {
  it('the MODERN voices are returned unchanged (ADJUSTED must never read as Earned)', () => {
    expect(normalizeLegacyType('ADJUSTED')).toBe('ADJUSTED');
    expect(normalizeLegacyType('EARNED')).toBe('EARNED');
    expect(normalizeLegacyType('REDEEMED')).toBe('REDEEMED');
    expect(normalizeLegacyType('EXPIRED')).toBe('EXPIRED');
  });

  it('the legacy voices still map (the pre-Phase-3 rows keep their names)', () => {
    expect(normalizeLegacyType('EARN')).toBe('EARNED');
    expect(normalizeLegacyType('REDEEM')).toBe('REDEEMED');
    expect(normalizeLegacyType('ADJUST')).toBe('ADJUSTED');
    expect(normalizeLegacyType('EXPIRE')).toBe('EXPIRED');
    expect(normalizeLegacyType('BONUS')).toBe('EARNED');
  });

  it('an unknown voice falls back to EARNED (the last-resort stays)', () => {
    expect(normalizeLegacyType('SOMETHING_ELSE')).toBe('EARNED');
  });

  it("the card route\u2019s clawback row therefore reads ADJUSTED end-to-end", () => {
    // The route prefers the `type` column; the seeded clawback row holds the
    // modern voice. With the pass-through, the row can only wear rose.
    const t = { type: 'ADJUSTED', transactionType: 'ADJUST' };
    const normalized = t.type
      ? normalizeLegacyType(t.type)
      : normalizeLegacyType(t.transactionType);
    expect(normalized).toBe('ADJUSTED');
    expect(
      isRefundClawbackTx({ type: normalized, points: -7, reason: CLAW_REASON }),
    ).toBe(true);
  });
});

describe('isRefundClawbackTx — the identity law', () => {
  it('recognizes the desk shape: ADJUST + negative points + the clawback voice', () => {
    expect(
      isRefundClawbackTx({ transactionType: 'ADJUST', points: -7, reason: CLAW_REASON }),
    ).toBe(true);
  });

  it('recognizes the card shape: ADJUSTED + negative points + the clawback voice', () => {
    expect(isRefundClawbackTx({ type: 'ADJUSTED', points: -15, reason: CLAW_REASON })).toBe(true);
  });

  it('the type field wins over transactionType when both ride (the card normalize path)', () => {
    expect(
      isRefundClawbackTx({ type: 'ADJUSTED', transactionType: 'EARN', points: -7, reason: CLAW_REASON }),
    ).toBe(true);
    expect(
      isRefundClawbackTx({ type: 'EARNED', transactionType: 'ADJUST', points: -7, reason: CLAW_REASON }),
    ).toBe(false);
  });

  it('a manual adjustment is NOT a clawback (no reason voice)', () => {
    expect(
      isRefundClawbackTx({ transactionType: 'ADJUST', points: -50, reason: 'Stock take correction' }),
    ).toBe(false);
  });

  it('a manual adjustment with NO reason at all is NOT a clawback', () => {
    expect(isRefundClawbackTx({ transactionType: 'ADJUST', points: -50 })).toBe(false);
  });

  it('a redemption is NOT a clawback (wrong kind, even with the voice)', () => {
    expect(isRefundClawbackTx({ transactionType: 'REDEEM', points: -100, reason: CLAW_REASON })).toBe(false);
    expect(isRefundClawbackTx({ type: 'REDEEMED', points: -100, reason: CLAW_REASON })).toBe(false);
  });

  it('an expiry is NOT a clawback', () => {
    expect(isRefundClawbackTx({ transactionType: 'EXPIRE', points: -30, reason: CLAW_REASON })).toBe(false);
  });

  it('a POSITIVE adjust is NOT a clawback (the claw only takes points home)', () => {
    expect(isRefundClawbackTx({ transactionType: 'ADJUST', points: 7, reason: CLAW_REASON })).toBe(false);
  });

  it('zero points is NOT a clawback', () => {
    expect(isRefundClawbackTx({ transactionType: 'ADJUST', points: 0, reason: CLAW_REASON })).toBe(false);
  });

  it('non-finite points are NOT a clawback', () => {
    expect(
      isRefundClawbackTx({ transactionType: 'ADJUST', points: Number.NaN, reason: CLAW_REASON }),
    ).toBe(false);
  });

  it('an EARN with a clawback-ish reason is NOT a clawback (kind guards the voice)', () => {
    expect(isRefundClawbackTx({ transactionType: 'EARN', points: -7, reason: CLAW_REASON })).toBe(false);
  });

  it('the reason must START with the voice (a mention mid-sentence is not the claw)', () => {
    expect(
      isRefundClawbackTx({
        transactionType: 'ADJUST',
        points: -7,
        reason: 'Manager note: see the Refund clawback for MBM-RCPT-001',
      }),
    ).toBe(false);
  });

  it('the contract prefix is the exact voice the refund service writes', () => {
    expect(REFUND_CLAWBACK_REASON_PREFIX).toBe('Refund clawback');
  });
});

describe('parseClawbackOriginalReceipt — the paper trail parse', () => {
  it('extracts the original sale receipt number', () => {
    expect(parseClawbackOriginalReceipt('Refund clawback for MBM-RCPT-001')).toBe('MBM-RCPT-001');
  });

  it('parses receipt numbers with digits, dashes and suffixes', () => {
    expect(parseClawbackOriginalReceipt('Refund clawback for MBM-RCPT-2026-0042')).toBe(
      'MBM-RCPT-2026-0042',
    );
  });

  it('returns null for a manual adjustment reason', () => {
    expect(parseClawbackOriginalReceipt('Stock take correction')).toBeNull();
  });

  it('returns null for an absent reason', () => {
    expect(parseClawbackOriginalReceipt(null)).toBeNull();
    expect(parseClawbackOriginalReceipt(undefined)).toBeNull();
    expect(parseClawbackOriginalReceipt('')).toBeNull();
  });

  it('returns null when the voice names no receipt', () => {
    expect(parseClawbackOriginalReceipt('Refund clawback')).toBeNull();
  });

  it('the parsed receipt round-trips with the clawback write (reason voice = v2.309 contract)', () => {
    // The service writes: reason: `Refund clawback for ${original.receiptNumber}`
    const originalReceiptNumber = 'MBM-RCPT-0099';
    const written = `Refund clawback for ${originalReceiptNumber}`;
    expect(parseClawbackOriginalReceipt(written)).toBe(originalReceiptNumber);
    expect(isRefundClawbackTx({ transactionType: 'ADJUST', points: -3, reason: written })).toBe(true);
  });
});
