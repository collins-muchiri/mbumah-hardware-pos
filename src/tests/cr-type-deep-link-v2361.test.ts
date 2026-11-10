// THE CREDITS DESK'S OWN WORD (v2.361.0): the customer-credits ledger's
// type lens answers the address bar.
//
// v2.328.0 gave the purchase-orders roster its STATUS word (`?po-status=`),
// v2.329.0 the inventory desk (`?inv-stock=`), v2.330.0 the customers desk
// (`?cust-debt=`), v2.331.0 the suppliers desk (`?sup-status=`), v2.332.0
// that desk's PO section (`?sup-po=`), v2.333.0 the transactions desk's
// payment-method lens (`?txn-pay=`), v2.354.0 its type lens (`?txn-type=`),
// v2.355.0 the rentals desk (`?rent-status=`), v2.356.0 the invoices desk
// (`?inv-status=`), v2.357.0 the transfers desk (`?transfer-status=`),
// v2.358.0 the gift cards desk (`?gc-status=`), v2.359.0 the delivery
// notes desk (`?dn-status=`), v2.360.0 the vouchers desk (`?vc-status=`).
// THE PROMISE KEPT A FOURTEENTH TIME — the credits desk's type lens
// speaks its desk-prefixed `?cr-type=CREDIT|DEBIT|ADJUSTMENT|REFUND` and
// wears the landing chip in the lens's own yellow (the FOURTEENTH family
// — indigo/amber/rose/emerald/cyan/violet/fuchsia/orange/teal/blue/lime/
// sky/pink now gain the credit lens's yellow, the ledger hue) beside the
// desk's own badge voices (the credit badge's green, the debit badge's
// red, the adjustment badge's amber, the refund badge's blue, the stat
// cards' purple — a voice must not masquerade as a badge, and now
// neither borrows the other's clothes). The ledger's types from Credit
// through Debit and Adjustment to Refund are now an address. THE WORD
// BINDS TO THE TYPE LENS ONLY — the desk also carries a customer lens
// with its own Select, untouched, which may earn its own word someday.
// THE NEUTRAL VOICE, LOWERCASE: the desk's all-lens has been spelled
// 'all' since the desk first shipped, so the word's neutral is lowercase
// — the payment word's spelling — and the inverse voice: an UPPERCASE
// spelling of the neutral names nothing here. The UPPERCASE voice
// otherwise (the payment word's voice): a lowercase word is an unknown
// word — never a clever match.
//
// Pins: the parser's truth table (pure, UPPERCASE vocabulary with the
// lowercase neutral), the desk's seed bytes and its cast-free typing,
// the chip's bytes and its two retirement voices, the one-home promise
// (the law's doc carries the fourteenth word), the constitution's
// fourteenth row, and the collision ledger.

import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';

const LOOM = readFileSync('src/components/landing-chip.tsx', 'utf8');
import { join } from 'node:path';
import { parseInitialNamedMember } from '@/lib/tab-url';

const CR_TYPE_FILTERS = ['all', 'CREDIT', 'DEBIT', 'ADJUSTMENT', 'REFUND'] as const;

// ---------------------------------------------------------------------------
// 1. THE PARSER'S TRUTH TABLE (the membership law, one home, the
//    lowercase neutral's INVERSE voice)
// ---------------------------------------------------------------------------

