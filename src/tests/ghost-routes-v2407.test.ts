import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  EMAIL_TOGGLE_FIELDS,
  EMAIL_TOGGLE_META,
  EMAIL_PREFERENCES_CHANNEL,
  DEFAULT_EMAIL_SETTINGS,
  rowsToEmailSettings,
  toBool,
  type EmailPreferenceRowLike,
} from '../lib/notification-preferences';
import {
  storeCurrencyKey,
  DEFAULT_STORE_CURRENCY,
} from '../lib/store-currency-settings';

/**
 * v2.407.0 — the ghost routes wake.
 *
 * Two API routes shipped in early releases against schema columns that
 * NEVER existed: /api/notifications/settings selected four User columns
 * (emailNotifications/receiptEmails/stockAlertEmails/reportEmails) and
 * /api/settings/currency selected Store.defaultCurrency. Every call died
 * in PrismaClientValidationError — the burst's proof mode documented the
 * live 500s before this round touched anything.
 *
 * The fix re-homes BOTH contracts on models that exist:
 *   • the four toggles → NotificationPreference rows (channel EMAIL, one
 *     row per alert type; ALL is the master switch BY the helper's
 *     matcher — isChannelEnabled collects the category row AND the ALL
 *     row and answers `every(isEnabled)`).
 *   • the branch currency → SystemConfig `store:{id}:default_currency`
 *     (the vat_rate_percent home since v2.8.0); a never-set key answers
 *     KES with isDefault:true.
 *
 * The feature rides the wake: the Profile dialog's Preferences tab grows
 * the email card (four Switch rows, the master dims and disables the
 * three categories while off, save PATCHes only the fields that moved),
 * and Task 122's carry lands: the console footer's plain open clears the
 * jump slots itself.
 */

const readRepo = (rel: string) => readFileSync(join(process.cwd(), rel), 'utf8');

const notifRoute = readRepo('src/app/api/notifications/settings/route.ts');
const currencyRoute = readRepo('src/app/api/settings/currency/route.ts');
const prefsLib = readRepo('src/lib/notification-preferences.ts');
const currencyLib = readRepo('src/lib/store-currency-settings.ts');
const dialog = readRepo('src/components/profile-settings-dialog.tsx');
const apiClient = readRepo('src/lib/api.ts');
const consolePage = readRepo('src/app/(shell)/console/page.tsx');

// ── 1. the ghost is dead: no phantom schema columns anywhere ──────────────

describe('neither route names a column the schema never carried', () => {
  it('the notifications route selects NOTHING off the User model', () => {
    expect(notifRoute).not.toContain('emailNotifications: true');
    expect(notifRoute).not.toContain('db.user.findUnique');
    expect(notifRoute).not.toContain('db.user.update');
    // the toggles are read through the lib, not a User row
    expect(notifRoute).toContain('getEmailNotificationSettings(session.userId)');
    expect(notifRoute).toContain('updateEmailNotificationSettings(');
  });

  it('the currency route selects NOTHING off the Store model', () => {
    expect(currencyRoute).not.toContain('defaultCurrency: true');
    expect(currencyRoute).not.toContain('db.store.findUnique');
    expect(currencyRoute).not.toContain('db.store.update');
    expect(currencyRoute).toContain('getStoreDefaultCurrency(storeId)');
    expect(currencyRoute).toContain('setStoreDefaultCurrency(storeId, defaultCurrency)');
  });
});

// ── 2. the lib's truth (runtime, pure) ─────────────────────────────────────

describe("the toggle map speaks the helper's language", () => {
  it('carries exactly the four fields, in the documented order', () => {
    expect(EMAIL_TOGGLE_FIELDS).toEqual([
      'emailNotifications',
      'receiptEmails',
      'stockAlertEmails',
      'reportEmails',
    ]);
  });

  it('ALL is the master (the matcher ANDs it into every category check)', () => {
    expect(EMAIL_TOGGLE_META.emailNotifications.alertType).toBe('ALL');
    expect(EMAIL_TOGGLE_META.receiptEmails.alertType).toBe('RECEIPT');
    // the schema comment's real category - not a coined one
    expect(EMAIL_TOGGLE_META.stockAlertEmails.alertType).toBe('LOW_STOCK');
    expect(EMAIL_TOGGLE_META.reportEmails.alertType).toBe('DAILY_REPORT');
    // every toggle lives on the EMAIL channel
    expect(EMAIL_PREFERENCES_CHANNEL).toBe('EMAIL');
  });

  it('every toggle speaks a label and a description', () => {
    for (const field of EMAIL_TOGGLE_FIELDS) {
      expect(EMAIL_TOGGLE_META[field].label.length).toBeGreaterThan(0);
      expect(EMAIL_TOGGLE_META[field].description.length).toBeGreaterThan(0);
    }
  });
});

