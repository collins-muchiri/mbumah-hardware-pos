#!/usr/bin/env python3
"""v2.326.0 POST-wide body door sweep.

Census of bare `await request.json()` reads inside POST handlers across
src/app/api. Mirrors the Task 46 PUT/DELETE/PATCH sweep (sweep-body-door.py,
recycled) extended to POST:

  - a "door" call site is a bare read: `const body = await request.json()`,
    `const body = (await request.json()) as X`, `await request.json()` whose
    result is assigned or not — i.e. the read can THROW and the route has no
    local try/catch around it and no `.catch` chain;
  - try-wrapped reads (`try { body = await request.json() } catch { ... }`)
    are the SAFE pattern — counted separately;
  - `.catch(() => ({}))` chains swallow malformed bodies into `{}` — counted
    as OUTLIERS (politer 400 wanted);
  - routes whose POST handler never reads the body are ignored.

Output: one line per file, then the class census.
"""
import re
from pathlib import Path

API = Path("src/app/api")
METHODS = ("POST", "PUT", "PATCH", "DELETE")


def handlers_of(src: str) -> dict:
    """Map HTTP verb -> slice of source inside its exported handler."""
    out = {}
    for m in METHODS:
        # match `export async function POST(` or `const POST =` styles
        pat = re.compile(
            r"export\s+async\s+function\s+" + m + r"\s*\(|const\s+" + m +
            r"\s*=\s*async", re.M)
        hit = pat.search(src)
        if hit:
            out[m] = src[hit.start():]
    return out


def classify(handler_src: str) -> dict:
    reads = []
    # try-wrapped safe reads
    try_wrapped = len(re.findall(r"try\s*\{[^}]*await\s+request\.json\(\)", handler_src))
    # .catch chains
    catch_chained = len(re.findall(r"await\s+request\.json\(\)\s*\.catch", handler_src))
    # bare reads: any other occurrence
    total = len(re.findall(r"await\s+request\.json\(\)", handler_src))
    bare = total - try_wrapped - catch_chained
    return {"total": total, "bare": bare, "safe": try_wrapped, "catch": catch_chained}


rows = []
for f in sorted(API.rglob("route.ts")):
    src = f.read_text()
    hs = handlers_of(src)
    for verb, hsrc in hs.items():
        c = classify(hsrc)
        if c["total"]:
            rows.append((str(f), verb, c))

bare_rows = [r for r in rows if r[2]["bare"]]
print(f"{'file':64s} {'verb':7s} total bare safe catch")
for f, v, c in rows:
    mark = "  <-- DOOR" if c["bare"] else ""
    print(f"{f:64s} {v:7s} {c['total']:5d} {c['bare']:4d} {c['safe']:4d} {c['catch']:5d}{mark}")
print()
print(f"routes-with-reads: {len(rows)} | bare door sites: {sum(r[2]['bare'] for r in rows)} "
      f"in {len(bare_rows)} route/handler pairs | safe(try): {sum(r[2]['safe'] for r in rows)} "
      f"| catch-chained: {sum(r[2]['catch'] for r in rows)}")
