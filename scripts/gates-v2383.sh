#!/usr/bin/env bash
# gates-v2383.sh — the full vitest + production build under the OOM law:
# the :3000 guard stops for the whole gate and is restored at the end.
set -u
cd /home/z/ems

# ── stop the :3000 guard (OOM law) ────────────────────────────────
for pid in $(ss -tlnp 2>/dev/null | grep ':3000 ' | grep -oP 'pid=\K[0-9]+' | sort -u); do
  kill "$pid" 2>/dev/null
done
sleep 1
for pid in $(ss -tlnp 2>/dev/null | grep ':3000 ' | grep -oP 'pid=\K[0-9]+' | sort -u); do
  kill -9 "$pid" 2>/dev/null
done
echo "guard stopped"

# ── the house-db law: the vitest setup forces prisma/prisma/dev.db ──
mkdir -p prisma/prisma
if [ ! -f prisma/prisma/dev.db ]; then
  echo "house db missing — pushing + seeding"
  DATABASE_URL='file:/home/z/ems/prisma/prisma/dev.db' npx prisma db push --skip-generate >/dev/null 2>&1
  NODE_ENV=development DATABASE_URL='file:/home/z/ems/prisma/prisma/dev.db' npx tsx prisma/seed.ts >/dev/null 2>&1 || true
fi
ls -la prisma/prisma/dev.db 2>/dev/null | awk '{print "house db bytes:", $5}'

# ── full vitest ───────────────────────────────────────────────────
echo "=== FULL VITEST ==="
npx vitest run 2>&1 | tail -6

# ── production build ──────────────────────────────────────────────
echo "=== PRODUCTION BUILD ==="
DATABASE_URL='file:/home/z/ems/db/audit-dev.db' npx next build 2>&1 | tail -8
echo "build exit: $?"

# ── restore the :3000 guard (the dev-server form) ─────────────────
cd /home/z/my-project
python3 scripts/launch-detached.py npx next dev -p 3000 >/dev/null 2>&1
sleep 3
g=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 http://localhost:3000/ 2>/dev/null || true)
echo "guard restore probe: $g"
