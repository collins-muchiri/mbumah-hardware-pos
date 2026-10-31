#!/usr/bin/env node
// verify-v2-312-0.mjs — the round's FEATURE gate (v2.312.0 "The points that expire").
// The release MECHANICS (slots, VERSION, lead placement, CHANGELOG ordering,
// walk marks) live in verify-current.mjs now — the pin unwind (Task 27's
// standing item). This script pins only what is NEW this round.
// Every check reads the SOURCE OF RECORD (bytes, not memory) — THE OD LAW.
import { readFileSync } from 'node:fs';

let pass = 0, fail = 0;
const ok = (name, cond) => {
  if (cond) { pass++; console.log(`  ok  ${name}`); }
  else { fail++; console.error(`x FAIL ${name}`); }
};
const read = (p) => readFileSync(p, 'utf8');

const svc = read('src/lib/loyalty-expiry-service.ts');
const cronRoute = read('src/app/api/cron/loyalty-expiry/route.ts');
const nightly = read('src/app/api/cron/nightly/route.ts');
const deskRoute = read('src/app/api/loyalty/expiry/route.ts');
const dialog = readRepoSafe('src/components/loyalty/expiry-dialog.tsx');
const desk = readRepoSafe('src/app/(shell)/tabs/loyalty-tab.tsx');
const faceTest = readRepoSafe('src/tests/loyalty-expiry-v2312.test.ts');

function readRepoSafe(rel) { return read(rel); }

console.log('— the pure FIFO seam (loyalty-expiry-service.ts) —');
ok('computeLoyaltyExpiryPlan exists and is exported', svc.includes('export function computeLoyaltyExpiryPlan('));
ok('the FIFO law: survivors = oldLotsSum − totalConsumption', svc.includes('const survivors = Math.max(0, oldLotsSum - totalConsumed);'));
ok('the claim is capped by the CURRENT wallet (drift-proof)', svc.includes('Math.min(survivors, Math.max(0, balance))'));
ok('the policy constants exist (365 default, 30 floor)', svc.includes('LOYALTY_EXPIRY_DEFAULT_DAYS = 365') && svc.includes('LOYALTY_EXPIRY_MIN_DAYS = 30'));

console.log('— the writer and its guardrails —');
ok('the run claims with the conditional decrement (clawback pattern)', svc.includes('loyaltyPoints: { gte: plan.expirable }') && svc.includes('loyaltyPoints: { decrement: plan.expirable }'));
ok('lost claims skip honestly (claimed-lost, never a negative wallet)', svc.includes("note: 'claimed-lost'") && svc.includes('if (claimed.count === 0)'));
ok('the EXPIRE row speaks both voices + the EXPIRY_RUN audit thread', svc.includes("transactionType: 'EXPIRE'") && svc.includes("type: 'EXPIRED'") && svc.includes("LOYALTY_EXPIRY_REFERENCE_TYPE = 'EXPIRY_RUN'"));
ok('the tier NEVER demotes and lifetime totals NEVER shrink', !svc.includes('loyaltyTier') && !svc.includes('totalLoyaltyEarned'));
ok('the dry run answers the plan and writes NOTHING', (svc.split('if (dryRun)')[1] ?? '').split('// The claim')[0].includes('continue;') && !(svc.split('if (dryRun)')[1] ?? '').split('// The claim')[0].includes('loyaltyTransaction.create'));

console.log('— the nightly ride —');
ok('the cron route rides the reaper posture (secret + tenant bypass + real run)', cronRoute.includes('verifyCronSecret(request)') && cronRoute.includes('runWithoutTenant') && cronRoute.includes('dryRun: false'));
ok('the dispatcher carries the loyalty-expiry sub-job', nightly.includes("{ name: 'loyalty-expiry', run: () => loyaltyExpiryGET(request) }") && nightly.includes("import { GET as loyaltyExpiryGET } from '@/app/api/cron/loyalty-expiry/route';"));
ok('a healthy zero sweep still leaves a ledger trace', cronRoute.includes('nothing to expire') && cronRoute.includes('LOYALTY_EXPIRY_RUN'));

console.log('— the desk\u2019s two doors —');
ok('preview: manager-gated, dry-run only, no claim in its body', deskRoute.includes('withSessionAuth(previewHandler, { roles: MANAGER_PLUS_ROLES })') && (deskRoute.split('async function previewHandler')[1] ?? '').split('async function runHandler')[0].includes('dryRun: true'));
ok('run: manager-gated, real claims, NO dry-run escape hatch', deskRoute.includes('withSessionAuth(runHandler, { roles: MANAGER_PLUS_ROLES })') && deskRoute.includes('dryRun is NOT accepted here') && deskRoute.includes('dryRun: false,'));
ok('both voices log LOYALTY_EXPIRY_RUN', deskRoute.includes("action: LOYALTY_EXPIRY_LOG_ACTION"));

console.log('— the desk face (preview \u2192 confirm \u2192 run) —');
ok('the dialog carries the three faces + the mid-flight lock', dialog.includes('data-testid="expiry-preview"') && dialog.includes('data-testid="expiry-confirm"') && dialog.includes('data-testid="expiry-summary"') && dialog.includes("if (phase === 'running') return;"));
ok('the dialog rides the SAME service doors (preview + run)', dialog.includes('loyaltyApi.expiry.preview(') && dialog.includes('loyaltyApi.expiry.run('));
ok('the toolbar carries the amber Expiry door with focus rings', desk.includes('data-testid="open-expiry-dialog"') && desk.includes('focus-visible:ring-amber-400'));
ok('the dialog mounts conditionally (fresh face per open)', desk.includes('{expiryOpen && ('));
ok('a run invalidates the ledger + the members', desk.includes("queryKey: ['loyalty-transactions']") && desk.includes("queryKey: ['loyalty-customers']"));

console.log('— the face test holds the math —');
ok('the v2.312 face test exists with the idempotence chain', faceTest.includes("describe('v2.312.0 — the FIFO plan, executed'") && faceTest.includes('IDEMPOTENT BY CONSTRUCTION'));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
