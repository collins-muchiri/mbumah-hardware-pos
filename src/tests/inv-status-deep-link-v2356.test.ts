// THE INVOICE DESK'S OWN WORD (v2.356.0): the invoices desk's status lens
// answers the address bar.
//
// v2.328.0 gave the purchase-orders roster its STATUS word (`?po-status=`),
// v2.329.0 kept the promise on the inventory desk (`?inv-stock=`),
// v2.330.0 on the customers desk (`?cust-debt=`), v2.331.0 on the
// suppliers desk (`?sup-status=`), v2.332.0 on that desk's PO section
// (`?sup-po=`), v2.333.0 on the transactions desk's payment-method lens
// (`?txn-pay=`), v2.354.0 on that desk's type lens (`?txn-type=`) and
// v2.355.0 on the rentals desk's status lens (`?rent-status=`). THE
// PROMISE KEPT A NINTH TIME — the invoices desk's status lens speaks its
// desk-prefixed `?inv-status=all|DRAFT|SENT|ACCEPTED|INVOICED|PAID|
// CANCELLED|EXPIRED` and wears the landing chip in the lens's own teal
// (the NINTH family of the vocabulary — indigo/amber/rose/emerald/cyan/
// violet/fuchsia/orange now gain the invoice lens's teal, the pipeline
// hue; cyan's neighbor lives on the suppliers desk, the two never share
// a bar). The invoicing pipeline's stage — DRAFT through EXPIRED — is
// now an address. The UPPERCASE voice again (the payment word's voice):
// a lowercase word names nothing — never a clever match.
//
// Pins: the parser's truth table (pure, UPPERCASE vocabulary), the
// desk's seed bytes and its cast-free typing (the generic parser IS the
// union), the chip's bytes and its two retirement voices (dismissal +
// the hand-driven Select), the one-home promise (the law's doc carries
// the ninth word), and the collision ledger (which files may speak the
// word at all).

import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { parseInitialNamedMember } from '@/lib/tab-url';

const INV_STATUS_FILTERS = ['all', 'DRAFT', 'SENT', 'ACCEPTED', 'INVOICED', 'PAID', 'CANCELLED', 'EXPIRED'] as const;

// ---------------------------------------------------------------------------
// 1. THE PARSER'S TRUTH TABLE (the membership law, one home, UPPERCASE voice)
// ---------------------------------------------------------------------------

describe('parseInitialNamedMember — the invoice status lens speaks the one home', () => {
  it('a lens the desk offers seeds the filter', () => {
    expect(parseInitialNamedMember('?inv-status=DRAFT', 'inv-status', INV_STATUS_FILTERS, 'all')).toBe('DRAFT');
    expect(parseInitialNamedMember('?inv-status=SENT', 'inv-status', INV_STATUS_FILTERS, 'all')).toBe('SENT');
    expect(parseInitialNamedMember('?inv-status=PAID', 'inv-status', INV_STATUS_FILTERS, 'all')).toBe('PAID');
    expect(parseInitialNamedMember('?inv-status=EXPIRED', 'inv-status', INV_STATUS_FILTERS, 'all')).toBe('EXPIRED');
  });

  it('a lens the desk does not offer answers the fallback (never stranded)', () => {
    expect(parseInitialNamedMember('?inv-status=REFUNDED', 'inv-status', INV_STATUS_FILTERS, 'all')).toBe('all');
    expect(parseInitialNamedMember('?inv-status=', 'inv-status', INV_STATUS_FILTERS, 'all')).toBe('all');
  });

  it('case-sensitive: a lowercase word is an unknown word, not a clever match', () => {
    // the lens's own words are UPPERCASE — `paid` names nothing
    // (the payment word's voice; the INVERSE of the lowercase type word)
    expect(parseInitialNamedMember('?inv-status=paid', 'inv-status', INV_STATUS_FILTERS, 'all')).toBe('all');
    expect(parseInitialNamedMember('?inv-status=Paid', 'inv-status', INV_STATUS_FILTERS, 'all')).toBe('all');
    expect(parseInitialNamedMember('?inv-status=ALL', 'inv-status', INV_STATUS_FILTERS, 'all')).toBe('all');
  });

  it('missing, bare, and malformed searches answer the fallback — never throw', () => {
    expect(parseInitialNamedMember('', 'inv-status', INV_STATUS_FILTERS, 'all')).toBe('all');
    expect(parseInitialNamedMember('?tab=invoices', 'inv-status', INV_STATUS_FILTERS, 'all')).toBe('all');
    expect(parseInitialNamedMember('inv-status=PAID', 'inv-status', INV_STATUS_FILTERS, 'all')).toBe('PAID');
    expect(parseInitialNamedMember('?????', 'inv-status', INV_STATUS_FILTERS, 'all')).toBe('all');
    expect(parseInitialNamedMember('?inv-status=PAID&page=2', 'inv-status', INV_STATUS_FILTERS, 'all')).toBe('PAID');
  });

  it('the word rides alongside the vocabulary\u2019s other words without collision', () => {
    // a landing can carry the desk AND its lens AND the neighbors' words
    // — one bar, one word per lens, every lens its own
    expect(
      parseInitialNamedMember('?tab=invoices&inv-status=PAID&txn-pay=CASH', 'inv-status', INV_STATUS_FILTERS, 'all')
    ).toBe('PAID');
    expect(
      parseInitialNamedMember('?tab=invoices&inv-status=SENT&txn-type=refund', 'inv-status', INV_STATUS_FILTERS, 'all')
    ).toBe('SENT');
    expect(
      parseInitialNamedMember('?tab=invoices&inv-status=DRAFT&po-status=PENDING_APPROVAL&inv-stock=low', 'inv-status', INV_STATUS_FILTERS, 'all')
    ).toBe('DRAFT');
    expect(
      parseInitialNamedMember('?tab=invoices&inv-status=ACCEPTED&cust-debt=overdue&sup-status=ACTIVE&sup-po=SENT', 'inv-status', INV_STATUS_FILTERS, 'all')
    ).toBe('ACCEPTED');
    expect(
      parseInitialNamedMember('?tab=invoices&inv-status=INVOICED&rent-status=OVERDUE', 'inv-status', INV_STATUS_FILTERS, 'all')
    ).toBe('INVOICED');
  });
});

