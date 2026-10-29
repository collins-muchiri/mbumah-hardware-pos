// v2.265.0 — the console hears the release.
//
//   - THE LIVE-PROVEN GAP: the shared WhatsNewDialog mounts on every
//     surface whose shell wears MainApp (the home tabs shell, the branch
//     workspaces) — but the org console's own face never mounted it. An
//     E2E walk proved it live: with the shared seen flag cleared (a fresh
//     release arriving), /console mounted with NO announcement — the
//     console's reader alone never heard the release voice, while its
//     release ARCHIVE (the footer pill, the palette inbox, the modal)
//     sat fully built beside the silence.
//   - THE ONE HOME, WORN: the console mounts the SAME shared dialog —
//     never a copy, the same seen-flag law, the same SSR gate.
//   - THE HAND (additive, optional): the dialog grows
//     `onOpenChangelog?: () => void`. When the host owns its own release
//     archive, the footer grows "Open the release archive" — the
//     announcement dismisses FIRST (the shared flag writes, so the pill
//     and the inbox read "read" the moment the archive opens) and the
//     host lands the reader on the announced release. ABSENT, the
//     dialog renders byte-identical to every earlier round — the GitHub
//     link stands alone, every existing mount unchanged.
//   - THE LANDING: the console's hand reuses its own v2.73.0
//     jump-to-release target — the archive opens scrolled to the
//     version the announcement named (the archive opens where the
//     announcement began).

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it, expect } from 'vitest';
import { APP_VERSION } from '@/lib/version';
import { WHATS_NEW } from '@/lib/whats-new';

const read = (p: string) => readFileSync(join(process.cwd(), p), 'utf8');

const dialog = read('src/components/whats-new-dialog.tsx');
const consolePage = read('src/app/(shell)/console/page.tsx');
const mainApp = read('src/components/app/main-app.tsx');

describe('the announcement\u2019s hand (v2.265.0)', () => {
  it('the optional hand \u2014 additive in the signature, absent renders as before', () => {
    expect(dialog).toContain('export function WhatsNewDialog({ onOpenChangelog }: { onOpenChangelog?: () => void } = {}) {');
    expect(dialog).toContain("import { ExternalLink, ScrollText, Sparkles } from 'lucide-react';");
    // the hand's law is written where the reader can read it
    expect(dialog).toContain('THE CONSOLE HEARS THE RELEASE');
    // the SSR gate + the seen-flag law untouched beneath the growth
    expect(dialog).toContain('const mounted = useSyncExternalStore(');
    expect(dialog).toContain("localStorage.setItem(SEEN_VERSION_KEY, APP_VERSION);");
    expect(dialog).toContain("localStorage.getItem(SEEN_VERSION_KEY) !== APP_VERSION");
  });

  it('the archive button \u2014 the testid, the honest title, the dismiss-FIRST order', () => {
    expect(dialog).toContain('data-testid="whats-new-open-archive"');
    expect(dialog).toContain("the release archive \u2014 every version's notes, this one already found");
    expect(dialog).toContain('Open the release archive');
    // the order IS the law: the flag writes before the host's archive opens
    expect(dialog).toContain('{ dismiss(); onOpenChangelog(); }');
    // the hand renders conditionally \u2014 absent, byte-identical
    expect(dialog).toContain('{onOpenChangelog ? (');
    // the GitHub link + Got it stand unchanged beside the growth
    expect(dialog).toContain('View changelog on GitHub');
    expect(dialog).toContain('>\n            Got it\n          </Button>');
  });

  it('RUNTIME \u2014 the announcement names a release the feed knows', () => {
    // the hand lands on APP_VERSION; the archive can only scroll to a
    // version the feed carries \u2014 the two one-homes must agree
    expect(WHATS_NEW.length).toBeGreaterThan(0);
    expect(WHATS_NEW[0].version).toBe(APP_VERSION);
  });
});

describe('the console wears the voice (v2.265.0)', () => {
  it('the console\u2019s bytes \u2014 the import, the mount, the hand', () => {
    expect(consolePage).toContain("import { WhatsNewDialog } from '@/components/whats-new-dialog';");
    expect(consolePage).toContain("import { APP_VERSION } from '@/lib/version';");
    expect(consolePage).toContain('<WhatsNewDialog onOpenChangelog={() => { setReleaseJump(APP_VERSION); setChangelogOpen(true); }} />');
    expect(consolePage).toContain('THE CONSOLE HEARS THE RELEASE');
  });

  it('the mount sits with the overlays \u2014 after the login dialog, beside the archive', () => {
    const loginIdx = consolePage.indexOf('<LoginDialog open={loginOpen}');
    const dialogIdx = consolePage.indexOf('<WhatsNewDialog onOpenChangelog=');
    const modalIdx = consolePage.indexOf('<ChangelogModal open={changelogOpen}');
    expect(loginIdx).toBeGreaterThan(-1);
    expect(dialogIdx).toBeGreaterThan(loginIdx);
    expect(modalIdx).toBeGreaterThan(-1);
    expect(modalIdx).toBeLessThan(dialogIdx);
  });

  it('the shell\u2019s own mount stays bare \u2014 one home, two surfaces, zero props there', () => {
    expect(mainApp).toContain('<WhatsNewDialog />');
    expect((mainApp.match(/<WhatsNewDialog/g) || []).length).toBe(1);
  });

  it('the ancestors untouched \u2014 the archive\u2019s own voices on the console', () => {
    // the footer pill + the palette inbox + the modal pre-date the voice
    expect(consolePage).toContain('<ChangelogModal open={changelogOpen}');
    expect(consolePage).toContain("onJumpToRelease={(v) => { setReleaseJump(v); setChangelogOpen(true); }}");
  });
});
