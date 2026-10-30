// v2.280.0: the schedule's fire voice — the pure words the Schedules card
// speaks about its own appointment. Import-free (the client-bundle law): the
// card renders these; the tests pin them; the server never needs them.
//
// The house calendar law applies: day arithmetic is the UTC-midnight floor
// difference (a fire 25 hours from now lands "tomorrow", never "in 2 days"),
// the same rule the filing voice (digestFilingVoice, v2.278.0) obeys.

/** The UTC-midnight day key — the ONE floor, never a second math. */
export function utcDayKey(ms: number): number {
  return Math.floor(ms / 86_400_000);
}

/**
 * The appointment's relative voice, in whole calendar days.
 *  0  → "today"        (the fire's day key is THIS one)
 * +1  → "tomorrow"     (the fire's day key is the next one — 25h ahead is
 *                       tomorrow, never "in 2 days"; the floor law)
 * -1  → "yesterday"
 *  n  → "in N days" (n > 1) / "N days ago" (n < -1)
 * Malformed dates keep the honest absence: '' — never a guess.
 */
export function relativeFireLabel(iso: string, nowMs: number): string {
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return '';
  const days = utcDayKey(t) - utcDayKey(nowMs);
  if (days === 0) return 'today';
  if (days === 1) return 'tomorrow';
  if (days === -1) return 'yesterday';
  if (days > 1) return `in ${days} days`;
  if (days < -1) return `${-days} days ago`;
  return '';
}

/**
 * The imminent face: the fire lands today or tomorrow (calendar days, the
 * floor law). The card paints its dot the sky family's held tone then; the
 * quiet tone otherwise. A past or malformed instant is never imminent — the
 * cadence derives strictly forward.
 */
export function fireImminent(iso: string, nowMs: number): boolean {
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return false;
  const days = utcDayKey(t) - utcDayKey(nowMs);
  return days === 0 || days === 1;
}
