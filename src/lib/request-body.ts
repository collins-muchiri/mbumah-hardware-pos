// THE BODY DOOR (v2.325.0): one home for the honest body read in
// PUT/DELETE/PATCH handlers. v2.326.0 widened it POST-wide (67 files).
//
// v2.327.0 — THE SWALLOW CENSUS: the chained `.catch(() => ({}))` reads
// were classified three ways — the SILENT-PROCEED class (a malformed body
// became `{}` and ran anyway) now reads through `readJsonBody`; the
// OPTIONAL-BODY class (an empty body is a legitimate call) reads through
// `readOptionalJsonBody` below; and the HONEST-SWALLOW class (the catch
// feeds an explicit validation that already answers 400) stays as the
// documented exemplar pattern. The DARAJA webhooks keep their leniency.
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
 * round-trip: zero NEW errors).
 * v2.334.0 — THE DOORS TIGHTENED: the 20-file swallow census (v2.327)
 * no longer speaks `Record<string, unknown>` or the default `any` —
 * every door's generic now names the fields its handler actually
 * consumes (the service's own input type where one exists, an honest
 * literal where the route dispatches first). The default `any` remains
 * the law for the WIDER 67-door class whose per-file tightening is
 * still incremental follow-up.
 *
 * v2.335.0 — THE FINANCIAL FAMILY, the wider class's first pass: nine
 * doors across ten files speak their body's own shape (accounts CREATE
 * borrows Parameters<typeof createAccount>[0]; budgets ×2, recalculate,
 * snapshot, periods ×2 and journal speak honest literals — journal's
 * `lines` array included). journal/[id] keeps `{ reason?: unknown }`:
 * the String()-coerce door is already honest. And the recalculate door
 * now performs the period↔store cross-check its comment always
 * promised (mismatch → 404 before the helper runs).
 *
 * v2.336.0 — THE CATALOG FAMILY, the wider class's second pass: the
 * eighteen catalog doors (products ×3, categories ×2, subcategories,
 * vouchers + redeem, voucher-campaigns, gift-cards ×5, etims ×3) speak
 * their body's own shape — the create doors name every field their
 * handler consumes (`unknown` only where the route itself coerces:
 * sellingUnit/conversionFactor/discountPercent via String()/Number(),
 * the zod-validated gift-card fields flowing through validation.data
 * so the door only names the four RAW fields), the update doors name
 * their directly-read fields while the allowedFields loops keep the
 * honest index signature, and the two redeem doors borrow the local
 * RedeemBody/RedeemByCodeBody interfaces their handlers already
 * declared — the `as` re-casts are gone. vouchers/[id] already wore
 * its own literal. categories/[id] and gift-cards/[id] graduated from
 * the v2.326 loose-Record exemplars (three remain).
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

/**
 * THE OPTIONAL-BODY DOOR (v2.327.0): for routes whose body is genuinely
 * optional — the cron-adjacent reminder runners whose `{ storeId? }`
 * defaults to the session's store, the repair tool whose dryRun defaults
 * true, the read-marker whose `{ messageId? }` is one-of-many — an EMPTY
 * body is a legitimate call, so it passes as `{}`; but a body that is
 * PRESENT and unreadable (malformed JSON, an array, a primitive) is
 * still a client mistake and answers `{ ok: false }` for the caller's
 * bodyDoorRejected(). The old `.catch(() => ({}))` swallow conflated the
 * two: a malformed body silently became "no body", and a typo'd payload
 * ran with every field defaulted — the one lie this door refuses.
 */
export async function readOptionalJsonBody<T = Record<string, unknown>>(
  request: Request
): Promise<BodyDoor<T>> {
  const raw = await request.text().catch(() => '');
  if (!raw.trim()) {
    return { ok: true, body: {} as T };
  }
  try {
    const parsed: unknown = JSON.parse(raw);
    if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return { ok: false };
    }
    return { ok: true, body: parsed as T };
  } catch {
    return { ok: false };
  }
}
