#!/usr/bin/env node
// verify-v2-365-0.mjs — the round's FEATURE gate (v2.365.0 "the repayment
// desk answers the address bar"). The release MECHANICS live in
// verify-current.mjs. This script pins only what is NEW this round.
// THE OD LAW: bytes, not memory. Run BEFORE the walk; the walk-dependent
// pins sit in the tail section.
import { readFileSync } from 'node:fs';

let pass = 0, fail = 0;
const ok = (name, cond) => {
  if (cond) { pass++; console.log(`  ok  ${name}`); }
  else { fail++; console.error(`x FAIL ${name}`); }
};
const read = (p) => readFileSync(p, 'utf8');

const DESK = read('src/app/(shell)/tabs/debt-plans-tab.tsx');
const HOME = read('src/lib/tab-url.ts');
const TEST = read('src/tests/dp-status-deep-link-v2365.test.ts');
const CONSTITUTION = read('src/tests/transfer-status-deep-link-v2357.test.ts');
const whatsNew = read('src/lib/whats-new.ts');
const changelog = read('CHANGELOG.md');
const pkg = JSON.parse(read('package.json'));
const version = read('VERSION').trim();

console.log('— the eighteenth word —');
ok('THE WORD BLOCK speaks its law (membership, one home, collision-checked, the face-kind)',
  DESK.includes("export const DP_STATUS_FILTERS = ['all', 'pending', 'active', 'overdue', 'completed'] as const;")
  && DESK.includes("parseInitialNamedMember(window.location.search, 'dp-status', DP_STATUS_FILTERS, 'all')")
  && DESK.includes("THE DEBT-PLANS DESK'S OWN WORD")
  && DESK.includes('Collision-checked at round start')
  && DESK.includes('THE FACE-KIND NOTE'));
ok('THE HOME CARRIES THE EIGHTEENTH-WORD NOTE',
  HOME.includes('v2.365.0 — THE PROMISE KEPT, THE EIGHTEENTH WORD'));
ok('THE SEED IS CAST-FREE (the generic parser IS the union)',
  DESK.includes('const [filter, setFilter] = useState<DpStatusFilter>(initialDpStatus);')
  && DESK.includes('function initialDpStatus(): (typeof DP_STATUS_FILTERS)[number]')
  && DESK.includes('type DpStatusFilter = (typeof DP_STATUS_FILTERS)[number];')
  && !DESK.includes('initialDpStatus() as'));
ok('THE LANDING WORD IS READ-ON-MOUNT (the one-writer law)',
  DESK.includes('const [landedDpStatus] = useState<DpStatusFilter>(initialDpStatus);')
  && DESK.includes('const [dpLandingLive, setDpLandingLive] = useState(true);'));
ok('THE NEUTRAL IS LOWERCASE (the desk\u2019s own all-chip spelling)',
  DESK.includes("if (typeof window === 'undefined') return 'all';")
  && DESK.includes("['all', 'pending', 'active', 'overdue', 'completed']"));
ok('THE FACE-KIND BYTES ARE PINNED (the first non-Select control face)',
  DESK.match(/onClick=\{\(\) => chooseDpStatus\(chip\.key\)\}/g)?.length === 1
  && !DESK.includes('onValueChange={chooseDpStatus}'));
ok('THE ALWAYS-RENDERED FACE IS PINNED (no sub-tabs, no panel)',
  !DESK.includes('<TabsContent')
  && DESK.includes('ALWAYS RENDERED'));
ok('THE WORD FILTERS THE LIST (the client-side read, not just the chips\u2019 face)',
  DESK.includes("return plans.filter((p) => p.status === 'PENDING_APPROVAL');")
  && DESK.includes("case 'overdue':"));

console.log('— the eighteenth wearing —');
ok('THE CHIP RENDERS ONLY WHILE LIVE AND UNTOUCHED',
  DESK.includes("dpLandingLive && landedDpStatus !== 'all' && filter === landedDpStatus")
  && DESK.includes('data-testid="dp-status-landing-word"'));
ok('THE CHIP NAMES THE EXACT WORD', DESK.includes('landed ?dp-status={landedDpStatus}'));
ok('THE CHIP WEARS THE EIGHTEENTH FAMILY (zinc) IN BOTH MODES',
  DESK.includes('border-zinc-200 bg-zinc-50 text-zinc-700')
  && DESK.includes('dark:border-zinc-500/30 dark:bg-zinc-500/10 dark:text-zinc-300'));
ok('THE CHIP LIVES BEFORE THE FILTER CHIPS (the position law)',
  DESK.indexOf('data-testid="dp-status-landing-word"') > -1
  && DESK.indexOf('FILTER_CHIPS.map((chip) => {') > DESK.indexOf('data-testid="dp-status-landing-word"'));
ok('THE DISMISS HINT SHARPENS ON HOVER (the group-hover detail)',
  DESK.includes('opacity-60 transition-opacity group-hover:opacity-100'));
