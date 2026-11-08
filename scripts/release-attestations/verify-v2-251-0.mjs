#!/usr/bin/env node
// verify-v2-251-0.mjs — the v2.251.0 release gate.
//
// THE WALK'S WHEN: the branch detail wire reads the birth's walk aisle's
// own cadence band (the tenant client — the stock-takes' own pattern)
// and the branch strip wears the chip; the org list wire answers each
// row's aisle WHEN (one law read, one band read per DISTINCT aisle);
// the ledger's chip title speaks the days and its CSV grows the
// aisle_band column. Plus the release face: package.json / VERSION /
// whats-new / CHANGELOG all speak 2.251.0.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

let failures = 0;
let pass = 0;
const ok = (name, cond) => {
  if (cond) { pass++; console.log(`PASS  ${name}`); }
  else { failures++; console.log(`FAIL  ${name}`); }
};
const read = (p) => readFileSync(join(process.cwd(), p), 'utf8');

const detailWire = read('src/app/api/purchase-orders/[id]/route.ts');
const orgListWire = read('src/app/api/org/purchase-orders/route.ts');
const tab = read('src/app/(shell)/tabs/purchase-orders-tab.tsx');
const ledger = read('src/components/org/po-ledger.tsx');
const apiTypes = read('src/lib/api.ts');
const pkg = JSON.parse(read('package.json'));
const versionFile = read('VERSION').trim();
const whatsNew = read('src/lib/whats-new.ts');
const changelog = read('CHANGELOG.md');

console.log('— the walk\u2019s when: the branch detail wire —');
ok('detail wire imports the band\u2019s one home + the law\u2019s one reader', detailWire.includes("import { readCategoryBand, type CadenceBand } from '@/lib/cadence-band';") && detailWire.includes("import { readCadenceLaw } from '@/lib/cadence-law';"));
ok('the aisle\u2019s id rides the select', detailWire.includes('walkAisle: { select: { id: true, name: true } },'));
ok('the read rides the tenant client (the stock-takes\u2019 pattern)', detailWire.includes('const law = await readCadenceLaw(db);') && detailWire.includes('const band = await readCategoryBand(db, walkCategoryId, law, new Date());'));
ok('the band rides additive + optional', detailWire.includes('band: aisleBand?.band ?? null,') && detailWire.includes('daysSince: aisleBand?.daysSince ?? null,'));

console.log('— the walk\u2019s when: the branch strip\u2019s chip —');
ok('the tab imports the four houses\u2019 one home', tab.includes("import { bandHouse, chipLabel, daysVoice } from '@/lib/cadence-band';"));
ok('the strip wears the chip (the drill\u2019s sibling)', tab.includes('data-testid="po-detail-aisle-band"') && tab.includes('${bandHouse(detail.originStockTake.walkAisle.band).chip}') && tab.includes('{chipLabel(detail.originStockTake.walkAisle.band)}'));

console.log('— the walk\u2019s when: the org list wire\u2019s row bands —');
ok('the aisle\u2019s id rides the roster\u2019s select', orgListWire.includes('walkAisle: { select: { id: true, name: true } },'));
ok('ONE law read + ONE band read per DISTINCT aisle (the dedupe)', orgListWire.includes('const aisleBands = new Map<string, { band: CadenceBand; daysSince: number | null }>();') && orgListWire.includes('const law = await readCadenceLaw(rawDb);') && orgListWire.includes('for (const aisleId of aisleIds) {'));
ok('the row\u2019s band rides additive + optional', orgListWire.includes('band: result.aisleBands.get(po.originStockTake.walkAisle.id)?.band ?? null,') && orgListWire.includes('daysSince: result.aisleBands.get(po.originStockTake.walkAisle.id)?.daysSince ?? null,'));

console.log('— the walk\u2019s when: the ledger —');
ok('the chip\u2019s title speaks the days voice', ledger.includes("import { daysVoice } from '@/lib/cadence-band';") && ledger.includes('— last heard ${daysVoice({ band: po.originStockTake.walkAisle.band'));
ok('the wire type grows the band', ledger.includes('walkAisle: { name: string | null; band: string | null; daysSince: number | null } | null;'));
ok('the CSV grows the aisle_band column (empty on absence)', ledger.includes("const header = 'po_number,status,supplier,branch,lines,ordered_day,total_kes,birth,aisle,aisle_band';") && ledger.includes("r.originStockTake?.walkAisle?.band ?? '',"));
ok('the shared type grows the band (optional)', apiTypes.includes('walkAisle: { name: string; band?: string | null; daysSince?: number | null } | null'));

console.log('— the release face —');
ok('package.json version + mbumah metadata speak 2.251.0', pkg.version === '2.251.0' && pkg.mbumah?.releaseVersion === '2.251.0' && pkg.mbumah?.baseVersion === '2.251.0');
ok('VERSION speaks 2.251.0', versionFile === '2.251.0');
ok('whats-new speaks 2.251.0 (the walk\u2019s when)', whatsNew.includes("version: '2.251.0',") && whatsNew.includes('The walk\\u2019s when'));
ok('CHANGELOG speaks 2.251.0', changelog.includes("## [2.251.0] The walk's when"));

console.log(`\n${pass}/${pass + failures}`);
process.exit(failures ? 1 : 0);
