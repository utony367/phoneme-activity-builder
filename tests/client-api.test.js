import { afterEach, describe, expect, it, vi } from "vitest";

import {
  fetchActivityHtml,
  requestJson,
  safeActivityFilename,
} from "../lib/client-api.js";

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

  it("includes safe Zod field details in a validation error", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        Response.json(
          {
            error: "Invalid request data",
            details: { fieldErrors: { phonemes: ["Use valid IPA phoneme notation"] } },
          },
          { status: 400 },
        ),
      ),
    );

    await expect(requestJson("/api/activities/2/words", { method: "POST" })).rejects.toThrow(
      "Invalid request data: phonemes: Use valid IPA phoneme notation",
    );
  });

  it("creates a safe HTML filename from a saved activity title", () => {
    expect(
      safeActivityFilename('  My / vowels: "week 1"' + String.fromCharCode(0) + "  "),
    ).toBe(
      "my-vowels-week-1.html",
    );
  });

  it("returns generated HTML instead of treating a successful download as JSON", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response("<!doctype html><title>Saved activity</title>", {
          headers: { "Content-Type": "text/html; charset=utf-8" },
        }),
      ),
    );

    await expect(fetchActivityHtml(7)).resolves.toContain("Saved activity");
  });

  it("surfaces a generation error from the server", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        Response.json({ error: "At least one word is required" }, { status: 400 }),
      ),
    );

    await expect(fetchActivityHtml(7)).rejects.toThrow("At least one word is required");
  });
});
