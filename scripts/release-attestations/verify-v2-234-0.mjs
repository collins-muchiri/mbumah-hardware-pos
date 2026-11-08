#!/usr/bin/env node
// verify-v2-234-0.mjs — the v2.234.0 release gate.
//
// Reads the SOURCE OF RECORD and asserts the release's laws: THE
// LINEAGE READS BACKWARDS (the additive recountedBy block on BOTH
// detail wires — one bounded findFirst over the spawn's exact notes
// signature, the child's units riding the same read, the units law
// not the shillings law), THE VERDICT FACE (emerald beneath the
// lineage faces, the full child id, the four status voices), THE
// VERDICT DOOR (one button re-keys the map's drill via the optional
// onOpenSheet prop — navigation, never a pen; the face rides the
// paper, the control does not), THE BRANCH VERDICT LINE (a line,
// never a nav control), and the fossil guards (v2.233.0's lineage
// faces still speak; the muted family stays 62). Plus the release
// face: package.json / VERSION / whats-new / CHANGELOG all speak
// 2.234.0.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

let failures = 0;
let pass = 0;
const ok = (name, cond) => {
  if (cond) { pass++; console.log(`PASS  ${name}`); }
  else { failures++; console.log(`FAIL  ${name}`); }
};
const read = (p) => readFileSync(join(process.cwd(), p), 'utf8');

const drill = read('src/components/org/sheet-drill.tsx');
const map = read('src/components/org/variance-map.tsx');
const panel = read('src/components/inventory/stock-take-panel.tsx');
const orgWire = read('src/app/api/org/stock-takes/[id]/route.ts');
const branchWire = read('src/app/api/stock-takes/[id]/route.ts');
const kpiRow = read('src/components/org/kpi-row.tsx');
const pkg = JSON.parse(read('package.json'));
const version = read('VERSION').trim();
const whatsNew = read('src/lib/whats-new.ts');
const changelog = read('CHANGELOG.md');

console.log('— the release face —');
ok('package.json releaseVersion 2.234.0', pkg.mbumah.releaseVersion === '2.234.0');
ok('package.json baseVersion 2.234.0', pkg.mbumah.baseVersion === '2.234.0');
ok('package.json version 2.234.0', pkg.version === '2.234.0');
ok('VERSION 2.234.0', version === '2.234.0');
ok('verify gate wired', pkg.scripts['verify:v2-234-0'] === 'node scripts/verify-v2-234-0.mjs');
ok('whats-new entry at the head', whatsNew.includes("version: '2.234.0',") && whatsNew.indexOf("version: '2.234.0',") < whatsNew.indexOf("version: '2.233.0',"));
ok('whats-new title speaks the verdict', whatsNew.includes("title: 'The verdict',"));
ok('changelog anchors the section above its ancestor (headers, never bare strings)', changelog.indexOf('## [2.234.0]') >= 0 && changelog.indexOf('## [2.234.0]') < changelog.indexOf('## [2.233.0]'));

console.log('— the verdict wire (both detail wires, one law) —');
ok('the org wire grows the bounded findFirst over the spawn signature', orgWire.includes('const recountedByRow = await db.stockTake.findFirst({') && orgWire.includes("OR: [{ notes: { equals: `recount of sheet ${id}` } }, { notes: { startsWith: `recount of sheet ${id} ` } }],"));
ok('the branch wire grows the SAME block', branchWire.includes('const recountedByRow = await db.stockTake.findFirst({') && branchWire.includes("OR: [{ notes: { equals: `recount of sheet ${id}` } }, { notes: { startsWith: `recount of sheet ${id} ` } }],"));
ok('the clause stays EXACT (the trailing-space arm)', orgWire.includes("startsWith: `recount of sheet ${id} `") && branchWire.includes("startsWith: `recount of sheet ${id} `"));
ok('latest child first', orgWire.includes("orderBy: { startedAt: 'desc' },") && branchWire.includes("orderBy: { startedAt: 'desc' },"));
ok('the child rides the SAME read (lines come with it)', orgWire.includes("lines: { where: { variance: { not: null } }, select: { variance: true } },") && branchWire.includes("lines: { where: { variance: { not: null } }, select: { variance: true } },"));
ok('the units law: units speak ONLY once the child is CLOSED', orgWire.includes("recountedByRow.status === 'CLOSED'") && branchWire.includes("recountedByRow.status === 'CLOSED'"));
ok('the shillings law untouched — no cost field in the verdict block', !orgWire.slice(orgWire.indexOf('v2.234.0 THE VERDICT'), orgWire.indexOf('const counted =')).includes('varianceCost'));
ok('the response voice is additive (null honest absence)', orgWire.includes('recountedBy,') && branchWire.includes('recountedBy,'));

