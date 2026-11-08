#!/usr/bin/env node
// verify-v2-253-0.mjs — the v2.253.0 release gate.
//
// THE LEDGER'S LENS: the procurement ledger grows the band rail (the
// window's own lens — four houses + the silent absence, real counts, a
// press narrows the view; the finder's own law: the reading narrows,
// never the fetch), the birth chips wear their aisle's band as the
// house's rail-coloured dot, the houses grow the additive `pressed`
// face in the ONE home, and the birth reaches its fifth face (the
// supplier's PO roster). Plus the release face: package.json / VERSION
// / whats-new / CHANGELOG all speak 2.253.0.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

let failures = 0;
let pass = 0;
const ok = (name, cond) => {
  if (cond) { pass++; console.log(`PASS  ${name}`); }
  else { failures++; console.log(`FAIL  ${name}`); }
};
const read = (p) => readFileSync(join(process.cwd(), p), 'utf8');

const lib = read('src/lib/cadence-band.ts');
const ledger = read('src/components/org/po-ledger.tsx');
const suppliersTab = read('src/app/(shell)/tabs/suppliers-tab.tsx');
const pkg = JSON.parse(read('package.json'));
const versionFile = read('VERSION').trim();
const whatsNew = read('src/lib/whats-new.ts');
const changelog = read('CHANGELOG.md');

console.log('— the houses\u2019 pressed face —');
ok('CadenceBandHouse grows the additive pressed field', lib.includes('export interface CadenceBandHouse {') && lib.includes('  pressed: string;'));
ok('the four houses answer the pressed face (one home)', lib.includes("pressed: 'bg-emerald-600 text-white ring-emerald-600 dark:bg-emerald-400 dark:text-emerald-950 dark:ring-emerald-400'") && lib.includes("pressed: 'bg-amber-600 text-white ring-amber-600 dark:bg-amber-400 dark:text-amber-950 dark:ring-amber-400'") && lib.includes("pressed: 'bg-orange-600 text-white ring-orange-600 dark:bg-orange-400 dark:text-orange-950 dark:ring-orange-400'") && lib.includes("pressed: 'bg-slate-600 text-white ring-slate-600 dark:bg-slate-300 dark:text-slate-900 dark:ring-slate-300'"));

console.log('— the ledger\u2019s lens —');
ok('the lens state rides the view (never the query key)', ledger.includes("const [bandLens, setBandLens] = useState<'ALL' | CadenceBand | 'silent'>('ALL');") && ledger.includes("queryKey: ['org-po-ledger', statusFilter, branchId, originFilter],"));
ok('the row\u2019s band reads behind a membership check', ledger.includes('const rowBand = (r: PoLedgerRow): CadenceBand | null => {') && ledger.includes("return b === 'fresh' || b === 'stale' || b === 'beyond' || b === 'never' ? b : null;"));
ok('the counts are REAL numbers over the window\u2019s rows', ledger.includes('const c = { fresh: 0, stale: 0, beyond: 0, never: 0, silent: 0 };') && ledger.includes('if (b) c[b] += 1;') && ledger.includes('else c.silent += 1;'));
ok('the lens first, then the needle (the fetch never moves)', ledger.includes("data.rows.filter((r) => (bandLens === 'silent' ? rowBand(r) == null : rowBand(r) === bandLens));"));
ok('the rail wears the five families', ledger.includes('data-testid="po-ledger-band-row"') && ledger.includes('data-testid={`po-ledger-band-${b}`}') && ledger.includes('data-testid="po-ledger-band-silent"'));
ok('the toggle law rides (pressed stands down, pressed face from the one home)', ledger.includes("onClick={() => setBandLens(pressed ? 'ALL' : b)}") && ledger.includes("onClick={() => setBandLens(bandLens === 'silent' ? 'ALL' : 'silent')}") && ledger.includes('${pressed ? house.pressed : house.chip}'));
ok('the disclosure rides the rail (the rungs stay the wire\u2019s; the CSV the whole window; v2.256.0: the ear\u2019s words joined the title)', ledger.includes('title="the window\'s own lens — the rungs above stay the wire\'s; the CSV speaks the whole window regardless; Escape stands the lens down"'));
ok('the lens has its own empty face', ledger.includes('data-testid="po-ledger-lens-empty"') && ledger.includes('the lens narrowed the window to nothing — lift a band house or clear the finder and the orders return.'));
ok('the export law holds (the file speaks the whole window)', ledger.includes('const csv = rosterCsv(data.rows, { costGated: data.costGated });'));

console.log('— the birth\u2019s band dot —');
ok('the ledger\u2019s birth chip wears the rail-coloured dot (one home)', ledger.includes('data-testid="po-ledger-row-band-dot"') && ledger.includes('${bandHouse(po.originStockTake.walkAisle.band as CadenceBand).rail}'));
ok('a silent read keeps the plain violet', ledger.includes('{po.originStockTake?.walkAisle?.band && ('));

console.log('— the birth\u2019s fifth face (the supplier\u2019s roster) —');
ok('the supplier\u2019s PO rows wear the violet birth chip', suppliersTab.includes('data-testid="supplier-po-birth-chip"') && suppliersTab.includes('BORN AT A COUNT SHEET'));
ok('the chip wears its aisle\u2019s band as the same rail-coloured dot', suppliersTab.includes('data-testid="supplier-po-band-dot"') && suppliersTab.includes('${bandHouse(po.originStockTake.walkAisle.band as CadenceBand).rail}'));
ok('the chip\u2019s title speaks the full voice (sheet, aisle, days)', suppliersTab.includes("title={`born at count sheet ${po.originStockTake.id}") && suppliersTab.includes("daysVoice({ band: po.originStockTake.walkAisle.band as CadenceBand, daysSince: po.originStockTake.walkAisle.daysSince ?? null })"));
ok('the houses ride the ONE home (the import grew chipLabel at v2.255.0 \u2014 the lens\u2019s own words)', suppliersTab.includes("import { bandHouse, chipLabel, daysVoice, type CadenceBand } from '@/lib/cadence-band';"));

console.log('— the release face —');
ok('package.json version + mbumah metadata speak 2.253.0', pkg.version === '2.253.0' && pkg.mbumah?.releaseVersion === '2.253.0' && pkg.mbumah?.baseVersion === '2.253.0');
ok('VERSION speaks 2.253.0', versionFile === '2.253.0');
ok('whats-new speaks 2.253.0 (the ledger\u2019s lens)', whatsNew.includes("version: '2.253.0',") && whatsNew.includes('The ledger\\u2019s lens'));
ok('CHANGELOG speaks 2.253.0', changelog.includes("## [2.253.0] The ledger's lens"));

console.log(`\n${pass}/${pass + failures}`);
process.exit(failures ? 1 : 0);
