// THE ETIMS DESK'S OWN WORD (v2.381.0): the taxman's desk answers the
// address bar — the danger-voice round.
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
// desk, v2.367.0 the security desk, v2.368.0 the loyalty ledger. THE
// PROMISE KEPT A TWENTY-SECOND TIME — the e-TIMS invoices ledger's
// submission-status lens speaks its desk-prefixed
// `?et-status=all|PENDING|SUBMITTED|ACCEPTED|REJECTED|FAILED` — the
// taxman's daily question, "which invoices have we sent to KRA, and
// which came back?", is now an address — and wears the landing chip in
// the lens's own red (THE TWENTY-SECOND WEARING: the danger voice
// finally speaks, on the one desk whose daily question is danger itself
// — a rejected or failed KRA submission is the taxman's red letter. The
// desk's alarm vocabulary speaks rose and amber, so the red chip
// borrows nothing from any badge; the palette-exhaustion amendment's
// third application: the reserved hue speaks where the danger IS the
// lens). The vocabulary is the wire's OWN five statuses, UPPERCASE — a
// lowercase word is an unknown word here, not a clever match.
// THE TWO-ADDRESS DESIGN's second application: the lens lives in a
// NON-DEFAULT sub-tab (invoices under a profile default), so a landing
// that carries the word lands the invoices stage too — view's own word
// wins when it speaks a VALID sub-tab, an invalid word does not claim
// the stage (only valid words speak), and a landed status word implies
// the stage it lives on. THE LANDING IS READ ONCE AND LENT DOWN: the
// section under the invoices TabsContent REMOUNTS on every sub-tab
// toggle, and a seed that re-parsed there would resurrect a dismissed
// chip — the landing state lives on the desk's shell (which never
// unmounts) and flows to the section as props.
// THE LENS-AWARE EMPTY VOICE (the styling detail): a lensed desk used to
// answer its empty window with the GENERIC empty state — a false
// "nothing exists" reading when the truth is "nothing wears THIS
// status". The lensed answer now names the lens's own word and offers
// the clearing hand.
//
// Pins: the parser's truth table (pure, the UPPERCASE vocabulary, the
// neutral's self-seed AND its lowercase inversions, the ride-alongs over
// the whole twenty-one-word family), the stage parser's truth table (the
// two-address law), the desk's seed bytes and its cast-free typing, the
// read-once-and-lent-down law (the parent-owned landing, the prop-seeded
// filter), the query-feed bytes, the typed chooser, the chip's bytes and
// its two retirement voices, the position law, the wearing note and its
// honesty bounds, the lens-aware empty voice, the one-home promise (the
// law's doc carries the twenty-second word), the collision ledger — and
// the constitution's twenty-second row from its own suite.

import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';

const LOOM = readFileSync('src/components/landing-chip.tsx', 'utf8');
import { join } from 'node:path';
import { parseInitialNamedMember, parseInitialStage } from '@/lib/tab-url';

const ET_STATUS_FILTERS = ['all', 'PENDING', 'SUBMITTED', 'ACCEPTED', 'REJECTED', 'FAILED'] as const;
const ET_SUB_TABS = ['profile', 'invoices', 'audit'] as const;

// ---------------------------------------------------------------------------
// 1. THE PARSER'S TRUTH TABLE (the membership law, one home, the UPPERCASE
//    voice, the LOWERCASE-neutral inversion)
// ---------------------------------------------------------------------------

