// THE LEDGER'S OWN WORD (v2.333.0): the transactions desk's payment-method
// lens answers the address bar.
//
// v2.328.0 gave the purchase-orders roster its STATUS word (`?po-status=`),
// v2.329.0 kept the promise on the inventory desk (`?inv-stock=`),
// v2.330.0 on the customers desk (`?cust-debt=`), v2.331.0 on the
// suppliers desk (`?sup-status=`) and v2.332.0 on that desk's PO section
// (`?sup-po=`). THE PROMISE KEPT A FIFTH TIME — and the first time the
// desk's filter face is QUICK CHIPS, not a Select: the transactions
// desk's payment-method lens inherits the law instead of a copy — it
// speaks its desk-prefixed `?txn-pay=all|CASH|MPESA|DEBT` and wears the
// landing chip in the lens's own violet (the sixth family of the
// vocabulary — indigo/amber/rose/emerald/cyan now gain the ledger's
// violet), with TWO honest retirement voices (chip dismissal,
// hand-driven quick chip — the desk has no Select and no reset button
// for this lens, and an honest face never claims voices it does not
// have). The chip hand-off is now proven on a Select face AND a chip
// face.
//
// Pins: the parser's truth table (pure, UPPERCASE vocabulary), the
// desk's seed bytes, the chip's bytes and its two retirement voices,
// the one-home promise (the law's doc carries the sixth word), and the
// collision ledger (which files may speak the word at all).

import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { parseInitialNamedMember } from '@/lib/tab-url';

const TXN_PAY_FILTERS = ['all', 'CASH', 'MPESA', 'DEBT'] as const;

// ---------------------------------------------------------------------------
// 1. THE PARSER'S TRUTH TABLE (the membership law, one home, UPPERCASE voice)
// ---------------------------------------------------------------------------

describe('parseInitialNamedMember — the payment lens speaks the one home', () => {
  it('a lens the desk offers seeds the filter', () => {
    expect(parseInitialNamedMember('?txn-pay=CASH', 'txn-pay', TXN_PAY_FILTERS, 'all')).toBe('CASH');
    expect(parseInitialNamedMember('?txn-pay=MPESA', 'txn-pay', TXN_PAY_FILTERS, 'all')).toBe('MPESA');
    expect(parseInitialNamedMember('?txn-pay=DEBT', 'txn-pay', TXN_PAY_FILTERS, 'all')).toBe('DEBT');
  });

  it('a lens the desk does not offer answers the fallback (never stranded)', () => {
    expect(parseInitialNamedMember('?txn-pay=CARD', 'txn-pay', TXN_PAY_FILTERS, 'all')).toBe('all');
    expect(parseInitialNamedMember('?txn-pay=', 'txn-pay', TXN_PAY_FILTERS, 'all')).toBe('all');
  });

  it('case-sensitive: a lowercase word is an unknown word, not a clever match', () => {
    // the lens's own words are UPPERCASE — `cash` names nothing
    // (the inverse voice, the uppercase gait)
    expect(parseInitialNamedMember('?txn-pay=cash', 'txn-pay', TXN_PAY_FILTERS, 'all')).toBe('all');
    expect(parseInitialNamedMember('?txn-pay=Cash', 'txn-pay', TXN_PAY_FILTERS, 'all')).toBe('all');
    expect(parseInitialNamedMember('?txn-pay=ALL', 'txn-pay', TXN_PAY_FILTERS, 'all')).toBe('all');
  });

  it('missing, bare, and malformed searches answer the fallback — never throw', () => {
    expect(parseInitialNamedMember('', 'txn-pay', TXN_PAY_FILTERS, 'all')).toBe('all');
    expect(parseInitialNamedMember('?tab=transactions', 'txn-pay', TXN_PAY_FILTERS, 'all')).toBe('all');
    expect(parseInitialNamedMember('txn-pay=CASH', 'txn-pay', TXN_PAY_FILTERS, 'all')).toBe('CASH');
    expect(parseInitialNamedMember('?????', 'txn-pay', TXN_PAY_FILTERS, 'all')).toBe('all');
    expect(parseInitialNamedMember('?txn-pay=CASH&page=2', 'txn-pay', TXN_PAY_FILTERS, 'all')).toBe('CASH');
  });

  it('the word rides alongside the desk\u2019s other words without collision', () => {
    // a landing can carry the desk AND the lens AND the neighbors' words
    expect(
      parseInitialNamedMember('?tab=transactions&txn-pay=CASH&view=transactions', 'txn-pay', TXN_PAY_FILTERS, 'all')
    ).toBe('CASH');
    expect(
      parseInitialNamedMember('?tab=transactions&txn-pay=MPESA&po-status=PENDING_APPROVAL', 'txn-pay', TXN_PAY_FILTERS, 'all')
    ).toBe('MPESA');
    expect(
      parseInitialNamedMember('?tab=transactions&txn-pay=DEBT&cust-debt=overdue', 'txn-pay', TXN_PAY_FILTERS, 'all')
    ).toBe('DEBT');
    expect(
      parseInitialNamedMember('?tab=transactions&txn-pay=CASH&sup-po=SENT', 'txn-pay', TXN_PAY_FILTERS, 'all')
    ).toBe('CASH');
  });
});

// ---------------------------------------------------------------------------
// 2. THE DESK'S SEED — read-on-mount, one home, never a copy
// ---------------------------------------------------------------------------

