#!/usr/bin/env node
// verify-v2-397-0.mjs — the round's FEATURE gate (v2.397.0 "the landing
// chips share one loom"). The release MECHANICS live in
// verify-current.mjs. This script pins only what is NEW this round: the
// elder storey's second registry, the three heads, the discriminated
// storey prop (the zero-cast law), the 18 desks' swaps, the loom suite's
// THE_ELDER block, and the release's own slots. THE OD LAW: bytes, not
// memory.
import { readFileSync } from 'node:fs';

let pass = 0, fail = 0;
const ok = (name, cond) => {
  if (cond) { pass++; console.log(`  ok  ${name}`); }
  else { fail++; console.error(`x FAIL ${name}`); }
};
const read = (p) => readFileSync(p, 'utf8');

const LOOM = read('src/components/landing-chip.tsx');
const LOOM_SUITE = read('src/tests/landing-chip-loom-v2394.test.ts');
const ADMIN = read('src/app/(shell)/tabs/admin-tab.tsx');
const TRANSACTIONS = read('src/app/(shell)/tabs/transactions-tab.tsx');
const SUPPLIERS = read('src/app/(shell)/tabs/suppliers-tab.tsx');
const FEED = read('src/lib/whats-new.ts');
const CHANGELOG = read('CHANGELOG.md');
const CHANGELOG_TEST = read('src/tests/console-changelog.test.ts');
const pkg = JSON.parse(read('package.json'));
const version = read('VERSION').trim();

console.log('— the elder storey —');
ok('THE 200 REGISTRY EXISTS (22 hues, one greppable line each)',
  LOOM.includes('export const LANDING_CHIP_WARDROBES_200')
  && LOOM.split('\n').filter((l) => /^  [a-z]+: 'border-[a-z]+-200 /.test(l)).length === 22);
ok('THE THREE HEADS (standard, compact, quiet)',
  LOOM.includes("const CHIP_HEAD = 'group inline-flex items-center gap-1.5 h-7 px-2.5 rounded-full border '")
  && LOOM.includes("const CHIP_HEAD_COMPACT = 'group inline-flex items-center gap-1 h-6 px-2 rounded-full border '")
  && LOOM.includes("const CHIP_HEAD_QUIET = 'inline-flex items-center gap-1.5 h-7 px-2.5 rounded-full border '"));
ok('THE DISCRIMINATED STOREY (no cast anywhere in the loom — `as const` is not a cast)',
  LOOM.includes('storey?: undefined; hue: LandingChipHue')
  && LOOM.includes('storey: 200; hue: LandingChipHue200')
  && !/\bas\s+(?!const\b)(?:[A-Z]|\bstring\b|\bnumber\b|\bunknown\b|\bany\b)/.test(LOOM));
ok('THE QUIET FACE (the X speaks no group-hover)',
  LOOM.includes("'h-3 w-3 shrink-0 opacity-60'")
  && LOOM.includes("'h-3 w-3 shrink-0 opacity-60 transition-opacity group-hover:opacity-100'"));
ok('THE WORD-FREE LAW STILL HOLDS (no constitution word in the loom)',
  ['ad-severity','cat-stock','cv-type','cr-type','cust-debt','dp-status','dn-status','et-status','gc-status','inv-stock','inv-status','ly-type','po-status','pr-status','rent-status','sec-type','sup-po','sup-status','transfer-status','txn-pay','txn-type','vc-status'].every((w) => !LOOM.includes(w)));

console.log('— the desks —');
ok('THE COMPACT SWAP (the admin desk renders through the loom)',
  ADMIN.includes("import { LandingChip } from '@/components/landing-chip';")
  && ADMIN.includes('<LandingChip')
  && ADMIN.includes('storey={200}')
  && ADMIN.includes('variant="compact"')
  && !ADMIN.includes('border-neutral-200 bg-neutral-50 text-neutral-700'));
ok('THE MULTI-CHIP DESKS (transactions speaks two, suppliers speaks two)',
  TRANSACTIONS.includes('hue="fuchsia"') && TRANSACTIONS.includes('hue="violet"')
  && SUPPLIERS.includes('hue="emerald"') && SUPPLIERS.includes('hue="cyan"'));
ok('THE SCRUBS SURVIVED (the transactions dismissal keeps its word-scrub)',
  TRANSACTIONS.includes("buildSearchWithoutParams(window.location.search, ['txn-pay'])")
  && TRANSACTIONS.includes("buildSearchWithoutParams(window.location.search, ['txn-type'])"));

console.log('— the suite —');
ok('THE ELDER BLOCK (22 entries, the shared-wardrobe honesty)',
  LOOM_SUITE.includes('const THE_ELDER = [')
  && LOOM_SUITE.includes('sharedWith: 0')
  && LOOM_SUITE.includes('sharedWith: 10')
  && LOOM_SUITE.includes('THE ELDER CENSUS'));
ok('THE BYTE-FIDELITY LAW (the composition pin lives)',
  LOOM_SUITE.includes('composes with its registry entry into the EXACT historic bytes'));

console.log('— the release slots —');
ok('THE FEED LEADS WITH THE ROUND (title + the shop-floor bullets)',
  FEED.includes("version: '2.397.0',")
  && FEED.indexOf("version: '2.397.0',") < FEED.indexOf("version: '2.396.0',")
  && FEED.includes('The landing chips share one loom')
  && FEED.includes('zero drift'));
ok('THE CHANGELOG LEADS WITH THE ROUND',
  CHANGELOG.startsWith('## [2.397.0] The landing chips share one loom'));
ok('THE VERSION SLOTS AGREE',
  version === '2.397.0'
  && pkg.version === '2.397.0'
  && pkg.mbumah.releaseVersion === '2.397.0'
  && pkg.mbumah.baseVersion === '2.397.0');
ok('THE CASCADE HISTORY LINE LANDED',
  CHANGELOG_TEST.includes('// v2.397.0:')
  && CHANGELOG_TEST.includes('287/288/289/320'));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
