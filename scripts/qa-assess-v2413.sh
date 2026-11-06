#!/bin/bash
# qa-assess-v2413.sh — this round's opening assessment burst (on v2.413.0).
# A recycled sandbox stood the world back up; this burst proves the shipped
# state is healthy before the round picks its focus.
#
# Legs:
#   1. port-kill / boot (heap-capped, env -u) / health answers 2.413.0
#   2. login proven
#   3. the health desk: the env panel renders and THE SUPPORT COPY button
#      speaks its two-state face (Copy → Copied → Copy after the 2s beat)
#   4. the console: the rate census strip answers (admin-set on the footer)
#   5. the POS desk renders (a plain page-open smoke leg)
#   6. teardown
set -u
cd /home/z/ems
PASS=0; FAIL=0
ok()   { echo "  ok: $1"; PASS=$((PASS+1)); }
fail() { echo "  FAIL: $1"; FAIL=$((FAIL+1)); }
AB="agent-browser"

# ── 1. port-kill + boot ───────────────────────────────────────────────────
pkill -f "next dev" 2>/dev/null; pkill -f "next-server" 2>/dev/null; sleep 1
if curl -s -o /dev/null -m 2 http://localhost:3000; then
  fail "port-kill (:3000 still busy)"; echo "qa: $PASS ok / $FAIL fail"; exit 1
fi
ok "port-kill"
env -u DATABASE_URL NODE_OPTIONS="--max-old-space-size=3072" nohup npm run dev > /tmp/qa2413-dev.log 2>&1 &
BOOTED=0
for _ in $(seq 1 75); do
  if curl -s -m 2 http://localhost:3000/api/health 2>/dev/null | rg -q '"status":"ok"'; then BOOTED=1; break; fi
  sleep 2
done
[ "$BOOTED" = 1 ] && ok "boot (dev ready, heap-capped)" || { fail "boot"; tail -12 /tmp/qa2413-dev.log; exit 1; }
VER=$(curl -s -m 3 http://localhost:3000/api/health | node -e "let d='';process.stdin.on('data',c=>d+=c).on('end',()=>{try{const j=JSON.parse(d);process.stdout.write(j.version||j.appVersion||'?')}catch{process.stdout.write('?')}})")
case "$VER" in 2.413.0) ok "health answers $VER";; *) fail "health version ($VER) — expected 2.413.0";; esac

# ── 2. login ──────────────────────────────────────────────────────────────
TOKEN=$(curl -s -m 15 -X POST http://localhost:3000/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@mbumahhardware.co.ke","password":"password123"}' \
  | node -e "let d='';process.stdin.on('data',c=>d+=c).on('end',()=>{try{const j=JSON.parse(d);process.stdout.write((j.data&&j.data.token)||'')}catch{}})")
[ -n "$TOKEN" ] && ok "login proven" || { fail "login"; exit 1; }
AUTH="Authorization: Bearer $TOKEN"

# ── 2b. warm the desk's routes (the compile-wedge law: the first hit of a
#       cold route compiles for up to ~2min and eats the page's own fetch —
#       warm them with curl BEFORE the browser arrives) ────────────────────
WARMOK=0
for _ in 1 2 3; do
  WARMOK=1
  for R in /api/health /api/health/system-status /api/health/circuit-breaker /api/health/dlq /api/auth/me /api/currency/rates /api/org/summary /api/org/kpi-summary; do
    CODE=$(curl -s -m 120 -o /dev/null -w "%{http_code}" -H "$AUTH" "http://localhost:3000$R")
    case "$CODE" in 200|401|403) ;; *) WARMOK=0;; esac
    echo "  (warm $R → $CODE)"
  done
  [ "$WARMOK" = 1 ] && break
  sleep 3
done
[ "$WARMOK" = 1 ] && ok "health routes warmed" || fail "health routes warm (see codes above)"

