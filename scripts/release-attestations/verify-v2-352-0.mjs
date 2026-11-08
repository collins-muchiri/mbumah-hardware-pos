#!/usr/bin/env node
// verify-v2-351-0.mjs — the round's FEATURE gate (v2.352.0 "the wrapper seam
// speaks its shape"). The release MECHANICS live in verify-current.mjs. This
// script pins only what is NEW this round. THE OD LAW: bytes, not memory.
// Run BEFORE the walk; the walk-dependent pins sit in the tail section.
import { readFileSync } from 'node:fs';

let pass = 0, fail = 0;
const ok = (name, cond) => {
  if (cond) { pass++; console.log(`  ok  ${name}`); }
  else { fail++; console.error(`x FAIL ${name}`); }
};
const read = (p) => readFileSync(p, 'utf8');

const censusTokens = (src) =>
  [
    'as string', 'as number', 'as Date', 'as never', 'as Array<', 'as typeof',
    'as SubJobResult[]', 'as { code?', 'as { path?', 'as { dispatcher?', 'as { results?',
    'as (...args: unknown[])',
  ].filter((t) =>
    src
      .split('\n')
      .filter((l) => {
        const s = l.trim();
        return !(s.startsWith('//') || s.startsWith('*') || s.startsWith('/*') || l.includes('as const'));
      })
      .join('\n')
      .includes(t)
  );

const AUTH = read('src/lib/auth.ts');
const USERS = read('src/app/api/users/[id]/route.ts');
const REFUND = read('src/app/api/transactions/[id]/refund/route.ts');
const TXN = read('src/app/api/transactions/route.ts');
const TRANSFERS = read('src/app/api/store-transfers/route.ts');
const DESK = read('src/app/(shell)/tabs/transfers-tab.tsx');
const FIFTEEN = [
  'src/app/api/auth/login/route.ts', 'src/app/api/auth/me/route.ts',
  'src/app/api/chat/channels/[channelId]/messages/route.ts', 'src/app/api/customer-credits/[id]/route.ts',
  'src/app/api/employees/[id]/route.ts', 'src/app/api/gift-cards/[id]/route.ts',
  'src/app/api/gift-cards/[id]/adjust/route.ts', 'src/app/api/shift-schedules/route.ts',
  'src/app/api/shift-schedules/[id]/route.ts', 'src/app/api/messages/conversations/route.ts',
  'src/app/api/messages/conversations/[id]/route.ts', 'src/app/api/messages/conversations/[id]/messages/route.ts',
  'src/app/api/org/automation/route.ts', 'src/app/api/org/kpi-summary/route.ts', 'src/app/api/transactions/route.ts',
];
const SHAPE_A = [
  'src/app/api/employees/[id]/route.ts', 'src/app/api/employees/[id]/portal-link/candidates/route.ts',
  'src/app/api/employees/[id]/portal-link/route.ts', 'src/app/api/users/[id]/route.ts',
  'src/app/api/org/branch-diagnostics/[storeCode]/route.ts', 'src/app/api/access-requests/route.ts',
  'src/app/api/auth/manager-authorize/route.ts', 'src/app/api/payments/mpesa/stkpush/route.ts',
];
const SHAPE_B = [
  'src/app/api/transactions/[id]/refund/route.ts', 'src/app/api/transactions/[id]/route.ts',
  'src/app/api/transactions/route.ts', 'src/app/api/store-transfers/[id]/route.ts',
  'src/app/api/store-transfers/route.ts', 'src/app/api/receipts/[id]/route.ts', 'src/app/api/receipts/route.ts',
];
const whatsNew = read('src/lib/whats-new.ts');
const changelog = read('CHANGELOG.md');
const test = read('src/tests/wrapper-seam-v2351.test.ts');
const pkg = JSON.parse(read('package.json'));
const version = read('VERSION').trim();

console.log('— the wrapper seam speaks its shape —');
ok('THE HANDLER FAMILIES CARRY THEIR REST (generic + default)',
  AUTH.includes('type AuthedHandler<Rest extends unknown[] = unknown[]> = (')
  && AUTH.includes('type StoreScopedHandler<Rest extends unknown[] = unknown[]> = (')
  && AUTH.includes('...args: Rest\n) => Promise<Response>;'));
ok('THE WRAPPERS ARE GENERIC OVER THE REST',
  AUTH.includes('export function requireAuth<Rest extends unknown[] = unknown[]>(')
  && AUTH.includes('handler: AuthedHandler<Rest>,')
  && AUTH.includes('export function requireStoreAccess<Rest extends unknown[] = unknown[]>(')
  && AUTH.includes('handler: StoreScopedHandler<Rest>,'));
