import { mkdirSync } from "node:fs";
import { test, expect } from "@playwright/test";
test("reports generation outcomes, readiness, visits and historical deletion", async ({
  page,
  request,
}) => {
  const data = {
    title: "Dashboard evidence " + Date.now(),
    activityType: "WORD_SEARCH",
    difficulty: "EASY",
    gridSize: 8,
    maxAttempts: 6,
  };
  const a = await (await request.post("/api/activities", { data })).json();
  expect((await request.get(`/api/activities/${a.id}/generate`)).status()).toBe(
    400,
  );
  await request.post(`/api/activities/${a.id}/words`, {
    data: { text: "fish", phonemes: "/f ɪ ʃ/" },
  });
  expect((await request.get(`/api/activities/${a.id}/generate`)).status()).toBe(
    200,
  );
  await request.delete(`/api/activities/${a.id}`);
  const r = await (
    await request.get("/api/reports?range=all&source=live")
  ).json();
  expect(r.recentEvents.filter((e) => e.title === data.title)).toHaveLength(3);
  expect(r.operations.failures).toBeGreaterThan(0);
  for (const visibleDurationMs of [900, 200])
    expect(
      (
        await request.post("/api/visits", {
          data: {
            visitKey: "browser-replay-fixed",
            path: "/dashboard",
            visibleDurationMs,
          },
        })
      ).status(),
    ).toBe(200);
  expect(
    (
      await request.post("/api/visits", {
        data: {
          visitKey: "malformed-record",
          path: "/private",
          visibleDurationMs: -1,
        },
      })
    ).status(),
  ).toBe(400);
  await page.goto("/dashboard");
  await expect(
    page.getByRole("heading", { name: "Activity dashboard", exact: true }),
  ).toBeVisible();
  await expect(page.getByText("Database readiness:")).toContainText("Ready");
  await page.getByLabel("Data source").selectOption("simulated");
  await expect(page.getByText("This view includes simulated")).toBeVisible();
  await page.getByLabel("Data source").selectOption("live");
  await expect(page.getByText("This view includes simulated")).toHaveCount(0);
  mkdirSync("evidence/screenshots", { recursive: true });
  await page.screenshot({
    path: "evidence/screenshots/dashboard.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({
    path: "evidence/screenshots/dashboard-mobile.png",
    fullPage: true,
  });
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("link", { name: "Export CSV" }).click();
  expect((await downloadPromise).suggestedFilename()).toBe(
    "activity-report.csv",
  );
});

test("database readiness failure is visibly unavailable", async ({ page }) => {
  await page.route("**/api/status", (route) =>
    route.fulfill({
      status: 503,
      contentType: "application/json",
      body: JSON.stringify({ status: "unavailable" }),
    }),
  );
  await page.goto("/dashboard");
  await expect(page.getByText("Database readiness:")).toContainText(
    "Unavailable",
  );
});
