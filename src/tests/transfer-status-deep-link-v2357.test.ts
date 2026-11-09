// THE TRANSFER DESK'S OWN WORD (v2.357.0): the transfers desk's status
// lens answers the address bar — and the vocabulary's CONSTITUTION rides
// with it.
//
// v2.328.0 gave the purchase-orders roster its STATUS word (`?po-status=`),
// v2.329.0 the inventory desk (`?inv-stock=`), v2.330.0 the customers desk
// (`?cust-debt=`), v2.331.0 the suppliers desk (`?sup-status=`), v2.332.0
// that desk's PO section (`?sup-po=`), v2.333.0 the transactions desk's
// payment-method lens (`?txn-pay=`), v2.354.0 its type lens (`?txn-type=`),
// v2.355.0 the rentals desk (`?rent-status=`), v2.356.0 the invoices desk
// (`?inv-status=`). THE PROMISE KEPT A TENTH TIME — the transfers desk's
// status lens speaks its desk-prefixed `?transfer-status=all|PENDING|
// IN_TRANSIT|RECEIVED|CANCELLED|PARTIAL` and wears the landing chip in
// the lens's own blue (the TENTH family — indigo/amber/rose/emerald/cyan/
// violet/fuchsia/orange/teal now gain the transfer lens's blue, the
// logistics hue) beside the desk's own counting lens voice (emerald, since
// v2.351.0 — a voice must not masquerade as a badge, and now neither
// borrows the other's clothes). The stock's journey between stores is now
// an address. The UPPERCASE voice (the payment word's voice): a lowercase
// word names nothing — never a clever match.
//
// Pins: the parser's truth table (pure, UPPERCASE vocabulary), the desk's
// seed bytes and its cast-free typing, the chip's bytes and its two
// retirement voices, the one-home promise (the law's doc carries the
// tenth word), the collision ledger — and THE CONSTITUTION: the whole
// vocabulary's invariants walked from source bytes, twenty words strong
// (the sixteenth row joined in v2.363.0, the seventeenth in v2.364.0, the
// eighteenth in v2.365.0, the nineteenth in v2.366.0, the twentieth in
// v2.367.0, the twenty-ninth in v2.390.0, the THIRTIETH in v2.391.0 —
// the data-exports desk's history lens, the shade-split's eighth
// application: indigo at 300/100, and the family's first CONTROLLED
// table: the chip row stays visible while the desk owns the state).

import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';

const LOOM = readFileSync('src/components/landing-chip.tsx', 'utf8');
import { join } from 'node:path';
import { parseInitialNamedMember } from '@/lib/tab-url';

const TRANSFER_STATUS_FILTERS = ['all', 'PENDING', 'IN_TRANSIT', 'RECEIVED', 'CANCELLED', 'PARTIAL'] as const;

// ---------------------------------------------------------------------------
// 1. THE PARSER'S TRUTH TABLE (the membership law, one home, UPPERCASE voice)
// ---------------------------------------------------------------------------

describe('parseInitialNamedMember — the transfer lens speaks the one home', () => {
  it('a lens the desk offers seeds the filter', () => {
    expect(parseInitialNamedMember('?transfer-status=PENDING', 'transfer-status', TRANSFER_STATUS_FILTERS, 'all')).toBe('PENDING');
    expect(parseInitialNamedMember('?transfer-status=IN_TRANSIT', 'transfer-status', TRANSFER_STATUS_FILTERS, 'all')).toBe('IN_TRANSIT');
    expect(parseInitialNamedMember('?transfer-status=RECEIVED', 'transfer-status', TRANSFER_STATUS_FILTERS, 'all')).toBe('RECEIVED');
    expect(parseInitialNamedMember('?transfer-status=PARTIAL', 'transfer-status', TRANSFER_STATUS_FILTERS, 'all')).toBe('PARTIAL');
  });

  it('a lens the desk does not offer answers the fallback (never stranded)', () => {
    expect(parseInitialNamedMember('?transfer-status=LOST', 'transfer-status', TRANSFER_STATUS_FILTERS, 'all')).toBe('all');
    expect(parseInitialNamedMember('?transfer-status=', 'transfer-status', TRANSFER_STATUS_FILTERS, 'all')).toBe('all');
  });

  it('case-sensitive: a lowercase word is an unknown word, not a clever match', () => {
    // the lens's own words are UPPERCASE — `in_transit` names nothing
    // (the payment word's voice; the INVERSE of the lowercase type word)
    expect(parseInitialNamedMember('?transfer-status=in_transit', 'transfer-status', TRANSFER_STATUS_FILTERS, 'all')).toBe('all');
    expect(parseInitialNamedMember('?transfer-status=Pending', 'transfer-status', TRANSFER_STATUS_FILTERS, 'all')).toBe('all');
    expect(parseInitialNamedMember('?transfer-status=ALL', 'transfer-status', TRANSFER_STATUS_FILTERS, 'all')).toBe('all');
  });

  it('missing, bare, and malformed searches answer the fallback — never throw', () => {
    expect(parseInitialNamedMember('', 'transfer-status', TRANSFER_STATUS_FILTERS, 'all')).toBe('all');
    expect(parseInitialNamedMember('?tab=transfers', 'transfer-status', TRANSFER_STATUS_FILTERS, 'all')).toBe('all');
    expect(parseInitialNamedMember('transfer-status=RECEIVED', 'transfer-status', TRANSFER_STATUS_FILTERS, 'all')).toBe('RECEIVED');
    expect(parseInitialNamedMember('?????', 'transfer-status', TRANSFER_STATUS_FILTERS, 'all')).toBe('all');
    expect(parseInitialNamedMember('?transfer-status=PARTIAL&page=2', 'transfer-status', TRANSFER_STATUS_FILTERS, 'all')).toBe('PARTIAL');
  });

  it('the word rides alongside the vocabulary\u2019s other words without collision', () => {
    // a landing can carry the desk AND its lens AND the neighbors' words
    // — one bar, one word per lens, every lens its own
    expect(
      parseInitialNamedMember('?tab=transfers&transfer-status=IN_TRANSIT&txn-pay=CASH', 'transfer-status', TRANSFER_STATUS_FILTERS, 'all')
    ).toBe('IN_TRANSIT');
    expect(
      parseInitialNamedMember('?tab=transfers&transfer-status=PENDING&txn-type=refund', 'transfer-status', TRANSFER_STATUS_FILTERS, 'all')
    ).toBe('PENDING');
    expect(
      parseInitialNamedMember('?tab=transfers&transfer-status=RECEIVED&po-status=PENDING_APPROVAL&inv-stock=low&inv-status=PAID', 'transfer-status', TRANSFER_STATUS_FILTERS, 'all')
    ).toBe('RECEIVED');
    expect(
      parseInitialNamedMember('?tab=transfers&transfer-status=CANCELLED&cust-debt=overdue&sup-status=ACTIVE&sup-po=SENT', 'transfer-status', TRANSFER_STATUS_FILTERS, 'all')
    ).toBe('CANCELLED');
    expect(
      parseInitialNamedMember('?tab=transfers&transfer-status=PARTIAL&rent-status=OVERDUE', 'transfer-status', TRANSFER_STATUS_FILTERS, 'all')
    ).toBe('PARTIAL');
  });
});

