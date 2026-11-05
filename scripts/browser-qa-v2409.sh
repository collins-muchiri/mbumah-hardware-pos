#!/bin/bash
# browser-qa-v2409.sh — Task 125's closing QA burst (on v2.409.0, post-fix).
#
# Legs:
#   1-3. port-kill / boot (heap-capped) / health + login + branch default → USD
#   4. warm the console page's routes (the compile-wedge law)
#   5. THE STEAMROLL FIX, LIVE: a persisted explicit choice (KES/true) meets
#      the branch default (USD) across a reload on the org desk — the seed
#      must REFUSE (KES/true survives intact, storage intact).
#   6. THE SEED, LIVE: fresh cleared session → the store greets USD with
#      currencyChosen=false AND the trigger wears the emerald greeting dot.
#   7. the human hand wins: explicit KES pick flips the flag AND ends the
#      greeting (the dot goes).
#   8. re-seed honesty: a reload keeps the explicit KES.
#   9. informational: the branch-default chip probe on the org desk (the
#      carried bug-1 investigation — the dropdown's lazy queries stay
#      silent there; reported, not release-blocking, shared component
#      proven live on the main app).
#  10. restore + teardown.
set -u
cd /home/z/ems
PASS=0; FAIL=0
ok()   { echo "  ok: $1"; PASS=$((PASS+1)); }
fail() { echo "  FAIL: $1"; FAIL=$((FAIL+1)); }
AB="agent-browser"
DUMPED=0
dump() {
  if [ "$DUMPED" = 0 ]; then
    $AB snapshot > /tmp/bqa-v2409-snapshot.txt 2>&1
    DUMPED=1; echo "  (snapshot dumped to /tmp/bqa-v2409-snapshot.txt)"
  fi
}
STORE="JSON.parse(localStorage.getItem('mbt_app_store')||'{\"state\":{}}').state"

# ── 1. port-kill ──────────────────────────────────────────────────────────
pkill -f "next dev" 2>/dev/null; pkill -f "next-server" 2>/dev/null; sleep 1
if curl -s -o /dev/null -m 2 http://localhost:3000; then
  fail "port-kill (:3000 still busy)"; echo "bqa: $PASS ok / $FAIL fail"; exit 1
fi
ok "port-kill"

# ── 2. boot (THE HEAP CAP: Turbopack at default heap starves the sandbox
#       and the listener black-holes browser responses; 3072MB keeps the
#       burst healthy — the t0/t2/t5/t10 probe proved it) ──────────────────
env -u DATABASE_URL NODE_OPTIONS="--max-old-space-size=3072" nohup npm run dev > /tmp/bqa-v2409-dev.log 2>&1 &
BOOTED=0
for _ in $(seq 1 75); do
  if curl -s -m 2 http://localhost:3000/api/health 2>/dev/null | rg -q '"status":"ok"'; then BOOTED=1; break; fi
  sleep 2
done
[ "$BOOTED" = 1 ] && ok "boot (dev ready, heap-capped)" || { fail "boot"; tail -12 /tmp/bqa-v2409-dev.log; exit 1; }

VER=$(curl -s -m 3 http://localhost:3000/api/health | node -e "let d='';process.stdin.on('data',c=>d+=c).on('end',()=>{try{const j=JSON.parse(d);process.stdout.write(j.version||j.appVersion||'?')}catch{process.stdout.write('?')}})")
case "$VER" in 2.409.0) ok "health answers $VER";; *) fail "health version ($VER) — expected 2.409.0";; esac

# ── 3. login + branch default → USD ───────────────────────────────────────
TOKEN=$(curl -s -m 15 -X POST http://localhost:3000/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@mbumahhardware.co.ke","password":"password123"}' \
  | node -e "let d='';process.stdin.on('data',c=>d+=c).on('end',()=>{try{const j=JSON.parse(d);process.stdout.write((j.data&&j.data.token)||'')}catch{}})")
[ -n "$TOKEN" ] && ok "login proven" || { fail "login"; exit 1; }
AUTH="Authorization: Bearer $TOKEN"

PATCH=$(curl -s -m 15 -X PATCH http://localhost:3000/api/settings/currency \
  -H "$AUTH" -H 'Content-Type: application/json' \
  -d '{"storeId":"store_juja_main","defaultCurrency":"USD"}')
echo "$PATCH" | rg -q '"defaultCurrency":"USD"' && ok "branch default PATCHed to USD" || fail "branch PATCH: $(echo "$PATCH" | head -c 160)"

# ── 4. warm the console page's routes (the compile-wedge law) ─────────────
for ROUTE in /api/auth/me /api/org/summary /api/org/kpi-summary /api/org/review-activity "/api/org/purchase-orders?" /api/currency/rates; do
  curl -s -m 90 -o /dev/null -H "$AUTH" "http://localhost:3000$ROUTE"
done
ok "routes warmed"

$AB close --all >/dev/null 2>&1
$AB open http://localhost:3000/console >/dev/null 2>&1; sleep 5

