/**
 * v2.312.0 — the points that expire.
 *
 * The loyalty desk has spoken an "Expire" voice since the ledger shipped,
 * but NO writer anywhere in src/ ever produced an EXPIRE row — a voice
 * for rows nothing wrote. This module is the honest writer, built on the
 * same seams the clawback taught us (v2.309–v2.311):
 *
 *  - THE WALLET is `Customer.loyaltyPoints` — the live balance the earn,
 *    redeem and clawback paths all read and claim against. Expiry claims
 *    THE SAME wallet with THE SAME conditional-decrement pattern, so a
 *    concurrently-redeemed wallet can never go negative (the claim
 *    loses, the expiry forgives — the next run catches what remains).
 *  - THE FIFO LAW: redemptions and claws eat the OLDEST earned points
 *    first. So the expirable balance from lots older than the policy
 *    window is `max(0, oldLotsSum − totalConsumption)`, capped by the
 *    CURRENT wallet (legacy/manual paths may have drifted it). New earn
 *    rows inside the window never count; consumption counts no matter
 *    how old — FIFO attribution eats old lots first, always.
 *  - IDEMPOTENT BY CONSTRUCTION: the EXPIRE row the run writes is itself
 *    a negative — the next run's consumption includes it, so the plan
 *    answers 0 forever after. No run markers, no double-expiry.
 *  - THE TIER NEVER DEMOTES: tier is earned status (computed from
 *    lifetime earned), not spendable balance. Expiry only shrinks what
 *    the wallet can spend.
 *
 * The pure seam (`computeLoyaltyExpiryPlan`) is import-free and
 * executes in tests; the interactive `runLoyaltyExpiry` wraps it in the
 * per-customer atomic claim. Dry runs answer the plan and write nothing.
 */

import type { PrismaClient } from '@prisma/client';

/**
 * The default policy window (days): points unspent one year after they
 * were earned expire. One honest default for v2.312.0 — every run names
 * its window, so a per-store override is a parameter away, not a schema
 * migration.
 */
export const LOYALTY_EXPIRY_DEFAULT_DAYS = 365;

/** The smallest window a run may name (a month) — guards against fat-finger sweeps. */
export const LOYALTY_EXPIRY_MIN_DAYS = 30;

/** The referenceType every expiry row carries (the ledger's audit thread). */
export const LOYALTY_EXPIRY_REFERENCE_TYPE = 'EXPIRY_RUN';

/** One earn-shaped lot: positive points with their birth date. */
export interface ExpiryLot {
  points: number;
  createdAt: Date;
}

/**
 * The pure plan: how many of this wallet's CURRENT points expire under
 * the policy window? (Executed in tests — the pins hold the run loop to
 * this exact arithmetic.)
 */
export function computeLoyaltyExpiryPlan({
  lots,
  consumed,
  balance,
  policyDays,
  now = new Date(),
}: {
  /** The wallet's positive rows (EARN/BONUS) — points with birth dates. */
  lots: ExpiryLot[];
  /** TOTAL points that have left the wallet (abs of every negative row, any date). */
  consumed: number;
  /** The wallet's CURRENT balance (the claim is capped by it, never trusted from rows). */
  balance: number;
  policyDays: number;
  now?: Date;
}): {
  /** Points this run expires (0 = nothing to do). */
  expirable: number;
  /** How many old lots fed the expiry (the story for the reason line). */
  lotCount: number;
  /** Lots older than this instant are the expiry's candidates. */
  windowStart: Date;
} {
  const windowStart = new Date(now.getTime() - Math.max(1, policyDays) * 86_400_000);
  const oldLots = lots.filter((l) => l.points > 0 && l.createdAt <= windowStart);
  const oldLotsSum = oldLots.reduce((sum, l) => sum + l.points, 0);
  const totalConsumed = Math.max(0, consumed);
  // FIFO: every point that left the wallet ate the OLDEST lot first, so
  // the old lots' survivors are exactly oldLotsSum − totalConsumption.
  const survivors = Math.max(0, oldLotsSum - totalConsumed);
  const expirable = Math.max(0, Math.min(survivors, Math.max(0, balance)));
  return { expirable, lotCount: oldLots.length, windowStart };
}

/** The per-customer outcome of one run. */
export interface LoyaltyExpiryOutcome {
  customerId: string;
  customerName: string;
  walletBefore: number;
  expirable: number;
  claimed: boolean;
  /** Why nothing happened (skips are honest, not errors). */
  note?: 'claimed-lost' | 'zero-plan';
  walletAfter?: number;
  lotCount?: number;
}

