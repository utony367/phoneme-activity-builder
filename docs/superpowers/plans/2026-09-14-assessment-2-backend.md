# Assessment 2 Backend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extend the existing Assessment 1 Next.js builder with persistent Activity and Word CRUD, server-generated Wordle and Word Search downloads, validation, health checking, Docker execution, automated checks, and submission documentation.

**Architecture:** Preserve the existing JavaScript App Router frontend and generator utilities. Add a Prisma/SQLite persistence boundary, focused validation and generation modules, Next.js route handlers, and a new saved-activities UI that communicates only through HTTP APIs.

**Tech Stack:** Next.js 16.3, React 19.2, JavaScript, Prisma 6.19, SQLite, Zod 3.25, Vitest 3.2, ESLint 9, Node 22, Docker, GitHub Actions.

**Spec:** `docs/superpowers/specs/2026-09-14-assessment-2-design.md`

## Global Constraints

- Preserve the existing `/wordle`, `/word-search`, `/about`, and `/settings` Assessment 1 routes.
- Store multi-character IPA values as Unicode strings.
- Browser components must access persisted data through APIs and never import Prisma.
- API errors use `{ error: string, details?: object }` with HTTP 400, 404, 409, or 500.
- Generated files are self-contained UTF-8 HTML and consume saved database records.
- Docker runs on port 3000, applies migrations before startup, and supports persistent SQLite storage.
- Do not commit `node_modules`, `.next`, environment secrets, or SQLite runtime databases.
- New behavior follows red-green-refactor: create a failing test commit/run before implementation.

---

### Task 1: Test Harness, Prisma Schema, and Validation

**Files:**
- Modify: `package.json`
- Create: `vitest.config.mjs`
- Create: `.env.example`
- Create: `prisma/schema.prisma`
- Create: `prisma/migrations/202609140001_init/migration.sql`
- Create: `lib/prisma.js`
- Create: `lib/validation.js`
- Create: `tests/validation.test.js`
- Create: `.github/workflows/quality.yml`

**Interfaces:**
- Produces: `activitySchema`, `wordSchema`, `parsePositiveId(value)`, and singleton `prisma`.
- Consumes: no new project interfaces.

- [ ] **Step 1: Add dependency and test scripts**

Update `package.json` to include:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint",
    "test": "vitest run",
    "test:watch": "vitest",
    "db:generate": "prisma generate",
    "db:migrate": "prisma migrate dev",
    "db:deploy": "prisma migrate deploy",
    "db:studio": "prisma studio"
  },
  "dependencies": {
    "@prisma/client": "6.19.0",
    "next": "16.3.0",
    "react": "19.2.8",
    "react-dom": "19.2.8",
    "zod": "3.25.76"
  },
  "devDependencies": {
    "eslint": "^9",
    "eslint-config-next": "16.3.0",
    "prisma": "6.19.0",
    "vitest": "3.2.4"
  }
}
```

Use `npm install` locally because the existing lockfile predates these dependencies; commit the regenerated `package-lock.json`.

- [ ] **Step 2: Write failing validation tests**

Create tests that import the wished-for interface and assert:

```js
import { describe, expect, it } from "vitest";
import { activitySchema, parsePositiveId, wordSchema } from "../lib/validation.js";

it("accepts a multi-character IPA phoneme", () => {
  const result = wordSchema.safeParse({ text: "chair", phonemes: "/tʃ eə/", hint: "Furniture" });
  expect(result.success).toBe(true);
  expect(result.data.text).toBe("chair");
});

it("normalizes a word and rejects an empty phoneme", () => {
  expect(wordSchema.parse({ text: "  APPLE ", phonemes: "/æ p əl/" }).text).toBe("apple");
  expect(wordSchema.safeParse({ text: "cat", phonemes: " " }).success).toBe(false);
});