describe('parseInitialNamedMember — the credit lens speaks the one home', () => {
  it('a lens the desk offers seeds the filter', () => {
    expect(parseInitialNamedMember('?cr-type=CREDIT', 'cr-type', CR_TYPE_FILTERS, 'all')).toBe('CREDIT');
    expect(parseInitialNamedMember('?cr-type=DEBIT', 'cr-type', CR_TYPE_FILTERS, 'all')).toBe('DEBIT');
    expect(parseInitialNamedMember('?cr-type=ADJUSTMENT', 'cr-type', CR_TYPE_FILTERS, 'all')).toBe('ADJUSTMENT');
    expect(parseInitialNamedMember('?cr-type=REFUND', 'cr-type', CR_TYPE_FILTERS, 'all')).toBe('REFUND');
  });

  it('the neutral is a member too — the desk\u2019s own spelling seeds the all-lens', () => {
    // this desk's all-lens has been 'all' since the desk first shipped —
    // the const carries it, so the address bar can name it
    expect(parseInitialNamedMember('?cr-type=all', 'cr-type', CR_TYPE_FILTERS, 'all')).toBe('all');
  });

  it('a lens the desk does not offer answers the fallback (never stranded)', () => {
    expect(parseInitialNamedMember('?cr-type=LOAN', 'cr-type', CR_TYPE_FILTERS, 'all')).toBe('all');
    expect(parseInitialNamedMember('?cr-type=', 'cr-type', CR_TYPE_FILTERS, 'all')).toBe('all');
  });

  it('case-sensitive: a lowercase word is an unknown word, not a clever match', () => {
    // the lens's own words are UPPERCASE — `debit` names nothing
    // (the payment word's voice; the INVERSE of the lowercase type word)
    expect(parseInitialNamedMember('?cr-type=debit', 'cr-type', CR_TYPE_FILTERS, 'all')).toBe('all');
    expect(parseInitialNamedMember('?cr-type=Debit', 'cr-type', CR_TYPE_FILTERS, 'all')).toBe('all');
    expect(parseInitialNamedMember('?cr-type=refund', 'cr-type', CR_TYPE_FILTERS, 'all')).toBe('all');
    // AND THE NEUTRAL'S INVERSE VOICE: this desk spells its all-lens
    // 'all', so an UPPERCASE `ALL` is an unknown word here — the exact
    // reverse of the desk whose neutral is capitalized (there, the
    // lowercase spelling is the stranger)
    expect(parseInitialNamedMember('?cr-type=ALL', 'cr-type', CR_TYPE_FILTERS, 'all')).toBe('all');
  });

  it('missing, bare, and malformed searches answer the fallback — never throw', () => {
    expect(parseInitialNamedMember('', 'cr-type', CR_TYPE_FILTERS, 'all')).toBe('all');
    expect(parseInitialNamedMember('?tab=credits', 'cr-type', CR_TYPE_FILTERS, 'all')).toBe('all');
    expect(parseInitialNamedMember('cr-type=DEBIT', 'cr-type', CR_TYPE_FILTERS, 'all')).toBe('DEBIT');
    expect(parseInitialNamedMember('?????', 'cr-type', CR_TYPE_FILTERS, 'all')).toBe('all');
    expect(parseInitialNamedMember('?cr-type=REFUND&page=2', 'cr-type', CR_TYPE_FILTERS, 'all')).toBe('REFUND');
  });

  it('the word rides alongside the vocabulary\u2019s other words without collision', () => {
    // a landing can carry the desk AND its lens AND the neighbors' words
    // — one bar, one word per lens, every lens its own (the REAL tab
    // slug — TAB_CONFIG speaks `credits`)
    expect(
      parseInitialNamedMember('?tab=credits&cr-type=CREDIT&txn-pay=CASH', 'cr-type', CR_TYPE_FILTERS, 'all')
    ).toBe('CREDIT');
    expect(
      parseInitialNamedMember('?tab=credits&cr-type=DEBIT&txn-type=refund', 'cr-type', CR_TYPE_FILTERS, 'all')
    ).toBe('DEBIT');
    expect(
      parseInitialNamedMember('?tab=credits&cr-type=ADJUSTMENT&po-status=PENDING_APPROVAL&inv-stock=low', 'cr-type', CR_TYPE_FILTERS, 'all')
    ).toBe('ADJUSTMENT');
    expect(
      parseInitialNamedMember('?tab=credits&cr-type=REFUND&cust-debt=overdue&sup-status=ACTIVE&sup-po=SENT', 'cr-type', CR_TYPE_FILTERS, 'all')
    ).toBe('REFUND');
    expect(
      parseInitialNamedMember('?tab=credits&cr-type=CREDIT&rent-status=OVERDUE', 'cr-type', CR_TYPE_FILTERS, 'all')
    ).toBe('CREDIT');
    expect(
      parseInitialNamedMember('?tab=credits&cr-type=DEBIT&inv-status=PAID', 'cr-type', CR_TYPE_FILTERS, 'all')
    ).toBe('DEBIT');
    expect(
      parseInitialNamedMember('?tab=credits&cr-type=ADJUSTMENT&transfer-status=PARTIAL', 'cr-type', CR_TYPE_FILTERS, 'all')
    ).toBe('ADJUSTMENT');
    expect(
      parseInitialNamedMember('?tab=credits&cr-type=REFUND&gc-status=REDEEMED', 'cr-type', CR_TYPE_FILTERS, 'all')
    ).toBe('REFUND');
    expect(
      parseInitialNamedMember('?tab=credits&cr-type=CREDIT&dn-status=IN_TRANSIT', 'cr-type', CR_TYPE_FILTERS, 'all')
    ).toBe('CREDIT');
    expect(
      parseInitialNamedMember('?tab=credits&cr-type=DEBIT&vc-status=ACTIVE', 'cr-type', CR_TYPE_FILTERS, 'all')
    ).toBe('DEBIT');
  });
});

