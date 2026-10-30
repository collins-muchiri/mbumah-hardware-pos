// v2.236.0 — the teeth.
//
//   - THE TEETH WIRE: GET /api/categories grows the OPT-IN
//     `includeCadence=true` — per category of THIS store, the org
//     cadence's four bands (fresh ≤ 7d, stale within 30d, beyond =
//     counted before but not in this window, never = no closed line
//     EVER), plus daysSince, lastCountedAt, and the thresholds the face
//     speaks (freshDays, windowDays). Store-scoped by law; opt-in by
//     law; no cost field crosses the block; the voice-not-sort law
//     holds (the rows keep the categories' own order).
//   - THE PICKER'S CADENCE VOICE: the stocktake create dialog's option
//     labels speak the days voice; the legend names the thresholds from
//     the wire's own numbers; the picked aisle wears the strip — band
//     chip, days voice, heat bar under the org face's own length law.
//   - THE COVERAGE TILE: the variance map's window row grows the FIFTH
//     tile — heard (fresh + stale) of total, from the cadence counts
//     the payload already carries: zero new reads, zero new fetches.
//     The honest absences speak; the dashed track is the absence's
//     track, never a drawn zero.
//
// Every pin reads the SOURCE OF RECORD (source bytes, not memory).

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it, expect } from 'vitest';

const read = (p: string) => readFileSync(join(process.cwd(), p), 'utf8');

const wire = read('src/app/api/categories/route.ts');
const panel = read('src/components/inventory/stock-take-panel.tsx');
const map = read('src/components/org/variance-map.tsx');
const pkg = JSON.parse(read('package.json'));
const feed = read('src/lib/whats-new.ts');
const changelog = read('CHANGELOG.md');
const version = String(pkg.version);

// ── THE RELEASE FACE ─────────────────────────────────────────────────────

describe('the round of record (v2.236.0)', () => {
  it('package.json leads 2.236.0 (all three slots)', () => {
    expect(version).toBe('2.285.0');
    expect(pkg.mbumah.releaseVersion).toBe('2.285.0');
    expect(pkg.mbumah.baseVersion).toBe('2.285.0');
  });

  it('VERSION speaks 2.236.0 and the verify gate is wired', () => {
    expect(read('VERSION').trim()).toBe('2.285.0');
    expect(pkg.scripts['verify:v2-236-0']).toBe('node scripts/verify-v2-236-0.mjs');
  });

  it('the whats-new feed leads the teeth entry (order pin: header-anchored, never a bare version string)', () => {
    expect(feed.includes("version: '2.277.0',")).toBe(true);
    expect(feed.indexOf("version: '2.277.0',")).toBeLessThan(feed.indexOf("version: '2.276.0',"));
    expect(feed.includes("title: 'The teeth',")).toBe(true);
  });

  it('the changelog anchors the section above its ancestor (headers, never bare strings)', () => {
    expect(changelog.indexOf('## [2.241.0]')).toBeGreaterThanOrEqual(0);
    expect(changelog.indexOf('## [2.241.0]')).toBeLessThan(changelog.indexOf('## [2.240.0]'));
  });

  it('the changelog speaks the wire, the picker voice, and the coverage tile', () => {
    const body = changelog.slice(changelog.indexOf('## [2.236.0]'), changelog.indexOf('## [2.235.0]'));
    expect(body).toContain('### Added');
    expect(body).toContain('### Styled');
    expect(body).toContain('includeCadence=true');
    expect(body).toContain("data-testid=\"stocktake-pick-cadence\"");
    expect(body).toContain('data-testid="variance-map-coverage"');
  });
});

// ── THE TEETH WIRE ───────────────────────────────────────────────────────

