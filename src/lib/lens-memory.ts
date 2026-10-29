// ============================================================================
// MBUMAH HARDWARE POS — the lens remembered (v2.263.0)
// ============================================================================
// THE ROSTER-MEMORY CANDIDATE, DEFINED AT LAST (queued undefined since
// the early rounds — this file is its definition, and the arc's own
// law decides the shape): a face's narrowing instruments — the band
// house and the metric kind — remember their press across navigation
// within the session. The reader returns and the lens is exactly as it
// was left: pressed where it was pressed, silent where it was silent.
//
// THE NEEDLE NEVER RIDES: a needle is a moment's question, not a
// stance — restoring a stale search would narrow rows behind the
// reader's back. The memory holds the LENSES only, and standing a lens
// down IS forgetting (the lift writes through like any other press).
//
// THE SHAPE: one envelope per surface ({ band, metric }), kept in
// sessionStorage — the memory lives as long as the tab does, never
// crosses tabs, never outlives the visit. THE GUARDS: the reads are
// SSR-safe (no window answers null) and shape-checked (an envelope
// that is not the shape answers null — the type check, never an
// assumption); the writes swallow a full quota (a memory that cannot
// be written is a face that simply forgets — never a crash).
//
// THE MEMBERSHIP LAW: the envelope carries strings, but only the FACE
// knows its own members — the applying side validates the values
// against the face's own houses and kinds before pressing them (a
// memory from an older shape presses nothing it cannot name).

export interface LensMemory {
  band: string;
  metric: string;
}

const envelope = (raw: unknown): LensMemory | null => {
  if (typeof raw !== 'object' || raw == null) return null;
  const r = raw as Record<string, unknown>;
  if (typeof r.band !== 'string' || typeof r.metric !== 'string') return null;
  return { band: r.band, metric: r.metric };
};

/** The face's remembered lenses — null when there is nothing honest to
 * restore (no window, no entry, an unparseable or foreign envelope). */
export function readLensMemory(key: string): LensMemory | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.sessionStorage.getItem(key);
    if (raw == null) return null;
    return envelope(JSON.parse(raw));
  } catch {
    return null;
  }
}

/** The face's press, remembered — a storage that refuses (full quota,
 * hostile mode) makes the face forget, never crash. */
export function writeLensMemory(key: string, memory: LensMemory): void {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.setItem(key, JSON.stringify(memory));
  } catch {
    // the honest absence — a memory that cannot be written is not a
    // failure the reader needs to hear about
  }
}
