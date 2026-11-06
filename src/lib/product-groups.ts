// MBUMAH HARDWARE POS — product supplier grouping (v2.420.0 THE ARC'S
// FIRST WORD: the shelf remembers its supplier).
//
// ONE HOME for the supplier lens's arithmetic. The inventory desk's
// grouping strip, any future consumer (restock order blocks, supplier
// drill-downs, org rollups) and the tests all read THIS file — never a
// second copy of the arithmetic (the mirror law: one read, many faces).
//
// THE DECIMAL'S GRACE (v2.419.0's law, carried): every number that
// rides a wire as a Prisma Decimal arrives as a STRING unless the wire
// coerced it. The grouping lib therefore coerces before any plus or
// times — a string arrival can never lie here, even if another wire
// leaks one (defense in depth: the wire AND the lib both coerce).

// v2.424.0: the owed arithmetic reads the order list's own law
// (restockNeedsAttention — the nothing-to-order shape) and its gap
// (reorderGap), ONE home: the census and the fold can never disagree
// with the inventory banner's own voice. stock-order is PURE
// (client-safe, zero imports) — the read stays on the client side.
import { reorderGap, restockNeedsAttention, type RestockRow } from '@/lib/stock-order';

/** The shape the grouping lib needs — a superset of the products wire's
 *  own faces (quantityInStock/pricePerUnit arrive coerced numbers from
 *  /api/products, but the lib accepts strings too, per the grace). */
export interface SupplierGroupProduct {
  id: string;
  name: string;
  supplierId?: string | null;
  supplier?: { id: string; name: string } | null;
  quantityInStock: number | string;
  pricePerUnit: number | string;
  costPrice?: number | string | null;
}

/** v2.424.0: the reorder action's own shape — a grouping row that also
 *  carries the two fields the order needs (the SKU the pocket's honest
 *  map matches by, the level the gap reads). The wire's ProductListItem
 *  satisfies it as-is; the lib never widens the wire's own faces. */
export interface ShelfReorderProduct extends SupplierGroupProduct {
  sku: string;
  reorderLevel: number | string;
}

/** The honest absence: the group key products with no supplier carry. */
export const NO_SUPPLIER_KEY = 'none';

/** The absence's own voice — the lens never guesses a supplier name. */
export const NO_SUPPLIER_LABEL = 'No supplier yet';

export interface SupplierGroup {
  /** The supplier's id, or NO_SUPPLIER_KEY for the honest absence. */
  key: string;
  /** The supplier's name, or null for the honest absence. */
  supplierName: string | null;
  /** How many products this supplier provides (or how many rows wait unassigned). */
  productCount: number;
  /** Units on the shelf across the group (coerced — never a concat). */
  totalUnits: number;
  /** Shelf value: Σ(pricePerUnit × quantityInStock), rounded to cents. */
  shelfValue: number;
  /** Shelf cost: Σ(costPrice × quantityInStock) where a cost is known. */
  shelfCost: number;
}

/** Coerce a wire number with the grace: numbers pass, strings parse
 *  (a Decimal-as-string can never concat), null/garbage reads 0. */
