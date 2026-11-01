// v2.241.0 — the walk's law.
//
//   - THE LAW LIBRARY: the duplicated 7/30 constants become one home
//     (src/lib/cadence-law.ts) — readCadenceLaw reads the pair as ONE
//     read, validates each key against its band, coherence-checks the
//     pair, and falls back to the defaults 7/30 on ANY absence,
//     malformation, or incoherence (the reader never throws).
//   - THE LAW WIRE: GET/PUT /api/org/cadence — manager-plus reads, the
//     owner writes, the PAIR LAW rejects half a law, the AUDIT LAW
//     lands every write in the tamper-evident trail.
//   - THE WIRES OBEY: kpi-summary + the categories teeth read the same
//     stored pair; the duplicated constants are GONE; the law's window
//     governs the whole 30d-shaped family.
//   - THE LAW'S FACE: the cadence block names the pair; the pen rides
//     only for the governor; the editor mirrors the bands before the
//     round trip; the wire's 400 speaks into the error line; a written
//     law toasts the pair and asks the page for the refetch.
//   - THE WINDOW SPEAKS ITS NUMBER: every hardcoded "30-day"/"30d"
//     label in the map says the law's own number.
//
// Every pin reads the SOURCE OF RECORD (source bytes, not memory).

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it, expect } from 'vitest';
import {
  CADENCE_LAW_DEFAULTS,
  CADENCE_LAW_KEYS,
  CADENCE_LAW_BOUNDS,
  isValidCadenceLaw,
} from '@/lib/cadence-law';

const read = (p: string) => readFileSync(join(process.cwd(), p), 'utf8');

const map = read('src/components/org/variance-map.tsx');
const _lawLib = read('src/lib/cadence-law.ts');
const lawWire = read('src/app/api/org/cadence/route.ts');
const kpi = read('src/app/api/org/kpi-summary/route.ts');
const teeth = read('src/app/api/categories/route.ts');
const page = read('src/app/(shell)/console/page.tsx');
const pkg = JSON.parse(read('package.json'));
const feed = read('src/lib/whats-new.ts');
const changelog = read('CHANGELOG.md');
const changelogTest = read('src/tests/console-changelog.test.ts');
const version = String(pkg.version);

// ── THE RELEASE FACE ─────────────────────────────────────────────────────

describe('the round of record (v2.241.0)', () => {
  it('package.json leads 2.241.0 (all three slots)', () => {
    expect(version).toBe('2.339.0');
    expect(pkg.mbumah.releaseVersion).toBe('2.339.0');
    expect(pkg.mbumah.baseVersion).toBe('2.339.0');
  });

  it('VERSION speaks 2.241.0 and the verify gate is wired (previous gate still wired)', () => {
    expect(read('VERSION').trim()).toBe('2.339.0');
    expect(pkg.scripts['verify:v2-241-0']).toBe('node scripts/verify-v2-241-0.mjs');
    expect(pkg.scripts['verify:v2-240-0']).toBe('node scripts/verify-v2-240-0.mjs');
  });

  it('the whats-new feed leads the walk\u2019s-law entry (order pin: header-anchored)', () => {
    expect(feed.includes("version: '2.277.0',")).toBe(true);
    expect(feed.indexOf("version: '2.277.0',")).toBeLessThan(feed.indexOf("version: '2.276.0',"));
    expect(feed.includes('title: \'The walk\\u2019s law\',')).toBe(true);
  });

  it('the changelog anchors the section above its ancestor (headers, never bare strings)', () => {
    expect(changelog.indexOf('## [2.241.0]')).toBeGreaterThanOrEqual(0);
    expect(changelog.indexOf('## [2.241.0]')).toBeLessThan(changelog.indexOf('## [2.240.0]'));
  });

  it('the changelog speaks the law and its face', () => {
    const body = changelog.slice(changelog.indexOf('## [2.241.0]'), changelog.indexOf('## [2.240.0]'));
    expect(body).toContain('### Added');
    expect(body).toContain('### Styled');
    expect(body).toContain('src/lib/cadence-law.ts');
    expect(body).toContain('/api/org/cadence');
    expect(body).toContain('cadence-law-pen');
  });

  it('the counters ride +1 again (the birth joined; the law joins)', () => {
    expect(changelogTest).toContain("expect(whatsNewUnreadCount('2.110.0')).toBe(230);");
    expect(changelogTest).toContain("expect(whatsNewUnreadCount('2.77.0')).toBe(263);");
  });
});

