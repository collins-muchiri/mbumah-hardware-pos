// MBUMAH HARDWARE POS - salary-structure view law (v2.304.0)
//
// WHY THIS LIB EXISTS: the payroll run service (src/lib/hr/payroll/
// run-service.ts) decides which salary structure answers for an employee at
// pay time and which components feed the payslip. The management face
// (/hr/salary-structures, v2.304.0) needs the SAME laws on the client —
// status chips, in-force markers and estimates computed from the same
// predicates and the same arithmetic the run service runs, so what the desk
// shows and what payroll will pay agree by construction, not by luck.
//
// PURE LAW (spec rule: hr libs are pure): no Prisma, no React, no network.

/** The pay frequencies the schema names (prisma/schema.prisma
 * SalaryStructure.payFrequency comment). */
export const PAY_FREQUENCIES = ['MONTHLY', 'BIWEEKLY', 'WEEKLY', 'DAILY'] as const;

export type PayFrequency = (typeof PAY_FREQUENCIES)[number];

/** The component types the schema names (SalaryComponent.type comment). */
export const SALARY_COMPONENT_TYPES = [
  'EARNING',
  'DEDUCTION',
  'EMPLOYER_CONTRIBUTION',
] as const;

export type SalaryComponentType = (typeof SALARY_COMPONENT_TYPES)[number];

/** The computations the schema names (SalaryComponent.computation comment). */
export const SALARY_COMPONENT_COMPUTATIONS = ['FIXED', 'PERCENT_OF_BASIC', 'FORMULA'] as const;

export type SalaryComponentComputation = (typeof SALARY_COMPONENT_COMPUTATIONS)[number];

/** The structure shape the management read returns (dates as ISO strings or
 * Date — both compare through getTime, exactly as the run service does). */
export interface SalaryStructureViewShape {
  id: string;
  employeeId: string;
  effectiveFrom: string | Date;
  effectiveTo?: string | Date | null;
  payFrequency?: string;
  components?: unknown[];
}

/**
 * The engine's own in-force law (run-service findFirst, byte-parity): among
 * the structures that have BEGUN (effectiveFrom <= at), the one that began
 * LAST answers — newest-begun wins, and `effectiveTo` plays NO part in the
 * selection. A lapsed window still answers until a newer version begins;
 * the desk surfaces that state as a warning instead of hiding it.
 *
 * Ties (two structures with the same effectiveFrom) resolve by input order
 * — ambiguous by construction, which is exactly why the write guard refuses
 * a same-day second beginning (SAME_DAY_BEGINNING).
 */
export function salaryStructureInForce<T extends SalaryStructureViewShape>(
  structures: T[],
  at: Date,
): T | null {
  let best: T | null = null;
  for (const s of structures) {
    const from = new Date(s.effectiveFrom).getTime();
    if (from > at.getTime()) continue;
    if (!best || from > new Date(best.effectiveFrom).getTime()) best = s;
  }
  return best;
}

/** The desk's status chip, from the same law: SCHEDULED has not begun yet,
 * ACTIVE is the structure in force right now, SUPERSEDED has begun but a
 * newer version has taken the employee's pay. */
export type SalaryStructureStatus = 'ACTIVE' | 'SCHEDULED' | 'SUPERSEDED';

export function salaryStructureStatus(
  s: SalaryStructureViewShape,
  at: Date,
  inForceId: string | null,
): SalaryStructureStatus {
  if (new Date(s.effectiveFrom).getTime() > at.getTime()) return 'SCHEDULED';
  return s.id === inForceId ? 'ACTIVE' : 'SUPERSEDED';
}

/** The engine ignores `effectiveTo` when it selects a structure — a window
 * whose end has lapsed on the STILL-IN-FORCE structure is exactly the state
 * the desk must warn about (payroll keeps reading it; close the gap by
 * adding a newer version, not by trusting the old window to have ended). */
export function salaryStructureWindowLapsed(
  s: Pick<SalaryStructureViewShape, 'effectiveFrom' | 'effectiveTo'>,
  at: Date,
): boolean {
  return !!s.effectiveTo && new Date(s.effectiveTo).getTime() < at.getTime();
}

/** Same-day beginnings, grouped by employee+date: two structures of one
 * employee that begin the same day resolve by input order in the engine —
 * ambiguity, not versioning. The write guard refuses to CREATE this state;
 * the desk flags it if the data ever carries it. */
export function salaryStructureSameDayClashes<T extends SalaryStructureViewShape>(
  structures: T[],
): Map<string, T[]> {
  const groups = new Map<string, T[]>();
  for (const s of structures) {
    const from = new Date(s.effectiveFrom).getTime();
    const key = `${s.employeeId}|${from}`;
    const list = groups.get(key) ?? [];
    list.push(s);
    groups.set(key, list);
  }
  const clashes = new Map<string, T[]>();
  for (const [key, list] of groups) {
    if (list.length > 1) clashes.set(key, list);
  }
  return clashes;
}

/** The component the desk reads on a structure row. */
export interface SalaryComponentViewShape {
  code?: string;
  name?: string;
  type?: string;
  isActive?: boolean;
  amountCents?: number | null;
  percentBps?: number | null;
}

/**
 * The engine's component arithmetic (run-service, byte-parity): the
 * component's own amountCents first; otherwise basic salary (the EMPLOYEE's
 * KES float, exactly as the engine converts it) times percentBps over
 * 10_000, rounded AS KES then ×100. Inactive components pay nothing (the
 * engine skips them before this line), and the assignment's override fields
 * are recorded data the engine does NOT read — the desk shows the override
 * as recorded, never as the number payroll pays.
 */
export function estimateComponentCents(
  component: Pick<SalaryComponentViewShape, 'amountCents' | 'percentBps'>,
  basicSalaryKes: number,
): number {
  if (component.amountCents != null) return component.amountCents;
  return Math.round((Number(basicSalaryKes) * (component.percentBps ?? 0)) / 10_000) * 100;
}

/** KES formatting for the desk's estimates (whole shillings read cleanest;
 * cents render only when they exist). */
export function formatKes(cents: number): string {
  const sign = cents < 0 ? '-' : '';
  const abs = Math.abs(cents);
  const whole = Math.floor(abs / 100);
  const rem = abs % 100;
  return rem === 0
    ? `${sign}${whole.toLocaleString('en-KE')}`
    : `${sign}${whole.toLocaleString('en-KE')}.${String(rem).padStart(2, '0')}`;
}
