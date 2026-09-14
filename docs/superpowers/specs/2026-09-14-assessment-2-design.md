# Assessment 2 Backend and Database Design

**Date:** 2026-09-14  
**Status:** Approved in chat; awaiting written-spec confirmation

## Context

The existing repository is a JavaScript Next.js 16 App Router project created from the Next.js starter. Assessment 1 already provides teacher-facing Wordle and Word Search builder pages, reusable components, phoneme data, and client-side downloadable HTML generators. Assessment 2 will preserve those features and add persistent storage, server routes, CRUD management, validation, health checking, tests, and Docker execution.

## Goal

Teachers can create and manage multiple saved Wordle or Word Search configurations, store words with multi-character phonemes and hints, reload and edit them, delete them, and generate downloadable activities from database records.

## Architecture

The existing React UI remains in `app` and `components`. New Next.js route handlers form the backend. Prisma provides the database abstraction over SQLite. Browser components call the API with `fetch`; they never access Prisma directly.

Framework-independent modules in `lib` own input validation, error formatting, and HTML escaping/generation. This keeps route handlers small and allows meaningful unit tests without a browser or live database.

## Data Model

### Activity

- `id`: auto-incrementing integer primary key
- `title`: required string, 1–100 characters
- `activityType`: `WORDLE` or `WORD_SEARCH`
- `difficulty`: `EASY`, `MEDIUM`, or `HARD`
- `hint`: optional string, maximum 240 characters
- `gridSize`: integer from 8 to 20; used by Word Search
- `maxAttempts`: integer from 3 to 10; used by Wordle
- `createdAt` and `updatedAt`
- one-to-many `words` relationship

### Word

- `id`: auto-incrementing integer primary key
- `text`: required string, normalized to lowercase
- `phonemes`: required Unicode string, maximum 200 characters
- `hint`: optional string, maximum 240 characters
- `activityId`: foreign key to Activity
- `createdAt` and `updatedAt`
- unique constraint on `activityId + text`
- cascade deletion with its Activity

Phonemes are ordinary Unicode strings, so values such as `/tʃ/`, `/ˈhæp.i/`, and space-separated phoneme sequences are supported.

## API

- `GET /health` returns HTTP 200 and `{"status":"ok"}`.
- `GET /api/activities` returns all configurations and their words.
- `POST /api/activities` validates and creates a configuration.
- `GET /api/activities/[id]` returns one configuration.
- `PUT /api/activities/[id]` validates and updates it.
- `DELETE /api/activities/[id]` deletes it and its words.
- `POST /api/activities/[id]/words` validates and creates a word.
- `PUT /api/words/[id]` validates and updates a word.
- `DELETE /api/words/[id]` deletes a word.
- `GET /api/activities/[id]/generate` loads saved data and returns a self-contained HTML attachment for the stored activity type.

## Frontend Integration

A new `/activities` dashboard provides Activity creation, listing, editing, opening, and deletion. A new `/activities/[id]` page manages the selected Activity and its Words. It shows stored settings, provides Word CRUD controls, and offers preview/download generation.

Existing `/wordle` and `/word-search` routes remain available so Assessment 1 continuity is visible. Navigation will add a Saved Activities entry.

## Validation and Errors

Zod schemas validate JSON before writes. API errors use `{ "error": "message", "details": ... }`.

- HTTP 400: malformed JSON, invalid ID, invalid field, or too few words to generate
- HTTP 404: missing Activity or Word
- HTTP 409: duplicate word inside one Activity
- HTTP 500: unexpected failure, without returning internal stack traces

Stored text is escaped before insertion into generated HTML to prevent markup injection.

## HTML Generation

The backend adapts the existing client-side Wordle and Word Search concepts to stored records.

- Wordle output selects a stored target, displays its hint, accepts guesses, marks correct/present/absent letters, and uses `maxAttempts`.
- Word Search output builds a grid sized by `gridSize`, inserts every stored word when possible, shows the word list and phonemes, and provides interactive selection.
- Generation fails clearly when no suitable stored words exist or when a word cannot fit the configured grid.
- Responses use `text/html; charset=utf-8` and `Content-Disposition: attachment`.

## Docker

A multi-stage Dockerfile uses Node 22 Alpine, installs dependencies, generates Prisma Client, builds Next.js, creates a writable `/app/data` folder, and runs as a non-root user. A startup script runs `prisma migrate deploy` before `next start`. Port 3000 is exposed. A Docker volume can persist the SQLite database.

`.dockerignore` excludes `node_modules`, `.next`, Git data, local databases, logs, videos, and environment files. The existing 78 MB demonstration video remains in GitHub but is excluded from the Docker build context and submission guidance.

## Testing and Verification

Vitest tests will be written before new implementation behavior. Tests cover:

- Activity and Word validation, including IPA and malformed inputs
- normalization and duplicate-safe values
- HTML escaping
- Wordle generation requirements and stored content
- Word Search placement and stored content
- health endpoint response

A GitHub Actions workflow will run dependency installation, Prisma generation and validation, lint, unit tests, and `next build`. Docker configuration will also be checked through documented local commands; a Docker build workflow may be added if CI capacity permits.

## Documentation and Submission

The README will include setup, environment configuration, migration, CRUD routes, local and Docker commands, tests, troubleshooting, and a rubric-aligned video sequence. It will include at least five official industry references formatted in APA 7 and an AI acknowledgement template that the student must personalize.

The final project must be downloaded without `node_modules`, `.next`, local database files, or secrets.

## Acceptance Criteria

- Existing Assessment 1 pages remain functional.
- Activity and Word CRUD are available through both API and UI.
- Multiple configurations persist in SQLite through Prisma.
- Both HTML outputs are generated from saved records.
- Validation and documented error responses are present.
- `GET /health` returns 200.
- Docker files and reproducible commands are present.
- Automated checks cover validation and generators.
- README maps all assessment requirements to video steps.
