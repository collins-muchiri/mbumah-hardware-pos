#!/usr/bin/env node
// Double-fork launcher for the :3200 QA daemon (recreated v2.88.0 round).
//
// WHY THIS EXISTS: nohup/setsid backgrounding dies at the tool-call
// boundary — the sandbox reaps the process group. A detached
// (setsid-equivalent) spawn that exits immediately orphans the server to
// init, which survives. This is the ONLY reliable way to run :3200 here.
//
// Usage: node scripts/ems-daemon-3200.cjs   (returns immediately)
//
// v2.215.0 PID TIDY (the v2.214.0 ops note: per-call respawns collided —
// EADDRINUSE in server-3200.log, benign because the probe reported the
// OLD listener healthy, but noisy). The launcher now probes :3200 FIRST
// and only spawns when nothing healthy answers. A second launcher call
// inside the respawn window (the old listener still bound but the new
// one racing) can still EADDRINUSE — the OS is the only truth about the
// port — but the steady-state double-spawn is gone: a healthy listener
// is never raced again.

const { spawn } = require('node:child_process');
const path = require('node:path');
const fs = require('node:fs');
const http = require('node:http');

const CWD = path.resolve(__dirname, '..');
const LOG = path.join(CWD, 'server-3200.log');

const probeOnce = () => new Promise((resolve) => {
  const req = http.get({ host: '127.0.0.1', port: 3200, path: '/api/health', timeout: 1500 }, (res) => {
    res.resume();
    resolve(res.statusCode === 200);
  });
  req.on('timeout', () => { req.destroy(); resolve(false); });
  req.on('error', () => resolve(false));
});

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  // Three probes over ~4.5s: the EADDRINUSE window is a boot race, not a
  // steady state — a genuinely healthy listener answers on the first one.
  for (let i = 0; i < 3; i += 1) {
    if (await probeOnce()) {
      console.log(`daemon already healthy on :3200 (probe ${i + 1}/3) — not spawning`);
      process.exit(0);
    }
    if (i < 2) await sleep(1500);
  }

  const child = spawn(
    process.execPath,
    [path.join(CWD, 'node_modules', 'next', 'dist', 'bin', 'next'), 'start', '-p', '3200'],
    {
      cwd: CWD,
      detached: true,
      stdio: ['ignore', fs.openSync(LOG, 'a'), fs.openSync(LOG, 'a')],
      env: {
        ...process.env,
        // v2.278.0 THE PIN LAW: the pin must ride the spawn itself (process
        // env beats .env — an inherited shell DATABASE_URL would win), and
        // the pin must speak the QA database .env speaks (db/ems-dev.db,
        // where the QA seeds land), NOT the vitest-forced house db — the
        // old pin here pointed at prisma/prisma/dev.db, so every
        // launcher-born daemon served a different world than the shell's
        // own `next start` and the desk E2E saw its seeds vanish.
        DATABASE_URL: 'file:/home/z/ems/db/ems-dev.db',
        NODE_ENV: 'production',
        PORT: '3200',
      },
    },
  );

  child.unref();
  console.log(`daemon pid ${child.pid} → http://localhost:3200 (log: ${LOG})`);
  process.exit(0);
})();
