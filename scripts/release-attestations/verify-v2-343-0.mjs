#!/usr/bin/env node
// verify-v2-343-0.mjs — the round's FEATURE gate (v2.343.0 "the re-cast
// class ends, the rental doors speak their bodies' shapes"). The release
// MECHANICS live in verify-current.mjs. This script pins only what is NEW
// this round. Every check reads the SOURCE OF RECORD (bytes, not memory)
// — THE OD LAW. Run BEFORE the walk; the last two pins pass only AFTER
// walk-v2343.
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

let pass = 0, fail = 0;
const ok = (name, cond) => {
  if (cond) { pass++; console.log(`  ok  ${name}`); }
  else { fail++; console.error(`x FAIL ${name}`); }
};
const read = (p) => readFileSync(p, 'utf8');

function walkApi(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) out.push(...walkApi(full));
    else if (name.endsWith('.ts')) out.push(full);
  }
  return out;
}

const API_FILES = walkApi('src/app/api');
const BARE = API_FILES.filter((f) => /readJsonBody\(request\)/.test(read(f)));
const stock = read('src/app/api/stock-movements/route.ts');
const kra = read('src/app/api/kra/submit/route.ts');
const po = read('src/app/api/purchase-orders/route.ts');
const distrib = read('src/app/api/transactions/[id]/distribute-receipt/route.ts');
const rentals = read('src/app/api/rentals/route.ts');
const ret = read('src/app/api/rentals/[id]/return/route.ts');
const drawer = read('src/app/api/cash-drawer/route.ts');
const reports = read('src/app/api/reports/export/route.ts');
const sendOrder = read('src/app/api/suppliers/[id]/send-order/route.ts');
const notif = read('src/app/api/notifications/email/route.ts');
const cancel = read('src/app/api/etims/cancel-invoice/route.ts');
const conv = read('src/app/api/messages/conversations/route.ts');
const convId = read('src/app/api/messages/conversations/[id]/route.ts');
const convMsg = read('src/app/api/messages/conversations/[id]/messages/route.ts');
const helper = read('src/lib/request-body.ts');
const desk = read('src/app/(shell)/tabs/rentals-tab.tsx');
const whatsNew = read('src/lib/whats-new.ts');
const changelog = read('CHANGELOG.md');
const changelogTest = read('src/tests/console-changelog.test.ts');
const pkg = JSON.parse(read('package.json'));

console.log('— the bare class falls 16 → 8 —');
ok('exactly 8 bare doors remain', BARE.length === 8);
ok('the fourteen doors left the census / the re-cast rolls',
  FAMILY_LEFT());
ok('the loose-Record era stays over (no regressions)',
  !API_FILES.some((f) => read(f).includes('readJsonBody<Record<string, unknown>>')));
ok('the re-cast class stays gone',
  !API_FILES.some((f) => /door\.body as [A-Z]/.test(read(f))));
ok('THE DE-FACTO RE-CAST TOMBSTONE: zero `} = body as {` matches in src/app/api',
  !API_FILES.some((f) => /} = body as \{/.test(read(f))));
ok('the door default itself is untouched (the any law, documented, lint-clean)',
  helper.includes('export async function readJsonBody<T = any>(') &&
  helper.includes('eslint-disable-next-line @typescript-eslint/no-explicit-any'));

function FAMILY_LEFT() {
  const doors = [
    'src/app/api/stock-movements/route.ts',
    'src/app/api/kra/submit/route.ts',
    'src/app/api/purchase-orders/route.ts',
    'src/app/api/transactions/[id]/distribute-receipt/route.ts',
    'src/app/api/rentals/route.ts',
    'src/app/api/rentals/[id]/return/route.ts',
    'src/app/api/cash-drawer/route.ts',
    'src/app/api/reports/export/route.ts',
    'src/app/api/suppliers/[id]/send-order/route.ts',
    'src/app/api/notifications/email/route.ts',
    'src/app/api/etims/cancel-invoice/route.ts',
    'src/app/api/messages/conversations/route.ts',
    'src/app/api/messages/conversations/[id]/route.ts',
    'src/app/api/messages/conversations/[id]/messages/route.ts',
  ];
  return doors.every((d) => !BARE.includes(d));
}

