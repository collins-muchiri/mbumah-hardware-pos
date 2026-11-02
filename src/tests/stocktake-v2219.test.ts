// v2.219.0 — the stocktake (the count sheet).
//
//   - THE MODELS: StockTake + StockTakeLine in the schema of record
//     (with the postgres migration file) — the phantom-delegate class
//     stays buried: the wire's delegates EXIST.
//   - THE WIRE: /api/stock-takes (list + create), /[id] (detail),
//     /[id]/count, /[id]/close — all requireStoreAccess-scoped.
//   - THE ONE-OPEN-SHEET LAW: a store with a COUNTING sheet refuses a
//     second (409, the live sheet's id in the body).
//   - THE SNAPSHOT LAW: the lines' snapshotQty freezes INSIDE the
//     transaction — the sheet counts against a moment, never a moving
//     number.
//   - THE COUNT LAWS: zero is a count; negatives are refused; a line is
//     re-countable until close; counts land only while COUNTING.
//   - THE CLOSE LAWS: EVERY line counted or 409 naming the holes; the
//     COUNTING→CLOSED claim atomic inside the transaction; the delta
//     (counted − snapshot) applies against CURRENT stock (sales during
//     the count are preserved); ONE ADJUSTMENT movement per changed
//     line with the SESSION's actor; varianceCost priced on the close
//     day; the response speaks the server's own numbers.
//   - THE COST GATE: variance VALUE rides inventory.view.cost — the
//     same gate the products API applies; units speak to every role.
//   - THE UI: the panel on the branch inventory tab, count-voiced, the
//     close gate naming the holes, the success face reading the wire.
//
// Every pin reads the SOURCE OF RECORD (source bytes, not memory).

import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it, expect } from 'vitest';

const read = (p: string) => readFileSync(join(process.cwd(), p), 'utf8');

const SCHEMA = 'prisma/schema.prisma';
const LIST_ROUTE = 'src/app/api/stock-takes/route.ts';
const DETAIL_ROUTE = 'src/app/api/stock-takes/[id]/route.ts';
const COUNT_ROUTE = 'src/app/api/stock-takes/[id]/count/route.ts';
const CLOSE_ROUTE = 'src/app/api/stock-takes/[id]/close/route.ts';
const PANEL = 'src/components/inventory/stock-take-panel.tsx';
const TAB = 'src/app/(shell)/tabs/inventory-tab.tsx';

const schema = read(SCHEMA);
const listRoute = read(LIST_ROUTE);
const detailRoute = read(DETAIL_ROUTE);
const countRoute = read(COUNT_ROUTE);
const closeRoute = read(CLOSE_ROUTE);
const panel = read(PANEL);
const tab = read(TAB);
const pkg = JSON.parse(read('package.json'));
const changelog = read('CHANGELOG.md');
const feed = read('src/lib/whats-new.ts');

// ── THE MODELS ──────────────────────────────────────────────────────────────

describe('the schema of record speaks the count sheet (v2.219.0)', () => {
  it('StockTake exists with the sheet fields', () => {
    expect(schema.includes('model StockTake {')).toBe(true);
    expect(schema.includes('status      String    @default("COUNTING")')).toBe(true);
    expect(schema.includes('@@map("stock_takes")')).toBe(true);
  });

  it('StockTakeLine freezes the snapshot and carries the floor\u2019s truth', () => {
    expect(schema.includes('model StockTakeLine {')).toBe(true);
    expect(schema.includes('snapshotQty  Decimal')).toBe(true);
    expect(schema.includes('countedQty   Decimal?')).toBe(true);
    expect(schema.includes('variance     Decimal?')).toBe(true);
    expect(schema.includes('varianceCost Decimal?')).toBe(true);
    expect(schema.includes('@@unique([stockTakeId, productId])')).toBe(true);
  });

  it('the migration of record exists (the postgres contract)', () => {
    expect(existsSync(join(process.cwd(), 'prisma/migrations/20261027230000_add_stock_takes/migration.sql'))).toBe(true);
    const migration = read('prisma/migrations/20261027230000_add_stock_takes/migration.sql');
    expect(migration.includes('CREATE TABLE "stock_takes"')).toBe(true);
    expect(migration.includes('CREATE TABLE "stock_take_lines"')).toBe(true);
  });

  it('the back-relations live on Store, Product AND User', () => {
    expect(schema.includes('stockTakes       StockTake[]')).toBe(true);
    expect(schema.includes('stockTakeLines     StockTakeLine[]')).toBe(true);
    expect(schema.includes('stockTakesStarted       StockTake[]         @relation("StockTakeStartedBy")')).toBe(true);
    expect(schema.includes('stockTakesClosed        StockTake[]         @relation("StockTakeClosedBy")')).toBe(true);
  });

  it('statuses are free-text strings — the PO convention (the sqlite law)', () => {
    expect(schema.includes('COUNTING | CLOSED | CANCELLED')).toBe(true);
    expect(schema.includes('enum StockTakeStatus')).toBe(false);
  });
});

