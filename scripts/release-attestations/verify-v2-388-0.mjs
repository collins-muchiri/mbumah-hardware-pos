#!/usr/bin/env node
// verify-v2-388-0.mjs — the round's FEATURE gate (v2.388.0 "the M-Pesa
// ledger answers the address bar"). The release MECHANICS live in
// verify-current.mjs. This script pins only what is NEW this round: the
// twenty-seventh word (the one home's vocabulary, the desk's cast-free
// seed), the sub-tab amendment's second application (the landing raises
// the M-PESA pane; the two-word negotiation), the purple chip (the
// fifth shade-split, before the lens, inside the pane), the retirement
// door, and the release's own slots.
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
const SUITE = read('src/tests/bank-mpesa-deep-link-v2388.test.ts');
const CONSTITUTION = read('src/tests/transfer-status-deep-link-v2357.test.ts');
const STRESS = read('src/tests/family-registry-stress-v2370.test.ts');
const FEED = read('src/lib/whats-new.ts');
const pkg = JSON.parse(read('package.json'));
const version = read('VERSION').trim();

console.log('— the twenty-seventh word —');
ok('THE ONE HOME SPEAKS THE VOCABULARY',
  HOME.includes("export const BANK_MPESA_FILTERS = [")
  && HOME.includes("'PENDING',") && HOME.includes("'MATCHED',")
  && HOME.includes("'UNMATCHED',") && HOME.includes("'DISPUTED',"));
ok('THE HOME CARRIES THE PROMISE (the twenty-seventh)',
  HOME.includes('v2.388.0 — THE PROMISE KEPT, THE TWENTY-SEVENTH WORD')
  && HOME.includes('`bank-mpesa`'));
ok('THE DESK SEEDS THROUGH THE ONE HOME (never a local parser)',
  DESK.includes("parseInitialNamedMember(window.location.search, 'bank-mpesa', BANK_MPESA_FILTERS, 'all')"));
ok('THE SEED IS CAST-FREE (the parser IS the union)',
  DESK.includes('function initialMpesaStatus(): (typeof BANK_MPESA_FILTERS)[number] {')
  && !DESK.includes('initialMpesaStatus() as'));
ok('THE WRITE-ONCE PAIR (the read-once law)',
  DESK.includes('const [landedMpesaStatus] = useState<BankMpesaWordValue>(initialMpesaStatus);')
  && DESK.includes('const [mpesaFilterStatus, setMpesaFilterStatus] = useState<string>(initialMpesaStatus);'));

console.log('— the sub-tab amendment\u2019s second application —');
ok('THE LANDING RAISES THE PANE IT LANDS INTO (the two-word negotiation)',
  DESK.includes("if (initialMpesaStatus() !== 'all') return 'mpesa';")
  && DESK.includes("return initialBankType() !== 'all' ? 'transactions' : 'accounts';"));
ok('THE CHIP SITS INSIDE THE PANE, BEFORE THE LENS (the two position laws)',
  DESK.indexOf('<TabsContent value="mpesa"') > -1
  && DESK.indexOf('data-testid="bank-mpesa-landing-word"') > DESK.indexOf('<TabsContent value="mpesa"')
  && DESK.indexOf('data-testid="bank-mpesa-landing-word"') < DESK.indexOf('<Select value={mpesaFilterStatus} onValueChange={chooseMpesaStatus}>'));

console.log('— the purple chip (the fifth shade-split) —');
ok('THE CHIP WEARS PURPLE AT 300/100 WITH ITS DARK WARDROBE',
  DESK.includes('border-purple-300 bg-purple-100 text-purple-700')
  && DESK.includes('dark:border-purple-500/30 dark:bg-purple-500/10 dark:text-purple-300')
  && DESK.includes('focus-visible:ring-purple-400'));
ok('BOTH CHIP HUES COEXIST WITHOUT COLLIDING',
  DESK.includes('border-sky-300 bg-sky-100 text-sky-700')
  && !DESK.includes('border-blue-300 bg-blue-100')
  && !DESK.includes('border-orange-300 bg-orange-100')
  && !DESK.includes('border-teal-300 bg-teal-100')
  && !DESK.includes('border-lime-300 bg-lime-100'));

console.log('— the retirement door —');
ok('EVERY HAND-DRIVEN CHANGE RIDES THE DOOR',
  DESK.includes('const chooseMpesaStatus = (value: string) => {')
  && DESK.includes('<Select value={mpesaFilterStatus} onValueChange={chooseMpesaStatus}>')
  && DESK.includes('setMpesaLandingLive(false);'));
ok('THE CHIP DISMISSES AND CLEARS THE LENS IT SEEDED',
  /onClick=\{\(\) => \{\s*\n\s*setMpesaFilterStatus\('all'\);\s*\n\s*setMpesaLandingLive\(false\);/.test(DESK));

console.log('— the constitution and the feed —');
ok('THE CONSTITUTION WALKS TWENTY-SEVEN OVER TWENTY-THREE (one desk owns two)',
  CONSTITUTION.includes('(twenty-seven words, twenty-three desks)')
  && CONSTITUTION.includes("{ word: 'bank-mpesa', desk: 'src/app/(shell)/tabs/banking-tab.tsx', family: 'border-purple-300', suite: 'src/tests/bank-mpesa-deep-link-v2388.test.ts' }")
  && CONSTITUTION.includes("'TWENTY-SEVENTH'"));
ok('THE REGISTRY STRESS RE-DERIVES THE ARITHMETIC',
  STRESS.includes('.size).toBe(27)')
  && STRESS.includes("'bank-mpesa',")
  && STRESS.includes("'TWENTY-SEVENTH',"));
ok('THE SUITE EXISTS AND PINS THE ROUND',
  SUITE.length > 4000 && SUITE.includes("THE M-PESA LEDGER'S OWN WORD"));
ok('THE FEED\u2019S LEAD ENTRY IS THE ROUND',
  FEED.indexOf("version: '2.388.0'") >= 0
  && FEED.indexOf("version: '2.388.0'") < FEED.indexOf("version: '2.387.0'"));
ok('THE VERSION SLOTS SPEAK 2.388.0',
  version === '2.388.0' && pkg.version === '2.388.0'
  && pkg.mbumah.releaseVersion === '2.388.0' && pkg.mbumah.baseVersion === '2.388.0');

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