function num(value: number | string | null | undefined): number {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * Group products by their supplier — the lens's ONE arithmetic.
 *
 * Laws the tests pin:
 *  - a product with a supplier rides under that supplier's key and name
 *    (the product's own supplierId is the truth; the nested supplier face
 *    only ever NAMES it — an id with no name still groups by the id);
 *  - a product with no supplierId lands in the NO_SUPPLIER_KEY group,
 *    named by NO_SUPPLIER_LABEL at render time (supplierName stays null —
 *    the honest absence, never a guessed name);
 *  - a product whose supplierId points at a supplier the wire did not
 *    hydrate STILL groups under its id (the key is the truth; the name
 *    waits for the wire — an unhydrated group reads its id as the name
 *    fallback at render time, never a guess);
 *  - the units and values SUM with the grace (string arrivals read
 *    honest numbers — the concat wound's own regression guard);
 *  - supplier groups sort by productCount desc, then name asc (the
 *    biggest supplier first, ties alphabetical — a stable read);
 *  - the NO_SUPPLIER_KEY group sorts LAST, always (the absence waits at
 *    the end of the strip, after every named supplier).
 */
export function buildSupplierGroups(products: readonly SupplierGroupProduct[]): SupplierGroup[] {
  const acc = new Map<string, SupplierGroup>();

  const ensure = (key: string, supplierName: string | null): SupplierGroup => {
    const existing = acc.get(key);
    if (existing) return existing;
    const fresh: SupplierGroup = {
      key,
      supplierName,
      productCount: 0,
      totalUnits: 0,
      shelfValue: 0,
      shelfCost: 0,
    };
    acc.set(key, fresh);
    return fresh;
  };

  for (const p of products) {
    const key = p.supplierId ?? NO_SUPPLIER_KEY;
    const named = key === NO_SUPPLIER_KEY ? null : (p.supplier?.id === key ? p.supplier.name : null);
    const group = ensure(key, named);
    // THE NAME WAITS FOR THE WIRE: the first hydrated name names the
    // group; a later hydrator never OVERWRITES it with a different one
    // (two names for one id would be a lie — the first truth heard wins).
    if (named && group.supplierName === null) group.supplierName = named;
    group.productCount += 1;
    const units = num(p.quantityInStock);
    const price = num(p.pricePerUnit);
    group.totalUnits += units;
    group.shelfValue += price * units;
    if (p.costPrice !== null && p.costPrice !== undefined) {
      group.shelfCost += num(p.costPrice) * units;
    }
  }

  const groups = [...acc.values()].map((g) => ({
    ...g,
    totalUnits: round2(g.totalUnits),
    shelfValue: round2(g.shelfValue),
    shelfCost: round2(g.shelfCost),
  }));

  const none = groups.find((g) => g.key === NO_SUPPLIER_KEY);
  const named = groups
    .filter((g) => g.key !== NO_SUPPLIER_KEY)
    .sort((a, b) => {
      if (b.productCount !== a.productCount) return b.productCount - a.productCount;
      return (a.supplierName ?? a.key).localeCompare(b.supplierName ?? b.key);
    });

  return none ? [...named, none] : named;
}

/** The strip's own census voice: "3 suppliers · 12 products placed · 9
 *  waiting" — one home so the desk and the tests can never disagree. */
export function describeSupplierCensus(groups: readonly SupplierGroup[]): {
  supplierCount: number;
  placedCount: number;
  waitingCount: number;
  voice: string;
} {
  const supplierCount = groups.filter((g) => g.key !== NO_SUPPLIER_KEY).length;
  const waitingGroup = groups.find((g) => g.key === NO_SUPPLIER_KEY);
  const waitingCount = waitingGroup?.productCount ?? 0;
  const placedCount = groups.reduce((sum, g) => sum + (g.key === NO_SUPPLIER_KEY ? 0 : g.productCount), 0);
  const parts: string[] = [
    `${supplierCount} supplier${supplierCount === 1 ? '' : 's'}`,
    `${placedCount} product${placedCount === 1 ? '' : 's'} placed`,
  ];
  if (waitingCount > 0) parts.push(`${waitingCount} waiting`);
  return { supplierCount, placedCount, waitingCount, voice: parts.join(' · ') };
}

/** v2.423.0 THE ARC'S FOURTH WORD — the shelf's own summary. The
 *  suppliers desk's drill-down reads ONE home: the rows the wire
 *  answered reduce to the shelf's voice (products, units, value, cost)
 *  by the SAME arithmetic the grouping strip speaks (buildSupplierGroups'
 *  own reduce — never a second copy of the sum). The rows are NOT
 *  trusted pre-filtered: the helper keeps only the rows the supplier's
 *  own id claims, so a stale wire row can never ride another supplier's
 *  shelf (the same honesty the pre-pick's census speaks — the id is the
 *  truth, the name waits for the wire). An empty or fully-stale answer
 *  reads the honest zeros.
 */
export interface SupplierShelfSummary {
  /** How many of the supplier's own rows the answer carries. */
  products: number;
  /** Units on the shelf across the rows (coerced — never a concat). */
  totalUnits: number;
  /** Shelf value: Σ(pricePerUnit × quantityInStock), rounded to cents. */
  shelfValue: number;
  /** Shelf cost: Σ(costPrice × quantityInStock) where a cost is known. */
  shelfCost: number;
}

export function supplierShelfSummary(
  products: readonly SupplierGroupProduct[],
  supplierId: string,
): SupplierShelfSummary {
  const own = products.filter((p) => p.supplierId === supplierId);
  const group = buildSupplierGroups(own).find((g) => g.key === supplierId);
  return {
    products: group?.productCount ?? 0,
    totalUnits: group?.totalUnits ?? 0,
    shelfValue: group?.shelfValue ?? 0,
    shelfCost: group?.shelfCost ?? 0,
  };
}

/** The shelf row's own state — the drill's row family, spoken in the
 *  inventory desk's own low-stock vocabulary: 'out' is the empty shelf,
 *  'low' the shelf that owes (AT or UNDER its reorder level — the
 *  boundary is owed, never hidden), 'ok' the healthy shelf. The numbers
 *  ride the grace: a Decimal-as-string arrival can never flip a family
 *  (the lexicographic wound's own regression guard — "9" vs 10 reads
 *  the owed shelf, never "9" > "10"). */
export type ShelfRowState = 'ok' | 'low' | 'out';

export function shelfRowState(
  quantityInStock: number | string,
  reorderLevel: number | string,
): ShelfRowState {
  const stock = num(quantityInStock);
  const reorder = num(reorderLevel);
  if (stock <= 0) return 'out';
  if (stock <= reorder) return 'low';
  return 'ok';
}

/** The owed units — how far the shelf sits under its reorder level,
 *  floored at zero (a healthy shelf owes nothing, an over-stocked one
 *  never reads a negative debt). The grace applies: string arrivals
 *  coerce before the minus — a Decimal-as-string can never concat into
 *  the row's voice. The drill's 'Low' rows speak THIS number. */
export function shelfShortfall(
  quantityInStock: number | string,
  reorderLevel: number | string,
): number {
  return Math.max(num(reorderLevel) - num(quantityInStock), 0);
}

/** v2.424.0 THE ARC'S FIFTH WORD — the shelf's owed rows, the reorder
 *  action's ONE arithmetic. The drill's sheet answers "what does this
 *  supplier provide"; its action answers "what does this supplier's
 *  shelf OWE". The rows the pocket carries are the id-claimed rows
 *  whose shelf sits at/below its reorder level AND asks for a positive
 *  gap — restockNeedsAttention's own nothing-to-order law (an
 *  out-of-stock row with reorder level 0 has no order to place: an
 *  order line asking for 0 units would be a lie with a checkbox), so
 *  the census and the fold can never disagree. The supplier's name
 *  rides the row (the wire's own voice) so the pocket's census speaks
 *  the maker; the honest absence stays null. The grace coerces every
 *  number before the comparison — a Decimal-as-string arrival reads
 *  the owed shelf, never the lexicographic wound ("9" vs 10).
 *
 *  @remarks the rows are NOT trusted pre-filtered (the shelf summary's
 *  own law): a stale wire row can never ride another supplier's order
 *  — the id is the truth. */
export function shelfOwedRows(
  products: readonly ShelfReorderProduct[],
  supplierId: string,
): RestockRow[] {
  return products
    .filter((p) => p.supplierId === supplierId)
    .map((p) => ({
      sku: p.sku,
      name: p.name,
      onHand: num(p.quantityInStock),
      reorderLevel: num(p.reorderLevel),
      supplierName: p.supplier?.name ?? null,
    }))
    .filter((row) => restockNeedsAttention(row));
}

/** The owed census's unit voice — the fold's own total ask, one home:
 *  every carried row's gap back to its reorder level, summed (each gap
 *  already floored by reorderGap — a healthy row never rides, so the
 *  sum is the order's weight, never a negative debt). An empty carry
 *  reads the honest zero. */
export function shelfOwedUnits(owed: readonly RestockRow[]): number {
  return owed.reduce((sum, row) => sum + reorderGap(row), 0);
}
