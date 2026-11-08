#!/usr/bin/env node
// verify-v2-364-0.mjs — the round's FEATURE gate (v2.364.0 "the shelves'
// standing answers the address bar"). The release MECHANICS live in
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

const DESK = read('src/app/(shell)/tabs/catalog-tab.tsx');
const HOME = read('src/lib/tab-url.ts');
const TEST = read('src/tests/cat-stock-deep-link-v2364.test.ts');
const CONSTITUTION = read('src/tests/transfer-status-deep-link-v2357.test.ts');
const whatsNew = read('src/lib/whats-new.ts');
const changelog = read('CHANGELOG.md');
const pkg = JSON.parse(read('package.json'));
const version = read('VERSION').trim();

console.log('— the seventeenth word —');
ok('THE WORD BLOCK speaks its law (membership, one home, collision-checked, the amendment)',
  DESK.includes("export const CAT_STOCK_FILTERS = ['all', 'in_stock', 'low_stock', 'out_of_stock'] as const;")
  && DESK.includes("parseInitialNamedMember(window.location.search, 'cat-stock', CAT_STOCK_FILTERS, 'all')")
  && DESK.includes("THE CATALOG DESK'S OWN WORD")
  && DESK.includes('Collision-checked at round start')
  && DESK.includes('THE COLLAPSIBLE-FACE AMENDMENT'));
ok('THE HOME CARRIES THE SEVENTEENTH-WORD NOTE',
  HOME.includes('v2.364.0 — THE PROMISE KEPT, THE SEVENTEENTH WORD'));
ok('THE SEED IS CAST-FREE (the generic parser IS the union — and the old cast is GONE)',
  DESK.includes('const [stockFilter, setStockFilter] = useState<StockFilter>(initialCatStock);')
  && DESK.includes('function initialCatStock(): (typeof CAT_STOCK_FILTERS)[number]')
  && DESK.includes('type StockFilter = (typeof CAT_STOCK_FILTERS)[number];')
  && !DESK.includes('initialCatStock() as')
  && !DESK.includes('onValueChange={(v) => setStockFilter(v as StockFilter)}'));
ok('THE LANDING WORD IS READ-ON-MOUNT (the one-writer law)',
  DESK.includes('const [landedCatStock] = useState<StockFilter>(initialCatStock);')
  && DESK.includes('const [catLandingLive, setCatLandingLive] = useState(true);'));
ok('THE NEUTRAL IS LOWERCASE (the desk\u2019s own all-lens spelling)',
  DESK.includes("if (typeof window === 'undefined') return 'all';")
  && DESK.includes("['all', 'in_stock', 'low_stock', 'out_of_stock']"));
ok('THE WORD BINDS TO THE STOCK LENS ONLY (exactly one chooser)',
  DESK.match(/onValueChange=\{chooseCatStock\}/g)?.length === 1);
ok('THE AMENDMENT\u2019S MOUNTING BYTES ARE PINNED (the panel raised by the landed word)',
  DESK.includes("const [showFilters, setShowFilters] = useState<boolean>(() => landedCatStock !== 'all');")
  && !DESK.includes('<TabsContent'));
ok('THE WORD FILTERS THE LIST (the client-side read, not just the Select\u2019s face)',
  DESK.includes("if (stockFilter === 'in_stock') result = result.filter((p) => p.quantityInStock > p.reorderLevel);")
  && DESK.includes("else if (stockFilter === 'out_of_stock') result = result.filter((p) => p.quantityInStock <= 0);"));

console.log('— the seventeenth wearing —');
ok('THE CHIP RENDERS ONLY WHILE LIVE AND UNTOUCHED',
  DESK.includes("catLandingLive && landedCatStock !== 'all' && stockFilter === landedCatStock")
  && DESK.includes('data-testid="cat-stock-landing-word"'));
ok('THE CHIP NAMES THE EXACT WORD', DESK.includes('landed ?cat-stock={landedCatStock}'));
ok('THE CHIP WEARS THE SEVENTEENTH FAMILY (purple) IN BOTH MODES',
  DESK.includes('border-purple-200 bg-purple-50 text-purple-700')
  && DESK.includes('dark:border-purple-500/30 dark:bg-purple-500/10 dark:text-purple-300'));
ok('THE CHIP LIVES BEFORE THE STOCK SELECT (the position law)',
  DESK.indexOf('data-testid="cat-stock-landing-word"') > -1
  && DESK.indexOf('<Select value={stockFilter} onValueChange={chooseCatStock}>') > DESK.indexOf('data-testid="cat-stock-landing-word"'));
ok('THE DISMISS HINT SHARPENS ON HOVER (the group-hover detail)',
  DESK.includes('opacity-60 transition-opacity group-hover:opacity-100'));
ok('THE THREE VOICES ARE HONEST (dismissal + hand-driven Select + clear)',
  DESK.includes("setStockFilter('all');\n                    setCatLandingLive(false);")
  && DESK.includes('<Select value={stockFilter} onValueChange={chooseCatStock}>')
  && DESK.includes("hand-driven Select change, or the clear-filters reset")
  && DESK.includes('the third voice'));
