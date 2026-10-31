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
