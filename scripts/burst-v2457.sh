#!/usr/bin/env bash
# v2.457.0 CLOSING burst — proves the tints weave's face live on main.
# Laws: single-call burst; every leg NON-VACUOUS; JSON-QUOTE law (tr -d '"').
set -u
cd /home/z/ems
AB="agent-browser"
pkill -f "next dev -p 3200" 2>/dev/null || true; sleep 2
LOG=/tmp/qa3200v2457close.log
DATABASE_URL="file:/home/z/ems/db/audit-dev.db" NODE_ENV=development nohup npx next dev -p 3200 > "$LOG" 2>&1 &
for i in $(seq 1 50); do
  code=$(curl -s --max-time 3 -o /dev/null -w '%{http_code}' http://localhost:3200/api/health 2>/dev/null || true)
  [ "$code" = "200" ] && { echo "healthy after ${i} polls"; break; }
  sleep 3
done

echo "== LEG A: the fixtures re-light =="
DATABASE_URL="file:/home/z/ems/db/audit-dev.db" npm run db:fixtures 2>&1 | grep -cE "world lit"

echo "== LEG B: login =="
"$AB" open "http://localhost:3200/" > /dev/null 2>&1; sleep 9
"$AB" fill '#email' 'admin@mbumahhardware.co.ke' > /dev/null 2>&1
"$AB" fill '#password' 'password123' > /dev/null 2>&1
"$AB" press Enter > /dev/null 2>&1; sleep 7

echo "== LEG C: THE HEADLINE — the goal chips ride the loom (ring arrives) =="
"$AB" open "http://localhost:3200/hr/performance?status=OPEN" > /dev/null 2>&1; sleep 16
"$AB" eval "JSON.stringify({
  chips: document.querySelectorAll('[data-testid^=goal-filter-status-]').length,
  pressed: document.querySelectorAll('[data-testid^=goal-filter-status-][aria-pressed=true]').length,
  openFace: (document.querySelector('[data-testid=goal-filter-status-OPEN]')||{className:'ABSENT'}).className.slice(-170),
  allFace: (document.querySelector('[data-testid=goal-filter-status-ALL]')||{className:'ABSENT'}).className.slice(-130),
  ringHave: [...document.querySelectorAll('[data-testid^=goal-filter-status-]')].filter(b=>b.className.includes('ring-zinc-400')).length,
  slimHead: [...document.querySelectorAll('[data-testid^=goal-filter-status-]')].filter(b=>b.className.includes('px-2.5 py-0.5')).length
})" 2>&1 | tr -d '"' | head -10

echo "== LEG D: the tones face regression — debt-plans still speaks =="
"$AB" open "http://localhost:3200/?tab=debt-plans" > /dev/null 2>&1; sleep 14
"$AB" eval "JSON.stringify({
  chips: document.querySelectorAll('button[aria-pressed]').length,
  pressed: document.querySelectorAll('button[aria-pressed=\"true\"]').length,
  rings: [...document.querySelectorAll('button[aria-pressed]')].filter(b=>b.className.includes('ring-zinc-400')).length
})" 2>&1 | tr -d '"' | head -4

echo "== LEG E: the exports lens regression =="
"$AB" open "http://localhost:3200/?tab=data-exports" > /dev/null 2>&1; sleep 12
"$AB" eval "JSON.stringify({
  statusChips: [...document.querySelectorAll('button[aria-pressed]')].filter(b=>/All|Completed|Failed|Processing|Cancelled/.test(b.textContent)).length,
  rows: document.querySelectorAll('table tbody tr').length
})" 2>&1 | tr -d '"' | head -4

echo "== LEG F: version face + screenshot + dev log errors =="
curl -s --max-time 8 http://localhost:3200/api/health | rg -o '"version":"[^"]*"' | head -1
"$AB" screenshot /tmp/qa-v2457-tints.png > /dev/null 2>&1 && echo "screenshot taken"
grep -ciE "error|unhandled" "$LOG" || true

pkill -f "next dev -p 3200" 2>/dev/null || true
echo "BURST DONE"
