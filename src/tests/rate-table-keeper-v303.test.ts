// MBUMAH HARDWARE POS - the tables get their keeper (v2.303.0)
//
// BOTH NETS, per the runtime-pin law:
//   • the VALUE net pins the desk's truth: the pure window law in
//     rate-table-view.ts is the ENGINE'S OWN resolveRates law (active =
//     began on or before the date and not ended before it; open never ends),
//     the status chip is a pure function of now, the overlap map groups by
//     org-agnostic type+code and treats touching windows as intersections
//     (both answer for the boundary date — the engine throws on exactly
//     that), and the isoDayAfter helper walks UTC midnight, never a drifted
//     day.
//   • the BYTE net pins the custody chain: the service owns the mutations
//     (the route never touches Prisma), every mutation writes the
//     hash-chained audit row, the insert guard replicates the engine's
//     overlap law at WRITE time, the close only shrinks a window, the doors
//     PROMOTED from v2.302.0's honest nulls walk to the keeper, and the
//     /hr tile carries its Manage door.

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  RATE_TABLE_TYPES,
  rateTableWindowCovers,
  rateTableStatus,
  rateTableWindowsIntersect,
  rateTableOverlapMap,
  isoDayAfter,
} from '@/lib/hr/rate-table-view';
import { payrollIssueDoor } from '@/lib/hr/payroll/error-voice';
import { GUARDRAIL_CODES } from '@/lib/hr/payroll/types';

const ROOT = process.cwd();
const VIEW_LIB = 'src/lib/hr/rate-table-view.ts';
const SERVICE = 'src/lib/hr/rate-table-service.ts';
const ROUTE = 'src/app/api/hr/rate-tables/route.ts';
const ID_ROUTE = 'src/app/api/hr/rate-tables/[id]/route.ts';
const PAGE = 'src/app/(shell)/hr/rate-tables/page.tsx';
const HR_PAGE = 'src/app/(shell)/hr/page.tsx';
const VOICE_LIB = 'src/lib/hr/payroll/error-voice.ts';

const read = (p: string) => readFileSync(join(ROOT, p), 'utf8');

const D = (s: string) => new Date(s);

describe('rateTableWindowCovers — the engine\u2019s own window law', () => {
  it('a table whose window contains the date covers it', () => {
    const t = { effectiveFrom: '2026-01-01', effectiveTo: '2026-06-30' };
    expect(rateTableWindowCovers(t, D('2026-03-15'))).toBe(true);
    expect(rateTableWindowCovers(t, D('2026-01-01'))).toBe(true);
    expect(rateTableWindowCovers(t, D('2026-06-30'))).toBe(true);
  });

  it('the boundaries refuse the day after and the day before (engine parity)', () => {
    const t = { effectiveFrom: '2026-01-01', effectiveTo: '2026-06-30' };
    expect(rateTableWindowCovers(t, D('2026-07-01'))).toBe(false);
    expect(rateTableWindowCovers(t, D('2025-12-31'))).toBe(false);
  });

  it('an open effectiveTo never ends', () => {
    const t = { effectiveFrom: '2026-01-01', effectiveTo: null };
    expect(rateTableWindowCovers(t, D('2027-12-31'))).toBe(true);
  });
});

describe('rateTableStatus — the chip is a pure function of now', () => {
  it('SCHEDULED before the window begins', () => {
    expect(rateTableStatus({ effectiveFrom: '2027-01-01', effectiveTo: null }, D('2026-10-31'))).toBe('SCHEDULED');
  });
  it('ACTIVE within the window', () => {
    expect(rateTableStatus({ effectiveFrom: '2026-01-01', effectiveTo: null }, D('2026-10-31'))).toBe('ACTIVE');
    expect(rateTableStatus({ effectiveFrom: '2026-01-01', effectiveTo: '2027-01-01' }, D('2026-10-31'))).toBe('ACTIVE');
  });
  it('CLOSED after the window ends', () => {
    expect(rateTableStatus({ effectiveFrom: '2025-01-01', effectiveTo: '2026-01-01' }, D('2026-10-31'))).toBe('CLOSED');
  });
});

