#!/usr/bin/env node
// verify-v2-387-0.mjs — the round's FEATURE gate (v2.387.0 "the bank
// ledger answers the address bar"). The release MECHANICS live in
// verify-current.mjs. This script pins only what is NEW this round: the
// twenty-sixth word (the one home's vocabulary, the desk's cast-free
// seed), the sub-tab amendment (the landing raises the pane), the sky
// chip (the fourth shade-split, before the lens, inside the pane), the
// retirement door, and the release's own slots.
// THE OD LAW: bytes, not memory.
import { readFileSync } from 'node:fs';

let pass = 0, fail = 0;
const ok = (name, cond) => {
  if (cond) { pass++; console.log(`  ok  ${name}`); }
  else { fail++; console.error(`x FAIL ${name}`); }
};
const read = (p) => readFileSync(p, 'utf8');

const DESK = read('src/app/(shell)/tabs/banking-tab.tsx');
const HOME = read('src/lib/tab-url.ts');
const SUITE = read('src/tests/bank-type-deep-link-v2387.test.ts');
const CONSTITUTION = read('src/tests/transfer-status-deep-link-v2357.test.ts');
const STRESS = read('src/tests/family-registry-stress-v2370.test.ts');
const FEED = read('src/lib/whats-new.ts');
const pkg = JSON.parse(read('package.json'));
const version = read('VERSION').trim();

console.log('— the twenty-sixth word —');
ok('THE ONE HOME SPEAKS THE VOCABULARY',
  HOME.includes("export const BANK_TYPE_FILTERS = [")
  && HOME.includes("'DEPOSIT',") && HOME.includes("'WITHDRAWAL',")
  && HOME.includes("'TRANSFER',") && HOME.includes("'FEE',")
  && HOME.includes("'INTEREST',"));
ok('THE HOME CARRIES THE PROMISE (the twenty-sixth)',
  HOME.includes('v2.387.0 — THE PROMISE KEPT, THE TWENTY-SIXTH WORD')
  && HOME.includes('`bank-type`'));
ok('THE DESK SEEDS THROUGH THE ONE HOME (never a local parser)',
  DESK.includes("parseInitialNamedMember(window.location.search, 'bank-type', BANK_TYPE_FILTERS, 'all')"));
ok('THE SEED IS CAST-FREE (the parser IS the union)',
  DESK.includes('function initialBankType(): (typeof BANK_TYPE_FILTERS)[number] {')
  && !DESK.includes('initialBankType() as'));
ok('THE WRITE-ONCE PAIR (the read-once law)',
  DESK.includes('const [landedBankType] = useState<BankTypeWordValue>(initialBankType);')
  && DESK.includes('const [txFilterType, setTxFilterType] = useState<string>(initialBankType);'));

console.log('— the sub-tab amendment —');
ok('THE LANDING RAISES THE PANE IT LANDS INTO',
  DESK.includes("useState(() => (initialBankType() !== 'all' ? 'transactions' : 'accounts'))"));
ok('THE CHIP SITS INSIDE THE PANE, BEFORE THE LENS (the two position laws)',
  DESK.indexOf('<TabsContent value="transactions"') > -1
  && DESK.indexOf('data-testid="bank-type-landing-word"') > DESK.indexOf('<TabsContent value="transactions"')
  && DESK.indexOf('data-testid="bank-type-landing-word"') < DESK.indexOf('<Select value={txFilterType} onValueChange={chooseBankType}>'));

console.log('— the sky chip (the fourth shade-split) —');
ok('THE CHIP WEARS SKY AT 300/100 WITH ITS DARK WARDROBE',
  DESK.includes('border-sky-300 bg-sky-100 text-sky-700')
  && DESK.includes('dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-300')
  && DESK.includes('focus-visible:ring-sky-400'));
ok('NO OTHER CHIP HUE COLLIDES ON THE DESK',
  !DESK.includes('border-blue-300 bg-blue-100')
  && !DESK.includes('border-orange-300 bg-orange-100')
  && !DESK.includes('border-teal-300 bg-teal-100')
  && !DESK.includes('border-lime-300 bg-lime-100'));

console.log('— the retirement door —');
ok('EVERY HAND-DRIVEN CHANGE RIDES THE DOOR',
  DESK.includes('const chooseBankType = (value: string) => {')
  && DESK.includes('<Select value={txFilterType} onValueChange={chooseBankType}>')
  && DESK.includes('setBankLandingLive(false);'));
ok('THE CHIP DISMISSES AND CLEARS THE LENS IT SEEDED',
  /onClick=\{\(\) => \{\s*\n\s*setTxFilterType\('all'\);\s*\n\s*setBankLandingLive\(false\);/.test(DESK));

console.log('— the constitution and the feed —');
ok('THE CONSTITUTION WALKS TWENTY-SIX OVER TWENTY-THREE',
  CONSTITUTION.includes('(twenty-six words, twenty-three desks)')
  && CONSTITUTION.includes("{ word: 'bank-type', desk: 'src/app/(shell)/tabs/banking-tab.tsx', family: 'border-sky-300', suite: 'src/tests/bank-type-deep-link-v2387.test.ts' }")
  && CONSTITUTION.includes("'TWENTY-SIXTH'"));
ok('THE REGISTRY STRESS RE-DERIVES THE ARITHMETIC',
  STRESS.includes('.size).toBe(23)') && STRESS.includes('.size).toBe(26)')
  && STRESS.includes("'TWENTY-SIXTH',"));
ok('THE SUITE EXISTS AND PINS THE ROUND',
  SUITE.length > 4000 && SUITE.includes("THE BANKING DESK'S OWN WORD"));
ok('THE FEED\u2019S LEAD ENTRY IS THE ROUND',
  FEED.indexOf("version: '2.387.0'") >= 0
  && FEED.indexOf("version: '2.387.0'") < FEED.indexOf("version: '2.386.0'"));
ok('THE VERSION SLOTS SPEAK 2.387.0',
  version === '2.387.0' && pkg.version === '2.387.0');

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
