#!/usr/bin/env node
// verify-v2-342-0.mjs — the round's FEATURE gate (v2.342.0 "the messaging
// doors speak their bodies' shapes"). The release MECHANICS live in
// verify-current.mjs. This script pins only what is NEW this round.
// Every check reads the SOURCE OF RECORD (bytes, not memory) — THE OD
// LAW. Run BEFORE the walk; the last two pins pass only AFTER walk-v2342.
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
const messages = read('src/app/api/messages/route.ts');
const bulk = read('src/app/api/messaging/bulk/route.ts');
const send = read('src/app/api/whatsapp/send/route.ts');
const sendDoc = read('src/app/api/whatsapp/send-document/route.ts');
const campaigns = read('src/app/api/loyalty/campaigns/route.ts');
const helper = read('src/lib/request-body.ts');
const desk = read('src/app/(shell)/tabs/messaging-tab.tsx');
const whatsNew = read('src/lib/whats-new.ts');
const changelog = read('CHANGELOG.md');
const changelogTest = read('src/tests/console-changelog.test.ts');
const pkg = JSON.parse(read('package.json'));

console.log('— the bare class falls 20 → 16 —');
ok('exactly 16 bare doors remain', BARE.length === 16);
ok('the four messaging doors left the census',
  !BARE.includes('src/app/api/messages/route.ts') &&
  !BARE.includes('src/app/api/messaging/bulk/route.ts') &&
  !BARE.includes('src/app/api/whatsapp/send/route.ts') &&
  !BARE.includes('src/app/api/whatsapp/send-document/route.ts'));
ok('the five loyalty + tax doors stay out (no regressions)',
  !BARE.includes('src/app/api/loyalty/campaigns/route.ts') &&
  !BARE.includes('src/app/api/loyalty/tiers/route.ts') &&
  !BARE.includes('src/app/api/loyalty/transactions/route.ts') &&
  !BARE.includes('src/app/api/tax/categories/route.ts') &&
  !BARE.includes('src/app/api/tax/filings/route.ts'));
ok('the five HR doors stay out (no regressions)',
  !BARE.includes('src/app/api/attendance/route.ts') &&
  !BARE.includes('src/app/api/employees/route.ts') &&
  !BARE.includes('src/app/api/leave-types/route.ts') &&
  !BARE.includes('src/app/api/shifts/route.ts') &&
  !BARE.includes('src/app/api/shifts/[id]/end/route.ts'));
ok('the loose-Record era stays over (no regressions)',
  !API_FILES.some((f) => read(f).includes('readJsonBody<Record<string, unknown>>')));
ok('the re-cast class stays gone',
  !API_FILES.some((f) => /door\.body as [A-Z]/.test(read(f))));
ok('the door default itself is untouched (the any law, documented, lint-clean)',
  helper.includes('export async function readJsonBody<T = any>(') &&
  helper.includes('eslint-disable-next-line @typescript-eslint/no-explicit-any'));

console.log('— the per-file honest bytes —');
ok('messages: the pair REQUIRED + the six resolved columns',
  messages.includes('storeId: string;') && messages.includes('content: string;') &&
  messages.includes('customerId?: string;') && messages.includes('channel?: string;') &&
  messages.includes('messageType?: string;') && messages.includes('subject?: string;') &&
  messages.includes('phone?: string;') && messages.includes('createdBy?: string;') &&
  messages.includes('storeId and content are required.'));
ok('bulk: the pair REQUIRED + the narrowed unions + the dissolved de-facto re-cast',
  bulk.includes('storeId: string;') && bulk.includes('message: string;') &&
  bulk.includes('channel?: Channel;') && bulk.includes('audience?: Audience;') &&
  bulk.includes('scheduledAt?: string;') &&
  !bulk.includes('} = body as {') &&
  bulk.includes("audience !== undefined && VALID_AUDIENCES.includes(audience) ? audience : 'ALL'") &&
  bulk.includes('storeId and message are required.'));
ok('send: the pair REQUIRED + the observability optionals',
  send.includes('phone: string;') && send.includes('message: string;') &&
  send.includes('storeId?: string;') && send.includes('customerId?: string;') &&
  send.includes('messageType?: string;') &&
  send.includes('phone and message are required.'));
