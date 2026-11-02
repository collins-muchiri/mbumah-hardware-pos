#!/usr/bin/env node
// verify-v2-353-0.mjs — the round's FEATURE gate (v2.353.0 "the doors are
// counted"). The release MECHANICS live in verify-current.mjs. This script
// pins only what is NEW this round. THE OD LAW: bytes, not memory.
// Run BEFORE the walk; the walk-dependent pins sit in the tail section.
import { readFileSync } from 'node:fs';

let pass = 0, fail = 0;
const ok = (name, cond) => {
  if (cond) { pass++; console.log(`  ok  ${name}`); }
  else { fail++; console.error(`x FAIL ${name}`); }
};
const read = (p) => readFileSync(p, 'utf8');

const APPROVE = read('src/app/api/leave/requests/[id]/approve/route.ts');
const REJECT = read('src/app/api/leave/requests/[id]/reject/route.ts');
const WITHDRAW = read('src/app/api/recruitment/applicants/[id]/withdraw/route.ts');
const CANCEL = read('src/app/api/stock-takes/[id]/cancel/route.ts');
const DESK = read('src/app/(shell)/tabs/transactions-tab.tsx');
const REGISTRY = read('src/tests/door-shape-registry-v2353.test.ts');
const HOME = read('src/lib/request-body.ts');
const whatsNew = read('src/lib/whats-new.ts');
const changelog = read('CHANGELOG.md');
const test = read('src/tests/wrapper-seam-v2351.test.ts');
const pkg = JSON.parse(read('package.json'));
const version = read('VERSION').trim();

console.log('— the doors are counted —');
ok('THE OPTIONAL DOOR HOME still speaks its law',
  HOME.includes('export async function readOptionalJsonBody')
  && HOME.includes('THE OPTIONAL-BODY DOOR (v2.327.0)'));

for (const [name, src, shape, field] of [
  ['LEAVE APPROVE', APPROVE, 'readOptionalJsonBody<{ delegateApproverUserId?: unknown }>', 'door.body.delegateApproverUserId'],
  ['LEAVE REJECT', REJECT, 'readOptionalJsonBody<{ rejectionReason?: unknown }>', 'door.body.rejectionReason'],
  ['WITHDRAW', WITHDRAW, 'readOptionalJsonBody<{ note?: unknown }>', 'door.body.note'],
  ['CANCEL', CANCEL, 'readOptionalJsonBody<{ reason?: unknown }>', 'door.body.reason'],
]) {
  ok(`THE ${name} DOOR GRADUATED (optional door, 400 on unreadable, no chained swallow)`,
    src.includes(shape)
    && src.includes('bodyDoorRejected()')
    && src.includes(field)
    && src.includes('THE OPTIONAL SWALLOW DOOR (v2.353.0)')
    && !/await request\.json\(\)/.test(src)
    && src.includes("from '@/lib/request-body'"));
}
ok('THE HONEST DEFAULTS SURVIVED THE GRADUATION',
  REJECT.includes("'Rejected by approver.'")
  && WITHDRAW.includes('.trim().slice(0, 500)')
  && CANCEL.includes('.slice(0, 300)'));

console.log('— the ledger speaks its census —');
ok('THE CENSUS HELPER IS PLAIN (the memo-lint law: no useMemo, the same array)',
  DESK.includes('function countTransactionTypes(rows: TransactionItem[]):')
  && DESK.includes('census[getTransactionType(row)] += 1;')
  && DESK.includes('const typeCensus = countTransactionTypes(transactions);')
  && !DESK.includes('const typeCensus = useMemo'));
ok('THE CHIP MAP IS THE CENSUS KEYSET — the two annotations dissolved',
  DESK.includes("(['all', 'sale', 'refund', 'void'] as const).map((type) => (")
  && !DESK.includes('getTransactionTypeIcon(type as')
  && !DESK.includes('getTransactionTypeLabel(type as')
  && DESK.includes("useState<'all' | TransactionType>('all')"));
