/**
 * THE DEAD STOCK CLASSIFIER (v2.461.0) — the reports desk's ninth report
 * speaks one definition, and the definition lives in ONE home:
 *
 *   A product is DEAD STOCK when it HOLDS stock (quantityInStock > 0)
 *   AND its last sale is OLDER than the idle window — or it has NEVER
 *   sold. Out-of-stock products are NOT dead stock: an empty shelf has
 *   no capital tied in it (the low-stock alert owns that story).
 *
 * The route gathers the facts (products + each product's last sale date);
 * this module owns the MEANING. Pure and deterministic — the suite proves
 * the arithmetic without a database, and the route merely feeds it.
 *
 * THE HONEST FACES:
 *   • capitalTied  = quantityInStock × costPrice (money at rest, at cost —
 *     never at a selling price the shop has not realized).
 *   • daysIdle     = whole days since the last sale; NULL speaks "never
 *     sold" (a null is a voice, not a zero — a fabricated 0 would read
 *     "sold today").
 *   • deadSharePct = dead capital / TOTAL active inventory value (the
 *     same qty × cost sum over every active product, dead or not). A zero
 *     denominator shares ZERO — never NaN (the v2.205.0 honest-share law).
 *   • Rows sort by capitalTied DESC (the loudest debt first), tiebreak
 *     name ASC — deterministic, so the table never shuffles between runs.
 */

export interface DeadStockProduct {
  id: string;
  name: string;
  sku: string;
  quantityInStock: number;
  costPrice: number;
  pricePerUnit: number;
  reorderLevel: number;
  unitType: string;
  categoryName: string | null;
}

export interface DeadStockRow {
  productId: string;
  name: string;
  sku: string;
  categoryName: string | null;
  quantityInStock: number;
  costPrice: number;
  pricePerUnit: number;
  reorderLevel: number;
  unitType: string;
  capitalTied: number;
  lastSoldAt: string | null;
  daysIdle: number | null;
}

export interface DeadStockSummary {
  days: number;
  deadCount: number;
  totalCapitalTied: number;
  totalStockValue: number;
  deadSharePct: number;
}

const DAY_MS = 24 * 60 * 60 * 1000;

/** round2 — the financialMath convention, local so the module stays
 *  dependency-free (the route's toDec/round2 import is for its own
 *  Decimal walk; the classifier speaks plain numbers). */
const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

export function classifyDeadStock(
  products: DeadStockProduct[],
  lastSoldAtByProduct: Map<string, string | null>,
  now: Date,
  days: number,
): { rows: DeadStockRow[]; summary: DeadStockSummary } {
  const cutoff = now.getTime() - days * DAY_MS;

  let totalStockValue = 0;
  const candidates: DeadStockRow[] = [];

  for (const p of products) {
    const qty = Number(p.quantityInStock);
    const cost = Number(p.costPrice);
    const stockValue = qty * cost;
    totalStockValue += stockValue;

    if (qty <= 0) continue; // an empty shelf carries no capital — not dead stock

    const lastSoldAt = lastSoldAtByProduct.get(p.id) ?? null;
    const lastSoldMs = lastSoldAt ? new Date(lastSoldAt).getTime() : null;
    // NEVER sold (null) is always past any window; a sale inside the
    // window keeps the product alive.
    if (lastSoldMs !== null && lastSoldMs >= cutoff) continue;

    candidates.push({
      productId: p.id,
      name: p.name,
      sku: p.sku,
      categoryName: p.categoryName,
      quantityInStock: qty,
      costPrice: round2(cost),
      pricePerUnit: round2(Number(p.pricePerUnit)),
      reorderLevel: Number(p.reorderLevel),
      unitType: p.unitType,
      capitalTied: round2(stockValue),
      lastSoldAt,
      daysIdle: lastSoldMs !== null ? Math.floor((now.getTime() - lastSoldMs) / DAY_MS) : null,
    });
  }

  candidates.sort((a, b) => b.capitalTied - a.capitalTied || a.name.localeCompare(b.name));

  const totalCapitalTied = round2(candidates.reduce((s, r) => s + r.capitalTied, 0));
  const totalStockValueRounded = round2(totalStockValue);
  const deadSharePct = totalStockValueRounded > 0
    ? Math.round((totalCapitalTied / totalStockValueRounded) * 1000) / 10
    : 0;

  return {
    rows: candidates,
    summary: {
      days,
      deadCount: candidates.length,
      totalCapitalTied,
      totalStockValue: totalStockValueRounded,
      deadSharePct,
    },
  };
}