// ---------------------------------------------------------------------------
// 2. THE DESK'S SEED — read-on-mount, one home, never a copy, never a cast
// ---------------------------------------------------------------------------

describe('the transfers desk — ?transfer-status= lands as visible state', () => {
  const desk = readFileSync('src/app/(shell)/tabs/transfers-tab.tsx', 'utf8');
  const home = readFileSync('src/lib/tab-url.ts', 'utf8');

  it('the seed reads the word through the ONE home (never a local parser)', () => {
    expect(desk.includes("import { parseInitialNamedMember } from '@/lib/tab-url';")).toBe(true);
    expect(
      desk.includes("parseInitialNamedMember(window.location.search, 'transfer-status', TRANSFER_STATUS_FILTERS, 'all')")
    ).toBe(true);
    // the home owns the law and carries the tenth-word note
    expect(home.includes('export function parseInitialNamedMember')).toBe(true);
    expect(home.includes('v2.357.0 — THE PROMISE KEPT, THE TENTH WORD')).toBe(true);
  });

  it('the seed is the lazy initializer of the status filter (read-on-mount law)', () => {
    expect(
      desk.includes('const [statusFilter, setStatusFilter] = useState<(typeof TRANSFER_STATUS_FILTERS)[number]>(initialTransferStatus);')
    ).toBe(true);
    // the SSR guard answers 'all' before any window exists
    expect(desk.includes("if (typeof window === 'undefined') return 'all';")).toBe(true);
    // the desk offers exactly the lenses it names
    expect(
      desk.includes("export const TRANSFER_STATUS_FILTERS = ['all', 'PENDING', 'IN_TRANSIT', 'RECEIVED', 'CANCELLED', 'PARTIAL'] as const;")
    ).toBe(true);
  });

  it('the seed is CAST-FREE — the generic parser IS the union', () => {
    expect(desk.includes('function initialTransferStatus(): (typeof TRANSFER_STATUS_FILTERS)[number]')).toBe(true);
    expect(desk.includes('useState<(typeof TRANSFER_STATUS_FILTERS)[number]>(initialTransferStatus)')).toBe(true);
    // and no laundering snuck in around the new word
    expect(desk.includes('initialTransferStatus() as')).toBe(false);
    expect(desk.includes('initialTransferStatus as unknown')).toBe(false);
  });

  it('the word is desk-prefixed (the Task 44 collision law) and annotated', () => {
    expect(desk.includes("THE TRANSFER DESK'S OWN WORD")).toBe(true);
    expect(desk.includes('?transfer-status=IN_TRANSIT')).toBe(true);
    // the collision note lives with the word
    expect(desk.includes('Collision-checked at round start')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 3. THE LANDING CHIP — the lens answers OUT LOUD, in its own blue
// ---------------------------------------------------------------------------

describe('the landing chip — the face names the word it answered', () => {
  const desk = readFileSync('src/app/(shell)/tabs/transfers-tab.tsx', 'utf8');

  it('the chip renders only while the landing is live AND untouched', () => {
    expect(
      desk.includes("transferLandingLive && landedTransferStatus !== 'all' && statusFilter === landedTransferStatus")
    ).toBe(true);
    expect(desk.includes('data-testid="transfer-status-landing-word"')).toBe(true);
  });

  it('the chip names the exact word it answered', () => {
    expect(desk.includes('landed ?transfer-status=${landedTransferStatus}')).toBe(true);
  });

  it('voice 1 — the dismissal clears the lens the word seeded and retires', () => {
    const at = desk.indexOf('data-testid="transfer-status-landing-word"');
    const block = desk.slice(at, at + 1200);
    expect(block).toContain("setStatusFilter('all')");
    expect(block).toContain('setTransferLandingLive(false)');
  });

  it('voice 2 — a hand-driven Select change retires the chip', () => {
    expect(desk.includes('<Select value={statusFilter} onValueChange={chooseTransferStatus}>')).toBe(true);
    expect(desk.includes('a hand-driven change retires the landing word')).toBe(true);
  });

  it('the voices are honest — the desk claims exactly the two it has', () => {
    expect(desk.includes("hand-driven Select change or the chip's own dismissal")).toBe(true);
    expect(desk.includes('THE TWO VOICES:')).toBe(true);
  });

  it('the chip wears the lens\u2019s blue family in BOTH modes', () => {
    // v2.397.0 THE LOOM: the elder wardrobe moved into the loom's 200
    // registry — the desk proves its family by hue, the registry carries
    // the bytes.
    expect(desk.includes('hue="blue"')).toBe(true);
    expect(LOOM.includes('border-blue-200 bg-blue-50 text-blue-700')).toBe(true);
    expect(LOOM.includes('dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300')).toBe(true);
  });

  it('the dismiss hint sharpens on hover (the group-hover detail)', () => {
    expect(LOOM.includes('opacity-60 transition-opacity group-hover:opacity-100')).toBe(true);
  });

  it('the chip explains itself (the tooltip law)', () => {
    expect(desk.includes('title="The desk landed with this filter from the address bar — press to clear it"')).toBe(true);
    expect(LOOM.includes('aria-hidden="true"')).toBe(true); // v2.397.0 THE LOOM: the icons live in the one hand
  });

  it('the counting lens voice keeps its emerald beside the chip (no masquerade)', () => {
    // the v2.351.0 lens voice counts the active lens in its own emerald —
    // a voice, not a badge; it borrows nothing from the chip's blue
    expect(desk.includes('data-testid="transfer-lens-voice"')).toBe(true);
    expect(desk.includes('border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700')).toBe(true);
    expect(LOOM.includes('border-blue-200 bg-blue-50 text-blue-700 text-xs font-medium')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 4. THE CONSTITUTION — the whole vocabulary's invariants, walked from bytes
// ---------------------------------------------------------------------------

describe('the address-bar vocabulary — THE CONSTITUTION (forty-four words, twenty-nine desks)', () => {
  const WORDS = [
    { word: 'po-status', desk: 'src/app/(shell)/tabs/purchase-orders-tab.tsx', family: 'border-indigo-200', suite: 'src/tests/proxy-gate-layering-v2328.test.ts' },
    { word: 'inv-stock', desk: 'src/app/(shell)/tabs/inventory-tab.tsx', family: 'border-amber-200', suite: 'src/tests/inv-stock-deep-link-v2329.test.ts' },
    { word: 'cust-debt', desk: 'src/app/(shell)/tabs/customers-tab.tsx', family: 'border-rose-200', suite: 'src/tests/cust-debt-deep-link-v2330.test.ts' },
    { word: 'sup-status', desk: 'src/app/(shell)/tabs/suppliers-tab.tsx', family: 'border-emerald-200', suite: 'src/tests/sup-status-deep-link-v2331.test.ts' },
    { word: 'sup-po', desk: 'src/app/(shell)/tabs/suppliers-tab.tsx', family: 'border-cyan-200', suite: 'src/tests/sup-po-deep-link-v2332.test.ts' },
    { word: 'txn-pay', desk: 'src/app/(shell)/tabs/transactions-tab.tsx', family: 'border-violet-200', suite: 'src/tests/txn-pay-deep-link-v2333.test.ts' },
    { word: 'txn-type', desk: 'src/app/(shell)/tabs/transactions-tab.tsx', family: 'border-fuchsia-200', suite: 'src/tests/txn-type-deep-link-v2354.test.ts' },
    { word: 'rent-status', desk: 'src/app/(shell)/tabs/rentals-tab.tsx', family: 'border-orange-200', suite: 'src/tests/rent-status-deep-link-v2355.test.ts' },
    { word: 'inv-status', desk: 'src/app/(shell)/tabs/invoices-tab.tsx', family: 'border-teal-200', suite: 'src/tests/inv-status-deep-link-v2356.test.ts' },
    { word: 'transfer-status', desk: 'src/app/(shell)/tabs/transfers-tab.tsx', family: 'border-blue-200', suite: 'src/tests/transfer-status-deep-link-v2357.test.ts' },
    { word: 'gc-status', desk: 'src/app/(shell)/tabs/gift-cards-tab.tsx', family: 'border-lime-200', suite: 'src/tests/gc-status-deep-link-v2358.test.ts' },
    { word: 'dn-status', desk: 'src/app/(shell)/tabs/delivery-notes-tab.tsx', family: 'border-sky-200', suite: 'src/tests/dn-status-deep-link-v2359.test.ts' },
    { word: 'vc-status', desk: 'src/app/(shell)/tabs/vouchers-tab.tsx', family: 'border-pink-200', suite: 'src/tests/vc-status-deep-link-v2360.test.ts' },
    { word: 'cr-type', desk: 'src/app/(shell)/tabs/credits-tab.tsx', family: 'border-yellow-200', suite: 'src/tests/cr-type-deep-link-v2361.test.ts' },
    { word: 'pr-status', desk: 'src/app/(shell)/tabs/payroll-tab.tsx', family: 'border-stone-200', suite: 'src/tests/pr-status-deep-link-v2362.test.ts' },
    { word: 'cv-type', desk: 'src/app/(shell)/tabs/conversations-tab.tsx', family: 'border-slate-200', suite: 'src/tests/cv-type-deep-link-v2363.test.ts' },
    { word: 'cat-stock', desk: 'src/app/(shell)/tabs/catalog-tab.tsx', family: 'border-purple-200', suite: 'src/tests/cat-stock-deep-link-v2364.test.ts' },
    { word: 'dp-status', desk: 'src/app/(shell)/tabs/debt-plans-tab.tsx', family: 'border-zinc-200', suite: 'src/tests/dp-status-deep-link-v2365.test.ts' },
    { word: 'ad-severity', desk: 'src/app/(shell)/tabs/admin-tab.tsx', family: 'border-neutral-200', suite: 'src/tests/ad-severity-deep-link-v2366.test.ts' },
    { word: 'sec-type', desk: 'src/app/(shell)/tabs/security-tab.tsx', family: 'border-gray-200', suite: 'src/tests/sec-type-deep-link-v2367.test.ts' },
    // the migration round: the ledger's pre-constitution bare `type` moved
    // to its desk-prefixed canonical word (the legacy-word sunset law —
    // the bare word keeps answering as the alias)
    { word: 'ly-type', desk: 'src/app/(shell)/tabs/loyalty-tab.tsx', family: 'border-green-200', suite: 'src/tests/ly-type-deep-link-v2368.test.ts' },
    // the danger-voice round: the e-TIMS invoices ledger's submission-status
    // lens — the palette's reserved hue finally speaks (the taxman's red
    // letter; the desk's alarms speak rose and amber, so red borrows nothing)
    { word: 'et-status', desk: 'src/app/(shell)/tabs/etims-tab.tsx', family: 'border-red-200', suite: 'src/tests/et-status-deep-link-v2381.test.ts' },
    // the shade-split round: the ghost tax desk comes alive and its
    // filings-type lens speaks — the palette-exhaustion amendment's FOURTH
    // form (the SHADE-SPLIT): every hue spoke at 200/50, so the family's
    // grammar grows a second storey and the taxman's money-word answers at
    // orange-300/100, a family byte the 200-storey can never equal
    { word: 'tax-type', desk: 'src/app/(shell)/tabs/tax-tab.tsx', family: 'border-orange-300', suite: 'src/tests/tax-type-deep-link-v2382.test.ts' },
    // the by-the-month round: the SAME desk's filings ledger answers its
    // second daily question — a SHAPE word (the wire's own YYYY-MM class,
    // month 01-12 real; the neutral is ABSENCE, not a word), and the chip
    // wears the shade-split's SECOND application: teal one storey deeper
    // at 300/100, a pair byte the 200-storey can never equal
    { word: 'tax-period', desk: 'src/app/(shell)/tabs/tax-tab.tsx', family: 'border-teal-300', suite: 'src/tests/tax-period-deep-link-v2383.test.ts' },
    // the always-rendered-lens round: the reports desk answers the address
    // bar — a SHAPE word on the Report Type grid (the desk's OWN spellings,
    // the reportType union, lowercase), NO STAGE TO IMPLY (the desk has no
    // sub-tabs — the report type IS the stage), and the chip wears the
    // shade-split's THIRD application: lime one storey deeper at 300/100
    // (the hue the gift-cards desk spoke at the 200 storey — a family byte
    // the 200-storey can never equal)
    { word: 'rep-type', desk: 'src/app/(shell)/tabs/reports-tab.tsx', family: 'border-lime-300', suite: 'src/tests/rep-type-deep-link-v2384.test.ts' },
    // the sub-tab-amendment round: the bank ledger's transaction-type
    // lens answers the address bar — a VOCABULARY word on a lens the
    // sub-tab law had parked: the landing RAISES THE SUB-TAB IT LANDS
    // INTO (the pane's seed reads the same landed word), and the chip
    // wears the shade-split's FOURTH application: sky one storey deeper
    // at 300/100 (the hue the delivery-notes desk spoke at the 200
    // storey — a family byte the 200-storey can never equal, borrowing
    // nothing from the desk's badges)
    { word: 'bank-type', desk: 'src/app/(shell)/tabs/banking-tab.tsx', family: 'border-sky-300', suite: 'src/tests/bank-type-deep-link-v2387.test.ts' },
    // the second-word round: the SAME desk's M-Pesa ledger answers its
    // second daily question — the sub-tab amendment's SECOND application
    // (the landing raises the mpesa pane it lands into), the two-word
    // negotiation pinned (the M-PESA word wins the pane seed), and the
    // chip wears the shade-split's FIFTH application: purple one storey
    // deeper at 300/100 (the hue the catalog desk spoke at the 200
    // storey — a family byte the 200-storey can never equal, borrowing
    // nothing from the desk's badges)
    { word: 'bank-mpesa', desk: 'src/app/(shell)/tabs/banking-tab.tsx', family: 'border-purple-300', suite: 'src/tests/bank-mpesa-deep-link-v2388.test.ts' },
    // the third-application round: the debt management desk's reminder
    // history answers its daily question — the sub-tab amendment's THIRD
    // application (the landing raises the History pane it lands into),
    // and the chip wears the shade-split's SIXTH application: cyan at
    // 300/100 (a hue NO badge on this desk speaks — the census answers
    // amber, blue, emerald, green, orange, purple, rose and slate)
    { word: 'debt-status', desk: 'src/app/(shell)/tabs/debt-management-tab.tsx', family: 'border-cyan-300', suite: 'src/tests/debt-status-deep-link-v2389.test.ts' },
    // the second-word round: the SAME desk's channel lens answers its
    // second daily question — the TWO-WORD NEGOTIATION'S SAME-PANE FORM
    // (both lenses live in the History pane; either word raises it; the
    // two chips sit side by side, each retiring by its own two voices),
    // and the chip wears the shade-split's SEVENTH application: fuchsia
    // at 300/100 (a hue NO badge on this desk speaks AND one its cyan
    // sibling never borrowed)
    { word: 'debt-channel', desk: 'src/app/(shell)/tabs/debt-management-tab.tsx', family: 'border-fuchsia-300', suite: 'src/tests/debt-channel-deep-link-v2390.test.ts' },
    // the export desk joins: the history lens answers the address bar —
    // the chip wears the shade-split's EIGHTH application: indigo at
    // 300/100 (a hue NO badge on this desk speaks — the census answers
    // amber, emerald, rose, green, red, teal, violet, purple, orange,
    // cyan, blue and slate — and one the family's first indigo, the
    // 200-storey word, never shared a bar with); the table runs in its
    // CONTROLLED form (the v2.391.0 hand: the state lifts to the desk,
    // the chip row stays visible, the hand-driven press retires)
    { word: 'exp-status', desk: 'src/app/(shell)/tabs/data-exports-tab.tsx', family: 'border-indigo-300', suite: 'src/tests/exp-status-deep-link-v2391.test.ts' },
    // the second-word round on the export desk: the SAME desk's history
    // lens answers BY THE TYPE — the desk joins the TWO-WORD NEGOTIATION
    // club (the debt desk's same-pane precedent: either word lands, the
    // two chips sit side by side, each retiring by its own two voices,
    // and the two lenses CONJOIN in the table), and the chip wears the
    // shade-split's NINTH application: pink at 300/100 (the hue the
    // vouchers desk spoke at the 200 storey — a family byte the
    // 200-storey can never equal, borrowing nothing from the desk's
    // badges nor from its indigo sibling)
    { word: 'exp-type', desk: 'src/app/(shell)/tabs/data-exports-tab.tsx', family: 'border-pink-300', suite: 'src/tests/exp-type-deep-link-v2392.test.ts' },
    // the card-grid round: the messaging desk's Templates pane answers
    // the address bar — the family's FIRST CARD-GRID lens (the pane's
    // nine template cards narrow to the landed card; no table, no chip
    // row — the grid itself is the lens face), the sub-tab amendment's
    // FOURTH application (the landing raises the Templates pane it
    // lands into), and the chip wears the shade-split's TENTH
    // application: yellow at 300/100 (the LAST free 300-storey family —
    // the hue the credits desk spoke at the 200 storey, a family byte
    // the 200-storey can never equal; a hue NO badge on this desk
    // speaks — the census answers green, amber, red, emerald and blue),
    // and the pane's Use-Template hand is the lens's second retirement
    // voice (the family's first card-grid voice)
    { word: 'msg-template', desk: 'src/app/(shell)/tabs/messaging-tab.tsx', family: 'border-yellow-300', suite: 'src/tests/msg-template-deep-link-v2393.test.ts' },
    // the lens-inside-a-shape round: the reports desk's ninth report
    // answers with its LENS — the dead-stock idle window (the window
    // tuple's OWN words, read through the generic parser from the ONE
    // home the classifier keeps). The two-storey census was FULL, so the
    // family GREW one line: rose joins the 300 registry — the shade-split
    // law's next form (rose last spoke at the 200/50 storey, the
    // customers desk's word; a hue may speak twice only through a
    // DIFFERENT storey). The chip lives in the SECTION (the lens is
    // inside the dead_stock stage — the sub-tab law's shape), the
    // default wears no chip, and the lens WRITES BACK: a hand-driven
    // turn replaceState's the word into the address (the preserve law).
    { word: 'dead-window', desk: 'src/app/(shell)/tabs/reports-tab.tsx', family: 'border-rose-300', suite: 'src/tests/dead-window-deep-link-v2462.test.ts' },
    // the lens's own word (v2.480.0): the ledger's name lens answers the
    // address bar — the maker's OWN word, free text read as typed (the
    // ONE home's filter lowercases its own side). The family GREW one
    // line: amber joins the 300 registry — the lens family's own tone
    // (the window chips' tint word, the view voice's ground), a hue that
    // never spoke at this storey (the shade-split law's next form; the
    // exact amber 300-trio census was kept). The chip lives in the
    // SECTION beside the window's own (one lens row), the empty word
    // wears no chip, the landing is read once on the shell, and the lens
    // WRITES BACK: every hand-driven change replaceState's its word (an
    // emptied lens strips its key — the address never carries a
    // silence).
    { word: 'dead-q', desk: 'src/app/(shell)/tabs/reports-tab.tsx', family: 'border-amber-300', suite: 'src/tests/dead-stock-lens-address-v2480.test.ts' },
    // the order's own word (v2.481.0): the ledger's sort door answers
    // the address bar — the desk's other daily question, "which honesty
    // am I reading, the loudest debt or the shelf's patience?" — through
    // the ONE home's OWN orders (DEAD_STOCK_SORTS, read as words; a
    // made-up order is an unknown word, not a clever match). The family
    // GREW one line: emerald joins the 300 registry — the ledger's own
    // green (the suppliers' hue at the 200/50 storey), a storey it never
    // spoke (the shade-split law's next form; the exact emerald 300-trio
    // census was machine-kept). The chip lives in the SECTION beside the
    // window's and the lens's own (one lens row), THE DEFAULT WEARS NO
    // WORD (the address carries only a non-default lens — the key strips
    // when the desk rests), the landing is read once on the shell, and
    // the order WRITES BACK: every hand-driven turn replaceState's its
    // word (a pressed order is a shareable address, never a dead end).
    { word: 'dead-sort', desk: 'src/app/(shell)/tabs/reports-tab.tsx', family: 'border-emerald-300', suite: 'src/tests/dead-stock-sort-address-v2481.test.ts' },
    // the range's own word (v2.482.0): the reports desk's time lens
    // answers the address bar — the desk's daily question, "which days
    // am I reading?" — through the SIX NAMED presets' OWN spellings (the
    // tuple the desk keeps; a made-up range is an unknown word). THE
    // CUSTOM'S HONEST ABSENCE: custom is not a word the address can
    // carry — a custom landing without its dates would speak an unknown
    // range — the custom face stays the desk's own scratch. The family
    // GREW one line: violet joins the 300 registry — the transactions
    // payment lens's hue, a storey it never spoke (the shade-split law's
    // next form; the exact violet 300-trio census was machine-kept). The
    // chip lives in the DESK's own preset row (never inside a section),
    // THE DEFAULT WEARS NO WORD (the key strips when the desk rests),
    // the landing is read once on the shell, and the range WRITES BACK:
    // every hand-driven turn replaceState's its word (a turned range is
    // a shareable address, never a dead end).
    { word: 'rep-range', desk: 'src/app/(shell)/tabs/reports-tab.tsx', family: 'border-violet-300', suite: 'src/tests/rep-range-address-v2482.test.ts' },
    // the custom's own dates (v2.483.0): the pair — the thirty-seventh
    // and thirty-eighth words — rides BESIDE the custom's word
    // (?rep-from= / ?rep-to= beside ?rep-range=custom), the
    // desk-prefixed day pair the collision check proved virgin (the
    // bare from/to already speak the loyalty ledger's legacy window —
    // the family's oldest law caught the opening map's bare shape).
    // THE CUSTOM'S HONEST SHARE: custom lands ONLY with both its days
    // riding (a bare custom stays the honest absence), each day
    // honestDayKey proves real (a made-up date is an unknown word),
    // and the pair wears the range's own violet chip — the
    // constitution's FIRST shared family (two words, one chip).
    { word: 'rep-from', desk: 'src/app/(shell)/tabs/reports-tab.tsx', family: 'border-violet-300', suite: 'src/tests/custom-range-address-v2483.test.ts' },
    { word: 'rep-to', desk: 'src/app/(shell)/tabs/reports-tab.tsx', family: 'border-violet-300', suite: 'src/tests/custom-range-address-v2483.test.ts' },
    // the people's own window (v2.484.0): the pair — the thirty-ninth
    // and fortieth words — rides the HR desk's period (?hr-from= /
    // ?hr-to=), the family's FIRST non-tab desk (src/app/(shell)/hr/
    // reports/page.tsx — the desk's own scratch since v2.20.0 now
    // speaks its address). THE WINDOW'S OWN LAW: each side validates
    // INDEPENDENTLY (a real from with a garbage to keeps the from,
    // drops only the to — the v2.317 never-strand reading; the rep
    // pair's WHOLE law is the pair's own, the window's is this). The
    // family GREW one line: blue joins the 300 registry — the
    // transfers desk's hue at the 200/50 storey (the transfer-status
    // chip's own family) one storey deeper (the shade-split law's next
    // form; blue LEFT the stranger list). THE SECOND SHARED FAMILY:
    // two words, one chip (the window's blue serves both rows).
    { word: 'hr-from', desk: 'src/app/(shell)/hr/reports/page.tsx', family: 'border-blue-300', suite: 'src/tests/hr-period-address-v2484.test.ts' },
    { word: 'hr-to', desk: 'src/app/(shell)/hr/reports/page.tsx', family: 'border-blue-300', suite: 'src/tests/hr-period-address-v2484.test.ts' },
    // the ledger's own period (v2.485.0): the window — the
    // forty-first through forty-third words — rides the financial
    // desk's period (?fin-range=<preset> and the custom's pair
    // fin-from / fin-to), the SECOND shell-tab desk
    // (src/app/(shell)/tabs/financial-tab.tsx — the desk's first
    // daily question now speaks its address). THE LEDGER'S OWN LAW:
    // the presets speak their OWN spellings (today, week, month,
    // quarter, year — the desk's tuple, read through the named-member
    // parser; a made-up range is an unknown word), the custom speaks
    // WHOLE or not at all (the pair's own law — a bare custom stays
    // the honest absence). The family GREW one line: green joins the
    // 300 registry — the loyalty desk's hue at the 200/50 storey (the
    // ly-type chip's own family) one storey deeper (the shade-split
    // law's next form; green LEFT the stranger list). THE THIRD
    // SHARED FAMILY: three words, one chip (the period's green serves
    // all three rows).
    { word: 'fin-range', desk: 'src/app/(shell)/tabs/financial-tab.tsx', family: 'border-green-300', suite: 'src/tests/fin-period-address-v2485.test.ts' },
    { word: 'fin-from', desk: 'src/app/(shell)/tabs/financial-tab.tsx', family: 'border-green-300', suite: 'src/tests/fin-period-address-v2485.test.ts' },
    { word: 'fin-to', desk: 'src/app/(shell)/tabs/financial-tab.tsx', family: 'border-green-300', suite: 'src/tests/fin-period-address-v2485.test.ts' },
    // the queue's own word (v2.486.0): the DLQ lens — the
    // forty-fourth word — rides the system-health desk's dead-letter
    // filter (?sh-dlq=<member>), the THIRD shell-tab desk
    // (src/app/(shell)/tabs/system-health-tab.tsx — the desk's first
    // daily question now speaks its address). THE QUEUE'S OWN LAW:
    // the members speak their OWN spellings (all, PENDING, RETRYING,
    // DEAD, COMPLETED, CANCELLED — the ONE home's tuple, read through
    // the named-member parser; a made-up member or a wrong case is an
    // unknown word). THE SUB-TAB LAW'S THIRD APPLICATION: a landing
    // that carries the word raises the desk's own dlq sub-tab — the
    // pane's seed reads the same landed word. The family GREW one
    // line: red joins the 300 registry — the etims ledger's hue at
    // the 200/50 storey (the et-status row's own family) one storey
    // deeper (the shade-split law's next form; red LEFT the stranger
    // list).
    { word: 'sh-dlq', desk: 'src/app/(shell)/tabs/system-health-tab.tsx', family: 'border-red-300', suite: 'src/tests/sh-dlq-address-v2486.test.ts' },
  ] as const;

  it('every word is desk-prefixed and owns its FILTERS const in exactly its desk', () => {
    for (const { word, desk: deskPath } of WORDS) {
      const desk = readFileSync(deskPath, 'utf8');
      expect(desk.includes(`'${word}'`), `${word} seeded in its desk`).toBe(true);
    }
  });

  it('every word wears a DISTINCT family — thirty-eight families, the shared families excepted', () => {
    const families = WORDS.map((w) => w.family);
    // v2.483.0 (dated): the FIRST SHARED FAMILY — the pair rides the
    // range's violet (two words, one chip), so the distinct count is
    // two short of the words' own (the pair's two words, one family).
    // v2.484.0 (dated): the SECOND SHARED FAMILY — the window rides the
    // people's blue (two words, one chip, again): one more shared word.
    // v2.485.0 (dated): the THIRD SHARED FAMILY — the pair rides the
    // period's green (three words, one chip, again): two more shared
    // words.
    const SHARED_WORDS = 5;
    expect(new Set(families).size + SHARED_WORDS).toBe(WORDS.length);
    const loom = readFileSync('src/components/landing-chip.tsx', 'utf8');
    for (const { word, desk: deskPath, family } of WORDS) {
      const desk = readFileSync(deskPath, 'utf8');
      // the direct face: the desk itself wears the family (the elder chips)
      if (desk.includes(family)) continue;
      // THE LOOM FACE (v2.394.0): the ten full-wardrobe chips render through
      // the shared LandingChip loom — the desk proves its family by hue, and
      // the loom's registry carries the family byte-for-byte.
      const hue = family.replace(/^border-/, '').replace(/-(?:200|300)$/, '');
      expect(desk.includes(`hue="${hue}"`), `${word} proves ${family} by hue`).toBe(true);
      expect(loom.includes(family), `${family} in the loom's registry`).toBe(true);
    }
  });

  it('every word has its ledger suite on disk, and the home carries all twelve promises', () => {
    const home = readFileSync('src/lib/tab-url.ts', 'utf8');
    for (const { suite } of WORDS) {
      expect(readFileSync(suite, 'utf8').length > 0, `${suite} exists`).toBe(true);
    }
    for (const n of ['SEVENTH', 'EIGHTH', 'NINTH', 'TENTH', 'ELEVENTH', 'TWELFTH', 'THIRTEENTH', 'FOURTEENTH', 'FIFTEENTH', 'SIXTEENTH', 'SEVENTEENTH', 'EIGHTEENTH', 'NINETEENTH', 'TWENTIETH', 'TWENTY-FIRST', 'TWENTY-SECOND', 'TWENTY-THIRD', 'TWENTY-FOURTH', 'TWENTY-FIFTH', 'TWENTY-SIXTH', 'TWENTY-SEVENTH', 'TWENTY-EIGHTH', 'TWENTY-NINTH', 'THIRTIETH', 'THIRTY-FIRST', 'THIRTY-SECOND']) {
      expect(home.includes(`THE PROMISE KEPT, THE ${n} WORD`)).toBe(true);
    }
  });

  it('the desk-prefix law holds tree-wide: no desk reads a FOREIGN word', () => {
    // each desk's OWN words (a desk may own two — transactions, suppliers)
    // may appear there; no OTHER desk's word may (a desk that reads a
    // foreign word would leak across client-side tab switches — the
    // Task 44 law)
    const deskWords = new Map<string, Set<string>>();
    for (const { word, desk: deskPath } of WORDS) {
      const own = deskWords.get(deskPath) ?? new Set<string>();
      own.add(word);
      deskWords.set(deskPath, own);
    }
    for (const { desk: deskPath } of WORDS) {
      const own = deskWords.get(deskPath) ?? new Set<string>();
      const desk = readFileSync(deskPath, 'utf8');
      for (const { word: other } of WORDS) {
        if (own.has(other)) continue;
        // the collision-note SHADOW: a desk's own note may DESCRIBE the
        // law in English but must never carry a foreign word's quoted
        // literal (the form a reader would use)
        expect(desk.includes(`'${other}'`), `${deskPath} must not carry '${other}'`).toBe(false);
      }
    }
  });
});

// ---------------------------------------------------------------------------
// 5. THE COLLISION LEDGER — which files may speak the word at all
// ---------------------------------------------------------------------------

function walkSrc(dir: string, collected: string[]): void {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    const st = statSync(p);
    if (st.isDirectory()) {
      if (entry === 'node_modules' || entry === '.next') continue;
      walkSrc(p, collected);
    } else if (/\.(ts|tsx|mjs|js)$/.test(entry)) {
      if (readFileSync(p, 'utf8').includes('transfer-status')) collected.push(p);
    }
  }
}

describe('the address-bar vocabulary stays one-writer-per-word', () => {
  it('`transfer-status` speaks in exactly the expected files under src/', () => {
    const collected: string[] = [];
    walkSrc('src', collected);
    collected.sort();
    expect(collected).toEqual([
      'src/app/(shell)/tabs/transfers-tab.tsx',
      'src/lib/tab-url.ts',
      'src/lib/whats-new.ts',
      // the thirteen neighbor ledgers admitted this test file — and an
      // admission line carries the word it admits (the LEDGER-CITATION
      // RIPPLE: a ledger is an honest speaker of every word it lists)
      'src/tests/ad-severity-deep-link-v2366.test.ts',
      // the twenty-sixth word's own ledger — admitted (its constitution
      // section names this file; an admission line carries the word it admits)
      // the twenty-seventh word's own ledger — admitted (this file
      // speaks the words this ledger walks; its NAME carries them too)
      'src/tests/bank-mpesa-deep-link-v2388.test.ts',
      // the twenty-eighth word's own ledger — admitted (its collision
      // ledger and its constitution section name this file)
      'src/tests/bank-type-deep-link-v2387.test.ts',
      'src/tests/cat-stock-deep-link-v2364.test.ts',
      'src/tests/cr-type-deep-link-v2361.test.ts',
      'src/tests/cust-debt-deep-link-v2330.test.ts',
      // the pair's own ledger — admitted (its registry section reads
      // this file's rows; an admission line carries the words it admits;
      // sorted place: cr- < custom- < cv-)
      'src/tests/custom-range-address-v2483.test.ts',
      'src/tests/cv-type-deep-link-v2363.test.ts',
      // the thirty-fourth word's own ledger — admitted (its registry
      // section reads this file's rows; an admission line carries the
      // word it admits)
      'src/tests/dead-stock-lens-address-v2480.test.ts',
      // the thirty-fifth word's own ledger — admitted (its registry
      // section reads this file's rows; an admission line carries the
      // word it admits)
      'src/tests/dead-stock-sort-address-v2481.test.ts',
      // the thirty-third word's own ledger — admitted (the constitution's
      // thirty-third row names this file as its suite; an admission line
      // carries the word it admits)
      'src/tests/dead-window-deep-link-v2462.test.ts',
      // the twenty-ninth word's own ledger — admitted (its rides-beside truth speaks this word)
      'src/tests/debt-channel-deep-link-v2390.test.ts',
      // the twenty-eighth word's own ledger — admitted (its collision
      // ledger and its constitution section name this file)
      'src/tests/debt-status-deep-link-v2389.test.ts',
      'src/tests/dn-status-deep-link-v2359.test.ts',
      'src/tests/dp-status-deep-link-v2365.test.ts',
      'src/tests/et-status-deep-link-v2381.test.ts',
      // the thirtieth word's own ledger — admitted (its collision ledger
      // and its constitution section name this file; an admission line
      // carries the word it admits)
      'src/tests/exp-status-deep-link-v2391.test.ts',
      // the thirty-first word's own ledger — admitted (its own ledger
      // LISTS this file's path — the third-order ripple: a ledger line
      // carries every word its paths speak)
      'src/tests/exp-type-deep-link-v2392.test.ts',
      'src/tests/family-registry-stress-v2370.test.ts',
      // the period's own ledger — admitted (its registry section reads
      // this file's rows; an admission line carries the words it admits;
      // sorted place: family- < fin- < gc-)
      'src/tests/fin-period-address-v2485.test.ts',
      'src/tests/gc-status-deep-link-v2358.test.ts',
      // the window's own ledger — admitted (its registry section reads
      // this file's rows; an admission line carries the words it admits;
      // sorted place: gc- < hr- < inv-)
      'src/tests/hr-period-address-v2484.test.ts',
      'src/tests/inv-status-deep-link-v2356.test.ts',
      'src/tests/inv-stock-deep-link-v2329.test.ts',
      // the po-status word's ledger lives beside the proxy-gate suite
      // (one release, two suites — the ledger is the honest speaker here)
      // the loom’s own suite — admitted (v2.394.0: the LandingChip
      // loom suite pins this desk’s chip bytes, so the walk lists it)
      'src/tests/landing-chip-loom-v2394.test.ts',
      'src/tests/ly-island-v2369.test.ts',
      'src/tests/ly-type-deep-link-v2368.test.ts',
      // the thirty-second word's own ledger — admitted (its own ledger
      // LISTS this file's path — the third-order ripple: a ledger line
      // carries every word its paths speak)
      'src/tests/msg-template-deep-link-v2393.test.ts',
      'src/tests/pr-status-deep-link-v2362.test.ts',
      'src/tests/proxy-gate-layering-v2328.test.ts',
      'src/tests/rent-status-deep-link-v2355.test.ts',
      // the thirty-sixth word's own ledger — admitted (its registry
      // section reads this file's rows; an admission line carries the
      // word it admits)
      'src/tests/rep-range-address-v2482.test.ts',
      'src/tests/sec-type-deep-link-v2367.test.ts',
      // the queue's own ledger — admitted (its registry section reads
      // this file's rows; an admission line carries the word it admits;
      // sorted place: sec- < sh- < sup-)
      'src/tests/sh-dlq-address-v2486.test.ts',
      'src/tests/sup-po-deep-link-v2332.test.ts',
      'src/tests/sup-status-deep-link-v2331.test.ts',
      // and this file joins its own ledger (an admission line carries the
      // word it admits — the ripple's second-order form, pinned above)
      'src/tests/tax-period-deep-link-v2383.test.ts',
      'src/tests/tax-type-deep-link-v2382.test.ts',
      'src/tests/transfer-status-deep-link-v2357.test.ts',
      'src/tests/txn-pay-deep-link-v2333.test.ts',
      'src/tests/txn-type-deep-link-v2354.test.ts',
      'src/tests/vc-status-deep-link-v2360.test.ts',
      // v2.351.0's wrapper suite pinned this desk's filter testid, whose
      // substring carries this word — the honest speaker joins (the same
      // ripple the door-shape registry rode in v2.354.0)
      'src/tests/wrapper-seam-v2351.test.ts',
    ]);
  });

  it('the home\u2019s older words stay untouched (the shape law, the gait law)', () => {
    const home = readFileSync('src/lib/tab-url.ts', 'utf8');
    expect(home.includes('export function parseInitialNamedPage')).toBe(true);
    expect(home.includes('export function parseInitialNamedMember')).toBe(true);
  });
});
