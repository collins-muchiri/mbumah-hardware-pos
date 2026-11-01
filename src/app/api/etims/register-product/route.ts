import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getEtimsConfig, initializeEtimsClient } from '@/lib/etims-service';
// v2.17.8 (Task 44 - security hardening): this route registers a product with
// the KRA eTIMS API (an external, money-adjacent regulatory action) with NO
// session validation at all - any junk Bearer token (the edge proxy checks
// presence only) could register any product id. It now requires a
// manager-or-above session (requireStoreAccess + MANAGER_PLUS_ROLES); the
// ORM tenant scope also narrows the product lookup, so a foreign store's
// product id answers 404 instead of being registered.
import { requireStoreAccess, MANAGER_PLUS_ROLES } from '@/lib/auth';
import { readJsonBody, bodyDoorRejected } from '@/lib/request-body';

export const dynamic = 'force-dynamic';

// POST /api/etims/register-product - Register a product with KRA eTIMS
async function registerProductHandler(...args: unknown[]): Promise<Response> {
  const request = args[0] as Request;
  try {
    // THE BODY DOOR: an unreadable body is a client mistake (v2.326.0):
    // v2.336.0 the door speaks the one field the handler consumes.
    const door = await readJsonBody<{ productId?: string }>(request);
    if (!door.ok) {
      return bodyDoorRejected();
    }
    const body = door.body;
    const { productId } = body;

    if (!productId) {
      return NextResponse.json(
        { success: false, error: 'Product ID is required' },
        { status: 400 }
      );
    }

    const product = await db.product.findUnique({ where: { id: productId } });
    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    const config = getEtimsConfig();
    const client = initializeEtimsClient(config);

    const response = await client.registerProduct({
      productId: product.id,
      name: product.name,
      description: product.description || undefined,
      price: Number(product.pricePerUnit),
      taxType: product.etimsTaxType || 'A',
      unit: product.unitType || 'EACH',
      categoryCode: product.categoryId || undefined,
    });

    await db.product.update({
      where: { id: productId },
      data: {
        etimsItemCode: response.itemCode,
        etimsRegisteredAt: response.registeredAt,
        etimsTaxType: product.etimsTaxType || 'A',
      },
    });

    return NextResponse.json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error('[eTIMS register-product] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to register product with KRA' },
      { status: 500 }
    );
  }
}

export const POST = requireStoreAccess(registerProductHandler, {
  roles: MANAGER_PLUS_ROLES,
});
