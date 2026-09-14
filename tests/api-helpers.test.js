import { describe, expect, it } from "vitest";
import { activitySchema } from "../lib/validation.js";
import { readJson } from "../lib/api.js";

describe("readJson", () => {
  it("returns normalized validated JSON", async () => {
    const request = new Request("http://localhost/api/activities", {
      method: "POST",
      body: JSON.stringify({
        title: "  Short vowels  ",
        activityType: "WORDLE",
        difficulty: "EASY",
        gridSize: 10,
        maxAttempts: 6,
      }),
    });

    await expect(readJson(request, activitySchema)).resolves.toMatchObject({
      title: "Short vowels",
      activityType: "WORDLE",
    });
  });

  it.each([
    new Request("http://localhost/api/activities", { method: "POST", body: "{" }),
    new Request("http://localhost/api/activities", {
      method: "POST",
      body: JSON.stringify({ title: "", activityType: "WORDLE", difficulty: "EASY" }),
    }),
  ])("throws a typed 400 error for malformed or invalid JSON", async (request) => {
    await expect(readJson(request, activitySchema)).rejects.toMatchObject({ status: 400 });
  });
});
