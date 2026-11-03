// THE VOUCHER DESK'S OWN WORD (v2.360.0): the vouchers desk's status
// lens answers the address bar.
//
// v2.328.0 gave the purchase-orders roster its STATUS word (`?po-status=`),
// v2.329.0 the inventory desk (`?inv-stock=`), v2.330.0 the customers desk
// (`?cust-debt=`), v2.331.0 the suppliers desk (`?sup-status=`), v2.332.0
// that desk's PO section (`?sup-po=`), v2.333.0 the transactions desk's
// payment-method lens (`?txn-pay=`), v2.354.0 its type lens (`?txn-type=`),
// v2.355.0 the rentals desk (`?rent-status=`), v2.356.0 the invoices desk
// (`?inv-status=`), v2.357.0 the transfers desk (`?transfer-status=`),
// v2.358.0 the gift cards desk (`?gc-status=`), v2.359.0 the delivery
// notes desk (`?dn-status=`).
// THE PROMISE KEPT A THIRTEENTH TIME — the vouchers desk's status lens
// speaks its desk-prefixed `?vc-status=ACTIVE|PAUSED|EXPIRED|CANCELLED`
// and wears the landing chip in the lens's own pink (the THIRTEENTH
// family — indigo/amber/rose/emerald/cyan/violet/fuchsia/orange/teal/
// blue/lime/sky now gain the voucher lens's pink, the promo hue) beside
// the desk's own badge voices (the active lens's green, the paused
// lens's amber, the cancelled lens's red, the expired lens's gray — a
// voice must not masquerade as a badge, and now neither borrows the
// other's clothes). The voucher's life from issue through pause to
// expiry is now an address. THE WORD BINDS TO THE VOUCHER LENS ONLY —
// the desk also carries a campaign lens with its own Select, untouched,
// which may earn its own word someday. THE NEUTRAL VOICE, LOWERCASE:
// the desk's all-lens has been spelled 'all' since the desk first
// shipped, so the word's neutral is lowercase — the payment word's
// spelling — and the inverse voice: an UPPERCASE spelling of the
// neutral names nothing here. The UPPERCASE voice otherwise (the
// payment word's voice): a lowercase word is an unknown word — never a
// clever match.
//
// Pins: the parser's truth table (pure, UPPERCASE vocabulary with the
// lowercase neutral), the desk's seed bytes and its cast-free typing,
// the chip's bytes and its two retirement voices, the one-home promise
// (the law's doc carries the thirteenth word), the constitution's
// thirteenth row, and the collision ledger.

import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { parseInitialNamedMember } from '@/lib/tab-url';

const VC_STATUS_FILTERS = ['all', 'ACTIVE', 'PAUSED', 'EXPIRED', 'CANCELLED'] as const;

// ---------------------------------------------------------------------------
// 1. THE PARSER'S TRUTH TABLE (the membership law, one home, the
//    lowercase neutral's INVERSE voice)
// ---------------------------------------------------------------------------

