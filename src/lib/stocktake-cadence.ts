// ── v2.237.0 THE WALK — the cadence's shared composition ────────────────
// v2.235.0 composed the cadence org-wide on the kpi wire; v2.236.0 gave
// the categories wire the store-scoped voice (the teeth). This lib is
// the composition's third home — the STORE-SCOPED shape two wires now
// share (the categories picker wire + both count-sheet detail wires),
// extracted verbatim so the law is spoken ONCE:
//
//   • THE STORE LAW: the reads ride the caller's own storeId — a branch
//     hears its own shelves.
//   • THE FOUR VOICES: fresh (heard ≤ CADENCE_FRESH_DAYS), stale (in the
//     window, colder), beyond (counted before, not inside this window),
//     never (no closed line has EVER touched it).
//   • THE CATEGORY LAW: a line reaches its category through its product
//     — the product→category map is the only bridge.
//   • THE COST LAW: no cost field crosses anything this file returns —
//     the cadence reads the catalog, not the caller's gate.
//
// THE WALK (this round's teeth): the walk rank orders a sheet's
// UNCOUNTED lines blind-spots-first — never, then beyond, then stale
// (most neglected first), then fresh — the floor's path through the
// shelf. It never reorders COUNTED lines (the worklist law stands:
// uncounted first, counted sink by name) and it never touches the
// response of any wire that does not ask.

import { db } from '@/lib/db';

export const CADENCE_FRESH_DAYS = 7;
export const CADENCE_WINDOW_DAYS = 30;
const CADENCE_DAY_MS = 86_400_000;

export type CadenceBand = 'fresh' | 'stale' | 'beyond' | 'never';

export type CategoryCadence = {
  band: CadenceBand;
  daysSince: number | null;
  lastCountedAt: string | null;
  freshDays: number;
  windowDays: number;
};

// THE WALK RANK — the org cadence's own walk order (never → beyond →
// stale → fresh), reused as the sort rank for a sheet's uncounted lines.
// An uncategorized line (no shelf voice) ranks after every banded line.
export const CADENCE_WALK_RANK: Record<CadenceBand, number> = { never: 0, beyond: 1, stale: 2, fresh: 3 };
export const CADENCE_WALK_UNCATEGORIZED_RANK = 99;

export async function cadenceByCategory(
  storeId: string,
  categoryIds: string[],
): Promise<Map<string, CategoryCadence>> {
  const out = new Map<string, CategoryCadence>();
  if (categoryIds.length === 0) return out;
  const now = new Date();
  const windowStart = new Date(now.getTime() - CADENCE_WINDOW_DAYS * CADENCE_DAY_MS);

  // Three bounded reads (the store-scoped composition, verbatim from the
  // teeth wire): (1) this store's closed sheets inside the window (ids +
  // closedAt), (2) their line pairs (bounded by the window's own
  // sheets), and (3) the heard-ever product set — one groupBy over the
  // store's CLOSED sheets through the category bridge.
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
          select: { stockTakeId: true, productId: true },
        })
      : Promise.resolve([] as Array<{ stockTakeId: string; productId: string }>),
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
      ? (daysSince ?? 0) <= CADENCE_FRESH_DAYS ? 'fresh' : 'stale'
      : heardEverByCategory.has(categoryId) ? 'beyond' : 'never';
    out.set(categoryId, {
      band,
      daysSince,
      lastCountedAt: lastCountedAt ? lastCountedAt.toISOString() : null,
      freshDays: CADENCE_FRESH_DAYS,
      windowDays: CADENCE_WINDOW_DAYS,
    });
  }
  return out;
}

// THE WALK COMPARE — a stable-sort comparator over a sheet's lines. The
// worklist law stands (uncounted before counted); WITHIN the uncounted
// pool the cadence walks blind spots first (never → beyond → stale →
// fresh by rank, most-neglected first by daysSince). Ties return 0 —
// the caller's base order (name asc) survives the stable sort, so the
// comparator never needs to know the alphabet.
export type WalkLine = {
  countedQty: number | null;
  band: CadenceBand | null;
  daysSince: number | null;
};

export function walkCompare(a: WalkLine, b: WalkLine): number {
  const aUncounted = a.countedQty == null;
  const bUncounted = b.countedQty == null;
  if (aUncounted !== bUncounted) return aUncounted ? -1 : 1;
  if (!aUncounted) return 0; // counted lines keep the caller's base order
  const rankA = a.band ? CADENCE_WALK_RANK[a.band] : CADENCE_WALK_UNCATEGORIZED_RANK;
  const rankB = b.band ? CADENCE_WALK_RANK[b.band] : CADENCE_WALK_UNCATEGORIZED_RANK;
  if (rankA !== rankB) return rankA - rankB;
  // Most neglected first: the bigger daysSince leads (null = the band
  // has no date voice — never/beyond — and stays behind dated siblings
  // of its own rank; a rank holds one date shape, so this is a no-op
  // inside never/beyond and the honest order inside stale/fresh).
  return (b.daysSince ?? -1) - (a.daysSince ?? -1);
}
