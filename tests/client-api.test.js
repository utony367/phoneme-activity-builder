import { afterEach, describe, expect, it, vi } from "vitest";

import { requestJson, safeActivityFilename } from "../lib/client-api.js";

describe("client API helpers", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("surfaces a server JSON error message for an unsuccessful request", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        Response.json({ error: "A duplicate record already exists" }, { status: 409 }),
      ),
    );

    await expect(requestJson("/api/activities", { method: "POST" })).rejects.toThrow(
      "A duplicate record already exists",
    );
  });

  it("creates a safe HTML filename from a saved activity title", () => {
    expect(safeActivityFilename('  My / vowels: "week 1"\u0000  ')).toBe(
      "my-vowels-week-1.html",
    );
  });
});
