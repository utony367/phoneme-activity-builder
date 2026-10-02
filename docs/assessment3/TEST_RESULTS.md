# Assessment 3 measured verification results

All results below come from executed tests, not proposed targets. Raw reports are in the evidence bundle and GitHub workflow artifacts. Values are environment-specific.

## Functional and persistence checks

- Unit/integration suite: 86 tests across 19 files, including original CRUD/generator tests, migration preservation, event deletion snapshots, real transaction rollback, boundary/source filters, atomic visit replay and CSV injection protection.
- Lint, production build, Prisma validation and high-severity production audit are checked in the Quality workflow. Next.js was updated from 16.3.5 to patched 16.3.8 after the audit detected GHSA-vcvr-r3jv-pc5j.
- Docker smoke checks actually build/start the non-root image, deploy migrations and check `/health` HTTP200 and activity retrieval. SQLite uses the named persistent volume.
- Persistence test stops and restarts the production server using the same SQLite file, retrieves Unicode word data, deletes the activity, then checks retained creation/generation history and activity404.
- Browser coverage: teacher CRUD and Unicode refresh; dirty settings retained across word edits; stale preview cleared; both HTML previews/downloads; Wordle win/reset; Word Search click/keyboard/mouse selection; live/simulated filters; CSV; readiness failure; desktop/mobile screenshots.

## JMeter: actual finite staged workload

Each workflow creates an activity, adds a word, reads saved data, generates Wordle, updates settings to Word Search, generates Word Search, updates the word, deletes the word and deletes the activity. This is nine requests per total user. Successful request assertions require HTTP2xx.

| Total users | Peak concurrent threads | Samples / expected | Errors | p95 (ms) | Throughput (requests/s) |
| ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | 1 | 9 / 9 | 0 | 59 | 58.44 |
| 10 | 10 | 90 / 90 | 0 | 13 | 10.05 |
| 100 | 10 | 900 / 900 | 0 | 7 | 98.33 |
| 1,000 | 10 | 9,000 / 9,000 | 0 | 14 | 617.24 |
| 10,000 | 10 | 90,000 / 90,000 | 0 | 32 | 621.14 |

All five stages completed. 10,000 refers to total finite workflows, **not** simultaneous users. These measurements establish behaviour under this workload on this host; they do not prove classroom traffic levels or cloud production capacity. See `evidence/load-environment.json` for versions and constraints. JTL records are the authority for counts, p95 and throughput. Successful deletes indicate each thread finished its workflow; the zero-error assertion also covers its preceding requests.

Preliminary attempts encountered connection separation and, later, SQLite extended error1032 (`attempt to write a readonly database` after the file moved) when testing in the interactive workspace. Those runs are not substituted for the completed stages above. Workload database and raw outputs were moved to dedicated OS temporary directories; all final stages were rerun from a fresh database. The Prisma SQLite connection pool is limited to one writer connection. Development audit/tooling runs were kept separate from the final production load build.

## Accessibility: measured before and after

Lighthouse13.0.3 audited the dashboard, saved activity editor and both generated outputs. The first four light-mode audits scored100. Adding the existing dark preference exposed a real dashboard contrast failure: dark-mode text on white metric cards and white CSV-link text on a pale blue background.

- Before fix: dark dashboard96; `color-contrast` failed (card contrast1.1:1; CSV link2.18:1).
- Change: metric cards use the theme surface variable; dark primary actions use dark readable text.
- Final audit values and workflow links are recorded in the final verification section below.

The generated Word Search also retains its button nodes while selecting and provides labelled row/column controls for keyboard start/end selection. Playwright tests keyboard gameplay and mouse selection. A Lighthouse score of100 covers its automated checks; it is not a claim of full WCAG conformance or a substitute for testing with users.

## Final verification

Final runner results will be added after the final branch checks finish. The earlier verified target runs are retained as evidence, but do not replace checks of the final code.
