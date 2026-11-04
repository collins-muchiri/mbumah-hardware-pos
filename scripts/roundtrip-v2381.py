#!/usr/bin/env python3
"""Build + run the scoped tsconfig pair for the v2.381.0 round-trip (46th generation).

The worktree-baseline law: the HEAD worktree lives INSIDE the repo
(.roundtrip-baseline) so node_modules resolves. Each config pins baseUrl +
paths to ITS OWN root (the /tmp tsconfig alias law). The include set is the
round's touched src files (the dirty tracked set PLUS the round's new
untracked suite) plus the next-env.d.ts carry.
"""
import json, os, subprocess

REPO = '/home/z/ems'
BASE = os.path.join(REPO, '.roundtrip-baseline')

# the round's touched src faces: the dirty tracked set + the new suite
rel = [f for f in subprocess.run(
    ['git', 'diff', '--name-only'], capture_output=True, text=True
).stdout.split() if f.startswith('src/') and f.endswith(('.ts', '.tsx'))]
rel.append('src/tests/et-status-deep-link-v2381.test.ts')
files = [REPO + '/' + f for f in rel]
files.append(REPO + '/next-env.d.ts')

raw = open(os.path.join(REPO, 'tsconfig.json')).read()
raw = subprocess.run(['node', '-e', '''
const fs = require("fs");
let s = fs.readFileSync(process.argv[1], "utf8");
s = s.replace(/\\/\\/[^\\n]*/g, "");
fs.writeFileSync("/tmp/ts-strip.json", s);
''', os.path.join(REPO, 'tsconfig.json')], capture_output=True, text=True)
tpl = json.loads(open('/tmp/ts-strip.json').read())

# ROUND config: current tree
round_cfg = json.loads(json.dumps(tpl))
round_cfg['include'] = files
co = round_cfg['compilerOptions']
co['baseUrl'] = REPO
co['paths'] = {'@/*': ['src/*'], '*': ['*']}
json.dump(round_cfg, open('/tmp/tsconfig-v2381-round.json', 'w'), indent=1)

# BASE config: the HEAD worktree, same file list re-rooted
base_files = [f.replace(REPO, BASE) for f in files]
base_cfg = json.loads(json.dumps(tpl))
base_cfg['include'] = base_files
co = base_cfg['compilerOptions']
co['baseUrl'] = BASE
co['paths'] = {'@/*': ['src/*'], '*': ['*']}
json.dump(base_cfg, open('/tmp/tsconfig-v2381-base.json', 'w'), indent=1)

print('include set (%d faces):' % len(files))
for f in rel:
    print('  ', f)

r = subprocess.run(['npx', 'tsc', '--noEmit', '-p', '/tmp/tsconfig-v2381-round.json'],
                   cwd=REPO, capture_output=True, text=True)
b = subprocess.run(['npx', 'tsc', '--noEmit', '-p', '/tmp/tsconfig-v2381-base.json'],
                   cwd=BASE, capture_output=True, text=True)
print('ROUND tsc exit:', r.returncode)
if r.returncode != 0:
    print(r.stdout[-3000:]); print(r.stderr[-1000:])
print('BASE  tsc exit:', b.returncode)
if b.returncode != 0:
    print(b.stdout[-3000:]); print(b.stderr[-1000:])

# THE CAST CENSUS (the zero law): ` as ` casts per touched face, round vs base
print('— the cast census —')
for relf in rel:
    rp = os.path.join(REPO, relf)
    bp = os.path.join(BASE, relf)
    rc = open(rp).read().count(' as ') if os.path.exists(rp) else 0
    bc = open(bp).read().count(' as ') if os.path.exists(bp) else 0
    mark = 'OK' if rc == bc else 'DRIFT'
    print(f'  {mark} {relf}: {bc} -> {rc}')
