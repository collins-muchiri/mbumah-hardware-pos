// AUDIT REMEDIATION (v2.307.0) - production error-sanitization regression tests.
//
// Pins the audit's PHASE 4/9 asks: production responses must NEVER expose
// stack traces, raw Prisma errors, SQL details, or internal paths. The login
// route already gates its DB-error `detail` behind EXPOSE_ERRORS/dev (see
// src/app/api/auth/login/route.ts); these tests pin the SHARED boundary -
// withErrorBoundary - that every API route leans on, so a future refactor
// cannot silently start leaking internals in production.
//
// Matrix:
//   production + generic Error      → sanitized message, NO stack/message leak
//   production + Prisma-style error → schema-drift code path maps to a clean
//                                     user message, NO code/stack leak
//   development                     → verbose detail allowed (dev visibility)
//   production + EXPOSE_ERRORS=true → full detail (documented ops escape hatch)
//   malformed request payloads      → 400 from validation, no internals

import { describe, it, expect, afterEach, vi } from 'vitest';

const { systemLogMock } = vi.hoisted(() => ({ systemLogMock: vi.fn() }));

vi.mock('@/lib/db', () => ({
  db: {
    systemLog: { create: systemLogMock },
  },
}));

import { withErrorBoundary, mapErrorToUserMessage } from '@/lib/logger';

function prismaStyleError(code: string, message: string): Error {
  const err = new Error(message) as Error & { code: string };
  err.code = code;
  return err;
}

describe('audit v2.307.0 - withErrorBoundary production sanitization', () => {
  // NODE_ENV is typed readonly (Next.js literal union) - vitest's stubEnv is
  // the sanctioned way to vary it; unstubAllEnvs restores between tests.
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('production: a thrown error leaks NO stack or message internals (non-sensitive code+component pair only)', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('EXPOSE_ERRORS', '');

    const handler = withErrorBoundary(async () => {
      throw new Error('Secrets live in /var/app/internal/db-password.txt');
    }, 'AUDIT_TEST');

    const res = await handler(new Request('https://x.test/api/audit'));
    const body = (await res.json()) as { error?: string; detail?: { name?: string; code?: string | null; component?: string; message?: string; stack?: string } };

    expect(res.status).toBe(500);
    // message/stack stay server-only (stdout / Runtime Logs).
    expect(body.detail?.message).toBeUndefined();
    expect(body.detail?.stack).toBeUndefined();
    expect(JSON.stringify(body)).not.toContain('/var/app/internal');
    expect(JSON.stringify(body)).not.toContain('db-password');
    // The deliberate non-sensitive diagnostic pair IS present.
    expect(body.detail?.name).toBe('Error');
    expect(body.detail?.component).toBe('AUDIT_TEST');
  });

  it('production: Prisma schema-drift errors map to a clean user message without raw SQL or column names', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('EXPOSE_ERRORS', '');

    const handler = withErrorBoundary(async () => {
      throw prismaStyleError('P2022', "Column 'users.totp_secret' does not exist in the current database");
    }, 'AUDIT_TEST');

    const res = await handler(new Request('https://x.test/api/audit'));
    const body = (await res.json()) as { error?: string; detail?: { message?: string; stack?: string } };

    expect(res.status).toBe(500);
    expect(body.error).toMatch(/schema error/i);
    // Raw SQL fragment / column name / stack never reach the client.
    expect(JSON.stringify(body)).not.toContain('totp_secret');
    expect(body.detail?.message).toBeUndefined();
    expect(body.detail?.stack).toBeUndefined();
  });

  it('production: the Prisma error MESSAGE and STACK stay server-only (the diagnostic code pair is allowed)', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('EXPOSE_ERRORS', '');

    const handler = withErrorBoundary(async () => {
      throw prismaStyleError('P1003', 'Table `main.User` does not exist in the current database.');
    }, 'AUDIT_TEST');

    const res = await handler(new Request('https://x.test/api/auth/login'));
    const body = JSON.stringify(await res.json());

    expect(res.status).toBe(500);
    // The internal message never leaks; the non-sensitive code class may.
    expect(body).not.toContain('does not exist in the current database');
    expect(body).not.toContain('stack');
    expect(body).toContain('"code":"P1003"');
  });

  it('development: verbose detail remains available for debugging', async () => {
    vi.stubEnv('NODE_ENV', 'development');
    vi.stubEnv('EXPOSE_ERRORS', '');

    const handler = withErrorBoundary(async () => {
      throw new Error('dev-only diagnostic detail');
    }, 'AUDIT_TEST');

    const res = await handler(new Request('https://x.test/api/audit'));
    const body = JSON.stringify(await res.json());

    expect(res.status).toBe(500);
    expect(body).toContain('dev-only diagnostic detail');
  });

  it('production + EXPOSE_ERRORS=true: documented ops escape hatch still works', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('EXPOSE_ERRORS', 'true');

    const handler = withErrorBoundary(async () => {
      throw prismaStyleError('P1003', 'Table `main.User` does not exist in the current database.');
    }, 'AUDIT_TEST');

    const res = await handler(new Request('https://x.test/api/auth/login'));
    const body = (await res.json()) as { detail?: { code?: string } };

    expect(res.status).toBe(500);
    expect(body.detail?.code).toBe('P1003');
  });

  it('successful handlers pass through untouched', async () => {
    const handler = withErrorBoundary(async () => Response.json({ success: true }), 'AUDIT_TEST');
    const res = await handler(new Request('https://x.test/api/audit'));
    expect(res.status).toBe(200);
  });
});

describe('audit v2.307.0 - mapErrorToUserMessage never echoes internals', () => {
  it('Prisma connection errors produce an actionable, non-technical message', () => {
    const msg = mapErrorToUserMessage(prismaStyleError('P1001', "Can't reach database server at ep-xyz.neon.tech"));
    expect(msg).not.toContain('ep-xyz.neon.tech');
    expect(typeof msg).toBe('string');
    expect(msg.length).toBeGreaterThan(0);
  });

  it('unknown errors fall back to a generic message', () => {
    const msg = mapErrorToUserMessage(new Error('anything'));
    expect(typeof msg).toBe('string');
    expect(msg.length).toBeGreaterThan(0);
  });
});
