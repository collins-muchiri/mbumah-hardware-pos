// ─────────────────────────────────────────────────────────────────────────────
// MBUMAH HARDWARE POS - THE REPO-ENV GUARD (v2.398.0)
// ─────────────────────────────────────────────────────────────────────────────
// THE DEV RUNTIME JOINS THE ENV-WINS LAW.
//
// The repo's own policy (setup-prisma-provider.mjs, ensure-schema.mjs,
// deploy/nodocker/start-server.mjs, prisma.config.ts) is explicit: a value
// found in <repo>/.env WINS over an inherited environment variable, "so a
// stray DATABASE_URL from another project can never silently redirect" the
// process to the wrong database.
//
// The raw `next dev` / `next build` / `next start` runtime was the ONE path
// without the guard: Next.js's own precedence is the OPPOSITE (inherited
// environment beats .env files), so a stray shell DATABASE_URL silently
// redirected the dev server to a foreign database while .env sat ignored —
// reproduced live in the v2.398.0 QA round (login answered P2021 against an
// empty foreign file while the seeded dev DB sat healthy next to it).
//
// next.config.ts calls applyRepoDbEnv() at config-evaluation time — before
// any route compiles — so every `next` invocation in this repo inherits the
// same law the launchers already follow. With no .env file (Vercel, CI,
// bare Docker images) the inherited environment applies untouched, exactly
// like the launchers.
//
// PURE CORE: parseDotenv + decideRepoDbEnv do no I/O and read no env —
// the caller (next.config.ts) owns the file read and the assignment, and
// the suite can drive every decision without touching process.env.
// ─────────────────────────────────────────────────────────────────────────────

/** The connection vars the guard speaks for — nothing else is touched. */
export const REPO_DB_ENV_KEYS = ['DATABASE_URL', 'DIRECT_URL'] as const;

export type RepoDbEnvKey = (typeof REPO_DB_ENV_KEYS)[number];

/**
 * Parse a .env file's text into key/value pairs.
 * - skips blank lines and `#` comments,
 * - splits on the FIRST `=` (values may contain `=`),
 * - trims whitespace around key and value,
 * - strips ONE pair of surrounding single or double quotes,
 * - silently skips lines that do not parse (no `=`, empty key).
 */
export function parseDotenv(raw: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    if (!key || /\s/.test(key)) continue;
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"') && value.length >= 2) ||
      (value.startsWith("'") && value.endsWith("'") && value.length >= 2)
    ) {
      value = value.slice(1, -1);
    }
    out[key] = value;
  }
  return out;
}

export interface RepoDbEnvDecision {
  /**
   * key → the .env value to assign. Non-empty .env values only; a key the
   * .env does not define (or defines empty) never appears here.
   */
  adopt: Partial<Record<RepoDbEnvKey, string>>;
  /**
   * The subset of `adopt` where an inherited value EXISTED and DIFFERED —
   * the loud, redirect-shaped cases the operator should hear about.
   */
  overrode: RepoDbEnvKey[];
}

/**
 * Decide which DB connection vars the .env file wins. Semantics mirror the
 * launchers: a non-empty .env value adopts (and, when it differs from an
 * inherited value, counts as an override worth logging). Equal values and
 * .env-silent keys are no-ops.
 */
export function decideRepoDbEnv(
  dotenv: Record<string, string>,
  inherited: Record<string, string | undefined>,
  keys: readonly string[] = REPO_DB_ENV_KEYS,
): RepoDbEnvDecision {
  const adopt: Partial<Record<RepoDbEnvKey, string>> = {};
  const overrode: RepoDbEnvKey[] = [];
  for (const key of keys) {
    const fromFile = dotenv[key];
    if (typeof fromFile !== 'string' || fromFile.trim() === '') continue;
    const knownKey = (REPO_DB_ENV_KEYS as readonly string[]).includes(key)
      ? (key as RepoDbEnvKey)
      : undefined;
    if (!knownKey) continue;
    adopt[knownKey] = fromFile;
    const inheritedValue = inherited[key];
    if (typeof inheritedValue === 'string' && inheritedValue !== '' && inheritedValue !== fromFile) {
      overrode.push(knownKey);
    }
  }
  return { adopt, overrode };
}