describe('rateTableWindowsIntersect + rateTableOverlapMap — the overlap law', () => {
  const mk = (id: string, type: string, code: string, effectiveFrom: string, effectiveTo: string | null) =>
    ({ id, type, code, effectiveFrom, effectiveTo, label: code });

  it('two same-code windows sharing any date intersect', () => {
    const a = mk('a', 'PAYE', '2026', '2026-01-01', '2026-06-30');
    const b = mk('b', 'PAYE', '2026', '2026-06-01', null);
    expect(rateTableWindowsIntersect(a, b)).toBe(true);
  });

  it('touching windows intersect too — BOTH answer for the boundary date (engine parity)', () => {
    const a = mk('a', 'PAYE', '2026', '2026-01-01', '2026-06-30');
    const b = mk('b', 'PAYE', '2026', '2026-06-30', null);
    // The engine counts both as candidates on 2026-06-30 (effectiveTo >= date
    // AND effectiveFrom <= date) and throws OVERLAPPING_RATE_TABLES — so the
    // write-time guard refuses the touching pair the same way.
    expect(rateTableWindowsIntersect(a, b)).toBe(true);
  });

  it('back-to-back windows never intersect (the legal versioning seam)', () => {
    const a = mk('a', 'PAYE', '2026', '2026-01-01', '2026-06-30');
    const b = mk('b', 'PAYE', '2026', '2026-07-01', null);
    expect(rateTableWindowsIntersect(a, b)).toBe(false);
  });

  it('different codes of one type never overlap (the versioning mechanism)', () => {
    const a = mk('a', 'PAYE', '2025', '2026-01-01', null);
    const b = mk('b', 'PAYE', '2026', '2026-01-01', null);
    expect(rateTableOverlapMap([a, b]).size).toBe(0);
  });

  it('different types never overlap, whatever the window', () => {
    const a = mk('a', 'PAYE', '2026', '2026-01-01', null);
    const b = mk('b', 'SHIF', '2026', '2026-01-01', null);
    expect(rateTableOverlapMap([a, b]).size).toBe(0);
  });

  it('the map is symmetric and complete for a three-way pile-up', () => {
    const a = mk('a', 'SHIF', 'x', '2026-01-01', null);
    const b = mk('b', 'SHIF', 'x', '2026-02-01', null);
    const c = mk('c', 'SHIF', 'x', '2026-03-01', null);
    const map = rateTableOverlapMap([a, b, c]);
    expect(map.get('a')).toHaveLength(2);
    expect(map.get('b')).toHaveLength(2);
    expect(map.get('c')).toHaveLength(2);
  });
});

describe('isoDayAfter — UTC day arithmetic', () => {
  it('the day after a UTC midnight is that midnight + 1', () => {
    expect(isoDayAfter(D('2026-06-30T00:00:00Z'))).toBe('2026-07-01');
  });
  it('month and year boundaries walk cleanly', () => {
    expect(isoDayAfter(D('2026-12-31T00:00:00Z'))).toBe('2027-01-01');
  });
});

describe('RATE_TABLE_TYPES — the known list', () => {
  it('the engine\u2019s six required types all ride the known list', () => {
    for (const t of ['PAYE', 'PERSONAL_RELIEF', 'NSSF_TIER1', 'NSSF_TIER2', 'SHIF', 'HOUSING_LEVY']) {
      expect(RATE_TABLE_TYPES).toContain(t);
    }
  });
});

