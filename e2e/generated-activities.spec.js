import { test, expect } from "@playwright/test";
async function fixture(request, type) {
  const response = await request.post("/api/activities", {
    data: {
      title: "Browser " + type,
      activityType: type,
      difficulty: "EASY",
      gridSize: 8,
      maxAttempts: 6,
    },
  });
  expect(response.status()).toBe(201);
  const a = await response.json();
  await request.post(`/api/activities/${a.id}/words`, {
    data: { text: "chair", phonemes: "/tʃ eə/", hint: "Furniture" },
  });
  return a;
}
for (const type of ["WORDLE", "WORD_SEARCH"])
  test(`${type} downloaded HTML has working gameplay`, async ({
    page,
    request,
  }) => {
    const a = await fixture(request, type);
    try {
      await page.goto(`/activities/${a.id}`);
      await page
        .getByRole("button", { name: "Preview HTML", exact: true })
        .click();
      const frame = page.frameLocator("iframe");
      await expect(frame.getByRole("heading", { name: a.title })).toBeVisible();
      const downloadPromise = page.waitForEvent("download");
      await page
        .getByRole("button", { name: "Download HTML", exact: true })
        .click();
      const download = await downloadPromise;
      expect(download.suggestedFilename()).toMatch(/\.html$/);
      if (type === "WORDLE") {
        for (const [i, l] of [..."chair"].entries())
          await frame
            .getByLabel(`Guess 1, letter ${i + 1}`, { exact: true })
            .fill(l);
        await frame.locator("#submit").click();
        await expect(frame.locator("#message")).toContainText("Correct!");
        await frame.getByRole("button", { name: "Reset", exact: true }).click();
        await expect(
          frame.getByLabel("Guess 1, letter 1", { exact: true }),
        ).toBeEnabled();
      } else {
        await frame
          .getByRole("button", {
            name: "Letter C, row 1, column 1",
            exact: true,
          })
          .click();
        await frame
          .getByRole("button", {
            name: "Letter R, row 1, column 5",
            exact: true,
          })
          .click();
        await expect(frame.locator("#message")).toContainText("Complete!");
        await frame.getByRole("button", { name: "Reset", exact: true }).click();
        await frame
          .getByRole("button", {
            name: "Letter C, row 1, column 1",
            exact: true,
          })
          .focus();
        await page.keyboard.press("Enter");
        await frame
          .getByRole("button", {
            name: "Letter R, row 1, column 5",
            exact: true,
          })
          .focus();
        await page.keyboard.press("Enter");
        await expect(frame.locator("#message")).toContainText("Complete!");
        await frame.getByRole("button", { name: "Reset", exact: true }).click();
        await frame
          .getByRole("button", {
            name: "Letter C, row 1, column 1",
            exact: true,
          })
          .scrollIntoViewIfNeeded();
        const first = await frame
          .getByRole("button", {
            name: "Letter C, row 1, column 1",
            exact: true,
          })
          .boundingBox();
        const last = await frame
          .getByRole("button", {
            name: "Letter R, row 1, column 5",
            exact: true,
          })
          .boundingBox();
        await page.mouse.move(
          first.x + first.width / 2,
          first.y + first.height / 2,
        );
        await page.mouse.down();
        await page.mouse.move(
          last.x + last.width / 2,
          last.y + last.height / 2,
          { steps: 8 },
        );
        await page.mouse.up();
        await expect(frame.locator("#message")).toContainText("Complete!");
      }
    } finally {
      await request.delete(`/api/activities/${a.id}`);
    }
  });
