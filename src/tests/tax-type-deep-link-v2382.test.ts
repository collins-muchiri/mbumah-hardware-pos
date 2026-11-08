// THE TAX DESK'S OWN WORD (v2.382.0): the ghost desk comes alive and
// answers the address bar — the shade-split round.
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
// v2.381.0 the e-TIMS invoices ledger. THE PROMISE KEPT A TWENTY-THIRD
// TIME — and the desk is a REVIVAL: the tax surface (tax categories,
// filings, eTIMS settings) was built years ago but no route pointed at
// it — it rode unrouted with eight tsc errors, its imports naming a
// taxApi the api-client consolidation never carried (the system-health
// precedent's exact class). The revival round re-ups the wire
// (taxApi + TaxCategoryItem + TaxFilingItem in src/lib/api.ts, speaking
// the LIVE /api/tax/* routes), registers the desk everywhere
// (TAB_CONFIG + NAV_GROUPS + the AppTab union + TAB_LOADERS + the
// main-app switch + the workspace links guard list), and the filings
// ledger's type lens speaks its desk-prefixed
// `?tax-type=all|VAT|WHT|INCOME_TAX|TURNOVER_TAX` — the taxman's daily
// question, "which returns are VAT, which are withholding, which
// income?", is now an address. The chip wears the family's FIRST
// SHADE-SPLIT — orange one storey deeper at 300/100 (THE TWENTY-THIRD
// WEARING: the palette-exhaustion amendment's FOURTH form — all
// twenty-two Tailwind hues already spoke at 200/50, so the grammar grows
// a second storey: a hue may speak twice only through a DIFFERENT
// storey, and the pair bytes can never collide — rentals' stock-word
// speaks orange-200/50, the tax desk's money-word answers at
// orange-300/100; the desk's own badges speak blue, emerald, red, amber
// and slate, so the deeper orange borrows nothing from any badge).
// The vocabulary is the wire's OWN four types, UPPERCASE — a lowercase
// word is an unknown word here, not a clever match.
// THE TWO-ADDRESS DESIGN's third application: the lens lives in a
// NON-DEFAULT sub-tab (filings under a categories default), so a landing
// that carries the word lands the filings stage too — view's own word
// wins when it speaks a VALID sub-tab, an invalid word does not claim
// the stage (only valid words speak), and a landed type word implies
// the stage it lives on. THE LANDING IS READ ONCE ON THE SHELL: the tax
// desk's filters live on the shell itself (which never unmounts), so
// the seed is a plain useState initializer — a dismissed chip can never
// resurrect.
// THE LENS-AWARE EMPTY VOICE (the styling detail): a lensed desk used to
// answer its empty window with the GENERIC empty state — a false
// "nothing exists" reading when the truth is "nothing wears THIS type".
// The lensed answer now names the lens's own word and offers the
// clearing hand.
//
// Pins: the parser's truth table (pure, the UPPERCASE vocabulary, the
// neutral's self-seed AND its lowercase inversions, the ride-alongs over
// the whole twenty-two-word family), the stage parser's truth table (the
// two-address law), the desk's seed bytes and its cast-free typing, the
// read-once-on-the-shell law (the shell-owned landing, the filter seeded
// from the shell's landing), the query-feed bytes, the typed chooser,
// THE REGISTRATION (the revival's door: config, groups, union, loader,
// switch, links — the roles mirroring the filings wire's own gate), the
// desk-repair pins (the wire re-upped, the schema-honest badge map, the
// widened annotation), the chip's bytes and its two retirement voices,
// the position law, the wearing note and its honesty bounds, the
// lens-aware empty voice, the one-home promise (the law's doc carries
// the twenty-third word), the collision ledger — and the constitution's
// twenty-third row from its own suite.

import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { parseInitialNamedMember, parseInitialStage } from '@/lib/tab-url';

