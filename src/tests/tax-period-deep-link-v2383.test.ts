// THE TAX DESK'S SECOND WORD (v2.383.0): the filings ledger answers BY
// THE MONTH — the shade-split's second application.
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
// desk, v2.367.0 the security desk, v2.368.0 the loyalty ledger,
// v2.381.0 the e-TIMS invoices ledger, v2.382.0 the tax desk's type
// lens. THE PROMISE KEPT A TWENTY-FOURTH TIME — and this word is a
// SHAPE word: the taxman's other daily question, "which month's returns
// am I looking at?", answers `?tax-period=YYYY-MM` — the wire's own
// class (the filings route execs this exact shape on create), month
// 01-12 REAL, the neutral is ABSENCE (the empty string), never a
// stranded filter. The chip wears TEAL one storey deeper at 300/100
// (the shade-split's SECOND application: a hue may speak twice only
// through a DIFFERENT storey — the invoices desk's word wears teal at
// 200/50 on its own desk — and the pair bytes can never collide). The
// round also retires the workflow legend's GHOST FACES: the live QA
// burst caught the legend still speaking Approved/Paid/Late after the
// v2.382 repair re-voiced the badge map and the Select — the legend now
// walks the schema's own five.

import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

import {
  parseInitialNamedPeriod,
  parseInitialStage,
  TAX_PERIOD_SHAPE,
} from '@/lib/tab-url';

const TAX_SUB_TABS = ['categories', 'filings', 'etims'] as const;

// ---------------------------------------------------------------------------
// 1. THE PARSER'S TRUTH TABLE (the shape law, one home)
// ---------------------------------------------------------------------------

describe('parseInitialNamedPeriod — the shape law, one home', () => {
  it('the wire\u2019s own YYYY-MM class answers itself (month 01-12 REAL)', () => {
    expect(parseInitialNamedPeriod('?tab=tax&tax-period=2026-10', 'tax-period', '')).toBe('2026-10');
    expect(parseInitialNamedPeriod('?tab=tax&tax-period=2025-01', 'tax-period', '')).toBe('2025-01');
    expect(parseInitialNamedPeriod('?tab=tax&tax-period=2024-12', 'tax-period', '')).toBe('2024-12');
  });

  it('an impossible month is an unknown word — never a clever match', () => {
    expect(parseInitialNamedPeriod('?tab=tax&tax-period=2026-13', 'tax-period', '')).toBe('');
    expect(parseInitialNamedPeriod('?tab=tax&tax-period=2026-00', 'tax-period', '')).toBe('');
    expect(parseInitialNamedPeriod('?tab=tax&tax-period=2026-21', 'tax-period', '')).toBe('');
  });

  it('malformed shapes are unknown words (the wire never sees a half-word)', () => {
    expect(parseInitialNamedPeriod('?tab=tax&tax-period=2026-1', 'tax-period', '')).toBe('');
    expect(parseInitialNamedPeriod('?tab=tax&tax-period=26-10', 'tax-period', '')).toBe('');
    expect(parseInitialNamedPeriod('?tab=tax&tax-period=2026/10', 'tax-period', '')).toBe('');
    expect(parseInitialNamedPeriod('?tab=tax&tax-period=2026-Oct', 'tax-period', '')).toBe('');
    expect(parseInitialNamedPeriod('?tab=tax&tax-period=2026-101', 'tax-period', '')).toBe('');
  });

  it('the NEUTRAL IS ABSENCE here — the vocabulary words\u2019 `all` does not ride (the inversion)', () => {
    expect(parseInitialNamedPeriod('?tab=tax&tax-period=all', 'tax-period', '')).toBe('');
    expect(parseInitialNamedPeriod('?tab=tax&tax-period=ALL', 'tax-period', '')).toBe('');
    expect(parseInitialNamedPeriod('?tab=tax&tax-period=', 'tax-period', '')).toBe('');
  });

  it('missing, bare, and malformed searches answer the fallback — never throw', () => {
    expect(parseInitialNamedPeriod('', 'tax-period', '')).toBe('');
    expect(parseInitialNamedPeriod('?tab=tax', 'tax-period', '')).toBe('');
    expect(parseInitialNamedPeriod('tax-period=2026-10', 'tax-period', '')).toBe('2026-10');
    expect(parseInitialNamedPeriod('?????', 'tax-period', '')).toBe('');
  });

  it('the exported shape is the ONE home (the route\u2019s own class, shared)', () => {
    expect(TAX_PERIOD_SHAPE.test('2026-10')).toBe(true);
    expect(TAX_PERIOD_SHAPE.test('2026-13')).toBe(false);
    expect(TAX_PERIOD_SHAPE.test('2026-1')).toBe(false);
  });

  it('the word rides alongside the vocabulary\u2019s other words without collision', () => {
    expect(
      parseInitialNamedPeriod('?tab=tax&tax-period=2026-10&ly-type=EXPIRE&txn-type=refund', 'tax-period', '')
    ).toBe('2026-10');
    expect(
      parseInitialNamedPeriod('?tab=tax&tax-period=2026-09&rent-status=OVERDUE&po-status=PENDING_APPROVAL&inv-stock=low', 'tax-period', '')
    ).toBe('2026-09');
    expect(
      parseInitialNamedPeriod('?tab=tax&tax-period=2026-10&tax-type=VAT&cust-debt=overdue&sup-status=ACTIVE', 'tax-period', '')
    ).toBe('2026-10');
    expect(
      parseInitialNamedPeriod('?tab=tax&tax-period=2026-11&sup-po=SENT&txn-pay=CASH&inv-status=PAID&transfer-status=IN_TRANSIT', 'tax-period', '')
    ).toBe('2026-11');
    expect(
      parseInitialNamedPeriod('?tab=tax&tax-period=2026-10&gc-status=REDEEMED&dn-status=DELIVERED&vc-status=PAUSED&cr-type=DEBIT', 'tax-period', '')
    ).toBe('2026-10');
    expect(
      parseInitialNamedPeriod('?tab=tax&tax-period=2025-01&pr-status=ACTIVE&cat-stock=low_stock&dp-status=overdue', 'tax-period', '')
    ).toBe('2025-01');
    expect(
      parseInitialNamedPeriod('?tab=tax&tax-period=2026-10&ad-severity=CRITICAL&sec-type=BRUTE_FORCE&cv-type=INTERNAL', 'tax-period', '')
    ).toBe('2026-10');
    expect(
      parseInitialNamedPeriod('?tab=tax&tax-period=2026-10&et-status=PENDING', 'tax-period', '')
    ).toBe('2026-10');
  });
});

