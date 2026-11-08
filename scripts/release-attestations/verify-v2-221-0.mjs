#!/usr/bin/env node
// verify-v2-221-0.mjs — the v2.221.0 release gate.
//
// Reads the SOURCE OF RECORD and asserts the release's laws: THE
// SUPPLIER GROUPS (a row goes to its OWN ledger hint while it sits on
// the active roster, else the effective supplier — derived, never an
// effect), THE HONEST AVAILABILITY (the toggle hides when a single
// group exists; splitOn is the derived conjunction), THE DELIBERATE
// ACT (split defaults OFF; one PO keeps the v2.217.0 behavior), THE
// SEQUENTIAL WALK (ONE POST per shipping group against the SAME
// /api/purchase-orders wire — never a batch endpoint), THE PARTIAL
// HONESTY (a refused group is named and never blocks the rest), THE
// NOTES REMEMBER (supplier split k of n, with the supplier), THE STRIP
// STAYS WHOLE (the indicative strip annotates the whole draft's
// estimate, never a slice), THE STYLING DETAILS (group dividers with
// per-group subtotals and the honest "nothing shipping", per-group
// estimate rows, the multi-PO success roster with the run's server
// grand total, the refused rows in the house red family), and the
// release face: package.json / VERSION / whats-new / CHANGELOG all
// speak 2.221.0.

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
const splitTest = read('src/tests/restock-split-v2221.test.ts');
const pkg = JSON.parse(read('package.json'));
const version = read('VERSION').trim();
const whatsNew = read('src/lib/whats-new.ts');
const changelog = read('CHANGELOG.md');

console.log('— the release face —');
ok('package.json releaseVersion 2.221.0', pkg.mbumah.releaseVersion === '2.221.0');
ok('package.json baseVersion 2.221.0', pkg.mbumah.baseVersion === '2.221.0');
ok('package.json version 2.221.0', pkg.version === '2.221.0');
ok('VERSION 2.221.0', version === '2.221.0');
ok('whats-new entry at the head', whatsNew.includes("version: '2.221.0',") && whatsNew.indexOf("version: '2.221.0',") < whatsNew.indexOf("version: '2.220.0',"));
ok('changelog entry leads', changelog.includes('## [2.221.0] The supplier split') && changelog.indexOf('## [2.221.0]') < changelog.indexOf('## [2.220.0]'));
ok('verify gate wired', pkg.scripts['verify:v2-221-0'] === 'node scripts/verify-v2-221-0.mjs');

console.log('— the supplier groups —');
ok('the group derivation exists (useMemo, never an effect)', dialog.includes('const supplierGroups = useMemo(() => {'));
ok('a row rides its OWN ledger hint while on the active roster', dialog.includes('item.lastSupplierId && suppliers.some((s) => s.id === item.lastSupplierId)') && dialog.includes(': effectiveSupplierId;'));
ok('groups preserve first-seen order', dialog.includes('order.push(sid);') && dialog.includes('return order.map((sid) => {'));
ok('shipping lines count only qty>0 rows', dialog.includes('const shippingLines = rows.filter((item) => (lines[item.id] ?? seededLine(item)).qty > 0).length;'));
ok('group shipping subtotals reduce the same arithmetic', dialog.includes('return line.qty > 0 ? acc + line.qty * line.unitCost : acc;'));

console.log('— the honest availability —');
ok('the toggle hides when a single group exists', dialog.includes('const splitAvailable = supplierGroups.length > 1;') && dialog.includes('{splitAvailable && ('));
ok('splitOn is the derived conjunction', dialog.includes('const splitOn = splitMode && splitAvailable;'));
ok('the split is a deliberate act, default OFF', dialog.includes('const [splitMode, setSplitMode] = useState(false);'));
ok('the toggle is aria-pressed', dialog.includes('data-testid="restock-split-toggle"') && dialog.includes('aria-pressed={splitOn}'));
ok('the note names the span at rest and the law when split', dialog.includes('suppliers \u2014 one draft each; your chosen supplier covers the hint-less lines.') && dialog.includes('suppliers \u2014 the split raises one PO each, every line where its own ledger points.'));
ok('the ledger-hint chip speaks in one-PO mode only', dialog.includes('{hintLed && !splitOn && ('));

