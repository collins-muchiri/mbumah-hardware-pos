#!/bin/bash
# bug1-matrix-v2410.sh — the decisive BUG 1 experiment matrix.
#
# A. SETTLED: page fully settled (trigger present + 12 s), open → 12 s watch:
#    does the menu survive? do the two queries FIRE (window.__f + dev log)?
#    do chip/freshness render?
# B. REOPEN (still settled): close, reopen → same watch (does the SECOND
#    open fetch even after a first that didn't?)
# C. BOOT WINDOW: reload, click the MOMENT the trigger appears (mid-boot),
#    then watch for the remount (menu death + trigger replacement).
set -u
cd /home/z/ems
AB="agent-browser"
DEVLOG=/tmp/bug1-dev.log
INSTALL='window.__f=[];if(!window.__of){window.__of=window.fetch;window.fetch=function(...a){window.__f.push(typeof a[0]==="string"?a[0]:(a[0]&&a[0].url)||"?");return window.__of.apply(window,a)}};window.__e=[];window.addEventListener("error",function(e){window.__e.push(String(e.message))});"ok"'
logcount() { rg -c "$1" "$DEVLOG" 2>/dev/null || echo 0; }
MENUC=$($AB eval 'document.querySelectorAll("[role=menu]").length' 2>/dev/null | tr -d '"')

pkill -f "next dev" 2>/dev/null; pkill -f "next-server" 2>/dev/null; sleep 1
curl -s -o /dev/null -m 2 http://localhost:3000 && { echo "FAIL port busy"; exit 1; }
env -u DATABASE_URL NODE_OPTIONS="--max-old-space-size=3072" nohup npm run dev > "$DEVLOG" 2>&1 &
for _ in $(seq 1 75); do curl -s -m 2 http://localhost:3000/api/health 2>/dev/null | rg -q '"status":"ok"' && break; sleep 2; done
echo "booted"

TOKEN=$(curl -s -m 15 -X POST http://localhost:3000/api/auth/login -H 'Content-Type: application/json' \
  -d '{"email":"admin@mbumahhardware.co.ke","password":"password123"}' \
  | node -e "let d='';process.stdin.on('data',c=>d+=c).on('end',()=>{try{const j=JSON.parse(d);process.stdout.write((j.data&&j.data.token)||'')}catch{}})")

$AB close --all >/dev/null 2>&1
$AB open http://localhost:3000/console >/dev/null 2>&1
$AB eval "localStorage.clear()" >/dev/null 2>&1
$AB eval "localStorage.setItem('mbt_token', '$TOKEN')" >/dev/null 2>&1
$AB reload >/dev/null 2>&1
sleep 20
$AB press Escape >/dev/null 2>&1; sleep 1
$AB find text "Got it" click >/dev/null 2>&1; sleep 1

# wait until the trigger exists, then +12 s settle
for _ in $(seq 1 30); do
  P=$($AB eval '!!document.querySelector("[data-testid=console-currency-switcher]")' 2>/dev/null | tr -d '"')
  [ "$P" = "true" ] && break; sleep 2
done
sleep 12
$AB eval "$INSTALL" >/dev/null 2>&1
RA0=$(logcount "GET /api/currency/rates"); BR0=$(logcount "GET /api/settings/currency")
echo "── A. SETTLED OPEN ──"
$AB click '[data-testid="console-currency-switcher"]' >/dev/null 2>&1
for i in 1 2 3 4 5 6 7 8 9 10 11 12; do
  M=$($AB eval 'document.querySelectorAll("[role=menu]").length' 2>/dev/null | tr -d '"')
  S=$($AB eval '(document.querySelector("[data-testid=console-currency-switcher]")||{getAttribute:function(){return "gone"}}).getAttribute("data-state")' 2>/dev/null | tr -d '"')
  echo "  t=${i}s menu=$M state=$S"
  sleep 1
