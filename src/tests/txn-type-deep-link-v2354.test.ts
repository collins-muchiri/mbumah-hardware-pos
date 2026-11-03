// THE TYPE LENS'S OWN WORD (v2.354.0): the transactions desk's type lens
// answers the address bar.
//
// v2.328.0 gave the purchase-orders roster its STATUS word (`?po-status=`),
// v2.329.0 kept the promise on the inventory desk (`?inv-stock=`),
// v2.330.0 on the customers desk (`?cust-debt=`), v2.331.0 on the
// suppliers desk (`?sup-status=`), v2.332.0 on that desk's PO section
// (`?sup-po=`) and v2.333.0 on the transactions desk's payment-method
// lens (`?txn-pay=`). THE PROMISE KEPT A SIXTH TIME — and the first time
// a desk owns TWO words of the vocabulary: the transactions desk's type
// lens speaks its desk-prefixed `?txn-type=all|sale|refund|void` and
// wears the landing chip in the lens's own fuchsia (the SEVENTH family
// of the vocabulary — indigo/amber/rose/emerald/cyan/violet now gain the
// type lens's fuchsia; the census voice keeps its sky — a voice must not
// masquerade as a badge). The vocabulary's INVERSE case voice: the
// payment word is UPPERCASE, the type word is lowercase — each lens's
// own words, never a clever match.
//
// Pins: the parser's truth table (pure, lowercase vocabulary), the
// desk's seed bytes and its cast-free typing (the generic parser IS the
// union), the chip's bytes and its two retirement voices, the one-home
// promise (the law's doc carries the seventh word), and the collision
// ledger (which files may speak the word at all).

import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { parseInitialNamedMember } from '@/lib/tab-url';

const TXN_TYPE_FILTERS = ['all', 'sale', 'refund', 'void'] as const;

// ---------------------------------------------------------------------------
// 1. THE PARSER'S TRUTH TABLE (the membership law, one home, lowercase voice)
// ---------------------------------------------------------------------------

describe('parseInitialNamedMember — the type lens speaks the one home', () => {
  it('a lens the desk offers seeds the filter', () => {
    expect(parseInitialNamedMember('?txn-type=sale', 'txn-type', TXN_TYPE_FILTERS, 'all')).toBe('sale');
    expect(parseInitialNamedMember('?txn-type=refund', 'txn-type', TXN_TYPE_FILTERS, 'all')).toBe('refund');
    expect(parseInitialNamedMember('?txn-type=void', 'txn-type', TXN_TYPE_FILTERS, 'all')).toBe('void');
  });

  it('a lens the desk does not offer answers the fallback (never stranded)', () => {
    expect(parseInitialNamedMember('?txn-type=exchange', 'txn-type', TXN_TYPE_FILTERS, 'all')).toBe('all');
    expect(parseInitialNamedMember('?txn-type=', 'txn-type', TXN_TYPE_FILTERS, 'all')).toBe('all');
  });

  it('case-sensitive: an UPPERCASE word is an unknown word, not a clever match', () => {
    // the lens's own words are lowercase — `REFUND` names nothing
    // (the INVERSE voice of the UPPERCASE payment word, v2.333.0)
    expect(parseInitialNamedMember('?txn-type=REFUND', 'txn-type', TXN_TYPE_FILTERS, 'all')).toBe('all');
    expect(parseInitialNamedMember('?txn-type=Sale', 'txn-type', TXN_TYPE_FILTERS, 'all')).toBe('all');
    expect(parseInitialNamedMember('?txn-type=ALL', 'txn-type', TXN_TYPE_FILTERS, 'all')).toBe('all');
  });

  it('missing, bare, and malformed searches answer the fallback — never throw', () => {
    expect(parseInitialNamedMember('', 'txn-type', TXN_TYPE_FILTERS, 'all')).toBe('all');
    expect(parseInitialNamedMember('?tab=transactions', 'txn-type', TXN_TYPE_FILTERS, 'all')).toBe('all');
    expect(parseInitialNamedMember('txn-type=refund', 'txn-type', TXN_TYPE_FILTERS, 'all')).toBe('refund');
    expect(parseInitialNamedMember('?????', 'txn-type', TXN_TYPE_FILTERS, 'all')).toBe('all');
    expect(parseInitialNamedMember('?txn-type=sale&page=2', 'txn-type', TXN_TYPE_FILTERS, 'all')).toBe('sale');
  });

  it('the word rides alongside the desk\u2019s other words without collision', () => {
    // a landing can carry the desk AND both of its lenses AND the
    // neighbors' words — one bar, two words, one desk
    expect(
      parseInitialNamedMember('?tab=transactions&txn-type=refund&txn-pay=CASH', 'txn-type', TXN_TYPE_FILTERS, 'all')
    ).toBe('refund');
    expect(
      parseInitialNamedMember('?tab=transactions&txn-type=sale&po-status=PENDING_APPROVAL', 'txn-type', TXN_TYPE_FILTERS, 'all')
    ).toBe('sale');
    expect(
      parseInitialNamedMember('?tab=transactions&txn-type=void&cust-debt=overdue', 'txn-type', TXN_TYPE_FILTERS, 'all')
    ).toBe('void');
    expect(
      parseInitialNamedMember('?tab=transactions&txn-type=refund&sup-po=SENT&inv-stock=low', 'txn-type', TXN_TYPE_FILTERS, 'all')
    ).toBe('refund');
  });
});

