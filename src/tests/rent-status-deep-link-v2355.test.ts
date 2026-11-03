// THE RENTAL DESK'S OWN WORD (v2.355.0): the rentals desk's status lens
// answers the address bar.
//
// v2.328.0 gave the purchase-orders roster its STATUS word (`?po-status=`),
// v2.329.0 kept the promise on the inventory desk (`?inv-stock=`),
// v2.330.0 on the customers desk (`?cust-debt=`), v2.331.0 on the
// suppliers desk (`?sup-status=`), v2.332.0 on that desk's PO section
// (`?sup-po=`), v2.333.0 on the transactions desk's payment-method lens
// (`?txn-pay=`) and v2.354.0 on that desk's type lens (`?txn-type=`).
// THE PROMISE KEPT AN EIGHTH TIME — the rentals desk's status lens speaks
// its desk-prefixed `?rent-status=all|ACTIVE|OVERDUE|RETURNED|DAMAGED`
// and wears the landing chip in the lens's own orange (the EIGHTH family
// of the vocabulary — indigo/amber/rose/emerald/cyan/violet/fuchsia now
// gain the rental lens's orange, the overdue-warning hue; amber's
// neighbor lives on the inventory desk, the two never share a bar). The
// desk's DAILY QUESTION — "what is late?" — becomes a bookmark. The
// vocabulary's UPPERCASE voice again: the lens's own words are UPPERCASE
// (the payment word's voice, not the type word's), so a lowercase word
// names nothing — never a clever match.
//
// Pins: the parser's truth table (pure, UPPERCASE vocabulary), the
// desk's seed bytes and its cast-free typing (the generic parser IS the
// union), the chip's bytes and its two retirement voices (dismissal +
// the hand-driven Select), the one-home promise (the law's doc carries
// the eighth word), and the collision ledger (which files may speak the
// word at all).

import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { parseInitialNamedMember } from '@/lib/tab-url';

const RENT_STATUS_FILTERS = ['all', 'ACTIVE', 'OVERDUE', 'RETURNED', 'DAMAGED'] as const;

// ---------------------------------------------------------------------------
// 1. THE PARSER'S TRUTH TABLE (the membership law, one home, UPPERCASE voice)
// ---------------------------------------------------------------------------

describe('parseInitialNamedMember — the status lens speaks the one home', () => {
  it('a lens the desk offers seeds the filter', () => {
    expect(parseInitialNamedMember('?rent-status=ACTIVE', 'rent-status', RENT_STATUS_FILTERS, 'all')).toBe('ACTIVE');
    expect(parseInitialNamedMember('?rent-status=OVERDUE', 'rent-status', RENT_STATUS_FILTERS, 'all')).toBe('OVERDUE');
    expect(parseInitialNamedMember('?rent-status=RETURNED', 'rent-status', RENT_STATUS_FILTERS, 'all')).toBe('RETURNED');
    expect(parseInitialNamedMember('?rent-status=DAMAGED', 'rent-status', RENT_STATUS_FILTERS, 'all')).toBe('DAMAGED');
  });

  it('a lens the desk does not offer answers the fallback (never stranded)', () => {
    expect(parseInitialNamedMember('?rent-status=LOST', 'rent-status', RENT_STATUS_FILTERS, 'all')).toBe('all');
    expect(parseInitialNamedMember('?rent-status=', 'rent-status', RENT_STATUS_FILTERS, 'all')).toBe('all');
  });

  it('case-sensitive: a lowercase word is an unknown word, not a clever match', () => {
    // the lens's own words are UPPERCASE — `overdue` names nothing
    // (the payment word's voice; the INVERSE of the lowercase type word)
    expect(parseInitialNamedMember('?rent-status=overdue', 'rent-status', RENT_STATUS_FILTERS, 'all')).toBe('all');
    expect(parseInitialNamedMember('?rent-status=Active', 'rent-status', RENT_STATUS_FILTERS, 'all')).toBe('all');
    expect(parseInitialNamedMember('?rent-status=ALL', 'rent-status', RENT_STATUS_FILTERS, 'all')).toBe('all');
  });

  it('missing, bare, and malformed searches answer the fallback — never throw', () => {
    expect(parseInitialNamedMember('', 'rent-status', RENT_STATUS_FILTERS, 'all')).toBe('all');
    expect(parseInitialNamedMember('?tab=rentals', 'rent-status', RENT_STATUS_FILTERS, 'all')).toBe('all');
    expect(parseInitialNamedMember('rent-status=OVERDUE', 'rent-status', RENT_STATUS_FILTERS, 'all')).toBe('OVERDUE');
    expect(parseInitialNamedMember('?????', 'rent-status', RENT_STATUS_FILTERS, 'all')).toBe('all');
    expect(parseInitialNamedMember('?rent-status=OVERDUE&page=2', 'rent-status', RENT_STATUS_FILTERS, 'all')).toBe('OVERDUE');
  });

  it('the word rides alongside the vocabulary\u2019s other words without collision', () => {
    // a landing can carry the desk AND its lens AND the neighbors' words
    // — one bar, one word per lens, every lens its own
    expect(
      parseInitialNamedMember('?tab=rentals&rent-status=OVERDUE&txn-pay=CASH', 'rent-status', RENT_STATUS_FILTERS, 'all')
    ).toBe('OVERDUE');
    expect(
      parseInitialNamedMember('?tab=rentals&rent-status=ACTIVE&txn-type=refund', 'rent-status', RENT_STATUS_FILTERS, 'all')
    ).toBe('ACTIVE');
    expect(
      parseInitialNamedMember('?tab=rentals&rent-status=RETURNED&po-status=PENDING_APPROVAL&inv-stock=low', 'rent-status', RENT_STATUS_FILTERS, 'all')
    ).toBe('RETURNED');
    expect(
      parseInitialNamedMember('?tab=rentals&rent-status=DAMAGED&cust-debt=overdue&sup-status=ACTIVE&sup-po=SENT', 'rent-status', RENT_STATUS_FILTERS, 'all')
    ).toBe('DAMAGED');
  });
});

