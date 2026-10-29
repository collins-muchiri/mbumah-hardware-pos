// v2.233.0 — the lineage.
//
//   - THE NOTE BECOMES A RECORD: a sheet's note is now READ, not just
//     echoed. The recount spawn's signature (`recount of sheet {id}`)
//     and the cancel path's reason both arrive as raw text on wires
//     that ALREADY carry them — this round teaches the faces to parse
//     the note and wear it: the amber lineage chip on three rosters,
//     the why-line under a cancelled row, the full-record faces in
//     the drills.
//   - ZERO NEW FETCHES: the kpi wire has carried `notes` on both the
//     openSheets and recentSheets rows since the map was born, the
//     drill wire has carried `notes: sheet.notes` since its own —
//     this round adds NO query, NO column, NO endpoint. Pure faces.
//   - THE HONEST ABSENCE: no note → no chip, no why-line, no face —
//     an absent control never lies. A plain (non-recount) note keeps
//     the verbatim text it always had — the reader interprets, the
//     record stays verbatim.
//   - THE 3:1 BAR AND THE DARK HALVES: the chip wears the sheet's
//     amber house (800-family text on the 50-wash light, 200-family
//     on the 500/10 wash dark), tabular-nums on the id, the FULL id
//     on BOTH title and aria-label (the eye gets the whisper, the
//     ear gets the record).
//
// Every pin reads the SOURCE OF RECORD (source bytes, not memory),
// except the parser itself — PURE by law, so the pins exercise it
// directly (the branch-variance precedent: pure org helpers are
// imported, not quoted).

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it, expect } from 'vitest';
import { parseSheetLineage, lineageShortId } from '@/components/org/primitives';

const read = (p: string) => readFileSync(join(process.cwd(), p), 'utf8');

const primitives = read('src/components/org/primitives.tsx');
const map = read('src/components/org/variance-map.tsx');
const drill = read('src/components/org/sheet-drill.tsx');
const panel = read('src/components/inventory/stock-take-panel.tsx');
const kpiRow = read('src/components/org/kpi-row.tsx');
const kpiWire = read('src/app/api/org/kpi-summary/route.ts');
const drillWire = read('src/app/api/org/stock-takes/[id]/route.ts');
const pkg = JSON.parse(read('package.json'));
const feed = read('src/lib/whats-new.ts');
const changelog = read('CHANGELOG.md');
const version = String(pkg.version);

// ── THE RELEASE FACE ─────────────────────────────────────────────────────

describe('the round of record (v2.233.0)', () => {
  it('package.json leads 2.233.0 (all three slots)', () => {
    expect(version).toBe('2.252.0');
    expect(pkg.mbumah.releaseVersion).toBe('2.252.0');
    expect(pkg.mbumah.baseVersion).toBe('2.252.0');
  });

  it('VERSION speaks 2.233.0 and the verify gate is wired', () => {
    expect(read('VERSION').trim()).toBe('2.252.0');
    expect(pkg.scripts['verify:v2-233-0']).toBe('node scripts/verify-v2-233-0.mjs');
  });

  it('the changelog anchors the section ABOVE its ancestor (the structural pin — headers, never bare strings)', () => {
    expect(changelog.indexOf('## [2.233.0]')).toBeGreaterThanOrEqual(0);
    expect(changelog.indexOf('## [2.233.0]')).toBeLessThan(changelog.indexOf('## [2.232.0]'));
  });

  it('the whats-new feed leads the lineage entry (order pin: header-anchored, never a bare version string)', () => {
    expect(feed.includes("version: '2.233.0',")).toBe(true);
    expect(feed.indexOf("version: '2.233.0',")).toBeLessThan(feed.indexOf("version: '2.232.0',"));
    expect(feed.includes("title: 'The lineage',")).toBe(true);
  });
});

// ── THE READER — pure, imported, exercised ───────────────────────────────

