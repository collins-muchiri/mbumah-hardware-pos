import { NextResponse } from 'next/server';
import { getEtimsConfig } from '@/lib/etims-service';
import { withErrorBoundary } from '@/lib/logger';
import { withSessionAuth, MANAGER_PLUS_ROLES } from '@/lib/auth';
import { readJsonBody, bodyDoorRejected } from '@/lib/request-body';

export const dynamic = 'force-dynamic';

// GET /api/etims/settings - Get eTIMS configuration (masked).
async function getEtimsSettingsHandler(..._args: unknown[]): Promise<Response> {
  const config = getEtimsConfig();
  // Mask sensitive fields
  return NextResponse.json({
    success: true,
    data: {
      baseUrl: config.baseUrl,
      bvsn: config.bvsn ? '****' : '',
      tin: config.tin,
      branchId: config.branchId,
      deviceSerial: config.deviceSerial ? '****' : '',
      sandbox: config.sandbox,
      isConfigured: Boolean(config.tin && config.branchId && config.bvsn),
    },
  });
}

// PUT /api/etims/settings - Update eTIMS configuration.
async function putEtimsSettingsHandler(...args: unknown[]): Promise<Response> {
  const request = args[0] as Request;
  try {
    // THE BODY DOOR: an unreadable body is a client mistake (v2.326.0):
    // v2.336.0 the door names the five config fields the handler logs
    // (all read as unknown — the handler only inspects truthiness).
    const door = await readJsonBody<{
      sandbox?: unknown;
      tin?: unknown;
      branchId?: unknown;
      bvsn?: unknown;
      deviceSerial?: unknown;
    }>(request);
    if (!door.ok) {
      return bodyDoorRejected();
    }
    const body = door.body;
    const { sandbox, tin, branchId, bvsn, deviceSerial } = body;

    // In a real implementation, these would be saved to environment or database
    // For now, we log the update request
    console.info('[eTIMS settings] Update request:', {
      sandbox,
      tin: tin ? '****' : undefined,
      branchId,
      hasBvsn: Boolean(bvsn),
      hasDeviceSerial: Boolean(deviceSerial),
    });

    return NextResponse.json({
      success: true,
      message: 'eTIMS settings updated. Restart required for env-based settings.',
    });
  } catch (error) {
    console.error('[eTIMS settings] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update eTIMS settings' },
      { status: 500 }
    );
  }
}

// AUDIT FIX (Task 3-d): session-validated (was completely unguarded).
// GET = any store role (masked config read for the settings UI);
// PUT (KRA device configuration) = manager-or-above.
export const GET = withErrorBoundary(
  withSessionAuth(getEtimsSettingsHandler),
  'ETIMS_SETTINGS',
);
export const PUT = withErrorBoundary(
  withSessionAuth(putEtimsSettingsHandler, { roles: MANAGER_PLUS_ROLES }),
  'ETIMS_SETTINGS_UPDATE',
);
