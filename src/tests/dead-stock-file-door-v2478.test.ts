// THE FILE CARRIES THE CHORUS'S OWN DOOR (v2.478.0): the CSV's summary
// block grows the "Chorus share link" row — the whole ledger's ask in one
// open, the file included in the one-voice arc — proven without a sheet.
//
//   • THE FILE'S DOOR — the footer's own link composed by the ONE home
//     (the exact word the Share all handle opens and the paper's lead
//     card encodes), quoted like every word a CSV must survive; the
//     canonical rows only — the view/archive law holds.
//   • THE CARDS ANSWER THE HAND — the three summary cards learn the
//     hover lift; the dead-stock trio ONLY (no other desk's card moves).
//   • THE PAPER'S SECOND DRESS — two new print-CSS faces (the rose rule
//     under the chorus heading, the italic intro), the standing bytes
//     untouched.
//   • THE CENSUS KEEPS ITS TEN — the footer's link is a word in the
//     file, never a handle.

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { WHATS_NEW } from '@/lib/whats-new';

const DESK = 'src/app/(shell)/tabs/reports-tab.tsx';
const HOME = 'src/lib/reports/dead-stock.ts';

const desk = readFileSync(DESK, 'utf8');
const home = readFileSync(HOME, 'utf8');

// ---------------------------------------------------------------------------
// 1. THE FILE'S DOOR — the footer's own link, the ONE home's composer
// ---------------------------------------------------------------------------

