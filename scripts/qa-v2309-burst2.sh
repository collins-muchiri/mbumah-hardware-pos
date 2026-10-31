#!/usr/bin/env bash
# qa-v2309-burst2.sh — the notes-fix re-verification + the browser walk.
set -u
cd /home/z/ems
BASE=http://127.0.0.1:3200

echo "=== boot check ==="
for pid in $(lsof -ti tcp:3200 2>/dev/null); do kill -9 "$pid" 2>/dev/null; done
sleep 1
node scripts/ems-daemon-3200.cjs
for i in $(seq 1 60); do
  H=$(curl -s -m 2 "$BASE/api/health" 2>/dev/null | head -c 80)
  if echo "$H" | grep -q 'success'; then echo "health OK (poll $i)"; break; fi
  sleep 3
done
curl -s -o /dev/null -w "GET / → %{http_code} in %{time_total}s\n" -m 120 "$BASE/"

echo "=== login ==="
CSRF=$(curl -s -c /tmp/qa2-cookies.txt "$BASE/api/security/csrf-token" | python3 -c "import json,sys;print(json.load(sys.stdin)['data']['token'])")
curl -s -b /tmp/qa2-cookies.txt -c /tmp/qa2-cookies.txt -X POST "$BASE/api/auth/login" \
  -H "Content-Type: application/json" -H "X-CSRF-Token: $CSRF" \
  -d '{"email":"admin@mbumahhardware.co.ke","password":"password123"}' | python3 -c "import json,sys;d=json.load(sys.stdin);print('login:',d.get('success'))"

echo "=== second refund (the notes fix proof) ==="
SALE_ID=$(node -e "
const {PrismaClient}=require('@prisma/client');
const db=new PrismaClient({datasources:{db:{url:'file:/home/z/ems/db/audit-dev.db'}}});
db.salesTransaction.findFirst({where:{receiptNumber:'MBM-RCPT-001'},select:{id:true}}).then(s=>{console.log(s.id);return db.\$disconnect()});
")
LINE_ID=$(curl -s -b /tmp/qa2-cookies.txt "$BASE/api/transactions/$SALE_ID/refund" | python3 -c "import json,sys;print(json.load(sys.stdin)['data']['lines'][0]['saleItemId'])")
curl -s -b /tmp/qa2-cookies.txt -X POST "$BASE/api/transactions/$SALE_ID/refund" \
  -H "Content-Type: application/json" -H "X-CSRF-Token: $CSRF" \
  -d "{\"lines\":[{\"saleItemId\":\"$LINE_ID\",\"quantity\":2}],\"restock\":false,\"reason\":\"DEFECTIVE\"}" | python3 -c "
import json,sys
d=json.load(sys.stdin); t=d.get('data') or {}
print('success:', d.get('success'), '| refund:', (t.get('refund') or {}).get('receiptNumber'), '| total:', t.get('refundTotal'))
print('LOYALTY:', json.dumps(t.get('loyalty')))
print('NOTES-JSON-ABSENT (detail carries it — check db below)')
"
node -e "
const {PrismaClient}=require('@prisma/client');
const db=new PrismaClient({datasources:{db:{url:'file:/home/z/ems/db/audit-dev.db'}}});
(async()=>{
  const r=await db.salesTransaction.findFirst({where:{transactionType:'REFUND'},orderBy:{createdAt:'desc'},select:{notes:true,receiptNumber:true}});
  console.log('latest REFUND notes:', r.notes);
  const ok=/Refund of MBM-RCPT-001$/.test(r.notes);
  console.log('CHAIN REFERENCE RIDES THE NOTES:', ok ? 'YES' : 'NO');
  const c=await db.customer.findUnique({where:{id:'cust_1'},select:{loyaltyPoints:true}});
  console.log('wallet now:', c.loyaltyPoints);
  await db.\$disconnect();
})().catch(e=>{console.error(e.message.slice(0,120));process.exit(1)});
"

echo "=== browser walk (the OOM playbook: chrome closed → warm done → open) ==="
pkill -f chrome 2>/dev/null; sleep 1
agent-browser open "$BASE/login" 2>&1 | head -5
sleep 3
agent-browser snapshot 2>&1 | head -25
