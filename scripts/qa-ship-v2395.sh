#!/usr/bin/env bash
# qa-ship-v2395.sh — the SHIPPED-feature browser burst (single-call law):
# boot :3000 at main (2.395.0), login, open the e-TIMS audit log, click a
# Receipt door, assert the paper-trail dialog speaks. LOCAL-ONLY.
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
  node scripts/seed-kra-fixtures.mjs 2>&1 | tail -1

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
echo "$health" | grep -q '2.395.0' && ok ":3000 healthy at 2.395.0" || bad "version mismatch: $(echo "$health" | head -c 120)"
curl -s -m 420 -o /tmp/qa-root.html http://localhost:3000/

agent-browser close --all >/dev/null 2>&1 || true
agent-browser open http://localhost:3000/ >/dev/null 2>&1
sleep 8
agent-browser cookies clear >/dev/null 2>&1 || true
agent-browser storage local clear >/dev/null 2>&1 || true
agent-browser reload >/dev/null 2>&1
seen=0
for i in $(seq 1 90); do
  if agent-browser is visible 'input[type="email"]' >/dev/null 2>&1; then seen=1; break; fi
  sleep 2
done
[ "$seen" = 1 ] && ok "sign-in face visible" || bad "sign-in face never visible"
agent-browser fill 'input[type="email"]' 'admin@mbumahhardware.co.ke' >/dev/null 2>&1
agent-browser fill 'input[type="password"]' 'password123' >/dev/null 2>&1
agent-browser press Enter >/dev/null 2>&1
wait_grep "Dashboard|POS|What.s New|KRA eTIMS" 240 && ok "logged in" || bad "login stalled"
# THE WHATS-NEW DISMISSAL (the handover law: dismissed BEFORE any desk
# assertion — the modal's aria-hidden backdrop hides the desk from the
# a11y snapshot; the v2.395 modal itself announces the new release)
sleep 3
agent-browser press Escape >/dev/null 2>&1
sleep 2
agent-browser snapshot 2>/dev/null | grep -qiE "what.s new" && { agent-browser press Escape >/dev/null 2>&1; sleep 2; }
agent-browser snapshot 2>/dev/null | grep -qiE "what.s new" && bad "whats-new modal still up" || ok "whats-new dismissed"

agent-browser open "http://localhost:3000/?tab=etims&view=audit" >/dev/null 2>&1
wait_grep "KRA API Audit Log" 240 && ok "audit log section" || bad "audit log section missing"
# the rows mount lazily (the query compiles on first hit) — wait for a door
wait_grep "kra-audit-receipt-open|Receipt" 120 || true
agent-browser click '[data-testid="kra-audit-receipt-open"]' >/dev/null 2>&1 || { echo "  testid click failed, trying text"; agent-browser find text "Receipt" click >/dev/null 2>&1; }
if wait_grep "KRA submission receipt" 60; then
  ok "THE RECEIPT-HOP: the dialog opened"
else
  bad "the receipt dialog never opened"
fi
snap=$(agent-browser snapshot 2>/dev/null || true)
echo "$snap" | grep -q "KRA reference" && ok "the record speaks (KRA reference row)" || bad "record rows missing"
echo "$snap" | grep -qiE "KRA response|No response body" && ok "the response face speaks" || bad "response face missing"
echo "$snap" | grep -q "Print submission receipt" && ok "the Print face present" || bad "Print face missing"
errs=$(agent-browser errors 2>/dev/null | tail -n +2 | grep -c . || true)
echo "  page errors: $errs"
[ "$errs" = 0 ] && ok "console errors 0" || bad "console errors present"

agent-browser close --all >/dev/null 2>&1 || true
pkill -f "next dev" 2>/dev/null; sleep 1
echo "== SHIP BURST DONE: $PASS ok / $FAIL fail =="
[ "$FAIL" = 0 ]
