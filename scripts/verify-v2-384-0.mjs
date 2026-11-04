#!/usr/bin/env node
// verify-v2-384-0.mjs — the round's FEATURE gate (v2.384.0 "the reports
// desk answers the address bar"). The release MECHANICS live in
// verify-current.mjs. This script pins only what is NEW this round: the
// shape word on the always-rendered lens (parseInitialNamedMember +
// REP_TYPE_FILTERS, the ONE home), the desk's third shell-seed speaker
// (the landing flag, the write-once landed capture, the cast-free
// typing), the retirement door (EVERY hand change rides chooseReportType),
// the lime shade-split wearing (both modes + the pair-byte honesty
// bounds), the position law, the lockfile generation legs, and the
// constitution's twenty-fifth row.
// THE OD LAW: bytes, not memory.
import { readFileSync, existsSync } from 'node:fs';

let pass = 0, fail = 0;
const ok = (name, cond) => {
  if (cond) { pass++; console.log(`  ok  ${name}`); }
  else { fail++; console.error(`x FAIL ${name}`); }
};
const read = (p) => readFileSync(p, 'utf8');

const DESK = read('src/app/(shell)/tabs/reports-tab.tsx');
const HOME = read('src/lib/tab-url.ts');
const SUITE = read('src/tests/rep-type-deep-link-v2384.test.ts');
const CONSTITUTION = read('src/tests/transfer-status-deep-link-v2357.test.ts');
const STRESS = read('src/tests/family-registry-stress-v2370.test.ts');
const FEED = read('src/lib/whats-new.ts');
const GUARD = read('scripts/check-lockfile-drift.mjs');
const pkg = JSON.parse(read('package.json'));
const version = read('VERSION').trim();

console.log('— the home —');
ok('THE LAW DOC CARRIES THE TWENTY-FIFTH WORD',
  HOME.includes('v2.384.0 — THE PROMISE KEPT, THE TWENTY-FIFTH WORD')
  && HOME.includes('`rep-type`'));
ok('THE VOCABULARY LIVES IN THE ONE HOME',
  HOME.includes('export const REP_TYPE_FILTERS')
  && HOME.includes("'rental_performance'")
  && HOME.includes("'trends'"));
ok('THE ELDERS STAY TOUCHED-AND-WHOLE (the shape law, the stage law)',
  HOME.includes('export function parseInitialNamedMember')
  && HOME.includes('export function parseInitialStage')
  && HOME.includes('export const TAX_PERIOD_SHAPE'));

console.log('— the desk\u2019s word —');
ok('THE ONE-HOME SEED (never a local parser)',
  DESK.includes("parseInitialNamedMember(window.location.search, 'rep-type', REP_TYPE_FILTERS, 'sales')"));
ok('THE THIRD SHELL-SEED SPEAKER (the read-once law, write-once landed capture)',
  DESK.includes('const [landedRepType] = useState<ReportType>(initialReportType);')
  && DESK.includes('const [reportType, setReportType] = useState<ReportType>(initialReportType);')
  && DESK.includes('const [repLandingLive, setRepLandingLive] = useState(true);'));
ok('THE SEED IS CAST-FREE',
  DESK.includes('function initialReportType(): ReportType {')
  && !DESK.includes('initialReportType() as')
  && !DESK.includes('initialReportType as unknown'));
ok('THE RETIREMENT DOOR (every hand change rides one door)',
  DESK.includes('const chooseReportType = useCallback((value: ReportType) => {')
  && DESK.includes("setReportType((prev) => {")
  && DESK.includes('if (prev !== value) setRepLandingLive(false);'));
ok('NO BARE SHAPE CHANGE LEFT OUTSIDE THE DOOR',
  !/onClick=\{\(\) => setReportType\(/.test(DESK));
ok('THE POSITION LAW (chip before the lens it landed into)',
  DESK.indexOf('data-testid="rep-type-landing-word"') > -1
  && DESK.indexOf('data-testid="rep-type-landing-word"') < DESK.indexOf('<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">'));

console.log('— the shade-split\u2019s third application —');
ok('THE LIME PAIR AT THE 300/100 STOREY (both modes)',
  DESK.includes('border-lime-300 bg-lime-100 text-lime-700')
  && DESK.includes('dark:border-lime-500/30 dark:bg-lime-500/10 dark:text-lime-300'));
ok('THE PAIR-BYTE HONESTY BOUNDS (no elder chip hue speaks on this desk)',
  !DESK.includes('border-orange-300 bg-orange-100')
  && !DESK.includes('border-teal-300 bg-teal-100')
  && !DESK.includes('border-lime-200'));
ok('THE BADGE CENSUS (the desk\u2019s own badges never speak lime)',
  DESK.includes('bg-amber-50 dark:bg-amber-950/30')
  && DESK.includes('bg-green-100 text-green-700')
  && DESK.includes('bg-blue-100 text-blue-700')
  && DESK.includes('bg-red-100 text-red-700'));

console.log('— the lockfile generation legs —');
ok('THE GUARD SPEAKS THE GENERATION LEGS',
  GUARD.includes('THE GENERATION LEGS')
  && GUARD.includes('root version')
  && GUARD.includes('range drift'));

console.log('— the constitution —');
ok('THE REGISTRY WALKS TWENTY-FIVE ROWS',
  CONSTITUTION.includes('(twenty-five words, twenty-two desks)')
  && CONSTITUTION.includes("{ word: 'rep-type', desk: 'src/app/(shell)/tabs/reports-tab.tsx', family: 'border-lime-300', suite: 'src/tests/rep-type-deep-link-v2384.test.ts' }")
  && CONSTITUTION.includes("'TWENTY-FIFTH'"));
ok('THE STRESS DERIVES THE NEW ARITHMETIC',
  STRESS.includes('expect(rows.length).toBe(25);')
  && STRESS.includes("'rep-type',")
  && STRESS.includes('.toBe(25);')
  && STRESS.includes("(border-[a-z]+-(?:200|300))")
  && STRESS.includes("const light = m?.[2] === '300' ? '100' : '50';"));

console.log('— the feed —');
ok('THE FEED CARRIES THE ROUND',
  FEED.includes("version: '2.384.0',")
  && FEED.includes('?rep-type='));

console.log('— the suites —');
ok('THE ROUND\u2019S SUITE EXISTS AND SPEAKS THE ROUND',
  existsSync('src/tests/rep-type-deep-link-v2384.test.ts')
  && SUITE.includes("THE REPORTS DESK'S OWN WORD (v2.384.0)"));

console.log('— the release slots —');
ok('pkg version = VERSION', pkg.version === version);
ok('VERSION SPEAKS THE ROUND', version === '2.384.0');
ok('THE VERIFY WIRE IS LAID', Boolean(pkg.scripts['verify:v2-384-0']));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