describe('parseInitialNamedMember — the taxman\u2019s lens speaks the one home', () => {
  it('a lens the desk offers seeds the filter', () => {
    expect(parseInitialNamedMember('?et-status=PENDING', 'et-status', ET_STATUS_FILTERS, 'all')).toBe('PENDING');
    expect(parseInitialNamedMember('?et-status=SUBMITTED', 'et-status', ET_STATUS_FILTERS, 'all')).toBe('SUBMITTED');
    expect(parseInitialNamedMember('?et-status=ACCEPTED', 'et-status', ET_STATUS_FILTERS, 'all')).toBe('ACCEPTED');
    expect(parseInitialNamedMember('?et-status=REJECTED', 'et-status', ET_STATUS_FILTERS, 'all')).toBe('REJECTED');
    expect(parseInitialNamedMember('?et-status=FAILED', 'et-status', ET_STATUS_FILTERS, 'all')).toBe('FAILED');
  });

  it('case-sensitive: a lowercase word is an unknown word, not a clever match', () => {
    expect(parseInitialNamedMember('?et-status=pending', 'et-status', ET_STATUS_FILTERS, 'all')).toBe('all');
    expect(parseInitialNamedMember('?et-status=Pending', 'et-status', ET_STATUS_FILTERS, 'all')).toBe('all');
    expect(parseInitialNamedMember('?et-status=accepted', 'et-status', ET_STATUS_FILTERS, 'all')).toBe('all');
  });

  it('the NEUTRAL IS LOWERCASE here — an UPPERCASE ALL names nothing (the inversion)', () => {
    expect(parseInitialNamedMember('?et-status=all', 'et-status', ET_STATUS_FILTERS, 'all')).toBe('all');
    expect(parseInitialNamedMember('?et-status=ALL', 'et-status', ET_STATUS_FILTERS, 'all')).toBe('all');
  });

  it('missing, bare, and malformed searches answer the fallback — never throw', () => {
    expect(parseInitialNamedMember('', 'et-status', ET_STATUS_FILTERS, 'all')).toBe('all');
    expect(parseInitialNamedMember('?tab=etims', 'et-status', ET_STATUS_FILTERS, 'all')).toBe('all');
    expect(parseInitialNamedMember('et-status=PENDING', 'et-status', ET_STATUS_FILTERS, 'all')).toBe('PENDING');
    expect(parseInitialNamedMember('?????', 'et-status', ET_STATUS_FILTERS, 'all')).toBe('all');
    expect(parseInitialNamedMember('?et-status=', 'et-status', ET_STATUS_FILTERS, 'all')).toBe('all');
    expect(parseInitialNamedMember('?et-status=FOO', 'et-status', ET_STATUS_FILTERS, 'all')).toBe('all');
  });

  it('the word rides alongside the vocabulary\u2019s other words without collision', () => {
    expect(
      parseInitialNamedMember('?tab=etims&et-status=PENDING&ly-type=EXPIRE&txn-type=refund', 'et-status', ET_STATUS_FILTERS, 'all')
    ).toBe('PENDING');
    expect(
      parseInitialNamedMember('?tab=etims&et-status=ACCEPTED&rent-status=OVERDUE&po-status=PENDING_APPROVAL&inv-stock=low', 'et-status', ET_STATUS_FILTERS, 'all')
    ).toBe('ACCEPTED');
    expect(
      parseInitialNamedMember('?tab=etims&et-status=REJECTED&cust-debt=overdue&sup-status=ACTIVE&sup-po=SENT&txn-pay=CASH', 'et-status', ET_STATUS_FILTERS, 'all')
    ).toBe('REJECTED');
    expect(
      parseInitialNamedMember('?tab=etims&et-status=SUBMITTED&inv-status=PAID&transfer-status=IN_TRANSIT&gc-status=REDEEMED&dn-status=DELIVERED&vc-status=PAUSED', 'et-status', ET_STATUS_FILTERS, 'all')
    ).toBe('SUBMITTED');
    expect(
      parseInitialNamedMember('?tab=etims&et-status=FAILED&cr-type=DEBIT&pr-status=ACTIVE&cat-stock=low_stock&dp-status=overdue', 'et-status', ET_STATUS_FILTERS, 'all')
    ).toBe('FAILED');
    expect(
      parseInitialNamedMember('?tab=etims&et-status=PENDING&ad-severity=CRITICAL&sec-type=BRUTE_FORCE&cv-type=INTERNAL', 'et-status', ET_STATUS_FILTERS, 'all')
    ).toBe('PENDING');
  });
});

// ---------------------------------------------------------------------------
// 2. THE STAGE PARSER'S TRUTH TABLE (the two-address design, one home)
// ---------------------------------------------------------------------------

