#!/usr/bin/env node
/**
 * fresh-recycle.mjs — THE FRESH-RECYCLE PLAYBOOK, AS A SCRIPT (v2.369.0).
 *
 * The QA world has been rebuilt by hand after every sandbox recycle —
 * the strongest structural debt the handover ledger carried for six
 * generations (each rebuild re-learning the same laws the hard way).
 * This script IS the playbook, codified: run it after a recycle (or to
 * stand up a second clone) and every law executes in its right order.
 *
 *   node scripts/fresh-recycle.mjs <clone-url> <target-dir>
 *
 * The core steps (all carried laws, in order):
 *   1. CLONE at the remote's default branch (the caller passes the URL —
 *      credentials stay OUT of this script and out of argv logs).
 *   2. THE .ENV — db/audit-dev.db file: URL + generated NEXTAUTH_SECRET /
 *      JWT_SECRET (the dev server's own db; sqlite parent dirs are
 *      CREATED — SQLite's file: URL does not mkdir).
 *   3. `npm install` with DATABASE_URL REMOVED from the environment
 *      (the inherited-env redirect law: the bash session may export a
 *      foreign DATABASE_URL; the install must not read it).
 *   4. THE SQLITE FLIP via scripts/setup-prisma-provider.mjs, verified
 *      by reading the schema back (never trusted from stdout alone).
 *   5. `prisma generate` (the client must exist before ANY db touch).
 *   6. THE DEV DB: `prisma db push` + `db:seed` with NODE_ENV=development
 *      (the seed-password law: the seeder's 12-round bcryptjs path is
 *      the development face).
 *   7. THE HOUSE DB (the BOTH-DBS law): the QA world is TWO dbs — the
 *      dev server's db/audit-dev.db AND the test world's
 *      prisma/prisma/dev.db (per src/tests/setup.ts). The house db is
 *      rebuilt through the .env-swap (the .env-swap law: the prisma
 *      CLI's process-env override LOSES to .env, so the swap is the
 *      reliable form), then the dev .env is restored byte-identical.
 *   8. THE CREDENTIAL PROBE: a bare-node read of the dev db proving the
 *      SUPER_ADMIN exists (the seeded credential pair's law: the probe
 *      runs with the EXPLICIT dev DATABASE_URL, never the inherited one).
 *
 * The agent-side steps that stay OUT of this script (they need a browser
 * or the sandbox's own lineage, not the repo): the ref-login (fill the
 * sign-in face by a11y snapshot refs, never by #id), the whats-new modal
 * dismissal before any chip assertion, the session-expiry probe, and the
 * :3000 guard's dev-mode relaunch law. Those live in the handover.
 *
 * Exit 0 = the QA world is whole. Any step that fails aborts non-zero.
 */
import { execSync, spawnSync } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync, existsSync, rmSync } from 'node:fs';
import { join, resolve } from 'node:path';

const [cloneUrl, targetDir] = process.argv.slice(2);
if (!cloneUrl || !targetDir) {
  console.error('usage: node scripts/fresh-recycle.mjs <clone-url> <target-dir>');
  process.exit(1);
}
const target = resolve(targetDir);
const run = (cmd, opts = {}) => {
  console.log(`  $ ${cmd}`);
  execSync(cmd, { stdio: 'inherit', ...opts });
};

if (existsSync(join(target, '.git'))) {
  console.error(`refusing: ${target} already holds a clone`);
  process.exit(1);
}

console.log('== 1. clone ==');
run(`git clone --quiet "${cloneUrl}" "${target}"`);

console.log('== 2. .env (the dev db + generated secrets) ==');
mkdirSync(join(target, 'db'), { recursive: true });
const envLines = [
  `DATABASE_URL="file:${join(target, 'db', 'audit-dev.db')}"`,
  `NEXTAUTH_SECRET="${randomBytes(32).toString('hex')}"`,
  `JWT_SECRET="${randomBytes(32).toString('hex')}"`,
];
writeFileSync(join(target, '.env'), envLines.join('\n') + '\n');

console.log('== 3. npm install (DATABASE_URL removed from the env) ==');
run('env -u DATABASE_URL npm install --no-audit --no-fund', { cwd: target });

console.log('== 4. the sqlite flip, verified from the schema bytes ==');
run('node scripts/setup-prisma-provider.mjs', { cwd: target });
const schema = readFileSync(join(target, 'prisma', 'schema.prisma'), 'utf8');
if (!/provider\s*=\s*"sqlite"/.test(schema)) {
  console.error('FLIP FAILED: the schema does not speak sqlite');
  process.exit(1);
}
console.log('  flip verified: provider = "sqlite"');

console.log('== 5. prisma generate ==');
run('npx prisma generate', { cwd: target });

const seed = (envUrl) => {
  run('npx prisma db push --skip-generate', { cwd: target });
  run('NODE_ENV=development npm run db:seed', {
    cwd: target,
    env: { ...process.env, DATABASE_URL: envUrl, NODE_ENV: 'development' },
  });
};

console.log('== 6. the dev db: push + seed ==');
const devUrl = `file:${join(target, 'db', 'audit-dev.db')}`;
seed(devUrl);

console.log('== 7. the house db (the BOTH-DBS law): the .env-swap form ==');
mkdirSync(join(target, 'prisma', 'prisma'), { recursive: true });
const houseUrl = `file:${join(target, 'prisma', 'prisma', 'dev.db')}`;
const devEnvBytes = readFileSync(join(target, '.env'), 'utf8');
const houseEnv = devEnvBytes.replace(
  /^DATABASE_URL=.*$/m,
  `DATABASE_URL="${houseUrl}"`,
);
writeFileSync(join(target, '.env'), houseEnv);
try {
  seed(houseUrl);
} finally {
  writeFileSync(join(target, '.env'), devEnvBytes); // restored byte-identical
}
console.log('  house db rebuilt; the dev .env restored');

console.log('== 8. the credential probe (bare-node, the EXPLICIT dev URL) ==');
const probe = spawnSync(
  process.execPath,
  [
    '-e',
    `const {PrismaClient} = require('@prisma/client');
const p = new PrismaClient();
p.user.findFirst({where:{role:'SUPER_ADMIN'}}).then(u=>{
  if(!u){console.error('PROBE FAIL: no SUPER_ADMIN');process.exit(1);}
  console.log('PROBE OK: SUPER_ADMIN present:', u.email);
  return p.$disconnect();
}).catch(e=>{console.error('PROBE ERR', e.message);process.exit(1);});`,
  ],
  { cwd: target, env: { ...process.env, DATABASE_URL: devUrl }, encoding: 'utf8' },
);
if (probe.status !== 0) {
  process.stdout.write(probe.stdout || '');
  process.stderr.write(probe.stderr || '');
  console.error('CREDENTIAL PROBE FAILED — the QA world is NOT whole');
  process.exit(1);
}
process.stdout.write(probe.stdout || '');

console.log('== RECYCLE COMPLETE — the QA world is whole ==');
