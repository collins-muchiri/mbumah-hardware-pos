// GET /api/etims/stock-report?storeId=xxx&startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
//
// Generate a KRA stock master report for the given date range. The report
// aggregates StockMovement + Product data locally (KRA's stock endpoint
// expects the data we'd compute locally anyway).
//
// Query params:
//   storeId - required (enforced by requireStoreAccess)
//   startDate - required (YYYY-MM-DD, inclusive)
//   endDate - required (YYYY-MM-DD, inclusive)
//
// Auth: SUPER_ADMIN, ACCOUNTANT (financial reporting roles only).
//
// Returns: EtimsStockMasterResponse (rows + summary totals).

import { type NextRequest } from 'next/server';
import { systemLog, withErrorBoundary } from '@/lib/logger';
import { LogSeverity, LogComponent } from '@/lib/types';
import { requireStoreAccess } from '@/lib/auth';
import { initializeEtimsClientFromStore, buildLocalStockMaster } from '@/lib/etims-service';

export const dynamic = 'force-dynamic';

const ALLOWED_ROLES = ['SUPER_ADMIN', 'ACCOUNTANT'];

async function stockReportHandler(
  request: NextRequest,
  session: { userId: string; role: string; storeId: string | null; email: string },
): Promise<Response> {
  if (!ALLOWED_ROLES.includes(session.role)) {
    return Response.json(
      { success: false, error: 'Insufficient permissions. Only SUPER_ADMIN and ACCOUNTANT may generate stock reports for KRA.' },
      { status: 403 },
    );
  }

  const { searchParams } = new URL(request.url);
  const storeId = searchParams.get('storeId') || session.storeId;
  const startDateStr = searchParams.get('startDate');
  const endDateStr = searchParams.get('endDate');

  if (!storeId) {
    return Response.json({ success: false, error: 'storeId is required.' }, { status: 400 });
  }
  if (!startDateStr || !endDateStr) {
    return Response.json(
      { success: false, error: 'startDate and endDate are required (YYYY-MM-DD).' },
      { status: 400 },
    );
  }

  // Parse dates. The end date is treated as inclusive - extend to 23:59:59.
  const startDate = new Date(startDateStr + 'T00:00:00');
  const endDate = new Date(endDateStr + 'T23:59:59.999');
  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    return Response.json(
      { success: false, error: 'Invalid date format. Use YYYY-MM-DD.' },
      { status: 400 },
    );
  }
  if (startDate > endDate) {
    return Response.json(
      { success: false, error: 'startDate must be on or before endDate.' },
      { status: 400 },
    );
  }

  // 1. Load eTIMS client (optional - the report is computed locally, but we
  //       still log via the client for audit and may POST to KRA in production)
  //       If no profile is configured, we still build the report from local data.
  const client = await initializeEtimsClientFromStore(storeId);

  // 2. Build the report
  // v2.401.0: ONE home for the aggregation — the sandbox client and the
  // no-profile fallback both read `buildLocalStockMaster` (the same math
  // that used to live inline in this route's else-branch); the client branch
  // may POST to KRA in production, the sandbox answers with the same local
  // computation, so `result` speaks one shape on every path.
  let result;
  if (client) {
    result = await client.stockMasterReport(storeId, startDate, endDate);
  } else {
    // Local-only fallback (no KRA profile).
    result = await buildLocalStockMaster(storeId, startDate, endDate);
  }

  // 3. Audit log
  await systemLog({
    action: 'ETIMS_STOCK_REPORT_GENERATED',
    component: LogComponent.INVENTORY,
    severity: LogSeverity.INFO,
    message: `eTIMS stock report for store ${storeId}: ${result.summary.totalItems} items, closing value KES ${result.summary.totalClosingValue}`,
    userId: session.userId,
    storeId,
    metadata: {
      storeId,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      totalItems: result.summary.totalItems,
      totalClosingValue: result.summary.totalClosingValue,
      totalSold: result.summary.totalSold,
      totalPurchased: result.summary.totalPurchased,
      kraProfileActive: !!client,
    },
  });

  return Response.json({
    success: true,
    data: result,
    message: `Stock report generated: ${result.summary.totalItems} items, closing value KES ${result.summary.totalClosingValue.toLocaleString()}.`,
  });
}

export const GET = withErrorBoundary(
  requireStoreAccess(stockReportHandler),
  'ETIMS_STOCK_REPORT',
);
