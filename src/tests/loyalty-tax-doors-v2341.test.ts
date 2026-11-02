import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'path';
import { describe, it, expect } from 'vitest';

// ---------------------------------------------------------------------------
// v2.341.0 — THE LOYALTY + TAX FAMILIES, the bare class's second pass.
//
// The five loyalty and tax reads (campaigns, tiers, transactions,
// tax categories, tax filings) stop reading their bodies as the door's
// default `any` and speak their own shapes:
//   • the truthiness-guarded fields ride REQUIRED strings — the route's
//     own guard is the runtime validator (campaigns' pair, transactions'
//     pair, filings' trio);
//   • the figures under the routes' own `=== undefined` equality guards
//     (tiers' minPoints, categories' rate) ride OPTIONAL numbers — a
//     REQUIRED door would turn the route's own guard into a dead
//     comparison; the comparison validators stay the runtime truth;
//   • maxPoints speaks number | null (the route handles both absences);
//   • the coerced reads stay honest under their own chains — points is
//     the door's FIRST REQUIRED unknown (the !points guard demands
//     presence, the String() + parseInt chain owns the widening) and the
//     filings' declared trio rides string | number (Money.tryParse's own
//     signature IS the widening).
//
// The bare class falls 25 → 20. THE OD LAW: every pin reads SOURCE bytes.
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

const FAMILY_DOORS = [
  'src/app/api/loyalty/campaigns/route.ts',
  'src/app/api/loyalty/tiers/route.ts',
  'src/app/api/loyalty/transactions/route.ts',
  'src/app/api/tax/categories/route.ts',
  'src/app/api/tax/filings/route.ts',
];

describe('THE BARE CLASS FALLS 25 → 20 (v2.341.0)', () => {
  it('exactly 20 bare doors remain', () => {
    expect(BARE.length).toBe(20);
  });

  it('the five loyalty + tax doors left the census', () => {
    for (const door of FAMILY_DOORS) {
      expect(BARE.includes(door)).toBe(false);
    }
  });

  it('the loose-Record era stays over (no regressions)', () => {
    expect(API_FILES.some((f) => read(f).includes('readJsonBody<Record<string, unknown>>'))).toBe(false);
  });

  it('the re-cast class stays gone', () => {
    expect(API_FILES.some((f) => /door\.body as [A-Z]/.test(read(f)))).toBe(false);
  });

  it('the law doc records the fall (history keeps the 25, the round note speaks 20)', () => {
    const home = read('src/lib/request-body.ts');
    expect(home.includes('falls to 20 doors')).toBe(true);
    // the v2.340.0 history note keeps its own count (release history never rewrites)
    expect(home.includes('falls to 25 doors')).toBe(true);
  });
});

