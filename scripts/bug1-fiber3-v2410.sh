#!/bin/bash
# bug1-fiber3-v2410.sh — read the CurrencySwitcher's REAL hook state settled.
# v2: fiber walk matches type.name too.
set -u
cd /home/z/ems
AB="agent-browser"
DEVLOG=/tmp/bug1-dev.log

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
for _ in $(seq 1 30); do
  P=$($AB eval '!!document.querySelector("[data-testid=console-currency-switcher]")' 2>/dev/null | tr -d '"')
  [ "$P" = "true" ] && break; sleep 2
done
sleep 10

HOOKS='(function(){var el=document.querySelector("[data-testid=console-currency-switcher]");if(!el)return "no-el";var k=Object.keys(el).find(function(x){return x.indexOf("__reactFiber$")===0});if(!k)return "no-fiber";var f=el[k];while(f&&!(f.type&&(f.type.displayName==="CurrencySwitcher"||f.type.name==="CurrencySwitcher")))f=f.return;if(!f)return "no-cs-fiber";var h=f.memoizedState,out=[],i=0;while(h&&i<40){var v=h.memoizedState;var d="x";if(typeof v==="boolean")d=String(v);else if(typeof v==="string")d=JSON.stringify(v);else if(typeof v==="number")d=String(v);else if(v===null)d="null";out.push(i+"="+d);h=h.next;i++}return out.join(" ")})()'
CHAIN='(function(){var el=document.querySelector("[data-testid=console-currency-switcher]");var k=Object.keys(el).find(function(x){return x.indexOf("__reactFiber$")===0});var f=el[k],names=[];while(f&&names.length<30){names.push(f.type?(typeof f.type==="string"?f.type:(f.type.displayName||f.type.name||"anon")):"#"+f.tag);f=f.return}return names.slice(0,20).join(" < ")})()'

$AB click '[data-testid="console-currency-switcher"]' >/dev/null 2>&1
sleep 1
echo "── t=1s ──"
$AB eval 'document.querySelectorAll("[role=menu]").length' 2>/dev/null | tr -d '"'; echo " ^ menu"
$AB eval '(document.querySelector("[data-testid=console-currency-switcher]")||{getAttribute:function(){return "gone"}}).getAttribute("data-state")' 2>/dev/null | tr -d '"'; echo " ^ state"
$AB eval 'String(navigator.onLine)' 2>/dev/null | tr -d '"'; echo " ^ navigator.onLine"
$AB eval 'JSON.stringify(performance.getEntriesByType("resource").map(function(r){return r.name}).filter(function(n){return n.indexOf("currency")>=0}))' 2>/dev/null | tr -d '"'; echo " ^ resource entries (currency)"
$AB eval "$CHAIN" 2>/dev/null | tr -d '"'; echo " ^ fiber chain"
$AB eval "$HOOKS" 2>/dev/null | tr -d '"'; echo " ^ CurrencySwitcher hook chain"

sleep 3
echo "── t=4s ──"
$AB eval 'document.querySelectorAll("[role=menu]").length' 2>/dev/null | tr -d '"'; echo " ^ menu"
$AB eval "$HOOKS" 2>/dev/null | tr -d '"'; echo " ^ hook chain again"
$AB eval 'JSON.stringify(performance.getEntriesByType("resource").map(function(r){return r.name}).filter(function(n){return n.indexOf("currency")>=0}))' 2>/dev/null | tr -d '"'; echo " ^ resource entries again"

$AB close --all >/dev/null 2>&1
pkill -f "next dev" 2>/dev/null; pkill -f "next-server" 2>/dev/null
echo "done"
