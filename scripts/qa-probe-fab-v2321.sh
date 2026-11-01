#!/usr/bin/env bash
# v2.321.0 FAB-vs-pager probe — why did the yield law not fire?
set -u
cd /home/z/ems
fuser -k 3200/tcp 2>/dev/null || true; sleep 2
LOG=/tmp/qa3200v321e.log
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
"$AB" eval "
const next = document.querySelector('[data-testid=pager-next]');
const fab = document.querySelector('button.fixed.bottom-6');
if (!next || !fab) { 'missing: next=' + !!next + ' fab=' + !!fab }
else {
  const nr = next.getBoundingClientRect();
  const fr = fab.getBoundingClientRect();
  const cx = nr.left + nr.width / 2, cy = nr.top + nr.height / 2;
  const stack = document.elementsFromPoint(cx, cy).map(e => e.tagName + '.' + (e.className && e.className.baseVal !== undefined ? e.className.baseVal : String(e.className || '')).split(' ').slice(0,3).join('.'));
  JSON.stringify({
    viewport: window.innerWidth + 'x' + window.innerHeight,
    nextRect: {l: Math.round(nr.left), t: Math.round(nr.top), r: Math.round(nr.right), b: Math.round(nr.bottom)},
    fabRect: {l: Math.round(fr.left), t: Math.round(fr.top), r: Math.round(fr.right), b: Math.round(fr.bottom)},
    fabClass: fab.className.includes('pointer-events-none') ? 'YIELDED' : 'ACTIVE',
    fabOpacity: getComputedStyle(fab).opacity,
    stackAtNextCenter: stack.slice(0, 5),
    overlap: !(nr.right < fr.left || nr.left > fr.right || nr.bottom < fr.top || nr.top > fr.bottom)
  }, null, 1)
}" 2>&1
echo "=== probe done ==="
