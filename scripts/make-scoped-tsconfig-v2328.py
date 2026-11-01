#!/usr/bin/env python3
"""Build the scoped tsconfig pair for the v2.328.0 round-trip.

The include set is the round's touched files PLUS every direct dependent
(tab-url's importers, the proxy's test, the shell page). The baseline half
reads a HEAD worktree at /tmp/ems-baseline (NEVER a stash — the sqlite
flip must not move). Each config pins baseUrl + paths to ITS OWN root
(the /tmp tsconfig alias law).
"""
import json, re, subprocess, os

REPO = '/home/z/ems'
BASE = '/tmp/ems-baseline'

files = [
    'src/lib/tab-url.ts',
    'src/app/(shell)/tabs/purchase-orders-tab.tsx',
    'src/proxy.ts',
    'src/tests/po-status-deep-link-v2328.test.ts',
    'src/tests/proxy-gate-layering-v2328.test.ts',
    'src/app/(shell)/page.tsx',
    'src/app/(shell)/tabs/loyalty-tab.tsx',
    'src/app/api/loyalty/transactions/route.ts',
    'src/app/api/purchase-orders/route.ts',
    'src/components/app/main-app.tsx',
    'src/components/workspace/org-console.tsx',
    'src/lib/tab-preload.ts',
    'src/tests/po-deep-link-v2324.test.ts',
    'src/tests/ledger-pager-v2320.test.ts',
    'src/tests/ledger-page-size-v2321.test.ts',
    'src/tests/expiry-ledger-link-v2316.test.ts',
    'src/tests/expiry-window-dismiss-v2318.test.ts',
    'src/tests/expiry-day-window-v2317.test.ts',
    'src/tests/deep-link-capture-v2313.test.ts',
    'src/tests/deep-link-run-doors-v2111.test.ts',
    'src/tests/po-census-truth-v2323.test.ts',
    'src/tests/receipt-trail-v2311.test.ts',
]

raw = open(os.path.join(REPO, 'tsconfig.json')).read()
raw = re.sub(r'//.*', '', raw)
base = json.loads(raw)

for root, out in ((REPO, '/tmp/tsconfig-v2328-doored.json'), (BASE, '/tmp/tsconfig-v2328-baseline.json')):
    cfg = json.loads(json.dumps(base))
    cfg['include'] = [os.path.join(root, f) for f in files]
    co = cfg['compilerOptions']
    co['baseUrl'] = root
    co['paths'] = {'@/*': [os.path.join(root, 'src', '*')], '*': ['*']}
    json.dump(cfg, open(out, 'w'), indent=1)
    print(out, '— include set:', len(files), '(baseUrl+paths pinned to ' + root + ')')
