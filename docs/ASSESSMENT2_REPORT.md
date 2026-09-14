# Assessment 2 Technical Report: Backend Implementation and Database Integration

**Student:** [Replace with your name]  
**Student ID:** [Replace with your student ID]  
**Project:** Phoneme Activity Builder  
**Approximate narrative word count:** 1,140 words (excluding references)

## Purpose and scope

This assessment extends my Assessment 1 Phoneme Activity Builder from a client-side prototype into a data-driven web application for Speech Pathology teachers and students. The first version could construct Wordle-style and Word Search activities in the browser, but its content was temporary. The Assessment 2 goal is therefore persistence: teachers can create several activity configurations, enter words with phoneme information, return later to edit their data, and generate classroom HTML from the saved records.

The application remains a Next.js project created with `npx create-next-app .`. I retained the existing Wordle, Word Search, About, and Settings pages so that the Assessment 1 interface is still visible. I added a **Saved Activities** workflow rather than replacing the original work. Next.js App Router route handlers provide server endpoints next to the user interface, which suits a small full-stack application because page and API code can be organised in the same project (Next.js, n.d.).

## Architecture and data design

The architecture has four separated responsibilities. React client components render teacher-facing forms and call HTTP endpoints with `fetch`. Next.js route handlers receive requests and return JSON or generated HTML. Reusable modules validate data, map errors, and construct safe HTML. Finally, Prisma Client persists data to SQLite. This separation means the browser does not import Prisma or access the database directly. It also makes validation and generator logic testable without a running browser.

Prisma is used as the ORM because it provides a schema for the relational model, a generated client, and database migrations. SQLite is appropriate for this assessment because it is lightweight and file-based, which reduces local setup while still supporting a relational schema. The database has an `Activity` table and a `Word` table. Activity stores an identifier, title, type (`WORDLE` or `WORD_SEARCH`), difficulty, optional teacher hint, grid size, maximum attempts, and timestamps. Word stores text, the phoneme string, optional hint, timestamps, and the foreign-key `activityId`.

The one-to-many relationship allows one activity to have several words. Foreign-key cascade deletion ensures that deleting an activity also removes its associated words. SQLite documents that foreign keys provide a way to enforce relationships between tables, and this model uses that mechanism to avoid orphan word records (SQLite Consortium, n.d.). A unique constraint across `activityId` and normalised `text` prevents the same word being entered twice in one activity while still allowing the word to be used in a different activity.

The phoneme field is a Unicode string rather than a single character or fixed-size symbol. It can therefore retain IPA sequences such as `/tʃ eə/`, `/ʃ ɪ p/`, or stressed multi-symbol forms. This matters because speech-related phonemes are not reliably representable as one English keyboard character.

## Backend and CRUD workflow

The API provides full CRUD operations. `GET /api/activities` returns all saved configurations with their words. `POST /api/activities` creates one configuration. A specific activity can be read, updated, or deleted through `/api/activities/:id`. Words are created under `/api/activities/:id/words`, then updated or deleted through `/api/words/:id`. The Saved Activities dashboard presents this workflow as normal teacher interactions: create a configuration, open it, add words and phonemes, edit settings, edit a word, or delete a record after confirmation.

Route handlers share a JSON reader, error formatter, and word normalisation service. For example, `  CHAIR ` is stored as `chair`, and optional blank hints become `null`.

Input validation is implemented with Zod schemas. Zod is a schema-validation library designed for JavaScript and TypeScript applications, and it supports parsing data before it reaches downstream code (Zod, n.d.). The activity schema requires a non-empty title, valid activity type and difficulty, a grid size from 8 to 20, and attempts from 3 to 10. The word schema requires letters A–Z for word text, non-empty phonemes up to 200 characters, and optional hints up to 240 characters. Positive numeric IDs are separately checked before a database lookup.

Clear error behaviour was planned as part of the backend rather than being added only in the interface. Malformed JSON, invalid values, invalid identifiers, and unsuitable generator input return HTTP 400. Missing activities or words return 404. Prisma duplicate-record errors are mapped to 409. Unexpected failures return a generic 500 response without exposing a server stack trace. The interface displays the returned message so a teacher can correct their data.

## Generation from stored data

The generation endpoint is `GET /api/activities/:id/generate`. It loads the saved Activity and its Words through Prisma, selects the correct generator using `activityType`, and returns a self-contained UTF-8 HTML attachment. This demonstrates that the output comes from database records, not only from a fixed front-end example.

For Wordle, the generator uses a stored target word, its phonemes and hint, and the saved maximum number of attempts. The downloaded page creates an accessible game board and checks correct, present, and absent letters. For Word Search, the generator places the stored words into a grid using the saved grid size, presents every word with its phonemes, and supports pointer-based selection. It returns a readable 400 error if no words are stored or if a word cannot fit in the configured grid.

Generated markup is treated as a security boundary. Text rendered as HTML is escaped and data embedded in a script uses safe JSON serialization. This prevents saved text such as angle brackets or a closing script sequence from changing the generated document. React also supports building interfaces from components and stateful interactions; the editor uses this approach for loading data, refreshing after a mutation, and showing success or failure feedback (Meta Open Source, n.d.).

## Quality assurance, Docker, and reflection

Automated tests cover validation, normalisation, health checking, client API error handling, and both generators. GitHub Actions runs Prisma generation and schema validation, linting, unit tests, a production build, Docker build, and a container smoke test. The smoke test checks both `/health` and the activity collection endpoint. `GET /health` returns `{"status":"ok"}` with HTTP 200.

The application is Dockerised with a Node 22 Alpine multi-stage Dockerfile. Multi-stage builds separate build dependencies from the runtime image, which Docker describes as a way to keep final images focused on the artefacts required to run an application (Docker, Inc., n.d.). At container startup, an entrypoint applies Prisma migrations before starting the standalone Next.js server. The SQLite file is stored at `/data/app.db`; mounting a named volume at `/data` means saved records survive a new container. This makes the project reproducible on another computer with Docker Desktop.

Overall, the design meets the assessment requirement to move from temporary front-end values to managed phoneme-based data. The main limitation is that SQLite is a single-file local database, so a later deployment stage could move to a managed database and add authentication, authorisation, and teacher accounts. Those features are deliberately outside this assessment’s scope. The current implementation provides a maintainable backend foundation: a documented schema, modular validation, controlled errors, test coverage, Docker execution, and a video script that maps every required demonstration to a concrete screen or command.

## References

Docker, Inc. (n.d.). *Multi-stage builds*. Docker Docs. Retrieved September 14, 2026, from https://docs.docker.com/build/building/multi-stage/

Meta Open Source. (n.d.). *React documentation*. Retrieved September 14, 2026, from https://react.dev/

Next.js. (n.d.). *Route handlers*. Next.js Documentation. Retrieved September 14, 2026, from https://nextjs.org/docs/app/building-your-application/routing/route-handlers

Prisma. (n.d.). *SQLite database connector*. Prisma Documentation. Retrieved September 14, 2026, from https://www.prisma.io/docs/orm/overview/databases/sqlite

SQLite Consortium. (n.d.). *SQLite foreign key support*. Retrieved September 14, 2026, from https://www.sqlite.org/foreignkeys.html

Zod. (n.d.). *Zod: TypeScript-first schema validation*. Retrieved September 14, 2026, from https://zod.dev/