describe('the transactions desk — ?txn-pay= lands as visible state', () => {
  const desk = readFileSync('src/app/(shell)/tabs/transactions-tab.tsx', 'utf8');
  const home = readFileSync('src/lib/tab-url.ts', 'utf8');

  it('the seed reads the word through the ONE home (never a local parser)', () => {
    expect(desk.includes("import { parseInitialNamedMember } from '@/lib/tab-url';")).toBe(true);
    expect(
      desk.includes("parseInitialNamedMember(window.location.search, 'txn-pay', TXN_PAY_FILTERS, 'all')")
    ).toBe(true);
    // the home owns the law and carries the sixth-word note
    expect(home.includes('export function parseInitialNamedMember')).toBe(true);
    expect(home.includes('v2.333.0 — THE PROMISE KEPT, THE SIXTH WORD')).toBe(true);
  });

  it('the seed is the lazy initializer of the payment filter (read-on-mount law)', () => {
    expect(desk.includes('const [paymentFilter, setPaymentFilter] = useState<string>(initialTxnPay);')).toBe(true);
    // the SSR guard answers 'all' before any window exists
    expect(desk.includes("if (typeof window === 'undefined') return 'all';")).toBe(true);
    // the desk offers exactly the lenses it names
    expect(desk.includes("export const TXN_PAY_FILTERS = ['all', 'CASH', 'MPESA', 'DEBT'] as const;")).toBe(true);
  });

  it('the word is desk-prefixed (the Task 44 collision law) and annotated', () => {
    expect(desk.includes("THE LEDGER'S OWN WORD")).toBe(true);
    expect(desk.includes('?txn-pay=CASH')).toBe(true);
    // the collision note lives with the word
    expect(desk.includes('Collision-checked at round start')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 3. THE LANDING CHIP — the lens answers OUT LOUD, in its own violet
// ---------------------------------------------------------------------------

describe('the landing chip — the face names the word it answered', () => {
  const desk = readFileSync('src/app/(shell)/tabs/transactions-tab.tsx', 'utf8');

  it('the chip renders only while the landing is live AND untouched', () => {
    expect(
      desk.includes("txnLandingLive && landedTxnPay !== 'all' && paymentFilter === landedTxnPay")
    ).toBe(true);
    expect(desk.includes('data-testid="txn-landing-word"')).toBe(true);
  });

  it('the chip names the exact word it answered', () => {
    expect(desk.includes('landed ?txn-pay={landedTxnPay}')).toBe(true);
  });

  it('voice 1 — the dismissal clears the lens the word seeded and retires', () => {
    const at = desk.indexOf('data-testid="txn-landing-word"');
    const block = desk.slice(at, at + 400);
    expect(block).toContain("setPaymentFilter('all')");
    expect(block).toContain('setTxnLandingLive(false)');
  });

  it('voice 2 — a hand-driven quick-chip press retires the chip', () => {
    expect(desk.includes('onClick={() => chooseTxnPay(method)}')).toBe(true);
    expect(desk.includes('a hand-driven change retires the landing word')).toBe(true);
  });

  it('the voices are honest — the desk claims exactly the two it has', () => {
    // the desk has no Select and no reset button for this lens; the
    // chip's own comment names the two voices and no more (the desk's
    // apostrophes are straight — pin the SOURCE bytes)
    expect(desk.includes("a hand-driven quick chip or\n                the chip's own dismissal")).toBe(true);
  });

  it('the chip wears the lens\u2019s violet family in BOTH modes', () => {
    expect(desk.includes('border-violet-200 bg-violet-50 text-violet-700')).toBe(true);
    expect(desk.includes('dark:border-violet-500/30 dark:bg-violet-500/10 dark:text-violet-300')).toBe(true);
  });

  it('the chip explains itself (the tooltip law)', () => {
    expect(desk.includes('title="The desk landed with this filter from the address bar — press to clear it"')).toBe(true);
    expect(desk.includes('aria-hidden="true"')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 4. THE COLLISION LEDGER — which files may speak the word at all
// ---------------------------------------------------------------------------

function walkSrc(dir: string, collected: string[]): void {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    const st = statSync(p);
    if (st.isDirectory()) {
      if (entry === 'node_modules' || entry === '.next') continue;
      walkSrc(p, collected);
    } else if (/\.(ts|tsx|mjs|js)$/.test(entry)) {
      if (readFileSync(p, 'utf8').includes('txn-pay')) collected.push(p);
    }
  }
}

describe('the address-bar vocabulary stays one-writer-per-word', () => {
  it('`txn-pay` speaks in exactly the expected files under src/', () => {
    const collected: string[] = [];
    walkSrc('src', collected);
    collected.sort();
    expect(collected).toEqual([
      'src/app/(shell)/tabs/transactions-tab.tsx',
      'src/lib/tab-url.ts',
      'src/lib/whats-new.ts',
      'src/tests/cust-debt-deep-link-v2330.test.ts',
      'src/tests/inv-stock-deep-link-v2329.test.ts',
      'src/tests/proxy-gate-layering-v2328.test.ts',
      'src/tests/sup-po-deep-link-v2332.test.ts',
      'src/tests/sup-status-deep-link-v2331.test.ts',
      'src/tests/txn-pay-deep-link-v2333.test.ts',
    ]);
  });

  it('the home\u2019s older words stay untouched (the shape law, the gait law)', () => {
    const home = readFileSync('src/lib/tab-url.ts', 'utf8');
    expect(home.includes('export function parseInitialNamedPage')).toBe(true);
    expect(home.includes('export function parseInitialNamedMember')).toBe(true);
  });
});
