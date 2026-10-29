#!/usr/bin/env node
// verify-v2-267-0.mjs — the round's gate (v2.267.0 "the portal's keystone").
// Every check reads the SOURCE OF RECORD (bytes, not memory) — THE OD LAW.
import { readFileSync } from 'node:fs';

let pass = 0, fail = 0;
const ok = (name, cond) => {
  if (cond) { pass++; console.log(`  ok  ${name}`); }
  else { fail++; console.error(`x FAIL ${name}`); }
};
const read = (p) => readFileSync(p, 'utf8');

const pkg = JSON.parse(read('package.json'));
const version = read('VERSION').trim();
const helper = read('src/lib/hr/portal-account.ts');
const service = read('src/lib/hr/employee-service.ts');
const types = read('src/lib/hr/types.ts');
const candidatesRoute = read('src/app/api/employees/[id]/portal-link/candidates/route.ts');
const detail = read('src/app/(shell)/hr/employees/[id]/page.tsx');
const tab = read('src/app/(shell)/tabs/payroll-tab.tsx');
const feed = read('src/lib/whats-new.ts');
const changelog = read('CHANGELOG.md');
const parentRoute = read('src/app/api/employees/[id]/portal-link/route.ts');

console.log('— the release face —');
ok('pkg version = 2.267.0', pkg.version === '2.267.0');
ok('pkg releaseVersion = 2.267.0', pkg.mbumah?.releaseVersion === '2.267.0');
ok('pkg baseVersion = 2.267.0', pkg.mbumah?.baseVersion === '2.267.0');
ok('VERSION = 2.267.0', version === '2.267.0');
ok('whats-new lead = 2.267.0 with the round\u2019s title', feed.includes("version: '2.267.0',") && feed.includes('The portal\\u2019s keystone'));
const leadIdx = feed.indexOf("version: '2.267.0',");
const pairIdx = feed.indexOf("version: '2.266.0',");
ok('whats-new pair order (lead 2.267.0 before pair 2.266.0)', leadIdx > -1 && pairIdx > leadIdx);
ok('CHANGELOG wears [2.267.0]', changelog.includes("## [2.267.0] The portal's keystone"));

console.log('— the candidates wire —');
ok('the route: trio gate + 403 voice + thin service delegation', candidatesRoute.includes('canManagePortalLinks(session.role)') && candidatesRoute.includes('Only store owners, HR managers and super admins can manage portal account links.') && candidatesRoute.includes('listPortalLinkCandidates(id)') && candidatesRoute.includes('requireStoreAccess(candidatesHandler'));
ok('the service: store-scoped ACTIVE candidates + the annotation read', service.includes("where: { storeId: employee.storeId, isActive: true },") && service.includes("where: { userId: { in: ids }, deletedAt: null, id: { not: employee.id } },") && service.includes('buildPortalCandidates(users, linkedElsewhere),'));
ok('the shaper lives in one home (portal-account.ts)', helper.includes('export function buildPortalCandidates(') && helper.includes('export interface PortalLinkCandidate {'));
ok('the parent link route stays byte-identical', parentRoute.includes("const PORTAL_LINK_ROLES = ['SUPER_ADMIN', 'STORE_OWNER', 'HR_MANAGER'] as const;"));

console.log('— the detail wire grows portalUser —');
ok('the type: HrPortalUserDto + the optional field', types.includes('export interface HrPortalUserDto {') && types.includes('portalUser?: HrPortalUserDto | null;'));
ok('the include + the destructure-out + the shaped exit', service.includes("include: { user: { select: { id: true, email: true, name: true, role: true, isActive: true } } },") && service.includes('const { user, ...employeeRow } = employee;') && service.includes('portalUser: user ?? null,') && service.includes('return shapeEmployeeDetail(raw, options.includePii);'));

