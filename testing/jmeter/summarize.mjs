import { readFileSync } from "node:fs";
export function summarize(text, users, concurrency) {
  const [header, ...lines] = text.trim().split(/\r?\n/);
  const names = header.split(",");
  // JMeter labels contain no commas; CSV response messages are intentionally omitted in this plan.
  const rows = lines.filter(Boolean).map((line) => {
    const values = line
      .match(/("(?:[^"]|"")*"|[^,]*)(,|$)/g)
      .map((v) => v.replace(/,$/, "").replace(/^"|"$/g, ""));
    return Object.fromEntries(names.map((n, i) => [n, values[i]]));
  });
  const timings = rows.map((r) => Number(r.elapsed)).sort((a, b) => a - b);
  const errors = rows.filter((r) => r.success !== "true").length;
  const start = Math.min(...rows.map((r) => Number(r.timeStamp))),
    end = Math.max(...rows.map((r) => Number(r.timeStamp) + Number(r.elapsed)));
  return {
    totalUsers: Number(users),
    peakConcurrency: Number(concurrency),
    expectedRequests: Number(users) * 9,
    samples: rows.length,
    completedUsers: rows.filter((r) => r.label === "Delete activity").length,
    errors,
    errorRate: rows.length ? errors / rows.length : null,
    p95Ms: timings.length
      ? timings[Math.ceil(timings.length * 0.95) - 1]
      : null,
    throughputPerSecond:
      rows.length && end > start ? rows.length / ((end - start) / 1000) : null,
    complete: rows.length === Number(users) * 9,
  };
}
if (process.argv[2])
  console.log(
    JSON.stringify(
      summarize(
        readFileSync(process.argv[2], "utf8"),
        process.argv[3],
        process.argv[4],
      ),
      null,
      2,
    ),
  );
