// MBUMAH HARDWARE POS - the gate drill's filing (v2.298.0)
//
// The drill (v2.295.0–v2.297.0) answers "who is hammering this gate" on
// screen; a triager who needs to attach that answer to an incident ticket
// had to copy rows by hand. This lib files the drill's SHOWN rows — the
// slice the visitor actually walked — as an RFC-4180 CSV, the same
// client-Blob filing the desk's drawer slices made in v2.70.0.
//
// LAWS:
// • The file carries exactly what the drill shows — the rows on screen,
//   in the LEDGER'S OWN ORDER (newest first as delivered by the wire;
//   never re-sorted), with the same actor words the rows speak (the ONE
//   parse from security-feed, never a second copy).
// • An UNFINISHED walk never pretends completeness: the preamble names
//   the slice ("3 of 10 shown") so a filed copy of a half-walked window
//   cannot masquerade as the whole ledger. Shown >= total is complete
//   ("all N shown") — the same honesty law the aggregate voice speaks.
// • Cells ride the digest CSV's escaper (csvCell, ONE home since v2.46.0)
//   — the OWASP formula-injection guard covers the drill's files too.
//   This module is the drill's ONE filing home; it never grows a second
//   escaper and the tab never grows an inline builder.
// • RFC-4180: CRLF records, trailing CRLF at end of file.

import { csvCell } from '@/lib/hr/digest-csv';
import {
  drillActorFromDetails,
  DRILL_UNKNOWN_ACTOR,
  type GateDrillEvent,
} from '@/lib/security-feed';

/** The preamble's Report line — the drill's filing speaks its own name. */
export const GATE_DRILL_CSV_REPORT_VOICE = 'Gate drill — denied access ledger';

/**
 * What the filing needs to know beyond the rows themselves. `total` is the
 * wire's own window count (the same number the walk's remaining arithmetic
 * consumes) — the file's honesty line derives shown-vs-total from
 * `rows.length` and this ONE number, never from a second count.
 */
export interface GateDrillCsvMeta {
  /** The drilled gate's address, verbatim (the file's Gate line). */
  resource: string;
  /** The card's lens the drill answered (24h / 7d / 30d — the route's whitelist). */
  windowLabel: string;
  /** The window's total from the wire — the honesty line's denominator. */
  total: number;
  /** Injectable for the pins; production uses the click's own moment. */
  generatedAt?: Date;
}

/**
 * File the drill's shown rows (v2.298.0).
 *
 * Preamble (Report / Gate / Window / Rows / Generated (UTC)), a blank
 * separator, the column header, then one row per SHOWN denial — severity,
 * event type, the actor words (email / role / permission, the drill's own
 * contract; an anonymous row says the vocabulary's one word), IP address,
 * the wire's blocked truth, and the record's createdAt VERBATIM (the wire's
 * own ISO — the file never reformats a timestamp into a softer lie).
 * Pure so the RUNTIME-PIN law holds: the suite asserts the bytes by value;
 * the render site just wires it.
 */
export function gateDrillToCsv(rows: readonly GateDrillEvent[], meta: GateDrillCsvMeta): string {
  const generatedAt = meta.generatedAt ?? new Date();
  const lines: string[] = [];
  const row = (cells: Array<string | number>) => lines.push(cells.map(csvCell).join(','));

  const rowsLine =
    rows.length >= meta.total ? `all ${meta.total} shown` : `${rows.length} of ${meta.total} shown`;

  row(['Report', GATE_DRILL_CSV_REPORT_VOICE]);
  row(['Gate', meta.resource]);
  row(['Window', meta.windowLabel]);
  row(['Rows', rowsLine]);
  row(['Generated (UTC)', generatedAt.toISOString()]);

  lines.push('');
  lines.push('Denials');
  row(['Severity', 'Event', 'Actor', 'Role', 'Permission', 'IP address', 'Blocked', 'Time (UTC)']);
  for (const ev of rows) {
    // The ONE parse — the same derivation the rows on screen consumed.
    const actor = drillActorFromDetails(ev.details);
    row([
      ev.severity,
      ev.eventType,
      actor.email || DRILL_UNKNOWN_ACTOR,
      actor.role || '',
      actor.permission || '',
      ev.ipAddress || '',
      ev.blocked ? 'yes' : 'no',
      ev.createdAt,
    ]);
  }

  return lines.join('\r\n') + '\r\n';
}

/**
 * The filing's download name (v2.298.0): gate slug + window + UTC wall-date,
 * e.g. mbumah-denials-api-users-24h-2026-10-31.csv — the desk slices' "filed
 * copies never overwrite each other" rule. A punctuation-only resource falls
 * back to 'gate', so the file is never anonymous.
 */
export function gateDrillCsvFilename(
  resource: string,
  windowLabel: string,
  generatedAt?: Date
): string {
  const at = generatedAt ?? new Date();
  const stamp = at.toISOString().slice(0, 10);
  const slug = resource.replace(/[^a-z0-9]+/gi, '-').replace(/^-+|-+$/g, '').toLowerCase() || 'gate';
  return `mbumah-denials-${slug}-${windowLabel}-${stamp}.csv`;
}
