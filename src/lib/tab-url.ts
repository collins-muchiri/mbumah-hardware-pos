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

/**
 * The honest calendar-day law, PUBLIC since v2.318.0 — the first of the
 * honest-param laws this module now homes: the address-bar parser
 * (`parseInitialDateRange`), the API route's query door
 * (`/api/loyalty/transactions`, which used to hand a raw string to
 * `new Date()` and could answer a Prisma validation error on a garbage
 * param), and — since v2.321.0 — the door's integers too
 * (`parsePositiveIntParam` / `parseClampedIntParam` below). Shape must
 * be `YYYY-MM-DD` and the day must be REAL — see the
 * round-trip comment below; garbage, malformed, or impossible answers ''
 * (dropped, never a 500, never a stranded filter).
 */
export function honestDayKey(value: string | null): string {
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
 * v2.320.0 — read the ledger's page (`?page=`) with the never-strand
 * law the rest of this module speaks: the value must be a positive
 * integer (digits only — no sign, no decimal, no whitespace), and
 * anything missing, malformed, zero, or negative answers the fallback.
 * A page past the ledger's end is NOT refused here — the parser's law
 * is SHAPE, not existence (the ledger grows and shrinks between
 * bookmark and return; the wire answers its own pagination and the
 * desk's past-the-end face speaks). Collision-checked: no other reader
 * of `page` exists in the address-bar vocabulary — the fifth word after
 * view/type/from/to.
 */
export function parseInitialPage(search: string, fallback = 1): number {
  return parseInitialNamedPage(search, 'page', fallback);
}

/**
 * v2.324.0 — THE ROSTER'S OWN WORD: the same never-strand shape law,
 * param-NAMEd. The deep-link collision analysis (Task 44) showed two
 * desks reading the SAME `?page=` word leak across client-side tab
 * switches — loyalty's one-writer law keeps `page`, so a second desk
 * speaks a DESK-PREFIXED word (`po-page`) through THIS parser instead
 * of a copy. The law is unchanged: digits-only positive integer seeds,
 * anything missing/malformed/zero/negative answers the fallback, and a
 * page past the desk's end is the wire's honest empty (shape, not
 * existence). `parseInitialPage` delegates here — ONE home, two words.
 */
export function parseInitialNamedPage(search: string, param: string, fallback = 1): number {
  try {
    const raw = toParams(search).get(param);
    if (!raw || !/^\d+$/.test(raw)) return fallback;
    const page = parseInt(raw, 10);
    return page >= 1 ? page : fallback;
  } catch {
    return fallback;
  }
}

/**
 * v2.328.0 — THE ROSTER'S SECOND WORD: the MEMBERSHIP law, param-NAMEd.
 * The vocabulary's shape law has a named home (`parseInitialNamedPage`);
 * this is the same generalization for the membership law
 * `parseInitialLimit` speaks: the value must name a word the desk
 * ACTUALLY OFFERS — case-sensitive (a lowercase `pending_approval` is an
 * unknown word, not a clever match; the `?type=` honesty), and anything
 * missing, malformed, or unknown answers the fallback so a stale
 * bookmark can never strand the desk in a filter it does not offer.
 * The purchase-orders roster speaks it as its desk-prefixed `po-status`
 * (the Task 44 collision law's safe path — a desk-prefixed word can
 * never leak across client-side tab switches; collision-checked at
 * round start: the bare `?status=` word belongs to the /hr/performance
 * route, a different URL space, and no shell reader of `po-status`
 * exists). ONE home, many desks — the next desk's filter word inherits
 * the law instead of a copy. v2.329.0 — THE PROMISE KEPT: the inventory
 * lens speaks it as its desk-prefixed `inv-stock` (the same parser, zero
 * new bytes of law — the second desk to inherit the home).
 */
export function parseInitialNamedMember<V extends string>(
  search: string,
  param: string,
  validValues: readonly V[],
  fallback: V,
): V {
  try {
    const value = toParams(search).get(param);
    if (value && (validValues as readonly string[]).includes(value)) {
      return value as V;
    }
    return fallback;
  } catch {
    return fallback;
  }
}

/**
 * v2.321.0 — the page sizes the ledger's gait Select offers. ONE array,
 * read by the address-bar parser's membership law, the desk's Select, and
 * the API door's clamp ceiling (the wire's take never outgrows the
 * house's largest gait) — three doors, one vocabulary.
 */
export const LEDGER_PAGE_SIZES = [50, 100, 200] as const;

/**
 * v2.321.0 — read the ledger's page size (`?limit=`) with the same
 * never-strand law the rest of this module speaks — but a DIFFERENT
 * test than the page parser's: the law here is MEMBERSHIP, not shape.
 * The desk offers exactly the gaits LEDGER_PAGE_SIZES names, so the
 * address bar speaks the desk's words (the `?type=` honesty): digits
 * that name an offered gait seed the state; anything missing,
 * malformed, or BETWEEN the offered gaits answers the fallback —
 * 100, the gait the desk has walked since the ledger first spoke.
 * A gait the desk cannot offer must never ride the state.
 * Collision-checked at round start: no shell/address-bar reader of
 * `limit` exists in src/ (the API doors that read `limit` are server
 * routes, not the SPA's address bar) — the sixth word after
 * view/type/from/to/page.
 */
export function parseInitialLimit(search: string, fallback: number = 100): number {
  try {
    const raw = toParams(search).get('limit');
    if (!raw || !/^\d+$/.test(raw)) return fallback;
    const limit = parseInt(raw, 10);
    return (LEDGER_PAGE_SIZES as readonly number[]).includes(limit) ? limit : fallback;
  } catch {
    return fallback;
  }
}

/**
 * v2.321.0 — the API door's honest page integer, the same law the dates
 * at this door have spoken since v2.318: a raw `parseInt` rides NaN
 * straight into Prisma's `skip` and the route answers 500 on a garbage
 * param (live-proven this round: `?page=abc` → 500). Shape must be
 * digits; anything else, or a value under `min`, answers the fallback.
 * A page PAST the ledger's end is NOT clamped away — the wire answers
 * its own pagination and an honest empty page is a real answer (the
 * same shape-not-existence law `parseInitialPage` speaks).
 */
export function parsePositiveIntParam(raw: string | null, fallback: number, min = 1): number {
  if (!raw || !/^\d+$/.test(raw)) return fallback;
  const n = parseInt(raw, 10);
  return n >= min ? n : fallback;
}

/**
 * v2.321.0 — the API door's honest take. `limit` bounds a query, so the
 * door CLAMPS instead of refusing: digits name an intent, the intent is
 * served inside [min, max] — `?limit=500` answers 200 (the house's
 * largest gait), `?limit=0` answers 1, and a garbage value answers the
 * caller's default. The wire never takes more than the house offers,
 * and a garbage param is never a 500 again.
 */
export function parseClampedIntParam(raw: string | null, fallback: number, min: number, max: number): number {
  if (!raw || !/^\d+$/.test(raw)) return fallback;
  const n = parseInt(raw, 10);
  if (n < min) return min;
  if (n > max) return max;
  return n;
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

/**
 * v2.318.0 — the dismiss law: remove ONLY the named params from a search
 * string, preserving every other voice (`tab`, `view`, `type` ride
 * untouched — the exact mirror of `buildTabSearch`'s preserve law). The
 * ledger's clear-window chip speaks this: when the human dismisses the
 * date window, the address bar must stop claiming a window it no longer
 * has — a stale `?from=` that outlives the filter it named is a lie the
 * next refresh would resurrect. Malformed search answers the input's
 * fallback shape ('' when nothing survives); unknown names are a no-op.
 */
export function buildSearchWithoutParams(
  currentSearch: string,
  names: readonly string[],
): string {
  try {
    const params = toParams(currentSearch);
    for (const name of names) params.delete(name);
    const qs = params.toString();
    return qs ? `?${qs}` : '';
  } catch {
    return '';
  }
}
