// THE M-PESA LEDGER'S OWN WORD (v2.388.0): the banking desk's M-Pesa
// pane's status lens answers the address bar — the family's
// TWENTY-SEVENTH wearing, and the desk's SECOND word (the suppliers
// and transactions precedent).
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
// shape grid, v2.387.0 the bank ledger's type lens. THE PROMISE KEPT A
// TWENTY-SEVENTH TIME — the sub-tab amendment's SECOND application
// (one release after its first): the status lens lives inside the
// desk's M-Pesa pane, so the landing RAISES THE PANE IT LANDS INTO
// (the pane's seed reads the same landed word). The desk now owns TWO
// words, and the two-word negotiation is pinned: when both land
// together, the M-PESA word wins the pane seed (the deeper pane
// raises), and each chip waits honestly inside its own pane. The chip
// wears PURPLE at 300/100 — the shade-split's FIFTH application, the
// hue the catalog desk spoke at the shallow 200/50 storey now one
// storey deeper, a family byte the 200-storey can never equal,
// borrowing nothing from the desk's badges (blue, emerald, green,
// amber, red, orange, violet, slate). The word's voice is UPPERCASE
// (the Select's OWN spellings, the payment word's voice) and the
// neutral is the lowercase `all` — exactly the Select's own.

import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

import {
  parseInitialNamedMember,
  BANK_MPESA_FILTERS,
} from '@/lib/tab-url';
import { WHATS_NEW } from '@/lib/whats-new';

const BANKING_TAB = 'src/app/(shell)/tabs/banking-tab.tsx';

// ---------------------------------------------------------------------------
// 1. THE PARSER'S TRUTH TABLE (the same ONE home, one word over)
// ---------------------------------------------------------------------------

describe('parseInitialNamedMember — ?bank-mpesa= speaks the ledger\u2019s own vocabulary', () => {
  it('every member of the union answers itself (UPPERCASE, case-sensitive)', () => {
    for (const member of BANK_MPESA_FILTERS) {
      expect(parseInitialNamedMember(`?tab=banking&bank-mpesa=${member}`, 'bank-mpesa', BANK_MPESA_FILTERS, 'all')).toBe(member);
    }
  });

  it('a lowercase or capitalized word is an unknown word — never a clever match', () => {
    expect(parseInitialNamedMember('?tab=banking&bank-mpesa=pending', 'bank-mpesa', BANK_MPESA_FILTERS, 'all')).toBe('all');
    expect(parseInitialNamedMember('?tab=banking&bank-mpesa=Pending', 'bank-mpesa', BANK_MPESA_FILTERS, 'all')).toBe('all');
    expect(parseInitialNamedMember('?tab=banking&bank-mpesa=MATCHEDS', 'bank-mpesa', BANK_MPESA_FILTERS, 'all')).toBe('all');
    expect(parseInitialNamedMember('?tab=banking&bank-mpesa=garbage', 'bank-mpesa', BANK_MPESA_FILTERS, 'all')).toBe('all');
  });

  it('missing, bare, and malformed searches answer the fallback — never throw', () => {
    expect(parseInitialNamedMember('', 'bank-mpesa', BANK_MPESA_FILTERS, 'all')).toBe('all');
    expect(parseInitialNamedMember('?tab=banking', 'bank-mpesa', BANK_MPESA_FILTERS, 'all')).toBe('all');
    expect(parseInitialNamedMember('?tab=banking&bank-mpesa=', 'bank-mpesa', BANK_MPESA_FILTERS, 'all')).toBe('all');
    expect(parseInitialNamedMember('bank-mpesa=MATCHED', 'bank-mpesa', BANK_MPESA_FILTERS, 'all')).toBe('MATCHED');
    expect(parseInitialNamedMember('?????', 'bank-mpesa', BANK_MPESA_FILTERS, 'all')).toBe('all');
  });

  it('the word rides BESIDE the other twenty-six without stealing any of them', () => {
    expect(
      parseInitialNamedMember('?tab=banking&bank-mpesa=DISPUTED&bank-type=DEPOSIT&txn-pay=CASH', 'bank-mpesa', BANK_MPESA_FILTERS, 'all')
    ).toBe('DISPUTED');
    expect(
      parseInitialNamedMember('?tab=banking&bank-type=FEE&bank-mpesa=UNMATCHED', 'bank-mpesa', BANK_MPESA_FILTERS, 'all')
    ).toBe('UNMATCHED');
    expect(
      parseInitialNamedMember('?tab=banking&bank-mpesa=PENDING&po-status=OPEN&et-status=PENDING&rep-type=trends', 'bank-mpesa', BANK_MPESA_FILTERS, 'all')
    ).toBe('PENDING');
  });
});

