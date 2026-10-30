// MBUMAH HARDWARE POS - the drill files its ledger (v2.298.0)
//
// BOTH NETS, per the runtime-pin law:
//   • the VALUE net pins the pure filing's bytes by truth: the preamble,
//     the honesty line, the ledger's own order, the actor words, the
//     escaper's guard, the RFC-4180 envelope, the filename.
//   • the BYTE net pins the wiring: the tab imports the ONE filing home
//     (never an inline builder), the button is honest about what it files,
//     the row's outcome badge is the feed's exact face, and the anonymous
//     word lives in exactly one home.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it, expect } from 'vitest';
import {
  gateDrillToCsv,
  gateDrillCsvFilename,
  GATE_DRILL_CSV_REPORT_VOICE,
} from '@/lib/gate-drill-csv';
import { DRILL_UNKNOWN_ACTOR } from '@/lib/security-feed';
import type { GateDrillEvent } from '@/lib/security-feed';

const ROOT = process.cwd();
const TAB = 'src/app/(shell)/tabs/security-tab.tsx';
const LIB = 'src/lib/gate-drill-csv.ts';
const FEED_LIB = 'src/lib/security-feed.ts';
const CENTER = 'src/components/notification-center.tsx';

const at = new Date('2026-10-31T05:58:00.000Z');

function row(overrides: Partial<GateDrillEvent> = {}): GateDrillEvent {
  return {
    id: 'evt-1',
    eventType: 'PERMISSION_DENIED',
    severity: 'WARN',
    ipAddress: '10.0.0.7',
    action: 'read',
    createdAt: '2026-10-31T05:00:00.000Z',
    blocked: true,
    details: { role: 'CASHIER', permission: 'roles:write', email: 'cashier@mbumahhardware.co.ke' },
    ...overrides,
  };
}