const TAX_TYPE_FILTERS = ['all', 'VAT', 'WHT', 'INCOME_TAX', 'TURNOVER_TAX'] as const;
const TAX_SUB_TABS = ['categories', 'filings', 'etims'] as const;

// ---------------------------------------------------------------------------
// 1. THE PARSER'S TRUTH TABLE (the membership law, one home, the UPPERCASE
//    voice, the LOWERCASE-neutral inversion)
// ---------------------------------------------------------------------------

describe('parseInitialNamedMember — the taxman\u2019s type lens speaks the one home', () => {
  it('a lens the desk offers seeds the filter', () => {
    expect(parseInitialNamedMember('?tax-type=VAT', 'tax-type', TAX_TYPE_FILTERS, 'all')).toBe('VAT');
    expect(parseInitialNamedMember('?tax-type=WHT', 'tax-type', TAX_TYPE_FILTERS, 'all')).toBe('WHT');
    expect(parseInitialNamedMember('?tax-type=INCOME_TAX', 'tax-type', TAX_TYPE_FILTERS, 'all')).toBe('INCOME_TAX');
    expect(parseInitialNamedMember('?tax-type=TURNOVER_TAX', 'tax-type', TAX_TYPE_FILTERS, 'all')).toBe('TURNOVER_TAX');
  });

  it('case-sensitive: a lowercase word is an unknown word, not a clever match', () => {
    expect(parseInitialNamedMember('?tax-type=vat', 'tax-type', TAX_TYPE_FILTERS, 'all')).toBe('all');
    expect(parseInitialNamedMember('?tax-type=Vat', 'tax-type', TAX_TYPE_FILTERS, 'all')).toBe('all');
    expect(parseInitialNamedMember('?tax-type=income_tax', 'tax-type', TAX_TYPE_FILTERS, 'all')).toBe('all');
  });

  it('the NEUTRAL IS LOWERCASE here — an UPPERCASE ALL names nothing (the inversion)', () => {
    expect(parseInitialNamedMember('?tax-type=all', 'tax-type', TAX_TYPE_FILTERS, 'all')).toBe('all');
    expect(parseInitialNamedMember('?tax-type=ALL', 'tax-type', TAX_TYPE_FILTERS, 'all')).toBe('all');
  });

  it('missing, bare, and malformed searches answer the fallback — never throw', () => {
    expect(parseInitialNamedMember('', 'tax-type', TAX_TYPE_FILTERS, 'all')).toBe('all');
    expect(parseInitialNamedMember('?tab=tax', 'tax-type', TAX_TYPE_FILTERS, 'all')).toBe('all');
    expect(parseInitialNamedMember('tax-type=VAT', 'tax-type', TAX_TYPE_FILTERS, 'all')).toBe('VAT');
    expect(parseInitialNamedMember('?????', 'tax-type', TAX_TYPE_FILTERS, 'all')).toBe('all');
    expect(parseInitialNamedMember('?tax-type=', 'tax-type', TAX_TYPE_FILTERS, 'all')).toBe('all');
    expect(parseInitialNamedMember('?tax-type=FOO', 'tax-type', TAX_TYPE_FILTERS, 'all')).toBe('all');
  });

  it('the word rides alongside the vocabulary\u2019s other words without collision', () => {
    expect(
      parseInitialNamedMember('?tab=tax&tax-type=VAT&ly-type=EXPIRE&txn-type=refund', 'tax-type', TAX_TYPE_FILTERS, 'all')
    ).toBe('VAT');
    expect(
      parseInitialNamedMember('?tab=tax&tax-type=WHT&rent-status=OVERDUE&po-status=PENDING_APPROVAL&inv-stock=low', 'tax-type', TAX_TYPE_FILTERS, 'all')
    ).toBe('WHT');
    expect(
      parseInitialNamedMember('?tab=tax&tax-type=INCOME_TAX&cust-debt=overdue&sup-status=ACTIVE&sup-po=SENT&txn-pay=CASH', 'tax-type', TAX_TYPE_FILTERS, 'all')
    ).toBe('INCOME_TAX');
    expect(
      parseInitialNamedMember('?tab=tax&tax-type=TURNOVER_TAX&inv-status=PAID&transfer-status=IN_TRANSIT&gc-status=REDEEMED&dn-status=DELIVERED&vc-status=PAUSED', 'tax-type', TAX_TYPE_FILTERS, 'all')
    ).toBe('TURNOVER_TAX');
    expect(
      parseInitialNamedMember('?tab=tax&tax-type=VAT&cr-type=DEBIT&pr-status=ACTIVE&cat-stock=low_stock&dp-status=overdue', 'tax-type', TAX_TYPE_FILTERS, 'all')
    ).toBe('VAT');
    expect(
      parseInitialNamedMember('?tab=tax&tax-type=WHT&ad-severity=CRITICAL&sec-type=BRUTE_FORCE&cv-type=INTERNAL', 'tax-type', TAX_TYPE_FILTERS, 'all')
    ).toBe('WHT');
    expect(
      parseInitialNamedMember('?tab=tax&tax-type=INCOME_TAX&et-status=PENDING', 'tax-type', TAX_TYPE_FILTERS, 'all')
    ).toBe('INCOME_TAX');
  });
});

