#!/usr/bin/env node
// verify-v2-382-0.mjs — the round's FEATURE gate (v2.382.0 "the ghost tax
// desk comes alive and answers the address bar"). The release MECHANICS
// live in verify-current.mjs. This script pins only what is NEW this
// round: the revival's registration (the door, the group, the union, the
// loader, the switch, the links guard), the re-upped wire (taxApi + the
// item types + the additive summary keys), the desk's word (the ONE-home
// seed, the UPPERCASE vocabulary, the cast-free typing), the
// read-once-on-the-shell landing, the two-address stage seed, the
// SHADE-SPLIT wearing (both modes + the honesty bounds with the
// 500-prefix substring collision bounded), the schema-honest badge map,
// the lens-aware empty voice, the typed chooser, the fixture world, and
// the constitution's twenty-third row.
// THE OD LAW: bytes, not memory.
import { readFileSync, existsSync } from 'node:fs';

let pass = 0, fail = 0;
const ok = (name, cond) => {
  if (cond) { pass++; console.log(`  ok  ${name}`); }
  else { fail++; console.error(`x FAIL ${name}`); }
};
const read = (p) => readFileSync(p, 'utf8');

const DESK = read('src/app/(shell)/tabs/tax-tab.tsx');
const HOME = read('src/lib/tab-url.ts');
const SUITE = read('src/tests/tax-type-deep-link-v2382.test.ts');
const CONSTITUTION = read('src/tests/transfer-status-deep-link-v2357.test.ts');
const STRESS = read('src/tests/family-registry-stress-v2370.test.ts');
const FEED = read('src/lib/whats-new.ts');
const API = read('src/lib/api.ts');
const CONFIG = read('src/lib/app-config.ts');
const STORES = read('src/lib/stores.ts');
const PRELOAD = read('src/lib/tab-preload.ts');
const MAIN_APP = read('src/components/app/main-app.tsx');
const LINKS = read('src/lib/workspace/links.ts');
const pkg = JSON.parse(read('package.json'));
const version = read('VERSION').trim();

console.log('— the revival\u2019s door —');
ok('TAB_CONFIG CARRIES THE DESK WITH THE WIRE\u2019S OWN TRIO',
  CONFIG.includes("{ id: 'tax', label: 'Tax', icon: Calculator, roles: ['SUPER_ADMIN', 'STORE_OWNER', 'ACCOUNTANT'] }"));
ok('THE GROUP SEAT (Compliance & System, right after etims)',
  CONFIG.includes("{ label: 'Compliance & System', ids: ['etims', 'tax', 'reports', 'data-exports', 'security', 'admin', 'system-health'] }"));
ok('THE UNION, LOADER, SWITCH AND LINKS ALL AGREE',
  STORES.includes("'etims' | 'tax' |")
  && PRELOAD.includes("tax: () => import('../app/(shell)/tabs/tax-tab'),")
  && MAIN_APP.includes('const LazyTaxTab = lazy(TAB_LOADERS.tax);')
  && MAIN_APP.includes(`case 'tax': return <SectionErrorBoundary sectionName="Tax"><Suspense fallback={<TabLoadingFallback />}><LazyTaxTab /></Suspense></SectionErrorBoundary>;`)
  && LINKS.includes("'people-payroll', 'etims', 'tax', 'debt-management', 'debt-plans',"));
ok('THE DESK DEFAULT-EXPORTS ITS COMPONENT',
  DESK.includes('export default function TaxTab()'));

console.log('— the revival\u2019s wire —');
ok('TAXAPI SPEAKS THE LIVE ROUTES',
  API.includes('export const taxApi = {')
  && API.includes("return request<TaxCategoryItem[]>(`/tax/categories?${query.toString()}`);")
  && API.includes("return request<TaxFilingItem[]>(`/tax/filings?${query.toString()}`);"));
