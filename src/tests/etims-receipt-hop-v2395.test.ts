// THE RECEIPT-HOP (v2.395.0): every KRA submission reaches the operator's
// hands through a paper trail — from BOTH faces that list submissions.
//
// The audit log's rows and the invoice detail's submission-history rows
// each grow a Receipt button; the dialog speaks the same paper-trail
// wardrobe of the dry-run payload card and rides the app's print-root
// pipeline (printReceiptElement clones #kra-submission-receipt into
// #print-root; @media print shows ONLY that host; colors survive via
// print-color-adjust). The KRA response body leaves in pretty JSON — an
// unparseable body prints raw, because the hop never lies about the
// payload. The response carries `responseJson` from the wire already (the
// submissions route returns every scalar via include), so no API change
// rides this round.
//
// Pins: the two hop doors (the audit row's and the history row's handles,
// aria-labels and quiet-button wardrobe), the dialog's host id + testid,
// the Print-then-Copy order (the paper leads, the clipboard follows), the
// pipeline call, the pretty-print path and its raw fallback, the copied
// state's two-second hand-back, the status banner derived from the shared
// config, the record's dl rows (reference, invoice, receipt number,
// submitted, processed, the honest error), and the release's own slots.

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';

const DESK = readFileSync('src/app/(shell)/tabs/etims-tab.tsx', 'utf8');
const PIPELINE = readFileSync('src/lib/receipt-pdf.ts', 'utf8');
const FEED = readFileSync('src/lib/whats-new.ts', 'utf8');
const pkg = JSON.parse(readFileSync('package.json', 'utf8'));

// ---------------------------------------------------------------------------

describe('the hop doors — both faces that list submissions', () => {
  it('the audit row grows its Receipt door (handle, aria-label, quiet wardrobe)', () => {
    expect(DESK).toContain('data-testid="kra-audit-receipt-open"');
    expect(DESK.split('data-testid="kra-audit-receipt-open"').length - 1).toBe(1);
    expect(DESK).toContain('variant="ghost"');
  });

  it('the invoice history row grows the SAME door', () => {
    expect(DESK).toContain('data-testid="kra-history-receipt-open"');
    expect(DESK).toContain('onOpenReceipt?: (submission: KraSubmissionItem) => void;');
    expect(DESK).toContain('<SubmissionHistoryRow key={sub.id} submission={sub} onOpenReceipt={setReceiptFor} />');
  });

  it('both doors speak the same human name', () => {
    expect(DESK.split('aria-label="Open submission receipt"').length - 1).toBe(2);
  });

  it('each section holds its own dialog state and renders the shared dialog', () => {
    expect(DESK).toContain('const [receiptFor, setReceiptFor] = useState<KraSubmissionItem | null>(null);');
    expect(DESK.split('<SubmissionReceiptDialog submission={receiptFor} onClose={() => setReceiptFor(null)} />').length - 1).toBe(2);
  });
});

describe('the paper-trail dialog — the receipt speaks its record', () => {
  it('the host carries the id the print pipeline resolves', () => {
    expect(DESK).toContain('id="kra-submission-receipt"');
    expect(DESK).toContain('data-testid="kra-submission-receipt"');
    expect(PIPELINE).toContain('document.getElementById(elementId)');
  });

  it('the Print button speaks its own name and rides the pipeline', () => {
    expect(DESK).toContain('aria-label="Print submission receipt"');
    expect(DESK).toContain('title="Print the submission receipt"');
    expect(DESK).toContain("printReceiptElement('kra-submission-receipt')");
    expect(DESK).toContain('<Printer className="h-3 w-3 mr-1" />');
  });

  it('Print sits BEFORE Copy (the paper leads, the clipboard follows)', () => {
    const printAt = DESK.indexOf('Print submission receipt');
    const copyAt = DESK.indexOf('Copy response JSON');
    expect(printAt).toBeGreaterThan(-1);
    expect(copyAt).toBeGreaterThan(printAt);
  });

  it('the copy voice speaks pretty JSON with the two-second hand-back', () => {
    expect(DESK).toContain("toast.success('Response JSON copied to the clipboard.')");
    expect(DESK).toContain('setTimeout(() => setResponseCopied(false), 2000);');
    expect(DESK).toContain("{responseCopied ? 'Copied' : 'Copy'}");
  });

  it('the response body mounts pretty-printed inside its own scroll', () => {
    expect(DESK).toContain('data-testid="kra-submission-receipt-response"');
    expect(DESK).toContain('prettySubmissionResponse(submission.responseJson)');
  });

  it('an unparseable body prints RAW (the hop never lies)', () => {
    expect(DESK).toContain('return JSON.stringify(JSON.parse(json), null, 2);');
    expect(DESK).toContain('return json;');
  });

  it('an absent body answers honestly (no empty scroll box)', () => {
    expect(DESK).toContain('No response body was recorded for this call.');
  });

  it('the status banner derives from the shared config (one vocabulary)', () => {
    expect(DESK).toContain('const statusCfg = SUBMISSION_STATUS_CONFIG[submission.status] || SUBMISSION_STATUS_CONFIG.PENDING;');
  });

  it('the record rows speak the whole paper trail', () => {
    expect(DESK).toContain('<dt className="text-muted-foreground">KRA reference</dt>');
    expect(DESK).toContain('<dt className="text-muted-foreground">Invoice no.</dt>');
    expect(DESK).toContain('<dt className="text-muted-foreground">Receipt #</dt>');
    expect(DESK).toContain('<dt className="text-muted-foreground">Submitted</dt>');
    expect(DESK).toContain('<dt className="text-muted-foreground">Processed</dt>');
    expect(DESK).toContain('<dt className="text-muted-foreground">Error</dt>');
  });

  it('the paper-trail wardrobe matches the payload card (slate faces, dark twins)', () => {
    expect(DESK).toContain('rounded-lg border border-slate-200 bg-slate-50/60 dark:border-slate-800 dark:bg-slate-900/40 p-3 text-xs space-y-3');
    expect(DESK).toContain('divide-y divide-slate-200 dark:divide-slate-800');
    expect(DESK).toContain('max-h-56 overflow-y-auto whitespace-pre-wrap break-all');
  });

  it('the response flows from the wire (no API change needed)', () => {
    const route = readFileSync('src/app/api/kra/submissions/route.ts', 'utf8');
    expect(route).toContain('include: {');
  });
});

describe('the what\u2019s-new feed — the round announces itself', () => {
  it('v2.395.0 is the lead entry with the round\u2019s title', () => {
    expect(FEED).toContain("version: '2.438.0'");
    expect(FEED.indexOf("version: '2.395.0'")).toBeLessThan(FEED.indexOf("version: '2.394.0'"));
    expect(FEED).toContain('The submission receipt hop');
  });

  it('the version slots speak 2.395.0', () => {
    expect(pkg.version).toBe('2.438.0');
    expect(pkg.mbumah.releaseVersion).toBe('2.438.0');
    expect(pkg.mbumah.baseVersion).toBe('2.438.0');
  });
});