describe('the lineage reader (parseSheetLineage — pure by law)', () => {
  it('reads the recount signature: kind, full source id, empty remainder', () => {
    const out = parseSheetLineage('recount of sheet cmvra1zlw00002kd93satp4gq5');
    expect(out).not.toBeNull();
    expect(out?.kind).toBe('recount');
    expect(out?.sourceSheetId).toBe('cmvra1zlw00002kd93satp4gq5');
    expect(out?.remainder).toBe('');
    expect(out?.text).toBe('recount of sheet cmvra1zlw00002kd93satp4gq5');
  });

  it('reads the signature case-insensitively and keeps the remainder verbatim', () => {
    const out = parseSheetLineage('RECOUNT OF SHEET cmvrbljn  floor walk two — key B took the count');
    expect(out?.kind).toBe('recount');
    expect(out?.sourceSheetId).toBe('cmvrbljn');
    expect(out?.remainder).toBe('floor walk two — key B took the count');
  });

  it('tolerates padded whitespace on both ends and after the id', () => {
    const out = parseSheetLineage('  recount of sheet   abc123   ');
    expect(out?.kind).toBe('recount');
    expect(out?.sourceSheetId).toBe('abc123');
    expect(out?.remainder).toBe('');
  });

  it('the id charset is [\\w-]+ — dashes ride, whitespace does not', () => {
    expect(parseSheetLineage('recount of sheet ab-cd_99')?.sourceSheetId).toBe('ab-cd_99');
    // "sheets" (plural) fails the literal + whitespace clause → a plain note
    expect(parseSheetLineage('recount of sheets x')?.kind).toBe('note');
    // no id at all → a plain note
    expect(parseSheetLineage('recount of sheet ')?.kind).toBe('note');
  });

  it('a plain note is a note — the record stays verbatim', () => {
    const out = parseSheetLineage('month-end Juja count');
    expect(out?.kind).toBe('note');
    expect(out?.sourceSheetId).toBeNull();
    expect(out?.remainder).toBe('');
    expect(out?.text).toBe('month-end Juja count');
  });

  it('the honest absence: null, undefined, empty and whitespace notes read null', () => {
    expect(parseSheetLineage(null)).toBeNull();
    expect(parseSheetLineage(undefined)).toBeNull();
    expect(parseSheetLineage('')).toBeNull();
    expect(parseSheetLineage('   ')).toBeNull();
  });

  it('the whisper: the short id keeps the last six and marks the ellipsis; short ids ride whole', () => {
    expect(lineageShortId('cmvra1zlw00002kd93satp4gq5')).toBe('…tp4gq5');
    expect(lineageShortId('abc123')).toBe('abc123');
    expect(lineageShortId(null)).toBe('');
  });

  it('the reader is declared in the source of record with its law comment', () => {
    expect(primitives).toContain('export function parseSheetLineage');
    expect(primitives).toContain('export const lineageShortId');
    expect(primitives).toContain("kind: 'recount' | 'note'");
    expect(primitives).toContain('PURE by law');
  });
});

// ── THE SHARED CHIP — one house style ────────────────────────────────────

describe('the LineageChip (one house style for every roster)', () => {
  it('renders the abbreviated id and carries the FULL voice on title AND aria-label', () => {
    expect(primitives).toContain('data-testid={testId}');
    expect(primitives).toContain('title={voice}');
    expect(primitives).toContain('aria-label={voice}');
    expect(primitives).toContain("const voice = `recount of sheet ${lineage.sourceSheetId}`;");
    expect(primitives).toContain('recount of {lineageShortId(lineage.sourceSheetId)}');
  });

  it('wears the amber house at the 3:1 bar, dark halves from birth, tabular id', () => {
    expect(primitives).toContain('bg-amber-50 px-1.5 py-0.5 text-[9px] font-semibold tabular-nums text-amber-800 ring-1 ring-amber-200');
    expect(primitives).toContain('dark:bg-amber-500/10 dark:text-amber-200 dark:ring-amber-500/30');
  });

  it('the chip takes its testId from the caller (each face keys its own)', () => {
    expect(primitives).toContain('testId: string;');
    expect(map).toContain('testId={`variance-map-lineage-${s.id}`}');
    expect(panel).toContain('testId={`stocktake-lineage-${sheet.id}`}');
  });
});

