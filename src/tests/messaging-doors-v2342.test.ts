import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'path';
import { describe, it, expect } from 'vitest';

// ---------------------------------------------------------------------------
// v2.342.0 — THE MESSAGING FAMILY, the bare class's third pass.
//
// The four messaging reads (messages, messaging/bulk, whatsapp/send,
// whatsapp/send-document) stop reading their bodies as the door's default
// `any` and speak their own shapes:
//   • the truthiness-guarded fields ride REQUIRED strings — the route's
//     own guard is the runtime validator (messages' storeId/content pair,
//     bulk's storeId/message pair, send's phone/message pair,
//     send-document's type/storeId pair);
//   • the narrowed unions ride their own validators — bulk's channel and
//     audience ride the file's own Channel/Audience unions with the
//     route's resolution as the runtime truth (anything it does not name
//     resolves to ALL), and send-document's type rides the DocumentType
//     union whose switch default is the validator;
//   • the TWO DE-FACTO RE-CASTS dissolve — the `= body as { ... }` blocks
//     the v2.339 census regex (`door.body as X`) never caught now ride
//     their shapes INSIDE the generic (the borrow precedent).
//
// The same round answers THE WAKING PROBE: campaigns' bonusPoints and
// multiplier grow the answering chain — a numeric string becomes the
// number it names (the tiers parseInt(String()) precedent, kept honest)
// and a non-numeric anything answers the route's own 400 instead of a 500
// from the ORM's depths (the chain pins live in
// loyalty-tax-doors-v2341.test.ts, grown honestly).
//
// The styling face is the BROADCAST FORECAST METER: the bulk composer
// draws the reach the desk's own ledger predicts BEFORE the send button
// is pressed — the same predicates the bulk route runs server-side and
// the same Kenyan phone shape its normalisePhone accepts.
//
// The bare class falls 20 → 16. THE OD LAW: every pin reads SOURCE bytes.
// ---------------------------------------------------------------------------

const read = (p: string) => readFileSync(p, 'utf8');

function walkApi(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) out.push(...walkApi(full));
    else if (name.endsWith('.ts')) out.push(full);
  }
  return out;
}

const API_FILES = walkApi('src/app/api');
const BARE = API_FILES.filter((f) => /readJsonBody\(request\)/.test(read(f)));

const FAMILY_DOORS = [
  'src/app/api/messages/route.ts',
  'src/app/api/messaging/bulk/route.ts',
  'src/app/api/whatsapp/send/route.ts',
  'src/app/api/whatsapp/send-document/route.ts',
];

describe('THE BARE CLASS FALLS 20 → 16 (v2.342.0)', () => {
  it('exactly 16 bare doors remain', () => {
    expect(BARE.length).toBe(16);
  });

  it('the four messaging doors left the census', () => {
    for (const door of FAMILY_DOORS) {
      expect(BARE.includes(door)).toBe(false);
    }
  });

  it('the loose-Record era stays over (no regressions)', () => {
    expect(API_FILES.some((f) => read(f).includes('readJsonBody<Record<string, unknown>>'))).toBe(false);
  });

  it('the re-cast class stays gone', () => {
    expect(API_FILES.some((f) => /door\.body as [A-Z]/.test(read(f)))).toBe(false);
  });

  it('the law doc records the fall (history keeps the 20 and the 25, the round note speaks 16)', () => {
    const home = read('src/lib/request-body.ts');
    expect(home.includes('falls to 16 doors')).toBe(true);
    // the v2.341.0 and v2.340.0 history notes keep their own counts
    // (release history never rewrites)
    expect(home.includes('falls to 20 doors')).toBe(true);
    expect(home.includes('falls to 25 doors')).toBe(true);
  });
});

describe('THE FOUR DOORS SPEAK THEIR OWN SHAPES', () => {
  it('messages: the storeId/content pair rides REQUIRED, the resolved columns ride optionals', () => {
    const src = read('src/app/api/messages/route.ts');
    expect(src.includes('storeId: string;')).toBe(true);
    expect(src.includes('content: string;')).toBe(true);
    expect(src.includes('customerId?: string;')).toBe(true);
    expect(src.includes('channel?: string;')).toBe(true);
    expect(src.includes('messageType?: string;')).toBe(true);
    expect(src.includes('subject?: string;')).toBe(true);
    expect(src.includes('phone?: string;')).toBe(true);
    expect(src.includes('createdBy?: string;')).toBe(true);
    expect(/readJsonBody\(request\)/.test(src)).toBe(false);
    expect(src.includes('storeId and content are required.')).toBe(true);
  });

  it('messaging/bulk: the pair rides REQUIRED, channel/audience ride the file’s own unions, the de-facto re-cast dissolves', () => {
    const src = read('src/app/api/messaging/bulk/route.ts');
    expect(src.includes('storeId: string;')).toBe(true);
    expect(src.includes('message: string;')).toBe(true);
    expect(src.includes('channel?: Channel;')).toBe(true);
    expect(src.includes('audience?: Audience;')).toBe(true);
    expect(src.includes('subject?: string;')).toBe(true);
    expect(src.includes('scheduledAt?: string;')).toBe(true);
    // the de-facto re-cast (the `= body as { ... }` block the census regex
    // never caught) is gone — the shape rides INSIDE the generic
    expect(src.includes('} = body as {')).toBe(false);
    // the resolution names the undefined case explicitly (same runtime
    // truth: anything the route does not name resolves to ALL)
    expect(src.includes('audience !== undefined && VALID_AUDIENCES.includes(audience) ? audience : \'ALL\'')).toBe(true);
    expect(/readJsonBody\(request\)/.test(src)).toBe(false);
    expect(src.includes('storeId and message are required.')).toBe(true);
  });

  it('whatsapp/send: the phone/message pair rides REQUIRED, the observability columns ride optionals', () => {
    const src = read('src/app/api/whatsapp/send/route.ts');
    expect(src.includes('phone: string;')).toBe(true);
    expect(src.includes('message: string;')).toBe(true);
    expect(src.includes('storeId?: string;')).toBe(true);
    expect(src.includes('customerId?: string;')).toBe(true);
    expect(src.includes('messageType?: string;')).toBe(true);
    expect(/readJsonBody\(request\)/.test(src)).toBe(false);
    expect(src.includes('phone and message are required.')).toBe(true);
  });

  it('whatsapp/send-document: type rides the DocumentType union (the switch default is the validator), the de-facto re-cast dissolves', () => {
    const src = read('src/app/api/whatsapp/send-document/route.ts');
    expect(src.includes('type: DocumentType;')).toBe(true);
    expect(src.includes('documentId?: string;')).toBe(true);
    expect(src.includes('storeId: string;')).toBe(true);
    expect(src.includes('phone?: string;')).toBe(true);
    expect(src.includes('message?: string;')).toBe(true);
    expect(src.includes('customerId?: string;')).toBe(true);
    expect(src.includes('} = body as {')).toBe(false);
    expect(/readJsonBody\(request\)/.test(src)).toBe(false);
    expect(src.includes('type and storeId are required.')).toBe(true);
  });
});

