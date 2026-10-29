// v2.226.0 — the paper trail.
//
//   - THE PRINT FACE: the CSV is the ring binder's file; the print face
//     is its paper. While a PO drill is open the body carries the
//     po-printing class (a mount/unmount lifecycle effect riding ABOVE
//     the null guard — hooks never ride a conditional), and the print
//     stylesheet silences the shell and lays the open document on the
//     page: header, tiles, timeline, lines. The controls (close,
//     finder, CSV/Print, N-of-M) stay off the paper via
//     data-po-print-off — a control is a screen thing. Chips and bars
//     keep their colors (print-color-adjust: exact). Without an open
//     drill the class is absent and printing behaves as before.
//   - THE PRINT BUTTON: names the act for the ear and the eye, absent
//     until the document loads (an absent control never lies);
//     window.print() is the whole machinery.
//   - THE LINE'S NOTE: the drill wire selects items.notes and the face
//     speaks it under the line's name on a quotation hairline —
//     someone's voice on the record, not a system field; a line
//     without one stays quiet (absence stays absent).
//   - THE ROSTER'S COPY: the ledger's window goes portable — a pure
//     CSV builder over the rows the ledger ALREADY holds, the WHOLE
//     WINDOW by law (the finder narrows the reading, never the
//     export), cost-gated cells export EMPTY, BOM + CRLF, csvCell
//     reused verbatim (never re-invented), the day-stamped file name.
//
// Every pin reads the SOURCE OF RECORD (source bytes, not memory).

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it, expect } from 'vitest';

const read = (p: string) => readFileSync(join(process.cwd(), p), 'utf8');

const detailRoute = read('src/app/api/org/purchase-orders/[id]/route.ts');
const ledger = read('src/components/org/po-ledger.tsx');
const drill = read('src/components/org/po-drill.tsx');
const globals = read('src/app/globals.css');
const sheetDrill = read('src/components/org/sheet-drill.tsx');
const pkg = JSON.parse(read('package.json'));
const changelog = read('CHANGELOG.md');
const feed = read('src/lib/whats-new.ts');
const version = String(pkg.version);

// ── THE RELEASE FACE ─────────────────────────────────────────────────────

describe('the round of record (v2.226.0)', () => {
  it('package.json leads 2.226.0 (all three slots)', () => {
    expect(version).toBe('2.258.0');
    expect(pkg.mbumah.releaseVersion).toBe('2.258.0');
    expect(pkg.mbumah.baseVersion).toBe('2.258.0');
  });

  it('the changelog anchors the section ABOVE its ancestor (the structural pin — headers, never bare strings)', () => {
    expect(changelog.indexOf('## [2.226.0]')).toBeGreaterThanOrEqual(0);
    expect(changelog.indexOf('## [2.226.0]')).toBeLessThan(changelog.indexOf('## [2.225.0]'));
  });

  it('whats-new speaks the paper at the head', () => {
    expect(feed.includes("version: '2.226.0',")).toBe(true);
    expect(feed.indexOf("version: '2.226.0',")).toBeLessThan(feed.indexOf("version: '2.225.0',"));
    expect(feed.includes("title: 'The paper trail',")).toBe(true);
  });

  it('the verify gate is wired into package.json', () => {
    expect(pkg.scripts['verify:v2-226-0']).toBe('node scripts/verify-v2-226-0.mjs');
  });
});

// ── THE PRINT FACE ───────────────────────────────────────────────────────

