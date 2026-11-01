# Cron operations — the dispatcher that stays visible

How scheduled work actually fires in production, what keeps the hourly
cadence honest, and how to read the heartbeat. Companion to
`payroll-run-lifecycle.md` (the B2C auto-recovery contract lives there).

## The production story, in order

- **v2.16.0** landed the workspace edge proxy and — unknowingly — a 401
  wall: every `/api/cron/*` request died at the proxy's session gate BEFORE
  its own `x-cron-secret` check. Vercel Cron's unauthenticated GETs were
  silently rejected; no scheduled job fired in production.
- **v2.158.0** "the wake-up call gets through" fixed it: proxy Layer 5
  exempts `/api/cron/*` (`isCronPath`) so each route's own secret gate runs.
  Zero new trust at the edge — wrong secrets still 403 in-route, GET-only
  handlers, rate limiting intact. The first successful production tick
  fired after the deploy (all five sub-jobs green).
- **v2.159.0** closes the cadence and visibility gap (below).

## Cadence: designed hourly, fired daily, pinger restores hourly

- Vercel Hobby allows two cron entries and they are DAILY:
  - `/api/cron/nightly` — `30 2 * * *` (02:30 UTC)
  - `/api/cron/hourly` — `0 3 * * *` (03:00 UTC, ~06:00 EAT)
- BOTH dispatchers carry sub-jobs (v2.166.0 note): the hourly carries SIX
  (outbox, payments-sweeper, etims-retry, debt-reminders, b2c-recovery,
  session-reaper) and — since v2.165.0 — the nightly carries FOUR
  (reconciliation, retention, hr-report-digests, session-reaper); since
  v2.312.0 the nightly carries FIVE, with the loyalty-expiry sweep folded
  in as the fifth sub-job. Both
  write the tick ledger, and the Automation pulse card labels which
  dispatcher fired the row it is showing.
- Everything folded into the hourly dispatcher was designed for an hourly
  tick: outbox pump, payments sweeper, eTIMS retry, debt reminders, the
  B2C auto-recovery sweep, and (v2.163.0) the session reaper. The B2C
  backoff windows (2m-30m) are meaningless at one tick a day.
- **The remedy is `.github/workflows/cron-hourly.yml`**: a GitHub Actions
  workflow scheduled `0 * * * *` (plus `workflow_dispatch` for manual
  arming) that pings the production dispatcher with the `x-cron-secret`
  header and turns red on ANY non-200, non-success payload, or failed
  sub-job. Failure is honest and visible in the Actions tab.

### Arming the pinger (one-time, human)

1. Set `CRON_SECRET` on the Vercel project (production env). While unset,
   the dispatcher fails CLOSED since v2.212.1: production ticks are rejected
   with 403 (each refusal writes a `CRON_SECRET_UNSET` WARN systemLog).
   Non-production (local dev, previews) still accepts unauthenticated ticks
   with the same WARN row so the local pinger workflow keeps working.
2. Add the repo secret `CRON_SECRET` (same value) in GitHub → Settings →
   Secrets and variables → Actions.
3. Optional repo secret `PROD_URL` (defaults to the known deployment URL).
4. Run the workflow once via `workflow_dispatch` to verify end-to-end.

### Verifying the arming (two reads, five minutes, v2.165.0)

Arming is not done until it is OBSERVED done — two independent reads
confirm it, and neither requires shell access:

1. **The Actions tab**: the `workflow_dispatch` run (step 4) must be green
   — the "Verify every sub-job came back ok" step is the honest verdict, a
   red run names the failing sub-job in its log. A green run here is proof
   the repo secret + the URL work.
2. **The card**: reload the org console's Automation pulse — the amber
   "CRON_SECRET unset" badge must flip to the emerald "tick gate armed"
   (the posture is read server-side from the env, so the flip is proof the
   Vercel env var landed), and the tick source label (v2.165.0) on the
   "Last tick" line plus a green run in the Actions tab close the loop.
   If the two secrets DISAGREE, the card says so since v2.170.0: refused
   ticks that sent a secret render the amber "N denied ticks in 7d" pill
   beside the badge — the stale-secret signature the Actions tab names
   in its log and the card now counts in its own window.

