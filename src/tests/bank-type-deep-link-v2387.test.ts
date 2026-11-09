// THE BANKING DESK'S OWN WORD (v2.387.0): the bank ledger's
// transaction-type lens answers the address bar — the family's
// TWENTY-SIXTH wearing.
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
// shape grid. THE PROMISE KEPT A TWENTY-SIXTH TIME — and this word is a
// VOCABULARY word on a lens the sub-tab law had parked: the type Select
// lives inside the bank ledger's Transactions pane, so the landing
// RAISES THE SUB-TAB IT LANDS INTO (the default-sub-tab amendment's
// next case — the pane's seed reads the same landed word) and the chip
// is visible on landing. The chip wears SKY at 300/100 — the
// shade-split's FOURTH application, the hue the delivery-notes desk
// spoke at the shallow 200/50 storey now one storey deeper, a family
// byte the 200-storey can never equal, borrowing nothing from the
// desk's badges (blue, emerald, green, amber, red, orange, violet,
// slate). The word's voice is UPPERCASE (the Select's OWN spellings,
// the payment word's voice) and the neutral is the lowercase `all` —
// exactly the Select's own.

import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

import {
  parseInitialNamedMember,
  BANK_TYPE_FILTERS,
} from '@/lib/tab-url';
import { WHATS_NEW } from '@/lib/whats-new';

const BANKING_TAB = 'src/app/(shell)/tabs/banking-tab.tsx';

// ---------------------------------------------------------------------------
// 1. THE PARSER'S TRUTH TABLE (the same ONE home, one word over)
// ---------------------------------------------------------------------------

describe('parseInitialNamedMember — ?bank-type= speaks the ledger\u2019s own vocabulary', () => {
  it('every member of the union answers itself (UPPERCASE, case-sensitive)', () => {
    for (const member of BANK_TYPE_FILTERS) {
      expect(parseInitialNamedMember(`?tab=banking&bank-type=${member}`, 'bank-type', BANK_TYPE_FILTERS, 'all')).toBe(member);
    }
  });

  it('a lowercase or capitalized word is an unknown word — never a clever match', () => {
    expect(parseInitialNamedMember('?tab=banking&bank-type=deposit', 'bank-type', BANK_TYPE_FILTERS, 'all')).toBe('all');
    expect(parseInitialNamedMember('?tab=banking&bank-type=Deposit', 'bank-type', BANK_TYPE_FILTERS, 'all')).toBe('all');
    expect(parseInitialNamedMember('?tab=banking&bank-type=WITHDRAWALS', 'bank-type', BANK_TYPE_FILTERS, 'all')).toBe('all');
    expect(parseInitialNamedMember('?tab=banking&bank-type=garbage', 'bank-type', BANK_TYPE_FILTERS, 'all')).toBe('all');
  });

  it('missing, bare, and malformed searches answer the fallback — never throw', () => {
    expect(parseInitialNamedMember('', 'bank-type', BANK_TYPE_FILTERS, 'all')).toBe('all');
    expect(parseInitialNamedMember('?tab=banking', 'bank-type', BANK_TYPE_FILTERS, 'all')).toBe('all');
    expect(parseInitialNamedMember('?tab=banking&bank-type=', 'bank-type', BANK_TYPE_FILTERS, 'all')).toBe('all');
    expect(parseInitialNamedMember('bank-type=DEPOSIT', 'bank-type', BANK_TYPE_FILTERS, 'all')).toBe('DEPOSIT');
    expect(parseInitialNamedMember('?????', 'bank-type', BANK_TYPE_FILTERS, 'all')).toBe('all');
  });

  it('the word rides BESIDE the other twenty-five without stealing any of them', () => {
    expect(
      parseInitialNamedMember('?tab=banking&bank-type=FEE&txn-pay=CASH&et-status=PENDING', 'bank-type', BANK_TYPE_FILTERS, 'all')
    ).toBe('FEE');
    expect(
      parseInitialNamedMember('?tab=transactions&txn-pay=CASH&bank-type=INTEREST', 'bank-type', BANK_TYPE_FILTERS, 'all')
    ).toBe('INTEREST');
    expect(
      parseInitialNamedMember('?tab=banking&bank-type=TRANSFER&po-status=OPEN&inv-stock=low_stock&rep-type=trends', 'bank-type', BANK_TYPE_FILTERS, 'all')
    ).toBe('TRANSFER');
  });
});

