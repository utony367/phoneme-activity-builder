import { describe, expect, it } from "vitest";
import { GET } from "../app/health/route.js";

describe("health route", () => {
  it("returns an OK health response", async () => {
    const response = await GET();

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ status: "ok" });
  });
});
