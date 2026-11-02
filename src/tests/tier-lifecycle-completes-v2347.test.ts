import { readFileSync } from 'node:fs';
import { describe, it, expect } from 'vitest';

// ---------------------------------------------------------------------------
// v2.347.0 — THE LIFECYCLE COMPLETES.
//
// Last round the tier gained its update door; this round the family
// closes:
//
//   • THE PREFILL DOOR (GET /api/loyalty/tiers/[id]): the row PLUS its
//     _count include — the member tally the desk's confirm dialog
//     speaks — riding the same read gate the family list owns. A
//     missing id and a foreign-store id answer the SAME 404 (the
//     no-existence-leak family law holds for every verb now).
//   • THE GUARDED RETIREMENT (DELETE /api/loyalty/tiers/[id]): RBAC
//     mirrors the family create gate, and a tier still holding members
//     is refused with a 409 that names the reassignment the desk owes
//     its members. The guard is the WIRE's own truth — a stale list
//     can never talk the wire into deleting a populated tier.
//   • THE DESK'S GUARDED QUESTION: the card carries the retirement
//     affordance at last (the rose-tinted trash beside the edit pen),
//     and the confirm dialog reads the wire's CURRENT tally through
//     the prefill door before it offers the destructive confirm — the
//     blocker line mirrors the route's 409 voice, the confirm sits
//     disabled behind it, and a tier that vanished between click and
//     read closes the dialog instead of asking a ghost question.
//   • THE MEMBERS TALLY VOICE (the styling twin): the card's Members
//     figure carries its own title voice — what the number means for
//     the tier's retirement — and the tally rides tabular figures.
//
// THE OD LAW: every pin reads SOURCE bytes.
// ---------------------------------------------------------------------------

const read = (p: string) => readFileSync(p, 'utf8');

const ID_ROUTE = 'src/app/api/loyalty/tiers/[id]/route.ts';
const API = 'src/lib/api.ts';
const DESK = 'src/app/(shell)/tabs/loyalty-tab.tsx';

