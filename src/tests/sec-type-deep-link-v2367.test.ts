// THE SECURITY DESK'S OWN WORD (v2.367.0): the watchtower answers the
// address bar.
//
// v2.328.0 gave the purchase-orders roster its STATUS word (`?po-status=`),
// v2.329.0 the inventory desk, v2.330.0 the customers desk, v2.331.0 the
// suppliers desk, v2.332.0 that desk's PO section, v2.333.0 the
// transactions desk's payment-method lens, v2.354.0 its type lens,
// v2.355.0 the rentals desk, v2.356.0 the invoices desk, v2.357.0 the
// transfers desk, v2.358.0 the gift cards desk, v2.359.0 the delivery
// notes desk, v2.360.0 the vouchers desk, v2.361.0 the credits desk,
// v2.362.0 the payroll desk, v2.363.0 the conversations desk, v2.364.0
// the catalog desk, v2.365.0 the debt-plans desk, v2.366.0 the admin
// desk. THE PROMISE KEPT A TWENTIETH TIME — the security desk's event-type
// lens speaks its desk-prefixed
// `?sec-type=all|RATE_LIMITED|BRUTE_FORCE|CSRF_FAILED|INVALID_INPUT|
// SUSPICIOUS_ACTIVITY|ACCOUNT_LOCKED|SESSION_HIJACK_ATTEMPT|
// UNAUTHORIZED_ACCESS` and wears the landing chip in the lens's own gray
// (the TWENTIETH family — indigo/amber/rose/emerald/cyan/violet/fuchsia/
// orange/teal/blue/lime/sky/pink/yellow/stone/slate/purple/zinc/neutral
// now gain the watchtower's gray) — THE PALETTE-EXHAUSTION AMENDMENT: the
// family has spoken nineteen hues, and every remaining standard hue is
// spoken by this desk (red the alarm tones, green the all-clear tones,
// gray the muted surfaces); a surface is not a voice — the desk's gray
// bytes are muted text and panel fills, never badges, and the chip's own
// shades are byte-free on this desk. The owner's morning question — was
// anyone banging on the door last night? — is now an address, through the
// family's LARGEST case-sensitive dictionary (nine words, the event wire's
// own UPPERCASE keys). THE NEUTRAL VOICE, LOWERCASE: the neutral is the
// Select's own `all`, so a capitalized `Brute_Force` or an UPPERCASE `ALL`
// names nothing here.
// THE COLLAPSIBLE-FACE AMENDMENT'S SECOND APPLICATION (v2.364.0's law):
// the lens rides the desk's collapsible filters panel (`showFilters`
// defaults down), and a landing that carries the word RAISES the panel it
// lands into — the panel's seed reads the same landed word, so the chip
// is visible on landing; a neutral `all` lands NO chip and the panel
// stays down. The read is QUERY-FED (`params.eventType = filterEventType`)
// — a landed word filters the EVENTS, not just the Select's face (the
// conversations desk's precedent).
//
// Pins: the parser's truth table (nine offered keys, the neutral's
// self-seed AND its inversions, the longest dictionary), the desk's seed
// bytes and its cast-free typing, the amendment's mounting bytes (the
// panel seed), the query-feed bytes, the chip's bytes and its two
// retirement voices, the position law (chip inside the Event Type block,
// before the Select), the palette-exhaustion note, the one-home promise
// (the law's doc carries the twentieth word), the collision ledger — and
// the constitution's twentieth row from its own suite.

import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { parseInitialNamedMember } from '@/lib/tab-url';

const SEC_TYPE_FILTERS = ['all', 'RATE_LIMITED', 'BRUTE_FORCE', 'CSRF_FAILED', 'INVALID_INPUT', 'SUSPICIOUS_ACTIVITY', 'ACCOUNT_LOCKED', 'SESSION_HIJACK_ATTEMPT', 'UNAUTHORIZED_ACCESS'] as const;

