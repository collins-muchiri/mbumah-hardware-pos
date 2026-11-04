// THE LOYALTY DESK'S OWN WORD (v2.368.0): the ledger answers the address
// bar in its own name — the migration round.
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
// desk, v2.367.0 the security desk. THE PROMISE KEPT A TWENTY-FIRST TIME
// — and the oldest debt paid: the loyalty ledger's type lens has answered
// the BARE pre-constitution `type` since v2.316.0 (the org console's
// sweep-line door deep-links exactly it). THE LEGACY-WORD SUNSET LAW, its
// first written form (tab-url's alias parser): the desk-prefixed
// `?ly-type=all|EARN|REDEEM|BONUS|EXPIRE|ADJUST` is the canonical word,
// the bare `type` remains its LEGACY ALIAS — same five-type dictionary
// (the Select's own UPPERCASE keys), same case-sensitive membership law,
// and the CANONICAL WINS when both are present. The alias's one live
// speaker (the sweep-line door) moved to the canonical form this round;
// the alias keeps the bookmarks already in the wild.
// THE TWO-ADDRESS DESIGN (the innerTab landing law): the lens lives in a
// NON-DEFAULT sub-tab ('transactions' under a 'tiers' default), so a
// landing that carries the word lands the STAGE too — view's own word
// wins when it speaks a VALID sub-tab, an invalid view word does not
// claim the stage (only valid words speak), and a landed type word
// implies the transactions ledger. A bare `?ly-type=EXPIRE` lands whole.
// THE TWENTY-FIRST WEARING: the chip wears GREEN — the last wearable hue
// in the palette (the family has spoken all twenty of its hues; red is
// the danger voice), the EARN badge's own ink — the palette-exhaustion
// amendment's second application, where the last hue is a VOICE and not
// a surface; one byte of the chip's wardrobe is the desk's own
// (text-green-700, the EARN badge's ink) and the impersonation is
// bounded by the position, the word in the chip's text, and the
// chain-link icon.
//
// Pins: the alias parser's truth table (canonical, alias, precedence,
// case-sensitivity, the inversions, the ride-alongs), the stage parser's
// truth table (the two-address law), the desk's seed bytes and its
// cast-free typing, the typed chooser, the query-feed bytes, the chip's
// bytes and its two retirement voices, the position law, the wearing
// note, the door's canonical bytes, the one-home promise (the law's doc
// carries the twenty-first word), the collision ledger — and the
// constitution's twenty-first row from its own suite.

import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { parseInitialNamedMemberWithAlias, parseInitialStage } from '@/lib/tab-url';

const LY_TX_FILTERS = ['all', 'EARN', 'REDEEM', 'BONUS', 'EXPIRE', 'ADJUST'] as const;
const LY_SUB_TABS = ['tiers', 'members', 'transactions', 'campaigns'] as const;

// ---------------------------------------------------------------------------
// 1. THE ALIAS PARSER'S TRUTH TABLE (the legacy-word sunset law, one home)
// ---------------------------------------------------------------------------