console.log('— the per-door honest bytes —');
ok('stock-movements: productId REQUIRED + the unknown figures', 
  stock.includes('productId: string;') && stock.includes('quantity?: unknown;') &&
  stock.includes('unitCost?: unknown;') && stock.includes('category?: string;') &&
  !stock.includes('} = body as {') && stock.includes('productId is required.'));
ok('kra/submit: the honest-swallow graduate with BOTH voices',
  kra.includes("from '@/lib/request-body'") && kra.includes('transactionId: string;') &&
  kra.includes('dryRun?: boolean;') && kra.includes('storeId?: string;') &&
  !kra.includes('} = body as {') && !kra.includes('request.json().catch') &&
  !kra.includes('body.storeId as string') && kra.includes('transactionId is required.'));
ok('purchase-orders: the pair REQUIRED + the validated element shape + the dissolved loop cast',
  po.includes('storeId: string;') && po.includes('supplierId: string;') &&
  po.includes('items: Array<{ productId: string; quantity: unknown; unitCost: unknown; notes?: string }>;') &&
  !po.includes('} = body as {') && !po.includes('for (const item of items as Array<') &&
  po.includes('const qty = Number(item.quantity);') && po.includes('quantity: qty,'));
ok('distribute-receipt: the REQUIRED channel union + the dissolved re-cast',
  distrib.includes('channel: "EMAIL" | "WHATSAPP" | "SMS";') && distrib.includes('storeId?: string;') &&
  !distrib.includes('} = body as {') && distrib.includes("channel must be 'EMAIL', 'WHATSAPP' or 'SMS'."));
ok('rentals: the REQUIRED trio + the toDec money widening',
  rentals.includes('expectedReturnDate: string;') && rentals.includes('ratePerDay: number | string;') &&
  rentals.includes('securityDeposit?: number | string;') && rentals.includes('notes?: string;') &&
  rentals.includes('ratePerDay are required.'));
ok('rentals/[id]/return: processedBy rides the unknown it is (SYS-2)',
  ret.includes('damageAssessment?: string;') && ret.includes('damageCharge?: number | string;') &&
  ret.includes('processedBy?: unknown;') && ret.includes('Rental not found.'));
ok('cash-drawer: amount rides the both-absences widening its own guard demands',
  drawer.includes('eventType: string;') && drawer.includes('amount?: number | string | null;') &&
  drawer.includes('amount === undefined || amount === null') &&
  drawer.includes('Amount must be a non-negative number.'));
ok('reports/export: the receipt-distribution twin',
  reports.includes('transactionId: string;') && reports.includes("channel: 'EMAIL' | 'WHATSAPP' | 'SMS';") &&
  !reports.includes('} = body as {') && reports.includes('transactionId is required.'));
ok('suppliers/[id]/send-order: the optionals + the resolution',
  sendOrder.includes('purchaseOrderId?: string;') && sendOrder.includes('message?: string;') &&
  sendOrder.includes("channel?: 'WHATSAPP' | 'EMAIL';") && !sendOrder.includes('} = body as {'));
ok('notifications/email: the honest-swallow graduate — the trio REQUIRED',
  notif.includes("from '@/lib/request-body'") && notif.includes('type: string;') &&
  notif.includes('recipient: string;') && notif.includes('data: Record<string, unknown>;') &&
  !notif.includes('await request.json()') && !notif.includes('} = body as {'));
ok('etims/cancel-invoice: the honest-swallow graduate — BOTH storeId casts dissolve',
  cancel.includes('invoiceNumber: string;') && cancel.includes('reason: string;') &&
  cancel.includes('storeId?: string;') && !cancel.includes('} = body as {') &&
  !cancel.includes('body.storeId as string') && cancel.includes('invoiceNumber and reason are required.'));
