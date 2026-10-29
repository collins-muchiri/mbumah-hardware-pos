// ============================================================================
// MBUMAH HARDWARE POS — the lens's ear (v2.256.0)
// ============================================================================
// v2.256.0 THE LENS'S EAR — one home for the keyboard's law across the
// three lens faces (the org ledger, the branch roster, the supplier's
// orders): ESCAPE stands the lens down — the press un-presses, the view
// returns, the fetch never moves. The words' own promise (every
// disclosure title says a press narrows the view; the keyboard's own
// answer is the same law in reverse).
//
// THE DIALOG GUARD — a dialog's Escape belongs to the dialog. When any
// element with `role="dialog"` is in the tree (Radix dialogs, the sheet
// drill, the PO drill, the command palette), the ear stays silent and
// the dialog's own close law speaks. The check runs at the MOMENT of
// the keypress (never cached) — a dialog opened after the ear mounted
// still wins.
//
// THE ONE HOME — every face calls this hook with its own lens state;
// the guard and the key check live HERE, never a copy. The hook returns
// nothing: the faces pass their own clear callback (setBandLens('ALL')
// — the exact lift the clear buttons already speak).
// ============================================================================

import { useEffect } from 'react';

/**
 * Listen for Escape on the window and stand the lens down.
 *
 * @param pressed — whether the lens currently narrows the view ('ALL' means
 *   the lens is already down and the ear has nothing to lift).
 * @param onClear — the face's own lift (`setBandLens('ALL')`); called at
 *   most once per Escape, only when the lens is pressed and no dialog is
 *   open.
 */
export function useLensEscape(pressed: boolean, onClear: () => void): void {
  useEffect(() => {
    if (!pressed) return; // the ear sleeps while the lens is down

    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      // The dialog guard — a dialog's Escape belongs to the dialog.
      // role="dialog" covers Radix modals, the drills and the palette;
      // the check reads the live tree at the moment of the keypress.
      if (document.querySelector('[role="dialog"]')) return;
      onClear();
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [pressed, onClear]);
}