// ── THE LAW LIBRARY ──────────────────────────────────────────────────────

describe('the law library (src/lib/cadence-law.ts)', () => {
  it('the defaults are 7/30 — yesterday\u2019s truth is the floor', () => {
    expect(CADENCE_LAW_DEFAULTS).toEqual({ freshDays: 7, windowDays: 30 });
  });

  it('the keys are the stored pair (SystemConfig rows, namespaced)', () => {
    expect(CADENCE_LAW_KEYS.freshDays).toBe('cadence.freshDays');
    expect(CADENCE_LAW_KEYS.windowDays).toBe('cadence.windowDays');
  });

  it('the bounds: fresh 1\u201314, window 14\u201390', () => {
    expect(CADENCE_LAW_BOUNDS.freshDays).toEqual({ min: 1, max: 14 });
    expect(CADENCE_LAW_BOUNDS.windowDays).toEqual({ min: 14, max: 90 });
  });

  it('the pair law accepts coherent pairs inside the bands', () => {
    expect(isValidCadenceLaw({ freshDays: 7, windowDays: 30 })).toBe(true);
    expect(isValidCadenceLaw({ freshDays: 1, windowDays: 14 })).toBe(true);
    expect(isValidCadenceLaw({ freshDays: 14, windowDays: 90 })).toBe(true);
    expect(isValidCadenceLaw({ freshDays: 3, windowDays: 45 })).toBe(true);
  });

  it('the pair law rejects half a law, out-of-band values, and incoherence', () => {
    expect(isValidCadenceLaw(null)).toBe(false);
    expect(isValidCadenceLaw('7')).toBe(false);
    expect(isValidCadenceLaw({ freshDays: 7 })).toBe(false);
    expect(isValidCadenceLaw({ freshDays: 0, windowDays: 30 })).toBe(false);
    expect(isValidCadenceLaw({ freshDays: 15, windowDays: 30 })).toBe(false);
    expect(isValidCadenceLaw({ freshDays: 7, windowDays: 13 })).toBe(false);
    expect(isValidCadenceLaw({ freshDays: 7, windowDays: 91 })).toBe(false);
    expect(isValidCadenceLaw({ freshDays: 7.5, windowDays: 30 })).toBe(false);
    expect(isValidCadenceLaw({ freshDays: 30, windowDays: 30 })).toBe(false);
    expect(isValidCadenceLaw({ freshDays: 31, windowDays: 30 })).toBe(false);
  });
});

// ── THE LAW WIRE ─────────────────────────────────────────────────────────

