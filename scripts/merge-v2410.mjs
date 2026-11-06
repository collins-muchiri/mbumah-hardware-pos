#!/usr/bin/env node
// merge-v2410.mjs — squash-merge PR #542 via GraphQL, re-checking state
// AFTER the merge call (never trust the exit alone — the copier law).
import { execSync } from 'node:child_process';

const origin = execSync('git -C /home/z/ems remote get-url origin', { encoding: 'utf8' }).trim();
const TOKEN = origin.match(/^https:\/\/([^:@]+):([^@]+)@github\.com\//)[2];
const OWNER = 'collins-muchiri';
const REPO = 'mbumah-hardware-pos';
const HEAD = '6d1f6a34';

const gh = async (query, variables) => {
  const res = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  });
  return res.json();
};

const Q = `query($num: Int!, $owner: String!, $name: String!) {
  repository(owner: $owner, name: $name) { pullRequest(number: $num) {
    id state merged mergeable mergeStateStatus headRefOid
  } } }`;
const pre = await gh(Q, { num: 542, owner: OWNER, name: REPO });
const pr = pre.data?.repository?.pullRequest;
if (!pr) { console.error('FAIL: PR not found', JSON.stringify(pre.errors || {}).slice(0, 300)); process.exit(1); }
console.log(`pre: state=${pr.state} merged=${pr.merged} mergeable=${pr.mergeable} head=${pr.headRefOid.slice(0, 8)}`);
if (pr.merged) { console.log('already merged'); process.exit(0); }
if (pr.headRefOid.slice(0, 8) !== HEAD) { console.error('FAIL: head moved'); process.exit(1); }

const COMMIT_HEADLINE = 'feat: the wire answers on mount — BUG 1 closed (the console and org desks\u2019 open-gated switcher queries never fetched: menu visibly open while zero requests left the browser — resource-timing empty, dev log silent, in-page fetch logger empty; a mid-boot open DID fetch and one run showed the whole switcher remount, trigger open \u2192 gone \u2192 closed) \u2014 both queries now answer on mount, the same reliable path every panel uses (the seed already asked the branch-default wire every page load), the open is pure display again; the footer gains the rate census strip (N admin-set \u00b7 N API \u00b7 N built-in beside a fresh/aging/stale age dot, both voices pure exports) and the dropdown wears its styling round (mono rate figures, the active row\u2019s emerald rail, the trigger\u2019s open echo) (v2.410.0)';

const M = `mutation($id: ID!, $headline: String!, $oid: GitObjectID!) {
  mergePullRequest(input: {
    pullRequestId: $id,
    mergeMethod: SQUASH,
    commitHeadline: $headline,
    expectedHeadOid: $oid
  }) { pullRequest { number merged mergedAt } }
}`;
const res = await gh(M, { id: pr.id, headline: COMMIT_HEADLINE, oid: pr.headRefOid });
if (res.errors) { console.error('GraphQL errors:', JSON.stringify(res.errors).slice(0, 400)); process.exit(1); }
const merged = res.data?.mergePullRequest?.pullRequest;
console.log(`merge call: merged=${merged?.merged} at=${merged?.mergedAt}`);

// 2. re-check AFTER the call
const post = await gh(Q, { num: 542, owner: OWNER, name: REPO });
const after = post.data?.repository?.pullRequest;
console.log(`post: state=${after?.state} merged=${after?.merged}`);
if (!after?.merged) { console.error('FAIL: merge did not land'); process.exit(1); }
console.log('MERGED');
