// v2.250.0 — the branch's gate.
//
//   - THE BRANCH LIST WIRE'S GATE: GET /api/purchase-orders grows the
//     cost gate (inventory.view.cost — the org wires' own law, the
//     products wire's own law): the roster's shillings (subTotal,
//     taxAmount, totalAmount) speak only past the gate — null
//     otherwise — and the envelope grows `costGated` (the org wire's
//     shape; the faces branch on the truth the wire speaks, never on
//     a role name guessed client-side).
//   - THE BRANCH DETAIL WIRE'S GATE: GET /api/purchase-orders/[id]
//     answers the same truth — the header's three money fields, the
//     lines' unitCost/totalCost, the product's book cost — null past
//     the gate, Number() past it (never a Decimal string, never a
//     hidden zero).
//   - THE FACES' MASK VOICES: the KPI's total-value mask, the money
//     sort's stopped affordance, the roster cell's em-dash, the
//     detail's masked InfoItem + the dashed financial absence card +
//     the masked line cells, the create dialog's empty pen and the
//     units-only stock line, the suppliers card's guarded sum.
//   - THE AISLE SPEAKS TWICE: the org detail wire reads the walk
//     aisle's own band (readCategoryBand — the census's single-aisle
//     read, the stored law, one home) and the drill's birth strip
//     wears the chip (bandHouse's byte-identical classes); the
//     ledger's CSV grows the aisle column (zero new fetch).
//
// Every pin reads the SOURCE OF RECORD (source bytes, not memory).

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it, expect } from 'vitest';

const read = (p: string) => readFileSync(join(process.cwd(), p), 'utf8');

const listWire = read('src/app/api/purchase-orders/route.ts');
const detailWire = read('src/app/api/purchase-orders/[id]/route.ts');
const tab = read('src/app/(shell)/tabs/purchase-orders-tab.tsx');
const suppliersTab = read('src/app/(shell)/tabs/suppliers-tab.tsx');
const apiTypes = read('src/lib/api.ts');
const orgDetailWire = read('src/app/api/org/purchase-orders/[id]/route.ts');
const poDrill = read('src/components/org/po-drill.tsx');
const ledger = read('src/components/org/po-ledger.tsx');

const MASK = 'the shillings stay with the cost-holders';

describe('the branch list wire\u2019s gate \u2014 the roster learns the law (v2.250.0)', () => {
  it('the gate reads the same feature permission the org wires and the products wire read', () => {
    expect(listWire).toContain("import { requireStoreAccess, type AuthSession } from '@/lib/auth';");
    // the gate's reader lives with the org wires' own — the build caught
    // the auth module's import address (the E2E-birth law's first cousin).
    expect(listWire).toContain("import { hasFeaturePermission } from '@/lib/permissions';");
    expect(listWire).toContain("const canViewCost = hasFeaturePermission(session.role, 'inventory.view.cost');");
  });

  it('the roster\u2019s shillings speak only past the gate \u2014 null otherwise, never a hidden zero', () => {
    expect(listWire).toContain('subTotal: canViewCost ? Number(poData.subTotal) : null,');
    expect(listWire).toContain('taxAmount: canViewCost ? Number(poData.taxAmount) : null,');
    expect(listWire).toContain('totalAmount: canViewCost ? Number(poData.totalAmount) : null,');
  });

  it('the envelope grows the gate\u2019s own flag \u2014 the org wire\u2019s shape', () => {
    expect(listWire).toContain('costGated: !canViewCost,');
  });
});

describe('the branch detail wire\u2019s gate \u2014 the document answers the same truth (v2.250.0)', () => {
  it('the header\u2019s three money fields speak Number() past the gate, null past it', () => {
    expect(detailWire).toContain("const canViewCost = hasFeaturePermission(session.role, 'inventory.view.cost');");
    expect(detailWire).toContain('subTotal: canViewCost ? Number(purchaseOrder.subTotal) : null,');
    expect(detailWire).toContain('taxAmount: canViewCost ? Number(purchaseOrder.taxAmount) : null,');
    expect(detailWire).toContain('totalAmount: canViewCost ? Number(purchaseOrder.totalAmount) : null,');
    expect(detailWire).toContain('costGated: !canViewCost,');
  });

  it('the lines\u2019 money and the product\u2019s book cost wear the same gate', () => {
    expect(detailWire).toContain('unitCost: canViewCost ? Number(it.unitCost) : null,');
    expect(detailWire).toContain('totalCost: canViewCost ? Number(it.totalCost) : null,');
    expect(detailWire).toContain('costPrice: canViewCost ? Number(it.product.costPrice) : null');
  });
});

