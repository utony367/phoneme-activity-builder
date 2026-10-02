import { expect, test, vi } from "vitest";
import { getReport, parseReportFilters } from "../lib/reporting.js";
import { reportToCsv } from "../lib/report-csv.js";
const now = new Date("2026-10-02T12:00:00Z");
const event = (type, outcome) => ({
  eventType: "GENERATION",
  activityType: type,
  outcome,
  occurredAt: now,
  activityTitle: "=SUM(1,2)",
  source: "LIVE",
});
test("empty denominators have explicit no data", async () => {
  const db = {
    activity: { findMany: vi.fn().mockResolvedValue([]) },
    operationEvent: { findMany: vi.fn().mockResolvedValue([]) },
    pageVisit: { findMany: vi.fn().mockResolvedValue([]) },
  };
  const r = await getReport(
    db,
    parseReportFilters(new URLSearchParams(), now),
    now,
  );
  expect(r.operations.successRate).toBeNull();
  expect(r.visits.averageVisibleMs).toBeNull();
  expect(r.mostUsedType.types).toEqual([]);
});
test("report separates inventory, historical operations and ties", async () => {
  const db = {
    activity: {
      findMany: vi
        .fn()
        .mockResolvedValue([
          { id: 1, title: "Empty", activityType: "WORDLE", words: [] },
        ]),
    },
    operationEvent: {
      findMany: vi
        .fn()
        .mockResolvedValue([
          event("WORDLE", "SUCCESS"),
          event("WORD_SEARCH", "FAILURE"),
        ]),
    },
    pageVisit: {
      findMany: vi
        .fn()
        .mockResolvedValue([
          { visibleDurationMs: 100 },
          { visibleDurationMs: 300 },
        ]),
    },
  };
  const r = await getReport(
    db,
    parseReportFilters(new URLSearchParams("source=all"), now),
    now,
  );
  expect(r.operations.successRate).toBe(0.5);
  expect(r.operations.created).toBe(0);
  expect(r.inventory.total).toBe(1);
  expect(r.inventory.byType).toEqual([
    { type: "WORDLE", activities: 1, words: 0 },
    { type: "WORD_SEARCH", activities: 0, words: 0 },
  ]);
  expect(r.visits.averageVisibleMs).toBe(200);
  expect(r.mostUsedType.types).toHaveLength(2);
  expect(r.alerts.length).toBe(2);
  expect(reportToCsv(r)).toContain("'=SUM(1,2)");
});
test("filters reject unsupported values and use inclusive UTC boundaries", () => {
  expect(() =>
    parseReportFilters(new URLSearchParams("range=bad"), now),
  ).toThrow();
  expect(() =>
    parseReportFilters(new URLSearchParams("source=bad"), now),
  ).toThrow();
  expect(
    parseReportFilters(
      new URLSearchParams("range=24h"),
      now,
    ).from.toISOString(),
  ).toBe("2026-10-01T12:00:00.000Z");
});
