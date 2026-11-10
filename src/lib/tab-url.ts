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
 * v2.369.0 — THE BARE-WORD ISLAND COMES HOME. The loyalty desk's five
 * remaining pre-constitution params — the bare `view`, `from`, `to`,
 * `page`, `limit` (the island that predates the naming constitution, its
 * `type` having moved in v2.368.0) — move to their desk-prefixed
 * canonical words `ly-view` / `ly-from` / `ly-to` / `ly-page` /
 * `ly-limit` through the same sunset law the type word wrote: each
 * shape of the vocabulary gained an alias parser below (the stage
 * parser, the date range, the page, the limit), each ONE home, and in
 * every one the canonical word WINS when both are present — an explicit
 * desk-prefix outranks the bare survivor, and a canonical PRESENCE (any
 * value, even garbage) silences the alias so one address bar can never
 * tell the desk two different words. The bare words keep answering for
 * the bookmarks already in the wild; the in-repo speakers moved this
 * round (the sweep line's counts door, the login desk-ask).
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
 * v2.369.0 — THE BARE-WORD ISLAND COMES HOME: the date range's alias
 * form. The loyalty desk's window answers its desk-prefixed canonical
 * words `ly-from` / `ly-to` first, and the bare `from` / `to` keep
 * answering as LEGACY ALIASES (the bookmarks already in the wild — the
 * sunset law the type word wrote in v2.368.0, worn by the window now).
 * Each side validates INDEPENDENTLY exactly as before (a real canonical
 * from with a garbage alias to keeps the from and drops the to), and
 * the canonical PRESENCE silences the alias PER SIDE: `?ly-from=` (even
 * empty) stops the bare `from` from speaking that side, while the other
 * side's alias still answers — one address bar, one word per side.
 */
export function parseInitialDateRangeWithAlias(
  search: string,
  canonicalFrom: string,
  canonicalTo: string,
  legacyFrom: string,
  legacyTo: string,
): InitialDateRange {
  try {
    const params = toParams(search);
    const rawFrom = params.get(canonicalFrom) !== null ? params.get(canonicalFrom) : params.get(legacyFrom);
    const rawTo = params.get(canonicalTo) !== null ? params.get(canonicalTo) : params.get(legacyTo);
    return { from: honestDayKey(rawFrom), to: honestDayKey(rawTo) };
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
 * v2.483.0 — THE FAMILY'S THIRTY-SEVENTH WORD (the pair): the custom
 * range's own dates answer the bar. The reports desk's custom face —
 * the scratch the v2.482 verse left honest ("its honest share needs
 * its dates") — now speaks its WHOLE word: `?rep-range=custom` rides
 * with the desk-prefixed day pair `rep-from` / `rep-to` (the wire's
 * own YYYY-MM-DD class, REAL calendar days only — honestDayKey's
 * round-trip proof; a made-up date is an unknown word, not a clever
 * match). THE COLLISION LESSON, TOLD BY THE CHECK: the bare `from` /
 * `to` were TAKEN — the loyalty ledger's legacy window aliases (the
 * v2.369 sunset law) and the v2.317 ledger window read them — so the
 * pair wears the desk's own prefix, the family's oldest law. THE PAIR
 * IS THE WORD'S OTHER HALF: custom lands ONLY when both its days ride
 * (a bare custom stays the honest absence — the default's silence,
 * the unknown-word law's own reading), each side validates
 * INDEPENDENTLY through the ONE home's own validator (a real from
 * with a garbage to keeps nothing — the pair speaks WHOLE or not at
 * all), and the landed pair wears the range's own violet chip — the
 * constitution's FIRST shared family (two words, one chip). THE DATES
 * WRITE BACK: every scratched day replaceState's the pair (the
 * window's own write shape), so the custom face is a shareable
 * address, never a dead end.
 *
 * v2.485.0 — THE FAMILY'S FORTY-FIRST WORD (the ledger's period): the
 * financial desk's window answers the bar. The desk's FIRST daily
 * question, "which days am I reading?" — spoken through the period
 * presets and the two day scratches since the desk's birth — now
 * rides its desk-prefixed word `fin-range` (`?fin-range=<preset>` on
 * the wire): the desk's OWN
 * spellings (`today` / `week` / `month` / `quarter` / `year` — the
 * tuple the desk keeps, read through the named-member parser; a
 * made-up range is an unknown word, not a clever match), and the
 * custom face speaks WHOLE or not at all: `fin-range=custom` rides
 * with the desk-prefixed day pair `fin-from` / `fin-to` through THIS
 * parser (the pair's own law — custom lands ONLY when both its days
 * ride, a bare custom stays the honest absence, the default's
 * silence). THE COLLISION CHECK ran at round start: both bytes
 * appeared NOWHERE before this word (the desk's DOM ids say
 * `rep-from`/`rep-to` on another desk — another namespace, another
 * route, never the address bar). THE FAMILY'S SIXTEENTH 300-STOREY
 * BYTE: the landing chip wears the GREEN byte — the loyalty desk's
 * hue at the 200/50 storey (the ly-type chip's own family) speaking
 * through a storey it never spoke — the shade-split law's next form;
 * green LEFT the stranger list (the exact green 300-trio census was
 * machine-kept). THE SECOND SHELL-TAB DESK: the landing is read once
 * on the shell (the useState initializer law — the shell tolerates
 * the default-first render, the v2.484 lesson's own exception). THE
 * PERIOD WRITES BACK: every preset turn replaceState's its word, the
 * default strips its key, and every scratched day replaceState's the
 * pair — a turned period is a shareable address, never a dead end.
 */
export function parseInitialCustomRange(
  search: string,
  rangeKey: string,
  rangeValue: string,
  fromKey: string,
  toKey: string,
): { from: string; to: string } | null {
  try {
    const params = toParams(search);
    if (params.get(rangeKey) !== rangeValue) return null;
    const from = honestDayKey(params.get(fromKey));
    const to = honestDayKey(params.get(toKey));
    if (!from || !to) return null;
    return { from, to };
  } catch {
    return null;
  }
}

/**
 * v2.484.0 — THE FAMILY'S THIRTY-NINTH WORD (the window): the people
 * desk's period answers the bar. The HR reports desk's date window —
 * the desk's FIRST daily question, "which days am I reading?" — has
 * spoken its own scratch since v2.20.0 and never its address word;
 * the window's two sides now ride their desk-prefixed pair
 * `hr-from` / `hr-to` (the wire's own YYYY-MM-DD class, REAL calendar
 * days only — honestDayKey's round-trip proof; a made-up date is an
 * unknown word, not a clever match). THE WINDOW'S OWN LAW (the
 * v2.317 never-strand reading, grown to a named pair): each side
 * validates INDEPENDENTLY — a real from with a garbage to keeps the
 * from and drops only the to (a window is two sides, not one word's
 * other half — the rep pair's WHOLE law is the pair's own, the
 * window's is this). THE COLLISION CHECK ran at round start: the byte
 * appeared NOWHERE before this word (the desk's DOM ids say
 * `rep-from`/`rep-to` — another namespace, another route, never the
 * address bar). THE FAMILY'S FIFTEENTH 300-STOREY BYTE: the landing
 * chip wears the BLUE byte — the transfers desk's hue at the 200/50
 * storey (the transfer-status chip's own family) speaking through a
 * storey it never spoke — the shade-split law's next form; blue LEFT
 * the stranger list (the exact blue 300-trio census was machine-kept).
 * THE CHIP LIVES ON THE DESK'S OWN TOOLBAR ROW (beside the window it
 * names, never inside a section) and the landing is read once on the
 * shell (the useState initializer law). THE WINDOW WRITES BACK: every
 * scratched side replaceState's its byte (the window's own write
 * shape), so a turned window is a shareable address, never a dead
 * end; a blocked write is the window's silence, never a thrown desk.
 * THE DEFAULT WEARS NO WORD: a landing without the bytes reads the
 * desk's own defaults (the year's first day and today) — the
 * address's silence, never a stranded filter.
 */
export function parseInitialNamedDateRange(search: string, fromKey: string, toKey: string): { from: string; to: string } {
  try {
    const params = toParams(search);
    return { from: honestDayKey(params.get(fromKey)), to: honestDayKey(params.get(toKey)) };
  } catch {
    return { from: '', to: '' };
  }
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
 * v2.369.0 — THE BARE-WORD ISLAND COMES HOME: the pager's alias form.
 * The loyalty desk's page answers its desk-prefixed canonical word
 * `ly-page` first, and the bare `page` keeps answering as a LEGACY
 * ALIAS (the bookmarks already in the wild). The shape law lives in
 * ONE home — `parseInitialNamedPage`, delegated to by presence: when
 * the canonical word is present (any value, even garbage) the alias is
 * SILENCED and the canonical's own law decides; only when the canonical
 * is absent does the bare word speak. One address bar can never tell
 * the pager two different pages.
 */
export function parseInitialPageWithAlias(
  search: string,
  canonical: string,
  legacyAlias: string,
  fallback = 1,
): number {
  try {
    const params = toParams(search);
    if (params.get(canonical) !== null) return parseInitialNamedPage(search, canonical, fallback);
    return parseInitialNamedPage(search, legacyAlias, fallback);
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
 * v2.330.0 — THE PROMISE KEPT, THE THIRD DESK: the customers desk's debt
 * lens speaks it as its desk-prefixed `cust-debt` (the same parser, zero
 * new bytes of law, again — the third desk to inherit the home).
 * v2.331.0 — THE PROMISE KEPT, THE FOURTH DESK: the suppliers desk's
 * active lens speaks it as its desk-prefixed `sup-status` (the same
 * parser, zero new bytes of law, again — the fourth desk to inherit
 * the home).
 * v2.332.0 — THE PROMISE KEPT, THE FIFTH WORD: the suppliers desk's
 * purchase-order lens speaks it as its desk-prefixed `sup-po` (the same
 * parser, zero new bytes of law, again — one desk now owning TWO words
 * of the vocabulary, one per lens).
 * v2.333.0 — THE PROMISE KEPT, THE SIXTH WORD: the transactions desk's
 * payment-method lens speaks it as its desk-prefixed `txn-pay` (the same
 * parser, zero new bytes of law, again — the QUICK-CHIPS desk inherits;
 * the chip hand-off is now proven on a Select face AND a chip face).
 * v2.354.0 — THE PROMISE KEPT, THE SEVENTH WORD: the transactions desk's
 * type lens speaks it as its desk-prefixed `txn-type` (the same parser,
 * zero new bytes of law, again — one desk now owning TWO words of the
 * vocabulary, one per lens; the census voice keeps its sky, the landing
 * chip wears the seventh family, fuchsia).
 * v2.355.0 — THE PROMISE KEPT, THE EIGHTH WORD: the rentals desk's status
 * lens speaks it as its desk-prefixed `rent-status` (the same parser,
 * zero new bytes of law, again — the desk's DAILY QUESTION becomes a
 * bookmark; the lens's words are UPPERCASE like the payment word's, and
 * the landing chip wears the eighth family, orange — the overdue-warning
 * hue).
 * v2.356.0 — THE PROMISE KEPT, THE NINTH WORD: the invoices desk's status
 * lens speaks it as its desk-prefixed `inv-status` (the same parser,
 * zero new bytes of law, again — the invoicing pipeline's stage, DRAFT
 * through EXPIRED, is now an address; UPPERCASE words, and the landing
 * chip wears the ninth family, teal — the pipeline hue).
 * v2.357.0 — THE PROMISE KEPT, THE TENTH WORD: the transfers desk's
 * status lens speaks it as its desk-prefixed `transfer-status` (the same
 * parser, zero new bytes of law, again — the stock's journey between
 * stores is now an address; UPPERCASE words, the landing chip wears the
 * tenth family, blue — the logistics hue — and the desk's own counting
 * lens voice keeps its emerald beside it).
 * v2.358.0 — THE PROMISE KEPT, THE ELEVENTH WORD: the gift cards desk's
 * status lens speaks it as its desk-prefixed `gc-status` (the same
 * parser, zero new bytes of law, again — the card's life from issue to
 * redemption is now an address; UPPERCASE words, and the landing chip
 * wears the eleventh family, lime — the redemption hue the desk had not
 * spoken; the NEUTRAL is capitalized here, the desk's own all-lens
 * spelling, the first const in the family to carry an UPPERCASE
 * neutral).
 * v2.359.0 — THE PROMISE KEPT, THE TWELFTH WORD: the delivery notes
 * desk's status lens speaks it as its desk-prefixed `dn-status` (the
 * same parser, zero new bytes of law, again — the note's road from
 * Pending through In Transit to Delivered is now an address; UPPERCASE
 * words, the landing chip wears the twelfth family, sky — the open-road
 * hue the desk had not spoken — and the NEUTRAL is lowercase here, the
 * desk's own all-lens spelling, so an UPPERCASE spelling of it is an
 * unknown word).
 * v2.360.0 — THE PROMISE KEPT, THE THIRTEENTH WORD: the vouchers desk's
 * status lens speaks it as its desk-prefixed `vc-status` (the same
 * parser, zero new bytes of law, again — the voucher's life from issue
 * through pause to expiry is now an address; UPPERCASE words, the
 * landing chip wears the thirteenth family, pink — the promo hue the
 * desk had not spoken — and the NEUTRAL is lowercase here, the desk's
 * own all-lens spelling; the desk's campaign lens keeps its own Select,
 * untouched, and may earn its own word someday).
 * v2.361.0 — THE PROMISE KEPT, THE FOURTEENTH WORD: the credits desk's
 * type lens speaks it as its desk-prefixed `cr-type` (the same parser,
 * zero new bytes of law, again — the ledger's types from Credit through
 * Debit and Adjustment to Refund are now an address; UPPERCASE words,
 * the landing chip wears the fourteenth family, yellow — the ledger hue
 * the desk had not spoken — and the NEUTRAL is lowercase here, the
 * desk's own all-lens spelling; the desk's customer lens keeps its own
 * Select, untouched, and may earn its own word someday).
 * v2.362.0 — THE PROMISE KEPT, THE FIFTEENTH WORD: the payroll desk's
 * roster status lens speaks it as its desk-prefixed `pr-status` (the
 * same parser, zero new bytes of law, again — the workforce's standing
 * from Active through On Leave to Terminated is now an address;
 * UPPERCASE words, the landing chip wears the fifteenth family, stone —
 * the quarry hue the desk had not spoken — and the NEUTRAL is
 * CAPITALIZED here, the desk's own all-lens spelling, the gift cards
 * desk's voice; the lens rides the desk's DEFAULT sub-tab, the survey
 * law's first amended case — the chip is visible on landing, and a
 * non-default sub-tab lens stays blocked).
 * v2.363.0 — THE PROMISE KEPT, THE SIXTEENTH WORD: the conversations
 * desk's thread-list type lens speaks it as its desk-prefixed `cv-type`
 * (the same parser, zero new bytes of law, again — the threads' kind
 * from Internal to Customer Support is now an address; UPPERCASE words,
 * the landing chip wears the sixteenth family, slate — the thread hue
 * the desk had not spoken — and the NEUTRAL is lowercase here, the
 * desk's own all-lens spelling; the lens lives in the top-level split
 * view's always-visible list pane, no sub-tabs on this desk, and the
 * desk's query already carried the lens in both its key and its params).
 * v2.364.0 — THE PROMISE KEPT, THE SEVENTEENTH WORD: the catalog desk's
 * stock lens speaks it as its desk-prefixed `cat-stock` (the same
 * parser, zero new bytes of law, again — the shop floor's shelves from
 * In Stock through Low to Out are now an address; LOWERCASE words, the
 * lens's own spellings since the desk first shipped, and the landing
 * chip wears the seventeenth family, purple — the catalog's plum, the
 * paint-deck hue the desk had not spoken — with the NEUTRAL lowercase
 * here, the desk's own all-lens spelling; the lens rides the desk's
 * collapsible filters panel, and THE COLLAPSIBLE-FACE AMENDMENT makes
 * the landing raise the panel it lands into — the chip is visible on
 * landing, the survey law's second amended case).
 * v2.365.0 — THE PROMISE KEPT, THE EIGHTEENTH WORD: the debt-plans desk's
 * status lens speaks it as its desk-prefixed `dp-status` (the same
 * parser, zero new bytes of law, again — the repayment desk's daily
 * question, from Pending Approval through Overdue to Completed, is now
 * an address; LOWERCASE words, the filter chips' own keys, and the
 * landing chip wears the eighteenth family, zinc — the galvanized hue,
 * the coating on this yard's steel — with the NEUTRAL lowercase here,
 * the desk's own all-chip spelling; the lens's control is a BUTTON
 * GROUP, the family's first non-Select control face — the chooser is
 * the group's onClick, the law's intent unchanged, and the lens is
 * always rendered on the desk's top-level pane, the always-visible face
 * without an amendment).
 * v2.366.0 — THE PROMISE KEPT, THE NINETEENTH WORD: the admin desk's audit
 * severity lens speaks it as its desk-prefixed `ad-severity` (the same
 * parser, zero new bytes of law, again — the owner's morning question,
 * "anything critical overnight?", is now an address; UPPERCASE words, the
 * severity Select's own spellings, and the landing chip wears the
 * nineteenth family, neutral — the unbiased record's voice, an audit
 * speaks no colour; the lens is always rendered on the desk's top-level
 * pane, the always-visible face without an amendment).
 * v2.367.0 — THE PROMISE KEPT, THE TWENTIETH WORD: the security desk's
 * event-type lens speaks it as its desk-prefixed `sec-type` (the same
 * parser, zero new bytes of law, again — the owner's morning question,
 * "was anyone banging on the door last night?", is now an address; the
 * vocabulary's LONGEST lens, nine words, the event wire's own UPPERCASE
 * keys, and the landing chip wears the twentieth family, gray — the
 * watchtower's own shadow, the palette-exhaustion amendment; the lens
 * rides the desk's collapsible filters panel and the landing raises the
 * panel it lands into, the collapsible-face amendment's second
 * application).
 *
 * v2.368.0 — THE PROMISE KEPT, THE TWENTY-FIRST WORD: the loyalty
 * ledger's type lens — the family's OLDEST speaker, answering the bare
 * pre-constitution `type` since v2.316.0 — moves to its desk-prefixed
 * `ly-type` through the ALIAS parser below (THE LEGACY-WORD SUNSET
 * LAW's first written form: canonical wins, the bare word keeps
 * answering for the bookmarks already in the wild), and the word lands
 * its STAGE too (THE TWO-ADDRESS DESIGN: the lens lives in a
 * non-default sub-tab, so a landing that carries the word implies the
 * transactions ledger — view's own word wins when it speaks). The chip
 * wears the twenty-first family, green — the last wearable hue in the
 * palette (red is the danger voice), the EARN badge's own ink, the
 * palette-exhaustion amendment's second application where the last hue
 * is a voice.
 *
 * v2.381.0 — THE PROMISE KEPT, THE TWENTY-SECOND WORD: the e-TIMS desk's
 * submission-status lens speaks it as its desk-prefixed `et-status` (the
 * same parser, zero new bytes of law, again — the taxman's daily
 * question, "which invoices have we sent to KRA, and which came back?",
 * is now an address; UPPERCASE words, the wire's own five statuses, and
 * the landing chip wears the twenty-second family, RED — the danger
 * voice finally speaks, on the one desk whose daily question is danger
 * itself: a rejected or failed KRA submission is the taxman's red
 * letter. The desk's alarm vocabulary speaks rose and amber, so the red
 * chip borrows nothing from any badge — the palette-exhaustion
 * amendment's third application: the reserved hue speaks where the
 * danger IS the lens). THE TWO-ADDRESS DESIGN's second application: the
 * lens lives in a NON-DEFAULT sub-tab (invoices under a profile
 * default), so a landing that carries the word implies the invoices
 * stage — view's own word wins when it speaks a VALID sub-tab, an
 * invalid word does not claim the stage. THE LANDING IS READ ONCE AND
 * LENT DOWN: the section under the TabsContent remounts on every
 * sub-tab toggle, and a seed that re-parsed there would resurrect a
 * dismissed chip — the landing lives on the desk's shell and flows to
 * the section as props.
 *
 * v2.382.0 — THE PROMISE KEPT, THE TWENTY-THIRD WORD: the tax desk's
 * filings-type lens speaks it as its desk-prefixed `tax-type` (the same
 * parser, zero new bytes of law, again — the ghost desk's daily question,
 * "which returns are VAT, which are withholding, which income?", is now
 * an address; UPPERCASE words, the wire's own four types, and the
 * landing chip wears the family's FIRST SHADE-SPLIT — orange one storey
 * deeper at 300/100, the palette-exhaustion amendment's FOURTH form:
 * every hue spoke at 200/50, so a hue may speak twice only through a
 * DIFFERENT storey, a family byte the 200-storey can never equal).
 * THE TWO-ADDRESS DESIGN's third application: the lens lives in a
 * NON-DEFAULT sub-tab (filings under a categories default), so a landing
 * that carries the word implies the filings stage — view's own word wins
 * when it speaks a VALID sub-tab, an invalid word does not claim the
 * stage. THE LANDING IS READ ONCE ON THE SHELL: the tax desk's filters
 * live on the shell itself (which never unmounts), so the seed is a
 * plain useState initializer — a dismissed chip can never resurrect.
 *
 * v2.384.0 — THE PROMISE KEPT, THE TWENTY-FIFTH WORD: the reports desk
 * answers the address bar. The Report Type grid — the desk's daily
 * question, "which report am I looking at?" — speaks its desk-prefixed
 * `rep-type` (the grid's OWN spellings, the eight members of the
 * reportType state union, lowercase — a capitalized word is an unknown
 * word, not a clever match) and wears the landing chip in the family's
 * THIRD SHADE-SPLIT — lime one storey deeper at 300/100: the hue last
 * spoke at the 200/50 storey (the gift-cards desk's word), and a hue may
 * speak twice only through a DIFFERENT storey — a family byte the
 * 200-storey can never equal. The desk's own badges speak primary,
 * amber, green, blue and red, so the deeper lime borrows nothing from
 * any badge. NO STAGE TO IMPLY: the reports desk
 * has no sub-tabs — the report type IS the stage, and the landed shape
 * is already visible in the grid's own Active badge. THE LANDING IS
 * READ ONCE ON THE SHELL: a plain useState initializer — a dismissed
 * chip can never resurrect, and every hand-driven shape change retires
 * the chip (the chip speaks the ADDRESS BAR's landing, never the
 * human's next choice).
 */

/**
 * The reports desk's shape vocabulary (v2.384.0) — the Report Type
 * grid's OWN spellings, the members of the reportType state union,
 * lowercase. Lives here (the ONE home) so the desk, its deep-link word
 * and the test suite speak one array — the same home TAX_PERIOD_SHAPE
 * keeps for the tax desk's shape word.
 * v2.461.0: the ninth word joins — `dead_stock`, the Dead Stock report
 * (the grid completes its three-by-three). The historical "eight
 * members" prose in the deep-link suite's header is history by date;
 * the LIVING law is this array.
 */
export const REP_TYPE_FILTERS = [
  'sales',
  'inventory',
  'valuation',
  'daily',
  'top_products',
  'customer_analysis',
  'rental_performance',
  'trends',
  'dead_stock',
] as const;

/**
 * v2.486.0 — THE FAMILY'S FORTY-FOURTH WORD (the queue): the health
 * desk's DLQ lens answers the bar. The system-health desk's dead-letter
 * filter — the operator's daily question, "what's waiting or failing in
 * the queue?" — spoken through the status toggle since the desk's birth
 * — now rides its desk-prefixed word `sh-dlq` (`?sh-dlq=<member>` on
 * the wire): the desk's OWN spellings (SH_DLQ_FILTERS below the parser —
 * the six members of the toggle, the five UPPERCASE status words plus
 * the lowercase neutral, read through the named-member parser; a
 * made-up member or a wrong case is an unknown word, not a clever
 * match). THE COLLISION CHECK ran at round start: the byte appeared
 * NOWHERE before this word. THE FAMILY'S SEVENTEENTH 300-STOREY BYTE:
 * the landing chip wears the RED byte — the health desk's own alert
 * hue (the etims ledger's chip hue at the 200/50 storey, the et-status
 * row's own family) speaking through a storey it never spoke — the
 * shade-split law's next form; red LEFT the stranger list (the exact
 * red 300-trio census was machine-kept). THE SUB-TAB LAW'S THIRD
 * APPLICATION (the default-sub-tab amendment, after the banking desk's
 * two): the lens lives inside the desk's `dlq` sub-tab, so a landing
 * that carries the word RAISES THE SUB-TAB IT LANDS INTO — the pane's
 * seed reads the same landed word, and the chip is visible on landing
 * (the always-visible-face law's intent holds behind the desk's own
 * inner navigation). Switching sub-tabs afterwards is the human's own
 * navigation, not a lens change: the chip hides with the pane and
 * returns when it reopens — the same honest remount semantics every
 * desk already speaks across tab switches. THE LANDING IS READ ONCE ON
 * THE SHELL: a plain useState initializer — a dismissed chip can never
 * resurrect. THE DEFAULT WEARS NO WORD: the resting lens is `all` —
 * the address's silence, the key strips when the desk rests. THE LENS
 * WRITES BACK: every filter turn replaceState's its word (the window's
 * own write shape), so a turned lens is a shareable address, never a
 * dead end; a blocked write is the lens's silence, never a thrown desk.
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
 * v2.387.0 — THE PROMISE KEPT, THE TWENTY-SIXTH WORD: the banking desk
 * answers the address bar. The bank ledger's transaction-type lens — the
 * treasurer's daily question, "what moved through the accounts?" — speaks
 * its desk-prefixed `bank-type` (the Select's OWN spellings, the five
 * members of the txFilterType vocabulary, UPPERCASE — the payment word's
 * voice; a lowercase `deposit` or a capitalized `Deposit` is an unknown
 * word, not a clever match; the neutral is the lowercase `all`, exactly
 * the Select's own). The chip wears the family's FOURTH SHADE-SPLIT —
 * blue one storey deeper at 300/100: the hue last spoke at the 200/50
 * storey (the transfers desk's word), and a hue may speak twice only
 * through a DIFFERENT storey — a family byte the 200-storey can never
 * equal. THE SUB-TAB LAW SPEAKS HERE (the default-sub-tab amendment's
 * next case): the lens lives inside the desk's `transactions` sub-tab, so
 * a landing that carries the word RAISES THE SUB-TAB IT LANDS INTO — the
 * sub-tab's seed reads the same landed word, and the chip is visible on
 * landing (the always-visible-face law's intent holds behind the desk's
 * own inner navigation). Switching sub-tabs afterwards is the human's own
 * navigation, not a lens change: the chip hides with the pane and returns
 * when it reopens — the same honest remount semantics every desk already
 * speaks across tab switches. THE LANDING IS READ ONCE ON THE SHELL: a
 * plain useState initializer — a dismissed chip can never resurrect, and
 * every hand-driven type change retires the chip (the chip speaks the
 * ADDRESS BAR's landing, never the human's next choice).
 */

/**
 * The banking desk's type vocabulary (v2.387.0) — the bank ledger's
 * transaction-type Select's OWN spellings, the five UPPERCASE members of
 * the txFilterType state plus the lowercase neutral. Lives here (the ONE
 * home) so the desk, its deep-link word and the test suite speak one
 * array — the same home REP_TYPE_FILTERS keeps for the reports desk's
 * shape word.
 */
export const BANK_TYPE_FILTERS = [
  'all',
  'DEPOSIT',
  'WITHDRAWAL',
  'TRANSFER',
  'FEE',
  'INTEREST',
] as const;

export type BankTypeFilter = (typeof BANK_TYPE_FILTERS)[number];

/**
 * v2.388.0 — THE PROMISE KEPT, THE TWENTY-SEVENTH WORD: the banking
 * desk's M-Pesa ledger answers the address bar. The M-Pesa pane's
 * status lens — the treasurer's other daily question, "what is still
 * pending on the float?" — speaks its desk-prefixed `bank-mpesa` (the
 * Select's OWN spellings, the four members of the mpesaFilterStatus
 * vocabulary, UPPERCASE — the payment word's voice; a lowercase
 * `pending` or a capitalized `Pending` is an unknown word, not a
 * clever match; the neutral is the lowercase `all`, exactly the
 * Select's own). The chip wears the family's FIFTH SHADE-SPLIT —
 * purple one storey deeper at 300/100: the hue last spoke at the
 * 200/50 storey (the catalog desk's word), and a hue may speak twice
 * only through a DIFFERENT storey — a family byte the 200-storey can
 * never equal; the desk's own badges speak blue, emerald, green,
 * amber, red, orange, violet and slate, so the deeper purple borrows
 * nothing from any badge. THE SUB-TAB LAW SPEAKS HERE TOO (the
 * amendment's SECOND application, one release after its first): the
 * lens lives inside the desk's `mpesa` pane, so a landing that carries
 * the word RAISES THE PANE IT LANDS INTO — the pane's seed reads the
 * same landed word, and the chip is visible on landing. The desk now
 * owns TWO words (the suppliers and transactions precedent): when both
 * land together, the M-PESA word wins the pane seed (the deeper pane
 * raises), and each chip waits honestly inside its own pane — hidden
 * only until the human navigates to it, returning on the switch (the
 * honest remount semantics every desk already speaks). Switching
 * panes afterwards is the human's own navigation, not a lens change.
 * THE LANDING IS READ ONCE ON THE SHELL: a plain useState initializer
 * — a dismissed chip can never resurrect, and every hand-driven status
 * change retires the chip (the chip speaks the ADDRESS BAR's landing,
 * never the human's next choice).
 */

/**
 * The banking desk's M-Pesa status vocabulary (v2.388.0) — the M-Pesa
 * ledger's status Select's OWN spellings, the four UPPERCASE members of
 * the mpesaFilterStatus state plus the lowercase neutral. Lives here
 * (the ONE home) so the desk, its deep-link word and the test suite
 * speak one array — the same home BANK_TYPE_FILTERS keeps for the
 * desk's type word.
 */
export const BANK_MPESA_FILTERS = [
  'all',
  'PENDING',
  'MATCHED',
  'UNMATCHED',
  'DISPUTED',
] as const;

export type BankMpesaFilter = (typeof BANK_MPESA_FILTERS)[number];

/**
 * v2.389.0 — THE PROMISE KEPT, THE TWENTY-EIGHTH WORD: the debt
 * management desk's reminder-history lens answers the address bar. The
 * desk's daily question — "which reminders are still waiting, and which
 * never made it out?" — speaks its desk-prefixed `debt-status`
 * (collision-checked at round start: the byte appeared NOWHERE before
 * this word). The lens's words are the Select's OWN spellings — the
 * four UPPERCASE members of the statusFilter state (PENDING | SENT |
 * DELIVERED | FAILED, the reminder word's voice) plus the lowercase
 * neutral `all`; a lowercase `pending` or a capitalized `Sent` is an
 * unknown word, never a clever match. Anything missing or unknown
 * answers 'all' (never stranded). Lives here (the ONE home) so the
 * desk, its deep-link word and the test suite speak one array — the
 * same home BANK_MPESA_FILTERS keeps for the banking desk's M-Pesa
 * word.
 */
export const DEBT_STATUS_FILTERS = [
  'all',
  'PENDING',
  'SENT',
  'DELIVERED',
  'FAILED',
] as const;

export type DebtStatusFilter = (typeof DEBT_STATUS_FILTERS)[number];

/**
 * v2.390.0 — THE PROMISE KEPT, THE TWENTY-NINTH WORD: the debt
 * management desk's reminder-history channel lens answers the address
 * bar — the desk's SECOND word (the transactions and banking
 * precedent), which makes the desk the family's THIRD two-word
 * negotiation desk. The lens's daily question — "which channel did the
 * reminder ride out on?" — speaks its desk-prefixed `debt-channel`
 * (collision-checked at round start: the byte appeared NOWHERE before
 * this word). The lens's words are the Select's OWN spellings — the
 * four UPPERCASE members of the typeFilter state (SMS | WHATSAPP |
 * EMAIL | IN_APP, the channel word's voice) plus the lowercase neutral
 * `all`; a lowercase `sms` or a capitalized `Email` is an unknown
 * word, never a clever match. Anything missing or unknown answers
 * 'all' (never stranded). Lives here (the ONE home) so the desk, its
 * deep-link word and the test suite speak one array — the same home
 * DEBT_STATUS_FILTERS keeps for the desk's status word.
 */
export const DEBT_CHANNEL_FILTERS = [
  'all',
  'SMS',
  'WHATSAPP',
  'EMAIL',
  'IN_APP',
] as const;

export type DebtChannelFilter = (typeof DEBT_CHANNEL_FILTERS)[number];

/**
 * v2.391.0 — THE PROMISE KEPT, THE THIRTIETH WORD: the data-exports
 * desk's history lens answers the address bar. The export center's
 * daily question — "which of my files are ready, and which died?" —
 * speaks its desk-prefixed `exp-status` (collision-checked at round
 * start: the byte appeared NOWHERE before this word). The lens's words
 * are the chip row's OWN spellings — the lowercase members of the
 * FilterKey union (completed | failed | processing, and — since
 * v2.439.0 — cancelled, the stuck row's own voice) plus the lowercase
 * neutral `all`; the wire's UPPERCASE statuses (`COMPLETED`, `PENDING`)
 * are NOT lens words — an uppercase word names nothing, never a clever
 * match. Anything missing or unknown answers 'all' (never stranded).
 * Lives here (the ONE home) so the desk, its deep-link word and the
 * test suite speak one array — the same home DEBT_CHANNEL_FILTERS
 * keeps for the debt desk's channel word.
 */
export const EXP_STATUS_FILTERS = [
  'all',
  'completed',
  'failed',
  'processing',
  'cancelled',
] as const;

export type ExpStatusFilter = (typeof EXP_STATUS_FILTERS)[number];

/**
 * v2.392.0 — THE PROMISE KEPT, THE THIRTY-FIRST WORD: the data-exports
 * desk's history lens answers BY THE TYPE. The export center's other
 * daily question — "where is the file I generated for the accountant?"
 * — speaks its desk-prefixed `exp-type` (collision-checked at round
 * start: the byte appeared NOWHERE before this word). The lens's words
 * are the type chip row's OWN spellings — the lowercase keys of the ten
 * EXPORT_TYPES cards (products | customers | transactions | debt |
 * inventory | employees | suppliers | loyalty | tax | sales-summary,
 * the chip word's voice; the wire's UPPERCASE types — `PRODUCTS`,
 * `SALES_SUMMARY` — are NOT lens words, the inverse-case voice the
 * status word speaks; the neutral is the lowercase `all`; missing or
 * unknown answers 'all', never stranded). Lives here (the ONE home) so
 * the desk, its deep-link word and the test suite speak one array —
 * the same home EXP_STATUS_FILTERS keeps for this desk's status word,
 * and the desk joins the family's TWO-WORD NEGOTIATION club (the debt
 * desk's same-pane precedent: either word lands, the two chips sit
 * side by side, each retiring by its own two voices).
 */
export const EXP_TYPE_FILTERS = [
  'all',
  'products',
  'customers',
  'transactions',
  'debt',
  'inventory',
  'employees',
  'suppliers',
  'loyalty',
  'tax',
  'sales-summary',
] as const;

export type ExpTypeFilter = (typeof EXP_TYPE_FILTERS)[number];

/**
 * v2.443.0 — THE CENSUS DOOR'S TRANSLATION. The By Type census speaks
 * the wire's UPPERCASE types (`LOYALTY`, `SALES_SUMMARY`) while the
 * history lens speaks the lowercase kebab words (`loyalty`,
 * `sales-summary` — the card grid's own law: sales-summary's kebab
 * carries SALES_SUMMARY's underscore). The door between them needs the
 * one honest mapping: lowercase, underscores to kebab, and a membership
 * check against the ONE array above. A wire type with no lens word (the
 * off-union rows the census honestly counts — `PAYROLL`) answers
 * null: its row stays a census, never a door. THE NEUTRAL IS NOT A
 * WORD: wire `ALL` lowers to `all`, but `all` is the lens's RESTING
 * state, not a lens word — a door that "filters to all" is a no-op
 * masquerading as a door, and the ALL row would wear the active seat
 * at the resting state (a lie). It answers null with the off-union
 * rows. Lives here (the ONE home) so the desk, its deep-link word and
 * the test suite speak one array — the same home the word list itself
 * keeps.
 */
export function expTypeWordFor(wire: string): ExpTypeFilter | null {
  const word = wire.toLowerCase().replace(/_/g, '-') as ExpTypeFilter;
  if (word === 'all') return null;
  return (EXP_TYPE_FILTERS as readonly string[]).includes(word) ? word : null;
}

/**
 * v2.393.0 — THE PROMISE KEPT, THE THIRTY-SECOND WORD: the messaging
 * desk's Templates pane answers BY THE TEMPLATE. The shop's other daily
 * question — "which template do I send the debtors?" — speaks its
 * desk-prefixed `msg-template` (collision-checked at round start: the
 * byte appeared NOWHERE before this word). The lens's words are the
 * templates grid's OWN spellings — the nine kebab-case template ids
 * (christmas | new-year | easter | valentine | general-promotion |
 * debt-reminder | thank-you | payment-confirmation | balance-update,
 * the card word's voice; the neutral is the lowercase `all`; missing or
 * unknown answers 'all', never stranded). THE FAMILY'S FIRST CARD-GRID
 * LENS: the pane's nine template cards narrow to the landed card while
 * the lens lives — no table, no chip row, the grid itself is the lens
 * face — and the SUB-TAB AMENDMENT'S FOURTH APPLICATION raises the
 * Templates pane the word lands into (a bookmark of the pane alone
 * would pre-narrow a grid the reader cannot see — the stranded feeling
 * this module exists to kill). The word's home is the Templates pane's
 * nine MESSAGE_TEMPLATES cards — the broadcast tab's holiday quick-fills
 * share three ids (christmas, new-year, easter) but speak a DIFFERENT
 * list (HOLIDAY_TEMPLATES); the lens never guesses across the two.
 * Lives here (the ONE home) so the desk, its deep-link word and the
 * test suite speak one array — the same home EXP_TYPE_FILTERS keeps
 * for the export desk's type word.
 */
export const MSG_TEMPLATE_FILTERS = [
  'all',
  'christmas',
  'new-year',
  'easter',
  'valentine',
  'general-promotion',
  'debt-reminder',
  'thank-you',
  'payment-confirmation',
  'balance-update',
] as const;

export type MsgTemplateFilter = (typeof MSG_TEMPLATE_FILTERS)[number];

/**
 * The system-health desk's DLQ vocabulary (v2.486.0) — the queue lens's
 * OWN spellings, the six members of the dlqFilter toggle plus the
 * lowercase neutral: the five UPPERCASE status words (PENDING / RETRYING
 * / DEAD / COMPLETED / CANCELLED — the wire's own voice, the payment
 * word's ancestor) and the lowercase `all` exactly the toggle's own.
 * Lives here (the ONE home) so the desk, its deep-link word and the
 * test suite speak one array — the same home BANK_TYPE_FILTERS keeps
 * for the banking desk's shape word.
 */
export const SH_DLQ_FILTERS = [
  'all',
  'PENDING',
  'RETRYING',
  'DEAD',
  'COMPLETED',
  'CANCELLED',
] as const;

export type ShDlqFilter = (typeof SH_DLQ_FILTERS)[number];

/**
 * DASH_VIEW_MEMBERS (v2.489.0) — the dashboard desk's view members: the
 * Recent activity card's OWN union ('sales' | 'system'), lowercase, the
 * toggle's own spellings. Lives here (the ONE home) so the desk, its
 * deep-link word and the test suite speak one array — the same home
 * SH_DLQ_FILTERS keeps for the queue's lens.
 */
export const DASH_VIEW_MEMBERS = ['sales', 'system'] as const;

export type DashViewMember = (typeof DASH_VIEW_MEMBERS)[number];

/**
 * POS_VIEW_MEMBERS (v2.490.0) — the counter desk's view members: the
 * products pane's OWN union ('grid' | 'list'), lowercase, the view
 * toggle's own spellings. Lives here (the ONE home) so the desk, its
 * deep-link word and the test suite speak one array — the same home
 * DASH_VIEW_MEMBERS keeps for the dashboard's view.
 */
export const POS_VIEW_MEMBERS = ['grid', 'list'] as const;

export type PosViewMember = (typeof POS_VIEW_MEMBERS)[number];

/**
 * CAT_VIEW_MEMBERS (v2.491.0) — the catalog desk's view members: the
 * shop floor's OWN union ('grid' | 'list'), lowercase, the view
 * toggle's own spellings. Lives here (the ONE home) so the desk, its
 * deep-link word and the test suite speak one array — the same home
 * POS_VIEW_MEMBERS keeps for the counter's view (the two desks read
 * the same two words, each through its OWN desk-prefixed key).
 */
export const CAT_VIEW_MEMBERS = ['grid', 'list'] as const;

export type CatViewMember = (typeof CAT_VIEW_MEMBERS)[number];

/**
 * AN_PERIOD_MEMBERS (v2.492.0) — the analytics desk's period members:
 * the lens's OWN union ('today' | 'week' | 'month' | 'year'), lowercase,
 * the period Select's own spellings (the AnalyticsPeriod type's own
 * members, re-spoken as the ONE home's tuple). Lives here (the ONE
 * home) so the desk, its deep-link word and the test suite speak one
 * array — the same home CAT_VIEW_MEMBERS keeps for the catalog's view
 * (the analytics desk reads the four words its lens has always spoken,
 * through its OWN desk-prefixed key).
 */
export const AN_PERIOD_MEMBERS = ['today', 'week', 'month', 'year'] as const;

export type AnPeriodMember = (typeof AN_PERIOD_MEMBERS)[number];

/**
 * THE SLUG-SHAPE LAW (v2.493.0) — the dynamic member's own word shape:
 * a lens whose members are the STORE'S OWN ROWS (the categories, the
 * shelves the ledger names) does not wear a fixed tuple — its word
 * names the row by its SLUG. Two laws, one home:
 *
 *   • `categorySlug` — the row's own slug: lowercase, trimmed, runs of
 *     spaces/&/dashes collapsed to ONE hyphen, everything but
 *     alphanumerics and hyphens stripped ("Nails & Screws" wears
 *     "nails-screws"; "Iron Bars" wears "iron-bars"). The slug is
 *     derived, never stored — the ledger's name stays the one truth.
 *   • `parseInitialNamedSlug` — the landing's read: the raw param
 *     value as it lies (trimmed; an absent or empty value is null).
 *     The slug is NEVER case-gamed — `?cat-category=Cement` is an
 *     unknown word (the honest member law's own reading), because the
 *     family's slugs are born lowercase. The RESOLUTION happens on the
 *     desk when the rows arrive: a hit seeds the filter (the seed IS
 *     the address's landing, never a hand turn — no write, no retire),
 *     an unknown slug is silence (the landing retires, no chip).
 *
 * The shape's first wearer: `?cat-category=<slug>` (v2.493.0 — the
 * family's fiftieth word, the catalog desk's THIRD word, the shop
 * floor's daily question "which shelves do I read?" — BORN GUARDED:
 * the family's ONE reading from birth — no turn, no write, and the
 * hand's turn retires the word; THE DEFAULT WEARS NO WORD: 'all' is
 * the address's silence — the key strips when the desk rests). The
 * counter's and the inventory's own category wires wear this same law
 * when their rounds come.
 */
export function categorySlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[\s&/\\,_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/^-+|-+$/g, '');
}

export function parseInitialNamedSlug(search: string, key: string): string | null {
  try {
    const raw = new URLSearchParams(search).get(key);
    if (!raw) return null;
    const trimmed = raw.trim();
    return trimmed.length > 0 ? trimmed : null;
  } catch {
    return null;
  }
}

/**
 * v2.493.0 — THE FAMILY'S FIFTIETH WORD: the catalog's category rides
 * the address. The catalog desk's category lens — the shop floor's
 * daily question, "which shelves do I read?" — speaks its desk-prefixed
 * `cat-category` (collision-checked at round start: the byte appeared
 * NOWHERE before this word), the lens's OWN rows read through the
 * SLUG-SHAPE LAW (a made-up slug is an unknown word — silence, not a
 * clever match). THE DEFAULT WEARS NO WORD: 'all' is the address's
 * silence — the key strips when the desk rests, and a landed word that
 * names the default wears no chip. THE LANDING IS READ ONCE ON THE
 * SHELL: a plain useState initializer — a dismissed chip can never
 * resurrect (the catalog desk's THIRD word — a desk may own many).
 * THE LENS WRITES BACK THROUGH THE FAMILY'S ONE READING: the guarded
 * door from birth — no turn, no write, and the hand's turn retires the
 * word (the chip speaks the ADDRESS BAR's landing, never the human's
 * next choice — the reading the v2.488.0 verse named for the whole
 * family). The chip wears the family's shared slate — the slate now
 * serves six words (the week's word, the dashboard's word, the
 * counter's own, the catalog's view, the analytics' own, and the
 * catalog's category), the census holds.
 */

/**
 * v2.492.0 — THE FAMILY'S FORTY-NINTH WORD: the analytics' period rides
 * the address. The analytics dashboard's period lens — the desk's first
 * daily question, "how far does the ledger see?" — speaks its
 * desk-prefixed `an-period` (collision-checked at round start: the byte
 * appeared NOWHERE before this word), the lens's OWN spellings (`today`,
 * `week`, `month` and `year`, read through the generic named-member
 * parser; a made-up member or a wrong case is an unknown word, not a
 * clever match). THE DEFAULT WEARS NO WORD: week is the address's
 * silence — the key strips when the desk rests, and a landed word that
 * names the default wears no chip. THE LANDING IS READ ONCE ON THE
 * SHELL: a plain useState initializer — a dismissed chip can never
 * resurrect (the family's FIRST component desk — the word lives where
 * the state lives, in the dashboard the analytics tab wraps). THE LENS
 * WRITES BACK THROUGH THE FAMILY'S ONE READING: the guarded door from
 * birth — no turn, no write, and the hand's turn retires the word (the
 * chip speaks the ADDRESS BAR's landing, never the human's next choice
 * — the reading the v2.488.0 verse named for the whole family). The
 * chip wears the family's shared slate — the slate now serves five
 * words (the week's word, the dashboard's word, the counter's own, the
 * catalog's own, and the analytics' own), the census holds.
 */

/**
 * v2.491.0 — THE FAMILY'S FORTY-EIGHTH WORD: the catalog's view rides
 * the address. The catalog desk's view toggle — the shop floor's daily
 * question, "how do I read the shelves?" — speaks its desk-prefixed
 * `cat-view` (collision-checked at round start: the byte appeared
 * NOWHERE before this word), the toggle's OWN spellings (`grid` and
 * `list`, read through the generic named-member parser; a made-up
 * member or a wrong case is an unknown word, not a clever match). THE
 * DEFAULT WEARS NO WORD: grid is the address's silence — the key
 * strips when the desk rests, and a landed word that names the default
 * wears no chip. THE LANDING IS READ ONCE ON THE SHELL: a plain
 * useState initializer — a dismissed chip can never resurrect (the
 * SEVENTH shell-tab desk, the desk's SECOND word). THE VIEW WRITES
 * BACK THROUGH THE FAMILY'S ONE READING: the guarded door from birth —
 * no turn, no write, and the hand's turn retires the word (the chip
 * speaks the ADDRESS BAR's landing, never the human's next choice —
 * the reading the v2.488.0 verse named for the whole family). The chip
 * wears the family's shared slate — the slate now serves four words
 * (the week's word, the dashboard's word, the counter's own, and the
 * catalog's own), the census holds.
 */

/**
 * v2.490.0 — THE FAMILY'S FORTY-SEVENTH WORD: the counter's view rides
 * the address. The POS desk's products pane — the desk's first daily
 * question, "how do I read the shelf?" — speaks its desk-prefixed
 * `pos-view` (collision-checked at round start: the byte appeared
 * NOWHERE before this word), the toggle's OWN spellings (`grid` and
 * `list`, read through the generic named-member parser; a made-up
 * member or a wrong case is an unknown word, not a clever match). THE
 * DEFAULT WEARS NO WORD: grid is the address's silence — the key
 * strips when the desk rests, and a landed word that names the default
 * wears no chip. THE LANDING IS READ ONCE ON THE SHELL: a plain
 * useState initializer — a dismissed chip can never resurrect (the
 * SIXTH shell-tab desk). THE VIEW WRITES BACK THROUGH THE FAMILY'S ONE
 * READING: the guarded door from birth — no turn, no write, and the
 * hand's turn retires the word (the chip speaks the ADDRESS BAR's
 * landing, never the human's next choice — the reading the v2.488.0
 * verse named for the whole family). The chip wears the family's
 * shared slate — the slate now serves three words (the week's word,
 * the dashboard's word, and the counter's own), the census holds.
 */

/**
 * v2.368.0 — THE LEGACY-WORD SUNSET LAW, the alias parser. The family's
 * naming constitution (Task 44's collision analysis, worn by every word
 * since `?po-status=`) requires a DESK-PREFIXED param — but one desk
 * still speaks a pre-constitution bare word: the loyalty ledger's
 * `?type=`, whose one live speaker is the org console's sweep-line door
 * (v2.316.0's contract, byte-pinned by its own suite). A sunset that
 * breaks a live door is a broken door, not a sunset, so the migration
 * speaks THIS shape: the desk-prefixed `?ly-type=` is the canonical word
 * (the constitution's twenty-first row), the bare `?type=` remains its
 * LEGACY ALIAS — same dictionary, same membership law (case-sensitive:
 * a lowercase `expire` is an unknown word, not a clever match), same
 * fallback — and the canonical word WINS when both are present (an
 * explicit desk-prefix outranks the bare survivor; the desk can never
 * be told two different words by one address bar).
 *
 * The precedence is read in ONE place — this parser — so the alias can
 * never drift from the canonical word's law. In-repo speakers migrate
 * to the canonical form (the sweep line's door moved this round); the
 * alias serves the bookmarks and org-console links already in the wild.
 */
export function parseInitialNamedMemberWithAlias<V extends string>(
  search: string,
  canonical: string,
  legacyAlias: string,
  validValues: readonly V[],
  fallback: V,
): V {
  try {
    const params = toParams(search);
    const value = params.get(canonical) ?? params.get(legacyAlias);
    if (value && (validValues as readonly string[]).includes(value)) {
      return value as V;
    }
    return fallback;
  } catch {
    return fallback;
  }
}

/**
 * v2.462.0 — THE PROMISE KEPT, THE THIRTY-THIRD WORD: the reports desk's
 * ninth report answers with its LENS. The Dead Stock report's idle
 * window — the desk's daily question, "how far back does resting
 * begin?" — speaks its desk-prefixed `dead-window` (collision-checked at
 * round start: the byte appeared NOWHERE before this word). The lens's
 * words are the WINDOW TUPLE'S OWN spellings — `30 | 60 | 90`, read as
 * words through the generic parser from DEAD_STOCK_WINDOWS, the ONE home
 * the classifier keeps (a made-up window — `45`, `030`, `thirty` — is an
 * unknown word, not a clever match; the default is `90`, the tuple's own
 * tail). THE FAMILY'S FIRST LENS-INSIDE-A-SHAPE: the window lives inside
 * the dead_stock stage, so the landing chip wears the ROSE byte at
 * 300/100 and lives in the SECTION — the banking desk's sub-tab law's
 * shape (it hides with the pane and returns when the pane reopens) — and
 * the DEFAULT WEARS NO CHIP (a landing of the default speaks the shape
 * the bare landing already answers — the rep-type law's own reading).
 * THE SHADE-SPLIT LAW'S NEXT FORM: the two-storey census was FULL —
 * every hue in the loom's registry had spoken at both storeys — so the
 * family GREW one line (rose joins the 300 registry) rather than
 * masquerade; rose last spoke at the 200/50 storey (the customers
 * desk's word), and a hue may speak twice only through a DIFFERENT
 * storey — a family byte the 200-storey can never equal. THE LENS
 * WRITES BACK: a hand-driven window turn replaceState's the word into
 * the address (the transactions desk's own write shape, the preserve
 * law — every other param rides untouched), so a turned lens is a
 * shareable address, never a dead end. THE LANDING IS READ ONCE ON THE
 * SHELL: a plain useState initializer — a dismissed chip can never
 * resurrect, and only a hand-driven WINDOW turn retires it (a
 * hand-driven REPORT change is navigation, never a lens change).
 */

/**
 * v2.480.0 — THE FAMILY'S THIRTY-FOURTH WORD: the ledger's own name lens
 * answers the bar. The Dead Stock report's search lens — the desk's
 * other daily question, "which products am I looking at?" — speaks its
 * desk-prefixed `dead-q` (collision-checked at round start: the byte
 * appeared NOWHERE before this word). The lens's word is the MAKER'S
 * OWN — free text read as typed (trimmed, capped at eighty characters
 * for address hygiene, never case-gamed: the ONE home's filter
 * lowercases its own side; any string is a word, and the neutral is
 * ABSENCE — an empty word wears no chip and strips its key). THE
 * FAMILY'S TWELFTH 300-STOREY BYTE: the landing chip wears the AMBER
 * byte — the lens family's own tone (the window chips' tint word, the
 * view voice's ground) — a hue that never spoke at this storey (the
 * exact amber 300-trio census was kept: no src file wore the trio
 * before the loom's line). The chip lives in the SECTION beside the
 * window's own (the sub-tab law's shape) and the landing is read once
 * on the shell. THE LENS WRITES BACK: every hand-driven lens change
 * replaceState's its word into the address (the window's own write
 * shape), so a pressed lens is a shareable address, never a dead end;
 * an EMPTIED lens strips its key — a stale word that outlives the lens
 * it named is a lie the next refresh would resurrect.
 */

/**
 * v2.481.0 — THE FAMILY'S THIRTY-FIFTH WORD: the ledger's own order
 * answers the bar. The Dead Stock report's sort door — the desk's other
 * daily question, "which honesty am I reading, the loudest debt or the
 * shelf's patience?" — speaks its desk-prefixed `dead-sort` (collision-
 * checked at round start: the byte appeared NOWHERE before this word).
 * The order's words are the ONE home's OWN spellings — `capital | idle`,
 * read as words through the generic parser from DEAD_STOCK_SORTS, the
 * tuple the ONE home keeps (a made-up order — `asc`, `desc`, `name` — is
 * an unknown word, not a clever match; the default is `capital`, the
 * classifier's own standing order). THE FAMILY'S THIRTEENTH 300-STOREY
 * BYTE: the landing chip wears the EMERALD byte — the ledger's own
 * green (the suppliers' hue at the 200/50 storey, the branch ledger's
 * copy family) — a storey it never spoke (the exact emerald 300-trio
 * census was machine-kept: no src file wore the trio before the loom's
 * line). The chip lives in the SECTION beside the window's and the
 * lens's own (one lens row, the sub-tab law's shape) and the landing is
 * read once on the shell. THE DEFAULT WEARS NO WORD: the resting order
 * is the address's silence — the address carries only a NON-default
 * lens, so the key strips when the desk rests (the empty-wears-no-chip
 * law's own reading, grown to the write half). THE ORDER WRITES BACK:
 * every hand-driven sort turn replaceState's its word into the address
 * (the window's own write shape), so a pressed order is a shareable
 * address, never a dead end.
 */

/**
 * v2.482.0 — THE FAMILY'S THIRTY-SIXTH WORD: the reports desk's time
 * lens answers the bar. The date range preset — the desk's daily
 * question, "which days am I reading?" — speaks its desk-prefixed
 * `rep-range` (collision-checked at round start: the byte appeared
 * NOWHERE before this word). The range's words are the SIX NAMED
 * presets' OWN spellings — `today | this_week | this_month |
 * this_quarter | this_year | last_month`, read as words through the
 * generic parser from the tuple the desk keeps (a made-up range is an
 * unknown word, not a clever match; the default is `this_month`, the
 * resting face). THE CUSTOM'S HONEST ABSENCE: `custom` is not a word
 * the address can carry — a custom landing without its dates would
 * speak an unknown range — so the custom face stays the desk's own
 * scratch (its honest share needs its dates: the family's next verse).
 * THE FAMILY'S FOURTEENTH 300-STOREY BYTE: the landing chip wears the
 * VIOLET byte — the transactions payment lens's hue speaking through a
 * storey it never spoke (the exact violet 300-trio census was
 * machine-kept: no src file wore the trio before the loom's line). The
 * chip lives in the DESK's own preset row (the lens is beside the
 * stage's own picker, never inside a section) and the landing is read
 * once on the shell. THE DEFAULT WEARS NO WORD: the resting range is
 * the address's silence — the key strips when the desk rests. THE RANGE
 * WRITES BACK: every hand-driven range turn replaceState's its word
 * into the address (the window's own write shape), so a turned range is
 * a shareable address, never a dead end.
 */

/**
 * v2.383.0 — THE PROMISE KEPT, THE TWENTY-FOURTH WORD: the tax desk's
 * filings ledger answers BY THE MONTH. Its desk-prefixed `tax-period`
 * lens — the desk's other daily question, "which month's returns am I
 * looking at?" — is a SHAPE word where the type word was a vocabulary
 * word: the wire's own `YYYY-MM` class (the filings route itself execs
 * this exact shape on create) is the law, month 01-12 REAL. A lowercase
 * `all`, a `2026-13`, a bare `2026` are unknown words, not clever
 * matches — and the neutral here is ABSENCE (the empty string), not a
 * word: no landed month, no lens, never a stranded filter. THE LANDING
 * IS READ ONCE ON THE SHELL (the shell-seed law's second speaker on
 * this desk): the seed is a plain useState initializer — a dismissed
 * chip can never resurrect. THE CHIP WEARS THE SHADE-SPLIT's SECOND
 * APPLICATION — teal one storey deeper at 300/100: a hue may speak
 * twice only through a DIFFERENT storey (rentals' word wears teal at
 * the 200/50 storey on its own desk), and the pair bytes can never
 * collide. The desk's badges speak blue, emerald, red, amber, slate
 * and green, so the deeper teal borrows nothing from any badge.
 */
export const TAX_PERIOD_SHAPE = /^\d{4}-(0[1-9]|1[0-2])$/;

export function parseInitialNamedPeriod(search: string, param: string, fallback: string): string {
  try {
    const value = toParams(search).get(param);
    if (value && TAX_PERIOD_SHAPE.test(value)) {
      return value;
    }
    return fallback;
  } catch {
    return fallback;
  }
}

/**
 * v2.489.0 — THE FAMILY'S FORTY-SIXTH WORD: the dashboard's view rides
 * the address. The dashboard desk's Recent activity card — the desk's
 * first daily question, "what just moved?" — speaks its desk-prefixed
 * `dash-view` (collision-checked at round start: the byte appeared
 * NOWHERE before this word), the card's OWN spellings (`sales` and
 * `system`, the toggle's two members, read through the generic
 * named-member parser; a made-up member or a wrong case is an unknown
 * word, not a clever match). THE DEFAULT WEARS NO WORD: sales is the
 * address's silence — the key strips when the card rests, and a landed
 * word that names the default wears no chip. THE LANDING IS READ ONCE
 * ON THE SHELL: a plain useState initializer — a dismissed chip can
 * never resurrect (the FIFTH shell-tab desk). THE VIEW WRITES BACK
 * THROUGH THE FAMILY'S ONE READING: the guarded door from birth — no
 * turn, no write, and the hand's turn retires the word (the chip
 * speaks the ADDRESS BAR's landing, never the human's next choice —
 * the reading the v2.488.0 verse named for the whole family). The chip
 * wears the desk's own voice — slate, the toggle's own family, now
 * serving two words (the family's next shared family at the 300
 * storey, the violet precedent's own form).
 */

/**
 * v2.488.0 — THE FAMILY'S ONE READING (the landing chip's retirement):
 * the hand's turn retires the word. A landing chip speaks the ADDRESS
 * BAR's landing — the queue's lens (`sh-dlq`) and the scheduling desk's
 * week (`shift-week`) retire their chips the moment the hand TURNS the
 * member, through a guarded door: no turn, no write — a re-press of the
 * standing member is not a turn. The bank-type law's own reading won
 * over the window's persist shape, and the reading is the WHOLE
 * family's: the fin/rep window desks wear the same retirement when
 * their own turn-guard lands.
 */

/**
 * v2.487.0 — THE FAMILY'S FORTY-FIFTH WORD: the scheduling desk's week
 * answers the bar. The shift-scheduling tab's week navigation — the
 * desk's daily question, "which week am I planning?" — speaks its
 * desk-prefixed `shift-week` (collision-checked at round start: the
 * byte appeared NOWHERE before this word). The week's word is a SHAPE
 * word — the wire's own YYYY-MM-DD class (the date input's own bytes,
 * the ledger's day-key law), the day REAL (the honest-day validator's
 * own round-trip: V8's lenient ISO parse must re-format to the exact
 * bytes it came from, so `2026-02-30` and `2026-13-01` are unknown
 * words, not clever matches). The neutral is ABSENCE (the empty
 * string), not a word: no landed week, no lens, never a stranded
 * filter — the resting week is THIS week (the desk's own default), and
 * a landed word that names it wears no chip (the rep-type law's own
 * reading: a landing of the default speaks the shape the bare landing
 * already answers). THE LANDING IS READ ONCE ON THE SHELL: a plain
 * useState initializer — a dismissed chip can never resurrect (the
 * FOURTH shell-tab desk — the v2.485 lesson's own exception: a shell
 * tab reads on the shell). THE WEEK WRITES BACK: every hand-driven
 * week turn replaceState's its word (the window's own write shape; the
 * resting week strips its key — the address never carries the resting
 * face's word), so a turned week is a shareable address, never a dead
 * end. The chip wears the SHADE-SPLIT's next form — slate one storey
 * deeper at 300/100: a hue may speak twice only through a DIFFERENT
 * storey (the conversations desk's word wears slate at the 200/50
 * storey on its own desk), and the pair bytes can never collide.
 */
export function parseInitialNamedDay(search: string, param: string): string {
  try {
    return honestDayKey(toParams(search).get(param));
  } catch {
    return '';
  }
}

/**
 * v2.368.0 — THE TWO-ADDRESS DESIGN (the innerTab landing law). One
 * word, two addresses: the loyalty ledger's type lens lives in a
 * NON-DEFAULT sub-tab ('transactions' under a 'tiers' default), so a
 * landing that carries the word must land the STAGE too — a bookmark
 * of `?ly-type=EXPIRE` alone would pre-filter a ledger the reader
 * cannot see (the stranded feeling this module exists to kill). The
 * law's precedence: view's OWN word wins when it speaks a VALID
 * sub-tab (one writer per param — view addressed the stage, the type
 * word only fills its silence); a view word that is present but
 * INVALID does not claim the stage (only valid words speak — the
 * fallback never steals); otherwise a landed type word implies the
 * stage it lives on, and the desk's default answers last.
 */
export function parseInitialStage<V extends string>(
  search: string,
  validViews: readonly V[],
  stageView: V,
  landed: boolean,
  fallback: V,
): V {
  try {
    const raw = toParams(search).get('view');
    if (raw && (validViews as readonly string[]).includes(raw)) {
      return raw as V;
    }
    if (landed) return stageView;
    return fallback;
  } catch {
    return fallback;
  }
}

/**
 * v2.369.0 — THE BARE-WORD ISLAND COMES HOME: the stage's alias form.
 * The loyalty desk's stage answers its desk-prefixed canonical word
 * `ly-view` first, and the bare `view` keeps answering as a LEGACY
 * ALIAS (the bookmarks already in the wild). The two-address law is
 * unchanged — view's word wins when it speaks a VALID sub-tab, an
 * invalid word does not claim the stage (only valid words speak), and
 * a landed type word implies the stage it lives on — with ONE
 * precedence added: the canonical PRESENCE (any value, even garbage)
 * silences the alias, so `?ly-view=bogus&view=members` lets the landed
 * implication answer rather than obeying the bare survivor. One
 * address bar can never tell the desk two different stages.
 */
export function parseInitialStageWithAlias<V extends string>(
  search: string,
  canonical: string,
  legacyAlias: string,
  validViews: readonly V[],
  stageView: V,
  landed: boolean,
  fallback: V,
): V {
  try {
    const params = toParams(search);
    const canonicalRaw = params.get(canonical);
    const raw = canonicalRaw !== null ? canonicalRaw : params.get(legacyAlias);
    if (raw && (validViews as readonly string[]).includes(raw)) {
      return raw as V;
    }
    if (landed) return stageView;
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
  return parseInitialNamedLimit(search, 'limit', fallback);
}

/**
 * v2.369.0 — THE PARAM-NAMED GAIT LAW: the membership law `parseInitialLimit`
 * speaks, param-NAMEd (the same generalization the page law found in
 * `parseInitialNamedPage`). The bare parser delegates here — ONE home,
 * two words — and the alias form below delegates here BY PRESENCE.
 */
export function parseInitialNamedLimit(search: string, param: string, fallback: number = 100): number {
  try {
    const raw = toParams(search).get(param);
    if (!raw || !/^\d+$/.test(raw)) return fallback;
    const limit = parseInt(raw, 10);
    return (LEDGER_PAGE_SIZES as readonly number[]).includes(limit) ? limit : fallback;
  } catch {
    return fallback;
  }
}

/**
 * v2.369.0 — THE BARE-WORD ISLAND COMES HOME: the gait's alias form.
 * The loyalty desk's page size answers its desk-prefixed canonical word
 * `ly-limit` first, and the bare `limit` keeps answering as a LEGACY
 * ALIAS (the bookmarks already in the wild). The membership law lives
 * in ONE home — `parseInitialNamedLimit`, delegated to by presence: a
 * canonical PRESENCE (any value, even garbage) silences the alias and
 * the canonical's own law decides; only when the canonical is absent
 * does the bare word speak. One address bar can never tell the desk
 * two different gaits.
 */
export function parseInitialLimitWithAlias(
  search: string,
  canonical: string,
  legacyAlias: string,
  fallback: number = 100,
): number {
  try {
    const params = toParams(search);
    if (params.get(canonical) !== null) return parseInitialNamedLimit(search, canonical, fallback);
    return parseInitialNamedLimit(search, legacyAlias, fallback);
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
