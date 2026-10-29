// v2.243.0 — the aisle's verdict.
//
//   - THE VERDICT WIRE: kpi-summary's doorBornByAisle rows grow the
//     walk's own verdict — the closed door-born sheets' variance UNITS
//     (attributed to the aisle the DOOR named via the sheet's own
//     walkCategoryId; no product join, no guess; UNITS ARE UNITS — no
//     cost gate) + the aisle's own cadence band + days (joined from the
//     cadence the same wire already computes — two Maps, zero new
//     queries).
//   - THE VERDICT'S FACE: each aisle row speaks its verdict under the
//     share bar (the drill's own three families — exact slate, surplus
//     emerald, shrinkage red) and wears its band chip (the walk order's
//     four houses). THE HONEST ABSENCES: a walk still out wears no
//     verdict line; an aisle the cadence never knew wears no chip; an
//     older cached answer renders the birth-only row.
//
// Every pin reads the SOURCE OF RECORD (source bytes, not memory).

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it, expect } from 'vitest';

const read = (p: string) => readFileSync(join(process.cwd(), p), 'utf8');

const map = read('src/components/org/variance-map.tsx');
// v2.246.0 hand-pass: the verdict's voice moved to its one home — the lib.
const band = read('src/lib/cadence-band.ts');
const kpi = read('src/app/api/org/kpi-summary/route.ts');
const primitives = read('src/components/org/primitives.tsx');
const createWire = read('src/app/api/stock-takes/route.ts');
const pkg = JSON.parse(read('package.json'));
const feed = read('src/lib/whats-new.ts');
const changelog = read('CHANGELOG.md');
const changelogTest = read('src/tests/console-changelog.test.ts');
const version = String(pkg.version);

// ── THE RELEASE FACE ─────────────────────────────────────────────────────

describe('the round of record (v2.243.0)', () => {
  it('package.json leads 2.243.0 (all three slots)', () => {
    expect(version).toBe('2.257.0');
    expect(pkg.mbumah.releaseVersion).toBe('2.257.0');
    expect(pkg.mbumah.baseVersion).toBe('2.257.0');
  });

  it('VERSION speaks 2.243.0 and the verify gate is wired (previous gate still wired)', () => {
    expect(read('VERSION').trim()).toBe('2.257.0');
    expect(pkg.scripts['verify:v2-243-0']).toBe('node scripts/verify-v2-243-0.mjs');
    expect(pkg.scripts['verify:v2-242-0']).toBe('node scripts/verify-v2-242-0.mjs');
  });

  it('the whats-new feed leads the aisle\u2019s-verdict entry (order pin: header-anchored)', () => {
    expect(feed.includes("version: '2.257.0',")).toBe(true);
    expect(feed.indexOf("version: '2.257.0',")).toBeLessThan(feed.indexOf("version: '2.256.0',"));
    expect(feed.includes("title: 'The aisle\\u2019s verdict',")).toBe(true);
  });

  it('the changelog anchors the section above its ancestor (headers, never bare strings)', () => {
    expect(changelog.indexOf('## [2.243.0]')).toBeGreaterThanOrEqual(0);
    expect(changelog.indexOf('## [2.243.0]')).toBeLessThan(changelog.indexOf('## [2.242.0]'));
  });

  it('the changelog speaks the verdict wire, the units law, and the face', () => {
    const body = changelog.slice(changelog.indexOf('## [2.243.0]'), changelog.indexOf('## [2.242.0]'));
    expect(body).toContain('### Added');
    expect(body).toContain('### Styled');
    expect(body).toContain('varianceUnits');
    expect(body).toContain('cadence-aisle-verdict-{categoryId}');
    expect(body).toContain('cadence-aisle-band-{categoryId}');
    expect(body).toContain('UNITS LAW');
  });

  it('the counters ride +1 again (the aisle\u2019s verdict joined)', () => {
    expect(changelogTest).toContain("expect(whatsNewUnreadCount('2.110.0')).toBe(149);");
    expect(changelogTest).toContain("expect(whatsNewUnreadCount('2.109.0')).toBe(150);");
    expect(changelogTest).toContain("expect(whatsNewUnreadCount('2.108.0')).toBe(151);");
    expect(changelogTest).toContain("expect(whatsNewUnreadCount('2.77.0')).toBe(182);");
  });
});

// ── THE VERDICT WIRE ─────────────────────────────────────────────────────

