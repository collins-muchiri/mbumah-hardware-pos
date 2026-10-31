// MBUMAH HARDWARE POS - salary-structure service (v2.304.0)
//
// WHY THIS SERVICE EXISTS: salary structures were schema-and-read data since
// the EMS migration — the run service READ them (the newest structure that
// has begun answers, its components feed the payslip) and the issue rows'
// honest-null law had to leave UNRESOLVED_DEPENDENCY doorless because no
// management surface existed ("salary structures have no management UI").
// v2.304.0 is the desk's write half: the component catalog and the
// per-employee versioned structures, both validated against THE ENGINE'S OWN
// LAWS at write time — what the desk writes is exactly what payroll reads.
//
// Spec rules honored:
//   - route handlers never call Prisma directly for HR mutations (rule 15):
//     the POST/PATCH routes call THESE functions, and every mutation writes
//     an hrAudit row (hash-chained, calm field-name-only metadata);
//   - versioning by supersession: a pay change is a NEW structure that
//     begins later — the newest-begun structure wins (the engine's own
//     selection law), issued payslips keep the numbers they were paid by;
//     the engine ignores `effectiveTo`, so no close-window affordance is
//     offered (a close that would not stop payment would be a lie with a
//     button on it). The one honest off-switch is WITHDRAW (soft delete):
//     future runs stop reading the structure; issued payslips keep theirs.

import { Prisma } from '@prisma/client';
import { db } from '@/lib/db';
import { hrAudit, HrEntityType } from '@/lib/hr/audit';
import {
  PAY_FREQUENCIES,
  SALARY_COMPONENT_COMPUTATIONS,
  SALARY_COMPONENT_TYPES,
} from '@/lib/hr/salary-structure-view';
import type { AuthSession } from '@/lib/auth';

/** The service's own refusal: the route maps `status` onto the response and
 * speaks the message verbatim — the voice already written for the issue row
 * is the same voice the manager reads here. */
export class SalaryStructureError extends Error {
  status: number;
  code: string;
  constructor(status: number, code: string, message: string) {
    super(message);
    this.status = status;
    this.code = code;
    this.name = 'SalaryStructureError';
  }
}

export interface CreateSalaryComponentInput {
  code: string;
  name: string;
  type: string;
  computation?: string;
  amountCents?: number | null;
  percentBps?: number | null;
  isTaxable?: boolean;
}

export interface CreateSalaryStructureInput {
  employeeId: string;
  payFrequency?: string;
  effectiveFrom: string;
  effectiveTo?: string | null;
  componentIds?: string[];
}

/** A non-negative integer cents value. */
function isCents(v: unknown): v is number {
  return typeof v === 'number' && Number.isInteger(v) && v >= 0;
}

/**
 * Create a component in the catalog — the vocabulary payroll reads. The
 * component's own amountCents/percentBps are THE numbers the run service
 * pays (the assignment's override fields are not read by the engine), so
 * the catalog row is written with care: a known type, a known computation,
 * and at least one value the engine can resolve.
 */
