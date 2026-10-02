import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  findUnique: vi.fn(),
  create: vi.fn(),
}));

vi.mock("../lib/prisma.js", () => ({
  prisma: { activity: { findUnique: mocks.findUnique }, operationEvent: {create:mocks.create} },
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
  it("returns 503 when generation telemetry cannot be persisted", async () => {
    mocks.findUnique.mockResolvedValue(activity);
    mocks.create.mockRejectedValue(new Error("database unavailable"));
    expect((await GET(new Request("http://localhost"),{params:Promise.resolve({id:"1"})})).status).toBe(503);
  });
  beforeEach(() => { mocks.findUnique.mockReset(); mocks.create.mockReset(); mocks.create.mockResolvedValue({id:1}); });

  it("returns a safe HTML attachment for a stored activity", async () => {
    mocks.findUnique.mockResolvedValue(activity);

    const response = await GET(new Request("http://localhost/api/activities/1/generate"), {
      params: Promise.resolve({ id: "1" }),
    });

    expect(response.status).toBe(200);
    expect(mocks.create).toHaveBeenCalledWith({data:expect.objectContaining({outcome:"SUCCESS",activityType:"WORDLE"})});
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
    expect(mocks.create).not.toHaveBeenCalled();
  });

  it("returns 400 when stored activity data cannot generate a file", async () => {
    mocks.findUnique.mockResolvedValue({ ...activity, words: [] });

    const response = await GET(new Request("http://localhost/api/activities/1/generate"), {
      params: Promise.resolve({ id: "1" }),
    });

    expect(response.status).toBe(400);
    expect(mocks.create).toHaveBeenCalledWith({data:expect.objectContaining({outcome:"FAILURE",errorCategory:"INVALID_ACTIVITY"})});
    await expect(response.json()).resolves.toMatchObject({
      error: expect.stringContaining("At least one word is required"),
    });
  });
});
