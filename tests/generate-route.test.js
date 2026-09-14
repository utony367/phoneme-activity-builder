import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  findUnique: vi.fn(),
}));

vi.mock("../lib/prisma.js", () => ({
  prisma: { activity: { findUnique: mocks.findUnique } },
}));

import { GET, POST } from "../app/api/activities/[id]/generate/route.js";

const activity = {
  id: 1,
  title: "My saved activity",
  activityType: "WORDLE",
  difficulty: "EASY",
  hint: "Classroom practice",
  gridSize: 10,
  maxAttempts: 5,
  words: [{ text: "apple", phonemes: "/æ p əl/", hint: "Fruit" }],
};

describe("saved activity download route", () => {
  beforeEach(() => mocks.findUnique.mockReset());

  it("returns a safe HTML attachment for a stored activity", async () => {
    mocks.findUnique.mockResolvedValue(activity);

    const response = await GET(new Request("http://localhost/api/activities/1/generate"), {
      params: Promise.resolve({ id: "1" }),
    });

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("text/html");
    expect(response.headers.get("content-disposition")).toContain('filename="my-saved-activity.html"');
    await expect(response.text()).resolves.toContain("apple");
  });

  it("rejects invalid and missing activities clearly", async () => {
    const invalid = await POST(new Request("http://localhost/api/activities/no/generate", { method: "POST" }), {
      params: Promise.resolve({ id: "no" }),
    });
    expect(invalid.status).toBe(400);

    mocks.findUnique.mockResolvedValue(null);
    const missing = await GET(new Request("http://localhost/api/activities/2/generate"), {
      params: Promise.resolve({ id: "2" }),
    });
    expect(missing.status).toBe(404);
  });

  it("returns 400 when stored activity data cannot generate a file", async () => {
    mocks.findUnique.mockResolvedValue({ ...activity, words: [] });

    const response = await GET(new Request("http://localhost/api/activities/1/generate"), {
      params: Promise.resolve({ id: "1" }),
    });

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      error: expect.stringContaining("At least one word is required"),
    });
  });
});
