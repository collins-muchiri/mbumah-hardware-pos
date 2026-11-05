// THE DB DOCTOR CARD LOOM SUITE (v2.399.0) — one card, two desks.
// Pins: the card's real rendered anatomy (role=note, the mono code chip,
// the title, the summary, the ordered steps), the desk-free law (the
// testid / aria label / spacing ride props; the login desk's defaults are
// the byte-exact v2.398.0 face), and the quiet law (a null diagnostic
// never reaches the card — the desks gate it, the suite pins the gate).
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DbDoctorCard } from '@/components/db-doctor-card';
import { diagnosePrismaCode, type DbDiagnostic } from '@/lib/db-doctor';

const CARD: DbDiagnostic = diagnosePrismaCode('P2021') as DbDiagnostic;

describe('db doctor card loom (v2.399.0)', () => {
  it('renders the failure\u2019s name and its documented remediation', () => {
    render(<DbDoctorCard diagnostic={CARD} testId="login-db-doctor" />);
    const note = screen.getByTestId('login-db-doctor');
    expect(note.getAttribute('role')).toBe('note');
    expect(note.getAttribute('aria-label')).toBe('Database diagnostics');
    expect(screen.getByText('P2021').tagName).toBe('CODE');
    expect(screen.getByText('Schema not pushed')).toBeTruthy();
    expect(screen.getByText(/schema was never pushed|WRONG database/)).toBeTruthy();
    const steps = screen.getAllByRole('listitem');
    expect(steps).toHaveLength(3);
    expect(steps[0].textContent).toContain('npx prisma db push');
  });

  it('the desk-free law: testid, aria label and spacing ride props', () => {
    render(
      <DbDoctorCard
        diagnostic={CARD}
        testId="health-db-doctor"
        ariaLabel="Connection diagnostics"
        className="mt-2 custom-face"
      />,
    );
    const note = screen.getByTestId('health-db-doctor');
    expect(note.getAttribute('aria-label')).toBe('Connection diagnostics');
    expect(note.className).toContain('custom-face');
    expect(note.className).toContain('mt-2');
    expect(note.className).not.toContain('mt-3');
  });

  it('the login desk\u2019s defaults are the byte-exact v2.398.0 face', () => {
    render(<DbDoctorCard diagnostic={CARD} testId="login-db-doctor" />);
    const note = screen.getByTestId('login-db-doctor');
    expect(note.className).toBe(
      'mt-3 rounded-lg border border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-950/30 px-3 py-2.5',
    );
  });

  it('the quiet law: the desks gate — a null never renders a card', () => {
    // The component itself takes a non-null diagnostic; the GATE is the
    // desks' conditional. Pin the gate's shape in both desk files so the
    // quiet face can never silently regress.
    const login = read('src/components/login-screen.tsx');
    expect(login).toMatch(/dbDiagnostic \? \(\s*<DbDoctorCard/);
    expect(login).not.toMatch(/<DbDoctorCard[^>]*diagnostic=\{null\}/);
    const health = read('src/app/(shell)/tabs/system-health-tab.tsx');
    expect(health).toMatch(/envReport\.diagnostic \? \(\s*<DbDoctorCard/);
    expect(health).toMatch(/testId="health-db-doctor"/);
  });

  it('the two desks wear the shared loom — no hand-rolled card survives', () => {
    // The v2.398.0 inline card retired with the loom: the login desk speaks
    // no inline `Database diagnostics` div any more, and no OTHER desk
    // hand-rolls the anatomy either.
    const login = read('src/components/login-screen.tsx');
    expect(login).not.toContain('aria-label="Database diagnostics"');
    expect(login).toContain("from '@/components/db-doctor-card'");
    const card = read('src/components/db-doctor-card.tsx');
    expect(card).toContain("role=\"note\"");
    expect(card).toContain('data-testid={testId}');
  });
});

function read(rel: string): string {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require('node:fs').readFileSync(`${process.cwd()}/${rel}`, 'utf8');
}
