# Assessment 3 design: operational dashboard and test evidence

Date: 2026-10-02 UTC (2026-10-03 in the student's timezone)
Repository: utony367/phoneme-activity-builder
Working branch: assessment-3-dashboard
Baseline: assessment-2-backend at 307f67af2e5a8414c1fc5082a2e88075cf938628

## Purpose and constraints

Extend the existing Next.js starter-based Speech Pathology Wordle and Word Search builder for teachers. Preserve existing CRUD, phoneme validation, standalone generators, SQLite migrations and Docker execution. Deliver the rubric's dashboard/reporting (6), persistence (6), observability (5), testing/accessibility (4), and code/GitHub practice (4). The student must record the required 3–8 minute video with face, voice and student ID; automation cannot provide that personal demonstration. No written report is required by the brief. A short references/submission sheet can be prepared for the ambiguous Turnitin requirement, without claiming the coordinator has approved it.

## Architecture

Retain React, Next.js App Router, Prisma and SQLite. Add server-side telemetry services, reporting routes, a dashboard page and browser page-visit instrumentation. Avoid new hosted services or authentication scope. Each module has one responsibility: validate telemetry, persist events, aggregate reports, render statistics, or run tests. New migration must preserve existing data.

## Stored event model

Add OperationEvent with id, unique eventKey, eventType (ACTIVITY_CREATED or GENERATION), outcome (SUCCESS or FAILURE), nullable activityId, activity title/type snapshots, source (LIVE or SIMULATED), sanitized error category/message, durationMs and occurredAt. Relation to Activity uses SetNull; historical snapshots survive deletion. Never record word payloads or stack traces. ACTIVITY_CREATED is written in the same transaction as Activity creation. Generation validates the ID and loads the activity, then measures generation, writes one success/failure event and returns the established HTML/error response. Unknown IDs remain 404 and do not distort per-type statistics. If generation logging cannot persist, return 503 rather than report a successful output with missing evidence.

Add PageVisit with unique visitKey, allowlisted page path, visibleDurationMs (0–30 minutes), source and occurredAt. One visit means one route entry; repeated delivery upserts the same visit instead of double-counting. Browser counts only visible time, sends on visibility change/page exit using beacon or keepalive, and does not store cookies, IP addresses or user identifiers. Invalid telemetry returns 400. Ordinary clients cannot choose SIMULATED source or arbitrary timestamps.

Mark demo Activities with source LIVE/SIMULATED (default LIVE). Demo event/visit source is explicit. Seed script uses deterministic identifiers and is idempotent; repeated runs do not inflate totals. It creates both activity types, multi-character phonemes, successful/failed events, visits, and an empty activity warning case. Synthetic event values are labelled fixtures, never claimed as load-test results.

## Statistics and reporting contracts

GET /api/reports accepts validated range (24h, 7d, 30d, all) and source (live, simulated, all; default live). Return one consistent snapshot with generatedAt, filter, inventory (current activities and words, split by type), operational counters (created during range, success, failure, total attempts), success rate (null if no attempts), average visible duration (null if no visits), most-used type (by generation attempts, ties explicit), daily trend buckets, recent generation events and alerts.

Inventory is clearly labelled current inventory and is not date-filtered. Event and visit measures are filtered by UTC timestamp, with timezone and date range visible in the interface. Historical creation counts differ from current inventory after deletions. Most-used type is generation demand, not activity inventory. GET /api/reports/export shares filters/aggregation logic and returns UTF-8 CSV with safe cells to prevent spreadsheet formula injection. No-data shows an explicit empty state; never fabricate zero duration or a winning type.

Keep /health returning HTTP 200 and status ok for process liveness. Add /api/status for SELECT 1 database readiness and server time; return 503 when persistence is unavailable. Dashboard distinguishes liveness/readiness and reports checked time. An actual failed status request displays unavailable, not healthy.

## Dashboard and integration

Add /dashboard navigation. Accessible responsive metric cards, activity type comparison, daily trend chart with an equivalent data table, recent logs, alerts, filters and CSV download. Use semantic headings, labels, keyboard-operable controls, visible focus, sufficient contrast and text alternatives; color alone never identifies a failure.

Include a stored-activity list linking to existing word management and both preview/download workflows. All output generation uses saved values, not unsaved form state. Preserve unsaved settings when words reload, clear stale previews after saved data changes, and avoid object URL leaks. Alerts cover empty word lists and failures in the selected period. No misleading warnings for legitimate zero-use initial state.

## Testing and evidence

Vitest: telemetry schema, idempotency and metric formulas, source/time filtering, malformed payloads, safe CSV, event persistence failures and existing regressions.

Playwright: real migrated temporary database and running production build. Use browser UI to create an activity, add/edit/delete phoneme words, refresh/re-read values, update settings, and delete the activity. Cover both Wordle and Word Search preview/download, standalone HTML interactions (including keyboard or click selection for Word Search), generation failure and dashboard counters. Verify reporting after a process/container restart with the same database volume. Isolate tests from teacher data; preserve reports/traces on failure.

JMeter: use an actual .jmx plan against the project's own local/CI service, no third-party load targets. Run finite stages of 1, 10, 100, 1000 and 10000 total virtual users with a documented concurrency cap, ramp and requests per user. Explicitly distinguish total users from peak concurrent users: equivalent staged load is permitted by the brief. Include reading stored activities, isolated create/update operations and generation of both activity types. Assertions validate HTTP status and HTML content, not speed alone. Preserve JTL and HTML reports and summarize samples, throughput, p95 and errors. Resource limits, aborted stages and saturation are reported honestly; completed requests are not extrapolated to claim a larger completed stage. Tests clean only their own fixtures.

Lighthouse: run real Accessibility checks against production dashboard, saved builder and generated outputs. Store JSON/HTML evidence, record tool version/environment and before/after results for observed fixes. Manual checks supplement automated audits for keyboard selection, focus and readable phonemes. No invented score or guarantee of 100.

CI: retain lint, unit tests, Prisma validate, build, production audit and Docker smoke. Add separate reproducible browser/accessibility and staged load jobs with bounded time/resources, explicit artifacts and cleanup. Evidence documents identify the exact commit and run so stale results cannot be represented as final verification. Regenerate lockfile via npm; no manual lock edits or forced major upgrades.

## Handoff and acceptance

Every required metric is persisted/aggregated from database data and visible with an accurate label. Database CRUD/restart persistence and real game interactions are verified. Failure and empty-list alerts are demonstrable. Both outputs remain offline HTML. Test artifacts contain real results and explain limitations. README includes Windows PowerShell setup, migrations, seed, tests, reports, Docker and GitHub practice. Add at least five verified primary industry references in APA 7, a 3–8 minute screen-by-screen narration script, and a clean source ZIP without dependencies, secrets, databases or build caches. The student completes the official Assessment 3 AI acknowledgement and records the video.

Out of scope: multi-user accounts, cloud deployment, production analytics scale, clinical records, predicting load results, and recording the student's face/voice.

## Review check

The design defines the metric denominators, time/source filters, persistence semantics, synthetic data labeling, error paths, real testing evidence and student-owned submission actions. No product implementation has started. Proceed to the written implementation plan after the student reviews this spec.
