#!/usr/bin/env node
// verify-v2-363-0.mjs — the round's FEATURE gate (v2.363.0 "the threads'
// kind answers the address bar"). The release MECHANICS live in
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

const DESK = read('src/app/(shell)/tabs/conversations-tab.tsx');
const HOME = read('src/lib/tab-url.ts');
const TEST = read('src/tests/cv-type-deep-link-v2363.test.ts');
const CONSTITUTION = read('src/tests/transfer-status-deep-link-v2357.test.ts');
const whatsNew = read('src/lib/whats-new.ts');
const changelog = read('CHANGELOG.md');
const pkg = JSON.parse(read('package.json'));
const version = read('VERSION').trim();

console.log('— the sixteenth word —');
ok('THE WORD BLOCK speaks its law (membership, one home, collision-checked, the face)',
  DESK.includes("export const CV_TYPE_FILTERS = ['all', 'INTERNAL', 'CUSTOMER_SUPPORT'] as const;")
  && DESK.includes("parseInitialNamedMember(window.location.search, 'cv-type', CV_TYPE_FILTERS, 'all')")
  && DESK.includes("THE CONVERSATIONS DESK'S OWN WORD")
  && DESK.includes('Collision-checked at round start')
  && DESK.includes('THE ALWAYS-VISIBLE FACE'));
ok('THE HOME CARRIES THE SIXTEENTH-WORD NOTE',
  HOME.includes('v2.363.0 — THE PROMISE KEPT, THE SIXTEENTH WORD'));
ok('THE SEED IS CAST-FREE (the generic parser IS the union)',
  DESK.includes('const [typeFilter, setTypeFilter] = useState<(typeof CV_TYPE_FILTERS)[number]>(initialCvType);')
  && DESK.includes('function initialCvType(): (typeof CV_TYPE_FILTERS)[number]')
  && !DESK.includes('initialCvType() as'));
ok('THE LANDING WORD IS READ-ON-MOUNT (the one-writer law)',
  DESK.includes('const [landedCvType] = useState<(typeof CV_TYPE_FILTERS)[number]>(initialCvType);')
  && DESK.includes('const [cvLandingLive, setCvLandingLive] = useState(true);'));
ok('THE NEUTRAL IS LOWERCASE (the desk\u2019s own all-lens spelling)',
  DESK.includes("if (typeof window === 'undefined') return 'all';")
  && DESK.includes("['all', 'INTERNAL', 'CUSTOMER_SUPPORT']"));
ok('THE WORD BINDS TO THE LIST LENS ONLY (the form\u2019s Select untouched)',
  DESK.match(/onValueChange=\{chooseCvType\}/g)?.length === 1
  && DESK.includes("onValueChange={(v: 'INTERNAL' | 'CUSTOMER_SUPPORT') => setType(v)}"));
ok('THE ALWAYS-VISIBLE FACE IS PINNED (no sub-tabs, pane mounts visible)',
  !DESK.includes('<TabsContent')
  && DESK.includes('const [selectedId, setSelectedId] = useState<string | null>(null);'));
ok('THE QUERY RIDES THE LENS (key + params, the list filters, not just the face)',
  DESK.includes("queryKey: ['conversations', storeId, typeFilter, scope],")
  && DESK.includes("typeFilter !== 'all' ? typeFilter : undefined,"));

console.log('— the sixteenth wearing —');
ok('THE CHIP RENDERS ONLY WHILE LIVE AND UNTOUCHED',
  DESK.includes("cvLandingLive && landedCvType !== 'all' && typeFilter === landedCvType")
  && DESK.includes('data-testid="cv-type-landing-word"'));
ok('THE CHIP NAMES THE EXACT WORD', DESK.includes('landed ?cv-type={landedCvType}'));
ok('THE CHIP WEARS THE SIXTEENTH FAMILY (slate) IN BOTH MODES',
  DESK.includes('border-slate-200 bg-slate-50 text-slate-700')
  && DESK.includes('dark:border-slate-500/30 dark:bg-slate-500/10 dark:text-slate-300'));
ok('THE CHIP LIVES BEFORE THE TYPE SELECT (the position law)',
  DESK.indexOf('data-testid="cv-type-landing-word"') > -1
  && DESK.indexOf('<Select value={typeFilter} onValueChange={chooseCvType}>') > DESK.indexOf('data-testid="cv-type-landing-word"'));
ok('THE DISMISS HINT SHARPENS ON HOVER (the group-hover detail)',
  DESK.includes('opacity-60 transition-opacity group-hover:opacity-100'));
ok('THE TWO VOICES ARE HONEST (dismissal + hand-driven Select)',
  DESK.includes("setTypeFilter('all');\n              setCvLandingLive(false);")
  && DESK.includes('<Select value={typeFilter} onValueChange={chooseCvType}>')
  && DESK.includes("hand-driven Select change or the chip's own dismissal"));
