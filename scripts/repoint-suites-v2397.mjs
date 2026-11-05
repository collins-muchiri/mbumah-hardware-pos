#!/usr/bin/env node
/**
 * repoint-suites-v2397.mjs — the v2.397.0 ELDER LOOM suite re-point codemod
 * (the v2.394 template applied to the 22 elder deep-link suites).
 *
 * Per suite: the label's JSX-brace form becomes the loomed desks'
 * template-literal form; the wardrobe pins (light trio, dark trio, bare
 * pair, the font-qualified pair) move from the desk to the LOOM with the
 * dated hue-proves-family form; the group-hover detail moves to the loom;
 * the chip-anchored slice windows widen to the measured elder span.
 * Every replacement class prints its raw count and a re-run answers ZERO
 * (idempotence is the proof the cascade landed exactly once).
 */
import { readFileSync, writeFileSync } from 'node:fs';

const SUITES = {
  'ad-severity-deep-link-v2366': { word: 'ad-severity', hue: 'neutral', stem: 'ad-severity', v: 'landedAdSeverity' },
  'cat-stock-deep-link-v2364': { word: 'cat-stock', hue: 'purple', stem: 'cat-stock', v: 'landedCatStock' },
  'cv-type-deep-link-v2363': { word: 'cv-type', hue: 'slate', stem: 'cv-type', v: 'landedCvType' },
  'cr-type-deep-link-v2361': { word: 'cr-type', hue: 'yellow', stem: 'cr-type', v: 'landedCrType' },
  'cust-debt-deep-link-v2330': { word: 'cust-debt', hue: 'rose', stem: 'cust', v: 'landedCustDebtLens' },
  'dp-status-deep-link-v2365': { word: 'dp-status', hue: 'zinc', stem: 'dp-status', v: 'landedDpStatus' },
  'dn-status-deep-link-v2359': { word: 'dn-status', hue: 'sky', stem: 'dn-status', v: 'landedDnStatus' },
  'et-status-deep-link-v2381': { word: 'et-status', hue: 'red', stem: 'et-status', v: 'landedStatus' },
  'gc-status-deep-link-v2358': { word: 'gc-status', hue: 'lime', stem: 'gc-status', v: 'landedGcStatus' },
  'inv-stock-deep-link-v2329': { word: 'inv-stock', hue: 'amber', stem: 'inv', v: 'landedStockLens' },
  'inv-status-deep-link-v2356': { word: 'inv-status', hue: 'teal', stem: 'inv-status', v: 'landedInvStatus' },
  'ly-type-deep-link-v2368': { word: 'ly-type', hue: 'green', stem: 'ly-type', v: 'landedLyType' },
  'po-status-deep-link-v2328': { word: 'po-status', hue: 'indigo', stem: 'po', v: 'landedStatus' },
  'pr-status-deep-link-v2362': { word: 'pr-status', hue: 'stone', stem: 'pr-status', v: 'landedPrStatus' },
  'rent-status-deep-link-v2355': { word: 'rent-status', hue: 'orange', stem: 'rent-status', v: 'landedRentStatus' },
  'sec-type-deep-link-v2367': { word: 'sec-type', hue: 'gray', stem: 'sec-type', v: 'landedSecType' },
  'sup-po-deep-link-v2332': { word: 'sup-po', hue: 'cyan', stem: 'sup-po', v: 'landedSupPo' },
  'sup-status-deep-link-v2331': { word: 'sup-status', hue: 'emerald', stem: 'sup', v: 'landedSupStatus' },
  'transfer-status-deep-link-v2357': { word: 'transfer-status', hue: 'blue', stem: 'transfer-status', v: 'landedTransferStatus' },
  'txn-pay-deep-link-v2333': { word: 'txn-pay', hue: 'violet', stem: 'txn', v: 'landedTxnPay' },
  'txn-type-deep-link-v2354': { word: 'txn-type', hue: 'fuchsia', stem: 'txn-type', v: 'landedTxnType' },
  'vc-status-deep-link-v2360': { word: 'vc-status', hue: 'pink', stem: 'vc-status', v: 'landedVcStatus' },
};

const ROOT = new URL('..', import.meta.url).pathname;
let total = 0;

