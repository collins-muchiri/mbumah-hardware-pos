#!/usr/bin/env node
// verify-v2-229-0.mjs — the v2.229.0 release gate.
//
// Reads the SOURCE OF RECORD and asserts the release's laws: THE BRANCH
// WALK (the clipboard's branch-side twin — the branch stocktake face
// carries the SAME body class, the SAME data vocabulary and, while the
// sheet still counts, the SAME three print-only fittings: the floor-copy
// note, an empty count box on every line, the signature rules at the
// foot; the mode IS the sheet's status; the controls stay off the
// paper; the body-class gate rides above the early return), THE PAPER
// NAMES ITS BRANCH (the detail wire's additive store block, the header
// line's store name), THE SHEET'S DOORS AT BRANCH LEVEL (Print +
// CSV under the same gate; the file rides the drill's own exported
// sheetLinesCsv — never re-invented; the branch's cost gate is the
// panel's own prop), THE SHARED LINES MARK (both faces wear
// data-sheet-lines; the print CSS grows additive selectors; the drill's
// testid-keyed rules stand untouched), and the release face:
// package.json / VERSION / whats-new / CHANGELOG all speak 2.229.0.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

let failures = 0;
let pass = 0;
const ok = (name, cond) => {
  if (cond) { pass++; console.log(`PASS  ${name}`); }
  else { failures++; console.log(`FAIL  ${name}`); }
};
const read = (p) => readFileSync(join(process.cwd(), p), 'utf8');

const panel = read('src/components/inventory/stock-take-panel.tsx');
const sheetDrill = read('src/components/org/sheet-drill.tsx');
const globals = read('src/app/globals.css');
const detailWire = read('src/app/api/stock-takes/[id]/route.ts');
const pkg = JSON.parse(read('package.json'));
const version = read('VERSION').trim();
const whatsNew = read('src/lib/whats-new.ts');
const changelog = read('CHANGELOG.md');

console.log('— the release face —');
ok('package.json releaseVersion 2.229.0', pkg.mbumah.releaseVersion === '2.229.0');
ok('package.json baseVersion 2.229.0', pkg.mbumah.baseVersion === '2.229.0');
ok('package.json version 2.229.0', pkg.version === '2.229.0');
ok('VERSION 2.229.0', version === '2.229.0');
ok('verify gate wired', pkg.scripts['verify:v2-229-0'] === 'node scripts/verify-v2-229-0.mjs');
ok('whats-new entry at the head', whatsNew.includes("version: '2.229.0',") && whatsNew.indexOf("version: '2.229.0',") < whatsNew.indexOf("version: '2.228.0',"));
ok('whats-new title speaks the branch walk', whatsNew.includes("title: 'The branch walk',"));
ok('changelog anchors the section above its ancestor (headers, never bare strings)', changelog.indexOf('## [2.229.0]') >= 0 && changelog.indexOf('## [2.229.0]') < changelog.indexOf('## [2.228.0]'));

