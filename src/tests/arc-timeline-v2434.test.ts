import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

import { arcWordFace, RELEASE_ARC, releaseArcWord } from '@/lib/release-arc';
import { WHATS_NEW } from '@/lib/whats-new';

/**
 * arc-timeline-v2434 — the archive reads its own timeline (THE ARC'S
 * FIFTEENTH WORD). The release changelog's story list wears the arc's own
 * timeline: every word of the supplier-maker arc carries its release day
 * beside its line, exactly as the tags record them, and a version outside
 * the arc wears no chip at all (the absent-control law).
 *
 * THE PIN SHAPE: the arc is SEALED data — the versions pinned here are the
 * arc's own words (v2.420.0 and older stay forever below the walk's
 * treadmill), and the newest word is pinned by its ordinal and day, never
 * by a living version literal the version web could re-key.
 */

const readRepo = (rel: string) => readFileSync(join(process.cwd(), rel), 'utf8');
const CHROME = readRepo('src/components/org/chrome.tsx');
const ANNOUNCE = readRepo('src/components/whats-new-dialog.tsx');
const LIB = readRepo('src/lib/release-arc.ts');
const HISTORY = readRepo('src/tests/console-changelog.test.ts');

const parseVersion = (v: string) => v.split('.').map((p) => Number(p));

describe('the arc\u2019s own data — fifteen words, sealed as the tags record them', () => {
  it('carries exactly fifteen words with contiguous ordinals 1..15', () => {
    expect(RELEASE_ARC).toHaveLength(15);
    expect(RELEASE_ARC.map((w) => w.ordinal)).toEqual(
      Array.from({ length: RELEASE_ARC.length }, (_, i) => i + 1),
    );
  });

  it('walks the versions strictly forward, word by word', () => {
    for (let i = 1; i < RELEASE_ARC.length; i++) {
      const prev = parseVersion(RELEASE_ARC[i - 1].version);
      const curr = parseVersion(RELEASE_ARC[i].version);
      const cmp =
        prev[0] !== curr[0]
          ? curr[0] - prev[0]
          : prev[1] !== curr[1]
            ? curr[1] - prev[1]
            : curr[2] - prev[2];
      expect(cmp, `word ${i + 1} must be newer than word ${i}`).toBeGreaterThan(0);
    }
  });

  it('wears real ISO days that never travel back in time', () => {
    for (const word of RELEASE_ARC) {
      expect(word.date, `word ${word.ordinal}'s day must be ISO`).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(Number.isNaN(new Date(word.date).getTime()), `word ${word.ordinal}'s day must parse`).toBe(false);
    }
    for (let i = 1; i < RELEASE_ARC.length; i++) {
      expect(RELEASE_ARC[i].date >= RELEASE_ARC[i - 1].date, `word ${i + 1} cannot precede word ${i}`).toBe(true);
    }
  });

  it('never leaves the archive — every word\u2019s version lives in the feed', () => {
    for (const word of RELEASE_ARC) {
      expect(
        WHATS_NEW.some((e) => e.version === word.version),
        `word ${word.ordinal} (${word.version}) must live in WHATS_NEW`,
      ).toBe(true);
    }
  });

  it('opens on the shelf\u2019s own memory (word 1, the day the arc began)', () => {
    expect(RELEASE_ARC[0]).toMatchObject({ version: '2.420.0', ordinal: 1, date: '2026-11-06' });
  });

  it('seals the fifteenth word by its ordinal and its day, never a living literal', () => {
    const newest = RELEASE_ARC[RELEASE_ARC.length - 1];
    expect(newest.ordinal).toBe(15);
    expect(newest.date).toBe('2026-11-07');
    expect(RELEASE_ARC[RELEASE_ARC.length - 2].ordinal).toBe(14);
  });
});

describe('releaseArcWord — the lookup and the honest absence', () => {
  it('answers every arc word with the word itself', () => {
    for (const word of RELEASE_ARC) {
      expect(releaseArcWord(word.version)).toBe(word);
    }
  });

  it('reads the null outside the arc — the absent-control law', () => {
    expect(releaseArcWord('')).toBeNull();
    expect(releaseArcWord('2.419.0')).toBeNull();
    expect(releaseArcWord('word seven')).toBeNull();
    expect(releaseArcWord(' 2.420.0')).toBeNull();
    expect(releaseArcWord('2.420.0 ')).toBeNull();
  });
});

describe('arcWordFace — the short face, the words\u2019 own brevity', () => {
  it('speaks the day as MMM D with no zero padding', () => {
    expect(arcWordFace('2026-11-06')).toBe('Nov 6');
    expect(arcWordFace('2026-11-09')).toBe('Nov 9');
    expect(arcWordFace('2026-12-31')).toBe('Dec 31');
    expect(arcWordFace('2026-01-05')).toBe('Jan 5');
  });

  it('lets an unparseable day read itself — the honest fallback', () => {
    expect(arcWordFace('not-a-day')).toBe('not-a-day');
    expect(arcWordFace('2026-13-01')).toBe('2026-13-01');
    expect(arcWordFace('2026-00-10')).toBe('2026-00-10');
    expect(arcWordFace('')).toBe('');
  });
});

describe('the archive\u2019s chip — one home, the absent-control law', () => {
  it('renders the chip only under the arc\u2019s own truth', () => {
    expect(CHROME).toContain('{arcWord ? (');
    expect(CHROME).toContain('const arcWord = releaseArcWord(entry.version);');
  });

  it('wears the testid, the walk\u2019s own glyph and the amber family', () => {
    expect(CHROME).toContain('data-testid={`changelog-arc-chip-${entry.version}`}');
    expect(CHROME).toContain('<Footprints className="h-2.5 w-2.5" aria-hidden /> word {arcWord.ordinal} · {arcWordFace(arcWord.date)}');
    expect(CHROME).toContain('border-amber-300 bg-amber-50');
    expect(CHROME).toContain('dark:bg-amber-500/15 dark:text-amber-300');
  });

  it('carries the whole story in the title — word, count and the tag\u2019s day', () => {
    expect(CHROME).toContain("title={`the maker's arc — word ${arcWord.ordinal} of ${RELEASE_ARC.length}, released ${arcWord.date}`}");
  });

  it('is a single home — the chip\u2019s words never fork', () => {
    expect(CHROME.split('changelog-arc-chip').length - 1).toBe(1);
    expect(CHROME).toMatch(/import \{ [^}]*Footprints[^}]*\} from 'lucide-react'/);
  });

  it('keeps the announcement dialog bare — the archive owns the timeline', () => {
    expect(ANNOUNCE).not.toContain('changelog-arc-chip');
    expect(ANNOUNCE).not.toContain('release-arc');
  });

  it('keeps the lib the one home of the map and the two pure helpers', () => {
    expect(LIB).toContain('export const RELEASE_ARC: readonly ReleaseArcWord[]');
    expect(LIB).toContain('export function releaseArcWord');
    expect(LIB).toContain('export function arcWordFace');
    expect(LIB).toContain('ReadonlyMap<string, ReleaseArcWord>');
  });

  it('joins the cascade\u2019s history — the forty-fifth generation', () => {
    expect(HISTORY).toContain("the cascade's forty-fifth generation");
  });
});
