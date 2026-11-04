// THE PAYROLL DESK'S OWN WORD (v2.362.0): the roster's status lens
// answers the address bar — and the sub-tab survey law earns its first
// AMENDMENT with it.
//
// v2.328.0 gave the purchase-orders roster its STATUS word (`?po-status=`),
// v2.329.0 the inventory desk, v2.330.0 the customers desk, v2.331.0 the
// suppliers desk, v2.332.0 that desk's PO section, v2.333.0 the
// transactions desk's payment-method lens, v2.354.0 its type lens,
// v2.355.0 the rentals desk, v2.356.0 the invoices desk, v2.357.0 the
// transfers desk, v2.358.0 the gift cards desk, v2.359.0 the delivery
// notes desk, v2.360.0 the vouchers desk, v2.361.0 the credits desk.
// THE PROMISE KEPT A FIFTEENTH TIME — the payroll desk's employees
// roster speaks its desk-prefixed `?pr-status=ALL|ACTIVE|ON_LEAVE|
// TERMINATED` and wears the landing chip in the lens's own stone (the
// FIFTEENTH family — indigo/amber/rose/emerald/cyan/violet/fuchsia/
// orange/teal/blue/lime/sky/pink/yellow now gain the roster lens's
// stone, the quarry hue) beside the desk's own badge voices (the active
// badge's green, the terminated badge's red, the on-leave badge's amber
// — a voice must not masquerade as a badge, and now neither borrows the
// other's clothes). The workforce's standing is now an address.
// THE NEUTRAL VOICE, CAPITALIZED (the gift cards desk's voice): this
// desk's all-lens has been spelled 'ALL' since it first shipped, so a
// lowercase `all` is an unknown word here — the exact inverse of the
// lowercase-neutral desks.
// THE DEFAULT-SUB-TAB AMENDMENT (the sub-tab survey law's first new
// case): the roster's lens lives inside the employees sub-tab — the
// desk's DEFAULT face — so a landing that carries the word mounts with
// the chip visible (the always-visible-toolbar law's intent holds on
// the landing face); a sub-tab round-trip remounts the lens and re-lands
// the word from the unchanged address, the same honest remount
// semantics every desk already speaks across tab switches. A lens in a
// NON-default sub-tab stays blocked (the campaigns lens's rule).
//
// Pins: the parser's truth table (pure, UPPERCASE vocabulary, the
// capitalized neutral's self-seed AND its lowercase inversion), the
// desk's seed bytes and its cast-free typing, the chip's bytes and its
// two retirement voices, the amendment's mounting bytes, the one-home
// promise (the law's doc carries the fifteenth word), the collision
// ledger — and the constitution's fifteenth row from its own suite.

import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { parseInitialNamedMember } from '@/lib/tab-url';

const PR_STATUS_FILTERS = ['ALL', 'ACTIVE', 'ON_LEAVE', 'TERMINATED'] as const;

// ---------------------------------------------------------------------------
// 1. THE PARSER'S TRUTH TABLE (the membership law, one home, UPPERCASE voice,
//    the CAPITALIZED neutral)
// ---------------------------------------------------------------------------

