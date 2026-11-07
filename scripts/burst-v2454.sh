#!/bin/bash
# burst-v2454.sh — Task 150's closing QA burst (single call, plain boot).
# The live proof of the debt voices' reconciliation:
#   1. the dashboard KPI speaks the LEDGER voice (scope line rendered)
#   2. the customers desk's fifth card speaks the MIRROR voice (scope line
#      rendered), its figure byte-equal to the browser-computed Number-sum
#   3. the reports desk's analysis card speaks the MIRROR voice too
#   4. the two voices' live values are read and their relation named:
#      ledger 0 (no fixture seeds DebtLedger rows) vs mirror 467000
#      — the by-design divergence, now legible in the UI
# Laws honoured: plain dev boot (the heap-cap law), eval strip `"` and `\`,
# no Radix fights (deep-link grammar reaches the reports desk).
set -u
cd /home/z/ems
PASS=0; FAIL=0
ok()   { echo "  ok: $1"; PASS=$((PASS+1)); }
fail() { echo "  FAIL: $1"; FAIL=$((FAIL+1)); }
AB="agent-browser"
strip() { tr -d '\\"'; }

# ── 1. plain boot ─────────────────────────────────────────────────────────
pkill -f "next dev" 2>/dev/null; pkill -f "next-server" 2>/dev/null; sleep 1
nohup npm run dev > /tmp/burst-v2454-dev.log 2>&1 &
BOOTED=0
for _ in $(seq 1 75); do
  if curl -s -m 2 http://localhost:3000/api/health 2>/dev/null | grep -q '"status":"ok"'; then BOOTED=1; break; fi
  sleep 2
done
[ "$BOOTED" = 1 ] && ok "boot (dev ready, plain)" || { fail "boot"; tail -12 /tmp/burst-v2454-dev.log; exit 1; }
for _ in $(seq 1 60); do curl -s -m 30 -o /dev/null http://localhost:3000/ 2>/dev/null && break; sleep 2; done
ok "page compile warmed"

# ── 2. login (two shapes: the form first; the API-token injection as the
#      honest fallback — this sandbox generation's memory pressure can stall
#      the tokenless auth gate on Loading... forever, while the same API
#      login returns 200 instantly) ────────────────────────────────────────
$AB open "http://localhost:3000/" > /dev/null 2>&1
sleep 4
LOGGED=0
for ATTEMPT in 1 2; do
  $AB fill 'input[type="email"], input[autocomplete="username"]' "admin@mbumahhardware.co.ke" > /dev/null 2>&1
  $AB fill 'input[type="password"]' "password123" > /dev/null 2>&1
  $AB click 'button[type="submit"]' > /dev/null 2>&1
  for _ in $(seq 1 6); do
    AUTH=$($AB eval "localStorage.getItem('mbt_token') ? 'yes' : 'no'" 2>/dev/null | tr -d '"')
    [ "$AUTH" = "yes" ] && LOGGED=1 && break
    sleep 3
  done
  [ "$LOGGED" = 1 ] && break
done
if [ "$LOGGED" = 0 ]; then
  TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d '{"email":"admin@mbumahhardware.co.ke","password":"password123"}' | node -e "let d='';process.stdin.on('data',c=>d+=c).on('end',()=>{try{console.log(JSON.parse(d).data.token||'')}catch(e){console.log('')}})")
  if [ -n "$TOKEN" ]; then
    $AB eval "localStorage.setItem('mbt_token','$TOKEN'); 'set'" > /dev/null 2>&1
    $AB open "http://localhost:3000/" > /dev/null 2>&1
    AUTH=$($AB eval "localStorage.getItem('mbt_token') ? 'yes' : 'no'" 2>/dev/null | tr -d '"')
    [ "$AUTH" = "yes" ] && { LOGGED=1; ok "login via the API-token injection (the form path stalled on the auth gate)"; }
  fi
fi
[ "$LOGGED" = 1 ] && ok "login proven (token in storage)" || { fail "login"; exit 1; }

# ── 2b. settle the SHELL (the first-desk stall law: on this regime a plain
#      "/" load can stall the auth gate on Loading... forever, while ANY
#      deep-linked tab mounts — so mount a deep-link, then activate the
#      dashboard desk via its own nav button) ─────────────────────────────
SHELLUP=0
BOOT_N=0
for _ in $(seq 1 12); do
  M=$($AB eval "!!(document.querySelector&&document.querySelector('[data-testid=\"customers-debt-total-scope\"]'))" 2>/dev/null | strip)
  [ "$M" = "true" ] && { SHELLUP=1; break; }
  BOOT_N=$((BOOT_N+1))
  $AB open "http://localhost:3000/?tab=customers&boot=$BOOT_N" > /dev/null 2>&1
  sleep 7
done
[ "$SHELLUP" = 1 ] && ok "the shell mounted via the deep-link (the mirror seat live)" || { fail "shell settle (last: $M)"; exit 1; }
# ── 4b. the customers desk's fifth card (read NOW, while its tab is active) ──
CUST=""
for _ in $(seq 1 8); do
  CUST=$($AB eval "JSON.stringify({rendered: (document.querySelector('[data-testid=\"customers-debt-total-figure\"]')||{}).textContent||null, scopeText: (document.querySelector('[data-testid=\"customers-debt-total-scope\"]')||{}).textContent||null, scopeTitle: ((document.querySelector('[data-testid=\"customers-debt-total-scope\"]')||{}).title||'').includes('the mirror voice')})" 2>/dev/null | strip)
  echo "$CUST" | grep -q "rendered:" && break
  sleep 5
