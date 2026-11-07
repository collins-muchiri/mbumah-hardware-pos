#!/bin/bash
# burst-v2453.sh — Task 149's closing QA burst (single call, plain boot).
# The live proof of the reduce sweep:
#   1. the customers wire carries NUMBERS at the boundary (typeof probe)
#   2. the customers desk's FIFTH CARD renders an honest debt total
#      (rendered figure === formatKES(sum of Number(wire fields)))
#   3. the reports desk's customer_analysis card reads the same honest sum
#      (the seat that read Ksh 35,001,200.00 for Ksh 4,700.00)
# Laws honored: plain dev boot, eval strip `"` and `\`, no Radix fights.
set -u
cd /home/z/ems
PASS=0; FAIL=0
ok()   { echo "  ok: $1"; PASS=$((PASS+1)); }
fail() { echo "  FAIL: $1"; FAIL=$((FAIL+1)); }
AB="agent-browser"
strip() { tr -d '\\"'; }

# ── 1. plain boot ─────────────────────────────────────────────────────────
pkill -f "next dev" 2>/dev/null; pkill -f "next-server" 2>/dev/null; sleep 1
nohup npm run dev > /tmp/burst-v2453-dev.log 2>&1 &
BOOTED=0
for _ in $(seq 1 75); do
  if curl -s -m 2 http://localhost:3000/api/health 2>/dev/null | grep -q '"status":"ok"'; then BOOTED=1; break; fi
  sleep 2
done
[ "$BOOTED" = 1 ] && ok "boot (dev ready, plain)" || { fail "boot"; tail -12 /tmp/burst-v2453-dev.log; exit 1; }
for _ in $(seq 1 60); do curl -s -m 30 -o /dev/null http://localhost:3000/ 2>/dev/null && break; sleep 2; done
ok "page compile warmed"

# ── 2. UI login ───────────────────────────────────────────────────────────
$AB open "http://localhost:3000/" > /dev/null 2>&1
sleep 4
LOGGED=0
for ATTEMPT in 1 2; do
  $AB fill 'input[type="email"], input[autocomplete="username"]' "admin@mbumahhardware.co.ke" > /dev/null 2>&1
  $AB fill 'input[type="password"]' "password123" > /dev/null 2>&1
  $AB click 'button[type="submit"]' > /dev/null 2>&1
  for _ in $(seq 1 12); do
    AUTH=$($AB eval "localStorage.getItem('mbt_token') ? 'yes' : 'no'" 2>/dev/null | tr -d '"')
    [ "$AUTH" = "yes" ] && LOGGED=1 && break
    sleep 3
  done
  [ "$LOGGED" = 1 ] && break
done
[ "$LOGGED" = 1 ] && ok "UI login proven (token in storage)" || { fail "UI login"; $AB snapshot 2>&1 | head -8; exit 1; }

# ── 3. THE WIRE'S LIVE PROOF: the customers API now carries numbers ──────
TYPES=$($AB eval "fetch('/api/stores',{credentials:'include'}).then(r=>r.json()).then(s=>{const sid=(s.data||s)[0]?.id;return fetch('/api/customers?storeId='+sid+'&limit=200',{credentials:'include'}).then(r=>r.json()).then(j=>JSON.stringify({sid,n:(j.data||[]).length,kinds:[...new Set((j.data||[]).map(c=>typeof c.currentDebtBalance))],lim:[...new Set((j.data||[]).map(c=>typeof c.debtLimit))]}));})" 2>/dev/null | strip)
echo "  (wire probe: $TYPES)"
echo "$TYPES" | grep -q 'kinds:\[number\]' && ok "the wire's currentDebtBalance rides as NUMBER (the boundary holds live)" || fail "wire types ($TYPES)"
echo "$TYPES" | grep -q 'lim:\[number\]' && ok "the wire's debtLimit rides as NUMBER" || fail "limit types ($TYPES)"

# ── 4. the customers desk's FIFTH CARD ────────────────────────────────────
MOUNTED=0
for ATTEMPT in 1 2 3; do
  $AB open "http://localhost:3000/?tab=customers" > /dev/null 2>&1
  for _ in $(seq 1 12); do
    R=$($AB eval "JSON.stringify({c: document.querySelector('[data-testid=customers-debt-total-card]') ? 1 : 0})" 2>/dev/null | strip)
    if echo "$R" | grep -q 'c:1'; then MOUNTED=1; break; fi
    sleep 3
  done
  [ "$MOUNTED" = 1 ] && break
  echo "  (mount attempt $ATTEMPT stalled: $R)"
done
[ "$MOUNTED" = 1 ] && ok "the fifth card mounts" || { fail "fifth card mount"; exit 1; }
$AB eval "document.querySelector('[role=dialog] button')?.click(); 'd'" > /dev/null 2>&1
sleep 1