console.log('— the verdict face (org drill) —');
ok('the client type stays optional', drill.includes('recountedBy?: { id: string; status: string; closedAt: string | null; varianceUnits: number | null } | null;'));
ok('the face mounts keyed sheet-drill-verdict', drill.includes('data-testid="sheet-drill-verdict"') && drill.includes('re-walked by sheet <span className="tabular-nums">{child.id}</span>'));
ok('the units figure rides the headline (tabular)', drill.includes('<span className="ml-1.5 tabular-nums">· {num(child.varianceUnits)} units</span>'));
ok('the status voice answers all four verdicts', drill.includes("'the re-walk found the shelf true — the dispute settled at zero.'") && drill.includes('`the re-walk spoke — ${num(child.varianceUnits)} units between book and shelf.`') && drill.includes("'the re-walk is on the floor — the verdict waits.'") && drill.includes("'the re-walk was voided before it spoke.'"));
ok('the emerald house, dark halves from birth', drill.includes('border border-emerald-200 bg-emerald-50/60 px-2.5 py-1.5 text-[10px] text-emerald-800') && drill.includes('dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-200') && drill.includes('text-[9px] text-emerald-700 dark:text-emerald-300/80'));
ok('the face sits BENEATH the lineage faces (ancestry above verdict)', drill.indexOf('sheet-drill-lineage') >= 0 && drill.indexOf('sheet-drill-verdict') > drill.indexOf('sheet-drill-lineage'));

console.log('— the verdict door (navigation, never a pen) —');
ok('the optional onOpenSheet prop carries the door', drill.includes('onOpenSheet?: (next: { id: string; storeName: string; status: string }) => void'));
ok('the button re-keys the drill onto the child', drill.includes('data-testid="sheet-drill-verdict-open"') && drill.includes('onOpenSheet({ id: child.id, storeName: target.storeName, status: child.status })'));
ok('the aria names the child it opens', drill.includes('aria-label={`Open the re-walk sheet ${child.id} in this drill`}'));
ok('the face rides the paper; the control stays off it', (() => {
  const block = drill.slice(drill.indexOf('v2.234.0 THE VERDICT'), drill.indexOf('The lines — read-only.'));
  return block.includes('data-testid="sheet-drill-verdict-open"\n                        data-sheet-print-off=""');
})());
ok('the map hands the drill its door (the re-key law)', map.includes('onOpenSheet={(next) => setDrill(next)}') && map.includes('key={drill.id}'));
ok('the read-only law stands (no pens, no fetch added to the drill)', drill.includes('READ-ONLY BY LAW') && !drill.includes('authorizedFetchJson'));

console.log('— the branch verdict line —');
ok('the client type stays optional', panel.includes('recountedBy?: { id: string; status: string; closedAt: string | null; varianceUnits: number | null } | null;'));
ok('the line mounts under the header (full id + voice, riding the paper)', panel.includes('data-testid="stocktake-recounted-by"') && panel.includes('re-walked by sheet <span className="font-semibold tabular-nums">{child.id}</span>'));
ok('a LINE, never a nav control', !panel.slice(panel.indexOf('v2.234.0 THE VERDICT — the lineage BACKWARDS at the'), panel.indexOf("v2.229.0: the clipboard's floor-copy note")).includes('<button'));
ok('the verdict voice answers at the pens', panel.includes("'the re-walk found the shelf true'") && panel.includes("'the re-walk is on the floor — the verdict waits'") && panel.includes("'the re-walk was voided before it spoke'"));

console.log('— the fossil guards —');
ok('the v2.233.0 lineage faces still speak', map.includes('testId={`variance-map-lineage-${s.id}`}') && map.includes('data-testid={`variance-map-why-${s.id}`}') && drill.includes('data-testid="sheet-drill-lineage"') && panel.includes('data-testid="stocktake-sheet-lineage"'));
ok('the kpi-row muted family stays at exactly 62 mounts', (kpiRow.match(/text-slate-500 dark:text-slate-400/g) ?? []).length === 62);
ok('the changelog speaks the added + styled faces', changelog.slice(changelog.indexOf('## [2.234.0]'), changelog.indexOf('## [2.233.0]')).includes('### Added') && changelog.slice(changelog.indexOf('## [2.234.0]'), changelog.indexOf('## [2.233.0]')).includes('### Styled'));

console.log(`\n${pass} passed, ${failures} failed`);
process.exit(failures > 0 ? 1 : 0);