# ── 3. the health desk: env panel + THE SUPPORT COPY live ─────────────────
# THE COOKIE LAW (this round's discovery): the desk's queries are RAW fetches
# — no Bearer header — so they ride the mbt_token cookie, and the cookie is
# only set by the login FORM. A localStorage-injected session answers the
# Bearer APIs but the health desk 401s. Log in through the form, honestly.
$AB close --all >/dev/null 2>&1
$AB open "http://localhost:3000/" >/dev/null 2>&1; sleep 6
$AB fill 'input[type="email"]' "admin@mbumahhardware.co.ke" >/dev/null 2>&1
$AB fill 'input[type="password"]' "password123" >/dev/null 2>&1
$AB click 'button[type="submit"]' >/dev/null 2>&1
SHELLIN=0
for _ in $(seq 1 30); do
  COOKIE=$($AB eval "document.cookie.includes('mbt_token')" 2>/dev/null | tr -d '"')
  [ "$COOKIE" = "true" ] && { SHELLIN=1; break; }
  sleep 2
done
[ "$SHELLIN" = 1 ] && ok "form login proven (mbt_token cookie set)" || fail "form login (no cookie)"
$AB open "http://localhost:3000/?tab=system-health" >/dev/null 2>&1
PANEL=0
for _ in $(seq 1 40); do
  PANEL=$($AB eval "!!document.querySelector('[data-testid=\\'health-env-panel\\']')" 2>/dev/null | tr -d '"')
  [ "$PANEL" = "true" ] && break
  # the desk's own retry door: a cold-fetch failure leaves the retry card up
  FAILED=$($AB eval "document.body.innerText.includes('Failed to load system status')" 2>/dev/null | tr -d '"')
  [ "$FAILED" = "true" ] && { $AB find text "Retry" click >/dev/null 2>&1; sleep 3; }
  sleep 2
done
[ "$PANEL" = "true" ] && ok "the env panel renders on the health desk" || fail "env panel absent"
$AB press Escape >/dev/null 2>&1; sleep 1
$AB find text "Got it" click >/dev/null 2>&1; sleep 1
BEFORE=$($AB eval "document.querySelector('[data-testid=\\'health-env-copy\\']')?.textContent?.trim()||'absent'" 2>/dev/null | tr -d '"')
case "$BEFORE" in Copy) ok "the copy button waits in its Copy face";; *) fail "copy face before ($BEFORE)";; esac
$AB click '[data-testid="health-env-copy"]' >/dev/null 2>&1; sleep 1
AFTER=$($AB eval "document.querySelector('[data-testid=\\'health-env-copy\\']')?.textContent?.trim()||'absent'" 2>/dev/null | tr -d '"')
case "$AFTER" in Copied) ok "the click speaks: Copied (clipboard granted)";; \
  Copy) fail "click did not flip the face (clipboard refused in headless?)";; \
  *) fail "copy face after ($AFTER)";; esac
sleep 2.5
REVERT=$($AB eval "document.querySelector('[data-testid=\\'health-env-copy\\']')?.textContent?.trim()||'absent'" 2>/dev/null | tr -d '"')
case "$REVERT" in Copy) ok "the 2s beat returns the face to Copy";; *) fail "revert face ($REVERT)";; esac

# ── 4. the admin tab: the census strip answers ────────────────────────────
# (the strip speaks in THREE desks: the switcher dropdown's footer, the
#  Exchange Rates admin card, the org console echo — the admin card is the
#  plain page-open face, the honest probe target)
$AB open "http://localhost:3000/?tab=admin" >/dev/null 2>&1
STRIP=0
for _ in $(seq 1 20); do
  STRIP=$($AB eval "document.body.innerText.includes('admin-set')" 2>/dev/null | tr -d '"')
  [ "$STRIP" = "true" ] && break
  sleep 2
done
[ "$STRIP" = "true" ] && ok "the admin card's rate census strip answers" || fail "census strip silent"

# ── 5. the POS desk renders ───────────────────────────────────────────────
$AB open "http://localhost:3000/?tab=pos" >/dev/null 2>&1; sleep 6
POS=$($AB eval "document.body.innerText.length > 200" 2>/dev/null | tr -d '"')
[ "$POS" = "true" ] && ok "the POS desk renders" || fail "POS desk empty"
$AB close --all >/dev/null 2>&1

# ── 6. teardown ───────────────────────────────────────────────────────────
pkill -f "next dev" 2>/dev/null; pkill -f "next-server" 2>/dev/null
ok "teardown"
echo "qa: $PASS ok / $FAIL fail"
[ "$FAIL" = 0 ]
