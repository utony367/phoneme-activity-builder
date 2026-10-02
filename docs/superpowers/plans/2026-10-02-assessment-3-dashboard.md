# Assessment 3 Dashboard and Evidence Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Deliver database-backed reporting, observability and verified testing evidence for the existing phoneme activity builder.

**Architecture:** Retain the existing App Router/Prisma/SQLite application. Persist creation/generation events and visible page visits, aggregate them through reporting services, and render a dashboard with labelled live/simulated data. Browser, load and accessibility tests run against a migrated production application.

**Tech Stack:** Existing Next.js, React, Prisma 6.12, SQLite, Zod, Vitest; add Playwright, Apache JMeter and Lighthouse as development/testing tools.

**Spec:** docs/superpowers/specs/2026-10-02-assessment-3-design.md

## Global Constraints

- Work on assessment-3-dashboard, baseline 307f67af2e5a8414c1fc5082a2e88075cf938628. Preserve teacher records and Assessment 1/2 workflows.
- Use Node 22 and npm-generated lockfile; no force dependency upgrades.
- Keep /health returning HTTP 200 and status ok; database readiness is a separate /api/status.
- Page duration is visibleDurationMs, bounded 0–30 minutes. No personal identifiers, IPs, cookies or word payloads in analytics.
- Reports default to live source. Synthetic data and test results must never be conflated.
- Date ranges use UTC and have explicit labels. Inventory is current and not filtered by date.
- JMeter stages are finite total users with explicit peak concurrency, never misrepresented as simultaneous users.
- Real Playwright/JMeter/Lighthouse artifacts only; no invented scores, extrapolated completion or fabricated evidence.
- Retain production dependency audit and Docker migrations/non-root/persistent volume.
- Required student video is 3–8 minutes with face, voice and ID; prepare script, do not claim recording completed.
- Source ZIP excludes node_modules, .next, secrets, databases and test browser caches.

## Review Focus

- Repeated visibility/beacon deliveries must upsert one visit and retain the largest cumulative duration (Task 2).
- A deleted Activity must leave historical event snapshots intact (Task 1 and Task 5).
- No events, ties and date/source boundaries must yield explicit empty/tie states (Task 3).
- Generation logging failure must return 503 rather than untracked success (Task 2).
- Word edits must not discard unsaved settings or leave a stale preview (Task 4).

## File responsibilities

- prisma/schema.prisma and new migrations: event, visit and Activity source persistence.
- lib/telemetry-validation.js: visit/report input contracts.
- lib/telemetry.js: creation/generation event writes and visit idempotency.
- lib/reporting.js, lib/report-csv.js: one reporting aggregation and safe export.
- components/PageVisitTracker.js: browser-visible duration collection.
- components/OperationalDashboard.js, components/ReportTrend.js: operational UI and table-backed chart.
- app/dashboard/page.js and app/api/{visits,reports,status}: thin routes/pages.
- scripts/seed-demo.mjs: idempotent synthetic fixtures.
- e2e/, playwright.config.js: production browser and persistence tests.
- testing/jmeter/: finite workload plan, runner and summary.
- scripts/run-accessibility.mjs: real Lighthouse runner.
- docs/assessment3/: reproducible results, references and video guide.

---

### Task 1: Persist operational data and idempotent fixtures

**Files:** Modify prisma/schema.prisma; create prisma/migrations/<timestamp>_telemetry/migration.sql, scripts/seed-demo.mjs, tests/telemetry-model.test.js; update package.json script seed:demo.
**Interfaces:** OperationEvent stores eventKey/eventType/outcome/activityId/title/type snapshot/source/error/duration/occurredAt. PageVisit stores visitKey/path/visibleDurationMs/source/occurredAt. Activity.source defaults LIVE. Event relation uses SetNull.

