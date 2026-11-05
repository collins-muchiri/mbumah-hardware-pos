#!/usr/bin/env node
/**
 * loom-elder-v2397.mjs — the v2.397.0 ELDER LOOM codemod.
 *
 * Swaps the census's 22 loomable elder landing chips (the 200/50 storey,
 * three heads) from hand-rolled <button> JSX to the shared LandingChip,
 * keeping each desk's exact testid, title, label expression and dismissal
 * writes. Adds the loom import where missing; retires Link2/X imports the
 * desk no longer speaks. ly-window stays hand-rolled (the off-union
 * exclusion — the exports PAYROLL carry's sibling).
 *
 * Prints the extracted specs as JSON (for the loom suite's THE_ELDER
 * block) and fails loudly on ANY structural mismatch — the codemod never
 * guesses.
 */
import { readFileSync, writeFileSync } from 'node:fs';

const ROOT = new URL('..', import.meta.url).pathname;

// the 22 loomable elder chips (the census's faces, ly-window excluded)
const CHIPS = [
  // compact five
  { desk: 'src/app/(shell)/tabs/admin-tab.tsx', testid: 'ad-severity-landing-word', hue: 'neutral', variant: 'compact' },
  { desk: 'src/app/(shell)/tabs/catalog-tab.tsx', testid: 'cat-stock-landing-word', hue: 'purple', variant: 'compact' },
  { desk: 'src/app/(shell)/tabs/conversations-tab.tsx', testid: 'cv-type-landing-word', hue: 'slate', variant: 'compact' },
  { desk: 'src/app/(shell)/tabs/debt-plans-tab.tsx', testid: 'dp-status-landing-word', hue: 'zinc', variant: 'compact' },
  { desk: 'src/app/(shell)/tabs/security-tab.tsx', testid: 'sec-type-landing-word', hue: 'gray', variant: 'compact' },
  // standard eleven
  { desk: 'src/app/(shell)/tabs/credits-tab.tsx', testid: 'cr-type-landing-word', hue: 'yellow', variant: 'standard' },
  { desk: 'src/app/(shell)/tabs/delivery-notes-tab.tsx', testid: 'dn-status-landing-word', hue: 'sky', variant: 'standard' },
  { desk: 'src/app/(shell)/tabs/etims-tab.tsx', testid: 'et-status-landing-word', hue: 'red', variant: 'standard' },
  { desk: 'src/app/(shell)/tabs/gift-cards-tab.tsx', testid: 'gc-status-landing-word', hue: 'lime', variant: 'standard' },
  { desk: 'src/app/(shell)/tabs/invoices-tab.tsx', testid: 'inv-status-landing-word', hue: 'teal', variant: 'standard' },
  { desk: 'src/app/(shell)/tabs/loyalty-tab.tsx', testid: 'ly-type-landing-word', hue: 'green', variant: 'standard' },
  { desk: 'src/app/(shell)/tabs/payroll-tab.tsx', testid: 'pr-status-landing-word', hue: 'stone', variant: 'standard' },
  { desk: 'src/app/(shell)/tabs/rentals-tab.tsx', testid: 'rent-status-landing-word', hue: 'orange', variant: 'standard' },
  { desk: 'src/app/(shell)/tabs/transactions-tab.tsx', testid: 'txn-type-landing-word', hue: 'fuchsia', variant: 'standard' },
  { desk: 'src/app/(shell)/tabs/transfers-tab.tsx', testid: 'transfer-status-landing-word', hue: 'blue', variant: 'standard' },
  { desk: 'src/app/(shell)/tabs/vouchers-tab.tsx', testid: 'vc-status-landing-word', hue: 'pink', variant: 'standard' },
  // quiet six
  { desk: 'src/app/(shell)/tabs/customers-tab.tsx', testid: 'cust-landing-word', hue: 'rose', variant: 'quiet' },
  { desk: 'src/app/(shell)/tabs/inventory-tab.tsx', testid: 'inv-landing-word', hue: 'amber', variant: 'quiet' },
  { desk: 'src/app/(shell)/tabs/purchase-orders-tab.tsx', testid: 'po-landing-word', hue: 'indigo', variant: 'quiet' },
  { desk: 'src/app/(shell)/tabs/suppliers-tab.tsx', testid: 'sup-landing-word', hue: 'emerald', variant: 'quiet' },
  { desk: 'src/app/(shell)/tabs/suppliers-tab.tsx', testid: 'sup-po-landing-word', hue: 'cyan', variant: 'quiet' },
  { desk: 'src/app/(shell)/tabs/transactions-tab.tsx', testid: 'txn-landing-word', hue: 'violet', variant: 'quiet' },
];

const fail = (msg) => {
  console.error('CODEMOD FAIL: ' + msg);
  process.exit(1);
};

const specs = [];
const deskSources = new Map();