done
F=$($AB eval 'JSON.stringify((window.__f||[]).filter(function(u){return u.indexOf("currency")>=0}))' 2>/dev/null | tr -d '"')
CHIP=$($AB eval 'document.body.innerText.includes("branch default")' 2>/dev/null | tr -d '"')
FRESH=$($AB eval 'document.body.innerText.includes("Wire read at")' 2>/dev/null | tr -d '"')
RA1=$(logcount "GET /api/currency/rates"); BR1=$(logcount "GET /api/settings/currency")
echo "  fetches=$F chip=$CHIP freshness=$FRESH devdelta: rates+$((RA1-RA0)) settings+$((BR1-BR0))"

echo "── B. REOPEN (close, reopen) ──"
$AB press Escape >/dev/null 2>&1; sleep 1
$AB eval 'window.__f=[]' >/dev/null 2>&1
RA0=$(logcount "GET /api/currency/rates"); BR0=$(logcount "GET /api/settings/currency")
$AB click '[data-testid="console-currency-switcher"]' >/dev/null 2>&1
for i in 1 2 3 4 5 6; do
  M=$($AB eval 'document.querySelectorAll("[role=menu]").length' 2>/dev/null | tr -d '"')
  S=$($AB eval '(document.querySelector("[data-testid=console-currency-switcher]")||{getAttribute:function(){return "gone"}}).getAttribute("data-state")' 2>/dev/null | tr -d '"')
  echo "  t=${i}s menu=$M state=$S"
  sleep 1
done
F=$($AB eval 'JSON.stringify((window.__f||[]).filter(function(u){return u.indexOf("currency")>=0}))' 2>/dev/null | tr -d '"')
CHIP=$($AB eval 'document.body.innerText.includes("branch default")' 2>/dev/null | tr -d '"')
FRESH=$($AB eval 'document.body.innerText.includes("Wire read at")' 2>/dev/null | tr -d '"')
RA1=$(logcount "GET /api/currency/rates"); BR1=$(logcount "GET /api/settings/currency")
echo "  fetches=$F chip=$CHIP freshness=$FRESH devdelta: rates+$((RA1-RA0)) settings+$((BR1-BR0))"

echo "── C. BOOT-WINDOW OPEN ──"
$AB eval "localStorage.clear()" >/dev/null 2>&1
$AB eval "localStorage.setItem('mbt_token', '$TOKEN')" >/dev/null 2>&1
$AB reload >/dev/null 2>&1
HIT=0
for _ in $(seq 1 40); do
  P=$($AB eval '!!document.querySelector("[data-testid=console-currency-switcher]")' 2>/dev/null | tr -d '"')
  if [ "$P" = "true" ]; then HIT=1; break; fi
  sleep 1
done
echo "  trigger appeared after poll ${_} (hit=$HIT)"
$AB eval "$INSTALL" >/dev/null 2>&1
$AB click '[data-testid="console-currency-switcher"]' >/dev/null 2>&1
for i in 1 2 3 4 5 6 7 8 9 10; do
  M=$($AB eval 'document.querySelectorAll("[role=menu]").length' 2>/dev/null | tr -d '"')
  S=$($AB eval '(document.querySelector("[data-testid=console-currency-switcher]")||{getAttribute:function(){return "gone"}}).getAttribute("data-state")' 2>/dev/null | tr -d '"')
  echo "  t=${i}s menu=$M state=$S"
  sleep 1
done
F=$($AB eval 'JSON.stringify((window.__f||[]).filter(function(u){return u.indexOf("currency")>=0}))' 2>/dev/null | tr -d '"')
CHIP=$($AB eval 'document.body.innerText.includes("branch default")' 2>/dev/null | tr -d '"')
FRESH=$($AB eval 'document.body.innerText.includes("Wire read at")' 2>/dev/null | tr -d '"')
echo "  fetches=$F chip=$CHIP freshness=$FRESH"

$AB close --all >/dev/null 2>&1
pkill -f "next dev" 2>/dev/null; pkill -f "next-server" 2>/dev/null
echo "done"
