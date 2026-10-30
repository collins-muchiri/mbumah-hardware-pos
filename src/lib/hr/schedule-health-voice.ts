// MBUMAH HARDWARE POS - the schedule's delivery-health voice (v2.281.0)
//
// The card spoke only its LAST send (lastStatus on the row) and the v2.25
// delivery dots stayed lazy — hidden behind the history panel's fetch. An
// operator scanning the schedules list could not see "3 of the last 5 sends
// failed" without opening every card. This file is the LIST's own pure
// voice: it turns NotificationLog rows (correlated per schedule through
// metadata.scheduleId) into an always-on health face — counts, per-send
// entries and ONE spoken line.
//
// Laws this file keeps:
//   • Import-free (the client-bundle law — the tab imports the TYPES only).
//   • The partial law: a SENT log that carries an error delivered only some
//     of its recipients — "partial", never "sent". PENDING (and any word
//     this file does not know) is unresolved — the benefit of the doubt,
//     never a verdict.
//   • Colour never means two things: partial wears amber, pending wears
//     slate — the v2.25 map gave both the same amber, and that collision
//     retires with this file.
//   • Honest absence: a schedule with no recorded sends aggregates to null
//     (the face stays silent — a never-sent schedule is not "0 delivered").

export type ScheduleSendOutcome = 'delivered' | 'partial' | 'failed' | 'pending';

/** The strip counts the last N recorded sends of a schedule. */
export const HEALTH_WINDOW = 5;

/**
 * The log fetch is bounded: 50 schedules × the 5-send window is the exact
 * need; the cap keeps the one-query list read cheap no matter how the
 * organisation grows.
 */
export const HEALTH_LOG_CAP = 250;

/** One NotificationLog row, flattened for the voice (pre-parsed scheduleId). */
export interface ScheduleHealthLog {
  scheduleId: string | null;
  status: string;
  error: string | null;
  createdAt: string; // ISO — the pure sort key (UTC strings order lexicographically)
}

export interface ScheduleHealthEntry {
  outcome: ScheduleSendOutcome;
  createdAt: string;
}

export interface ScheduleHealth {
  /** Sends actually counted (≤ window). The voice speaks THIS number. */
  window: number;
  delivered: number;
  partial: number;
  failed: number;
  pending: number;
  /** Newest first — the voice's own order; the UI renders oldest-left. */
  entries: ScheduleHealthEntry[];
  /** The ONE line the card speaks ("4 delivered · 1 failed across the last 5 sends"). */
  voice: string;
}

/**
 * The ONE derivation of a log row's verdict. SENT + error = partial (the
 * batch reached only some recipients); SENT alone = delivered; FAILED =
 * failed; PENDING — or any word the log vocabulary grows later — stays
 * pending: an unresolved row is not a verdict, and the strip never guesses.
 */
export function deriveSendOutcome(status: string, hasError: boolean): ScheduleSendOutcome {
  if (status === 'SENT') return hasError ? 'partial' : 'delivered';
  if (status === 'FAILED') return 'failed';
  return 'pending';
}

/**
 * The ONE parse of a digest log's metadata → scheduleId. The history panel
 * correlates through the same `"scheduleId":"<id>"` stamp the sender writes;
 * here the JSON is parsed once and honestly (malformed / non-object / absent
 * → null — the row simply does not belong to any schedule).
 */
export function scheduleIdFromMetadata(metadata: string | null): string | null {
  if (!metadata) return null;
  try {
    const parsed = JSON.parse(metadata) as unknown;
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      const id = (parsed as Record<string, unknown>).scheduleId;
      return typeof id === 'string' && id.length > 0 ? id : null;
    }
  } catch {
    // malformed metadata — the honest absence
  }
  return null;
}

/**
 * The voice's grammar, spoken from counts it is handed. Only non-zero parts
 * speak, in the order delivered → partial → failed → pending, then the
 * window's tail ("across the last 5 sends" — singular keeps its plain
 * form). A zero window speaks nothing.
 */
export function scheduleHealthVoice(
  counts: { delivered: number; partial: number; failed: number; pending: number },
  window: number,
): string {
  if (window <= 0) return '';
  const parts: string[] = [];
  if (counts.delivered > 0) parts.push(`${counts.delivered} delivered`);
  if (counts.partial > 0) parts.push(`${counts.partial} partial`);
  if (counts.failed > 0) parts.push(`${counts.failed} failed`);
  if (counts.pending > 0) parts.push(`${counts.pending} pending`);
  const tail = window === 1 ? 'across the last send' : `across the last ${window} sends`;
  return parts.length > 0 ? `${parts.join(' · ')} ${tail}` : tail;
}

/**
 * Aggregate one schedule's health from its log rows (already flattened and
 * pre-parsed — the service does the one db read and the one metadata parse;
 * this function stays pure). Sorts by createdAt newest-first (the voice's
 * order), counts over the window, and keeps the honest absence: no rows →
 * null (the face never dresses an empty ledger as a zero).
 */
export function aggregateScheduleHealth(
  logs: readonly ScheduleHealthLog[],
  scheduleId: string,
  windowSize: number = HEALTH_WINDOW,
): ScheduleHealth | null {
  if (windowSize <= 0) return null;
  const rows = logs
    .filter((l) => l.scheduleId === scheduleId)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : a.createdAt > b.createdAt ? -1 : 0))
    .slice(0, Math.trunc(windowSize));
  if (rows.length === 0) return null;
  const entries = rows.map((l) => ({
    outcome: deriveSendOutcome(l.status, Boolean(l.error)),
    createdAt: l.createdAt,
  }));
  const counts = { delivered: 0, partial: 0, failed: 0, pending: 0 };
  for (const e of entries) counts[e.outcome] += 1;
  return {
    window: entries.length,
    ...counts,
    entries,
    voice: scheduleHealthVoice(counts, entries.length),
  };
}
