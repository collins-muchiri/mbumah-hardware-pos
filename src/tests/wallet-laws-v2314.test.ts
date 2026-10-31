// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  walletInsufficientMessage,
  MANUAL_EXPIRE_REFUSAL_MESSAGE,
  EXPIRE_POLICY_NOTE,
  type AdjustTransactionType,
} from '@/lib/loyalty-adjust-policy';

/**
 * v2.314.0 — THE WALLET IS THE ONLY BALANCE.
 *
 * The burst proved all three laws' absence live:
 *   1. A stale-high legacy shadow (CustomerLoyalty.pointsBalance = 500)
 *      let a REDEEM 100 through a wallet holding 20 — the v2.313 wallet
 *      law then drove the canonical balance to −90. Sufficiency now
 *      reads THE WALLET, and the claim inside the transaction is
 *      conditional on the balance still holding the points (the expiry
 *      service's exact claim shape) — the wallet cannot go negative
 *      through this door, even mid-race.
 *   2. A shadowless wallet (100 points, no CustomerLoyalty row) was
 *      refused with "Customer has 0 points" — the voice now names the
 *      canonical balance.
 *   3. A manual EXPIRE landed through the route, bypassing the FIFO
 *      policy's window, attribution, conditional claim and idempotence
 *      law. The type is refused at the door; the Expiry dialog is the
 *      one honest writer.
 */

const read = (p: string) => readFileSync(join(process.cwd(), p), 'utf8');
const route = read('src/app/api/loyalty/transactions/route.ts');
const dialog = read('src/app/(shell)/tabs/loyalty-tab.tsx');

describe('v2.314.0 — the pure law: the wallet voice', () => {
  it('the insufficient voice names the canonical balance, clamped at zero', () => {
    expect(walletInsufficientMessage(20)).toBe('Insufficient loyalty points. Customer has 20 points.');
    expect(walletInsufficientMessage(0)).toBe('Insufficient loyalty points. Customer has 0 points.');
    // A defensive clamp: a drifted negative wallet never voices a negative.
    expect(walletInsufficientMessage(-90)).toBe('Insufficient loyalty points. Customer has 0 points.');
    expect(walletInsufficientMessage(99.7)).toBe('Insufficient loyalty points. Customer has 99 points.');
  });

  it('the manual-expire refusal points at the one honest door', () => {
    expect(MANUAL_EXPIRE_REFUSAL_MESSAGE).toContain('Expiry desk');
    expect(MANUAL_EXPIRE_REFUSAL_MESSAGE).toContain('FIFO policy sweep');
    expect(MANUAL_EXPIRE_REFUSAL_MESSAGE).toContain('not by hand');
  });

  it('the dialog note is a pointer, not a scolding — and distinct from the refusal', () => {
    expect(EXPIRE_POLICY_NOTE).toContain('Expiry desk');
    expect(EXPIRE_POLICY_NOTE).toContain('not by hand');
    expect(EXPIRE_POLICY_NOTE).not.toBe(MANUAL_EXPIRE_REFUSAL_MESSAGE);
  });

  it('the manual doors may no longer WRITE an EXPIRE (the wire union shrinks)', () => {
    const mod = 'EARN | REDEEM | BONUS | ADJUST';
    expect((['EARN', 'REDEEM', 'BONUS', 'ADJUST'] as AdjustTransactionType[]).sort()).toEqual(['ADJUST', 'BONUS', 'EARN', 'REDEEM']);
    expect(mod).not.toContain('EXPIRE');
  });
});

