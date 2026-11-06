// THE SUPPLIER RIDES SUITE (v2.422.0) — THE ARC'S THIRD WORD: the walk's
// order arrives supplier-aware.
//
//   - the fold (buildOrderHandoff): every carried line now names the
//     maker the shelf gave it (supplierName — null when the shelf named
//     none); the older envelopes (v2.416–v2.421) carried no field and
//     the shape law still reads them (tolerance by law, not by luck).
//   - the census (orderHandoffSupplier): EVERY line names the SAME
//     maker, or the census says nothing — the honest absence, never a
//     majority's guess.
//   - the pre-pick (mapOrderHandoffToPoItems): the shelf's own link is
//     the only voice — when every mapped line's product names the same
//     supplier (id AND name, the wire's nested face), the map hands the
//     dialog the pre-pick; the envelope's names never feed it (a stale
//     pocket must not name a live order).
//   - the faces: the send toast/title speak the census when it fires;
//     the PO dialog dresses the select (among its OWN active list only)
//     and the carriage strip wears the sky chip — which retires the
//     moment the actor names a different supplier.
//
// Every pin reads the SOURCE OF RECORD (source bytes, not memory) — the
// house rule since the verify scripts were born.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it, expect } from 'vitest';

import {
  buildOrderHandoff,
  parseOrderHandoff,
  mapOrderHandoffToPoItems,
  orderHandoffSupplier,
} from '@/lib/order-handoff';

const read = (p: string) => readFileSync(join(process.cwd(), p), 'utf8');

const TAB = 'src/app/(shell)/tabs/inventory-tab.tsx';
const PO_TAB = 'src/app/(shell)/tabs/purchase-orders-tab.tsx';
const LIB = 'src/lib/order-handoff.ts';
const tabSrc = read(TAB);
const poTabSrc = read(PO_TAB);
const libSrc = read(LIB);

/** The lint law's helper (the six-warnings lesson): read a nullable the
 *  tests honestly proved non-null — a throw, never a `!`. */
function must<T>(value: T | null | undefined, what: string): T {
  if (value == null) throw new Error(`expected ${what} to be present`);
  return value;
}

const AT = new Date(2026, 10, 6, 22, 40);

describe('buildOrderHandoff (v2.422.0) — the fold carries the maker', () => {
  const ROWS = [
    { sku: 'CEM-50', name: 'Bamburi Cement 50kg', onHand: 200, reorderLevel: 300, supplierName: 'Bamburi Cement Ltd' },
    { sku: 'NAIL-2I', name: 'Nails 2 inch', onHand: 40, reorderLevel: 100, supplierName: null },
  ];

  it('named rows fold their supplier name into the envelope, line by line', () => {
    const payload = buildOrderHandoff('store_juja_main', 'Juja Main', AT, ROWS);
    const cem = must(payload.items.find((i) => i.sku === 'CEM-50'), 'the cement line');
    expect(cem.supplierName).toBe('Bamburi Cement Ltd');
  });

  it('the honest absence rides as null (never a made-up maker)', () => {
    const payload = buildOrderHandoff('store_juja_main', 'Juja Main', AT, ROWS);
    const nail = must(payload.items.find((i) => i.sku === 'NAIL-2I'), 'the nail line');
    expect(nail.supplierName).toBe(null);
  });

  it('the envelope\u2019s own JSON carries the names (the pocket stores bytes, not wishes)', () => {
    const payload = buildOrderHandoff('store_juja_main', 'Juja Main', AT, ROWS);
    const raw = JSON.stringify(payload);
    expect(raw).toContain('"supplierName":"Bamburi Cement Ltd"');
    expect(raw).toContain('"supplierName":null');
  });

  it('the fold\u2019s older laws hold untouched: the gap, the counts', () => {
    const payload = buildOrderHandoff('store_juja_main', 'Juja Main', AT, ROWS);
    expect(payload.items.map((i) => i.quantity)).toEqual([100, 60]);
    expect(payload.lines).toBe(2);
    expect(payload.units).toBe(160);
  });
});

