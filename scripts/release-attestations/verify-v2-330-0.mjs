#!/usr/bin/env node
// verify-v2-330-0.mjs — the round's FEATURE gate (v2.330.0 "the debt
// lens answers the address bar"). The release MECHANICS live in
// verify-current.mjs. This script pins only what is NEW this round.
// Every check reads the SOURCE OF RECORD (bytes, not memory) — THE OD LAW.
// Pin law (Task 43-49): pins must match the SOURCE bytes — straight vs
// curly apostrophes and line-wraps included. Run BEFORE the walk.
import { readFileSync } from 'node:fs';

let pass = 0, fail = 0;
const ok = (name, cond) => {
  if (cond) { pass++; console.log(`  ok  ${name}`); }
  else { fail++; console.error(`x FAIL ${name}`); }
};
const read = (p) => readFileSync(p, 'utf8');

const home = read('src/lib/tab-url.ts');
const desk = read('src/app/(shell)/tabs/customers-tab.tsx');
const test = read('src/tests/cust-debt-deep-link-v2330.test.ts');
const invTest = read('src/tests/inv-stock-deep-link-v2329.test.ts');
const whatsNew = read('src/lib/whats-new.ts');
const changelog = read('CHANGELOG.md');
const changelogTest = read('src/tests/console-changelog.test.ts');
const pkg = JSON.parse(read('package.json'));

console.log('— the promise kept again (lib/tab-url.ts) —');
ok('the home carries the v2.330 third-desk note (one home, third desk)',
  home.includes('v2.330.0 \u2014 THE PROMISE KEPT, THE THIRD DESK') &&
  home.includes('export function parseInitialNamedMember'));
ok('the law itself gained zero new bytes of parser',
  home.includes('return value as V;') && home.includes('return fallback;'));

console.log('— the customers desk seeds and answers (customers-tab.tsx) —');
ok('the seed reads the word through the ONE home (never a local parser)',
  desk.includes("import { parseInitialNamedMember } from '@/lib/tab-url';") &&
  desk.includes("parseInitialNamedMember(window.location.search, 'cust-debt', CUST_DEBT_FILTERS, 'all')"));
ok('the seed is the lazy initializer with the SSR guard',
  desk.includes('const [debtFilter, setDebtFilter] = useState<string>(initialCustDebtLens);') &&
  desk.includes("if (typeof window === 'undefined') return 'all';"));
ok('the desk offers exactly the lenses it names',
  desk.includes("export const CUST_DEBT_FILTERS = ['all', 'no_debt', 'outstanding', 'overdue'] as const;"));
ok('the landing word state exists (the chip speaks the LANDING, never the choice)',
  desk.includes('const [landedCustDebtLens] = useState<string>(initialCustDebtLens);') &&
  desk.includes('const [landingLive, setLandingLive] = useState(true);'));
ok('the chip renders only while the landing is live AND untouched',
  desk.includes("landingLive && landedCustDebtLens !== 'all' && debtFilter === landedCustDebtLens") &&
  desk.includes('data-testid="cust-landing-word"') &&
  desk.includes('landed ?cust-debt={landedCustDebtLens}'));
ok('voice 1 \u2014 the chip\u2019s own dismissal clears the lens and retires',
  desk.slice(desk.indexOf('data-testid="cust-landing-word"'), desk.indexOf('data-testid="cust-landing-word"') + 400)
    .includes("setDebtFilter('all')"));
ok('voice 2 \u2014 a hand-driven Select change retires the chip',
  desk.includes('onValueChange={chooseDebtFilter}') &&
  desk.includes('a hand-driven change retires the landing word'));
ok('voice 3 \u2014 the quick chips are hand-driven voices too',
  desk.includes("if (chip.key === 'all') chooseDebtFilter('all');") &&
  desk.includes("else if (chip.key === 'debt') chooseDebtFilter('outstanding');"));
ok('voice 4 \u2014 the honest reset retires the chip',
  desk.includes("setDebtFilter('all'); setRegDateFrom(''); setRegDateTo(''); setLandingLive(false);"));
ok('the chip wears the lens\u2019s rose family in BOTH modes',
  desk.includes('border-rose-200 bg-rose-50 text-rose-700') &&
  desk.includes('dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300'));

console.log('— the test pins the laws —');
ok('the deep-link test pins the truth table and the seed bytes',
  test.includes("parseInitialNamedMember('?cust-debt=overdue', 'cust-debt', CUST_DEBT_FILTERS, 'all')") &&
  test.includes("parseInitialNamedMember('?cust-debt=OVERDUE', 'cust-debt', CUST_DEBT_FILTERS, 'all')"));
ok('the deep-link test pins the four retirement voices',
  test.includes('voice 1') && test.includes('voice 2') &&
  test.includes('voice 3') && test.includes('voice 4'));
ok('the deep-link test carries the collision ledger walk',
  test.includes('walkSrc') && test.includes("'src/app/(shell)/tabs/customers-tab.tsx'") &&
  test.includes("'src/tests/cust-debt-deep-link-v2330.test.ts'"));
ok('the v2.329 ledger grew its honest speaker (the rides-along citation)',
  invTest.includes("'src/tests/cust-debt-deep-link-v2330.test.ts'"));

console.log('— the release voice —');
ok("whats-new leads with the round\u2019s story",
  whatsNew.includes("version: '2.330.0',") &&
  whatsNew.includes('The debt lens answers the address bar') &&
  whatsNew.includes('?cust-debt=overdue'));
ok('the CHANGELOG carries the round (Added + Styling + Tests)',
  changelog.includes('## [2.330.0] The debt lens answers the address bar') &&
  changelog.includes("THE DEBT LENS'S OWN WORD") &&
  changelog.includes('THE LANDING WORD CHIP, THIRD WEARING'));
ok('the manifest answers 2.330.0 in all three slots',
  pkg.version === '2.330.0' && pkg.mbumah?.releaseVersion === '2.330.0' && pkg.mbumah?.baseVersion === '2.330.0');
ok('the verify gate itself is wired into the manifest',
  typeof pkg.scripts['verify:v2-330-0'] === 'string');
ok('the walk\u2019s history line landed (the cascade speaks 221/222/223/254)',
  changelogTest.includes('// v2.330.0:') && changelogTest.includes('entry joins the feed') &&
  changelogTest.includes("whatsNewUnreadCount('2.110.0')).toBe(221)"));
ok('no stale anchor behind (the old counts are gone)',
  !changelogTest.includes("whatsNewUnreadCount('2.110.0')).toBe(220)"));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