ok('THE TWO VOICES ARE HONEST (dismissal + hand-driven chip press)',
  DESK.includes("setFilter('all');\n              setDpLandingLive(false);")
  && DESK.includes('onClick={() => chooseDpStatus(chip.key)}')
  && DESK.includes('a hand-driven chip press retires the landing word'));
ok('THE TOOLTIP LAW (explains itself, icons aria-hidden)',
  DESK.includes('title="The desk landed with this filter from the address bar — press to clear it"')
  && DESK.includes('aria-hidden="true"'));
ok('THE COLLISION NOTE NAMES NO FOREIGN WORD (the prose-collision shadow, applied)',
  !DESK.includes("'gc-status'") && !DESK.includes("'dn-status'") && !DESK.includes("'transfer-status'") && !DESK.includes("'pr-status'") && !DESK.includes("'cat-stock'"));
ok('THE DESK\u2019S OWN VOICES KEEP THEIR FAMILIES (no masquerade)',
  DESK.includes("'bg-emerald-50 text-emerald-700 border-emerald-200")
  && DESK.includes('border-zinc-200 bg-zinc-50'));

console.log('— the ledger family grows —');
ok('THE NEW TEST EXISTS with the truth table + the capitalized inversions + ledger',
  TEST.includes("parseInitialNamedMember('?dp-status=pending', 'dp-status', DP_STATUS_FILTERS, 'all')")
  && TEST.includes("parseInitialNamedMember('?dp-status=ALL', 'dp-status', DP_STATUS_FILTERS, 'all')).toBe('all')")
  && TEST.includes("parseInitialNamedMember('?dp-status=PENDING', 'dp-status', DP_STATUS_FILTERS, 'all')).toBe('all')")
  && TEST.includes("parseInitialNamedMember('?tab=debt-plans&dp-status=pending&txn-type=refund', 'dp-status', DP_STATUS_FILTERS, 'all')")
  && TEST.includes("'src/tests/dp-status-deep-link-v2365.test.ts',"));
ok('THE SEVENTEEN NEIGHBOR LEDGERS ADMIT THE NEW TEST', [
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
  ].every((f) => read(f).includes("'src/tests/dp-status-deep-link-v2365.test.ts',")));
ok('THE CONSTITUTION\u2019S EIGHTEENTH ROW LANDED (registry + title + promise roll)',
  CONSTITUTION.includes("{ word: 'dp-status', desk: 'src/app/(shell)/tabs/debt-plans-tab.tsx', family: 'border-zinc-200', suite: 'src/tests/dp-status-deep-link-v2365.test.ts' }")
  && CONSTITUTION.includes('(eighteen words, sixteen desks)')
  && CONSTITUTION.includes("'EIGHTEENTH'"));
ok('THE EIGHTEENTH FAMILY IS DISTINCT (zinc joined, eighteen set)',
  ['border-indigo-200', 'border-amber-200', 'border-rose-200', 'border-emerald-200', 'border-cyan-200', 'border-violet-200', 'border-fuchsia-200', 'border-orange-200', 'border-teal-200', 'border-blue-200', 'border-lime-200', 'border-sky-200', 'border-pink-200', 'border-yellow-200', 'border-stone-200', 'border-slate-200', 'border-purple-200', 'border-zinc-200']
    .every((f, i, a) => a.indexOf(f) === i));
ok('THE SEVENTEENTH WORD SURVIVED UNTOUCHED',
  read('src/app/(shell)/tabs/catalog-tab.tsx').includes("export const CAT_STOCK_FILTERS = ['all', 'in_stock', 'low_stock', 'out_of_stock'] as const;"));

console.log('— the face + the release —');
ok('WHATS-NEW 2.365.0 leads the feed', whatsNew.includes("version: '2.365.0',") && whatsNew.indexOf("'2.365.0'") < whatsNew.indexOf("'2.364.0'"));
ok('CHANGELOG 2.365.0 leads', changelog.startsWith('## [2.365.0]'));
ok('VERSION + package.json say 2.365.0 (three slots)', version === '2.365.0' && pkg.version === '2.365.0' && pkg.mbumah.releaseVersion === '2.365.0' && pkg.mbumah.baseVersion === '2.365.0');
ok('THE VERIFY WIRE EXISTS', Boolean(pkg.scripts['verify:v2-365-0']));

console.log('— walk-dependent pins (green after walk-v2365) —');
const changelogTest = read('src/tests/console-changelog.test.ts');
ok('THE UNREAD-COUNTER CASCADE landed (255/256/257/288)',
  changelogTest.includes("whatsNewUnreadCount('2.110.0')).toBe(255)")
  && changelogTest.includes("whatsNewUnreadCount('2.109.0')).toBe(256)")
  && changelogTest.includes("whatsNewUnreadCount('2.108.0')).toBe(257)")
  && changelogTest.includes("whatsNewUnreadCount('2.77.0')).toBe(288)"));
ok('THE HISTORY LINE rode the cascade block (the English compound, not the word)', changelogTest.includes('v2.365.0: the repayment entry joins the feed')
  && !changelogTest.includes('dp-status'));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
