#!/usr/bin/env node
// verify-v2-331-0.mjs — the round's FEATURE gate (v2.331.0 "the
// suppliers lens answers the address bar"). The release MECHANICS live
// in verify-current.mjs. This script pins only what is NEW this round.
// Every check reads the SOURCE OF RECORD (bytes, not memory) — THE OD LAW.
// Pin law (Task 43-51): pins must match the SOURCE bytes — straight vs
// curly apostrophes and line-wraps included. Run BEFORE the walk.
import { readFileSync } from 'node:fs';

let pass = 0, fail = 0;
const ok = (name, cond) => {
  if (cond) { pass++; console.log(`  ok  ${name}`); }
  else { fail++; console.error(`x FAIL ${name}`); }
};
const read = (p) => readFileSync(p, 'utf8');

const home = read('src/lib/tab-url.ts');
const desk = read('src/app/(shell)/tabs/suppliers-tab.tsx');
const test = read('src/tests/sup-status-deep-link-v2331.test.ts');
const custTest = read('src/tests/cust-debt-deep-link-v2330.test.ts');
const invTest = read('src/tests/inv-stock-deep-link-v2329.test.ts');
const poGateTest = read('src/tests/proxy-gate-layering-v2328.test.ts');
const whatsNew = read('src/lib/whats-new.ts');
const changelog = read('CHANGELOG.md');
const changelogTest = read('src/tests/console-changelog.test.ts');
const pkg = JSON.parse(read('package.json'));

console.log('— the promise kept a third time (lib/tab-url.ts) —');
ok('the home carries the v2.331 fourth-desk note (one home, fourth desk)',
  home.includes('v2.331.0 \u2014 THE PROMISE KEPT, THE FOURTH DESK') &&
  home.includes('export function parseInitialNamedMember'));
ok('the law itself gained zero new bytes of parser',
  home.includes('return value as V;') && home.includes('return fallback;'));

console.log('— the suppliers desk seeds and answers (suppliers-tab.tsx) —');
ok('the seed reads the word through the ONE home (never a local parser)',
  desk.includes("import { parseInitialNamedMember } from '@/lib/tab-url';") &&
  desk.includes("parseInitialNamedMember(window.location.search, 'sup-status', SUP_STATUS_FILTERS, 'all')"));
ok('the seed is the lazy initializer with the SSR guard',
  desk.includes('const [filterStatus, setFilterStatus] = useState<string>(initialSupStatus);') &&
  desk.includes("if (typeof window === 'undefined') return 'all';"));
ok('the desk offers exactly the lenses it names',
  desk.includes("export const SUP_STATUS_FILTERS = ['all', 'active', 'inactive'] as const;"));
ok('the landing word state exists (the chip speaks the LANDING, never the choice)',
  desk.includes('const [landedSupStatus] = useState<string>(initialSupStatus);') &&
  desk.includes('const [landingLive, setLandingLive] = useState(true);'));
ok('the chip renders only while the landing is live AND untouched',
  desk.includes("landingLive && landedSupStatus !== 'all' && filterStatus === landedSupStatus") &&
  desk.includes('data-testid="sup-landing-word"') &&
  desk.includes('landed ?sup-status={landedSupStatus}'));
ok('voice 1 \u2014 the chip\u2019s own dismissal clears the lens and retires',
  desk.slice(desk.indexOf('data-testid="sup-landing-word"'), desk.indexOf('data-testid="sup-landing-word"') + 400)
    .includes("setFilterStatus('all')"));
ok('voice 2 \u2014 a hand-driven Select change retires the chip',
  desk.includes('onValueChange={chooseSupStatus}') &&
  desk.includes('a hand-driven change retires the landing word'));
ok('the voices are honest \u2014 the desk claims exactly the two it has',
  desk.includes("a hand-driven Select or the chip's own dismissal") &&
  !desk.includes('voice 3') && !desk.includes('voice 4'));
ok('the chip wears the lens\u2019s emerald family in BOTH modes',
  desk.includes('border-emerald-200 bg-emerald-50 text-emerald-700') &&
  desk.includes('dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300'));
ok('the chip explains itself (the tooltip law)',
  desk.includes('title="The desk landed with this filter from the address bar \u2014 press to clear it"'));

console.log('— the test pins the laws —');
ok('the deep-link test pins the truth table and the seed bytes',
  test.includes("parseInitialNamedMember('?sup-status=active', 'sup-status', SUP_STATUS_FILTERS, 'all')") &&
  test.includes("parseInitialNamedMember('?sup-status=ACTIVE', 'sup-status', SUP_STATUS_FILTERS, 'all')"));
ok('the deep-link test pins the two honest retirement voices',
  test.includes('voice 1') && test.includes('voice 2') &&
  test.includes('the voices are honest'));
ok('the deep-link test carries the collision ledger walk',
  test.includes('walkSrc') && test.includes("'src/app/(shell)/tabs/suppliers-tab.tsx'") &&
  test.includes("'src/tests/sup-status-deep-link-v2331.test.ts'"));
ok('the v2.330 ledger grew its honest speaker (the rides-along citation)',
  custTest.includes("'src/tests/sup-status-deep-link-v2331.test.ts'") &&
  custTest.includes("'src/app/(shell)/tabs/suppliers-tab.tsx'"));
ok('the v2.329 ledger grew its honest speaker (the rides-along citation)',
  invTest.includes("'src/tests/sup-status-deep-link-v2331.test.ts'"));
ok('the v2.328 ledger grew its honest speaker (the lineage citation)',
  poGateTest.includes("'src/tests/sup-status-deep-link-v2331.test.ts'"));

console.log('— the release voice —');
ok("whats-new leads with the round\u2019s story",
  whatsNew.includes("version: '2.331.0',") &&
  whatsNew.includes('The suppliers lens answers the address bar') &&
  whatsNew.includes('?sup-status=active'));
ok('the CHANGELOG carries the round (Added + Styling + Tests)',
  changelog.includes('## [2.331.0] The suppliers lens answers the address bar') &&
  changelog.includes("THE SUPPLIERS LENS'S OWN WORD") &&
  changelog.includes('THE LANDING WORD CHIP, FOURTH WEARING'));
ok('the manifest answers 2.331.0 in all three slots',
  pkg.version === '2.331.0' && pkg.mbumah?.releaseVersion === '2.331.0' && pkg.mbumah?.baseVersion === '2.331.0');
ok('the verify gate itself is wired into the manifest',
  typeof pkg.scripts['verify:v2-331-0'] === 'string');
ok('the walk\u2019s history line landed (the cascade speaks 222/223/224/255)',
  changelogTest.includes('// v2.331.0:') && changelogTest.includes('entry joins the feed') &&
  changelogTest.includes("whatsNewUnreadCount('2.110.0')).toBe(222)"));
ok('no stale anchor behind (the old counts are gone)',
  !changelogTest.includes("whatsNewUnreadCount('2.110.0')).toBe(221)"));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
