// MBUMAH HARDWARE POS - rate-table view law (v2.303.0)
//
// WHY THIS LIB EXISTS: the payroll engine (src/lib/hr/payroll/engine.ts
// resolveRates) decides which statutory table answers for a period date, and
// throws RATE_TABLE_MISSING / OVERLAPPING_RATE_TABLES when the data cannot
// answer cleanly. The management face (/hr/rate-tables, v2.303.0) needs the
// SAME window law on the client — status chips and overlap warnings computed
// from the same predicates the engine runs, so what the desk shows and what
// payroll will do agree by construction, not by luck.
//
// PURE LAW (spec rule: hr libs are pure): no Prisma, no React, no network.

/** The statutory types the schema names (prisma/schema.prisma RateTable.type
 * comment). The engine REQUIRES six of these per run; the desk accepts all
 * twelve so policy tables (overtime, leave) get the same custody. */
export const RATE_TABLE_TYPES = [
  'PAYE',
  'NSSF_TIER1',
  'NSSF_TIER2',
  'SHIF',
  'HOUSING_LEVY',
  'HELB',
  'PERSONAL_RELIEF',
  'OVERTIME',
  'NIGHT_ALLOWANCE',
  'LEAVE_POLICY',
  'HOUR_CAP',
  'COMMISSION',
] as const;

export type RateTableType = (typeof RATE_TABLE_TYPES)[number];

/** The table shape the management read returns (dates as ISO strings or
 * Date — both compare through getTime, exactly as the engine does). */
export interface RateTableViewShape {
  id: string;
  type: string;
  code: string;
  label: string;
  effectiveFrom: string | Date;
  effectiveTo?: string | Date | null;
  instrumentReference?: string | null;
  verifyWithCounsel?: boolean;
  rows?: unknown[];
}

/** The engine's own window law (resolveRates, byte-parity): a table answers
 * for `at` when it began on or before the date and has not ended before it.
 * An open effectiveTo (null) never ends. */
export function rateTableWindowCovers(
  t: Pick<RateTableViewShape, 'effectiveFrom' | 'effectiveTo'>,
  at: Date,
): boolean {
  const fromOk = new Date(t.effectiveFrom).getTime() <= at.getTime();
  const toOk = !t.effectiveTo || new Date(t.effectiveTo).getTime() >= at.getTime();
  return fromOk && toOk;
}

/** The desk's status chip, from the same law: ACTIVE covers now,
 * SCHEDULED begins in the future, CLOSED already ended. */
export type RateTableStatus = 'ACTIVE' | 'SCHEDULED' | 'CLOSED';

export function rateTableStatus(t: RateTableViewShape, at: Date): RateTableStatus {
  const began = new Date(t.effectiveFrom).getTime();
  if (began > at.getTime()) return 'SCHEDULED';
  if (t.effectiveTo && new Date(t.effectiveTo).getTime() < at.getTime()) return 'CLOSED';
  return 'ACTIVE';
}

/** Do two half-open-closed windows [from, to ?? ∞) intersect? Touching
 * windows are LEGAL (Jan–Jun then Jul–Dec never both answer for one day —
 * the engine counts a table whose effectiveTo == the other's effectiveFrom
 * as a candidate on that boundary date... which is exactly why the guard
 * refuses INTERSECTION only, same as the engine's same-date rule). */
export function rateTableWindowsIntersect(
  a: Pick<RateTableViewShape, 'effectiveFrom' | 'effectiveTo'>,
  b: Pick<RateTableViewShape, 'effectiveFrom' | 'effectiveTo'>,
): boolean {
  const aFrom = new Date(a.effectiveFrom).getTime();
  const aTo = a.effectiveTo ? new Date(a.effectiveTo).getTime() : Number.MAX_SAFE_INTEGER;
  const bFrom = new Date(b.effectiveFrom).getTime();
  const bTo = b.effectiveTo ? new Date(b.effectiveTo).getTime() : Number.MAX_SAFE_INTEGER;
  return aFrom <= bTo && bFrom <= aTo;
}

/** The overlap pairs, keyed by table id → the ids it overlaps with, over the
 * SAME org+type+code only (the engine groups by code within a type; different
 * codes of one type are the versioning mechanism, never an overlap). Open
 * windows count as ∞ — an unclosed table overlaps any later same-code window
 * that reaches back into it. */
export function rateTableOverlapMap<T extends RateTableViewShape>(tables: T[]): Map<string, T[]> {
  const map = new Map<string, T[]>();
  for (let i = 0; i < tables.length; i++) {
    const a = tables[i];
    if (!a) continue;
    for (let j = i + 1; j < tables.length; j++) {
      const b = tables[j];
      if (!b) continue;
      if (a.type !== b.type || a.code !== b.code) continue;
      if (!rateTableWindowsIntersect(a, b)) continue;
      const la = map.get(a.id) ?? [];
      const lb = map.get(b.id) ?? [];
      la.push(b);
      lb.push(a);
      map.set(a.id, la);
      map.set(b.id, lb);
    }
  }
  return map;
}

/** The day after a date, as a YYYY-MM-DD string (UTC) — the close dialog's
 * suggested boundary (a table that stops covering today ends yesterday's
 * sibling's first day minus one; callers pass their own date anyway). */
export function isoDayAfter(d: Date): string {
  const next = new Date(d.getTime());
  next.setUTCDate(next.getUTCDate() + 1);
  return next.toISOString().slice(0, 10);
}
