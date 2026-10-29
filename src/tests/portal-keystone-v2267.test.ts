import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * v2.267.0 "the portal's keystone" — the portal-link binding gets its honest
 * faces. Three additions, each pinned here:
 *
 *   1. THE CANDIDATES WIRE (GET /api/employees/[id]/portal-link/candidates):
 *      the picker's own governed read. Before it, the ONLY user-list source
 *      was GET /api/users (the staff directory, SUPER_ADMIN/STORE_OWNER by
 *      law) — so a BRANCH_MANAGER or ACCOUNTANT opening the link dialog (a
 *      tab MGMT_ROLES can all reach) got a SILENT EMPTY LIST: the read was
 *      refused and the refusal was never spoken. The candidates wire is
 *      gated by the link route's OWN trio, scopes to the employee's store,
 *      and annotates already-bound logins with WHERE they are bound.
 *   2. THE HONEST DENIAL VOICE (payroll dialog + HR detail card): the roles
 *      without the trio see WHY the pens are out of reach — never a silent
 *      absence, never a button whose only outcome is a 403 toast.
 *   3. THE DETAIL CARD (HR employee detail): the binding finally wears a
 *      face on the record where an HR reader actually reviews an employee —
 *      the wire grows `portalUser`, the card speaks the service's messages
 *      verbatim.
 *
 * The pure faces live in portal-account.ts (client-safe, one home):
 * canManagePortalLinks / portalRoleTone / buildPortalCandidates — RUNTIME
 * pinned here (the runtime-pin lesson: bytes alone cannot catch an
 * arithmetic or membership lie).
 */

const ROOT = join(process.cwd(), 'src');
const read = (p: string) => readFileSync(join(ROOT, p), 'utf8');

const helper = read('lib/hr/portal-account.ts');
const service = read('lib/hr/employee-service.ts');
const candidatesRoute = read('app/api/employees/[id]/portal-link/candidates/route.ts');
const detail = read('app/(shell)/hr/employees/[id]/page.tsx');
const tab = read('app/(shell)/tabs/payroll-tab.tsx');
const types = read('lib/hr/types.ts');
const parentRoute = read('app/api/employees/[id]/portal-link/route.ts');

import {
  buildPortalCandidates,
  canManagePortalLinks,
  portalRoleTone,
  PORTAL_LINK_ROLE_TRIO,
} from '@/lib/hr/portal-account';

describe('canManagePortalLinks (RUNTIME — the trio membership)', () => {
  it('admits exactly the trio the link route enforces', () => {
    expect(PORTAL_LINK_ROLE_TRIO).toEqual(['SUPER_ADMIN', 'STORE_OWNER', 'HR_MANAGER']);
    expect(canManagePortalLinks('SUPER_ADMIN')).toBe(true);
    expect(canManagePortalLinks('STORE_OWNER')).toBe(true);
    expect(canManagePortalLinks('HR_MANAGER')).toBe(true);
  });

  it('refuses every other role and the roleless', () => {
    // The two roles the OLD picker silently failed: they can reach the
    // payroll tab but were never the staff directory's readers.
    expect(canManagePortalLinks('BRANCH_MANAGER')).toBe(false);
    expect(canManagePortalLinks('ACCOUNTANT')).toBe(false);
    expect(canManagePortalLinks('CASHIER')).toBe(false);
    expect(canManagePortalLinks('WAREHOUSE_MANAGER')).toBe(false);
    expect(canManagePortalLinks(null)).toBe(false);
    expect(canManagePortalLinks(undefined)).toBe(false);
    expect(canManagePortalLinks('')).toBe(false);
  });
});

