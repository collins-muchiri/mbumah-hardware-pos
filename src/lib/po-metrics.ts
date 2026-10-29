// ============================================================================
// MBUMAH HARDWARE POS — the metrics' answer (v2.258.0)
// ============================================================================
// THE ONE HOME for the purchase-order metric predicates: the supplier
// detail's Performance card computes its rates (on-time %, fulfillment %)
// from the same purchaseOrders array the Orders roster already holds —
// v2.258.0 lets the numbers answer BY the orders behind them: a drill
// affordance on a metric tile opens the Orders sub-tab with the metric
// lens pressed, and the roster narrows to exactly the rows that wear the
// number. ONE predicate per kind, living HERE — the card's counts, the
// roster's filter and the rate math all read the same rule, never a
// second copy (a tile's % and its drill count disagreeing would be a
// lie with two faces).
//
// THE KINDS:
//   onTime — RECEIVED and not after its expected date (a sheet with no
//            expectation keeps the benefit of the doubt; the card's own
//            on-time rule, byte-matched).
//   late   — RECEIVED and after its expected date (the complement of
//            on-time among the received; the two split the received set
//            with no row in both and no row in neither).
//   open   — still in flight: not CANCELLED, not RECEIVED (what the
//            fulfillment rate does not yet cover — the actionable half).
//
// THE COMPOSITION LAW: the metric lens narrows what the band lens
// already answered (AND, never OR); the roster's memos compose in the
// tab (bandOrders → lensedOrders), the fetch never moves.
// ============================================================================

export type PoMetricKind = 'onTime' | 'late' | 'open';
export type PoMetricLens = 'all' | PoMetricKind;

/** The minimal shape the predicates read — the tab's PurchaseOrderListItem
 * satisfies it structurally; the lib stays decoupled from the tab. */
export interface PoMetricShape {
  status: string;
  createdAt?: string | null;
  expectedDate?: string | null;
}

/**
 * The metric's own rule — ONE copy (the card's counts and the roster's
 * filter read this; a tile's rate and its drill count cannot disagree).
 */
export function poMetricPredicate(kind: PoMetricKind, po: PoMetricShape): boolean {
  const created = po.createdAt ? new Date(po.createdAt).getTime() : null;
  const expected = po.expectedDate ? new Date(po.expectedDate).getTime() : null;
  if (kind === 'open') return po.status !== 'CANCELLED' && po.status !== 'RECEIVED';
  if (po.status !== 'RECEIVED') return false;
  if (kind === 'onTime') return expected == null || (created != null && created <= expected);
  return expected != null && created != null && created > expected; // late
}

/** The chip's voice — the metric spoken the way the roster says it. */
export function poMetricVoice(kind: PoMetricKind): string {
  if (kind === 'onTime') return 'on time';
  if (kind === 'late') return 'arrived late';
  return 'in flight';
}

/** The empty face's voice — the pressed metric that empties the view. */
export function poMetricEmptyVoice(kind: PoMetricKind): string {
  if (kind === 'onTime') return 'is on time';
  if (kind === 'late') return 'arrived late';
  return 'is still in flight';
}

/** The tile's own family — the drill chip wears the tile's colour
 * (green for on-time, rose for late, blue for in-flight), never a new
 * palette (the 3:1 contrast law rides the existing families). */
export function poMetricFamily(kind: PoMetricKind): {
  chip: string;
  pressed: string;
  rail: string;
  // v2.261.0 THE DOCUMENT'S ANSWER — the strip's own face: the same
  // families, worn by the drill's why-strip (an informational face —
  // border + text + ground, never the pressed shout, never a hover).
  why: string;
} {
  if (kind === 'onTime') {
    return {
      chip: 'bg-green-50 text-green-700 ring-green-300/70 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-300 dark:ring-green-700/60 dark:hover:bg-green-900/50',
      pressed: 'bg-green-600 text-white ring-green-600 dark:bg-green-500 dark:text-slate-950 dark:ring-green-500',
      rail: 'bg-green-500',
      why: 'border-green-200 bg-green-50/60 text-green-800 dark:border-green-500/40 dark:bg-green-500/10 dark:text-green-200',
    };
  }
  if (kind === 'late') {
    return {
      chip: 'bg-rose-50 text-rose-700 ring-rose-300/70 hover:bg-rose-100 dark:bg-rose-900/30 dark:text-rose-300 dark:ring-rose-700/60 dark:hover:bg-rose-900/50',
      pressed: 'bg-rose-600 text-white ring-rose-600 dark:bg-rose-500 dark:text-slate-950 dark:ring-rose-500',
      rail: 'bg-rose-500',
      why: 'border-rose-200 bg-rose-50/60 text-rose-800 dark:border-rose-500/40 dark:bg-rose-500/10 dark:text-rose-200',
    };
  }
  return {
    chip: 'bg-blue-50 text-blue-700 ring-blue-300/70 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300 dark:ring-blue-700/60 dark:hover:bg-blue-900/50',
    pressed: 'bg-blue-600 text-white ring-blue-600 dark:bg-blue-500 dark:text-slate-950 dark:ring-blue-500',
    rail: 'bg-blue-500',
    why: 'border-blue-200 bg-blue-50/60 text-blue-800 dark:border-blue-500/40 dark:bg-blue-500/10 dark:text-blue-200',
  };
}

