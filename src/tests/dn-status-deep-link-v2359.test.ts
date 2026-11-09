// THE DELIVERY DESK'S OWN WORD (v2.359.0): the delivery notes desk's
// status lens answers the address bar.
//
// v2.328.0 gave the purchase-orders roster its STATUS word (`?po-status=`),
// v2.329.0 the inventory desk (`?inv-stock=`), v2.330.0 the customers desk
// (`?cust-debt=`), v2.331.0 the suppliers desk (`?sup-status=`), v2.332.0
// that desk's PO section (`?sup-po=`), v2.333.0 the transactions desk's
// payment-method lens (`?txn-pay=`), v2.354.0 its type lens (`?txn-type=`),
// v2.355.0 the rentals desk (`?rent-status=`), v2.356.0 the invoices desk
// (`?inv-status=`), v2.357.0 the transfers desk (`?transfer-status=`),
// v2.358.0 the gift cards desk (`?gc-status=`).
// THE PROMISE KEPT A TWELFTH TIME — the delivery notes desk's status lens
// speaks its desk-prefixed `?dn-status=PENDING|IN_TRANSIT|DELIVERED|
// CANCELLED` and wears the landing chip in the lens's own sky (the
// TWELFTH family — indigo/amber/rose/emerald/cyan/violet/fuchsia/orange/
// teal/blue/lime now gain the delivery lens's sky, the open-road hue)
// beside the desk's own badge voices (the pending lens's amber, the
// transit lens's blue, the delivered lens's green, the cancelled lens's
// red — a voice must not masquerade as a badge, and now neither borrows
// the other's clothes). The note's road from Pending through In Transit
// to Delivered is now an address. THE NEUTRAL VOICE, LOWERCASE: the
// desk's all-lens has been spelled 'all' since the desk first shipped,
// so the word's neutral is lowercase — the payment word's spelling — and
// the inverse voice: an UPPERCASE spelling of the neutral names nothing
// here. The UPPERCASE voice otherwise (the payment word's voice): a
// lowercase word is an unknown word — never a clever match.
//
// Pins: the parser's truth table (pure, UPPERCASE vocabulary with the
// lowercase neutral), the desk's seed bytes and its cast-free typing,
// the chip's bytes and its two retirement voices, the one-home promise
// (the law's doc carries the twelfth word), the constitution's
// twelfth row, and the collision ledger.

import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';

const LOOM = readFileSync('src/components/landing-chip.tsx', 'utf8');
import { join } from 'node:path';
import { parseInitialNamedMember } from '@/lib/tab-url';

