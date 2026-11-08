// GET /api/reports/dead-stock
//
// v2.461.0 THE DEAD STOCK WIRE — the reports desk's ninth report. A
// product is dead stock when it HOLDS stock and its last sale is older
// than the idle window (30 | 60 | 90 days) — or it has never sold. The
// MEANING lives in src/lib/reports/dead-stock.ts (one home, the suite
// proves it without a database); this route gathers the facts and feeds
// the classifier.
//
// THE WIRE'S SHAPE (NAMING AS CONTRACT, the v2.206.0 law): the payload
// carries `rows` — NOT `products` / `items` / `data` — because the SPA's
// request() normalizer flattens an id-less envelope whose payload wears
// those array names down to the bare array, silently dropping the
// summary. `rows` is outside the unwrap list, so the wire arrives whole.

import { type NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { withErrorBoundary } from '@/lib/logger';
import { withSessionAuth } from '@/lib/auth';
import { classifyDeadStock, DEAD_STOCK_WINDOWS } from '@/lib/reports/dead-stock';

export const dynamic = 'force-dynamic';

async function getDeadStockHandler(...args: unknown[]): Promise<Response> {
  const request = args[0] as NextRequest;
  const { searchParams } = new URL(request.url);

  const storeId = searchParams.get('storeId');
  if (!storeId) {
    return Response.json(
      { success: false, error: 'storeId is required.' },
      { status: 400 }
    );
  }

  // THE WINDOW IS A TUPLE, NOT A STRING: only the lens's own three words
  // are legal. Default 90 (the widest honest window); anything else the
  // chips never spoke is a 400 — a made-up window would be a made-up
  // report.
  const daysRaw = searchParams.get('days');
  const DEFAULT_DAYS = 90;
  let days: number = DEFAULT_DAYS;
  if (daysRaw !== null) {
    const parsed = Number(daysRaw);
    if (!(DEAD_STOCK_WINDOWS as readonly number[]).includes(parsed)) {
      return Response.json(
        { success: false, error: `days must be one of ${DEAD_STOCK_WINDOWS.join(', ')}.` },
        { status: 400 }
      );
    }
    days = parsed;
  }

  const now = new Date();

  // The facts, leg one — every active product's shelf truth (cost and
  // quantity are Prisma Decimals; the classifier speaks numbers).
  const products = await db.product.findMany({
    where: { storeId, isActive: true },
    select: {
      id: true,
      name: true,
      sku: true,
      quantityInStock: true,
      costPrice: true,
      pricePerUnit: true,
      reorderLevel: true,
      unitType: true,
      category: { select: { name: true } },
    },
  });

  // The facts, leg two — each product's LAST completed-or-partial sale,
  // ever. The same sale vocabulary the fast-moving wire speaks
  // (transactionType SALE, paymentStatus COMPLETED/PARTIAL) — a draft,
  // a quotation and a cancelled ticket are not sales.
  const saleItems = await db.saleItem.findMany({
    where: {
      transaction: {
        storeId,
        transactionType: 'SALE',
        paymentStatus: { in: ['COMPLETED', 'PARTIAL'] },
      },
    },
    select: {
      productId: true,
      transaction: { select: { createdAt: true } },
    },
  });

  const lastSoldAtByProduct = new Map<string, string | null>();
  for (const item of saleItems) {
    if (!item.productId) continue;
    const createdAt = item.transaction.createdAt.toISOString();
    const prev = lastSoldAtByProduct.get(item.productId);
    if (prev === undefined || prev === null || createdAt > prev) {
      lastSoldAtByProduct.set(item.productId, createdAt);
    }
  }

  const { rows, summary } = classifyDeadStock(
    products.map((p) => ({
      id: p.id,
      name: p.name,
      sku: p.sku,
      quantityInStock: Number(p.quantityInStock),
      costPrice: Number(p.costPrice),
      pricePerUnit: Number(p.pricePerUnit),
      reorderLevel: Number(p.reorderLevel),
      unitType: p.unitType,
      categoryName: p.category?.name ?? null,
    })),
    lastSoldAtByProduct,
    now,
    days,
  );

  return Response.json({
    success: true,
    data: {
      rows,
      summary,
      generatedAt: now.toISOString(),
      range: {
        from: new Date(now.getTime() - days * 24 * 60 * 60 * 1000).toISOString(),
        to: now.toISOString(),
      },
    },
  });
}

// Session-validated like every reports wire — operational visibility,
// not margin-bearing; any store role may read it.
export const GET = withErrorBoundary(
  withSessionAuth(getDeadStockHandler),
  'DEAD_STOCK_REPORT',
);
