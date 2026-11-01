#!/usr/bin/env python3
"""v2.326.0 mechanical POST-wide body door pass.

Rewrites every bare `await request.json()` read found by
census-post-door-v2326.py into the readJsonBody door pattern:

    const body = await request.json();
        ↓
    // THE BODY DOOR: an unreadable body is a client mistake (v2.326.0).
    const door = await readJsonBody(request);
    if (!door.ok) {
      return bodyDoorRejected();
    }
    const body = door.body;

Forms handled:
  A) `const X = await request.json();`                    → generic Record<string, unknown>
  B) `const X = (await request.json()) as T;`             → `const X = door.body as T;`
  C) `const X: T = await request.json();`                 → generic T
  D) multi-line `const X = (await request.json()) as {` … → captured till balanced `;`

Also inserts the import after the last import when missing. Idempotent:
a file whose every census site already reads through the door is skipped.
NEVER touches prisma/schema.prisma.
"""
import re
from pathlib import Path

API = Path("src/app/api")
MARKER = "// THE BODY DOOR: an unreadable body is a client mistake (v2.326.0):"
IMPORT_LINE = "import { readJsonBody, bodyDoorRejected } from '@/lib/request-body';"

BARE = re.compile(r"(?<![\w.])(?:const|let|var)\s+(\w+)\s*(?::\s*([\w\[\]{}<>\s,|]+?)\s*)?=\s*(?:\(\s*)?await request\.json\(\)")


def statement_span(lines, i):
    """Return (start, end) line indices of the statement starting at line i
    (inclusive), extending until parens/braces/brackets balance and the
    line ends with `;`."""
    depth = 0
    j = i
    while j < len(lines):
        line = lines[j]
        depth += line.count("(") + line.count("{") + line.count("[")
        depth -= line.count(")") + line.count("}") + line.count("]")
        if depth <= 0 and line.rstrip().endswith(";"):
            return i, j
        j += 1
    return i, i  # single line fallback


def parse_form(stmt: str):
    """Classify the statement and return (form, varname, typeexpr, castexpr)."""
    m = re.match(
        r"\s*(?:const|let|var)\s+(\w+)\s*(?::\s*([\w\[\]{}<>\s,|]+?)\s*)?=\s*", stmt)
    if not m:
        return None
    var, ann = m.group(1), m.group(2)
    if ann:
        return ("annotated", var, ann.strip(), None)
    cm = re.search(r"await request\.json\(\)\s*\)\s*as\s+([\w\s\[\]<>{},|:]+?)\s*;\s*$", stmt, re.S)
    if cm:
        return ("cast", var, None, cm.group(1).strip())
    if re.search(r"await request\.json\(\)\s*;\s*$", stmt):
        return ("plain", var, None, None)
    return None


def indent_of(line):
    return re.match(r"\s*", line).group(0)


changed = []
skipped = []
for f in sorted(API.rglob("route.ts")):
    src = f.read_text()
    lines = src.splitlines()
    if "readJsonBody" in src:
        # already doored — a v2.325 file; still check for OTHER bare reads
        pass
    hits = []
    for i, line in enumerate(lines):
        if "await request.json()" in line and "readJsonBody" not in line and ".catch" not in line:
            if BARE.search(line) or re.search(r"=\s*\(\s*await request\.json\(\)\s*\)\s*as\s", line) or re.search(r":\s*[\w<>\s]+\s*=\s*await request\.json\(\)", line):
                hits.append(i)
    if not hits:
        continue
    # process from bottom up so line numbers stay valid
    out = lines[:]
    did = 0
    for i in reversed(hits):
        s, e = statement_span(out, i)
        stmt = "\n".join(out[s:e + 1])
        form = parse_form(stmt)
        if not form:
            skipped.append((str(f), i + 1, stmt[:80]))
            continue
        kind, var, ann, cast = form
        ind = indent_of(out[s])
        generic = f"<{ann}>" if kind == "annotated" else "<Record<string, unknown>>"
        cast_tail = f" as {cast}" if kind == "cast" else ""
        block = (
            f"{ind}{MARKER}\n"
            f"{ind}const door = await readJsonBody{generic}(request);\n"
            f"{ind}if (!door.ok) {{\n"
            f"{ind}  return bodyDoorRejected();\n"
            f"{ind}}}\n"
            f"{ind}const {var} = door.body{cast_tail};"
        )
        out[s:e + 1] = block.splitlines()
        did += 1
    if did:
        text = "\n".join(out) + ("\n" if src.endswith("\n") else "")
        if "from '@/lib/request-body'" not in text:
            # insert after the last top-of-file import
            imp = list(re.finditer(r"^import [^\n]*;$", text, re.M))
            pos = imp[-1].end() if imp else 0
            text = text[:pos] + "\n" + IMPORT_LINE + text[pos:]
        f.write_text(text)
        changed.append((str(f), did))

print(f"files changed: {len(changed)}, sites doored: {sum(d for _, d in changed)}")
for f, d in changed:
    print(f"  {f} ({d})")
if skipped:
    print(f"\nUNPARSED (left as-is) — {len(skipped)}:")
    for f, ln, s in skipped:
        print(f"  {f}:{ln}  {s}")
