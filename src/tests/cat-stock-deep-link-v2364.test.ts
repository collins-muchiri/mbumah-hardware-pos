// THE CATALOG DESK'S OWN WORD (v2.364.0): the shop floor's shelves answer
// the address bar.
//
// v2.328.0 gave the purchase-orders roster its STATUS word (`?po-status=`),
// v2.329.0 the inventory desk, v2.330.0 the customers desk, v2.331.0 the
// suppliers desk, v2.332.0 that desk's PO section, v2.333.0 the
// transactions desk's payment-method lens, v2.354.0 its type lens,
// v2.355.0 the rentals desk, v2.356.0 the invoices desk, v2.357.0 the
// transfers desk, v2.358.0 the gift cards desk, v2.359.0 the delivery
// notes desk, v2.360.0 the vouchers desk, v2.361.0 the credits desk,
// v2.362.0 the payroll desk, v2.363.0 the conversations desk. THE PROMISE
// KEPT A SEVENTEENTH TIME — the catalog desk's stock lens speaks its
// desk-prefixed `?cat-stock=all|in_stock|low_stock|out_of_stock` and wears
// the landing chip in the lens's own purple (the SEVENTEENTH family —
// indigo/amber/rose/emerald/cyan/violet/fuchsia/orange/teal/blue/lime/sky/
// pink/yellow/stone/slate now gain the shelf lens's purple, the catalog's
// plum — the paint-deck hue this yard itself sells) beside the desk's own
// voices (the stock badges' amber, the danger accents' red, the success
// notes' green — a voice must not masquerade as a badge, and now neither
// borrows the other's clothes). The shelves' standing is now an address.
// THE NEUTRAL VOICE, LOWERCASE: this desk's all-lens is spelled 'all' and
// its words are the Select's own lowercase spellings (in_stock /
// low_stock / out_of_stock), so an UPPERCASE `IN_STOCK` or `ALL` is an
// unknown word here — the exact inverse of the capitalized-neutral desks.
// THE COLLAPSIBLE-FACE AMENDMENT: the lens lives inside the desk's
// collapsible filters panel — a top-level pane the panel can hide — so a
// landing that carries the word RAISES THE PANEL IT LANDS INTO (the
// panel's seed reads the same landed word) and the chip is visible on
// landing; closing the panel afterwards is the human's navigation, not a
// lens change.
//
// Pins: the parser's truth table (pure, lowercase vocabulary, the
// neutral's self-seed AND its capitalized inversion), the desk's seed
// bytes and its cast-free typing (the Select's old laundering cast is
// GONE — the round's only new `as` byte is the keyset's own `as const`),
// the amendment's mounting bytes, the client-side read filter bytes (the
// word filters the LIST, not just the Select's face), the chip's bytes
// and its THREE retirement voices, the one-home promise (the law's doc
// carries the seventeenth word), the collision ledger — and the
// constitution's seventeenth row from its own suite.

import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';

const LOOM = readFileSync('src/components/landing-chip.tsx', 'utf8');
import { join } from 'node:path';
import { parseInitialNamedMember } from '@/lib/tab-url';

const CAT_STOCK_FILTERS = ['all', 'in_stock', 'low_stock', 'out_of_stock'] as const;

// ---------------------------------------------------------------------------
// 1. THE PARSER'S TRUTH TABLE (the membership law, one home, LOWERCASE voice,
//    the LOWERCASE neutral)
// ---------------------------------------------------------------------------

