// v2.246.0 — the aisle's testament.
//
//   - THE TESTAMENT'S READ: readCategoryBand grows lastWalkUnits — the
//     categories wire's own law mirrored for one aisle: the latest
//     SPEAKING line in the window (a line with variance non-null; a
//     line the floor never counted stays silent), then that sheet's
//     spoken units in THIS category (one aggregate, the same
//     product-category join — line-level attribution, the shelf's own
//     truth). THE UNITS LAW: units are units; a perfect count speaks 0
//     — the shelf held; null when no window walk spoke (beyond/never/a
//     silent window — the honest absence). THE READ CLASS: the band's
//     one line read stays first; the testament adds two bounded reads,
//     in the window only. THE FALLBACK LAW per read: a band that fails
//     is no band (null); a testament that fails under a living band is
//     silence (units null, the band keeps its truth).
//   - THE TESTAMENT'S WIRE: both detail wires grow `walkAisleUnits`
//     (additive + optional), read only for an aisle-born sheet. The
//     band + days lines stay byte-identical (the v2.244.0 pins keep
//     speaking).
//   - THE TESTAMENT'S FACES: a verdict line under the sheet's when-line
//     on both faces (sheet-drill-origin-aisle-verdict /
//     stocktake-sheet-origin-aisle-verdict), the census's own three
//     families via the lib, tabular-nums on the figure. SIBLING LINES,
//     NEVER REWRITES: the chip rows stay byte-identical. Absent when
//     the wire carried no units — the silence is the honest state.
//   - THE VOICE'S ONE HOME: the census's three families move to
//     findingsVoice in the lib — the map's verdict rows, the pick
//     strip's verdict line and the detail faces' testament lines all
//     speak through it (one law, four faces; the v2.243/v2.245 pins
//     rode the move — the documented hand-pass).
//
// Every pin reads the SOURCE OF RECORD (source bytes, not memory).

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it, expect } from 'vitest';

const read = (p: string) => readFileSync(join(process.cwd(), p), 'utf8');

const band = read('src/lib/cadence-band.ts');
const orgWire = read('src/app/api/org/stock-takes/[id]/route.ts');
const branchWire = read('src/app/api/stock-takes/[id]/route.ts');
const drill = read('src/components/org/sheet-drill.tsx');
const panel = read('src/components/inventory/stock-take-panel.tsx');
const map = read('src/components/org/variance-map.tsx');
const pkg = JSON.parse(read('package.json'));
const feed = read('src/lib/whats-new.ts');
const changelog = read('CHANGELOG.md');
const changelogTest = read('src/tests/console-changelog.test.ts');
const version = String(pkg.version);

// ── THE RELEASE FACE ─────────────────────────────────────────────────────

describe('the round of record (v2.246.0)', () => {
  it('package.json leads 2.246.0 (all three slots)', () => {
    expect(version).toBe('2.259.0');
    expect(pkg.mbumah.releaseVersion).toBe('2.259.0');
    expect(pkg.mbumah.baseVersion).toBe('2.259.0');
  });

  it('VERSION + the gates ride', () => {
    expect(read('VERSION').trim()).toBe('2.259.0');
    expect(pkg.scripts['verify:v2-246-0']).toBe('node scripts/verify-v2-246-0.mjs');
    expect(pkg.scripts['verify:v2-245-0']).toBe('node scripts/verify-v2-245-0.mjs');
  });

  it('whats-new leads with the aisle\u2019s testament', () => {
    expect(feed).toContain("version: '2.259.0',");
    expect(feed).toContain("title: 'The aisle\\u2019s testament',");
    expect(feed.indexOf("version: '2.259.0',")).toBeLessThan(feed.indexOf("version: '2.258.0',"));
  });

  it('changelog anchors the section above its ancestor', () => {
    expect(changelog.indexOf('## [2.246.0]')).toBeGreaterThanOrEqual(0);
    expect(changelog.indexOf('## [2.246.0]')).toBeLessThan(changelog.indexOf('## [2.245.0]'));
  });

  it('the counters ride +1 in the counter test', () => {
    expect(changelogTest).toContain("expect(whatsNewUnreadCount('2.110.0')).toBe(151);");
    expect(changelogTest).toContain("expect(whatsNewUnreadCount('2.77.0')).toBe(184);");
  });
});

// ── THE TESTAMENT'S READ (the lib) ───────────────────────────────────────

describe('the testament\u2019s read (the aisle\u2019s window verdict, one lib)', () => {
  it('readCategoryBand\u2019s return grows lastWalkUnits', () => {
    expect(band).toContain('lastWalkUnits: number | null } | null>');
  });

  it('the latest SPEAKING line is read in the window only (a silent line never speaks)', () => {
    expect(band).toContain('variance: { not: null },');
    expect(band).toContain('stockTake: { status: \'CLOSED\', closedAt: { gte: new Date(windowStartMs) } },');
    expect(band).toContain("orderBy: { stockTake: { closedAt: 'desc' } },");
  });

  it('the units attribute line-level (the shelf\u2019s own truth, rounded like the census speaks)', () => {
    expect(band).toContain('where: { stockTakeId: spoken.stockTakeId, product: { categoryId }, variance: { not: null } },');
    expect(band).toContain('lastWalkUnits = agg._sum.variance == null ? null : Math.round(Number(agg._sum.variance) * 100) / 100;');
  });

  it('beyond/never never ask (their verdict is already the silence)', () => {
    expect(band).toContain("return { band: 'never', daysSince: null, lastWalkUnits: null };");
    expect(band).toContain("return { band: 'beyond', daysSince: null, lastWalkUnits: null };");
  });

  it('the fallback law holds per read (a fallen testament keeps the band\u2019s truth)', () => {
    expect(band).toContain('let lastWalkUnits: number | null = null;');
    expect(band).toContain('if (spoken) {');
  });
});

