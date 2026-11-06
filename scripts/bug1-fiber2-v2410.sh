#!/bin/bash
# bug1-fiber2-v2410.sh — catch the /console switcher remount in the act (v2).
#
# Fixes over fiber v1: MutationObserver installed BEFORE the click records
# every childList change in the trigger's ancestor generations with a
# timestamp (the remount cannot slip past it); click retries until the menu
# actually opens; survival map fixed (plain join, no stringify).
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
echo "token: ${#TOKEN} chars"

$AB close --all >/dev/null 2>&1
$AB open http://localhost:3000/console >/dev/null 2>&1
$AB eval "localStorage.clear()" >/dev/null 2>&1
$AB eval "localStorage.setItem('mbt_token', '$TOKEN')" >/dev/null 2>&1
$AB reload >/dev/null 2>&1
sleep 20
$AB press Escape >/dev/null 2>&1; sleep 1
$AB find text "Got it" click >/dev/null 2>&1; sleep 1

# install ancestor tags + the live mutation recorder
$AB eval 'window.__anc=[];(function(){var el=document.querySelector("[data-testid=console-currency-switcher]");if(!el){window.__tagfail=1;return}var p=el;while(p&&p!==document.body){window.__anc.push(p);p=p.parentElement}window.__anc.push(document.body);window.__mut=[];window.__mo=new MutationObserver(function(ms){ms.forEach(function(m){var idx=window.__anc.indexOf(m.target);window.__mut.push((idx>=0?String(idx):"x")+":"+Math.round(performance.now()))})});window.__anc.forEach(function(a){window.__mo.observe(a,{childList:true})})})();"tagged:"+ (window.__anc.length)' 2>/dev/null | tr -d '"'
echo " ^ tagged (empty=trigger absent)"

# click until the menu opens (max 3 tries)
OPENED=0
for try in 1 2 3; do
  $AB click '[data-testid="console-currency-switcher"]' >/dev/null 2>&1
  sleep 1
  M=$($AB eval 'document.querySelectorAll("[role=menu]").length' 2>/dev/null | tr -d '"')
  echo "try $try: menu=$M"
  if [ "$M" = "1" ]; then OPENED=1; break; fi
done
[ "$OPENED" = 1 ] || echo "(never opened this run — mutation log still decides)"

sleep 5
echo "── mutation log (generation:ms-since-install, generation 0=trigger .. N=body) ──"
$AB eval '(window.__mut||[]).slice(0,40).join(" ")' 2>/dev/null | tr -d '"'
echo ""
echo "── old ancestor survival (i:alive|gone) ──"
$AB eval '(window.__anc||[]).map(function(el,i){return i+(el.isConnected?":alive":":gone")}).join(" ")' 2>/dev/null | tr -d '"'
echo ""
echo "── current menu count + trigger state ──"
$AB eval 'document.querySelectorAll("[role=menu]").length' 2>/dev/null | tr -d '"'
$AB eval '(document.querySelector("[data-testid=console-currency-switcher]")||{getAttribute:function(){return "gone"}}).getAttribute("data-state")' 2>/dev/null | tr -d '"'

$AB close --all >/dev/null 2>&1
pkill -f "next dev" 2>/dev/null; pkill -f "next-server" 2>/dev/null
echo "done"