// ---------------------------------------------------------------------------
// 2. THE STAGE PARSER'S TRUTH TABLE (the two-address design, one home)
// ---------------------------------------------------------------------------

describe('parseInitialStage — the second word rides the same two-address law', () => {
  it('view\u2019s own word wins when it speaks a VALID sub-tab', () => {
    expect(parseInitialStage('?tab=tax&view=etims&tax-period=2026-10', TAX_SUB_TABS, 'filings', true, 'categories')).toBe('etims');
    expect(parseInitialStage('?tab=tax&view=categories&tax-period=2026-10', TAX_SUB_TABS, 'filings', true, 'categories')).toBe('categories');
    expect(parseInitialStage('?tab=tax&view=filings', TAX_SUB_TABS, 'filings', false, 'categories')).toBe('filings');
  });

  it('an INVALID view word does not claim the stage (only valid words speak)', () => {
    expect(parseInitialStage('?tab=tax&view=bogus&tax-period=2026-10', TAX_SUB_TABS, 'filings', true, 'categories')).toBe('filings');
  });

  it('a LANDED period word implies the stage it lives on (the filings ledger)', () => {
    expect(parseInitialStage('?tab=tax&tax-period=2026-10', TAX_SUB_TABS, 'filings', true, 'categories')).toBe('filings');
    expect(parseInitialStage('?tab=tax&tax-period=2025-01', TAX_SUB_TABS, 'filings', true, 'categories')).toBe('filings');
  });

  it('a NEUTRAL landing (or none) answers the desk\u2019s default', () => {
    expect(parseInitialStage('?tab=tax', TAX_SUB_TABS, 'filings', false, 'categories')).toBe('categories');
    expect(parseInitialStage('?tab=tax&tax-period=all', TAX_SUB_TABS, 'filings', false, 'categories')).toBe('categories');
    expect(parseInitialStage('', TAX_SUB_TABS, 'filings', false, 'categories')).toBe('categories');
  });
});

// ---------------------------------------------------------------------------
// 3. THE DESK'S SEED — the SECOND shell-seed speaker, cast-free
// ---------------------------------------------------------------------------

