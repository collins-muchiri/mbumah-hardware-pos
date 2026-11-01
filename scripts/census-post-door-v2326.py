#!/usr/bin/env python3
"""v2.326.0 census: every remaining `await request.json()` read site.

Classifies each read:
  doored  — the call is `readJsonBody(request)` (v2.325 door, skip)
  chained — `.catch(...)` swallow (outlier: politer 400 wanted)
  safe    — wrapped in a local try/catch
  bare    — CAN THROW → the 500 class → door candidate

Also captures the assignment shape (`const X =`, `const X = (... ) as T`,
`let X` or expression) so the mechanical pass knows what to rewrite.
"""
import re
from pathlib import Path

API = Path("src/app/api")

bare_sites = []
chained_sites = []
safe_count = 0
doored_count = 0

for f in sorted(API.rglob("route.ts")):
    lines = f.read_text().splitlines()
    src = "\n".join(lines)
    doored = "readJsonBody" in src
    for i, line in enumerate(lines):
        for m in re.finditer(r"await\s+request\.json\(\)", line):
            if "readJsonBody" in line:
                doored_count += 1
                continue
            # look back up to 12 lines for a try { opener without a closing }
            window = "\n".join(lines[max(0, i - 12):i + 1])
            before = line[:m.start()]
            after = line[m.end():]
            if re.search(r"\.catch\s*\(", after):
                chained_sites.append((str(f), i + 1, line.strip()))
                continue
            in_try = bool(re.search(r"\btry\s*\{(?:(?!\n\s*\}).)*$", window, re.S))
            if in_try:
                safe_count += 1
                continue
            # assignment shape
            am = re.match(r"\s*(?:const|let|var)?\s*(\w+)\s*=\s*", before)
            shape = "assign:" + (am.group(1) if am else "expr")
            cast = re.search(r"\)\s+as\s+([\w\[\]<>\s]+?)\s*;?\s*$", line)
            if cast:
                shape += "|cast:" + cast.group(1).strip()
            ann = re.search(r"=\s*(?:\(|await)[^;]*;\s*$", line)
            bare_sites.append((str(f), i + 1, shape, line.strip()))

print("=== BARE (door candidates) ===")
for f, ln, shape, line in bare_sites:
    print(f"{f}:{ln}\n    {shape}\n    {line[:150]}")
print(f"\nbare: {len(bare_sites)} | safe(try): {safe_count} | chained: {len(chained_sites)} | doored calls: {doored_count}")
print("\n=== CHAINED (.catch swallow) ===")
for f, ln, line in chained_sites:
    print(f"{f}:{ln}\n    {line[:150]}")