/** The windows the lens speaks — the route validates against this tuple,
 *  the tab's chips read the same three words. ONE home. */
export const DEAD_STOCK_WINDOWS = [30, 60, 90] as const;
export type DeadStockWindow = (typeof DEAD_STOCK_WINDOWS)[number];

// ============================================================================
// v2.462.0 THE RESTING LEDGER LEARNS TO SHARE AND TO ASK
// ============================================================================
// Two pure voices join the classifier's home, so the desk stays thin and
// the suite proves both without a database:
//   • capitalTiedByCategory — the chart's own grouping: the rows' capital
//     summed per category (the honest "Uncategorised" word when the shelf
//     never named one), loudest rest first with the name tiebreak — the
//     same deterministic order the rows themselves wear.
//   • deadStockClearanceNote — the Ask button's word: a deterministic,
//     WhatsApp-ready clearance note built ONLY from the row's own numbers
//     and the window that caught it. No supplier name is invented (the
//     row carries none), no date is locale-shaped (the ISO day speaks —
//     a clipboard word must read the same on every machine), and the
//     never-sold row says so instead of wearing a fabricated age.
// --------------------------------------------------------------------------

/** round2 — the classifier's own convention (the local twin above). */
const round2b = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

/** THE CAPITAL'S SHAPE (v2.462.0) — capital tied, summed per category.
 *  A row whose shelf never named a category speaks "Uncategorised" (the
 *  ledger's own word — the chart must never drop resting capital because
 *  a label is missing). Sorted capital DESC with the name tiebreak, so
 *  the same rows always draw the same shape. Pure. */
export function capitalTiedByCategory(
  rows: ReadonlyArray<DeadStockRow>,
): { label: string; value: number }[] {
  const map = new Map<string, number>();
  for (const row of rows) {
    const label = row.categoryName ?? 'Uncategorised';
    map.set(label, (map.get(label) ?? 0) + row.capitalTied);
  }
  return [...map.entries()]
    .map(([label, value]) => ({ label, value: round2b(value) }))
    .sort((a, b) => b.value - a.value || a.label.localeCompare(b.label));
}

/** THE MAKER'S WORD (v2.462.0) — the clearance note the Ask button
 *  carries to the clipboard. Deterministic by law: the ISO day (the
 *  date's own first ten characters), the capital at cost with two
 *  decimals, the base unit named (the UoM law — "40 METER" is forty
 *  metres, never forty pieces), and the window that caught the row. The
 *  never-sold row speaks its honest absence instead of an invented age.
 *  Pure. */
export function deadStockClearanceNote(row: DeadStockRow, days: number): string {
  const idleVoice = row.lastSoldAt && row.daysIdle != null
    ? `idle ${row.daysIdle} days (last sold ${row.lastSoldAt.slice(0, 10)}`
    : 'never sold (no sale on this shelf\'s record';
  return `Clearance ask — ${row.quantityInStock} ${row.unitType} × ${row.name} (${row.sku}): Ksh ${row.capitalTied.toFixed(2)} tied at cost, ${idleVoice}, caught by the ${days}-day window). Can we talk an exchange?`;
}

