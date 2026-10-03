import { ApiError } from "./api.js";
export function parseReportFilters(params, now = new Date()) {
  const range = params.get("range") || "7d",
    source = params.get("source") || "live";
  if (
    !["24h", "7d", "30d", "all"].includes(range) ||
    !["live", "simulated", "all"].includes(source)
  )
    throw new ApiError("Invalid report filters", 400);
  const days = { "24h": 1, "7d": 7, "30d": 30 };
  return {
    range,
    source,
    from:
      range === "all" ? null : new Date(now.getTime() - days[range] * 86400000),
    to: now,
  };
}
export async function getReport(db, filter, now = new Date()) {
  const source =
    filter.source === "all" ? {} : { source: filter.source.toUpperCase() };
  const where = {
    ...source,
    occurredAt: {
      ...(filter.from ? { gte: filter.from } : {}),
      lte: filter.to,
    },
  };
  const [activities, events, visits] = await Promise.all([
    db.activity.findMany({
      where: source,
      include: { words: true },
      orderBy: { updatedAt: "desc" },
    }),
    db.operationEvent.findMany({ where, orderBy: { occurredAt: "desc" } }),
    db.pageVisit.findMany({ where }),
  ]);
  const generations = events.filter((e) => e.eventType === "GENERATION");
  const successes = generations.filter((e) => e.outcome === "SUCCESS").length;
  const failures = generations.length - successes;
  const byType = ["WORDLE", "WORD_SEARCH"].map((type) => ({
    type,
    attempts: generations.filter((e) => e.activityType === type).length,
    successes: generations.filter(
      (e) => e.activityType === type && e.outcome === "SUCCESS",
    ).length,
  }));
  const max = Math.max(...byType.map((t) => t.attempts));
  const buckets = new Map();
  const start =
    filter.from ||
    events.reduce(
      (min, e) => (new Date(e.occurredAt) < min ? new Date(e.occurredAt) : min),
      now,
    );
  // Keep all-time trends bounded to the most recent 90 UTC days; totals remain all-time.
  const first = new Date(
    Math.max(start.getTime(), now.getTime() - 89 * 86400000),
  );
  first.setUTCHours(0, 0, 0, 0);
  for (let d = first; d <= now; d = new Date(d.getTime() + 86400000))
    buckets.set(d.toISOString().slice(0, 10), {
      date: d.toISOString().slice(0, 10),
      created: 0,
      successes: 0,
      failures: 0,
    });
  for (const e of events) {
    const b = buckets.get(new Date(e.occurredAt).toISOString().slice(0, 10));
    if (b) {
      if (e.eventType === "ACTIVITY_CREATED") b.created++;
      else b[e.outcome === "SUCCESS" ? "successes" : "failures"]++;
    }
  }
  const empty = activities.filter((a) => a.words.length === 0);
  const alerts = [];
  if (empty.length)
    alerts.push({
      kind: "warning",
      message: `${empty.length} saved activities have no words.`,
      activityIds: empty.map((a) => a.id),
    });
  if (failures)
    alerts.push({
      kind: "warning",
      message: `${failures} generation attempts failed in this period.`,
      activityIds: [],
    });
  return {
    generatedAt: now.toISOString(),
    filter: {
      range: filter.range,
      source: filter.source,
      from: filter.from?.toISOString() || null,
      to: filter.to.toISOString(),
    },
    inventory: {
      total: activities.length,
      byType: ["WORDLE", "WORD_SEARCH"].map((type) => ({
        type,
        activities: activities.filter((a) => a.activityType === type).length,
        words: activities
          .filter((a) => a.activityType === type)
          .reduce((count, a) => count + a.words.length, 0),
      })),
      words: activities.reduce((n, a) => n + a.words.length, 0),
      activities: activities.map((a) => ({
        id: a.id,
        title: a.title,
        type: a.activityType,
        difficulty: a.difficulty,
        source: a.source,
        wordCount: a.words.length,
      })),
    },
    operations: {
      created: events.filter((e) => e.eventType === "ACTIVITY_CREATED").length,
      attempts: generations.length,
      successes,
      failures,
      successRate: generations.length ? successes / generations.length : null,
      byType,
    },
    visits: {
      count: visits.length,
      averageVisibleMs: visits.length
        ? visits.reduce((n, v) => n + v.visibleDurationMs, 0) / visits.length
        : null,
    },
    mostUsedType: {
      types: max
        ? byType.filter((t) => t.attempts === max).map((t) => t.type)
        : [],
      attempts: max,
    },
    trends: Array.from(buckets.values()),
    recentEvents: events.slice(0, 20).map((e) => ({
      id: e.id,
      title: e.activityTitle,
      type: e.activityType,
      event: e.eventType,
      outcome: e.outcome,
      source: e.source,
      error: e.errorMessage || null,
      occurredAt: new Date(e.occurredAt).toISOString(),
    })),
    alerts,
  };
}
