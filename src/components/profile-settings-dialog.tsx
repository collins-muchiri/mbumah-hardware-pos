'use client';

/**
 * ProfileSettingsDialog (v2.7.0) - the real "Profile & Settings" experience.
 *
 * Until this component shipped, the sidebar entry showed
 * `toast.info('Profile settings coming soon')` and the only way to change a
 * name, phone or password was to ask a SUPER_ADMIN to open the Admin tab.
 *
 * Backed by the self-service endpoints added in the same release:
 *   GET/POST see src/app/api/profile/route.ts and .../password/route.ts
 *
 * Tabs:
 *   • Profile - identity card (read-only: email/role/org/store) + editable
 *                   name & phone. Saves through PATCH /api/profile and then
 *                   refreshes the auth store so the sidebar/topbar re-render.
 *   • Security - self-service password change (requires the current
 *                   password; revokes every OTHER session on success).
 *   • Preferences - theme (light/dark/system) and sidebar density, applied
 *                   instantly via next-themes / the app store.
 */

import React, { useEffect, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useTheme } from 'next-themes';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { profileApi, emailPreferencesApi, type ProfileData, type EmailSettingsData } from '@/lib/api';
import { useAuthStore, useAppStore } from '@/lib/stores';
import {
  Loader2,
  Mail,
  Lock,
  Building2,
  Store,
  Clock,
  Eye,
  EyeOff,
  UserRound,
  ShieldCheck,
  Sun,
  Moon,
  Monitor,
  PanelLeft,
  Phone,
  KeyRound,
  AlertCircle,
  BellRing,
} from 'lucide-react';

function initials(name: string): string {
  return (
    name
      .split(' ')
      .map((p) => p[0])
      .filter(Boolean)
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'U'
  );
}

function formatRole(role: string): string {
  return role
    .split('_')
    .map((w) => w[0] + w.slice(1).toLowerCase())
    .join(' ');
}