- [ ] Write failing migration/integration assertions: existing words survive migration; deleting Activity preserves OperationEvent snapshot; LIVE default; repeated fixture seed has identical row counts.
- [ ] Run focused tests against a temporary migrated SQLite database; record expected red.
- [ ] Implement additive schema/migration and deterministic seed identifiers; simulated creation logs, successful/failed generation fixtures, visits, both types and empty-list case.
- [ ] Run Prisma validate/generate, migrations and focused tests; verify seed twice.
- [ ] Commit feat: persist operational events and labelled demo fixtures.

### Task 2: Instrument real operations and visible visits

**Files:** Create lib/telemetry-validation.js, lib/telemetry.js, app/api/visits/route.js, app/api/status/route.js, components/PageVisitTracker.js; modify app/layout.js, activity creation route and generation route; tests/telemetry.test.js, tests/telemetry-routes.test.js.
**Interfaces:** recordGeneration(db, event) -> persisted event; upsertVisit(db, input) -> visit; parseVisitInput(input) -> validated LIVE visit; getReadiness(db) -> status/db/serverTime. Creation event uses same Prisma transaction as create.

- [ ] Write failures: only allowlisted paths, integer duration 0..1800000, invalid source/timestamps rejected, malformed JSON 400; repeated visitKey cannot inflate duration/count; new visit records at server time.
- [ ] Add generation regressions: one success or failure event per request, correct type snapshot/error category, logging failure 503, unknown ID remains 404 without misleading type statistics.
- [ ] Run focused tests and observe red.
- [ ] Implement services/routes; client tracks visible route duration and sends cumulative values on hide/unmount with stable route-entry key. No Strict Mode duplicate visit.
- [ ] Verify /health unchanged, readiness 200/503 and creation rollback on telemetry failure; run all unit tests/build.
- [ ] Commit feat: instrument creation generation and visible page visits.

### Task 3: Aggregate filtered reports and safe CSV

**Files:** Create lib/reporting.js, lib/report-csv.js, app/api/reports/route.js, app/api/reports/export/route.js, tests/reporting.test.js, tests/report-csv.test.js.
**Interfaces:** parseReportFilters(searchParams, now) -> {range,source,from,to}; getReport(db, filters, now) -> {generatedAt,filter,inventory,operations,visits,mostUsedType,trends,recentEvents,alerts}; reportToCsv(report) -> UTF-8 CSV.

- [ ] Write fixture assertions: counts by source/type, current inventory distinct from historical creation, success rate success/(success+failure), avg duration over visits, null for empty denominators, explicit tied most-used types.
- [ ] Pin date boundary inclusion, future record exclusion, UTC buckets, rejected range/source and deleted activity history.
- [ ] Pin CSV quotes/newlines/Unicode and neutralization of =,+,-,@ formula prefixes.
- [ ] Run red tests, implement aggregate services and thin routes, bounded recent-event list and alerts.
- [ ] Run focused/all tests, verify JSON/CSV share filters and no-data semantics.
- [ ] Commit feat: expose operational reports and safe CSV exports.

### Task 4: Dashboard and dependable activity workflows

**Files:** Create app/dashboard/page.js, components/OperationalDashboard.js, components/ReportTrend.js; modify Navbar.js, globals.css, ActivityEditor.js, client-api.js and generated Word Search controls as needed; test tests/dashboard-format.test.js.
**Interfaces:** Dashboard consumes Task 3 report shape and /health plus /api/status; filters range/source; existing client generation helper remains shared.

- [ ] Test pure formatting: null durations/rates show no data; ties visible; synthetic mode labelled; API failure cannot show healthy.
- [ ] Run red, implement accessible cards, type comparison, trend with equivalent table, recent event table, alerts, CSV download, stored activity links and checked timestamp.
- [ ] Preserve dirty settings during word reload; clear stale HTML after saved changes; reliable download cleanup.
- [ ] Ensure generated Word Search supports stable pointer selection and keyboard/click start/end selection; no node replacement mid-gesture.
- [ ] Run lint/tests/build; manually inspect responsive layout and labels. Browser assertions land in Task 5.
- [ ] Commit feat: add accessible operational dashboard and reporting views.

### Task 5: Browser CRUD, generated gameplay and restart evidence

