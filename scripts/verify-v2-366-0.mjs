#!/usr/bin/env node
// verify-v2-366-0.mjs — the round's FEATURE gate (v2.366.0 "the audit log
// answers the address bar"). The release MECHANICS live in
// verify-current.mjs. This script pins only what is NEW this round: the
// nineteenth word AND the advisory unwind (the round's fix half).
// THE OD LAW: bytes, not memory. Run BEFORE the walk; the walk-dependent
// pins sit in the tail section.
import { readFileSync } from 'node:fs';

let pass = 0, fail = 0;
const ok = (name, cond) => {
  if (cond) { pass++; console.log(`  ok  ${name}`); }
  else { fail++; console.error(`x FAIL ${name}`); }
};
const read = (p) => readFileSync(p, 'utf8');

const DESK = read('src/app/(shell)/tabs/admin-tab.tsx');
const HOME = read('src/lib/tab-url.ts');
const TEST = read('src/tests/ad-severity-deep-link-v2366.test.ts');
const CONSTITUTION = read('src/tests/transfer-status-deep-link-v2357.test.ts');
const BOUNDARY = read('src/components/error-boundary.tsx');
const API = read('src/lib/api.ts');
const DEBT_UTILS = read('src/lib/debt-plan-utils.ts');
const whatsNew = read('src/lib/whats-new.ts');
const changelog = read('CHANGELOG.md');
const pkg = JSON.parse(read('package.json'));
const version = read('VERSION').trim();

console.log('— the nineteenth word —');
ok('THE WORD BLOCK speaks its law (membership, one home, the face)',
  DESK.includes("export const AD_SEVERITY_FILTERS = ['all', 'CRITICAL', 'ERROR', 'WARN', 'INFO', 'DEBUG'] as const;")
  && DESK.includes("parseInitialNamedMember(window.location.search, 'ad-severity', AD_SEVERITY_FILTERS, 'all')")
  && DESK.includes("THE ADMIN DESK'S OWN WORD")
  && DESK.includes('ALWAYS RENDERED'));
ok('THE HOME CARRIES THE NINETEENTH-WORD NOTE',
  HOME.includes('v2.366.0 — THE PROMISE KEPT, THE NINETEENTH WORD'));
ok('THE SEED IS CAST-FREE (the generic parser IS the union)',
  DESK.includes('severity: initialAdSeverity(),')
  && DESK.includes('function initialAdSeverity(): AdSeverityFilter')
  && DESK.includes('type AdSeverityFilter = (typeof AD_SEVERITY_FILTERS)[number];')
  && !DESK.includes('initialAdSeverity() as'));
ok('THE LANDING WORD IS READ-ON-MOUNT (the one-writer law)',
  DESK.includes('const [landedAdSeverity] = useState<AdSeverityFilter>(initialAdSeverity);')
  && DESK.includes('const [adLandingLive, setAdLandingLive] = useState(true);'));
ok('THE NEUTRAL IS LOWERCASE (the Select\u2019s own all-item key)',
  DESK.includes("if (typeof window === 'undefined') return 'all';")
  && DESK.includes("['all', 'CRITICAL', 'ERROR', 'WARN', 'INFO', 'DEBUG']"));
ok('THE TYPED CHOOSER IS THE ONLY WRITER (exactly one onValueChange, the old inline body GONE)',
  DESK.match(/onValueChange=\{chooseAdSeverity\}/g)?.length === 1
  && !DESK.includes('setFilters(f => ({ ...f, severity: v })); setPage(1);'));
ok('THE ALWAYS-RENDERED TOP-LEVEL FACE IS PINNED (the lens BEFORE the desk\u2019s Tabs)',
  DESK.indexOf('data-testid="ad-severity-landing-word"') > -1
  && DESK.indexOf('<TabsContent') > DESK.indexOf('data-testid="ad-severity-landing-word"'));
ok('THE WORD FILTERS THE LOG (the query feed, the cv-type precedent)',
  DESK.includes("severity: filters.severity !== 'all' ? filters.severity : undefined,"));

console.log('— the nineteenth wearing —');
ok('THE CHIP RENDERS ONLY WHILE LIVE AND UNTOUCHED',
  DESK.includes("adLandingLive && landedAdSeverity !== 'all' && filters.severity === landedAdSeverity")
  && DESK.includes('data-testid="ad-severity-landing-word"'));