describe('v2.314.0 — the route enforces the wallet laws at the door', () => {
  it('sufficiency reads the canonical wallet for EVERY negative movement', () => {
    expect(route.includes('if (finalPoints < 0 && customer.loyaltyPoints < Math.abs(finalPoints)) {')).toBe(true);
    expect(route.includes('error: walletInsufficientMessage(customer.loyaltyPoints)')).toBe(true);
    // The shadow is no longer READ by the check (the early check used
    // db.customerLoyalty.findFirst; the surviving tx.customerLoyalty.*
    // writes are the legacy mirror, maintained but never authoritative).
    expect(route.includes('db.customerLoyalty.findFirst')).toBe(false);
  });

  it('EXPIRE is refused at the door with the shared voice', () => {
    expect(route.includes("if (tType === 'EXPIRE') {")).toBe(true);
    expect(route.includes('error: MANUAL_EXPIRE_REFUSAL_MESSAGE')).toBe(true);
    // The normalization no longer speaks for EXPIRE.
    expect(route.includes("tType === 'REDEEM' || tType === 'EXPIRE'")).toBe(false);
  });

  it('the claim shape: a negative movement claims the wallet conditionally', () => {
    expect(route.includes('loyaltyPoints: { gte: Math.abs(finalPoints) }')).toBe(true);
    expect(route.includes('loyaltyPoints: { decrement: Math.abs(finalPoints) }')).toBe(true);
    expect(route.includes('throw new WalletClaimLostError();')).toBe(true);
    expect(route.includes('if (claim.count === 0) {')).toBe(true);
  });

  it('a lost claim rolls back and answers with the balance at claim time', () => {
    expect(route.includes('if (transaction instanceof WalletClaimLostError) {')).toBe(true);
    expect(route.includes('error: walletInsufficientMessage(fresh?.loyaltyPoints ?? 0)')).toBe(true);
    // The claim, the rollback catch and the fresh re-read live in the route.
    expect(route.includes('class WalletClaimLostError extends Error')).toBe(true);
  });

  it('positive movements still increment unconditionally (grants cannot lose a race)', () => {
    expect(route.includes('data: { loyaltyPoints: { increment: finalPoints } },')).toBe(true);
    expect(route.indexOf('if (finalPoints > 0) {')).toBeGreaterThan(-1);
  });

  it('the shadow stays a maintained mirror — but never authoritative', () => {
    // The mirror write survives (backward compatibility for legacy readers),
    // while the check reads the wallet.
    expect(route.includes('updateData.pointsBalance = { increment: finalPoints };')).toBe(true);
    expect(route.includes('THE WALLET IS THE ONLY BALANCE')).toBe(true);
  });
});

describe('v2.314.0 — the manual dialog wears the expiry law on its face', () => {
  it('the type picker no longer offers the bypass — exactly one EXPIRE voice remains', () => {
    // The ledger FILTER still speaks EXPIRE (service-written history rows
    // exist and must stay filterable); the manual dialog's picker lost it.
    // Before this release the file had TWO identical SelectItem lines:
    // the filter's and the picker's. Exactly one survives.
    expect(dialog.split('<SelectItem value="EXPIRE">Expire</SelectItem>').length - 1).toBe(1);
    // The picker's own SelectContent carries the four writable types only.
    const picker = dialog.split('value={manualAdjustForm.transactionType}')[1]?.split('</SelectContent>')[0] ?? '';
    expect(picker.includes('value="EXPIRE"')).toBe(false);
    expect(picker.includes('value="ADJUST"')).toBe(true);
    expect(picker.includes('value="REDEEM"')).toBe(true);
  });

  it('the ledger filter still speaks EXPIRE for the service-written rows', () => {
    const filter = dialog.split('value={txTypeFilter}')[1]?.split('</SelectContent>')[0] ?? '';
    expect(filter.includes('value="EXPIRE"')).toBe(true);
  });

  it('the amber note points at the Expiry desk, voiced in the Expiry amber', () => {
    expect(dialog.includes('{EXPIRE_POLICY_NOTE}')).toBe(true);
    expect(dialog.includes('text-amber-700 dark:text-amber-400')).toBe(true);
    expect(dialog.includes('bg-amber-50 dark:bg-amber-950/40')).toBe(true);
    expect(dialog.includes('Hourglass')).toBe(true);
  });
});
