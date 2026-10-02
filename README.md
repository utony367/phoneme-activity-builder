# Phoneme Activity Builder

A database-backed Wordle and Word Search builder for Speech Pathology teachers and students. This Assessment 3 version extends the Assessment 1 Next.js interface so teachers can save reusable activity settings, store words with IPA phonemes, edit or delete records, and generate self-contained HTML activities from the saved database data.

The project began with `npx create-next-app .` and uses the Next.js App Router, React, Prisma, SQLite, Zod, Vitest, and Docker.

## Assessment 3: dashboard, reporting and evidence

Work from the `assessment-3-dashboard` branch. Assessment 1/2 builders and CRUD remain available.

- `/dashboard`: filtered live/simulated reports, generation history, current inventory with activity/word totals per type, UTC daily trend with data table, alerts and CSV export.
- `OperationEvent`: historical creation/generation outcomes and activity snapshots. Deleting an activity sets its event relation to null; its history stays visible.
- `PageVisit`: visible page time only. A stable route-entry key is upserted using an atomic maximum, so repeated delivery cannot add time twice. Each visit is capped at 30 minutes.
- `/api/status`: database readiness, separately from `/health` liveness. Both health signals have a check timestamp and remain visible if reporting fails.
- Labelled, idempotent `npm run seed:demo` fixtures support demonstration without presenting synthetic records as classroom usage.

### Windows PowerShell quick start (Node 22)

```powershell
npm ci
$env:DATABASE_URL = "file:./dev.db"
if (!(Test-Path prisma/dev.db)) { New-Item -ItemType File -Path prisma/dev.db | Out-Null }
npm run db:generate
npm run db:deploy
npm run seed:demo
npm run build
npm run start
```

The file-creation step runs only when the database is absent, preserving existing records. Open http://localhost:3000/dashboard and select **Simulated demonstration** to see seeded summaries. Live use is the default filter. Seed fixtures once; repeated seeding retains existing demo history rather than recreating deleted demo activities.

### Verification commands

```powershell
npm run lint
npm test
npm audit --omit=dev --audit-level=high
npm run build
npx playwright install chromium
npm run test:e2e
npm run test:persistence
npm run test:accessibility
```

Stop an existing local server before running Playwright because it starts its own production server. Browser tests and persistence checks use isolated databases, not your teacher database. Accessibility auditing requires an installed Chrome; if detection fails, set `$env:CHROME_PATH` to the Chrome executable. The browser and accessibility workflow runs on Ubuntu/Node 22 and uploads actual HTML/JSON reports, screenshots and traces.

For JMeter, install Apache JMeter 5.6.3 and Java 17. On Bash/WSL:

```bash
JMETER_BIN=/path/to/apache-jmeter-5.6.3/bin/jmeter \
node scripts/run-with-server.mjs bash testing/jmeter/run-stages.sh
```

The runner migrates a temporary database, waits for readiness and starts a production server on port 3001. Stages are **1, 10, 100, 1,000 and 10,000 total workflow users**, with at most **10 concurrent threads**, nine requests per user and one-second ramp per thread. This is a finite workload, not proof of 10,000 concurrent-user capacity. Generation assertions verify HTML structure, the activity-specific element and the saved word, in addition to HTTP2xx. A negative fixture check rejects incorrect HTTP200 outputs. Raw JTL and measured JSON summaries are produced; a missing/partial stage must be reported as incomplete. Use a fresh `OUTPUT` directory for each run.

### Reporting definitions

| Signal                   | Meaning                                                                                                                                                      |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Saved activities / words | Current inventory filtered by source, not creation date.                                                                                                     |
| Activities created       | Persisted creation events within the chosen time/source filter; includes later-deleted activities.                                                           |
| Generation attempts      | Preview/export API requests for known stored activities. Unknown/invalid IDs have no attributed activity type.                                               |
| Success rate             | Successful generations / all generation attempts; empty denominator displays “No data”.                                                                      |
| Most-used type           | Type with most generation attempts; ties are explicitly shown.                                                                                               |
| Average visible time     | Mean cumulative visible milliseconds for recorded page visits; includes zero-duration server fixtures, excludes hidden time, capped at 30 minutes per visit. |
| Source                   | Live operations or labelled simulated fixtures. Browser/load tests are real automated requests; they are not classroom student usage.                        |