describe('v2.347.0 — the tier lifecycle completes', () => {
  it('THE PREFILL DOOR EXISTS: GET rides the family read gate', () => {
    const src = read(ID_ROUTE);
    expect(src.includes('async function getLoyaltyTierHandler(...args: unknown[]): Promise<Response>')).toBe(true);
    expect(src.includes("roles: ['SUPER_ADMIN', 'STORE_OWNER', 'BRANCH_MANAGER', 'CASHIER', 'ACCOUNTANT'],")).toBe(true);
    expect(src.includes("'LOYALTY_TIER_READ',")).toBe(true);
  });

  it('THE PREFILL ANSWERS THE TALLY: the GET include carries the member count', () => {
    const src = read(ID_ROUTE);
    expect(src.includes('include: { _count: { select: { customerTiers: true } } },')).toBe(true);
    expect(src.includes('return Response.json({ success: true, data: tier });')).toBe(true);
  });

  it('NO EXISTENCE LEAK holds for the prefill door: missing id and foreign-store id answer the same 404', () => {
    const src = read(ID_ROUTE);
    // the guard rides THREE times now — once per verb handler
    expect(src.split('!existing || (session.storeId && existing.storeId !== session.storeId)').length).toBe(2);
    expect(src.split('!tier || (session.storeId && tier.storeId !== session.storeId)').length).toBe(3);
    expect(src.split('Loyalty tier not found.').length).toBe(4);
  });

  it('THE GUARDED RETIREMENT EXISTS: DELETE mirrors the family create gate and speaks the system log', () => {
    const src = read(ID_ROUTE);
    expect(src.includes('async function deleteLoyaltyTierHandler(...args: unknown[]): Promise<Response>')).toBe(true);
    expect(src.includes("'LOYALTY_TIER_DELETE',")).toBe(true);
    expect(src.includes('LOYALTY_TIER_DELETED')).toBe(true);
    expect(src.includes("roles: ['SUPER_ADMIN', 'STORE_OWNER'],")).toBe(true);
  });

  it('THE MEMBER-COUNT GUARD: a populated tier is refused with the reassignment voice', () => {
    const src = read(ID_ROUTE);
    expect(src.includes('if (memberCount > 0) {')).toBe(true);
    expect(src.includes('const unit = memberCount === 1 ? \'member\' : \'members\';')).toBe(true);
    expect(src.includes('This tier still holds ${memberCount} ${unit} — reassign them to another tier before deleting.')).toBe(true);
    expect(src.includes('{ status: 409 },')).toBe(true);
  });

  it('the retirement answers the row it retired', () => {
    const src = read(ID_ROUTE);
    expect(src.includes('const deleted = await db.loyaltyTier.delete({ where: { id } });')).toBe(true);
    expect(src.includes('return Response.json({ success: true, data: deleted });')).toBe(true);
  });

  it('the update era holds: the PUT door stands unchanged beside the new verbs', () => {
    const src = read(ID_ROUTE);
    expect(src.includes('async function updateLoyaltyTierHandler(...args: unknown[]): Promise<Response>')).toBe(true);
    expect(src.includes("'LOYALTY_TIER_UPDATE',")).toBe(true);
    expect(src.includes('maxPoints: maxPoints === null ? null : parseInt(String(maxPoints)),')).toBe(true);
  });

  it('api.ts gains tiers.get and tiers.remove — the prefill read and the guarded DELETE', () => {
    const src = read(API);
    expect(src.includes('get: async (id: string) => {')).toBe(true);
    expect(src.includes('remove: async (id: string) => {')).toBe(true);
    expect(src.includes("return request<LoyaltyTierItem>(`/loyalty/tiers/${id}`);")).toBe(true);
    expect(src.includes("method: 'DELETE',")).toBe(true);
  });

  it('THE DESK ASKS: the retirement mutation rides remove() and toasts its own voice', () => {
    const src = read(DESK);
    expect(src.includes('const deleteTierMutation = useMutation({')).toBe(true);
    expect(src.includes('mutationFn: (id: string) => loyaltyApi.tiers.remove(id),')).toBe(true);
    expect(src.includes("toast.success('Tier deleted successfully')")).toBe(true);
    expect(src.includes("toast.error(err.message || 'Failed to delete tier')")).toBe(true);
  });

  it('THE PREFILL DOOR AT WORK: the confirm dialog reads the wire before it offers the confirm', () => {
    const src = read(DESK);
    expect(src.includes("queryKey: ['loyalty-tier-fresh', deleteTierTarget?.id],")).toBe(true);
    expect(src.includes("if (!deleteTierTarget) throw new Error('No tier selected.');")).toBe(true);
    expect(src.includes('return await loyaltyApi.tiers.get(deleteTierTarget.id);')).toBe(true);
    expect(src.includes('enabled: !!deleteTierTarget,')).toBe(true);
    // a not-found is definitive: the prefill never retries, so the
    // ghost-question close fires exactly once
    expect(src.includes('retry: false,')).toBe(true);
    expect(src.includes('setDeleteTierTarget(null);')).toBe(true);
    expect(src.includes("toast.error(err instanceof Error ? err.message : 'Loyalty tier not found.');")).toBe(true);
  });

  it('THE BLOCKER TALLY: the fresh count decides, the list slice only bridges the flight', () => {
    const src = read(DESK);
    expect(src.includes('const freshDeleteTier = deleteTierFresh?.data;')).toBe(true);
    expect(src.includes('const freshMemberTally = freshDeleteTier?._count?.customerTiers;')).toBe(true);
    expect(src.includes('const deleteBlockerTally = freshMemberTally ?? deleteTierTarget?._count?.customerTiers ?? 0;')).toBe(true);
  });

  it('THE BLOCKER LINE: the confirm sits disabled behind the mirrored 409 voice', () => {
    const src = read(DESK);
    expect(src.includes('data-testid="tier-delete-blocked"')).toBe(true);
    expect(src.includes('data-testid="tier-delete-reading"')).toBe(true);
    expect(src.includes('This tier still holds {deleteBlockerTally}')).toBe(true);
    expect(src.includes('reassign them to another tier before deleting.')).toBe(true);
    expect(src.includes('disabled={deleteBlockerTally > 0 || deleteTierMutation.isPending}')).toBe(true);
    // the destructive confirm wears the house rose voice (the invoices pattern)
    expect(src.includes('className="bg-rose-600 text-white hover:bg-rose-700"')).toBe(true);
    expect(src.includes("e.preventDefault();")).toBe(true);
  });

  it('THE RETIREMENT AFFORDANCE: the rose-tinted trash rides the card beside the edit pen', () => {
    const src = read(DESK);
    expect(src.includes('data-testid="tier-delete"')).toBe(true);
    expect(src.includes('text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:text-rose-400 dark:hover:bg-rose-950/40')).toBe(true);
    expect(src.includes('<Trash2 className="h-3.5 w-3.5" />')).toBe(true);
    expect(src.includes('onClick={() => setDeleteTierTarget(tier)}')).toBe(true);
    expect(src.includes('the wire will ask for a reassignment first.')).toBe(true);
  });

  it('THE MEMBERS TALLY VOICE: the figure speaks what it means for the retirement', () => {
    const src = read(DESK);
    expect(src.includes('data-testid="tier-member-count"')).toBe(true);
    expect(src.includes('className="font-semibold tabular-nums"')).toBe(true);
    expect(src.includes('deleting it requires a reassignment first.')).toBe(true);
    expect(src.includes('No customers hold this tier yet.')).toBe(true);
  });

  it('the muted-face era still holds: the inactive tier card keeps its lifecycle wear', () => {
    const src = read(DESK);
    expect(src.includes('data-testid="tier-card"')).toBe(true);
    expect(src.includes('data-tier-active={String(tier.isActive)}')).toBe(true);
    expect(src.includes('opacity-60 grayscale-[0.4]')).toBe(true);
    expect(src.includes('const memberCount = tier._count?.customerTiers ?? 0;')).toBe(true);
  });
});