describe('the law wire (GET/PUT /api/org/cadence)', () => {
  it('GET is manager-plus, PUT is owner-or-above (the writer law)', () => {
    expect(lawWire).toContain('export const GET = withErrorBoundary(');
    expect(lawWire).toContain('withSessionAuth(getHandler, MANAGER_PLUS_ROLES)');
    expect(lawWire).toContain('withSessionAuth(putHandler, OWNER_ROLES)');
  });

  it('the pair law rejects the body whole (400, the bands named in the error)', () => {
    expect(lawWire).toContain('isValidCadenceLaw(candidate)');
    expect(lawWire).toContain('freshDays < windowDays');
    expect(lawWire).toContain('{ status: 400 }');
  });

  it('the audit law lands every write in the tamper-evident trail', () => {
    expect(lawWire).toContain("action: 'CONFIG_CHANGE'");
    expect(lawWire).toContain("resourceType: 'SystemConfig'");
    expect(lawWire).toContain("resourceId: 'cadence'");
    expect(lawWire).toContain('oldValues: { freshDays: previous.freshDays, windowDays: previous.windowDays }');
    expect(lawWire).toContain('newValues: { freshDays: law.freshDays, windowDays: law.windowDays }');
  });

  it('the write is an upsert pair (one key each, create and update speak)', () => {
    expect(lawWire.match(/systemConfig\.upsert/g)?.length).toBe(1);
    expect(lawWire).toContain('upsertLawKey(CADENCE_LAW_KEYS.freshDays, String(law.freshDays))');
    expect(lawWire).toContain('upsertLawKey(CADENCE_LAW_KEYS.windowDays, String(law.windowDays))');
  });
});

// ── THE WIRES OBEY ───────────────────────────────────────────────────────

describe('the wires obey the law (kpi-summary + the teeth)', () => {
  it('the kpi wire reads the law once and the duplicated constant is gone', () => {
    expect(kpi).toContain("import { readCadenceLaw } from '@/lib/cadence-law';");
    expect(kpi).toContain('const cadenceLaw = await readCadenceLaw(rawDb);');
    expect(kpi).not.toContain('const CADENCE_FRESH_DAYS = 7;');
  });

  it('the law\u2019s window governs the window read (the whole family moves together)', () => {
    expect(kpi).toContain('const windowStart = new Date(now.getTime() - cadenceLaw.windowDays * DAY_MS);');
    expect(kpi).not.toContain('- 30 * DAY_MS');
  });

  it('the cadence payload rides the law\u2019s own pair (additive window30d.windowDays)', () => {
    expect(kpi).toContain('windowDays: cadenceLaw.windowDays,');
    expect(kpi).toContain('freshDays: cadenceLaw.freshDays,');
    expect(kpi).toContain('windowDays: cadenceLaw.windowDays,');
  });

  it('the teeth read the same law (the branch picker speaks the stored pair)', () => {
    expect(teeth).toContain("import { readCadenceLaw } from '@/lib/cadence-law';");
    expect(teeth).toContain('const law = await readCadenceLaw(db);');
    expect(teeth).toContain('const windowStart = new Date(now.getTime() - law.windowDays * CADENCE_DAY_MS);');
    expect(teeth).toContain('freshDays: law.freshDays,');
    expect(teeth).toContain('windowDays: law.windowDays,');
    expect(teeth).not.toContain('const CADENCE_FRESH_DAYS = 7;');
    expect(teeth).not.toContain('const CADENCE_WINDOW_DAYS = 30;');
  });
});

// ── THE LAW'S FACE ───────────────────────────────────────────────────────

