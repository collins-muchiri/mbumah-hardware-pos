#!/usr/bin/env node
// verify-v2-383-0.mjs — the round's FEATURE gate (v2.383.0 "the taxman's
// ledger answers by the month"). The release MECHANICS live in
// verify-current.mjs. This script pins only what is NEW this round: the
// shape parser (parseInitialNamedPeriod + TAX_PERIOD_SHAPE, the ONE
// shape home), the desk's second shell-seed speaker (the landing flag,
// the seeded filter, the cast-free typing), the two-address extension
// (a landed type OR period word implies the filings stage), the
// shape-honest query feed, the teal shade-split wearing (both modes +
// the honesty bounds with the 500-prefix collision bounded), the month
// picker, the period lens's own empty voice, the legend's ghost-face
// retirement, and the constitution's twenty-fourth row.
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
const SUITE = read('src/tests/tax-period-deep-link-v2383.test.ts');
const CONSTITUTION = read('src/tests/transfer-status-deep-link-v2357.test.ts');
const STRESS = read('src/tests/family-registry-stress-v2370.test.ts');
const FEED = read('src/lib/whats-new.ts');
const pkg = JSON.parse(read('package.json'));
const version = read('VERSION').trim();

console.log('— the home —');
ok('THE LAW DOC CARRIES THE TWENTY-FOURTH WORD',
  HOME.includes('v2.383.0 — THE PROMISE KEPT, THE TWENTY-FOURTH WORD')
  && HOME.includes('`tax-period`'));
ok('THE SHAPE PARSER STANDS (the ONE shape home)',
  HOME.includes('export const TAX_PERIOD_SHAPE = /^\\d{4}-(0[1-9]|1[0-2])$/;')
  && HOME.includes('export function parseInitialNamedPeriod'));
ok('THE ELDERS STAY TOUCHED-AND-WHOLE (the shape law, the gait law)',
  HOME.includes('export function parseInitialNamedMember')
  && HOME.includes('export function parseInitialStage'));

console.log('— the desk\u2019s second word —');
ok('THE ONE-HOME SEED (never a local parser)',
  DESK.includes("parseInitialNamedPeriod(window.location.search, 'tax-period', '')"));
ok('THE SECOND SHELL-SEED SPEAKER (the read-once law, own flag, own chip)',
  DESK.includes('const [landedTaxPeriod] = useState<string>(initialTaxPeriod);')
  && DESK.includes('const [taxPeriodLandingLive, setTaxPeriodLandingLive] = useState(true);')
  && DESK.includes('const [filingPeriodFilter, setFilingPeriodFilter] = useState(landedTaxPeriod);')
  && DESK.includes('THE SECOND SHELL-SEED SPEAKER'));
ok('THE SEED IS CAST-FREE',
  DESK.includes('function initialTaxPeriod(): string {')
  && !DESK.includes('initialTaxPeriod() as')
  && !DESK.includes('initialTaxPeriod as unknown'));
ok('THE TWO-ADDRESS SEED EXTENDS (a landed type OR period word implies the stage)',
  DESK.includes("initialTaxStage(landedTaxType !== 'all' || landedTaxPeriod !== '')"));
ok('THE SHAPE-HONEST QUERY FEED (the wire never sees a half-word)',
  DESK.includes('const periodLensActive = TAX_PERIOD_SHAPE.test(filingPeriodFilter);')
  && DESK.includes('filingPeriod: periodLensActive ? filingPeriodFilter : undefined,')
  && DESK.includes("queryKey: ['tax-filings', currentStoreId, filingStatusFilter, filingTypeFilter, filingPeriodFilter]"));
ok('THE TYPED CHOOSER IS THE PICKER\u2019S ONE VOICE',
  (DESK.match(/onChange=\{\(e\) => chooseFilingPeriod\(e\.target\.value\)\}/g) || []).length === 1
  && !DESK.includes('onChange={(e) => setFilingPeriodFilter('));

console.log('— the chip —');
ok('THE SHADE-SPLIT WEARING IN BOTH MODES (the twenty-fourth family)',
  DESK.includes('border-teal-300 bg-teal-100 text-teal-700')
  && DESK.includes('dark:border-teal-500/30 dark:bg-teal-500/10 dark:text-teal-300'));
ok('THE DEEPER TEAL IS THE CHIP\u2019S ALONE (the honesty bounds, the 500-prefix collision bounded)',
  !DESK.includes('border-teal-200')
  && (DESK.match(/bg-teal-50(?![0-9])/g) || []).length === 0
  && (DESK.match(/bg-teal-100 text-teal-700/g) || []).length === 1);
