// MBUMAH HARDWARE POS - the salary finds its desk (v2.304.0)
//
// BOTH NETS, per the runtime-pin law:
//   • the VALUE net pins the desk's truth: the pure in-force law in
//     salary-structure-view.ts is the RUN SERVICE'S OWN selection (among the
//     structures that have begun, the newest-begun answers; `effectiveTo`
//     plays NO part — a lapsed window still answers until a newer version
//     begins), the status chip is a pure function of now + the in-force id,
//     the same-day clash map names the ambiguity the write guard refuses,
//     and the component estimate is the ENGINE'S OWN arithmetic byte-parity
//     (amountCents first; else basic (KES float) × percentBps / 10_000,
//     rounded AS KES then ×100 — the KES-rounding path, not a cents path).
//   • the BYTE net pins the custody chain: the service owns the mutations
//     (the routes never touch Prisma), every mutation writes the
//     hash-chained audit row, the same-day guard replicates the engine's
//     tie resolution at write time, the write routes gate on
//     hr.salary-structure.manage, UNRESOLVED_DEPENDENCY's door walks to the
//     desk (the honest nulls drop from three to two), and the /hr tile
//     carries its Manage door.

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  PAY_FREQUENCIES,
  SALARY_COMPONENT_TYPES,
  SALARY_COMPONENT_COMPUTATIONS,
  salaryStructureInForce,
  salaryStructureStatus,
  salaryStructureWindowLapsed,
  salaryStructureSameDayClashes,
  estimateComponentCents,
  formatKes,
} from '@/lib/hr/salary-structure-view';
import { payrollIssueDoor } from '@/lib/hr/payroll/error-voice';
import { GUARDRAIL_CODES } from '@/lib/hr/payroll/types';

const ROOT = process.cwd();
const VIEW_LIB = 'src/lib/hr/salary-structure-view.ts';
const SERVICE = 'src/lib/hr/salary-structure-service.ts';
const ROUTE = 'src/app/api/hr/salary-structures/route.ts';
const ID_ROUTE = 'src/app/api/hr/salary-structures/[id]/route.ts';
const COMP_ROUTE = 'src/app/api/hr/salary-components/route.ts';
const COMP_ID_ROUTE = 'src/app/api/hr/salary-components/[id]/route.ts';
const PAGE = 'src/app/(shell)/hr/salary-structures/page.tsx';
const HR_PAGE = 'src/app/(shell)/hr/page.tsx';
const VOICE_LIB = 'src/lib/hr/payroll/error-voice.ts';
const PERMISSIONS = 'src/lib/hr/permissions.ts';

const read = (p: string) => readFileSync(join(ROOT, p), 'utf8');

const D = (s: string) => new Date(s);

interface MkShape {
  id: string;
  employeeId: string;
  effectiveFrom: string;
  effectiveTo?: string | null;
  payFrequency?: string;
}

const mk = (id: string, employeeId: string, effectiveFrom: string, effectiveTo: string | null = null): MkShape => ({
  id,
  employeeId,
  effectiveFrom,
  effectiveTo,
});

describe('salaryStructureInForce — the engine\u2019s own selection law', () => {
  it('the newest-begun structure answers', () => {
    const list = [
      mk('a', 'e1', '2026-01-01'),
      mk('b', 'e1', '2026-06-01'),
      mk('c', 'e1', '2026-03-01'),
    ];
    expect(salaryStructureInForce(list, D('2026-10-31'))?.id).toBe('b');
  });

  it('a structure that has not begun never answers (SCHEDULED territory)', () => {
    const list = [mk('a', 'e1', '2026-01-01'), mk('b', 'e1', '2027-01-01')];
    expect(salaryStructureInForce(list, D('2026-10-31'))?.id).toBe('a');
    expect(salaryStructureInForce(list, D('2026-12-31'))?.id).toBe('a');
    expect(salaryStructureInForce(list, D('2027-01-01'))?.id).toBe('b');
  });

  it('the begin date itself answers (effectiveFrom <= at, engine parity)', () => {
    const list = [mk('a', 'e1', '2026-06-01')];
    expect(salaryStructureInForce(list, D('2026-06-01'))?.id).toBe('a');
  });

  it('effectiveTo plays NO part — a lapsed window still answers', () => {
    // THE honest surprise the desk must surface: the run service selects by
    // effectiveFrom only. A window that ended in March still answers in May
    // until a newer version begins.
    const list = [mk('a', 'e1', '2026-01-01', '2026-03-31')];
    expect(salaryStructureInForce(list, D('2026-05-15'))?.id).toBe('a');
    expect(salaryStructureWindowLapsed(list[0], D('2026-05-15'))).toBe(true);
    expect(salaryStructureWindowLapsed(list[0], D('2026-03-31'))).toBe(false);
  });

  it('employees are independent — one employee\u2019s newer version never answers for another', () => {
    const list = [mk('a', 'e1', '2026-01-01'), mk('b', 'e2', '2026-06-01')];
    expect(salaryStructureInForce(list, D('2026-10-31'))?.id).toBe('b');
    expect(salaryStructureInForce(list.filter((s) => s.employeeId === 'e1'), D('2026-10-31'))?.id).toBe('a');
  });

  it('an empty history answers null — basic-only pay', () => {
    expect(salaryStructureInForce([], D('2026-10-31'))).toBeNull();
  });

  it('a same-day tie resolves by input order (the ambiguity the write guard refuses)', () => {
    const list = [mk('a', 'e1', '2026-06-01'), mk('b', 'e1', '2026-06-01')];
    expect(salaryStructureInForce(list, D('2026-10-31'))?.id).toBe('a');
  });
});

