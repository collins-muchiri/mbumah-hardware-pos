#!/usr/bin/env node
// probe-drill-v2419.mjs — the opening QA probe: the received PO's detail
// wire (does it carry items with receivedQty?) + the roster's drill rows
// (the browser face), all after a fresh boot in the caller's burst.
const BASE = 'http://localhost:3000';
const jar = [];
const cookieHeader = () => jar.map((c) => `${c.name}=${c.value}`).join('; ');

function collect(res) {
  const set = res.headers.getSetCookie?.() ?? [];
  for (const c of set) {
    const [pair] = c.split(';');
    const eq = pair.indexOf('=');
    jar.push({ name: pair.slice(0, eq), value: pair.slice(eq + 1) });
  }
  return res;
}

async function j(path, opts = {}) {
  const res = collect(await fetch(BASE + path, {
    ...opts,
    headers: { 'Content-Type': 'application/json', ...(opts.headers || {}), Cookie: cookieHeader() },
  }));
  const text = await res.text();
  try { return JSON.parse(text); } catch { return { raw: text.slice(0, 200) }; }
}

const csrf = await j('/api/security/csrf-token');
const token = csrf?.data?.token ?? csrf?.data?.csrfToken;
const login = await j('/api/auth/login', {
  method: 'POST',
  headers: { 'X-CSRF-Token': token },
  body: JSON.stringify({ email: 'admin@mbumahhardware.co.ke', password: 'password123' }),
});
const auth = { Authorization: `Bearer ${login?.data?.token}` };

const list = await j('/api/purchase-orders?storeId=store_juja_main&limit=20', { headers: auth });
const rows = list?.data ?? [];
console.log('roster:', rows.map((p) => `${p.poNumber}:${p.status}`).join('  '));
for (const num of ['PO-20261106-0005', 'PO-20261016-0003', 'PO-20261030-0002']) {
  const hit = rows.find((p) => p.poNumber === num);
  if (!hit) { console.log(`${num}: not in roster`); continue; }
  const det = await j(`/api/purchase-orders/${hit.id}`, { headers: auth });
  const p = det?.data ?? det ?? {};
  const items = p.items ?? [];
  console.log(`${num} detail: status=${p.status} items=${items.length}`);
  for (const it of items) {
    console.log(`   line: qty=${it.quantity} received=${it.receivedQty} product=${it.product?.name ?? it.productId}`);
  }
}
