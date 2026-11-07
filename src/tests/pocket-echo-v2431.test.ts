// THE POCKET'S ECHO SUITE (v2.431.0) — THE ARC'S TWELFTH WORD: the desk
// answers the walk's receipt.
//
//   - the echo's gate (orderHandoffPocketEcho): the pocket's own census
//     speaks when the envelope's every line named ONE maker at fold time
//     AND the pre-pick does not already speak that name (agreement is no
//     news — a chip that repeats the live voice is a decoration); a null,
//     an empty, or a whitespace pocket reads the null — never a fake
//     echo. THE WORDS-ONLY LAW: the echo is a gate over words, never a
//     decision — it has no power over the pen (the v2.422 law).
//   - the census gains its third reader: the banner's send toast, the
//     walk's own faces, and now the desk's echo — the pocket's names may
//     speak as words on the reading desk.
//   - the faces: the digest carries the pocket census (the echo survives
//     the one-way consumption, exactly as the counts do), the derived
//     gate (no effect, no state — the Task 117 law's shape), the amber
//     chip (the walk's own house, never the pre-pick's sky), the echo
//     line's quote-border (the walk's words are a quotation), and the
//     aria's honest segment.
//
// Every pin reads the SOURCE OF RECORD (source bytes, not memory) —
// the house rule since the verify scripts were born.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it, expect } from 'vitest';

import { orderHandoffPocketEcho, orderHandoffSupplier } from '@/lib/order-handoff';

const read = (p: string) => readFileSync(join(process.cwd(), p), 'utf8');

const LIB = 'src/lib/order-handoff.ts';
const PO_TAB = 'src/app/(shell)/tabs/purchase-orders-tab.tsx';
const libSrc = read(LIB);
const poTabSrc = read(PO_TAB);

describe('the pocket echo\u2019s gate (v2.431.0) \u2014 agreement is no news', () => {
  it('a pocket word and a silent pre-pick \u2014 the echo carries the walk\u2019s name', () => {
    expect(orderHandoffPocketEcho('Bamburi Cement Ltd', null)).toBe('Bamburi Cement Ltd');
    expect(orderHandoffPocketEcho('Bamburi Cement Ltd', undefined)).toBe('Bamburi Cement Ltd');
  });

  it('agreement is no news \u2014 the pre-pick speaking the same name quiets the echo', () => {
    expect(orderHandoffPocketEcho('Bamburi Cement Ltd', 'Bamburi Cement Ltd')).toBe(null);
  });

  it('a drift world \u2014 the pre-pick naming another maker does not silence the pocket', () => {
    expect(orderHandoffPocketEcho('Bamburi Cement Ltd', 'Mabati Rolling Mills')).toBe('Bamburi Cement Ltd');
  });

  it('the honest absences \u2014 no pocket word, no echo (never a fake echo)', () => {
    expect(orderHandoffPocketEcho(null, null)).toBe(null);
    expect(orderHandoffPocketEcho(null, 'Bamburi Cement Ltd')).toBe(null);
    expect(orderHandoffPocketEcho('', 'Bamburi Cement Ltd')).toBe(null);
    expect(orderHandoffPocketEcho('   ', 'Bamburi Cement Ltd')).toBe(null);
  });

  it('the echo\u2019s input is the census\u2019s own read \u2014 one law, three readers', () => {
    const items = [
      { supplierName: 'Bamburi Cement Ltd' },
      { supplierName: '  Bamburi Cement Ltd ' },
    ];
    expect(orderHandoffSupplier(items)).toBe('Bamburi Cement Ltd');
    expect(orderHandoffPocketEcho(orderHandoffSupplier(items), null)).toBe('Bamburi Cement Ltd');
    const mixed = [{ supplierName: 'Bamburi Cement Ltd' }, { supplierName: null }];
    expect(orderHandoffSupplier(mixed)).toBe(null);
    expect(orderHandoffPocketEcho(orderHandoffSupplier(mixed), null)).toBe(null);
  });
});