it("validates activity settings and positive IDs", () => {
  expect(activitySchema.safeParse({
    title: "Short vowels",
    activityType: "WORDLE",
    difficulty: "EASY",
    gridSize: 10,
    maxAttempts: 6
  }).success).toBe(true);
  expect(parsePositiveId("2")).toBe(2);
  expect(() => parsePositiveId("0")).toThrow("Invalid ID");
});
```

- [ ] **Step 3: Run the validation test and verify RED**

Run: `npm test -- tests/validation.test.js`  
Expected: FAIL because `lib/validation.js` does not exist.

- [ ] **Step 4: Add the Prisma schema and migration**

Define `ActivityType`, `Difficulty`, `Activity`, and `Word` exactly as the approved design. Use `url = env("DATABASE_URL")`, the compound unique constraint `@@unique([activityId, text])`, and `onDelete: Cascade`.

The SQL migration creates `Activity` and `Word`, foreign-key cascade behavior, and a unique index for activity-word pairs.

- [ ] **Step 5: Implement validation and Prisma singleton**

`activitySchema` trims fields, applies string bounds, defaults `gridSize` to 12 and `maxAttempts` to 6, and enforces the enum values. `wordSchema` trims Unicode strings, lowercases `text`, rejects empty values, and limits lengths. `parsePositiveId` accepts only positive base-10 integer strings.

`lib/prisma.js` stores the client on `globalThis` outside production to prevent hot-reload connection multiplication.

- [ ] **Step 6: Run focused and full checks**

Run:
- `npx prisma validate`
- `npm test -- tests/validation.test.js`
- `npm run lint`

Expected: all exit 0.

- [ ] **Step 7: Add CI and commit**

The workflow uses Node 22, `npm install`, `npx prisma generate`, `npx prisma validate`, `npm run lint`, `npm test`, and `npm run build` with `DATABASE_URL=file:./test.db`.

Commit: `feat: add Prisma schema and validated data model`.

### Task 2: Health and Activity CRUD API

**Files:**
- Create: `lib/api.js`
- Create: `app/health/route.js`
- Create: `app/api/activities/route.js`
- Create: `app/api/activities/[id]/route.js`
- Create: `tests/api-helpers.test.js`
- Create: `tests/health.test.js`

**Interfaces:**
- Consumes: `activitySchema`, `parsePositiveId`, `prisma`.
- Produces: `readJson(request, schema)`, `apiError(error)`, and Activity CRUD HTTP endpoints.

- [ ] **Step 1: Write failing health and API-helper tests**

Assert that `GET()` from `app/health/route.js` returns status 200 and body `{ status: "ok" }`. Assert that `readJson` returns normalized validated data for a Request and throws a typed 400 error for malformed JSON or validation failure.

- [ ] **Step 2: Run tests and verify RED**

Run: `npm test -- tests/api-helpers.test.js tests/health.test.js`  
Expected: FAIL because the route and helpers do not exist.

- [ ] **Step 3: Implement health and shared error helpers**

`readJson` catches JSON syntax errors separately from Zod errors. `apiError` maps typed status errors, Prisma unique constraint code `P2002` to 409, Prisma missing record code `P2025` to 404, and all other errors to a generic 500 response.

- [ ] **Step 4: Run focused tests and verify GREEN**

Run: `npm test -- tests/api-helpers.test.js tests/health.test.js`  
Expected: PASS.

- [ ] **Step 5: Implement Activity collection route**

`GET` calls `prisma.activity.findMany({ include: { words: true }, orderBy: { updatedAt: "desc" } })`. `POST` reads validated JSON, creates the record, and returns status 201.

- [ ] **Step 6: Implement Activity item route**

Each handler awaits `params`, validates the ID, and:
- `GET`: `findUnique({ include: { words: true } })`, returning 404 when absent.
- `PUT`: validates the complete Activity body and updates the record.
- `DELETE`: deletes the Activity and returns `{ success: true }`.

- [ ] **Step 7: Run all checks and commit**

Run: `npm test && npm run lint && npm run build` with `DATABASE_URL=file:./dev.db`.  
Expected: all exit 0.

Commit: `feat: add health and activity CRUD routes`.

### Task 3: Word CRUD API

**Files:**
- Create: `app/api/activities/[id]/words/route.js`
- Create: `app/api/words/[id]/route.js`
- Create: `tests/word-service.test.js`
- Create: `lib/words.js`

**Interfaces:**
- Consumes: `wordSchema`, `parsePositiveId`, `readJson`, `apiError`, `prisma`.
- Produces: `createWordData(activityId, input)`, `updateWordData(input)`, and Word CRUD endpoints.

- [ ] **Step 1: Write failing Word service tests**

Assert that:

```js
expect(createWordData(4, { text: " CHAIR ", phonemes: "/tʃ eə/" })).toEqual({
  activityId: 4,
  text: "chair",
  phonemes: "/tʃ eə/",
  hint: null
});
expect(updateWordData({ text: "ship", phonemes: "/ʃ ɪ p/", hint: "Boat" }))
  .toEqual({ text: "ship", phonemes: "/ʃ ɪ p/", hint: "Boat" });
