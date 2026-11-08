#!/usr/bin/env node
// verify-v2-292-0.mjs — the round's gate (v2.292.0 "Every denial lands on the record").
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
const auth = read('src/lib/auth.ts');
const lib = read('src/lib/security-feed.ts');
const center = read('src/components/notification-center.tsx');
const feed = read('src/lib/whats-new.ts');
const changelog = read('CHANGELOG.md');
const test = read('src/tests/denial-ledger-v292.test.ts');
const leaves = read('src/app/api/leaves/route.ts');
const diag = [
  'src/app/api/org/branch-diagnostics/route.ts',
  'src/app/api/org/branch-diagnostics/[storeCode]/route.ts',
  'src/app/api/org/branch-diagnostics/refresh/route.ts',
].map(read);

console.log('— the release face —');
ok('pkg version = 2.292.0 (all three slots)', pkg.version === '2.292.0' && pkg.mbumah?.releaseVersion === '2.292.0' && pkg.mbumah?.baseVersion === '2.292.0');
ok('VERSION = 2.292.0', version === '2.292.0');
ok('whats-new lead = 2.292.0 with the round\u2019s title', feed.includes("version: '2.292.0',") && feed.includes('Every denial lands on the record'));
const leadIdx = feed.indexOf("version: '2.292.0',");
const pairIdx = feed.indexOf("version: '2.291.0',");
ok('whats-new pair order (lead 2.292.0 before pair 2.291.0)', leadIdx > -1 && pairIdx > leadIdx);
ok('CHANGELOG wears [2.292.0]', changelog.includes('## [2.292.0] Every denial lands on the record'));
ok('the verify script is wired (previous gates stay)', pkg.scripts['verify:v2-292-0'] === 'node scripts/verify-v2-292-0.mjs' && pkg.scripts['verify:v2-291-0'] === 'node scripts/verify-v2-291-0.mjs');

console.log('— the denial ledger (the wrappers record) —');
ok('requireAuth\u2019s role gate calls the recorder', auth.includes("permission: `roles:${options.roles.join('|')}`") && auth.includes('await recordPermissionDenied({'));
ok('the log-only denial blocks are DEAD', !auth.includes('attempted access requiring roles:') && !auth.includes('attempted access requiring: ${allowedRoles.join'));
ok('the recorder fires from at least four sites (3 gates + the recorded twin)', (auth.match(/await recordPermissionDenied\(\{/g) || []).length >= 4);
ok('the recorded twin exists', auth.includes('export function requireRoleRecorded(...roles: string[]) {') && auth.includes("permission: `roles:${roles.join('|')}`"));

console.log('— the recorded twin\u2019s call sites —');
ok('the leaves decision-capable gate is recorded', leaves.includes("requireRoleRecorded('SUPER_ADMIN', 'STORE_OWNER', 'BRANCH_MANAGER', 'ACCOUNTANT')(session, request)") && !leaves.includes("requireRole('SUPER_ADMIN', 'STORE_OWNER', 'BRANCH_MANAGER', 'ACCOUNTANT')"));
ok('all three org-console gates are recorded', diag.every((s) => s.includes("requireRoleRecorded('SUPER_ADMIN', 'STORE_OWNER')") && s.includes('await requireConsoleRole(session, request)') && !s.includes('= requireRole(')));

console.log('— the security feed\u2019s one vocabulary —');
ok('the lib is the one home (abuse set + labels + tone law)', lib.includes('export const ABUSE_EVENT_TYPES') && lib.includes('export const EVENT_TYPE_LABELS') && lib.includes('export function securityRowTone(') && lib.includes("if (severity === 'ERROR') return 'error';"));
ok('the lockout family is red by type', lib.includes("if (eventType === 'ACCOUNT_LOCKED' || eventType === 'BRUTE_FORCE') return 'error';"));
ok('unknown stays quiet', lib.includes("return 'info';"));
ok('the component imports, the local copies are dead', center.includes("} from '@/lib/security-feed';") && !center.includes('const ABUSE_EVENT_TYPES = [') && !/const EVENT_TYPE_LABELS/.test(center));
ok('the row contract grew severity + blocked', center.includes('severity?: string | null;') && center.includes('blocked?: boolean;'));
const feedBody = center.split('function SecurityEventsFeed')[1]?.split('export function NotificationCenter')[0] ?? '';
ok('the tone drives the row face', feedBody.includes('const tone = securityRowTone(event.eventType, event.severity);') && feedBody.includes('${toneClasses.row}'));
ok('the one-red-for-everything face is gone from the events feed', !feedBody.includes('bg-red-50 dark:bg-red-950/20'));
ok('blocked badge + role/permission chips render', feedBody.includes('{event.blocked && (') && feedBody.includes('{event.details?.role && (') && feedBody.includes('{event.details?.permission && ('));

console.log('— the suite (both nets) —');
ok('the tone table is pinned BY VALUE', test.includes("expect(securityRowTone('ACCOUNT_LOCKED')).toBe('error');") && test.includes("expect(securityRowTone('MANAGER_AUTHORIZED')).toBe('info');"));
ok('the label completeness is pinned', test.includes('every abuse type has shop-floor words'));
ok('the leaves pin is re-anchored to the recorded twin', test.includes("requireRoleRecorded('SUPER_ADMIN', 'STORE_OWNER', 'BRANCH_MANAGER', 'ACCOUNTANT')(session, request)"));

console.log(`\nverify-v2-292-0: ${pass} passed, ${fail} failed`);
process.exit(fail > 0 ? 1 : 0);