// ── THE WIRE ────────────────────────────────────────────────────────────────

describe('the stock-take wire is store-scoped and honest (v2.219.0)', () => {
  it('every route rides requireStoreAccess', () => {
    expect(listRoute.includes('requireStoreAccess(listStockTakesHandler)')).toBe(true);
    expect(listRoute.includes('requireStoreAccess(createStockTakeHandler)')).toBe(true);
    expect(detailRoute.includes('requireStoreAccess(getStockTakeHandler)')).toBe(true);
    expect(countRoute.includes('requireStoreAccess(countLineHandler)')).toBe(true);
    expect(closeRoute.includes('requireStoreAccess(closeStockTakeHandler)')).toBe(true);
  });

  it('the ONE-OPEN-SHEET LAW refuses a second live sheet', () => {
    expect(listRoute.includes("status: 'COUNTING'")).toBe(true);
    expect(listRoute.includes('this branch already has a count sheet open')).toBe(true);
    expect(listRoute.includes('status: 409')).toBe(true);
  });

  it('the snapshot freezes INSIDE the transaction', () => {
    expect(listRoute.includes('db.$transaction(async (tx) => {')).toBe(true);
    expect(listRoute.includes('snapshotQty: toDec(p.quantityInStock),')).toBe(true);
  });

  it('the default population is EVERY active product (the full sheet)', () => {
    // v2.220.0: the where-clause grew the category scope in place — the
    // full-sheet default (storeId + isActive, no explicit list) is the
    // SAME fall-through, now the ternary's final arm.
    expect(listRoute.includes('where: {\n      storeId,\n      isActive: true,')).toBe(true);
    expect(listRoute.includes('? { id: { in: productIds } }')).toBe(true);
  });
});

// ── THE COUNT LAWS ──────────────────────────────────────────────────────────

describe('the floor\u2019s count lands honestly (v2.219.0)', () => {
  it('zero is a count, negatives and typos are refused', () => {
    expect(countRoute.includes('countedQty must be a finite number ≥ 0.')).toBe(true);
    expect(countRoute.includes("if (typeof rawQty !== 'number' || !Number.isFinite(rawQty) || rawQty < 0)")).toBe(true);
  });

  it('the variance is counted − snapshot, written on the line', () => {
    expect(countRoute.includes('const variance = countedQty.minus(line.snapshotQty);')).toBe(true);
    expect(countRoute.includes('data: { countedQty, variance },')).toBe(true);
  });

  it('counts land only while COUNTING', () => {
    expect(countRoute.includes('counts land only while COUNTING')).toBe(true);
    expect(countRoute.includes("sheet.status !== 'COUNTING'")).toBe(true);
  });
});

// ── THE CLOSE LAWS ──────────────────────────────────────────────────────────

describe('the close speaks the variance into the ledger (v2.219.0)', () => {
  it('the close refuses a sheet with holes — and names them', () => {
    expect(closeRoute.includes('count({ where: { stockTakeId: id, countedQty: null } })')).toBe(true);
    expect(closeRoute.includes('line(s) still uncounted — the close refuses a sheet with holes.')).toBe(true);
  });

  it('the COUNTING→CLOSED claim is atomic inside the transaction', () => {
    expect(closeRoute.includes("where: { id, status: 'COUNTING' },")).toBe(true);
    expect(closeRoute.includes("data: { status: 'CLOSED', closedAt: new Date(), closedById: session.userId },")).toBe(true);
    expect(closeRoute.includes('if (claimed.count === 0) {')).toBe(true);
  });

  it('the delta applies against CURRENT stock (sales during the count preserved)', () => {
    expect(closeRoute.includes("data: { quantityInStock: { increment: varianceNum } },")).toBe(true);
  });

  it('ONE ADJUSTMENT movement per changed line, with the SESSION\u2019s actor', () => {
    expect(closeRoute.includes("movementType: 'ADJUSTMENT',")).toBe(true);
    expect(closeRoute.includes('performedBy: session.userId,')).toBe(true);
    expect(closeRoute.includes('referenceId: id,')).toBe(true);
  });

  it('an exact count re-anchors nothing (the honest zero is an absence)', () => {
    expect(closeRoute.includes('if (varianceNum === 0) {')).toBe(true);
  });

  it('varianceCost is priced on the close day, stored per line', () => {
    expect(closeRoute.includes('const varianceCost = round2(varianceNum * Number(line.product.costPrice ?? 0));')).toBe(true);
    expect(closeRoute.includes('data: { varianceCost: toDec(varianceCost) },')).toBe(true);
  });

  it('the response speaks the server\u2019s own numbers', () => {
    expect(closeRoute.includes('appliedCount: result.appliedCount,')).toBe(true);
    expect(closeRoute.includes('varianceCostTotal: result.varianceCostTotal,')).toBe(true);
  });
});

// ── THE COST GATE ───────────────────────────────────────────────────────────

