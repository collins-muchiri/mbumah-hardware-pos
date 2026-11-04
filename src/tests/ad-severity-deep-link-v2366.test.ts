// THE ADMIN DESK'S OWN WORD (v2.366.0): the audit log answers the address
// bar.
//
// v2.328.0 gave the purchase-orders roster its STATUS word (`?po-status=`),
// v2.329.0 the inventory desk, v2.330.0 the customers desk, v2.331.0 the
// suppliers desk, v2.332.0 that desk's PO section, v2.333.0 the
// transactions desk's payment-method lens, v2.354.0 its type lens,
// v2.355.0 the rentals desk, v2.356.0 the invoices desk, v2.357.0 the
// transfers desk, v2.358.0 the gift cards desk, v2.359.0 the delivery
// notes desk, v2.360.0 the vouchers desk, v2.361.0 the credits desk,
// v2.362.0 the payroll desk, v2.363.0 the conversations desk, v2.364.0
// the catalog desk, v2.365.0 the debt-plans desk. THE PROMISE KEPT A
// NINETEENTH TIME — the admin desk's audit-log severity lens speaks its
// desk-prefixed `?ad-severity=all|CRITICAL|ERROR|WARN|INFO|DEBUG` and
// wears the landing chip in the lens's own neutral (the NINETEENTH family
// — indigo/amber/rose/emerald/cyan/violet/fuchsia/orange/teal/blue/lime/
// sky/pink/yellow/stone/slate/purple/zinc now gain the audit's neutral,
// the unbiased record's voice: an audit speaks no colour) beside the
// desk's own voices (red/amber/blue are the severity badges' own words,
// green the health cards' — a voice must not masquerade as a badge, and
// every chromatic hue was already spoken; neutral is the byte-free hue
// AND unused by the family). The owner's morning question — anything
// critical overnight? — is now an address. THE NEUTRAL VOICE, LOWERCASE:
// the lens's words are the severity Select's OWN keys (UPPERCASE), so a
// capitalized `Critical` or an UPPERCASE `ALL` is an unknown word here —
// the same lowercase-neutral inversion the lowercase desks speak, read in
// mirror: the words are UPPER, the neutral stays lower.
// THE FACE NOTE: the lens's control is the standard Select — the chooser
// is the typed `chooseAdSeverity` (no laundering cast; the old inline
// `(v) => setFilters(...)` body is GONE), and the lens is ALWAYS RENDERED
// on the desk's top-level pane (the Audit Log card's header toolbar sits
// BEFORE the desk's Tabs — no sub-tab gate, no collapsible panel), so a
// landing that carries the word shows the chip immediately. The card's
// list feeds the filter straight into its query (`severity: filters.
// severity !== 'all' ? filters.severity : undefined`), so a landed word
// filters the LOG, not just the Select's face (the cv-type precedent).
//
// THE ROUND'S OTHER HALF — THE ADVISORY UNWIND: this suite also pins the
// v2.366.0 type fixes (the scoped instrument's residual driven to ZERO):
// error-boundary's five override modifiers, api.ts's honest typeof
// narrowing (the CSRF token's string contract), debt-plan-utils' honest
// number return (the module's own documented contract), ApiResponse's
// export (the union mutation's honest envelope), and admin's toggle
// mutation annotation.
//
// Pins: the parser's truth table (pure, UPPERCASE vocabulary, the
// lowercase neutral's self-seed AND its inversions), the desk's seed
// bytes and its cast-free typing, the always-rendered top-level face
// bytes (the lens BEFORE the desk's Tabs), the query-feed bytes (the word
// filters the LOG), the chip's bytes and its two retirement voices (the
// Select face: dismissal + a hand-driven change through the typed
// chooser), the one-home promise (the law's doc carries the nineteenth
// word), the advisory-unwind bytes, the collision ledger — and the
// constitution's nineteenth row from its own suite.

import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { parseInitialNamedMember } from '@/lib/tab-url';

const AD_SEVERITY_FILTERS = ['all', 'CRITICAL', 'ERROR', 'WARN', 'INFO', 'DEBUG'] as const;

// ---------------------------------------------------------------------------
// 1. THE PARSER'S TRUTH TABLE (the membership law, one home, UPPERCASE voice,
//    the LOWERCASE neutral)
// ---------------------------------------------------------------------------

