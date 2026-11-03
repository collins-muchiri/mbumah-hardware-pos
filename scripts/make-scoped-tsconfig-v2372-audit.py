#!/usr/bin/env python3
"""Build the scoped tsconfig pair for the v2.372.0 audit round-trip (37th generation).

The worktree-baseline law: the HEAD worktree lives INSIDE the repo
(.roundtrip-baseline) so node_modules resolves. Each config pins baseUrl +
paths to ITS OWN root (the /tmp tsconfig alias law). The include set is the
round's touched src files plus the next-env.d.ts carry.
"""
import json, re, os, subprocess

REPO = '/home/z/ems'
BASE = os.path.join(REPO, '.roundtrip-baseline')

rel = [f for f in subprocess.run(
    ['git', 'diff', '--name-only'], capture_output=True, text=True
).stdout.split() if f.startswith('src/') and f.endswith(('.ts', '.tsx'))]
files = [REPO + '/' + f for f in rel]
files.append(REPO + '/next-env.d.ts')

raw = open(os.path.join(REPO, 'tsconfig.json')).read()
raw = re.sub(r'//.*', '', raw)
tpl = json.loads(raw)

# ROUND config: current tree
round_cfg = json.loads(json.dumps(tpl))
round_cfg['include'] = files
co = round_cfg['compilerOptions']
co['baseUrl'] = REPO
co['paths'] = {'@/*': ['src/*'], '*': ['*']}
json.dump(round_cfg, open('/tmp/tsconfig-v2372-round.json', 'w'), indent=1)

# BASE config: the HEAD worktree, same file list re-rooted
base_files = [f.replace(REPO, BASE) for f in files]
base_cfg = json.loads(json.dumps(tpl))
base_cfg['include'] = base_files
co = base_cfg['compilerOptions']
co['baseUrl'] = BASE
co['paths'] = {'@/*': ['src/*'], '*': ['*']}
json.dump(base_cfg, open('/tmp/tsconfig-v2372-base.json', 'w'), indent=1)

print('round include:', len(files), '| base include:', len(base_files))
