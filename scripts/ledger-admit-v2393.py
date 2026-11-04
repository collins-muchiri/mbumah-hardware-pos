#!/usr/bin/env python3
"""ledger-admit-v2393.py — run each failing ledger suite, parse vitest's
expected/received diff, and report exactly which files each ledger must
admit (received minus expected, order-preserving)."""
import re, subprocess, sys

SUITES = [
    ('src/tests/bank-mpesa-deep-link-v2388.test.ts', 'bank-mpesa'),
    ('src/tests/bank-type-deep-link-v2387.test.ts', 'bank-type'),
    ('src/tests/debt-channel-deep-link-v2390.test.ts', 'debt-channel'),
    ('src/tests/debt-status-deep-link-v2389.test.ts', 'debt-status'),
    ('src/tests/exp-status-deep-link-v2391.test.ts', 'exp-status'),
    ('src/tests/exp-type-deep-link-v2392.test.ts', 'exp-type'),
    ('src/tests/ly-type-deep-link-v2368.test.ts', 'ly-type'),
    ('src/tests/tax-type-deep-link-v2382.test.ts', 'tax-type'),
    ('src/tests/transfer-status-deep-link-v2357.test.ts', 'transfer-status'),
    ('src/tests/txn-pay-deep-link-v2333.test.ts', 'txn-pay'),
]

def parse_blocks(out):
    """Return [(expected_lines, received_lines)] per failed assertion."""
    blocks = []
    # split per failure
    for chunk in out.split('AssertionError:')[1:]:
        exp = re.findall(r'^\s*-\s+"([^"]+)"', chunk, re.M)
        rec = re.findall(r'^\s*\+\s+"([^"]+)"', chunk, re.M)
        if exp or rec:
            blocks.append((exp, rec))
    return blocks

for suite, word in SUITES:
    r = subprocess.run(
        ['npx', 'vitest', 'run', suite],
        capture_output=True, text=True, timeout=300,
        cwd='/home/z/ems',
    )
    out = r.stdout + r.stderr
    blocks = parse_blocks(out)
    if not blocks:
        print(f'== {suite} ({word}): ledger walk PASSES')
        continue
    for exp, rec in blocks:
        expset = set(exp)
        adds = [x for x in rec if x not in expset]
        removes = [x for x in exp if x not in set(rec)]
        print(f'== {suite} ({word}):')
        for a in adds:
            print(f'   ADD {a}')
        for rm in removes:
            print(f'   REM {rm}')
