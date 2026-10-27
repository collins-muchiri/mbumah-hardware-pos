#!/usr/bin/env node
// verify-v2-228-0.mjs — the v2.228.0 release gate.
//
// Reads the SOURCE OF RECORD and asserts the release's laws: THE
// CLIPBOARD (the paper's mode IS the sheet's status — COUNTING walks,
// CLOSED/CANCELLED record; the card's conditional attribute; the three
// print-only fittings: floor-copy note, empty count boxes on every
// line, signature rules at the foot; the base stylesheet keeps them
// off the screen, the print block lays them on the paper; the write-in
// spans the line; paper hygiene keeps a line and its box on one page;
// the Print button's aria speaks the mode), THE WHISPER SPEAKS ITS
// NAMES (the wire's WATCHLIST_NAMES_CAP = 3, the candidates query grew
// one cheap column, the hint carries name + stock/level pairs — the
// branch's own numbers, the response carries count + speakers with
// zero answering empty; the trigger lives OUTSIDE the drill button, a
// Radix popover over the SAME response — zero new fetch; the speakers
// list, the cap disclosure, the supplier-of-record law; zero stays
// silent; the roster CSV keeps its seven columns), and the release
// face: package.json / VERSION / whats-new / CHANGELOG all speak
// 2.228.0.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

let failures = 0;
let pass = 0;
const ok = (name, cond) => {
  if (cond) { pass++; console.log(`PASS  ${name}`); }
  else { failures++; console.log(`FAIL  ${name}`); }
};
const read = (p) => readFileSync(join(process.cwd(), p), 'utf8');

const ledger = read('src/components/org/po-ledger.tsx');
const sheetDrill = read('src/components/org/sheet-drill.tsx');
const globals = read('src/app/globals.css');
const wire = read('src/app/api/org/purchase-orders/route.ts');
const pkg = JSON.parse(read('package.json'));
const version = read('VERSION').trim();
const whatsNew = read('src/lib/whats-new.ts');
const changelog = read('CHANGELOG.md');

console.log('— the release face —');
ok('package.json releaseVersion 2.228.0', pkg.mbumah.releaseVersion === '2.228.0');
ok('package.json baseVersion 2.228.0', pkg.mbumah.baseVersion === '2.228.0');
ok('package.json version 2.228.0', pkg.version === '2.228.0');
ok('VERSION 2.228.0', version === '2.228.0');
ok('whats-new entry at the head', whatsNew.includes("version: '2.228.0',") && whatsNew.indexOf("version: '2.228.0',") < whatsNew.indexOf("version: '2.227.0',"));
ok('whats-new title speaks the clipboard', whatsNew.includes("title: 'The clipboard',"));
ok('changelog anchors the section above its ancestor (headers, never bare strings)', changelog.indexOf('## [2.228.0]') >= 0 && changelog.indexOf('## [2.228.0]') < changelog.indexOf('## [2.227.0]'));