describe('parseInitialStage — one word, two addresses (the innerTab landing law)', () => {
  it('view\u2019s own word wins when it speaks a VALID sub-tab', () => {
    expect(parseInitialStage('?tab=etims&view=audit&et-status=PENDING', ET_SUB_TABS, 'invoices', true, 'profile')).toBe('audit');
    expect(parseInitialStage('?tab=etims&view=profile&et-status=PENDING', ET_SUB_TABS, 'invoices', true, 'profile')).toBe('profile');
    expect(parseInitialStage('?tab=etims&view=invoices', ET_SUB_TABS, 'invoices', false, 'profile')).toBe('invoices');
  });

  it('an INVALID view word does not claim the stage (only valid words speak)', () => {
    expect(parseInitialStage('?tab=etims&view=bogus&et-status=PENDING', ET_SUB_TABS, 'invoices', true, 'profile')).toBe('invoices');
  });

  it('a LANDED word implies the stage it lives on (the invoices ledger)', () => {
    expect(parseInitialStage('?tab=etims&et-status=PENDING', ET_SUB_TABS, 'invoices', true, 'profile')).toBe('invoices');
    expect(parseInitialStage('?tab=etims&et-status=REJECTED', ET_SUB_TABS, 'invoices', true, 'profile')).toBe('invoices');
  });

  it('a NEUTRAL landing (or none) answers the desk\u2019s default', () => {
    expect(parseInitialStage('?tab=etims', ET_SUB_TABS, 'invoices', false, 'profile')).toBe('profile');
    expect(parseInitialStage('?tab=etims&et-status=all', ET_SUB_TABS, 'invoices', false, 'profile')).toBe('profile');
    expect(parseInitialStage('', ET_SUB_TABS, 'invoices', false, 'profile')).toBe('profile');
  });
});

// ---------------------------------------------------------------------------
// 3. THE DESK'S SEED — read ONCE on the shell, lent down, never a copy,
//    never a cast, never a resurrection
// ---------------------------------------------------------------------------

