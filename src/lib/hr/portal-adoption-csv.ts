// src/lib/hr/portal-adoption-csv.ts
//
// v2.272.0: the portal adoption census carries its copy — the roll call's
// own CSV door. The digest export route (/api/hr/reports/export) refuses
// the census ON PURPOSE: a digest is aggregate-only by construction, and
// the roll call is name-bearing. A name-bearing file therefore gets its
// own governed door: the same header block, the same OWASP formula-
// injection guard (csvCell), the same honest filename law — and its own
// audit action (PORTAL_ADOPTION_EXPORTED) written by the route.
//
// The builder is PURE (no db, no network, no env) exactly like
// digest-csv.ts: the route fetches the ALREADY-governed census
// (portalAdoptionReport — the select that refuses the email), and this
// module only shapes what that DTO already carries. The CSV can never
// carry a field the page itself cannot.

import { csvCell } from '@/lib/hr/digest-csv';
import type { PortalAdoptionDto } from '@/lib/hr/reports';

/** A send-ready CSV file: raw content + metadata for audit rows. */
export interface PortalAdoptionCsvFile {
  filename: string;
  /** RFC-4180 CSV, UTF-8, CRLF line endings, trailing CRLF. */
  content: string;
  /** Decoded byte size — for the audit metadata and the size note. */
  byteSize: number;
}

/** One record per line, CRLF (RFC-4180). */
function csvRow(cells: Array<string | number>): string {
  return cells.map(csvCell).join(',');
}

/**
 * The roll call's portal-state WORDS — the page's chip vocabulary spoken in
 * plain CSV-safe text: 'portal' (open, emerald), 'portal off' (deactivated,
 * amber), 'not linked' (the honest dash). One vocabulary, two desks.
 */
export function portalStateWord(row: Pick<PortalAdoptionDto['rows'][number], 'portalLinked' | 'portalActive'>): string {
  if (!row.portalLinked) return 'not linked';
  return row.portalActive === false ? 'portal off' : 'portal';
}

/**
 * Build the census CSV. Returns null when the census carries no rows
 * (nothing to file — the route turns that into an honest 404, the same
 * NO_REPORT_DATA law the digest export keeps).
 *
 * Layout (the governed house format, point-in-time edition):
 *   Report,Portal adoption census
 *   Organization,<org>
 *   Scope,<scope>
 *   Period,Point in time (<generated date, UTC>)
 *   Generated (UTC),<iso timestamp>
 *   (blank)
 *   Summary
 *   Metric,Value
 *   Employees in scope,<n>
 *   Linked logins,<n>
 *   Active logins,<n>
 *   Deactivated logins,<n>
 *   Not linked,<n>
 *   (blank)
 *   The roll call
 *   Employee,Employee code,Job title,Branch,Login role,Portal state
 *   <rows — the exact shaped bits the roster wire carries; no email column>
 */
export function portalAdoptionToCsv(
  input: Pick<PortalAdoptionDto, 'total' | 'linked' | 'activeLogins' | 'deactivatedLogins' | 'unlinked' | 'rows'> & {
    organizationName: string;
    scopeLabel: string;
  },
  generatedAt: Date = new Date(),
): PortalAdoptionCsvFile | null {
  if (input.rows.length === 0) {
    return null;
  }

  const lines: string[] = [];
  lines.push(csvRow(['Report', 'Portal adoption census']));
  lines.push(csvRow(['Organization', input.organizationName]));
  lines.push(csvRow(['Scope', input.scopeLabel]));
  lines.push(csvRow(['Period', `Point in time (${generatedAt.toISOString().slice(0, 10)})`]));
  lines.push(csvRow(['Generated (UTC)', generatedAt.toISOString()]));
  lines.push('');
  lines.push(csvRow(['Summary']));
  lines.push(csvRow(['Metric', 'Value']));
  lines.push(csvRow(['Employees in scope', input.total]));
  lines.push(csvRow(['Linked logins', input.linked]));
  lines.push(csvRow(['Active logins', input.activeLogins]));
  lines.push(csvRow(['Deactivated logins', input.deactivatedLogins]));
  lines.push(csvRow(['Not linked', input.unlinked]));
  lines.push('');
  lines.push(csvRow(['The roll call']));
  lines.push(csvRow(['Employee', 'Employee code', 'Job title', 'Branch', 'Login role', 'Portal state']));
  for (const r of input.rows) {
    lines.push(
      csvRow([
        r.name,
        r.employeeCode ?? '',
        r.jobTitle ?? '',
        r.storeName,
        // the login role exactly as the page names it (underscore → space,
        // lowercase); the unlinked row keeps the honest empty cell
        r.portalLinked ? (r.portalRole ?? 'linked').replace(/_/g, ' ').toLowerCase() : '',
        portalStateWord(r),
      ]),
    );
  }

  // RFC-4180: CRLF between records, trailing CRLF at end of file.
  const csv = lines.join('\r\n') + '\r\n';
  const byteSize = Buffer.byteLength(csv, 'utf8');
  // point-in-time file: the date stamp IS its period label
  const stamp = generatedAt.toISOString().slice(0, 10);
  const filename = `mbumah-portal-adoption-census-${stamp}.csv`;

  return { filename, content: csv, byteSize };
}