console.log('— the clipboard (the sheet\u2019s paper grows its tool) —');
ok('the mode IS the sheet status (one derivation)', sheetDrill.includes("const isClipboard = data?.status === 'COUNTING';"));
ok('the card carries the clipboard attribute conditionally (never hardcoded)', sheetDrill.includes("{...(isClipboard ? { 'data-sheet-clipboard': '' } : {})}"));
ok('the floor-copy note exists and speaks the walk', sheetDrill.includes('data-sheet-clipboard-note=""') && sheetDrill.includes('floor copy — walk the shelves, write what you see; the branch app holds the pens.'));
ok('every line gets its count box (the box mounts inside the line map)', sheetDrill.split('data-testid="sheet-drill-lines-list"')[1].split('</ul>')[0].includes('data-sheet-count-box=""'));
ok('the box is EMPTY (the shelf\u2019s ask, not the system\u2019s echo)', (() => { const b = sheetDrill.split('data-sheet-count-box=""')[1].split('</span>\n                      )}')[0]; return b.includes('counted') && !/\{num\(/.test(b); })());
ok('the walk\u2019s witnesses at the foot (counted by / checked by / date)', sheetDrill.includes('data-testid="sheet-drill-signatures"') && sheetDrill.includes('data-sheet-clipboard-signatures=""') && sheetDrill.includes('counted by') && sheetDrill.includes('checked by'));
ok('the Print aria speaks the clipboard mode', sheetDrill.includes("`Print the floor's clipboard — ${data.lines.length} lines with empty count boxes`"));
ok('the Print aria keeps the record mode', sheetDrill.includes('`Print all ${data.lines.length} lines of the count sheet at ${target.storeName}`'));
ok('the body-class gate still rides above the null guard (the v2.226 lesson bank)', sheetDrill.indexOf("document.body.classList.add('sheet-printing')") < sheetDrill.indexOf('if (!target) return null;'));

console.log('— the clipboard stylesheet —');
ok('the screen never shows the fittings (the base hide rule)', globals.includes('[data-sheet-clipboard] [data-sheet-count-box],') && globals.includes('[data-sheet-clipboard] [data-sheet-clipboard-signatures] { display: none; }'));
ok('the paper flips the display back (note block, box flex, signatures flex)', globals.includes('body.sheet-printing [data-sheet-clipboard] [data-sheet-clipboard-note] {\n    display: block !important;') && globals.includes('body.sheet-printing [data-sheet-clipboard] [data-sheet-count-box] {\n    display: flex !important;') && globals.includes('body.sheet-printing [data-sheet-clipboard] [data-sheet-clipboard-signatures] {\n    display: flex !important;'));
ok('the write-in spans the line on paper (a pen needs room)', (() => { const s = globals.split('[data-sheet-count-box] > span:last-child {')[1].split('}')[0]; return s.includes('flex: 1 1 auto !important;') && s.includes('dashed'); })());
ok('paper hygiene: a line and its box never split across pages', globals.includes('body.sheet-printing [data-sheet-print] [data-testid="sheet-drill-lines-list"] > li {') && globals.includes('break-inside: avoid;'));
ok('the v2.226 PO paper and the v2.227 sheet paper stand untouched', globals.includes('body.po-printing * { visibility: hidden; }') && globals.includes('body.sheet-printing * { visibility: hidden; }'));

console.log('— the whisper speaks its names —');
ok('the cap is a named law of the wire (WATCHLIST_NAMES_CAP = 3)', wire.includes('const WATCHLIST_NAMES_CAP = 3;') && wire.includes('entry.rows.length < WATCHLIST_NAMES_CAP'));
ok('the candidates query grew ONE cheap column (name)', wire.includes('select: { id: true, storeId: true, name: true, quantityInStock: true, reorderLevel: true },'));
ok('the hint carries the branch\u2019s own numbers (stock/level pairs)', wire.includes('entry.rows.push({') && wire.includes('stock: Number(p?.quantityInStock ?? 0),') && wire.includes('level: Number(p?.reorderLevel ?? 0),'));
ok('the response carries count AND speakers (zero answers empty)', wire.includes('watchlistHints: result.hints.get(`${po.store.id}:${po.supplier.id}`)?.count ?? 0,') && wire.includes('watchlist: result.hints.get(`${po.store.id}:${po.supplier.id}`)?.rows ?? [],'));
ok('the stitch rides inside runWithoutTenant (the leak class never shrinks an org read)', wire.indexOf('runWithoutTenant') < wire.indexOf('rawDb.product.findMany'));
ok('the trigger lives OUTSIDE the drill button (a door inside a door is a lie the DOM refuses)', (() => { const b = ledger.split('data-testid="po-ledger-row"')[1].split('data-testid="po-ledger-cap-note"')[0]; const door = b.indexOf('data-testid={`po-ledger-open-${po.id}`}'); const doorEnd = b.indexOf('</button>', door); const whisper = b.indexOf('data-testid="po-ledger-watchlist-hint"'); return door > -1 && whisper > doorEnd; })());
ok('the whisper is a Radix popover (portaled — the scroll list never clips it)', ledger.includes('<Popover>') && ledger.includes('<PopoverTrigger') && ledger.includes('<PopoverContent'));
ok('zero stays silent: no hints, no trigger', ledger.includes('{po.watchlistHints > 0 && ('));
ok('the popover lists the speakers with the branch\u2019s numbers, read-only', ledger.includes('data-testid="po-ledger-watchlist-popover"') && ledger.includes('data-testid="po-ledger-watchlist-speaker"') && ledger.includes('{num(w.stock)} on shelf / {num(w.level)} floor') && ledger.includes('role="dialog"'));
ok('the cap is disclosed (the whisper names three)', ledger.includes('{po.watchlistHints > po.watchlist.length && (') && ledger.includes('the whisper names three.'));
ok('the law rides the footer (supplier of record)', ledger.includes('supplier of record = the most recent PO that carried the row'));
ok('the amber family on the door and the card (3:1 both halves, dark halves from birth)', ledger.includes('bg-amber-50') && ledger.includes('text-amber-700') && ledger.includes('dark:bg-amber-500/10') && ledger.includes('dark:text-amber-300') && ledger.includes('focus:ring-amber-500/40'));
ok('the roster CSV keeps its seven columns', ledger.includes("const header = 'po_number,status,supplier,branch,lines,ordered_day,total_kes';"));

console.log(`\n${pass} passed, ${failures} failed`);
process.exit(failures > 0 ? 1 : 0);
