// THE DEBT LENS'S OWN WORD (v2.330.0): the customers desk answers the
// address bar's debt filter.
//
// v2.328.0 gave the purchase-orders roster its STATUS word (`?po-status=`)
// and v2.329.0 kept the promise on the inventory desk (`?inv-stock=`).
// THE PROMISE KEPT AGAIN: the THIRD desk inherits the law instead of a
// copy — the customers desk's debt lens speaks its desk-prefixed
// `?cust-debt=no_debt|outstanding|overdue` and wears the landing chip in
// the lens's own rose (the debt/risk semantic color the desk already
// speaks), with FOUR retirement voices (chip dismissal, hand-driven
// Select, the quick chips, the honest reset).
//
// Pins: the parser's truth table (pure, snake-case vocabulary), the desk's
// seed bytes, the chip's bytes and its four retirement voices, the
// one-home promise (the law's doc carries the third desk), and the
// collision ledger (which files may speak the word at all).

import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { parseInitialNamedMember } from '@/lib/tab-url';

const CUST_DEBT_FILTERS = ['all', 'no_debt', 'outstanding', 'overdue'] as const;

// ---------------------------------------------------------------------------
// 1. THE PARSER'S TRUTH TABLE (the membership law, one home, snake-case voice)
// ---------------------------------------------------------------------------

describe('parseInitialNamedMember — the debt lens speaks the one home', () => {
  it('a lens the desk offers seeds the filter', () => {
    expect(parseInitialNamedMember('?cust-debt=no_debt', 'cust-debt', CUST_DEBT_FILTERS, 'all')).toBe('no_debt');
    expect(parseInitialNamedMember('?cust-debt=outstanding', 'cust-debt', CUST_DEBT_FILTERS, 'all')).toBe('outstanding');
    expect(parseInitialNamedMember('?cust-debt=overdue', 'cust-debt', CUST_DEBT_FILTERS, 'all')).toBe('overdue');
  });

  it('a lens the desk does not offer answers the fallback (never stranded)', () => {
    expect(parseInitialNamedMember('?cust-debt=CRITICAL', 'cust-debt', CUST_DEBT_FILTERS, 'all')).toBe('all');
    expect(parseInitialNamedMember('?cust-debt=', 'cust-debt', CUST_DEBT_FILTERS, 'all')).toBe('all');
  });

  it('case-sensitive: an uppercase word is an unknown word, not a clever match', () => {
    // the desk's own words are lowercase_snake — `OVERDUE` names nothing
    expect(parseInitialNamedMember('?cust-debt=OVERDUE', 'cust-debt', CUST_DEBT_FILTERS, 'all')).toBe('all');
    expect(parseInitialNamedMember('?cust-debt=Overdue', 'cust-debt', CUST_DEBT_FILTERS, 'all')).toBe('all');
    expect(parseInitialNamedMember('?cust-debt=NO_DEBT', 'cust-debt', CUST_DEBT_FILTERS, 'all')).toBe('all');
  });

  it('missing, bare, and malformed searches answer the fallback — never throw', () => {
    expect(parseInitialNamedMember('', 'cust-debt', CUST_DEBT_FILTERS, 'all')).toBe('all');
    expect(parseInitialNamedMember('?tab=customers', 'cust-debt', CUST_DEBT_FILTERS, 'all')).toBe('all');
    expect(parseInitialNamedMember('cust-debt=overdue', 'cust-debt', CUST_DEBT_FILTERS, 'all')).toBe('overdue');
    expect(parseInitialNamedMember('?????', 'cust-debt', CUST_DEBT_FILTERS, 'all')).toBe('all');
    expect(parseInitialNamedMember('?cust-debt=overdue&page=2', 'cust-debt', CUST_DEBT_FILTERS, 'all')).toBe('overdue');
  });

  it('the word rides alongside the desk\u2019s other words without collision', () => {
    // a landing can carry the desk AND the lens AND neighbors' words
    expect(
      parseInitialNamedMember('?tab=customers&cust-debt=overdue&inv-stock=low', 'cust-debt', CUST_DEBT_FILTERS, 'all')
    ).toBe('overdue');
    expect(
      parseInitialNamedMember('?tab=customers&cust-debt=outstanding&po-page=2', 'cust-debt', CUST_DEBT_FILTERS, 'all')
    ).toBe('outstanding');
  });
});

// ---------------------------------------------------------------------------
// 2. THE DESK'S SEED — read-on-mount, one home, never a copy
// ---------------------------------------------------------------------------