describe('THE FIVE DOORS SPEAK THEIR OWN SHAPES', () => {
  it('campaigns: the pair rides REQUIRED, campaignType rides the validTypes validator, the columns ride the create data', () => {
    const src = read('src/app/api/loyalty/campaigns/route.ts');
    expect(src.includes('storeId: string;')).toBe(true);
    expect(src.includes('name: string;')).toBe(true);
    expect(src.includes('campaignType?: string;')).toBe(true);
    expect(src.includes('description?: string;')).toBe(true);
    expect(src.includes('bonusPoints?: number;')).toBe(true);
    expect(src.includes('multiplier?: number;')).toBe(true);
    expect(src.includes('startDate?: string;')).toBe(true);
    expect(src.includes('endDate?: string;')).toBe(true);
    expect(src.includes('targetTierId?: string;')).toBe(true);
    expect(src.includes('createdBy?: string;')).toBe(true);
    expect(/readJsonBody\(request\)/.test(src)).toBe(false);
    expect(src.includes('storeId and name are required.')).toBe(true);
  });

  it('tiers: minPoints rides an OPTIONAL number (the equality guard is the validator), maxPoints speaks number | null', () => {
    const src = read('src/app/api/loyalty/tiers/route.ts');
    expect(src.includes('storeId: string;')).toBe(true);
    expect(src.includes('name: string;')).toBe(true);
    expect(src.includes('minPoints?: number;')).toBe(true);
    expect(src.includes('maxPoints?: number | null;')).toBe(true);
    expect(src.includes('discountPercent?: number;')).toBe(true);
    expect(src.includes('pointsMultiplier?: number;')).toBe(true);
    expect(src.includes('benefits?: string;')).toBe(true);
    expect(src.includes('color?: string;')).toBe(true);
    expect(src.includes('icon?: string;')).toBe(true);
    expect(src.includes('sortOrder?: number;')).toBe(true);
    expect(/readJsonBody\(request\)/.test(src)).toBe(false);
    expect(src.includes('minPoints === undefined')).toBe(true);
    expect(src.includes('minPoints must be 0 or greater.')).toBe(true);
  });

  it('transactions: points is the FIRST REQUIRED unknown (the !points guard demands presence, the chain owns the widening)', () => {
    const src = read('src/app/api/loyalty/transactions/route.ts');
    expect(src.includes('storeId: string;')).toBe(true);
    expect(src.includes('customerId: string;')).toBe(true);
    expect(src.includes('points: unknown;')).toBe(true);
    expect(src.includes('transactionType?: string;')).toBe(true);
    expect(src.includes('reference?: string;')).toBe(true);
    expect(src.includes('referenceId?: string;')).toBe(true);
    expect(src.includes('description?: string;')).toBe(true);
    expect(src.includes('createdBy?: string;')).toBe(true);
    expect(/readJsonBody\(request\)/.test(src)).toBe(false);
    expect(src.includes('const pointsValue = parseInt(String(points));')).toBe(true);
    expect(src.includes('storeId, customerId, and points are required.')).toBe(true);
  });

  it('tax/categories: rate rides an OPTIONAL number under the equality guard, the 0..100 comparison validates', () => {
    const src = read('src/app/api/tax/categories/route.ts');
    expect(src.includes('storeId: string;')).toBe(true);
    expect(src.includes('name: string;')).toBe(true);
    expect(src.includes('rate?: number;')).toBe(true);
    expect(src.includes('description?: string;')).toBe(true);
    expect(src.includes('etimsCode?: string;')).toBe(true);
    expect(/readJsonBody\(request\)/.test(src)).toBe(false);
    expect(src.includes('rate === undefined')).toBe(true);
    expect(src.includes('rate must be between 0 and 100.')).toBe(true);
  });

  it('tax/filings: the trio rides REQUIRED, the declared trio rides string | number (Money.tryParse owns the widening)', () => {
    const src = read('src/app/api/tax/filings/route.ts');
    expect(src.includes('storeId: string;')).toBe(true);
    expect(src.includes('filingPeriod: string;')).toBe(true);
    expect(src.includes('filingType: string;')).toBe(true);
    expect(src.includes('totalSales?: string | number;')).toBe(true);
    expect(src.includes('totalTax?: string | number;')).toBe(true);
    expect(src.includes('totalWht?: string | number;')).toBe(true);
    expect(src.includes('filingDate?: string;')).toBe(true);
    expect(src.includes('dueDate?: string;')).toBe(true);
    expect(src.includes('etimsReference?: string;')).toBe(true);
    expect(src.includes('notes?: string;')).toBe(true);
    expect(src.includes('filedBy?: string;')).toBe(true);
    expect(/readJsonBody\(request\)/.test(src)).toBe(false);
    expect(src.includes('storeId, filingPeriod, and filingType are required.')).toBe(true);
  });
});

describe('THE LAW DOC CARRIES THE ROUND', () => {
  it('request-body.ts records the loyalty + tax family pass', () => {
    const home = read('src/lib/request-body.ts');
    expect(home.includes("v2.341.0 — THE LOYALTY + TAX FAMILIES, the bare class's second pass")).toBe(true);
    expect(home.includes("the door's FIRST")).toBe(true);
    expect(home.includes('Money.tryParse')).toBe(true);
  });
});

describe('THE STYLING FACE — the tier-progress meter (the seventh desk)', () => {
  const desk = () => read('src/app/(shell)/tabs/loyalty-tab.tsx');

  it('the meter draws against the bracket with the honest aria voice', () => {
    const src = desk();
    expect(src.includes('data-testid="tier-progress-meter"')).toBe(true);
    expect(src.includes('role="progressbar"')).toBe(true);
    expect(src.includes('aria-valuemin={0}')).toBe(true);
    expect(src.includes('aria-valuemax={100}')).toBe(true);
    expect(src.includes('aria-valuenow={progress}')).toBe(true);
    expect(src.includes('Tier progress: ')).toBe(true);
    expect(src.includes(' points to ')).toBe(true);
    expect(src.includes('(${progress}%)`')).toBe(true);
    expect(src.includes('title={`${gained.toLocaleString()} of ${range.toLocaleString()} points to ${nextTier.name} — ${progress}%`}')).toBe(true);
    expect(src.includes("className=\"h-1 w-full rounded-full bg-muted overflow-hidden\"")).toBe(true);
    expect(src.includes('style={{ width: `${progress}%` }}')).toBe(true);
  });

  it('the fill steps through THREE honest voices (sky / amber / emerald)', () => {
    const src = desk();
    expect(src.includes("progress >= 75 ? 'bg-emerald-500' : progress >= 25 ? 'bg-amber-500' : 'bg-sky-500'")).toBe(true);
  });

  it('the bare Progress left the desk (the honest meter replaced it)', () => {
    const src = desk();
    expect(src.includes('<Progress')).toBe(false);
    expect(src.includes("from '@/components/ui/progress'")).toBe(false);
  });

  it('the helper returns the bracket it draws (gained + range ride the return, progress keeps its math)', () => {
    const src = desk();
    expect(src.includes('progress: number; gained: number; range: number }')).toBe(true);
    expect(src.includes('return { tier: currentTier, nextTier, progress, gained, range };')).toBe(true);
    expect(src.includes('Math.min(100, Math.round((loyaltyPoints / nextTier.minPoints) * 100))')).toBe(true);
  });
});