// ---------------------------------------------------------------------------
// 2. THE DESK'S SEED — read-on-mount, one home, never a copy, never a cast
// ---------------------------------------------------------------------------

describe('the rentals desk — ?rent-status= lands as visible state', () => {
  const desk = readFileSync('src/app/(shell)/tabs/rentals-tab.tsx', 'utf8');
  const home = readFileSync('src/lib/tab-url.ts', 'utf8');

  it('the seed reads the word through the ONE home (never a local parser)', () => {
    expect(desk.includes("import { parseInitialNamedMember } from '@/lib/tab-url';")).toBe(true);
    expect(
      desk.includes("parseInitialNamedMember(window.location.search, 'rent-status', RENT_STATUS_FILTERS, 'all')")
    ).toBe(true);
    // the home owns the law and carries the eighth-word note
    expect(home.includes('export function parseInitialNamedMember')).toBe(true);
    expect(home.includes('v2.355.0 — THE PROMISE KEPT, THE EIGHTH WORD')).toBe(true);
  });

  it('the seed is the lazy initializer of the status filter (read-on-mount law)', () => {
    expect(
      desk.includes('const [statusFilter, setStatusFilter] = useState<(typeof RENT_STATUS_FILTERS)[number]>(initialRentStatus);')
    ).toBe(true);
    // the SSR guard answers 'all' before any window exists
    expect(desk.includes("if (typeof window === 'undefined') return 'all';")).toBe(true);
    // the desk offers exactly the lenses it names
    expect(
      desk.includes("export const RENT_STATUS_FILTERS = ['all', 'ACTIVE', 'OVERDUE', 'RETURNED', 'DAMAGED'] as const;")
    ).toBe(true);
  });

  it('the seed is CAST-FREE — the generic parser IS the union', () => {
    // the parser is generic over V; the `as const` keyset IS the lens's
    // union, so the seed names it directly — no cast, no widening
    expect(desk.includes('function initialRentStatus(): (typeof RENT_STATUS_FILTERS)[number]')).toBe(true);
    expect(desk.includes('useState<(typeof RENT_STATUS_FILTERS)[number]>(initialRentStatus)')).toBe(true);
    // and no laundering snuck in around the new word
    expect(desk.includes('initialRentStatus() as')).toBe(false);
    expect(desk.includes('initialRentStatus as unknown')).toBe(false);
  });

  it('the word is desk-prefixed (the Task 44 collision law) and annotated', () => {
    expect(desk.includes("THE RENTAL DESK'S OWN WORD")).toBe(true);
    expect(desk.includes('?rent-status=OVERDUE')).toBe(true);
    // the collision note lives with the word
    expect(desk.includes('Collision-checked at round start')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 3. THE LANDING CHIP — the lens answers OUT LOUD, in its own orange
// ---------------------------------------------------------------------------

describe('the landing chip — the face names the word it answered', () => {
  const desk = readFileSync('src/app/(shell)/tabs/rentals-tab.tsx', 'utf8');

  it('the chip renders only while the landing is live AND untouched', () => {
    expect(
      desk.includes("rentLandingLive && landedRentStatus !== 'all' && statusFilter === landedRentStatus")
    ).toBe(true);
    expect(desk.includes('data-testid="rent-status-landing-word"')).toBe(true);
  });

  it('the chip names the exact word it answered', () => {
    expect(desk.includes('landed ?rent-status={landedRentStatus}')).toBe(true);
  });

  it('voice 1 — the dismissal clears the lens the word seeded and retires', () => {
    const at = desk.indexOf('data-testid="rent-status-landing-word"');
    const block = desk.slice(at, at + 400);
    expect(block).toContain("setStatusFilter('all')");
    expect(block).toContain('setRentLandingLive(false)');
  });

  it('voice 2 — a hand-driven Select change retires the chip', () => {
    expect(desk.includes('<Select value={statusFilter} onValueChange={chooseRentStatus}>')).toBe(true);
    expect(desk.includes('a hand-driven change retires the landing word')).toBe(true);
  });

  it('the voices are honest — the desk claims exactly the two it has', () => {
    // the status lens has no census chips and no quick-chip row; the
    // chip's own comment names the two voices and no more (pin the SOURCE
    // bytes)
    expect(desk.includes("hand-driven Select change or the chip's own dismissal")).toBe(true);
  });

  it('the chip wears the lens\u2019s orange family in BOTH modes', () => {
    expect(desk.includes('border-orange-200 bg-orange-50 text-orange-700')).toBe(true);
    expect(desk.includes('dark:border-orange-500/30 dark:bg-orange-500/10 dark:text-orange-300')).toBe(true);
  });

  it('the dismiss hint sharpens on hover (the group-hover detail)', () => {
    expect(desk.includes('opacity-60 transition-opacity group-hover:opacity-100')).toBe(true);
  });

  it('the chip explains itself (the tooltip law)', () => {
    expect(desk.includes('title="The desk landed with this filter from the address bar — press to clear it"')).toBe(true);
    expect(desk.includes('aria-hidden="true"')).toBe(true);
  });

  it('the Select keeps its own face beside the chip (no masquerade)', () => {
    // the lens's Select is the desk's own control and borrows nothing
    // from the chip's family — the chip wears orange, the Select stays
    // the shadcn voice it always was
    expect(desk.includes('<SelectTrigger className="w-48"><SelectValue placeholder="All Statuses" /></SelectTrigger>')).toBe(true);
    expect(desk.includes('border-orange-200 bg-orange-50 text-orange-700 text-xs font-medium')).toBe(true);
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
      if (readFileSync(p, 'utf8').includes('rent-status')) collected.push(p);
    }
  }
}

describe('the address-bar vocabulary stays one-writer-per-word', () => {
  it('`rent-status` speaks in exactly the expected files under src/', () => {
    const collected: string[] = [];
    walkSrc('src', collected);
    collected.sort();
    expect(collected).toEqual([
      'src/app/(shell)/tabs/rentals-tab.tsx',
      'src/lib/tab-url.ts',
      'src/lib/whats-new.ts',
      // the nine neighbor ledgers admitted this test file — and an
      // admission line carries the word it admits (the LEDGER-CITATION
      // RIPPLE: a ledger is an honest speaker of every word it lists)
      'src/tests/ad-severity-deep-link-v2366.test.ts',
      'src/tests/cat-stock-deep-link-v2364.test.ts',
      'src/tests/cr-type-deep-link-v2361.test.ts',
      'src/tests/cust-debt-deep-link-v2330.test.ts',
      'src/tests/cv-type-deep-link-v2363.test.ts',
      'src/tests/dn-status-deep-link-v2359.test.ts',
      'src/tests/dp-status-deep-link-v2365.test.ts',
      'src/tests/gc-status-deep-link-v2358.test.ts',
      'src/tests/inv-status-deep-link-v2356.test.ts',
      'src/tests/inv-stock-deep-link-v2329.test.ts',
      // the po-status word's ledger lives beside the proxy-gate suite
      // (one release, two suites — the ledger is the honest speaker here)
      'src/tests/pr-status-deep-link-v2362.test.ts',
      'src/tests/proxy-gate-layering-v2328.test.ts',
      // and this file joins its own ledger (an admission line carries the
      // word it admits — the ripple's second-order form, pinned above)
      'src/tests/rent-status-deep-link-v2355.test.ts',
      'src/tests/sec-type-deep-link-v2367.test.ts',
      'src/tests/sup-po-deep-link-v2332.test.ts',
      'src/tests/sup-status-deep-link-v2331.test.ts',
      'src/tests/transfer-status-deep-link-v2357.test.ts',
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
