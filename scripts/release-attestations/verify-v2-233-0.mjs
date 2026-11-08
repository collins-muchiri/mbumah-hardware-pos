#!/usr/bin/env node
// verify-v2-233-0.mjs — the v2.233.0 release gate.
//
// Reads the SOURCE OF RECORD and asserts the release's laws: THE NOTE
// BECOMES A RECORD (the pure lineage reader + the shared amber chip),
// THE ORG MAP'S ROSTERS WEAR THE LINEAGE (chip beside the status,
// why-line under a cancelled row, live row upgrade — all from the
// notes the kpi wire ALREADY carries), THE DRILL'S THREE FACES (the
// amber record face with the full source id + the status voice, the
// why-the-void face, the verbatim box untouched), THE BRANCH FACE
// WEARS IT TOO (roster chip, sheet lineage under the header, the
// cancelled reason named), ZERO NEW FETCHES (no endpoint, no column,
// no fetch — the faces read what the wires already said), and the
// styling house (the amber family at 3:1, dark halves from birth,
// the muted family on the why-lines, the paper carries its lineage).
// Plus the release face: package.json / VERSION / whats-new /
// CHANGELOG all speak 2.233.0, and the muted-family fossil (62
// mounts in kpi-row) stands untouched.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

let failures = 0;
let pass = 0;
const ok = (name, cond) => {
  if (cond) { pass++; console.log(`PASS  ${name}`); }
  else { failures++; console.log(`FAIL  ${name}`); }
};
const read = (p) => readFileSync(join(process.cwd(), p), 'utf8');

const primitives = read('src/components/org/primitives.tsx');
const map = read('src/components/org/variance-map.tsx');
const drill = read('src/components/org/sheet-drill.tsx');
const panel = read('src/components/inventory/stock-take-panel.tsx');
const kpiRow = read('src/components/org/kpi-row.tsx');
const kpiWire = read('src/app/api/org/kpi-summary/route.ts');
const drillWire = read('src/app/api/org/stock-takes/[id]/route.ts');
const pkg = JSON.parse(read('package.json'));
const version = read('VERSION').trim();
const whatsNew = read('src/lib/whats-new.ts');
const changelog = read('CHANGELOG.md');

console.log('— the release face —');
ok('package.json releaseVersion 2.233.0', pkg.mbumah.releaseVersion === '2.233.0');
ok('package.json baseVersion 2.233.0', pkg.mbumah.baseVersion === '2.233.0');
ok('package.json version 2.233.0', pkg.version === '2.233.0');
ok('VERSION 2.233.0', version === '2.233.0');
ok('verify gate wired', pkg.scripts['verify:v2-233-0'] === 'node scripts/verify-v2-233-0.mjs');
ok('whats-new entry at the head', whatsNew.includes("version: '2.233.0',") && whatsNew.indexOf("version: '2.233.0',") < whatsNew.indexOf("version: '2.232.0',"));
ok('whats-new title speaks the lineage', whatsNew.includes("title: 'The lineage',"));
ok('changelog anchors the section above its ancestor (headers, never bare strings)', changelog.indexOf('## [2.233.0]') >= 0 && changelog.indexOf('## [2.233.0]') < changelog.indexOf('## [2.232.0]'));

console.log('— the reader (pure by law) —');
ok('the parser is exported and pure', primitives.includes('export function parseSheetLineage') && primitives.includes('export interface SheetLineage'));
ok('the recount clause is anchored, case-insensitive, id [\\w-]+ with a verbatim remainder', primitives.includes("trimmed.match(/^recount of sheet\\s+([\\w-]+)\\s*(.*)$/i)"));
ok('the plain-note arm keeps the text verbatim', primitives.includes("return { kind: 'note', sourceSheetId: null, text: trimmed, remainder: '' };"));
ok('the honest absence: null / undefined / empty / whitespace read null', primitives.includes('const trimmed = (notes ?? \'\').trim();') && primitives.includes('if (!trimmed) return null;'));
ok('the whisper keeps the last six with the ellipsis', primitives.includes('id.length > 6 ? `…${id.slice(-6)}` : id'));

console.log('— the shared chip (one house style) —');
ok('the chip takes the caller\u2019s testId', primitives.includes('testId: string;') && primitives.includes('data-testid={testId}'));
ok('the FULL id rides title AND aria-label (eye whispers, ear records)', primitives.includes('title={voice}') && primitives.includes('aria-label={voice}') && primitives.includes("const voice = `recount of sheet ${lineage.sourceSheetId}`;"));
ok('the amber house at 3:1, tabular id', primitives.includes('bg-amber-50 px-1.5 py-0.5 text-[9px] font-semibold tabular-nums text-amber-800 ring-1 ring-amber-200'));
ok('dark halves from birth', primitives.includes('dark:bg-amber-500/10 dark:text-amber-200 dark:ring-amber-500/30'));

