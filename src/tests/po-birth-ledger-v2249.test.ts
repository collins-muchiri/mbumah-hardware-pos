// v2.249.0 — the birth's ledger.
//
//   - THE ORG WIRE'S BIRTH: GET /api/org/purchase-orders grows
//     originStockTakeId + originStockTake (additive + optional — the
//     SAME shape the branch wire speaks), the BIRTH RUNGS
//     (births: { sheet, hand } — two indexed counts over the
//     rung-LESS narrowing, so a pressed rung keeps its sibling's real
//     number), and the `origin` param (sheet | hand; anything else is
//     a REFUSED filter — the same 400 law as status).
//   - THE ORG DETAIL WIRE'S BIRTH: GET /api/org/purchase-orders/[id]
//     grows originStockTake (additive + optional) — the drill names
//     the sheet.
//   - THE LEDGER'S BIRTH RUNGS + CHIPS: the violet rung row, the row
//     birth chip, the roster CSV's birth column.
//   - THE ORG DRILL'S BIRTH STRIP: the violet strip (id, aisle,
//     status voice) + the gated restock shillings.
//   - THE RESTOCK DOOR'S SHILLINGS: past the cost gate AND only when
//     EVERY shrinkage line carries its varianceCost — a partial sum
//     would understate and lie.
//
// Every pin reads the SOURCE OF RECORD (source bytes, not memory).

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it, expect } from 'vitest';

const read = (p: string) => readFileSync(join(process.cwd(), p), 'utf8');

const orgWire = read('src/app/api/org/purchase-orders/route.ts');
const orgDetailWire = read('src/app/api/org/purchase-orders/[id]/route.ts');
const ledger = read('src/components/org/po-ledger.tsx');
const poDrill = read('src/components/org/po-drill.tsx');
const drill = read('src/components/org/sheet-drill.tsx');
const pkg = JSON.parse(read('package.json'));
const version = String(pkg.version);

describe('the org wire\u2019s birth \u2014 the roster rides the violet (v2.249.0)', () => {
  it('the rows grow originStockTakeId + originStockTake (additive, the branch wire\u2019s own shape; the aisle\u2019s band rides the row at v2.251.0)', () => {
    expect(orgWire).toContain('originStockTakeId: true,\n          originStockTake: {');
    expect(orgWire).toContain('originStockTakeId: po.originStockTakeId,');
    expect(orgWire).toContain('closedAt: po.originStockTake.closedAt?.toISOString() ?? null,');
    expect(orgWire).toContain('walkAisle: po.originStockTake.walkAisle\n                ? {\n                    name: po.originStockTake.walkAisle.name,\n                    // v2.251.0: the aisle\'s band (additive + optional \u2014 a\n                    // failed read answers null and the row keeps its\n                    // silence, the honest absence).\n                    band: result.aisleBands.get(po.originStockTake.walkAisle.id)?.band ?? null,\n                    daysSince: result.aisleBands.get(po.originStockTake.walkAisle.id)?.daysSince ?? null,\n                  }\n                : null,',); // v2.251.0: the pin carries the band's own comment bytes
  });

  it('a hand-raised PO answers null \u2014 the silent absence, never a fabricated strip', () => {
    expect(orgWire).toContain(': null,\n        // The shillings speak only past the cost gate');
  });

  it('the birth rungs answer two indexed counts over the rung-LESS narrowing', () => {
    expect(orgWire).toContain('const birthWhere: { status?: string; storeId?: string } = {};');
    expect(orgWire).toContain("rawDb.purchaseOrder.count({ where: { ...birthWhere, originStockTakeId: { not: null } } })");
    expect(orgWire).toContain('rawDb.purchaseOrder.count({ where: { ...birthWhere, originStockTakeId: null } })');
    expect(orgWire).toContain('births: { sheet: bornAtSheets, hand: handRaised }');
    expect(orgWire).toContain('births: result.births,');
  });

  it('the origin param narrows the rows \u2014 sheet to the born, hand to the pens', () => {
    expect(orgWire).toContain("const originParam = url.searchParams.get('origin') ?? '';");
    expect(orgWire).toContain("if (originParam === 'sheet') where.originStockTakeId = { not: null };");
    expect(orgWire).toContain("if (originParam === 'hand') where.originStockTakeId = null;");
  });

  it('an unknown rung is a REFUSED filter \u2014 never a silent ALL', () => {
    expect(orgWire).toContain("if (originParam !== '' && originParam !== 'sheet' && originParam !== 'hand') {");
    expect(orgWire).toContain("'unknown purchase-order birth filter.'");
  });
});

