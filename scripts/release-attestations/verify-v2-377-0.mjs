#!/usr/bin/env node
// verify-v2-377-0.mjs — the round's FEATURE gate (v2.377.0 "the last
// native prompt retires"). The release MECHANICS live in
// verify-current.mjs. This script pins only what is NEW this round: the
// multiline sibling's contract, the payroll void ask's migration (the
// byte-identical fallback voice), and THE ZERO-SURVIVOR CENSUS.
// THE OD LAW: bytes, not memory.
import { readFileSync } from 'node:fs';

let pass = 0, fail = 0;
const ok = (name, cond) => {
  if (cond) { pass++; console.log(`  ok  ${name}`); }
  else { fail++; console.error(`x FAIL ${name}`); }
};
const read = (p) => readFileSync(p, 'utf8');

const PRIM = read('src/components/send-prompt-dialog.tsx');
const PAYROLL = read('src/app/(shell)/tabs/payroll-tab.tsx');
const SUITE = read('src/tests/ask-text-dialog-v2377.test.tsx');
const HANDOVER = read('src/tests/send-prompt-dialog-v2376.test.tsx');
const pkg = JSON.parse(read('package.json'));
const version = read('VERSION').trim();

console.log('— the multiline sibling —');
ok('THE HOOK RETURNS THE { ask, dialog } CONTRACT (the send ask\'s twin)',
  PRIM.includes('export function useAskText()')
  && PRIM.includes("return { ask, dialog, open };"));
ok('THE TEXTAREA IS THE FACE (rows-sized, aria-wired)',
  PRIM.includes('data-testid="ask-text-input"')
  && PRIM.includes('rows={opts?.rows || 4}')
  && PRIM.includes('aria-invalid={error ? true : undefined}'));
ok('THE DESTRUCTIVE TONE DRESSES THE CONFIRM',
  PRIM.includes("variant={opts?.destructive ? 'destructive' : 'default'}")
  && PRIM.includes('bg-red-50 text-red-600 dark:bg-red-950/40'));
ok('THE REQUIRED VOICE IS OPTIONAL WITH ITS OWN MESSAGE',
  PRIM.includes("if (opts.required && !trimmed) {")
  && PRIM.includes("opts.requiredMessage || 'This cannot stay empty — the audit log needs a line.'"));
ok('THE ERROR HEALS THE MOMENT THE VALUE CHANGES (the family law)',
  PRIM.includes("onChange={(e) => { setValue(e.target.value); if (error) setError(null); }}"));
ok('A RE-ASK SETTLES THE PENDING RESOLVER (no hung promise)',
  PRIM.split('resolverRef.current?.(null); // a re-ask while one is pending settles the old one').length === 3);

console.log('— the payroll void ask migrated —');
ok('THE DESK CONSUMES THE HOOK AND RENDERS THE DIALOG',
  PAYROLL.includes('const { ask: askVoidReason, dialog: askTextDialog } = useAskText();')
  && /\{\s*askTextDialog\s*\}/.test(PAYROLL));
ok('THE ASK SPEAKS THE RUN\'S OWN FACTS',
  PAYROLL.includes('`Void the ${run.runType} pay run for ${run.periodName}?`')
  && PAYROLL.includes('Totals stay visible for audit; status becomes VOIDED. Only possible because nothing was paid and nothing was posted to the ledger.'));
ok('THE WORKING REASON PRE-FILLS', PAYROLL.includes("prefill: 'Deductions booked without earnings - superseded by corrected run'"));
ok('THE CONFIRM DRESSES THE WEIGHT', PAYROLL.includes("confirmLabel: 'Void pay run',") && PAYROLL.includes('destructive: true,'));
ok('THE CANCEL CONTRACT STANDS (null returns)', PAYROLL.includes('if (reason === null) return;'));
ok('THE EMPTY-CONFIRM FALLBACK IS BYTE-IDENTICAL (the mutation voice)',
  PAYROLL.includes("reason: reason.trim() || 'Voided by admin'"));
ok('NO window.prompt CALL REMAINS ON THE DESK', !/window\.prompt\(/.test(PAYROLL));

console.log('— the zero-survivor census —');
ok('THE PRODUCT TREE ANSWERS ZERO (app + components + lib)',
  !/window\.prompt\(/.test(PRIM)
  && !/window\.prompt\(/.test(PAYROLL)
  && !/window\.prompt\(/.test(read('src/lib/whats-new.ts')));
ok('THE HANDOVER SUITE SPEAKS THE NEW TRUTH (ONE → ZERO)',
  HANDOVER.includes('exactly ZERO window.prompt call sites')
  && !HANDOVER.includes('exactly ONE window.prompt call site'));

console.log('— the round\u2019s suite —');
ok('THE SUITE EXISTS AND SPEAKS THE ROUND', SUITE.includes('THE ZERO-SURVIVOR CENSUS'));
ok('THE SUITE TRUTH-TABLES THE MULTILINE LIVE',
  SUITE.includes("expect(input.tagName).toBe('TEXTAREA')"));
ok('THE SUITE PINS THE BYTE-IDENTICAL FALLBACK',
  SUITE.includes("expect(src).toContain(\"reason: reason.trim() || 'Voided by admin'\")"));

console.log('— the release slots —');
ok('pkg version = VERSION', pkg.version === version);
ok('VERSION SPEAKS THE ROUND', version === '2.377.0');

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