export async function createSalaryComponent(
  session: AuthSession,
  input: CreateSalaryComponentInput,
): Promise<{ id: string }> {
  const code = typeof input.code === 'string' ? input.code.trim() : '';
  const name = typeof input.name === 'string' ? input.name.trim() : '';
  const type = typeof input.type === 'string' ? input.type.trim() : '';
  if (!code) throw new SalaryStructureError(400, 'MISSING_CODE', 'The component needs a code (e.g. HOUSE, TRANSPORT).');
  if (!name) throw new SalaryStructureError(400, 'MISSING_NAME', 'The component needs a human name.');
  if (!(SALARY_COMPONENT_TYPES as readonly string[]).includes(type)) {
    throw new SalaryStructureError(400, 'UNKNOWN_TYPE', `Unknown component type "${type || '(empty)'}". Choose EARNING, DEDUCTION or EMPLOYER_CONTRIBUTION.`);
  }
  const computation =
    typeof input.computation === 'string' && input.computation.trim()
      ? input.computation.trim()
      : 'FIXED';
  if (!(SALARY_COMPONENT_COMPUTATIONS as readonly string[]).includes(computation)) {
    throw new SalaryStructureError(400, 'UNKNOWN_COMPUTATION', `Unknown computation "${computation}". Choose FIXED, PERCENT_OF_BASIC or FORMULA.`);
  }
  const amountCents = input.amountCents ?? null;
  const percentBps = input.percentBps ?? null;
  if (amountCents != null && !isCents(amountCents)) {
    throw new SalaryStructureError(400, 'BAD_AMOUNT', 'The flat amount must be a whole, non-negative number of cents.');
  }
  if (percentBps != null && (!Number.isInteger(percentBps) || percentBps < 0 || percentBps > 10_000)) {
    throw new SalaryStructureError(400, 'BAD_PERCENT', 'The percent must be a whole number of basis points between 0 and 10,000.');
  }
  if (amountCents == null && percentBps == null) {
    throw new SalaryStructureError(400, 'NO_VALUE', 'Give the component a flat amount or a percent of basic — payroll resolves one of the two.');
  }

  try {
    const created = await db.salaryComponent.create({
      data: {
        storeId: session.storeId,
        code,
        name,
        type,
        computation,
        amountCents,
        percentBps,
        isTaxable: input.isTaxable ?? true,
      },
      select: { id: true },
    });
    await hrAudit({
      actorId: session.userId,
      actorRole: session.role,
      action: 'SALARY_COMPONENT_CREATED',
      resourceType: HrEntityType.SALARY_COMPONENT,
      resourceId: created.id,
      storeId: session.storeId,
      metadata: { code, name, type, computation, fieldNames: ['code', 'name', 'type', 'computation'] },
    });
    return created;
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
      throw new SalaryStructureError(409, 'DUPLICATE_CODE', `A component with code "${code}" already exists in this store.`);
    }
    throw e;
  }
}

/**
 * Set a component's isActive — the honest off-switch. The run service skips
 * inactive components before a single cent is computed, so deactivating
 * stops future runs from paying it; issued payslips keep their numbers.
 */
export async function setSalaryComponentActive(
  session: AuthSession,
  id: string,
  isActive: boolean,
): Promise<{ id: string }> {
  const component = await db.salaryComponent.findFirst({
    where: { id, store: { organizationId: session.organizationId } },
    select: { id: true, code: true, isActive: true },
  });
  if (!component) {
    throw new SalaryStructureError(404, 'NOT_FOUND', 'No such salary component in this organization.');
  }
  if (component.isActive === isActive) {
    throw new SalaryStructureError(409, 'ALREADY_IN_STATE', `"${component.code}" is already ${isActive ? 'active' : 'inactive'}.`);
  }
  await db.salaryComponent.update({
    where: { id: component.id },
    data: { isActive },
    select: { id: true },
  });
  await hrAudit({
    actorId: session.userId,
    actorRole: session.role,
    action: isActive ? 'SALARY_COMPONENT_ACTIVATED' : 'SALARY_COMPONENT_DEACTIVATED',
    resourceType: HrEntityType.SALARY_COMPONENT,
    resourceId: component.id,
    storeId: session.storeId,
    metadata: { code: component.code, isActive, fieldNames: ['isActive'] },
  });
  return { id: component.id };
}

/**
 * Create a versioned salary structure for one employee — THE SUPERSESSION
 * law at write time: among the structures that have begun, the newest-begun
 * answers (the engine's own selection), so a pay change is a NEW structure
 * beginning on its own day, never an edit of the old one. Two structures of
 * one employee beginning the SAME day would resolve by input order —
 * ambiguity, not versioning — so the guard refuses it outright.
 */
