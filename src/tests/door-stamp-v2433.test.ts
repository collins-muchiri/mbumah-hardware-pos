import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { orderBlockRodeStamp, readBlockSends, orderBlockSendWord } from '@/lib/order-handoff';

// v2.433.0 THE DESK READS THE DOOR'S MEMORY — the arc's fourteenth word.
// The carriage strip answers the door's memory: when the pocket's walk
// named a maker whose block THIS SESSION already rode, the strip wears
// the door's own stamp — "rode at 09:12" — the two sides comparing
// clocks (the door speaks "sent at", the desk answers "rode at": one
// clock law, two verbs). The stamp is a FACT: it never gates, never
// dresses the pen, and a session that never sent reads the honest
// absence.

const libSrc = readFileSync(join(process.cwd(), 'src/lib/order-handoff.ts'), 'utf8');
const poTabSrc = readFileSync(join(process.cwd(), 'src/app/(shell)/tabs/purchase-orders-tab.tsx'), 'utf8');

// Local-clock builders: the word rides the VIEWER's clock, so the pins
// build the timestamp from local Date parts — the suite stays green in
// every timezone CI can wear.
const localStamp = (h: number, m: number): number => new Date(2026, 10, 7, h, m).getTime();

describe('orderBlockRodeStamp — the desk\u2019s answer, pure (v2.433.0)', () => {
  it('the honest absences — no send, a broken stamp, never a word', () => {
    expect(orderBlockRodeStamp(null)).toBe(null);
    expect(orderBlockRodeStamp(undefined)).toBe(null);
    expect(orderBlockRodeStamp(Number.NaN)).toBe(null);
    expect(orderBlockRodeStamp(0)).toBe(null);
    expect(orderBlockRodeStamp(-1)).toBe(null);
    expect(orderBlockRodeStamp(Number.POSITIVE_INFINITY)).toBe(null);
  });

  it('the desk speaks its own verb — "rode at", one clock law with the door', () => {
    expect(orderBlockRodeStamp(localStamp(9, 12))).toBe('rode at 09:12');
    expect(orderBlockRodeStamp(localStamp(14, 5))).toBe('rode at 14:05');
    expect(orderBlockRodeStamp(localStamp(0, 0))).toBe('rode at 00:00');
    expect(orderBlockRodeStamp(localStamp(23, 59))).toBe('rode at 23:59');
    // the two verbs are DIFFERENT words on the same clock law — the
    // door's "sent at" and the desk's "rode at" can never be confused
    expect(orderBlockSendWord(localStamp(9, 12))).toBe('sent at 09:12');
    expect(orderBlockSendWord(localStamp(9, 12))).not.toBe(orderBlockRodeStamp(localStamp(9, 12)));
  });

  it('the lib\u2019s one home — the stamp lives in order-handoff, beside the door\u2019s word', () => {
    expect(libSrc).toContain('v2.433.0 THE DESK READS THE DOOR\'S MEMORY');
    expect(libSrc).toContain('export function orderBlockRodeStamp(');
    expect(libSrc).toContain('return `rode at ${hh}:${mm}`;');
    // the stamp is a FACT, never a gate — the lib says so
    expect(libSrc).toContain('never dresses the pen');
  });

  it('outside a window the memory honestly holds nothing — the guards are runtime', () => {
    expect(readBlockSends()).toEqual({});
  });
});

describe('the faces (v2.433.0) \u2014 the desk answers, pinned to the source', () => {
  it('the tab reads the ONE home \u2014 the widened import', () => {
    expect(poTabSrc).toContain(
      "import { consumeOrderHandoff, mapOrderHandoffToPoItems, orderBlockRodeStamp, orderHandoffPocketEcho, orderHandoffSupplier, readBlockSends, type OrderHandoffPayload, type OrderHandoffPoItem } from '@/lib/order-handoff';"
    );
  });

  it('THE DERIVED GATE — no state, no effect; the read rides orderStrip\u2019s own null-at-hydration', () => {
    expect(poTabSrc).toContain('const doorSentAt = orderStrip?.pocketSupplier ? readBlockSends()[orderStrip.pocketSupplier] : undefined;');
    expect(poTabSrc).toContain('const doorStamp = orderBlockRodeStamp(doorSentAt);');
    expect(poTabSrc).toContain('the read never meets SSR');
    expect(poTabSrc).toContain('no state, no effect');
  });

  it('the stamp wears under the echo\u2019s quote — the walk\u2019s own glyph, the quiet italic', () => {
    expect(poTabSrc).toContain('data-testid="po-order-handoff-door-stamp"');
    expect(poTabSrc).toContain('<Footprints className="h-2.5 w-2.5 shrink-0" aria-hidden="true" />');
    expect(poTabSrc).toContain('className="mt-1 flex items-center gap-1 pl-2 text-[10px] italic tabular-nums text-amber-700/80 dark:text-amber-300/80"');
    expect(poTabSrc).toContain('this block {doorStamp}');
  });

  it('the aria carries the door\u2019s segment', () => {
    expect(poTabSrc).toContain("doorStamp ? `the door's memory — this block ${doorStamp}` : null,");
  });

  it('THE HONEST ABSENCE — no pocket, no memory, no stamp; the face is gated on doorStamp', () => {
    expect(poTabSrc).toContain('{doorStamp && (');
    expect(orderBlockRodeStamp(undefined)).toBe(null);
  });

  it('THE WORDS-ONLY LAW STANDS — the stamp never dresses the pen (the v2.422 derivation byte-kept)', () => {
    expect(poTabSrc).toContain("const supplierId = actorSupplierId !== '' ? actorSupplierId : (prePickSupplier?.id ?? '');");
    expect(poTabSrc).toContain('const prePickVoice = actorSupplierId === \'\' ? prePickSupplier : null;');
    // the stamp's own gate reads the memory, never writes the select
    expect(poTabSrc).not.toContain('setActorSupplierId(door');
  });

  it('the v2.431 echo line stands — the stamp rides UNDER the quotation, never instead of it', () => {
    expect(poTabSrc).toContain('data-testid="po-order-handoff-pocket-echo-line"');
    expect(poTabSrc).toContain('className="mt-1 border-l-2 border-amber-300 pl-2 font-medium dark:border-amber-500/50"');
    const echoAt = poTabSrc.indexOf('po-order-handoff-pocket-echo-line');
    const stampAt = poTabSrc.indexOf('po-order-handoff-door-stamp');
    expect(stampAt).toBeGreaterThan(echoAt);
  });
});
