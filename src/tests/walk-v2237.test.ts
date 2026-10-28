// v2.237.0 — the walk.
//
//   - THE SHARED CADENCE LIB: the store-scoped composition (the teeth
//     wire's three bounded reads, the four bands, the thresholds) moves
//     to ONE home spoken verbatim by the categories wire and both
//     count-sheet detail wires. THE WALK RANK (never → beyond → stale →
//     fresh; uncategorized after every banded sibling) and THE WALK
//     COMPARE (stable-sort, ties return 0) live beside it.
//   - THE WALK WIRES: both detail wires compute the sheet's own
//     shelves' cadence and re-speaks the UNCOUNTED pool blind-spots-
//     first; the worklist law stands (uncounted before counted; counted
//     keep their name order). Every line carries cadenceBand +
//     cadenceDaysSince (additive, optional, null when uncategorized; no
//     cost field crosses).
//   - THE WALK NOTES: the Footprints-marked note under each sheet's
//     header (branch) and lines list (drill) speaks the path in FIVE
//     honest voices computed from the lines in hand.
//   - THE LINE BAND CHIPS: the lens-active shelf whisper grows its band
//     chip (the picker strip's four families at 8px).
//
// Every pin reads the SOURCE OF RECORD (source bytes, not memory).

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it, expect } from 'vitest';

const read = (p: string) => readFileSync(join(process.cwd(), p), 'utf8');

const lib = read('src/lib/stocktake-cadence.ts');
const branchWire = read('src/app/api/stock-takes/[id]/route.ts');
const orgWire = read('src/app/api/org/stock-takes/[id]/route.ts');
const categoriesWire = read('src/app/api/categories/route.ts');
const panel = read('src/components/inventory/stock-take-panel.tsx');
const drill = read('src/components/org/sheet-drill.tsx');
const pkg = JSON.parse(read('package.json'));
const feed = read('src/lib/whats-new.ts');
const changelog = read('CHANGELOG.md');
const version = String(pkg.version);

// ── THE RELEASE FACE ─────────────────────────────────────────────────────

describe('the round of record (v2.237.0)', () => {
  it('package.json leads 2.237.0 (all three slots)', () => {
    expect(version).toBe('2.237.0');
    expect(pkg.mbumah.releaseVersion).toBe('2.237.0');
    expect(pkg.mbumah.baseVersion).toBe('2.237.0');
  });

  it('VERSION speaks 2.237.0 and the verify gate is wired', () => {
    expect(read('VERSION').trim()).toBe('2.237.0');
    expect(pkg.scripts['verify:v2-237-0']).toBe('node scripts/verify-v2-237-0.mjs');
  });

  it('the whats-new feed leads the walk entry (order pin: header-anchored, never a bare version string)', () => {
    expect(feed.includes("version: '2.237.0',")).toBe(true);
    expect(feed.indexOf("version: '2.237.0',")).toBeLessThan(feed.indexOf("version: '2.236.0',"));
    expect(feed.includes("title: 'The walk',")).toBe(true);
  });

  it('the changelog anchors the section above its ancestor (headers, never bare strings)', () => {
    expect(changelog.indexOf('## [2.237.0]')).toBeGreaterThanOrEqual(0);
    expect(changelog.indexOf('## [2.237.0]')).toBeLessThan(changelog.indexOf('## [2.236.0]'));
  });

  it('the changelog speaks the lib, the wires, and the notes', () => {
    const body = changelog.slice(changelog.indexOf('## [2.237.0]'), changelog.indexOf('## [2.236.0]'));
    expect(body).toContain('### Added');
    expect(body).toContain('### Styled');
    expect(body).toContain('src/lib/stocktake-cadence.ts');
    expect(body).toContain('stocktake-walk-note');
    expect(body).toContain('sheet-drill-walk-note');
  });
});

// ── THE SHARED CADENCE LIB ───────────────────────────────────────────────