describe('salaryStructureStatus — the desk\u2019s chip, from the same law', () => {
  it('SCHEDULED before the begin date', () => {
    const s = mk('a', 'e1', '2027-01-01');
    expect(salaryStructureStatus(s, D('2026-10-31'), null)).toBe('SCHEDULED');
  });

  it('ACTIVE when the structure is the one in force', () => {
    const s = mk('a', 'e1', '2026-01-01');
    expect(salaryStructureStatus(s, D('2026-10-31'), 'a')).toBe('ACTIVE');
  });

  it('SUPERSEDED when a newer version has begun', () => {
    const s = mk('a', 'e1', '2026-01-01');
    expect(salaryStructureStatus(s, D('2026-10-31'), 'b')).toBe('SUPERSEDED');
  });
});

describe('salaryStructureSameDayClashes — the ambiguity map', () => {
  it('groups same-employee same-day beginnings and nothing else', () => {
    const list = [
      mk('a', 'e1', '2026-06-01'),
      mk('b', 'e1', '2026-06-01'),
      mk('c', 'e1', '2026-07-01'),
      mk('d', 'e2', '2026-06-01'),
    ];
    const clashes = salaryStructureSameDayClashes(list);
    expect(clashes.size).toBe(1);
    const pair = clashes.get(`e1|${D('2026-06-01').getTime()}`) ?? [];
    expect(pair.map((s) => s.id).sort()).toEqual(['a', 'b']);
  });

  it('a clean history yields an empty map', () => {
    expect(salaryStructureSameDayClashes([mk('a', 'e1', '2026-01-01'), mk('b', 'e1', '2026-06-01')]).size).toBe(0);
  });
});

describe('estimateComponentCents — the engine\u2019s own arithmetic, byte-parity', () => {
  it('amountCents wins first (the engine reads it before any percent)', () => {
    expect(estimateComponentCents({ amountCents: 150_000, percentBps: 1_000 }, 85_000)).toBe(150_000);
    expect(estimateComponentCents({ amountCents: 0, percentBps: 1_000 }, 85_000)).toBe(0);
  });

  it('the percent path rounds AS KES then \u00d7100 — the engine\u2019s exact conversion', () => {
    // The engine: Math.round((Number(basicSalary) * percentBps) / 10_000) * 100
    // 85,000 KES \u00d7 1,000 bps = 8,500 KES \u2192 850,000 cents.
    expect(estimateComponentCents({ amountCents: null, percentBps: 1_000 }, 85_000)).toBe(850_000);
    // The KES-rounding path differs from a cents path on fractional basics:
    // 42,333.33 KES \u00d7 333 bps: KES path rounds 1,409.7\u2026 KES to 1,410 \u2192 141,000;
    // a naive cents path would give 140,999.99\u2026 \u2192 141,000 too, but
    // 85000.5 \u00d7 333 bps: KES round(2,830.52)=2,831 \u2192 283,100 \u2260 cents path 283,052.
    expect(estimateComponentCents({ percentBps: 333 }, 85_000.5)).toBe(283_100);
    expect(estimateComponentCents({ percentBps: 333 }, 42_333.33)).toBe(141_000);
  });

  it('a missing percent pays zero (the engine\u2019s ?? 0)', () => {
    expect(estimateComponentCents({ amountCents: null, percentBps: null }, 85_000)).toBe(0);
    expect(estimateComponentCents({ amountCents: null }, 85_000)).toBe(0);
  });
});

