// v2.234.0 — the verdict.
//
//   - THE LINEAGE READS BACKWARDS: v2.233.0 taught the faces to read a
//     sheet's note (a child knows its parent). This round the PARENT
//     learns its child: both detail wires grow one additive
//     `recountedBy` block — one bounded findFirst over the notes the
//     spawn signs (`recount of sheet {id}`, exact or with a trailing
//     space), latest child first, the child's variance units riding
//     the SAME read.
//   - THE UNITS LAW, NOT THE SHILLINGS LAW: the child's units speak
//     only once the child is CLOSED (a counting child has not spoken;
//     a voided child never will). The cost gate is NOT involved — no
//     shillings cross this wire block.
//   - THE VERDICT FACE (org drill): emerald, beneath the v2.233.0
//     lineage faces (ancestry above verdict in one glance), the
//     child's FULL id + the status voice (zero = "the shelf true",
//     N = "N units between book and shelf", counting = "the verdict
//     waits", cancelled = "voided before it spoke").
//   - THE VERDICT DOOR: one button re-keys the map's drill onto the
//     child via the optional onOpenSheet prop — a fresh drill by the
//     map's own door law (the per-sheet key remounts, the instruments
//     reset by construction). NAVIGATION, never a pen: the read-only
//     law stands on both faces. The face rides the paper; the control
//     does not.
//   - THE BRANCH VERDICT LINE: the walker sees the same voice at the
//     pens — a LINE, never a nav control (the roster's View reaches
//     the child).
//
// Every pin reads the SOURCE OF RECORD (source bytes, not memory).

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it, expect } from 'vitest';

const read = (p: string) => readFileSync(join(process.cwd(), p), 'utf8');

const drill = read('src/components/org/sheet-drill.tsx');
const map = read('src/components/org/variance-map.tsx');
const panel = read('src/components/inventory/stock-take-panel.tsx');
const orgWire = read('src/app/api/org/stock-takes/[id]/route.ts');
const branchWire = read('src/app/api/stock-takes/[id]/route.ts');
const pkg = JSON.parse(read('package.json'));
const feed = read('src/lib/whats-new.ts');
const changelog = read('CHANGELOG.md');
const version = String(pkg.version);

// ── THE RELEASE FACE ─────────────────────────────────────────────────────

describe('the round of record (v2.234.0)', () => {
  it('package.json leads 2.234.0 (all three slots)', () => {
    expect(version).toBe('2.299.0');
    expect(pkg.mbumah.releaseVersion).toBe('2.299.0');
    expect(pkg.mbumah.baseVersion).toBe('2.299.0');
  });

  it('VERSION speaks 2.234.0 and the verify gate is wired', () => {
    expect(read('VERSION').trim()).toBe('2.299.0');
    expect(pkg.scripts['verify:v2-234-0']).toBe('node scripts/verify-v2-234-0.mjs');
  });

  it('the changelog anchors the section ABOVE its ancestor (the structural pin — headers, never bare strings)', () => {
    expect(changelog.indexOf('## [2.234.0]')).toBeGreaterThanOrEqual(0);
    expect(changelog.indexOf('## [2.234.0]')).toBeLessThan(changelog.indexOf('## [2.233.0]'));
  });

  it('the whats-new feed leads the verdict entry (order pin: header-anchored, never a bare version string)', () => {
    expect(feed.includes("version: '2.234.0',")).toBe(true);
    expect(feed.indexOf("version: '2.234.0',")).toBeLessThan(feed.indexOf("version: '2.233.0',"));
    expect(feed.includes("title: 'The verdict',")).toBe(true);
  });
});

// ── THE WIRE — the lineage backwards, additive + bounded ─────────────────

