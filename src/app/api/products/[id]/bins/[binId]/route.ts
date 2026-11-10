// PATCH/DELETE /api/products/[id]/bins/[binId]
//
// v2.497.0 THE SHELF'S OWN ADDRESS — the bin row's own doors. The door's
// edit speaks the ONE home's validation (the same caps, the same
// whole-empty rejection); the delete is the row's honest removal (a
// shelf address is a child detail — the product stays, the row goes).
//
// PATCH {aisle?, shelf?, bin?, locationCode?, quantity?, isActive?}
//                   → edit the row. Absent parts keep the row's own words;
//                     present parts recompose through the ONE home's
//                     validation; an explicit code wins over the parts.
//                     Quantity is a number zero or more; isActive toggles
//                     the row's seat on the shelf.
// DELETE            → remove the row.
//
// Auth: requireStoreAccess + BIN_EDIT_ROLES (the product PATCH's own
// posture).

import { type NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { systemLog, withErrorBoundary } from '@/lib/logger';
import { requireStoreAccess, MANAGER_PLUS_ROLES, type AuthSession } from '@/lib/auth';
import { readJsonBody, bodyDoorRejected } from '@/lib/request-body';
import { LogSeverity, LogComponent } from '@/lib/types';
import { validateBinLocationInput } from '@/lib/bin-location';
import { toDec } from '@/lib/utils/financialMath';

export const dynamic = 'force-dynamic';

const BIN_EDIT_ROLES: readonly string[] = [...MANAGER_PLUS_ROLES, 'INVENTORY_MANAGER'];

interface RouteContext {
  params: Promise<{ id: string; binId: string }>;
}

// THE EXPLICIT SHAPE (the v2.339/v2.344 tombstones — the loose Record
// widening stays dead, tree-wide): every field the door reads, named.
interface BinRowBody {
  aisle?: unknown;
  shelf?: unknown;
  bin?: unknown;
  locationCode?: unknown;
  quantity?: unknown;
  isActive?: unknown;
}

async function resolveBin(productId: string, binId: string) {
  return db.binLocation.findFirst({ where: { id: binId, productId } });
}

async function updateBinHandler(request: NextRequest, _session: AuthSession, context: RouteContext): Promise<Response> {
  const { id, binId } = await context.params;

  const existing = await resolveBin(id, binId);
  if (!existing) {
    return Response.json({ success: false, error: 'Bin location not found.' }, { status: 404 });
  }

  const door = await readJsonBody<BinRowBody>(request);
  if (!door.ok) {
    return bodyDoorRejected();
  }
  const body = door.body;

  const validation = validateBinLocationInput({
    aisle: typeof body.aisle === 'string' ? body.aisle : (existing.aisle ?? null),
    shelf: typeof body.shelf === 'string' ? body.shelf : (existing.shelf ?? null),
    bin: typeof body.bin === 'string' ? body.bin : (existing.bin ?? null),
    locationCode: typeof body.locationCode === 'string' ? body.locationCode : (existing.locationCode ?? null),
  });
  if (!validation.ok) {
    return Response.json({ success: false, error: validation.error }, { status: 400 });
  }

  const data: Record<string, unknown> = {
    aisle: validation.value.aisle || null,
    shelf: validation.value.shelf || null,
    bin: validation.value.bin || null,
    locationCode: validation.value.locationCode,
  };

  if (body.quantity !== undefined) {
    const parsed = Number(body.quantity);
    if (!Number.isFinite(parsed) || parsed < 0) {
      return Response.json(
        { success: false, error: 'The bin quantity is a number — zero or more.' },
        { status: 400 },
      );
    }
    data.quantity = toDec(parsed);
  }
  if (body.isActive !== undefined) {
    data.isActive = Boolean(body.isActive);
  }

  const updated = await db.binLocation.update({
    where: { id: existing.id },
    data: data as { [key: string]: never },
    select: { id: true, locationCode: true, isActive: true },
  });

  systemLog({
    action: 'bin-location-updated',
    component: LogComponent.INVENTORY,
    severity: LogSeverity.INFO,
    message: `bin location updated: ${updated.locationCode} (product ${id})`,
    storeId: existing.storeId,
  });

  return Response.json({ success: true, data: updated, message: 'Bin location updated.' });
}

async function deleteBinHandler(_request: NextRequest, _session: AuthSession, context: RouteContext): Promise<Response> {
  const { id, binId } = await context.params;

  const existing = await resolveBin(id, binId);
  if (!existing) {
    return Response.json({ success: false, error: 'Bin location not found.' }, { status: 404 });
  }

  await db.binLocation.delete({ where: { id: existing.id } });

  systemLog({
    action: 'bin-location-removed',
    component: LogComponent.INVENTORY,
    severity: LogSeverity.INFO,
    message: `bin location removed: ${existing.locationCode} (product ${id})`,
    storeId: existing.storeId,
  });

  return Response.json({ success: true, message: 'Bin location removed.' });
}

export const PATCH = withErrorBoundary(
  requireStoreAccess(updateBinHandler, { roles: BIN_EDIT_ROLES }),
  'PRODUCT_BINS_UPDATE',
);
export const DELETE = withErrorBoundary(
  requireStoreAccess(deleteBinHandler, { roles: BIN_EDIT_ROLES }),
  'PRODUCT_BINS_DELETE',
);