for (const [name, { word, hue, stem, v }] of Object.entries(SUITES)) {
  const path = `${ROOT}src/tests/${name}.test.ts`;
  let src = readFileSync(path, 'utf8');
  const before = src;
  const counts = [];

  // 0. the module-scope LOOM read (idempotent)
  if (!src.includes("const LOOM = readFileSync('src/components/landing-chip.tsx', 'utf8');")) {
    const fsImport = /import \{[^}]*readFileSync[^}]*\} from 'node:fs';\n/;
    if (!fsImport.test(src)) { console.error(`${name}: no node:fs import`); process.exit(1); }
    src = src.replace(fsImport, (m) => m + "\nconst LOOM = readFileSync('src/components/landing-chip.tsx', 'utf8');\n");
    counts.push('loom-const');
  }

  // 1. the label's template-literal form
  const labelOld = `expect(desk.includes('landed ?${word}={${v}}')).toBe(true);`;
  const labelNew = `expect(desk.includes('landed ?${word}=\${${v}}')).toBe(true);`;
  if (src.includes(labelOld)) { src = src.split(labelOld).join(labelNew); counts.push('label-form'); }

  // 2. the light trio: desk proves the family by hue, the loom carries the bytes
  const trio = `border-${hue}-200 bg-${hue}-50 text-${hue}-700`;
  const lightOld = `expect(desk.includes('${trio}')).toBe(true);`;
  if (src.includes(lightOld)) {
    const lightNew = `// v2.397.0 THE LOOM: the elder wardrobe moved into the loom's 200\n    // registry — the desk proves its family by hue, the registry carries\n    // the bytes.\n    expect(desk.includes('hue="${hue}"')).toBe(true);\n    expect(LOOM.includes('${trio}')).toBe(true);`;
    src = src.split(lightOld).join(lightNew);
    counts.push('light-trio');
  }

  // 3. the dark trio
  const dark = `dark:border-${hue}-500/30 dark:bg-${hue}-500/10 dark:text-${hue}-300`;
  const darkOld = `expect(desk.includes('${dark}')).toBe(true);`;
  if (src.includes(darkOld)) {
    src = src.split(darkOld).join(`expect(LOOM.includes('${dark}')).toBe(true);`);
    counts.push('dark-trio');
  }

  // 4. the group-hover detail
  const hoverOld = `expect(desk.includes('opacity-60 transition-opacity group-hover:opacity-100')).toBe(true);`;
  if (src.includes(hoverOld)) {
    src = src.split(hoverOld).join(`expect(LOOM.includes('opacity-60 transition-opacity group-hover:opacity-100')).toBe(true);`);
    counts.push('group-hover');
  }

  // 5. the bare pair
  const pairOld = `expect(desk.includes('border-${hue}-200 bg-${hue}-50')).toBe(true);`;
  if (src.includes(pairOld)) {
    src = src.split(pairOld).join(`expect(LOOM.includes('border-${hue}-200 bg-${hue}-50')).toBe(true);`);
    counts.push('bare-pair');
  }

  // 6. the font-qualified pair
  const fontOld = `expect(desk.includes('${trio} text-xs font-medium')).toBe(true);`;
  if (src.includes(fontOld)) {
    src = src.split(fontOld).join(`expect(LOOM.includes('${trio} text-xs font-medium')).toBe(true);`);
    counts.push('font-pair');
  }

  // 7. the chip-anchored slice windows widen to the measured elder span
  //    (the scrub bodies span ~990; 1200 is the honest window)
  const lines = src.split('\n');
  let anchorVar = null;
  for (let i = 0; i < lines.length; i++) {
    const am = lines[i].match(/const (\w+) = desk\.indexOf\('data-testid="[a-z-]+-landing-word"'\)/);
    if (am) { anchorVar = am[1]; continue; }
    if (anchorVar) {
      const sm = lines[i].match(new RegExp(`\\.slice\\(${anchorVar}, ${anchorVar} \\+ (\\d+)\\)`));
      if (sm && Number(sm[1]) < 1200) {
        lines[i] = lines[i].replace(new RegExp(`\\+ ${sm[1]}\\)`), '+ 1200)');
        counts.push(`window+${sm[1]}`);
      }
      // the anchor scope ends when a new const block or blank context begins
      if (/^\s*}\);/.test(lines[i])) anchorVar = null;
    }
  }
  src = lines.join('\n');

  if (src !== before) {
    writeFileSync(path, src);
    total++;
    console.log(`${name}: ${counts.join(', ')}`);
  }
}
console.log(`suites touched: ${total} (a re-run must answer 0)`);
