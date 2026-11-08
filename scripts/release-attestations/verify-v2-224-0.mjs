#!/usr/bin/env node
// verify-v2-224-0.mjs — the v2.224.0 release gate.
//
// Reads the SOURCE OF RECORD and asserts the release's laws: THE
// SPOKEN HINT (the named wire's additive receipt fields, the PO
// select grown, the reduction fills, the dialog type + full-wire
// mapping, the row's mono chip with the law in its title), THE
// SHEET'S COPY (pure CSV builder + csvCell quoting law, the seven
// columns, the cost gate riding IN THE FILE, honest empties, the
// BOM, the whole-sheet button named for the ear, absent on a
// line-less sheet, the stamped file name, zero new fetch), and the
// release face: package.json / VERSION / whats-new / CHANGELOG all
// speak 2.224.0.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

let failures = 0;
let pass = 0;
const ok = (name, cond) => {
  if (cond) { pass++; console.log(`PASS  ${name}`); }
  else { failures++; console.log(`FAIL  ${name}`); }
};
const read = (p) => readFileSync(join(process.cwd(), p), 'utf8');

const dialog = read('src/components/org/restock-dialog.tsx');
const kpi = read('src/app/api/org/kpi-summary/route.ts');
const drill = read('src/components/org/sheet-drill.tsx');
const pkg = JSON.parse(read('package.json'));
const version = read('VERSION').trim();
const whatsNew = read('src/lib/whats-new.ts');
const changelog = read('CHANGELOG.md');

console.log('— the release face —');
ok('package.json releaseVersion 2.224.0', pkg.mbumah.releaseVersion === '2.224.0');
ok('package.json baseVersion 2.224.0', pkg.mbumah.baseVersion === '2.224.0');
ok('package.json version 2.224.0', pkg.version === '2.224.0');
ok('VERSION 2.224.0', version === '2.224.0');
ok('whats-new entry at the head', whatsNew.includes("version: '2.224.0',") && whatsNew.indexOf("version: '2.224.0',") < whatsNew.indexOf("version: '2.223.0',"));
ok('whats-new title speaks the hint', whatsNew.includes("title: 'The spoken hint',"));
ok('changelog anchors the section above its ancestor (headers, never bare strings)', changelog.indexOf('## [2.224.0]') >= 0 && changelog.indexOf('## [2.224.0]') < changelog.indexOf('## [2.223.0]'));

console.log('— the spoken hint —');
ok('the named wire grew the receipt fields, additively', kpi.includes('lastSupplierPoNumber: null as string | null,') && kpi.includes('lastSupplierAt: null as string | null,'));
ok('the hint select carries poNumber + orderDate', kpi.includes("purchaseOrder: { select: { supplierId: true, poNumber: true, orderDate: true, supplier: { select: { name: true } } } }"));
ok('the reduction fills the receipt', kpi.includes('item.lastSupplierPoNumber = line.purchaseOrder?.poNumber ?? null;') && kpi.includes('item.lastSupplierAt = line.purchaseOrder?.orderDate'));
ok('the dialog type carries the receipt', dialog.includes('lastSupplierPoNumber?: string | null;') && dialog.includes('lastSupplierAt?: string | null;'));
ok('the full wire\u2019s receipt is mapped (zero wire change there)', dialog.includes('lastSupplierPoNumber: r.supplier?.lastPoNumber ?? null,') && dialog.includes('lastSupplierAt: r.supplier?.lastPoDate ?? null,'));
ok('every row wears the mono chip, testid per SKU', dialog.includes('data-testid={`restock-hint-po-${item.sku}`}') && dialog.includes('hint: {item.lastSupplierPoNumber}'));
ok('the chip\u2019s title speaks the law', dialog.includes('the ledger hints the latest purchase order of ANY status, newest first — ${item.lastSupplierPoNumber} named this row'));

console.log('— the sheet\u2019s copy —');
ok('the CSV builder exists, pure and exported', drill.includes('export function csvCell(v: string | number | null | undefined): string {') && drill.includes("export function sheetLinesCsv(lines: DrillWire['data']['lines'], opts: { costGated: boolean }): string {"));
ok('the quoting law (wrapped, doubled)', drill.includes('return /[",\\n]/.test(s) ? `"${s.replaceAll(\'"\', \'""\')}"` : s;'));
ok('the header speaks the seven columns', drill.includes("'product,sku,unit,snapshot,counted,variance,variance_cost_kes'"));
ok('the cost gate rides IN THE FILE', drill.includes("!opts.costGated && l.varianceCost != null ? l.varianceCost : ''"));
ok('the honest empties (uncounted, unvaried)', drill.includes("l.countedQty != null ? l.countedQty : ''") && drill.includes("l.variance != null ? l.variance : ''"));
ok('the BOM rides (Excel opens UTF-8 honestly)', drill.includes('`\\ufeff${[header, ...rows].join(\'\\r\\n\')}`'));
ok('the button exists, whole-sheet by law, named for the ear', drill.includes('data-testid="sheet-drill-export"') && drill.includes('aria-label={`Download all ${data.lines.length} lines as CSV`}') && drill.includes('title="the whole sheet, one file — the finder narrows the reading, never the export"'));
ok('the button hides on a line-less sheet', drill.includes('{data && data.lines.length > 0 && ('));
ok('the file name carries branch, day, status', drill.includes('`count-sheet-${data.store.code ?? \'branch\'}-${stamp}-${data.status.toLowerCase()}.csv`'));
ok('zero new fetch (the builder eats held lines)', drill.includes('const csv = sheetLinesCsv(data.lines, { costGated });'));

console.log('— the styling details —');
ok('the hint chip: mono, tabular-nums, muted family at 3:1', dialog.includes('bg-slate-100 px-1.5 py-0.5 font-mono text-[9px] tabular-nums text-slate-600 ring-1 ring-slate-200 dark:bg-slate-500/10 dark:text-slate-300 dark:ring-slate-500/30'));
ok('the CSV button: house border family + amber focus ring', drill.includes('flex h-6 items-center gap-1 rounded-md border border-slate-200 bg-white px-1.5 text-[10px] font-semibold text-slate-600 transition-colors hover:bg-slate-50 focus:outline-none focus:ring-1 focus:ring-amber-500/40 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'));
ok('the download glass is decorative', drill.includes('<Download className="h-3 w-3" aria-hidden="true" />'));

console.log(`\nverify-v2-224-0: ${pass} passed, ${failures} failed`);
process.exit(failures === 0 ? 0 : 1);
