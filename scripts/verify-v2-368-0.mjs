#!/usr/bin/env node
// verify-v2-368-0.mjs — the round's FEATURE gate (v2.368.0 "the ledger
// answers the address bar in its own name"). The release MECHANICS live in
// verify-current.mjs. This script pins only what is NEW this round: the
// twenty-first word AND the migration (the alias parser, the stage parser,
// the door's canonical form).
// THE OD LAW: bytes, not memory. Run BEFORE the walk; the walk-dependent
// pins sit in the tail section.
import { readFileSync } from 'node:fs';

let pass = 0, fail = 0;
const ok = (name, cond) => {
  if (cond) { pass++; console.log(`  ok  ${name}`); }
  else { fail++; console.error(`x FAIL ${name}`); }
};
const read = (p) => readFileSync(p, 'utf8');

const DESK = read('src/app/(shell)/tabs/loyalty-tab.tsx');
const HOME = read('src/lib/tab-url.ts');
const DOOR = read('src/components/workspace/org-console.tsx');
const TEST = read('src/tests/ly-type-deep-link-v2368.test.ts');
const CONSTITUTION = read('src/tests/transfer-status-deep-link-v2357.test.ts');
const whatsNew = read('src/lib/whats-new.ts');
const changelog = read('CHANGELOG.md');
const pkg = JSON.parse(read('package.json'));
const version = read('VERSION').trim();

console.log('— the legacy-word sunset law (the home) —');
ok('THE ALIAS PARSER EXISTS (canonical wins, the bare word answers)',
  HOME.includes('export function parseInitialNamedMemberWithAlias')
  && HOME.includes('params.get(canonical) ?? params.get(legacyAlias)')
  && HOME.includes('THE LEGACY-WORD SUNSET LAW'));
ok('THE STAGE PARSER EXISTS (the two-address design, one home)',
  HOME.includes('export function parseInitialStage')
  && HOME.includes('THE TWO-ADDRESS DESIGN'));
ok('THE HOME CARRIES THE TWENTY-FIRST-WORD NOTE',
  HOME.includes('v2.368.0 — THE PROMISE KEPT, THE TWENTY-FIRST WORD'));
ok('THE OLDER PARSERS STAY (the v2316 truth table\u2019s law, kept for the record)',
  HOME.includes('export function parseInitialType')
  && HOME.includes('export function parseInitialNamedMember'));

console.log('— the twenty-first word (the desk) —');
ok('THE WORD BLOCK speaks its law (the migration, the sunset, the alias)',
  DESK.includes("export const LY_TX_FILTERS = ['all', 'EARN', 'REDEEM', 'BONUS', 'EXPIRE', 'ADJUST'] as const;")
  && DESK.includes("parseInitialNamedMemberWithAlias(window.location.search, 'ly-type', 'type', LY_TX_FILTERS, 'all')")
  && DESK.includes("THE LOYALTY DESK'S OWN WORD")
  && DESK.includes('THE LEGACY-WORD SUNSET LAW'));
ok('THE SEED IS CAST-FREE (the generic parser IS the union, the string-typed seed GONE)',
  DESK.includes('const [txTypeFilter, setTxTypeFilter] = useState<LyTypeFilter>(initialLyType);')
  && DESK.includes('function initialLyType(): LyTypeFilter {')
  && DESK.includes('type LyTypeFilter = (typeof LY_TX_FILTERS)[number];')
  && !DESK.includes('initialLyType() as')
  && !DESK.includes('useState<string>(initialTxTypeFilter)'));
ok('THE LANDING WORD IS READ-ON-MOUNT (the one-writer law)',
  DESK.includes('const [landedLyType] = useState<LyTypeFilter>(initialLyType);')
  && DESK.includes('const [lyLandingLive, setLyLandingLive] = useState(true);'));
ok('THE STAGE SEED READS THE LANDED WORD (the two-address design, mounting bytes)',
  DESK.includes("parseInitialStage(window.location.search, LOYALTY_SUB_TABS, 'transactions', landedLyType !== 'all', 'tiers')")
  && DESK.includes('THE TWO-ADDRESS DESIGN'));
ok('THE NEUTRAL IS LOWERCASE (the Select\u2019s own all-item key)',
  DESK.includes("if (typeof window === 'undefined') return 'all';")
  && DESK.includes("<SelectItem value=\"all\">All Types</SelectItem>"));
ok('THE TYPED CHOOSER IS THE ONLY WRITER (exactly one onValueChange, the bare setter GONE)',
  DESK.match(/onValueChange=\{chooseLyType\}/g)?.length === 1
  && !DESK.includes('onValueChange={setTxTypeFilter}'));
ok('THE WORD FILTERS THE LEDGER (the query feed)',
  DESK.includes("transactionType: txTypeFilter !== 'all' ? txTypeFilter : undefined,"));