describe('the customers desk — ?cust-debt= lands as visible state', () => {
  const desk = readFileSync('src/app/(shell)/tabs/customers-tab.tsx', 'utf8');
  const home = readFileSync('src/lib/tab-url.ts', 'utf8');

  it('the seed reads the word through the ONE home (never a local parser)', () => {
    expect(desk.includes("import { parseInitialNamedMember } from '@/lib/tab-url';")).toBe(true);
    expect(
      desk.includes("parseInitialNamedMember(window.location.search, 'cust-debt', CUST_DEBT_FILTERS, 'all')")
    ).toBe(true);
    // the home owns the law and carries the third-desk note
    expect(home.includes('export function parseInitialNamedMember')).toBe(true);
    expect(home.includes("v2.330.0 — THE PROMISE KEPT, THE THIRD DESK")).toBe(true);
  });

  it('the seed is the lazy initializer of the debt filter (read-on-mount law)', () => {
    expect(desk.includes('const [debtFilter, setDebtFilter] = useState<string>(initialCustDebtLens);')).toBe(true);
    // the SSR guard answers 'all' before any window exists
    expect(desk.includes("if (typeof window === 'undefined') return 'all';")).toBe(true);
    // the desk offers exactly the lenses it names
    expect(desk.includes("export const CUST_DEBT_FILTERS = ['all', 'no_debt', 'outstanding', 'overdue'] as const;")).toBe(true);
  });

  it('the word is desk-prefixed (the Task 44 collision law) and annotated', () => {
    expect(desk.includes("THE DEBT LENS'S OWN WORD")).toBe(true);
    expect(desk.includes('?cust-debt=overdue')).toBe(true);
    // the collision note lives with the word
    expect(desk.includes('collision-checked at round start')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 3. THE LANDING CHIP — the lens answers OUT LOUD, in its own rose
// ---------------------------------------------------------------------------

describe('the landing chip — the face names the word it answered', () => {
  const desk = readFileSync('src/app/(shell)/tabs/customers-tab.tsx', 'utf8');

  it('the chip renders only while the landing is live AND untouched', () => {
    expect(
      desk.includes("landingLive && landedCustDebtLens !== 'all' && debtFilter === landedCustDebtLens")
    ).toBe(true);
    expect(desk.includes('data-testid="cust-landing-word"')).toBe(true);
  });

  it('the chip names the exact word it answered', () => {
    expect(desk.includes('landed ?cust-debt={landedCustDebtLens}')).toBe(true);
  });

  it('voice 1 — the dismissal clears the lens the word seeded and retires', () => {
    const at = desk.indexOf('data-testid="cust-landing-word"');
    const block = desk.slice(at, at + 400);
    expect(block).toContain("setDebtFilter('all')");
    expect(block).toContain('setLandingLive(false)');
  });

  it('voice 2 — a hand-driven Select change retires the chip', () => {
    expect(desk.includes('onValueChange={chooseDebtFilter}')).toBe(true);
    expect(desk.includes('a hand-driven change retires the landing word')).toBe(true);
  });

  it('voice 3 — the quick chips are hand-driven voices too', () => {
    expect(desk.includes("if (chip.key === 'all') chooseDebtFilter('all');")).toBe(true);
    expect(desk.includes("else if (chip.key === 'debt') chooseDebtFilter('outstanding');")).toBe(true);
  });

  it('voice 4 — the honest reset retires the chip too', () => {
    expect(
      desk.includes("onClick={() => { setDebtFilter('all'); setRegDateFrom(''); setRegDateTo(''); setLandingLive(false); }}")
    ).toBe(true);
  });

  it('the chip wears the lens\u2019s rose family in BOTH modes', () => {
    expect(desk.includes('border-rose-200 bg-rose-50 text-rose-700')).toBe(true);
    expect(desk.includes('dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300')).toBe(true);
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
      if (readFileSync(p, 'utf8').includes('cust-debt')) collected.push(p);
    }
  }
}

describe('the address-bar vocabulary stays one-writer-per-word', () => {
  it('`cust-debt` speaks in exactly the expected files under src/', () => {
    const collected: string[] = [];
    walkSrc('src', collected);
    collected.sort();
    expect(collected).toEqual([
      'src/app/(shell)/tabs/customers-tab.tsx',
      'src/app/(shell)/tabs/suppliers-tab.tsx',
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
    // parseInitialLimit keeps its digits-first gait law (`?limit=050`
    // must keep seeding 50 — the earlier pin, carried)
    expect(home.includes('export function parseInitialLimit')).toBe(true);
  });
});
