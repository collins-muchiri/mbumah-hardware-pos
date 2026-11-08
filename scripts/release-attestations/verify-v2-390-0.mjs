#!/usr/bin/env node
// verify-v2-390-0.mjs — the round's FEATURE gate (v2.390.0 "the debt
// ledger answers by the channel"). The release MECHANICS live in
// verify-current.mjs. This script pins only what is NEW this round: the
// twenty-ninth word (the one home's vocabulary, the desk's cast-free
// seed), the two-word negotiation's same-pane form (either word raises
// the History pane; the two chips sit side by side; each retires by its
// own two voices), the fuchsia chip (the seventh shade-split, before
// the channel lens, beside its cyan sibling), the fixture leg's second
// batch, and the release's own slots.
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
const SUITE = read('src/tests/debt-channel-deep-link-v2390.test.ts');
const SIBLING = read('src/tests/debt-status-deep-link-v2389.test.ts');
const CONSTITUTION = read('src/tests/transfer-status-deep-link-v2357.test.ts');
const STRESS = read('src/tests/family-registry-stress-v2370.test.ts');
const FEED = read('src/lib/whats-new.ts');
const FIXTURE = read('scripts/qa-seed-debt-reminders.mjs');
const pkg = JSON.parse(read('package.json'));
const version = read('VERSION').trim();

console.log('— the twenty-ninth word —');
ok('THE ONE HOME SPEAKS THE VOCABULARY',
  HOME.includes("export const DEBT_CHANNEL_FILTERS = [")
  && HOME.includes("'SMS',") && HOME.includes("'WHATSAPP',")
  && HOME.includes("'EMAIL',") && HOME.includes("'IN_APP',"));
ok('THE HOME CARRIES THE PROMISE (the twenty-ninth)',
  HOME.includes('v2.390.0 — THE PROMISE KEPT, THE TWENTY-NINTH WORD')
  && HOME.includes('`debt-channel`'));
ok('THE DESK SEEDS THROUGH THE ONE HOME (never a local parser)',
  DESK.includes("parseInitialNamedMember(window.location.search, 'debt-channel', DEBT_CHANNEL_FILTERS, 'all')"));
ok('THE SEED IS CAST-FREE (the parser IS the union)',
  DESK.includes('function initialDebtChannel(): (typeof DEBT_CHANNEL_FILTERS)[number] {')
  && !DESK.includes('initialDebtChannel() as'));
ok('THE WRITE-ONCE PAIR (the read-once law)',
  DESK.includes('const [landedDebtChannel] = useState<DebtChannelWordValue>(initialDebtChannel);')
  && DESK.includes('const [typeFilter, setTypeFilter] = useState<string>(initialDebtChannel);'));

console.log('— the two-word negotiation\u2019s same-pane form —');
ok('EITHER WORD RAISES THE PANE THEY SHARE',
  DESK.includes("const [activeTab, setActiveTab] = useState(() => (initialDebtStatus() !== 'all' || initialDebtChannel() !== 'all' ? 'history' : 'board'));"));
ok('THE SIBLING SEED STILL SPEAKS (the first word untouched)',
  DESK.includes("parseInitialNamedMember(window.location.search, 'debt-status', DEBT_STATUS_FILTERS, 'all')"));
ok('THE CHIP SITS BEFORE ITS LENS, BESIDE ITS CYAN SIBLING (the position laws)',
  DESK.indexOf('data-testid="debt-status-landing-word"') > -1
  && DESK.indexOf('data-testid="debt-channel-landing-word"') > DESK.indexOf('data-testid="debt-status-landing-word"')
  && DESK.indexOf('data-testid="debt-channel-landing-word"') < DESK.indexOf('<Select value={typeFilter} onValueChange={chooseDebtChannel}>'));
ok('EACH LENS OWNS ITS OWN DOOR (the retirement doors)',
  DESK.includes('const chooseDebtChannel = (v: string) => {')
  && DESK.includes('const chooseDebtStatus = (v: string) => {')
  && DESK.includes('setDebtChannelLandingLive(false);')
  && DESK.includes('setDebtLandingLive(false);'));

console.log('— the fuchsia chip (the seventh shade-split) —');
ok('THE CHIP WEARS FUCHSIA AT 300/100 WITH ITS DARK WARDROBE',
  DESK.includes('border-fuchsia-300 bg-fuchsia-100 text-fuchsia-700')
  && DESK.includes('dark:border-fuchsia-500/30 dark:bg-fuchsia-500/10 dark:text-fuchsia-300')
  && DESK.includes('focus-visible:ring-fuchsia-400'));
ok('THE SIBLING CHIPS COEXIST WITHOUT COLLIDING',
  DESK.includes('border-cyan-300 bg-cyan-100 text-cyan-700')
  && !DESK.includes('border-purple-300 bg-purple-100')
  && !DESK.includes('border-sky-300 bg-sky-100')
  && !DESK.includes('border-orange-300 bg-orange-100')
  && !DESK.includes('border-teal-300 bg-teal-100')
  && !DESK.includes('border-lime-300 bg-lime-100')
  && !DESK.includes('border-fuchsia-200'));

console.log('— the fixture leg\u2019s second batch —');
ok('THE CHANNEL ROWS EXIST IN THE FIXTURE (per-batch guards)',
  FIXTURE.includes('QA-DEBT-REM2')
  && FIXTURE.includes("reminderType: 'WHATSAPP'")
  && FIXTURE.includes("reminderType: 'EMAIL'")
  && FIXTURE.includes('existing2 ? [] : channelRows'));

console.log('— the constitution and the feed —');
ok('THE CONSTITUTION WALKS TWENTY-NINE OVER TWENTY-FOUR (the two-word club grows)',
  CONSTITUTION.includes('(twenty-nine words, twenty-four desks)')
  && CONSTITUTION.includes("{ word: 'debt-channel', desk: 'src/app/(shell)/tabs/debt-management-tab.tsx', family: 'border-fuchsia-300', suite: 'src/tests/debt-channel-deep-link-v2390.test.ts' }")
  && CONSTITUTION.includes("'TWENTY-NINTH'"));
ok('THE REGISTRY STRESS RE-DERIVES THE ARITHMETIC',
  STRESS.includes('.size).toBe(29)')
  && STRESS.includes("'debt-channel',")
  && STRESS.includes("'TWENTY-NINTH',"));
ok('THE SUITE EXISTS AND PINS THE ROUND',
  SUITE.length > 4000 && SUITE.includes("THE DEBT LEDGER'S SECOND WORD"));
ok('THE SIBLING SUITE CARRIES THE HAND-OVER (the pane pin reads both words)',
  SIBLING.includes("initialDebtStatus() !== 'all' || initialDebtChannel() !== 'all'"));
ok('THE FEED\u2019S LEAD ENTRY IS THE ROUND',
  FEED.indexOf("version: '2.390.0'") >= 0
  && FEED.indexOf("version: '2.390.0'") < FEED.indexOf("version: '2.389.0'"));
ok('THE VERSION SLOTS SPEAK 2.390.0',
  version === '2.390.0' && pkg.version === '2.390.0'
  && pkg.mbumah.releaseVersion === '2.390.0' && pkg.mbumah.baseVersion === '2.390.0');

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
