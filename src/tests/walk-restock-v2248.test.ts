// v2.248.0 — the door's answer.
//
//   - THE DOORS' LANDING (the bug fix): the workspace page forwards its
//     catch-all segments; the gateway maps the first through
//     tabFromWorkspacePath and sets the tab once at ready. Until this
//     round every branch-workspace door (the walk doors, the recount
//     door) anchored to whatever tab localStorage had persisted —
//     /stores/{slug}/inventory could open the dashboard. An unknown or
//     absent segment leaves the persisted tab standing (the old
//     behavior, byte for byte).
//   - THE RESTOCK'S BIRTH: PurchaseOrder.originStockTakeId (nullable,
//     indexed, SetNull) + the create wire's BIRTH ALLOWLIST (same store +
//     CLOSED, or a 400 rejection — never a silent null), the list + detail
//     wires grow originStockTake (additive + optional), and the faces:
//     the drill's violet restock door, the create dialog's birth strip +
//     pre-pick (shrinkage only, qty = the units the shelf lost, cost =
//     the product's own cost price), the roster's birth chip, the
//     detail's birth strip.
//   - THE LAWS NAMED (ride-along): the census row's title speaks the
//     window-sum law; the walk picker's findings title speaks the latest
//     walk's own truth.
//
// Every pin reads the SOURCE OF RECORD (source bytes, not memory).

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it, expect } from 'vitest';

const read = (p: string) => readFileSync(join(process.cwd(), p), 'utf8');

const schema = read('prisma/schema.prisma');
const poWire = read('src/app/api/purchase-orders/route.ts');
const poDetailWire = read('src/app/api/purchase-orders/[id]/route.ts');
const drill = read('src/components/org/sheet-drill.tsx');
const poTab = read('src/app/(shell)/tabs/purchase-orders-tab.tsx');
const links = read('src/lib/workspace/links.ts');
const gateway = read('src/components/workspace/workspace-gateway.tsx');
const workspacePage = read('src/app/(shell)/stores/[slug]/[[...rest]]/page.tsx');
const map = read('src/components/org/variance-map.tsx');
const panel = read('src/components/inventory/stock-take-panel.tsx');
const apiLib = read('src/lib/api.ts');
const pkg = JSON.parse(read('package.json'));
const version = String(pkg.version);

describe('the doors\u2019 landing \u2014 the bug fix (v2.248.0)', () => {
  it('the workspace page forwards its catch-all segments to the gateway', () => {
    expect(workspacePage).toContain('const { slug, rest } = await params;');
    expect(workspacePage).toContain('<WorkspaceGateway slug={slug.toLowerCase()} rest={rest} />');
  });

  it('the gateway accepts rest and maps the first segment once at ready', () => {
    expect(gateway).toContain('rest?: string[];');
    expect(gateway).toContain('const tab = tabFromWorkspacePath(rest);');
    expect(gateway).toContain('landingSyncedRef.current = true;');
    expect(gateway).toContain('if (tab && useAppStore.getState().activeTab !== tab) {');
  });

  it('the mapper is the AppTab guard list \u2014 unknown or absent segments stand down', () => {
    expect(links).toContain('export function tabFromWorkspacePath(rest: readonly string[] | null | undefined): AppTab | null {');
    expect(links).toContain("'purchase-orders', 'analytics', 'data-exports',");
    expect(links).toContain('return TAB_SEGMENTS.has(segment) ? segment : null;');
  });

  it('every workspace door\u2019s address opens its tab (the segments exist in the mapper\u2019s list)', () => {
    // the walk door points at /inventory — inventory is a mapped segment
    expect(links).toContain("'dashboard', 'pos', 'catalog', 'inventory', 'customers', 'rentals',");
    // the restock door points at /purchase-orders — also mapped
    expect(links).toContain("'conversations', 'purchase-orders', 'analytics', 'data-exports',");
  });
});

