#!/bin/bash
# bug1-fiber-v2410.sh — catch the /console switcher remount in the act.
#
# Technique: at load, tag every ancestor of the trigger with data-bug1-i
# (and keep the element list). After the open→remount window, walk the NEW
# trigger's ancestors and report which OLD ancestor elements are still
# connected — the deepest survivor is the remount boundary (everything
# below it was replaced). Also dump the React fiber ancestor chain names.
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

# TAG the ancestors + remember them in window.__anc (elements, not ids)
$AB eval 'window.__anc=[];(function(){var el=document.querySelector("[data-testid=console-currency-switcher]");var p=el;while(p&&p!==document.body){window.__anc.push(p);p=p.parentElement}})();window.__anc.push(document.body);"tagged:"+window.__anc.length' 2>/dev/null | tr -d '"'
echo "^ ancestors tagged"

$AB click '[data-testid="console-currency-switcher"]' >/dev/null 2>&1
sleep 1
M1=$($AB eval 'document.querySelectorAll("[role=menu]").length' 2>/dev/null | tr -d '"')
sleep 3
M4=$($AB eval 'document.querySelectorAll("[role=menu]").length' 2>/dev/null | tr -d '"')
echo "menu@1s=$M1 menu@4s=$M4"

# WHO SURVIVED?
$AB eval 'JSON.stringify(window.__anc.map(function(el,i){return i+":"+(el.isConnected?"alive":"replaced")})).join(","); ' 2>/dev/null | tr -d '"'
echo "^ old ancestor survival (0=trigger .. N=body)"

# NEW chain depth: how many ancestors does the NEW trigger have, and does
# the NEW header share the old body/shell?
$AB eval '(function(){var el=document.querySelector("[data-testid=console-currency-switcher]");if(!el)return "no-new-trigger";var n=0,p=el;while(p&&p!==document.body){n++;p=p.parentElement}return "new-depth:"+n})()' 2>/dev/null | tr -d '"'
echo "^ new trigger ancestor depth"

# React fiber ancestor chain of the NEW trigger (component names)
$AB eval '(function(){var el=document.querySelector("[data-testid=console-currency-switcher]");if(!el)return "none";var k=Object.keys(el).find(function(x){return x.indexOf("__reactFiber$")===0});if(!k)return "no-fiber";var f=el[k],names=[];while(f&&names.length<50){var t=f.type;names.push(t?(typeof t==="string"?t:(t.displayName||t.name||"anon")):("#"+f.tag));f=f.return}return names.slice(0,25).join(" < ")})()' 2>/dev/null | tr -d '"'
echo "^ fiber chain (new trigger, innermost first)"

$AB close --all >/dev/null 2>&1
pkill -f "next dev" 2>/dev/null; pkill -f "next-server" 2>/dev/null
echo "done"
