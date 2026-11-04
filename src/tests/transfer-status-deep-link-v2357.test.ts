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
// v2.367.0).

import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
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
    expect(desk.includes('landed ?transfer-status={landedTransferStatus}')).toBe(true);
  });

  it('voice 1 — the dismissal clears the lens the word seeded and retires', () => {
    const at = desk.indexOf('data-testid="transfer-status-landing-word"');
    const block = desk.slice(at, at + 400);
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
    expect(desk.includes('border-blue-200 bg-blue-50 text-blue-700')).toBe(true);
    expect(desk.includes('dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300')).toBe(true);
  });

  it('the dismiss hint sharpens on hover (the group-hover detail)', () => {
    expect(desk.includes('opacity-60 transition-opacity group-hover:opacity-100')).toBe(true);
  });

  it('the chip explains itself (the tooltip law)', () => {
    expect(desk.includes('title="The desk landed with this filter from the address bar — press to clear it"')).toBe(true);
    expect(desk.includes('aria-hidden="true"')).toBe(true);
  });

  it('the counting lens voice keeps its emerald beside the chip (no masquerade)', () => {
    // the v2.351.0 lens voice counts the active lens in its own emerald —
    // a voice, not a badge; it borrows nothing from the chip's blue
    expect(desk.includes('data-testid="transfer-lens-voice"')).toBe(true);
    expect(desk.includes('border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700')).toBe(true);
    expect(desk.includes('border-blue-200 bg-blue-50 text-blue-700 text-xs font-medium')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 4. THE CONSTITUTION — the whole vocabulary's invariants, walked from bytes
// ---------------------------------------------------------------------------

describe('the address-bar vocabulary — THE CONSTITUTION (twenty-nine words, twenty-four desks)', () => {
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
  ] as const;

  it('every word is desk-prefixed and owns its FILTERS const in exactly its desk', () => {
    for (const { word, desk: deskPath } of WORDS) {
      const desk = readFileSync(deskPath, 'utf8');
      expect(desk.includes(`'${word}'`), `${word} seeded in its desk`).toBe(true);
    }
  });

  it('every word wears a DISTINCT family — twenty-nine families, no two alike', () => {
    const families = WORDS.map((w) => w.family);
    expect(new Set(families).size).toBe(WORDS.length);
    for (const { word, desk: deskPath, family } of WORDS) {
      const desk = readFileSync(deskPath, 'utf8');
      expect(desk.includes(family), `${word} wears ${family}`).toBe(true);
    }
  });

  it('every word has its ledger suite on disk, and the home carries all twelve promises', () => {
    const home = readFileSync('src/lib/tab-url.ts', 'utf8');
    for (const { suite } of WORDS) {
      expect(readFileSync(suite, 'utf8').length > 0, `${suite} exists`).toBe(true);
    }
    for (const n of ['SEVENTH', 'EIGHTH', 'NINTH', 'TENTH', 'ELEVENTH', 'TWELFTH', 'THIRTEENTH', 'FOURTEENTH', 'FIFTEENTH', 'SIXTEENTH', 'SEVENTEENTH', 'EIGHTEENTH', 'NINETEENTH', 'TWENTIETH', 'TWENTY-FIRST', 'TWENTY-SECOND', 'TWENTY-THIRD', 'TWENTY-FOURTH', 'TWENTY-FIFTH', 'TWENTY-SIXTH', 'TWENTY-SEVENTH', 'TWENTY-EIGHTH', 'TWENTY-NINTH']) {
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
      'src/tests/cv-type-deep-link-v2363.test.ts',
      // the twenty-ninth word's own ledger — admitted (its rides-beside truth speaks this word)
      'src/tests/debt-channel-deep-link-v2390.test.ts',
      // the twenty-eighth word's own ledger — admitted (its collision
      // ledger and its constitution section name this file)
      'src/tests/debt-status-deep-link-v2389.test.ts',
      'src/tests/dn-status-deep-link-v2359.test.ts',
      'src/tests/dp-status-deep-link-v2365.test.ts',
      'src/tests/et-status-deep-link-v2381.test.ts',
      'src/tests/family-registry-stress-v2370.test.ts',
      'src/tests/gc-status-deep-link-v2358.test.ts',
      'src/tests/inv-status-deep-link-v2356.test.ts',
      'src/tests/inv-stock-deep-link-v2329.test.ts',
      // the po-status word's ledger lives beside the proxy-gate suite
      // (one release, two suites — the ledger is the honest speaker here)
      'src/tests/ly-island-v2369.test.ts',
      'src/tests/ly-type-deep-link-v2368.test.ts',
      'src/tests/pr-status-deep-link-v2362.test.ts',
      'src/tests/proxy-gate-layering-v2328.test.ts',
      'src/tests/rent-status-deep-link-v2355.test.ts',
      'src/tests/sec-type-deep-link-v2367.test.ts',
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
