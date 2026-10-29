#!/usr/bin/env node
// verify-v2-257-0.mjs — the v2.257.0 release gate.
//
// THE ESCAPE LADDER: the drills had no Escape law of their own (the
// ear's guard correctly hands the key to "the dialog", and the drill
// WAS the dialog). The one home (src/lib/use-lens-escape.ts) grows
// useDrillEscape: the drill closes when it is the tree's ONLY dialog,
// yields to whatever rides above, and the guard reads the live tree at
// the moment of the keypress (the ear's law mirrored). Both drills wear
// the rung; the ladder stacks (Escape pops the topmost layer); the
// headers wear the esc kbd chip and the close buttons speak the words
// with their family rings. Plus the lint audit's bundled tail (inline
// type modifiers + the import() restructure) and the release face:
// package.json / VERSION / whats-new / CHANGELOG all speak 2.257.0.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

let failures = 0;
let pass = 0;
const ok = (name, cond) => {
  if (cond) { pass++; console.log(`PASS  ${name}`); }
  else { failures++; console.log(`FAIL  ${name}`); }
};
const read = (p) => readFileSync(join(process.cwd(), p), 'utf8');

const ear = read('src/lib/use-lens-escape.ts');
const drill = read('src/components/org/po-drill.tsx');
const sheet = read('src/components/org/sheet-drill.tsx');
const pkg = JSON.parse(read('package.json'));
const versionFile = read('VERSION').trim();
const whatsNew = read('src/lib/whats-new.ts');
const changelog = read('CHANGELOG.md');
const payroll = read('src/tests/lib/payroll-run-lifecycle.test.ts');

console.log('— the drills\u2019 rung —');
ok('the one home grew the drill rung (exported beside the ear, never a second file)', ear.includes('export function useDrillEscape(onClose: () => void): void {') && ear.includes('export function useLensEscape(pressed: boolean, onClear: () => void): void {'));
ok('the rung\u2019s law: Escape only, the only-dialog guard, the live tree at keypress', ear.includes("if (e.key !== 'Escape') return;") && ear.includes("if (document.querySelectorAll('[role=\"dialog\"]').length > 1) return;"));
ok('the ear\u2019s own law is byte-unchanged (the guard, the sleep, the live tree)', ear.includes("if (!pressed) return;") && ear.includes("if (document.querySelector('[role=\"dialog\"]')) return;"));
ok('the listener is tidy (added and removed in the rung too)', (ear.match(/window\.addEventListener\('keydown', onKey\);/g) ?? []).length === 2 && (ear.match(/return \(\) => window\.removeEventListener\('keydown', onKey\);/g) ?? []).length === 2);

console.log('— the rungs are wired —');
ok('the PO drill wears its rung (import + call, one home)', drill.includes("import { useDrillEscape } from '@/lib/use-lens-escape';") && drill.includes('useDrillEscape(onClose);'));
ok('the sheet drill wears its rung (import + call, one home)', sheet.includes("import { useDrillEscape } from '@/lib/use-lens-escape';") && sheet.includes('useDrillEscape(onClose);'));
ok('the ear\u2019s three faces keep their own import bytes', ['src/components/org/po-ledger.tsx', 'src/app/(shell)/tabs/purchase-orders-tab.tsx', 'src/app/(shell)/tabs/suppliers-tab.tsx'].every((p) => read(p).includes("import { useLensEscape } from '@/lib/use-lens-escape';")));

console.log('— the hint —');
ok('the PO drill\u2019s header: the esc chip + the close words + the violet ring', drill.includes('data-testid="po-drill-esc-hint"') && drill.includes('title="Escape closes this drill"') && drill.includes('focus-visible:ring-2 focus-visible:ring-violet-500/60'));
ok('the sheet drill\u2019s header: the esc chip + the close words + the amber ring', sheet.includes('data-testid="sheet-drill-esc-hint"') && sheet.includes('title="Escape closes this drill"') && sheet.includes('focus-visible:ring-2 focus-visible:ring-amber-500/60'));
ok('the chips are honest (aria-hidden \u2014 the close button\u2019s own label speaks)', /data-testid="po-drill-esc-hint"[\s\S]{0,120}aria-hidden="true"/.test(drill) && /data-testid="sheet-drill-esc-hint"[\s\S]{0,120}aria-hidden="true"/.test(sheet));

console.log('— the lint audit\u2019s bundled tail —');
ok('type-only imports wear the inline type modifier (the seven files\u2019 class)', read('src/lib/access-control.ts').includes('type UserRole') && read('src/lib/profit.ts').includes('import type Decimal from') && read('src/app/api/update/prepare/route.ts').includes('import { type NextRequest, NextResponse }'));
ok('the forbidden import() annotation is extinct in the payroll test', !payroll.includes("importOriginal<typeof import("));
ok('the payroll test\u2019s mock spread stays typed (Record shape, commented)', payroll.includes('importOriginal<Record<string, unknown>>()'));

console.log('— the release face —');
ok('package.json version + mbumah metadata speak 2.257.0', pkg.version === '2.257.0' && pkg.mbumah?.releaseVersion === '2.257.0' && pkg.mbumah?.baseVersion === '2.257.0');
ok('VERSION speaks 2.257.0', versionFile === '2.257.0');
ok('whats-new speaks 2.257.0 (the escape ladder)', whatsNew.includes("version: '2.257.0',") && whatsNew.includes('The escape ladder'));
ok('whats-new keeps the pair order (2.257.0 leads 2.256.0)', whatsNew.indexOf("version: '2.257.0',") < whatsNew.indexOf("version: '2.256.0',"));
ok('CHANGELOG leads with 2.257.0 (Added + Styled + Tests)', changelog.indexOf('## [2.257.0] The escape ladder') > -1 && changelog.indexOf('## [2.257.0] The escape ladder') < changelog.indexOf('## [2.256.0]') && changelog.includes('### Styled'));

console.log(`\nverify-v2-257-0: ${pass} passed, ${failures} failed`);
process.exit(failures === 0 ? 0 : 1);