describe('the print face', () => {
  it('gates the shell on the body class the drill owns (mount/unmount, above the null guard)', () => {
    expect(drill).toContain("useEffect(() => {\n    document.body.classList.add('po-printing');\n    return () => document.body.classList.remove('po-printing');\n  }, []);");
    expect(drill.indexOf("document.body.classList.add('po-printing')"))
      .toBeLessThan(drill.indexOf('if (!target) return null;'));
  });

  it('marks the overlay and the card for the stylesheet', () => {
    expect(drill).toContain('data-po-print-overlay=""');
    expect(drill).toContain('data-po-print=""');
  });

  it('marks the controls off the paper (a control is a screen thing)', () => {
    const marks = (drill.match(/data-po-print-off=""/g) ?? []).length;
    expect(marks).toBeGreaterThanOrEqual(5);
  });

  it('the stylesheet silences the shell ONLY while the door is open', () => {
    expect(globals).toContain('body.po-printing * { visibility: hidden; }');
    expect(globals).toContain('body.po-printing [data-po-print-overlay],');
    expect(globals).toContain('body.po-printing [data-po-print] {');
  });

  it('lays the card flat and unclips the lines list', () => {
    expect(globals).toContain('max-height: none !important;');
    expect(globals).toContain('box-shadow: none !important;');
    expect(globals).toContain('body.po-printing [data-po-print] [data-testid="po-drill-lines-list"]');
  });

  it('keeps the chips\u2019 colors on paper (exact reproduction)', () => {
    expect(globals).toContain('-webkit-print-color-adjust: exact !important;');
    expect(globals).toContain('print-color-adjust: exact !important;');
  });

  it('the Print button names the act and hides until the document loads', () => {
    expect(drill).toContain('data-testid="po-drill-print"');
    expect(drill).toContain('aria-label={`Print purchase order ${data.poNumber}`}');
    expect(drill).toContain('title="the paper trail — the document, on one sheet; the controls stay off the paper"');
    expect(drill).toContain('onClick={() => window.print()}');
    expect(drill).toContain('{data && data.lines.length > 0 && (');
  });

  it('does not touch the pre-existing console print rule (v2.152 stands)', () => {
    expect(globals).toContain('.mbumah-console header, .mbumah-console footer, .no-print { display: none !important; }');
  });
});

// ── THE LINE'S NOTE ──────────────────────────────────────────────────────

describe('the line\u2019s note', () => {
  it('rides the wire (additive select + per-line map)', () => {
    expect(detailRoute).toContain('notes: true,');
    expect(detailRoute).toContain('notes: l.notes,');
  });

  it('speaks under the name on a quotation hairline, muted family', () => {
    expect(drill).toContain('data-testid="po-drill-line-note"');
    expect(drill).toContain('{l.notes}');
    expect(drill).toContain('border-l-2 border-slate-200 pl-1.5 text-[10px] italic text-slate-500');
  });

  it('absence stays absent (no note, no line)', () => {
    expect(drill).toContain('{l.notes && (');
  });
});

// ── THE ROSTER'S COPY ────────────────────────────────────────────────────

describe('the roster\u2019s copy', () => {
  it('is a pure, exported builder (the pins read it)', () => {
    expect(ledger).toContain("export function rosterCsv(rows: PoLedgerWire['data']['rows'], opts: { costGated: boolean }): string {");
  });

  it('speaks the columns (the birth column rode the file at v2.249.0, the aisle beside it at v2.250.0, the band beside the aisle at v2.251.0)', () => {
    expect(ledger).toContain("'po_number,status,supplier,branch,lines,ordered_day,total_kes,birth,aisle,aisle_band'");
  });

  it('rides the cost gate IN THE FILE', () => {
    expect(ledger).toContain("!opts.costGated && r.totalAmount != null ? r.totalAmount : ''");
  });

  it('ships the BOM and CRLF joins', () => {
    expect(ledger).toContain('`\\ufeff${[header, ...rowsOut].join(\'\\r\\n\')}`');
  });

  it('reuses the boring quoting law verbatim (csvCell — never re-invented; v2.256.0: the import grew the SheetDrill \u2014 the birth\u2019s door rides the same line)', () => {
    expect(ledger).toContain("import { SheetDrill, csvCell, type SheetDrillTarget } from './sheet-drill';");
    expect(sheetDrill).toContain('export function csvCell(v: string | number | null | undefined): string {');
  });

  it('the whole-window law: the export reads data.rows, never the needle\u2019s view', () => {
    expect(ledger).toContain('const csv = rosterCsv(data.rows, { costGated: data.costGated });');
    expect(ledger).toContain('the finder narrows the reading, never the export');
    expect(ledger).toContain('aria-label={`Download all ${data.rows.length} orders as CSV`}');
  });

  it('stamps the day in the file name and hides on an empty window', () => {
    expect(ledger).toContain('`po-ledger-${new Date().toISOString().slice(0, 10)}.csv`');
    expect(ledger).toContain('{data && data.rows.length > 0 && (');
  });
});