const DN_STATUS_FILTERS = ['all', 'PENDING', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED'] as const;

// ---------------------------------------------------------------------------
// 1. THE PARSER'S TRUTH TABLE (the membership law, one home, the
//    lowercase neutral's INVERSE voice)
// ---------------------------------------------------------------------------

describe('parseInitialNamedMember — the delivery lens speaks the one home', () => {
  it('a lens the desk offers seeds the filter', () => {
    expect(parseInitialNamedMember('?dn-status=PENDING', 'dn-status', DN_STATUS_FILTERS, 'all')).toBe('PENDING');
    expect(parseInitialNamedMember('?dn-status=IN_TRANSIT', 'dn-status', DN_STATUS_FILTERS, 'all')).toBe('IN_TRANSIT');
    expect(parseInitialNamedMember('?dn-status=DELIVERED', 'dn-status', DN_STATUS_FILTERS, 'all')).toBe('DELIVERED');
    expect(parseInitialNamedMember('?dn-status=CANCELLED', 'dn-status', DN_STATUS_FILTERS, 'all')).toBe('CANCELLED');
  });

  it('the neutral is a member too — the desk\u2019s own spelling seeds the all-lens', () => {
    // this desk's all-lens has been 'all' since the desk first shipped —
    // the const carries it, so the address bar can name it
    expect(parseInitialNamedMember('?dn-status=all', 'dn-status', DN_STATUS_FILTERS, 'all')).toBe('all');
  });

  it('a lens the desk does not offer answers the fallback (never stranded)', () => {
    expect(parseInitialNamedMember('?dn-status=RETURNED', 'dn-status', DN_STATUS_FILTERS, 'all')).toBe('all');
    expect(parseInitialNamedMember('?dn-status=', 'dn-status', DN_STATUS_FILTERS, 'all')).toBe('all');
  });

  it('case-sensitive: a lowercase word is an unknown word, not a clever match', () => {
    // the lens's own words are UPPERCASE — `pending` names nothing
    // (the payment word's voice; the INVERSE of the lowercase type word)
    expect(parseInitialNamedMember('?dn-status=pending', 'dn-status', DN_STATUS_FILTERS, 'all')).toBe('all');
    expect(parseInitialNamedMember('?dn-status=Pending', 'dn-status', DN_STATUS_FILTERS, 'all')).toBe('all');
    expect(parseInitialNamedMember('?dn-status=in_transit', 'dn-status', DN_STATUS_FILTERS, 'all')).toBe('all');
    // AND THE NEUTRAL'S INVERSE VOICE: this desk spells its all-lens
    // 'all', so an UPPERCASE `ALL` is an unknown word here — the exact
    // reverse of the desk whose neutral is capitalized (there, the
    // lowercase spelling is the stranger)
    expect(parseInitialNamedMember('?dn-status=ALL', 'dn-status', DN_STATUS_FILTERS, 'all')).toBe('all');
  });

  it('missing, bare, and malformed searches answer the fallback — never throw', () => {
    expect(parseInitialNamedMember('', 'dn-status', DN_STATUS_FILTERS, 'all')).toBe('all');
    expect(parseInitialNamedMember('?tab=delivery-notes', 'dn-status', DN_STATUS_FILTERS, 'all')).toBe('all');
    expect(parseInitialNamedMember('dn-status=PENDING', 'dn-status', DN_STATUS_FILTERS, 'all')).toBe('PENDING');
    expect(parseInitialNamedMember('?????', 'dn-status', DN_STATUS_FILTERS, 'all')).toBe('all');
    expect(parseInitialNamedMember('?dn-status=DELIVERED&page=2', 'dn-status', DN_STATUS_FILTERS, 'all')).toBe('DELIVERED');
  });

  it('the word rides alongside the vocabulary\u2019s other words without collision', () => {
    // a landing can carry the desk AND its lens AND the neighbors' words
    // — one bar, one word per lens, every lens its own
    expect(
      parseInitialNamedMember('?tab=delivery&dn-status=PENDING&txn-pay=CASH', 'dn-status', DN_STATUS_FILTERS, 'all')
    ).toBe('PENDING');
    expect(
      parseInitialNamedMember('?tab=delivery&dn-status=IN_TRANSIT&txn-type=refund', 'dn-status', DN_STATUS_FILTERS, 'all')
    ).toBe('IN_TRANSIT');
    expect(
      parseInitialNamedMember('?tab=delivery&dn-status=DELIVERED&po-status=PENDING_APPROVAL&inv-stock=low', 'dn-status', DN_STATUS_FILTERS, 'all')
    ).toBe('DELIVERED');
    expect(
      parseInitialNamedMember('?tab=delivery&dn-status=CANCELLED&cust-debt=overdue&sup-status=ACTIVE&sup-po=SENT', 'dn-status', DN_STATUS_FILTERS, 'all')
    ).toBe('CANCELLED');
    expect(
      parseInitialNamedMember('?tab=delivery&dn-status=DELIVERED&rent-status=OVERDUE', 'dn-status', DN_STATUS_FILTERS, 'all')
    ).toBe('DELIVERED');
    expect(
      parseInitialNamedMember('?tab=delivery&dn-status=PENDING&inv-status=PAID', 'dn-status', DN_STATUS_FILTERS, 'all')
    ).toBe('PENDING');
    expect(
      parseInitialNamedMember('?tab=delivery&dn-status=IN_TRANSIT&transfer-status=PARTIAL', 'dn-status', DN_STATUS_FILTERS, 'all')
    ).toBe('IN_TRANSIT');
    expect(
      parseInitialNamedMember('?tab=delivery&dn-status=CANCELLED&gc-status=REDEEMED', 'dn-status', DN_STATUS_FILTERS, 'all')
    ).toBe('CANCELLED');
  });
});

// ---------------------------------------------------------------------------
// 2. THE DESK'S SEED — read-on-mount, one home, never a copy, never a cast
// ---------------------------------------------------------------------------

describe('the delivery notes desk — ?dn-status= lands as visible state', () => {
  const desk = readFileSync('src/app/(shell)/tabs/delivery-notes-tab.tsx', 'utf8');
  const home = readFileSync('src/lib/tab-url.ts', 'utf8');

  it('the seed reads the word through the ONE home (never a local parser)', () => {
    expect(desk.includes("import { parseInitialNamedMember } from '@/lib/tab-url';")).toBe(true);
    expect(
      desk.includes("parseInitialNamedMember(window.location.search, 'dn-status', DN_STATUS_FILTERS, 'all')")
    ).toBe(true);
    // the home owns the law and carries the twelfth-word note
    expect(home.includes('export function parseInitialNamedMember')).toBe(true);
    expect(home.includes('v2.359.0 — THE PROMISE KEPT, THE TWELFTH WORD')).toBe(true);
  });

  it('the seed is the lazy initializer of the status filter (read-on-mount law)', () => {
    expect(
      desk.includes('const [statusFilter, setStatusFilter] = useState<(typeof DN_STATUS_FILTERS)[number]>(initialDnStatus);')
    ).toBe(true);
    // the SSR guard answers 'all' before any window exists — the desk's
    // OWN all-lens spelling, lowercase
    expect(desk.includes("if (typeof window === 'undefined') return 'all';")).toBe(true);
    // the desk offers exactly the lenses it names — the neutral lowercase
    expect(
      desk.includes("export const DN_STATUS_FILTERS = ['all', 'PENDING', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED'] as const;")
    ).toBe(true);
  });

  it('the seed is CAST-FREE — the generic parser IS the union', () => {
    expect(desk.includes('function initialDnStatus(): (typeof DN_STATUS_FILTERS)[number]')).toBe(true);
    expect(desk.includes('useState<(typeof DN_STATUS_FILTERS)[number]>(initialDnStatus)')).toBe(true);
    // and no laundering snuck in around the new word
    expect(desk.includes('initialDnStatus() as')).toBe(false);
    expect(desk.includes('initialDnStatus as unknown')).toBe(false);
  });

  it('the word is desk-prefixed (the Task 44 collision law) and annotated', () => {
    expect(desk.includes("THE DELIVERY DESK'S OWN WORD")).toBe(true);
    expect(desk.includes('?dn-status=IN_TRANSIT')).toBe(true);
    // the collision note lives with the word
    expect(desk.includes('Collision-checked at round start')).toBe(true);
  });

  it('the query rides the lens — the seeded filter reaches the server read', () => {
    // the board's read names the lens in its key and its params, so a
    // landed word filters the list, not just the Select's face
    expect(desk.includes("queryKey: ['delivery-notes', currentStoreId, statusFilter],")).toBe(true);
    expect(desk.includes("status: statusFilter !== 'all' ? statusFilter : undefined,")).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 3. THE LANDING CHIP — the lens answers OUT LOUD, in its own sky
// ---------------------------------------------------------------------------

describe('the landing chip — the face names the word it answered', () => {
  const desk = readFileSync('src/app/(shell)/tabs/delivery-notes-tab.tsx', 'utf8');

  it('the chip renders only while the landing is live AND untouched', () => {
    expect(
      desk.includes("dnLandingLive && landedDnStatus !== 'all' && statusFilter === landedDnStatus")
    ).toBe(true);
    expect(desk.includes('data-testid="dn-status-landing-word"')).toBe(true);
  });

  it('the chip names the exact word it answered', () => {
    expect(desk.includes('landed ?dn-status=${landedDnStatus}')).toBe(true);
  });

  it('voice 1 — the dismissal clears the lens the word seeded and retires', () => {
    const at = desk.indexOf('data-testid="dn-status-landing-word"');
    const block = desk.slice(at, at + 1200);
    expect(block).toContain("setStatusFilter('all')");
    expect(block).toContain('setDnLandingLive(false)');
  });

  it('voice 2 — a hand-driven Select change retires the chip', () => {
    expect(desk.includes('<Select value={statusFilter} onValueChange={chooseDnStatus}>')).toBe(true);
    expect(desk.includes('a hand-driven change retires the landing word')).toBe(true);
  });

  it('the voices are honest — the desk claims exactly the two it has', () => {
    expect(desk.includes("hand-driven Select change or the chip's own dismissal")).toBe(true);
    expect(desk.includes('THE TWO VOICES:')).toBe(true);
  });

  it('the chip wears the lens\u2019s sky family in BOTH modes', () => {
    // v2.397.0 THE LOOM: the elder wardrobe moved into the loom's 200
    // registry — the desk proves its family by hue, the registry carries
    // the bytes.
    expect(desk.includes('hue="sky"')).toBe(true);
    expect(LOOM.includes('border-sky-200 bg-sky-50 text-sky-700')).toBe(true);
    expect(LOOM.includes('dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-300')).toBe(true);
  });

  it('the dismiss hint sharpens on hover (the group-hover detail)', () => {
    expect(LOOM.includes('opacity-60 transition-opacity group-hover:opacity-100')).toBe(true);
  });

  it('the chip explains itself (the tooltip law)', () => {
    expect(desk.includes('title="The desk landed with this filter from the address bar — press to clear it"')).toBe(true);
    expect(LOOM.includes('aria-hidden="true"')).toBe(true); // v2.397.0 THE LOOM: the icons live in the one hand
  });

  it('the desk\u2019s own voices keep their families beside the chip (no masquerade)', () => {
    // the badge helpers speak amber (pending), blue (transit), green
    // (delivered), red (cancelled) — voices, not badges; none borrows
    // the chip's sky
    expect(desk.includes('bg-amber-100 text-amber-700')).toBe(true);
    expect(desk.includes('bg-blue-100 text-blue-700')).toBe(true);
    expect(desk.includes('bg-green-100 text-green-700')).toBe(true);
    expect(desk.includes('bg-red-100 text-red-700')).toBe(true);
    // and the chip's sky stays its own
    expect(LOOM.includes('border-sky-200 bg-sky-50 text-sky-700 text-xs font-medium')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 4. THE CONSTITUTION — the vocabulary's registry grows to twelve, cross-pinned
// ---------------------------------------------------------------------------

describe('the address-bar vocabulary — the constitution\u2019s twelfth row', () => {
  const registry = readFileSync('src/tests/transfer-status-deep-link-v2357.test.ts', 'utf8');

  it('the constitution carries the twelfth word in its WORDS array', () => {
    expect(
      registry.includes("{ word: 'dn-status', desk: 'src/app/(shell)/tabs/delivery-notes-tab.tsx', family: 'border-sky-200', suite: 'src/tests/dn-status-deep-link-v2359.test.ts' }")
    ).toBe(true);
  });

  it('the constitution\u2019s title counts twelve words over ten desk files', () => {
    expect(registry.includes('(thirty-four words, twenty-six desks)')).toBe(true);
  });

  it('the home\u2019s promise roll carries the TWELFTH alongside its elders', () => {
    expect(registry.includes("'TWELFTH'")).toBe(true);
    const home = readFileSync('src/lib/tab-url.ts', 'utf8');
    expect(home.includes('THE PROMISE KEPT, THE TWELFTH WORD')).toBe(true);
  });

  it('the eleventh word\u2019s desk survived untouched (the neighbor\u2019s law)', () => {
    const giftCards = readFileSync('src/app/(shell)/tabs/gift-cards-tab.tsx', 'utf8');
    expect(giftCards.includes("export const GC_STATUS_FILTERS = ['ALL', 'ACTIVE', 'REDEEMED', 'EXPIRED', 'CANCELLED', 'PARTIALLY_REDEEMED'] as const;")).toBe(true);
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
      if (readFileSync(p, 'utf8').includes('dn-status')) collected.push(p);
    }
  }
}

describe('the address-bar vocabulary stays one-writer-per-word', () => {
  it('`dn-status` speaks in exactly the expected files under src/', () => {
    const collected: string[] = [];
    walkSrc('src', collected);
    collected.sort();
    expect(collected).toEqual([
      'src/app/(shell)/tabs/delivery-notes-tab.tsx',
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