describe('the teeth wire (GET /api/categories)', () => {
  it('the cadence rides ONLY when the picker asks (the opt-in law)', () => {
    expect(wire.includes("searchParams.get('includeCadence') === 'true'")).toBe(true);
    expect(wire.includes('const cadence = includeCadence')).toBe(true);
  });

  it('the composition is store-scoped (the store law)', () => {
    expect(wire.includes('where: { storeId, status: \'CLOSED\', closedAt: { gte: windowStart } }')).toBe(true);
    expect(wire.includes('stockTake: { storeId, status: \'CLOSED\' }')).toBe(true);
  });

  it('the category bridge is the only bridge a line has (product→category)', () => {
    expect(wire.includes('product: { categoryId: { in: categoryIds } }')).toBe(true);
    expect(wire.includes("select: { id: true, categoryId: true }")).toBe(true);
  });

  it('the four bands speak the org cadence\u2019s voices', () => {
    expect(wire.includes("? (daysSince ?? 0) <= law.freshDays ? 'fresh' : 'stale'")).toBe(true);
    expect(wire.includes(": heardEverByCategory.has(categoryId) ? 'beyond' : 'never'")).toBe(true);
  });

  it('the payload carries the thresholds the face speaks (the law\u2019s own pair, never a constant)', () => {
    expect(wire.includes('freshDays: law.freshDays,')).toBe(true);
    expect(wire.includes('windowDays: law.windowDays,')).toBe(true);
    expect(wire.includes('const law = await readCadenceLaw(db);')).toBe(true);
    expect(wire.includes('const CADENCE_FRESH_DAYS = 7;')).toBe(false);
    expect(wire.includes('const CADENCE_WINDOW_DAYS = 30;')).toBe(false);
  });

  it('the daysSince is floored, non-negative, from the sheet\u2019s own closedAt', () => {
    expect(wire.includes('Math.max(0, Math.floor((now.getTime() - lastCountedAt.getTime()) / CADENCE_DAY_MS))')).toBe(true);
  });

  it('NO cost field crosses the block (the cost law — slice-checked, not whole-file)', () => {
    const start = wire.indexOf('v2.236.0 THE TEETH');
    const end = wire.indexOf('async function createCategoryHandler');
    expect(start).toBeGreaterThanOrEqual(0);
    expect(end).toBeGreaterThan(start);
    const slice = wire.slice(start, end);
    expect(slice).toContain('cadenceByCategory');
    expect(slice.includes('varianceCost')).toBe(false);
    expect(/cost\w*\s*:/.test(slice)).toBe(false);
  });
});

// ── THE PICKER'S CADENCE VOICE ───────────────────────────────────────────

describe('the picker\u2019s cadence voice (stock-take-panel)', () => {
  it('the picker asks for the cadence beside the product counts', () => {
    expect(panel.includes('includeProductCount=true&includeCadence=true')).toBe(true);
  });

  it('the row type carries the block optional (an older cached answer stays silent, never crashes)', () => {
    expect(panel.includes("cadence?: PickCadence")).toBe(true);
    expect(panel.includes('band: \'fresh\' | \'stale\' | \'beyond\' | \'never\';')).toBe(true);
    expect(panel.includes('freshDays: number;')).toBe(true);
  });

  it('every option row WEARS the walk’s voices (the chip, the count, the days — the native option’s text law retired at v2.252.0)', () => {
    // v2.252.0 hand-pass: the picker left the native <option> behind — the
    // Radix rows WEAR the voices (the band chip + the count · days detail)
    // instead of speaking them as plain text.
    expect(panel.includes("data-testid={`stocktake-option-cadence-${c.id}`}")).toBe(true);
    expect(panel.includes("[`${c.productCount ?? 0} products`, c.cadence ? pickDaysVoice(c.cadence) : ''].filter(Boolean).join(' · ')")).toBe(true);
  });

  it('the days voice answers every state honestly', () => {
    expect(panel.includes("if (c.band === 'never') return 'never counted';")).toBe(true);
    // v2.245.0 hand-pass: the beyond voice reads the WIRE'S OWN window now
    // (the v2.241.0 law — the hardcoded "30 days" was a retired constant).
    expect(panel.includes("if (c.band === 'beyond') return `not heard in ${c.windowDays} days`;")).toBe(true);
    expect(panel.includes("if (c.daysSince === 0) return 'counted today';")).toBe(true);
    expect(panel.includes("if (c.daysSince === 1) return '1 day ago';")).toBe(true);
  });

  it('the legend names the thresholds from the wire\u2019s own numbers (never a constant)', () => {
    expect(panel.includes('data-testid="stocktake-cadence-legend"')).toBe(true);
    expect(panel.includes('fresh ≤ {cadenced.cadence.freshDays} days · stale within {cadenced.cadence.windowDays}')).toBe(true);
  });

  it('the picked aisle wears the strip (chip + voice + heat bar)', () => {
    expect(panel.includes('data-testid="stocktake-pick-cadence"')).toBe(true);
    expect(panel.includes('data-testid="stocktake-pick-cadence-chip"')).toBe(true);
    expect(panel.includes('data-testid="stocktake-pick-cadence-voice"')).toBe(true);
  });

  it('the length law is the org face\u2019s own (capped at the window, 4% floor; beyond rides full at 70%)', () => {
    expect(panel.includes('Math.max(4, Math.round((Math.min(picked.cadence.daysSince, picked.cadence.windowDays) / picked.cadence.windowDays) * 100))')).toBe(true);
    expect(panel.includes("picked.cadence.band === 'beyond' ? 'opacity-70' : ''")).toBe(true);
  });

  it('the dashed track stays reserved for never (an absence is never drawn as a value)', () => {
    expect(panel.includes('border-dashed border-slate-400/70 dark:border-slate-500/70')).toBe(true);
  });

  it('the band families are the org cadence\u2019s own (copied verbatim, dark halves from birth)', () => {
    expect(panel.includes("'bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/30'")).toBe(true);
    expect(panel.includes("'bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/30'")).toBe(true);
    expect(panel.includes("'bg-orange-50 text-orange-700 ring-orange-200 dark:bg-orange-500/10 dark:text-orange-300 dark:ring-orange-500/30'")).toBe(true);
  });

  it('THE VOICE-NOT-SORT LAW: the options keep the categories\u2019 own order', () => {
    expect(panel.includes('VOICE-NOT-SORT LAW')).toBe(true);
    expect(panel.includes('{(categoriesQuery.data ?? []).map((c) => (')).toBe(true);
    expect(panel.includes('categoriesQuery.data ?? []).find((c) => c.id === createCategoryId)')).toBe(true);
  });

  it('the strip\u2019s aria names the aisle, the voice, and the weight', () => {
    // v2.245.0 hand-pass: the aria grew the findings interpolation (the
    // verdict line's voice rides it when the wire carried one).
    expect(panel.includes('aria-label={`${picked.name}: ${voice || \'the cadence has not spoken yet\'}${findings ? `, ${findings.text}` : \'\'}, ${picked.productCount ?? 0} products.`}')).toBe(true);
  });
});