describe('the shillings speak only past the cost gate (v2.219.0)', () => {
  it('the detail route gates the value on inventory.view.cost', () => {
    expect(detailRoute.includes("hasFeaturePermission(session.role, 'inventory.view.cost')")).toBe(true);
    expect(detailRoute.includes('varianceValueEstimate: canViewCost ? Math.round(varianceValueEstimate * 100) / 100 : null,')).toBe(true);
    expect(detailRoute.includes('varianceCost: canViewCost && l.varianceCost != null ? Number(l.varianceCost) : null,')).toBe(true);
  });

  it('the units speak to every role (the gate rides the VALUE only)', () => {
    expect(detailRoute.includes('varianceUnits: Math.round(varianceUnits * 100) / 100,')).toBe(true);
  });
});

// ── THE UI ──────────────────────────────────────────────────────────────────

describe('the branch inventory tab wears the count sheet (v2.219.0)', () => {
  it('the panel mounts with the store + the cost gate', () => {
    expect(tab.includes('<StockTakePanel storeId={currentStoreId} canViewCost={canViewCost} />')).toBe(true);
    expect(tab.includes("import { StockTakePanel } from '@/components/inventory/stock-take-panel';")).toBe(true);
  });

  it('the panel owns its dark half and the muted family (the contrast law)', () => {
    expect(panel.includes('dark:border-slate-700')).toBe(true);
    expect(panel.includes('text-slate-500 dark:text-slate-400')).toBe(true);
  });

  it('the chips pass the 3:1 bar (700-family on light, never 600)', () => {
    expect(panel.includes('bg-emerald-700 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-800')).toBe(true);
    expect(panel.includes('bg-red-50 text-red-700 ring-red-200')).toBe(true);
    expect(panel.includes('bg-emerald-50 text-emerald-700 ring-emerald-200')).toBe(true);
  });

  it('the create flow discloses the snapshot law', () => {
    expect(panel.includes('Open the sheet — freeze every active product')).toBe(true);
    expect(panel.includes('the snapshot freezes inside one transaction')).toBe(true);
  });

  it('the close gate names the holes and the success face reads the wire', () => {
    expect(panel.includes('Close refused — ${detail.summary.uncountedLines} line')).toBe(true);
    expect(panel.includes('data-testid="stocktake-close-success"')).toBe(true);
    expect(panel.includes('data-testid="stocktake-close-summary"')).toBe(true);
  });

  it('the honest states each own a voice', () => {
    expect(panel.includes('data-testid="stocktake-empty"')).toBe(true);
    expect(panel.includes('data-testid="stocktake-loading"')).toBe(true);
    expect(panel.includes('data-testid="stocktake-error"')).toBe(true);
    expect(panel.includes('no count sheets yet — the floor has not spoken')).toBe(true);
  });

  it('the count inputs ride per-line testids (the zero law in the label)', () => {
    expect(panel.includes('data-testid={`stocktake-count-input-${line.sku}`}')).toBe(true);
    expect(panel.includes('data-testid={`stocktake-record-${line.sku}`}')).toBe(true);
    expect(panel.includes('data-testid={`stocktake-variance-${line.sku}`}')).toBe(true);
    expect(panel.includes('a count is a number ≥ 0 — zero is a finding, a negative is a lie')).toBe(true);
  });

  it('the close invalidates the tab\u2019s own wires (the books moved)', () => {
    expect(panel.includes("queryClient.invalidateQueries({ queryKey: ['products', storeId] });")).toBe(true);
    expect(panel.includes("queryClient.invalidateQueries({ queryKey: ['stock-movements', storeId] });")).toBe(true);
  });
});

// ── THE VERSION METADATA ────────────────────────────────────────────────────

describe('the round of record (v2.219.0)', () => {
  it('package.json leads 2.219.0 (all three slots)', () => {
    expect(pkg.version).toBe('2.340.0');
    expect(pkg.mbumah.releaseVersion).toBe('2.340.0');
    expect(pkg.mbumah.baseVersion).toBe('2.340.0');
  });

  it('VERSION speaks the same truth', () => {
    expect(read('VERSION').trim()).toBe('2.340.0');
  });

  it('the changelog of record speaks the round', () => {
    expect(changelog.includes('## [2.219.0] The stocktake')).toBe(true);
    expect(changelog.indexOf('## [2.219.0]')).toBeLessThan(changelog.indexOf('## [2.218.0]'));
  });

  it('the changelog feed grows the entry at the head', () => {
    expect(feed.includes("version: '2.219.0',")).toBe(true);
    expect(feed.includes("title: 'The stocktake',")).toBe(true);
    expect(feed.indexOf("version: '2.219.0',")).toBeLessThan(feed.indexOf("version: '2.218.0',"));
  });

  it('the verify gate is wired', () => {
    expect(pkg.scripts['verify:v2-219-0']).toBe('node scripts/verify-v2-219-0.mjs');
  });
});