describe('the faces\u2019 mask voices \u2014 the honest absence, never a formatted null (v2.250.0)', () => {
  it('the tab reads the truth the wire speaks \u2014 one shared mask voice', () => {
    expect(tab).toContain('const costGated = poData?.costGated === true;');
    expect(tab).toContain(`const COST_MASK = '${MASK}';`);
  });

  it('the KPI\u2019s total value wears the mask \u2014 an absence never sums', () => {
    expect(tab).toContain('.reduce((s, po) => s + (po.totalAmount ?? 0), 0);');
    expect(tab).toContain("value={costGated ? '—' : formatKES(stats.totalValue)}");
    expect(tab).toContain("subValue={costGated ? COST_MASK : 'Excl. cancelled'}");
  });

  it('the money sort stops answering \u2014 the affordance gone, the guard the backstop', () => {
    expect(tab).toContain('cmp = (a.totalAmount ?? 0) - (b.totalAmount ?? 0);');
    expect(tab).toContain('if (field === \'totalAmount\' && costGated) return;');
    expect(tab).toContain("onClick={costGated ? undefined : () => toggleSort('totalAmount')}");
    expect(tab).toContain('{!costGated && (');
  });

  it('the roster\u2019s money cell wears the em-dash with the mask in its title', () => {
    expect(tab).toContain('{po.totalAmount != null ? (');
    expect(tab).toContain(`<span className="text-muted-foreground/60" title={COST_MASK}>—</span>`);
  });

  it('the detail\u2019s InfoItem and the dashed financial absence card speak the mask', () => {
    expect(tab).toContain('value={\n                  detail.totalAmount != null ? (\n                    formatKES(detail.totalAmount)\n                  ) : (');
    expect(tab).toContain('the books hold this order&apos;s shillings — a cost-holder reads the total here.');
    expect(tab).toContain('className="p-3 bg-muted/20 rounded-lg border border-dashed text-sm text-muted-foreground"');
  });

  it('the line\u2019s money cells wear the same em-dash', () => {
    expect(tab).toContain('{item.unitCost != null ? (');
    expect(tab).toContain('{item.totalCost != null ? (');
  });

  it('the create dialog\u2019s pen starts EMPTY past the gate \u2014 never the string "null"', () => {
    expect(tab).toContain("unitCost: product.costPrice != null ? String(product.costPrice) : '',");
    expect(tab).toContain("unitCost: p.costPrice != null ? String(p.costPrice) : '',");
  });

  it('the picker\u2019s stock line speaks units alone when the book cost stayed home', () => {
    expect(tab).toContain('{product.costPrice != null && <> &middot; {formatKES(product.costPrice)}</>}');
  });

  it('the suppliers card\u2019s sum guards the absence \u2014 never a NaN', () => {
    expect(suppliersTab).toContain('.reduce((s, po) => s + (po.totalAmount ?? 0), 0);');
  });

  it('the types grow the gate \u2014 the envelope flag and the nullable shillings', () => {
    expect(apiTypes).toContain('costGated?: boolean;');
    expect(apiTypes).toContain('subTotal: number | null;');
    expect(apiTypes).toContain('totalAmount: number | null;');
    expect(apiTypes).toContain('unitCost: number | null;');
    expect(apiTypes).toContain('totalCost: number | null;');
  });
});

describe('the aisle speaks twice \u2014 the band rides the birth (v2.250.0)', () => {
  it('the org detail wire reads the walk aisle\u2019s own band \u2014 the census\u2019s single-aisle read', () => {
    expect(orgDetailWire).toContain("import { readCategoryBand, type CadenceBand } from '@/lib/cadence-band';");
    expect(orgDetailWire).toContain("import { readCadenceLaw } from '@/lib/cadence-law';");
    expect(orgDetailWire).toContain('walkAisle: { select: { id: true, name: true } },');
    expect(orgDetailWire).toContain('const walkCategoryId = po.originStockTake?.walkAisle?.id ?? null;');
    expect(orgDetailWire).toContain('const law = await readCadenceLaw(rawDb);');
    expect(orgDetailWire).toContain('const band = await readCategoryBand(rawDb, walkCategoryId, law, new Date());');
    expect(orgDetailWire).toContain('if (band) aisleBand = { band: band.band, daysSince: band.daysSince };');
  });

  it('the aisle\u2019s band rides additive + optional \u2014 a failed read is silence, never a guessed house', () => {
    expect(orgDetailWire).toContain('band: aisleBand?.band ?? null,');
    expect(orgDetailWire).toContain('daysSince: aisleBand?.daysSince ?? null,');
  });

  it('the drill\u2019s birth strip wears the chip \u2014 the four houses\u2019 byte-identical classes', () => {
    expect(poDrill).toContain("import { bandHouse, chipLabel, daysVoice } from '@/lib/cadence-band';");
    expect(poDrill).toContain('walkAisle: { name: string | null; band: string | null; daysSince: number | null } | null;');
    expect(poDrill).toContain('data-testid="po-drill-aisle-band"');
    expect(poDrill).toContain('${bandHouse(data.originStockTake.walkAisle.band).chip}');
    expect(poDrill).toContain('{chipLabel(data.originStockTake.walkAisle.band)}');
  });

  it('the ledger\u2019s CSV grows the aisle column \u2014 the wire already carries the name (the band beside it at v2.251.0)', () => {
    expect(ledger).toContain("const header = 'po_number,status,supplier,branch,lines,ordered_day,total_kes,birth,aisle,aisle_band';");
    expect(ledger).toContain("r.originStockTake?.walkAisle?.name ?? '',");
  });
});
