#!/usr/bin/env python3
"""Build the scoped tsconfig pair for the v2.329.0 round-trip.

The include set is the round's touched files PLUS every direct dependent
(tab-url's importers, the inventory tab's shell parents, the whats-new
feed's consumers). The baseline half reads a HEAD worktree INSIDE the
repo (.roundtrip-baseline — the worktree-baseline law: node_modules must
resolve; a /tmp worktree phantom-errors 18k). Each config pins baseUrl +
paths to ITS OWN root (the /tmp tsconfig alias law).
"""
import json, re, os

REPO = '/home/z/ems'
BASE = os.path.join(REPO, '.roundtrip-baseline')

files = [
    'src/lib/tab-url.ts',
    'src/lib/whats-new.ts',
    'src/app/(shell)/tabs/inventory-tab.tsx',
    'src/app/(shell)/tabs/purchase-orders-tab.tsx',
    'src/app/(shell)/tabs/loyalty-tab.tsx',
    'src/app/(shell)/tabs/transactions-tab.tsx',
    'src/components/app/main-app.tsx',
    'src/components/workspace/org-console.tsx',
    'src/components/whats-new-dialog.tsx',
    'src/app/(shell)/console/page.tsx',
    'src/app/(shell)/page.tsx',
    'src/app/(selfservice)/employees/me/layout.tsx',
    'src/tests/inv-stock-deep-link-v2329.test.ts',
    'src/tests/proxy-gate-layering-v2328.test.ts',
    'src/tests/po-status-deep-link-v2328.test.ts',
    'src/tests/console-changelog.test.ts',
    'src/tests/deep-link-capture-v2313.test.ts',
    'src/tests/ledger-pager-v2320.test.ts',
    'src/tests/ledger-page-size-v2321.test.ts',
]

raw = open(os.path.join(REPO, 'tsconfig.json')).read()
raw = re.sub(r'//.*', '', raw)
base = json.loads(raw)

for root, out in ((REPO, '/tmp/tsconfig-v2329-doored.json'), (BASE, '/tmp/tsconfig-v2329-baseline.json')):
    cfg = json.loads(json.dumps(base))
    cfg['include'] = [os.path.join(root, f) for f in files]
    co = cfg['compilerOptions']
    co['baseUrl'] = root
    co['paths'] = {'@/*': [os.path.join(root, 'src', '*')], '*': ['*']}
    json.dump(cfg, open(out, 'w'), indent=1)
    print(out, '— include set:', len(files), '(baseUrl+paths pinned to ' + root + ')')
