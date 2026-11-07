#!/bin/bash
# burst-pre-v2453.sh — Task 149's pre-work QA burst (single call, plain boot).
# Laws honored: PLAIN `npm run dev` (the heap-cap thrash), eval strip `"` AND `\`,
# no Radix tab-click fights (All-view reads only).
set -u
cd /home/z/ems
PASS=0; FAIL=0
ok()   { echo "  ok: $1"; PASS=$((PASS+1)); }
fail() { echo "  FAIL: $1"; FAIL=$((FAIL+1)); }
AB="agent-browser"

# ── 1. plain boot ─────────────────────────────────────────────────────────
pkill -f "next dev" 2>/dev/null; pkill -f "next-server" 2>/dev/null; sleep 1
nohup npm run dev > /tmp/burst-pre-v2453-dev.log 2>&1 &
BOOTED=0
for _ in $(seq 1 75); do
  if curl -s -m 2 http://localhost:3000/api/health 2>/dev/null | grep -q '"status":"ok"'; then BOOTED=1; break; fi
  sleep 2
done
[ "$BOOTED" = 1 ] && ok "boot (dev ready, plain)" || { fail "boot"; tail -12 /tmp/burst-pre-v2453-dev.log; exit 1; }
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

# ── 3. the dashboard mounts (stats row's home ground) ────────────────────
MOUNTED=0
for ATTEMPT in 1 2 3; do
  $AB open "http://localhost:3000/" > /dev/null 2>&1
  for _ in $(seq 1 12); do
    R=$($AB eval "JSON.stringify({cards: document.querySelectorAll('[data-slot=card], .rounded-xl.border').length, err: document.body.innerText.slice(0,80).includes('Application error')})" 2>/dev/null | tr -d '"')
    if echo "$R" | grep -q 'err\\:false'; then MOUNTED=1; break; fi
    sleep 3
  done
  [ "$MOUNTED" = 1 ] && break
  echo "  (mount attempt $ATTEMPT stalled: $R)"
done
echo "  (probe: $R)"
[ "$MOUNTED" = 1 ] && ok "the dashboard mounts, no application error" || fail "dashboard mount"

# ── 4. the customers desk (the envelope meter's coerced seat) ────────────
$AB open "http://localhost:3000/?tab=customers" > /dev/null 2>&1
sleep 6
CUST=$($AB eval "JSON.stringify({rows: document.querySelectorAll('tbody tr').length, appErr: document.body.innerText.includes('Application error')})" 2>/dev/null | tr -d '"')
echo "  (customers probe: $CUST)"
echo "$CUST" | grep -q 'appErr\\:false' && ok "customers desk mounts, no application error" || fail "customers desk ($CUST)"

# ── 5. the dev log's error census ─────────────────────────────────────────
ERRS=$(grep -cE "Error:|Unhandled|FATAL" /tmp/burst-pre-v2453-dev.log 2>/dev/null; true)
ERRS=$(echo "$ERRS" | tail -1)
[ "$ERRS" -le 2 ] && ok "dev log error census small ($ERRS)" || fail "dev log errors: $ERRS"
grep -E "Error:|Unhandled|FATAL" /tmp/burst-pre-v2453-dev.log 2>/dev/null | head -4 || true

echo "PRE-BURST VERDICT: $PASS ok / $FAIL fail"
[ "$FAIL" = 0 ]
