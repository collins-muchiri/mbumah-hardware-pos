#!/usr/bin/env node
// verify-v2-367-0.mjs — the round's FEATURE gate (v2.367.0 "the watchtower
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

const DESK = read('src/app/(shell)/tabs/security-tab.tsx');
const HOME = read('src/lib/tab-url.ts');
const TEST = read('src/tests/sec-type-deep-link-v2367.test.ts');
const CONSTITUTION = read('src/tests/transfer-status-deep-link-v2357.test.ts');
const whatsNew = read('src/lib/whats-new.ts');
const changelog = read('CHANGELOG.md');
const pkg = JSON.parse(read('package.json'));
const version = read('VERSION').trim();

console.log('— the nineteenth word —');
ok('THE WORD BLOCK speaks its law (membership, one home, the amendment)',
  DESK.includes("export const SEC_TYPE_FILTERS = ['all', 'RATE_LIMITED', 'BRUTE_FORCE', 'CSRF_FAILED', 'INVALID_INPUT', 'SUSPICIOUS_ACTIVITY', 'ACCOUNT_LOCKED', 'SESSION_HIJACK_ATTEMPT', 'UNAUTHORIZED_ACCESS'] as const;")
  && DESK.includes("parseInitialNamedMember(window.location.search, 'sec-type', SEC_TYPE_FILTERS, 'all')")
  && DESK.includes("THE SECURITY DESK'S OWN WORD")
  && DESK.includes('THE COLLAPSIBLE-FACE AMENDMENT'));
ok('THE HOME CARRIES THE TWENTIETH-WORD NOTE',
  HOME.includes('v2.367.0 — THE PROMISE KEPT, THE TWENTIETH WORD'));
ok('THE SEED IS CAST-FREE (the generic parser IS the union)',
  DESK.includes('const [filterEventType, setFilterEventType] = useState<SecTypeFilter>(initialSecType);')
  && DESK.includes('function initialSecType(): SecTypeFilter')
  && DESK.includes('type SecTypeFilter = (typeof SEC_TYPE_FILTERS)[number];')
  && !DESK.includes('initialSecType() as'));
ok('THE LANDING WORD IS READ-ON-MOUNT (the one-writer law)',
  DESK.includes('const [landedSecType] = useState<SecTypeFilter>(initialSecType);')
  && DESK.includes('const [secLandingLive, setSecLandingLive] = useState(true);'));
ok('THE PANEL SEED READS THE LANDED WORD (the collapsible-face amendment, mounting bytes)',
  DESK.includes("const [showFilters, setShowFilters] = useState<boolean>(() => landedSecType !== 'all');"));
ok('THE NEUTRAL IS LOWERCASE (the Select\u2019s own all-item key)',
  DESK.includes("if (typeof window === 'undefined') return 'all';")
  && DESK.includes("['all', 'RATE_LIMITED', 'BRUTE_FORCE', 'CSRF_FAILED', 'INVALID_INPUT', 'SUSPICIOUS_ACTIVITY', 'ACCOUNT_LOCKED', 'SESSION_HIJACK_ATTEMPT', 'UNAUTHORIZED_ACCESS']"));
ok('THE TYPED CHOOSER IS THE ONLY WRITER (exactly one onValueChange, the bare setter GONE)',
  DESK.match(/onValueChange=\{chooseSecType\}/g)?.length === 1
  && !DESK.includes('onValueChange={setFilterEventType}'));
ok('THE WORD FILTERS THE EVENTS (the query feed, the conversations desk\u2019s precedent)',
  DESK.includes("if (filterEventType && filterEventType !== 'all') params.eventType = filterEventType;"));

console.log('— the nineteenth wearing —');
ok('THE CHIP RENDERS ONLY WHILE LIVE AND UNTOUCHED',
  DESK.includes("secLandingLive && landedSecType !== 'all' && filterEventType === landedSecType")
  && DESK.includes('data-testid="sec-type-landing-word"'));
ok('THE CHIP NAMES THE EXACT WORD', DESK.includes('landed ?sec-type={landedSecType}'));
ok('THE CHIP WEARS THE TWENTIETH FAMILY (gray) IN BOTH MODES + the exhaustion note',
  DESK.includes('border-gray-200 bg-gray-50 text-gray-700')
  && DESK.includes('dark:border-gray-500/30 dark:bg-gray-500/10 dark:text-gray-300')
  && DESK.includes('THE PALETTE-EXHAUSTION AMENDMENT')
  && DESK.includes('A surface is not a voice'));
ok('THE CHIP LIVES INSIDE THE EVENT TYPE BLOCK BEFORE THE SELECT (the position law)',
  DESK.indexOf('>Event Type</Label>') < DESK.indexOf('data-testid="sec-type-landing-word"')
  && DESK.indexOf('data-testid="sec-type-landing-word"') < DESK.indexOf('<Select value={filterEventType} onValueChange={chooseSecType}>'));
ok('THE DISMISS HINT SHARPENS ON HOVER (the group-hover detail)',
  DESK.includes('opacity-60 transition-opacity group-hover:opacity-100'));
ok('THE TWO VOICES ARE HONEST (dismissal + hand-driven Select change)',
  DESK.includes("setFilterEventType('all');\n                      setSecLandingLive(false);")
  && DESK.includes('a hand-driven Select change retires the landing word'));
ok('THE TOOLTIP LAW (explains itself, icons aria-hidden)',
  DESK.includes('title="The watchtower landed with this event type from the address bar — press to clear it"')
  && DESK.includes('aria-hidden="true"'));