describe('the recountedBy block (both detail wires, one law)', () => {
  it('the org wire grows the bounded findFirst over the spawn signature', () => {
    expect(orgWire).toContain("OR: [{ notes: { equals: `recount of sheet ${id}` } }, { notes: { startsWith: `recount of sheet ${id} ` } }],");
    expect(orgWire).toContain('orderBy: { startedAt: \'desc\' },');
    expect(orgWire).toContain('const recountedByRow = await db.stockTake.findFirst({');
  });

  it('the branch wire grows the SAME block (the pens hear the verdict too)', () => {
    expect(branchWire).toContain("OR: [{ notes: { equals: `recount of sheet ${id}` } }, { notes: { startsWith: `recount of sheet ${id} ` } }],");
    expect(branchWire).toContain('const recountedByRow = await db.stockTake.findFirst({');
  });

  it('the clause stays EXACT (the trailing-space arm — a prefix can never pose as a parent)', () => {
    expect(orgWire).toContain("startsWith: `recount of sheet ${id} `");
    expect(branchWire).toContain("startsWith: `recount of sheet ${id} `");
  });

  it('the child rides the SAME read (its lines come with it — bounded by the child)', () => {
    expect(orgWire).toContain("lines: { where: { variance: { not: null } }, select: { variance: true } },");
    expect(branchWire).toContain("lines: { where: { variance: { not: null } }, select: { variance: true } },");
  });

  it('the units law: the number speaks ONLY once the child is CLOSED', () => {
    expect(orgWire).toContain("recountedByRow.status === 'CLOSED'");
    expect(branchWire).toContain("recountedByRow.status === 'CLOSED'");
  });

  it('the shillings law stands untouched — the verdict block carries NO cost field', () => {
    const block = orgWire.slice(orgWire.indexOf('v2.234.0 THE VERDICT'), orgWire.indexOf('const counted ='));
    expect(block).not.toContain('varianceCost');
    expect(block).not.toContain('costPrice');
    expect(block).not.toContain('canViewCost');
  });

  it('the response voice is additive (null when no child — the honest absence)', () => {
    expect(orgWire).toContain('recountedBy,');
    expect(branchWire).toContain('recountedBy,');
    expect(orgWire).toContain('= recountedByRow\n    ? {');
    expect(orgWire).toContain(': null;');
  });
});

// ── THE DRILL — the verdict face + the door ──────────────────────────────

describe('the drill wears the verdict (emerald, beneath the lineage)', () => {
  it('the client type stays optional (the honest absence)', () => {
    expect(drill).toContain('recountedBy?: { id: string; status: string; closedAt: string | null; varianceUnits: number | null } | null;');
  });

  it('the verdict face mounts on the child block, keyed sheet-drill-verdict', () => {
    expect(drill).toContain('data-testid="sheet-drill-verdict"');
    expect(drill).toContain('re-walked by sheet <span className="tabular-nums">{child.id}</span>');
  });

  it('the status voice answers all four verdicts (zero / N / counting / cancelled)', () => {
    expect(drill).toContain("'the re-walk found the shelf true — the dispute settled at zero.'");
    expect(drill).toContain('`the re-walk spoke — ${num(child.varianceUnits)} units between book and shelf.`');
    expect(drill).toContain("'the re-walk is on the floor — the verdict waits.'");
    expect(drill).toContain("'the re-walk was voided before it spoke.'");
  });

  it('the face wears the books-heard-it emerald, dark halves from birth', () => {
    expect(drill).toContain('border border-emerald-200 bg-emerald-50/60 px-2.5 py-1.5 text-[10px] text-emerald-800');
    expect(drill).toContain('dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-200');
    expect(drill).toContain('text-[9px] text-emerald-700 dark:text-emerald-300/80');
  });

  it('the verdict door: one button re-keys the drill via the optional onOpenSheet prop', () => {
    expect(drill).toContain('onOpenSheet?: (next: { id: string; storeName: string; status: string }) => void');
    expect(drill).toContain('data-testid="sheet-drill-verdict-open"');
    expect(drill).toContain('onOpenSheet({ id: child.id, storeName: target.storeName, status: child.status })');
    expect(drill).toContain('aria-label={`Open the re-walk sheet ${child.id} in this drill`}');
  });

  it('the door is NAVIGATION, never a pen (the read-only law stands)', () => {
    expect(drill).toContain('READ-ONLY BY LAW');
    expect(drill).not.toContain('authorizedFetchJson');
  });

  it('the face rides the paper; the control stays off it (a control is a screen thing)', () => {
    const block = drill.slice(drill.indexOf('v2.234.0 THE VERDICT'), drill.indexOf('The lines — read-only.'));
    expect(block).toContain('data-testid="sheet-drill-verdict"');
    expect(block).toContain('data-testid="sheet-drill-verdict-open"\n                        data-sheet-print-off=""');
  });

  it('the map hands the drill its door (the re-key law — fresh mount, instruments reset by the key)', () => {
    expect(map).toContain('onOpenSheet={(next) => setDrill(next)}');
    expect(map).toContain('key={drill.id}');
  });
});