describe('parseInitialNamedMemberWithAlias — the sunset law speaks the one home', () => {
  it('the canonical word seeds the filter', () => {
    expect(parseInitialNamedMemberWithAlias('?ly-type=EARN', 'ly-type', 'type', LY_TX_FILTERS, 'all')).toBe('EARN');
    expect(parseInitialNamedMemberWithAlias('?ly-type=REDEEM', 'ly-type', 'type', LY_TX_FILTERS, 'all')).toBe('REDEEM');
    expect(parseInitialNamedMemberWithAlias('?ly-type=BONUS', 'ly-type', 'type', LY_TX_FILTERS, 'all')).toBe('BONUS');
    expect(parseInitialNamedMemberWithAlias('?ly-type=EXPIRE', 'ly-type', 'type', LY_TX_FILTERS, 'all')).toBe('EXPIRE');
    expect(parseInitialNamedMemberWithAlias('?ly-type=ADJUST', 'ly-type', 'type', LY_TX_FILTERS, 'all')).toBe('ADJUST');
  });

  it('the LEGACY ALIAS keeps answering (the bookmarks already in the wild)', () => {
    expect(parseInitialNamedMemberWithAlias('?type=EXPIRE', 'ly-type', 'type', LY_TX_FILTERS, 'all')).toBe('EXPIRE');
    expect(parseInitialNamedMemberWithAlias('?type=EARN', 'ly-type', 'type', LY_TX_FILTERS, 'all')).toBe('EARN');
    expect(parseInitialNamedMemberWithAlias('?tab=loyalty&view=transactions&type=ADJUST', 'ly-type', 'type', LY_TX_FILTERS, 'all')).toBe('ADJUST');
  });

  it('THE CANONICAL WINS when both are present (one address bar, one truth)', () => {
    expect(parseInitialNamedMemberWithAlias('?ly-type=EARN&type=EXPIRE', 'ly-type', 'type', LY_TX_FILTERS, 'all')).toBe('EARN');
    expect(parseInitialNamedMemberWithAlias('?type=EXPIRE&ly-type=EARN', 'ly-type', 'type', LY_TX_FILTERS, 'all')).toBe('EARN');
  });

  it('case-sensitive: a lowercase word is an unknown word, not a clever match', () => {
    expect(parseInitialNamedMemberWithAlias('?ly-type=earn', 'ly-type', 'type', LY_TX_FILTERS, 'all')).toBe('all');
    expect(parseInitialNamedMemberWithAlias('?type=expire', 'ly-type', 'type', LY_TX_FILTERS, 'all')).toBe('all');
    expect(parseInitialNamedMemberWithAlias('?ly-type=Expire', 'ly-type', 'type', LY_TX_FILTERS, 'all')).toBe('all');
  });

  it('the NEUTRAL IS LOWERCASE here — UPPERCASE ALL names nothing (the inversion)', () => {
    expect(parseInitialNamedMemberWithAlias('?ly-type=ALL', 'ly-type', 'type', LY_TX_FILTERS, 'all')).toBe('all');
    expect(parseInitialNamedMemberWithAlias('?ly-type=all', 'ly-type', 'type', LY_TX_FILTERS, 'all')).toBe('all');
  });

  it('missing, bare, and malformed searches answer the fallback — never throw', () => {
    expect(parseInitialNamedMemberWithAlias('', 'ly-type', 'type', LY_TX_FILTERS, 'all')).toBe('all');
    expect(parseInitialNamedMemberWithAlias('?tab=loyalty', 'ly-type', 'type', LY_TX_FILTERS, 'all')).toBe('all');
    expect(parseInitialNamedMemberWithAlias('ly-type=BONUS', 'ly-type', 'type', LY_TX_FILTERS, 'all')).toBe('BONUS');
    expect(parseInitialNamedMemberWithAlias('?????', 'ly-type', 'type', LY_TX_FILTERS, 'all')).toBe('all');
    expect(parseInitialNamedMemberWithAlias('?ly-type=', 'ly-type', 'type', LY_TX_FILTERS, 'all')).toBe('all');
    expect(parseInitialNamedMemberWithAlias('?ly-type=FOO', 'ly-type', 'type', LY_TX_FILTERS, 'all')).toBe('all');
  });

  it('the word rides alongside the vocabulary\u2019s other words without collision', () => {
    expect(
      parseInitialNamedMemberWithAlias('?tab=loyalty&ly-type=EXPIRE&txn-type=refund', 'ly-type', 'type', LY_TX_FILTERS, 'all')
    ).toBe('EXPIRE');
    expect(
      parseInitialNamedMemberWithAlias('?tab=loyalty&ly-type=EARN&rent-status=OVERDUE&po-status=PENDING_APPROVAL', 'ly-type', 'type', LY_TX_FILTERS, 'all')
    ).toBe('EARN');
    expect(
      parseInitialNamedMemberWithAlias('?tab=loyalty&ly-type=BONUS&inv-stock=low&cust-debt=overdue&sup-status=ACTIVE', 'ly-type', 'type', LY_TX_FILTERS, 'all')
    ).toBe('BONUS');
    expect(
      parseInitialNamedMemberWithAlias('?tab=loyalty&ly-type=REDEEM&sup-po=SENT&txn-pay=CASH&cv-type=INTERNAL', 'ly-type', 'type', LY_TX_FILTERS, 'all')
    ).toBe('REDEEM');
    expect(
      parseInitialNamedMemberWithAlias('?tab=loyalty&ly-type=ADJUST&inv-status=PAID&gc-status=REDEEMED&dn-status=DELIVERED&vc-status=PAUSED&cr-type=DEBIT&transfer-status=IN_TRANSIT', 'ly-type', 'type', LY_TX_FILTERS, 'all')
    ).toBe('ADJUST');
    expect(
      parseInitialNamedMemberWithAlias('?tab=loyalty&ly-type=EXPIRE&pr-status=ACTIVE&cat-stock=low_stock&dp-status=overdue&ad-severity=CRITICAL&sec-type=BRUTE_FORCE', 'ly-type', 'type', LY_TX_FILTERS, 'all')
    ).toBe('EXPIRE');
  });
});

