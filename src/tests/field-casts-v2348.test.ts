import { readFileSync } from 'node:fs';
import { describe, it, expect } from 'vitest';

// ---------------------------------------------------------------------------
// v2.348.0 — THE FIELD-LEVEL CASTS CENSUS (the three doors speak the wire).
//
// Task 65/66/67 kept naming one cohort: the casts that live on a FIELD of an
// untrusted body — not on a whole handler signature (the house variadic idiom
// `args[0] as NextRequest` is a different, documented pattern and stays). The
// honest census found the named pair was three doors:
//
//   • products/[id] PUT: the body door's generic carried an index signature
//     and the handler re-cast `body.managerOverride` into the object shape it
//     actually consumes. The generic speaks the field now; the guard reads
//     the typed field directly.
//   • payroll runs/[id]/disburse-mpesa: `(await readJson(request)) as
//     {mode...}` down-cast the route helper's Record into a shape nobody
//     validated, and a filter().map() pair needed `as string` because TS
//     cannot carry a narrowing across two callbacks. The record stays a
//     record (unknown compares fine), the raw list is held as unknown[], and
//     one flatMap keeps the narrowing inside a single expression.
//   • payments/mpesa/callback: the metadata bag was typed
//     Record<string, unknown> even though Daraja's Item.Value is declared
//     `string | number` IN THIS FILE'S OWN INTERFACE — then four field casts
//     pushed the values back into string/number slots. The bag carries the
//     declared union now and the reads ask typeof; a non-finite amount is 0
//     instead of a laundered string.
//
// The face twin (styling): the ManagerAuthorizationModal — the step-up dialog
// whose retry carries `managerOverride` to exactly these doors — now says its
// security contract out loud (the password wipe, the audit-trail voice) and
// shows the reason field's 500-byte ceiling.
//
// THE OD LAW: every pin reads SOURCE bytes. The tombstone pins the THREE
// dissolved files only — the wider field-level cast class across src/app/api
// is deliberately still open (employees/[id], gift-cards, shift-schedules, …)
// and is NOT claimed here.
// ---------------------------------------------------------------------------

const read = (p: string) => readFileSync(p, 'utf8');

const PRODUCTS = 'src/app/api/products/[id]/route.ts';
const DISBURSE = 'src/app/api/payroll/runs/[id]/disburse-mpesa/route.ts';
const CALLBACK = 'src/app/api/payments/mpesa/callback/route.ts';
const MODAL = 'src/components/rbac/manager-authorization-modal.tsx';

/** The field-level cast tokens the census dissolved. `as const` is NOT one. */
function fieldLevelCastTokens(src: string): string[] {
  const stripped = src
    .split('\n')
    .map((line) => (line.includes('as const') ? '' : line))
    .join('\n');
  const tokens = ['as string', 'as number', 'as {'];
  return tokens.filter((t) => stripped.includes(t));
}

