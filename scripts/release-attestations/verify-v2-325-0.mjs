#!/usr/bin/env node
// verify-v2-325-0.mjs — the round's FEATURE gate (v2.325.0 "the body door
// reads every room"). The release MECHANICS (slots, VERSION, lead placement,
// CHANGELOG ordering, walk marks) live in verify-current.mjs. This script
// pins only what is NEW this round. Every check reads the SOURCE OF RECORD
// (bytes, not memory) — THE OD LAW.
import { readFileSync } from 'node:fs';

let pass = 0, fail = 0;
const ok = (name, cond) => {
  if (cond) { pass++; console.log(`  ok  ${name}`); }
  else { fail++; console.error(`x FAIL ${name}`); }
};
const read = (p) => readFileSync(p, 'utf8');

const helper = read('src/lib/request-body.ts');
const tab = read('src/app/(shell)/tabs/purchase-orders-tab.tsx');
const test = read('src/tests/body-door-class-v2325.test.ts');
const whatsNew = read('src/lib/whats-new.ts');
const changelog = read('CHANGELOG.md');
const pkg = JSON.parse(read('package.json'));
const docs = read('docs/cron-operations.md');

const DOOR_FILES = [
  'src/app/api/branches/[id]/route.ts',
  'src/app/api/categories/[id]/route.ts',
  'src/app/api/customer-credits/[id]/route.ts',
  'src/app/api/customers/[id]/route.ts',
  'src/app/api/delivery-notes/[id]/route.ts',
  'src/app/api/expenses/[id]/route.ts',
  'src/app/api/financial/accounts/[id]/route.ts',
  'src/app/api/financial/budgets/[id]/route.ts',
  'src/app/api/financial/periods/[id]/route.ts',
  'src/app/api/gift-cards/[id]/route.ts',
  'src/app/api/invoices/[id]/route.ts',
  'src/app/api/leaves/route.ts',
  'src/app/api/products/[id]/route.ts',
  'src/app/api/rentals/[id]/route.ts',
  'src/app/api/security/block-ip/route.ts',
  'src/app/api/store-transfers/[id]/route.ts',
  'src/app/api/suppliers/[id]/route.ts',
  'src/app/api/system-config/route.ts',
  'src/app/api/vouchers/[id]/route.ts',
];
const doorSrc = new Map(DOOR_FILES.map((f) => [f, read(f)]));

console.log('— the door home (lib/request-body.ts) —');
ok('the law is written where the next reader meets it',
  helper.includes('THE BODY DOOR (v2.325.0)') && helper.includes('never a JSON.parse') && helper.includes('SyntaxError wearing a 500'));
ok('readJsonBody never throws and rejects non-objects',
  helper.includes('export async function readJsonBody') && helper.includes("if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed))") && helper.includes('return { ok: false };'));
ok('bodyDoorRejected answers 400 in the house voice, hint only when named',
  helper.includes('export function bodyDoorRejected(hint?: string)') && helper.includes('{ status: 400 }') && helper.includes('...(hint ? { hint } : {})') && helper.includes('a body-less request cannot describe its changes'));
ok('the sweep census is named (21 doors, 19 files, the class provenance)',
  helper.includes('21 more bare') && helper.includes('19 routes'));

console.log('— the class is gone (19 files read through the door) —');
let doorImports = 0, doorMarkers = 0, bareReads = 0;
for (const [, src] of doorSrc) {
  if (src.includes("import { readJsonBody, bodyDoorRejected } from '@/lib/request-body';")) doorImports++;
  if (src.includes('THE BODY DOOR: an unreadable body is a client mistake')) doorMarkers++;
  if (/(?:const|let|var)\s+\w+\s*=\s*await request\.json\(\)/.test(src)) bareReads++;
}
ok(`all 19 import the door (${doorImports}/19)`, doorImports === 19);
ok(`all 19 carry the marker (${doorMarkers}/19)`, doorMarkers === 19);
ok('not one declaring bare read remains (0/19)', bareReads === 0);
ok('leaves carries TWO doors (create + decide)',
  (doorSrc.get('src/app/api/leaves/route.ts').match(/readJsonBody</g) || []).length === 2);
ok('block-ip carries TWO doors (block + unblock)',
  (doorSrc.get('src/app/api/security/block-ip/route.ts').match(/readJsonBody</g) || []).length === 2);
