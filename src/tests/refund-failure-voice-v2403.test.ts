// THE REFUND DESK SPEAKS THE FAILURE'S NAME (v2.403.0): the wire's typed
// refusal finally reaches the operator's eyes.
//
// The refund wire has ALWAYS answered typed failures — the route maps
// every RefundErrorCode to an honest HTTP status and the body carries
// `{ success: false, code, error }` (the code + a human-readable line).
// But the desk threw that voice away: the dialog's catch called
// handleError and dropped the returned message on the floor — no toast,
// no card, nothing but a console log. A refused refund looked like a
// frozen button. Worse, the helper's signature drifted: the
// sale-refund-audit and refund-status-repair suites' local `must` kept a
// required label against one-arg call sites (the stranded-heal suite's
// own widen precedent from v2.402.0 had missed its siblings), and the
// route's error-status ladder had no rung for NOT_STRANDED — the
// stranded-heal's refusal (409, per the api.ts doc row) could never
// climb it.
//
// This round: the voice lives in ONE home (src/lib/refund-voice.ts, the
// env-doctor precedent — the clock-less pure helper the desk imports),
// the submit catch speaks `CODE — line` on the toast and holds the same
// words on the dialog's own amber card, the load failure rides the same
// card under its mono badge, the four silent catches toast at last, the
// route's ladder gains NOT_STRANDED: 409, and the two must widens land
// (label = 'value', the stranded-heal precedent — the throw's words stay
// truthful, the labeled call sites keep their words).
//
// Pins: the voice's truth table (the real class, real codes, the honest
// nulls), the desk's five consumption lines, the two cards' testids and
// mono badges, the route's new rung, the two widen lines, and the
// negative guard — the `[h`-amputated `eal` names must NEVER return.

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { ApiRequestError } from '@/lib/error-handler';
import { refundFailureVoice } from '@/lib/refund-voice';

const LIB_PATH = 'src/lib/refund-voice.ts';
const lib = readFileSync(LIB_PATH, 'utf8');

const DESK_PATH = 'src/app/(shell)/tabs/transactions-tab.tsx';
const desk = readFileSync(DESK_PATH, 'utf8');

const ROUTE_PATH = 'src/app/api/transactions/[id]/refund/route.ts';
const route = readFileSync(ROUTE_PATH, 'utf8');

describe('the voice speaks the failure\'s name (v2.403.0)', () => {
  it('a typed refusal answers { code, line } — both words, one voice', () => {
    const err = new ApiRequestError('This sale can no longer be refunded.', 409, {
      code: 'NOT_REFUNDABLE',
    });
    expect(refundFailureVoice(err)).toEqual({
      code: 'NOT_REFUNDABLE',
      line: 'This sale can no longer be refunded.',
    });
  });

  it('every RefundErrorCode the wire speaks rides through unchanged', () => {
    const codes = [
      'NOT_FOUND',
      'TENANT_MISMATCH',
      'NOT_REFUNDABLE',
      'EMPTY_REFUND',
      'LINE_OVER_REFUND',
      'AMOUNT_OVER_REFUND',
      'NOT_STRANDED',
    ];
    for (const code of codes) {
      const err = new ApiRequestError(`The wire said no: ${code}.`, 400, { code });
      const voice = refundFailureVoice(err);
      expect(voice).not.toBeNull();
      expect(voice?.code).toBe(code);
      expect(voice?.line).toBe(`The wire said no: ${code}.`);
    }
  });

  it('the stranded-heal\'s refusal speaks NOT_STRANDED', () => {
    const err = new ApiRequestError(
      'This sale has no stranded gap to settle - its lines are not fully refunded, or nothing remains on the header.',
      409,
      { code: 'NOT_STRANDED' },
    );
    expect(refundFailureVoice(err)?.code).toBe('NOT_STRANDED');
    expect(refundFailureVoice(err)?.line).toContain('no stranded gap to settle');
  });

  it('the server line is trimmed but never invented', () => {
    const err = new ApiRequestError('  padded wire line  ', 400, { code: 'EMPTY_REFUND' });
    expect(refundFailureVoice(err)?.line).toBe('padded wire line');
  });

  it('an honest voice answers null when the wire spoke no name', () => {
    expect(refundFailureVoice(new ApiRequestError('no body', 500))).toBeNull();
    expect(refundFailureVoice(new ApiRequestError('body without code', 500, {}))).toBeNull();
    expect(refundFailureVoice(new ApiRequestError('empty code', 500, { code: '' }))).toBeNull();
    expect(refundFailureVoice(new ApiRequestError('non-string code', 500, { code: 409 }))).toBeNull();
    expect(refundFailureVoice(new ApiRequestError('   ', 400, { code: 'EMPTY_REFUND' }))).toBeNull();
  });

  it('anything that is not the wire\'s error keeps the caller\'s fallback (null)', () => {
    expect(refundFailureVoice(new Error('plain'))).toBeNull();
    expect(refundFailureVoice('a string')).toBeNull();
    expect(refundFailureVoice(undefined)).toBeNull();
    expect(refundFailureVoice(null)).toBeNull();
    expect(refundFailureVoice({ body: { code: 'NOT_REFUNDABLE' } })).toBeNull();
  });

  it('the voice lives in ONE home (the env-doctor precedent — pure, clock-less)', () => {
    expect(lib).toContain(
      'export function refundFailureVoice(err: unknown): { code: string; line: string } | null {',
    );
    expect(lib).toContain('if (!(err instanceof ApiRequestError)) return null;');
    expect(lib).toContain("if (typeof code !== 'string' || code === '' || !line) return null;");
  });
});

