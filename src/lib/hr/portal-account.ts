// src/lib/hr/portal-account.ts
//
// v2.41.0: pure helpers for the "create & link a portal account" flow on the
// HR Employee directory (PortalLinkDialog). No imports, no client deps —
// fully deterministic for unit tests.
//
// The flow composes two EXISTING governed endpoints (POST /api/users —
// SUPER_ADMIN-only via settings.roles.manage, then POST
// /api/employees/[id]/portal-link) so no new API surface is needed; this
// module only carries the presentation logic:
//   - suggestPortalEmail: a first-run email proposal from the employee's
//     full name (editable in the dialog — the suggestion is just a starting
//     point, collisions surface as the API's 409).
//   - generateTempPassword: a readable, copyable temporary password
//     (three word-groups + digits, ≥ 12 chars) — the admin hands it to the
//     employee over a secure channel.
//   - PORTAL_CREATE_ROLE_OPTIONS: the least-privilege role picker. Privileged
//     roles (SUPER_ADMIN, ACCOUNTANT) are deliberately NOT offered here —
//     assigning them stays in Settings → Users where the segregation-of-
//     duties gate lives.

export const PORTAL_EMAIL_DOMAIN = 'mbumahhardware.co.ke';

/** Transliterate/strip everything that is not a plain ASCII letter or digit
 *  so the suggestion is a safe email local-part. */
function asciiSlug(s: string): string {
  return s
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '') // strip combining diacritics
    .replace(/[^a-zA-Z0-9]+/g, ' ')
    .trim()
    .toLowerCase();
}

/** Build an email proposal from an employee's full name:
 *  "Grace Wanjiru" → "grace.wanjiru@mbumahhardware.co.ke",
 *  "David  O. Otieno-Jr" → "david.o.otieno-jr@…". Dots join the name parts;
 *  an empty result means the caller should leave the field empty instead. */
export function suggestPortalEmail(fullName: string): string {
  const slug = asciiSlug(fullName || '');
  if (!slug) return '';
  const parts = slug.split(/\s+/).filter(Boolean).slice(0, 4);
  const local = parts.join('.').slice(0, 48).replace(/^\.+|\.+$/g, '');
  if (!local) return '';
  return `${local}@${PORTAL_EMAIL_DOMAIN}`;
}

const PASSWORD_WORDS = [
  'harbor', 'ember', 'quartz', 'cedar', 'ridge', 'flint', 'grove',
  'summit', 'cobalt', 'meadow', 'thistle', 'bronze', 'canyon', 'drift',
  'falcon', 'ginger', 'hazel', 'indigo', 'juniper', 'kestrel', 'lagoon', 'marble',
];

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** Generate a readable temporary password: `Word-Word-99` pattern (≥ 12
 *  chars, letters + digits + separators). Shape is asserted by tests; the
 *  value is random per call. */
