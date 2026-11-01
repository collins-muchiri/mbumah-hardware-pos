// GET/POST /api/loyalty/transactions

import { type NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { systemLog, withErrorBoundary } from '@/lib/logger';
import { LogSeverity, LogComponent } from '@/lib/types';
import { withSessionAuth, MANAGER_PLUS_ROLES } from '@/lib/auth';
import {
  dockNeedsReason,
  DOCK_REASON_REQUIRED_MESSAGE,
  MANUAL_EXPIRE_REFUSAL_MESSAGE,
  walletInsufficientMessage,
} from '@/lib/loyalty-adjust-policy';
import { honestDayKey, parseClampedIntParam, parsePositiveIntParam } from '@/lib/tab-url';

export const dynamic = 'force-dynamic';

async function getLoyaltyTransactionsHandler(...args: unknown[]): Promise<Response> {
  const request = args[0] as NextRequest;
  const { searchParams } = new URL(request.url);

  const storeId = searchParams.get('storeId');
  if (!storeId) {
    return Response.json(
      { success: false, error: 'storeId is required.' },
      { status: 400 }
    );
  }

  const customerId = searchParams.get('customerId');
  const transactionType = searchParams.get('transactionType');
  // v2.318.0 — THE WINDOW IS HONEST AT THE API DOOR TOO: the raw query
  // strings used to go STRAIGHT into `new Date()` — a garbage `dateFrom`
  // minted an Invalid Date, Prisma answered a validation error, and the
  // route 500'd. The same honest-day law the address bar speaks
  // (tab-url's `honestDayKey`) reads the query now: shape must be
  // `YYYY-MM-DD`, the day must be REAL, and anything else is DROPPED —
  // never a 500, never a stranded filter. The echo below answers the
  // window the query ACTUALLY applied, never the one it was handed.
  const dateFrom = honestDayKey(searchParams.get('dateFrom'));
  const dateTo = honestDayKey(searchParams.get('dateTo'));
  const search = searchParams.get('search') || '';
  // v2.321.0 — THE DOOR IS HONEST ABOUT ITS NUMBERS (the v2.318 law the
  // dates at this door already speak): a garbage `page` or `limit` used
  // to ride parseInt's NaN straight into Prisma's skip/take — a
  // validation error the route answered 500 (live-proven this round:
  // ?limit=abc → 500, ?page=abc → 500). Shape must be digits; the page
  // falls back to 1 (past-the-end stays an honest empty — shape, not
  // existence) and the take clamps into 1..200 — the house's largest
  // gait — so the wire never takes more than the desk offers and a
  // garbage param is never a 500 again.
  const page = parsePositiveIntParam(searchParams.get('page'), 1);
  const limit = parseClampedIntParam(searchParams.get('limit'), 50, 1, 200);
  const sortBy = searchParams.get('sortBy') || 'createdAt';
  const sortOrder = searchParams.get('sortOrder') || 'desc';

  const where: Record<string, unknown> = { storeId };

  if (customerId) {
    where.customerId = customerId;
  }

  if (transactionType) {
    where.transactionType = transactionType;
  }

  if (dateFrom || dateTo) {
    const createdAt: Record<string, Date> = {};
    if (dateFrom) createdAt.gte = new Date(dateFrom);
    if (dateTo) {
      const to = new Date(dateTo);
      to.setHours(23, 59, 59, 999);
      createdAt.lte = to;
    }
    where.createdAt = createdAt;
  }

  if (search) {
    where.OR = [
      { reference: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }

  const validSortFields = ['createdAt', 'points', 'transactionType'];
  const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
  const orderDirection = sortOrder === 'asc' ? 'asc' : 'desc';

  const [transactions, total] = await Promise.all([
    db.loyaltyTransaction.findMany({
      where,
      include: {
        customer: {
          select: { id: true, name: true, phone: true },
        },
      },
      orderBy: { [sortField]: orderDirection },
      skip: (page - 1) * limit,
      take: limit,
    }),
    db.loyaltyTransaction.count({ where }),
  ]);

  // Summary stats
  const earnedSummary = await db.loyaltyTransaction.aggregate({
    where: { ...where, points: { gt: 0 } },
    _sum: { points: true },
    _count: true,
  });

  const redeemedSummary = await db.loyaltyTransaction.aggregate({
    where: { ...where, points: { lt: 0 } },
    _sum: { points: true },
    _count: true,
  });

  // v2.319.0 THE PER-TYPE TRUTH — one groupBy answers every bucket the
  // ledger can hold, over ALL matching rows (the `data` page below is
  // just its first slice; a desk that sums the page lies when the ledger
  // outgrows it — the baseline burst proved the lie live: 120 seeded
  // rows, the page-1 sum read 700 while the wire held 1,140, and the
  // redeem card read 0 while the wire said 360 because the redeem rows
  // had fallen off page one). The two sign-based aggregates above stay
  // EXACTLY as they were (additive law): older readers keep their
  // numbers unchanged. Absent type = no rows of that kind.
  const bucketRows = await db.loyaltyTransaction.groupBy({
    by: ['transactionType'],
    where,
    _sum: { points: true },
    _count: { _all: true },
  });
  const buckets: Record<string, { points: number; count: number }> = {};
  for (const b of bucketRows) {
    buckets[b.transactionType] = {
      points: b._sum.points || 0,
      count: b._count._all,
    };
  }

  return Response.json({
    success: true,
    data: transactions,
    // v2.318.0 THE HONEST ECHO: the wire answers the window this query
    // applied (post-validation, the same values that built the `where`) —
    // the desk pins the applied range instead of guessing from its own
    // inputs, and a null names the open side. Additive: older readers of
    // this wire never sent or read a `window`, so nothing breaks.
    window: {
      from: dateFrom || null,
      to: dateTo || null,
    },
    summary: {
      totalPointsEarned: earnedSummary._sum.points || 0,
      totalEarnCount: earnedSummary._count,
      totalPointsRedeemed: Math.abs(redeemedSummary._sum.points || 0),
      totalRedeemCount: redeemedSummary._count,
      // v2.319.0 — the per-type ledger (EARN/BONUS/REDEEM/EXPIRE/ADJUST,
      // each { points, count }); additive to the two totals above.
      buckets,
    },
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}

async function createLoyaltyTransactionHandler(...args: unknown[]): Promise<Response> {
  const request = args[0] as NextRequest;
  const body = await request.json();

  const {
    storeId,
    customerId,
    points,
    transactionType,
    reference,
    // v2.313.0 THE REFERENCE THAT NEVER LANDED: the manual-adjust dialog
    // has always sent `referenceId` while this route read only `reference`
    // — the manager's reference string was silently dropped and the desk
    // ledger answered '-'. Both voices are accepted now (the explicit
    // `reference` keeps precedence).
    referenceId,
    description,
    createdBy,
  } = body;
  const effectiveReference = reference ?? referenceId ?? null;

  if (!storeId || !customerId || !points) {
    return Response.json(
      { success: false, error: 'storeId, customerId, and points are required.' },
      { status: 400 }
    );
  }

  const validTypes = ['EARN', 'REDEEM', 'BONUS', 'EXPIRE', 'ADJUST'];
  const tType = transactionType || 'EARN';
  if (!validTypes.includes(tType)) {
    return Response.json(
      { success: false, error: `Invalid transactionType. Must be one of: ${validTypes.join(', ')}` },
      { status: 400 }
    );
  }

  const pointsValue = parseInt(String(points));
  if (pointsValue === 0) {
    return Response.json(
      { success: false, error: 'points must be non-zero.' },
      { status: 400 }
    );
  }

  // v2.313.0 THE DOCK SAYS WHY: a negative ADJUST is a manager's judgment
  // call against a customer's balance — it must carry a reason the ledger
  // can voice. Mechanical types (EARN/BONUS/REDEEM and the service-written
  // EXPIRE) have their own context; the discretionary dock does not get
  // to be anonymous. The pure predicate lives in loyalty-adjust-policy.ts
  // (one law, three consumers: this route and both adjust dialogs).
  if (dockNeedsReason(tType, pointsValue, description)) {
    return Response.json(
      { success: false, error: DOCK_REASON_REQUIRED_MESSAGE },
      { status: 400 }
    );
  }

  // v2.314.0 — EXPIRE IS THE SERVICE'S VOICE: the FIFO policy
  // (loyalty-expiry-service) is the only honest writer of EXPIRE rows —
  // it owns the window, the FIFO attribution, the conditional claim and
  // the idempotence law. A manual EXPIRE bypassed all of it (the burst
  // proved one landing live, alongside a redeem and a shadow divergence).
  // Refused at the door; the desk's Expiry dialog is the one way to
  // expire points.
  if (tType === 'EXPIRE') {
    return Response.json(
      { success: false, error: MANUAL_EXPIRE_REFUSAL_MESSAGE },
      { status: 400 }
    );
  }

  // For EARN/BONUS, points must be positive; for REDEEM, must be negative
  let finalPoints = pointsValue;
  if (tType === 'EARN' || tType === 'BONUS') {
    finalPoints = Math.abs(pointsValue);
  } else if (tType === 'REDEEM') {
    finalPoints = -Math.abs(pointsValue);
  }

  // Verify customer exists
  const customer = await db.customer.findUnique({ where: { id: customerId } });
  if (!customer) {
    return Response.json(
      { success: false, error: 'Customer not found.' },
      { status: 404 }
    );
  }

  // v2.314.0 — THE WALLET IS THE ONLY BALANCE: sufficiency for EVERY
  // negative movement (a REDEEM, or a manager's dock) is judged against
  // Customer.loyaltyPoints — the wallet the earn, expiry-claim and
  // dedicated-redeem paths all read and claim against. The old check
  // read the legacy CustomerLoyalty shadow, whose ONLY reader in all of
  // src/ was this very line: a stale-high shadow (post-expiry, post-
  // dedicated-redeem) let a redeem through and the wallet law drove the
  // canonical balance to −90, live in the burst; a missing shadow
  // refused a wallet holding 100 points with "0 points". The wallet
  // answers both honestly. The claim inside the transaction below is
  // conditional on the same shape, so even a concurrent spend after this
  // early check cannot push the wallet negative.
  if (finalPoints < 0 && customer.loyaltyPoints < Math.abs(finalPoints)) {
    return Response.json(
      { success: false, error: walletInsufficientMessage(customer.loyaltyPoints) },
      { status: 400 }
    );
  }

  const transaction = await db.$transaction(async (tx) => {
    const loyaltyTx = await tx.loyaltyTransaction.create({
      data: {
        storeId,
        customerId,
        points: finalPoints,
        transactionType: tType,
        reference: effectiveReference,
        description: description || null,
        createdBy: createdBy || null,
      },
      include: {
        customer: {
          select: { id: true, name: true, phone: true },
        },
      },
    });

    // Update or create customer loyalty record
    const existingLoyalty = await tx.customerLoyalty.findFirst({
      where: { customerId },
    });

    if (existingLoyalty) {
      const updateData: Record<string, unknown> = {
        lastActivityAt: new Date(),
      };

      if (finalPoints > 0) {
        updateData.pointsBalance = { increment: finalPoints };
        updateData.lifetimePoints = { increment: finalPoints };
      } else {
        updateData.pointsBalance = { increment: finalPoints }; // negative
        updateData.totalRedeemed = { increment: Math.abs(finalPoints) };
      }

      await tx.customerLoyalty.update({
        where: { id: existingLoyalty.id },
        data: updateData,
      });
    } else if (finalPoints > 0) {
      // Auto-assign to first active tier for new loyalty customers.
      // v2.313.0 QA CATCH: the fallback used to write the literal string
      // 'default' into tierId — a foreign key that exists nowhere — so ANY
      // store that had not configured loyalty tiers 500'd (P2003) on the
      // customer's very first grant/earn through this door. The schema's
      // tierId is nullable BY DESIGN: a tierless store enrolls tierless
      // members, honestly.
      const firstTier = await tx.loyaltyTier.findFirst({
        where: { storeId, isActive: true },
        orderBy: { sortOrder: 'asc' },
      });

      await tx.customerLoyalty.create({
        data: {
          customerId,
          tierId: firstTier?.id || null,
          pointsBalance: finalPoints,
          lifetimePoints: finalPoints,
          totalRedeemed: 0,
          tierAchievedAt: firstTier ? new Date() : null,
          lastActivityAt: new Date(),
        },
      });
    }

    // v2.313.0 THE WALLET LAW (the round's live QA catch): the codebase's
    // own documented law (loyalty-expiry-service.ts) says THE WALLET is
    // Customer.loyaltyPoints — "the live balance the earn, redeem and
    // clawback paths all read and claim against". This route maintained
    // only the legacy shadow (CustomerLoyalty.pointsBalance), so a manual
    // adjust never moved the balance the members list and the customer
    // card voice — the burst proved it live (+50/−10 landed as rows, the
    // wallet stayed 0). Both ledgers move together now, in the SAME
    // transaction (the shadow is a legacy MIRROR, never authoritative).
    //
    // v2.314.0 THE CLAIM SHAPE: a negative movement CLAIMS the wallet
    // exactly like the expiry service does — a conditional decrement that
    // requires the balance to still hold the points (a concurrent
    // redemption may have spent them after this route's early check).
    // A lost claim rolls the whole movement back and the door answers
    // with the freshly re-read balance — the wallet can never go
    // negative through this route, even mid-race.
    if (finalPoints > 0) {
      await tx.customer.update({
        where: { id: customerId },
        data: { loyaltyPoints: { increment: finalPoints } },
      });
    } else {
      const claim = await tx.customer.updateMany({
        where: { id: customerId, loyaltyPoints: { gte: Math.abs(finalPoints) } },
        data: { loyaltyPoints: { decrement: Math.abs(finalPoints) } },
      });
      if (claim.count === 0) {
        throw new WalletClaimLostError();
      }
    }

    return loyaltyTx;
  })
    .catch((err: unknown) => {
      if (err instanceof WalletClaimLostError) return err;
      // Re-throw genuine DB / system errors so withErrorBoundary logs them.
      throw err;
    });

  // A lost claim is an honest 400, voiced with the balance as it stood at
  // claim time (re-read now, outside the rolled-back transaction).
  if (transaction instanceof WalletClaimLostError) {
    const fresh = await db.customer.findUnique({
      where: { id: customerId },
      select: { loyaltyPoints: true },
    });
    return Response.json(
      { success: false, error: walletInsufficientMessage(fresh?.loyaltyPoints ?? 0) },
      { status: 400 }
    );
  }

  await systemLog({
    action: 'LOYALTY_TRANSACTION_CREATED',
    component: LogComponent.SYSTEM,
    severity: LogSeverity.INFO,
    message: `Loyalty ${tType}: ${finalPoints} points for customer ${customer.name}`,
    storeId,
    userId: createdBy || undefined,
    metadata: {
      loyaltyTransactionId: transaction.id,
      customerId,
      transactionType: tType,
      points: finalPoints,
    },
  });

  return Response.json({ success: true, data: transaction }, { status: 201 });
}

// AUDIT FIX (Task 3-d): GET = any store role; POST mints/redeems loyalty
// points (redeemable value) = manager-or-above.

/** The mid-flight claim loss: the wallet no longer holds the points (a concurrent spend won the race). */
class WalletClaimLostError extends Error {
  constructor() {
    super('WALLET_CLAIM_LOST');
    this.name = 'WalletClaimLostError';
  }
}
export const GET = withErrorBoundary(
  withSessionAuth(getLoyaltyTransactionsHandler),
  'LOYALTY_TRANSACTIONS_LIST',
);
export const POST = withErrorBoundary(
  withSessionAuth(createLoyaltyTransactionHandler, { roles: MANAGER_PLUS_ROLES }),
  'LOYALTY_TRANSACTIONS_CREATE',
);