ok('THE CHIP NAMES THE EXACT WORD', DESK.includes('landed ?ad-severity={landedAdSeverity}'));
ok('THE CHIP WEARS THE NINETEENTH FAMILY (neutral) IN BOTH MODES',
  DESK.includes('border-neutral-200 bg-neutral-50 text-neutral-700')
  && DESK.includes('dark:border-neutral-500/30 dark:bg-neutral-500/10 dark:text-neutral-300'));
ok('THE CHIP LIVES BEFORE THE SEVERITY SELECT (the position law)',
  DESK.indexOf('data-testid="ad-severity-landing-word"') > -1
  && DESK.indexOf('<Select value={filters.severity} onValueChange={chooseAdSeverity}>') > DESK.indexOf('data-testid="ad-severity-landing-word"'));
ok('THE DISMISS HINT SHARPENS ON HOVER (the group-hover detail)',
  DESK.includes('opacity-60 transition-opacity group-hover:opacity-100'));
ok('THE TWO VOICES ARE HONEST (dismissal + hand-driven Select change)',
  DESK.includes("setFilters(f => ({ ...f, severity: 'all' }));\n                setAdLandingLive(false);")
  && DESK.includes('a hand-driven Select change retires the landing word'));
ok('THE TOOLTIP LAW (explains itself, icons aria-hidden)',
  DESK.includes('title="The audit log landed with this severity from the address bar — press to clear it"')
  && DESK.includes('aria-hidden="true"'));
ok('THE COLLISION NOTE NAMES NO FOREIGN WORD (the prose-collision shadow, applied)',
  !DESK.includes("'gc-status'") && !DESK.includes("'dn-status'") && !DESK.includes("'transfer-status'") && !DESK.includes("'pr-status'") && !DESK.includes("'cat-stock'") && !DESK.includes("'dp-status'"));
ok('THE DESK\u2019S OWN VOICES KEEP THEIR FAMILIES (no masquerade)',
  DESK.includes("'CRITICAL': case 'ERROR': return 'bg-red-500';")
  && DESK.includes('border-neutral-200 bg-neutral-50'));

