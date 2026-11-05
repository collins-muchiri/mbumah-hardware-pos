// THE DEBT-PLANS DESK'S OWN WORD (v2.365.0): the repayment desk answers
// the address bar.
//
// v2.328.0 gave the purchase-orders roster its STATUS word (`?po-status=`),
// v2.329.0 the inventory desk, v2.330.0 the customers desk, v2.331.0 the
// suppliers desk, v2.332.0 that desk's PO section, v2.333.0 the
// transactions desk's payment-method lens, v2.354.0 its type lens,
// v2.355.0 the rentals desk, v2.356.0 the invoices desk, v2.357.0 the
// transfers desk, v2.358.0 the gift cards desk, v2.359.0 the delivery
// notes desk, v2.360.0 the vouchers desk, v2.361.0 the credits desk,
// v2.362.0 the payroll desk, v2.363.0 the conversations desk, v2.364.0
// the catalog desk. THE PROMISE KEPT AN EIGHTEENTH TIME — the debt-plans
// desk's status lens speaks its desk-prefixed
// `?dp-status=all|pending|active|overdue|completed` and wears the landing
// chip in the lens's own zinc (the EIGHTEENTH family — indigo/amber/rose/
// emerald/cyan/violet/fuchsia/orange/teal/blue/lime/sky/pink/yellow/stone/
// slate/purple now gain the plans lens's zinc, the galvanized hue, the
// coating on this yard's steel) beside the desk's own voices (the filter
// chips' emerald/amber/rose/green — a voice must not masquerade as a
// badge, and now neither borrows the other's clothes). The repayment
// desk's daily question is now an address. THE NEUTRAL VOICE, LOWERCASE:
// the lens's words are the filter chips' OWN keys (lowercase), so an
// UPPERCASE `PENDING` or `ALL` is an unknown word here — the exact
// inverse of the capitalized-neutral desks.
// THE FACE-KIND NOTE (the family's first non-Select control face): the
// lens's control is a BUTTON GROUP, not a Select — the chooser is the
// group's onClick, not an onValueChange. The law's intent transfers
// unchanged: a hand press is the human owning the lens, and the landing
// chip retires the moment that happens. The lens is ALWAYS RENDERED on
// the desk's top-level pane (no sub-tabs, no collapsible panel), so a
// landing that carries the word shows the chip immediately — the
// always-visible face without an amendment.
//
// Pins: the parser's truth table (pure, lowercase vocabulary, the
// neutral's self-seed AND its capitalized inversions), the desk's seed
// bytes and its cast-free typing, the always-rendered face bytes, the
// client-side read filter bytes (the word filters the LIST, not just the
// chips' face), the chip's bytes and its two retirement voices (the
// FACE-KIND form: a hand-driven chip PRESS, not a Select change), the
// one-home promise (the law's doc carries the eighteenth word), the
// collision ledger — and the constitution's eighteenth row from its own
// suite.

import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';

const LOOM = readFileSync('src/components/landing-chip.tsx', 'utf8');
import { join } from 'node:path';
import { parseInitialNamedMember } from '@/lib/tab-url';

const DP_STATUS_FILTERS = ['all', 'pending', 'active', 'overdue', 'completed'] as const;

// ---------------------------------------------------------------------------
// 1. THE PARSER'S TRUTH TABLE (the membership law, one home, LOWERCASE voice,
//    the LOWERCASE neutral)
// ---------------------------------------------------------------------------

