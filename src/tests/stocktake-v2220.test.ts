// v2.220.0 — the variance map (the stocktake's org face, phase 2).
//
//   - THE ORG BLOCK: `stockTakes` in /api/org/kpi-summary — live sheets
//     org-wide, the 12 most recent of any status, and the rolling 30-day
//     ledger impact read across EVERY closed sheet in the window.
//   - THE COST LAW ON THE ORG WIRE: variance UNITS speak to every org
//     role; the SHILLINGS (varianceCost, varianceCostTotal) arrive only
//     past inventory.view.cost — null otherwise, the honest absence.
//   - THE CANCEL LAWS: only COUNTING cancels; the COUNTING→CANCELLED
//     claim atomic inside the transaction; NO stock moves, NO movements;
//     the reason (≤300) rides the sheet's notes; the canceller becomes
//     the closer-of-record.
//   - THE FIFTH CONSUMER: the variance map's indicative strip — the same
//     zero-fetch observer the debt/revenue/desk/restock strips speak,
//     same silence law (KES pivot → silent; missing rate → silent; zero
//     ledger impact → silent).
//   - THE PICKER: the sheet's population wears a scope — full (the
//     honest default) or ONE category, resolved SERVER-SIDE; the picker
//     speaks the real row count from the categories wire.
//   - THE MAP: mounted on the console under the KPI row, zero new
//     fetches, honest step-asides for the stale answer and the empty org.
//
// Every pin reads the SOURCE OF RECORD (source bytes, not memory).

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it, expect } from 'vitest';

const read = (p: string) => readFileSync(join(process.cwd(), p), 'utf8');

const KPI_ROUTE = 'src/app/api/org/kpi-summary/route.ts';
const CANCEL_ROUTE = 'src/app/api/stock-takes/[id]/cancel/route.ts';
const LIST_ROUTE = 'src/app/api/stock-takes/route.ts';
const MAP = 'src/components/org/variance-map.tsx';
const PANEL = 'src/components/inventory/stock-take-panel.tsx';
const PAGE = 'src/app/(shell)/console/page.tsx';
const PRIMITIVES = 'src/components/org/primitives.tsx';

const kpiRoute = read(KPI_ROUTE);
const cancelRoute = read(CANCEL_ROUTE);
const listRoute = read(LIST_ROUTE);
const map = read(MAP);
const panel = read(PANEL);
const page = read(PAGE);
const primitives = read(PRIMITIVES);
const pkg = JSON.parse(read('package.json'));
const version = read('VERSION').trim();
const changelog = read('CHANGELOG.md');
const feed = read('src/lib/whats-new.ts');

// ── THE ORG BLOCK ───────────────────────────────────────────────────────────

describe('the kpi-summary wire speaks the count sheets (v2.220.0)', () => {
  it('the stockTakes block exists and is additive', () => {
    expect(kpiRoute.includes('const stockTakes = {')).toBe(true);
    expect(kpiRoute.includes('stockTakes,')).toBe(true);
    expect(kpiRoute.includes('openCount: openSheetRows.length,')).toBe(true);
    expect(kpiRoute.includes('window30d: {')).toBe(true);
  });

  it('the cost gate rides the SESSION (inventory.view.cost)', () => {
    expect(kpiRoute.includes("hasFeaturePermission(session.role, 'inventory.view.cost')")).toBe(true);
    expect(kpiRoute.includes('varianceCostTotal: canViewCost ? windowCost : null,')).toBe(true);
    expect(kpiRoute.includes('varianceCost: canViewCost && s.status === \'CLOSED\' && v ? v.cost : null,')).toBe(true);
  });

  it('the window figure reads EVERY closed sheet in 30 days (aggregate, not the roster)', () => {
    expect(kpiRoute.includes("where: { status: 'CLOSED', closedAt: { gte: windowStart } }")).toBe(true);
    expect(kpiRoute.includes('stockTakeLine.aggregate')).toBe(true);
    expect(kpiRoute.includes('_sum: { variance: true, varianceCost: true },')).toBe(true);
  });

  it('the roster carries the 12 most recent sheets of any status', () => {
    expect(kpiRoute.includes('orderBy: { startedAt: \'desc\' },')).toBe(true);
    expect(kpiRoute.includes('take: 12,')).toBe(true);
    expect(kpiRoute.includes('closedBy: { select: { name: true } },')).toBe(true);
  });

  it('the type of record carries the optional block (an older cached answer steps aside)', () => {
    expect(primitives.includes('stockTakes?: {')).toBe(true);
    expect(primitives.includes('window30d: { windowDays?: number; closedCount: number; varianceUnits: number; varianceCostTotal: number | null };')).toBe(true);
  });
});

