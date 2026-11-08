// MBUMAH HARDWARE POS - The store's share phone (v2.468.0)
//
// PATCH /api/stores/phone - set the phone the share door pre-addresses.
//
// The dead-stock desk's share door learned the store's own number
// (v2.467.0) by READING the Store model's phone column; the desk's quiet
// picker chip promises "add the store's phone" — this route is that
// promise kept. A store with a phone on file answers its own door; the
// write is guarded and org-scoped so a foreign store can never be
// addressed by mistake.
//
// Auth:
//   • PATCH - SUPER_ADMIN or STORE_OWNER only (the vat rate's own law —
//     branch identity is an owner's word, never a cashier's).
//
// The digits are NOT normalized here — the URL's own house
// (src/lib/reports/dead-stock.ts) normalizes at composition time, so the
// file stores what the human typed and every reader speaks the same
// word. The log carries only the store id and the number's last three
// digits — a phone number is a person's word, never a log line's.

import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db, runWithoutTenant } from '@/lib/db';
import { requireAuth, type AuthSession } from '@/lib/auth';
import { withErrorBoundary, systemLog } from '@/lib/logger';
import { readJsonBody, bodyDoorRejected } from '@/lib/request-body';

export const dynamic = 'force-dynamic';

// PATCH: update the store's share phone
const patchBodySchema = z.object({
  storeId: z.string().min(1, 'The store id is required.'),
  phone: z
    .string()
    .trim()
    .min(7, 'The phone needs at least 7 digits.')
    .max(24, 'The phone cannot exceed 24 characters.'),
});

async function patchHandler(
  request: NextRequest,
  session: AuthSession,
): Promise<Response> {
  // THE BODY DOOR'S ONE HOME (the v2.344 tombstone's own law): the read
  // rides readJsonBody with its explicit generic, a malformed body
  // answers the house's polite 400 — a raw JSON-parse swallow would
  // join the audited exemplar class this route refuses.
  const door = await readJsonBody<{ storeId?: unknown; phone?: unknown }>(request);
  if (!door.ok) return bodyDoorRejected('{ "storeId": "…", "phone": "07…" }');

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

  const { storeId, phone } = parsed.data;

  return runWithoutTenant(async () => {
    // ORG-SCOPED BY SHAPE: updateMany cannot address a store outside the
    // session's organization, and its count answers the 404 honestly —
    // an update that matched nothing never leaks that the id existed.
    const written = await db.store.updateMany({
      where: { id: storeId, organizationId: session.organizationId },
      data: { phone },
    });

    if (written.count === 0) {
      return NextResponse.json(
        { success: false, error: 'Store not found in your organization.' },
        { status: 404 },
      );
    }

    await systemLog({
      action: 'STORE_PHONE_UPDATED',
      component: 'STORES',
      severity: 'INFO',
      message: `Share phone updated for store ${storeId} (***${phone.slice(-3)})`,
      userId: session.userId,
    });

    return NextResponse.json({
      success: true,
      data: { storeId, phone },
    });
  });
}

// PATCH: SUPER_ADMIN or STORE_OWNER only (the vat rate's own law).
export const PATCH = withErrorBoundary(
  requireAuth(patchHandler, { roles: ['SUPER_ADMIN', 'STORE_OWNER'] }),
  'STORES',
);