describe('the shared cadence lib (stocktake-cadence)', () => {
  it('the thresholds are exported named constants', () => {
    expect(lib.includes('export const CADENCE_FRESH_DAYS = 7;')).toBe(true);
    expect(lib.includes('export const CADENCE_WINDOW_DAYS = 30;')).toBe(true);
  });

  it('the composition is store-scoped (the store law, verbatim)', () => {
    expect(lib.includes("where: { storeId, status: 'CLOSED', closedAt: { gte: windowStart } }")).toBe(true);
    expect(lib.includes("stockTake: { storeId, status: 'CLOSED' }")).toBe(true);
  });

  it('the four bands and the walk rank speak the org cadence\u2019s order', () => {
    expect(lib.includes("? (daysSince ?? 0) <= CADENCE_FRESH_DAYS ? 'fresh' : 'stale'")).toBe(true);
    expect(lib.includes(": heardEverByCategory.has(categoryId) ? 'beyond' : 'never'")).toBe(true);
    expect(lib.includes("export const CADENCE_WALK_RANK: Record<CadenceBand, number> = { never: 0, beyond: 1, stale: 2, fresh: 3 };")).toBe(true);
    expect(lib.includes('export const CADENCE_WALK_UNCATEGORIZED_RANK = 99;')).toBe(true);
  });

  it('the walk comparator keeps the worklist law (uncounted first, ties keep the base order)', () => {
    expect(lib.includes('if (aUncounted !== bUncounted) return aUncounted ? -1 : 1;')).toBe(true);
    expect(lib.includes("if (!aUncounted) return 0; // counted lines keep the caller's base order")).toBe(true);
    expect(lib.includes('if (rankA !== rankB) return rankA - rankB;')).toBe(true);
    expect(lib.includes('return (b.daysSince ?? -1) - (a.daysSince ?? -1);')).toBe(true);
  });

  it('NO cost field crosses the composition (the cost law — the lib checked whole)', () => {
    expect(lib.includes('cadenceByCategory')).toBe(true);
    expect(lib.includes('varianceCost')).toBe(false);
    expect(/cost\w*\s*:/.test(lib)).toBe(false);
  });
});

// ── THE WALK WIRES ───────────────────────────────────────────────────────

describe('the walk wires (both detail routes, one law)', () => {
  it.each([
    ['branch', branchWire],
    ['org', orgWire],
  ])('the %s wire imports the shared lib and speaks the walk', (_name, wire) => {
    expect(wire.includes("import { cadenceByCategory, walkCompare } from '@/lib/stocktake-cadence';")).toBe(true);
    expect(wire.includes('const walkCategoryIds = Array.from(')).toBe(true);
    expect(wire.includes('const walkCadence = await cadenceByCategory(sheet.storeId, walkCategoryIds);')).toBe(true);
    expect(wire.includes('sheet.lines.sort((a, b) =>')).toBe(true);
    expect(wire.includes('walkCompare(')).toBe(true);
  });

  it.each([
    ['branch', branchWire],
    ['org', orgWire],
  ])('the %s wire grows each line\u2019s band + days (additive, null when uncategorized)', (_name, wire) => {
    expect(wire.includes('category: { select: { id: true, name: true } }')).toBe(true);
    expect(wire.includes("cadenceBand: (l.product.category && walkCadence.get(l.product.category.id)?.band) || null,")).toBe(true);
    expect(wire.includes('cadenceDaysSince: (l.product.category && walkCadence.get(l.product.category.id)?.daysSince) ?? null,')).toBe(true);
  });

  it('the worklist law stands (the fetch keeps its base order — the walk only re-speaks the uncounted pool)', () => {
    const orderBy = "orderBy: [{ countedQty: { sort: 'asc', nulls: 'first' } }, { product: { name: 'asc' } }],";
    expect(branchWire.includes(orderBy)).toBe(true);
    expect(orgWire.includes(orderBy)).toBe(true);
  });

  it('the categories wire keeps the opt-in law and imports the composition', () => {
    expect(categoriesWire.includes("searchParams.get('includeCadence') === 'true'")).toBe(true);
    expect(categoriesWire.includes("import { cadenceByCategory } from '@/lib/stocktake-cadence';")).toBe(true);
  });
});

// ── THE WALK NOTES + LINE CHIPS ──────────────────────────────────────────