// ── THE CANCEL LAWS ─────────────────────────────────────────────────────────

describe('the cancel route is the sheet\u2019s honest way out (v2.220.0)', () => {
  it('the route exists, store-scoped and boundary-wrapped', () => {
    expect(cancelRoute.includes('withErrorBoundary(requireStoreAccess(cancelStockTakeHandler), \'STOCK_TAKE_CANCEL\')')).toBe(true);
  });

  it('only a COUNTING sheet cancels (409 names the dead status)', () => {
    expect(cancelRoute.includes("if (sheet.status !== 'COUNTING') {")).toBe(true);
    expect(cancelRoute.includes("error: `this sheet is ${sheet.status} — only a COUNTING sheet cancels.`")).toBe(true);
  });

  it('the claim COUNTING→CANCELLED is atomic inside the transaction', () => {
    expect(cancelRoute.includes('db.$transaction')).toBe(true);
    expect(cancelRoute.includes("where: { id, status: 'COUNTING' },")).toBe(true);
    expect(cancelRoute.includes("status: 'CANCELLED', closedAt: new Date(), closedById: session.userId")).toBe(true);
    expect(cancelRoute.includes('if (claimed.count === 0) {')).toBe(true);
  });

  it('no stock moves, no movements — the void is explicit', () => {
    expect(cancelRoute.includes('stockMovement.create')).toBe(false);
    expect(cancelRoute.includes('quantityInStock')).toBe(false);
    expect(cancelRoute.includes('no stock moved')).toBe(true);
  });

  it('the reason rides the sheet\u2019s notes (≤300 in, ≤500 kept)', () => {
    expect(cancelRoute.includes('body.reason.trim().slice(0, 300)')).toBe(true);
    expect(cancelRoute.includes('`cancelled: ${reason}`')).toBe(true);
    expect(cancelRoute.includes('.slice(0, 500)')).toBe(true);
  });

  it('the zero law is wired as a test-facing constant phrase', () => {
    expect(cancelRoute.includes('a cancelled sheet is a void')).toBe(false); // that phrasing lives in the UI
    expect(cancelRoute.includes('the log line says exactly that')).toBe(true);
  });
});

// ── THE FIFTH CONSUMER ──────────────────────────────────────────────────────

describe('the variance map wears the strip family\u2019s fifth consumer (v2.220.0)', () => {
  it('the map exists as a component and mounts on the console', () => {
    expect(map.includes('export function VarianceMap')).toBe(true);
    expect(page.includes('import { VarianceMap } from \'@/components/org/variance-map\';')).toBe(true);
    expect(page.includes("canGovern={session?.role === 'SUPER_ADMIN' || session?.role === 'STORE_OWNER'}")).toBe(true);
    expect(page.includes('<SectionErrorBoundary sectionName="Variance map">')).toBe(true);
  });

  it('the strip is the family\u2019s observer — it NEVER fetches', () => {
    expect(map.includes("queryKey: ADMIN_CURRENCY_RATES_QUERY_KEY,")).toBe(true);
    expect(map.includes('enabled: false,')).toBe(true);
    expect(map.includes('the variance map never fetches — it observes the shared currency cache')).toBe(true);
    expect(map.includes("const { currency: activeCurrency } = useCurrency();")).toBe(true);
  });

  it('the silence law: KES pivot, missing rate, unknown code, AND the zero ledger impact', () => {
    expect(map.includes("if (typeof windowCost !== 'number') return null; // the cost gate stayed shut — nothing to convert")).toBe(true);
    expect(map.includes('if (windowCost === 0) return null; // a zero ledger impact converts to a zero — the strip stays silent')).toBe(true);
    expect(map.includes("if (activeCurrency === 'KES') return null;")).toBe(true);
    expect(map.includes('if (!entry || typeof entry.kesToRate !== \'number\' || !Number.isFinite(entry.kesToRate)) return null;')).toBe(true);
  });

  it('the strip\u2019s testids follow the family\u2019s voice', () => {
    expect(map.includes('data-testid="org-variance-indicative-strip"')).toBe(true);
    expect(map.includes('data-testid="org-variance-indicative-figure"')).toBe(true);
    expect(map.includes('data-testid="org-variance-indicative-rate"')).toBe(true);
    expect(map.includes('data-testid="org-variance-indicative-voice"')).toBe(true);
    expect(map.includes('the ledger stays in KES.')).toBe(true);
  });

  it('the honest step-asides speak (stale answer, empty org, cost gate)', () => {
    expect(map.includes('data-testid="variance-map-stale"')).toBe(true);
    expect(map.includes('data-testid="variance-map-empty"')).toBe(true);
    expect(map.includes('the shillings stay behind the cost gate')).toBe(true);
    expect(map.includes('data-testid="variance-map-cap-note"')).toBe(true);
  });

  it('the org face\u2019s testids exist (tiles, live rows, roster rows, chips)', () => {
    expect(map.includes('data-testid="variance-map"')).toBe(true);
    expect(map.includes('data-testid="variance-map-open"')).toBe(true);
    expect(map.includes('data-testid="variance-map-closed"')).toBe(true);
    expect(map.includes('data-testid="variance-map-units"')).toBe(true);
    expect(map.includes('data-testid="variance-map-impact"')).toBe(true);
    expect(map.includes('data-testid="variance-map-live-row"')).toBe(true);
    expect(map.includes('data-testid="variance-map-sheet-row"')).toBe(true);
  });

  it('the dark halves arrive from birth and the muted family carries the sub-lines', () => {
    expect(map.includes('dark:border-slate-700 dark:bg-slate-900')).toBe(true);
    expect(map.includes('text-slate-500 dark:text-slate-400')).toBe(true);
  });
});