```

Also assert invalid phonemes throw a validation error.

- [ ] **Step 2: Run focused test and verify RED**

Run: `npm test -- tests/word-service.test.js`  
Expected: FAIL because `lib/words.js` does not exist.

- [ ] **Step 3: Implement Word service mapping**

Both functions parse with `wordSchema`; optional empty hints become `null`. The create mapper attaches the validated integer Activity ID.

- [ ] **Step 4: Run focused test and verify GREEN**

Run: `npm test -- tests/word-service.test.js`  
Expected: PASS.

- [ ] **Step 5: Implement Word routes**

POST first verifies the parent Activity exists, then creates a Word. PUT validates and updates. DELETE removes the record. Route errors pass through `apiError`, so duplicates return 409 and missing records return 404.

- [ ] **Step 6: Run all checks and commit**

Run: `npm test && npm run lint && npm run build`.  
Expected: all exit 0.

Commit: `feat: add word CRUD routes`.

### Task 4: Server-Side Activity Generators

**Files:**
- Create: `lib/html.js`
- Create: `lib/generators/wordle.js`
- Create: `lib/generators/word-search.js`
- Create: `lib/generators/index.js`
- Create: `app/api/activities/[id]/generate/route.js`
- Create: `tests/generators.test.js`

**Interfaces:**
- Consumes: Activity objects shaped as `{ title, activityType, difficulty, hint, gridSize, maxAttempts, words }`.
- Produces: `escapeHtml(value)`, `generateWordleHtml(activity)`, `generateWordSearchHtml(activity)`, and `generateActivityHtml(activity)`.

- [ ] **Step 1: Write failing generator tests**

Use saved-record-shaped fixtures. Assert:

- `escapeHtml("<script>alert(1)</script>")` contains no raw `<script>`.
- Wordle HTML includes the title, stored word, phonemes, max attempts, interactive script, and `<!doctype html>`.
- Wordle with no valid words throws `At least one word is required`.
- Word Search HTML includes every stored word and phoneme.
- A word longer than `gridSize` throws `cannot fit in the grid`.
- Stored `</script>` text cannot terminate the generated script block.

- [ ] **Step 2: Run generator tests and verify RED**

Run: `npm test -- tests/generators.test.js`  
Expected: FAIL because server generator modules do not exist.

- [ ] **Step 3: Implement HTML safety utilities**

`escapeHtml` replaces ampersand, angle brackets, quotes, and apostrophes. `safeJson` serializes data and escapes `<`, `>`, `&`, U+2028, and U+2029 before embedding it in a script.

- [ ] **Step 4: Implement Wordle generator**

Generate one self-contained document with accessible instructions, hint/phoneme display, rows, keyboard input, duplicate-letter-aware scoring, success/failure messages, and the saved `maxAttempts`.

- [ ] **Step 5: Implement Word Search generator**

Place words horizontally, vertically, or diagonally into a deterministic grid, fill remaining cells, render a word bank with phonemes, and include pointer-based start/end selection. Throw a descriptive error if placement cannot succeed.

- [ ] **Step 6: Implement dispatcher and download route**

The dispatcher chooses by `activityType`. The route loads Activity with Words, returns 404 if absent, converts generation input errors to 400, and returns HTML with a sanitized filename in `Content-Disposition`.

- [ ] **Step 7: Run all checks and commit**

Run: `npm test && npm run lint && npm run build`.  
Expected: all exit 0.

Commit: `feat: generate activities from saved database records`.

### Task 5: Saved Activities User Interface

**Files:**
- Create: `app/activities/page.js`
- Create: `app/activities/[id]/page.js`
- Create: `components/ActivityDashboard.js`
- Create: `components/ActivityEditor.js`
- Create: `components/WordManager.js`
- Create: `components/StatusMessage.js`
- Modify: `components/Navbar.js`
- Modify: `app/globals.css`

**Interfaces:**
- Consumes: Activity and Word CRUD endpoints plus generation endpoint.
- Produces: teacher-facing CRUD and generation workflow.

- [ ] **Step 1: Add testable UI data helpers**

Create `lib/client-api.js` with `requestJson(url, options)` and `downloadActivity(id, title)`. Add `tests/client-api.test.js` that verifies non-OK JSON responses become Error objects with the server message and safe filenames remove path/control characters.

- [ ] **Step 2: Run the client helper test and verify RED**

Run: `npm test -- tests/client-api.test.js`  
Expected: FAIL because `lib/client-api.js` does not exist.

- [ ] **Step 3: Implement client API helpers and verify GREEN**

Run: `npm test -- tests/client-api.test.js`.  
Expected: PASS.

- [ ] **Step 4: Build Activity dashboard**

The client component fetches `/api/activities`, renders loading/empty/error states, creates records through a validated form, edits records in place, requires confirmation before deletion, and links each record to `/activities/[id]`.

- [ ] **Step 5: Build Activity detail and Word manager**

The detail page provides the ID to a client editor. The editor loads the full record. `WordManager` supports create, edit, cancel, and confirmed delete with text, phonemes, and hint fields. Successful mutations refresh displayed persisted data.

- [ ] **Step 6: Connect generation**

Provide Preview and Download actions. Preview opens the generation route in a new tab; Download uses the attachment endpoint. Disable generation while no words are stored and show the returned server error when generation fails.

- [ ] **Step 7: Preserve and update navigation/styles**

Add `Saved Activities` to the existing Navbar without removing Assessment 1 links. Extend existing CSS tokens and responsive rules; do not rewrite unrelated visual styling.

- [ ] **Step 8: Run all checks and commit**

Run: `npm test && npm run lint && npm run build`.  
Expected: all exit 0.

Commit: `feat: add saved activity management interface`.

### Task 6: Docker Runtime

**Files:**
- Create: `Dockerfile`
- Create: `.dockerignore`
- Create: `docker-entrypoint.sh`
- Modify: `next.config.mjs`
- Modify: `.gitignore`

**Interfaces:**
- Consumes: Prisma migration, Next.js production build, `DATABASE_URL`.
- Produces: container listening on port 3000 with persistent `/app/data/app.db`.

- [ ] **Step 1: Configure standalone Next.js output**

Set `output: "standalone"` in `next.config.mjs`.

- [ ] **Step 2: Write multi-stage Dockerfile**

Use `node:22-alpine` dependency, build, and runtime stages. Install OpenSSL compatibility required by Prisma, run `prisma generate` and `next build`, copy standalone output, static assets, public files, Prisma schema/migrations, Prisma CLI/runtime modules, and entrypoint. Create a non-root `nextjs` user and writable data directory.

- [ ] **Step 3: Add startup and ignore rules**

The executable entrypoint runs `npx prisma migrate deploy` and then `node server.js`. Default `DATABASE_URL` is `file:/app/data/app.db`. Exclude the 78 MB assessment video from Docker context while preserving it in the repository.

- [ ] **Step 4: Verify Docker locally**

Run:
- `docker build -t phoneme-builder-assessment2 .`
- `docker run --rm -d --name phoneme-a2 -p 3000:3000 -v phoneme-data:/app/data phoneme-builder-assessment2`
- `curl -i http://localhost:3000/health`
- `docker stop phoneme-a2`

