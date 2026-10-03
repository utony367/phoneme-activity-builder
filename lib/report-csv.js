function cell(value) {
  let s = String(value ?? "");
  if (/^[\s]*[=+\-@]/.test(s)) s = "'" + s;
  return '"' + s.replaceAll('"', '""') + '"';
}
export function reportToCsv(report) {
  const rows = [
    ["Report source", report.filter.source],
    ["Range (UTC)", report.filter.range],
    ["Generated at", report.generatedAt],
    ["Current activities", report.inventory.total],
    ["Created in period", report.operations.created],
    ["Successful generations", report.operations.successes],
    ["Failed generations", report.operations.failures],
    ["Success rate", report.operations.successRate ?? "No data"],
    [
      "Average visible milliseconds",
      report.visits.averageVisibleMs ?? "No data",
    ],
    [],
    ["Time (UTC)", "Activity", "Type", "Event", "Outcome", "Source", "Error"],
  ];
  for (const e of report.recentEvents)
    rows.push([
      e.occurredAt,
      e.title,
      e.type,
      e.event,
      e.outcome,
      e.source,
      e.error,
    ]);
  return "\uFEFF" + rows.map((row) => row.map(cell).join(",")).join("\r\n");
}
