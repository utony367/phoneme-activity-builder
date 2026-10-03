export async function loadDashboardState(fetchJson, filters) {
  const [report, live, ready] = await Promise.allSettled([
    fetchJson("/api/reports?" + filters),
    fetchJson("/health"),
    fetchJson("/api/status"),
  ]);
  return {
    report: report.status === "fulfilled" ? report.value : null,
    error: report.status === "rejected" ? report.reason.message : "",
    health: {
      live: live.status === "fulfilled" && live.value.status === "ok",
      ready: ready.status === "fulfilled" && ready.value.status === "ready",
      checkedAt: new Date().toISOString(),
    },
  };
}
