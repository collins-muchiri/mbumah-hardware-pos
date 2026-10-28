#!/usr/bin/env node
// verify-v2-240-0.mjs — the v2.240.0 release gate.
//
// THE ROSTER'S BIRTH (kpi roster queries grow origin; the map's live +
// roster rows wear the violet chip), THE BRANCH'S ECHO (the branch
// detail wire grows origin; the branch face wears the same chip), the
// one-motion bar law, and the fossil guards (the allowlist, the census
// face, the per-branch wire, the disclosure pair, the drill chip, the
// read-only drill, the kpi-row muted family stays 62, the counters).
// Plus the release face: package.json / VERSION / whats-new / CHANGELOG
// all speak 2.240.0.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

let failures = 0;
let pass = 0;
const ok = (name, cond) => {
  if (cond) { pass++; console.log(`PASS  ${name}`); }
  else { failures++; console.log(`FAIL  ${name}`); }
};
const read = (p) => readFileSync(join(process.cwd(), p), 'utf8');

const map = read('src/components/org/variance-map.tsx');
const panel = read('src/components/inventory/stock-take-panel.tsx');
const drill = read('src/components/org/sheet-drill.tsx');
const branchWire = read('src/app/api/stock-takes/[id]/route.ts');
const createWire = read('src/app/api/stock-takes/route.ts');
const kpi = read('src/app/api/org/kpi-summary/route.ts');
const primitives = read('src/components/org/primitives.tsx');
const pkg = JSON.parse(read('package.json'));
const version = read('VERSION').trim();
const whatsNew = read('src/lib/whats-new.ts');
const changelog = read('CHANGELOG.md');
const changelogTest = read('src/tests/console-changelog.test.ts');
const kpiRow = read('src/components/org/kpi-row.tsx');

console.log('— the release face —');
ok('package.json releaseVersion 2.240.0', pkg.mbumah.releaseVersion === '2.240.0');
ok('package.json baseVersion 2.240.0', pkg.mbumah.baseVersion === '2.240.0');
ok('package.json version 2.240.0', pkg.version === '2.240.0');
ok('VERSION 2.240.0', version === '2.240.0');
ok('verify gate wired', pkg.scripts['verify:v2-240-0'] === 'node scripts/verify-v2-240-0.mjs');
ok('previous gate still wired', pkg.scripts['verify:v2-239-0'] === 'node scripts/verify-v2-239-0.mjs');
ok('whats-new entry at the head', whatsNew.includes("version: '2.240.0',") && whatsNew.indexOf("version: '2.240.0',") < whatsNew.indexOf("version: '2.239.0',"));
ok('whats-new title speaks the birth, everywhere', whatsNew.includes("title: 'The birth, everywhere',"));
ok('changelog anchors the section above its ancestor', changelog.indexOf('## [2.240.0]') >= 0 && changelog.indexOf('## [2.240.0]') < changelog.indexOf('## [2.239.0]'));
ok('the counters ride +1 in the counter test', changelogTest.includes("expect(whatsNewUnreadCount('2.110.0')).toBe(131);") && changelogTest.includes("expect(whatsNewUnreadCount('2.77.0')).toBe(164);"));

console.log('— the roster\u2019s birth —');
ok('both roster queries grow the origin column (zero new reads)', kpi.includes('THE ROSTER\u2019S BIRTH') && (kpi.match(/origin: true,/g) ?? []).length === 2);
ok('both response blocks carry the origin additively', (kpi.match(/origin: s.origin,/g) ?? []).length === 2);
ok('the types are additive + optional', (primitives.match(/origin\?: string \| null;/g) ?? []).length === 2);
ok('the live row wears the birth', map.includes('{s.origin === \'walk-door\' && <BirthChip testId={`variance-map-live-origin-${s.id}`} />}'));
ok('the roster row wears the birth', map.includes('{s.origin === \'walk-door\' && <BirthChip testId={`variance-map-row-origin-${s.id}`} />}'));

console.log('— the BirthChip face —');
ok('one component, one house, three faces', map.includes('const BirthChip = ({ testId }: { testId: string }) => (') && map.includes('born at a door'));
ok('the chip carries the law on the title', map.includes('title="born at a walk door — the org face pointed, the floor answered (the census counts it)"'));
ok('the chip wears the violet house with the glass', map.slice(map.indexOf('const BirthChip'), map.indexOf('export function VarianceMap')).includes('bg-violet-50 px-1.5 py-0.5 text-[9px] font-semibold tabular-nums text-violet-700 ring-1 ring-violet-200 dark:bg-violet-500/10 dark:text-violet-300 dark:ring-violet-500/30') && map.slice(map.indexOf('const BirthChip'), map.indexOf('export function VarianceMap')).includes('<DoorOpen className="h-2.5 w-2.5" aria-hidden="true" />'));

console.log('— the branch\u2019s echo —');
ok('the branch detail wire grows the origin additively', branchWire.includes('THE BRANCH\u2019S ECHO') && branchWire.includes('origin: sheet.origin,'));
ok('the branch face wears the same violet birth chip', panel.includes('data-testid="stocktake-sheet-origin"') && panel.includes("{detail.origin === 'walk-door' && (") && panel.includes("import { ClipboardCheck, DoorOpen, Download, FolderTree, History, Loader2, Printer, RotateCcw, Search, X } from 'lucide-react';"));
ok('the panel type is additive + optional', panel.includes('origin?: string | null;'));

console.log('— the styling law —');
ok('one motion across the map (the live bars ride the transition)', map.includes('block h-full rounded-full bg-amber-500 transition-[width] duration-500'));

console.log('— the fossil guards —');
ok('the allowlist law untouched', createWire.includes("const SHEET_ORIGIN_ALLOWLIST = ['walk-door'] as const;"));
ok('the census face still speaks its zero', map.includes('data-testid="cadence-door-census"') && map.includes("typeof block.doorBorn30d === 'number'"));
ok('the per-branch wire still groups the same where-shape', kpi.includes("where: { origin: 'walk-door', startedAt: { gte: windowStart } },") && kpi.includes('doorBornByStore,'));
ok('the v2.239 chips still speak (breakdown + drill + disclosure pair)', map.includes('data-testid={`coverage-row-door-born-${s.storeId}`}') && drill.includes('data-testid="sheet-drill-origin"') && map.includes('aria-controls="coverage-breakdown"'));
ok('the drill stays read-only', drill.includes('data-testid="sheet-drill-read-only"'));
ok('the kpi-row muted family stays at exactly 62 mounts', (kpiRow.match(/text-slate-500 dark:text-slate-400/g) ?? []).length === 62);
ok('the changelog speaks the added + styled faces', changelog.slice(changelog.indexOf('## [2.240.0]'), changelog.indexOf('## [2.239.0]')).includes('### Added') && changelog.slice(changelog.indexOf('## [2.240.0]'), changelog.indexOf('## [2.239.0]')).includes('### Styled'));

console.log(`\n${pass} passed, ${failures} failed`);
process.exit(failures > 0 ? 1 : 0);
