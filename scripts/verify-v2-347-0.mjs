#!/usr/bin/env node
// verify-v2-347-0.mjs — the round's FEATURE gate (v2.347.0 "the tier
// lifecycle completes"). The release MECHANICS live in verify-current.mjs.
// This script pins only what is NEW this round.
// Every check reads the SOURCE OF RECORD (bytes, not memory) — THE OD LAW.
// Run BEFORE the walk; the walk-dependent pins sit in their own tail
// section (green after walk-v2347).
import { readFileSync } from 'node:fs';

let pass = 0, fail = 0;
const ok = (name, cond) => {
  if (cond) { pass++; console.log(`  ok  ${name}`); }
  else { fail++; console.error(`x FAIL ${name}`); }
};
const read = (p) => readFileSync(p, 'utf8');

const idRoute = read('src/app/api/loyalty/tiers/[id]/route.ts');
const api = read('src/lib/api.ts');
const desk = read('src/app/(shell)/tabs/loyalty-tab.tsx');
const whatsNew = read('src/lib/whats-new.ts');
const changelog = read('CHANGELOG.md');
const changelogTest = read('src/tests/console-changelog.test.ts');
const test = read('src/tests/tier-lifecycle-completes-v2347.test.ts');
const pkg = JSON.parse(read('package.json'));

console.log('— the tier lifecycle completes —');
ok('THE PREFILL DOOR EXISTS: GET rides the family read gate (five roles)',
  idRoute.includes('async function getLoyaltyTierHandler(...args: unknown[]): Promise<Response>')
  && idRoute.includes("roles: ['SUPER_ADMIN', 'STORE_OWNER', 'BRANCH_MANAGER', 'CASHIER', 'ACCOUNTANT'],")
  && idRoute.includes("'LOYALTY_TIER_READ',"));
ok('THE PREFILL ANSWERS THE TALLY: the GET include carries the member count',
  idRoute.includes('include: { _count: { select: { customerTiers: true } } },')
  && idRoute.includes('return Response.json({ success: true, data: tier });'));
ok('NO EXISTENCE LEAK for every verb: the same-404 guard rides three times',
  idRoute.split('!existing || (session.storeId && existing.storeId !== session.storeId)').length === 2
  && idRoute.split('!tier || (session.storeId && tier.storeId !== session.storeId)').length === 3
  && idRoute.split('Loyalty tier not found.').length === 4);
ok('THE GUARDED RETIREMENT EXISTS: DELETE mirrors the create gate + the system log speaks',
  idRoute.includes('async function deleteLoyaltyTierHandler(...args: unknown[]): Promise<Response>')
  && idRoute.includes("'LOYALTY_TIER_DELETE',")
  && idRoute.includes('LOYALTY_TIER_DELETED'));
ok('THE MEMBER-COUNT GUARD: the populated tier is refused with the reassignment voice',
  idRoute.includes('if (memberCount > 0) {')
  && idRoute.includes("const unit = memberCount === 1 ? 'member' : 'members';")
  && idRoute.includes('This tier still holds ${memberCount} ${unit} — reassign them to another tier before deleting.')
  && idRoute.includes('{ status: 409 },'));
ok('the retirement answers the row it retired',
  idRoute.includes('const deleted = await db.loyaltyTier.delete({ where: { id } });')
  && idRoute.includes('return Response.json({ success: true, data: deleted });'));
ok('the PUT era holds: the update door stands unchanged beside the new verbs',
  idRoute.includes('async function updateLoyaltyTierHandler(...args: unknown[]): Promise<Response>')
  && idRoute.includes("'LOYALTY_TIER_UPDATE',"));
ok('api.ts gains tiers.get + tiers.remove (the prefill read, the guarded DELETE)',
  api.includes('get: async (id: string) => {')
  && api.includes('remove: async (id: string) => {')
  && api.includes("return request<LoyaltyTierItem>(`/loyalty/tiers/${id}`);")
  && api.includes("method: 'DELETE',"));
