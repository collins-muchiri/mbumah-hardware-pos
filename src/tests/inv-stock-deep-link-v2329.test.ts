// THE STOCK LENS'S OWN WORD (v2.329.0): the inventory desk answers the
// address bar's stock filter.
//
// v2.328.0 gave the purchase-orders roster its STATUS word (`?po-status=`
// through the param-named membership home `parseInitialNamedMember`, with
// the honest landing chip). This round THE PROMISE KEPT: the next desk
// inherits the law instead of a copy — the inventory lens speaks its
// desk-prefixed `?inv-stock=low|ok|out` and wears the landing chip in the
// lens's own amber (the low-stock banner's family), with FOUR retirement
// voices (chip dismissal, hand-driven Select, the banner's own buttons,
// the clear-all).
//
// Pins: the parser's truth table (pure, lowercase vocabulary), the desk's
// seed bytes, the chip's bytes and its four retirement voices, the
// one-home promise (the law's doc carries the second desk), and the
// collision ledger (which files may speak the word at all).

import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';

const LOOM = readFileSync('src/components/landing-chip.tsx', 'utf8');
import { join } from 'node:path';
import { parseInitialNamedMember } from '@/lib/tab-url';

const INV_STOCK_FILTERS = ['all', 'ok', 'low', 'out'] as const;

// ---------------------------------------------------------------------------
// 1. THE PARSER'S TRUTH TABLE (the membership law, one home, lowercase voice)
// ---------------------------------------------------------------------------

describe('parseInitialNamedMember — the lens speaks the one home', () => {
  it('a lens the desk offers seeds the filter', () => {
    expect(parseInitialNamedMember('?inv-stock=low', 'inv-stock', INV_STOCK_FILTERS, 'all')).toBe('low');
    expect(parseInitialNamedMember('?inv-stock=out', 'inv-stock', INV_STOCK_FILTERS, 'all')).toBe('out');
    expect(parseInitialNamedMember('?inv-stock=ok', 'inv-stock', INV_STOCK_FILTERS, 'all')).toBe('ok');
  });

  it('a lens the desk does not offer answers the fallback (never stranded)', () => {
    expect(parseInitialNamedMember('?inv-stock=CRITICAL', 'inv-stock', INV_STOCK_FILTERS, 'all')).toBe('all');
    expect(parseInitialNamedMember('?inv-stock=', 'inv-stock', INV_STOCK_FILTERS, 'all')).toBe('all');
  });

  it('case-sensitive: an uppercase word is an unknown word, not a clever match', () => {
    // the desk's own words are lowercase — `LOW` names nothing
    expect(parseInitialNamedMember('?inv-stock=LOW', 'inv-stock', INV_STOCK_FILTERS, 'all')).toBe('all');
    expect(parseInitialNamedMember('?inv-stock=Low', 'inv-stock', INV_STOCK_FILTERS, 'all')).toBe('all');
  });

  it('missing, bare, and malformed searches answer the fallback — never throw', () => {
    expect(parseInitialNamedMember('', 'inv-stock', INV_STOCK_FILTERS, 'all')).toBe('all');
    expect(parseInitialNamedMember('?tab=inventory', 'inv-stock', INV_STOCK_FILTERS, 'all')).toBe('all');
    expect(parseInitialNamedMember('inv-stock=low', 'inv-stock', INV_STOCK_FILTERS, 'all')).toBe('low');
    expect(parseInitialNamedMember('?????', 'inv-stock', INV_STOCK_FILTERS, 'all')).toBe('all');
    expect(parseInitialNamedMember('?inv-stock=low&page=2', 'inv-stock', INV_STOCK_FILTERS, 'all')).toBe('low');
  });

  it('the word rides alongside the desk\u2019s other words without collision', () => {
    // a landing can carry the desk AND the lens AND a neighbor's word
    expect(
      parseInitialNamedMember('?tab=inventory&inv-stock=out&po-status=PENDING_APPROVAL', 'inv-stock', INV_STOCK_FILTERS, 'all')
    ).toBe('out');
  });
});

