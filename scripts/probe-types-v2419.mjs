#!/usr/bin/env node
// probe-types-v2419.mjs — THE METER'S LIE probe: the detail wire's own
// types for receivedQty/quantity/totalCost (a string arriving where the
// receive's arithmetic expects a number makes `receivedQty + qty`
// string-concat — the pct clamps to a lying 100).
const BASE = 'http://localhost:3000';
const jar = [];
const ch = () => jar.map((c) => `${c.name}=${c.value}`).join('; ');
async function j(path, opts = {}) {
  const res = await fetch(BASE + path, {
    ...opts,
    headers: { 'Content-Type': 'application/json', ...(opts.headers || {}), Cookie: ch() },
  });
  for (const c of res.headers.getSetCookie?.() ?? []) {
    const [pair] = c.split(';');
    const eq = pair.indexOf('=');
    jar.push({ name: pair.slice(0, eq), value: pair.slice(eq + 1) });
  }
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
for (const num of ['PO-20261016-0003', 'PO-20261106-0005', 'PO-20261030-0002']) {
  const hit = (list.data || []).find((p) => p.poNumber === num);
  if (!hit) { console.log(`${num}: missing`); continue; }
  const det = await j(`/api/purchase-orders/${hit.id}`, { headers: auth });
  const items = det?.data?.items ?? det?.items ?? [];
  console.log(`${num} (${det?.data?.status ?? det?.status}):`);
  for (const it of items) {
    console.log(
      `  ${String(it.product?.name).slice(0, 28).padEnd(28)} quantity: ${typeof it.quantity} ${JSON.stringify(it.quantity)}  receivedQty: ${typeof it.receivedQty} ${JSON.stringify(it.receivedQty)}  unitCost: ${typeof it.unitCost}`,
    );
  }
}
