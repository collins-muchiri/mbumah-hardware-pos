// MBUMAH HARDWARE POS - Seeded-credential policy (AUDIT REMEDIATION v2.307.0)
//
// AUDIT FINDING #4: the seed hardcoded `password123` for the Super Admin and
// every demo account in ALL environments, so a staging/production first boot
// silently created an admin account whose password was known to anyone who
// had ever read the README.
//
// POLICY (documented in README + .env.example + docs/TROUBLESHOOTING.md):
//   1. SEED_ADMIN_PASSWORD always wins - explicit operator intent, any env.
//   2. Development / test environments default to the demo password
//      (`password123`) so the documented local demo logins keep working.
//   3. Any other environment:
//        • SEED_ALLOW_DEMO_PASSWORD=1 opts in EXPLICITLY (demo/staging boxes
//          that must match the README) - allowed, but the caller is expected
//          to surface the warning.
//        • otherwise a strong random password is generated; the seed prints
//          it ONCE to its own setup output. It is never logged again, never
//          written to the database in plaintext, and never appears in CI.
//
// This module is intentionally dependency-light (bcryptjs + node builtins
// only, no `@/` imports) so BOTH the Prisma seed (run through tsx/bun from
// prisma/seed.ts) and the Next.js runtime (health endpoint, env doctor) can
// share the exact same policy without bundler-specific path resolution.

import { randomBytes } from 'node:crypto';

/**
 * The canonical demo password. Public so the health endpoint and the env
 * doctor can DETECT it - detection does not weaken the policy; hardcoding
 * it here is what makes the risk checkable.
 */
export const DEMO_PASSWORD = 'password123';

export type SeedPasswordSource =
  | 'env'            // SEED_ADMIN_PASSWORD provided
  | 'demo-default'   // dev/test environment - documented demo default
  | 'demo-allowed'   // non-dev, but SEED_ALLOW_DEMO_PASSWORD=1 opted in
  | 'generated';     // strong random password (print once)

export interface SeedPasswordResult {
  password: string;
  source: SeedPasswordSource;
  /**
   * Human-readable warning for the caller to surface. Present for
   * `demo-allowed` (weak password in a non-dev environment) and `generated`
   * (the operator MUST capture the one-time password from setup output).
   */
  warning?: string;
}

/** Development-like contexts where the demo default is SAFE by policy. */
export function isDevLikeEnv(nodeEnv: string | undefined): boolean {
  return nodeEnv === 'development' || nodeEnv === 'test';
}

/**
 * 24-char URL-safe random password (144 bits of entropy). Never contains
 * characters that need shell/JSON escaping.
 */
export function generateStrongPassword(): string {
  return randomBytes(18).toString('base64url');
}

/**
 * Resolve the password the seed will give every account it creates.
 * Pure given its inputs (defaults to process.env) - unit-tested in
 * src/tests/lib/seed-password-policy.test.ts.
 */
export function resolveSeedPassword(
  env: Record<string, string | undefined> = process.env,
): SeedPasswordResult {
  const explicit = env.SEED_ADMIN_PASSWORD?.trim();
  if (explicit) {
    return {
      password: explicit,
      source: 'env',
      warning:
        explicit === DEMO_PASSWORD
          ? 'SEED_ADMIN_PASSWORD is set to the well-known demo password. Choose a strong value for anything reachable by real users.'
          : undefined,
    };
  }

  if (isDevLikeEnv(env.NODE_ENV)) {
    return { password: DEMO_PASSWORD, source: 'demo-default' };
  }

  const allowDemo =
    env.SEED_ALLOW_DEMO_PASSWORD === '1' || env.SEED_ALLOW_DEMO_PASSWORD === 'true';
  if (allowDemo) {
    return {
      password: DEMO_PASSWORD,
      source: 'demo-allowed',
      warning:
        'Weak demo password seeded into a NON-development environment because SEED_ALLOW_DEMO_PASSWORD=1. ' +
        'Anyone who has read this repository can log in. Rotate with SEED_ADMIN_PASSWORD before real use.',
    };
  }

  return {
    password: generateStrongPassword(),
    source: 'generated',
    warning:
      'No SEED_ADMIN_PASSWORD set outside development: a strong one-time password was generated and printed ' +
      'in this seed output. Capture it NOW - it is not shown again. (Set SEED_ADMIN_PASSWORD to choose your own.)',
  };
}