ok('THE CHIP NAMES THE WORD AND SITS BEFORE THE PICKER',
  DESK.includes('landed ?tax-period={landedTaxPeriod}')
  && DESK.includes('data-testid="tax-period-landing-word"')
  && DESK.indexOf('data-testid="tax-period-landing-word"') < DESK.indexOf('data-testid="tax-period-filter"'));
ok('THE TWO RETIREMENT VOICES (independent chips)',
  DESK.slice(DESK.indexOf('const chooseFilingPeriod'), DESK.indexOf('const chooseFilingPeriod') + 220).includes('setTaxPeriodLandingLive(false);')
  && DESK.includes("setFilingPeriodFilter('');\n                  setTaxPeriodLandingLive(false);"));
ok('THE MONTH PICKER IS LABELED',
  DESK.includes('type="month"')
  && DESK.includes('aria-label="Filter filings by period"'));

console.log('— the styling detail —');
ok('THE PERIOD LENS\u2019S OWN EMPTY VOICE (names the month, offers the hand)',
  DESK.includes('data-testid="tax-period-empty-lens"')
  && DESK.includes('No <span className="font-medium text-foreground">{filingPeriodFilter}</span> filings in this lens yet.')
  && DESK.includes('Clear the period lens'));
ok('THE BRANCH LAW: type voice, period voice, generic',
  DESK.indexOf('data-testid="tax-type-empty-lens"') < DESK.indexOf('data-testid="tax-period-empty-lens"')
  && DESK.indexOf('data-testid="tax-period-empty-lens"') < DESK.indexOf('No tax filings found'));

console.log('— the legend\u2019s ghost faces —');
ok('THE LEGEND WALKS THE SCHEMA\u2019S OWN FIVE',
  DESK.includes('Filing Status Workflow')
  && (() => { const b = DESK.slice(DESK.indexOf('Filing Status Workflow'), DESK.indexOf('Filing Status Workflow') + 1400); return b.includes('Draft') && b.includes('Filed') && b.includes('Accepted') && b.includes('Amended') && b.includes('Rejected'); })());
ok('THE GHOST FACES ARE GONE FROM THE DESK',
  !DESK.includes('>Approved<') && !DESK.includes('>Paid<') && !DESK.includes('>Late<'));

console.log('— the elder word\u2019s regression (the type lens keeps its seat) —');
ok('THE TYPE SEED AND CHIP STAND UNTOUCHED',
  DESK.includes("parseInitialNamedMember(window.location.search, 'tax-type', TAX_TYPE_FILTERS, 'all')")
  && DESK.includes('border-orange-300 bg-orange-100 text-orange-700')
  && DESK.includes('data-testid="tax-type-landing-word"'));

console.log('— the constitution —');
ok('THE REGISTRY WALKS TWENTY-FOUR ROWS',
  CONSTITUTION.includes('(twenty-four words, twenty-one desks)')
  && CONSTITUTION.includes("{ word: 'tax-period', desk: 'src/app/(shell)/tabs/tax-tab.tsx', family: 'border-teal-300', suite: 'src/tests/tax-period-deep-link-v2383.test.ts' }")
  && CONSTITUTION.includes("'TWENTY-FOURTH'"));
ok('THE STRESS DERIVES THE NEW ARITHMETIC',
  STRESS.includes('expect(rows.length).toBe(24);')
  && STRESS.includes("'ly-type', 'et-status', 'tax-type', 'tax-period',")
  && STRESS.includes('.toBe(24);')
  && STRESS.includes("(border-[a-z]+-(?:200|300))")
  && STRESS.includes("const light = m?.[2] === '300' ? '100' : '50';"));

console.log('— the feed —');
ok('THE FEED CARRIES THE ROUND',
  FEED.includes("version: '2.383.0',")
  && FEED.includes('?tax-period=2026-10'));

console.log('— the suites —');
ok('THE ROUND\u2019S SUITE EXISTS AND SPEAKS THE ROUND',
  existsSync('src/tests/tax-period-deep-link-v2383.test.ts')
  && SUITE.includes("THE TAX DESK'S SECOND WORD (v2.383.0)"));

console.log('— the release slots —');
ok('pkg version = VERSION', pkg.version === version);
ok('VERSION SPEAKS THE ROUND', version === '2.383.0');
ok('THE VERIFY WIRE IS LAID', Boolean(pkg.scripts['verify:v2-383-0']));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
