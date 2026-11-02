// v2.350.0 — THE PARTICIPANT LIST, READ HONESTLY (the field-level casts
// census, phase 2). JSON.parse answers `unknown` — the wire's own truth —
// and only an array is a participant list. Every conversations desk used to
// launder that unknown straight into `string[]`; a non-string entry rode the
// cast into the Set and the `in`-clause downstream. This helper narrows for
// real: malformed JSON and non-arrays answer the honest empty list (every
// call site's catch block already mapped those to exactly that), and entries
// that are not strings are dropped instead of smuggled through.
export function parseParticipantIds(raw: string | null | undefined): string[] {
  if (!raw) return [];
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return [];
  }
  if (!Array.isArray(parsed)) return [];
  return parsed.filter((v): v is string => typeof v === 'string');
}