console.log('— the org map\u2019s rosters —');
ok('the map imports the reader and the chip', map.includes('parseSheetLineage, LineageChip,'));
ok('the recent roster wears the chip keyed per sheet', map.includes('testId={`variance-map-lineage-${s.id}`}') && map.includes("{lineage?.kind === 'recount' && lineage.sourceSheetId && ("));
ok('a cancelled row grows the honest why-line', map.includes("const whyLine = s.status === 'CANCELLED' && lineage?.kind === 'note' ? lineage.text : null;") && map.includes('data-testid={`variance-map-why-${s.id}`}') && map.includes('why: {whyLine}'));
ok('the why-line\u2019s full text rides the hover', map.includes('title={whyLine}'));
ok('the why-line wears the muted family in italic with the row divider', map.includes('w-full truncate border-t border-slate-100 pt-1 text-[10px] italic text-slate-500 dark:border-slate-800 dark:text-slate-400'));
ok('the live row upgrades: chip replaces the recount murmur, plain notes verbatim', map.includes('testId={`variance-map-lineage-${s.id}`}') && map.includes("{s.notes ? ` · ${s.notes}` : ''}"));
ok('the map never fetches for the lineage (the observer is the ONLY query)', (map.match(/= useQuery/g) ?? []).length === 1 && map.includes('the variance map never fetches — it observes the shared currency cache') && !map.includes('authorizedFetchJson'));

console.log('— the drill\u2019s three faces —');
ok('the drill imports the reader', drill.includes("import { num, timeAgo, parseSheetLineage } from './primitives';"));
ok('the recount lineage wears the amber record face with the FULL id', drill.includes('data-testid="sheet-drill-lineage"') && drill.includes('recount of sheet <span className="tabular-nums">{lineage.sourceSheetId}</span>'));
ok('a remainder rides the face verbatim', drill.includes('{lineage.remainder && <p className="mt-0.5">{lineage.remainder}</p>}'));
ok('the status voice answers counting / closed / cancelled', drill.includes("'the re-walk is on the floor — these lines were the last dispute.'") && drill.includes("'the dispute was re-walked — this sheet is the verdict.'") && drill.includes("'the re-walk was voided before it spoke.'"));
ok("a cancelled sheet's note earns the why-the-void face", drill.includes('data-testid="sheet-drill-void-why"') && drill.includes('why the void: {why}'));
ok('a plain note keeps the verbatim box (untouched)', drill.includes('data-testid="sheet-drill-notes"'));
ok('the three faces ride the paper (no print-off in the lineage block)', (() => {
  const block = drill.slice(drill.indexOf('v2.233.0 THE LINEAGE'), drill.indexOf('The lines — read-only.'));
  return block.length > 0 && !block.includes('data-sheet-print-off');
})());
ok('the drill stays READ-ONLY BY LAW (the lineage adds no pen)', drill.includes('READ-ONLY BY LAW') && !drill.includes('authorizedFetchJson'));

console.log('— the branch face —');
ok('the panel imports the reader and the chip', panel.includes("import { num, parseSheetLineage, LineageChip } from '@/components/org/primitives';"));
ok('the roster row upgrades: chip replaces the recount text, plain notes verbatim', panel.includes('testId={`stocktake-lineage-${sheet.id}`}') && panel.includes('return <span className="block truncate text-[10px] text-slate-500 dark:text-slate-400">{sheet.notes}</span>;'));
ok('the walker\u2019s sheet wears the lineage under the header (full id, rides the paper)', panel.includes('data-testid="stocktake-sheet-lineage"') && panel.includes('recount of sheet <span className="font-semibold tabular-nums">{lineage.sourceSheetId}</span>'));
ok('the sheet-lineage block carries no print-off mark', (() => {
  const block = panel.slice(panel.indexOf('v2.233.0 THE LINEAGE'), panel.indexOf('v2.229.0: the clipboard'));
  return block.length > 0 && !block.includes('data-sheet-print-off');
})());
ok('the cancelled face names its reason', panel.includes('data-testid="stocktake-cancelled-why"') && panel.includes('why: {cancelledFace.notes}'));

console.log('— the wire truth (zero new fetches) —');
ok('the kpi wire selects notes on the open sheets query', kpiWire.slice(kpiWire.indexOf("where: { status: 'COUNTING' },"), kpiWire.indexOf('orderBy: { startedAt: \'desc\' },\n        take: 12')).includes('notes: true,'));
ok('the kpi wire selects notes on the recent roster query', kpiWire.slice(kpiWire.indexOf('orderBy: { startedAt: \'desc\' },\n        take: 12'), kpiWire.indexOf('countedBySheet')).includes('notes: true,'));
ok('the kpi wire voices notes on both row families', (kpiWire.match(/notes: s\.notes,/g) ?? []).length === 2);
ok('the drill wire voices the sheet\u2019s own note', drillWire.includes('notes: sheet.notes,'));
ok('no new endpoint, no new param, no new fetch anywhere this round', !kpiWire.includes('recountOf') && !map.includes('useQuery<SheetLineage') && !drill.includes('authorizedFetchJson'));

console.log('— the fossil guards —');
ok('the kpi-row muted family stays at exactly 62 mounts (vat-spark\u2019s pin, re-guarded)', (kpiRow.match(/text-slate-500 dark:text-slate-400/g) ?? []).length === 62);
ok('the drill\u2019s muted sub-lines keep the house family', drill.includes('text-slate-500 dark:text-slate-400'));
ok('the changelog section speaks the added + styled faces', changelog.slice(changelog.indexOf('## [2.233.0]'), changelog.indexOf('## [2.232.0]')).includes('### Added') && changelog.slice(changelog.indexOf('## [2.233.0]'), changelog.indexOf('## [2.232.0]')).includes('### Styled'));
ok('the changelog names the parser and the faces', changelog.includes('parseSheetLineage') && changelog.includes('variance-map-lineage-{id}') && changelog.includes('sheet-drill-void-why'));

console.log(`\n${pass} passed, ${failures} failed`);
process.exit(failures > 0 ? 1 : 0);
