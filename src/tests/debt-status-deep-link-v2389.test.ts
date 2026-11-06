// THE DEBT LEDGER'S OWN WORD (v2.389.0): the debt management desk's
// reminder-history lens answers the address bar — the family's
// TWENTY-EIGHTH wearing, and the desk's FIRST word (the banking, tax
// and suppliers precedent).
//
// v2.328.0 gave the purchase-orders roster its STATUS word (`?po-status=`),
// v2.329.0 the inventory desk, v2.330.0 the customers desk, v2.331.0 the
// suppliers desk, v2.332.0 that desk's PO section, v2.333.0 the
// transactions desk's payment-method lens, v2.354.0 its type lens,
// v2.355.0 the rentals desk, v2.356.0 the invoices desk, v2.357.0 the
// transfers desk, v2.358.0 the gift cards desk, v2.359.0 the delivery
// notes desk, v2.360.0 the vouchers desk, v2.361.0 the credits desk,
// v2.362.0 the payroll desk, v2.363.0 the conversations desk, v2.364.0
// the catalog desk, v2.365.0 the debt-plans desk, v2.366.0 the admin
// desk, v2.367.0 the security desk, v2.368.0 the loyalty ledger,
// v2.381.0 the e-TIMS invoices ledger, v2.382.0 the tax desk's type
// lens, v2.383.0 that ledger's month shape, v2.384.0 the reports desk's
// shape grid, v2.387.0 the bank ledger's type lens, v2.388.0 the bank
// ledger's M-Pesa lens. THE PROMISE KEPT A TWENTY-EIGHTH TIME — the
// sub-tab amendment's THIRD application (one release after its second):
// the status lens lives inside the desk's History pane, so the landing
// RAISES THE PANE IT LANDS INTO (the pane's seed reads the same landed
// word; the desk's default face stays the Overdue Board when the
// address bar is silent). The chip wears CYAN at 300/100 — the
// shade-split's SIXTH application, a hue NO badge on this desk speaks
// (the census answers amber, blue, emerald, green, orange, purple, rose
// and slate). The word's voice is UPPERCASE (the Select's OWN
// spellings, the reminder word's voice) and the neutral is the
// lowercase `all` — exactly the Select's own.

import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

import {
  parseInitialNamedMember,
  DEBT_STATUS_FILTERS,
} from '@/lib/tab-url';
import { WHATS_NEW } from '@/lib/whats-new';

const DEBT_TAB = 'src/app/(shell)/tabs/debt-management-tab.tsx';

// ---------------------------------------------------------------------------
// 1. THE PARSER'S TRUTH TABLE (the same ONE home, one word over)
// ---------------------------------------------------------------------------

describe('parseInitialNamedMember — ?debt-status= speaks the ledger\u2019s own vocabulary', () => {
  it('every member of the union answers itself (UPPERCASE, case-sensitive)', () => {
    for (const member of DEBT_STATUS_FILTERS) {
      expect(parseInitialNamedMember(`?tab=debt-management&debt-status=${member}`, 'debt-status', DEBT_STATUS_FILTERS, 'all')).toBe(member);
    }
  });

  it('a lowercase or capitalized word is an unknown word — never a clever match', () => {
    expect(parseInitialNamedMember('?tab=debt-management&debt-status=pending', 'debt-status', DEBT_STATUS_FILTERS, 'all')).toBe('all');
    expect(parseInitialNamedMember('?tab=debt-management&debt-status=Sent', 'debt-status', DEBT_STATUS_FILTERS, 'all')).toBe('all');
    expect(parseInitialNamedMember('?tab=debt-management&debt-status=DELIVEREDS', 'debt-status', DEBT_STATUS_FILTERS, 'all')).toBe('all');
    expect(parseInitialNamedMember('?tab=debt-management&debt-status=garbage', 'debt-status', DEBT_STATUS_FILTERS, 'all')).toBe('all');
  });

  it('missing, bare, and malformed searches answer the fallback — never throw', () => {
    expect(parseInitialNamedMember('', 'debt-status', DEBT_STATUS_FILTERS, 'all')).toBe('all');
    expect(parseInitialNamedMember('?tab=debt-management', 'debt-status', DEBT_STATUS_FILTERS, 'all')).toBe('all');
    expect(parseInitialNamedMember('?tab=debt-management&debt-status=', 'debt-status', DEBT_STATUS_FILTERS, 'all')).toBe('all');
    expect(parseInitialNamedMember('debt-status=FAILED', 'debt-status', DEBT_STATUS_FILTERS, 'all')).toBe('FAILED');
    expect(parseInitialNamedMember('?????', 'debt-status', DEBT_STATUS_FILTERS, 'all')).toBe('all');
  });

  it('the word rides BESIDE the other twenty-seven without stealing any of them', () => {
    expect(
      parseInitialNamedMember('?tab=debt-management&debt-status=FAILED&bank-mpesa=PENDING&po-status=OPEN', 'debt-status', DEBT_STATUS_FILTERS, 'all')
    ).toBe('FAILED');
    expect(
      parseInitialNamedMember('?tab=debt-management&debt-status=SENT&tax-type=VAT', 'debt-status', DEBT_STATUS_FILTERS, 'all')
    ).toBe('SENT');
    expect(
      parseInitialNamedMember('?tab=debt-management&debt-status=DELIVERED&et-status=PENDING&txn-pay=CASH&rep-type=trends', 'debt-status', DEBT_STATUS_FILTERS, 'all')
    ).toBe('DELIVERED');
  });
});

