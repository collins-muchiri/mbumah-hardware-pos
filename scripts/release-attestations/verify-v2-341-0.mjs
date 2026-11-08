#!/usr/bin/env node
// verify-v2-341-0.mjs — the round's FEATURE gate (v2.341.0 "the loyalty
// and tax doors speak their bodies' shapes"). The release MECHANICS live
// in verify-current.mjs. This script pins only what is NEW this round.
// Every check reads the SOURCE OF RECORD (bytes, not memory) — THE OD
// LAW. Run BEFORE the walk; the last two pins pass only AFTER walk-v2341.
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

let pass = 0, fail = 0;
const ok = (name, cond) => {
  if (cond) { pass++; console.log(`  ok  ${name}`); }
  else { fail++; console.error(`x FAIL ${name}`); }
};
const read = (p) => readFileSync(p, 'utf8');

function walkApi(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) out.push(...walkApi(full));
    else if (name.endsWith('.ts')) out.push(full);
  }
  return out;
}

const API_FILES = walkApi('src/app/api');
const BARE = API_FILES.filter((f) => /readJsonBody\(request\)/.test(read(f)));
const campaigns = read('src/app/api/loyalty/campaigns/route.ts');
const tiers = read('src/app/api/loyalty/tiers/route.ts');
const ledger = read('src/app/api/loyalty/transactions/route.ts');
const categories = read('src/app/api/tax/categories/route.ts');
const filings = read('src/app/api/tax/filings/route.ts');
const helper = read('src/lib/request-body.ts');
const desk = read('src/app/(shell)/tabs/loyalty-tab.tsx');
const whatsNew = read('src/lib/whats-new.ts');
const changelog = read('CHANGELOG.md');
const changelogTest = read('src/tests/console-changelog.test.ts');
const pkg = JSON.parse(read('package.json'));

console.log('— the bare class falls 25 → 20 —');
ok('exactly 20 bare doors remain', BARE.length === 20);
ok('the five loyalty + tax doors left the census',
  !BARE.includes('src/app/api/loyalty/campaigns/route.ts') &&
  !BARE.includes('src/app/api/loyalty/tiers/route.ts') &&
  !BARE.includes('src/app/api/loyalty/transactions/route.ts') &&
  !BARE.includes('src/app/api/tax/categories/route.ts') &&
  !BARE.includes('src/app/api/tax/filings/route.ts'));
ok('the five HR doors stay out (no regressions)',
  !BARE.includes('src/app/api/attendance/route.ts') &&
  !BARE.includes('src/app/api/employees/route.ts') &&
  !BARE.includes('src/app/api/leave-types/route.ts') &&
  !BARE.includes('src/app/api/shifts/route.ts') &&
  !BARE.includes('src/app/api/shifts/[id]/end/route.ts'));
ok('the loose-Record era stays over (no regressions)',
  !API_FILES.some((f) => read(f).includes('readJsonBody<Record<string, unknown>>')));
ok('the re-cast class stays gone',
  !API_FILES.some((f) => /door\.body as [A-Z]/.test(read(f))));
ok('the door default itself is untouched (the any law, documented, lint-clean)',
  helper.includes('export async function readJsonBody<T = any>(') &&
  helper.includes('eslint-disable-next-line @typescript-eslint/no-explicit-any'));

console.log('— the per-file honest bytes —');
ok('campaigns: the pair REQUIRED + the columns + the validTypes validator',
  campaigns.includes('storeId: string;') && campaigns.includes('name: string;') &&
  campaigns.includes('campaignType?: string;') && campaigns.includes('bonusPoints?: number;') &&
  campaigns.includes('multiplier?: number;') && campaigns.includes('startDate?: string;') &&
  campaigns.includes('targetTierId?: string;'));
ok('tiers: minPoints OPTIONAL under the equality guard + maxPoints number | null',
  tiers.includes('minPoints?: number;') && tiers.includes('maxPoints?: number | null;') &&
  tiers.includes('discountPercent?: number;') && tiers.includes('pointsMultiplier?: number;') &&
  tiers.includes('benefits?: string;') && tiers.includes('sortOrder?: number;') &&
  tiers.includes('minPoints === undefined'));
