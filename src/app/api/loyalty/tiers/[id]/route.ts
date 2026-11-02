// GET/PUT/DELETE /api/loyalty/tiers/[id]
//
// v2.347.0 — THE LIFECYCLE COMPLETES. The update door stood alone: a tier
// could be created and edited, but never read back alone and never
// retired. The family closes with two doors that answer the exact
// truths the desk needs:
//   • GET — the prefill door: the row PLUS its _count include (the
//     member tally the desk's confirm dialog speaks), riding the same
//     read gate the family list owns; a missing id and a foreign-store
//     id answer the SAME 404 (no existence leak — the family law).
//   • DELETE — the guarded retirement: RBAC mirrors the family create
//     gate, and a tier still holding members is refused with a 409 that
//     names the reassignment the desk owes its members. The guard is
//     the WIRE's own truth; the desk's dialog only mirrors it — a stale
//     list can never talk the wire into deleting a populated tier.
//   • PUT — v2.346.0's update door, unchanged: the body door names every
//     field the handler consumes (all optional — an update writes only
//     what the body carries), the figures ride the SAME validations the
//     create door owns (minPoints >= 0, discountPercent 0–100,
//     pointsMultiplier > 0) applied only when the field is present,
//     and a missing id and a foreign-store id answer the SAME 404.

import { type NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth, type AuthSession } from '@/lib/auth';
import { systemLog, withErrorBoundary } from '@/lib/logger';
import { LogSeverity, LogComponent } from '@/lib/types';
import { readJsonBody, bodyDoorRejected } from '@/lib/request-body';

export const dynamic = 'force-dynamic';

interface RouteContext {
  params: Promise<{ id: string }>;
}

// The tiers family's GET/POST signature keeps the legacy variadic form —
// requireAuth injects the session as the 2nd positional argument and the
// route context rides args[2] (the customers/[id] house pattern).
async function updateLoyaltyTierHandler(...args: unknown[]): Promise<Response> {
  const request = args[0] as NextRequest;
  const session = args[1] as AuthSession;
  const context = args[2] as RouteContext;
  const { id } = await context.params;

  // THE BODY DOOR: an unreadable body is a client mistake (v2.326.0) —
  // the door answers it, the route keeps its own 400s for well-formed
  // bodies that fail validation. BOTH voices, always.
  const door = await readJsonBody<{
    name?: string;
    minPoints?: number;
    maxPoints?: number | null;
    discountPercent?: number;
    pointsMultiplier?: number;
    benefits?: string;
    color?: string;
    icon?: string;
    sortOrder?: number;
    isActive?: boolean;
  }>(request);
  if (!door.ok) {
    return bodyDoorRejected();
  }
  const body = door.body;

  const {
    name,
    minPoints,
    maxPoints,
    discountPercent,
    pointsMultiplier,
    benefits,
    color,
    icon,
    sortOrder,
    isActive,
  } = body;

  const existing = await db.loyaltyTier.findUnique({ where: { id } });
  if (!existing || (session.storeId && existing.storeId !== session.storeId)) {
    // No existence leak: a missing id and a foreign-store id answer the
    // same 404.
    return Response.json(
      { success: false, error: 'Loyalty tier not found.' },
      { status: 404 },
    );
  }

  // The create door's own validations, applied only to fields the body
  // carries — an update never invents a figure it was not sent.
  if (minPoints !== undefined && minPoints < 0) {
    return Response.json(
      { success: false, error: 'minPoints must be 0 or greater.' },
      { status: 400 },
    );
  }
  if (discountPercent !== undefined && (discountPercent < 0 || discountPercent > 100)) {
    return Response.json(
      { success: false, error: 'discountPercent must be between 0 and 100.' },
      { status: 400 },
    );
  }
  if (pointsMultiplier !== undefined && pointsMultiplier <= 0) {
    return Response.json(
      { success: false, error: 'pointsMultiplier must be greater than 0.' },
      { status: 400 },
    );
  }

  const tier = await db.loyaltyTier.update({
    where: { id },
    data: {
      ...(name !== undefined && { name }),
      ...(minPoints !== undefined && { minPoints: parseInt(String(minPoints)) }),
      ...(maxPoints !== undefined && {
        maxPoints: maxPoints === null ? null : parseInt(String(maxPoints)),
      }),
      ...(discountPercent !== undefined && { discountPercent }),
      ...(pointsMultiplier !== undefined && { pointsMultiplier }),
      ...(benefits !== undefined && { benefits: benefits || null }),
      ...(color !== undefined && { color: color || '#6B7280' }),
      ...(icon !== undefined && { icon: icon || null }),
      ...(sortOrder !== undefined && { sortOrder }),
      ...(isActive !== undefined && { isActive }),
    },
  });

  await systemLog({
    action: 'LOYALTY_TIER_UPDATED',
    component: LogComponent.SYSTEM,
    severity: LogSeverity.INFO,
    message: `Loyalty tier "${tier.name}" updated`,
    storeId: tier.storeId,
    userId: session.userId,
    metadata: { tierId: id, updatedFields: Object.keys(body) },
  });

  return Response.json({ success: true, data: tier });
}

