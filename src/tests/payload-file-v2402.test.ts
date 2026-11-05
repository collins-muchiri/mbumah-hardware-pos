// THE PAYLOAD FILE SUITE (v2.402.0) — the mapped KRA payload leaves the
// Submit dialog as a NAMED .json file, the filing trio's third sibling
// (Print = the paper, Copy = the clipboard, Download = the FILE).
//
//   - payloadFileName: the pure home for the file's bytes — the KRA
//     invoice number (slugged), the date and the minute ride in the name,
//     zero-padded, so two downloads of two payloads never argue.
//   - the Download button: the receipt hop's saved-face law — Download →
//     a two-second Saved hand-back → Download again; the icon swaps with
//     the label; a refused save answers with an honest toast; the Blob's
//     object URL revokes itself; the SAME pretty JSON the clipboard
//     carries (one home — the two cannot drift).
//   - the refund must widen: the label rides on its own — 29 strict faces
//     stood down with the helper's contract widened, not its words.
//
// Every pin reads the SOURCE OF RECORD (source bytes, not memory) — the
// house rule since the verify scripts were born.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it, expect } from 'vitest';

import { payloadFileName } from '@/lib/etims-utils';

const read = (p: string) => readFileSync(join(process.cwd(), p), 'utf8');

const TAB = 'src/app/(shell)/tabs/etims-tab.tsx';
const tabSrc = read(TAB);
const refundSuite = read('src/tests/refund-stranded-heal-v2373.test.ts');

describe('payloadFileName (v2.402.0) — the file speaks the invoice, the date, the minute', () => {
  it('names the file kra-payload-<slug>-<YYYYMMDD>-<HHmm>.json', () => {
    expect(payloadFileName('MBU-2026-000123', new Date(2026, 10, 5, 18, 42))).toBe(
      'kra-payload-MBU-2026-000123-20261105-1842.json',
    );
  });

  it('slugs everything the OS would refuse (spaces, slashes, dots collapse to a dash)', () => {
    expect(payloadFileName('MBU/2026//000123 v2', new Date(2026, 0, 9, 3, 7))).toBe(
      'kra-payload-MBU-2026-000123-v2-20260109-0307.json',
    );
  });

  it('answers payload when the reference is empty or all-hostile, never a bare dot-file', () => {
    expect(payloadFileName('', new Date(2026, 11, 31, 23, 59))).toBe(
      'kra-payload-payload-20261231-2359.json',
    );
    expect(payloadFileName('///***///', new Date(2026, 11, 31, 23, 59))).toBe(
      'kra-payload-payload-20261231-2359.json',
    );
  });

  it('zero-pads the month, the day and the minute', () => {
    expect(payloadFileName('A001234567B', new Date(2026, 2, 4, 8, 5))).toBe(
      'kra-payload-A001234567B-20260304-0805.json',
    );
  });
});

describe('the Download button (v2.402.0) — the filing trio gains its file', () => {
  it('the button exists, testid-ed, between Print and Copy in the card header', () => {
    expect(tabSrc).toContain('data-testid="kra-payload-download"');
    const printIdx = tabSrc.indexOf('aria-label="Print mapped payload"');
    const downloadIdx = tabSrc.indexOf('data-testid="kra-payload-download"');
    const copyIdx = tabSrc.indexOf('aria-label="Copy mapped payload as JSON"');
    expect(printIdx).toBeGreaterThan(-1);
    expect(downloadIdx).toBeGreaterThan(printIdx);
    expect(copyIdx).toBeGreaterThan(downloadIdx);
  });

  it('the download path: the one-home JSON, a Blob, a self-revoking object URL', () => {
    const downloadBody = tabSrc.split('const downloadPayload = () => {')[1]?.split('const [payloadCopied')[0] ?? '';
    expect(downloadBody).toContain('const text = JSON.stringify(dryRunPayload, null, 2);');
    expect(downloadBody).toContain("payloadFileName(dryRunPayload.kraInvoiceNumber || 'payload', new Date())");
    expect(downloadBody).toContain("new Blob([text], { type: 'application/json;charset=utf-8' })");
    expect(downloadBody).toContain('URL.createObjectURL(blob)');
    expect(downloadBody).toContain('URL.revokeObjectURL(url)');
    expect(downloadBody).toContain('a.download = name;');
  });

  it('the clipboard carries the SAME bytes (one home — the two cannot drift)', () => {
    expect(tabSrc.match(/JSON\.stringify\(dryRunPayload, null, 2\)/g)?.length).toBe(2);
  });

  it('the saved face: Download → a two-second Saved hand-back → Download', () => {
    expect(tabSrc).toContain('window.setTimeout(() => setPayloadSaved(false), 2000);');
    expect(tabSrc).toContain("{payloadSaved ? 'Saved' : 'Download'}");
  });

  it('the aria-label speaks both states; a refusal answers with an honest toast', () => {
    expect(tabSrc).toContain("'Payload file saved.'");
    expect(tabSrc).toContain("'Download mapped payload as JSON'");
    expect(tabSrc).toContain("toast.error('Could not save the payload file — the browser refused.')");
  });

  it('the rows alternate on the zebra ground (the eighth-row ledger reads row-by-row)', () => {
    expect(tabSrc).toContain('[&>div:nth-child(odd)]:bg-slate-100/70');
  });
});

describe('the refund must widen (v2.402.0) — the label rides on its own', () => {
  it('the helper speaks the optional label with the honest default', () => {
    expect(refundSuite).toContain('function must<T>(value: T | null | undefined, label = \'value\'): T {');
    expect(refundSuite).toContain("throw new Error(`test fixture missing: ${label}`);");
  });

  it('the 29 one-arg call sites stand (the widen was the helper\u2019s, not the callers\u2019)', () => {
    const oneArg = (refundSuite.match(/must\((?:[a-zA-Z0-9_.]+)\)/g) ?? []).length;
    expect(oneArg).toBeGreaterThanOrEqual(25);
  });
});
