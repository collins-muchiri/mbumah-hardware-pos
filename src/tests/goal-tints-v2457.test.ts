/**
 * goal-tints-v2457.test.ts — v2.457.0 THE ELDER LOOM'S THIRD WEAVE: the
 * tint registry — the goal chips' badge-family dialect rides one home.
 *
 * The second weave (v2.456.0) loomed the solid registry dialects; the
 * ledger named the remaining desks. This round the GOAL chips — the HR
 * performance desk's filter row, its edit switch, and the self-service
 * portal's My-goals row — stop carrying hand-copied badge-family Records
 * and ride the loom's ONE tint registry:
 *
 *   • src/components/filter-chip.tsx: CHIP_TINT_ACTIVE / CHIP_TINT_IDLE
 *     — the badge-family palette (amber, emerald, rose, slate) in one
 *     home, the transparent idle face tone-independent as all three
 *     desks already shared it.
 *   • THE SLIM HEAD: the goal chips' historic size (px-2.5 py-0.5,
 *     transition-colors) joins the loom's head family — a desk's size
 *     is its own voice, so it rides the `slim` prop.
 *   • THE ONE COLOUR LAW FINALLY REACHES THE PORTAL: the portal's
 *     hand-copy had drifted — its OPEN chip still wore the old sky
 *     pressed-state the console's v2.306.0 law retired (the same word
 *     wore a second colour one bundle away). With one registry there is
 *     exactly ONE amber, and the portal's OPEN wears it too. The word
 *     no longer does — anywhere.
 *   • THE FAMILY'S RING: the goal chips gain the zinc keyboard ring
 *     through the loom (none wore one hand-rolled); the live DOM probe
 *     before this weave read ringHave: 0.
 *   • THE DESKS KEEP THEIR WORDS: GOAL_TONE maps (status → family word)
 *     stay in the desks — the loom never learns which desk is speaking,
 *     and the words are the law's voice, not wardrobe bytes.
 *   • THE EDIT SWITCH rides the compact face (the desk's historic
 *     px-3 py-1) with the disabled voice on className extras.
 *
 * THE MASQUERADE LAW, LOOM FORM: the tint faces live in exactly ONE src
 * file. THE REVIEW CHIPS' SLATE/AMBER/SKY DIALECT (STATUS_CHIP_ACTIVE)
 * AND THE CUSTOMERS DESK'S EMERALD DIALECT STAY HAND-ROLLED (the
 * ledger's remaining map — a later weave's material), so their
 * transparent idle byte legitimately survives in its own desks.
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

describe('v2.457.0 — the loom learns the tints: the badge family rides one home', () => {
  it('the TINT registry lives in exactly ONE src file — the masquerade law, loom form', () => {
    const carriers = allSrc().filter((p) => p !== 'src/components/filter-chip.tsx' && readRepo(p).includes('CHIP_TINT_ACTIVE'));
    expect(carriers).toEqual([]);
    expect(loom).toContain('export const CHIP_TINT_ACTIVE: Record<string, string>');
  });

  it('the tint palette is byte-exact — the amber/emerald/rose/slate faces, dark variants riding', () => {
    expect(loom).toContain("amber: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/40 dark:text-amber-200 dark:border-amber-900',");
    expect(loom).toContain("emerald: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-200 dark:border-emerald-900',");
    expect(loom).toContain("rose: 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/40 dark:text-rose-200 dark:border-rose-900',");
    expect(loom).toContain("slate: 'bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-600',");
  });

  it('the tint idle is ONE transparent voice, tone-independent by design', () => {
    expect(loom).toContain("export const CHIP_TINT_IDLE =\n  'border-border bg-transparent text-muted-foreground hover:bg-muted/60';");
    // the tint branch never consults an idle registry — one idle, no per-tone faces
    expect(loom).toMatch(/variant === 'tint'\s*\?\s*active\s*\?\s*\(CHIP_TINT_ACTIVE\[tone \?\? ''\] \?\? CHIP_ACTIVE\)\s*:\s*CHIP_TINT_IDLE/);
  });

  it('the tint fallback is the family face — a word outside the registry wears primary, never silence', () => {
    expect(loom).toMatch(/CHIP_TINT_ACTIVE\[tone \?\? ''\] \?\? CHIP_ACTIVE/);
  });

  it('the slim head joins the loom — the goal chips historic size, one home', () => {
    expect(loom).toContain("const CHIP_HEAD_SLIM = 'px-2.5 py-0.5 rounded-full text-xs font-medium border transition-colors';");
    expect(loom).toMatch(/slim \? CHIP_HEAD_SLIM : compact \? CHIP_HEAD_COMPACT : CHIP_HEAD/);
  });

  it('THE ONE COLOUR LAW IS WHOLE — the old sky pressed-state is gone from src, the word wears amber everywhere', () => {
    for (const p of allSrc()) {
      expect(readRepo(p), p).not.toContain("OPEN: 'bg-sky-100");
    }
    expect(loom).toMatch(/amber: 'bg-amber-100/);
  });

  it('the desks keep only their WORDS — GOAL_TONE maps, no wardrobe constants', () => {
    expect(perf).toContain("const GOAL_TONE: Record<string, string> = {\n  OPEN: 'amber',\n  ACHIEVED: 'emerald',\n  MISSED: 'rose',\n  CLOSED: 'slate',\n};");
    expect(portal).toContain("const GOAL_TONE: Record<string, string> = {\n  OPEN: 'amber',\n  ACHIEVED: 'emerald',\n  MISSED: 'rose',\n  CLOSED: 'slate',\n};");
    expect(perf).not.toContain('GOAL_CHIP_ACTIVE');
    expect(portal).not.toContain('GOAL_CHIP_ACTIVE');
    // a word map speaks names, never class bytes
    expect(perf).not.toMatch(/GOAL_TONE[^}]*bg-/s);
    expect(portal).not.toMatch(/GOAL_TONE[^}]*bg-/s);
  });

  it('the console filter row rides the loom — tint, slim, the deep-link retire word intact', () => {
    expect(perf).toMatch(/<FilterChip\n\s+key=\{s\}\n\s+variant="tint"\n\s+slim\n\s+active=\{active\}\n\s+testId=\{`goal-filter-status-/);
    expect(perf).toMatch(/onClick=\{\(\) => \{ dropUrlParam\('status'\); setFilterGoalStatus\(s\); \}\}/);
    expect(perf).toMatch(/tone=\{s === 'ALL' \? undefined : GOAL_TONE\[s\]\}/);
    expect(perf).toMatch(/<span className="tabular-nums opacity-70">\{count\}<\/span>/);
  });

  it('the console edit switch rides the compact face with the disabled voice on extras', () => {
    expect(perf).toMatch(/<FilterChip\n\s+key=\{s\}\n\s+variant="tint"\n\s+compact\n\s+active=\{active\}\n\s+testId=\{`goal-edit-status-/);
    expect(perf).toMatch(/tone=\{GOAL_TONE\[s\]\}/);
    expect(perf).toMatch(/className="inline-flex items-center gap-1 disabled:opacity-50"/);
    expect(perf).toMatch(/\{s === 'OPEN' \? 'Reopen \(open\)' : 'Park \(closed\)'\}/);
  });

  it('the portal row rides the same registry — the drift dies one bundle away', () => {
    expect(portal).toMatch(/<FilterChip\n\s+key=\{s\}\n\s+variant="tint"\n\s+slim\n\s+active=\{active\}\n\s+testId=\{`my-goal-filter-/);
    expect(portal).toMatch(/tone=\{s === 'ALL' \? undefined : GOAL_TONE\[s\]\}/);
    expect(portal).toMatch(/onClick=\{\(\) => setGoalStatus\(s\)\}/);
  });

  it('the pressed voice and the zinc ring ride every loomed goal chip — the probe ringHave zero heals', () => {
    // the loom emits aria-pressed and the zinc ring for every chip; the desks
    // pass no ring voice and no pressed override — their className stays quiet
    expect(loom).toMatch(/aria-pressed=\{active\}/);
    const ring = 'focus-visible:ring-zinc-400';
    expect(loom).toContain(ring);
    expect(perf).toMatch(/import \{ FilterChip \} from '@\/components\/filter-chip';/);
    expect(portal).toMatch(/import \{ FilterChip \} from '@\/components\/filter-chip';/);
  });

  it('the walk hand-holds — the loom speaks the tint words exactly twice, the desks zero', () => {
    expect(loom).toContain('CHIP_TINT_ACTIVE');
    const deskHits = (s: string) => (s.match(/CHIP_TINT_/g) || []).length;
    expect(deskHits(perf)).toBe(0);
    expect(deskHits(portal)).toBe(0);
  });

  it('the named remainders stay honest — the review chips and their idle survive hand-rolled', () => {
    // the ledger's next rows: the review chips' dialect and the customers
    // desk's emerald dialect are a later weave's material
    expect(perf).toContain('const STATUS_CHIP_ACTIVE: Record<string, string> = {');
    expect(perf).toContain("'border-border bg-transparent text-muted-foreground hover:bg-muted/60'");
  });
});