Downloaded activities are self-contained and work offline; their gameplay is not tracked. CSV has the same filters, contains summary metrics and the most recent 20 operations, and neutralizes spreadsheet formula prefixes. UTC boundaries are inclusive; future events are excluded. All-time trends show the most recent 90 days while totals remain all-time.

See [test results](docs/assessment3/TEST_RESULTS.md), [video walkthrough](docs/assessment3/VIDEO_WALKTHROUGH.md), [references](docs/assessment3/REFERENCES.md) and [submission checklist](docs/assessment3/SUBMISSION_CHECKLIST.md). The required 3–8 minute face/voice/student-ID video and official AI acknowledgement must be completed by the student.

## What the application does

- Keeps the Assessment 1 Wordle, Word Search, About, and Settings pages available.
- Lets teachers create multiple saved **Wordle** or **Word Search** configurations.
- Stores words, Unicode/multi-character IPA phonemes (for example `/tʃ eə/`), and optional hints.
- Provides create, read, update, and delete (CRUD) actions for activities and words.
- Generates interactive, downloadable HTML from saved database records.
- Validates input before writing to the database and returns clear HTTP errors.
- Exposes `GET /health` for a simple 200 OK health check.
- Runs reproducibly in Docker with a named volume for the SQLite database.

## Architecture

| Layer                          | Responsibility                                                               | Main locations                                                         |
| ------------------------------ | ---------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| React user interface           | Teacher forms, saved-activity dashboard, word manager, HTML preview/download | `app/activities`, `components/`                                        |
| Next.js route handlers         | HTTP CRUD, health, and generation endpoints                                  | `app/api/`, `app/health/route.js`                                      |
| Validation and service helpers | Zod schemas, typed API errors, safe IDs, client requests                     | `lib/validation.js`, `lib/api.js`, `lib/words.js`, `lib/client-api.js` |
| Generation                     | Escaped, self-contained Wordle and Word Search HTML                          | `lib/generators/`, `lib/html.js`                                       |
| Persistence                    | Prisma Client over SQLite, migrations, relations                             | `prisma/`                                                              |
| Delivery and quality           | Multi-stage Docker image and GitHub Actions checks                           | `Dockerfile`, `.github/workflows/quality.yml`                          |

Browser components call HTTP routes only; they do not import Prisma. Route handlers validate requests, call the Prisma data layer, and return JSON or a generated HTML response.

## Data model

| Entity     | Stored fields                                                                          | Relationship and purpose                                                                            |
| ---------- | -------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `Activity` | id, title, activityType, difficulty, hint, gridSize, maxAttempts, createdAt, updatedAt | One saved Wordle or Word Search configuration.                                                      |
| `Word`     | id, text, phonemes, hint, activityId, createdAt, updatedAt                             | A word belongs to one Activity. IPA is a Unicode string, so multi-character phonemes are preserved. |

An Activity has many Words. `activityId + text` is unique, preventing duplicate words inside the same activity. Deleting an Activity cascades to its Words.

## Requirements

- Node.js 22 or later
- npm
- Docker Desktop (only for the container workflow)

## Run locally

```bash
git clone https://github.com/utony367/phoneme-activity-builder.git
cd phoneme-activity-builder
git checkout assessment-3-dashboard
cp .env.example .env
npm ci
npm run db:generate
npm run db:deploy
npm run dev
```

Open http://localhost:3000. The local `.env` uses `DATABASE_URL="file:./dev.db"`, so Prisma creates a local SQLite database. Do not commit `.env` or generated `.db` files.

For a development migration after intentionally changing the schema, use:

```bash
npm run db:migrate
```

## Verify health

With the development server running:

```bash
curl -i http://localhost:3000/health
```

Expected response:

```text
HTTP/1.1 200 OK
{"status":"ok"}
```

## API reference

| Method and route                   | Purpose                              | Success               |
| ---------------------------------- | ------------------------------------ | --------------------- |
| `GET /health`                      | Container/application health check   | 200 `{"status":"ok"}` |
| `GET /api/activities`              | List activities and their words      | 200                   |
| `POST /api/activities`             | Create a saved configuration         | 201                   |
| `GET /api/activities/:id`          | Read one configuration and its words | 200                   |
| `PUT /api/activities/:id`          | Update activity settings             | 200                   |
| `DELETE /api/activities/:id`       | Delete activity and its words        | 200                   |
| `POST /api/activities/:id/words`   | Add a word and phonemes              | 201                   |
| `PUT /api/words/:id`               | Update a word                        | 200                   |
| `DELETE /api/words/:id`            | Delete a word                        | 200                   |
| `GET /api/activities/:id/generate` | Download stored activity as HTML     | 200 `text/html`       |

