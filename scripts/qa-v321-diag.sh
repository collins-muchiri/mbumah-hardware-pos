#!/usr/bin/env bash
# v2.321.0 diagnosis burst — FAB-vs-pager overlap probe + Radix gait click.
set -u
cd /home/z/ems
fuser -k 3200/tcp 2>/dev/null || true; sleep 2
LOG=/tmp/qa3200v321diag.log
DATABASE_URL="file:/home/z/ems/db/audit-dev.db" NODE_ENV=development nohup npx next dev -p 3200 > "$LOG" 2>&1 &
for i in $(seq 1 60); do
  code=$(curl -s --max-time 3 -o /dev/null -w '%{http_code}' http://localhost:3200/api/health 2>/dev/null || true)
  [ "$code" = "200" ] && { echo "healthy after ${i} polls"; break; }
  sleep 3
done
AB="agent-browser"
"$AB" open "http://localhost:3200/?tab=loyalty&view=transactions&limit=50" > /dev/null 2>&1 || true
sleep 7
"$AB" key Escape > /dev/null 2>&1 || true
sleep 2

echo "=== P1. FAB vs Next: geometry + hit stack ==="
"$AB" eval "
(() => {
  const next = document.querySelector('[data-testid=pager-next]');
  const fab = document.querySelector('button.fixed.bottom-6');
  if (!next) return 'NO NEXT';
  const nr = next.getBoundingClientRect();
  next.scrollIntoView({block: 'center'});
  return new Promise(res => setTimeout(() => {
    const n2 = next.getBoundingClientRect();
    const out = { nextRect: {t: Math.round(n2.top), b: Math.round(n2.bottom), l: Math.round(n2.left), r: Math.round(n2.right)} };
    if (fab) {
      const fr = fab.getBoundingClientRect();
      out.fab = {cls: String(fab.className).slice(0,80), y: Math.round(fr.top)};
      out.overlap = !(n2.right < fr.left || n2.left > fr.right || n2.bottom < fr.top || n2.top > fr.bottom);
    } else out.fab = null;
    const cx = n2.left + n2.width/2, cy = n2.top + n2.height/2;
    out.stack = document.elementsFromPoint(cx, cy).slice(0,6).map(e => e.tagName + '[' + (e.getAttribute('data-testid') || String(e.className).split(' ').slice(0,2).join('.')) + ']');
    res(JSON.stringify(out, null, 1));
  }, 700));
})()" 2>&1

echo "=== P2. click Next and read the desk ==="
"$AB" click "[data-testid=pager-next]" 2>&1 | head -2
sleep 3
"$AB" eval "JSON.stringify({status: document.querySelector('[data-testid=pager-status]')?.textContent?.trim(), census: document.querySelector('[data-testid=tx-census]')?.textContent?.trim()})" 2>&1

echo "=== P3. if stuck, click via JS dispatch (proves state law vs pointer interception) ==="
"$AB" eval "
(() => {
  const next = document.querySelector('[data-testid=pager-next]');
  next.dispatchEvent(new MouseEvent('click', {bubbles: true, cancelable: true}));
  return 'dispatched';
})()" 2>&1
sleep 3
"$AB" eval "JSON.stringify({status: document.querySelector('[data-testid=pager-status]')?.textContent?.trim(), census: document.querySelector('[data-testid=tx-census]')?.textContent?.trim()})" 2>&1

echo "=== P4. the Radix gait: open trigger, listbox options ==="
"$AB" eval "
(() => {
  const trig = document.querySelector('[aria-label=\"Rows per page\"]');
  if (!trig) return 'NO TRIGGER';
  trig.dispatchEvent(new PointerEvent('pointerdown', {bubbles: true}));
  trig.click();
  return 'opened';
})()" 2>&1
sleep 2
"$AB" eval "JSON.stringify({listbox: Array.from(document.querySelectorAll('[role=option]')).map(o => o.textContent?.trim())})" 2>&1
echo "=== DIAG DONE ==="
