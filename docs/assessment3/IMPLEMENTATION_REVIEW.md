# Final implementation review

One independent review covered the approved Assessment 3 design, changes from the Assessment 2 baseline, and the executed verification evidence. It found no Critical issues, three Important issues and two Minor issues. All five findings were accepted and addressed in one fix pass.

| Finding                                                           | Change                                                                                          | Regression evidence                                                                                                  |
| ----------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| Report failure hid service health during database outage          | Fetch report, liveness and readiness independently; show checked time even when reporting fails | Report failure/readiness failure/liveness success unit fixture; browser outage scenario                              |
| Pending generation could restore stale HTML after a word mutation | Clear preview as reload begins and ignore responses from an older revision                      | Actual editor callback tests failed before the fix and pass after; both pending generation and failed reload covered |
| HTTP 200 alone did not verify generated content under load        | Require HTML doctype, distinct Wordle/Word Search element and saved word in generator response  | Real JMeter rejects both wrong-content HTTP 200 fixtures; all five measured stages rerun                             |
| Inventory omitted current totals per activity type                | Add Wordle/Word Search activity and word counts to reporting and dashboard                      | Report fixture before/after assertion                                                                                |
| React effect replay could create duplicate visits                 | Keep stable identity and cumulative duration for the same route entry                           | Setup/cleanup/setup timing fixture before/after assertion; atomic database replay remains covered                    |

The last two findings were treated as Important because they affect the promised reporting semantics. No review finding was deferred. Focused regressions and the complete 90-test suite, lint and production build passed after the changes.

The browser outage check initially matched both the application alert and Next.js's route announcer. Its locator was narrowed to the application error text while retaining the required visibility and health assertions. This was a test locator correction, not evidence that the outage behavior failed.

## Scope decisions

Authentication and abuse-resistant telemetry, distributed/multiple-writer deployment and large historical analytics scaling are outside this classroom, single-instance SQLite implementation. Revisit these assumptions before a broader deployment. The CSV's 20 recent events and all-time chart's 90-day window are explicitly labelled; totals still cover the full selected range. Deleted demonstration activities are not automatically restored by seeding. No nontransactional snapshot failure was demonstrated in the measured workload.

No unrelated generator refactor was introduced. Keyboard/click controls are covered; broader BFCache and touch-drag behavior was not claimed as verified. Pre-existing settings-save timing and download URL behavior produced no demonstrated introduced failure. These decisions avoid expanding the assessed feature scope; a changed deployment or interaction requirement would need separate implementation and verification.

The required personal video and official Assessment 3 AI acknowledgement remain student-owned submission actions. Automated browser screenshots and reports do not replace the walkthrough.
