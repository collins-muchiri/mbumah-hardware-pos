import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { WHATS_NEW, compareWhatsNewVersions, whatsNewMarkAllTarget, whatsNewReadState, whatsNewUnreadCount } from '@/lib/whats-new';

/**
 * v2.66.0 contracts — the console catches up on the news.
 *
 * Gap: the console's Changelog modal was a FROZEN v2.18.3-era list —
 * three hardcoded entries (v2.18.3 / v2.18.1 / v2.16.0) disconnected from
 * the app's WHATS_NEW feed that had grown to 66 entries. The console told
 * a two-year-old story while the POS app celebrated every release. A
 * manager opening the console never learned what shipped.
 *
 * Covered here:
 *  1. ChangelogModal renders the SAME WHATS_NEW source as the tabs shell's
 *     auto-dialog — newest first, latest release emerald-highlighted with
 *     a "latest" pill, older releases muted, per-entry testids.
 *  2. The backlog collapse: latest + 5 older render open; a "Show N older
 *     releases" button expands (and a "Show fewer" collapses) so the modal
 *     never drowns at 66+ entries.
 *  3. The shared seen flag: "Got it" writes mbt_seen_version = APP_VERSION
 *     (the same key the tabs shell's auto-dialog writes) — one flag across
 *     surfaces, no double-nag.
 *  4. The footer's Changelog button wears an SSR-safe "new" pill (mount
 *     gate via useSyncExternalStore) whenever unread release notes wait,
 *     with dark-mode-complete styling on footer, modal and entries.
 *  5. The business contacts block survives the rewrite.
 *  6. What's-New 2.66.0 leads with the catch-up story.
 */

const readRepo = (rel: string) => readFileSync(join(process.cwd(), rel), 'utf8');

// ── 1. The modal renders the real release feed ──────────────────────────────

