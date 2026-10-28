// merge-pr-v2241.mjs — squash-merge PR #373 (the walk's law).
import { execSync } from 'node:child_process';

const token = execSync("git remote get-url origin | sed 's/.*x-access-token://;s/@github.com.*//'", { cwd: '/home/z/ems' }).toString().trim();

const res = await fetch('https://api.github.com/repos/collins-muchiri/mbumah-hardware-pos/pulls/373/merge', {
  method: 'PUT',
  headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json', accept: 'application/vnd.github+json' },
  body: JSON.stringify({
    merge_method: 'squash',
    commit_title: "feat: the walk's law (v2.241.0) (#373)",
    commit_body: "The cadence's thresholds stop being constants and become the org's own: the duplicated 7/30 become one stored law (SystemConfig cadence.freshDays/cadence.windowDays), read by ONE library whose fallback keeps yesterday's truth on any absence, malformation, or incoherence. GET /api/org/cadence speaks the law (manager-plus); PUT writes the pair from the owner's hand (SUPER_ADMIN/STORE_OWNER), the pair-or-nothing gate rejects half a law with the bands named, and every write lands in the tamper-evident trail (CONFIG_CHANGE, old pair and new pair hashed). The wires obey: kpi-summary + the branch teeth read the same stored pair; the law's window governs the whole 30d-shaped family; the payload rides the law's own numbers (additive window30d.windowDays). The law's face names the pair for EVERY reader of the map, the pen rides only for the governor, the editor mirrors the bands before the round trip, the wire's 400 speaks into the error line verbatim, and a written law toasts the pair and asks the page's own loader for the refetch. The window speaks its number: every hardcoded 30d/30-day label on the map says the law's own number now. verify:v2-241-0 = 45 checks; vitest 5397/5397 (242 files); lint 0 errors; build exit 0; E2E green on :3200 (law written 7/30 -> 5/45, audit row verified, teeth legend re-walked, wire 400 named the bands, zero console errors).",
  }),
});
const j = await res.json();
console.log(res.status, JSON.stringify(j).slice(0, 200));
