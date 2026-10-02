# Assessment 3 video walkthrough (about 6½ minutes)

The student must record this video personally. Keep your face visible and narrate throughout. Show your actual student ID within the first 30 seconds. Do not claim an unrecorded video exists. The source ZIP does not replace the required video.

## Preparation

1. Install dependencies, deploy migrations and seed labelled demonstration data using the README.
2. Open `/dashboard`, `/activities`, `/health`, GitHub's Assessment 3 branch and its latest completed Quality workflow.
3. Download/open the final testing artifacts or the evidence folder included in the submission archive. Use actual values in `TEST_RESULTS.md`.
4. Start screen recording with webcam and microphone. Avoid exposing passwords or unrelated personal information.

| Time | Show | Explain in your own words |
|---|---|---|
| 0:00–0:25 | Your face and actual student ID | Introduce yourself and the phoneme activity builder. State that Assessment 3 extends the saved backend from Assessment 2. |
| 0:25–1:20 | Dashboard source and period controls, summary cards, type comparison, chart/table | Explain current inventory versus historical creations; successes, failures, average visible time and the tied/no-data cases. Change to simulated data and point out its label. These examples are not classroom measurement. |
| 1:20–2:30 | Saved activities: create, add a word with `/tʃ eə/`, edit its phonemes/settings, refresh | The frontend calls Next.js route handlers, which validate and persist Prisma records in SQLite. Multi-character phonemes are Unicode strings. Refresh retrieves the saved records rather than temporary form values. |
| 2:30–3:30 | Preview and download both Wordle and Word Search; play one Wordle guess and select a Word Search word | Generation reads the database. The downloadable files work independently. Show Word Search keyboard start/end selection or mouse drag and Reset. A preview/download request adds a generation event; offline student gameplay does not report back. |
| 3:30–4:10 | Empty activity warning, failed request demonstration, recent operations, CSV | An empty list cannot generate an activity. Failure is recorded with a safe error category. Delete your demo activity and refresh reporting: inventory changes but event history remains. CSV uses the same filters. |
| 4:10–4:40 | `/health`, `/api/status`, persistence evidence and Docker workflow/run | `/health` is liveness and returns 200; readiness separately queries the database. Explain Docker's persistent volume. Show the recorded restart test and successful Docker job; if demonstrating locally, restart the same container with its volume. |
| 4:40–5:35 | Playwright HTML report and JMeter summaries/raw results | Show browser CRUD, generated gameplay and report checks. State the measured stage totals and the peak concurrency separately: 10,000 total users does not mean 10,000 simultaneous users. Explain p95 latency, throughput and errors using the actual results. |
| 5:35–6:10 | Lighthouse HTML/JSON results and accessibility correction | Show the actual before/after finding, final scores and keyboard gameplay. Lighthouse automated checks do not cover all accessibility needs. |
| 6:10–6:30 | GitHub homepage, branch/commits, references | Show the continuous development history, README and at least five sources. Mention the official AI acknowledgement you submit according to the unit's instructions. |

## 中文操作提醒

全程需要本人露脸和解说；开头 30 秒内展示学号。先练习操作，再一次录制或剪辑成 3–8 分钟。测试画面要打开真实报告，不能仅展示测试代码。提交前检查音频、画面、视频时长和 LMS 的文件要求。
