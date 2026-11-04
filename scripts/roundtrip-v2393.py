#!/usr/bin/env python3
"""Build + run the scoped tsconfig pair for the v2.393.0 round-trip (57th generation).

The worktree-baseline law: the HEAD worktree lives INSIDE the repo
(.roundtrip-baseline, refreshed to the pre-round HEAD d0f1c30e) so
node_modules resolves. Each config pins baseUrl + paths to ITS OWN root
(the /tmp tsconfig alias law). The include set is the round's touched src
faces (the dirty tracked set PLUS the round's new untracked suite) plus
the next-env.d.ts carry.

THE PARITY CENSUS: the round adds a deep-link word (a vocabulary const in
the ONE home, a cast-free seed, a landing chip, a sub-tab seed) and
re-anchors test pins — all type-level neutrals, so BASE and ROUND must
answer the SAME error set (the zero holds in its 57th generation:
base-only = 0, round-only = 0, common byte-identical).
"""
import json, os, re, subprocess

REPO = '/home/z/ems'
BASE = os.path.join(REPO, '.roundtrip-baseline')

# the round's touched src faces: the dirty tracked set + the new suite
rel = [f for f in subprocess.run(
    ['git', 'diff', '--name-only'], capture_output=True, text=True
).stdout.split() if f.startswith('src/') and f.endswith(('.ts', '.tsx'))]
rel.append('src/tests/msg-template-deep-link-v2393.test.ts')
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
# the 54th-generation refinement (carried), carried: a /tmp config resolves `types`
# relative to ITS OWN location — pin both configs to the repo's @types so
# the two sides answer SYMMETRIC resolution (the census classifies errors,
# not resolution artifacts).
co['typeRoots'] = [REPO + '/node_modules/@types']
co['types'] = ['node']
json.dump(round_cfg, open('/tmp/tsconfig-v2393-round.json', 'w'), indent=1)

# BASE config: the HEAD worktree, same file list re-rooted
base_files = [f.replace(REPO, BASE) for f in files]
base_cfg = json.loads(json.dumps(tpl))
base_cfg['include'] = base_files
co = base_cfg['compilerOptions']
co['baseUrl'] = BASE
co['paths'] = {'@/*': ['src/*'], '*': ['*']}
co['typeRoots'] = [REPO + '/node_modules/@types']
co['types'] = ['node']
json.dump(base_cfg, open('/tmp/tsconfig-v2393-base.json', 'w'), indent=1)

print('include set (%d faces):' % len(files))
for f in rel:
    print('  ', f)

r = subprocess.run(['npx', 'tsc', '--noEmit', '-p', '/tmp/tsconfig-v2393-round.json'],
                   cwd=REPO, capture_output=True, text=True)
b = subprocess.run(['npx', 'tsc', '--noEmit', '-p', '/tmp/tsconfig-v2393-base.json'],
                   cwd=BASE, capture_output=True, text=True)
print('ROUND tsc exit:', r.returncode)
if r.returncode != 0:
    print(r.stdout[-3000:]); print(r.stderr[-1000:])
print('BASE  tsc exit:', b.returncode)
if b.returncode != 0:
    print(b.stdout[-3000:]); print(b.stderr[-1000:])

def pairs(out):
    # the path-root normalization (the 48th-gen refinement, carried): the
    # same logical error speaks different ABSOLUTE roots per side — strip
    # both roots before pairing, so the classification is logical, not
    # textual.
    out = out.replace(REPO + '/', '').replace(BASE + '/', '')
    out = out.replace('.roundtrip-baseline/', '')
    got = set()
    for m in re.finditer(r'^(.+?)\((\d+),(\d+)\): (error TS\d+)(?:: (.*))?$', out, re.M):
        got.add((m.group(1), m.group(4), (m.group(5) or '')[:80]))
    return got

rp = pairs(r.stdout)
bp = pairs(b.stdout)
common = rp & bp
base_only = bp - rp
round_only = rp - bp
print('— the census classification —')
print('common (byte-identical) pairs:', len(common))
print('base-only pairs (the round’s own fixes; parity demands 0):', len(base_only))
for p in sorted(base_only):
    print('   FIXED', p[0].replace(REPO, ''), p[1], p[2][:70])
print('round-only pairs (NEW errors — the zero demands this be 0):', len(round_only))
for p in sorted(round_only):
    print('   NEW  ', p[0].replace(REPO, ''), p[1], p[2][:70])

# THE CAST CENSUS (the zero law): ` as ` casts per touched face, round vs base
print('— the cast census —')
for relf in rel:
    rp_ = os.path.join(REPO, relf)
    bp_ = os.path.join(BASE, relf)
    rc = open(rp_).read().count(' as ') if os.path.exists(rp_) else 0
    bc = open(bp_).read().count(' as ') if os.path.exists(bp_) else 0
    mark = 'OK' if rc == bc else 'DRIFT'
    print(f'  {mark} {relf}: {bc} -> {rc}')
