import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { JUMP_DOORS, type ChangelogJumpVia } from '@/components/org/chrome';
import { Megaphone, Terminal } from 'lucide-react';

/**
 * v2.406.0 contracts — the jump names its door.
 *
 * Gap: the changelog's orange pill said "via cmd+K" no matter which door
 * had jumped. Since v2.404.0 the announcement's own handle jumps too (all
 * three mounts), so the pill lied every time the archive opened from the
 * announcement. And a jumped entry's ring is the TARGET's memory — the
 * ROUTE deserved its own honest voice.
 *
 * Covered here:
 *  1. JUMP_DOORS — one pure map (the env-doctor / branch-shares
 *     precedent) speaking each door's honest label + icon, total over
 *     ChangelogJumpVia (compile-time: a new door cannot skip its voice).
 *  2. The absent-control law: the pill renders ONLY when `focused && via`
 *     — a jumpTo without a known door births no pill, never a guess.
 *  3. The lie is gone: 'via cmd+K' appears exactly once in chrome.tsx
 *     (inside the map), the pill composes icon + label from the map.
 *  4. The wiring: the palette door sets 'palette' (the console page's
 *     CommandPalette is the only palette mount), the announcement doors
 *     set 'announcement' (all three mounts), every close resets BOTH
 *     jump state slots, the footer doors from the top reset both too.
 *  5. The styling: the pill's soft entrance (animate-in family), the
 *     muted entry cards' hover affordance, the expand button's mono
 *     count — the archive reads like a ledger, not a wall.
 *  6. The elders keep their pins: the ring + landing glow stay
 *     door-agnostic, the 'via cmd+K' wording survives (as the palette
 *     door's voice), the jump-pill testid unchanged.
 */

const readRepo = (rel: string) => readFileSync(join(process.cwd(), rel), 'utf8');
const DOORS = readRepo('src/components/org/chrome.tsx');
const CONSOLE_PAGE = readRepo('src/app/(shell)/console/page.tsx');
const MAIN_APP = readRepo('src/components/app/main-app.tsx');
const ORG_CONSOLE = readRepo('src/components/workspace/org-console.tsx');

// ── 1. The doors' honest voices ─────────────────────────────────────────────

describe('JUMP_DOORS - one pure map, one voice per door', () => {
  it('speaks both doors with their own label and icon', () => {
    expect(JUMP_DOORS.palette.label).toBe('via cmd+K');
    expect(JUMP_DOORS.announcement.label).toBe('via the announcement');
    expect(JUMP_DOORS.palette.Icon).toBe(Terminal);
    expect(JUMP_DOORS.announcement.Icon).toBe(Megaphone);
  });

  it('is total over ChangelogJumpVia (a new door cannot skip its voice)', () => {
    const total: Record<ChangelogJumpVia, { label: string; Icon: unknown }> = JUMP_DOORS;
    expect(Object.keys(total).sort()).toEqual(['announcement', 'palette']);
  });
});

// ── 2. The absent-control law ───────────────────────────────────────────────

describe('the pill renders only when the door is known', () => {
  it('guards on focused AND via — a jumpTo without a door births no pill', () => {
    expect(DOORS).toContain('{focused && via && <JumpDoorPill via={via} />}');
  });

  it('the ring + landing glow stay door-agnostic (the target, not the route)', () => {
    expect(DOORS).toContain("focused ? ' ring-2 ring-orange-400 ring-offset-2 ring-offset-white dark:ring-offset-slate-900 changelog-landing' : ''");
  });

  it('the pill composes icon + label from the map, never inline bytes', () => {
    expect(DOORS).toContain('<door.Icon className="h-2.5 w-2.5" aria-hidden /> {door.label}');
    expect(DOORS).toContain('const door = JUMP_DOORS[via];');
  });

  it('the old inline lie is gone — the quoted label lives exactly once (the map)', () => {
    // the comment trail may speak the wording in prose; the STRING LITERAL
    // (what the pill can actually render) lives only in the map
    expect(DOORS.match(/'via cmd\+K'/g)?.length).toBe(1);
    expect(DOORS).toContain("label: 'via cmd+K'");
  });
});