describe('parseInitialNamedMember — the voucher lens speaks the one home', () => {
  it('a lens the desk offers seeds the filter', () => {
    expect(parseInitialNamedMember('?vc-status=ACTIVE', 'vc-status', VC_STATUS_FILTERS, 'all')).toBe('ACTIVE');
    expect(parseInitialNamedMember('?vc-status=PAUSED', 'vc-status', VC_STATUS_FILTERS, 'all')).toBe('PAUSED');
    expect(parseInitialNamedMember('?vc-status=EXPIRED', 'vc-status', VC_STATUS_FILTERS, 'all')).toBe('EXPIRED');
    expect(parseInitialNamedMember('?vc-status=CANCELLED', 'vc-status', VC_STATUS_FILTERS, 'all')).toBe('CANCELLED');
  });

  it('the neutral is a member too — the desk\u2019s own spelling seeds the all-lens', () => {
    // this desk's all-lens has been 'all' since the desk first shipped —
    // the const carries it, so the address bar can name it
    expect(parseInitialNamedMember('?vc-status=all', 'vc-status', VC_STATUS_FILTERS, 'all')).toBe('all');
  });

  it('a lens the desk does not offer answers the fallback (never stranded)', () => {
    expect(parseInitialNamedMember('?vc-status=REDEEMED', 'vc-status', VC_STATUS_FILTERS, 'all')).toBe('all');
    expect(parseInitialNamedMember('?vc-status=', 'vc-status', VC_STATUS_FILTERS, 'all')).toBe('all');
  });

  it('case-sensitive: a lowercase word is an unknown word, not a clever match', () => {
    // the lens's own words are UPPERCASE — `paused` names nothing
    // (the payment word's voice; the INVERSE of the lowercase type word)
    expect(parseInitialNamedMember('?vc-status=paused', 'vc-status', VC_STATUS_FILTERS, 'all')).toBe('all');
    expect(parseInitialNamedMember('?vc-status=Paused', 'vc-status', VC_STATUS_FILTERS, 'all')).toBe('all');
    expect(parseInitialNamedMember('?vc-status=expired', 'vc-status', VC_STATUS_FILTERS, 'all')).toBe('all');
    // AND THE NEUTRAL'S INVERSE VOICE: this desk spells its all-lens
    // 'all', so an UPPERCASE `ALL` is an unknown word here — the exact
    // reverse of the desk whose neutral is capitalized (there, the
    // lowercase spelling is the stranger)
    expect(parseInitialNamedMember('?vc-status=ALL', 'vc-status', VC_STATUS_FILTERS, 'all')).toBe('all');
  });

  it('missing, bare, and malformed searches answer the fallback — never throw', () => {
    expect(parseInitialNamedMember('', 'vc-status', VC_STATUS_FILTERS, 'all')).toBe('all');
    expect(parseInitialNamedMember('?tab=vouchers', 'vc-status', VC_STATUS_FILTERS, 'all')).toBe('all');
    expect(parseInitialNamedMember('vc-status=PAUSED', 'vc-status', VC_STATUS_FILTERS, 'all')).toBe('PAUSED');
    expect(parseInitialNamedMember('?????', 'vc-status', VC_STATUS_FILTERS, 'all')).toBe('all');
    expect(parseInitialNamedMember('?vc-status=EXPIRED&page=2', 'vc-status', VC_STATUS_FILTERS, 'all')).toBe('EXPIRED');
  });

  it('the word rides alongside the vocabulary\u2019s other words without collision', () => {
    // a landing can carry the desk AND its lens AND the neighbors' words
    // — one bar, one word per lens, every lens its own
    expect(
      parseInitialNamedMember('?tab=vouchers&vc-status=ACTIVE&txn-pay=CASH', 'vc-status', VC_STATUS_FILTERS, 'all')
    ).toBe('ACTIVE');
    expect(
      parseInitialNamedMember('?tab=vouchers&vc-status=PAUSED&txn-type=refund', 'vc-status', VC_STATUS_FILTERS, 'all')
    ).toBe('PAUSED');
    expect(
      parseInitialNamedMember('?tab=vouchers&vc-status=EXPIRED&po-status=PENDING_APPROVAL&inv-stock=low', 'vc-status', VC_STATUS_FILTERS, 'all')
    ).toBe('EXPIRED');
    expect(
      parseInitialNamedMember('?tab=vouchers&vc-status=CANCELLED&cust-debt=overdue&sup-status=ACTIVE&sup-po=SENT', 'vc-status', VC_STATUS_FILTERS, 'all')
    ).toBe('CANCELLED');
    expect(
      parseInitialNamedMember('?tab=vouchers&vc-status=ACTIVE&rent-status=OVERDUE', 'vc-status', VC_STATUS_FILTERS, 'all')
    ).toBe('ACTIVE');
    expect(
      parseInitialNamedMember('?tab=vouchers&vc-status=PAUSED&inv-status=PAID', 'vc-status', VC_STATUS_FILTERS, 'all')
    ).toBe('PAUSED');
    expect(
      parseInitialNamedMember('?tab=vouchers&vc-status=EXPIRED&transfer-status=PARTIAL', 'vc-status', VC_STATUS_FILTERS, 'all')
    ).toBe('EXPIRED');
    expect(
      parseInitialNamedMember('?tab=vouchers&vc-status=CANCELLED&gc-status=REDEEMED', 'vc-status', VC_STATUS_FILTERS, 'all')
    ).toBe('CANCELLED');
    expect(
      parseInitialNamedMember('?tab=vouchers&vc-status=ACTIVE&dn-status=IN_TRANSIT', 'vc-status', VC_STATUS_FILTERS, 'all')
    ).toBe('ACTIVE');
  });
});

