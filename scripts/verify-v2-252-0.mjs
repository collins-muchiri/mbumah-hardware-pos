#!/usr/bin/env node
// verify-v2-252-0.mjs — the v2.252.0 release gate.
//
// THE WALK'S OPTIONS: the count-sheet category picker leaves the native
// <option> behind — a Radix listbox whose rows wear the walk's voices
// (the name, the band chip, the count, the days voice); the shared
// SelectItem grows the additive `detail` door; the branch list wire
// reads the sheet-born rows' aisle bands (the deduped read, the tenant
// client) and the roster's birth chip title speaks the days. Plus the
// release face: package.json / VERSION / whats-new / CHANGELOG all
// speak 2.252.0.

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
const selectUi = read('src/components/ui/select.tsx');
const listWire = read('src/app/api/purchase-orders/route.ts');
const tab = read('src/app/(shell)/tabs/purchase-orders-tab.tsx');
const pkg = JSON.parse(read('package.json'));
const versionFile = read('VERSION').trim();
const whatsNew = read('src/lib/whats-new.ts');
const changelog = read('CHANGELOG.md');

console.log('— the walk\u2019s options: the listbox —');
ok('the picker rides the shared Radix door', panel.includes("import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';"));
ok('the door law rides unchanged (a hand\u2019s pick clears the door voice + flag)', panel.includes('value={createCategoryId || undefined}') && panel.includes('onValueChange={(v) => { setCreateCategoryId(v); setDoorVoice(null); setDoorBorn(false); }}'));
ok('the trigger keeps its name and composes the picked face', panel.includes('data-testid="stocktake-create-category"') && panel.includes('data-testid="stocktake-create-category-chip"') && panel.includes('{pickedCategory ? ('));
ok('the option rows wear the chip, the count, the days voice', panel.includes('detail={') && panel.includes('data-testid={`stocktake-option-cadence-${c.id}`}') && panel.includes("${pickBandHouse(c.cadence.band).chip}"));

console.log('— the shared listbox\u2019s detail door —');
ok('SelectItem grows the additive detail prop (after the ItemText)', selectUi.includes('detail?: React.ReactNode;') && selectUi.includes('<SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>\n      {detail != null && ('));

console.log('— the branch roster\u2019s when —');
ok('the list wire imports the band\u2019s one home + the law\u2019s one reader', listWire.includes("import { readCategoryBand, type CadenceBand } from '@/lib/cadence-band';") && listWire.includes("import { readCadenceLaw } from '@/lib/cadence-law';"));
ok('the aisle\u2019s id rides the roster\u2019s select', listWire.includes('walkAisle: { select: { id: true, name: true } },'));
ok('ONE law read + ONE band read per DISTINCT aisle via the tenant client', listWire.includes('const aisleBands = new Map<string, { band: CadenceBand; daysSince: number | null }>();') && listWire.includes('const law = await readCadenceLaw(db);') && listWire.includes('const band = await readCategoryBand(db, aisleId, law, new Date());'));
ok('the row\u2019s band rides additive + optional', listWire.includes('band: aisleBands.get(poData.originStockTake.walkAisle.id)?.band ?? null,') && listWire.includes('daysSince: aisleBands.get(poData.originStockTake.walkAisle.id)?.daysSince ?? null,'));
ok('the roster chip\u2019s title speaks the days voice', tab.includes('data-testid="po-row-birth-chip"') && tab.includes("daysVoice({ band: po.originStockTake.walkAisle.band as 'fresh' | 'stale' | 'beyond' | 'never', daysSince: po.originStockTake.walkAisle.daysSince })"));

console.log('— the release face —');
ok('package.json version + mbumah metadata speak 2.252.0', pkg.version === '2.252.0' && pkg.mbumah?.releaseVersion === '2.252.0' && pkg.mbumah?.baseVersion === '2.252.0');
ok('VERSION speaks 2.252.0', versionFile === '2.252.0');
ok('whats-new speaks 2.252.0 (the walk\u2019s options)', whatsNew.includes("version: '2.252.0',") && whatsNew.includes('The walk\\u2019s options'));
ok('CHANGELOG speaks 2.252.0', changelog.includes("## [2.252.0] The walk's options"));

console.log(`\n${pass}/${pass + failures}`);
process.exit(failures ? 1 : 0);