ok('THE ITEM TYPES EXIST',
  API.includes('export interface TaxCategoryItem {')
  && API.includes('export interface TaxFilingItem {')
  && API.includes('export interface TaxRateItem {')
  && API.includes("export type TaxFilingStatus = 'DRAFT' | 'FILED' | 'ACCEPTED' | 'REJECTED' | 'AMENDED';"));
ok('THE SUMMARY RIDES AS ADDITIVE OPTIONAL KEYS (the house law)',
  API.includes("v2.382.0 THE TAXMAN'S LEDGER SUMMARY")
  && API.includes('    totalSales?: number;'));

console.log('— the home —');
ok('THE LAW DOC CARRIES THE TWENTY-THIRD WORD',
  HOME.includes('v2.382.0 — THE PROMISE KEPT, THE TWENTY-THIRD WORD')
  && HOME.includes('`tax-type`'));
ok('THE PARSERS STAND (the one home, zero new bytes of law)',
  HOME.includes('export function parseInitialNamedMember')
  && HOME.includes('export function parseInitialStage'));

console.log('— the desk —');
ok('THE ONE-HOME SEED (never a local parser)',
  DESK.includes("parseInitialNamedMember(window.location.search, 'tax-type', TAX_TYPE_FILTERS, 'all')"));
ok('THE UPPERCASE VOCABULARY IS THE DESK\u2019S OWN',
  DESK.includes("export const TAX_TYPE_FILTERS = ['all', 'VAT', 'WHT', 'INCOME_TAX', 'TURNOVER_TAX'] as const;"));
ok('THE SEED IS CAST-FREE (the generic parser IS the union)',
  DESK.includes('function initialTaxType(): TaxTypeFilter {')
  && !DESK.includes('initialTaxType() as')
  && !DESK.includes('initialTaxType as unknown'));
ok('THE LANDING IS READ ONCE ON THE SHELL (the shell-seed law)',
  DESK.includes('const [landedTaxType] = useState<TaxTypeFilter>(initialTaxType);')
  && DESK.includes('const [taxLandingLive, setTaxLandingLive] = useState(true);')
  && DESK.includes('const [filingTypeFilter, setFilingTypeFilter] = useState<TaxTypeFilter>(landedTaxType);')
  && DESK.includes('THE LANDING IS READ ONCE ON THE SHELL'));
ok('THE TWO-ADDRESS STAGE SEED',
  DESK.includes("parseInitialStage(window.location.search, TAX_SUB_TABS, 'filings', landed, 'categories')")
  && DESK.includes('initialTaxStage(landedTaxType !== \'all\')'));
ok('THE WORD FILTERS THE LEDGER (the query feed)',
  DESK.includes("filingType: filingTypeFilter !== 'all' ? filingTypeFilter : undefined,"));
ok('THE TYPED CHOOSER IS THE SELECT\u2019S ONE VOICE',
  (DESK.match(/onValueChange=\{chooseFilingType\}/g) || []).length === 1
  && !DESK.includes('onValueChange={setFilingTypeFilter}'));

console.log('— the chip —');
ok('THE SHADE-SPLIT WEARING IN BOTH MODES (the twenty-third family)',
  DESK.includes('border-orange-300 bg-orange-100 text-orange-700')
  && DESK.includes('dark:border-orange-500/30 dark:bg-orange-500/10 dark:text-orange-300'));
ok('THE DEEPER ORANGE IS THE CHIP\u2019S ALONE (the honesty bounds, the 500-prefix collision bounded)',
  DESK.includes('bg-amber-100 text-amber-700')
  && !DESK.includes('border-orange-200')
  && (DESK.match(/bg-orange-50(?![0-9])/g) || []).length === 0
  && (DESK.match(/bg-orange-100 text-orange-700/g) || []).length === 1);
ok('THE CHIP NAMES THE WORD AND SITS BEFORE THE SELECT',
  DESK.includes('landed ?tax-type={landedTaxType}')
  && DESK.includes('data-testid="tax-type-landing-word"')
  && DESK.indexOf('data-testid="tax-type-landing-word"') < DESK.indexOf('<Select value={filingTypeFilter} onValueChange={chooseFilingType}>'));
