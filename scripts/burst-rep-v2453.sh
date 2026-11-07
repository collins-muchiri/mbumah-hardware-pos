#!/bin/bash
# burst-rep-v2453.sh — the focused follow-up: the reports desk's customer_analysis
# card read with a PRECISE selector (the figure is the flex div's NEXT SIBLING),
# plus the page's own per-seat inventory and the store identity.
set -u
cd /home/z/ems
AB="agent-browser"

pkill -f "next dev" 2>/dev/null; pkill -f "next-server" 2>/dev/null; sleep 1
nohup npm run dev > /tmp/burst-rep-dev.log 2>&1 &
for _ in $(seq 1 75); do curl -s -m 2 http://localhost:3000/api/health 2>/dev/null | grep -q '"status":"ok"' && break; sleep 2; done
for _ in $(seq 1 60); do curl -s -m 30 -o /dev/null http://localhost:3000/ 2>/dev/null && break; sleep 2; done

$AB open "http://localhost:3000/" > /dev/null 2>&1
sleep 4
for ATTEMPT in 1 2; do
  $AB fill 'input[type="email"], input[autocomplete="username"]' "admin@mbumahhardware.co.ke" > /dev/null 2>&1
  $AB fill 'input[type="password"]' "password123" > /dev/null 2>&1
  $AB click 'button[type="submit"]' > /dev/null 2>&1
  for _ in $(seq 1 12); do
    AUTH=$($AB eval "localStorage.getItem('mbt_token') ? 'yes' : 'no'" 2>/dev/null | tr -d '"')
    [ "$AUTH" = "yes" ] && break
    sleep 3
  done
  [ "$AUTH" = "yes" ] && break
done
echo "login: $AUTH"

$AB open "http://localhost:3000/?tab=reports&rep-type=customer_analysis" > /dev/null 2>&1
sleep 10
PROBE=$($AB eval "
  (() => {
    const heads = [...document.querySelectorAll('p')].filter(p => p.textContent.trim() === 'Outstanding Debt');
    const report = heads.map((h, i) => {
      const parent = h.parentElement;
      const figEl = parent?.nextElementSibling;
      return i + ':' + (h.className || '').slice(0, 30) + ' -> ' + (figEl ? figEl.textContent.trim().slice(0, 24) : 'null');
    }).join(' | ');
    const precise = heads.find(h => h.parentElement?.nextElementSibling?.classList.contains('text-2xl'));
    const fig = precise ? precise.parentElement.nextElementSibling.textContent.trim() : 'none';
    const tabular = precise ? precise.parentElement.nextElementSibling.className.includes('tabular-nums') : false;
    return JSON.stringify({ count: heads.length, fig, tabular, all: report });
  })()" 2>/dev/null | tr -d '\\"')
echo "(reports probe: $PROBE)"

SUM=$($AB eval "fetch('/api/stores',{credentials:'include'}).then(r=>r.json()).then(st=>{const sid=(st.data||st)[0]?.id;return fetch('/api/customers?storeId='+sid+'&limit=200',{credentials:'include'}).then(r=>r.json()).then(j=>{const sum=(j.data||[]).reduce((acc,c)=>acc+Number(c.currentDebtBalance),0);return 'Ksh '+sum.toLocaleString('en-KE',{minimumFractionDigits:2,maximumFractionDigits:2})+' over '+(j.data||[]).length+' rows';});})" 2>/dev/null | tr -d '\\"')
echo "(computed juja sum: $SUM)"
grep -cE "Error:|Unhandled|FATAL" /tmp/burst-rep-dev.log || true
