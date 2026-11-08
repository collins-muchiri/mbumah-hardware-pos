#!/usr/bin/env node
// verify-v2-392-0.mjs — the round's FEATURE gate (v2.392.0 "the export
// ledger answers by type"). The release MECHANICS live in
// verify-current.mjs. This script pins only what is NEW this round: the
// thirty-first word (the one home's vocabulary, the desk's cast-free
// second seed), the controlled hand's second application (the type chip
// row, the lifted state, the routed presses, the conjoined lenses), the
// pink chip (the ninth shade-split, beside its indigo sibling), and the
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
const SUITE = read('src/tests/exp-type-deep-link-v2392.test.ts');
const CONSTITUTION = read('src/tests/transfer-status-deep-link-v2357.test.ts');
const STRESS = read('src/tests/family-registry-stress-v2370.test.ts');
const FEED = read('src/lib/whats-new.ts');
const CHANGELOG = read('CHANGELOG.md');
const pkg = JSON.parse(read('package.json'));
const version = read('VERSION').trim();

console.log('— the thirty-first word —');
ok('THE ONE HOME SPEAKS THE VOCABULARY',
  HOME.includes("export const EXP_TYPE_FILTERS = [")
  && HOME.includes("'products',") && HOME.includes("'sales-summary',")
  && HOME.includes("'loyalty',"));
ok('THE HOME CARRIES THE PROMISE (the thirty-first)',
  HOME.includes('v2.392.0 — THE PROMISE KEPT, THE THIRTY-FIRST WORD')
  && HOME.includes('`exp-type`'));
ok('THE DESK SEEDS THROUGH THE ONE HOME (never a local parser)',
  DESK.includes("parseInitialNamedMember(window.location.search, 'exp-type', EXP_TYPE_FILTERS, 'all')"));
ok('THE SEED IS CAST-FREE (the parser IS the union)',
  DESK.includes('function initialExpType(): (typeof EXP_TYPE_FILTERS)[number] {')
  && !DESK.includes('initialExpType() as'));
ok('THE WRITE-ONCE TRIO (the read-once law, second application)',
  DESK.includes('const [landedExpType] = useState<ExpTypeWordValue>(initialExpType);')
  && DESK.includes('const [expTypeFilter, setExpTypeFilter] = useState<ExpTypeWordValue>(initialExpType);')
  && DESK.includes("const [expTypeLandingLive, setExpTypeLandingLive] = useState(() => initialExpType() !== 'all');"));

console.log('— the controlled hand\u2019s second application —');
ok('THE TABLE GREW THE SECOND CONTROLLED PROP PAIR',
  TABLE.includes('externalTypeFilter?: ExpTypeFilter;')
  && TABLE.includes('onTypeChange?: (type: ExpTypeFilter) => void;'));
ok('THE DESK LIFTS THE STATE (both the value and the door)',
  DESK.includes('externalTypeFilter={expTypeFilter}')
  && DESK.includes('onTypeChange={chooseExpType}'));
ok('THE TYPE CHIPS STAY VISIBLE IN THE CONTROLLED FORM',
  TABLE.includes('(!externalTypeFilter || typeControlled) && ('));
ok('EVERY TYPE PRESS ROUTES THROUGH THE DOOR',
  TABLE.includes('if (typeControlled) onTypeChange(t.key);')
  && TABLE.includes('else setTypeFilter(t.key);'));
ok('THE HAND-DRIVEN VOICE RETIRES THE CHIP',
  DESK.includes('const chooseExpType = (v: ExpTypeWordValue) => {')
  && DESK.includes('if (v !== landedExpType) setExpTypeLandingLive(false);'));
ok('THE TWO LENSES CONJOIN (the table narrows on both dimensions)',
  TABLE.includes('const byStatus = (() => {')
  && TABLE.includes('return byStatus.filter((e) => e.exportType === effectiveTypeWire);'));

console.log('— the pink chip —');
ok('THE CHIP WEARS PINK AT 300/100 (the ninth shade-split)',
  DESK.includes('border-pink-300 bg-pink-100 text-pink-700')
  && DESK.includes('dark:border-pink-500/30 dark:bg-pink-500/10 dark:text-pink-300'));
ok('THE RING IS THE FAMILY\u2019S (focus-visible)',
  DESK.includes('focus-visible:ring-pink-400'));
ok('THE HANDLE IS THE FULL WORD',
  DESK.includes('data-testid="exp-type-landing-word"'));
ok('THE GROUP-HOVER DETAIL (the X fades up)',
  DESK.includes('opacity-60 transition-opacity group-hover:opacity-100'));
ok('THE CHIP SITS BESIDE ITS SIBLING, BOTH BEFORE THE TABLE',
  DESK.indexOf('data-testid="exp-type-landing-word"') > DESK.indexOf('data-testid="exp-status-landing-word"')
  && DESK.indexOf('data-testid="exp-type-landing-word"') < DESK.indexOf('<ExportsHistoryTable'));
ok('THE PINK SPEAKS EXACTLY ONE WARDROBE ON THE DESK (the masquerade law)',
  DESK.split('border-pink-').length - 1 === 2 // the light + dark border faces of ONE wardrobe
  && DESK.split('bg-pink-100').length - 1 === 1);

console.log('— the constitution and the suite —');
ok('THE CONSTITUTION WALKS THIRTY-ONE WORDS OVER TWENTY-FIVE DESKS',
  CONSTITUTION.includes('(thirty-one words, twenty-five desks)')
  && CONSTITUTION.includes("{ word: 'exp-type', desk: 'src/app/(shell)/tabs/data-exports-tab.tsx', family: 'border-pink-300', suite: 'src/tests/exp-type-deep-link-v2392.test.ts' }")
  && CONSTITUTION.includes("'THIRTY-FIRST'"));
ok('THE STRESS RE-DERIVES (31/25/31 + the roll)',
  STRESS.includes('parses THIRTY-ONE rows') && STRESS.includes('rows.length).toBe(31)')
  && STRESS.includes("'exp-type',")
  && STRESS.includes("'THIRTY-FIRST',"));
ok('THE SUITE EXISTS AND PINS ITS OWN ROW',
  SUITE.includes('?exp-type=') && SUITE.includes('border-pink-300'));

console.log('— the release slots —');
ok('THE FEED LEADS WITH THE ROUND',
  FEED.includes("version: '2.392.0',")
  && FEED.includes('The export ledger answers by type')
  && FEED.includes('exp-type'));
ok('THE CHANGELOG LEADS WITH THE ROUND',
  CHANGELOG.startsWith('## [2.392.0] The export ledger answers by type'));
ok('THE VERSION SLOTS AGREE',
  version === '2.392.0'
  && pkg.version === '2.392.0'
  && pkg.mbumah.releaseVersion === '2.392.0'
  && pkg.mbumah.baseVersion === '2.392.0');

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
