#!/usr/bin/env node
// verify-v2-293-0.mjs — the round's gate (v2.293.0 "The dashboard speaks the feed's language").
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
const feed = read('src/lib/whats-new.ts');
const changelog = read('CHANGELOG.md');
const test = read('src/tests/dashboard-tone-v293.test.ts');

console.log('— the release face —');
ok('pkg version = 2.293.0 (all three slots)', pkg.version === '2.293.0' && pkg.mbumah?.releaseVersion === '2.293.0' && pkg.mbumah?.baseVersion === '2.293.0');
ok('VERSION = 2.293.0', version === '2.293.0');
ok('whats-new lead = 2.293.0 with the round\u2019s title', feed.includes("version: '2.293.0',") && feed.includes('The dashboard speaks the feed'));
const leadIdx = feed.indexOf("version: '2.293.0',");
const pairIdx = feed.indexOf("version: '2.292.0',");
ok('whats-new pair order (lead 2.293.0 before pair 2.292.0)', leadIdx > -1 && pairIdx > leadIdx);
ok('CHANGELOG wears [2.293.0]', changelog.includes('## [2.293.0] The dashboard speaks the feed'));
ok('the verify script is wired (previous gates stay)', pkg.scripts['verify:v2-293-0'] === 'node scripts/verify-v2-293-0.mjs' && pkg.scripts['verify:v2-292-0'] === 'node scripts/verify-v2-292-0.mjs');

console.log('— the one vocabulary completes —');
ok('the lib carries the dashboard\u2019s twelve', lib.includes('RATE_LIMITED: \u0027Rate Limited\u0027,') && lib.includes('CSRF_FAILED: \u0027CSRF Failed\u0027,') && lib.includes('INVALID_INPUT: \u0027Invalid Input\u0027,') && lib.includes('SUSPICIOUS_ACTIVITY: \u0027Suspicious Activity\u0027,') && lib.includes('SESSION_HIJACK_ATTEMPT: \u0027Session Hijack\u0027,'));
ok('the tab\u2019s local EVENT_TYPE_LABELS copy is DEAD', !/const EVENT_TYPE_LABELS\s*:/.test(tab));
ok('the tab\u2019s local SEVERITY_BG copy is DEAD', !/const SEVERITY_BG\s*:/.test(tab));
ok('the tab imports the one home', tab.includes("from '@/lib/security-feed';") && tab.includes('SECURITY_SEVERITY_BADGE_CLASSES'));

console.log('— the tone law learns CRITICAL —');
ok('CRITICAL joins ERROR in the red family', lib.includes("if (severity === 'CRITICAL' || severity === 'ERROR') return 'error';"));
ok('the severity badge faces are the lib\u2019s closed five', lib.includes('export const SECURITY_SEVERITY_BADGE_CLASSES') && lib.includes("CRITICAL: 'bg-red-500/10 text-red-500 border-red-500/20',") && lib.includes("DEBUG: 'bg-gray-400/10 text-gray-400 border-gray-400/20',"));
ok('the dashboard rows wear the same tone function', tab.includes('SECURITY_TONE_CLASSES[securityRowTone(event.eventType, event.severity)].row'));

console.log('— the gate-heat report —');
ok('the lib exports the pure report', lib.includes('export function deniedGateReport(') && lib.includes('export interface DeniedGate'));
ok('the route groups PERMISSION_DENIED by resource', route.includes("eventType: 'PERMISSION_DENIED'") && route.includes("by: ['resource']") && route.includes('resource: { not: null }'));
ok('the route counts the 24h total (the unnamed gap stays visible)', route.includes('totalDenied24h'));
ok('the response voices the aggregate through the lib', route.includes('deniedGates: deniedGateReport('));
ok('the card renders with its honest-empty face', tab.includes('Most denied gates') && tab.includes('No denials in the last 24h — every gate said yes.'));
ok('the bars ride the graphics-safe amber family', tab.includes('bg-amber-600'));
ok('fetchDashboard maps the wire aggregate', tab.includes('deniedGates: data?.deniedGates ??'));

console.log('— the suite (both nets) —');
ok('the CRITICAL pin is by value', test.includes("expect(securityRowTone('SOMETHING_NEW', 'CRITICAL')).toBe('error');"));
ok('the report arithmetic is pinned by value', test.includes("expect(r.namedDenials + r.unnamedDenials).toBe(9);"));
ok('the dead-copy law is pinned', test.includes('no const EVENT_TYPE_LABELS, no const SEVERITY_BG'));

console.log(`\nverify-v2-293-0: ${pass} passed, ${fail} failed`);
process.exit(fail > 0 ? 1 : 0);