// ============================================================================
// v2.261.0 THE DOCUMENT'S ANSWER — the WHY voice (the drill's own rung)
// ============================================================================
// The arc's completion: the tile answers with a count, the rail answers
// with rows, and now the DOCUMENT answers with its own facts. When the
// ledger opens a row's drill under a pressed metric, the drill speaks
// WHY the document sits in the pressed set — the ONE rule's own
// arithmetic, read from the fields the document's wire ALREADY carries
// (status + createdAt + expectedDate — zero new fetch, never a second
// copy of the rule).
//
// THE HONEST GATE: the voice gates on the predicate ITSELF — a document
// that does not answer the pressed rule (a stale lens, a row that moved
// between list and drill) answers null, and the caller renders the
// silent absence. A why that cannot be spoken is never guessed.

/** The minimal shape the WHY voice reads — the drill's fresh wire
 * satisfies it structurally; the lib stays decoupled from the drill. */
export interface PoMetricWhyShape {
  status: string;
  createdAt?: string | null;
  expectedDate?: string | null;
}

/** The document's own answer — the rule's arithmetic spoken in the
 * document's words ("the day the supplier named" is the Expected
 * tile's own voice). Returns null when the document does not answer
 * the rule — the silent absence, never a guessed why. */
export function poMetricWhyVoice(kind: PoMetricKind, po: PoMetricWhyShape): string | null {
  // The gate IS the rule — the same predicate the tiles, the rails and
  // the card read. One home; a strip and a count cannot disagree.
  if (!poMetricPredicate(kind, po)) return null;
  if (kind === 'open') {
    return 'in flight — neither received nor cancelled; the order still owes the pipeline its ending.';
  }
  const created = po.createdAt ? new Date(po.createdAt).getTime() : null;
  const expected = po.expectedDate ? new Date(po.expectedDate).getTime() : null;
  const DAY_MS = 86_400_000;
  if (kind === 'onTime') {
    // no day was named — the predicate kept the benefit of the doubt,
    // and the voice speaks it (the Expected tile's own honest absence)
    if (expected == null) return 'on time — no day was named; the benefit of the doubt stands.';
    // the type check, never an assumption: the predicate guarantees a
    // created clock when an expectation exists, but the honest shape
    // keeps the null path (a strip that cannot speak stays silent)
    if (created == null) return null;
    const daysBefore = Math.floor((expected - created) / DAY_MS);
    return daysBefore <= 0
      ? 'on time — raised on the day the supplier named.'
      : `on time — raised ${daysBefore} day${daysBefore === 1 ? '' : 's'} before the day the supplier named.`;
  }
  // late: the predicate guarantees both clocks exist (expected != null,
  // created != null, created > expected) — the honest null path stays
  // for the shape's own sake. The count is the CALENDAR gap between the
  // day the supplier named and the day the order was raised (UTC
  // midnights, the wire's own dates): twenty-five hours past the named
  // midnight is ONE day after, never two — and a raise later in the
  // named day itself speaks its own words (the rule reads the raise
  // against the named day, and the day's hours count).
  if (created == null || expected == null) return null;
  const daysAfter = Math.floor(created / DAY_MS) - Math.floor(expected / DAY_MS);
  return daysAfter <= 0
    ? 'arrived late — raised later in the day the supplier named.'
    : `arrived late — raised ${daysAfter} day${daysAfter === 1 ? '' : 's'} after the day the supplier named.`;
}