describe('THE ANSWERING CHAIN (the waking probe’s fix, cross-file)', () => {
  it('the campaigns door widened with the chain (the filings precedent)', () => {
    const src = read('src/app/api/loyalty/campaigns/route.ts');
    expect(src.includes('bonusPoints?: number | string;')).toBe(true);
    expect(src.includes('multiplier?: number | string;')).toBe(true);
  });

  it('the law doc names the waking probe and the de-facto re-casts', () => {
    const home = read('src/lib/request-body.ts');
    expect(home.includes("v2.342.0 — THE MESSAGING FAMILY, the bare class's third pass")).toBe(true);
    expect(home.includes('DE-FACTO RE-CASTS')).toBe(true);
    expect(home.includes('the filings precedent')).toBe(true);
    expect(home.includes('rental family and the catalog-adjacent singles remain')).toBe(true);
  });
});

describe('THE STYLING FACE — the broadcast forecast meter (the eighth desk)', () => {
  const desk = () => read('src/app/(shell)/tabs/messaging-tab.tsx');

  it('the meter draws the reach against the desk’s own ledger (the honest aria voice)', () => {
    const src = desk();
    expect(src.includes('data-testid="broadcast-forecast-meter"')).toBe(true);
    expect(src.includes('role="progressbar"')).toBe(true);
    expect(src.includes('aria-valuemin={0}')).toBe(true);
    expect(src.includes('aria-valuemax={100}')).toBe(true);
    expect(src.includes('aria-valuenow={forecastPct}')).toBe(true);
    expect(src.includes('Broadcast reach: ')).toBe(true);
    expect(src.includes('} candidates (${forecastPct}%) — ${forecastSkipped.toLocaleString()} without a valid phone will be skipped`')).toBe(true);
    expect(src.includes('title={`Broadcast reach: ${forecastReachable.toLocaleString()} of ${forecastCandidates.toLocaleString()} candidates (${forecastPct}%) — ${forecastSkipped.toLocaleString()} without a valid phone will be skipped`}')).toBe(true);
  });

  it('the fill steps through THREE honest voices (emerald / amber / red)', () => {
    const src = desk();
    expect(src.includes("forecastPct >= 90 ? 'bg-emerald-500' : forecastPct >= 60 ? 'bg-amber-500' : 'bg-red-500'")).toBe(true);
    expect(src.includes('style={{ width: `${forecastPct}%` }}')).toBe(true);
  });

  it('the caption speaks the exact counts and the skip reason', () => {
    const src = desk();
    expect(src.includes('} of {forecastCandidates.toLocaleString()} candidates will get it')).toBe(true);
    expect(src.includes('skipped (no valid phone)')).toBe(true);
  });

  it('the helper runs the bulk route’s own predicates and its normalisePhone shape', () => {
    const src = desk();
    expect(src.includes('function forecastBroadcastReach(')).toBe(true);
    expect(src.includes('if (!c.isActive) continue;')).toBe(true);
    expect(src.includes("audience === 'CUSTOMERS_WITH_PHONES' && !c.phone")).toBe(true);
    expect(src.includes("audience === 'DEBTORS' && !(c.currentDebtBalance > 0)")).toBe(true);
    expect(src.includes("audience === 'LOYALTY_MEMBERS' && !(c.loyaltyPoints > 0)")).toBe(true);
    expect(src.includes("(p.startsWith('254') && p.length === 12) || /^\\d{9}$/.test(p)")).toBe(true);
  });

  it('the forecast re-speaks on every render and audience flip, and stays silent on an empty ledger', () => {
    const src = desk();
    expect(src.includes('const broadcastForecast = forecastBroadcastReach(customers, bulkAudience);')).toBe(true);
    expect(src.includes('forecastCandidates > 0 && (')).toBe(true);
  });
});