// ---------------------------------------------------------------------------
// 2. THE STAGE PARSER'S TRUTH TABLE (the two-address design, one home)
// ---------------------------------------------------------------------------

describe('parseInitialStage — one word, two addresses (the innerTab landing law)', () => {
  it('view\u2019s own word wins when it speaks a VALID sub-tab', () => {
    expect(parseInitialStage('?tab=tax&view=etims&tax-type=VAT', TAX_SUB_TABS, 'filings', true, 'categories')).toBe('etims');
    expect(parseInitialStage('?tab=tax&view=categories&tax-type=VAT', TAX_SUB_TABS, 'filings', true, 'categories')).toBe('categories');
    expect(parseInitialStage('?tab=tax&view=filings', TAX_SUB_TABS, 'filings', false, 'categories')).toBe('filings');
  });

  it('an INVALID view word does not claim the stage (only valid words speak)', () => {
    expect(parseInitialStage('?tab=tax&view=bogus&tax-type=VAT', TAX_SUB_TABS, 'filings', true, 'categories')).toBe('filings');
  });

  it('a LANDED word implies the stage it lives on (the filings ledger)', () => {
    expect(parseInitialStage('?tab=tax&tax-type=VAT', TAX_SUB_TABS, 'filings', true, 'categories')).toBe('filings');
    expect(parseInitialStage('?tab=tax&tax-type=WHT', TAX_SUB_TABS, 'filings', true, 'categories')).toBe('filings');
  });

  it('a NEUTRAL landing (or none) answers the desk\u2019s default', () => {
    expect(parseInitialStage('?tab=tax', TAX_SUB_TABS, 'filings', false, 'categories')).toBe('categories');
    expect(parseInitialStage('?tab=tax&tax-type=all', TAX_SUB_TABS, 'filings', false, 'categories')).toBe('categories');
    expect(parseInitialStage('', TAX_SUB_TABS, 'filings', false, 'categories')).toBe('categories');
  });
});

// ---------------------------------------------------------------------------
// 3. THE DESK'S SEED — read ONCE on the shell, never a copy, never a cast,
//    never a resurrection
// ---------------------------------------------------------------------------

