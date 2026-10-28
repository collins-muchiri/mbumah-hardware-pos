// GET /api/org/kpi-summary (v2.18.3 organization console)
//
// Organization-wide KPI aggregate for the /console expert console. Every
// number is COMPUTED FROM THE DATABASE - nothing is hardcoded, no synthetic
// demo targets. Runs inside runWithoutTenant because the console is a
// cross-store surface; the role gate below is the authorization boundary.
//
// REVENUE SEMANTICS (v2.185.0 — the two revenues agree):
//   Revenue here is GROSS of tax (`_sum.totalAmount`, the till face) —
//   the SAME semantic /api/org/summary has spoken since v2.173.0 on the
//   owner dashboard. Until v2.184.0 this route subtracted `taxAmount`, so
//   the two consoles' identically-labeled "Revenue" KPIs disagreed (a
//   cross-surface divergence recorded in v2.173.0 and reconciled here).
//   The net and VAT views did not die: the payload now carries the tax
//   ADDITIVELY (`taxWeekTotal`, `taxPriorWeekTotal`, `netWeekTotal`) so
//   the analyst keeps the VAT lens under an explicitly-labeled ribbon —
//   no surface ever again ships two numbers under one name.
//   v2.187.0 (the lens deepens): the drill-down modal grows an explicit
//   Gross/Net lens toggle backed by `netSpark` (the per-day net-of-VAT
//   buckets, from the SAME rows the gross spark already reads — sparkRows
//   has selected `taxAmount` since v2.185.0, so this is ZERO extra
//   queries), plus `netTodayTotal` and `netPriorWeekTotal` so every cell
//   of the modal's stat grid can follow the lens. `spark` stays the gross
//   till face — the headline contract is untouched.
//
// HEALTH MODEL (adapted from the sandbox lineage, demo target removed):
//   revenue  0-100  this week vs PRIOR week (capped; prior=0 and sales -> 100)
//   stock    0-100  100 - 100 x lowStock/totalSkus
//   debt     0-100  0 when exposure > 400k, else 100 - debt/4000
//   engage   0-100  chat messages x2 + debt reminders (cap 100)
//   score    100 - debtPenalty(debt>400k: 10) - engagementPenalty(<20: 3)
//                - stockPenalty(lowStock>0: 2)
//
// AUTHORIZATION: SUPER_ADMIN, STORE_OWNER, BRANCH_MANAGER (per the v2.18.3
// reconciliation spec). ACCOUNTANT keeps /api/org/summary for the per-store
// matrix; org-wide revenue KPIs follow the org/summary precedent of keeping
// branch-only roles out. No customer PII beyond debtor names/branches, which
// these roles already see in their own store debt views.

import { rawDb, runWithoutTenant } from '@/lib/db';
import { requireAuth, type AuthSession } from '@/lib/auth';
import { withErrorBoundary } from '@/lib/logger';
import { LogComponent } from '@/lib/types';
import { hasFeaturePermission } from '@/lib/permissions';
import { toDec, round2 } from '@/lib/utils/financialMath';

export const dynamic = 'force-dynamic';

const ORG_ROLES = ['SUPER_ADMIN', 'STORE_OWNER', 'BRANCH_MANAGER'];

const DAY_MS = 86_400_000;

/** Mask a phone number for display (keep first 3 + last 3). */
function maskPhone(phone: string | null | undefined): string | null {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 7) return '***';
  return `${digits.slice(0, 3)}***${digits.slice(-3)}`;
}