// ── THE ORG MAP — the rosters wear the lineage ───────────────────────────

describe('the variance map reads its rosters (zero new fetch)', () => {
  it('imports the reader and the chip from the primitives', () => {
    expect(map).toContain('parseSheetLineage, LineageChip,');
  });

  it('the recent roster wears the chip beside the status, keyed per sheet', () => {
    expect(map).toContain('{lineage?.kind === \'recount\' && lineage.sourceSheetId && (');
    expect(map).toContain('testId={`variance-map-lineage-${s.id}`}');
  });

  it('a cancelled row with a reason grows the honest why-line (full text on the hover)', () => {
    expect(map).toContain("const whyLine = s.status === 'CANCELLED' && lineage?.kind === 'note' ? lineage.text : null;");
    expect(map).toContain('data-testid={`variance-map-why-${s.id}`}');
    expect(map).toContain('title={whyLine}');
    expect(map).toContain('why: {whyLine}');
  });

  it('the why-line wears the muted family in italic with the row divider', () => {
    expect(map).toContain('w-full truncate border-t border-slate-100 pt-1 text-[10px] italic text-slate-500 dark:border-slate-800 dark:text-slate-400');
  });

  it('the live row upgrades: a lineage replaces the murmur, a plain note keeps the verbatim text', () => {
    expect(map).toContain('{s.notes ? ` · ${s.notes}` : \'\'}');
    expect(map).toContain('testId={`variance-map-lineage-${s.id}`}');
  });

  it('the map still never fetches for the lineage — the observer is the ONLY query', () => {
    // one useQuery in the map: the indicative observer (enabled: false,
    // queryFn throws). No authorizedFetch, no fetch() for sheet notes.
    expect((map.match(/= useQuery/g) ?? []).length).toBe(1);
    expect(map).toContain('the variance map never fetches — it observes the shared currency cache');
    expect(map).not.toContain('authorizedFetchJson');
  });
});

// ── THE DRILL — three faces, one law ─────────────────────────────────────

describe('the drill reads the note as a record', () => {
  it('imports the reader', () => {
    expect(drill).toContain("import { num, timeAgo, parseSheetLineage } from './primitives';");
  });

  it('a recount lineage wears the amber record face with the FULL source id', () => {
    expect(drill).toContain('data-testid="sheet-drill-lineage"');
    expect(drill).toContain('recount of sheet <span className="tabular-nums">{lineage.sourceSheetId}</span>');
    expect(drill).toContain('border border-amber-200 bg-amber-50/60 px-2.5 py-1.5 text-[10px] text-amber-800');
    expect(drill).toContain('dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-200');
  });

  it('the status voice answers all three statuses (counting / closed / cancelled)', () => {
    expect(drill).toContain("'the re-walk is on the floor — these lines were the last dispute.'");
    expect(drill).toContain("'the dispute was re-walked — this sheet is the verdict.'");
    expect(drill).toContain("'the re-walk was voided before it spoke.'");
  });

  it('a remainder rides the lineage face verbatim', () => {
    expect(drill).toContain('{lineage.remainder && <p className="mt-0.5">{lineage.remainder}</p>}');
  });

  it("a cancelled sheet's note earns the why-the-void face; a plain note keeps the verbatim box", () => {
    expect(drill).toContain('data-testid="sheet-drill-void-why"');
    expect(drill).toContain('why the void: {why}');
    expect(drill).toContain('data-testid="sheet-drill-notes"');
  });

  it('all three faces ride the paper — the lineage block carries no print-off mark (v2.234.0 re-pin: the slice ends before the verdict block, whose own CONTROL carries the print-off mark — the FACE does not)', () => {
    const block = drill.slice(drill.indexOf('v2.233.0 THE LINEAGE'), drill.indexOf('v2.234.0 THE VERDICT'));
    expect(block).not.toContain('data-sheet-print-off');
  });

  it('the drill stays READ-ONLY BY LAW — the lineage adds no pen', () => {
    expect(drill).not.toContain('data-testid="sheet-drill-count-input"');
    expect(drill).toContain('READ-ONLY BY LAW');
  });
});

