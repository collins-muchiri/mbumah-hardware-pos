// v2.244.0 — the aisle's echo, the band's one home.
//
//   - THE BAND'S ONE HOME: the four band houses (fresh/stale/beyond/
//     never) and their voices move from the variance map's local
//     closures to `@/lib/cadence-band` — the anti-duplication law's
//     one home, the classes byte-identical, the map's call sites
//     unchanged (the v2.243.0 pins keep speaking).
//   - THE ECHO WIRE: both detail wires (org drill + branch face) grow
//     `walkAisleBand` + `walkAisleDaysSince` — the aisle's own cadence
//     band, read the map's way (readCategoryBand: the ONE latest CLOSED
//     line touching a product currently on the aisle), only for an
//     aisle-born sheet, only two bounded reads. The fallback law: a
//     failed read is null — the face wears the name-only echo, never a
//     guessed house, never a thrown request.
//   - THE ECHO'S FACE: a sibling band chip after the name chip on both
//     faces (sheet-drill-origin-aisle-band / stocktake-sheet-origin-
//     aisle-band), the house's classes, the days voice on the title,
//     tabular-nums on the figure. SIBLING SPANS, NEVER REWRITES: the
//     v2.242.0 name chips stay byte-identical, the birth chip's law
//     stays byte-identical. Absent when the wire carried no band — the
//     silence is the honest state.
//
// Every pin reads the SOURCE OF RECORD (source bytes, not memory).

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it, expect } from 'vitest';

const read = (p: string) => readFileSync(join(process.cwd(), p), 'utf8');

const band = read('src/lib/cadence-band.ts');
const map = read('src/components/org/variance-map.tsx');
const drill = read('src/components/org/sheet-drill.tsx');
const panel = read('src/components/inventory/stock-take-panel.tsx');
const orgWire = read('src/app/api/org/stock-takes/[id]/route.ts');
const branchWire = read('src/app/api/stock-takes/[id]/route.ts');

// ── THE BAND'S ONE HOME ──────────────────────────────────────────────────

describe('the band lib (one home)', () => {
  it('the lib speaks the four houses with the exact classes the map has worn since v2.235.0', () => {
    expect(band).toContain("export type CadenceBand = 'fresh' | 'stale' | 'beyond' | 'never';");
    expect(band).toContain("export function bandHouse(band: CadenceBand): CadenceBandHouse {");
    // fresh — emerald; stale — amber; beyond — orange; never — slate.
    expect(band).toContain("chip: 'bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/30', rail: 'bg-emerald-500', bar: 'bg-emerald-500'");
    expect(band).toContain("chip: 'bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/30', rail: 'bg-amber-500', bar: 'bg-amber-500'");
    expect(band).toContain("chip: 'bg-orange-50 text-orange-700 ring-orange-200 dark:bg-orange-500/10 dark:text-orange-300 dark:ring-orange-500/30', rail: 'bg-orange-500', bar: 'bg-orange-400'");
    expect(band).toContain("chip: 'bg-slate-100 text-slate-600 ring-slate-200 dark:bg-slate-500/10 dark:text-slate-300 dark:ring-slate-500/30', rail: 'bg-slate-300 dark:bg-slate-600', bar: null");
  });

  it('the lib speaks the days voice + the chip label (the map\u2019s own words)', () => {
    expect(band).toContain("if (c.band === 'never') return 'never heard';");
    expect(band).toContain("if (c.band === 'beyond') return 'last heard beyond the window';");
    expect(band).toContain("if (c.daysSince === 0) return 'counted today';");
    expect(band).toContain("if (c.daysSince === 1) return '1 day ago';");
    expect(band).toContain("return band === 'never' ? 'never' : band;");
  });

  it('the single-aisle read rides the map\u2019s own band semantics', () => {
    expect(band).toContain('export async function readCategoryBand(');
    // the ONE latest CLOSED line touching a product currently on the aisle
    expect(band).toContain("product: { categoryId },");
    expect(band).toContain("stockTake: { status: 'CLOSED', closedAt: { not: null } },");
    expect(band).toContain("orderBy: { stockTake: { closedAt: 'desc' } },");
    // the four voices: no line → never; in-window → fresh/stale by THE LAW'S OWN boundary; older → beyond
    // (v2.246.0 hand-pass: the read grew the aisle's testament — lastWalkUnits
    // rides every voice now; beyond/never's units ride the silence)
    expect(band).toContain("if (!closedAt) return { band: 'never', daysSince: null, lastWalkUnits: null };");
    expect(band).toContain('const band: CadenceBand = daysSince <= law.freshDays ? \'fresh\' : \'stale\';');
    expect(band).toContain('return { band, daysSince, lastWalkUnits };');
    expect(band).toContain("return { band: 'beyond', daysSince: null, lastWalkUnits: null };");
    // the fallback law: a failed read is null, never a thrown request
    expect(band).toContain('} catch {');
    expect(band).toContain('return null;');
  });

  it('beyond + never carry no days number (the honest absence, the kpi\u2019s own shape)', () => {
    // beyond: daysSince null (the read itself returns it so)
    // (v2.246.0 hand-pass: the testament rides — beyond/never's
    // lastWalkUnits is null too, the honest silence; the DAYS law is
    // the pin's intent and stays byte-true)
    expect(band).toContain("return { band: 'beyond', daysSince: null, lastWalkUnits: null };");
    // never: daysSince null
    expect(band).toContain("return { band: 'never', daysSince: null, lastWalkUnits: null };");
  });
});

