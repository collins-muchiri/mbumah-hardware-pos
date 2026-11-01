// v2.266.0 — the desk hears the release.
//
//   - THE LAST SILENT SURFACE: /org/dashboard (the organization desk,
//     where SUPER_ADMINs land post-login) never mounted the shared
//     WhatsNewDialog — a fresh release announced itself on every MainApp
//     surface and (since v2.265.0) on the console, but never on the desk.
//     Proven live in Task 242's E2E and re-proven at this round's
//     v2.265.0 baseline (no "What's New", no release entry, anywhere).
//   - THE ONE HOME, WORN TWICE MORE: the desk mounts the SAME shared
//     announcement and the SAME ChangelogModal (org/chrome's export — the
//     console page is its only other consumer; a shared home, never a
//     copy), with the v2.73.0 jump target as the hand's landing.
//   - THE HEADER'S DOOR: a quiet "Release notes" button beside the desk's
//     controls opens the same archive at the top — no jump (the jump is
//     the announcement's own memory, not the door's).
//   - THE HOOK-ORDER LAW: the archive state is declared with the
//     component's other states, BEFORE the denied/error/loading early
//     returns — React's hook order cannot depend on a phase.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it, expect } from 'vitest';
import { APP_VERSION } from '@/lib/version';
import { WHATS_NEW, compareWhatsNewVersions } from '@/lib/whats-new';
import { ChangelogModal } from '@/components/org/chrome';

const read = (p: string) => readFileSync(join(process.cwd(), p), 'utf8');

const orgConsole = read('src/components/workspace/org-console.tsx');
const dialog = read('src/components/whats-new-dialog.tsx');
const consolePage = read('src/app/(shell)/console/page.tsx');
const mainApp = read('src/components/app/main-app.tsx');
const chrome = read('src/components/org/chrome.tsx');

