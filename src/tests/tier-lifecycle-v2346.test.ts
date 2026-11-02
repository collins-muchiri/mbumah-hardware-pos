import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'path';
import { describe, it, expect } from 'vitest';

// ---------------------------------------------------------------------------
// v2.346.0 — THE TIER LIFECYCLE, HONESTLY.
//
// The round the tier's lifecycle stopped lying in two voices at once:
//
//   • THE ISACTIVE SWALLOW: the desk's tier form has carried an Active /
//     Inactive select forever, the create payload has carried isActive
//     forever, and the create door dropped it on the floor — the create
//     data hardcoded `isActive: true`, so the schema default always won
//     and "Inactive" was a word the wire never heard. The door names the
//     field now and the create data keeps the schema default ONLY for the
//     absent-field truth (`isActive: isActive ?? true`).
//   • THE EDIT-THAT-CREATED: the desk's edit dialog wore the words
//     "Update Tier" while its submit re-ran the CREATE door — every edit
//     duplicated the tier and left the original untouched, and NO update
//     route existed anywhere. The update door exists now
//     (PUT /api/loyalty/tiers/[id]): its body door names every field it
//     consumes (all optional — an update writes only what the body
//     carries), the figures ride the create door's own validations
//     applied only when present, a missing id and a foreign-store id
//     answer the SAME 404 (no existence leak), and RBAC mirrors the
//     family's create gate. The desk's submit branches honestly — an
//     edit PUTs, a create POSTs — and toasts the truth.
//   • THE MUTED FACE (the styling twin): an inactive tier's card wears
//     its lifecycle state before the badge has to — opacity + grayscale
//     on the card, a faded accent bar, `data-tier-active` speaking the
//     boolean to the DOM.
//
// THE OD LAW: every pin reads SOURCE bytes.
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

const CREATE = 'src/app/api/loyalty/tiers/route.ts';
const UPDATE = 'src/app/api/loyalty/tiers/[id]/route.ts';
const API = 'src/lib/api.ts';
const DESK = 'src/app/(shell)/tabs/loyalty-tab.tsx';

const API_FILES = walkApi('src/app/api');

describe('v2.346.0 — the tier lifecycle, honestly', () => {
  it('THE SWALLOW ENDS: the create door names isActive and keeps the schema default only for the absence', () => {
    const src = read(CREATE);
    expect(src.includes('isActive?: boolean;')).toBe(true);
    expect(src.includes('isActive,')).toBe(true);
    expect(src.includes('isActive: isActive ?? true,')).toBe(true);
    expect(src.includes('isActive: true,')).toBe(false);
  });

  it('THE UPDATE DOOR EXISTS: PUT /api/loyalty/tiers/[id] rides the body door, all-optional', () => {
    expect(API_FILES).toContain(UPDATE);
    const src = read(UPDATE);
    expect(src.includes('await readJsonBody<{')).toBe(true);
    expect(src.includes('name?: string;')).toBe(true);
    expect(src.includes('isActive?: boolean;')).toBe(true);
    expect(src.includes('bodyDoorRejected()')).toBe(true);
    expect(/readJsonBody\(request\)/.test(src)).toBe(false);
  });

  it('the update door keeps BOTH voices: its own 400s live beside the door', () => {
    const src = read(UPDATE);
    expect(src.includes('minPoints must be 0 or greater.')).toBe(true);
    expect(src.includes('discountPercent must be between 0 and 100.')).toBe(true);
    expect(src.includes('pointsMultiplier must be greater than 0.')).toBe(true);
  });

  it('NO EXISTENCE LEAK: a missing id and a foreign-store id answer the same 404', () => {
    const src = read(UPDATE);
    expect(src.includes("!existing || (session.storeId && existing.storeId !== session.storeId)")).toBe(true);
    expect(src.includes('Loyalty tier not found.')).toBe(true);
  });

  it('the update door writes ONLY what the body carries (the conditional-spread data)', () => {
    const src = read(UPDATE);
    expect(src.includes('...(name !== undefined && { name }),')).toBe(true);
    expect(src.includes('...(isActive !== undefined && { isActive }),')).toBe(true);
    expect(src.includes('maxPoints: maxPoints === null ? null : parseInt(String(maxPoints)),')).toBe(true);
  });

  it('RBAC mirrors the family: SUPER_ADMIN / STORE_OWNER behind the update gate', () => {
    const src = read(UPDATE);
    expect(src.includes("roles: ['SUPER_ADMIN', 'STORE_OWNER'],")).toBe(true);
    expect(src.includes("'LOYALTY_TIER_UPDATE',")).toBe(true);
    expect(src.includes('LOYALTY_TIER_UPDATED')).toBe(true);
  });

  it('api.ts gains tiers.update — the PUT with the honest optional shape', () => {
    const src = read(API);
    expect(src.includes("update: async (id: string, data: { name?: string; minPoints?: number; maxPoints?: number | null; discountPercent?: number; pointsMultiplier?: number; benefits?: string; color?: string; icon?: string; sortOrder?: number; isActive?: boolean }) => {")).toBe(true);
    expect(src.includes("method: 'PUT',")).toBe(true);
  });

  it('THE DESK BRANCHES HONESTLY: an edit PUTs, a create POSTs, the toasts speak apart', () => {
    const src = read(DESK);
    expect(src.includes('const updateTierMutation = useMutation({')).toBe(true);
    expect(src.includes('loyaltyApi.tiers.update(id, data),')).toBe(true);
    expect(src.includes('toast.success(\'Tier updated successfully\')')).toBe(true);
    expect(src.includes('if (editingTier) {')).toBe(true);
    expect(src.includes('updateTierMutation.mutate({')).toBe(true);
    expect(src.includes("'Tier updated successfully'")).toBe(true);
  });

  it('THE MUTED FACE: an inactive tier card wears its lifecycle state', () => {
    const src = read(DESK);
    expect(src.includes('data-testid="tier-card"')).toBe(true);
    expect(src.includes('data-tier-active={String(tier.isActive)}')).toBe(true);
    expect(src.includes('opacity-60 grayscale-[0.4]')).toBe(true);
  });

  it('the stale-edit life is safe: openCreateTier clears the edit target (order-agnostic slice)', () => {
    const src = read(DESK);
    expect(src.includes('function openCreateTier()')).toBe(true);
    expect(src.includes('function openEditTier(tier: LoyaltyTierItem)')).toBe(true);
    // THE STALE-EDIT GUARD (v2.346.0): the create path clears editingTier
    // FIRST — edit → cancel → Add Tier must never mutate the stale tier.
    const start = src.indexOf('function openCreateTier()');
    const nextFn = src.indexOf('\n  function ', start + 1);
    const openCreate = src.slice(start, nextFn === -1 ? undefined : nextFn);
    expect(openCreate.includes('setEditingTier(null)')).toBe(true);
    // the desk's v2.346 comment names the guard
    expect(src.includes('THE STALE-EDIT GUARD')).toBe(true);
  });

  it('the loyalty-wire-truth era still holds: the Members tally read and the bracket voice stand', () => {
    const src = read(DESK);
    expect(src.includes('const memberCount = tier._count?.customerTiers ?? 0;')).toBe(true);
    expect(src.includes('data-testid="tier-bracket-voice"')).toBe(true);
  });
});
