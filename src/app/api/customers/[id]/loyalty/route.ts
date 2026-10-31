// GET /api/customers/[id]/loyalty
//
// Returns a customer's loyalty points balance, tier, lifetime stats,
// next-tier progress, and recent LoyaltyTransaction records.
//
// RBAC: SUPER_ADMIN, STORE_OWNER, BRANCH_MANAGER, CASHIER, ACCOUNTANT.

import { type NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth, type AuthSession } from '@/lib/auth';
import { withErrorBoundary } from '@/lib/logger';
import {
  getNextTierProgress,
  getTierFromPoints,
  normalizeLegacyType,
  type LoyaltyTransactionType,
} from '@/lib/loyalty-utils';

export const dynamic = 'force-dynamic';

interface RouteContext {
  params: Promise<{ id: string }>;
}

interface LoyaltyTxItem {
  id: string;
  type: LoyaltyTransactionType;
  points: number;
  balanceAfter: number;
  reason: string | null;
  // v2.310.0: the clawback row's own receipt voice — the REFUND transaction's
  // receipt number rides in `reference`, so the card can show both ends of
  // the paper trail (the reason names the original sale, the reference names
  // the refund receipt that took the points back).
  reference: string | null;
  transactionId: string | null;
  createdAt: string;
}

async function getCustomerLoyaltyHandler(
  _request: NextRequest,
  _session: AuthSession,
  ...rest: unknown[]
): Promise<Response> {
  const context = rest[0] as RouteContext;
  const customerId = (await context.params).id;

  // Load customer (with loyalty fields) and recent transactions in parallel
  const [customer, recentTransactions] = await Promise.all([
    db.customer.findUnique({
      where: { id: customerId },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        storeId: true,
        loyaltyPoints: true,
        totalLoyaltyEarned: true,
        totalLoyaltyRedeemed: true,
        loyaltyTier: true,
        joinedAt: true,
        createdAt: true,
      },
    }),
    db.loyaltyTransaction.findMany({
      where: { customerId },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true,
        type: true,
        transactionType: true,
        points: true,
        balanceAfter: true,
        reason: true,
        description: true,
        transactionId: true,
        reference: true,
        createdAt: true,
      },
    }),
  ]);

  if (!customer) {
    return Response.json(
      { success: false, error: 'Customer not found.' },
      { status: 404 },
    );
  }

  // Derive the effective tier from lifetime points (source of truth).
  // The stored `loyaltyTier` field is kept in sync by the redeem / award flows
  // but we recompute here so the UI always reflects the canonical tier.
  const effectiveTier = getTierFromPoints(customer.totalLoyaltyEarned);
  const nextTierProgress = getNextTierProgress(customer.totalLoyaltyEarned);

  // Normalize the transaction list: prefer `type` field, fall back to legacy
  // `transactionType` mapped through `normalizeLegacyType`. Also surface the
  // legacy `description` under `reason` for transactions that pre-date the new
  // `reason` column.
  const transactions: LoyaltyTxItem[] = recentTransactions.map((t) => {
    const type: LoyaltyTransactionType = t.type
      ? (normalizeLegacyType(t.type) as LoyaltyTransactionType)
      : normalizeLegacyType(t.transactionType);
    const reason = t.reason ?? t.description ?? null;
    return {
      id: t.id,
      type,
      points: t.points,
      balanceAfter: t.balanceAfter ?? 0,
      reason,
      reference: t.reference ?? null,
      transactionId: t.transactionId ?? null,
      createdAt: t.createdAt.toISOString(),
    };
  });

  // v2.310.0: the lifetime claw. Points that went home with refunds are a
  // real lifetime number — the desk can quantify the claw the same way it
  // quantifies earning and redemption, instead of leaving the story buried
  // in row reasons. Source of truth: the clawback rows' own reason voice
  // (negative points + `Refund clawback …`), the same contract
  // isRefundClawbackTx speaks on the client.
  const clawAgg = await db.loyaltyTransaction.aggregate({
    where: {
      customerId,
      points: { lt: 0 },
      reason: { startsWith: 'Refund clawback' },
    },
    _sum: { points: true },
  });
  const totalClawedBack = Math.abs(clawAgg._sum.points ?? 0);

  return Response.json({
    success: true,
    data: {
      customerId: customer.id,
      customerName: customer.name,
      phone: customer.phone,
      email: customer.email,
      storeId: customer.storeId,
      points: customer.loyaltyPoints,
      tier: effectiveTier,
      storedTier: customer.loyaltyTier,
      totalEarned: customer.totalLoyaltyEarned,
      totalRedeemed: customer.totalLoyaltyRedeemed,
      totalClawedBack,
      joinedAt: customer.joinedAt.toISOString(),
      createdAt: customer.createdAt.toISOString(),
      nextTierProgress,
      transactions,
    },
  });
}

export const GET = withErrorBoundary(
  requireAuth(getCustomerLoyaltyHandler, {
    roles: ['SUPER_ADMIN', 'STORE_OWNER', 'BRANCH_MANAGER', 'CASHIER', 'ACCOUNTANT'],
  }),
  'CUSTOMER_LOYALTY_GET',
);