ok('THE TOOLTIP LAW (explains itself, icons aria-hidden)',
  DESK.includes('title="The desk landed with this filter from the address bar — press to clear it"')
  && DESK.includes('aria-hidden="true"'));
ok('THE COLLISION NOTE NAMES NO FOREIGN WORD (the prose-collision shadow, applied)',
  !DESK.includes("'gc-status'") && !DESK.includes("'dn-status'") && !DESK.includes("'transfer-status'") && !DESK.includes("'pr-status'"));
ok('THE DESK\u2019S OWN VOICES KEEP THEIR FAMILIES (no masquerade)',
  DESK.includes('MessageSquare className="h-6 w-6 text-blue-600"')
  && DESK.includes('border-slate-200 bg-slate-50'));

console.log('— the ledger family grows —');
ok('THE NEW TEST EXISTS with the truth table + the capitalized-neutral inversion + ledger',
  TEST.includes("parseInitialNamedMember('?cv-type=INTERNAL', 'cv-type', CV_TYPE_FILTERS, 'all')")
  && TEST.includes("parseInitialNamedMember('?cv-type=ALL', 'cv-type', CV_TYPE_FILTERS, 'all')).toBe('all')")
  && TEST.includes("parseInitialNamedMember('?tab=conversations&cv-type=INTERNAL&txn-type=refund', 'cv-type', CV_TYPE_FILTERS, 'all')")
  && TEST.includes("'src/tests/cv-type-deep-link-v2363.test.ts',"));
ok('THE FIFTEEN NEIGHBOR LEDGERS ADMIT THE NEW TEST', [
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
  ].every((f) => read(f).includes("'src/tests/cv-type-deep-link-v2363.test.ts',")));
ok('THE CONSTITUTION\u2019S SIXTEENTH ROW LANDED (registry + title + promise roll)',
  CONSTITUTION.includes("{ word: 'cv-type', desk: 'src/app/(shell)/tabs/conversations-tab.tsx', family: 'border-slate-200', suite: 'src/tests/cv-type-deep-link-v2363.test.ts' }")
  && CONSTITUTION.includes('(sixteen words, fourteen desks)')
  && CONSTITUTION.includes("'SIXTEENTH'"));
ok('THE ELDERS\u2019 TITLE PINS RODE THE TREADMILL (the living-line re-anchor)',
  read('src/tests/gc-status-deep-link-v2358.test.ts').includes('(sixteen words, fourteen desks)')
  && read('src/tests/dn-status-deep-link-v2359.test.ts').includes('(sixteen words, fourteen desks)')
  && read('src/tests/vc-status-deep-link-v2360.test.ts').includes('(sixteen words, fourteen desks)')
  && read('src/tests/cr-type-deep-link-v2361.test.ts').includes('(sixteen words, fourteen desks)')
  && read('src/tests/pr-status-deep-link-v2362.test.ts').includes('(sixteen words, fourteen desks)'));
ok('THE FIFTEENTH WORD SURVIVED UNTOUCHED',
  read('src/app/(shell)/tabs/payroll-tab.tsx').includes("export const PR_STATUS_FILTERS = ['ALL', 'ACTIVE', 'ON_LEAVE', 'TERMINATED'] as const;"));

console.log('— the face + the release —');
ok('WHATS-NEW 2.363.0 leads the feed', whatsNew.includes("version: '2.363.0',") && whatsNew.indexOf("'2.363.0'") < whatsNew.indexOf("'2.362.0'"));
ok('CHANGELOG 2.363.0 leads', changelog.startsWith('## [2.363.0]'));
ok('VERSION + package.json say 2.363.0 (three slots)', version === '2.363.0' && pkg.version === '2.363.0' && pkg.mbumah.releaseVersion === '2.363.0' && pkg.mbumah.baseVersion === '2.363.0');
ok('THE VERIFY WIRE EXISTS', Boolean(pkg.scripts['verify:v2-363-0']));

console.log('— walk-dependent pins (green after walk-v2363) —');
const changelogTest = read('src/tests/console-changelog.test.ts');
ok('THE UNREAD-COUNTER CASCADE landed (253/254/255/286)',
  changelogTest.includes("whatsNewUnreadCount('2.110.0')).toBe(253)")
  && changelogTest.includes("whatsNewUnreadCount('2.109.0')).toBe(254)")
  && changelogTest.includes("whatsNewUnreadCount('2.108.0')).toBe(255)")
  && changelogTest.includes("whatsNewUnreadCount('2.77.0')).toBe(286)"));
ok('THE HISTORY LINE rode the cascade block (the English compound, not the word)', changelogTest.includes('v2.363.0: the conversations entry joins the feed')
  && !changelogTest.includes('cv-type'));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