// ---------------------------------------------------------------------------
// 2. THE STAGE PARSER'S TRUTH TABLE (the two-address design, one home)
// ---------------------------------------------------------------------------

describe('parseInitialStage — one word, two addresses (the innerTab landing law)', () => {
  it('view\u2019s own word wins when it speaks a VALID sub-tab', () => {
    expect(parseInitialStage('?tab=loyalty&view=members&ly-type=EXPIRE', LY_SUB_TABS, 'transactions', true, 'tiers')).toBe('members');
    expect(parseInitialStage('?tab=loyalty&view=tiers&ly-type=EXPIRE', LY_SUB_TABS, 'transactions', true, 'tiers')).toBe('tiers');
    expect(parseInitialStage('?tab=loyalty&view=campaigns', LY_SUB_TABS, 'transactions', true, 'tiers')).toBe('campaigns');
  });

  it('an INVALID view word does not claim the stage (only valid words speak)', () => {
    expect(parseInitialStage('?tab=loyalty&view=bogus&ly-type=EXPIRE', LY_SUB_TABS, 'transactions', true, 'tiers')).toBe('transactions');
  });

  it('a LANDED word implies the stage it lives on (the transactions ledger)', () => {
    expect(parseInitialStage('?tab=loyalty&ly-type=EXPIRE', LY_SUB_TABS, 'transactions', true, 'tiers')).toBe('transactions');
    expect(parseInitialStage('?tab=loyalty&type=EXPIRE', LY_SUB_TABS, 'transactions', true, 'tiers')).toBe('transactions');
  });

  it('a NEUTRAL landing (or none) answers the desk\u2019s default', () => {
    expect(parseInitialStage('?tab=loyalty', LY_SUB_TABS, 'transactions', false, 'tiers')).toBe('tiers');
    expect(parseInitialStage('?tab=loyalty&ly-type=all', LY_SUB_TABS, 'transactions', false, 'tiers')).toBe('tiers');
    expect(parseInitialStage('', LY_SUB_TABS, 'transactions', false, 'tiers')).toBe('tiers');
  });
});

// ---------------------------------------------------------------------------
// 3. THE DESK'S SEED — read-on-mount, one home, never a copy, never a cast
// ---------------------------------------------------------------------------

