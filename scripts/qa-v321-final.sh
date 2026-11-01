#!/usr/bin/env bash
# v2.321.0 final QA burst — ONE tool call: boot :3200, probe the gait,
# the ?limit= deep-link, the scope-reset re-anchor, and the honest door.
set -u
cd /home/z/ems
fuser -k 3200/tcp 2>/dev/null || true; sleep 2
LOG=/tmp/qa3200v321final.log
DATABASE_URL="file:/home/z/ems/db/audit-dev.db" NODE_ENV=development nohup npx next dev -p 3200 > "$LOG" 2>&1 &
for i in $(seq 1 60); do
  code=$(curl -s --max-time 3 -o /dev/null -w '%{http_code}' http://localhost:3200/api/health 2>/dev/null || true)
  [ "$code" = "200" ] && { echo "healthy after ${i} polls"; break; }
  sleep 3
done
AB="agent-browser"

echo "=== A. THE BUG FIX, LIVE: garbage params at the door (were 500 in v2.320) ==="
"$AB" open "http://localhost:3200/?tab=loyalty&view=transactions" > /dev/null 2>&1 || true
sleep 7
"$AB" key Escape > /dev/null 2>&1 || true
sleep 2
"$AB" eval "
(async () => {
  const store = JSON.parse(localStorage.getItem('mbt_app_store') || '{}');
  const storeId = store?.state?.currentStoreId || '';
  const probe = async (q) => {
    const r = await fetch('/api/loyalty/transactions?storeId=' + storeId + '&' + q);
    let body = {};
    try { body = await r.json(); } catch {}
    return { q, status: r.status, total: body?.pagination?.total, totalPages: body?.pagination?.totalPages, rows: (body?.transactions || body?.data || body?.items || []).length };
  };
  const out = [];
  out.push(await probe('limit=abc'));
  out.push(await probe('page=abc'));
  out.push(await probe('limit=500'));
  out.push(await probe('limit=0'));
  out.push(await probe('limit=50&page=2'));
  return JSON.stringify(out);
})()" 2>&1

echo "=== B. the gait Select exists in the toolbar ==="
"$AB" eval "JSON.stringify({gaitSelect: !!document.querySelector('[aria-label=\"Rows per page\"]'), options: Array.from(document.querySelectorAll('[aria-label=\"Rows per page\"] option')).map(o => o.textContent?.trim())})" 2>&1

echo "=== C. default census (100 gait, 126 rows -> 2 pages) ==="
"$AB" eval "JSON.stringify({census: document.querySelector('[data-testid=tx-census]')?.textContent?.trim(), status: document.querySelector('[data-testid=pager-status]')?.textContent?.trim(), rows: document.querySelectorAll('table tbody tr').length})" 2>&1

echo "=== D. deep-link ?limit=50 lands whole (page 1 of 3, 50 rows) ==="
"$AB" open "http://localhost:3200/?tab=loyalty&view=transactions&limit=50" > /dev/null 2>&1 || true
sleep 5
"$AB" key Escape > /dev/null 2>&1 || true
sleep 2
"$AB" eval "JSON.stringify({census: document.querySelector('[data-testid=tx-census]')?.textContent?.trim(), status: document.querySelector('[data-testid=pager-status]')?.textContent?.trim(), rows: document.querySelectorAll('table tbody tr').length})" 2>&1

echo "=== E. THE SCOPE-RESET, LIVE: Next -> page 2, then gait 200 -> re-anchor page 1 ==="
"$AB" click "[data-testid=pager-next]" > /dev/null 2>&1 || true
sleep 3
echo "-- after Next (page 2 of 3):"
"$AB" eval "JSON.stringify({census: document.querySelector('[data-testid=tx-census]')?.textContent?.trim(), status: document.querySelector('[data-testid=pager-status]')?.textContent?.trim()})" 2>&1
"$AB" eval "
(() => {
  const sel = document.querySelector('[aria-label=\"Rows per page\"]');
  const setter = Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, 'value').set;
  setter.call(sel, '200');
  sel.dispatchEvent(new Event('change', { bubbles: true }));
  return 'gait set to 200';
})()" 2>&1
sleep 3
echo "-- after gait 200 (one page, pager hides):"
"$AB" eval "JSON.stringify({census: document.querySelector('[data-testid=tx-census]')?.textContent?.trim() ?? '(hidden)', status: document.querySelector('[data-testid=pager-status]')?.textContent?.trim() ?? '(hidden)', rows: document.querySelectorAll('table tbody tr').length})" 2>&1
"$AB" eval "
(() => {
  const sel = document.querySelector('[aria-label=\"Rows per page\"]');
  const setter = Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, 'value').set;
  setter.call(sel, '50');
  sel.dispatchEvent(new Event('change', { bubbles: true }));
  return 'gait back to 50';
})()" 2>&1
sleep 3
echo "-- after gait 50 again (must be PAGE 1 of 3, never stranded on page 2):"
"$AB" eval "JSON.stringify({census: document.querySelector('[data-testid=tx-census]')?.textContent?.trim(), status: document.querySelector('[data-testid=pager-status]')?.textContent?.trim(), rows: document.querySelectorAll('table tbody tr').length})" 2>&1

echo "=== F. malformed deep-link ?limit=abc answers the fallback 100 ==="
"$AB" open "http://localhost:3200/?tab=loyalty&view=transactions&limit=abc" > /dev/null 2>&1 || true
sleep 5
"$AB" key Escape > /dev/null 2>&1 || true
sleep 2
"$AB" eval "JSON.stringify({census: document.querySelector('[data-testid=tx-census]')?.textContent?.trim(), rows: document.querySelectorAll('table tbody tr').length})" 2>&1

echo "=== G. between-the-gaits deep-link ?limit=150 answers the fallback 100 ==="
"$AB" open "http://localhost:3200/?tab=loyalty&view=transactions&limit=150" > /dev/null 2>&1 || true
sleep 5
"$AB" eval "JSON.stringify({census: document.querySelector('[data-testid=tx-census]')?.textContent?.trim(), rows: document.querySelectorAll('table tbody tr').length})" 2>&1

echo "=== H. console errors? ==="
"$AB" console 2>&1 | grep -iE "error|warn" | grep -v "React DevTools" | head -5 || echo "(console clean)"
echo "=== DONE ==="
