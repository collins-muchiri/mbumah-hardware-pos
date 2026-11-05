// GET, PATCH /api/notifications/settings
//
// Per-user email notification preferences (v2.407.0 - THE GHOST WAKES).
// The four toggles live on the REAL NotificationPreference model (channel
// EMAIL, one row per alert type) via src/lib/notification-preferences.ts -
// NOT on the four User columns this route originally selected (columns the
// schema never carried; every call died in PrismaClientValidationError).
//   • emailNotifications - master switch (false = no email at all)
//   • receiptEmails - receive customer receipt copies
//   • stockAlertEmails - receive low-stock alerts
//   • reportEmails - receive daily sales reports
//
// GET returns the current user's settings (missing rows read enabled -
// the helper's "no preference = default enabled" contract).
// PATCH updates them - only the four boolean fields above are accepted; any
// other field in the body is silently ignored to prevent mass-assignment
// vulnerabilities. Each write is deleteMany + create inside one
// transaction (the one-row law - the model has no unique to upsert on).
//
// Auth: any authenticated user (requireAuth with no role restriction).

import { type NextRequest } from 'next/server';
import { withErrorBoundary, systemLog } from '@/lib/logger';
import { requireAuth, type AuthSession } from '@/lib/auth';
import { LogSeverity, LogComponent } from '@/lib/types';
import {
  EMAIL_TOGGLE_FIELDS,
  getEmailNotificationSettings,
  toBool,
  updateEmailNotificationSettings,
  type EmailSettings,
  type EmailToggleField,
} from '@/lib/notification-preferences';

export const dynamic = 'force-dynamic';

// GET

async function getSettingsHandler(
  _request: NextRequest,
  session: AuthSession,
): Promise<Response> {
  const settings = await getEmailNotificationSettings(session.userId);

  return Response.json({
    success: true,
    data: settings,
  });
}

// PATCH

async function patchSettingsHandler(
  request: NextRequest,
  session: AuthSession,
): Promise<Response> {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json(
      { success: false, error: 'Invalid JSON body.' },
      { status: 400 },
    );
  }

  // Build the update payload from ONLY the allowed boolean fields.
  const updates: Partial<Record<EmailToggleField, boolean>> = {};

  let changedCount = 0;
  for (const field of EMAIL_TOGGLE_FIELDS) {
    if (field in body) {
      const value = toBool(body[field]);
      if (value === null) {
        return Response.json(
          {
            success: false,
            error: `Field "${field}" must be a boolean (true/false).`,
          },
          { status: 400 },
        );
      }
      updates[field] = value;
      changedCount++;
    }
  }

  if (changedCount === 0) {
    return Response.json(
      {
        success: false,
        error:
          'No valid fields to update. Provide at least one of: emailNotifications, receiptEmails, stockAlertEmails, reportEmails.',
      },
      { status: 400 },
    );
  }

  const updated: EmailSettings = await updateEmailNotificationSettings(
    session.userId,
    updates,
  );

  // Best-effort audit log - never block the response on logging.
  void systemLog({
    action: 'NOTIFICATION_SETTINGS_UPDATED',
    component: LogComponent.AUDIT,
    severity: LogSeverity.INFO,
    message: `User ${session.email} updated notification settings: ${Object.keys(updates).join(', ')}`,
    userId: session.userId,
    metadata: { updatedFields: updates },
  }).catch(() => {
    /* logging must never block */
  });

  return Response.json({
    success: true,
    data: updated,
  });
}

export const GET = withErrorBoundary(
  requireAuth(getSettingsHandler),
  'NOTIFICATIONS_SETTINGS_GET',
);

export const PATCH = withErrorBoundary(
  requireAuth(patchSettingsHandler),
  'NOTIFICATIONS_SETTINGS_UPDATE',
);
