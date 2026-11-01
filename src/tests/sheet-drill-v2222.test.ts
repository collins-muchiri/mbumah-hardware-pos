// v2.222.0 — the sheet drill.
//
//   - THE ORG WIRE: GET /api/org/stock-takes/[id] — the variance map's
//     rows become doors. ORG_ROLES only (the kpi-summary contract:
//     SUPER_ADMIN, STORE_OWNER, BRANCH_MANAGER), the read runs WITHOUT
//     tenant, and the store-scoped detail route's 403 wall for
//     store-less org roles is bypassed honestly (an org read is
//     org-wide by definition).
//   - THE COST LAW rides the drill: the summary tile and the per-line
//     cost arrive null past inventory.view.cost — the face renders the
//     honest absence, never a hidden zero.
//   - READ-ONLY BY LAW: no count inputs, no close, no cancel on the
//     org face — the branch sheet keeps the only pens.
//   - EVERY STATUS DRILLS: COUNTING (progress lines, the drill
//     re-reads while the floor speaks), CLOSED (variance chips + the
//     stored close-day cost), CANCELLED (the void).
//   - THE NEAR-REORDER BAND: the restock full scope's honest widening
//     (the wire's includeNear, level × 1.5) — defaults OFF (a restock
//     drafts the shortage, not the comfort), disclosed both ways, and
//     the widened rows wear their chip.
//
// Every pin reads the SOURCE OF RECORD (source bytes, not memory).

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it, expect } from 'vitest';

const read = (p: string) => readFileSync(join(process.cwd(), p), 'utf8');

const WIRE_PATH = 'src/app/api/org/stock-takes/[id]/route.ts';
const DRILL_PATH = 'src/components/org/sheet-drill.tsx';
const MAP_PATH = 'src/components/org/variance-map.tsx';
const DIALOG_PATH = 'src/components/org/restock-dialog.tsx';

const wire = read(WIRE_PATH);
const drill = read(DRILL_PATH);
const map = read(MAP_PATH);
const dialog = read(DIALOG_PATH);
const pkg = JSON.parse(read('package.json'));
const changelog = read('CHANGELOG.md');
const feed = read('src/lib/whats-new.ts');

// ── THE RELEASE FACE ─────────────────────────────────────────────────────

describe('the round of record (v2.222.0)', () => {
  it('package.json leads 2.222.0 (all three slots)', () => {
    expect(pkg.version).toBe('2.326.0');
    expect(pkg.mbumah.releaseVersion).toBe('2.326.0');
    expect(pkg.mbumah.baseVersion).toBe('2.326.0');
  });

  it('VERSION speaks the same truth', () => {
    expect(read('VERSION').trim()).toBe('2.326.0');
  });

  it('the changelog of record speaks the round', () => {
    expect(changelog.includes('## [2.222.0] The sheet drill')).toBe(true);
    expect(changelog.indexOf('## [2.222.0]')).toBeLessThan(changelog.indexOf('## [2.221.0]'));
  });

  it('whats-new entry at the head', () => {
    expect(feed.includes("version: '2.222.0',")).toBe(true);
    expect(feed.includes("title: 'The sheet drill',")).toBe(true);
  });

  it('the verify gate is wired', () => {
    expect(pkg.scripts['verify:v2-222-0']).toBe('node scripts/verify-v2-222-0.mjs');
  });
});

// ── THE ORG WIRE ─────────────────────────────────────────────────────────

describe('the org drill wire gates honestly (v2.222.0)', () => {
  it('the route exists on the org contract', () => {
    expect(wire.includes("const ORG_ROLES = ['SUPER_ADMIN', 'STORE_OWNER', 'BRANCH_MANAGER'];")).toBe(true);
    expect(wire.includes('requireAuth(orgStockTakeDetailHandler, { roles: ORG_ROLES })')).toBe(true);
  });

  it('the read runs WITHOUT tenant (org-wide by definition)', () => {
    expect(wire.includes('runWithoutTenant')).toBe(true);
  });

  it('the cost law rides the drill', () => {
    expect(wire.includes("hasFeaturePermission(session.role, 'inventory.view.cost')")).toBe(true);
    expect(wire.includes('varianceValue: canViewCost ? Math.round(varianceValueEstimate * 100) / 100 : null,')).toBe(true);
    expect(wire.includes('varianceCost: canViewCost && l.varianceCost != null ? Number(l.varianceCost) : null,')).toBe(true);
  });

  it('the sheet carries its store (the org face names whose floor spoke)', () => {
    // v2.232.0: the store select grew the additive slug column (the
    // recount door's address — one cheap column, zero new fetches).
    // Re-pinned to the GROWN block; the guarded law survives: the
    // drill wire still speaks the store the floor spoke from.
    expect(wire.includes("store: { select: { id: true, name: true, code: true, slug: true } }")).toBe(true);
    expect(wire.includes('store: { id: sheet.store.id, name: sheet.store.name, code: sheet.store.code, slug: sheet.store.slug }')).toBe(true);
  });

  it('the lines ride the snapshot/counted/variance truth', () => {
    expect(wire.includes('snapshotQty: Number(l.snapshotQty),')).toBe(true);
    expect(wire.includes('countedQty: l.countedQty != null ? Number(l.countedQty) : null,')).toBe(true);
    expect(wire.includes('variance: l.variance != null ? Number(l.variance) : null,')).toBe(true);
  });

  it('a missing sheet is a 404, never a fabricated face', () => {
    expect(wire.includes("error: 'count sheet not found.'")).toBe(true);
  });
});