export const PUT = withErrorBoundary(
  requireAuth(updateLoyaltyTierHandler, {
    roles: ['SUPER_ADMIN', 'STORE_OWNER'],
  }),
  'LOYALTY_TIER_UPDATE',
);

// ---------------------------------------------------------------------------
// v2.347.0 — THE PREFILL DOOR (GET)
//
// The desk's confirm dialog needs the tier's CURRENT truth, not the
// list slice it rendered from: a member assigned two seconds ago must
// speak before the dialog lets a deletion through. The door answers
// the row PLUS its _count include — the same tally shape the family
// list already rides — and keeps the family's no-existence-leak 404.

async function getLoyaltyTierHandler(...args: unknown[]): Promise<Response> {
  const session = args[1] as AuthSession;
  const context = args[2] as RouteContext;
  const { id } = await context.params;

  const tier = await db.loyaltyTier.findUnique({
    where: { id },
    include: { _count: { select: { customerTiers: true } } },
  });
  if (!tier || (session.storeId && tier.storeId !== session.storeId)) {
    // No existence leak: a missing id and a foreign-store id answer the
    // same 404 — the same voice the update door speaks.
    return Response.json(
      { success: false, error: 'Loyalty tier not found.' },
      { status: 404 },
    );
  }

  return Response.json({ success: true, data: tier });
}

export const GET = withErrorBoundary(
  requireAuth(getLoyaltyTierHandler, {
    roles: ['SUPER_ADMIN', 'STORE_OWNER', 'BRANCH_MANAGER', 'CASHIER', 'ACCOUNTANT'],
  }),
  'LOYALTY_TIER_READ',
);

// ---------------------------------------------------------------------------
// v2.347.0 — THE GUARDED RETIREMENT (DELETE)
//
// A tier that still holds members is a promise the store has made to
// those customers; deleting it out from under them would strand the
// membership rows the schema protects. The wire refuses first (409,
// the reassignment named in the voice) — the desk's confirm dialog is
// a courtesy mirror, never the authority.

async function deleteLoyaltyTierHandler(...args: unknown[]): Promise<Response> {
  const session = args[1] as AuthSession;
  const context = args[2] as RouteContext;
  const { id } = await context.params;

  const tier = await db.loyaltyTier.findUnique({
    where: { id },
    include: { _count: { select: { customerTiers: true } } },
  });
  if (!tier || (session.storeId && tier.storeId !== session.storeId)) {
    // No existence leak: a missing id and a foreign-store id answer the
    // same 404 — the same voice the update door speaks.
    return Response.json(
      { success: false, error: 'Loyalty tier not found.' },
      { status: 404 },
    );
  }

  const memberCount = tier._count.customerTiers;
  if (memberCount > 0) {
    const unit = memberCount === 1 ? 'member' : 'members';
    return Response.json(
      {
        success: false,
        error: `This tier still holds ${memberCount} ${unit} — reassign them to another tier before deleting.`,
      },
      { status: 409 },
    );
  }

  const deleted = await db.loyaltyTier.delete({ where: { id } });

  await systemLog({
    action: 'LOYALTY_TIER_DELETED',
    component: LogComponent.SYSTEM,
    severity: LogSeverity.INFO,
    message: `Loyalty tier "${deleted.name}" deleted`,
    storeId: deleted.storeId,
    userId: session.userId,
    metadata: { tierId: id, name: deleted.name },
  });

  return Response.json({ success: true, data: deleted });
}

export const DELETE = withErrorBoundary(
  requireAuth(deleteLoyaltyTierHandler, {
    roles: ['SUPER_ADMIN', 'STORE_OWNER'],
  }),
  'LOYALTY_TIER_DELETE',
);
