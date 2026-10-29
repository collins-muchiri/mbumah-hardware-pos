// v2.245.0 — the walk's findings.
//
//   - THE FINDINGS WIRE: the categories cadence map grows lastWalkUnits
//     per category — the LATEST window walk that actually SPOKE for the
//     shelf (a line with variance non-null), and the units its lines in
//     THIS category landed (line-level attribution — the shelf's own
//     truth). THE ZERO-NEW-QUERIES LAW: the variance column rides the
//     existing windowLines read — no second read, no new join. THE UNITS
//     LAW: units are units; a perfect count speaks 0 — the shelf held;
//     null when no window walk spoke (the honest absence).
//   - THE FINDINGS FACE: the pick strip wears the verdict line
//     (stocktake-pick-cadence-verdict) in the census's own three
//     families (exact slate / surplus emerald / shrinkage red), the
//     block's aria carrying the findings. Absent when the wire carried
//     none — the silence is the honest state.
//   - THE BUG FIX: the picker's beyond voice reads the WIRE'S OWN window
//     now (`not heard in ${c.windowDays} days`) — the hardcoded "30
//     days" was a constant the v2.241.0 law retired. The teeth-v2236
//     pin rode the truth change (the documented hand-pass).
//
// Every pin reads the SOURCE OF RECORD (source bytes, not memory).

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it, expect } from 'vitest';

const read = (p: string) => readFileSync(join(process.cwd(), p), 'utf8');

const wire = read('src/app/api/categories/route.ts');
const panel = read('src/components/inventory/stock-take-panel.tsx');
// v2.246.0 hand-pass: the findings voice moved to its one home — the lib.
const band = read('src/lib/cadence-band.ts');
const map = read('src/components/org/variance-map.tsx');
const pkg = JSON.parse(read('package.json'));
const feed = read('src/lib/whats-new.ts');
const changelog = read('CHANGELOG.md');
const changelogTest = read('src/tests/console-changelog.test.ts');
const version = String(pkg.version);

// ── THE RELEASE FACE ─────────────────────────────────────────────────────

describe('the round of record (v2.245.0)', () => {
  it('package.json leads 2.245.0 (all three slots)', () => {
    expect(version).toBe('2.255.0');
    expect(pkg.mbumah.releaseVersion).toBe('2.255.0');
    expect(pkg.mbumah.baseVersion).toBe('2.255.0');
  });

  it('VERSION + the gates ride', () => {
    expect(read('VERSION').trim()).toBe('2.255.0');
    expect(pkg.scripts['verify:v2-245-0']).toBe('node scripts/verify-v2-245-0.mjs');
    expect(pkg.scripts['verify:v2-244-0']).toBe('node scripts/verify-v2-244-0.mjs');
  });

  it('whats-new leads with the walk\u2019s findings', () => {
    expect(feed).toContain("version: '2.255.0',");
    expect(feed).toContain("title: 'The walk\\u2019s findings',");
    expect(feed.indexOf("version: '2.255.0',")).toBeLessThan(feed.indexOf("version: '2.254.0',"));
  });

  it('changelog anchors the section above its ancestor', () => {
    expect(changelog.indexOf('## [2.245.0]')).toBeGreaterThanOrEqual(0);
    expect(changelog.indexOf('## [2.245.0]')).toBeLessThan(changelog.indexOf('## [2.244.0]'));
  });

  it('the counters ride +1 in the counter test', () => {
    expect(changelogTest).toContain("expect(whatsNewUnreadCount('2.110.0')).toBe(147);");
    expect(changelogTest).toContain("expect(whatsNewUnreadCount('2.77.0')).toBe(180);");
  });
});

// ── THE FINDINGS WIRE ────────────────────────────────────────────────────

describe('the findings wire (the variance rides the cadence\u2019s own read)', () => {
  it('the windowLines read grew the variance column (zero new queries)', () => {
    expect(wire).toContain("v2.245.0 THE WALK'S FINDINGS — the variance rides the read the");
    expect(wire).toContain('select: { stockTakeId: true, productId: true, variance: true },');
    expect(wire).toContain('Array<{ stockTakeId: string; productId: string; variance: number | null }>');
  });

  it('the latest SPEAKING walk is tracked per shelf (line-level attribution)', () => {
    expect(wire).toContain('const lastSpokenByCategory = new Map<string, { sheetKey: string; closedAt: Date; units: number }>();');
    expect(wire).toContain('if (pair.variance == null) continue;');
    expect(wire).toContain('if (!cur || closedAt > cur.closedAt) {');
    expect(wire).toContain('cur.units += Number(pair.variance);');
  });

  it('the map grows lastWalkUnits (rounded like the census speaks)', () => {
    expect(wire).toContain('lastWalkUnits: (() => {');
    expect(wire).toContain('return spoken ? Math.round(spoken.units * 100) / 100 : null;');
  });

  it('the map\u2019s value type carries the field', () => {
    expect(wire).toContain('freshDays: number; windowDays: number; lastWalkUnits: number | null }');
  });
});

// ── THE FINDINGS FACE ────────────────────────────────────────────────────

describe('the findings face (the pick strip says what the last walk found)', () => {
  it('the type grows the field (additive + optional)', () => {
    expect(panel).toContain('lastWalkUnits?: number | null;');
  });

  it('the verdict line rides the census\u2019s own three families', () => {
    expect(panel).toContain("data-testid=\"stocktake-pick-cadence-verdict\"");
    // v2.246.0 hand-pass: the voice's TRUTH moved to the lib's one home
    // (findingsVoice); the pick strip speaks through it — intent
    // preserved (the same words, the same colours).
    expect(band).toContain("if (units === 0) return { text: 'the count held — 0 units', cls: 'text-slate-500 dark:text-slate-400' };");
    expect(band).toContain("if (units > 0) return { text: `+${units} units found`, cls: 'text-emerald-600 dark:text-emerald-400' };");
    expect(band).toContain("return { text: `${units} units found`, cls: 'text-red-600 dark:text-red-400' };");
    expect(panel).toContain('findingsVoice(picked.cadence.lastWalkUnits)');
    expect(panel).toContain('tabular-nums ${findings.cls}');
  });

  it('the verdict is absent when the wire carried none (the honest silence)', () => {
    expect(panel).toContain('const findings = picked.cadence.lastWalkUnits == null');
    expect(panel).toContain('{findings && (');
  });

  it('the block\u2019s aria carries the findings', () => {
    expect(panel).toContain("${findings ? `, ${findings.text}` : ''}, ${picked.productCount ?? 0} products.`}");
  });

  it('the census\u2019s own voice strings stay byte-identical (one law, four faces)', () => {
    // v2.246.0 hand-pass: ONE home (the lib), every face speaks through
    // it — the map, the pick strip, the drill and the branch face.
    expect(band).toContain("'the count held — 0 units'");
    expect(map).toContain('findingsVoice(a.varianceUnits)');
    expect(panel).toContain('findingsVoice(picked.cadence.lastWalkUnits)');
  });
});

// ── THE BUG FIX ──────────────────────────────────────────────────────────

describe('the beyond voice reads the stored law (the v2.241 law, finished)', () => {
  it('the hardcoded 30 is gone (the wire\u2019s own window speaks)', () => {
    expect(panel).toContain("if (c.band === 'beyond') return `not heard in ${c.windowDays} days`;");
    expect(panel).not.toContain("not heard in 30 days';");
  });

  it('the fix is documented at the pens', () => {
    expect(panel).toContain('v2.245.0 BUG FIX: the beyond line used to hardcode');
  });
});
