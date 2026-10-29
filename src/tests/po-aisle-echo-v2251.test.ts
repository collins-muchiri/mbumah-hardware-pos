// v2.251.0 — the walk's when.
//
//   - THE BRANCH DETAIL WIRE'S BAND: GET /api/purchase-orders/[id] reads
//     the birth's walk aisle's own cadence band (readCadenceLaw +
//     readCategoryBand via the tenant client — the stock-takes' own
//     pattern); walkAisle grows id in the select and band/daysSince in
//     the answer (additive + optional — a failed read is silence).
//   - THE BRANCH BIRTH STRIP'S CHIP: the violet strip wears the cadence
//     chip — bandHouse's byte-identical classes, daysVoice on the title,
//     chipLabel's word (the org drill's po-drill-aisle-band sibling).
//   - THE ORG LIST WIRE'S ROW BANDS: GET /api/org/purchase-orders reads
//     ONE stored law, then ONE band per DISTINCT aisle id in the window
//     (the dedupe keeps the cost at the aisle spread, not the row
//     count); rows' walkAisle grows band + daysSince.
//   - THE LEDGER SPEAKS THE WHEN: the roster chip's title grows the days
//     voice; the CSV grows the aisle_band column (empty on absence).
//
// Every pin reads the SOURCE OF RECORD (source bytes, not memory).

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it, expect } from 'vitest';

const read = (p: string) => readFileSync(join(process.cwd(), p), 'utf8');

const detailWire = read('src/app/api/purchase-orders/[id]/route.ts');
const orgListWire = read('src/app/api/org/purchase-orders/route.ts');
const tab = read('src/app/(shell)/tabs/purchase-orders-tab.tsx');
const ledger = read('src/components/org/po-ledger.tsx');
const apiTypes = read('src/lib/api.ts');

describe('the branch detail wire\u2019s band \u2014 the strip learns WHEN (v2.251.0)', () => {
  it('the band\u2019s one home and the law\u2019s one reader ride the imports', () => {
    expect(detailWire).toContain("import { readCategoryBand, type CadenceBand } from '@/lib/cadence-band';");
    expect(detailWire).toContain("import { readCadenceLaw } from '@/lib/cadence-law';");
  });

  it('the aisle\u2019s id rides the select \u2014 the name alone could never ask the shelf', () => {
    expect(detailWire).toContain('// v2.251.0: the aisle\'s id rides so the wire can read the');
    expect(detailWire).toContain('walkAisle: { select: { id: true, name: true } },');
  });

  it('the read rides the TENANT client \u2014 the stock-takes\u2019 own pattern', () => {
    expect(detailWire).toContain('const walkCategoryId = purchaseOrder.originStockTake?.walkAisle?.id ?? null;');
    expect(detailWire).toContain('const law = await readCadenceLaw(db);');
    expect(detailWire).toContain('const band = await readCategoryBand(db, walkCategoryId, law, new Date());');
    expect(detailWire).toContain('if (band) aisleBand = { band: band.band, daysSince: band.daysSince };');
  });

  it('the band rides additive + optional \u2014 a failed read answers null, never a guessed house', () => {
    expect(detailWire).toContain('band: aisleBand?.band ?? null,');
    expect(detailWire).toContain('daysSince: aisleBand?.daysSince ?? null,');
  });
});

describe('the branch birth strip\u2019s chip \u2014 the four houses, byte-identical (v2.251.0)', () => {
  it('the chip\u2019s one home rides the import', () => {
    expect(tab).toContain("import { bandHouse, chipLabel, daysVoice } from '@/lib/cadence-band';");
  });

  it('the strip wears the chip \u2014 the org drill\u2019s sibling', () => {
    expect(tab).toContain('data-testid="po-detail-aisle-band"');
    expect(tab).toContain('${bandHouse(detail.originStockTake.walkAisle.band).chip}');
    expect(tab).toContain('{chipLabel(detail.originStockTake.walkAisle.band)}');
    expect(tab).toContain("daysVoice({ band: detail.originStockTake.walkAisle.band as 'fresh' | 'stale' | 'beyond' | 'never', daysSince: detail.originStockTake.walkAisle.daysSince })");
  });
});

describe('the org list wire\u2019s row bands \u2014 the dedupe\u2019s honest cost (v2.251.0)', () => {
  it('the band\u2019s one home rides the imports', () => {
    expect(orgListWire).toContain("import { readCategoryBand, type CadenceBand } from '@/lib/cadence-band';");
    expect(orgListWire).toContain("import { readCadenceLaw } from '@/lib/cadence-law';");
  });

  it('the aisle\u2019s id rides the roster\u2019s select', () => {
    expect(orgListWire).toContain('walkAisle: { select: { id: true, name: true } },');
  });

  it('ONE law read, ONE band read per DISTINCT aisle id \u2014 the page\u2019s spread, not the row count', () => {
    expect(orgListWire).toContain('.filter((v): v is string => typeof v === \'string\'),');
    expect(orgListWire).toContain('const aisleBands = new Map<string, { band: CadenceBand; daysSince: number | null }>();');
    expect(orgListWire).toContain('const law = await readCadenceLaw(rawDb);');
    expect(orgListWire).toContain('const band = await readCategoryBand(rawDb, aisleId, law, new Date());');
    expect(orgListWire).toContain('if (band) aisleBands.set(aisleId, { band: band.band, daysSince: band.daysSince });');
  });

  it('the row\u2019s band rides additive + optional \u2014 silence, never a guessed house', () => {
    expect(orgListWire).toContain('band: result.aisleBands.get(po.originStockTake.walkAisle.id)?.band ?? null,');
    expect(orgListWire).toContain('daysSince: result.aisleBands.get(po.originStockTake.walkAisle.id)?.daysSince ?? null,');
  });
});

describe('the ledger speaks the when \u2014 the chip\u2019s title and the file\u2019s column (v2.251.0)', () => {
  it('the days voice rides the import \u2014 the lens\u2019s houses + the label word join the one home (v2.253.0)', () => {
    expect(ledger).toContain("import { bandHouse, chipLabel, daysVoice, type CadenceBand } from '@/lib/cadence-band';");
  });

  it('the roster chip\u2019s title grows the aisle\u2019s days voice \u2014 a row without a band keeps its v2.249 voice', () => {
    expect(ledger).toContain('${po.originStockTake?.walkAisle?.band ? ` — last heard ${daysVoice({ band: po.originStockTake.walkAisle.band as \'fresh\' | \'stale\' | \'beyond\' | \'never\', daysSince: po.originStockTake.walkAisle.daysSince })}` : \'\'}');
  });

  it('the wire type grows the band (additive + optional)', () => {
    expect(ledger).toContain('walkAisle: { name: string | null; band: string | null; daysSince: number | null } | null;');
  });

  it('the CSV grows the aisle_band column \u2014 empty on absence, never a guessed word', () => {
    expect(ledger).toContain("const header = 'po_number,status,supplier,branch,lines,ordered_day,total_kes,birth,aisle,aisle_band';");
    expect(ledger).toContain("r.originStockTake?.walkAisle?.band ?? '',");
  });

  it('the shared type grows the band (optional \u2014 the detail wire speaks it, the list rows keep their shape)', () => {
    expect(apiTypes).toContain('walkAisle: { name: string; band?: string | null; daysSince?: number | null } | null');
  });
});
