#!/usr/bin/env python3
"""v2.327.0 swallow-census conversion pass.

Two mechanical conversions, driven by the Task 48 classification:

  HARD DOOR (20 files) — the SILENT-PROCEED class: a malformed body became
  `{}` and ran anyway. Every `.catch(() => ({}))` / `.catch(() => null)`
  chained read in these files becomes the readJsonBody door.

  OPTIONAL DOOR (4 files) — the OPTIONAL-BODY class: an empty body is a
  legitimate call. Every chained read becomes readOptionalJsonBody.

KEEP (16 sites, untouched): the HONEST-SWALLOW class — the catch feeds an
explicit validation that already answers 400 (messages/kra/stock-takes/
vouchers-send/etims/bulk-seed null-checks, chat zod safeParse, refund
validateInput, DARAJA webhooks ×2).

Both markers ride every converted file so the class sweep can pin them.
Idempotent: a file with no remaining chained read is skipped.
NEVER touches prisma/schema.prisma.
"""
import re
from pathlib import Path

API = Path("src/app/api")

HARD = [
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
]
OPTIONAL = [
    "src/app/api/reminders/debt/process/route.ts",
    "src/app/api/reminders/debt/schedule/route.ts",
    "src/app/api/admin/repair-journal-headers/route.ts",
    "src/app/api/chat/channels/[channelId]/read/route.ts",
]

MARKER = "// THE SWALLOW DOOR: an unreadable body is a client mistake (v2.327.0):"
IMPORT = "import { readJsonBody, bodyDoorRejected } from '@/lib/request-body';"
IMPORT_OPT = "import { readOptionalJsonBody, bodyDoorRejected } from '@/lib/request-body';"

CHAIN = re.compile(r"(?P<lead>\s*)(?:(?:const|let)\s+)(?P<var>\w+)\s*(?::\s*(?P<ann>[^=]+?))?\s*=\s*(?:\(\s*)?await request\.json\(\)\s*\.catch\((?P<fb>\(\) => \(\{\}\)|\(\) => null)\)\s*(?:\)\s*)?(?:as\s+(?P<cast>(?:Record<string, unknown>)|(?:\{[^;]*?\})|[\w<>\[\], :|]+?))?\s*;", re.S)


def convert(src: str, helper: str, marker: str) -> str:
    """Replace every chained read with the door pattern."""
    out = src
    for m in list(CHAIN.finditer(src)):
        lead, var, ann, cast = m.group("lead"), m.group("var"), m.group("ann"), m.group("cast")
        generic = f"<{ann.strip()}>" if ann else "<Record<string, unknown>>"
        cast_tail = f" as {cast}" if cast else ""
        block = (
            f"{lead}{marker}\n"
            f"{lead}const door = await {helper}{generic}(request);\n"
            f"{lead}if (!door.ok) {{\n"
            f"{lead}  return bodyDoorRejected();\n"
            f"{lead}}}\n"
            f"{lead}const {var} = door.body{cast_tail};"
        )
        out = out.replace(m.group(0), block, 1)
    return out


def add_import(src: str, import_line: str) -> str:
    if "from '@/lib/request-body'" in src:
        # extend the existing import instead of adding a second one
        return re.sub(
            r"import \{ ([^}]+) \} from '@/lib/request-body';",
            lambda m: "import { " + ", ".join(sorted(set(
                [s.strip() for s in m.group(1).split(',')] +
                ['readJsonBody', 'readOptionalJsonBody', 'bodyDoorRejected']
            ))) + " } from '@/lib/request-body';",
            src, count=1)
    imp = list(re.finditer(r"^import [^\n]*;$", src, re.M))
    pos = imp[-1].end() if imp else 0
    return src[:pos] + "\n" + import_line + src[pos:]


changed = []
for kind, files, helper, marker, import_line in [
    ("HARD", HARD, "readJsonBody", MARKER, IMPORT),
    ("OPTIONAL", OPTIONAL, "readOptionalJsonBody", "// THE OPTIONAL SWALLOW DOOR (v2.327.0): an EMPTY body is a legitimate call — {} passes; a PRESENT unreadable body is the client mistake:", IMPORT_OPT),
]:
    for rel in files:
        f = Path(rel)
        src = f.read_text()
        if "request.json().catch" not in src:
            print(f"  SKIP (no chained read): {rel}")
            continue
        out = convert(src, helper, marker)
        out = add_import(out, import_line)
        f.write_text(out)
        remaining = len(re.findall(r"request\.json\(\)\s*\.catch", out))
        changed.append((rel, kind, remaining))
        print(f"  {kind}: {rel} (remaining chained: {remaining})")

print(f"\nconverted: {len(changed)} files")
