// v2.213.0 — the security posture speaks.
//
//   - THE SECRET LAW: the posture wire carries booleans and counts ONLY.
//     The VALUE of CRON_SECRET / JWT_SECRET / NEXTAUTH_SECRET never leaves
//     the server — presence via Boolean(), never interpolation.
//   - THE DOOR LAW: the route answers SUPER_ADMIN only (same gate class as
//     the Exchange Rates card's writes); the client section renders for
//     that role alone and the query stays disabled for every other eye.
//   - THE COUNT-AS-TRUTH LAW (SEC-01): legacyHashAccounts IS the number of
//     people the fail-closed verifier locks out — the card speaks the fix
//     by its own command name, dry-run first.
//   - THE HONEST POSTURE LAW (SEC-02): unset-in-production speaks red AND
//     says the 403 wall is fail-closed BY DESIGN, not an outage.
//   - THE PINNED COUNT LAW: GATED_CRON_ROUTES must equal the actual
//     number of route directories under src/app/api/cron — the day a
//     twelfth route lands, the mismatch is a visible red test.
//
// Every pin reads the SOURCE OF RECORD (source bytes, not memory) — the
// house rule since the verify scripts were born.

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it, expect } from 'vitest';

const read = (p: string) => readFileSync(join(process.cwd(), p), 'utf8');

const ROUTE_PATH = 'src/app/api/admin/security-posture/route.ts';
const SECTION_PATH = 'src/components/admin/security-posture-section.tsx';
const TAB_PATH = 'src/app/(shell)/tabs/admin-tab.tsx';

const route = read(ROUTE_PATH);
const section = read(SECTION_PATH);
const tab = read(TAB_PATH);

// ── THE ROUTE ───────────────────────────────────────────────────────────────

