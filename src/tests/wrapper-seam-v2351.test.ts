import { readFileSync } from 'node:fs';
import { describe, it, expect } from 'vitest';

// ---------------------------------------------------------------------------
// v2.352.0 — THE WRAPPER SEAM SPEAKS ITS SHAPE (the field-level casts census,
// phase 3: the export-line family dissolves).
//
// The house route wrappers (requireAuth / requireStoreAccess) declared their
// handler families with a VARIADIC rest (`...args: unknown[]`), so a handler
// that names its third parameter honestly — `context: RouteContext`, the
// shape Next.js actually passes — was assignable only through a
// `as (...args: unknown[]) => Promise<Response>` launder pasted at every
// export line. The rest is the family's own parameter now:
//
//   • `AuthedHandler<Rest>` / `StoreScopedHandler<Rest>` carry the rest as a
//     generic (default `unknown[]` — every handler that never names its rest
//     is untouched).
//   • requireAuth / requireStoreAccess are generic over the same Rest, and
//     own the ONE seam cast at each forward (`args.slice(1) as Rest`) — the
//     same boundary where the `args[0] as NextRequest` unpack already lives.
//   • The THIRTEEN handler-argument casts are gone (the generic infers
//     `[RouteContext]` from the handler's own signature).
//   • The ELEVEN wrapper-result casts were pure noise: requireStoreAccess's
//     return is INFERRED as `(...args: unknown[]) => Promise<Response>`
//     already — deleted, no signature changed.
//
// THE BOUNDARY STAYS: the `args[0] as NextRequest` / `args[1] as
// RouteContext` unpacks INSIDE wrappers and handlers, the containment
// `as Record<string, unknown>`, and withErrorBoundary's variadic contract —
// the framework adapter's own idiom, documented-open.
//
// THE FACE TWIN (styling): the transfers desk's status filter speaks its
// census — every option carries its live count and an active-lens voice
// names how many transfers the chosen lens holds.
//
// THE OD LAW: every pin reads SOURCE bytes.
// ---------------------------------------------------------------------------

const read = (p: string) => readFileSync(p, 'utf8');

const AUTH = 'src/lib/auth.ts';
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
const SHAPE_A = [
  'src/app/api/employees/[id]/route.ts',
  'src/app/api/employees/[id]/portal-link/candidates/route.ts',
  'src/app/api/employees/[id]/portal-link/route.ts',
  'src/app/api/users/[id]/route.ts',
  'src/app/api/org/branch-diagnostics/[storeCode]/route.ts',
  'src/app/api/access-requests/route.ts',
  'src/app/api/auth/manager-authorize/route.ts',
  'src/app/api/payments/mpesa/stkpush/route.ts',
];
const SHAPE_B = [
  'src/app/api/transactions/[id]/refund/route.ts',
  'src/app/api/transactions/[id]/route.ts',
  'src/app/api/transactions/route.ts',
  'src/app/api/store-transfers/[id]/route.ts',
  'src/app/api/store-transfers/route.ts',
  'src/app/api/receipts/[id]/route.ts',
  'src/app/api/receipts/route.ts',
];
const DESK = 'src/app/(shell)/tabs/transfers-tab.tsx';

/** The dissolved cast tokens (v2.348 + v2.350 classes), comments unread. */
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
    'as (...args: unknown[])',
  ];
  return tokens.filter((t) => stripped.includes(t));
}

