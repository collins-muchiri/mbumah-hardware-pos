// GET/POST /api/categories

import { type NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { systemLog, withErrorBoundary } from '@/lib/logger';
import { LogSeverity, LogComponent } from '@/lib/types';
import { withSessionAuth, MANAGER_PLUS_ROLES } from '@/lib/auth';
import { readCadenceLaw } from '@/lib/cadence-law';
import { readJsonBody, bodyDoorRejected } from '@/lib/request-body';

export const dynamic = 'force-dynamic';

// ── v2.236.0 THE TEETH ───────────────────────────────────────────────────
// The cadence's branch-side voice (the org face POINTS, the branch pens
// walk): when the picker asks (`includeCadence=true`), every category of
// THIS store learns WHEN a closed count sheet last touched its shelf —
// the same four bands the org map speaks (fresh ≤ freshDays, stale within
// the window, beyond = counted before but not inside this window, never =
// no closed line has EVER touched it). THE STORE LAW: the reads are
// scoped to the wire's own storeId — a branch hears its own shelves, and
// a branch walker without org eyes still gets the truth. THE OPT-IN LAW:
// the field rides only when asked — every other consumer of this wire
// (catalog pickers, filters, admin surfaces) reads the exact bytes it
// read yesterday. THE COST LAW: no cost field crosses this block — the
// cadence reads the catalog, not the caller's gate. THE VOICE-NOT-SORT
// LAW: the rows keep the categories' own sortOrder; the cadence is a
// voice on each option, and the walk order belongs to the org map.
// v2.241.0 THE WALK'S LAW: the constants are gone — the thresholds are
// read from the org's stored law (src/lib/cadence-law.ts, one bounded
// read; the defaults 7/30 are the floor). The org map and the branch
// teeth speak the SAME pair because they READ the same pair.
const CADENCE_DAY_MS = 86_400_000;

type CadenceBand = 'fresh' | 'stale' | 'beyond' | 'never';

async function cadenceByCategory(
  storeId: string,
  categoryIds: string[],
): Promise<Map<string, { band: CadenceBand; daysSince: number | null; lastCountedAt: string | null; freshDays: number; windowDays: number; lastWalkUnits: number | null }>> {
  const out = new Map<string, { band: CadenceBand; daysSince: number | null; lastCountedAt: string | null; freshDays: number; windowDays: number; lastWalkUnits: number | null }>();
  if (categoryIds.length === 0) return out;
  const now = new Date();
  // THE LAW'S OWN WINDOW (v2.241.0): the teeth's window is the org's
  // stored law — one read per request, the same pair the map speaks.
  const law = await readCadenceLaw(db);
  const windowStart = new Date(now.getTime() - law.windowDays * CADENCE_DAY_MS);

  // Three bounded reads (the org cadence's composition, store-scoped):
  // (1) this store's closed sheets inside the window (ids + closedAt),
  // (2) their line pairs (bounded by the window's own sheets), and
  // (3) the heard-ever product set — one groupBy over the store's CLOSED
  // sheets through the category bridge (lines carry no categoryId of
  // their own; the product→category map is the only bridge a line has).
  const [windowSheets, heardEverGroups] = await Promise.all([
    db.stockTake.findMany({
      where: { storeId, status: 'CLOSED', closedAt: { gte: windowStart } },
      select: { id: true, closedAt: true },
    }),
    db.stockTakeLine.groupBy({
      by: ['productId'],
      where: {
        stockTake: { storeId, status: 'CLOSED' },
        product: { categoryId: { in: categoryIds } },
      },
    }),
  ]);
  const windowSheetIds = windowSheets.map((s) => s.id);
  const [windowLines, productRows] = await Promise.all([
    windowSheetIds.length
      ? db.stockTakeLine.findMany({
          where: { stockTakeId: { in: windowSheetIds } },
          // v2.245.0 THE WALK'S FINDINGS — the variance rides the read the
          // cadence already makes (one added column, zero new queries):
          // the pick face can now say what the last walk FOUND, not just
          // when the shelf was last heard.
          select: { stockTakeId: true, productId: true, variance: true },
        })
      : Promise.resolve([] as Array<{ stockTakeId: string; productId: string; variance: number | null }>),
    heardEverGroups.length
      ? db.product.findMany({
          where: { id: { in: heardEverGroups.map((g) => g.productId) } },
          select: { id: true, categoryId: true },
        })
      : Promise.resolve([] as Array<{ id: string; categoryId: string | null }>),
  ]);

  const categoryOfProduct = new Map(
    productRows.filter((p) => p.categoryId != null).map((p) => [p.id, p.categoryId as string]),
  );
  const closedAtById = new Map(windowSheets.map((s) => [s.id, s.closedAt]));
  const heardSheetsByCategory = new Map<string, Set<string>>();
  for (const pair of windowLines) {
    const categoryId = categoryOfProduct.get(pair.productId);
    if (!categoryId) continue;
    const set = heardSheetsByCategory.get(categoryId);
    if (set) set.add(pair.stockTakeId);
    else heardSheetsByCategory.set(categoryId, new Set([pair.stockTakeId]));
  }
  const heardEverByCategory = new Set<string>();
  for (const productId of heardEverGroups.map((g) => g.productId)) {
    const categoryId = categoryOfProduct.get(productId);
    if (categoryId) heardEverByCategory.add(categoryId);
  }
  // v2.245.0 THE WALK'S FINDINGS — per shelf, the LATEST window walk
  // that actually SPOKE for it (a line with variance non-null; a line
  // the floor never counted stays silent, and a sheet whose lines in
  // this category were all uncounted has no findings here — the honest
  // absence, never a hidden zero), and the units its lines in THIS
  // category landed (line-level attribution — the shelf's own truth,
  // not the whole sheet's). THE UNITS LAW: units are units — every
  // role hears them; the shillings gate is NOT involved. A perfect
  // count speaks 0 — the shelf held. THE ZERO-NEW-QUERIES LAW: the
  // attribution rides the pairs already in hand (the variance column
  // above) — no second read, no product join beyond the map above.
  const lastSpokenByCategory = new Map<string, { sheetKey: string; closedAt: Date; units: number }>();
  for (const pair of windowLines) {
    if (pair.variance == null) continue;
    const categoryId = categoryOfProduct.get(pair.productId);
    if (!categoryId) continue;
    const closedAt = closedAtById.get(pair.stockTakeId);
    if (!closedAt) continue;
    const cur = lastSpokenByCategory.get(categoryId);
    if (!cur || closedAt > cur.closedAt) {
      lastSpokenByCategory.set(categoryId, { sheetKey: pair.stockTakeId, closedAt, units: Number(pair.variance) });
    } else if (pair.stockTakeId === cur.sheetKey) {
      cur.units += Number(pair.variance);
    }
  }
  for (const categoryId of categoryIds) {
    const heardSheetIds = heardSheetsByCategory.get(categoryId);
    let lastCountedAt: Date | null = null;
    if (heardSheetIds) {
      for (const sheetId of heardSheetIds) {
        const at = closedAtById.get(sheetId);
        if (at && (!lastCountedAt || at > lastCountedAt)) lastCountedAt = at;
      }
    }
    const daysSince = lastCountedAt
      ? Math.max(0, Math.floor((now.getTime() - lastCountedAt.getTime()) / CADENCE_DAY_MS))
      : null;
    const band: CadenceBand = lastCountedAt
      ? (daysSince ?? 0) <= law.freshDays ? 'fresh' : 'stale'
      : heardEverByCategory.has(categoryId) ? 'beyond' : 'never';
    out.set(categoryId, {
      band,
      daysSince,
      lastCountedAt: lastCountedAt ? lastCountedAt.toISOString() : null,
      freshDays: law.freshDays,
      windowDays: law.windowDays,
      // v2.245.0: the latest speaking walk's units in THIS category
      // (rounded like the census speaks) — null when no window walk
      // spoke here (beyond/never/a silent latest), the shelf's own
      // honest absence.
      lastWalkUnits: (() => {
        const spoken = lastSpokenByCategory.get(categoryId);
        return spoken ? Math.round(spoken.units * 100) / 100 : null;
      })(),
    });
  }
  return out;
}

async function getCategoriesHandler(...args: unknown[]): Promise<Response> {
  const request = args[0] as NextRequest;
  const { searchParams } = new URL(request.url);

  const storeId = searchParams.get('storeId');
  if (!storeId) {
    return Response.json(
      { success: false, error: 'storeId is required.' },
      { status: 400 }
    );
  }

  const includeProductCount = searchParams.get('includeProductCount') === 'true';
  const includeCadence = searchParams.get('includeCadence') === 'true';
  const isActive = searchParams.get('isActive');

  const where: Record<string, unknown> = { storeId };
  if (isActive !== null && isActive !== undefined) {
    where.isActive = isActive === 'true';
  }

  const categories = await db.productCategory.findMany({
    where,
    orderBy: { sortOrder: 'asc' },
    include: includeProductCount
      ? { _count: { select: { products: { where: { isActive: true } } } } }
      : undefined,
  });

  // v2.236.0: the cadence rides ONLY when the picker asks — one bounded
  // composition over this store's own closed sheets, voiced per category.
  const cadence = includeCadence
    ? await cadenceByCategory(storeId, categories.map((c) => c.id))
    : null;

  const result = categories.map((cat) => {
    const { _count, ...categoryData } = cat as typeof cat & { _count?: { products: number } };
    const row = {
      ...categoryData,
      ...(includeProductCount ? { productCount: _count?.products || 0 } : {}),
    };
    if (cadence) {
      const c = cadence.get(row.id);
      if (c) (row as Record<string, unknown>).cadence = c;
    }
    return row;
  });

  return Response.json({ success: true, data: result });
}

async function createCategoryHandler(...args: unknown[]): Promise<Response> {
  const request = args[0] as NextRequest;
  // THE BODY DOOR: an unreadable body is a client mistake (v2.326.0):
  // v2.336.0 the door speaks the category's own wire shape; sortOrder
  // carries null because the handler's own auto-pick branch checks it.
  const door = await readJsonBody<{
    storeId?: string;
    name?: string;
    description?: string;
    icon?: string;
    color?: string;
    sortOrder?: number | null;
    isActive?: boolean;
  }>(request);
  if (!door.ok) {
    return bodyDoorRejected();
  }
  const body = door.body;

  const { storeId, name, description, icon, color, sortOrder, isActive } = body;

  if (!storeId || !name) {
    return Response.json(
      { success: false, error: 'storeId and name are required.' },
      { status: 400 }
    );
  }

    const existing = await db.productCategory.findFirst({
    where: { storeId, name: { equals: name } },
  });

  if (existing) {
    return Response.json(
      { success: false, error: 'A category with this name already exists in this store.' },
      { status: 409 }
    );
  }

    let categorySortOrder = sortOrder;
  if (categorySortOrder === undefined || categorySortOrder === null) {
    const maxSort = await db.productCategory.findFirst({
      where: { storeId },
      orderBy: { sortOrder: 'desc' },
      select: { sortOrder: true },
    });
    categorySortOrder = (maxSort?.sortOrder ?? 0) + 1;
  }

  const category = await db.productCategory.create({
    data: {
      storeId,
      name,
      description: description || null,
      icon: icon || null,
      color: color || null,
      sortOrder: categorySortOrder,
      isActive: isActive ?? true,
    },
  });

  await systemLog({
    action: 'CATEGORY_CREATED',
    component: LogComponent.INVENTORY,
    severity: LogSeverity.INFO,
    message: `Category "${name}" created`,
    storeId,
    metadata: { categoryId: category.id, name },
  });

  return Response.json({ success: true, data: category }, { status: 201 });
}

// AUDIT FIX (Task 3-d): GET = any store role; POST (catalog taxonomy write) =
// manager-or-above.
export const GET = withErrorBoundary(withSessionAuth(getCategoriesHandler), 'CATEGORIES_LIST');
export const POST = withErrorBoundary(
  withSessionAuth(createCategoryHandler, { roles: MANAGER_PLUS_ROLES }),
  'CATEGORIES_CREATE',
);