## The tick ledger (v2.159.0, extended v2.164.0 + v2.165.0)

- Every completed dispatch writes ONE `CRON_DISPATCH_TICK` INFO systemLog
  row with `metadata.results` = `[{ name, ok, status }, ...]` for all
  sub-jobs. The `CRON_DISPATCH_PARTIAL_FAILURE` WARN stays for severity
  filtering; the ledger is the always-row.
- **v2.164.0**: the session-reaper's entry also carries `deleted` (the
  sweep's own count) whenever the response body held a non-negative finite
  number — promoted by the dispatcher's `ledgerEntry`, never invented by
  the ledger. The Automation pulse card renders it as `· reaped N` (or
  `· clean` for zero) on the chip and an "N reaped" header pill when
  positive. Older ticks and other sub-jobs simply lack the field.
- **v2.312.0**: the loyalty-expiry sweep writes its OWN ledger row per run
  (`LOYALTY_EXPIRY_RUN`, one INFO row — a healthy no-op sweep still leaves
  a trace) with `metadata.stores` = per-store
  `{ storeId, scanned, walletsExpired, pointsExpired }`.
- **v2.315.0**: the Automation pulse card surfaces the LAST
  `LOYALTY_EXPIRY_RUN` row — the sweep line reads "Last expiry sweep N ago
  · M wallets scanned · K expired, P points returned across S stores" (a
  healthy zero speaks "nothing to expire"). The reader is
  `src/lib/loyalty-expiry-pulse.ts` and it is never-a-guess: a row whose
  metadata cannot be FULLY read (garbage, missing stores array, any
  dishonest count) renders no sweep line at all — never a partial sum.
- **v2.316.0**: the sweep line's voices deep-link to the ledger — the
  amber counts AND the healthy zero are links to
  `/?tab=loyalty&view=transactions&type=EXPIRE`, and the loyalty desk
  reads `?type=` on mount (the tab-url vocabulary `view` already spoke),
  so the pulse's counts land on the exact rows they summarize.
- **v2.327.0**: the swallow census — the chained `.catch` body reads classified
  three ways: the 20 SILENT-PROCEED routes (a malformed body became `{}` and
  ran) now read through `readJsonBody`; the 4 OPTIONAL-BODY routes
  (reminders/debt process+schedule, repair-journal-headers, chat read-marker)
  read the NEW `readOptionalJsonBody` (empty body = legitimate `{}` call,
  unreadable body = 400); the 16 HONEST-SWALLOW sites (explicit validation →
  400, plus the DARAJA webhooks' contract leniency) stay and are pinned by
  `src/tests/swallow-census-v2327.test.ts`. Data-exports history rows wear a
  retention countdown (7-day lifetime spoken before it expires).
- **v2.326.0**: the door reads every room — the POST-wide sweep: the census
  (`scripts/census-post-door-v2326.py`) classified every remaining body read
  (67 bare declaring doors, 54 try-wrapped safe, 41 `.catch` swallows) and the
  67 bare reads across 67 routes (auth/login, debt, mpesa callback/stkpush,
  products, invoices, shifts, whatsapp, etims…) now read through
  `readJsonBody` — an unreadable body answers 400, never a 500. The
  `financial/journal/[id]` catch-swallow outlier converted (the 400 no longer
  blames "no reason given" for an unreadable body), and the org console's
  login dialog wears THE HONEST ERROR FACE (role=alert, icon, dark variants,
  self-clearing, spinning, gated).
- **v2.325.0**: the body door reads every room — the v2.324 handover's named class swept:
  21 more bare `await request.json()` doors in 19 PUT/DELETE/PATCH routes now read through
  `src/lib/request-body.ts` (`readJsonBody` + `bodyDoorRejected`), an unreadable body answers
  400 with a hint, and the roster's pager bar is hoisted beside the empty branch so the
  honest census (`po-census-empty`) speaks on a live page.
- **v2.324.0**: the roster speaks its own word — the QA burst proved the
  Task 44 handover's named gap live (a body-less DELETE on the PO detail
  route answered a 500 "Unexpected end of JSON input"), so the shared
  PUT/DELETE door now reads the body in a try/catch and answers **400**
  with the actions hint (THE BODY IS HONEST ABOUT ITS SHAPE). The Task 44
  deep-link collision analysis's safe path shipped: `?po-page=N` seeds the
  roster's pager through a param-NAMEd `parseInitialNamedPage` (one home,
  `parseInitialPage` delegates; the desk reads on mount only — loyalty
  keeps `?page=`). The past-the-end face wears the amber card (icon + why
  + way back; `po-past-end-card`/`po-past-end-hint`), and the census slots
  and pager status ride a pill wardrobe with the v2.323 desk-voice pin
  intact.