describe('the loyalty desk — ?ly-type= lands as visible state (and its stage)', () => {
  const desk = readFileSync('src/app/(shell)/tabs/loyalty-tab.tsx', 'utf8');
  const home = readFileSync('src/lib/tab-url.ts', 'utf8');

  it('the seed reads the word through the ONE home (never a local parser)', () => {
    expect(
      desk.includes("parseInitialNamedMemberWithAlias(window.location.search, 'ly-type', 'type', LY_TX_FILTERS, 'all')")
    ).toBe(true);
    expect(home.includes('export function parseInitialNamedMemberWithAlias')).toBe(true);
    expect(home.includes('THE LEGACY-WORD SUNSET LAW')).toBe(true);
    expect(home.includes('v2.368.0 — THE PROMISE KEPT, THE TWENTY-FIRST WORD')).toBe(true);
  });

  it('the seed is the lazy initializer of the filter (read-on-mount law)', () => {
    expect(
      desk.includes('const [txTypeFilter, setTxTypeFilter] = useState<LyTypeFilter>(initialLyType);')
    ).toBe(true);
    expect(desk.includes("if (typeof window === 'undefined') return 'all';")).toBe(true);
    expect(
      desk.includes("export const LY_TX_FILTERS = ['all', 'EARN', 'REDEEM', 'BONUS', 'EXPIRE', 'ADJUST'] as const;")
    ).toBe(true);
  });

  it('the seed is CAST-FREE — the generic parser IS the union', () => {
    expect(desk.includes('function initialLyType(): LyTypeFilter {')).toBe(true);
    expect(desk.includes('type LyTypeFilter = (typeof LY_TX_FILTERS)[number];')).toBe(true);
    expect(desk.includes('useState<LyTypeFilter>(initialLyType)')).toBe(true);
    expect(desk.includes('initialLyType() as')).toBe(false);
    expect(desk.includes('initialLyType as unknown')).toBe(false);
  });

  it('THE TWO-ADDRESS DESIGN at the stage seed (the innerTab landing law)', () => {
    expect(home.includes('export function parseInitialStage')).toBe(true);
    expect(
      desk.includes("parseInitialStageWithAlias(window.location.search, 'ly-view', 'view', LOYALTY_SUB_TABS, 'transactions', landedLyType !== 'all', 'tiers')")
    ).toBe(true);
    expect(desk.includes('THE TWO-ADDRESS DESIGN')).toBe(true);
  });

  it('the word is desk-prefixed (the Task 44 collision law) and annotated', () => {
    expect(desk.includes("THE LOYALTY DESK'S OWN WORD")).toBe(true);
    expect(desk.includes('?ly-type=')).toBe(true);
    expect(desk.includes('THE LEGACY-WORD SUNSET LAW')).toBe(true);
  });

  it('the word filters the LEDGER, not just the Select\u2019s face (the query feed)', () => {
    expect(
      desk.includes("transactionType: txTypeFilter !== 'all' ? txTypeFilter : undefined,")
    ).toBe(true);
  });

  it('the typed chooser is the Select\u2019s ONE voice, and the old bare setter is GONE', () => {
    expect(desk.match(/onValueChange=\{chooseLyType\}/g)?.length).toBe(1);
    expect(desk.includes('onValueChange={setTxTypeFilter}')).toBe(false);
    expect(desk.includes('a hand-driven Select change retires the landing word')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 4. THE LANDING CHIP — the face names the word it answered, in green
// ---------------------------------------------------------------------------

describe('the landing chip — the face names the word it answered', () => {
  const desk = readFileSync('src/app/(shell)/tabs/loyalty-tab.tsx', 'utf8');

  it('the chip renders only while the landing is live AND untouched', () => {
    expect(
      desk.includes("lyLandingLive && landedLyType !== 'all' && txTypeFilter === landedLyType")
    ).toBe(true);
    expect(desk.includes('data-testid="ly-type-landing-word"')).toBe(true);
  });

  it('the chip names the exact word it answered — the CANONICAL spelling always', () => {
    expect(desk.includes('landed ?ly-type={landedLyType}')).toBe(true);
    expect(desk.includes('even when the landing rode the legacy alias')).toBe(true);
  });

  it('the chip sits BEFORE the type Select (the position law)', () => {
    const chipAt = desk.indexOf('data-testid="ly-type-landing-word"');
    const selectAt = desk.indexOf('<Select value={txTypeFilter} onValueChange={chooseLyType}>');
    expect(chipAt).toBeGreaterThan(-1);
    expect(selectAt).toBeGreaterThan(chipAt);
  });

  it('voice 1 — the dismissal clears the lens the word seeded and retires', () => {
    const at = desk.indexOf('data-testid="ly-type-landing-word"');
    const block = desk.slice(Math.max(0, at - 500), at + 300);
    expect(block).toContain("setTxTypeFilter('all')");
    expect(block).toContain('setLyLandingLive(false)');
  });

  it('voice 2 — the hand-driven chooser retires the chip', () => {
    expect(desk.includes('setLyLandingLive(false);')).toBe(true);
  });

  it('the chip wears the ledger\u2019s green family in BOTH modes (the twenty-first wearing)', () => {
    expect(desk.includes('border-green-200 bg-green-50 text-green-700')).toBe(true);
    expect(desk.includes('dark:border-green-500/30 dark:bg-green-500/10 dark:text-green-300')).toBe(true);
    expect(desk.includes('THE TWENTY-FIRST WEARING')).toBe(true);
    expect(desk.includes('the last wearable hue')).toBe(true);
  });

  it('the wearing is HONEST — the chip borrows the ink, never the badge forms', () => {
    // the EARN badge's ink is the desk's own green voice; the chip says so
    expect(desk.includes('text-green-700 is the')).toBe(true);
    // the chip's wardrobe: the hover and ring FORMS, never the badge's
    // own dark badge bytes — while the badge keeps its own config voice
    const at = desk.indexOf('data-testid="ly-type-landing-word"');
    const chip = desk.slice(Math.max(0, at - 700), at);
    expect(chip.includes('hover:bg-green-100')).toBe(true);
    expect(chip.includes('focus-visible:ring-green-400')).toBe(true);
    expect(chip.includes('dark:bg-green-900/30')).toBe(false);
    expect(chip.includes('dark:text-green-400')).toBe(false);
    expect(desk.includes('dark:bg-green-900/30')).toBe(true);
  });

  it('the dismiss hint sharpens on hover (the group-hover detail)', () => {
    expect(desk.includes('opacity-60 transition-opacity group-hover:opacity-100')).toBe(true);
  });

  it('the chip explains itself (the tooltip law)', () => {
    expect(desk.includes('title="The ledger landed with this type from the address bar — press to clear it"')).toBe(true);
    expect(desk.includes('aria-hidden="true"')).toBe(true);
  });

  it('the desk\u2019s own voices keep their families beside the chip (no masquerade)', () => {
    // amber is the sweep-line wardrobe's voice — the chip's green borrows
    // nothing from it
    expect(desk.includes('border-amber-600/40')).toBe(true);
    expect(desk.includes('border-green-200 bg-green-50')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 5. THE DOOR — the sweep line speaks the canonical word (and only it)
// ---------------------------------------------------------------------------

describe('the sweep-line door — migrated to the canonical word', () => {
  const card = readFileSync('src/components/workspace/org-console.tsx', 'utf8');

  it('the door\u2019s href is the desk-prefixed word, view implied by the stage law', () => {
    expect(card.includes("const EXPIRY_LEDGER_HREF = '/?tab=loyalty&ly-type=EXPIRE';")).toBe(true);
    expect(card.includes("const EXPIRY_LEDGER_HREF = '/?tab=loyalty&view=transactions&type=EXPIRE';")).toBe(false);
    expect(card.includes('THE DOOR MIGRATED TO THE CANONICAL WORD')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 6. THE CONSTITUTION — the twenty-first row is visible from here
// ---------------------------------------------------------------------------

describe('the address-bar vocabulary — the twenty-first row (cross-suite pins)', () => {
  const constitution = readFileSync('src/tests/transfer-status-deep-link-v2357.test.ts', 'utf8');

  it('the constitution walks TWENTY-ONE words over NINETEEN desks', () => {
    expect(constitution.includes('(twenty-seven words, twenty-three desks)')).toBe(true);
    expect(constitution.includes("{ word: 'ly-type', desk: 'src/app/(shell)/tabs/loyalty-tab.tsx', family: 'border-green-200', suite: 'src/tests/ly-type-deep-link-v2368.test.ts' }")).toBe(true);
    expect(constitution.includes("'TWENTY-FIRST'")).toBe(true);
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
      if (readFileSync(p, 'utf8').includes('ly-type')) collected.push(p);
    }
  }
}

describe('the address-bar vocabulary stays one-writer-per-word', () => {
  it('`ly-type` speaks in exactly the expected files under src/', () => {
    const collected: string[] = [];
    walkSrc('src', collected);
    collected.sort();
    expect(collected).toEqual([
      'src/app/(shell)/tabs/loyalty-tab.tsx',
      'src/components/workspace/org-console.tsx',
      'src/lib/tab-url.ts',
      'src/lib/whats-new.ts',
      // the twenty neighbor ledgers admitted this test file — and an
      // admission line carries the word it admits (the LEDGER-CITATION
      // RIPPLE: a ledger is an honest speaker of every word it lists)
      'src/tests/ad-severity-deep-link-v2366.test.ts',
      'src/tests/cat-stock-deep-link-v2364.test.ts',
      'src/tests/cr-type-deep-link-v2361.test.ts',
      'src/tests/cust-debt-deep-link-v2330.test.ts',
      'src/tests/cv-type-deep-link-v2363.test.ts',
      'src/tests/dn-status-deep-link-v2359.test.ts',
      'src/tests/dp-status-deep-link-v2365.test.ts',
      // the v2.316 suite walked its state pins to the alias parser this
      // round — the walk itself carries the word (an honest speaker)
      'src/tests/et-status-deep-link-v2381.test.ts',
      'src/tests/expiry-ledger-link-v2316.test.ts',
      'src/tests/family-registry-stress-v2370.test.ts',
      'src/tests/gc-status-deep-link-v2358.test.ts',
      'src/tests/inv-status-deep-link-v2356.test.ts',
      'src/tests/inv-stock-deep-link-v2329.test.ts',
      'src/tests/ly-island-v2369.test.ts',
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
    // the bare-word parser remains — the v2316 suite's truth table still
    // speaks through it (the alias's inherited law, kept for the record)
    expect(home.includes('export function parseInitialType')).toBe(true);
  });
});
