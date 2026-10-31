#!/usr/bin/env node
// MBUMAH HARDWARE POS - Release verification gate for v2.307.0 (audit remediation)
//
// Pins the audit-remediation release face: the runner-agnostic seed, the
// provider-consistency root-cause fix, the seeded-credential policy, the
// health probe, the env doctor, the CI concurrency job, the archive, and the
// release-face version slots. Pure file/regex assertions - no database, no
// network, deterministic. Run: npm run verify:v2-307-0

import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
let pass = 0;
let fail = 0;
const failures = [];

function check(label, fn) {
  try {
    const ok = fn();
    if (ok === true || ok === undefined) {
      pass++;
      console.log(`[ok] ${label}`);
    } else {
      fail++;
      failures.push(label);
      console.error(`[FAIL] ${label}${typeof ok === 'string' ? ` — ${ok}` : ''}`);
    }
  } catch (err) {
    fail++;
    failures.push(label);
    console.error(`[FAIL] ${label} — ${err instanceof Error ? err.message : err}`);
  }
}

const read = (p) => readFileSync(join(root, p), 'utf8');
const has = (p) => existsSync(join(root, p));

const pkg = JSON.parse(read('package.json'));

// ── Release face ────────────────────────────────────────────────────────────
check('package.json version is 2.307.0', () => pkg.version === '2.307.0');
check('package.json releaseVersion is 2.307.0', () => pkg.mbumah?.releaseVersion === '2.307.0');
check('package.json baseVersion is 2.307.0', () => pkg.mbumah?.baseVersion === '2.307.0');
check('VERSION is 2.307.0', () => read('VERSION').trim() === '2.307.0');
check('CHANGELOG heads [2.307.0]', () => read('CHANGELOG.md').includes('## [2.307.0]'));
check('whats-new head is 2.307.0', () => read('src/lib/whats-new.ts').includes("version: '2.307.0',"));
check('this gate is wired (verify:v2-307-0)', () => pkg.scripts['verify:v2-307-0'] === 'node scripts/verify-v2-307-0.mjs');

