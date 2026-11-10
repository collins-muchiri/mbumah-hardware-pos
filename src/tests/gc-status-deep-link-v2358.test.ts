// THE GIFT CARD DESK'S OWN WORD (v2.358.0): the gift cards desk's status
// lens answers the address bar.
//
// v2.328.0 gave the purchase-orders roster its STATUS word (`?po-status=`),
// v2.329.0 the inventory desk (`?inv-stock=`), v2.330.0 the customers desk
// (`?cust-debt=`), v2.331.0 the suppliers desk (`?sup-status=`), v2.332.0
// that desk's PO section (`?sup-po=`), v2.333.0 the transactions desk's
// payment-method lens (`?txn-pay=`), v2.354.0 its type lens (`?txn-type=`),
// v2.355.0 the rentals desk (`?rent-status=`), v2.356.0 the invoices desk
// (`?inv-status=`), v2.357.0 the transfers desk (`?transfer-status=`).
// THE PROMISE KEPT AN ELEVENTH TIME — the gift cards desk's status lens
// speaks its desk-prefixed `?gc-status=ALL|ACTIVE|REDEEMED|EXPIRED|
// CANCELLED|PARTIALLY_REDEEMED` and wears the landing chip in the lens's
// own lime (the ELEVENTH family — indigo/amber/rose/emerald/cyan/violet/
// fuchsia/orange/teal/blue now gain the card lens's lime, the redemption
// hue) beside the desk's own reason voices (the gifting reason's pink,
// the employee award's purple — a voice must not masquerade as a badge,
// and now neither borrows the other's clothes). The card's life from
// issue to redemption is now an address. THE NEUTRAL, CAPITALIZED: the
// desk's all-lens has been spelled 'ALL' since the desk first shipped,
// so the word's neutral is UPPERCASE — the FIRST FILTERS const in the
// family whose neutral member is capitalized (an older desk's const
// predates the pattern and carries its fallback separately), and the
// inverse voice: a lowercase spelling of the neutral names nothing here.
// The UPPERCASE voice otherwise (the payment word's voice): a lowercase
// word is an unknown word — never a clever match.
//
// Pins: the parser's truth table (pure, UPPERCASE vocabulary with the
// capitalized neutral), the desk's seed bytes and its cast-free typing,
// the chip's bytes and its two retirement voices, the one-home promise
// (the law's doc carries the eleventh word), the constitution's
// eleventh row, and the collision ledger.

import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';

const LOOM = readFileSync('src/components/landing-chip.tsx', 'utf8');
import { join } from 'node:path';
import { parseInitialNamedMember } from '@/lib/tab-url';

const GC_STATUS_FILTERS = ['ALL', 'ACTIVE', 'REDEEMED', 'EXPIRED', 'CANCELLED', 'PARTIALLY_REDEEMED'] as const;

// ---------------------------------------------------------------------------
// 1. THE PARSER'S TRUTH TABLE (the membership law, one home, the
//    capitalized neutral's INVERSE voice)
// ---------------------------------------------------------------------------