describe('v2.352.0 — the wrapper seam speaks its shape', () => {
  it('THE HANDLER FAMILIES CARRY THEIR REST: the generic with the unknown[] default', () => {
    const src = read(AUTH);
    expect(src.includes('type AuthedHandler<Rest extends unknown[] = unknown[]> = (')).toBe(true);
    expect(src.includes('type StoreScopedHandler<Rest extends unknown[] = unknown[]> = (')).toBe(true);
    expect(src.includes('...args: Rest\n) => Promise<Response>;')).toBe(true);
  });

  it('THE WRAPPERS ARE GENERIC OVER THE REST, with the default keeping every quiet handler', () => {
    const src = read(AUTH);
    expect(src.includes('export function requireAuth<Rest extends unknown[] = unknown[]>(')).toBe(true);
    expect(src.includes('handler: AuthedHandler<Rest>,')).toBe(true);
    expect(src.includes('export function requireStoreAccess<Rest extends unknown[] = unknown[]>(')).toBe(true);
    expect(src.includes('handler: StoreScopedHandler<Rest>,')).toBe(true);
  });

  it('THE SEAM IS THE WRAPPER\u2019S OWN: one documented forward cast per seam, three seams', () => {
    const src = read(AUTH);
    expect(src.match(/\.\.\.\(args\.slice\(1\) as Rest\)/g)?.length).toBe(3);
    expect(src.includes("v2.352.0 — the wrapper's own rest seam")).toBe(true);
  });

  it('THE THIRTEEN HANDLER-ARGUMENT CASTS ARE GONE: the generic infers [RouteContext]', () => {
    for (const f of SHAPE_A) {
      const src = read(f);
      expect(src.includes('as (...args: unknown[]) => Promise<Response>'), f).toBe(false);
    }
    expect(read('src/app/api/users/[id]/route.ts').includes('requireAuth(getUserHandler,')).toBe(true);
    expect(read('src/app/api/employees/[id]/route.ts').includes('requireStoreAccess(getEmployeeHandler)')).toBe(true);
  });

  it('THE ELEVEN WRAPPER-RESULT CASTS WERE NOISE: deleted, the export lines speak the inferred truth', () => {
    for (const f of SHAPE_B) {
      const src = read(f);
      expect(src.includes('as (...args: unknown[]) => Promise<Response>'), f).toBe(false);
    }
    expect(read('src/app/api/transactions/[id]/refund/route.ts').includes('requireStoreAccess(refundTransactionHandler),')).toBe(true);
    expect(read('src/app/api/transactions/route.ts').includes('withErrorBoundary(requireStoreAccess(getTransactionsHandler), \'TRANSACTIONS_LIST\')')).toBe(true);
    expect(read('src/app/api/store-transfers/route.ts').includes('withErrorBoundary(requireStoreAccess(getStoreTransfersHandler), \'STORE_TRANSFERS_LIST\')')).toBe(true);
  });

  it('THE TOMBSTONE: zero dissolved cast tokens across the api census files', () => {
    for (const f of [...FIFTEEN, ...SHAPE_A, ...SHAPE_B]) {
      expect(censusCastTokens(read(f)), f).toEqual([]);
    }
  });

  it('THE BOUNDARY STAYS DOCUMENTED-PRESENT: the unpacks, the containment, the variadic contract', () => {
    const auth = read(AUTH);
    expect(auth.includes('const request = args[0] as NextRequest;')).toBe(true);
    expect(read('src/app/api/messages/conversations/[id]/route.ts').includes('const context = args[0] as { params: Promise<{ id: string }> };')).toBe(true);
    expect(read('src/app/api/transactions/route.ts').includes('const rawBody = (body ?? {}) as Record<string, unknown>;')).toBe(true);
  });

  it('THE FACE TWIN: the transfers filter speaks its census, the lens voice only when filtered', () => {
    const src = read(DESK);
    expect(src.includes('data-testid="transfer-status-filter"')).toBe(true);
    expect(src.includes('<SelectItem value="all">All Status · {statusCounts.all}</SelectItem>')).toBe(true);
    expect(src.includes('<SelectItem value="PENDING">Pending · {statusCounts.PENDING}</SelectItem>')).toBe(true);
    expect(src.includes('<SelectItem value="PARTIAL">Partial · {statusCounts.PARTIAL}</SelectItem>')).toBe(true);
    expect(src.includes('data-testid="transfer-lens-voice"')).toBe(true);
    expect(src.includes('{statusFilter !== \'all\' && (')).toBe(true);
    expect(src.includes('{statusCounts[statusFilter] ?? 0} in this lens')).toBe(true);
    expect(src.includes('dark:border-emerald-500/30 dark:bg-emerald-500/10')).toBe(true);
    expect(src.includes("if (t.status in c) c[t.status] += 1;")).toBe(true);
  });

  it('THE ERAS HOLD: the v2.350 helper and the v2.348 three-door tombstone stay honest', () => {
    const helper = read('src/lib/participant-ids.ts');
    expect(helper.includes('export function parseParticipantIds(raw: string | null | undefined): string[] {')).toBe(true);
    expect(read('src/app/api/products/[id]/route.ts').includes('as string')).toBe(false);
    expect(read('src/app/api/payments/mpesa/callback/route.ts').includes('as number')).toBe(false);
    const desk = read('src/components/shift-scheduling/edit-schedule-dialog.tsx');
    expect(desk.includes('data-testid="cadence-contract-voice"')).toBe(true);
  });

  it('THE RELEASE SLOT IS HONEST: the version file names the shipped slot (the audit PR merged 03aec8e1 — no slot is reserved any more)', () => {
    expect(read('VERSION').trim()).toBe('2.365.0');
  });
});
