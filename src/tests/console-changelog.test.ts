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
    // v2.486.0: the resting ledger learns to reach out and to carry in one breath onto paper — the share door learns the store's own number, the print door keeps its chorus, the number learns its edit door, the settings desk learns the branch's own words, the paper carries a scannable door, the file sings the chorus whole, the ledger answers to its own columns, the ledger answers to its own name, the shape answers to the ledger, the view speaks its own word, the chorus rides the chat door, the chorus learns the paper's scannable door, the file carries the chorus's own door, the paper speaks the window's word, the lens's word rides the address, the sort's word rides the address, the range's word rides the address, the range's dates ride the address, the people's window rides the address, the ledger's period rides the address, and the queue's own word rides the address: the system-health desk's DLQ lens answers the address bar (the desk's own toggle rides ?sh-dlq into the URL — the deep-link family's forty-fourth word, THE QUEUE: the toggle's OWN spellings — all, PENDING, RETRYING, DEAD, COMPLETED, CANCELLED — read as words through the ONE home's generic parser, a made-up member or a wrong case an unknown word, not a clever match; THE SUB-TAB LAW'S THIRD APPLICATION — a landing that carries the word raises the desk's own DLQ sub-tab, the pane's seed reading the same landed word, the chip visible on landing, switching sub-tabs afterwards the human's own navigation; the landing read once on the shell, every turned member replaceState's its word back through the lens's own door, THE DEFAULT WEARING NO WORD — all is the address's silence — and the landed member wears the red landing chip in the DLQ card's own header row: red joins the 300 registry, the etims desk's hue one storey deeper, the shade-split law's next form, red leaving the stranger list — the constitution's forty-fourth word, the THIRD sub-tab application) and the queue's buttons answer the word's own hue (the active member wears the red family's own tint — the desk's own byte order, never the loom's wardrobe copy — the six members speak their own handles, the pressed face answers the dark wardrobe) — the cascade's ninety-seventh generation
    // v2.485.0: the resting ledger learns to reach out and to carry in one breath onto paper — the share door learns the store's own number, the print door keeps its chorus, the number learns its edit door, the settings desk learns the branch's own words, the paper carries a scannable door, the file sings the chorus whole, the ledger answers to its own columns, the ledger answers to its own name, the shape answers to the ledger, the view speaks its own word, the chorus rides the chat door, the chorus learns the paper's scannable door, the file carries the chorus's own door, the paper speaks the window's word, the lens's word rides the address, the sort's word rides the address, the range's word rides the address, the range's dates ride the address, the people's window rides the address, and the ledger's period rides the address: the financial desk's window answers the address bar (the desk's own period rides ?fin-range into the URL — the deep-link family's forty-first word, THE LEDGER'S PERIOD: the desk's OWN spellings — today, week, month, quarter, year — read as words through the ONE home's generic parser, a made-up range an unknown word, not a clever match; THE CUSTOM'S HONEST SHARE — ?fin-range=custom rides with the desk-prefixed day pair fin-from/fin-to, custom landing only with both its days riding, each day honestDayKey proves real; the collision check ran at round start — both bytes appeared NOWHERE before this word — the landing read once on the shell (the SECOND shell-tab desk), every turned preset replaceState's its word back through the period's own door, THE DEFAULT WEARING NO WORD — month is the address's silence — and the landed period wears the green landing chip in the desk's own preset row: green joins the 300 registry, the loyalty desk's hue one storey deeper, the shade-split law's next form, green leaving the stranger list — the constitution's forty-first through forty-third words, the SECOND shell-tab desk, the THIRD shared family: three words, one chip) and the desk's buttons answer the word's own hue (the active preset wears the green family's own tint, the range label's quiet tabular strip — bg-muted/30 — the dark picker's color-scheme dress, the day inputs' own handles) — the cascade's ninety-sixth generation
    // v2.484.0: the resting ledger learns to reach out and to carry in one breath onto paper — the share door learns the store's own number, the print door keeps its chorus, the number learns its edit door, the settings desk learns the branch's own words, the paper carries a scannable door, the file sings the chorus whole, the ledger answers to its own columns, the ledger answers to its own name, the shape answers to the ledger, the view speaks its own word, the chorus rides the chat door, the chorus learns the paper's scannable door, the file carries the chorus's own door, the paper speaks the window's word, the lens's word rides the address, the sort's word rides the address, the range's word rides the address, the range's dates ride the address, and the people's window rides the address: the people desk's period answers the address bar (the HR reports desk's own scratch since v2.20.0 now speaks its word — the deep-link family's thirty-ninth word, THE WINDOW: ?hr-from= and ?hr-to= ride the desk's period, each side validating INDEPENDENTLY through the ONE home's own validator — a real from with a garbage to keeps the from, drops only the to, the v2.317 never-strand reading grown to a named pair; a made-up date is an unknown word — the landing read once on the shell, every scratched side replaceState's its byte back through the window's own door, THE DEFAULT WEARING NO WORD — the address's silence, never a stranded filter — and the landed window wears the blue landing chip on the desk's own toolbar row: the family's FIFTEENTH 300-storey byte, the transfers desk's hue one storey deeper, the shade-split law's next form, blue leaving the stranger list — the constitution's thirty-ninth and fortieth words, the FIRST non-tab desk, the SECOND shared family: two words, one chip) and the period gets its ground (the joined card's bg-muted/30 quiet ground, the dark picker's color-scheme dress, the tabular figures, the Apply seat) — the cascade's ninety-fifth generation
    // v2.483.0: the resting ledger learns to reach out and to carry in one breath onto paper — the share door learns the store's own number, the print door keeps its chorus, the number learns its edit door, the settings desk learns the branch's own words, the paper carries a scannable door, the file sings the chorus whole, the ledger answers to its own columns, the ledger answers to its own name, the shape answers to the ledger, the view speaks its own word, the chorus rides the chat door, the chorus learns the paper's scannable door, the file carries the chorus's own door, the paper speaks the window's word, the lens's word rides the address, the sort's word rides the address, the range's word rides the address, and the range's dates ride the address: the reports desk's custom face answers the address bar (the desk's own scratch speaks its whole word — the deep-link family's thirty-seventh word, THE PAIR: ?rep-from= and ?rep-to= ride beside ?rep-range=custom, the desk-prefixed day pair the collision check proved virgin — the bare from/to already speak the loyalty ledger's legacy window, so the pair wears the desk's own prefix — custom lands only with both its days riding (THE CUSTOM'S HONEST SHARE — a bare custom stays the honest absence), each day honestDayKey proves real (a made-up date is an unknown word), the landing read once on the shell, every scratched day replaceState's the pair back through the dates' own door, a named preset's turn stripping the pair — the constitution's first shared family: two words, one chip, the range's violet serving all three bytes) and the custom scratch gets its ground (the joined card's bg-muted/30 quiet ground, the dark picker's color-scheme dress, one label per end — the stray separator retired, the census keeping its ten voices) — the cascade's ninety-fourth generation
    // v2.482.0: the resting ledger learns to reach out and to carry in one breath onto paper — the share door learns the store's own number, the print door keeps its chorus, the number learns its edit door, the settings desk learns the branch's own words, the paper carries a scannable door, the file sings the chorus whole, the ledger answers to its own columns, the ledger answers to its own name, the shape answers to the ledger, the view speaks its own word, the chorus rides the chat door, the chorus learns the paper's scannable door, the file carries the chorus's own door, the paper speaks the window's word, the lens's word rides the address, the sort's word rides the address, and the range's word rides the address: the reports desk's time lens answers the address bar (the desk's own range rides ?rep-range into the URL — the deep-link family's fourteenth 300-storey byte, the SIX NAMED presets' own spellings read as words, THE CUSTOM'S HONEST ABSENCE — a custom landing without its dates would speak an unknown range, so the custom face stays the desk's own scratch — the landing read once on the shell, every hand-driven range turn replaceState's its word back, the DEFAULT stripping its key — the address never carries the resting face's word — and the landed range wears the violet landing chip in the desk's own preset row: violet joins the 300 registry, the shade-split law's next form, the constitution's thirty-sixth word) — the range's own face gets its dress (the whisper wears the family's glyph and the tabular figures — the paper's Period line's screen sibling — and the custom inputs speak their From and To), the census keeps its ten voices, and the desk never spells the host's word — the cascade's ninety-third generation
    // v2.481.0: the resting ledger learns to reach out and to carry in one breath onto paper — the share door learns the store's own number, the print door keeps its chorus, the number learns its edit door, the settings desk learns the branch's own words, the paper carries a scannable door, the file sings the chorus whole, the ledger answers to its own columns, the ledger answers to its own name, the shape answers to the ledger, the view speaks its own word, the chorus rides the chat door, the chorus learns the paper's scannable door, the file carries the chorus's own door, the paper speaks the window's word, the lens's word rides the address, and the sort's word rides the address: the dead-stock ledger's sort door answers the address bar (the desk's own order rides ?dead-sort into the URL — the deep-link family's thirteenth 300-storey byte, the ONE home's OWN orders read as words through DEAD_STOCK_SORTS — a made-up order an unknown word, not a clever match — the landing read once on the shell, every hand-driven sort turn replaceState's its word back, the DEFAULT stripping its key — the address never carries the resting face's word — and the landed order wears the emerald landing chip beside the window's and the lens's own: emerald joins the 300 registry, the shade-split law's next form, the constitution's thirty-fifth word), and the (hue, storey) registry grows PROPER — the seventh weave (the one parametric formula named: LANDING_CHIP_STOREYS and the LANDING_CHIP_REGISTRY tying the two arrays into one source of truth, landingChipWardrobe composing the tail both storeys speak, proven byte for byte against all thirty-five lines, the storey line ENFORCED — a hue that never spoke at a storey throws honestly) — the pressed column wears its own light (the bg-muted/50 ground, the family's own, never a second palette, the move riding transition-colors), the census keeps its ten voices, and the desk never spells the host's word — the cascade's ninety-second generation
    // v2.480.0: the resting ledger learns to reach out and to carry in one breath onto paper — the share door learns the store's own number, the print door keeps its chorus, the number learns its edit door, the settings desk learns the branch's own words, the paper carries a scannable door, the file sings the chorus whole, the ledger answers to its own columns, the ledger answers to its own name, the shape answers to the ledger, the view speaks its own word, the chorus rides the chat door, the chorus learns the paper's scannable door, the file carries the chorus's own door, the paper speaks the window's word, and the lens's word rides the address: the dead-stock search lens answers the address bar (the maker's own word rides ?dead-q into the URL — the landing read once on the shell, every hand-driven lens change replaceState's its word back, an emptied lens strips its key — the address never carries a silence — and the landed word wears the amber landing chip beside the window's own: amber joins the 300 registry, the shade-split law's next form, the constitution's thirty-fourth word), and the patience draws its own bar (the Days idle cell wears the capital bar's own dialect — the muted track, the fill in the number's own word, amber below half a year and rose past it, the never-sold row's cell keeping quiet) — the census keeps its ten voices, and the desk never spells the host's word — the cascade's ninety-first generation
    // v2.479.0: the resting ledger learns to reach out and to carry in one breath onto paper — the share door learns the store's own number, the print door keeps its chorus, the number learns its edit door, the settings desk learns the branch's own words, the paper carries a scannable door, the file sings the chorus whole, the ledger answers to its own columns, the ledger answers to its own name, the shape answers to the ledger, the view speaks its own word, the chorus rides the chat door, the chorus learns the paper's scannable door, the file carries the chorus's own door, and the paper speaks the window's word: the dead-stock paper's header speaks the idle window beside the dates (the ONE home's days expression, the dead-stock stage's own gate — the window IS the lens), the loom's sixth weave takes the head home (the pill head exported beside the ring and the faces, the inventory ledger's All chip rides the family component, the data-colored tribe's last two head hand-copies ride the import — one head, many hands), and the census pills learn the family's voices (the M-Pesa census's four idle faces gain the dark wardrobe the elder ledger named, the M-Pesa census and the security desk's time-window pills wear the zinc keyboard ring) — the census keeps its ten voices, and the desk never spells the host's word — the cascade's ninetieth generation
    // v2.478.0: the resting ledger learns to reach out and to carry in one breath onto paper — the share door learns the store's own number, the print door keeps its chorus, the number learns its edit door, the settings desk learns the branch's own words, the paper carries a scannable door, the file sings the chorus whole, the ledger answers to its own columns, the ledger answers to its own name, the shape answers to the ledger, the view speaks its own word, the chorus rides the chat door, the chorus learns the paper's scannable door, and the file carries the chorus's own door: the dead-stock ledger's file learns the chorus's own door — the CSV's summary block grows the "Chorus share link" row beside the Clearance chorus, the ONE home's deadStockChorusShareUrl (the exact word the Share all handle opens and the paper's lead card encodes), quoted like every word a CSV must survive, the canonical rows only (the view/archive law holds — the file is the archive's word); the desk's cards answer the hand — the three summary cards learn the hover lift, the dead-stock trio only; the paper wears its second dress — the rose rule under the chorus heading, the italic intro, new lines in the print CSS, the standing bytes untouched — the census keeps its ten voices (a word in the file, never a handle), and the desk never spells the host's word — the cascade's eighty-ninth generation
    // v2.477.0: the resting ledger learns to reach out and to carry in one breath onto paper — the share door learns the store's own number, the print door keeps its chorus, the number learns its edit door, the settings desk learns the branch's own words, the paper carries a scannable door, the file sings the chorus whole, the ledger answers to its own columns, the ledger answers to its own name, the shape answers to the ledger, the view speaks its own word, the chorus rides the chat door, and the chorus learns the paper's scannable door: the dead-stock ledger's collective word learns the paper's own scannable door — the print appendix's scan grid grows the LEAD card, one QR drawn by the qrcode house encoding the ONE home's deadStockChorusShareUrl (the exact bytes the Share all handle opens, the store's own number riding its third word when the branch keeps one on file), captioned "The ledger's chorus" with the honest count note, the teal dress marking the collective door beside the rows' own cards; the paper wears its own dress — the chorus's numbered asks in the rose markers, the note in the teal word, new lines in the print CSS, the standing bytes untouched — the gate stays the dead-stock stage with rows (three doors), the window still opens first, a failed draw prints the paper without the cards, the census keeps its ten voices (a drawn image, never a handle), and the desk never spells the host's word — the cascade's eighty-eighth generation
    // v2.476.0: the resting ledger learns to reach out and to carry in one breath onto paper — the share door learns the store's own number, the print door keeps its chorus, the number learns its edit door, the settings desk learns the branch's own words, the paper carries a scannable door, the file sings the chorus whole, the ledger answers to its own columns, the ledger answers to its own name, the shape answers to the ledger, the view speaks its own word, and the chorus rides the chat door: the dead-stock ledger's collective word learns its own reach-out — the ledger header grows the Share all handle beside the Copy all handle, one press opening WhatsApp with the WHOLE clearance chorus pre-filled (the SAME deadStockClearanceNotes bytes the clipboard carries, never a re-typed word), pre-addressed to the store's own chat when the branch keeps a phone on file (the contact's phone rides the composer's third word, the ONE home's own guard), the chat picker answering for the branch with none; the composer deadStockChorusShareUrl lives in the ONE home (the desk never spells the host's word), the handle wears the compact face and the share family's emerald hover, the double voice every handle wears, the honesty law holds (it only shows when rows exist, a blocked window speaks its side), the census grows its tenth voice (the dated re-key holds it), and the view/archive law stands (the file, the clipboard's copy all chorus and the print door keep the canonical rows) — the cascade's eighty-seventh generation
    // v2.475.0: the resting ledger learns to reach out and to carry in one breath onto paper — the share door learns the store's own number, the print door keeps its chorus, the number learns its edit door, the settings desk learns the branch's own words, the paper carries a scannable door, the file sings the chorus whole, the ledger answers to its own columns, the ledger answers to its own name, the shape answers to the ledger, and the view speaks its own word: the dead-stock ledger's pressed lens learns its own mirror — a footer under the table wearing the window lens's amber ground speaks the honest fraction (the badge's own shape), the view's own capital at cost (the family's rose word) and the view's slice of the ledger's rest drawn in the share-bar's own dialect (the bg-muted track, the rose-500 fill, aria-hidden); the word composed in the ONE home deadStockViewSummary — the count, the round2 capital, the slice in one decimal, the honest-share law worn (a zero ledger shares ZERO, never NaN), pure and deterministic, the desk never hand-sums; the word only sounds while the lens is pressed AND rows answer — a resting lens keeps the summary cards as the only voice, a lens that answers nothing already wears its own empty face — and the footer is a spoken voice, never a handle, so the census keeps its nine while the view/archive law holds (the file, the clipboard's copy all chorus and the print door keep the canonical rows) — the cascade's eighty-sixth generation
    // v2.474.0: the resting ledger learns to reach out and to carry in one breath onto paper — the share door learns the store's own number, the print door keeps its chorus, the number learns its edit door, the settings desk learns the branch's own words, the paper carries a scannable door, the file sings the chorus whole, the ledger answers to its own columns, the ledger answers to its own name, and the shape answers to the ledger: the dead-stock capital chart learns its presses — the pie's legend rows and the bar chart's bars become real handles through the charts' own optional onPress door (the double voice, aria-pressed, the keyboard's Enter and Space on the bars, the pressed segment's own face), one press riding the segment's own word into the search lens; the ONE home's lens answers the ledger's own Uncategorised word now (the word the shape already calls the unnamed shelf, so a press can never draw an empty answer) while the shape keeps the WHOLE ledger's capital — the chart reads the canonical rows, a press re-words the lens never the picture, and the file, the clipboard's copy all chorus and the print door keep the canonical rows — the cascade's eighty-fifth generation
    // v2.473.0: the resting ledger learns to reach out and to carry in one breath onto paper — the share door learns the store's own number, the print door keeps its chorus, the number learns its edit door, the settings desk learns the branch's own words, the paper carries a scannable door, the file sings the chorus whole, the ledger answers to its own columns, and the ledger answers to its own name: the dead-stock ledger learns its search door — the lens above the table answers to the words a row already carries (the name, the SKU, the category) composed in the ONE home filterDeadStockRows (the trimmed word the honest word, the case never mattering, an empty lens resting the whole ledger, a null category never crashing and never lying), the two lenses composing in ONE memo (filter first, then sort — a narrower shelf wearing the same honest order), the count badge answering the lens (the honest fraction, the whole size at rest), the clear × that only speaks when a word is pressed and the empty lens's own honest face (the words, the whole size, the clear handle); the view/archive law grows one lens — the file, the clipboard's copy all chorus and the print door keep the canonical rows, the lens is a viewer never a rewrite — the cascade's eighty-fourth generation
    // v2.472.0: the resting ledger learns to reach out and to carry in one breath onto paper — the share door learns the store's own number, the print door keeps its chorus, the number learns its edit door, the settings desk learns the branch's own words, the paper carries a scannable door, the file sings the chorus whole, and the ledger answers to its own columns: the dead-stock ledger learns its sort door — the Capital tied and Days idle headers answer to their own column, one press speaking that column's honest order composed in the ONE home sortDeadStockRows (the capital order the classifier's own standing word, the loudest debt first; the idle order the shelf's patience, longest idle first with the never-sold row standing at the front, its null a voice and not a zero), the pressed column wearing aria-sort and the family's ArrowDown, the resting one the muted chevrons; the view/archive law holds — the file, the clipboard's copy all chorus and the print door keep the canonical rows, the sort is a lens never a rewrite; the three stat cards learn their own whispers (the coins, the empty shelf and the percent joining their labels) — the cascade's eighty-third generation
    // v2.471.0: the resting ledger learns to reach out and to carry in one breath onto paper — the share door learns the store's own number, the print door keeps its chorus, the number learns its edit door, the settings desk learns the branch's own words, the paper carries a scannable door, and the file sings the chorus whole: the dead-stock CSV's footer speaks the collective word — the Clearance chorus row joins the summary block, the census (the count, the window, the capital at cost) composed by the ONE home deadStockChorusHeader the clipboard's copy all already sings, quoted like every word a CSV must survive; the ledger's rows learn their own bars — every Capital tied cell wears the summary bar's own dialect, the row's share of the loudest debt drawn under the figure, aria-hidden, the number still the voice; the chorus header is the byte it always was, extracted into its own ONE-home word so the five doors can never drift — the cascade's eighty-second generation
    // v2.470.0: the resting ledger learns to reach out and to carry in one breath onto paper — the share door learns the store's own number, the print door keeps its chorus, the number learns its edit door, the settings desk learns the branch's own words, and the printed ledger learns the scannable door: the dead-stock print page carries each row's own QR — the ONE home's share URL (the same word the Share button, the sheet and the chat speak, the store's address riding its third word) drawn as a 96px data URL by the qrcode house behind a dynamic import; the print window opens FIRST (the popup-blocked law keeps the gesture's tick) and the doors are drawn after; the scan to share appendix sits between the ledger and the chorus — the clearance asks still close the printed page — and a failed draw prints the paper without the cards while the toast speaks the honest word; the census holds — the desk never spells the host, the section's voices stay four — the cascade's eighty-first generation
    // v2.469.0: the resting ledger learns to reach out and to carry in one breath onto paper — the share door learns the store's own number, the print door keeps its chorus, the number learns its edit door, and the settings desk learns the branch's own words: the admin desk's Store Settings mock retired — the form spoke 'Mbumah Hardware' from component state for its whole life while the save button beside it wrote only the VAT rate; the branch's real name, location and phone now load from the session-validated /api/stores wire (the vat rate's own draft-wins pattern — a null draft mirrors the persisted words, a typed draft wins until save), and the save walks the TWO honest doors — the details ride the owner-only PATCH /api/stores/settings (SUPER_ADMIN or STORE_OWNER, the write shaped org-scoped — updateMany cannot rename a foreign store, a count of zero answers the calm 404, an empty location word clearing the nullable column honestly, the body read riding the ONE home with its explicit generic), the phone keeps its ONE home at PATCH /api/stores/phone, and both wires invalidate so the reports desk's pre-addressed chip flips without a re-load; the desk shows its work — dirty fields wear the amber ring and the unsaved dot, the save sleeps until a word changes, the VAT keeps its own honest button, and the share door's exact voice is previewed through the ONE home's display word — the cascade's eightieth generation
    // v2.468.0: the resting ledger learns to reach out and to carry in one breath onto paper — the share door learns the store's own number, the print door keeps its chorus, and the number learns its edit door: the picker chip's promise kept on the desk where the promise lives — the quiet "Shares open with the chat picker" face grew its press (a real button, the double voice every handle wears, the dashed border the pressable hint), one press opens the ResponsiveDialog (one Input, Enter saves, the door's own normalize spoken as the helper word), and the save rides the owner-only PATCH /api/stores/phone (SUPER_ADMIN or STORE_OWNER, the write shaped org-scoped — updateMany cannot address a foreign store, a count of zero answers the calm 404 — the number stored exactly as typed, the ONE home normalizes at composition time, the log masked to the last three digits); THE LIVE FLIP — the save invalidates the desk's own wire and the chip flips to the pre-addressed face in place, no other tab, no re-load; the census grows its fourth voice — the edit door's own handle — and the v2461 dated re-key holds it — the cascade's seventy-ninth generation
    // v2.467.0: the resting ledger learns to reach out and to carry in one breath onto paper — the share door learns the store's own number, the print door keeps its chorus: the wa.me door grows its honest second face — a store with a phone on file answers its own door (the composer's optional third word: waMeDigits strips the noise, grows the 0-prefix to 254, shaves the +, and the URL pre-addresses to wa.me/<digits> with the SAME encoded note the clipboard holds — no phone, null, or a word that normalizes to nothing keeps the picker door byte-for-byte), and the ledger header speaks which door answers (the emerald pre-addressed chip names the branch and its number, the quiet picker face says the chat picker answers — a status word, never a handle, the census's three handles stay three); ONE DOOR EVERYWHERE — the share handle and the CSV's share link column ride the SAME pre-addressed composer, the chat and the sheet can never name two different doors — one voice, five doors, and now the door knows where home is — the cascade's seventy-eighth generation
    // v2.466.0: the resting ledger learns to reach out and to carry in one breath onto paper — the chorus takes the print door: the note's FIFTH door opens — on the dead-stock stage the printed page closes with the clearance asks (the collective composer's OWN word, the ONE home's header line over every row's clearance note, escaped for the print window, wearing the rose family in the print window's own inline CSS — the desk's alarm word, never a second palette), and the print button wears the double voice on the dead-stock stage (the plain face everywhere else — the export button's law, the print door's turn); THE PRINT WINDOW'S HONESTY — a browser that blocks the print window no longer answers silence, the toast speaks its side (the share door's popup-blocked law, now the print door's own) — one voice, five doors, the clipboard and the chat and the sheet cell and the sheet column and the paper can never drift apart — the cascade's seventy-seventh generation
    // v2.465.0: the resting ledger learns to carry in one breath — the file rides the share link and the ledger speaks its chorus: the note's FOURTH door opens — the dead-stock CSV grows a Share link column beside the Clearance note column, each row's wa.me word composed in the SAME ONE home the clipboard and the share door already speak (never re-typed in the desk), the cell quoted like every word, so the sheet starts the supplier conversation too — one voice, four doors, and the four can never drift apart; THE LEDGER'S CHORUS — deadStockClearanceNotes composes the collective word in the ONE home (a header line speaking the ledger's own summary — the count, the window, the capital at cost, the round2 convention the summary card wears — over the SAME per-row notes the Ask copies), and the ledger's header grows the Copy all handle that carries the whole word to the clipboard at once, the toast answers with the count, a refused clipboard speaks its side, and the handle only shows when rows exist (a button that copies nothing would be a lie); the chorus's seat wears the compact face and the emerald hover the family already speaks — the cascade's seventy-sixth generation
    // v2.464.0: the resting ledger learns to reach out and to carry — the clearance note rides the file: the note's THIRD door opens — the dead-stock CSV export (the client-side door, the server door never borrowed) gains a Clearance note column speaking the SAME deterministic note the Ask copies and the share door sends, composed in the ONE home row by row (never re-typed in the desk), CSV-escaped with the window that caught each row riding inside the word — one voice, three doors, the clipboard and the chat and the sheet can never drift apart; the share of stock value is DRAWN (a thin rose bar under the number, the family's own word never a second palette, aria-hidden because the number above IS the voice — a second label would be a stutter); and the export button speaks its file only when the dead-stock report is on stage (the conditional undefined falls back to the plain CSV face) — the cascade's seventy-fifth generation
    // v2.463.0: the resting ledger learns to reach out — the clearance note takes the share door: the note's SECOND door opens — every dead-stock row's Ask handle gains a Share sibling that opens the maker's own WhatsApp with the SAME deterministic clearance note already composed (one voice, two doors — the URL is the wa.me word for the note, composed in the classifier's ONE home THROUGH the note's own composer, so the clipboard and the chat can never drift apart); the row names no supplier, so the URL carries no phone — WhatsApp opens with the text pre-filled and the maker picks the chat (the recipient-addressed instrument stays api.ts's own, a phone-bearing word this row does not carry); the ledger's last column wears its pair — a tight two-door group, the share handle in the emerald hover the family already speaks, the double voice every row action wears, and a browser that blocks the window speaks its side (the toast answers, the row stays whole — the popup-blocked honesty law) — the cascade's seventy-fourth generation
    // v2.462.0: the resting ledger learns to share — the dead-stock window takes an address, the capital draws its shape, every row learns to ask: the NINTH report's three new faces land together — the idle window joins the deep-link family as its THIRTY-THIRD word (?dead-window=30|60|90 lands the lens already turned; the words are the window tuple's OWN spellings read through the generic parser from DEAD_STOCK_WINDOWS, the ONE home; a made-up window is an unknown word, the default is 90; the lens WRITES BACK — a hand-driven turn replaceState's the word into the address, the preserve law, so a turned lens is a shareable address; the landing chip wears the ROSE byte at 300/100 — the two-storey census was FULL, so the family grew one line rather than masquerade; the chip lives in the SECTION — the lens is inside the dead_stock stage, the sub-tab law's shape; the DEFAULT WEARS NO CHIP; navigation is never a lens change); the desk learns its chart (the Chart Type row covers the ninth report with the two honest faces — bar and pie of capital tied by category, grouped in the classifier's one home, line and area are time-series words categorical capital cannot wear, zero new fetches, the chart draws only when rows rest); and every row learns to ask (the Ask button carries a deterministic WhatsApp-ready clearance note to the clipboard — units and base unit, capital at cost, the ISO day, the never-sold row's honest absence; no supplier name invented; the clipboard is the door) — the cascade's seventy-third generation
    // v2.461.0: the dead stock speaks — the reports desk counts what rests: the NINTH report type joins the desk — Dead Stock: every product HOLDING stock with no sale in the idle window (30 | 60 | 90, the lens's own tuple; a made-up window is a 400, default 90) or never sold at all; the MEANING lives in one home (src/lib/reports/dead-stock.ts, the pure classifier the suite proves without a database — an empty shelf is NOT dead stock, no capital rests in it; a null last-sold speaks "never", never a fabricated zero; rows sort capital-tied DESC with the name tiebreak; the honest share guards the zero total, the v2.205.0 law); the wire gathers the facts (the fast-moving sale vocabulary: SALE / COMPLETED / PARTIAL) and the payload rides rows — the NAMING AS CONTRACT law honored again (products/items/data array keys banned at source, the summary survives the trip); the Report Type grid completes its three-by-three (the ninth card, Hourglass), the window lens rides the filter-chip loom (the amber tint word — aria-pressed and the zinc ring come with the family, never hand-rolled), the ledger speaks each row's last sale or the honest never-sold badge with the idle days aged by colour (rose past 180, amber below), the CSV file carries the section's own rows client-side (the server export door is never borrowed for a report it cannot speak), and ?rep-type=dead_stock lands the report through the ONE home (REP_TYPE_FILTERS speaks nine, the deep-link suite re-keyed with the dated note) — the cascade's seventy-second generation
    // v2.460.0: the attestations come home — the data-colored chips learn the grammar: two comings-home in one round — THE MUSEUM SHELF (the verify-v2-* pin unwind, Task 27's last named follow-up): the 347 point-in-time attestation scripts took scripts/release-attestations/ byte-untouched (git-mv renames), the 310 verify:v2-* keys left package.json, the 86 living key-pins left the suites (nine emptied it() blocks retired with honor — the aggregate truth re-homes in attestation-museum-v2460.test.ts), 19 shelf-path reads and the docs line re-keyed, and the census caught two mis-aged exhibits (the file wired as 307 speaks v2.351.0 — the audit-remediation gate whose wiring key was the PR number, the bytes the release; the file wired as 351 speaks v2.352.0) and re-homed both by their true ages; THE SHELF CENSUS — verify-ancestors reads the shelf byte-wise (a museum piece is read, never run): every attestation must speak its own v2.X.Y age-word, the era-proof word both header conventions carry, decay exits 1; THE DATA-COLORED TRIBES — the ledger's last two rows taken: the POS and inventory category chips (per-row inline colors, never a named tint) learned the family's grammar — aria-pressed and the zinc ring through the EXPORTED CHIP_RING_ZINC / CHIP_ACTIVE / CHIP_IDLE constants (one home, many hands); THE MASQUERADE RETIRES — .chip-active inlined its own face (scale-105 + the oklch wash) and left globals.css (a motion utility stays; a vocabulary masquerade may not); THE SCALE DIALECT RETIRES — the inventory tags ride the family head (border, no grow) and the strip's arrows wear honest glyphs (ChevronLeft / ChevronRight) instead of a rotated ChevronDown; the LEDGER IS EMPTY — every chip in src rides the loom's bytes or the loom's constants — the cascade's seventy-first generation
    // v2.459.0: the customers ride the loom — the glass idle joins the tints: the elder loom's fifth weave — the customers desk's four quick chips (All / Active / With Debt / Loyalty Members), the ledger's LAST named tint dialect, retired their hand-rolled button and ride the loom's TINT registry with the emerald tone; THE GLASS IDLE — the desk's historic glassy backdrop voice (bg-white/60 … dark:bg-white/5, made for the customers card's gradient face where the transparent tint idle would show the card straight through) joined the loom byte-exact as CHIP_TINT_IDLE_GLASS through the glass prop (a desk's backdrop is its own voice — the slim-head precedent); THE NAMED UNIFICATION (the shadow-sm precedent, second verse) — the hand-copy's drifted emerald (text-700, dark 900/30, -400/-700) retired for the registry byte (-800, 950/40, -200/-900 — the ACHIEVED goal chip's own face), and the desk speaks no emerald lens byte at all (its voucher type-BADGE keeps its own wash — a badge voice, never a lens face); THE PRESSED VOICE AND THE FAMILY'S ZINC RING arrived — neither chip spoke aria-pressed nor wore a ring before, and the completion is family-wide; the four per-color count badges (emerald/cyan/amber/purple) stay the desk's own children, and the hand-rolled tint dialect count across src is now ZERO — the cascade's seventieth generation
    // v2.458.0: the review chips ride the registry — sky joins the tints: the elder loom's fourth weave — the performance desk's review-status filter row (the LAST hand-rolled speaker of the transparent tint idle in the desk) retired its STATUS_CHIP_ACTIVE Record and rides the loom's TINT registry; SKY joined the closed registry for the ACKNOWLEDGED word (the review table pill's own law aligned it family-wide — the filter row's hand-copy matched byte-for-byte, so the move is faithful), and the registry's shape is FIVE tones (amber, emerald, rose, slate, sky); the row's named AMBER RING voice (the review deep-link family's own keyboard ring since v2.286.0) rode the desk's className byte-preserved with focusRing="none" — the loom emits no competing zinc ring (the live DOM probe read amberRing: 6, zincRing: 0 before the weave); the desk keeps its WORDS (STATUS_TONE: DRAFT slate, SUBMITTED amber, ACKNOWLEDGED sky, CALIBRATED emerald) and the whole desk now speaks three FilterChip tint rows (goal filter slim, goal edit compact, review filter slim); the v2.455.0 ledger's fourth row exits — the taken seat is pinned by its own dated re-key, and the named remainder is the customers desk's emerald dialect alone — the cascade's sixty-ninth generation
    // v2.457.0: the loom learns the tints — the goal chips ride one registry: the elder loom's third weave — the goal chips (the HR performance desk's filter row, its park-or-reopen switch, and the self-service portal's My-goals row) had carried the badge-family palette in THREE hand-copied Record constants, and the copies had drifted (the portal's OPEN chip still wore the old sky pressed-state the console's v2.306.0 one-colour law retired — the same word wore a second colour one bundle away); the tints moved to ONE home in the loom (CHIP_TINT_ACTIVE / CHIP_TINT_IDLE — amber, emerald, rose, slate, the transparent idle face tone-independent as all three desks already shared it) and the desks keep only their WORDS (the GOAL_TONE maps — which status wears which family, never the wardrobe bytes); the slim head (px-2.5 py-0.5, transition-colors) joined the loom's head family beside the regular and compact faces; the goal chips gained the family's zinc keyboard ring (the live DOM probe read zero rings before the weave) while the pressed voice rides every loomed chip; the review chips' dialect and the customers desk's emerald dialect stay hand-rolled (the ledger's remaining map) — the cascade's sixty-eighth generation
    // v2.456.0: the loom learns the tones — every status lens rides one palette: the elder loom's second weave — the two registry-driven status lenses (the debt-plans desk's status filter and the exports history's status filter) had carried the SAME color palette in TWO hand-copied Record constants; the palette moved to ONE home in the loom (CHIP_TONE_ACTIVE / CHIP_TONE_IDLE — emerald, green, rose, amber, zinc, the dark: variants riding the idle faces exactly as the desks kept them) and the desks speak no wardrobe byte (the masquerade law, loom form); the shadow unification was the weave's one named, deliberate improvement (the debt-plans active face carried shadow-sm, the exports face stood flat, and the family's own primary active face already lifts — the shadow rides every tone now); the exports history's status chips GAINED the pressed voice (aria-pressed — the debt-plans desk already spoke it) and both lenses gained the family's zinc keyboard ring, while the count badges' byte-identical wardrobe moved into the FilterChipCount companion; the TYPE row's slate dialect stays hand-rolled (the ledger's remaining map) — the cascade's sixty-seventh generation
    // v2.455.0: the elder loom's first weave — every lens chip speaks its pressed state: the carry that has stood since v2.397.0 took its first weave — the ELDER lens chips (the pill filters that predate the deep-link era; the landing chips loomed in v2.394.0 while these stayed hand-rolled) met ONE wardrobe component (src/components/filter-chip.tsx): the muted/50 family's head, its primary active face, its muted idle face, the compact py-1 face, the pressed voice (aria-pressed — the debt-plans desk's own precedent) and the family's zinc keyboard ring on the faces that never wore one, while the payment chips kept their signature v2.333 violet through the loom's opt-out (focusRing="none" — two ring colours in one class list would resolve in the stylesheet's order, not the attribute's, and the loom refuses that coin flip); SIX faces in TWO desks migrated (the transactions desk's date presets, payment quick chips, type census and amount toggle; the reports desk's date presets and chart-type chips) and the desks speak no wardrobe byte (the masquerade law, loom form — the palette strings live in exactly one src file, the POS idle string the one named rider); the LEDGER names the remaining dialects for the next weaves (inventory's scale chips, the customers desk's emerald chips, the POS gradient chips, the HR goal chips, the registry-color chips) — the cascade's sixty-sixth generation
    // v2.454.0: the debt voices reconcile — every figure names its source: the carried question from the reduce sweep ran its census and found the shell speaking "Outstanding Debt" through FIVE seats measuring TWO different ledgers — the LEDGER voice (DebtLedger.balance over the outstanding statuses OUTSTANDING/PARTIAL/OVERDUE, store-scoped, plan-tracked rows only) speaking at the dashboard KPI (the crisis summary's outstandingTotal falling back to the route's flat aggregate), the financial desk's card and the financial overview's card (both reading the dashboard wire's outstandingDebt field), and the MIRROR voice (Customer.currentDebtBalance over the customers wire, all-time) speaking at the customers desk's fifth card and the reports desk's analysis card; the two may disagree BY DESIGN and neither is wrong — the round taught every seat to say which voice it speaks (a small muted scope line under the figure, a testid apiece, and a hover coach telling which table the sum reads, which statuses count, and why the other voice may honestly disagree), the figures themselves untouched — the cascade's sixty-fifth generation
    // v2.453.0: the reduce sweep — the customers wire learns its numbers: the sweep the v2.452.0 confession promised ran grep across every desk's summing seat and found the customers wire feeding its sums raw Prisma Decimals — the contract declared number, the spread delivered Decimal-as-string, and the reports desk's customer-analysis card read the lie LIVE (three real debts of 3500, 1200 and 0 glued into "035001200" — Ksh 35,001,200.00 for Ksh 4,700.00 of real debt, the same lie class the invoices stats confessed one tab line over) while the customers desk carried the same shape LATENT (a sum the underscore kept silent); the fix is three seats deep — the wire's honest boundary (the list route coerces currentDebtBalance and debtLimit to numbers after the spread, so every future consumer is born honest — the v2.450.0 comparator fix told the truth at its seat while the wire kept lying underneath), the live seat's own Number() (defense in depth, the invoices-stats law, its figure wearing tabular digits), and the latent seat LIT (the customers desk's fifth stat card — the desk finally speaks its own debt total in the risk family's rose-to-red gradient); the aging buckets were honest by arithmetic accident (subtraction coerces) and every other desk's summing seat passed the same audit (kpi-doors, branch-doors, desk-doors, kpi-row, payroll, restock, checkout, stock-take, sheet-drill, plans, reports' other eight seats) — the cascade's sixty-fourth generation
    // v2.452.0: the fixture world learns to bill — the invoice register gets its witnesses: the invoices desk answered every QA burst honestly empty (the other three fixture worlds never wrote an Invoice row — the v2.451.0 carry), so db:fixtures now stands up FOUR worlds through the one door and the register gets its ELEVEN WITNESSES — every document type wears a row (INVOICE, QUOTATION, PROFORMA, CREDIT_NOTE, DEBIT_NOTE) and the register's statuses wear rows too (PAID, SENT, DRAFT, CANCELLED, INVOICED — EXPIRED rides the quotation, where the lazy expiry law writes it); the money bait is set (the six register totals are distinct AND lexicographic ≠ numeric — 725.75 first numerically, "9500" last lexicographically — so the walk that catches a string/string comparator is one press away and the v2.451.0 coercion seat keeps its LIVE proof forever); the lazy-expiry law is spoken by the seeds, not fought (living quotations carry FUTURE due dates, one past-due quotation already wears EXPIRED); the watcher learned to COUNT THE RUNS, NOT JUST THE PENDING (the green verdict requires the known total, eleven faces, AND zero pending — a half-born CI is named, tolerated, then refused, never green); and the register's money column wears tabular digits; and the witnesses' first boot exposed the stats row's own concat lie (the reduce seeds 0 and the wire delivers Decimal-as-string, so 0 + "9500" grew into "0950012000045000" — the outstanding card read Ksh 950,012,000,045,000.00 for a Ksh 174,500 register) and the stats reduces coerce now — the cascade's sixty-third generation
    // v2.451.0: the money-sort sweep — every desk's comparator tells the truth: the customers desk confessed in v2.450.0 and this round the sweep greps every generic aVal-comparator for the same string/string lie — and finds TWO more desks lying (the invoice register's total-amount read and the inventory desk's price, cost and stock reads — quantityInStock is a DECIMAL column in the schema, NOT an integer, so all four seats received Decimal-as-string and compared LEXICOGRAPHICALLY, "120000" before "15000"); all four seats now COERCE at the comparator (the one seat each desk owns — the v2.12.5 cost-hidden coalesce keeps its seat inside the coercion) so the biggest invoice, the priciest shelf and the fullest stock read honestly; the SAFE patterns are pinned as positive controls (the profit margin's arithmetic — subtraction and division coerce — the supplier leaderboard's computed metrics — reduce with arithmetic, numbers before the comparator — and the identifier sorts' lexical-by-design law) — the cascade's sixty-second generation
    // v2.450.0: the money sort — the debt desk's loudest read tells the truth: a live QA probe caught the customers desk's debt sort LYING (the wardrobe round's honest probe proved the aria flip while the order refused to be numeric — 0, 0, 120000, 15000, 250000 as the "ascending" walk): balances arrive as DECIMAL-AS-STRING (the contract says number — the Kenya Plumbing Co. law that contract types don't enforce runtime) and string vs string compares LEXICOGRAPHICALLY ("120000" sorts before "15000"), so the loudest-debtor read put 5,000 above 45,000; the comparator now COERCES at the one seat the desk owns (Number(a.currentDebtBalance) — and loyaltyPoints with it, the same incident class) — the debt filters and the credit-envelope meter already coerced correctly (number-literal comparisons and division), the wardrobe's bytes keep their exact seats, and the ascending walk and the loudest-debtor read are honest for every balance — the cascade's sixty-first generation
    // v2.449.0: the debt desk wears the family's wardrobe — the customers' sort handles learn the census's grammar: four rounds taught the census and the history the sort grammar and this round the CUSTOMERS DESK's three handles (Customer, Debt Balance, Loyalty) learn it (aria-sort comes to the desk that had NONE — ascending or descending on the speaking column, silence on the rest; the active voice reads SEMIBOLD under a lit arrow — up for ascending, down for descending, the always-on rotated ArrowUpDown retired; the waiting ChevronsUpDown appears on hover/focus and the zinc focus-visible ring carries the keyboard; both aria-label voices and titles speak the landing and the flip; QA gains testids on all three handles); the desk's own two-press law rides untouched — ONE sortField state means only one voice can speak at a time BY CONSTRUCTION (the exclusion is structural here, no retirements needed) and the sort's ties break by the customer's own name (the family's determinism law — return 0; is gone) — the cascade's sixtieth generation
    // v2.448.0: the history's records voice — the unordered wire learns to sort: the Created header gave the Export History its mirror and this round the Records header learns its own FIRST voice (one press sorts the history LOUDEST-BY-RECORDS — the run carrying the most data reads first — desc-first, the census's records-lens grammar ported across the tab line, the row's own id as the deterministic tiebreak, press again and the wire's newest-first law returns); the exclusion lives at the press (the records voice retires the Created mirror and the mirror retires the voice — no reconcile effect, the lint zero held) and both sorts ride above the lenses (the type and status chips' conjoin keeps its exact seat, the API's orderBy createdAt desc was never rewritten); the wardrobe rides this table's own light (the active voice is SEMIBOLD under a lit ChevronDown — the weight speaks where the census's color spoke) — the cascade's fifty-ninth generation
    // v2.447.0: the history's mirror — the Created header answers: the census learned to sort itself in three voices and this round the Export History table answers with its own mirror (the Created header becomes a real button — one press INVERTS the wire's newest-first law, the OLDEST runs read first with the row's own id as the deterministic tiebreak, press again and the law returns); the mirror RIDES ABOVE THE LENSES (a new pass over the already-filtered rows — the type and status chips' conjoin keeps its exact seat, and the API route's orderBy createdAt desc was never rewritten); the wardrobe rides this table's own light (the th already speaks text-foreground, so the active voice is SEMIBOLD under a lit ChevronUp — the weight is the visible differentiator) — the cascade's fifty-eighth generation
    // v2.446.0: the runs mirror — the law's own header answers: the records lens gave the census a second sort voice and this round the law's own header answers with its mirror (the By Type table's Runs header becomes a real button — one press INVERTS the run-count law, the QUIETEST desk reads first with the same name tiebreak, press again and the law returns); the third voice rides above the law like its sibling (a new sort pass over the already-lawful rows — the law's bytes and the records voice keep their exact seats) and the voices are EXCLUSIVE (the most recent press names the order — the mirror's press retires the records lens, the lens's own press bytes stay verbatim for the elders' pin, and the reconcile effect retires the mirror when the lens lands) — the cascade's fifty-seventh generation
    // v2.445.0: the records lens — the census learns a second sort voice: the census door learned to open panes and this round it learns to reorder itself (the By Type table's Records header becomes a real button — one press re-sorts the census loudest-by-records, the desk moving the most DATA reads first, not just the desk running the most exports; press again and the run-count law returns); the second voice RIDES ABOVE THE LAW (the default .sort keeps its exact seat — the elders' pin survives verbatim — and the records sort is a new pass over the sorted rows, both voices breaking ties by the type's own name); the header is the handle (the hover affordance waits at opacity-0, the active voice reads foreground under a lit ChevronDown, aria-sort names the order, the thead sits OUTSIDE the door rows so no conjoin is even possible) — the cascade's fifty-sixth generation
    // v2.444.0: the status door opens — the withdrawn badge lenses the cancelled: the census door's sibling (the withdrawn count was the one number on the By Type table that only counted) and this round its zinc badge becomes a real button whose press lands the history on the cancelled status lens through the controlled hand (chooseExpStatus, never a direct state write — press the pressed badge again and the lens releases); ONE FAMILY, THREE SEATS: the pressed wardrobe is the history chip's own zinc active bytes (bg-zinc-600 text-white border-zinc-600 — beside the history chip and the stats card), the keyboard answers natively (a real button needs no manual handler), the press stops propagation (the badge sits inside the type door's row — the two doors never conjoin a press), the honest zero stays a census (a zero-count door invites a pointless press), and the header note names both doors (press a row to lens the type · a withdrawn badge lenses the cancelled) — the cascade's fifty-fifth generation
    // v2.443.0: the census becomes a door — the By Type rows lens the history: the By Type table landed last release as a census (a face that only counted) and this round its rows press through to the history's own lens (the door the deep-link desks already know, opened from the census side); a row whose wire type owns a lens word lands the history pre-filtered through the controlled hand (chooseExpType, never a direct state write — press the seat again and the lens releases), the translation lives in the ONE home (expTypeWordFor in tab-url.ts — the wire's UPPERCASE to the lens's kebab, and the NEUTRAL IS NOT A WORD: wire ALL answers null with the off-union rows, a door that filters to all being a no-op masquerading as a door); the active row wears the desk's emerald seat in both states (light 50/70, dark 500/10) with aria-current and the lens icon lit, the idle doors wear the hover/focus-visible seat, the keyboard answers Enter and Space, and the header note names the door (press a row to lens the history) — the cascade's fifty-fourth generation
    // v2.442.0: the trends find their dark voice — the by-type census lands: v2.441.0's tail named the small verse (the honest-zero trend had no dark-mode-specific face) and the carried verse finally took its seat (the byType aggregate was computed, typed, and rendered nowhere); every stat card's trend line speaks its own family — light 600, dark 400 (the badges' dark-pair grammar) — through the trendClass field (the muted-foreground default the fallback law), the plans and schedule dashes wear the same grammar (the mirror law) and their trend lines gain the native title hover; the stats wire's byType entries grow the cancelled field (count INCLUDES the withdrawn rows — the honest inclusion) and the exports desk grows the By Type table (runs, records, the withdrawn split in the zinc voice — the Cancelled badge family — loudest-first, the empty state rendering no table) — the cascade's fifty-third generation
    // v2.441.0: the withdrawn count takes its own card — the exports grid wears the whole census: v2.440.0 grew the stats contract the fourth key (cancelledExports) and taught the Total Exports trend line three segments, but the count rode a trend line — a census without a home; the fifth glass card takes the census (the zinc voice — the table's Cancelled badge family — and the Ban icon, the withdrawn face), seated beside Total Exports (the census pair), the Total Exports trend reads "N completed · M failed" again (one number, one home — the rich-trend node retires with the hand-over), the card's trend line speaks both states honestly (withdrawn before completion — never a file; the honest zero — stuck exports retire here), and the grid wears five cards (grid-cols-2 md:grid-cols-5, the skeleton matching, the stagger-5 delay landing the fifth card on beat — the cascade's fifty-second generation)
    // v2.440.0: the census learns the withdrawn word — the exports stats speak every status they keep: v2.439.0 taught the desk to retire a stuck export but the stats contract never heard the news (totalExports / completedExports / failedExports only — the Total Exports card trend line read "10 completed · 2 failed" and the cancelled row vanished from the census), so cancelledExports joins the route's aggregate and the response contract (withdrawn before completion — the cancel door's own census), the honest denominator names its law (successRate = completed / (completed + failed) — cancelled rows excluded too, a withdrawn run never had a file, so it can be neither a success nor a failure), the Total Exports card's trend line speaks three segments (N completed · M failed · K cancelled — the cancelled segment wearing the zinc voice, the Cancelled badge family, through the new rich-trend node), and the Success Rate card names its own denominator (completed vs. failed runs, cancelled excluded — the cascade's fifty-first generation)
    // v2.439.0: the stuck row learns to bow out — the cancel door retires the waiting-room ghosts: a PENDING/PROCESSING row whose invocation died (serverless timeout, closed tab) used to wait forever (a spinner that never stops, a 409 for eternity, no word in the vocabulary for what happened), so POST /api/data-exports/[id]/cancel gives the stuck row its honest exit (only a stuck row passes — a finished row is never rewritten, the row STAYS wearing its note, the audit speaks DATA_EXPORT_CANCELLED), the vocabulary speaks every word it keeps (the zinc Cancelled badge with the Ban icon, the Cancelled chip joins the lens row, exp-status=cancelled joins the deep-link words, the cancel hand on exactly the waiting rows, the row dims to opacity-60 — the withdrawn read), the download route answers the cancelled face with its own 409 message between the FAILED gate and the expiry gate (the 410's order pin untouched), and the fixture world wears the face (one LOYALTY row cancelled by the owner — fifteen rows, the badge wearable on a fresh world — the cascade's fiftieth generation)
    // v2.438.0: the world learns to expire — the export history wears the retired read: the expiry story was fully written in code and never spoken on a fresh world (the derived Expired badge, the disabled download with its honest tooltip, the endpoint's 410 Gone BEFORE the COMPLETED gate, the retention chip's silence — "the badge owns the past" — all waited for a row with a past expiresAt that no fixture carried), so the fixture world wears the face (one COMPLETED row whose per-row retention window is already past — the tuples grew the seventh column, default 7 = the endpoint's own law, expiry is time's own work never a status change, a COMPLETED row keeps its real content), the expired row dims to opacity-70 (the retired read, the desk knowing at a glance), the pair badge speaks beside the stored one (never a replacement), and the completed lens still speaks the STORED truth (expiry is the overlay — the cascade's forty-ninth generation)
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

  it('bumps package.json to at least 2.73.0 (all three slots)', () => {
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
    // v2.481.0 (dated): the entry joins the feed — +1 on every unread
    // anchor (the derived anchors re-set themselves).
    expect(whatsNewUnreadCount('2.110.0')).toBe(376);
    expect(whatsNewUnreadCount('2.109.0')).toBe(377);
    expect(whatsNewUnreadCount('2.108.0')).toBe(378);
    expect(whatsNewUnreadCount('2.77.0')).toBe(409);
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
  it('bumps package.json to at least 2.75.0 (all three slots)', () => {
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
  it('bumps package.json to at least 2.76.0 (all three slots)', () => {
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
  it('bumps package.json to at least 2.77.0 (all three slots)', () => {
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
  it('bumps package.json to at least 2.79.0 (all three slots)', () => {
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
