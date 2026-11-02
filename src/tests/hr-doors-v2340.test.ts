import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'path';
import { describe, it, expect } from 'vitest';

// ---------------------------------------------------------------------------
// v2.340.0 — THE HR FAMILY, the bare class's first pass.
//
// The five HR reads (attendance, employees, leave-types, shifts,
// shifts/[id]/end) stop reading their bodies as the door's default `any`
// and speak their own shapes:
//   • the presence-guarded fields ride REQUIRED strings — the route's own
//     guard is the runtime validator and Prisma's where/data consume them;
//   • the columns ride the types the create data feeds (string / number /
//     boolean);
//   • the coerced figures stay `unknown` — startingCash and the end-shift
//     cash pair ride the routes' own Number() + isFinite chains, and the
//     employeeCode read rides its own String() coercion.
//
// The bare class falls 30 → 25. THE OD LAW: every pin reads SOURCE bytes.
// ---------------------------------------------------------------------------

const read = (p: string) => readFileSync(p, 'utf8');

function walkApi(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) out.push(...walkApi(full));
    else if (name.endsWith('.ts')) out.push(full);
  }
  return out;
}

const API_FILES = walkApi('src/app/api');
const BARE = API_FILES.filter((f) => /readJsonBody\(request\)/.test(read(f)));

const HR_DOORS = [
  'src/app/api/attendance/route.ts',
  'src/app/api/employees/route.ts',
  'src/app/api/leave-types/route.ts',
  'src/app/api/shifts/route.ts',
  'src/app/api/shifts/[id]/end/route.ts',
];

describe('THE BARE CLASS FALLS 30 → 25 (v2.340.0)', () => {
  it('exactly 25 bare doors remain', () => {
    expect(BARE.length).toBe(25);
  });

  it('the five HR doors left the census', () => {
    for (const hr of HR_DOORS) {
      expect(BARE.includes(hr)).toBe(false);
    }
  });

  it('the law doc records the fall (history keeps the 30, the round note speaks 25)', () => {
    const home = read('src/lib/request-body.ts');
    expect(home.includes("falls to 25 doors")).toBe(true);
    // the v2.339.0 history note keeps its own count (release history never rewrites)
    expect(home.includes("30 doors named by the round's census")).toBe(true);
  });
});

describe('THE HR DOORS SPEAK THEIR OWN SHAPES', () => {
  it('attendance: the clock trio rides REQUIRED strings, the pair rides the columns', () => {
    const src = read('src/app/api/attendance/route.ts');
    expect(src.includes('employeeId: string;')).toBe(true);
    expect(src.includes('storeId: string;')).toBe(true);
    expect(src.includes('action: string;')).toBe(true);
    expect(src.includes('location?: string;')).toBe(true);
    expect(src.includes('notes?: string;')).toBe(true);
    expect(/readJsonBody\(request\)/.test(src)).toBe(false);
    expect(src.includes('employeeId and storeId are required.')).toBe(true);
  });

  it('employees: the four ride REQUIRED, the columns ride their create-data types, employeeCode stays unknown', () => {
    const src = read('src/app/api/employees/route.ts');
    expect(src.includes('  const door = await readJsonBody<{')).toBe(true);
    for (const req of ['storeId: string;', 'firstName: string;', 'lastName: string;', 'hireDate: string;']) {
      expect(src.includes(req)).toBe(true);
    }
    for (const str of ['email?: string;', 'phone?: string;', 'kraPin?: string;', 'jobTitle?: string;', 'role?: string;', 'employmentType?: string;', 'bankName?: string;', 'notes?: string;', 'userId?: string;']) {
      expect(src.includes(str)).toBe(true);
    }
    for (const num of ['basicSalary?: number;', 'hourlyRate?: number;', 'houseAllowance?: number;', 'otherAllowances?: number;']) {
      expect(src.includes(num)).toBe(true);
    }
    for (const flag of ['payeExempt?: boolean;', 'nssfExempt?: boolean;', 'nhifExempt?: boolean;']) {
      expect(src.includes(flag)).toBe(true);
    }
    expect(src.includes('employeeCode?: unknown;')).toBe(true);
    expect(/readJsonBody\(request\)/.test(src)).toBe(false);
  });

  it('leave-types: the name/code pair rides REQUIRED, the columns ride their create-data types', () => {
    const src = read('src/app/api/leave-types/route.ts');
    expect(src.includes('name: string;')).toBe(true);
    expect(src.includes('code: string;')).toBe(true);
    expect(src.includes('description?: string;')).toBe(true);
    expect(src.includes('defaultDaysPerYear?: number;')).toBe(true);
    expect(src.includes('isPaid?: boolean;')).toBe(true);
    expect(src.includes('isStatutory?: boolean;')).toBe(true);
    expect(src.includes('carryForwardAllowed?: boolean;')).toBe(true);
    expect(src.includes('maxCarryForwardDays?: number;')).toBe(true);
    expect(/readJsonBody\(request\)/.test(src)).toBe(false);
    expect(src.includes('name and code are required.')).toBe(true);
  });

  it('shifts: the open pair rides REQUIRED strings, startingCash stays unknown (the Number() chain owns the widening)', () => {
    const src = read('src/app/api/shifts/route.ts');
    expect(src.includes('storeId: string;')).toBe(true);
    expect(src.includes('userId: string;')).toBe(true);
    expect(src.includes('startingCash?: unknown;')).toBe(true);
    expect(/readJsonBody\(request\)/.test(src)).toBe(false);
    expect(src.includes('const openingCash = Number(startingCash) || 0;')).toBe(true);
  });

  it('shifts/[id]/end: the cash pair stays unknown (the Number() + isFinite chain owns the widening), notes rides the column', () => {
    const src = read('src/app/api/shifts/[id]/end/route.ts');
    expect(src.includes('endingCash?: unknown;')).toBe(true);
    expect(src.includes('countedCash?: unknown;')).toBe(true);
    expect(src.includes('notes?: string;')).toBe(true);
    expect(/readJsonBody\(request\)/.test(src)).toBe(false);
    expect(src.includes('endingCash and countedCash must be finite numbers.')).toBe(true);
  });
});

