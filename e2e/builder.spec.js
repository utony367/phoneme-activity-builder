import { test, expect } from "@playwright/test";
test("teacher CRUD preserves Unicode and unsaved settings through word mutations", async ({
  page,
  request,
}) => {
  const title = "Browser CRUD " + Date.now();
  await page.goto("/activities");
  await page.getByLabel("Activity title", { exact: true }).fill(title);
  await page
    .getByRole("button", { name: "Create activity", exact: true })
    .click();
  const card = page
    .getByRole("listitem")
    .filter({ has: page.getByRole("heading", { name: title, exact: true }) });
  await card.getByRole("link", { name: "Manage words" }).click();
  await page.waitForURL(/\/activities\/\d+$/);
  const id = page.url().split("/").pop();
  try {
    await page
      .getByLabel("Activity title", { exact: true })
      .fill(title + " edited");
    await page.getByLabel("Word", { exact: true }).fill("chair");
    await page.getByLabel("Phonemes", { exact: true }).fill("/tʃ eə/");
    await page.getByRole("button", { name: "Add word", exact: true }).click();
    await expect(
      page.getByLabel("Activity title", { exact: true }),
    ).toHaveValue(title + " edited");
    await expect(page.locator(".phoneme-value")).toHaveText("/tʃ eə/");
    await page
      .getByRole("button", { name: "Save settings", exact: true })
      .click();
    await page.reload();
    await expect(
      page.getByLabel("Activity title", { exact: true }),
    ).toHaveValue(title + " edited");
    await page
      .getByRole("button", { name: "Preview HTML", exact: true })
      .click();
    await expect(page.locator("iframe")).toBeVisible();
    await page.getByRole("button", { name: "Edit", exact: true }).click();
    await page.getByLabel("Phonemes", { exact: true }).fill("/tʃ ɛə/");
    await page.getByRole("button", { name: "Save word", exact: true }).click();
    await expect(page.locator("iframe")).toHaveCount(0);
    await expect(page.locator(".phoneme-value")).toHaveText("/tʃ ɛə/");
    page.on("dialog", (d) => d.accept());
    await page
      .locator(".word-row")
      .getByRole("button", { name: "Delete", exact: true })
      .click();
    await expect(page.locator(".word-row")).toHaveCount(0);
  } finally {
    await request.delete(`/api/activities/${id}`);
  }
});
