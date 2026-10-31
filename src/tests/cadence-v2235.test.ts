// v2.235.0 — the cadence.
//
//   - THE CADENCE WIRE: the kpi-summary's stockTakes block grows the
//     additive `cadence` — per branch category, the days since a CLOSED
//     sheet last touched its shelf. Three bounded reads compose it (the
//     window's line pairs, the heard-ever product set, the active
//     catalog categories); the closed-30d read grows `closedAt` and
//     stays ONE read for two consumers.
//   - THE FOUR VOICES: fresh (≤ 7 days), stale (in the window, colder
//     than 7), beyond (counted before, not inside this window), never
//     (no closed line EVER — the honest blind spot, never dressed as a
//     date).
//   - THE WALK ORDER: the wire sorts (never → beyond → stale → fresh);
//     the face renders, it never re-sorts.
//   - NO COST FIELD CROSSES THIS WIRE: the cadence reads the catalog,
//     not the caller's gate — every org role hears WHEN.
//   - THE CADENCE FACE: beneath the roster, the four band chips, the
//     rail + chip + voice + heat bar rows, the honest step-aside, the
//     cap note. Dark halves from birth; the muted family carries every
//     sub-line; the dashed track is reserved for never (an absence is
//     never drawn as a value).
//
// Every pin reads the SOURCE OF RECORD (source bytes, not memory).

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it, expect } from 'vitest';

const read = (p: string) => readFileSync(join(process.cwd(), p), 'utf8');

const wire = read('src/app/api/org/kpi-summary/route.ts');
const map = read('src/components/org/variance-map.tsx');
// v2.244.0 hand-pass: the band's houses + voices moved to the one home
// (the map imports them now) — the pins re-point at the lib's source.
const bandLib = read('src/lib/cadence-band.ts');
const primitives = read('src/components/org/primitives.tsx');
const pkg = JSON.parse(read('package.json'));
const feed = read('src/lib/whats-new.ts');
const changelog = read('CHANGELOG.md');
const version = String(pkg.version);

// ── THE RELEASE FACE ─────────────────────────────────────────────────────

describe('the round of record (v2.235.0)', () => {
  it('package.json leads 2.235.0 (all three slots)', () => {
    expect(version).toBe('2.304.0');
    expect(pkg.mbumah.releaseVersion).toBe('2.304.0');
    expect(pkg.mbumah.baseVersion).toBe('2.304.0');
  });

  it('VERSION speaks 2.235.0 and the verify gate is wired', () => {
    expect(read('VERSION').trim()).toBe('2.304.0');
    expect(pkg.scripts['verify:v2-235-0']).toBe('node scripts/verify-v2-235-0.mjs');
  });

  it('the whats-new feed leads the cadence entry (order pin: header-anchored, never a bare version string)', () => {
    expect(feed.includes("version: '2.235.0',")).toBe(true);
    expect(feed.indexOf("version: '2.235.0',")).toBeLessThan(feed.indexOf("version: '2.234.0',"));
    expect(feed.includes("title: 'The cadence',")).toBe(true);
  });

  it('the changelog anchors the section above its ancestor (headers, never bare strings)', () => {
    expect(changelog.indexOf('## [2.235.0]')).toBeGreaterThanOrEqual(0);
    expect(changelog.indexOf('## [2.235.0]')).toBeLessThan(changelog.indexOf('## [2.234.0]'));
  });

  it('the changelog speaks the wire, the walk order, and the face', () => {
    const body = changelog.slice(changelog.indexOf('## [2.235.0]'), changelog.indexOf('## [2.234.0]'));
    expect(body).toContain('### Added');
    expect(body).toContain('### Styled');
    expect(body).toContain('stockTakes.cadence');
    expect(body).toContain('The walk order');
    expect(body).toContain('The cadence face');
  });
});

// ── THE CADENCE WIRE ─────────────────────────────────────────────────────

