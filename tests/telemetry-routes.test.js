import { beforeEach, expect, test, vi } from "vitest";
const mocks = vi.hoisted(() => ({
  query: vi.fn(),
  execute: vi.fn(),
  find: vi.fn(),
  transaction: vi.fn(),
}));
vi.mock("../lib/prisma.js", () => ({
  prisma: {
    $queryRaw: mocks.query,
    $executeRaw: mocks.execute,
    pageVisit: { findUnique: mocks.find },
    $transaction: mocks.transaction,
  },
}));
import { GET as status } from "../app/api/status/route.js";
import { POST as visit } from "../app/api/visits/route.js";
import { POST as create } from "../app/api/activities/route.js";
beforeEach(() => vi.resetAllMocks());
test("readiness separates database failure from liveness", async () => {
  mocks.query.mockResolvedValue([1]);
  expect((await status()).status).toBe(200);
  mocks.query.mockRejectedValue(new Error("offline"));
  expect((await status()).status).toBe(503);
});
test("visit rejects malformed JSON with 400 before writing", async () => {
  expect(
    (
      await visit(
        new Request("http://localhost", { method: "POST", body: "{" }),
      )
    ).status,
  ).toBe(400);
  expect(mocks.execute).not.toHaveBeenCalled();
});
test("activity response is withheld when transactional telemetry fails", async () => {
  const activity = {
    id: 1,
    title: "Test",
    activityType: "WORDLE",
    source: "LIVE",
  };
  const tx = {
    activity: { create: vi.fn().mockResolvedValue(activity) },
    operationEvent: {
      create: vi.fn().mockRejectedValue(new Error("telemetry unavailable")),
    },
  };
  mocks.transaction.mockImplementation((callback) => callback(tx));
  const r = await create(
    new Request("http://localhost", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "Test",
        activityType: "WORDLE",
        difficulty: "EASY",
      }),
    }),
  );
  expect(r.status).toBe(500);
  expect(tx.operationEvent.create).toHaveBeenCalled();
});