describe('the tax desk — ?tax-type= lands as visible state (and its stage)', () => {
  const desk = readFileSync('src/app/(shell)/tabs/tax-tab.tsx', 'utf8');
  const home = readFileSync('src/lib/tab-url.ts', 'utf8');

  it('the seed reads the word through the ONE home (never a local parser)', () => {
    expect(
      desk.includes("parseInitialNamedMember(window.location.search, 'tax-type', TAX_TYPE_FILTERS, 'all')")
    ).toBe(true);
    expect(home.includes('export function parseInitialNamedMember')).toBe(true);
    expect(home.includes('v2.382.0 — THE PROMISE KEPT, THE TWENTY-THIRD WORD')).toBe(true);
  });

  it('the seed is the lazy initializer of the landing (the read-once law)', () => {
    expect(
      desk.includes('const [landedTaxType] = useState<TaxTypeFilter>(initialTaxType);')
    ).toBe(true);
    expect(desk.includes("if (typeof window === 'undefined') return 'all';")).toBe(true);
    expect(
      desk.includes("export const TAX_TYPE_FILTERS = ['all', 'VAT', 'WHT', 'INCOME_TAX', 'TURNOVER_TAX'] as const;")
    ).toBe(true);
  });

  it('the seed is CAST-FREE — the generic parser IS the union', () => {
    expect(desk.includes('function initialTaxType(): TaxTypeFilter {')).toBe(true);
    expect(desk.includes('type TaxTypeFilter = (typeof TAX_TYPE_FILTERS)[number];')).toBe(true);
    expect(desk.includes('useState<TaxTypeFilter>(initialTaxType)')).toBe(true);
    expect(desk.includes('initialTaxType() as')).toBe(false);
    expect(desk.includes('initialTaxType as unknown')).toBe(false);
  });

  it('THE LANDING IS READ ONCE ON THE SHELL (the shell-seed law)', () => {
    // the filters live on the desk's shell — which never unmounts — so
    // the type filter seeds from the shell's landing, never a re-parse
    expect(desk.includes('const [taxLandingLive, setTaxLandingLive] = useState(true);')).toBe(true);
    expect(desk.includes('const [filingTypeFilter, setFilingTypeFilter] = useState<TaxTypeFilter>(landedTaxType);')).toBe(true);
    expect(desk.includes('THE LANDING IS READ ONCE ON THE SHELL')).toBe(true);
  });

  it('THE TWO-ADDRESS DESIGN at the stage seed (the innerTab landing law)', () => {
    expect(home.includes('export function parseInitialStage')).toBe(true);
    expect(
      desk.includes("parseInitialStage(window.location.search, TAX_SUB_TABS, 'filings', landed, 'categories')")
    ).toBe(true);
    // v2.383.0: the seed grew the SECOND word's implication — a landed
    // type OR period word implies the filings stage (the elder pin
    // re-anchored to the evolved one-line form, the v2.378 class)
    expect(desk.includes("initialTaxStage(landedTaxType !== 'all' || landedTaxPeriod !== '')")).toBe(true);
    expect(desk.includes('THE TWO-ADDRESS DESIGN')).toBe(true);
  });

  it('the word is desk-prefixed (the Task 44 collision law) and annotated', () => {
    expect(desk.includes("THE TAX DESK'S OWN WORD")).toBe(true);
    expect(desk.includes('?tax-type=')).toBe(true);
  });

  it('the word filters the LEDGER, not just the Select\u2019s face (the query feed)', () => {
    expect(
      desk.includes("filingType: filingTypeFilter !== 'all' ? filingTypeFilter : undefined,")
    ).toBe(true);
  });

  it('the typed chooser is the Select\u2019s ONE voice, and the old inline setter is GONE', () => {
    expect(desk.match(/onValueChange=\{chooseFilingType\}/g)?.length).toBe(1);
    expect(desk.includes('onValueChange={setFilingTypeFilter}')).toBe(false);
    expect(desk.includes('a hand-driven Select change retires the landing word')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 4. THE REGISTRATION — the revival's door (the system-health precedent)
// ---------------------------------------------------------------------------

describe('the ghost desk gets its door — the revival\u2019s registration', () => {
  const config = readFileSync('src/lib/app-config.ts', 'utf8');
  const stores = readFileSync('src/lib/stores.ts', 'utf8');
  const preload = readFileSync('src/lib/tab-preload.ts', 'utf8');
  const mainApp = readFileSync('src/components/app/main-app.tsx', 'utf8');
  const links = readFileSync('src/lib/workspace/links.ts', 'utf8');
  const desk = readFileSync('src/app/(shell)/tabs/tax-tab.tsx', 'utf8');

  it('TAB_CONFIG carries the desk, and the roles mirror the filings wire\u2019s own gate', () => {
    expect(config.includes("{ id: 'tax', label: 'Tax', icon: Calculator, roles: ['SUPER_ADMIN', 'STORE_OWNER', 'ACCOUNTANT'] }")).toBe(true);
    // FINANCIAL_ROLES.WRITE (src/lib/auth.ts) is exactly this trio — a
    // manager-facing door would 403, and a door that 403s is a lie. The
    // trio is spelled out byte-for-byte and carries the wire's own voice
    // in the note above it.
    expect(config.match(/roles: \['SUPER_ADMIN', 'STORE_OWNER', 'ACCOUNTANT'\]/g)?.length).toBe(2); // banking + tax
    expect(stores.includes("'etims' | 'tax' |")).toBe(true);
  });

  it('the tab sits in the Compliance & System group, right after etims', () => {
    expect(config.includes("{ label: 'Compliance & System', ids: ['etims', 'tax', 'reports', 'data-exports', 'security', 'admin', 'system-health'] }")).toBe(true);
  });

  it('TAB_LOADERS carries the desk and points at the real tab file', () => {
    expect(preload.includes("tax: () => import('../app/(shell)/tabs/tax-tab'),")).toBe(true);
    expect(desk.includes('export default function TaxTab()')).toBe(true);
  });

  it('the main-app switch renders the tab behind an error boundary', () => {
    expect(mainApp.includes('const LazyTaxTab = lazy(TAB_LOADERS.tax);')).toBe(true);
    expect(
      mainApp.includes(`case 'tax': return <SectionErrorBoundary sectionName="Tax"><Suspense fallback={<TabLoadingFallback />}><LazyTaxTab /></Suspense></SectionErrorBoundary>;`)
    ).toBe(true);
  });

  it('the workspace links guard list carries the segment (the AppTab union\u2019s own members)', () => {
    expect(links.includes("'people-payroll', 'etims', 'tax', 'debt-management', 'debt-plans',")).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 5. THE DESK REPAIR — the wire re-upped, the vocabulary honest
// ---------------------------------------------------------------------------

describe('the revival\u2019s repair — the ghost desk\u2019s wire and words', () => {
  const api = readFileSync('src/lib/api.ts', 'utf8');
  const desk = readFileSync('src/app/(shell)/tabs/tax-tab.tsx', 'utf8');

  it('the wire exists: taxApi speaks the LIVE /api/tax/* routes through the ONE request home', () => {
    expect(api.includes('export const taxApi = {')).toBe(true);
    expect(api.includes("return request<TaxCategoryItem[]>(`/tax/categories?${query.toString()}`);")).toBe(true);
    expect(api.includes("return request<TaxFilingItem[]>(`/tax/filings?${query.toString()}`);")).toBe(true);
    expect(api.includes("request<TaxCategoryItem>('/tax/categories', {")).toBe(true);
    expect(api.includes("request<TaxFilingItem>('/tax/filings', {")).toBe(true);
  });

  it('the item types speak the wire\u2019s own shapes', () => {
    expect(api.includes('export interface TaxCategoryItem {')).toBe(true);
    expect(api.includes('export interface TaxFilingItem {')).toBe(true);
    expect(api.includes('export interface TaxRateItem {')).toBe(true);
    // the schema's own status vocabulary is typed and commented
    expect(api.includes("export type TaxFilingStatus = 'DRAFT' | 'FILED' | 'ACCEPTED' | 'REJECTED' | 'AMENDED';")).toBe(true);
  });

  it('the wire\u2019s summary rides the envelope as additive optional keys (the house law)', () => {
    expect(api.includes("v2.382.0 THE TAXMAN'S LEDGER SUMMARY")).toBe(true);
    expect(api.includes('    totalSales?: number;')).toBe(true);
    expect(api.includes('    totalTax?: number;')).toBe(true);
    expect(api.includes('    totalWht?: number;')).toBe(true);
    expect(api.includes('    count?: number;')).toBe(true);
  });

  it('the badge map speaks the SCHEMA\u2019S OWN vocabulary — the stale faces are GONE', () => {
    expect(desk.includes("REJECTED: { label: 'Rejected', className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },")).toBe(true);
    expect(desk.includes("AMENDED: { label: 'Amended', className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },")).toBe(true);
    expect(desk.includes('APPROVED:')).toBe(false);
    expect(desk.includes("label: 'Paid'")).toBe(false);
    expect(desk.includes("label: 'Late'")).toBe(false);
    // the status Select offers the same honest five
    expect(desk.includes('<SelectItem value="ACCEPTED">Accepted</SelectItem>')).toBe(true);
    expect(desk.includes('<SelectItem value="AMENDED">Amended</SelectItem>')).toBe(true);
    expect(desk.includes('<SelectItem value="APPROVED">')).toBe(false);
  });

  it('"due" means a DRAFT — the LATE face named a status the wire never carries', () => {
    expect(desk.includes("f.status === 'DRAFT'")).toBe(true);
    expect(desk.includes("f.status === 'LATE'")).toBe(false);
  });

  it('the rate-history annotation widened — the fields exist on the wire\u2019s own shape', () => {
    expect(desk.includes('cat.taxRates.map((rate: TaxRateItem) => (')).toBe(true);
    expect(desk.includes('(rate: { id: string; name: string; rate: number })')).toBe(false);
  });

  it('the stat reducers coerce the wire\u2019s money face (the string-concat QA catch)', () => {
    // the LIVE QA catch: Prisma Decimal fields serialize as STRINGS on the
    // JSON wire — a bare `s + f.totalWht` CONCATENATED two KES 11,550 /
    // 12,600 rows into "Ksh 1,155,012,600.00". The boundary coerces.
    expect(desk.includes('reduce((s, f) => s + Number(f.totalTax), 0)')).toBe(true);
    expect(desk.includes('reduce((s, f) => s + Number(f.totalWht), 0)')).toBe(true);
    expect(desk.includes('s + f.totalTax, 0')).toBe(false);
    expect(desk.includes('s + f.totalWht, 0')).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// 6. THE LANDING CHIP — the face names the word it answered, in orange
//    one storey deeper
// ---------------------------------------------------------------------------

describe('the landing chip — the face names the word it answered', () => {
  const desk = readFileSync('src/app/(shell)/tabs/tax-tab.tsx', 'utf8');
  const loom = readFileSync('src/components/landing-chip.tsx', 'utf8');

  it('the chip renders only while the landing is live AND untouched', () => {
    expect(
      desk.includes("taxLandingLive && landedTaxType !== 'all' && filingTypeFilter === landedTaxType")
    ).toBe(true);
    expect(desk.includes('data-testid="tax-type-landing-word"')).toBe(true);
  });

  it('the chip names the exact word it answered — the CANONICAL spelling always', () => {
    // v2.394.0 THE LOOM: the label rides a template-literal prop now
    expect(desk.includes('landed ?tax-type=${landedTaxType}')).toBe(true);
  });

  it('the chip sits BEFORE the type Select (the position law)', () => {
    const chipAt = desk.indexOf('data-testid="tax-type-landing-word"');
    const selectAt = desk.indexOf('<Select value={filingTypeFilter} onValueChange={chooseFilingType}>');
    expect(chipAt).toBeGreaterThan(-1);
    expect(selectAt).toBeGreaterThan(chipAt);
  });

  it('voice 1 — the dismissal clears the lens the word seeded and retires', () => {
    const at = desk.indexOf('data-testid="tax-type-landing-word"');
    const block = desk.slice(Math.max(0, at - 900), at + 300);
    expect(block).toContain("setFilingTypeFilter('all')");
    expect(block).toContain('setTaxLandingLive(false)');
  });

  it('voice 2 — the hand-driven chooser retires the chip', () => {
    const at = desk.indexOf('const chooseFilingType');
    const block = desk.slice(at, at + 220);
    expect(block).toContain('setTaxLandingLive(false);');
  });

  it('the chip wears the SHADE-SPLIT family in BOTH modes (the twenty-third wearing)', () => {
    // v2.394.0 THE LOOM: the wardrobe moved into the loom’s registry —
    // the desk proves its family by hue, the registry carries the bytes.
    expect(desk.includes('hue="orange"')).toBe(true);
    expect(loom.includes('border-orange-300 bg-orange-100 text-orange-700')).toBe(true);
    expect(loom.includes('dark:border-orange-500/30 dark:bg-orange-500/10 dark:text-orange-300')).toBe(true);
    expect(desk.includes('THE TWENTY-THIRD WEARING')).toBe(true);
    expect(desk.includes('SHADE-SPLIT')).toBe(true);
  });

  it('the wearing is HONEST — the deeper orange is the CHIP\u2019s alone', () => {
    // the desk's own badges speak blue, emerald, red, amber and slate —
    // the deeper orange borrows nothing from any badge
    expect(desk.includes('bg-blue-100 text-blue-700')).toBe(true);
    expect(desk.includes('bg-emerald-100 text-emerald-700')).toBe(true);
    expect(desk.includes('bg-red-100 text-red-700')).toBe(true);
    expect(desk.includes('bg-amber-100 text-amber-700')).toBe(true);
    // no 200-storey orange exists anywhere on the desk (the shade-split's
    // whole point: the deeper storey cannot collide with the 200 family),
    // and the chip's exact triple is a ONE-speaker face
    expect(desk.includes('border-orange-200')).toBe(false);
    // SUBSTRING-COLLISION BOUND (the stock-take class, self-inflicted): the
    // chip's own dark-mode face `dark:bg-orange-500/10` CARRIES the byte
    // "bg-orange-50" as the 500's prefix — the honest census bounds the
    // scan with a digit lookahead instead of pretending the byte is absent
    expect(desk.match(/bg-orange-50(?![0-9])/g)?.length ?? 0).toBe(0);
    // v2.394.0 THE LOOM: the once-only census moved with the wardrobe —
    // the desk answers ZERO (the masquerade), the loom speaks it ONCE.
    expect(desk.match(/bg-orange-100 text-orange-700/g)?.length ?? 0).toBe(0);
    expect(loom.match(/bg-orange-100 text-orange-700/g)?.length).toBe(1);
  });

  it('the dismiss hint sharpens on hover (the group-hover detail)', () => {
    // v2.394.0 THE LOOM: the X face’s bytes live in the one loom now
    expect(loom.includes('opacity-60 transition-opacity group-hover:opacity-100')).toBe(true);
  });

  it('the chip explains itself (the tooltip law)', () => {
    expect(desk.includes('title="The tax desk landed with this filing type from the address bar — press to clear it"')).toBe(true);
    // v2.394.0 THE LOOM: the icons' aria attribute lives in the one loom now
    expect(loom.includes('aria-hidden="true"')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 7. THE LENS-AWARE EMPTY VOICE — the lensed empty answer names its lens
// ---------------------------------------------------------------------------

describe('the lens-aware empty voice — the styling detail', () => {
  const desk = readFileSync('src/app/(shell)/tabs/tax-tab.tsx', 'utf8');

  it('the lensed empty answer exists and names the lens', () => {
    expect(desk.includes('data-testid="tax-type-empty-lens"')).toBe(true);
    expect(
      desk.includes('No <span className="font-medium text-foreground">{filingTypeFilter}</span> filings in this lens yet.')
    ).toBe(true);
  });

  it('the lensed answer comes BEFORE the generic empty (the branch law)', () => {
    const lensAt = desk.indexOf('data-testid="tax-type-empty-lens"');
    const genericAt = desk.indexOf('No tax filings found');
    expect(lensAt).toBeGreaterThan(-1);
    expect(genericAt).toBeGreaterThan(lensAt);
  });

  it('the lensed answer offers the clearing hand', () => {
    const at = desk.indexOf('data-testid="tax-type-empty-lens"');
    const block = desk.slice(at, at + 900);
    expect(block).toContain("chooseFilingType('all')");
    expect(block).toContain('Clear the type lens');
  });

  it('the generic empty state keeps its own voice (the unscoped world)', () => {
    expect(desk.includes('Create First Filing')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 8. THE CONSTITUTION — the twenty-third row is visible from here
// ---------------------------------------------------------------------------

describe('the address-bar vocabulary — the twenty-third row (cross-suite pins)', () => {
  const constitution = readFileSync('src/tests/transfer-status-deep-link-v2357.test.ts', 'utf8');

  it('the constitution walks TWENTY-THREE words over TWENTY-ONE desks', () => {
    expect(constitution.includes('(thirty-three words, twenty-six desks)')).toBe(true);
    expect(constitution.includes("{ word: 'tax-type', desk: 'src/app/(shell)/tabs/tax-tab.tsx', family: 'border-orange-300', suite: 'src/tests/tax-type-deep-link-v2382.test.ts' }")).toBe(true);
    expect(constitution.includes("'TWENTY-THIRD'")).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 9. THE COLLISION LEDGER — which files may speak the word at all
// ---------------------------------------------------------------------------

function walkSrc(dir: string, collected: string[]): void {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    const st = statSync(p);
    if (st.isDirectory()) {
      if (entry === 'node_modules' || entry === '.next') continue;
      walkSrc(p, collected);
    } else if (/\.(ts|tsx|mjs|js)$/.test(entry)) {
      if (readFileSync(p, 'utf8').includes('tax-type')) collected.push(p);
    }
  }
}

describe('the address-bar vocabulary stays one-writer-per-word', () => {
  it('`tax-type` speaks in exactly the expected files under src/', () => {
    const collected: string[] = [];
    walkSrc('src', collected);
    collected.sort();
    expect(collected).toEqual([
      'src/app/(shell)/tabs/tax-tab.tsx',
      // a SUBSTRING COINCIDENCE, not a speaker: the e-TIMS types module's
      // doc comment "KRA item tax-type codes" carries the byte as prose —
      // an honest census lists what the scan finds and bounds it here
      // (it speaks no word of the family)
      'src/lib/etims-types.ts',
      'src/lib/tab-url.ts',
      'src/lib/whats-new.ts',
      // the twenty-two neighbor ledgers admitted this test file — and an
      // admission line carries the word it admits (the LEDGER-CITATION
      // RIPPLE: a ledger is an honest speaker of every word it lists)
      'src/tests/ad-severity-deep-link-v2366.test.ts',
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
      // the thirtieth word's own ledger — admitted (its rides-beside
      // truth speaks this word) — an admission line carries the word
      // it admits
      'src/tests/exp-status-deep-link-v2391.test.ts',
      // the thirty-first word's own ledger — admitted (its rides-beside
      // truth speaks this word) — an admission line carries the word
      // it admits
      'src/tests/exp-type-deep-link-v2392.test.ts',
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
      // the thirty-second word's own ledger — admitted (its own ledger
      // LISTS this file's path — the third-order ripple: a ledger line
      // carries every word its paths speak)
      'src/tests/msg-template-deep-link-v2393.test.ts',
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
