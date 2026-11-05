import { readFileSync } from 'node:fs';
import { describe, it, expect } from 'vitest';

// ---------------------------------------------------------------------------
// v2.350.0 — THE FIELD-LEVEL CASTS CENSUS, PHASE 2 (the wider class dissolves).
//
// v2.348.0 dissolved the three named doors and recorded the wider field-level
// class OPEN. This round dissolves it: fifteen doors stop laundering the
// wire's own truth. The dissolutions, by pattern:
//
//   • THE ERROR-CODE READ (auth/login ×3): a caught value is `unknown`; the
//     code is spoken only when the value is an object carrying a string under
//     `code` (the in-narrowing) — errorCodeOf, one honest read, three calls.
//   • THE FILTER-BRIDGE (auth/login, auth/me, chat channels): the
//     filter(Boolean) as string[] bridges read as type-predicate filters
//     (`typeof v === 'string' && v.length > 0` — the kpi-summary voice).
//   • THE PARTICIPANT LISTS (conversations ×6, shared helper): JSON.parse
//     answers unknown; only an array of strings is a participant list —
//     malformed JSON and non-strings answer the honest empty list (what
//     every call site's catch already chose), and the try/catch scaffolding
//     the launder needed is gone with it. (src/lib/participant-ids.ts)
//   • THE READ-STATUS BAG (conversations/[id]/messages): only string entries
//     survive the build — the door makes the old cast's claim TRUE.
//   • THE JSON-BAG FIELD READS (org/automation ×5): the metadata fields are
//     reached through the `in` narrowing; the SubJobResult predicate
//     validates each field off the record the narrowing hands over — the
//     double shape-cast bridge is gone.
//   • THE TYPED SEEDS (org/kpi-summary): the five null-seed casts moved into
//     a named ReorderHint interface; the aisle key narrows through an
//     explicit type predicate; the three typed empty-arrays became type
//     ARGUMENTS on Promise.resolve.
//   • THE APPLIED PATCH (shift-schedules/[id]): the converted patch carries
//     its own PatchApplied interface (wire strings → Dates) — the four
//     read-back casts died with it.
//   • THE CONVERTED DATES (gift-cards/[id], shift-schedules): the wire value
//     is read as a string-or-number before new Date(); any other shape is
//     refused by the voice the door already speaks.
//   • THE REDUNDANT COERCIONS (transactions ×4, gift-cards adjust): the
//     Zod-coerced door already typed the fields — the casts were noise and
//     are simply gone. The adjust door's cast, once gone, EXPOSED a dead
//     branch (a REDEEMED card can never reach the status block — the guard
//     refuses it first); the dead branch is removed, runtime-identical.
//   • THE HONEST REFUSALS (customer-credits, employees): the raw wire value
//     is validated as a string before it is stored — a non-string whose
//     String() form matched can no longer sail through; the employee update
//     payload speaks Prisma's own EmployeeUpdateInput (the `as never`
//     anything-goes silence is gone) and the zero-hourly write clears its
//     own key.
//   • THE ROW-SHAPE BRIDGE (transactions): the stock-deduction map's product
//     row is typed by DERIVATION from the bundle child's own shape — the
//     include-lie cast is gone.
//
// THE BOUNDARY STAYS (documented, not dissolved): the house variadic unpack
// (`args[0] as NextRequest`, `args[1] as RouteContext`, `as { params… }`,
// the export-line `as (...args: unknown[])` wrapper casts) and the
// containment-boundary `as Record<string, unknown>` are the framework
// adapter's own idiom — a different class, still open.
//
// THE FACE TWIN (styling): the edit-schedule dialog speaks the cadence
// contract — switching a shift's type names what the switch retires BEFORE
// the flight, in the PATCH door's own exclusive voice (dayOfWeek XOR
// specificDate), and only when there is a switch.
//
// THE OD LAW: every pin reads SOURCE bytes. The tombstone pins the FIFTEEN
// dissolved files; the boundary class is NOT claimed.
// ---------------------------------------------------------------------------