describe('gateDrillToCsv — the value net', () => {
  it('the preamble speaks its own name, gate, window, honesty line and moment', () => {
    const csv = gateDrillToCsv([row()], { resource: '/api/users', windowLabel: '24h', total: 10, generatedAt: at });
    const lines = csv.split('\r\n');
    expect(lines[0]).toBe(`Report,${GATE_DRILL_CSV_REPORT_VOICE}`);
    expect(lines[1]).toBe('Gate,/api/users');
    expect(lines[2]).toBe('Window,24h');
    expect(lines[3]).toBe('Rows,1 of 10 shown');
    expect(lines[4]).toBe('Generated (UTC),2026-10-31T05:58:00.000Z');
  });

  it('the report voice names the filing for what it is', () => {
    expect(GATE_DRILL_CSV_REPORT_VOICE).toBe('Gate drill — denied access ledger');
  });

  it('an unfinished walk NEVER claims the unseen — the preamble names the slice', () => {
    const rows = [row(), row({ id: 'evt-2' }), row({ id: 'evt-3' })];
    const csv = gateDrillToCsv(rows, { resource: '/api/users', windowLabel: '7d', total: 10, generatedAt: at });
    expect(csv).toContain('Rows,3 of 10 shown');
  });

  it('shown >= total is complete — "all N shown" (the walk\'s own law, mirrored)', () => {
    const rows = [row(), row({ id: 'evt-2' })];
    expect(
      gateDrillToCsv(rows, { resource: '/api/users', windowLabel: '24h', total: 2, generatedAt: at })
    ).toContain('Rows,all 2 shown');
  });

  it('a shrunken ledger (rows delivered >= wire total) still reads complete, never a negative', () => {
    expect(
      gateDrillToCsv([row()], { resource: '/api/users', windowLabel: '24h', total: 1, generatedAt: at })
    ).toContain('Rows,all 1 shown');
  });

  it('the rows keep the LEDGER\'S OWN ORDER — the filing never re-sorts', () => {
    const rows = [
      row({ id: 'a', severity: 'WARN', createdAt: '2026-10-31T05:00:00.000Z' }),
      row({ id: 'b', severity: 'ERROR', createdAt: '2026-10-30T22:00:00.000Z' }),
      row({ id: 'c', severity: 'INFO', createdAt: '2026-10-31T01:00:00.000Z' }),
    ];
    const csv = gateDrillToCsv(rows, { resource: '/api/users', windowLabel: '24h', total: 3, generatedAt: at });
    const dataLines = csv.split('\r\n').filter((l) => l.startsWith('WARN,') || l.startsWith('ERROR,') || l.startsWith('INFO,'));
    expect(dataLines.map((l) => l.split(',')[0])).toEqual(['WARN', 'ERROR', 'INFO']);
  });

  it('the column header is the drill\'s own contract', () => {
    const csv = gateDrillToCsv([row()], { resource: '/api/users', windowLabel: '24h', total: 1, generatedAt: at });
    expect(csv).toContain('Severity,Event,Actor,Role,Permission,IP address,Blocked,Time (UTC)');
  });

  it('the actor words ride the ONE parse — email, role, permission land in their cells', () => {
    const csv = gateDrillToCsv([row()], { resource: '/api/users', windowLabel: '24h', total: 1, generatedAt: at });
    expect(csv).toContain('WARN,PERMISSION_DENIED,cashier@mbumahhardware.co.ke,CASHIER,roles:write,10.0.0.7,yes,');
  });

  it('a raw-JSON-string details payload (the defensive wire) parses through the same ONE door', () => {
    const csv = gateDrillToCsv(
      [row({ details: '{"role":"MANAGER","permission":"users:delete","email":"boss@mbumahhardware.co.ke"}' })],
      { resource: '/api/users', windowLabel: '24h', total: 1, generatedAt: at }
    );
    expect(csv).toContain('boss@mbumahhardware.co.ke,MANAGER,users:delete');
  });

  it('an anonymous row says the vocabulary\'s ONE word and leaves the pills empty', () => {
    const csv = gateDrillToCsv([row({ details: null })], { resource: '/api/users', windowLabel: '24h', total: 1, generatedAt: at });
    expect(csv).toContain(`WARN,PERMISSION_DENIED,${DRILL_UNKNOWN_ACTOR},,,10.0.0.7,yes,`);
  });

  it('garbage details stay anonymous — the filing never invents an identity', () => {
    const csv = gateDrillToCsv([row({ details: '{not json' })], { resource: '/api/users', windowLabel: '24h', total: 1, generatedAt: at });
    expect(csv).toContain(DRILL_UNKNOWN_ACTOR);
  });

  it('a null IP lands as an empty cell — an honest absence, not a placeholder', () => {
    const csv = gateDrillToCsv([row({ ipAddress: null })], { resource: '/api/users', windowLabel: '24h', total: 1, generatedAt: at });
    expect(csv).toContain('cashier@mbumahhardware.co.ke,CASHIER,roles:write,,yes,');
  });

  it('the blocked truth is yes/no — the same word the screen\'s badge speaks', () => {
    const unblocked = gateDrillToCsv([row({ blocked: false })], { resource: '/api/users', windowLabel: '24h', total: 1, generatedAt: at });
    expect(unblocked).toContain(',no,2026-10-31T05:00:00.000Z');
    const blocked = gateDrillToCsv([row({ blocked: true })], { resource: '/api/users', windowLabel: '24h', total: 1, generatedAt: at });
    expect(blocked).toContain(',yes,2026-10-31T05:00:00.000Z');
  });

  it('the Time (UTC) column carries createdAt VERBATIM — the wire\'s own ISO', () => {
    const csv = gateDrillToCsv([row()], { resource: '/api/users', windowLabel: '24h', total: 1, generatedAt: at });
    expect(csv).toContain(',2026-10-31T05:00:00.000Z');
    expect(csv).not.toContain('Oct');
  });

  it('the formula-injection guard rides the ONE escaper — a tampered email cannot open as a formula', () => {
    const csv = gateDrillToCsv(
      [row({ details: { role: 'CASHIER', permission: 'x', email: "=cmd|' /c calc'!A0" } })],
      { resource: '/api/users', windowLabel: '24h', total: 1, generatedAt: at }
    );
    expect(csv).toContain("'=cmd|");
  });

  it('a comma-bearing permission is quoted and its embedded quotes doubled (RFC-4180)', () => {
    const csv = gateDrillToCsv(
      [row({ details: { role: 'CASHIER', permission: 'say "no", loudly', email: 'a@b.co' } })],
      { resource: '/api/users', windowLabel: '24h', total: 1, generatedAt: at }
    );
    expect(csv).toContain('"say ""no"", loudly"');
  });

  it('RFC-4180 envelope: CRLF records, trailing CRLF, never a lone CR or LF', () => {
    const csv = gateDrillToCsv([row()], { resource: '/api/users', windowLabel: '24h', total: 1, generatedAt: at });
    expect(csv.endsWith('\r\n')).toBe(true);
    const withoutPairs = csv.replace(/\r\n/g, '');
    expect(withoutPairs).not.toContain('\n');
    expect(withoutPairs).not.toContain('\r');
  });

  it('an empty ledger still builds a well-formed (preamble + header) file', () => {
    const csv = gateDrillToCsv([], { resource: '/api/users', windowLabel: '24h', total: 0, generatedAt: at });
    expect(csv).toContain('Rows,all 0 shown');
    expect(csv).toContain('Severity,Event,Actor,Role,Permission,IP address,Blocked,Time (UTC)');
  });
});

