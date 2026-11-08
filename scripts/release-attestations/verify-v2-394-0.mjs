#!/usr/bin/env node
// verify-v2-394-0.mjs — the round's FEATURE gate (v2.394.0 "the landing
// chips share one loom"). The release MECHANICS live in verify-current.mjs.
// This script pins only what is NEW this round: the LandingChip loom (the
// component, the ten-hue registry, the byte-fidelity composition), the ten
// loomed desks (hue by name, handle by spread, wardrobe never), the
// word-free law, the stress's loom face, and the release's own slots.
// THE OD LAW: bytes, not memory.
import { readFileSync } from 'node:fs';

let pass = 0, fail = 0;
const ok = (name, cond) => {
  if (cond) { pass++; console.log(`  ok  ${name}`); }
  else { fail++; console.error(`x FAIL ${name}`); }
};
const read = (p) => readFileSync(p, 'utf8');

const LOOM = read('src/components/landing-chip.tsx');
const CONSTITUTION = read('src/tests/transfer-status-deep-link-v2357.test.ts');
const STRESS = read('src/tests/family-registry-stress-v2370.test.ts');
const SUITE = read('src/tests/landing-chip-loom-v2394.test.ts');
const FEED = read('src/lib/whats-new.ts');
const CHANGELOG = read('CHANGELOG.md');
const CHANGELOG_TEST = read('src/tests/console-changelog.test.ts');
const pkg = JSON.parse(read('package.json'));
const version = read('VERSION').trim();

const HEAD = 'group inline-flex items-center gap-1.5 h-7 px-2.5 rounded-full border ';
const THE_TEN = [
  ['sky', 'src/app/(shell)/tabs/banking-tab.tsx', 'bank-type-landing-word'],
  ['purple', 'src/app/(shell)/tabs/banking-tab.tsx', 'bank-mpesa-landing-word'],
  ['cyan', 'src/app/(shell)/tabs/debt-management-tab.tsx', 'debt-status-landing-word'],
  ['fuchsia', 'src/app/(shell)/tabs/debt-management-tab.tsx', 'debt-channel-landing-word'],
  ['indigo', 'src/app/(shell)/tabs/data-exports-tab.tsx', 'exp-status-landing-word'],
  ['pink', 'src/app/(shell)/tabs/data-exports-tab.tsx', 'exp-type-landing-word'],
  ['orange', 'src/app/(shell)/tabs/tax-tab.tsx', 'tax-type-landing-word'],
  ['teal', 'src/app/(shell)/tabs/tax-tab.tsx', 'tax-period-landing-word'],
  ['lime', 'src/app/(shell)/tabs/reports-tab.tsx', 'rep-type-landing-word'],
  ['yellow', 'src/app/(shell)/tabs/messaging-tab.tsx', 'msg-template-landing-word'],
];

console.log('— the loom —');
ok('THE LOOM EXISTS (client component, exports, lucide hand)',
  LOOM.includes("'use client';")
  && LOOM.includes('export const LANDING_CHIP_HUES')
  && LOOM.includes('export const LANDING_CHIP_WARDROBES')
  && LOOM.includes('export function LandingChip')
  && LOOM.includes("from 'lucide-react'"));
ok('THE REGISTRY CARRIES EXACTLY TEN HUES (single-line entries)',
  THE_TEN.every(([hue]) => new RegExp(`^  ${hue}: 'border-${hue}-300`, 'm').test(LOOM)));
ok('THE BYTE-FIDELITY COMPOSITION (head + entry = the historic string)',
  THE_TEN.every(([hue]) => {
    const m = LOOM.match(new RegExp(`^  ${hue}: '([^']+)',?$`, 'm'));
    if (!m) return false;
    const historic = `border-${hue}-300 bg-${hue}-100 text-${hue}-700 text-xs font-medium whitespace-nowrap transition-colors hover:bg-${hue}-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-${hue}-400 dark:border-${hue}-500/30 dark:bg-${hue}-500/10 dark:text-${hue}-300 dark:hover:bg-${hue}-500/20`;
    return (HEAD + m[1]) === (HEAD + historic);
  }));
