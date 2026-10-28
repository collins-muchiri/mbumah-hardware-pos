// ── v2.244.0 THE AISLE'S ECHO — the band's one home ─────────────────────
// The four band houses (fresh/stale/beyond/never) have spoken from the
// variance map since v2.235.0 as local closures; v2.241.0's anti-
// duplication law (one home, no second constant) now applies to the
// BAND ITSELF: the drill and the branch face wear the aisle's own band
// chip this round (the sheet's origin-aisle line learning WHEN its aisle
// was last heard), so the houses move here — one home, byte-identical
// classes, every face the same truth.
//
// THE BAND LAW (the semantics ride the kpi-summary's own computation —
// this lib never re-derives them for the map, it only serves the faces
// and the single-aisle read):
//   fresh  — heard ≤ freshDays ago (THE LAW'S OWN boundary)
//   stale  — heard inside the window, colder than fresh
//   beyond — counted before, but not inside this window
//   never  — no CLOSED sheet's lines have EVER touched the shelf
//
// THE ECHO LAW for `readCategoryBand`: one aisle, one read (the line
// whose product's CURRENT category is the aisle, the latest CLOSED
// sheet), the same four voices the map speaks — a reader that fails
// returns null and the face wears the silence (the fallback law: never
// a thrown request, never a guessed band). `daysSince` rides ONLY the
// in-window voices (fresh/stale) — a beyond aisle's last close is older
// than the window it would be measured against, so the honest number is
// the absence (null), exactly the kpi's own shape; never has no date at
// all.

import type { PrismaClient } from '@prisma/client';
import type { CadenceLaw } from '@/lib/cadence-law';

export type CadenceBand = 'fresh' | 'stale' | 'beyond' | 'never';

export interface CadenceBandHouse {
  chip: string;
  rail: string;
  bar: string | null;
}

/** The four houses — the exact classes the variance map has spoken since v2.235.0. */
export function bandHouse(band: CadenceBand): CadenceBandHouse {
  if (band === 'fresh') return { chip: 'bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/30', rail: 'bg-emerald-500', bar: 'bg-emerald-500' };
  if (band === 'stale') return { chip: 'bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/30', rail: 'bg-amber-500', bar: 'bg-amber-500' };
  if (band === 'beyond') return { chip: 'bg-orange-50 text-orange-700 ring-orange-200 dark:bg-orange-500/10 dark:text-orange-300 dark:ring-orange-500/30', rail: 'bg-orange-500', bar: 'bg-orange-400' };
  return { chip: 'bg-slate-100 text-slate-600 ring-slate-200 dark:bg-slate-500/10 dark:text-slate-300 dark:ring-slate-500/30', rail: 'bg-slate-300 dark:bg-slate-600', bar: null };
}

/** The band's voice — the human line the chips' titles and the rows' aria speak. */
export function daysVoice(c: { band: CadenceBand; daysSince: number | null }): string {
  if (c.band === 'never') return 'never heard';
  if (c.band === 'beyond') return 'last heard beyond the window';
  if (c.daysSince == null) return '—';
  if (c.daysSince === 0) return 'counted today';
  if (c.daysSince === 1) return '1 day ago';
  return `${c.daysSince} days ago`;
}

/** The chip's own label — `never` stays a word; the others speak themselves. */
export function chipLabel(band: string): string {
  return band === 'never' ? 'never' : band;
}

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * ONE aisle's band, read the map's way: the latest CLOSED sheet whose
 * lines touched a product currently living on this aisle. Two honest
 * edges — a CLOSED sheet always closes with a date (the close writes
 * it; the not-null filter keeps the ordering unambiguous across both
 * providers), and a read that fails returns null (the fallback law).
 * The caller supplies the stored law (readCadenceLaw) — this reader
 * never reads the config twice.
 */
export async function readCategoryBand(
  client: Pick<PrismaClient, 'stockTakeLine'>,
  categoryId: string,
  law: CadenceLaw,
  now: Date,
): Promise<{ band: CadenceBand; daysSince: number | null } | null> {
  try {
    const last = await client.stockTakeLine.findFirst({
      where: {
        product: { categoryId },
        stockTake: { status: 'CLOSED', closedAt: { not: null } },
      },
      orderBy: { stockTake: { closedAt: 'desc' } },
      select: { stockTake: { select: { closedAt: true } } },
    });
    const closedAt = last?.stockTake.closedAt ?? null;
    if (!closedAt) return { band: 'never', daysSince: null };
    const windowStartMs = now.getTime() - law.windowDays * DAY_MS;
    if (closedAt.getTime() >= windowStartMs) {
      const daysSince = Math.max(0, Math.floor((now.getTime() - closedAt.getTime()) / DAY_MS));
      return { band: daysSince <= law.freshDays ? 'fresh' : 'stale', daysSince };
    }
    return { band: 'beyond', daysSince: null };
  } catch {
    // A band that cannot be read is no band — the face wears the
    // silence (the name-only echo), never a guessed house.
    return null;
  }
}