describe('the law\u2019s face (the map names the pair, the governor holds the pen)', () => {
  it('the props grow the governor, the refetch, and the toast (all optional)', () => {
    expect(map).toContain('canGovern = false');
    expect(map).toContain('onLawSaved');
    expect(map).toContain('onToast');
  });

  it('the law line names the pair from the wire\u2019s own numbers (named for EVERY reader)', () => {
    expect(map).toContain('data-testid="cadence-law-line"');
    expect(map).toContain('the law: fresh \u2264 {cadence.freshDays}d \u00b7 window {cadence.windowDays}d');
    expect(map).toContain('{canGovern && lawEditing ? (');
  });

  it('the pen rides only for the governor (the face-before-control law)', () => {
    expect(map).toContain('data-testid="cadence-law-pen"');
    expect(map).toContain('{canGovern && (');
    expect(map).toContain('aria-label={`edit the walk\\u2019s law');
  });

  it('the editor mirrors the bands before the round trip (1\u201314 fresh, 14\u201390 window, fresh below window)', () => {
    expect(map).toContain('data-testid="cadence-law-editor"');
    expect(map).toContain('data-testid="cadence-law-input-fresh"');
    expect(map).toContain('data-testid="cadence-law-input-window"');
    expect(map).toContain('data-testid="cadence-law-save"');
    expect(map).toContain('data-testid="cadence-law-cancel"');
    expect(map).toContain('fresh days must be a whole number between 1 and 14.');
    expect(map).toContain('window days must be a whole number between 14 and 90.');
    expect(map).toContain('the fresh boundary must sit inside the window');
  });

  it('the wire\u2019s 400 speaks into the error line verbatim (role=alert)', () => {
    expect(map).toContain('data-testid="cadence-law-error"');
    expect(map).toContain('role="alert"');
    expect(map).toContain("setLawError(j?.error ?? 'the law wire refused the write \u2014 try again.')");
  });

  it('a written law toasts the pair and asks the page for the refetch', () => {
    expect(map).toContain("onToast?.(`the walk's law is written \u2014 fresh \u2264 ${j.data.freshDays}d \u00b7 window ${j.data.windowDays}d`)");
    expect(map).toContain('onLawSaved?.()');
    expect(page).toContain('onLawSaved={load}');
    expect(page).toContain('onToast={onToast}');
    expect(page).toContain("canGovern={session?.role === 'SUPER_ADMIN' || session?.role === 'STORE_OWNER'}");
  });

  it('the law\u2019s glass is the Scale glyph, aria-hidden (decorative, one family)', () => {
    expect(map).toContain("import { ClipboardCheck, ChevronDown, ChevronRight, DoorOpen, Download, History, Scale, X } from 'lucide-react';");
    expect(map.match(/<Scale className="[^"]*" aria-hidden="true" \/>/g)?.length).toBeGreaterThanOrEqual(2);
  });

  it('the editor rides the tile house (amber focus, emerald save, muted cancel, dark halves)', () => {
    expect(map).toContain('focus:ring-amber-400/40');
    expect(map).toContain('border-emerald-200 bg-emerald-50');
    expect(map).toContain('dark:border-emerald-500/30 dark:bg-emerald-500/10');
    expect(map).toContain('disabled:cursor-not-allowed disabled:opacity-60');
  });
});

// ── THE WINDOW SPEAKS ITS NUMBER ─────────────────────────────────────────

describe('the window speaks its number (no hardcoded 30 on the map\u2019s labels)', () => {
  it('the window number falls back honestly (an older cached answer keeps yesterday\u2019s 30)', () => {
    expect(map).toContain('const lawWindowDays = block?.window30d?.windowDays ?? 30;');
  });

  it('the window row\u2019s tiles say the law\u2019s own days', () => {
    expect(map).toContain('Closed \u00b7 {lawWindowDays}d');
    expect(map).toContain('Net variance \u00b7 {lawWindowDays}d');
    expect(map).toContain('Ledger impact \u00b7 {lawWindowDays}d');
    expect(map).toContain('Heard \u00b7 {lawWindowDays}d');
    expect(map).not.toContain('Closed \u00b7 30d');
    expect(map).not.toContain('Heard \u00b7 30d');
  });

  it('the coverage, the roster note, and the cadence notes say the law\u2019s own number', () => {
    expect(map).toContain('heard in the ${lawWindowDays}-day window)');
    expect(map).toContain('aisles the {lawWindowDays}-day window heard.');
    expect(map).toContain('every closed sheet in {lawWindowDays} days');
    expect(map).toContain('the same {cadence.windowDays}-day window the map speaks');
    expect(map).toContain('Math.min(c.daysSince, cadence.windowDays) / cadence.windowDays');
  });

  it('the type is additive + optional (an older cached answer never crashes)', () => {
    const primitives = read('src/components/org/primitives.tsx');
    expect(primitives).toContain('window30d: { windowDays?: number;');
  });
});
