#!/usr/bin/env node
// verify-v2-350-0.mjs — the round's FEATURE gate (v2.350.0 "the field-level
// casts census, phase 2: the wider class dissolves"). The release MECHANICS
// live in verify-current.mjs. This script pins only what is NEW this round.
// Every check reads the SOURCE OF RECORD (bytes, not memory) — THE OD LAW.
// Run BEFORE the walk; the walk-dependent pins sit in their own tail
// section (green after walk-v2350).
import { readFileSync } from 'node:fs';

let pass = 0, fail = 0;
const ok = (name, cond) => {
  if (cond) { pass++; console.log(`  ok  ${name}`); }
  else { fail++; console.error(`x FAIL ${name}`); }
};
const read = (p) => readFileSync(p, 'utf8');

/** The dissolved cast tokens. Full-line comments and `as const` are unread. */
const censusTokens = (src) =>
  [
    'as string', 'as number', 'as Date', 'as never', 'as Array<', 'as typeof',
    'as SubJobResult[]', 'as { code?', 'as { path?', 'as { dispatcher?', 'as { results?',
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

const FIFTEEN = [
  'src/app/api/auth/login/route.ts',
  'src/app/api/auth/me/route.ts',
  'src/app/api/chat/channels/[channelId]/messages/route.ts',
  'src/app/api/customer-credits/[id]/route.ts',
  'src/app/api/employees/[id]/route.ts',
  'src/app/api/gift-cards/[id]/route.ts',
  'src/app/api/gift-cards/[id]/adjust/route.ts',
  'src/app/api/shift-schedules/route.ts',
  'src/app/api/shift-schedules/[id]/route.ts',
  'src/app/api/messages/conversations/route.ts',
  'src/app/api/messages/conversations/[id]/route.ts',
  'src/app/api/messages/conversations/[id]/messages/route.ts',
  'src/app/api/org/automation/route.ts',
  'src/app/api/org/kpi-summary/route.ts',
  'src/app/api/transactions/route.ts',
];
const [LOGIN, ME, CHAT, CREDITS, EMPLOYEES, GIFT_UPDATE, GIFT_ADJUST, SHIFT_CREATE, SHIFT_PATCH, CONV_LIST, CONV_ID, CONV_MSGS, AUTOMATION, KPI, TXN] = FIFTEEN.map(read);
const helper = read('src/lib/participant-ids.ts');
const dialog = read('src/components/shift-scheduling/edit-schedule-dialog.tsx');
const whatsNew = read('src/lib/whats-new.ts');
const changelog = read('CHANGELOG.md');
const test = read('src/tests/field-casts-v2350.test.ts');
const pkg = JSON.parse(read('package.json'));
const version = read('VERSION').trim();

console.log('— the wider class dissolves —');
ok('THE ERROR-CODE READ IS HONEST: errorCodeOf + the three call sites',
  LOGIN.includes("if (typeof err !== 'object' || err === null || !('code' in err)) return undefined;")
  && LOGIN.includes('code: errorCodeOf(dbError),')
  && LOGIN.includes('const dbErrCode = errorCodeOf(dbError);')
  && LOGIN.includes('code: errorCodeOf(error),'));
ok('THE FILTER BRIDGES READ AS PREDICATES (three doors)',
  [LOGIN, ME, CHAT].every((s) => s.includes(".filter((v): v is string => typeof v === 'string' && v.length > 0)")));
ok('THE PARTICIPANT HELPER IS THE ONE HONEST VOICE',
  helper.includes('export function parseParticipantIds(raw: string | null | undefined): string[] {')
  && helper.includes('if (!Array.isArray(parsed)) return [];')
  && helper.includes("return parsed.filter((v): v is string => typeof v === 'string');"));
ok('THE SIX PARTICIPANT SITES READ THROUGH THE HELPER, the launder gone',
  [CONV_LIST, CONV_ID, CONV_MSGS].every((s) => s.includes('parseParticipantIds('))
  && ![CONV_LIST, CONV_ID, CONV_MSGS].some((s) => s.includes('as string[]')));
ok('THE READ-STATUS BAG IS BUILT HONESTLY',
  CONV_MSGS.includes("if (typeof rawRead === 'object' && rawRead !== null && !Array.isArray(rawRead)) {")
  && CONV_MSGS.includes("if (typeof value === 'string') readStatus[key] = value;")
  && !CONV_MSGS.includes('as Record<string, string>'));
ok('THE AUTOMATION BAGS READ THROUGH THE IN-NARROWING',
  AUTOMATION.includes("parsed && typeof parsed === 'object' && 'path' in parsed")
  && AUTOMATION.includes("'results' in parsed &&")
  && AUTOMATION.includes("if (!('name' in r) || !('ok' in r) || !('status' in r)) return false;")
  && AUTOMATION.includes("const rawDispatcher = 'dispatcher' in parsed ? parsed.dispatcher : undefined;"));
ok('THE REORDER HINT CARRIES ITS OWN NULLABILITY (five seed casts gone)',
  KPI.includes('interface ReorderHint {')
  && KPI.includes('.map((p): ReorderHint => ({')
  && KPI.includes('lastUnitCost: null,')
  && !KPI.includes('lastUnitCost: null as'));
ok('THE AISLE KEY NARROWS + THE TYPED EMPTIES ARE TYPE ARGUMENTS',
  KPI.includes(".filter((g): g is typeof g & { walkCategoryId: string } => typeof g.walkCategoryId === 'string')")
  && KPI.includes(': Promise.resolve<Array<{ stockTakeId: string; productId: string }>>([]),')
  && KPI.includes(': Promise.resolve<Array<{ categoryId: string | null; _count: { _all: number } }>>([]),'));
ok('THE APPLIED PATCH SPEAKS ITS OWN SHAPE (four read-back casts gone)',
  SHIFT_PATCH.includes('interface PatchApplied {')
  && SHIFT_PATCH.includes('const updates: PatchApplied = {};')
  && SHIFT_PATCH.includes('const finalDow = updates.dayOfWeek !== undefined ? updates.dayOfWeek : existing.dayOfWeek;')
  && !SHIFT_PATCH.includes('as Date | null'));
ok('THE CONVERTED DATES READ THE WIRE (string-or-number, else refused)',
  GIFT_UPDATE.includes("if (typeof rawExpires !== 'string' && typeof rawExpires !== 'number') {")
  && SHIFT_CREATE.includes("if (typeof rawSpecific !== 'string' && typeof rawSpecific !== 'number') {")
  && SHIFT_CREATE.includes('VALID_STATUSES.some((v) => v === status)'));
ok('THE ADJUST DOOR TELLS THE DEAD-BRANCH TRUTH',
  !GIFT_ADJUST.includes('const previousStatus')
  && GIFT_ADJUST.includes('let newStatus = giftCard.status;')
  && !GIFT_ADJUST.includes("=== 'REDEEMED' &&"));
ok('THE ZOD-COERCED FIELDS NEED NO RE-NARROWING (four pure deletions)',
  TXN.includes('round2(toDec(discountAmount)), totalAmount)')
  && TXN.includes('? toNum(paymentDetails.cashAmount)')
  && TXN.includes('.reduce((acc, s) => acc.plus(toDec(s.amount)), new Decimal(0));')
  && TXN.includes('const splitAmount = toNum(split.amount);'));
ok('THE DEDUCTION ROW IS TYPED BY DERIVATION',
  TXN.includes("type DeductionProduct = typeof products[0]['bundleItems'][number]['childProduct'];")
  && TXN.includes('product: childProduct,')
  && !TXN.includes('as typeof products[0]'));
ok('THE EMPLOYEE PAYLOAD SPEAKS PRISMA + the raw enum validation',
  EMPLOYEES.includes('const data: Prisma.EmployeeUpdateInput = {};')
  && EMPLOYEES.includes('    data,')
  && !EMPLOYEES.includes('as never')
  && EMPLOYEES.includes("typeof rawRole !== 'string' || !VALID_ROLES.includes(rawRole)")
  && EMPLOYEES.includes('data.hourlyRate = null;'));
ok('THE CREDITS DOOR VALIDATES THE RAW TYPE',
  CREDITS.includes("typeof rawType !== 'string' || !validTypes.includes(rawType)")
  && CREDITS.includes("const effectiveType = typeof rawEffectiveType === 'string' ? rawEffectiveType : existing.creditType;"));

console.log('— the tombstone —');
ok('THE TOMBSTONE: zero dissolved cast tokens across all fifteen doors',
  FIFTEEN.every((_, i) => censusTokens([LOGIN, ME, CHAT, CREDITS, EMPLOYEES, GIFT_UPDATE, GIFT_ADJUST, SHIFT_CREATE, SHIFT_PATCH, CONV_LIST, CONV_ID, CONV_MSGS, AUTOMATION, KPI, TXN][i]).length === 0));
ok('THE BOUNDARY STAYS DOCUMENTED-PRESENT (not quietly widened)',
  SHIFT_PATCH.includes('const request = args[0] as NextRequest;')
  && SHIFT_PATCH.includes('const context = args[1] as RouteContext;')
  && TXN.includes('const rawBody = (body ?? {}) as Record<string, unknown>;'));

console.log('— the face twin + the release —');
ok('THE CADENCE CONTRACT VOICE speaks only on a switch, both wardrobes',
  dialog.includes('data-testid="cadence-contract-voice"')
  && dialog.includes('{scheduleType !== originalType && !isCompleted && (')
  && dialog.includes('dark:border-amber-500/30 dark:bg-amber-500/10')
  && dialog.includes('dark:border-emerald-500/30 dark:bg-emerald-500/10'));
ok('THE ERA TEST EXISTS with the tombstone helper',
  test.includes('function censusCastTokens(src: string): string[] {')
  && test.includes("THE RELEASE SLOT IS HONEST"));
ok('WHATS-NEW 2.350.0 leads the feed', whatsNew.includes("version: '2.350.0',") && whatsNew.indexOf("'2.350.0'") < whatsNew.indexOf("'2.348.0'"));
ok('CHANGELOG 2.350.0 leads', changelog.startsWith('## [2.350.0]'));
ok('VERSION + package.json say 2.350.0 (three slots)', version === '2.350.0' && pkg.version === '2.350.0' && pkg.mbumah.releaseVersion === '2.350.0' && pkg.mbumah.baseVersion === '2.350.0');

console.log('— walk-dependent pins (green after walk-v2350) —');
const changelogTest = read('src/tests/console-changelog.test.ts');
ok('THE UNREAD-COUNTER CASCADE landed (240/241/242/273)',
  changelogTest.includes("whatsNewUnreadCount('2.110.0')).toBe(240)")
  && changelogTest.includes("whatsNewUnreadCount('2.109.0')).toBe(241)")
  && changelogTest.includes("whatsNewUnreadCount('2.108.0')).toBe(242)")
  && changelogTest.includes("whatsNewUnreadCount('2.77.0')).toBe(273)"));
ok('THE HISTORY COMMENT rode the cascade block',
  changelogTest.includes('v2.350.0: the phase-2 census entry joins the feed'));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
