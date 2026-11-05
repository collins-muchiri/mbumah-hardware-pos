// THE REPORTS DESK'S OWN WORD (v2.384.0): the Report Type grid answers
// the address bar — the family's TWENTY-FIFTH wearing.
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
// lens, v2.383.0 that ledger's month shape. THE PROMISE KEPT A
// TWENTY-FIFTH TIME — and this word is a SHAPE word on an
// ALWAYS-RENDERED lens: the Report Type grid never leaves the desk, so
// `?rep-type=` lands the report itself — no sub-tab law to speak, no
// stage to imply (the report type IS the stage, and the grid's own
// Active badge shows the landed shape). The chip wears LIME at 300/100
// — the shade-split's THIRD application, a hue no chip wearing has
// spoken at the shallow 200/50 storey — the gift-cards desk's word —
// now one storey deeper, a family byte the 200-storey can never equal,
// borrowing nothing from the desk's badges (primary, amber, green, blue,
// red). The same round fences the
// lockfile generation drift: the parity guard now also fails on a
// root-version lag and a range disagreement — the two legs the name
// census let survive for thirty releases.

import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

import {
  parseInitialNamedMember,
  REP_TYPE_FILTERS,
} from '@/lib/tab-url';
import { WHATS_NEW } from '@/lib/whats-new';

const REPORTS_TAB = 'src/app/(shell)/tabs/reports-tab.tsx';

// ---------------------------------------------------------------------------
// 1. THE PARSER'S TRUTH TABLE (the same ONE home, one word over)
// ---------------------------------------------------------------------------

describe('parseInitialNamedMember — ?rep-type= speaks the grid\u2019s own vocabulary', () => {
  it('every member of the union answers itself (lowercase, case-sensitive)', () => {
    for (const member of REP_TYPE_FILTERS) {
      expect(parseInitialNamedMember(`?tab=reports&rep-type=${member}`, 'rep-type', REP_TYPE_FILTERS, 'sales')).toBe(member);
    }
  });

  it('a capitalized or partial word is an unknown word — never a clever match', () => {
    expect(parseInitialNamedMember('?tab=reports&rep-type=Trends', 'rep-type', REP_TYPE_FILTERS, 'sales')).toBe('sales');
    expect(parseInitialNamedMember('?tab=reports&rep-type=TOP_PRODUCTS', 'rep-type', REP_TYPE_FILTERS, 'sales')).toBe('sales');
    expect(parseInitialNamedMember('?tab=reports&rep-type=top', 'rep-type', REP_TYPE_FILTERS, 'sales')).toBe('sales');
    expect(parseInitialNamedMember('?tab=reports&rep-type=garbage', 'rep-type', REP_TYPE_FILTERS, 'sales')).toBe('sales');
  });

  it('missing, bare, and malformed searches answer the fallback — never throw', () => {
    expect(parseInitialNamedMember('', 'rep-type', REP_TYPE_FILTERS, 'sales')).toBe('sales');
    expect(parseInitialNamedMember('?tab=reports', 'rep-type', REP_TYPE_FILTERS, 'sales')).toBe('sales');
    expect(parseInitialNamedMember('?tab=reports&rep-type=', 'rep-type', REP_TYPE_FILTERS, 'sales')).toBe('sales');
    expect(parseInitialNamedMember('rep-type=trends', 'rep-type', REP_TYPE_FILTERS, 'sales')).toBe('trends');
    expect(parseInitialNamedMember('?????', 'rep-type', REP_TYPE_FILTERS, 'sales')).toBe('sales');
  });

  it('the word rides BESIDE the other twenty-four without stealing any of them', () => {
    expect(
      parseInitialNamedMember('?tab=reports&rep-type=trends&tax-period=2026-10&txn-pay=CASH', 'rep-type', REP_TYPE_FILTERS, 'sales')
    ).toBe('trends');
    expect(
      parseInitialNamedMember('?tab=tax&tax-period=2026-10&rep-type=valuation', 'rep-type', REP_TYPE_FILTERS, 'sales')
    ).toBe('valuation');
    expect(
      parseInitialNamedMember('?tab=reports&rep-type=trends&po-status=OPEN&inv-stock=low_stock', 'rep-type', REP_TYPE_FILTERS, 'sales')
    ).toBe('trends');
  });
});

