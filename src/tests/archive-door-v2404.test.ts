import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { WHATS_NEW } from '@/lib/whats-new';

/**
 * v2.404.0 contracts — the archive door reaches the main desk.
 *
 * Gap: the console has owned the release archive since v2.265.0 (the SAME
 * ChangelogModal opened by the cmd+K palette, the footer pill and the
 * whats-new announcement), but the MAIN desk's whats-new card mounted
 * WITHOUT its `onOpenChangelog` — so the "Open the release archive" button
 * simply never rendered where most people land after login. The door
 * existed; the main desk's frame had no handle.
 *
 * Covered here:
 *  1. main-app mounts the SAME ChangelogModal org-console mounts (one
 *     shared modal — exactly ONE mount in the shell) with the jump reset
 *     contract on close.
 *  2. The shell's whats-new announcement is wired to jump to THIS release
 *     (setReleaseJump(APP_VERSION)) — the same wiring org-console speaks.
 *  3. The footer's Release notes door (testid footer-release-notes) opens
 *     the SAME archive from the top — setReleaseJump(null), never a jump.
 *  4. The landing glow: a jumped entry answers with ONE soft pulse — the
 *     keyframe, the class, the focus wiring and the reduced-motion guard.
 *  5. The door's source contract: whats-new-dialog's optional
 *     onOpenChangelog + the archive testid the button rides.
 *  6. The negative guards: org-console's precedent stays intact, and the
 *     footer door never jumps (a door that lies about its landing is a
 *     copy of the announcement, not a sibling).
 *  7. The release cascade: 2.404.0 leads WHATS_NEW with the archive-door
 *     story.
 */

const readRepo = (rel: string) => readFileSync(join(process.cwd(), rel), 'utf8');

const MAIN_APP = readRepo('src/components/app/main-app.tsx');
const CHROME = readRepo('src/components/org/chrome.tsx');
const GLOBALS = readRepo('src/app/globals.css');
const DIALOG = readRepo('src/components/whats-new-dialog.tsx');
const CONSOLE = readRepo('src/components/workspace/org-console.tsx');

// ── 1. The shell mounts the SAME shared modal ───────────────────────────────