describe('rowsToEmailSettings folds rows the way isChannelEnabled reads them', () => {
  const rowFor = (alertType: string, isEnabled: boolean): EmailPreferenceRowLike => ({
    channel: 'EMAIL',
    alertType,
    isEnabled,
  });

  it("no rows at all → every toggle on (the helper's default-enabled law)", () => {
    expect(rowsToEmailSettings([])).toEqual(DEFAULT_EMAIL_SETTINGS);
  });

  it("only the ALL row disabled → the master reads off, categories too (every()'s verdict)", () => {
    const settings = rowsToEmailSettings([rowFor('ALL', false)]);
    expect(settings.emailNotifications).toBe(false);
  });

  it('a category row disabled with the master on → exactly that toggle reads off', () => {
    const settings = rowsToEmailSettings([
      rowFor('ALL', true),
      rowFor('LOW_STOCK', false),
    ]);
    expect(settings.emailNotifications).toBe(true);
    expect(settings.stockAlertEmails).toBe(false);
    expect(settings.receiptEmails).toBe(true);
    expect(settings.reportEmails).toBe(true);
  });

  it('a disabled ALL row wins over an enabled category row (loudest row rule)', () => {
    // a legacy hand-edit could plant contradicting rows; `every` answers
    // false, so the fold must too
    const settings = rowsToEmailSettings([
      rowFor('ALL', false),
      rowFor('RECEIPT', true),
    ]);
    expect(settings.emailNotifications).toBe(false);
  });

  it('a duplicate alertType pair folds to off when EITHER row is disabled', () => {
    const settings = rowsToEmailSettings([
      rowFor('DAILY_REPORT', true),
      rowFor('DAILY_REPORT', false),
    ]);
    expect(settings.reportEmails).toBe(false);
  });

  it("foreign channels and foreign alertTypes are nobody's toggle", () => {
    const settings = rowsToEmailSettings([
      { channel: 'SMS', alertType: 'ALL', isEnabled: false },
      rowFor('OVERDUE_RENTAL', false),
      rowFor('DEBT_REMINDER', false),
    ]);
    expect(settings).toEqual(DEFAULT_EMAIL_SETTINGS);
  });
});

describe('toBool narrows the PATCH body honestly', () => {
  it('booleans, true/false strings and numbers fold; junk answers null', () => {
    expect(toBool(true)).toBe(true);
    expect(toBool('false')).toBe(false);
    expect(toBool(0)).toBe(false);
    expect(toBool(2)).toBe(true);
    expect(toBool('yes')).toBeNull();
    expect(toBool(null)).toBeNull();
    expect(toBool(undefined)).toBeNull();
    expect(toBool({})).toBeNull();
  });
});

// ── 3. the currency lib ────────────────────────────────────────────────────

describe("the branch currency lives in the vat's home (SystemConfig)", () => {
  it('one key per store, namespaced', () => {
    expect(storeCurrencyKey('store_juja_main')).toBe('store:store_juja_main:default_currency');
  });

  it('a never-set key answers KES with isDefault (the honest never-chosen state)', () => {
    expect(DEFAULT_STORE_CURRENCY).toBe('KES');
    expect(currencyLib).toContain('isDefault: config === null');
  });

  it('the write is a real upsert (SystemConfig.key IS unique)', () => {
    expect(currencyLib).toContain('db.systemConfig.upsert({');
    expect(currencyLib).toContain('STORE_CURRENCY_DESCRIPTION');
  });
});

// ── 4. the routes keep their doors honest ──────────────────────────────────

describe('the revived routes keep the mass-assignment door shut', () => {
  it("PATCH accepts only the four fields (the loop iterates the lib's list)", () => {
    expect(notifRoute).toContain('for (const field of EMAIL_TOGGLE_FIELDS)');
    expect(notifRoute).toContain("error: `Field \"${field}\" must be a boolean (true/false).`");
    expect(notifRoute).toContain('changedCount === 0');
  });

  it('the write is the one-row law (deleteMany + create in ONE transaction)', () => {
    expect(prefsLib).toContain('deleteMany({');
    expect(prefsLib).toContain('db.$transaction(ops)');
    expect(prefsLib).toContain('flatMap((field) => {');
  });

  it('the currency PATCH keeps the zod gate and the owner role door', () => {
    expect(currencyRoute).toContain('z.enum(SUPPORTED_CODES)');
    expect(currencyRoute).toContain("roles: ['SUPER_ADMIN', 'STORE_OWNER']");
    expect(currencyRoute).toContain("session.role !== 'SUPER_ADMIN' && session.storeId && session.storeId !== storeId");
    expect(currencyRoute).toContain('runWithoutTenant');
  });

  it('the settings PATCH still logs the audit row (best-effort, never blocking)', () => {
    expect(notifRoute).toContain("action: 'NOTIFICATION_SETTINGS_UPDATED'");
    expect(notifRoute).toContain('.catch(() => {');
  });
});

// ── 5. the feature: the card in the Preferences tab ────────────────────────

describe('the Preferences tab grows the email card', () => {
  it('the card mounts with its testid and four rows + switches', () => {
    expect(dialog).toContain('<EmailPreferencesCard />');
    expect(dialog).toContain('data-testid="email-prefs-card"');
    expect(dialog).toContain('data-testid={`email-pref-${field}`}');
    expect(dialog).toContain("data-testid={`email-pref-switch-${field}`}");
    expect(dialog).toContain('data-testid="email-prefs-save"');
  });

  it('the master dims AND disables the three categories while off', () => {
    expect(dialog).toContain("const dimmed = !isMaster && !masterOn;");
    expect(dialog).toContain("disabled={saving || (!isMaster && !masterOn)}");
    expect(dialog).toContain("dimmed ? 'opacity-50' : 'opacity-100'");
  });

  it('save PATCHes only the fields that moved (the route refuses an empty update)', () => {
    expect(dialog).toContain('if (settings[field] !== settingsQuery.data[field]) updates[field] = settings[field];');
    expect(dialog).toContain("disabled={!dirty || saving}");
  });

  it('the client speaks the route', () => {
    expect(apiClient).toContain("request<EmailSettingsData>('/notifications/settings')");
    expect(apiClient).toContain("request<EmailSettingsData>('/notifications/settings', {");
    expect(apiClient).toContain("method: 'PATCH'");
  });
});

// ── 6. the carry: the footer's plain open clears the jump slots ────────────

describe('the console footer names no door and resets both slots', () => {
  it('the plain open clears jumpVia before opening (Task 122 carry #6)', () => {
    expect(consolePage).toContain(
      'onOpenChangelog={() => { setJumpVia(null); setChangelogOpen(true); }}'
    );
  });
});
