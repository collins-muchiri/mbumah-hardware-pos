// GET/POST /api/products/[id]/bins
//
// v2.497.0 THE SHELF'S OWN ADDRESS — the bin door's wire. A product's
// shelf addresses live on BinLocation rows (the model existed from the
// start; the desk arrives this round). The map wire
// (/api/bin-locations) answers the ROW's chip; THIS wire answers the
// PRODUCT's door: the full bin list (active first, oldest first) and
// the add door.
//
// GET   ?storeId=…  → the product's bins (the door's list).
// POST  {aisle?, shelf?, bin?, locationCode?, quantity?, isActive?}
//                   → add a bin. The address is validated through the
//                     ONE home (validateBinLocationInput: trimmed, capped,
//                     the whole-empty row rejected). The storeId is
//                     DERIVED SERVER-SIDE from the product's own row —
//                     the body's storeId is never trusted.
//
// Auth: requireStoreAccess; writes gate to PRODUCT_EDIT_ROLES (the
// product PATCH's own posture — INVENTORY_MANAGER and manager-plus).

import { type NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { systemLog, withErrorBoundary } from '@/lib/logger';
import { requireStoreAccess, MANAGER_PLUS_ROLES, type AuthSession } from '@/lib/auth';
import { readJsonBody, bodyDoorRejected } from '@/lib/request-body';
import { LogSeverity, LogComponent } from '@/lib/types';
import { validateBinLocationInput } from '@/lib/bin-location';
import { toDec } from '@/lib/utils/financialMath';

export const dynamic = 'force-dynamic';

interface RouteContext {
  params: Promise<{ id: string }>;
}

async function listProductBinsHandler(...args: unknown[]): Promise<Response> {
  const _request = args[0] as NextRequest;
  const context = args[1] as RouteContext;
  const { id } = await context.params;

  const bins = await db.binLocation.findMany({
    where: { productId: id },
    orderBy: [{ isActive: 'desc' }, { createdAt: 'asc' }],
    select: {
      id: true,
      locationCode: true,
      aisle: true,
      shelf: true,
      bin: true,
      quantity: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return Response.json({ success: true, data: bins });
}

// The product PATCH's own posture (INVENTORY_MANAGER and manager-plus) —
// the shelf's address is a catalog edit, never a cashier's.
const BIN_EDIT_ROLES: readonly string[] = [...MANAGER_PLUS_ROLES, 'INVENTORY_MANAGER'];

async function addProductBinHandler(...args: unknown[]): Promise<Response> {
  const request = args[0] as NextRequest;
  const context = args[1] as RouteContext;
  const _session = args[2] as AuthSession;
  const { id } = await context.params;

  // The product's own row carries the store — the bin never names a store
  // the product doesn't live in.
  const product = await db.product.findUnique({ where: { id }, select: { id: true, storeId: true, name: true } });
  if (!product) {
    return Response.json({ success: false, error: 'Product not found.' }, { status: 404 });
  }

  const door = await readJsonBody<Record<string, unknown>>(request);
  if (!door.ok) {
    return bodyDoorRejected();
  }
  const body = door.body;

  const validation = validateBinLocationInput({
    aisle: typeof body.aisle === 'string' ? body.aisle : null,
    shelf: typeof body.shelf === 'string' ? body.shelf : null,
    bin: typeof body.bin === 'string' ? body.bin : null,
    locationCode: typeof body.locationCode === 'string' ? body.locationCode : null,
  });
  if (!validation.ok) {
    return Response.json({ success: false, error: validation.error }, { status: 400 });
  }

  const quantityRaw = body.quantity;
  let quantity = toDec(0);
  if (quantityRaw !== undefined && quantityRaw !== null && quantityRaw !== '') {
    const parsed = Number(quantityRaw);
    if (!Number.isFinite(parsed) || parsed < 0) {
      return Response.json(
        { success: false, error: 'The bin quantity is a number — zero or more.' },
        { status: 400 },
      );
    }
    quantity = toDec(parsed);
  }

  const created = await db.binLocation.create({
    data: {
      productId: product.id,
      storeId: product.storeId,
      aisle: validation.value.aisle || null,
      shelf: validation.value.shelf || null,
      bin: validation.value.bin || null,
      locationCode: validation.value.locationCode,
      quantity,
      isActive: body.isActive === undefined ? true : Boolean(body.isActive),
    },
    select: { id: true, locationCode: true },
  });

  systemLog(
    LogSeverity.INFO,
    LogComponent.INVENTORY,
    `bin location added: ${created.locationCode} (product ${product.id})`,
    { storeId: product.storeId },
  );

  return Response.json(
    { success: true, data: created, message: 'Bin location added.' },
    { status: 201 },
  );
}

export const GET = withErrorBoundary(requireStoreAccess(listProductBinsHandler), 'PRODUCT_BINS_LIST');
export const POST = withErrorBoundary(
  requireStoreAccess(addProductBinHandler, { roles: BIN_EDIT_ROLES }),
  'PRODUCT_BINS_ADD',
);
