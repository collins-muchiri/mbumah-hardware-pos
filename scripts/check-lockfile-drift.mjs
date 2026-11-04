#!/usr/bin/env node
// Lockfile parity guard (v2.37.0 chore).
//
// Repo policy: bun is the package manager of record — bun.lock is COMMITTED
// and package-lock.json is deliberately gitignored (.gitignore) as a local
// artifact, because committing it would flip Vercel's package-manager
// auto-detection away from bun.
//
// Therefore this guard enforces two things:
//   1. ALWAYS: every package.json dependency/devDependency appears in
//      bun.lock (the lockfile CI actually installs with).
//   2. WHEN package-lock.json exists in the tree (local dev): every package
//      appears in BOTH files, so an `npm ci` on a fresh clone after a
//      deliberate un-ignore still resolves the same tree. A missing entry
//      locally means the npm lockfile is stale — regenerate it.
//
// The historical failure mode this guards: a dependency added or bumped with
// only one lockfile regenerated, so bun CI and npm locals resolve different
// dependency sets (has burned real time before).
//
// Exit 1 with a list of findings; run `bun install` (and
// `npm install --package-lock-only` when you keep a local
// package-lock.json) after dependency or version changes.

import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'));

const deps = { ...(pkg.dependencies ?? {}), ...(pkg.devDependencies ?? {}) };
const self = pkg.name;

const missingBun = [];
const missingNpm = [];

if (!existsSync(join(ROOT, 'bun.lock'))) missingBun.push('(bun.lock missing entirely)');

const bunLock = existsSync(join(ROOT, 'bun.lock')) ? readFileSync(join(ROOT, 'bun.lock'), 'utf8') : '';
const npmLockPath = join(ROOT, 'package-lock.json');
const npmLockTracked = existsSync(npmLockPath);
const npmLock = npmLockTracked ? readFileSync(npmLockPath, 'utf8') : '';

for (const name of Object.keys(deps)) {
  if (name === self) continue;
  // bun.lock entries look like `"next@16.1.3"`; package-lock v3 keys look
  // like `"node_modules/next"`.
  if (bunLock && !bunLock.includes(`"${name}@`)) missingBun.push(name);
  if (npmLock && !npmLock.includes(`"node_modules/${name}"`)) missingNpm.push(name);
}

// v2.384.0 — THE GENERATION LEGS. The name census above let a quieter
// drift survive thirty releases: a lockfile whose root VERSION lags the
// manifest (the visible tell that the lock predates the current release)
// and a lockfile whose RANGES disagree with the manifest (a name that is
// present but resolved from an older request — `npm ci` would install a
// different tree than the manifest asks for). Both legs read the lock
// when it exists; the file stays untracked by repo policy, so these legs
// guard the LOCAL artifact, while CI keeps proving bun.lock's census.
const versionDrift = [];
const rangeDrift = [];
let npmRoot = null;
if (npmLock) {
  try {
    npmRoot = JSON.parse(npmLock).packages?.[''] ?? null;
  } catch {
    versionDrift.push('(package-lock.json is not valid JSON)');
  }
}
if (npmRoot) {
  if (npmRoot.version !== pkg.version) {
    versionDrift.push(
      `root version ${npmRoot.version} !== package.json ${pkg.version} — regenerate (npm install --package-lock-only)`,
    );
  }
  const lockDeps = { ...(npmRoot.dependencies ?? {}), ...(npmRoot.devDependencies ?? {}) };
  for (const [name, range] of Object.entries(deps)) {
    if (name === self) continue;
    if (name in lockDeps && lockDeps[name] !== range) {
      rangeDrift.push(`  ${name}: manifest=${range} lock=${lockDeps[name]}`);
    }
  }
}

let failed = false;
if (missingBun.length) {
  console.error('bun.lock drift — regenerate it after dependency changes:');
  console.error(`  missing from bun.lock:  ${missingBun.join(', ')}`);
  failed = true;
}

if (npmLockTracked && missingNpm.length) {
  console.error('package-lock.json (local, untracked) is stale vs package.json:');
  console.error(`  missing from package-lock.json:  ${missingNpm.join(', ')}`);
  console.error('  fix: run `npm install` locally to regenerate it.');
  failed = true;
}

if (versionDrift.length) {
  console.error('package-lock.json generation drift:');
  for (const line of versionDrift) console.error(`  ${line}`);
  failed = true;
}

if (rangeDrift.length) {
  console.error('package-lock.json range drift vs package.json:');
  console.error(rangeDrift.join('\n'));
  console.error('  fix: run `npm install --package-lock-only` locally to regenerate it.');
  failed = true;
}

if (!failed) {
  const scope = npmLockTracked
    ? `parity across both lockfiles (${Object.keys(deps).length} deps, root version, ranges)`
    : `bun.lock coverage (${Object.keys(deps).length} deps; package-lock.json is untracked by repo policy — parity leg skipped)`;
  console.log(`Lockfile guard OK — ${scope}.`);
  process.exit(0);
}
process.exit(1);