// ---------------------------------------------------------------------------
// 1. THE PARSER'S TRUTH TABLE (the membership law, one home, UPPERCASE voice,
//    the LOWERCASE neutral — nine words, the family's longest dictionary)
// ---------------------------------------------------------------------------

describe('parseInitialNamedMember — the watchtower lens speaks the one home', () => {
  it('a lens the desk offers seeds the filter', () => {
    expect(parseInitialNamedMember('?sec-type=RATE_LIMITED', 'sec-type', SEC_TYPE_FILTERS, 'all')).toBe('RATE_LIMITED');
    expect(parseInitialNamedMember('?sec-type=BRUTE_FORCE', 'sec-type', SEC_TYPE_FILTERS, 'all')).toBe('BRUTE_FORCE');
    expect(parseInitialNamedMember('?sec-type=CSRF_FAILED', 'sec-type', SEC_TYPE_FILTERS, 'all')).toBe('CSRF_FAILED');
    expect(parseInitialNamedMember('?sec-type=INVALID_INPUT', 'sec-type', SEC_TYPE_FILTERS, 'all')).toBe('INVALID_INPUT');
    expect(parseInitialNamedMember('?sec-type=SUSPICIOUS_ACTIVITY', 'sec-type', SEC_TYPE_FILTERS, 'all')).toBe('SUSPICIOUS_ACTIVITY');
    expect(parseInitialNamedMember('?sec-type=ACCOUNT_LOCKED', 'sec-type', SEC_TYPE_FILTERS, 'all')).toBe('ACCOUNT_LOCKED');
    expect(parseInitialNamedMember('?sec-type=SESSION_HIJACK_ATTEMPT', 'sec-type', SEC_TYPE_FILTERS, 'all')).toBe('SESSION_HIJACK_ATTEMPT');
    expect(parseInitialNamedMember('?sec-type=UNAUTHORIZED_ACCESS', 'sec-type', SEC_TYPE_FILTERS, 'all')).toBe('UNAUTHORIZED_ACCESS');
  });

  it('a lens the desk does not offer answers the fallback (never stranded)', () => {
    expect(parseInitialNamedMember('?sec-type=ROOT_EXPLOIT', 'sec-type', SEC_TYPE_FILTERS, 'all')).toBe('all');
    expect(parseInitialNamedMember('?sec-type=', 'sec-type', SEC_TYPE_FILTERS, 'all')).toBe('all');
  });

  it('case-sensitive: a capitalized word is an unknown word, not a clever match', () => {
    // the lens's own words are UPPERCASE — `Brute_Force` names nothing
    expect(parseInitialNamedMember('?sec-type=Brute_Force', 'sec-type', SEC_TYPE_FILTERS, 'all')).toBe('all');
    expect(parseInitialNamedMember('?sec-type=brute_force', 'sec-type', SEC_TYPE_FILTERS, 'all')).toBe('all');
    expect(parseInitialNamedMember('?sec-type=Rate_Limited', 'sec-type', SEC_TYPE_FILTERS, 'all')).toBe('all');
  });

  it('the NEUTRAL IS LOWERCASE here — UPPERCASE ALL names nothing (the inversion)', () => {
    expect(parseInitialNamedMember('?sec-type=ALL', 'sec-type', SEC_TYPE_FILTERS, 'all')).toBe('all');
    expect(parseInitialNamedMember('?sec-type=all', 'sec-type', SEC_TYPE_FILTERS, 'all')).toBe('all');
  });

  it('missing, bare, and malformed searches answer the fallback — never throw', () => {
    expect(parseInitialNamedMember('', 'sec-type', SEC_TYPE_FILTERS, 'all')).toBe('all');
    expect(parseInitialNamedMember('?tab=security', 'sec-type', SEC_TYPE_FILTERS, 'all')).toBe('all');
    expect(parseInitialNamedMember('sec-type=BRUTE_FORCE', 'sec-type', SEC_TYPE_FILTERS, 'all')).toBe('BRUTE_FORCE');
    expect(parseInitialNamedMember('?????', 'sec-type', SEC_TYPE_FILTERS, 'all')).toBe('all');
    expect(parseInitialNamedMember('?sec-type=BRUTE_FORCE&range=7d', 'sec-type', SEC_TYPE_FILTERS, 'all')).toBe('BRUTE_FORCE');
  });

  it('the word rides alongside the vocabulary\u2019s other words without collision', () => {
    expect(
      parseInitialNamedMember('?tab=security&sec-type=BRUTE_FORCE&txn-type=refund', 'sec-type', SEC_TYPE_FILTERS, 'all')
    ).toBe('BRUTE_FORCE');
    expect(
      parseInitialNamedMember('?tab=security&sec-type=CSRF_FAILED&rent-status=OVERDUE', 'sec-type', SEC_TYPE_FILTERS, 'all')
    ).toBe('CSRF_FAILED');
    expect(
      parseInitialNamedMember('?tab=security&sec-type=RATE_LIMITED&po-status=PENDING_APPROVAL&inv-stock=low', 'sec-type', SEC_TYPE_FILTERS, 'all')
    ).toBe('RATE_LIMITED');
    expect(
      parseInitialNamedMember('?tab=security&sec-type=INVALID_INPUT&pr-status=ACTIVE&cust-debt=overdue&sup-status=ACTIVE', 'sec-type', SEC_TYPE_FILTERS, 'all')
    ).toBe('INVALID_INPUT');
    expect(
      parseInitialNamedMember('?tab=security&sec-type=SUSPICIOUS_ACTIVITY&sup-po=SENT&txn-pay=CASH&cv-type=INTERNAL', 'sec-type', SEC_TYPE_FILTERS, 'all')
    ).toBe('SUSPICIOUS_ACTIVITY');
    expect(
      parseInitialNamedMember('?tab=security&sec-type=ACCOUNT_LOCKED&inv-status=PAID&gc-status=REDEEMED&dn-status=DELIVERED&vc-status=PAUSED&cr-type=DEBIT&transfer-status=IN_TRANSIT', 'sec-type', SEC_TYPE_FILTERS, 'all')
    ).toBe('ACCOUNT_LOCKED');
    expect(
      parseInitialNamedMember('?tab=security&sec-type=SESSION_HIJACK_ATTEMPT&cat-stock=low_stock&dp-status=overdue&ad-severity=CRITICAL', 'sec-type', SEC_TYPE_FILTERS, 'all')
    ).toBe('SESSION_HIJACK_ATTEMPT');
  });
});

