// THE BODY DOOR (v2.325.0): one home for the honest body read in
// PUT/DELETE/PATCH handlers.
//
// THE LAW: a body-less or malformed request is a CLIENT mistake, and a
// client mistake must answer 400 with a hint — never a JSON.parse
// SyntaxError wearing a 500. v2.324.0 fixed this class for
// purchase-orders/[id] alone (its shared PUT/DELETE door); the v2.325
// sweep (`scripts/sweep-body-door.py`, the round's class census) found
// 21 more bare `await request.json()` doors across 19 routes answering
// PUT/DELETE/PATCH, and every one of them now reads through THIS door.
//
// The helper never throws: the caller owns the status code, because each
// route knows the voice its clients understand. The rejection answer is
// the house's own success/error shape, so clients already matching on
// `{ success: false, error }` need no new branch.

export type BodyDoor<T> = { ok: true; body: T } | { ok: false };

/**
 * Reads the request's JSON body without ever throwing.
 * - a valid JSON object               → { ok: true, body }
 * - null / arrays / primitives /
 *   malformed JSON / a missing body   → { ok: false }
 *
 * Arrays and primitives are door rejections too: every route behind this
 * door dispatches on object fields (`body.status`, `body.items`, …), and
 * a JSON array or a bare string cannot describe its changes — the same
 * honest 400 as an empty body, for the same reason.
 *
 * v2.326.0 — THE POST-WIDE DOOR: the sweep widened from 19 files to 67.
 * The default generic is the pre-door semantics itself: bare
 * `await request.json()` inferred `any`, so a caller that omits the
 * generic keeps the exact typing its handler was written against —
 * zero type drift across the mechanical pass (the scoped tsc
 * round-trip: zero NEW errors). Per-file generic tightening (the 19
 * v2.325 exemplars already carry narrowed generics) remains an
 * incremental follow-up; the RUNTIME class — the 500 wearing a
 * client's mistake — is what this door exists to kill.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function readJsonBody<T = any>(
  request: Request
): Promise<BodyDoor<T>> {
  try {
    const parsed: unknown = await request.json();
    if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return { ok: false };
    }
    return { ok: true, body: parsed as T };
  } catch {
    return { ok: false };
  }
}

/**
 * The door's rejection answer: 400 with the house's success/error voice
 * and — where the caller knows its clients' vocabulary — a hint naming
 * what the body should say (the v2.324 law: a mistake is a polite
 * rejection, never a crash).
 */
export function bodyDoorRejected(hint?: string): Response {
  return Response.json(
    {
      success: false,
      error:
        'Request body must be a valid JSON object (a body-less request cannot describe its changes).',
      ...(hint ? { hint } : {}),
    },
    { status: 400 }
  );
}