describe('THE LAW DOC CARRIES THE ROUND', () => {
  it('request-body.ts records the HR family pass', () => {
    const home = read('src/lib/request-body.ts');
    expect(home.includes("v2.340.0 — THE HR FAMILY, the bare class's first pass")).toBe(true);
    expect(home.includes('The presence-guarded fields ride REQUIRED strings')).toBe(true);
  });
});

describe('THE STYLING FACE — the shift-variance meter + the material voice', () => {
  const desk = () => read('src/app/(shell)/tabs/dashboard-tab.tsx');

  it('the closing result steps through THREE honest voices', () => {
    const src = desk();
    expect(src.includes("const endVarianceLevel = endVariance < 1 ? 'balanced' : endVariance >= 1000 ? 'material' : 'drift';")).toBe(true);
    expect(src.includes("'border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-950/40'")).toBe(true);
    expect(src.includes("'text-red-700 dark:text-red-300'")).toBe(true);
    expect(src.includes('bg-red-500')).toBe(true);
    // the emerald + amber voices keep their dark variants now too
    expect(src.includes('dark:border-emerald-800 dark:bg-emerald-950/40')).toBe(true);
    expect(src.includes('dark:border-amber-800 dark:bg-amber-950/40')).toBe(true);
  });

  it('the meter draws the |variance| against the counted envelope', () => {
    const src = desk();
    expect(src.includes('data-testid="shift-variance-meter"')).toBe(true);
    expect(src.includes('role="progressbar"')).toBe(true);
    expect(src.includes('aria-valuemin={0}')).toBe(true);
    expect(src.includes('aria-valuemax={100}')).toBe(true);
    expect(src.includes('aria-valuenow={Math.round(endVariancePct)}')).toBe(true);
    expect(src.includes('Cash variance: ')).toBe(true);
    expect(src.includes('counted (')).toBe(true);
    expect(src.includes('Math.min(100, (endVariance / endResult.countedCash) * 100)')).toBe(true);
    expect(src.includes('endResult.countedCash > 0 && (')).toBe(true);
  });

  it('THE WAKING FIX: the closing summary stays mounted until the dialog closes', () => {
    const src = desk();
    // the invalidation moved OUT of the end mutation into closeEndDialog
    expect(src.includes('// v2.340.0 THE WAKING FIX: the queries are invalidated when the dialog')).toBe(true);
    expect(src.includes('// v2.340.0 THE WAKING FIX: the refetch lands here — after the dialog is')).toBe(true);
    // exactly TWO invalidate calls remain, both on the dialog's close path
    expect(src.split('void queryClient.invalidateQueries').length - 1).toBe(2);
  });
});