describe('the cadence wire (kpi-summary)', () => {
  it('the closed-30d read grows closedAt (one read, two consumers)', () => {
    expect(wire.includes('select: { id: true, closedAt: true },')).toBe(true);
  });

  it('the fresh threshold is the law\u2019s own (v2.241.0: no more constants)', () => {
    expect(wire.includes('const cadenceLaw = await readCadenceLaw(rawDb);')).toBe(true);
    expect(wire.includes("import { readCadenceLaw } from '@/lib/cadence-law';")).toBe(true);
    expect(wire.includes('const CADENCE_FRESH_DAYS = 7;')).toBe(false);
  });

  it('the categories read is active-only with the store join', () => {
    expect(wire.includes("rawDb.productCategory.findMany({")).toBe(true);
    expect(wire.includes("where: { isActive: true },")).toBe(true);
    expect(wire.includes('store: { select: { name: true, code: true } },')).toBe(true);
  });

  it('the window pairs are bounded by the closed-30d ids', () => {
    expect(wire.includes('where: { stockTakeId: { in: closed30dIds } },')).toBe(true);
  });

  it('the heard-ever read groups over CLOSED sheets through the product bridge', () => {
    expect(wire.includes("stockTake: { status: 'CLOSED' },")).toBe(true);
    expect(wire.includes('product: { categoryId: { in: cadenceCategoryIds } },')).toBe(true);
  });

  it('the SKU weight is one grouped product count (active only)', () => {
    expect(wire.includes("by: ['categoryId'],")).toBe(true);
    expect(wire.includes('where: { categoryId: { in: cadenceCategoryIds }, isActive: true },')).toBe(true);
  });

  it('the product→category map is the only bridge a line has to its shelf', () => {
    expect(wire.includes('const categoryOfProduct = new Map(cadenceProductRows.map((p) => [p.id, p.categoryId]));')).toBe(true);
  });

  it('daysSince is a floored, non-negative day figure from the sheet closedAt', () => {
    expect(wire.includes('Math.max(0, Math.floor((now.getTime() - lastCountedAt.getTime()) / DAY_MS))')).toBe(true);
  });

  it('the band law speaks all four voices', () => {
    expect(wire.includes("const band: CadenceBand = lastCountedAt")).toBe(true);
    expect(wire.includes("? 'fresh' : 'stale'")).toBe(true);
    expect(wire.includes("? 'beyond' : 'never'")).toBe(true);
  });

  it('the walk order puts the blind spots first (never → beyond → stale → fresh)', () => {
    expect(wire.includes("const CADENCE_WALK_ORDER: Record<CadenceBand, number> = { never: 0, beyond: 1, stale: 2, fresh: 3 };")).toBe(true);
    expect(wire.includes("if (a.band === 'never' || a.band === 'beyond') return b.productCount - a.productCount;")).toBe(true);
    expect(wire.includes('return (b.daysSince ?? 0) - (a.daysSince ?? 0);')).toBe(true);
  });

  it('the block rides stockTakes additively (the face never re-sorts)', () => {
    expect(wire.includes('      cadence,\n    };')).toBe(true);
  });

  it('no cost field crosses the cadence composition (the catalog law)', () => {
    const block = wire.slice(wire.indexOf('v2.235.0: the cadence'), wire.indexOf('const stockTakes = {'));
    expect(block).not.toContain('varianceCost');
    expect(block).not.toContain('canViewCost');
  });

  it('the counts block carries every band plus the total', () => {
    expect(wire.includes("fresh: cadenceCategories.filter((c) => c.band === 'fresh').length,")).toBe(true);
    expect(wire.includes("never: cadenceCategories.filter((c) => c.band === 'never').length,")).toBe(true);
    expect(wire.includes('total: cadenceCategories.length,')).toBe(true);
  });
});

// ── THE CLIENT TYPE ──────────────────────────────────────────────────────

describe('the cadence type (primitives)', () => {
  it('the block stays optional (an older cached answer steps aside honestly)', () => {
    expect(primitives.includes('    cadence?: {')).toBe(true);
  });

  it('the band union names the four voices', () => {
    expect(primitives.includes("band: 'fresh' | 'stale' | 'beyond' | 'never';")).toBe(true);
  });

  it('the row carries the store voice and the SKU weight', () => {
    expect(primitives.includes('storeName: string; storeCode: string | null;')).toBe(true);
    expect(primitives.includes('productCount: number; lastCountedAt: string | null;')).toBe(true);
  });
});

// ── THE CADENCE FACE ─────────────────────────────────────────────────────

