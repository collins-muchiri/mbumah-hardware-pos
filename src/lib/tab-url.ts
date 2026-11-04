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