export function generateTempPassword(): string {
  const a = pick(PASSWORD_WORDS);
  const b = pick(PASSWORD_WORDS);
  const digits = String(Math.floor(10 + Math.random() * 90)); // 10-99
  return `${capitalize(a)}-${capitalize(b)}-${digits}`;
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export interface PortalRoleOption {
  value: string;
  label: string;
  hint: string;
}

/** Least-privilege roles offered by the create-&-link flow. Store-bound by
 *  construction (the employee record fixes the store); privileged roles are
 *  intentionally absent (see module header). */
export const PORTAL_CREATE_ROLE_OPTIONS: readonly PortalRoleOption[] = [
  { value: 'CASHIER', label: 'Cashier', hint: 'Till, customers, transactions' },
  { value: 'INVENTORY_MANAGER', label: 'Inventory Manager', hint: 'Stock, catalog, purchase orders' },
  { value: 'BRANCH_MANAGER', label: 'Branch Manager', hint: 'Runs the branch, decides leave' },
  { value: 'STORE_OWNER', label: 'Store Owner', hint: 'Full branch ownership' },
];

/** Client-side mirror of the createUserSchema email check (the server stays
 *  the source of truth; this only disables the submit button early). */
export function isValidEmailFormat(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export interface CreateLinkFormState {
  name: string;
  email: string;
  role: string;
  phone: string;
  password: string;
  /** v2.44.0: first sign-in password rotation (default true — an admin-minted
   *  password is temporary until the user picks their own). */
  mustChangePassword?: boolean;
}

/** Submit-readiness mirror of the dialog's disabled logic (unit-testable). */
export function isCreateLinkFormReady(form: CreateLinkFormState): boolean {
  return (
    form.name.trim().length >= 2 &&
    isValidEmailFormat(form.email) &&
    PORTAL_CREATE_ROLE_OPTIONS.some((r) => r.value === form.role) &&
    form.password.length >= 6
  );
}

// ─── v2.267.0: the portal-link keystone's shared pure faces ─────────────
//
// Three additions that BOTH portal surfaces (the payroll tab's
// PortalLinkDialog and the HR employee-detail Portal account card) now share
// so the picker, the gate, and the role palette each live in ONE home:
//
//   PORTAL_LINK_ROLE_TRIO / canManagePortalLinks — the same privilege set
//     the POST/DELETE /api/employees/[id]/portal-link route enforces
//     (mirrors hr.employee.update). Client-safe mirror only: the server
//     stays the source of truth; the client uses it to render the honest
//     denial voice instead of a silent empty picker.
//   portalRoleTone — the role chip palette (violet owners, sky managers,
//     muted everyone else) so the dialog and the card dress their chips
//     identically.
//   buildPortalCandidates — the pure shaper behind GET
//     /api/employees/[id]/portal-link/candidates: same-store active users
//     annotated with WHERE they are already linked, so a picker row can be
//     disabled with its reason instead of being silently hidden.

/** The exact privilege set the portal-link POST/DELETE route enforces. */
export const PORTAL_LINK_ROLE_TRIO = ['SUPER_ADMIN', 'STORE_OWNER', 'HR_MANAGER'] as const;

/** Client-side mirror of the link route's role gate (the server re-checks
 *  every request; this only decides whether the affordance or the honest
 *  denial voice renders). */
export function canManagePortalLinks(role: string | null | undefined): boolean {
  return !!role && (PORTAL_LINK_ROLE_TRIO as readonly string[]).includes(role);
}

/** The role chip palette shared by the dialog and the employee-detail card. */
export function portalRoleTone(role: string): string {
  if (role === 'SUPER_ADMIN' || role === 'STORE_OWNER')
    return 'bg-violet-50 text-violet-700 ring-violet-200 dark:bg-violet-950/40 dark:text-violet-300 dark:ring-violet-900';
  if (role === 'BRANCH_MANAGER' || role === 'HR_MANAGER')
    return 'bg-sky-50 text-sky-700 ring-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:ring-sky-900';
  return 'bg-muted text-muted-foreground ring-border';
}

/** One candidate row of the governed picker wire. */
export interface PortalLinkCandidate {
  id: string;
  name: string;
  email: string;
  role: string;
  /** Set when this login is already bound to a DIFFERENT (non-deleted)
   *  employee — the picker disables the row and says to whom. */
  linkedToEmployeeName: string | null;
}

/** Pure shaper behind the candidates wire: annotate each same-store active
 *  user with the name of the employee their login is bound to (absence =
 *  free to link). Deterministic — the db reads stay in the service. */
export function buildPortalCandidates(
  users: Array<{ id: string; name: string | null; email: string; role: string }>,
  linkedElsewhere: Map<string, string>,
): PortalLinkCandidate[] {
  return users.map((u) => ({
    id: u.id,
    name: u.name || u.email,
    email: u.email,
    role: u.role,
    linkedToEmployeeName: linkedElsewhere.get(u.id) ?? null,
  }));
}