ok('THE COLLISION NOTE NAMES NO FOREIGN WORD (the prose-collision shadow, applied)',
  !DESK.includes("'gc-status'") && !DESK.includes("'dn-status'") && !DESK.includes("'transfer-status'") && !DESK.includes("'pr-status'") && !DESK.includes("'cat-stock'") && !DESK.includes("'dp-status'") && !DESK.includes("'ad-severity'"));
ok('THE DESK\u2019S OWN VOICES KEEP THEIR FAMILIES (no masquerade)',
  DESK.includes('bg-amber-500')
  && DESK.includes('border-gray-200 bg-gray-50'));

console.log('— the unwind HELD (last round\u2019s zero, still zero) —');
ok('ERROR-BOUNDARY\u2019S FIVE OVERRIDES SURVIVED',
  read('src/components/error-boundary.tsx').match(/override componentDidCatch\(/g)?.length === 2
  && read('src/components/error-boundary.tsx').match(/override render\(\)/g)?.length === 2
  && read('src/components/error-boundary.tsx').match(/override componentWillUnmount\(\)/g)?.length === 1);
ok('API\u2019S CSRF TOKEN STILL NARROWS',
  read('src/lib/api.ts').includes("if (json.success && typeof token === 'string' && token) {"));

console.log('— the ledger family grows —');
ok('THE NEW TEST EXISTS with the truth table + the inversions + the amendment + ledger',
  TEST.includes("parseInitialNamedMember('?sec-type=BRUTE_FORCE', 'sec-type', SEC_TYPE_FILTERS, 'all')")
  && TEST.includes("parseInitialNamedMember('?sec-type=ALL', 'sec-type', SEC_TYPE_FILTERS, 'all')).toBe('all')")
  && TEST.includes("parseInitialNamedMember('?sec-type=Brute_Force', 'sec-type', SEC_TYPE_FILTERS, 'all')).toBe('all')")
  && TEST.includes("parseInitialNamedMember('?tab=security&sec-type=BRUTE_FORCE&txn-type=refund', 'sec-type', SEC_TYPE_FILTERS, 'all')")
  && TEST.includes("useState<boolean>(() => landedSecType !== 'all')")
  && TEST.includes("'src/tests/sec-type-deep-link-v2367.test.ts',"));
ok('THE NINETEEN NEIGHBOR LEDGERS ADMIT THE NEW TEST', [
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
    'src/tests/ad-severity-deep-link-v2366.test.ts',
  ].every((f) => read(f).includes("'src/tests/sec-type-deep-link-v2367.test.ts',")));
ok('THE CONSTITUTION\u2019S TWENTIETH ROW LANDED (registry + title + promise roll)',
  CONSTITUTION.includes("{ word: 'sec-type', desk: 'src/app/(shell)/tabs/security-tab.tsx', family: 'border-gray-200', suite: 'src/tests/sec-type-deep-link-v2367.test.ts' }")
  && CONSTITUTION.includes('(twenty words, eighteen desks)')
  && CONSTITUTION.includes("'TWENTIETH'"));
ok('THE TWENTIETH FAMILY IS DISTINCT (gray joined, twenty set)',
  ['border-indigo-200', 'border-amber-200', 'border-rose-200', 'border-emerald-200', 'border-cyan-200', 'border-violet-200', 'border-fuchsia-200', 'border-orange-200', 'border-teal-200', 'border-blue-200', 'border-lime-200', 'border-sky-200', 'border-pink-200', 'border-yellow-200', 'border-stone-200', 'border-slate-200', 'border-purple-200', 'border-zinc-200', 'border-neutral-200', 'border-gray-200']
    .every((f, i, a) => a.indexOf(f) === i));
ok('THE NINETEENTH WORD SURVIVED UNTOUCHED',
  read('src/app/(shell)/tabs/admin-tab.tsx').includes("export const AD_SEVERITY_FILTERS = ['all', 'CRITICAL', 'ERROR', 'WARN', 'INFO', 'DEBUG'] as const;"));

console.log('— the face + the release —');
ok('WHATS-NEW 2.367.0 leads the feed', whatsNew.includes("version: '2.367.0',") && whatsNew.indexOf("'2.367.0'") < whatsNew.indexOf("'2.366.0'"));
ok('CHANGELOG 2.367.0 leads', changelog.startsWith('## [2.367.0]'));
ok('VERSION + package.json say 2.367.0 (three slots)', version === '2.367.0' && pkg.version === '2.367.0' && pkg.mbumah.releaseVersion === '2.367.0' && pkg.mbumah.baseVersion === '2.367.0');
ok('THE VERIFY WIRE EXISTS', Boolean(pkg.scripts['verify:v2-367-0']));

console.log('— walk-dependent pins (green after walk-v2367) —');
const changelogTest = read('src/tests/console-changelog.test.ts');
ok('THE UNREAD-COUNTER CASCADE landed (257/258/259/290)',
  changelogTest.includes("whatsNewUnreadCount('2.110.0')).toBe(257)")
  && changelogTest.includes("whatsNewUnreadCount('2.109.0')).toBe(258)")
  && changelogTest.includes("whatsNewUnreadCount('2.108.0')).toBe(259)")
  && changelogTest.includes("whatsNewUnreadCount('2.77.0')).toBe(290)"));
ok('THE HISTORY LINE rode the cascade block (the English compound, not the word)', changelogTest.includes('v2.367.0: the watchtower entry joins the feed')
  && !changelogTest.includes('sec-type'));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
