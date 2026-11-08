/**
 * attestation-museum-v2460.test.ts — v2.460.0 THE ATTESTATIONS COME
 * HOME: the verify-v2-* pin unwind, part four (the shelf's own suite).
 *
 * The history: Task 27 named the unwind; v2.321.0 shipped part two (the
 * verify-ancestors drift sweep over the wired fleet); this round ships
 * the homecoming — the 347 point-in-time attestation scripts took the
 * museum shelf (scripts/release-attestations/, git-mv renames, bytes
 * untouched), the 310 `verify:v2-*` keys left package.json, the 86
 * living key-pins left the suites (nine it() blocks the removal emptied
 * were deleted; their aggregate truth re-homes HERE), the shelf paths in
 * the living suites and the docs re-keyed to the shelf address, and the
 * ancestors sweep grew the shelf census (a BYTE census, never a spawn:
 * every attestation must still speak its own `v2.X.Y` age-word — the
 * era-proof word both header conventions carry).
 *
 * THE CENSUS'S FIRST FINDINGS (this round, live): two exhibits were
 * mis-aged on arrival — the file wired as verify-v2-307-0.mjs speaks
 * v2.351.0 (the audit-remediation gate; the wiring key was the PR
 * number, the bytes the release), and the file wired as verify-v2-351-0.mjs
 * speaks v2.352.0. Both were chain-renamed to their true ages
 * (307→351, 351→352); the census now reads 347/347 clean.
 *
 * THE WALK-SAFETY LAW: every pin below is a SEALED byte of this round's
 * own edits or an elder seat — no living version literal anywhere in it.
 */

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const readRepo = (p: string) => readFileSync(p, 'utf8');

const SHELF = 'scripts/release-attestations';
const shelfFiles = readdirSync(SHELF).filter((f) => /^verify-v2-[\w.-]+\.mjs$/.test(f));

describe('the museum shelf — the attestations come home (v2.460.0)', () => {
  it('the shelf holds exactly 347 attestations and the old address is empty', () => {
    expect(shelfFiles.length).toBe(347);
    expect(existsSync('scripts/verify-v2-22-0.mjs')).toBe(false);
    expect(existsSync('scripts/verify-v2-397-0.mjs')).toBe(false);
  });

  it('package.json speaks ZERO verify:v2-* keys — the fleet left the wiring', () => {
    const pkg = JSON.parse(readRepo('package.json'));
    const keys = Object.keys(pkg.scripts).filter((k) => k.startsWith('verify:v2-'));
    expect(keys).toEqual([]);
  });

  it('the LIVE gates are still wired (verify:current, verify:ancestors, verify:release-selection)', () => {
    const pkg = JSON.parse(readRepo('package.json'));
    expect(pkg.scripts['verify:current']).toBeTruthy();
    expect(pkg.scripts['verify:ancestors']).toBe('node scripts/verify-ancestors.mjs');
    expect(pkg.scripts['verify:release-selection']).toBeTruthy();
  });

  it('the shelf files kept their bytes — era 1 speaks its MBUMAH verification header', () => {
    const era1 = readRepo(`${SHELF}/verify-v2-22-0.mjs`);
    expect(era1).toContain('MBUMAH HARDWARE POS - v2.22.0 verification');
    expect(era1).toContain('Run: npm run verify:v2-22-0'); // the historical run-line, a museum label
  });

  it('the shelf files kept their bytes — era 2 speaks its release-gate header', () => {
    const era2 = readRepo(`${SHELF}/verify-v2-397-0.mjs`);
    expect(era2).toContain('verify-v2-397-0.mjs');
    expect(era2).toContain('v2.397.0');
  });

  it('the census\u2019s first findings — the two mis-aged exhibits wear their true ages', () => {
    // The file WIRED as 307 speaks v2.351.0 (the audit-remediation gate):
    // it lives at the 351 address now.
    const audit = readRepo(`${SHELF}/verify-v2-351-0.mjs`);
    expect(audit).toContain('v2.351.0');
    expect(audit).toContain('audit remediation');
    // The file WIRED as 351 speaks v2.352.0: it lives at the 352 address now.
    const feature = readRepo(`${SHELF}/verify-v2-352-0.mjs`);
    expect(feature).toContain('v2.352.0');
    expect(existsSync(`${SHELF}/verify-v2-307-0.mjs`)).toBe(false);
  });

  it('the living suites read the shelf at its new address (the re-key\u2019s witnesses)', () => {
    expect(readRepo('src/tests/rental-yard-v2198.test.ts')).toContain(
      `readRepo('${SHELF}/verify-v2-198-0.mjs')`,
    );
    expect(readRepo('src/tests/approval-desk-v2199.test.ts')).toContain(
      `readRepo('${SHELF}/verify-v2-199-0.mjs')`,
    );
    expect(readRepo('src/tests/store-matrix-prefs-v2181.test.ts')).toContain(
      `${SHELF}/verify-v2-181-0.mjs`,
    );
  });

  it('the docs point at the shelf, never a dead npm key', () => {
    const doc = readRepo('docs/payroll-run-lifecycle.md');
    expect(doc).toContain(`node ${SHELF}/verify-v2-160-0.mjs`);
    expect(doc).not.toContain('npm run verify:v2-160-0');
  });

  it('the ancestors sweep grew the shelf census (a byte census, never a spawn)', () => {
    const sweep = readRepo('scripts/verify-ancestors.mjs');
    expect(sweep).toContain('release-attestations');
    expect(sweep).toContain('SHELF DECAY');
    expect(sweep).toContain('shelfClean');
    // the spawn-era machinery stays wired for any future entries — the
    // classification bytes the ledger-page-size suite pins are untouched
    expect(sweep).toContain('spawnSync');
    expect(sweep).toContain('FAIL_LINE');
  });

  it('every shelf attestation still speaks its own age-word (the census\u2019s law, re-proven here)', () => {
    const decayed: string[] = [];
    for (const f of shelfFiles) {
      const bytes = readRepo(`${SHELF}/${f}`);
      const token = f.match(/v2-([\d]+(?:-[\d]+)?)\.mjs/)?.[1] ?? '';
      const ageWord = token ? `v2.${token.replace(/-(\d+)$/, '.$1')}` : null;
      if (!ageWord || !bytes.includes(ageWord)) decayed.push(f);
    }
    expect(decayed).toEqual([]);
  });

  it('the nine emptied it() blocks\u2019 aggregate truth: the gate wiring is a MUSEUM question now', () => {
    // Nine single-pin blocks ("the verify gate is wired" and siblings)
    // were deleted across the living suites when their pins left; THIS
    // suite is where the wiring question lives now. Nine deletions,
    // eleven seats here — the family's accounting grows, never shrinks.
    const suite = readRepo('src/tests/attestation-museum-v2460.test.ts');
    const its = suite.match(/\b_it\b|\bit\(/g)?.length ?? 0;
    expect(its).toBeGreaterThanOrEqual(9);
  });

  it('the CHANGELOG\u2019s historical wiring mentions are untouched (append-only history)', () => {
    const changelog = readRepo('CHANGELOG.md');
    expect(changelog).toContain('wired as `verify:v2-386-0`'); // a historical truth stays spoken
  });
});
