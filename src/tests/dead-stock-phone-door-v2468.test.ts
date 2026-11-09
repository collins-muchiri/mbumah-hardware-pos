// THE STORE'S SHARE PHONE LEARNS ITS EDIT DOOR (v2.468.0): the picker
// chip's promise kept, proven without a database.
//
//   • THE EDIT DOOR — the dead-stock desk's quiet "Shares open with the
//     chat picker" chip is now a real button: one press opens the edit
//     dialog, the owner-only PATCH writes the number org-scoped, the
//     save invalidates the desk's OWN wire, and the chip flips to the
//     pre-addressed face LIVE — no other tab, no re-load.
//   • THE GUARDED WRITE — PATCH /api/stores/phone speaks the vat rate's
//     own law (SUPER_ADMIN or STORE_OWNER only), shapes the write
//     org-scoped (updateMany cannot address a foreign store; a count of
//     zero answers a calm 404), validates with zod, and logs the number
//     masked (a phone number is a person's word, never a log line's).
//   • THE ONE HOME STILL OWNS THE WORD — the route stores what the human
//     typed; the URL's own house normalizes at composition time. The
//     desk's bytes never spell the host (the v2463 census law) and the
//     census speaks four handles now.

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { waMeDisplay } from '@/lib/reports/dead-stock';
import { WHATS_NEW } from '@/lib/whats-new';

const DESK = 'src/app/(shell)/tabs/reports-tab.tsx';
const ROUTE = 'src/app/api/stores/phone/route.ts';

const desk = readFileSync(DESK, 'utf8');
const route = readFileSync(ROUTE, 'utf8');

// ---------------------------------------------------------------------------
// 1. THE GUARDED WRITE — the route's own bytes
// ---------------------------------------------------------------------------

