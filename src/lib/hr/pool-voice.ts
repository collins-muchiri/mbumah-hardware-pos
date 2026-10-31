// MBUMAH HARDWARE POS - the pool voice (v2.306.0)
//
// THE POOL'S ONE PURE SEAM. v2.282.0 taught the goal pool to speak (the
// goal-attainment digest) and v2.283.0 taught the cycles/reviews pool —
// but the arithmetic those digests email lived in the server services
// (goal-service, performance-service), unreachable from the client bundle,
// while the performance desk held the SAME pool as rows and spoke only
// rows and filter chips. The desk and the digest disagreed in vocabulary
// depth: the email said "Attainment 50%", the desk said nothing. This lib
// moves the pool's ONE arithmetic and ONE colour vocabulary into an
// import-free pure module both mouths import — byte-parity between the
// digest and the desk is by construction, not by discipline.
//
// PURE LAW: no React, no Prisma, no network, no `import` of any kind —
// the client bundle may carry it and the server may re-export it. The
// services keep their exported names (goalAttainmentPct / reviewCyclePct /
// the vocabularies) as re-exports, so every existing caller and every
// ancestor pin keeps its seam; the bodies live here and only here.

/** The goal pool's own lifecycle vocabulary (verbatim from goal-service). */
export const GOAL_STATUSES = ['OPEN', 'ACHIEVED', 'MISSED', 'CLOSED'] as const;

/** The review pool's own lifecycle vocabulary (verbatim from performance-service). */
export const REVIEW_STATUSES = ['DRAFT', 'SUBMITTED', 'ACKNOWLEDGED', 'CALIBRATED'] as const;

/** The cycle window's own lifecycle vocabulary (the digest's cycle buckets). */
export const CYCLE_STATUSES = ['DRAFT', 'ACTIVE', 'CLOSED'] as const;

/** The r1 law — one decimal, half up, exactly as the digest's sums round. */
const r1 = (n: number) => Math.round(n * 10) / 10;

/**
 * THE ONE attainment arithmetic (moved verbatim from goal-service).
 * Null when the target sum is 0 (a percentage over nothing is a guess)
 * AND when the target is NEGATIVE (data corruption, not a denominator) —
 * the `> 0` gate is the whole truth table; over-achievement is kept.
 */
export function goalAttainmentPct(target: number, current: number): number | null {
  return target > 0 ? r1((current / target) * 100) : null;
}

/**
 * THE ONE share arithmetic (moved verbatim from performance-service).
 * Null when the whole is 0 (or negative — same corruption rule).
 */
export function reviewCyclePct(part: number, whole: number): number | null {
  if (whole <= 0) return null;
  return Math.round((part / whole) * 1000) / 10;
}

/**
 * THE ONE pct face — the digest's own `pctOrDash` voice: a percentage
 * speaks one decimal; the honest absence speaks an em dash. Both digest
 * cases and both bands say it through this single seam.
 */
export function poolPctVoice(v: number | null | undefined): string {
  return v == null ? '—' : `${Math.round(v * 10) / 10}%`;
}

/** One bucket of the pool: a status word and the rows standing in it. */
export interface PoolStatusCount {
  status: string;
  count: number;
}

/** The goal pool's band — the digest headline's own numbers, desk-side. */
export interface GoalPoolBand {
  tracked: number;
  targetSum: number;
  currentSum: number;
  attainmentPct: number | null;
  overdue: number;
  rows: PoolStatusCount[];
}

/** The cycles/reviews pool's band — counts only, the digest's own mask. */
export interface CyclePoolBand {
  trackedCycles: number;
  cycleRows: PoolStatusCount[];
  unclosedWindows: number;
  trackedReviews: number;
  reviewRows: PoolStatusCount[];
}

/**
 * The bucket law the digest obeys, stated once: the vocabulary's own
 * order first, then any status word the vocabulary does not know buckets
 * AS ITSELF in first-seen order — the document exposes what it cannot
 * name, never renames it. Tracked > the rows' sum is the drift signal.
 */
function bucketRows(
  statuses: readonly string[],
  counts: Map<string, number>,
): PoolStatusCount[] {
  const rows: PoolStatusCount[] = statuses.map((status) => ({
    status,
    count: counts.get(status) ?? 0,
  }));
  const known = new Set<string>(statuses);
  for (const word of counts.keys()) {
    if (!known.has(word)) rows.push({ status: word, count: counts.get(word) ?? 0 });
  }
  return rows;
}

