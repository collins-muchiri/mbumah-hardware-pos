#!/usr/bin/env python3
"""Collapse the blank-line artifacts inside the v2.327 door blocks.

The conversion regex's \s* lead swallowed surrounding newlines, leaving
blank lines between the marker / door / guard / body lines. This pass
removes EMPTY lines strictly between the marker comment line and the
`const <var> = door.body` line in the 24 converted files.
"""
import re
from pathlib import Path

FILES = [
    "src/app/api/hr/assets/[id]/route.ts",
    "src/app/api/hr/assets/route.ts",
    "src/app/api/hr/goals/[id]/route.ts",
    "src/app/api/hr/goals/route.ts",
    "src/app/api/hr/discipline/[id]/route.ts",
    "src/app/api/hr/discipline/route.ts",
    "src/app/api/hr/performance/cycles/[id]/route.ts",
    "src/app/api/hr/performance/cycles/route.ts",
    "src/app/api/hr/performance/reviews/[id]/route.ts",
    "src/app/api/hr/performance/reviews/route.ts",
    "src/app/api/hr/privacy/consent/grant/route.ts",
    "src/app/api/hr/privacy/consent/withdraw/route.ts",
    "src/app/api/hr/privacy/erasure-requests/route.ts",
    "src/app/api/hr/privacy/erasure-requests/[id]/execute/route.ts",
    "src/app/api/hr/privacy/erasure-requests/[id]/reject/route.ts",
    "src/app/api/hr/privacy/legal-hold/route.ts",
    "src/app/api/hr/reports/schedules/[id]/route.ts",
    "src/app/api/hr/reports/schedules/route.ts",
    "src/app/api/self-service/me/leave/route.ts",
    "src/app/api/data-exports/route.ts",
    "src/app/api/reminders/debt/process/route.ts",
    "src/app/api/reminders/debt/schedule/route.ts",
    "src/app/api/admin/repair-journal-headers/route.ts",
    "src/app/api/chat/channels/[channelId]/read/route.ts",
]

for rel in FILES:
    f = Path(rel)
    lines = f.read_text().splitlines(keepends=True)
    out = []
    in_block = False
    removed = 0
    for line in lines:
        stripped = line.strip()
        if 'SWALLOW DOOR' in line and line.strip().startswith('//'):
            in_block = True
            out.append(line)
            continue
        if in_block:
            if stripped == '':
                removed += 1
                continue  # drop the blank line inside the block
            if re.match(r'const \w+ = door\.body;', stripped):
                in_block = False
            out.append(line)
        else:
            out.append(line)
    f.write_text(''.join(out))
    print(f"  {rel}: removed {removed} blank lines")