describe('main-app - the archive door on the main desk', () => {
  it('imports ChangelogModal from the one shared home (org/chrome)', () => {
    expect(MAIN_APP).toContain("import { ChangelogModal, type ChangelogJumpVia } from '@/components/org/chrome';");
  });

  it('mounts ChangelogModal exactly once (a copy would fork the archive)', () => {
    expect(MAIN_APP).toContain('open={changelogOpen}');
    expect(MAIN_APP).toContain('jumpTo={releaseJump}');
    // the reset contract: closing the modal clears the jump so a plain
    // open afterwards lands at the top, never on a stale version
    // v2.406.0: the close resets BOTH slots — the jump target AND the door
    // that jumped (a stale pill can never survive a plain open)
    expect(MAIN_APP).toContain('if (!o) { setReleaseJump(null); setJumpVia(null); }');
    const mounts = MAIN_APP.split('<ChangelogModal').length - 1;
    expect(mounts).toBe(1);
  });

  it('imports APP_VERSION beside APP_BUILD_LABEL (the jump target is the real release)', () => {
    expect(MAIN_APP).toContain("import { APP_BUILD_LABEL, APP_VERSION } from '@/lib/version';");
  });

  // ── 2. The announcement's door jumps to this release ──────────────────────

  it('wires WhatsNewDialog onOpenChangelog to jump to APP_VERSION (the console contract)', () => {
    expect(MAIN_APP).toContain(
      '<WhatsNewDialog onOpenChangelog={() => { setReleaseJump(APP_VERSION); setJumpVia(\'announcement\'); setChangelogOpen(true); }} />',
    );
    // the exact wording org-console uses — one wiring, two desks, zero drift
    expect(CONSOLE).toContain(
      '<WhatsNewDialog onOpenChangelog={() => { setReleaseJump(APP_VERSION); setJumpVia(\'announcement\'); setChangelogOpen(true); }} />',
    );
  });

  // ── 3. The footer door opens the archive from the TOP ─────────────────────

  it('mounts the footer Release notes door (testid footer-release-notes)', () => {
    expect(MAIN_APP).toContain('data-testid="footer-release-notes"');
    expect(MAIN_APP).toContain('Release notes');
  });

  it('the footer door NEVER jumps — setReleaseJump(null) lands the archive at the top', () => {
    // a door that lies about its landing is a copy of the announcement,
    // not a sibling; the door's whole point is the archive from the top
    // v2.406.0: the door also resets the door slot — the pill stays absent
    expect(MAIN_APP).toContain('onClick={() => { setReleaseJump(null); setJumpVia(null); setChangelogOpen(true); }}');
    // org-console's own header door speaks the same contract
    expect(CONSOLE).toContain('onClick={() => { setReleaseJump(null); setJumpVia(null); setChangelogOpen(true); }}');
  });

  // ── 4. The landing glow ────────────────────────────────────────────────────

  it('a focused (jumped) entry wears the changelog-landing pulse beside its ring', () => {
    expect(CHROME).toContain(
      "ring-2 ring-orange-400 ring-offset-2 ring-offset-white dark:ring-offset-slate-900 changelog-landing",
    );
  });

  it('globals.css carries the keyframe, the class and the reduced-motion guard', () => {
    expect(GLOBALS).toContain('@keyframes changelog-landing-glow');
    expect(GLOBALS).toContain('.changelog-landing {');
    // ONE pulse — 1 both (forwards), never an infinite shimmer on the archive
    expect(GLOBALS).toContain('animation: changelog-landing-glow 1.1s ease-out 1 both;');
    expect(GLOBALS).toContain('@media (prefers-reduced-motion: reduce)');
  });

  // ── 5. The door's source contract (whats-new-dialog) ──────────────────────

  it("whats-new-dialog's archive button rides its testid and the optional door prop", () => {
    expect(DIALOG).toContain('data-testid="whats-new-open-archive"');
    expect(DIALOG).toContain('onOpenChangelog?: () => void');
    // the announcement dismisses itself before opening the archive — the
    // door never leaves the card standing behind the modal
    expect(DIALOG).toContain('onClick={() => { dismiss(); onOpenChangelog(); }}');
  });

  // ── 6. The negative guards ────────────────────────────────────────────────

  it("org-console's precedent stays intact (same modal, same jump wiring)", () => {
    expect(CONSOLE).toContain('<ChangelogModal');
    expect(CONSOLE).toContain('jumpTo={releaseJump}');
    // v2.406.0: the same double reset rides the console mount
    expect(CONSOLE).toContain('if (!o) { setReleaseJump(null); setJumpVia(null); }');
  });

  it('the main shell does not grow a second footer pill of its own (one archive, two doors)', () => {
    // the door is a BUTTON beside Shortcuts — not a re-import of the
    // console's unread pill machinery (that lives in org/chrome's footer)
    expect(MAIN_APP).not.toContain('ConsoleFooter');
  });

  // ── 7. The release cascade ─────────────────────────────────────────────────

  it('WHATS_NEW leads with the current release — the door story rides the archive below', () => {
    // v2.464.0 hand-over: the lead tells the carrying story now; the
    // census’s story lives one entry down, the toast’s two, the
    // shortfall’s three, the receipt’s four, the row-maker’s five,
    // the debt’s six, the shelf-door seven, the supplier-rides
    // eight, the order-blocks nine, the supplier-lens ten, the
    // drill-mirror eleven, the expected-day twelve, the receive
    // thirteen, the order-handover fourteen, the order-file fifteen,
    // the order-list sixteen, the org-desk seventeen, the
    // census-echoes eighteen, the census-speaks nineteen, the
    // wire-answers twenty, the desk-remembers twenty-one, the
    // branch-voice twenty-two, the ghost-routes twenty-three, the
    // jump-door twenty-four, the shares’ twenty-five, the
    // archive-door story fifty-seven — all still in the feed
    const lead = WHATS_NEW[0];
    // v2.464.0 re-key (dated): the lead speaks the carrying round —
    // the clearance note rides the file (one voice, three doors),
    // the share is drawn, and the export button speaks its file.
    expect(lead.version).toBe('2.464.0');
    expect(lead.title).toContain('carry');
    expect(lead.bullets.length).toBeGreaterThanOrEqual(3);
    expect(lead.bullets.some((b) => b.includes('file'))).toBe(true);
    expect(lead.bullets.some((b) => b.includes('clearance note'))).toBe(true);
    const branchVoice = WHATS_NEW.find((e) => e.version === '2.408.0');
    expect(branchVoice?.title).toContain('branch speaks first');
    const ghost = WHATS_NEW.find((e) => e.version === '2.407.0');
    expect(ghost?.title).toContain('ghost routes wake');
    const doorJump = WHATS_NEW.find((e) => e.version === '2.406.0');
    expect(doorJump?.title).toContain('jump names its door');
    const shares = WHATS_NEW.find((e) => e.version === '2.405.0');
    expect(shares?.title).toContain('shares speak');
    const door = WHATS_NEW.find((e) => e.version === '2.404.0');
    expect(door?.title).toContain('archive door reaches the main desk');
    expect(door?.bullets.some((b) => b.includes('Open the release archive'))).toBe(true);
  });

  it('the cascade never forks the versions (lead entry matches the package)', () => {
    const pkg = JSON.parse(readRepo('package.json')) as { version: string };
    expect(WHATS_NEW[0].version).toBe(pkg.version);
    expect(whatsNewLeadMatchesPkg(WHATS_NEW[0].version, pkg.version)).toBe(true);
  });
});

function whatsNewLeadMatchesPkg(lead: string, pkg: string): boolean {
  return lead === pkg;
}