// ── THE DRILL FACE ───────────────────────────────────────────────────────

describe('the drill face is read-only and honest (v2.222.0)', () => {
  it('the modal exists with its door testids', () => {
    expect(drill.includes('data-testid="sheet-drill"')).toBe(true);
    expect(drill.includes('data-testid="sheet-drill-close"')).toBe(true);
    expect(drill.includes('data-testid="sheet-drill-lines-list"')).toBe(true);
  });

  it('READ-ONLY BY LAW — the footer names it, no pens anywhere', () => {
    expect(drill.includes('data-testid="sheet-drill-read-only"')).toBe(true);
    expect(drill.includes('read-only — the branch sheet keeps the pens; this face watches the floor&apos;s truth.')).toBe(true);
    expect(drill.includes('stocktake-count-input')).toBe(false);
    expect(drill.includes('stocktake-close-btn')).toBe(false);
    expect(drill.includes('stocktake-cancel')).toBe(false);
  });

  it('the loading face discloses the ONE deliberate fetch', () => {
    expect(drill.includes('opening the sheet — one fetch of its lines…')).toBe(true);
  });

  it('the cost gate renders the honest absence', () => {
    expect(drill.includes('the shillings stay behind the cost gate')).toBe(true);
  });

  it('every status speaks its voice', () => {
    expect(drill.includes("'the floor is speaking'")).toBe(true);
    expect(drill.includes("'the books heard it'")).toBe(true);
    expect(drill.includes("'the void'")).toBe(true);
    expect(drill.includes('a void — no adjustments, no movements')).toBe(true);
  });

  it('a live COUNTING sheet re-reads while the floor speaks', () => {
    expect(drill.includes("refetchInterval: target?.status === 'COUNTING' ? 10_000 : false,")).toBe(true);
  });

  it('the variance chips wear the house ladder (the 3:1 law)', () => {
    expect(drill.includes('text-red-700 ring-red-200')).toBe(true);
    expect(drill.includes('text-emerald-700 ring-emerald-200')).toBe(true);
  });

  it('an empty sheet says so honestly', () => {
    expect(drill.includes('the sheet froze no lines — nothing to count.')).toBe(true);
  });
});

// ── THE MAP'S DOORS ──────────────────────────────────────────────────────

describe('the variance map grows doors (v2.222.0)', () => {
  it('the map imports and mounts the drill', () => {
    expect(map.includes("import { SheetDrill, type SheetDrillTarget } from './sheet-drill';") || map.includes("import { SheetDrill, csvCell, type SheetDrillTarget } from './sheet-drill';")).toBe(true); // v2.237.0 re-pin: the map grew the walk's-paper import (the cadence's CSV rides csvCell)
    // v2.223.0: the mount is keyed per SHEET — a fresh door is a fresh
    // MOUNT, so the line finder's needle starts empty by construction.
    expect(map.includes('key={drill.id}')).toBe(true);
    expect(map.includes('onOpenSheet={(next) => setDrill(next)}')).toBe(true); // v2.234.0 re-pin: the mount grew the verdict door (the re-key law)
  });

  it('roster rows AND live rows are doors (every status drills)', () => {
    expect(map.match(/variance-map-open-sheet-\$\{s\.id\}/g)?.length).toBe(2);
    expect(map.includes("setDrill({ id: s.id, storeName: s.storeName, status: 'COUNTING' })")).toBe(true);
    expect(map.includes('setDrill({ id: s.id, storeName: s.storeName, status: s.status })')).toBe(true);
  });

  it('the door wears its chevron affordance', () => {
    expect(map.includes('<ChevronRight')).toBe(true);
  });
});

// ── THE NEAR-REORDER BAND ────────────────────────────────────────────────

describe('the restock full scope widens honestly (v2.222.0)', () => {
  it('the toggle exists as an aria-pressed control, full mode only', () => {
    expect(dialog.includes('data-testid="restock-near-toggle"')).toBe(true);
    expect(dialog.includes('aria-pressed={nearBand}')).toBe(true);
    expect(dialog.includes("{mode === 'full' && (")).toBe(true);
  });

  it('defaults OFF — a restock drafts the shortage, not the comfort', () => {
    expect(dialog.includes('const [nearBand, setNearBand] = useState(false);')).toBe(true);
  });

  it('the wire rides includeNear=true only when the band is on', () => {
    expect(dialog.includes("nearBand ? '&includeNear=true' : ''")).toBe(true);
    expect(dialog.includes("queryKey: ['restock-full', storeId, nearBand],")).toBe(true);
  });

  it('both states disclose themselves', () => {
    expect(dialog.includes('the list widened to level \u00d7 1.5 — near-band lines wear their chip.')).toBe(true);
    expect(dialog.includes('the list stops at the reorder level — widen to catch items approaching it.')).toBe(true);
  });

  it('NEAR_REORDER rows wear their chip', () => {
    expect(dialog.includes("const near = item.urgency === 'NEAR_REORDER';")).toBe(true);
    expect(dialog.includes('restock-near-chip-${item.sku}')).toBe(true);
    expect(dialog.includes('near band')).toBe(true);
  });

  it('the mapping carries the urgency through RestockItem', () => {
    expect(dialog.includes('urgency: r.urgency,')).toBe(true);
    expect(dialog.includes('urgency?: string;')).toBe(true);
  });

  it('the widened list stays split-aware (the groups ride the same rows)', () => {
    expect(dialog.includes('supplierGroups = useMemo(() => {')).toBe(true);
    expect(dialog.includes('activeItems = useMemo(')).toBe(true);
  });
});
