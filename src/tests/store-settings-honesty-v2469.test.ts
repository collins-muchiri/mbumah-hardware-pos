// THE SETTINGS DESK LEARNS THE BRANCH'S OWN WORDS (v2.469.0): the admin
// desk's Store Settings mock retired, proven without a database.
//
//   • THE MOCK RETIRED — the form spoke 'Mbumah Hardware' from component
//     state for its whole life; the branch's real name, location and
//     phone now load from the /api/stores wire and the save walks the
//     two honest doors: details → PATCH /api/stores/settings, phone →
//     its ONE home at PATCH /api/stores/phone.
//   • THE GUARDED WRITE — the details PATCH is role-gated (the vat
//     rate's own law), org-scoped by shape (a foreign store is a calm
//     404 that never leaks the id), zod-guarded (an empty name refuses;
//     an empty location word clears the nullable column honestly), and
//     rides the body door's ONE home with its explicit generic.
//   • THE DESK SHOWS ITS WORK — dirty fields wear the amber ring and
//     the unsaved dot, the save sleeps until a word changes, the two
//     wires invalidate so the reports desk's pre-addressed chip flips
//     without a re-load, and the share door's exact voice is previewed
//     through the ONE home's display word — the desk never spells the
//     host (the v2463 census law).

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { waMeDisplay } from '@/lib/reports/dead-stock';
import { WHATS_NEW } from '@/lib/whats-new';

const DESK = 'src/app/(shell)/tabs/admin-tab.tsx';
const ROUTE = 'src/app/api/stores/settings/route.ts';

const desk = readFileSync(DESK, 'utf8');
const route = readFileSync(ROUTE, 'utf8');

// ---------------------------------------------------------------------------
// 1. THE GUARDED WRITE — the route's own bytes
// ---------------------------------------------------------------------------

