// THE SUPPORT FILE SUITE (v2.401.0) — the health desk's report leaves as a
// NAMED text file.
//
//   - diagnosticsFileName: the pure twin of formatEnvDiagnostics — the
//     version, the date and the minute ride in the name, zero-padded, so
//     two downloads never argue about which is which.
//   - the Download button: the copy face's sibling — Download → a two-second
//     Saved hand-back → Download again; the icon swaps with the label, the
//     emerald family marks the success state (same FILE as the Copy button,
//     so the elder census's file-level count holds), a refused save answers
//     with an honest toast, and the Blob's object URL revokes itself.
//   - the panel's rows wear mono details on a zebra ground.
//   - the eTIMS contract repair: validateKraPinDetailed answers the verdict,
//     the normalized PIN and the failure's name; the sandbox client speaks
//     the THREE full response contracts its routes always promised; ONE home
//     (buildLocalStockMaster) serves both the stub and the route's fallback.
//
// Every pin reads the SOURCE OF RECORD (source bytes, not memory) — the
// house rule since the verify scripts were born.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it, expect } from 'vitest';

import { diagnosticsFileName } from '@/lib/env-doctor';
import { validateKraPin, validateKraPinDetailed } from '@/lib/etims-utils';

const read = (p: string) => readFileSync(join(process.cwd(), p), 'utf8');

const TAB = 'src/app/(shell)/tabs/system-health-tab.tsx';
const tabSrc = read(TAB);
const serviceSrc = read('src/lib/etims-service.ts');
const utilsSrc = read('src/lib/etims-utils.ts');
const searchRoute = read('src/app/api/etims/customer-search/route.ts');
const stockRoute = read('src/app/api/etims/stock-report/route.ts');

describe('diagnosticsFileName (v2.401.0) — the file speaks the version, the date, the minute', () => {
  it('names the file mbumah-health-<version>-<YYYYMMDD>-<HHmm>.txt', () => {
    expect(diagnosticsFileName('2.401.0', new Date(2026, 10, 5, 17, 42))).toBe(
      'mbumah-health-2.401.0-20261105-1742.txt',
    );
  });

  it('zero-pads the month, the day and the minute', () => {
    expect(diagnosticsFileName('2.401.0', new Date(2026, 0, 9, 3, 7))).toBe(
      'mbumah-health-2.401.0-20260109-0307.txt',
    );
  });

  it('interpolates the version verbatim (the name travels with the release)', () => {
    expect(diagnosticsFileName('9.99.999', new Date(2026, 11, 31, 23, 59))).toBe(
      'mbumah-health-9.99.999-20261231-2359.txt',
    );
  });
});

describe('the Download button (v2.401.0) — the support file leaves the desk', () => {
  it('the button exists, testid-ed, beside the Copy button in the panel header', () => {
    expect(tabSrc).toContain('data-testid="health-env-download"');
    expect(tabSrc).toContain('{envReport ? <DownloadDiagnosticsButton report={envReport} /> : null}');
    expect(tabSrc).toContain('{envReport ? <CopyDiagnosticsButton report={envReport} /> : null}');
  });

  it('the download path: the report text, a Blob, a self-revoking object URL', () => {
    expect(tabSrc).toContain('const text = formatEnvDiagnostics(report);');
    expect(tabSrc).toContain('const name = diagnosticsFileName(APP_VERSION, new Date());');
    expect(tabSrc).toContain("new Blob([text], { type: 'text/plain;charset=utf-8' })");
    expect(tabSrc).toContain('URL.createObjectURL(blob)');
    expect(tabSrc).toContain('URL.revokeObjectURL(url)');
    expect(tabSrc).toContain('a.download = name;');
  });

  it('the saved face: Download → a two-second Saved hand-back → Download', () => {
    expect(tabSrc).toContain('window.setTimeout(() => setSaved(false), 2000);');
    expect(tabSrc).toContain("{saved ? 'Saved' : 'Download'}");
    expect(tabSrc).toContain('? <Check className="h-3 w-3" aria-hidden="true" />');
    expect(tabSrc).toContain(': <Download className="h-3 w-3" aria-hidden="true" />}');
  });

  it('the aria-label speaks both states; a refusal answers with an honest toast', () => {
    expect(tabSrc).toContain("'Diagnostics file saved.'");
    expect(tabSrc).toContain("'Download the environment and connection diagnostics as a text file'");
    expect(tabSrc).toContain("toast.error('Could not save the diagnostics file — the browser refused.')");
  });

  it('the saved state wears the emerald family (the census\u2019s file-level count holds — same file as Copy)', () => {
    expect(tabSrc).toContain('border-emerald-200 bg-emerald-50 text-emerald-700');
  });

  it('the detail line wears mono and the rows alternate on the zebra ground', () => {
    expect(tabSrc).toContain('min-w-0 truncate font-mono text-[11px] text-muted-foreground');
    expect(tabSrc).toContain('odd:bg-muted/30');
  });
});

