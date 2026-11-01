// THE SUPPLIERS LENS'S OWN WORD (v2.331.0): the suppliers desk answers
// the address bar's active filter.
//
// v2.328.0 gave the purchase-orders roster its STATUS word (`?po-status=`),
// v2.329.0 kept the promise on the inventory desk (`?inv-stock=`) and
// v2.330.0 kept it on the customers desk (`?cust-debt=`). THE PROMISE
// KEPT A THIRD TIME: the FOURTH desk inherits the law instead of a copy
// — the suppliers desk's active lens speaks its desk-prefixed
// `?sup-status=all|active|inactive` and wears the landing chip in the
// lens's own emerald (the active-supplier semantic color the desk
// already speaks), with TWO honest retirement voices (chip dismissal,
// hand-driven Select — the desk has no quick chips and no reset button,
// and an honest face never claims voices it does not have).
//
// Pins: the parser's truth table (pure, lowercase vocabulary), the desk's
// seed bytes, the chip's bytes and its two retirement voices, the
// one-home promise (the law's doc carries the fourth desk), and the
// collision ledger (which files may speak the word at all).

import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { parseInitialNamedMember } from '@/lib/tab-url';

const SUP_STATUS_FILTERS = ['all', 'active', 'inactive'] as const;

// ---------------------------------------------------------------------------
// 1. THE PARSER'S TRUTH TABLE (the membership law, one home, lowercase voice)
// ---------------------------------------------------------------------------

describe('parseInitialNamedMember — the suppliers lens speaks the one home', () => {
  it('a lens the desk offers seeds the filter', () => {
    expect(parseInitialNamedMember('?sup-status=active', 'sup-status', SUP_STATUS_FILTERS, 'all')).toBe('active');
    expect(parseInitialNamedMember('?sup-status=inactive', 'sup-status', SUP_STATUS_FILTERS, 'all')).toBe('inactive');
  });

  it('a lens the desk does not offer answers the fallback (never stranded)', () => {
    expect(parseInitialNamedMember('?sup-status=blacklisted', 'sup-status', SUP_STATUS_FILTERS, 'all')).toBe('all');
    expect(parseInitialNamedMember('?sup-status=', 'sup-status', SUP_STATUS_FILTERS, 'all')).toBe('all');
  });

  it('case-sensitive: an uppercase word is an unknown word, not a clever match', () => {
    // the desk's own words are lowercase — `ACTIVE` names nothing
    expect(parseInitialNamedMember('?sup-status=ACTIVE', 'sup-status', SUP_STATUS_FILTERS, 'all')).toBe('all');
    expect(parseInitialNamedMember('?sup-status=Active', 'sup-status', SUP_STATUS_FILTERS, 'all')).toBe('all');
    expect(parseInitialNamedMember('?sup-status=ALL', 'sup-status', SUP_STATUS_FILTERS, 'all')).toBe('all');
  });

  it('missing, bare, and malformed searches answer the fallback — never throw', () => {
    expect(parseInitialNamedMember('', 'sup-status', SUP_STATUS_FILTERS, 'all')).toBe('all');
    expect(parseInitialNamedMember('?tab=suppliers', 'sup-status', SUP_STATUS_FILTERS, 'all')).toBe('all');
    expect(parseInitialNamedMember('sup-status=active', 'sup-status', SUP_STATUS_FILTERS, 'all')).toBe('active');
    expect(parseInitialNamedMember('?????', 'sup-status', SUP_STATUS_FILTERS, 'all')).toBe('all');
    expect(parseInitialNamedMember('?sup-status=active&page=2', 'sup-status', SUP_STATUS_FILTERS, 'all')).toBe('active');
  });

  it('the word rides alongside the desk\u2019s other words without collision', () => {
    // a landing can carry the desk AND the lens AND neighbors' words
    expect(
      parseInitialNamedMember('?tab=suppliers&sup-status=active&inv-stock=low', 'sup-status', SUP_STATUS_FILTERS, 'all')
    ).toBe('active');
    expect(
      parseInitialNamedMember('?tab=suppliers&sup-status=inactive&cust-debt=overdue', 'sup-status', SUP_STATUS_FILTERS, 'all')
    ).toBe('inactive');
    expect(
      parseInitialNamedMember('?tab=suppliers&sup-status=active&po-status=PENDING_APPROVAL', 'sup-status', SUP_STATUS_FILTERS, 'all')
    ).toBe('active');
  });
});

// ---------------------------------------------------------------------------
// 2. THE DESK'S SEED — read-on-mount, one home, never a copy
// ---------------------------------------------------------------------------