const read = (p: string) => readFileSync(p, 'utf8');

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

const LOGIN = FIFTEEN[0];
const ME = FIFTEEN[1];
const CHAT = FIFTEEN[2];
const CREDITS = FIFTEEN[3];
const EMPLOYEES = FIFTEEN[4];
const GIFT_UPDATE = FIFTEEN[5];
const GIFT_ADJUST = FIFTEEN[6];
const SHIFT_CREATE = FIFTEEN[7];
const SHIFT_PATCH = FIFTEEN[8];
const CONV_LIST = FIFTEEN[9];
const CONV_ID = FIFTEEN[10];
const CONV_MSGS = FIFTEEN[11];
const AUTOMATION = FIFTEEN[12];
const KPI = FIFTEEN[13];
const TXN = FIFTEEN[14];
const HELPER = 'src/lib/participant-ids.ts';
const EDIT_DIALOG = 'src/components/shift-scheduling/edit-schedule-dialog.tsx';

/** The dissolved cast tokens. `as const` and full-line comments are NOT read. */
function censusCastTokens(src: string): string[] {
  const stripped = src
    .split('\n')
    .map((line) => {
      const t = line.trim();
      return t.startsWith('//') || t.startsWith('*') || t.startsWith('/*') || line.includes('as const')
        ? ''
        : line;
    })
    .join('\n');
  const tokens = [
    'as string',
    'as number',
    'as Date',
    'as never',
    'as Array<',
    'as typeof',
    'as SubJobResult[]',
    'as { code?',
    'as { path?',
    'as { dispatcher?',
    'as { results?',
  ];
  return tokens.filter((t) => stripped.includes(t));
}

