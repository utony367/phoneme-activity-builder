import { test, expect } from "vitest";
import { loadDashboardState } from "../lib/dashboard-loading.js";
test("real shared database outage preserves liveness and failed readiness independently of reports", async () => {
  const state = await loadDashboardState(async (url) => {
    if (url === "/health") return { status: "ok" };
    throw new Error("database unavailable");
  }, new URLSearchParams());
  expect(state.report).toBeNull();
  expect(state.error).toBe("database unavailable");
  expect(state.health).toMatchObject({
    live: true,
    ready: false,
    checkedAt: expect.any(String),
  });
});