describe('the keeper — the byte net (custody chain)', () => {
  it('the service owns BOTH mutations; the routes never touch Prisma', () => {
    const svc = read(SERVICE);
    expect(svc).toContain('export async function createRateTable');
    expect(svc).toContain('export async function closeRateTable');
    expect(svc).toContain('export class RateTableError');
    for (const route of [read(ROUTE), read(ID_ROUTE)]) {
      expect(route).toContain('rate-table-service');
      expect(route).not.toContain('db.rateTable.create');
      expect(route).not.toContain('db.rateTable.update');
    }
  });

  it('every mutation writes the hash-chained audit row (spec rule 15)', () => {
    const svc = read(SERVICE);
    expect(svc).toContain("action: 'RATE_TABLE_CREATED'");
    expect(svc).toContain("action: 'RATE_TABLE_CLOSED'");
    expect(svc).toContain('HrEntityType.RATE_TABLE');
  });

  it('the insert guard replicates the engine\u2019s overlap law at write time', () => {
    const svc = read(SERVICE);
    expect(svc).toContain('THE OVERLAP GUARD (engine parity, write-time)');
    expect(svc).toContain('rateTableWindowsIntersect(candidate, s)');
    expect(svc).toContain("'OVERLAPPING_RATE_TABLES'");
  });

  it('the close only shrinks a window (insert-only versioning, never deletion)', () => {
    const svc = read(SERVICE);
    expect(svc).toContain('a close cannot extend a window');
    expect(svc).toContain('The close date falls before the table began');
    expect(svc).not.toContain('.delete(');
  });

  it('the write routes gate on hr.rate-table.manage (SUPER_ADMIN, fail-closed)', () => {
    expect(read(ROUTE)).toContain("export const POST = hrGuard('hr.rate-table.manage')");
    expect(read(ID_ROUTE)).toContain("export const PATCH = hrGuard('hr.rate-table.manage')");
  });

  it('GET answers the management desk with ?scope=all (default unchanged)', () => {
    const route = read(ROUTE);
    expect(route).toContain("url.searchParams.get('scope') === 'all'");
    expect(route).toContain("hrGuard('hr.employee.read.own_branch', READ_ROLES)");
  });

  it('the desk\u2019s chips run the SAME pure window law (no second implementation)', () => {
    const page = read(PAGE);
    expect(page).toContain("from '@/lib/hr/rate-table-view'");
    expect(page).toContain('rateTableOverlapMap(tables ?? [])');
    expect(page).toContain('rateTableStatus(t, now)');
  });

  it('the page gates its write affordances on the role the session reports', () => {
    const page = read(PAGE);
    expect(page).toContain("fetch('/api/auth/me'");
    expect(page).toContain("role === 'SUPER_ADMIN'");
    expect(page).toContain('data-testid="rate-tables-create"');
    expect(page).toContain('data-testid="rate-table-close"');
  });

  it('the dialogs speak the service\u2019s refusal verbatim', () => {
    const page = read(PAGE);
    expect(page).toContain('j?.error ||');
    expect(page).toContain('role="alert"');
  });

  it('the /hr tile carries its Manage door to the keeper', () => {
    const hr = read(HR_PAGE);
    expect(hr).toContain('data-testid="hr-rate-tables-door"');
    expect(hr).toContain('href="/hr/rate-tables"');
  });

  it('the promoted doors walk to the keeper (the promise kept)', () => {
    const voice = read(VOICE_LIB);
    expect(voice).toContain("RATE_TABLE_DESK_HREF = '/hr/rate-tables'");
    expect(voice).toContain("case 'RATE_TABLE_MISSING':");
    expect(voice).toContain("case 'OVERLAPPING_RATE_TABLES':");
    for (const code of ['RATE_TABLE_MISSING', 'OVERLAPPING_RATE_TABLES']) {
      const door = payrollIssueDoor(code, 'emp-1');
      expect(door).not.toBeNull();
      expect(door?.href).toBe('/hr/rate-tables');
      expect(door?.label).toBe('Rate tables');
    }
  });

  it('the door decision stays TOTAL over every guardrail code', () => {
    for (const code of GUARDRAIL_CODES) {
      const door = payrollIssueDoor(code, 'emp-1');
      if (door !== null) {
        expect(door.href).toMatch(/^\//);
      }
    }
  });

  it('the view lib stays PURE (no Prisma, no React, no network)', () => {
    const src = read(VIEW_LIB);
    expect((src.match(/^import /gm) || []).length).toBe(0);
    expect(src).not.toMatch(/@prisma|from 'react'|fetch\(|axios/i);
  });
});