describe('parseInitialNamedMember — the roster lens speaks the one home', () => {
  it('a lens the desk offers seeds the filter', () => {
    expect(parseInitialNamedMember('?pr-status=ACTIVE', 'pr-status', PR_STATUS_FILTERS, 'ALL')).toBe('ACTIVE');
    expect(parseInitialNamedMember('?pr-status=ON_LEAVE', 'pr-status', PR_STATUS_FILTERS, 'ALL')).toBe('ON_LEAVE');
    expect(parseInitialNamedMember('?pr-status=TERMINATED', 'pr-status', PR_STATUS_FILTERS, 'ALL')).toBe('TERMINATED');
  });

  it('a lens the desk does not offer answers the fallback (never stranded)', () => {
    expect(parseInitialNamedMember('?pr-status=RETIRED', 'pr-status', PR_STATUS_FILTERS, 'ALL')).toBe('ALL');
    expect(parseInitialNamedMember('?pr-status=', 'pr-status', PR_STATUS_FILTERS, 'ALL')).toBe('ALL');
  });

  it('case-sensitive: a lowercase word is an unknown word, not a clever match', () => {
    // the lens's own words are UPPERCASE — `active` names nothing
    // (the payment word's voice; the INVERSE of the lowercase type word)
    expect(parseInitialNamedMember('?pr-status=active', 'pr-status', PR_STATUS_FILTERS, 'ALL')).toBe('ALL');
    expect(parseInitialNamedMember('?pr-status=Active', 'pr-status', PR_STATUS_FILTERS, 'ALL')).toBe('ALL');
    expect(parseInitialNamedMember('?pr-status=on_leave', 'pr-status', PR_STATUS_FILTERS, 'ALL')).toBe('ALL');
  });

  it('the NEUTRAL IS CAPITALIZED here — lowercase `all` names nothing (the inversion)', () => {
    // the desk's all-lens has been spelled 'ALL' since it first shipped
    // (the gift cards desk's voice): a lowercase spelling is an unknown
    // word, the exact inverse of the lowercase-neutral desks — and the
    // capitalized neutral seeds itself (the fallback IS the member)
    expect(parseInitialNamedMember('?pr-status=all', 'pr-status', PR_STATUS_FILTERS, 'ALL')).toBe('ALL');
    expect(parseInitialNamedMember('?pr-status=ALL', 'pr-status', PR_STATUS_FILTERS, 'ALL')).toBe('ALL');
  });

  it('missing, bare, and malformed searches answer the fallback — never throw', () => {
    expect(parseInitialNamedMember('', 'pr-status', PR_STATUS_FILTERS, 'ALL')).toBe('ALL');
    expect(parseInitialNamedMember('?tab=payroll', 'pr-status', PR_STATUS_FILTERS, 'ALL')).toBe('ALL');
    expect(parseInitialNamedMember('pr-status=ACTIVE', 'pr-status', PR_STATUS_FILTERS, 'ALL')).toBe('ACTIVE');
    expect(parseInitialNamedMember('?????', 'pr-status', PR_STATUS_FILTERS, 'ALL')).toBe('ALL');
    expect(parseInitialNamedMember('?pr-status=ON_LEAVE&page=2', 'pr-status', PR_STATUS_FILTERS, 'ALL')).toBe('ON_LEAVE');
  });

  it('the word rides alongside the vocabulary\u2019s other words without collision', () => {
    // a landing can carry the desk AND its lens AND the neighbors' words
    // — one bar, one word per lens, every lens its own
    expect(
      parseInitialNamedMember('?tab=payroll&pr-status=ACTIVE&txn-type=refund', 'pr-status', PR_STATUS_FILTERS, 'ALL')
    ).toBe('ACTIVE');
    expect(
      parseInitialNamedMember('?tab=payroll&pr-status=ON_LEAVE&rent-status=OVERDUE', 'pr-status', PR_STATUS_FILTERS, 'ALL')
    ).toBe('ON_LEAVE');
    expect(
      parseInitialNamedMember('?tab=payroll&pr-status=TERMINATED&po-status=PENDING_APPROVAL&inv-stock=low', 'pr-status', PR_STATUS_FILTERS, 'ALL')
    ).toBe('TERMINATED');
    expect(
      parseInitialNamedMember('?tab=payroll&pr-status=ACTIVE&cust-debt=overdue&sup-status=ACTIVE&sup-po=SENT', 'pr-status', PR_STATUS_FILTERS, 'ALL')
    ).toBe('ACTIVE');
    expect(
      parseInitialNamedMember('?tab=payroll&pr-status=ACTIVE&inv-status=PAID&gc-status=REDEEMED&dn-status=DELIVERED&vc-status=PAUSED&cr-type=DEBIT&transfer-status=IN_TRANSIT&txn-pay=CASH', 'pr-status', PR_STATUS_FILTERS, 'ALL')
    ).toBe('ACTIVE');
  });
});

// ---------------------------------------------------------------------------
// 2. THE DESK'S SEED — read-on-mount, one home, never a copy, never a cast
// ---------------------------------------------------------------------------