console.log('— the branch walk (the panel\u2019s paper) —');
ok('the body-class gate rides above the early return (the v2.226 lesson bank)', panel.indexOf("document.body.classList.add('sheet-printing')") > -1 && panel.indexOf("document.body.classList.add('sheet-printing')") < panel.indexOf('if (!storeId) return null;'));
ok('the gate is a boolean derivation (stable across refetches)', panel.includes('const sheetPaperOpen = !!(openSheetId && detail);'));
ok('the class is removed on unmount (the class lives as long as the face)', panel.includes("document.body.classList.remove('sheet-printing')"));
ok('the mode IS the sheet status (one derivation)', panel.includes("const isClipboard = detail?.status === 'COUNTING';"));
ok('the card carries the overlay mark', panel.includes('data-sheet-print-overlay=""'));
ok('the chrome stays off the paper (CardHeader print-off)', panel.includes('<CardHeader className="pb-3" data-sheet-print-off="">'));
ok('the sheet face carries the print mark + the clipboard attribute conditionally', panel.includes('data-sheet-print=""') && panel.includes("{...(isClipboard ? { 'data-sheet-clipboard': '' } : {})}"));
ok('the floor-copy note exists and speaks the branch\u2019s walk', panel.includes('data-sheet-clipboard-note=""') && panel.includes("floor copy — walk the shelves, write what you see; this app holds the pens when you&apos;re back."));
ok('every line gets its count box (the box mounts inside the line map)', panel.split('<div data-sheet-lines=""')[1].split("the walk's witnesses")[0].includes('data-sheet-count-box=""'));
ok('the box is EMPTY (the shelf\u2019s ask, not the system\u2019s echo)', (() => { const b = panel.split('data-sheet-count-box=""')[1].split('</span>\n                    )}')[0]; return b.includes('counted') && !/\{num\(/.test(b); })());
ok('the walk\u2019s witnesses at the foot (counted by / checked by / date)', panel.includes('data-testid="stocktake-signatures"') && panel.includes('data-sheet-clipboard-signatures=""') && panel.includes('counted by') && panel.includes('checked by'));
ok('the controls stay off the paper (inputs, close zone, result faces)', panel.includes('<span className="flex items-center gap-1" data-sheet-print-off="">') && panel.includes('<div className="space-y-2" data-sheet-print-off="">') && panel.includes('data-testid="stocktake-cancelled-face" data-sheet-print-off=""') && panel.includes('data-testid="stocktake-close-success" data-sheet-print-off=""'));

console.log('— the paper names its branch —');
ok('the wire includes the store block (additive, zero new fetch)', detailWire.includes('store: { select: { id: true, name: true, code: true } },'));
ok('the response carries the store truth', detailWire.includes('store: { id: sheet.store.id, name: sheet.store.name, code: sheet.store.code },'));
ok('the header line wears the branch\u2019s name', panel.includes('data-testid="stocktake-store-name"') && panel.includes('{detail.store.name}'));

console.log('— the sheet\u2019s doors at branch level —');
ok('the Print door exists and speaks both modes', panel.includes('data-testid="stocktake-print"') && panel.includes("`Print the floor's clipboard — ${detail.lines.length} lines with empty count boxes`") && panel.includes('`Print all ${detail.lines.length} lines of the count sheet at ${detail.store.name}`'));
ok('the CSV door exists', panel.includes('data-testid="stocktake-export"'));
ok('both doors mount under the SAME gate (an absent control never lies)', (() => { const d = panel.split("the sheet's two doors")[1].split('← all sheets')[0]; return d.includes('detail.lines.length > 0 && (') && d.includes('data-testid="stocktake-print"') && d.includes('data-testid="stocktake-export"'); })());
ok('the file rides the SAME builder the drill exports (never re-invented)', panel.includes("import { sheetLinesCsv } from '@/components/org/sheet-drill';") && panel.includes('const csv = sheetLinesCsv(detail.lines, { costGated: sheetCostGated });'));
ok('the file speaks the WHOLE sheet and names the branch (the filename law)', panel.includes("const name = `count-sheet-${detail.store.code ?? detail.store.name}-${stamp}-${detail.status.toLowerCase()}.csv`;") && !panel.includes('shownLines'));
ok('the branch cost gate is the panel\u2019s own prop', panel.includes('const sheetCostGated = !canViewCost;'));

console.log('— the shared lines mark —');
ok('the branch lines container wears the mark', panel.includes('<div data-sheet-lines="" className="max-h-[46vh] space-y-1.5 overflow-y-auto pr-1">'));
ok('the drill\u2019s list wears the same mark (one law, two faces)', sheetDrill.includes('<ul data-testid="sheet-drill-lines-list" data-sheet-lines=""'));
ok('the shared lines release exists (the scroll clamp falls on paper)', globals.includes('body.sheet-printing [data-sheet-print] [data-sheet-lines] {\n    max-height: none !important;\n    overflow: visible !important;\n  }'));
ok('the branch line hygiene (a line and its box never split)', globals.includes('body.sheet-printing [data-sheet-print] [data-sheet-lines] > div {') && globals.split('[data-sheet-lines] > div {')[1].split('}')[0].includes('break-inside: avoid;'));
ok('the drill\u2019s testid-keyed rules stand untouched (additive, never a rewrite)', globals.includes('body.sheet-printing [data-sheet-print] [data-testid="sheet-drill-lines-list"] {') && globals.includes('body.sheet-printing [data-sheet-print] [data-testid="sheet-drill-lines-list"] > li {'));
ok('the v2.228 screen hide and print flips stand', globals.includes('[data-sheet-clipboard] [data-sheet-count-box],') && globals.includes('[data-sheet-clipboard] [data-sheet-clipboard-signatures] { display: none; }') && globals.includes('body.sheet-printing [data-sheet-clipboard] [data-sheet-clipboard-note] {'));
ok('the amber family rides the note and the doors (the sheet\u2019s hue)', panel.includes('border border-dashed border-amber-300 bg-amber-50/60') && panel.split('data-testid="stocktake-print"')[1].split('← all sheets')[0].includes('focus:ring-amber-500/40'));

console.log(`\n${pass} passed, ${failures} failed`);
process.exit(failures > 0 ? 1 : 0);