function formatDate(value: string | null): string {
  if (!value) return '-';
  try {
    return new Date(value).toLocaleString('en-KE', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  } catch {
    return value;
  }
}

// Password strength (client-side hint only - server enforces the real rules)
function passwordScore(pw: string): number {
  if (!pw) return 0;
  let score = 0;
  if (pw.length >= 8) score += 1;
  if (pw.length >= 12) score += 1;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score += 1;
  if (/\d/.test(pw) && /[^A-Za-z0-9]/.test(pw)) score += 1;
  return Math.min(score, 4);
}

const STRENGTH_LABELS = ['Too short', 'Weak', 'Fair', 'Good', 'Strong'];
const STRENGTH_CLASSES = [
  'bg-muted',
  'bg-red-500',
  'bg-amber-500',
  'bg-lime-500',
  'bg-emerald-500',
];

export function ProfileSettingsDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const queryClient = useQueryClient();
  const fetchUser = useAuthStore((s) => s.fetchUser);
  const isSidebarCollapsed = useAppStore((s) => s.isSidebarCollapsed);
  const toggleSidebarCollapse = useAppStore((s) => s.toggleSidebarCollapse);
  const { theme, setTheme } = useTheme();

  const profileQuery = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const res = await profileApi.get();
      if (!res.data) throw new Error(res.error || 'Could not load profile');
      return res.data;
    },
    enabled: open,
    staleTime: 30_000,
  });

  // Editable profile fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    if (profileQuery.data) {
      setName(profileQuery.data.name ?? '');
      setPhone(profileQuery.data.phone ?? '');
    }
  }, [profileQuery.data]);

  const profileDirty =
    profileQuery.data !== undefined &&
    (name.trim() !== (profileQuery.data.name ?? '') ||
      phone.trim() !== (profileQuery.data.phone ?? ''));

  const handleProfileSave = async () => {
    if (!name.trim()) {
      toast.error('Name cannot be empty.');
      return;
    }
    setSavingProfile(true);
    try {
      const res = await profileApi.update({
        name: name.trim(),
        phone: phone.trim() || null,
      });
      if (res.data) {
        toast.success('Profile updated');
        // Refresh the auth store so the sidebar avatar/name re-render.
        await fetchUser();
        await queryClient.invalidateQueries({ queryKey: ['profile'] });
      } else {
        toast.error(res.error || 'Could not update profile.');
      }
    } catch (err) {
      // request() throws ApiRequestError with the server's message (e.g.
      // validation failures) - surface it instead of generic copy.
      toast.error(
        err instanceof Error && err.message
          ? err.message
          : 'Could not update profile. Please try again.'
      );
    } finally {
      setSavingProfile(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl overflow-y-auto max-h-[90vh]" data-testid="profile-settings-dialog">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserRound className="h-5 w-5 text-emerald-700" />
            Profile &amp; Settings
          </DialogTitle>
          <DialogDescription>
            Manage your personal details, security and how the app looks.
          </DialogDescription>
        </DialogHeader>

        {profileQuery.isError ? (
          <div className="flex flex-col items-center gap-3 py-10 text-center">
            <AlertCircle className="h-8 w-8 text-red-500" />
            <p className="text-sm text-muted-foreground">
              Could not load your profile. Please try again.
            </p>
            <Button variant="outline" size="sm" onClick={() => profileQuery.refetch()}>
              Retry
            </Button>
          </div>
        ) : profileQuery.isLoading || !profileQuery.data ? (
          <div className="flex items-center justify-center py-12" role="status" aria-label="Loading profile">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <ProfileTabs
            profile={profileQuery.data}
            name={name}
            phone={phone}
            setName={setName}
            setPhone={setPhone}
            profileDirty={profileDirty}
            savingProfile={savingProfile}
            onSaveProfile={handleProfileSave}
            theme={theme ?? 'system'}
            setTheme={setTheme}
            isSidebarCollapsed={isSidebarCollapsed}
            toggleSidebarCollapse={toggleSidebarCollapse}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

// Tabs split out so the dialog body stays readable

type ProfileTabsProps = {
  profile: ProfileData;
  name: string;
  phone: string;
  setName: (v: string) => void;
  setPhone: (v: string) => void;
  profileDirty: boolean;
  savingProfile: boolean;
  onSaveProfile: () => void;
  theme: string;
  setTheme: (t: string) => void;
  isSidebarCollapsed: boolean;
  toggleSidebarCollapse: () => void;
};

function ProfileTabs({
  profile,
  name,
  phone,
  setName,
  setPhone,
  profileDirty,
  savingProfile,
  onSaveProfile,
  theme,
  setTheme,
  isSidebarCollapsed,
  toggleSidebarCollapse,
}: ProfileTabsProps) {
  return (
    <Tabs defaultValue="profile" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="profile">Profile</TabsTrigger>
        <TabsTrigger value="security">Security</TabsTrigger>
        <TabsTrigger value="preferences">Preferences</TabsTrigger>
      </TabsList>

      {/* ── PROFILE ── */}
      <TabsContent value="profile" className="space-y-4 pt-2">
        <div className="flex items-center gap-3">
          <Avatar className="h-14 w-14 ring-2 ring-emerald-600/20">
            {profile.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.avatarUrl} alt={`${profile.name} avatar`} className="h-full w-full rounded-full object-cover" />
            ) : (
              <AvatarFallback className="bg-gradient-to-br from-emerald-600 to-emerald-800 text-white text-lg font-semibold">
                {initials(profile.name)}
              </AvatarFallback>
            )}
          </Avatar>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{profile.name}</p>
            <p className="truncate text-xs text-muted-foreground">{profile.email}</p>
            <Badge variant="secondary" className="mt-1 text-[10px]">{formatRole(profile.role)}</Badge>
          </div>
        </div>

        <Separator />

        {/* Read-only account facts - email/role/store changes stay admin-only
            by design (segregation of duties, see /api/users/[id]). */}
        <div className="grid gap-2 text-sm">
          <div className="flex items-center gap-2 rounded-lg border p-2.5">
            <Mail className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="min-w-0 flex-1 truncate">{profile.email}</span>
            <span className="flex items-center gap-1 text-[11px] text-muted-foreground"><Lock className="h-3 w-3" /> Admin-managed</span>
          </div>
          <div className="flex items-center gap-2 rounded-lg border p-2.5">
            <Building2 className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="min-w-0 flex-1 truncate">{profile.organization?.name || '-'}</span>
            <span className="text-[11px] text-muted-foreground">Organization</span>
          </div>
          <div className="flex items-center gap-2 rounded-lg border p-2.5">
            <Store className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="min-w-0 flex-1 truncate">{profile.store ? profile.store.name : 'All stores (org scope)'}</span>
            <span className="text-[11px] text-muted-foreground">Home branch</span>
          </div>
          <div className="flex items-center gap-2 rounded-lg border p-2.5">
            <Clock className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="min-w-0 flex-1 truncate">{formatDate(profile.lastLoginAt)}</span>
            <span className="text-[11px] text-muted-foreground">Last sign-in</span>
          </div>
        </div>

        <Separator />

        {/* Editable fields */}
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="grid gap-1.5">
            <Label htmlFor="profile-name">Full name</Label>
            <Input id="profile-name" value={name} maxLength={120} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="profile-phone" className="flex items-center gap-1.5">
              <Phone className="h-3 w-3" /> Phone
            </Label>
            <Input id="profile-phone" value={phone} maxLength={32} onChange={(e) => setPhone(e.target.value)} placeholder="e.g. +254 7xx xxx xxx" inputMode="tel" />
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={onSaveProfile} disabled={savingProfile || !profileDirty} data-testid="profile-save">
            {savingProfile ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {savingProfile ? 'Saving…' : 'Save changes'}
          </Button>
        </div>
      </TabsContent>

      {/* ── SECURITY ── */}
      <TabsContent value="security" className="pt-2">
        <PasswordChangeCard email={profile.email} />
      </TabsContent>

      {/* ── PREFERENCES ── */}
      <TabsContent value="preferences" className="space-y-4 pt-2">
        <div className="grid gap-1.5">
          <Label>Theme</Label>
          <RadioGroup
            value={theme}
            onValueChange={setTheme}
            className="grid grid-cols-3 gap-2"
            data-testid="theme-picker"
          >
            {[
              { value: 'light', icon: Sun, label: 'Light' },
              { value: 'dark', icon: Moon, label: 'Dark' },
              { value: 'system', icon: Monitor, label: 'System' },
            ].map(({ value, icon: Icon, label }) => (
              <Label
                key={value}
                htmlFor={`theme-${value}`}
                className="flex cursor-pointer flex-col items-center gap-1.5 rounded-lg border p-3 text-xs font-normal hover:bg-muted/50 has-[[data-state=checked]]:border-emerald-600 has-[[data-state=checked]]:bg-emerald-700/5"
              >
                <RadioGroupItem id={`theme-${value}`} value={value} className="sr-only" />
                <Icon className="h-5 w-5" />
                {label}
              </Label>
            ))}
          </RadioGroup>
        </div>

        <div className="flex items-center justify-between rounded-lg border p-3">
          <div className="flex items-start gap-2.5 min-w-0">
            <PanelLeft className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
            <div className="min-w-0">
              <p className="text-sm font-medium leading-tight">Collapsed sidebar</p>
              <p className="text-xs text-muted-foreground">Icon-only navigation to fit more of the till screen</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={toggleSidebarCollapse}>
            {isSidebarCollapsed ? 'Expand' : 'Collapse'}
          </Button>
        </div>

        {/* v2.407.0 - the email toggles wake on the REAL NotificationPreference
            model (the route used to select four User columns the schema never
            carried and answered 500 to everyone). */}
        <EmailPreferencesCard />

        <p className="text-xs text-muted-foreground">
          Preferences apply instantly on this device. Keyboard shortcuts: press{' '}
          <kbd className="rounded border bg-muted px-1 font-mono text-[10px]">?</kbd> anywhere.
        </p>
      </TabsContent>
    </Tabs>
  );
}

// Password change (own tab content)

function PasswordChangeCard({ email }: { email: string }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [show, setShow] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const score = useMemo(() => passwordScore(newPassword), [newPassword]);

  const passwordsMatch =
    confirmPassword.length > 0 && confirmPassword === newPassword;
  const canSubmit =
    currentPassword.length > 0 &&
    newPassword.length >= 8 &&
    passwordsMatch &&
    newPassword !== currentPassword &&
    !submitting;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      const res = await profileApi.changePassword(currentPassword, newPassword);
      if (res.data) {
        toast.success(
          res.data.sessionsRevoked > 0
            ? `Password changed. ${res.data.sessionsRevoked} other device(s) signed out.`
            : 'Password changed.'
        );
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        toast.error(res.error || 'Could not change password.');
      }
    } catch (err) {
      // request() throws ApiRequestError with the server's message - e.g.
      // "Current password is incorrect." Show it verbatim.
      toast.error(
        err instanceof Error && err.message
          ? err.message
          : 'Could not change password. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-2.5 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
        <p className="text-xs text-muted-foreground">
          Changing your password signs out every <strong>other</strong> device
          signed in as <span className="font-medium text-foreground">{email}</span>.
          This device stays signed in.
        </p>
      </div>

      <div className="grid gap-3">
        <div className="grid gap-1.5">
          <Label htmlFor="pw-current">Current password</Label>
          <PasswordInput
            id="pw-current"
            value={currentPassword}
            onChange={setCurrentPassword}
            show={show}
            onToggleShow={() => setShow((s) => !s)}
            autoComplete="current-password"
          />
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="pw-new">New password</Label>
          <PasswordInput
            id="pw-new"
            value={newPassword}
            onChange={setNewPassword}
            show={show}
            onToggleShow={() => setShow((s) => !s)}
            autoComplete="new-password"
          />
          {/* Strength meter */}
          <div className="flex items-center gap-2" aria-live="polite">
            <div className="flex flex-1 gap-1">
              {[1, 2, 3, 4].map((seg) => (
                <span
                  key={seg}
                  className={`h-1.5 flex-1 rounded-full transition-colors ${
                    newPassword.length > 0 && score >= seg ? STRENGTH_CLASSES[score] : 'bg-muted'
                  }`}
                />
              ))}
            </div>
            <span className="w-16 text-right text-[11px] text-muted-foreground">
              {newPassword ? STRENGTH_LABELS[score] : ''}
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground">
            At least 8 characters. Mix UPPER/lowercase, numbers and symbols for a stronger password.
          </p>
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="pw-confirm">Confirm new password</Label>
          <PasswordInput
            id="pw-confirm"
            value={confirmPassword}
            onChange={setConfirmPassword}
            show={show}
            onToggleShow={() => setShow((s) => !s)}
            autoComplete="new-password"
            invalid={confirmPassword.length > 0 && !passwordsMatch}
          />
          {confirmPassword.length > 0 && !passwordsMatch && (
            <p className="text-[11px] text-red-500">Passwords do not match.</p>
          )}
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSubmit} disabled={!canSubmit} data-testid="password-save">
          {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <KeyRound className="mr-2 h-4 w-4" />}
          {submitting ? 'Updating…' : 'Change password'}
        </Button>
      </div>
    </div>
  );
}

function PasswordInput({
  id,
  value,
  onChange,
  show,
  onToggleShow,
  autoComplete,
  invalid,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  show: boolean;
  onToggleShow: () => void;
  autoComplete?: string;
  invalid?: boolean;
}) {
  return (
    <div className="relative">
      <Input
        id={id}
        type={show ? 'text' : 'password'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        aria-invalid={invalid || undefined}
        className={invalid ? 'border-red-500 focus-visible:ring-red-500' : undefined}
      />
      <button
        type="button"
        onClick={onToggleShow}
        aria-label={show ? 'Hide password' : 'Show password'}
        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
      >
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}

// Email notification preferences (v2.407.0 - the ghost route wakes)
//
// The four toggles live on the REAL NotificationPreference model (channel
// EMAIL, one row per alert type). The master switch is the ALL row - the
// helper's matcher ANDs it into every category check, so a disabled master
// suppresses every email at once; the three category rows dim while it is
// off (honest visual, disabled controls - never a switch that lies).

const EMAIL_TOGGLE_UI: Array<{
  field: keyof EmailSettingsData;
  label: string;
  description: string;
}> = [
  {
    field: 'emailNotifications',
    label: 'Email notifications',
    description: 'The master switch - off means no email at all.',
  },
  {
    field: 'receiptEmails',
    label: 'Receipt copies',
    description: 'A copy of customer receipts as they are issued.',
  },
  {
    field: 'stockAlertEmails',
    label: 'Stock alerts',
    description: 'Low-stock alerts when items run below their reorder level.',
  },
  {
    field: 'reportEmails',
    label: 'Sales reports',
    description: 'The daily sales report for your branch.',
  },
];

function EmailPreferencesCard() {
  const settingsQuery = useQuery({
    queryKey: ['email-preferences'],
    queryFn: async () => {
      const res = await emailPreferencesApi.get();
      if (!res.data) throw new Error(res.error || 'Could not load email settings');
      return res.data;
    },
    staleTime: 30_000,
  });

  const [settings, setSettings] = useState<EmailSettingsData | null>(null);
  const [saving, setSaving] = useState(false);

  // Server data lands once; local edits ride the draft (the same pattern
  // the Profile tab keeps for name/phone).
  useEffect(() => {
    if (settingsQuery.data) setSettings(settingsQuery.data);
  }, [settingsQuery.data]);

  const dirty =
    settings !== null &&
    settingsQuery.data !== undefined &&
    EMAIL_TOGGLE_UI.some(({ field }) => settings[field] !== settingsQuery.data[field]);

  const toggle = (field: keyof EmailSettingsData, value: boolean) => {
    setSettings((s) => (s ? { ...s, [field]: value } : s));
  };

  const handleSave = async () => {
    if (!settings || !dirty || !settingsQuery.data) return;
    // PATCH only the fields that actually moved (the route refuses an
    // empty update and the audit log reads better for it).
    const updates: Partial<EmailSettingsData> = {};
    for (const { field } of EMAIL_TOGGLE_UI) {
      if (settings[field] !== settingsQuery.data[field]) updates[field] = settings[field];
    }
    setSaving(true);
    try {
      const res = await emailPreferencesApi.update(updates);
      if (res.data) {
        toast.success('Email preferences saved');
        await settingsQuery.refetch();
        setSettings(res.data);
      } else {
        toast.error(res.error || 'Could not save email preferences.');
      }
    } catch (err) {
      toast.error(
        err instanceof Error && err.message
          ? err.message
          : 'Could not save email preferences. Please try again.'
      );
    } finally {
      setSaving(false);
    }
  };

  if (settingsQuery.isLoading || (!settings && !settingsQuery.isError)) {
    return (
      <div className="flex items-center justify-center rounded-lg border p-6" role="status" aria-label="Loading email preferences">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (settingsQuery.isError || !settings) {
    return (
      <div className="flex items-center justify-between rounded-lg border border-red-500/30 bg-red-500/5 p-3">
        <p className="text-xs text-muted-foreground">Could not load your email preferences.</p>
        <Button variant="outline" size="sm" onClick={() => settingsQuery.refetch()}>
          Retry
        </Button>
      </div>
    );
  }

  const masterOn = settings.emailNotifications;

  return (
    <div className="rounded-lg border" data-testid="email-prefs-card">
      <div className="flex items-center gap-2 border-b p-3">
        <BellRing className="h-4 w-4 shrink-0 text-emerald-700" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium leading-tight">Email notifications</p>
          <p className="text-xs text-muted-foreground">What lands in your inbox from Mbumah</p>
        </div>
        <span
          className={`rounded-full px-2 py-0.5 text-[10px] font-medium transition-colors ${
            masterOn
              ? 'bg-emerald-600/10 text-emerald-700 dark:text-emerald-400'
              : 'bg-muted text-muted-foreground'
          }`}
        >
          {masterOn ? 'On' : 'Off'}
        </span>
      </div>

      <div className="divide-y">
        {EMAIL_TOGGLE_UI.map(({ field, label, description }, index) => {
          const isMaster = index === 0;
          const dimmed = !isMaster && !masterOn;
          return (
            <div
              key={field}
              className={`flex items-center gap-3 p-3 transition-opacity ${dimmed ? 'opacity-50' : 'opacity-100'}`}
              data-testid={`email-pref-${field}`}
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm leading-tight">{label}</p>
                <p className="text-xs text-muted-foreground">{description}</p>
              </div>
              <Switch
                checked={settings[field]}
                disabled={saving || (!isMaster && !masterOn)}
                onCheckedChange={(v) => toggle(field, v)}
                aria-label={`${label} - ${settings[field] ? 'on' : 'off'}`}
                data-testid={`email-pref-switch-${field}`}
              />
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between border-t p-3">
        <p className="text-[11px] text-muted-foreground">
          {masterOn
            ? 'Applies to every email Mbumah sends you.'
            : 'The master switch is off - no email is sent, whatever the rows say.'}
        </p>
        <Button onClick={handleSave} disabled={!dirty || saving} size="sm" data-testid="email-prefs-save">
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {saving ? 'Saving…' : 'Save email preferences'}
        </Button>
      </div>
    </div>
  );
}
