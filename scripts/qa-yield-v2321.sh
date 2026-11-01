#!/usr/bin/env bash
# v2.321.0 yield-law verification — scroll Next under the FAB like a human,
# let the probes settle, then read the FAB's state and click.
set -u
cd /home/z/ems
fuser -k 3200/tcp 2>/dev/null || true; sleep 2
LOG=/tmp/qa3200v321f.log
DATABASE_URL="file:/home/z/ems/db/audit-dev.db" NODE_ENV=development nohup npx next dev -p 3200 > "$LOG" 2>&1 &
for i in $(seq 1 60); do
  code=$(curl -s --max-time 3 -o /dev/null -w '%{http_code}' http://localhost:3200/api/health 2>/dev/null || true)
  [ "$code" = "200" ] && { echo "healthy after ${i} polls"; break; }
  sleep 3
done
AB="agent-browser"
"$AB" open "http://localhost:3200/?tab=loyalty&view=transactions" > /dev/null 2>&1 || true
sleep 6
"$AB" key Escape > /dev/null 2>&1 || true
sleep 2

echo "=== scroll Next into view (like a human), let the yield probes settle ==="
"$AB" eval "
new Promise(res => {
  const next = document.querySelector('[data-testid=pager-next]');
  next.scrollIntoView({block: 'center'});
  setTimeout(() => {
    const fab = document.querySelector('button.fixed.bottom-6');
    const nr = next.getBoundingClientRect();
    const fr = fab.getBoundingClientRect();
    const overlap = !(nr.right < fr.left || nr.left > fr.right || nr.bottom < fr.top || nr.top > fr.bottom);
    res(JSON.stringify({overlap, fabState: fab.className.includes('pointer-events-none') ? 'YIELDED' : 'ACTIVE', nextVisible: nr.top >= 0 && nr.bottom <= window.innerHeight}));
  }, 600);
})" 2>&1

echo "=== click Next after settle (the FAB must have yielded) ==="
"$AB" click "[data-testid=pager-next]" 2>&1 | head -1
sleep 3
"$AB" eval "JSON.stringify({census: document.querySelector('[data-testid=tx-census]')?.textContent?.trim(), status: document.querySelector('[data-testid=pager-status]')?.textContent?.trim()})" 2>&1

echo "=== and back (Prev) ==="
"$AB" click "[data-testid=pager-prev]" 2>&1 | head -1
sleep 3
"$AB" eval "JSON.stringify({status: document.querySelector('[data-testid=pager-status]')?.textContent?.trim()})" 2>&1
echo "=== yield verification done ==="
