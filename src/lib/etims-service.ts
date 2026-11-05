// MBUMAH HARDWARE POS - KRA eTIMS Service (Mock Implementation)
//
// Service for Kenya Revenue Authority eTIMS API integration.
// This is a mock implementation that simulates KRA API responses.
// In production, replace the mock calls with actual KRA eTIMS API requests.

import { formatEtimsDate, generateInvoiceNumber, validateKraPin, validateKraPinDetailed, buildQrCodePayload } from './etims-utils';
import type {
  EtimsCustomerSearchResponse,
  EtimsInvoiceStatusResponse,
  EtimsStockMasterResponse,
} from './etims-types';

export interface EtimsConfig {
  baseUrl: string;
  bvsn: string;
  tin: string;
  branchId: string;
  deviceSerial: string;
  sandbox: boolean;
}

export interface EtimsProduct {
  productId: string;
  name: string;
  description?: string;
  price: number;
  taxType: string;
  unit: string;
  categoryCode?: string;
}

export interface EtimsInvoice {
  invoiceNumber: string;
  date: Date;
  customerTin?: string;
  customerName: string;
  items: Array<{
    itemCode: string;
    name: string;
    quantity: number;
    price: number;
    taxRate: number;
    discount?: number;
  }>;
  payments: Array<{
    method: string;
    amount: number;
    reference?: string;
  }>;
  totalAmount: number;
  vatAmount: number;
}

export interface EtimsInvoiceResponse {
  invoiceNumber: string;
  qrCode: string;
  url: string;
  status: 'ISSUED' | 'PENDING' | 'FAILED';
  issuedAt: Date;
}

export interface EtimsProductResponse {
  itemCode: string;
  status: 'REGISTERED' | 'PENDING' | 'FAILED';
  registeredAt: Date;
}

/**
 * The local stock-master aggregation (v2.401.0) — ONE home for the math the
 * sandbox client and the stock-report route's no-profile fallback both
 * speak. Reads the store's active products with their in-window stock
 * movements and answers the full `EtimsStockMasterResponse` contract: the
 * per-item row (opening = closing − purchased + sold − adjusted), the
 * summary totals, and the measured latencyMs. The dynamic `db` import keeps
 * this module client-safe (the same rule the factory's own store loader
 * already spoke).
 */
export async function buildLocalStockMaster(
  storeId: string,
  startDate: Date,
  endDate: Date,
): Promise<EtimsStockMasterResponse> {
  const startedAt = Date.now();
  const { db } = await import('./db');
  const products = await db.product.findMany({
    where: { storeId, isActive: true },
    include: {
      stockMovements: {
        where: { createdAt: { gte: startDate, lte: endDate } },
        select: { quantity: true, movementType: true },
      },
    },
  });

  const rows = products.map((p) => {
    const sold = p.stockMovements.filter((m) => m.movementType === 'SALE').reduce((acc, m) => acc + Math.abs(Number(m.quantity)), 0);
    const purchased = p.stockMovements.filter((m) => m.movementType === 'PURCHASE').reduce((acc, m) => acc + Number(m.quantity), 0);
    const adjusted = p.stockMovements.filter((m) => m.movementType === 'ADJUSTMENT').reduce((acc, m) => acc + Number(m.quantity), 0);
    const closing = Number(p.quantityInStock);
    const opening = closing - purchased + sold - adjusted;
    return {
      itemCode: p.etimsItemCode || p.sku,
      itemName: p.name,
      hsCode: '0000.00.00',
      unitType: p.unitType,
      openingStock: opening,
      closingStock: closing,
      quantitySold: sold,
      quantityPurchased: purchased,
      quantityAdjusted: adjusted,
      closingStockValue: closing * Number(p.costPrice),
    };
  });

  return {
    success: true,
    storeId,
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
    rows,
    summary: {
      totalItems: rows.length,
      totalClosingValue: Math.round(rows.reduce((acc, r) => acc + r.closingStockValue, 0) * 100) / 100,
      totalSold: rows.reduce((acc, r) => acc + r.quantitySold, 0),
      totalPurchased: rows.reduce((acc, r) => acc + r.quantityPurchased, 0),
    },
    latencyMs: Math.max(0, Date.now() - startedAt),
  };
}

/**
 * Initialize an eTIMS client with the given configuration.
 */