describe('portalRoleTone (RUNTIME — one palette, two surfaces)', () => {
  it('dresses owners violet, managers sky, everyone else muted', () => {
    const owner = portalRoleTone('SUPER_ADMIN');
    expect(owner).toBe(portalRoleTone('STORE_OWNER'));
    expect(owner).toContain('violet-50');
    expect(portalRoleTone('BRANCH_MANAGER')).toBe(portalRoleTone('HR_MANAGER'));
    expect(portalRoleTone('BRANCH_MANAGER')).toContain('sky-50');
    const rest = portalRoleTone('CASHIER');
    expect(rest).toBe(portalRoleTone('ACCOUNTANT'));
    expect(rest).toContain('bg-muted');
  });

  it('keeps the dark-mode halves in the explicit palettes; the muted tone is semantic', () => {
    expect(portalRoleTone('SUPER_ADMIN')).toContain('dark:');
    expect(portalRoleTone('BRANCH_MANAGER')).toContain('dark:');
    // The everyone-else tone rides semantic tokens (bg-muted/text-muted-
    // foreground) — dark-mode safe by construction, no hardcoded dark half.
    expect(portalRoleTone('CASHIER')).toBe('bg-muted text-muted-foreground ring-border');
  });
});

describe('buildPortalCandidates (RUNTIME — the annotation shaper)', () => {
  const users = [
    { id: 'u1', name: 'Grace Wanjiku', email: 'cashier@mbumahhardware.co.ke', role: 'CASHIER' },
    { id: 'u2', name: null, email: 'owner@mbumahhardware.co.ke', role: 'STORE_OWNER' },
    { id: 'u3', name: 'James Otieno', email: 'accountant@mbumahhardware.co.ke', role: 'ACCOUNTANT' },
  ];

  it('annotates a bound login with the employee it is bound to', () => {
    const linked = new Map([['u1', 'Grace Achieng']]);
    const out = buildPortalCandidates(users, linked);
    expect(out.find((c) => c.id === 'u1')?.linkedToEmployeeName).toBe('Grace Achieng');
    expect(out.find((c) => c.id === 'u2')?.linkedToEmployeeName).toBeNull();
    expect(out.find((c) => c.id === 'u3')?.linkedToEmployeeName).toBeNull();
  });

  it('falls back to the email when the account has no name', () => {
    const out = buildPortalCandidates(users, new Map());
    expect(out.find((c) => c.id === 'u2')?.name).toBe('owner@mbumahhardware.co.ke');
  });

  it('keeps order, role, and the absence = free-to-link contract', () => {
    const out = buildPortalCandidates(users, new Map());
    expect(out.map((c) => c.id)).toEqual(['u1', 'u2', 'u3']);
    expect(out.every((c) => c.linkedToEmployeeName === null)).toBe(true);
    expect(out[0].role).toBe('CASHIER');
  });
});

describe('the candidates wire (route + service bytes)', () => {
  it('the route is gated by the trio, thin, and maps PortalLinkError', () => {
    expect(candidatesRoute).toContain('canManagePortalLinks(session.role)');
    expect(candidatesRoute).toContain('Only store owners, HR managers and super admins can manage portal account links.');
    expect(candidatesRoute).toContain('status: 403');
    expect(candidatesRoute).toContain('requireStoreAccess(candidatesHandler');
    expect(candidatesRoute).toContain('listPortalLinkCandidates(id)');
    expect(candidatesRoute).toContain('e instanceof PortalLinkError');
    expect(candidatesRoute).toContain("from '@/lib/hr/employee-service'");
    expect(candidatesRoute).toContain("from '@/lib/hr/portal-account'");
  });

  it('the service scopes to the employee\u2019s store, ACTIVE only, ordered', () => {
    expect(service).toContain('export async function listPortalLinkCandidates(employeeId: string)');
    expect(service).toContain('throw new PortalLinkError(404, \'EMPLOYEE_NOT_FOUND\', \'Employee not found.\');');
    expect(service).toContain("where: { storeId: employee.storeId, isActive: true },");
    expect(service).toContain("orderBy: [{ name: 'asc' }, { email: 'asc' }],");
    expect(service).toContain("where: { userId: { in: ids }, deletedAt: null, id: { not: employee.id } },");
    expect(service).toContain('buildPortalCandidates(users, linkedElsewhere),');
  });

  it('the shaper lives in one home and the service imports it', () => {
    expect(helper).toContain('export function buildPortalCandidates(');
    expect(helper).toContain('export interface PortalLinkCandidate {');
    expect(helper).toContain('linkedToEmployeeName: string | null;');
    expect(service).toContain("import { buildPortalCandidates, type PortalLinkCandidate } from './portal-account';");
  });

  it('the parent link route stays byte-identical (its own gate, pinned)', () => {
    expect(parentRoute).toContain("const PORTAL_LINK_ROLES = ['SUPER_ADMIN', 'STORE_OWNER', 'HR_MANAGER'] as const;");
    expect(parentRoute).toContain('POST   { userId }  — link (or re-link) a portal account');
  });
});