describe('the cadence face (variance-map)', () => {
  it('the honest step-aside renders when the answer predates the block', () => {
    expect(map.includes('data-testid="cadence-stale"')).toBe(true);
    expect(map.includes('this answer predates the cadence')).toBe(true);
  });

  it('the block mounts beneath the roster with the History icon', () => {
    expect(map.includes('data-testid="cadence-block"')).toBe(true);
    expect(map.includes('<History className="h-3 w-3 text-slate-400 dark:text-slate-500" aria-hidden="true" />')).toBe(true);
    expect(map.indexOf('data-testid="cadence-block"')).toBeGreaterThan(map.indexOf('variance-map-cap-note'));
  });

  it('the four band chips mount (a zero band mutes, it never vanishes)', () => {
    expect(map.includes("data-testid={`cadence-chip-${band}`}")).toBe(true);
    expect(map.includes("(['fresh', 'stale', 'beyond', 'never'] as const)")).toBe(true);
    expect(map.includes('opacity-60')).toBe(true);
  });

  it('every row carries the rail, the band chip, and the days voice', () => {
    expect(map.includes('data-testid={`cadence-row-${c.categoryId}`}')).toBe(true);
    expect(map.includes('data-testid={`cadence-band-${c.categoryId}`}')).toBe(true);
    expect(map.includes('data-testid={`cadence-days-${c.categoryId}`}')).toBe(true);
    expect(map.includes('className={`w-1 shrink-0 ${house.rail}`')).toBe(true);
  });

  it('the days voice answers every state honestly', () => {
    // v2.244.0: the voice lives in @/lib/cadence-band now (one home).
    expect(bandLib.includes("if (c.band === 'never') return 'never heard';")).toBe(true);
    expect(bandLib.includes("if (c.band === 'beyond') return 'last heard beyond the window';")).toBe(true);
    expect(bandLib.includes("if (c.daysSince === 0) return 'counted today';")).toBe(true);
    expect(bandLib.includes("if (c.daysSince === 1) return '1 day ago';")).toBe(true);
  });

  it('the heat bar length always means time since last heard (capped at the window, 4% floor)', () => {
    expect(map.includes('Math.max(4, Math.round((Math.min(c.daysSince, cadence.windowDays) / cadence.windowDays) * 100))')).toBe(true);
  });

  it('the dashed track is reserved for never (an absence is never drawn as a value)', () => {
    expect(map.includes('border-dashed border-slate-400/70 dark:border-slate-500/70')).toBe(true);
  });

  it('the band houses keep the chip family dark halves from birth', () => {
    // v2.244.0: the houses live in @/lib/cadence-band now (one home).
    expect(bandLib.includes("'bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/30'")).toBe(true);
    expect(bandLib.includes("'bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/30'")).toBe(true);
    expect(bandLib.includes("'bg-orange-50 text-orange-700 ring-orange-200 dark:bg-orange-500/10 dark:text-orange-300 dark:ring-orange-500/30'")).toBe(true);
  });

  it('the row aria names the shelf, the voice, and the weight', () => {
    expect(map.includes('aria-label={`${c.name} in ${c.storeName}: ${voice}, ${c.productCount} products on the shelf.`}')).toBe(true);
  });

  it('the cap note speaks the window law and the fresh threshold', () => {
    expect(map.includes('data-testid="cadence-cap-note"')).toBe(true);
    expect(map.includes('a never-counted shelf has no closed line at all')).toBe(true);
    expect(map.includes('fresh is {cadence.freshDays} days or less.')).toBe(true);
  });

  it('the walk-order caption promises the blind spots first', () => {
    expect(map.includes('when each shelf was last heard — the walk order for the floor, blind spots first.')).toBe(true);
  });
});

// ── THE FOSSIL GUARDS ────────────────────────────────────────────────────

describe('the fossil guards (the map still speaks)', () => {
  it('the v2.220.0 tiles, the v2.233.0 lineage, and the v2.234.0 verdict faces still mount', () => {
    expect(map.includes('data-testid="variance-map-open"')).toBe(true);
    expect(map.includes('testId={`variance-map-lineage-${s.id}`}')).toBe(true);
    expect(map.includes('onOpenSheet={(next) => setDrill(next)}')).toBe(true);
  });

  it('the window figures and the indicative strip still speak', () => {
    expect(map.includes('data-testid="variance-map-impact"')).toBe(true);
    expect(map.includes('data-testid="org-variance-indicative-strip"')).toBe(true);
  });

  it('the type additions ride the stockTakes block (window30d untouched)', () => {
    expect(primitives.includes('window30d: { windowDays?: number; closedCount: number; varianceUnits: number; varianceCostTotal: number | null };')).toBe(true);
  });
});
