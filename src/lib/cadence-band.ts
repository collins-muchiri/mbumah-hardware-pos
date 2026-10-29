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
//
// ── v2.246.0 THE AISLE'S TESTAMENT ──────────────────────────────────────
// The verdict voice moves here too (the anti-duplication law applied to
// the FINDINGS itself): the census's three families (exact slate /
// surplus emerald / shrinkage red) had lived as two copies (the map's
// inline verdict and the pick strip's local voice) — one home now, every
// face the same words, the same colours. And the single-aisle read
// grows `lastWalkUnits`: WHAT the aisle's latest window walk FOUND
// there, the categories wire's own law (the latest SPEAKING walk — a
// line with variance non-null; line-level attribution — the units its
// lines in THIS category landed; a perfect count speaks 0 — the shelf
// held; null when no window walk spoke — beyond/never/a silent window —
// the honest absence, never a hidden zero). THE READ CLASS: the band's
// one line read stays first; the testament adds TWO bounded reads, in
// the window only — the latest speaking line (findFirst) and that
// sheet's spoken units in the aisle (one aggregate). The fallback law
// holds per read: a band that fails is no band (null, as before); a
// testament that fails under a living band is silence (units null, the
// band keeps its truth).

import type { PrismaClient } from '@prisma/client';
import type { CadenceLaw } from '@/lib/cadence-law';

export type CadenceBand = 'fresh' | 'stale' | 'beyond' | 'never';

export interface CadenceBandHouse {
  chip: string;
  rail: string;
  bar: string | null;
  // v2.253.0 THE LEDGER'S LENS — the pressed face the lens rail wears
  // when its family is the view's answer (the rungs' own inversion law:
  // solid house colour, the words white on it). Additive — every caller
  // that reads chip/rail/bar renders byte-identical.
  pressed: string;
}

/** The four houses — the exact classes the variance map has spoken since v2.235.0. */
export function bandHouse(band: CadenceBand): CadenceBandHouse {
  if (band === 'fresh') return { chip: 'bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/30', rail: 'bg-emerald-500', bar: 'bg-emerald-500', pressed: 'bg-emerald-600 text-white ring-emerald-600 dark:bg-emerald-400 dark:text-emerald-950 dark:ring-emerald-400' };
  if (band === 'stale') return { chip: 'bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/30', rail: 'bg-amber-500', bar: 'bg-amber-500', pressed: 'bg-amber-600 text-white ring-amber-600 dark:bg-amber-400 dark:text-amber-950 dark:ring-amber-400' };
  if (band === 'beyond') return { chip: 'bg-orange-50 text-orange-700 ring-orange-200 dark:bg-orange-500/10 dark:text-orange-300 dark:ring-orange-500/30', rail: 'bg-orange-500', bar: 'bg-orange-400', pressed: 'bg-orange-600 text-white ring-orange-600 dark:bg-orange-400 dark:text-orange-950 dark:ring-orange-400' };
  return { chip: 'bg-slate-100 text-slate-600 ring-slate-200 dark:bg-slate-500/10 dark:text-slate-300 dark:ring-slate-500/30', rail: 'bg-slate-300 dark:bg-slate-600', bar: null, pressed: 'bg-slate-600 text-white ring-slate-600 dark:bg-slate-300 dark:text-slate-900 dark:ring-slate-300' };
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

/** The verdict voice's own shape — the words and the family colour. */
export interface FindingsVoice {
  text: string;
  cls: string;
}

/**
 * v2.246.0 THE FINDINGS VOICE — the census's own three families, ONE
 * home (this lib). exact = muted slate "the count held — 0 units",
 * surplus = emerald "+N units found", shrinkage = red "−N units found"
 * (the negative number renders its own minus). The map's verdict rows,
 * the pick strip's verdict line and the detail faces' testament lines
 * all speak through this — one law, every face the same words, the
 * same colours.
 */
export function findingsVoice(units: number): FindingsVoice {
  if (units === 0) return { text: 'the count held — 0 units', cls: 'text-slate-500 dark:text-slate-400' };
  if (units > 0) return { text: `+${units} units found`, cls: 'text-emerald-600 dark:text-emerald-400' };
  return { text: `${units} units found`, cls: 'text-red-600 dark:text-red-400' };
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
): Promise<{ band: CadenceBand; daysSince: number | null; lastWalkUnits: number | null } | null> {
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
    if (!closedAt) return { band: 'never', daysSince: null, lastWalkUnits: null };
    const windowStartMs = now.getTime() - law.windowDays * DAY_MS;
    if (closedAt.getTime() >= windowStartMs) {
      const daysSince = Math.max(0, Math.floor((now.getTime() - closedAt.getTime()) / DAY_MS));
      const band: CadenceBand = daysSince <= law.freshDays ? 'fresh' : 'stale';
      // v2.246.0 THE AISLE'S TESTAMENT — what the aisle's latest window
      // walk FOUND here, the categories wire's own law mirrored for one
      // aisle: the latest SPEAKING line in the window (a line with
      // variance non-null — a line the floor never counted stays
      // silent), then that sheet's spoken units in THIS category (the
      // aggregate rides the same product-category join the band read
      // uses — line-level attribution, the shelf's own truth). A
      // perfect count speaks 0 — the shelf held; no speaking walk in
      // the window → null (the honest absence, never a hidden zero).
      // Beyond/never never ask — their verdict is already the silence.
      const spoken = await client.stockTakeLine.findFirst({
        where: {
          product: { categoryId },
          variance: { not: null },
          stockTake: { status: 'CLOSED', closedAt: { gte: new Date(windowStartMs) } },
        },
        orderBy: { stockTake: { closedAt: 'desc' } },
        select: { stockTakeId: true },
      });
      let lastWalkUnits: number | null = null;
      if (spoken) {
        const agg = await client.stockTakeLine.aggregate({
          where: { stockTakeId: spoken.stockTakeId, product: { categoryId }, variance: { not: null } },
          _sum: { variance: true },
        });
        lastWalkUnits = agg._sum.variance == null ? null : Math.round(Number(agg._sum.variance) * 100) / 100;
      }
      return { band, daysSince, lastWalkUnits };
    }
    return { band: 'beyond', daysSince: null, lastWalkUnits: null };
  } catch {
    // A band that cannot be read is no band — the face wears the
    // silence (the name-only echo), never a guessed house.
    return null;
  }
}
