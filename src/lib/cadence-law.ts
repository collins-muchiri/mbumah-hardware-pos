// ── v2.241.0 THE WALK'S LAW ──────────────────────────────────────────────
// The cadence's thresholds have spoken as constants since v2.235.0 — the
// same 7/30 duplicated across two wires (org kpi-summary + the branch
// teeth). This round the law becomes GOVERNABLE: the org's owner writes
// the pair once and every voice that names a threshold reads the same
// stored truth. One home (SystemConfig), one reader (this file), no
// second constant.
//
// THE FALLBACK LAW: an absent key, a malformed value, or an out-of-range
// number falls back to ITS OWN default — yesterday's truth is the floor.
// THE PAIR LAW: the law is read as a PAIR; if the stored pair is
// incoherent (freshDays >= windowDays — unreachable through the PUT
// wire's validation, reachable through a hand-edited row), the whole
// pair falls back to the defaults. A law that contradicts itself is no
// law, and the floor never walks a contradiction.
//
// THE BOUNDS (the PUT wire enforces, this reader double-checks):
//   freshDays  1–14   — the fresh/stale boundary, a week's shape
//   windowDays 14–90  — the rolling window the whole family speaks
// The window is structural (queries, labels, the CSV) but never magic:
// the wires carry the number and the faces say what the wire says.

import type { PrismaClient } from '@prisma/client';

export const CADENCE_LAW_DEFAULTS = { freshDays: 7, windowDays: 30 } as const;

export const CADENCE_LAW_KEYS = {
  freshDays: 'cadence.freshDays',
  windowDays: 'cadence.windowDays',
} as const;

export const CADENCE_LAW_BOUNDS = {
  freshDays: { min: 1, max: 14 },
  windowDays: { min: 14, max: 90 },
} as const;

export interface CadenceLaw {
  freshDays: number;
  windowDays: number;
}

/** A value the stored law accepts: an integer inside its band. */
function inBand(v: unknown, min: number, max: number): v is number {
  return typeof v === 'number' && Number.isFinite(v) && Number.isInteger(v) && v >= min && v <= max;
}

/** Validate a CANDIDATE pair (the PUT wire's gate, before any write). */
export function isValidCadenceLaw(candidate: unknown): candidate is CadenceLaw {
  if (!candidate || typeof candidate !== 'object') return false;
  const c = candidate as Record<string, unknown>;
  return (
    inBand(c.freshDays, CADENCE_LAW_BOUNDS.freshDays.min, CADENCE_LAW_BOUNDS.freshDays.max) &&
    inBand(c.windowDays, CADENCE_LAW_BOUNDS.windowDays.min, CADENCE_LAW_BOUNDS.windowDays.max) &&
    (c.freshDays as number) < (c.windowDays as number)
  );
}

/**
 * Read the stored law as ONE pair. One bounded read (two keyed rows),
 * each key parsed independently, the pair coherence-checked; any
 * incoherence falls back to the defaults — never a thrown request, never
 * a half-law.
 */
export async function readCadenceLaw(client: Pick<PrismaClient, 'systemConfig'>): Promise<CadenceLaw> {
  try {
    const rows = await client.systemConfig.findMany({
      where: { key: { in: [CADENCE_LAW_KEYS.freshDays, CADENCE_LAW_KEYS.windowDays] } },
      select: { key: true, value: true },
    });
    if (rows.length === 0) return { ...CADENCE_LAW_DEFAULTS };
    let freshDays: number | null = null;
    let windowDays: number | null = null;
    for (const row of rows) {
      const n = Number(row.value);
      if (row.key === CADENCE_LAW_KEYS.freshDays && inBand(n, CADENCE_LAW_BOUNDS.freshDays.min, CADENCE_LAW_BOUNDS.freshDays.max)) {
        freshDays = n;
      } else if (row.key === CADENCE_LAW_KEYS.windowDays && inBand(n, CADENCE_LAW_BOUNDS.windowDays.min, CADENCE_LAW_BOUNDS.windowDays.max)) {
        windowDays = n;
      }
    }
    // THE PAIR LAW: both keys must stand, and the pair must cohere —
    // otherwise the defaults speak (yesterday's law, whole).
    if (
      freshDays == null || windowDays == null ||
      freshDays >= windowDays
    ) return { ...CADENCE_LAW_DEFAULTS };
    return { freshDays, windowDays };
  } catch {
    // A law that cannot be read is not a law — the defaults keep the
    // floor walking (the reader never throws into a request).
    return { ...CADENCE_LAW_DEFAULTS };
  }
}