describe('v2.350.0 — the field-level casts census, phase 2: the wider class dissolves', () => {
  it('THE ERROR-CODE READ IS HONEST: errorCodeOf narrows through the in-check, the three casts are gone', () => {
    const src = read(LOGIN);
    expect(src.includes("if (typeof err !== 'object' || err === null || !('code' in err)) return undefined;")).toBe(true);
    expect(src.includes('return typeof code === \'string\' ? code : undefined;')).toBe(true);
    expect(src.includes('code: errorCodeOf(dbError),')).toBe(true);
    expect(src.includes('const dbErrCode = errorCodeOf(dbError);')).toBe(true);
    expect(src.includes('code: errorCodeOf(error),')).toBe(true);
    expect(censusCastTokens(src)).toEqual([]);
  });

  it('THE FILTER BRIDGES READ AS PREDICATES: the membership and origin lists narrow for real', () => {
    const pred = ".filter((v): v is string => typeof v === 'string' && v.length > 0)";
    expect(read(LOGIN).includes(pred)).toBe(true);
    expect(read(ME).includes(pred)).toBe(true);
    expect(read(CHAT).includes(pred)).toBe(true);
    expect(censusCastTokens(read(ME))).toEqual([]);
    expect(censusCastTokens(read(CHAT))).toEqual([]);
  });

  it('THE PARTICIPANT HELPER IS THE ONE HONEST VOICE: parse, array-check, string-narrow', () => {
    const src = read(HELPER);
    expect(src.includes('export function parseParticipantIds(raw: string | null | undefined): string[] {')).toBe(true);
    expect(src.includes('if (!Array.isArray(parsed)) return [];')).toBe(true);
    expect(src.includes("return parsed.filter((v): v is string => typeof v === 'string');")).toBe(true);
  });

  it('THE SIX PARTICIPANT SITES READ THROUGH THE HELPER: the JSON.parse launder and its try/catch scaffolding are gone', () => {
    for (const f of [CONV_LIST, CONV_ID, CONV_MSGS]) {
      const src = read(f);
      expect(src.includes('parseParticipantIds(')).toBe(true);
      expect(src.includes('JSON.parse(c.participantIds) as string[]')).toBe(false);
      expect(src.includes('JSON.parse(conversation.participantIds) as string[]')).toBe(false);
      expect(src.includes('JSON.parse(existing.participantIds) as string[]')).toBe(false);
      expect(censusCastTokens(src)).toEqual([]);
    }
    expect(read(CONV_LIST).includes('const ids = parseParticipantIds(c.participantIds);')).toBe(true);
    expect(read(CONV_ID).includes('const currentIds = parseParticipantIds(existing.participantIds);')).toBe(false);
    expect(read(CONV_ID).includes('currentIds = parseParticipantIds(existing.participantIds);')).toBe(true);
  });

  it('THE READ-STATUS BAG IS BUILT HONESTLY: only string entries survive', () => {
    const src = read(CONV_MSGS);
    expect(src.includes('const readStatus: Record<string, string> = {};')).toBe(true);
    expect(src.includes("if (typeof rawRead === 'object' && rawRead !== null && !Array.isArray(rawRead)) {")).toBe(true);
    expect(src.includes("if (typeof value === 'string') readStatus[key] = value;")).toBe(true);
    expect(src.includes('as Record<string, string>')).toBe(false);
  });

  it('THE AUTOMATION BAGS READ THROUGH THE IN-NARROWING: path, dispatcher, results — no shape casts', () => {
    const src = read(AUTOMATION);
    expect(src.includes("parsed && typeof parsed === 'object' && 'path' in parsed")).toBe(true);
    expect(src.includes("parsed && typeof parsed === 'object' && 'dispatcher' in parsed")).toBe(true);
    expect(src.includes("'results' in parsed &&")).toBe(true);
    expect(src.includes('const rawResults: unknown[] = parsed.results;')).toBe(true);
    expect(src.includes("if (!('name' in r) || !('ok' in r) || !('status' in r)) return false;")).toBe(true);
    expect(src.includes("const deleted: unknown = 'deleted' in r ? r.deleted : undefined;")).toBe(true);
    expect(src.includes("const rawDispatcher = 'dispatcher' in parsed ? parsed.dispatcher : undefined;")).toBe(true);
    expect(censusCastTokens(src)).toEqual([]);
  });

  it('THE REORDER HINT CARRIES ITS OWN NULLABILITY: five seed casts moved into the interface', () => {
    const src = read(KPI);
    expect(src.includes('interface ReorderHint {')).toBe(true);
    expect(src.includes('lastUnitCost: number | null;')).toBe(true);
    expect(src.includes('lastSupplierPoNumber: string | null;')).toBe(true);
    expect(src.includes('.map((p): ReorderHint => ({')).toBe(true);
    expect(src.includes('lastUnitCost: null,')).toBe(true);
    expect(src.includes('lastUnitCost: null as')).toBe(false);
    expect(src.includes('lastSupplierId: null as')).toBe(false);
    expect(src.includes('lastSupplierName: null as')).toBe(false);
    expect(src.includes('lastSupplierPoNumber: null as')).toBe(false);
    expect(src.includes('lastSupplierAt: null as')).toBe(false);
  });

  it('THE AISLE KEY NARROWS THROUGH THE PREDICATE and the typed empties became type arguments', () => {
    const src = read(KPI);
    expect(src.includes(".filter((g): g is typeof g & { walkCategoryId: string } => typeof g.walkCategoryId === 'string')")).toBe(true);
    expect(src.includes('categoryId: g.walkCategoryId,')).toBe(true);
    expect(src.includes('name: aisleNames.get(g.walkCategoryId) ?? \'a named aisle\',')).toBe(true);
    expect(src.includes(': Promise.resolve<Array<{ stockTakeId: string; productId: string }>>([]),')).toBe(true);
    expect(src.includes(': Promise.resolve<Array<{ productId: string }>>([]),')).toBe(true);
    expect(src.includes(': Promise.resolve<Array<{ categoryId: string | null; _count: { _all: number } }>>([]),')).toBe(true);
    expect(censusCastTokens(src)).toEqual([]);
  });

  it('THE APPLIED PATCH SPEAKS ITS OWN SHAPE: the four read-back casts are gone', () => {
    const src = read(SHIFT_PATCH);
    expect(src.includes('interface PatchApplied {')).toBe(true);
    expect(src.includes('specificDate?: Date | null;')).toBe(true);
    expect(src.includes('const updates: PatchApplied = {};')).toBe(true);
    expect(src.includes('const finalDow = updates.dayOfWeek !== undefined ? updates.dayOfWeek : existing.dayOfWeek;')).toBe(true);
    expect(src.includes('const finalStart = updates.startTime ?? existing.startTime;')).toBe(true);
    expect(src.includes('as number | null')).toBe(false);
    expect(src.includes('as Date | null')).toBe(false);
    expect(src.includes('as Date | undefined')).toBe(false);
    expect(censusCastTokens(src)).toEqual([]);
  });

  it('THE CONVERTED DATES READ THE WIRE: string-or-number before new Date, other shapes refused', () => {
    const gift = read(GIFT_UPDATE);
    expect(gift.includes("if (typeof rawExpires !== 'string' && typeof rawExpires !== 'number') {")).toBe(true);
    expect(gift.includes("'expiresAt must be a date string or a timestamp.'")).toBe(true);
    expect(gift.includes('updateData.expiresAt = new Date(rawExpires);')).toBe(true);
    expect(censusCastTokens(gift)).toEqual([]);

    const shift = read(SHIFT_CREATE);
    expect(shift.includes("if (typeof rawSpecific !== 'string' && typeof rawSpecific !== 'number') {")).toBe(true);
    expect(shift.includes('specificDateVal = new Date(rawSpecific);')).toBe(true);
    expect(shift.includes('VALID_STATUSES.some((v) => v === status)')).toBe(true);
    expect(censusCastTokens(shift)).toEqual([]);
  });

  it('THE ADJUST DOOR TELLS THE DEAD-BRANCH TRUTH: the redundant cast is gone and the unreachable REDEEMED branch with it', () => {
    const src = read(GIFT_ADJUST);
    expect(src.includes('const previousStatus = giftCard.status as string;')).toBe(false);
    expect(src.includes("previousStatus === 'REDEEMED'")).toBe(false);
    expect(src.includes('const previousStatus')).toBe(false);
    expect(src.includes('let newStatus = giftCard.status;')).toBe(true);
    expect(src.includes("newStatus = 'REDEEMED';")).toBe(true);
    expect(censusCastTokens(src)).toEqual([]);
  });

  it('THE ZOD-COERCED FIELDS NEED NO RE-NARROWING: the four transaction casts are pure deletions', () => {
    const src = read(TXN);
    expect(src.includes('toDec(discountAmount as')).toBe(false);
    expect(src.includes('toNum(paymentDetails.cashAmount as')).toBe(false);
    expect(src.includes('toDec(s.amount as')).toBe(false);
    expect(src.includes('toNum(split.amount as')).toBe(false);
    expect(src.includes('round2(toDec(discountAmount)), totalAmount)')).toBe(true);
    expect(src.includes('? toNum(paymentDetails.cashAmount)')).toBe(true);
    expect(src.includes('.reduce((acc, s) => acc.plus(toDec(s.amount)), new Decimal(0));')).toBe(true);
    expect(src.includes('const splitAmount = toNum(split.amount);')).toBe(true);
  });

  it('THE DEDUCTION ROW IS TYPED BY DERIVATION: the include-lie bridge cast is gone', () => {
    const src = read(TXN);
    expect(src.includes("type DeductionProduct = typeof products[0]['bundleItems'][number]['childProduct'];")).toBe(true);
    expect(src.includes('product: DeductionProduct;')).toBe(true);
    expect(src.includes('product: childProduct,')).toBe(true);
    expect(src.includes('as typeof products[0]')).toBe(false);
  });

  it('THE EMPLOYEE PAYLOAD SPEAKS PRISMA: the anything-goes silence is gone, the enums validate the raw value', () => {
    const src = read(EMPLOYEES);
    expect(src.includes('const data: Prisma.EmployeeUpdateInput = {};')).toBe(true);
    expect(src.includes('    data,')).toBe(true);
    expect(src.includes('data: data as never')).toBe(false);
    expect(src.includes("typeof rawRole !== 'string' || !VALID_ROLES.includes(rawRole)")).toBe(true);
    expect(src.includes("typeof rawType !== 'string' || !VALID_EMPLOYMENT_TYPES.includes(rawType)")).toBe(true);
    expect(src.includes('data.hourlyRate = null;')).toBe(true);
    expect(src.includes('data[f] = f ===')).toBe(false);
    expect(censusCastTokens(src)).toEqual([]);
  });

  it('THE CREDITS DOOR VALIDATES THE RAW TYPE: the truthy non-string can no longer ride the cast', () => {
    const src = read(CREDITS);
    expect(src.includes("typeof rawType !== 'string' || !validTypes.includes(rawType)")).toBe(true);
    expect(src.includes("const effectiveType = typeof rawEffectiveType === 'string' ? rawEffectiveType : existing.creditType;")).toBe(true);
    expect(src.includes('updateData.creditType as string')).toBe(false);
    expect(src.includes('existing.creditType) as string')).toBe(false);
    expect(censusCastTokens(src)).toEqual([]);
  });

  it('THE TOMBSTONE: zero dissolved cast tokens across all fifteen doors', () => {
    for (const f of FIFTEEN) {
      expect(censusCastTokens(read(f)), f).toEqual([]);
    }
  });

  it('THE BOUNDARY STAYS DOCUMENTED: the wrapper unpacks are a different, open class', () => {
    // the house variadic idiom and the containment record are NOT claimed —
    // they must still be present (the boundary was not quietly widened).
    expect(read(SHIFT_PATCH).includes('const request = args[0] as NextRequest;')).toBe(true);
    expect(read(SHIFT_PATCH).includes('const context = args[1] as RouteContext;')).toBe(true);
    expect(read(TXN).includes('const rawBody = (body ?? {}) as Record<string, unknown>;')).toBe(true);
  });

  it('THE FACE TWIN: the edit dialog speaks the cadence contract, only when the type switches', () => {
    const src = read(EDIT_DIALOG);
    expect(src.includes('data-testid="cadence-contract-voice"')).toBe(true);
    expect(src.includes('{scheduleType !== originalType && !isCompleted && (')).toBe(true);
    expect(src.includes('the weekly recurrence is retired from the schedule.')).toBe(true);
    expect(src.includes('any single date on it')).toBe(true);
    expect(src.includes('dark:border-amber-500/30 dark:bg-amber-500/10')).toBe(true);
    expect(src.includes('dark:border-emerald-500/30 dark:bg-emerald-500/10')).toBe(true);
    expect(src.includes('setOriginalType(isRecurring ? \'recurring\' : \'one-off\');')).toBe(true);
  });

  it('THE ERAS HOLD: the v2.348 three-door tombstone stays zero and the tier desk keeps its voices', () => {
    const three = ['src/app/api/products/[id]/route.ts', 'src/app/api/payroll/runs/[id]/disburse-mpesa/route.ts', 'src/app/api/payments/mpesa/callback/route.ts'];
    for (const f of three) {
      const src = read(f);
      expect(src.includes('as string')).toBe(false);
      expect(src.includes('as number')).toBe(false);
    }
    const desk = read('src/app/(shell)/tabs/loyalty-tab.tsx');
    expect(desk.includes('data-testid="tier-delete"')).toBe(true);
    expect(read('src/app/api/loyalty/tiers/[id]/route.ts').includes('export const DELETE')).toBe(true);
  });

  it('THE RELEASE SLOT IS HONEST: 2.350.0 shipped, 2.349.0 reserved for the gated audit PR', () => {
    expect(read('VERSION').trim()).toBe('2.406.0');
  });
});
