#!/usr/bin/env python3
"""admit-v2393.py — the ten ledgers admit the thirty-second word's suite,
and ly-type's ledger admits the messaging desk (the stage-amendment prose).
Every insertion is anchored to a UNIQUE sorted neighbor line; the script
refuses when an anchor is not found exactly once (the torn-tree guard).
THE OD LAW: bytes, not memory."""
import sys

SUITE_LINE = "'src/tests/msg-template-deep-link-v2393.test.ts',"
ADMIT_COMMENT = (
    "      // the thirty-second word's own ledger — admitted (its own ledger\n"
    "      // LISTS this file's path — the third-order ripple: a ledger line\n"
    "      // carries every word its paths speak)\n"
)

# (file, indent, anchor-line-after-which-sorts-first-entry, comment-mode)
JOBS = [
    ('src/tests/bank-mpesa-deep-link-v2388.test.ts', '      ', "'src/tests/proxy-gate-layering-v2328.test.ts',", 'suite'),
    ('src/tests/bank-type-deep-link-v2387.test.ts', '      ', "'src/tests/proxy-gate-layering-v2328.test.ts',", 'suite'),
    ('src/tests/debt-channel-deep-link-v2390.test.ts', '      ', "'src/tests/proxy-gate-layering-v2328.test.ts',", 'suite'),
    ('src/tests/debt-status-deep-link-v2389.test.ts', '      ', "'src/tests/proxy-gate-layering-v2328.test.ts',", 'suite'),
    ('src/tests/exp-status-deep-link-v2391.test.ts', '      ', "'src/tests/proxy-gate-layering-v2328.test.ts',", 'suite'),
    ('src/tests/exp-type-deep-link-v2392.test.ts', '      ', "'src/tests/proxy-gate-layering-v2328.test.ts',", 'suite'),
    ('src/tests/tax-type-deep-link-v2382.test.ts', '      ', "'src/tests/pr-status-deep-link-v2362.test.ts',", 'suite'),
    ('src/tests/transfer-status-deep-link-v2357.test.ts', '      ', "'src/tests/pr-status-deep-link-v2362.test.ts',", 'suite'),
    ('src/tests/txn-pay-deep-link-v2333.test.ts', '      ', "'src/tests/pr-status-deep-link-v2362.test.ts',", 'suite'),
    ('src/tests/proxy-gate-layering-v2328.test.ts', '        ', "'src/tests/po-status-deep-link-v2328.test.ts',", 'suite'),
    ('src/tests/ly-type-deep-link-v2368.test.ts', '      ', "'src/components/workspace/org-console.tsx',", 'desk'),
]

for path, indent, anchor, mode in JOBS:
    src = open(path, encoding='utf8').read()
    needle = indent + anchor
    n = src.count('\n' + needle) + (1 if src.startswith(needle) else 0)
    if n != 1:
        print(f'x REFUSE {path}: anchor {anchor!r} appears {n} times (want 1)')
        sys.exit(1)
    if mode == 'suite':
        block = ADMIT_COMMENT + indent + SUITE_LINE + '\n'
    else:
        block = (
            "      // the messaging desk speaks this word in its stage-amendment\n"
            "      // prose (the ly-type law's second-address design) — an honest\n"
            "      // speaker (an admission line carries the word it admits)\n"
            "      'src/app/(shell)/tabs/messaging-tab.tsx',\n"
        )
    src = src.replace('\n' + needle, '\n' + block + needle, 1)
    open(path, 'w', encoding='utf8').write(src)
    print(f'  ok  {path}: admitted ({mode})')
print('ALL ADMISSIONS LANDED')