describe('the desk wears the voice (v2.266.0)', () => {
  it('the desk\u2019s bytes \u2014 the imports, the archive state, the mounts, the hand', () => {
    expect(orgConsole).toContain("import { ChangelogModal } from '@/components/org/chrome';");
    expect(orgConsole).toContain("import { WhatsNewDialog } from '@/components/whats-new-dialog';");
    expect(orgConsole).toContain("import { APP_VERSION } from '@/lib/version';");
    // the desk's own archive state (the modal's flag + the jump memory)
    expect(orgConsole).toContain('const [changelogOpen, setChangelogOpen] = useState(false);');
    expect(orgConsole).toContain('const [releaseJump, setReleaseJump] = useState<string | null>(null);');
    // the same hand the console wears \u2014 the flag writes first, then the
    // archive lands scrolled to the announced release
    expect(orgConsole).toContain('<WhatsNewDialog onOpenChangelog={() => { setReleaseJump(APP_VERSION); setChangelogOpen(true); }} />');
    expect(orgConsole).toContain('THE DESK HEARS THE RELEASE');
  });

  it('the archive modal mounts shared \u2014 the jump law and the reset law', () => {
    expect(orgConsole).toContain('<ChangelogModal');
    expect(orgConsole).toContain('jumpTo={releaseJump}');
    // closing the archive forgets the jump \u2014 the same reset the console speaks
    expect(orgConsole).toContain('onOpenChange={(o) => { setChangelogOpen(o); if (!o) setReleaseJump(null); }}');
  });

  it('the header\u2019s door \u2014 the testid, the honest title, the no-jump open', () => {
    expect(orgConsole).toContain('data-testid="org-desk-changelog-button"');
    expect(orgConsole).toContain("title=\"the release archive \u2014 every version's notes\"");
    expect(orgConsole).toContain('onClick={() => { setReleaseJump(null); setChangelogOpen(true); }}');
    expect(orgConsole).toContain('Release notes');
    // the door stands beside the desk's controls, before the chat edge
    const doorIdx = orgConsole.indexOf('data-testid="org-desk-changelog-button"');
    const chatIdx = orgConsole.indexOf('<Link href="/chat">');
    expect(doorIdx).toBeGreaterThan(-1);
    expect(chatIdx).toBeGreaterThan(doorIdx);
  });

  it('the byte-order law \u2014 expert dialog, archive modal, the voice, shell close', () => {
    const modalIdx = orgConsole.indexOf('<ChangelogModal');
    const voiceIdx = orgConsole.indexOf('<WhatsNewDialog onOpenChangelog=');
    const shellCloseIdx = orgConsole.indexOf('</UnifiedConsoleShell>');
    expect(modalIdx).toBeGreaterThan(-1);
    expect(voiceIdx).toBeGreaterThan(modalIdx);
    expect(shellCloseIdx).toBeGreaterThan(voiceIdx);
    // one home per face \u2014 exactly one announcement and one archive here
    expect((orgConsole.match(/<WhatsNewDialog/g) || []).length).toBe(1);
    expect((orgConsole.match(/<ChangelogModal/g) || []).length).toBe(1);
  });

  it('the hook-order law \u2014 the archive state precedes every early return', () => {
    const stateIdx = orgConsole.indexOf('const [releaseJump, setReleaseJump]');
    const deniedIdx = orgConsole.indexOf("if (phase === 'denied') {");
    const errorIdx = orgConsole.indexOf("if (phase === 'error') {");
    const loadingIdx = orgConsole.indexOf("if (phase === 'loading' || !summary) {");
    expect(stateIdx).toBeGreaterThan(-1);
    expect(deniedIdx).toBeGreaterThan(stateIdx);
    expect(errorIdx).toBeGreaterThan(stateIdx);
    expect(loadingIdx).toBeGreaterThan(stateIdx);
  });

  it('RUNTIME \u2014 the shared modal is org/chrome\u2019s export, and the feed agrees', () => {
    expect(typeof ChangelogModal).toBe('function');
    expect(chrome).toContain('export function ChangelogModal({ open, onOpenChange, jumpTo }: { open: boolean; onOpenChange: (o: boolean) => void; jumpTo?: string | null }) {');
    // the announcement names a release the feed knows, newest first
    expect(WHATS_NEW.length).toBeGreaterThan(1);
    expect(WHATS_NEW[0].version).toBe(APP_VERSION);
    expect(APP_VERSION).toBe('2.318.0');
    expect(compareWhatsNewVersions(WHATS_NEW[0].version, WHATS_NEW[1].version)).toBeGreaterThan(0);
  });
});

describe('the ancestors untouched (v2.266.0)', () => {
  it('the shared dialog\u2019s hand contract \u2014 the v2.265.0 bytes stand', () => {
    expect(dialog).toContain('export function WhatsNewDialog({ onOpenChangelog }: { onOpenChangelog?: () => void } = {}) {');
    expect(dialog).toContain('{ dismiss(); onOpenChangelog(); }');
    expect(dialog).toContain('{onOpenChangelog ? (');
    expect(dialog).toContain('const mounted = useSyncExternalStore(');
    expect(dialog).toContain("localStorage.getItem(SEEN_VERSION_KEY) !== APP_VERSION");
    expect(dialog).toContain("localStorage.setItem(SEEN_VERSION_KEY, APP_VERSION);");
  });

  it('the console\u2019s own voice \u2014 the v2.265.0 mount and hand unchanged', () => {
    expect(consolePage).toContain('<WhatsNewDialog onOpenChangelog={() => { setReleaseJump(APP_VERSION); setChangelogOpen(true); }} />');
    expect(consolePage).toContain('THE CONSOLE HEARS THE RELEASE');
    expect(consolePage).toContain('<ChangelogModal open={changelogOpen}');
  });

  it('the shell\u2019s bare mount \u2014 one home, zero props there', () => {
    expect(mainApp).toContain('<WhatsNewDialog />');
    expect((mainApp.match(/<WhatsNewDialog/g) || []).length).toBe(1);
  });
});
