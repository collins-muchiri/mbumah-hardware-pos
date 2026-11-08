#!/usr/bin/env node
// verify-v2-345-0.mjs — the round's FEATURE gate (v2.345.0 "the loyalty
// desk speaks the wire's own truth"). The release MECHANICS live in
// verify-current.mjs. This script pins only what is NEW this round.
// Every check reads the SOURCE OF RECORD (bytes, not memory) — THE OD LAW.
// Run BEFORE the walk; the last two pins pass only AFTER walk-v2345.
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

let pass = 0, fail = 0;
const ok = (name, cond) => {
  if (cond) { pass++; console.log(`  ok  ${name}`); }
  else { fail++; console.error(`x FAIL ${name}`); }
};
const read = (p) => readFileSync(p, 'utf8');

function walkTabs(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) out.push(...walkTabs(full));
    else if (name.endsWith('.tsx')) out.push(full);
  }
  return out;
}

const TAB_FILES = walkTabs('src/app/(shell)/tabs');
const ANY_SITES = TAB_FILES.filter((f) => /as any|: any/.test(read(f)));
const api = read('src/lib/api.ts');
const desk = read('src/app/(shell)/tabs/loyalty-tab.tsx');
const tiersRoute = read('src/app/api/loyalty/tiers/route.ts');
const campaignsRoute = read('src/app/api/loyalty/campaigns/route.ts');
const whatsNew = read('src/lib/whats-new.ts');
const changelog = read('CHANGELOG.md');
const changelogTest = read('src/tests/console-changelog.test.ts');
const test = read('src/tests/loyalty-wire-truth-v2345.test.ts');
const pkg = JSON.parse(read('package.json'));

console.log('— the loyalty wire truth —');
ok('THE TOMBSTONE: zero `as any` / `: any` sites remain in ANY tab file',
  ANY_SITES.length === 0);
ok('the census walked a real roster (>10 tab files)',
  TAB_FILES.length > 10);
ok('the dead lie is buried: `pointsThreshold` appears NOWHERE in api.ts',
  !api.includes('pointsThreshold'));
ok('LoyaltyTierItem speaks the wire: minPoints + maxPoints + the Decimal strings + the _count tally',
  api.includes('  minPoints: number;\n  maxPoints: number | null;\n  discountPercent: string | number;\n  pointsMultiplier: string | number;')
  && api.includes('  _count?: { customerTiers: number };\n}'));
ok('LoyaltyCampaignItem speaks the wire: bonusPoints + multiplier + status + the tallies',
  api.includes('  bonusPoints: number;\n  multiplier: string | number;')
  && api.includes('  targetTierId: string | null;\n  status: string;\n  totalPointsAwarded: number;\n  totalParticipants: number;'));
ok('the campaign interface no longer lies (no isActive / pointsMultiplier inside its block)',
  (() => {
    const iface = api.slice(api.indexOf('export interface LoyaltyCampaignItem'), api.indexOf('export const loyaltyApi'));
    return !iface.includes('isActive') && !iface.includes('pointsMultiplier');
  })());
ok('the tiers create signature speaks the door (minPoints required; maxPoints/pointsMultiplier optionals)',
  api.includes('minPoints: number; maxPoints?: number | null; discountPercent: number; pointsMultiplier?: number;'));
ok('the campaigns create signature speaks the door (the answering-chain widenings)',
  api.includes('campaignType: string; bonusPoints?: number | string; multiplier?: number | string; startDate: string; endDate?: string; targetTierId?: string;'));
ok('THE MEMBERS BUG FIX: the card reads the wire tally, never the phantom array',
  desk.includes('const memberCount = tier._count?.customerTiers ?? 0;')
  && !desk.includes('customerTiers?.length'));
ok('the five derived-data lines narrow honestly (no casts)',
  ['tiersData', 'customersData', 'txData', 'campaignsData', 'memberHistoryData'].every((d) =>
    desk.includes(`Array.isArray(${d}?.data) ? ${d}.data : [];`)));
ok('the payloads wear the create signatures',
  desk.includes('const payload: Parameters<typeof loyaltyApi.tiers.create>[0] = {')
  && desk.includes('const payload: Parameters<typeof loyaltyApi.campaigns.create>[0] = {'));
ok('the Decimal strings take the honest Number() wraps',
  desk.includes('discountPercent: Number(tier.discountPercent),')
  && desk.includes('pointsMultiplier: Number(tier.pointsMultiplier),')
  && desk.includes('Number(campaign.multiplier) > 1'));
ok('the campaign-type state is a string; the Select casts nothing',
  desk.includes("campaignType: 'BONUS_POINTS' as string,")
  && desk.includes('onValueChange={(v) => setCampaignForm({ ...campaignForm, campaignType: v })}'));
ok('THE BRACKET VOICE: the tier card speaks the full points bracket (both faces + titles)',
  desk.includes('data-testid="tier-bracket-voice"')
  && desk.includes('${tier.minPoints.toLocaleString()} – ${tier.maxPoints.toLocaleString()} pts bracket')
  && desk.includes('${tier.minPoints.toLocaleString()}+ pts bracket')
  && desk.includes('the bracket closes at ${tier.maxPoints.toLocaleString()}.')
  && desk.includes('the bracket never closes — every balance above the floor holds this tier.'));

console.log('— the era ledger —');
ok('the era test carries the tombstone walk',
  test.includes('const ANY_SITES = TAB_FILES.filter((f) => /as any|: any/.test(read(f)));')
  && test.includes('expect(ANY_SITES).toEqual([]);'));
ok('the route doors stand untouched (the v2.341 shapes still speak)',
  tiersRoute.includes('minPoints?: number;') && tiersRoute.includes('maxPoints?: number | null;')
  && campaignsRoute.includes('bonusPoints?: number | string;') && campaignsRoute.includes('multiplier?: number | string;'));

console.log('— the release mechanics —');
ok('VERSION + package.json three slots at 2.345.0',
  read('VERSION').trim() === '2.345.0'
  && pkg.version === '2.345.0'
  && pkg.mbumah.releaseVersion === '2.345.0'
  && pkg.mbumah.baseVersion === '2.345.0');
ok('the whats-new entry rides the feed',
  whatsNew.includes("version: '2.345.0',")
  && whatsNew.includes("title: 'The loyalty desk speaks the wire\\u2019s own truth',"));
ok('the changelog leads with the round',
  changelog.startsWith('## [2.345.0] The loyalty desk speaks the wire\u2019s own truth\n'));
ok('verify:v2-345-0 is wired',
  (pkg.scripts['verify:v2-345-0'] || '').includes('verify-v2-345-0.mjs'));

console.log('— the walk-dependent pins (green after walk-v2345) —');
ok('the unread-counter cascade landed (236/237/238/269)',
  changelogTest.includes("whatsNewUnreadCount('2.110.0')).toBe(236)")
  && changelogTest.includes("whatsNewUnreadCount('2.109.0')).toBe(237)")
  && changelogTest.includes("whatsNewUnreadCount('2.108.0')).toBe(238)")
  && changelogTest.includes("whatsNewUnreadCount('2.77.0')).toBe(269)"));
ok('the history line rides the cascade block',
  changelogTest.includes('v2.345.0: the loyalty-wire-truth entry joins the feed'));

console.log(`\nverify-v2-345-0: ${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
