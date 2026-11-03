#!/usr/bin/env node
// verify-v2-370-0.mjs — the round's FEATURE gate (v2.370.0 "the
// constitution walks itself"). The release MECHANICS live in
// verify-current.mjs. This script pins only what is NEW this round: the
// stress suite (the registry's derived walk), the qa:recycle handle,
// the window chip's URL-honest text, the punctuation-sweep timebomb's
// defusal, and the corrected twenty-one-ledger census.
// THE OD LAW: bytes, not memory. Run BEFORE the walk.
import { readFileSync } from 'node:fs';

let pass = 0, fail = 0;
const ok = (name, cond) => {
  if (cond) { pass++; console.log(`  ok  ${name}`); }
  else { fail++; console.error(`x FAIL ${name}`); }
};
const read = (p) => readFileSync(p, 'utf8');

const DESK = read('src/app/(shell)/tabs/loyalty-tab.tsx');
const STRESS = read('src/tests/family-registry-stress-v2370.test.ts');
const pkg = JSON.parse(read('package.json'));
const version = read('VERSION').trim();
const whatsNew = read('src/lib/whats-new.ts');
const changelog = read('CHANGELOG.md');

console.log('— the family registry stress test (the derived walk) —');
ok('THE STRESS SUITE EXISTS and declares its boundary',
  STRESS.includes('THE FAMILY REGISTRY STRESS TEST')
  && STRESS.includes('the constitution walks itself'));
ok('THE REGISTRY IS THE INPUT, NEVER A COPY (the rows are parsed from the constitution)',
  STRESS.includes("readFileSync(CONSTITUTION_PATH, 'utf8')")
  && STRESS.includes('src/tests/transfer-status-deep-link-v2357.test.ts')
  && !STRESS.includes("desk: 'src/app/(shell)/tabs/purchase-orders-tab.tsx'"));
ok('THE DERIVED PER-ROW WALK IS WRITTEN (desk bytes, chip pair, testid stem, self-reference, version stamp)',
  STRESS.includes('border-${hue}-200 bg-${hue}-50')
  && STRESS.includes('-landing-word')
  && STRESS.includes('the loose honest form')
  && STRESS.includes("version: '${version}',"));
ok('THE GLOBAL ARITHMETIC IS DERIVED (21 rows / 19 desks / 21 families / the roll)',
  STRESS.includes('toBe(19)')
  && STRESS.includes("'TWENTY-FIRST'"));

console.log('— the qa:recycle handle —');
ok('THE ALIAS IS WIRED (the playbook one command away)',
  pkg.scripts['qa:recycle'] === 'node scripts/fresh-recycle.mjs');

console.log('— the window chip\u2019s URL-honest text (styling detail) —');
ok('THE SECOND WORD DROPS ITS ASK-VOICE WHEN THE FIRST SPOKE',
  DESK.includes("landedWindowFrom ? '&' : '?'")
  && DESK.includes('ly-to=${landedWindowTo}')
  && DESK.includes('THE URL-HONEST TEXT'));

console.log('— the timebomb defusal and the corrected census (the round’s late work) —');
ok('THE REANCHOR SCRIPT EXISTS (the punctuation-sweep timebomb, containment-verified, never guessed)',
  read('scripts/reanchor-v2370-emdash.mjs').includes('never guessed'));
ok('THE CENSUS IS TWENTY-ONE (ledgers the first draft missed now list the stress file)',
  read('src/tests/rent-status-deep-link-v2355.test.ts').includes("'src/tests/family-registry-stress-v2370.test.ts',")
  && read('src/tests/ad-severity-deep-link-v2366.test.ts').includes("'src/tests/family-registry-stress-v2370.test.ts',"));
ok('THE WALK DERIVES THE LEDGERS (the constitution is the input, never a hand list)',
  read('scripts/walk-v2370.mjs').includes('insertSortedSlot')
  && read('scripts/walk-v2370.mjs').includes('censusRows'));

console.log('— the release mechanics (version slots, feed, changelog) —');
ok('pkg version = VERSION (all three slots)', pkg.version === version && pkg.mbumah?.releaseVersion === version && pkg.mbumah?.baseVersion === version);
ok('the VERSION file speaks 2.370.0', version === '2.370.0');
ok('whats-new carries the lead entry', whatsNew.includes("version: '2.370.0',") && whatsNew.indexOf("version: '2.370.0',") < whatsNew.indexOf("version: '2.369.0',"));
ok('CHANGELOG carries [2.370.0] above [2.369.0]', changelog.indexOf('[2.370.0]') >= 0 && changelog.indexOf('[2.370.0]') < changelog.indexOf('[2.369.0]'));

console.log(`\nverify-v2-370-0: ${pass} ok, ${fail} FAIL`);
process.exit(fail === 0 ? 0 : 1);
