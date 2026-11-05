// THE DRY RUN SPEAKS ITS PAYLOAD (v2.385.0): the e-TIMS submit dialog's
// paper trail — and the row that ends the blind typing.
//
// The KRA submit flow was built whole (dry-run preview + live submit +
// status polling + the submission-history panel), but its driest voice
// never reached the screen: the /api/kra/submit route's dry-run
// short-circuit has ALWAYS returned the mapped KraInvoicePayload — and
// the dialog toasted "Dry-run complete" and CLOSED out from under it.
// The preview existed on the wire and died unread, every time. The same
// round ends the blind typing: the submit dialog used to demand a
// transaction ID typed from a second screen; now every PENDING row on
// the invoices ledger carries its own Submit affordance (canSubmit-gated,
// the schema-honest status gate) that opens the dialog with the ID
// pre-filled.
//
// THE DIALOG'S TWO DOORS (the state machine, pinned):
//   - a dry-run keeps the dialog OPEN and speaks the payload (the point);
//   - a live submit closes it and clears the payload + the input;
//   - every opener (the toolbar's Submit Invoice, the row's Send) starts
//     from a clean dialog: empty input, no stale payload.
//
// THE MONEY-FACE COERCION (the v2.382 law, carried): the payload's money
// fields cross the boundary through payloadMoney — formatKES(Number(v)) —
// so the mapper's numbers AND any stringified decimal both speak.
//
// THE PALETTE HONESTY (the styling detail): the preview card speaks the
// desk's own slate/blue voices (blue for the VAT figure — the hue the
// desk's Submitted badge already speaks; emerald only as the copied
// check's feedback). It introduces NO new deep-link family byte: no
// 300-storey pair may appear on a desk that hosts the twenty-second
// word's red chip.
//
// Pins: the wire's additive widening (payload?: KraInvoicePayload — the
// import type, the old keys untouched), the dialog's two doors (the
// dry-run branch's stay-open + the live branch's clear-and-close), both
// openers' clean-start trio, the row affordance's gate (canSubmit &&
// PENDING), the prefill (inv.transactionId), the preview's bytes
// (data-testid, aria-live, the no-KRA-call phrase, tabular-nums, the
// copy voice's two states), the money-face coercion helper, the palette
// honesty bounds — and the position law (the preview sits between the
// input block and the footer).

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';

const LOOM = readFileSync('src/components/landing-chip.tsx', 'utf8');

const API = readFileSync('src/lib/api.ts', 'utf8');
const DESK = readFileSync('src/app/(shell)/tabs/etims-tab.tsx', 'utf8');
const FEED = readFileSync('src/lib/whats-new.ts', 'utf8');

// ---------------------------------------------------------------------------

describe('the wire — the payload joins the response type additively', () => {
  it('submitInvoice carries payload?: KraInvoicePayload', () => {
    expect(API).toContain('payload?: KraInvoicePayload');
  });

  it('the shape rides the client type home (the one truth)', () => {
    expect(API).toContain("KraInvoicePayload,\n} from './types';");
  });

  it('the mapper home re-exports the moved truth (the old paths keep speaking)', () => {
    const helpers = readFileSync('src/lib/kra-helpers.ts', 'utf8');
    expect(helpers).toContain("export type { KraInvoiceLineItem, KraInvoicePayload } from './types';");
  });

  it('the old keys stay untouched (additive, never a rewrite)', () => {
    expect(API).toContain('invoiceForKra: InvoiceForKraItem;');
    expect(API).toContain('result?: unknown;');
    expect(API).toContain('dryRun?: boolean;');
  });

  it("the widening is the submit route's OWN short-circuit shape", () => {
    const route = readFileSync('src/app/api/kra/submit/route.ts', 'utf8');
    expect(route).toContain('payload: mapped.payload');
    expect(route).toContain('dryRun: true');
  });
});

describe('the dialog — the two doors', () => {
  it('a dry-run STAYS OPEN and speaks the payload (the fix)', () => {
    expect(DESK).toContain('if (res.payload) setDryRunPayload(res.payload);');
    expect(DESK).toContain("toast.success('Dry-run complete. Payload mapped - no KRA call was made.');");
  });

  it('the envelope read narrows through data.data (the desk\u2019s own two TS2339s retire)', () => {
    expect(DESK).toContain('const res = data.data;');
    expect(DESK).toContain('if (res?.dryRun) {');
    expect(DESK).toContain("toast.success(data.message || 'Invoice submitted to KRA.');");
  });

  it('the dry-run branch never closes the dialog', () => {
    // the branch's bytes: the payload line sits inside the dry-run arm,
    // and the close trio lives ONLY in the live arm.
    const dryArm = DESK.slice(DESK.indexOf('if (res?.dryRun) {'), DESK.indexOf('} else {'));
    expect(dryArm).not.toContain('setShowSubmitDialog(false)');
    const liveArm = DESK.slice(DESK.indexOf('} else {'), DESK.indexOf("queryClient.invalidateQueries({ queryKey: ['kra-invoices'"));
    expect(liveArm).toContain('setDryRunPayload(null);');
    expect(liveArm).toContain('setShowSubmitDialog(false);');
    expect(liveArm).toContain("setSubmitTransactionId('');");
  });

  it('a live submit clears the payload, the dialog and the input', () => {
    expect(DESK).toContain('setDryRunPayload(null);\n        setShowSubmitDialog(false);\n        setSubmitTransactionId(\'\');');
  });

  it('both openers start from a clean dialog (empty input, no stale payload)', () => {
    const trio = (DESK.match(/setDryRunPayload\(null\);\s*\n\s*setShowSubmitDialog\(true\);/g) || []).length;
    expect(trio).toBe(2); // the toolbar opener + the row opener
    expect(DESK).toContain("setSubmitTransactionId('');\n                    setDryRunPayload(null);\n                    setShowSubmitDialog(true);");
  });
});

