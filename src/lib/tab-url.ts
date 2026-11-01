/**
 * v2.311.0 — the shell answers the address bar.
 *
 * The SPA's active desk has lived ONLY in the zustand store (persisted to
 * localStorage) since v2.16.0 — which meant a desk could not be
 * deep-linked, bookmarked, or reached by QA tooling without clicking
 * through the sidebar (nav ref ambiguity was a real QA cost in v2.310's
 * browser bursts). This module is the pure half of the fix: parse and
 * build the `?tab=` / `?view=` query the shell now speaks. The write half
 * (history.replaceState on tab change) lives in main-app.tsx; the read
 * half for the loyalty desk's sub-tabs rides the same vocabulary
 * (`?view=transactions`), and since v2.316.0 the ledger's type filter
 * answers `?type=EXPIRE` — the param the org console's sweep line
 * deep-links to, so the pulse's amber counts walk straight to the rows
 * they summarize.
 *
 * Pure string functions — no window access — so they pin and test without
 * a browser.
 */

import type { AppTab } from '@/lib/stores';

/** Normalize a search string ("", "?a=b", "a=b") to a URLSearchParams. */
function toParams(search: string): URLSearchParams {
  const raw = search.startsWith('?') ? search.slice(1) : search;
  return new URLSearchParams(raw);
}

/**
 * Read the tab the URL asks for. Returns a REAL tab id only when the
 * param names a tab the shell actually renders (TAB_LOADERS keys) —
 * unknown or missing values answer null and the shell keeps its own
 * (persisted) tab. A malformed search string answers null, never throws.
 */
export function parseInitialTab(
  search: string,
  validTabs: readonly string[],
): AppTab | null {
  try {
    const tab = toParams(search).get('tab');
    if (!tab) return null;
    return (validTabs as readonly string[]).includes(tab) ? (tab as AppTab) : null;
  } catch {
    return null;
  }
}

/**
 * Read a sub-view param (`?view=`) with a validated fallback. The loyalty
 * desk's four sub-tabs speak this; an unknown or missing value answers
 * the fallback so a stale bookmark can never strand the desk.
 */
export function parseInitialView<V extends string>(
  search: string,
  validViews: readonly V[],
  fallback: V,
): V {
  try {
    const view = toParams(search).get('view');
    if (view && (validViews as readonly string[]).includes(view)) return view as V;
    return fallback;
  } catch {
    return fallback;
  }
}

/**
 * v2.316.0 — read a filter-type param (`?type=`) with a validated
 * fallback. The loyalty ledger's type filter speaks this: a sweep-line
 * link lands on the desk with the EXPIRE filter already chosen, and an
 * unknown, missing, or malformed value answers the fallback so a stale
 * bookmark can never strand the ledger in a filter it does not offer.
 * Case-sensitive BY LAW — the ledger's own Select offers exactly the
 * uppercase types, and a lowercase `expire` is an unknown value, not a
 * clever match (the same honesty the view parser speaks).
 */
export function parseInitialType<V extends string>(
  search: string,
  validTypes: readonly V[],
  fallback: V,
): V {
  try {
    const type = toParams(search).get('type');
    if (type && (validTypes as readonly string[]).includes(type)) return type as V;
    return fallback;
  } catch {
    return fallback;
  }
}

/** The shape the ledger's date inputs speak: 'YYYY-MM-DD' or '' (no window). */
export interface InitialDateRange {
  from: string;
  to: string;
}

/** The exact shape a date input accepts and the ledger's query sends. */
const DAY_KEY_RE = /^\d{4}-\d{2}-\d{2}$/;

function honestDayKey(value: string | null): string {
  if (!value || !DAY_KEY_RE.test(value)) return '';
  // a REAL calendar day only, proven by round-trip: V8's ISO parser is
  // LENIENT with day overflow (2026-02-30 parses through to 2026-03-02,
  // only 2026-13-01 lands NaN), so the parsed day must re-format to the
  // exact bytes it came from — an impossible date answers ''.
  const parsed = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) return '';
  const y = parsed.getUTCFullYear();
  const m = String(parsed.getUTCMonth() + 1).padStart(2, '0');
  const d = String(parsed.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}` === value ? value : '';
}

/**
 * v2.317.0 — read the ledger's date window (`?from=` / `?to=`) with the
 * never-strand law the rest of this module speaks: each param is
 * validated INDEPENDENTLY (a real `?from=` with a garbage `?to=` keeps
 * the from and drops only the to), and anything missing, malformed, or
 * not a real calendar day answers '' — no window, never a stranded
 * filter. The desk seeds its two date inputs from this; the sweep
 * line's counts door builds its window with `eatDayKey`.
 */
export function parseInitialDateRange(search: string): InitialDateRange {
  try {
    const params = toParams(search);
    return { from: honestDayKey(params.get('from')), to: honestDayKey(params.get('to')) };
  } catch {
    return { from: '', to: '' };
  }
}

/**
 * The EAT (UTC+3, the formatEatStamp convention) calendar day of a
 * timestamp, as a URL-safe `YYYY-MM-DD` key — the day a sweep's counts
 * door names so the ledger's window opens on exactly the rows that
 * sweep wrote. A garbage timestamp answers '' (the caller falls back
 * to the type-only door — never a broken link).
 */
export function eatDayKey(iso: string): string {
  const at = new Date(iso);
  if (Number.isNaN(at.getTime())) return '';
  const eat = new Date(at.getTime() + 3 * 60 * 60 * 1000);
  const y = eat.getUTCFullYear();
  const m = String(eat.getUTCMonth() + 1).padStart(2, '0');
  const d = String(eat.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Write a tab into a search string WITHOUT losing the other params (the
 * loyalty desk's `view` rides along). Always answers with a leading `?`
 * (or an empty string when handed an empty result — not currently
 * reachable since `tab` is always set).
 */
export function buildTabSearch(currentSearch: string, tab: string): string {
  try {
    const params = toParams(currentSearch);
    params.set('tab', tab);
    const qs = params.toString();
    return qs ? `?${qs}` : '';
  } catch {
    return `?tab=${encodeURIComponent(tab)}`;
  }
}