describe('the verdict wire (kpi-summary)', () => {
  it('the closed door-born read rides the census\u2019s own window', () => {
    expect(kpi).toContain("v2.243.0: the aisle's verdict");
    expect(kpi).toContain("where: { origin: 'walk-door', startedAt: { gte: windowStart }, status: 'CLOSED' }");
  });

  it('the verdict lines read only spoken variance (a counting sheet has not spoken)', () => {
    expect(kpi).toContain("where: { stockTakeId: { in: closedDoorBornIds }, variance: { not: null } }");
  });

  it('the units attribute to the aisle the DOOR named (the sheet\u2019s own column, no product join)', () => {
    expect(kpi).toContain('if (!s.walkCategoryId) continue;');
    expect(kpi).toContain('verdictUnitsByAisle.set(s.walkCategoryId, (verdictUnitsByAisle.get(s.walkCategoryId) ?? 0) + u);');
  });

  it('the band join is the wire\u2019s own computation (two Maps, zero new queries)', () => {
    expect(kpi).toContain('const bandByCategory = new Map(cadenceCategories.map((c) => [c.categoryId, c.band]));');
    expect(kpi).toContain('const daysByCategory = new Map(cadenceCategories.map((c) => [c.categoryId, c.daysSince]));');
  });

  it('the rows ride the enrichment additively (units through the same round2 law)', () => {
    expect(kpi).toContain('doorBornByAisle: doorBornByAisle.map((a) => {');
    expect(kpi).toContain('varianceUnits: u == null ? null : round2(u),');
    expect(kpi).toContain('band: bandByCategory.get(a.categoryId) ?? null,');
    expect(kpi).toContain('daysSince: daysByCategory.get(a.categoryId) ?? null,');
  });

  it('the type grows the verdict fields (optional per field, the birth-only fallback)', () => {
    expect(primitives).toContain("v2.243.0 the aisle's verdict rides the same rows additively");
    expect(primitives).toContain("doorBornByAisle?: Array<{ categoryId: string; name: string; doorBorn: number; varianceUnits?: number | null; band?: 'fresh' | 'stale' | 'beyond' | 'never' | null; daysSince?: number | null }>;");
  });
});

// ── THE VERDICT'S FACE ───────────────────────────────────────────────────

describe('the verdict\u2019s face (the map)', () => {
  it('the verdict line speaks under the share bar (right-aligned, tabular-nums)', () => {
    expect(map).toContain('data-testid={`cadence-aisle-verdict-${a.categoryId}`}');
    expect(map).toContain('text-right text-[9px] font-medium tabular-nums');
  });

  it('a perfect count says so (the shelf held — the census never dresses a zero)', () => {
    // v2.246.0 hand-pass: the voice's TRUTH moved to the lib's one home
    // (findingsVoice); the map speaks through it — intent preserved.
    expect(band).toContain("'the count held — 0 units'");
    expect(map).toContain('findingsVoice(a.varianceUnits)');
  });

  it('the verdict rides the drill\u2019s own three families (exact slate, surplus emerald, shrinkage red)', () => {
    // v2.246.0 hand-pass: the families live in the lib's one home now.
    expect(band).toContain("'text-slate-500 dark:text-slate-400'");
    expect(band).toContain("'text-emerald-600 dark:text-emerald-400'");
    expect(band).toContain("'text-red-600 dark:text-red-400'");
    expect(map).toContain('findingsVoice(a.varianceUnits)');
  });

  it('the band chip rides the name line in the walk order\u2019s four houses', () => {
    expect(map).toContain('data-testid={`cadence-aisle-band-${a.categoryId}`}');
    expect(map).toContain('${bandHouse(a.band).chip}');
    expect(map).toContain('{chipLabel(a.band)}');
    expect(map).toContain("title={`the aisle's own cadence: ${a.band}${bandVoice ? ` — ${bandVoice}` : ''}`}");
  });

  it('the aria carries the whole testimony (births, band voice, verdict)', () => {
    expect(map).toContain('aria-label={`${a.name}: ${voice}${bandVoice ? ` — ${bandVoice}` : \'\'}${verdictText ? ` — ${verdictText}` : \'\'} this window.`}');
  });

  it('the honest absences hold (the checks, never assumptions)', () => {
    expect(map).toContain('{a.band && (');
    expect(map).toContain('{verdictText && (');
    expect(map).toContain('a.varianceUnits == null');
  });
});

// ── THE FOSSIL GUARDS ────────────────────────────────────────────────────

describe('the fossil guards (the door-arc laws stay untouched)', () => {
  it('the origin allowlist + the aisle law still hold (v2.238 + v2.242\u2019s laws)', () => {
    expect(createWire).toContain("const SHEET_ORIGIN_ALLOWLIST = ['walk-door'] as const;");
    expect(createWire).toContain('if (aisle && aisle.storeId === storeId) walkCategoryId = categoryId;');
  });

  it('the per-aisle census still groups + caps + names (v2.242\u2019s law)', () => {
    expect(kpi).toContain("by: ['walkCategoryId']");
    expect(kpi).toContain('.slice(0, 3);');
    expect(kpi).toContain('rawDb.productCategory.findMany({ where: { id: { in: aisleIds } }, select: { id: true, name: true } })');
  });

  it('the per-branch census still groups the same where-shape (v2.239\u2019s law)', () => {
    expect(kpi).toContain("where: { origin: 'walk-door', startedAt: { gte: windowStart } },");
    expect(kpi).toContain('doorBornByStore,');
  });

  it('the census face + aisle block still speak (v2.238 + v2.242\u2019s laws)', () => {
    expect(map).toContain('data-testid="cadence-door-census"');
    expect(map).toContain('data-testid="cadence-door-aisles"');
    expect(map).toContain('the aisles the doors opened onto');
    expect(map).toContain("a.doorBorn === 1 ? '1 sheet born here' : `${a.doorBorn} sheets born here`");
  });

  it('the walk\u2019s door still anchors + the law line still names the pair (v2.237 + v2.241\u2019s laws)', () => {
    expect(map).toContain('href={`/stores/${doorSlug}/inventory?countSheet=${c.categoryId}`}');
    expect(map).toContain('data-testid="cadence-law-line"');
  });

  it('the roster birth chips still ride (v2.240\u2019s law)', () => {
    expect(map).toContain('testId={`variance-map-live-origin-${s.id}`}');
    expect(map).toContain('testId={`variance-map-row-origin-${s.id}`}');
  });
});
