// MBUMAH HARDWARE POS - Shared password verification (SECURITY AUDIT FIX SEC-01)
//
// Single source of truth for verifying a stored user/manager credential hash.
// Before this module existed, THREE copies of the verification logic lived in:
//   - src/app/api/auth/login/route.ts        (verifyPassword)
//   - src/lib/manager-auth.ts                (verifyManagerPassword)
//   - src/app/api/transactions/route.ts      (private verifyManagerPassword)
// All three carried a legacy "hashed_<plaintext>" fallback that compared the
// submitted password against a plaintext fragment embedded in the stored hash
// - a critical authentication weakness (any DB leak exposes live credentials,
// and timing-safe comparison was not applied). That fallback is REMOVED here.
//
// POLICY (fail-closed):
//   - Only bcrypt hashes ($2a$ / $2b$ / $2y$ prefix) are accepted.
//   - Any other stored format - including the retired legacy `hashed_*`
//     rows - NEVER authenticates. Run scripts/audit-legacy-passwords.mjs to
//     find affected accounts and force a password reset for each one.
//   - Malformed bcrypt strings throw inside bcrypt.compare; we swallow the
//     error and return false (an unverifiable credential must lock the
//     account out, not crash the login path).

import bcrypt from 'bcryptjs';

const BCRYPT_PREFIX = '$2';

/** True when a stored hash is in the retired legacy `hashed_*` format. */
export function isLegacyHash(storedHash: string): boolean {
  return typeof storedHash === 'string' && storedHash.startsWith('hashed_');
}

/**
 * Verify a candidate password against a stored bcrypt hash.
 * Legacy `hashed_*` rows intentionally always fail (see file header).
 */
export async function verifyPassword(
  password: string,
  storedHash: string
): Promise<boolean> {
  if (typeof storedHash !== 'string' || !storedHash.startsWith(BCRYPT_PREFIX)) {
    // Not a bcrypt hash (legacy format, empty, or corrupt) - fail closed.
    return false;
  }
  try {
    return await bcrypt.compare(password, storedHash);
  } catch {
    return false;
  }
}

/** Alias kept for call-sites that name it per-role (manager step-up). */
export const verifyManagerPassword = verifyPassword;
