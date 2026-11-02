import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'path';
import { describe, it, expect } from 'vitest';

// ---------------------------------------------------------------------------
// v2.345.0 — THE LOYALTY WIRE TRUTH (the as-any class ends).
//
// The loyalty desk's eight any-sites — five `(X as any)?.data` derived-data
// lines, two `const payload: any` create bodies, and one `v as any` on the
// campaign-type Select — all existed to launder a half-dozen interface lies
// past the compiler. Live-proven against the wire this round:
//
//   • LoyaltyTierItem declared `pointsThreshold` — a field the schema, the
//     route, and every desk read disown: ZERO readers anywhere, the wire
//     never sent it. The truth is `minPoints` (plus the bracket's ceiling
//     `maxPoints`, and `_count.customerTiers`, the member tally the wire's
//     include actually answers);
//   • THE MEMBERS BUG: the tier cards read `tier.customerTiers?.length` —
//     a key the wire NEVER sends (the include is `_count: { select: {
//     customerTiers: true } }`) — so the Members cell stood at 0 forever;
//   • LoyaltyCampaignItem declared `pointsMultiplier` (schema says
//     `multiplier`) and `isActive` (schema says `status`), while the cards
//     read bonusPoints / multiplier / totalParticipants / totalPointsAwarded
//     / status — five real fields the interface never named;
//   • discountPercent / pointsMultiplier / multiplier ride the wire as
//     Prisma Decimal JSON strings (`"1"`, `"1.5"`) — the honest interface
//     types say `string | number`, and the form wraps Number() at the read.
//
// With the interfaces speaking the wire's own truth, every cast dissolves:
// the envelope type narrows honestly, the payloads wear the create
// signatures' own types, and the campaign-type field widens to the string
// the Select always held. THE TOMBSTONE: `as any` and `: any` match ZERO
// tab files.
//
// The styling face is the BRACKET VOICE (the desk's eleventh styled face):
// each tier card's range line speaks the FULL points bracket — floor to
// ceiling when maxPoints closes it, floor-plus when the ceiling is open —
// with the exact sentence in the title voice.
//
// THE OD LAW: every pin reads SOURCE bytes.
// ---------------------------------------------------------------------------

const read = (p: string) => readFileSync(p, 'utf8');

function walkTabs(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) out.push(...walkTabs(full));
    else if (name.endsWith('.tsx')) out.push(full);
  }
  return out;
}

const TAB_FILES = walkTabs('src/app/(shell)/tabs');
const ANY_SITES = TAB_FILES.filter((f) => /as any|: any/.test(read(f)));

const TAB = 'src/app/(shell)/tabs/loyalty-tab.tsx';
const API = 'src/lib/api.ts';

describe('v2.345.0 — the loyalty wire truth', () => {
  it('THE TOMBSTONE: zero `as any` / `: any` sites remain in ANY tab file', () => {
    expect(ANY_SITES).toEqual([]);
    expect(TAB_FILES.length).toBeGreaterThan(10);
  });

  it('the five derived-data lines narrow honestly (the casts left, the envelope type speaks)', () => {
    const src = read(TAB);
    expect(src.includes('const tiers = Array.isArray(tiersData?.data) ? tiersData.data : [];')).toBe(true);
    expect(src.includes('const customers = Array.isArray(customersData?.data) ? customersData.data : [];')).toBe(true);
    expect(src.includes('const transactions = Array.isArray(txData?.data) ? txData.data : [];')).toBe(true);
    expect(src.includes('const campaigns = Array.isArray(campaignsData?.data) ? campaignsData.data : [];')).toBe(true);
    expect(src.includes('const memberHistory = Array.isArray(memberHistoryData?.data) ? memberHistoryData.data : [];')).toBe(true);
  });

  it('THE MEMBERS BUG FIX: the tier card reads the wire _count tally, never the phantom array', () => {
    const src = read(TAB);
    expect(src.includes('const memberCount = tier._count?.customerTiers ?? 0;')).toBe(true);
    expect(src.includes('customerTiers?.length')).toBe(false);
  });

  it('the dead lie is buried: `pointsThreshold` appears NOWHERE in api.ts', () => {
    expect(read(API).includes('pointsThreshold')).toBe(false);
  });

  it('LoyaltyTierItem speaks the wire: minPoints, the maxPoints ceiling, the Decimal strings, the _count tally', () => {
    const src = read(API);
    expect(src.includes('  minPoints: number;\n  maxPoints: number | null;\n  discountPercent: string | number;\n  pointsMultiplier: string | number;')).toBe(true);
    expect(src.includes('  _count?: { customerTiers: number };\n}')).toBe(true);
  });

  it('LoyaltyCampaignItem speaks the wire: bonusPoints, multiplier, status, the tallies — the isActive lie is gone', () => {
    const src = read(API);
    expect(src.includes('  bonusPoints: number;\n  multiplier: string | number;')).toBe(true);
    expect(src.includes('  targetTierId: string | null;\n  status: string;\n  totalPointsAwarded: number;\n  totalParticipants: number;')).toBe(true);
    const iface = src.slice(src.indexOf('export interface LoyaltyCampaignItem'), src.indexOf('export const loyaltyApi'));
    expect(iface.includes('isActive')).toBe(false);
    expect(iface.includes('pointsMultiplier')).toBe(false);
  });

  it('the create signatures speak the doors: minPoints required, the optionals the doors read', () => {
    const src = read(API);
    expect(src.includes('minPoints: number; maxPoints?: number | null; discountPercent: number; pointsMultiplier?: number;')).toBe(true);
    expect(src.includes('campaignType: string; bonusPoints?: number | string; multiplier?: number | string; startDate: string; endDate?: string; targetTierId?: string;')).toBe(true);
  });

  it('the payloads wear the create signatures (no any-annotation laundering)', () => {
    const src = read(TAB);
    expect(src.includes('const payload: Parameters<typeof loyaltyApi.tiers.create>[0] = {')).toBe(true);
    expect(src.includes('const payload: Parameters<typeof loyaltyApi.campaigns.create>[0] = {')).toBe(true);
  });

  it('the Decimal strings take the honest Number() wrap at the form read', () => {
    const src = read(TAB);
    expect(src.includes('discountPercent: Number(tier.discountPercent),')).toBe(true);
    expect(src.includes('pointsMultiplier: Number(tier.pointsMultiplier),')).toBe(true);
    expect(src.includes('Number(campaign.multiplier) > 1')).toBe(true);
  });

  it('the campaign-type state is a string — the Select casts nothing', () => {
    const src = read(TAB);
    expect(src.includes("campaignType: 'BONUS_POINTS' as string,")).toBe(true);
    expect(src.includes('onValueChange={(v) => setCampaignForm({ ...campaignForm, campaignType: v })}')).toBe(true);
  });

  it('THE BRACKET VOICE: the tier card speaks the full points bracket, floor to ceiling', () => {
    const src = read(TAB);
    expect(src.includes('data-testid="tier-bracket-voice"')).toBe(true);
    expect(src.includes('${tier.minPoints.toLocaleString()} – ${tier.maxPoints.toLocaleString()} pts bracket')).toBe(true);
    expect(src.includes('${tier.minPoints.toLocaleString()}+ pts bracket')).toBe(true);
    expect(src.includes('the bracket closes at ${tier.maxPoints.toLocaleString()}.')).toBe(true);
    expect(src.includes('the bracket never closes — every balance above the floor holds this tier.')).toBe(true);
  });
});