describe('the desk speaks it (v2.403.0) — the five consumption lines', () => {
  it('the submit catch toasts the code over the line and holds the card', () => {
    expect(desk).toContain("import { refundFailureVoice } from '@/lib/refund-voice';");
    expect(desk).toContain('const voice = refundFailureVoice(err);');
    expect(desk).toContain('setSubmitVoice(voice);');
    expect(desk).toContain('toast.error(voice ? `${voice.code} — ${voice.line}` : msg);');
    expect(desk).toContain('setSubmitVoice(null);');
  });

  it('the submit failure card carries the words after the toast fades', () => {
    expect(desk).toContain('data-testid="refund-submit-failure"');
    expect(desk).toContain('{submitVoice.line}');
    expect(desk).toContain('{submitVoice.code}');
    // the mono badge voice (the same law the load card speaks)
    expect(desk).toContain(
      'mt-1 font-mono text-[10px] uppercase tracking-wide text-amber-700/80 dark:text-amber-400/80',
    );
  });

  it('the load failure rides the same card under its mono badge', () => {
    expect(desk).toContain('const loadVoice = error ? refundFailureVoice(error) : null;');
    expect(desk).toContain('{loadVoice && (');
    expect(desk).toContain('data-testid="refund-load-code"');
    expect(desk).toContain(
      "'This sale can no longer be refunded — it may already be fully refunded or voided.'",
    );
  });

  it('the stranded-heal toast names its refusal too', () => {
    expect(desk).toContain(
      "// v2.403.0: the voice rides the same law — NOT_STRANDED answers 409",
    );
  });

  it('the four silent catches toast at last (the wire\'s words reach the operator)', () => {
    expect(desk).toContain(
      "toast.error(handleError(err, 'Failed to load the refund receipt. Please try again.'));",
    );
    expect(desk).toContain(
      "toast.error(handleError(err, 'Failed to repair the status. Please try again.'));",
    );
  });
});

describe('the ladder and the widens (v2.403.0)', () => {
  it('the route\'s error-status ladder gains the stranded-heal rung (409, per the api.ts doc row)', () => {
    expect(route).toContain('  NOT_STRANDED: 409,');
    expect(route).toContain('Record<RefundErrorCode, number>');
  });

  it('the sale-refund-audit must widen lands (the stranded-heal precedent)', () => {
    const suite = readFileSync('src/tests/lib/sale-refund-audit.test.ts', 'utf8');
    expect(suite).toContain(
      "function must<T>(value: T | null | undefined, label = 'value'): T {",
    );
    expect(suite).toContain('throw new Error(`test fixture missing: ${label}`);');
  });

  it('the refund-status-repair must widen lands (the same signature)', () => {
    const suite = readFileSync('src/tests/refund-status-repair-v2374.test.ts', 'utf8');
    expect(suite).toContain(
      "function must<T>(value: T | null | undefined, label = 'value'): T {",
    );
  });
});

describe('the negative guard (v2.403.0)', () => {
  it('the [h-amputated eal names never return (the three pool faces stand down for good)', () => {
    expect(desk).not.toContain('const ealTransaction');
    expect(desk).not.toContain('const ealBusy');
    expect(desk).not.toContain('}, ealTransaction, commitSettle]);');
    // and the heal wiring is whole
    expect(desk).toContain(
      'const [healTransaction, setHealTransaction] = useState<TransactionItem | null>(null);',
    );
    expect(desk).toContain('const [healBusy, setHealBusy] = useState(false);');
    expect(desk).toContain('}, [healTransaction, commitSettle]);');
  });
});