ok('THE SEAM IS THE WRAPPER\u2019S OWN (three documented forwards)',
  (AUTH.match(/\.\.\.\(args\.slice\(1\) as Rest\)/g) || []).length === 3
  && AUTH.includes("v2.352.0 — the wrapper's own rest seam"));
ok('THE THIRTEEN HANDLER-ARGUMENT CASTS ARE GONE',
  SHAPE_A.every((f) => !read(f).includes('as (...args: unknown[]) => Promise<Response>'))
  && USERS.includes('requireAuth(getUserHandler,')
  && read('src/app/api/employees/[id]/route.ts').includes('requireStoreAccess(getEmployeeHandler)'));
ok('THE ELEVEN WRAPPER-RESULT CASTS WERE NOISE (deleted)',
  SHAPE_B.every((f) => !read(f).includes('as (...args: unknown[]) => Promise<Response>'))
  && REFUND.includes('requireStoreAccess(refundTransactionHandler),')
  && TXN.includes("withErrorBoundary(requireStoreAccess(getTransactionsHandler), 'TRANSACTIONS_LIST')")
  && TRANSFERS.includes("withErrorBoundary(requireStoreAccess(getStoreTransfersHandler), 'STORE_TRANSFERS_LIST')"));
ok('THE MANAGED-USER ROW IS DERIVED FROM ITS QUERY (as never gone)',
  USERS.includes('type ManagedUserRow = Prisma.UserGetPayload<{')
  && USERS.includes('select: typeof USER_SELECT & { organizationId: true };')
  && USERS.includes('): Promise<{ user: ManagedUserRow } | { error: Response }> {')
  && USERS.includes('  return { user };')
  && !USERS.includes('as never'));
ok('THE REFUND SEED IS AN HONEST NULL',
  REFUND.includes('      customerName: null,')
  && !REFUND.includes('as string | null'));

console.log('— the tombstone —');
ok('THE TOMBSTONE: zero dissolved tokens across the census files (now incl. the export-line family)',
  [...FIFTEEN, ...SHAPE_A, ...SHAPE_B].every((f) => censusTokens(read(f)).length === 0));
ok('THE BOUNDARY STAYS DOCUMENTED-PRESENT',
  AUTH.includes('const request = args[0] as NextRequest;')
  && read('src/app/api/messages/conversations/[id]/route.ts').includes('const context = args[0] as { params: Promise<{ id: string }> };')
  && TXN.includes('const rawBody = (body ?? {}) as Record<string, unknown>;'));

console.log('— the face twin + the release —');
ok('THE TRANSFERS FILTER SPEAKS ITS CENSUS + the lens voice',
  DESK.includes('data-testid="transfer-status-filter"')
  && DESK.includes('<SelectItem value="all">All Status · {statusCounts.all}</SelectItem>')
  && DESK.includes('<SelectItem value="PARTIAL">Partial · {statusCounts.PARTIAL}</SelectItem>')
  && DESK.includes('data-testid="transfer-lens-voice"')
  && DESK.includes("{statusFilter !== 'all' && (")
  && DESK.includes('{statusCounts[statusFilter] ?? 0} in this lens')
  && DESK.includes('dark:border-emerald-500/30 dark:bg-emerald-500/10')
  && DESK.includes('if (t.status in c) c[t.status] += 1;'));
ok('THE ERA TEST EXISTS with the census helper',
  test.includes('function censusCastTokens(src: string): string[] {')
  && test.includes('as (...args: unknown[])'));
ok('WHATS-NEW 2.352.0 leads the feed', whatsNew.includes("version: '2.352.0',") && whatsNew.indexOf("'2.352.0'") < whatsNew.indexOf("'2.350.0'"));
ok('CHANGELOG 2.352.0 leads', changelog.startsWith('## [2.352.0]'));
ok('VERSION + package.json say 2.352.0 (three slots)', version === '2.352.0' && pkg.version === '2.352.0' && pkg.mbumah.releaseVersion === '2.352.0' && pkg.mbumah.baseVersion === '2.352.0');

console.log('— walk-dependent pins (green after walk-v2351) —');
const changelogTest = read('src/tests/console-changelog.test.ts');
ok('THE UNREAD-COUNTER CASCADE landed (242/243/244/275)',
  changelogTest.includes("whatsNewUnreadCount('2.110.0')).toBe(242)")
  && changelogTest.includes("whatsNewUnreadCount('2.109.0')).toBe(243)")
  && changelogTest.includes("whatsNewUnreadCount('2.108.0')).toBe(244)")
  && changelogTest.includes("whatsNewUnreadCount('2.77.0')).toBe(275)"));
ok('THE HISTORY COMMENT rode the cascade block',
  changelogTest.includes('v2.352.0: the wrapper-seam entry joins the feed'));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