- **v2.323.0**: the roster joins the truth — the start-of-round sweep for
  the census arithmetic class found the purchase-order roster speaking it
  (and its wire door still raw-`parseInt`-ing page/limit — the loyalty
  door's proven 500 class). The door reads through
  `parsePositiveIntParam`/`parseClampedIntParam` (take clamped [1, 200]),
  the pager census is a truth-conditional (`po-census-empty` on
  `page > totalPages`), the empty branch grew the v2.320 honest face
  (`po-past-end` + way back), and the pager buttons wear aria-labels,
  tabular digits and a real ChevronRight.
- **v2.322.0**: the census never lies — the live QA walk (126-row seeded
  ledger) caught the pager bar's census computing arithmetic for a page the
  ledger doesn't have: a deep-linked `?page=9` spoke "Showing rows 801–126
  of 126" beside the honest past-the-end face. The census slot is now a
  truth-conditional — `page > totalPages` renders the muted
  `tx-census-empty` line ("No rows on this page — the ledger ends at N."),
  the numeric census speaks only on pages the ledger has — and the
  transactions view ends in a `h-16 sm:h-14` FAB-band runway so the pager
  can always scroll clear of the fixed bottom-right Dashboard button (the
  Task 42 geometry measurement, now a layout law).
- **v2.321.0**: the ledger chooses its gait — the transactions toolbar
  gains a Rows-per-page Select (50/100/200, `LEDGER_PAGE_SIZES`), seeded
  by the vocabulary's sixth word `?limit=` (`parseInitialLimit` — the
  MEMBERSHIP law: only an offered gait rides the state, everything else
  answers 100), the gait rides the query key + the wire's `limit` and
  the scope-reset law extends to it (a gait change re-anchors to page
  1), and the API door's integers go honest (`parsePositiveIntParam` /
  `parseClampedIntParam` — a garbage `?limit=` or `?page=` used to ride
  NaN into Prisma and answer 500; now fallback/clamp, take bounded
  1..200). Task 27's pin unwind, part two: `verify:ancestors`
  (scripts/verify-ancestors.mjs) runs the whole stale-by-design
  verify-v2-* fleet under one command and classifies its drift
  (PASS / version-tide / SIGNAL).
- **v2.320.0**: the ledger turns the page — the loyalty desk's
  transactions view gains a pager (census + "Page N of M" in the wire's
  own pagination voice, Prev/Next moving the desk's state, disabled
  bounds) rendered only when `totalPages > 1`, seeded by the vocabulary's
  fifth word `?page=` (`parseInitialPage` — shape law, not existence), a
  scope-reset law returning to page 1 on any filter change, and an
  honest past-the-end empty ("Page 9 is past the end") with a way back.
- **v2.319.0**: the cards answer the ledger — the transactions wire's
  `summary` gains the per-type `buckets` ledger (one groupBy over ALL
  matching rows, additive to the two sign-based totals), and the loyalty
  desk's Points Issued / Points Redeemed cards wear the wire's numbers
  instead of summing the visible page (a ledger that outgrows one page
  can no longer undercount). Both cards say their scope
  (`pointsScopeLabel` — amber `window · EXPIRE` when a filter is active,
  muted `all rows` when whole).
- **v2.318.0**: the ledger's window answers back — the transactions API
  reads its date query through the honest-day law (`honestDayKey`, so a
  garbage `dateFrom`/`dateTo` is dropped instead of 500-ing) and echoes
  the window it actually applied in the response `window` field; the
  loyalty desk wears the echo as an amber stamp and gains the × chip
  that clears the window and scrubs `?from=`/`?to=` from the address bar
  (`buildSearchWithoutParams` — tab/view/type ride untouched).