// ── THE COVERAGE TILE ────────────────────────────────────────────────────

describe('the coverage tile (variance-map)', () => {
  it('the window row grows the FIFTH tile (the grid learns five)', () => {
    expect(map.includes('grid grid-cols-2 gap-2 sm:grid-cols-5')).toBe(true);
    expect(map.includes('data-testid="variance-map-coverage"')).toBe(true);
    expect(map.indexOf('data-testid="variance-map-coverage"')).toBeGreaterThan(map.indexOf('data-testid="variance-map-impact"'));
  });

  it('coverage is fresh + stale of total — zero new reads, zero new fetches', () => {
    expect(map.includes('const heard = cad ? cad.counts.fresh + cad.counts.stale : null;')).toBe(true);
    expect(map.includes('const total = cad ? cad.counts.total : null;')).toBe(true);
    expect(map.includes('Math.round(((heard ?? 0) / total) * 100)')).toBe(true);
  });

  it('the honest absences speak (and the figure is never born from a fallback)', () => {
    expect(map.includes("'the cadence has not spoken yet'")).toBe(true);
    expect(map.includes("'no shelves to hear'")).toBe(true);
    expect(map.includes("{pct != null ? `${pct}%` : '—'}")).toBe(true);
  });

  it('the fill rides the cadence\u2019s bar language; the dashed track is the absence\u2019s track', () => {
    expect(map.includes('<span className="block h-full rounded-full bg-emerald-500" style={{ width: `${pct}%` }} />')).toBe(true);
    const cov = map.slice(map.indexOf('data-testid="variance-map-coverage"'), map.lastIndexOf('{/* v2.222.0 THE SHEET DRILL'));
    expect(cov).toContain('border-dashed border-slate-400/70');
  });

  it('the tile\u2019s aria names the voice and the window', () => {
    expect(map.includes('aria-label={`Coverage: ${voice}${pct != null ? ` (${heard} of ${total} branch categories heard in the ${lawWindowDays}-day window)` : \'\'}`}')).toBe(true);
  });

  it('the label says Heard · the law\u2019s own days (the window law on the face)', () => {
    expect(map.includes('Heard · {lawWindowDays}d')).toBe(true);
    expect(map.includes('Closed · {lawWindowDays}d')).toBe(true);
    expect(map.includes('Net variance · {lawWindowDays}d')).toBe(true);
    expect(map.includes('Ledger impact · {lawWindowDays}d')).toBe(true);
    expect(map.includes('Heard · 30d')).toBe(false);
  });
});

// ── THE FOSSIL GUARDS ────────────────────────────────────────────────────

describe('the fossil guards (the older instruments still speak)', () => {
  it('the org cadence face is untouched (block, chips, rows, cap note)', () => {
    expect(map.includes('data-testid="cadence-block"')).toBe(true);
    expect(map.includes("data-testid={`cadence-chip-${band}`}")).toBe(true);
    expect(map.includes('data-testid="cadence-cap-note"')).toBe(true);
  });

  it('the picker\u2019s older laws hold (product counts, confirm voice, testid)', () => {
    expect(panel.includes('data-testid="stocktake-create-category"')).toBe(true);
    expect(panel.includes('includeProductCount=true')).toBe(true);
    expect(panel.includes('freeze ${pickedCategory.productCount ?? 0} products in ${pickedCategory.name}')).toBe(true);
  });

  it('the kpi-summary cadence wire reads the same law (one pair, every voice)', () => {
    const kpi = read('src/app/api/org/kpi-summary/route.ts');
    expect(kpi.includes('const cadenceLaw = await readCadenceLaw(rawDb);')).toBe(true);
    expect(kpi.includes('windowDays: cadenceLaw.windowDays,')).toBe(true);
    expect(kpi.includes('freshDays: cadenceLaw.freshDays,')).toBe(true);
  });
});