// ── THE PICKER + THE CANCEL UI ──────────────────────────────────────────────

describe('the branch panel grows the scope and the way out (v2.220.0)', () => {
  it('the create route resolves the category SERVER-SIDE', () => {
    expect(listRoute.includes('const categoryId = typeof body?.categoryId === \'string\' && body.categoryId.length > 0 ? body.categoryId : null;')).toBe(true);
    expect(listRoute.includes('? { categoryId }')).toBe(true);
    expect(listRoute.includes("'no active products in this category — the sheet refuses an empty count.'")).toBe(true);
  });

  it('the picker\u2019s pair speaks and the confirm quotes the real count', () => {
    expect(panel.includes('data-testid="stocktake-scope-full"')).toBe(true);
    expect(panel.includes('data-testid="stocktake-scope-category"')).toBe(true);
    expect(panel.includes('data-testid="stocktake-create-category"')).toBe(true);
    expect(panel.includes('includeProductCount=true')).toBe(true);
    expect(panel.includes('freeze ${pickedCategory.productCount ?? 0} products in ${pickedCategory.name}')).toBe(true);
  });

  it('the picker reads only when it needs to (the enabled guard)', () => {
    expect(panel.includes('enabled: !!storeId && createOpen && createScope === \'category\',')).toBe(true);
  });

  it('the cancel zone is a two-step arm with an optional reason', () => {
    expect(panel.includes('data-testid="stocktake-cancel-zone"')).toBe(true);
    expect(panel.includes('data-testid="stocktake-cancel-arm"')).toBe(true);
    expect(panel.includes('data-testid="stocktake-cancel-reason"')).toBe(true);
    expect(panel.includes('data-testid="stocktake-cancel-confirm"')).toBe(true);
    expect(panel.includes('data-testid="stocktake-cancel-disarm"')).toBe(true);
    expect(panel.includes('Confirm cancel — no stock moves')).toBe(true);
  });

  it('the cancelled face says what did NOT happen', () => {
    expect(panel.includes('data-testid="stocktake-cancelled-face"')).toBe(true);
    expect(panel.includes('Sheet cancelled — the books never heard it')).toBe(true);
    expect(panel.includes('no adjustments applied · no movements written')).toBe(true);
  });

  it('the cancel invalidates the same wires the close does', () => {
    expect(panel.includes("toast.success('Sheet cancelled — no stock moved');")).toBe(true);
    expect(panel.includes('invalidateSheets();')).toBe(true);
  });
});

// ── THE RELEASE FACE ────────────────────────────────────────────────────────

describe('the round of record (v2.220.0)', () => {
  it('package.json leads 2.220.0 (all three slots)', () => {
    expect(pkg.version).toBe('2.337.0');
    expect(pkg.mbumah.releaseVersion).toBe('2.337.0');
    expect(pkg.mbumah.baseVersion).toBe('2.337.0');
  });

  it('VERSION speaks the same truth', () => {
    expect(version).toBe('2.337.0');
  });

  it('whats-new entry at the head', () => {
    expect(feed.includes("version: '2.220.0',")).toBe(true);
    expect(feed.includes("title: 'The variance map',")).toBe(true);
  });

  it('changelog entry leads', () => {
    expect(changelog.includes('## [2.220.0] The variance map')).toBe(true);
    expect(changelog.indexOf('## [2.220.0]') < changelog.indexOf('## [2.219.0]')).toBe(true);
  });
});
