// MBUMAH HARDWARE POS - Password verification (single source of truth)
//
// v2.212.1 SECURITY REMEDIATION (audit finding SEC-01):
//   The legacy "hashed_<plaintext>" password fallback existed in THREE places
//   (src/app/api/auth/login/route.ts, src/lib/manager-auth.ts, and the
//   transactions route's private verifyManagerPassword). It compared the
//   submitted password against a plaintext fragment embedded in the database
//   row (`hashed_<plain>_<digits>`), which:
//     • made any hashed_* row equivalent to a plaintext password,
//     • bypassed the bcrypt cost / timing assumptions the rest of the auth
//       stack relies on, and
//     • drifted between the three copies over time.
//
//   This module is now the ONLY password verifier. Legacy "hashed_" hashes
//   are REJECTED - they verify as false, exactly like a wrong password, and
//   never throw. Migrate affected accounts BEFORE deploying this change:
//
//     node scripts/migrate-legacy-passwords.mjs          (dry-run report)
//     node scripts/migrate-legacy-passwords.mjs --apply  (rehash to bcrypt 12)
//
//   If a hashed_ row is not migrated first, that user simply cannot sign in
//   until an admin resets their password (same UX as a forgotten password).

import bcrypt from 'bcryptjs';

/** bcrypt cost - matches /api/users POST and /api/profile/password (cost 12). */
export const BCRYPT_ROUNDS = 12;

/** True when a stored hash is in the retired legacy "hashed_" format. */
export function isLegacyPasswordHash(storedHash: string): boolean {
  return typeof storedHash === 'string' && storedHash.startsWith('hashed_');
}

/**
 * Verify a password against a stored hash. ONLY bcrypt ("$2*") hashes verify.
 * Anything else - legacy "hashed_", empty, malformed - returns false without
 * throwing, so callers keep the plain `await verifyPassword(...)` shape.
 */
export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  if (!password || !storedHash) return false;
  if (!storedHash.startsWith('$2')) return false;
  try {
    return await bcrypt.compare(password, storedHash);
  } catch {
    // Malformed salt / truncated hash - treat identically to a wrong password.
    return false;
  }
}

/** Hash a plaintext password with the shared bcrypt cost. */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}