// ---------------------------------------------------------------------------
// 2. THE DESK'S SEED — read-on-mount, one home, never a copy, never a cast
// ---------------------------------------------------------------------------

describe('the credits desk — ?cr-type= lands as visible state', () => {
  const desk = readFileSync('src/app/(shell)/tabs/credits-tab.tsx', 'utf8');
  const home = readFileSync('src/lib/tab-url.ts', 'utf8');

  it('the seed reads the word through the ONE home (never a local parser)', () => {
    expect(desk.includes("import { parseInitialNamedMember } from '@/lib/tab-url';")).toBe(true);
    expect(
      desk.includes("parseInitialNamedMember(window.location.search, 'cr-type', CR_TYPE_FILTERS, 'all')")
    ).toBe(true);
    // the home owns the law and carries the fourteenth-word note
    expect(home.includes('export function parseInitialNamedMember')).toBe(true);
    expect(home.includes('v2.361.0 — THE PROMISE KEPT, THE FOURTEENTH WORD')).toBe(true);
  });

  it('the seed is the lazy initializer of the type filter (read-on-mount law)', () => {
    expect(
      desk.includes('const [creditTypeFilter, setCreditTypeFilter] = useState<(typeof CR_TYPE_FILTERS)[number]>(initialCrType);')
    ).toBe(true);
    // the SSR guard answers 'all' before any window exists — the desk's
    // OWN all-lens spelling, lowercase
    expect(desk.includes("if (typeof window === 'undefined') return 'all';")).toBe(true);
    // the desk offers exactly the lenses it names — the neutral lowercase
    expect(
      desk.includes("export const CR_TYPE_FILTERS = ['all', 'CREDIT', 'DEBIT', 'ADJUSTMENT', 'REFUND'] as const;")
    ).toBe(true);
  });

  it('the seed is CAST-FREE — the generic parser IS the union', () => {
    expect(desk.includes('function initialCrType(): (typeof CR_TYPE_FILTERS)[number]')).toBe(true);
    expect(desk.includes('useState<(typeof CR_TYPE_FILTERS)[number]>(initialCrType)')).toBe(true);
    // and no laundering snuck in around the new word
    expect(desk.includes('initialCrType() as')).toBe(false);
    expect(desk.includes('initialCrType as unknown')).toBe(false);
  });

  it('the word is desk-prefixed (the Task 44 collision law) and annotated', () => {
    expect(desk.includes("THE CREDITS DESK'S OWN WORD")).toBe(true);
    expect(desk.includes('?cr-type=DEBIT')).toBe(true);
    // the collision note lives with the word
    expect(desk.includes('Collision-checked at round start')).toBe(true);
  });

  it('the word binds to the TYPE lens only — the customer lens is untouched', () => {
    // the customer lens keeps its own Select with its own setter — the
    // word never reaches it (a second word may earn it someday)
    expect(desk.includes('onValueChange={setSelectedCustomerId}')).toBe(true);
    expect(desk.includes('chooseCustomerType')).toBe(false);
  });

  it('the query rides the lens — the seeded filter reaches the server read', () => {
    // the ledger's read names the lens in its key and its params, so a
    // landed word filters the list, not just the Select's face
    expect(desk.includes("queryKey: ['customer-credits', currentStoreId, selectedCustomerId, creditTypeFilter],")).toBe(true);
    expect(desk.includes("creditType: creditTypeFilter !== 'all' ? creditTypeFilter : undefined,")).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 3. THE LANDING CHIP — the lens answers OUT LOUD, in its own yellow
// ---------------------------------------------------------------------------

describe('the landing chip — the face names the word it answered', () => {
  const desk = readFileSync('src/app/(shell)/tabs/credits-tab.tsx', 'utf8');

  it('the chip renders only while the landing is live AND untouched', () => {
    expect(
      desk.includes("crLandingLive && landedCrType !== 'all' && creditTypeFilter === landedCrType")
    ).toBe(true);
    expect(desk.includes('data-testid="cr-type-landing-word"')).toBe(true);
  });

  it('the chip names the exact word it answered', () => {
    expect(desk.includes('landed ?cr-type=${landedCrType}')).toBe(true);
  });

  it('voice 1 — the dismissal clears the lens the word seeded and retires', () => {
    // anchor the chip BLOCK at its true start (the render conditional) —
    // the comment names the testid too and the attribute sits after the
    // long className, so the block from the conditional carries the whole
    // button: onClick, classes, testid, title, icons
    const at = desk.indexOf("crLandingLive && landedCrType !== 'all'");
    const block = desk.slice(at, at + 900);
    expect(block).toContain("setCreditTypeFilter('all')");
    expect(block).toContain('setCrLandingLive(false)');
    expect(block).toContain('data-testid="cr-type-landing-word"');
  });

  it('voice 2 — a hand-driven Select change retires the chip', () => {
    expect(desk.includes('<Select value={creditTypeFilter} onValueChange={chooseCrType}>')).toBe(true);
    expect(desk.includes('a hand-driven change retires the landing word')).toBe(true);
  });

  it('the voices are honest — the desk claims exactly the two it has', () => {
    expect(desk.includes("hand-driven Select change or the chip's own dismissal")).toBe(true);
    expect(desk.includes('THE TWO VOICES:')).toBe(true);
  });

  it('the chip lives in the ALWAYS-RENDERED Filters Row (the landing needs no panel)', () => {
    // the chip block sits in the toolbar's own flex row, BEFORE the type
    // Select — always rendered, never behind a collapsible gate; the
    // landing is dismissible without opening anything
    const chipAt = desk.indexOf('data-testid="cr-type-landing-word"');
    const selectAt = desk.indexOf('<Select value={creditTypeFilter} onValueChange={chooseCrType}>');
    expect(chipAt).toBeGreaterThan(-1);
    expect(selectAt).toBeGreaterThan(chipAt);
  });

  it('the chip wears the lens\u2019s yellow family in BOTH modes', () => {
    // v2.397.0 THE LOOM: the elder wardrobe moved into the loom's 200
    // registry — the desk proves its family by hue, the registry carries
    // the bytes.
    expect(desk.includes('hue="yellow"')).toBe(true);
    expect(LOOM.includes('border-yellow-200 bg-yellow-50 text-yellow-700')).toBe(true);
    expect(LOOM.includes('dark:border-yellow-500/30 dark:bg-yellow-500/10 dark:text-yellow-300')).toBe(true);
  });

  it('the dismiss hint sharpens on hover (the group-hover detail)', () => {
    expect(LOOM.includes('opacity-60 transition-opacity group-hover:opacity-100')).toBe(true);
  });

  it('the chip explains itself (the tooltip law)', () => {
    expect(desk.includes('title="The desk landed with this filter from the address bar — press to clear it"')).toBe(true);
    expect(LOOM.includes('aria-hidden="true"')).toBe(true); // v2.397.0 THE LOOM: the icons live in the one hand
  });

  it('the desk\u2019s own voices keep their families beside the chip (no masquerade)', () => {
    // the type-badge helper speaks green (credit), red (debit), amber
    // (adjustment), blue (refund); the stat cards speak purple — voices,
    // not badges; none borrows the chip's yellow
    expect(desk.includes('bg-green-100 text-green-800')).toBe(true);
    expect(desk.includes('bg-red-100 text-red-800')).toBe(true);
    expect(desk.includes('bg-amber-100 text-amber-800')).toBe(true);
    expect(desk.includes('bg-blue-100 text-blue-800')).toBe(true);
    // and the chip's yellow stays its own
    expect(LOOM.includes('border-yellow-200 bg-yellow-50 text-yellow-700 text-xs font-medium')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 4. THE CONSTITUTION — the vocabulary's registry grows to fourteen, cross-pinned
// ---------------------------------------------------------------------------

describe('the address-bar vocabulary — the constitution\u2019s fourteenth row', () => {
  const registry = readFileSync('src/tests/transfer-status-deep-link-v2357.test.ts', 'utf8');

  it('the constitution carries the fourteenth word in its WORDS array', () => {
    expect(
      registry.includes("{ word: 'cr-type', desk: 'src/app/(shell)/tabs/credits-tab.tsx', family: 'border-yellow-200', suite: 'src/tests/cr-type-deep-link-v2361.test.ts' }")
    ).toBe(true);
  });

  it('the constitution\u2019s title counts fourteen words over twelve desk files', () => {
    expect(registry.includes('(forty-eight words, thirty-two desks)')).toBe(true);
  });

  it('the home\u2019s promise roll carries the FOURTEENTH alongside its elders', () => {
    expect(registry.includes("'FOURTEENTH'")).toBe(true);
    const home = readFileSync('src/lib/tab-url.ts', 'utf8');
    expect(home.includes('THE PROMISE KEPT, THE FOURTEENTH WORD')).toBe(true);
  });

  it('the thirteenth word\u2019s desk survived untouched (the neighbor\u2019s law)', () => {
    const vouchers = readFileSync('src/app/(shell)/tabs/vouchers-tab.tsx', 'utf8');
    expect(vouchers.includes("export const VC_STATUS_FILTERS = ['all', 'ACTIVE', 'PAUSED', 'EXPIRED', 'CANCELLED'] as const;")).toBe(true);
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
      if (readFileSync(p, 'utf8').includes('cr-type')) collected.push(p);
    }
  }
}

describe('the address-bar vocabulary stays one-writer-per-word', () => {
  it('`cr-type` speaks in exactly the expected files under src/', () => {
    const collected: string[] = [];
    walkSrc('src', collected);
    collected.sort();
    expect(collected).toEqual([
      'src/app/(shell)/tabs/credits-tab.tsx',
      'src/lib/tab-url.ts',
      'src/lib/whats-new.ts',
      // the thirteen neighbor ledgers admitted this test file — and an
      // admission line carries the word it admits (the LEDGER-CITATION
      // RIPPLE: a ledger is an honest speaker of every word it lists)
      // and this file joins its own ledger (an admission line carries the
      // word it admits — the ripple's second-order form, pinned above)
      'src/tests/ad-severity-deep-link-v2366.test.ts',
      'src/tests/cat-stock-deep-link-v2364.test.ts',
      // the catalog's own ledger — admitted (its registry section reads
      // this file's rows and its sorted-place pin names this word; an
      // admission line carries the word it admits; sorted place:
      // cat-stock < cat-view < cr-type)
      'src/tests/cat-view-address-v2491.test.ts',
      'src/tests/cr-type-deep-link-v2361.test.ts',
      'src/tests/cust-debt-deep-link-v2330.test.ts',
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
