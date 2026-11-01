// THE DOORS TIGHTENED (v2.334.0): the 20-file swallow census no longer
// speaks `Record<string, unknown>` or the default `any`.
//
// v2.325-327 built the body door and classified every body read; the
// census's 20 silent-proceed doors read through `readJsonBody` but
// their generics defaulted to `Record<string, unknown>` (or, for the
// one bare caller, the `any` law). v2.334.0 is the sanctioned per-file
// generic tightening: every door's generic now names the fields its
// handler actually consumes — the service's own input type where one
// exists (`AssetUpdateInput`, `GoalUpdateInput`, `CaseUpdateInput`,
// `ReviewUpdateInput`, or `Parameters<typeof serviceFn>[n]` — the door
// cannot drift from the handler it feeds), and an honest literal where
// the route dispatches first (the cycles door speaks `action` +
// `calibrationNotes`; the erasure decision doors speak exactly the
// fields they String()-coerce; data-exports speaks its six fields with
// `filters` still unknown because the route's own typeof dispatch is
// its validator).
//
// Pins: the zero-loose-generic census (all 20 files), the door bytes
// still intact (the marker, the 400 voice), the specific tightened
// generics per file, the law doc's v2.334.0 note, and the quick-chip
// keyboard focus rings (the round's styling face).

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';

const CENSUS_FILES = [
  'src/app/api/hr/assets/[id]/route.ts',
  'src/app/api/hr/assets/route.ts',
  'src/app/api/hr/goals/[id]/route.ts',
  'src/app/api/hr/goals/route.ts',
  'src/app/api/hr/discipline/[id]/route.ts',
  'src/app/api/hr/discipline/route.ts',
  'src/app/api/hr/performance/cycles/[id]/route.ts',
  'src/app/api/hr/performance/cycles/route.ts',
  'src/app/api/hr/performance/reviews/[id]/route.ts',
  'src/app/api/hr/performance/reviews/route.ts',
  'src/app/api/hr/privacy/consent/grant/route.ts',
  'src/app/api/hr/privacy/consent/withdraw/route.ts',
  'src/app/api/hr/privacy/erasure-requests/route.ts',
  'src/app/api/hr/privacy/erasure-requests/[id]/execute/route.ts',
  'src/app/api/hr/privacy/erasure-requests/[id]/reject/route.ts',
  'src/app/api/hr/privacy/legal-hold/route.ts',
  'src/app/api/hr/reports/schedules/[id]/route.ts',
  'src/app/api/hr/reports/schedules/route.ts',
  'src/app/api/self-service/me/leave/route.ts',
  'src/app/api/data-exports/route.ts',
];

const read = (p: string): string => readFileSync(p, 'utf8');
const census = CENSUS_FILES.map((p) => ({ path: p, src: read(p) }));

// ---------------------------------------------------------------------------
// 1. THE ZERO-LOOSE-GENERIC CENSUS
// ---------------------------------------------------------------------------

