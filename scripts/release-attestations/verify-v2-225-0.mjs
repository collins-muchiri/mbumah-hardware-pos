#!/usr/bin/env node
// verify-v2-225-0.mjs — the v2.225.0 release gate.
//
// Reads the SOURCE OF RECORD and asserts the release's laws: THE
// PIPELINE FROM ABOVE (the org PO wire's role gate + runWithoutTenant +
// cost law + honest counts + refused unknown status, the ledger's
// status ladder + branch picker + finder + disclosed window + read-only
// footer, the drill's per-document key + timeline + received progress +
// the order's copy CSV with the cost gate riding IN THE FILE), THE
// PROVENANCE ROLLUP (the group's distinct hint-PO count, the honest
// chip >1 with its naming title), and the release face: package.json /
// VERSION / whats-new / CHANGELOG all speak 2.225.0.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

let failures = 0;
let pass = 0;
const ok = (name, cond) => {
  if (cond) { pass++; console.log(`PASS  ${name}`); }
  else { failures++; console.log(`FAIL  ${name}`); }
};
const read = (p) => readFileSync(join(process.cwd(), p), 'utf8');

const listRoute = read('src/app/api/org/purchase-orders/route.ts');
const detailRoute = read('src/app/api/org/purchase-orders/[id]/route.ts');
const ledger = read('src/components/org/po-ledger.tsx');
const drill = read('src/components/org/po-drill.tsx');
const dialog = read('src/components/org/restock-dialog.tsx');
const consolePage = read('src/app/(shell)/console/page.tsx');
const pkg = JSON.parse(read('package.json'));
const version = read('VERSION').trim();
const whatsNew = read('src/lib/whats-new.ts');
const changelog = read('CHANGELOG.md');

console.log('— the release face —');
ok('package.json releaseVersion 2.225.0', pkg.mbumah.releaseVersion === '2.225.0');
ok('package.json baseVersion 2.225.0', pkg.mbumah.baseVersion === '2.225.0');
ok('package.json version 2.225.0', pkg.version === '2.225.0');
ok('VERSION 2.225.0', version === '2.225.0');
ok('whats-new entry at the head', whatsNew.includes("version: '2.225.0',") && whatsNew.indexOf("version: '2.225.0',") < whatsNew.indexOf("version: '2.224.0',"));
ok('whats-new title speaks the pipeline', whatsNew.includes("title: 'The pipeline from above',"));
ok('changelog anchors the section above its ancestor (headers, never bare strings)', changelog.indexOf('## [2.225.0]') >= 0 && changelog.indexOf('## [2.225.0]') < changelog.indexOf('## [2.224.0]'));

console.log('— the org PO wire (the roster) —');
ok('the wire is ORG_ROLES only (the kpi-summary contract)', listRoute.includes("const ORG_ROLES = ['SUPER_ADMIN', 'STORE_OWNER', 'BRANCH_MANAGER'];"));
ok('the read runs WITHOUT tenant on the RAW client (the leak class never shrinks it)', listRoute.includes('runWithoutTenant(async () => {') && listRoute.includes('rawDb.purchaseOrder.findMany('));
ok('the full ladder answers (eight rungs, the schema comment\u2019s law)', listRoute.includes("'DRAFT',") && listRoute.includes("'PENDING_APPROVAL',") && listRoute.includes("'APPROVED',") && listRoute.includes("'SENT',") && listRoute.includes("'CONFIRMED',") && listRoute.includes("'PARTIALLY_RECEIVED',") && listRoute.includes("'RECEIVED',") && listRoute.includes("'CANCELLED',"));
ok('an out-of-ladder status is REFUSED, never a silent all', listRoute.includes("error: 'unknown purchase-order status.'") && listRoute.includes('status: 400'));
ok('the counts are the wire\u2019s groupBy (real numbers, never a fabricated ladder)', listRoute.includes('rawDb.purchaseOrder.groupBy({ by: [\'status\'], where, _count: { _all: true } })'));
ok('the take is clamped and disclosed', listRoute.includes('Math.min(100, Math.max(1, Math.trunc(takeParam)))') && listRoute.includes('take,'));
ok('the cost law rides the roster (totalAmount gated)', listRoute.includes('canViewCost ? Number(po.totalAmount) : null') && listRoute.includes("hasFeaturePermission(session.role, 'inventory.view.cost')"));
ok('newest first (orderDate, then createdAt)', listRoute.includes("orderBy: [{ orderDate: 'desc' }, { createdAt: 'desc' }],"));

console.log('— the org PO wire (the drill) —');
ok('the drill is ORG_ROLES only', detailRoute.includes("const ORG_ROLES = ['SUPER_ADMIN', 'STORE_OWNER', 'BRANCH_MANAGER'];"));
ok('the drill reads WITHOUT tenant on the RAW client', detailRoute.includes('runWithoutTenant(() =>') && detailRoute.includes('rawDb.purchaseOrder.findUnique('));
ok('the drill answers 404 on a missing document', detailRoute.includes("error: 'purchase order not found.'") && detailRoute.includes('status: 404'));
ok('the drill\u2019s shillings ride the gate (totalAmount, unitCost, totalCost)', detailRoute.includes('canViewCost ? Number(po.totalAmount) : null') && detailRoute.includes('canViewCost ? Number(l.unitCost) : null') && detailRoute.includes('canViewCost ? Number(l.totalCost) : null'));
ok('the timeline rides the wire (raised, approved, received, cancelled — with names)', detailRoute.includes('createdByName') && detailRoute.includes('approvedByName') && detailRoute.includes('receivedByName') && detailRoute.includes('cancelledByName'));
ok('units are units (ordered + received, rounded honest)', detailRoute.includes('orderedUnits') && detailRoute.includes('receivedUnits') && detailRoute.includes('Math.round(orderedUnits * 100) / 100'));

