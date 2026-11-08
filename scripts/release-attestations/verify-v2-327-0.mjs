#!/usr/bin/env node
// verify-v2-327-0.mjs — the round's FEATURE gate (v2.327.0 "the swallow
// census"). The release MECHANICS live in verify-current.mjs. This script
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
const table = read('src/components/data-exports/exports-history-table.tsx');
const test = read('src/tests/swallow-census-v2327.test.ts');
const whatsNew = read('src/lib/whats-new.ts');
const changelog = read('CHANGELOG.md');
const pkg = JSON.parse(read('package.json'));
const docs = read('docs/cron-operations.md');

const SILENT_FILES = [
  'src/app/api/hr/assets/[id]/route.ts',
  'src/app/api/hr/assets/route.ts',
  'src/app/api/hr/goals/[id]/route.ts',
  'src/app/api/hr/goals/route.ts',
  'src/app/api/hr/discipline/[id]/route.ts',
  'src/app/api/hr/discipline/route.ts',
  'src/app/api/hr/performance/cycles/[id]/route.ts',
  'src/app/api/hr/performance/cycles/route.ts',
  'src/app/api/hr/performance/reviews/[id]/route.ts',
  'src/app/api/hr/performance/reviews/route.ts',
  'src/app/api/hr/privacy/consent/grant/route.ts',
  'src/app/api/hr/privacy/consent/withdraw/route.ts',
  'src/app/api/hr/privacy/erasure-requests/route.ts',
  'src/app/api/hr/privacy/erasure-requests/[id]/execute/route.ts',
  'src/app/api/hr/privacy/erasure-requests/[id]/reject/route.ts',
  'src/app/api/hr/privacy/legal-hold/route.ts',
  'src/app/api/hr/reports/schedules/[id]/route.ts',
  'src/app/api/hr/reports/schedules/route.ts',
  'src/app/api/self-service/me/leave/route.ts',
  'src/app/api/data-exports/route.ts',
];
const OPTIONAL_FILES = [
  'src/app/api/reminders/debt/process/route.ts',
  'src/app/api/reminders/debt/schedule/route.ts',
  'src/app/api/admin/repair-journal-headers/route.ts',
  'src/app/api/chat/channels/[channelId]/read/route.ts',
];
const silentSrc = SILENT_FILES.map(read);
const optionalSrc = OPTIONAL_FILES.map(read);

console.log('— the swallow census (lib/request-body.ts) —');
ok('the census law is written where the next reader meets it',
  helper.includes('v2.327.0 — THE SWALLOW CENSUS') && helper.includes('SILENT-PROCEED') && helper.includes('HONEST-SWALLOW'));
ok('readOptionalJsonBody exists with its law (empty passes as {}, a present unreadable body rejects)',
  helper.includes('export async function readOptionalJsonBody') &&
  helper.includes('THE OPTIONAL-BODY DOOR (v2.327.0)') &&
  helper.includes("if (!raw.trim())") &&
  helper.includes("return { ok: true, body: {} as T };"));

console.log('— the silent-proceed class is doored (20 files) —');
let doored = 0, chained = 0, markers = 0;
for (const src of silentSrc) {
  if (src.includes('readJsonBody') && src.includes('bodyDoorRejected')) doored++;
  if (/await request\.json\(\)\s*\.catch/.test(src)) chained++;
  if (src.includes('THE SWALLOW DOOR: an unreadable body is a client mistake (v2.327.0)')) markers++;
}
ok(`all 20 doored (${doored}/20)`, doored === 20);
ok(`all 20 carry the marker (${markers}/20)`, markers === 20);
ok('not one chained read remains (0/20)', chained === 0);
ok('data-exports no longer blames the missing fields for an unreadable body',
  read('src/app/api/data-exports/route.ts').includes('const body = door.body;') &&
  !/await request\.json\(\)\s*\.catch/.test(read('src/app/api/data-exports/route.ts')));

console.log('— the optional-body class reads the new door (4 files) —');
let optDoored = 0, optChained = 0;
for (const src of optionalSrc) {
  if (src.includes('readOptionalJsonBody') && src.includes('bodyDoorRejected')) optDoored++;
  if (/await request\.json\(\)\s*\.catch/.test(src)) optChained++;
}
ok(`all 4 optional-doored (${optDoored}/4)`, optDoored === 4);
ok('not one chained read remains (0/4)', optChained === 0);
ok('the reminders runners keep their store-scope policy comment (v2.17.8 law untouched)',
  read('src/app/api/reminders/debt/process/route.ts').includes('assertBodyStoreScope'));

console.log('— the honest-swallow class is pinned as the pattern (16 sites) —');
ok('messages/kra/stock-takes/vouchers/etims keep their explicit 400s',
  read('src/app/api/messages/conversations/route.ts').includes("'Invalid JSON body.'") &&
  read('src/app/api/kra/submit/route.ts').includes("'transactionId is required.'") &&
  read('src/app/api/stock-takes/route.ts').includes("'storeId is required.'") &&
  read('src/app/api/vouchers/send/route.ts').includes('voucherId, channel, and recipient are required.') &&
  read('src/app/api/etims/cancel-invoice/route.ts').includes('invoiceNumber and reason are required.'));
ok('chat channels parse through zod; the refund rides validateInput',
  read('src/app/api/chat/channels/route.ts').includes('chatChannelCreateSchema.safeParse') &&
  read('src/app/api/transactions/[id]/refund/route.ts').includes('validateInput(refundSchema,'));
ok('the DARAJA webhooks keep their leniency',
  read('src/app/api/payments/mpesa/b2c/result/route.ts').includes('request.json().catch') &&
  read('src/app/api/payments/mpesa/b2c/queue-timeout/route.ts').includes('request.json().catch'));
ok('the census test pins all three laws (the keep-law has a guard now)',
  test.includes('THE HONEST-SWALLOW CLASS IS THE PATTERN') && test.includes('THE SILENT-PROCEED CLASS IS DOORED') && test.includes('THE OPTIONAL-BODY CLASS'));

console.log('— the retention countdown (the export\u2019s lifetime speaks before it dies) —');
ok('the countdown helper exists with its law',
  table.includes('THE RETENTION COUNTDOWN (v2.327.0)') && table.includes('function retentionCountdown('));
ok('the truth table is pinned (48h days / hours / amber soon / the Expired badge owns the past)',
  table.includes('hours >= 48') && table.includes("soon: hours < 24") && table.includes("'expires soon'") && table.includes('the Expired badge owns the past'));
ok('the pill rides created-at (testid + amber + muted + dark variants + the Clock)',
  table.includes('data-testid="export-retention"') &&
  table.includes('bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'));

console.log('— the release voice —');
ok("whats-new leads with the round\u2019s story",
  whatsNew.includes("version: '2.327.0',") && whatsNew.includes('The swallow census') && whatsNew.includes('optional door'));
ok('the CHANGELOG carries the round (Fixed + Added + Styling + Tests)',
  changelog.includes('## [2.327.0] The swallow census') &&
  changelog.includes('SILENT-PROCEED') && changelog.includes('THE RETENTION COUNTDOWN'));
ok('the manifest answers 2.327.0 in all three slots',
  pkg.version === '2.327.0' && pkg.mbumah?.releaseVersion === '2.327.0' && pkg.mbumah?.baseVersion === '2.327.0');
ok('the docs register carries the census note',
  docs.includes('**v2.327.0**') && docs.includes('the swallow census'));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