Example activity request:

```json
{
  "title": "Short vowel Wordle",
  "activityType": "WORDLE",
  "difficulty": "EASY",
  "hint": "Practise short vowels",
  "gridSize": 12,
  "maxAttempts": 6
}
```

Example word request:

```json
{
  "text": "chair",
  "phonemes": "/tʃ eə/",
  "hint": "Furniture"
}
```

## Validation and error handling

All write requests are validated by Zod before Prisma is called.

| Situation                                                                                                    | Response                                                     |
| ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------ |
| Malformed JSON, invalid ID, invalid field, empty phonemes, invalid word text, or impossible generation input | 400 with `{"error":"…","details":…}` where applicable        |
| Activity or Word does not exist                                                                              | 404 with an error message                                    |
| Duplicate word in the same Activity                                                                          | 409 with an error message                                    |
| Unexpected server failure                                                                                    | 500 with a generic error message; no stack trace is returned |

Activity titles are 1–100 characters. Word text is normalized to lowercase and limited to A–Z letters; phonemes are required Unicode text up to 200 characters; optional hints are limited to 240 characters. HTML generators escape visible text and safely serialize embedded data before creating a downloadable file.

## Use the saved-activity workflow

1. Select **Saved Activities** in the navigation.
2. Create a Wordle or Word Search configuration.
3. Choose **Manage words**, then add the word text, phonemes, and optional hint.
4. Edit or delete activity settings and individual words as needed.
5. Select **Preview HTML** to inspect the generated activity, or **Download HTML** to save it for classroom use.

A Wordle uses the stored target word and `maxAttempts`. A Word Search uses all stored words and `gridSize`; it reports a clear error if a word cannot fit.

## Automated quality checks

```bash
npx prisma validate
npm run lint
npm test
npm run build
```

The GitHub Actions workflow runs the same validation, lint, tests, production build, Docker image build, container startup, `/health` check, and activity-list smoke check on pushes and pull requests.

It also runs `npm audit --omit=dev --audit-level=high` as a production-dependency gate. The audit reviewed on 14 September 2026 reported **0 production vulnerabilities**. The full development install reported three development-only advisories: one high advisory for transitive `js-yaml` and two moderate advisories for Vitest/@vitest-mocker. These packages are not copied into the production-only dependency stage; the available Vitest fix requires a major-version upgrade, so it is intentionally deferred for this assessment.

## Docker

The production Dockerfile uses Node 22 Alpine and a multi-stage build. At startup, `docker-entrypoint.sh` runs `prisma migrate deploy`, then starts the standalone Next.js server. The SQLite database is stored at `/data/app.db` inside a named Docker volume.

```bash
docker build -t phoneme-builder-assessment3 .
docker volume create phoneme-data
docker run --rm -d --name phoneme-a3 -p 3000:3000 \
  -v phoneme-data:/data phoneme-builder-assessment3
curl -i http://localhost:3000/health
docker stop phoneme-a3
```

Reusing `phoneme-data` preserves saved activities across replacement containers. To inspect the container logs, use `docker logs phoneme-a3`.

## Folder map

```text
app/                       Next.js pages and API route handlers
components/                React UI components
lib/                       Validation, persistence helpers, API helpers, generators
prisma/                    Prisma schema and SQLite migration
tests/                     Vitest unit tests
docs/                      Assessment report, references, design documentation
Dockerfile                 Production container definition
docker-entrypoint.sh       Migration then production startup
.github/workflows/         Quality and Docker smoke checks
```

## Assessment 3 submission checklist

Follow the [Assessment 3 submission checklist](docs/assessment3/SUBMISSION_CHECKLIST.md), [measured test results](docs/assessment3/TEST_RESULTS.md) and [references](docs/assessment3/REFERENCES.md). Submit the clean source ZIP and repository branch link, plus the required personal walkthrough video and official AI acknowledgement. Earlier Assessment 2 documentation remains in `docs/` for project continuity.