describe('the walk notes (both faces, one law)', () => {
  it('the branch sheet wears the note beneath the header', () => {
    expect(panel.includes('data-testid="stocktake-walk-note"')).toBe(true);
    expect(panel.includes('<Footprints className="h-3 w-3 shrink-0 text-slate-400 dark:text-slate-500" aria-hidden="true" />')).toBe(true);
  });

  it('the org drill wears the same note by its lines list', () => {
    expect(drill.includes('data-testid="sheet-drill-walk-note"')).toBe(true);
    expect(drill.indexOf('data-testid="sheet-drill-walk-note"')).toBeLessThan(drill.indexOf('{shownLines.map((l) => {'));
  });

  it('the five honest voices answer every state (branch face)', () => {
    expect(panel.includes("if (un.length === 0) {")).toBe(true);
    expect(panel.includes("every line has spoken — the sheet waits for the close.")).toBe(true);
    expect(panel.includes("`the uncounted lines walk blind spots first — ${bands.never} on never-counted aisle${bands.never === 1 ? '' : 's'} lead the way.`")).toBe(true);
    expect(panel.includes("`the uncounted lines walk blind spots first — ${bands.beyond} not heard in 30 days lead the way.`")).toBe(true);
    expect(panel.includes("`the uncounted lines walk blind spots first — ${bands.stale} on stale aisle${bands.stale === 1 ? '' : 's'} lead the way.`")).toBe(true);
    expect(panel.includes("'the uncounted lines walk the freshest aisles first — the sheet is nearly home.'")).toBe(true);
    expect(panel.includes("`the uncounted lines wait — ${unbanded} line${unbanded === 1 ? '' : 's'} hold no shelf voice.`")).toBe(true);
  });

  it('the drill speaks the same voices verbatim', () => {
    expect(drill.includes("every line has spoken — the sheet waits for the close.")).toBe(true);
    expect(drill.includes("'the uncounted lines walk the freshest aisles first — the sheet is nearly home.'")).toBe(true);
    expect(drill.includes("`the uncounted lines walk blind spots first — ${bands.never} on never-counted aisle${bands.never === 1 ? '' : 's'} lead the way.`")).toBe(true);
  });

  it('the notes never fabricate a count (computed from the lines in hand)', () => {
    expect(panel.includes('const un = detail.lines.filter((l) => l.countedQty == null);')).toBe(true);
    expect(drill.includes('const un = (data?.lines ?? []).filter((l) => l.countedQty == null);')).toBe(true);
    expect(panel.includes("const lead = (['never', 'beyond', 'stale', 'fresh'] as const).find((b) => bands[b] > 0);")).toBe(true);
    expect(drill.includes("const lead = (['never', 'beyond', 'stale', 'fresh'] as const).find((b) => bands[b] > 0);")).toBe(true);
  });

  it('the line band chips ride the lens whispers (the four families at 8px)', () => {
    expect(panel.includes('data-testid={`stocktake-line-band-${line.sku}`}')).toBe(true);
    expect(panel.includes('pickBandHouse(line.cadenceBand).chip')).toBe(true);
    expect(drill.includes('data-testid={`sheet-drill-line-band-${l.sku}`}')).toBe(true);
    expect(drill.includes("'bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/30'")).toBe(true);
    expect(drill.includes("'bg-orange-50 text-orange-700 ring-orange-200 dark:bg-orange-500/10 dark:text-orange-300 dark:ring-orange-500/30'")).toBe(true);
  });

  it('the line types carry the band optional (an older cached answer walks name-order, never crashes)', () => {
    expect(panel.includes("cadenceBand?: 'fresh' | 'stale' | 'beyond' | 'never' | null;")).toBe(true);
    expect(panel.includes('cadenceDaysSince?: number | null;')).toBe(true);
    expect(drill.includes("cadenceBand?: 'fresh' | 'stale' | 'beyond' | 'never' | null;")).toBe(true);
    expect(drill.includes('cadenceDaysSince?: number | null;')).toBe(true);
  });

  it('the notes ride the paper (no print-off mark on the walk)', () => {
    expect(panel.includes('data-testid="stocktake-walk-note" data-sheet-print-off')).toBe(false);
    expect(drill.includes('data-testid="sheet-drill-walk-note" data-sheet-print-off')).toBe(false);
  });
});

// ── THE FOSSIL GUARDS ────────────────────────────────────────────────────

describe('the fossil guards (the older instruments still speak)', () => {
  it('the picker\u2019s strip and the teeth wire keep their laws', () => {
    expect(panel.includes('data-testid="stocktake-pick-cadence"')).toBe(true);
    expect(panel.includes('includeProductCount=true&includeCadence=true')).toBe(true);
    expect(panel.includes('VOICE-NOT-SORT LAW')).toBe(true);
  });

  it('the coverage tile and the org cadence face are untouched', () => {
    const map = read('src/components/org/variance-map.tsx');
    expect(map.includes('data-testid="variance-map-coverage"')).toBe(true);
    expect(map.includes('data-testid="cadence-block"')).toBe(true);
  });

  it('the kpi-summary cadence stays the org\u2019s own composition', () => {
    const kpi = read('src/app/api/org/kpi-summary/route.ts');
    expect(kpi.includes('const CADENCE_FRESH_DAYS = 7;')).toBe(true);
    expect(kpi.includes('cadenceCategories.sort((a, b) => {')).toBe(true);
  });

  it('the drill\u2019s older instruments keep their testids', () => {
    expect(drill.includes('data-testid="sheet-drill-lines-list"')).toBe(true);
    expect(drill.includes('data-testid="sheet-drill-line-category"')).toBe(true);
    expect(drill.includes('data-testid="sheet-drill-variances-only"')).toBe(true);
  });
});
