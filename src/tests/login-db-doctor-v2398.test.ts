// THE LOGIN DB DOCTOR SUITE (v2.398.0) — the desk speaks the failure's name.
// Pins: the P-code gate (only real Prisma codes pass), the exposure gate
// (no detail = null, the pre-v2.398.0 face), the remediation table's voice
// (each known code answers its own title and steps), and the fallback for
// unknown-but-real Prisma codes.
import { describe, expect, it } from 'vitest';
import { diagnoseLoginDbFailure, type DbDiagnostic } from '@/lib/db-doctor';

const dbBody = (code: string) => ({
  success: false,
  error: 'Database connection failed. The database may be unreachable or the schema has not been pushed.',
  detail: { code, component: 'AUTH_LOGIN_DB', name: 'PrismaClientKnownRequestError' },
});

/** Assert the body answers a card, then hand the narrowed card back. */
function expectCardFor(code: string): DbDiagnostic {
  const card = diagnoseLoginDbFailure(dbBody(code));
  expect(card, code).not.toBeNull();
  return card as DbDiagnostic;
}

describe('login DB doctor (v2.398.0)', () => {
  it('answers null for bodies with no exposed detail (the prod-withheld face)', () => {
    expect(diagnoseLoginDbFailure(null)).toBeNull();
    expect(diagnoseLoginDbFailure('nope')).toBeNull();
    expect(diagnoseLoginDbFailure({ success: false, error: 'Invalid email or password.' })).toBeNull();
    expect(diagnoseLoginDbFailure({ success: false, detail: null })).toBeNull();
    expect(diagnoseLoginDbFailure({ success: false, detail: {} })).toBeNull();
  });

  it('answers null for non-Prisma or mis-typed codes', () => {
    expect(diagnoseLoginDbFailure(dbBody('PASSWORD_CHANGE_REQUIRED'))).toBeNull();
    expect(diagnoseLoginDbFailure(dbBody('p2021'))).toBeNull();
    expect(diagnoseLoginDbFailure(dbBody('P20211'))).toBeNull();
    expect(diagnoseLoginDbFailure(dbBody('P202'))).toBeNull();
    expect(diagnoseLoginDbFailure({ success: false, detail: { code: 2021 } })).toBeNull();
  });

  it('answers null unless the body is a failure body', () => {
    expect(
      diagnoseLoginDbFailure({ success: true, detail: { code: 'P2021' } }),
    ).toBeNull();
  });

  it('P2021 speaks the schema-not-pushed card with the stray-env step', () => {
    const card = expectCardFor('P2021');
    expect(card.title).toBe('Schema not pushed');
    expect(card.summary).toMatch(/schema was never pushed|WRONG database/);
    expect(card.steps.length).toBe(3);
    expect(card.steps[0]).toMatch(/npx prisma db push/);
    expect(card.steps.some((s) => s.includes('stray DATABASE_URL'))).toBe(true);
  });

  it('every known code answers its own titled card', () => {
    const expected: Record<string, string> = {
      P2021: 'Schema not pushed',
      P1003: 'Database file missing',
      P1001: 'Database unreachable',
      P1009: 'Database does not exist',
      P2022: 'Schema drift (missing column)',
      P1017: 'Connection closed by server',
    };
    for (const [code, title] of Object.entries(expected)) {
      const card = expectCardFor(code);
      expect(card.code).toBe(code);
      expect(card.title).toBe(title);
      expect(card.steps.length).toBeGreaterThan(0);
      for (const step of card.steps) {
        expect(step.length).toBeGreaterThan(0);
      }
    }
  });

  it('unknown-but-real Prisma codes fall back to the honest generic card', () => {
    const card = expectCardFor('P4242');
    expect(card.title).toBe('Database error');
    expect(card.steps).toEqual([
      'Check DATABASE_URL and the database server state, then retry sign-in.',
    ]);
  });

  it('never leaks server internals (no stack, no message echo)', () => {
    const card = diagnoseLoginDbFailure({
      success: false,
      error: 'secret failure text',
      detail: {
        code: 'P2021',
        component: 'AUTH_LOGIN_DB',
        stack: 'at superSecretFrame (/srv/app/...)',
        name: 'PrismaClientKnownRequestError',
      },
    });
    expect(card).not.toBeNull();
    const rendered = JSON.stringify(card);
    expect(rendered).not.toContain('superSecretFrame');
    expect(rendered).not.toContain('secret failure text');
    expect(Object.keys(card ?? {}).sort()).toEqual(['code', 'steps', 'summary', 'title']);
  });
});