describe('parseInitialNamedMember — the shelf lens speaks the one home', () => {
  it('a lens the desk offers seeds the filter', () => {
    expect(parseInitialNamedMember('?cat-stock=in_stock', 'cat-stock', CAT_STOCK_FILTERS, 'all')).toBe('in_stock');
    expect(parseInitialNamedMember('?cat-stock=low_stock', 'cat-stock', CAT_STOCK_FILTERS, 'all')).toBe('low_stock');
    expect(parseInitialNamedMember('?cat-stock=out_of_stock', 'cat-stock', CAT_STOCK_FILTERS, 'all')).toBe('out_of_stock');
  });

  it('a lens the desk does not offer answers the fallback (never stranded)', () => {
    expect(parseInitialNamedMember('?cat-stock=discontinued', 'cat-stock', CAT_STOCK_FILTERS, 'all')).toBe('all');
    expect(parseInitialNamedMember('?cat-stock=', 'cat-stock', CAT_STOCK_FILTERS, 'all')).toBe('all');
  });

  it('case-sensitive: a capitalized word is an unknown word, not a clever match', () => {
    // the lens's own words are lowercase — `IN_STOCK` names nothing
    // (the exact inverse of the UPPERCASE-vocabulary desks)
    expect(parseInitialNamedMember('?cat-stock=IN_STOCK', 'cat-stock', CAT_STOCK_FILTERS, 'all')).toBe('all');
    expect(parseInitialNamedMember('?cat-stock=Low_Stock', 'cat-stock', CAT_STOCK_FILTERS, 'all')).toBe('all');
    expect(parseInitialNamedMember('?cat-stock=instock', 'cat-stock', CAT_STOCK_FILTERS, 'all')).toBe('all');
  });

  it('the NEUTRAL IS LOWERCASE here — UPPERCASE ALL names nothing (the inversion)', () => {
    // the desk's all-lens is spelled 'all' (the Select's own value since
    // the desk first shipped): a capitalized spelling is an unknown word,
    // the exact inverse of the capitalized-neutral desks — and the
    // lowercase neutral seeds itself (the fallback IS the member)
    expect(parseInitialNamedMember('?cat-stock=ALL', 'cat-stock', CAT_STOCK_FILTERS, 'all')).toBe('all');
    expect(parseInitialNamedMember('?cat-stock=all', 'cat-stock', CAT_STOCK_FILTERS, 'all')).toBe('all');
  });

  it('missing, bare, and malformed searches answer the fallback — never throw', () => {
    expect(parseInitialNamedMember('', 'cat-stock', CAT_STOCK_FILTERS, 'all')).toBe('all');
    expect(parseInitialNamedMember('?tab=catalog', 'cat-stock', CAT_STOCK_FILTERS, 'all')).toBe('all');
    expect(parseInitialNamedMember('cat-stock=low_stock', 'cat-stock', CAT_STOCK_FILTERS, 'all')).toBe('low_stock');
    expect(parseInitialNamedMember('?????', 'cat-stock', CAT_STOCK_FILTERS, 'all')).toBe('all');
    expect(parseInitialNamedMember('?cat-stock=low_stock&page=2', 'cat-stock', CAT_STOCK_FILTERS, 'all')).toBe('low_stock');
  });

  it('the word rides alongside the vocabulary\u2019s other words without collision', () => {
    // a landing can carry the desk AND its lens AND the neighbors' words
    // — one bar, one word per lens, every lens its own
    expect(
      parseInitialNamedMember('?tab=catalog&cat-stock=low_stock&txn-type=refund', 'cat-stock', CAT_STOCK_FILTERS, 'all')
    ).toBe('low_stock');
    expect(
      parseInitialNamedMember('?tab=catalog&cat-stock=out_of_stock&rent-status=OVERDUE', 'cat-stock', CAT_STOCK_FILTERS, 'all')
    ).toBe('out_of_stock');
    expect(
      parseInitialNamedMember('?tab=catalog&cat-stock=in_stock&po-status=PENDING_APPROVAL&inv-stock=low', 'cat-stock', CAT_STOCK_FILTERS, 'all')
    ).toBe('in_stock');
    expect(
      parseInitialNamedMember('?tab=catalog&cat-stock=low_stock&pr-status=ACTIVE&cust-debt=overdue&sup-status=ACTIVE', 'cat-stock', CAT_STOCK_FILTERS, 'all')
    ).toBe('low_stock');
    expect(
      parseInitialNamedMember('?tab=catalog&cat-stock=in_stock&sup-po=SENT&txn-pay=CASH&cv-type=INTERNAL', 'cat-stock', CAT_STOCK_FILTERS, 'all')
    ).toBe('in_stock');
    expect(
      parseInitialNamedMember('?tab=catalog&cat-stock=out_of_stock&inv-status=PAID&gc-status=REDEEMED&dn-status=DELIVERED&vc-status=PAUSED&cr-type=DEBIT&transfer-status=IN_TRANSIT', 'cat-stock', CAT_STOCK_FILTERS, 'all')
    ).toBe('out_of_stock');
  });
});

// ---------------------------------------------------------------------------
// 2. THE DESK'S SEED — read-on-mount, one home, never a copy, never a cast
// ---------------------------------------------------------------------------