// ---------------------------------------------------------------------------
// 2. THE DESK'S SEED — read-on-mount, one home, never a copy
// ---------------------------------------------------------------------------

describe('the inventory desk — ?inv-stock= lands as visible state', () => {
  const desk = readFileSync('src/app/(shell)/tabs/inventory-tab.tsx', 'utf8');
  const home = readFileSync('src/lib/tab-url.ts', 'utf8');

  it('the seed reads the word through the ONE home (never a local parser)', () => {
    // v2.495.0 (dated): the desk's SECOND word arrived — the import grew
    // the SLUG-SHAPE LAW's slug pair beside the membership parser (the
    // ONE home still owns both readings; the membership leg keeps its
    // bytes below).
    expect(desk.includes("import { categorySlug, parseInitialNamedMember, parseInitialNamedSlug } from '@/lib/tab-url';")).toBe(true);
    expect(
      desk.includes("parseInitialNamedMember(window.location.search, 'inv-stock', INV_STOCK_FILTERS, 'all')")
    ).toBe(true);
    // the home owns the law and carries the promise-kept note
    expect(home.includes('export function parseInitialNamedMember')).toBe(true);
    expect(home.includes('v2.329.0 — THE PROMISE KEPT')).toBe(true);
  });

  it('the seed is the lazy initializer of the stock filter (read-on-mount law)', () => {
    expect(desk.includes('const [stockFilter, setStockFilter] = useState<string>(initialStockLens);')).toBe(true);
    // the SSR guard answers 'all' before any window exists
    expect(desk.includes("if (typeof window === 'undefined') return 'all';")).toBe(true);
    // the desk offers exactly the lenses it names
    expect(desk.includes("export const INV_STOCK_FILTERS = ['all', 'ok', 'low', 'out'] as const;")).toBe(true);
  });

  it('the word is desk-prefixed (the Task 44 collision law) and annotated', () => {
    expect(desk.includes("THE STOCK LENS'S OWN WORD")).toBe(true);
    expect(desk.includes('?inv-stock=low')).toBe(true);
    // the collision note lives with the word
    expect(desk.includes('collision-checked at round start')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 3. THE LANDING CHIP — the lens answers OUT LOUD, in its own amber
// ---------------------------------------------------------------------------

describe('the landing chip — the face names the word it answered', () => {
  const desk = readFileSync('src/app/(shell)/tabs/inventory-tab.tsx', 'utf8');

  it('the chip renders only while the landing is live AND untouched', () => {
    expect(
      desk.includes("landingLive && landedStockLens !== 'all' && stockFilter === landedStockLens")
    ).toBe(true);
    expect(desk.includes('data-testid="inv-landing-word"')).toBe(true);
  });

  it('the chip names the exact word it answered', () => {
    expect(desk.includes('landed ?inv-stock=${landedStockLens}')).toBe(true);
  });

  it('voice 1 — the dismissal clears the lens the word seeded and retires', () => {
    const at = desk.indexOf('data-testid="inv-landing-word"');
    const block = desk.slice(at, at + 1200);
    expect(block).toContain("setStockFilter('all')");
    expect(block).toContain('setLandingLive(false)');
  });

  it('voice 2 — a hand-driven Select change retires the chip', () => {
    const at = desk.indexOf('onValueChange={(v) => {\n            setStockFilter(v);');
    expect(at).toBeGreaterThan(-1);
    const block = desk.slice(at, at + 400);
    expect(block).toContain('setLandingLive(false)');
    expect(block).toContain('a hand-driven change retires the landing');
  });

  it('voice 3 — the low-stock banner\u2019s own buttons are hand-driven too', () => {
    expect(desk.includes("onClick={() => { setStockFilter('out'); setLandingLive(false); }}")).toBe(true);
    expect(
      desk.includes('onClick={() => { setStockFilter(lowStockCount > 0 ? \'low\' : \'out\'); setLandingLive(false); }}')
    ).toBe(true);
  });

  it('voice 4 — the honest clear-all retires the chip too', () => {
    // v2.495.0 (dated): the category leg of the clear-all rides the
    // desk's ONE door now (chooseInvCategory — the lens's own honesty);
    // the stock leg keeps its bytes.
    expect(
      desk.includes("onClick={() => { setSearchQuery(''); setStockFilter('all'); chooseInvCategory('all'); setLandingLive(false); }}")
    ).toBe(true);
  });

  it('the chip wears the lens\u2019s amber family in BOTH modes', () => {
    // v2.397.0 THE LOOM: the elder wardrobe moved into the loom's 200
    // registry — the desk proves its family by hue, the registry carries
    // the bytes.
    expect(desk.includes('hue="amber"')).toBe(true);
    expect(LOOM.includes('border-amber-200 bg-amber-50 text-amber-700')).toBe(true);
    expect(LOOM.includes('dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300')).toBe(true);
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
      if (readFileSync(p, 'utf8').includes('inv-stock')) collected.push(p);
    }
  }
}

describe('the address-bar vocabulary stays one-writer-per-word', () => {
  it('`inv-stock` speaks in exactly the expected files under src/', () => {
    const collected: string[] = [];
    walkSrc('src', collected);
    collected.sort();
    expect(collected).toEqual([
      'src/app/(shell)/tabs/customers-tab.tsx',
      'src/app/(shell)/tabs/inventory-tab.tsx',
      'src/lib/tab-url.ts',
      'src/lib/whats-new.ts',
      'src/tests/ad-severity-deep-link-v2366.test.ts',
      // the twenty-sixth word's own ledger — admitted (its rides-beside
      // truth speaks this word; an admission line carries the word it admits)
      // the twenty-seventh word's own ledger — admitted (this file
      // speaks the words this ledger walks; its NAME carries them too)
      'src/tests/bank-mpesa-deep-link-v2388.test.ts',
      'src/tests/bank-type-deep-link-v2387.test.ts',
      'src/tests/cat-stock-deep-link-v2364.test.ts',
      'src/tests/cr-type-deep-link-v2361.test.ts',
      'src/tests/cust-debt-deep-link-v2330.test.ts',
      'src/tests/cv-type-deep-link-v2363.test.ts',
      'src/tests/dn-status-deep-link-v2359.test.ts',
      'src/tests/dp-status-deep-link-v2365.test.ts',
      'src/tests/et-status-deep-link-v2381.test.ts',
      'src/tests/family-registry-stress-v2370.test.ts',
      'src/tests/gc-status-deep-link-v2358.test.ts',
      // the inventory's category word's own ledger — admitted (its honest
      // slug-reader probe names this word as the desk's OTHER prefix; an
      // admission line carries the word it admits; sorted place:
      // gc- < inv-category < inv-status)
      'src/tests/inv-category-address-v2495.test.ts',
      'src/tests/inv-status-deep-link-v2356.test.ts',
      'src/tests/inv-stock-deep-link-v2329.test.ts',
      // the loom's own suite — admitted (v2.397.0: the elder loom pins
      // this desk's chip bytes, so the walk lists it)
      'src/tests/landing-chip-loom-v2394.test.ts',
      'src/tests/ly-type-deep-link-v2368.test.ts',
      'src/tests/pr-status-deep-link-v2362.test.ts',
      'src/tests/proxy-gate-layering-v2328.test.ts',
      // v2.355.0: the rentals desk's status lens joins the vocabulary — its
      // deep-link suite is admitted (an admission line carries the word it
      // admits — the LEDGER-CITATION RIPPLE, second-order form)
      'src/tests/rent-status-deep-link-v2355.test.ts',
      'src/tests/rep-type-deep-link-v2384.test.ts',
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
    // parseInitialLimit keeps its digits-first gait law (`?limit=050`
    // must keep seeding 50 — the v2.328.0 pin, carried)
    expect(home.includes('export function parseInitialLimit')).toBe(true);
  });
});
