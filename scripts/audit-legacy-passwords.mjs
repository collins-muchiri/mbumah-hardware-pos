#!/usr/bin/env node
// MBUMAH HARDWARE POS - Legacy password hash audit (SECURITY AUDIT FIX SEC-01)
//
// Finds User rows whose passwordHash is NOT a bcrypt hash - i.e. the retired
// `hashed_<plaintext>` format that stored recoverable credentials. After the
// SEC-01 fix those accounts FAIL CLOSED at login, so every row this script
// reports must be force-reset:
//
//   1. Run this script to list affected accounts:
//        node scripts/audit-legacy-passwords.mjs
//   2. For each reported user, set a fresh bcrypt hash and flag rotation:
//        node scripts/audit-legacy-passwords.mjs --reset <email> <newPassword>
//      (writes bcrypt(newPassword) + mustChangePassword=true so the user is
//       forced to choose their own password at next sign-in)
//
// Read-only by default. Uses Prisma via DATABASE_URL exactly like the app.


import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const [, , mode, email, newPassword] = process.argv;

async function audit() {
  // bcrypt hashes always start with $2a$/$2b$/$2y$. Anything else is legacy.
  const users = await prisma.user.findMany({
    select: { id: true, email: true, role: true, isActive: true, passwordHash: true },
  });
  const legacy = users.filter((u) => !u.passwordHash?.startsWith('$2'));
  if (legacy.length === 0) {
    console.log(`OK: ${users.length} users scanned, 0 legacy (non-bcrypt) hashes.`);
    return;
  }
  console.log(`LEGACY HASHES FOUND: ${legacy.length} of ${users.length} users`);
  for (const u of legacy) {
    // Never print the stored value - it may contain a plaintext credential.
    console.log(`  - ${u.email} (${u.role}, active=${u.isActive}) prefix=${u.passwordHash.slice(0, 7)}…`);
  }
  console.log('Action: re-run with --reset <email> <newPassword> for each account.');
}

async function reset(targetEmail, plain) {
  if (!targetEmail || !plain) {
    console.error('Usage: audit-legacy-passwords.mjs --reset <email> <newPassword>');
    process.exitCode = 1;
    return;
  }
  if (plain.length < 8) {
    console.error('New temporary password must be >= 8 characters.');
    process.exitCode = 1;
    return;
  }
  const user = await prisma.user.findUnique({ where: { email: targetEmail.toLowerCase() } });
  if (!user) {
    console.error(`No such user: ${targetEmail}`);
    process.exitCode = 1;
    return;
  }
  if (user.passwordHash?.startsWith('$2')) {
    console.log(`${targetEmail} already has a bcrypt hash - nothing to do.`);
    return;
  }
  const hash = await bcrypt.hash(plain, 12);
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: hash, mustChangePassword: true },
  });
  console.log(`Reset ${targetEmail}: bcrypt hash installed, mustChangePassword=true.`);
}

try {
  if (mode === '--reset') {
    await reset(email, newPassword);
  } else {
    await audit();
  }
} finally {
  await prisma.$disconnect();
}