describe('PATCH /api/stores/phone — the owner-only, org-scoped write', () => {
  it('the PATCH is role-gated — SUPER_ADMIN or STORE_OWNER only (the vat rate\'s own law)', () => {
    expect(route.includes("requireAuth(patchHandler, { roles: ['SUPER_ADMIN', 'STORE_OWNER'] })")).toBe(true);
    expect(route.includes('export const PATCH = withErrorBoundary(')).toBe(true);
  });

  it('the write is org-scoped by shape — updateMany cannot address a foreign store', () => {
    expect(route.includes('where: { id: storeId, organizationId: session.organizationId },')).toBe(true);
    expect(route.includes('data: { phone },')).toBe(true);
  });

  it('a count of zero answers the calm 404 — nothing leaks that the id existed', () => {
    expect(route.includes('if (written.count === 0) {')).toBe(true);
    expect(route.includes("'Store not found in your organization.'")).toBe(true);
  });

  it('zod guards the body — the store id required, the phone 7..24', () => {
    expect(route.includes('storeId: z.string().min(1,')).toBe(true);
    expect(route.includes(".min(7, 'The phone needs at least 7 digits.')")).toBe(true);
    expect(route.includes(".max(24, 'The phone cannot exceed 24 characters.')")).toBe(true);
  });

  it('the log speaks the number masked — a person\'s word, never a log line\'s', () => {
    expect(route.includes('action: \'STORE_PHONE_UPDATED\'')).toBe(true);
    expect(route.includes('(***${phone.slice(-3)})')).toBe(true);
  });

  it('the route stores what the human typed — the ONE home normalizes at composition time', () => {
    expect(route.includes('export function')).toBe(false);
    expect((route.match(/replace\(/g) ?? []).length).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// 2. THE DESK'S BYTES — the press, the dialog, the live flip
// ---------------------------------------------------------------------------

describe('the dead-stock desk — the edit door pinned from the desk bytes', () => {
  it('the picker chip grew its press — the double voice, the dashed hint', () => {
    expect(desk.includes('aria-label="Add the store\'s share phone"')).toBe(true);
    expect(desk.includes('title="Add the store\'s phone to pre-address the share door — press to add it"')).toBe(true);
    expect(desk.includes('onClick={() => { setPhoneDraft(\'\'); setPhoneDialogOpen(true); }}')).toBe(true);
    expect(desk.includes('border border-dashed border-border/60')).toBe(true);
  });

  it('the dialog rides the section — the ResponsiveDialog with its own words', () => {
    expect(desk.includes('title="The store\'s share phone"')).toBe(true);
    expect(desk.includes('description="The number the share door pre-addresses — WhatsApp opens the store\'s own chat."')).toBe(true);
    expect(desk.includes('data-testid="dead-stock-phone-input"')).toBe(true);
    expect(desk.includes('data-testid="dead-stock-phone-save"')).toBe(true);
    expect(desk.includes("{phoneSaving ? 'Saving…' : 'Save phone'}")).toBe(true);
  });

  it('the helper word speaks the door\'s own normalize — and never spells the host', () => {
    expect(desk.includes('Spaces and dashes ride out; a leading 0 grows to 254 — the same normalize the URL itself speaks.')).toBe(true);
    expect((desk.match(/wa\.me/g) ?? []).length).toBe(0);
  });

  it('Enter saves — the keyboard\'s own door', () => {
    expect(desk.includes("onKeyDown={(e) => { if (e.key === 'Enter' && !phoneSaving) saveStorePhone(); }}")).toBe(true);
  });

  it('the save writes the owner-only PATCH and invalidates the desk\'s OWN wire — the chip flips live', () => {
    expect(desk.includes("fetch('/api/stores/phone', {")).toBe(true);
    expect(desk.includes("method: 'PATCH',")).toBe(true);
    expect(desk.includes("body: JSON.stringify({ storeId, phone: trimmed }),")).toBe(true);
    expect(desk.includes("await queryClient.invalidateQueries({ queryKey: ['dead-stock-store-contact', storeId] });")).toBe(true);
  });

  it('a short draft refuses locally before the wire ever moves', () => {
    expect(desk.includes('if (trimmed.length < 7) {')).toBe(true);
    expect(desk.includes("'The phone needs at least 7 digits — the door cannot address a shorter word.'")).toBe(true);
  });

  it('the section rides the store id — the dialog\'s write address', () => {
    expect(desk.includes('storeId: string;')).toBe(true);
    expect(desk.includes('storeId={currentStoreId}')).toBe(true);
  });

  it('the census speaks four handles — Ask, Share, Copy all, the edit door', () => {
    // v2.472.0 re-key (dated): the section grows its FIFTH and SIXTH
    // voices — the sort door's two headers (the Capital tied and Days
    // idle handles, the double voice every handle wears); the census
    // speaks the section's six handles now, and the edit door's own
    // handle stands untouched.
    // v2.473.0 re-key (dated): the section grows its SEVENTH, EIGHTH and
    // NINTH voices — the search door's three handles (the lens input,
    // the clear × and the empty lens's own clear handle, the double
    // voice every handle wears); the census speaks the section's nine
    // handles now, and the edit door's own handle stands untouched.
    const section = desk.slice(desk.indexOf('function DeadStockSection'), desk.indexOf('// Main Reports Tab Component'));
    // v2.476.0 re-key (dated): the section grows its TENTH voice — the
    // chat door's Share all handle (the chorus's own reach-out, the
    // double voice every handle wears); the census speaks the section's
    // ten handles now, and the loom's pressed-voice law stands untouched.
    expect(section.split('aria-label=').length - 1).toBe(10);
  });

  it('the display word dresses the toast — the ONE home\'s reading, never a re-format', () => {
    expect(desk.includes('waMeDisplay(trimmed)')).toBe(true);
    expect(waMeDisplay('0795191909')).toBe('+254795191909');
  });
});

// ---------------------------------------------------------------------------
// 3. THE FEED — the head wears the round's own story
// ---------------------------------------------------------------------------

describe('whats-new — the edit door leads the feed', () => {
  const head = WHATS_NEW[0];

  it('the head wears the round\'s own story', () => {
    expect(head.version).toBe('2.485.0');
    expect(head.title).toContain('resting ledger');
    expect(head.title).toContain('reach out');
    expect(head.title).toContain('one breath');
    expect(head.title).toContain('print door');
    expect(head.title).toContain('share door');
    expect(head.title).toContain('own number');
    expect(head.title).toContain('edit door');
    expect(head.bullets.length).toBeGreaterThanOrEqual(3);
    expect(head.bullets.some((b) => b.includes('edit door'))).toBe(true);
    expect(head.bullets.some((b) => b.includes('pre-addressed'))).toBe(true);
    expect(head.bullets.some((b) => b.includes('chat picker'))).toBe(true);
    expect(head.bullets.some((b) => b.includes('clearance note'))).toBe(true);
    expect(head.bullets.some((b) => b.includes('copy all'))).toBe(true);
  });
});
