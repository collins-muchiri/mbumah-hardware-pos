#!/usr/bin/env node
// verify-v2-256-0.mjs — the v2.256.0 release gate.
//
// THE BIRTH'S DOOR + THE LENS'S EAR: the org PO drill's birth strip
// (v2.249's words) grows the words' own control — "open the sheet"
// hands the parent the SheetDrill's target shape and the ledger opens
// the sheet drill as the PO drill closes (ONE drill at a time). The
// three lens faces learn the keyboard: Escape stands a pressed lens
// down (one home in src/lib/use-lens-escape.ts; a dialog's Escape
// belongs to the dialog). The chips' focus rings learn honesty:
// focus: becomes focus-visible: on every chip. Plus the release face:
// package.json / VERSION / whats-new / CHANGELOG all speak 2.256.0.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

let failures = 0;
let pass = 0;
const ok = (name, cond) => {
  if (cond) { pass++; console.log(`PASS  ${name}`); }
  else { failures++; console.log(`FAIL  ${name}`); }
};
const read = (p) => readFileSync(join(process.cwd(), p), 'utf8');

const drill = read('src/components/org/po-drill.tsx');
const ledger = read('src/components/org/po-ledger.tsx');
const branch = read('src/app/(shell)/tabs/purchase-orders-tab.tsx');
const suppliers = read('src/app/(shell)/tabs/suppliers-tab.tsx');
const ear = read('src/lib/use-lens-escape.ts');
const pkg = JSON.parse(read('package.json'));
const versionFile = read('VERSION').trim();
const whatsNew = read('src/lib/whats-new.ts');
const changelog = read('CHANGELOG.md');

console.log('— the birth\u2019s door —');
ok('PoDrill carries the optional onOpenSheet (the door is additive, never assumed)', drill.includes('onOpenSheet?: (t: { id: string; storeName: string; status: string }) => void') && drill.includes('{onOpenSheet && birthTarget && ('));
ok('the door hands the captured target (no non-null assertions — the narrowing dies at the arrow)', drill.includes('const birthTarget = data?.originStockTake && data.store') && drill.includes('onClick={() => onOpenSheet(birthTarget)}'));
ok('the door wears its own testid + the keyboard-only ring', drill.includes('data-testid="po-drill-birth-door"') && drill.includes('focus-visible:ring-2 focus-visible:ring-violet-500/60'));
ok('the ledger mounts the sheet drill beside the PO drill', ledger.includes("import { SheetDrill, csvCell, type SheetDrillTarget } from './sheet-drill';") && ledger.includes('const [sheetDrill, setSheetDrill] = useState<SheetDrillTarget>(null);') && ledger.includes('{sheetDrill && <SheetDrill target={sheetDrill} onClose={() => setSheetDrill(null)} />}'));
ok('ONE drill at a time — the door closes the PO drill as the sheet opens', ledger.includes('onOpenSheet={(t) => {') && ledger.includes('setDrill(null);') && ledger.includes('setSheetDrill(t);'));

console.log('— the lens\u2019s ear —');
ok('the one home: the ear sleeps while the lens is down, wakes only for Escape', ear.includes('if (!pressed) return;') && ear.includes("if (e.key !== 'Escape') return;"));
ok('the dialog guard reads the live tree at the moment of the keypress', ear.includes("if (document.querySelector('[role=\"dialog\"]')) return;"));
ok('the listener is tidy (added and removed)', ear.includes("window.addEventListener('keydown', onKey);") && ear.includes("window.removeEventListener('keydown', onKey);"));
ok('the org face wears the ear', ledger.includes("import { useLensEscape } from '@/lib/use-lens-escape';") && ledger.includes("useLensEscape(bandLens !== 'ALL', () => setBandLens('ALL'));"));
ok('the branch face wears the ear', branch.includes("import { useLensEscape } from '@/lib/use-lens-escape';") && branch.includes("useLensEscape(bandLens !== 'ALL', () => setBandLens('ALL'));"));
ok('the supplier face wears the ear', suppliers.includes("import { useLensEscape } from '@/lib/use-lens-escape';") && suppliers.includes("useLensEscape(bandLens !== 'ALL', () => setBandLens('ALL'));"));
ok('the three rails say it aloud', ledger.includes('Escape stands the lens down"') && branch.includes('Escape stands the lens down"') && suppliers.includes('Escape stands the lens down"'));

console.log('— the focus\u2019s honesty —');
ok('the bare mouse ring is extinct on all three faces', !ledger.includes('focus:ring-2 focus:ring-sky-500/40') && !branch.includes('focus:ring-2 focus:ring-sky-500/40') && !suppliers.includes('focus:ring-2 focus:ring-sky-500/40'));
const count = (s) => (s.match(/focus-visible:ring-2 focus-visible:ring-sky-500\/40/g) ?? []).length;
ok('the chips wear focus-visible (ledger 5: 2 band + 2 status + 1 origin; branch 2; suppliers 2)', count(ledger) === 5 && count(branch) === 2 && count(suppliers) === 2);

console.log('— the release face —');
ok('package.json version + mbumah metadata speak 2.256.0', pkg.version === '2.256.0' && pkg.mbumah?.releaseVersion === '2.256.0' && pkg.mbumah?.baseVersion === '2.256.0');
ok('VERSION speaks 2.256.0', versionFile === '2.256.0');
ok('whats-new speaks 2.256.0 (the birth\u2019s door + the lens\u2019s ear)', whatsNew.includes("version: '2.256.0',") && whatsNew.includes('The birth\\u2019s door + the lens\\u2019s ear'));
ok('whats-new keeps the pair order (2.256.0 leads 2.255.0)', whatsNew.indexOf("version: '2.256.0',") < whatsNew.indexOf("version: '2.255.0',"));
ok('CHANGELOG speaks 2.256.0', changelog.includes("## [2.256.0] The birth's door + the lens's ear"));

console.log(`\n${pass}/${pass + failures}`);
process.exit(failures ? 1 : 0);