describe('the restock\u2019s birth \u2014 the schema (v2.248.0)', () => {
  it('PurchaseOrder grows originStockTakeId (nullable + indexed + SetNull)', () => {
    expect(schema).toContain('originStockTakeId   String?');
    expect(schema).toContain('originStockTake StockTake?      @relation(fields: [originStockTakeId], references: [id], onDelete: SetNull)');
    expect(schema).toContain('@@index([originStockTakeId])');
  });

  it('StockTake grows the read-side restockOrders relation', () => {
    expect(schema).toContain('restockOrders PurchaseOrder[]');
  });
});

describe('the restock\u2019s birth \u2014 the wire (v2.248.0)', () => {
  it('the create wire reads originStockTakeId and allowlists it (same store, CLOSED, or rejected)', () => {
    expect(poWire).toContain('const { storeId, supplierId, items, notes, expectedDate, originStockTakeId } = body as {');
    expect(poWire).toContain('if (!birthSheet || birthSheet.storeId !== storeId) {');
    expect(poWire).toContain("originStockTakeId does not name a count sheet in this store.");
    expect(poWire).toContain("if (birthSheet.status !== 'CLOSED') {");
    expect(poWire).toContain('originStockTakeId names a sheet that is not CLOSED');
    expect(poWire).toContain('originStockTakeId: originStockTakeId != null && originStockTakeId !== \'\' ? originStockTakeId : null,');
  });

  it('the list wire grows originStockTake (additive + optional; the aisle id rides at v2.252.0)', () => {
    expect(poWire).toContain('originStockTake: {\n          select: {\n            id: true,\n            status: true,\n            closedAt: true,\n            // v2.252.0: the aisle\'s id rides so the wire can read each\n            // aisle\'s own band (the census\'s single-aisle read \u2014 the\n            // name alone could never ask the shelf when it was heard).\n            walkAisle: { select: { id: true, name: true } },\n          },\n        },'); // v2.252.0: the pin carries the aisle's own comment bytes
  });

  it('the detail wire grows originStockTake (additive + optional; the aisle id rides at v2.251.0)', () => {
    expect(poDetailWire).toContain('originStockTake: {\n        select: {\n          id: true,\n          status: true,\n          closedAt: true,\n          // v2.251.0: the aisle\'s id rides so the wire can read the\n          // aisle\'s own band (the detail\'s single-aisle read \u2014 the name\n          // alone could never ask the shelf when it was heard).\n          walkAisle: { select: { id: true, name: true } },\n        },\n      },',); // v2.251.0: the pin carries the aisle's own comment bytes
  });

  it('the system log speaks the birth', () => {
    expect(poWire).toContain('originStockTakeId: originStockTakeId ?? null }');
  });

  it('the client type + create call grow the birth (additive + optional; the optional band rides at v2.251.0)', () => {
    expect(apiLib).toContain('originStockTake?: { id: string; status: string; closedAt: string | null; walkAisle: { name: string; band?: string | null; daysSince?: number | null } | null } | null;');
    expect(apiLib).toContain('originStockTakeId?: string;');
  });
});

describe('the restock door \u2014 the drill\u2019s answer (v2.248.0)', () => {
  it('the drill derives the shrinkage lines (the restock\u2019s raw material)', () => {
    expect(drill).toContain('const shrinkageLines = data ? data.lines.filter((l) => l.variance != null && l.variance < 0) : [];');
  });

  it('the violet door mounts only for a CLOSED sheet with shrinkage and a slug', () => {
    expect(drill).toContain("data.status === 'CLOSED' && shrinkageLines.length > 0 && data.store.slug && (() => {");
    expect(drill).toContain('data-testid="sheet-drill-restock-door"');
    expect(drill).toContain('href={`/stores/${data.store.slug}/purchase-orders?restockFrom=${encodeURIComponent(data.id)}`}');
  });

  it('the door wears the violet house and names the units the shelf lost', () => {
    expect(drill).toContain('border-violet-300 bg-violet-50/60');
    expect(drill).toContain('raise the restock for the {num(shrinkageLines.length)} shrinkage line');
    expect(drill).toContain('const shrinkUnits = shrinkageLines.reduce((s, l) => s + Math.abs(l.variance ?? 0), 0);');
  });

  it('the door stays off the paper (a control is a screen thing)', () => {
    expect(drill).toContain('data-testid="sheet-drill-restock-door"\n                    data-sheet-print-off=""');
  });
});

