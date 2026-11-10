// THE PAPER SPEAKS THE WINDOW'S WORD (v2.479.0): the dead-stock print
// header grows the idle window beside the dates — the lens's own word on
// the paper — and the round's other faces keep their seats.
//
//   • THE WINDOW'S WORD — the header line composed from the ONE home's
//     days expression, the dead-stock gate only; the other stages keep
//     the bare Period line.
//   • THE SEATS — the chorus footer, the share link column, the standing
//     print CSS lines, the census's ten voices.
//   • THE FEED — the round leads the feed; the honoured probe ("The file
//     carries the chorus's own door.") rides the title's chain.
//   • THE RELEASE SURFACES — VERSION, package.json, CHANGELOG, one voice.

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { WHATS_NEW } from '@/lib/whats-new';

const DESK = 'src/app/(shell)/tabs/reports-tab.tsx';

const desk = readFileSync(DESK, 'utf8');

// ---------------------------------------------------------------------------
// 1. THE WINDOW'S WORD — the header line, the ONE home's expression
// ---------------------------------------------------------------------------

describe('the paper speaks the window\u2019s word — the header line', () => {
  it('the Period line grows the idle window behind the dead-stock gate', () => {
    expect(desk.includes(
      "Period: ${dateFrom} to ${dateTo}${reportType === 'dead_stock' ? ` \u00b7 Idle window: ${deadStockSummary?.days ?? deadStockDays} days` : ''}</p>",
    )).toBe(true);
  });

  it('the word rides the ONE home\u2019s days expression — never a re-typed number', () => {
    expect(desk.includes('${deadStockSummary?.days ?? deadStockDays} days`')).toBe(true);
  });

  it('the bare Period line is gone — the paper cannot forget the window twice', () => {
    expect(desk.includes('Period: ${dateFrom} to ${dateTo}</p>')).toBe(false);
  });

  it('the header line keeps the standing style byte', () => {
    expect(desk.includes('<p style="color:#94a3b8;font-size:12px">Period:')).toBe(true);
  });

  it('the word echoes the lens\u2019s own label — two voices, one word', () => {
    // the in-app window lens's Label spoke "Idle window:" first; the paper
    // now echoes it — the same word in both places is the point (one voice).
    expect((desk.match(/Idle window/g) ?? []).length).toBe(2);
  });
});

// ---------------------------------------------------------------------------
// 2. THE SEATS — the elder bytes keep their places
// ---------------------------------------------------------------------------

describe('the seats — the round moves one line, the elder bytes hold', () => {
  it('the chorus footer and the share link column keep their words', () => {
    expect(desk.includes('Clearance chorus,"${deadStockChorusHeader(deadStockRows, deadStockSummary?.days ?? deadStockDays)}"')).toBe(true);
    expect(desk.includes('Chorus share link,"${deadStockChorusShareUrl(deadStockRows, deadStockSummary?.days ?? deadStockDays, deadStockStoreContact?.phone)}"')).toBe(true);
  });

  it('the standing print CSS lines keep their bytes', () => {
    expect(desk.includes('.chorus { margin-top: 28px; border-top: 2px solid #fecdd3; padding-top: 16px; }')).toBe(true);
    expect(desk.includes('.scan-card.scan-chorus { width: 132px; border: 2px solid #0f766e; background: #f0fdfa; }')).toBe(true);
    expect(desk.includes('.chorus h3::after { content: \'\'; display: block; width: 32px; border-bottom: 2px solid #fecdd3; margin-top: 6px; }')).toBe(true);
  });

  it('the census keeps its ten voices — the window word is not a handle', () => {
    const section = desk.slice(desk.indexOf('function DeadStockSection'), desk.indexOf('// Main Reports Tab Component'));
    expect(section.split('aria-label=').length - 1).toBe(10);
  });
});

// ---------------------------------------------------------------------------
// 3. THE FEED — the round announces itself
// ---------------------------------------------------------------------------

describe('whats-new — the round, pinned in the feed', () => {
  it('the head wears the round\u2019s own story — the honoured probe and the new word', () => {
    const head = WHATS_NEW.find((e) => e.version === '2.479.0');
  if (!head) throw new Error('the 2.479.0 entry is gone from the feed');
    expect(head.version).toBe('2.479.0');
    expect(head.title).toContain('the file carries the chorus\u2019s own door');
    expect(head.title).toContain('the paper speaks the window\u2019s word');
    expect(head.title).toContain('one breath');
    expect(head.title).toContain('carry');
    expect(head.title).toContain('the view speaks its own word');
    expect(head.title).toContain('edit door');
    expect(head.title).toContain('scannable door');
    expect(head.bullets.length).toBeGreaterThanOrEqual(3);
    expect(head.bullets.some((b) => b.includes('Idle window'))).toBe(true);
    expect(head.bullets.some((b) => b.includes('window'))).toBe(true);
    expect(head.bullets.some((b) => b.includes('CHIP_HEAD'))).toBe(true);
    expect(head.bullets.some((b) => b.includes('sixth weave'))).toBe(true);
    expect(head.bullets.some((b) => b.includes('zinc keyboard ring'))).toBe(true);
    expect(head.bullets.some((b) => b.includes('dark wardrobe'))).toBe(true);
    expect(head.bullets.some((b) => b.includes('(hue, storey)'))).toBe(true);
    expect(head.bullets.some((b) => b.includes('ONE home'))).toBe(true);
  });

  it('the release surfaces speak with one voice', () => {
    const pkg = JSON.parse(readFileSync('package.json', 'utf8')) as { version: string };
    expect(pkg.version).toBe('2.497.0');
    expect(WHATS_NEW[0].version).toBe(pkg.version);
    const changelog = readFileSync('CHANGELOG.md', 'utf8');
    expect(changelog.indexOf('[2.479.0]')).toBeGreaterThan(-1);
    expect(changelog.indexOf('[2.479.0]')).toBeLessThan(changelog.indexOf('[2.478.0]'));
  });
});
