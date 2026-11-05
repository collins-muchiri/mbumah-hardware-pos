// MBUMAH HARDWARE POS - Store Default Currency Settings API (v2.407.0)
//
// GET   /api/settings/currency?storeId=... - return the store's default currency
// PATCH /api/settings/currency - update the store's default currency
//
// The store's default currency is persisted in the global SystemConfig
// key-value store under `store:{storeId}:default_currency` (see
// src/lib/store-currency-settings.ts - the SAME home the admin-controlled
// VAT rate has used since v2.8.0). It is the currency a cashier sees when
// they first log in - they can still override it via the CurrencySwitcher
// for the current session. A never-set key answers KES with isDefault:
// true (the honest "never chosen" state).
//
// Auth:
//   • GET - any authenticated user with store access.
//   • PATCH - SUPER_ADMIN or STORE_OWNER only.

import { type NextRequest, NextResponse } from 'next/server';
import { runWithoutTenant } from '@/lib/db';
import { requireAuth, type AuthSession } from '@/lib/auth';
import { withErrorBoundary } from '@/lib/logger';
import { SUPPORTED_CURRENCIES, type CurrencyCode } from '@/lib/currency-utils';
import {
  getStoreDefaultCurrency,
  setStoreDefaultCurrency,
} from '@/lib/store-currency-settings';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const SUPPORTED_CODES = SUPPORTED_CURRENCIES.map((c) => c.code) as [
  CurrencyCode,
  ...CurrencyCode[],
];

// GET: return store default currency
async function getHandler(
  request: NextRequest,
  session: AuthSession,
): Promise<Response> {
  const { searchParams } = new URL(request.url);
  // SUPER_ADMIN can query any store; everyone else is scoped to their own.
  const storeId = searchParams.get('storeId') || session.storeId || '';
  if (!storeId) {
    return NextResponse.json(
      { success: false, error: 'storeId query parameter is required.' },
      { status: 400 },
    );
  }

  return runWithoutTenant(async () => {
    const setting = await getStoreDefaultCurrency(storeId);

    return NextResponse.json({
      success: true,
      data: {
        storeId,
        defaultCurrency: setting.currency,
        isDefault: setting.isDefault,
        updatedAt: setting.updatedAt,
        supportedCurrencies: SUPPORTED_CURRENCIES,
      },
    });
  });
}

// PATCH: update store default currency
const patchBodySchema = z.object({
  storeId: z.string().min(1, 'storeId is required'),
  defaultCurrency: z.enum(SUPPORTED_CODES),
});

async function patchHandler(
  request: NextRequest,
  session: AuthSession,
): Promise<Response> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: 'Invalid JSON body.' },
      { status: 400 },
    );
  }

  const parsed = patchBodySchema.safeParse(body);
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

  const { storeId, defaultCurrency } = parsed.data;

  // Non-SUPER_ADMIN users can only update their own store.
  if (session.role !== 'SUPER_ADMIN' && session.storeId && session.storeId !== storeId) {
    return NextResponse.json(
      { success: false, error: 'You can only update the default currency of your own store.' },
      { status: 403 },
    );
  }

  return runWithoutTenant(async () => {
    const setting = await setStoreDefaultCurrency(storeId, defaultCurrency);

    return NextResponse.json({
      success: true,
      data: {
        storeId,
        defaultCurrency: setting.currency,
        isDefault: setting.isDefault,
        updatedAt: setting.updatedAt,
      },
    });
  });
}

// GET: any authenticated user (store access enforced by session.storeId fallback).
export const GET = withErrorBoundary(
  requireAuth(getHandler),
  'SETTINGS_CURRENCY_GET',
);

// PATCH: SUPER_ADMIN or STORE_OWNER only.
export const PATCH = withErrorBoundary(
  requireAuth(patchHandler, { roles: ['SUPER_ADMIN', 'STORE_OWNER'] }),
  'SETTINGS_CURRENCY_PATCH',
);