describe('the etims desk — ?et-status= lands as visible state (and its stage)', () => {
  const desk = readFileSync('src/app/(shell)/tabs/etims-tab.tsx', 'utf8');
  const home = readFileSync('src/lib/tab-url.ts', 'utf8');

  it('the seed reads the word through the ONE home (never a local parser)', () => {
    expect(
      desk.includes("parseInitialNamedMember(window.location.search, 'et-status', ET_STATUS_FILTERS, 'all')")
    ).toBe(true);
    expect(home.includes('export function parseInitialNamedMember')).toBe(true);
    expect(home.includes('v2.381.0 — THE PROMISE KEPT, THE TWENTY-SECOND WORD')).toBe(true);
  });

  it('the seed is the lazy initializer of the landing (the read-once law)', () => {
    expect(
      desk.includes('const [landedEtStatus] = useState<EtStatusFilter>(initialEtStatus);')
    ).toBe(true);
    expect(desk.includes("if (typeof window === 'undefined') return 'all';")).toBe(true);
    expect(
      desk.includes("export const ET_STATUS_FILTERS = ['all', 'PENDING', 'SUBMITTED', 'ACCEPTED', 'REJECTED', 'FAILED'] as const;")
    ).toBe(true);
  });

  it('the seed is CAST-FREE — the generic parser IS the union', () => {
    expect(desk.includes('function initialEtStatus(): EtStatusFilter {')).toBe(true);
    expect(desk.includes('type EtStatusFilter = (typeof ET_STATUS_FILTERS)[number];')).toBe(true);
    expect(desk.includes('useState<EtStatusFilter>(initialEtStatus)')).toBe(true);
    expect(desk.includes('initialEtStatus() as')).toBe(false);
    expect(desk.includes('initialEtStatus as unknown')).toBe(false);
  });

  it('THE LANDING IS READ ONCE AND LENT DOWN (the remount law)', () => {
    // the landing state lives on the desk's shell — which never unmounts
    expect(desk.includes('const [etLandingLive, setEtLandingLive] = useState(true);')).toBe(true);
    // the word flows to the section as props (the lensed section remounts
    // on every sub-tab toggle — a re-parse there would resurrect a
    // dismissed chip)
    expect(desk.includes('landedStatus={landedEtStatus}')).toBe(true);
    expect(desk.includes('landingLive={etLandingLive}')).toBe(true);
    expect(desk.includes('onLandRetire={() => setEtLandingLive(false)}')).toBe(true);
    // the section's filter is seeded from the PROP, not a re-parse
    expect(desk.includes('const [statusFilter, setStatusFilter] = useState<EtStatusFilter>(landedStatus);')).toBe(true);
    expect(desk.includes('THE LANDING IS READ ONCE AND LENT DOWN')).toBe(true);
  });

  it('THE TWO-ADDRESS DESIGN at the stage seed (the innerTab landing law)', () => {
    expect(home.includes('export function parseInitialStage')).toBe(true);
    expect(
      desk.includes("parseInitialStage(window.location.search, ET_SUB_TABS, 'invoices', landed, 'profile')")
    ).toBe(true);
    expect(desk.includes('THE TWO-ADDRESS DESIGN')).toBe(true);
  });

  it('the word is desk-prefixed (the Task 44 collision law) and annotated', () => {
    expect(desk.includes("THE ETIMS DESK'S OWN WORD")).toBe(true);
    expect(desk.includes('?et-status=')).toBe(true);
  });

  it('the word filters the LEDGER, not just the Select\u2019s face (the query feed)', () => {
    expect(
      desk.includes("status: statusFilter !== 'all' ? statusFilter : undefined,")
    ).toBe(true);
  });

  it('the typed chooser is the Select\u2019s ONE voice, and the old inline setter is GONE', () => {
    expect(desk.match(/onValueChange=\{chooseEtStatus\}/g)?.length).toBe(1);
    expect(desk.includes('onValueChange={(v) => { setStatusFilter(v); setPage(1); }}')).toBe(false);
    expect(desk.includes('a hand-driven Select change retires the landing word')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 4. THE LANDING CHIP — the face names the word it answered, in red
// ---------------------------------------------------------------------------

describe('the landing chip — the face names the word it answered', () => {
  const desk = readFileSync('src/app/(shell)/tabs/etims-tab.tsx', 'utf8');

  it('the chip renders only while the landing is live AND untouched', () => {
    expect(
      desk.includes("landingLive && landedStatus !== 'all' && statusFilter === landedStatus")
    ).toBe(true);
    expect(desk.includes('data-testid="et-status-landing-word"')).toBe(true);
  });

  it('the chip names the exact word it answered — the CANONICAL spelling always', () => {
    expect(desk.includes('landed ?et-status=${landedStatus}')).toBe(true);
  });

  it('the chip sits BEFORE the status Select (the position law)', () => {
    const chipAt = desk.indexOf('data-testid="et-status-landing-word"');
    const selectAt = desk.indexOf('<Select value={statusFilter} onValueChange={chooseEtStatus}>');
    expect(chipAt).toBeGreaterThan(-1);
    expect(selectAt).toBeGreaterThan(chipAt);
  });

  it('voice 1 — the dismissal clears the lens the word seeded and retires', () => {
    const at = desk.indexOf('data-testid="et-status-landing-word"');
    // v2.397.0 THE LOOM: onDismiss is the loomed chip’s LAST prop — the
    // window re-anchors forward (the pre-loom form looked BACK)
    const block = desk.slice(at, at + 1200);
    expect(block).toContain("setStatusFilter('all')");
    expect(block).toContain('onLandRetire()');
  });

  it('voice 2 — the hand-driven chooser retires the chip', () => {
    const at = desk.indexOf('const chooseEtStatus');
    const block = desk.slice(at, at + 220);
    expect(block).toContain('onLandRetire();');
  });

  it('the chip wears the taxman\u2019s red family in BOTH modes (the twenty-second wearing)', () => {
    // v2.397.0 THE LOOM: the elder wardrobe moved into the loom's 200
    // registry — the desk proves its family by hue, the registry carries
    // the bytes.
    expect(desk.includes('hue="red"')).toBe(true);
    expect(LOOM.includes('border-red-200 bg-red-50 text-red-700')).toBe(true);
    expect(LOOM.includes('dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300')).toBe(true);
    expect(desk.includes('THE TWENTY-SECOND WEARING')).toBe(true);
    expect(desk.includes('the danger voice')).toBe(true);
  });

  it('the wearing is HONEST — the danger voice is the CHIP\u2019s alone', () => {
    // the desk's own alarms speak rose (REJECTED) and amber (FAILED) —
    // the red chip borrows nothing from any badge
    expect(desk.includes('bg-rose-100 text-rose-700')).toBe(true);
    expect(desk.includes('bg-amber-100 text-amber-700')).toBe(true);
    // no red BADGE forms exist anywhere on the desk — the chip is the
    // only red speaker, so the danger voice can never masquerade
    expect(desk.includes('dark:bg-red-900/30')).toBe(false);
    expect(desk.includes('bg-red-100 text-red-700')).toBe(false);
  });

  it('the dismiss hint sharpens on hover (the group-hover detail)', () => {
    expect(LOOM.includes('opacity-60 transition-opacity group-hover:opacity-100')).toBe(true);
  });

  it('the chip explains itself (the tooltip law)', () => {
    expect(desk.includes('title="The invoice desk landed with this status from the address bar — press to clear it"')).toBe(true);
    expect(LOOM.includes('aria-hidden="true"')).toBe(true); // v2.397.0 THE LOOM: the icons live in the one hand
  });
});

// ---------------------------------------------------------------------------
// 5. THE LENS-AWARE EMPTY VOICE — the lensed empty answer names its lens
// ---------------------------------------------------------------------------

describe('the lens-aware empty voice — the styling detail', () => {
  const desk = readFileSync('src/app/(shell)/tabs/etims-tab.tsx', 'utf8');

  it('the lensed empty answer exists and names the lens', () => {
    expect(desk.includes('data-testid="et-status-empty-lens"')).toBe(true);
    expect(
      desk.includes('No <span className="font-medium text-foreground">{statusFilter}</span> invoices in this lens yet.')
    ).toBe(true);
  });

  it('the lensed answer comes BEFORE the generic empty (the branch law)', () => {
    const lensAt = desk.indexOf('data-testid="et-status-empty-lens"');
    const genericAt = desk.indexOf('No KRA invoices found.');
    expect(lensAt).toBeGreaterThan(-1);
    expect(genericAt).toBeGreaterThan(lensAt);
  });

  it('the lensed answer offers the clearing hand', () => {
    const at = desk.indexOf('data-testid="et-status-empty-lens"');
    const block = desk.slice(at, at + 900);
    expect(block).toContain("chooseEtStatus('all')");
    expect(block).toContain('Clear the status lens');
  });

  it('the generic empty state keeps its own voice (the unscoped world)', () => {
    expect(desk.includes('Submit a sales transaction to KRA to create your first invoice record.')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 6. THE CONSTITUTION — the twenty-second row is visible from here
// ---------------------------------------------------------------------------

describe('the address-bar vocabulary — the twenty-second row (cross-suite pins)', () => {
  const constitution = readFileSync('src/tests/transfer-status-deep-link-v2357.test.ts', 'utf8');

  it('the constitution walks TWENTY-TWO words over TWENTY desks', () => {
    expect(constitution.includes('(forty-seven words, thirty-two desks)')).toBe(true);
    expect(constitution.includes("{ word: 'et-status', desk: 'src/app/(shell)/tabs/etims-tab.tsx', family: 'border-red-200', suite: 'src/tests/et-status-deep-link-v2381.test.ts' }")).toBe(true);
    expect(constitution.includes("'TWENTY-SECOND'")).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 7. THE COLLISION LEDGER — which files may speak the word at all
// ---------------------------------------------------------------------------

function walkSrc(dir: string, collected: string[]): void {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    const st = statSync(p);
    if (st.isDirectory()) {
      if (entry === 'node_modules' || entry === '.next') continue;
      walkSrc(p, collected);
    } else if (/\.(ts|tsx|mjs|js)$/.test(entry)) {
      if (readFileSync(p, 'utf8').includes('et-status')) collected.push(p);
    }
  }
}

describe('the address-bar vocabulary stays one-writer-per-word', () => {
  it('`et-status` speaks in exactly the expected files under src/', () => {
    const collected: string[] = [];
    walkSrc('src', collected);
    collected.sort();
    expect(collected).toEqual([
      'src/app/(shell)/tabs/etims-tab.tsx',
      // a SUBSTRING COINCIDENCE, not a speaker: the stock-take panel's
      // `stocktake-sheet-status` testid carries the byte "t-status" —
      // the raw walkSrc census is a substring scan, so the near-miss is
      // LISTED here (an honest census lists what the scan finds) and
      // bounded by this note (it speaks no word of the family)
      'src/components/inventory/stock-take-panel.tsx',
      'src/lib/tab-url.ts',
      'src/lib/whats-new.ts',
      // the twenty-one neighbor ledgers admitted this test file — and an
      // admission line carries the word it admits (the LEDGER-CITATION
      // RIPPLE: a ledger is an honest speaker of every word it lists)
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
      // the twenty-ninth word's own ledger — admitted (its rides-beside truth speaks this word)
      'src/tests/debt-channel-deep-link-v2390.test.ts',
      // the twenty-eighth word's own ledger — admitted (its rides-beside truth speaks this word)
      'src/tests/debt-status-deep-link-v2389.test.ts',
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
    expect(home.includes('export function parseInitialType')).toBe(true);
    expect(home.includes('export function parseInitialStage')).toBe(true);
    expect(home.includes('export function parseInitialStageWithAlias')).toBe(true);
    expect(home.includes('export function parseInitialNamedMemberWithAlias')).toBe(true);
  });
});
