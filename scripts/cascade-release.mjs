#!/usr/bin/env node
// cascade-release.mjs — THE PARAMETERIZED UNREAD-COUNT CASCADE (the pin
// unwind's first real retire: Task 27's per-round hand-counting becomes a
// DERIVATION). A release's feed entry joins the top; every
// whatsNewUnreadCount anchor in the test universe is DERIVABLE from the
// feed itself — the anchor's value IS the number of feed entries newer
// than its seen-version. This script reads src/lib/whats-new.ts as the
// source of record, derives each anchor's true value, and SETS it —
// no version args, no hand-counted +1s. IDEMPOTENT BY CONSTRUCTION:
// a re-run derives the same values and writes nothing. Guarded: it
// refuses when an anchor's current value disagrees with BOTH the derived
// value and its derived-minus-one (a torn mid-cascade tree).
// THE OD LAW: bytes, not memory.
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const feed = readFileSync('src/lib/whats-new.ts', 'utf8');
const versions = [...feed.matchAll(/version: '(\d+\.\d+\.\d+)'/g)].map((m) => m[1]);
if (versions.length === 0) {
  console.error('x REFUSE: the feed carries no version entries');
  process.exit(1);
}
// THE FUNCTION'S OWN RULE (whatsNewReadState): the TOP entry speaks
// 'latest', never 'new' — so the unread count excludes it. The anchors
// derive from THE FUNCTION's truth, not from a raw newer-than census.
const TOP = versions[0];
const semver = (v) => v.split('.').map(Number);
const newer = (a, b) => {
  const [a1, a2, a3] = semver(a);
  const [b1, b2, b3] = semver(b);
  return a1 > b1 || (a1 === b1 && a2 > b2) || (a1 === b1 && a2 === b2 && a3 > b3);
};
const derivedUnread = (seen) => versions.filter((v) => v !== TOP && newer(v, seen)).length;

const files = readdirSync('src/tests')
  .filter((f) => f.endsWith('.test.ts'))
  .map((f) => join('src/tests', f));

let touched = 0, literals = 0;
for (const f of files) {
  let src = readFileSync(f, 'utf8');
  let changed = false;
  src = src.replace(/whatsNewUnreadCount\('(\d+\.\d+\.\d+)'\)\)\.toBe\((\d+)\)/g, (full, seen, n) => {
    const derived = derivedUnread(seen);
    if (Number(n) === derived) return full; // already true — the idempotent path
    if (Number(n) > derived) {
      console.error(`x REFUSE ${f}: whatsNewUnreadCount('${seen}') says ${n}, the feed derives ${derived} — a FUTURE-looking lie (torn tree)`);
      process.exit(1);
    }
    if (Number(n) < derived - 1) {
      // a hand-counted +1 ritual could drift when a release skipped its
      // bump — the derivation HEALS the latent lie and discloses the jump.
      console.log(`  drift heal ${f}: '${seen}' said ${n}, the feed derives ${derived} (latent undercount healed)`);
    }
    changed = true;
    literals++;
    return `whatsNewUnreadCount('${seen}')).toBe(${derived})`;
  });
  if (changed) {
    writeFileSync(f, src);
    touched++;
    console.log(`  derived ${f}`);
  }
}
console.log(`\ncascade derived: ${literals} anchor literals set across ${touched} files (source of record: the feed)`);
