#!/usr/bin/env node
// verify-v2-329-0.mjs — the round's FEATURE gate (v2.329.0 "the stock
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
const desk = read('src/app/(shell)/tabs/inventory-tab.tsx');
const test = read('src/tests/inv-stock-deep-link-v2329.test.ts');
const whatsNew = read('src/lib/whats-new.ts');
const changelog = read('CHANGELOG.md');
const changelogTest = read('src/tests/console-changelog.test.ts');
const pkg = JSON.parse(read('package.json'));

console.log('— the promise kept (lib/tab-url.ts) —');
ok('the home carries the v2.329 promise-kept note (one home, second desk)',
  home.includes('v2.329.0 \u2014 THE PROMISE KEPT') &&
  home.includes('export function parseInitialNamedMember'));
ok('the law itself gained zero new bytes of parser',
  home.includes('return value as V;') && home.includes('return fallback;'));

console.log('— the inventory desk seeds and answers (inventory-tab.tsx) —');
ok('the seed reads the word through the ONE home (never a local parser)',
  desk.includes("import { parseInitialNamedMember } from '@/lib/tab-url';") &&
  desk.includes("parseInitialNamedMember(window.location.search, 'inv-stock', INV_STOCK_FILTERS, 'all')"));
ok('the seed is the lazy initializer with the SSR guard',
  desk.includes('const [stockFilter, setStockFilter] = useState<string>(initialStockLens);') &&
  desk.includes("if (typeof window === 'undefined') return 'all';"));
ok('the desk offers exactly the lenses it names',
  desk.includes("export const INV_STOCK_FILTERS = ['all', 'ok', 'low', 'out'] as const;"));
ok('the landing word state exists (the chip speaks the LANDING, never the choice)',
  desk.includes('const [landedStockLens] = useState<string>(initialStockLens);') &&
  desk.includes('const [landingLive, setLandingLive] = useState(true);'));
ok('the chip renders only while the landing is live AND untouched',
  desk.includes("landingLive && landedStockLens !== 'all' && stockFilter === landedStockLens") &&
  desk.includes('data-testid="inv-landing-word"') &&
  desk.includes('landed ?inv-stock={landedStockLens}'));
ok('voice 1 \u2014 the chip\u2019s own dismissal clears the lens and retires',
  desk.slice(desk.indexOf('data-testid="inv-landing-word"'), desk.indexOf('data-testid="inv-landing-word"') + 400)
    .includes("setStockFilter('all')"));
ok('voice 2 \u2014 a hand-driven Select change retires the chip',
  desk.includes('a hand-driven change retires the landing'));
ok('voice 3 \u2014 the low-stock banner\u2019s own buttons retire the chip',
  desk.includes("onClick={() => { setStockFilter('out'); setLandingLive(false); }}"));
ok('voice 4 \u2014 the honest clear-all retires the chip',
  desk.includes("setSearchQuery(''); setStockFilter('all'); setSelectedCategory('all'); setLandingLive(false);"));
ok('the chip wears the lens\u2019s amber family in BOTH modes',
  desk.includes('border-amber-200 bg-amber-50 text-amber-700') &&
  desk.includes('dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300'));

console.log('— the test pins the laws —');
ok('the deep-link test pins the truth table and the seed bytes',
  test.includes("parseInitialNamedMember('?inv-stock=low', 'inv-stock', INV_STOCK_FILTERS, 'all')") &&
  test.includes("parseInitialNamedMember('?inv-stock=LOW', 'inv-stock', INV_STOCK_FILTERS, 'all')"));
ok('the deep-link test pins the four retirement voices',
  test.includes('voice 1') && test.includes('voice 2') &&
  test.includes('voice 3') && test.includes('voice 4'));
ok('the deep-link test carries the collision ledger walk',
  test.includes('walkSrc') && test.includes("'src/app/(shell)/tabs/inventory-tab.tsx'") &&
  test.includes("'src/tests/inv-stock-deep-link-v2329.test.ts'"));

console.log('— the release voice —');
ok("whats-new leads with the round\u2019s story",
  whatsNew.includes("version: '2.329.0',") &&
  whatsNew.includes('The stock lens answers the address bar') &&
  whatsNew.includes('?inv-stock=low'));
ok('the CHANGELOG carries the round (Added + Styling + Tests)',
  changelog.includes('## [2.329.0] The stock lens answers the address bar') &&
  changelog.includes("THE STOCK LENS'S OWN WORD") &&
  changelog.includes('THE LANDING WORD CHIP, SECOND WEARING'));
ok('the manifest answers 2.329.0 in all three slots',
  pkg.version === '2.329.0' && pkg.mbumah?.releaseVersion === '2.329.0' && pkg.mbumah?.baseVersion === '2.329.0');
ok('the verify gate itself is wired into the manifest',
  typeof pkg.scripts['verify:v2-329-0'] === 'string');
ok('the walk\u2019s history line landed (the cascade speaks 220/221/222/253)',
  changelogTest.includes('// v2.329.0:') && changelogTest.includes('entry joins the feed') &&
  changelogTest.includes("whatsNewUnreadCount('2.110.0')).toBe(220)"));
ok('no stale anchor behind (the old counts are gone)',
  !changelogTest.includes("whatsNewUnreadCount('2.110.0')).toBe(219)"));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
