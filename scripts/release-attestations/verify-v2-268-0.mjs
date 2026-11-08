#!/usr/bin/env node
// verify-v2-268-0.mjs — the round's gate (v2.268.0 "the roster's quiet bell").
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
const service = read('src/lib/hr/employee-service.ts');
const types = read('src/lib/hr/types.ts');
const page = read('src/app/(shell)/hr/employees/page.tsx');
const detail = read('src/app/(shell)/hr/employees/[id]/page.tsx');
const feed = read('src/lib/whats-new.ts');
const changelog = read('CHANGELOG.md');

console.log('— the release face —');
ok('pkg version = 2.268.0', pkg.version === '2.268.0');
ok('pkg releaseVersion = 2.268.0', pkg.mbumah?.releaseVersion === '2.268.0');
ok('pkg baseVersion = 2.268.0', pkg.mbumah?.baseVersion === '2.268.0');
ok('VERSION = 2.268.0', version === '2.268.0');
ok('whats-new lead = 2.268.0 with the round\u2019s title', feed.includes("version: '2.268.0',") && feed.includes('The roster\\u2019s quiet bell'));
const leadIdx = feed.indexOf("version: '2.268.0',");
const pairIdx = feed.indexOf("version: '2.267.0',");
ok('whats-new pair order (lead 2.268.0 before pair 2.267.0)', leadIdx > -1 && pairIdx > leadIdx);
ok('CHANGELOG wears [2.268.0]', changelog.includes("## [2.268.0] The roster's quiet bell"));

console.log('— the bell rides the wire —');
ok('the list include: role + active state only', service.includes('user: { select: { role: true, isActive: true } },'));
ok('the shaping: the raw relation stripped, the bits shaped', service.includes('portalLinked: e.user != null,') && service.includes('portalRole: e.user?.role ?? null,') && service.includes('portalActive: e.user ? e.user.isActive : null,'));
ok('the type wears the three fields', types.includes('portalLinked?: boolean;') && types.includes('portalRole?: string | null;') && types.includes('portalActive?: boolean | null;'));
ok('the detail wire\u2019s own select stays byte-identical', service.includes('include: { user: { select: { id: true, email: true, name: true, role: true, isActive: true } } },'));

console.log('— the roster wears the bell —');
ok('the chip map: the consent vocabulary\u2019s emerald + amber', page.includes("const PORTAL_CHIP: Record<'linked' | 'off',") && page.includes("'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-300',") && page.includes("'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/50 dark:text-amber-300',"));
ok('the chip component: the null guard + the testid + the bell', page.includes('if (!row.portalLinked) return null; // an unlinked row never renders a look-alike') && page.includes('data-testid="hr-employees-portal-chip"') && page.includes('<BellRing className="h-3 w-3" aria-hidden="true" />'));
ok('the off face reads the active state', page.includes("row.portalActive === false ? 'off' : 'linked'"));
ok('the desktop column sits between Status and consent', (() => {
  const s = page.indexOf('<TableHead>Status</TableHead>');
  const p = page.indexOf('data-testid="hr-employees-portal-col"');
  const c = page.indexOf('data-testid="hr-employees-consent-col"');
  return s > -1 && p > s && c > p;
})());
ok('the honest silence: the dash, never a look-alike', page.includes('data-testid="hr-employees-portal-silent"') && page.includes('No linked login \u2014 the self-service portal stays behind the HR desk.'));
ok('the mobile compact chip beside the badge', page.includes('<PortalChip row={r} compact />'));
ok('the count reads the rows', page.includes('data-testid="hr-employees-portal-count"') && page.includes('rows.filter((r) => r.portalLinked).length') && page.includes('of {rows.length} linked'));

console.log('— the picker\u2019s chevron —');
ok('the import, the room, the arrow', detail.includes("import { ChevronDown, Eye, EyeOff, FilePlus2, Link2, Loader2, ShieldAlert, ShieldCheck, Unlink } from 'lucide-react';") && detail.includes('pl-3 pr-8 py-1 text-sm shadow-sm') && detail.includes('pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400'));
ok('the card\u2019s testids stand untouched', ['portal-account-card', 'portal-state-chip', 'portal-account-linked', 'portal-account-absence', 'portal-candidates-select', 'portal-link-button', 'portal-unlink-button'].every((t) => detail.includes(`data-testid="${t}"`)));

console.log('— the ancestors —');
ok('the consent chip\u2019s own bytes', page.includes('const CONSENT_CHIP: Record<') && page.includes('data-testid="hr-employees-consent-chip"'));
ok('the expiry annotation rides the same map', service.includes('expiringDocuments: hit.count, nearestExpiry: toIso(hit.nearest)'));
ok('the v2.267.0 portal DTO type keeps its shape', types.includes('export interface HrPortalUserDto {'));
ok('the parent link route\u2019s trio unchanged', read('src/app/api/employees/[id]/portal-link/route.ts').includes("const PORTAL_LINK_ROLES = ['SUPER_ADMIN', 'STORE_OWNER', 'HR_MANAGER'] as const;"));

console.log(`\nverify v2.268.0: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
