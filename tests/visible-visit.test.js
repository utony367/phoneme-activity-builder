import { test, expect, vi } from "vitest";
import { createVisibleVisit } from "../lib/visible-visit.js";
test("effect setup cleanup setup reuses the route-entry identity and cumulative time", () => {
  let clock = 0;
  const send = vi.fn(),
    newKey = vi.fn(() => "stable-route-key");
  const visit = createVisibleVisit("/dashboard", {
    now: () => clock,
    isVisible: () => true,
    newKey,
    send,
  });
  visit.resume();
  clock = 5;
  visit.pause();
  clock = 8;
  visit.resume();
  clock = 100;
  visit.flush();
  expect(newKey).toHaveBeenCalledTimes(1);
  expect(send.mock.calls.map(([v]) => v.visitKey)).toEqual([
    "stable-route-key",
    "stable-route-key",
  ]);
  expect(send.mock.calls[1][0].visibleDurationMs).toBe(97);
});