export function initializeEtimsClient(config: EtimsConfig) {
  return {
    config,
    isSandbox: config.sandbox,

    async registerProduct(product: EtimsProduct): Promise<EtimsProductResponse> {
      console.info('[eTIMS] Registering product:', product.productId);
      // Mock: generate a deterministic item code
      const itemCode = `ITEM${product.productId.slice(-8).toUpperCase()}`;
      return {
        itemCode,
        status: 'REGISTERED',
        registeredAt: new Date(),
      };
    },

    async issueInvoice(invoice: EtimsInvoice): Promise<EtimsInvoiceResponse> {
      console.info('[eTIMS] Issuing invoice:', invoice.invoiceNumber);
      const qrData = buildQrCodePayload({
        invoiceNumber: invoice.invoiceNumber,
        tin: config.tin,
        date: invoice.date,
        totalAmount: invoice.totalAmount,
        vatAmount: invoice.vatAmount,
        customerTin: invoice.customerTin,
      });
      return {
        invoiceNumber: invoice.invoiceNumber,
        qrCode: qrData,
        url: `https://etims.kra.go.ke/verify/${invoice.invoiceNumber}`,
        status: 'ISSUED',
        issuedAt: new Date(),
      };
    },

    async cancelInvoice(invoiceNumber: string, _reason: string): Promise<{
      success: boolean;
      status: string;
      cancellationReference?: string;
      httpStatus?: number;
      latencyMs?: number;
      errorMessage?: string;
    }> {
      console.info('[eTIMS] Cancelling invoice:', invoiceNumber);
      return {
        success: true,
        status: 'CANCELLED',
        cancellationReference: `CANCEL-${invoiceNumber}`,
        httpStatus: 200,
        latencyMs: Math.round(Math.random() * 200 + 50),
      };
    },

    // v2.401.0: the three stub methods below speak the FULL response
    // contracts (EtimsCustomerSearchResponse / EtimsInvoiceStatusResponse /
    // EtimsStockMasterResponse) their routes always promised — the IEtimsClient
    // interface already declared those shapes, but this object's inferred
    // narrow returns were what every call site actually saw. The sandbox
    // answers honestly: the measured latency, the absent fields left absent
    // (no fabricated cuPin — the sandbox has no control unit to speak for).
    async getInvoiceStatus(invoiceNumber: string): Promise<EtimsInvoiceStatusResponse> {
      const startedAt = Date.now();
      return {
        success: true,
        invoiceNumber,
        status: 'ISSUED',
        referenceNumber: invoiceNumber,
        httpStatus: 200,
        latencyMs: Math.max(0, Date.now() - startedAt),
      };
    },

    async customerSearch(tin: string): Promise<EtimsCustomerSearchResponse> {
      const startedAt = Date.now();
      const pinCheck = validateKraPinDetailed(tin);
      if (!pinCheck.valid || !pinCheck.normalized) {
        return {
          success: false,
          errorMessage: pinCheck.error || 'Invalid KRA PIN.',
          httpStatus: 400,
          latencyMs: Math.max(0, Date.now() - startedAt),
        };
      }
      // Mock customer lookup
      return {
        success: true,
        customer: {
          tin: pinCheck.normalized,
          name: 'Verified KRA Taxpayer',
        },
        httpStatus: 200,
        latencyMs: Math.max(0, Date.now() - startedAt),
      };
    },

    async stockMasterReport(storeId: string, startDate: Date, endDate: Date): Promise<EtimsStockMasterResponse> {
      return buildLocalStockMaster(storeId, startDate, endDate);
    },

    async branchInfo(): Promise<{ branchId: string; branchName: string; status: string }> {
      return {
        branchId: config.branchId,
        branchName: 'MBUMAH HARDWARE',
        status: 'ACTIVE',
      };
    },

    async testConnection(): Promise<{ success: boolean; message: string }> {
      return {
        success: true,
        message: config.sandbox
          ? 'Sandbox connection successful'
          : 'Production connection successful',
      };
    },
  };
}

/**
 * Get eTIMS configuration from environment variables.
 */
export function getEtimsConfig(): EtimsConfig {
  return {
    baseUrl: process.env.ETIMS_API_URL || 'https://etims-api-sbx.kra.go.ke',
    bvsn: process.env.ETIMS_BVSN || '',
    tin: process.env.ETIMS_TIN || process.env.KRA_PIN || '',
    branchId: process.env.ETIMS_BRANCH_ID || '',
    deviceSerial: process.env.ETIMS_DEVICE_SERIAL || '',
    sandbox: process.env.ETIMS_SANDBOX !== 'false',
  };
}

/**
 * F9-2 remediation: detect when the active eTIMS client is the built-in mock
 * (no ETIMS_API_URL configured / mock flag). Compliance control - the
 * issue-invoice route refuses to mark tax invoices as ISSUED when this is
 * true unless ETIMS_ALLOW_MOCK_ISSUANCE is explicitly set.
 */
export function isEtimsMock(): boolean {
  if (process.env.ETIMS_MODE === 'mock') return true;
  if (process.env.ETIMS_MODE === 'live') return false;
  // No explicit mode: mock when no API URL/credentials are configured.
  return !process.env.ETIMS_API_URL && !process.env.ETIMS_TIN && !process.env.KRA_PIN;
}

/**
 * Initialize an eTIMS client from a store ID, loading store-specific config from DB.
 */
export async function initializeEtimsClientFromStore(storeId: string) {
  try {
    const { db } = await import('./db');
    const store = await db.store.findUnique({
      where: { id: storeId },
      select: { taxPin: true, name: true },
    });
    const config: EtimsConfig = {
      baseUrl: process.env.ETIMS_API_URL || 'https://etims-api-sbx.kra.go.ke',
      bvsn: process.env.ETIMS_BVSN || '',
      tin: store?.taxPin || process.env.ETIMS_TIN || process.env.KRA_PIN || '',
      branchId: storeId,
      deviceSerial: process.env.ETIMS_DEVICE_SERIAL || '',
      sandbox: process.env.ETIMS_SANDBOX !== 'false',
    };
    return initializeEtimsClient(config);
  } catch (error) {
    console.error('[eTIMS] Failed to initialize client from store:', error);
    return null;
  }
}

export { formatEtimsDate, generateInvoiceNumber, validateKraPin };
