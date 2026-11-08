#!/usr/bin/env bash
# v2.459.0 CLOSING burst — proves the glass weave's face live.
# Laws: single-call burst; every leg NON-VACUOUS; JSON-QUOTE law (tr -d '"').
set -u
cd /home/z/ems
AB="agent-browser"
pkill -f "next dev -p 3200" 2>/dev/null || true; sleep 2
LOG=/tmp/qa3200v2459close.log
DATABASE_URL="file:/home/z/ems/db/audit-dev.db" NODE_ENV=development nohup npx next dev -p 3200 > "$LOG" 2>&1 &
for i in $(seq 1 60); do
  code=$(curl -s --max-time 3 -o /dev/null -w '%{http_code}' http://localhost:3200/api/health 2>/dev/null || true)
  [ "$code" = "200" ] && break
  sleep 3
done
for i in $(seq 1 60); do
  code=$(curl -s --max-time 15 -o /dev/null -w '%{http_code}' http://localhost:3200/ 2>/dev/null || true)
  [ "$code" = "200" ] && { echo "root 200 after $i polls"; break; }
  sleep 3
done

echo "== LEG A: the fixtures re-light =="
DATABASE_URL="file:/home/z/ems/db/audit-dev.db" npm run db:fixtures 2>&1 | grep -cE "world lit"

echo "== LEG B: login (conditional — the profile may already carry the session) =="
"$AB" open "http://localhost:3200/" > /dev/null 2>&1; sleep 6
"$AB" fill '#email' 'admin@mbumahhardware.co.ke' > /dev/null 2>&1 && "$AB" fill '#password' 'password123' > /dev/null 2>&1 && "$AB" press Enter > /dev/null 2>&1 && echo "filled+enter" || echo "already signed in"
sleep 8

echo "== LEG C: THE HEADLINE — the customers chips ride the loom =="
"$AB" open "http://localhost:3200/?tab=customers" > /dev/null 2>&1; sleep 16
"$AB" eval "JSON.stringify({
  chips: [...document.querySelectorAll('button')].filter(b=>/^(All|Active|With Debt|Loyalty Members)/.test(b.textContent.trim()) && b.querySelector('span.rounded-full')).length,
  pressedTotal: [...document.querySelectorAll('button')].filter(b=>/^(All|Active|With Debt|Loyalty Members)/.test(b.textContent.trim()) && b.querySelector('span.rounded-full') && b.getAttribute('aria-pressed')!==null).length,
  pressedTrue: [...document.querySelectorAll('button')].filter(b=>/^(All|Active|With Debt|Loyalty Members)/.test(b.textContent.trim()) && b.querySelector('span.rounded-full') && b.getAttribute('aria-pressed')==='true').length,
  emeraldActiveNew: [...document.querySelectorAll('button')].filter(b=>b.className.includes('bg-emerald-100 text-emerald-800 border-emerald-300')).length,
  glassIdle: [...document.querySelectorAll('button')].filter(b=>b.className.includes('bg-white/60 text-muted-foreground')).length,
  badges: [...document.querySelectorAll('button span.rounded-full')].filter(s=>s.className.includes('text-[10px] font-bold')).length,
  zincRing: [...document.querySelectorAll('button')].filter(b=>/^(All|Active|With Debt|Loyalty Members)/.test(b.textContent.trim()) && b.querySelector('span.rounded-full') && b.className.includes('ring-zinc-400')).length,
  loomHead: [...document.querySelectorAll('button')].filter(b=>/^(All|Active|With Debt|Loyalty Members)/.test(b.textContent.trim()) && b.querySelector('span.rounded-full') && b.className.includes('px-3 py-1.5 rounded-full text-xs font-medium border transition-all')).length,
  driftedEmerald: [...document.querySelectorAll('button')].filter(b=>b.className.includes('bg-emerald-100 text-emerald-700')).length,
  activeText: ([...document.querySelectorAll('button')].find(b=>b.className.includes('bg-emerald-100 text-emerald-800'))||{textContent:'ABSENT'}).textContent.trim()
})" 2>&1 | tr -d '"' | head -14

echo "== LEG D: the tones face regression — debt-plans + exports =="
"$AB" open "http://localhost:3200/?tab=debt-plans" > /dev/null 2>&1; sleep 13
"$AB" eval "JSON.stringify({ dpChips: document.querySelectorAll('button[aria-pressed]').length, dpRings: [...document.querySelectorAll('button[aria-pressed]')].filter(b=>b.className.includes('ring-zinc-400')).length })" 2>&1 | tr -d '"' | head -4
"$AB" open "http://localhost:3200/?tab=data-exports" > /dev/null 2>&1; sleep 12
"$AB" eval "JSON.stringify({ exChips: [...document.querySelectorAll('button[aria-pressed]')].filter(b=>/All|Completed|Failed|Processing|Cancelled/.test(b.textContent)).length, rows: document.querySelectorAll('table tbody tr').length })" 2>&1 | tr -d '"' | head -4

echo "== LEG E: the HR faces regression — goal + review chips =="
"$AB" open "http://localhost:3200/hr/performance" > /dev/null 2>&1; sleep 16
"$AB" eval "JSON.stringify({ goalChips: document.querySelectorAll('[data-testid^=goal-filter-status-]').length, goalRing: [...document.querySelectorAll('[data-testid^=goal-filter-status-]')].filter(b=>b.className.includes('ring-zinc-400')).length, reviewChips: document.querySelectorAll('[data-testid^=review-filter-status-]:not([data-testid=review-filter-status-chip])').length })" 2>&1 | tr -d '"' | head -6

echo "== LEG F: version face + screenshot + dev log errors =="
curl -s --max-time 8 http://localhost:3200/api/health | rg -o '"version":"[^"]*"' | head -1
"$AB" screenshot /tmp/qa-v2459-glass.png > /dev/null 2>&1 && echo "screenshot taken"
grep -ciE "error|unhandled" "$LOG" || true

pkill -f "next dev -p 3200" 2>/dev/null || true
echo "BURST DONE"
