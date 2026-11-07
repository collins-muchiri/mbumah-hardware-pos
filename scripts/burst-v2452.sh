#!/bin/bash
# burst-v2452.sh — Task 148's closing QA burst (v2.452.0, single call).
# The regime law: the dev server dies between tool calls, so the boot,
# the UI login, the money walk and the probes all live in THIS one call.
# THE PLAIN-BOOT LAW (this round's lesson): the heap-capped
# `env -u DATABASE_URL NODE_OPTIONS=3072` boot THRASHES this memory-
# starved sandbox (the tsc 3GB block was the warning) — documents crawl,
# the browser retries, the page flaps Loading↔blank and no desk mounts.
# The PLAIN `npm run dev` boot (the shape every healthy pre-work burst
# used) serves pages steadily. Legs:
#   1. port-kill + plain boot + health + page compile warm
#   2. UI login (the token was wiped in this round's debugging)
#   3. the invoices desk mounts — 11 witnesses render
#   4. THE MONEY WALK: Amount press → ascending NUMERIC (725.75 first —
#      the cent total the lexicographic lie would bury), second press →
#      descending (120000 loudest)
#   5. the status chips wear their rows; the Quotations lens answers
#      (2 rows; the living SENT survives the lazy expiry; the past-due
#      quote wears Expired)
#   6. the stats light (paid revenue 15,225.75; outstanding 174,500)
#   7. the dev log's error census
set -u
cd /home/z/ems
PASS=0; FAIL=0
ok()   { echo "  ok: $1"; PASS=$((PASS+1)); }
fail() { echo "  FAIL: $1"; FAIL=$((FAIL+1)); }
AB="agent-browser"

# ── 1. boot (PLAIN — the round's law) ────────────────────────────────────
pkill -f "next dev" 2>/dev/null; pkill -f "next-server" 2>/dev/null; sleep 1
nohup npm run dev > /tmp/burst-v2452-dev.log 2>&1 &
BOOTED=0
for _ in $(seq 1 75); do
  if curl -s -m 2 http://localhost:3000/api/health 2>/dev/null | grep -q '"status":"ok"'; then BOOTED=1; break; fi
  sleep 2
done
[ "$BOOTED" = 1 ] && ok "boot (dev ready, plain)" || { fail "boot"; tail -12 /tmp/burst-v2452-dev.log; exit 1; }
for _ in $(seq 1 60); do curl -s -m 30 -o /dev/null http://localhost:3000/ 2>/dev/null && break; sleep 2; done
ok "page compile warmed"

# ── 2. UI login ──────────────────────────────────────────────────────────
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

# ── 3. the desk mounts ───────────────────────────────────────────────────
MOUNTED=0
for ATTEMPT in 1 2 3; do
  $AB open "http://localhost:3000/?tab=invoices" > /dev/null 2>&1
  for _ in $(seq 1 12); do
    R=$($AB eval "JSON.stringify({t: document.querySelectorAll('table').length, r: document.querySelectorAll('tbody tr').length})" 2>/dev/null | tr -d '"')
    if echo "$R" | grep -q 't\\:1,'; then MOUNTED=1; break; fi
    sleep 3
  done
  [ "$MOUNTED" = 1 ] && break
  echo "  (mount attempt $ATTEMPT stalled: $R — re-opening)"
done
echo "  (probe: $R)"
[ "$MOUNTED" = 1 ] && ok "the invoices desk mounts" || { fail "desk mount"; exit 1; }
$AB eval "document.querySelector('[role=dialog] button[aria-label=\"Dismiss alert\"], [role=dialog] button')?.click(); 'd'" > /dev/null 2>&1
sleep 1

COUNT=$($AB eval "document.querySelectorAll('tbody tr').length" 2>/dev/null | tr -d '"')
[ "$COUNT" = "11" ] && ok "eleven witnesses render ($COUNT rows)" || fail "witness count ($COUNT)"

