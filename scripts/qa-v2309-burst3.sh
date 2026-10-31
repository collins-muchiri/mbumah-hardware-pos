#!/usr/bin/env bash
# qa-v2309-burst3.sh — dev-mode QA burst: the launcher's `next start` needs a
# production build (OOM-blocked in this sandbox), so the burst forks
# `next dev` directly, pinned to the audit QA world (THE PIN LAW: the pin
# rides the spawn env, process env beats .env).
set -u
cd /home/z/ems
BASE=http://127.0.0.1:3200

echo "=== boot (next dev, double-fork, pinned) ==="
for pid in $(lsof -ti tcp:3200 2>/dev/null); do kill -9 "$pid" 2>/dev/null; done
sleep 1
node -e "
const {spawn}=require('node:child_process');
const fs=require('node:fs');
const child=spawn(process.execPath,
  ['/home/z/ems/node_modules/next/dist/bin/next','dev','-p','3200'],
  {cwd:'/home/z/ems',detached:true,stdio:['ignore',fs.openSync('/home/z/ems/server-3200-dev.log','a'),fs.openSync('/home/z/ems/server-3200-dev.log','a')],
   env:{...process.env,DATABASE_URL:'file:/home/z/ems/db/audit-dev.db',DIRECT_URL:'file:/home/z/ems/db/audit-dev.db',PORT:'3200'}});
child.unref();
console.log('dev fork pid',child.pid);
"
for i in $(seq 1 70); do
  H=$(curl -s -m 3 "$BASE/api/health" 2>/dev/null | head -c 60)
  if echo "$H" | grep -q 'success'; then echo "health OK (poll $i)"; break; fi
  sleep 2
done
curl -s "$BASE/api/health" | python3 -c "import json,sys;d=json.load(sys.stdin);dd=d.get('data') or {};print('health version:',dd.get('version') or dd.get('appVersion') or 'n/a')" 2>/dev/null || true

echo "=== warm / ==="
curl -s -o /dev/null -w "GET / → %{http_code} in %{time_total}s\n" -m 180 "$BASE/"

echo "=== login ==="
CSRF=$(curl -s -c /tmp/qa3-cookies.txt "$BASE/api/security/csrf-token" | python3 -c "import json,sys;print(json.load(sys.stdin)['data']['token'])")
curl -s -b /tmp/qa3-cookies.txt -c /tmp/qa3-cookies.txt -X POST "$BASE/api/auth/login" \
  -H "Content-Type: application/json" -H "X-CSRF-Token: $CSRF" \
  -d '{"email":"admin@mbumahhardware.co.ke","password":"password123"}' | python3 -c "import json,sys;d=json.load(sys.stdin);print('login:',d.get('success'),'| role:',(d.get('data') or {}).get('user',{}).get('role'))"

echo "=== refund #2 (the notes fix proof) ==="
SALE_ID=$(node -e "
const {PrismaClient}=require('@prisma/client');
const db=new PrismaClient({datasources:{db:{url:'file:/home/z/ems/db/audit-dev.db'}}});
db.salesTransaction.findFirst({where:{receiptNumber:'MBM-RCPT-001'},select:{id:true}}).then(s=>{console.log(s.id);return db.\$disconnect()});
")
LINE_ID=$(curl -s -b /tmp/qa3-cookies.txt "$BASE/api/transactions/$SALE_ID/refund" | python3 -c "import json,sys;print(json.load(sys.stdin)['data']['lines'][0]['saleItemId'])")
curl -s -b /tmp/qa3-cookies.txt -X POST "$BASE/api/transactions/$SALE_ID/refund" \
  -H "Content-Type: application/json" -H "X-CSRF-Token: $CSRF" \
  -d "{\"lines\":[{\"saleItemId\":\"$LINE_ID\",\"quantity\":2}],\"restock\":false,\"reason\":\"DEFECTIVE\"}" | python3 -c "
import json,sys
d=json.load(sys.stdin); t=d.get('data') or {}
print('success:', d.get('success'), '| refund:', (t.get('refund') or {}).get('receiptNumber'), '| total:', t.get('refundTotal'))
print('LOYALTY:', json.dumps(t.get('loyalty')))
print('remaining:', t.get('remainingRefundable'), '| original now:', t.get('originalPaymentStatus'))
"
node -e "
const {PrismaClient}=require('@prisma/client');
const db=new PrismaClient({datasources:{db:{url:'file:/home/z/ems/db/audit-dev.db'}}});
(async()=>{
  const r=await db.salesTransaction.findFirst({where:{transactionType:'REFUND'},orderBy:{createdAt:'desc'},select:{notes:true}});
  console.log('latest REFUND notes:', JSON.stringify(r.notes));
  console.log('CHAIN REFERENCE RIDES THE NOTES:', /Refund of MBM-RCPT-001/.test(r.notes) ? 'YES' : 'NO');
  const c=await db.customer.findUnique({where:{id:'cust_1'},select:{loyaltyPoints:true}});
  console.log('wallet now:', c.loyaltyPoints, '(250 → -7 → -14 expected 236)');
  const adj=await db.loyaltyTransaction.findMany({where:{transactionType:'ADJUST'},orderBy:{createdAt:'desc'},take:2,select:{points:true,balanceAfter:true,reason:true}});
  console.log('ADJUST rows:', JSON.stringify(adj));
  await db.\$disconnect();
})().catch(e=>{console.error(e.message.slice(0,120));process.exit(1)});
"

echo "=== browser walk (warm done; transactions chunk is the risk) ==="
pkill -f "chrome" 2>/dev/null; sleep 1
agent-browser open "$BASE/login" 2>&1 | head -3
sleep 4
agent-browser snapshot 2>&1 | head -15