// ============================================================================
// v2.463.0 THE RESTING LEDGER LEARNS TO REACH OUT
// ============================================================================
// The clearance note learns its own door. The Ask handle carries the note
// to the clipboard; the share handle opens the maker's own WhatsApp with
// the SAME note already composed — one voice, two doors, zero retyping.
//
// The note has no recipient (the row carries no supplier name — the
// v2.462.0 law), so the URL speaks wa.me WITHOUT a phone: WhatsApp opens
// with the text pre-filled and the maker picks the chat. The
// recipient-addressed instrument (openWhatsApp, src/lib/api.ts) stays
// api.ts's own — a phone-bearing word this row does not carry.
//
// v2.467.0 THE DOOR LEARNS THE STORE'S OWN NUMBER — the law above grows
// its honest second face. The STORE has a phone on file (the Store
// model's own column, the seed's Juja word 0795191909), and a store that
// answered the census deserves a door addressed to itself: when the desk
// hands the composer a store phone, the wa.me word pre-addresses —
// `https://wa.me/<digits>?text=...` — and WhatsApp opens straight into
// the store's own chat, the note untouched. The normalization lives HERE
// (the share URL's own home) as a PURE word — the same rules the api.ts
// door speaks (spaces/dashes/parens stripped, the 0-prefix grown to 254,
// the + shaved), but never a DOM import: lib/report files stay pure.
// A store without a phone (or an empty/null word) keeps the picker door,
// byte-for-byte the v2.463.0 word — silence is the honest no-address.

/** THE STORE'S OWN DIGITS (v2.467.0) — the share door's pre-address
 *  normalizer. The SAME rules openWhatsApp (src/lib/api.ts) speaks —
 *  spaces, dashes and parentheses stripped; a leading 0 grown to the
 *  254 country code (the Kenyan mobile's own word); a leading + shaved —
 *  but PURE, so the ONE home can wear the address without importing a
 *  DOM door. An empty word answers empty: no digits, no address. Pure. */
export function waMeDigits(phone: string): string {
  let normalized = phone.replace(/[\s\-()]/g, '');
  if (normalized.startsWith('0')) normalized = '254' + normalized.substring(1);
  if (normalized.startsWith('+')) normalized = normalized.substring(1);
  return normalized;
}

/** THE DOOR'S DISPLAY WORD (v2.467.0) — the address as the desk's chip
 *  shows it: the normalized digits under a + (the wa.me convention's own
 *  reading — the URL never carries the +, the chip does). An empty word
 *  answers empty — a chip with no number would be a lie. Pure. */
export function waMeDisplay(phone: string): string {
  const digits = waMeDigits(phone);
  return digits ? `+${digits}` : '';
}

/** THE SHARE'S OWN DOOR (v2.463.0) — the wa.me word for the clearance
 *  note. The note's composer rides UNCHANGED (one voice, two doors — the
 *  clipboard and the chat can never drift apart), and the URL is the
 *  encodeURIComponent of the same deterministic word, so the chat reads
 *  exactly what the clipboard holds.
 *  v2.467.0: the door learns the store's own number — an optional THIRD
 *  word, the store phone. Digits after the normalize answer as the
 *  pre-addressed door (`https://wa.me/<digits>?text=...`, the SAME text —
 *  only the address grows); no phone, an empty word, or one that
 *  normalizes to nothing keeps the picker door byte-for-byte. Pure. */
export function deadStockShareUrl(row: DeadStockRow, days: number, storePhone?: string | null): string {
  const digits = storePhone ? waMeDigits(storePhone) : '';
  const base = digits ? `https://wa.me/${digits}` : 'https://wa.me/';
  return `${base}?text=${encodeURIComponent(deadStockClearanceNote(row, days))}`;
}

// ============================================================================
// v2.465.0 THE LEDGER SPEAKS IN ONE BREATH
// ============================================================================
// The clearance note learns its COLLECTIVE voice. The Copy all handle in
// the ledger's header carries every row's note to the clipboard at once —
// and the collective word is composed HERE, in the ONE home, never in the
// desk: the header line speaks the ledger's own summary (the count, the
// window, the capital at cost), and every line under it is the SAME
// deadStockClearanceNote the Ask copies and the share door sends. One
// voice, four doors — the clipboard's Ask, the chat's share, the sheet's
// note cell, and now the whole note column in one breath — and the chorus
// can never drift from the rows it sings about. Pure.
//

/** THE CHORUS'S OWN HEADER (v2.471.0) — the collective word in one
 *  sentence: the count, the window, the capital at cost. Extracted from
 *  deadStockClearanceNotes (whose byte it already was) so the word can
 *  ride MORE doors than the clipboard — the file's footer joins the
 *  chorus without re-typing it — and so the clipboard's chorus and the
 *  sheet's footer can never drift apart. The capital is the round2 of
 *  the rows' own sum — the same convention the summary's
 *  totalCapitalTied wears, so the header's number and the summary
 *  card's number agree for the same rows. Pure. */