for (const chip of CHIPS) {
  const path = ROOT + chip.desk;
  if (!deskSources.has(path)) deskSources.set(path, readFileSync(path, 'utf8'));
  const src = deskSources.get(path);

  // THE BLOCK: <button type="button" onClick={() => { ... }} className="{historic}"
  //   data-testid="{testid}" title="{title}" > <Link2 …/> <span …>{label}</span> <X …/> </button>
  // Attribute order is the family's own convention (verified across all 22);
  // the codemod asserts it and fails loudly otherwise.
  // THE BODY GUARD: the dismissal body may never cross another <button —
  // without it the leftmost-match law lets a sibling chip's <button open
  // the block and the lazy body swallow BOTH (observed: txn-landing's
  // button opened txn-type's block and the swap ate the pair).
  const blockRe = new RegExp(
    '([ \\t]*)<button\\s+type="button"\\s+onClick=\\{\\(\\) => \\{((?:(?!<button)[\\s\\S])*?)\\}\\}\\s+className="([^"]+)"\\s+data-testid="' +
      chip.testid +
      '"\\s+title="([^"]+)"\\s*>\\s*<Link2 className="h-3 w-3 shrink-0" aria-hidden="true" />\\s*<span className="tabular-nums">([^<{]*)(?:\\{([^}]+)\\})?</span>\\s*<X className="h-3 w-3 shrink-0 ([^"]*)" aria-hidden="true" />\\s*</button>'
  );
  const m = src.match(blockRe);
  if (!m) fail(`block not found (or anatomy drift) for ${chip.testid} in ${chip.desk}`);
  const [whole, indent, dismissBody, historic, title, labelHead, labelExpr, xTail] = m;
  // the label: text + {expr} becomes the loomed desks' template-literal form
  // `landed ?word=${var}`; a bare {expr} stays a bare expression
  let labelProp;
  if (labelHead && labelExpr) labelProp = `label={\`${labelHead}\${${labelExpr}}\`}`;
  else if (labelExpr) labelProp = `label={${labelExpr}}`;
  else if (labelHead) labelProp = `label="${labelHead}"`;
  else fail(`${chip.testid}: empty label span`);

  // the anatomy laws the loom now speaks
  if (!historic.includes(`border-${chip.hue}-200 bg-${chip.hue}-50 text-${chip.hue}-700`))
    fail(`${chip.testid}: historic className does not carry the ${chip.hue} 200/50 trio`);
  const expectedXTail =
    chip.variant === 'quiet' ? 'opacity-60' : 'opacity-60 transition-opacity group-hover:opacity-100';
  if (xTail !== expectedXTail)
    fail(`${chip.testid}: X tail "${xTail}" does not match the ${chip.variant} variant's "${expectedXTail}"`);
  if (chip.variant === 'quiet' && historic.startsWith('group '))
    fail(`${chip.testid}: quiet variant must not carry the group head`);
  if (chip.variant !== 'quiet' && !historic.startsWith('group '))
    fail(`${chip.testid}: ${chip.variant} variant must carry the group head`);
  const expectedHeadInner =
    chip.variant === 'compact'
      ? 'items-center gap-1 h-6 px-2'
      : 'items-center gap-1.5 h-7 px-2.5';
  if (!historic.includes(expectedHeadInner))
    fail(`${chip.testid}: head does not match the ${chip.variant} variant's ${expectedHeadInner}`);

  // the dismissal writes: normalise the body's indentation to the prop form
  const dismissLines = dismissBody
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

  // build the LandingChip JSX (props in the loomed desks' established order)
  const props = [];
  if (chip.variant !== 'standard') props.push(`variant="${chip.variant}"`);
  props.push(`storey={200}`);
  props.push(`hue="${chip.hue}"`);
  props.push(`data-testid="${chip.testid}"`);
  props.push(`title="${title}"`);
  props.push(labelProp);
  props.push(
    `onDismiss={() => {\n${dismissLines.map((l) => `${indent}    ${l}`).join('\n')}\n${indent}  }}`
  );
  const replacement = `${indent}<LandingChip\n${props.map((p) => `${indent}  ${p}`).join('\n')}\n${indent}/>`;
  deskSources.set(path, src.replace(whole, replacement));

  specs.push({
    ...chip,
    title,
    labelExpr,
    dismissLines,
    historic,
    xTail,
  });
  console.log(`ok: ${chip.testid} (${chip.variant}/${chip.hue}) in ${chip.desk}`);
}

// write the desks back; add the loom import where missing
for (const [path, src] of deskSources) {
  let out = src;
  if (!out.includes(`import { LandingChip } from '@/components/landing-chip';`)) {
    const lines = out.split('\n');
    let lastImport = -1;
    for (let i = 0; i < lines.length; i++) {
      if (/^import /.test(lines[i])) lastImport = i;
    }
    if (lastImport === -1) fail(`no import block found in ${path}`);
    lines.splice(lastImport + 1, 0, `import { LandingChip } from '@/components/landing-chip';`);
    out = lines.join('\n');
  }
  // retire lucide imports the desk no longer speaks (token-exact, the
  // body search is JSX-anchored: <Link2 / <X)
  const lucide = out.match(/import \{([^}]+)\} from 'lucide-react';/);
  if (lucide) {
    const tokens = lucide[1].split(',').map((t) => t.trim()).filter(Boolean);
    const kept = tokens.filter((t) => {
      if (t === 'Link2') return out.includes('<Link2');
      if (t === 'X') return out.includes('<X');
      return true;
    });
    if (kept.length !== tokens.length) {
      if (kept.length === 0) fail(`lucide import would empty out in ${path} — remove the line by hand`);
      out = out.replace(lucide[0], `import { ${kept.join(', ')} } from 'lucide-react';`);
      console.log(`  lucide import pruned in ${path}: removed ${tokens.length - kept.length}`);
    }
  }
  writeFileSync(path, out);
  console.log(`written: ${path}`);
}

console.log('=== SPECS JSON (for the loom suite) ===');
console.log(JSON.stringify(specs, null, 2));
