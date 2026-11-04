#!/usr/bin/env python3
"""ledger-diff-v2393.py — the empirical admission walk driver.
For each failing ledger suite, extract the walked word + its expected
list, walk src/ for the word, and print the files the ledger must admit.
THE OD LAW: bytes, not memory."""
import re, os, sys

SUITES = [
    ('src/tests/bank-mpesa-deep-link-v2388.test.ts', 'bank-mpesa'),
    ('src/tests/bank-type-deep-link-v2387.test.ts', 'bank-type'),
    ('src/tests/debt-channel-deep-link-v2390.test.ts', 'debt-channel'),
    ('src/tests/debt-status-deep-link-v2389.test.ts', 'debt-status'),
    ('src/tests/exp-status-deep-link-v2391.test.ts', 'exp-status'),
    ('src/tests/exp-type-deep-link-v2392.test.ts', 'exp-type'),
    ('src/tests/ly-type-deep-link-v2368.test.ts', 'ly-type'),
    ('src/tests/proxy-gate-layering-v2328.test.ts', 'po-status'),
    ('src/tests/tax-type-deep-link-v2382.test.ts', 'tax-type'),
    ('src/tests/transfer-status-deep-link-v2357.test.ts', 'transfer-status'),
    ('src/tests/txn-pay-deep-link-v2333.test.ts', 'txn-pay'),
]

SKIP_DIRS = {'node_modules', '.next'}

def walk_src(word):
    found = []
    for root, dirs, files in os.walk('src'):
        dirs[:] = [d for d in dirs if d not in SKIP_DIRS]
        for f in files:
            if not re.search(r'\.(ts|tsx|mjs|js)$', f):
                continue
            p = os.path.join(root, f)
            try:
                if word in open(p, encoding='utf8').read():
                    found.append(p)
            except Exception:
                pass
    return sorted(found)

def expected_list(suite_path):
    src = open(suite_path, encoding='utf8').read()
    # find the toEqual([...]) block after the walk assertion
    m = re.search(r"toEqual\(\[(.*?)\]\);", src, re.S)
    if not m:
        return None
    return re.findall(r"'([^']+)'", m.group(1))

for suite, word in SUITES:
    exp = expected_list(suite)
    act = walk_src(word)
    if exp is None:
        print(f'== {suite} ({word}): NO toEqual block found')
        continue
    add = [f for f in act if f not in exp]
    rem = [f for f in exp if f not in act]
    print(f'== {suite} ({word}): +{len(add)} / -{len(rem)}')
    for f in add:
        print(f'   ADD {f}')
    for f in rem:
        print(f'   REM {f}')