export function deadStockChorusHeader(rows: ReadonlyArray<DeadStockRow>, days: number): string {
  const capital = round2b(rows.reduce((s, r) => s + r.capitalTied, 0));
  return `Clearance asks — ${rows.length} product${rows.length === 1 ? '' : 's'} resting past the ${days}-day window (Ksh ${capital.toFixed(2)} tied at cost):`;
}

/** THE LEDGER'S COLLECTIVE WORD (v2.465.0) — every row's clearance note
 *  joined under a header that speaks the ledger's own summary. The
 *  header line is the ONE home's own chorus header (v2.471.0 — the same
 *  word the file's footer speaks, never a re-typed twin), and the
 *  per-row lines are the ONE composer's own voice, never a re-typed
 *  word. Pure. */
export function deadStockClearanceNotes(rows: ReadonlyArray<DeadStockRow>, days: number): string {
  return [deadStockChorusHeader(rows, days), ...rows.map((r) => deadStockClearanceNote(r, days))].join('\n');
}

// ============================================================================
// v2.472.0 THE LEDGER ANSWERS TO ITS OWN COLUMNS
// ============================================================================
// The ledger learns its SORT DOOR. The rows have always arrived in the
// classifier's own standing order (capitalTied DESC, name ASC — the
// loudest debt first); the desk's Capital tied and Days idle headers now
// carry that order as a chosen word, so the maker can read the shelf by
// the money it holds OR by the patience it has spent. The orders live in
// the ONE home (pure, deterministic, suite-proven), never hand-sorted on
// the desk.
//
// THE TWO HONEST ORDERS:
//   • 'capital' — the classifier's own standing order, byte-for-byte:
//     capitalTied DESC, name ASC. The door's resting face: pressing it
//     (or never pressing anything) is the order the desk has always
//     spoken.
//   • 'idle' — the shelf's patience: longest idle first, and the
//     never-sold row stands at the FRONT (its null daysIdle is a voice,
//     not a zero — a fabricated 0 would read "sold today"; never sold is
//     the deadest a shelf can be). Ties break by the louder debt, then
//     the name — the same deterministic chain the classifier speaks.
//
// THE VIEW/Archive LAW: the sort is a LENS, never a rewrite. The file
// (the CSV), the clipboard (the copy all chorus) and the print door keep
// the canonical `rows` order — the archive's word stays deterministic
// whatever the desk is looking at. Only the table's own body follows the
// pressed column.

export type DeadStockSortKey = 'capital' | 'idle';

/** THE ORDERS AS WORDS (v2.481.0) — the sort door's address vocabulary:
 *  the two honest orders read as WORDS through the generic parser (the
 *  window tuple's own law — a made-up order, `asc`, `desc`, `name`, is
 *  an unknown word, not a clever match). The ONE home keeps the tuple;
 *  the desk only reads it. */
export const DEAD_STOCK_SORTS: readonly DeadStockSortKey[] = ['capital', 'idle'];

/** THE LEDGER'S OWN ORDERS (v2.472.0) — the two honest orders the sort
 *  door speaks, composed HERE so the desk never hand-sorts. Returns a
 *  NEW array (the input is never mutated — the canonical order the file,
 *  the clipboard and the print door speak stays whole). Deterministic:
 *  the same rows always draw the same order, no NaN anywhere (the two
 *  never-sold rows compare by the tiebreak chain, never by an infinity
 *  arithmetic). Pure. */
export function sortDeadStockRows(
  rows: ReadonlyArray<DeadStockRow>,
  key: DeadStockSortKey,
): DeadStockRow[] {
  const copy = [...rows];
  if (key === 'capital') {
    copy.sort((a, b) => b.capitalTied - a.capitalTied || a.name.localeCompare(b.name));
    return copy;
  }
  copy.sort((a, b) => {
    const aNever = a.daysIdle == null;
    const bNever = b.daysIdle == null;
    if (aNever !== bNever) return aNever ? -1 : 1;
    const byIdle = (b.daysIdle ?? 0) - (a.daysIdle ?? 0);
    if (byIdle !== 0) return byIdle;
    return b.capitalTied - a.capitalTied || a.name.localeCompare(b.name);
  });
  return copy;
}