// ── 3. The wiring ───────────────────────────────────────────────────────────

describe('the doors wire their names', () => {
  it('the palette door (the console page is the only palette mount) sets palette', () => {
    expect(CONSOLE_PAGE).toContain("onJumpToRelease={(v) => { setReleaseJump(v); setJumpVia('palette'); setChangelogOpen(true); }}");
    expect(MAIN_APP).not.toContain('onJumpToRelease');
    expect(ORG_CONSOLE).not.toContain('onJumpToRelease');
  });

  it('all three announcement hands set announcement', () => {
    const hand = "onOpenChangelog={() => { setReleaseJump(APP_VERSION); setJumpVia('announcement'); setChangelogOpen(true); }}";
    expect(CONSOLE_PAGE).toContain(hand);
    expect(MAIN_APP).toContain(hand);
    expect(ORG_CONSOLE).toContain(hand);
  });

  it('every mount passes jumpVia and resets BOTH slots on close', () => {
    const reset = 'if (!o) { setReleaseJump(null); setJumpVia(null); }';
    expect(CONSOLE_PAGE).toContain('jumpVia={jumpVia}');
    expect(MAIN_APP).toContain('jumpVia={jumpVia}');
    expect(ORG_CONSOLE).toContain('jumpVia={jumpVia}');
    expect(CONSOLE_PAGE).toContain(reset);
    expect(MAIN_APP).toContain(reset);
    expect(ORG_CONSOLE).toContain(reset);
  });

  it('the footer doors from the top reset both slots (no stale pill)', () => {
    expect(MAIN_APP).toContain('onClick={() => { setReleaseJump(null); setJumpVia(null); setChangelogOpen(true); }}');
    expect(ORG_CONSOLE).toContain('onClick={() => { setReleaseJump(null); setJumpVia(null); setChangelogOpen(true); }}');
  });

  it('the modal threads the door to every entry', () => {
    expect(DOORS).toContain('focused={jumpTo === latest.version} via={jumpVia}');
    expect(DOORS).toContain('focused={jumpTo === entry.version} via={jumpVia}');
  });
});

// ── 4. The styling ──────────────────────────────────────────────────────────

describe('the archive reads like a ledger', () => {
  it('the pill enters with the soft animate-in family', () => {
    expect(DOORS).toContain('animate-in items-center gap-1 rounded-full border border-orange-300');
    expect(DOORS).toContain('duration-300 fade-in slide-in-from-bottom-1');
  });

  it('the muted entry cards answer the hover (the latest keeps its emerald ground)', () => {
    expect(DOORS).toContain("'rounded-xl border border-slate-200 bg-slate-50/50 p-3 transition-colors hover:border-slate-300 dark:border-slate-800 dark:bg-slate-800/30 dark:hover:border-slate-700'");
  });

  it('the expand button speaks its count in the mono family', () => {
    expect(DOORS).toContain('Show <span className="font-mono">{hiddenCount}</span> older release');
  });
});

// ── 5. The elders keep their pins ───────────────────────────────────────────

describe('the elders keep their pins', () => {
  it('the jump-pill testid and the Megaphone import stand', () => {
    expect(DOORS).toContain('data-testid="changelog-jump-pill"');
    expect(DOORS).toMatch(/import \{ [^}]*\bMegaphone\b[^}]*\} from 'lucide-react';/);
  });

  it('the type rides the chrome export (the call sites import it by name)', () => {
    expect(CONSOLE_PAGE).toContain("type ChangelogJumpVia, type SessionUser } from '@/components/org/chrome'");
    expect(MAIN_APP).toContain("import { ChangelogModal, type ChangelogJumpVia } from '@/components/org/chrome'");
    expect(ORG_CONSOLE).toContain("import { ChangelogModal, type ChangelogJumpVia } from '@/components/org/chrome'");
  });
});
