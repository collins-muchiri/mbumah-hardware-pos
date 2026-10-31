#!/usr/bin/env node
/**
 * walk-v2310.mjs — the v2.310.0 re-anchor codemod (one-off, BY WRITE).
 *
 * The treadmill law, assert-line-only (same law as walk-v2309):
 *   1. VERSION RE-ANCHOR — on every test line that is an assertion
 *      (contains `toBe(` or `toContain(`), the release pin '2.309.0'
 *      becomes '2.310.0'. Comment-only lines keep their history (the
 *      trail of what each earlier release pinned), so the file narrates
 *      its own past while its asserts speak the present.
 *   2. THE UNREAD-COUNTER CASCADE — a new WHATS_NEW entry shifts every
 *      `whatsNewUnreadCount` anchor by +1, in BOTH shapes: real asserts
 *      (console-changelog.test.ts) and metatest toContain strings (the
 *      census/watcher files that pin the changelog test's own source).
 *   3. THE HISTORY COMMENT — console-changelog.test.ts's cascade block
 *      gains its v2.310.0 line, continuing the trail.
 *
 * Scope: test files under src/ ONLY. Ancestor verify:/check-merge: scripts
 * are stale-by-design (they pin their own release) and are never touched.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';

const files = execSync("rg -l --glob '*.test.ts' '2\\.309\\.0|whatsNewUnreadCount' src/", {
  encoding: 'utf8',
  cwd: new URL('..', import.meta.url).pathname,
})
  .split('\n')
  .filter(Boolean);

const ANCHORS = [
  ["whatsNewUnreadCount('2.110.0')).toBe(200)", "whatsNewUnreadCount('2.110.0')).toBe(201)"],
  ["whatsNewUnreadCount('2.109.0')).toBe(201)", "whatsNewUnreadCount('2.109.0')).toBe(202)"],
  ["whatsNewUnreadCount('2.108.0')).toBe(202)", "whatsNewUnreadCount('2.108.0')).toBe(203)"],
  ["whatsNewUnreadCount('2.77.0')).toBe(233)", "whatsNewUnreadCount('2.77.0')).toBe(234)"],
];

const HISTORY_LINE =
  "    // v2.310.0: the claw-speaks entry joins the feed (+1 on every anchor → 199/200/201/232 → 200/201/202/233)";

let pinLines = 0;
let counterLines = 0;
const touched = [];

for (const rel of files) {
  const abs = new URL(`../${rel}`, import.meta.url).pathname;
  const before = readFileSync(abs, 'utf8');
  const lines = before.split('\n');
  let fileChanged = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    const isComment = trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*');
    const isAssert = line.includes('toBe(') || line.includes('toContain(');

    if (isAssert && !isComment && line.includes("'2.309.0'")) {
      lines[i] = line.replaceAll("'2.309.0'", "'2.310.0'");
      pinLines++;
      fileChanged = true;
    }
    if (isAssert && !isComment) {
      let next = lines[i];
      for (const [from, to] of ANCHORS) next = next.split(from).join(to);
      if (next !== lines[i]) {
        lines[i] = next;
        counterLines++;
        fileChanged = true;
      }
    }
  }

  // The history comment lands just above the cascade's expect block.
  if (rel.endsWith('console-changelog.test.ts') && !before.includes(HISTORY_LINE)) {
    const idx = lines.findIndex((l) => l.includes("expect(whatsNewUnreadCount('2.110.0'))"));
    if (idx > 0) {
      lines.splice(idx, 0, HISTORY_LINE);
      fileChanged = true;
    }
  }

  if (fileChanged) {
    writeFileSync(abs, lines.join('\n'));
    touched.push(rel);
  }
}

console.log(`walk-v2310: ${touched.length} files · ${pinLines} version-pin lines · ${counterLines} counter lines`);
for (const t of touched) console.log(`  · ${t}`);