describe('the org detail wire\u2019s birth (v2.249.0)', () => {
  it('originStockTake rides the read (additive + optional, the same shape)', () => {
    expect(orgDetailWire).toContain("closedAt: true,\n            // v2.250.0: the aisle's id rides so the wire can read the\n            // aisle's own band (the census's single-aisle read \u2014 the\n            // name alone could never ask the shelf when it was heard).\n            walkAisle: { select: { id: true, name: true } },"); // v2.250.0: the aisle grew its id — the band's read asks the shelf, not the name
    expect(orgDetailWire).toContain('originStockTake: po.originStockTake');
    expect(orgDetailWire).toContain('closedAt: po.originStockTake.closedAt?.toISOString() ?? null,');
  });
});

describe('the ledger\u2019s birth rungs + chips (v2.249.0)', () => {
  it('the wire type grows the births + the rows\u2019 birth (additive; the aisle\u2019s band rides the type at v2.251.0)', () => {
    expect(ledger).toContain('births: { sheet: number; hand: number };');
    expect(ledger).toContain('originStockTakeId: string | null;');
    expect(ledger).toContain('originStockTake: {\n        id: string;\n        status: string;\n        closedAt: string | null;\n        // v2.251.0: the aisle\'s band rides the roster (additive +\n        // optional \u2014 the wire\'s deduped read; a failed read answers\n        // null and the row keeps its silence, the honest absence).\n        walkAisle: { name: string | null; band: string | null; daysSince: number | null } | null;\n      } | null;');
  });

  it('the birth rung rides the query key and the fetch \u2014 a rung change IS a refetch', () => {
    expect(ledger).toContain("const [originFilter, setOriginFilter] = useState<'ALL' | 'sheet' | 'hand'>('ALL');");
    expect(ledger).toContain("queryKey: ['org-po-ledger', statusFilter, branchId, originFilter],");
    expect(ledger).toContain("if (originFilter !== 'ALL') params.set('origin', originFilter);");
  });

  it('the birth rung row speaks both rungs with their real numbers', () => {
    expect(ledger).toContain('data-testid="po-ledger-birth-row"');
    expect(ledger).toContain('data-testid="po-ledger-origin-sheet"');
    expect(ledger).toContain('data-testid="po-ledger-origin-hand"');
    expect(ledger).toContain('born at sheets <span className="opacity-70">{num(data.births.sheet)}</span>');
    expect(ledger).toContain('hand-raised <span className="opacity-70">{num(data.births.hand)}</span>');
  });

  it('the rungs toggle (a pressed rung stands down) and keep their sibling\u2019s truth', () => {
    expect(ledger).toContain("onClick={() => setOriginFilter(originFilter === 'sheet' ? 'ALL' : 'sheet')}");
    expect(ledger).toContain("onClick={() => setOriginFilter(originFilter === 'hand' ? 'ALL' : 'hand')}");
  });

  it('the sheet rung wears the violet house \u2014 the birth chip\u2019s own family', () => {
    expect(ledger).toContain('bg-violet-600 text-white ring-violet-600 dark:bg-violet-300 dark:text-violet-950 dark:ring-violet-300');
    expect(ledger).toContain('bg-white text-violet-700 ring-violet-200 hover:bg-violet-50 dark:bg-slate-900 dark:text-violet-300 dark:ring-violet-500/40 dark:hover:bg-violet-500/20');
    expect(ledger).toContain('focus:ring-2 focus:ring-violet-500/40');
  });

  it('the row wears the violet birth chip; a hand-raised PO renders the silent absence', () => {
    expect(ledger).toContain('data-testid="po-ledger-row-birth-chip"');
    expect(ledger).toContain('{po.originStockTakeId != null && (');
    expect(ledger).toContain('bg-violet-50 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-violet-700 ring-1 ring-violet-200 dark:bg-violet-500/10 dark:text-violet-300 dark:ring-violet-500/30');
  });

  it('the roster\u2019s copy grows the birth column \u2014 a file speaks the word for every row (the band column rides at v2.251.0)', () => {
    expect(ledger).toContain("const header = 'po_number,status,supplier,branch,lines,ordered_day,total_kes,birth,aisle,aisle_band';");
    expect(ledger).toContain("r.originStockTakeId != null ? 'sheet' : 'hand',");
  });
});