async function orgKpiSummaryHandler(_request: unknown, session: AuthSession): Promise<Response> {
  // v2.58.0: the org console aggregates ALL stores by contract — every read
// below is org-wide (per-store loops / cross-store groupBys) guarded to
// ORG_ROLES. The reads go through rawDb (the un-intercepted client) so the
// v2.57.0 leak class (a runWithoutTenant bypass silently ignored inside a
// Next.js request, AND-narrowing the query to the browsing store) can never
// shrink an org total to one branch's numbers for a store-scoped viewer.
// Read-only route: rawDb's missing immutability guard is irrelevant here.

  return runWithoutTenant(async () => {
    const now = new Date();
    const startToday = new Date(now);
    startToday.setHours(0, 0, 0, 0);
    const weekAgo = new Date(startToday.getTime() - 6 * DAY_MS);
    const twoWeeksAgo = new Date(startToday.getTime() - 13 * DAY_MS);

    const SALE_WHERE = {
      transactionType: 'SALE',
      paymentStatus: { in: ['COMPLETED', 'PARTIAL'] },
    };

    // ── Revenue: today, 7d, prior 7d + per-day sparkline ────────────────────
    const [todayAgg, weekAgg, priorAgg, sparkRows] = await Promise.all([
      rawDb.salesTransaction.aggregate({
        where: { ...SALE_WHERE, createdAt: { gte: startToday } },
        _sum: { totalAmount: true, taxAmount: true },
        _count: { _all: true },
      }),
      rawDb.salesTransaction.aggregate({
        where: { ...SALE_WHERE, createdAt: { gte: weekAgo } },
        _sum: { totalAmount: true, taxAmount: true },
        _count: { _all: true },
      }),
      rawDb.salesTransaction.aggregate({
        where: { ...SALE_WHERE, createdAt: { gte: twoWeeksAgo, lt: weekAgo } },
        _sum: { totalAmount: true, taxAmount: true },
        _count: { _all: true },
      }),
      rawDb.salesTransaction.findMany({
        where: { ...SALE_WHERE, createdAt: { gte: weekAgo } },
        select: { createdAt: true, totalAmount: true, taxAmount: true },
      }),
    ]);

    // v2.185.0: GROSS by contract — `totalAmount` as-is, the SAME number
    // /api/org/summary puts under "Revenue today". The tax sums stay in the
    // aggregates so the additive VAT block below keeps its lens.
    const grossOf = (sums: { totalAmount: Parameters<typeof toDec>[0] }) =>
      toDec(sums.totalAmount);
    const revToday = round2(grossOf(todayAgg._sum));
    const revWeek = round2(grossOf(weekAgg._sum));
    const revPrior = round2(grossOf(priorAgg._sum));
    // The VAT lens — additive, labeled, never mixed into the headline.
    const taxWeek = round2(toDec(weekAgg._sum.taxAmount));
    const taxPrior = round2(toDec(priorAgg._sum.taxAmount));
    const netWeek = round2(revWeek - taxWeek);
    // v2.187.0: the remaining net windows — today and prior week — so the
    // modal's whole stat grid can follow the lens. Plain number subtraction
    // (the gross path's Decimal-minus pin stays; toDec(null) -> 0 guards an
    // aggregate without tax). Additive fields under NEW names: nothing that
    // reads `today`/`priorWeekTotal` re-keys.
    const netToday = round2(toDec(todayAgg._sum.totalAmount).toNumber() - toDec(todayAgg._sum.taxAmount).toNumber());
    const netPrior = round2(toDec(priorAgg._sum.totalAmount).toNumber() - toDec(priorAgg._sum.taxAmount).toNumber());
    const txToday = todayAgg._count._all;
    const txWeek = weekAgg._count._all;
    const txPrior = priorAgg._count._all;
    const revenueVariancePct = revPrior > 0 ? round2(((revWeek - revPrior) / revPrior) * 100) : 0;
    const txVariancePct = txPrior > 0 ? round2(((txWeek - txPrior) / txPrior) * 100) : 0;

    // 7-day gross-revenue sparkline (oldest -> newest) — the same till face
    // as the headline, per the v2.185.0 reconciliation. v2.187.0: the SAME
    // rows also fill the NET buckets (gross − tax per day) so the modal's
    // lens toggle never costs a second query — two faces of one read,
    // computed in one pass. v2.194.0: the THIRD face joins the pass — the
    // VAT buckets (tax per day) bucket the SAME rows' taxAmount, so the
    // modal's VAT strip can wear its own spark with ZERO additional reads
    // (three faces of one read, one pass, no second query). v2.195.0: the
    // FOURTH face — the settled rows are COUNTED one each into their own
    // buckets, so the transactions card and its new drill-down modal speak
    // the same read the money speaks (four faces of one read, still one
    // pass, still no second query).
    const sparkBuckets = new Array<number>(7).fill(0);
    const netBuckets = new Array<number>(7).fill(0);
    const taxBuckets = new Array<number>(7).fill(0);
    const txBuckets = new Array<number>(7).fill(0);
    for (let i = 0; i < 7; i++) {
      const dayStart = new Date(startToday.getTime() - (6 - i) * DAY_MS);
      const dayEnd = new Date(dayStart.getTime() + DAY_MS);
      for (const row of sparkRows) {
        if (row.createdAt >= dayStart && row.createdAt < dayEnd) {
          sparkBuckets[i] += toDec(row.totalAmount).toNumber();
          netBuckets[i] += toDec(row.totalAmount).toNumber() - toDec(row.taxAmount).toNumber();
          taxBuckets[i] += toDec(row.taxAmount).toNumber();
          txBuckets[i] += 1;
        }
      }
    }
    const spark = sparkBuckets.map((v) => round2(v));
    const netSpark = netBuckets.map((v) => round2(v));
    const taxSpark = taxBuckets.map((v) => round2(v));
    // Counts are integers by construction — the map keeps the faces' shared
    // shape (and forgives a pathological fractional row) without pretending
    // a checkout can arrive in halves.
    const txSpark = txBuckets.map((v) => Math.round(v));

    // ── Debt: org-wide outstanding + aging buckets (precomputed column) ─────
    const debtGrouped = await rawDb.debtLedger.groupBy({
      by: ['agingBucket'],
      where: { status: { in: ['OUTSTANDING', 'PARTIAL', 'OVERDUE'] }, balance: { gt: 0 } },
      _sum: { balance: true },
      _count: { _all: true },
    });
    const bucketSum = (key: string) =>
      round2(toDec(debtGrouped.find((g) => g.agingBucket === key)?._sum.balance ?? 0));
    const debtCurrent = bucketSum('CURRENT');
    const debtD30 = bucketSum('DAYS_30');
    const debtD60 = bucketSum('DAYS_60');
    const debtD90 = bucketSum('DAYS_90_PLUS');
    const debtTotal = round2(debtCurrent + debtD30 + debtD60 + debtD90);
    const debtCount = debtGrouped.reduce((acc, g) => acc + g._count._all, 0);

    // Top debtors (aggregate + name only - these org roles already see debt
    // lists in their own stores; no phone/email is shipped).
    const topDebts = await rawDb.debtLedger.findMany({
      where: { status: { in: ['OUTSTANDING', 'PARTIAL', 'OVERDUE'] }, balance: { gt: 0 } },
      orderBy: { balance: 'desc' },
      take: 10,
      select: {
        id: true,
        balance: true,
        agingBucket: true,
        status: true,
        customer: { select: { name: true } },
        store: { select: { name: true, code: true } },
      },
    });

    const [activePlans, sentReminders] = await Promise.all([
      rawDb.debtPaymentPlan.count({ where: { status: { not: 'COMPLETED' } } }),
      rawDb.debtReminder.count({ where: { status: { in: ['SENT', 'DELIVERED'] } } }),
    ]);

    // ── Inventory: org-wide stock health ────────────────────────────────────
    const products = await rawDb.product.findMany({
      where: { isActive: true },
      select: {
        id: true, name: true, sku: true, quantityInStock: true, reorderLevel: true,
        costPrice: true, pricePerUnit: true,
        category: { select: { name: true } },
        store: { select: { id: true, name: true, code: true } },
      },
    });
    const totalSkus = products.length;
    const lowItems = products.filter((p) => toDec(p.quantityInStock).lte(toDec(p.reorderLevel)));
    const lowStock = lowItems.length;
    const stockValue = round2(products.reduce((acc, p) => acc.plus(toDec(p.quantityInStock).mul(toDec(p.costPrice))), toDec(0)));
    const retailValue = round2(products.reduce((acc, p) => acc.plus(toDec(p.quantityInStock).mul(toDec(p.pricePerUnit))), toDec(0)));
    const lowStockItems = lowItems
      .slice()
      .sort((a, b) => toDec(a.quantityInStock).minus(toDec(a.reorderLevel)).toNumber() - toDec(b.quantityInStock).minus(toDec(b.reorderLevel)).toNumber())
      .slice(0, 12)
      .map((p) => ({
        id: p.id,
        sku: p.sku,
        name: p.name,
        category: p.category?.name ?? 'Uncategorized',
        store: p.store?.name ?? null,
        stockQty: toDec(p.quantityInStock).toNumber(),
        reorderLevel: toDec(p.reorderLevel).toNumber(),
        // v2.217.0 THE REORDER BRIDGE: the named watchlist now carries
        // everything a draft PO needs, so the bridge composes and never
        // invents. `storeId` is the POST target (the org watchlist is
        // org-wide; a purchase order belongs to ONE store); `costPrice`
        // is the product's own fallback cost. `suggestedQty` reuses the
        // store-level low-stock API's formula (ceil(1.5 × RL − stock)) so
        // the two surfaces speak one reorder arithmetic; a product with
        // no reorder level (RL 0) suggests nothing — the honest zero.
        storeId: p.store?.id ?? null,
        costPrice: toDec(p.costPrice).toNumber(),
        suggestedQty: Math.max(0, Math.ceil(toDec(p.reorderLevel).mul(1.5).minus(toDec(p.quantityInStock)).toNumber())),
        // The supplier-hint fields, pre-declared nullable so the PO-line
        // reduction below can fill them in place (tsc keeps the literal's
        // shape — no assignment-to-unknown-key errors).
        lastUnitCost: null as number | null,
        lastSupplierId: null as string | null,
        lastSupplierName: null as string | null,
        // v2.224.0 THE SPOKEN HINT: the hint names its SOURCE — which PO
        // spoke, and when. The hint-law (the latest PO of ANY status by
        // orderDate) had a known failure shape (the v2.221 flattening);
        // a hint that shows its receipt is legible BEFORE it bites.
        lastSupplierPoNumber: null as string | null,
        lastSupplierAt: null as string | null,
      }));

    // v2.217.0: the supplier hint — each named item's most recent purchase
    // order line names the supplier that last carried it (and the cost that
    // was actually paid, which beats the product's book costPrice as a PO
    // draft default). ONE bounded read over the ≤12 named items' PO lines,
    // newest PO first, reduced to the first hit per product in JS — the
    // bridge composes existing rows, it never invents a supplier.
    const lowIds = lowStockItems.map((item) => item.id);
    const lastPoLines = lowIds.length
      ? await rawDb.purchaseOrderItem.findMany({
          where: { productId: { in: lowIds } },
          orderBy: { purchaseOrder: { orderDate: 'desc' } },
          take: 60,
          select: {
            productId: true,
            unitCost: true,
            purchaseOrder: { select: { supplierId: true, poNumber: true, orderDate: true, supplier: { select: { name: true } } } },
          },
        })
      : [];
    const seenLowIds = new Set<string>();
    for (const line of lastPoLines) {
      if (seenLowIds.has(line.productId)) continue;
      seenLowIds.add(line.productId);
      const item = lowStockItems.find((entry) => entry.id === line.productId);
      if (!item) continue;
      item.lastUnitCost = toDec(line.unitCost).toNumber();
      item.lastSupplierId = line.purchaseOrder?.supplierId ?? null;
      item.lastSupplierName = line.purchaseOrder?.supplier?.name ?? null;
      // v2.224.0: the receipt — the PO that spoke, and the day it spoke.
      item.lastSupplierPoNumber = line.purchaseOrder?.poNumber ?? null;
      item.lastSupplierAt = line.purchaseOrder?.orderDate
        ? line.purchaseOrder.orderDate.toISOString()
        : null;
    }
    for (const item of lowStockItems) {
      if (item.lastUnitCost == null) item.lastUnitCost = item.costPrice;
    }

    // ── Rentals ─────────────────────────────────────────────────────────────
    const [rentalsActive, rentalsOverdue, rentalRows] = await Promise.all([
      rawDb.equipmentRental.count({ where: { status: 'ACTIVE' } }),
      rawDb.equipmentRental.count({ where: { status: 'OVERDUE' } }),
      rawDb.equipmentRental.findMany({
        where: { status: { in: ['ACTIVE', 'OVERDUE'] } },
        orderBy: { expectedReturnDate: 'asc' },
        take: 8,
        select: {
          id: true, status: true, rentalStartDate: true, expectedReturnDate: true,
          ratePerDay: true, securityDeposit: true,
          product: { select: { name: true } },
          customer: { select: { name: true } },
          store: { select: { name: true, code: true } },
        },
      }),
    ]);

    // ── Suppliers / purchase orders (delivery signals from real rows) ───────
    const [supplierCount, poRows] = await Promise.all([
      rawDb.supplier.count({ where: { isActive: true } }),
      rawDb.purchaseOrder.findMany({
        where: { status: { in: ['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'SENT', 'CONFIRMED', 'PARTIALLY_RECEIVED'] } },
        select: {
          id: true, status: true, expectedDate: true, totalAmount: true,
          supplier: { select: { name: true } },
          store: { select: { name: true, code: true } },
        },
        orderBy: { orderDate: 'desc' },
        take: 200,
      }),
    ]);
    const openPOs = poRows.length;
    const overduePOs = poRows.filter((p) => p.expectedDate && p.expectedDate < now).length;

    // ── v2.220.0: the variance map — the org's count sheets ─────────────────
    // The stocktake's org face (phase 2 of the arc): the branch sheets the
    // floor already speaks, composed org-wide. THE COST LAW rides here too:
    // variance UNITS are units (every org role hears them), but the ledger's
    // SHILLINGS speak only past `inventory.view.cost` — the same gate the
    // sheet detail and close routes apply; without it the fields arrive null
    // and the face renders the honest absence, never a hidden zero. The
    // window figure is the org's rolling-30-day ledger impact across every
    // closed sheet (not just the named roster) — the money-voiced figure the
    // variance map's indicative strip annotates.
    const canViewCost = hasFeaturePermission(session.role, 'inventory.view.cost');
    const [openSheetRows, recentSheetRows] = await Promise.all([
      rawDb.stockTake.findMany({
        where: { status: 'COUNTING' },
        orderBy: { startedAt: 'desc' },
        select: {
          id: true, startedAt: true, notes: true,
          // v2.240.0 THE ROSTER’S BIRTH: the sheet's origin rides the
          // live rows (one column the row already holds — zero new
          // reads; the allowlist law means 'walk-door' or nothing).
          origin: true,
          startedBy: { select: { name: true } },
          store: { select: { id: true, name: true, code: true } },
          _count: { select: { lines: true } },
        },
      }),
      rawDb.stockTake.findMany({
        orderBy: { startedAt: 'desc' },
        take: 12,
        select: {
          id: true, status: true, notes: true, startedAt: true, closedAt: true,
          // v2.240.0 THE ROSTER’S BIRTH: the same column on the named
          // roster — the birth speaks on every row the map renders.
          origin: true,
          startedBy: { select: { name: true } },
          closedBy: { select: { name: true } },
          store: { select: { id: true, name: true, code: true } },
          _count: { select: { lines: true } },
        },
      }),
    ]);
    // Counted progress per sheet — ONE grouped read over the union of the
    // live sheets and the named roster (the same reduce-in-JS shape the
    // store-level list route speaks).
    const sheetIds = [...new Set([...openSheetRows.map((s) => s.id), ...recentSheetRows.map((s) => s.id)])];
    const countedGroups = sheetIds.length
      ? await rawDb.stockTakeLine.groupBy({
          by: ['stockTakeId'],
          where: { stockTakeId: { in: sheetIds }, countedQty: { not: null } },
          _count: { _all: true },
        })
      : [];
    const countedBySheet = new Map(countedGroups.map((g) => [g.stockTakeId, g._count._all]));
    // Per-sheet variance for the roster's CLOSED rows — ONE grouped read
    // (units always; the cost sum rides the same group and is gated below).
    const closedRosterIds = recentSheetRows.filter((s) => s.status === 'CLOSED').map((s) => s.id);
    const rosterVarianceGroups = closedRosterIds.length
      ? await rawDb.stockTakeLine.groupBy({
          by: ['stockTakeId'],
          where: { stockTakeId: { in: closedRosterIds }, variance: { not: null } },
          _sum: { variance: true, varianceCost: true },
        })
      : [];
    const varianceBySheet = new Map(rosterVarianceGroups.map((g) => [
      g.stockTakeId,
      { units: toDec(g._sum.variance ?? 0).toNumber(), cost: round2(toDec(g._sum.varianceCost ?? 0).toNumber()) },
    ]));
    // The org's rolling-30-day ledger impact — EVERY closed sheet in the
    // window, not just the roster the UI names (the strip's figure stays
    // the whole truth; the roster is a window, and the cap note says so).
    const windowStart = new Date(now.getTime() - 30 * DAY_MS);
    // v2.235.0: the same read grows `closedAt` — the cadence face needs
    // the sheet's own date to speak "days since last heard" (one read,
    // two consumers; zero new queries for the map's headline).
    const closed30dRows = await rawDb.stockTake.findMany({
      where: { status: 'CLOSED', closedAt: { gte: windowStart } },
      select: { id: true, closedAt: true },
    });
    const closed30dIds = closed30dRows.map((s) => s.id);
    // v2.238.0 THE DOOR'S CENSUS — how many of the window's sheets were
    // BORN at a walk door (origin='walk-door', the one allowlisted value
    // the create wire stores). Births, not closes: a counting door-born
    // sheet is still a walk answered. One bounded count; the field rides
    // the block additively — an older cached answer renders the silent
    // absence (the face checks the type, never assumes).
    const doorBorn30d = await rawDb.stockTake.count({
      where: { origin: 'walk-door', startedAt: { gte: windowStart } },
    });
    // v2.239.0 THE YARD'S ANSWER — the census learns to speak PER BRANCH:
    // which yards answer their doors. One grouped read over the SAME
    // window births the headline count already speaks (the same
    // where-shape, births not closes), one row per store the census
    // heard (stores are five, never thousands — bounded by the catalog,
    // not the ledger). Additive + always present alongside doorBorn30d;
    // an older cached answer renders the silent absence (the face
    // checks the field, never assumes). A store ABSENT from the array
    // answered nothing — the breakdown's silence is the honest zero,
    // never a drawn one.
    const doorBornByStoreGroups = await rawDb.stockTake.groupBy({
      by: ['storeId'],
      where: { origin: 'walk-door', startedAt: { gte: windowStart } },
      _count: { _all: true },
    });
    const doorBornByStore = doorBornByStoreGroups.map((g) => ({
      storeId: g.storeId,
      doorBorn: g._count._all,
    }));
    const windowAgg = closed30dIds.length
      ? await rawDb.stockTakeLine.aggregate({
          where: { stockTakeId: { in: closed30dIds }, variance: { not: null } },
          _sum: { variance: true, varianceCost: true },
        })
      : null;
    const windowUnits = round2(toDec(windowAgg?._sum.variance ?? 0).toNumber());
    const windowCost = round2(toDec(windowAgg?._sum.varianceCost ?? 0).toNumber());

    // ── v2.235.0: the cadence — WHEN each shelf was last heard ──────────
    // The map has said WHAT walked since v2.220.0; the cadence says WHEN:
    // per branch category, the days since a CLOSED sheet last touched it.
    // THE WINDOW LAW: the read rides the SAME closed-30d sheets the
    // headline figures speak (their ids are already in hand — zero new
    // sheet queries), so every voice on the face is the window's own
    // truth and the cap note holds. THE CATEGORY LAW: a line reaches its
    // category through its product (lines carry no categoryId of their
    // own), so the composition is three bounded grouped reads — the
    // window's line pairs (bounded by the window's own sheets), the
    // heard-ever product set (one groupBy over closed sheets, one row
    // per distinct counted product), and the active catalog categories
    // (tens, never thousands). THE FOUR VOICES: fresh (heard ≤ 7 days),
    // stale (heard in the window, colder than 7), beyond (counted
    // before, but not inside this window), never (no closed line has
    // EVER touched it — the honest blind spot, never dressed as a date).
    // A category with zero products speaks `productCount: 0` and still
    // gets its row — an empty shelf is a real shelf, and the face says
    // so instead of hiding it.
    const CADENCE_FRESH_DAYS = 7;
    type CadenceBand = 'fresh' | 'stale' | 'beyond' | 'never';
    const [cadenceCategoryRows, cadenceWindowPairs] = await Promise.all([
      rawDb.productCategory.findMany({
        where: { isActive: true },
        select: {
          id: true, name: true, storeId: true,
          store: { select: { name: true, code: true } },
        },
        orderBy: [{ name: 'asc' }],
      }),
      closed30dIds.length
        ? rawDb.stockTakeLine.findMany({
            where: { stockTakeId: { in: closed30dIds } },
            select: { stockTakeId: true, productId: true },
          })
        : Promise.resolve([] as Array<{ stockTakeId: string; productId: string }>),
    ]);
    const cadenceCategoryIds = cadenceCategoryRows.map((c) => c.id);
    const [heardEverGroups, productCountGroups] = await Promise.all([
      cadenceCategoryIds.length
        ? rawDb.stockTakeLine.groupBy({
            by: ['productId'],
            where: {
              stockTake: { status: 'CLOSED' },
              product: { categoryId: { in: cadenceCategoryIds } },
            },
          })
        : Promise.resolve([] as Array<{ productId: string }>),
      cadenceCategoryIds.length
        ? rawDb.product.groupBy({
            by: ['categoryId'],
            where: { categoryId: { in: cadenceCategoryIds }, isActive: true },
            _count: { _all: true },
          })
        : Promise.resolve([] as Array<{ categoryId: string | null; _count: { _all: number } }>),
    ]);
    const heardEverProductIds = heardEverGroups.map((g) => g.productId);
    const cadenceProductRows = heardEverProductIds.length
      ? await rawDb.product.findMany({
          where: { id: { in: heardEverProductIds } },
          select: { id: true, categoryId: true },
        })
      : [];
    const categoryOfProduct = new Map(cadenceProductRows.map((p) => [p.id, p.categoryId]));
    const productCountByCategory = new Map(
      productCountGroups
        .filter((g): g is typeof g & { categoryId: string } => g.categoryId != null)
        .map((g) => [g.categoryId, g._count._all]),
    );
    const closedAtById = new Map(closed30dRows.map((s) => [s.id, s.closedAt]));
    // Per category: the window sheets whose LINES touched it (through the
    // product→category map — the only bridge a line has to its shelf).
    const heardSheetsByCategory = new Map<string, Set<string>>();
    for (const pair of cadenceWindowPairs) {
      const categoryId = categoryOfProduct.get(pair.productId);
      if (!categoryId) continue;
      const set = heardSheetsByCategory.get(categoryId);
      if (set) set.add(pair.stockTakeId);
      else heardSheetsByCategory.set(categoryId, new Set([pair.stockTakeId]));
    }
    const heardEverByCategory = new Set<string>();
    for (const productId of heardEverProductIds) {
      const categoryId = categoryOfProduct.get(productId);
      if (categoryId) heardEverByCategory.add(categoryId);
    }
    const cadenceCategories: Array<{
      categoryId: string; name: string; storeId: string;
      storeName: string; storeCode: string | null;
      productCount: number; lastCountedAt: string | null;
      daysSince: number | null; band: CadenceBand;
    }> = cadenceCategoryRows.map((c) => {
      const heardSheetIds = heardSheetsByCategory.get(c.id);
      let lastCountedAt: Date | null = null;
      if (heardSheetIds) {
        for (const sheetId of heardSheetIds) {
          const at = closedAtById.get(sheetId);
          if (at && (!lastCountedAt || at > lastCountedAt)) lastCountedAt = at;
        }
      }
      const daysSince = lastCountedAt
        ? Math.max(0, Math.floor((now.getTime() - lastCountedAt.getTime()) / DAY_MS))
        : null;
      const band: CadenceBand = lastCountedAt
        ? (daysSince ?? 0) <= CADENCE_FRESH_DAYS ? 'fresh' : 'stale'
        : heardEverByCategory.has(c.id) ? 'beyond' : 'never';
      return {
        categoryId: c.id,
        name: c.name,
        storeId: c.storeId,
        storeName: c.store.name,
        storeCode: c.store.code,
        productCount: productCountByCategory.get(c.id) ?? 0,
        lastCountedAt: lastCountedAt ? lastCountedAt.toISOString() : null,
        daysSince,
        band,
      };
    });
    // THE WALK ORDER — the face reads as the floor's to-do list: the
    // blind spots first (never, heaviest shelf first), then the coldest
    // heard shelves (beyond), then the stale window shelves (most
    // neglected first), then the fresh (least fresh first).
    const CADENCE_WALK_ORDER: Record<CadenceBand, number> = { never: 0, beyond: 1, stale: 2, fresh: 3 };
    cadenceCategories.sort((a, b) => {
      if (a.band !== b.band) return CADENCE_WALK_ORDER[a.band] - CADENCE_WALK_ORDER[b.band];
      if (a.band === 'never' || a.band === 'beyond') return b.productCount - a.productCount;
      return (b.daysSince ?? 0) - (a.daysSince ?? 0);
    });
    const cadence = {
      generatedAt: now.toISOString(),
      windowDays: 30,
      freshDays: CADENCE_FRESH_DAYS,
      counts: {
        fresh: cadenceCategories.filter((c) => c.band === 'fresh').length,
        stale: cadenceCategories.filter((c) => c.band === 'stale').length,
        beyond: cadenceCategories.filter((c) => c.band === 'beyond').length,
        never: cadenceCategories.filter((c) => c.band === 'never').length,
        total: cadenceCategories.length,
      },
      categories: cadenceCategories,
    };
    const stockTakes = {
      openCount: openSheetRows.length,
      openSheets: openSheetRows.map((s) => ({
        id: s.id,
        storeId: s.store.id,
        storeName: s.store.name,
        storeCode: s.store.code,
        notes: s.notes,
        // v2.240.0 the roster’s birth: additive (the silence when null).
        origin: s.origin,
        startedAt: s.startedAt.toISOString(),
        startedByName: s.startedBy?.name ?? null,
        lineCount: s._count.lines,
        countedCount: countedBySheet.get(s.id) ?? 0,
      })),
      recentSheets: recentSheetRows.map((s) => {
        const v = varianceBySheet.get(s.id) ?? null;
        return {
          id: s.id,
          status: s.status,
          notes: s.notes,
          // v2.240.0 the roster’s birth: additive (the silence when null).
          origin: s.origin,
          startedAt: s.startedAt.toISOString(),
          closedAt: s.closedAt?.toISOString() ?? null,
          startedByName: s.startedBy?.name ?? null,
          closedByName: s.closedBy?.name ?? null,
          storeId: s.store.id,
          storeName: s.store.name,
          storeCode: s.store.code,
          lineCount: s._count.lines,
          countedCount: countedBySheet.get(s.id) ?? 0,
          varianceUnits: s.status === 'CLOSED' && v ? Math.round(v.units * 100) / 100 : null,
          // The cost law: the shillings speak only past the gate.
          varianceCost: canViewCost && s.status === 'CLOSED' && v ? v.cost : null,
        };
      }),
      window30d: {
        closedCount: closed30dIds.length,
        varianceUnits: windowUnits,
        varianceCostTotal: canViewCost ? windowCost : null,
      },
      // v2.238.0 the door's census: additive + always present (births in
      // the window whose origin the create wire allowed).
      doorBorn30d,
      // v2.239.0 the yard's answer: additive + always present — the same
      // census per branch. A store absent from the array answered
      // nothing; the face renders the silence as the honest zero.
      doorBornByStore,
      // v2.235.0 the cadence: additive + always present (the block reads
      // the catalog, not the caller's gate — every org role hears WHEN a
      // shelf was last heard; no cost field crosses this wire).
      cadence,
    };

    // ── M-Pesa (STK push ledger, phones masked) ─────────────────────────────
    const mpesaRows = await rawDb.mpesaTransaction.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: {
        id: true, status: true, phoneNumber: true, amount: true,
        mpesaReceiptNumber: true, resultDesc: true, createdAt: true, checkoutRequestId: true,
      },
    });
    const mpesaPending = mpesaRows.filter((m) => m.status === 'PENDING' || m.status === 'PROCESSING').length;
    const mpesaStale = mpesaRows.filter(
      (m) => (m.status === 'PENDING' || m.status === 'PROCESSING') && now.getTime() - new Date(m.createdAt).getTime() > 10 * 60_000,
    ).length;
    const mpesaCompleted = mpesaRows.filter((m) => m.status === 'COMPLETED').length;
    const mpesaFailed = mpesaRows.filter((m) => m.status === 'FAILED' || m.status === 'CANCELLED').length;

    // ── eTIMS (KRA transmission state off SalesTransaction) ─────────────────
    const etimsGrouped = await rawDb.salesTransaction.groupBy({
      by: ['etimsStatus'],
      where: { transactionType: 'SALE', etimsStatus: { not: null } },
      _count: { _all: true },
    });
    const etimsPending = etimsGrouped.find((g) => g.etimsStatus === 'PENDING')?._count._all ?? 0;
    const etimsIssued = etimsGrouped.find((g) => g.etimsStatus === 'ISSUED')?._count._all ?? 0;

    // ── Action queue (real pending states in the main-lineage models) ───────
    const [pendingPOs, openShifts, pendingExpenses] = await Promise.all([
      rawDb.purchaseOrder.count({ where: { status: { in: ['DRAFT', 'PENDING_APPROVAL'] } } }),
      rawDb.shift.count({ where: { status: 'ACTIVE' } }),
      // Main's Expense model has ACTIVE/VOIDED only (no PENDING approval
      // state) - the count stays DB-derived (0 in this release).
      rawDb.expense.count({ where: { status: 'PENDING' } }),
    ]);

    // ── Engagement + system counters ────────────────────────────────────────
    const [chatCount, storeCount, activeUsers, unreadNotifications] = await Promise.all([
      rawDb.conversationMessage.count(),
      rawDb.store.count({ where: { status: { not: 'ARCHIVED' } } }),
      rawDb.user.count({ where: { isActive: true } }),
      rawDb.notification.count({ where: { isRead: false } }),
    ]);

    // ── Activity (org-wide AuditLog with user join) ─────────────────────────
    const auditRows = await rawDb.auditLog.findMany({
      orderBy: { timestamp: 'desc' },
      take: 10,
      include: { user: { select: { name: true, role: true } } },
    });
    const activity = auditRows.map((a) => ({
      id: a.id,
      action: a.action,
      entity: a.entityType,
      userName: a.user?.name ?? 'System',
      role: a.user?.role ?? 'SYSTEM',
      displayMessage: `${a.action} on ${a.entityType}`,
      createdAt: a.timestamp.toISOString(),
    }));

    // ── Health model (documented at the top of this file) ───────────────────
    const stockScore = totalSkus > 0 ? Math.round(100 - (100 * lowStock) / totalSkus) : 100;
    const debtScore = debtTotal > 400_000 ? 0 : Math.max(0, Math.round(100 - debtTotal / 4_000));
    const priorWeekBase = revPrior > 0 ? revPrior : revWeek > 0 ? revWeek : 1;
    const revenueScore = Math.min(100, Math.round((revWeek / priorWeekBase) * 100));
    const engagementScore = Math.min(100, chatCount * 2 + sentReminders);
    const healthScore = Math.max(
      0,
      Math.min(100, 100 - (debtTotal > 400_000 ? 10 : 0) - (engagementScore < 20 ? 3 : 0) - (lowStock > 0 ? 2 : 0)),
    );
    const health = {
      score: healthScore,
      label: healthScore >= 80 ? 'Good' : healthScore >= 60 ? 'Fair' : 'At Risk',
      breakdown: [
        { key: 'revenue', label: 'Revenue', score: revenueScore, detail: `7d gross KES ${revWeek.toLocaleString('en-KE')} vs prior ${revPrior.toLocaleString('en-KE')}` },
        { key: 'stock', label: 'Stock', score: stockScore, detail: `${lowStock} low of ${totalSkus} SKUs` },
        { key: 'debt', label: 'Debt', score: debtScore, detail: `Outstanding KES ${debtTotal.toLocaleString('en-KE')}` },
        { key: 'engagement', label: 'Engagement', score: engagementScore, detail: `${chatCount} chat messages, ${sentReminders} reminders` },
      ],
    };

    // ── Decision-support alerts (derived from the same real rows) ───────────
    const fmtKes = (v: number) => `KES ${Math.round(v).toLocaleString('en-KE')}`;
    const alerts: Array<{ type: string; severity: string; title: string; detail: string; actions: string[] }> = [];
    if (lowStock > 0) alerts.push({ type: 'stock_low', severity: 'warning', title: 'Low stock blocks checkout', detail: `${lowStock} product${lowStock > 1 ? 's' : ''} at/below reorder level`, actions: ['Reorder', 'Adjust stock'] });
    if (rentalsOverdue > 0) alerts.push({ type: 'rental_overdue', severity: 'critical', title: 'Overdue rental on the yard', detail: `${rentalsOverdue} rental${rentalsOverdue > 1 ? 's' : ''} past expected return`, actions: ['Contact customer', 'Record return'] });
    if (debtTotal > 400_000) alerts.push({ type: 'debt_large', severity: 'critical', title: 'Debt above KES 400,000', detail: `Outstanding ${fmtKes(debtTotal)} with 90+ bucket ${fmtKes(debtD90)}`, actions: ['Send reminders', 'Review limits'] });
    if (mpesaStale > 0) alerts.push({ type: 'mpesa_mismatch', severity: 'warning', title: 'M-Pesa mismatch', detail: `${mpesaStale} STK push${mpesaStale > 1 ? 'es' : ''} pending more than 10 minutes`, actions: ['Retry query', 'Mark reconciled'] });
    if (etimsPending > 0) alerts.push({ type: 'etims_pending', severity: 'warning', title: 'eTIMS submissions pending', detail: `${etimsPending} transaction${etimsPending > 1 ? 's' : ''} awaiting KRA transmission`, actions: ['Retry upload', 'View queue'] });
    if (overduePOs > 0) alerts.push({ type: 'supplier_delay', severity: 'info', title: 'Supplier delivery overdue', detail: `${overduePOs} purchase order${overduePOs > 1 ? 's' : ''} past their expected date`, actions: ['Review POs', 'Contact supplier'] });

    return Response.json({
      success: true,
      data: {
        generatedAt: now.toISOString(),
        kpis: {
          // v2.185.0: the headline numbers are GROSS; the tax/net lens rides
          // ADDITIVELY so an older client (and the health model) never has
          // to care it arrived.
          revenue: {
            today: revToday,
            weekTotal: revWeek,
            priorWeekTotal: revPrior,
            variancePct: revenueVariancePct,
            spark,
            taxWeekTotal: taxWeek,
            taxPriorWeekTotal: taxPrior,
            netWeekTotal: netWeek,
            // v2.187.0: the lens deepens — per-day net buckets + the missing
            // net windows, all additive under NEW names.
            netTodayTotal: netToday,
            netPriorWeekTotal: netPrior,
            netSpark,
            // v2.194.0: the VAT face's own spark — the SAME rows' tax
            // per day, bucketed in the SAME pass. Additive: an older
            // cached answer simply renders no spark, never a NaN.
            taxSpark,
          },
          // v2.195.0: the count face gains its own `spark` — the SAME rows
          // counted one each, additive under a NEW name (an older cached
          // answer simply renders no spark, never a NaN).
          transactions: { today: txToday, weekTotal: txWeek, priorWeekTotal: txPrior, variancePct: txVariancePct, spark: txSpark },
          lowStock: { count: lowStock },
          overdueRentals: { count: rentalsOverdue },
          debt: { total: debtTotal, count: debtCount, aging: { current: debtCurrent, d30: debtD30, d60: debtD60, d90plus: debtD90 } },
          pending: { purchaseOrders: pendingPOs, openShifts, expenses: pendingExpenses },
        },
        health,
        inventory: { totalSkus, stockValue, retailValue, lowStock, lowStockItems },
        debtExpert: {
          total: debtTotal,
          aging: { current: debtCurrent, d30: debtD30, d60: debtD60, d90plus: debtD90 },
          topDebtors: topDebts.map((d) => ({
            id: d.id,
            customer: d.customer?.name ?? 'Unknown',
            store: d.store?.name ?? null,
            outstanding: round2(toDec(d.balance)),
            bucket: d.agingBucket,
            status: d.status,
          })),
          activePlans,
          remindersSent: sentReminders,
        },
        rentals: {
          active: rentalsActive,
          overdue: rentalsOverdue,
          items: rentalRows.map((r) => ({
            id: r.id,
            item: r.product?.name ?? 'Rental item',
            store: r.store?.name ?? null,
            customer: r.customer?.name ?? 'Walk-in',
            ratePerDay: round2(toDec(r.ratePerDay)),
            deposit: round2(toDec(r.securityDeposit)),
            status: r.status,
            rentalStartDate: r.rentalStartDate.toISOString(),
            expectedReturnDate: r.expectedReturnDate.toISOString(),
          })),
        },
        suppliers: {
          count: supplierCount,
          openPOs,
          overduePOs,
          purchaseOrders: poRows.slice(0, 8).map((p) => ({
            id: p.id,
            supplier: p.supplier?.name ?? 'Unknown',
            store: p.store?.name ?? null,
            status: p.status,
            total: round2(toDec(p.totalAmount)),
            expectedDate: p.expectedDate ? p.expectedDate.toISOString() : null,
          })),
        },
        mpesa: {
          today: { pending: mpesaPending, stale: mpesaStale, completed: mpesaCompleted, failed: mpesaFailed },
          txns: mpesaRows.slice(0, 10).map((m) => ({
            id: m.id,
            checkoutRequestId: m.checkoutRequestId ? `${m.checkoutRequestId.slice(0, 14)}...` : null,
            phoneMasked: maskPhone(m.phoneNumber),
            amount: round2(toDec(m.amount)),
            status: m.status,
            mpesaReceipt: m.mpesaReceiptNumber,
            resultDesc: m.resultDesc,
            createdAt: m.createdAt.toISOString(),
          })),
        },
        etims: { pending: etimsPending, issued: etimsIssued },
        // v2.220.0: the variance map's block — the org's count sheets
        // (additive: an older cached answer simply renders the honest
        // step-aside, never a crash).
        stockTakes,
        system: {
          stores: storeCount,
          activeUsers,
          chatMessages: chatCount,
          notificationsUnread: unreadNotifications,
        },
        alerts,
        actionQueue: { pendingExpenses, pendingPOs, openShifts },
        activity,
      },
    });
  });
}

export const GET = withErrorBoundary(
  requireAuth(orgKpiSummaryHandler, { roles: ORG_ROLES }),
  LogComponent.API,
);