describe('parseOrderHandoff (v2.422.0) — the shape law\u2019s tolerance', () => {
  it('an OLD envelope (no supplierName field at all) still parses — v2.416\u2013v2.421 mail is read', () => {
    const raw = JSON.stringify({
      storeId: 'store_juja_main', storeName: 'Juja Main', carriedAt: AT.toISOString(),
      lines: 1, units: 5,
      items: [{ sku: 'CEM-50', name: 'Bamburi Cement 50kg', quantity: 5, onHand: 200, reorderLevel: 300 }],
    });
    const parsed = must(parseOrderHandoff(raw, 'store_juja_main'), 'the old envelope');
    expect(parsed.items.length).toBe(1);
    expect(parsed.items[0].supplierName).toBeUndefined();
  });

  it('an envelope whose lines carry null supplier names parses (the honest absence)', () => {
    const raw = JSON.stringify({
      storeId: 'store_juja_main', storeName: 'Juja Main', carriedAt: AT.toISOString(),
      lines: 1, units: 5,
      items: [{ sku: 'CEM-50', name: 'Bamburi Cement 50kg', quantity: 5, onHand: 200, reorderLevel: 300, supplierName: null }],
    });
    const parsed = must(parseOrderHandoff(raw, 'store_juja_main'), 'the null-named envelope');
    expect(parsed.items[0].supplierName).toBe(null);
  });

  it('a supplier name that is neither string nor null refuses the WHOLE envelope (a half-honest line is a lie)', () => {
    const raw = JSON.stringify({
      storeId: 'store_juja_main', storeName: 'Juja Main', carriedAt: AT.toISOString(),
      lines: 1, units: 5,
      items: [{ sku: 'CEM-50', name: 'Bamburi Cement 50kg', quantity: 5, onHand: 200, reorderLevel: 300, supplierName: 42 }],
    });
    expect(parseOrderHandoff(raw, 'store_juja_main')).toBe(null);
  });
});

describe('orderHandoffSupplier (v2.422.0) — the census', () => {
  it('every line naming the same maker speaks that name', () => {
    expect(orderHandoffSupplier([
      { supplierName: 'Bamburi Cement Ltd' },
      { supplierName: 'Bamburi Cement Ltd' },
    ])).toBe('Bamburi Cement Ltd');
  });

  it('the census trims (a padded name is the same maker, not a second one)', () => {
    expect(orderHandoffSupplier([
      { supplierName: '  Bamburi Cement Ltd ' },
      { supplierName: 'Bamburi Cement Ltd' },
    ])).toBe('Bamburi Cement Ltd');
  });

  it('two makers answer null (the actor\u2019s call, never a majority\u2019s guess)', () => {
    expect(orderHandoffSupplier([
      { supplierName: 'Bamburi Cement Ltd' },
      { supplierName: 'Mabati Rolling Mills' },
    ])).toBe(null);
  });

  it('a maker and an absence answer null (a partly-named order names nobody)', () => {
    expect(orderHandoffSupplier([
      { supplierName: 'Bamburi Cement Ltd' },
      { supplierName: null },
    ])).toBe(null);
  });

  it('all-absent and empty worlds answer null (the quiet face)', () => {
    expect(orderHandoffSupplier([{ supplierName: null }, { supplierName: null }])).toBe(null);
    expect(orderHandoffSupplier([])).toBe(null);
  });

  it('whitespace names are not makers (the trim law, the census\u2019s own face)', () => {
    expect(orderHandoffSupplier([{ supplierName: '   ' }])).toBe(null);
  });
});