console.log('— the sequential walk —');
ok('the split filters to SHIPPING groups', dialog.includes('? supplierGroups.filter((g) => g.shippingLines > 0)'));
ok('one-PO mode keeps the v2.217.0 single step', dialog.includes('rows: activeItems, shippingSubTotal: subTotal, shippingLines: shippingCount }'));
ok('the walk is a for-loop, SEQUENTIAL', dialog.includes('for (let i = 0; i < groups.length; i += 1) {'));
ok('ONE POST per supplier on the SAME wire', dialog.includes("await fetch('/api/purchase-orders', {") && dialog.includes('supplierId: group.supplierId,'));
ok('the zero law holds before the walk', dialog.includes('if (payloadLinesFor(activeItems, lines).length === 0) return;'));
ok('the composition is lifted (one arithmetic, N callers)', dialog.includes('function payloadLinesFor(rows: RestockItem[], edits: Record<string, { qty: number; unitCost: number }>)'));

console.log('— the notes remember —');
ok('the split notes name k of n with the supplier', dialog.includes('supplier split ${i + 1} of ${groups.length} (${group.supplierName}).'));
ok('the scope phrase composes once', dialog.includes("const scopePhrase = mode === 'full' ? 'full branch restock list' : 'named watchlist';"));

console.log('— the partial honesty —');
ok('a refused group is named with the server error', dialog.includes('refused.push({ supplierName: group.supplierName, lines: payloadItems.length, error: body?.error ?? `the draft was refused (${res.status})` });'));
ok('the walk continues past a refusal', dialog.includes('continue;'));
ok('the result carries both truths', dialog.includes('setResult({ raised, refused });'));

console.log('— the faces —');
ok('the list regroups under supplier dividers when split', dialog.includes('restock-group-divider-${group.supplierId}') && dialog.includes('{group.rows.map((item) => restockLineRow(item))}'));
ok('the divider speaks the honest nothing-shipping', dialog.includes("'nothing shipping'"));
ok('the line row is lifted (one markup, N callers)', dialog.includes('const restockLineRow = (item: RestockItem) => {'));
ok('per-group estimate rows sit beneath the total', dialog.includes('restock-group-estimate-${g.supplierId}'));
ok('the strip annotates the WHOLE draft', dialog.includes('figure: formatCurrency(subTotal * activeLens.rate, activeLens.code),'));
ok('the submit button counts the POs in split mode', dialog.includes('`Raise ${shippingGroupCount} DRAFT POs · ${shippingCount}'));
ok('the multi-PO success roster exists', dialog.includes('data-testid="restock-success-rows"') && dialog.includes('data-testid="restock-success-row"'));
ok('the run total reads the server\u2019s own numbers', dialog.includes('result.raised.reduce((acc, po) => acc + po.totalAmount, 0)'));
ok('the refused face names each supplier in the house red', dialog.includes('data-testid="restock-refused-row"') && dialog.includes('the rest of the run went through:'));
ok('the single-PO face keeps the v2.217.0 shape', dialog.includes("result.raised.length === 1 ? 'DRAFT raised'") && dialog.includes('data-testid="restock-po-number"'));
ok('"Draft another" keeps its reseed law', dialog.includes('data-testid="restock-again"'));

console.log('— the source pins —');
ok('the split test pins the group derivation', splitTest.includes('const supplierGroups = useMemo(() => {'));
ok('the split test pins the partial honesty', splitTest.includes('refused.push({ supplierName: group.supplierName'));
ok('the split test pins the notes cut', splitTest.includes('supplier split ${i + 1} of ${groups.length} (${group.supplierName}).'));

console.log('');
if (failures === 0) {
  console.log(`${pass} passed, 0 failed`);
  process.exit(0);
} else {
  console.log(`${pass} passed, ${failures} FAILED`);
  process.exit(1);
}
