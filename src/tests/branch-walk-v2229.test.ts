// v2.229.0 — the branch walk.
//
//   - THE BRANCH WALK: the clipboard's branch-side twin. The branch
//     stocktake face is where the floor actually walks, so IT now lays
//     the sheet on the page: while the sheet face is open the body
//     carries the SAME `sheet-printing` class the org drill reads (a
//     mount/unmount lifecycle effect keyed on a boolean derivation —
//     hooks above the early return, stable across refetches), and the
//     panel's card wears the drill's own vocabulary
//     (data-sheet-print-overlay / data-sheet-print /
//     data-sheet-print-off / data-sheet-clipboard). While the sheet
//     still COUNTS, its paper grows the clipboard's three print-only
//     fittings — the floor-copy note, an EMPTY COUNT BOX on every
//     line, the signature rules at the foot. CLOSED and CANCELLED
//     sheets keep the record face — the paper's mode IS the sheet's
//     status, never a toggle.
//   - THE PAPER NAMES ITS BRANCH: the detail wire grows an additive
//     `store` block (id / name / code — the org drill's wire's own
//     shape) and the sheet's header line wears the branch's name — a
//     ring binder holds five branches' walks.
//   - THE SHEET'S DOORS AT BRANCH LEVEL: Print (mode-conditional aria)
//     and CSV under the SAME gate (a sheet that froze no lines prints
//     and exports nothing but silence); the file rides the SAME pure
//     sheetLinesCsv the drill exports — imported, never re-invented.
//   - THE SHARED LINES MARK: both faces wear `data-sheet-lines` and
//     the print CSS grows additive selectors for it — one scroll-clamp
//     release and one line-hygiene law serve every sheet's paper, the
//     drill's testid-keyed rules untouched.
//
// Every pin reads the SOURCE OF RECORD (source bytes, not memory).

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it, expect } from 'vitest';

const read = (p: string) => readFileSync(join(process.cwd(), p), 'utf8');

const panel = read('src/components/inventory/stock-take-panel.tsx');
const sheetDrill = read('src/components/org/sheet-drill.tsx');
const globals = read('src/app/globals.css');
const detailWire = read('src/app/api/stock-takes/[id]/route.ts');
const pkg = JSON.parse(read('package.json'));
const changelog = read('CHANGELOG.md');
const feed = read('src/lib/whats-new.ts');
const version = String(pkg.version);
const watcher = read('src/tests/a11y-shell-v2148.test.ts');

// ── THE RELEASE FACE ─────────────────────────────────────────────────────

describe('the round of record (v2.229.0)', () => {
  it('package.json leads 2.229.0 (all three slots)', () => {
    expect(version).toBe('2.251.0');
    expect(pkg.mbumah.releaseVersion).toBe('2.251.0');
    expect(pkg.mbumah.baseVersion).toBe('2.251.0');
  });

  it('VERSION speaks 2.229.0 and the verify gate is wired', () => {
    expect(read('VERSION').trim()).toBe('2.251.0');
    expect(pkg.scripts['verify:v2-229-0']).toBe('node scripts/verify-v2-229-0.mjs');
  });

  it('the changelog anchors the section ABOVE its ancestor (the structural pin — headers, never bare strings)', () => {
    expect(changelog.indexOf('## [2.230.0]')).toBeGreaterThanOrEqual(0);
    expect(changelog.indexOf('## [2.230.0]')).toBeLessThan(changelog.indexOf('## [2.229.0]'));
  });

  it('the whats-new feed leads the sheet-lens entry (order pin: header-anchored, never a bare version string)', () => {
    expect(feed.includes("version: '2.230.0',")).toBe(true);
    expect(feed.indexOf("version: '2.230.0',")).toBeLessThan(feed.indexOf("version: '2.229.0',"));
    expect(feed.includes('title: "The sheet\u0027s lens",')).toBe(true);
  });

  it('the treadmill bumped the version pins (the watchers track the head)', () => {
    expect(watcher).toContain("expect(pkg.version).toBe('2.251.0');");
    expect(watcher).toContain("expect(whatsNewUnreadCount('2.110.0')).toBe(143);");
  });

  it('the counter family rides +1 (120/121/122/153 — the trail names the round)', () => {
    const counter = read('src/tests/console-changelog.test.ts');
    expect(counter).toContain("expect(whatsNewUnreadCount('2.110.0')).toBe(143);");
    expect(counter).toContain("expect(whatsNewUnreadCount('2.109.0')).toBe(144);");
    expect(counter).toContain("expect(whatsNewUnreadCount('2.108.0')).toBe(145);");
    expect(counter).toContain("expect(whatsNewUnreadCount('2.77.0')).toBe(176);");
    expect(counter).toContain('// v2.229.0: the branch-walk entry joins the feed (+1 on every anchor → 120/121/122/153)');
  });
});

