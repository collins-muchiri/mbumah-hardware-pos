// MBUMAH HARDWARE POS - Per-user email notification preferences (v2.407.0)
//
// THE GHOST WAKES: /api/notifications/settings shipped in an early release
// against four User columns (`emailNotifications`, `receiptEmails`,
// `stockAlertEmails`, `reportEmails`) that the Prisma schema NEVER carried -
// every call died in `PrismaClientValidationError` (strict tsc had flagged
// the 7 faces since birth; the burst's proof mode documented the live 500s).
// The settings were real product intent, so this lib re-homes them on the
// model that ACTUALLY exists: `NotificationPreference` (per-user rows on
// channel EMAIL, one row per alert type).
//
// THE FOUR TOGGLES → alert-type rows (channel EMAIL):
//   • emailNotifications → ALL          (the master switch - see below)
//   • receiptEmails      → RECEIPT
//   • stockAlertEmails   → LOW_STOCK    (the schema comment's real category)
//   • reportEmails       → DAILY_REPORT
//
// THE MASTER-SWITCH LAW (isChannelEnabled, notification-helpers.ts):
//   a send fires only when EVERY matching row is enabled - the matcher
//   collects the category row AND the ALL row, so a disabled ALL row
//   suppresses every email category at once. Missing rows read as ENABLED
//   ("no preference = default enabled" - the helper's own contract), which
//   is also the model's `isEnabled @default(true)`.
//
// THE ONE-ROW LAW: NotificationPreference has NO unique constraint on
// (userId, channel, alertType) - only indexes - so an upsert cannot be
// expressed. Every write runs deleteMany + create inside ONE array-form
// transaction (the promises are raw PrismaPromise objects, chained in
// field order): exactly one row per toggle, idempotent under retry, no
// read-modify-write race. (A duplicate row would be harmless - `every`
// still resolves - but the ledger reads better with one row per toggle.)

import { db } from '@/lib/db';
import { NotificationChannel } from '@/lib/notification-helpers';

/** The EMAIL channel every toggle in this lib lives on. */
export const EMAIL_PREFERENCES_CHANNEL = NotificationChannel.EMAIL;

/** The four updatable fields, in the order the API documents them. */
export const EMAIL_TOGGLE_FIELDS = [
  'emailNotifications',
  'receiptEmails',
  'stockAlertEmails',
  'reportEmails',
] as const;

export type EmailToggleField = (typeof EMAIL_TOGGLE_FIELDS)[number];

/** One toggle's honest identity: the row it owns + the words it speaks. */
export interface EmailToggleMeta {
  /** The NotificationPreference.alertType row this toggle owns. */
  alertType: string;
  /** Short human label (the card row's title). */
  label: string;
  /** One-line description (the card row's muted copy). */
  description: string;
}

/**
 * The toggle → row map. `ALL` is the master switch BY the helper's matcher
 * (every category check ANDs in the ALL row), not by convention.
 */
export const EMAIL_TOGGLE_META: Readonly<
  Record<EmailToggleField, EmailToggleMeta>
> = {
  emailNotifications: {
    alertType: 'ALL',
    label: 'Email notifications',
    description:
      'The master switch - off means no email at all, whatever the rows below say.',
  },
  receiptEmails: {
    alertType: 'RECEIPT',
    label: 'Receipt copies',
    description: 'Receive a copy of customer receipts as they are issued.',
  },
  stockAlertEmails: {
    alertType: 'LOW_STOCK',
    label: 'Stock alerts',
    description:
      'Receive low-stock alerts when items run below their reorder level.',
  },
  reportEmails: {
    alertType: 'DAILY_REPORT',
    label: 'Sales reports',
    description: 'Receive the daily sales report for your branch.',
  },
} as const;

/** The GET/contract shape (the four booleans the route speaks). */
export interface EmailSettings {
  emailNotifications: boolean;
  receiptEmails: boolean;
  stockAlertEmails: boolean;
  reportEmails: boolean;
}

/** The shape a fresh user reads: every toggle on (the helper's default). */
export const DEFAULT_EMAIL_SETTINGS: Readonly<EmailSettings> = {
  emailNotifications: true,
  receiptEmails: true,
  stockAlertEmails: true,
  reportEmails: true,
};

/** A user's NotificationPreference rows, narrowed to what this lib reads. */
export interface EmailPreferenceRowLike {
  channel: string;
  alertType: string;
  isEnabled: boolean;
}

/**
 * Fold the user's EMAIL rows into the four-toggle shape.
 * Missing row → enabled (the helper's "no preference = default enabled");
 * several rows for one alertType (impossible after the one-row law, but a
 * legacy hand-edit could plant one) → the row that speaks LOUDEST wins:
 * any disabled row means the toggle reads off (matching `every`'s verdict).
 */
export function rowsToEmailSettings(
  rows: readonly EmailPreferenceRowLike[],
): EmailSettings {
  const settings: EmailSettings = { ...DEFAULT_EMAIL_SETTINGS };
  for (const row of rows) {
    if (row.channel !== EMAIL_PREFERENCES_CHANNEL) continue;
    const field = EMAIL_TOGGLE_FIELDS.find(
      (f) => EMAIL_TOGGLE_META[f].alertType === row.alertType,
    );
    if (!field) continue; // a foreign alertType row is nobody's toggle
    if (!row.isEnabled) settings[field] = false;
  }
  return settings;
}

/** Narrow an unknown PATCH body field to a boolean, or null when junk. */
export function toBool(value: unknown): boolean | null {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    if (value === 'true') return true;
    if (value === 'false') return false;
  }
  if (typeof value === 'number') return value !== 0;
  return null;
}

/** Read one user's email settings (missing rows read enabled). */
export async function getEmailNotificationSettings(
  userId: string,
): Promise<EmailSettings> {
  const rows = await db.notificationPreference.findMany({
    where: { userId, channel: EMAIL_PREFERENCES_CHANNEL },
    select: { channel: true, alertType: true, isEnabled: true },
  });
  return rowsToEmailSettings(rows);
}

/**
 * Write the given toggles (deleteMany + create per field, ONE array-form
 * transaction - the one-row law). Returns the refreshed settings shape.
 */
export async function updateEmailNotificationSettings(
  userId: string,
  updates: Partial<Record<EmailToggleField, boolean>>,
): Promise<EmailSettings> {
  const fields = Object.keys(updates) as EmailToggleField[];
  const ops = fields.flatMap((field) => {
    const alertType = EMAIL_TOGGLE_META[field].alertType;
    const isEnabled = updates[field] === true;
    return [
      db.notificationPreference.deleteMany({
        where: { userId, channel: EMAIL_PREFERENCES_CHANNEL, alertType },
      }),
      db.notificationPreference.create({
        data: {
          userId,
          channel: EMAIL_PREFERENCES_CHANNEL,
          alertType,
          isEnabled,
        },
        select: { id: true },
      }),
    ];
  });
  await db.$transaction(ops);
  return getEmailNotificationSettings(userId);
}
