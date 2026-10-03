# Assessment 3 measured verification results

All results below come from executed tests, not proposed targets. Raw reports are in the evidence bundle and GitHub workflow artifacts. Values are environment-specific.

## Functional and persistence checks

- Unit/integration suite: 90 tests across 22 files, including original CRUD/generator tests, migration preservation, event deletion snapshots, real transaction rollback, boundary/source filters, atomic visit replay and CSV injection protection.
- Lint, production build, Prisma validation and high-severity production audit are checked in the Quality workflow. Next.js was updated from 16.3.5 to patched 16.3.8 after the audit detected GHSA-vcvr-r3jv-pc5j.
- Docker smoke checks actually build/start the non-root image, deploy migrations and check `/health` HTTP200 and activity retrieval. SQLite uses the named persistent volume.
- Persistence test stops and restarts the production server using the same SQLite file, retrieves Unicode word data, deletes the activity, then checks retained creation/generation history and activity404.
- Browser coverage: teacher CRUD and Unicode refresh; dirty settings retained across word edits; stale preview cleared; both HTML previews/downloads; Wordle win/reset; Word Search click/keyboard/mouse selection; live/simulated filters; CSV; readiness failure; desktop/mobile screenshots.

## JMeter: actual finite staged workload

Primary measurements below are from Node22 Ubuntu GitHub run37044474919, revision146ccf9733b48041fe844f68e044ab92dcb870f4. The supplementary Node24 local run also completed all five stages with zero errors; its summaries are retained separately.

Each workflow creates an activity, adds a word, reads saved data, generates Wordle, updates settings to Word Search, generates Word Search, updates the word, deletes the word and deletes the activity. This is nine requests per total user. Successful request assertions require HTTP2xx. Generation responses also require the HTML doctype, activity-specific board/grid element and stored word. A real JMeter negative fixture proves both wrong-content HTTP200 outputs fail.

| Total users | Peak concurrent threads | Samples / expected | Errors | p95 (ms) | Throughput (requests/s) |
| ----------: | ----------------------: | -----------------: | -----: | -------: | ----------------------: |
|           1 |                       1 |              9 / 9 |      0 |       28 |                   96.77 |
|          10 |                      10 |            90 / 90 |      0 |        6 |                   10.01 |
|         100 |                      10 |          900 / 900 |      0 |        4 |                   98.10 |
|       1,000 |                      10 |      9,000 / 9,000 |      0 |       11 |                  691.88 |
|      10,000 |                      10 |    90,000 / 90,000 |      0 |       24 |                  730.74 |

All five stages completed. 10,000 refers to total finite workflows, **not** simultaneous users. These measurements establish behaviour under this workload on this host; they do not prove classroom traffic levels or cloud production capacity. See `evidence/node22-load-environment.json` for primary versions and constraints, and `evidence/load-environment.json` for the supplementary local environment. JTL records are the authority for counts, p95 and throughput. Successful deletes indicate each thread finished its workflow; the zero-error assertion also covers its preceding requests.

Preliminary attempts encountered connection separation and, later, SQLite extended error1032 (`attempt to write a readonly database` after the file moved) when testing in the interactive workspace. Those runs are not substituted for the completed stages above. Workload database and raw outputs were moved to dedicated OS temporary directories; all final stages were rerun from a fresh database. The Prisma SQLite connection pool is limited to one writer connection. Development audit/tooling runs were kept separate from the final production load build.

## Accessibility: measured before and after

Lighthouse13.0.3 audited the dashboard, saved activity editor and both generated outputs. The first four light-mode audits scored100. Adding the existing dark preference exposed a real dashboard contrast failure: dark-mode text on white metric cards and white CSV-link text on a pale blue background.

- Before fix: dark dashboard96; `color-contrast` failed (card contrast1.1:1; CSV link2.18:1).
- Change: metric cards use the theme surface variable; dark primary actions use dark readable text.
- Final audit values and workflow links are recorded in the final verification section below.

The generated Word Search also retains its button nodes while selecting and provides labelled row/column controls for keyboard start/end selection. Playwright tests keyboard gameplay and mouse selection. A Lighthouse score of100 covers its automated checks; it is not a claim of full WCAG conformance or a substitute for testing with users.

## Final verification

Verified product revision: `146ccf9733b48041fe844f68e044ab92dcb870f4`.

- GitHub Quality run [37044474919](https://github.com/utony367/phoneme-activity-builder/actions/runs/37044474919): **quality, Docker, browser/accessibility and JMeter all passed**.
- Node22 production browser suite: **6/6 passed**; restart persistence passed, including the new shared database outage display scenario.
- Lighthouse final: **dashboard100, builder100, Wordle100, Word Search100, dark dashboard100**. Dark dashboard improved from96 to100 after the measured color correction.
- Unit/integration tests: **90/90 passed** across22 files; lint/build/Prisma validation and high-severity production audit passed. Production audit reports0 vulnerabilities.
- All five Node22 JMeter stages completed with0 errors; generation content assertions and the negative HTTP200 fixture check both passed.
- Final raw JTL/HTML load reports, HTML/JSON audits, Playwright reports and desktop/mobile screenshots are retained in the downloadable evidence bundle. Before-fix dark-mode JSON/HTML is included for comparison.

The final documentation-only commit preserves this verified application and test code. See [implementation review](IMPLEMENTATION_REVIEW.md) for findings, fixes and scope decisions. The initial outage browser failure was an ambiguous test alert locator; it was narrowed and the complete browser suite rerun successfully.
