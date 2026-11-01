// THE PURCHASE-ORDER LENS'S OWN WORD (v2.332.0): the suppliers desk's
// PO status lens answers the address bar.
//
// v2.328.0 gave the purchase-orders roster its STATUS word (`?po-status=`),
// v2.329.0 kept the promise on the inventory desk (`?inv-stock=`),
// v2.330.0 kept it on the customers desk (`?cust-debt=`) and v2.331.0
// on the suppliers desk's active lens (`?sup-status=`). THE PROMISE
// KEPT A FOURTH TIME — and the first time ONE desk speaks TWO words:
// the suppliers desk's purchase-order section (the `poFilterStatus`
// lens under the roster) inherits the law instead of a copy — it
// speaks its desk-prefixed `?sup-po=all|DRAFT|SENT|CONFIRMED|RECEIVED|
// CANCELLED` and wears the landing chip in the lens's own cyan (the
// delivery-tracking hue — the vocabulary now reads indigo/amber/rose/
// emerald/cyan across the five lenses), with TWO honest retirement
// voices (chip dismissal, hand-driven Select — the PO section has no
// quick chips and no reset button, and an honest face never claims
// voices it does not have).
//
// Pins: the parser's truth table (pure, UPPERCASE vocabulary), the
// desk's seed bytes, the chip's bytes and its two retirement voices,
// the one-home promise (the law's doc carries the fifth word), and the
// collision ledger (which files may speak the word at all).

import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { parseInitialNamedMember } from '@/lib/tab-url';

const SUP_PO_FILTERS = ['all', 'DRAFT', 'SENT', 'CONFIRMED', 'RECEIVED', 'CANCELLED'] as const;

// ---------------------------------------------------------------------------
// 1. THE PARSER'S TRUTH TABLE (the membership law, one home, UPPERCASE voice)
// ---------------------------------------------------------------------------

describe('parseInitialNamedMember — the PO lens speaks the one home', () => {
  it('a lens the desk offers seeds the filter', () => {
    expect(parseInitialNamedMember('?sup-po=SENT', 'sup-po', SUP_PO_FILTERS, 'all')).toBe('SENT');
    expect(parseInitialNamedMember('?sup-po=DRAFT', 'sup-po', SUP_PO_FILTERS, 'all')).toBe('DRAFT');
    expect(parseInitialNamedMember('?sup-po=RECEIVED', 'sup-po', SUP_PO_FILTERS, 'all')).toBe('RECEIVED');
  });

  it('a lens the desk does not offer answers the fallback (never stranded)', () => {
    expect(parseInitialNamedMember('?sup-po=ARCHIVED', 'sup-po', SUP_PO_FILTERS, 'all')).toBe('all');
    expect(parseInitialNamedMember('?sup-po=', 'sup-po', SUP_PO_FILTERS, 'all')).toBe('all');
  });

  it('case-sensitive: a lowercase word is an unknown word, not a clever match', () => {
    // the PO lens's own words are UPPERCASE — `sent` names nothing
    // (the inverse voice, the po-status desk's gait)
    expect(parseInitialNamedMember('?sup-po=sent', 'sup-po', SUP_PO_FILTERS, 'all')).toBe('all');
    expect(parseInitialNamedMember('?sup-po=Sent', 'sup-po', SUP_PO_FILTERS, 'all')).toBe('all');
    expect(parseInitialNamedMember('?sup-po=ALL', 'sup-po', SUP_PO_FILTERS, 'all')).toBe('all');
  });

  it('missing, bare, and malformed searches answer the fallback — never throw', () => {
    expect(parseInitialNamedMember('', 'sup-po', SUP_PO_FILTERS, 'all')).toBe('all');
    expect(parseInitialNamedMember('?tab=suppliers', 'sup-po', SUP_PO_FILTERS, 'all')).toBe('all');
    expect(parseInitialNamedMember('sup-po=SENT', 'sup-po', SUP_PO_FILTERS, 'all')).toBe('SENT');
    expect(parseInitialNamedMember('?????', 'sup-po', SUP_PO_FILTERS, 'all')).toBe('all');
    expect(parseInitialNamedMember('?sup-po=SENT&page=2', 'sup-po', SUP_PO_FILTERS, 'all')).toBe('SENT');
  });

  it('the word rides alongside the desk\u2019s other words without collision', () => {
    // a landing can carry the desk AND both of its own lenses AND the
    // neighbors' words — the desk now speaks TWO words at once
    expect(
      parseInitialNamedMember('?tab=suppliers&sup-po=SENT&sup-status=active', 'sup-po', SUP_PO_FILTERS, 'all')
    ).toBe('SENT');
    expect(
      parseInitialNamedMember('?tab=suppliers&sup-po=CONFIRMED&inv-stock=low', 'sup-po', SUP_PO_FILTERS, 'all')
    ).toBe('CONFIRMED');
    expect(
      parseInitialNamedMember('?tab=suppliers&sup-po=CANCELLED&cust-debt=overdue', 'sup-po', SUP_PO_FILTERS, 'all')
    ).toBe('CANCELLED');
    expect(
      parseInitialNamedMember('?tab=suppliers&sup-po=DRAFT&po-status=PENDING_APPROVAL', 'sup-po', SUP_PO_FILTERS, 'all')
    ).toBe('DRAFT');
  });
});