describe('gateDrillCsvFilename — the name net', () => {
  it('the name is gate slug + window + UTC wall-date — filed copies never overwrite each other', () => {
    expect(gateDrillCsvFilename('/api/users', '24h', at)).toBe('mbumah-denials-api-users-24h-2026-10-31.csv');
  });

  it('a multi-segment path slugs every separator', () => {
    expect(gateDrillCsvFilename('/api/security/dashboard', '30d', at)).toBe(
      'mbumah-denials-api-security-dashboard-30d-2026-10-31.csv'
    );
  });

  it('a punctuation-only resource falls back to gate — the file is never anonymous', () => {
    expect(gateDrillCsvFilename('///', '24h', at)).toBe('mbumah-denials-gate-24h-2026-10-31.csv');
  });

  it('production defaults the stamp to the click\'s own moment (a real date, UTC)', () => {
    const name = gateDrillCsvFilename('/api/users', '24h');
    expect(name).toMatch(/^mbumah-denials-api-users-24h-\d{4}-\d{2}-\d{2}\.csv$/);
  });
});

describe('the byte net — the wiring', () => {
  it('the tab imports the ONE filing home, never an inline builder', () => {
    const src = readFileSync(join(ROOT, TAB), 'utf8');
    expect(src).toContain("import { gateDrillToCsv, gateDrillCsvFilename } from '@/lib/gate-drill-csv';");
    expect((src.match(/gateDrillToCsv\(/g) || []).length).toBe(1);
  });

  it('the filing lib imports the ONE escaper — never a second home for the guard', () => {
    const src = readFileSync(join(ROOT, LIB), 'utf8');
    expect(src).toContain("import { csvCell } from '@/lib/hr/digest-csv';");
    expect((src.match(/csvCell/g) || []).length).toBeGreaterThanOrEqual(2);
    expect(src).not.toContain('function csvCell');
  });

  it('the filing lib parses actors through the ONE door', () => {
    const src = readFileSync(join(ROOT, LIB), 'utf8');
    expect(src).toContain('drillActorFromDetails(ev.details)');
    expect((src.match(/drillActorFromDetails/g) || []).length).toBe(2); // import + the one call
  });

  it('the CSV button exists, wears its testid, and is disabled when there is nothing to file', () => {
    const src = readFileSync(join(ROOT, TAB), 'utf8');
    expect(src).toContain('data-testid="gate-drill-csv"');
    expect(src).toContain('disabled={drillRows.length === 0}');
  });

  it('the button files the SAME rows the panel shows — the same merge, no fresh fetch', () => {
    const src = readFileSync(join(ROOT, TAB), 'utf8');
    expect(src).toContain('const rows = mergeDrillRows(gateDrillQuery.data.events, drillExtra);');
    expect(src).toContain("new Blob([csv], { type: 'text/csv; charset=utf-8' })");
    expect(src).toContain('anchor.download = gateDrillCsvFilename(gateDrill, gateRange);');
  });

  it('the drill row speaks the outcome in the feed\'s EXACT badge face', () => {
    const tab = readFileSync(join(ROOT, TAB), 'utf8');
    const center = readFileSync(join(ROOT, CENTER), 'utf8');
    const face = 'text-[9px] font-bold px-1.5 py-0.5 rounded-full border border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 uppercase tracking-wide';
    expect(tab).toContain(face);
    expect(center).toContain(face);
  });

  it('one word, one home — the feed no longer carries an inline anonymous copy', () => {
    const center = readFileSync(join(ROOT, CENTER), 'utf8');
    expect(center).not.toContain("'Unknown user'");
    expect(center).not.toContain('"Unknown user"');
    expect(center).toContain('DRILL_UNKNOWN_ACTOR');
  });

  it('the word\'s value stays pinned at the lib', () => {
    expect(DRILL_UNKNOWN_ACTOR).toBe('Unknown user');
  });

  it('security-feed.ts stays import-free (the client-bundle law survives the comment edit)', () => {
    const src = readFileSync(join(ROOT, FEED_LIB), 'utf8');
    expect(/^import /m.test(src)).toBe(false);
  });

  it('the filing lib stays pure — no db, no fetch, no env', () => {
    const src = readFileSync(join(ROOT, LIB), 'utf8');
    expect(src).not.toContain('node:fs');
    expect(src).not.toContain('fetch(');
    expect(src).not.toContain('process.env');
  });
});