describe('the file\u2019s own chorus door — the footer rides the ONE home', () => {
  it('the footer row speaks the collective composer — the Share all handle\u2019s own word', () => {
    expect(desk.includes(
      'Chorus share link,"${deadStockChorusShareUrl(deadStockRows, deadStockSummary?.days ?? deadStockDays, deadStockStoreContact?.phone)}"',
    )).toBe(true);
    expect(home.includes('export function deadStockChorusShareUrl')).toBe(true);
    expect((desk.match(/function deadStockChorusShareUrl/g) ?? []).length).toBe(0);
  });

  it('the footer row sits BESIDE the Clearance chorus — the file\u2019s own two collective words', () => {
    const chorus = desk.indexOf('Clearance chorus,"${deadStockChorusHeader(deadStockRows');
    const link = desk.indexOf('Chorus share link,"${deadStockChorusShareUrl(deadStockRows');
    expect(chorus).toBeGreaterThan(-1);
    expect(link).toBeGreaterThan(chorus);
  });

  it('the link is quoted — a CSV word must survive whatever reads it', () => {
    expect(desk.includes('Chorus share link,"${')).toBe(true);
  });

  it('the desk never spells the host\u2019s word — the census law holds (zero bytes)', () => {
    expect(desk.split('wa.me').length - 1).toBe(0);
  });

  it('the view/archive law — the footer sings the CANONICAL rows, never the pressed lens\u2019s view', () => {
    expect(desk.includes('deadStockChorusShareUrl(deadStockRows')).toBe(true);
    expect(desk.includes('deadStockChorusShareUrl(sortedRows')).toBe(false);
    expect(desk.includes('deadStockChorusShareUrl(viewRows')).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// 2. THE CARDS ANSWER THE HAND — the trio's quiet motion, none else
// ---------------------------------------------------------------------------

describe('the cards answer the hand — the styling verse', () => {
  it('exactly three cards wear the hover lift — the dead-stock trio only', () => {
    expect((desk.match(/transition-shadow hover:shadow-md/g) ?? []).length).toBe(3);
  });

  it('each card keeps its own border word and gains the motion', () => {
    expect(desk.includes('border-l-rose-500 backdrop-blur-sm bg-card/80 transition-shadow hover:shadow-md')).toBe(true);
    expect(desk.includes('border-l-amber-500 backdrop-blur-sm bg-card/80 transition-shadow hover:shadow-md')).toBe(true);
    expect(desk.includes('border-l-primary backdrop-blur-sm bg-card/80 transition-shadow hover:shadow-md')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 3. THE PAPER'S SECOND DRESS — new faces, standing bytes untouched
// ---------------------------------------------------------------------------

describe('the paper\u2019s second dress — the print CSS grows', () => {
  it('the chorus heading grows its rose rule', () => {
    expect(desk.includes(".chorus h3::after { content: ''; display: block; width: 32px; border-bottom: 2px solid #fecdd3; margin-top: 6px; }")).toBe(true);
  });

  it('the scan intro learns the italic', () => {
    expect(desk.includes('.scan-intro { font-style: italic; }')).toBe(true);
  });

  it('the standing CSS lines keep their bytes — every elder face untouched', () => {
    expect(desk.includes('.chorus { margin-top: 28px; border-top: 2px solid #fecdd3; padding-top: 16px; }')).toBe(true);
    expect(desk.includes('.chorus-intro { color: #64748b; font-size: 12px; margin: 0 0 10px; }')).toBe(true);
    expect(desk.includes('.chorus li::marker { color: #be123c; font-weight: 600; }')).toBe(true);
    expect(desk.includes('.scan-doors { margin-top: 24px; border-top: 2px solid #e2e8f0; padding-top: 16px; page-break-inside: avoid; }')).toBe(true);
    expect(desk.includes('.scan-grid { display: flex; flex-wrap: wrap; gap: 12px; }')).toBe(true);
    expect(desk.includes('.scan-card { width: 120px; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 8px; text-align: center; margin: 0; page-break-inside: avoid; }')).toBe(true);
    expect(desk.includes('.scan-card img { width: 96px; height: 96px; }')).toBe(true);
    expect(desk.includes('.scan-card.scan-chorus { width: 132px; border: 2px solid #0f766e; background: #f0fdfa; }')).toBe(true);
    expect(desk.includes('.scan-chorus-note { display: block; font-size: 10px; color: #0f766e; margin-top: 4px; }')).toBe(true);
  });

  it('the file\u2019s elder words keep their bytes — the chorus footer and the share link column', () => {
    expect(desk.includes('Clearance chorus,"${deadStockChorusHeader(deadStockRows, deadStockSummary?.days ?? deadStockDays)}"')).toBe(true);
    expect(desk.includes('deadStockShareUrl(r, deadStockSummary?.days ?? deadStockDays, deadStockStoreContact?.phone)')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 4. THE CENSUS KEEPS ITS TEN — a word in the file is never a handle
// ---------------------------------------------------------------------------

describe('the census — the footer\u2019s link is a word, not a voice', () => {
  it('the section speaks ten handles now — the footer adds none', () => {
    const section = desk.slice(desk.indexOf('function DeadStockSection'), desk.indexOf('// Main Reports Tab Component'));
    expect(section.split('aria-label=').length - 1).toBe(10);
  });
});

// ---------------------------------------------------------------------------
// 5. THE FEED — the round announces itself
// ---------------------------------------------------------------------------

describe('whats-new — the round, pinned in the feed', () => {
  it('the head wears the round\u2019s own story — the honoured probe and the new word', () => {
    const head = WHATS_NEW.find((e) => e.version === '2.478.0');
  if (!head) throw new Error('the 2.478.0 entry is gone from the feed');
    expect(head.version).toBe('2.478.0');
    expect(head.title).toContain('the chorus learns the paper\u2019s scannable door');
    expect(head.title).toContain('the file carries the chorus\u2019s own door');
    expect(head.title).toContain('one breath');
    expect(head.title).toContain('carry');
    expect(head.title).toContain('the view speaks its own word');
    expect(head.title).toContain('edit door');
    expect(head.bullets.length).toBeGreaterThanOrEqual(3);
    expect(head.bullets.some((b) => b.includes('Chorus share link'))).toBe(true);
    expect(head.bullets.some((b) => b.includes('deadStockChorusShareUrl'))).toBe(true);
    expect(head.bullets.some((b) => b.includes('hover lift'))).toBe(true);
    expect(head.bullets.some((b) => b.includes('rose rule'))).toBe(true);
    expect(head.bullets.some((b) => b.includes('italic'))).toBe(true);
    expect(head.bullets.some((b) => b.includes('edit door'))).toBe(true);
    expect(head.bullets.some((b) => b.includes('pre-addressed'))).toBe(true);
    expect(head.bullets.some((b) => b.includes('clearance note'))).toBe(true);
    expect(head.bullets.some((b) => b.includes('chat picker'))).toBe(true);
    expect(head.bullets.some((b) => b.includes('share door'))).toBe(true);
    expect(head.bullets.some((b) => b.includes('wa.me'))).toBe(true);
    expect(head.bullets.some((b) => b.includes('clipboard'))).toBe(true);
    expect(head.bullets.some((b) => b.includes('category'))).toBe(true);
    expect(head.bullets.some((b) => b.includes('copy all'))).toBe(true);
    expect(head.bullets.some((b) => b.includes('clearance asks'))).toBe(true);
    expect(head.bullets.some((b) => b.includes('print button'))).toBe(true);
    expect(head.bullets.some((b) => b.includes('file'))).toBe(true);
    expect(head.bullets.some((b) => b.includes('share link'))).toBe(true);
  });

  it('the release surfaces speak with one voice', () => {
    const pkg = JSON.parse(readFileSync('package.json', 'utf8')) as { version: string };
    expect(pkg.version).toBe('2.487.0');
    expect(WHATS_NEW[0].version).toBe(pkg.version);
    const changelog = readFileSync('CHANGELOG.md', 'utf8');
    expect(changelog.indexOf('[2.478.0]')).toBeGreaterThan(-1);
    expect(changelog.indexOf('[2.478.0]')).toBeLessThan(changelog.indexOf('[2.477.0]'));
  });
});