// ── THE BRANCH FACE — the walker sees it too ─────────────────────────────

describe('the branch panel wears the lineage (the pens\u2019 face)', () => {
  it('imports the reader and the chip', () => {
    expect(panel).toContain("import { num, parseSheetLineage, LineageChip } from '@/components/org/primitives';");
  });

  it('the roster row upgrades: chip replaces the recount text, plain notes unchanged', () => {
    expect(panel).toContain('testId={`stocktake-lineage-${sheet.id}`}');
    expect(panel).toContain("return <span className=\"block truncate text-[10px] text-slate-500 dark:text-slate-400\">{sheet.notes}</span>;");
  });

  it('the walker opening a recount sheet sees the lineage under the header — full id, riding the paper', () => {
    expect(panel).toContain('data-testid="stocktake-sheet-lineage"');
    expect(panel).toContain('recount of sheet <span className="font-semibold tabular-nums">{lineage.sourceSheetId}</span>');
    const block = panel.slice(panel.indexOf('v2.233.0 THE LINEAGE'), panel.indexOf('v2.229.0: the clipboard'));
    expect(block).not.toContain('data-sheet-print-off');
  });

  it('the cancelled face names its reason', () => {
    expect(panel).toContain('data-testid="stocktake-cancelled-why"');
    expect(panel).toContain('why: {cancelledFace.notes}');
  });
});

// ── THE WIRE TRUTH — zero new fetches, the notes already rode ────────────

describe('the wires already carried the notes (the zero-new-fetch law)', () => {
  it('the kpi wire selects notes on the open sheets query', () => {
    const openBlock = kpiWire.slice(kpiWire.indexOf("where: { status: 'COUNTING' },"), kpiWire.indexOf('orderBy: { startedAt: \'desc\' },\n        take: 12'));
    expect(openBlock).toContain('notes: true,');
  });

  it('the kpi wire selects notes on the recent roster query', () => {
    const recentBlock = kpiWire.slice(kpiWire.indexOf('orderBy: { startedAt: \'desc\' },\n        take: 12'), kpiWire.indexOf('countedBySheet'));
    expect(recentBlock).toContain('notes: true,');
  });

  it('the kpi wire voices notes on both row families', () => {
    expect((kpiWire.match(/notes: s\.notes,/g) ?? []).length).toBe(2);
  });

  it('the drill wire voices the sheet\u2019s own note', () => {
    expect(drillWire).toContain('notes: sheet.notes,');
  });

  it('this round added NO new endpoint, NO new query param, NO new fetch call', () => {
    expect(kpiWire).not.toContain('recountOf');
    expect(map).not.toContain('useQuery<SheetLineage');
    expect(drill).not.toContain('authorizedFetchJson');
  });
});

// ── THE FOSSIL GUARDS — the families this round must not move ────────────

describe('the fossil guards (the muted family and the round\u2019s elders)', () => {
  it('the kpi-row muted family stays at exactly 62 mounts (vat-spark\u2019s pin, re-guarded here)', () => {
    expect(kpiRow.match(/text-slate-500 dark:text-slate-400/g)?.length).toBe(62);
  });

  it('the drill\u2019s own muted sub-lines keep the house family (slate-500 / dark:slate-400)', () => {
    expect(drill).toContain('text-slate-500 dark:text-slate-400');
  });

  it('the changelog\u2019s v2.233.0 section speaks the added + styled faces', () => {
    const section = changelog.slice(changelog.indexOf('## [2.233.0]'), changelog.indexOf('## [2.232.0]'));
    expect(section).toContain('### Added');
    expect(section).toContain('### Styled');
    expect(section).toContain('parseSheetLineage');
    expect(section).toContain('variance-map-lineage-{id}');
    expect(section).toContain('sheet-drill-void-why');
  });
});
