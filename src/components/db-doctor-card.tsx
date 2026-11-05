'use client';

// THE DB DOCTOR CARD LOOM (v2.399.0) — the failure's name and its
// documented remediation wear ONE component. Born at the login desk in
// v2.398.0 (the card under the banner), joined in v2.399.0 by the System
// Health desk's Environment & Connection panel: TWO desks, ONE card, the
// same amber family tokens, the same mono code chip, the same ordered
// steps — the look can never drift apart again.
//
// THE DESK-FREE LAW: this file speaks NO desk word. The desks carry
// their own testid, aria label and spacing via props — the card never
// learns where it is rendering, so no collision ledger ever has to admit
// this file. The login desk's defaults are the byte-exact v2.398.0 face.
//
// THE QUIET LAW (carried): the card renders ONLY when the desk hands it
// a diagnostic — a null keeps every desk byte-identical to its pre-card
// face. The card never fetches, never reads env, never decides exposure;
// the server's gating posture is the desks' business.

import type { DbDiagnostic } from '@/lib/db-doctor';

interface DbDoctorCardProps {
  diagnostic: DbDiagnostic;
  /** The desk's own greppable handle (login-db-doctor, health-db-doctor…). */
  testId: string;
  /** The desk's own aria voice — default is the login desk's historic one. */
  ariaLabel?: string;
  /** The desk's own spacing — default is the login desk's historic block. */
  className?: string;
}

export function DbDoctorCard({
  diagnostic,
  testId,
  ariaLabel = 'Database diagnostics',
  className = 'mt-3 rounded-lg border border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-950/30 px-3 py-2.5',
}: DbDoctorCardProps) {
  return (
    <div role="note" aria-label={ariaLabel} data-testid={testId} className={className}>
      <div className="flex flex-wrap items-center gap-2">
        <code className="rounded bg-amber-100 px-1.5 py-0.5 font-mono text-[11px] font-semibold text-amber-900 dark:bg-amber-900/40 dark:text-amber-200">
          {diagnostic.code}
        </code>
        <span className="text-xs font-semibold text-amber-900 dark:text-amber-200">
          {diagnostic.title}
        </span>
      </div>
      <p className="mt-1.5 text-[11px] leading-relaxed text-amber-800 dark:text-amber-300">
        {diagnostic.summary}
      </p>
      <ol className="ml-4 mt-1.5 list-decimal space-y-1">
        {diagnostic.steps.map((step, index) => (
          <li
            key={index}
            className="pl-1 text-[11px] leading-relaxed text-amber-800 dark:text-amber-300"
          >
            {step}
          </li>
        ))}
      </ol>
    </div>
  );
}
