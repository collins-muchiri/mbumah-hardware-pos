import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { orderBlockSendWord, readBlockSends, recordBlockSend } from '@/lib/order-handoff';

// v2.432.0 THE DOOR'S MEMORY — the block menu remembers which maker's
// block was last sent this session: "sent at 09:12" under the block's
// census — the pocket's memory speaking on the SENDING side. The word is
// the lib's pure formatter (orderBlockSendWord: nulls refuse, the
// viewer's clock zero-pads), the record rides the TAB SESSION
// (sessionStorage, the pocket's own house — it survives the walk to the
// desk and the walk back, and a closed tab honestly forgets), the LAST
// send wins (the record overwrites), and the word is a FACT never a gate
// (the block stays pressable).

const libSrc = readFileSync(join(process.cwd(), 'src/lib/order-handoff.ts'), 'utf8');
const tabSrc = readFileSync(join(process.cwd(), 'src/app/(shell)/tabs/inventory-tab.tsx'), 'utf8');

// Local-clock builders: the word rides the VIEWER's clock, so the pins
// build the timestamp from local Date parts — the suite stays green in
// every timezone CI can wear.
const localStamp = (h: number, m: number): number => new Date(2026, 10, 7, h, m).getTime();

describe('orderBlockSendWord — the door\u2019s word, pure (v2.432.0)', () => {
  it('the honest absences — no send, a broken stamp, never a word', () => {
    expect(orderBlockSendWord(null)).toBe(null);
    expect(orderBlockSendWord(undefined)).toBe(null);
    expect(orderBlockSendWord(Number.NaN)).toBe(null);
    expect(orderBlockSendWord(0)).toBe(null);
    expect(orderBlockSendWord(-1)).toBe(null);
    expect(orderBlockSendWord(Number.POSITIVE_INFINITY)).toBe(null);
  });

  it('the word wears the viewer\u2019s own clock — zero-padded, local hours and minutes', () => {
    expect(orderBlockSendWord(localStamp(9, 12))).toBe('sent at 09:12');
    expect(orderBlockSendWord(localStamp(14, 5))).toBe('sent at 14:05');
    expect(orderBlockSendWord(localStamp(0, 0))).toBe('sent at 00:00');
    expect(orderBlockSendWord(localStamp(23, 59))).toBe('sent at 23:59');
  });

  it('the word never invents seconds or a day — the census\u2019s own brevity', () => {
    const word = orderBlockSendWord(localStamp(9, 12)) ?? '';
    expect(word.startsWith('sent at ')).toBe(true);
    expect((word.match(/:/g) ?? []).length).toBe(1);
    expect(word.endsWith('09:12')).toBe(true);
  });

  it('the lib\u2019s one home — the word lives in order-handoff, beside the pocket\u2019s echo', () => {
    expect(libSrc).toContain("v2.432.0 THE DOOR'S MEMORY");
    expect(libSrc).toContain('export function orderBlockSendWord(');
    expect(libSrc).toContain('return `sent at ${hh}:${mm}`;');
    // the memory never gates: the lib speaks a FACT, the door stays open
    // the comment breaks the sentence across lines — pin the fragments
    expect(libSrc).toContain('a FACT');
    expect(libSrc).toContain('never a gate');
    // the memory's one home: key, reader, writer — and the reader is
    // defensive (bad bytes read the honest absence, never a throw)
    expect(libSrc).toContain("export const ORDER_BLOCK_SENDS_KEY = 'mbumah.order-block-sends.v1';");
    expect(libSrc).toContain('export function readBlockSends(): Record<string, number> {');
    expect(libSrc).toContain('export function recordBlockSend(maker: string, at: number): void {');
    expect(libSrc).toContain('const name = maker.trim();');
  });
});