ok('the hints name the shapes the routes understand (periods / leave decision / ip block / transfer receive)',
  doorSrc.get('src/app/api/financial/periods/[id]/route.ts').includes('"CLOSE" | "LOCK" | "REOPEN"') &&
  doorSrc.get('src/app/api/leaves/route.ts').includes('"APPROVE" | "REJECT" | "CANCEL" | "EDIT"') &&
  doorSrc.get('src/app/api/security/block-ip/route.ts').includes('"ipAddress"') &&
  doorSrc.get('src/app/api/store-transfers/[id]/route.ts').includes('"items"'));
ok('the typed generics carry the fields the handlers narrow (customers phone, vouchers value, transfers items)',
  doorSrc.get('src/app/api/customers/[id]/route.ts').includes('{ phone?: string; [key: string]: unknown }') &&
  doorSrc.get('src/app/api/vouchers/[id]/route.ts').includes('value?: number') &&
  doorSrc.get('src/app/api/store-transfers/[id]/route.ts').includes('Array<{ productId: string; receivedQty?: number }>'));
ok('the financial/accounts optional-body try stands (the safe non-declaring shape the door grew from)',
  doorSrc.get('src/app/api/financial/accounts/[id]/route.ts').includes('body = await request.json();') &&
  doorSrc.get('src/app/api/financial/accounts/[id]/route.ts').includes('readJsonBody'));

console.log('— the pager speaks beside the face (purchase-orders-tab.tsx) —');
ok('the hoist marker names the law and the census law keeps its name',
  tab.includes('THE PAGER SPEAKS BESIDE THE FACE') && tab.includes('THE CENSUS NEVER LIES') && tab.includes('only the address moved'));
ok('the bar sits AFTER the rows-branch ternary close (the hoisted address)',
  tab.includes('            </>\n          )}\n\n          {/* v2.325.0 — THE PAGER SPEAKS BESIDE THE FACE'));
ok('exactly ONE home renders the bar',
  tab.split('{pagination && pagination.totalPages > 1 && (').length - 1 === 1);
ok('the old in-fragment pagination comment is gone',
  !tab.includes('{/* Pagination — v2.323.0'));
ok('the v2.323 census pins hold byte-for-byte (pills, truth-conditional, a11y)',
  tab.includes('rounded-full bg-muted/60 px-2.5 py-1 text-xs text-muted-foreground tabular-nums" data-testid="po-census-empty"') &&
  tab.includes('rounded-full bg-muted/60 px-2.5 py-1 text-xs text-muted-foreground tabular-nums" data-testid="po-census"') &&
  tab.includes('rounded-md bg-muted py-0.5 font-medium text-sm px-2 tabular-nums" data-testid="po-pager-status"') &&
  tab.includes('No rows on this page — the ledger ends at') &&
  tab.includes('Math.min(page * limit, pagination.total)') &&
  tab.includes('aria-label="Previous page"') && tab.includes('aria-label="Next page"'));
ok('the v2.324 amber face keeps its bytes beside the way back',
  tab.includes('data-testid="po-past-end-card"') && tab.includes('border border-amber-200 bg-amber-50/70') &&
  tab.includes('data-testid="po-past-end-hint"') && tab.includes('data-testid="po-back-to-one"'));
ok("the roster's own word stands (the v2.324 deep-link law untouched)",
  tab.includes("'po-page'") && tab.includes('parseInitialNamedPage'));

console.log('— the round\u2019s own test file —');
ok('the test file pins the helper truth table, the class sweep, the hoist, the face',
  test.includes('readJsonBody') && test.includes('THE CLASS IS GONE') && test.includes('THE PAGER SPEAKS BESIDE THE FACE') &&
  test.includes("reqWith('null')") && test.includes('data-testid="po-past-end-card"'));

console.log('— the release voice —');
ok('whats-new leads with the round\u2019s story', whatsNew.includes("version: '2.325.0',") && whatsNew.includes('The body door reads every room') && whatsNew.includes('21 more API doors'));
ok('the CHANGELOG carries the round (Fixed + Added + Styling + Tests)',
  changelog.includes('## [2.325.0] The body door reads every room') && changelog.includes('THE BODY-DOOR CLASS IS GONE') && changelog.includes('THE BODY DOOR HOME') && changelog.includes('THE PAGER SPEAKS BESIDE THE FACE'));
ok('the manifest answers 2.325.0 in all three slots', pkg.version === '2.325.0' && pkg.mbumah?.releaseVersion === '2.325.0' && pkg.mbumah?.baseVersion === '2.325.0');
ok('the docs register carries the door note', docs.includes('**v2.325.0**') && docs.includes('the body door reads every room'));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
