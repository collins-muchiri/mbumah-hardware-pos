#!/usr/bin/env bash
# v2.456.0 CLOSING burst — proves the tones weave's face live on main.
# Laws: single-call burst; every leg NON-VACUOUS; JSON-QUOTE law (tr -d '"').
set -u
cd /home/z/ems
AB="agent-browser"
pkill -f "next dev -p 3200" 2>/dev/null || true; sleep 2
LOG=/tmp/qa3200v2456close.log
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

echo "== LEG C: the debt-plans lens — tones ride the loom (pressed + counts) =="
"$AB" open "http://localhost:3200/?tab=debt-plans" > /dev/null 2>&1; sleep 14
"$AB" eval "JSON.stringify({
  chips: [...document.querySelectorAll('button[aria-pressed]')].filter(b=>b.querySelector('span')).length,
  pressed: [...document.querySelectorAll('button[aria-pressed=\"true\"]')].map(b=>b.textContent.replace(/\d+$/,'').trim().slice(0,20)),
  ringRides: [...document.querySelectorAll('button[aria-pressed]')].filter(b=>b.className.includes('ring-zinc-400')).length
})" 2>&1 | head -8

echo "== LEG D: the exports lens — THE NEW FACE: status chips speak aria-pressed =="
"$AB" open "http://localhost:3200/?tab=data-exports" > /dev/null 2>&1; sleep 12
"$AB" eval "JSON.stringify({
  statusChips: [...document.querySelectorAll('button[aria-pressed]')].filter(b=>/All|Completed|Failed|Processing|Cancelled/.test(b.textContent)).length,
  allPressed: [...document.querySelectorAll('button[aria-pressed=\"true\"]')].map(b=>b.textContent.trim().slice(0,24)),
  cancelledChip: [...document.querySelectorAll('button[aria-pressed]')].some(b=>/Cancelled/.test(b.textContent)),
  rows: document.querySelectorAll('table tbody tr').length
})" 2>&1 | head -8

echo "== LEG E: the transactions regression — the first weave still speaks =="
"$AB" open "http://localhost:3200/?tab=transactions" > /dev/null 2>&1; sleep 12
"$AB" eval "JSON.stringify({ pressedChips: document.querySelectorAll('button[aria-pressed]').length, pressedTrue: document.querySelectorAll('button[aria-pressed=\"true\"]').length })" 2>&1 | head -4

echo "== LEG F: screenshot + dev log errors =="
"$AB" screenshot /tmp/qa-v2456-tones.png > /dev/null 2>&1 && echo "screenshot taken"
grep -ciE "error|unhandled" "$LOG" || true

pkill -f "next dev -p 3200" 2>/dev/null || true
echo "BURST DONE"
