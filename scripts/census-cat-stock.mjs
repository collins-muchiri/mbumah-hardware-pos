#!/usr/bin/env node
// census-cat-stock.mjs — compute the REAL walkSrc census for 'cat-stock'
// and print it sorted (the derivation-assert law: the ledger asserts what
// the tree ACTUALLY speaks).
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

function walkSrc(dir, collected) {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    const st = statSync(p);
    if (st.isDirectory()) {
      if (entry === 'node_modules' || entry === '.next') continue;
      walkSrc(p, collected);
    } else if (/\.(ts|tsx|mjs|js)$/.test(entry)) {
      if (readFileSync(p, 'utf8').includes('cat-stock')) collected.push(p);
    }
  }
}
const collected = [];
walkSrc('src', collected);
collected.sort();
console.log(JSON.stringify(collected, null, 2));
console.log('count:', collected.length);