describe('parseInitialNamedMember — the plans lens speaks the one home', () => {
  it('a lens the desk offers seeds the filter', () => {
    expect(parseInitialNamedMember('?dp-status=pending', 'dp-status', DP_STATUS_FILTERS, 'all')).toBe('pending');
    expect(parseInitialNamedMember('?dp-status=active', 'dp-status', DP_STATUS_FILTERS, 'all')).toBe('active');
    expect(parseInitialNamedMember('?dp-status=overdue', 'dp-status', DP_STATUS_FILTERS, 'all')).toBe('overdue');
    expect(parseInitialNamedMember('?dp-status=completed', 'dp-status', DP_STATUS_FILTERS, 'all')).toBe('completed');
  });

  it('a lens the desk does not offer answers the fallback (never stranded)', () => {
    expect(parseInitialNamedMember('?dp-status=written_off', 'dp-status', DP_STATUS_FILTERS, 'all')).toBe('all');
    expect(parseInitialNamedMember('?dp-status=', 'dp-status', DP_STATUS_FILTERS, 'all')).toBe('all');
  });

  it('case-sensitive: a capitalized word is an unknown word, not a clever match', () => {
    // the lens's own words are lowercase — `PENDING` names nothing
    // (the exact inverse of the UPPERCASE-vocabulary desks)
    expect(parseInitialNamedMember('?dp-status=PENDING', 'dp-status', DP_STATUS_FILTERS, 'all')).toBe('all');
    expect(parseInitialNamedMember('?dp-status=Overdue', 'dp-status', DP_STATUS_FILTERS, 'all')).toBe('all');
    expect(parseInitialNamedMember('?dp-status=ACTIVE', 'dp-status', DP_STATUS_FILTERS, 'all')).toBe('all');
  });

  it('the NEUTRAL IS LOWERCASE here — UPPERCASE ALL names nothing (the inversion)', () => {
    // the desk's all-chip is spelled 'all' (the chips' own key since the
    // desk first shipped): a capitalized spelling is an unknown word, the
    // exact inverse of the capitalized-neutral desks — and the lowercase
    // neutral seeds itself (the fallback IS the member)
    expect(parseInitialNamedMember('?dp-status=ALL', 'dp-status', DP_STATUS_FILTERS, 'all')).toBe('all');
    expect(parseInitialNamedMember('?dp-status=all', 'dp-status', DP_STATUS_FILTERS, 'all')).toBe('all');
  });

  it('missing, bare, and malformed searches answer the fallback — never throw', () => {
    expect(parseInitialNamedMember('', 'dp-status', DP_STATUS_FILTERS, 'all')).toBe('all');
    expect(parseInitialNamedMember('?tab=debt-plans', 'dp-status', DP_STATUS_FILTERS, 'all')).toBe('all');
    expect(parseInitialNamedMember('dp-status=overdue', 'dp-status', DP_STATUS_FILTERS, 'all')).toBe('overdue');
    expect(parseInitialNamedMember('?????', 'dp-status', DP_STATUS_FILTERS, 'all')).toBe('all');
    expect(parseInitialNamedMember('?dp-status=pending&page=2', 'dp-status', DP_STATUS_FILTERS, 'all')).toBe('pending');
  });

  it('the word rides alongside the vocabulary\u2019s other words without collision', () => {
    // a landing can carry the desk AND its lens AND the neighbors' words
    // — one bar, one word per lens, every lens its own
    expect(
      parseInitialNamedMember('?tab=debt-plans&dp-status=pending&txn-type=refund', 'dp-status', DP_STATUS_FILTERS, 'all')
    ).toBe('pending');
    expect(
      parseInitialNamedMember('?tab=debt-plans&dp-status=overdue&rent-status=OVERDUE', 'dp-status', DP_STATUS_FILTERS, 'all')
    ).toBe('overdue');
    expect(
      parseInitialNamedMember('?tab=debt-plans&dp-status=active&po-status=PENDING_APPROVAL&inv-stock=low', 'dp-status', DP_STATUS_FILTERS, 'all')
    ).toBe('active');
    expect(
      parseInitialNamedMember('?tab=debt-plans&dp-status=completed&pr-status=ACTIVE&cust-debt=overdue&sup-status=ACTIVE', 'dp-status', DP_STATUS_FILTERS, 'all')
    ).toBe('completed');
    expect(
      parseInitialNamedMember('?tab=debt-plans&dp-status=pending&sup-po=SENT&txn-pay=CASH&cv-type=INTERNAL', 'dp-status', DP_STATUS_FILTERS, 'all')
    ).toBe('pending');
    expect(
      parseInitialNamedMember('?tab=debt-plans&dp-status=overdue&inv-status=PAID&gc-status=REDEEMED&dn-status=DELIVERED&vc-status=PAUSED&cr-type=DEBIT&transfer-status=IN_TRANSIT', 'dp-status', DP_STATUS_FILTERS, 'all')
    ).toBe('overdue');
    expect(
      parseInitialNamedMember('?tab=debt-plans&dp-status=active&cat-stock=low_stock', 'dp-status', DP_STATUS_FILTERS, 'all')
    ).toBe('active');
  });
});

// ---------------------------------------------------------------------------
// 2. THE DESK'S SEED — read-on-mount, one home, never a copy, never a cast
// ---------------------------------------------------------------------------

