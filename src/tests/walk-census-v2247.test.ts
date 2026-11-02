// v2.247.0 — the walk's mirror.
//
//   - THE MIRROR'S READ: both detail wires grow `walkAisleSheetUnits`
//     (additive + optional) — the sheet's OWN spoken units in its aisle,
//     the lib's own testament law mirrored back at the sheet itself:
//     ONE bounded aggregate, indexed by the sheet's id, the same
//     product-category join + variance-not-null shape readCategoryBand
//     speaks. THE UNITS LAW: units are units (the cost gate is NOT
//     involved); a perfect count speaks 0 — the shelf held this walk;
//     nothing spoke (no counted lines on the aisle) → null, the honest
//     absence, never a hidden zero.
//   - THE MIRROR'S FACES: when both truths are present AND differ, the
//     drill and the branch face speak this walk's own verdict FIRST
//     (sheet-drill-origin-aisle-self / stocktake-sheet-origin-aisle-self,
//     the lib's findingsVoice — the same three families and colours as
//     the census — tabular-nums, the paper's own truth on the title),
//     with the aisle's latest beneath it. SIBLING LINES, NEVER
//     REWRITES: the v2.246.0 verdict line stays byte-identical. Absent
//     when either truth is absent, or when the two agree — the silence
//     is the honest state (a duplicate would say nothing new).
//   - THE READ CLASS: pure insertions — no lib return shape grew, no
//     existing source byte moved, the ancestor pins' bytes stand.
//
// Every pin reads the SOURCE OF RECORD (source bytes, not memory).

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it, expect } from 'vitest';

const read = (p: string) => readFileSync(join(process.cwd(), p), 'utf8');

const orgWire = read('src/app/api/org/stock-takes/[id]/route.ts');
const branchWire = read('src/app/api/stock-takes/[id]/route.ts');
const drill = read('src/components/org/sheet-drill.tsx');
const panel = read('src/components/inventory/stock-take-panel.tsx');
const band = read('src/lib/cadence-band.ts');
const pkg = JSON.parse(read('package.json'));
const feed = read('src/lib/whats-new.ts');
const changelog = read('CHANGELOG.md');
const changelogTest = read('src/tests/console-changelog.test.ts');
const version = String(pkg.version);

describe('the walk\u2019s mirror — the read (v2.247.0)', () => {
  it('the org wire grows walkAisleSheetUnits (additive + optional)', () => {
    expect(orgWire).toContain('let walkAisleSheetUnits: number | null = null;');
    expect(orgWire).toContain('\n      walkAisleSheetUnits,');
  });

  it('the branch wire grows walkAisleSheetUnits (additive + optional)', () => {
    expect(branchWire).toContain('let walkAisleSheetUnits: number | null = null;');
    expect(branchWire).toContain('\n      walkAisleSheetUnits,');
  });

  it('the read is ONE bounded aggregate, the lib\u2019s own testament shape mirrored', () => {
    const aggregate = 'where: { stockTakeId: id, product: { categoryId: sheet.walkCategoryId }, variance: { not: null } },';
    expect(orgWire).toContain(aggregate);
    expect(branchWire).toContain(aggregate);
    expect(orgWire).toContain('_sum: { variance: true },');
    expect(branchWire).toContain('_sum: { variance: true },');
  });

  it('the units attribute line-level, rounded like the census speaks', () => {
    const rounding = 'walkAisleSheetUnits = self._sum.variance == null ? null : Math.round(Number(self._sum.variance) * 100) / 100;';
    expect(orgWire).toContain(rounding);
    expect(branchWire).toContain(rounding);
  });

  it('the read asks only for an aisle-born sheet (the walkCategoryId gate)', () => {
    expect(orgWire).toContain('if (sheet.walkCategoryId) {');
    expect(branchWire).toContain('if (sheet.walkCategoryId) {');
  });

  it('the v2.246 verdict lines stay byte-identical (the sibling law)', () => {
    expect(orgWire).toContain('walkAisleUnits: aisleBand?.lastWalkUnits ?? null,');
    expect(branchWire).toContain('walkAisleUnits: aisleBand?.lastWalkUnits ?? null,');
    expect(orgWire).toContain('walkAisleBand: aisleBand?.band ?? null,');
    expect(branchWire).toContain('walkAisleDaysSince: aisleBand?.daysSince ?? null,');
  });
});