ok('messages/conversations: the graduate keeps its destructure defaults',
  conv.includes('storeId?: string;') && conv.includes('participantIds?: string[];') &&
  conv.includes("type = 'INTERNAL'") && conv.includes('participantIds = []') &&
  !conv.includes('} = body as {'));
ok('messages/conversations/[id]: the participant columns ride the guarded arrays',
  convId.includes('addParticipantIds?: string[];') && convId.includes('removeParticipantIds?: string[];') &&
  !convId.includes('} = body as {'));
ok('messages/conversations/[id]/messages: content REQUIRED under the trim guard, the default stays',
  convMsg.includes('content: string;') && convMsg.includes('messageType?: string;') &&
  convMsg.includes('attachmentUrl?: string;') && convMsg.includes("messageType = 'TEXT'") &&
  convMsg.includes('content is required.') && !convMsg.includes('} = body as {'));

console.log('— the law doc carries the round —');
ok('request-body.ts records the re-cast class end (history keeps the 16/20/25)',
  helper.includes('v2.343.0 — THE RE-CAST CLASS ENDS') &&
  helper.includes('THE ELEVEN DE-FACTO RE-CASTS') &&
  helper.includes('HONEST-SWALLOW') &&
  helper.includes('answering-chain cousin') &&
  helper.includes('falls to 8 doors') &&
  helper.includes('falls to 16 doors') &&
  helper.includes('falls to 20 doors') &&
  helper.includes('falls to 25 doors'));

console.log('— the styling face —');
ok('the rental-day meter speaks (the honest aria voice)',
  desk.includes("'rental-day-meter'") &&
  desk.includes("role: 'progressbar'") &&
  desk.includes("'aria-label': meterVoice") &&
  desk.includes("'aria-valuemax': 100") &&
  desk.includes("'aria-valuenow': elapsedPct") &&
  desk.includes('title: meterVoice'));
ok('the meter voice speaks the exact day figures',
  desk.includes('`Rental day ${dayOfTerm} of ${daysInTerm} (${elapsedPct}%) — ${daysOverdue}d overdue`') &&
  desk.includes('`Rental day ${dayOfTerm} of ${daysInTerm} (${elapsedPct}%) — ${daysRemaining}d remaining`'));
ok('a returned rental drops the progressbar role (the walk is over)',
  desk.includes('{...(isReturned') &&
  desk.includes('const elapsedPct = Math.min(Math.max(Math.round(((now - start) / termMs) * 100), 0), 100);'));
ok('the fill keeps the desk\u2019s own journey',
  desk.includes("const statusColor = isOverdue ? 'red' : isCloseToDue ? 'amber' : isActive ? 'green' : isReturned ? 'gray' : 'green';"));

console.log('— the release mechanics —');
ok('whats-new carries 2.343.0 (the raw-escape bytes)',
  whatsNew.includes("version: '2.343.0'") &&
  whatsNew.includes('bodies\\u2019 shapes') &&
  whatsNew.includes('\\u201cas {\\u2026}\\u201d'));
ok('CHANGELOG carries the 2.343.0 head', changelog.includes('## [2.343.0]'));
ok('VERSION and package.json speak 2.343.0 in all three slots',
  read('VERSION').trim() === '2.343.0' &&
  pkg.version === '2.343.0' &&
  pkg.mbumah.releaseVersion === '2.343.0' &&
  pkg.mbumah.baseVersion === '2.343.0');

console.log('— the walk-dependent pins (green after walk-v2343) —');
ok('the unread-counter cascade landed (234/235/236/267)',
  changelogTest.includes("whatsNewUnreadCount('2.110.0')).toBe(234)") &&
  changelogTest.includes("whatsNewUnreadCount('2.109.0')).toBe(235)") &&
  changelogTest.includes("whatsNewUnreadCount('2.108.0')).toBe(236)") &&
  changelogTest.includes("whatsNewUnreadCount('2.77.0')).toBe(267)"));
ok('the history line rides the cascade block',
  changelogTest.includes('v2.343.0: the rental entry joins the feed'));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
