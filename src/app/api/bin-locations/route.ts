// GET /api/bin-locations
//
// v2.497.0 THE SHELF'S OWN ADDRESS — the desk's chip map. The inventory
// desk's rows name each product's shelf address (the first active bin,
// oldest first) with ONE grouped read: the store's active bins, lean
// (productId + locationCode + quantity), sorted so the desk's map picks
// the standing address. The door's own wire lives beside it
// (/api/products/[id]/bins) — the map answers the ROW, the door answers
// the PRODUCT; never a per-row fan-out.
//
// Auth: requireStoreAccess (store-scoped; the ORM tenant context scopes
// non-admin reads to their own store, mirroring /api/stock-takes).

import { type NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { withErrorBoundary } from '@/lib/logger';
import { requireStoreAccess, type AuthSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

async function listBinLocationsHandler(request: NextRequest, _session: AuthSession): Promise<Response> {
  const storeId = new URL(request.url).searchParams.get('storeId');
  if (!storeId) {
    return Response.json({ success: false, error: 'storeId is required.' }, { status: 400 });
  }

  const bins = await db.binLocation.findMany({
    where: { storeId, isActive: true },
    orderBy: [{ productId: 'asc' }, { createdAt: 'asc' }],
    select: {
      productId: true,
      locationCode: true,
      quantity: true,
    },
  });

  return Response.json({ success: true, data: bins });
}

export const GET = withErrorBoundary(requireStoreAccess(listBinLocationsHandler), 'BIN_LOCATIONS_MAP');
