// THE REPO-ENV GUARD SUITE (v2.398.0) — the dev runtime joins the env-wins law.
// Pins: the dotenv parser's face (quotes, comments, first-= split, skips),
// the env-wins decision (stray inherited DATABASE_URL is overrode; equal and
// absent values are quiet), and the scope law (only the two DB keys are
// spoken for — nothing else is adopted).
import { describe, expect, it } from 'vitest';
import {
  decideRepoDbEnv,
  parseDotenv,
  REPO_DB_ENV_KEYS,
} from '@/lib/repo-env';

describe('parseDotenv (v2.398.0)', () => {
  it('parses KEY=VALUE, trims, strips one quote pair', () => {
    const parsed = parseDotenv(
      [
        'DATABASE_URL="file:/home/z/ems/db/audit-dev.db"',
        "NEXTAUTH_SECRET='abc'",
        'JWT_SECRET=raw-secret',
      ].join('\n'),
    );
    expect(parsed.DATABASE_URL).toBe('file:/home/z/ems/db/audit-dev.db');
    expect(parsed.NEXTAUTH_SECRET).toBe('abc');
    expect(parsed.JWT_SECRET).toBe('raw-secret');
  });

  it('skips blanks, comments and malformed lines; splits on the FIRST =', () => {
    const parsed = parseDotenv(
      [
        '# a comment',
        '',
        '   ',
        'BROKEN LINE WITHOUT EQUALS',
        '=nokey',
        'URL="postgresql://u:p@h/db?sslmode=require&pgbouncer=true"',
        '#DATABASE_URL="commented-out"',
      ].join('\n'),
    );
    expect(parsed.URL).toBe('postgresql://u:p@h/db?sslmode=require&pgbouncer=true');
    expect(Object.keys(parsed).sort()).toEqual(['URL']);
  });

  it('the repo .env shape parses to the audited values', () => {
    const parsed = parseDotenv(
      'DATABASE_URL="file:/home/z/ems/db/audit-dev.db"\nNEXTAUTH_SECRET="x"\nJWT_SECRET="y"\n',
    );
    expect(parsed.DATABASE_URL).toBe('file:/home/z/ems/db/audit-dev.db');
    expect(parsed.DIRECT_URL).toBeUndefined();
  });
});

describe('decideRepoDbEnv (v2.398.0)', () => {
  it('the stray-env redirect is the loud case: .env wins and the key lands in overrode', () => {
    const decision = decideRepoDbEnv(
      { DATABASE_URL: 'file:/home/z/ems/db/audit-dev.db' },
      { DATABASE_URL: 'file:/home/z/my-project/db/custom.db' },
    );
    expect(decision.adopt.DATABASE_URL).toBe('file:/home/z/ems/db/audit-dev.db');
    expect(decision.overrode).toEqual(['DATABASE_URL']);
  });

  it('a missing or empty inherited value adopts quietly (normal local dev)', () => {
    const quiet = decideRepoDbEnv(
      { DATABASE_URL: 'file:./prisma/dev.db' },
      {},
    );
    expect(quiet.adopt.DATABASE_URL).toBe('file:./prisma/dev.db');
    expect(quiet.overrode).toEqual([]);

    const empty = decideRepoDbEnv(
      { DATABASE_URL: 'file:./prisma/dev.db' },
      { DATABASE_URL: '' },
    );
    expect(empty.adopt.DATABASE_URL).toBe('file:./prisma/dev.db');
    expect(empty.overrode).toEqual([]);
  });

  it('equal values adopt with no override noise', () => {
    const decision = decideRepoDbEnv(
      { DATABASE_URL: 'file:./prisma/dev.db' },
      { DATABASE_URL: 'file:./prisma/dev.db' },
    );
    expect(decision.adopt.DATABASE_URL).toBe('file:./prisma/dev.db');
    expect(decision.overrode).toEqual([]);
  });

  it('keys the .env does not define (or defines empty) are never adopted', () => {
    const decision = decideRepoDbEnv(
      { DATABASE_URL: 'file:./prisma/dev.db', DIRECT_URL: '' },
      { DIRECT_URL: 'postgresql://inherited' },
    );
    expect(decision.adopt.DIRECT_URL).toBeUndefined();
    expect(decision.overrode).toEqual([]);
  });

  it('unknown keys are refused — the guard speaks only for the DB connection vars', () => {
    const decision = decideRepoDbEnv(
      { DATABASE_URL: 'file:./dev.db', PORT: '9999', NEXTAUTH_SECRET: 'x' },
      { PORT: '3000' },
      ['DATABASE_URL', 'PORT', 'NEXTAUTH_SECRET'],
    );
    expect(Object.keys(decision.adopt)).toEqual(['DATABASE_URL']);
    expect(decision.overrode).toEqual([]);
  });

  it('the default key set is exactly the two connection vars', () => {
    expect(REPO_DB_ENV_KEYS).toEqual(['DATABASE_URL', 'DIRECT_URL']);
  });

  it('round trip: the live reproduction answers the audited decision', () => {
    // The v2.398.0 QA round's exact scenario, pinned as the regression gate.
    const dotenv = parseDotenv(
      'DATABASE_URL="file:/home/z/ems/db/audit-dev.db"\nNEXTAUTH_SECRET="x"\nJWT_SECRET="y"\n',
    );
    const decision = decideRepoDbEnv(dotenv, {
      DATABASE_URL: 'file:/home/z/my-project/db/custom.db',
      NEXTAUTH_SECRET: 'inherited-secret',
    });
    expect(decision.adopt.DATABASE_URL).toBe('file:/home/z/ems/db/audit-dev.db');
    expect(decision.overrode).toEqual(['DATABASE_URL']);
    // NEXTAUTH_SECRET is outside the guard's vocabulary — untouched.
    expect(decision.adopt.NEXTAUTH_SECRET).toBeUndefined();
  });
});