describe('the restock\u2019s landing + pre-pick \u2014 the PO tab (v2.248.0)', () => {
  it('the tab reads ?restockFrom= ONE time at mount, opens the dialog, cleans the address', () => {
    expect(poTab).toContain("new URLSearchParams(window.location.search).get('restockFrom') ?? ''");
    expect(poTab).toContain('setCreateOpen(true);');
    expect(poTab).toContain('window.history.replaceState(null, \'\', window.location.pathname + window.location.hash);');
  });

  it('the create dialog receives the birth and pre-picks the shrinkage lines', () => {
    expect(poTab).toContain('restockSheetId={restockFrom || null}');
    expect(poTab).toContain('originStockTakeId: restockSheetId || undefined,');
    expect(poTab).toContain('const variance = l?.variance == null ? null : Number(l.variance);');
    expect(poTab).toContain('if (variance == null || !Number.isFinite(variance) || variance >= 0) continue;');
    expect(poTab).toContain('const lost = Math.abs(variance);');
    expect(poTab).toContain('name: l.name || \'Unknown product\',');
    expect(poTab).toContain("unitCost: l.bookCost != null ? String(l.bookCost) : '0',");
  });

  it('a refusing or un-CLOSED birth sheet speaks its refusal \u2014 the birth stays off the record', () => {
    expect(poTab).toContain("sheet.status !== 'CLOSED'");
    expect(poTab).toContain('the birth stays off the record.');
  });

  it('the violet birth strip rides the dialog while building', () => {
    expect(poTab).toContain('data-testid="po-restock-provenance"');
    expect(poTab).toContain('born at a count sheet');
    expect(poTab).toContain('restocking what the walk found gone');
  });
});

describe('the birth\u2019s faces \u2014 the roster + the record (v2.248.0)', () => {
  it('the roster wears the violet birth chip beside the PO number', () => {
    expect(poTab).toContain('data-testid="po-row-birth-chip"');
    expect(poTab).toContain('bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300');
    expect(poTab).toContain('BORN AT A COUNT SHEET');
    expect(poTab).toContain('{po.originStockTake && (');
  });

  it('the record wears the birth strip (sheet id, aisle, honest status voice)', () => {
    expect(poTab).toContain('data-testid="po-detail-birth-strip"');
    expect(poTab).toContain('this PO answers count sheet');
    expect(poTab).toContain('{detail.originStockTake.status === \'CLOSED\' ? \' (the books heard it).\' : ` (${detail.originStockTake.status.toLowerCase()}).`}');
  });
});

describe('the laws named \u2014 the ride-along (v2.248.0)', () => {
  it('the census row\u2019s title speaks the window-sum law', () => {
    expect(map).toContain("the verdict sums every closed sheet born here this window (the sheet's own drill speaks the latest walk)");
  });

  it('the walk picker\u2019s findings title speaks the latest walk\u2019s own truth', () => {
    expect(panel).toContain("the latest walk that counted here found this — one walk's own truth (the org census row sums every closed sheet this window)");
  });
});

describe('the release face (v2.248.0)', () => {
  it('package.json speaks 2.248.0', () => {
    expect(version).toBe('2.291.0');
  });

  it('the door\u2019s answer rides the changelog', () => {
    const changelog = read('CHANGELOG.md');
    expect(changelog).toContain("## [2.248.0] The door's answer");
    expect(changelog).toContain('**The restock door** (`sheet-drill.tsx`)');
    expect(changelog).toContain('**The doors\' landing (bug fix)**');
  });

  it('whats-new speaks the door\u2019s answer first', () => {
    const whatsNew = read('src/lib/whats-new.ts');
    expect(whatsNew).toContain("version: '2.277.0',");
    expect(whatsNew).toContain('The door\\u2019s answer');
    expect(whatsNew.indexOf("version: '2.277.0',")).toBeLessThan(whatsNew.indexOf("version: '2.276.0',"));
  });
});