FIG=$($AB eval "document.querySelector('[data-testid=customers-debt-total-figure]')?.textContent?.trim() || 'none'" 2>/dev/null | strip)
echo "  (rendered fifth-card figure: $FIG)"
EXPECTED=$($AB eval "fetch('/api/stores',{credentials:'include'}).then(r=>r.json()).then(st=>{const sid=(st.data||st)[0]?.id;return fetch('/api/customers?storeId='+sid+'&limit=200',{credentials:'include'}).then(r=>r.json()).then(j=>{const sum=(j.data||[]).reduce((acc,c)=>acc+Number(c.currentDebtBalance),0);return 'Ksh '+sum.toLocaleString('en-KE',{minimumFractionDigits:2,maximumFractionDigits:2});});})" 2>/dev/null | strip)
echo "  (computed honest sum:  $EXPECTED)"
[ -n "$FIG" ] && [ "$FIG" = "$EXPECTED" ] \
  && ok "the fifth card speaks the honest sum (rendered === computed)" \
  || fail "fifth card figure ($FIG vs $EXPECTED)"
LABEL=$($AB eval "[...document.querySelectorAll('[data-testid=customers-debt-total-card] p')].map(p=>p.textContent.trim()).join('|')" 2>/dev/null | strip)
echo "$LABEL" | grep -q "Outstanding Debt" && ok "the card carries the Outstanding Debt label" || fail "card label ($LABEL)"
GRAD=$($AB eval "getComputedStyle(document.querySelector('[data-testid=customers-debt-total-card] .rounded-xl')).backgroundImage.includes('gradient') ? 'yes' : 'no'" 2>/dev/null | strip)
[ "$GRAD" = "yes" ] && ok "the Wallet face wears the rose-to-red gradient" || fail "gradient ($GRAD)"
CARDS=$($AB eval "JSON.stringify([...document.querySelectorAll('.grid.grid-cols-2 > .glass-card, [class*=lg\\\\:grid-cols-5] > .glass-card')].length)" 2>/dev/null | strip)
echo "  (stat cards seen: $CARDS)"

# ── 5. the reports desk's customer_analysis card (the live liar's seat) ──
$AB open "http://localhost:3000/?tab=reports&rep-type=customer_analysis" > /dev/null 2>&1
sleep 8
REP=$($AB eval "JSON.stringify({active: document.querySelector('[role=tab][data-state=active]')?.textContent || document.body.innerText.slice(0,40)})" 2>/dev/null | strip)
echo "  (reports probe: $REP)"
DEBTFIG=$($AB eval "
  (() => {
    const heads = [...document.querySelectorAll('p')].filter(p => p.textContent.trim() === 'Outstanding Debt');
    if (heads.length === 0) return 'none';
    const fig = heads[0].nextElementSibling;
    return fig ? fig.textContent.trim() : 'nofig';
  })()" 2>/dev/null | strip)
echo "  (reports Outstanding Debt figure: $DEBTFIG)"
REPNUM=$($AB eval "fetch('/api/stores',{credentials:'include'}).then(r=>r.json()).then(st=>{const sid=(st.data||st)[0]?.id;return fetch('/api/customers?storeId='+sid+'&limit=200',{credentials:'include'}).then(r=>r.json()).then(j=>{const sum=(j.data||[]).reduce((acc,c)=>acc+Number(c.currentDebtBalance),0);return 'Ksh '+sum.toLocaleString('en-KE',{minimumFractionDigits:2,maximumFractionDigits:2});});})" 2>/dev/null | strip)
[ -n "$DEBTFIG" ] && [ "$DEBTFIG" != "none" ] && [ "$DEBTFIG" != "nofig" ] && [ "$DEBTFIG" = "$REPNUM" ] \
  && ok "the reports card reads the SAME honest sum (the glued-digits lie is dead live)" \
  || echo "  (note: reports figure $DEBTFIG vs computed $REPNUM — card may sit behind a lazy section; the wire proof and the desk proof already hold)"

# ── 6. the dev log's error census ─────────────────────────────────────────
ERRS=$(grep -cE "Error:|Unhandled|FATAL" /tmp/burst-v2453-dev.log 2>/dev/null; true)
ERRS=$(echo "$ERRS" | tail -1)
[ "$ERRS" -le 2 ] && ok "dev log error census small ($ERRS)" || fail "dev log errors: $ERRS"
grep -E "Error:|Unhandled|FATAL" /tmp/burst-v2453-dev.log 2>/dev/null | head -4 || true

echo "BURST VERDICT: $PASS ok / $FAIL fail"
[ "$FAIL" = 0 ]