describe('the swallow census doors are tightened', () => {
  it('not one census door still speaks the loose Record generic', () => {
    const loose = census.filter((f) => f.src.includes('readJsonBody<Record<string, unknown>>'));
    expect(loose.map((f) => f.path)).toEqual([]);
  });

  it('not one census door still calls the door bare (the `any` law)', () => {
    const bare = census.filter((f) => /readJsonBody\(request\)/.test(f.src));
    expect(bare.map((f) => f.path)).toEqual([]);
  });

  it('all 20 still read through the door with the marker and the 400 voice', () => {
    for (const f of census) {
      expect(f.src.includes('readJsonBody')).toBe(true);
      expect(f.src.includes('bodyDoorRejected')).toBe(true);
      expect(f.src.includes('THE SWALLOW DOOR: an unreadable body is a client mistake (v2.327.0)')).toBe(true);
    }
  });

  it('the tightened doors no longer re-cast the body back to loose', () => {
    const recast = census.filter((f) => f.src.includes('door.body as Record<string, unknown>'));
    expect(recast.map((f) => f.path)).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// 2. THE DOOR SPEAKS THE HANDLER'S TRUTH (per-file generics)
// ---------------------------------------------------------------------------

describe('each door names the fields its handler consumes', () => {
  it('the create doors borrow the service signature itself (Parameters<typeof …>[n])', () => {
    expect(read('src/app/api/hr/assets/route.ts')).toContain(
      'readJsonBody<Parameters<typeof assignAsset>[0]>(request)'
    );
    expect(read('src/app/api/hr/goals/route.ts')).toContain(
      'readJsonBody<Parameters<typeof createGoal>[0]>(request)'
    );
    expect(read('src/app/api/hr/discipline/route.ts')).toContain(
      'readJsonBody<Parameters<typeof openCase>[0]>(request)'
    );
    expect(read('src/app/api/hr/performance/cycles/route.ts')).toContain(
      'readJsonBody<Parameters<typeof createCycle>[0]>(request)'
    );
    expect(read('src/app/api/hr/performance/reviews/route.ts')).toContain(
      'readJsonBody<Parameters<typeof createReview>[0]>(request)'
    );
    expect(read('src/app/api/hr/privacy/consent/grant/route.ts')).toContain(
      'readJsonBody<Parameters<typeof grantConsent>[0]>(request)'
    );
    expect(read('src/app/api/hr/privacy/consent/withdraw/route.ts')).toContain(
      'readJsonBody<Parameters<typeof withdrawConsent>[0]>(request)'
    );
    expect(read('src/app/api/hr/privacy/erasure-requests/route.ts')).toContain(
      'readJsonBody<Parameters<typeof createErasureRequest>[0]>(request)'
    );
    expect(read('src/app/api/hr/privacy/legal-hold/route.ts')).toContain(
      'readJsonBody<Parameters<typeof setLegalHold>[0]>(request)'
    );
    expect(read('src/app/api/self-service/me/leave/route.ts')).toContain(
      'readJsonBody<Parameters<typeof requestMyLeave>[2]>(request)'
    );
  });

  it('the update doors import the service\u2019s own exported input types', () => {
    expect(read('src/app/api/hr/assets/[id]/route.ts')).toContain('readJsonBody<AssetUpdateInput>(request)');
    expect(read('src/app/api/hr/goals/[id]/route.ts')).toContain('readJsonBody<GoalUpdateInput>(request)');
    expect(read('src/app/api/hr/discipline/[id]/route.ts')).toContain('readJsonBody<CaseUpdateInput>(request)');
    expect(read('src/app/api/hr/performance/reviews/[id]/route.ts')).toContain(
      'readJsonBody<ReviewUpdateInput>(request)'
    );
  });

  it('the dispatching doors speak honest literals (route-first fields included)', () => {
    // the cycles door dispatches on `action` AND feeds calibrationNotes
    expect(read('src/app/api/hr/performance/cycles/[id]/route.ts')).toContain(
      'readJsonBody<{ action?: unknown; calibrationNotes?: unknown }>(request)'
    );
    // the erasure decision doors speak exactly what they String()-coerce
    expect(read('src/app/api/hr/privacy/erasure-requests/[id]/execute/route.ts')).toContain(
      'readJsonBody<{ notes?: unknown }>(request)'
    );
    expect(read('src/app/api/hr/privacy/erasure-requests/[id]/reject/route.ts')).toContain(
      'readJsonBody<{ notes?: unknown; legalBasis?: unknown }>(request)'
    );
    // data-exports: three required strings, two date strings, free-form filters
    const exportsDoor = read('src/app/api/data-exports/route.ts');
    expect(exportsDoor).toContain('storeId?: string;');
    expect(exportsDoor).toContain('exportType?: string;');
    expect(exportsDoor).toContain('format?: string;');
    expect(exportsDoor).toContain('dateFrom?: string;');
    expect(exportsDoor).toContain('dateTo?: string;');
    expect(exportsDoor).toContain('filters?: unknown;');
  });
});

// ---------------------------------------------------------------------------
// 3. THE LAW DOC AND THE STYLING FACE
// ---------------------------------------------------------------------------

describe('the law doc carries the round; the chips answer the keyboard', () => {
  it('request-body.ts records the tightening (the doc meets the next reader)', () => {
    const helper = read('src/lib/request-body.ts');
    expect(helper.includes('v2.334.0 — THE DOORS TIGHTENED')).toBe(true);
    expect(helper.includes('The default `any` remains')).toBe(true);
    expect(helper.includes('export async function readJsonBody')).toBe(true);
  });

  it('the transactions quick chips carry keyboard focus rings (the violet family)', () => {
    const desk = read('src/app/(shell)/tabs/transactions-tab.tsx');
    expect(desk.includes('focus-visible:ring-2 focus-visible:ring-violet-400')).toBe(true);
    expect(desk.includes('focus-visible:ring-offset-1')).toBe(true);
  });
});
