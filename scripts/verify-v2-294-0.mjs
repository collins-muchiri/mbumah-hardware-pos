#!/usr/bin/env node
// verify-v2-294-0.mjs — the round's gate (v2.294.0 "The gates learn their window").
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
const lib = read('src/lib/security-feed.ts');
const tab = read('src/app/(shell)/tabs/security-tab.tsx');
const route = read('src/app/api/security/dashboard/route.ts');
const perms = read('src/lib/permissions.ts');
const auth = read('src/lib/auth.ts');
const tx = read('src/app/api/transactions/route.ts');
const users = read('src/app/api/users/route.ts');
const usersId = read('src/app/api/users/[id]/route.ts');
const feed = read('src/lib/whats-new.ts');
const changelog = read('CHANGELOG.md');
const test = read('src/tests/gate-window-v294.test.ts');

console.log('— the release face —');
ok('pkg version = 2.294.0 (all three slots)', pkg.version === '2.294.0' && pkg.mbumah?.releaseVersion === '2.294.0' && pkg.mbumah?.baseVersion === '2.294.0');
ok('VERSION = 2.294.0', version === '2.294.0');
ok('whats-new lead = 2.294.0 with the round\u2019s title', feed.includes("version: '2.294.0',") && feed.includes('The gates learn their window'));
const leadIdx = feed.indexOf("version: '2.294.0',");
const pairIdx = feed.indexOf("version: '2.293.0',");
ok('whats-new pair order (lead 2.294.0 before pair 2.293.0)', leadIdx > -1 && pairIdx > leadIdx);
ok('CHANGELOG wears [2.294.0]', changelog.includes('## [2.294.0] The gates learn their window'));
ok('the verify script is wired (previous gates stay)', pkg.scripts['verify:v2-294-0'] === 'node scripts/verify-v2-294-0.mjs' && pkg.scripts['verify:v2-293-0'] === 'node scripts/verify-v2-293-0.mjs');

console.log('— the range lens —');
ok('the lib takes the additive windowLabel (24h default)', lib.includes("windowLabel = '24h'") && lib.includes('`1 denial in the last ${windowLabel}.`'));
ok('the route whitelists the three named ranges', route.includes("const DENIED_GATES_RANGES = ['24h', '7d', '30d'] as const;") && route.includes("searchParams.get('range')"));
ok('the route windows both queries through one since', (route.match(/createdAt: \{ gte: deniedGatesSince \}/g) || []).length === 2);
ok('the response voices the windowed report + names its window', route.includes('window: deniedGatesRange,') && route.includes('deniedGateReport('));
ok('the card carries the three-chip lens (pressed face = the amber family)', tab.includes('aria-pressed={pressed}') && tab.includes("'bg-amber-500/10 text-amber-700 border-amber-500/30 font-medium'") && tab.includes('aria-label="Denied gates time window"'));
ok('the lens refetches (query key + wire carry the range)', tab.includes("queryKey: ['security-dashboard', gateRange]") && tab.includes('queryFn: () => fetchDashboard(gateRange)') && tab.includes('/api/security/dashboard?range=${gateRange}'));
ok('the honest-empty face windows too', tab.includes('No denials in the last {gateRange} — every gate said yes.'));
ok('the bars ease between windows', tab.includes('bg-amber-600 transition-all duration-500'));

console.log('— the engine counts aloud —');
ok('the composer lives in the pure permissions home', perms.includes('export const LOCKOUT_WARN_AT = 2;') && perms.includes('export function lockoutWarning(attemptsRemaining: number): string | null {'));
ok('the exact warning lines are pinned bytes', perms.includes("'Warning: 1 attempt remaining before a 15-minute lockout.'") && perms.includes('`Warning: ${attemptsRemaining} attempts remaining before a 15-minute lockout.`'));
ok('auth.ts imports the composer — no local copy', auth.includes('lockoutWarning,') && !/(?:const|function)\s+lockoutWarning/.test(auth));
ok('the engine returns { locked, attemptsRemaining, warning } (+ v2.295.0 lockNotice)', auth.includes('warning: string | null;') && auth.includes('lockNotice: string | null;'));
ok('locked arms speak nothing; the warm window speaks the line (v2.295.0 bytes)', auth.includes('return { locked: true, attemptsRemaining: 0, warning: null, lockNotice: null };') && auth.includes('warning: lockoutWarning(attemptsRemaining),') && auth.includes('lockNotice: lockNotice(lockedMinutes) };'));
ok('all five 403 call sites thread the warning', [tx, tx, tx, users, usersId].every((s) => s.includes('const abuse = await noteDeniedAndMaybeLock(') && s.includes('warning: abuse.warning') && s.includes('attemptsRemaining: abuse.attemptsRemaining')));
ok('transactions carries exactly three sites', (tx.match(/const abuse = await noteDeniedAndMaybeLock\(/g) || []).length === 3);

console.log('— the suite (both nets) —');
ok('the windowed voice is pinned by value', test.includes("expect(deniedGateReport(1, [g('/api/users', 1)], 5, '7d').voice).toBe("));
ok('the warning copy is pinned by value', test.includes("expect(lockoutWarning(2)).toBe('Warning: 2 attempts remaining before a 15-minute lockout.');"));
ok('the silence arms are pinned', test.includes('expect(lockoutWarning(3)).toBeNull();'));

console.log(`\nverify-v2-294-0: ${pass} passed, ${fail} failed`);
process.exit(fail > 0 ? 1 : 0);
