# Assessment 2 Video Walkthrough Script (6–8 minutes)

**Before recording:** replace every `STUDENT_ID` placeholder with your real student ID. Record with your face visible and your narration audible for the entire video. Do not say the video was completed before you record it.

## Recording plan

| Time | Screen/action | Suggested narration |
| --- | --- | --- |
| 0:00–0:25 | Face camera visible. Show a document or overlay containing **Student ID: STUDENT_ID**. Open the home page. | “My name is [name] and my student ID is STUDENT_ID. This is my Assessment 2 Phoneme Activity Builder for Speech Pathology teachers. I will show its database-backed CRUD workflow, both generated activities, the health endpoint, and Docker execution.” |
| 0:25–1:05 | Use the navigation to show existing Wordle and Word Search pages, then **Saved Activities**. | “The original Assessment 1 pages are still available. Assessment 2 adds Saved Activities, where teachers can persist configurations instead of losing browser-only values.” |
| 1:05–1:45 | Briefly open `prisma/schema.prisma` in the editor. Point to `Activity`, `Word`, `phonemes String`, `activityId`, the compound unique constraint, and cascade relation. | “Prisma maps a SQLite database with Activity and Word tables. An Activity has many Words. Phonemes are Unicode strings, so multi-character IPA such as slash-tesh-air slash can be stored. The unique constraint prevents duplicate words within one activity, and cascade delete removes its words with its activity.” |
| 1:45–2:35 | Return to Saved Activities. Create a **Wordle** activity: title “Short vowel practice”, Easy, hint, six attempts. Show it appearing in the saved list. | “This is the Create and Read part of CRUD. I am creating a Wordle configuration through the interface. The page sends a POST request to the Next.js backend and refreshes from the stored database data.” |
| 2:35–3:25 | Click **Manage words**. Add `chair` with `/tʃ eə/` and “Furniture”. Add a temporary word, then edit it (for example to `ship`, `/ʃ ɪ p/`, “Boat”) and delete it. | “This demonstrates word CRUD. The backend validates the word text and required phoneme string before Prisma writes to SQLite. I can edit a saved word and delete another one. The phoneme field accepts multi-character IPA rather than assuming one character per phoneme.” |
| 3:25–3:55 | Change the activity hint, difficulty, or maximum attempts and click **Save settings**. | “This is Update for the activity settings. Invalid values are rejected with a clear message, while valid changes remain when I reload the activity.” |
| 3:55–4:35 | Click **Preview HTML**, then **Download HTML** for the stored Wordle. Interact with the preview. | “Generation is server-side. The endpoint loads this saved activity and word from the database, then returns a self-contained HTML file. The Wordle uses the saved word, phonemes, hint, and maximum attempts.” |
| 4:35–5:25 | Return to dashboard. Create a **Word Search** activity; add several short stored words with phonemes. Preview and download it. | “I now create a second, independent Word Search configuration. Its generated grid uses the saved words and grid size. This proves the application supports multiple configurations and both output types from stored data.” |
| 5:25–5:45 | Delete a clearly temporary Activity from the saved list after confirming it. Do not delete the two examples you need to show. | “This is Delete for activity records. The database relationship also deletes any words belonging to that temporary activity.” |
| 5:45–6:10 | Browser address bar or terminal: `http://localhost:3000/health`. In browser DevTools Network, show status **200** if possible. | “The required health API returns status ok. Here the Network panel/browser response shows HTTP 200 OK for slash-health.” |
| 6:10–7:10 | Terminal: run the Docker commands below. Show successful build, running container, then `curl -i` output with 200. | “The production application is Dockerised. The entrypoint applies Prisma migrations before starting Next.js, and this named volume persists the SQLite file at slash-data.” |
| 7:10–7:35 | Show the app still opens at localhost and briefly recap. | “In summary, the frontend now communicates with a validated backend, multiple phoneme activity sets persist in SQLite, both HTML generators use saved data, health returns 200, and the project can run in Docker.” |

## Docker commands to type on screen

```bash
docker build -t phoneme-builder-assessment2 .
docker volume create phoneme-data
docker run --rm -d --name phoneme-a2 -p 3000:3000 \
  -v phoneme-data:/data phoneme-builder-assessment2
curl -i http://localhost:3000/health
docker stop phoneme-a2
```

Expected health body:

```json
{"status":"ok"}
```

## Final recording checklist

- [ ] Your face and narration are present throughout.
- [ ] Your real **STUDENT_ID** is visible before 0:30.
- [ ] You show Activity CRUD and Word CRUD, including a delete action.
- [ ] You show a multi-character phoneme value such as `/tʃ eə/`.
- [ ] You preview/download stored Wordle and Word Search outputs.
- [ ] You show `/health` returning **200 OK**.
- [ ] You show the Docker build, run command, named volume, and health result.
- [ ] Do not expose passwords, `.env` contents, or private files.
