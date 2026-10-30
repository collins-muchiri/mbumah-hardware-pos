#!/usr/bin/env node
// verify-v2-295-0.mjs — the round's gate (v2.295.0 "The gates open their ledgers").
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
const eventsRoute = read('src/app/api/security/events/route.ts');
const perms = read('src/lib/permissions.ts');
const auth = read('src/lib/auth.ts');
const tx = read('src/app/api/transactions/route.ts');
const users = read('src/app/api/users/route.ts');
const usersId = read('src/app/api/users/[id]/route.ts');
const feed = read('src/lib/whats-new.ts');
const changelog = read('CHANGELOG.md');
const test = read('src/tests/gate-drill-v295.test.ts');

console.log('— the release face —');
ok('pkg version = 2.295.0 (all three slots)', pkg.version === '2.295.0' && pkg.mbumah?.releaseVersion === '2.295.0' && pkg.mbumah?.baseVersion === '2.295.0');
ok('VERSION = 2.295.0', version === '2.295.0');
ok('whats-new lead = 2.295.0 with the round\u2019s title', feed.includes("version: '2.295.0',") && feed.includes('The gates open their ledgers'));
const leadIdx = feed.indexOf("version: '2.295.0',");
const pairIdx = feed.indexOf("version: '2.294.0',");
ok('whats-new pair order (lead 2.295.0 before pair 2.294.0)', leadIdx > -1 && pairIdx > leadIdx);
ok('CHANGELOG wears [2.295.0]', changelog.includes('## [2.295.0] The gates open their ledgers'));
ok('the verify script is wired (previous gates stay)', pkg.scripts['verify:v2-295-0'] === 'node scripts/verify-v2-295-0.mjs' && pkg.scripts['verify:v2-294-0'] === 'node scripts/verify-v2-294-0.mjs');

console.log('— the gate drill (feature \u2464 + face \u2463) —');
ok('the events route reads ?resource= and filters exact-match', eventsRoute.includes("const resource = searchParams.get('resource') || '';") && eventsRoute.includes('if (resource) where.resource = resource;'));
ok('the lib exports both drill voices from the one home', lib.includes('export function gateDrillVoice(') && lib.includes('export function gateDrillEmptyVoice('));
ok('the drill voices are pinned bytes in the lib', lib.includes('`No denial records at ${resource} right now — the ledger moved since the count.`') && lib.includes("`${count} ${count === 1 ? 'denial' : 'denials'} at ${resource} in the last ${windowLabel}.`"));
ok('the card\u2019s rows are handles (aria-expanded + drilled face)', tab.includes('aria-expanded={drilled}') && tab.includes("aria-controls={drilled ? 'gate-drill-panel' : undefined}") && tab.includes('bg-amber-500/[0.06]'));
ok('the row button invites the hand (hover + focus ring + cursor)', tab.includes('cursor-pointer hover:bg-muted/50') && tab.includes('focus-visible:ring-amber-500/40'));
ok('the drill fetch windows itself to the lens', tab.includes('const GATE_WINDOW_MS: Record<GateRange, number> = {') && tab.includes('GATE_WINDOW_MS[range]'));
ok('the drill asks exactly the card\u2019s question (resource + PERMISSION_DENIED, newest 8)', tab.includes("eventType: 'PERMISSION_DENIED',") && tab.includes("limit: '8',") && tab.includes('resource,'));
ok('the drill query is keyed by gate AND lens, enabled only while open', tab.includes("queryKey: ['security-gate-drill', gateDrill, gateRange],") && tab.includes('enabled: !!gateDrill,'));
ok('the panel is a named region speaking the drill voices', tab.includes('id="gate-drill-panel"') && tab.includes('role="region"') && tab.includes('{gateDrillVoice(gateDrill, drilledCount, gateRange)}') && tab.includes('{gateDrillEmptyVoice(gateDrill)}'));
ok('the +N footer and the close affordance are wired', tab.includes('+{gateDrillQuery.data.total - drillRows.length} earlier in this window.') && tab.includes('aria-label="Close gate drill"'));
ok('Escape closes the drill (scoped listener, armed only while open)', tab.includes("if (e.key === 'Escape') setGateDrill(null);") && tab.includes("window.addEventListener('keydown', onKey);") && tab.includes("window.removeEventListener('keydown', onKey);"));
ok('the drill rows wear the lib\u2019s badge faces and one vocabulary', (tab.match(/SECURITY_SEVERITY_BADGE_CLASSES\[ev\.severity\]/g) || []).length === 1 && (tab.match(/EVENT_TYPE_LABELS\[ev\.eventType\]/g) || []).length === 1);

console.log('— the lock\u2019s own line —');
ok('the composer lives in the pure permissions home', perms.includes('export function lockNotice(lockedMinutes: number): string | null {'));
ok('the exact lock lines are pinned bytes', perms.includes("'Account locked for 1 minute — too many denied attempts.'") && perms.includes('`Account locked for ${lockedMinutes} minutes — too many denied attempts.`'));
ok('the silence law is byte-honest (finite + integer + positive)', perms.includes('if (!Number.isFinite(lockedMinutes)) return null;') && perms.includes('if (!Number.isInteger(lockedMinutes)) return null;') && perms.includes('if (lockedMinutes <= 0) return null;'));
ok('auth.ts imports the composer — no local copy', auth.includes('lockNotice,') && !/(?:const|function)\s+lockNotice/.test(auth));
ok('the return shape grew lockNotice; the trip arm speaks it', auth.includes('lockNotice: string | null;') && auth.includes('lockNotice: lockNotice(lockedMinutes) };'));
ok('the escalation law is untouched: every other arm stays null', auth.includes('return { locked: true, attemptsRemaining: 0, warning: null, lockNotice: null };') && auth.includes('warning: lockoutWarning(attemptsRemaining),') && auth.includes('lockNotice: null,'));
ok('all five 403 call sites thread the lockNotice spread', [tx, tx, tx, users, usersId].every((s) => s.includes('...(abuse.lockNotice ? { lockNotice: abuse.lockNotice } : {})')));
ok('transactions carries exactly three sites', (tx.match(/const abuse = await noteDeniedAndMaybeLock\(/g) || []).length === 3);

console.log('— the suite (both nets) —');
ok('the drill voices are pinned by value', test.includes("'5 denials at /api/users in the last 24h.'") && test.includes("'1 denial at /api/leaves in the last 24h.'"));
ok('the lock line is pinned by value', test.includes("'Account locked for 15 minutes — too many denied attempts.'"));
ok('the silence arms are pinned', test.includes('expect(lockNotice(0)).toBeNull();') && test.includes('expect(lockNotice(1.5)).toBeNull();'));

console.log(`\nverify-v2-295-0: ${pass} passed, ${fail} failed`);
process.exit(fail > 0 ? 1 : 0);