describe('mapOrderHandoffToPoItems (v2.422.0) — the pre-pick, the shelf\u2019s own truth', () => {
  const AT2 = new Date(2026, 10, 6, 22, 40);
  const envelopeFor = (items: Array<{ sku: string; supplierName?: string | null }>) => buildOrderHandoff(
    'store_juja_main',
    'Juja Main',
    AT2,
    items.map((i) => ({ sku: i.sku, name: `Item ${i.sku}`, onHand: 0, reorderLevel: 5, supplierName: i.supplierName ?? null })),
  );

  const SHELL = {
    cem: { id: 'prod_cem', sku: 'CEM-50', costPrice: 800 as number | null, quantityInStock: 200, supplier: { id: 'sup_bamburi', name: 'Bamburi Cement Ltd' } },
    nail: { id: 'prod_nail', sku: 'NAIL-2I', costPrice: 120 as number | null, quantityInStock: 40, supplier: { id: 'sup_mabati', name: 'Mabati Rolling Mills' } },
    hinge: { id: 'prod_hinge', sku: 'HINGE-3I', costPrice: 30 as number | null, quantityInStock: 0, supplier: { id: 'sup_bamburi', name: 'Bamburi Cement Ltd' } },
    bare: { id: 'prod_bare', sku: 'BARE-1', costPrice: 10 as number | null, quantityInStock: 1, supplier: null },
  };

  it('every mapped line naming the same maker hands the dialog the pre-pick', () => {
    const payload = envelopeFor([{ sku: 'CEM-50' }, { sku: 'HINGE-3I' }]);
    const { prePick } = mapOrderHandoffToPoItems(payload, [SHELL.cem, SHELL.hinge]);
    expect(prePick).not.toBe(null);
    expect(must(prePick, 'prePick').supplierId).toBe('sup_bamburi');
    expect(must(prePick, 'prePick').supplierName).toBe('Bamburi Cement Ltd');
  });

  it('THE SHELF\u2019S TRUTH WINS: the envelope\u2019s names never feed the pre-pick', () => {
    // The envelope was folded when the shelf said something else; the
    // pre-pick reads the CURRENT wire — a stale pocket must not name a
    // live order.
    const payload = envelopeFor([{ sku: 'CEM-50' }]);
    const shelfRenamed = [{ ...SHELL.cem, supplier: { id: 'sup_bamburi', name: 'Bamburi Cement Ltd (Juja)' } }];
    const { prePick } = mapOrderHandoffToPoItems(payload, shelfRenamed);
    expect(must(prePick, 'prePick').supplierName).toBe('Bamburi Cement Ltd (Juja)');
  });

  it('two makers dissolve the pre-pick for the whole order', () => {
    const payload = envelopeFor([{ sku: 'CEM-50' }, { sku: 'NAIL-2I' }]);
    const { prePick } = mapOrderHandoffToPoItems(payload, [SHELL.cem, SHELL.nail]);
    expect(prePick).toBe(null);
  });

  it('a maker and an absence dissolve the pre-pick (a partly-named order names nobody)', () => {
    const payload = envelopeFor([{ sku: 'CEM-50' }, { sku: 'BARE-1' }]);
    const { prePick } = mapOrderHandoffToPoItems(payload, [SHELL.cem, SHELL.bare]);
    expect(prePick).toBe(null);
  });

  it('a disagreement AFTER an agreement still dissolves (the ledger reads every line, not the first two)', () => {
    const payload = envelopeFor([{ sku: 'CEM-50' }, { sku: 'NAIL-2I' }, { sku: 'HINGE-3I' }]);
    const { prePick } = mapOrderHandoffToPoItems(payload, [SHELL.cem, SHELL.nail, SHELL.hinge]);
    expect(prePick).toBe(null);
  });

  it('all-absence and empty orders answer null (the quiet face)', () => {
    const payload = envelopeFor([{ sku: 'BARE-1' }]);
    expect(mapOrderHandoffToPoItems(payload, [SHELL.bare]).prePick).toBe(null);
    const ghost = envelopeFor([{ sku: 'GHOST-9' }]);
    const { items, prePick } = mapOrderHandoffToPoItems(ghost, [SHELL.cem]);
    expect(items.length).toBe(0);
    expect(prePick).toBe(null);
  });

  it('a one-line order speaks its maker (the singular honest)', () => {
    const payload = envelopeFor([{ sku: 'CEM-50' }]);
    const { prePick } = mapOrderHandoffToPoItems(payload, [SHELL.cem]);
    expect(must(prePick, 'prePick').supplierId).toBe('sup_bamburi');
  });
});

describe('the faces (v2.422.0) — source pins on the record', () => {
  it('the send face reads the census and speaks it in the toast, the title, and the aria', () => {
    expect(tabSrc).toContain('orderHandoffSupplier(rows)');
    expect(tabSrc).toContain('carried${supplierName ? ` for ${supplierName}` : \'\'}');
    expect(tabSrc).toContain("supplierName}'s own supplier pen already dressed");
    expect(tabSrc).toContain('${supplierName ? `, for ${supplierName}` : \'\'}) to the purchase order desk');
  });

  it('the PO dialog dresses the pen ONLY when its own active list carries the pre-pick', () => {
    expect(poTabSrc).toContain('s.id === orderPrePick.supplierId && s.isActive');
    expect(poTabSrc).toContain('return hit ? { id: hit.id, name: hit.name } : null;');
  });

  it('THE DERIVED DRESS: the pen reads the actor\u2019s word first, else the pre-pick (no effect, no unstable dep)', () => {
    expect(poTabSrc).toContain("const supplierId = actorSupplierId !== '' ? actorSupplierId : (prePickSupplier?.id ?? '');");
    expect(poTabSrc).toContain('onValueChange={setActorSupplierId}');
  });

  it('the voice retires by the same derivation (it speaks only while the pen wears the pre-pick)', () => {
    expect(poTabSrc).toContain("const prePickVoice = actorSupplierId === '' ? prePickSupplier : null;");
  });

  it('the carriage strip wears the sky chip (testid-ed) and speaks the name', () => {
    expect(poTabSrc).toContain('data-testid="po-order-handoff-supplier"');
    expect(poTabSrc).toContain('the order names {prePickVoice.name} and the supplier pen wears it');
    expect(poTabSrc).toContain('the supplier is your call; every row stays yours to edit.');
  });

  it('the reset law clears the actor\u2019s pen and the pre-pick (a manual reopen never inherits a birth)', () => {
    expect(poTabSrc).toContain("setActorSupplierId('')");
    expect(poTabSrc).toContain('setOrderPrePick(null)');
  });

  it('the map call destructure carries the pre-pick (one home, no parallel truth)', () => {
    expect(poTabSrc).toContain('const { items, droppedSkus, prePick } = mapOrderHandoffToPoItems(orderBirth, products);');
  });

  it('the lib\u2019s own law pins: the fold maps the name, the shape law tolerates the old mail', () => {
    expect(libSrc).toContain('supplierName: row.supplierName ?? null,');
    expect(libSrc).toContain('v.supplierName === undefined ||');
    expect(libSrc).toContain('typeof v.supplierName === \'string\'');
  });
});
