import { describe, expect, it } from "vitest";
import { DELETE, GET, PUT } from "../app/api/activities/[id]/route.js";
import { ApiError, apiError, readJson } from "../lib/api.js";
import { activitySchema } from "../lib/validation.js";

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

describe("apiError", () => {
  it.each([
    [new ApiError("Invalid activity ID", 400), 400, "Invalid activity ID"],
    [{ code: "P2002" }, 409, "A duplicate record already exists"],
    [{ code: "P2025" }, 404, "Record not found"],
    [new Error("unexpected"), 500, "Internal server error"],
  ])("maps errors to safe HTTP responses", async (error, status, message) => {
    const response = apiError(error);

    expect(response.status).toBe(status);
    await expect(response.json()).resolves.toEqual({ error: message });
  });
});

describe("activity item route IDs", () => {
  const invalidIds = ["0", "abc", "9007199254740992"];
  const handlers = [
    ["GET", (id) => GET(new Request("http://localhost/api/activities/" + id), { params: Promise.resolve({ id }) })],
    ["PUT", (id) => PUT(new Request("http://localhost/api/activities/" + id, { method: "PUT" }), { params: Promise.resolve({ id }) })],
    ["DELETE", (id) => DELETE(new Request("http://localhost/api/activities/" + id, { method: "DELETE" }), { params: Promise.resolve({ id }) })],
  ];

  it.each(handlers.flatMap(([method, handler]) => invalidIds.map((id) => [method, id, handler])))(
    "%s rejects invalid ID %s with a 400 response",
    async (_method, _id, handler) => {
      const response = await handler(_id);

      expect(response.status).toBe(400);
      await expect(response.json()).resolves.toEqual({ error: "Invalid activity ID" });
    },
  );
});
