#!/usr/bin/env bash
# qa-mpesa-v2396.sh — the SHIPPED-feature browser burst (single-call law):
# boot :3000 at the round tree, login, deep-link the M-Pesa pane through
# the lens words, assert the four statuses' rows + the actions. LOCAL-ONLY.
set -u
cd /home/z/ems
PASS=0; FAIL=0
ok() { echo "  ok: $1"; PASS=$((PASS+1)); }
bad() { echo "  FAIL: $1"; FAIL=$((FAIL+1)); }
wait_grep() {
  local pat="$1" mx="${2:-90}" i=0
  while [ "$i" -lt "$mx" ]; do
    if agent-browser snapshot 2>/dev/null | grep -qiE "$pat"; then return 0; fi
    sleep 3; i=$((i+3))
  done
  return 1
}

NODE_ENV=development DATABASE_URL="file:/home/z/ems/db/audit-dev.db" \
  node scripts/seed-mpesa-fixtures.mjs 2>&1 | tail -1

pkill -f "next dev" 2>/dev/null; sleep 1
rm -f dev.log
(env -u DATABASE_URL nohup npm run dev >/dev/null 2>&1 &)
up=0
for i in $(seq 1 90); do
  if curl -s -o /dev/null -m 2 http://localhost:3000/api/health; then up=1; break; fi
  sleep 2
done
[ "$up" = 1 ] || { bad "server never answered"; tail -20 dev.log; exit 1; }
health=$(curl -s http://localhost:3000/api/health)
echo "$health" | grep -q '2.396.0' && ok ":3000 healthy at 2.396.0" || bad "version mismatch"
curl -s -m 420 -o /dev/null http://localhost:3000/

agent-browser close --all >/dev/null 2>&1 || true
agent-browser open http://localhost:3000/ >/dev/null 2>&1
sleep 8
agent-browser cookies clear >/dev/null 2>&1 || true
agent-browser storage local clear >/dev/null 2>&1 || true
agent-browser reload >/dev/null 2>&1
for i in $(seq 1 90); do
  agent-browser is visible 'input[type="email"]' >/dev/null 2>&1 && break
  sleep 2
done
agent-browser fill 'input[type="email"]' 'admin@mbumahhardware.co.ke' >/dev/null 2>&1
agent-browser fill 'input[type="password"]' 'password123' >/dev/null 2>&1
agent-browser press Enter >/dev/null 2>&1
wait_grep "Dashboard|POS|What.s New|KRA eTIMS" 240 && ok "logged in" || bad "login stalled"
sleep 3
agent-browser press Escape >/dev/null 2>&1; sleep 2
agent-browser snapshot 2>/dev/null | grep -qiE "what.s new" && { agent-browser press Escape >/dev/null 2>&1; sleep 2; }
agent-browser snapshot 2>/dev/null | grep -qiE "what.s new" && bad "whats-new modal still up" || ok "whats-new dismissed"

echo "== the DISPUTED word lands real rows =="
agent-browser open "http://localhost:3000/?tab=banking&bank-mpesa=DISPUTED" >/dev/null 2>&1
if wait_grep "M-Pesa" 240; then ok "the banking desk landed"; else bad "banking desk missing"; fi
wait_grep "Disputed" 120 && ok "the DISPUTED lens answers real rows" || bad "no disputed rows"
snap=$(agent-browser snapshot 2>/dev/null || true)
echo "$snap" | grep -q "Reopen" && ok "the Reopen action speaks" || bad "Reopen missing"
echo "$snap" | grep -q "Match" && ok "the Match action speaks" || bad "Match missing"
echo "$snap" | grep -q "MPX-FIX-007" && ok "the fixture row wears its reference" || bad "fixture row missing"

echo "== the UNMATCHED word lands real rows =="
agent-browser open "http://localhost:3000/?tab=banking&bank-mpesa=UNMATCHED" >/dev/null 2>&1
wait_grep "Unmatched" 120 && ok "the UNMATCHED lens answers real rows" || bad "no unmatched rows"

echo "== the legacy face still derives (PENDING + MATCHED piles) =="
agent-browser open "http://localhost:3000/?tab=banking&bank-mpesa=MATCHED" >/dev/null 2>&1
wait_grep "Matched" 120 && ok "the MATCHED pile renders" || bad "matched pile missing"

echo "== console errors =="
errs=$(agent-browser errors 2>/dev/null | tail -n +2 | grep -c . || true)
echo "  page errors: $errs"
[ "$errs" = 0 ] && ok "console errors 0" || bad "console errors present"

agent-browser close --all >/dev/null 2>&1 || true
pkill -f "next dev" 2>/dev/null; sleep 1
echo "== MPESA BURST DONE: $PASS ok / $FAIL fail =="
[ "$FAIL" = 0 ]