describe('formatKes — the desk\u2019s money words', () => {
  it('whole shillings render bare, cents render only when they exist', () => {
    expect(formatKes(850_000)).toBe('8,500');
    expect(formatKes(850_050)).toBe('8,500.50');
    expect(formatKes(5)).toBe('0.05');
    expect(formatKes(-250)).toBe('-2.50');
  });
});

describe('the schema\u2019s known lists', () => {
  it('the four pay frequencies ride the known list', () => {
    for (const f of ['MONTHLY', 'BIWEEKLY', 'WEEKLY', 'DAILY']) expect(PAY_FREQUENCIES).toContain(f);
  });
  it('the three component types and three computations ride the known lists', () => {
    for (const t of ['EARNING', 'DEDUCTION', 'EMPLOYER_CONTRIBUTION']) expect(SALARY_COMPONENT_TYPES).toContain(t);
    for (const c of ['FIXED', 'PERCENT_OF_BASIC', 'FORMULA']) expect(SALARY_COMPONENT_COMPUTATIONS).toContain(c);
  });
});

describe('the salary desk — the byte net (custody chain)', () => {
  it('the service owns ALL mutations; the routes never touch Prisma', () => {
    const svc = read(SERVICE);
    expect(svc).toContain('export async function createSalaryComponent');
    expect(svc).toContain('export async function setSalaryComponentActive');
    expect(svc).toContain('export async function createSalaryStructure');
    expect(svc).toContain('export async function withdrawSalaryStructure');
    expect(svc).toContain('export class SalaryStructureError');
    for (const route of [read(ROUTE), read(ID_ROUTE), read(COMP_ROUTE), read(COMP_ID_ROUTE)]) {
      expect(route).toContain('salary-structure-service');
      expect(route).not.toContain('db.salaryStructure.create');
      expect(route).not.toContain('db.salaryStructure.update');
      expect(route).not.toContain('db.salaryComponent.create');
      expect(route).not.toContain('db.salaryComponent.update');
    }
  });

  it('every mutation writes the hash-chained audit row (spec rule 15)', () => {
    const svc = read(SERVICE);
    expect(svc).toContain("action: 'SALARY_COMPONENT_CREATED'");
    // The activation toggle speaks both directions from one conditional.
    expect(svc).toContain("isActive ? 'SALARY_COMPONENT_ACTIVATED' : 'SALARY_COMPONENT_DEACTIVATED'");
    expect(svc).toContain("action: 'SALARY_STRUCTURE_CREATED'");
    expect(svc).toContain("action: 'SALARY_STRUCTURE_WITHDRAWN'");
    expect(svc).toContain('HrEntityType.SALARY_STRUCTURE');
    expect(svc).toContain('HrEntityType.SALARY_COMPONENT');
  });

  it('the same-day guard replicates the engine\u2019s tie resolution at write time', () => {
    const svc = read(SERVICE);
    expect(svc).toContain('THE SAME-DAY GUARD (engine parity, write-time)');
    expect(svc).toContain("'SAME_DAY_BEGINNING'");
  });

  it('the write guard verifies component custody (known, ACTIVE, this org)', () => {
    const svc = read(SERVICE);
    expect(svc).toContain("'UNKNOWN_COMPONENT'");
    expect(svc).toContain('isActive: true');
  });

  it('withdraw is a SOFT delete (the engine\u2019s own off-switch; never a hard one)', () => {
    const svc = read(SERVICE);
    expect(svc).toContain('deletedAt: new Date()');
    expect(svc).not.toContain('.delete(');
  });

  it('the write routes gate on hr.salary-structure.manage (fail-closed)', () => {
    expect(read(ROUTE)).toContain("export const POST = hrGuard('hr.salary-structure.manage')");
    expect(read(ID_ROUTE)).toContain("export const PATCH = hrGuard('hr.salary-structure.manage')");
    expect(read(COMP_ROUTE)).toContain("export const POST = hrGuard('hr.salary-structure.manage')");
    expect(read(COMP_ID_ROUTE)).toContain("export const PATCH = hrGuard('hr.salary-structure.manage')");
    // The key exists in the map with the employee-records family's roles.
    const perms = read(PERMISSIONS);
    expect(perms).toContain("'hr.salary-structure.manage': ['HR_MANAGER', 'STORE_OWNER']");
  });

  it('GET answers the management desk (org-scoped through the employee\u2019s store)', () => {
    const route = read(ROUTE);
    expect(route).toContain("hrGuard('hr.employee.read.own_branch', READ_ROLES)");
    expect(route).toContain('employee: { store: { organizationId } }');
    expect(route).toContain("url.searchParams.get('scope') === 'all'");
    expect(route).toContain("url.searchParams.get('employeeId')");
  });

  it('the desk\u2019s chips run the SAME pure law (no second implementation)', () => {
    const page = read(PAGE);
    expect(page).toContain("from '@/lib/hr/salary-structure-view'");
    expect(page).toContain('salaryStructureInForce(list, now)');
    expect(page).toContain('salaryStructureStatus(s, now, inForce?.id ?? null)');
    expect(page).toContain('salaryStructureWindowLapsed(s, now)');
    expect(page).toContain('salaryStructureSameDayClashes(living)');
    expect(page).toContain('estimateComponentCents(a.salaryComponent, basicKes)');
  });

  it('the desk refuses to offer a close-window affordance (the engine ignores effectiveTo)', () => {
    const page = read(PAGE);
    // The withdraw dialog's own words carry the WHY; no close affordance exists.
    expect(page).toContain('Withdraw structure');
    expect(page).not.toContain('Close window');
    expect(page).toContain('payroll ignores');
  });

  it('the desk surfaces the lapsed-window and same-day warnings (engine honesty)', () => {
    const page = read(PAGE);
    expect(page).toContain('data-testid="salary-structure-lapsed"');
    expect(page).toContain('data-testid="salary-structure-clash"');
    expect(page).toContain('still in force');
  });

  it('the page gates its write affordances on the role the session reports', () => {
    const page = read(PAGE);
    expect(page).toContain("fetch('/api/auth/me'");
    expect(page).toContain("role === 'SUPER_ADMIN' || role === 'HR_MANAGER' || role === 'STORE_OWNER'");
    expect(page).toContain('data-testid="salary-structures-create"');
    expect(page).toContain('data-testid="salary-components-create"');
    expect(page).toContain('data-testid="salary-structure-withdraw"');
    expect(page).toContain('Read-only for');
  });

  it('the dialogs speak the service\u2019s refusal verbatim', () => {
    const page = read(PAGE);
    expect(page).toContain('j?.error ||');
    expect(page).toContain('role="alert"');
  });

  it('the component picker shows the engine-read value, never an override promise', () => {
    const page = read(PAGE);
    // The engine reads the component's OWN amount/percent; the desk's words
    // say so, and no override affordance exists (the engine would not read it):
    // no dialog labels an override input, and the create payloads carry only
    // what payroll reads.
    expect(page).toContain('componentValueWords');
    expect(page).toContain('payroll pays');
    expect(page).not.toContain('Override amount');
    expect(page).not.toContain('Override percent');
    expect(page).toContain('componentIds: picked');
  });

  it('the /hr tile carries its Manage door to the salary desk', () => {
    const hr = read(HR_PAGE);
    expect(hr).toContain('data-testid="hr-salary-structures-door"');
    expect(hr).toContain('href="/hr/salary-structures"');
    // The tile's inline in-force law mirrors the pure lib's selection.
    expect(hr).toContain('function inForceAt(');
    expect(hr).toContain('from > at.getTime()');
    expect(hr).toContain('from > new Date(best.effectiveFrom).getTime()');
  });

  it('the salary door walks to the desk (the promise kept, again)', () => {
    const door = payrollIssueDoor('UNRESOLVED_DEPENDENCY', 'emp-1');
    expect(door).not.toBeNull();
    if (!door) throw new Error('expected a door');
    expect(door.href).toBe('/hr/salary-structures');
    expect(door.label).toBe('Salary structures');
    // The remaining honest nulls stay doorless, each for its documented reason.
    expect(payrollIssueDoor('IMMUTABLE_STATUS', 'emp-1')).toBeNull();
    expect(payrollIssueDoor('DUPLICATE_IDEMPOTENCY_KEY', 'emp-1')).toBeNull();
    // The lib's own bytes tell the promotion story (three nulls became two).
    const voice = read(VOICE_LIB);
    expect(voice).toContain('Two codes stay doorless on purpose');
    expect(voice).toContain('UNRESOLVED_DEPENDENCY now walks to /hr/salary-structures');
  });

  it('the door decision stays TOTAL over every guardrail code', () => {
    for (const code of GUARDRAIL_CODES) {
      const door = payrollIssueDoor(code, 'emp-1');
      if (door !== null) {
        expect(door.href).toMatch(/^\//);
        expect(door.label.length).toBeGreaterThan(0);
      }
    }
  });

  it('the view lib stays pure: no Prisma, no React, no network', () => {
    const src = read(VIEW_LIB);
    const imports = src
      .split('\n')
      .filter((l) => l.trim().startsWith('import '))
      .join('\n');
    expect(imports).toBe('');
  });
});
