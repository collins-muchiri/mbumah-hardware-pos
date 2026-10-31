// MBUMAH HARDWARE POS - the issue rows find their voice (v2.301.0)
//
// BOTH NETS, per the runtime-pin law:
//   • the VALUE net pins the second caller's truth: `payrollGuardrailIssueVoice`
//     looks the voice up BY THE ISSUE'S CODE FIELD (the prepare gate's issues
//     carry plain sentences, engine issues carry `CODE: detail` — one law
//     covers both), keeps the engine's own words verbatim in parentheses,
//     never says a code prefix twice, and passes unknown codes through
//     UNTOUCHED (the voice never guesses).
//   • the BYTE net pins the wiring: BOTH issue mouths (the run dialog's
//     "Blocked employees" panel AND the /hr/payroll gate card) render the
//     SHARED PayrollIssueRow (never a copied row), the raw `{issue.message}`
//     span is GONE from both, the face map covers every guardrail code with
//     a severity family, and the ping law holds: every decorative
//     `animate-ping` span carries `pointer-events-none` so the FAB's 2×
//     keyframe can never again steal the payroll door's clicks.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it, expect } from 'vitest';
import { payrollGuardrailVoice, payrollGuardrailIssueVoice } from '@/lib/hr/payroll/error-voice';
import { GUARDRAIL_CODES } from '@/lib/hr/payroll/types';
import { fabYieldDecision, fabProbePoints } from '@/components/floating-home-button';

const ROOT = process.cwd();
const VOICE_LIB = 'src/lib/hr/payroll/error-voice.ts';
const DIALOG = 'src/components/hr/payroll-run-dialog.tsx';
const HR_PAGE = 'src/app/(shell)/hr/payroll/page.tsx';
const ROW = 'src/components/hr/payroll-issue-row.tsx';

/** Every file carrying a decorative ping span (the v2.301.0 audit). */
const PING_FILES = [
  'src/components/floating-home-button.tsx',
  'src/components/offline-indicator.tsx',
  'src/components/layout/offline-indicator.tsx',
  'src/components/hr/payroll-run-dialog.tsx',
  'src/components/pos/checkout-dialog.tsx',
  'src/app/(shell)/tabs/rentals-tab.tsx',
  'src/app/(shell)/tabs/system-health-tab.tsx',
  'src/app/(shell)/tabs/payroll-tab.tsx',
  'src/app/(selfservice)/employees/me/leave/leave-view.tsx',
] as const;

const read = (p: string) => readFileSync(join(ROOT, p), 'utf8');

describe('payrollGuardrailIssueVoice — the value net', () => {
  it('the gate\u2019s plain-sentence MISSING_CONSENT issue speaks the human voice', () => {
    // EXACTLY the shape run-service.ts pushes (line ~376): code in its own
    // field, a plain sentence in message. v2.300.0 said this raw; now the
    // voice speaks and the engine's own words ride along verbatim.
    const out = payrollGuardrailIssueVoice(
      'MISSING_CONSENT',
      'No active data-processing consent on file; payroll blocked.'
    );
    expect(out).toContain('has not consented to automated payroll processing');
    expect(out).toContain('Record the employee\u2019s consent, then prepare again');
    expect(out).toContain('(No active data-processing consent on file; payroll blocked.)');
  });

  it('the engine\u2019s CODE: detail shape matches the toast voice byte for byte', () => {
    // The two callers must never disagree about one guardrail fire.
    const raw = 'RATE_TABLE_MISSING: No active PAYE rate table for 2026-10-31.';
    expect(payrollGuardrailIssueVoice('RATE_TABLE_MISSING', raw)).toBe(
      payrollGuardrailVoice(raw)
    );
  });

  it('a CODE: detail prefix is never said twice', () => {
    const out = payrollGuardrailIssueVoice(
      'TIMESHEET_NOT_APPROVED',
      'TIMESHEET_NOT_APPROVED: Attendance for this period has unapproved timesheet days.'
    );
    expect(out).not.toContain('TIMESHEET_NOT_APPROVED');
    expect(out).toContain('not approved yet');
    expect(out).toContain('(Attendance for this period has unapproved timesheet days.)');
  });

  it('an unknown code passes its message through UNTOUCHED (the voice never guesses)', () => {
    const msg = 'SOME_FUTURE_CODE: words the voice has never met.';
    expect(payrollGuardrailIssueVoice('SOME_FUTURE_CODE', msg)).toBe(msg);
  });

  it('an empty message speaks the voice alone (no empty parens)', () => {
    const out = payrollGuardrailIssueVoice('IMMUTABLE_STATUS', '');
    expect(out).toContain('does not allow that action');
    expect(out).not.toContain('()');
  });

  it('a message identical to the voice is not parenthesised into itself', () => {
    const out = payrollGuardrailIssueVoice('IMMUTABLE_STATUS', 'IMMUTABLE_STATUS: The run\u2019s current status does not allow that action. Open the run and follow its lifecycle - each step unlocks the next.');
    expect(out).not.toContain('(The run\u2019s current status');
  });

  it('every guardrail code round-trips: known in, human sentence out', () => {
    for (const code of GUARDRAIL_CODES) {
      const out = payrollGuardrailIssueVoice(code, 'engine detail here');
      expect(out).toContain('(engine detail here)');
      expect(out).not.toContain(`${code}:`);
    }
  });
});

