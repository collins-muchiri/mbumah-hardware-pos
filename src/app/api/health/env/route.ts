// GET /api/health/env - Environment variable presence check (NO secret values exposed)
// GATED since v2.212.1 (audit SEC-03): SUPER_ADMIN session required in
// production; open in non-production for the Vercel/Neon verification
// workflow. Still allowed through middleware via the /api/health/ prefix -
// the route itself enforces the auth now.

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// v2.212.1 (audit SEC-03): this endpoint previously ran PUBLIC. It masked
// secret VALUES but still leaked DB hostnames/usernames, pooled/SSL posture
// and secret-strength verdicts - enough for an attacker to map the
// infrastructure. Production now requires an authenticated SUPER_ADMIN
// session; non-production stays open for the Vercel/Neon verification
// workflow (VERCEL_NEON_VERIFICATION.md Step 6c).
import { getSessionFromCookies } from '@/lib/auth';

async function authorizeEnvDiagnostics(): Promise<Response | null> {
  if (process.env.NODE_ENV !== 'production') return null;

  const session = await getSessionFromCookies();
  if (!session) {
    return Response.json(
      { success: false, error: 'Unauthorized: authentication required for environment diagnostics.' },
      { status: 401 }
    );
  }
  if (session.role !== 'SUPER_ADMIN') {
    return Response.json(
      { success: false, error: 'Forbidden: environment diagnostics are restricted to SUPER_ADMIN.' },
      { status: 403 }
    );
  }
  return null;
}

function maskUrl(url: string): string {
  // Mask password in connection string, keep hostname + query params for verification
  try {
    const u = new URL(url);
    const pass = u.password ? '***' : '';
    const auth = u.username ? `${u.username}${pass ? ':' + pass : ''}@` : '';
    return `${u.protocol}//${auth}${u.host}${u.pathname}${u.search}`;
  } catch {
    // Not a valid URL - return a length-based mask
    return url.length > 20 ? `${url.slice(0, 10)}…${url.slice(-6)}` : '***';
  }
}

export async function GET() {
  const denied = await authorizeEnvDiagnostics();
  if (denied) return denied;

  const required = ['DATABASE_URL', 'NEXTAUTH_SECRET', 'JWT_SECRET'];
  const optional = ['DIRECT_URL', 'NEXTAUTH_URL'];

  const missing: string[] = [];
  const variables: Record<string, unknown> = {};
  const hints: string[] = [];

  // Required vars
  for (const key of required) {
    const value = process.env[key];
    if (!value || value.trim() === '') {
      missing.push(key);
      variables[key] = { set: false };
      continue;
    }

    if (key === 'DATABASE_URL' || key === 'DIRECT_URL') {
      const isPooled = value.includes('-pooler');
      const hasPgbouncer = value.includes('pgbouncer=true');
      const hasSsl = value.includes('sslmode=require') || value.includes('sslmode=require');
      variables[key] = {
        set: true,
        preview: maskUrl(value),
        pooled: isPooled,
        pgbouncer: hasPgbouncer,
        ssl: hasSsl,
        notes: [
          isPooled ? 'Pooled Neon URL ✓' : 'Warning: NOT pooled (no -pooler in hostname) - will exhaust Neon connection limit',
          hasPgbouncer ? 'pgbouncer=true ✓' : 'Warning: Missing pgbouncer=true query param',
          hasSsl ? 'sslmode=require ✓' : 'Warning: Missing sslmode=require',
        ],
      };
      if (!isPooled) hints.push(`${key} is not using the Neon pooled URL (hostname should contain -pooler). This will cause connection exhaustion under serverless load.`);
      if (!hasPgbouncer) hints.push(`${key} is missing pgbouncer=true. Prisma cannot use PgBouncer-compatible mode without it.`);
    } else if (key === 'NEXTAUTH_SECRET' || key === 'JWT_SECRET') {
      variables[key] = {
        set: true,
        length: value.length,
        strength: value.length >= 32 ? 'strong' : value.length >= 16 ? 'weak' : 'too-short',
      };
      if (value.length < 32) hints.push(`${key} is shorter than 32 chars (${value.length}). Generate with: openssl rand -base64 32`);
    }
  }

  // Optional vars
  for (const key of optional) {
    const value = process.env[key];
    if (!value) {
      variables[key] = { set: false, optional: true };
      continue;
    }
    if (key === 'NEXTAUTH_URL') {
      variables[key] = { set: true, preview: value };
    } else {
      variables[key] = { set: true, preview: maskUrl(value) };
    }
  }

  // Dev-only flags that should NOT be set in production
  const devFlags = ['EXPOSE_ERRORS', 'ALLOW_DEV_BYPASS'];
  for (const flag of devFlags) {
    const value = process.env[flag];
    if (value === 'true' || value === '1') {
      variables[flag] = { set: true, value, warning: 'DEV-ONLY FLAG - should be removed in production' };
      hints.push(`${flag}=true is set. Remove this from Vercel env vars for production security.`);
    } else {
      variables[flag] = { set: false };
    }
  }

  const status = missing.length > 0 ? 'error' : hints.length > 0 ? 'warning' : 'ok';

  return Response.json(
    {
      status,
      missing,
      variables,
      hints,
      timestamp: new Date().toISOString(),
    },
    { status: status === 'error' ? 503 : 200 }
  );
}
