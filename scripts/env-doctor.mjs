#!/usr/bin/env node
// ============================================================================
// MBUMAH HARDWARE POS - Environment doctor (AUDIT REMEDIATION v2.307.0)
// ============================================================================
// The audit's finding #2/#3: ".env alone did not reliably load", and a login
// 500 that turned out to be schema/client/provider drift between the scripts
// that load .env and the ones that did not. This doctor is the standing
// detector for that entire failure class. Run:
//
//     npm run env:doctor
//
// What it checks (grouped, human-readable):
//   ENVIRONMENT   .env presence, gitignore coverage, NODE_ENV
//   DATABASE      DATABASE_URL scheme, DIRECT_URL defaulting, provider
//                 consistency across THREE artifacts that must always agree:
//                   1. prisma/schema.prisma  (the source of truth on disk)
//                   2. node_modules/.prisma/client/schema.prisma (what the
//                      generated client was actually built from)
//                   3. the DATABASE_URL scheme (.env wins, env-WINS rule)
//                 A disagreement here is EXACTLY the drift that produced the
//                 audit's "URL must start with postgresql://" login 500s.
//   AUTH/SECRETS  NEXTAUTH_SECRET / JWT_SECRET presence; insecure defaults
//                 (placeholders like "generate-with-openssl-rand-base64-32")
//                 are a FAILURE outside development.
//   SEED POLICY   SEED_ADMIN_PASSWORD / SEED_ALLOW_DEMO_PASSWORD posture and
//                 the demo-credential risk outside development (finding #4).
//   INTEGRATIONS  optional M-Pesa / Resend / CRON_SECRET / Sentry settings -
//                 reported as informational only (finding: optional
//                 integrations must not crash the app when absent).
//
// Exit codes:
//   0 - no failures (warnings allowed)
//   1 - at least one REQUIRED failure (drift, bad scheme, insecure default
//       outside development). CI passes --ci: with no real database/env in
//       CI, a MISSING DATABASE_URL is reported but does not fail the run
//       (CI prepares its own hermetic SQLite test database).
// ============================================================================

import { existsSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const isCi = process.argv.includes('--ci');

const results = [];
function report(group, label, status, detail) {
  results.push({ group, label, status, detail });
  const icon = status === 'ok' ? '✓' : status === 'warn' ? '·' : '✗';
  console.error(`  ${icon} [${group}] ${label}${detail ? ` — ${detail}` : ''}`);
}

// -- env loading (same precedence rule as the runtime: .env WINS) ------------
const env = { ...process.env };
const envPath = join(root, '.env');
let envPresent = false;
if (existsSync(envPath)) {
  envPresent = true;
  try {
    for (const line of readFileSync(envPath, 'utf8').split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const m = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
      if (!m) continue;
      let value = m[2].trim();
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      env[m[1]] = value; // .env wins over inherited (matches prisma.config.ts)
    }
  } catch {
    report('ENVIRONMENT', '.env readable', 'fail', 'exists but could not be parsed');
  }
}

console.error('\n━━━ MBUMAH env:doctor ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

// -- ENVIRONMENT ------------------------------------------------------------
report('ENVIRONMENT', '.env file', envPresent ? 'ok' : 'warn',
  envPresent ? 'found at repo root' : 'not found (Docker/Vercel/CI inherit the environment instead)');

let envIgnored = false;
try {
  const check = execSync('git check-ignore -q .env && echo yes || echo no', { cwd: root, encoding: 'utf8' }).trim();
  envIgnored = check === 'yes';
} catch { /* git unavailable - treat as unchecked */ }
if (envPresent) {
  report('ENVIRONMENT', '.env gitignored', envIgnored ? 'ok' : 'fail',
    envIgnored ? 'never committed' : 'NOT covered by .gitignore - secrets could be committed');
}

const nodeEnv = env.NODE_ENV || 'development';
report('ENVIRONMENT', 'NODE_ENV', 'ok', nodeEnv);

// -- DATABASE ----------------------------------------------------------------
const databaseUrl = env.DATABASE_URL || '';
const scheme = databaseUrl.split(':')[0];

if (!databaseUrl) {
  report('DATABASE', 'DATABASE_URL', isCi ? 'warn' : 'fail',
    isCi ? 'not set - CI prepares its own hermetic SQLite test database' : 'missing — the app cannot start without it');
} else if (!['file', 'postgresql', 'postgres'].includes(scheme)) {
  report('DATABASE', 'DATABASE_URL scheme', 'fail', `unknown scheme "${scheme}:" (expected file: or postgresql://)`);
} else {
  report('DATABASE', 'DATABASE_URL scheme', 'ok', `${scheme}: ${scheme === 'file' ? '(SQLite local dev)' : '(PostgreSQL)'}`);
}

if (databaseUrl && !env.DIRECT_URL) {
  report('DATABASE', 'DIRECT_URL', 'ok', 'unset - defaults to DATABASE_URL (correct for SQLite and non-pooled Postgres)');
}

function providerOf(schemaText) {
  const m = schemaText.match(/datasource\s+db\s+\{[\s\S]*?provider\s*=\s*"(sqlite|postgresql)"/);
  return m ? m[1] : null;
}

const schemaPath = join(root, 'prisma', 'schema.prisma');
const generatedSchemaPath = join(root, 'node_modules', '.prisma', 'client', 'schema.prisma');
const schemaProvider = existsSync(schemaPath) ? providerOf(readFileSync(schemaPath, 'utf8')) : null;
const generatedProvider = existsSync(generatedSchemaPath)
  ? providerOf(readFileSync(generatedSchemaPath, 'utf8'))
  : null;
const envProvider = scheme === 'file' ? 'sqlite' : scheme === 'postgresql' || scheme === 'postgres' ? 'postgresql' : null;

report('DATABASE', 'schema.prisma provider', schemaProvider ? 'ok' : 'fail', schemaProvider ?? 'unreadable');
report('DATABASE', 'generated client provider', generatedProvider ? 'ok' : 'warn',
  generatedProvider ?? 'client not generated yet (run: npm run db:generate)');

if (databaseUrl && envProvider) {
  if (schemaProvider && generatedProvider) {
    const allAgree = schemaProvider === generatedProvider && generatedProvider === envProvider;
    report('DATABASE', 'provider consistency', allAgree ? 'ok' : 'fail',
      allAgree
        ? `schema = client = DATABASE_URL (${envProvider})`
        : `DRIFT: schema=${schemaProvider} client=${generatedProvider} DATABASE_URL=${envProvider} — run: npm run db:generate (this drift is the audit's login-500 root cause)`);
  }
} else if (!databaseUrl) {
  report('DATABASE', 'provider consistency', 'warn', 'skipped — no DATABASE_URL to compare against');
}

// -- AUTH / SECRETS ----------------------------------------------------------
const INSECURE_SECRET_PATTERNS = [
  /^generate-with-openssl/i,
  /^change-?me/i,
  /^changeme$/i,
  /^secret$/i,
  /^password$/i,
  /^test$/i,
  /^your-?secret/i,
  /^(.)\1{7,}$/, // repeated single character
];
function secretStatus(name, value) {
  if (!value) {
    // Required for runtime auth; local CLI work can proceed without it, so
    // this is a warning locally and the operator's own checklist item.
    report('SECRETS', name, 'warn', 'not set — auth flows will refuse to sign sessions until it is set');
    return;
  }
  const insecure = INSECURE_SECRET_PATTERNS.some((re) => re.test(value));
  report('SECRETS', name, insecure ? (nodeEnv === 'development' ? 'warn' : 'fail') : 'ok',
    insecure ? 'matches a well-known INSECURE placeholder — generate: openssl rand -base64 32' : 'set (value not printed)');
}
secretStatus('NEXTAUTH_SECRET', env.NEXTAUTH_SECRET);
secretStatus('JWT_SECRET', env.JWT_SECRET);

// -- SEED POLICY (audit finding #4) ------------------------------------------
if (env.SEED_ADMIN_PASSWORD) {
  report('SEED POLICY', 'SEED_ADMIN_PASSWORD', 'ok', 'set — seeds use this password (never printed by the doctor)');
} else if (nodeEnv === 'development' || nodeEnv === 'test') {
  report('SEED POLICY', 'seed password', 'ok', 'development — documented demo credentials apply (password123)');
} else if (env.SEED_ALLOW_DEMO_PASSWORD === '1' || env.SEED_ALLOW_DEMO_PASSWORD === 'true') {
  report('SEED POLICY', 'SEED_ALLOW_DEMO_PASSWORD', 'warn',
    'demo password opted into a NON-development environment — anyone who read this repo can log in');
} else {
  report('SEED POLICY', 'seed password', 'ok',
    'non-development without SEED_ADMIN_PASSWORD — the seed will generate a strong one-time password and print it once');
}

// -- OPTIONAL INTEGRATIONS (informational) ------------------------------------
const optional = [
  ['MPESA_CONSUMER_KEY', 'M-Pesa STK Push'],
  ['RESEND_API_KEY', 'email notifications'],
  ['CRON_SECRET', 'authenticated /api/cron ticks (production fail-closed)'],
  ['SENTRY_DSN', 'error monitoring'],
  ['ETIMS_API_URL', 'eTIMS/KRA integration'],
];
const missingOptional = optional.filter(([key]) => !env[key]);
report('INTEGRATIONS', 'optional integrations', 'ok',
  missingOptional.length === 0
    ? 'all optional integrations configured'
    : `not configured: ${missingOptional.map(([, label]) => label).join('; ')} — features degrade gracefully, the app does not crash`);

// -- verdict ------------------------------------------------------------------
const failures = results.filter((r) => r.status === 'fail');
const warnings = results.filter((r) => r.status === 'warn');
console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.error(
  `env:doctor: ${results.length} checks — ${results.length - failures.length - warnings.length} ok, ` +
  `${warnings.length} warning(s), ${failures.length} failure(s)\n`
);
process.exit(failures.length > 0 ? 1 : 0);