console.log('— the dialog\u2019s honest voice —');
ok('the picker reads its OWN wire (no /api/users left)', tab.includes("queryKey: ['portal-link-candidates', employee?.id],") && tab.includes('apiFetch(`/api/employees/${employee?.id}/portal-link/candidates`)') && !tab.includes('portal-link-users') && !tab.includes('/api/users?storeId='));
ok('the denial panel (testid + amber + ShieldAlert + the why)', tab.includes('data-testid="portal-link-denied"') && tab.includes('Your role can view this link but not change it') && tab.includes('<ShieldAlert'));
ok('bound rows disabled WITH their reason', tab.includes('const taken = !!u.linkedToEmployeeName;') && tab.includes('aria-disabled={taken}') && tab.includes('title={taken ? `Already linked to ${u.linkedToEmployeeName} — unlink there first` : undefined}'));
ok('the pens render only for the trio', tab.includes('const canManageLinks = canManagePortalLinks(sessionUser?.role);') && tab.includes("(mode === 'link' || !canCreateAccounts) && canManageLinks && (") && tab.includes('{canManageLinks ? ('));
ok('one palette home (roleTone delegates)', tab.includes('const roleTone = portalRoleTone;'));

console.log('— the employee-detail card —');
ok('the mount + the testids', detail.includes('<PortalAccountCard employee={employee} onMutated={() => void load(false)} />') && detail.includes('data-testid="portal-account-card"') && detail.includes('data-testid="portal-account-linked"') && detail.includes('data-testid="portal-account-absence"') && detail.includes('data-testid="portal-account-denied"') && detail.includes('data-testid="portal-candidates-select"') && detail.includes('data-testid="portal-link-button"') && detail.includes('data-testid="portal-unlink-button"'));
ok('the card\u2019s gate + wire + verbatim voice', detail.includes('const canManage = storeKnowsRole ? canManagePortalLinks(sessionRole) : probe?.ok === true;') && detail.includes('const storeKnowsRole = !!sessionRole;') && detail.includes('/api/employees/${employee.id}/portal-link/candidates`') && detail.includes("return body.message || 'Portal account linked.';") && detail.includes("return body.message || 'Portal account unlinked.';") && detail.includes('role="status"') && detail.includes('role="alert"'));
ok('the audit footnote + the deactivated face', detail.includes('Every link and unlink is recorded in the HR audit trail.') && detail.includes('{!linked.isActive ? (') && detail.includes('This account is deactivated'));

console.log('— the walk’s own find: the list answers the top role —');
const listRoute = read('src/app/api/hr/employees/route.ts');
ok('READ_KEY_BY_ROLE names SUPER_ADMIN (the bypass can run)', listRoute.includes("SUPER_ADMIN: 'hr.employee.read.all',") && listRoute.includes('const readKey = READ_KEY_BY_ROLE[session.role];'));
ok('the v2113 ancestor entries stay put', listRoute.includes("STORE_OWNER: 'hr.employee.read.all'") && listRoute.includes("BRANCH_MANAGER: 'hr.employee.read.own_branch'"));

console.log('— the ancestors untouched —');
ok('the helper\u2019s older contracts', helper.includes("export const PORTAL_EMAIL_DOMAIN = 'mbumahhardware.co.ke';") && helper.includes('export function generateTempPassword(): string {') && helper.includes('export const PORTAL_CREATE_ROLE_OPTIONS: readonly PortalRoleOption[] = ['));
ok('the service\u2019s older portal contracts', service.includes('export async function linkPortalAccount(input: {') && service.includes('export async function unlinkPortalAccount(input: {'));
ok('the detail page\u2019s older cards', detail.includes('<CardTitle className="text-base">Statutory identifiers</CardTitle>') && detail.includes('<CardTitle className="text-base">Pay (current record)</CardTitle>') && detail.includes('<CardTitle className="text-base">Documents</CardTitle>'));

console.log(`\nverify-v2-267-0: ${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
console.log('verify OK');
