// THE STATUS DOOR, SIBLING SHAPE (v2.444.0): the census door gained a
// sibling — the zinc "N withdrawn" badge is a real button now, and its
// press speaks the history's STATUS lens ('cancelled') through the SAME
// controlled hand the type door knows.
//   • THE SIBLING GRAMMAR: press = land the cancelled lens; press the
//     pressed badge again = release (the door's second voice).
//   • ONE FAMILY, THREE SEATS: the pressed wardrobe is the history
//     chip's own zinc active bytes ('bg-zinc-600 text-white
//     border-zinc-600') — the Cancelled badge family's third seat
//     (history chip, stats card census, census table door).
//   • THE TWO DOORS NEVER CONJOIN A PRESS: the badge sits INSIDE the
//     type door's row — its press stops propagation, or the row would
//     land the TYPE filter on every withdrawn press.
//   • THE HONEST ZERO: a zero-count door invites a pointless press —
//     the muted 0 stays a census, never a button.
//   • THE KEYBOARD: a real <button> answers Enter and Space natively —
//     the row door's manual handler is the tr's burden, not this one's.

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';

const TAB = 'src/app/(shell)/tabs/data-exports-tab.tsx';
// v2.456.0 RE-KEY (dated): the HISTORY file const retired — the wardrobe
// byte it pinned moved to the loom, read directly at its one pin site.

const tab = readFileSync(TAB, 'utf8');

const tbody = tab.slice(tab.indexOf('<tbody>'), tab.indexOf('</tbody>'));

describe('the status door takes its seat (v2.444.0)', () => {
  it('the badge became a real button — the door with a native voice', () => {
    expect(tbody).toContain('<button');
    expect(tbody).toContain('type="button"');
    expect(tbody).toContain('data-testid={`census-withdrawn-${row.type}`}');
  });

  it('the press routes through the controlled hand — never a direct state write', () => {
    expect(tbody).toContain("chooseExpStatus(statusActive ? 'all' : 'cancelled')");
    // the census tbody writes NEITHER lens directly (the landing chips'
    // own dismissals predate the doors and stay their own business)
    expect(tbody).not.toContain('setExpStatusFilter(');
    expect(tbody).not.toContain('setExpTypeFilter(');
  });

  it('the door’s second voice — the toggle rides the status word', () => {
    expect(tbody).toContain("const statusActive = expStatusFilter === 'cancelled';");
    expect(tbody).toContain("statusActive ? 'all' : 'cancelled'");
  });

  it('one family, three seats — the pressed wardrobe is the history chip’s own bytes', () => {
    expect(tbody).toContain("'bg-zinc-600 text-white border-zinc-600'");
    // v2.456.0 RE-KEY (dated): the history chip's color registry moved
    // to the loom's ONE tone registry (chip-tones-v2456.test.ts pins
    // the full weave) — the byte lives in filter-chip.tsx now, and the
    // shadow unification gave the active face the family's lift, so
    // the zinc row carries shadow-sm.
    expect(readFileSync('src/components/filter-chip.tsx', 'utf8')).toContain(
      "zinc: 'bg-zinc-600 text-white border-zinc-600 shadow-sm',"
    );
  });

  it('the idle wardrobe carries the zinc palette — hover deepens, both states', () => {
    expect(tbody).toContain(
      "'bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-900/60 dark:text-zinc-300 dark:border-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-900'",
    );
  });

  it('the button speaks to the reader — aria-pressed and both aria voices', () => {
    expect(tbody).toContain('aria-pressed={statusActive}');
    expect(tbody).toContain(
      '`Lens the history to the ${row.cancelled} withdrawn runs`',
    );
    expect(tbody).toContain(
      "'The cancelled lens is on — press again to release'",
    );
  });

  it('the two title voices — the landing and the release', () => {
    expect(tbody).toContain(
      "'Press to show the withdrawn runs — the history lands on the cancelled lens'",
    );
    expect(tbody).toContain(
      "'The cancelled lens is on — press again to release it'",
    );
  });

  it('the keyboard answers natively AND never conjoins — the badge guards its keydown', () => {
    // the closing burst caught the conjoin: the row's manual Enter
    // handler would speak for the focused badge (and its preventDefault
    // would cancel the native click synthesis) — the badge stops the
    // two keys from bubbling, and NO preventDefault: the native default
    // (the button's own click) must live
    const buttonAt = tbody.indexOf('<button');
    const buttonBlock = tbody.slice(buttonAt, tbody.indexOf('</button>', buttonAt));
    expect(buttonBlock).toContain("if (e.key === 'Enter' || e.key === ' ') {");
    expect(buttonBlock).toContain('e.stopPropagation();');
    // the CALL never appears — the prose in the guard's own comment may
    // name the crime, the code must not commit it
    expect(buttonBlock).not.toContain('.preventDefault()');
  });

  it('the two doors never conjoin a press — the press stops propagation', () => {
    expect(tbody).toContain('e.stopPropagation();');
    // the stop lives INSIDE the button's onClick, before the hand speaks
    const stopAt = tbody.indexOf('e.stopPropagation();');
    const pressAt = tbody.indexOf('pressStatus();');
    expect(stopAt).toBeGreaterThan(-1);
    expect(pressAt).toBeGreaterThan(stopAt);
  });

  it('the honest zero stays a census — no door to nowhere', () => {
    expect(tbody).toContain('<span className="text-muted-foreground">0</span>');
    // the muted 0 renders in the else branch — outside any button
    const zeroAt = tbody.indexOf('<span className="text-muted-foreground">0</span>');
    const elseAt = tbody.indexOf(") : (", tbody.indexOf('{row.cancelled > 0 ?'));
    expect(zeroAt).toBeGreaterThan(elseAt);
  });

  it('the styling details — the zinc focus ring and the tactile press', () => {
    expect(tbody).toContain('focus-visible:ring-zinc-400');
    expect(tbody).toContain('active:scale-95');
  });

  it('the header note names BOTH doors — the census wears its handles', () => {
    expect(tab).toContain(
      'run counts include withdrawn rows · press a row to lens the type · a withdrawn badge lenses the cancelled',
    );
  });

  it('the sibling held — the type door rides untouched beside the new door', () => {
    expect(tbody).toContain("chooseExpType(active ? 'all' : word)");
    expect(tbody).toContain(
      "'group cursor-pointer bg-emerald-50/70 dark:bg-emerald-500/10'",
    );
  });
});
