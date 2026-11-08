// MBUMAH HARDWARE POS - The store's own details (v2.469.0)
//
// PATCH /api/stores/settings - set the branch's name and location.
//
// The admin desk's Store Settings form spoke a mock for its whole life:
// the name and the location typed into component state that never left
// the browser, and the save button beside them quietly wrote only the
// VAT rate. This route is the mock retired — the branch's own words
// reach the Store model at last, org-scoped so a foreign store can
// never be renamed by mistake.
//
// Auth:
//   • PATCH - SUPER_ADMIN or STORE_OWNER only (the vat rate's own law —
//     branch identity is an owner's word, never a cashier's).
//
// The phone keeps its ONE home (PATCH /api/stores/phone, v2.468.0);
// this route speaks only the name and the location so each write keeps
// its own door, its own zod and its own log word. An empty location
// word clears the column honestly — the Store model's location is
// nullable, and "no location on file" is a real state, not an error.

import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db, runWithoutTenant } from '@/lib/db';
import { requireAuth, type AuthSession } from '@/lib/auth';
import { withErrorBoundary, systemLog } from '@/lib/logger';
import { readJsonBody, bodyDoorRejected } from '@/lib/request-body';

export const dynamic = 'force-dynamic';

// PATCH: update the store's name and location
const patchBodySchema = z.object({
  storeId: z.string().min(1, 'The store id is required.'),
  name: z
    .string()
    .trim()
    .min(1, 'The store name cannot be empty.')
    .max(120, 'The store name cannot exceed 120 characters.'),
  location: z
    .string()
    .trim()
    .max(160, 'The location cannot exceed 160 characters.')
    .optional(),
});

async function patchHandler(
  request: NextRequest,
  session: AuthSession,
): Promise<Response> {
  // THE BODY DOOR'S ONE HOME (the v2.344 tombstone's own law): the read
  // rides readJsonBody with its explicit generic, a malformed body
  // answers the house's polite 400 — a raw JSON-parse swallow would
  // join the audited exemplar class this route refuses.
  const door = await readJsonBody<{ storeId?: unknown; name?: unknown; location?: unknown }>(request);
  if (!door.ok) return bodyDoorRejected('{ "storeId": "…", "name": "…", "location": "…" }');

  const parsed = patchBodySchema.safeParse(door.body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        success: false,
        error: 'Validation failed.',
        details: parsed.error.flatten(),
      },
      { status: 422 },
    );
  }

  const { storeId, name, location } = parsed.data;
  const locationWord = location ? location : null;

  return runWithoutTenant(async () => {
    // ORG-SCOPED BY SHAPE: updateMany cannot address a store outside the
    // session's organization, and its count answers the 404 honestly —
    // an update that matched nothing never leaks that the id existed.
    const written = await db.store.updateMany({
      where: { id: storeId, organizationId: session.organizationId },
      data: { name, location: locationWord },
    });

    if (written.count === 0) {
      return NextResponse.json(
        { success: false, error: 'Store not found in your organization.' },
        { status: 404 },
      );
    }

    await systemLog({
      action: 'STORE_SETTINGS_UPDATED',
      component: 'STORES',
      severity: 'INFO',
      message: `Store details updated for store ${storeId} (name "${name}")`,
      userId: session.userId,
    });

    return NextResponse.json({
      success: true,
      data: { storeId, name, location: locationWord },
    });
  });
}

// PATCH: SUPER_ADMIN or STORE_OWNER only (the vat rate's own law).
export const PATCH = withErrorBoundary(
  requireAuth(patchHandler, { roles: ['SUPER_ADMIN', 'STORE_OWNER'] }),
  'STORES',
);