describe('the eTIMS contract repair (v2.401.0) — the sandbox speaks the promised contracts', () => {
  it('validateKraPinDetailed answers the verdict, the normalized PIN and the failure\u2019s name', () => {
    expect(validateKraPinDetailed('a001234567b')).toEqual({
      valid: true,
      normalized: 'A001234567B',
      error: null,
    });
    expect(validateKraPinDetailed('  A001234567B  ').valid).toBe(true);
    expect(validateKraPinDetailed('12345')).toEqual({
      valid: false,
      normalized: null,
      error: 'Invalid KRA PIN format (expected A001234567B).',
    });
    expect(validateKraPinDetailed('')).toEqual({
      valid: false,
      normalized: null,
      error: 'A KRA PIN is required.',
    });
    expect(validateKraPin('A001234567B')).toBe(true);
    expect(validateKraPin('nope')).toBe(false);
  });

  it('the boolean helper keeps its contract by delegating to the detailed check', () => {
    expect(utilsSrc).toContain(
      'export function validateKraPin(pin: string): boolean {\n  return validateKraPinDetailed(pin).valid;\n}',
    );
  });

  it('the sandbox client speaks the three full response contracts', () => {
    expect(serviceSrc).toContain(
      'async getInvoiceStatus(invoiceNumber: string): Promise<EtimsInvoiceStatusResponse> {',
    );
    expect(serviceSrc).toContain(
      'async customerSearch(tin: string): Promise<EtimsCustomerSearchResponse> {',
    );
    expect(serviceSrc).toContain(
      'async stockMasterReport(storeId: string, startDate: Date, endDate: Date): Promise<EtimsStockMasterResponse> {',
    );
  });

  it('the sandbox\u2019s honesty: the measured latency, no fabricated cuPin', () => {
    const statusMethod = serviceSrc.split('async getInvoiceStatus')[1]?.split('async customerSearch')[0] ?? '';
    expect(statusMethod).toContain('latencyMs: Math.max(0, Date.now() - startedAt)');
    expect(statusMethod).not.toContain('cuPin');
  });

  it('the customer-search route reads the detailed check (the failure\u2019s name, not a bare false)', () => {
    expect(searchRoute).toContain('const pinCheck = validateKraPinDetailed(tinRaw);');
    expect(searchRoute).toContain("{ success: false, error: pinCheck.error || 'Invalid KRA PIN.' },");
  });

  it('one home for the stock-master math: the route\u2019s fallback and the stub share buildLocalStockMaster', () => {
    expect(serviceSrc).toContain('export async function buildLocalStockMaster(');
    expect(stockRoute).toContain(
      "import { initializeEtimsClientFromStore, buildLocalStockMaster } from '@/lib/etims-service';",
    );
    expect(stockRoute).toContain('result = await buildLocalStockMaster(storeId, startDate, endDate);');
    expect(stockRoute).not.toContain("m.movementType === 'SALE'");
  });
});