describe('ChangelogModal - the console tells the whole release story', () => {
  const CHROME = readRepo('src/components/org/chrome.tsx');

  it('imports the shared WHATS_NEW feed (single source of truth)', () => {
    // v2.75.0 — the reading-state helpers ride the same import; v2.76.0
    // added the mark-all stamp, so the pin checks membership, not spelling.
    expect(CHROME).toContain("from '@/lib/whats-new';");
    expect(CHROME).toContain('WHATS_NEW');
    expect(CHROME).toContain('whatsNewReadState');
    expect(CHROME).toContain('whatsNewUnreadCount');
  });

  it('imports APP_VERSION alongside the build label', () => {
    expect(CHROME).toContain("import { APP_BUILD_LABEL, APP_VERSION } from '@/lib/version';");
  });

  it('the static v2.18.3-era story is gone', () => {
    expect(CHROME).not.toContain('v2.18.3 - Organization Console joins the unified lineage');
    expect(CHROME).not.toContain('v2.18.1 - Branch manager user-store binding');
    expect(CHROME).not.toContain('v2.16.0 - Subdomain workspaces');
  });

  it('splits the feed into latest + older (newest first)', () => {
    expect(CHROME).toMatch(/const \[latest, \.\.\.older\] = WHATS_NEW;/);
  });

  it('the latest entry wears the emerald treatment + a latest pill', () => {
    expect(CHROME).toMatch(/latest\s*\?\s*'rounded-xl border border-emerald-200 bg-emerald-50\/60 p-3 dark:border-emerald-500\/30 dark:bg-emerald-500\/10'/);
    expect(CHROME).toContain('data-testid="changelog-latest-pill"');
    expect(CHROME).toContain('<Sparkles className="h-2.5 w-2.5" aria-hidden /> latest');
  });

  it('every entry is keyed by version and testid-ed', () => {
    expect(CHROME).toMatch(/data-testid=\{`changelog-entry-\$\{entry\.version\}`\}/);
    expect(CHROME).toMatch(/visibleOlder\.map\(\(entry\) => \(\s*<ChangelogEntry key=\{entry\.version\}/);
  });

  it('the subtitle names the running version honestly', () => {
    expect(CHROME).toMatch(/You&apos;re on version \{APP_VERSION\}/);
    expect(CHROME).toContain('every release since the console joined the lineage, newest first');
  });

  it('the modal carries the changelog testid and keeps scrolling', () => {
    expect(CHROME).toContain('data-testid="changelog-modal"');
    expect(CHROME).toMatch(/className="max-h-\[85vh\] overflow-y-auto sm:max-w-xl"/);
  });

  it('entries render with dot markers in the tabs-shell language', () => {
    expect(CHROME).toMatch(/latest \? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'/);
  });

  it('is dark-mode complete (entries, both chip states, footer blocks)', () => {
    // v2.437.0: the taxman joins the door — one handle lights three fixture worlds: npm run db:fixtures grows its third face (the M-Pesa ledger's script leads, the exports world follows, the taxman's world closes the parade — six invoices speaking all five submission statuses, four audit rows for the submitted faces, eight tax filings across the four types and the schema-honest statuses, the sandbox profile — verified live on the current schema, idempotent), the exports world wears the schema's own default status (one PENDING history row — the one wire face the fixtures never spoke — the processing word's union answering it under processing and all, never stranded; the coherence law holds: a waiting row carries neither completion nor failure faces — the cascade's forty-eighth generation)
    // v2.436.0: the fixture world speaks its whole vocabulary — the two desks answer a fresh world: one door lights both fixture worlds (npm run db:fixtures — the M-Pesa ledger's script leads, the exports world follows), the exports world stands up twelve history rows (one per each of the TEN card types — 8 completed, 2 failed, 1 processing, both lenses speak non-zero on a fresh world — plus the TWO off-union faces the schema's own column comment keeps: PAYROLL completed, ALL failed — the deliberate pin, never a re-type), every completed row carries real inline content (a history row that lies about its file is not fidelity), the history table's unknown type wears the deliberate off-card badge (the row stays visible, the lens never guesses across the union), and the M-Pesa pane wears its status census (five faces counted from the same stored vocabulary the rows speak, the four status chips pressing through the ONE retirement door, the legacy derived face a count and never a lens word — the cascade's forty-seventh generation)
    // v2.435.0: the watch confesses its window — the idle lock wears a grace strip: the portal's thirty-minute lock no longer arrives without warning (the last 60 seconds grow the floating amber strip — "Still there? Signing out in Ns", role=status, aria-live=polite, the tabular countdown holding its lane, Stay signed in the one action), the re-arm law rides the hook's own reset (one reset owns both timers — the strip returns after another full window), the strip and the lock hang off the ONE setTimeout schedule (the countdown reaches zero exactly as the lock lands — the two clocks agree), the logout POST is guarded to fire at most once (the didTimeoutRef idempotence), the hook grows the OPTIONAL grace options (warnBeforeMs + onWarning — the till passes none, its v2.6.0 contract byte-identical), and every sentence that speaks the window derives its number from the window constant (SELF_SERVICE_IDLE_MINUTES — the copy can never drift, the cascade's forty-sixth generation)
    // v2.434.0: the archive reads its own timeline — the maker's arc wears its words: the release changelog's story list grew the arc's own timeline (RELEASE_ARC — the fifteen words of the supplier-maker arc with their release days exactly as the tags record them, releaseArcWord — the pure lookup, a version outside the arc reads the null — the absent-control law), each arc word's entry wears the amber chip beside its line ("word 7 · Nov 6" — the walk's own Footprints glyph, the memory family's amber, tabular-nums, the title carrying the whole story: "the maker's arc — word 15 of 15, released 2026-11-07"), the short face speaks the day (arcWordFace — the MMM D brevity, an unparseable day reads itself — the honest fallback), the arc never leaves the archive (every word's version lives in the feed) and the announcement dialog stays bare (one home, never a copy), and the new suite's pins caught the fake words before they ever shipped (the entry joins the feed — +1 on every unread anchor, the cascade's forty-fifth generation)
    // v2.433.0: the desk reads the door's memory — the carried strip wears the send's own stamp: the READING desk answers the door's memory (orderBlockRodeStamp — the strip's stamp word, pure: the desk's own verb "rode at" on the door's clock law, a null, a broken stamp, or no send this session reads the null, the honest absence), the derived gate rides orderStrip's own null-at-hydration (no state, no effect — the read never meets SSR), the stamp rides UNDER the echo line's quote-border (the memory sits under the quotation, the Footprints glyph, the quiet italic, tabular), and the stamp is a FACT never a gate (it never dresses the pen — the v2.422 derivation byte-kept — and a closed tab honestly forgets), and the new suite's 12 pins caught the honest absences before they ever shipped (the entry joins the feed — +1 on every unread anchor, the cascade's forty-fourth generation)
    // v2.432.0: the door remembers its send — the block menu wears the session's own memory: the inventory banner's census door grew the SENDING side's own session memory (orderBlockSendWord — the block's send word, pure: a null, a broken stamp, or no send this session reads the null, the honest absence; the viewer's own clock, zero-padded, exactly one colon — the census's own brevity), the record is component state never persisted (a reload honestly forgets — a menu claiming yesterday's sends would be a lie), the LAST send wins as the record overwrites, and the word is a FACT never a gate (the v2.430 census row byte-kept under the two-row item, the clock glyph's muted quiet, the block stays pressable — resending a maker updates the word the menu speaks), and the new suite's 12 pins caught the honest absences before they ever shipped (the entry joins the feed — +1 on every unread anchor, the cascade's forty-third generation)
    // v2.431.0: the desk answers the walk — the pocket's echo wears the walk's name: the carriage strip on the purchase order desk now answers the block-walk's receipt (orderHandoffPocketEcho — the strip's gate over the pocket's own word: the envelope's every-line-agrees maker read once as the map lands; agreement is no news — the pre-pick speaking the same name quiets the echo, never a repeated chip; a null, an empty, or a whitespace pocket reads the null, and the spoken name is the census's trimmed form), the amber chip rides the strip's header ("the walk named {maker}" — the walk's own house, never the pre-pick's sky) with the echo line's quote-border under the counts (the walk's words are a quotation, not the desk's own voice), the digest carries the pocket census beside the counts so the echo survives the one-way consumption exactly as the lines and units do, and the WORDS-ONLY law holds at the pen (the v2.422 derivation byte-identical — the shelf's live link or the actor's own call stays the only voice the supplier select wears), and the new suite's 13 pins caught the honest absences before they ever shipped (the entry joins the feed — +1 on every unread anchor, the cascade's forty-second generation)
    // v2.430.0: the census opens — each supplier's block rides to the desk alone: the inventory banner's census chip became the door (orderSupplierBlocks — the census's own grouping, pure: rows by trimmed maker, sorted by name, units summed over the gaps; an unnamed row never invents a block, and a block whose whole ask is zero is refused — the nothing-to-order law, per block), the trigger wears the v2.421 census bytes with the chevron the door's one new word (one inv-order-supplier-block item per maker carrying the block's own line-and-unit census — the chip's number and the menu's items share the same rows, the two can never disagree), each press folds ONLY that maker's rows into the same pocket the whole order uses (buildOrderHandoff over block.rows, the one-way write, the walk, the receipt naming the maker — "carried for {supplier}"), and the whole-order Send keeps its own face beside the door, and the new suite's 12 pins caught the honest absences before they ever shipped (the entry joins the feed — +1 on every unread anchor, the cascade's forty-first generation)
    // v2.429.0: the follow-up answers the toast — the shortfall's echo names the last receipt: the drill's follow-up pill grew the echo (receiveShortfallEcho — "named by the last receipt", the honest gate mirrors the pointer's own: a null, a zero, or a number that is not one reads the null — never a fake echo, never an echo on a full receipt), the callback crosses the close (the ReceiveItemsDialog's additive + optional onShortSubmit hands the drill the receipt's own truth — the short units when the pointer speaks, the honest null when the receipt was full — the echo belongs to the short receipt alone, and the drill's close ends the arc, a reopened drill starts honest), and the paint deepens (the ring-2 sky-400 echo ring over the plain census ring, the echo line's byte-identical sky family one home with the pointer's words), and the new suite's 12 pins caught the honest silences before they ever shipped (the echo speaks NO units — the pill's own words carry them — the entry joins the feed — +1 on every unread anchor, the cascade's fortieth generation)
    // v2.428.0: the toast points at the follow-up — the shortfall survives the close: the success toast grew the pointer's own second line (receiveShortfallPointer — the units still owed and where the follow-up waits, "N units still owed — the follow-up waits on the order's face", the honest gate reads zero, a negative, a NaN and an infinity as the null — a full receipt points nowhere, never a fake pointer), the plan rides the submit (the pens' truth at the press travels with the mutation, so the pointer speaks what WAS submitted, never a later render's guess; the gate reads the plan's own empty beside the payload's length — the two gates agree by the fill's law), and the pointer wears the follow-up door's own sky (the conditional description, the byte-identical family the maker chip and the drill's pill taught), and the new suite's 11 pins caught the honest silence before it ever shipped (the old bare toast byte retired — the entry joins the feed — +1 on every unread anchor, the cascade's thirty-ninth generation)
    // v2.427.0: the shortfall's own door — the drill wears the follow-up: the Receiving Progress card grew the follow-up pill (po-drill-followup-call — the sky census family the receipt's own call door taught, the Phone icon, "Follow up with {maker} — {units} units short", the day's contact speaking through the title — conditional: no maker, no phone, or nothing short and the card stays silent, never a fake door, never a dead dial), the door's honest read lives in the receive's one home (drillFollowUpDoor — the door exists only when the order OWES and the maker carries a real phone, the dial's grace trims even a caller-supplied phone), and the receive dialog stops being day-blind (receive-expected-day — the expected day's voice, the v2.418 one home, the metric families' own shade, the strip conditional on a real day), and the new suite's 14 pins caught the dial's grace gap before it ever shipped (the entry joins the feed — +1 on every unread anchor, the cascade's thirty-eighth generation)
    // v2.426.0: the receipt names its maker — the receive face learns the supplier's day: the receive dialog grew the maker chip (receive-supplier-chip — the sky census family the rows taught, the Truck icon, "via {name}" — conditional: a wire without the maker stays silent, never a fake via) and the call door (receive-supplier-call — the tel: door gated on the maker's own phone, the day's contact speaking through the title), the toast names the day (receiveSuccessVoice's two faces — "Items received and stock updated — {maker}'s goods are on the shelf", the old byte when the read found nothing), the day's honest read lives in the receive's one home (receiveMaker — a trimmed non-empty name makes the maker, the whitespace and non-string arrivals read the absence), and THE DOM'S LAW healed the div-in-p hydration wound the opening burst caught on the detail's own description (the faces stay phrasing content now), and the new suite's 15 pins caught the whitespace leak before it ever shipped (the entry joins the feed — +1 on every unread anchor, the cascade's thirty-seventh generation)
    // v2.425.0: the carried row knows its maker — every PO line wears its own via: the purchase-order desk's rows grew the per-row maker (OrderHandoffPoItem.supplierName — the pocket's own seed shape now ONE home for the dialog's state and the restock-sheet's picks too), the map reads it from the LIVE shelf's link (the pre-pick's ledger voice — the envelope's names never feed it, the stale-pocket law now per-row), the hand-built rows (search add, low-stock add) read the same link, and the sub-line wears the sky census family the strip's chip taught (po-row-supplier, the Truck icon, "via {name}" — conditional: an unnamed row stays silent, never a fake via; the pre-pick's whole-order law unchanged), and the new suite's 10 pins caught the stale-pocket word before it ever shipped (the entry joins the feed — +1 on every unread anchor, the cascade's thirty-sixth generation)
    // v2.424.0: the shelf answers its debt — the drill grows the reorder press: the sheet's footer wears the debt's own strip (the census speaks what the order would carry — "2 products owe 30 units to reorder") and the press ("Reorder this shelf") folds the owed rows into the SAME pocket the inventory banner uses (one envelope, the same one-way laws), closes the sheet, and walks to the PO desk — the create form opening with the rows pre-picked, the maker's pen dressed by the desk's own pre-pick law; the owed arithmetic reads restockNeedsAttention's own nothing-to-order law (an order line asking 0 units would be a lie with a checkbox), the id is the truth (a stale row never rides another supplier's order), and the honest faces hold (amber only when owed, emerald only when every row is healthy, the disabled press keeping its voice), and the new suite's pins caught the boundary split before it ever shipped (the entry joins the feed — +1 on every unread anchor, the cascade's thirty-fifth generation)
    // v2.423.0: the supplier opens its shelf — the Products chip is a door to what it provides: the chip grows the PRESS (a right-side shelf drill listing every product the supplier provides — name, SKU, units, price — without leaving the roster, the row's own click still the detail drill, the zero chip pressable with its honest empty face), the sheet's summary reads the grouping strip's OWN reduce keyed to the supplier (supplierShelfSummary — a stale wire row never rides another supplier's shelf), the rows wear the inventory desk's low-stock family (shelfRowState: out / low at-or-under the level / ok, the string grace guarding the lexicographic wound) with the owed units floored at zero (shelfShortfall), and the wire grew the door too (/products answers ?supplierId= — the drill never downloads the whole catalog), and the new suite's 23 pins caught the family boundary before it ever shipped (the entry joins the feed — +1 on every unread anchor, the cascade's thirty-fourth generation)
    // v2.422.0: the walk's order knows its maker — the supplier rides from the banner into the PO desk's pen: the handoff pocket's fold carries every line's supplier name (absent rows ride null — the honest absence), the shape law tolerates the older envelopes (no field reads v2.416–v2.421 mail, null reads the absence, anything else refuses the WHOLE envelope), the map derives the pre-pick from the shelf's own link only when EVERY mapped line names the same maker (two makers, or a maker and an absence, dissolve it — the envelope's names never feed it), the dialog dresses the supplier select among its OWN active list and the carriage strip wears the sky chip ('via {name}', retiring the moment the actor names a different supplier), the send toast and title speak 'for {name}' (the census's second reader), and the new suite's 28 pins caught the re-seeding ledger bug before it ever shipped (the entry joins the feed — +1 on every unread anchor, the cascade's thirty-third generation)
    // v2.421.0: the restock order rides with its supplier — one block per supplier, ready for each chat: the low-stock banner's copy/download faces group the order into per-supplier blocks when the rows' world names ANY supplier (named blocks alphabetical, the honest-absence block 'No supplier yet:' always LAST, the selector's own sort holding inside every block, a blank line between blocks, the header and the count line staying global), a world that never names suppliers reads the FLAT order byte-for-byte as v2.414 shipped it (the formatter never invents a fact the caller didn't hand it), the banner wears the census chip ('via N suppliers', the sky family, only when earned) beside the item count, the copy button's title tells the truth about the blocks, and the new suite caught the char-splitting spread before it ever shipped (the entry joins the feed — +1 on every unread anchor, the cascade's thirty-second generation)
    // v2.420.0: the shelf remembers its supplier — the inventory desk answers 'who provides this?': the Product schema grows its own nullable supplierId (the honest absence, no backfill required and no row lies, the FK to suppliers ON DELETE SET NULL, the lens's own index), the ONE arithmetic home (buildSupplierGroups) groups the shelf by supplier with the Decimal grace carried (string arrivals read honest numbers — never a concat), the inventory desk wears the sky lens strip (every supplier a card — products, units, shelf value; one press filters the roster; the 'No supplier yet' card is a REAL group for the unassigned, never hidden and never guessed a name; the census chip speaks 'N suppliers · M products placed · K waiting'), named rows carry the quiet 'via Supplier' sub-line (the absence stays silent there), both form faces grow the supplier select behind the wires' SAME-STORE DOOR (a cross-store assignment is refused, never guessed; '' clears honestly), the suppliers desk answers with its Products chip (sky when placed, honest at zero) and its CSV column, and the seed's idempotent pass names the real-world makers (the entry joins the feed — +1 on every unread anchor, the cascade's thirty-first generation)
    // v2.419.0: the drill wears the receive's truth — the PO desk's lines speak their shortfall: the drill's line rows read the SAME one home the receive dialog reads (receiveRowState with the pen at rest — the committed truth, never a second copy of the arithmetic), so a fully received line speaks 'fully received' in the emerald family, a short line speaks its shortfall COUNTED ('short by N units', the singular honest) in the amber family, an untouched line speaks 'nothing received yet' (the bare 'Partial' word retired), every line carries the dialog's own span meter (role=img, aria-labelled), and the Receiving Progress card speaks the plan's truth — lines fully received, the shortfall summed, 'the order completes' when every line is closed (the entry joins the feed — +1 on every unread anchor, the cascade's thirtieth generation)
    // v2.418.0: the day gets named — the PO desk speaks the expected day: the walk's carried order opens the create dialog with a day suggested seven days out (suggestExpectedDay, from the walk's own instant — the pen stays the actor's, a manual New PO keeps the empty pen), the roster's Expected Date cell speaks (the date with the day's own voice under it — rose late, amber today, blue soon, green arrived-on-time, the metric families' own shades — and the bare '-' retired for the honest 'no day named'), and the received split calls the METRIC's own predicate (THE AGREEMENT LAW — a cell and a tile can never disagree about what late means) (the entry joins the feed — +1 on every unread anchor, the cascade's twenty-ninth generation)
    // v2.417.0: the receive fills itself — the receive dialog stops being a bare wall of pens: the quick fills land (Fill all remaining tops every open pen up to its line's remaining units in one press — buildReceiveInitials, the REMAINING LAW's one home; Clear all empties them; each open row carries its own Fill pen), the short-receive face speaks (a line receiving more than 0 but less than its remaining wears the amber family — row, pen ring and the words 'short by N', one read receiveRowState painting and speaking together) and the receive-plan strip speaks the pass before the commit (describeReceivePlan counts over OPEN lines only — a finished order can never speak as partial; emerald when the order completes, amber when lines run short or stay untouched, muted before anything is set) (the entry joins the feed — +1 on every unread anchor, the cascade's twenty-eighth generation)
    // v2.416.0: the order's handover — the banner's pair grows its third face: Send (testid inv-order-send) folds the same order rows into a sessionStorage pocket (buildOrderHandoff — the reorder gap is the ask, the nothing-to-order law defends the fold too) and walks the shell to the purchase-order desk, whose create dialog opens with the carried rows pre-picked (mapOrderHandoffToPoItems — a sku the shelf no longer knows is dropped and COUNTED, a cost the gate hides leaves the pen empty) under an amber carriage strip that speaks lines, units and the honest drop; the pocket is one-way (consumed once at mount, a manual New PO never inherits a birth by accident — the ?restockFrom= door's own law) (the entry joins the feed — +1 on every unread anchor, the cascade's twenty-seventh generation)
    // v2.415.0: the order file leaves the desk — v2.414.0's copy face grows its download sibling: the banner's pair (Copy order + Download, testid inv-order-download) mounts together or not at all (the same honest absence gates both), the SAME order bytes leave as a NAMED text file via restockOrderFileName(storeSlug, at) → mbumah-restock-<slug>-<YYYYMMDD>-<HHmm>.txt (zero-padded, the branch's slug rides verbatim — two branches' orders on the same day never argue about which file is which), the Saved beat wears the same emerald success family as the Copied beat (the two-beat law, twice over), a refused save answers with an honest toast, and the Blob's object URL revokes itself (the entry joins the feed — +1 on every unread anchor, the cascade's twenty-sixth generation)
    // v2.414.0: the order list hands you the words — the support copy family's trick reaches the floor's oldest chore: the low-stock banner gains the Copy order button (testid inv-order-copy), one pure formatter (src/lib/stock-order.ts) turns the wire's product rows into a plain-text restock order (MBUMAH HARDWARE — RESTOCK ORDER, branch + date, the count, then [OUT]/[LOW] lines sorted out-first, deepest gap, sku word — each naming on hand / reorder / order), the honest absences hold twice (no rows → no button; the NOTHING-TO-ORDER LAW — an out shelf with reorder 0 asks for nothing and is never spoken), and the copy face rides the banner's own amber family at rest and the emerald success family on the Copied beat (Copy → Copied → Copy after the 2s beat, the icons swap with the words — the support copy family's two-beat law) (the entry joins the feed — +1 on every unread anchor, the cascade's twenty-fifth generation)
    // v2.413.0: the census rides the org desk — v2.412.0's admin-card echo reaches the desk that reads but cannot write: the Organization Console renders the same provenance census under its header row (N admin-set · N API · N built-in beside the fresh/aging/stale age dot) spoken WITHOUT opening the currency menu — one shared cache, the observer law (enabled:false, the switcher's mount fetch fills it, the strip never fetches), the quiet neutral surface kept because the amber invitation is the ACTOR's voice and the org reader is not the actor (the switcher's own footer still names the door), and the password-rotation guard's request type shrinks to what it actually reads ({ url: string } — a real NextRequest satisfies it structurally, and so does the tests' honest fake — six strict-mode faces stand down, 287 → 281) (the entry joins the feed — +1 on every unread anchor, the cascade's twenty-fourth generation)
    // v2.412.0: the census echoes — v2.411.0's maintenance voice reaches the door it named: the Exchange Rates admin card renders the same provenance census the top-bar dropdown shows (same wire — the shared ADMIN_CURRENCY_RATES_QUERY_KEY — and the same pure voices, rateCensus and wireAgeVoice), the card's own amber invitation names the action instead of the door (the admin is already standing on it — set one with the Set rate action), a maintained census silences both voices, the echo strip's tone follows its census scale-honest to a panel, the credits ledger's print handler speaks the row the desk actually hands it (CreditLedgerRow — the wire's credit widened by the running balance the memo computes), and the banking recon dialog loses its phantom approver line (dead UI reading a field the wire never carried — four strict-mode faces stand down, 291 → 287) (the entry joins the feed — +1 on every unread anchor, the cascade's twenty-third generation)
    // v2.411.0: the census speaks first — v2.410.0's rate census strip gains its honest follow-through: when every row on the wire is a factory figure (no admin-set, no API), the strip renders a quiet amber invitation naming the door that fixes it (the Exchange Rates card on the System tab), a maintained census stays silent (no nagging — one admin-set or API row and the invitation is gone), the strip's tone follows its census (amber invitation family vs the quiet neutral surface), and the payroll engine's six money inputs are coerced with Number() at the BOUNDARY (Prisma's decimal.js objects never reach the engine's numbers — the widen-and-fix law), the leave allocation's available figure rides the same law, and the payroll tab's terminate mutation names its envelope (eight strict-mode faces stand down, 299 → 291) (the entry joins the feed — +1 on every unread anchor, the cascade's twenty-second generation)
    // v2.410.0: the wire answers on mount — BUG 1 (carried since Task 125) closed with four instrumented agent-browser bursts: on the console and org desks the switcher's two open-gated queries (`enabled: opened`, the v2.212.0 laziness law) NEVER fetched — the dropdown visibly opened while zero requests left the browser (resource-timing empty, dev log silent, in-page fetch logger empty; a mid-boot open DID fetch, and one run showed the whole switcher remount, trigger open → gone → closed), so both wires now answer on mount (the seed already asked the branch-default wire every page load anyway), the open is pure display again, and the footer gains the rate census strip (N admin-set · N API · N built-in beside a fresh/aging/stale age dot, both voices pure exports) with the dropdown's styling round (mono rate figures, the active row's emerald rail, the trigger's open echo) (the entry joins the feed — +1 on every unread anchor, the cascade's twenty-first generation)
    // v2.409.0: the desk remembers — the opening QA burst walked the branch greeting onto the org desk and caught it STEAMROLLING an explicit choice (the persisted store was only ever asked back by the tabs SPA's boot, so the seed read factory state on the org desk — currencyChosen:false — and KES/true became USD/false in one reload, live-proven); every switcher surface now asks for the persisted state back (one shared boot) and the seed waits for the answer before deciding (never initiating — the SPA's deep-link ordering law), the audit desk's Desk-Activity lens persists across visits, the greeting wears its exact provenance (the seed's transient stamp feeds the trigger's emerald dot), and the ORM's immutability guard speaks each model's real Prisma mutation bags (thirty-two faces stand down, 331 → 299) (the entry joins the feed — +1 on every unread anchor, the cascade's twentieth generation)
    // v2.408.0: the branch speaks first — the branch's currency choice greets a fresh session at last (the v2.407.0 SystemConfig setting is finally heard: the seed's three honest refusals — never chosen, already chosen, wire silent — and the seed writes WITHOUT planting currencyChosen so an explicit choice always wins and a changed default re-seeds on the next visit), the switcher names the branch's row with a mono chip when the dropdown opens, the wire's types stop lying (hrPerStore carries the portal pair the reports wire always computed, the exports generator receives the includeSensitivePii bag the route passed and audit-logged — the log can't claim unmasked identifiers over a masked file anymore — and kpi-row's three strips ride the optional wire), twelve faces stand down (343 → 331) (the entry joins the feed — +1 on every unread anchor, the cascade's nineteenth generation)
    // v2.407.0: the ghost routes wake — the two routes born against columns the schema never carried answer real rows at last (notifications/settings folds the user's EMAIL preference rows into the four toggles — ALL the master, RECEIPT, LOW_STOCK, DAILY_REPORT; settings/currency keeps the branch default on the SystemConfig shelf beside the VAT rate, KES with isDefault when never chosen), the phantom User/Store columns and their twelve strict-mode faces stand down (355 → 343), the Profile dialog's Preferences tab grows the email card (the master dims and disables the three categories while off, Save PATCHes only the fields that moved), and the console footer's plain open clears the jump door itself (the entry joins the feed — +1 on every unread anchor, the cascade's eighteenth generation)
    // v2.406.0: the muted card grew the hover affordance (transition-colors
    // + the darker hover border) — the dark twins ride along
    expect(CHROME).toMatch(/'rounded-xl border border-slate-200 bg-slate-50\/50 p-3 transition-colors hover:border-slate-300 dark:border-slate-800 dark:bg-slate-800\/30 dark:hover:border-slate-700'/);
    expect(CHROME).toMatch(/text-emerald-900 dark:text-emerald-200/);
    expect(CHROME).toMatch(/text-slate-600 dark:text-slate-400/);
    expect(CHROME).toMatch(/dark:bg-slate-800\/50 dark:text-slate-500/);
  });
});

// ── 2. The backlog collapse ─────────────────────────────────────────────────

describe('ChangelogModal - the backlog waits behind one button', () => {
  const CHROME = readRepo('src/components/org/chrome.tsx');

  it('renders latest + five older entries open', () => {
    expect(CHROME).toContain('const INITIAL_VISIBLE = 5;');
    // v2.73.0: the derivation grew the jump-expansion (showAll || needsExpand);
    // a plain open still slices at INITIAL_VISIBLE.
    expect(CHROME).toMatch(/const effectiveShowAll = showAll \|\| needsExpand;/);
    expect(CHROME).toMatch(/const visibleOlder = effectiveShowAll \? older : older\.slice\(0, INITIAL_VISIBLE\);/);
  });

  it('the expand button names its honest hidden count', () => {
    expect(CHROME).toMatch(/const hiddenCount = older\.length - visibleOlder\.length;/);
    expect(CHROME).toContain('data-testid="changelog-show-older"');
    expect(CHROME).toMatch(/Show <span className="font-mono">\{hiddenCount\}<\/span> older release\{hiddenCount === 1 \? '' : 's'\}/);
  });

  it('expanding reveals everything; a Show-fewer button collapses back', () => {
    expect(CHROME).toContain('data-testid="changelog-show-fewer"');
    expect(CHROME).toMatch(/showAll && older\.length > INITIAL_VISIBLE \? \(/);
  });

  it('the collapse buttons wear the dashed-surface + focus ring language', () => {
    expect(CHROME.match(/border border-dashed border-slate-300 bg-white px-3 py-2 text-xs font-semibold/g)?.length).toBe(2);
    expect(CHROME).toMatch(/focus-visible:ring-2 focus-visible:ring-orange-400 dark:border-slate-700 dark:bg-slate-900/g);
  });
});

// ── 3. The shared seen flag ─────────────────────────────────────────────────

describe('ChangelogModal - one seen flag across surfaces', () => {
  const CHROME = readRepo('src/components/org/chrome.tsx');

  it('"Got it" writes the shared mbt_seen_version key', () => {
    expect(CHROME).toContain("const SEEN_VERSION_KEY = 'mbt_seen_version';");
    expect(CHROME).toContain('localStorage.setItem(SEEN_VERSION_KEY, APP_VERSION);');
  });

  it('the write is guarded for private mode and closes the modal', () => {
    expect(CHROME).toMatch(/const markSeen = \(\) => \{\s*try \{[\s\S]{0,200}\} catch \{[\s\S]{0,200}onOpenChange\(false\);/);
  });

  it('"Got it" is testid-ed and the GitHub changelog link survives', () => {
    expect(CHROME).toContain('data-testid="changelog-got-it"');
    expect(CHROME).toContain('data-testid="changelog-github-link"');
    expect(CHROME).toContain('View changelog on GitHub');
  });

  it('the business contacts block survives the rewrite (restyled dark)', () => {
    expect(CHROME).toContain('Contacts: 0795 191 909 · 0759 963 601 · mbumahhardware@gmail.com - Juja Town');
  });
});

// ── 4. The footer pill ──────────────────────────────────────────────────────

describe('ConsoleFooter - the release-waiting pill', () => {
  const CHROME = readRepo('src/components/org/chrome.tsx');

  it('the mount gate is SSR-safe (useSyncExternalStore pattern)', () => {
    expect(CHROME).toMatch(/const mounted = useSyncExternalStore\(subscribeNoop, mountedProbe, serverProbe\);/);
    expect(CHROME).toMatch(/const mountedProbe = \(\) => true;/);
    expect(CHROME).toMatch(/const serverProbe = \(\) => false;/);
  });

  it('the pill reads the shared flag once mounted', () => {
    expect(CHROME).toMatch(/if \(!mounted\) return;[\s\S]{0,300}setReleaseWaiting\(localStorage\.getItem\(SEEN_VERSION_KEY\) !== APP_VERSION\);/);
  });

  it('the pill renders only while release notes wait', () => {
    expect(CHROME).toMatch(/\{releaseWaiting && \(\s*<span data-testid="footer-changelog-pill"/);
  });

  it('the pill names the waiting version on its tooltip', () => {
    expect(CHROME).toMatch(/title=\{`Release notes for v\$\{APP_VERSION\} are waiting`\}/);
  });

  it('the Changelog button is testid-ed and the pill is emerald in both modes', () => {
    expect(CHROME).toContain('data-testid="footer-changelog-button"');
    expect(CHROME).toMatch(/border border-emerald-300 bg-emerald-50 px-1 py-px text-\[9px\] font-semibold text-emerald-700 dark:border-emerald-500\/40 dark:bg-emerald-500\/15 dark:text-emerald-300/);
  });

  it('the footer itself is dark-mode complete', () => {
    expect(CHROME).toMatch(/<footer className="mt-auto border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">/);
    expect(CHROME).toMatch(/text-\[11px\] text-slate-500 lg:px-5 dark:text-slate-400/);
  });
});

// ── 5. What's-New — the release leads with the story ────────────────────────

describe("What's-New 2.66.0", () => {
  const WN = readRepo('src/lib/whats-new.ts');

  it('carries the 2.66.0 entry first', () => {
    expect(WN.indexOf("version: '2.66.0'")).toBeGreaterThanOrEqual(0);
    expect(WN.indexOf("version: '2.66.0'")).toBeLessThan(WN.indexOf("version: '2.65.0'"));
  });

  it('leads with the catch-up story', () => {
    expect(WN).toContain('The console catches up on the news — the changelog tells the whole release story now');
  });

  it('announces the feed wiring, the collapse, the pill, and the shared flag', () => {
    expect(WN).toContain("The console\\'s Changelog modal no longer shows a frozen v2.18.3-era list");
    expect(WN).toContain('The latest release wears an emerald "latest" highlight at the top');
    expect(WN).toContain("A small emerald \"new\" pill sits on the footer\\'s Changelog button");
    expect(WN).toContain('read a release on either surface and both stay quiet');
  });

  it('keeps five bullets (the 3-6 shop-floor contract)', () => {
    const entry = WN.slice(WN.indexOf("version: '2.66.0'"), WN.indexOf("version: '2.65.0'"));
    expect(entry.match(/^ {6}'.*',$/gm)?.length).toBe(5);
  });
});

// ── 6. the palette knows the releases (v2.73.0) ─────────────────────────────

describe('CommandPalette - the jump-to-release group (v2.73.0)', () => {
  const CHROME = readRepo('src/components/org/chrome.tsx');

  it('takes the jump callback and derives one item per release from WHATS_NEW', () => {
    expect(CHROME).toContain('onJumpToRelease: (version: string) => void;');
    // v2.75.0 — the map now derives the reading state on the same pass.
    expect(CHROME).toMatch(/const releaseActions = useMemo\(\s*\(\) => WHATS_NEW\.map\(\(e\) => \(\{[\s\S]*?state: seenState\.read \? whatsNewReadState\(e\.version, seenState\.value\) : \('seen' as const\),/);
  });

  it('renders a dedicated group, last, so the default view stays compact', () => {
    // v2.75.0 — the heading is a fragment now (it carries the unread counter).
    const workspaces = CHROME.indexOf('<CommandGroup heading="Store workspaces">');
    const releases = CHROME.indexOf('Jump to release');
    expect(releases).toBeGreaterThan(workspaces);
  });

  it('release items are testid-ed, searchable by value, and truncate long titles', () => {
    expect(CHROME).toMatch(/data-testid=\{`palette-release-\$\{r\.version\}`\}/);
    expect(CHROME).toMatch(/value=\{`\$\{r\.label\} release notes`\}/);
    expect(CHROME).toContain('min-w-0 flex-1 truncate');
  });

  it('selecting a release closes the palette and jumps', () => {
    expect(CHROME).toMatch(/onSelect=\{\(\) => \{ onOpenChange\(false\); onJumpToRelease\(r\.version\); \}\}/);
  });

  it('wears the changelog icon and keeps the search placeholder', () => {
    // v2.75.0 — the icon goes emerald for the latest, slate for the rest.
    expect(CHROME).toContain("r.state === 'latest' ? 'text-emerald-500 dark:text-emerald-400' : 'text-slate-400'");
    expect(CHROME).toContain('placeholder="Search actions, stores, releases..."');
  });
});

describe('ChangelogModal - the jump lands somewhere real (v2.73.0)', () => {
  const CHROME = readRepo('src/components/org/chrome.tsx');
  const PAGE = readRepo('src/app/(shell)/console/page.tsx');

  it('takes the jump target and resolves its index honestly', () => {
    expect(CHROME).toMatch(/jumpTo\?: string \| null/);
    expect(CHROME).toMatch(/const jumpIndex = jumpTo \? WHATS_NEW\.findIndex\(\(e\) => e\.version === jumpTo\) : -1;/);
  });

  it('a deep target forces the backlog open; a plain open keeps the collapse', () => {
    expect(CHROME).toMatch(/const needsExpand = jumpIndex > INITIAL_VISIBLE;/);
    expect(CHROME).toMatch(/const effectiveShowAll = showAll \|\| needsExpand;/);
    expect(CHROME).toMatch(/const visibleOlder = effectiveShowAll \? older : older\.slice\(0, INITIAL_VISIBLE\);/);
  });

  it('scrolls the jumped entry into view once painted (no setState in the effect)', () => {
    expect(CHROME).toMatch(/if \(!open \|\| !jumpTo \|\| jumpIndex < 0\) return;/);
    expect(CHROME).toMatch(/document\.querySelector\(`\[data-testid="changelog-entry-\$\{jumpTo\}"\]`\)/);
    expect(CHROME).toMatch(/scrollIntoView\(\{ block: 'center', behavior: 'smooth' \}\)/);
    expect(CHROME).toMatch(/return \(\) => window\.clearTimeout\(id\);/);
  });

  it('the jumped entry wears the orange ring + the "via cmd+K" pill (dark complete)', () => {
    // v2.406.0: the jump names its door — the changelog pill speaks the route you came by (the JUMP_DOORS pure map: the palette rides "via cmd+K" with the Terminal, the announcement rides "via the announcement" with the Megaphone, a plain open births no pill — the absent-control law), all three mounts wire the door and reset both jump slots on close, the archive reads like a ledger (the hover affordance, the mono count, the soft rise), the pool's next eighteen stand down (373 → 355), and the burst gains the console's Copy button as a live leg (the entry joins the feed — +1 on every unread anchor, the cascade's seventeenth generation)
    // v2.405.0: the shares speak — the org desk's slice modal hands you the branch ledger (Copy beside the total, one pure formatter, the quiet zeroes never dropped, the health desk's two-second law), the named-branch rows ride the payload ledger's zebra and the share chips wear the mono badge, the wire's honest nulls stop at the door (the slice signatures speak the row — nine faces stand down, 382 → 373), and the burst mints a fresh refundable sale so the refund dialog's face finally opens live (the entry joins the feed — +1 on every unread anchor, the cascade's sixteenth generation)
    // v2.404.0: the ring's quoted bytes gain the one-pulse landing glow
    // (changelog-landing) — the pill and the dark-complete ring stand
    expect(CHROME).toMatch(/focused \? ' ring-2 ring-orange-400 ring-offset-2 ring-offset-white dark:ring-offset-slate-900 changelog-landing' : ''/);
    expect(CHROME).toContain('data-testid="changelog-jump-pill"');
    expect(CHROME).toContain('via cmd+K');
    // v2.406.0: the pill names its door — the animate-in family joins the
    // orange bytes (the entrance), the label/icon ride the JUMP_DOORS map
    expect(CHROME).toMatch(/border-orange-300 bg-orange-50 px-1\.5 py-px text-\[9px\] font-semibold uppercase tracking-wide text-orange-700 duration-300 fade-in slide-in-from-bottom-1 dark:border-orange-500\/40 dark:bg-orange-500\/15 dark:text-orange-300/);
  });

  it('the page owns the jump state: palette sets it, close clears it', () => {
    expect(PAGE).toContain('const [releaseJump, setReleaseJump] = useState<string | null>(null);');
    // v2.406.0: the palette door names itself ('palette') and the close
    // resets BOTH slots (the jump target AND the door that jumped)
    expect(PAGE).toContain("onJumpToRelease={(v) => { setReleaseJump(v); setJumpVia('palette'); setChangelogOpen(true); }}");
    expect(PAGE).toContain('onOpenChange={(o) => { setChangelogOpen(o); if (!o) { setReleaseJump(null); setJumpVia(null); } }} jumpTo={releaseJump} jumpVia={jumpVia}');
  });

  it('the modal entry list passes focused by version for latest and older', () => {
    expect(CHROME).toMatch(/<ChangelogEntry entry=\{latest\} latest focused=\{jumpTo === latest\.version\} via=\{jumpVia\} \/>/);
    expect(CHROME).toMatch(/<ChangelogEntry key=\{entry\.version\} entry=\{entry\} latest=\{false\} focused=\{jumpTo === entry\.version\} via=\{jumpVia\} \/>/);
  });
});

describe('release metadata - v2.73.0', () => {
  it("leads What's-New with the palette-jump story", () => {
    const WN = readRepo('src/lib/whats-new.ts');
    expect(WN.indexOf("version: '2.73.0'")).toBeGreaterThan(-1);
    expect(WN.indexOf("version: '2.73.0'")).toBeLessThan(WN.indexOf("version: '2.72.0'"));
    expect(WN).toContain('The palette knows the releases');
    expect(WN).toMatch(/Jump to release/);
    expect(WN).toMatch(/via cmd\+K/);
  });

  it('bumps package.json to at least 2.73.0 (all three slots) and registers the verify script', () => {
    const PKG = JSON.parse(readRepo('package.json')) as {
      version: string;
      mbumah: { releaseVersion: string; baseVersion: string };
      scripts: Record<string, string>;
    };
    const atLeast = (v: string, base: string) => {
      const [a, b, c] = v.split('.').map(Number);
      const [x, y, z] = base.split('.').map(Number);
      return a > x || (a === x && (b > y || (b === y && c >= z)));
    };
    expect(atLeast(PKG.version, '2.73.0')).toBe(true);
    expect(atLeast(PKG.mbumah.releaseVersion, '2.73.0')).toBe(true);
    expect(atLeast(PKG.mbumah.baseVersion, '2.73.0')).toBe(true);
    expect(PKG.scripts['verify:v2-73-0']).toBe('node scripts/verify-v2-73-0.mjs');
  });

  it('keeps the prior console surfaces intact (collapse, pill, shared flag)', () => {
    const CHROME = readRepo('src/components/org/chrome.tsx');
    expect(CHROME).toContain('data-testid="changelog-show-older"');
    expect(CHROME).toContain('data-testid="changelog-got-it"');
    expect(CHROME).toContain('data-testid="footer-changelog-pill"');
    expect(CHROME).toContain("const SEEN_VERSION_KEY = 'mbt_seen_version';");
  });
});

// ── 7. the palette knows what you've read (v2.75.0) ──────────────────────────

describe('compareWhatsNewVersions - semver, not string compare (v2.75.0)', () => {
  it('orders component-wise: major, then minor, then patch', () => {
    expect(compareWhatsNewVersions('2.75.0', '2.74.0')).toBeGreaterThan(0);
    expect(compareWhatsNewVersions('2.74.0', '2.75.0')).toBeLessThan(0);
    expect(compareWhatsNewVersions('2.73.0', '2.72.0')).toBeGreaterThan(0);
    expect(compareWhatsNewVersions('3.0.0', '2.99.99')).toBeGreaterThan(0);
  });

  it('the string-compare trap is dead: 2.9 ranks BELOW 2.10', () => {
    expect(compareWhatsNewVersions('2.10.0', '2.9.0')).toBeGreaterThan(0);
    expect(compareWhatsNewVersions('2.9.0', '2.10.0')).toBeLessThan(0);
  });

  it('equal versions compare equal, and missing components read as zero', () => {
    expect(compareWhatsNewVersions('2.75.0', '2.75.0')).toBe(0);
    expect(compareWhatsNewVersions('2.75', '2.75.0')).toBe(0);
  });
});

describe('whatsNewReadState - one flag, one truth (v2.75.0)', () => {
  it('the newest entry in the feed is the latest, always', () => {
    expect(whatsNewReadState(WHATS_NEW[0].version, WHATS_NEW[0].version)).toBe('latest');
    expect(whatsNewReadState(WHATS_NEW[0].version, null)).toBe('latest');
  });

  it('a release strictly newer than the seen flag is new', () => {
    expect(whatsNewReadState('2.74.0', '2.73.0')).toBe('new');
    expect(whatsNewReadState('2.74.1', '2.74.0')).toBe('new');
  });

  it('a release at or below the flag has been seen', () => {
    expect(whatsNewReadState('2.72.0', '2.73.0')).toBe('seen');
    expect(whatsNewReadState('2.73.0', '2.73.0')).toBe('seen');
  });

  it('stays calm with no flag: no unread claims without a reference point', () => {
    expect(whatsNewReadState('2.30.0', null)).toBe('seen');
    expect(whatsNewReadState(WHATS_NEW[0].version, null)).toBe('latest');
  });
});

describe('whatsNewUnreadCount - the heading counter (v2.75.0)', () => {
  it('counts the releases that arrived after the flag', () => {
    // The feed leads 2.163.0 (latest — counted separately), then 2.162.0, 2.161.0, 2.160.0, 2.159.0, 2.158.0, 2.157.0, 2.156.0,
    // 2.155.0, 2.154.0, 2.153.0, 2.148.0, 2.147.0, 2.146.0, 2.145.0,
    // 2.144.0, 2.143.0, 2.142.0, 2.141.0, 2.140.0, 2.139.0, 2.138.0, 2.137.0,
    // 2.136.0, 2.135.0, 2.134.0, 2.133.0, 2.132.0, 2.131.0, 2.130.0, 2.129.0, 2.128.0, 2.127.0, 2.126.0, 2.125.0, 2.124.0, 2.123.0 — a
    // 2.110.0 flag means 2.111.0 … 2.163.0 sit strictly between (the head
    // 2.164.0 reads "latest", NOT "new"), so the honest count is 53; a
    // 2.77.0 flag counts 2.78.0 … 2.160.0 (the head never joins this count).
    // Re-anchored for 2.206.0 joining the feed (95/96/97/128 → 96/97/98/129
    // → 97/98/99/130), 2.208.0 joining it (→ 99/100/101/132), 2.209.0
    // joining it (→ 100/101/102/133) and 2.210.0 joining it (→ 101/102/103/134), 2.211.0 joining it (→ 102/103/104/135), 2.212.0 joining it (→ 103/104/105/136), 2.213.0 joining it (→ 104/105/106/137), 2.214.0 joining it (→ 105/106/107/138), 2.215.0 joining it (→ 106/107/108/139), 2.216.0 joining it
    // (→ 107/108/109/140), 2.217.0 joining it (→ 108/109/110/141).
    // v2.218.0: the full-restock entry joins the feed (+1 on every anchor → 109/110/111/142)
    // v2.219.0: the stocktake entry joins the feed (+1 on every anchor → 110/111/112/143)
    // v2.220.0: the variance-map entry joins the feed (+1 on every anchor → 111/112/113/144)
    // v2.221.0: the supplier-split entry joins the feed (+1 on every anchor → 112/113/114/145)
    // v2.222.0: the sheet-drill entry joins the feed (+1 on every anchor → 113/114/115/146)
    // v2.224.0: the spoken-hint entry joins the feed (+1 on every anchor → 114/115/116/147)
    // v2.225.0: the pipeline entry joins the feed (+1 on every anchor → 115/116/117/148)
    // v2.226.0: the paper-trail entry joins the feed (+1 on every anchor → 116/117/118/149)
    // v2.227.0: the sheet's-paper entry joins the feed (+1 on every anchor → 117/118/119/150)
    // v2.228.0: the clipboard entry joins the feed (+1 on every anchor → 118/119/120/151 → 119/120/121/152)
    // v2.229.0: the branch-walk entry joins the feed (+1 on every anchor → 120/121/122/153)
    // v2.230.0: the sheet's-lens entry joins the feed (+1 on every anchor → 121/122/123/154)
    // v2.231.0: the branch-lens entry joins the feed (+1 on every anchor → 122/123/124/155)
    // v2.232.0: the recount entry joins the feed (+1 on every anchor → 123/124/125/156)
    // v2.233.0: the lineage entry joins the feed (+1 on every anchor → 124/125/126/157)
    // v2.234.0: the verdict entry joins the feed (+1 on every anchor → 125/126/127/158)
    // v2.235.0: the cadence entry joins the feed (+1 on every anchor → 126/127/128/159)
    // v2.236.0: the teeth entry joins the feed (+1 on every anchor → 127/128/129/160)
    // v2.237.0: the walk's-door entry joins the feed (+1 on every anchor → 128/129/130/161)
    // v2.238.0: the door's-census entry joins the feed (+1 on every anchor → 129/130/131/162)
    // v2.239.0: the yard's-answer entry joins the feed (+1 on every anchor → 130/131/132/163)
    // v2.240.0: the birth-everywhere entry joins the feed (+1 on every anchor → 131/132/133/164)
    // v2.241.0: the walk's-law entry joins the feed (+1 on every anchor → 132/133/134/165)
    // v2.278.0: the digest's-receipt entry joins the feed (+1 on every anchor → 170/171/172/203)
    // v2.279.0: the email's-clock entry joins the feed (+1 on every anchor → 171/172/173/204)
    // v2.304.0: the salary's-desk entry joins the feed (+1 on every anchor → 196/197/198/229)
    // v2.305.0: the engine-reads-the-override entry joins the feed (+1 on every anchor → 197/198/199/230)
    // v2.309.0: the refund's-paper-trail entry joins the feed (+1 on every anchor → 198/199/200/231 → 199/200/201/232)
    // v2.310.0: the claw-speaks entry joins the feed (+1 on every anchor → 199/200/201/232 → 200/201/202/233)
    // v2.311.0: the paper-trail entry joins the feed (+1 on every anchor → 201/202/203/234 → 202/203/204/235)
    // v2.312.0: the points-expire entry joins the feed (+1 on every anchor → 202/203/204/235 → 203/204/205/236)
    // v2.313.0: the dock-says-why entry joins the feed (+1 on every anchor → 203/204/205/236 → 204/205/206/237)
    // v2.314.0: the wallet-is-the-only-balance entry joins the feed (+1 on every anchor → 204/205/206/237 → 205/206/207/238)
    // v2.315.0: the expiry-pulse entry joins the feed (+1 on every anchor → 205/206/207/238 → 206/207/208/239)
    // v2.316.0: the ledger-link entry joins the feed (+1 on every anchor → 206/207/208/239 → 207/208/209/240)
    // v2.317.0: the ledger-link entry joins the feed (+1 on every anchor → 206/207/208/239 → 207/208/209/240)
    // v2.317.0: the day-window entry joins the feed (+1 on every anchor → 207/208/209/240 → 208/209/210/241)
    // v2.318.0: the dismiss+echo entry joins the feed (+1 on every anchor → 208/209/210/241 → 209/210/211/242)
    // v2.319.0: the summary-voice entry joins the feed (+1 on every anchor → 209/210/211/242 → 210/211/212/243)
    // v2.320.0: the pager entry joins the feed (+1 on every anchor → 210/211/212/243 → 211/212/213/244)
    // v2.321.0: the page-size entry joins the feed (+1 on every anchor → 211/212/213/244 → 212/213/214/245)
    // v2.322.0: the census-truth entry joins the feed (+1 on every anchor → 212/213/214/245 → 213/214/215/246)
    // v2.323.0: the census-truth entry joins the feed (+1 on every anchor → 212/213/214/245 → 213/214/215/246)
    // v2.324.0: the roster's-own-word entry joins the feed (+1 on every anchor → 214/215/216/247 → 215/216/217/248)
    // v2.325.0: the body-door entry joins the feed (+1 on every anchor → 215/216/217/248 → 216/217/218/249)
    // v2.326.0: the post-wide-door entry joins the feed (+1 on every anchor → 216/217/218/249 → 217/218/219/250)
    // v2.327.0: the swallow-census entry joins the feed (+1 on every anchor → 217/218/219/250 → 218/219/220/251)
    // v2.328.0: the roster's-second-word entry joins the feed (+1 on every anchor → 218/219/220/251 → 219/220/221/252)
    // v2.329.0: the stock-lens-own-word entry joins the feed (+1 on every anchor → 219/220/221/252 → 220/221/222/253)
    // v2.330.0: the debt-lens-own-word entry joins the feed (+1 on every anchor → 220/221/222/253 → 221/222/223/254)
    // v2.331.0: the suppliers-lens-own-word entry joins the feed (+1 on every anchor → 221/222/223/254 → 222/223/224/255)
    // v2.332.0: the purchase-order-lens-own-word entry joins the feed (+1 on every anchor → 222/223/224/255 → 223/224/225/256)
    // v2.333.0: the ledger-own-word entry joins the feed (+1 on every anchor → 223/224/225/256 → 224/225/226/257)
    // v2.334.0: the doors-tightened entry joins the feed (+1 on every anchor → 224/225/226/257 → 225/226/227/258)
    // v2.335.0: the financial-doors entry joins the feed (+1 on every anchor → 225/226/227/258 → 226/227/228/259)
    // v2.336.0: the catalog-doors entry joins the feed (+1 on every anchor → 226/227/228/259 → 227/228/229/260)
    // v2.337.0: the banking-doors entry joins the feed (+1 on every anchor → 227/228/229/260 → 228/229/230/261)
    // v2.338.0: the customer-doors entry joins the feed (+1 on every anchor → 228/229/230/261 → 229/230/231/262)
    // v2.339.0: the last-exemplars entry joins the feed (+1 on every anchor → 229/230/231/262 → 230/231/232/263)
    // v2.340.0: the hr-doors entry joins the feed (+1 on every anchor → 230/231/232/263 → 231/232/233/264)
    // v2.341.0: the loyalty-tax entry joins the feed (+1 on every anchor → 231/232/233/264 → 232/233/234/265)
    // v2.342.0: the messaging entry joins the feed (+1 on every anchor → 232/233/234/265 → 233/234/235/266)
    // v2.343.0: the rental entry joins the feed (+1 on every anchor → 233/234/235/266 → 234/235/236/267)
    // v2.344.0: the bare-class-final entry joins the feed (+1 on every anchor → 234/235/236/267 → 235/236/237/268)
    // v2.345.0: the loyalty-wire-truth entry joins the feed (+1 on every anchor → 235/236/237/268 → 236/237/238/269)
    // v2.346.0: the tier-lifecycle entry joins the feed (+1 on every anchor → 236/237/238/269 → 237/238/239/270)
    // v2.347.0: the lifecycle-completes entry joins the feed (+1 on every anchor → 237/238/239/270 → 238/239/240/271)
    // v2.348.0: the casts-census entry joins the feed (+1 on every anchor → 238/239/240/271 → 239/240/241/272)
    // v2.350.0: the phase-2 census entry joins the feed (+1 on every anchor → 239/240/241/272 → 240/241/242/273)
    // v2.351.0: the audit-remediation entry joins the feed (+1 on every anchor → 240/241/242/273 → 241/242/243/274)
    // v2.352.0: the wrapper-seam entry joins the feed (+1 on every anchor → 241/242/243/274 → 242/243/244/275)
    // v2.353.0: the door-registry entry joins the feed (+1 on every anchor → 242/243/244/275 → 243/244/245/276)
    // v2.354.0: the type-lens entry joins the feed (+1 on every anchor → 243/244/245/276 → 244/245/246/277)
    // v2.355.0: the rental-status entry joins the feed (+1 on every anchor → 244/245/246/277 → 245/246/247/278)
    // v2.356.0: the invoice-status entry joins the feed (+1 on every anchor → 245/246/247/278 → 246/247/248/279)
    // v2.357.0: the transfers entry joins the feed (+1 on every anchor → 246/247/248/279 → 247/248/249/280)
    // v2.358.0: the gift-card-status entry joins the feed (+1 on every anchor → 247/248/249/280 → 248/249/250/281)
    // v2.359.0: the delivery-note-status entry joins the feed (+1 on every anchor → 248/249/250/281 → 249/250/251/282)
    // v2.360.0: the voucher-status entry joins the feed (+1 on every anchor → 249/250/251/282 → 250/251/252/283)
    // v2.361.0: the credit-type entry joins the feed (+1 on every anchor → 250/251/252/283 → 251/252/253/284)
    // v2.362.0: the payroll entry joins the feed (+1 on every anchor → 251/252/253/284 → 252/253/254/285)
    // v2.363.0: the conversations entry joins the feed (+1 on every anchor → 252/253/254/285 → 253/254/255/286)
    // v2.364.0: the catalog entry joins the feed (+1 on every anchor → 253/254/255/286 → 254/255/256/287)
    // v2.365.0: the repayment entry joins the feed (+1 on every anchor → 254/255/256/287 → 255/256/257/288)
    // v2.366.0: the audit entry joins the feed (+1 on every anchor → 255/256/257/288 → 256/257/258/289)
    // v2.367.0: the watchtower entry joins the feed (+1 on every anchor → 256/257/258/289 → 257/258/259/290)
    // v2.368.0: the ledger's migration entry joins the feed (+1 on every anchor → 257/258/259/290 → 258/259/260/291)
    // v2.369.0: the island's homecoming entry joins the feed (+1 on every anchor → 258/259/260/291 → 259/260/261/292)
    // v2.370.0: the registry's derived-walk entry joins the feed (+1 on every anchor → 259/260/261/292 → 260/261/262/293)
    // v2.371.0: the refund rows' homecoming entry joins the feed (+1 on every anchor → 260/261/262/293 → 261/262/263/294)
    // v2.372.0: the gap comes home — the refund chain settles the header (+1 on every anchor → 261/262/263/294 → 262/263/264/295)
    // v2.373.0: the stranded gap settles — the desk speaks the settle truth on the row and the stranded rows heal (+1 on every anchor → 262/263/264/295 → 263/264/265/296)
    // v2.374.0: the paper follows the settle — the repair catches the badge up and the paper follows the money (+1 on every anchor → 263/264/265/296 → 264/265/266/297)
    // v2.375.0: the settlement speaks its name — the share text, the row chip and the paper all wear the settlement's own kind (+1 on every anchor → 264/265/266/297 → 265/266/267/298)
    // v2.376.0: the ask-dialog retires the native prompt — fifteen send asks across eight desks speak in the app's own voice (+1 on every anchor → 265/266/267/298 → 266/267/268/299)
    // v2.377.0: the last native prompt retires — the multiline ask-text sibling lands and the payroll void reason migrates (+1 on every anchor → 266/267/268/299 → 267/268/269/300)
    // v2.378.0: the settlement answers the address bar — the settlement kind joins the lens and the release gate moves home (+1 on every anchor → 267/268/269/300 → 268/269/270/301)
    // v2.379.0: the server speaks the desk’s vocabulary — the kind scope crosses the API boundary and the settled gap stops counting nothing (+1 on every anchor → 268/269/270/301 → 269/270/271/302)
    // v2.380.0: the lens rides past the cap — the honest-fetch rider scopes the lensed fetch with the server’s own kind word and the capped window speaks its slice (+1 on every anchor → 269/270/271/302 → 270/271/272/303)
    // v2.381.0: the taxman’s desk answers the address bar — the e-TIMS invoices ledger’s submission-status lens speaks its desk-prefixed word and the danger voice finally wears the family’s red (+1 on every anchor → 270/271/272/303 → 271/272/273/304)
    // v2.382.0: the ghost tax desk comes alive and answers the address bar — the filings ledger’s type lens speaks its desk-prefixed word and the family’s grammar grows its first shade-split (+1 on every anchor → 271/272/273/304 → 272/273/274/305)
    // v2.383.0: the taxman’s ledger answers by the month — the filings ledger’s period lens speaks its desk-prefixed word, a shape word wearing the shade-split’s second storey, and the legend retires its ghost faces (+1 on every anchor → 272/273/274/305 → 273/274/275/306)
    // v2.393.0: the message templates answer by name — the deep-link vocabulary's thirty-second word lands on the messaging desk's Templates pane (the family's first card-grid lens — the nine-card grid narrows to the landed card, the sub-tab amendment's fourth application raises the pane it lands into, the yellow chip wears the shade-split's tenth storey, and the pane's Use-Template hand is the lens's second retirement voice), and the entry joins the feed (+1 on every unread anchor — the DERIVED anchors re-set themselves, the cascade's seventh generation)
    // v2.392.0: the export ledger answers by the type — the deep-link vocabulary's thirty-first word lands on the data-exports desk's history type lens (the desk joins the two-word negotiation club with the same-pane form — both chips share the history section, each retiring by its own two voices, and the two lenses conjoin in the table; the pink chip wears the shade-split's ninth storey, a brand-new type chip row speaks live per-type counts), and the entry joins the feed (+1 on every unread anchor — the DERIVED anchors re-set themselves, the cascade's sixth generation)
    // v2.391.0: the export ledger answers the address bar — the deep-link vocabulary's thirtieth word lands on the data-exports desk's history lens (the controlled hand lifts the filter state to the desk while the chip row stays visible, the indigo chip wears the shade-split's eighth storey, the export desk joins the vocabulary), and the entry joins the feed (+1 on every unread anchor — the DERIVED anchors re-set themselves, the cascade's fifth generation)
    // v2.390.0: the debt ledger answers by the channel — the deep-link vocabulary's twenty-ninth word lands on the debt management desk's reminder-history channel lens (the desk joins the two-word negotiation club with the same-pane form — both chips share the History pane, each retiring by its own two voices), the fuchsia chip wears the shade-split's seventh storey, and the entry joins the feed (+1 on every unread anchor — the DERIVED anchors re-set themselves, the cascade's fourth generation)
    // v2.389.0: the debt ledger answers the address bar — the deep-link vocabulary's twenty-eighth word lands on the debt management desk's reminder-history lens (the sub-tab amendment's third application raises the History pane it lands into, the cyan chip wears the shade-split's sixth storey, the lens gains its own count line), and the entry joins the feed (+1 on every unread anchor — the DERIVED anchors re-set themselves, the cascade's third generation)
    // v2.388.0: the M-Pesa ledger answers the address bar — the deep-link vocabulary's twenty-seventh word lands on the banking desk's M-Pesa pane (the sub-tab amendment's second application raises the pane it lands into, the purple chip wears the shade-split's fifth storey, one desk now owns two words), and the entry joins the feed (+1 on every unread anchor — the DERIVED anchors re-set themselves, the cascade's second generation)
    // v2.387.0: the bank ledger answers the address bar — the deep-link vocabulary's twenty-sixth word lands on the banking desk's transaction-type lens (the sub-tab amendment raises the pane it lands into, the sky chip wears the shade-split's fourth storey), and the entry joins the feed (+1 on every unread anchor — the DERIVED anchors re-set themselves, the cascade's second generation)
    // v2.386.0: the payload files itself — the dry-run card reaches paper (Print beside Copy through the print-root pipeline), the card speaks its per-line list, the mapper's last decimal leak seals, and the unread anchors become DERIVED from the feed (the pin unwind's first real retire)
    // v2.385.0: the dry run speaks its payload — the e-TIMS submit dialog keeps the dry-run's mapped payload on screen (the paper-trail card, the copy voice), the PENDING rows gain their own Submit-to-KRA affordance, and the unread-count anchors grow by one (+1 on every anchor → 274/275/276/307 → 275/276/277/308)
    // v2.384.0: the reports desk answers the address bar — the Report Type grid speaks its desk-prefixed shape word wearing the shade-split’s third storey, and the lockfile guard grows its generation legs (+1 on every anchor → 273/274/275/306 → 274/275/276/307)
    // v2.394.0: the landing chips share one loom — ten full-wardrobe chips render through one component with a ten-hue wardrobe registry, the census and the stress grow their loom faces, and the lockfile guard grows its generation legs (+1 on every anchor → 283/284/285/316 → 284/285/286/317)
    // v2.395.0: the submission receipt hop — every KRA audit row and invoice history row opens the paper-trail dialog, the response leaves in pretty JSON, the print face rides the print-root pipeline, and the lockfile guard grows its generation legs (+1 on every anchor → 284/285/286/317 → 285/286/287/318)
    // v2.396.0: the M-Pesa statuses find their feet — the ledger stores its own reconciliation status, the rows speak their effective status, the dispute and match and reopen actions write it, and the lockfile guard grows its generation legs (+1 on every anchor → 285/286/287/318 → 286/287/288/319)
    // v2.397.0: the landing chips share one loom — the census’s 22 loomable elder faces joined the shared component at the 200/50 storey, three heads and one second registry, the byte-fidelity law held per chip, and the lockfile guard grows its generation legs (+1 on every anchor → 286/287/288/319 → 287/288/289/320)
    // v2.398.0: the login desk speaks the failure’s name — the DB doctor renders the exposed Prisma code, its plain-language title and the documented remediation inline under the banner (the quiet face held when no detail is exposed), the repo-env guard teaches the dev runtime the launchers’ env-wins law (a stray inherited DATABASE_URL can no longer silently redirect `next dev` to a foreign database; the guard speaks only for the two connection vars and no-ops when no .env exists), and the entry joins the feed (+1 on every unread anchor — the DERIVED anchors re-set themselves, the cascade’s ninth generation)
    // v2.399.0: the health desk speaks the failure’s name — the System Health tab’s Environment & Connection panel reads the raw /api/health payload the uptime monitors read (one status-dotted mono-chip row per environment variable, one per connection check, an overall badge, a 30s refresh, skeleton loading and an honest unreachable voice), a Prisma code carried inside a check’s detail text renders the SAME remediation card the login desk renders (extractPrismaCode + diagnosePrismaCode, the remedy table’s second desk), the v2.398.0 inline login card retires into the shared DbDoctorCard loom (one card, two desks — the byte-exact login face held), and the entry joins the feed (+1 on every unread anchor — the DERIVED anchors re-set themselves, the cascade’s tenth generation)
    // v2.400.0: the health desk hands you the words — the Environment & Connection panel’s report leaves the desk as plain text (formatEnvDiagnostics: the header, the overall verdict, one LABEL: STATUS line per row in the panel’s own order, and the doctor card’s diagnosis block — code, summary, the remedy table’s ordered steps verbatim), the Copy button rides the panel’s header with the receipt hop’s two-second Copied hand-back (the icon swaps with the label, the emerald family marks the success state — the elder census registered the new honest wearer, sharedWith 11), envRowLabel retires the tab’s inline label map (one home — chip and clipboard cannot drift), and the advisory pool’s first nine faces stand down behavior-identically (the tab mapper’s honest predicate, the shared recount guard, the DashboardStats re-type, the portal defaults, the vocabulary probe — 488 → 479), and the entry joins the feed (+1 on every unread anchor — the DERIVED anchors re-set themselves, the cascade’s eleventh generation)
    // v2.401.0: the health desk hands you the file — the Environment & Connection panel's report leaves the desk as a NAMED text file too (diagnosticsFileName, the pure twin of the support copy — the version, the date and the minute ride in the name), the Download button rides the header beside the Copy button with the saved face's two-second hand-back (the same emerald family — the elder census's file-level count holds), the sandbox eTIMS client now speaks the three response contracts its routes always promised (customer search, invoice status, the stock master report — the 48 faces stand down, 479 → 431), and the entry joins the feed (+1 on every unread anchor — the DERIVED anchors re-set themselves, the cascade's twelfth generation)
    // v2.402.0: the payload card hands you the file — the KRA filing trio completes (Print = the paper, Copy = the clipboard, Download = the FILE: the mapped payload's card saves the same pretty JSON the clipboard carries as a named kra-payload-<invoice>-<date>.json, the saved face riding the receipt hop's two-second law), the card's eight-row ledger alternates on a quiet zebra ground, the refund heal suite's must label widens (29 faces stand down, 431 → 402), and the entry joins the feed (+1 on every unread anchor — the DERIVED anchors re-set themselves, the cascade's thirteenth generation)
    // v2.404.0: the archive door reaches the main desk — the main shell mounts the SAME ChangelogModal (one shared archive, exactly one mount), the whats-new announcement gains its onOpenChangelog handle (jumpTo = APP_VERSION, the orange ring lands), the footer's Release notes door opens the archive from the top, the jumped entry answers with one soft landing glow, and the honest burst fixes the QA login's false positive (the entry joins the feed — +1 on every unread anchor, the cascade's fifteenth generation)
    // v2.403.0: the refund desk speaks the failure's name — the wire's typed refusal (code + the server's own line) reaches the toast and the dialog's own amber card (the code under its mono badge), four silent catches speak at last, the route's error ladder gains the stranded rung (NOT_STRANDED: 409), the two must widens land and the heal wiring's three mended names stand their guard (20 faces down, 402 → 382, the entry joins the feed — +1 on every unread anchor, the cascade's fourteenth generation)
    expect(whatsNewUnreadCount('2.110.0')).toBe(327);
    expect(whatsNewUnreadCount('2.109.0')).toBe(328);
    expect(whatsNewUnreadCount('2.108.0')).toBe(329);
    expect(whatsNewUnreadCount('2.77.0')).toBe(360);
    expect(whatsNewUnreadCount('2.70.0')).toBeGreaterThanOrEqual(10);
  });

  it('zero when everything is read, zero when nothing is provably unread', () => {
    expect(whatsNewUnreadCount(WHATS_NEW[0].version)).toBe(0);
    expect(whatsNewUnreadCount(null)).toBe(0);
  });
});

describe('CommandPalette - the release inbox (v2.75.0)', () => {
  const CHROME = readRepo('src/components/org/chrome.tsx');

  it('reads the SHARED seen flag when the palette opens, never on the server', () => {
    expect(CHROME).toContain('const [seenState, setSeenState] = useState<{ read: boolean; value: string | null }>({ read: false, value: null });');
    const effect = CHROME.split('const [seenState, setSeenState]')[1].split('const releaseActions =')[0];
    expect(effect).toContain('if (!open) return;');
    expect(effect).toContain('localStorage.getItem(SEEN_VERSION_KEY)');
    expect(effect).toContain('window.setTimeout');
    expect(effect).toContain('return () => window.clearTimeout(id);');
  });

  it('re-reads on every open (a "Got it" in the modal lands on the next cmd+K)', () => {
    const effect = CHROME.split('const [seenState, setSeenState]')[1].split('const releaseActions =')[0];
    expect(effect).toContain('[open]);');
  });

  it('claims no state before the flag has actually been read', () => {
    expect(CHROME).toContain("state: seenState.read ? whatsNewReadState(e.version, seenState.value) : ('seen' as const),");
    expect(CHROME).toContain('(seenState.read ? whatsNewUnreadCount(seenState.value) : 0)');
  });

  it('every item carries its state marker, testid-ed per version', () => {
    expect(CHROME).toMatch(/data-testid=\{`palette-release-state-\$\{r\.version\}`\}/);
  });

  it('the latest wears the modal\u2019s emerald badge (same family, Sparkles and all)', () => {
    const latest = CHROME.split("r.state === 'latest' ? (")[1].split(") : r.state === 'new' ?")[0];
    expect(latest).toContain('Sparkles');
    expect(latest).toContain('latest');
    expect(latest).toContain('dark:border-emerald-500/40 dark:bg-slate-900 dark:text-emerald-300');
    expect(latest).toContain('data-testid={`palette-release-state-${r.version}`}');
  });

  it('new arrivals wear the outline chip of the footer-pill family', () => {
    const fresh = CHROME.split(") : r.state === 'new' ? (")[1].split(") : (")[0];
    expect(fresh).toContain('new');
    expect(fresh).toContain('border-emerald-200');
    expect(fresh).toContain('dark:border-emerald-500/30 dark:text-emerald-400');
    expect(fresh).toContain('title={`v${r.version} arrived after you last read the notes`}');
  });

  it('read releases keep their quiet "notes" hint', () => {
    const seen = CHROME.split(") : r.state === 'new' ? (")[1].split('</CommandItem>')[0];
    expect(seen).toContain('<span className="ml-auto shrink-0 text-[10px] text-slate-400">notes</span>');
  });

  it('the group heading counts the unread', () => {
    expect(CHROME).toContain('data-testid="palette-release-unread"');
    expect(CHROME).toContain('{unreadCount} unread');
    expect(CHROME).toContain("arrived after you last read the notes`}");
  });

  it('the latest item reads as first-class (emerald icon + bold title)', () => {
    expect(CHROME).toContain("r.state === 'latest' ? 'text-emerald-500 dark:text-emerald-400' : 'text-slate-400'");
    expect(CHROME).toContain("r.state === 'latest' ? 'font-semibold text-slate-800 dark:text-slate-100' : ''");
  });
});

describe("What's-New 2.75.0", () => {
  it('leads the feed with the release-inbox story', () => {
    const WN = readRepo('src/lib/whats-new.ts');
    expect(WN.indexOf("version: '2.75.0'")).toBeGreaterThan(-1);
    expect(WN.indexOf("version: '2.75.0'")).toBeLessThan(WN.indexOf("version: '2.74.0'"));
    expect(WN).toContain('The palette knows what you');
    expect(WN).toMatch(/unread/i);
    expect(WN).toMatch(/SAME seen flag/);
  });
});

describe('release metadata - v2.75.0', () => {
  it('bumps package.json to at least 2.75.0 (all three slots) and registers the verify script', () => {
    const PKG = JSON.parse(readRepo('package.json')) as {
      version: string;
      mbumah: { releaseVersion: string; baseVersion: string };
      scripts: Record<string, string>;
    };
    const atLeast = (v: string, base: string) => {
      const [a, b, c] = v.split('.').map(Number);
      const [x, y, z] = base.split('.').map(Number);
      return a > x || (a === x && (b > y || (b === y && c >= z)));
    };
    expect(atLeast(PKG.version, '2.75.0')).toBe(true);
    expect(atLeast(PKG.mbumah.releaseVersion, '2.75.0')).toBe(true);
    expect(atLeast(PKG.mbumah.baseVersion, '2.75.0')).toBe(true);
    expect(PKG.scripts['verify:v2-75-0']).toBe('node scripts/verify-v2-75-0.mjs');
  });

  it('keeps every prior surface intact (jump group, modal jump, footer pill, cross-links)', () => {
    const CHROME = readRepo('src/components/org/chrome.tsx');
    expect(CHROME).toMatch(/data-testid=\{`palette-release-\$\{r\.version\}`\}/);
    expect(CHROME).toContain('data-testid="changelog-jump-pill"');
    expect(CHROME).toContain('data-testid="footer-changelog-pill"');
    expect(CHROME).toContain("localStorage.setItem(SEEN_VERSION_KEY, APP_VERSION);");
    const VIEW = readRepo('src/components/org/desk-report-view.tsx');
    expect(VIEW).toContain('data-testid="desk-report-request-visit-reviewer"');
    expect(VIEW).toContain('data-testid="desk-report-reviewer-visit-request"');
  });
});

// ── 8. the inbox clears in place (v2.76.0) ──────────────────────────

describe('whatsNewMarkAllTarget - the stamp for mark-all-read (v2.76.0)', () => {
  it('is the feed head — the same truth the latest badge wears', () => {
    // Feed head, whatever release leads (2.77.0 now) — and stamping it
    // provably leaves nothing unread.
    expect(whatsNewMarkAllTarget()).toBe(WHATS_NEW[0].version);
    expect(whatsNewUnreadCount(whatsNewMarkAllTarget())).toBe(0);
  });
});

describe('CommandPalette - mark all read (v2.76.0)', () => {
  const CHROME = readRepo('src/components/org/chrome.tsx');

  it('offers the action only when there is something to clear (flag read, unread > 0, a target exists)', () => {
    expect(CHROME).toContain('{seenState.read && unreadCount > 0 && whatsNewMarkAllTarget() ? (');
  });

  it('writes the SAME shared flag, stamped with the feed head, and claims it immediately', () => {
    const handler = CHROME.split('const markAllRead = () => {')[1].split('  };')[0];
    expect(handler).toContain('whatsNewMarkAllTarget()');
    expect(handler).toContain('if (!target) return;');
    expect(handler).toContain('localStorage.setItem(SEEN_VERSION_KEY, target)');
    expect(handler).toContain('setSeenState({ read: true, value: target })');
  });

  it('storage failure claims nothing (the catch returns before any state moves)', () => {
    const handler = CHROME.split('const markAllRead = () => {')[1].split('  };')[0];
    expect(handler).toContain('catch {');
    expect(handler.indexOf('return; // storage unavailable')).toBeGreaterThan(-1);
    expect(handler.indexOf('setSeenState')).toBeGreaterThan(handler.indexOf('localStorage.setItem'));
  });

  it('stays open on select — you watch the counter and the NEW chips clear', () => {
    const item = CHROME.split('data-testid="palette-mark-all-read"')[1].split('</CommandItem>')[0];
    expect(item).toContain('onSelect={markAllRead}');
    expect(item).not.toContain('onOpenChange(false)');
  });

  it('the action carries the inbox family dress (CheckCheck, emerald icon, honest hint)', () => {
    const item = CHROME.split('data-testid="palette-mark-all-read"')[1].split('</CommandItem>')[0];
    expect(item).toContain('CheckCheck');
    expect(item).toContain('Mark all releases read');
    expect(item).toContain('text-emerald-500 dark:text-emerald-400');
    expect(item).toContain('stays open');
    expect(item).toContain('value="mark all releases read inbox got it catch up"');
  });

  it('sits inside the release group, ahead of the release items', () => {
    const action = CHROME.indexOf('data-testid="palette-mark-all-read"');
    expect(action).toBeGreaterThan(CHROME.indexOf('Jump to release'));
    expect(action).toBeLessThan(CHROME.indexOf('data-testid={`palette-release-${r.version}`}'));
  });

  it('the action explains itself on hover', () => {
    expect(CHROME).toContain('Writes the same seen flag the changelog’s “Got it” writes — the palette stays open');
  });
});

describe("What's-New 2.76.0", () => {
  it('leads the feed with the shortcuts story', () => {
    const WN = readRepo('src/lib/whats-new.ts');
    expect(WN.indexOf("version: '2.76.0'")).toBeGreaterThan(-1);
    expect(WN.indexOf("version: '2.76.0'")).toBeLessThan(WN.indexOf("version: '2.75.0'"));
    expect(WN).toContain('The shortcuts arrive');
    expect(WN).toMatch(/Mark all releases read/);
    expect(WN).toMatch(/j walks the doors/);
  });
});

describe('release metadata - v2.76.0', () => {
  it('bumps package.json to at least 2.76.0 (all three slots) and registers the verify script', () => {
    const PKG = JSON.parse(readRepo('package.json')) as {
      version: string;
      mbumah: { releaseVersion: string; baseVersion: string };
      scripts: Record<string, string>;
    };
    const atLeast = (v: string, base: string) => {
      const [a, b, c] = v.split('.').map(Number);
      const [x, y, z] = base.split('.').map(Number);
      return a > x || (a === x && (b > y || (b === y && c >= z)));
    };
    expect(atLeast(PKG.version, '2.76.0')).toBe(true);
    expect(atLeast(PKG.mbumah.releaseVersion, '2.76.0')).toBe(true);
    expect(atLeast(PKG.mbumah.baseVersion, '2.76.0')).toBe(true);
    expect(PKG.scripts['verify:v2-76-0']).toBe('node scripts/verify-v2-76-0.mjs');
  });

  it('keeps every prior surface intact (release inbox, jump group, cross-links, drawers)', () => {
    const CHROME = readRepo('src/components/org/chrome.tsx');
    expect(CHROME).toMatch(/data-testid=\{`palette-release-state-\$\{r\.version\}`\}/);
    expect(CHROME).toContain('data-testid="palette-release-unread"');
    expect(CHROME).toContain("state: seenState.read ? whatsNewReadState(e.version, seenState.value) : ('seen' as const),");
    const VIEW = readRepo('src/components/org/desk-report-view.tsx');
    expect(VIEW).toContain('data-testid="desk-report-request-toggle"');
    expect(VIEW).toContain('data-testid="desk-report-reviewer-toggle"');
    expect(VIEW).toContain('printReceiptElement(\'desk-report-content\')');
  });
});

// ── 9. the shortcut sheet tells the whole story (v2.77.0) ────────────────────

describe('ShortcutsModal - the desk report section (v2.77.0)', () => {
  const CHROME = readRepo('src/components/org/chrome.tsx');

  it('the sheet has a labeled desk-report section', () => {
    expect(CHROME).toContain('data-testid="shortcuts-desk-section"');
    expect(CHROME).toContain('On the desk report');
    expect(CHROME).toContain('/org/desk-report');
  });

  it('the three desk keys are listed with where they work', () => {
    expect(CHROME).toContain("['j', 'Desk report: walk to the next door']");
    expect(CHROME).toContain("['k', 'Desk report: walk to the previous door']");
    expect(CHROME).toContain("['esc', 'Desk report: close the open drawer']");
  });

  it('the section renders AFTER the console rows and reuses the kbd row dress', () => {
    const section = CHROME.indexOf('data-testid="shortcuts-desk-section"');
    const consoleRows = CHROME.indexOf("['cmd + K', 'Command palette']");
    expect(section).toBeGreaterThan(consoleRows);
    const body = CHROME.split('data-testid="shortcuts-desk-section"')[1].split('</div>')[0];
    expect(body).toContain('deskRows.map');
    expect(body).toContain('font-mono text-[10px]');
  });

  it('the section carries the FileText marker and a route hint', () => {
    const head = CHROME.split('<div data-testid="shortcuts-desk-section"')[1].split('</div>')[0];
    expect(head).toContain('FileText');
    expect(head).toContain('/org/desk-report');
  });
});

describe("What's-New 2.77.0", () => {
  it('leads the feed with the discoverable-walk story', () => {
    const WN = readRepo('src/lib/whats-new.ts');
    expect(WN.indexOf("version: '2.77.0'")).toBeGreaterThan(-1);
    expect(WN.indexOf("version: '2.77.0'")).toBeLessThan(WN.indexOf("version: '2.76.0'"));
    expect(WN).toContain('The shortcut sheet tells the whole story');
    expect(WN).toMatch(/aria-live/);
    expect(WN).toMatch(/returns you to the row that owned the drawer/);
  });
});

describe('release metadata - v2.77.0', () => {
  it('bumps package.json to at least 2.77.0 (all three slots) and registers the verify script', () => {
    const PKG = JSON.parse(readRepo('package.json')) as {
      version: string;
      mbumah: { releaseVersion: string; baseVersion: string };
      scripts: Record<string, string>;
    };
    const atLeast = (v: string, base: string) => {
      const [a, b, c] = v.split('.').map(Number);
      const [x, y, z] = base.split('.').map(Number);
      return a > x || (a === x && (b > y || (b === y && c >= z)));
    };
    expect(atLeast(PKG.version, '2.77.0')).toBe(true);
    expect(atLeast(PKG.mbumah.releaseVersion, '2.77.0')).toBe(true);
    expect(atLeast(PKG.mbumah.baseVersion, '2.77.0')).toBe(true);
    expect(PKG.scripts['verify:v2-77-0']).toBe('node scripts/verify-v2-77-0.mjs');
  });

  it('keeps every prior surface intact (mark-all action, inbox, walk, hint)', () => {
    const CHROME = readRepo('src/components/org/chrome.tsx');
    expect(CHROME).toContain('data-testid="palette-mark-all-read"');
    expect(CHROME).toContain('{seenState.read && unreadCount > 0 && whatsNewMarkAllTarget() ? (');
    // v2.109.0: the import line grew the Home icon (the Expert Console's
    // Home action) — the pin follows the source, not the memory.
    // v2.326.0: it grew again — AlertCircle + Loader2 (THE HONEST ERROR
    // FACE on the login dialog: the announced mistake + the busy spinner).
    // v2.406.0: it grew again — Megaphone (the announcement door's own
    // icon in the JUMP_DOORS map).
    // v2.434.0: it grew again — Footprints (the arc's own glyph, the
    // timeline chip the archive reads itself by).
    expect(CHROME).toContain("import { AlertCircle, CheckCheck, ChevronDown, ChevronUp, CloudOff, ExternalLink, FileText, Footprints, History, Home, Keyboard, Loader2, LogIn, Megaphone, Package, ScrollText, Sparkles, Terminal, Store } from 'lucide-react';");
    const VIEW = readRepo('src/components/org/desk-report-view.tsx');
    expect(VIEW).toContain('data-testid="desk-report-walk-announcer"');
    expect(VIEW).toContain('data-testid="desk-report-kbd-hint"');
  });
});

describe("What's-New 2.84.0", () => {
  it('leads the feed with the run-history story', () => {
    const WN = readRepo('src/lib/whats-new.ts');
    expect(WN.indexOf("version: '2.84.0'")).toBeGreaterThan(-1);
    expect(WN.indexOf("version: '2.84.0'")).toBeLessThan(WN.indexOf("version: '2.83.0'"));
    expect(WN).toContain('The run remembers its own steps');
    expect(WN).toMatch(/who did what/);
    expect(WN).toMatch(/no timestamp recorded/);
  });
});

describe("What's-New 2.85.0", () => {
  it('leads the feed with the missing-step story', () => {
    const WN = readRepo('src/lib/whats-new.ts');
    expect(WN.indexOf("version: '2.85.0'")).toBeGreaterThan(-1);
    expect(WN.indexOf("version: '2.85.0'")).toBeLessThan(WN.indexOf("version: '2.84.0'"));
    expect(WN).toContain('The walk gains its missing step');
    expect(WN).toMatch(/Submitted for approval/);
    expect(WN).toMatch(/prepared or submitted/i);
  });
});

describe("What's-New 2.86.0", () => {
  it('leads the feed with the who\u2019s-next story', () => {
    const WN = readRepo('src/lib/whats-new.ts');
    expect(WN.indexOf("version: '2.86.0'")).toBeGreaterThan(-1);
    expect(WN.indexOf("version: '2.86.0'")).toBeLessThan(WN.indexOf("version: '2.85.0'"));
    expect(WN).toMatch(/names its waiter/);
    expect(WN).toMatch(/Waiting on/);
    expect(WN).toMatch(/waiting since/);
  });
});

describe("What's-New 2.88.0", () => {
  it('leads the feed with the shape story — meter, door, filters', () => {
    const WN = readRepo('src/lib/whats-new.ts');
    expect(WN.indexOf("version: '2.88.0'")).toBeGreaterThan(-1);
    expect(WN.indexOf("version: '2.88.0'")).toBeLessThan(WN.indexOf("version: '2.87.0'"));
    expect(WN).toMatch(/shows its shape/);
    expect(WN).toMatch(/calibration meter/i);
    expect(WN).toMatch(/View reviews/);
    expect(WN).toMatch(/Showing X of Y/);
    expect(WN).toMatch(/never appear in any list/i);
  });
});

describe("What's-New 2.87.0", () => {
  it('leads the feed with the write-and-read story', () => {
    const WN = readRepo('src/lib/whats-new.ts');
    expect(WN.indexOf("version: '2.87.0'")).toBeGreaterThan(-1);
    expect(WN.indexOf("version: '2.87.0'")).toBeLessThan(WN.indexOf("version: '2.86.0'"));
    expect(WN).toMatch(/gets written/);
    expect(WN).toMatch(/dead end/);
    expect(WN).toMatch(/Read review/);
    expect(WN).toMatch(/blind acknowledgements/i);
  });
});

describe("What's-New 2.83.0", () => {
  it('leads the feed with the bundle story', () => {
    const WN = readRepo('src/lib/whats-new.ts');
    expect(WN.indexOf("version: '2.83.0'")).toBeGreaterThan(-1);
    expect(WN.indexOf("version: '2.83.0'")).toBeLessThan(WN.indexOf("version: '2.82.0'"));
    expect(WN).toContain('The run hands every slip over');
    expect(WN).toMatch(/Payslip bundle \(N\)/);
    expect(WN).toMatch(/_MANIFEST\.csv/);
  });
});

describe("What's-New 2.82.0", () => {
  it('leads the feed with the files-everything story', () => {
    const WN = readRepo('src/lib/whats-new.ts');
    expect(WN.indexOf("version: '2.82.0'")).toBeGreaterThan(-1);
    expect(WN.indexOf("version: '2.82.0'")).toBeLessThan(WN.indexOf("version: '2.81.0'"));
    expect(WN).toContain('The report files everything');
    expect(WN).toMatch(/File all N visits/);
    expect(WN).toMatch(/mbumah-desk-all-/);
  });
});

describe("What's-New 2.81.0", () => {
  it('leads the feed with the whole-scope story', () => {
    const WN = readRepo('src/lib/whats-new.ts');
    expect(WN.indexOf("version: '2.81.0'")).toBeGreaterThan(-1);
    expect(WN.indexOf("version: '2.81.0'")).toBeLessThan(WN.indexOf("version: '2.80.0'"));
    expect(WN).toContain('The link carries the whole scope');
    expect(WN).toMatch(/\?days=/);
    expect(WN).toMatch(/two-beat/);
    expect(WN).toMatch(/from the link/);
  });
});

describe("What's-New 2.80.0", () => {
  it('leads the feed with the addressable story', () => {
    const WN = readRepo('src/lib/whats-new.ts');
    expect(WN.indexOf("version: '2.80.0'")).toBeGreaterThan(-1);
    expect(WN.indexOf("version: '2.80.0'")).toBeLessThan(WN.indexOf("version: '2.79.0'"));
    expect(WN).toContain('The report is addressable');
    expect(WN).toMatch(/\?reviewer=/);
    expect(WN).toMatch(/Their file in the report/);
  });
});

describe("What's-New 2.79.0", () => {
  it('leads the feed with the drawers-file-themselves story', () => {
    const WN = readRepo('src/lib/whats-new.ts');
    expect(WN.indexOf("version: '2.79.0'")).toBeGreaterThan(-1);
    expect(WN.indexOf("version: '2.79.0'")).toBeLessThan(WN.indexOf("version: '2.78.0'"));
    expect(WN).toContain('The drawers file themselves');
    expect(WN).toMatch(/RFC-4180/);
    expect(WN).toMatch(/mbumah-desk-reviewer-/);
  });
});

describe('release metadata - v2.79.0', () => {
  it('bumps package.json to at least 2.79.0 (all three slots) and registers the verify script', () => {
    const PKG = JSON.parse(readRepo('package.json')) as {
      version: string;
      mbumah: { releaseVersion: string; baseVersion: string };
      scripts: Record<string, string>;
    };
    const atLeast = (v: string, base: string) => {
      const [a, b, c] = v.split('.').map(Number);
      const [x, y, z] = base.split('.').map(Number);
      return a > x || (a === x && (b > y || (b === y && c >= z)));
    };
    expect(atLeast(PKG.version, '2.79.0')).toBe(true);
    expect(atLeast(PKG.mbumah.releaseVersion, '2.79.0')).toBe(true);
    expect(atLeast(PKG.mbumah.baseVersion, '2.79.0')).toBe(true);
    expect(PKG.scripts['verify:v2-79-0']).toBe('node scripts/verify-v2-79-0.mjs');
  });

  it('keeps every prior surface intact (palette, inbox, shortcuts sheet, walk, drawer CSVs)', () => {
    const CHROME = readRepo('src/components/org/chrome.tsx');
    expect(CHROME).toContain('data-testid="palette-mark-all-read"');
    expect(CHROME).toContain('data-testid="shortcuts-desk-section"');
    const VIEW = readRepo('src/components/org/desk-report-view.tsx');
    expect(VIEW).toContain('data-testid="desk-report-walk-announcer"');
    expect(VIEW).toContain('data-testid="desk-report-reviewer-csv"');
    expect(VIEW).toContain('data-testid="desk-report-request-csv"');
  });
});