describe('the map obeys the one home', () => {
  it('the map imports the houses (the closures are gone)', () => {
    expect(map).toContain("import { bandHouse, chipLabel, daysVoice, findingsVoice } from '@/lib/cadence-band';");
    expect(map).not.toContain('const bandHouse = (band:');
    expect(map).not.toContain('const daysVoice = (c:');
    expect(map).not.toContain("const chipLabel = (band: string)");
  });

  it('the call sites stay byte-identical (the v2.243.0 pins keep speaking)', () => {
    expect(map).toContain('${bandHouse(a.band).chip}');
    expect(map).toContain('{chipLabel(a.band)}');
  });
});

// ── THE ECHO WIRE ────────────────────────────────────────────────────────

describe('the echo wire (both detail routes grow the aisle\u2019s band)', () => {
  it('the org wire reads the band only for an aisle-born sheet', () => {
    expect(orgWire).toContain("import { readCadenceLaw } from '@/lib/cadence-law';");
    expect(orgWire).toContain("import { readCategoryBand, type CadenceBand } from '@/lib/cadence-band';");
    expect(orgWire).toContain('if (sheet.walkCategoryId) {');
    expect(orgWire).toContain('const law = await readCadenceLaw(db);');
    expect(orgWire).toContain('aisleBand = await readCategoryBand(db, sheet.walkCategoryId, law, new Date());');
  });

  it('the branch wire reads the band only for an aisle-born sheet', () => {
    expect(branchWire).toContain("import { readCadenceLaw } from '@/lib/cadence-law';");
    expect(branchWire).toContain("import { readCategoryBand, type CadenceBand } from '@/lib/cadence-band';");
    expect(branchWire).toContain('if (sheet.walkCategoryId) {');
    expect(branchWire).toContain('const law = await readCadenceLaw(db);');
    expect(branchWire).toContain('aisleBand = await readCategoryBand(db, sheet.walkCategoryId, law, new Date());');
  });

  it('the band rides additively (the name line stays byte-identical)', () => {
    expect(orgWire).toContain('walkAisle: sheet.walkAisle?.name ?? null,');
    expect(orgWire).toContain('walkAisleBand: aisleBand?.band ?? null,');
    expect(orgWire).toContain('walkAisleDaysSince: aisleBand?.daysSince ?? null,');
    expect(branchWire).toContain('walkAisle: sheet.walkAisle?.name ?? null,');
    expect(branchWire).toContain('walkAisleBand: aisleBand?.band ?? null,');
    expect(branchWire).toContain('walkAisleDaysSince: aisleBand?.daysSince ?? null,');
  });

  it('the read class stays honest (two bounded reads, documented)', () => {
    expect(orgWire).toContain("v2.244.0 THE AISLE'S ECHO");
    expect(branchWire).toContain("v2.244.0 THE AISLE'S ECHO");
    expect(orgWire).toContain('THE READ CLASS');
    expect(branchWire).toContain('THE READ CLASS');
  });
});

// ── THE ECHO'S FACE ──────────────────────────────────────────────────────

describe('the echo\u2019s face (sibling band chips, both sides of the glass)', () => {
  it('the drill wears the band chip after the name chip', () => {
    expect(drill).toContain('data-testid="sheet-drill-origin-aisle"');
    expect(drill).toContain('data-testid="sheet-drill-origin-aisle-band"');
    expect(drill).toContain("data?.origin === 'walk-door' && data?.walkAisle && data?.walkAisleBand && (");
    expect(drill).toContain('${bandHouse(data.walkAisleBand).chip}');
    expect(drill).toContain('{chipLabel(data.walkAisleBand)}');
    expect(drill).toContain("the aisle's own cadence — ${daysVoice({ band: data.walkAisleBand, daysSince: data.walkAisleDaysSince ?? null })}");
    expect(drill).toContain('tabular-nums ${bandHouse(data.walkAisleBand).chip}');
  });

  it('the branch face wears the band chip after the name chip', () => {
    expect(panel).toContain('data-testid="stocktake-sheet-origin-aisle"');
    expect(panel).toContain('data-testid="stocktake-sheet-origin-aisle-band"');
    expect(panel).toContain("detail.origin === 'walk-door' && detail.walkAisle && detail.walkAisleBand && (");
    expect(panel).toContain('${bandHouse(detail.walkAisleBand).chip}');
    expect(panel).toContain('{chipLabel(detail.walkAisleBand)}');
    expect(panel).toContain("the aisle's own cadence — ${daysVoice({ band: detail.walkAisleBand, daysSince: detail.walkAisleDaysSince ?? null })}");
    expect(panel).toContain('tabular-nums ${bandHouse(detail.walkAisleBand).chip}');
  });

  it('sibling spans, never rewrites (the v2.242.0 chips stay byte-identical)', () => {
    expect(drill).toContain('the walk order named {data.walkAisle}');
    expect(drill).toContain('title="the walk order named this aisle — the census knows where the door opened"');
    expect(panel).toContain('the walk order named {detail.walkAisle}');
    expect(panel).toContain('title="the walk order named this aisle — the census knows where the door opened"');
    // the birth chip law stays byte-identical
    expect(drill).toContain('born at a walk door');
    expect(panel).toContain('born at a walk door');
  });

  it('both types grow the band fields (additive + optional)', () => {
    expect(drill).toContain("walkAisleBand?: 'fresh' | 'stale' | 'beyond' | 'never' | null;");
    expect(drill).toContain('walkAisleDaysSince?: number | null;');
    expect(panel).toContain("walkAisleBand?: 'fresh' | 'stale' | 'beyond' | 'never' | null;");
    expect(panel).toContain('walkAisleDaysSince?: number | null;');
  });
});