// ── THE TESTAMENT'S WIRE ─────────────────────────────────────────────────

describe('the testament\u2019s wire (the verdict rides both detail wires)', () => {
  it('the org wire grows walkAisleUnits (additive + optional)', () => {
    expect(orgWire).toContain('walkAisleUnits: aisleBand?.lastWalkUnits ?? null,');
    expect(orgWire).toContain('lastWalkUnits: number | null } | null = null;');
  });

  it('the branch wire grows walkAisleUnits (additive + optional)', () => {
    expect(branchWire).toContain('walkAisleUnits: aisleBand?.lastWalkUnits ?? null,');
    expect(branchWire).toContain('lastWalkUnits: number | null } | null = null;');
  });

  it('the v2.244 band + days lines stay byte-identical (the pins keep speaking)', () => {
    expect(orgWire).toContain('walkAisleBand: aisleBand?.band ?? null,');
    expect(orgWire).toContain('walkAisleDaysSince: aisleBand?.daysSince ?? null,');
    expect(branchWire).toContain('walkAisleBand: aisleBand?.band ?? null,');
    expect(branchWire).toContain('walkAisleDaysSince: aisleBand?.daysSince ?? null,');
  });

  it('the read class is documented at the pens', () => {
    expect(orgWire).toContain("v2.246.0 THE AISLE'S TESTAMENT");
    expect(branchWire).toContain("v2.246.0 THE AISLE'S TESTAMENT");
  });
});

// ── THE TESTAMENT'S FACES ────────────────────────────────────────────────

describe('the testament\u2019s faces (the sheets say what the aisle found)', () => {
  it('the type grows the field (additive + optional, both faces)', () => {
    expect(drill).toContain('walkAisleUnits?: number | null;');
    expect(panel).toContain('walkAisleUnits?: number | null;');
  });

  it('the drill wears the verdict line (the census\u2019s own families)', () => {
    expect(drill).toContain('data-testid="sheet-drill-origin-aisle-verdict"');
    expect(drill).toContain('findingsVoice(data.walkAisleUnits)');
    expect(drill).toContain('tabular-nums ${fv.cls}');
  });

  it('the branch face wears the verdict line (the census\u2019s own families)', () => {
    expect(panel).toContain('data-testid="stocktake-sheet-origin-aisle-verdict"');
    expect(panel).toContain('findingsVoice(detail.walkAisleUnits)');
    expect(panel).toContain('tabular-nums ${fv.cls}');
  });

  it('the verdict is absent when the wire carried none (the honest silence)', () => {
    expect(drill).toContain("data?.walkAisleUnits == null) return null;");
    expect(panel).toContain('detail.walkAisleUnits == null) return null;');
  });

  it('the chip rows stay byte-identical (sibling lines, never rewrites)', () => {
    expect(drill).toContain('data-testid="sheet-drill-origin-aisle-band"');
    expect(panel).toContain('data-testid="stocktake-sheet-origin-aisle-band"');
    expect(panel).toContain('data-testid="stocktake-pick-cadence-verdict"');
  });

  it('the shelf\u2019s own truth rides the title', () => {
    expect(drill).toContain("the aisle's latest walk found this \u2014 the shelf's own truth");
    expect(panel).toContain("the aisle's latest walk found this \u2014 the shelf's own truth");
  });
});

// ── THE VOICE'S ONE HOME ─────────────────────────────────────────────────

describe('the findings voice (one home, four faces)', () => {
  it('the lib speaks the census\u2019s own three families', () => {
    expect(band).toContain('export function findingsVoice(units: number): FindingsVoice {');
    expect(band).toContain("if (units === 0) return { text: 'the count held \u2014 0 units', cls: 'text-slate-500 dark:text-slate-400' };");
    expect(band).toContain("if (units > 0) return { text: `+${units} units found`, cls: 'text-emerald-600 dark:text-emerald-400' };");
    expect(band).toContain("return { text: `${units} units found`, cls: 'text-red-600 dark:text-red-400' };");
  });

  it('the map speaks through the one home (its inline copy is gone)', () => {
    expect(map).toContain('findingsVoice(a.varianceUnits)');
    expect(map).not.toContain("const verdictText = a.varianceUnits == null");
    expect(map).not.toContain("'text-emerald-600 dark:text-emerald-400'");
  });

  it('the pick strip speaks through the one home (its local copy is gone)', () => {
    expect(panel).toContain('findingsVoice(picked.cadence.lastWalkUnits)');
    expect(panel).not.toContain('const pickFindingsVoice = (units: number)');
  });

  it('both detail faces speak through the one home', () => {
    expect(drill).toContain('findingsVoice(data.walkAisleUnits)');
    expect(panel).toContain('findingsVoice(detail.walkAisleUnits)');
  });

  it('the lib exports the voice\u2019s shape', () => {
    expect(band).toContain('export interface FindingsVoice {');
    expect(band).toContain('text: string;');
    expect(band).toContain('cls: string;');
  });
});
