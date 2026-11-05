#!/usr/bin/env node
// walk-v2401.mjs — v2.401.0's walk marks, applied by WRITE (the BY WRITE
// law: each round's codemod is written fresh, guarded, and idempotent —
// a second run answers 0 replacements).
//
//   1. the history line (the v2.401.0 story) joins console-changelog.test.ts
//   2. the four unread-count anchors grow their +1 legs: 290/291/292/323 → 291/292/293/324
//
// Every edit reads the SOURCE OF RECORD and refuses to double-apply.
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const path = 'src/tests/console-changelog.test.ts';
let src = readFileSync(path, 'utf8');
let writes = 0;

const HISTORY = `    // v2.401.0: the health desk hands you the file — the Environment & Connection panel's report leaves the desk as a NAMED text file too (diagnosticsFileName, the pure twin of the support copy — the version, the date and the minute ride in the name), the Download button rides the header beside the Copy button with the saved face's two-second hand-back (the same emerald family — the elder census's file-level count holds), the sandbox eTIMS client now speaks the three response contracts its routes always promised (customer search, invoice status, the stock master report — the 48 faces stand down, 479 → 431), and the entry joins the feed (+1 on every unread anchor — the DERIVED anchors re-set themselves, the cascade's twelfth generation)\n`;

if (src.includes('// v2.401.0:')) {
  console.log('history line: already present (idempotent no-op)');
} else if (src.includes("// v2.400.0: the health desk hands you the words")) {
  const anchorLine = src.indexOf("    expect(whatsNewUnreadCount('2.110.0'))");
  if (anchorLine < 0) { console.error('FAIL: the 2.110.0 anchor line is gone'); process.exit(1); }
  src = src.slice(0, anchorLine) + HISTORY + src.slice(anchorLine);
  writes++;
  console.log('history line: inserted before the 2.110.0 anchor');
} else {
  console.error('FAIL: neither the v2.401.0 nor the v2.400.0 history line found');
  process.exit(1);
}

const BUMPS = [
  ["expect(whatsNewUnreadCount('2.110.0')).toBe(290);", "expect(whatsNewUnreadCount('2.110.0')).toBe(291);"],
  ["expect(whatsNewUnreadCount('2.109.0')).toBe(291);", "expect(whatsNewUnreadCount('2.109.0')).toBe(292);"],
  ["expect(whatsNewUnreadCount('2.108.0')).toBe(292);", "expect(whatsNewUnreadCount('2.108.0')).toBe(293);"],
  ["expect(whatsNewUnreadCount('2.77.0')).toBe(323);", "expect(whatsNewUnreadCount('2.77.0')).toBe(324);"],
];
for (const [from, to] of BUMPS) {
  if (src.includes(to)) { console.log(`anchor already re-keyed: ${to}`); continue; }
  if (!src.includes(from)) { console.error(`FAIL: anchor not found: ${from}`); process.exit(1); }
  src = src.replace(from, to);
  writes++;
  console.log(`anchor: ${from.match(/'2\.\d+\.0'/)[0]} → ${to.match(/toBe\((\d+)\)/)[1]}`);
}

writeFileSync(path, src);
console.log(`\n${writes} replacement(s) written; a second run answers 0.`);

// ── the count web ────────────────────────────────────────────────────────
// The anchors are not console-changelog's alone: the walk-census and
// branch-walk generations pin BOTH the live counter values AND the
// counter's own BYTES inside console-changelog.test.ts. Every walk
// re-keys the whole web (+1 per anchor, everywhere the exact
// version+value string appears), or the census generations go stale
// the moment the counter moves.
const BUMP_FROM = [
  ["whatsNewUnreadCount('2.110.0')).toBe(290)", "whatsNewUnreadCount('2.110.0')).toBe(291)"],
  ["whatsNewUnreadCount('2.109.0')).toBe(291)", "whatsNewUnreadCount('2.109.0')).toBe(292)"],
  ["whatsNewUnreadCount('2.108.0')).toBe(292)", "whatsNewUnreadCount('2.108.0')).toBe(293)"],
  ["whatsNewUnreadCount('2.77.0')).toBe(323)", "whatsNewUnreadCount('2.77.0')).toBe(324)"],
];

const listTests = (dir) => {
  const acc = [];
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) acc.push(...listTests(p));
    else if (/\.test\.ts$/.test(e.name)) acc.push(p);
  }
  return acc;
};

let webFiles = 0, webEdits = 0;
for (const file of listTests('src/tests')) {
  let text = readFileSync(file, 'utf8');
  const before = text;
  for (const [from, to] of BUMP_FROM) text = text.split(from).join(to);
  if (text !== before) {
    writeFileSync(file, text);
    webFiles++;
    webEdits += BUMP_FROM.reduce((n, [from, to]) => n + (before.split(from).length - 1), 0);
  }
}
console.log(`count web: ${webEdits} anchor edit(s) across ${webFiles} file(s).`);

// ── the version web ──────────────────────────────────────────────────────
// The living version pins ride the treadmill: every suite that speaks the
// version-of-record (pkg.version, the mbumah slots, the VERSION file,
// APP_VERSION) re-keys each walk — including the byte-pins that pin those
// very assert lines inside OTHER suites (the treadmill tax, paid by the
// codemod, never by hand). The feed-announcement pin (toContain
// "version: '2.400.0'") moves with the round: the round announces itself.
let vFiles = 0, vEdits = 0;
for (const file of listTests('src/tests')) {
  let text = readFileSync(file, 'utf8');
  const before = text;
  text = text.split("toBe('2.400.0')").join("toBe('2.401.0')");
  text = text.split('toContain("version: \'2.400.0\'")').join('toContain("version: \'2.401.0\'")');
  if (text !== before) {
    writeFileSync(file, text);
    vFiles++;
    vEdits += (before.split("toBe('2.400.0')").length - 1) + (before.split('toContain("version: \'2.400.0\'")').length - 1);
  }
}
console.log(`version web: ${vEdits} pin edit(s) across ${vFiles} file(s).`);
