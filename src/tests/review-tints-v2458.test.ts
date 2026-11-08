/**
 * review-tints-v2458.test.ts — v2.458.0 THE ELDER LOOM'S FOURTH WEAVE:
 * sky joins the tint registry — the review chips ride one home.
 *
 * The third weave (v2.457.0) loomed the goal chips' badge-family
 * dialect; the ledger named the review chips as the next row. This
 * round the performance desk's review-status filter row — the LAST
 * hand-rolled speaker of the transparent tint idle in the desk —
 * retires its STATUS_CHIP_ACTIVE Record and rides the registry:
 *
 *   • SKY JOINS THE CLOSED REGISTRY: the ACKNOWLEDGED word wears sky
 *     family-wide already (the review table pill's own law aligned it
 *     in v2.306.0 — pool-voice's toneForStatus) — the filter row's
 *     hand-copy matched it byte-for-byte, so the move is faithful;
 *     the registry's closed shape is FIVE tones now.
 *   • THE NAMED RING LAW: the review row's keyboard ring is the
 *     deep-link family's OWN amber voice (v2.286.0) — a desk whose
 *     className carries its own named ring passes focusRing="none" so
 *     the loom emits no competing zinc ring and the amber byte rides
 *     the desk's extras, byte-preserved (the live DOM probe before the
 *     weave read amberRing: 6, zincRing: 0 — the row's ring voice was
 *     already whole; the weave changes the faces' home, never the ring).
 *   • THE DESK KEEPS ITS WORDS: STATUS_TONE (DRAFT→slate, SUBMITTED→
 *     amber, ACKNOWLEDGED→sky, CALIBRATED→emerald) stays in the desk;
 *     the ALL word passes no tone and falls to the family's primary
 *     face, exactly as the goal rows speak.
 *   • THE WHOLE DESK RIDES: with this weave every status-chip row on
 *     the performance desk speaks FilterChip variant="tint" — the goal
 *     filter row (slim), the goal edit switch (compact), and the
 *     review filter row (slim). The desk speaks no tint wardrobe byte.
 *   • THE NAMED REMAINDER IS THE CUSTOMERS DESK ALONE: the ledger's
 *     last hand-rolled tint dialect (emerald active + the white/60
 *     glassy idle + per-color count badges) is a later weave's material.
 *
 * THE WALK-SAFETY LAW: every pin below is a SEALED byte of this round's
 * own edits or an elder seat — no living version literal anywhere in it
 * (version prose lives in comments, not pins).
 * THE WORD-FREE LAW: this file names no address-bar token.
 */

import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const readRepo = (rel: string) => readFileSync(join(process.cwd(), rel), 'utf8');

const loom = readRepo('src/components/filter-chip.tsx');
const perf = readRepo('src/app/(shell)/hr/performance/page.tsx');
const portal = readRepo('src/app/(selfservice)/employees/me/goals/goals-view.tsx');
const customers = readRepo('src/app/(shell)/tabs/customers-tab.tsx');

const walkSrc = (dir: string, acc: string[]): string[] => {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) {
      walkSrc(p, acc);
    } else if (/\.(tsx?|mjs)$/.test(e.name) && !/\.test\.ts$/.test(e.name)) {
      acc.push(p);
    }
  }
  return acc;
};

const allSrc = (): string[] => walkSrc('src', []);

