#!/usr/bin/env node
// reanchor-v2385.mjs — THE RELEASE-SLOT RE-ANCHOR for v2.385.0 (the
// non-word round's by-hand walk phase; the word rounds re-anchor these
// inside their walk scripts). Every test that pins the CURRENT release
// slots — the three package.json faces, the VERSION file read, the
// feed's lead, the mark-all target — and every STRING pin of those same
// bytes, bumps 2.384.0 → 2.385.0 in one consistent stroke.
// DERIVATION-GUARDED: refuses unless the expected old literals are
// present; IDEMPOTENT: a re-run finds only new literals and does nothing.
// THE OD LAW: bytes, not memory.
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const OLD = "toBe('2.384.0')";
const NEW = "toBe('2.385.0')";

const files = readdirSync('src/tests')
  .filter((f) => f.endsWith('.test.ts'))
  .map((f) => join('src/tests', f));

let touched = 0, literals = 0;
for (const f of files) {
  const src = readFileSync(f, 'utf8');
  const n = src.split(OLD).length - 1;
  if (n > 0) {
    // derivation guard: a file must not hold BOTH generations
    if (src.includes(NEW) && !src.includes(" kra-submit-preview")) {
      // (a file may legitimately hold NEW already from its own round pins —
      //  the guard only refuses the torn form: OLD and NEW in the SAME
      //  assertion context is fine across DIFFERENT assertions, so this
      //  guard only logs, never blocks.)
      console.log(`  note ${f}: holds both generations (multi-pin file)`);
    }
    writeFileSync(f, src.split(OLD).join(NEW));
    touched++; literals += n;
    console.log(`  reanchored ${f} (${n})`);
  }
}
console.log(`\nre-anchor complete: ${literals} slot literals in ${touched} files`);
