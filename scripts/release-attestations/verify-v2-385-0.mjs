#!/usr/bin/env node
// verify-v2-385-0.mjs — the round's FEATURE gate (v2.385.0 "the dry run
// speaks its payload"). The release MECHANICS live in verify-current.mjs.
// This script pins only what is NEW this round: the wire's additive
// widening (payload?: KraInvoicePayload), the dialog's two doors (the
// dry-run stays open, the live submit clears and closes), both openers'
// clean start, the row affordance's gate and prefill, the preview card's
// bytes and position law, the money-face coercion, the palette honesty
// bounds, and the what's-new lead.
// THE OD LAW: bytes, not memory.
import { readFileSync } from 'node:fs';

let pass = 0, fail = 0;
const ok = (name, cond) => {
  if (cond) { pass++; console.log(`  ok  ${name}`); }
  else { fail++; console.error(`x FAIL ${name}`); }
};
const read = (p) => readFileSync(p, 'utf8');

const API = read('src/lib/api.ts');
const DESK = read('src/app/(shell)/tabs/etims-tab.tsx');
const ROUTE = read('src/app/api/kra/submit/route.ts');
const SUITE = read('src/tests/kra-submit-preview-v2385.test.ts');
const FEED = read('src/lib/whats-new.ts');
const pkg = JSON.parse(read('package.json'));
const version = read('VERSION').trim();

console.log('— the wire —');
ok('THE PAYLOAD JOINS THE RESPONSE TYPE ADDITIVELY',
  API.includes('payload?: KraInvoicePayload')
  && API.includes("KraInvoicePayload,\n} from './types';"));
ok('THE TYPE LIVES IN THE CLIENT HOME (the mapper re-exports the moved truth)',
  read('src/lib/kra-helpers.ts').includes("export type { KraInvoiceLineItem, KraInvoicePayload } from './types';"));
ok('THE OLD KEYS STAY (additive, never a rewrite)',
  API.includes('invoiceForKra: InvoiceForKraItem;')
  && API.includes('result?: unknown;')
  && API.includes('dryRun?: boolean;'));
ok('THE ROUTE\u2019S SHORT-CIRCUIT IS THE SHAPE OF RECORD',
  ROUTE.includes('payload: mapped.payload') && ROUTE.includes('dryRun: true'));

console.log('— the dialog\u2019s two doors —');
ok('A DRY-RUN STAYS OPEN AND SPEAKS THE PAYLOAD (the fix)',
  DESK.includes('if (res.payload) setDryRunPayload(res.payload);')
  && DESK.includes("toast.success('Dry-run complete. Payload mapped - no KRA call was made.');"));
{
  const dryArm = DESK.slice(DESK.indexOf('if (res?.dryRun) {'), DESK.indexOf('} else {'));
  ok('THE DRY-RUN BRANCH NEVER CLOSES THE DIALOG', !dryArm.includes('setShowSubmitDialog(false)'));
}
ok('THE ENVELOPE READ NARROWS THROUGH data.data',
  DESK.includes('const res = data.data;') && DESK.includes('if (res?.dryRun) {'));
ok('A LIVE SUBMIT CLEARS PAYLOAD, DIALOG AND INPUT',
  /setDryRunPayload\(null\);\s*\n\s*setShowSubmitDialog\(false\);\s*\n\s*setSubmitTransactionId\(''\);/.test(DESK));
ok('BOTH OPENERS START FROM A CLEAN DIALOG (the toolbar + the row)',
  (DESK.match(/setDryRunPayload\(null\);\s*\n\s*setShowSubmitDialog\(true\);/g) || []).length === 2
  && DESK.includes("setSubmitTransactionId('');\n                    setDryRunPayload(null);\n                    setShowSubmitDialog(true);"));

console.log('— the row —');
ok('THE PENDING-ROW AFFORDANCE IS CANSUBMIT-GATED',
  DESK.includes("{canSubmit && inv.submissionStatus === 'PENDING' && ("));
ok('THE AFFORDANCE PRE-FILLS THE TRANSACTION ID',
  DESK.includes('setSubmitTransactionId(inv.transactionId);'));
ok('THE AFFORDANCE SPEAKS ITS OWN NAME (sr-only, aria-label, title)',
  DESK.includes('<span className="sr-only">Submit to KRA</span>')
  && DESK.includes('aria-label={`Submit ${inv.kraInvoiceNumber} to KRA`}')
  && DESK.includes('title="Submit to KRA"'));
ok('THE SEND ICON IS THE FACE (the row\u2019s h-3 w-3 scale)',
  DESK.includes('<Send className="h-3 w-3" />'));

console.log('— the preview —');
ok('THE CARD MOUNTS ONLY ON A LANDED PAYLOAD',
  DESK.includes('{dryRunPayload && (')
  && DESK.includes('data-testid="kra-dryrun-payload"')
  && DESK.includes('aria-live="polite"'));
ok('THE HEADER NAMES THE DRY-RUN CONTRACT',
  DESK.includes('Mapped payload — no KRA call was made'));
ok('THE MONEY FACES RIDE THE BOUNDARY COERCION (the money-face law)',
  DESK.includes('const payloadMoney = (v: number | string) => formatKES(Number(v));')
  && DESK.includes('{payloadMoney(dryRunPayload.totalVat)}')
  && DESK.includes('{payloadMoney(dryRunPayload.totalAmount)}'));
ok('THE POSITION LAW (input block, then preview, then footer)',
  DESK.indexOf('The transaction must belong to this store') < DESK.indexOf('data-testid="kra-dryrun-payload"')
  && DESK.indexOf('data-testid="kra-dryrun-payload"') < DESK.indexOf('<DialogFooter className="gap-2">'));
ok('THE COPY VOICE HAS BOTH STATES',
  DESK.includes('aria-label="Copy mapped payload as JSON"')
  && DESK.includes("{payloadCopied ? 'Copied' : 'Copy'}")
  && DESK.includes('setTimeout(() => setPayloadCopied(false), 2000);'));

console.log('— the palette honesty —');
ok('NO NEW FAMILY BYTE ON THIS DESK',
  !DESK.includes('border-lime-300 bg-lime-100')
  && !DESK.includes('border-orange-300 bg-orange-100')
  && !DESK.includes('border-teal-300 bg-teal-100'));
ok('THE TWENTY-SECOND WORD\u2019S RED CHIP STAYS (untouched)',
  DESK.includes('border-red-200 bg-red-50'));

console.log('— the release\u2019s own faces —');
ok('THE SUITE EXISTS AND PINS THE ROUND', SUITE.length > 4000 && SUITE.includes('THE DRY RUN SPEAKS ITS PAYLOAD'));
ok('THE FEED\u2019S LEAD ENTRY IS THE ROUND',
  FEED.indexOf("version: '2.385.0'") >= 0
  && FEED.indexOf("version: '2.385.0'") < FEED.indexOf("version: '2.384.0'"));
ok('THE VERSION SLOTS SPEAK 2.385.0',
  version === '2.385.0' && pkg.version === '2.385.0');

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
