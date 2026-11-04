#!/usr/bin/env node
// cascade-v2385.mjs — THE UNREAD-COUNT CASCADE for v2.385.0 (the non-word
// round's by-hand walk). A new feed entry joins the top: every
// whatsNewUnreadCount anchor in the test universe counts it, so every
// pinned value bumps +1. DERIVATION-GUARDED: the script refuses to run
// unless the expected old values are exactly where the law says they are;
// IDEMPOTENT: a re-run finds only new values and changes nothing.
// THE OD LAW: bytes, not memory.
import { readFileSync, writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';

// the cascade pairs: (seenVersion, oldCount) → oldCount + 1
const PAIRS = [
  ["'2.110.0'", 274],
  ["'2.109.0'", 275],
  ["'2.108.0'", 276],
  ["'2.77.0'", 307],
];

const files = execSync(`grep -rl "whatsNewUnreadCount(" src/tests --include='*.test.ts'`, {
  encoding: 'utf8',
}).split('\n').filter(Boolean);

let touched = 0;
for (const f of files) {
  let src = readFileSync(f, 'utf8');
  let changed = false;
  for (const [ver, old] of PAIRS) {
    const oldLit = `whatsNewUnreadCount(${ver})).toBe(${old})`;
    const newLit = `whatsNewUnreadCount(${ver})).toBe(${old + 1})`;
    // derivation guard: the file must hold the OLD value, never the
    // already-bumped one (idempotency), never both.
    const hasOld = src.includes(oldLit);
    const hasNew = src.includes(newLit);
    if (hasOld && hasNew) {
      console.error(`x REFUSE ${f}: both ${old} and ${old + 1} present for ${ver} — the cascade is torn`);
      process.exit(1);
    }
    if (hasOld) {
      src = src.split(oldLit).join(newLit);
      changed = true;
      touched++;
    }
  }
  if (changed) {
    writeFileSync(f, src);
    console.log(`  bumped ${f}`);
  }
}

// the history line (the walk's mark): the round's own entry joins the feed
const CL = 'src/tests/console-changelog.test.ts';
let cl = readFileSync(CL, 'utf8');
const mark = `// v2.385.0: the dry run speaks its payload — the e-TIMS submit dialog keeps the dry-run's mapped payload on screen (the paper-trail card, the copy voice), the PENDING rows gain their own Submit-to-KRA affordance, and the unread-count anchors grow by one (+1 on every anchor → 274/275/276/307 → 275/276/277/308)`;
if (!cl.includes('// v2.385.0:')) {
  cl = cl.replace(
    /(    \/\/ v2\.384\.0:[^\n]*\n)/,
    `    ${mark}\n$1`,
  );
  writeFileSync(CL, cl);
  console.log(`  history line landed in ${CL}`);
} else {
  console.log(`  history line already present (idempotent)`);
}
console.log(`\ncascade complete: ${touched} anchor literals bumped across ${files.length} candidate files`);
