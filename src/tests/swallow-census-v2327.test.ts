// THE SWALLOW CENSUS (v2.327.0): the last body-read class, classified.
//
// v2.324-326 doored every DECLARING bare read (89 files total). What
// remained were the chained reads — `.catch(() => ({}))` / `.catch(() => null)`
// — 40 of them. This round classifies every one into three laws:
//
//   1. THE SILENT-PROCEED CLASS → DOORED (20 files): a malformed body became
//      `{}` and RAN — the service then threw on the missing fields and the
//      error boundary wore whatever face the throw produced (often a 500,
//      always a message that lied about what went wrong). These now read
//      through readJsonBody.
//   2. THE OPTIONAL-BODY CLASS → THE NEW DOOR (4 files): reminders/debt
//      process+schedule (`{ storeId? }` defaults to the session store),
//      repair-journal-headers (dryRun defaults true), chat read-marker
//      (`{ messageId? }`) — an EMPTY body is a legitimate call, so
//      readOptionalJsonBody passes `{}`; a PRESENT unreadable body is still
//      the client mistake and answers the door's 400.
//   3. THE HONEST-SWALLOW CLASS → PINNED AS THE PATTERN (16 sites): the
//      catch feeds an explicit validation that already answers 400 —
//      messages/kra/stock-takes/vouchers-send/etims/bulk-seed null-checks,
//      chat channels' zod safeParse, the refund schema's validateInput, and
//      the two DARAJA webhooks whose leniency is the integration contract.
//      Keeping them is the law; this file is their guard.

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import {
  readJsonBody,
  readOptionalJsonBody,
  bodyDoorRejected,
} from '@/lib/request-body';

const req = (raw: string | undefined, ct = 'application/json') =>
  new Request('http://localhost/api/body-door-probe', {
    method: 'POST',
    ...(raw === undefined ? {} : { body: raw }),
    headers: ct ? { 'Content-Type': ct } : {},
  });

// ---------------------------------------------------------------------------
// 1. THE SILENT-PROCEED CLASS IS DOORED (20 files)
// ---------------------------------------------------------------------------