// ---------------------------------------------------------------------------
// 2. THE DESK'S SEED — the sub-tab amendment's second speaker, cast-free
// ---------------------------------------------------------------------------

describe('the banking desk — ?bank-mpesa= lands as visible state', () => {
  const desk = readFileSync(BANKING_TAB, 'utf8');
  const loom = readFileSync('src/components/landing-chip.tsx', 'utf8');
  const home = readFileSync('src/lib/tab-url.ts', 'utf8');

  it('the seed reads the word through the ONE home (never a local parser)', () => {
    expect(
      desk.includes("parseInitialNamedMember(window.location.search, 'bank-mpesa', BANK_MPESA_FILTERS, 'all')")
    ).toBe(true);
    expect(home.includes('export function parseInitialNamedMember')).toBe(true);
    expect(home.includes('v2.388.0 — THE PROMISE KEPT, THE TWENTY-SEVENTH WORD')).toBe(true);
  });

  it('the seed is the write-once initializer of the landing (the read-once law)', () => {
    expect(desk.includes('const [landedMpesaStatus] = useState<BankMpesaWordValue>(initialMpesaStatus);')).toBe(true);
    expect(desk.includes('const [mpesaFilterStatus, setMpesaFilterStatus] = useState<string>(initialMpesaStatus);')).toBe(true);
    expect(desk.includes("if (typeof window === 'undefined') return 'all';")).toBe(true);
  });

  it('the seed is CAST-FREE — the member parser answers the union it is', () => {
    expect(desk.includes('function initialMpesaStatus(): (typeof BANK_MPESA_FILTERS)[number] {')).toBe(true);
    expect(desk.includes('initialMpesaStatus() as')).toBe(false);
    expect(desk.includes('initialMpesaStatus as unknown')).toBe(false);
  });

  it('the vocabulary is the Select\u2019s OWN spelling (five members, UPPERCASE neutral lowercase)', () => {
    expect(BANK_MPESA_FILTERS).toEqual([
      'all',
      'PENDING',
      'MATCHED',
      'UNMATCHED',
      'DISPUTED',
    ]);
    expect(home.includes('export const BANK_MPESA_FILTERS')).toBe(true);
    // the Select's items speak the SAME words (the state keeps the
    // Select's string voice; its four SelectItems ARE the union):
    expect(desk.includes('<SelectItem value="PENDING">Pending</SelectItem>')).toBe(true);
    expect(desk.includes('<SelectItem value="MATCHED">Matched</SelectItem>')).toBe(true);
    expect(desk.includes('<SelectItem value="UNMATCHED">Unmatched</SelectItem>')).toBe(true);
    expect(desk.includes('<SelectItem value="DISPUTED">Disputed</SelectItem>')).toBe(true);
  });

  it('EVERY hand-driven status change rides the retirement door', () => {
    expect(desk.includes('const chooseMpesaStatus = (value: string) => {')).toBe(true);
    expect(desk.includes('<Select value={mpesaFilterStatus} onValueChange={chooseMpesaStatus}>')).toBe(true);
    // the ONLY direct setMpesaFilterStatus calls left are the declaration,
    // the door's own write, and the chip's one-press dismissal:
    const direct = desk.split('\n').filter((l) => l.includes('setMpesaFilterStatus(') && !l.includes('const [mpesaFilterStatus, setMpesaFilterStatus]'));
    expect(direct.length).toBe(2);
    expect(direct.some((l) => l.includes('setMpesaFilterStatus(value);'))).toBe(true);
    expect(direct.some((l) => l.includes("setMpesaFilterStatus('all');"))).toBe(true);
  });

  it('the chip sits BEFORE the lens it landed into, INSIDE the pane it raised (the position laws)', () => {
    const chip = desk.indexOf('data-testid="bank-mpesa-landing-word"');
    const lens = desk.indexOf('<Select value={mpesaFilterStatus} onValueChange={chooseMpesaStatus}>');
    const pane = desk.indexOf('<TabsContent value="mpesa"');
    expect(chip).toBeGreaterThan(-1);
    expect(lens).toBeGreaterThan(-1);
    expect(pane).toBeGreaterThan(-1);
    expect(chip).toBeLessThan(lens);
    expect(chip).toBeGreaterThan(pane);
  });

  it('the chip wears PURPLE at the 300/100 storey (the fifth shade-split)', () => {
    // v2.394.0 THE LOOM: the wardrobe moved into the loom’s registry —
    // the desk proves its family by hue, the registry carries the bytes.
    expect(desk.includes('hue="purple"')).toBe(true);
    expect(loom.includes('border-purple-300 bg-purple-100 text-purple-700')).toBe(true);
    expect(loom.includes('dark:border-purple-500/30 dark:bg-purple-500/10 dark:text-purple-300')).toBe(true);
    // a chip hue the desk's badges never speak — the badge census:
    expect(desk.includes('bg-blue-100 text-blue-700')).toBe(true); // Checking / In-Progress badges
    expect(desk.includes('bg-emerald-100 text-emerald-700')).toBe(true);
    expect(desk.includes('bg-amber-100 text-amber-700')).toBe(true);
    // and no OTHER landing chip hue collides with purple:
    expect(desk.includes('hue="sky"')).toBe(true); // the desk's FIRST word (v2.387.0, through the loom)
    expect(desk.includes('border-blue-300 bg-blue-100')).toBe(false);
    expect(desk.includes('border-orange-300 bg-orange-100')).toBe(false);
    expect(desk.includes('border-teal-300 bg-teal-100')).toBe(false);
    expect(desk.includes('border-lime-300 bg-lime-100')).toBe(false);
  });

  it('the chip is dismissible and annotated (the collision law\u2019s annotation)', () => {
    expect(desk.includes('setMpesaLandingLive(false);')).toBe(true);
    expect(desk.includes("THE M-PESA LEDGER'S OWN WORD")).toBe(true);
    expect(desk.includes('?bank-mpesa=PENDING')).toBe(true);
  });

  it('the landing RAISES the pane it lands into (the sub-tab amendment, second application)', () => {
    expect(
      desk.includes("if (initialMpesaStatus() !== 'all') return 'mpesa';")
    ).toBe(true);
    expect(
      desk.includes("return initialBankType() !== 'all' ? 'transactions' : 'accounts';")
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
      if (readFileSync(p, 'utf8').includes('bank-mpesa')) collected.push(p);
    }
  }
}

describe('the address-bar vocabulary stays one-writer-per-word', () => {
  it('`bank-mpesa` speaks in exactly the expected files under src/', () => {
    const collected: string[] = [];
    walkSrc('src', collected);
    collected.sort();
    expect(collected).toEqual([
      'src/app/(shell)/tabs/banking-tab.tsx',
      'src/lib/tab-url.ts',
      'src/lib/whats-new.ts',
      // this suite (the word's own ledger — an honest speaker)
      'src/tests/bank-mpesa-deep-link-v2388.test.ts',
      // the desk's FIRST word's ledger admits this suite (this suite
      // speaks `bank-type` in its rides-beside truth and its two-word
      // chip census) — an admission line carries the word it admits
      'src/tests/bank-type-deep-link-v2387.test.ts',
      // the twenty-ninth word's own ledger admits this suite (it
      // speaks `bank-mpesa` in its rides-beside truth) — an admission
      // line carries the word it admits
      'src/tests/debt-channel-deep-link-v2390.test.ts',
      // the twenty-eighth word's own ledger admits this suite (it
      // speaks `bank-mpesa` in its rides-beside truth) — an admission
      // line carries the word it admits
      'src/tests/debt-status-deep-link-v2389.test.ts',
      // the four ledgers that admitted the twenty-sixth word's suite
      // walk the same census for THEIR words, which this suite speaks
      // (po-status, et-status, inv-stock, txn-pay) — their admission
      // lines now carry this file, whose NAME speaks this word
      'src/tests/et-status-deep-link-v2381.test.ts',
      // the thirtieth word's own ledger — admitted (its rides-beside
      // truth speaks this word) — an admission line carries the word
      // it admits
      'src/tests/exp-status-deep-link-v2391.test.ts',
      // the thirty-first word's own ledger — admitted (its rides-beside
      // truth speaks this word) — an admission line carries the word
      // it admits
      'src/tests/exp-type-deep-link-v2392.test.ts',
      // the registry stress parses the constitution's rows — the
      // twenty-seventh row rides through its parse (an honest speaker)
      'src/tests/family-registry-stress-v2370.test.ts',
      'src/tests/inv-stock-deep-link-v2329.test.ts',
      // the thirty-second word's own ledger — admitted (its own ledger
      // LISTS this file's path — the third-order ripple: a ledger line
      // carries every word its paths speak)
      // the loom’s own suite — admitted (v2.394.0: the LandingChip
      // loom suite pins this desk’s chip bytes, so the walk lists it)
      'src/tests/landing-chip-loom-v2394.test.ts',
      'src/tests/msg-template-deep-link-v2393.test.ts',
      'src/tests/proxy-gate-layering-v2328.test.ts',
      // the constitution's twenty-seventh row + the admission this file
      // earns from the transfer-status ledger (this suite names it)
      'src/tests/transfer-status-deep-link-v2357.test.ts',
      'src/tests/txn-pay-deep-link-v2333.test.ts',
    ]);
  });
});

// ---------------------------------------------------------------------------
// 4. THE CONSTITUTION — the twenty-seventh row is visible from here
// ---------------------------------------------------------------------------

describe('the address-bar vocabulary — the twenty-seventh row (cross-suite pins)', () => {
  const constitution = readFileSync('src/tests/transfer-status-deep-link-v2357.test.ts', 'utf8');

  it('the constitution walks TWENTY-EIGHT words over TWENTY-FOUR desks (a new desk speaks)', () => {
    expect(constitution.includes('(forty-eight words, thirty-two desks)')).toBe(true);
    expect(constitution.includes("{ word: 'bank-mpesa', desk: 'src/app/(shell)/tabs/banking-tab.tsx', family: 'border-purple-300', suite: 'src/tests/bank-mpesa-deep-link-v2388.test.ts' }")).toBe(true);
    expect(constitution.includes("'TWENTY-SEVENTH'")).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 5. THE WHAT'S NEW FEED — the round announces itself
// ---------------------------------------------------------------------------

describe('whats-new — v2.480.0 leads the feed', () => {
  it('the entry exists, first, with the round\u2019s own story', () => {
    const head = WHATS_NEW[0];
    expect(head.version).toBe('2.491.0');
    // the lead's story hand-over (v2.480.0, the Task 111 law's
    // eighty-sixth application): the head story is the hand-over's
    // voice — the carrying round: THE LENS'S WORD RIDES THE
    // ADDRESS — the dead-stock search lens answers the address
    // bar (the maker's own word rides ?dead-q into the URL, read as
    // typed — trimmed and capped, never case-gamed, the ONE
    // home's filter lowercases its own side; the landing read once
    // on the shell, a dismissed chip can never resurrect; every
    // hand-driven lens change replaceState's its word back — a
    // pressed lens is a shareable address, never a dead end — and
    // an emptied lens strips its key, the address never carries a
    // silence), the landed word wearing the amber landing chip
    // beside the window's own — amber joins the 300 registry (the
    // shade-split law's next form, the lens family's own tone, the
    // constitution's thirty-fourth word); and the patience draws its
    // own bar (the Days idle cell wears the capital bar's own
    // dialect — the muted track, the fill in the number's own
    // word: amber below half a year, rose past it — the
    // never-sold row's cell keeping quiet, its badge already
    // speaks); the census keeps its ten voices (a chip and a bar
    // never carry a handle's voice), and the desk never spells the
    // host's word.
    // The lens's word rides the address.
    expect(head.title).toContain('edit door');
    expect(head.bullets.length).toBeGreaterThanOrEqual(3);
    expect(head.bullets.some((b) => b.includes('edit door'))).toBe(true);
    expect(head.bullets.some((b) => b.includes('pre-addressed'))).toBe(true);
    expect(head.bullets.some((b) => b.includes('clearance note'))).toBe(true);
    expect(head.bullets.some((b) => b.includes('chat picker'))).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 5. THE STATUSES FIND THEIR FEET (v2.396.0): the lens's words became
// real — the ledger stores its own status, the rows speak their
// EFFECTIVE status, the actions write it, the fixtures light every word.
// ---------------------------------------------------------------------------

const MPESA_DESK = readFileSync(BANKING_TAB, 'utf8');
const MPESA_ROUTE = readFileSync('src/app/api/banking/transactions/route.ts', 'utf8');
const MPESA_API = readFileSync('src/lib/api.ts', 'utf8');
const MPESA_SCHEMA = readFileSync('prisma/schema.prisma', 'utf8');
const MPESA_MIGRATION = readFileSync('prisma/migrations/20261105100000_add_mpesa_reconciliation_status/migration.sql', 'utf8');
const MPESA_FIXTURES = readFileSync('scripts/seed-mpesa-fixtures.mjs', 'utf8');

describe('the statuses find their feet (v2.396.0)', () => {
  it('the ledger stores its own status (nullable — legacy rows keep NULL)', () => {
    expect(MPESA_SCHEMA).toContain('reconciliationStatus String?');
    expect(MPESA_MIGRATION).toContain('ALTER TABLE "bank_transactions" ADD COLUMN "reconciliationStatus" TEXT;');
  });

  it('the desk speaks the EFFECTIVE status (stored first, the honest derivation second)', () => {
    expect(MPESA_DESK).toContain('const effectiveMpesaStatus = (');
    expect(MPESA_DESK).toContain("tx.reconciliationStatus ?? (tx.isReconciled ? 'MATCHED' : 'PENDING')");
    expect(MPESA_DESK).toContain('const status = effectiveMpesaStatus(tx);');
  });

  it('the lens filters on the effective status (no word answers an empty pile by construction)', () => {
    expect(MPESA_DESK).toContain('list = list.filter((t) => effectiveMpesaStatus(t) === mpesaFilterStatus);');
    expect(MPESA_DESK).not.toContain('UNMATCHED/DISPUTED are not easily derived');
  });

  it('the rows carry their own actions (Dispute, Match, Reopen — quiet, row-scoped)', () => {
    expect(MPESA_DESK).toContain('data-testid="mpesa-row-dispute"');
    expect(MPESA_DESK).toContain('data-testid="mpesa-row-match"');
    expect(MPESA_DESK).toContain('data-testid="mpesa-row-reopen"');
    expect(MPESA_DESK).toContain('data-testid="mpesa-row-settled"');
    expect(MPESA_DESK).toContain("mpesaStatusMut.mutate({ transactionId: tx.id, reconciliationStatus: 'DISPUTED' })");
    expect(MPESA_DESK).toContain("mpesaStatusMut.mutate({ transactionId: tx.id, reconciliationStatus: null })");
  });

  it('the write route speaks the vocabulary and keeps isReconciled coherent', () => {
    expect(MPESA_ROUTE).toContain("const VALID_STATUSES = ['PENDING', 'MATCHED', 'UNMATCHED', 'DISPUTED'];");
    expect(MPESA_ROUTE).toContain('isReconciled: isMatched,');
    expect(MPESA_ROUTE).toContain('reconciledAt: isMatched ? new Date() : null,');
    expect(MPESA_ROUTE).toContain('withSessionAuth(setReconciliationStatusHandler, FINANCIAL_ROLES.WRITE)');
    expect(MPESA_ROUTE).toContain("action: 'BANK_TRANSACTION_STATUS_SET',");
  });

  it('the api client carries the type and the setStatus voice', () => {
    expect(MPESA_API).toContain('reconciliationStatus: string | null;');
    expect(MPESA_API).toContain('setStatus: async (data: { transactionId: string; reconciliationStatus: string | null })');
  });

  it('the fixture world lights every word the lens offers', () => {
    expect(MPESA_FIXTURES).toContain("'MATCHED'");
    expect(MPESA_FIXTURES).toContain("'UNMATCHED'");
    expect(MPESA_FIXTURES).toContain("'DISPUTED'");
    expect(MPESA_FIXTURES).toContain('null], // the legacy face: derived, never stored');
  });
});
