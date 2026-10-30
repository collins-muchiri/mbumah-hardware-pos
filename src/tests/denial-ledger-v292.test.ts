// v2.292.0 — every denial lands on the record.
//
//   - THE GAP (found live): requireAuth's ROLE gate wrote ONLY an ops
//     systemLog — the durable, dashboard-visible SecurityEvent never landed.
//     A cashier hitting /api/users 403'd three ways and the SecurityEvent
//     table stayed EMPTY (reproduced on :3200 before the fix: five 403s,
//     count 0). The security dashboard and the feed's Security tab could
//     never see the most common denial. withSessionAuth and
//     requireStoreAccess carried the same gap; requireRole() — the
//     in-handler helper — wrote NOTHING AT ALL.
//   - THE DENIAL LEDGER: all three wrapper role-gates route through
//     recordPermissionDenied (SecurityEvent + ops log + hash-chained audit
//     row, swallow-all-errors). requireRole gains a recorded twin,
//     requireRoleRecorded, and the four in-handler call sites migrate.
//   - THE TONE LAW: the security row's color is DATA. Severity leads (ERROR
//     red, WARN amber), the lockout family is red even when severity is
//     absent, unknown stays quiet slate. The vocabulary (abuse set, labels,
//     tone) moves OUT of the component into ONE lib — the same
//     one-vocabulary move the notification lens made in v2.290.0.
//
// THE TWO-NET LAW: the runtime net pins the tone table BY VALUE on the REAL
// function; the byte net pins the ledger wiring (the recorder calls, the
// death of the log-only blocks, the recorded twin's call sites) and the
// feed's severity face.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it, expect } from 'vitest';
import {
  ABUSE_EVENT_TYPES,
  EVENT_TYPE_LABELS,
  SECURITY_TONE_CLASSES,
  securityRowTone,
  type SecurityTone,
} from '@/lib/security-feed';

const readRepo = (rel: string) => readFileSync(join(process.cwd(), rel), 'utf8');

const AUTH = 'src/lib/auth.ts';
const LIB = 'src/lib/security-feed.ts';
const CENTER = 'src/components/notification-center.tsx';

// ---- the tone table (runtime net) ------------------------------------------

describe('securityRowTone — the tone law (runtime net)', () => {
  it('severity leads: ERROR is red, WARN is amber — the wire truth wins', () => {
    expect(securityRowTone('PERMISSION_DENIED', 'ERROR')).toBe('error');
    expect(securityRowTone('PERMISSION_DENIED', 'WARN')).toBe('warn');
    expect(securityRowTone('UNKNOWN_TYPE', 'ERROR')).toBe('error');
  });

  it('no severity: the lockout family is the red family', () => {
    expect(securityRowTone('ACCOUNT_LOCKED')).toBe('error');
    expect(securityRowTone('BRUTE_FORCE')).toBe('error');
    expect(securityRowTone('ACCOUNT_LOCKED', null)).toBe('error');
  });

  it('no severity: every other abuse type is amber', () => {
    expect(securityRowTone('PERMISSION_DENIED')).toBe('warn');
    expect(securityRowTone('HIGH_RISK_ATTEMPT')).toBe('warn');
    expect(securityRowTone('PRIVILEGE_ABUSE_PATTERN')).toBe('warn');
  });

  it('unknown type without severity stays quiet — never guessed into alarm', () => {
    expect(securityRowTone('MANAGER_AUTHORIZED')).toBe('info');
    expect(securityRowTone('SOMETHING_NEW')).toBe('info');
    expect(securityRowTone('SOMETHING_NEW', 'INFO')).toBe('info');
  });

  it('the verdict is exactly three-valued, and every abuse type resolves', () => {
    const tones: SecurityTone[] = ['error', 'warn', 'info'];
    for (const t of ABUSE_EVENT_TYPES) {
      expect(tones).toContain(securityRowTone(t));
      expect(securityRowTone(t, 'WARN')).toBe('warn');
    }
  });

  it('every abuse type has shop-floor words — the label map is complete', () => {
    for (const t of ABUSE_EVENT_TYPES) {
      expect(EVENT_TYPE_LABELS[t], t).toBeTruthy();
    }
    expect(EVENT_TYPE_LABELS.PERMISSION_DENIED).toBe('Permission Denied');
    expect(EVENT_TYPE_LABELS.ACCOUNT_LOCKED).toBe('Account Locked');
  });

  it('the tone classes are a closed set: every tone has a row face and an icon', () => {
    for (const t of ['error', 'warn', 'info'] as const) {
      expect(SECURITY_TONE_CLASSES[t].row).toContain('border-');
      expect(SECURITY_TONE_CLASSES[t].icon).toContain('text-');
    }
    // the red family stays red; amber stays amber; info stays quiet
    expect(SECURITY_TONE_CLASSES.error.row).toContain('bg-red-50');
    expect(SECURITY_TONE_CLASSES.warn.row).toContain('bg-amber-50');
    expect(SECURITY_TONE_CLASSES.info.row).toContain('bg-slate-50');
  });
});