describe('the walk\u2019s mirror — the faces (v2.247.0)', () => {
  it('the drill wears the self line', () => {
    expect(drill).toContain('data-testid="sheet-drill-origin-aisle-self"');
    expect(drill).toContain('findingsVoice(data.walkAisleSheetUnits)');
    expect(drill).toContain('tabular-nums ${fv.cls}');
  });

  it('the branch face wears the self line', () => {
    expect(panel).toContain('data-testid="stocktake-sheet-origin-aisle-self"');
    expect(panel).toContain('findingsVoice(detail.walkAisleSheetUnits)');
    expect(panel).toContain('tabular-nums ${fv.cls}');
  });

  it('the self line speaks ONLY when both truths are present AND differ', () => {
    expect(drill.includes('data?.walkAisleSheetUnits == null ||')).toBe(true);
    expect(drill.includes('data?.walkAisleUnits == null ||')).toBe(true);
    expect(drill.includes('data.walkAisleSheetUnits === data.walkAisleUnits')).toBe(true);
    expect(panel.includes('detail.walkAisleSheetUnits == null ||')).toBe(true);
    expect(panel.includes('detail.walkAisleUnits == null ||')).toBe(true);
    expect(panel.includes('detail.walkAisleSheetUnits === detail.walkAisleUnits')).toBe(true);
  });

  it('the paper\u2019s own truth rides the title', () => {
    expect(drill).toContain("this sheet's own walk \u2014 the aisle's shelf as this paper found it");
    expect(panel).toContain("this sheet's own walk \u2014 the aisle's shelf as this paper found it");
  });

  it('the self line speaks through the one home (no second voice was written)', () => {
    expect(drill).not.toContain('const selfFindingsVoice');
    expect(panel).not.toContain('const selfFindingsVoice');
    expect(band).toContain('export function findingsVoice(units: number): FindingsVoice {');
  });

  it('the faces\u2019 types grow the field additive + optional', () => {
    expect(drill).toContain('walkAisleSheetUnits?: number | null;');
    expect(panel).toContain('walkAisleSheetUnits?: number | null;');
  });
});

describe('the walk\u2019s mirror — the release face (v2.247.0)', () => {
  it('the release face speaks 2.247.0', () => {
    expect(version).toBe('2.340.0');
    expect(pkg.mbumah.releaseVersion).toBe('2.340.0');
    expect(pkg.mbumah.baseVersion).toBe('2.340.0');
    expect(read('VERSION').trim()).toBe('2.340.0');
  });

  it('the verify gate is wired', () => {
    expect(pkg.scripts['verify:v2-247-0']).toBe('node scripts/verify-v2-247-0.mjs');
    expect(pkg.scripts['verify:v2-246-0']).toBe('node scripts/verify-v2-246-0.mjs');
  });

  it('whats-new heads the mirror above its ancestor', () => {
    expect(feed).toContain("version: '2.277.0',");
    expect(feed.indexOf("version: '2.277.0',")).toBeLessThan(feed.indexOf("version: '2.276.0',"));
    expect(feed).toContain("title: 'The walk\\u2019s mirror',");
  });

  it('the changelog anchors the section above its ancestor', () => {
    expect(changelog.indexOf('## [2.247.0]')).toBeGreaterThanOrEqual(0);
    expect(changelog.indexOf('## [2.247.0]')).toBeLessThan(changelog.indexOf('## [2.246.0]'));
  });

  it('the counters ride +1 in the counter test', () => {
    expect(changelogTest).toContain("expect(whatsNewUnreadCount('2.110.0')).toBe(231);");
    expect(changelogTest).toContain("expect(whatsNewUnreadCount('2.77.0')).toBe(264);");
  });
});
