#!/usr/bin/env bash
# v2.321.0 final proof — the gait-change re-anchor through the real Radix UI.
set -u
cd /home/z/ems
fuser -k 3200/tcp 2>/dev/null || true; sleep 2
LOG=/tmp/qa3200v321reanchor.log
DATABASE_URL="file:/home/z/ems/db/audit-dev.db" NODE_ENV=development nohup npx next dev -p 3200 > "$LOG" 2>&1 &
for i in $(seq 1 60); do
  code=$(curl -s --max-time 3 -o /dev/null -w '%{http_code}' http://localhost:3200/api/health 2>/dev/null || true)
  [ "$code" = "200" ] && { echo "healthy after ${i} polls"; break; }
  sleep 3
done
AB="agent-browser"
"$AB" open "http://localhost:3200/?tab=loyalty&view=transactions&limit=50" > /dev/null 2>&1 || true
sleep 8
"$AB" key Escape > /dev/null 2>&1 || true
sleep 3

echo "=== 1. land (page 1 of 3 at gait 50) ==="
"$AB" eval "JSON.stringify({status: document.querySelector('[data-testid=pager-status]')?.textContent?.trim()})" 2>&1

echo "=== 2. Next -> page 2 ==="
"$AB" click "[data-testid=pager-next]" 2>&1 | head -1
sleep 4
"$AB" eval "JSON.stringify({status: document.querySelector('[data-testid=pager-status]')?.textContent?.trim(), census: document.querySelector('[data-testid=tx-census]')?.textContent?.trim()})" 2>&1

echo "=== 3. open the gait listbox and pick 200 / page ==="
"$AB" eval "
(() => {
  const trig = document.querySelector('[aria-label=\"Rows per page\"]');
  trig.dispatchEvent(new PointerEvent('pointerdown', {bubbles: true}));
  trig.click();
  return 'opened';
})()" 2>&1
sleep 2
"$AB" eval "
(() => {
  const opt = Array.from(document.querySelectorAll('[role=option]')).find(o => o.textContent?.includes('200'));
  if (!opt) return 'NO OPTION';
  opt.dispatchEvent(new PointerEvent('pointerdown', {bubbles: true}));
  opt.click();
  return 'picked 200';
})()" 2>&1
sleep 4
echo "-- at gait 200: one page, pager hides (126 rows fit) --"
"$AB" eval "JSON.stringify({status: document.querySelector('[data-testid=pager-status]')?.textContent?.trim() ?? '(pager hidden)', census: document.querySelector('[data-testid=tx-census]')?.textContent?.trim() ?? '(hidden)', rows: document.querySelectorAll('table tbody tr').length})" 2>&1

echo "=== 4. back to 50 / page: MUST re-anchor to page 1 of 3 (never stranded) ==="
"$AB" eval "
(() => {
  const trig = document.querySelector('[aria-label=\"Rows per page\"]');
  trig.dispatchEvent(new PointerEvent('pointerdown', {bubbles: true}));
  trig.click();
  return 'opened';
})()" 2>&1
sleep 2
"$AB" eval "
(() => {
  const opt = Array.from(document.querySelectorAll('[role=option]')).find(o => o.textContent?.includes('50'));
  opt.dispatchEvent(new PointerEvent('pointerdown', {bubbles: true}));
  opt.click();
  return 'picked 50';
})()" 2>&1
sleep 4
"$AB" eval "JSON.stringify({status: document.querySelector('[data-testid=pager-status]')?.textContent?.trim(), census: document.querySelector('[data-testid=tx-census]')?.textContent?.trim(), rows: document.querySelectorAll('table tbody tr').length})" 2>&1
echo "=== RE-ANCHOR PROOF DONE ==="