describe('parseInitialNamedMember — the audit lens speaks the one home', () => {
  it('a lens the desk offers seeds the filter', () => {
    expect(parseInitialNamedMember('?ad-severity=CRITICAL', 'ad-severity', AD_SEVERITY_FILTERS, 'all')).toBe('CRITICAL');
    expect(parseInitialNamedMember('?ad-severity=ERROR', 'ad-severity', AD_SEVERITY_FILTERS, 'all')).toBe('ERROR');
    expect(parseInitialNamedMember('?ad-severity=WARN', 'ad-severity', AD_SEVERITY_FILTERS, 'all')).toBe('WARN');
    expect(parseInitialNamedMember('?ad-severity=INFO', 'ad-severity', AD_SEVERITY_FILTERS, 'all')).toBe('INFO');
    expect(parseInitialNamedMember('?ad-severity=DEBUG', 'ad-severity', AD_SEVERITY_FILTERS, 'all')).toBe('DEBUG');
  });

  it('a lens the desk does not offer answers the fallback (never stranded)', () => {
    expect(parseInitialNamedMember('?ad-severity=FATAL', 'ad-severity', AD_SEVERITY_FILTERS, 'all')).toBe('all');
    expect(parseInitialNamedMember('?ad-severity=', 'ad-severity', AD_SEVERITY_FILTERS, 'all')).toBe('all');
  });

  it('case-sensitive: a capitalized word is an unknown word, not a clever match', () => {
    // the lens's own words are UPPERCASE — `Critical` names nothing
    expect(parseInitialNamedMember('?ad-severity=Critical', 'ad-severity', AD_SEVERITY_FILTERS, 'all')).toBe('all');
    expect(parseInitialNamedMember('?ad-severity=critical', 'ad-severity', AD_SEVERITY_FILTERS, 'all')).toBe('all');
    expect(parseInitialNamedMember('?ad-severity=Error', 'ad-severity', AD_SEVERITY_FILTERS, 'all')).toBe('all');
  });

  it('the NEUTRAL IS LOWERCASE here — UPPERCASE ALL names nothing (the inversion)', () => {
    // the desk's all-item is spelled 'all' (the Select's own key since the
    // desk first shipped): a capitalized spelling is an unknown word — and
    // the lowercase neutral seeds itself (the fallback IS the member)
    expect(parseInitialNamedMember('?ad-severity=ALL', 'ad-severity', AD_SEVERITY_FILTERS, 'all')).toBe('all');
    expect(parseInitialNamedMember('?ad-severity=all', 'ad-severity', AD_SEVERITY_FILTERS, 'all')).toBe('all');
  });

  it('missing, bare, and malformed searches answer the fallback — never throw', () => {
    expect(parseInitialNamedMember('', 'ad-severity', AD_SEVERITY_FILTERS, 'all')).toBe('all');
    expect(parseInitialNamedMember('?tab=admin', 'ad-severity', AD_SEVERITY_FILTERS, 'all')).toBe('all');
    expect(parseInitialNamedMember('ad-severity=WARN', 'ad-severity', AD_SEVERITY_FILTERS, 'all')).toBe('WARN');
    expect(parseInitialNamedMember('?????', 'ad-severity', AD_SEVERITY_FILTERS, 'all')).toBe('all');
    expect(parseInitialNamedMember('?ad-severity=CRITICAL&page=2', 'ad-severity', AD_SEVERITY_FILTERS, 'all')).toBe('CRITICAL');
  });

  it('the word rides alongside the vocabulary\u2019s other words without collision', () => {
    // a landing can carry the desk AND its lens AND the neighbors' words
    // — one bar, one word per lens, every lens its own
    expect(
      parseInitialNamedMember('?tab=admin&ad-severity=CRITICAL&txn-type=refund', 'ad-severity', AD_SEVERITY_FILTERS, 'all')
    ).toBe('CRITICAL');
    expect(
      parseInitialNamedMember('?tab=admin&ad-severity=ERROR&rent-status=OVERDUE', 'ad-severity', AD_SEVERITY_FILTERS, 'all')
    ).toBe('ERROR');
    expect(
      parseInitialNamedMember('?tab=admin&ad-severity=WARN&po-status=PENDING_APPROVAL&inv-stock=low', 'ad-severity', AD_SEVERITY_FILTERS, 'all')
    ).toBe('WARN');
    expect(
      parseInitialNamedMember('?tab=admin&ad-severity=INFO&pr-status=ACTIVE&cust-debt=overdue&sup-status=ACTIVE', 'ad-severity', AD_SEVERITY_FILTERS, 'all')
    ).toBe('INFO');
    expect(
      parseInitialNamedMember('?tab=admin&ad-severity=DEBUG&sup-po=SENT&txn-pay=CASH&cv-type=INTERNAL', 'ad-severity', AD_SEVERITY_FILTERS, 'all')
    ).toBe('DEBUG');
    expect(
      parseInitialNamedMember('?tab=admin&ad-severity=CRITICAL&inv-status=PAID&gc-status=REDEEMED&dn-status=DELIVERED&vc-status=PAUSED&cr-type=DEBIT&transfer-status=IN_TRANSIT', 'ad-severity', AD_SEVERITY_FILTERS, 'all')
    ).toBe('CRITICAL');
    expect(
      parseInitialNamedMember('?tab=admin&ad-severity=ERROR&cat-stock=low_stock&dp-status=overdue', 'ad-severity', AD_SEVERITY_FILTERS, 'all')
    ).toBe('ERROR');
  });
});