ok('THE TOOLTIP LAW (explains itself, icons aria-hidden)',
  DESK.includes('title="The desk landed with this filter from the address bar — press to clear it"')
  && DESK.includes('aria-hidden="true"'));
ok('THE COLLISION NOTE NAMES NO FOREIGN WORD (the prose-collision shadow, applied)',
  !DESK.includes("'gc-status'") && !DESK.includes("'dn-status'") && !DESK.includes("'transfer-status'") && !DESK.includes("'pr-status'") && !DESK.includes("'cv-type'"));
ok('THE DESK\u2019S OWN VOICES KEEP THEIR FAMILIES (no masquerade)',
  DESK.includes('border-amber-200')
  && DESK.includes('border-purple-200 bg-purple-50'));

console.log('— the ledger family grows —');
ok('THE NEW TEST EXISTS with the truth table + the capitalized inversions + ledger',
  TEST.includes("parseInitialNamedMember('?cat-stock=low_stock', 'cat-stock', CAT_STOCK_FILTERS, 'all')")
  && TEST.includes("parseInitialNamedMember('?cat-stock=ALL', 'cat-stock', CAT_STOCK_FILTERS, 'all')).toBe('all')")
  && TEST.includes("parseInitialNamedMember('?cat-stock=IN_STOCK', 'cat-stock', CAT_STOCK_FILTERS, 'all')).toBe('all')")
  && TEST.includes("parseInitialNamedMember('?tab=catalog&cat-stock=low_stock&txn-type=refund', 'cat-stock', CAT_STOCK_FILTERS, 'all')")
  && TEST.includes("'src/tests/cat-stock-deep-link-v2364.test.ts',"));
ok('THE SIXTEEN NEIGHBOR LEDGERS ADMIT THE NEW TEST', [
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
  ].every((f) => read(f).includes("'src/tests/cat-stock-deep-link-v2364.test.ts',")));
ok('THE CONSTITUTION\u2019S SEVENTEENTH ROW LANDED (registry + title + promise roll)',
  CONSTITUTION.includes("{ word: 'cat-stock', desk: 'src/app/(shell)/tabs/catalog-tab.tsx', family: 'border-purple-200', suite: 'src/tests/cat-stock-deep-link-v2364.test.ts' }")
  && CONSTITUTION.includes('(seventeen words, fifteen desks)')
  && CONSTITUTION.includes("'SEVENTEENTH'"));
ok('THE SEVENTEENTH FAMILY IS DISTINCT (purple joined, seventeen set)',
  ['border-indigo-200', 'border-amber-200', 'border-rose-200', 'border-emerald-200', 'border-cyan-200', 'border-violet-200', 'border-fuchsia-200', 'border-orange-200', 'border-teal-200', 'border-blue-200', 'border-lime-200', 'border-sky-200', 'border-pink-200', 'border-yellow-200', 'border-stone-200', 'border-slate-200', 'border-purple-200']
    .every((f, i, a) => a.indexOf(f) === i));
ok('THE SIXTEENTH WORD SURVIVED UNTOUCHED',
  read('src/app/(shell)/tabs/conversations-tab.tsx').includes("export const CV_TYPE_FILTERS = ['all', 'INTERNAL', 'CUSTOMER_SUPPORT'] as const;"));

console.log('— the face + the release —');
ok('WHATS-NEW 2.364.0 leads the feed', whatsNew.includes("version: '2.364.0',") && whatsNew.indexOf("'2.364.0'") < whatsNew.indexOf("'2.363.0'"));
ok('CHANGELOG 2.364.0 leads', changelog.startsWith('## [2.364.0]'));
ok('VERSION + package.json say 2.364.0 (three slots)', version === '2.364.0' && pkg.version === '2.364.0' && pkg.mbumah.releaseVersion === '2.364.0' && pkg.mbumah.baseVersion === '2.364.0');
ok('THE VERIFY WIRE EXISTS', Boolean(pkg.scripts['verify:v2-364-0']));

console.log('— walk-dependent pins (green after walk-v2364) —');
const changelogTest = read('src/tests/console-changelog.test.ts');
ok('THE UNREAD-COUNTER CASCADE landed (254/255/256/287)',
  changelogTest.includes("whatsNewUnreadCount('2.110.0')).toBe(254)")
  && changelogTest.includes("whatsNewUnreadCount('2.109.0')).toBe(255)")
  && changelogTest.includes("whatsNewUnreadCount('2.108.0')).toBe(256)")
  && changelogTest.includes("whatsNewUnreadCount('2.77.0')).toBe(287)"));
ok('THE HISTORY LINE rode the cascade block (the English compound, not the word)', changelogTest.includes('v2.364.0: the catalog entry joins the feed')
  && !changelogTest.includes('cat-stock'));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
