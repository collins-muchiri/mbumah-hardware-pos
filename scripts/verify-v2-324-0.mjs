#!/usr/bin/env node
// verify-v2-324-0.mjs — the round's FEATURE gate (v2.324.0 "the roster speaks
// its own word, and the door reads the body honestly").
// The release MECHANICS (slots, VERSION, lead placement, CHANGELOG ordering,
// walk marks) live in verify-current.mjs. This script pins only what is NEW
// this round. Every check reads the SOURCE OF RECORD (bytes, not memory) —
// THE OD LAW.
import { readFileSync } from 'node:fs';

let pass = 0, fail = 0;
const ok = (name, cond) => {
  if (cond) { pass++; console.log(`  ok  ${name}`); }
  else { fail++; console.error(`x FAIL ${name}`); }
};
const read = (p) => readFileSync(p, 'utf8');

const route = read('src/app/api/purchase-orders/[id]/route.ts');
const tab = read('src/app/(shell)/tabs/purchase-orders-tab.tsx');
const tabUrl = read('src/lib/tab-url.ts');
const loyalty = read('src/app/(shell)/tabs/loyalty-tab.tsx');
const test = read('src/tests/po-deep-link-v2324.test.ts');
const whatsNew = read('src/lib/whats-new.ts');
const changelog = read('CHANGELOG.md');
const pkg = JSON.parse(read('package.json'));
const docs = read('docs/cron-operations.md');

console.log('— the body\u2019s door (api/purchase-orders/[id]/route.ts) —');
ok('the body parse rides in a try/catch, the bare assign is GONE',
  route.includes('body = await request.json();') && route.includes('} catch {') && !route.includes('const body = await request.json();'));
ok('an empty or malformed body answers 400 with the actions hint',
  route.includes("{ status: 400 }") && route.includes('Request body must be valid JSON') && route.includes('{"action": "delete"}') && route.includes('{"action": "receive"'));
ok('the proof is written where the next reader meets it',
  route.includes('THE BODY IS HONEST ABOUT ITS SHAPE') && route.includes("THE BODY'S DOOR"));
ok('the delete dispatch still guards status and receipts (the door grew, the law stands)',
  route.includes("body.action === 'delete'") && route.includes('Can only delete DRAFT or CANCELLED purchase orders.'));

console.log('— the roster\u2019s own word (lib/tab-url.ts + purchase-orders-tab.tsx) —');
ok('the named parser exists at the parsers\u2019 one home; parseInitialPage delegates',
  tabUrl.includes('export function parseInitialNamedPage(search: string, param: string, fallback = 1): number') && tabUrl.includes("return parseInitialNamedPage(search, 'page', fallback);"));
ok('the desk reads ?po-page= through the one home, SSR-guarded, seeded on mount',
  tab.includes("import { parseInitialNamedPage } from '@/lib/tab-url';") && tab.includes("parseInitialNamedPage(window.location.search, 'po-page', 1)") && tab.includes('useState<number>(initialPoPage)'));
ok('the one-writer law: the desk never writes po-page back to the address bar',
  !tab.split('\n').some((l) => l.includes('po-page') && (l.includes('replaceState') || l.includes('pushState'))));
ok('the collision law holds: loyalty keeps ?page=, the roster speaks ?po-page=',
  loyalty.includes('parseInitialPage(window.location.search, 1)') && !loyalty.includes("'po-page'") && tab.includes("'po-page'"));

console.log('— the face wears the amber (the past-the-end card) —');
ok('the face is a card now (attention, not error)',
  tab.includes('data-testid="po-past-end-card"') && tab.includes('border-amber-200 bg-amber-50/70') && tab.includes('dark:border-amber-900/50 dark:bg-amber-950/30'));
ok('icon + honest line + WHY + way back, and the way back wears the amber',
  tab.includes('<History className="mx-auto h-6 w-6 text-amber-500" aria-hidden="true" />') && tab.includes('data-testid="po-past-end-hint"') && tab.includes('rows were deleted or the ledger shrank since it was made') && tab.includes('border-amber-300 text-amber-800 hover:bg-amber-100'));
ok('the testids kept their names (the voice changed clothes, not identity)',
  tab.includes('data-testid="po-past-end"') && tab.includes('data-testid="po-back-to-one"') && tab.includes('onClick={() => setPage(1)}'));

console.log('— the census wears the pill —');
ok('both census slots and the status ride the pill wardrobe, v2.323 desk-voice pin intact',
  tab.includes('rounded-full bg-muted/60 px-2.5 py-1 text-xs text-muted-foreground tabular-nums" data-testid="po-census-empty"') &&
  tab.includes('rounded-full bg-muted/60 px-2.5 py-1 text-xs text-muted-foreground tabular-nums" data-testid="po-census"') &&
  tab.includes('rounded-md bg-muted py-0.5 font-medium text-sm px-2 tabular-nums"') &&
  tab.includes('text-xs text-muted-foreground tabular-nums" data-testid="po-census-empty"') &&
  tab.includes('text-sm px-2 tabular-nums"'));
ok('the truth-conditional is untouched (the pills dressed the arms, not the law)',
  tab.includes('page > pagination.totalPages') && tab.includes('No rows on this page — the ledger ends at') && tab.includes('Math.min(page * limit, pagination.total)'));

console.log('— the house law —');
ok('loyalty: THE CENSUS NEVER LIES stands; the roster: both laws stand',
  loyalty.includes('THE CENSUS NEVER LIES') && tab.includes('THE CENSUS NEVER LIES') && tab.includes("THE ROSTER'S OWN WORD"));

console.log('— the round\u2019s own test file —');
ok('the test file pins the door, the word, the amber face, the pills, the house law',
  test.includes('body = await request.json();') && test.includes("parseInitialNamedPage('?tab=purchase-orders&po-page=2', 'po-page', 1)") && test.includes('data-testid="po-past-end-card"') && test.includes('rounded-full bg-muted/60') && test.includes('THE CENSUS NEVER LIES'));

console.log('— the release voice —');
ok('whats-new leads with the round\u2019s story', whatsNew.includes("version: '2.324.0',") && whatsNew.includes('The roster speaks its own word') && whatsNew.includes('?po-page='));
ok('the CHANGELOG carries the round (Fixed + Added + Styling + Tests)',
  changelog.includes('## [2.324.0] The roster speaks its own word') && changelog.includes('THE BODY IS HONEST ABOUT ITS SHAPE') && changelog.includes("THE ROSTER'S OWN WORD") && changelog.includes('THE FACE WEARS THE AMBER'));
ok('the manifest answers 2.324.0 in all three slots', pkg.version === '2.324.0' && pkg.mbumah?.releaseVersion === '2.324.0' && pkg.mbumah?.baseVersion === '2.324.0');
ok('the docs register carries the roster note', docs.includes('**v2.324.0**') && docs.includes('the roster speaks its own word'));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
