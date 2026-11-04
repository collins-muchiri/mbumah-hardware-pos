#!/usr/bin/env node
// verify-v2-391-0.mjs — the round's FEATURE gate (v2.391.0 "the export
// ledger answers the address bar"). The release MECHANICS live in
// verify-current.mjs. This script pins only what is NEW this round: the
// thirtieth word (the one home's vocabulary, the desk's cast-free
// seed), the controlled hand (the table's visible chips, the lifted
// state, the routed presses), the indigo chip (the eighth shade-split,
// before the history table, inside the history section), and the
// release's own slots.
// THE OD LAW: bytes, not memory.
import { readFileSync } from 'node:fs';

let pass = 0, fail = 0;
const ok = (name, cond) => {
  if (cond) { pass++; console.log(`  ok  ${name}`); }
  else { fail++; console.error(`x FAIL ${name}`); }
};
const read = (p) => readFileSync(p, 'utf8');

const DESK = read('src/app/(shell)/tabs/data-exports-tab.tsx');
const TABLE = read('src/components/data-exports/exports-history-table.tsx');
const HOME = read('src/lib/tab-url.ts');
const SUITE = read('src/tests/exp-status-deep-link-v2391.test.ts');
const CONSTITUTION = read('src/tests/transfer-status-deep-link-v2357.test.ts');
const STRESS = read('src/tests/family-registry-stress-v2370.test.ts');
const FEED = read('src/lib/whats-new.ts');
const CHANGELOG = read('CHANGELOG.md');
const pkg = JSON.parse(read('package.json'));
const version = read('VERSION').trim();

console.log('— the thirtieth word —');
ok('THE ONE HOME SPEAKS THE VOCABULARY',
  HOME.includes("export const EXP_STATUS_FILTERS = [")
  && HOME.includes("'completed',") && HOME.includes("'failed',")
  && HOME.includes("'processing',"));
ok('THE HOME CARRIES THE PROMISE (the thirtieth)',
  HOME.includes('v2.391.0 — THE PROMISE KEPT, THE THIRTIETH WORD')
  && HOME.includes('`exp-status`'));
ok('THE DESK SEEDS THROUGH THE ONE HOME (never a local parser)',
  DESK.includes("parseInitialNamedMember(window.location.search, 'exp-status', EXP_STATUS_FILTERS, 'all')"));
ok('THE SEED IS CAST-FREE (the parser IS the union)',
  DESK.includes('function initialExpStatus(): (typeof EXP_STATUS_FILTERS)[number] {')
  && !DESK.includes('initialExpStatus() as'));
ok('THE WRITE-ONCE TRIO (the read-once law)',
  DESK.includes('const [landedExpStatus] = useState<ExpStatusWordValue>(initialExpStatus);')
  && DESK.includes('const [expStatusFilter, setExpStatusFilter] = useState<ExpStatusWordValue>(initialExpStatus);')
  && DESK.includes("const [expLandingLive, setExpLandingLive] = useState(() => initialExpStatus() !== 'all');"));

console.log('— the controlled hand —');
ok('THE TABLE GREW THE CONTROLLED PROP',
  TABLE.includes('onFilterChange?: (filter: FilterKey) => void;'));
ok('THE DESK LIFTS THE STATE (both the value and the door)',
  DESK.includes('externalFilter={expStatusFilter}')
  && DESK.includes('onFilterChange={chooseExpStatus}'));
ok('THE CHIPS STAY VISIBLE IN THE CONTROLLED FORM',
  TABLE.includes('(!externalFilter || controlled) && ('));
ok('EVERY CHIP PRESS ROUTES THROUGH THE DOOR',
  TABLE.includes('if (controlled) onFilterChange(chip.key);')
  && TABLE.includes('else setFilter(chip.key);'));
ok('THE HAND-DRIVEN VOICE RETIRES THE CHIP',
  DESK.includes('const chooseExpStatus = (v: ExpStatusWordValue) => {')
  && DESK.includes('if (v !== landedExpStatus) setExpLandingLive(false);'));

console.log('— the indigo chip —');
ok('THE CHIP WEARS INDIGO AT 300/100 (the eighth shade-split)',
  DESK.includes('border-indigo-300 bg-indigo-100 text-indigo-700')
  && DESK.includes('dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-300'));
ok('THE RING IS THE FAMILY\u2019S (focus-visible)',
  DESK.includes('focus-visible:ring-indigo-400'));
ok('THE HANDLE IS THE FULL WORD',
  DESK.includes('data-testid="exp-status-landing-word"'));
ok('THE GROUP-HOVER DETAIL (the X fades up)',
  DESK.includes('opacity-60 transition-opacity group-hover:opacity-100'));
ok('THE CHIP SITS BEFORE THE TABLE, INSIDE THE SECTION',
  DESK.indexOf('data-testid="exp-status-landing-word"') < DESK.indexOf('<ExportsHistoryTable')
  && DESK.indexOf('data-testid="exp-status-landing-word"') > DESK.indexOf('{/* Export History */}'));
ok('THE INDIGO SPEAKS EXACTLY ONE WARDROBE ON THE DESK (the masquerade law)',
  DESK.split('border-indigo-').length - 1 === 2 // the light + dark border faces of ONE wardrobe
  && DESK.split('bg-indigo-100').length - 1 === 1);

console.log('— the constitution and the suite —');
ok('THE CONSTITUTION WALKS THIRTY WORDS OVER TWENTY-FIVE DESKS',
  CONSTITUTION.includes('(thirty words, twenty-five desks)')
  && CONSTITUTION.includes("{ word: 'exp-status', desk: 'src/app/(shell)/tabs/data-exports-tab.tsx', family: 'border-indigo-300', suite: 'src/tests/exp-status-deep-link-v2391.test.ts' }")
  && CONSTITUTION.includes("'THIRTIETH'"));
ok('THE STRESS RE-DERIVES (30/25/30 + the roll)',
  STRESS.includes('parses THIRTY rows') && STRESS.includes('rows.length).toBe(30)')
  && STRESS.includes("'exp-status',")
  && STRESS.includes("'THIRTIETH',"));
ok('THE SUITE EXISTS AND PINS ITS OWN ROW',
  SUITE.includes('?exp-status=') && SUITE.includes('border-indigo-300'));

console.log('— the release slots —');
ok('THE FEED LEADS WITH THE ROUND',
  FEED.includes("version: '2.391.0',")
  && FEED.includes('The export ledger answers the address bar')
  && FEED.includes('exp-status'));
ok('THE CHANGELOG LEADS WITH THE ROUND',
  CHANGELOG.startsWith('## [2.391.0] The export ledger answers the address bar'));
ok('THE VERSION SLOTS AGREE',
  version === '2.391.0'
  && pkg.version === '2.391.0'
  && pkg.mbumah.releaseVersion === '2.391.0'
  && pkg.mbumah.baseVersion === '2.391.0');

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