// ============================================================================
// v2.473.0 THE LEDGER ANSWERS TO ITS OWN NAME
// ============================================================================
// The ledger learns its SEARCH DOOR. The rows already carry the words a
// maker reaches for — the name, the SKU, the category — and the desk now
// answers to them as they type: a small lens above the table, composed
// HERE in the ONE home (the desk never hand-filters, the same law the
// sort door speaks), so the lens and the door can never drift apart.
//
// THE HONEST LENS:
//   • The trimmed word is the honest word — "  cement  " asks for
//     `cement`, never for the padding around it.
//   • The case never matters — the shelf's own casing is the shelf's
//     business (`CEM-01`, `cem-01` and `Cem-01` are one question).
//   • An empty (or whitespace-only) lens RESTS: the whole ledger comes
//     back in its arrival order — a resting lens is the desk opening
//     exactly as it always has.
//   • A row whose shelf never named a category still answers on its name
//     and SKU — the null is a voice, never a crash. And since v2.474.0
//     the lens answers THE LEDGER'S OWN WORD for that shelf: the shape
//     (the capital-by-category chart) calls the unnamed shelf
//     "Uncategorised", and a press on that segment rides the word into
//     the lens — so the lens answers it (the shape and the lens share
//     ONE vocabulary; a press that answered nothing would be a lie).
//
// THE VIEW/ARCHIVE LAW (the sort door's own law, grown one lens): the
// search is a VIEWER, never a rewrite. The file (the CSV), the clipboard
// (the copy all chorus) and the print door keep the canonical `rows` —
// the archive's word stays the WHOLE ledger whatever the lens is looking
// at. The lens composes with the sort door: the filtered rows are what
// the pressed order leads, never the other way round (filter first, then
// sort — a narrower shelf wearing the same honest order).
// THE SHAPE'S OWN LAW (v2.474.0): the shape keeps the WHOLE ledger's
// capital — the chart reads the canonical `rows` (never the lensed
// view), so the picture never narrows whatever the lens is looking at.
// A press only RIDES the segment's word into the lens; it never redraws
// the shape to match the answer.

/** THE LEDGER'S OWN LENS (v2.473.0; the shape's word joined v2.474.0) —
 *  the rows that answer to the query, matched case-insensitively on the
 *  words a row already carries: the name, the SKU, the category. A null
 *  category speaks as the ledger's own "Uncategorised" word — the same
 *  word the capital-shape chart already calls the unnamed shelf (the
 *  shape's press rides that word into the lens, so the lens answers it;
 *  the row still answers on its name and SKU besides). The trimmed query
 *  is the honest word; an empty or whitespace-only lens RESTS and the
 *  whole ledger comes back in its arrival order. Returns a NEW array —
 *  the input is never mutated (the canonical order the file, the
 *  clipboard and the print door speak stays whole). Deterministic: the
 *  same rows and the same word always draw the same answer. Pure. */
export function filterDeadStockRows(
  rows: ReadonlyArray<DeadStockRow>,
  query: string,
): DeadStockRow[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return [...rows];
  return rows.filter((r) =>
    r.name.toLowerCase().includes(needle) ||
    r.sku.toLowerCase().includes(needle) ||
    (r.categoryName ?? 'Uncategorised').toLowerCase().includes(needle),
  );
}

// ============================================================================
// v2.475.0 THE VIEW SPEAKS ITS OWN WORD
// ============================================================================
// The pressed lens learns its own mirror. The count badge has spoken the
// honest fraction since v2.473.0 ("2 of 6 products") — the view's SIZE —
// and now the view's MONEY speaks too: a footer under the table names the
// rows the lens is looking at, the capital they tie at cost, and the
// slice of the ledger's own rest they hold. The summary cards above keep
// speaking the WHOLE ledger; a footer that repeated them would be a
// stutter, so the word only sounds while the lens is pressed AND rows
// answer (a lens that answers nothing already wears its own empty face).
//
// THE VIEW/ARCHIVE LAW, UNTOUCHED: this is the VIEW's own word, spoken
// about what the desk is LOOKING at — the file (the CSV), the clipboard
// (the copy all chorus) and the print door still keep the canonical
// `rows` byte-for-byte. The arithmetic lives HERE in the ONE home (the
// desk never hand-sums), pure and deterministic, and the honest-share law
// the summary has always worn (a zero denominator shares ZERO, never
// NaN) guards the slice: an empty ledger's view speaks zero, the same
// honest word deadSharePct has spoken since v2.205.0.

