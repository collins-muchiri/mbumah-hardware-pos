#!/usr/bin/env node
// verify-v2-393-0.mjs — the round's FEATURE gate (v2.393.0 "message
// templates answer by name"). The release MECHANICS live in
// verify-current.mjs. This script pins only what is NEW this round: the
// thirty-second word (the one home's vocabulary, the desk's cast-free
// seed, the stage amendment's fourth application), the family's first
// card-grid lens (the narrowed grid, the count line, the Use-Template
// door), the yellow chip (the tenth shade-split), and the release's own
// slots.
// THE OD LAW: bytes, not memory.
import { readFileSync } from 'node:fs';

let pass = 0, fail = 0;
const ok = (name, cond) => {
  if (cond) { pass++; console.log(`  ok  ${name}`); }
  else { fail++; console.error(`x FAIL ${name}`); }
};
const read = (p) => readFileSync(p, 'utf8');

const DESK = read('src/app/(shell)/tabs/messaging-tab.tsx');
const HOME = read('src/lib/tab-url.ts');
const SUITE = read('src/tests/msg-template-deep-link-v2393.test.ts');
const CONSTITUTION = read('src/tests/transfer-status-deep-link-v2357.test.ts');
const STRESS = read('src/tests/family-registry-stress-v2370.test.ts');
const FEED = read('src/lib/whats-new.ts');
const CHANGELOG = read('CHANGELOG.md');
const pkg = JSON.parse(read('package.json'));
const version = read('VERSION').trim();

console.log('— the thirty-second word —');
ok('THE ONE HOME SPEAKS THE VOCABULARY',
  HOME.includes("export const MSG_TEMPLATE_FILTERS = [")
  && HOME.includes("'christmas',") && HOME.includes("'balance-update',")
  && HOME.includes("'debt-reminder',"));
ok('THE HOME CARRIES THE PROMISE (the thirty-second)',
  HOME.includes('v2.393.0 — THE PROMISE KEPT, THE THIRTY-SECOND WORD')
  && HOME.includes('`msg-template`'));
ok('THE DESK SEEDS THROUGH THE ONE HOME (never a local parser)',
  DESK.includes("parseInitialNamedMember(window.location.search, 'msg-template', MSG_TEMPLATE_FILTERS, 'all')"));
ok('THE SEED IS CAST-FREE (the parser IS the union)',
  DESK.includes('function initialMsgTemplate(): (typeof MSG_TEMPLATE_FILTERS)[number] {')
  && !DESK.includes('initialMsgTemplate() as'));
ok('THE WRITE-ONCE TRIO (the read-once law)',
  DESK.includes('const [landedMsgTemplate] = useState<MsgTemplateWordValue>(initialMsgTemplate);')
  && DESK.includes('const [msgTemplateFilter, setMsgTemplateFilter] = useState<MsgTemplateWordValue>(initialMsgTemplate);')
  && DESK.includes("const [msgTemplateLandingLive, setMsgTemplateLandingLive] = useState(() => initialMsgTemplate() !== 'all');"));

console.log('— the stage amendment\u2019s fourth application —');
ok('THE STAGE SEED READS THE WORD (the Templates pane raises)',
  DESK.includes("initialMsgTemplate() !== 'all' ? 'templates' : 'dashboard'"));

console.log('— the family\u2019s first card-grid lens —');
ok('THE GRID ITSELF NARROWS (the lens face is the grid)',
  DESK.includes('const visibleTemplates = useMemo(() => {')
  && DESK.includes('return MESSAGE_TEMPLATES.filter((t) => t.id === msgTemplateFilter);')
  && DESK.includes('{visibleTemplates.map((template) => {'));
ok('THE COUNT LINE SPEAKS THE NARROWING',
  DESK.includes('Showing {visibleTemplates.length} of {MESSAGE_TEMPLATES.length} templates'));
ok('THE USE-TEMPLATE HAND RIDES THE RETIREMENT DOOR (the second voice)',
  DESK.includes('const chooseMsgTemplateFromLens = () => {')
  && DESK.includes('chooseMsgTemplateFromLens();'));

console.log('— the yellow chip —');
ok('THE CHIP WEARS YELLOW AT 300/100 (the tenth shade-split)',
  DESK.includes('border-yellow-300 bg-yellow-100 text-yellow-700')
  && DESK.includes('dark:border-yellow-500/30 dark:bg-yellow-500/10 dark:text-yellow-300'));
ok('THE RING IS THE FAMILY\u2019S (focus-visible)',
  DESK.includes('focus-visible:ring-yellow-400'));
ok('THE HANDLE IS THE FULL WORD',
  DESK.includes('data-testid="msg-template-landing-word"'));
ok('THE GROUP-HOVER DETAIL (the X fades up)',
  DESK.includes('opacity-60 transition-opacity group-hover:opacity-100'));
ok('THE CHIP SITS BEFORE THE GRID IT LANDS INTO',
  DESK.indexOf('data-testid="msg-template-landing-word"') > DESK.indexOf('<TabsContent value="templates"')
  && DESK.indexOf('data-testid="msg-template-landing-word"') < DESK.indexOf('{visibleTemplates.map((template) => {'));
ok('THE YELLOW SPEAKS EXACTLY ONE WARDROBE ON THE DESK (the masquerade law)',
  DESK.split('border-yellow-').length - 1 === 2 // the light + dark border faces of ONE wardrobe
  && DESK.split('bg-yellow-100').length - 1 === 1);

console.log('— the constitution and the suite —');
ok('THE CONSTITUTION WALKS THIRTY-TWO WORDS OVER TWENTY-SIX DESKS',
  CONSTITUTION.includes('(thirty-two words, twenty-six desks)')
  && CONSTITUTION.includes("{ word: 'msg-template', desk: 'src/app/(shell)/tabs/messaging-tab.tsx', family: 'border-yellow-300', suite: 'src/tests/msg-template-deep-link-v2393.test.ts' }")
  && CONSTITUTION.includes("'THIRTY-SECOND'"));
ok('THE STRESS RE-DERIVES (32/26/32 + the roll)',
  STRESS.includes('parses THIRTY-TWO rows') && STRESS.includes('rows.length).toBe(32)')
  && STRESS.includes("'msg-template',")
  && STRESS.includes("'THIRTY-SECOND',"));
ok('THE SUITE EXISTS AND PINS ITS OWN ROW',
  SUITE.includes('?msg-template=') && SUITE.includes('border-yellow-300'));

console.log('— the release slots —');
ok('THE FEED LEADS WITH THE ROUND',
  FEED.includes("version: '2.393.0',")
  && FEED.includes('Message templates answer by name')
  && FEED.includes('msg-template'));
ok('THE CHANGELOG LEADS WITH THE ROUND',
  CHANGELOG.startsWith('## [2.393.0] Message templates answer by name'));
ok('THE VERSION SLOTS AGREE',
  version === '2.393.0'
  && pkg.version === '2.393.0'
  && pkg.mbumah.releaseVersion === '2.393.0'
  && pkg.mbumah.baseVersion === '2.393.0');

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