ok('send-document: the DocumentType door + the dissolved de-facto re-cast',
  sendDoc.includes('type: DocumentType;') && sendDoc.includes('documentId?: string;') &&
  sendDoc.includes('storeId: string;') && sendDoc.includes('phone?: string;') &&
  sendDoc.includes('message?: string;') && sendDoc.includes('customerId?: string;') &&
  !sendDoc.includes('} = body as {') &&
  sendDoc.includes('type and storeId are required.'));
ok('campaigns: the answering chain speaks (the waking probe fix)',
  campaigns.includes('function coerceFigure(value: number | string): number | null') &&
  campaigns.includes('bonusPoints?: number | string;') &&
  campaigns.includes('multiplier?: number | string;') &&
  campaigns.includes('bonusPoints and multiplier must be numbers.') &&
  campaigns.includes('const bonusPointsInt = Math.trunc(bonusPointsValue);') &&
  campaigns.includes('bonusPoints: bonusPointsInt,') &&
  campaigns.includes('multiplier: multiplierValue,'));

console.log('— the law doc carries the round —');
ok('request-body.ts records the messaging pass (history keeps the 20 and the 25)',
  helper.includes("v2.342.0 — THE MESSAGING FAMILY, the bare class's third pass") &&
  helper.includes('DE-FACTO RE-CASTS') &&
  helper.includes('the filings precedent') &&
  helper.includes('falls to 16 doors') &&
  helper.includes('falls to 20 doors') &&
  helper.includes('falls to 25 doors'));

console.log('— the styling face —');
ok('the broadcast forecast meter draws the reach (the honest aria voice)',
  desk.includes('data-testid="broadcast-forecast-meter"') &&
  desk.includes('role="progressbar"') &&
  desk.includes('aria-valuemin={0}') &&
  desk.includes('aria-valuemax={100}') &&
  desk.includes('aria-valuenow={forecastPct}') &&
  desk.includes('Broadcast reach: '));
ok('the fill steps through the three voices (emerald / amber / red)',
  desk.includes("forecastPct >= 90 ? 'bg-emerald-500' : forecastPct >= 60 ? 'bg-amber-500' : 'bg-red-500'"));
ok('the helper runs the bulk route\u2019s own predicates and phone shape',
  desk.includes('function forecastBroadcastReach(') &&
  desk.includes('if (!c.isActive) continue;') &&
  desk.includes("audience === 'DEBTORS' && !(c.currentDebtBalance > 0)") &&
  desk.includes("(p.startsWith('254') && p.length === 12) || /^\\d{9}$/.test(p)"));
ok('the forecast re-speaks on every render and stays silent on an empty ledger',
  desk.includes('const broadcastForecast = forecastBroadcastReach(customers, bulkAudience);') &&
  desk.includes('forecastCandidates > 0 && ('));

console.log('— the release mechanics —');
ok('whats-new carries 2.342.0 (the raw-escape bytes)',
  whatsNew.includes("version: '2.342.0'") &&
  whatsNew.includes('bodies\\u2019 shapes') &&
  whatsNew.includes('\\u201c50\\u201d'));
ok('CHANGELOG carries the 2.342.0 head', changelog.includes('## [2.342.0]'));
ok('VERSION and package.json speak 2.342.0 in all three slots',
  read('VERSION').trim() === '2.342.0' &&
  pkg.version === '2.342.0' &&
  pkg.mbumah.releaseVersion === '2.342.0' &&
  pkg.mbumah.baseVersion === '2.342.0');

console.log('— the walk-dependent pins (green after walk-v2342) —');
ok('the unread-counter cascade landed (233/234/235/266)',
  changelogTest.includes("whatsNewUnreadCount('2.110.0')).toBe(233)") &&
  changelogTest.includes("whatsNewUnreadCount('2.109.0')).toBe(234)") &&
  changelogTest.includes("whatsNewUnreadCount('2.108.0')).toBe(235)") &&
  changelogTest.includes("whatsNewUnreadCount('2.77.0')).toBe(266)"));
ok('the history line rides the cascade block',
  changelogTest.includes('v2.342.0: the messaging entry joins the feed'));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
