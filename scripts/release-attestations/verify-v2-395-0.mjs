#!/usr/bin/env node
// verify-v2-395-0.mjs — the round's FEATURE gate (v2.395.0 "the submission
// receipt hop"). The release MECHANICS live in verify-current.mjs. This
// script pins only what is NEW this round: the two hop doors (the audit
// row's and the history row's Receipt buttons), the paper-trail dialog
// (host id, print face, copy voice, the record's dl rows, the wardrobe),
// the pretty-print law with its raw fallback, and the release's own slots.
// THE OD LAW: bytes, not memory.
import { readFileSync } from 'node:fs';

let pass = 0, fail = 0;
const ok = (name, cond) => {
  if (cond) { pass++; console.log(`  ok  ${name}`); }
  else { fail++; console.error(`x FAIL ${name}`); }
};
const read = (p) => readFileSync(p, 'utf8');

const DESK = read('src/app/(shell)/tabs/etims-tab.tsx');
const ROUTE = read('src/app/api/kra/submissions/route.ts');
const PIPELINE = read('src/lib/receipt-pdf.ts');
const SUITE = read('src/tests/etims-receipt-hop-v2395.test.ts');
const FEED = read('src/lib/whats-new.ts');
const CHANGELOG = read('CHANGELOG.md');
const CHANGELOG_TEST = read('src/tests/console-changelog.test.ts');
const pkg = JSON.parse(read('package.json'));
const version = read('VERSION').trim();

console.log('— the hop doors —');
ok('THE AUDIT ROW DOOR (handle once, human name, quiet wardrobe)',
  DESK.includes('data-testid="kra-audit-receipt-open"')
  && (DESK.split('data-testid="kra-audit-receipt-open"').length - 1) === 1
  && DESK.includes('aria-label="Open submission receipt"'));
ok('THE HISTORY ROW DOOR (the optional-prop form, wired at the call site)',
  DESK.includes('data-testid="kra-history-receipt-open"')
  && DESK.includes('onOpenReceipt?: (submission: KraSubmissionItem) => void;')
  && DESK.includes('<SubmissionHistoryRow key={sub.id} submission={sub} onOpenReceipt={setReceiptFor} />'));
ok('TWO DOORS, ONE NAME (exactly two "Open submission receipt" aria-labels)',
  (DESK.split('aria-label="Open submission receipt"').length - 1) === 2);
ok('TWO SECTIONS, THE SHARED DIALOG (both render SubmissionReceiptDialog)',
  (DESK.split('<SubmissionReceiptDialog submission={receiptFor} onClose={() => setReceiptFor(null)} />').length - 1) === 2);

console.log('— the paper-trail dialog —');
ok('THE HOST (the id the pipeline resolves + the probe handle)',
  DESK.includes('id="kra-submission-receipt"')
  && DESK.includes('data-testid="kra-submission-receipt"')
  && PIPELINE.includes('document.getElementById(elementId)'));
ok('THE PRINT FACE (name, title, the pipeline call, the Printer icon)',
  DESK.includes('aria-label="Print submission receipt"')
  && DESK.includes('title="Print the submission receipt"')
  && DESK.includes("printReceiptElement('kra-submission-receipt')")
  && DESK.includes('<Printer className="h-3 w-3 mr-1" />'));
ok('PRINT BEFORE COPY (the paper leads, the clipboard follows)',
  DESK.indexOf('Print submission receipt') > -1
  && DESK.indexOf('Print submission receipt') < DESK.indexOf('Copy response JSON'));
ok('THE COPY VOICE (pretty JSON, the toast, the two-second hand-back)',
  DESK.includes("toast.success('Response JSON copied to the clipboard.')")
  && DESK.includes('setTimeout(() => setResponseCopied(false), 2000);')
  && DESK.includes("{responseCopied ? 'Copied' : 'Copy'}"));
ok('THE PRETTY-PRINT LAW WITH THE RAW FALLBACK (the hop never lies)',
  DESK.includes('return JSON.stringify(JSON.parse(json), null, 2);')
  && DESK.includes('return json;')
  && DESK.includes('No response body was recorded for this call.'));
ok('THE RECORD ROWS (reference, invoice, receipt no., submitted, processed, error)',
  ['KRA reference', 'Invoice no.', 'Receipt #', 'Submitted', 'Processed', 'Error']
    .every((dt) => DESK.includes(`<dt className="text-muted-foreground">${dt}</dt>`)));
ok('THE PAPER-TRAIL WARDROBE (the payload card\u2019s slate faces, dark twins)',
  DESK.includes('rounded-lg border border-slate-200 bg-slate-50/60 dark:border-slate-800 dark:bg-slate-900/40 p-3 text-xs space-y-3')
  && DESK.includes('divide-y divide-slate-200 dark:divide-slate-800')
  && DESK.includes('max-h-56 overflow-y-auto whitespace-pre-wrap break-all'));
ok('THE RESPONSE FLOWS FROM THE WIRE (the route includes every scalar)',
  ROUTE.includes('include: {'));
ok('THE STATUS BANNER SHARES THE ROW VOCABULARY',
  DESK.includes('const statusCfg = SUBMISSION_STATUS_CONFIG[submission.status] || SUBMISSION_STATUS_CONFIG.PENDING;'));
ok('THE PIN SUITE EXISTS AND SPEAKS THE HOP',
  SUITE.includes('the hop doors') && SUITE.includes('the hop never lies'));

console.log('— the release slots —');
ok('THE FEED LEADS WITH THE ROUND (title + the shop-floor bullets)',
  FEED.includes("version: '2.395.0',")
  && FEED.indexOf("version: '2.395.0',") < FEED.indexOf("version: '2.394.0',")
  && FEED.includes('The submission receipt hop')
  && FEED.includes('KRA Audit Log')
  && FEED.includes('pretty-printed'));
ok('THE CHANGELOG LEADS WITH THE ROUND',
  CHANGELOG.startsWith('## [2.395.0] The submission receipt hop'));
ok('THE VERSION SLOTS AGREE',
  version === '2.395.0'
  && pkg.version === '2.395.0'
  && pkg.mbumah.releaseVersion === '2.395.0'
  && pkg.mbumah.baseVersion === '2.395.0');
ok('THE CASCADE HISTORY LINE LANDED',
  CHANGELOG_TEST.includes('// v2.395.0:')
  && CHANGELOG_TEST.includes('285/286/287/318'));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