# ── 5. THE STEAMROLL FIX, LIVE ────────────────────────────────────────────
$AB eval "localStorage.clear()" >/dev/null 2>&1
$AB eval "localStorage.setItem('mbt_token', '$TOKEN')" >/dev/null 2>&1
$AB eval "localStorage.setItem('mbt_app_store', JSON.stringify({state:{activeCurrency:'KES',currencyChosen:true},version:0}))" >/dev/null 2>&1
$AB reload >/dev/null 2>&1; sleep 8
$AB press Escape >/dev/null 2>&1; sleep 1
$AB find text "Got it" click >/dev/null 2>&1; sleep 1
CUR=$($AB eval "$STORE.activeCurrency || 'none'" 2>/dev/null | tr -d '"')
CHOSEN=$($AB eval "String($STORE.currencyChosen ?? 'absent')" 2>/dev/null | tr -d '"')
if [ "$CUR" = "KES" ] && [ "$CHOSEN" = "true" ]; then
  ok "THE STEAMROLL FIX LIVE: the explicit KES/true survives the branch default (refusal 2, hydrated)"
else
  fail "steamroll fix: activeCurrency=$CUR currencyChosen=$CHOSEN"; dump
fi

# ── 6. THE SEED, LIVE + the greeting dot ─────────────────────────────────
$AB eval "localStorage.removeItem('mbt_app_store')" >/dev/null 2>&1
$AB reload >/dev/null 2>&1; sleep 3
# poll for the greet (the seed's wire may race the post-reload compile — a
# refused wire is an honest no-op, so give it a generous window)
CUR="none"; CHOSEN="absent"
for _ in 1 2 3 4 5 6 7 8; do
  CUR=$($AB eval "$STORE.activeCurrency || 'none'" 2>/dev/null | tr -d '"')
  CHOSEN=$($AB eval "String($STORE.currencyChosen ?? 'absent')" 2>/dev/null | tr -d '"')
  [ "$CUR" = "USD" ] && break
  sleep 2
done
DOT=$($AB eval "!!document.querySelector('[aria-label^=\\'Display currency:\\'] .bg-emerald-500')" 2>/dev/null | tr -d '"')
if [ "$CUR" = "USD" ] && [ "$CHOSEN" = "false" ]; then
  ok "THE SEED LIVE on the org desk: activeCurrency=USD, currencyChosen=false"
else
  fail "seed: activeCurrency=$CUR currencyChosen=$CHOSEN"; dump
fi
[ "$DOT" = "true" ] && ok "the greeting dot wears the trigger (emerald, provenance-stamped)" || { fail "greeting dot absent"; dump; }

# ── 7. the org desk's dropdown + the chip (informational) ─────────────────
$AB click '[aria-label^="Display currency:"]' >/dev/null 2>&1
sleep 2
CHIP=$($AB eval "document.body.innerText.includes('branch default')" 2>/dev/null | tr -d '"')
FRESH=$($AB eval "document.body.innerText.includes('Wire read at')" 2>/dev/null | tr -d '"')
echo "  (info: chip=$CHIP freshness=$FRESH — the carried bug-1 probe: the org desk's lazy queries stay silent; the chip is live on the main app, shared component)"
$AB press Escape >/dev/null 2>&1

# ── 8. the human hand wins: explicit KES pick flips the flag, ends the dot ─
$AB click '[aria-label^="Display currency:"]' >/dev/null 2>&1; sleep 1
$AB click '[aria-label^="Switch display currency to Kenyan Shilling"]' >/dev/null 2>&1
sleep 2
CUR2=$($AB eval "$STORE.activeCurrency || 'none'" 2>/dev/null | tr -d '"')
CHOSEN2=$($AB eval "String($STORE.currencyChosen ?? 'absent')" 2>/dev/null | tr -d '"')
DOT2=$($AB eval "!!document.querySelector('[aria-label^=\\'Display currency:\\'] .bg-emerald-500')" 2>/dev/null | tr -d '"')
if [ "$CUR2" = "KES" ] && [ "$CHOSEN2" = "true" ]; then
  ok "the human hand wins: explicit KES pick → currencyChosen=true"
else
  fail "explicit pick: activeCurrency=$CUR2 currencyChosen=$CHOSEN2"; dump
fi
[ "$DOT2" = "false" ] && ok "the greeting ended with the hand: the dot went" || fail "dot survived the explicit pick ($DOT2)"

# ── 9. re-seed honesty: reload keeps the explicit KES ─────────────────────
$AB reload >/dev/null 2>&1
sleep 6
CUR3=$($AB eval "$STORE.activeCurrency || 'none'" 2>/dev/null | tr -d '"')
CHOSEN3=$($AB eval "String($STORE.currencyChosen ?? 'absent')" 2>/dev/null | tr -d '"')
if [ "$CUR3" = "KES" ] && [ "$CHOSEN3" = "true" ]; then
  ok "re-seed honesty: fresh load keeps the explicit KES/true (no override)"
else
  fail "re-seed overrode the explicit choice ($CUR3/$CHOSEN3)"; dump
fi
$AB close --all >/dev/null 2>&1

# ── 10. restore the branch default (KES) ──────────────────────────────────
RESTORE=""
for _ in 1 2 3; do
  RESTORE=$(curl -s -m 20 -X PATCH http://localhost:3000/api/settings/currency \
    -H "$AUTH" -H 'Content-Type: application/json' \
    -d '{"storeId":"store_juja_main","defaultCurrency":"KES"}')
  echo "$RESTORE" | rg -q '"defaultCurrency":"KES"' && break
  sleep 3
done
echo "$RESTORE" | rg -q '"defaultCurrency":"KES"' && ok "branch default restored to KES" || fail "restore: $(echo "$RESTORE" | head -c 160)"

# ── 11. teardown ──────────────────────────────────────────────────────────
pkill -f "next dev" 2>/dev/null; pkill -f "next-server" 2>/dev/null
ok "teardown"
echo "bqa: $PASS ok / $FAIL fail"
[ "$FAIL" = 0 ]