describe('the suppliers desk — ?sup-status= lands as visible state', () => {
  const desk = readFileSync('src/app/(shell)/tabs/suppliers-tab.tsx', 'utf8');
  const home = readFileSync('src/lib/tab-url.ts', 'utf8');

  it('the seed reads the word through the ONE home (never a local parser)', () => {
    expect(desk.includes("import { parseInitialNamedMember } from '@/lib/tab-url';")).toBe(true);
    expect(
      desk.includes("parseInitialNamedMember(window.location.search, 'sup-status', SUP_STATUS_FILTERS, 'all')")
    ).toBe(true);
    // the home owns the law and carries the fourth-desk note
    expect(home.includes('export function parseInitialNamedMember')).toBe(true);
    expect(home.includes("v2.331.0 — THE PROMISE KEPT, THE FOURTH DESK")).toBe(true);
  });

  it('the seed is the lazy initializer of the active filter (read-on-mount law)', () => {
    expect(desk.includes('const [filterStatus, setFilterStatus] = useState<string>(initialSupStatus);')).toBe(true);
    // the SSR guard answers 'all' before any window exists
    expect(desk.includes("if (typeof window === 'undefined') return 'all';")).toBe(true);
    // the desk offers exactly the lenses it names
    expect(desk.includes("export const SUP_STATUS_FILTERS = ['all', 'active', 'inactive'] as const;")).toBe(true);
  });

  it('the word is desk-prefixed (the Task 44 collision law) and annotated', () => {
    expect(desk.includes("THE SUPPLIERS LENS'S OWN WORD")).toBe(true);
    expect(desk.includes('?sup-status=active')).toBe(true);
    // the collision note lives with the word
    expect(desk.includes('Collision-checked at round start')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 3. THE LANDING CHIP — the lens answers OUT LOUD, in its own emerald
// ---------------------------------------------------------------------------

describe('the landing chip — the face names the word it answered', () => {
  const desk = readFileSync('src/app/(shell)/tabs/suppliers-tab.tsx', 'utf8');

  it('the chip renders only while the landing is live AND untouched', () => {
    expect(
      desk.includes("landingLive && landedSupStatus !== 'all' && filterStatus === landedSupStatus")
    ).toBe(true);
    expect(desk.includes('data-testid="sup-landing-word"')).toBe(true);
  });

  it('the chip names the exact word it answered', () => {
    expect(desk.includes('landed ?sup-status={landedSupStatus}')).toBe(true);
  });

  it('voice 1 — the dismissal clears the lens the word seeded and retires', () => {
    const at = desk.indexOf('data-testid="sup-landing-word"');
    const block = desk.slice(at, at + 400);
    expect(block).toContain("setFilterStatus('all')");
    expect(block).toContain('setLandingLive(false)');
  });

  it('voice 2 — a hand-driven Select change retires the chip', () => {
    expect(desk.includes('onValueChange={chooseSupStatus}')).toBe(true);
    expect(desk.includes('a hand-driven change retires the landing word')).toBe(true);
  });

  it('the voices are honest — the desk claims exactly the two it has', () => {
    // the desk has no quick chips and no reset button for this lens; the
    // chip's own comment names the two voices and no more (the desk's
    // apostrophes are straight — pin the SOURCE bytes)
    expect(desk.includes("a hand-driven Select or the chip's own dismissal")).toBe(true);
  });

  it('the chip wears the lens\u2019s emerald family in BOTH modes', () => {
    expect(desk.includes('border-emerald-200 bg-emerald-50 text-emerald-700')).toBe(true);
    expect(desk.includes('dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300')).toBe(true);
  });

  it('the chip explains itself (the tooltip law)', () => {
    expect(desk.includes('title="The desk landed with this filter from the address bar — press to clear it"')).toBe(true);
    expect(desk.includes('aria-hidden="true"')).toBe(true);
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
      if (readFileSync(p, 'utf8').includes('sup-status')) collected.push(p);
    }
  }
}

describe('the address-bar vocabulary stays one-writer-per-word', () => {
  it('`sup-status` speaks in exactly the expected files under src/', () => {
    const collected: string[] = [];
    walkSrc('src', collected);
    collected.sort();
    expect(collected).toEqual([
      'src/app/(shell)/tabs/suppliers-tab.tsx',
      'src/lib/tab-url.ts',
      'src/lib/whats-new.ts',
      'src/tests/cust-debt-deep-link-v2330.test.ts',
      'src/tests/inv-stock-deep-link-v2329.test.ts',
      'src/tests/proxy-gate-layering-v2328.test.ts',
      'src/tests/sup-po-deep-link-v2332.test.ts',
      'src/tests/sup-status-deep-link-v2331.test.ts',
    ]);
  });

  it('the home\u2019s older words stay untouched (the shape law, the gait law)', () => {
    const home = readFileSync('src/lib/tab-url.ts', 'utf8');
    expect(home.includes('export function parseInitialNamedPage')).toBe(true);
    expect(home.includes('export function parseInitialNamedMember')).toBe(true);
  });
});