describe('the posture route (v2.213.0)', () => {
  it('is born behind the SUPER_ADMIN gate', () => {
    expect(route).toMatch(/roles: \['SUPER_ADMIN'\]/);
  });

  it('rides the tenant escape hatch like every admin read', () => {
    expect(route).toMatch(/runWithoutTenant/);
  });

  it('counts the legacy-hash accounts with the retired prefix', () => {
    expect(route).toMatch(/passwordHash: \{ startsWith: 'hashed_' \}/);
  });

  it('counts total accounts alongside the locked-out count', () => {
    expect(route).toMatch(/db\.user\.count\(\)/);
  });

  it('speaks the 11-route constant with its birth comment', () => {
    expect(route).toMatch(/export const GATED_CRON_ROUTES = 12;/); // v2.312.0: +1 for loyalty-expiry
    expect(route).toMatch(/session-reaper/);
  });

  it('carries presence booleans only — never a secret value', () => {
    expect(route).toMatch(/Boolean\(process\.env\.CRON_SECRET\)/);
    expect(route).toMatch(/Boolean\(process\.env\.JWT_SECRET\)/);
    expect(route).toMatch(/Boolean\(process\.env\.NEXTAUTH_SECRET\)/);
    // The interpolation ban: no `${process.env.<SECRET>}` may exist anywhere.
    expect(route).not.toMatch(/\$\{process\.env\.(CRON_SECRET|JWT_SECRET|NEXTAUTH_SECRET)/);
    // And no direct value assignment of any secret into the body.
    expect(route).not.toMatch(/:\s*process\.env\.(CRON_SECRET|JWT_SECRET|NEXTAUTH_SECRET)[^?]/);
  });

  it('gates env diagnostics to production in the wire itself', () => {
    expect(route).toMatch(/envDiagnosticsGated: \(process\.env\.NODE_ENV \?\? ''\) === 'production'/);
  });
});

// ── THE PINNED COUNT LAW ────────────────────────────────────────────────────

describe('GATED_CRON_ROUTES matches reality', () => {
  const cronDir = join(process.cwd(), 'src/app/api/cron');
  const dirs = readdirSync(cronDir).filter((e) => statSync(join(cronDir, e)).isDirectory());

  it(`has exactly 12 cron route directories (found: ${dirs.length})`, () => {
    expect(dirs.length).toBe(12);
  });

  it('the route file pins the same number', () => {
    expect(route).toMatch(new RegExp(`GATED_CRON_ROUTES = ${dirs.length};`));
  });
});

// ── THE SECTION ─────────────────────────────────────────────────────────────

describe('the security posture section', () => {
  it('exports the one query key for the test suite', () => {
    expect(section).toMatch(/export const SECURITY_POSTURE_QUERY_KEY = \['admin-security-posture'\] as const;/);
  });

  it('renders for SUPER_ADMIN only — null for every other eye', () => {
    expect(section).toMatch(/const isSuperAdmin = useAuthStore\(\(s\) => s\.user\?\.role\) === 'SUPER_ADMIN';/);
    expect(section).toMatch(/if \(!isSuperAdmin\) return null;/);
  });

  it('keeps the wire lazy and role-gated (enabled: isSuperAdmin)', () => {
    expect(section).toMatch(/enabled: isSuperAdmin,/);
    expect(section).toMatch(/refetchInterval: false,/);
  });

  it('the card owns its dark half from birth', () => {
    expect(section).toMatch(/dark:bg-slate-900/);
    expect(section).toMatch(/dark:border-slate-800/);
  });

  it('speaks every posture row through its own testid', () => {
    for (const id of [
      'security-posture-section',
      'security-posture-header',
      'security-posture-meta',
      'security-posture-legacy-row',
      'security-posture-legacy-chip',
      'security-posture-legacy-detail',
      'security-posture-cron-row',
      'security-posture-cron-chip',
      'security-posture-cron-detail',
      'security-posture-env-row',
      'security-posture-env-chip',
      'security-posture-secrets-row',
      'security-posture-secrets-chip',
      'security-posture-footer',
      'security-posture-refresh',
      'security-posture-loading',
      'security-posture-error',
    ]) {
      expect(section).toContain(`"${id}"`);
    }
  });

  it('the SEC-01 voice speaks the fix by its own command name', () => {
    expect(section).toMatch(/scripts\/migrate-legacy-passwords\.mjs --apply/);
    expect(section).toMatch(/dry-run first/);
  });

  it('the SEC-02 voice says fail-closed is the law, not an outage', () => {
    expect(section).toMatch(/That is the fail-closed law, not an outage/);
    expect(section).toMatch(/answer 403/);
  });

  it('the SEC-03 voice speaks the production gate', () => {
    expect(section).toMatch(/answers only to SUPER_ADMIN in production/);
  });

  it('the footer says the secret law out loud', () => {
    expect(section).toMatch(/booleans and counts only — the payload carries no secret material\./i);
  });

  it('the error state claims nothing rather than guess', () => {
    expect(section).toMatch(/the card claims nothing rather than guess/);
  });

  it('chip palettes carry dark variants from birth (the contrast law)', () => {
    // emerald calm / red locked-out-and-fail-closed / amber dev-unset —
    // every light voice rides with its dark twin on the same literal.
    expect(section).toMatch(/bg-emerald-100 text-emerald-700 dark:bg-emerald-950\/60 dark:text-emerald-400/);
    expect(section).toMatch(/bg-red-100 text-red-700 dark:bg-red-950\/60 dark:text-red-400/);
    expect(section).toMatch(/bg-amber-100 text-amber-700 dark:bg-amber-950\/60 dark:text-amber-400/);
  });
});

// ── THE MOUNT ───────────────────────────────────────────────────────────────

describe('the admin desk mount', () => {
  it('imports the section on the admin tab', () => {
    expect(tab).toMatch(/import \{ SecurityPostureSection \} from '@\/components\/admin\/security-posture-section';/);
  });

  it('mounts it AFTER the Exchange Rates card (the SEC program follows the wire)', () => {
    const rates = tab.indexOf('<CurrencyRatesSection />');
    const posture = tab.indexOf('<SecurityPostureSection />');
    expect(rates).toBeGreaterThan(-1);
    expect(posture).toBeGreaterThan(rates);
  });
});