// ── Finding #1: runner-agnostic seed ────────────────────────────────────────
check('prisma.config.ts seeds via run-seed.mjs', () => {
  const c = read('prisma.config.ts');
  return c.includes('scripts", "run-seed.mjs') && !/\n\s*seed:\s*`bun /.test(c);
});
check('scripts/run-seed.mjs exists', () => has('scripts/run-seed.mjs'));
check('run-seed prefers bun then tsx', () => {
  const c = read('scripts/run-seed.mjs');
  return c.includes("spawnSync('bun'") && c.includes('--import') && c.includes('tsx');
});
check('tsx is a devDependency', () => Boolean(pkg.devDependencies?.tsx));
check('audit:financial is runner-agnostic', () => (pkg.scripts['audit:financial'] || '').includes('tsx'));
check('health one-liner does not require bun', () => !(pkg.scripts.health || '').includes('| bun'));

// ── Findings #2/#3: provider consistency root cause ─────────────────────────
check('setup-prisma-provider.mjs loads <repo>/.env', () => {
  const c = read('scripts/setup-prisma-provider.mjs');
  return c.includes("join(repoRoot, '.env')") && c.includes('.env wins over the inherited environment');
});
check('setup-prisma-provider.mjs resolves schema from its own location', () =>
  read('scripts/setup-prisma-provider.mjs').includes("join(repoRoot, 'prisma', 'schema.prisma')"));
check('prisma.config.ts documents PRISMA_CONFIG_DATABASE_URL override', () =>
  read('prisma.config.ts').includes('PRISMA_CONFIG_DATABASE_URL'));
check('prepare-test-db.mjs uses the override channel', () =>
  read('scripts/prepare-test-db.mjs').includes('PRISMA_CONFIG_DATABASE_URL'));

// ── env:doctor ──────────────────────────────────────────────────────────────
check('env-doctor.mjs exists and is wired', () =>
  has('scripts/env-doctor.mjs') && pkg.scripts['env:doctor'] === 'node scripts/env-doctor.mjs');
check('doctor checks provider consistency', () =>
  read('scripts/env-doctor.mjs').includes('provider consistency'));
check('doctor checks insecure placeholder secrets', () =>
  read('scripts/env-doctor.mjs').includes('generate-with-openssl'));
check('CI runs env:doctor --ci', () => read('.github/workflows/ci-cd.yml').includes('node scripts/env-doctor.mjs --ci'));

// ── Findings #4/#5: seeded-credential policy ────────────────────────────────
check('src/lib/demo-password.ts exists (shared policy)', () => has('src/lib/demo-password.ts'));
check('demo-password exports the policy surface', () => {
  const c = read('src/lib/demo-password.ts');
  return c.includes('export const DEMO_PASSWORD') && c.includes('export function resolveSeedPassword') && c.includes('generateStrongPassword');
});
check('seed.ts consumes the policy (no hardcoded password123 hash)', () => {
  const c = read('prisma/seed.ts');
  return c.includes('resolveSeedPassword') && !c.includes("bcrypt.hash('password123'") && c.includes('SEED_PASSWORD');
});
check('seed prints the one-time banner only for generated passwords', () => {
  const c = read('prisma/seed.ts');
  return c.includes("source === 'generated'") && c.includes('ONE-TIME SEED PASSWORD');
});
check('health endpoint carries the demo_credentials probe', () => {
  const c = read('src/app/api/health/route.ts');
  return c.includes('demo_credentials') && c.includes('DEMO_PASSWORD') && c.includes('bcrypt.compare');
});
check('.env.example documents SEED_ADMIN_PASSWORD + SQLite path', () => {
  const c = read('.env.example');
  return c.includes('SEED_ADMIN_PASSWORD') && c.includes('SEED_ALLOW_DEMO_PASSWORD') && c.includes('file:./pos.db');
});
check('README documents env:doctor + the credential policy', () => {
  const c = read('README.md');
  return c.includes('npm run env:doctor') && c.includes('SEED_ADMIN_PASSWORD');
});
check('docs/TROUBLESHOOTING.md exists and covers provider drift', () =>
  has('docs/TROUBLESHOOTING.md') && read('docs/TROUBLESHOOTING.md').includes('provider drift'));

// ── Receipt-number suffix contract ──────────────────────────────────────────
check('secureSuffix uses the documented 36^5 space', () =>
  read('src/lib/helpers.ts').includes('36n ** 5n'));

// ── Production error sanitization intact ────────────────────────────────────
check('withErrorBoundary gates detail behind EXPOSE_ERRORS/dev', () =>
  read('src/lib/logger.ts').includes("process.env.EXPOSE_ERRORS === 'true'"));

// ── Tests ───────────────────────────────────────────────────────────────────
const newTests = [
  'src/tests/lib/checkout-integrity-audit.test.ts',
  'src/tests/lib/concurrency-postgres-audit.test.ts',
  'src/tests/lib/error-sanitization-audit.test.ts',
  'src/tests/lib/seed-password-policy.test.ts',
];
check('the four audit test files exist', () => newTests.every(has));
check('PG concurrency tests are gated on TEST_PG_URL', () =>
  read('src/tests/lib/concurrency-postgres-audit.test.ts').includes('TEST_PG_URL'));

// ── CI concurrency job ──────────────────────────────────────────────────────
check('CI has the PostgreSQL concurrency job', () => {
  const c = read('.github/workflows/ci-cd.yml');
  return c.includes('concurrency-postgres:') && c.includes('postgres:16') && c.includes('TEST_PG_URL');
});

// ── Archive (PHASE 11) ──────────────────────────────────────────────────────
check('scripts/archive/release-history/README.md exists', () =>
  has('scripts/archive/release-history/README.md'));
check('the archive holds the moved one-offs (>=70)', () => {
  const n = readdirSync(join(root, 'scripts', 'archive', 'release-history')).filter((f) => !f.startsWith('README')).length;
  return n >= 70 ? true : `only ${n} archived`;
});
check('gitignore covers the hermetic test database', () =>
  read('.gitignore').includes('prisma/prisma/*.db'));
check('no committed *.db artifact remains tracked', () => {
  const tracked = execSync('git ls-files', { cwd: root, encoding: 'utf8' });
  const offender = tracked.split('\n').find((l) => /\.(db|sqlite|sqlite3)$/.test(l));
  return offender ? `tracked database artifact: ${offender}` : true;
});

// ── Verdict ─────────────────────────────────────────────────────────────────
console.log(`\nverify:v2-307-0 — ${pass} passed, ${fail} failed`);
if (fail > 0) {
  console.error('Failures:\n - ' + failures.join('\n - '));
  process.exit(1);
}
