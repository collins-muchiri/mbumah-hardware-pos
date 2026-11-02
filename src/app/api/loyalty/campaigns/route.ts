// GET/POST /api/loyalty/campaigns

import { type NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { systemLog, withErrorBoundary } from '@/lib/logger';
import { LogSeverity, LogComponent } from '@/lib/types';
import { withSessionAuth, MANAGER_PLUS_ROLES } from '@/lib/auth';
import { readJsonBody, bodyDoorRejected } from '@/lib/request-body';

export const dynamic = 'force-dynamic';

async function getLoyaltyCampaignsHandler(...args: unknown[]): Promise<Response> {
  const request = args[0] as NextRequest;
  const { searchParams } = new URL(request.url);

  const storeId = searchParams.get('storeId');
  if (!storeId) {
    return Response.json(
      { success: false, error: 'storeId is required.' },
      { status: 400 }
    );
  }

  const status = searchParams.get('status');
  const campaignType = searchParams.get('campaignType');
  const search = searchParams.get('search') || '';
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '50');
  const sortBy = searchParams.get('sortBy') || 'createdAt';
  const sortOrder = searchParams.get('sortOrder') || 'desc';

  const where: Record<string, unknown> = { storeId };

  if (status) {
    where.status = status;
  }

  if (campaignType) {
    where.campaignType = campaignType;
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }

  const validSortFields = ['name', 'createdAt', 'startDate', 'status', 'totalPointsAwarded'];
  const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
  const orderDirection = sortOrder === 'asc' ? 'asc' : 'desc';

  const [campaigns, total] = await Promise.all([
    db.loyaltyCampaign.findMany({
      where,
      orderBy: { [sortField]: orderDirection },
      skip: (page - 1) * limit,
      take: limit,
    }),
    db.loyaltyCampaign.count({ where }),
  ]);

  return Response.json({
    success: true,
    data: campaigns,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}

// THE ANSWERING CHAIN (v2.342.0 — the waking probe's fix): bonusPoints and
// multiplier feed Int/Decimal columns, but v2.341.0's live QA showed a
// numeric string ("bonusPoints": "50") riding the create data untouched
// (`bonusPoints ?? 0`) and dying in Prisma's depths as a 500
// PrismaClientValidationError (Expected Int, provided String). The route
// now speaks the columns' shape first: a numeric string becomes the number
// it names (the tiers parseInt(String()) precedent, kept honest — the
// chain also truncates to the Int the column demands), and a non-numeric
// anything is the client's own mistake, answered with the route's own 400
// voice instead of a 500 from the ORM. The door widens to number | string
// (the filings precedent — the chain's own signature IS the widening).
function coerceFigure(value: number | string): number | null {
  const n = typeof value === 'number' ? value : Number(String(value).trim());
  return Number.isFinite(n) ? n : null;
}

async function createLoyaltyCampaignHandler(...args: unknown[]): Promise<Response> {
  const request = args[0] as NextRequest;
  // THE BODY DOOR: an unreadable body is a client mistake (v2.326.0):
  // v2.341.0 — the door speaks its shape: the pair rides REQUIRED strings
  // (the route's own truthiness guard is the validator), campaignType rides
  // the route's own validTypes validator, and the columns ride the types
  // the create data feeds (Int/Decimal numbers, string columns, the ISO
  // date strings new Date() reads).
  // v2.342.0 — the figures widen to number | string: the answering chain
  // below owns the widening, so the door may not lie about it.
  const door = await readJsonBody<{
    storeId: string;
    name: string;
    campaignType?: string;
    description?: string;
    bonusPoints?: number | string;
    multiplier?: number | string;
    startDate?: string;
    endDate?: string;
    targetTierId?: string;
    createdBy?: string;
  }>(request);
  if (!door.ok) {
    return bodyDoorRejected();
  }
  const body = door.body;

  const {
    storeId,
    name,
    campaignType,
    description,
    bonusPoints,
    multiplier,
    startDate,
    endDate,
    targetTierId,
    createdBy,
  } = body;

  if (!storeId || !name) {
    return Response.json(
      { success: false, error: 'storeId and name are required.' },
      { status: 400 }
    );
  }

  const validTypes = ['BONUS_POINTS', 'DOUBLE_POINTS', 'TIER_UPGRADE', 'SPECIAL_EVENT'];
  const cType = campaignType || 'BONUS_POINTS';
  if (!validTypes.includes(cType)) {
    return Response.json(
      { success: false, error: `Invalid campaignType. Must be one of: ${validTypes.join(', ')}` },
      { status: 400 }
    );
  }

  // THE ANSWERING CHAIN (v2.342.0): the figures pass the chain before the
  // columns see them — a numeric string becomes the number it names, a
  // non-numeric anything answers 400, and bonusPoints truncates to the Int
  // the column demands (a 50.7 used to die in Prisma as a non-integer too).
  const bonusPointsValue = bonusPoints === undefined ? 0 : coerceFigure(bonusPoints);
  const multiplierValue = multiplier === undefined ? 1 : coerceFigure(multiplier);
  if (bonusPointsValue === null || multiplierValue === null) {
    return Response.json(
      { success: false, error: 'bonusPoints and multiplier must be numbers.' },
      { status: 400 }
    );
  }
  const bonusPointsInt = Math.trunc(bonusPointsValue);

  const campaign = await db.loyaltyCampaign.create({
    data: {
      storeId,
      name,
      campaignType: cType,
      description: description || null,
      bonusPoints: bonusPointsInt,
      multiplier: multiplierValue,
      startDate: startDate ? new Date(startDate) : new Date(),
      endDate: endDate ? new Date(endDate) : null,
      targetTierId: targetTierId || null,
      status: 'DRAFT',
      totalPointsAwarded: 0,
      totalParticipants: 0,
      createdBy: createdBy || null,
    },
  });

  await systemLog({
    action: 'LOYALTY_CAMPAIGN_CREATED',
    component: LogComponent.SYSTEM,
    severity: LogSeverity.INFO,
    message: `Loyalty campaign "${name}" created (${cType})`,
    storeId,
    userId: createdBy || undefined,
    metadata: { campaignId: campaign.id, campaignType: cType, bonusPoints: bonusPointsInt, multiplier: multiplierValue },
  });

  return Response.json({ success: true, data: campaign }, { status: 201 });
}

// AUDIT FIX (Task 3-d): GET = any store role; POST (campaign create) =
// manager-or-above.
export const GET = withErrorBoundary(
  withSessionAuth(getLoyaltyCampaignsHandler),
  'LOYALTY_CAMPAIGNS_LIST',
);
export const POST = withErrorBoundary(
  withSessionAuth(createLoyaltyCampaignHandler, { roles: MANAGER_PLUS_ROLES }),
  'LOYALTY_CAMPAIGNS_CREATE',
);