/** THE VIEW'S OWN SUMMARY (v2.475.0) — the pressed lens's mirror: the
 *  view's row count, the view's own capital at cost (the round2 of the
 *  rows' own sum — the same convention the summary's totalCapitalTied
 *  wears, so the footer's number and the cards' numbers agree in
 *  convention), and the view's slice of the ledger's whole rest (the
 *  view capital over the ledger capital, one decimal — the same
 *  one-decimal word deadSharePct speaks; a zero ledger shares ZERO,
 *  never NaN). Pure: neither array is ever mutated, a fresh object
 *  every call, the same rows always drawing the same word. */
export interface DeadStockViewSummary {
  count: number;
  capital: number;
  sharePct: number;
}

export function deadStockViewSummary(
  viewRows: ReadonlyArray<DeadStockRow>,
  ledgerRows: ReadonlyArray<DeadStockRow>,
): DeadStockViewSummary {
  const capital = round2b(viewRows.reduce((s, r) => s + r.capitalTied, 0));
  const ledgerCapital = round2b(ledgerRows.reduce((s, r) => s + r.capitalTied, 0));
  const sharePct = ledgerCapital > 0
    ? Math.round((capital / ledgerCapital) * 1000) / 10
    : 0;
  return { count: viewRows.length, capital, sharePct };
}

// ============================================================================
// v2.476.0 THE CHORUS RIDES THE CHAT DOOR
// ============================================================================
// The collective word learns its own reach-out. The chorus has ridden the
// clipboard (the Copy all handle, v2.465.0), the file (the CSV's Clearance
// chorus footer, v2.471.0) and the paper (the print door's closing
// appendix, v2.466.0) — but the CHAT door only ever spoke one row at a
// time. The ledger header grows the Share all handle beside the Copy all
// handle: one press opens WhatsApp with the WHOLE clearance chorus
// pre-filled — the SAME deadStockClearanceNotes bytes the clipboard
// carries, never a re-typed word — pre-addressed to the store's own chat
// when the branch keeps a phone on file, the picker door otherwise (the
// per-row share's own two faces, the v2.467.0 law grown collective).
//
// ONE VOICE, EVERY DOOR: the clipboard's copy all, the chat's share all,
// the sheet's note cells and chorus footer, the paper's appendix and its
// scannable doors — all of them speak the ONE home's own words, and none
// of them can drift. The view/archive law stands: the Share all handle
// sings the CANONICAL rows (the archive's word, the whole ledger — the
// same rows the Copy all handle carries), never the pressed lens's view.

/** THE CHORUS'S CHAT DOOR (v2.476.0) — the collective word's own wa.me
 *  URL: the FULL clearance chorus (the ONE home's own collective
 *  composer — the exact bytes the clipboard's Copy all handle carries)
 *  as the ?text= word; the store's digits after the normalize answer as
 *  the pre-addressed door (`https://wa.me/<digits>?text=...`), no phone,
 *  an empty word, or one that normalizes to nothing keeps the picker
 *  door byte-for-byte — the SAME two faces the per-row share speaks
 *  (v2.463.0/v2.467.0), now singing the whole ledger. The host word and
 *  the normalization live HERE, in the ONE home — the desk never spells
 *  either. Pure. */
export function deadStockChorusShareUrl(rows: ReadonlyArray<DeadStockRow>, days: number, storePhone?: string | null): string {
  const digits = storePhone ? waMeDigits(storePhone) : '';
  const base = digits ? `https://wa.me/${digits}` : 'https://wa.me/';
  return `${base}?text=${encodeURIComponent(deadStockClearanceNotes(rows, days))}`;
}