describe('the faces (v2.432.0) \u2014 the door remembers, pinned to the source', () => {
  it('the tab reads the ONE home \u2014 the widened import', () => {
    expect(tabSrc).toContain(
      "import { buildOrderHandoff, orderBlockSendWord, orderHandoffSupplier, orderSupplierBlocks, readBlockSends, recordBlockSend, writeOrderHandoff, type OrderSupplierBlock } from '@/lib/order-handoff';"
    );
  });

  it('the TAB SESSION\u2019s own record — sessionStorage, the pocket\u2019s own house', () => {
    expect(tabSrc).toContain("THE DOOR'S MEMORY");
    expect(tabSrc).toContain('recordBlockSend(block.name, Date.now());');
    // no component state for the memory: the read happens at render
    expect(tabSrc).toContain('const sentAt = readBlockSends()[block.name];');
    expect(tabSrc).not.toContain('blockSends');
  });

  it('THE SEND\u2019S OWN WRITE — the record overwrites (the LAST send wins)', () => {
    expect(libSrc).toContain('const next = { ...readBlockSends(), [name]: at };');
    // the write rides the door's own fold, after the pocket's write and
    // before the walk (the whole-order Send's own walk sits earlier in
    // the file — the door's is the FIRST walk after the memory write)
    const writeAt = tabSrc.indexOf('recordBlockSend(block.name, Date.now());');
    const pocketAt = tabSrc.indexOf('writeOrderHandoff(payload);');
    const walkAt = tabSrc.indexOf("setActiveTab('purchase-orders');", writeAt);
    expect(writeAt).toBeGreaterThan(pocketAt);
    expect(walkAt).toBeGreaterThan(writeAt);
  });

  it('the word wears under the census \u2014 the two-row item, the clock\u2019s own lane', () => {
    expect(tabSrc).toContain('data-testid="inv-order-supplier-block-sent"');
    expect(tabSrc).toContain('orderBlockSendWord(sentAt) !== null');
    expect(tabSrc).toContain('<Clock className="h-2.5 w-2.5 shrink-0" aria-hidden="true" />');
    expect(tabSrc).toContain('className="flex items-center gap-1 pl-5 text-[10px] text-muted-foreground/80"');
    expect(tabSrc).toContain('<span className="tabular-nums">{orderBlockSendWord(sentAt)}</span>');
  });

  it('THE CENSUS\u2019S BYTES STAND \u2014 the v2.430 item row is byte-kept inside the two-row item', () => {
    expect(tabSrc).toContain("{block.lines} line{block.lines === 1 ? '' : 's'} · {block.units} unit{block.units === 1 ? '' : 's'}");
    expect(tabSrc).toContain('className="flex min-w-0 items-center gap-2"');
    expect(tabSrc).toContain('data-testid="inv-order-supplier-block"');
  });

  it('the word is a fact, never a gate \u2014 the fold\u2019s bytes stay the v2.430 law', () => {
    expect(tabSrc).toContain('buildOrderHandoff(currentStoreId, orderStoreName, new Date(), block.rows)');
    expect(tabSrc).toContain('writeOrderHandoff(payload);');
    expect(tabSrc).toContain("setActiveTab('purchase-orders');");
    expect(tabSrc).toContain('carried for ${block.name}.`);');
  });

  it('the honest absence at rest \u2014 the record starts empty, the word never pre-exists', () => {
    // the face renders the word only when the lib speaks one: no send,
    // no word — the menu that greets a fresh session never claims a send
    expect(orderBlockSendWord(undefined)).toBe(null);
    expect(tabSrc).toContain('{orderBlockSendWord(sentAt)}');
  });

  it('the record\u2019s own laws — the defensive read, the trim, the window guard', () => {
    // sessionStorage is a browser fact; the suite pins the LAWS by byte
    // and exercises the pure formatter — the storage legs live in the
    // burst (the door's own proof, runtime)
    expect(libSrc).toContain('if (!name || !Number.isFinite(at) || at <= 0) return;');
    expect(libSrc).toContain('const raw = window.sessionStorage.getItem(ORDER_BLOCK_SENDS_KEY);');
    expect(libSrc).toContain('if (typeof window === \'undefined\') return {};');
    // OUTSIDE a window the memory honestly holds nothing — the guards are
    // the suite's own runtime proof (vitest's node world has no window):
    expect(readBlockSends()).toEqual({});
    expect(() => recordBlockSend('   ', Date.now())).not.toThrow();
    expect(() => recordBlockSend('A maker', Number.NaN)).not.toThrow();
    expect(readBlockSends()).toEqual({});
  });
});