describe('the detail wire grows portalUser (additive)', () => {
  it('the type carries the DTO and the optional field', () => {
    expect(types).toContain('export interface HrPortalUserDto {');
    expect(types).toContain('isActive: boolean;');
    expect(types).toContain('portalUser?: HrPortalUserDto | null;');
  });

  it('the query includes the relation; the raw key is destructured OUT', () => {
    expect(service).toContain("include: { user: { select: { id: true, email: true, name: true, role: true, isActive: true } } },");
    expect(service).toContain('const { user, ...employeeRow } = employee;');
    expect(service).toContain('portalUser: user ?? null,');
    // The spread can never leak the raw relation:
    expect(service).toContain('...summarize({ ...employeeRow, store: null }),');
  });

  it('the shape/mask pass stays the only exit', () => {
    expect(service).toContain('return shapeEmployeeDetail(raw, options.includePii);');
  });
});

describe('the dialog speaks the denial instead of an empty list', () => {
  it('the picker reads its OWN wire, not the staff directory', () => {
    expect(tab).toContain("queryKey: ['portal-link-candidates', employee?.id],");
    expect(tab).toContain('apiFetch(`/api/employees/${employee?.id}/portal-link/candidates`)');
    expect(tab).toContain('enabled: open && !!employee && !employee.userId && canManageLinks,');
    // The old fetch is GONE from the dialog:
    expect(tab).not.toContain('portal-link-users');
    expect(tab).not.toContain('/api/users?storeId=');
  });

  it('the honest gate + the denial panel (testid, amber, ShieldAlert)', () => {
    expect(tab).toContain('const canManageLinks = canManagePortalLinks(sessionUser?.role);');
    expect(tab).toContain('data-testid="portal-link-denied"');
    expect(tab).toContain('Your role can view this link but not change it');
    expect(tab).toContain('only store owners, HR managers and super admins manage portal');
    expect(tab).toContain('<ShieldAlert');
  });

  it('bound rows render disabled WITH their reason (never a silent hide)', () => {
    expect(tab).toContain('const taken = !!u.linkedToEmployeeName;');
    expect(tab).toContain('aria-disabled={taken}');
    expect(tab).toContain('disabled={taken}');
    expect(tab).toContain('title={taken ? `Already linked to ${u.linkedToEmployeeName} — unlink there first` : undefined}');
    expect(tab).toContain("{taken ? `Linked to ${u.linkedToEmployeeName}` : u.email}");
    expect(tab).toContain('const selectableCandidates = candidates.filter((c) => !c.linkedToEmployeeName);');
  });

  it('the pens render only for the trio (link footer + unlink row)', () => {
    expect(tab).toContain('(mode === \'link\' || !canCreateAccounts) && canManageLinks && (');
    expect(tab).toContain('{canManageLinks ? (');
    expect(tab).toContain('const roleTone = portalRoleTone;');
  });

  it('the invalidation follows the new key', () => {
    expect(tab).toContain("qc.invalidateQueries({ queryKey: ['portal-link-candidates'] });");
  });
});