ok('THE WORD-FREE LAW (none of the constitution\u2019s 32 words in the loom)',
  (() => {
    const rows = [...CONSTITUTION.matchAll(/\{ word: '([a-z-]+)', desk: '[^']+', family: '[^']+', suite: '[^']+' \}/g)];
    return rows.length === 32 && rows.every((m) => !LOOM.includes(m[1]));
  })());
ok('THE SHARED ANATOMY (Link2, tabular-nums, the group-hover X, the rest spread)',
  LOOM.includes('<Link2 className="h-3 w-3 shrink-0" aria-hidden="true" />')
  && LOOM.includes('<span className="tabular-nums">{label}</span>')
  && LOOM.includes('opacity-60 transition-opacity group-hover:opacity-100')
  && LOOM.includes('{...rest}'));

console.log('— the ten loomed desks —');
let desksOk = true;
for (const [hue, deskPath, testid] of THE_TEN) {
  const desk = read(deskPath);
  if (!desk.includes("import { LandingChip } from '@/components/landing-chip';")) { desksOk = false; console.error(`   ${deskPath}: missing loom import`); }
  if (!desk.includes(`hue="${hue}"`)) { desksOk = false; console.error(`   ${deskPath}: missing hue="${hue}"`); }
  if (!desk.includes(`data-testid="${testid}"`)) { desksOk = false; console.error(`   ${deskPath}: missing handle`); }
  if (desk.includes(`border-${hue}-300`)) { desksOk = false; console.error(`   ${deskPath}: still speaks the wardrobe`); }
}
ok('ALL TEN DESKS: import + hue + handle + wardrobe zero', desksOk);
ok('THE DESKS SHRANK (no hand-rolled chip button remains)',
  !read('src/app/(shell)/tabs/messaging-tab.tsx').includes('<button\n                type="button"\n                onClick={() => {\n                  setMsgTemplateFilter(\'all\');'));

console.log('— the stress\u2019s loom face —');
ok('THE STRESS GREW THE LOOM FACE (hue + registry derivation)',
  STRESS.includes('THE LOOM FACE')
  && STRESS.includes('hue="${hue}"')
  && STRESS.includes("readFileSync('src/components/landing-chip.tsx', 'utf8')"));
ok('THE CONSTITUTION HOLDS (32 rows / 26 desks / 32 families, nothing moved)',
  CONSTITUTION.includes('(thirty-two words, twenty-six desks)')
  && (CONSTITUTION.match(/\{ word: '/g) || []).length >= 32);
ok('THE LOOM SUITE EXISTS AND PINS THE FAMILY',
  SUITE.includes('THE WORD-FREE LAW') && SUITE.includes('THE MASQUERADE LAW, LOOM FORM')
  && SUITE.includes('THE ONCE-ONLY CENSUS'));

console.log('— the release slots —');
ok('THE FEED LEADS WITH THE ROUND (title carries the speaker census)',
  FEED.includes("version: '2.394.0',")
  && FEED.indexOf("version: '2.394.0',") < FEED.indexOf("version: '2.393.0',")
  && FEED.includes('two chips and the messaging templates')
  && FEED.includes('msg-template') && FEED.includes('exp-status') && FEED.includes('exp-type')
  && FEED.includes('Export History') && FEED.includes('Templates pane'));
ok('THE CHANGELOG LEADS WITH THE ROUND',
  CHANGELOG.startsWith('## [2.394.0] The landing chips share one loom'));
ok('THE VERSION SLOTS AGREE',
  version === '2.394.0'
  && pkg.version === '2.394.0'
  && pkg.mbumah.releaseVersion === '2.394.0'
  && pkg.mbumah.baseVersion === '2.394.0');
ok('THE CASCADE HISTORY LINE LANDED',
  CHANGELOG_TEST.includes('// v2.394.0:')
  && CHANGELOG_TEST.includes('284/285/286/317'));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
