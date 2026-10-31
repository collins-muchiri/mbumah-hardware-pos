// MBUMAH HARDWARE POS - payroll guardrail error voice (v2.300.0)
//
// WHY THIS LIB EXISTS: the engine's PayrollGuardrailError speaks
// `${CODE}: ${detail}` — the code is for machines and tests; a manager
// staring at a toast needs the sentence and the next step. v2.300.0's
// lifecycle deep-walk found the raw code surfacing verbatim
// ("RATE_TABLE_MISSING: No active PAYE rate table for 2026-10-31.") —
// honest but voiceless. This ONE home translates every known guardrail
// code into a human sentence + an actionable next step, and keeps the
// engine's own detail verbatim so nothing is lost in translation.
//
// PURE LAW (spec rule: payroll libs are pure): no Prisma, no React, no
// network. Unknown or un-coded strings pass through untouched — the voice
// never guesses.

import { GUARDRAIL_CODES, type GuardrailCode } from './types';

/** The human sentence + next step for each guardrail code. ONE entry per code. */
const GUARDRAIL_VOICES: Record<GuardrailCode, string> = {
  NEGATIVE_NET:
    'A payslip came out negative - its deductions exceed its earnings. Check the affected employees\u2019 earnings and deduction inputs, then run again.',
  DEDUCTION_CAP_EXCEEDED:
    'A statutory deduction climbed past its legal cap. Check the earnings feeding the deduction (including any bonus or off-cycle pay), then run again.',
  RATE_TABLE_MISSING:
    'No statutory rate table is active for this period\u2019s date. Add or activate the statutory tables (PAYE, NSSF, SHIF, Housing Levy) for this period, then initiate again.',
  OVERLAPPING_RATE_TABLES:
    'Two versions of one statutory table claim the same date range. Close or correct the overlapping version so exactly one table is active for the date.',
  MISSING_CONSENT:
    'An employee has not consented to automated payroll processing. Record the employee\u2019s consent, then prepare again.',
  UNRESOLVED_DEPENDENCY:
    'A salary component could not resolve a value it reads from another component. Check the salary structure for a missing or inactive dependency.',
  PERIOD_MISMATCH:
    'Some data belongs to a different pay period than this run. Check attendance and timesheet dates against the pay period.',
  DUPLICATE_IDEMPOTENCY_KEY:
    'A run with this same identity already exists. Nothing was duplicated - open the existing run and continue it instead.',
  IMMUTABLE_STATUS:
    'The run\u2019s current status does not allow that action. Open the run and follow its lifecycle - each step unlocks the next.',
  JOURNAL_IMBALANCE:
    'The payroll journal would not balance (debits and credits disagree). Payroll refuses to post an unbalanced journal - check the component-to-account mappings.',
  MISSING_CHART_ACCOUNT:
    'The chart of accounts is missing a payroll account the journal needs. Seed the payroll liability accounts, then post again.',
  TIMESHEET_NOT_APPROVED:
    'An employee\u2019s timesheet for this period is not approved yet. Approve the timesheet(s), then prepare again.',
};

const CODE_PREFIX_RE = /^([A-Z_]+):\s*/;

/**
 * Translate a raw payroll error message into its human voice.
 *
 * - `RATE_TABLE_MISSING: No active PAYE rate table for 2026-10-31.`
 *   becomes the human sentence + next step, with the engine's own detail
 *   preserved verbatim in parentheses (the date and the table type are
 *   facts, never dropped).
 * - Unknown codes and plain errors return the input UNCHANGED - the voice
 *   never guesses and never eats a message it does not know.
 */
export function payrollGuardrailVoice(raw: string): string {
  if (!raw) return raw;
  const m = CODE_PREFIX_RE.exec(raw);
  if (!m) return raw;
  const code = m[1] as GuardrailCode;
  if (!(GUARDRAIL_CODES as readonly string[]).includes(code)) return raw;
  const detail = raw.slice(m[0].length).trim();
  const voice = GUARDRAIL_VOICES[code];
  return detail ? `${voice} (${detail})` : voice;
}

