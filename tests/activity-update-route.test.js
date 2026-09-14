import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  update: vi.fn(),
}));

vi.mock("../lib/prisma.js", () => ({
  prisma: { activity: { update: mocks.update } },
}));

import { PUT } from "../app/api/activities/[id]/route.js";

describe("activity update route", () => {
  beforeEach(() => mocks.update.mockReset());

  it("persists a cleared teacher hint as null", async () => {
    mocks.update.mockImplementation(async ({ where, data }) => ({ id: where.id, ...data }));

    const response = await PUT(
      new Request("http://localhost/api/activities/4", {
        method: "PUT",
        body: JSON.stringify({
          title: "Short vowels",
          activityType: "WORDLE",
          difficulty: "EASY",
          hint: " ",
          gridSize: 12,
          maxAttempts: 6,
        }),
      }),
      { params: Promise.resolve({ id: "4" }) },
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({ id: 4, hint: null });
  });
});