// ---------------------------------------------------------------------------
// 2. THE DESK'S SEED — the THIRD shell-seed speaker, cast-free
// ---------------------------------------------------------------------------

describe('the reports desk — ?rep-type= lands as visible state', () => {
  const desk = readFileSync(REPORTS_TAB, 'utf8');
  const loom = readFileSync('src/components/landing-chip.tsx', 'utf8');
  const home = readFileSync('src/lib/tab-url.ts', 'utf8');

  it('the seed reads the word through the ONE home (never a local parser)', () => {
    expect(
      desk.includes("parseInitialNamedMember(window.location.search, 'rep-type', REP_TYPE_FILTERS, 'sales')")
    ).toBe(true);
    expect(home.includes('export function parseInitialNamedMember')).toBe(true);
    expect(home.includes('v2.384.0 — THE PROMISE KEPT, THE TWENTY-FIFTH WORD')).toBe(true);
  });

  it('the seed is the write-once initializer of the landing (the read-once law)', () => {
    expect(desk.includes('const [landedRepType] = useState<ReportType>(initialReportType);')).toBe(true);
    expect(desk.includes('const [reportType, setReportType] = useState<ReportType>(initialReportType);')).toBe(true);
    expect(desk.includes("if (typeof window === 'undefined') return 'sales';")).toBe(true);
  });

  it('the seed is CAST-FREE — the member parser answers the union it is', () => {
    expect(desk.includes('function initialReportType(): ReportType {')).toBe(true);
    expect(desk.includes('initialReportType() as')).toBe(false);
    expect(desk.includes('initialReportType as unknown')).toBe(false);
  });

  it('the vocabulary is the grid\u2019s OWN spelling (eight members, lowercase)', () => {
    expect(REP_TYPE_FILTERS).toEqual([
      'sales',
      'inventory',
      'valuation',
      'daily',
      'top_products',
      'customer_analysis',
      'rental_performance',
      'trends',
    ]);
    expect(desk.includes('type ReportType = (typeof REP_TYPE_FILTERS)[number];')).toBe(true);
    expect(home.includes('export const REP_TYPE_FILTERS')).toBe(true);
  });

  it('EVERY hand-driven shape change rides the retirement door', () => {
    expect(desk.includes('const chooseReportType = useCallback((value: ReportType) => {')).toBe(true);
    expect(desk.includes('onClick={() => chooseReportType(')).toBe(true);
    expect(desk.includes("chooseReportType('sales')")).toBe(true);
    // the ONLY direct setReportType calls left are the declaration and the
    // helper's own functional update:
    const direct = desk.split('\n').filter((l) => l.includes('setReportType(') && !l.includes('const [reportType, setReportType]'));
    expect(direct.length).toBe(1);
    expect(direct[0]).toContain('setReportType((prev) => {');
  });

  it('the chip sits BEFORE the lens it landed into (the position law)', () => {
    const chip = desk.indexOf('data-testid="rep-type-landing-word"');
    const grid = desk.indexOf('<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">');
    expect(chip).toBeGreaterThan(-1);
    expect(grid).toBeGreaterThan(-1);
    expect(chip).toBeLessThan(grid);
  });

  it('the chip wears LIME at the 300/100 storey (the third shade-split)', () => {
    // v2.394.0 THE LOOM: the wardrobe moved into the loom’s registry —
    // the desk proves its family by hue, the registry carries the bytes.
    expect(desk.includes('hue="lime"')).toBe(true);
    expect(loom.includes('border-lime-300 bg-lime-100 text-lime-700')).toBe(true);
    expect(loom.includes('dark:border-lime-500/30 dark:bg-lime-500/10 dark:text-lime-300')).toBe(true);
    // a chip hue the desk's badges never speak — the badge census:
    expect(desk.includes('bg-amber-50 dark:bg-amber-950/30')).toBe(true); // Demo Data badge
    expect(desk.includes('bg-green-100 text-green-700')).toBe(true);
    expect(desk.includes('bg-blue-100 text-blue-700')).toBe(true);
    expect(desk.includes('bg-red-100 text-red-700')).toBe(true);
    // and no OTHER landing chip hue collides with lime:
    expect(desk.includes('border-orange-300 bg-orange-100')).toBe(false);
    expect(desk.includes('border-teal-300 bg-teal-100')).toBe(false);
  });

  it('the chip is dismissible and annotated (the collision law\u2019s annotation)', () => {
    // v2.394.0 THE LOOM: the single-write dismissal rides onDismiss now
    expect(desk.includes("onDismiss={() => setRepLandingLive(false)}")).toBe(true);
    expect(desk.includes("THE REPORTS DESK'S OWN WORD")).toBe(true);
    expect(desk.includes('?rep-type=sales|inventory|valuation')).toBe(true);
  });

  it('no stage to imply — the desk has no sub-tab door to negotiate', () => {
    expect(desk.includes('parseInitialStage')).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// 3. THE LOCKFILE GENERATION LEGS — the drift that survived thirty releases
// ---------------------------------------------------------------------------

describe('the lockfile parity guard — root-version and range legs', () => {
  const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
  const guard = readFileSync('scripts/check-lockfile-drift.mjs', 'utf8');

  it('the guard speaks the generation legs (source pins)', () => {
    expect(guard.includes('THE GENERATION LEGS')).toBe(true);
    expect(guard.includes('root version')).toBe(true);
    expect(guard.includes('range drift')).toBe(true);
    expect(guard.includes('npm install --package-lock-only')).toBe(true);
  });

  // THE LOCAL-ARTIFACT SCOPE: package-lock.json is deliberately untracked
  // (repo policy — committing it would flip Vercel's package-manager
  // auto-detection away from bun), so these two legs speak ONLY where the
  // file exists (the local tree). CI answers through the guard's own run
  // below, whose parity leg skips itself on exactly the same policy —
  // the test mirrors the guard, never overrides it.
  const lockExists = existsSync('package-lock.json');

  it.skipIf(!lockExists)('the local lock speaks the manifest\u2019s generation (root version parity)', () => {
    const lock = JSON.parse(readFileSync('package-lock.json', 'utf8'));
    expect(lock.packages?.['']?.version).toBe(pkg.version);
  });

  it.skipIf(!lockExists)('every manifest range rides the lock root unchanged (range parity)', () => {
    const lock = JSON.parse(readFileSync('package-lock.json', 'utf8'));
    const root = lock.packages?.[''] ?? {};
    const lockDeps = { ...root.dependencies, ...root.devDependencies };
    for (const [name, range] of Object.entries({ ...pkg.dependencies, ...pkg.devDependencies })) {
      if (name === pkg.name) continue;
      expect(lockDeps[name], `${name}`).toBe(range);
    }
  });

  it('the guard answers 0 on the current tree (the live gate)', () => {
    const out = execFileSync('node', ['scripts/check-lockfile-drift.mjs'], { encoding: 'utf8' });
    expect(out).toContain('Lockfile guard OK');
  });
});

// ---------------------------------------------------------------------------
// 4. THE WHAT'S NEW FEED — the round announces itself
// ---------------------------------------------------------------------------

describe('whats-new — v2.402.0 leads the feed', () => {
  it('the entry exists, first, with the round\u2019s own story', () => {
    const head = WHATS_NEW[0];
    expect(head.version).toBe('2.402.0');
    // the lead's story hand-over (v2.402.0, the Task 111 law's eighth
    // application): the head story is the payload file's — the KRA filing
    // trio completes (Print = the paper, Copy = the clipboard, Download =
    // the FILE), the saved face riding the receipt hop's law, and the
    // refund heal suite's label widen stands 29 faces down. The support
    // file's story exits the head this round; the filing trio's zebra
    // ledger carries the eye.
    expect(head.title).toContain('payload');
    expect(head.bullets.length).toBeGreaterThanOrEqual(3);
    expect(head.bullets.some((b) => b.includes('Download button'))).toBe(true);
    expect(head.bullets.some((b) => b.includes('KRA filing'))).toBe(true);
    expect(head.bullets.some((b) => b.includes('strict-mode type faces'))).toBe(true);
  });
});