/**
 * Aggregate the goal pool the digest speaks — from the rows the desk
 * already holds. THE SCOPE HONESTY (v2.284.0's law, desk-side): the band
 * speaks the rows its session can see; for the org-scope session that is
 * the digest's pool, for a narrower session it speaks its own truth —
 * never a wider pool than the rows prove. The clock law is the digest's
 * own: overdue = OPEN + a named day that ended BEFORE this instant — a
 * window that ends this instant is not yet overdue (STRICT boundary),
 * an unnamed day never is, and only OPEN can owe.
 */
export function poolBandFromGoals(
  rows: ReadonlyArray<{
    status: string;
    targetValue?: number | string | null;
    currentValue?: number | string | null;
    dueDate?: Date | string | null;
  }>,
  now: Date,
): GoalPoolBand {
  const counts = new Map<string, number>();
  let targetTotal = 0;
  let currentTotal = 0;
  let overdue = 0;
  const nowMs = now.getTime();
  for (const g of rows) {
    counts.set(g.status, (counts.get(g.status) ?? 0) + 1);
    targetTotal += Number(g.targetValue ?? 0);
    currentTotal += Number(g.currentValue ?? 0);
    // Strict boundary, the report's own clock: `dueDate < now`, never <=.
    if (g.status === 'OPEN' && g.dueDate) {
      const due = new Date(g.dueDate).getTime();
      if (!Number.isNaN(due) && due < nowMs) overdue += 1;
    }
  }
  const targetSum = r1(targetTotal);
  const currentSum = r1(currentTotal);
  return {
    tracked: rows.length,
    targetSum,
    currentSum,
    attainmentPct: goalAttainmentPct(targetSum, currentSum),
    overdue,
    rows: bucketRows(GOAL_STATUSES, counts),
  };
}

/**
 * Aggregate the cycles/reviews pool the digest speaks — counts only (the
 * digest's own mask: ratings never ride a list payload, a fortiori never
 * a band). Unclosed windows follow the report's exact law: only an ACTIVE
 * cycle can owe a close, and a window that ends this instant is not yet
 * over (STRICT boundary).
 */
export function poolBandFromCycles(
  cycles: ReadonlyArray<{
    status: string;
    periodEnd?: Date | string | null;
  }>,
  reviews: ReadonlyArray<{ status: string }>,
  now: Date,
): CyclePoolBand {
  const cycleCounts = new Map<string, number>();
  let unclosedWindows = 0;
  const nowMs = now.getTime();
  for (const c of cycles) {
    cycleCounts.set(c.status, (cycleCounts.get(c.status) ?? 0) + 1);
    if (c.status === 'ACTIVE' && c.periodEnd) {
      const end = new Date(c.periodEnd).getTime();
      if (!Number.isNaN(end) && end < nowMs) unclosedWindows += 1;
    }
  }
  const reviewCounts = new Map<string, number>();
  for (const r of reviews) {
    reviewCounts.set(r.status, (reviewCounts.get(r.status) ?? 0) + 1);
  }
  return {
    trackedCycles: cycles.length,
    cycleRows: bucketRows(CYCLE_STATUSES, cycleCounts),
    unclosedWindows,
    trackedReviews: reviews.length,
    reviewRows: bucketRows(REVIEW_STATUSES, reviewCounts),
  };
}

/**
 * THE POOL VOCABULARIES' ONE COLOUR MAP (moved verbatim from the
 * schedules desk's digest preview — v2.283.0's borrowed families): amber =
 * waiting, emerald = positive, rose = negative, slate = quiet, sky =
 * in motion. "No word wears two colours across the app" becomes true by
 * construction: every pool chip — the digest preview's, the bands', the
 * performance desk's filter chips — reads this one map.
 */
export const POOL_STATUS_CHIP: Record<string, string> = {
  OPEN: 'bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-900',
  ACHIEVED: 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900',
  MISSED: 'bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-900',
  CLOSED: 'bg-slate-100 dark:bg-slate-900/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800',
  DRAFT: 'bg-slate-100 dark:bg-slate-900/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800',
  SUBMITTED: 'bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-900',
  ACKNOWLEDGED: 'bg-sky-100 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-900',
  CALIBRATED: 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900',
  ACTIVE: 'bg-sky-100 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-900',
};

/**
 * The quiet family — a word the map does not know stays plain text (the
 * document exposes what it cannot name, never dresses it up).
 */
export function poolStatusChip(word: string): string | null {
  return POOL_STATUS_CHIP[word] ?? null;
}
