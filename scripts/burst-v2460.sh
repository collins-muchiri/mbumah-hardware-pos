#!/usr/bin/env bash
# v2.460.0 CLOSING burst — proves the homecoming's face live:
# the data-colored tribes' pressed voice + ring, the retired masquerade,
# the retired scale dialect, and the standing regression faces.
# Laws: single-call burst; every leg NON-VACUOUS; JSON-QUOTE law (tr -d '"').
set -u
cd /home/z/ems
AB="agent-browser"
pkill -f "next dev -p 3200" 2>/dev/null || true; sleep 2
LOG=/tmp/qa3200v2460close.log
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

echo "== LEG C: THE HEADLINE — the POS chips speak the family grammar =="
"$AB" open "http://localhost:3200/?tab=pos" > /dev/null 2>&1; sleep 16
"$AB" eval "JSON.stringify({
  chips: [...document.querySelectorAll('button')].filter(b=>b.className.includes('chip-hover-lift')).length,
  pressedTotal: [...document.querySelectorAll('button')].filter(b=>b.className.includes('chip-hover-lift') && b.getAttribute('aria-pressed')!==null).length,
  pressedTrue: [...document.querySelectorAll('button')].filter(b=>b.className.includes('chip-hover-lift') && b.getAttribute('aria-pressed')==='true').length,
  chipActiveDom: document.querySelectorAll('.chip-active').length,
  activeScale: [...document.querySelectorAll('button')].filter(b=>b.className.includes('chip-hover-lift') && b.className.includes('scale-105') && b.className.includes('oklch')).length,
  idleFace: [...document.querySelectorAll('button')].filter(b=>b.className.includes('chip-hover-lift') && b.className.includes('bg-muted/50 text-muted-foreground border-border')).length,
  zincRing: [...document.querySelectorAll('button')].filter(b=>b.className.includes('chip-hover-lift') && b.className.includes('ring-zinc-400')).length,
  activeText: ([...document.querySelectorAll('button.chip-hover-lift')].find(b=>b.getAttribute('aria-pressed')==='true')||{textContent:'ABSENT'}).textContent.trim()
})" 2>&1 | tr -d '"' | head -12

echo "== LEG D: the inventory tags — the scale dialect retired =="
"$AB" open "http://localhost:3200/?tab=inventory" > /dev/null 2>&1; sleep 14
"$AB" eval "JSON.stringify({
  invChips: [...document.querySelectorAll('button')].filter(b=>b.className.includes('rounded-full') && b.className.includes('font-medium') && b.className.includes('border')).length,
  invPressed: [...document.querySelectorAll('button')].filter(b=>b.className.includes('inline-flex items-center gap-1.5') && b.getAttribute('aria-pressed')!==null).length,
  invScaleGone: [...document.querySelectorAll('button')].filter(b=>b.className.includes('hover:scale-105')).length,
  invRing: [...document.querySelectorAll('button')].filter(b=>b.className.includes('inline-flex items-center gap-1.5') && b.className.includes('ring-zinc-400')).length,
  activeText: ([...document.querySelectorAll('button')].find(b=>b.className.includes('inline-flex items-center gap-1.5') && b.getAttribute('aria-pressed')==='true')||{textContent:'ABSENT'}).textContent.trim()
})" 2>&1 | tr -d '"' | head -8

echo "== LEG E: the standing regression faces =="
"$AB" open "http://localhost:3200/?tab=data-exports" > /dev/null 2>&1; sleep 12
"$AB" eval "JSON.stringify({ exChips: [...document.querySelectorAll('button[aria-pressed]')].filter(b=>/All|Completed|Failed|Processing|Cancelled/.test(b.textContent)).length, rows: document.querySelectorAll('table tbody tr').length })" 2>&1 | tr -d '"' | head -4
"$AB" open "http://localhost:3200/?tab=customers" > /dev/null 2>&1; sleep 13
"$AB" eval "JSON.stringify({ chips: [...document.querySelectorAll('button')].filter(b=>/^(All|Active|With Debt|Loyalty Members)/.test(b.textContent.trim()) && b.querySelector('span.rounded-full')).length, pressedTotal: [...document.querySelectorAll('button[aria-pressed]')].filter(b=>/^(All|Active|With Debt|Loyalty Members)/.test(b.textContent.trim()) && b.querySelector('span.rounded-full')).length, emeraldActiveNew: [...document.querySelectorAll('button')].filter(b=>b.className.includes('bg-emerald-100 text-emerald-800 border-emerald-300')).length, glassIdle: [...document.querySelectorAll('button')].filter(b=>b.className.includes('bg-white/60 text-muted-foreground')).length })" 2>&1 | tr -d '"' | head -6

echo "== LEG F: version face + screenshot + dev log errors =="
curl -s --max-time 8 http://localhost:3200/api/health | rg -o '"version":"[^"]*"' | head -1
"$AB" screenshot /tmp/qa-v2460-grammar.png > /dev/null 2>&1 && echo "screenshot taken"
grep -ciE "error|unhandled" "$LOG" || true

pkill -f "next dev -p 3200" 2>/dev/null || true
echo "BURST DONE"
