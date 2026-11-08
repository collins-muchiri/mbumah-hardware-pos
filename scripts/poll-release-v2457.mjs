#!/usr/bin/env node
import { execSync } from 'node:child_process';
// poll-release-v2457.mjs — watch the release for v2.457.0 (release.yml
// auto-tags on the squash). Polls every 30s up to 20 times.
const origin = execSync('git -C /home/z/ems remote get-url origin', { encoding: 'utf8' }).trim();
const TOKEN = origin.match(/^https:\/\/[^:@]+:([^@]+)@github\.com\//)[1];
const H = { Authorization: `Bearer ${TOKEN}`, Accept: 'application/vnd.github+json' };
const REPO = 'collins-muchiri/mbumah-hardware-pos';

(async () => {
  for (let i = 0; i < 20; i++) {
    const r = await fetch(`https://api.github.com/repos/${REPO}/releases/tags/v2.457.0`, { headers: H });
    if (r.status === 200) {
      const d = await r.json();
      console.log(`RELEASE v2.457.0 published: ${d.published_at} (poll ${i + 1})`);
      console.log(`  url: ${d.html_url}`);
      process.exit(0);
    }
    console.log(`poll ${i + 1}: not yet (HTTP ${r.status})`);
    await new Promise((res) => setTimeout(res, 30000));
  }
  console.log('TIMEOUT: release not published in 10 minutes');
  process.exit(3);
})();