/**
 * The per-employee issue voice (v2.301.0 - the SECOND caller).
 *
 * Issue rows arrive as `{ code, message }` pairs, and the two shapes disagree:
 * engine guardrail issues carry `CODE: detail` in `message`, while the
 * prepare gate's own issues (MISSING_CONSENT, TIMESHEET_NOT_APPROVED) carry
 * a plain sentence plus the code in its own field. Looking up the voice BY
 * THE CODE FIELD covers both shapes with one law:
 *
 * - known code: the human sentence speaks, and the engine's own words ride
 *   along verbatim in parentheses when they add facts (a `CODE:` prefix on
 *   the message is stripped first so it is never said twice);
 * - unknown code: the message passes through UNTOUCHED - the voice never
 *   guesses, exactly as `payrollGuardrailVoice` passthrough law.
 */
export function payrollGuardrailIssueVoice(code: string, message: string): string {
  if (!(GUARDRAIL_CODES as readonly string[]).includes(code)) return message;
  const voice = GUARDRAIL_VOICES[code as GuardrailCode];
  const detail = message.replace(CODE_PREFIX_RE, '').trim();
  if (!detail || detail === voice) return voice;
  return `${voice} (${detail})`;
}

// ---------------------------------------------------------------------------
// The issue door (v2.302.0) - the voice names the fix; the door WALKS there.
//
// v2.135.0 taught the pattern on the gate card's per-employee rows ("the
// remediation door — diagnosis joins its fix") and v2.136.0 gave the
// timesheet block its own desk. v2.302.0 generalizes it: EVERY issue row
// (both mouths — the run dialog's "Blocked employees" panel and the /hr/payroll
// gate card's blocked-preparation card) can now carry the door, keyed by the
// same code field the voice reads.
//
// THE HONEST-NULL LAW: a door exists ONLY when the fix surface REALLY exists
// in the product today. Two codes stay doorless on purpose, each for its own
// documented reason — a door to a surface that cannot perform the fix is a
// lie with a link on it:
//   • IMMUTABLE_STATUS — the lifecycle IS in place; the fix is the run's own
//     dialog the reader is already holding open;
//   • DUPLICATE_IDEMPOTENCY_KEY — the destination already exists; the door
//     would point at the same list the run came from.
// The v2.302.0 honest nulls for RATE_TABLE_MISSING / OVERLAPPING_RATE_TABLES
// PROMOTED to doors in v2.303.0: the rate-table keeper shipped (/hr/rate-tables
// — the insert/activate/close face the migration plan reserved for "the
// payroll release"), so those doors now walk to a surface that can actually
// perform the fix. And v2.304.0 promotes the OLDEST null the same way:
// UNRESOLVED_DEPENDENCY now walks to /hr/salary-structures — the salary desk
// (the component catalog plus the per-employee versioned structures the run
// service reads), exactly the management UI whose absence kept the door
// honest since v2.302.0. That is the door law working as designed: a null is
// a PROMISE to build the surface, never an excuse.
//
// PURE LAW (same as the voice): no Prisma, no React, no network. Unknown
// codes return null — the door never guesses where a fix lives.
// ---------------------------------------------------------------------------

/** The door a row carries: where the fix lives, what to call it, and the
 * hover title that says why. `null` = no honest door (see the law above). */
export interface PayrollIssueDoor {
  href: string;
  label: string;
  title: string;
}

const CONSENT_LEDGER_HREF = '/hr/reports?tab=privacy';
const TIMESHEET_DESK_HREF = '/hr/timesheets';
const RATE_TABLE_DESK_HREF = '/hr/rate-tables';
const SALARY_DESK_HREF = '/hr/salary-structures';
const FINANCIAL_TAB_HREF = '/?tab=financial';

