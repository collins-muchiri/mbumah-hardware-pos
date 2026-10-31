// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseInitialTab } from '@/lib/tab-url';

/**
 * v2.313.0 — THE CAPTURE LAW: the deep link lands where it is asked.
 *
 * v2.311.0 taught the shell to keep the address bar speaking the desk,
 * but the consume re-read `window.location.search` at consume time.
 * React flushes CHILD effects before PARENT effects, so MainApp's
 * URL-sync effect replaceState'd the PERSISTED desk over the address bar
 * before (shell)/page.tsx's boot effect ever ran — and every warm
 * authenticated deep link (?tab=pos while a loyalty desk was persisted)
 * silently landed the persisted desk. The proven live shape (QA bursts,
 * 2026-11-01): within 500ms the bar answered ?tab=loyalty and the desk
 * rendered Loyalty, whatever the ask said.
 *
 * The fix: the ask is CAPTURED at first render (a useState lazy
 * initializer — runs during render, before ANY effect, child or parent)
 * and the consume reads the CAPTURE, never the live bar.
 */

const read = (p: string) => readFileSync(join(process.cwd(), p), 'utf8');
const boot = read('src/app/(shell)/page.tsx');
const TABS = ['dashboard', 'pos', 'loyalty', 'catalog'] as const;

describe('v2.313.0 — the capture law: the ask is read once, at first render', () => {
  it('the ask is captured in a lazy useState initializer, before any effect', () => {
    expect(
      boot.includes(
        "typeof window !== 'undefined' ? window.location.search : ''",
      ),
    ).toBe(true);
    // The capture is React state (per-mount fresh, SSR-guarded), not a
    // module constant that could go stale across SPA remounts.
    expect(boot.includes('const [initialSearch] = useState(() =>')).toBe(true);
  });

  it('consumeDeepLink reads the CAPTURE, never the live bar', () => {
    const consume = boot.split('const consumeDeepLink = () => {')[1]?.split('.then(consumeDeepLink')[0] ?? '';
    // The parse call inside consumeDeepLink names the capture…
    expect(consume.includes('parseInitialTab(')).toBe(true);
    expect(consume.includes('parseInitialTab(\n          initialSearch,')).toBe(true);
    // …and the parse's argument is the capture — never window.location.search.
    expect(consume.includes('parseInitialTab(\n          window.location.search')).toBe(false);
  });

  it('the capture law is documented where the next reader will trip', () => {
    // The comment names the mechanism (child effects flush first) so the
    // law is not accidentally "simplified" back into the race.
    expect(boot.includes('CHILD effects before PARENT effects')).toBe(true);
    expect(boot.includes('THE CAPTURE LAW')).toBe(true);
  });

  it('the v2.311 one-consumer law still holds (no second reader appeared)', () => {
    expect(boot.includes('.then(consumeDeepLink, consumeDeepLink)')).toBe(true);
    expect(boot.includes("sp.delete('tab')")).toBe(false);
    expect(boot.includes('sp.delete(')).toBe(false);
  });
});

describe('v2.313.0 — the captured ask still parses under the shared law', () => {
  it('a captured ask names its desk whatever the live bar says afterwards', () => {
    // The capture froze '?tab=pos'; MainApp has since rewritten the bar
    // to the persisted desk. The consume must answer the CAPTURE.
    const captured = '?tab=pos';
    expect(parseInitialTab(captured, TABS)).toBe('pos');
    expect(parseInitialTab('?tab=loyalty&view=transactions', TABS)).toBe('loyalty');
  });

  it('a captured no-ask (empty or foreign params) keeps the persisted desk', () => {
    expect(parseInitialTab('', TABS)).toBeNull();
    expect(parseInitialTab('?view=transactions', TABS)).toBeNull();
    expect(parseInitialTab('?tab=not-a-desk', TABS)).toBeNull();
  });

  it('a capture with extra params still lands the desk and the params ride', () => {
    expect(parseInitialTab('?tab=dashboard&utm_source=share', TABS)).toBe('dashboard');
    expect(parseInitialTab('?tab=POS', TABS)).toBeNull(); // case-sensitive, one voice
  });
});