**Files:** Create playwright.config.js, e2e/builder.spec.js, e2e/generated-activities.spec.js, e2e/dashboard.spec.js, scripts/test-persistence.mjs; modify package scripts/dev dependencies and CI browser job; retain traces/report artifacts.
**Interfaces:** Test server uses isolated DATABASE_URL, migrate deploy and production build; never uses a teacher's database.

- [ ] Add initially failing browser specs before behavior fixes: UI create/read/edit/delete, Unicode phonemes, refresh/retrieve, dirty settings retained after word edits.
- [ ] Test both stored types: preview, download HTML and actual Wordle guesses/reset plus Word Search click/keyboard selection.
- [ ] Test successful/failed metrics, LIVE/SIMULATED filters and empty-list alerts; replay visit delivery.
- [ ] Implement only defects surfaced by tests; use roles/labels instead of brittle CSS selectors.
- [ ] Run Playwright on Chromium, preserve HTML report/trace and screenshots; restart server/container with same SQLite volume and assert saved activity/event records survive; deletion cascades words but preserves logs.
- [ ] Commit test: verify builder gameplay metrics and restart persistence.

### Task 6: Actual staged JMeter and Lighthouse evidence

**Files:** Create testing/jmeter/workflow.jmx, testing/jmeter/run-stages.sh, testing/jmeter/summarize.mjs, scripts/run-accessibility.mjs, docs/assessment3/TEST_RESULTS.md; modify CI evidence jobs/dev packages as needed.
**Interfaces:** JMeter accepts base URL, stage total user count, bounded peak concurrency and fixture IDs. Summary uses actual JTL samples only. Lighthouse audits production URLs and generated fixture HTML.

- [ ] Validate JMX structure and result parser with small known JTL fixture; assert errors/p95/completed count and no extrapolation.
- [ ] Run real builder and generation requests for both types; each stage 1/10/100/1000/10000 total users, document cap/ramp/repeats and per-user request sequence. Enforce finite timeout and cleanup only workload fixtures.
- [ ] Save JTL/HTML artifacts and environment/tool versions; report incomplete stages explicitly.
- [ ] Run Lighthouse Accessibility on dashboard, builder and both generated outputs; save initial HTML/JSON.
- [ ] Fix actual accessibility findings, rerun audits and Playwright, record measured before/after and manual keyboard checks.
- [ ] Extend bounded GitHub Actions jobs to upload real artifacts even on failure; preserve existing CI checks.
- [ ] Commit test: add measured load and accessibility evidence.

### Task 7: Submission documentation and final verification

**Files:** Update README.md; create docs/assessment3/VIDEO_WALKTHROUGH.md, REFERENCES.md, SUBMISSION_CHECKLIST.md; evidence links/commit IDs; optional one-page submission sheet only if needed.
**Interfaces:** Documentation consumes exact results from Tasks 5/6; no prerecorded-video claim.

- [ ] Verify at least five primary industry references and APA 7 titles/URLs; include in video closing slide/submission reference sheet.
- [ ] Write a timed 3–8 minute narration: ID/face/voice, dashboard, saved CRUD and persistence, both outputs, alerts/reporting, health, Playwright, JMeter, Lighthouse improvements, GitHub homepage and commits.
- [ ] Provide Windows PowerShell setup/seed/test/Docker instructions, metric definitions, synthetic-data labels and limits.
- [ ] Run fresh final unit/lint/Prisma/build/audit/browser/persistence/Docker gates; reconcile evidence to final commit, rerun impacted load/accessibility only if behavior changed.
- [ ] Review whole branch against rubric; resolve blocking findings.
- [ ] Prepare clean source archive or branch ZIP link, identify actual student recording and official AI form as remaining student actions; do not merge without user instruction.
- [ ] Commit docs: prepare Assessment 3 demonstration and submission.

## Self-review

All spec sections map to Tasks 1–7. Metric field names are shared through Task 3's contract. The five Review Focus cases have explicit tests. Product logic and test tooling are sequenced so each prerequisite is independently verifiable. Real testing may reveal resource limits; completed results and limitations must replace any planned expectation.
