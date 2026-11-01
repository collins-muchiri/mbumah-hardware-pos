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