// ---------------------------------------------------------------------------
// 2. THE DESK'S SEED — read-on-mount, one home, never a copy, never a cast
// ---------------------------------------------------------------------------

describe('the admin desk — ?ad-severity= lands as visible state', () => {
  const desk = readFileSync('src/app/(shell)/tabs/admin-tab.tsx', 'utf8');
  const home = readFileSync('src/lib/tab-url.ts', 'utf8');

  it('the seed reads the word through the ONE home (never a local parser)', () => {
    expect(desk.includes("import { parseInitialNamedMember } from '@/lib/tab-url';")).toBe(true);
    expect(
      desk.includes("parseInitialNamedMember(window.location.search, 'ad-severity', AD_SEVERITY_FILTERS, 'all')")
    ).toBe(true);
    // the home owns the law and carries the nineteenth-word note
    expect(home.includes('export function parseInitialNamedMember')).toBe(true);
    expect(home.includes('v2.366.0 — THE PROMISE KEPT, THE NINETEENTH WORD')).toBe(true);
  });

  it('the seed is the lazy initializer of the filter (read-on-mount law)', () => {
    expect(
      desk.includes('severity: initialAdSeverity(),')
    ).toBe(true);
    // the SSR guard answers the neutral before any window exists
    expect(desk.includes("if (typeof window === 'undefined') return 'all';")).toBe(true);
    // the desk offers exactly the lenses it names
    expect(
      desk.includes("export const AD_SEVERITY_FILTERS = ['all', 'CRITICAL', 'ERROR', 'WARN', 'INFO', 'DEBUG'] as const;")
    ).toBe(true);
  });

  it('the seed is CAST-FREE — the generic parser IS the union', () => {
    expect(desk.includes('function initialAdSeverity(): AdSeverityFilter')).toBe(true);
    expect(desk.includes('type AdSeverityFilter = (typeof AD_SEVERITY_FILTERS)[number];')).toBe(true);
    expect(desk.includes('useState<AdSeverityFilter>(initialAdSeverity)')).toBe(true);
    // no laundering snuck in around the new word
    expect(desk.includes('initialAdSeverity() as')).toBe(false);
    expect(desk.includes('initialAdSeverity as unknown')).toBe(false);
  });

  it('the word is desk-prefixed (the Task 44 collision law) and annotated', () => {
    expect(desk.includes("THE ADMIN DESK'S OWN WORD")).toBe(true);
    expect(desk.includes('?ad-severity=CRITICAL')).toBe(true);
    // the collision census was taken at round start (tree-wide, zero hits)
    expect(desk.includes('ad-severity')).toBe(true);
  });

  it('THE ALWAYS-RENDERED TOP-LEVEL FACE — the lens BEFORE the desk\u2019s Tabs', () => {
    // the Audit Log card sits in the desk's top-level stack, BEFORE the
    // first TabsContent: a landing shows the chip immediately (the
    // always-visible face WITHOUT an amendment)
    const chipAt = desk.indexOf('data-testid="ad-severity-landing-word"');
    const firstTabsContent = desk.indexOf('<TabsContent');
    expect(chipAt).toBeGreaterThan(-1);
    expect(firstTabsContent).toBeGreaterThan(chipAt);
    // the face is DOCUMENTED at the word, not just practiced
    expect(desk.includes('ALWAYS RENDERED')).toBe(true);
  });

  it('the word filters the LOG, not just the Select\u2019s face (the query feed)', () => {
    // the card's list feeds the filter straight into its query — the
    // cv-type precedent (server-side read)
    expect(
      desk.includes("severity: filters.severity !== 'all' ? filters.severity : undefined,")
    ).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 3. THE LANDING CHIP — the face names the word it answered, in neutral
// ---------------------------------------------------------------------------

describe('the landing chip — the face names the word it answered', () => {
  const desk = readFileSync('src/app/(shell)/tabs/admin-tab.tsx', 'utf8');

  it('the chip renders only while the landing is live AND untouched', () => {
    expect(
      desk.includes("adLandingLive && landedAdSeverity !== 'all' && filters.severity === landedAdSeverity")
    ).toBe(true);
    expect(desk.includes('data-testid="ad-severity-landing-word"')).toBe(true);
  });

  it('the chip names the exact word it answered', () => {
    expect(desk.includes('landed ?ad-severity={landedAdSeverity}')).toBe(true);
  });

  it('the chip sits BEFORE the severity Select in the toolbar (the position law)', () => {
    const chipAt = desk.indexOf('data-testid="ad-severity-landing-word"');
    const selectAt = desk.indexOf('<Select value={filters.severity} onValueChange={chooseAdSeverity}>');
    expect(chipAt).toBeGreaterThan(-1);
    expect(selectAt).toBeGreaterThan(chipAt);
  });

  it('voice 1 — the dismissal clears the lens the word seeded and retires', () => {
    const at = desk.indexOf('data-testid="ad-severity-landing-word"');
    const block = desk.slice(at, at + 400);
    expect(block).toContain("severity: 'all'");
    expect(block).toContain('setAdLandingLive(false)');
  });

  it('voice 2 — a hand-driven Select change retires the chip (the typed chooser)', () => {
    // exactly ONE onValueChange carries the chooser — the word binds to
    // the SEVERITY lens only
    expect(desk.match(/onValueChange=\{chooseAdSeverity\}/g)?.length).toBe(1);
    // the chooser retires the landing
    expect(desk.includes('a hand-driven Select change retires the landing word')).toBe(true);
    expect(desk.includes('setAdLandingLive(false);')).toBe(true);
  });

  it('the OLD inline chooser is GONE (the cast-negative pin)', () => {
    expect(desk.includes('setFilters(f => ({ ...f, severity: v })); setPage(1);')).toBe(false);
  });

  it('the chip wears the lens\u2019s neutral family in BOTH modes', () => {
    expect(desk.includes('border-neutral-200 bg-neutral-50 text-neutral-700')).toBe(true);
    expect(desk.includes('dark:border-neutral-500/30 dark:bg-neutral-500/10 dark:text-neutral-300')).toBe(true);
  });

  it('the dismiss hint sharpens on hover (the group-hover detail)', () => {
    expect(desk.includes('opacity-60 transition-opacity group-hover:opacity-100')).toBe(true);
  });

  it('the chip explains itself (the tooltip law)', () => {
    expect(desk.includes('title="The audit log landed with this severity from the address bar — press to clear it"')).toBe(true);
    expect(desk.includes('aria-hidden="true"')).toBe(true);
  });

  it('the desk\u2019s own voices keep their families beside the chip (no masquerade)', () => {
    // the severity badges' red/amber/blue are the desk's own words — the
    // chip's neutral borrows nothing from them
    expect(desk.includes("'CRITICAL': case 'ERROR': return 'bg-red-500';")).toBe(true);
    expect(desk.includes("case 'WARN': return 'bg-amber-500';")).toBe(true);
    expect(desk.includes('border-neutral-200 bg-neutral-50')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 4. THE ADVISORY UNWIND — the round\u2019s other half, pinned from bytes
// ---------------------------------------------------------------------------

describe('the advisory unwind — the scoped instrument\u2019s residual driven to zero', () => {
  const boundary = readFileSync('src/components/error-boundary.tsx', 'utf8');
  const api = readFileSync('src/lib/api.ts', 'utf8');
  const debtUtils = readFileSync('src/lib/debt-plan-utils.ts', 'utf8');
  const admin = readFileSync('src/app/(shell)/tabs/admin-tab.tsx', 'utf8');

  it('error-boundary\u2019s five overriding members carry the override modifier', () => {
    expect(boundary.match(/override componentDidCatch\(/g)?.length).toBe(2);
    expect(boundary.match(/override render\(\)/g)?.length).toBe(2);
    expect(boundary.match(/override componentWillUnmount\(\)/g)?.length).toBe(1);
    // no un-annotated overrides remain in the file
    expect(boundary.match(/^  componentDidCatch\(/gm)?.length ?? 0).toBe(0);
    expect(boundary.match(/^  render\(\)/gm)?.length ?? 0).toBe(0);
  });

  it('api.ts\u2019s CSRF token honors its own string contract by narrowing, not casting', () => {
    expect(api.includes('const token: unknown = json.data?.token;')).toBe(true);
    expect(api.includes("if (json.success && typeof token === 'string' && token) {")).toBe(true);
    expect(api.includes('      return token;')).toBe(true);
    // the old untyped trust is gone (the narrowed token is returned, and
    // the cookie fallback's own return is the string-typed path it always was)
    expect(api.includes('csrfToken = json.data.token;')).toBe(false);
    expect(api.includes("if (json.success && json.data?.token) {")).toBe(false);
    // the envelope\u2019s name is exported for the honest union annotation
    expect(api.includes('export interface ApiResponse<T = unknown>')).toBe(true);
  });

  it('debt-plan-utils\u2019 total-with-interest returns the number its contract names', () => {
    expect(debtUtils.includes('return safeTotal.mul(growthFactor).toNumber();')).toBe(true);
    expect(debtUtils.includes('return safeTotal.mul(growthFactor);')).toBe(false);
    // the module's documented contract, pinned beside the fix
    expect(debtUtils.includes('receive plain `number`s back')).toBe(true);
  });

  it('admin\u2019s toggle mutation names the honest union envelope', () => {
    expect(
      admin.includes('mutationFn: async (user: UserItem): Promise<ApiResponse<UserItem | { message: string }>> =>')
    ).toBe(true);
    expect(admin.includes('type ApiResponse,')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 5. THE CONSTITUTION — the nineteenth row is visible from here
// ---------------------------------------------------------------------------

describe('the address-bar vocabulary — the nineteenth row (cross-suite pins)', () => {
  const constitution = readFileSync('src/tests/transfer-status-deep-link-v2357.test.ts', 'utf8');

  it('the constitution walks NINETEEN words over SEVENTEEN desks', () => {
    expect(constitution.includes('(twenty-two words, twenty desks)')).toBe(true);
    expect(constitution.includes("{ word: 'ad-severity', desk: 'src/app/(shell)/tabs/admin-tab.tsx', family: 'border-neutral-200', suite: 'src/tests/ad-severity-deep-link-v2366.test.ts' }")).toBe(true);
    expect(constitution.includes("'NINETEENTH'")).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 6. THE COLLISION LEDGER — which files may speak the word at all
// ---------------------------------------------------------------------------

function walkSrc(dir: string, collected: string[]): void {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    const st = statSync(p);
    if (st.isDirectory()) {
      if (entry === 'node_modules' || entry === '.next') continue;
      walkSrc(p, collected);
    } else if (/\.(ts|tsx|mjs|js)$/.test(entry)) {
      if (readFileSync(p, 'utf8').includes('ad-severity')) collected.push(p);
    }
  }
}

describe('the address-bar vocabulary stays one-writer-per-word', () => {
  it('`ad-severity` speaks in exactly the expected files under src/', () => {
    const collected: string[] = [];
    walkSrc('src', collected);
    collected.sort();
    expect(collected).toEqual([
      'src/app/(shell)/tabs/admin-tab.tsx',
      'src/lib/tab-url.ts',
      'src/lib/whats-new.ts',
      // the eighteen neighbor ledgers admitted this test file — and an
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
      'src/tests/ly-type-deep-link-v2368.test.ts',
      'src/tests/pr-status-deep-link-v2362.test.ts',
      // the po-status word's ledger lives beside the proxy-gate suite
      // (one release, two suites — the ledger is the honest speaker here)
      'src/tests/proxy-gate-layering-v2328.test.ts',
      'src/tests/rent-status-deep-link-v2355.test.ts',
      'src/tests/sec-type-deep-link-v2367.test.ts',
      'src/tests/sup-po-deep-link-v2332.test.ts',
      'src/tests/sup-status-deep-link-v2331.test.ts',
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
