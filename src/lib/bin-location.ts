// ============================================================================
// THE SHELF'S OWN ADDRESS — the bin location's ONE home (v2.497.0).
//
// A hardware store's daily question, "where does this product sit on the
// shelf?", was answered by a model (BinLocation) that never grew a desk —
// the wire existed nowhere, the rows stayed invisible, and the shelf kept
// its addresses in the dark. This home composes and validates the shelf's
// address words ONCE so every face that names a bin speaks the same bytes:
//
//   composeBinLocationCode  — the parts join in the aisle → shelf → bin
//                             order with ", " (the model's own example:
//                             "Aisle A, Shelf 3, Bin 12"); an empty part
//                             stays silent; all empty answers null.
//   resolveBinLocationCode  — an explicit code the maker typed WHOLE wins
//                             over the parts; else the parts compose; else
//                             null (the wire rejects the whole-empty row —
//                             a bin with no address is not a bin).
//   validateBinLocationInput — the wire's door: trims every word, caps it
//                             at its own limit (the error names the field
//                             and its cap), rejects the whole-empty case.
//
// The census holds: this feature wears NO family word and NO new hue —
// the shelf chip and the door live on the shared muted ground.
// ============================================================================

export interface BinParts {
  aisle?: string | null;
  shelf?: string | null;
  bin?: string | null;
}

export interface BinLocationInput extends BinParts {
  locationCode?: string | null;
}

/** The wire's caps — each part's own limit, the whole address's own. */
export const BIN_PART_LIMITS = {
  aisle: 40,
  shelf: 40,
  bin: 40,
  locationCode: 80,
} as const;

function trimPart(value: string | null | undefined): string {
  return typeof value === 'string' ? value.trim() : '';
}

/**
 * The parts join in the aisle → shelf → bin order with ", " — the model's
 * own example shape ("Aisle A, Shelf 3, Bin 12"). An empty part stays
 * silent; all parts empty answers null (the caller decides what silence
 * means — the wire rejects it, the preview shows it honestly).
 */
export function composeBinLocationCode(parts: BinParts): string | null {
  const words = [trimPart(parts.aisle), trimPart(parts.shelf), trimPart(parts.bin)].filter(
    (w) => w.length > 0,
  );
  if (words.length === 0) return null;
  return words.join(', ');
}

/**
 * An explicit code typed WHOLE wins over the parts (the maker's own words
 * are never re-composed); else the parts compose; else null.
 */
export function resolveBinLocationCode(input: BinLocationInput): string | null {
  const explicit = trimPart(input.locationCode);
  if (explicit.length > 0) return explicit;
  return composeBinLocationCode(input);
}

export type BinLocationValidation =
  | { ok: true; value: { aisle: string; shelf: string; bin: string; locationCode: string } }
  | { ok: false; error: string };

/**
 * The wire's door: every word trimmed and capped at its own limit, the
 * address resolved (explicit code wins, else composed), the whole-empty
 * row rejected — a bin with no address is not a bin.
 */
export function validateBinLocationInput(input: BinLocationInput): BinLocationValidation {
  const aisle = trimPart(input.aisle);
  const shelf = trimPart(input.shelf);
  const bin = trimPart(input.bin);
  const locationCode = trimPart(input.locationCode);

  if (aisle.length > BIN_PART_LIMITS.aisle) {
    return { ok: false, error: `The aisle word carries more than ${BIN_PART_LIMITS.aisle} characters.` };
  }
  if (shelf.length > BIN_PART_LIMITS.shelf) {
    return { ok: false, error: `The shelf word carries more than ${BIN_PART_LIMITS.shelf} characters.` };
  }
  if (bin.length > BIN_PART_LIMITS.bin) {
    return { ok: false, error: `The bin word carries more than ${BIN_PART_LIMITS.bin} characters.` };
  }
  if (locationCode.length > BIN_PART_LIMITS.locationCode) {
    return { ok: false, error: `The address carries more than ${BIN_PART_LIMITS.locationCode} characters.` };
  }

  const resolved = locationCode.length > 0 ? locationCode : composeBinLocationCode({ aisle, shelf, bin });
  if (!resolved) {
    return { ok: false, error: 'The bin needs an address — name the aisle, the shelf or the bin.' };
  }

  return { ok: true, value: { aisle, shelf, bin, locationCode: resolved } };
}

/**
 * The desk's chip reads the FIRST row (the wire sorts the product's bins
 * oldest first — the shelf's standing address); an empty shelf answers
 * null and the row speaks nothing (per-row silence is the strip's law).
 */
export function primaryBinCode<T extends { locationCode: string }>(
  bins: ReadonlyArray<T>,
): string | null {
  return bins.length > 0 ? bins[0].locationCode : null;
}

/** Decimal-safe sum for the door's units line (never NaN — zero when empty). */
function sumQuantity(values: ReadonlyArray<number>): number {
  return values.reduce((acc, v) => acc + (Number.isFinite(v) ? v : 0), 0);
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/**
 * The door's census line: "1 bin on the shelf" / "2 bins · 24 units shelved"
 * — the units ride only when they sum to something (a quantity-less bin
 * stays a named shelf, never a zero row).
 */
export function binShelfSummary(
  bins: ReadonlyArray<{ locationCode: string; quantity?: unknown }>,
): string {
  const count = bins.length;
  if (count === 0) return 'No bin on file';
  const units = sumQuantity(bins.map((b) => (typeof b.quantity === 'number' ? b.quantity : 0)));
  const binWord = count === 1 ? 'bin' : 'bins';
  if (units > 0) {
    return `${count} ${binWord} · ${round2(units)} units shelved`;
  }
  return `${count} ${binWord} on the shelf`;
}
