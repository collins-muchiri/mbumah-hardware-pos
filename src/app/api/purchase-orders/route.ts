// GET/POST /api/purchase-orders

import { type NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { systemLog, withErrorBoundary } from '@/lib/logger';
import { LogSeverity, LogComponent } from '@/lib/types';
import { requireStoreAccess, type AuthSession } from '@/lib/auth';
// v2.250.0: the gate's reader lives with the org wires' own (the auth
// module never exported it — the build caught the import's address).
import { hasFeaturePermission } from '@/lib/permissions';
import { withSequenceRetry } from '@/lib/sequence';
// Task 12-c: canonical financial math - line totalCost = round2(qty × unitCost)
// computed in Decimal (HALF_UP). The old `Math.round(qty × unitCost × 100)/100`
// was a float hack that biased half-cent lines DOWN (x.xx5 → x.xx) and let
// IEEE-754 dust into the Decimal header totals.
import { toDec, round2 } from '@/lib/utils/financialMath';
import { getVatRatePercent } from '@/lib/vat-settings';
// v2.323.0 THE DOOR IS HONEST ABOUT ITS NUMBERS — the roster's pagination
// ints read through the honest-param home (the same laws the loyalty
// ledger's door has spoken since v2.321.0). THE 500 PROOF, LIVE: this
// door used to read `parseInt(searchParams.get('page') || '1')`, so a
// bookmark like ?page=abc rode NaN straight into Prisma's `skip` and the
// route answered a 500 — the same bug class the loyalty door's QA walk
// proved and fixed. A malformed number is now a fallback, never a crash,
// and the take is clamped (the wire never serves more than the house's
// largest gait).
import { parseClampedIntParam, parsePositiveIntParam } from '@/lib/tab-url';
// v2.252.0 THE ROSTER'S WHEN — the branch roster's sheet-born rows answer
// when their walk aisle was last heard (the org wire's own read, ported
// to the branch): the census's single-aisle read (one home) and the
// stored law (one reader).
import { readCategoryBand, type CadenceBand } from '@/lib/cadence-band';
import { readCadenceLaw } from '@/lib/cadence-law';
import { readJsonBody, bodyDoorRejected } from '@/lib/request-body';

export const dynamic = 'force-dynamic';

// v2.8.0: the default VAT rate now lives in the admin-controlled setting
// (SystemConfig `vat_rate_percent`, see src/lib/vat-settings.ts). This
// constant is only the fallback if the settings table is unreachable.
const FALLBACK_VAT_RATE = 16;

async function getPurchaseOrdersHandler(
  request: NextRequest,
  session: AuthSession,
): Promise<Response> {
  const { searchParams } = new URL(request.url);

  // v2.250.0 THE BRANCH'S GATE — the org wires have spoken the cost gate
  // since v2.227.0 and the products wire since v2.12.2, but this wire
  // never grew it: every viewer with store access read the roster's
  // shillings. The law lands here (additive in shape — the same
  // `costGated` flag the org wire speaks) and the faces render the
  // honest absence, never a hidden zero.
  const canViewCost = hasFeaturePermission(session.role, 'inventory.view.cost');

  const storeId = searchParams.get('storeId');
  if (!storeId) {
    return Response.json(
      { success: false, error: 'storeId is required.' },
      { status: 400 }
    );
  }

  const supplierId = searchParams.get('supplierId');
  const status = searchParams.get('status');
  const dateFrom = searchParams.get('dateFrom');
  const dateTo = searchParams.get('dateTo');
  // v2.323.0: honest integers (parsePositiveIntParam: shape law — a
  // missing/malformed/zero/negative/float `page` answers 1; a past-the-end
  // page stays an honest empty, the desk's face speaks it).
  // parseClampedIntParam: the take is served inside [1, 200] — the house's
  // largest gait — so `?limit=5000` can never ask the shelf for the world.
  const page = parsePositiveIntParam(searchParams.get('page'), 1);
  const limit = parseClampedIntParam(searchParams.get('limit'), 50, 1, 200);

  const where: Record<string, unknown> = { storeId };

  if (supplierId) where.supplierId = supplierId;
  if (status) where.status = status;

  if (dateFrom || dateTo) {
    const orderDate: Record<string, Date> = {};
    if (dateFrom) orderDate.gte = new Date(dateFrom);
    if (dateTo) {
      const to = new Date(dateTo);
      to.setHours(23, 59, 59, 999);
      orderDate.lte = to;
    }
    where.orderDate = orderDate;
  }

  const [purchaseOrders, total] = await Promise.all([
    db.purchaseOrder.findMany({
      where,
      include: {
        supplier: {
          select: { id: true, name: true, phone: true, email: true },
        },
        createdBy: {
          select: { id: true, name: true },
        },
        approvedBy: {
          select: { id: true, name: true },
        },
        // v2.248.0 THE RESTOCK'S BIRTH — the sheet a PO was born from rides
        // the list (additive + optional): the faces wear the violet birth
        // chip when the wire carries one; a hand-raised PO reads null and
        // renders the silent absence (the type check, never an assumption).
        originStockTake: {
          select: {
            id: true,
            status: true,
            closedAt: true,
            // v2.252.0: the aisle's id rides so the wire can read each
            // aisle's own band (the census's single-aisle read — the
            // name alone could never ask the shelf when it was heard).
            walkAisle: { select: { id: true, name: true } },
          },
        },
        _count: { select: { items: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    db.purchaseOrder.count({ where }),
  ]);

  // v2.252.0 THE ROSTER'S WHEN — the roster's sheet-born rows answer when
  // their walk aisle was last heard, the org list wire's own read ported
  // to the branch. THE COST, ASSESSED HONESTLY (the worklog's demand):
  // ONE stored-law read, then ONE band read per DISTINCT aisle id on the
  // page — a page of rows shares its aisles (limit is the roster's own
  // page size; the distinct count is the page's aisle spread, not the
  // row count), and each read is the census's own three bounded queries
  // via the TENANT client (the branch's floor answers for the branch's
  // aisle — the stock-takes' own pattern). A read that fails is no band
  // — the row keeps its silence, never a guessed house.
  const aisleIds = [
    ...new Set(
      purchaseOrders
        .map((po) => po.originStockTake?.walkAisle?.id)
        .filter((v): v is string => typeof v === 'string'),
    ),
  ];
  const aisleBands = new Map<string, { band: CadenceBand; daysSince: number | null }>();
  if (aisleIds.length > 0) {
    const law = await readCadenceLaw(db);
    for (const aisleId of aisleIds) {
      const band = await readCategoryBand(db, aisleId, law, new Date());
      if (band) aisleBands.set(aisleId, { band: band.band, daysSince: band.daysSince });
    }
  }

  const result = purchaseOrders.map((po) => {
    const { _count, ...poData } = po as typeof po & { _count?: { items: number } };
    return {
      ...poData,
      itemCount: _count?.items ?? 0,
      // v2.250.0 THE BRANCH'S GATE — the roster's shillings speak only
      // past the gate (null otherwise — the face renders the honest
      // absence, never a hidden zero; the units and the statuses stay
      // every viewer's own truth).
      subTotal: canViewCost ? Number(poData.subTotal) : null,
      taxAmount: canViewCost ? Number(poData.taxAmount) : null,
      totalAmount: canViewCost ? Number(poData.totalAmount) : null,
      // v2.252.0: the aisle's band rides the birth (additive + optional —
      // a failed read answers null and the row keeps its silence, the
      // honest absence). The band is not a cost: it rides for every
      // viewer.
      originStockTake: poData.originStockTake
        ? {
            ...poData.originStockTake,
            walkAisle: poData.originStockTake.walkAisle
              ? {
                  id: poData.originStockTake.walkAisle.id,
                  name: poData.originStockTake.walkAisle.name,
                  band: aisleBands.get(poData.originStockTake.walkAisle.id)?.band ?? null,
                  daysSince: aisleBands.get(poData.originStockTake.walkAisle.id)?.daysSince ?? null,
                }
              : poData.originStockTake.walkAisle,
          }
        : poData.originStockTake,
    };
  });

  return Response.json({
    success: true,
    data: result,
    // v2.250.0: the gate's own flag rides the envelope (the org wire's
    // shape) — the faces branch on the truth the wire speaks, never on
    // a role name guessed client-side.
    costGated: !canViewCost,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}

async function createPurchaseOrderHandler(
  request: NextRequest,
  session: AuthSession,
): Promise<Response> {
  // THE BODY DOOR: an unreadable body is a client mistake (v2.326.0):
  const door = await readJsonBody(request);
  if (!door.ok) {
    return bodyDoorRejected();
  }
  const body = door.body;

  const { storeId, supplierId, items, notes, expectedDate, originStockTakeId } = body as {
    storeId?: string;
    supplierId?: string;
    items?: unknown;
    notes?: string;
    expectedDate?: string;
    // v2.248.0 THE RESTOCK'S BIRTH — the drill's restock door is the only
    // writer; the wire never guesses a birth the caller did not name.
    originStockTakeId?: string;
  };

  if (!storeId || !supplierId) {
    return Response.json(
      { success: false, error: 'storeId and supplierId are required.' },
      { status: 400 }
    );
  }

  if (!items || !Array.isArray(items) || items.length === 0) {
    return Response.json(
      { success: false, error: 'At least one item is required.' },
      { status: 400 }
    );
  }

  // Validate supplier exists and is active
  const supplier = await db.supplier.findFirst({
    where: { id: supplierId, storeId, isActive: true },
  });
  if (!supplier) {
    return Response.json(
      { success: false, error: 'Supplier not found or inactive.' },
      { status: 404 }
    );
  }

  // Validate all products exist and belong to the store
  const productIds = items.map((item: { productId: string }) => item.productId);
  const products = await db.product.findMany({
    where: { id: { in: productIds }, storeId, isActive: true },
    select: { id: true, name: true, sku: true, unitType: true, costPrice: true },
  });

  if (products.length !== productIds.length) {
    const foundIds = new Set(products.map((p) => p.id));
    const missing = productIds.filter((id: string) => !foundIds.has(id));
    return Response.json(
      { success: false, error: `Products not found or inactive: ${missing.join(', ')}` },
      { status: 404 }
    );
  }

  const productMap = new Map(products.map((p) => [p.id, p]));

  // v2.248.0 THE BIRTH ALLOWLIST — an origin is EXPLICIT intent, so a bad
  // one is a REJECTION, never a silent null (the aisle answer's silent law
  // serves inference; this is a named address). The sheet must exist,
  // belong to the SAME store, and be CLOSED — a PO raised against a live
  // count would freeze a number the floor is still disputing.
  if (originStockTakeId != null && originStockTakeId !== '') {
    const birthSheet = await db.stockTake.findUnique({
      where: { id: originStockTakeId },
      select: { id: true, storeId: true, status: true },
    });
    if (!birthSheet || birthSheet.storeId !== storeId) {
      return Response.json(
        { success: false, error: 'originStockTakeId does not name a count sheet in this store.' },
        { status: 400 }
      );
    }
    if (birthSheet.status !== 'CLOSED') {
      return Response.json(
        { success: false, error: 'originStockTakeId names a sheet that is not CLOSED — the books have not heard it yet.' },
        { status: 400 }
      );
    }
  }

  // F1-5 remediation: validate quantities/costs BEFORE computing totals.
  // Negative/zero/NaN/Infinity values used to flow straight into Decimal
  // columns and corrupt supplier-spend reporting.
  for (const item of items as Array<{ productId: string; quantity: number; unitCost: number }>) {
    const qty = Number(item.quantity);
    const cost = Number(item.unitCost);
    if (!Number.isFinite(qty) || qty <= 0) {
      return Response.json(
        { success: false, error: `Invalid quantity for product ${item.productId}: must be a positive finite number.` },
        { status: 400 }
      );
    }
    if (!Number.isFinite(cost) || cost < 0) {
      return Response.json(
        { success: false, error: `Invalid unitCost for product ${item.productId}: must be a non-negative finite number.` },
        { status: 400 }
      );
    }
  }

  // F1-6 remediation: PO creation is retried on P2002 (concurrent double-
  // submit) with a re-allocated per-store sequence number. The schema's
  // uniqueness is now @@unique([storeId, poNumber]) - matching the per-store
  // counter - so store B no longer collides with store A's numbers.
  // F1-5 remediation: money rounded 2dp per line BEFORE header summation
  // (the old path summed raw IEEE-754 products into Decimal columns).
  const { created: purchaseOrder, poNumber, subTotal, taxAmount, totalAmount } = await withSequenceRetry(async () => {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    const existingCount = await db.purchaseOrder.count({
      where: { storeId, poNumber: { startsWith: `PO-${dateStr}` } },
    });
    const poNumber = `PO-${dateStr}-${String(existingCount + 1).padStart(4, '0')}`;

    // Task 12-c: POs are VAT-EXCLUSIVE B2B documents - VAT is added ON TOP of
    // the net subtotal (unchanged policy). All sums now run in Decimal:
    //   line totalCost = round2(qty × unitCost)          (HALF_UP, 2dp)
    //   subTotal       = Σ(rounded line totalCost)       (exact)
    //   taxAmount      = round2(subTotal × 16%)
    //   totalAmount    = subTotal + taxAmount
    let subTotalDec = toDec(0);
    const poItems = items.map((item: { productId: string; quantity: number; unitCost: number; notes?: string }) => {
      const product = productMap.get(item.productId);
      const totalCost = round2(toDec(item.quantity).mul(toDec(item.unitCost)));
      subTotalDec = subTotalDec.plus(totalCost);
      return {
        productId: item.productId,
        productName: product?.name || 'Unknown Product',
        quantity: item.quantity,
        unitCost: item.unitCost,
        totalCost,
        notes: item.notes || null,
      };
    });
    const subTotal = round2(subTotalDec);

    // v2.8.0: VAT fully controlled by the admin setting (0% ⇒ no VAT).
    const vatRate = await getVatRatePercent().catch(() => FALLBACK_VAT_RATE);
    const taxAmount = round2(subTotalDec.mul(vatRate).div(100));
    const totalAmount = round2(subTotalDec.plus(taxAmount));

    const created = await db.purchaseOrder.create({
      data: {
        storeId,
        poNumber,
        supplierId,
        status: 'DRAFT',
        subTotal,
        taxAmount,
        totalAmount,
        notes: notes || null,
        expectedDate: expectedDate ? new Date(expectedDate) : null,
        // v2.248.0: the birth rides only when the allowlist passed — a
        // hand-raised PO stores no origin (the faces count births, never
        // infer them).
        originStockTakeId: originStockTakeId != null && originStockTakeId !== '' ? originStockTakeId : null,
        // F1-3/SYS-2: creator identity from the session, not the body.
        createdById: session.userId,
        items: {
          create: poItems,
        },
      },
      include: {
        supplier: { select: { id: true, name: true } },
        createdBy: { select: { id: true, name: true } },
        items: {
          include: {
            product: { select: { id: true, name: true, sku: true, unitType: true } },
          },
        },
      },
    });

    return { created, poNumber, subTotal, taxAmount, totalAmount };
  });

  await systemLog({
    action: 'PURCHASE_ORDER_CREATED',
    component: LogComponent.INVENTORY,
    severity: LogSeverity.INFO,
    message: `Purchase Order ${poNumber} created for supplier "${supplier.name}"`,
    storeId,
    metadata: { poId: purchaseOrder.id, poNumber, supplierId, totalAmount, subTotal, taxAmount, itemCount: items.length, originStockTakeId: originStockTakeId ?? null },
  });

  return Response.json({ success: true, data: purchaseOrder }, { status: 201 });
}

export const GET = withErrorBoundary(
  requireStoreAccess(getPurchaseOrdersHandler),
  'PURCHASE_ORDERS_LIST',
);
export const POST = withErrorBoundary(
  requireStoreAccess(createPurchaseOrderHandler),
  'PURCHASE_ORDERS_CREATE',
);