// ── THE BRANCH WALK — the panel's paper ──────────────────────────────────

describe('the branch walk (the clipboard\u2019s branch-side twin)', () => {
  it('the body-class gate rides ABOVE the early return (the v2.226 lesson bank)', () => {
    expect(panel.indexOf("document.body.classList.add('sheet-printing')")).toBeGreaterThan(-1);
    expect(panel.indexOf("document.body.classList.add('sheet-printing')")).toBeLessThan(panel.indexOf('if (!storeId) return null;'));
  });

  it('the gate is a boolean derivation — stable across refetches, removed on unmount', () => {
    expect(panel).toContain('const sheetPaperOpen = !!(openSheetId && detail);');
    expect(panel).toContain('document.body.classList.remove(\'sheet-printing\')');
  });

  it('the paper\u2019s mode IS the sheet\u2019s status (one derivation, the drill\u2019s own law)', () => {
    expect(panel).toContain("const isClipboard = detail?.status === 'COUNTING';");
  });

  it('the card carries the overlay mark; the chrome stays off the paper', () => {
    expect(panel).toContain('data-sheet-print-overlay=""');
    expect(panel).toContain('<CardHeader className="pb-3" data-sheet-print-off="">');
  });

  it('the sheet face carries the print mark and the clipboard attribute conditionally (never hardcoded)', () => {
    expect(panel).toContain('data-sheet-print=""');
    expect(panel).toContain("{...(isClipboard ? { 'data-sheet-clipboard': '' } : {})}");
  });

  it('the floor-copy note exists and speaks the branch\u2019s walk', () => {
    expect(panel).toContain('data-sheet-clipboard-note=""');
    expect(panel).toContain('floor copy — walk the shelves, write what you see; this app holds the pens when you&apos;re back.');
  });

  it('every line gets its count box (the box mounts inside the line map)', () => {
    const lines = panel.split('<div data-sheet-lines=""')[1].split('the walk\u2019s witnesses')[0];
    expect(lines.includes('data-sheet-count-box=""')).toBe(true);
    expect(lines.includes('line.countedQty')).toBe(true);
  });

  it('the box is EMPTY (the shelf\u2019s ask, not the system\u2019s echo)', () => {
    const box = panel.split('data-sheet-count-box=""')[1].split('</span>\n                    )}')[0];
    expect(box.includes('counted')).toBe(true);
    expect(!/\{num\(/.test(box)).toBe(true);
  });

  it('the walk\u2019s witnesses at the foot (counted by / checked by / date)', () => {
    expect(panel).toContain('data-testid="stocktake-signatures"');
    expect(panel).toContain('data-sheet-clipboard-signatures=""');
    expect(panel).toContain('counted by');
    expect(panel).toContain('checked by');
  });

  it('the lines container wears the shared lines mark (the print law reads one attribute on both faces)', () => {
    expect(panel).toContain('<div data-sheet-lines="" className="max-h-[46vh] space-y-1.5 overflow-y-auto pr-1">');
    expect(sheetDrill).toContain('<ul data-testid="sheet-drill-lines-list" data-sheet-lines=""');
  });

  it('the paper names its branch — the wire\u2019s own store block, never a guess', () => {
    expect(panel).toContain('data-testid="stocktake-store-name"');
    expect(panel).toContain('{detail.store.name}');
  });

  it('the Print door speaks both modes for the ear', () => {
    expect(panel).toContain('data-testid="stocktake-print"');
    expect(panel).toContain("`Print the floor's clipboard — ${detail.lines.length} lines with empty count boxes`");
    expect(panel).toContain('`Print all ${detail.lines.length} lines of the count sheet at ${detail.store.name}`');
  });

  it('the CSV door exists and rides the SAME builder the drill exports (never re-invented)', () => {
    expect(panel).toContain('data-testid="stocktake-export"');
    expect(panel).toContain("import { sheetLinesCsv } from '@/components/org/sheet-drill';");
    expect(panel).toContain('const csv = sheetLinesCsv(detail.lines, { costGated: sheetCostGated });');
  });

  it('the file speaks the WHOLE sheet and names the branch (the drill\u2019s filename law)', () => {
    expect(panel).toContain("const name = `count-sheet-${detail.store.code ?? detail.store.name}-${stamp}-${detail.status.toLowerCase()}.csv`;");
    // v2.231.0 RE-PIN (the head round evolved the shared surface): the
    // branch face now speaks `shownLines` — the walk's instruments
    // narrow the READING. The law this pin always guarded is the FILE:
    // the export reads the WHOLE sheet (detail.lines), never the
    // narrowed list — the reading narrows, the sheet never does.
    expect(panel.includes('sheetLinesCsv(detail.lines,')).toBe(true);
    expect(panel.includes('sheetLinesCsv(shownLines')).toBe(false);
  });

  it('the branch cost gate is the panel\u2019s own prop (absence, never a hidden zero)', () => {
    expect(panel).toContain('const sheetCostGated = !canViewCost;');
  });

  it('both doors mount under the SAME gate (a line-less sheet prints and exports nothing but silence)', () => {
    const doors = panel.split("the sheet's two doors")[1].split('← all sheets')[0];
    expect(doors.includes("detail.lines.length > 0 && (")).toBe(true);
    expect(doors.includes('data-testid="stocktake-print"')).toBe(true);
    expect(doors.includes('data-testid="stocktake-export"')).toBe(true);
  });

  it('the controls stay off the paper (back, count inputs, close zone, the result faces)', () => {
    expect(panel).toContain('data-testid="stocktake-back"');
    expect(panel).toMatch(/data-sheet-print-off="">\s*\n\s*\{detail\.lines\.length > 0 && \(/);
    expect(panel).toContain('<span className="flex items-center gap-1" data-sheet-print-off="">');
    expect(panel).toContain('<div className="space-y-2" data-sheet-print-off="">');
    expect(panel).toContain('data-testid="stocktake-cancelled-face" data-sheet-print-off=""');
    expect(panel).toContain('data-testid="stocktake-close-success" data-sheet-print-off=""');
  });
});

// ── THE WIRE — the paper names its branch ────────────────────────────────

describe('the detail wire grows the store block (additive, zero new fetch)', () => {
  it('the include selects the sheet\u2019s own store (id / name / code)', () => {
    expect(detailWire).toContain('store: { select: { id: true, name: true, code: true } },');
  });

  it('the response carries the store truth', () => {
    expect(detailWire).toContain('store: { id: sheet.store.id, name: sheet.store.name, code: sheet.store.code },');
  });
});

// ── THE STYLESHEET — the shared law, additive ────────────────────────────

describe('the branch walk stylesheet (the shared lines law)', () => {
  it('the shared lines release exists (one scroll-clamp release for every sheet\u2019s paper)', () => {
    expect(globals).toContain('body.sheet-printing [data-sheet-print] [data-sheet-lines] {\n    max-height: none !important;\n    overflow: visible !important;\n  }');
  });

  it('the branch line hygiene (the row\u2019s own element — a line and its box never split)', () => {
    expect(globals).toContain('body.sheet-printing [data-sheet-print] [data-sheet-lines] > div {');
    const block = globals.split('[data-sheet-lines] > div {')[1].split('}')[0];
    expect(block.includes('break-inside: avoid;')).toBe(true);
  });

  it('the drill\u2019s own testid-keyed rules stand untouched (additive, never a rewrite)', () => {
    expect(globals).toContain('body.sheet-printing [data-sheet-print] [data-testid="sheet-drill-lines-list"] {');
    expect(globals).toContain('body.sheet-printing [data-sheet-print] [data-testid="sheet-drill-lines-list"] > li {');
  });

  it('the v2.228 screen hide and print flips stand (the clipboard fittings keep their law)', () => {
    expect(globals).toContain('[data-sheet-clipboard] [data-sheet-count-box],');
    expect(globals).toContain('[data-sheet-clipboard] [data-sheet-clipboard-signatures] { display: none; }');
    expect(globals).toContain('body.sheet-printing [data-sheet-clipboard] [data-sheet-clipboard-note] {');
  });

  it('the floor note wears the amber family (the sheet\u2019s hue)', () => {
    expect(panel).toContain('border border-dashed border-amber-300 bg-amber-50/60');
  });

  it('the doors wear the AMBER focus ring (the branch face\u2019s hue — the drill\u2019s own ring form)', () => {
    const doors = panel.split('data-testid="stocktake-print"')[1].split('← all sheets')[0];
    expect(doors.includes('focus:ring-amber-500/40')).toBe(true);
  });
});