ok('transactions: the pair REQUIRED + the FIRST REQUIRED unknown',
  ledger.includes('storeId: string;') && ledger.includes('customerId: string;') &&
  ledger.includes('points: unknown;') && ledger.includes('transactionType?: string;') &&
  ledger.includes('reference?: string;') && ledger.includes('referenceId?: string;') &&
  ledger.includes('const pointsValue = parseInt(String(points));'));
ok('tax/categories: rate OPTIONAL under the equality guard + the 0..100 comparison',
  categories.includes('rate?: number;') && categories.includes('rate === undefined') &&
  categories.includes('rate must be between 0 and 100.'));
ok('tax/filings: the trio REQUIRED + the declared trio string | number',
  filings.includes('filingPeriod: string;') && filings.includes('filingType: string;') &&
  filings.includes('totalSales?: string | number;') && filings.includes('totalTax?: string | number;') &&
  filings.includes('totalWht?: string | number;') && filings.includes('filingDate?: string;') &&
  filings.includes('filedBy?: string;'));

console.log('— the law doc carries the round —');
ok('request-body.ts records the loyalty + tax pass (history keeps the 25)',
  helper.includes("v2.341.0 — THE LOYALTY + TAX FAMILIES, the bare class's second pass") &&
  helper.includes('the door\u2019s FIRST'.replace('\u2019', "'")) &&
  helper.includes('Money.tryParse') &&
  helper.includes('falls to 20 doors') &&
  helper.includes('falls to 25 doors'));

console.log('— the styling face —');
ok('the tier-progress meter draws against the bracket (the honest aria voice)',
  desk.includes('data-testid="tier-progress-meter"') &&
  desk.includes('role="progressbar"') &&
  desk.includes('aria-valuemin={0}') &&
  desk.includes('aria-valuemax={100}') &&
  desk.includes('aria-valuenow={progress}') &&
  desk.includes('Tier progress: '));
ok('the fill steps through the three voices (sky / amber / emerald)',
  desk.includes("progress >= 75 ? 'bg-emerald-500' : progress >= 25 ? 'bg-amber-500' : 'bg-sky-500'"));
ok('the bare Progress left the desk',
  !desk.includes('<Progress') && !desk.includes("from '@/components/ui/progress'"));
ok('the helper returns the bracket it draws',
  desk.includes('progress: number; gained: number; range: number }') &&
  desk.includes('return { tier: currentTier, nextTier, progress, gained, range };'));

console.log('— the release mechanics —');
ok('whats-new carries 2.341.0 (the raw-escape bytes)',
  whatsNew.includes("version: '2.341.0'") &&
  whatsNew.includes('bodies\\u2019 shapes') &&
  whatsNew.includes('\\u201c750 of 1,000 points to GOLD (75%)\\u201d'));
ok('CHANGELOG carries the 2.341.0 head', changelog.includes('## [2.341.0]'));
ok('VERSION and package.json speak 2.341.0 in all three slots',
  read('VERSION').trim() === '2.341.0' &&
  pkg.version === '2.341.0' &&
  pkg.mbumah.releaseVersion === '2.341.0' &&
  pkg.mbumah.baseVersion === '2.341.0');

console.log('— the walk-dependent pins (green after walk-v2341) —');
ok('the unread-counter cascade landed (232/233/234/265)',
  changelogTest.includes("whatsNewUnreadCount('2.110.0')).toBe(232)") &&
  changelogTest.includes("whatsNewUnreadCount('2.109.0')).toBe(233)") &&
  changelogTest.includes("whatsNewUnreadCount('2.108.0')).toBe(234)") &&
  changelogTest.includes("whatsNewUnreadCount('2.77.0')).toBe(265)"));
ok('the history line rides the cascade block',
  changelogTest.includes('v2.341.0: the loyalty-tax entry joins the feed'));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
