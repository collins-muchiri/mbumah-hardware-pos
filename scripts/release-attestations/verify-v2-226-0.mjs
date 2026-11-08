#!/usr/bin/env node
// verify-v2-226-0.mjs — the v2.226.0 release gate.
//
// Reads the SOURCE OF RECORD and asserts the release's laws: THE PAPER
// TRAIL (the po-printing body class gate living exactly as long as the
// door, the overlay/card print attributes, the controls marked off the
// paper, the stylesheet's silence-and-layout block with exact color,
// the Print button named for the ear and absent until the document
// loads), THE LINE'S NOTE (the wire selects items.notes, the face
// speaks it on a quotation hairline, absent stays absent), THE
// ROSTER'S COPY (the pure builder, the seven columns, the cost gate
// riding IN THE FILE, the whole-window law, the BOM + CRLF, csvCell
// reused verbatim, the day-stamped file name), and the release face:
// package.json / VERSION / whats-new / CHANGELOG all speak 2.226.0.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

let failures = 0;
let pass = 0;
const ok = (name, cond) => {
  if (cond) { pass++; console.log(`PASS  ${name}`); }
  else { failures++; console.log(`FAIL  ${name}`); }
};
const read = (p) => readFileSync(join(process.cwd(), p), 'utf8');

const detailRoute = read('src/app/api/org/purchase-orders/[id]/route.ts');
const ledger = read('src/components/org/po-ledger.tsx');
const drill = read('src/components/org/po-drill.tsx');
const globals = read('src/app/globals.css');
const pkg = JSON.parse(read('package.json'));
const version = read('VERSION').trim();
const whatsNew = read('src/lib/whats-new.ts');
const changelog = read('CHANGELOG.md');

console.log('— the release face —');
ok('package.json releaseVersion 2.226.0', pkg.mbumah.releaseVersion === '2.226.0');
ok('package.json baseVersion 2.226.0', pkg.mbumah.baseVersion === '2.226.0');
ok('package.json version 2.226.0', pkg.version === '2.226.0');
ok('VERSION 2.226.0', version === '2.226.0');
ok('whats-new entry at the head', whatsNew.includes("version: '2.226.0',") && whatsNew.indexOf("version: '2.226.0',") < whatsNew.indexOf("version: '2.225.0',"));
ok('whats-new title speaks the paper', whatsNew.includes("title: 'The paper trail',"));
ok('changelog anchors the section above its ancestor (headers, never bare strings)', changelog.indexOf('## [2.226.0]') >= 0 && changelog.indexOf('## [2.226.0]') < changelog.indexOf('## [2.225.0]'));

console.log('— the print face —');
ok('the body-class gate lives exactly as long as the door (mount/unmount, above the null guard)', drill.includes("useEffect(() => {\n    document.body.classList.add('po-printing');\n    return () => document.body.classList.remove('po-printing');\n  }, []);") && drill.indexOf("document.body.classList.add('po-printing')") < drill.indexOf('if (!target) return null;'));
ok('the overlay carries the print anchor', drill.includes('data-po-print-overlay=""'));
ok('the card carries the print anchor', drill.includes('data-po-print=""'));
ok('the controls stay off the paper (close, print, csv, finder, count)', (drill.match(/data-po-print-off=""/g) || []).length >= 5);
ok('the stylesheet silences the shell only while the door is open', globals.includes('body.po-printing * { visibility: hidden; }'));
ok('the overlay becomes the page', globals.includes('body.po-printing [data-po-print-overlay] {\n    position: absolute !important;'));
ok('the card lays flat (no border, no shadow, no clip)', globals.includes('max-height: none !important;') && globals.includes('box-shadow: none !important;'));
ok('the chips keep their colors on paper', globals.includes('print-color-adjust: exact !important;'));
ok('the lines list unclips for the paper', globals.includes('[data-testid="po-drill-lines-list"]'));
ok('the Print button exists, named for the ear', drill.includes('data-testid="po-drill-print"') && drill.includes('aria-label={`Print purchase order ${data.poNumber}`}') && drill.includes('title="the paper trail — the document, on one sheet; the controls stay off the paper"'));
ok('the Print button is the whole machinery (window.print; the stylesheet does the work)', drill.includes('onClick={() => window.print()}'));
ok('the Print button is absent until the document loads', drill.includes('{data && data.lines.length > 0 && ('));

console.log('— the line\u2019s note —');
ok('the wire selects items.notes (additive)', detailRoute.includes('notes: true,'));
ok('the wire maps the note per line', detailRoute.includes('notes: l.notes,'));
ok('the face speaks the note under the name', drill.includes('data-testid="po-drill-line-note"') && drill.includes('{l.notes}'));
ok('a line without a note stays quiet (absence stays absent)', drill.includes('{l.notes && ('));
ok('the note rides a quotation hairline in the muted family', drill.includes('border-l-2 border-slate-200 pl-1.5 text-[10px] italic text-slate-500'));

console.log('— the roster\u2019s copy —');
ok('the builder is pure and exported (the pins read it)', ledger.includes("export function rosterCsv(rows: PoLedgerWire['data']['rows'], opts: { costGated: boolean }): string {"));
ok('the seven columns speak', ledger.includes("'po_number,status,supplier,branch,lines,ordered_day,total_kes'"));
ok('the cost gate rides IN THE FILE', ledger.includes("!opts.costGated && r.totalAmount != null ? r.totalAmount : ''"));
ok('the BOM rides + CRLF joins', ledger.includes('`\\ufeff${[header, ...rowsOut].join(\'\\r\\n\')}`'));
ok('the quoting law is REUSED, never re-invented (csvCell from the sheet drill)', ledger.includes("import { csvCell } from './sheet-drill';"));
ok('the whole-window law: the export reads data.rows, never the needle\u2019s view', ledger.includes('const csv = rosterCsv(data.rows, { costGated: data.costGated });') && ledger.includes('the finder narrows the reading, never the export'));
ok('the export button exists, named for the ear', ledger.includes('data-testid="po-ledger-export"') && ledger.includes('aria-label={`Download all ${data.rows.length} orders as CSV`}'));
ok('the file name carries the day', ledger.includes('`po-ledger-${new Date().toISOString().slice(0, 10)}.csv`'));
ok('the button hides on an empty window (an absent control never lies)', ledger.includes('{data && data.rows.length > 0 && ('));

console.log('— the verdict —');
console.log(`${pass} passed, ${failures} failed`);
process.exit(failures === 0 ? 0 : 1);
