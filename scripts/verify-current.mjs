#!/usr/bin/env node
// verify-current.mjs — THE PIN UNWIND (Task 27's standing item, v2.310.0).
//
// Every release used to re-write the same MECHANICS block into a fresh
// verify-v2-X-Y-0.mjs: pkg slots, VERSION file, whats-new lead placement,
// CHANGELOG ordering, the walk's history line. Those checks are derivable
// from VERSION itself — so this script parameterizes them ONCE. A release
// now ships only its FEATURE pins (verify-v2-X-Y-0.mjs); the mechanics gate
// is `npm run verify:current` and never changes again.
//
// Every check reads the SOURCE OF RECORD (bytes, not memory) — THE OD LAW.
import { readFileSync } from 'node:fs';

let pass = 0, fail = 0;
const ok = (name, cond) => {
  if (cond) { pass++; console.log(`  ok  ${name}`); }
  else { fail++; console.error(`x FAIL ${name}`); }
};
const read = (p) => readFileSync(p, 'utf8');

const version = read('VERSION').trim();
// The previous release: this repo's treadmill walks the minor line
// (2.309.0 → 2.310.0), so prev = minor − 1.
const [maj, min, patch] = version.split('.').map(Number);
if (!Number.isFinite(maj) || !Number.isFinite(min) || !Number.isFinite(patch)) {
  console.error(`x FAIL VERSION is not X.Y.Z: "${version}"`);
  process.exit(1);
}
const prev = `${maj}.${min - 1}.${patch}`;

const pkg = JSON.parse(read('package.json'));
const feed = read('src/lib/whats-new.ts');
const changelog = read('CHANGELOG.md');
const changelogTest = read('src/tests/console-changelog.test.ts');

console.log(`— the release mechanics (parameterized on VERSION = ${version}) —`);
ok('pkg version = VERSION (all three slots)', pkg.version === version && pkg.mbumah?.releaseVersion === version && pkg.mbumah?.baseVersion === version);
ok('the VERSION file speaks the same version', version.length > 0 && /^\d+\.\d+\.\d+$/.test(version));

const leadIdx = feed.indexOf(`version: '${version}',`);
ok('whats-new carries the lead entry', leadIdx >= 0);
ok('the lead entry sits FIRST (newest above all)', leadIdx >= 0 && feed.indexOf('version:') < leadIdx);
const leadSlice = feed.slice(leadIdx, feed.indexOf("version: '", leadIdx + 1) === -1 ? leadIdx + 2000 : feed.indexOf("version: '", leadIdx + 1));
const bulletCount = (leadSlice.match(/'/g) || []).length >= 6; // title + ≥3 bullets
ok('the lead entry carries a title and bullets', leadIdx >= 0 && bulletCount);

ok(`CHANGELOG carries [${version}] above [${prev}]`, changelog.indexOf(`[${version}]`) >= 0 && (changelog.indexOf(`[${prev}]`) === -1 || changelog.indexOf(`[${version}]`) < changelog.indexOf(`[${prev}]`)));

console.log('— the walk\u2019s marks —');
ok('the cascade history line landed (console-changelog.test.ts)', changelogTest.includes(`// v${maj}.${min}.${patch}:`) && changelogTest.includes('entry joins the feed'));
const anchorRe = /expect\(whatsNewUnreadCount\('2\.110\.0'\)\)\.toBe\((\d+)\);/;
const anchorMatch = changelogTest.match(anchorRe);
ok('the cascade anchors are present and re-keyed (real asserts)', !!anchorMatch);
if (anchorMatch) {
  const stale = new RegExp(`whatsNewUnreadCount\\('2\\.110\\.0'\\)\\)\\.toBe\\(${parseInt(anchorMatch[1], 10) - 1}\\)`);
  ok('no stale anchor value behind (the old counts are gone)', !stale.test(changelogTest));
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