describe('the tax desk — ?tax-period= lands as visible state (and its stage)', () => {
  const desk = readFileSync('src/app/(shell)/tabs/tax-tab.tsx', 'utf8');
  const home = readFileSync('src/lib/tab-url.ts', 'utf8');

  it('the seed reads the word through the ONE home (never a local parser)', () => {
    expect(
      desk.includes("parseInitialNamedPeriod(window.location.search, 'tax-period', '')")
    ).toBe(true);
    expect(home.includes('export function parseInitialNamedPeriod')).toBe(true);
    expect(home.includes('v2.383.0 — THE PROMISE KEPT, THE TWENTY-FOURTH WORD')).toBe(true);
    expect(home.includes('export const TAX_PERIOD_SHAPE')).toBe(true);
  });

  it('the seed is the lazy initializer of the landing (the read-once law, second speaker)', () => {
    expect(
      desk.includes('const [landedTaxPeriod] = useState<string>(initialTaxPeriod);')
    ).toBe(true);
    expect(desk.includes("if (typeof window === 'undefined') return '';")).toBe(true);
    expect(desk.includes('THE SECOND SHELL-SEED SPEAKER')).toBe(true);
  });

  it('the seed is CAST-FREE — the shape parser answers the string union it is', () => {
    expect(desk.includes('function initialTaxPeriod(): string {')).toBe(true);
    expect(desk.includes('initialTaxPeriod() as')).toBe(false);
    expect(desk.includes('initialTaxPeriod as unknown')).toBe(false);
  });

  it('the landing flag is the period\u2019s OWN — the chips are independent (two words, one shell)', () => {
    expect(desk.includes('const [taxPeriodLandingLive, setTaxPeriodLandingLive] = useState(true);')).toBe(true);
    expect(desk.includes('const [filingPeriodFilter, setFilingPeriodFilter] = useState(landedTaxPeriod);')).toBe(true);
  });

  it('THE TWO-ADDRESS DESIGN extends to the second word (the stage implication)', () => {
    expect(desk.includes("initialTaxStage(landedTaxType !== 'all' || landedTaxPeriod !== '')")).toBe(true);
  });

  it('the word is desk-prefixed (the Task 44 collision law) and annotated', () => {
    expect(desk.includes("THE TAX DESK'S SECOND WORD")).toBe(true);
    expect(desk.includes('?tax-period=YYYY-MM')).toBe(true);
  });

  it('the word filters the LEDGER, not just the picker\u2019s face (the shape-honest feed)', () => {
    expect(desk.includes('const periodLensActive = TAX_PERIOD_SHAPE.test(filingPeriodFilter);')).toBe(true);
    expect(desk.includes('filingPeriod: periodLensActive ? filingPeriodFilter : undefined,')).toBe(true);
    expect(desk.includes("queryKey: ['tax-filings', currentStoreId, filingStatusFilter, filingTypeFilter, filingPeriodFilter]")).toBe(true);
  });

  it('the typed chooser is the picker\u2019s ONE voice, and the old inline setter is GONE', () => {
    expect(desk.match(/onChange=\{\(e\) => chooseFilingPeriod\(e\.target\.value\)\}/g)?.length).toBe(1);
    expect(desk.includes('onChange={(e) => setFilingPeriodFilter(')).toBe(false);
    expect(desk.includes("the period lens's own voice")).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 4. THE LANDING CHIP — the face names the word it answered, in teal
//    one storey deeper
// ---------------------------------------------------------------------------

describe('the landing chip — the face names the word it answered', () => {
  const desk = readFileSync('src/app/(shell)/tabs/tax-tab.tsx', 'utf8');
  const loom = readFileSync('src/components/landing-chip.tsx', 'utf8');

  it('the chip renders only while the landing is live AND untouched', () => {
    expect(
      desk.includes("taxPeriodLandingLive && landedTaxPeriod !== '' && filingPeriodFilter === landedTaxPeriod")
    ).toBe(true);
    expect(desk.includes('data-testid="tax-period-landing-word"')).toBe(true);
  });

  it('the chip names the exact word it answered — the CANONICAL spelling always', () => {
    // v2.394.0 THE LOOM: the label rides a template-literal prop now
    expect(desk.includes('landed ?tax-period=${landedTaxPeriod}')).toBe(true);
  });

  it('the chip sits BEFORE the month picker (the position law)', () => {
    const chipAt = desk.indexOf('data-testid="tax-period-landing-word"');
    const pickerAt = desk.indexOf('data-testid="tax-period-filter"');
    expect(chipAt).toBeGreaterThan(-1);
    expect(pickerAt).toBeGreaterThan(chipAt);
  });

  it('voice 1 — the dismissal clears the lens the word seeded and retires', () => {
    const at = desk.indexOf('data-testid="tax-period-landing-word"');
    const block = desk.slice(Math.max(0, at - 900), at + 300);
    expect(block).toContain("setFilingPeriodFilter('')");
    expect(block).toContain('setTaxPeriodLandingLive(false)');
  });

  it('voice 2 — the hand-driven picker retires the chip', () => {
    const at = desk.indexOf('const chooseFilingPeriod');
    const block = desk.slice(at, at + 220);
    expect(block).toContain('setTaxPeriodLandingLive(false);');
  });

  it('the chip wears the SHADE-SPLIT family in BOTH modes (the twenty-fourth wearing)', () => {
    // v2.394.0 THE LOOM: the wardrobe moved into the loom’s registry —
    // the desk proves its family by hue, the registry carries the bytes.
    expect(desk.includes('hue="teal"')).toBe(true);
    expect(loom.includes('border-teal-300 bg-teal-100 text-teal-700')).toBe(true);
    expect(loom.includes('dark:border-teal-500/30 dark:bg-teal-500/10 dark:text-teal-300')).toBe(true);
    expect(desk.includes('THE TWENTY-FOURTH WEARING')).toBe(true);
    expect(desk.includes("SHADE-SPLIT's second application") || desk.includes("SHADE-SPLIT's SECOND APPLICATION") || desk.includes("shade-split's second application")).toBe(true);
  });

  it('the wearing is HONEST — the deeper teal is the CHIP\u2019s alone on this desk', () => {
    // the desk's own badges speak blue, emerald, red, amber, slate and
    // green — the deeper teal borrows nothing from any badge
    expect(desk.includes('bg-blue-100 text-blue-700')).toBe(true);
    expect(desk.includes('bg-emerald-100 text-emerald-700')).toBe(true);
    expect(desk.includes('bg-red-100 text-red-700')).toBe(true);
    expect(desk.includes('bg-amber-100 text-amber-700')).toBe(true);
    // no 200-storey teal exists anywhere on the desk (the shade-split's
    // whole point: the deeper storey cannot collide with the 200 family),
    // and the chip's exact triple is a ONE-speaker face
    expect(desk.includes('border-teal-200')).toBe(false);
    // SUBSTRING-COLLISION BOUND (the v2.382 class, self-inflicted): the
    // chip's own dark-mode face `dark:bg-teal-500/10` CARRIES the byte
    // "bg-teal-50" as the 500's prefix — the honest census bounds the
    // scan with a digit lookahead instead of pretending the byte is absent
    expect(desk.match(/bg-teal-50(?![0-9])/g)?.length ?? 0).toBe(0);
    // v2.394.0 THE LOOM: the once-only census moved with the wardrobe —
    // the desk answers ZERO (the masquerade), the loom speaks it ONCE.
    expect(desk.match(/bg-teal-100 text-teal-700/g)?.length ?? 0).toBe(0);
    expect(loom.match(/bg-teal-100 text-teal-700/g)?.length).toBe(1);
  });

  it('the dismiss hint sharpens on hover (the group-hover detail)', () => {
    // v2.394.0 THE LOOM: the X face’s bytes live in the one loom now
    expect(loom.includes('opacity-60 transition-opacity group-hover:opacity-100')).toBe(true);
  });

  it('the chip explains itself (the tooltip law)', () => {
    expect(desk.includes('title="The tax desk landed with this filing period from the address bar — press to clear it"')).toBe(true);
  });

  it('the month picker is labeled (the aria law)', () => {
    expect(desk.includes('aria-label="Filter filings by period"')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 5. THE PERIOD LENS'S OWN EMPTY VOICE — the styling detail's second speaker
// ---------------------------------------------------------------------------

describe('the lens-aware empty voice — the period lens speaks its month', () => {
  const desk = readFileSync('src/app/(shell)/tabs/tax-tab.tsx', 'utf8');

  it('the lensed empty answer exists and names the month', () => {
    expect(desk.includes('data-testid="tax-period-empty-lens"')).toBe(true);
    expect(
      desk.includes('No <span className="font-medium text-foreground">{filingPeriodFilter}</span> filings in this lens yet.')
    ).toBe(true);
  });

  it('the branch law: the type voice, then the period voice, then the generic', () => {
    const typeAt = desk.indexOf('data-testid="tax-type-empty-lens"');
    const periodAt = desk.indexOf('data-testid="tax-period-empty-lens"');
    const genericAt = desk.indexOf('No tax filings found');
    expect(typeAt).toBeGreaterThan(-1);
    expect(periodAt).toBeGreaterThan(typeAt);
    expect(genericAt).toBeGreaterThan(periodAt);
  });

  it('the lensed answer offers the clearing hand', () => {
    const at = desk.indexOf('data-testid="tax-period-empty-lens"');
    const block = desk.slice(at, at + 900);
    expect(block).toContain("chooseFilingPeriod('')");
    expect(block).toContain('Clear the period lens');
  });

  it('the generic empty state keeps its own voice (the unscoped world)', () => {
    expect(desk.includes('Create First Filing')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 6. THE LEGEND'S GHOST FACES — retired (the live QA catch)
// ---------------------------------------------------------------------------

describe('the workflow legend — the schema\u2019s own five, the ghosts retired', () => {
  const desk = readFileSync('src/app/(shell)/tabs/tax-tab.tsx', 'utf8');

  it('the legend walks the schema\u2019s own vocabulary', () => {
    const at = desk.indexOf('Filing Status Workflow');
    const block = desk.slice(at, at + 1400);
    expect(at).toBeGreaterThan(-1);
    expect(block).toContain('Draft');
    expect(block).toContain('Filed');
    expect(block).toContain('Accepted');
    expect(block).toContain('Amended');
    expect(block).toContain('Rejected');
  });

  it('the ghost faces are GONE from the desk — the wire can never carry them', () => {
    expect(desk.includes('>Approved<')).toBe(false);
    expect(desk.includes('>Paid<')).toBe(false);
    expect(desk.includes('>Late<')).toBe(false);
    expect(desk.includes('APPROVED:')).toBe(false);
    expect(desk.includes("f.status === 'LATE'")).toBe(false);
  });

  it('the legend\u2019s repair note names the round (the provenance law)', () => {
    expect(desk.includes('THE GHOST FACES RETIRED')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 7. THE CONSTITUTION — the twenty-fourth row is visible from here
// ---------------------------------------------------------------------------

describe('the address-bar vocabulary — the twenty-fourth row (cross-suite pins)', () => {
  const constitution = readFileSync('src/tests/transfer-status-deep-link-v2357.test.ts', 'utf8');

  it('the constitution walks TWENTY-FOUR words over TWENTY-ONE desks', () => {
    expect(constitution.includes('(thirty-three words, twenty-six desks)')).toBe(true);
    expect(constitution.includes("{ word: 'tax-period', desk: 'src/app/(shell)/tabs/tax-tab.tsx', family: 'border-teal-300', suite: 'src/tests/tax-period-deep-link-v2383.test.ts' }")).toBe(true);
    expect(constitution.includes("'TWENTY-FOURTH'")).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 8. THE COLLISION LEDGER — which files may speak the word at all
// ---------------------------------------------------------------------------

function walkSrc(dir: string, collected: string[]): void {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    const st = statSync(p);
    if (st.isDirectory()) {
      if (entry === 'node_modules' || entry === '.next') continue;
      walkSrc(p, collected);
    } else if (/\.(ts|tsx|mjs|js)$/.test(entry)) {
      if (readFileSync(p, 'utf8').includes('tax-period')) collected.push(p);
    }
  }
}

describe('the address-bar vocabulary stays one-writer-per-word', () => {
  it('`tax-period` speaks in exactly the expected files under src/', () => {
    const collected: string[] = [];
    walkSrc('src', collected);
    collected.sort();
    expect(collected).toEqual([
      'src/app/(shell)/tabs/tax-tab.tsx',
      'src/lib/tab-url.ts',
      'src/lib/whats-new.ts',
      // the twenty-three neighbor ledgers admitted this test file — and an
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
      // the stress walk's expected roll speaks the word too (the registry
      // is an honest speaker of every row it carries)
      'src/tests/family-registry-stress-v2370.test.ts',
      'src/tests/gc-status-deep-link-v2358.test.ts',
      'src/tests/inv-status-deep-link-v2356.test.ts',
      'src/tests/inv-stock-deep-link-v2329.test.ts',
      // the loom’s own suite — admitted (v2.394.0: the LandingChip
      // loom suite pins this desk’s chip bytes, so the walk lists it)
      'src/tests/landing-chip-loom-v2394.test.ts',
      'src/tests/ly-type-deep-link-v2368.test.ts',
      'src/tests/pr-status-deep-link-v2362.test.ts',
      'src/tests/proxy-gate-layering-v2328.test.ts',
      // the po-status word's ledger lives beside the proxy-gate suite
      // (one release, two suites — the ledger is the honest speaker here)
      'src/tests/rent-status-deep-link-v2355.test.ts',
      // v2.384.0's shape word rides beside the month shape (the census
      // ripple: the reports desk's suite cites the tax-period word in its
      // cross-word coexistence proof)
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
    expect(home.includes('export function parseInitialNamedPeriod')).toBe(true);
    expect(home.includes('export function parseInitialType')).toBe(true);
    expect(home.includes('export function parseInitialStage')).toBe(true);
    expect(home.includes('export function parseInitialStageWithAlias')).toBe(true);
    expect(home.includes('export function parseInitialNamedMemberWithAlias')).toBe(true);
  });
});