describe('the row — the blind typing ends', () => {
  it('every PENDING row offers the submit affordance, canSubmit-gated', () => {
    expect(DESK).toContain("{canSubmit && inv.submissionStatus === 'PENDING' && (");
  });

  it('the affordance pre-fills the transaction id from the row', () => {
    expect(DESK).toContain('setSubmitTransactionId(inv.transactionId);');
  });

  it('the affordance speaks its own accessible name (sr-only + aria-label)', () => {
    expect(DESK).toContain('<span className="sr-only">Submit to KRA</span>');
    expect(DESK).toContain('aria-label={`Submit ${inv.kraInvoiceNumber} to KRA`}');
    expect(DESK).toContain('title="Submit to KRA"');
  });

  it('the affordance rides the row\u2019s stop-propagation cell (no detail-dialog hijack)', () => {
    const cell = DESK.slice(
      DESK.indexOf('onClick={(e) => e.stopPropagation()}'),
      DESK.indexOf('onClick={(e) => e.stopPropagation()}') + 2200,
    );
    expect(cell).toContain('Submit to KRA');
  });

  it('the Send icon is the affordance\u2019s face (h-3 w-3, the row\u2019s own scale)', () => {
    expect(DESK).toContain('<Send className="h-3 w-3" />');
  });
});

describe('the preview — the paper trail on screen', () => {
  it('the card mounts only when a payload landed', () => {
    expect(DESK).toContain('{dryRunPayload && (');
  });

  it('the card carries its test id and a polite live region', () => {
    expect(DESK).toContain('data-testid="kra-dryrun-payload"');
    expect(DESK).toContain('aria-live="polite"');
  });

  it('the header names the dry-run contract in the desk\u2019s own words', () => {
    expect(DESK).toContain('Mapped payload — no KRA call was made');
  });

  it('the money faces ride the boundary coercion (the money-face law)', () => {
    expect(DESK).toContain('const payloadMoney = (v: number | string) => formatKES(Number(v));');
    expect(DESK).toContain('{payloadMoney(dryRunPayload.subtotal)}');
    expect(DESK).toContain('{payloadMoney(dryRunPayload.totalVat)}');
    expect(DESK).toContain('{payloadMoney(dryRunPayload.totalAmount)}');
  });

  it('the VAT figure speaks blue — a hue the desk\u2019s badges already speak', () => {
    expect(DESK).toContain('text-blue-600 dark:text-blue-400');
  });

  it('the tabular-nums law holds on every figure row', () => {
    expect((DESK.match(/tabular-nums/g) || []).length).toBeGreaterThanOrEqual(6);
  });

  it('the copy voice has both states (Copy and Copied) with a check face', () => {
    expect(DESK).toContain('aria-label="Copy mapped payload as JSON"');
    expect(DESK).toContain("{payloadCopied ? 'Copied' : 'Copy'}");
    expect(DESK).toContain("await navigator.clipboard.writeText(JSON.stringify(dryRunPayload, null, 2));");
    expect(DESK).toContain('setTimeout(() => setPayloadCopied(false), 2000);');
  });

  it('the position law: the preview sits between the input block and the footer', () => {
    const atInput = DESK.indexOf('The transaction must belong to this store');
    const atPreview = DESK.indexOf('data-testid="kra-dryrun-payload"');
    const atFooter = DESK.indexOf('<DialogFooter className="gap-2">');
    expect(atInput).toBeGreaterThan(-1);
    expect(atPreview).toBeGreaterThan(atInput);
    expect(atFooter).toBeGreaterThan(atPreview);
  });

  it('the closing line offers both doors again (the dialog\u2019s own voice)', () => {
    expect(DESK).toContain('Press Submit to send this payload to KRA, or Dry Run again after edits.');
  });
});

describe('the palette honesty — no new family byte', () => {
  it('the preview introduces NO deep-link storey pair on this desk', () => {
    expect(DESK).not.toContain('border-lime-300 bg-lime-100');
    expect(DESK).not.toContain('border-orange-300 bg-orange-100');
    expect(DESK).not.toContain('border-teal-300 bg-teal-100');
  });

  it('the desk still hosts its own twenty-second word\u2019s red chip (now through the loom)', () => {
    // v2.397.0 THE ELDER LOOM: the red chip renders through the shared
    // LandingChip — the desk proves its family by hue, the registry
    // carries the wardrobe
    expect(DESK).toContain('hue="red"');
    expect(LOOM).toContain('border-red-200 bg-red-50');
  });
});

describe('the what\u2019s-new feed — the round announces itself', () => {
  it('v2.385.0 is the lead entry with the round\u2019s title', () => {
    expect(FEED).toContain("version: '2.385.0'");
    expect(FEED.indexOf("version: '2.385.0'")).toBeLessThan(FEED.indexOf("version: '2.384.0'"));
    expect(FEED).toContain('The dry run speaks its payload');
  });
});