// ---------------------------------------------------------------------------
// 2. THE DESK'S SEED — the sub-tab law's speaker, cast-free
// ---------------------------------------------------------------------------

describe('the banking desk — ?bank-type= lands as visible state', () => {
  const desk = readFileSync(BANKING_TAB, 'utf8');
  const loom = readFileSync('src/components/landing-chip.tsx', 'utf8');
  const home = readFileSync('src/lib/tab-url.ts', 'utf8');

  it('the seed reads the word through the ONE home (never a local parser)', () => {
    expect(
      desk.includes("parseInitialNamedMember(window.location.search, 'bank-type', BANK_TYPE_FILTERS, 'all')")
    ).toBe(true);
    expect(home.includes('export function parseInitialNamedMember')).toBe(true);
    expect(home.includes('v2.387.0 — THE PROMISE KEPT, THE TWENTY-SIXTH WORD')).toBe(true);
  });

  it('the seed is the write-once initializer of the landing (the read-once law)', () => {
    expect(desk.includes('const [landedBankType] = useState<BankTypeWordValue>(initialBankType);')).toBe(true);
    expect(desk.includes('const [txFilterType, setTxFilterType] = useState<string>(initialBankType);')).toBe(true);
    expect(desk.includes("if (typeof window === 'undefined') return 'all';")).toBe(true);
  });

  it('the seed is CAST-FREE — the member parser answers the union it is', () => {
    expect(desk.includes('function initialBankType(): (typeof BANK_TYPE_FILTERS)[number] {')).toBe(true);
    expect(desk.includes('initialBankType() as')).toBe(false);
    expect(desk.includes('initialBankType as unknown')).toBe(false);
  });

  it('the vocabulary is the Select\u2019s OWN spelling (six members, UPPERCASE neutral lowercase)', () => {
    expect(BANK_TYPE_FILTERS).toEqual([
      'all',
      'DEPOSIT',
      'WITHDRAWAL',
      'TRANSFER',
      'FEE',
      'INTEREST',
    ]);
    expect(home.includes('export const BANK_TYPE_FILTERS')).toBe(true);
    // the Select's items speak the SAME words (the state keeps the
    // Select's string voice; its five SelectItems ARE the union):
    expect(desk.includes('<SelectItem value="DEPOSIT">Deposit</SelectItem>')).toBe(true);
    expect(desk.includes('<SelectItem value="WITHDRAWAL">Withdrawal</SelectItem>')).toBe(true);
    expect(desk.includes('<SelectItem value="TRANSFER">Transfer</SelectItem>')).toBe(true);
    expect(desk.includes('<SelectItem value="FEE">Fee</SelectItem>')).toBe(true);
    expect(desk.includes('<SelectItem value="INTEREST">Interest</SelectItem>')).toBe(true);
  });

  it('EVERY hand-driven type change rides the retirement door', () => {
    expect(desk.includes('const chooseBankType = (value: string) => {')).toBe(true);
    expect(desk.includes('<Select value={txFilterType} onValueChange={chooseBankType}>')).toBe(true);
    // the ONLY direct setTxFilterType calls left are the declaration,
    // the helper's own write, and the chip's one-press dismissal:
    const direct = desk.split('\n').filter((l) => l.includes('setTxFilterType(') && !l.includes('const [txFilterType, setTxFilterType]'));
    expect(direct.length).toBe(2);
    expect(direct.some((l) => l.includes('setTxFilterType(value);'))).toBe(true);
    expect(direct.some((l) => l.includes("setTxFilterType('all');"))).toBe(true);
  });

  it('the chip sits BEFORE the lens it landed into, INSIDE the pane it raised (the position laws)', () => {
    const chip = desk.indexOf('data-testid="bank-type-landing-word"');
    const lens = desk.indexOf('<Select value={txFilterType} onValueChange={chooseBankType}>');
    const pane = desk.indexOf('<TabsContent value="transactions"');
    expect(chip).toBeGreaterThan(-1);
    expect(lens).toBeGreaterThan(-1);
    expect(pane).toBeGreaterThan(-1);
    expect(chip).toBeLessThan(lens);
    expect(chip).toBeGreaterThan(pane);
  });

  it('the chip wears SKY at the 300/100 storey (the fourth shade-split)', () => {
    // v2.394.0 THE LOOM: the wardrobe moved into the loom’s registry —
    // the desk proves its family by hue, the registry carries the bytes.
    expect(desk.includes('hue="sky"')).toBe(true);
    expect(loom.includes('border-sky-300 bg-sky-100 text-sky-700')).toBe(true);
    expect(loom.includes('dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-300')).toBe(true);
    // a chip hue the desk's badges never speak — the badge census:
    expect(desk.includes('bg-blue-100 text-blue-700')).toBe(true); // Checking / In-Progress badges
    expect(desk.includes('bg-emerald-100 text-emerald-700')).toBe(true);
    expect(desk.includes('bg-amber-100 text-amber-700')).toBe(true);
    // and no OTHER landing chip hue collides with sky:
    expect(desk.includes('border-blue-300 bg-blue-100')).toBe(false);
    expect(desk.includes('border-orange-300 bg-orange-100')).toBe(false);
    expect(desk.includes('border-teal-300 bg-teal-100')).toBe(false);
    expect(desk.includes('border-lime-300 bg-lime-100')).toBe(false);
  });

  it('the chip is dismissible and annotated (the collision law\u2019s annotation)', () => {
    expect(desk.includes('setBankLandingLive(false);')).toBe(true);
    expect(desk.includes("THE BANKING DESK'S OWN WORD")).toBe(true);
    expect(desk.includes('?bank-type=DEPOSIT')).toBe(true);
  });

  it('the landing RAISES the sub-tab it lands into (the sub-tab amendment, now the two-word negotiation)', () => {
    // v2.388.0: the desk owns TWO words — the seed negotiates (the
    // M-PESA word wins the pane; the type word raises Transactions)
    expect(
      desk.includes("return initialBankType() !== 'all' ? 'transactions' : 'accounts';")
    ).toBe(true);
    expect(
      desk.includes("if (initialMpesaStatus() !== 'all') return 'mpesa';")
    ).toBe(true);
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
      if (readFileSync(p, 'utf8').includes('bank-type')) collected.push(p);
    }
  }
}

describe('the address-bar vocabulary stays one-writer-per-word', () => {
  it('`bank-type` speaks in exactly the expected files under src/', () => {
    const collected: string[] = [];
    walkSrc('src', collected);
    collected.sort();
    expect(collected).toEqual([
      'src/app/(shell)/tabs/banking-tab.tsx',
      'src/lib/tab-url.ts',
      'src/lib/whats-new.ts',
      // this suite (the word's own ledger — an honest speaker)
      // the twenty-seventh word's own ledger — admitted (this file
      // speaks the words this ledger walks; its NAME carries them too)
      'src/tests/bank-mpesa-deep-link-v2388.test.ts',
      'src/tests/bank-type-deep-link-v2387.test.ts',
      // the twenty-ninth word's own ledger — admitted (its rides-beside truth names this file's word)
      'src/tests/debt-channel-deep-link-v2390.test.ts',
      // the twenty-eighth word's own ledger — admitted (its census list names this file)
      'src/tests/debt-status-deep-link-v2389.test.ts',
      // the e-TIMS ledger ADMITTED this file into its own collision
      // census — an admission line carries the word it admits (the
      // LEDGER-CITATION RIPPLE, second order)
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
      // twenty-sixth row rides through its parse (an honest speaker)
      'src/tests/family-registry-stress-v2370.test.ts',
      // the three ledgers that admitted THIS file now speak the word
      // their own admission lines carry (the RIPPLE's third order —
      // the census converges: admissions are fixed, so is this list)
      'src/tests/inv-stock-deep-link-v2329.test.ts',
      // the thirty-second word's own ledger — admitted (its own ledger
      // LISTS this file's path — the third-order ripple: a ledger line
      // carries every word its paths speak)
      // the loom’s own suite — admitted (v2.394.0: the LandingChip
      // loom suite pins this desk’s chip bytes, so the walk lists it)
      'src/tests/landing-chip-loom-v2394.test.ts',
      'src/tests/msg-template-deep-link-v2393.test.ts',
      'src/tests/proxy-gate-layering-v2328.test.ts',
      // the reports ledger's story pins moved ON to the twenty-seventh
      // word (the v2.388.0 hand-over) — the file no longer speaks this
      // word, and the honest census releases it
      'src/tests/transfer-status-deep-link-v2357.test.ts',
      'src/tests/txn-pay-deep-link-v2333.test.ts',
    ]);
  });
});

// ---------------------------------------------------------------------------
// 4. THE CONSTITUTION — the twenty-sixth row is visible from here
// ---------------------------------------------------------------------------

describe('the address-bar vocabulary — the twenty-sixth row (cross-suite pins)', () => {
  const constitution = readFileSync('src/tests/transfer-status-deep-link-v2357.test.ts', 'utf8');

  it('the constitution walks TWENTY-SIX words over TWENTY-THREE desks', () => {
    expect(constitution.includes('(thirty-three words, twenty-six desks)')).toBe(true);
    expect(constitution.includes("{ word: 'bank-type', desk: 'src/app/(shell)/tabs/banking-tab.tsx', family: 'border-sky-300', suite: 'src/tests/bank-type-deep-link-v2387.test.ts' }")).toBe(true);
    expect(constitution.includes("'TWENTY-SIXTH'")).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 5. THE WHAT'S NEW FEED — the round announces itself
// ---------------------------------------------------------------------------

describe('whats-new — v2.477.0 leads the feed', () => {
  it('the entry exists, first, with the round\u2019s own story', () => {
    const head = WHATS_NEW[0];
    expect(head.version).toBe('2.477.0');
    // the lead's story hand-over (v2.477.0, the Task 111 law's
    // eighty-third application): the head story is the hand-over's
    // voice — the carrying round: THE CHORUS LEARNS THE PAPER'S
    // SCANNABLE DOOR — the print appendix's scan grid grows the
    // LEAD card: one QR drawn by the qrcode house encoding the ONE
    // home's deadStockChorusShareUrl (the exact bytes the Share all
    // handle opens, the store's own number riding its third word
    // when the branch keeps one on file), captioned "The ledger's
    // chorus" with the honest count note, the teal dress marking
    // the collective door beside the rows' own cards; the paper
    // wears its own dress (the rose markers on the numbered asks,
    // the note in the teal word — new CSS lines, the standing
    // bytes untouched), the gate stays the dead-stock stage with
    // rows, the window still opens first, a failed draw prints
    // the paper without the cards, the census keeps its ten
    // voices (a drawn image, never a handle), and the desk never
    // spells the host's word.
    // The chorus learns the paper's scannable door.
    expect(head.title).toContain('edit door');
    expect(head.bullets.length).toBeGreaterThanOrEqual(3);
    expect(head.bullets.some((b) => b.includes('edit door'))).toBe(true);
    expect(head.bullets.some((b) => b.includes('pre-addressed'))).toBe(true);
    expect(head.bullets.some((b) => b.includes('clearance note'))).toBe(true);
    expect(head.bullets.some((b) => b.includes('chat picker'))).toBe(true);
  });
});