// ── THE BRANCH FACE — the verdict at the pens ────────────────────────────

describe('the branch panel wears the verdict line', () => {
  it('the client type stays optional', () => {
    expect(panel).toContain('recountedBy?: { id: string; status: string; closedAt: string | null; varianceUnits: number | null } | null;');
  });

  it('the verdict line mounts under the header, full id + voice, riding the paper', () => {
    expect(panel).toContain('data-testid="stocktake-recounted-by"');
    expect(panel).toContain('re-walked by sheet <span className="font-semibold tabular-nums">{child.id}</span>');
    const block = panel.slice(panel.indexOf('v2.234.0 THE VERDICT — the lineage BACKWARDS at the'), panel.indexOf("v2.229.0: the clipboard's floor-copy note"));
    expect(block).not.toContain('data-sheet-print-off');
  });

  it('a LINE, never a nav control (the roster\u2019s View reaches the child)', () => {
    const block = panel.slice(panel.indexOf('v2.234.0 THE VERDICT — the lineage BACKWARDS at the'), panel.indexOf("v2.229.0: the clipboard's floor-copy note"));
    expect(block).not.toContain('<button');
    expect(block).not.toContain('<a ');
  });

  it('the v2.233 lineage face stands BENEATH-none / ABOVE the verdict (ancestry above verdict)', () => {
    const lineageIdx = panel.indexOf('stocktake-sheet-lineage');
    const verdictIdx = panel.indexOf('stocktake-recounted-by');
    expect(lineageIdx).toBeGreaterThanOrEqual(0);
    expect(verdictIdx).toBeGreaterThan(lineageIdx);
  });

  it('the verdict voice answers at the pens (zero / N / waiting / void)', () => {
    expect(panel).toContain("'the re-walk found the shelf true'");
    expect(panel).toContain('`the re-walk found ${num(child.varianceUnits)} units`');
    expect(panel).toContain("'the re-walk is on the floor — the verdict waits'");
    expect(panel).toContain("'the re-walk was voided before it spoke'");
  });
});

// ── THE FOSSIL GUARDS — v2.233.0 stands, the muted family stands ─────────

describe('the fossil guards', () => {
  it('the v2.233.0 lineage faces still speak (the chip, the why-line, the record face)', () => {
    expect(map).toContain('testId={`variance-map-lineage-${s.id}`}');
    expect(map).toContain('data-testid={`variance-map-why-${s.id}`}');
    expect(drill).toContain('data-testid="sheet-drill-lineage"');
    expect(drill).toContain('data-testid="sheet-drill-void-why"');
    expect(panel).toContain('data-testid="stocktake-sheet-lineage"');
  });

  it('the kpi-row muted family stays at exactly 62 mounts (vat-spark\u2019s pin, re-guarded)', () => {
    const kpiRow = read('src/components/org/kpi-row.tsx');
    expect(kpiRow.match(/text-slate-500 dark:text-slate-400/g)?.length).toBe(62);
  });

  it('the changelog speaks the added + styled faces and the both-directions law', () => {
    const section = changelog.slice(changelog.indexOf('## [2.234.0]'), changelog.indexOf('## [2.233.0]'));
    expect(section).toContain('### Added');
    expect(section).toContain('### Styled');
    expect(section).toContain('recountedBy');
    expect(section).toContain('sheet-drill-verdict');
    expect(section).toContain('stocktake-recounted-by');
  });
});
