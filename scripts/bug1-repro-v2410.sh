#!/bin/bash
# bug1-repro-v2410.sh — Task 126's BUG 1 reproduction burst (instrumented).
#
# BUG 1 (carried from Task 125): on /console the switcher's lazy queries
# (`enabled: opened` — /api/currency/rates + /api/settings/currency) never
# fetch, and the menu content unmounts itself ~1-4 s after open.
#
# This burst splits the mystery with hard evidence:
#   leg 4 (/console)      — the surface with prior evidence
#   leg 5 (/org/dashboard)— the org desk (page-local vs component-local)
#   leg 6 (/  POS top bar)— the CONTROL the component is proven live on
# Each probe samples a 10 s timeline: [role=menu] count, trigger data-state,
# trigger count, chip + freshness visibility; then reads the in-page fetch
# logger (window.__f), error collector (window.__e), and the dev log deltas.
set -u
cd /home/z/ems
PASS=0; FAIL=0
ok()   { echo "  ok: $1"; PASS=$((PASS+1)); }
fail() { echo "  FAIL: $1"; FAIL=$((FAIL+1)); }
AB="agent-browser"
DEVLOG=/tmp/bug1-dev.log
STORE="JSON.parse(localStorage.getItem('mbt_app_store')||'{\"state\":{}}').state"
INSTALL='window.__f=[];if(!window.__of){window.__of=window.fetch;window.fetch=function(...a){window.__f.push(typeof a[0]==="string"?a[0]:(a[0]&&a[0].url)||"?");return window.__of.apply(window,a)}};window.__e=[];window.addEventListener("error",function(e){window.__e.push(String(e.message))});"installed"'

logcount() { rg -c "$1" "$DEVLOG" 2>/dev/null || echo 0; }

probe_timeline() { # $1 = selector of the trigger
  for i in 1 2 3 4 5 6 7 8 9 10; do
    M=$($AB eval 'document.querySelectorAll("[role=menu]").length' 2>/dev/null | tr -d '"')
    S=$($AB eval "document.querySelector('$1')?.getAttribute('data-state')||'gone'" 2>/dev/null | tr -d '"')
    T=$($AB eval "document.querySelectorAll('[aria-label^=\"Display currency:\"]').length" 2>/dev/null | tr -d '"')
    echo "    t=${i}s menu=$M triggerState=$S triggers=$T"
    sleep 1
  done
}

# ── 1. port-kill ──────────────────────────────────────────────────────────
pkill -f "next dev" 2>/dev/null; pkill -f "next-server" 2>/dev/null; sleep 1
if curl -s -o /dev/null -m 2 http://localhost:3000; then
  fail "port-kill (:3000 still busy)"; echo "bug1: $PASS ok / $FAIL fail"; exit 1
fi
ok "port-kill"

# ── 2. boot (heap cap) ────────────────────────────────────────────────────
env -u DATABASE_URL NODE_OPTIONS="--max-old-space-size=3072" nohup npm run dev > "$DEVLOG" 2>&1 &
BOOTED=0
for _ in $(seq 1 75); do
  if curl -s -m 2 http://localhost:3000/api/health 2>/dev/null | rg -q '"status":"ok"'; then BOOTED=1; break; fi
  sleep 2
done
[ "$BOOTED" = 1 ] && ok "boot (dev ready, heap-capped)" || { fail "boot"; tail -12 "$DEVLOG"; exit 1; }
VER=$(curl -s -m 3 http://localhost:3000/api/health | node -e "let d='';process.stdin.on('data',c=>d+=c).on('end',()=>{try{const j=JSON.parse(d);process.stdout.write(j.version||j.appVersion||'?')}catch{process.stdout.write('?')}})")
case "$VER" in 2.409.0) ok "health answers $VER";; *) fail "health version ($VER)";; esac

# ── 3. login + branch default USD + warm ──────────────────────────────────
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
for ROUTE in /api/auth/me /api/org/summary /api/org/kpi-summary /api/currency/rates /api/settings/currency; do
  curl -s -m 90 -o /dev/null -H "$AUTH" "http://localhost:3000$ROUTE"
done
ok "routes warmed"

# ── 4. THE /console PROBE ─────────────────────────────────────────────────
echo "── leg 4: /console (console-currency-switcher) ──"
$AB close --all >/dev/null 2>&1
$AB open http://localhost:3000/console >/dev/null 2>&1
$AB eval "localStorage.clear()" >/dev/null 2>&1
$AB eval "localStorage.setItem('mbt_token', '$TOKEN')" >/dev/null 2>&1
$AB reload >/dev/null 2>&1
sleep 20   # generous compile window (the compile-wedge law)
$AB press Escape >/dev/null 2>&1; sleep 1
$AB find text "Got it" click >/dev/null 2>&1; sleep 1
READY=$($AB eval '!!document.querySelector("[data-testid=console-currency-switcher]")' 2>/dev/null | tr -d '"')
[ "$READY" = "true" ] && ok "console switcher present" || { fail "console switcher absent"; $AB snapshot > /tmp/bug1-console-snap.txt 2>&1; }
$AB eval "$INSTALL" >/dev/null 2>&1
BR0=$(logcount "GET /api/settings/currency"); RA0=$(logcount "GET /api/currency/rates")
$AB click '[data-testid="console-currency-switcher"]' >/dev/null 2>&1
probe_timeline '[data-testid="console-currency-switcher"]'
CHIP=$($AB eval 'document.body.innerText.includes("branch default")' 2>/dev/null | tr -d '"')
FRESH=$($AB eval 'document.body.innerText.includes("Wire read at")' 2>/dev/null | tr -d '"')
FETCHES=$($AB eval 'JSON.stringify((window.__f||[]).filter(function(u){return u.indexOf("currency")>=0}))' 2>/dev/null | tr -d '"')
ERRS=$($AB eval 'JSON.stringify(window.__e||[])' 2>/dev/null | tr -d '"')
BR1=$(logcount "GET /api/settings/currency"); RA1=$(logcount "GET /api/currency/rates")
echo "  chip=$CHIP freshness=$FRESH"
echo "  browser-issued currency fetches: $FETCHES"
echo "  page errors: $ERRS"
echo "  dev-log deltas: settings/currency +$((BR1-BR0)) rates +$((RA1-RA0))"