export interface LoyaltyExpiryRunResult {
  dryRun: boolean;
  policyDays: number;
  scanned: number;
  walletsExpired: number;
  pointsExpired: number;
  outcomes: LoyaltyExpiryOutcome[];
}

type ExpiryClient = Pick<PrismaClient, 'customer' | 'loyaltyTransaction'>;

/**
 * The interactive run for ONE store. Reads every wallet with points and
 * every non-zero loyalty row ONCE, plans per wallet (the pure seam), then
 * claims per wallet. `dryRun` answers the plan and writes NOTHING — the
 * desk's preview rides it.
 */
export async function runLoyaltyExpiry({
  client,
  storeId,
  policyDays = LOYALTY_EXPIRY_DEFAULT_DAYS,
  actorId = null,
  dryRun = false,
  now = new Date(),
}: {
  client: ExpiryClient;
  storeId: string;
  policyDays?: number;
  /** Who pressed the button (null = the nightly cron). */
  actorId?: string | null;
  dryRun?: boolean;
  now?: Date;
}): Promise<LoyaltyExpiryRunResult> {
  const days = Math.max(LOYALTY_EXPIRY_MIN_DAYS, Math.floor(policyDays));

  const wallets = await client.customer.findMany({
    where: { storeId, loyaltyPoints: { gt: 0 } },
    select: { id: true, name: true, loyaltyPoints: true },
  });

  const outcomes: LoyaltyExpiryOutcome[] = [];
  let walletsExpired = 0;
  let pointsExpired = 0;

  for (const wallet of wallets) {
    const rows = await client.loyaltyTransaction.findMany({
      where: { customerId: wallet.id, points: { not: 0 } },
      select: { points: true, createdAt: true },
      orderBy: { createdAt: 'asc' },
    });
    const balance = Number(wallet.loyaltyPoints ?? 0);
    const plan = computeLoyaltyExpiryPlan({
      lots: rows
        .filter((r) => r.points > 0)
        .map((r) => ({ points: Number(r.points), createdAt: r.createdAt })),
      consumed: rows
        .filter((r) => r.points < 0)
        .reduce((sum, r) => sum + Math.abs(Number(r.points)), 0),
      balance,
      policyDays: days,
      now,
    });

    if (plan.expirable <= 0) {
      outcomes.push({
        customerId: wallet.id,
        customerName: wallet.name,
        walletBefore: balance,
        expirable: 0,
        claimed: false,
        note: 'zero-plan',
        lotCount: plan.lotCount,
      });
      continue;
    }

    if (dryRun) {
      outcomes.push({
        customerId: wallet.id,
        customerName: wallet.name,
        walletBefore: balance,
        expirable: plan.expirable,
        claimed: false,
        lotCount: plan.lotCount,
      });
      continue;
    }

    // The claim: conditional decrement — a concurrently-redeemed wallet
    // loses the race and the expiry forgives (the next run catches it).
    const claimed = await client.customer.updateMany({
      where: { id: wallet.id, loyaltyPoints: { gte: plan.expirable } },
      data: { loyaltyPoints: { decrement: plan.expirable } },
    });
    if (claimed.count === 0) {
      outcomes.push({
        customerId: wallet.id,
        customerName: wallet.name,
        walletBefore: balance,
        expirable: plan.expirable,
        claimed: false,
        note: 'claimed-lost',
        lotCount: plan.lotCount,
      });
      continue;
    }

    const walletAfter = balance - plan.expirable;
    const windowDay = plan.windowStart.toISOString().slice(0, 10);
    await client.loyaltyTransaction.create({
      data: {
        storeId,
        customerId: wallet.id,
        points: -plan.expirable,
        transactionType: 'EXPIRE',
        type: 'EXPIRED',
        balanceAfter: walletAfter,
        reason: `Points expired (${plan.lotCount} lot${plan.lotCount === 1 ? '' : 's'} earned on or before ${windowDay}, unspent ${days}+ days)`,
        description: `Points expired — unspent ${days}+ days`,
        reference: null,
        referenceId: null,
        referenceType: LOYALTY_EXPIRY_REFERENCE_TYPE,
        createdBy: actorId,
      },
    });

    walletsExpired += 1;
    pointsExpired += plan.expirable;
    outcomes.push({
      customerId: wallet.id,
      customerName: wallet.name,
      walletBefore: balance,
      expirable: plan.expirable,
      claimed: true,
      walletAfter,
      lotCount: plan.lotCount,
    });
  }

  return {
    dryRun,
    policyDays: days,
    scanned: wallets.length,
    walletsExpired,
    pointsExpired,
    outcomes,
  };
}