// ---- the denial ledger (byte net) ------------------------------------------

describe('the denial ledger — wrapper role gates record (byte net)', () => {
  const auth = readRepo(AUTH);

  it('requireAuth\u2019s role gate calls the recorder \u2014 the log-only block is DEAD', () => {
    expect(auth).toContain('await recordPermissionDenied({');
    expect(auth).toContain("permission: `roles:${options.roles.join('|')}`");
    expect(auth).not.toContain("message: `User ${session.email} (role: ${session.role}) attempted access requiring roles:");
  });

  it('withSessionAuth and requireStoreAccess role gates record too \u2014 no log-only stragglers', () => {
    expect(auth.match(/await recordPermissionDenied\(\{/g)?.length).toBeGreaterThanOrEqual(4);
    expect(auth).not.toContain('attempted access requiring: ${allowedRoles.join');
  });

  it('the recorded twin exists with the same vocabulary as the wrapper gates', () => {
    expect(auth).toContain('export function requireRoleRecorded(...roles: string[]) {');
    expect(auth).toContain('permission: `roles:${roles.join(\'|\')}`');
  });

  it('the sync requireRole survives for non-recording callers \u2014 but the doc names the gap', () => {
    expect(auth).toContain('export function requireRole(...roles: string[]) {');
    expect(auth).toContain('RECORDS the denial before refusing');
  });
});

describe('the recorded twin\u2019s call sites (byte net)', () => {
  it('the leaves decision-capable gate is the recorded twin (EDIT still outside)', () => {
    const leaves = readRepo('src/app/api/leaves/route.ts');
    expect(leaves).toContain("requireRoleRecorded('SUPER_ADMIN', 'STORE_OWNER', 'BRANCH_MANAGER', 'ACCOUNTANT')(session, request)");
    expect(leaves).not.toContain("requireRole('SUPER_ADMIN', 'STORE_OWNER', 'BRANCH_MANAGER', 'ACCOUNTANT')");
  });

  it('all three org-console diagnostics gates are recorded', () => {
    for (const f of [
      'src/app/api/org/branch-diagnostics/route.ts',
      'src/app/api/org/branch-diagnostics/[storeCode]/route.ts',
      'src/app/api/org/branch-diagnostics/refresh/route.ts',
    ]) {
      const src = readRepo(f);
      expect(src, f).toContain("requireRoleRecorded('SUPER_ADMIN', 'STORE_OWNER')");
      expect(src, f).toContain('await requireConsoleRole(session, request)');
      expect(src, f).not.toContain('= requireRole(');
    }
  });
});

// ---- the feed's severity face (byte net) ------------------------------------

describe('the security feed speaks one vocabulary (byte net)', () => {
  const center = readRepo(CENTER);
  const lib = readRepo(LIB);

  it('the lib is the one home \u2014 the component imports, the local copies are dead', () => {
    expect(center).toContain("} from '@/lib/security-feed';");
    expect(center).not.toContain('const ABUSE_EVENT_TYPES = [');
    expect(center).not.toMatch(/const EVENT_TYPE_LABELS/);
    expect(lib).toContain('export const ABUSE_EVENT_TYPES');
    expect(lib).toContain('export const EVENT_TYPE_LABELS');
  });

  it('the row contract grew severity and blocked \u2014 the wire always carried them', () => {
    expect(center).toContain('severity?: string | null;');
    expect(center).toContain('blocked?: boolean;');
  });

  it('the tone drives the row: the one-red-for-everything face is gone', () => {
    expect(center).toContain('const tone = securityRowTone(event.eventType, event.severity);');
    expect(center).toContain('className={`w-full p-3 rounded-lg border ${toneClasses.row}`}');
    // scoped to the events feed's own body — the NOTIFICATION rows keep
    // their severity faces elsewhere in the file (a different surface, a
    // different law) — the slice now ENDS at the next function boundary
    const feedBody = center.split('function SecurityEventsFeed')[1]?.split('export function NotificationCenter')[0] ?? '';
    expect(feedBody).not.toContain('bg-red-50 dark:bg-red-950/20');
  });

  it('a blocked event wears its badge; role and permission render as chips', () => {
    expect(center).toContain('{event.blocked && (');
    expect(center).toContain('{event.details?.role && (');
    expect(center).toContain('{event.details?.permission && (');
    expect(center).toContain('data-testid="security-event-row"');
  });

  it('the icon is furniture \u2014 aria-hidden, the text speaks', () => {
    expect(center).toContain('<ShieldAlert className={`h-4 w-4 ${toneClasses.icon}`} aria-hidden />');
  });
});