console.log('— the procurement ledger (the face) —');
ok('the ledger is mounted beside the variance map', consolePage.includes('<ProcurementLedger stores={stores} />') && consolePage.indexOf('<ProcurementLedger stores={stores} />') > consolePage.indexOf('<VarianceMap data={kpi} stores={stores} />'));
ok('the filters ride the query key (a filter change IS a refetch)', ledger.includes("queryKey: ['org-po-ledger', statusFilter, branchId],"));
ok('the status rungs carry aria-pressed (the ladder\u2019s state, spoken)', ledger.includes('aria-pressed={statusFilter === \'ALL\'}') && ledger.includes('aria-pressed={statusFilter === c.status}'));
ok('the rungs speak the REAL counts', ledger.includes('{num(c.count)}'));
ok('the branch picker narrows by refetch, named for the ear', ledger.includes('data-testid="po-ledger-branch-select"') && ledger.includes('aria-label="Filter purchase orders by branch"'));
ok('the finder narrows the READING (client-side, honest N of M)', ledger.includes('data-testid="po-ledger-finder"') && ledger.includes('{num(shownRows.length)} of {num(data.rows.length)}'));
ok('the finder reads number, supplier AND branch', ledger.includes('r.poNumber.toLowerCase().includes(cleanNeedle)') && ledger.includes('r.supplierName.toLowerCase().includes(cleanNeedle)') && ledger.includes("r.store.name.toLowerCase().includes(cleanNeedle)"));
ok('the empty faces are honest (never rows, never silence)', ledger.includes('no purchase order answers this filter') && ledger.includes('the filter narrowed the pipe to nothing'));
ok('the window is disclosed when the pipe runs deeper', ledger.includes('showing the latest {num(data.take)}'));
ok('the cost note speaks the gate\u2019s absence', ledger.includes('the shillings stay behind the cost gate'));
ok('the read-only law names the footer', ledger.includes('read-only — the branch workspace keeps the pens'));
ok('the drill is keyed per document (a fresh door is an empty needle)', ledger.includes('<PoDrill key={drill.id} target={drill} onClose={() => setDrill(null)} />'));

console.log('— the PO drill (the door) —');
ok('the ladder chip speaks cold-to-warm-to-green', drill.includes("if (s === 'DRAFT') return 'bg-slate-100") && drill.includes("if (s === 'RECEIVED') return 'bg-emerald-50"));
ok('the finder exists with the honest count and the clear way back', drill.includes('data-testid="po-drill-finder"') && drill.includes('data-testid="po-drill-finder-clear"') && drill.includes('{num(shownLines.length)} of {num(data.lines.length)}'));
ok('the received progress rides a hairline, emerald when landed', drill.includes("done ? 'bg-emerald-500' : 'bg-sky-500'"));
ok('the timeline renders the receipts the wire carried', drill.includes('data-testid="po-drill-timeline"') && drill.includes('no approval on the record'));
ok('the order\u2019s copy exists, named for the ear (whole order)', drill.includes('data-testid="po-drill-export"') && drill.includes('aria-label={`Download all ${data.lines.length} lines as CSV`}'));
ok('the copy builder is pure and exported (the pins read it)', drill.includes('export function poLinesCsv(lines: PoDrillWire[\'data\'][\'lines\'], opts: { costGated: boolean }): string {'));
ok('the seven columns speak', drill.includes("'product,sku,unit,ordered,received,unit_cost_kes,line_total_kes'"));
ok('the cost gate rides IN THE FILE (both cost cells)', drill.includes("!opts.costGated && l.unitCost != null ? l.unitCost : ''") && drill.includes("!opts.costGated && l.totalCost != null ? l.totalCost : ''"));
ok('the BOM rides + CRLF joins', drill.includes('`\\ufeff${[header, ...rows].join(\'\\r\\n\')}`'));
ok('the quoting law is REUSED, never re-invented (csvCell from the sheet drill)', drill.includes("import { csvCell } from './sheet-drill';"));
ok('the file name carries the document', drill.includes('`po-${data.poNumber}-${data.status.toLowerCase()}.csv`'));
ok('the button hides on a line-less order (an absent control never lies)', drill.includes('{data && data.lines.length > 0 && ('));

console.log('— the provenance rollup (the rider) —');
ok('the group memo counts DISTINCT hint documents', dialog.includes('const hintPos = Array.from(new Set(rows.map((r) => r.lastSupplierPoNumber).filter((p): p is string => Boolean(p))));'));
ok('the chip speaks only past ONE document (the honest form)', dialog.includes('{group.hintPos.length > 1 && ('));
ok('the chip names the documents in its title', dialog.includes("the ledger's hints named ${group.hintPos.length}: ${group.hintPos.join(', ')}."));
ok('the chip is mono (document numbers, not words)', dialog.includes('data-testid={`restock-group-provenance-${group.supplierId}`}') && dialog.includes('font-mono'));

console.log('— the verdict —');
console.log(`${pass} passed, ${failures} failed`);
process.exit(failures === 0 ? 0 : 1);
