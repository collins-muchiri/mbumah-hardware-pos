#!/usr/bin/env node
// MBUMAH HARDWARE POS - Runner-agnostic seed launcher (AUDIT REMEDIATION v2.307.0)
//
// AUDIT FINDING #1: `npm run db:seed` failed on npm-based installs with
//   Error: Command failed with ENOENT: bun /path/to/prisma/seed.ts
// because prisma.config.ts hardcoded `bun` as the seed command ("bun is
// present on every path that seeds"). That assumption broke plain npm
// workflows - the documented local setup in README - with an opaque ENOENT.
//
// THIS SCRIPT is the fix: prisma.config.ts now delegates the seed to
// `node scripts/run-seed.mjs`, which picks the best available TypeScript
// runner at runtime:
//
//   1. bun      - preferred when present (the historical runner; fastest,
//                 already installed on installer/Docker paths)
//   2. tsx      - the cross-platform fallback (a devDependency; resolved
//                 from the repo's own node_modules and run via
//                 `node --import tsx`), so npm-only installs seed without bun
//   3. neither  - exit 1 with a human-readable remediation message
//                 (install the repo's devDependencies, or install bun)
//
// Bun stays fully supported - it is simply no longer MANDATORY. `node` is
// guaranteed: the repo's own postinstall (`node scripts/...`) already
// requires it, so no new hard dependency is introduced.
//
// Precedence note: the child runner inherits this process's environment.
// The seed itself resolves DATABASE_URL through prisma/seed.ts → PrismaClient
// → the CLI's env loading (prisma.config.ts loads <repo>/.env with .env-WINS
// precedence), so the .env file keeps winning over a stray inherited
// DATABASE_URL exactly as before.

import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const seedPath = join(repoRoot, 'prisma', 'seed.ts');

if (!existsSync(seedPath)) {
  console.error('[run-seed] ✗ prisma/seed.ts not found at', seedPath);
  process.exit(1);
}

function bunAvailable() {
  const probe = spawnSync('bun', ['--version'], { encoding: 'utf8' });
  return probe.status === 0;
}

function tsxEntryPath() {
  // Resolve tsx from the REPO's node_modules (never a global/parent
  // resolution that could pick a different major). createRequire with an
  // anchor inside the repo keeps the lookup inside the install tree.
  try {
    const require = createRequire(join(repoRoot, 'package.json'));
    return require.resolve('tsx');
  } catch {
    return null;
  }
}

let child;
if (bunAvailable()) {
  // Historical path - bun runs TypeScript natively.
  console.log('[run-seed] runner: bun');
  child = spawnSync('bun', [seedPath], { stdio: 'inherit', cwd: repoRoot });
} else {
  const tsxEntry = tsxEntryPath();
  if (!tsxEntry) {
    console.error(
      '[run-seed] ✗ No TypeScript runner available for the seed.\n' +
        '    Fix A (recommended): install the repo devDependencies → `npm install`\n' +
        '    Fix B: install bun → https://bun.sh\n' +
        '  Then re-run the seed command.'
    );
    process.exit(1);
  }
  // Cross-platform path - tsx v4 registers its loader via node --import
  // (node >= 18.19). Resolving tsx by absolute entry path keeps the child
  // pinned to the repo's own devDependency.
  console.log('[run-seed] runner: node --import tsx');
  child = spawnSync(process.execPath, ['--import', tsxEntry, seedPath], {
    stdio: 'inherit',
    cwd: repoRoot,
  });
}

process.exit(child.status ?? 1);