describe('v2.458.0 — the loom learns the tints, fourth weave: sky rides one home', () => {
  it('SKY joins the closed registry — byte-exact, the shape now five tones', () => {
    expect(loom).toContain("sky: 'bg-sky-100 text-sky-800 border-sky-300 dark:bg-sky-950/40 dark:text-sky-200 dark:border-sky-900',");
    const tones = [...loom.matchAll(/CHIP_TINT_ACTIVE[^]*?};/g)][0]?.[0] ?? '';
    expect([...tones.matchAll(/([\w]+): 'bg-/g)].map((m) => m[1])).toEqual([
      'amber',
      'emerald',
      'rose',
      'slate',
      'sky',
    ]);
  });

  it('the masquerade walk holds — the tint registry lives in exactly ONE src file', () => {
    const carriers = allSrc().filter((p) => p !== 'src/components/filter-chip.tsx' && readRepo(p).includes('CHIP_TINT_ACTIVE'));
    expect(carriers).toEqual([]);
  });

  it('STATUS_CHIP_ACTIVE retires — the desk keeps its WORDS, never wardrobe bytes', () => {
    expect(perf).not.toContain('STATUS_CHIP_ACTIVE');
    expect(perf).toContain("const STATUS_TONE: Record<string, string> = {\n  DRAFT: 'slate',\n  SUBMITTED: 'amber',\n  ACKNOWLEDGED: 'sky',\n  CALIBRATED: 'emerald',\n};");
    expect(perf).not.toMatch(/STATUS_TONE[^}]*bg-/s);
  });

  it('the review row rides the registry — tint, slim, the deep-link retire word intact', () => {
    expect(perf).toMatch(/<FilterChip\n\s+key=\{s\}\n\s+variant="tint"\n\s+slim\n\s+active=\{active\}\n\s+testId=\{`review-filter-status-/);
    expect(perf).toMatch(/onClick=\{\(\) => \{ dropUrlParam\('status'\); setFilterStatus\(s\); \}\}/);
    expect(perf).toMatch(/tone=\{s === 'ALL' \? undefined : STATUS_TONE\[s\]\}/);
    expect(perf).toMatch(/<span className="tabular-nums opacity-70">\{count\}<\/span>/);
  });

  it('THE NAMED RING LAW — the amber voice rides the desk byte-preserved, the loom emits no competing zinc', () => {
    expect(perf).toMatch(/focusRing="none"/);
    expect(perf).toMatch(/className="inline-flex items-center gap-1 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 dark:focus-visible:ring-amber-500"/);
    // the loom's escape hatch: no zinc ring is appended when the desk owns one
    expect(loom).toMatch(/focusRing === 'none' \? '' : CHIP_RING_ZINC/);
    // the review row's className speaks NO zinc — one ring colour, the desk's own
    const row = perf.slice(perf.indexOf('review-filter-status-'), perf.indexOf('review-filter-status-') + 900);
    expect(row).not.toContain('ring-zinc');
  });

  it('the transparent idle is the LOOM\'S voice now — the desk speaks no tint idle byte', () => {
    // the review chips were the last hand-rolled speaker of the
    // transparent idle in this desk; the loom owns it family-wide
    expect(perf).not.toContain("'border-border bg-transparent text-muted-foreground hover:bg-muted/60'");
    expect(loom).toContain("export const CHIP_TINT_IDLE =\n  'border-border bg-transparent text-muted-foreground hover:bg-muted/60';");
  });

  it('THE WHOLE DESK RIDES — exactly three FilterChip tint usages, one face dialect', () => {
    const uses = [...perf.matchAll(/<FilterChip\n/g)].length;
    expect(uses).toBe(3);
    expect([...perf.matchAll(/variant="tint"/g)].length).toBe(3);
    // the goal rows kept their v2.457.0 shape beside the new review row
    expect(perf).toMatch(/testId=\{`goal-filter-status-/);
    expect(perf).toMatch(/testId=\{`goal-edit-status-/);
    expect(perf).toMatch(/testId=\{`review-filter-status-/);
  });

  it('the portal rows stand untouched — the third weave\'s shape survives byte-for-byte', () => {
    expect(portal).toMatch(/<FilterChip\n\s+key=\{s\}\n\s+variant="tint"\n\s+slim/);
    expect(portal).toMatch(/testId=\{`my-goal-filter-/);
  });

  it('the acknowledged word speaks ONE sky — the filter row and the table pill align by law', () => {
    // the desk's word map and the pool voice's toneForStatus both say the
    // same thing now that the wardrobe is one home: acknowledged = sky
    expect(perf).toMatch(/ACKNOWLEDGED: 'sky'/);
    expect(loom).toMatch(/sky: 'bg-sky-100/);
  });

  it('the named remainder is TAKEN — the customers desk rides the loom (v2.459.0)', () => {
    // v2.459.0 re-anchor: the ledger's last hand-rolled tint dialect —
    // the customers desk's emerald voice — rode the loom in the fifth
    // weave: the glassy idle joined as CHIP_TINT_IDLE_GLASS, the
    // drifted active face unified to the registry byte, and the desk
    // speaks NO wardrobe byte at all. Its sealed bytes live in
    // customer-tints-v2459.test.ts.
    expect(customers).not.toContain("'bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-700'");
    expect(customers).not.toContain("'bg-white/60 text-muted-foreground border-border/50 hover:bg-white/80 dark:bg-white/5 dark:hover:bg-white/10'");
    // the loom owns both faces now — the registry's emerald and the glass
    expect(loom).toMatch(/emerald: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950\/40/);
    expect(loom).toContain('CHIP_TINT_IDLE_GLASS');
    // and no OTHER src file speaks a hand-rolled badge-family active face
    // with the registry's own byte shape (the +800/-800 amber/emerald/rose/
    // slate/sky active families live only in the loom)
    const strays = allSrc().filter((p) => {
      if (p === 'src/components/filter-chip.tsx') return false;
      return /'bg-(amber|emerald|rose|slate|sky)-100 text-\1-800 border-\1-300 dark:bg-\1-950\/40/.test(readRepo(p));
    });
    expect(strays).toEqual([]);
  });

  it('the pressed voice rides every loomed row — the desks never override it', () => {
    expect(loom).toMatch(/aria-pressed=\{active\}/);
    expect(perf).toMatch(/import \{ FilterChip \} from '@\/components\/filter-chip';/);
  });

  it('the deep-link landing chips stay hand-rolled — the deep-link family is not the tint family', () => {
    // the liftable amber clear chips (goal + review) are the deep-link
    // family's own voice — a different abstraction, untouched here
    expect(perf).toMatch(/data-testid="goal-filter-status-chip"/);
    expect(perf).toMatch(/data-testid="review-filter-status-chip"/);
  });
});