// ---------------------------------------------------------------------------
// 2. THE DESK'S SEED — the sub-tab amendment's third speaker, cast-free
// ---------------------------------------------------------------------------

describe('the debt management desk — ?debt-status= lands as visible state', () => {
  const desk = readFileSync(DEBT_TAB, 'utf8');
  const loom = readFileSync('src/components/landing-chip.tsx', 'utf8');
  const home = readFileSync('src/lib/tab-url.ts', 'utf8');

  it('the seed reads the word through the ONE home (never a local parser)', () => {
    expect(
      desk.includes("parseInitialNamedMember(window.location.search, 'debt-status', DEBT_STATUS_FILTERS, 'all')")
    ).toBe(true);
    expect(home.includes('export function parseInitialNamedMember')).toBe(true);
    expect(home.includes('v2.389.0 — THE PROMISE KEPT, THE TWENTY-EIGHTH WORD')).toBe(true);
  });

  it('the seed is the write-once initializer of the landing (the read-once law)', () => {
    expect(desk.includes('const [landedDebtStatus] = useState<DebtStatusWordValue>(initialDebtStatus);')).toBe(true);
    expect(desk.includes('const [statusFilter, setStatusFilter] = useState<string>(initialDebtStatus);')).toBe(true);
    expect(desk.includes('const [debtLandingLive, setDebtLandingLive] = useState(() => initialDebtStatus() !== \'all\');')).toBe(true);
    expect(desk.includes("if (typeof window === 'undefined') return 'all';")).toBe(true);
  });

  it('the seed is CAST-FREE — the member parser answers the union it is', () => {
    expect(desk.includes('function initialDebtStatus(): (typeof DEBT_STATUS_FILTERS)[number] {')).toBe(true);
    expect(desk.includes('initialDebtStatus() as')).toBe(false);
    expect(desk.includes('initialDebtStatus as unknown')).toBe(false);
  });

  it('the vocabulary is the Select\u2019s OWN spelling (five members, UPPERCASE neutral lowercase)', () => {
    expect(DEBT_STATUS_FILTERS).toEqual([
      'all',
      'PENDING',
      'SENT',
      'DELIVERED',
      'FAILED',
    ]);
    expect(home.includes('export const DEBT_STATUS_FILTERS')).toBe(true);
    // the Select's items speak the SAME words (the state keeps the
    // Select's string voice; its four SelectItems ARE the union):
    expect(desk.includes('<SelectItem value="PENDING">Pending</SelectItem>')).toBe(true);
    expect(desk.includes('<SelectItem value="SENT">Sent</SelectItem>')).toBe(true);
    expect(desk.includes('<SelectItem value="DELIVERED">Delivered</SelectItem>')).toBe(true);
    expect(desk.includes('<SelectItem value="FAILED">Failed</SelectItem>')).toBe(true);
  });

  it('EVERY hand-driven status change rides the retirement door', () => {
    expect(desk.includes('const chooseDebtStatus = (v: string) => {')).toBe(true);
    expect(desk.includes('<Select value={statusFilter} onValueChange={chooseDebtStatus}>')).toBe(true);
    // the ONLY direct setStatusFilter calls left are the declaration,
    // the door's own write, and the chip's one-press dismissal:
    const direct = desk.split('\n').filter((l) => l.includes('setStatusFilter(') && !l.includes('const [statusFilter, setStatusFilter]'));
    expect(direct.length).toBe(2);
    expect(direct.some((l) => l.includes('setStatusFilter(v);'))).toBe(true);
    expect(direct.some((l) => l.includes("setStatusFilter('all');"))).toBe(true);
  });

  it('the chip sits BEFORE the lens it landed into, INSIDE the pane\u2019s own section (the position laws)', () => {
    const chip = desk.indexOf('data-testid="debt-status-landing-word"');
    const lens = desk.indexOf('<Select value={statusFilter} onValueChange={chooseDebtStatus}>');
    const section = desk.indexOf('function HistorySection');
    expect(chip).toBeGreaterThan(-1);
    expect(lens).toBeGreaterThan(-1);
    expect(section).toBeGreaterThan(-1);
    expect(chip).toBeLessThan(lens);
    expect(chip).toBeGreaterThan(section);
    // and the pane the word raises RENDERS the section the chip lives in:
    expect(desk.includes('<TabsContent value="history"')).toBe(true);
    expect(desk.includes('<HistorySection storeId={currentStoreId} />')).toBe(true);
  });

  it('the landing RAISES the pane it lands into (the sub-tab amendment, third application)', () => {
    expect(
      // v2.390.0 hand-over: the desk's SECOND word joined the seed —
      // the pane raise now reads BOTH words (either lands, the History
      // pane rises; the same-pane two-word negotiation).
      desk.includes("const [activeTab, setActiveTab] = useState(() => (initialDebtStatus() !== 'all' || initialDebtChannel() !== 'all' ? 'history' : 'board'));")
    ).toBe(true);
  });

  it('the lens answers with its own count (the tabular count line)', () => {
    expect(desk.includes('className="text-xs text-muted-foreground tabular-nums"')).toBe(true);
    expect(desk.includes('{pagination?.total ?? reminders.length} reminder')).toBe(true);
  });

  it('the chip wears CYAN at the 300/100 storey (the sixth shade-split)', () => {
    // v2.394.0 THE LOOM: the wardrobe moved into the loom’s registry —
    // the desk proves its family by hue, the registry carries the bytes.
    expect(desk.includes('hue="cyan"')).toBe(true);
    expect(loom.includes('border-cyan-300 bg-cyan-100 text-cyan-700')).toBe(true);
    expect(loom.includes('dark:border-cyan-500/30 dark:bg-cyan-500/10 dark:text-cyan-300')).toBe(true);
    expect(loom.includes('focus-visible:ring-cyan-400')).toBe(true);
    // a chip hue the desk's badges never speak — the badge census:
    expect(desk.includes('bg-blue-100 text-blue-700')).toBe(true);
    expect(desk.includes('bg-emerald-100 text-emerald-700')).toBe(true);
    expect(desk.includes('bg-rose-100 text-rose-700')).toBe(true);
    expect(desk.includes('bg-amber-100')).toBe(true);
    // and no OTHER landing chip hue appears on this desk:
    expect(desk.includes('border-purple-300 bg-purple-100')).toBe(false);
    expect(desk.includes('border-sky-300 bg-sky-100')).toBe(false);
    expect(desk.includes('border-orange-300 bg-orange-100')).toBe(false);
    expect(desk.includes('border-teal-300 bg-teal-100')).toBe(false);
    expect(desk.includes('border-lime-300 bg-lime-100')).toBe(false);
    expect(desk.includes('border-cyan-200')).toBe(false); // the 200 storey is another desk's voice
  });

  it('the chip is dismissible and annotated (the collision law\u2019s annotation)', () => {
    expect(desk.includes('setDebtLandingLive(false);')).toBe(true);
    expect(desk.includes("THE DEBT LEDGER'S OWN WORD")).toBe(true);
    expect(desk.includes('?debt-status=PENDING')).toBe(true);
    expect(desk.includes('data-testid="debt-status-landing-word"')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 3. THE COLLISION LEDGER — which files may speak the word at all
// ---------------------------------------------------------------------------

function walkSrc(dir: string, collected: string[]): void {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    const st = statSync(p);
    if (st.isDirectory()) {
      if (entry === 'node_modules' || entry === '.next') continue;
      walkSrc(p, collected);
    } else if (/\.(ts|tsx|mjs|js)$/.test(entry)) {
      if (readFileSync(p, 'utf8').includes('debt-status')) collected.push(p);
    }
  }
}

describe('the address-bar vocabulary stays one-writer-per-word', () => {
  it('`debt-status` speaks in exactly the expected files under src/', () => {
    const collected: string[] = [];
    walkSrc('src', collected);
    collected.sort();
    expect(collected).toEqual([
      'src/app/(shell)/tabs/debt-management-tab.tsx',
      'src/lib/tab-url.ts',
      'src/lib/whats-new.ts',
      // the elder ledgers admitted this suite — an admission line
      // carries the word it admits (the LEDGER-CITATION RIPPLE), so
      // each one is an honest speaker of this word
      'src/tests/bank-mpesa-deep-link-v2388.test.ts',
      // the desk's word rides the twenty-sixth ledger's feed-story
      // hand-over (its lead pins speak this round's story)
      'src/tests/bank-type-deep-link-v2387.test.ts',
      // the desk's SECOND word's ledger — this suite pins its sibling
      // chip (the same-pane negotiation) — an honest speaker
      'src/tests/debt-channel-deep-link-v2390.test.ts',
      // this suite (the word's own ledger — an honest speaker)
      'src/tests/debt-status-deep-link-v2389.test.ts',
      'src/tests/et-status-deep-link-v2381.test.ts',
      // the thirtieth word's own ledger — admitted (this suite's own
      // ledger LISTS this file's path — the third-order ripple: a
      // ledger line carries every word its paths speak)
      'src/tests/exp-status-deep-link-v2391.test.ts',
      // the thirty-first word's own ledger — admitted (its own ledger
      // LISTS this file's path — the third-order ripple: a ledger line
      // carries every word its paths speak)
      'src/tests/exp-type-deep-link-v2392.test.ts',
      // the registry stress parses the constitution's rows — the
      // twenty-eighth row rides through its parse (an honest speaker)
      'src/tests/family-registry-stress-v2370.test.ts',
      // the po-status word's ledger lives beside the proxy-gate suite
      // (one release, two suites — the ledger is the honest speaker here)
      // the thirty-second word's own ledger — admitted (its own ledger
      // LISTS this file's path — the third-order ripple: a ledger line
      // carries every word its paths speak)
      // the loom’s own suite — admitted (v2.394.0: the LandingChip
      // loom suite pins this desk’s chip bytes, so the walk lists it)
      'src/tests/landing-chip-loom-v2394.test.ts',
      'src/tests/msg-template-deep-link-v2393.test.ts',
      'src/tests/proxy-gate-layering-v2328.test.ts',
      'src/tests/tax-type-deep-link-v2382.test.ts',
      // the constitution's twenty-eighth row + the admission this file
      // earns from the transfer-status ledger (this suite names it)
      'src/tests/transfer-status-deep-link-v2357.test.ts',
      'src/tests/txn-pay-deep-link-v2333.test.ts',
    ]);
  });
});

// ---------------------------------------------------------------------------
// 4. THE CONSTITUTION — the twenty-eighth row is visible from here
// ---------------------------------------------------------------------------

describe('the address-bar vocabulary — the twenty-eighth row (cross-suite pins)', () => {
  const constitution = readFileSync('src/tests/transfer-status-deep-link-v2357.test.ts', 'utf8');

  it('the constitution walks TWENTY-EIGHT words over TWENTY-FOUR desks (a new desk speaks)', () => {
    expect(constitution.includes('(thirty-two words, twenty-six desks)')).toBe(true);
    expect(constitution.includes("{ word: 'debt-status', desk: 'src/app/(shell)/tabs/debt-management-tab.tsx', family: 'border-cyan-300', suite: 'src/tests/debt-status-deep-link-v2389.test.ts' }")).toBe(true);
    expect(constitution.includes("'TWENTY-EIGHTH'")).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 5. THE WHAT'S NEW FEED — the round announces itself
// ---------------------------------------------------------------------------

describe('whats-new — v2.423.0 leads the feed', () => {
  it('the entry exists, first, with the round\u2019s own story', () => {
    const head = WHATS_NEW[0];
    expect(head.version).toBe('2.423.0');
    // the lead's story hand-over (v2.423.0, the Task 111 law's twenty-ninth
    // application): the head story is the hand-over's voice — the
    // supplier opens its shelf: the Products chip grows the PRESS and a
    // right-side shelf drill answers 'what does this supplier provide'
    // without leaving the roster (the row's own click stays the detail
    // drill; the zero chip's press keeps its honest empty face —
    // 'provides nothing yet'). The summary reads the grouping strip's
    // OWN reduce keyed to the supplier (one home — a stale wire row
    // never rides another supplier's shelf), the rows wear the
    // inventory desk's low-stock family (out / low / ok, the owed units
    // floored at zero), and the wire grew the door too (/products
    // answers ONE supplier's roster — the drill never downloads the
    // whole catalog).
    // The supplier-rides story exits the head this round; the
    // shelf's door carries the eye.
    expect(head.title).toContain('shelf');
    expect(head.bullets.length).toBeGreaterThanOrEqual(3);
    expect(head.bullets.some((b) => b.includes('PRESS'))).toBe(true);
    expect(head.bullets.some((b) => b.includes('provides nothing yet'))).toBe(true);
    expect(head.bullets.some((b) => b.includes('stale row never rides'))).toBe(true);
  });
});