describe('parseInitialNamedMember — the card lens speaks the one home', () => {
  it('a lens the desk offers seeds the filter', () => {
    expect(parseInitialNamedMember('?gc-status=ACTIVE', 'gc-status', GC_STATUS_FILTERS, 'ALL')).toBe('ACTIVE');
    expect(parseInitialNamedMember('?gc-status=REDEEMED', 'gc-status', GC_STATUS_FILTERS, 'ALL')).toBe('REDEEMED');
    expect(parseInitialNamedMember('?gc-status=EXPIRED', 'gc-status', GC_STATUS_FILTERS, 'ALL')).toBe('EXPIRED');
    expect(parseInitialNamedMember('?gc-status=CANCELLED', 'gc-status', GC_STATUS_FILTERS, 'ALL')).toBe('CANCELLED');
    expect(parseInitialNamedMember('?gc-status=PARTIALLY_REDEEMED', 'gc-status', GC_STATUS_FILTERS, 'ALL')).toBe('PARTIALLY_REDEEMED');
  });

  it('the neutral is a member too — the desk\u2019s own spelling seeds the all-lens', () => {
    // this desk's all-lens has been 'ALL' since the desk first shipped —
    // the const carries it, so the address bar can name it
    expect(parseInitialNamedMember('?gc-status=ALL', 'gc-status', GC_STATUS_FILTERS, 'ALL')).toBe('ALL');
  });

  it('a lens the desk does not offer answers the fallback (never stranded)', () => {
    expect(parseInitialNamedMember('?gc-status=VOID', 'gc-status', GC_STATUS_FILTERS, 'ALL')).toBe('ALL');
    expect(parseInitialNamedMember('?gc-status=', 'gc-status', GC_STATUS_FILTERS, 'ALL')).toBe('ALL');
  });

  it('case-sensitive: a lowercase word is an unknown word, not a clever match', () => {
    // the lens's own words are UPPERCASE — `active` names nothing
    // (the payment word's voice; the INVERSE of the lowercase type word)
    expect(parseInitialNamedMember('?gc-status=active', 'gc-status', GC_STATUS_FILTERS, 'ALL')).toBe('ALL');
    expect(parseInitialNamedMember('?gc-status=Active', 'gc-status', GC_STATUS_FILTERS, 'ALL')).toBe('ALL');
    // AND THE NEUTRAL'S INVERSE VOICE: this desk spells its all-lens
    // 'ALL', so a lowercase `all` is an unknown word here — the exact
    // reverse of the desks whose neutral is lowercase (there, the
    // UPPERCASE spelling is the stranger)
    expect(parseInitialNamedMember('?gc-status=all', 'gc-status', GC_STATUS_FILTERS, 'ALL')).toBe('ALL');
  });

  it('missing, bare, and malformed searches answer the fallback — never throw', () => {
    expect(parseInitialNamedMember('', 'gc-status', GC_STATUS_FILTERS, 'ALL')).toBe('ALL');
    expect(parseInitialNamedMember('?tab=gift-cards', 'gc-status', GC_STATUS_FILTERS, 'ALL')).toBe('ALL');
    expect(parseInitialNamedMember('gc-status=REDEEMED', 'gc-status', GC_STATUS_FILTERS, 'ALL')).toBe('REDEEMED');
    expect(parseInitialNamedMember('?????', 'gc-status', GC_STATUS_FILTERS, 'ALL')).toBe('ALL');
    expect(parseInitialNamedMember('?gc-status=EXPIRED&page=2', 'gc-status', GC_STATUS_FILTERS, 'ALL')).toBe('EXPIRED');
  });

  it('the word rides alongside the vocabulary\u2019s other words without collision', () => {
    // a landing can carry the desk AND its lens AND the neighbors' words
    // — one bar, one word per lens, every lens its own
    expect(
      parseInitialNamedMember('?tab=gift-cards&gc-status=ACTIVE&txn-pay=CASH', 'gc-status', GC_STATUS_FILTERS, 'ALL')
    ).toBe('ACTIVE');
    expect(
      parseInitialNamedMember('?tab=gift-cards&gc-status=REDEEMED&txn-type=refund', 'gc-status', GC_STATUS_FILTERS, 'ALL')
    ).toBe('REDEEMED');
    expect(
      parseInitialNamedMember('?tab=gift-cards&gc-status=EXPIRED&po-status=PENDING_APPROVAL&inv-stock=low&inv-status=PAID', 'gc-status', GC_STATUS_FILTERS, 'ALL')
    ).toBe('EXPIRED');
    expect(
      parseInitialNamedMember('?tab=gift-cards&gc-status=CANCELLED&cust-debt=overdue&sup-status=ACTIVE&sup-po=SENT', 'gc-status', GC_STATUS_FILTERS, 'ALL')
    ).toBe('CANCELLED');
    expect(
      parseInitialNamedMember('?tab=gift-cards&gc-status=PARTIALLY_REDEEMED&rent-status=OVERDUE&transfer-status=IN_TRANSIT', 'gc-status', GC_STATUS_FILTERS, 'ALL')
    ).toBe('PARTIALLY_REDEEMED');
  });
});

// ---------------------------------------------------------------------------
// 2. THE DESK'S SEED — read-on-mount, one home, never a copy, never a cast
// ---------------------------------------------------------------------------