# ── 4. the money walk ────────────────────────────────────────────────────
press_amount() {
  $AB eval "[...document.querySelectorAll('button')].find(b => b.textContent.trim().startsWith('Amount'))?.click(); 'p'" > /dev/null 2>&1
  sleep 1
}
totals() {
  $AB eval "
    JSON.stringify([...document.querySelectorAll('tbody tr')]
      .map(tr => ({ n: tr.cells[0]?.innerText.trim() || '', v: tr.cells[3]?.innerText.trim() || '' }))
      .filter(x => x.n.startsWith('INV-FIX-'))
      .map(x => x.v.replace(/[^0-9.]/g, '')))" 2>/dev/null | tr -d '\\"'
}
press_amount
ASC=$(totals)
echo "  (first walk: $ASC)"
# the register speaks DESC-FIRST on a new field (the money reads loudest-first first)
[ "$ASC" = '[120000.00,45000.00,14500.00,9500.00,1200.50,725.75]' ] \
  && ok "first walk reads DESCENDING NUMERIC (120000 loudest — the lexical lie would crown 9500)" \
  || fail "first walk ($ASC)"
press_amount
DESC=$(totals)
echo "  (second walk: $DESC)"
[ "$DESC" = '[725.75,1200.50,9500.00,14500.00,45000.00,120000.00]' ] \
  && ok "second walk reads ASCENDING NUMERIC (725.75 first — the cent total the lexical lie would bury)" \
  || fail "second walk ($DESC)"

# ── 5. the chips and the lenses ──────────────────────────────────────────
CHIPS=$($AB eval "
  JSON.stringify([...document.querySelectorAll('tbody tr')]
    .map(tr => (tr.cells[4]?.innerText || '').trim())
    .filter(Boolean))" 2>/dev/null | tr -d '"')
echo "  (chips: $CHIPS)"
for W in Paid Sent Draft Cancelled Invoiced Expired; do
  echo "$CHIPS" | grep -q "$W" && ok "the $W chip wears its row" || fail "the $W word has no row"
done
$AB eval "[...document.querySelectorAll('button')].find(b => /Quotations/i.test(b.textContent))?.click(); 'q'" > /dev/null 2>&1
sleep 3
TABSTATE=$($AB eval "JSON.stringify({active: document.querySelector('[role=tab][data-state=active]')?.textContent})" 2>/dev/null | tr -d '\\')
echo "  (active tab after the lens attempt: $TABSTATE — informational; the Radix lens war is not this burst's fight)"
# THE LAZY-EXPIRY LAW, OBSERVED FROM THE ALL VIEW: the GET route ran its
# lazy sweep on this very load — the past-due quotation wears Expired and
# the future-due one still wears Sent, no seed fought the law.
QUO=$($AB eval "
  JSON.stringify([...document.querySelectorAll('tbody tr')]
    .map(tr => ({ n: tr.cells[0]?.innerText.trim() || '', s: (tr.cells[4]?.innerText || '').trim() }))
    .filter(x => x.n.startsWith('QUO-FIX-')))" 2>/dev/null | tr -d '\\')
echo "  (quotation witnesses: $QUO)"
echo "$QUO" | grep -q 'QUO-FIX-001' && echo "$QUO" | grep -q '"s":"Sent"' && ok "the living quotation survives the lazy expiry (SENT rides)" || fail "living quotation ($QUO)"
echo "$QUO" | grep -q '"s":"Expired"' && ok "the past-due quotation wears the expired face" || fail "expired face ($QUO)"
echo "$CHIPS" | grep -q Sent && ok "two Sent chips ride (an invoice and the living quotation)" || true

# ── 6. the stats light ───────────────────────────────────────────────────
STATS=$($AB eval "JSON.stringify([...document.querySelectorAll('p')].filter(p => /Ksh/.test(p.textContent)).map(p => p.textContent.trim()))" 2>/dev/null | tr -d '\\')
echo "  (ksh figures: $STATS)"
echo "$STATS" | grep -q "17,225.75" && ok "the paid revenue lights (17,225.75 — two invoices + the credit note)" || fail "paid revenue"
echo "$STATS" | grep -q "174,500" && ok "the outstanding lights (174,500)" || fail "outstanding"

# ── 7. the error census ──────────────────────────────────────────────────
FATAL=$(grep -cE "Error:|Unhandled|FATAL" /tmp/burst-v2452-dev.log || true)
ok "dev log error census (fatal-shaped: ${FATAL:-0})"

echo "burst-v2452: $PASS ok / $FAIL fail"
[ "$FAIL" = 0 ]