describe('PATCH /api/stores/settings — the owner-only, org-scoped details write', () => {
  it('the PATCH is role-gated — SUPER_ADMIN or STORE_OWNER only (the vat rate\'s own law)', () => {
    expect(route.includes("requireAuth(patchHandler, { roles: ['SUPER_ADMIN', 'STORE_OWNER'] })")).toBe(true);
    expect(route.includes('export const PATCH = withErrorBoundary(')).toBe(true);
  });

  it('the write is org-scoped by shape — updateMany cannot rename a foreign store', () => {
    expect(route.includes('where: { id: storeId, organizationId: session.organizationId },')).toBe(true);
    expect(route.includes('data: { name, location: locationWord },')).toBe(true);
  });

  it('a count of zero answers the calm 404 — nothing leaks that the id existed', () => {
    expect(route.includes('if (written.count === 0) {')).toBe(true);
    expect(route.includes("'Store not found in your organization.'")).toBe(true);
  });

  it('zod guards the body — the store id required, the name 1..120, the location optional 0..160', () => {
    expect(route.includes('storeId: z.string().min(1,')).toBe(true);
    expect(route.includes(".min(1, 'The store name cannot be empty.')")).toBe(true);
    expect(route.includes(".max(120, 'The store name cannot exceed 120 characters.')")).toBe(true);
    expect(route.includes(".max(160, 'The location cannot exceed 160 characters.')")).toBe(true);
    expect(route.includes('.optional(),')).toBe(true);
  });

  it('an empty location word clears the column honestly — the nullable location is a real state', () => {
    expect(route.includes('const locationWord = location ? location : null;')).toBe(true);
    expect(route.includes('data: { name, location: locationWord },')).toBe(true);
  });

  it('the log speaks the round\'s own word — and the name, which is the branch\'s public face', () => {
    expect(route.includes("action: 'STORE_SETTINGS_UPDATED'")).toBe(true);
    expect(route.includes('component: \'STORES\'')).toBe(true);
  });

  it('the body read rides the ONE home with its explicit generic — never a raw swallow', () => {
    expect(route.includes('readJsonBody<{ storeId?: unknown; name?: unknown; location?: unknown }>(request)')).toBe(true);
    expect(route.includes('bodyDoorRejected(')).toBe(true);
    expect(route.includes('request.json()')).toBe(false);
  });

  it('the phone keeps its ONE home — this route writes only the name and the location', () => {
    expect(route.includes('/api/stores/phone')).toBe(true);
    expect(route.includes('phone: z')).toBe(false);
    expect(route.includes('data: { phone }')).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// 2. THE DESK'S BYTES — the mock retired, the two doors, the live words
// ---------------------------------------------------------------------------

describe('the admin desk — the store settings honesty pinned from the desk bytes', () => {
  it('the mock is retired — the hard-coded words no longer stand', () => {
    expect(desk.includes("name: 'Mbumah Hardware',")).toBe(false);
    expect(desk.includes("location: 'Juja, Kiambu County',")).toBe(false);
    expect(desk.includes("phone: '+254 700 123 456',")).toBe(false);
  });

  it('the branch on file loads from the /api/stores wire — the desk rides its own key', () => {
    expect(desk.includes("queryKey: ['admin-store-details', storeId],")).toBe(true);
    expect(desk.includes("authedFetch('/api/stores')")).toBe(true);
    expect(desk.includes('.find((s) => s.id === storeId)')).toBe(true);
  });

  it('the draft-wins pattern — the vat rate\'s own shape, mirrored', () => {
    expect(desk.includes('storeDraft?.name ?? storeDetails?.name')).toBe(true);
    expect(desk.includes('const [storeDraft, setStoreDraft] = useState<{ name: string; location: string; phone: string } | null>(null);')).toBe(true);
  });

  it('the save walks the two honest doors — details to the new write, phone to its ONE home', () => {
    expect(desk.includes("authedFetch('/api/stores/settings', {")).toBe(true);
    expect(desk.includes("authedFetch('/api/stores/phone', {")).toBe(true);
    expect(desk.includes("body: JSON.stringify({ storeId, name, location: draftLocation.trim() }),")).toBe(true);
    expect(desk.includes("body: JSON.stringify({ storeId, phone }),")).toBe(true);
  });

  it('both wires invalidate — the reports desk\'s pre-addressed chip flips without a re-load', () => {
    expect(desk.includes("invalidateQueries({ queryKey: ['admin-store-details', storeId] })")).toBe(true);
    expect(desk.includes("invalidateQueries({ queryKey: ['dead-stock-store-contact', storeId] })")).toBe(true);
  });

  it('an empty name refuses locally before the wire ever moves', () => {
    expect(desk.includes('The store name cannot be empty — the branch must keep its word.')).toBe(true);
  });

  it('a short phone refuses locally before the wire ever moves', () => {
    expect(desk.includes('The phone needs at least 7 digits — the share door cannot address a shorter word.')).toBe(true);
  });

  it('the handles wear their names — the inputs, the save, the preview', () => {
    expect(desk.includes('data-testid="admin-store-name"')).toBe(true);
    expect(desk.includes('data-testid="admin-store-location"')).toBe(true);
    expect(desk.includes('data-testid="admin-store-phone"')).toBe(true);
    expect(desk.includes('data-testid="admin-store-save"')).toBe(true);
    expect(desk.includes('data-testid="admin-store-share-preview"')).toBe(true);
  });

  it('dirty fields wear the amber ring and the unsaved dot — the desk shows its work', () => {
    expect(desk.includes('data-testid="admin-store-dirty-name"')).toBe(true);
    expect(desk.includes('data-testid="admin-store-dirty-location"')).toBe(true);
    expect(desk.includes('data-testid="admin-store-dirty-phone"')).toBe(true);
    expect(desk.includes("'border-amber-400/70 focus-visible:ring-amber-400/40'")).toBe(true);
  });

  it('the save sleeps until a word changes — and the VAT keeps its own honest button', () => {
    expect(desk.includes('disabled={storeDetailsLoading || !storeDirty || storeSaving}')).toBe(true);
    expect(desk.includes('Save Store Details')).toBe(true);
    expect(desk.includes('Save VAT Rate')).toBe(true);
    expect(desk.includes('disabled={saveVatRateMutation.isPending}')).toBe(true);
  });

  it('the preview rides the ONE home\'s display word — the desk never spells the host', () => {
    expect(desk.includes('The share door will say:')).toBe(true);
    expect(desk.includes('waMeDisplay(draftPhone.trim())')).toBe(true);
    expect(desk.includes('wa.me')).toBe(false);
  });

  it('the phone input speaks the tel keyboard — and the fields wait for the branch on file', () => {
    expect(desk.includes('inputMode="tel"')).toBe(true);
    expect(desk.includes('placeholder="Loading the branch on file…"', )).toBe(true);
    expect(desk.includes('enabled: !!storeId,')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 3. THE ONE HOME'S READING — the display word, pure
// ---------------------------------------------------------------------------

describe('waMeDisplay — the display word the preview dresses', () => {
  it('the normalized digits under a + — empty answers empty', () => {
    expect(waMeDisplay('0791 234 567')).toBe('+254791234567');
    expect(waMeDisplay('')).toBe('');
  });
});

// ---------------------------------------------------------------------------
// 4. WHATS-NEW — the settings desk leads the feed
// ---------------------------------------------------------------------------

describe('whats-new — the mock retired, pinned in the feed', () => {
  const head = WHATS_NEW.find((e) => e.version === '2.469.0');

  it('the head wears the round\'s own story — the elder words and the new word', () => {
    expect(head.version).toBe('2.469.0');
    expect(head.title).toContain('the settings desk learns the branch');
    expect(head.title).toContain('the number learns its edit door');
    expect(head.title).toContain('the share door learns the store');
  });

  it('the bullets speak the mock\'s retirement, the two doors and the desk\'s work', () => {
    const text = head.bullets.join(' ');
    expect(text).toContain('/api/stores/settings');
    expect(text).toContain('/api/stores/phone');
    expect(text).toContain('amber ring');
    expect(text).toContain('pre-addressed chip flips');
  });
});