describe('PayrollIssueRow — the shared face', () => {
  it('BOTH issue mouths render the shared row (never a copied row)', () => {
    expect(read(DIALOG)).toContain("import { PayrollIssueRow } from '@/components/hr/payroll-issue-row';");
    expect(read(HR_PAGE)).toContain("import { PayrollIssueRow } from '@/components/hr/payroll-issue-row';");
    expect(read(DIALOG)).toContain('<PayrollIssueRow key={`${issue.code}-${i}`} issue={issue} />');
    expect(read(HR_PAGE)).toContain('<PayrollIssueRow key={`${issue.code}-${i}`} issue={issue} />');
  });

  it('the raw issue.message span is GONE from both mouths', () => {
    // v2.300.0's residue: the per-employee face said the engine's raw words.
    for (const file of [DIALOG, HR_PAGE]) {
      expect(read(file)).not.toContain('{issue.message}');
    }
  });

  it('the face map covers every guardrail code (total, like the voice)', () => {
    const row = read(ROW);
    for (const code of GUARDRAIL_CODES) {
      expect(row).toContain(`${code}:`);
    }
  });

  it('the row keeps the machine code badge AND speaks the voice (both audiences)', () => {
    const row = read(ROW);
    expect(row).toContain('payrollGuardrailIssueVoice(issue.code, issue.message)');
    expect(row).toContain('{issue.code}');
    expect(row).toContain('data-testid="payroll-issue-row"');
    expect(row).toContain('data-severity={face.severity}');
  });

  it('the component never imports from a page module (no import cycle)', () => {
    expect(read(ROW)).not.toContain('hr/payroll/page');
  });

  it('the lib stays PURE: no react, no prisma, no network (spec rule)', () => {
    const lib = read(VOICE_LIB);
    expect(lib).not.toMatch(/from 'react'/);
    expect(lib).not.toMatch(/@prisma\/client/);
    expect(lib).not.toMatch(/fetch\(/);
  });
});

describe('the ping law — decorative animation never intercepts pointers', () => {
  it('every decorative animate-ping span carries pointer-events-none', () => {
    for (const file of PING_FILES) {
      const src = read(file);
      expect(src).toContain('animate-ping');
      // EVERY ping span line in the file must carry the law — not just one.
      const pingLines = src.split('\n').filter((l) => l.includes('animate-ping'));
      expect(pingLines.length).toBeGreaterThan(0);
      for (const line of pingLines) {
        expect(line, `${file}: ping line without pointer-events-none → ${line.trim()}`).toContain(
          'pointer-events-none'
        );
      }
    }
  });

  it('the FAB\u2019s pulse ring names the bug it fixed (the comment keeps the history)', () => {
    const fab = read('src/components/floating-home-button.tsx');
    expect(fab).toContain('stealing clicks');
    expect(fab).toContain('aria-hidden');
  });
});

describe('the yield law — the FAB never stands on another control\u2019s click', () => {
  // THE QA FIND, generalized: at a 1280×577 viewport the FAB sat
  // PERSISTENTLY on the payroll run door — a click on "Manage" actuated
  // the FAB and navigated to the Dashboard instead. elementsFromPoint
  // returned [svg path, svg, FAB button, ...door button, ...]; the decision
  // must yield whenever any foreign interactive element is in that stack.
  const fab = {
    tagName: 'BUTTON',
    getAttribute: () => null,
    contains: () => false,
  } as unknown as Element;

  function el(tag: string, role?: string): Element {
    return {
      tagName: tag,
      getAttribute: (a: string) => (a === 'role' && role ? role : null),
      contains: () => false,
    } as unknown as Element;
  }

  it('a door button stacked beneath the FAB demands the yield', () => {
    const hits = [el('path'), el('svg'), fab, el('BUTTON')];
    expect(fabYieldDecision(hits, fab)).toBe(true);
  });

  it('the FAB\u2019s own children and ancestors never count against it', () => {
    const child = { tagName: 'svg', getAttribute: () => null, contains: (x: Element) => x === fab } as unknown as Element;
    const ancestor = { tagName: 'DIV', getAttribute: () => null, contains: () => true } as unknown as Element;
    expect(fabYieldDecision([child, ancestor, fab], fab)).toBe(false);
  });

  it('plain content under the FAB (text containers) does not yield it', () => {
    const hits = [el('path'), el('svg'), fab, el('P'), el('DIV'), el('SPAN')];
    expect(fabYieldDecision(hits, fab)).toBe(false);
  });

  it('an interactive ROLE beneath the FAB demands the yield (tab, menuitem)', () => {
    expect(fabYieldDecision([fab, el('DIV', 'tab')], fab)).toBe(true);
    expect(fabYieldDecision([fab, el('SPAN', 'menuitem')], fab)).toBe(true);
    expect(fabYieldDecision([fab, el('DIV', 'dialog')], fab)).toBe(false);
  });

  it('every interactive tag class yields: link, input, select, textarea, label, summary', () => {
    for (const tag of ['A', 'INPUT', 'SELECT', 'TEXTAREA', 'LABEL', 'SUMMARY']) {
      expect(fabYieldDecision([fab, el(tag)], fab)).toBe(true);
    }
  });

  it('the probe samples the center plus an inset cross (corners never probe empty air)', () => {
    const r = { left: 1200, top: 497, right: 1256, bottom: 553, width: 56, height: 56 };
    const pts = fabProbePoints(r);
    expect(pts).toHaveLength(5);
    expect(pts[0]).toEqual([1228, 525]);
    expect(pts[1]).toEqual([1206, 503]);
    expect(pts[4]).toEqual([1250, 547]);
  });

  it('a zero-size FAB probes nothing (never yields on a hidden button)', () => {
    expect(fabProbePoints({ left: 0, top: 0, right: 0, bottom: 0, width: 0, height: 0 })).toEqual([]);
  });

  it('the wiring: the FAB watches scroll (captured), resize and mutations, and yields its pointer events', () => {
    const fabSrc = read('src/components/floating-home-button.tsx');
    expect(fabSrc).toContain('export function fabYieldDecision');
    expect(fabSrc).toContain('export function fabProbePoints');
    expect(fabSrc).toContain("window.addEventListener('scroll', scheduled, { passive: true, capture: true })");
    expect(fabSrc).toContain("window.addEventListener('resize', scheduled, { passive: true })");
    expect(fabSrc).toContain('new MutationObserver(onMutate)');
    // the trailing law: a mutation inside the throttle window arms a
    // TRAILING probe — the FINAL layout is always measured (the QA walk
    // caught the abandon bug: the door sat uncovered-by-decision forever)
    expect(fabSrc).toContain('TRAILING probe');
    expect(fabSrc).toContain('trailingTimer = setTimeout(');
    expect(fabSrc).toContain('if (trailingTimer) clearTimeout(trailingTimer);');
    expect(fabSrc).toContain("document.elementsFromPoint(x, y)");
    expect(fabSrc).toContain("yielded ? 'opacity-0 pointer-events-none' : 'opacity-100'");
    expect(fabSrc).toContain('tabIndex={yielded ? -1 : 0}');
    expect(fabSrc).toContain('aria-hidden={yielded || undefined}');
  });
});