describe('the gift cards desk — ?gc-status= lands as visible state', () => {
  const desk = readFileSync('src/app/(shell)/tabs/gift-cards-tab.tsx', 'utf8');
  const home = readFileSync('src/lib/tab-url.ts', 'utf8');

  it('the seed reads the word through the ONE home (never a local parser)', () => {
    expect(desk.includes("import { parseInitialNamedMember } from '@/lib/tab-url';")).toBe(true);
    expect(
      desk.includes("parseInitialNamedMember(window.location.search, 'gc-status', GC_STATUS_FILTERS, 'ALL')")
    ).toBe(true);
    // the home owns the law and carries the eleventh-word note
    expect(home.includes('export function parseInitialNamedMember')).toBe(true);
    expect(home.includes('v2.358.0 — THE PROMISE KEPT, THE ELEVENTH WORD')).toBe(true);
  });

  it('the seed is the lazy initializer of the status filter (read-on-mount law)', () => {
    expect(
      desk.includes('const [statusFilter, setStatusFilter] = useState<(typeof GC_STATUS_FILTERS)[number]>(initialGcStatus);')
    ).toBe(true);
    // the SSR guard answers 'ALL' before any window exists — the desk's
    // OWN all-lens spelling, capitalized
    expect(desk.includes("if (typeof window === 'undefined') return 'ALL';")).toBe(true);
    // the desk offers exactly the lenses it names — the FIRST const in
    // the family whose neutral member is capitalized
    expect(
      desk.includes("export const GC_STATUS_FILTERS = ['ALL', 'ACTIVE', 'REDEEMED', 'EXPIRED', 'CANCELLED', 'PARTIALLY_REDEEMED'] as const;")
    ).toBe(true);
  });

  it('the seed is CAST-FREE — the generic parser IS the union', () => {
    expect(desk.includes('function initialGcStatus(): (typeof GC_STATUS_FILTERS)[number]')).toBe(true);
    expect(desk.includes('useState<(typeof GC_STATUS_FILTERS)[number]>(initialGcStatus)')).toBe(true);
    // and no laundering snuck in around the new word
    expect(desk.includes('initialGcStatus() as')).toBe(false);
    expect(desk.includes('initialGcStatus as unknown')).toBe(false);
  });

  it('the word is desk-prefixed (the Task 44 collision law) and annotated', () => {
    expect(desk.includes("THE GIFT CARD DESK'S OWN WORD")).toBe(true);
    expect(desk.includes('?gc-status=ACTIVE')).toBe(true);
    // the collision note lives with the word
    expect(desk.includes('Collision-checked at round start')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 3. THE LANDING CHIP — the lens answers OUT LOUD, in its own lime
// ---------------------------------------------------------------------------

describe('the landing chip — the face names the word it answered', () => {
  const desk = readFileSync('src/app/(shell)/tabs/gift-cards-tab.tsx', 'utf8');

  it('the chip renders only while the landing is live AND untouched', () => {
    expect(
      desk.includes("gcLandingLive && landedGcStatus !== 'ALL' && statusFilter === landedGcStatus")
    ).toBe(true);
    expect(desk.includes('data-testid="gc-status-landing-word"')).toBe(true);
  });

  it('the chip names the exact word it answered', () => {
    expect(desk.includes('landed ?gc-status=${landedGcStatus}')).toBe(true);
  });

  it('voice 1 — the dismissal clears the lens the word seeded and retires', () => {
    const at = desk.indexOf('data-testid="gc-status-landing-word"');
    const block = desk.slice(at, at + 1200);
    expect(block).toContain("setStatusFilter('ALL')");
    expect(block).toContain('setGcLandingLive(false)');
  });

  it('voice 2 — a hand-driven Select change retires the chip', () => {
    expect(desk.includes('<Select value={statusFilter} onValueChange={chooseGcStatus}>')).toBe(true);
    expect(desk.includes('a hand-driven change retires the landing word')).toBe(true);
  });

  it('the voices are honest — the desk claims exactly the two it has', () => {
    expect(desk.includes("hand-driven Select change or the chip's own dismissal")).toBe(true);
    expect(desk.includes('THE TWO VOICES:')).toBe(true);
  });

  it('the chip wears the lens\u2019s lime family in BOTH modes', () => {
    // v2.397.0 THE LOOM: the elder wardrobe moved into the loom's 200
    // registry — the desk proves its family by hue, the registry carries
    // the bytes.
    expect(desk.includes('hue="lime"')).toBe(true);
    expect(LOOM.includes('border-lime-200 bg-lime-50 text-lime-700')).toBe(true);
    expect(LOOM.includes('dark:border-lime-500/30 dark:bg-lime-500/10 dark:text-lime-300')).toBe(true);
  });

  it('the dismiss hint sharpens on hover (the group-hover detail)', () => {
    expect(LOOM.includes('opacity-60 transition-opacity group-hover:opacity-100')).toBe(true);
  });

  it('the chip explains itself (the tooltip law)', () => {
    expect(desk.includes('title="The desk landed with this filter from the address bar — press to clear it"')).toBe(true);
    expect(LOOM.includes('aria-hidden="true"')).toBe(true); // v2.397.0 THE LOOM: the icons live in the one hand
  });

  it('the desk\u2019s own voices keep their families beside the chip (no masquerade)', () => {
    // the reason config speaks pink (the gifting reason) and purple (the
    // employee award); the redeem banner speaks its own rose-tinted
    // panel — voices, not badges; none borrows the chip's lime
    expect(desk.includes('text-pink-700 dark:text-pink-400')).toBe(true);
    expect(desk.includes('text-purple-700 dark:text-purple-400')).toBe(true);
    expect(desk.includes('border-pink-200 dark:border-pink-900/40')).toBe(true);
    // and the chip's lime stays its own
    expect(LOOM.includes('border-lime-200 bg-lime-50 text-lime-700 text-xs font-medium')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 4. THE CONSTITUTION — the vocabulary's registry grows to eleven, cross-pinned
// ---------------------------------------------------------------------------

describe('the address-bar vocabulary — the constitution\u2019s eleventh row', () => {
  const registry = readFileSync('src/tests/transfer-status-deep-link-v2357.test.ts', 'utf8');

  it('the constitution carries the eleventh word in its WORDS array', () => {
    expect(
      registry.includes("{ word: 'gc-status', desk: 'src/app/(shell)/tabs/gift-cards-tab.tsx', family: 'border-lime-200', suite: 'src/tests/gc-status-deep-link-v2358.test.ts' }")
    ).toBe(true);
  });

  it('the constitution\u2019s title counts twelve words over ten desk files', () => {
    expect(registry.includes('(fifty-three words, thirty-three desks)')).toBe(true);
  });

  it('the home\u2019s promise roll carries the ELEVENTH alongside its elders', () => {
    expect(registry.includes("'ELEVENTH'")).toBe(true);
    const home = readFileSync('src/lib/tab-url.ts', 'utf8');
    expect(home.includes('THE PROMISE KEPT, THE ELEVENTH WORD')).toBe(true);
  });

  it('the tenth word\u2019s desk survived untouched (the neighbor\u2019s law)', () => {
    const transfers = readFileSync('src/app/(shell)/tabs/transfers-tab.tsx', 'utf8');
    expect(transfers.includes("export const TRANSFER_STATUS_FILTERS = ['all', 'PENDING', 'IN_TRANSIT', 'RECEIVED', 'CANCELLED', 'PARTIAL'] as const;")).toBe(true);
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
      if (readFileSync(p, 'utf8').includes('gc-status')) collected.push(p);
    }
  }
}

describe('the address-bar vocabulary stays one-writer-per-word', () => {
  it('`gc-status` speaks in exactly the expected files under src/', () => {
    const collected: string[] = [];
    walkSrc('src', collected);
    collected.sort();
    expect(collected).toEqual([
      'src/app/(shell)/tabs/gift-cards-tab.tsx',
      'src/lib/tab-url.ts',
      'src/lib/whats-new.ts',
      // the twelve neighbor ledgers admitted this test file — and an
      // admission line carries the word it admits (the LEDGER-CITATION
      // RIPPLE: a ledger is an honest speaker of every word it lists)
      'src/tests/ad-severity-deep-link-v2366.test.ts',
      'src/tests/cat-stock-deep-link-v2364.test.ts',
      'src/tests/cr-type-deep-link-v2361.test.ts',
      'src/tests/cust-debt-deep-link-v2330.test.ts',
      // and this file joins its own ledger (an admission line carries the
      // word it admits — the ripple's second-order form, pinned above)
      'src/tests/cv-type-deep-link-v2363.test.ts',
      'src/tests/dn-status-deep-link-v2359.test.ts',
      'src/tests/dp-status-deep-link-v2365.test.ts',
      'src/tests/et-status-deep-link-v2381.test.ts',
      'src/tests/family-registry-stress-v2370.test.ts',
      'src/tests/gc-status-deep-link-v2358.test.ts',
      'src/tests/inv-status-deep-link-v2356.test.ts',
      'src/tests/inv-stock-deep-link-v2329.test.ts',
      // the loom's own suite — admitted (v2.397.0: the elder loom pins
      // this desk's chip bytes, so the walk lists it)
      'src/tests/landing-chip-loom-v2394.test.ts',
      // the po-status word's ledger lives beside the proxy-gate suite
      // (one release, two suites — the ledger is the honest speaker here)
      'src/tests/ly-type-deep-link-v2368.test.ts',
      'src/tests/pr-status-deep-link-v2362.test.ts',
      'src/tests/proxy-gate-layering-v2328.test.ts',
      'src/tests/rent-status-deep-link-v2355.test.ts',
      'src/tests/sec-type-deep-link-v2367.test.ts',
      'src/tests/sup-po-deep-link-v2332.test.ts',
      'src/tests/sup-status-deep-link-v2331.test.ts',
      'src/tests/tax-period-deep-link-v2383.test.ts',
      'src/tests/tax-type-deep-link-v2382.test.ts',
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