/** The fix surfaces, by code. Employee-keyed doors need `employeeId` — the
 * server's PayrollIssue has carried it since the run service's first issue
 * push, and v2.302.0 lets the client shapes say so. A blank/whitespace id
 * counts as absent: the door never builds a half link. */
export function payrollIssueDoor(code: string, employeeId?: string): PayrollIssueDoor | null {
  const id = typeof employeeId === 'string' && employeeId.trim() ? employeeId.trim() : null;
  switch (code) {
    case 'MISSING_CONSENT':
      // v2.135.0's precedented door: the grant lives on the Privacy tab's
      // consent ledger (grant lives there since v2.119.0).
      return {
        href: CONSENT_LEDGER_HREF,
        label: 'Consent ledger',
        title: 'Grant lives on the Privacy tab\u2019s consent ledger — opens in its own tab.',
      };
    case 'TIMESHEET_NOT_APPROVED':
      // v2.136.0's precedented door, deep-linking the employee the gate
      // blocked when the row knows who it speaks for.
      return {
        href: id ? `${TIMESHEET_DESK_HREF}?employee=${encodeURIComponent(id)}` : TIMESHEET_DESK_HREF,
        label: 'Timesheet desk',
        title: 'Approve lives on the timesheet desk — opens in its own tab.',
      };
    case 'NEGATIVE_NET':
    case 'DEDUCTION_CAP_EXCEEDED':
      // The earnings and deduction inputs live on the employee record —
      // the same surface the voice's sentence tells the manager to check.
      return id
        ? {
            href: `/hr/employees/${encodeURIComponent(id)}`,
            label: 'Employee record',
            title: 'The earnings and deduction inputs live on the employee record — opens in its own tab.',
          }
        : null;
    case 'PERIOD_MISMATCH':
      // Attendance dates are checked against the pay period on the desk
      // that owns the timesheets.
      return {
        href: TIMESHEET_DESK_HREF,
        label: 'Timesheet desk',
        title: 'Attendance dates are checked against the pay period on the timesheet desk — opens in its own tab.',
      };
    case 'MISSING_CHART_ACCOUNT':
      // The Financial tab's Chart of Accounts CRUD is the seed surface.
      return {
        href: FINANCIAL_TAB_HREF,
        label: 'Chart of accounts',
        title: 'Payroll accounts live on the Financial tab — opens in its own tab.',
      };
    case 'JOURNAL_IMBALANCE':
      // The Financial tab's journal entries table is where a mapping fix
      // starts.
      return {
        href: FINANCIAL_TAB_HREF,
        label: 'Journal entries',
        title: 'The journal and its account mappings live on the Financial tab — opens in its own tab.',
      };
    case 'UNRESOLVED_DEPENDENCY':
      // v2.304.0: the salary desk shipped — the component catalog plus the
      // per-employee versioned structures the run service reads. The voice's
      // sentence ("check the salary structure for a missing or inactive
      // dependency") now has a surface that can actually perform the check.
      return {
        href: SALARY_DESK_HREF,
        label: 'Salary structures',
        title: 'The salary desk — the structures and components payroll reads — opens in its own tab.',
      };
    case 'RATE_TABLE_MISSING':
    case 'OVERLAPPING_RATE_TABLES':
      // v2.303.0: the rate-table keeper shipped — /hr/rate-tables adds new
      // versions (its insert guard replicates the engine's overlap law at
      // write time) and closes overlapping windows, so BOTH codes now walk
      // to a surface that can actually perform the fix. The desk highlights
      // the overlapping windows itself, so one door serves both codes.
      return {
        href: RATE_TABLE_DESK_HREF,
        label: 'Rate tables',
        title: 'The statutory tables\u2019 keeper — insert a missing version or close the overlapping one — opens in its own tab.',
      };
    default:
      // The two documented honest nulls + every unknown code.
      return null;
  }
}