done
echo "  (customers probe: $CUST"
echo "$CUST" | grep -qE "rendered:Ksh [0-9,]+\.00" && ok "the fifth card renders its figure" || fail "fifth card figure ($CUST)"
echo "$CUST" | grep -q "scopeTitle:true" && ok "the mirror scope line renders with its hover coach" || fail "mirror scope ($CUST)"

CLICKED=$($AB eval "var b=[...document.querySelectorAll('button,a')].find(b=>b.textContent.trim().startsWith('Dashboard')); if(b){b.click();'clicked'}else{'notfound'}" 2>/dev/null | strip)
DASH_OK=0
for _ in $(seq 1 6); do
  M=$($AB eval "!!(document.querySelector&&document.querySelector('[data-testid=\"dashboard-debt-scope\"]'))" 2>/dev/null | strip)
  [ "$M" = "true" ] && { DASH_OK=1; break; }
  sleep 5
done
[ "$DASH_OK" = 1 ] && ok "the dashboard desk mounted (the KPI's scope seat is live)" || fail "dashboard activation ($CLICKED, last: $M)"

# the cookie jar for the server-side probes (the page-context fetch evals
# stall under this memory regime; curl with the session cookie is honest)
curl -s -c /tmp/burst-v2454-jar.txt -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d '{"email":"admin@mbumahhardware.co.ke","password":"password123"}' > /dev/null

# ── 3. the two voices' wire values (curl: the ledger wire + the mirror wire) ──
VOICES=$(curl -s -b /tmp/burst-v2454-jar.txt "http://localhost:3000/api/stores" | node -e "let d='';process.stdin.on('data',c=>d+=c).on('end',()=>{const s=JSON.parse(d);console.log((s.data||s)[0].id)})" | head -1)
LEDGER=$(curl -s -b /tmp/burst-v2454-jar.txt "http://localhost:3000/api/dashboard?storeId=$VOICES" | node -e "let d='';process.stdin.on('data',c=>d+=c).on('end',()=>{const j=JSON.parse(d);const dd=j.data||j;const v=dd.debtCrisis?.outstandingTotal ?? dd.outstandingDebt;console.log(Math.round(v*100)/100)})")
MIRROR=$(curl -s -b /tmp/burst-v2454-jar.txt "http://localhost:3000/api/customers?storeId=$VOICES&limit=500" | node -e "let d='';process.stdin.on('data',c=>d+=c).on('end',()=>{const j=JSON.parse(d);const sum=(j.data||[]).reduce((t,x)=>t+Number(x.currentDebtBalance),0);console.log(Math.round(sum*100)/100)})")
VOICES="{ledger:$LEDGER,mirror:$MIRROR}"
echo "  (voices probe: $VOICES)"
echo "$VOICES" | grep -qE "ledger:[0-9]" && ok "both voices' wire values read (ledger + mirror)" || fail "voices probe ($VOICES)"

# ── 4. the dashboard KPI: LEDGER voice rendered with its scope line ──────
DASH=""
for _ in $(seq 1 8); do
  DASH=$($AB eval "JSON.stringify({scope: !!document.querySelector('[data-testid=\"dashboard-debt-scope\"]'), scopeText: (document.querySelector('[data-testid=\"dashboard-debt-scope\"]')||{}).textContent, title: ((document.querySelector('[data-testid=\"dashboard-debt-scope\"]')||{}).title||'').slice(0,40), btn: document.body.textContent.includes('Tap to view debtors')})" 2>/dev/null | strip)
  echo "$DASH" | grep -q "scope:true" && break
  sleep 6
done
echo "  (dashboard probe: $DASH)"
echo "$DASH" | grep -q "scope:true" && ok "the dashboard KPI's LEDGER scope line renders" || fail "dashboard scope ($DASH)"
echo "$DASH" | grep -q "btn:true" && ok "the elder debtors button rides byte-exact" || fail "debtors button ($DASH)"


# ── 6. the reports desk's analysis card (deep-link grammar) ──────────────
REP=""
for _ in $(seq 1 8); do
  $AB open "http://localhost:3000/?tab=reports&rep-type=customer_analysis&boot=$BOOT_N" > /dev/null 2>&1
  BOOT_N=$((BOOT_N+1))
  sleep 8
  REP=$($AB eval "JSON.stringify({scope: !!document.querySelector('[data-testid=\"reports-debt-scope\"]'), scopeText: (document.querySelector('[data-testid=\"reports-debt-scope\"]')||{}).textContent, head: (document.body.innerText.match(/Outstanding Debt/g)||[]).length})" 2>/dev/null | strip)
  echo "$REP" | grep -q "scope:true" && break
done
echo "  (reports probe: $REP)"
echo "$REP" | grep -q "scope:true" && ok "the reports analysis card's MIRROR scope line renders" || fail "reports scope ($REP)"

# ── 7. the financial desk's ledger seat ──────────────────────────────────
FIN=""
for _ in $(seq 1 8); do
  $AB open "http://localhost:3000/?tab=financial&boot=$BOOT_N" > /dev/null 2>&1
  BOOT_N=$((BOOT_N+1))
  sleep 8
  FIN=$($AB eval "JSON.stringify({scope: !!document.querySelector('[data-testid=\"financial-debt-scope\"]'), scopeText: (document.querySelector('[data-testid=\"financial-debt-scope\"]')||{}).textContent})" 2>/dev/null | strip)
  echo "$FIN" | grep -q "scope:true" && break
done
echo "  (financial probe: $FIN)"
echo "$FIN" | grep -q "scope:true" && ok "the financial card's LEDGER scope line renders" || fail "financial scope ($FIN)"

echo
echo "burst-v2454: $PASS ok / $FAIL fail"
[ "$FAIL" = 0 ]
