#!/usr/bin/env python3
"""Build the scoped tsconfig for the v2.326 stash round-trip."""
import json, re, subprocess

files = [f for f in subprocess.run(
    ['git', 'diff', '--name-only'], capture_output=True, text=True
).stdout.split() if f.startswith('src/app/api/') and f.endswith('route.ts')]
files = ['/home/z/ems/' + f for f in files]

raw = open('tsconfig.json').read()
raw = re.sub(r'//.*', '', raw)
base = json.loads(raw)
base['include'] = files
# the scoped config lives in /tmp — pin the alias resolution to the repo
co = base['compilerOptions']
co['baseUrl'] = '/home/z/ems'
co['paths'] = {'@/*': ['src/*'], '*': ['*']}
base['compilerOptions'] = co
json.dump(base, open('/tmp/tsconfig-v2326.json', 'w'), indent=1)
print('include set:', len(files), '(baseUrl+paths pinned)')