const SILENT_FILES: string[] = [
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

describe('THE SILENT-PROCEED CLASS IS DOORED (20 files)', () => {
  for (const file of SILENT_FILES) {
    it(`${file} reads through the door (no chained read remains)`, () => {
      const src = readFileSync(file, 'utf8');
      expect(src.includes("from '@/lib/request-body'")).toBe(true);
      expect(src.includes('readJsonBody')).toBe(true);
      expect(src.includes('bodyDoorRejected')).toBe(true);
      expect(src.includes('THE SWALLOW DOOR: an unreadable body is a client mistake (v2.327.0)')).toBe(true);
      // and NOT ONE chained read remains
      expect(/await request\.json\(\)\s*\.catch/.test(src)).toBe(false);
    });
  }

  it('data-exports no longer lies about the missing fields', () => {
    // the old swallow made a malformed body answer "storeId, exportType, and
    // format are required" — the door answers for the body itself
    const src = readFileSync('src/app/api/data-exports/route.ts', 'utf8');
    expect(src.indexOf('readJsonBody')).toBeGreaterThan(-1);
    expect(/await request\.json\(\)\s*\.catch/.test(src)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// 2. THE OPTIONAL-BODY CLASS READS THE NEW DOOR (4 files)
// ---------------------------------------------------------------------------

const OPTIONAL_FILES: string[] = [
  'src/app/api/reminders/debt/process/route.ts',
  'src/app/api/reminders/debt/schedule/route.ts',
  'src/app/api/admin/repair-journal-headers/route.ts',
  'src/app/api/chat/channels/[channelId]/read/route.ts',
];

describe('THE OPTIONAL-BODY CLASS READS THE NEW DOOR (4 files)', () => {
  for (const file of OPTIONAL_FILES) {
    it(`${file} reads through readOptionalJsonBody`, () => {
      const src = readFileSync(file, 'utf8');
      expect(src.includes('readOptionalJsonBody')).toBe(true);
      expect(src.includes('bodyDoorRejected')).toBe(true);
      expect(src.includes('THE OPTIONAL SWALLOW DOOR (v2.327.0)')).toBe(true);
      expect(/await request\.json\(\)\s*\.catch/.test(src)).toBe(false);
    });
  }

  it('the optional door passes an EMPTY body as {} (the legitimate call)', async () => {
    const door = await readOptionalJsonBody(req(undefined));
    expect(door.ok).toBe(true);
    if (door.ok) expect(door.body).toEqual({});
    const whitespace = await readOptionalJsonBody(req('   '));
    expect(whitespace.ok).toBe(true);
  });

  it('the optional door passes a valid object and rejects a PRESENT unreadable body', async () => {
    const good = await readOptionalJsonBody<{ storeId?: string }>(req('{"storeId":"s1"}'));
    expect(good.ok).toBe(true);
    if (good.ok) expect(good.body.storeId).toBe('s1');
    for (const raw of ['{malformed', '[1,2,3]', '"str"', '42', 'null']) {
      const door = await readOptionalJsonBody(req(raw));
      expect(door.ok).toBe(false);
    }
  });

  it('the hard door still rejects an EMPTY body (the two doors differ exactly where they must)', async () => {
    expect((await readJsonBody(req(undefined))).ok).toBe(false);
    expect((await readOptionalJsonBody(req(undefined))).ok).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 3. THE HONEST-SWALLOW CLASS IS PINNED AS THE PATTERN (16 sites)
// ---------------------------------------------------------------------------

describe('THE HONEST-SWALLOW CLASS IS THE PATTERN, NOT A FORGOTTEN ONE (16 sites)', () => {
  const honest = (file: string) => readFileSync(file, 'utf8');

  it('messages/conversations validates after the catch (explicit 400)', () => {
    for (const file of [
      'src/app/api/messages/conversations/route.ts',
      'src/app/api/messages/conversations/[id]/route.ts',
      'src/app/api/messages/conversations/[id]/messages/route.ts',
    ]) {
      const src = honest(file);
      expect(src.includes("request.json().catch(() => null)")).toBe(true);
      expect(src.includes("'Invalid JSON body.'")).toBe(true);
    }
  });

  it('kra validates after the catch (explicit 400)', () => {
    expect(honest('src/app/api/kra/submit/route.ts').includes("'transactionId is required.'")).toBe(true);
    expect(honest('src/app/api/kra/profile/route.ts').includes("'Invalid JSON body.'")).toBe(true);
  });

  it('stock-takes validate after the catch (required-field 400s, null-optional reads)', () => {
    expect(honest('src/app/api/stock-takes/route.ts').includes("'storeId is required.'")).toBe(true);
    expect(honest('src/app/api/stock-takes/[id]/count/route.ts').includes("'lineId is required.'")).toBe(true);
    // the cancel route reads an OPTIONAL reason (null-optional, honest default)
    expect(honest('src/app/api/stock-takes/[id]/cancel/route.ts').includes("typeof body?.reason === 'string'")).toBe(true);
  });

  it('vouchers/send validates after the catch', () => {
    expect(honest('src/app/api/vouchers/send/route.ts').includes('voucherId, channel, and recipient are required.')).toBe(true);
  });

  it('etims/cancel-invoice validates after the catch', () => {
    expect(honest('src/app/api/etims/cancel-invoice/route.ts').includes('invoiceNumber and reason are required.')).toBe(true);
  });

  it('chat channels parse through zod after the catch', () => {
    expect(honest('src/app/api/chat/channels/route.ts').includes('chatChannelCreateSchema.safeParse')).toBe(true);
    expect(honest('src/app/api/chat/channels/[channelId]/messages/route.ts').includes('chatMessageSchema.safeParse')).toBe(true);
  });

  it('the refund schema validates after the catch (validateInput)', () => {
    expect(honest('src/app/api/transactions/[id]/refund/route.ts').includes('validateInput(refundSchema')).toBe(true);
  });

  it('admin/bulk-seed answers its own honest 400', () => {
    expect(honest('src/app/api/admin/bulk-seed/route.ts').includes("'JSON body required.'")).toBe(true);
  });

  it('the DARAJA webhooks keep their leniency (the integration contract)', () => {
    expect(honest('src/app/api/payments/mpesa/b2c/result/route.ts').includes('request.json().catch')).toBe(true);
    expect(honest('src/app/api/payments/mpesa/b2c/queue-timeout/route.ts').includes('request.json().catch')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 4. THE OPTIONAL DOOR HOME (lib/request-body.ts)
// ---------------------------------------------------------------------------

describe('THE OPTIONAL-BODY DOOR HOME', () => {
  it('readOptionalJsonBody is exported and its law is written', () => {
    const home = readFileSync('src/lib/request-body.ts', 'utf8');
    expect(home.includes('export async function readOptionalJsonBody')).toBe(true);
    expect(home.includes('THE OPTIONAL-BODY DOOR (v2.327.0)')).toBe(true);
    expect(home.includes('THE SWALLOW CENSUS')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 5. THE RETENTION COUNTDOWN — the export's lifetime speaks before it dies
// ---------------------------------------------------------------------------

describe('THE RETENTION COUNTDOWN — the exports history wears its lifetime', () => {
  const table = readFileSync('src/components/data-exports/exports-history-table.tsx', 'utf8');

  it('the countdown helper exists with its law', () => {
    expect(table.includes('THE RETENTION COUNTDOWN (v2.327.0)')).toBe(true);
    expect(table.includes('function retentionCountdown(')).toBe(true);
  });

  it('the truth table: days beyond 48h, hours inside, amber soon, the past belongs to the Expired badge', () => {
    expect(table.includes("if (hours >= 48) return { label: `expires in ${Math.floor(hours / 24)}d`, soon: false };")).toBe(true);
    expect(table.includes("if (hours >= 1) return { label: `expires in ${hours}h`, soon: hours < 24 };")).toBe(true);
    expect(table.includes("return { label: 'expires soon', soon: true };")).toBe(true);
    expect(table.includes('the Expired badge owns the past')).toBe(true);
  });

  it('the pill renders beside created-at (testid, amber-when-soon, muted otherwise, dark variants)', () => {
    expect(table.includes('data-testid="export-retention"')).toBe(true);
    expect(table.includes('bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-700 dark:bg-amber-950/40 dark:text-amber-400')).toBe(true);
    expect(table.includes("rounded-full bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground dark:bg-muted/50")).toBe(true);
    expect(table.includes('<Clock className="h-2.5 w-2.5" aria-hidden="true" />')).toBe(true);
  });

  it('the bodyDoor rejection voice still answers 400 (the door family regression pin)', () => {
    const res = bodyDoorRejected();
    expect(res.status).toBe(400);
  });
});