ok('THE DESK COMMENT IS PROSE-COLLISION CLEAN (the English compound, no foreign literal)',
  !DESK.includes("'po-status'")
  && !DESK.includes("'sec-type'")
  && DESK.includes("the purchase-orders roster's word"));

console.log('— the twenty-first wearing —');
ok('THE CHIP RENDERS ONLY WHILE LIVE AND UNTOUCHED',
  DESK.includes("lyLandingLive && landedLyType !== 'all' && txTypeFilter === landedLyType")
  && DESK.includes('data-testid="ly-type-landing-word"'));
ok('THE CHIP NAMES THE CANONICAL WORD ALWAYS',
  DESK.includes('landed ?ly-type={landedLyType}')
  && DESK.includes('even when the landing rode the legacy alias'));
ok('THE CHIP WEARS THE TWENTY-FIRST FAMILY (green) IN BOTH MODES + the exhaustion note',
  DESK.includes('border-green-200 bg-green-50 text-green-700')
  && DESK.includes('dark:border-green-500/30 dark:bg-green-500/10 dark:text-green-300')
  && DESK.includes('THE TWENTY-FIRST WEARING')
  && DESK.includes('the last wearable hue'));
ok('THE WEARING IS HONEST (the chip borrows the ink, never the badge forms)',
  DESK.includes('text-green-700 is the')
  && (() => {
    const at = DESK.indexOf('data-testid="ly-type-landing-word"');
    const chip = DESK.slice(Math.max(0, at - 700), at);
    return chip.includes('hover:bg-green-100')
      && chip.includes('focus-visible:ring-green-400')
      && !chip.includes('dark:bg-green-900/30')
      && !chip.includes('dark:text-green-400');
  })()
  && DESK.includes('dark:bg-green-900/30'));
ok('THE POSITION LAW (chip before the Select it landed into)',
  DESK.indexOf('data-testid="ly-type-landing-word"') < DESK.indexOf('<Select value={txTypeFilter} onValueChange={chooseLyType}>'));
ok('THE TOOLTIP AND THE GROUP-HOVER DETAIL',
  DESK.includes('title="The ledger landed with this type from the address bar — press to clear it"')
  && DESK.includes('opacity-60 transition-opacity group-hover:opacity-100'));

console.log('— the door —');
ok('THE DOOR MIGRATED (canonical href, the old bare form GONE)',
  DOOR.includes("const EXPIRY_LEDGER_HREF = '/?tab=loyalty&ly-type=EXPIRE';")
  && !DOOR.includes("const EXPIRY_LEDGER_HREF = '/?tab=loyalty&view=transactions&type=EXPIRE';")
  && DOOR.includes('THE DOOR MIGRATED TO THE CANONICAL WORD'));

console.log('— the suite —');
ok('THE SUITE EXISTS AND SPEAKS ITS LAWS',
  TEST.includes('THE LEGACY-WORD SUNSET LAW')
  && TEST.includes('THE CANONICAL WINS')
  && TEST.includes('parseInitialNamedMemberWithAlias')
  && TEST.includes('parseInitialStage'));
ok('THE SUITE\u2019S LEDGER (twenty-five files, the neighbors admitted)',
  TEST.includes("'src/tests/ad-severity-deep-link-v2366.test.ts'")
  && TEST.includes("'src/tests/sec-type-deep-link-v2367.test.ts'")
  && TEST.includes("'src/tests/ly-type-deep-link-v2368.test.ts'")
  && TEST.includes("'src/components/workspace/org-console.tsx'"));

console.log('— the constitution —');
ok('THE TWENTY-FIRST ROW (the registry walks twenty-one words over nineteen desks)',
  CONSTITUTION.includes('(twenty-one words, nineteen desks)')
  && CONSTITUTION.includes("{ word: 'ly-type', desk: 'src/app/(shell)/tabs/loyalty-tab.tsx', family: 'border-green-200', suite: 'src/tests/ly-type-deep-link-v2368.test.ts' }")
  && CONSTITUTION.includes("'TWENTY-FIRST'")
  && CONSTITUTION.includes('twenty-one families, no two alike'));

console.log('— the slots —');
ok('VERSION AND PACKAGE CARRY THE RELEASE', version === '2.368.0' && pkg.version === '2.368.0');
ok('WHATS-NEW CARRIES THE MIGRATION (three bullets, the alias story)',
  whatsNew.includes("version: '2.368.0'")
  && whatsNew.includes('?ly-type=EXPIRE')
  && whatsNew.includes('legacy alias'));
ok('CHANGELOG CARRIES THE MIGRATION',
  changelog.startsWith('## [2.368.0]')
  && changelog.includes('THE LEGACY-WORD SUNSET LAW')
  && changelog.includes('THE TWO-ADDRESS DESIGN'));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
