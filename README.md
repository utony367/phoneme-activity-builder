# Phoneme Activity Builder

A database-backed Wordle and Word Search builder for Speech Pathology teachers and students. This Assessment 2 version extends the Assessment 1 Next.js interface so teachers can save reusable activity settings, store words with IPA phonemes, edit or delete records, and generate self-contained HTML activities from the saved database data.

The project began with `npx create-next-app .` and uses the Next.js App Router, React, Prisma, SQLite, Zod, Vitest, and Docker.

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

| Layer | Responsibility | Main locations |
| --- | --- | --- |
| React user interface | Teacher forms, saved-activity dashboard, word manager, HTML preview/download | `app/activities`, `components/` |
| Next.js route handlers | HTTP CRUD, health, and generation endpoints | `app/api/`, `app/health/route.js` |
| Validation and service helpers | Zod schemas, typed API errors, safe IDs, client requests | `lib/validation.js`, `lib/api.js`, `lib/words.js`, `lib/client-api.js` |
| Generation | Escaped, self-contained Wordle and Word Search HTML | `lib/generators/`, `lib/html.js` |
| Persistence | Prisma Client over SQLite, migrations, relations | `prisma/` |
| Delivery and quality | Multi-stage Docker image and GitHub Actions checks | `Dockerfile`, `.github/workflows/quality.yml` |

Browser components call HTTP routes only; they do not import Prisma. Route handlers validate requests, call the Prisma data layer, and return JSON or a generated HTML response.

## Data model

| Entity | Stored fields | Relationship and purpose |
| --- | --- | --- |
| `Activity` | id, title, activityType, difficulty, hint, gridSize, maxAttempts, createdAt, updatedAt | One saved Wordle or Word Search configuration. |
| `Word` | id, text, phonemes, hint, activityId, createdAt, updatedAt | A word belongs to one Activity. IPA is a Unicode string, so multi-character phonemes are preserved. |

An Activity has many Words. `activityId + text` is unique, preventing duplicate words inside the same activity. Deleting an Activity cascades to its Words.

## Requirements

- Node.js 22 or later
- npm
- Docker Desktop (only for the container workflow)

## Run locally

```bash
git clone https://github.com/utony367/phoneme-activity-builder.git
cd phoneme-activity-builder
git checkout assessment-2-backend
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

| Method and route | Purpose | Success |
| --- | --- | --- |
| `GET /health` | Container/application health check | 200 `{"status":"ok"}` |
| `GET /api/activities` | List activities and their words | 200 |
| `POST /api/activities` | Create a saved configuration | 201 |
| `GET /api/activities/:id` | Read one configuration and its words | 200 |
| `PUT /api/activities/:id` | Update activity settings | 200 |
| `DELETE /api/activities/:id` | Delete activity and its words | 200 |
| `POST /api/activities/:id/words` | Add a word and phonemes | 201 |
| `PUT /api/words/:id` | Update a word | 200 |
| `DELETE /api/words/:id` | Delete a word | 200 |
| `GET /api/activities/:id/generate` | Download stored activity as HTML | 200 `text/html` |

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

| Situation | Response |
| --- | --- |
| Malformed JSON, invalid ID, invalid field, empty phonemes, invalid word text, or impossible generation input | 400 with `{"error":"…","details":…}` where applicable |
| Activity or Word does not exist | 404 with an error message |
| Duplicate word in the same Activity | 409 with an error message |
| Unexpected server failure | 500 with a generic error message; no stack trace is returned |

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
docker build -t phoneme-builder-assessment2 .
docker volume create phoneme-data
docker run --rm -d --name phoneme-a2 -p 3000:3000 \
  -v phoneme-data:/data phoneme-builder-assessment2
curl -i http://localhost:3000/health
docker stop phoneme-a2
```

Reusing `phoneme-data` preserves saved activities across replacement containers. To inspect the container logs, use `docker logs phoneme-a2`.

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

## Assessment 2 submission checklist

- [ ] Complete the unit's official AI acknowledgement form accurately.
- [ ] Run the quality commands above and confirm Docker `/health` returns 200.
- [ ] Submit a ZIP of the source code **without** `node_modules`, `.next`, `.env`, `*.db`, `*.db-wal`, or `*.db-shm`.
- [ ] Include this repository link: https://github.com/utony367/phoneme-activity-builder
- [ ] Include the required supporting documentation and references.

See the [Assessment report](docs/ASSESSMENT2_REPORT.md) and [references](docs/REFERENCES.md) before submitting.