// ---------------------------------------------------------------------------
// 2. THE DESK'S SEED — read-on-mount, one home, never a copy, never a cast
// ---------------------------------------------------------------------------

describe('the security desk — ?sec-type= lands as visible state', () => {
  const desk = readFileSync('src/app/(shell)/tabs/security-tab.tsx', 'utf8');
  const home = readFileSync('src/lib/tab-url.ts', 'utf8');

  it('the seed reads the word through the ONE home (never a local parser)', () => {
    expect(desk.includes("import { parseInitialNamedMember } from '@/lib/tab-url';")).toBe(true);
    expect(
      desk.includes("parseInitialNamedMember(window.location.search, 'sec-type', SEC_TYPE_FILTERS, 'all')")
    ).toBe(true);
    expect(home.includes('export function parseInitialNamedMember')).toBe(true);
    expect(home.includes('v2.367.0 — THE PROMISE KEPT, THE TWENTIETH WORD')).toBe(true);
  });

  it('the seed is the lazy initializer of the filter (read-on-mount law)', () => {
    expect(
      desk.includes('const [filterEventType, setFilterEventType] = useState<SecTypeFilter>(initialSecType);')
    ).toBe(true);
    expect(desk.includes("if (typeof window === 'undefined') return 'all';")).toBe(true);
    expect(
      desk.includes("export const SEC_TYPE_FILTERS = ['all', 'RATE_LIMITED', 'BRUTE_FORCE', 'CSRF_FAILED', 'INVALID_INPUT', 'SUSPICIOUS_ACTIVITY', 'ACCOUNT_LOCKED', 'SESSION_HIJACK_ATTEMPT', 'UNAUTHORIZED_ACCESS'] as const;")
    ).toBe(true);
  });

  it('the seed is CAST-FREE — the generic parser IS the union', () => {
    expect(desk.includes('function initialSecType(): SecTypeFilter')).toBe(true);
    expect(desk.includes('type SecTypeFilter = (typeof SEC_TYPE_FILTERS)[number];')).toBe(true);
    expect(desk.includes('useState<SecTypeFilter>(initialSecType)')).toBe(true);
    expect(desk.includes('initialSecType() as')).toBe(false);
    expect(desk.includes('initialSecType as unknown')).toBe(false);
  });

  it('the word is desk-prefixed (the Task 44 collision law) and annotated', () => {
    expect(desk.includes("THE SECURITY DESK'S OWN WORD")).toBe(true);
    expect(desk.includes('?sec-type=BRUTE_FORCE')).toBe(true);
    expect(desk.includes('sec-type')).toBe(true);
  });

  it('THE COLLAPSIBLE-FACE AMENDMENT\u2019S SECOND APPLICATION — the landing raises the panel', () => {
    // the panel's seed reads the SAME landed word — pinned from the
    // mounting bytes (the v2.364.0 law's exact form)
    expect(desk.includes("const [showFilters, setShowFilters] = useState<boolean>(() => landedSecType !== 'all');")).toBe(true);
    // the lens rides the panel (the Select is AFTER the panel's opening)
    const panelAt = desk.indexOf('{showFilters && (');
    const selectAt = desk.indexOf('<Select value={filterEventType} onValueChange={chooseSecType}>');
    expect(panelAt).toBeGreaterThan(-1);
    expect(selectAt).toBeGreaterThan(panelAt);
    // the amendment is DOCUMENTED at the word, not just practiced
    expect(desk.includes('THE COLLAPSIBLE-FACE AMENDMENT')).toBe(true);
  });

  it('the word filters the EVENTS, not just the Select\u2019s face (the query feed)', () => {
    expect(
      desk.includes("if (filterEventType && filterEventType !== 'all') params.eventType = filterEventType;")
    ).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 3. THE LANDING CHIP — the face names the word it answered, in gray
// ---------------------------------------------------------------------------

describe('the landing chip — the face names the word it answered', () => {
  const desk = readFileSync('src/app/(shell)/tabs/security-tab.tsx', 'utf8');

  it('the chip renders only while the landing is live AND untouched', () => {
    expect(
      desk.includes("secLandingLive && landedSecType !== 'all' && filterEventType === landedSecType")
    ).toBe(true);
    expect(desk.includes('data-testid="sec-type-landing-word"')).toBe(true);
  });

  it('the chip names the exact word it answered', () => {
    expect(desk.includes('landed ?sec-type={landedSecType}')).toBe(true);
  });

  it('the chip sits INSIDE the Event Type block, BEFORE the Select (the position law)', () => {
    const chipAt = desk.indexOf('data-testid="sec-type-landing-word"');
    const selectAt = desk.indexOf('<Select value={filterEventType} onValueChange={chooseSecType}>');
    const labelAt = desk.indexOf('>Event Type</Label>');
    expect(chipAt).toBeGreaterThan(labelAt);
    expect(selectAt).toBeGreaterThan(chipAt);
  });

  it('voice 1 — the dismissal clears the lens the word seeded and retires', () => {
    const at = desk.indexOf('data-testid="sec-type-landing-word"');
    const block = desk.slice(Math.max(0, at - 500), at + 300);
    expect(block).toContain("setFilterEventType('all')");
    expect(block).toContain('setSecLandingLive(false)');
  });

  it('voice 2 — a hand-driven Select change retires the chip (the typed chooser)', () => {
    expect(desk.match(/onValueChange=\{chooseSecType\}/g)?.length).toBe(1);
    expect(desk.includes('a hand-driven Select change retires the landing word')).toBe(true);
    expect(desk.includes('setSecLandingLive(false);')).toBe(true);
  });

  it('the OLD bare setter is GONE (the chooser owns the lens, the word binds only it)', () => {
    expect(desk.includes('onValueChange={setFilterEventType}')).toBe(false);
  });

  it('the chip wears the lens\u2019s gray family in BOTH modes (the palette-exhaustion amendment)', () => {
    expect(desk.includes('border-gray-200 bg-gray-50 text-gray-700')).toBe(true);
    expect(desk.includes('dark:border-gray-500/30 dark:bg-gray-500/10 dark:text-gray-300')).toBe(true);
    // the amendment is DOCUMENTED at the chip, not just practiced
    expect(desk.includes('THE PALETTE-EXHAUSTION AMENDMENT')).toBe(true);
    expect(desk.includes('A surface is not a voice')).toBe(true);
  });

  it('the chip\u2019s shades are BYTE-FREE as badge voices (the desk speaks surfaces, not badges)', () => {
    // the desk's own gray bytes are the muted surface forms — never the
    // chip's badge shades
    expect(desk.includes('bg-gray-100 dark:bg-gray-900')).toBe(false);
    expect(desk.includes('text-gray-700 dark:text-gray-300')).toBe(false);
  });

  it('the dismiss hint sharpens on hover (the group-hover detail)', () => {
    expect(desk.includes('opacity-60 transition-opacity group-hover:opacity-100')).toBe(true);
  });

  it('the chip explains itself (the tooltip law)', () => {
    expect(desk.includes('title="The watchtower landed with this event type from the address bar — press to clear it"')).toBe(true);
    expect(desk.includes('aria-hidden="true"')).toBe(true);
  });

  it('the desk\u2019s own voices keep their families beside the chip (no masquerade)', () => {
    // amber is the watchtower's dominant caution voice — the chip's gray
    // borrows nothing from it
    expect(desk.includes('bg-amber-500')).toBe(true);
    expect(desk.includes('border-gray-200 bg-gray-50')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 4. THE CONSTITUTION — the twentieth row is visible from here
// ---------------------------------------------------------------------------

describe('the address-bar vocabulary — the twentieth row (cross-suite pins)', () => {
  const constitution = readFileSync('src/tests/transfer-status-deep-link-v2357.test.ts', 'utf8');

  it('the constitution walks TWENTY words over EIGHTEEN desks', () => {
    expect(constitution.includes('(twenty-four words, twenty-one desks)')).toBe(true);
    expect(constitution.includes("{ word: 'sec-type', desk: 'src/app/(shell)/tabs/security-tab.tsx', family: 'border-gray-200', suite: 'src/tests/sec-type-deep-link-v2367.test.ts' }")).toBe(true);
    expect(constitution.includes("'TWENTIETH'")).toBe(true);
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
      if (readFileSync(p, 'utf8').includes('sec-type')) collected.push(p);
    }
  }
}

describe('the address-bar vocabulary stays one-writer-per-word', () => {
  it('`sec-type` speaks in exactly the expected files under src/', () => {
    const collected: string[] = [];
    walkSrc('src', collected);
    collected.sort();
    expect(collected).toEqual([
      'src/app/(shell)/tabs/security-tab.tsx',
      'src/lib/tab-url.ts',
      'src/lib/whats-new.ts',
      // the nineteen neighbor ledgers admitted this test file — and an
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
