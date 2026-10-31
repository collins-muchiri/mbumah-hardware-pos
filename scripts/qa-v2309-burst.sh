#!/usr/bin/env bash
# qa-v2309-burst.sh — the round's functional QA burst (ONE call; the sandbox
# reaps background processes between tool calls).
#
# 1. Seed cust_1's wallet (250 pts) so the clawback has something to claw.
# 2. Boot the :3200 daemon (double-fork launcher survives the reap).
# 3. Warm / (the 27s compile window), health-check, CSRF → login.
# 4. GET the refundable views for MBM-RCPT-001 (KES 8,700, 1 line).
# 5. POST the full refund → expect 201 + loyalty.clawedBack = 87.
# 6. Verify the DB truth: wallet 250 → 163, the ADJUST row, the REFUND tx.
# 7. GET the refund transaction detail (the receipt face's data).
set -u
cd /home/z/ems
BASE=http://127.0.0.1:3200
SALE_Q='MBM-RCPT-001'

echo "=== 1. seed the wallet ==="
node -e "
const {PrismaClient}=require('@prisma/client');
const db=new PrismaClient({datasources:{db:{url:'file:/home/z/ems/db/audit-dev.db'}}});
(async()=>{
  const sale=await db.salesTransaction.findFirst({where:{receiptNumber:'${SALE_Q}'}});
  if(!sale){console.error('sale not found');process.exit(1);}
  console.log('SALE_ID='+sale.id, 'TOTAL='+sale.totalAmount.toString(), 'CUST='+sale.customerId);
  await db.customer.update({where:{id:sale.customerId},data:{loyaltyPoints:250}});
  console.log('wallet seeded: cust points=250');
  await db.\$disconnect();
})().catch(e=>{console.error(e.message.slice(0,200));process.exit(1)});
" > /tmp/qa-sale.txt || { cat /tmp/qa-sale.txt; exit 1; }
cat /tmp/qa-sale.txt
SALE_ID=$(grep -o 'SALE_ID=\S*' /tmp/qa-sale.txt | cut -d= -f2)

echo "=== 2. kill stale daemons + boot ==="
for pid in $(lsof -ti tcp:3200 2>/dev/null); do kill -9 "$pid" 2>/dev/null; done
sleep 1
node scripts/ems-daemon-3200.cjs
echo "launcher returned; polling health…"
for i in $(seq 1 60); do
  H=$(curl -s -m 2 "$BASE/api/health" 2>/dev/null | head -c 120)
  if echo "$H" | grep -q '"success":true'; then echo "health OK after ${i} polls: $H"; break; fi
  sleep 3
done
curl -s -m 2 "$BASE/api/health" | python3 -c "import json,sys;d=json.load(sys.stdin);print('version:',d['data'].get('version'),'| db:',d['data'].get('database',{}).get('status'))" 2>/dev/null || echo "health parse failed"

echo "=== 3. warm / (the compile window) ==="
curl -s -o /dev/null -w "GET / → %{http_code} in %{time_total}s\n" -m 120 "$BASE/"

echo "=== 4. CSRF + login ==="
CSRF=$(curl -s -c /tmp/qa-cookies.txt "$BASE/api/security/csrf-token" | python3 -c "import json,sys;print(json.load(sys.stdin)['data']['token'])")
echo "csrf token: ${CSRF:0:8}…"
LOGIN=$(curl -s -b /tmp/qa-cookies.txt -c /tmp/qa-cookies.txt -X POST "$BASE/api/auth/login" \
  -H "Content-Type: application/json" -H "X-CSRF-Token: $CSRF" \
  -d '{"email":"admin@mbumahhardware.co.ke","password":"password123"}')
echo "$LOGIN" | python3 -c "import json,sys;d=json.load(sys.stdin);print('login:',d.get('success'),'| role:',(d.get('data') or {}).get('user',{}).get('role'))"

echo "=== 5. GET refundable views ==="
curl -s -b /tmp/qa-cookies.txt "$BASE/api/transactions/$SALE_ID/refund" | python3 -m json.tool | head -30

echo "=== 6. POST the full refund ==="
LINE_ID=$(curl -s -b /tmp/qa-cookies.txt "$BASE/api/transactions/$SALE_ID/refund" | python3 -c "import json,sys;print(json.load(sys.stdin)['data']['lines'][0]['saleItemId'])")
curl -s -b /tmp/qa-cookies.txt -X POST "$BASE/api/transactions/$SALE_ID/refund" \
  -H "Content-Type: application/json" -H "X-CSRF-Token: $CSRF" \
  -d "{\"lines\":[{\"saleItemId\":\"$LINE_ID\",\"quantity\":1}],\"restock\":true,\"reason\":\"OTHER\"}" > /tmp/qa-refund.json
python3 - <<'EOF'
import json
d = json.load(open('/tmp/qa-refund.json'))
data = d.get('data') or {}
print('success:', d.get('success'), '| code:', d.get('code'), '| error:', d.get('error'))
if data:
    print('refund receipt:', data['refund']['receiptNumber'], '| total:', data['refundTotal'])
    print('original now:', data['originalPaymentStatus'], '| remaining:', data['remainingRefundable'])
    print('LOYALTY:', json.dumps(data.get('loyalty')))
EOF
REFUND_ID=$(python3 -c "import json;print((json.load(open('/tmp/qa-refund.json')).get('data') or {}).get('refund',{}).get('id',''))")

echo "=== 7. the DB truth ==="
node -e "
const {PrismaClient}=require('@prisma/client');
const db=new PrismaClient({datasources:{db:{url:'file:/home/z/ems/db/audit-dev.db'}}});
(async()=>{
  const sale=await db.salesTransaction.findUnique({where:{id:'$SALE_ID'},select:{paymentStatus:true,customerId:true}});
  const cust=await db.customer.findUnique({where:{id:sale.customerId},select:{loyaltyPoints:true}});
  const adj=await db.loyaltyTransaction.findFirst({where:{transactionType:'ADJUST'},orderBy:{createdAt:'desc'}});
  console.log('original status:',sale.paymentStatus,'| wallet now:',cust.loyaltyPoints);
  if(adj) console.log('ADJUST row:',adj.points,'pts | balanceAfter:',adj.balanceAfter,'| reason:',adj.reason,'| ref:',adj.reference);
  else console.log('NO ADJUST ROW');
  await db.\$disconnect();
})().catch(e=>{console.error(e.message.slice(0,150));process.exit(1)});
"

echo "=== 8. the refund detail (the receipt face's data) ==="
if [ -n "$REFUND_ID" ]; then
  curl -s -b /tmp/qa-cookies.txt "$BASE/api/transactions/$REFUND_ID" | python3 -c "
import json,sys
d=json.load(sys.stdin)
t=(d.get('data') or {})
print('detail success:', d.get('success'), '| type:', t.get('transactionType'), '| notes:', (t.get('notes') or '')[:60])
print('items:', len(t.get('items') or []), '| total:', t.get('totalAmount'))
"
else
  echo "no refund id — POST failed, see above"
fi
echo "=== QA BURST COMPLETE ==="