ok('THE TWO RETIREMENT VOICES',
  DESK.slice(DESK.indexOf('const chooseFilingType'), DESK.indexOf('const chooseFilingType') + 220).includes('setTaxLandingLive(false);')
  && DESK.includes("setFilingTypeFilter('all');\n                  setTaxLandingLive(false);"));

console.log('— the schema\u2019s own vocabulary —');
ok('THE BADGE MAP SPEAKS THE WIRE\u2019S FIVE FACES',
  DESK.includes("ACCEPTED: { label: 'Accepted', className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },")
  && DESK.includes("REJECTED: { label: 'Rejected', className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },")
  && DESK.includes("AMENDED: { label: 'Amended', className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },"));
ok('THE STALE FACES ARE GONE',
  !DESK.includes('APPROVED:')
  && !DESK.includes("label: 'Paid'")
  && !DESK.includes("label: 'Late'")
  && !DESK.includes("f.status === 'LATE'"));
ok('THE RATE-HISTORY ANNOTATION RIDES THE WIRE\u2019S OWN SHAPE',
  DESK.includes('cat.taxRates.map((rate: TaxRateItem) => (')
  && !DESK.includes('(rate: { id: string; name: string; rate: number })'));

console.log('— the styling detail —');
ok('THE LENS-AWARE EMPTY VOICE (names the lens, offers the hand)',
  DESK.includes('data-testid="tax-type-empty-lens"')
  && DESK.includes('No <span className="font-medium text-foreground">{filingTypeFilter}</span> filings in this lens yet.')
  && DESK.includes('Clear the type lens'));
ok('THE LENSED ANSWER PRECEDES THE GENERIC EMPTY',
  DESK.indexOf('data-testid="tax-type-empty-lens"') < DESK.indexOf('No tax filings found'));

console.log('— the fixture world —');
ok('THE FIXTURE SCRIPT EXISTS AND REFUSES THE WRONG WORLD',
  existsSync('scripts/seed-kra-fixtures.mjs')
  && read('scripts/seed-kra-fixtures.mjs').includes('NODE_ENV must be development (the seed-password law)'));
ok('THE REGISTRY WALKS TWENTY-THREE ROWS',
  CONSTITUTION.includes('(twenty-three words, twenty-one desks)')
  && CONSTITUTION.includes("{ word: 'tax-type', desk: 'src/app/(shell)/tabs/tax-tab.tsx', family: 'border-orange-300', suite: 'src/tests/tax-type-deep-link-v2382.test.ts' }")
  && CONSTITUTION.includes("'TWENTY-THIRD'"));
ok('THE STRESS DERIVES THE NEW ARITHMETIC (the shade-split grammar)',
  STRESS.includes('expect(rows.length).toBe(23);')
  && STRESS.includes("'ly-type', 'et-status', 'tax-type',")
  && STRESS.includes('.toBe(21);')
  && STRESS.includes('.toBe(23);')
  && STRESS.includes("(border-[a-z]+-(?:200|300))")
  && STRESS.includes("const light = m?.[2] === '300' ? '100' : '50';"));
ok('THE FEED CARRIES THE ROUND',
  FEED.includes("version: '2.382.0',")
  && FEED.includes('?tax-type='));

console.log('— the suites —');
ok('THE ROUND\u2019S SUITE EXISTS AND SPEAKS THE ROUND',
  SUITE.includes("THE TAX DESK'S OWN WORD (v2.382.0)"));

console.log('— the release slots —');
ok('pkg version = VERSION', pkg.version === version);
ok('VERSION SPEAKS THE ROUND', version === '2.382.0');
ok('THE VERIFY WIRE IS LAID', Boolean(pkg.scripts['verify:v2-382-0']));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