- **v2.317.0**: the counts door names the DAY — the ledger's date window
  answers `?from=YYYY-MM-DD&to=YYYY-MM-DD` (each param validated
  independently, never-strand law), and the amber counts link rides its
  own sweep's EAT day (`eatDayKey`), so the window opens on exactly the
  rows that sweep wrote; the healthy zero keeps the type-only trail door.
- **v2.165.0**: BOTH dispatchers write the ledger. The nightly dispatcher
  (which had left no always-row since v2.159.0) writes its own tick row,
  and every row's metadata names its dispatcher (`dispatcher: 'hourly' |`
  `'nightly'`) — the org card reads the field to label the "Last tick"
  line (`· nightly dispatcher`), and older rows simply omit the label.
  The card's tooltip on the same line carries the exact EAT stamp of the
  tick. Rows/day: ~25 with the pinger armed (~2/day without). SystemLog
  retention sweeps own the growth.
- **v2.170.0**: the gate writes its own row — `CRON_TICK_DENIED` (WARN)
  when a tick sends an `x-cron-secret` that does not match the armed
  `CRON_SECRET` AND at least sent a non-empty value (empty-header
  requests — scanners, the Vercel-managed scheduler — write nothing, so
  the row means "a real tick was refused", never scanner noise; the row
  carries only `metadata.path`, never secret material). Before this the
  wrong-secret denial was invisible everywhere; now the card counts it
  (`deniedTicks7d`) and the two-read verification can end on the card
  alone when the secrets disagree. **v2.171.0**: the `path` field feeds
  the card's sentence — per-gate refusal counts, the most recent
  refusal's EAT stamp, and a single-gate suffix on the pill itself.

## The sub-jobs (ten, as of v2.315.0)

<!-- v2.167.0: the table grew from six to nine — the nightly dispatcher's
     three exclusive sub-jobs (reconciliation, retention, hr-report-digests)
     had only lived in the cadence prose since v2.165.0; the register is now
     the COMPLETE card-sized echo of AUTOMATION_SUBJOB_HINTS, and a drift pin
     asserts every hint key has a row here.
     v2.315.0: the register grew to ten — `loyalty-expiry` (folded into the
     nightly as its fifth sub-job in v2.312.0) finally has its row; the
     drift pin now covers it in both directions. -->