describe('the catalog desk — ?cat-stock= lands as visible state', () => {
  const desk = readFileSync('src/app/(shell)/tabs/catalog-tab.tsx', 'utf8');
  const home = readFileSync('src/lib/tab-url.ts', 'utf8');

  it('the seed reads the word through the ONE home (never a local parser)', () => {
    expect(desk.includes("import { parseInitialNamedMember } from '@/lib/tab-url';")).toBe(true);
    expect(
      desk.includes("parseInitialNamedMember(window.location.search, 'cat-stock', CAT_STOCK_FILTERS, 'all')")
    ).toBe(true);
    // the home owns the law and carries the seventeenth-word note
    expect(home.includes('export function parseInitialNamedMember')).toBe(true);
    expect(home.includes('v2.364.0 — THE PROMISE KEPT, THE SEVENTEENTH WORD')).toBe(true);
  });

  it('the seed is the lazy initializer of the stock filter (read-on-mount law)', () => {
    expect(
      desk.includes('const [stockFilter, setStockFilter] = useState<StockFilter>(initialCatStock);')
    ).toBe(true);
    // the SSR guard answers the neutral before any window exists
    expect(desk.includes("if (typeof window === 'undefined') return 'all';")).toBe(true);
    // the desk offers exactly the lenses it names
    expect(
      desk.includes("export const CAT_STOCK_FILTERS = ['all', 'in_stock', 'low_stock', 'out_of_stock'] as const;")
    ).toBe(true);
  });

  it('the seed is CAST-FREE — the generic parser IS the union (and the old cast is GONE)', () => {
    expect(desk.includes('function initialCatStock(): (typeof CAT_STOCK_FILTERS)[number]')).toBe(true);
    expect(desk.includes('type StockFilter = (typeof CAT_STOCK_FILTERS)[number];')).toBe(true);
    expect(desk.includes('useState<StockFilter>(initialCatStock)')).toBe(true);
    // no laundering snuck in around the new word…
    expect(desk.includes('initialCatStock() as')).toBe(false);
    expect(desk.includes('initialCatStock as unknown')).toBe(false);
    // …and the Select's OLD laundering cast is gone — the chooser is typed
    expect(desk.includes('onValueChange={(v) => setStockFilter(v as StockFilter)}')).toBe(false);
  });

  it('the word is desk-prefixed (the Task 44 collision law) and annotated', () => {
    expect(desk.includes("THE CATALOG DESK'S OWN WORD")).toBe(true);
    expect(desk.includes('?cat-stock=low_stock')).toBe(true);
    // the collision note lives with the word
    expect(desk.includes('Collision-checked at round start')).toBe(true);
  });

  it('THE COLLAPSIBLE-FACE AMENDMENT — the landing raises the panel it lands into', () => {
    // the lens rides the desk's collapsible filters panel — a top-level
    // pane (no TabsContent on this desk) the panel can hide
    expect(desk.includes('<TabsContent')).toBe(false);
    // the panel's seed reads the SAME landed word: a landing that carries
    // the word opens the panel, so the chip is visible on landing
    expect(desk.includes("const [showFilters, setShowFilters] = useState<boolean>(() => landedCatStock !== 'all');")).toBe(true);
    // the face is DOCUMENTED at the word, not just practiced
    expect(desk.includes('THE COLLAPSIBLE-FACE AMENDMENT')).toBe(true);
  });

  it('the word filters the LIST, not just the Select\u2019s face (the client-side read)', () => {
    // the desk's products read filters client-side through the useMemo's
    // own membership checks — a landed word filters the shelves
    expect(desk.includes("if (stockFilter === 'in_stock') result = result.filter((p) => p.quantityInStock > p.reorderLevel);")).toBe(true);
    expect(desk.includes("else if (stockFilter === 'low_stock') result = result.filter((p) => p.quantityInStock > 0 && p.quantityInStock <= p.reorderLevel);")).toBe(true);
    expect(desk.includes("else if (stockFilter === 'out_of_stock') result = result.filter((p) => p.quantityInStock <= 0);")).toBe(true);
  });

  it('the word binds to the STOCK lens only (exactly one chooser)', () => {
    expect(desk.match(/onValueChange=\{chooseCatStock\}/g)?.length).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// 3. THE LANDING CHIP — the face names the word it answered, in purple
// ---------------------------------------------------------------------------

describe('the landing chip — the face names the word it answered', () => {
  const desk = readFileSync('src/app/(shell)/tabs/catalog-tab.tsx', 'utf8');

  it('the chip renders only while the landing is live AND untouched', () => {
    expect(
      desk.includes("catLandingLive && landedCatStock !== 'all' && stockFilter === landedCatStock")
    ).toBe(true);
    expect(desk.includes('data-testid="cat-stock-landing-word"')).toBe(true);
  });

  it('the chip names the exact word it answered', () => {
    expect(desk.includes('landed ?cat-stock=${landedCatStock}')).toBe(true);
  });

  it('the chip sits BEFORE the stock Select in the filters panel (the position law)', () => {
    const chipAt = desk.indexOf('data-testid="cat-stock-landing-word"');
    const selectAt = desk.indexOf('<Select value={stockFilter} onValueChange={chooseCatStock}>');
    expect(chipAt).toBeGreaterThan(-1);
    expect(selectAt).toBeGreaterThan(chipAt);
  });

  it('voice 1 — the dismissal clears the lens the word seeded and retires', () => {
    const at = desk.indexOf('data-testid="cat-stock-landing-word"');
    const block = desk.slice(at, at + 1200);
    expect(block).toContain("setStockFilter('all')");
    expect(block).toContain('setCatLandingLive(false)');
  });

  it('voice 2 — a hand-driven Select change retires the chip', () => {
    expect(desk.includes('<Select value={stockFilter} onValueChange={chooseCatStock}>')).toBe(true);
    expect(desk.includes('a hand-driven change retires the landing word')).toBe(true);
  });

  it('voice 3 — the clear-filters reset retires the chip (the inventory desk\u2019s census)', () => {
    expect(desk.includes('the third voice')).toBe(true);
    expect(desk.includes('THE THREE VOICES:')).toBe(true);
    const at = desk.indexOf('const clearFilters = () => {');
    const block = desk.slice(at, at + 400);
    expect(block).toContain('setCatLandingLive(false)');
  });

  it('the chip wears the lens\u2019s purple family in BOTH modes', () => {
    // v2.397.0 THE LOOM: the elder wardrobe moved into the loom's 200
    // registry — the desk proves its family by hue, the registry carries
    // the bytes.
    expect(desk.includes('hue="purple"')).toBe(true);
    expect(LOOM.includes('border-purple-200 bg-purple-50 text-purple-700')).toBe(true);
    expect(LOOM.includes('dark:border-purple-500/30 dark:bg-purple-500/10 dark:text-purple-300')).toBe(true);
  });

  it('the dismiss hint sharpens on hover (the group-hover detail)', () => {
    expect(LOOM.includes('opacity-60 transition-opacity group-hover:opacity-100')).toBe(true);
  });

  it('the chip explains itself (the tooltip law)', () => {
    expect(desk.includes('title="The desk landed with this filter from the address bar — press to clear it"')).toBe(true);
    expect(LOOM.includes('aria-hidden="true"')).toBe(true); // v2.397.0 THE LOOM: the icons live in the one hand
  });

  it('the desk\u2019s own voices keep their families beside the chip (no masquerade)', () => {
    // the stock badges' amber and the danger accents' red are the desk's
    // own — the chip's purple borrows nothing from them
    expect(desk.includes('border-amber-200')).toBe(true);
    expect(desk.includes('bg-red-50')).toBe(true);
    expect(LOOM.includes('border-purple-200 bg-purple-50')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 4. THE CONSTITUTION — the seventeenth row is visible from here
// ---------------------------------------------------------------------------

describe('the address-bar vocabulary — the seventeenth row (cross-suite pins)', () => {
  const constitution = readFileSync('src/tests/transfer-status-deep-link-v2357.test.ts', 'utf8');

  it('the constitution walks SEVENTEEN words over FIFTEEN desks', () => {
    expect(constitution.includes('(thirty-four words, twenty-six desks)')).toBe(true);
    expect(constitution.includes("{ word: 'cat-stock', desk: 'src/app/(shell)/tabs/catalog-tab.tsx', family: 'border-purple-200', suite: 'src/tests/cat-stock-deep-link-v2364.test.ts' }")).toBe(true);
    expect(constitution.includes("'SEVENTEENTH'")).toBe(true);
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
      if (readFileSync(p, 'utf8').includes('cat-stock')) collected.push(p);
    }
  }
}

describe('the address-bar vocabulary stays one-writer-per-word', () => {
  it('`cat-stock` speaks in exactly the expected files under src/', () => {
    const collected: string[] = [];
    walkSrc('src', collected);
    collected.sort();
    expect(collected).toEqual([
      'src/app/(shell)/tabs/catalog-tab.tsx',
      'src/lib/tab-url.ts',
      'src/lib/whats-new.ts',
      // the sixteen neighbor ledgers admitted this test file — and an
      // admission line carries the word it admits (the LEDGER-CITATION
      // RIPPLE: a ledger is an honest speaker of every word it lists)
      'src/tests/ad-severity-deep-link-v2366.test.ts',
      'src/tests/cat-stock-deep-link-v2364.test.ts',
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
      'src/tests/ly-type-deep-link-v2368.test.ts',
      'src/tests/pr-status-deep-link-v2362.test.ts',
      // the po-status word's ledger lives beside the proxy-gate suite
      // (one release, two suites — the ledger is the honest speaker here)
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
