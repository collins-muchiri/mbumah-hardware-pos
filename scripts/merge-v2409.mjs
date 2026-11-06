#!/usr/bin/env node
// merge-v2409.mjs — squash-merge PR #541 via GraphQL, re-checking state
// AFTER the merge call (never trust the exit alone — the copier law).
import { execSync } from 'node:child_process';

const origin = execSync('git -C /home/z/ems remote get-url origin', { encoding: 'utf8' }).trim();
const TOKEN = origin.match(/^https:\/\/([^:@]+):([^@]+)@github\.com\//)[2];
const OWNER = 'collins-muchiri';
const REPO = 'mbumah-hardware-pos';
const HEAD = 'e598bd40';

const gh = async (query, variables) => {
  const res = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  });
  return res.json();
};

// 1. pre-check the PR's current state
const Q = `query($num: Int!, $owner: String!, $name: String!) {
  repository(owner: $owner, name: $name) { pullRequest(number: $num) {
    id state merged mergeable mergeStateStatus headRefOid
  } } }`;
const pre = await gh(Q, { num: 541, owner: OWNER, name: REPO });
const pr = pre.data?.repository?.pullRequest;
if (!pr) { console.error('FAIL: PR not found', JSON.stringify(pre.errors || {}).slice(0, 300)); process.exit(1); }
console.log(`pre: state=${pr.state} merged=${pr.merged} mergeable=${pr.mergeable} head=${pr.headRefOid.slice(0, 8)}`);
if (pr.merged) { console.log('already merged'); process.exit(0); }
if (pr.headRefOid.slice(0, 8) !== HEAD.slice(0, 8)) { console.error('FAIL: head moved'); process.exit(1); }

// 2. squash merge
const M = `mutation($id: ID!, $head: GitObjectID!) {
  mergePullRequest(input: { pullRequestId: $id, mergeMethod: SQUASH, expectedHeadOid: $head }) {
    pullRequest { number merged state mergeCommit { oid } }
  } }`;
const out = await gh(M, { id: pr.id, head: pr.headRefOid });
if (out.errors) {
  console.error('merge errors:', JSON.stringify(out.errors).slice(0, 400));
  process.exit(1);
}
const mp = out.data?.mergePullRequest?.pullRequest;
console.log(`merge call: merged=${mp?.merged} commit=${mp?.mergeCommit?.oid?.slice(0, 8)}`);

// 3. POST-check — re-read the state, never trust the call's echo alone
const post = await gh(Q, { num: 541, owner: OWNER, name: REPO });
const p2 = post.data?.repository?.pullRequest;
console.log(`post: state=${p2?.state} merged=${p2?.merged} commit=${p2?.mergeCommit ? p2.mergeCommit.oid.slice(0, 8) : '(via merge call)'}`);
console.log(p2?.merged ? 'MERGED ✓' : 'NOT MERGED ✗');
process.exit(p2?.merged ? 0 : 1);