| name | owns | notes |
|------|------|-------|
| `outbox` | outbox_events pump | opportunistic pumps also fire post-checkout |
| `payments-sweeper` | M-Pesa payment polling | early-outs when unconfigured |
| `etims-retry` | KRA eTIMS queue drain | backoff + DEAD ceiling (v2.6.0) |
| `debt-reminders` | overdue debt statements | 7-day per-ledger anti-spam throttle |
| `b2c-recovery` | failed/stuck B2C transfers | gate-allowed re-sends only (v2.155.0) |
| `session-reaper` | **expired auth sessions** | one `deleteMany` on the indexed `expiresAt` (v2.163.0); rides BOTH dispatchers since v2.165.0 (hourly 03:00 UTC + nightly 02:30 UTC — the idempotent deleteMany makes the overlap harmless); `runWithoutTenant` — Session is a global, tenant-exempt table; scope discipline: reads ONLY `expiresAt`, never `lastActiveAt` (idle expiry stays the portal guard's contract); every sweep leaves its own INFO `SESSIONS_REAPED` row, and a reaped-zero sweep is a SUCCESS |
| `reconciliation` | the nightly financial summaries rebuild | nightly-only (02:30 UTC) since v2.165.0 |
| `retention` | the expired-record purge | nightly-only; honors each record's retention grace period |
| `hr-report-digests` | the scheduled HR report digests | nightly-only; delivery is RESEND_API_KEY-gated |
| `loyalty-expiry` | the FIFO loyalty point expiry sweep | nightly-only since v2.312.0 (the fifth sub-job); per store, oldest earn lots first, conditional claim — idempotent by construction; every sweep leaves its own INFO `LOYALTY_EXPIRY_RUN` row (a healthy zero still leaves a trace), and since v2.315.0 the LAST such row faces the Automation pulse card |

## Reading the heartbeat: the Automation pulse card

`GET /api/org/automation` (ORG_ROLES = SUPER_ADMIN / STORE_OWNER /
ACCOUNTANT, parity with `/api/org/summary`; read-only over `rawDb` under
`runWithoutTenant`) returns:

- `lastTick`: the latest ledger row — timestamp (with the exact EAT stamp
  as the line's tooltip, v2.165.0), the dispatcher that fired when the row
  names one (`· hourly dispatcher` / `· nightly dispatcher`, v2.165.0),
  per-sub-job chips, and the 7-day `CRON_DISPATCH_PARTIAL_FAILURE` count.
- **The hints reach the keyboard (v2.167.0)**: hinted sub-job chips are
  focusable (a tab stop with a family-colored focus ring — emerald for ok,
  red for a failure) and every hint AND exact stamp also rides an sr-only
  line, so the ownership copy and the failed-tick datetimes are no longer
  mouse-only. Unhinted names stay bare and unfocusable — never a guess,
  never a dead tab stop.
- **The hints become visible (v2.168.0)**: the last mouse-only inch goes
  too — while a keyboard user focuses a hinted chip or the failed-tick
  pill, the SAME sentence renders in a popover bubble overlaying the line
  below (an absolute overlay, so the two-row chip area never reflows;
  aria-hidden, because the sr-only line already spoke it once). The
  reaper chip's `· reaped N` / `· clean` suffix and a failure chip's
  `· HTTP N` suffix carry their own honest tooltips, and the org
  console's title-only LINKS (the HR tiles, the per-branch People &
  payroll deep links) say their hover sentence to screen readers via an
  sr-only echo / the accessible name itself — one truth, two surfaces.
- **The pill names the heartbeat (v2.169.0)**: the failed-tick sentence
  grows a parenthetical per stamp — `Failed ticks: Tue 20 Oct 2026 ·
  06:48 EAT (hourly) · …` — read from each ledger row's own TOP-LEVEL
  `metadata.dispatcher` (v2.165.0 standardized the field on every row;
  the API exposes the parallel `failedTickDispatchers` array, null where
  a row predates v2.165.0 or carries no name, and the card renders the
  bare stamp then — never a guess). This is not the coupling the
  v2.167.0 assessment declined: that idea rode the stamps on the
  dispatchers' INTERNAL result shapes; this reads the ONE standardized
  field.
- **The refused tick speaks (v2.170.0)**: a tick that sends the WRONG
  `x-cron-secret` is refused with 403 — and used to vanish (no ledger
  row, the 403 body the only trace), so the moment the pinger's secret
  went stale left the card green with an aging tick and no explanation.
  Both gates now write a `CRON_TICK_DENIED` WARN row when the request at
  least SENT a non-empty secret (a misconfigured-but-honest tick always
  does; anonymous scanners and the Vercel-managed scheduler send nothing,
  so the ledger never chases noise and an unauthenticated caller cannot
  write rows by spamming the endpoint). The card counts them as
  `deniedTicks7d` — an amber "N denied ticks in 7d" pill beside the
  posture badge, with the full hint treatment (title, tab stop, sr-only
  copy, visible-on-focus bubble); zero denials render nothing. The 403
  body is unchanged, no secret material rides the row, and the write is
  catch-guarded so the refusal stays deterministic.
- **The denial names its gate (v2.171.0)**: the refusal feed gets the
  same shape the failed ticks have had since v2.166/v2.169 — exact
  stamps (ISO, newest first, ≤10) exposed as `deniedTickStamps`, and
  each row's `metadata.path` folded tolerantly to the gate's short name
  in the parallel `deniedTickGates` ('hourly' | 'nightly'; null where
  the path is absent, garbage, or unknown). The pill's sentence is
  computed ONCE (a `deniedTickTooltip` helper, the failed-tick pill's
  one-truth rule) and says WHICH gate refused — `Recent refusals: 1 at
  the hourly gate, most recent Tue 20 Oct 2026 · 16:52 EAT` — with the
  honest "and N more" valve when the count outruns the ≤10 feed. When
  EVERY listed refusal names the same gate and the list is complete,
  the pill itself appends `· hourly` / `· nightly`; mixed or unknown
  gates render no suffix, never a guess.
- **The card expects the tick (v2.172.0)**: the "Last tick 3h ago" line
  is history — the card now also answers "when is the NEXT tick due,
  and is the heartbeat on time?". A pure lib (`src/lib/org/tick-expectation.ts`)
  computes the expectation from the ledger read's own anchors
  (`generatedAt` is the server's clock — the browser's never enters the
  math), `lastTick.at`, and the real cadences. Three states, three
  voices the card already speaks: **on-time** (emerald, "Next tick due
  13:00 UTC (16:00 EAT) — the hourly dispatcher's slot"), **overdue**
  (amber, "Heartbeat overdue — no tick since 14:00 UTC (17:00 EAT),
  5m past the 15-minute grace window" — fired only once `now` runs past
  slot + 15 min AND no tick of any dispatcher has landed since the slot
  began), and **unarmed** (muted, "Pinger not armed — the next expected
  tick is Vercel's daily slot 03:00 UTC (…EAT)" — while CRON_SECRET is
  unset nothing pings the hourly dispatcher, so an overdue hour is not
  an incident and the line never cries wolf). "No tick" is ledger-level
  (either dispatcher counts — the source label names which one last
  fired); the API's cadence object gains `vercelHourUtc: 3` so the card
  consumes the daily slot as a number instead of parsing a cron string.
- `failedTicks7d`: partial-failure rows in the last 7 days.
- `deniedTicks7d` (v2.170.0): refused ticks in the same 7-day window —
  the amber companion to the green "tick gate armed" posture (a green
  gate with climbing denials is the stale-secret signature).
- `deniedTickStamps` + `deniedTickGates` (v2.171.0): the refusal feed
  behind the count — exact stamps and per-row gate names, newest first,
  capped at 10 with the "and N more" valve on the card.
- `secretConfigured`: whether `CRON_SECRET` is set server-side — the honest
  tick-gate posture (since v2.212.1 unset production ticks are refused with
  403, fail-closed; the amber "CRON_SECRET unset" badge still renders until
  the human arms the gate).
- `cadence`: the vercel.json schedule, the pinger workflow name, and
  (v2.172.0) `vercelHourUtc` — the daily slot's UTC hour as a number the
  card's expectation line consumes; the card's truth line names both
  schedulers.

The org console card renders every state honestly: loading skeletons, an
empty state before the first tick, an error state with Retry (a read
failure is NOT a dispatch failure — the heartbeat keeps running), and the
live pulse (sub-job chips emerald-700 ok / red-700 failed with HTTP
status; the reaper chip adds `· reaped N` / `· clean`, a positive
count wears a sky "N reaped" pill in the card header, and the Last tick
line names its dispatcher and carries the exact EAT stamp tooltip since
v2.165.0; the sub-job chips carry a one-line "what this sub-job owns"
tooltip since v2.166.0 — the register above, echoed at the point of
reading — and the failed-tick pill lists the exact failed ticks in EAT,
capped at 10 with an honest "and N more"). An unparseable
ledger row keeps the timestamp and renders no
chips — never a guess.

## Contracts new scheduled work must inherit

- A new cron route needs NO proxy edit (`/api/cron/*` passes the edge gate
  by the v2.158.0 contract), but any new edge layer must preserve
  `isCronPath`.
- A new sub-job folds into the dispatcher (Vercel Hobby's two-cron limit
  keeps dedicated vercel.json entries out) — give it a name, a
  withErrorBoundary-wrapped GET, its own `x-cron-secret` check, and it
  inherits the ledger row and the pinger's green/red verdict for free.
  If the job must never miss a day, fold it into BOTH dispatchers (the
  session reaper has ridden both since v2.165.0) — idempotent jobs only;
  the overlap must be provably harmless.
- Sub-jobs must stay idempotent: overlapping ticks (Vercel + the pinger)
  cannot double-deliver. The B2C sweep inherits this from
  `initiatePayrollB2C`'s active-transaction refusal.
