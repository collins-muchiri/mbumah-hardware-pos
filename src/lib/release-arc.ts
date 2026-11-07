/**
 * ReleaseArc (v2.434.0) - "the archive reads its own timeline".
 *
 * The supplier-maker arc is the release lineage's longest running story:
 * fifteen rounds, one maker at a time, from v2.420.0's "the shelf remembers
 * its supplier" through this release's own timeline word. The archive's
 * entries told the words but never the days - the arc reading itself means
 * each word's entry wears its release date beside its line, exactly as the
 * release tags record them (git for-each-ref refs/tags, creatordate).
 *
 * ONE HOME: the map is data plus two pure helpers (releaseArcWord - the
 * lookup; a version outside the arc reads the null, the absent-control
 * law; arcWordFace - the short face; an unparseable day reads itself, the
 * honest fallback). The archive's chip in the changelog modal is the only
 * renderer; the announcement dialog stays bare - never a copy.
 *
 * THE ARC GROWS BY ONE WORD PER ARC ROUND: a future round that continues
 * the arc appends its own word (version, ordinal, date) here - never a
 * rewrite, the words are sealed once the tag exists.
 */

export interface ReleaseArcWord {
  /** the release version, without the leading v (the feed's own shape) */
  version: string;
  /** the word's place in the arc: 1 is v2.420.0, the shelf remembers */
  ordinal: number;
  /** the release day, exactly as the tag records it (ISO YYYY-MM-DD) */
  date: string;
}

export const RELEASE_ARC: readonly ReleaseArcWord[] = [
  { version: '2.420.0', ordinal: 1, date: '2026-11-06' },
  { version: '2.421.0', ordinal: 2, date: '2026-11-06' },
  { version: '2.422.0', ordinal: 3, date: '2026-11-06' },
  { version: '2.423.0', ordinal: 4, date: '2026-11-06' },
  { version: '2.424.0', ordinal: 5, date: '2026-11-06' },
  { version: '2.425.0', ordinal: 6, date: '2026-11-06' },
  { version: '2.426.0', ordinal: 7, date: '2026-11-06' },
  { version: '2.427.0', ordinal: 8, date: '2026-11-06' },
  { version: '2.428.0', ordinal: 9, date: '2026-11-06' },
  { version: '2.429.0', ordinal: 10, date: '2026-11-06' },
  { version: '2.430.0', ordinal: 11, date: '2026-11-07' },
  { version: '2.431.0', ordinal: 12, date: '2026-11-07' },
  { version: '2.432.0', ordinal: 13, date: '2026-11-07' },
  { version: '2.433.0', ordinal: 14, date: '2026-11-07' },
  { version: '2.434.0', ordinal: 15, date: '2026-11-07' },
];

const ARC_BY_VERSION: ReadonlyMap<string, ReleaseArcWord> = new Map(
  RELEASE_ARC.map((word) => [word.version, word]),
);

/** The word for a release version - or the null, the honest absence. */
export function releaseArcWord(version: string): ReleaseArcWord | null {
  return ARC_BY_VERSION.get(version) ?? null;
}

const ARC_MONTHS: readonly string[] = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

/**
 * The chip's short face: "Nov 6" - the words' own brevity, no zero
 * padding, the digits holding their lane. An unparseable day reads
 * itself: never an invented month, never a fake word.
 */
export function arcWordFace(date: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  const month = match ? ARC_MONTHS[Number(match[2]) - 1] : undefined;
  if (!match || !month) return date;
  return `${month} ${Number(match[3])}`;
}
