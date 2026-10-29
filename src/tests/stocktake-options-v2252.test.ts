// v2.252.0 — the walk's options.
//
//   - THE WALK'S OPTIONS LISTBOX: the count-sheet category picker leaves
//     the native <option> behind (the one face the teeth family could
//     never dress) — a Radix listbox whose rows wear the walk's own
//     voices: the aisle's name (the ItemText — typeahead reads it), the
//     band chip (pickBandHouse's four families, byte-identical), the
//     count and the days voice (muted, tabular). THE VOICE-NOT-SORT LAW
//     holds; the door law rides unchanged (a hand's own pick clears the
//     door voice and the door-born flag).
//   - THE SHARED LISTBOX'S DETAIL DOOR: ui/select's SelectItem grows an
//     optional `detail` prop — a sibling row AFTER the ItemText, additive
//     for every existing caller.
//   - THE BRANCH ROSTER'S WHEN: GET /api/purchase-orders reads each
//     sheet-born row's aisle band (ONE law read, ONE band per DISTINCT
//     aisle id — the org wire's dedupe pattern ported, the tenant
//     client), and the roster's birth chip title grows the days voice.
//
// Every pin reads the SOURCE OF RECORD (source bytes, not memory).

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it, expect } from 'vitest';

const read = (p: string) => readFileSync(join(process.cwd(), p), 'utf8');

const panel = read('src/components/inventory/stock-take-panel.tsx');
const selectUi = read('src/components/ui/select.tsx');
const listWire = read('src/app/api/purchase-orders/route.ts');
const tab = read('src/app/(shell)/tabs/purchase-orders-tab.tsx');

describe('the walk\u2019s options \u2014 the picker leaves the native option behind (v2.252.0)', () => {
  it('the listbox rides the shared Radix door \u2014 one home, no second select', () => {
    expect(panel).toContain("import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';");
  });

  it('the picker is a Radix Select now \u2014 the door law rides unchanged', () => {
    expect(panel).toContain('value={createCategoryId || undefined}');
    expect(panel).toContain('onValueChange={(v) => { setCreateCategoryId(v); setDoorVoice(null); setDoorBorn(false); }}');
  });

  it('the trigger keeps its name and composes the picked aisle\u2019s own face', () => {
    expect(panel).toContain('data-testid="stocktake-create-category"');
    expect(panel).toContain('data-testid="stocktake-create-category-chip"');
    expect(panel).toContain('{pickedCategory ? (');
    expect(panel).toContain('<span className="text-muted-foreground">pick a category…</span>');
  });

  it('the option rows wear the walk\u2019s voices \u2014 the chip, the count, the days', () => {
    expect(panel).toContain('detail={');
    expect(panel).toContain('data-testid={`stocktake-option-cadence-${c.id}`}');
    expect(panel).toContain("${pickBandHouse(c.cadence.band).chip}");
    expect(panel).toContain("[`${c.productCount ?? 0} products`, c.cadence ? pickDaysVoice(c.cadence) : ''].filter(Boolean).join(' \u00b7 ')");
  });

  it('the voice-not-sort law holds in the rebuild \u2014 the rows keep the categories\u2019 own order', () => {
    expect(panel).toContain("THE VOICE-NOT-SORT LAW holds: the rows\n                        keep the categories' own sortOrder");
  });
});

describe('the shared listbox\u2019s detail door \u2014 additive, byte-identical for the elders (v2.252.0)', () => {
  it('SelectItem grows the optional detail prop', () => {
    expect(selectUi).toContain('detail?: React.ReactNode;');
    expect(selectUi).toContain('{detail != null && (');
    expect(selectUi).toContain('<span className="ml-auto flex shrink-0 items-center gap-1.5">{detail}</span>');
  });

  it('the detail rides AFTER the ItemText \u2014 the keyboard never lies about what it matched', () => {
    expect(selectUi).toContain('<SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>\n      {detail != null && (');
  });
});

describe('the branch roster\u2019s when \u2014 the deduped read ports to the branch (v2.252.0)', () => {
  it('the band\u2019s one home and the law\u2019s one reader ride the imports', () => {
    expect(listWire).toContain("import { readCategoryBand, type CadenceBand } from '@/lib/cadence-band';");
    expect(listWire).toContain("import { readCadenceLaw } from '@/lib/cadence-law';");
  });

  it('the aisle\u2019s id rides the roster\u2019s select', () => {
    expect(listWire).toContain('walkAisle: { select: { id: true, name: true } },');
  });

  it('ONE law read, ONE band read per DISTINCT aisle id \u2014 via the tenant client', () => {
    expect(listWire).toContain('.filter((v): v is string => typeof v === \'string\'),');
    expect(listWire).toContain('const aisleBands = new Map<string, { band: CadenceBand; daysSince: number | null }>();');
    expect(listWire).toContain('const law = await readCadenceLaw(db);');
    expect(listWire).toContain('const band = await readCategoryBand(db, aisleId, law, new Date());');
    expect(listWire).toContain('if (band) aisleBands.set(aisleId, { band: band.band, daysSince: band.daysSince });');
  });

  it('the row\u2019s band rides additive + optional \u2014 silence, never a guessed house', () => {
    expect(listWire).toContain('band: aisleBands.get(poData.originStockTake.walkAisle.id)?.band ?? null,');
    expect(listWire).toContain('daysSince: aisleBands.get(poData.originStockTake.walkAisle.id)?.daysSince ?? null,');
  });

  it('the roster chip\u2019s title grows the days voice \u2014 a silent row keeps its v2.248 voice', () => {
    expect(tab).toContain('data-testid="po-row-birth-chip"');
    expect(tab).toContain("${po.originStockTake.walkAisle?.band ? ` — last heard ${daysVoice({ band: po.originStockTake.walkAisle.band as 'fresh' | 'stale' | 'beyond' | 'never', daysSince: po.originStockTake.walkAisle.daysSince })}` : ''}");
  });
});
