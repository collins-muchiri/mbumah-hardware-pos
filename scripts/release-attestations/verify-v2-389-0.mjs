#!/usr/bin/env node
// verify-v2-389-0.mjs — the round's FEATURE gate (v2.389.0 "the debt
// ledger answers the address bar"). The release MECHANICS live in
// verify-current.mjs. This script pins only what is NEW this round: the
// twenty-eighth word (the one home's vocabulary, the desk's cast-free
// seed), the sub-tab amendment's third application (the landing raises
// the History pane), the cyan chip (the sixth shade-split, before the
// lens, inside the pane's own section), the retirement door, the lens's
// count line, and the release's own slots.
// THE OD LAW: bytes, not memory.
import { readFileSync } from 'node:fs';

let pass = 0, fail = 0;
const ok = (name, cond) => {
  if (cond) { pass++; console.log(`  ok  ${name}`); }
  else { fail++; console.error(`x FAIL ${name}`); }
};
const read = (p) => readFileSync(p, 'utf8');

const DESK = read('src/app/(shell)/tabs/debt-management-tab.tsx');
const HOME = read('src/lib/tab-url.ts');
const SUITE = read('src/tests/debt-status-deep-link-v2389.test.ts');
const CONSTITUTION = read('src/tests/transfer-status-deep-link-v2357.test.ts');
const STRESS = read('src/tests/family-registry-stress-v2370.test.ts');
const FEED = read('src/lib/whats-new.ts');
const pkg = JSON.parse(read('package.json'));
const version = read('VERSION').trim();

console.log('— the twenty-eighth word —');
ok('THE ONE HOME SPEAKS THE VOCABULARY',
  HOME.includes("export const DEBT_STATUS_FILTERS = [")
  && HOME.includes("'PENDING',") && HOME.includes("'SENT',")
  && HOME.includes("'DELIVERED',") && HOME.includes("'FAILED',"));
ok('THE HOME CARRIES THE PROMISE (the twenty-eighth)',
  HOME.includes('v2.389.0 — THE PROMISE KEPT, THE TWENTY-EIGHTH WORD')
  && HOME.includes('`debt-status`'));
ok('THE DESK SEEDS THROUGH THE ONE HOME (never a local parser)',
  DESK.includes("parseInitialNamedMember(window.location.search, 'debt-status', DEBT_STATUS_FILTERS, 'all')"));
ok('THE SEED IS CAST-FREE (the parser IS the union)',
  DESK.includes('function initialDebtStatus(): (typeof DEBT_STATUS_FILTERS)[number] {')
  && !DESK.includes('initialDebtStatus() as'));
ok('THE WRITE-ONCE PAIR (the read-once law)',
  DESK.includes('const [landedDebtStatus] = useState<DebtStatusWordValue>(initialDebtStatus);')
  && DESK.includes('const [statusFilter, setStatusFilter] = useState<string>(initialDebtStatus);'));

console.log('— the sub-tab amendment\u2019s third application —');
ok('THE LANDING RAISES THE PANE IT LANDS INTO',
  DESK.includes("const [activeTab, setActiveTab] = useState(() => (initialDebtStatus() !== 'all' ? 'history' : 'board'));"));
ok('THE CHIP SITS IN THE PANE\u2019S OWN SECTION, BEFORE THE LENS (the two position laws)',
  DESK.indexOf('function HistorySection') > -1
  && DESK.indexOf('data-testid="debt-status-landing-word"') > DESK.indexOf('function HistorySection')
  && DESK.indexOf('data-testid="debt-status-landing-word"') < DESK.indexOf('<Select value={statusFilter} onValueChange={chooseDebtStatus}>'));
ok('THE PANE THE WORD RAISES RENDERS THE CHIP\u2019S SECTION',
  DESK.includes('<TabsContent value="history"')
  && DESK.includes('<HistorySection storeId={currentStoreId} />'));

console.log('— the cyan chip (the sixth shade-split) —');
ok('THE CHIP WEARS CYAN AT 300/100 WITH ITS DARK WARDROBE',
  DESK.includes('border-cyan-300 bg-cyan-100 text-cyan-700')
  && DESK.includes('dark:border-cyan-500/30 dark:bg-cyan-500/10 dark:text-cyan-300')
  && DESK.includes('focus-visible:ring-cyan-400'));
ok('NO OTHER CHIP HUE APPEARS ON THIS DESK (the census)',
  !DESK.includes('border-purple-300 bg-purple-100')
  && !DESK.includes('border-sky-300 bg-sky-100')
  && !DESK.includes('border-orange-300 bg-orange-100')
  && !DESK.includes('border-teal-300 bg-teal-100')
  && !DESK.includes('border-lime-300 bg-lime-100')
  && !DESK.includes('border-cyan-200'));

console.log('— the retirement door —');
ok('EVERY HAND-DRIVEN CHANGE RIDES THE DOOR',
  DESK.includes('const chooseDebtStatus = (v: string) => {')
  && DESK.includes('<Select value={statusFilter} onValueChange={chooseDebtStatus}>')
  && DESK.includes('setDebtLandingLive(false);'));
ok('THE CHIP DISMISSES AND CLEARS THE LENS IT SEEDED',
  /onClick=\{\(\) => \{\s*\n\s*setStatusFilter\('all'\);\s*\n\s*setDebtLandingLive\(false\);/.test(DESK));

console.log('— the lens\u2019s count line —');
ok('THE LENS ANSWERS WITH ITS OWN TOTAL (tabular)',
  DESK.includes('className="text-xs text-muted-foreground tabular-nums"')
  && DESK.includes('{pagination?.total ?? reminders.length} reminder'));

console.log('— the constitution and the feed —');
ok('THE CONSTITUTION WALKS TWENTY-EIGHT OVER TWENTY-FOUR (a new desk speaks)',
  CONSTITUTION.includes('(twenty-eight words, twenty-four desks)')
  && CONSTITUTION.includes("{ word: 'debt-status', desk: 'src/app/(shell)/tabs/debt-management-tab.tsx', family: 'border-cyan-300', suite: 'src/tests/debt-status-deep-link-v2389.test.ts' }")
  && CONSTITUTION.includes("'TWENTY-EIGHTH'"));
ok('THE REGISTRY STRESS RE-DERIVES THE ARITHMETIC',
  STRESS.includes('.size).toBe(28)')
  && STRESS.includes("'debt-status',")
  && STRESS.includes("'TWENTY-EIGHTH',"));
ok('THE SUITE EXISTS AND PINS THE ROUND',
  SUITE.length > 4000 && SUITE.includes("THE DEBT LEDGER'S OWN WORD"));
ok('THE FEED\u2019S LEAD ENTRY IS THE ROUND',
  FEED.indexOf("version: '2.389.0'") >= 0
  && FEED.indexOf("version: '2.389.0'") < FEED.indexOf("version: '2.388.0'"));
ok('THE VERSION SLOTS SPEAK 2.389.0',
  version === '2.389.0' && pkg.version === '2.389.0'
  && pkg.mbumah.releaseVersion === '2.389.0' && pkg.mbumah.baseVersion === '2.389.0');

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
