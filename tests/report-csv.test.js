import { expect, test } from "vitest";
import { reportToCsv } from "../lib/report-csv.js";
test("CSV preserves quoted multiline IPA and neutralizes spreadsheet formulas", () => {
  const base = {
    filter: { source: "live", range: "all" },
    generatedAt: "2026-10-02",
    inventory: { total: 0 },
    operations: { created: 0, successes: 0, failures: 0, successRate: null },
    visits: { averageVisibleMs: null },
  };
  const titles = [
    "=1+1",
    "+cmd",
    "-cmd",
    "@cmd",
    " \t=cmd",
    'Teacher "quote"\n/tʃ eə/',
  ];
  const csv = reportToCsv({
    ...base,
    recentEvents: titles.map((title) => ({ title })),
  });
  for (const title of titles.slice(0, 5))
    expect(csv).toContain("\"'" + title + '"');
  expect(csv).toContain('Teacher ""quote""\n/tʃ eə/');
  expect(csv.startsWith("\uFEFF")).toBe(true);
});
