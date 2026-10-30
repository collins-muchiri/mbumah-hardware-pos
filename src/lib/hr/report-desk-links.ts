// MBUMAH HARDWARE POS - report-desk deep-link vocabulary (v2.287.0)
//
// PURE module — no client-boundary directive on purpose: both the schedule
// service (server) and the reports desk (client) import the constants, and
// such a directive here would turn the server-side value imports into client
// references (same constraint as src/lib/whats-new.ts).
//
// The CLIENT-SAFE half of the report-schedule vocabulary: the schedule
// report keys, their reports-desk tab landings, and the pure helpers the
// desk uses to light its unread-bell beacons. report-schedule-service.ts
//
// THE BEACON LAW (v2.287.0): a digest bell lands on a tab of the reports
// desk; while the visitor sits on a DIFFERENT tab, that landing tab's
// trigger wears the amber dot — the desk whispers where the unread walk
// goes, visible from across the desk. An unread bell is waiting for a
// reader, so its dot PULSES (a filter waiting on an unvisited face — the
// performance desk's v2.286.0 beacons — sits still; the two meanings stay
// distinguishable at a glance). Read or dismissed bells go dark: the dot
// answers "where is it?", never "have I read it?" — the bell feed itself
// is the accessible surface for unreadness (the badge already speaks).

/** The schedule report keys, verbatim from the schedule service's seam. */
export const HR_SCHEDULE_REPORTS = [
  'headcount',
  'employment-cost',
  'absence',
  'turnover',
  'time-to-hire',
  'statutory-liability',
  'leave-utilisation',
  'goal-attainment',
  // v2.283.0: the review pool's interactive home is the PERFORMANCE desk,
  // not the reports desk — but the desk itself is the honest target (its
  // ?tab= read lands below). The builder consults REPORT_KEY_TO_URL FIRST.
  'review-cycles',
] as const;

export type HrScheduleReportKey = (typeof HR_SCHEDULE_REPORTS)[number];

/** v2.24.0: schedule report keys -> /hr/reports deep-link tab ids (the UI
 *  shortens 'employment-cost' to 'cost' and 'time-to-hire' to 'tth'). */
export const REPORT_KEY_TO_TAB: Record<HrScheduleReportKey, string> = {
  headcount: 'headcount',
  'employment-cost': 'cost',
  absence: 'absence',
  turnover: 'turnover',
  'time-to-hire': 'tth',
  'statutory-liability': 'statutory',
  'leave-utilisation': 'leave',
  'goal-attainment': 'goals',
  // v2.283.0: the review pool's interactive home is the PERFORMANCE desk,
  // not the reports desk — but the desk itself is the honest target (its
  // ?tab= read lands below). The builder consults REPORT_KEY_TO_URL FIRST.
  'review-cycles': 'reviews',
};

/** v2.283.0: full-URL deep-link overrides, consulted before REPORT_KEY_TO_TAB.
 *  The cycles' desk lives at /hr/performance; the page reads ?tab= so the
 *  link walks the reader into the reviews tab, not just the desk. */
export const REPORT_KEY_TO_URL: Partial<Record<HrScheduleReportKey, string>> = {
  'review-cycles': '/hr/performance?tab=reviews',
  // v2.285.0: the goal pool's interactive home is the performance desk's
  // goals tab. The reports desk has NO 'goals' tab, so the TAB fallback
  // (/hr/reports?tab=goals) fell through the desk's known-tab read and
  // landed on headcount silently — a bell that walks nowhere. The override
  // is the honest landing: the bell walks where the pool actually lives.
  'goal-attainment': '/hr/performance?tab=goals',
};

/** The only path a digest walk can name to land on the reports desk. */
export const REPORTS_DESK_PATH = '/hr/reports';

/** The shape the beacon needs from a feed item — the composite
 *  /api/notifications feed is far bigger than this, so the helper reads
 *  the narrowest slice (the OD law applied to types: ask for less). */
export interface DigestBeaconItem {
  id: string;
  actionUrl?: string | null;
}

/**
 * v2.287.0: which reports-desk tab does ONE actionUrl walk to? The pure
 * half of the beacon. A walk lands on the desk only when the pathname is
 * EXACTLY /hr/reports (performance-pool bells walk /hr/performance — not
 * this desk, never this desk's beacons) and the tab word is present and
 * non-empty (a bare /hr/reports lands the desk's own default — the page
 * knows that default, this helper refuses to guess it). Absolute or
 * relative, both parse; garbage, other paths, empty words -> null.
 */
export function digestWalkTab(actionUrl: string | null | undefined): string | null {
  if (!actionUrl) return null;
  let url: URL;
  try {
    url = new URL(actionUrl, 'http://localhost');
  } catch {
    return null;
  }
  if (url.pathname !== REPORTS_DESK_PATH) return null;
  const tab = url.searchParams.get('tab');
  return tab && tab.length > 0 ? tab : null;
}

/**
 * v2.287.0: the set of reports-desk tab words an UNREAD, UNDISMISSED bell
 * walks to. The read/dismissed state is the SHARED external store the
 * notification center writes (mbt_read_notifications /
 * mbt_dismissed_notifications) — the same source the badge counts, so a
 * bell read in the feed goes dark on the desk in the same tick. Duplicate
 * bells on one tab collapse into one entry (a Set — the trigger asks
 * `has`, never "how many"). The raw tab word is returned VERBATIM: the
 * desk intersects it with its own known-tab list, so a drifted word lights
 * nothing (never a guess).
 */
export function digestBeaconTabs(
  items: readonly (DigestBeaconItem | null | undefined)[] | null | undefined,
  readIds: ReadonlySet<string>,
  dismissedIds: ReadonlySet<string>,
): ReadonlySet<string> {
  const tabs = new Set<string>();
  if (!items) return tabs;
  for (const item of items) {
    if (!item || typeof item.id !== 'string') continue;
    if (readIds.has(item.id) || dismissedIds.has(item.id)) continue;
    const tab = digestWalkTab(item.actionUrl);
    if (tab) tabs.add(tab);
  }
  return tabs;
}