// ---------------------------------------------------------------------------
// 2. THE DESK'S SEED — read-on-mount, one home, never a copy, never a cast
// ---------------------------------------------------------------------------

describe('the invoices desk — ?inv-status= lands as visible state', () => {
  const desk = readFileSync('src/app/(shell)/tabs/invoices-tab.tsx', 'utf8');
  const home = readFileSync('src/lib/tab-url.ts', 'utf8');

  it('the seed reads the word through the ONE home (never a local parser)', () => {
    expect(desk.includes("import { parseInitialNamedMember } from '@/lib/tab-url';")).toBe(true);
    expect(
      desk.includes("parseInitialNamedMember(window.location.search, 'inv-status', INV_STATUS_FILTERS, 'all')")
    ).toBe(true);
    // the home owns the law and carries the ninth-word note
    expect(home.includes('export function parseInitialNamedMember')).toBe(true);
    expect(home.includes('v2.356.0 — THE PROMISE KEPT, THE NINTH WORD')).toBe(true);
  });

  it('the seed is the lazy initializer of the status filter (read-on-mount law)', () => {
    expect(
      desk.includes('const [statusFilter, setStatusFilter] = useState<(typeof INV_STATUS_FILTERS)[number]>(initialInvStatus);')
    ).toBe(true);
    // the SSR guard answers 'all' before any window exists
    expect(desk.includes("if (typeof window === 'undefined') return 'all';")).toBe(true);
    // the desk offers exactly the lenses it names
    expect(
      desk.includes("export const INV_STATUS_FILTERS = ['all', 'DRAFT', 'SENT', 'ACCEPTED', 'INVOICED', 'PAID', 'CANCELLED', 'EXPIRED'] as const;")
    ).toBe(true);
  });

  it('the seed is CAST-FREE — the generic parser IS the union', () => {
    // the parser is generic over V; the `as const` keyset IS the lens's
    // union, so the seed names it directly — no cast, no widening
    expect(desk.includes('function initialInvStatus(): (typeof INV_STATUS_FILTERS)[number]')).toBe(true);
    expect(desk.includes('useState<(typeof INV_STATUS_FILTERS)[number]>(initialInvStatus)')).toBe(true);
    // and no laundering snuck in around the new word
    expect(desk.includes('initialInvStatus() as')).toBe(false);
    expect(desk.includes('initialInvStatus as unknown')).toBe(false);
  });

  it('the word is desk-prefixed (the Task 44 collision law) and annotated', () => {
    expect(desk.includes("THE INVOICE DESK'S OWN WORD")).toBe(true);
    expect(desk.includes('?inv-status=PAID')).toBe(true);
    // the collision note lives with the word
    expect(desk.includes('Collision-checked at round start')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 3. THE LANDING CHIP — the lens answers OUT LOUD, in its own teal
// ---------------------------------------------------------------------------

describe('the landing chip — the face names the word it answered', () => {
  const desk = readFileSync('src/app/(shell)/tabs/invoices-tab.tsx', 'utf8');

  it('the chip renders only while the landing is live AND untouched', () => {
    expect(
      desk.includes("invLandingLive && landedInvStatus !== 'all' && statusFilter === landedInvStatus")
    ).toBe(true);
    expect(desk.includes('data-testid="inv-status-landing-word"')).toBe(true);
  });

  it('the chip names the exact word it answered', () => {
    expect(desk.includes('landed ?inv-status={landedInvStatus}')).toBe(true);
  });

  it('voice 1 — the dismissal clears the lens the word seeded and retires', () => {
    const at = desk.indexOf('data-testid="inv-status-landing-word"');
    const block = desk.slice(at, at + 400);
    expect(block).toContain("setStatusFilter('all')");
    expect(block).toContain('setInvLandingLive(false)');
  });

  it('voice 2 — a hand-driven Select change retires the chip', () => {
    expect(desk.includes('<Select value={statusFilter} onValueChange={chooseInvStatus}>')).toBe(true);
    expect(desk.includes('a hand-driven change retires the landing word')).toBe(true);
  });

  it('the voices are honest — the desk claims exactly the two it has', () => {
    // the status lens has no census chips and no quick-chip row; the
    // chip's own comment names the two voices and no more (pin the SOURCE
    // bytes, contiguous per the pin-contiguity law)
    expect(desk.includes("hand-driven Select change or the chip's own dismissal")).toBe(true);
    expect(desk.includes('THE TWO VOICES:')).toBe(true);
  });

  it('the chip wears the lens\u2019s teal family in BOTH modes', () => {
    expect(desk.includes('border-teal-200 bg-teal-50 text-teal-700')).toBe(true);
    expect(desk.includes('dark:border-teal-500/30 dark:bg-teal-500/10 dark:text-teal-300')).toBe(true);
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
    // from the chip's family — the chip wears teal, the Select stays
    // the shadcn voice it always was
    expect(desk.includes('<SelectTrigger className="w-[140px] h-9 text-sm">')).toBe(true);
    expect(desk.includes('border-teal-200 bg-teal-50 text-teal-700 text-xs font-medium')).toBe(true);
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
      if (readFileSync(p, 'utf8').includes('inv-status')) collected.push(p);
    }
  }
}

describe('the address-bar vocabulary stays one-writer-per-word', () => {
  it('`inv-status` speaks in exactly the expected files under src/', () => {
    const collected: string[] = [];
    walkSrc('src', collected);
    collected.sort();
    expect(collected).toEqual([
      'src/app/(shell)/tabs/invoices-tab.tsx',
      'src/lib/tab-url.ts',
      'src/lib/whats-new.ts',
      // the ten neighbor ledgers admitted this test file — and an
      // admission line carries the word it admits (the LEDGER-CITATION
      // RIPPLE: a ledger is an honest speaker of every word it lists)
      'src/tests/cr-type-deep-link-v2361.test.ts',
      'src/tests/cust-debt-deep-link-v2330.test.ts',
      // and this file joins its own ledger (an admission line carries the
      // word it admits — the ripple's second-order form, pinned above)
      'src/tests/cv-type-deep-link-v2363.test.ts',
      'src/tests/dn-status-deep-link-v2359.test.ts',
      'src/tests/gc-status-deep-link-v2358.test.ts',
      'src/tests/inv-status-deep-link-v2356.test.ts',
      'src/tests/inv-stock-deep-link-v2329.test.ts',
      // the po-status word's ledger lives beside the proxy-gate suite
      // (one release, two suites — the ledger is the honest speaker here)
      'src/tests/pr-status-deep-link-v2362.test.ts',
      'src/tests/proxy-gate-layering-v2328.test.ts',
      'src/tests/rent-status-deep-link-v2355.test.ts',
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