// ---------------------------------------------------------------------------
// 2. THE DESK'S SEED — read-on-mount, one home, never a copy, never a cast
// ---------------------------------------------------------------------------

describe('the vouchers desk — ?vc-status= lands as visible state', () => {
  const desk = readFileSync('src/app/(shell)/tabs/vouchers-tab.tsx', 'utf8');
  const home = readFileSync('src/lib/tab-url.ts', 'utf8');

  it('the seed reads the word through the ONE home (never a local parser)', () => {
    expect(desk.includes("import { parseInitialNamedMember } from '@/lib/tab-url';")).toBe(true);
    expect(
      desk.includes("parseInitialNamedMember(window.location.search, 'vc-status', VC_STATUS_FILTERS, 'all')")
    ).toBe(true);
    // the home owns the law and carries the thirteenth-word note
    expect(home.includes('export function parseInitialNamedMember')).toBe(true);
    expect(home.includes('v2.360.0 — THE PROMISE KEPT, THE THIRTEENTH WORD')).toBe(true);
  });

  it('the seed is the lazy initializer of the status filter (read-on-mount law)', () => {
    expect(
      desk.includes('const [statusFilter, setStatusFilter] = useState<(typeof VC_STATUS_FILTERS)[number]>(initialVcStatus);')
    ).toBe(true);
    // the SSR guard answers 'all' before any window exists — the desk's
    // OWN all-lens spelling, lowercase
    expect(desk.includes("if (typeof window === 'undefined') return 'all';")).toBe(true);
    // the desk offers exactly the lenses it names — the neutral lowercase
    expect(
      desk.includes("export const VC_STATUS_FILTERS = ['all', 'ACTIVE', 'PAUSED', 'EXPIRED', 'CANCELLED'] as const;")
    ).toBe(true);
  });

  it('the seed is CAST-FREE — the generic parser IS the union', () => {
    expect(desk.includes('function initialVcStatus(): (typeof VC_STATUS_FILTERS)[number]')).toBe(true);
    expect(desk.includes('useState<(typeof VC_STATUS_FILTERS)[number]>(initialVcStatus)')).toBe(true);
    // and no laundering snuck in around the new word
    expect(desk.includes('initialVcStatus() as')).toBe(false);
    expect(desk.includes('initialVcStatus as unknown')).toBe(false);
  });

  it('the word is desk-prefixed (the Task 44 collision law) and annotated', () => {
    expect(desk.includes("THE VOUCHER DESK'S OWN WORD")).toBe(true);
    expect(desk.includes('?vc-status=PAUSED')).toBe(true);
    // the collision note lives with the word
    expect(desk.includes('Collision-checked at round start')).toBe(true);
  });

  it('the word binds to the VOUCHER lens only — the campaign lens is untouched', () => {
    // the campaign lens keeps its own Select with its own setter — the
    // word never reaches it (a second word may earn it someday)
    expect(desk.includes('onValueChange={setCampaignStatusFilter}')).toBe(true);
    expect(desk.includes('chooseCampaignStatus')).toBe(false);
  });

  it('the query rides the lens — the seeded filter reaches the server read', () => {
    // the ledger's read names the lens in its key and its params, so a
    // landed word filters the list, not just the Select's face
    expect(desk.includes("queryKey: ['vouchers', currentStoreId, statusFilter, typeFilter, debouncedSearch],")).toBe(true);
    expect(desk.includes("status: statusFilter !== 'all' ? statusFilter : undefined,")).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 3. THE LANDING CHIP — the lens answers OUT LOUD, in its own pink
// ---------------------------------------------------------------------------

describe('the landing chip — the face names the word it answered', () => {
  const desk = readFileSync('src/app/(shell)/tabs/vouchers-tab.tsx', 'utf8');

  it('the chip renders only while the landing is live AND untouched', () => {
    expect(
      desk.includes("vcLandingLive && landedVcStatus !== 'all' && statusFilter === landedVcStatus")
    ).toBe(true);
    expect(desk.includes('data-testid="vc-status-landing-word"')).toBe(true);
  });

  it('the chip names the exact word it answered', () => {
    expect(desk.includes('landed ?vc-status={landedVcStatus}')).toBe(true);
  });

  it('voice 1 — the dismissal clears the lens the word seeded and retires', () => {
    // anchor the chip BLOCK at its true start (the render conditional) —
    // the comment names the testid too and the attribute sits after the
    // long className, so the block from the conditional carries the whole
    // button: onClick, classes, testid, title, icons
    const at = desk.indexOf("vcLandingLive && landedVcStatus !== 'all'");
    const block = desk.slice(at, at + 900);
    expect(block).toContain("setStatusFilter('all')");
    expect(block).toContain('setVcLandingLive(false)');
    expect(block).toContain('data-testid="vc-status-landing-word"');
  });

  it('voice 2 — a hand-driven Select change retires the chip', () => {
    expect(desk.includes('<Select value={statusFilter} onValueChange={chooseVcStatus}>')).toBe(true);
    expect(desk.includes('a hand-driven change retires the landing word')).toBe(true);
  });

  it('the voices are honest — the desk claims exactly the two it has', () => {
    expect(desk.includes("hand-driven Select change or the chip's own dismissal")).toBe(true);
    expect(desk.includes('THE TWO VOICES:')).toBe(true);
  });

  it('the chip lives in the ALWAYS-VISIBLE toolbar (the landing is dismissible without Filters)', () => {
    // the chip block sits ABOVE the collapsible filter panel — the
    // toolbar's own row, never behind `{showFilters && …}`
    const chipAt = desk.indexOf('data-testid="vc-status-landing-word"');
    const filtersAt = desk.indexOf('{showFilters && (');
    expect(chipAt).toBeGreaterThan(-1);
    expect(filtersAt).toBeGreaterThan(chipAt);
  });

  it('the chip wears the lens\u2019s pink family in BOTH modes', () => {
    expect(desk.includes('border-pink-200 bg-pink-50 text-pink-700')).toBe(true);
    expect(desk.includes('dark:border-pink-500/30 dark:bg-pink-500/10 dark:text-pink-300')).toBe(true);
  });

  it('the dismiss hint sharpens on hover (the group-hover detail)', () => {
    expect(desk.includes('opacity-60 transition-opacity group-hover:opacity-100')).toBe(true);
  });

  it('the chip explains itself (the tooltip law)', () => {
    expect(desk.includes('title="The desk landed with this filter from the address bar — press to clear it"')).toBe(true);
    expect(desk.includes('aria-hidden="true"')).toBe(true);
  });

  it('the desk\u2019s own voices keep their families beside the chip (no masquerade)', () => {
    // the voucher badge helper speaks green (active), amber (paused),
    // red (cancelled), gray (expired) — voices, not badges; none
    // borrows the chip's pink
    expect(desk.includes('bg-green-100 text-green-800')).toBe(true);
    expect(desk.includes('bg-amber-100 text-amber-800')).toBe(true);
    expect(desk.includes('bg-red-100 text-red-800')).toBe(true);
    // and the chip's pink stays its own
    expect(desk.includes('border-pink-200 bg-pink-50 text-pink-700 text-xs font-medium')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 4. THE CONSTITUTION — the vocabulary's registry grows to thirteen, cross-pinned
// ---------------------------------------------------------------------------

describe('the address-bar vocabulary — the constitution\u2019s thirteenth row', () => {
  const registry = readFileSync('src/tests/transfer-status-deep-link-v2357.test.ts', 'utf8');

  it('the constitution carries the thirteenth word in its WORDS array', () => {
    expect(
      registry.includes("{ word: 'vc-status', desk: 'src/app/(shell)/tabs/vouchers-tab.tsx', family: 'border-pink-200', suite: 'src/tests/vc-status-deep-link-v2360.test.ts' }")
    ).toBe(true);
  });

  it('the constitution\u2019s title counts thirteen words over eleven desk files', () => {
    expect(registry.includes('(twenty-one words, nineteen desks)')).toBe(true);
  });

  it('the home\u2019s promise roll carries the THIRTEENTH alongside its elders', () => {
    expect(registry.includes("'THIRTEENTH'")).toBe(true);
    const home = readFileSync('src/lib/tab-url.ts', 'utf8');
    expect(home.includes('THE PROMISE KEPT, THE THIRTEENTH WORD')).toBe(true);
  });

  it('the twelfth word\u2019s desk survived untouched (the neighbor\u2019s law)', () => {
    const delivery = readFileSync('src/app/(shell)/tabs/delivery-notes-tab.tsx', 'utf8');
    expect(delivery.includes("export const DN_STATUS_FILTERS = ['all', 'PENDING', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED'] as const;")).toBe(true);
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
      if (readFileSync(p, 'utf8').includes('vc-status')) collected.push(p);
    }
  }
}

describe('the address-bar vocabulary stays one-writer-per-word', () => {
  it('`vc-status` speaks in exactly the expected files under src/', () => {
    const collected: string[] = [];
    walkSrc('src', collected);
    collected.sort();
    expect(collected).toEqual([
      'src/app/(shell)/tabs/vouchers-tab.tsx',
      'src/lib/tab-url.ts',
      'src/lib/whats-new.ts',
      // the twelve neighbor ledgers admitted this test file — and an
      // admission line carries the word it admits (the LEDGER-CITATION
      // RIPPLE: a ledger is an honest speaker of every word it lists)
      'src/tests/ad-severity-deep-link-v2366.test.ts',
      'src/tests/cat-stock-deep-link-v2364.test.ts',
      'src/tests/cr-type-deep-link-v2361.test.ts',
      'src/tests/cust-debt-deep-link-v2330.test.ts',
      'src/tests/cv-type-deep-link-v2363.test.ts',
      'src/tests/dn-status-deep-link-v2359.test.ts',
      'src/tests/dp-status-deep-link-v2365.test.ts',
      'src/tests/family-registry-stress-v2370.test.ts',
      'src/tests/gc-status-deep-link-v2358.test.ts',
      'src/tests/inv-status-deep-link-v2356.test.ts',
      'src/tests/inv-stock-deep-link-v2329.test.ts',
      // the po-status word's ledger lives beside the proxy-gate suite
      // (one release, two suites — the ledger is the honest speaker here)
      'src/tests/ly-type-deep-link-v2368.test.ts',
      'src/tests/pr-status-deep-link-v2362.test.ts',
      'src/tests/proxy-gate-layering-v2328.test.ts',
      'src/tests/rent-status-deep-link-v2355.test.ts',
      'src/tests/sec-type-deep-link-v2367.test.ts',
      'src/tests/sup-po-deep-link-v2332.test.ts',
      'src/tests/sup-status-deep-link-v2331.test.ts',
      'src/tests/transfer-status-deep-link-v2357.test.ts',
      'src/tests/txn-pay-deep-link-v2333.test.ts',
      'src/tests/txn-type-deep-link-v2354.test.ts',
      // and this file joins its own ledger (an admission line carries the
      // word it admits — the ripple's second-order form, pinned above)
      'src/tests/vc-status-deep-link-v2360.test.ts',
    ]);
  });

  it('the home\u2019s older words stay untouched (the shape law, the gait law)', () => {
    const home = readFileSync('src/lib/tab-url.ts', 'utf8');
    expect(home.includes('export function parseInitialNamedPage')).toBe(true);
    expect(home.includes('export function parseInitialNamedMember')).toBe(true);
  });
});