// ---------------------------------------------------------------------------
// 2. THE DESK'S SEED — read-on-mount, one home, never a copy
// ---------------------------------------------------------------------------

describe('the suppliers desk — ?sup-po= lands as visible state', () => {
  const desk = readFileSync('src/app/(shell)/tabs/suppliers-tab.tsx', 'utf8');
  const home = readFileSync('src/lib/tab-url.ts', 'utf8');

  it('the seed reads the word through the ONE home (never a local parser)', () => {
    expect(desk.includes("import { parseInitialNamedMember } from '@/lib/tab-url';")).toBe(true);
    expect(
      desk.includes("parseInitialNamedMember(window.location.search, 'sup-po', SUP_PO_FILTERS, 'all')")
    ).toBe(true);
    // the home owns the law and carries the fifth-word note
    expect(home.includes('export function parseInitialNamedMember')).toBe(true);
    expect(home.includes('v2.332.0 — THE PROMISE KEPT, THE FIFTH WORD')).toBe(true);
  });

  it('the seed is the lazy initializer of the PO filter (read-on-mount law)', () => {
    expect(desk.includes('const [poFilterStatus, setPoFilterStatus] = useState<string>(initialSupPo);')).toBe(true);
    // the SSR guard answers 'all' before any window exists
    expect(desk.includes("if (typeof window === 'undefined') return 'all';")).toBe(true);
    // the desk offers exactly the lenses it names
    expect(
      desk.includes("export const SUP_PO_FILTERS = ['all', 'DRAFT', 'SENT', 'CONFIRMED', 'RECEIVED', 'CANCELLED'] as const;")
    ).toBe(true);
  });

  it('the word is desk-prefixed (the Task 44 collision law) and annotated', () => {
    expect(desk.includes("THE PURCHASE-ORDER LENS'S OWN WORD")).toBe(true);
    expect(desk.includes('?sup-po=SENT')).toBe(true);
    // the collision note lives with the word
    expect(desk.includes('Collision-checked at round start')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 3. THE LANDING CHIP — the lens answers OUT LOUD, in its own cyan
// ---------------------------------------------------------------------------

describe('the landing chip — the face names the word it answered', () => {
  const desk = readFileSync('src/app/(shell)/tabs/suppliers-tab.tsx', 'utf8');

  it('the chip renders only while the landing is live AND untouched', () => {
    expect(
      desk.includes("poLandingLive && landedSupPo !== 'all' && poFilterStatus === landedSupPo")
    ).toBe(true);
    expect(desk.includes('data-testid="sup-po-landing-word"')).toBe(true);
  });

  it('the chip names the exact word it answered', () => {
    expect(desk.includes('landed ?sup-po={landedSupPo}')).toBe(true);
  });

  it('voice 1 — the dismissal clears the lens the word seeded and retires', () => {
    const at = desk.indexOf('data-testid="sup-po-landing-word"');
    const block = desk.slice(at, at + 400);
    expect(block).toContain("setPoFilterStatus('all')");
    expect(block).toContain('setPoLandingLive(false)');
  });

  it('voice 2 — a hand-driven Select change retires the chip', () => {
    expect(desk.includes('onValueChange={chooseSupPo}')).toBe(true);
    expect(desk.includes('a hand-driven change retires the PO landing word')).toBe(true);
  });

  it('the voices are honest — the desk claims exactly the two it has', () => {
    // the PO section has no quick chips and no reset button for this
    // lens; the chip's own comment names the two voices and no more
    // (the desk's apostrophes are straight — pin the SOURCE bytes)
    expect(desk.includes("a hand-driven Select or the chip's own dismissal")).toBe(true);
  });

  it('the chip wears the lens\u2019s cyan family in BOTH modes', () => {
    expect(desk.includes('border-cyan-200 bg-cyan-50 text-cyan-700')).toBe(true);
    expect(desk.includes('dark:border-cyan-500/30 dark:bg-cyan-500/10 dark:text-cyan-300')).toBe(true);
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
      if (readFileSync(p, 'utf8').includes('sup-po')) collected.push(p);
    }
  }
}

describe('the address-bar vocabulary stays one-writer-per-word', () => {
  it('`sup-po` speaks in exactly the expected files under src/', () => {
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
      'src/tests/txn-pay-deep-link-v2333.test.ts',
    ]);
  });

  it('the home\u2019s older words stay untouched (the shape law, the gait law)', () => {
    const home = readFileSync('src/lib/tab-url.ts', 'utf8');
    expect(home.includes('export function parseInitialNamedPage')).toBe(true);
    expect(home.includes('export function parseInitialNamedMember')).toBe(true);
  });
});
