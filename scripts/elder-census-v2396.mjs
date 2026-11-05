#!/usr/bin/env node
/**
 * elder-census-v2396.mjs — the byte-fingerprinter for the ELDER chips
 * (the 200/50-storey landing chips the worklog carries as the second
 * loom pass). Walks every data-testid ending in `-landing-word`, extracts
 * the owning element's className, and groups faces by their EXACT string.
 * Byte-fidelity design: a registry group = one exact historic className.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const files = [];
(function walk(dir) {
  for (const f of readdirSync(dir, { withFileTypes: true })) {
    if (['node_modules', '.next', '.git', '.roundtrip-baseline', 'tests'].includes(f.name)) continue;
    const p = join(dir, f.name);
    if (statSync(p).isDirectory()) walk(p);
    else if (f.name.endsWith('.tsx')) files.push(p);
  }
})(join(ROOT, 'src'));

const faces = [];
for (const file of files) {
  const src = readFileSync(file, 'utf8');
  const re = /data-testid="([a-z0-9-]*landing-word)"/g;
  let m;
  while ((m = re.exec(src))) {
    const testid = m[1];
    // walk back to the owning element's opening tag
    const before = src.slice(0, m.index);
    const tagStart = before.lastIndexOf('<');
    const tagEnd = src.indexOf('>', m.index);
    const tag = src.slice(tagStart, tagEnd + 1);
    const cn = tag.match(/className="([^"]*)"/);
    const isLoom = /\bLandingChip\b/.test(tag) || /<LandingChip/.test(src.slice(Math.max(0, tagStart - 200), tagStart));
    faces.push({
      testid,
      file: relative(ROOT, file),
      loom: isLoom,
      className: cn ? cn[1] : '(none)',
    });
  }
}

const loomed = faces.filter((f) => f.loom);
const elders = faces.filter((f) => !f.loom);
console.log(`total landing-word faces: ${faces.length} (loomed: ${loomed.length}, elder: ${elders.length})`);

const groups = new Map();
for (const f of elders) {
  const key = f.className;
  if (!groups.has(key)) groups.set(key, []);
  groups.get(key).push(`${f.testid} @ ${f.file}`);
}
console.log(`\n— the elder census: ${groups.size} DISTINCT className strings —`);
let i = 0;
for (const [cn, members] of [...groups.entries()].sort((a, b) => b[1].length - a[1].length)) {
  i++;
  console.log(`\n[${i}] x${members.length}: ${cn}`);
  for (const mem of members) console.log(`      ${mem}`);
}
