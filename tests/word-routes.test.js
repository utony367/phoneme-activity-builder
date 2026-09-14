import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  activityFindUnique: vi.fn(),
  wordCreate: vi.fn(),
  wordUpdate: vi.fn(),
  wordDelete: vi.fn(),
}));

vi.mock("../lib/prisma.js", () => ({
  prisma: {
    activity: { findUnique: mocks.activityFindUnique },
    word: {
      create: mocks.wordCreate,
      update: mocks.wordUpdate,
      delete: mocks.wordDelete,
    },
  },
}));

import { POST } from "../app/api/activities/[id]/words/route.js";
import { DELETE, PUT } from "../app/api/words/[id]/route.js";

const activityParams = (id) => ({ params: Promise.resolve({ id }) });
const wordParams = (id) => ({ params: Promise.resolve({ id }) });

describe("Word routes", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it.each(["0", "abc", "9007199254740992"])(
    "rejects invalid Activity ID %s",
    async (id) => {
      const response = await POST(
        new Request("http://localhost/api/activities/" + id + "/words", {
          method: "POST",
          body: JSON.stringify({ text: "chair", phonemes: "/tʃ eə/" }),
        }),
        activityParams(id),
      );

      expect(response.status).toBe(400);
      await expect(response.json()).resolves.toEqual({ error: "Invalid activity ID" });
      expect(mocks.activityFindUnique).not.toHaveBeenCalled();
    },
  );

  it.each([
    ["PUT", (id) => PUT(new Request("http://localhost/api/words/" + id, { method: "PUT" }), wordParams(id))],
    ["DELETE", (id) => DELETE(new Request("http://localhost/api/words/" + id, { method: "DELETE" }), wordParams(id))],
  ])("rejects invalid Word ID for %s", async (_method, handler) => {
    const response = await handler("0");

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: "Invalid word ID" });
  });

  it("returns 404 when the parent Activity is absent", async () => {
    mocks.activityFindUnique.mockResolvedValue(null);

    const response = await POST(
      new Request("http://localhost/api/activities/2/words", {
        method: "POST",
        body: JSON.stringify({ text: "chair", phonemes: "/tʃ eə/" }),
      }),
      activityParams("2"),
    );

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({ error: "Activity not found" });
    expect(mocks.wordCreate).not.toHaveBeenCalled();
  });

  it("creates a normalized Word after confirming its parent Activity", async () => {
    mocks.activityFindUnique.mockResolvedValue({ id: 2 });
    mocks.wordCreate.mockResolvedValue({ id: 9, activityId: 2, text: "chair", phonemes: "/tʃ eə/", hint: null });

    const response = await POST(
      new Request("http://localhost/api/activities/2/words", {
        method: "POST",
        body: JSON.stringify({ text: " CHAIR ", phonemes: "/tʃ eə/", hint: " " }),
      }),
      activityParams("2"),
    );

    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toMatchObject({ id: 9, text: "chair", hint: null });
    expect(mocks.wordCreate).toHaveBeenCalledWith({
      data: { activityId: 2, text: "chair", phonemes: "/tʃ eə/", hint: null },
    });
  });

  it.each([
    ["POST", () => POST(
      new Request("http://localhost/api/activities/2/words", {
        method: "POST",
        body: JSON.stringify({ text: "chair", phonemes: "123" }),
      }),
      activityParams("2"),
    )],
    ["PUT", () => PUT(
      new Request("http://localhost/api/words/9", {
        method: "PUT",
        body: JSON.stringify({ text: "chair", phonemes: "/tʃ" }),
      }),
      wordParams("9"),
    )],
  ])("returns validation details for malformed phonemes on %s", async (_method, request) => {
    mocks.activityFindUnique.mockResolvedValue({ id: 2 });

    const response = await request();

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      error: "Invalid request data",
      details: { fieldErrors: { phonemes: [expect.any(String)] } },
    });
    expect(mocks.wordCreate).not.toHaveBeenCalled();
    expect(mocks.wordUpdate).not.toHaveBeenCalled();
  });

  it("maps duplicate and missing Word mutations to conflict and not-found responses", async () => {
    mocks.wordUpdate.mockRejectedValueOnce({ code: "P2002" });
    const duplicate = await PUT(
      new Request("http://localhost/api/words/9", {
        method: "PUT",
        body: JSON.stringify({ text: "chair", phonemes: "/tʃ eə/" }),
      }),
      wordParams("9"),
    );

    expect(duplicate.status).toBe(409);

    mocks.wordDelete.mockRejectedValueOnce({ code: "P2025" });
    const missing = await DELETE(
      new Request("http://localhost/api/words/9", { method: "DELETE" }),
      wordParams("9"),
    );

    expect(missing.status).toBe(404);
  });
});
