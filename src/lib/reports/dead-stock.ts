/**
 * THE DEAD STOCK CLASSIFIER (v2.461.0) — the reports desk's ninth report
 * speaks one definition, and the definition lives in ONE home:
 *
 *   A product is DEAD STOCK when it HOLDS stock (quantityInStock > 0)
 *   AND its last sale is OLDER than the idle window — or it has NEVER
 *   sold. Out-of-stock products are NOT dead stock: an empty shelf has
 *   no capital tied in it (the low-stock alert owns that story).
 *
 * The route gathers the facts (products + each product's last sale date);
 * this module owns the MEANING. Pure and deterministic — the suite proves
 * the arithmetic without a database, and the route merely feeds it.
 *
 * THE HONEST FACES:
 *   • capitalTied  = quantityInStock × costPrice (money at rest, at cost —
 *     never at a selling price the shop has not realized).
 *   • daysIdle     = whole days since the last sale; NULL speaks "never
 *     sold" (a null is a voice, not a zero — a fabricated 0 would read
 *     "sold today").
 *   • deadSharePct = dead capital / TOTAL active inventory value (the
 *     same qty × cost sum over every active product, dead or not). A zero
 *     denominator shares ZERO — never NaN (the v2.205.0 honest-share law).
 *   • Rows sort by capitalTied DESC (the loudest debt first), tiebreak
 *     name ASC — deterministic, so the table never shuffles between runs.
 */

export interface DeadStockProduct {
  id: string;
  name: string;
  sku: string;
  quantityInStock: number;
  costPrice: number;
  pricePerUnit: number;
  reorderLevel: number;
  unitType: string;
  categoryName: string | null;
}

export interface DeadStockRow {
  productId: string;
  name: string;
  sku: string;
  categoryName: string | null;
  quantityInStock: number;
  costPrice: number;
  pricePerUnit: number;
  reorderLevel: number;
  unitType: string;
  capitalTied: number;
  lastSoldAt: string | null;
  daysIdle: number | null;
}

export interface DeadStockSummary {
  days: number;
  deadCount: number;
  totalCapitalTied: number;
  totalStockValue: number;
  deadSharePct: number;
}

const DAY_MS = 24 * 60 * 60 * 1000;

/** round2 — the financialMath convention, local so the module stays
 *  dependency-free (the route's toDec/round2 import is for its own
 *  Decimal walk; the classifier speaks plain numbers). */
const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

export function classifyDeadStock(
  products: DeadStockProduct[],
  lastSoldAtByProduct: Map<string, string | null>,
  now: Date,
  days: number,
): { rows: DeadStockRow[]; summary: DeadStockSummary } {
  const cutoff = now.getTime() - days * DAY_MS;

  let totalStockValue = 0;
  const candidates: DeadStockRow[] = [];

  for (const p of products) {
    const qty = Number(p.quantityInStock);
    const cost = Number(p.costPrice);
    const stockValue = qty * cost;
    totalStockValue += stockValue;

    if (qty <= 0) continue; // an empty shelf carries no capital — not dead stock

    const lastSoldAt = lastSoldAtByProduct.get(p.id) ?? null;
    const lastSoldMs = lastSoldAt ? new Date(lastSoldAt).getTime() : null;
    // NEVER sold (null) is always past any window; a sale inside the
    // window keeps the product alive.
    if (lastSoldMs !== null && lastSoldMs >= cutoff) continue;

    candidates.push({
      productId: p.id,
      name: p.name,
      sku: p.sku,
      categoryName: p.categoryName,
      quantityInStock: qty,
      costPrice: round2(cost),
      pricePerUnit: round2(Number(p.pricePerUnit)),
      reorderLevel: Number(p.reorderLevel),
      unitType: p.unitType,
      capitalTied: round2(stockValue),
      lastSoldAt,
      daysIdle: lastSoldMs !== null ? Math.floor((now.getTime() - lastSoldMs) / DAY_MS) : null,
    });
  }

  candidates.sort((a, b) => b.capitalTied - a.capitalTied || a.name.localeCompare(b.name));

  const totalCapitalTied = round2(candidates.reduce((s, r) => s + r.capitalTied, 0));
  const totalStockValueRounded = round2(totalStockValue);
  const deadSharePct = totalStockValueRounded > 0
    ? Math.round((totalCapitalTied / totalStockValueRounded) * 1000) / 10
    : 0;

  return {
    rows: candidates,
    summary: {
      days,
      deadCount: candidates.length,
      totalCapitalTied,
      totalStockValue: totalStockValueRounded,
      deadSharePct,
    },
  };
}

/** The windows the lens speaks — the route validates against this tuple,
 *  the tab's chips read the same three words. ONE home. */
export const DEAD_STOCK_WINDOWS = [30, 60, 90] as const;
export type DeadStockWindow = (typeof DEAD_STOCK_WINDOWS)[number];

// ============================================================================
// v2.462.0 THE RESTING LEDGER LEARNS TO SHARE AND TO ASK
// ============================================================================
// Two pure voices join the classifier's home, so the desk stays thin and
// the suite proves both without a database:
//   • capitalTiedByCategory — the chart's own grouping: the rows' capital
//     summed per category (the honest "Uncategorised" word when the shelf
//     never named one), loudest rest first with the name tiebreak — the
//     same deterministic order the rows themselves wear.
//   • deadStockClearanceNote — the Ask button's word: a deterministic,
//     WhatsApp-ready clearance note built ONLY from the row's own numbers
//     and the window that caught it. No supplier name is invented (the
//     row carries none), no date is locale-shaped (the ISO day speaks —
//     a clipboard word must read the same on every machine), and the
//     never-sold row says so instead of wearing a fabricated age.
// --------------------------------------------------------------------------

/** round2 — the classifier's own convention (the local twin above). */
const round2b = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

/** THE CAPITAL'S SHAPE (v2.462.0) — capital tied, summed per category.
 *  A row whose shelf never named a category speaks "Uncategorised" (the
 *  ledger's own word — the chart must never drop resting capital because
 *  a label is missing). Sorted capital DESC with the name tiebreak, so
 *  the same rows always draw the same shape. Pure. */
export function capitalTiedByCategory(
  rows: ReadonlyArray<DeadStockRow>,
): { label: string; value: number }[] {
  const map = new Map<string, number>();
  for (const row of rows) {
    const label = row.categoryName ?? 'Uncategorised';
    map.set(label, (map.get(label) ?? 0) + row.capitalTied);
  }
  return [...map.entries()]
    .map(([label, value]) => ({ label, value: round2b(value) }))
    .sort((a, b) => b.value - a.value || a.label.localeCompare(b.label));
}

/** THE MAKER'S WORD (v2.462.0) — the clearance note the Ask button
 *  carries to the clipboard. Deterministic by law: the ISO day (the
 *  date's own first ten characters), the capital at cost with two
 *  decimals, the base unit named (the UoM law — "40 METER" is forty
 *  metres, never forty pieces), and the window that caught the row. The
 *  never-sold row speaks its honest absence instead of an invented age.
 *  Pure. */
export function deadStockClearanceNote(row: DeadStockRow, days: number): string {
  const idleVoice = row.lastSoldAt && row.daysIdle != null
    ? `idle ${row.daysIdle} days (last sold ${row.lastSoldAt.slice(0, 10)}`
    : 'never sold (no sale on this shelf\'s record';
  return `Clearance ask — ${row.quantityInStock} ${row.unitType} × ${row.name} (${row.sku}): Ksh ${row.capitalTied.toFixed(2)} tied at cost, ${idleVoice}, caught by the ${days}-day window). Can we talk an exchange?`;
}