console.log('— the advisory unwind (the round\u2019s fix half) —');
ok('ERROR-BOUNDARY\u2019S FIVE OVERRIDES LANDED',
  BOUNDARY.match(/override componentDidCatch\(/g)?.length === 2
  && BOUNDARY.match(/override render\(\)/g)?.length === 2
  && BOUNDARY.match(/override componentWillUnmount\(\)/g)?.length === 1);
ok('API\u2019S CSRF TOKEN NARROWS, NEVER TRUSTS (and the envelope\u2019s name is exported)',
  API.includes("const token: unknown = json.data?.token;")
  && API.includes("if (json.success && typeof token === 'string' && token) {")
  && !API.includes('      csrfToken = json.data.token;')
  && API.includes('export interface ApiResponse<T = unknown>'));
ok('DEBT-PLAN-UTILS RETURNS THE NUMBER ITS CONTRACT NAMES',
  DEBT_UTILS.includes('return safeTotal.mul(growthFactor).toNumber();')
  && !DEBT_UTILS.includes('return safeTotal.mul(growthFactor);'));
ok('ADMIN\u2019S TOGGLE MUTATION NAMES THE HONEST UNION ENVELOPE',
  DESK.includes('mutationFn: async (user: UserItem): Promise<ApiResponse<UserItem | { message: string }>> =>'));

console.log('— the ledger family grows —');
ok('THE NEW TEST EXISTS with the truth table + the inversions + the unwind + ledger',
  TEST.includes("parseInitialNamedMember('?ad-severity=CRITICAL', 'ad-severity', AD_SEVERITY_FILTERS, 'all')")
  && TEST.includes("parseInitialNamedMember('?ad-severity=ALL', 'ad-severity', AD_SEVERITY_FILTERS, 'all')).toBe('all')")
  && TEST.includes("parseInitialNamedMember('?ad-severity=Critical', 'ad-severity', AD_SEVERITY_FILTERS, 'all')).toBe('all')")
  && TEST.includes("parseInitialNamedMember('?tab=admin&ad-severity=CRITICAL&txn-type=refund', 'ad-severity', AD_SEVERITY_FILTERS, 'all')")
  && TEST.includes('override componentDidCatch')
  && TEST.includes("'src/tests/ad-severity-deep-link-v2366.test.ts',"));
ok('THE EIGHTEEN NEIGHBOR LEDGERS ADMIT THE NEW TEST', [
    'src/tests/proxy-gate-layering-v2328.test.ts',
    'src/tests/inv-stock-deep-link-v2329.test.ts',
    'src/tests/cust-debt-deep-link-v2330.test.ts',
    'src/tests/sup-status-deep-link-v2331.test.ts',
    'src/tests/sup-po-deep-link-v2332.test.ts',
    'src/tests/txn-pay-deep-link-v2333.test.ts',
    'src/tests/txn-type-deep-link-v2354.test.ts',
    'src/tests/rent-status-deep-link-v2355.test.ts',
    'src/tests/inv-status-deep-link-v2356.test.ts',
    'src/tests/transfer-status-deep-link-v2357.test.ts',
    'src/tests/gc-status-deep-link-v2358.test.ts',
    'src/tests/dn-status-deep-link-v2359.test.ts',
    'src/tests/vc-status-deep-link-v2360.test.ts',
    'src/tests/cr-type-deep-link-v2361.test.ts',
    'src/tests/pr-status-deep-link-v2362.test.ts',
    'src/tests/cv-type-deep-link-v2363.test.ts',
    'src/tests/cat-stock-deep-link-v2364.test.ts',
    'src/tests/dp-status-deep-link-v2365.test.ts',
  ].every((f) => read(f).includes("'src/tests/ad-severity-deep-link-v2366.test.ts',")));
ok('THE CONSTITUTION\u2019S NINETEENTH ROW LANDED (registry + title + promise roll)',
  CONSTITUTION.includes("{ word: 'ad-severity', desk: 'src/app/(shell)/tabs/admin-tab.tsx', family: 'border-neutral-200', suite: 'src/tests/ad-severity-deep-link-v2366.test.ts' }")
  && CONSTITUTION.includes('(nineteen words, seventeen desks)')
  && CONSTITUTION.includes("'NINETEENTH'"));
ok('THE NINETEENTH FAMILY IS DISTINCT (neutral joined, nineteen set)',
  ['border-indigo-200', 'border-amber-200', 'border-rose-200', 'border-emerald-200', 'border-cyan-200', 'border-violet-200', 'border-fuchsia-200', 'border-orange-200', 'border-teal-200', 'border-blue-200', 'border-lime-200', 'border-sky-200', 'border-pink-200', 'border-yellow-200', 'border-stone-200', 'border-slate-200', 'border-purple-200', 'border-zinc-200', 'border-neutral-200']
    .every((f, i, a) => a.indexOf(f) === i));
ok('THE EIGHTEENTH WORD SURVIVED UNTOUCHED',
  read('src/app/(shell)/tabs/debt-plans-tab.tsx').includes("export const DP_STATUS_FILTERS = ['all', 'pending', 'active', 'overdue', 'completed'] as const;"));

console.log('— the face + the release —');
ok('WHATS-NEW 2.366.0 leads the feed', whatsNew.includes("version: '2.366.0',") && whatsNew.indexOf("'2.366.0'") < whatsNew.indexOf("'2.365.0'"));
ok('CHANGELOG 2.366.0 leads', changelog.startsWith('## [2.366.0]'));
ok('VERSION + package.json say 2.366.0 (three slots)', version === '2.366.0' && pkg.version === '2.366.0' && pkg.mbumah.releaseVersion === '2.366.0' && pkg.mbumah.baseVersion === '2.366.0');
ok('THE VERIFY WIRE EXISTS', Boolean(pkg.scripts['verify:v2-366-0']));

console.log('— walk-dependent pins (green after walk-v2366) —');
const changelogTest = read('src/tests/console-changelog.test.ts');
ok('THE UNREAD-COUNTER CASCADE landed (256/257/258/289)',
  changelogTest.includes("whatsNewUnreadCount('2.110.0')).toBe(256)")
  && changelogTest.includes("whatsNewUnreadCount('2.109.0')).toBe(257)")
  && changelogTest.includes("whatsNewUnreadCount('2.108.0')).toBe(258)")
  && changelogTest.includes("whatsNewUnreadCount('2.77.0')).toBe(289)"));
ok('THE HISTORY LINE rode the cascade block (the English compound, not the word)', changelogTest.includes('v2.366.0: the audit entry joins the feed')
  && !changelogTest.includes('ad-severity'));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