export async function createSalaryStructure(
  session: AuthSession,
  input: CreateSalaryStructureInput,
): Promise<{ id: string }> {
  const employeeId = typeof input.employeeId === 'string' ? input.employeeId.trim() : '';
  if (!employeeId) {
    throw new SalaryStructureError(400, 'MISSING_EMPLOYEE', 'The structure needs its employee.');
  }
  const employee = await db.employee.findFirst({
    where: { id: employeeId, store: { organizationId: session.organizationId } },
    select: { id: true, firstName: true, lastName: true },
  });
  if (!employee) {
    throw new SalaryStructureError(404, 'UNKNOWN_EMPLOYEE', 'No such employee in this organization.');
  }
  const payFrequency =
    typeof input.payFrequency === 'string' && input.payFrequency.trim()
      ? input.payFrequency.trim()
      : 'MONTHLY';
  if (!(PAY_FREQUENCIES as readonly string[]).includes(payFrequency)) {
    throw new SalaryStructureError(400, 'UNKNOWN_FREQUENCY', `Unknown pay frequency "${payFrequency}". Choose MONTHLY, BIWEEKLY, WEEKLY or DAILY.`);
  }
  const from = new Date(input.effectiveFrom);
  if (!input.effectiveFrom || Number.isNaN(from.getTime())) {
    throw new SalaryStructureError(400, 'BAD_EFFECTIVE_FROM', 'The effective window needs a valid start date.');
  }
  let to: Date | null = null;
  if (input.effectiveTo) {
    to = new Date(input.effectiveTo);
    if (Number.isNaN(to.getTime())) {
      throw new SalaryStructureError(400, 'BAD_EFFECTIVE_TO', 'The effective window\u2019s end date is not a valid date.');
    }
    if (to.getTime() < from.getTime()) {
      throw new SalaryStructureError(400, 'BAD_WINDOW', 'The effective window ends before it begins.');
    }
  }
  const componentIds = Array.isArray(input.componentIds) ? input.componentIds.filter((c) => typeof c === 'string' && c.trim()) : [];

  // THE SAME-DAY GUARD (engine parity, write-time): the engine resolves a
  // tie by input order, so two structures beginning the same day are not a
  // version history — they are a coin flip. Refuse it.
  const clash = await db.salaryStructure.findFirst({
    where: { employeeId, deletedAt: null, effectiveFrom: from },
    select: { id: true },
  });
  if (clash) {
    throw new SalaryStructureError(
      409,
      'SAME_DAY_BEGINNING',
      `This employee already has a structure beginning ${input.effectiveFrom}. A pay change is a new structure on its own day — pick a different date (the newest-begun structure answers).`,
    );
  }

  // Component custody: every picked id must be a known, ACTIVE component of
  // this organization — a deactivated or foreign component would ride the
  // structure silently until a run skips it.
  if (componentIds.length > 0) {
    const unique = [...new Set(componentIds)];
    const known = await db.salaryComponent.findMany({
      where: { id: { in: unique }, isActive: true, store: { organizationId: session.organizationId } },
      select: { id: true },
    });
    if (known.length !== unique.length) {
      throw new SalaryStructureError(
        409,
        'UNKNOWN_COMPONENT',
        'One of the picked components does not exist or is inactive — only active catalog components can attach.',
      );
    }
  }

  try {
    const created = await db.salaryStructure.create({
      data: {
        employeeId,
        payFrequency,
        effectiveFrom: from,
        effectiveTo: to,
        createdByUserId: session.userId,
        ...(componentIds.length > 0
          ? {
              components: {
                create: componentIds.map((salaryComponentId) => ({ employeeId, salaryComponentId })),
              },
            }
          : {}),
      },
      select: { id: true },
    });
    await hrAudit({
      actorId: session.userId,
      actorRole: session.role,
      action: 'SALARY_STRUCTURE_CREATED',
      resourceType: HrEntityType.SALARY_STRUCTURE,
      resourceId: created.id,
      storeId: session.storeId,
      metadata: {
        employeeId,
        payFrequency,
        effectiveFrom: input.effectiveFrom,
        componentCount: componentIds.length,
        fieldNames: ['employeeId', 'payFrequency', 'effectiveFrom', 'components'],
      },
    });
    return created;
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
      throw new SalaryStructureError(409, 'DUPLICATE_ASSIGNMENT', 'The same component is already attached to this structure.');
    }
    throw e;
  }
}

/**
 * Withdraw a structure (soft delete) — the honest off-switch. The engine
 * filters deletedAt: null, so future runs stop reading the structure and
 * the employee falls back to basic salary until a newer version begins;
 * issued payslips keep the numbers they were paid by.
 */
export async function withdrawSalaryStructure(
  session: AuthSession,
  id: string,
): Promise<{ id: string }> {
  const structure = await db.salaryStructure.findFirst({
    where: { id, deletedAt: null, employee: { store: { organizationId: session.organizationId } } },
    select: { id: true, employeeId: true, effectiveFrom: true },
  });
  if (!structure) {
    throw new SalaryStructureError(404, 'NOT_FOUND', 'No such salary structure in this organization.');
  }
  await db.salaryStructure.update({
    where: { id: structure.id },
    data: { deletedAt: new Date() },
    select: { id: true },
  });
  await hrAudit({
    actorId: session.userId,
    actorRole: session.role,
    action: 'SALARY_STRUCTURE_WITHDRAWN',
    resourceType: HrEntityType.SALARY_STRUCTURE,
    resourceId: structure.id,
    storeId: session.storeId,
    metadata: { employeeId: structure.employeeId, fieldNames: ['deletedAt'] },
  });
  return { id: structure.id };
}