describe('the org drill\u2019s birth strip (v2.249.0)', () => {
  it('the wire type grows the birth (additive + optional)', () => {
    expect(poDrill).toContain('walkAisle: { name: string | null; band: string | null; daysSince: number | null } | null;'); // v2.250.0: the aisle grew its band — the strip's chip wears the census's houses
  });

  it('the violet strip names the sheet, its aisle, and the honest status voice', () => {
    expect(poDrill).toContain('data-testid="po-drill-birth-strip"');
    expect(poDrill).toContain('{data.originStockTake && (');
    expect(poDrill).toContain('this PO answers count sheet <span className="tabular-nums">{data.originStockTake.id}</span>');
    expect(poDrill).toContain("{data.originStockTake.status === 'CLOSED' ? ' (the books heard it).' : ` (${data.originStockTake.status.toLowerCase()}).`}");
  });

  it('past the cost gate, the strip speaks the restock\u2019s own shillings', () => {
    expect(poDrill).toContain('{data.summary.totalAmount != null ? (');
    expect(poDrill).toContain('The restock carries <span className="tabular-nums">{fmtKes(data.summary.totalAmount)}</span>.');
  });

  it('the strip wears the violet family with dark halves from birth', () => {
    expect(poDrill).toContain('border-violet-200 bg-violet-50/60 px-3 py-2 text-[11px] text-violet-800 dark:border-violet-500/40 dark:bg-violet-500/10 dark:text-violet-200');
  });
});

describe('the restock door\u2019s shillings (v2.249.0)', () => {
  it('the door prices the hole only past the cost gate AND only when every line\u2019s cost has spoken', () => {
    expect(drill).toContain('const shrinkValueSpeaks = !costGated && shrinkageLines.every((l) => l.varianceCost != null);');
    expect(drill).toContain('? Math.abs(shrinkageLines.reduce((s, l) => s + (l.varianceCost ?? 0), 0))');
  });

  it('the shillings ride the door\u2019s own voice in tabular-nums', () => {
    expect(drill).toContain('at book cost</>');
    expect(drill).toContain('<span className="tabular-nums">{fmtKes(shrinkValue)}</span>');
  });
});

describe('the release face (v2.249.0)', () => {
  it('package.json speaks 2.249.0', () => {
    expect(version).toBe('2.293.0');
  });

  it('the birth\u2019s ledger rides the changelog', () => {
    const changelog = read('CHANGELOG.md');
    expect(changelog).toContain("## [2.249.0] The birth's ledger");
    expect(changelog).toContain('**The org wire\'s birth** (`GET /api/org/purchase-orders`)');
    expect(changelog).toContain('**The restock door\'s shillings** (`sheet-drill.tsx`)');
  });

  it('whats-new speaks the birth\u2019s ledger first', () => {
    const whatsNew = read('src/lib/whats-new.ts');
    expect(whatsNew).toContain("version: '2.277.0',");
    expect(whatsNew).toContain('The birth\\u2019s ledger');
    expect(whatsNew.indexOf("version: '2.277.0',")).toBeLessThan(whatsNew.indexOf("version: '2.276.0',"));
  });
});
