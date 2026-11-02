// AUDIT REMEDIATION (v2.307.0) - seeded-credential policy regression tests.
//
// Pins the audit's PHASE 5 asks:
//   • the demo password default exists ONLY in development/test
//   • SEED_ADMIN_PASSWORD wins everywhere
//   • SEED_ALLOW_DEMO_PASSWORD=1 is an explicit, warned opt-in outside dev
//   • otherwise a STRONG random password is generated (24-char URL-safe)
//   • the generated password is never a well-known value
//
// The policy lives in src/lib/demo-password.ts (shared by prisma/seed.ts,
// the health endpoint and the env doctor) so the seed and the detectors can
// never disagree about what the demo password is.

import { describe, it, expect } from 'vitest';
import {
  DEMO_PASSWORD,
  resolveSeedPassword,
  generateStrongPassword,
  isDevLikeEnv,
} from '@/lib/demo-password';

describe('audit v2.307.0 - seed password policy (resolveSeedPassword)', () => {
  it('SEED_ADMIN_PASSWORD wins in every environment', () => {
    for (const nodeEnv of ['development', 'test', 'production', undefined]) {
      const result = resolveSeedPassword({ NODE_ENV: nodeEnv, SEED_ADMIN_PASSWORD: 'operator-chosen-strong-pw' });
      expect(result.password).toBe('operator-chosen-strong-pw');
      expect(result.source).toBe('env');
      expect(result.password).not.toContain(DEMO_PASSWORD);
    }
  });

  it('development defaults to the documented demo password (README logins keep working)', () => {
    const result = resolveSeedPassword({ NODE_ENV: 'development' });
    expect(result.password).toBe(DEMO_PASSWORD);
    expect(result.source).toBe('demo-default');
  });

  it('test environment also gets the demo default (CI hermetic world)', () => {
    const result = resolveSeedPassword({ NODE_ENV: 'test' });
    expect(result.password).toBe(DEMO_PASSWORD);
    expect(result.source).toBe('demo-default');
  });

  it('production WITHOUT SEED_ADMIN_PASSWORD never receives the demo password', () => {
    const result = resolveSeedPassword({ NODE_ENV: 'production' });
    expect(result.password).not.toBe(DEMO_PASSWORD);
    expect(result.source).toBe('generated');
    expect(result.warning).toBeTruthy();
  });

  it('staging-like environments (NODE_ENV unset) also refuse the demo default', () => {
    const result = resolveSeedPassword({});
    expect(result.password).not.toBe(DEMO_PASSWORD);
    expect(result.source).toBe('generated');
  });

  it('SEED_ALLOW_DEMO_PASSWORD=1 is an explicit non-dev opt-in that carries a warning', () => {
    const result = resolveSeedPassword({ NODE_ENV: 'production', SEED_ALLOW_DEMO_PASSWORD: '1' });
    expect(result.password).toBe(DEMO_PASSWORD);
    expect(result.source).toBe('demo-allowed');
    expect(result.warning).toMatch(/NON-development/i);
  });

  it('SEED_ALLOW_DEMO_PASSWORD only honors explicit truthy values', () => {
    const result = resolveSeedPassword({ NODE_ENV: 'production', SEED_ALLOW_DEMO_PASSWORD: '0' });
    expect(result.source).toBe('generated');
    const result2 = resolveSeedPassword({ NODE_ENV: 'production', SEED_ALLOW_DEMO_PASSWORD: 'false' });
    expect(result2.source).toBe('generated');
  });

  it('an env-provided value equal to the demo password is flagged', () => {
    const result = resolveSeedPassword({ NODE_ENV: 'production', SEED_ADMIN_PASSWORD: DEMO_PASSWORD });
    expect(result.source).toBe('env');
    expect(result.warning).toMatch(/well-known demo password/i);
  });

  it('an env-provided value is trimmed', () => {
    const result = resolveSeedPassword({ NODE_ENV: 'production', SEED_ADMIN_PASSWORD: '  spaced-pw  ' });
    expect(result.password).toBe('spaced-pw');
  });
});

describe('audit v2.307.0 - generated seed passwords are strong', () => {
  it('24-char URL-safe output with high entropy', () => {
    const pw = generateStrongPassword();
    expect(pw).toHaveLength(24);
    expect(pw).toMatch(/^[A-Za-z0-9_-]+$/);
  });

  it('never repeats across 10,000 generations', () => {
    const seen = new Set<string>();
    for (let i = 0; i < 10_000; i++) seen.add(generateStrongPassword());
    expect(seen.size).toBe(10_000);
  });

  it('never equals the demo password or a placeholder', () => {
    for (let i = 0; i < 100; i++) {
      const pw = generateStrongPassword();
      expect(pw).not.toBe(DEMO_PASSWORD);
      expect(pw.toLowerCase()).not.toContain('password');
    }
  });
});

describe('audit v2.307.0 - dev-like environment classification', () => {
  it('development and test are dev-like; everything else is not', () => {
    expect(isDevLikeEnv('development')).toBe(true);
    expect(isDevLikeEnv('test')).toBe(true);
    expect(isDevLikeEnv('production')).toBe(false);
    expect(isDevLikeEnv('staging')).toBe(false);
    expect(isDevLikeEnv(undefined)).toBe(false);
  });
});