describe('the employee-detail card (the binding\u2019s own face)', () => {
  it('the card mounts with its state chip and testids', () => {
    expect(detail).toContain('<PortalAccountCard employee={employee} onMutated={() => void load(false)} />');
    expect(detail).toContain('data-testid="portal-account-card"');
    expect(detail).toContain('data-testid="portal-state-chip"');
    expect(detail).toContain('data-testid="portal-account-linked"');
    expect(detail).toContain('data-testid="portal-account-absence"');
    expect(detail).toContain('data-testid="portal-account-denied"');
    expect(detail).toContain('data-testid="portal-candidates-select"');
    expect(detail).toContain('data-testid="portal-link-button"');
    expect(detail).toContain('data-testid="portal-unlink-button"');
    expect(detail).toContain('data-testid="portal-account-message"');
    expect(detail).toContain('data-testid="portal-account-error"');
  });

  it('the card gates by the same trio and fetches the candidates wire', () => {
    // v2.267.0 re-point with the growth named: the gate is the store's word
    // when it has one, otherwise the SERVER's (the candidates probe vouches —
    // a direct /hr load has no hydrated auth store; the old client-only gate
    // denied the trio its own card).
    expect(detail).toContain('const canManage = storeKnowsRole ? canManagePortalLinks(sessionRole) : probe?.ok === true;');
    expect(detail).toContain('const storeKnowsRole = !!sessionRole;');
    expect(detail).toContain('if (storeKnowsRole) return; // the store\'s word is enough — no probe');
    expect(detail).toContain('/api/employees/${employee.id}/portal-link/candidates`');
    expect(detail).toContain('method: \'POST\',');
    expect(detail).toContain('body: JSON.stringify({ userId: pickUserId }),');
    expect(detail).toContain('{ method: \'DELETE\', credentials: \'include\' }');
  });

  it('the service\u2019s voice passes through verbatim (never paraphrased)', () => {
    expect(detail).toContain("return body.message || 'Portal account linked.';");
    expect(detail).toContain("return body.message || 'Portal account unlinked.';");
    expect(detail).toContain('role="status"');
    expect(detail).toContain('role="alert"');
  });

  it('the audit footnote + the disabled-annotation option', () => {
    expect(detail).toContain('Every link and unlink is recorded in the HR audit trail.');
    expect(detail).toContain('disabled={!!c.linkedToEmployeeName}');
    expect(detail).toContain('linked to ${c.linkedToEmployeeName}');
  });

  it('the deactivated account gets its honest amber face', () => {
    expect(detail).toContain('{!linked.isActive ? (');
    expect(detail).toContain('This account is deactivated');
  });
});

describe('the ancestors (bytes the growth must not touch)', () => {
  it('the employees LIST answers the top role (the walk\u2019s own find, fixed)', () => {
    // The v2.113.0 map had no SUPER_ADMIN entry: readKey was undefined and
    // the !readKey check 403'd BEFORE the documented hasHrPermission bypass
    // could run — /hr/employees listed NOTHING for the platform's top role
    // (found live in the round's QA walk, not by a test).
    const listRoute = read('app/api/hr/employees/route.ts');
    expect(listRoute).toContain("SUPER_ADMIN: 'hr.employee.read.all',");
    expect(listRoute).toContain('const readKey = READ_KEY_BY_ROLE[session.role];');
    // The v2113 ancestor entries stay put:
    expect(listRoute).toContain("STORE_OWNER: 'hr.employee.read.all'");
    expect(listRoute).toContain("BRANCH_MANAGER: 'hr.employee.read.own_branch'");
  });

  it('the pure helper\u2019s older contracts stay put', () => {
    expect(helper).toContain("export const PORTAL_EMAIL_DOMAIN = 'mbumahhardware.co.ke';");
    expect(helper).toContain('export function suggestPortalEmail(fullName: string): string {');
    expect(helper).toContain('export function generateTempPassword(): string {');
    expect(helper).toContain('export const PORTAL_CREATE_ROLE_OPTIONS: readonly PortalRoleOption[] = [');
    expect(helper).toContain('export function isCreateLinkFormReady(form: CreateLinkFormState): boolean {');
  });

  it('the service\u2019s older portal contracts stay put', () => {
    expect(service).toContain('export async function linkPortalAccount(input: {');
    expect(service).toContain('export async function unlinkPortalAccount(input: {');
    // the ternary's own bytes (the re-link voice beside it):
    expect(service).toContain("? 'Portal account re-linked. Leave and payroll notifications now reach the new account.'");
    expect(service).toContain(": 'Portal account linked. Leave and payroll notifications now reach this employee in the app.',");
  });

  it('the detail page\u2019s older cards stay put', () => {
    expect(detail).toContain('<CardTitle className="text-base">Statutory identifiers</CardTitle>');
    expect(detail).toContain('<CardTitle className="text-base">Pay (current record)</CardTitle>');
    expect(detail).toContain('<CardTitle className="text-base">Documents</CardTitle>');
  });
});
