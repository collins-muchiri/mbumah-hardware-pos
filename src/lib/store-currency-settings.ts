// MBUMAH HARDWARE POS - Store default currency settings (v2.407.0)
//
// THE SECOND GHOST WAKES: /api/settings/currency originally selected a
// `Store.defaultCurrency` column the Prisma schema never carried - every
// call died in `PrismaClientValidationError` (5 strict-tsc faces since
// birth; the burst's proof mode documented the live 500s).
//
// The setting is real product intent ("the currency a cashier sees when
// they first log in"), and it has an honest home WITHOUT a migration:
// the global `SystemConfig` key-value store - the SAME home the
// admin-controlled VAT rate has lived in since v2.8.0 (see vat-settings.ts
// and PATCH /api/settings/vat). One key per store:
//
//   store:{storeId}:default_currency
//
// Reads answer `KES` (Kenya shillings - the platform base currency) when
// the key was never written; `isDefault` tells the two states apart so a
// caller can show "never set" honestly instead of a manufactured choice.
//
// NOTE (v2.407.0): the CurrencySwitcher stays session-local today; this
// lib makes the branch default a REAL, persisted, API-served setting that
// surfaces (and future wiring) can read - the value a fresh session may
// seed from, not a claim about what every component already consumes.

import { db } from '@/lib/db';
import type { CurrencyCode } from '@/lib/currency-utils';

/** The platform base currency (the schema's GiftCard.currency default too). */
export const DEFAULT_STORE_CURRENCY: CurrencyCode = 'KES';

/** The SystemConfig key that carries one store's default currency. */
export function storeCurrencyKey(storeId: string): string {
  return `store:${storeId}:default_currency`;
}

/** The description stamped on a freshly-created key row. */
export const STORE_CURRENCY_DESCRIPTION =
  'Branch default currency (the currency a cashier sees on first sign-in). Written by PATCH /api/settings/currency.';

export interface StoreCurrencySetting {
  currency: CurrencyCode;
  isDefault: boolean;
  updatedAt: string | null;
}

/**
 * Read one store's default currency. A never-set key answers the platform
 * default (KES) with isDefault: true - the honest "never chosen" state.
 */
export async function getStoreDefaultCurrency(
  storeId: string,
): Promise<StoreCurrencySetting> {
  const config = await db.systemConfig.findUnique({
    where: { key: storeCurrencyKey(storeId) },
    select: { value: true, updatedAt: true },
  });
  return {
    currency: (config?.value as CurrencyCode) ?? DEFAULT_STORE_CURRENCY,
    isDefault: config === null,
    updatedAt: config?.updatedAt?.toISOString() ?? null,
  };
}

/** Write one store's default currency (upsert - SystemConfig.key IS unique). */
export async function setStoreDefaultCurrency(
  storeId: string,
  currency: CurrencyCode,
): Promise<StoreCurrencySetting> {
  const saved = await db.systemConfig.upsert({
    where: { key: storeCurrencyKey(storeId) },
    update: { value: currency },
    create: {
      key: storeCurrencyKey(storeId),
      value: currency,
      description: STORE_CURRENCY_DESCRIPTION,
    },
    select: { value: true, updatedAt: true },
  });
  return {
    currency: saved.value as CurrencyCode,
    isDefault: false,
    updatedAt: saved.updatedAt.toISOString(),
  };
}
