#!/usr/bin/env node
// verify-v2-346-0.mjs — the round's FEATURE gate (v2.346.0 "the tier
// lifecycle, honestly"). The release MECHANICS live in verify-current.mjs.
// This script pins only what is NEW this round.
// Every check reads the SOURCE OF RECORD (bytes, not memory) — THE OD LAW.
// Run BEFORE the walk; the walk-dependent pins sit in their own tail
// section (green after walk-v2346).
import { readFileSync } from 'node:fs';

let pass = 0, fail = 0;
const ok = (name, cond) => {
  if (cond) { pass++; console.log(`  ok  ${name}`); }
  else { fail++; console.error(`x FAIL ${name}`); }
};
const read = (p) => readFileSync(p, 'utf8');

const create = read('src/app/api/loyalty/tiers/route.ts');
const update = read('src/app/api/loyalty/tiers/[id]/route.ts');
const api = read('src/lib/api.ts');
const desk = read('src/app/(shell)/tabs/loyalty-tab.tsx');
const whatsNew = read('src/lib/whats-new.ts');
const changelog = read('CHANGELOG.md');
const changelogTest = read('src/tests/console-changelog.test.ts');
const test = read('src/tests/tier-lifecycle-v2346.test.ts');
const pkg = JSON.parse(read('package.json'));

console.log('— the tier lifecycle, honestly —');
ok('THE SWALLOW ENDS: the create door names isActive; the absence keeps the schema default',
  create.includes('isActive?: boolean;') && create.includes('isActive,') && create.includes('isActive: isActive ?? true,')
  && !create.includes('isActive: true,'));
ok('THE UPDATE DOOR EXISTS with the body door (all-optional, no bare call)',
  update.includes('await readJsonBody<{') && update.includes('bodyDoorRejected()')
  && !/readJsonBody\(request\)/.test(update));
ok('BOTH VOICES on the update door: its own 400s live beside the door',
  update.includes('minPoints must be 0 or greater.')
  && update.includes('discountPercent must be between 0 and 100.')
  && update.includes('pointsMultiplier must be greater than 0.'));
ok('NO EXISTENCE LEAK: missing id and foreign-store id answer the same 404',
  update.includes('!existing || (session.storeId && existing.storeId !== session.storeId)')
  && update.includes('Loyalty tier not found.'));
ok('the update writes ONLY what the body carries (conditional spread, the null maxPoints ceiling)',
  update.includes('...(name !== undefined && { name }),')
  && update.includes('...(isActive !== undefined && { isActive }),')
  && update.includes('maxPoints: maxPoints === null ? null : parseInt(String(maxPoints)),'));
ok('the handler rides the house variadic pattern (session is args[1], context is args[2])',
  update.includes('async function updateLoyaltyTierHandler(...args: unknown[]): Promise<Response>')
  && update.includes('const session = args[1] as AuthSession;')
  && update.includes('const context = args[2] as RouteContext;'));
ok('RBAC mirrors the family create gate + the system log speaks',
  update.includes("roles: ['SUPER_ADMIN', 'STORE_OWNER'],")
  && update.includes("'LOYALTY_TIER_UPDATE',") && update.includes('LOYALTY_TIER_UPDATED'));
ok('api.ts gains tiers.update (the PUT, the honest optionals)',
  api.includes("update: async (id: string, data: { name?: string; minPoints?: number; maxPoints?: number | null; discountPercent?: number; pointsMultiplier?: number; benefits?: string; color?: string; icon?: string; sortOrder?: number; isActive?: boolean }) => {")
  && api.includes("method: 'PUT',"));
ok('THE DESK BRANCHES HONESTLY: an edit PUTs, a create POSTs, toasts speak apart',
  desk.includes('const updateTierMutation = useMutation({')
  && desk.includes('loyaltyApi.tiers.update(id, data),')
  && desk.includes('if (editingTier) {')
  && desk.includes("toast.success('Tier updated successfully')"));
ok('THE MUTED FACE: the inactive tier card wears its lifecycle state',
  desk.includes('data-testid="tier-card"')
  && desk.includes('data-tier-active={String(tier.isActive)}')
  && desk.includes('opacity-60 grayscale-[0.4]'));
ok('the stale-edit life is safe: openCreateTier clears the edit target (order-agnostic slice)',
  (() => {
    const start = desk.indexOf('function openCreateTier()');
    const nextFn = desk.indexOf('\n  function ', start + 1);
    const openCreate = desk.slice(start, nextFn === -1 ? undefined : nextFn);
    return openCreate.includes('setEditingTier(null)') && desk.includes('THE STALE-EDIT GUARD');
  })());
ok('the era test carries the lifecycle (11 pins, the OD law)',
  test.includes('THE SWALLOW ENDS') && test.includes('THE UPDATE DOOR EXISTS')
  && test.includes('NO EXISTENCE LEAK') && test.includes('THE MUTED FACE'));

console.log('— the release mechanics —');
ok('VERSION + package.json three slots at 2.346.0',
  read('VERSION').trim() === '2.346.0'
  && pkg.version === '2.346.0'
  && pkg.mbumah.releaseVersion === '2.346.0'
  && pkg.mbumah.baseVersion === '2.346.0');
ok('the whats-new entry rides the feed',
  whatsNew.includes("version: '2.346.0',")
  && whatsNew.includes("title: 'The tier lifecycle, honestly',"));
ok('the changelog leads with the round',
  changelog.startsWith('## [2.346.0] The tier lifecycle, honestly\n'));
ok('verify:v2-346-0 is wired',
  (pkg.scripts['verify:v2-346-0'] || '').includes('verify-v2-346-0.mjs'));

console.log('— the walk-dependent pins (green after walk-v2346) —');
ok('the unread-counter cascade landed (237/238/239/270)',
  changelogTest.includes("whatsNewUnreadCount('2.110.0')).toBe(237)")
  && changelogTest.includes("whatsNewUnreadCount('2.109.0')).toBe(238)")
  && changelogTest.includes("whatsNewUnreadCount('2.108.0')).toBe(239)")
  && changelogTest.includes("whatsNewUnreadCount('2.77.0')).toBe(270)"));
ok('the history line rides the cascade block',
  changelogTest.includes('v2.346.0: the tier-lifecycle entry joins the feed'));

console.log(`\nverify-v2-346-0: ${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
