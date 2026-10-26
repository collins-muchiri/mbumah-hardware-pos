#!/usr/bin/env node
// ============================================================================
// MBUMAH HARDWARE POS - One-time legacy password migration (SEC-01 fix)
// ============================================================================
// Auditing the auth stack found accounts whose passwordHash column still
// holds the retired legacy "hashed_<plaintext>" format. The login fallback
// that accepted that format has been REMOVED from the code (SEC-01), so any
// row still in this format can no longer sign in.
//
// This script rehashes those rows to bcrypt (cost 12) using the plaintext
// fragment embedded in the legacy value - the same extraction the old
// fallback performed (strip "hashed_" prefix, strip trailing "_<digits>").
//
// Run BEFORE deploying the SEC-01 code change:
//
//   node scripts/migrate-legacy-passwords.mjs           # dry run (default)
//   node scripts/migrate-legacy-passwords.mjs --apply   # write bcrypt hashes
//
// The script NEVER prints password material - only emails, row ids and
// counts. After migrating, force a password rotation for the affected
// accounts: the plaintext was previously recoverable from the database.
// ============================================================================

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const APPLY = process.argv.includes('--apply');
const BCRYPT_ROUNDS = 12;
const db = new PrismaClient();

function legacyPlainPart(storedHash) {
  // Byte-for-byte the same extraction the removed fallback used.
  return storedHash.replace('hashed_', '').replace(/_\d+$/, '');
}

async function main() {
  const users = await db.user.findMany({
    where: { passwordHash: { startsWith: 'hashed_' } },
    select: { id: true, email: true, passwordHash: true, isActive: true },
  });

  if (users.length === 0) {
    console.log('No legacy "hashed_" password rows found - nothing to migrate.');
    return;
  }

  console.log(`Found ${users.length} account(s) with legacy hashed_ password rows:`);
  for (const u of users) {
    console.log(`  - ${u.email} (${u.id}) active=${u.isActive}`);
  }

  if (!APPLY) {
    console.log('\nDry run only. Re-run with --apply to rehash these rows to bcrypt (cost 12).');
    return;
  }

  let migrated = 0;
  let skipped = 0;
  for (const u of users) {
    const plain = legacyPlainPart(u.passwordHash);
    if (!plain) {
      console.error(`  SKIP ${u.email}: extracted plaintext fragment is empty - reset this password manually.`);
      skipped += 1;
      continue;
    }
    const hash = await bcrypt.hash(plain, BCRYPT_ROUNDS);
    await db.user.update({ where: { id: u.id }, data: { passwordHash: hash } });
    migrated += 1;
  }

  console.log(`\nRehashed ${migrated} row(s) to bcrypt; ${skipped} skipped.`);
  console.log('Next steps:');
  console.log('  1. Verify one affected account can sign in.');
  console.log('  2. Force a password rotation for the affected accounts -');
  console.log('     their plaintext was previously recoverable from the DB.');
  console.log('  3. Deploy the SEC-01 code change (legacy fallback removed).');
}

main()
  .catch((err) => {
    console.error('Migration failed:', err);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