describe('the pocket echo\u2019s home (v2.431.0) \u2014 source of record', () => {
  it('the lib speaks the words-only law and the third reader', () => {
    expect(libSrc).toContain('export function orderHandoffPocketEcho(');
    expect(libSrc).toContain('if (prePickSupplierName?.trim() === name) return null;');
    expect(libSrc).toContain('const name = pocketSupplier?.trim() ?? \'\';');
    expect(libSrc).toContain('THE WORDS-ONLY');
    expect(libSrc).toContain("One law, three readers: the banner's send toast, the walk's own");
    expect(libSrc).toContain("faces, and (v2.431.0) the desk's echo");
  });

  it('the digest carries the pocket census \u2014 the echo survives the one-way consumption', () => {
    expect(poTabSrc).toContain('dropped: string[]; pocketSupplier: string | null } | null>(null);');
    expect(poTabSrc).toContain('setOrderStrip({ lines: orderBirth.lines, units: orderBirth.units, dropped: droppedSkus, pocketSupplier: orderHandoffSupplier(orderBirth.items) });');
    expect(poTabSrc).toContain('dropped: orderBirth.items.map((i) => i.sku), pocketSupplier: orderHandoffSupplier(orderBirth.items) });');
  });

  it('the derived gate \u2014 no effect, no state, the lib\u2019s own voice', () => {
    expect(poTabSrc).toContain('const pocketEcho = orderHandoffPocketEcho(orderStrip?.pocketSupplier ?? null, prePickVoice?.name ?? null);');
    expect(poTabSrc).toContain("import { consumeOrderHandoff, mapOrderHandoffToPoItems, orderHandoffPocketEcho, orderHandoffSupplier, type OrderHandoffPayload, type OrderHandoffPoItem } from '@/lib/order-handoff';");
  });

  it('the chip is the walk\u2019s own amber house \u2014 never the pre-pick\u2019s sky', () => {
    expect(poTabSrc).toContain('data-testid="po-order-handoff-pocket-echo"');
    expect(poTabSrc).toContain('the walk named {pocketEcho}');
    expect(poTabSrc).toContain("the walk's pocket carried this order for ${pocketEcho} — the pen below never wears the pocket's word");
    expect(poTabSrc).toContain('bg-amber-100 px-2 py-px text-[10px] font-medium normal-case text-amber-800 dark:bg-amber-500/20 dark:text-amber-200');
  });

  it('the echo line wears the quote-border \u2014 the walk\u2019s words are a quotation', () => {
    expect(poTabSrc).toContain('data-testid="po-order-handoff-pocket-echo-line"');
    expect(poTabSrc).toContain('border-l-2 border-amber-300 pl-2 font-medium dark:border-amber-500/50');
    expect(poTabSrc).toContain('the pen below never wears the pocket&apos;s word \u2014 the shelf&apos;s link or your own call dresses it.');
  });

  it('the aria speaks the walk\u2019s name only when the echo lives', () => {
    expect(poTabSrc).toContain('pocketEcho ? `the walk named ${pocketEcho}` : null,');
  });

  it('THE WORDS-ONLY LAW holds at the pen \u2014 the v2.422 derivation stands untouched', () => {
    expect(poTabSrc).toContain("const supplierId = actorSupplierId !== '' ? actorSupplierId : (prePickSupplier?.id ?? '');");
    expect(poTabSrc).toContain('onValueChange={setActorSupplierId}');
    expect(poTabSrc).toContain("const prePickVoice = actorSupplierId === '' ? prePickSupplier : null;");
    expect(poTabSrc).toContain('return hit ? { id: hit.id, name: hit.name } : null;');
  });

  it('the census\u2019s pinned faces stand \u2014 the echo added nothing to the pre-pick\u2019s voice', () => {
    expect(poTabSrc).toContain('the order names {prePickVoice.name} and the supplier pen wears it');
    expect(poTabSrc).toContain('the supplier is your call; every row stays yours to edit.');
    expect(poTabSrc).toContain('const { items, droppedSkus, prePick } = mapOrderHandoffToPoItems(orderBirth, products);');
  });
});