describe('the payroll desk — ?pr-status= lands as visible state', () => {
  const desk = readFileSync('src/app/(shell)/tabs/payroll-tab.tsx', 'utf8');
  const home = readFileSync('src/lib/tab-url.ts', 'utf8');

  it('the seed reads the word through the ONE home (never a local parser)', () => {
    expect(desk.includes("import { parseInitialNamedMember } from '@/lib/tab-url';")).toBe(true);
    expect(
      desk.includes("parseInitialNamedMember(window.location.search, 'pr-status', PR_STATUS_FILTERS, 'ALL')")
    ).toBe(true);
    // the home owns the law and carries the fifteenth-word note
    expect(home.includes('export function parseInitialNamedMember')).toBe(true);
    expect(home.includes('v2.362.0 — THE PROMISE KEPT, THE FIFTEENTH WORD')).toBe(true);
  });

  it('the seed is the lazy initializer of the status filter (read-on-mount law)', () => {
    expect(
      desk.includes('const [statusFilter, setStatusFilter] = useState<(typeof PR_STATUS_FILTERS)[number]>(initialPrStatus);')
    ).toBe(true);
    // the SSR guard answers the capitalized neutral before any window exists
    expect(desk.includes("if (typeof window === 'undefined') return 'ALL';")).toBe(true);
    // the desk offers exactly the lenses it names
    expect(
      desk.includes("export const PR_STATUS_FILTERS = ['ALL', 'ACTIVE', 'ON_LEAVE', 'TERMINATED'] as const;")
    ).toBe(true);
  });

  it('the seed is CAST-FREE — the generic parser IS the union', () => {
    expect(desk.includes('function initialPrStatus(): (typeof PR_STATUS_FILTERS)[number]')).toBe(true);
    expect(desk.includes('useState<(typeof PR_STATUS_FILTERS)[number]>(initialPrStatus)')).toBe(true);
    // and no laundering snuck in around the new word
    expect(desk.includes('initialPrStatus() as')).toBe(false);
    expect(desk.includes('initialPrStatus as unknown')).toBe(false);
  });

  it('the word is desk-prefixed (the Task 44 collision law) and annotated', () => {
    expect(desk.includes("THE PAYROLL DESK'S OWN WORD")).toBe(true);
    expect(desk.includes('?pr-status=ACTIVE')).toBe(true);
    // the collision note lives with the word
    expect(desk.includes('Collision-checked at round start')).toBe(true);
  });

  it('THE DEFAULT-SUB-TAB AMENDMENT — the lens rides the desk\u2019s DEFAULT face', () => {
    // the survey law's first amended case, pinned from the mounting bytes:
    // the employees sub-tab is the desk's initial face, so a landing
    // that carries the word mounts with the chip visible
    expect(desk.includes("const [subTab, setSubTab] = useState<SubTab>('employees');")).toBe(true);
    expect(desk.includes("{subTab === 'employees' && <EmployeesSubTab storeId={currentStoreId} />}")).toBe(true);
    // the amendment is DOCUMENTED at the word, not just practiced
    expect(desk.includes('THE DEFAULT-SUB-TAB AMENDMENT')).toBe(true);
    expect(desk.includes("NON-default sub-tab stays blocked")).toBe(true);
  });

  it('the word binds to the ROSTER lens only (the second-lens desks\u2019 precedent)', () => {
    // the leave sub-tab's own filter keeps its hand-driven form — the
    // desk carries a second status lens with its own Select and its own
    // re-check voice; the word never touches it
    expect(desk.match(/onValueChange=\{setStatusFilter\}/g)?.length).toBe(1);
    expect(desk.includes('const choosePrStatus = (value: (typeof PR_STATUS_FILTERS)[number]) => {')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 3. THE LANDING CHIP — the face names the word it answered, in stone
// ---------------------------------------------------------------------------

describe('the landing chip — the face names the word it answered', () => {
  const desk = readFileSync('src/app/(shell)/tabs/payroll-tab.tsx', 'utf8');

  it('the chip renders only while the landing is live AND untouched', () => {
    expect(
      desk.includes("prLandingLive && landedPrStatus !== 'ALL' && statusFilter === landedPrStatus")
    ).toBe(true);
    expect(desk.includes('data-testid="pr-status-landing-word"')).toBe(true);
  });

  it('the chip names the exact word it answered', () => {
    expect(desk.includes('landed ?pr-status={landedPrStatus}')).toBe(true);
  });

  it('the chip sits BEFORE the roster Select in the toolbar (the position law)', () => {
    const chipAt = desk.indexOf('data-testid="pr-status-landing-word"');
    const selectAt = desk.indexOf('<Select value={statusFilter} onValueChange={choosePrStatus}>');
    expect(chipAt).toBeGreaterThan(-1);
    expect(selectAt).toBeGreaterThan(chipAt);
  });

  it('voice 1 — the dismissal clears the lens the word seeded and retires', () => {
    const at = desk.indexOf('data-testid="pr-status-landing-word"');
    const block = desk.slice(at, at + 400);
    expect(block).toContain("setStatusFilter('ALL')");
    expect(block).toContain('setPrLandingLive(false)');
  });

  it('voice 2 — a hand-driven Select change retires the chip', () => {
    expect(desk.includes('<Select value={statusFilter} onValueChange={choosePrStatus}>')).toBe(true);
    expect(desk.includes('a hand-driven change retires the landing word')).toBe(true);
  });

  it('the voices are honest — the desk claims exactly the two it has', () => {
    expect(desk.includes("hand-driven Select change or the chip's own dismissal")).toBe(true);
    expect(desk.includes('THE TWO VOICES:')).toBe(true);
  });

  it('the chip wears the lens\u2019s stone family in BOTH modes', () => {
    expect(desk.includes('border-stone-200 bg-stone-50 text-stone-700')).toBe(true);
    expect(desk.includes('dark:border-stone-500/30 dark:bg-stone-500/10 dark:text-stone-300')).toBe(true);
  });

  it('the dismiss hint sharpens on hover (the group-hover detail)', () => {
    expect(desk.includes('opacity-60 transition-opacity group-hover:opacity-100')).toBe(true);
  });

  it('the chip explains itself (the tooltip law)', () => {
    expect(desk.includes('title="The desk landed with this filter from the address bar — press to clear it"')).toBe(true);
    expect(desk.includes('aria-hidden="true"')).toBe(true);
  });

  it('the badge voices keep their families beside the chip (no masquerade)', () => {
    // the status badges the lens filters BY speak green/red/amber — the
    // chip's stone borrows nothing from them
    expect(desk.includes("ACTIVE: 'bg-green-100 dark:bg-green-950/40 text-green-700 dark:text-green-300 border-green-200 dark:border-green-900'")).toBe(true);
    expect(desk.includes("TERMINATED: 'bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-300 border-red-200 dark:border-red-900'")).toBe(true);
    expect(desk.includes("ON_LEAVE: 'bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-900'")).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 4. THE CONSTITUTION — the fifteenth row is visible from here
// ---------------------------------------------------------------------------

describe('the address-bar vocabulary — the fifteenth row (cross-suite pins)', () => {
  const constitution = readFileSync('src/tests/transfer-status-deep-link-v2357.test.ts', 'utf8');

  it('the constitution walks FIFTEEN words over THIRTEEN desks', () => {
    expect(constitution.includes('(twenty-three words, twenty-one desks)')).toBe(true);
    expect(constitution.includes("{ word: 'pr-status', desk: 'src/app/(shell)/tabs/payroll-tab.tsx', family: 'border-stone-200', suite: 'src/tests/pr-status-deep-link-v2362.test.ts' }")).toBe(true);
    expect(constitution.includes("'FIFTEENTH'")).toBe(true);
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
      if (readFileSync(p, 'utf8').includes('pr-status')) collected.push(p);
    }
  }
}

describe('the address-bar vocabulary stays one-writer-per-word', () => {
  it('`pr-status` speaks in exactly the expected files under src/', () => {
    const collected: string[] = [];
    walkSrc('src', collected);
    collected.sort();
    expect(collected).toEqual([
      'src/app/(shell)/tabs/payroll-tab.tsx',
      'src/lib/tab-url.ts',
      'src/lib/whats-new.ts',
      // the fourteen neighbor ledgers admitted this test file — and an
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
      // this file joins its own ledger in SORTED position ('pr-' before
      // 'proxy-', after 'inv-stock' — the derivation-assert law)
      'src/tests/ly-type-deep-link-v2368.test.ts',
      'src/tests/pr-status-deep-link-v2362.test.ts',
      // the po-status word's ledger lives beside the proxy-gate suite
      // (one release, two suites — the ledger is the honest speaker here)
      'src/tests/proxy-gate-layering-v2328.test.ts',
      'src/tests/rent-status-deep-link-v2355.test.ts',
      'src/tests/sec-type-deep-link-v2367.test.ts',
      'src/tests/sup-po-deep-link-v2332.test.ts',
      'src/tests/sup-status-deep-link-v2331.test.ts',
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