// ---------------------------------------------------------------------------
// 2. THE DESK'S SEED — read-on-mount, one home, never a copy, never a cast
// ---------------------------------------------------------------------------

describe('the transactions desk — ?txn-type= lands as visible state', () => {
  const desk = readFileSync('src/app/(shell)/tabs/transactions-tab.tsx', 'utf8');
  const home = readFileSync('src/lib/tab-url.ts', 'utf8');

  it('the seed reads the word through the ONE home (never a local parser)', () => {
    expect(desk.includes("import { parseInitialNamedMember } from '@/lib/tab-url';")).toBe(true);
    expect(
      desk.includes("parseInitialNamedMember(window.location.search, 'txn-type', TXN_TYPE_FILTERS, 'all')")
    ).toBe(true);
    // the home owns the law and carries the seventh-word note
    expect(home.includes('export function parseInitialNamedMember')).toBe(true);
    expect(home.includes('v2.354.0 — THE PROMISE KEPT, THE SEVENTH WORD')).toBe(true);
  });

  it('the seed is the lazy initializer of the type filter (read-on-mount law)', () => {
    expect(desk.includes("const [typeFilter, setTypeFilter] = useState<'all' | TransactionType>(initialTxnType);")).toBe(true);
    // the SSR guard answers 'all' before any window exists
    expect(desk.includes("if (typeof window === 'undefined') return 'all';")).toBe(true);
    // the desk offers exactly the lenses it names
    expect(desk.includes("export const TXN_TYPE_FILTERS = ['all', 'sale', 'refund', 'void'] as const;")).toBe(true);
  });

  it('the seed is CAST-FREE — the generic parser IS the union', () => {
    // the parser is generic over V; the `as const` keyset IS the
    // `'all' | TransactionType` union, so the seed names it directly —
    // no cast, no widening, the honest typing the census map already speaks
    expect(desk.includes('function initialTxnType(): (typeof TXN_TYPE_FILTERS)[number]')).toBe(true);
    expect(desk.includes('useState<(typeof TXN_TYPE_FILTERS)[number]>(initialTxnType)')).toBe(true);
    // and no laundering snuck in around the new word
    expect(desk.includes('initialTxnType() as')).toBe(false);
    expect(desk.includes('initialTxnType as unknown')).toBe(false);
  });

  it('the word is desk-prefixed (the Task 44 collision law) and annotated', () => {
    expect(desk.includes("THE TYPE LENS'S OWN WORD")).toBe(true);
    expect(desk.includes('?txn-type=refund')).toBe(true);
    // the collision note lives with the word
    expect(desk.includes('Collision-checked at round start')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 3. THE LANDING CHIP — the lens answers OUT LOUD, in its own fuchsia
// ---------------------------------------------------------------------------

describe('the landing chip — the face names the word it answered', () => {
  const desk = readFileSync('src/app/(shell)/tabs/transactions-tab.tsx', 'utf8');

  it('the chip renders only while the landing is live AND untouched', () => {
    expect(
      desk.includes("txnTypeLandingLive && landedTxnType !== 'all' && typeFilter === landedTxnType")
    ).toBe(true);
    expect(desk.includes('data-testid="txn-type-landing-word"')).toBe(true);
  });

  it('the chip names the exact word it answered', () => {
    expect(desk.includes('landed ?txn-type={landedTxnType}')).toBe(true);
  });

  it('voice 1 — the dismissal clears the lens the word seeded and retires', () => {
    const at = desk.indexOf('data-testid="txn-type-landing-word"');
    const block = desk.slice(at, at + 400);
    expect(block).toContain("setTypeFilter('all')");
    expect(block).toContain('setTxnTypeLandingLive(false)');
  });

  it('voice 2 — a hand-driven census-chip press retires the chip', () => {
    expect(desk.includes('onClick={() => chooseTxnType(type)}')).toBe(true);
    expect(desk.includes('a hand-driven change retires the landing word')).toBe(true);
  });

  it('the voices are honest — the desk claims exactly the two it has', () => {
    // the type lens has no Select and no reset button; the chip's own
    // comment names the two voices and no more (pin the SOURCE bytes)
    expect(desk.includes("hand-driven census chip or the chip's own dismissal")).toBe(true);
  });

  it('the chip wears the lens\u2019s fuchsia family in BOTH modes', () => {
    expect(desk.includes('border-fuchsia-200 bg-fuchsia-50 text-fuchsia-700')).toBe(true);
    expect(desk.includes('dark:border-fuchsia-500/30 dark:bg-fuchsia-500/10 dark:text-fuchsia-300')).toBe(true);
  });

  it('the dismiss hint sharpens on hover (the group-hover detail)', () => {
    expect(desk.includes('opacity-60 transition-opacity group-hover:opacity-100')).toBe(true);
  });

  it('the chip explains itself (the tooltip law)', () => {
    expect(desk.includes('title="The desk landed with this filter from the address bar — press to clear it"')).toBe(true);
    expect(desk.includes('aria-hidden="true"')).toBe(true);
  });

  it('the census row keeps its sky voice beside the chip (no masquerade)', () => {
    // the two voices share one bar and never borrow each other's family
    expect(desk.includes('data-testid="txn-type-census"')).toBe(true);
    expect(desk.includes('data-testid="txn-type-lens-voice"')).toBe(true);
    expect(desk.includes('border-sky-200 bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700')).toBe(true);
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
      if (readFileSync(p, 'utf8').includes('txn-type')) collected.push(p);
    }
  }
}

describe('the address-bar vocabulary stays one-writer-per-word', () => {
  it('`txn-type` speaks in exactly the expected files under src/', () => {
    const collected: string[] = [];
    walkSrc('src', collected);
    collected.sort();
    expect(collected).toEqual([
      'src/app/(shell)/tabs/transactions-tab.tsx',
      'src/lib/tab-url.ts',
      'src/lib/whats-new.ts',
      // the eight neighbor ledgers admitted this test file — and an
      // admission line carries the word it admits (the LEDGER-CITATION
      // RIPPLE: a ledger is an honest speaker of every word it lists)
      'src/tests/ad-severity-deep-link-v2366.test.ts',
      'src/tests/cat-stock-deep-link-v2364.test.ts',
      'src/tests/cr-type-deep-link-v2361.test.ts',
      'src/tests/cust-debt-deep-link-v2330.test.ts',
      'src/tests/cv-type-deep-link-v2363.test.ts',
      'src/tests/dn-status-deep-link-v2359.test.ts',
      // v2.353.0's registry pinned the census testids, whose substring
      // carries this word — the honest speaker joins (the same ripple)
      'src/tests/door-shape-registry-v2353.test.ts',
      'src/tests/dp-status-deep-link-v2365.test.ts',
      'src/tests/family-registry-stress-v2370.test.ts',
      'src/tests/gc-status-deep-link-v2358.test.ts',
      'src/tests/inv-status-deep-link-v2356.test.ts',
      'src/tests/inv-stock-deep-link-v2329.test.ts',
      'src/tests/ly-type-deep-link-v2368.test.ts',
      'src/tests/pr-status-deep-link-v2362.test.ts',
      'src/tests/proxy-gate-layering-v2328.test.ts',
      // v2.355.0: the rentals desk's status lens joins the vocabulary — its
      // deep-link suite is admitted (an admission line carries the word it
      // admits — the LEDGER-CITATION RIPPLE, second-order form)
      'src/tests/rent-status-deep-link-v2355.test.ts',
      'src/tests/sec-type-deep-link-v2367.test.ts',
      'src/tests/sup-po-deep-link-v2332.test.ts',
      'src/tests/sup-status-deep-link-v2331.test.ts',
      'src/tests/transfer-status-deep-link-v2357.test.ts',
      // the v2.371.0 kind suite pins the lens's composition (the refund
      // rows come home) — the ledger is the honest speaker here
      'src/tests/txn-kind-v2371.test.ts',
      'src/tests/txn-pay-deep-link-v2333.test.ts',
      'src/tests/txn-type-deep-link-v2354.test.ts',
      'src/tests/vc-status-deep-link-v2360.test.ts',
    ]);
  });

  it('the home\u2019s older words stay untouched (the shape law, the gait law)', () => {
    const home = readFileSync('src/lib/tab-url.ts', 'utf8');
    expect(home.includes('export function parseInitialNamedPage')).toBe(true);
    expect(home.includes('export function parseInitialNamedMember')).toBe(true);
  });
});