describe('v2.348.0 — the field-level casts census, the three doors', () => {
  it('THE PRODUCTS DOOR SPEAKS THE OVERRIDE: the generic names managerOverride in the wire shape', () => {
    const src = read(PRODUCTS);
    expect(src.includes('managerOverride?: {')).toBe(true);
    expect(src.includes('approverEmail?: unknown;')).toBe(true);
    expect(src.includes('approverPassword?: unknown;')).toBe(true);
    expect(src.includes('reason?: unknown;')).toBe(true);
    expect(src.includes('[key: string]: unknown;')).toBe(true);
  });

  it('THE PRODUCTS CAST IS GONE: the guard reads the typed field, no object-shape cast', () => {
    const src = read(PRODUCTS);
    expect(src.includes('body?.managerOverride && typeof body.managerOverride === \'object\'')).toBe(true);
    expect(src.includes('? body.managerOverride')).toBe(true);
    expect(fieldLevelCastTokens(src)).toEqual([]);
  });

  it('THE DISBURSE DOOR KEEPS THE RECORD: readJson answers unknown fields, the checks narrow honestly', () => {
    const src = read(DISBURSE);
    expect(src.includes('const body = await readJson(request);')).toBe(true);
    expect(src.includes('(await readJson(request)) as')).toBe(false);
    expect(src.includes("body.mode === 'retry-failed' || body.mode === 'refresh-stuck' ? body.mode : 'all'")).toBe(true);
  });

  it('THE RAW LIST IS unknown[]: the honest widening, undefined preserved when the body carries no array', () => {
    const src = read(DISBURSE);
    expect(src.includes('const rawDetailIds: unknown[] = Array.isArray(body.detailIds) ? body.detailIds : [];')).toBe(true);
    // the undefined-preservation: detailIds stays undefined when the field is absent
    const start = src.indexOf('const rawDetailIds');
    const block = src.slice(start, src.indexOf('try {', start));
    expect(block.trim().split('\n').filter((l) => l.includes('Array.isArray(body.detailIds)')).length).toBe(2);
    expect(block.includes('undefined')).toBe(true);
    expect(block.includes('.slice(0, 50)')).toBe(true);
  });

  it('THE flatMap VOICE: one expression owns the string narrowing — no cast between filter and map', () => {
    const src = read(DISBURSE);
    expect(src.includes('.flatMap((r) =>')).toBe(true);
    expect(src.includes("r.status === 'PAID' && typeof r.detailId === 'string'")).toBe(true);
    expect(src.includes('? [{ detailId: r.detailId, receipt: r.receipt ?? null }]')).toBe(true);
    expect(src.includes('as string')).toBe(false);
    expect(fieldLevelCastTokens(src)).toEqual([]);
  });

  it('THE CALLBACK BAG IS TYPED: Record<string, string | number> — the interface knew it all along', () => {
    const src = read(CALLBACK);
    expect(src.includes('Value?: string | number')).toBe(true);
    expect(src.includes('const metadata: Record<string, string | number> = {};')).toBe(true);
    expect(src.includes('if (item.Value !== undefined) metadata[item.Name] = item.Value;')).toBe(true);
  });

  it('THE FOUR READS ASK typeof: absent values answer empty, the amount refuses non-finite', () => {
    const src = read(CALLBACK);
    expect(src.includes("typeof metadata.MpesaReceiptNumber === 'string' ? metadata.MpesaReceiptNumber : ''")).toBe(true);
    expect(src.includes("typeof metadata.TransactionDate === 'string' ? metadata.TransactionDate : ''")).toBe(true);
    expect(src.includes("typeof metadata.PhoneNumber === 'string' ? metadata.PhoneNumber : ''")).toBe(true);
    expect(src.includes("typeof metadata.Amount === 'number' && Number.isFinite(metadata.Amount)")).toBe(true);
    expect(fieldLevelCastTokens(src)).toEqual([]);
  });

  it('THE MODAL SPEAKS ITS CONTRACT: the password-wipe voice, the audit voice, the counter', () => {
    const src = read(MODAL);
    expect(src.includes('data-testid="manager-auth-password-voice"')).toBe(true);
    expect(src.includes('The password is wiped from memory the moment this dialog closes or')).toBe(true);
    expect(src.includes('data-testid="manager-auth-audit-voice"')).toBe(true);
    expect(src.includes('tamper-evident audit trail with this override.')).toBe(true);
    expect(src.includes('data-testid="manager-auth-reason-count"')).toBe(true);
    expect(src.includes('{reasonText.length}/500')).toBe(true);
  });

  it('THE MODAL WEARS THE DARK WARDROBE: the amber and emerald panels hold both modes', () => {
    const src = read(MODAL);
    expect(src.includes('dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300')).toBe(true);
    expect(src.includes('dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300')).toBe(true);
  });

  it('THE CENSUS IS HONEST ABOUT ITS SCOPE: the tombstone claims three files, not the whole api tree', () => {
    // the open boundary stays open — the class ledger records it in this file's
    // header; a later round dissolves the rest and retires this reminder.
    expect(fieldLevelCastTokens(read(PRODUCTS))).toEqual([]);
    expect(fieldLevelCastTokens(read(DISBURSE))).toEqual([]);
    expect(fieldLevelCastTokens(read(CALLBACK))).toEqual([]);
  });

  it('THE ERAS HOLD: the tier lifecycle (v2.346/347) speaks through the same desk', () => {
    const desk = read('src/app/(shell)/tabs/loyalty-tab.tsx');
    expect(desk.includes('data-testid="tier-delete"')).toBe(true);
    expect(desk.includes('data-testid="tier-delete-confirm"')).toBe(true);
    const updateDoor = read('src/app/api/loyalty/tiers/[id]/route.ts');
    expect(updateDoor.includes('export const PUT')).toBe(true);
    expect(updateDoor.includes('export const DELETE')).toBe(true);
  });
});