ok('THE DESK ASKS: the retirement mutation rides remove() and toasts its own voice',
  desk.includes('const deleteTierMutation = useMutation({')
  && desk.includes('mutationFn: (id: string) => loyaltyApi.tiers.remove(id),')
  && desk.includes("toast.success('Tier deleted successfully')"));
ok('THE PREFILL DOOR AT WORK: the confirm reads the wire before it offers the confirm',
  desk.includes("queryKey: ['loyalty-tier-fresh', deleteTierTarget?.id],")
  && desk.includes("if (!deleteTierTarget) throw new Error('No tier selected.');")
  && desk.includes('enabled: !!deleteTierTarget,')
  && desk.includes('retry: false,')
  && desk.includes("toast.error(err instanceof Error ? err.message : 'Loyalty tier not found.');"));
ok('THE BLOCKER TALLY: the fresh count decides, the list slice only bridges the flight',
  desk.includes('const freshMemberTally = freshDeleteTier?._count?.customerTiers;')
  && desk.includes('const deleteBlockerTally = freshMemberTally ?? deleteTierTarget?._count?.customerTiers ?? 0;'));
ok('THE BLOCKER LINE: the confirm sits disabled behind the mirrored 409 voice',
  desk.includes('data-testid="tier-delete-blocked"')
  && desk.includes('data-testid="tier-delete-reading"')
  && desk.includes('This tier still holds {deleteBlockerTally}')
  && desk.includes('reassign them to another tier before deleting.')
  && desk.includes('disabled={deleteBlockerTally > 0 || deleteTierMutation.isPending}'));
ok('THE RETIREMENT AFFORDANCE: the rose-tinted trash rides the card beside the edit pen',
  desk.includes('data-testid="tier-delete"')
  && desk.includes('text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:text-rose-400 dark:hover:bg-rose-950/40')
  && desk.includes('<Trash2 className="h-3.5 w-3.5" />'));
ok('THE MEMBERS TALLY VOICE: the figure speaks what it means for the retirement',
  desk.includes('data-testid="tier-member-count"')
  && desk.includes('className="font-semibold tabular-nums"')
  && desk.includes('deleting it requires a reassignment first.'));
ok('the era test carries the completion (15 pins, the OD law)',
  test.includes('THE PREFILL DOOR EXISTS') && test.includes('THE GUARDED RETIREMENT EXISTS')
  && test.includes('THE MEMBER-COUNT GUARD') && test.includes('THE BLOCKER LINE'));

console.log('— the release mechanics —');
ok('VERSION + package.json three slots at 2.347.0',
  read('VERSION').trim() === '2.347.0'
  && pkg.version === '2.347.0'
  && pkg.mbumah.releaseVersion === '2.347.0'
  && pkg.mbumah.baseVersion === '2.347.0');
ok('the whats-new entry rides the feed',
  whatsNew.includes("version: '2.347.0',")
  && whatsNew.includes("title: 'The tier lifecycle completes',"));
ok('the changelog leads with the round',
  changelog.startsWith('## [2.347.0] The tier lifecycle completes\n'));
ok('verify:v2-347-0 is wired',
  (pkg.scripts['verify:v2-347-0'] || '').includes('verify-v2-347-0.mjs'));

console.log('— the walk-dependent pins (green after walk-v2347) —');
ok('the unread-counter cascade landed (238/239/240/271)',
  changelogTest.includes("whatsNewUnreadCount('2.110.0')).toBe(238)")
  && changelogTest.includes("whatsNewUnreadCount('2.109.0')).toBe(239)")
  && changelogTest.includes("whatsNewUnreadCount('2.108.0')).toBe(240)")
  && changelogTest.includes("whatsNewUnreadCount('2.77.0')).toBe(271)"));
ok('the history line rides the cascade block',
  changelogTest.includes('v2.347.0: the lifecycle-completes entry joins the feed'));

console.log(`\nverify-v2-347-0: ${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