Expected: build succeeds; health response is HTTP 200 with `{"status":"ok"}`.

- [ ] **Step 5: Commit**

Commit: `build: add reproducible Docker runtime`.

### Task 7: Submission Documentation and Final Verification

**Files:**
- Modify: `README.md`
- Create: `docs/VIDEO-WALKTHROUGH.md`
- Create: `docs/AI-ACKNOWLEDGEMENT.md`
- Create: `docs/REFERENCES.md`

**Interfaces:**
- Consumes: completed routes, UI, test commands, and Docker workflow.
- Produces: rubric-aligned submission instructions.

- [ ] **Step 1: Rewrite README**

Document prerequisites, `.env` creation, `npm install`, `npx prisma migrate dev`, `npm run dev`, API table, example CRUD payloads, test/build commands, Docker commands, database persistence, troubleshooting, and zip exclusions.

- [ ] **Step 2: Write video walkthrough**

Provide a 6–8 minute script in this exact order: student ID in first 30 seconds; face and narration; architecture; Prisma schema; create/read/update/delete Activity; create/read/update/delete Word; Wordle generation; Word Search generation; `/health` Network status 200; Docker build/run; final recap.

- [ ] **Step 3: Add acknowledgement and APA 7 references**

The acknowledgement identifies AI-supported planning, code suggestions, validation review, and documentation while requiring the student to replace bracketed personal-use statements before submission.

The references document contains at least these official industry sources in APA 7 format: Docker documentation, Next.js documentation, Prisma documentation, React documentation, SQLite documentation, and Zod documentation.

- [ ] **Step 4: Run final verification**

Run:
- `npx prisma validate`
- `npm run lint`
- `npm test`
- `npm run build`
- Docker build/run/health sequence from Task 6
- `git status --short`

Expected: all commands exit 0; health returns 200; no generated databases, secrets, `node_modules`, or `.next` files are tracked.

- [ ] **Step 5: Review requirements line by line**

Confirm each assessment instruction maps to code or a specific video step: Next.js origin, backend, Docker, schema, phoneme storage, multiple configurations, CRUD demonstration, two generators, validation/errors, student ID/face/narration, `/health` 200, Docker run, zip/GitHub submission, code quality, five references, and AI acknowledgement.

- [ ] **Step 6: Commit and open PR**

Commit: `docs: add Assessment 2 submission guide`.

Open a pull request from `assessment-2-backend` to `main` titled `Complete Assessment 2 backend and database integration`. Do not merge until CI is green and the student has reviewed the demonstration flow.