# ── 5. THE /org/dashboard PROBE ───────────────────────────────────────────
echo "── leg 5: /org/dashboard (org-desk-currency-switcher) ──"
$AB open http://localhost:3000/org/dashboard >/dev/null 2>&1
$AB eval "localStorage.clear()" >/dev/null 2>&1
$AB eval "localStorage.setItem('mbt_token', '$TOKEN')" >/dev/null 2>&1
$AB reload >/dev/null 2>&1
sleep 20
$AB press Escape >/dev/null 2>&1; sleep 1
$AB find text "Got it" click >/dev/null 2>&1; sleep 1
READY2=$($AB eval '!!document.querySelector("[data-testid=org-desk-currency-switcher]")' 2>/dev/null | tr -d '"')
[ "$READY2" = "true" ] && ok "org desk switcher present" || { fail "org desk switcher absent"; $AB snapshot > /tmp/bug1-org-snap.txt 2>&1; }
$AB eval "$INSTALL" >/dev/null 2>&1
BR0=$(logcount "GET /api/settings/currency"); RA0=$(logcount "GET /api/currency/rates")
$AB click '[data-testid="org-desk-currency-switcher"]' >/dev/null 2>&1
probe_timeline '[data-testid="org-desk-currency-switcher"]'
CHIP2=$($AB eval 'document.body.innerText.includes("branch default")' 2>/dev/null | tr -d '"')
FRESH2=$($AB eval 'document.body.innerText.includes("Wire read at")' 2>/dev/null | tr -d '"')
FETCHES2=$($AB eval 'JSON.stringify((window.__f||[]).filter(function(u){return u.indexOf("currency")>=0}))' 2>/dev/null | tr -d '"')
ERRS2=$($AB eval 'JSON.stringify(window.__e||[])' 2>/dev/null | tr -d '"')
BR1=$(logcount "GET /api/settings/currency"); RA1=$(logcount "GET /api/currency/rates")
echo "  chip=$CHIP2 freshness=$FRESH2"
echo "  browser-issued currency fetches: $FETCHES2"
echo "  page errors: $ERRS2"
echo "  dev-log deltas: settings/currency +$((BR1-BR0)) rates +$((RA1-RA0))"

# ── 6. THE CONTROL: / (POS top bar, component proven live) ────────────────
echo "── leg 6: / (POS top bar control) ──"
$AB open http://localhost:3000/ >/dev/null 2>&1
$AB eval "localStorage.clear()" >/dev/null 2>&1
$AB eval "localStorage.setItem('mbt_token', '$TOKEN')" >/dev/null 2>&1
$AB reload >/dev/null 2>&1
sleep 20
$AB press Escape >/dev/null 2>&1; sleep 1
$AB find text "Got it" click >/dev/null 2>&1; sleep 1
$AB eval "$INSTALL" >/dev/null 2>&1
$AB click '[aria-label^="Display currency:"]' >/dev/null 2>&1
probe_timeline '[aria-label^="Display currency:"]'
CHIP3=$($AB eval 'document.body.innerText.includes("branch default")' 2>/dev/null | tr -d '"')
FRESH3=$($AB eval 'document.body.innerText.includes("Wire read at")' 2>/dev/null | tr -d '"')
FETCHES3=$($AB eval 'JSON.stringify((window.__f||[]).filter(function(u){return u.indexOf("currency")>=0}))' 2>/dev/null | tr -d '"')
ERRS3=$($AB eval 'JSON.stringify(window.__e||[])' 2>/dev/null | tr -d '"')
echo "  chip=$CHIP3 freshness=$FRESH3"
echo "  browser-issued currency fetches: $FETCHES3"
echo "  page errors: $ERRS3"

# ── 7. restore + teardown ─────────────────────────────────────────────────
$AB close --all >/dev/null 2>&1
RESTORE=""
for _ in 1 2 3; do
  RESTORE=$(curl -s -m 20 -X PATCH http://localhost:3000/api/settings/currency \
    -H "$AUTH" -H 'Content-Type: application/json' \
    -d '{"storeId":"store_juja_main","defaultCurrency":"KES"}')
  echo "$RESTORE" | rg -q '"defaultCurrency":"KES"' && break
  sleep 3
done
echo "$RESTORE" | rg -q '"defaultCurrency":"KES"' && ok "branch default restored to KES" || fail "restore: $(echo "$RESTORE" | head -c 160)"
pkill -f "next dev" 2>/dev/null; pkill -f "next-server" 2>/dev/null
ok "teardown"
echo "bug1: $PASS ok / $FAIL fail"
