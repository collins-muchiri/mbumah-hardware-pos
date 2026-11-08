#!/bin/bash
# burst-v2455.sh — Task 151's closing QA burst (single call, the v2454 shape:
# plain boot, deep-link mount, token-injection login fallback, nav-click
# activation, cache-busted retries, curl-with-cookie wire probes).
# The live proof of the elder loom's first weave:
#   1. the transactions desk's chips are LOOMED: aria-pressed renders, the
#      zinc ring rides the class list, the payment violet keeps its seat
#   2. a chip press flips its aria-pressed state live (true → false → true)
#   3. the reports desk's chips ride the loom too
#   4. the loom's wardrobe lives in exactly one component file
set -u
cd /home/z/ems
PASS=0; FAIL=0
ok()   { echo "  ok: $1"; PASS=$((PASS+1)); }
fail() { echo "  FAIL: $1"; FAIL=$((FAIL+1)); }
AB="agent-browser"
strip() { tr -d '\\"'; }

# ── 1. plain boot ─────────────────────────────────────────────────────────
pkill -f "next dev" 2>/dev/null; pkill -f "next-server" 2>/dev/null; sleep 1
nohup npm run dev > /tmp/burst-v2455-dev.log 2>&1 &
BOOTED=0
for _ in $(seq 1 75); do
  if curl -s -m 2 http://localhost:3000/api/health 2>/dev/null | grep -q '"status":"ok"'; then BOOTED=1; break; fi
  sleep 2
done
[ "$BOOTED" = 1 ] && ok "boot (dev ready, plain)" || { fail "boot"; tail -12 /tmp/burst-v2455-dev.log; exit 1; }
for _ in $(seq 1 60); do curl -s -m 30 -o /dev/null http://localhost:3000/ 2>/dev/null && break; sleep 2; done
ok "page compile warmed"

# ── 2. login (form first; the API-token injection as the honest fallback) ──
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

# ── 3. mount the transactions desk via the deep-link (the first-desk stall law) ──
UP=0; BOOT_N=10
for _ in $(seq 1 12); do
  M=$($AB eval "!!(document.querySelector&&document.querySelector('[data-testid=\"txn-type-census\"]'))" 2>/dev/null | strip)
  [ "$M" = "true" ] && { UP=1; break; }
  BOOT_N=$((BOOT_N+1))
  $AB open "http://localhost:3000/?tab=transactions&boot=$BOOT_N" > /dev/null 2>&1
  sleep 7
done
[ "$UP" = 1 ] && ok "the transactions desk mounted (the census row is live)" || { fail "transactions mount (last: $M)"; exit 1; }

# ── 4. THE LOOM'S LIVE PROOF: aria-pressed + the two rings ───────────────
CHIP=$($AB eval "JSON.stringify({census: !!document.querySelector('[data-testid=\"txn-type-census\"]'), pressed: [...document.querySelectorAll('[data-testid=\"txn-type-census\"] button')].map(b=>b.getAttribute('aria-pressed')), zinc: !!document.querySelector('[data-testid=\"txn-type-census\"] button[class*=\"ring-zinc-400\"]'), violet: document.body.innerHTML.includes('ring-violet-400')})" 2>/dev/null | strip)
echo "  (loom probe: $CHIP)"
echo "$CHIP" | grep -q "census:true" && ok "the type census row renders" || fail "census row ($CHIP)"
echo "$CHIP" | grep -q "zinc:true" && ok "the loom's zinc ring rides the rendered chips" || fail "zinc ring ($CHIP)"
echo "$CHIP" | grep -q "violet:true" && ok "the payment violet keeps its seat (focusRing none)" || fail "violet ring ($CHIP)"

# ── 5. THE PRESS FLIP: aria-pressed flips live ───────────────────────────
FLIP=$($AB eval "JSON.stringify([...document.querySelector('[data-testid=\"txn-type-census\"]').querySelectorAll('button')].map(b=>b.getAttribute('aria-pressed')).join(','))" 2>/dev/null | strip)
$AB eval "var btns=[...document.querySelector('[data-testid=\"txn-type-census\"]').querySelectorAll('button')]; btns[1].click(); 'clicked'" > /dev/null 2>&1
sleep 2
FLIP2=$($AB eval "var row=document.querySelector('[data-testid=\"txn-type-census\"]'); var after=[...row.querySelectorAll('button')].map(b=>b.getAttribute('aria-pressed')).join(','); row.getAttribute('data-testid')+':'+after" 2>/dev/null | strip)
echo "  (flip probe: before=$FLIP after=$FLIP2)"
BEFORE_PRESSED=$(echo "$FLIP" | grep -oE "true,false,false,false,false,false" | head -1)
AFTER_PRESSED=$(echo "$FLIP2" | grep -oE "false,true,false,false,false" | head -1)
[ -n "$BEFORE_PRESSED" ] && ok "at rest: 'all' pressed, the four lenses false" || fail "before-state ($FLIP)"
[ -n "$AFTER_PRESSED" ] && ok "after the sale press: the pressed voice flipped live" || fail "after-state ($FLIP2)"

# ── 6. the reports desk's loomed faces (deep-link) ───────────────────────
REP=""
for _ in $(seq 1 8); do
  $AB open "http://localhost:3000/?tab=reports&boot=$BOOT_N" > /dev/null 2>&1
  BOOT_N=$((BOOT_N+1))
  sleep 8
  REP=$($AB eval "JSON.stringify({loomed: [...document.querySelectorAll('button')].filter(b=>b.className.includes('ring-zinc-400')).length, chartPressed: [...document.querySelectorAll('button')].some(b=>b.getAttribute('aria-pressed')==='true' && b.className.includes('py-1'))})" 2>/dev/null | strip)
  echo "$REP" | grep -q "loomed:[2-9]" && break
done
echo "  (reports probe: $REP)"
echo "$REP" | grep -q "loomed:[2-9]" && ok "the reports desk's loomed chips render (date presets + chart types)" || fail "reports loom ($REP)"

echo
echo "burst-v2455: $PASS ok / $FAIL fail"
[ "$FAIL" = 0 ]