describe('the debt-plans desk — ?dp-status= lands as visible state', () => {
  const desk = readFileSync('src/app/(shell)/tabs/debt-plans-tab.tsx', 'utf8');
  const home = readFileSync('src/lib/tab-url.ts', 'utf8');

  it('the seed reads the word through the ONE home (never a local parser)', () => {
    expect(desk.includes("import { parseInitialNamedMember } from '@/lib/tab-url';")).toBe(true);
    expect(
      desk.includes("parseInitialNamedMember(window.location.search, 'dp-status', DP_STATUS_FILTERS, 'all')")
    ).toBe(true);
    // the home owns the law and carries the eighteenth-word note
    expect(home.includes('export function parseInitialNamedMember')).toBe(true);
    expect(home.includes('v2.365.0 — THE PROMISE KEPT, THE EIGHTEENTH WORD')).toBe(true);
  });

  it('the seed is the lazy initializer of the filter (read-on-mount law)', () => {
    expect(
      desk.includes('const [filter, setFilter] = useState<DpStatusFilter>(initialDpStatus);')
    ).toBe(true);
    // the SSR guard answers the neutral before any window exists
    expect(desk.includes("if (typeof window === 'undefined') return 'all';")).toBe(true);
    // the desk offers exactly the lenses it names
    expect(
      desk.includes("export const DP_STATUS_FILTERS = ['all', 'pending', 'active', 'overdue', 'completed'] as const;")
    ).toBe(true);
  });

  it('the seed is CAST-FREE — the generic parser IS the union', () => {
    expect(desk.includes('function initialDpStatus(): (typeof DP_STATUS_FILTERS)[number]')).toBe(true);
    expect(desk.includes('type DpStatusFilter = (typeof DP_STATUS_FILTERS)[number];')).toBe(true);
    expect(desk.includes('useState<DpStatusFilter>(initialDpStatus)')).toBe(true);
    // no laundering snuck in around the new word
    expect(desk.includes('initialDpStatus() as')).toBe(false);
    expect(desk.includes('initialDpStatus as unknown')).toBe(false);
  });

  it('the word is desk-prefixed (the Task 44 collision law) and annotated', () => {
    expect(desk.includes("THE DEBT-PLANS DESK'S OWN WORD")).toBe(true);
    expect(desk.includes('?dp-status=pending')).toBe(true);
    // the collision note lives with the word
    expect(desk.includes('Collision-checked at round start')).toBe(true);
  });

  it('THE ALWAYS-RENDERED FACE — top-level pane, no sub-tabs, no panel', () => {
    // this desk has no TabsContent at all — the chip row is top-level and
    // always rendered: a landing shows the chip immediately (the
    // always-visible face WITHOUT an amendment)
    expect(desk.includes('<TabsContent')).toBe(false);
    // the face is DOCUMENTED at the word, not just practiced
    expect(desk.includes('ALWAYS RENDERED')).toBe(true);
  });

  it('THE FACE-KIND NOTE — the family\u2019s first non-Select control face', () => {
    // the chooser is the button group's onClick, not a Select's
    // onValueChange — pinned from the mounting bytes
    expect(desk.match(/onClick=\{\(\) => chooseDpStatus\(chip\.key\)\}/g)?.length).toBe(1);
    expect(desk.includes('onValueChange={chooseDpStatus}')).toBe(false);
    expect(desk.includes('THE FACE-KIND NOTE')).toBe(true);
  });

  it('the word filters the LIST, not just the chips\u2019 face (the client-side read)', () => {
    // the desk's plans read filters client-side through the useMemo's own
    // membership checks — a landed word filters the plans
    expect(desk.includes("case 'pending':")).toBe(true);
    expect(desk.includes("return plans.filter((p) => p.status === 'PENDING_APPROVAL');")).toBe(true);
    expect(desk.includes("case 'overdue':")).toBe(true);
    expect(desk.includes("case 'completed':")).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 3. THE LANDING CHIP — the face names the word it answered, in zinc
// ---------------------------------------------------------------------------

describe('the landing chip — the face names the word it answered', () => {
  const desk = readFileSync('src/app/(shell)/tabs/debt-plans-tab.tsx', 'utf8');

  it('the chip renders only while the landing is live AND untouched', () => {
    expect(
      desk.includes("dpLandingLive && landedDpStatus !== 'all' && filter === landedDpStatus")
    ).toBe(true);
    expect(desk.includes('data-testid="dp-status-landing-word"')).toBe(true);
  });

  it('the chip names the exact word it answered', () => {
    expect(desk.includes('landed ?dp-status=${landedDpStatus}')).toBe(true);
  });

  it('the chip sits BEFORE the filter chips in the row (the position law)', () => {
    const chipAt = desk.indexOf('data-testid="dp-status-landing-word"');
    const chipsAt = desk.indexOf('FILTER_CHIPS.map((chip) => {');
    expect(chipAt).toBeGreaterThan(-1);
    expect(chipsAt).toBeGreaterThan(chipAt);
  });

  it('voice 1 — the dismissal clears the lens the word seeded and retires', () => {
    const at = desk.indexOf('data-testid="dp-status-landing-word"');
    const block = desk.slice(at, at + 1200);
    expect(block).toContain("setFilter('all')");
    expect(block).toContain('setDpLandingLive(false)');
  });

  it('voice 2 — a hand-driven chip PRESS retires the chip (the FACE-KIND form)', () => {
    expect(desk.includes('onClick={() => chooseDpStatus(chip.key)}')).toBe(true);
    expect(desk.includes('a hand-driven chip press retires the landing word')).toBe(true);
  });

  it('the voices are honest — the desk claims exactly the two it has', () => {
    expect(desk.includes('THE TWO VOICES: a hand-driven')).toBe(true);
    expect(desk.includes("chip press or the chip's own dismissal")).toBe(true);
  });

  it('the chip wears the lens\u2019s zinc family in BOTH modes', () => {
    // v2.397.0 THE LOOM: the elder wardrobe moved into the loom's 200
    // registry — the desk proves its family by hue, the registry carries
    // the bytes.
    expect(desk.includes('hue="zinc"')).toBe(true);
    expect(LOOM.includes('border-zinc-200 bg-zinc-50 text-zinc-700')).toBe(true);
    expect(LOOM.includes('dark:border-zinc-500/30 dark:bg-zinc-500/10 dark:text-zinc-300')).toBe(true);
  });

  it('the dismiss hint sharpens on hover (the group-hover detail)', () => {
    expect(LOOM.includes('opacity-60 transition-opacity group-hover:opacity-100')).toBe(true);
  });

  it('the chip explains itself (the tooltip law)', () => {
    expect(desk.includes('title="The desk landed with this filter from the address bar — press to clear it"')).toBe(true);
    expect(LOOM.includes('aria-hidden="true"')).toBe(true); // v2.397.0 THE LOOM: the icons live in the one hand
  });

  it('the desk\u2019s own voices keep their families beside the chip (no masquerade)', () => {
    // the filter chips' emerald/amber/rose/green are the desk's own — the
    // chip's zinc borrows nothing from them
    expect(desk.includes("'bg-emerald-50 text-emerald-700 border-emerald-200")).toBe(true);
    expect(LOOM.includes('border-zinc-200 bg-zinc-50')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 4. THE CONSTITUTION — the eighteenth row is visible from here
// ---------------------------------------------------------------------------

describe('the address-bar vocabulary — the eighteenth row (cross-suite pins)', () => {
  const constitution = readFileSync('src/tests/transfer-status-deep-link-v2357.test.ts', 'utf8');

  it('the constitution walks EIGHTEEN words over SIXTEEN desks', () => {
    expect(constitution.includes('(thirty-two words, twenty-six desks)')).toBe(true);
    expect(constitution.includes("{ word: 'dp-status', desk: 'src/app/(shell)/tabs/debt-plans-tab.tsx', family: 'border-zinc-200', suite: 'src/tests/dp-status-deep-link-v2365.test.ts' }")).toBe(true);
    expect(constitution.includes("'EIGHTEENTH'")).toBe(true);
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
      if (readFileSync(p, 'utf8').includes('dp-status')) collected.push(p);
    }
  }
}

describe('the address-bar vocabulary stays one-writer-per-word', () => {
  it('`dp-status` speaks in exactly the expected files under src/', () => {
    const collected: string[] = [];
    walkSrc('src', collected);
    collected.sort();
    expect(collected).toEqual([
      'src/app/(shell)/tabs/debt-plans-tab.tsx',
      'src/lib/tab-url.ts',
      'src/lib/whats-new.ts',
      // the seventeen neighbor ledgers admitted this test file — and an
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