ok('THE CHIPS CARRY THEIR TALLIES + the census row handle',
  DESK.includes('data-testid="txn-type-census"')
  && DESK.includes('<span className="tabular-nums opacity-70">· {typeCensus[type]}</span>'));
ok('THE SKY LENS VOICE (never amber, never violet; silent when no lens)',
  DESK.includes('data-testid="txn-type-lens-voice"')
  && DESK.includes('{typeCensus[typeFilter]} in this lens')
  && DESK.includes('border-sky-200 bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700')
  && DESK.includes('dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-300')
  && DESK.includes("{typeFilter !== 'all' && ("));

console.log('— the registry —');
ok('THE REGISTRY TEST EXISTS with the derived census',
  REGISTRY.includes('const walkRoutes = (dir: string): string[]')
  && REGISTRY.includes('expect(routeFiles.length).toBe(380);')
  && REGISTRY.includes('expect(count(/\\breadJsonBody\\s*</g, src)).toBe(116);')
  && REGISTRY.includes('expect(count(/\\breadOptionalJsonBody\\s*</g, src)).toBe(8);')
  && REGISTRY.includes('expect(total).toBe(58);')
  && REGISTRY.includes('expect(count(/\\breadJsonBody\\s*\\(/g, src)).toBe(0);'));
ok('THE REGISTRY PINS THE ONE LENIENT WEBHOOK by name',
  REGISTRY.includes('RAW_LENIENT_EXEMPT')
  && REGISTRY.includes('payments/mpesa/b2c/queue-timeout/route.ts'));
ok('THE REGISTRY PINS ALL FOUR GRADUATES',
  REGISTRY.includes('leave/requests/[id]/approve/route.ts')
  && REGISTRY.includes('leave/requests/[id]/reject/route.ts')
  && REGISTRY.includes('recruitment/applicants/[id]/withdraw/route.ts')
  && REGISTRY.includes('stock-takes/[id]/cancel/route.ts'));

console.log('— the face twin + the release —');
ok('THE ERA TEST SPEAKS THE RESOLVED GATE (no reservation claim remains)',
  test.includes('the audit PR merged 03aec8e1')
  && !test.includes('still reserved'));
ok('WHATS-NEW 2.353.0 leads the feed', whatsNew.includes("version: '2.353.0',") && whatsNew.indexOf("'2.353.0'") < whatsNew.indexOf("'2.352.0'"));
ok('CHANGELOG 2.353.0 leads', changelog.startsWith('## [2.353.0]'));
ok('VERSION + package.json say 2.353.0 (three slots)', version === '2.353.0' && pkg.version === '2.353.0' && pkg.mbumah.releaseVersion === '2.353.0' && pkg.mbumah.baseVersion === '2.353.0');

console.log('— walk-dependent pins (green after walk-v2353) —');
const changelogTest = read('src/tests/console-changelog.test.ts');
ok('THE UNREAD-COUNTER CASCADE landed (243/244/245/276)',
  changelogTest.includes("whatsNewUnreadCount('2.110.0')).toBe(243)")
  && changelogTest.includes("whatsNewUnreadCount('2.109.0')).toBe(244)")
  && changelogTest.includes("whatsNewUnreadCount('2.108.0')).toBe(245)")
  && changelogTest.includes("whatsNewUnreadCount('2.77.0')).toBe(276)"));
ok('THE HISTORY LINE rode the cascade block', changelogTest.includes('v2.353.0: the door-registry entry joins the feed'));
ok('THE MIS-TITLED DUPLICATE was re-titled to the audit entry it documents',
  changelogTest.includes('v2.351.0: the audit-remediation entry joins the feed (+1 on every anchor → 240/241/242/273 → 241/242/243/274)')
  && !changelogTest.includes('v2.352.0: the wrapper-seam entry joins the feed (+1 on every anchor → 240/241/242/273'));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
